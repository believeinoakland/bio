# following (T51)

**Status** · session_01RqXFza4HAdeS4MWPxQeGug · depth 2 · COMPLETE · handled B3

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
