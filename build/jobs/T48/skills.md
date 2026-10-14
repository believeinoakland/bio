# skills (T48)

**Status** · session_01KCURAq6vZGsaFCde763fAA · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (T48-34):
- (N996 §5) `skilldoctrine.mjs`'s account citation (the interface translation section's header, was :1640) re-pointed: `credentials.accountFor` (its R35) → `ai-accounts.accountFor` (its R7), and `credentials` R51 → `ai-accounts` R20, meaning unchanged. No other `credentials` citation is held in the module's code or tests (R35's switch was already cited as `ai-accounts` R4 in the requirements; the code names no module for it).
- (N670) R49: `readingTranslationLayer(catalog)` in `skilldoctrine.mjs`, rendered in `disclosed` after `action_drafting` and before `procedure_guide`; `SOURCING` gains `reading_translation` (`authored`) and `reading_translation_unpublished` (`absent`). Body: `clauses` (`READING_TRANSLATION_CLAUSES`: §L "Translation by groups" and "Translation"; DEC-127 (3), (4) from its ruling; DEC-157 (6)'s two local-words clauses, now held once as `OFFICIAL_LOCAL_NAMES` and `GROUP_LOCAL_WORDS` and shared with R39's layer, whose rendering is unchanged), `task` (`READING_TRANSLATION_TASK`, the module's own words, R48's form), `mode` (run-rules' `DRAFT_MODE.mode`, read), `acts.drafts` (`readtranslate`, the catalogue's own entry, `defined_by` `plane R50`, named once as a selector), and a note. Without `readtranslate` published, R9's stated absence.
- Every clause R49 names was found in canon; none was authored, none reported missing. `a member's own words stay hers` is canon's "stay theirs", quoted as canon has it.
- Not carried: run-rules R33's `DRAFT_REACH.reading` (an unmerged same-layer change; R49 does not ask for the reach), so this job uses no unmerged change and merges on completion.

**Read** (mechanics §17, K2032): my requirements, both code files and the four test files I changed or added (`translation`, `action`, `fixture`, plus `pack` around its R5 test) read whole by me; the remaining twelve test files and the used modules' public parts (and `ai-accounts` R4, R7, R20) read whole by one helper in this session, who wrote me a digest citing each test and requirement. I read my own code whole, not only what I changed (P20).

**Flaws found in my module, dealt with:** the R5 order test and R46's position test were the only order assertions to move (updated: `pack.test.mjs` R5, `action.test.mjs` R46 now "after reading_translation"). Deferred, with why: the helper noted that doctrine.test's R24 scan of `body.clauses` and pack.test's R22/R26 run only over the default `published()`, so layers absent by default are scanned only by their own R16 tests (as R49's is, present and absent); widening that shared scan to every catalogue is a test refactor beyond this entry, harmless today since each layer's own test covers it.

**Found in other modules:** none.

**Tests and checks:**
- `node --test test/m/skills/` (bio-plane): tests 125, pass 125, fail 0 (7 new R49 tests in `readtranslation.test.mjs`).
- Modules that render the pack: `investigation/interview`, `affordances/plane`, `answer-envelope/families`, `answer-envelope/catalogue-end`, `run-rules/rules`, `ai-runs/converts`, `control-plane/affordances-pack`: 62 of 63 pass; the one failure, `answer-envelope/families.test.mjs`, fails identically before my change (playwright-core not installed in `src/journey-check`; environment, not code).
- `format`: 168 modules, 0 failures. `architecture … skills`: 0 failures. `coverage … skills`: 49 of 49 live ids named by a test, 0 failures. `ownership … skills tranche/T48`: 6 files, 0 failures. `checks/run.mjs`: architecture 0 failures; coverage's 36 failures are other modules' (inherited, none skills').
- Generated artifacts: none stale (no bundle takes skills since T18 L6, manifest).

Size (session_01KCURAq6vZGsaFCde763fAA): test runs 6, module lines 3183

## J1 · COMPLETE

T48-34 complete on job/T48/skills. R49: the reading_translation layer after action_drafting (authored; clauses from §L, DEC-127 (3), (4), DEC-157 (6), every one found, none authored; task in the module's own words; readtranslate read by id, defined_by plane R50; R9's stated absence without it). The account citation re-pointed to ai-accounts R7 and R20. Uses no unmerged same-layer change (DRAFT_REACH.reading not carried; R49 does not ask for it). skills tests 125/125; format, architecture, coverage (49/49), ownership: 0 failures. Record: build/jobs/T48/skills.md.
