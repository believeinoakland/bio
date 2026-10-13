# local-facts (T47)

**Status** · session_01G56L1KMznsLn8FVL1J9JKD · depth 2 · COMPLETE · handled B1

## Record

**Entry applied** · T47-14 (N946, K231): R17. `rules.mjs` now has one builder, `sectionRefusal(section)` (its region `is-rule-section`), beside `machineRuleRefusal` and `noSuchRule`; `ruleDraft` (R10) and `groupRules` (R12) each call it, and neither builds the refusal itself any more. Their orders and answers are unchanged: the draft still asks `MACHINE_CANNOT_DRAFT_RULE` first, and the read still refuses an unknown section before it reads the viewer, with absent and null meaning no section. C-126.7 keeps its code, number and translation (R16's key); its `where` moves to `src/local-facts/rules.mjs sectionRefusal > is-rule-section`. As BOB's START says, the moved row stays red in the row census until T48's stamp (rule 5 (2)).

**Tests** · new `t47.test.mjs`, three tests naming R17. (1) For nine unknown sections (a word, another profile section, a case variant, an empty string, a 60-character string, a number, an object, an array, a boolean), `ruleDraft` and `groupRules` answer `deepEqual` refusals: exactly the keys `{ok, reason, code, check, translation, detail, section, sections}`, `section` cut to 40 characters (null when not a string), `sections` the two names; each answer is its own copy; the `grouprules` ops arm answers the same refusal; nothing is written. (2) Controls: the machine refusal still comes first; a known section passes on to the entry check; absent, null and the two known sections are no refusal. (3) The row's code, number, translation and `where`, and no other row naming that region. `t46.test.mjs`'s row pin for C-126.7 follows the moved `where`. Against the old source only (3) fails: the two copies already behaved alike, and R17 changes where the refusal is built, not what it answers.

**Read** · whole, by me: `build/requirements/local-facts.md`; all of `bio-plane/src/local-facts/` (index, rules, checks, paths, schema) and all of `bio-plane/test/m/local-facts/`; the Purpose and Provides of record-grammar, jurisdictions, civil-time, connection-grammar, record-core, membership, lines, content and provenance; `build/layers.md` (header, layer 5's row, "No jurisdiction in the product"); my plan entry and the plan's opening rules.

**Flaws in my own module** (P8) · I found none that breaks a requirement.

**Deferred** · nothing.

**Other modules and generated artifacts** · nothing found in another module against its requirements. Generated artifacts this change makes stale (mechanics §14; none written by me): `bio-plane/dist/bio-plane.bundled.mjs` (accepted red 4, regenerated at the layer's close), and the copies that carry the plane's text, `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs` and `newgroup/dist/newgroup.bundled.mjs`, each still holding C-126.7's old `where`. No service I provide changed (the refusal's fields are the same), so I re-ran no user's tests.

**Tests run** · `node --test bio-plane/test/m/local-facts/`: tests 63, pass 63, fail 0. Layer tests: none named in `build/manifest.md`.

**Checks** (process repository) · format: 165 modules, 164 requirements files; 0 failures · architecture local-facts: 16 product files, 51 relative imports; 0 failures · coverage local-facts: 17 of 17 live requirement ids named by a test; 0 failures · ownership local-facts tranche/T47: 5 files changed; 0 failures · `checks/run.mjs`: architecture 3066 product files, 9360 relative imports, 0 failures; coverage 41 failures, every one another module's T47 ids not yet met (rule 5.1), none local-facts'; channels 0 failures.

Size (session_01G56L1KMznsLn8FVL1J9JKD): test runs 2, module lines 1383
