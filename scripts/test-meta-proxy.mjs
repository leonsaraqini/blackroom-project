import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { build } from "esbuild";
import { Miniflare } from "miniflare";

const config = JSON.parse(await readFile(new URL("../wrangler.json", import.meta.url)));
const bundle = await build({
  stdin: {
    contents: `import app from './src/worker/index.ts';
      export default { fetch(request, env, ctx) {
        globalThis.fetch = (req, init) => {
          if (init?.cache !== 'no-store' || req.redirect !== 'manual') {
            throw new Error('Unsafe upstream fetch options');
          }
          return env.MOCK.fetch(req);
        };
        return app.fetch(request, env, ctx);
      } };`,
    resolveDir: process.cwd(),
  },
  bundle: true, format: "esm", platform: "browser", write: false,
  alias: {crypto:"node:crypto"}, external: ["node:*"],
});

const mock = `export default { async fetch(request) {
  const url = new URL(request.url);
  // Validate the contract for every HTTP method and WebSocket upgrade before
  // the mock health/auth/routes can return a successful response.
  if (url.origin !== 'https://veo-workflow-production.up.railway.app' ||
      request.headers.get('X-Forwarded-Host') !== 'blackroomprod.com' ||
      request.headers.get('X-Forwarded-Proto') !== 'https' ||
      request.headers.get('X-Forwarded-Prefix') !== '/meta' ||
      request.headers.get('X-Meta-Proxy-Secret') !== 'test-secret' ||
      (request.headers.has('Host') && request.headers.get('Host') !== url.host)) {
    return new Response('Proxy contract failed', {status:400});
  }
  if (url.pathname === '/unavailable') throw new Error('Mock unavailable');
  if (url.pathname === '/redirect') {
    return new Response(null, {status: Number(url.searchParams.get('status') || 302),
      headers: {Location: url.searchParams.get('to')}});
  }
  if (url.pathname === '/cookies') {
    const headers = new Headers();
    headers.append('Set-Cookie', 'meta_session=abc; Domain=.up.railway.app; Path=/; HttpOnly; SameSite=Lax');
    headers.append('Set-Cookie', 'remote=xyz; Path=/remote-browser; Expires=Wed, 21 Oct 2026 07:28:00 GMT; HttpOnly');
    headers.append('Set-Cookie', 'deleted=; Path=/meta; Max-Age=0; Secure');
    return new Response('cookies', {headers});
  }
  if (url.pathname === '/host-cookie') return new Response('', {headers: {'Set-Cookie':'__Host-session=x; Path=/; Secure'}});
  if (url.pathname === '/unauthorized') return new Response('Login required', {status:401, headers:{'WWW-Authenticate':'Basic realm="VEO Workflow"'}});
  if (request.headers.get('Upgrade') === 'websocket') {
    const [client, server] = Object.values(new WebSocketPair());
    server.accept();
    server.addEventListener('message', event => server.send(event.data));
    return new Response(null, {status:101, webSocket:client,
      headers:{'Set-Cookie':'meta_ws=x; Path=/; HttpOnly'}});
  }
  return Response.json({url:request.url,method:request.method,
    headers:Object.fromEntries(request.headers),body:await request.text()});
} };`;

function runtime(secret = "test-secret") {
  return new Miniflare({ workers: [
    {name:"main", modules:true, script:bundle.outputFiles[0].text,
      compatibilityDate:config.compatibility_date, compatibilityFlags:config.compatibility_flags,
      bindings: secret ? {META_PROXY_SECRET:secret} : {},
      serviceBindings:{MOCK:"mock",ADMIN_WORKER:"admin"},
      assets:{directory:config.assets.directory,
        routerConfig:{has_user_worker:true,static_routing:{user_worker:config.assets.run_worker_first}},
        assetConfig:{not_found_handling:config.assets.not_found_handling}}},
    {name:"mock", modules:true, script:mock,compatibilityDate:config.compatibility_date},
    {name:"admin", modules:true, script:`export default {fetch(r){return Response.json({adminPath:new URL(r.url).pathname})}}`,compatibilityDate:config.compatibility_date},
  ] });
}

await test("/meta proxy in the Workers runtime with real asset routing", async (t) => {
  const mf = runtime();
  t.after(() => mf.dispose());
  const request = (path, init) => mf.dispatchFetch(`https://blackroomprod.com${path}`, init);

  await t.test("exact matching, prefix stripping, methods, binary bodies, queries, auth", async () => {
    for (const path of ["/meta", "/meta/", "/meta/api/jobs?a=1&a=2&encoded=%2F", "/meta//api/jobs"]) {
      const response = await request(path, {method:"POST", body:"binary\u0000body", headers:{
        Origin:"https://blackroomprod.com", Authorization:"Basic dGVzdDp0ZXN0", Cookie:"meta_session=abc",
        Forwarded:'host=evil.com;proto=http', "X-Forwarded-Host":"evil.com",
        "X-Forwarded-Proto":"http", "X-Forwarded-Prefix":"/evil", "X-Meta-Proxy-Secret":"attacker",
        "X-Original-URL":"/admin", "X-Forwarded-For":"1.2.3.4",
      }});
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("Cache-Control"), "private, no-store, max-age=0");
      const data = await response.json();
      assert.equal(data.url, "https://veo-workflow-production.up.railway.app" + (path.slice(5) || "/"));
      assert.equal(data.method, "POST");
      assert.equal(data.body, "binary\u0000body");
      assert.equal(data.headers.authorization, "Basic dGVzdDp0ZXN0");
      assert.equal(data.headers.cookie, "meta_session=abc");
      assert.equal(data.headers.origin, "https://blackroomprod.com");
      assert.equal(data.headers["x-forwarded-host"], "blackroomprod.com");
      assert.equal(data.headers["x-forwarded-proto"], "https");
      assert.equal(data.headers["x-forwarded-prefix"], "/meta");
      assert.equal(data.headers["x-meta-proxy-secret"], "test-secret");
      assert.equal(data.headers.forwarded, undefined);
      assert.equal(data.headers["x-original-url"], undefined);
      assert.equal(data.headers["x-forwarded-for"], undefined);
    }
    for (const method of ["GET", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      const response = await request("/meta/api/jobs", {method});
      assert.equal(response.status, 200);
      if (method !== "HEAD") assert.equal((await response.json()).method, method);
    }
  });

  await t.test("other site paths, API and admin keep their behavior", async () => {
    for (const path of ["/", "/portfolio", "/metaphor", "/meta-other", "/META", "/logout", "/remote-browser/"]) {
      const response = await request(path, {headers:{"Sec-Fetch-Mode":"navigate"}});
      assert.equal(response.status, 200, path);
      assert.match(await response.text(), /<html/i);
    }
    assert.deepEqual(await (await request("/api/")).json(), {name:"Cloudflare"});
    assert.equal((await (await request("/kairos-express/latest-version")).json()).product, "kairos-express");
    assert.deepEqual(await (await request("/admin/tools")).json(), {adminPath:"/tools"});
    assert.equal((await request("/api/unknown")).status, 404);
    assert.equal((await request("/api/jobs", {headers:{"Sec-Fetch-Mode":"navigate"}})).status, 404);
  });

  await t.test("manual redirects stay under /meta without changing external auth URLs", async () => {
    const cases = [
      ["/logout?next=%2F#done", "https://blackroomprod.com/meta/logout?next=%2F#done"],
      ["login", "https://blackroomprod.com/meta/login"],
      ["https://veo-workflow-production.up.railway.app/api/callback?x=1", "https://blackroomprod.com/meta/api/callback?x=1"],
      ["/meta/logout", "https://blackroomprod.com/meta/logout"],
      ["https://blackroomprod.com/logout", "https://blackroomprod.com/meta/logout"],
      ["https://accounts.example.com/oauth", "https://accounts.example.com/oauth"],
    ];
    for (const status of [301,302,303,307,308]) {
      for (const [target, expected] of cases) {
        const response = await request(`/meta/redirect?status=${status}&to=${encodeURIComponent(target)}`, {redirect:"manual"});
        assert.equal(response.status, status);
        assert.equal(response.headers.get("Location"), expected);
      }
    }
  });

  await t.test("cookies remain separate, host-only, secure, and path scoped", async () => {
    const response = await request("/meta/cookies");
    const cookies = response.headers.getSetCookie();
    assert.equal(cookies.length, 3);
    assert.match(cookies[0], /Path=\/meta; Secure$/);
    assert.match(cookies[0], /HttpOnly; SameSite=Lax/);
    assert.doesNotMatch(cookies.join("\n"), /Domain=/i);
    assert.match(cookies[1], /Path=\/meta\/remote-browser/);
    assert.match(cookies[1], /Expires=Wed, 21 Oct/);
    assert.match(cookies[2], /Max-Age=0/);
    assert.equal((await request("/meta/host-cookie")).status, 502);
  });

  await t.test("Origin rejection, canonical host restriction, failure and auth responses", async () => {
    for (const origin of ["null", "https://evil.com", "https://blackroomprod.com.evil.com", "https://veo-workflow-production.up.railway.app"]) {
      assert.equal((await request("/meta/api/jobs", {method:"POST", headers:{Origin:origin}})).status, 403);
    }
    assert.equal((await mf.dispatchFetch("https://example.com/meta")).status, 421);
    const unauthorized = await request("/meta/unauthorized");
    assert.equal(unauthorized.status, 401);
    assert.equal(unauthorized.headers.get("WWW-Authenticate"), 'Basic realm="VEO Workflow"');
    assert.equal(unauthorized.headers.get("Cloudflare-CDN-Cache-Control"), "no-store");
    assert.equal((await request("/meta/unavailable")).status, 502);
  });

  await t.test("WebSocket 101, cookie rewriting, and bidirectional message relay", async () => {
    for (const origin of [undefined, "https://evil.com"]) {
      const headers = {Upgrade:"websocket", ...(origin ? {Origin:origin} : {})};
      assert.equal((await request("/meta/remote-browser/ws", {headers})).status, 403);
    }
    const response = await request("/meta/remote-browser/ws", {headers:{
      Upgrade:"websocket", Origin:"https://blackroomprod.com",
      Host:"attacker.example", "X-Forwarded-Host":"attacker.example",
      "X-Forwarded-Proto":"http", "X-Forwarded-Prefix":"/wrong",
      "X-Meta-Proxy-Secret":"attacker",
    }});
    assert.equal(response.status, 101);
    assert.match(response.headers.get("Set-Cookie"), /Path=\/meta; Secure/);
    const socket = response.webSocket;
    assert.ok(socket);
    socket.accept();
    const echo = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("WebSocket echo timed out")), 3000);
      socket.addEventListener("message", event => {clearTimeout(timer); resolve(event.data);}, {once:true});
    });
    socket.send("browser-frame");
    assert.equal(await echo, "browser-frame");
    socket.close();
  });
});

await test("missing shared secret fails closed without affecting the site", async (t) => {
  const mf = runtime("");
  t.after(() => mf.dispose());
  for (const headers of [{}, {Upgrade:"websocket", Origin:"https://blackroomprod.com"}]) {
    const response = await mf.dispatchFetch("https://blackroomprod.com/meta", {headers});
    assert.equal(response.status, 503);
    assert.equal(await response.text(), "Meta proxy is not configured");
  }
  assert.equal((await mf.dispatchFetch("https://blackroomprod.com/")).status, 200);
});
