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
