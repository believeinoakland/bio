# admission (T41)

**Status** · session_01XRFXxX3r77uSXKpEg4sgCD · depth 2 · WORKING · handled B0

## J1 · QUESTION

Q1 (testing against op-declarations' T41 declarations, not yet merged). `OPS` on `tranche/T41` still declares `groupswitchset` and declares neither `handlecheck` nor `accountusesset` (op-declarations R24, R41, R42, T41-58, its job still WORKING). My best reading, which I am building on now: admission is later in the order than op-declarations, so I write R3's, R19's and R22's tests against the real `OPS` with no stand-ins (K2507's stand-ins are for jobs earlier in the order): R3 finds `handlecheck` declared public and in `SCRATCH_ADDRESSING_PUBLIC_OPS`; R19 finds no `groupswitchset` spec (so `aiScopeDeclaration` refuses it `AI_SCOPE_UNKNOWN_OP`) and `accountusesset` session-only (`machineClasses: []`, refused `CLASS_FORBIDDEN` to every binding class). Those arms are red on `tranche/T41` until T41-58 merges; the code change itself (`handlecheck` in the scratch-addressing list, its `NO_SUCH_INVITATION` counted) does not depend on it. I will verify them green against `job/T41/op-declarations` once its job completes, and post COMPLETE after your CHANGE brings its merge, unless you prefer COMPLETE now with those arms listed as red until T41-58.
