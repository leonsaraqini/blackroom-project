const PUBLIC_ORIGIN = "https://blackroomprod.com";
const RAILWAY_ORIGIN = "https://veo-workflow-production.up.railway.app";
const PREFIX = "/meta";

export type MetaBindings = { META_PROXY_SECRET?: string };

export function isMetaPath(pathname: string): boolean {
	return pathname === PREFIX || pathname.startsWith(`${PREFIX}/`);
}

function privateHeaders(headers = new Headers()): Headers {
	headers.set("Cache-Control", "private, no-store, max-age=0");
	headers.set("CDN-Cache-Control", "no-store");
	headers.set("Cloudflare-CDN-Cache-Control", "no-store");
	headers.set("Pragma", "no-cache");
	headers.set("Expires", "0");
	return headers;
}

function failure(message: string, status: number): Response {
	return new Response(message, { status, headers: privateHeaders() });
}

function publicLocation(location: string, upstreamUrl: URL): string {
	const target = new URL(location, upstreamUrl);
	if (target.origin !== RAILWAY_ORIGIN && target.origin !== PUBLIC_ORIGIN) {
		return location; // External OAuth/identity-provider redirects stay external.
	}
	target.protocol = "https:";
	target.host = new URL(PUBLIC_ORIGIN).host;
	if (!isMetaPath(target.pathname)) target.pathname = PREFIX + target.pathname;
	return target.href;
}

function scopedCookie(cookie: string): string {
	const [pair, ...attributes] = cookie.split(";");
	// __Host- cookies require Path=/ and cannot be scoped to this application.
	if (pair.trim().startsWith("__Host-")) {
		throw new Error("Railway must use a path-scoped cookie name");
	}
	let path = PREFIX;
	const kept = attributes.filter((attribute) => {
		const [name, ...value] = attribute.trim().split("=");
		if (name.toLowerCase() === "domain") return false;
		if (name.toLowerCase() === "path") {
			const original = value.join("=");
			path = isMetaPath(original)
				? original
				: PREFIX + (original.startsWith("/") && original !== "/" ? original : "");
			return false;
		}
		return name.toLowerCase() !== "secure";
	});
	return [pair, ...kept, ` Path=${path}`, " Secure"].join(";");
}

export async function forwardMeta(request: Request, env: MetaBindings): Promise<Response> {
	const incoming = new URL(request.url);
	if (!isMetaPath(incoming.pathname)) return failure("Not found", 404);
	if (incoming.origin !== PUBLIC_ORIGIN) return failure("Unsupported app host", 421);
	if (!env.META_PROXY_SECRET) return failure("Meta proxy is not configured", 503);

	const origin = request.headers.get("Origin");
	const websocket = request.headers.get("Upgrade")?.toLowerCase() === "websocket";
	// Never translate an arbitrary Origin into a trusted one. Browser WebSockets
	// require an Origin; other origin-less clients still need upstream auth/CSRF.
	if ((origin !== null && origin !== PUBLIC_ORIGIN) || (websocket && !origin)) {
		return failure("Origin not allowed", 403);
	}

	const upstreamUrl = new URL(RAILWAY_ORIGIN);
	upstreamUrl.pathname = incoming.pathname.slice(PREFIX.length) || "/";
	upstreamUrl.search = incoming.search;
	const headers = new Headers(request.headers);
	for (const name of [...headers.keys()]) {
		if (name === "forwarded" || name.startsWith("x-forwarded-") ||
			name.startsWith("x-meta-") || name.startsWith("x-original-")) {
			headers.delete(name);
		}
	}
	headers.delete("Host"); // Fetch uses Railway's host for routing and TLS.
	headers.set("X-Forwarded-Host", "blackroomprod.com");
	headers.set("X-Forwarded-Proto", "https");
	headers.set("X-Forwarded-Prefix", PREFIX);
	headers.set("X-Meta-Proxy-Secret", env.META_PROXY_SECRET);

	try {
		const upstreamRequest = new Request(upstreamUrl, request);
		const response = await fetch(new Request(upstreamRequest, {
			headers,
			redirect: "manual",
		}), { cache: "no-store" });
		const responseHeaders = privateHeaders(new Headers(response.headers));
		const location = responseHeaders.get("Location");
		if (location) responseHeaders.set("Location", publicLocation(location, upstreamUrl));
		responseHeaders.delete("Set-Cookie");
		for (const cookie of response.headers.getSetCookie()) {
			responseHeaders.append("Set-Cookie", scopedCookie(cookie));
		}
		return new Response(response.body, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
			webSocket: response.webSocket,
		});
	} catch {
		// Do not log request headers, session cookies, or the proxy secret.
		return failure("Railway app unavailable or incompatible with /meta", 502);
	}
}
