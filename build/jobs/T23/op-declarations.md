# op-declarations (T23)

**Status** · session_01RCSAiipg9P4tjeS3JTkyBJ · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two ops served today have no spec, and R10 does not list either. R6 asks a spec for every op any module serves. My best reading, which I am building now:

1. `directorysubmission` (network-notices R23; its ops map, `networkNoticesOps`). I declare it as `notices`: a read for a member session only, classes `admin`, `member`, `machineClasses: []`, in both session sets, `viewer` stamped, in network-notices' read list. No NEEDS row (escalationstatus's shape): affordances R32 does not name it in NON_ACTS, so a null row would be stale in affordances' totality.
2. `publicread` (public-read's door, `PUBLIC_READ_DOOR_OPS`; the door's own op for a registered read, `op=publicread&name=<name>`). I declare it `classes: null`, not mutating, as `publishedmanifest` (the door's other four ops all have specs), in no session set, no NEEDS row.

Also for the record: the three public reads (`activitymethod`, `noticespublic`, `groupkeyspublic`) and the five T23 reads affordances R32 names in NON_ACTS (`escalationreasondraft`, `whatchangeddrafts`, `sweeps`, `noticeprepare`, `notices`) each get a present null NEEDS row, K516's precedent; otherwise affordances' R12 reads them as stale. So `escalationreasondraft` is `escalationstatus`'s spec and list, but with a null row, which `escalationstatus` does not have. K1158 says op-declarations already named `escalationreasondraft`; it did not (only my test's negative check named it). Nothing to do.
