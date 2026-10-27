# S1: seeding and run steps for the scratch copy `plat-s1` (draft)

**Status** · PLAN for BOB, PLATFORM #1, 2026-10-27. Copy `plat-s1` (Level 1, no store options, unjurisdictioned), built from `tranche/T53` 14b73ea14e by the repository's deploy-test workflow, account `20b533579290b9b93168345edd3b7f72` only (K5434). Nothing here touches biosmoke8 or any team's copy. The route is the agent proxy only (K4733); figures are net of it (P18).

## 0. What I need from BOB first

1. **The copy's URL and a team on it.** A fresh test copy holds no team. BOB says how the repository sets one up on a deploy-test copy (the installer's own path, or the operator route) and gives me an **administrator** and a **member** by environment variables `PLATS1_ADMIN_HANDLE`, `PLATS1_ADMIN_PASSWORD`, `PLATS1_MEMBER_HANDLE`, `PLATS1_MEMBER_PASSWORD` (never printed, never written to a file; as `journey-check`'s `signin.mjs` reads `JOURNEY_*`).
2. **Later, one redeploy** of the same copy from branch `proto/levels-2-3` (the `deploy-test/plat-s1/deploy` route, pushed by BOB, K5434) once my workers have added the throwaway measuring ops (§3). The room and its data persist; only the code changes.

## 1. The order of runs

| step | what | measured |
|---|---|---|
| **1a Empty team** | the eight screens of P23 (Home, Queue, Project, Held, Inbox, Document, Add, Projects) as administrator and member, 1280 px, 5 runs each, quiet copy | the floor: net median and p90, hops, requests (the old lane's `probe.mjs`, `ops.mjs`, `post.mjs`, `nav.mjs`, copied into `proto/levels-2-3/tools/`) |
| **1b Seed A, the test copy's size** | about 500 documents, 535,000 text units, a database near 0.4 GB, R2 near 2 GB, mixing: public pages and PDFs by `acquire` (the govinfo budget PDFs, Legistar People and Departments, iana pages, with fresh `?plat=…` query strings; the old lane's list) and generated files uploaded by the product's own add act (text, CSV, DOCX, XLSX of known sizes: `seed-gen.mjs`, deterministic, no real person's data) | the same eight screens again; `stats` (`dbBytes`, documents, text units); seeding's own time and cost |
| **1c Seed B and C** | the database at about 2 GB and about 6 GB (the gauge's 70 % of 10 GB, G42), in two mixes: **text-heavy** (large CSV, text and JSON up to the alpha's 17 MiB CSV and 24 MiB PDF bounds) and **scan-heavy** (PDFs of page images read by OCR; slow, 1.5-5 s a page, so sized by pages, a few hundred) | screens and ops at each size; where a screen first misses its class (`time-budgets-draft.md`); rows read per op |
| **1d Per-table bytes and rows per op** (needs the §3 ops) | bytes per table (SQLite `dbstat`, or a row-length sum if `dbstat` is unavailable in the object: UNCLEAR) at each size, rows read and written per op by table, and which promotions write outside their project | the shares B and C need: what part of the database `capture_text`, the full-text tables and `readings` are; which reads dominate the 4,800 rows a call; the share of calls that are member-private (D) or cacheable (C) |
| **1e Ramp** | the load profile of `load-test-draft.md` §3 at 5, 10, 15, 25, 40 members, 10 minutes a step, with one large file reading in the background, at Seed A and Seed C | members at once where p90 breaks the class; the door window's wait; Worker and room CPU and rows from Cloudflare's analytics (`tools/cf/gql.sh`, read-only) |
| **1f Container and per-type load** | P-M17 (container cold start, R2 to container, idle cost) first; then FILES' L1-L6 as FILES specifies them | FILES' unmeasured cells |
| **1g Charges** | the account's usage for the copy before and after each seed and run (rows written are the first charge past $5, P17) | cost per seed and per ramp |

## 2. Safeguards (all steps)

- Only `plat-s1`, only account `20b533579290b9b93168345edd3b7f72`; if `wrangler` or the API names another account, stop and tell BOB.
- The driver has a member cap (40), a request-rate cap and a stop at the first step that breaks a budget at p90 or fails over 1 % of ops; it never loads a copy it did not seed; a run's cost is estimated from the seed run before the next larger run, and I stop if a step would pass **US$25** without BOB's word.
- Seeding uses the product's own acts (never rows written past the plane) and only generated or public documents; no personal data.
- No step is run when `plat-s1` has another user (the copy is mine for the study); a noisy figure is repeated, medians of at least 5, ranges stated.
- Credentials only by variable; nothing is printed or committed.

## 3. The throwaway measuring ops (on `proto/levels-2-3`, never merged)

Read-only ops added to the plane in the prototype branch only: `tablebytes` (bytes and row counts per table; `dbstat` if available), `opcost` (rows read and written per op by table, counted in the store's wrapper), and a counter of the tables written outside the promoted bundle's own project during `transact`. They are administrator-only and answer from the room without changing it. Built by my workers from `tranche/T53` 14b73ea14e, tested by the existing suite, then BOB deploys the branch to `plat-s1` (§0, 2). Step 1a-1c do not need them.

## 4. What it yields

For each size: the screens' and ops' times against the classes, bytes per table, rows per op, the ramp's ceiling, the charges; and from them, B's gain (what leaving the room removes), C's (what a cache of the shared reads removes), D's, and A's cost on paper. These are the figures of the report to Bob (`levels-2-3-study-plan.md` S4).
