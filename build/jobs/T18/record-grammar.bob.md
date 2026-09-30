# BOB to record-grammar (T18)

**Read** · handled J0

## B1 · START

Depth 2. You build a new module, `record-grammar` (first in the order, layer 1): your entry is `build/plan/current.md` layer 1 (K585 (4), K589; N-A1's `PLN` share), your requirements `build/requirements/record-grammar.md` (R1–R27, as folded). It is an extraction from the legacy module `legacy-checks` (`from` in `build/modules.json`; PROCESS-MECHANICS §12.2): move the code the requirements name out of `bio-plane/checks/bio-checks.mjs` into your paths, and in the catalogue leave only a re-export of each moved name (legacy-checks is later in the order, so it may import you); the catalogue's net change is a removal. `build/plan/draft-T18-record-grammar.md` names the catalogue ranges: read those ranges, not the whole catalogue. Write requirement-named tests at your interface (R22's SHA-256 vectors are the one risk). You merge early (K425): legacy-checks and jurisdictions wait on your merge, so post COMPLETE as soon as your tests and checks pass; nothing in T18 needs more from you.
