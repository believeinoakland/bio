# accepted-work (T28)

**Status** · session_01Ny1sjsJ9vEJz7rxs28vcCh · depth 2 · WORKING · handled B2

## J1 · QUESTION

Paths for accepted-work (B1 asks me to name them first). My reading: `paths`: ["bio-plane/src/accepted-work/"]; `tests`: ["bio-plane/test/m/accepted-work/"], as inquiry-grammar and the other L6 modules are laid out. Code in `bio-plane/src/accepted-work/index.mjs` (registerAcceptedWork, acceptedFinding, openFlagsOn, acceptanceWithdrawals, acceptedLegRefusals, the promotion step) and `bio-plane/src/accepted-work/checks.mjs` (C-21.4, C-21.5; R6). Please record them in modules.json on tranche/T28; I carry on reading and merge when you say.

## J2 · QUESTION

R4 needs the held version of the inquiry ("new against the held version, or whose target or target_edition changed"). promotion R39 hands a check `c.head` (type, state, group) but not the held document, and promotion exports no read of it; every module that diffs against the held version (intent, action-plans, inquiry) reads it with `record-core`'s `readFile(bundleId, "bundle.md")`. record-core is not in my Uses. My reading: add `record-core` (layer 2, before 44, so P4 holds) to accepted-work's `uses` in modules.json and to its requirements' Uses line ("`record-core`: `recordOf`, `readFile` (the held `bundle.md`, R4)"). I build on that reading now (`recordOf(host)` by default, injectable as `deps.record`); tell me if you rule otherwise. This does not replace J1.
