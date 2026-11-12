# /meta production audit — 2026-10-06

This audit performed read-only Cloudflare API/CLI inspection and unauthenticated
HTTP probes. It did not read either service's secret value or publish changes.

## Verified deployed state

- `blackroomprod.com` is an enabled Custom Domain on `blackroom-project`,
  environment `production`, account `9a7daae0544334208da49728b21d5bac`.
- The active deployment uses version
  `74a35274-5f01-4245-9e20-1290c734aa27` for 100% of traffic.
- That active version has a `secret_text` binding named `META_PROXY_SECRET`.
  **Exists: yes.** Its value was not retrieved or displayed.
- The exact active version's published module was inspected in memory. Its
  shared HTTP/WebSocket handler reads the environment's `META_PROXY_SECRET`,
  returns 503 with `Meta proxy is not configured` if absent, removes incoming
  forwarding/proxy headers, and sets:
  - `X-Forwarded-Host: blackroomprod.com`
  - `X-Forwarded-Proto: https`
  - `X-Forwarded-Prefix: /meta`
  - `X-Meta-Proxy-Secret`: the runtime environment binding.
- It deletes the incoming Host header and fetches the fixed URL origin
  `https://veo-workflow-production.up.railway.app`, allowing fetch to derive the
  transport Host from that URL. It uses manual redirects and no-store caching,
  and preserves the WebSocket response attachment.

The compiled environment parameter has a different identifier from the local
source. Checks were made against that actual parameter, not against a literal
assumption that the compiled variable is named `env`.

## Live observations and limits

| Probe | Status | Observations |
| --- | --- | --- |
| `/meta`, without an Origin header | 403 | Railway response identifier present; body matches `Forbidden`; proxy private/no-store headers present |
| `/meta/healthz` | 200 | Railway response identifier and proxy private/no-store headers present |
| `/meta` with an invalid Origin | 403 | Worker body matches `Origin not allowed`; no Railway response identifier |
| Direct Railway `/` without the proxy credential | 403 | Railway response identifier present; body matches `Forbidden` |

These findings support that the root 403 is an upstream Railway rejection, not
the Worker's missing-secret or Origin rejection. The health endpoint proves
reachability only; it bypasses Railway proxy authentication. They do not prove
which Railway check fails or that its secret matches Cloudflare's.

## Local validation

The local code matches the deployed contract described above. No production
proxy-code change was necessary. Regression tests were strengthened to validate
the target URL and all four headers for every mocked upstream HTTP method and
WebSocket request. The socket test supplies spoofed forwarding, Host, and secret
headers. Missing-secret tests check the exact 503 message for HTTP and upgrades.

All eight runtime tests passed. TypeScript, targeted Worker lint, and whitespace
checks also passed. Mock tests validate local behavior; they do not observe
headers after Railway's real edge processes them.

## Next steps before any approved deployment

1. In Railway's correct project/service/environment, confirm `META_PROXY_SECRET`
   is configured and that the active Railway deployment actually reads it in
   both HTTP middleware and its socket upgrade handler. Inspect every branch
   that returns `Forbidden`; distinguish proxy-secret validation from forwarded
   metadata validation, user authentication, and Origin/CSRF checks.
2. If diagnostics are needed, report only booleans such as secret-present,
   constant-time-secret-comparison-passed, and configured-host/protocol/prefix
   checks passed. Never log request headers wholesale or print either secret,
   derived hashes, or credentials. Railway may overwrite standard forwarding
   headers; use the configured canonical public origin after authenticating the
   proxy, rather than comparing browser Origin to the transport Host.
3. An authorized operator can securely re-enter the same secret into Railway
   and **Workers & Pages → blackroom-project → Settings → Variables and Secrets**
   in the verified account. Do not do this blindly during review: saving a Worker
   secret can deploy a new configuration version, and Railway variable changes
   may require redeployment. Coordinate the approved rollout of both services.
4. The inspected Worker does not need a new code deployment to obtain this
   forwarding contract: it already has it. If Railway code or either secret is
   corrected, deploy those changes only after approval. Keep the existing Custom
   Domains and other secret/service bindings. Then retest `/meta` using the app's
   normal authentication and an authenticated browser WebSocket; do not use
   `/meta/healthz` as the authentication acceptance check.

No secret equality claim is made. No deployment, secret write, commit, or push
was performed as part of this audit.

## Follow-up — 2026-10-07

The user reports Railway commit `aa2fc21` rejects only when the proxy credential
is missing, duplicated, or fails constant-time comparison. That Railway commit
and its configuration were not independently inspected from this project.

Fresh production inspection verified the apex still targets `blackroom-project`
in `production`. Active version `f99dad9c-ef63-4905-bbbf-cca9c9a9e8a7` serves
100% of traffic. **META_PROXY_SECRET Secret binding exists: yes.** Published code
reads the environment binding, sets the credential with `headers.set`, and attaches
that Headers object to the new Request passed directly to fetch. The request URL
uses the fixed Railway origin with `/meta` stripped. No subsequent credential
mutation occurs before fetch; redirects remain manual.

The exact proxy function, constants, and helper declarations from that active
published module were exercised locally in workerd, with the verified production
compatibility date `2025-10-08`, a dummy secret binding, and a mock upstream.
Instrumentation captured the Request argument at the fetch call. GET, POST, HEAD,
PUT, PATCH, DELETE, OPTIONS, and WebSocket upgrade each had exactly one credential
header matching the dummy binding, correct Railway URL/stripped path/query, and
correct forwarded headers. Duplicate incoming credential headers were replaced.
No real credential was used or read. Unrelated checkout SDK initialization was
excluded from this local trace; no production code was changed.

This is a published-code trace **in a local runtime**, not interception of live
production packets. It cannot establish header handling after Cloudflare fetch
or Railway's edge. Live `/meta` still returned Railway 403 `Forbidden`, while
`/meta/healthz` returned 200; the health endpoint is not evidence of credential
equality. Local duplicate-credential regression coverage was added; all nine
runtime tests, TypeScript, targeted lint, and whitespace checks passed.

No Worker code deployment is indicated by these findings. Next, have Railway
report only credential-header-present, exactly-one-header, and comparison-passed
booleans for the failing request. If it receives exactly one header but comparison
fails, privately synchronize the **existing intended credential** in the correct
Cloudflare production binding and active Railway service/environment. Re-entering
settings may deploy a configuration version or require a Railway redeployment;
perform those writes only after authorization. Do not rotate credentials or
declare them equal based on this audit. No publish, rotation, commit, or push was
performed for this follow-up.
