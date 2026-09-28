# skills (T10)

**Status** · session_016cFZMMXBeCHF8P3yJzn3ua · depth 2 · WORKING · handled B2

## J1 · QUESTION

N156 / R25: where does C-22.7's row live? As worded it cannot move into skills.

The facts. ai-runs holds the predicate that mints C-22.7 (`src/ai-runs/skill-version.mjs` `checkSkillVersion`, ai-runs R8; K82 (4), K194), and it builds the refusal from the row it reads out of the catalogue's `AI_RUN_CHECKS`. N156 says the row moves from the catalogue to skills (my R25). ai-runs is earlier in the order than skills, so once the row is in skills' paths ai-runs cannot read it (P4), and removing it from the catalogue leaves `refusal()` reading `undefined` (ai-runs R8 broken, and the DEC-49 row's `where` pointing at a site that no longer mints it). The catalogue cannot re-export it from skills either: `bio-checks.mjs` imports nothing, and `skilldoctrine.mjs` imports the catalogue, so that would be an import cycle evaluated at load.

My best reading (proposal): C-22.7 is held with its one minting site, in ai-runs (`ai-runs/checks.mjs`, its `where` re-pointed to `src/ai-runs/skill-version.mjs checkSkillVersion, called from src/ai-runs/index.mjs open`), as observation-log's map placed each C-22 row with its predicate and as DEC-49's one code, one site reads. skills then names it by key through ai-runs (`SKILL_CHECKS` selected from `airun.mjs`' `AI_RUN_CHECKS`, never copied), and R25 is reworded: "C-22.7 is named here by key from ai-runs, which holds the row with its predicate (R12); code, number and translation unchanged." That is ai-runs' change (its R35 and R8 wording, and AI-RUNS #3's code), so it is yours to place.

Meanwhile, on this reading, I am doing the rest of N156 now: `skillpack.mjs` re-exports ai-runs' `checkSkillVersion` and `parseSkillVersion` and deletes its copy; `SKILL_CHECKS` is re-pointed to read the row from ai-runs' `AI_RUN_CHECKS` (the same object the catalogue holds today, so nothing moves under anyone); `skilldoctrine.mjs`' `DEPLOYMENT_SEQUENCE`, `GATE_ADDRESS`, `SEQUENCING_SOURCE` and `SEQUENCING_ALSO_NAMED_IN` re-export `ai-runs/deployment.mjs` (through ai-runs' index) and its copy goes. R25's test holds the row's code, number and translation unchanged and that `SKILL_CHECKS` is the row `checkSkillVersion` mints; the clause "held in skills' paths" is a `test.todo` naming this question until you answer. The catalogue row itself I leave untouched.

If instead you rule the row does move into skills' paths, it needs ai-runs to stop minting it (the predicate moving back to skills, reversing K82 (4)), and I would build that on your word.
