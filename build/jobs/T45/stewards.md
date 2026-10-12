# stewards (T45)

**Status** · session_01L1YejSDpXxWW9J2kjUsHBp · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Five readings I am building on; each is a detail, none blocks me. Answer only where you read otherwise.

1. **Guide words (R7, installer R48 third part).** No words were given at the START, so I draft them, in R48's three points and R34's words, as `stewards/guide.md` (the one shared-text file, K2878); `/guide` serves them byte for byte and the R7 test compares them with that file. Installer's T46 job aligns `newgroup/README.md` with it. Please review the words at merge (they are BOB's).
2. **Sender address for R14's mail.** Cloudflare's send-e-mail binding needs a `From` address on a domain with Email Routing in the account; the requirements name none. I add an optional variable `NOTIFY_FROM` (not one of R1's five): while unset, the notification fails, is logged by `ref` only, and the intake's answer is unchanged (R14). DEPLOY.md names it as one deploy act alongside verifying the stewards' address. The committed `send_email` binding names no `destination_address` until Bob names the address (`checkOpen` refuses a binding whose address differs from `STEWARDS_ADDRESS`).
3. **Codes the requirements imply but do not name.** R4's fail-closed refusal: 503 `INTAKE_UNAVAILABLE`. R9's cross-origin refusal: 403 `ORIGIN_REFUSED` (a missing `Origin` refused too). A steward POST body over 16 KiB: 413 `BODY_TOO_LARGE`. While not yet open, `/withdrawals` and every `/steward` route also answer 503 `NOT_YET_OPEN` (R9's query-string refusal still first).
4. **Paging and windows.** R9 forbids a query string on `/steward/`, so R11's later pages are `GET /steward/reports/<n>` (n >= 2). R4's and R8's "in any hour / day / 15 minutes" are kept with counts only, in fixed sub-windows (10 min for the hour, 1 h for the day, 1 min for the 15 minutes), summing every sub-window that touches the span: never more than the limit in any span, at the cost of refusing up to one sub-window early; `retryAfter` is when enough counts leave the span.
5. **Deploy (R2, R21).** The deploy script is `stewards/scripts/deploy.mjs` (`npm run deploy`): it reads the secret names with `wrangler secret list`, runs `checkOpen` and the account check, and runs `wrangler deploy` only when both pass. Reinstatement is recorded on the ref whose withdrawal it ends and counts as that report's latest decision for R15; a report deleted while its withdrawal stands keeps only its ref, kind, concerns, time and the standing withdraw decision.

## J2 · COMPLETE

**Entry applied:** T45-48 (N895, N892 (e); v0.2 rule 21, D28e; K2799, K2819), with J1's readings as K2880 confirmed. Every id R1–R23 met and named by a test at the interface (the Worker's `fetch` and `scheduled` driven with requests; its own Durable Object over SQLite; a fake mail binding; the deploy script run with a stand-in wrangler). No requirement is deferred.

**Files (for `modules.json`, plan rule 3):** `paths` `["stewards/"]`, `tests` `["stewards/test/"]` (as installer's `newgroup/` and `newgroup/test/`); `uses` unchanged (`instance-setup` for `GROUP_SLUG_RE`, imported from `bio-plane/src/setup-fleet.mjs`; `test-support` for `bio-plane/test/sandbox.mjs`). Every file:
- `stewards/src/index.mjs` (routes, notice, purge entry), `stewards/src/store.mjs` (the `StewardsStore` Durable Object), `stewards/src/config.mjs` (vocabulary, configuration, `checkOpen`, `checkAccount`), `stewards/src/limits.mjs` (windows), `stewards/src/ui.mjs` (pages and words)
- `stewards/scripts/deploy.mjs` (R2: `npm run deploy`), `stewards/wrangler.jsonc` (account pinned; `STORE` v1 SQLite; `NOTIFY`; vars 90/365; daily cron), `stewards/package.json`, `stewards/DEPLOY.md`
- `stewards/guide.md` (the shared guide text, K2878/K2880; BOB reviews its words at merge)
- `stewards/test/fixture.mjs`, `stewards/test/requirements.test.mjs`

**For other modules (none changed):**
- `installer` (T46, N923): R48's third part should be `stewards/guide.md` byte for byte; its R48 test can compare the README with that file.
- `membership`: R83's `MODULE_ORDER` entry for `stewards` is owed (K657, K2799); I did not touch it.
- No generated artifact made stale: `stewards` has no bundle (wrangler bundles at deploy); nothing in the manifest's table reads it.

**Deploy (Bob's acts, not done):** `STEWARDS_ADDRESS` (Bob names it, K2799) and the same address as `NOTIFY`'s `destination_address`; verify it in Email Routing; `NOTIFY_FROM` on a routed domain; the secrets `STEWARD_KEYS` and `SOURCE_KEY`. Until the address is set, `npm run deploy` refuses naming `STEWARDS_ADDRESS` (tested against the committed config).

**Tests and checks** (on `job/T45/stewards` with `tranche/T45` merged; the checks with the `stewards` entry filled as above in a local, uncommitted edit, since BOB fills it):
- `cd stewards && node --test test/`: tests 23, pass 23, fail 0
- `format`: 153 modules, 152 requirements files; 0 failures
- `architecture stewards`: 12 product files, 16 relative imports; 0 failures
- `coverage stewards`: 23 of 23 live requirement ids named by a test; 0 failures
- `ownership stewards tranche/T45`: 13 files changed by stewards; 0 failures
- No layer tests named in the manifest.

Size (session_01L1YejSDpXxWW9J2kjUsHBp): test runs 5, module lines 1666 (837 source, 829 tests)
