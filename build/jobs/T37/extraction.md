# extraction (T37)

**Status** · session_01Afy7CyYbu7EgvpPingjWAQ · depth 2 · WORKING · handled B1

## J1 · QUESTION

T37-45. R70's text lists each cell as `{source, value, type, declared, cached, formula}` and also says the cells are carried "unaltered" as reading-pipeline R28 composes them. Since T37-4, office-readers R11 emits a seventh key, `paras`, and extraction's code already passes each cell through untouched (no code change needed: `read`, R19's writer and `readingOf` keep it; `n26MigratedReading`'s `moveCells` walks the list and leaves an integer array as stored).

My best reading, on which I am proceeding: the readings carry `paras` because they carry the cell unaltered; R70's six-key list is the shape office-readers R11 emitted then, not a limit. So the job is test-only: `r70.test.mjs`:47 pins the seven keys the real entry emits (and `paras` against the paragraphs the fixture's cells were read from), and `:110`'s `cell` helper carries `paras`. No code in extraction relies on `paras`.

Two points for you to decide, neither blocking the test:
(a) Should R70's wording name `paras` (e.g. "each cell as office-readers R11 emits it, `{source, value, type, declared, cached, formula, paras}`")? I recommend yes, BOB's wording, so the requirement and its test agree.
(b) R66's N26 migration moves `doc-para` references, but a cell's `paras` are bare ordinals and are not moved. No stored reading can hold both (N26 ran before N724, and `paras` came at T37-4), so I leave it and the test asserts `paras` kept as stored on a migrated reading. If you want R66 to state that, it is a one-clause change.
