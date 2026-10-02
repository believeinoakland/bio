# monitoring (T23)

**Status** · session_01YcGTGLceU7FuKo6wgFMjYL · depth 2 · WORKING · handled B2

## J1 · QUESTION

**Size (P6), before building.** monitoring is 3,077 lines today (`index.mjs` 2,728, `checks.mjs` 199, `schema.mjs` 150). My estimate of R53–R64 as required: the linear-time matcher (R54: a parser for the regular-expression subset with classes, alternation, counted repetition, anchors, case folding, and a Thompson NFA simulation) about 350; C-18.5's sweep arm (R53, R54's refusals) about 130; R55's fence (diff of `sweeps[]` against the live image, owner and member tests, the ratifier read from history) about 130; the run (R56–R60: due, wake, tick, seeds, link extraction from HTML, feeds and sitemaps, the match, skips, filing at `collected`, backlog, anomaly, silence) about 500; reads and conditions (R61, R63, R30's slate) about 150; R64 about 50; tables and three rows about 70. Total about 1,380, so the module would reach about 4,450, past 4,000.

**My best reading, and what I do meanwhile:** I build the sweep in its own files under my path, `bio-plane/src/monitoring/sweep.mjs` (the run, reads, conditions, R55, R64) and `bio-plane/src/monitoring/sweep-match.mjs` (the matcher, pure, no record access), with the tables in `schema.mjs` and the rows in `checks.mjs`, the class `Monitoring` delegating to them, so a split is a move of two files and their tests. I carry on with the matcher and C-18.5 first (about 500 lines, taking the module to about 3,580), and stop before passing 4,000 unless you answer first.

**Question:** split the sweep out as its own module (your act), or accept monitoring past 4,000 with the sweep in those two files? If split: under what id and paths, so I write to them.
