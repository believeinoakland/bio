# BOB to action-grammar (T41)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T41), layer 9, action-grammar: T41-46a (new at K2505). Read also K2483, K2484 and K2505 (their lines in `build/rulings.md`).
Your requirements: `build/requirements/action-grammar.md` (read whole). Marked `*(not yet met: T41)*`: R13 (H30 (1); intent R33; K2505) a records request may be answered that no responsive record exists: `CORRESPONDENCE_OUTCOMES` (R2) gains `none_exists`, an outcome of a `received` decision as the others are (R5); a `records_request` may state `seeks`, 1 to 12 distinct `{progression, entity, stage}` (each a non-empty string of at most 200 characters); `seeksFindings(fm, facts, findings)` pushes one finding, its own new row in this module's family, for `seeks` on another kind, a malformed or duplicate item, more than 12, or an item whose stage `facts` (the caller's, read from `progressions`) says the progression does not declare, reading no record; `seeksOf(fm)` answers the well-formed items, `[]` when absent. Test each explicitly, with a negative control (K874). You stay pure: `progressions` is read by the caller (actions R70), never by you; no edge to it.
Reading set (mechanics §17): measured at this START: 239 KB by `build/plan/reading-sets.py`, within the 300 KB limit (an over-estimate: it counts each used module's whole public part; read as mechanics §3 asks, each used module's Purpose and the services your Uses names): read it whole, with your tests, and state so in your record.
Merge order in L9: conformance, consequences, action-grammar, actions, filing-templates, filings, action-plans (`modules.json` order; action-grammar (T41-46a) before actions (T41-47), K2505). Layer 8's modules are merged into `tranche/T41` before this START: build on them as merged. Same-layer providers you use: none. actions (T41-47: its R70 checks `seeks` through your `seeksFindings`/`seeksOf` and refuses with your R13 row; its R71 reads `none_exists`) uses yours next in this layer and merges after you; filing-templates (T41-48a) uses you too: say in your record whether anything it reads (the outcome list) changes. Record your final `uses` in your record, for BOB to apply at your merge.
Inherited reds: the plan's "Rules at the opening" rule 4 list as it stands at your START (read it there); yours: rule 4 (2), R13's new row awaiting T42's stamp (name it in your record); none other unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

CHANGE (K2552, from ACTIONS #14 J1): build R13's `seeksFindings(fm, facts, findings)` over `facts` keyed by progression key, each `{found, stages: [stage_key…]}` as `progressions.readProgression` answers (a key not held reads `found: false`, a finding of its own); each finding carries its row's `code` and `check`. Name the row's code in your record. actions R70/R71 build on exactly this.

## B3 · ANSWER · re J1

J1 confirmed (K2553), superseding B2's shape: (1) C-94.5's re-wording naming `none_exists` stands (a CHANGED row, rule 4 (2)). (2) Your shape governs: `facts.stages` = `{[progressionKey]: [stage_key…]}`, `null` for one not found, absent not judged; findings `check: "C-117.29"`, `code: "SEEKS_REFUSED"`, one per fault as you list; `seeksOf` as read. ACTIONS #14 is told to hand that shape.
