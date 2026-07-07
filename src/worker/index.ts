import { Hono, type Context } from "hono";
import { Freemius } from "@freemius/sdk";

type Bindings = Env & {
	ADMIN_WORKER: Fetcher;
	FREEMIUS_PRODUCT_ID: string;
	FREEMIUS_API_KEY: string;
	FREEMIUS_SECRET_KEY: string;
	FREEMIUS_PUBLIC_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Release configuration: update these four fields when publishing a new build.
const kairosExpressRelease = {
	latestVersion: "1.0.2",
	downloadUrl:
		"https://downloads.blackroomprod.com/kairos-express/1.0.2/KairosExpress-Windows.exe",
	changelog: [
		"Kairos Express version 1.0.2 is now available.",
		"Bug fixes and improvements.",
	],
	releaseDate: "2026-07-07",
};

const noCacheHeaders = {
	"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
	Pragma: "no-cache",
	Expires: "0",
	"Access-Control-Allow-Origin": "*",
};

app.get("/kairos-express/latest-version", (c) =>
	c.json(
		{
			product: "kairos-express",
			latestVersion: kairosExpressRelease.latestVersion,
			platforms: {
				windows: {
					downloadUrl: kairosExpressRelease.downloadUrl,
					fileName: "KairosExpress-Windows.exe",
				},
			},
			changelog: kairosExpressRelease.changelog,
			releaseDate: kairosExpressRelease.releaseDate,
			forceUpdate: false,
		},
		200,
		noCacheHeaders,
	),
);

app.get("/api/freemius/sandbox", async (c) => {
	const required = [
		"FREEMIUS_PRODUCT_ID",
		"FREEMIUS_API_KEY",
		"FREEMIUS_SECRET_KEY",
		"FREEMIUS_PUBLIC_KEY",
	] as const;
	const missing = required.filter((key) => !c.env[key]);

	if (missing.length > 0) {
		return c.json(
			{ error: `Missing Freemius configuration: ${missing.join(", ")}` },
			500,
		);
	}

	try {
		const freemius = new Freemius({
			productId: c.env.FREEMIUS_PRODUCT_ID,
			apiKey: c.env.FREEMIUS_API_KEY,
			secretKey: c.env.FREEMIUS_SECRET_KEY,
			publicKey: c.env.FREEMIUS_PUBLIC_KEY,
		});
		const sandboxParams = await freemius.checkout.getSandboxParams();

		return c.json(sandboxParams, 200, {
			"Cache-Control": "no-store",
		});
	} catch (error) {
		console.error("Freemius sandbox request failed", error);
		return c.json({ error: "Unable to create Freemius sandbox options" }, 502);
	}
});

const forwardAdmin = (c: Context<{ Bindings: Bindings }>) => {
	const upstreamUrl = new URL(c.req.url);
	upstreamUrl.pathname =
		upstreamUrl.pathname.replace(/^\/admin(?=\/|$)/, "") || "/";

	return c.env.ADMIN_WORKER.fetch(new Request(upstreamUrl, c.req.raw));
};

app.all("/admin", forwardAdmin);
app.all("/admin/*", forwardAdmin);

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
