# affordances (T41)

**Status** · session_01QdSkAamnkagsBNMwfgAvuB · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

**D54 and R13/R18: the owner rescue at an administrator's `EXISTENCE` of a hidden project.**

Found re-stating `plane.test.mjs`'s R18 roster test for D54: membership R60 (and R44) keeps `project-roster` R5's rescue (`projectownerrescue`) reachable for an administrator at a hidden project's `EXISTENCE`, and the act accepts there (measured: ruth, an administrator, and the founder on hidden `PR` whose sole owner is deactivated: `projectownerrescue` answers `NO_SUCH_HANDLE`, a parameter's refusal). But R13 answers `NO_SUCH_BUNDLE` for a target "the viewer may not see" (`facts.mjs` asks `membership.inSight`, false at `EXISTENCE`), so `op=affordances` offers that administrator nothing on the project: the pre-flight disagrees with the act it fronts (R18; DEC-8), and the one act D54 deliberately leaves an administrator at a hidden project is not offered.

**My best reading (what I am building unless you answer otherwise):** R13 and R14 gain an `EXISTENCE` arm. For a project target the viewer sees at `EXISTENCE` because it is an administrator (the founder included) neither invited nor joined to a hidden project (membership R44's D54 arm, asked through `membership.sight`), `affordanceFacts` answers R14's keys, every content fact null (`current_state`, `criticality`, `declared_type`, the citation and reading counts, the conclusion facts), `object_type: "project"`, and `roster` asked of `by` carrying only `rescue_open` (through `rescueRefusal`, the predicate the act runs) with `owner` false, `state` null and the two floors null (they would tell an outsider whether owners are leaving: contents). R8–R10 then offer `projectownerrescue` exactly when `rescue_open` is true and nothing else (every other act needs a stated fact). A member at a discoverable project's `EXISTENCE` keeps `NO_SUCH_BUNDLE` (no act of this module reaches there; `projectRequest` is project-roster's). R16, R22 hold unchanged. Tested with the negative controls: the same administrator on a discoverable project (FULL, R14 whole), a non-administrator member on the hidden project (`NO_SUCH_BUNDLE`), and an absent id (`NO_SUCH_BUNDLE`).

**The other option:** keep R13 as written and narrow R18: the rescue is not offered through `op=affordances` at `EXISTENCE` (a surface offers it from the directory or roster read instead). Simpler, but an act the caller can take is absent from the one pre-flight (UI-KICKOFF: capabilities shape the interface).

Requirement text needed either way (R13, R14 or R18). I carry on with the rest of the job on my reading.

## Completion

**Entries applied (T41-52).**
- **R48 (DEC-188 (7), (8); U145; K2484).** `ACT_HELP` re-generated from `mock-acts.js` at `3660c18803` (PR #19, 215 entries) by a script that reproduces the T38 table from `c848b56671` exactly. It holds 211 texts. The eleven new `owed_` texts are held under their ops (`accountusesset`, `ailimitset`, `projectkeyset`, `projectsigninset`, `projectaccountswitch`, `projectaccountremove`, `projectkeynoticeseen`, `projectaikeepaway`, `exploreapprove`, `handlechange`, `handlecheck`). `aikeepaway` and `groupkeyset` carry PR #19's re-wordings. The four retired ops' texts (`aiceilingset`, `aicopyceilingset`, `accountswitchset`, `groupswitchset`) are left out. `t36.test.mjs` re-states the counts and named keys, with eight negative controls (K874).
- **D54 (K2408, K2442) and J1 → R13 as amended (K2578).** `facts.mjs` gains the `EXISTENCE` arm: content facts null and `roster` with `rescue_open` only, so `projectownerrescue` is offered exactly where it is accepted (R18). One detail beyond R13's words: `project_participant` and `project_target_owner` are false, never null, at this arm. They are the caller's positions (R15), not the project's contents, and a null would offer `cite` (R10), which the act refuses there. The other positional facts are asked as R15 asks them.
  - Re-stated for D54, each with negative controls (a discoverable project, an invited administrator, a non-administrator member, an absent id):
    - `converts.test.mjs` (both reds, plus a new invited-administrator test);
    - `plane.test.mjs`: the world builder invites with the owner's viewer; the content-fact tests read through a participant's sight; the roster read is the owner's; a new D54 test; R23 gains the founder's-sight line.
  - The stale doctrine comments at `affordances.mjs` (conclude, cite) are re-worded.
- **Retired ops and N823.**
  - `t33.test.mjs`: credentials' `accountswitchset` and ai-runs' `aiceilingset`, `aicopyceilingset` are retired. `aiusage` is ai-use's now, its row still T33's. Hypotheses' five T41 ops are pinned.
  - `t34.test.mjs`: `groupswitchset` is retired; the precedent pair is re-pointed to `reminderset`. R42 reads `publishatmove`, `publishatcancel` and `publishschedule` from publish-schedule's map (and checks they left publication's), clearing rule 4 (20)'s `t34`:35.
  - `t31.test.mjs`: R38's stale filter names its two ops, not `*watch` (T41's `projectwatch`).
- **The new ops (R12, R19, R41; op-grades R29, R30).**
  - `catalogue.test.mjs`: the band set and R27's undetermined set gain T41's grades, pinned by name from op-grades R30's text (8 reasoned, 18 reversible, 22 undetermined).
  - New `t41-backing.test.mjs`: R19, each of the eight `reasoned` ops driven at its owner's interface (credentials, investigation, hypotheses, reading-guides, steps), plus the list test.
  - New `t41.test.mjs`: R12's totality and R41's explanation over T41's ops, and the retired four.
  - `plane.test.mjs`'s "every reasoned op driven" list gains T41's.
- **K2443 (five proposals).** No text of this module names five proposals: nothing changed.

**Final `uses`** (for BOB to apply at merge). Add `steps`, `reading-guides`, `investigation` (each test-only, `t41-backing.test.mjs`'s fixtures; requirements Uses already names them, K2418) and `publish-schedule` (`t34.test.mjs`, its op map; N823). All four are earlier in the order. `question-explorer`, named in Uses, is not imported and needs no edge. With the four added, `architecture.mjs` reads 0 failures (checked with a local, reverted edit of `modules.json`). Without them it reads exactly those 4.

**Reading set (mechanics §17, K2304).** The module's own code and tests alone are 595 KB, over 300 KB, so step (3) applied.
- Read whole myself: `build/requirements/affordances.md`; layer 11's row of `build/layers.md` ("nothing below depends on them": the four new edges all point down); `act-help.mjs`, `facts.mjs`; the tests I changed (`t36`, `converts`, `plane`, `catalogue`, `t31`, `t33`, `t34`); the owners' tests and fixtures I drive (parts named in `t41-backing`); op-grades' `t41.mjs` diff; membership's sight services (`sight`, `#administratorView`, `visibilityOf`, `existenceAct`, `projectVisibilitySet`).
- A worker read the rest in full (`affordances.mjs`, `door.mjs`, `words.mjs` and 13 test files). Its summary is 33.8 KB, every statement citing file and line; it is in my session's scratchpad.
- What it found that mattered, all acted on: catalogue's closed band and R27 sets would break on T41's grades; no T41 reasoned backing existed; the stale "admin sees every project" comments. What it left out that mattered: nothing found.

**Found in another module (REPORT).** None beyond the J1 question, now R13's.

**Deferred.** None.

**Tests and checks run** (on `job/T41/affordances` with `tranche/T41` merged, op-grades included; K2579).
- This module (`bio-plane/test/m/affordances/`, 20 files): **232 pass, 0 fail** (232 is the correct sum; J2 said 242 by an addition error).
  - On `tranche/T41` before this job: 186 pass, 34 fail (plane 28, converts 2, t33 1, t34 2, t36 1).
  - Rule 4 (11)'s three D54 tests, rule 4 (12)'s `t33`:151 and `t34`:199, rule 4 (20)'s `t34`:35 and rule 4 (22)'s affordances share are all cleared.
- Layer tests: none (manifest).
- Users of the service I changed (`affordanceFacts`' EXISTENCE arm): tasks, queue (with `conclude-project`), op-declarations, store-door, control-plane, plane (with `migrate-released`); 112 files.
  - My branch: 710 pass, 30 fail. The same tree without my change (`tranche/T41` at `61be02ae4d`): 710 pass, 30 fail, file for file identical.
  - The 30 are the users' own reds, already on the tranche: rule 4 (12), (15), (17), (18), (20), (22), each until its own job.
- Checks (`civicos-process`):
  - `format`: 0 failures.
  - `architecture affordances`: 4 failures, exactly the four new `uses` edges above; 0 once BOB applies them.
  - `coverage affordances`: 34 of 34 live ids named, 0 failures.
  - `ownership affordances tranche/T41`: 13 files, 0 failures.

Size (session_01QdSkAamnkagsBNMwfgAvuB): test runs 34, module lines 2,330

## J2 · COMPLETE

COMPLETE (T41-52). Every entry applied; Completion in this record.
- **R48:** `ACT_HELP` is re-generated from `3660c18803`: 211 of 215 texts held, the eleven T41 owed texts under their ops, the four retired ops left out. Tested with negative controls.
- **D54:** R13's EXISTENCE arm (your K2578) is built. The pair facts `project_participant` and `project_target_owner` are false there, never null (R15's positions, not contents; a null would offer `cite`). converts and plane are re-stated with negative controls.
- **T41's ops:** the grades are in catalogue's closed sets; new `t41.test.mjs` (R12, R41) and `t41-backing.test.mjs` (R19: all eight reasoned ops at their owners).
- **Retired ops:** t33 and t34 re-stated; t34 R42 reads publish-schedule's map. Rule 4 (11), (12), (20) and (22)'s affordances shares are cleared.
- **Tests:** module 242/0. Users (tasks, queue, op-declarations, store-door, control-plane, plane; 112 files) are 710/30 both with and without my change, file for file.
- **Checks:** format 0, coverage 34/34, ownership 0. Architecture shows 4 failures: the four new `uses` edges, for you to apply at merge.
- **Final uses:** add `steps`, `reading-guides`, `investigation`, `publish-schedule`. With them, architecture reads 0.

**B4 (CHANGE, K2593).** `tranche/T41` is merged in, carrying op-grades' re-merge (K2583, K2589).
- `catalogue.test.mjs` pins `guidepropose` (reversible, as `extractpropose`) and `guideproposetocivicsmith` (undetermined, as `guideoffer`) beside T41's other grades. That clears the rung-ladder and R27 count reds.
- No `ACT_HELP` change: the design file has no text for the new guide ops, and `ACT_HELP_ABSENT` is op-declarations'.
- Re-run: module 232 pass, 0 fail. Checks: format 0, architecture 0 (the four edges are applied), coverage 34/34, ownership 0.

Size (session_01QdSkAamnkagsBNMwfgAvuB): test runs 37, module lines 2,330

## J3 · COMPLETE

COMPLETE (B4, K2593): tranche merged in; catalogue pins op-grades' two new reading-guides grades (guidepropose reversible, guideproposetocivicsmith undetermined), clearing the ladder and R27 count reds; no ACT_HELP change (no design text; ACT_HELP_ABSENT is op-declarations'). Module 232/0 (J2's 242 was an addition error; corrected in the record). Checks: format 0, architecture 0, coverage 34/34, ownership 0. Ready to merge again.
