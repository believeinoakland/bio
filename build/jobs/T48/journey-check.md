# journey-check (T48)

**Status** · session_01Dgr6P5RQPvQFE2ipVdCcfG · depth 2 · RUNNING until 2026-10-14T15:54:14Z (node --test bio-plane/test/m/journey-check/) · handled B2

## J1 · QUESTION

My readings of R5 and R6, on which I am building now (answer only if one is wrong):
1. R5 "including the acts only an administrator is drawn": acts are drawn and screenshotted, never pressed (R3). The walk fails unless, on every screen, the administrator is drawn every act the member is, and on at least one screen an act the member is not.
2. R5 "no agent proxy": the bootstrap read goes over node:http(s) with its own agent (Node's global fetch follows NODE_USE_ENV_PROXY), and Chromium is launched with `--no-proxy-server` and `--proxy-server=direct://` (measured here: the headless shell ignores `--no-proxy-server` alone and follows an environment proxy).
3. R6: the mock is `layouts.html` read from git at interface-assets' `ASSETS_COMMIT` (its file read as data, never imported), drawn through its `CS_WALK` in screen mode, assistant off, `phone` at 390 and `desktop` at 1280. Each pair is one image, LIVE left and DESIGN right, `pairs/<role>-<screen>-<width>.png` in the arm's output; the report lists them for BOB. A working screen the mock does not draw fails.
4. R6 limits: "tabs not at the viewport's foot" includes no visible `.cs-tabs` at 390 on a working screen; measured at the top and the end of the page. A test band is judged only where drawn (its absence is interface-shell R36's). "A slug": the instance host's first label, a hyphenated lowercase word holding a digit or three or more parts, or a snake_case word; "a language tag": `xx-YY`, `xx-Yyyy`, `xx-419` forms; "a record id": record-grammar's `PREFIX-YYYY-tail` form; "a refusal code": an upper-case word joined by underscores.

## Completion (T48-80)

**Read, whole:** `build/requirements/journey-check.md`; my T48 entries in `build/plan/current.md` (T48-80 and its "also"); layer 11's contract and the helper-module line in `build/layers.md`; all of `bio-plane/src/journey-check/` (journey, run, walker, journeys, screens, guard, account, local, package files); the tests naming the requirements I changed (`journey.test.mjs`, `walker.test.mjs`, `guard.test.mjs`). Of what the entries touch, read as data over HTTP (no module is imported): control-plane's `whoami` answer, interface-shell's frame, band and tabs markup and its `call`, the design mock's `CS_WALK` in `layouts.html` at `ASSETS_COMMIT`, record-grammar's id form; the walk's own account in `build/plan/draft-T48-live-vs-design.md` (WALK-084 #2).

**Entries applied:**
- **R4** `journey.mjs` exports `main(args)` and `isEntry(entry)` and runs the walk only when its own file (through any link) is the process's entry. `--out <dir>` added.
- **R5** The live arm reaches the instance directly: the bootstrap read goes over node:http(s) on its own agent (`directFetch`), and Chromium is launched with `--no-proxy-server` and `--proxy-server=direct://` (the headless shell ignores the first alone, measured). Each role signs in; the walk reads the `whoami` answer the browser receives and fails (`role`) unless the administrator answers `administer: true` and the member `false`; a role that fails stops there. Each role walks every working and dock screen; the administrator must be drawn every act the member is on each screen, and on at least one an act the member is not.
- **R6** `design.mjs`: the mock is `layouts.html` read from git at interface-assets' `ASSETS_COMMIT` (its file read as data), drawn through `CS_WALK` in screen mode, assistant off, `desktop` at 1280 and `phone` at 390, at its own size. Each screen at each width is measured (`wider`, `tabs` at 390 at the top and the end of the page, `band`, `class`, `words`) and paired, LIVE left and DESIGN right, `pairs/<role>-<screen>-<width>.png`; the report lists the pairs for BOB. A working screen the mock does not draw fails (`design`).
- Readings per J1, confirmed by B2 (K3295). One refinement of reading 4: a slug must hold a letter (a date is no slug) and is not a word already found (a record id's tail), and twelve English three-part compounds (`COMPOUNDS`: step-by-step, up-to-date…) are words.

**Flaws fixed in my module:** the R1 test read `journey.mjs`' source text; it is now run (R4's control). The pair image first let flex shrink both drawings, and the mock scaled its drawing to its column; both are held at full size now (a test measures the pair's width).

**Deferred:** none.

**Found in other modules (for BOB):**
1. `interface-assets`: at `ASSETS_COMMIT` 3f40899950 the mock draws none of 10 working screens (places, recovery, group, settings, updates, projects, unavailable, elsewhere, people, help-records), so R6 fails on them until T48-68 moves `ASSETS_COMMIT`; at `main` (135a526703's layouts) all 54 working screens are drawn. My tests draw the mock at the checkout's own commit.
2. Environment, for the release: this container's environment already holds `JOURNEY_ADMIN_HANDLE` and `JOURNEY_ADMIN_PASSWORD` (not printed) but no member credential; the live arm needs both before the release check.

**Tests and checks:**
- `node --test --test-concurrency=1 bio-plane/test/m/journey-check/`: 27 tests, 26 pass, 1 fail (the pair width, then fixed); after the fix `live.test.mjs`: 8 tests, 8 pass. New: `entry.test.mjs` (R4 and its control), `live.test.mjs` (R5, R6 over `fake-plane.mjs`, with controls; the clean walk covers all 54 working screens × 2 roles × 2 widths). No layer tests (manifest).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 21 failures, none journey-check's (`coverage.mjs … journey-check`: 6 of 6 live ids named, 0 failures); `ownership.mjs … journey-check tranche/T48`: 10 files, 0 failures.

Size (session_01Dgr6P5RQPvQFE2ipVdCcfG): test runs 10, module lines 1135
