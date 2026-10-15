# SITE-LAUNCH — log

Lane started 2026-10-15 by BOB #181 (K3385): get civicsmith.org's pages installed and running, and set up the stewards' contact address (N923). Branch `ops/site-launch`. Bob's decisions here are numbered Site D<n>.

## 2026-10-15 · SITE-LAUNCH #1

- Read `build/requirements/site.md`, the `site/` module, stewards R7, N923. Merged `origin/tranche/T49` into this branch (K3386: DEC-270's listing rule, SITE_COMMIT af89fd5931).
- `site/`: `npm ci`, `npm test` — 24 of 24 pass (including the browser test). `wrangler deploy --dry-run`: bundles (1142 KiB, 800 KiB gzip), one binding (`LISTED_GROUPS = []`).
- Account check: wrangler reports account `20b533579290b9b93168345edd3b7f72` only. No Worker named `civicsmith-site` exists yet; no Worker custom domains in the account.
- Zone `civicsmith.org` (`1ce35d60ccfdf2c175f046477f14bace`) is active in the same account.
- The session's Cloudflare token reads Workers but is refused (code 10000) on the zone's DNS records and Email Routing. Step 3 (custom domains) and step 4 (Email Routing) will need the token given those permissions — a Bob act, asked for when those steps open.
- Waiting on Bob: approval of the first deploy to workers.dev (K1715).

## 2026-10-15 · first deploy and page walk (Bob: "Deploy the site")

- Bob approved the deploy in session. `wrangler deploy` from `site/` on this branch (merged with T49): Worker `civicsmith-site`, version `f8645ee6-7433-4310-bc05-6b44e1c327ff`, at https://civicsmith-site.believeinoakland.workers.dev. Only binding: `LISTED_GROUPS = []`.
- Over HTTPS: `/`, `/start`, `/groups` answer 200; `/nonesuch` 404 (in the frame); assets 200. Headers: CSP `default-src 'self'; script-src 'none' …`, `Referrer-Policy: no-referrer`, `X-Robots-Tag: noindex` (STEWARDS_ADDRESS unset, as R6 requires).
- Chromium walk, 1280 and 390 px, all four URLs: no horizontal overflow (scrollWidth equals the viewport); stylesheet, icons and the Source Sans face load from the site itself; menu marks the current page; the front page's sections come in R2's order; "Start a group" has R3's five sections and "Create your group"; "Groups at work" draws the empty state (heading, sentence, note, no rows, the listing rule in a disclosure, DEC-270 wording present). No outside request.
- Not done: a pixel-pair comparison against the design's mock drawings. The module's own browser test does that at SITE_COMMIT (passes); my walk was against the requirements' order and by eye. Screenshots are in the session scratchpad only.
- Defects found: see HANDOFF H1–H3. None blocks the domain step.
- Zone DNS and Email Routing still refuse the session's token (code 10000); needed for steps 3–4.

## 2026-10-15 · H1 and H3 fixed upstream

- BOB #181 (K3390, K3391) reports H1 (doubled stop) and H3 (icon at `/favicon.svg`, `/favicon.ico`) fixed on tranche/T49. Merged `origin/tranche/T49` into this branch; site tests re-run. Not yet deployed: the redeploy needs Bob's approval in session (K1715) and will go with the domain step.
