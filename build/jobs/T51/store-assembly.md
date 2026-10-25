# store-assembly (T51)

**Status** · session_01HLnCbbHSqPYo154Eb9QHxW · depth 2 · WORKING · handled B11

## J1 · QUESTION

Three points; I carry on with my best reading of each.

1. **`modules.json` paths.** My row has `paths: []`, `tests: []` (K1043: empty until the job's COMPLETE); your START says BOB adds them. The ownership check fails any job change to `build/modules.json`, and coverage, architecture and test-support's `declaredOpsOf` all read the paths. Best reading: I do not edit `modules.json`; you add `paths: ["bio-plane/src/store-assembly/"]`, `tests: ["bio-plane/test/m/store-assembly/"]` on the tranche (before or at my COMPLETE), and I merge it. Until then I run the checks over an uncommitted local copy of the file that lists them.

2. **`DECLARED_OPS` during the copy window (K5052 (4)).** The same collision hits `declared.mjs` (ask, readtranslate, owedwork) as `owner-ops.mjs`: once my paths are listed, `declaredOpsOf` (`test/declared-ops.mjs:92`, `^export const DECLARED_OPS`) finds those three in both plane and store-assembly. Best reading: neither copy has an `export const DECLARED_OPS` line until Wave B. The rows are held under internal names (`ASSEMBLY_DECLARED_OPS` in `declared.mjs`, `OWNER_MAP_DECLARED_OPS` in `owner-ops.mjs`), and my `declarations.mjs` registers both under `store-assembly` in its `OWNERS`, so the world's assembled table is production's (plane's 3 rows plus control-plane's 4). Wave B renames both to `DECLARED_OPS` when plane and control-plane delete theirs. Because a registration happens once per process (op-declarations R81), the route-map parity test builds plane's `Store` in a child process and compares the key lists.

3. **What only Wave B can meet.** R98 (plane and control-plane hold none of the files) and R1's "the Durable Object class calls it", plus R99's census of plane's imports, cannot hold while plane keeps its copy. Best reading: I write R99's test against my export list and against plane importing no file of mine by path, which holds now. I leave R98 and R1's class clause unmet, listed as deferred to Wave B in my record, with no test that passes falsely. Coverage then names R98 red, and you accept it by name until plane's Wave B job. If you want R98 tested now instead, say how.

## J2 · QUESTION

**The owed-work ledger keeps the wall clock, so a world's `tick` never reaches an owed row.** `pending.mjs` (plane's and my copy, `pendingOf(ctx, {env, store, deliver})`, `:214`) is handed no `now`, so it stamps `registered_at`, `due_at` and back-offs with `Date.now()`. The scheduler's firing then asks it with the instance clock: `onAlarm(now)`, and `tick(at)` keeps the rows with `due_at <= at`. In the world the clock is pinned at `WORLD_NOW` (2026-10-01) and moved only by `tick` (R93), so every row registered in a world is due at the wall's 2026-10-25 and never comes due. A screens or `store-request` test that drives an owed row by `tick` (R93: "an owed row") would wait forever. In production `BIO_NOW_MS` is unset, so both clocks are the wall and nothing differs; the mismatch is under R-CLOCK only.

Best reading, which I am carrying out unless you say otherwise: the assembly hands the ledger its R5 clock for instants, `pendingOf(ctx, {..., now: () => nowMs(null)})`. `pendingOf` already takes `deps.now` and reads it everywhere it stamps. The cost: under a pinned clock a run's measured times (`last_ms`, `own_ms`, `wait_ms`, R71) read 0 while the clock stands still, where today they read the wall's elapsed time. Production is unchanged, and so are plane's tests and copy. If you would rather keep the measured times off the pinned clock (a second, wall clock for durations alone), that touches about ten lines of `pending.mjs`; say so and I'll do that instead.

## J3 · REPORT

Five items for you; none blocks my building, and items 1–2 decide whether my checks can read green at COMPLETE.

1. **Four `uses` edges, test-only (architecture check, 5 failures).** Tests copied from plane import these earlier modules, all already in plane's `uses`:
   - `case-grammar`: `g54-seed.mjs`, `materialsLines`;
   - `answer-envelope`: `g54-sweep.test.mjs`, the published plane's binding helpers;
   - `connection-grammar`: `t33.test.mjs`;
   - `signatures`: `watch.test.mjs`, `sshsig.mjs` and `scripts/sign-sshsig.mjs`.

   Best reading: you add the four to store-assembly's row in `modules.json` at the merge, with the paths (K5125). I carry on as if added.
2. **`words-reads.json` has no `store-assembly` list (words check, 15 failures).** The 15 are the copied strings that plane's list marks `unkeyed`: `ask.mjs`' BAD_TASK details and malformed-request details, `wiring.mjs`' three, `wizards.mjs`' `screenFailures` problems. R95 makes the list's regeneration yours, at the design commit; the file is the design stream's. Until then the words check is red by name for store-assembly with exactly plane's unkeyed set, and `words.test.mjs` (R95) reads plane's list.
3. **A red that predates this job.** `release.test.mjs`' R23 words test fails, as plane's original does: the words list lacks `screen.objective.purpose`. It is the design's (words.json), not this module's; my suite is 373 pass, 1 fail (this), 2 todo (R1's class clause and R98, per K5125).
4. **The case-file sweep in a world.** R70's consumer builds an edition's case file through public-read's published plane, which is bound only by plane's `index.mjs` (`bindPublishedPlane`) in the isolate. A world (no Worker) has it unbound, so the sweep cannot build there unless a test binds it, as my `g54-sweep.test.mjs` does with answer-envelope's real helpers and the store's own namespace. This is for `store-request`'s world door, or public-read, to decide; I changed nothing.
5. **Fixture contracts stay plane's in the copy window.** The users' `fixtures-contract: plane <id>` markers (job-registrar, keep-later, owed-later, owed-ledger) name plane, so plane keeps `r10-fixtures-run.test.mjs`; I did not copy it, since the runs would be orphans here. They move to store-assembly when Wave B re-points the users. My copies of plane's ledger tests carried plane's open FIX-E and CODE lines (part-4 §plane); a worker is re-pointing mine to the providers' published fixtures now, so store-assembly's fixtures count reaches 0.

## J4 · QUESTION

**The last 11 fixtures findings: reader answers extraction's published fixtures do not produce.** A worker re-pointed my copies of plane's ledger tests to the providers' published fixtures and real codes. The fixtures count for store-assembly went from 64 to 11; stub, code and op-table findings are all 0; 7 `fixtures-generic` markers were added, listed below for K5060. The 11 remaining are all in `r9-jobs.test.mjs` (`:90`, `:92`, `:113` ×2, `:302` ×2, `:345`, `:378`, `:389`, `:439`) and `fix6-pending.test.mjs:182`. Each scripts an answer of extraction's `readHeld` that the ledger's own rules (R64, R68, R74, R76, R82) turn on:
- a `cursor` in `detail` (`unitOf` reads `cursor`, `next` or `next_page`);
- `counters {written, skipped, owed, failed}`;
- `owed: true` with counters;
- `killed` and `ocr_killed` pages;
- a `killedCursor` stepped past.

Extraction's real `readHeld` emits these on its paged and killed paths (`extraction/index.mjs:914`, `:1036-1044`, `:1140`; `reading-pipeline/index.mjs:2602`, `:2652`). But `bio-plane/test/m/extraction/fixtures.mjs`' `readHeldAnswer` publishes only `noHome`, `read`, `piece`, `pieces(n)` (whose `detail` is `{read_through, total}`, no cursor), `held` and `final`. The worker tried the real `pieces(4)` for `fix6-pending:182`. With no cursor the unit is `whole`, three kills end the row `PAGE_KILLED_READER`, and the `killedCursor` path the test exists for is never reached, so it reverted that test.

Best reading: a provider gap, extraction's to close. Its fixtures publish, made by its real `readHeld`:
- a windowed text read that answers `more` with a cursor in `detail`;
- a scan read answering `owed: true` with `counters`;
- a page or window that kills its reader (`killed`, `killedCursor` honoured);
- a finishing answer with `counters`.

Then I re-point the 11 to them, as a CHANGE to this job. Until then the 11 stay red by name for store-assembly, as they stand red for plane (part-4 §plane; plane's own count is 75). I do not mark them: no rule of K5044 lets a marker cover an answer the provider really gives. If you would rather I build these answers myself through extraction's real `readHeld` over a held capture (extraction is earlier, so allowed), say so; it is about 150 lines of test setup, and duplicates what extraction's fixtures exist for.

Markers added (K5060):
- `r7-keephome.test.mjs:40`: STORE_DOWN, an outage word no module gives.
- `r7-lastmem.test.mjs:25`: AGAIN.
- `r7-lastmem.test.mjs:63`: SLOW.
- `r7-lastms.test.mjs:41`: SLOW.
- `r9-jobs.test.mjs:91`: STORE_BUSY.
- `r9-jobs.test.mjs:303`: R2_HICCUP. This and the four above are made-up transient retry words.
- `t36.test.mjs:55`: NOT_HERE, the fetch double's fall-through for an unscripted path.

No `fixtures-own`.

## J5 · COMPLETE

**STORE-ASSEMBLY #1 COMPLETE: entry (a) and K5046 (g) built and tested.**

**Built (K5046 (a), K5052; by copy, K624).**
- `bio-plane/src/store-assembly/`:
  - `assemble.mjs`: `assembleStore(ctx, env, {deliver})`. It is the constructor body of plane's `Store`, `#migrate`, `routes`, `#dispatch`, `#nowMs` (as `clockOf`) and `#ownNamespace` (as `namespaceOf`).
  - plane's Worker-free files, copied: pending, ask, wiring, owners, stats, unpack, transcribe, casesweep, acquire-timings, register, declarations, declared, wizards.
  - control-plane's `owner-ops.mjs`, its export renamed `ownerOps`.
  - `index.mjs`, which exports R99's names.
- The only import changes are `deliver` as a parameter, the owner map from here, and `ADMIN_ACTS`/`ADMIN_SCREENS` from wizard-scripts. No platform import; the module runs in plain node.
- Copy window (K5125): no `export const DECLARED_OPS`. The rows are `ASSEMBLY_DECLARED_OPS` and `OWNER_MAP_DECLARED_OPS`, registered under `store-assembly` in `OWNERS`.
- Changes against plane's copy, each tested:
  - the ledger's five tables are declared to purge under `store-assembly`, and the stats source is registered under that name (R97, R100);
  - the ledger's instants are on R5's clock and its durations on a clock of their own (K5132).
- Plane and control-plane are untouched.

**The fixture published (for store-request).** `storeWorld({claimed?, now?, env?})` in `bio-plane/test/m/store-assembly/world.mjs`, with `WORLD_NOW`, `WORLD_PASSWORD`, `WORLD_FOUNDER_HANDLE` and `memoryBucket`.
- It is the migrated store over node:sqlite: `store`, `ctx`, `sql`, `env`, `claim`, `send`, `tick`, `script`.
- Each base (claimed, unclaimed) is built once per file and copied per test (`serialize`/`deserialize`), never shared.
- Measured (K5046 (g)): `storeWorld: base 587–776 ms, copy 129–170 ms`.
- Copy speed was not traced further, so whether password hashing dominates is unmeasured. The claim is in the base, so a copy pays no hash.
- `test/m/store-assembly/fixture.mjs` is this module's own harness for the tests copied from plane.

**Tests.** 62 files: plane's and control-plane's node tests copied (K624; class-only, Worker-only and workerd tests stay with plane), plus new ones:
- `sa-assembly`: R1, R4, R5, R7, R8, R96, R97, R99, and `test.todo` for R1's class clause and R98 (K5125);
- `sa-world`: R90–R94, R71 (K5132);
- `sa-parity`: the route keys equal plane's `Store.routes` over the same fixture ctx, plane built in a child process;
- `sa-gaps`: R33, R52, R58, R63;
- `owner-map-spread`: R88, R89;
- `cp-*`: R85–R87.

The copies take the providers' published fixtures and real codes.

Run: `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/store-assembly/*.test.mjs` gives tests 377, pass 374, fail 1, todo 2. The fail is `release.test.mjs` R23 (`screen.objective.purpose`), inherited and accepted by name (K5139 (3)).

Plane and control-plane suites (`bio-plane/test/m/plane/*.test.mjs`, `bio-plane/test/m/control-plane/*.test.mjs`): tests 1305, pass 1296, fail 9, none caused here:
- `r8-heal-door` (2), `r8-headofline` (1) and `r10-lag-figure` (1) fail identically on a clean checkout of `tranche/T51`;
- `declared-ops` `subscriptionsignin` and `release` R24 predate this job;
- the three `t51-round9-seam` reds are §14, red by its own name, and §1 and §9, heavy and timing-bound.

The parity run of the round-9 seam on the clean tranche is still going. I will REPORT only if it differs.

**Checks** (all run over my uncommitted local `modules.json` listing `paths` and `tests`, as K5125 says; the file is restored, never committed):
- format: 0 failures.
- coverage: 99 of 99, 0 failures.
- ownership: 0 failures.
- architecture: 8 failures, all test-only edges to earlier modules:
  - `case-grammar`, `answer-envelope` (two through its published fixtures), `connection-grammar` and `signatures` (two), which K5139 (1) counts as added;
  - one more found since: `reading-pipeline`, from `r9-jobs.test.mjs` taking its published `storeFailedTransient`. Please add it with the four.
- words: 15 failures, the copied unkeyed strings, accepted by name until the round-end regeneration (K5139 (2)). By file and line:
  - `ask.mjs`: `:60`, `:62`, `:86`, `:88` (the malformed-request details) and `:368`, `:388`, `:389`, `:502`-derived BAD_TASK details at `:526`, `:531`, `:535`, `:540`;
  - `wiring.mjs`: `:49`, `:78`, `:103`;
  - `wizards.mjs`: `:51`.

  This is plane's `unkeyed` set; the check's own list is authoritative.
- fixtures: 11 failures, extraction's provider gap, left red by name for a CHANGE once EXTRACTION #47's fixtures merge (K5139 J4). They are `r9-jobs.test.mjs` `:90`, `:92`, `:113` ×2, `:302` ×2, `:345`, `:378`, `:389`, `:439`, and `fix6-pending.test.mjs:182`.

**Markers added (K5060):** `fixtures-generic` only, all read and accepted (K5139):
- `r7-keephome.test.mjs:40` STORE_DOWN;
- `r7-lastmem.test.mjs:25` AGAIN, `:63` SLOW;
- `r7-lastms.test.mjs:41` SLOW;
- `r9-jobs.test.mjs:91` STORE_BUSY, `:303` R2_HICCUP;
- `t36.test.mjs:55` NOT_HERE.

No `fixtures-own`.

**Deferred.** R1's class clause and R98 go to Wave B (plane's and control-plane's jobs, K5125); `test.todo` covers each.

**Found in other modules (all reported, J3; placed by K5139):**
- the case-file sweep needs plane's `bindPublishedPlane` in a world: placed in store-request's START;
- the users' `fixtures-contract: plane` contracts stay plane's until Wave B, so plane keeps `r10-fixtures-run.test.mjs`;
- extraction's fixtures gap: EXTRACTION #47.
- The ledger's wall clock exists in plane's copy too; it is left as is for Wave B (K5132).

Size (session_01PFCJP5a6GVyjzzsxKD2a53): test runs 52, module lines 3735

## J6 · COMPLETE

**STORE-ASSEMBLY #3 COMPLETE: B5 (follow-up 68), B6 (K5149) and B8 (K5168) applied.** Session #2's work was committed but its record was not closed; I verified it and fixed what its last commit left red.

**Entries applied.**
- B5: the ledger tests' readHeld answers come from extraction's published `readHeldAnswer` (10 of the 11 lines). Two tests that session #2 left red are corrected here, tests only: `r9-jobs` R74 G126j (the scan's `ocr` row, registered by the owed answer, is asked beside the reading and takes a tick of its own; the answer is by kind and the test ticks until the reading ends) and `fix6-pending` R68 (G13) (the unit is the whole read, so the first kill, though cleared from the row's count by progress, stands in the unit's attempts: the reap after the second kill here is the third against the whole and ends the row; REPORT already in the title).
- B6: the world binds `INSTANCE_NAME`; a bare world promotes and names its team (`sa-world`). Base time as measured: base 587–776 ms, copy 129–170 ms (K5046 (g)); `INSTANCE_NAME` adds no measurable cost. No requirement's meaning changes.
- B8: `assemble.mjs:203`, the first `credentialsOf` call for the storage, hands `now: () => nowMs(null)`. Test `sa-world` "R5 R92 (K5168)": a pinned world's claim records the pin as `consumedAt`. It was not red first: the claim path already reached the pin through `credentialsOps`' `env.BIO_NOW_MS` (K5148's fallback), so the test is a guard; the change covers any instant written before `credentialsOps` sets the env. `ask.mjs:281,361` run after `assemble.mjs:203`, so cannot run first.

**Still red, by name, for BOB.**
1. `fixtures.mjs` 1 failure: `r9-jobs.test.mjs:356`, R76 G129c, the 300-page OCR scan that scripts `{more: true, detail: {next_page: p}, counters}`. No provider publishes it: extraction's real `killed()` is a 4-page scan and no producer outside plane/store-assembly emits `next_page` at all (`pending.mjs:139` `unitOf` and `:447` read it). Either extraction publishes a multi-window OCR tick answering the next page, or the ledger's `next_page` reading is dead code for BOB to rule on. I changed no product file for it.
2. `release.test.mjs` R23 (`screen.objective.purpose`), inherited, accepted (K5139 (3)).
3. words: the 15 unkeyed copied strings, accepted (K5144).
4. The two `test.todo`s (R1's class clause, R98).

**Tests and checks** (HEAD after merging `origin/tranche/T51`): `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/store-assembly/*.test.mjs`: tests 379, pass 376, fail 1 (R23), todo 2. A run without `--test-force-exit` does not exit by itself (over 30 minutes). format 0 failures; architecture 0; coverage 99 of 99, 0; ownership 0; words 15 (accepted); fixtures 1 (above). `modules.json` lists my row on the tranche; none run over a local copy.

**Markers added this session:** none (the 7 `fixtures-generic` of J4 stand).

**Found in other modules:** extraction's gap above (item 1); `next_page` in `pending.mjs` is the ledger's own (my copy; plane keeps its copy until Wave B).

Size (session_01HPMiWGM9dDovp7swY1STgF): test runs 9, module lines 3740

## J7 · COMPLETE

COMPLETE (J6 in my record, pushed): B5, B6 and B8 applied; suite 379 tests, 1 fail (R23, accepted), 2 todo; format, architecture, coverage, ownership 0; words 15 (accepted). One fixtures finding is left red for you: r9-jobs.test.mjs:356 (R76 G129c, the 300-page OCR scan scripting next_page): no provider publishes it, extraction's real OCR path never emits next_page. See J6.

## J8 · COMPLETE

**STORE-ASSEMBLY #3 COMPLETE: B9 (K5171) and B10 applied.**

- **B9.** `assemble.mjs:596` hands `now: () => nowMs(null)` to `instanceSetupOf`. Test `sa-world` "R5 R92 (K5171)": a pinned world's producing team is recorded at the pin (`recorded_at`). It passes as a control: reverted, it still passes, because instance-setup's env fallback (`BIO_NOW_MS`) already gives the pin and a world's env carries it. Note: instance-setup's `deps.now` also feeds its measured durations (`#now()`), which read 0 under a pin; that is instance-setup's, not changed here.
- **B10.** Grep of every module's source (extraction, reading-pipeline, readers first, then the rest outside plane): **no producer answers `next_page`** (the only hits are wrangler/workerd node_modules and plane/store-assembly's own copies). Removed: the answer-side read in `pending.mjs:447` (`r.detail.next_page` in the cursor chain) and the test R76 G129c (`r9-jobs`), whose scripted answers were its only user. **Kept, and why:** `unitOf` (`pending.mjs:139`) reads `next_page`/`page` from the ROW's detail, and `transcribe.mjs:111` (this module) registers `ocr` rows with `detail: {pages, next_page}`, so that read is live. Two tests still script an answer `detail.next_page` (`r9-jobs.test.mjs` the R74 jobCounters test ~`:302` under the R2_HICCUP marker, and the R76 member-kill test ~`:333`); they pass and the fixtures check accepts them, but they script an answer no producer gives: BOB's call whether to rewrite them. **Plane's Wave B:** plane's `pending.mjs:139,447` and `transcribe.mjs` carry the same; its `:447` read is dead the same way. Also found: nothing in the real OCR tick answers `more` with a page detail, so a multi-window OCR row advances only through its row's registration (extraction's, for BOB to confirm).

**Tests and checks** (HEAD after merging `origin/tranche/T51`): suite `--test-force-exit`: tests 379, pass 376, fail 1 (`release.test.mjs` R23, accepted K5139), todo 2. format 0; architecture 0; coverage 99 of 99, 0; ownership 0; **fixtures 0 failures** (accepted 8); words 15 (accepted K5144).

**Markers added:** none. Previous `fixtures-generic` (7) stand.

Size (session_01HPMiWGM9dDovp7swY1STgF): test runs 14, module lines 3705

## J9 · COMPLETE

COMPLETE (J8 in my record, pushed): B9 and B10 applied. B10: no producer answers next_page; the answer-side read (pending.mjs:447) and R76 G129c are removed; the row-side read (unitOf, fed by transcribe.mjs:111) is live and kept. Suite 379 tests, 1 fail (R23, accepted), 2 todo; fixtures 0; format, architecture, coverage, ownership 0; words 15 (accepted). Two other tests still script an answer next_page (your call); plane's Wave B carries the same dead :447. See J8.

## J10 · REPORT

REPORT (STORE-ASSEMBLY #4, day found): at tranche/T51's tip (42f09c5977) NO store starts, so every module's world fails at import: `DECLARED_OP_DISAGREES: readtranslate description` (op-grades/declared.mjs:110, thrown by store-assembly/register.mjs). Cause: fc578df959 regenerated setup-words/rows.mjs after plane's Wave B kept one sentence for id plane.declared.readtranslate, store-assembly's ('(store-assembly R53)'), while op-grades' hand row (op-grades/t48.mjs:69-71) still reads '(plane R50)'; `localize` answers the row's text, so the owner's row and the hand row differ. My fix, on my branch, in my path: the three assembly rows take the ids store-assembly.declared.{ask,readtranslate,owedwork} (no row yet, so localize answers my sentence) and readtranslate's sentence is the hand row's, '(plane R50)', as R84 says (copied, never chosen). For BOB: (1) OP-GRADES amends t48.mjs:69-71 to cite 'store-assembly R53', after which my sentence follows by a one-line CHANGE; (2) rows.mjs regenerated at the round end drops the three plane.declared.* rows. Until my branch merges, any other module's world test fails at the same line.

## J11 · REPORT

REPORT (STORE-ASSEMBLY #4, causes outside my paths, the day found). The assembly now hands the store's clock to ai-use, file-safety, capture, publication (so corpus-export), action-clocks, action-plans and filings (clock-owners.test.mjs, 5 tests, each red before). What the capture module still reads from the wall, so a pinned world's capture instants and its sessions do not follow tick (capture's job; STORE-REQUEST #6 J17 (3a') asked for the session to leave the list on the pinned clock, and handing `now` alone does not do it): bio-plane/src/capture/index.mjs:979 and :1562 (`stampSecond()` default: an upload's receipt `retrieved` reads the wall), :3265 `saveCaptureSession` and :3283 `loadCaptureSession` (`new Date()`: a session's created/updated/expires), :3300 `liveCaptureSessions` (`Date.now()` default), and acquisition/index.mjs:1155, :1362 (`liveCaptureSessions(stampSecond())`) and its `saveCaptureSession` calls (:1370, :1773, :1967, :2325, :2417, :2591, :2598) which pass no `at`; capture's own `#instant()` (:485) is read only by the parted-upload and `openCaptures` paths, which my test covers. Also filings: it takes a handed `now` (filings/index.mjs:253), which the assembly now hands, but it still does not fall back to `env.BIO_NOW_MS` itself (already placed as filings' job). No scheduler defect: its 10-second budget timer (scheduler/index.mjs:638) legitimately holds an abandoned run's process until the budget passes (my R78 test ends in about 11 s).

## J12 · REPORT

REPORT (STORE-ASSEMBLY #4, causes outside my paths, the day found). (1) r9-jobs.test.mjs:313 (plan item 12; PLANE #62 J64 B7) cannot take extraction's published `readHeld` failure: bio-plane/test/m/extraction/fixtures.mjs `readHeldAnswer` (lines 93-130) publishes noHome, read, piece(s), held, final, killed, windowed, scanOwed, killedWindow, finished, and no transient store failure. The line keeps reading-pipeline's `storeFailedTransient()` (its real `read` answer) and its `fixtures-generic: R2_HICCUP` marker. Needs: EXTRACTION publishes `readHeldAnswer.failed()` (its real `readHeld` over a held capture whose evidence store rejects, answering the transient failure the ledger retries); then a CHANGE to me swaps the two scripted answers. (2) The users' markers of the contracts store-assembly now provides: 38 `fixtures-contract: plane job-registrar`, 9 `keep-later`, 1 `owed-later`, 36 `owed-ledger` (and `reading-ended`, `transcribe-not-sent`, ledger-side ones too) in acquisition (r9-failed-ends, r8-render-bar, r7-render-failed, r7-fetchdone, g27-g32-t51, r9-ceilings, fix6-t51, fix3-t51, r8-fetch-refused, r7-t51, fix4b-owed, r123-batch-d, r9-pending-render, r8-open-captures, g27-memory-child, r9-registrar, fix5-render-owed, fixtures.mjs), extraction (r8-owe, r99-r107, r82, r10-migration-counts, r10-pages-left, s25-pieces-chain, fixture.mjs, fixtures.mjs, t44, pdfstructure, r103), monitoring tick, file-safety r1-registrar, screens-intake g128i-504-kept, capture (r103-t51, r7-upload-t51, r9-t51, g127f-t51), doorbell r9-t51, notice-producers reading-ended-seam, control-plane (r9-seam-limits.mjs, t51-visitor-copy) all read `plane`; plane no longer holds the run, so each reads contract-no-run until BOB re-points it to `store-assembly`: store-assembly's `r10-fixtures-run.test.mjs` (moved from plane, 9 tests, green) now carries the 13 `fixtures-run:` lines of plane's file. (3) `store-assembly/owner-ops.mjs` still exports `OWNER_MAP_DECLARED_OPS` (not `DECLARED_OPS`): control-plane/owner-ops.mjs still declares the same four ops, so the rename waits for CONTROL-PLANE's deletion (control-plane's declared-*.test.mjs import the old name from my file). declared.mjs's three rows are `DECLARED_OPS` now. (4) Tests with no twin, moved: t42 (16 tests; the Worker-hook and Miniflare ones, plane R112/R113/R6, stay in plane) and t46 (10 tests; R42 workerd and the R114 RPC methods stay in plane); plane's two files can shrink to those.
