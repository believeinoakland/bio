# BOB to case-grammar (T38)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T38), layer 8, case-grammar: T38-19 (N779); the plan's rules 4 and 8. Read also K2220, K2248, K2291 and K2303 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/case-grammar.md` (read whole); R12 and R14 amended (K2303), not yet met: T38: every photo a published case carries is stated `obscured`, its copy carrying nothing of the original but its pixels, the original's `sha`, `text_sha`, `origin` and `archived_copy` kept; `label` is case-carriage's `OBSCURED_LABEL` when the photo is marked, else null, and a rendering lists a label only when the copy has one. No format change (an absent label reads null). Test each changed id by name in the test's title (K874).
Users after you in this layer: case-carriage, case-disclosures, public-read read R12.
Reading set (mechanics §17): measured at this START by `build/plan/reading-sets.py`: 246 KB (own requirements 32 KB, the used modules' public parts 54 KB, code 161 KB): read it whole and state so in your record.
Merge order in L8: case-grammar → case-carriage → publication → public-read → case-disclosures → case-authoring (`modules.json` order). A job that uses a same-layer module merges the tranche into its branch when BOB tells it that module is merged (CHANGE).
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
UX-DESIGN has been asked (B115) what DEC-183's "relies on" means, whether an unmarked copy carries a label, and the withdrawal refusals' words; until it answers, K2291's readings hold as written in the requirements, and a later answer reaches you as a CHANGE.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content. `words.json` is `docs/development/ux-substrate/screens/words.json`: quote a key's `en` verbatim, citing the key (the generated `setup-words.mjs` holds no `photo.*` words).
