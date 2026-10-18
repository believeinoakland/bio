# installer (T50)

**Status** · session_01GuAEfsVbFhknN2F67nxATG · depth 2 · COMPLETE · handled B4

## Completion record (INSTALLER #15)

**Entries applied (T50-78, all of `installer`'s):** R57, R59–R73 met; R56 and R58 stay unbuilt (accepted red by name, BOB's B2: they wait on the remote proof; both are `test.todo` in `t50.test.mjs`). Also R17, R32, R41, R42 as R62/R64/R72 amend them (R32 replaced: an account holding a copy is told, not refused). BOB's B2 answers applied: copy facts draw "not known" until N1239 (T51); `installer.update.stopped.foreign` not drawn; R66's bound is 5 minutes (`WAIT_BOUND_MINUTES`, BOB times it in the release walk); ceilings, Containers-off pattern, R65's R2 calls and R67's rollback built as read; R41's dialog is `screen.install.permanent`.

**What #14 left written and #15 finished:** the requirements suite (29 failing → 54/0), `t47` (5/0), `t48` (10/0), `realsize` (4/0), `embed` (23/0), `wizard` (209/0), the new `t50.test.mjs` (R56–R73, each with its control; 16 pass, 2 todo), `newgroup-bundle-fresh` (built through `scripts/build.mjs`'s `bundleText`; `npm run build` now runs that script), the committed bundle rebuilt, the invitation page (`bio-plane/public/newgroup/index.html`) in "team" words, the Claude-plan prerequisite and no tie of the assistant to a container.

**Flaws found in my own module and fixed this job:** (1) `describeCopy` was used and not imported, so the R62 page crashed when it drew a copy; (2) the lock touched at each step ran beside the step's work, which also put the install's live memory over 128 MB at the real size (R33, 141 MB), so each step now waits for its touch (peak now 120 MB of 128 at the real size with the built-in fleet held, installed by `realsize`; the fleet held in memory while the 21 MB plane is uploaded is what leaves the margin small, deferred below); (3) a run that stopped for a new approval could not drop its lock (the permission is revoked), so the same founder's continuation was refused as "one is running" for three minutes: the lock now carries the run's id, the approve-again button carries it as `lock`, `/begin` keeps it as `lk`, and the continuing run takes the lock only from the run it names (R71, R69; tested with a wrong name as the control); (4) the finished panel's parts list named the plane "plane" (R40): it is now "civicsmith".

**Deferred, with why:**
- Memory margin at the real size (120 of 128 MB) with the built-in's own fleet verified and held before anything is created (R71 asks the whole fleet fetched first): holding only hashes and fetching again at upload would halve the fleet's share (about 11 MB) at the cost of a second download; BOB's to want or not.
- Sentences the pages still hold inline in "team" words because no key holds them (REPORT to the design lane, as BOB's B2 (2) says): the present-tense step labels ("Checking the name is free and what your account holds", "Setting up your evidence storage", "Generating your credentials", "Installing the capability workers beside your team's Civicsmith", "Turning on your web address", the logs and verify labels), the stops other than `installer.update.stopped` and the keyed ones, the fallback counts' nouns ("Workers", "container applications", "objects in its evidence storage"), the removed panel's heading, the parts list's heading, the lag sentences, "Short name" labels, "Your team's places" and "Places this installer holds", the invitation page whole (static text equal to the keys' English only for R42's two lines), the update page's "Which installation" block.
- README R48 waits on the address (Bob's).
- The R70 ceilings and the Containers-off pattern, R65's R2 calls (`/r2/buckets/<b>/usage`, `/objects`, `DELETE`), R67's deployments rollback and R66's bound are confirmed in BOB's release walk (B2 (4), (5)).

**Found in another module (REPORT):**
- `setup-words`: `installer.fact.unknown.silent` and `.older` (DEC-328) say "this copy", which R40 (DEC-149) forbids for a team's Civicsmith; the installer reads them by key and does not reword them, and the requirements suite takes those two sentences out of R40's reading. The design lane owns the wording; R40 or the keys should be reconciled (a ruling).
- `instance-setup`: R63 needs the copy's own `op=bootstrap` to state `team_name`, `installed_at`, `last_used_at`, `count_projects`, `count_documents`, `count_published`, `count_members` as flat scalars (N1239, T51); until then every fact draws "not known" and the installer's own counts stand in.
- `build/requirements/installer.md`'s Size paragraph says "about 1,770 lines of source … well under 4,000"; the module is now 3,744 lines in `newgroup/src` (index.mjs 2,681) and 264 in `newgroup/scripts`, 4,008 in all, with 5,865 lines of tests; that is at P6's 4,000, and a split of `index.mjs` (the run steps from the pages and the Cloudflare reads) is the cut BOB may want in T51.
- `docs/development/ux-substrate/screens/words-t48.json` still holds `installer.update.stopped` as three parts; the real list holds it whole; `t48.test.mjs` compares with the file's text and passes.

**Tests and checks run (from `newgroup/` and the process repository):**
- `npm test` in `newgroup/`: `embed: 23 passed, 0 failed`; `wizard: 209 passed, 0 failed`; node test runner over `requirements`, `t47`, `t48`, `t50`, `realsize`: `tests 94, pass 89, fail 0, todo 5` (todo: R13, R24 as before, R48, R56, R58).
- `node --test bio-plane/test/system/newgroup-bundle-fresh.test.mjs`: `pass 1, fail 0` (its four arms PASS; the PIN arm now reads `scripts/build.mjs`).
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: `fleetbundles: 140 pass, 0 fail`.
- `node checks/format.mjs /home/user/bio`: `format: 171 modules, 170 requirements files; 0 failures`; `node checks/architecture.mjs /home/user/bio installer`: `architecture: 28 product files, 84 relative imports (1 naming no tracked file, not judged); 0 failures`; `node checks/coverage.mjs /home/user/bio installer`: `coverage: 1 modules, 73 of 73 live requirement ids named by a test; 0 failures`; `node checks/ownership.mjs /home/user/bio installer tranche/T50`: `ownership: 22 files changed by installer between tranche/T50 and HEAD; 0 failures`.
- No module uses `installer` (modules.json), so no other module's tests were run.

**Generated artifact:** `newgroup/dist/newgroup.bundled.mjs` (installer's own, built by `npm run build`, 130 word rows) is rebuilt and committed; no other module's artifact was made stale. `release.mjs` is unchanged by the embed.

Size (session_01LU7u79LMCH9X9FGKvCQJBU): test runs 48, module lines 4008

## J1 · BLOCKED

BLOCKED (cause: context). INSTALLER #14 is past half its window and stops at a clean point; the work is pushed (job/T50/installer @ 11a3b99f02) and the job record has a 'Progress record' section: what is written, what is left in order, and what I decided on my best reading.

Written: R57, R59-R73 in newgroup/src (cfx.mjs, account.mjs, words.mjs, index.mjs, ui.mjs, images.mjs, scripts/build.mjs, embed now writes RELEASE_MANIFEST). wizard.test.mjs 209/0. Left: bring requirements.test.mjs (27 failing, all from the new names/wording/call order, listed in the record) and t47/t48/realsize/embed/bundle-fresh in line; write the new tests for R57, R59-R73 with controls; rebuild the bundle; the invitation page wording; the four checks; completion record. A restart continues from the record.

Questions for BOB (answer in a CHANGE or ANSWER; my reading in brackets): (1) R63 needs the copy's own op=bootstrap to state team_name, installed_at, last_used_at, count_projects/documents/published/members as flat scalars; today it states only version, so those facts draw 'not known' [instance-setup change, BOB's]. (2) R72: a sentence no key holds stays inline in 'team' words and is reported, rather than dropped [list in the record]. (3) installer.update.stopped.foreign: no rule says what is detected, so it is not drawn [deferred; give the rule or leave to T51]. (4) R66's bound: proposed 5 minutes, untimed (no live install was made) [BOB sets]. (5) R70 ceilings (500 Workers, 500 DO classes, 1000 buckets, 100 container applications) and Containers-off message, R65's R2 usage/objects/delete calls and R67's deployments rollback are unconfirmed on a real account [confirm at the remote proof]. (6) R41's dialog now reads screen.install.permanent, which drops 'the name of its worker' [the key is the design's]. Also for the design lane: keys missing for present-tense step labels, the update stops other than the refused-upload one, fallback-count nouns, the removed panel and parts list headings (list in the record).

## J2 · COMPLETE

COMPLETE. INSTALLER #15 applied the T50-78 entries: R57 and R59-R73 met; R56 and R58 stay unbuilt (accepted red by name, test.todo). Work pushed on job/T50/installer; the completion record in build/jobs/T50/installer.md has the detail.

Tests and checks: npm test in newgroup/ — embed 23/0, wizard 209/0, node tests 94 (89 pass, 0 fail, 5 todo); newgroup-bundle-fresh 1/0 (its PIN arm now reads scripts/build.mjs); fleetbundles 140/0; format, architecture, coverage (73 of 73 live ids named) and ownership all 0 failures.

Four flaws in my own module found and fixed: describeCopy was not imported (the exists page crashed), the lock touch ran beside big uploads (it put the install at 141 MB against the 128 MB bound; now 120 MB at the real size), a revoked grant could not drop its lock so the founder's approve-again was refused as "one is running" for 3 minutes (the lock now carries the run's id and the approve-again continuation names it), and the parts list said "plane".

For BOB: (1) setup-words keys installer.fact.unknown.silent/.older (DEC-328) say "this copy", which R40 (DEC-149) forbids; I read them by key and the R40 test takes those two sentences out — a ruling to reconcile. (2) Present-tense step labels, several stops, fallback-count nouns and some headings have no key and stay inline in "team" words (listed in the record, for the design lane). (3) The module is now 4,008 lines (src 3,744 + scripts 264), at P6's 4,000; the requirements' Size paragraph says 1,770 — update it; a split of index.mjs is the cut for T51. (4) Memory at the real size is 120 of 128 MB because the whole fleet is fetched and held before anything is created (R71); holding hashes and fetching again at upload would give margin back at the cost of a second download — yours to want or not. (5) Still waiting on you: README R48's address, copy facts N1239, the release-walk confirmations (B2 (4), (5)).

## J3 · REPORT · re B3

REPORT re B3: already met by J2's work (pushed at 0a6e2d9c9e). The pages / and /callback say 'team' ('Create your Civicsmith team', 'Your team's short name', 'Neighborhood and issue groups' from the public-read key); R72's test asserts no served page says 'group' for a team. The only 'group' left in served text is R18's 'which group produces your record' (the recorded-group sense instance-setup keeps). No code change; tests unchanged and green.

## Completion record (INSTALLER #16, B4 · CHANGE, K3793)

**Entry applied:** a container member R38 leaves out is not a failed upload for R15. `installFleet` marks a container member's `left` entry `out` when its upload was never attempted (image unpullable or unpinned, no Containers scope, not Workers Paid, a missing or unreadable part); it is named once at the fleet step with `withLacks` (why, and `lacksOf`), and `failedLags` skips an `out` entry, so `servingVerdict` and `verifyServing` no longer hold for it. A member whose upload was attempted and failed (`attempted` set before its upload) stays a lag (DIST-6); a non-container member that fails before upload stays a lag. A plane reading of a left-out member as UNBOUND was already no lag (`servingVerdict` names UNBOUND only for a member this act installed).

**Tests:** `t50.test.mjs` "R15 R38 (K3793)": a release with both container members on `ghcr.io/…@sha256:<hex>`, install and update, confirms (verify ok), names `agent-runner` and `file-scanner` once each with R38's reason and what the copy lacks, every other member serving; control: a member whose upload fails holds the verdict and is named. It fails (0 pass, 1 fail) on the code before this change. `realsize.test.mjs`'s `finished` encoded the old behaviour (verify "no" with both members as lags on the real fleet): it now expects verify ok, the success panel, and both members named at the fleet step.

**Ran:** `npm run build` (bundle rebuilt, 130 words); `npm test` in `newgroup/`: `embed: 23 passed, 0 failed`; `wizard: 209 passed, 0 failed`; node test runner `tests 95, pass 90, fail 0, todo 5`; `node --test bio-plane/test/system/newgroup-bundle-fresh.test.mjs`: `pass 1, fail 0`; `fleetbundles: 140 pass, 0 fail`. Checks: `format: 171 modules, 170 requirements files; 0 failures`; `architecture: 28 product files, 84 relative imports (1 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 73 of 73 live requirement ids named by a test; 0 failures`; `ownership: 0 failures` (run on the committed branch below).

**Deferred / found elsewhere:** nothing new; the deferrals and REPORTs of #15's record above stand.

Size (session_01GuAEfsVbFhknN2F67nxATG): test runs 6, module lines 3756

## J4 · COMPLETE

COMPLETE for B4 (K3793). A container member R38 leaves out (unpullable or unpinned image, no Containers scope, not Workers Paid, missing part) is named once at the fleet step with why and what the copy lacks and is no lag; a member whose upload was attempted and failed stays a lag. New test in t50 (ghcr release confirms on install and update; control: failed upload holds the verdict) fails before the change. realsize.test.mjs's 'finished' encoded the old behaviour and now expects verify ok. npm test 95 tests, 0 fail; bundle rebuilt; newgroup-bundle-fresh 0 fail; fleetbundles 140/0; format, architecture, coverage (73 of 73), ownership 0 failures. Record: build/jobs/T50/installer.md. Size (session_01GuAEfsVbFhknN2F67nxATG): test runs 6, module lines 3756.
