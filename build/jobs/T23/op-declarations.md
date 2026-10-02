# op-declarations (T23)

**Status** · session_01RCSAiipg9P4tjeS3JTkyBJ · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Two ops served today have no spec, and R10 does not list either. R6 asks a spec for every op any module serves. My best reading, which I am building now:

1. `directorysubmission` (network-notices R23; its ops map, `networkNoticesOps`). I declare it as `notices`: a read for a member session only, classes `admin`, `member`, `machineClasses: []`, in both session sets, `viewer` stamped, in network-notices' read list. No NEEDS row (escalationstatus's shape): affordances R32 does not name it in NON_ACTS, so a null row would be stale in affordances' totality.
2. `publicread` (public-read's door, `PUBLIC_READ_DOOR_OPS`; the door's own op for a registered read, `op=publicread&name=<name>`). I declare it `classes: null`, not mutating, as `publishedmanifest` (the door's other four ops all have specs), in no session set, no NEEDS row.

Also for the record: the three public reads (`activitymethod`, `noticespublic`, `groupkeyspublic`) and the five T23 reads affordances R32 names in NON_ACTS (`escalationreasondraft`, `whatchangeddrafts`, `sweeps`, `noticeprepare`, `notices`) each get a present null NEEDS row, K516's precedent; otherwise affordances' R12 reads them as stale. So `escalationreasondraft` is `escalationstatus`'s spec and list, but with a null row, which `escalationstatus` does not have. K1158 says op-declarations already named `escalationreasondraft`; it did not (only my test's negative check named it). Nothing to do.

## Work on B1 (R10)

**Applied** (B1; `build/plan/current.md` T23 L11, op-declarations; N485: K1025, K1035, K1051; K1094; DEC-111, K1100). R10 met on my reading, with J1's two ops pending BOB's answer. All in `bio-plane/src/op-declarations/index.mjs`:
- **OPS:** `escalationreasondraft`, a read like `escalationstatus`; `whatchangedpropose`, mutating, any credential, like `templatepropose`; `whatchangeddrafts` and `sweeps`, reads (admin, member, probe); `noticeprepare`, `notices` and `directorysubmission`, reads, and `noticepost`, mutating, each `classes: ["admin", "member"], machineClasses: []` (like `knocksof` and `inboxpull`); `activitymethod`, `noticespublic`, `groupkeyspublic` and `publicread`, `classes: null`, not mutating (like `publishedmanifest`).
- **Lists (the stamps):** `escalationreasondraft` joins `ESCALATION_READS`, and through it `ACTION_LAYER_READS` (viewer). It sits in the same places as `escalationstatus`. New `MONITORING_READS` (`sweeps`) joins `ACTION_LAYER_READS`, as monitoring's act joins the action layer's acts (viewer). New `WHAT_CHANGED_PROPOSAL_ACTIONS` (`proposedBy`, viewer) and `WHAT_CHANGED_READS` (viewer). New `NETWORK_NOTICES_ACTIONS` (`noticepost`) and `NETWORK_NOTICES_READS` (`noticeprepare`, `notices`, `directorysubmission`), all viewer. New `NETWORK_NOTICES_BY` (`noticeprepare`, `noticepost`; `by`). New `NETWORK_NOTICES_PUBLIC_READS`, which stamps nothing.
- **SESSION_OPS:** every session-reached op above is in both sets. The four public ops are in neither.
- **NEEDS:** `whatchangedpropose` and `noticepost` are `contribute`. The eight reads affordances R32 names in NON_ACTS each have a present null row. `directorysubmission` and `publicread` have no row.

**Found in other modules (REPORT):**
- **control-plane** stamps by its own code, list by list. Four of the new lists need it:
  - `WHAT_CHANGED_PROPOSAL_ACTIONS`: the proposer label, as `TEMPLATE_PROPOSAL_ACTIONS` gets it. case-authoring reads `proposedBy` from the query's `author`, so the door sets `author` to the label. Also viewer.
  - `WHAT_CHANGED_READS`: viewer.
  - `NETWORK_NOTICES_ACTIONS` and `NETWORK_NOTICES_READS`: viewer.
  - `NETWORK_NOTICES_BY`: `by` (network-notices reads `by`, else `author`).
  - Until the door wires them, those ops reach their module unstamped and fail closed. `ESCALATION_READS` and `ACTION_LAYER_READS` already carry viewer, so `escalationreasondraft` and `sweeps` are stamped today.
- **plane:** `NETWORK_NOTICES_PUBLIC_READS` is the list of declared names to hand `publicReadDoorOp` as `helpers.publicReads` (public-read's record).
- **affordances:** R32 does not name `directorysubmission`. With no NEEDS row it is not gated, so totality holds without it.
- The plane bundle is stale: `src/op-declarations/index.mjs` changed. I regenerated nothing.

**Proposed wording for R9's last sentence (K1122):** "None is declared for `doorbellrefused` (R6). R6 holds over them." The sentence drops `escalationreasondraft` and the "What changed" ops, which R10 now declares.

**Deferred:** none.

## J2 · REPORT

R10 is built and pushed at 0467793d12, on my J1 reading. Details are in my record under "Work on B1".

**Tests:** `test/m/op-declarations/` 30/30. Five R10 tests in the new `t23.test.mjs` have negative controls. `tables.test.mjs` is updated: the public list, R3's reach of a public read, `ACTION_LAYER_READS` with `MONITORING_READS`, and the stale `escalationreasondraft` negative check.

**Whole `bio-plane/test/m`:** 5171 pass, 6 fail. All six are accepted reds:
- `control-plane/totality.test.mjs`:13: red 5. It is green without my change and red with it, because the new ops are unpublished or unranked until affordances merges. It names `activitymethod`, `escalationreasondraft`, `groupkeyspublic`, `noticepost`, `noticeprepare`, `notices`, `noticespublic`, `sweeps`, `whatchangeddrafts` and `whatchangedpropose`.
- `control-plane/families.test.mjs`:47, K1150, red until control-plane's merge.
- `control-plane/inbox-door.test.mjs`:81, red 9.
- `plane/worker.test.mjs`:39, red 6.
- `queue/catalogue.test.mjs` R1 and R5, red 13.

I re-ran the last four on the branch without my change: each is red there too.

**Checks:** format, architecture, coverage (10/10) and ownership (4 files) all show 0 failures.

**For control-plane (its L11 job):** the door must stamp four new lists by its own code. `WHAT_CHANGED_PROPOSAL_ACTIONS` gets the proposer label as `author`, which case-authoring reads as `proposedBy`, plus viewer. `WHAT_CHANGED_READS`, `NETWORK_NOTICES_ACTIONS` and `NETWORK_NOTICES_READS` get viewer. `NETWORK_NOTICES_BY` gets `by`.

**For plane:** `NETWORK_NOTICES_PUBLIC_READS` is the list to hand `publicReadDoorOp` as `helpers.publicReads`.

**Bundle:** the plane bundle is stale (`src/op-declarations/index.mjs`). I regenerated nothing.

**R9's last sentence (K1122):** I propose "None is declared for `doorbellrefused` (R6). R6 holds over them."

**Next:** I am waiting on J1's answer and on your CHANGE announcing affordances' merge. Then I merge `tranche/T23`, re-run and post COMPLETE.

## Completion

**Entries applied:**
- B1: R10 for T23's ops, with `directorysubmission` and `publicread` by R6.
- B2 (K1166): both J1 readings and the null NEEDS rows stand. Nothing changed.
- B3 (K1168): R9's wording is accepted, and BOB writes it at the merge. My note for plane is superseded: `NETWORK_NOTICES_PUBLIC_READS` stays exported and nothing hands it to the door in T23.
- B4 (K1169): I merged `tranche/T23`, which now carries affordances' R32.

**Deferred:** none.

**Found in other modules:** listed under "Work on B1". The door's four stamping lists are forwarded to control-plane (B3 (3)). The plane bundle is stale from `src/op-declarations/index.mjs`, and I regenerated nothing.

**Tests, after merging `tranche/T23` at bfa752a847:**
- `test/m/op-declarations/` and `control-plane/totality.test.mjs`: 31 pass, 0 fail. Red 5 is cleared.
- Whole `bio-plane/test/m`: 5173 pass, 5 fail. Each failure is an accepted red:
  - `control-plane/families.test.mjs`:47 (K1150)
  - `control-plane/inbox-door.test.mjs`:81 (red 9)
  - `plane/worker.test.mjs`:39 (red 6)
  - `queue/catalogue.test.mjs`:34 and :116 (red 13)

**Checks:**
- format: 87 modules, 0 failures.
- architecture: 5 product files, 0 failures.
- coverage: 10 of 10 live ids, 0 failures.
- ownership: 4 files, 0 failures.

Size (session_01RCSAiipg9P4tjeS3JTkyBJ): test runs 7, module lines 2471
