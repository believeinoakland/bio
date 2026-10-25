# following (T51)

**Status** · session_017RAWf5wK7x8JvjByQ7CkS3 · depth 2 · COMPLETE · handled B5

## J1 · REPORT

Findings outside this module's code (nothing here is changed by this job):

1. `docs/development/ux-substrate/screens/words-reads.json` (the design's generated list, `following` section, built from T49) lacks five refusal keys that `words.json` holds and following reads: `refusal.MARK_NO_ITEM`, `refusal.MARK_NO_SUCH_ITEM`, `refusal.SECOND_LOOK_NO_NOTE`, `refusal.SECOND_LOOK_NOT_OPEN` (read through `checks.mjs`' `row()`, T50's rows) and `refusal.MACHINE_CANNOT_MARK` (read by `index.mjs` through `word()`). Each is in `bio-plane/src/setup-words/rows.mjs`. The file is generated and was not edited; BOB to regenerate it.
2. `node bio-plane/src/setup-words/build.mjs --check` reports `rows.mjs` stale. The note names this job's new `following.index.*` ids (the expected stale-rows note). It is not a refusal.
3. `node checks/run.mjs /home/user/bio` reports failures in other modules (wizard-scripts testcopy and others; coverage 24 failures across modules). None names `following`. `words.mjs` over monitoring, following, link-sweep and scheduler has no finding naming following.

Nothing deferred. No flaw found in another module's code.

## J2 · COMPLETE

Applied T51-155 (B1):
- The 45 `plain` findings in `index.mjs` are each read through `localize("following.index.<slug>", en, vars)`, the slugs listed in the commit's diff. The refusals and their codes are unchanged.
- The 2 test copies are fixed in `test/m/following/fixture.mjs`: the provenance sentence and the matter-not-of-plan detail are `localize` calls under `following.fixture.*` ids.
- The entry's read-key item: `following.unscheduled.read_member_act` and `following.why.key_repeated_row` are held in `rows.mjs` and read by the module; the five refusal keys the design's list lacks are in REPORT.

Deferred: none.

Tests (run from `bio-plane`): `node --test test/m/following/`: 112 pass, 0 fail, before and after the fixture fix. No layer tests named in the manifest.

Checks (process repo, against /home/user/bio on `job/T51/following`):
- `checks/format.mjs`: 176 modules, 0 failures
- `checks/architecture.mjs following`: 0 failures
- `checks/coverage.mjs following`: 35 of 35 live ids named, 0 failures
- `checks/ownership.mjs following tranche/T51 job/T51/following`: 0 failures
- `checks/words.mjs following`: 0 failures
- `checks/words.mjs monitoring following link-sweep scheduler`: no finding names `following`
- `checks/run.mjs`: no finding names `following` (other modules' failures in REPORT)

Size (session_01UBHjrsbnMdNqWryj6ZQxAG): test runs 2, module lines 2197

## J3 · REPORT

Findings outside this module's code (nothing here is changed by this job):

1. `node checks/run.mjs /home/user/bio` (full run, after the commit): coverage reports 4 live ids named by no test, all in other modules. `agent-harness` R17; `agent-runner` R37, R38, R40; `installer-steps` R26, R31; `journey-check` R19. None is `following`. Not touched here.
2. `node checks/run.mjs` also reports architecture and format as clean; words, channels and ownership report 0 failures.

Nothing deferred. No flaw found in another module's code by this job.

## J4 · COMPLETE

Applied B2 (CHANGE, the R1 red at `checks.test.mjs`, tests only; commit 8d76643e0c on job/T51/following):

- Cause: `otherFamilies()` imports every plane file. `plane/store.mjs` and `plane/index.mjs` reach `plane/register.mjs` (R68), which throws (`op-declarations: adminendorse: registered after the first read (R81)`) if a table was read before its first import. The walk had read one.
- Fix (test only): `otherFamilies()` imports `bio-plane/src/plane/register.mjs` first, before the walk, as the plane's own graph does. I first tried skipping `register.mjs` in the walk; that did not work, because the plane's other files import it transitively.
- No source file, no requirement line changed. No test weakened: the C-137.1–20 walk and every row test are as before.

Deferred: none.

Tests (`bio-plane/`): `node --test --test-force-exit test/m/following/*.test.mjs`: 115 pass, 0 fail. `checks.test.mjs` alone: 33 pass, 0 fail, including `R1 C-137.1–C-137.20` (the walk) and `R18`, `R4`.

Checks (process repo, against /home/user/bio on job/T51/following):
- `checks/format.mjs`: 175 modules, 175 requirements files, 0 failures
- `checks/architecture.mjs following`: 0 failures
- `checks/coverage.mjs following`: 36 of 36 live ids named by a test, 0 failures
- `checks/ownership.mjs following tranche/T51 job/T51/following`: 0 failures
- `checks/words.mjs following`: 0 failures
- `checks/run.mjs /home/user/bio`: no finding names `following`; four other modules' coverage gaps are in REPORT.

Size (session_01CGcpL8Q6GG6DotmRFDtXaz): test runs 6, module lines 2210

## FOLLOWING #12 · G21 (START B3, fix round 6 wave 2; K4571)

**(1) Root cause.** `#readBody` (`following/index.mjs`, was :700-755) made one pass of at most `BODY_READ_FETCHES` (200) fetches, the events and matters lists as one address each (`nextPage`/`$skip` never followed, `legistar.mjs:69-79`), and on the bound only set `truncated: true` on the tick's read record. The next tick began the same pass from the first address, so an unchanged fetch counted against the 200 again: nothing past the first 200 fetches was ever read, and the member was told nothing.

**(2) Why the tests missed it.** No requirement said a bound must reach the member and no test drove a body past 200 fetches or a list past 1,000 rows. Gap fixed by the two tests below.

**(3) Failing-first, through `followBody` and `followTick` (the module's real entry), 120 meetings with one item and one vote each, 1,500 matters over two Legistar pages, stubbed:**
- Red before the change (a scratch run of the same stub, 11 ticks): 200 fetch calls in all (each tick repeated the same 200), page 2 of matters never read, 0 of 1,500 matters fetched. The test itself was red at its first status assertion (`body_read` absent).
- Green after: `body.test.mjs` "R2 (G21) a body of 120 meetings and 1,500 matters…": the tick's `truncated` said, status `whole: false` with `read < total = 120`, due again at the next minute; then, over ticks, `{read: 120, total: 120, more: false, whole: true, phase: "done"}`, all 120 meetings written, page 2 and every matter read; then not due until the cadence.
- A second test, "R2 (G21) one meeting whose items need more fetches than a tick…": 250 items in one meeting (more than one tick's fetches) read across two ticks by the item cursor; the next day's pass starts again from the first page (two fetches, `unchanged`).

**What changed.**
- `schema.mjs`: `follows.body_cursor TEXT` (in the table, and added to a table made before it by `migrateFollowing`). Old data: a follow read before this has no cursor and its next pass is whole and continues; no repair.
- `index.mjs` `#readBody`: the pass walks the events pages then the matters pages by `page.next` (legistar-reader's own `nextPage`), keeps `{phase, addr, idx, vi, base, size, got, walk, more, meetings}` when the fetch bound is reached, and goes on from it at the next tick from the held page bytes; a pass is whole when the matters pages end. A list of items or votes that itself continues past one page (1,000 rows; none exists in practice) is a `failed` entry `PAGE_LIMIT`, never read in part silently. `bodyProgress` (exported) turns the cursor into the answer. `#readFollow`, `#nextDue`, `#followPlan`: a body whose read is not whole is due at the next tick (FINISHED-LATER) and its `last_read` stays the last whole read. `follows()`: each body follow answers `body_read: {read, total, more, whole, phase}` (`null` before a first read); `more: true` while a further page of meetings is not yet taken (the total unknown). The tick's read record gains `meetings` (the same) and keeps `truncated: true` when that tick stopped at its bound.
- No census op's accepted keys change; no new sentence a member reads (the screen says "read N of M meetings" from `body_read`).

**(4) Platform check:** N.

**Words owed (stand-in, for the design, B485):** a body follow's line "read {read} of {total} meetings" (and "read {read} meetings so far, more to come" when `more`); "reading the matters" for `phase: "matters"`. `body_read` carries the numbers; no row is minted here.

**Requirement lines proposed (BOB writes them).** R2 gains: "A tick that reaches its fetch bound (200) keeps where it stopped, and the next tick goes on, following every page of every Legistar list (`nextPage`), until the read is whole; the follow is due at the next tick while it is not. `follows` (R14) answers per body follow `body_read: {read, total, more, whole, phase}`: the meetings read of those counted so far, `more` while a page is not yet taken." R12: a body follow whose read is not whole is due now. R14 amended as above. Test names: the two tests above (R2).

**Observed, unchanged (not this entry):** a page of a list whose bytes equal the last pass's is not walked again (its rows were walked then); a fetch that failed in the previous pass is retried only when its page changed. Same as before this job; BOB may want it as its own entry.

**Suite and checks.** `node --test --test-force-exit bio-plane/test/m/following/`: 118 pass, 0 fail. Scheduler and notice-producers (the callers of `followTick`/`followDue`/`follows`): 278 pass, 0 fail. `build/plan/impact.mjs origin/tranche/T51 HEAD`: names 16 modules because `DECLARED_OPS` sits in the changed file (unchanged by this job); the callers were run. Process checks (`checks/run.mjs`): format 0, architecture 0, coverage 0 (6,623 of 6,623 ids named), channels 0, words 0 (inline 0, plain 0, testcopy 0). `checks/ownership.mjs following tranche/T51 job/T51/following`: 0 failures.

Size (session_01RqXFza4HAdeS4MWPxQeGug): test runs 9, module lines 2281

## J5 · COMPLETE

G21 applied: a followed Legistar body is read whole across ticks by cursor (every page of events and matters; 200-fetch bound continued, not silent); follows() answers body_read {read,total,more,whole,phase}. Failing-first: 120 meetings + 1,500 matters over two pages (red: 200 fetch calls in all, 0 matters, page 2 never; green: whole in a few ticks) and a 250-item meeting. following 118 pass 0 fail; scheduler+notice-producers 278 pass; checks run: format/architecture/coverage/channels/words 0 failures; ownership 0. No REPORT, nothing deferred. Words owed (stand-in): 'read N of M meetings'. Requirement lines proposed in the record (R2, R12, R14). Size (session_01RqXFza4HAdeS4MWPxQeGug): test runs 9, module lines 2281.

## FOLLOWING #13 · G46 (START B4, fix round 6; K4666, K4669, K4571, K4639)

**Providers' state.** None needed: this entry is mine alone; no seam test waits for another job. Merged `tranche/T51` first (52d18a2f2a); the container's branch was stale and was replaced from origin as B4 says.

**Step 1: does a failed tick leave the capture stored? Yes.** `#take` writes `follow_reads` (`INSERT OR REPLACE`, `index.mjs` `#take`, after the landing) before `#readPortal` inserts the snapshot; the throw of the snapshot insert is caught by `followTick` as `failed` and nothing undoes `follow_reads`. The next tick's `#take` finds `held.capture_sha === sha` (`t.same`) and `#readPortal` answered "unchanged" without writing a snapshot, so a follow that failed once for this cause could never recover.

**(1) Root cause.** `#readPortal` bound `JSON.stringify(ds.rows)` as one value in `portal_snapshots.rows`; the JSON is about twice the CSV (the header keys repeat in each row object): 3,067,862 B for the 1,500,035 B / 24,121-row CSV (my run of the generated shape: 2,669,073 B at 23,831 rows in the probe), over the platform's 2,098,176 B from about 1.0 MB of CSV. **(2) Why the tests missed it.** `snapshot.test.mjs` and the portal arms used datasets of a few rows, and node:sqlite has no value limit; the preload (TEST-SUPPORT #9) now refuses it, and `g46-portal.test.mjs` is the size gap fixed.

**(3) Changed.**
- `src/following/schema.mjs`: table `portal_snapshot_parts(follow_id, seq, part, bundle_id, chunk)`, PK `(follow_id, seq, part)`; `FOLLOWING_TABLES` gains it with `portal_snapshots`' class (`keys: ["bundle_id"], sight: "source"`, purge `clear`), so a purge of the bundle clears it. `migrateFollowing` creates it (`IF NOT EXISTS`): an existing object gains it at its next start.
- `src/following/snapshot.mjs`: `PORTAL_ROWS_INLINE_MAX` 524,288, `PORTAL_PART_CHARS` 262,144 and the pure `storedRows(rows)` (at or below the inline max the JSON byte for byte and no pieces; above it the marker `{"parts","bytes","rows"}` and pieces of at most 256 Ki characters that never end in half a surrogate pair). Re-exported by `index.mjs`.
- `src/following/index.mjs`: `PORTAL_PARSE_MAX_BYTES` (4 MiB, below); `#readPortal` checks the capture's byte length before decoding and, above the bound, writes the snapshot with `rows` NULL and a `why` from `localize("following.index.snapshot_over_parse_bound", en, {size, bytes, bound})`; writes the row and its pieces in one `record.transact` (an injected throw leaves neither); a `t.same` read with no snapshot of that capture writes it once (R-OLD); `#rowsOf(snap)` joins the pieces (null when the pieces are not all held) and `snapshotDiff` reads through it (the only reader of `rows`; `snapshots()` does not select it). An older row stays whole and is read as before.
- `test/m/following/g46-portal.test.mjs` (9 tests), `test/m/following/g46-workerd.probe.mjs` (platform check L).

**(4) Failing-first, through the real `followTick` (`g46-portal.test.mjs`, under the preload).** Red on the unfixed code: 9 of 9 fail; the first (the 1,500,035 B CSV, 24,121 rows) fails at its first assertion with the tick `failed: [{reason: 'string or blob too big'}]` and no snapshot; the others fail on `no such table: portal_snapshot_parts` or the missing constants. Green after: 9 of 9. They cover (a) the 1.5 MB CSV: `captured`, snapshot 1, listed with no `why`, a second snapshot (one changed, one added, one removed) diffed to exactly that, stored rows equal `readDataset(bytes)`, largest bound value under 1 MiB; (b) controls: a 3-row dataset and a 250 KB CSV stored in `rows` alone, byte for byte, no pieces; (c) the boundary pair at `PORTAL_ROWS_INLINE_MAX` (exactly: inline; +1 byte: pieces with the marker) and at `PORTAL_PARSE_MAX_BYTES` (exactly: read; +1: `rows` NULL, `why` carries the size and the bound, `snapshots()` and `snapshotDiff` state it, capture cited); (d) a `features` JSON dataset in pieces; a surrogate pair at the piece boundary; (e) the repair (a held capture without its snapshot is written once; a third read answers "unchanged"); (f) a purge of the bundle clears row and pieces; (g) a rejected dataset unchanged; (h) a throw while the second piece is written leaves neither row nor piece, and the next read writes the snapshot.

**The measure, `PORTAL_PARSE_MAX_BYTES` (BOB's to report to Bob, K1881).** Child `node --import platform-sqlite --max-old-space-size=<cap>` running the real tick (and, for the diff, a second tick and `snapshotDiff` of the two snapshots) over a CSV of 62-byte rows, five columns (the J7 shape); the lowest cap that survives, found by bisection, against the object's real-shape cap (K4626: 167 MB less the file in MB; the fixture's own copies of the bytes make these figures slightly high):
| capture | tick | tick + diff of two snapshots | x1.2 | real-shape cap |
| 1.5 MiB | 97 | | 116 | 166 |
| 3 MiB | | 113 | 136 | 164 |
| 4 MiB | 134 | 134 | 161 | 163 |
| 5 MiB | | 153 | 184 | 162 |
| 6 MiB | | 171 | 205 | 161 |
| 8 MiB (7.99) | 205 | | 246 | 159 |
So the candidate 8 MiB does not hold; **4 MiB is the largest size at which the tick and the diff survive with the 1.2x margin** (161 against 163). Rows of about 10 bytes (a two-column CSV) cost more a byte: 3 MiB diff survives at 146 (x1.2 = 175, over 164) and 4 MiB at 173, so a capture of very short rows over about 2.5 MiB would not keep the margin; the bound is set from the J7 shape, as the START says. Above 4 MiB the snapshot states it and the capture is held whole. **Share of portal datasets reachable:** none; this session holds no live follows and no corpus of portal captures (the repository holds the requirements and plans only), so no share can be counted; BOB asks Bob for the live portals' sizes.

**Platform check L (Miniflare, real DO SQLite, `g46-workerd.probe.mjs`).** The object creates this module's tables with `migrateFollowing`, reads the posted CSV with `readDataset`, stores it with `storedRows` in one `transactionSync` with the module's own statements, joins and parses it back, restarts Miniflare over the same storage and reads again. 1.5 MiB CSV (23,831 rows): rows JSON 2,669,073 B, 11 pieces, the marker `{parts: 11, bytes: 2669073, rows: 23831}`, the last row read back, the largest bound value 262,144 B, the same after the restart. 4 MiB (63,550 rows): rows JSON 7,117,601 B, 28 pieces, the same. The tick itself (monitoring, capture, events) cannot be composed in the probe; it ran in node under the preload, which refuses a bound value over 2,098,176 B as the platform does.

**Census ops:** none of the ops I own changes its accepted keys (the change is inside the tick and the stored rows; `snapshotdiff`'s and `snapshots`' keys and answers are unchanged, except a snapshot above the bound now answers its `why`).

**Words.** One new sentence, `localize("following.index.snapshot_over_parse_bound", en, {size, bytes, bound})`, a code-origin stand-in; the row is owed to UX-DESIGN to word (BOB regenerates `rows.mjs`; `setup-words build.mjs --check` names it as the expected stale note, not a refusal). `words.mjs following`: 0 failures.

**Requirement lines proposed (BOB writes `build/requirements/`).**
- R10 append: "A snapshot's rows are stored whole when their JSON is at most 524,288 bytes (`PORTAL_ROWS_INLINE_MAX`), byte for byte; above it they are stored in pieces of at most 256 Ki characters in `portal_snapshot_parts`, written with the snapshot row in one transaction, so no stored value passes 1 MiB; a snapshot stored earlier stays whole. A capture over 4 MiB (`PORTAL_PARSE_MAX_BYTES`, checked on its byte length before it is decoded) is not parsed: the snapshot is written with no rows and a `why` stating its size and the bound, the capture held whole and cited (K1881, protective). A read whose capture is held but has no snapshot writes the snapshot once instead of answering unchanged."
- R11 append: "`snapshotDiff` reads a snapshot's rows whole or joined from its pieces; a snapshot with no rows is `undetermined` with its `why`, as before."
- R17 append: "`portal_snapshot_parts` is declared with `portal_snapshots`' classes (keys `bundle_id`, sight `source`, purge `clear`)."

**Suites and checks.** following (under the preload): 127 pass, 0 fail (9 new). Users run: scheduler 151/0, promotion 152/0 (row-census green), op-declarations 247/0, plane 354/2 (the two are the accepted reds by name: `release` R24 and `l77-size` R77 L). Process repo: format 0, architecture 0, coverage 36 of 36 ids, ownership 0, words 0 (following; and with monitoring, link-sweep, scheduler), `checks/run.mjs` 0 failures; `setup-words build.mjs --check`: stale-rows note naming `following.index.snapshot_over_parse_bound` (expected, not a refusal). Protective bound for BOB to report to Bob (K1881): `PORTAL_PARSE_MAX_BYTES` 4 MiB (candidate 8 MiB did not hold), `PORTAL_ROWS_INLINE_MAX` 524,288 B, piece 256 Ki characters. No seam test red; nothing deferred.

Size (session_01QjU7Wn9EN1hqzzBdD8DJR6): test runs 14, module lines 2260

## J6 · COMPLETE

G46 complete on job/T51/following. Portal snapshots over 524,288 B are stored in pieces (portal_snapshot_parts, one transaction), a capture over PORTAL_PARSE_MAX_BYTES (4 MiB by measure, not 8) is stated, a held capture without snapshot is written once. following 127/0 (9 new, red then green); users: scheduler, promotion, op-declarations green, plane 354/2 (accepted reds). Checks 0 failures. Protective bounds to report to Bob: 4 MiB parse, 524,288 B inline. No portal corpus reachable for the share. Detail, measures, proposed R10/R11/R17 lines in build/jobs/T51/following.md.

## FOLLOWING #14 · COMPLETE (START B5, fix round 10, Wave A batch 5)

Tests only; no source file, no requirement line changed.

**Published fixture.** `bio-plane/test/m/following/fixtures.mjs` (new): `watchedByRefusal`, the real `following.watchedBy` answer `MARK_NO_SUCH_ITEM`, called by `fixtures.test.mjs`. (Users now: notice-producers 1; they re-point in their own job.)

**Own lines re-pointed (13 of 13 in B5's list; FIX-E providers merged).**
- promotion/registrars (fixture.mjs:66): the unused `promotionStub` is removed (nothing called it).
- acquisition/acquireRefusals (fixture.mjs:132): the capture stand-in returns `acquireRefusals({kind:"fetch_failed"})`.
- standards/standardRead (:212): NO_SUCH_STANDARD from `standardRead().absent`, with the asked id.
- duties/occurrences (:260): NO_SUCH_DUTY from `occurrences().absent`; the duty read in `watches.test.mjs` now passes `asOf` (duties' `AS_OF`, K5070).
- plan-work/watchReaderRegistrar (:268, :269): LISTENER_MALFORMED and LISTENER_DECLARED from `watchReaderRegistrar()` (`noModule`/`noReader`/`again`, module named as the stand-in holds it).
- answers/standingQuestions (:298, :304, :305): NO_SUCH_STANDING_QUESTION (end and end-set) and STANDING_ENDED from `standingQuestions()`, with the asked id.
- retrieval-browse/marksRegistrarDeclared (marks.test.mjs:215): `retrieval-browse` is not in following's `uses` (architecture refused the import), so the refusing door is the real retrieval's `registerBrowseMarks`, which following already registered with at start (a delegating wrapper); the answer is retrieval's real LISTENER_DECLARED. BOB may add `retrieval-browse` to `uses` if the published fixture is wanted instead.
- standards/standardsIn (watches.test.mjs:320, 592, 635): `NO_STANDARDS = standardsIn()` from standards' fixture.

**Left (1, as B5 said):** fixture.mjs:179 `monitor` op table (FIX-E, provider monitoring); it arrives as a CHANGE.
**Markers added:** no `fixtures-own`, no `fixtures-generic`, no `fixtures-contract`.

**Tests.** `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/following/`: 128 pass, 0 fail. `impact.mjs origin/tranche/T51 HEAD`: 0 affected modules, 0 test files.
**Checks.** `fixtures.mjs . following`: 1 failure (the monitoring line above); `format`: 178 modules, 0 failures; `architecture following`: 0 failures; `coverage following`: 36 of 36 ids, 0 failures; `words following`: 0 failures; `ownership following tranche/T51 job/T51/following`: 0 failures. `run.mjs`: no finding in following but the monitoring line; other modules' fixture findings are theirs.

Size (session_017RAWf5wK7x8JvjByQ7CkS3): test runs 6, module lines 2210

## J7 · COMPLETE

## FOLLOWING #14 · COMPLETE (START B5, fix round 10, Wave A batch 5)

Tests only; no source file, no requirement line changed.

**Published fixture.** `bio-plane/test/m/following/fixtures.mjs` (new): `watchedByRefusal`, the real `following.watchedBy` answer `MARK_NO_SUCH_ITEM`, called by `fixtures.test.mjs`. (Users now: notice-producers 1; they re-point in their own job.)

**Own lines re-pointed (13 of 13 in B5's list; FIX-E providers merged).**
- promotion/registrars (fixture.mjs:66): the unused `promotionStub` is removed (nothing called it).
- acquisition/acquireRefusals (fixture.mjs:132): the capture stand-in returns `acquireRefusals({kind:"fetch_failed"})`.
- standards/standardRead (:212): NO_SUCH_STANDARD from `standardRead().absent`, with the asked id.
- duties/occurrences (:260): NO_SUCH_DUTY from `occurrences().absent`; the duty read in `watches.test.mjs` now passes `asOf` (duties' `AS_OF`, K5070).
- plan-work/watchReaderRegistrar (:268, :269): LISTENER_MALFORMED and LISTENER_DECLARED from `watchReaderRegistrar()` (`noModule`/`noReader`/`again`, module named as the stand-in holds it).
- answers/standingQuestions (:298, :304, :305): NO_SUCH_STANDING_QUESTION (end and end-set) and STANDING_ENDED from `standingQuestions()`, with the asked id.
- retrieval-browse/marksRegistrarDeclared (marks.test.mjs:215): `retrieval-browse` is not in following's `uses` (architecture refused the import), so the refusing door is the real retrieval's `registerBrowseMarks`, which following already registered with at start (a delegating wrapper); the answer is retrieval's real LISTENER_DECLARED. BOB may add `retrieval-browse` to `uses` if the published fixture is wanted instead.
- standards/standardsIn (watches.test.mjs:320, 592, 635): `NO_STANDARDS = standardsIn()` from standards' fixture.

**Left (1, as B5 said):** fixture.mjs:179 `monitor` op table (FIX-E, provider monitoring); it arrives as a CHANGE.
**Markers added:** no `fixtures-own`, no `fixtures-generic`, no `fixtures-contract`.

**Tests.** `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/following/`: 128 pass, 0 fail. `impact.mjs origin/tranche/T51 HEAD`: 0 affected modules, 0 test files.
**Checks.** `fixtures.mjs . following`: 1 failure (the monitoring line above); `format`: 178 modules, 0 failures; `architecture following`: 0 failures; `coverage following`: 36 of 36 ids, 0 failures; `words following`: 0 failures; `ownership following tranche/T51 job/T51/following`: 0 failures. `run.mjs`: no finding in following but the monitoring line; other modules' fixture findings are theirs.

Size (session_017RAWf5wK7x8JvjByQ7CkS3): test runs 6, module lines 2210
