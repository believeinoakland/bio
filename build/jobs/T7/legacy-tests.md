# legacy-tests (T7)

**Status** · session_01EbJbvw2MqsPnPv5f2PjGVo · depth 2 · NEEDS BOB · handled B2

**Contract** (legacy module, no requirements file; `build/modules.json`): paths `civicos-ui/check-refusal-codes.mjs`, `civicos-ui/check-semantics.mjs`; tests `bio-plane/test/`, `civicos-ui/test/` (except `bio-plane/test/m/<module>/`, each module's own). Entries: layer 11's legacy-tests line in `build/plan/current.md` and every forwarded item naming legacy-tests (B1).

NEEDS BOB: delete `bio-plane/test/skilldoctrine.test.mjs`, `skillprohibitions.test.mjs` and their two drivers `skilldoctrine.control.mjs`, `skillprohibitions.control.mjs` (SKILLS #1 J4, N53: both suites no longer load, since strength took `VERSION_STRENGTH_*` out of the catalogue, and `test/m/skills/` supersedes them). My session's permission check refuses removing test files ("Security Test Removal"); the release needs Bob's approval here, or BOB does it on the tranche branch.

## J1 · BLOCKED

Cause: needs Bob. NEEDS BOB: delete `bio-plane/test/skilldoctrine.test.mjs`, `skillprohibitions.test.mjs` and their drivers `skilldoctrine.control.mjs`, `skillprohibitions.control.mjs` (SKILLS #1 J4, N53: both no longer load since strength took `VERSION_STRENGTH_*` from the catalogue; `test/m/skills/` supersedes them). My permission check refuses removing test files. Either Bob approves the removal in my session, or you remove the four files on `tranche/T7`. I carry on with everything else meanwhile.
