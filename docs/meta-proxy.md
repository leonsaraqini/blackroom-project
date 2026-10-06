# Railway app at https://blackroomprod.com/meta

## Verified deployment

On 2026-10-06, a read-only Cloudflare API check confirmed:

- Account: `Contact@blackroomprod.com's Account` (`9a7daae0544334208da49728b21d5bac`).
- Active zone: `blackroomprod.com` (`ce79dc30c61db88eae122419d1a5fbda`).
- Enabled production Custom Domains on Worker `blackroom-project`:
  `blackroomprod.com`, `www.blackroomprod.com`, and `api.blackroomprod.com`.
- No zone Worker Routes were configured; these are Custom Domains.
- The live `/api/` and `/kairos-express/latest-version` responses matched this repository.

The initial Wrangler login was for a different account. It was replaced at the
user's request; the current login is `contact@blackroomprod.com`.
`blackroom.com` is not a domain configured by this change.

This project serves Vite static assets with SPA fallback. A Hono Worker handles
`/api/*`, `/admin` and `/admin/*` (through the `telephony-project` service binding),
and `/kairos-express/*`. Those handlers and asset behavior are retained.

## Implemented proxy contract

| Public request | Railway request |
| --- | --- |
| `/meta` or `/meta/` | `/` |
| `/meta/api/jobs?cursor=x` | `/api/jobs?cursor=x` |
| `/meta/logout` | `/logout` |
| `/meta/remote-browser/socket` | `/remote-browser/socket` |

Only exact `/meta` and `/meta/*` enter the proxy. `/metadata`, `/meta-other`,
`/META`, `/api/*`, `/logout`, and `/remote-browser/*` keep their existing website
behavior. The app is served only on `https://blackroomprod.com`; `/meta` on
the other Custom Domains or preview hosts returns 421. All methods, query
parameters, request body streams, Cookie, Authorization, and WebSocket upgrade
headers are forwarded to the fixed HTTPS Railway origin. There is no user-selected
upstream and no automatic redirect following.

Client-supplied `Forwarded`, `X-Forwarded-*`, `X-Meta-*`, and `X-Original-*` are
removed. The Worker sets:

```text
Host: veo-workflow-production.up.railway.app (derived by fetch from the target URL)
X-Forwarded-Host: blackroomprod.com
X-Forwarded-Proto: https
X-Forwarded-Prefix: /meta
X-Meta-Proxy-Secret: <META_PROXY_SECRET Worker secret>
Origin: <original browser Origin, unchanged>
```

An Origin, when present, must be exactly `https://blackroomprod.com`.
WebSocket upgrades require that Origin. Cross-origin and `Origin: null` requests
return 403. Origin-less HTTP clients are allowed through but still require the
Railway app's authentication and applicable CSRF protection. The Worker does not
replace authentication. Railway must enforce auth on the socket upgrade too.

Same-origin and Railway `Location` redirects are mapped onto the public `/meta`
path, including relative redirects; already-prefixed paths are not prefixed twice.
Redirect status, query, and fragment are retained. External identity-provider
redirects remain external. Response bodies, CSP, Link, Refresh, and JavaScript
URLs are not rewritten: Railway must generate those correctly itself.

Each Set-Cookie is retained separately. Domain is removed to make it host-only,
Secure is set, and Path is scoped under `/meta`. Root or missing cookie paths
become `/meta` (so the cookie works on exact `/meta` too); `/remote-browser`
becomes `/meta/remote-browser`. Expiry, deletion, HttpOnly, and SameSite attributes
are retained. `__Host-*` cookies cause 502 because their required `Path=/` is
incompatible with scoping; Railway must rename those cookies before rollout.

All app responses, including errors and upgrades, carry private/no-store cache
headers for browsers and CDNs. Upstream fetch uses `cache: "no-store"`.
The Worker never uses Cache API. Missing proxy configuration returns 503;
upstream failure or incompatible cookies return a generic 502 without logging
credentials. The proxy streams responses and preserves the WebSocket attachment
on 101; it does not buffer browser frames or SSE.

## Required Railway changes before publishing

The Railway source is not in this project and has not been changed or tested.
The live origin currently returns a Basic-auth challenge. These are application
requirements, not claims that setting environment variables alone enables them.

1. Implement configuration with public origin `https://blackroomprod.com` and
   public base path `/meta`. Suggested names: `PUBLIC_ORIGIN` and
   `PUBLIC_BASE_PATH`. Keep HTTP and WebSocket backend handlers mounted at `/`,
   `/api/*`, `/logout`, and `/remote-browser/*`: the Worker already strips `/meta`.
   Do not mount them under `/meta` internally or strip the prefix a second time.

2. Generate **every browser-facing app URL** with `/meta`: fetch calls,
   forms/action URLs, links, login/logout, redirects, assets/CSS URLs, dynamic
   imports, SPA router basename, remote-browser iframe src, noVNC scripts,
   WebSocket endpoints, EventSource URLs, downloads, and any service worker
   URLs/scope. For example, `/api/jobs` must become `/meta/api/jobs`, and
   `/remote-browser/view` becomes `/meta/remote-browser/view`. A `<base>` tag does
   not fix root-relative `/...` URLs. Ensure assets work from both `/meta` and
   `/meta/`, and from deep links. Embedded remote pages must obey the same rule.
   Update CSP/connect-src, Link/preload, Refresh, and any absolute URLs too.

3. Set Railway `META_PROXY_SECRET` to the same long, random value as the Worker
   secret. **Validate it in constant time before trusting proxy metadata**, for
   both HTTP middleware and the WebSocket upgrade handler (which may bypass
   middleware). Do not return or log this header, and redact it from request
   traces. Recommended deployment mode: reject app HTTP/WS requests without the
   valid proxy secret, except a separately defined non-sensitive health endpoint
   if Railway requires one. Retain Basic/session authentication after this gate.
   This prevents direct Railway requests from forging trusted forwarded headers.

4. Replace `Origin === Host` validation. The transport Host must remain Railway's
   hostname for routing/TLS. After the secret check, use the **configured public
   origin** for CSRF/Origin validation; require the exact public Origin for browser
   socket upgrades. Validate forwarded host/protocol/prefix against the configured
   values, rather than reflecting arbitrary values. Railway's edge may add or
   replace standard forwarding headers; use the fixed public configuration after
   authenticating the proxy, never infer an allowed Origin from those headers.
   Do not globally enable unrestricted `trust proxy`, use wildcard CORS, disable
   CSRF, or rewrite an untrusted Origin into a trusted one. For origin-less HTTP
   requests retain the application's existing auth/CSRF policy.

5. Build the browser socket URL as
   `wss://blackroomprod.com/meta/remote-browser/<actual-socket-route>`.
   Preserve the remote browser's existing subprotocol/query requirements, and
   require its existing session/token authentication during upgrade. Browser
   WebSocket APIs cannot attach arbitrary Authorization headers; ensure the
   application's actual browser authentication mechanism works on the socket.
   Keep Railway's own upgrade handler and streaming support enabled. If the app
   checks Referer, validate its public origin and `/meta` path too.

6. Use a unique app session cookie name (for example `meta_session` or
   `__Secure-meta_session`), no Domain, `Path=/meta`, Secure, HttpOnly, and the
   existing appropriate SameSite policy. Set and delete the cookie with the same
   name and path. Rename `__Host-*` cookies and plan session migration/re-login.
   Configure OAuth callback URLs as `https://blackroomprod.com/meta/<callback>`
   in the app and identity provider; validate return URLs to prevent open redirects.
   Return private/no-store on authenticated HTTP responses on Railway itself too.

Do not forward the website's root `/api`, `/logout`, or `/remote-browser` paths
to compensate for missing app changes: that would change existing site behavior.
Cookie Path scopes delivery but is not a security boundary between apps on the
same origin; Railway should not assume it isolates it from the public website.

## Review and local checks

```sh
npm run build
npm run test:meta
npx eslint src/worker/index.ts src/worker/meta-proxy.ts
npx wrangler deploy --dry-run
```

The test uses the installed Vite/Wrangler toolchain's esbuild and Miniflare,
mocking Railway while running the real Hono Worker and static-assets router in
workerd. It checks routing boundaries and unchanged site routes, methods/body/auth,
forwarded-header replacement, redirects, separate/deleted cookies, auth/errors,
fail-closed configuration, Origin rejection, and a real WebSocket 101/message echo.
These checks do not prove the Railway app is prefix-aware. No production write
or deployment has been performed. Build output and `.dev.vars` must not be uploaded
manually as public assets; Wrangler uploads only `dist/client` as static assets.

## Cloudflare dashboard deployment steps (after review)

1. Finish and test the Railway changes first. Generate a random shared secret
   outside source control and configure it on Railway. Do not put it in browser
   configuration or commit it. Log into the verified Cloudflare account above.

2. Open **Workers & Pages → blackroom-project → Settings → Domains & Routes**.
   Confirm the three existing **Custom Domains** listed above. They already send
   the apex traffic to this Worker; no `/meta*` domain route or DNS record is
   needed. Keep all three existing domains. `wrangler.json` now mirrors these
   mappings and pins the verified account.

3. In **Settings → Variables and Secrets**, add `META_PROXY_SECRET` as a
   **Secret**, with the same value as Railway. Retain the existing Freemius secrets
   and `ADMIN_WORKER → telephony-project` binding. Saving dashboard settings may
   create/deploy a configuration version; do this only during the approved rollout.

4. If the Worker uses **Settings → Build → Git repository**, deploy the reviewed
   commit using the existing repository integration. Build command:
   `npm run build`; deploy command: `npm run deploy`; root: this project directory.
   Include both the Worker and static assets. Do not paste the TypeScript module
   into the dashboard editor: it imports Hono/Freemius and needs the Vite bundle.
   If no Git integration exists, use the tested local build with Wrangler after
   approval (`npm run build` then `npm run deploy`) and review its deployment in
   **Deployments**. Do not click Deploy or push to an auto-deploy branch during
   review. If configuring Git integration, verify automatic deploy settings first.

5. Review zone **Caching → Cache Rules** (and any legacy Page Rules) for a bypass
   covering `http.host eq "blackroomprod.com" and
   (http.request.uri.path eq "/meta" or starts_with(http.request.uri.path, "/meta/"))`.
   Avoid broad cache-everything rules for the app. If **Workers Cache** is enabled
   on this Worker, verify `/meta` is not force-cached. Response no-store headers
   are still sent by the proxy. Confirm zone WebSockets support is enabled under
   **Network** if that setting is exposed for the zone. Keep applicable auth/WAF
   controls; ensure interactive challenges do not interrupt authenticated socket
   upgrades or API calls.

6. After the approved deployment, test exact `/meta` and `/meta/`, deep links,
   login/logout/session expiration, API POST/file upload, redirect chains,
   cookie deletion, and the embedded browser's authenticated WebSocket (101 and
   sustained traffic). Verify browser DevTools shows only `/meta/...` app requests,
   no unexpected root `/api` or `/remote-browser` calls, and no cache HIT on app
   responses. Check `/`, `/portfolio`, `/api/`, `/admin`, and release endpoints.
   A foreign Origin must get 403; unauthenticated app/socket access must still fail.

7. Record the previous Worker version before rollout. If needed, use
   **Deployments → previous version → Roll back**. Coordinate Railway rollback
   because its public prefix and proxy gate are part of the same contract.

References: [asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/),
[Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/),
[fetch cache modes](https://developers.cloudflare.com/workers/runtime-apis/fetch/),
[WebSockets](https://developers.cloudflare.com/workers/runtime-apis/websockets/),
and [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).
