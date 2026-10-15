# SITE-LAUNCH — log

Lane started 2026-10-15 by BOB #181 (K3385): get civicsmith.org's pages installed and running, and set up the stewards' contact address (N923). Branch `ops/site-launch`. Bob's decisions here are numbered Site D<n>.

## 2026-10-15 · SITE-LAUNCH #1

- Read `build/requirements/site.md`, the `site/` module, stewards R7, N923. Merged `origin/tranche/T49` into this branch (K3386: DEC-270's listing rule, SITE_COMMIT af89fd5931).
- `site/`: `npm ci`, `npm test` — 24 of 24 pass (including the browser test). `wrangler deploy --dry-run`: bundles (1142 KiB, 800 KiB gzip), one binding (`LISTED_GROUPS = []`).
- Account check: wrangler reports account `20b533579290b9b93168345edd3b7f72` only. No Worker named `civicsmith-site` exists yet; no Worker custom domains in the account.
- Zone `civicsmith.org` (`1ce35d60ccfdf2c175f046477f14bace`) is active in the same account.
- The session's Cloudflare token reads Workers but is refused (code 10000) on the zone's DNS records and Email Routing. Step 3 (custom domains) and step 4 (Email Routing) will need the token given those permissions — a Bob act, asked for when those steps open.
- Waiting on Bob: approval of the first deploy to workers.dev (K1715).
