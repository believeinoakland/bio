# run-productions (T42)

**Status** · session_014kGdQn9r6yt8hA7AVpanwj · depth 2 · WAITING ON BOB (J1) · handled B4

## Progress (T42-18; N834; B1)

**Read whole (the reading set is 618 KB, over 300 KB; K2304):** `requirements/run-productions.md`; layer 6's row of `layers.md`; `plan/current.md` T42-18 and rule 4; K2496, K2608; `draft-T42-reqs.md` section N834 (with its Tests, Users and Doubts); the module's code, all four files (`index.mjs`, `checks.mjs`, `reading.mjs`, `schema.mjs`); the used services the entry calls: `inquiry` R62 and `basis-versions` R49 (as written on `tranche/T42`), `content`'s extent grammar (`canonicalExtent`, `citationExtent`, `legContentId`, `legExtent`, `resolveCitation`, its R45 read contract) and `inquiry`'s factory and leg projection (`index.mjs`:760–795, :2794). A worker read the module's six test files in full and wrote a ~4 KB summary citing file and line.

**Built (commit on `job/T42/run-productions`):**
1. **R25** `machinePassage({legs, author, viewer})`: for each leg, the content row it names (`content_id`), or the one its part resolves to (a document target, the capture the leg names or the one presented now, its extent canonicalised: a lookup over `content`'s R45 contract, never a mint); the proposals naming that row (`proposed_readings.content_id`); the leg stands only if `acceptedFor` answers `accepted: true` for one of them and `author`. Otherwise `PROPOSAL_NOT_TAKEN_UP` naming each leg `{ord, target, content_id, proposals}` with `remedy: "op=proposalaccept"`. An acceptance that throws refuses the leg (`unread: true`); a lookup that fails refuses every leg given (fail closed). Synchronous, writes nothing, never throws (a null argument included: one of my tests caught that).
2. **C-104.32** `PROPOSAL_NOT_TAKEN_UP`, `where` `machinePassage > is-machine-passage`. It is rule 4 (2) in the row census until T43's stamp.
3. **Registration** in `runProductionsOf`: the read goes to `inquiry.onMachinePassage` (inquiry now reached through `inquiryOf`, an edge already in `uses`) and to `basisVersions.onMachinePassage`. **Until both providers merge, it registers only where the slot exists** (`typeof … === "function"`). At their CHANGE I merge, drop the guard so a missing slot fails loudly, and re-run against the real providers.

**Reading taken (stated, not asked):** "a content row a run proposed" is any row some `proposed_readings` row names, whoever minted it first. When several proposals name one row, her acceptance of any one of them lets the leg stand, because they are the same passage. A proposed connection is never a leg target, so R25 judges passages only (the draft's doubt 1).

**Tests:** `reading.test.mjs` +3 (R25: both registrations, each the synchronous read; the verdicts by id, by part and by part at a named capture; a mixed set naming only the proposed leg; another member's acceptance not counting; her own acceptance as the negative control; a blank or machine author; nothing written; fail closed both ways; never throws). `module.test.mjs`: the C-104 family is now 32 rows, the new row's region is listed and the row is driven. Fixture: an `inquiry` stand-in and `basisVersions.onMachinePassage`, both recording into `w.machinePassageSlots`. run-productions: `pass 57, fail 0`.

**Users' suites (P11):** skills 105/0, op-declarations 128/0, store-door 43/0, control-plane 216/0, plane 166/0, agent-worker 13/0. answer-envelope 28/1 (`catalogue-end.test.mjs`:17, rule 4 (6)) and `system/migrate-released.test.mjs` (`ai_ceilings`, rule 4 (7)) are inherited. **question-explorer 26/1: `test/m/question-explorer/module.test.mjs`:28 is caused by this change.** It passes 27/27 on `tranche/T42`. `runProductionsOf` now builds `inquiry` through its factory, which declares inquiry's tables to purge. question-explorer's test store creates none of them, so `record.purge` fails with `no such table: inquiry_findings`. Reported (J1).

**Checks:** `format: 147 modules, 146 requirements files; 0 failures`; `architecture: 10 product files, 57 relative imports; 0 failures`; `coverage: 1 modules, 25 of 25 live requirement ids named by a test; 0 failures`; `ownership: 6 files changed by run-productions between tranche/T42 and HEAD; 0 failures`.

**Next:** on the CHANGEs for inquiry (T42-12) and basis-versions (T42-16), merge `tranche/T42`, drop the guard, run R25 against the real slots, then re-run steps 5–7 and post COMPLETE.

## J1 · REPORT

R25 is built against stand-ins and run-productions passes 57/57. Two things for you.

1. **A red in question-explorer that this change causes.** `bio-plane/test/m/question-explorer/module.test.mjs`:28 ("the module's tables are declared to record-core's purge…") fails with `no such table: inquiry_findings`; it passes 27/27 on `tranche/T42`. Cause: `runProductionsOf` now builds `inquiry` through `inquiryOf` (an edge already in `uses`) so it can register with R62, and `inquiryOf` declares inquiry's tables to purge. question-explorer's world calls `runProductionsOf(host)` (`src/question-explorer/index.mjs`:884) on a store that never creates inquiry's tables, so `record.purge` fails. In production the plane creates and migrates inquiry anyway. Proposed fix, in question-explorer's own test fixture: create inquiry's tables (migrate it), or pass `runProductionsOf` a `runProductions` stand-in. question-explorer is open in this layer (QUESTION-EXPLORER #2); please route it to them by CHANGE.
2. **Waiting on the two providers.** Until inquiry (T42-12) and basis-versions (T42-16) merge, the registration is guarded: the read registers only where `onMachinePassage` exists. At each CHANGE I merge `tranche/T42`, drop the guard, run R25 against the real slots and post COMPLETE.

Other users: skills, op-declarations, store-door, control-plane, plane and agent-worker are green. answer-envelope `catalogue-end.test.mjs`:17 (rule 4 (6)) and `migrate-released`'s `ai_ceilings` (rule 4 (7)) are inherited reds. C-104.32 joins rule 4 (2). Details are in the record's Progress section.

## Completion (T42-18; N834; B1, B2, B3 K2655, B4 K2660)

**Applied:** R25 as built in Progress above, now against inquiry's real R62 slot (B4): `runProductionsOf` registers `machinePassage` with `inquiry.onMachinePassage` unconditionally. Inquiry is reached through `inquiryOf`, an edge already in `uses`. B2's readings of R62 (unchanged = the same passage as a multiset; no call when nothing changed; an empty author is asked) need nothing here: an empty author's leg on a proposed passage is refused, which is tested. C-104.32 `PROPOSAL_NOT_TAKEN_UP` is added.

**Still guarded: basis-versions' R49 slot.** T42-16 has not merged `onMachinePassage` into `tranche/T42` at this head, so the read registers there only where the slot exists. Dropping that guard now would make every `runProductionsOf` throw. At basis-versions' CHANGE I drop it and add the real-slot test as I did for inquiry. This is the one part of R25 not yet proven against the real provider.

**Deferred:** none.

**Found in other modules:** question-explorer `module.test.mjs`:28 (J1; routed by B3, K2655).

**Tests** (after merging `tranche/T42`, inquiry T42-12 included): run-productions `pass 58, fail 0`. One test was added since Progress: R25 against inquiry's real slot, where a second registration is refused `LISTENER_DECLARED` naming run-productions, with a stand-in world's open slot as the negative control. Users and seam owners:
- Green: inquiry 205/0, citation 78/0, basis-versions 136/0, skills 105/0, op-declarations 128/0, store-door 43/0, control-plane 216/0, plane 166/0, `migrate-released` 1/0.
- question-explorer 26/1: `module.test.mjs`:28, J1, with its job.
- answer-envelope 28/1: `catalogue-end.test.mjs`:17, rule 4 (6).
- agent-worker 13/1: `requirements.test.mjs` R45, a stale `agent-worker` bundle. The sources named in it are agent-worker's and agent-model's (T42-20), never this module's: rule 4 (10).

**Checks:** `format: 147 modules, 146 requirements files; 0 failures`; `architecture: 10 product files, 59 relative imports; 0 failures`; `coverage: 1 modules, 25 of 25 live requirement ids named by a test; 0 failures`; `ownership: 6 files changed by run-productions between tranche/T42 and HEAD; 0 failures`.

Size (session_014kGdQn9r6yt8hA7AVpanwj): test runs 9, module lines 2309
