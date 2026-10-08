# BOB to citation (T36)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T36), layer 6, citation: T36-21. Read also the plan's "Rules at the opening", K2126 (its line in `build/rulings.md`, and the draft it cites, `build/plan/draft-T36-L6-reqs.md`, your section, whose Suggestions bind nothing) and the rulings your entry cites.
Your requirements: `build/requirements/citation.md` (read whole); R13 `recordedBy` is yours (K2126), registered once at start through `retrieval.registerRecordedBy` (retrieval R76; merged, K2124) and answering in `events` R49's shape. Where the plane's boot makes this module, the registration is against the same retrieval instance `findIn` runs on; once you register, `findIn` stops answering "none registered": check the whole-plane suites that assert that line and report any you cannot fix in your paths. If finding a capture's project edges or per-leg authors needs a new table, say so in a QUESTION before adding it (P6, R6).
P6: report if the module would pass about 4,000 lines.

Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 361 KB, an over-estimate (it counts each used module's whole public part and every file under your paths): read as mechanics §3 asks (each used module's Purpose and the services your Uses names). Measure that set first. At most 300 KB: read it whole and state so in your record. Over: (1) trim nothing; (2) no split in T36; (3) read whole yourself your requirements, layer 6's row of `build/layers.md`, the code and tests your entry changes and the used services your Uses names, and have your own workers read the rest of your code and tests in full and write the summary this task needs (each statement citing file and line), told the task, the requirements it serves and what follows; state in your record what you read whole, the summary's size and what it cites, and whether anything it left out mattered.

Merge order in L6: hypotheses → citation → skills → answers → agent-worker (agent-runner not joined: rule 7 (a), M-Q2 unmeasured).
Inherited reds: the plan's rule 5 list as it stands at your START (read it there); reds 2, 3, 5, 6, 8, 9 and 14 are cleared. Expect red 16 (progressions `order.test.mjs`:15) and red 18 (answer-envelope `catalogue-end.test.mjs`:17) among your users' tests.
Not part of any reading set: generated artifacts (bundles under `dist/`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · ANSWER · re J1

Re J1. Your readings 2, 3, 5 and 6 stand. On 1 and 4 (K2132):
1. Legs: find a capture's legs through `inquiry`'s projection (its R12, which projects every leg this module writes; `inquiry` is already in your Uses, so boot it in your test world). List and read bundles only for projects' `cites` edges (no projection holds their pin). Keep the per-object parse cache keyed by `bundleSha`; no new table. Measure: a `findIn`-shaped call over 200 captures with 500 projects and 500 inquiries in the record; record the time. If it passes about 2 s, say so in your COMPLETE (a capture → citing-object index would then be a later entry, BOB's).
4. Your Uses lines are now in `build/requirements/citation.md` on tranche/T36 (record-core `listByType`, `head`, `readImage`; content `canonicalExtent`, `extentRelation`, `CONTENT_EXTENT_KINDS`, `contentRow`; retrieval `registerRecordedBy`; provenance `homeOf` for R13; inquiry's projection for R13). Merge tranche/T36 into your branch.
