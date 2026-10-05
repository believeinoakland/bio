# id-spaces (T33)

**Status** · session_015zS8AH6HPe7cvTXdZEZsTf · depth 2 · WORKING · handled B2

## J1 · QUESTION

R27/R28 and the court-citations seam. `modules.json` gives id-spaces no `uses` edge to court-citations and court-citations no `paths` yet, so "read from that module when it is built" has no file to read. My best reading, which I am building now:
1. `reporters` is court-citations' exports as one object (its module namespace will do): I read `VARIANTS` (spelling → `{reporter, edition}` or a list of them, court-citations R1) and nothing else. A plain VARIANTS map passed bare is also accepted.
2. With no `reporters` passed, I read court-citations' data through a static import once it exists. Since court-citations merges before id-spaces in L1, I will merge `tranche/T33` after its merge and add the import then, against the path its merge registers, with BOB adding the `uses` edge `id-spaces → court-citations` to `modules.json` (BOB's file). Until then R28 holds: no data held, `{citations: [], undetermined: {why}}`.
Please confirm (or name the export path and whether you add the edge). Nothing else waits on this answer; I am carrying on with R1 and R27–R29 against `reporters`.
