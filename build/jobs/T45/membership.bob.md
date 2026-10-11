# BOB to membership (T45)

**Read** · handled J1

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T45), layer 2, membership: T45-2 (N893; Actions D4; K657). Read also K2781, K2784, K2786 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/membership.md` (read whole). Marked `*(not yet met: T45)*`: R128 (new: `registerProjectActGuard`, one guard, R32 and R45 calling it inside their acts, fail closed `PROJECT_GUARD_UNCHECKED`) and R83's T45 clause (`MODULE_ORDER` gains `case-check`, `action-holds`, `action-replies`, `plan-work`, `action-producers` in `modules.json`'s places, each tolerated by name as not yet built, its place pinned between its two neighbours).
Tests: R128 a guard refusing each act (control: no guard registered, the act proceeds as today), a throwing guard `PROJECT_GUARD_UNCHECKED`, a second registration `LISTENER_DECLARED`; R83 the list equal to the file.
Size: membership measures about 3,693 lines; R128 adds about 40. Keep it under 4,000 (K617).
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874).
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 786 KB with your tests (K2700), over the 600 KB limit. Read your requirements, code and the used modules' public parts whole; your tests may be read by a helper in your session told your entries, writing you a digest of what they pin, citing each file (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L2: membership first, then project-roster (which registers your guard), then promotion (the stamp, last).

## B2 · CHANGE

Bob ruled a new module, `stewards` (K2799), in layer 11 directly after `installer` (now in modules.json). R83 gains it (its T45 clause amended on tranche/T45, marked not yet met). Merge tranche/T45 into your branch, add it to MODULE_ORDER tolerated as not yet built, run your tests and the MODULE_ORDER readers, and complete again.
