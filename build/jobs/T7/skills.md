# skills (T7)

**Status** · session_01LeLpLCKuivZWf56gFwdetG · depth 2 · WORKING · handled B4

## J1 · QUESTION

Three readings I am building on; each answer can change a line or two, none stops the job.

1. **R25 and K82 (4): where C-22.7's row lives.** ai-runs (earlier) holds its own copy of `checkSkillVersion` (its R8, K82 (4)) and so must read the row, and it cannot import skills. So the row cannot leave the catalogue for skills' files without breaking that copy (and `civicos-ui/check-refusal-codes.mjs`, which walks `bio-checks.mjs`). **My reading:** as observation-log did for its seven C-22 rows (`observation-log/checks.mjs`), skills names the row as its own by key (`SKILL_CHECKS` in `skillpack.mjs`, selected from the catalogue, code, number and translation unchanged), its invariant and test live here (R25), and the row's text stays in `AI_RUN_CHECKS` until legacy-checks is emptied. `checkSkillVersion` stays implemented here until ai-runs' copy lands; then a CHANGE lets skills re-export it (K82 (4)), R12's tests unchanged.

2. **R19 against R21: meaning's absence fact.** R19 fixes meaning's `states_when_absent` as "no meaning derived"; R21 requires the four facts to be §14.3's own words, and §14.3 says "Nothing derived may only mean nothing was extracted; nothing extracted may only mean the document was never read; no document may only mean nobody looked." "no meaning derived" is not in §14.3. **My reading:** R21 (K102) wins: meaning's fact is `nothing derived`; proposed R19 text: `(meaning: "nothing derived"; content: "nothing extracted"; document: "no document"; internet: "nobody looked")`. The other three are unchanged.

3. **R21: which §14.3 sentences, and "canon".** Four-level rule: "absence at one level is not evidence of absence at the next". Search-completeness rule: "all four levels — meaning, content, documents, and the open internet — may need to be searched, in any order" (the §14.3 sentence the old CLAUDE.md line paraphrased; "A search that returns documents has not finished." is the alternative). Both cite `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3. R21's "that document is canon" I read as covering the resident sentences, the four facts and §14b.4's table (all canon); the prohibitions' `text`/`because` stay pinned to `PRACTICE-SURVEY.md` (reference, not canon) as R17 names, with their canon pin being `also_named_in` in INVESTIGATIVE-SESSION.md; and DEPLOYMENT_SEQUENCE's second pin in `docs/archive/IS-SWEEP-2026-08-07.md` stays as evidence, its canon pin being §2's sentence.

## J2 · QUESTION

Adds to J1 (J1's three readings stand). **R10: a change to `renderPack`'s input, so BOB's first.** The recipes and the surface registry are `civicos-ui`'s (`SURFACES`, 3 recipes, validated there); no plane op publishes either, and this module may read nothing later in the order. So skills cannot meet R10 alone. What it can build now is its half, so R10 is met the day the plane publishes them (an `affordances` entry). Proposed text, which I am building on and will remove if you say no:

- Terms: **published** is the plane's own answer to `op=affordances` with no target, `{catalog, vocabularies, capture_acts}`, and, once the plane publishes them, `surfaces` (the surface registry, `[{id, …}]`) and `recipes` (`[{id, steps: [{surface, act}, …], …}]`), passed in unchanged.
- **R9** Until `published.recipes` is a list, `recipes` has `load_when` `"never, in this edition"`, `sourcing` `absent`, `body` `[]` and a non-empty `absent_because`: the absence is stated in the pack itself.
- **R10** When `published.recipes` is a list, `recipes` has `sourcing` `driven`, a non-empty `load_when` and `body` the recipes unchanged; `renderPack` throws, naming the recipe, the step and the unknown name, and renders nothing, when a recipe has no steps, or a step names a surface not in `published.surfaces` or an act not among `published.catalog`'s ids, so a pack rendered at build fails the build. *(not yet met in the product: the plane publishes neither, SK-5; `affordances`' to publish)*

If you prefer R10 left wholly unbuilt, say so and I drop it; R9 is met either way.

## J3 · COMPLETE

**Completion (SKILLS #1).** Handled through B3; tranche/T7 merged (K181, K182).

**Entries applied**
- **Extract per map and requirements (K102).** The code already sat at its paths. C-22.7 is this module's row, named by key (`SKILL_CHECK_KEYS`, `SKILL_CHECKS` in `skilldoctrine.mjs`, re-exported by `skillpack.mjs`) and selected from the catalogue, its text staying in `AI_RUN_CHECKS` while ai-runs holds its own copy of the predicate (R25, K181 (7)). `checkSkillVersion` refuses through it. The levels, states and definitive set are imported from `observation-log/index.mjs`, no longer from `airun.mjs`.
- **R21** (not yet met, now met): `FOUR_LEVEL_RULE` "absence at one level is not evidence of absence at the next" and `SEARCH_COMPLETENESS` "all four levels — meaning, content, documents, and the open internet — may need to be searched, in any order" are §14.3's sentences, `AUTHORED_SOURCES` and `FACTS_SOURCE` name the Content Framework, and the resident `four_level` carries `section: "Part II §14.3"`. The four facts are §14.3's, meaning's now "nothing derived" (R19 as folded). The comments citing `CLAUDE.md` for the rule now cite §14.3.
- **R10** (K182): `renderPack` carries `published.recipes` as a `driven` layer and throws, naming the recipe, step and unknown name, on a recipe with no steps or a step whose surface is not in `published.surfaces` or whose act is not a catalogue id. Absent, R9's stated absence is unchanged. It stays not yet met in the product until the plane publishes both (N144).
- **N53, its share:** this module's tests are under `bio-plane/test/m/skills/` and read nothing later in the order. The MODES-equals-order dereference of `agent-worker/src/harness.mjs` is agent-worker's (its R44), and the `decorateAct` spelling pin is control-plane's; the comments naming the old suites now say so. Releasing the four old `bio-plane/test/skill*.test.mjs` suites and their controls is legacy-tests' share.
- **N70, its share:** the doctrine's source moved to canon (R21). Old skillpack suite now **49 pass, 0 fail** (F3, F4 green). Old skilldoctrine **42 pass, 1 fail**: ARM E3 still pins the facts to `CLAUDE.md` by design; it is legacy-tests' to release (N53). Old skillprohibitions 30/0, skillsequencing 27/0.

**Not applied, and why:** B2's re-point of `VERSION_STRENGTH_CHECKS` and `VERSION_STRENGTH_INERT_SOURCES` to `../strength/index.mjs` is not made. Neither `bio-plane/src/strength/` on this branch nor `job/T7/strength` @ 1732b0f8 has that file yet, so re-pointing now would leave this module unable to load and its tests unrunnable. `skilldoctrine.mjs`'s import comment says it re-points when the family moves. **Please send a CHANGE once STRENGTH #1's `strength/index.mjs` exports both names**, or merge it; I re-point and re-run steps 5–7 against it. Until then the import stays the catalogue's, and it breaks at the layer close if strength removes C-30 from the catalogue first.

**Found in other modules**
- `ai-runs`: old `test/airun.test.mjs` ARM D1 and D3 are red, 132 pass / 2 fail, identically on `tranche/T7` without my change (the C-22 family count and each allocation's enforcement site). Not caused here.
- **Process tool:** `mail state --set WORKING` exits non-zero ("Command failed: git commit") when the state is already WORKING, because there is nothing to commit. It should treat a no-op as success.
- No generated artifact staled by this job: the plane bundle (`not_product`) is rebuilt at the close; the agent-worker bundle does not include these files.

**Tests and checks**
- `node --test bio-plane/test/m/skills/`: tests 29, pass 29, fail 0 (every R1–R26 named; R1's imported-empty arm drives the real `renderPack` in a child process with observation-log's entry mocked). Negative controls, run by hand and reverted: a changed word in the four-level rule fails R21; a typed `"LOOKED_ABSENT"` literal fails R23; a moved fact fails R19 and R21; a fence selector that stops selecting fails R1 and R7.
- Users: `agent-worker/test/wire-vocabulary.test.mjs` 83 passed, 0 failed (imports `reportsAs`). Old battery driving C-22.7 at the open: airun-contextkind 44/0, aicredential 97/0, machinefences-dec49 89/0.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture skills`: 6 product files, 19 relative imports; 0 failures. `coverage skills`: 26 of 26 live requirement ids named by a test; 0 failures. `ownership skills tranche/T7`: 7 files changed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01LeLpLCKuivZWf56gFwdetG): test runs 16, module lines 1700

## J4 · COMPLETE

**Completion again, after B4 (SKILLS #1).** Merged `tranche/T7` @ e68efc95f9 (strength, K188).

**Applied:** `skilldoctrine.mjs` imports `VERSION_STRENGTH_CHECKS` and `VERSION_STRENGTH_INERT_SOURCES` from `./strength/index.mjs` (K181 (3)); every other catalogue import is unchanged. My tests read the moved families from strength too: R15's keyed-number walk includes `strength.VERSION_STRENGTH_CHECKS`, and R23's corpus takes the inert sources from strength. Everything else in J3 stands. Commit 46cc9f2fce.

**Found in another module (legacy-tests):** the old `bio-plane/test/skilldoctrine.test.mjs` and `skillprohibitions.test.mjs` no longer load (`SyntaxError: '../checks/bio-checks.mjs' does not provide an export named 'VERSION_STRENGTH_INERT_SOURCES'` / `'VERSION_STRENGTH_CHECKS'`). They import those names from the catalogue themselves, so strength's move broke them; this job did not. Both are superseded by `test/m/skills/` (N53), so they are legacy-tests' to release. The old skillpack suite is 49/0 and skillsequencing 27/0.

**Tests and checks**
- `node --test bio-plane/test/m/skills/`: tests 29, pass 29, fail 0. `skillpack.mjs` loads on the merged tranche.
- Users: `agent-worker/test/wire-vocabulary.test.mjs` 83 passed, 0 failed.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture skills`: 6 product files, 21 relative imports; 0 failures. `coverage skills`: 26 of 26 live requirement ids named by a test; 0 failures. `ownership skills tranche/T7`: 7 files changed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01LeLpLCKuivZWf56gFwdetG): test runs 18, module lines 1701
