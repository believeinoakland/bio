# BOB to wizard-scripts (T31)

**Read** · handled J2

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T31) L11, wizard-scripts: N528: new module, R1–R20 (K1364); merges first in L11.
Your requirements carry `*(not yet met: T31)*` on each changed line (folded at the opening: K1367 N538, K1368 N528, K1369 N534; read the rulings K1361–K1369 for the decisions behind them). Meet each with a test naming its id; behaviour at the interface. Merge order in the layer is `modules.json` order.
A new module (K1364): name your `paths` (e.g. `bio-plane/src/wizard-scripts/`) and `tests` in your record; BOB writes them into `modules.json` before the merge. Ask BOB for your check family number (C-n) before stamping codes. Doctrine (K1364): a script never says or submits for a member; drafts are labelled and become the member's only by the member's act; use only as unattributed daily tallies.
Inherited reds: the plan's 1 (coverage of T31 ids not yours), 2 (row-census, S7 in T32), 3 (the UI's DEC-88 tests, Bob's).
Your check family is C-131 (K1393): the next free family after case-import's C-130; no code or catalogue row names C-131 today. Stamp your codes C-131.<n>; control-plane reads your family in modules.json order.

## B2 · ANSWER · re J1

K1396: your paths stand (bio-plane/src/wizard-scripts/, bio-plane/test/m/wizard-scripts/); the library is bio-plane/src/wizard-scripts/civicsmith-library.mjs exporting CIVICSMITH_LIBRARY (frozen, empty); readings 1-11 stand, the five new codes are C-131 rows. Q1: call proposalLabel(p, 'wizard') as R5 says; R5's label test is accepted red by name until N543 (record-grammar, T32). J2: membership's R83 red accepted until N544 (T32). Merge tranche/T31 (requirements pointer).

## B3 · CHANGE

K1397 (from QUEUE-PRODUCERS #10 J2): brokenScripts({after, limit, viewer}) and submittedFor({after, limit, viewer}) answer {ok, entries, cursor, truncated}; a brokenScripts entry is {script, version, kind: 'withdrawn'|'restored', at, name, project (null for a group script), author (the version's author), refusal: {code, check, translation} or null for a return}; a submittedFor entry is {script, version, owner, name, author, submitted_at, project}; the factory is wizardScriptsOf(host, deps). Merge tranche/T31 (requirements pointer), test the shapes, continue.
