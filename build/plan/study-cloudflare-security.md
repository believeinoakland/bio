# Study · Cloudflare's security services for a group's copy

**Status** · STUDY by a research worker for BOB, 2026-10-06, on `tranche/T34`. Answers Bob's question "What security services are available from Cloudflare that groups can take advantage of?", as the substrate for the security review's open questions Q1–Q4 (`build/plan/draft-T35-security-review.md`). Every Cloudflare page cited was read on **2026-10-06**. Anything not confirmed on a Cloudflare page is marked *(unconfirmed)*. Nothing was configured or measured on a live account.

**Facts this study builds on (from the repository)**
- Every group holds **Workers Paid, $5/month** (D-118, DEC-42; `docs/architecture/BIO_Distribution_v0_1.md`:148). No domain is required: a copy may live on `<name>.<sub>.workers.dev` only.
- Bob's own zones (civicsmith.com, .dev, .org) are on the **Free website plan**.
- The installer (`newgroup`) signs in by OAuth and asks exactly four scopes: `workers-scripts.write`, `workers-r2.write`, `account-settings.read`, `containers.write` (`newgroup/src/index.mjs`:46). Any service below that needs another permission needs a new scope on the OAuth client and a re-consent by each group (as T33 did for Containers). Cloudflare's OAuth scope names follow its API-token permission names (`build/plan/measures-T33/assistant-substrate.md`:172); whether a scope exists for Access, Turnstile or zone rules was **not** checked *(unconfirmed)*.
- The plane serves public ops (publication, knock, verify, doors) and member ops from **one Worker** (`bio-plane`). This matters for Access (§2.1).

---

## 1. Summary for Bob (plain language)

"Zone" means a web address (domain) the group has put on Cloudflare. "workers.dev only" means the group has no domain and uses Cloudflare's free address.

| Service | What it does for a group, in everyday terms | Free zone plan | Workers Paid ($5, every group has it) | workers.dev only (no domain) | Extra cost |
|---|---|---|---|---|---|
| **DDoS protection** | Absorbs floods of junk traffic meant to knock the site offline. Always on; nobody has to set it up. | yes | yes | yes *(applies to Cloudflare's network; Worker-specific statement not found)* | $0 |
| **Cloudflare Access** (Zero Trust) | A locked front door: before anyone reaches a protected page, Cloudflare makes them prove who they are (a code sent to their email, or Google/GitHub sign-in). Strangers never reach the software. | yes | yes | **yes, whole Worker only** | $0 up to 50 people *(unconfirmed current figure)*; a card must be on file even for Free |
| **Access service tokens** | A machine's ID badge for Access: lets a program (e.g. a scheduled job) pass the locked door without a person. | yes | yes | yes | $0 |
| **Workers Rate Limiting binding** | Lets the software count how often one caller knocks and say "slow down" — stops password guessing and floods of free requests. Built into code, no domain needed. | n/a | yes | yes | $0 *(no price published)* |
| **Rate limiting rules** (WAF) | Same idea, but set in Cloudflare's dashboard in front of the site. Free plan: 1 rule, counted per IP, 10-second window. | 1 rule | — | **no** (needs a domain) | $0; more on Pro $20–25/mo |
| **WAF custom rules** | Simple "block or challenge requests that look like X" rules in front of the site (e.g. block a country, a path). | 5 rules | — | **no** | $0 |
| **WAF managed rules** | Cloudflare's own up-to-date list of known attack patterns, applied automatically. | Free ruleset only | — | **no** | Full rulesets need Pro ($20–25/mo) |
| **Leaked-password check** | Warns when someone signs in with a password already known from a public breach. | yes (password only) | — | **no** | $0 |
| **Bot Fight Mode** | Makes obvious robots solve a hard puzzle. Blunt: can also block the group's own scripts. | yes | — | **no** | $0 |
| **Turnstile** | A "prove you're human" check that is usually invisible, for public forms (join link, website key, knock). | yes | yes | yes *(workers.dev hostname not confirmed)* | $0 (20 widgets) |
| **Workers secrets** | A safe for passwords and keys: once stored, nobody can read them back, not even in the dashboard. Already used. | n/a | yes | yes | $0 |
| **Secrets Store** (beta) | One account-wide safe shared by several Workers. | n/a | yes *(plan not stated)* | yes | $0 during beta *(unconfirmed)* |
| **Account 2FA and member roles** | A second lock on the hosting account itself (phone app, security key or email code), and giving helpers only the access they need. | yes | yes | yes | $0 |
| **Audit logs** | A diary of every change made in the hosting account and who made it, kept 18 months. | yes | yes | yes | $0 |
| **Workers Logs** | The software's own diary of requests and errors, kept 7 days. Already on. | n/a | yes | yes | $0 within 20M events/mo |
| **Logpush / Tail Workers** | Copies those diaries somewhere the group keeps longer (e.g. its own storage). | n/a | yes | yes | Workers Paid usage *(price not checked)* |
| **R2 privacy and bucket locks** | Stored files are private unless deliberately published; a lock can make files impossible to delete or overwrite for a set time. | n/a | yes | yes | $0 *(lock price not stated)* |
| **Durable Objects isolation** | The record's database is sealed inside Cloudflare, reachable only through the group's own software, encrypted on disk. Already used. | n/a | yes | yes | $0 within included use |
| **Containers egress allowlist** | The assistant's container may talk only to the addresses on its list (today: Anthropic). Already used. | n/a | yes | yes | $0 |
| **AI Gateway** | A meter and brake between the assistant and Anthropic: counts, caps and logs AI calls. | yes | yes | yes | $0 core features |
| **Security Analytics / Events** | Charts of attacks Cloudflare blocked in front of the site, last 30 days. | yes (sampled) | — | **no** | $0 |
| **Workers Analytics Engine** | A place for the software to write its own counts (refused sign-ins, blocked callers) and chart them, kept 3 months. | n/a | yes | yes | $0 today (not yet billed) |
| **Web Analytics** | Visitor counts without cookies or tracking people. | yes | yes | yes | $0 |
| **mTLS** | Lets only devices holding a certificate connect. | yes | — | **no** | $0 |
| **Not for groups** | Malware scanning of uploads, API Shield schema checks, Gateway egress policies, Firewall-for-AI: Enterprise only. Email Routing needs a domain. URL Scanner (Radar) is free-standing but sends addresses to Cloudflare's public scan list unless unlisted. | | | | Enterprise |

**What a domain buys a group.** With no domain, a group gets DDoS, Access (whole Worker), Turnstile, rate limiting **in code**, secrets, logs, R2, AI Gateway. Putting a domain on the Free zone plan (registration at cost, roughly $10–15/year *(unconfirmed)*) adds the dashboard shields: 5 WAF rules, 1 rate-limit rule, the free managed ruleset, Bot Fight Mode, leaked-password check, Security Analytics, path-level Access, mTLS. Pro ($20/mo annual, $25 monthly) adds the full managed rulesets and longer rate-limit windows.

---

## 2. Evidence, service by service

Columns in each entry: **does** · **plan** · **limits** · **who configures** (installer by API with the group's token, or a dashboard act by the group).

### 2.1 Cloudflare Access (Zero Trust)
- **Does.** Puts an identity check in front of a Worker. Policies are built from Allow/Block/Bypass/Service Auth actions and Include/Require/Exclude rules on email, domain, country, etc. [cf-one/policies/access](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- **Workers.** Since 2026-08-14, Access attaches to **the Worker itself**: "every associated domain and preview URL stays protected", including `workers.dev`; an account can make "all Workers private by default". The Worker reads the signed-in person with `ctx.access.getIdentity()` — "no manual JWT validation required". [changelog 2026-08-14](https://developers.cloudflare.com/changelog/post/2026-08-14-workers-access/), [workers/configuration/cloudflare-access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/). Limits there: no WebSockets behind Worker-level Access (403); `ctx.access` does not pass through service bindings.
- **Paths.** Path-level protection (protect `/setup`, leave `/publicread` open) is hostname-based and needs a self-hosted app on "an active domain on Cloudflare" [self-hosted-public-app](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-public-app/), [app-paths](https://developers.cloudflare.com/cloudflare-one/policies/access/app-paths/). **On workers.dev only, Access is all-or-nothing for the Worker**, so it cannot sit in front of `bio-plane` without also locking out the public ops — unless the public projection moved to a separate Worker.
- **Login methods.** One-time PIN to email (single use, 10 minutes), or Google, GitHub, Entra, Okta, SAML, OIDC. [one-time-pin](https://developers.cloudflare.com/cloudflare-one/identity/one-time-pin/)
- **Service tokens.** Client ID + secret in `CF-Access-Client-Id` / `CF-Access-Client-Secret` headers; set duration, renewable; created by API with "Access: Service Tokens Write". [service-tokens](https://developers.cloudflare.com/cloudflare-one/identity/service-tokens/)
- **Plan.** Zero Trust Free: "up to 50 seats of Access and Gateway" ([blog 2020-10-13](https://blog.cloudflare.com/teams-plans)); the current pricing page did not render a figure *(50 unconfirmed today)*. A seat is used by each person who authenticates; seats can expire after 1–12 months idle. [seat-management](https://developers.cloudflare.com/cloudflare-one/identity/users/seat-management/). Account limits: 500 apps, 50 service tokens, 50 identity providers. [account-limits](https://developers.cloudflare.com/cloudflare-one/account-limits/)
- **Who configures.** Zero Trust must first be enabled in the dashboard: a team name, a plan, and payment details "still needed but you will not be charged" on Free. [setup](https://developers.cloudflare.com/cloudflare-one/setup/) — a **group's dashboard act**. After that, apps can be created by API (`POST /accounts/{id}/access/apps`, destination type `worker`). The installer has no Access scope today *(scope existence unconfirmed)*.

### 2.2 WAF: custom rules, managed rules, rate limiting rules, leaked credentials (zone only)
- **Custom rules:** Free 5, Pro 20, Business 100; no regex below Business. [waf/custom-rules](https://developers.cloudflare.com/waf/custom-rules/)
- **Managed rules:** Free gets the "Free Managed Ruleset" ("high-impact and widely exploited vulnerabilities"); Pro adds Cloudflare Managed and OWASP Core. [waf/managed-rules](https://developers.cloudflare.com/waf/managed-rules/)
- **Rate limiting rules:** Free 1 rule, IP only, 10 s period, 10 s block; Pro 2 rules, up to 1 min / 1 h. Zone-level. [waf/rate-limiting-rules](https://developers.cloudflare.com/waf/rate-limiting-rules/)
- **Leaked credentials:** "Password Leaked" on all plans; user+password pair from Pro. [leaked-credentials](https://developers.cloudflare.com/waf/detections/leaked-credentials/)
- **workers.dev.** These all attach to a zone. `workers.dev` "is treated as a Free website and is intended for personal or hobby projects"; Cloudflare recommends a route or custom domain for production. [workers-dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/). A group's rules cannot be placed on Cloudflare's `workers.dev` zone *(inferred; no page states it in those words)*. A Custom Domain needs "an active Cloudflare zone". [custom-domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- **Who configures.** API with a zone-level permission; the installer has none *(scope existence unconfirmed)*; otherwise the group in the dashboard.

### 2.3 Workers Rate Limiting binding (in code; no domain)
- `limit` per `period` of **10 or 60 s**, keyed by anything the code chooses (Cloudflare advises a user/credential id, not IP). "Permissive, eventually consistent … not … an accurate accounting system"; the count is **per Cloudflare location**. Bindings sharing a `namespace_id` share counters. [bindings/rate-limit](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- Plan and price: not stated on the page *(unconfirmed; usable on Paid)*. Needs wrangler ≥ 4.36.0.
- **Who configures.** A binding in the plane's config, carried by the release and the installer's upload — no new scope *(unconfirmed that the scripts-upload API accepts the binding under `workers-scripts.write`)*.

### 2.4 DDoS protection
- "Standard, unmetered DDoS protection (layers 3-7)" on every plan, Free to Enterprise; adaptive rules beyond error-rate need the Advanced add-on. [ddos-protection](https://developers.cloudflare.com/ddos-protection/). Nothing to configure. Workers/workers.dev not named on the page. Whether requests stopped by DDoS protection are billed to the Worker: not stated *(unconfirmed)*. [workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)

### 2.5 Bot Fight Mode and Turnstile
- **Bot Fight Mode:** Free; zone-wide; "cannot be bypassed or skipped by WAF custom rules"; "may challenge API or mobile app traffic". [bot-fight-mode](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/). Needs a zone. Risky for the plane's own API callers (agent-worker, livefire).
- **Turnstile:** Free, up to 20 widgets, 10 hostnames each; "can be used independently without requiring other Cloudflare services". [turnstile/plans](https://developers.cloudflare.com/turnstile/plans/). Widgets are created by API at `/accounts/{id}/challenges/widgets` with "Turnstile Sites Write" or "Account Settings Write" [widget-management/api](https://developers.cloudflare.com/turnstile/get-started/widget-management/api/) — the installer holds only `account-settings.read`. The plane must verify each token server-side (siteverify) itself.

### 2.6 Secrets
- **Workers secrets:** "not visible within Wrangler or Cloudflare dashboard after you define them". [secrets](https://developers.cloudflare.com/workers/configuration/secrets/). 64 (Free) / 128 (Paid) variables per Worker, 5 KB each. [limits](https://developers.cloudflare.com/workers/platform/limits/). Already used (`ADMIN_TOKEN`, `ACCOUNT_SEAL_SECRET`, …).
- **Secrets Store:** open beta; one store per account; 100 secrets; ≤ 65,536 bytes; once stored "it can no longer be decrypted or accessed via API or on the dashboard". [secrets-store](https://developers.cloudflare.com/secrets-store/), [manage-secrets](https://developers.cloudflare.com/secrets-store/manage-secrets/). Plan and price not stated *(unconfirmed)*. Neither holds a release signing seed (that lives off Cloudflare).

### 2.7 API tokens, account 2FA, member roles, audit logs
- **API tokens:** per-permission Read/Edit, scoped to accounts or zones, with client-IP filter and TTL. [create-token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/). The installer instead uses a short OAuth grant with four scopes, discarded at the end (`newgroup/src/ui.mjs`:243).
- **2FA:** TOTP app, security key/passkey, or email code; a Super Administrator can enforce 2FA for all members; not on by default. [2fa](https://developers.cloudflare.com/fundamentals/user-profiles/2fa/). Group's dashboard act.
- **Roles:** Super Administrator, Administrator, Administrator Read Only, Workers Platform Admin, Cloudflare Access, and 90+ product roles; domain- and resource-scoped roles (beta). [roles](https://developers.cloudflare.com/fundamentals/manage-members/roles/). Since 2026-09-21 a Super Administrator can grant a teammate access to one Worker (Metadata Read-Only, Content Read-Only, Editor, Admin). [changelog 2026-09-21](https://developers.cloudflare.com/changelog/post/2026-09-21-invite-members-to-workers/). Plan gating not stated *(unconfirmed)*.
- **Audit logs:** account logins and configuration changes; "available on all plan types"; kept 18 months; API readable. [audit-logs](https://developers.cloudflare.com/fundamentals/account/account-security/review-audit-logs/)

### 2.8 Logs
- **Workers Logs:** one invocation log per request "that contains details such as the Request, Response"; the event carries `request.url`, `method`, `headers`, `cf` ([real-time-logs](https://developers.cloudflare.com/workers/observability/logs/real-time-logs/)). **No redaction feature is documented.** `invocation_logs: false` turns the per-request log off; `head_sampling_rate` samples. Retention 7 days (Paid), 3 days (Free). [workers-logs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/). Paid: 20M events/month included, $0.60 per extra million; "pricing changes December 1, 2026". [pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- **Logpush (Workers Trace Events):** Workers Paid; to R2 and other destinations; fields include Event, Logs, Exceptions. [logpush](https://developers.cloudflare.com/workers/observability/logs/logpush/). **Tail Workers:** Paid; receive full request details including headers and URL. [tail-workers](https://developers.cloudflare.com/workers/observability/logs/tail-workers/). A Tail Worker is the one place the product could redact before keeping logs.

### 2.9 Outbound (egress) controls
- **Ordinary Worker:** no account-level egress allowlist found for a normal Worker. Egress control exists only for **Workers for Platforms** (an Outbound Worker intercepts `fetch()`; `connect()` disabled) [outbound-workers](https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/configuration/outbound-workers/) and **Dynamic Workers** (`globalOutbound: null` makes every `fetch()`/`connect()` throw, or routes them through a gateway entrypoint) [dynamic-workers/egress-control](https://developers.cloudflare.com/dynamic-workers/usage/egress-control/). So the plane's own fetches (capture drain) must be governed **in code**.
- **Gateway egress policies:** "Only available on Enterprise plans"; Workers traffic not stated. [egress-policies](https://developers.cloudflare.com/cloudflare-one/traffic-policies/egress-policies/)
- **Containers:** "By default, a Container will allow internet access"; `enableInternet = false` plus `allowedHosts` makes a "deny-by-default allowlist"; `deniedHosts` checked first; outbound handlers can inspect each request. [containers/outbound-traffic](https://developers.cloudflare.com/containers/platform-details/outbound-traffic/). Already used: `agent-runner/src/worker.mjs`:20–21.
- **Self-fetch:** the project measured that a Worker cannot fetch a Worker on its own account's `workers.dev` name (error 1042; `bio-plane/wrangler.jsonc` comment, FL-1).
- **Browser Rendering:** Paid includes 10 browser-hours/month, then $0.09/h; 10 concurrent browsers. [browser-rendering/pricing](https://developers.cloudflare.com/browser-rendering/pricing/). What a rendered page's browser can reach on the network: not found *(unconfirmed)*.

### 2.10 R2 and Durable Objects
- **R2:** "By default, buckets are never publicly accessible"; `r2.dev` public URLs are rate-limited and for development only; WAF/Access/Bot Management need a custom domain. [public-buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/). All objects "encrypted at rest" (AES-256-GCM, Cloudflare-managed keys). [r2 data-security](https://developers.cloudflare.com/r2/reference/data-security/). **Presigned URLs** need an R2 S3 access key pair; expiry 1 s – 7 days. [presigned-urls](https://developers.cloudflare.com/r2/api/s3/presigned-urls/) — the plane uses bindings and holds no such key, by design.
- **Bucket locks:** prevent deletion and overwrite for a period, until a date, or indefinitely, per prefix; dashboard, wrangler or API; "A bucket cannot be emptied while any bucket lock rules are configured". [bucket-locks](https://developers.cloudflare.com/r2/buckets/bucket-locks/). Price not stated *(unconfirmed)*. Fits signed published material (A6) and a security-event log.
- **Durable Objects:** storage "private to its unique instance"; "All Durable Object data, including metadata, is encrypted at rest" (LUKS, AES-256). [what-are-DOs](https://developers.cloudflare.com/durable-objects/concepts/what-are-durable-objects/), [DO data-security](https://developers.cloudflare.com/durable-objects/reference/data-security/)

### 2.11 AI Gateway
- "Available on all plans"; core features (analytics, caching, rate limiting) free; Anthropic supported. [ai-gateway](https://developers.cloudflare.com/ai-gateway/), [ai-gateway pricing](https://developers.cloudflare.com/ai-gateway/reference/pricing/). Logs follow Workers Logs pricing for gateways made after 2026-09-24. It would log prompts (record text) unless logging is off — a disclosure the product must decide on. Spend caps: not confirmed on the pages read *(unconfirmed)*.

### 2.12 Scanning
- **Malicious uploads (WAF content scanning):** "Enterprise plan with a paid add-on"; HTTP request bodies only (first 50 MB), not R2. [malicious-uploads](https://developers.cloudflare.com/waf/detections/malicious-uploads/). **Not available to groups.**
- **URL Scanner (Radar):** API with "Account > URL Scanner: Edit"; scans are **public by default** (listed), or unlisted. [url-scanner](https://developers.cloudflare.com/radar/investigate/url-scanner/). Price/limits not stated. Submitting a capture's address would disclose what the group is looking at.
- No Cloudflare malware scan of R2 objects or of Workers AI inputs was found.

### 2.13 Other
- **mTLS:** "Anyone can set up Mutual TLS with a Cloudflare-managed certificate authority"; rest of API Shield is Enterprise. [api-shield](https://developers.cloudflare.com/api-shield/). Needs a zone hostname.
- **Email:** Email Routing "Available on Free and Paid plans" (needs the domain on Cloudflare *(inferred)*); sending from Workers is Workers Paid, beta; sending to verified addresses free. [email-routing](https://developers.cloudflare.com/email-routing/). Relevant only for security notices by email (Q5).
- **Web Analytics:** "does not collect or use your visitors' personal data"; free; JS beacon, no proxy needed. [web-analytics](https://developers.cloudflare.com/web-analytics/about/)

---

## 3. Showing an administrator the level of attack (for an admin screen)

| Source | What it gives | Free zone | Workers Paid | workers.dev only | Readable by the plane? |
|---|---|---|---|---|---|
| **Security Analytics** | All traffic with attack scores, mitigated vs not | yes, last 31 days, 30-day window | — | no (zone) | via GraphQL with a zone-read token *(dataset per plan unconfirmed)* |
| **Security Events** | Each blocked/challenged request (rule, country, path) | yes, **sampled only**; no export | — | no (zone) | as above |
| **Workers metrics** | Requests, errors, CPU, subrequests per Worker | — | yes, 3 months back, one-week steps; GraphQL | yes | GraphQL needs an API token the plane does not hold |
| **Analytics SQL binding** | Lets the plane query account-scope datasets (e.g. `events.httpRequests`, its own Analytics Engine data) **with no API token** | — | yes *(plan not stated)* | yes | **yes**, wrangler ≥ 4.145.0, binding `analytics` |
| **Workers Analytics Engine** | The plane writes its own data points (refused sign-in, rate-limited caller, blocked capture, by hour/country/op) and queries them by SQL; kept 3 months | — | 10M points + 1M queries/month included; **not billed today** | yes | yes |
| **Workers Logs / Logpush** | Raw per-request logs (7 days), or copied to R2 for longer | — | yes | yes | Logpush to R2 the plane could read *(unconfirmed)* |
| **Audit logs** | Changes to the hosting account (who logged in, what changed), 18 months | yes | yes | yes | API token needed |

Sources: [security-analytics](https://developers.cloudflare.com/waf/analytics/security-analytics/), [security-events](https://developers.cloudflare.com/waf/analytics/security-events/), [workers metrics](https://developers.cloudflare.com/workers/observability/metrics-and-analytics/), [sql-api/workers-binding](https://developers.cloudflare.com/analytics/sql-api/workers-binding/), [sql-api/datasets](https://developers.cloudflare.com/analytics/sql-api/datasets/), [analytics-engine pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/), [analytics-engine limits (3 months)](https://developers.cloudflare.com/analytics/analytics-engine/limits/).

**Reading for the admin screen.** For every group (domain or not), the one source the plane can read itself, without a stored API token, is **Workers Analytics Engine through the Analytics SQL binding**: the plane records its own refusals (F3, F4, F9's tallies) and draws the chart for any chosen period up to 3 months, at $0 today. A world map is possible from the request's `cf.country`, which every Worker request carries *(country field in Analytics Engine is the product's choice to write)*. Zone-level Security Analytics adds Cloudflare's own blocked traffic only for groups with a domain, and reading it from the plane would need a stored zone-read token (a new secret, against the "no key to leak" posture of `bio-plane/wrangler.jsonc`). Privacy: write counts by country and op only, never an address (matches the review's Q5 recommendation).

---

## 4. Mapping: findings F1–F21

"Free" = $0 for a typical group (Workers Paid, possibly no domain). "Installer" = the installer can do it with the group's OAuth token (today's scopes, or a new scope + re-consent). "Group" = a dashboard act by the group.

| F | Cloudflare part | What it takes | Product must still | Free? |
|---|---|---|---|---|
| F1 tokens in addresses | Workers Logs keeps `request.url`; no redaction feature. `invocation_logs: false` or `head_sampling_rate` reduce exposure; a Tail Worker could redact before Logpush. | Config in the release; no scope | Move credentials to `Authorization` header / body (the fix is the product's) | yes |
| F2 AI-steered fetch | None for a plain Worker (no egress allowlist below Enterprise/Workers for Platforms). Containers' `allowedHosts` already closes the runner. | — | The host rule and member approval, in the drain | n/a |
| F3 sign-in guessing | Rate Limiting binding (in code, keyed per role/source); with a domain also 1 free WAF rate-limit rule (IP, 10 s) and leaked-password detection; Turnstile on the sign-in form | Binding: release config. WAF: group or new zone scope. Turnstile: new scope or group | The refusal, its wording, the same-cost answer; the binding is approximate and per-location, so keep a DO-side count for the hard limit | yes |
| F4 public-op floods | DDoS (always on); Rate Limiting binding; with a domain, WAF rule + Bot Fight Mode (risky for API callers) | as F3 | Choose keys and bounds; refusal text | yes |
| F5 prompt injection | None (Firewall-for-AI and AI Gateway guardrails not shown available to groups *(unconfirmed)*) | — | All of it | n/a |
| F6 MEMBER_TOKEN | Access service tokens could replace a shared machine bearer **only** if the Worker sat behind Access; on workers.dev Access gates the whole Worker incl. public ops | Zero Trust setup (group, card on file) | Retire the token; re-point users to sessions / `aik-` | yes, but structurally awkward |
| F7 nested ZIP | R2 has no byte quota per prefix; billing alerts *(unconfirmed)* | — | Cumulative unpack budget | n/a |
| F8 signer custody | None (seed lives off Cloudflare; Secrets Store holds service secrets, not offline keys) | — | Custody, recovery key, revocation | n/a |
| F9 no security events | Audit logs (account changes, 18 months, all plans); Analytics Engine + SQL binding for the plane's own tallies | Binding in release config | Decide what to count and notify | yes |
| F10 ADMIN_TOKEN | Secrets are write-only and re-settable; account 2FA enforcement; per-Worker roles | Group acts (2FA, roles); rotation by `wrangler secret put` or dashboard | Rotation guide | yes |
| F11 copies in one account | Per-Worker roles (2026-09-21); separate buckets/DOs | Installer naming | R32 isolation | yes |
| F12 timing | none | — | constant-time compare | n/a |
| F13 plaintext sessions | DO encrypted at rest (disk-level only) | — | hash the session key | n/a |
| F14 sign-out | Access has its own session/logout if used | — | `signout` op | n/a |
| F15 agent-credential expiry | (Access service tokens have durations — analogous only) | — | `expiresInDays` | n/a |
| F16 self-host fetch | Measured: Worker → own `workers.dev` returns 1042 | — | Refuse own host by name | yes |
| F17 inline script | none (CSP is the product's header) | — | nonce `script-src` | n/a |
| F18 OOXML parts | none | — | per-part caps | n/a |
| F19 render egress | Browser Rendering's reach not documented *(unconfirmed)* | — | Intercept requests in the driver to public locators | n/a |
| F20 install scripts | none | — | `--ignore-scripts` | n/a |
| F21 advisories | none (Cloudflare does not scan bundles) | — | release advisory step | n/a |
| A7 spend (whole review) | AI Gateway rate limiting in front of Anthropic (free core); Workers usage notifications *(unconfirmed)* | Group or new scope | ceilings already in `ai-runs` | yes |

## 5. Mapping: questions Q1–Q4

- **Q1 (where the assistant may fetch on its own).** Cloudflare offers no egress allowlist for an ordinary Worker (only Enterprise Gateway, Workers for Platforms Outbound Workers, Dynamic Workers' `globalOutbound`); the container is already locked to Anthropic. **The host rule must be the product's, enforced at the capture drain.** Not submitting addresses to URL Scanner (public by default). Cost: $0.
- **Q2 (protective limits and refusals).** The **Workers Rate Limiting binding** (no domain, Workers Paid, no new scope) carries sign-in and public-op limits; it is approximate and per-location, so the hard limit for `login` stays in the Store. DDoS is automatic. Groups **with a domain** may add 1 free rate-limit rule, 5 custom rules, the free managed ruleset and leaked-password detection by their own dashboard act or a new zone scope. Turnstile (free) on the doors needs a new scope or a group act. Refusals, wording and sign-out/expiry remain the product's. Cost: $0.
- **Q3 (retiring MEMBER_TOKEN).** Cloudflare does not replace it cheaply: Access (free ≤50 seats *(unconfirmed today)*, card on file, a group's dashboard setup) on workers.dev locks the **whole** Worker, including public ops, so it would need the public projection split into another Worker or a domain with path rules. Retiring the token in favour of personal sessions and `aik-` credentials is the product's act; Access could later be an optional extra door for groups with a domain.
- **Q4 (release-key custody).** No Cloudflare service applies: the seed signs off-platform, and Workers secrets / Secrets Store hold a copy's service secrets, not an offline signing key. What Cloudflare contributes is the **account** side: enforce 2FA (security key) on the account that publishes releases and on each group's account, and read audit logs (18 months, all plans). Custody, the recovery key and revocation are policy.
