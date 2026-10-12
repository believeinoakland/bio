# reading-guides (T46)

**Status** · session_01JBdeWvyDiLY6TLEqW8MkkE · depth 2 · WORKING · handled B1

## Completion (READING-GUIDES #3)

**Entry applied.** T46-15 (N913; DEC-194): R14. In `src/reading-guides/checks.mjs` a frozen `READING_GUIDES_WORDS` holds `words.json`'s `refusal.GUIDE_KIND_UNKNOWN`, `refusal.GUIDE_ITEM_UNSOURCED` and `guide.procedure.legalinfo` verbatim (as on `main` @ 3f40899950; the tranche's copy is byte-identical). Rows C-144.4 and C-144.19 take their translations from it by key, as `membership`'s `HANDLE_WORDS`, `extraction`'s `TRANSCRIBE_WORDS` and `duties`' `DUTIES_WORDS` do. `index.mjs` re-exports it, and R13's `PROCEDURE_GUIDE_LABEL` reads `says` from it by its key ("Legal information, not legal advice"; the key and the label's shape `{key, says}` unchanged). Codes, numbers, `where`s and behaviour are unmoved. The other 17 rows are byte-identical: their canonical JSON's sha256 is the same before and after, and the test pins it. `words.json` holds no `refusal.<CODE>` for any of them.

**Reading of the two sentences against what the refusals do.** `refusal.GUIDE_ITEM_UNSOURCED` matches the refusal (one route with no citation; nothing written). `refusal.GUIDE_KIND_UNKNOWN` ("…one kind of action or document your group's places recognise, and this names another") also covers the refusal's third case, a `purpose` that is neither `reading` nor `procedure`. Read that way, the kind given is not one the guide's stated purpose recognises, and the `detail` still says "a guide's purpose is reading or procedure". I took it as matching, since R14 names it, and asked no question. Both sentences say "Nothing was written.", which is true, and neither names the Civicsmith bare or a place.

**How the reading set was read (mechanics §17).** I read these whole in this session: `build/requirements/reading-guides.md`; the Purpose and Provides of `doctypes`, `record-grammar`, `civil-time`, `record-core`, `membership` and `jurisdictions`; layer 6's contract and its sections in `build/layers.md`; my entry and the plan's opening rules in `build/plan/current.md`; every file of `src/reading-guides/` and `test/m/reading-guides/`.

**Own code and tests read whole (P20).** I found no flaw this job needed to fix. Two header comments were brought up to date (R1–R14; R11, R14). Nothing is deferred.

**Found in other modules.** None. These are rows changed for the census, and artifacts made stale (both accepted reds, nothing for another module to do):
- `system/row-census.test.mjs` names exactly C-144.4 and C-144.19 (alongside L5's rows) as "changed with no record": rule 5 (2), until T47's stamp.
- The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), `release/` and the other bundles that hold the reading-guides source (the old label string is at `dist` :209594) are stale by this change: rule 5 (4), regenerated at the layer close. I touched none of them.

**Tests and checks.**
- `node --test bio-plane/test/m/reading-guides/`: tests 57, pass 57, fail 0 (52 before). New: `t46-words.test.mjs`, five tests naming R14. `procedure.test.mjs`'s R13 label assertion now expects the words of `guide.procedure.legalinfo` (R14 amends R13).
- Negative controls: with C-144.4 back on its own sentence and the label in lower case, R14's tests fail 3 of 5; with the T45 source, the file fails. Restored, they pass.
- Users of the module (`modules.json`): skills 113/113, plan-work 40/40, answer-envelope 32/32, agent-worker 15/15. Three are red, and red the same on the base without this change, so the reds are inherited: affordances 232 pass / 2 fail (ACT_HELP R48, rule 5 (7); the local-facts map test), op-declarations 134 / 6 (R21/R27 registry, rule 5 (7); the R19 and R49 map tests), plane 210 / 1 (local-facts' and filing-templates' maps).
- `build/manifest.md` names no layer tests.
- `format`: 0 failures. `architecture reading-guides`: 0 failures. `coverage reading-guides`: 14 of 14 live ids named; 0 failures. `ownership reading-guides tranche/T46`: 5 files changed; 0 failures.

Size (session_01JBdeWvyDiLY6TLEqW8MkkE): test runs 14, module lines 1005
