# op-declarations (T23)

**Status** · session_01RCSAiipg9P4tjeS3JTkyBJ · depth 2 · WORKING · handled B1

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
