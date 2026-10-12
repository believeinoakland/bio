# local-facts (T46)

**Status** · session_0132BkHEZ5G69QAFjomHQvCD · depth 2 · COMPLETE · handled B1

## Working notes

**Reading (mechanics §17).** I read these whole:
- my requirements, `build/requirements/local-facts.md` (public and private parts);
- all my code: `src/local-facts/` (`index.mjs`, `rules.mjs`, `checks.mjs`, `paths.mjs`, `schema.mjs`);
- all my tests: `test/m/local-facts/` (the fixture and eight test files);
- my entry T46-9 and the "Rules at the opening" in `build/plan/current.md`;
- `build/layers.md`'s head and the layer table (layer 5's contract);
- BOB's START (B1);
- `words.json`'s `refusal.*` rows for C-126 (on the tranche, identical to main @ 3f40899950);
- membership's `HANDLE_WORDS` and extraction's `TRANSCRIBE_WORDS` with its test helper `words.mjs` (the pattern R16 names);
- the plane's spread of my map (`src/plane/store.mjs` 759–763).

I did not re-read the public parts of my Uses. No change in this job touches them.

**Entries applied (T46-9).**
- **R15** (N935). `localFactsOps` gains the arm `grouprules`. It calls R12's `groupRules({section, viewer})`. `section` comes from the query (absent is read as none) and `viewer` from the URL, so a body can set neither. The map now has one arm per act and read, eight in all. Until plane T46-62 removes its own named `grouprules` entry, that entry overrides the spread arm, and both answer alike.
- **R16** (DEC-194, N913). New `RULE_WORDS` in `checks.mjs`, exported from `index.mjs`. It holds the nine `refusal.<CODE>` sentences of `words.json` that C-126 has, each `en` verbatim. Their rows read their translations from it by key.
  - Eight translations change: C-126.6, .7, .8, .9, .10, .12, .14 and .15.
  - C-126.13 `RULE_SELF_CONFIRM` already read as its key; it now reads it by key.
  - `{errors}` in C-126.8 is left for the screen, and the refusal's `errors` stay beside it.
  - The seven rows the list does not hold keep their words.
  - No code, number, `where` or behaviour moved.
  - On BOB's adoption conditions: none of the nine names the group's Civicsmith, and each matches what its refusal does. RULE_IN_PROFILE's "Your places' rules" covers both the profiles and an applied group rule. NO_SUCH_GROUP_RULE's "or none you can see" matches the refusal given to a viewer who names no member. RULE_NEEDS_QUALIFICATION's "500 characters" is `RULE_STATEMENT_MAX`.
- Tests: new `t46.test.mjs`, with helper `words.mjs` (a key the list lacks throws):
  - R15: the map's eight arms; the `grouprules` arm deep-equals `groupRules` with no section, each section and an unknown section (its refusal); the viewer is the URL's, never the body's; the body's section is not read; a control; the read writes nothing.
  - R16: the codes the list holds are exactly the nine; each row's translation equals its key's words; the seven others keep their pinned words; every check and `where` is pinned; each keyed refusal reached at the interface answers the list's words, with RULE_ENTRY_INVALID's `errors` unchanged; control: RULE_NO_REASON keeps its own.

**Found in my own module (P8).** I read all of it. One flaw is deferred: `groupRules` (R12) mints `RULE_SECTION_UNKNOWN` inline, outside a DEC-49 region, a second site beside `ruleDraft`'s `is-rule-section`. Moving it into one function of its own would move C-126.7's `where`, which R16 holds unmoved in this job. Answer and row are identical at both sites. Fix it in a later job: one `sectionRefusal` function, with its `where` re-pointed. Nothing else needs fixing.

**Found outside my module.** Each of these pins local-facts' map at seven ops, or `grouprules` as served elsewhere. R15 makes them stale (green on the tranche before this change, red after):
- `plane` (T46-62): `test/m/plane/` "R11, R5: every op of local-facts' and filing-templates' maps is in the route map …" expects the seven-op key list. T46-62 also removes its named `grouprules` entry from `src/plane/store.mjs` (R15, plane R39).
- `affordances` (T46-45): `test/m/affordances/catalogue.test.mjs` "R1 R12 R24: the op maps of filing-templates and local-facts hold exactly their ops …".
- `op-declarations` (T46-51): `test/m/op-declarations/t45.test.mjs:117,211`, "R49, R6 …", answers "grouprules is served now: drop it from SERVED_ELSEWHERE".
- Generated artifact: the plane bundle is staled (rule 5 (4)). The eight re-worded rows wait for T47's stamp (rule 5 (2)).

**Tests and checks** (on `job/T46/local-facts`, after the change):
- `node --test test/m/local-facts/`: tests 60, pass 60, fail 0.
- The users of the map and the rows, mine against the tranche:
  - store-door 45/45, action-clocks 66/66, filings 92/92, duties 62/62, actions 110/110;
  - plane 210 pass 1 fail (tranche 211/0);
  - affordances 232 pass 2 fail (tranche 233 pass 1 fail; the extra is the R15 pin above, the other is inherited R48 ACT_HELP);
  - op-declarations 134 pass 6 fail (tranche 135 pass 5 fail; the extra is R49, R6 above).
- Layer tests: none named in `build/manifest.md`.
- `format`: 159 modules, 152 requirements files; 0 failures.
- `architecture`: 16 product files, 51 relative imports; 0 failures.
- `coverage`: 16 of 16 live requirement ids named by a test; 0 failures.
- `ownership`: 5 files changed by local-facts; 0 failures.

Size (session_0132BkHEZ5G69QAFjomHQvCD): test runs 6, module lines 1380

## J1 · COMPLETE

T46-9 applied: R15 and R16. I read my code and tests whole (record: Working notes).
- R15: localFactsOps gains the grouprules arm. It is R12's groupRules, with section from the query and viewer from the URL; a body sets neither. The map now has eight arms.
- R16: the nine C-126 rows words.json holds now read their words by key through RULE_WORDS (checks.mjs). The eight named rows are re-worded; RULE_SELF_CONFIRM's words are unchanged; {errors} is left for the screen. No code, number, where or behaviour moved. Every sentence passed your adoption conditions.
- New tests: t46.test.mjs and words.mjs. local-facts 60/60. format, architecture, coverage (16/16) and ownership each have 0 failures.
For you:
1. R15 makes three pins in other modules stale; each was green on the tranche before this change:
   - plane "R11, R5 … local-facts' and filing-templates' maps" (T46-62, which also removes its named grouprules entry);
   - affordances catalogue.test "R1 R12 R24 … filing-templates and local-facts hold exactly their ops" (T46-45);
   - op-declarations t45.test "R49, R6" ("drop grouprules from SERVED_ELSEWHERE", T46-51).
2. The plane bundle is staled. The eight re-worded rows wait for T47's stamp.
3. One flaw is deferred: groupRules mints RULE_SECTION_UNKNOWN at a second site. Fixing it would move C-126.7's where, which R16 holds; it should go in a later job.
