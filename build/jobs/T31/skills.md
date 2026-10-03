# skills (T31)

**Status** · session_01DcobKxG1hPDvC7ij2ey15E · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T31 L6):
- **N528, R1, R5, R9, R10, R32.** The pack's `recipes` layer is now `wizard_scripts` (R5, R9), fed from `published.wizard_scripts`. Each step is checked against `published.screens`: its `screen` must be published, and its `act`, unless null (a reading step, `wizard-scripts` R2), must be one of that screen's `acts`. The catalogue no longer decides steps (K262 (4)). A script with no steps, or a step naming an unknown screen or an act its screen does not list, throws naming the script, the step and the name (R10). Until the plane publishes them, the layer is a stated absence. New `wizard_authoring` layer, after `edition_statement` (R32, `skilldoctrine.mjs` `wizardAuthoringLayer`). It holds three clauses, each found by R21's normaliser: DEC-121's checks sentence in Interaction Constructs §P, and `ASSISTANT-PILOT.md` §3's "A script never says or submits anything for a member: …" and "No step submits, signs or files; …". It also reads `wizardpropose`, `wizarddraft`, `wizardrevise`, `wizardsubmit` and `wizardapprove` from the catalogue by id, each id named once as a selector (R23). R1's R32 arm: if `wizardpropose` is published and a named act is missing, the render throws. If `wizardpropose` is absent, the layer is R9's stated absence. The layer states that whether a step tells a member what to conclude is judged by the critique and the approving member, not by code (K1364 B3). `skillpack.mjs`'s header and the absence sentence are reworded to wizard scripts; "recipe" survives only inside the quote of §14b.1.
- **N538, doctrine rule 9's sentence.** Now reads "Civicsmith takes no position on what policy should be (Operational Principle 1).", as `BIO_Action_v0_1.md` §4 already does. Before this change it failed R28's test on `tranche/T31` (48/49), because the canon had moved. The pack's digest moves by itself (R11), and `DOCTRINE_EDITION` is unchanged (draft §L6 (c)).

**Deferred:** none.

**Found in another module (REPORT):** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`'s generated artifact; its manifest lists `skillpack.mjs` and `skilldoctrine.mjs`) is stale after this change. It needs regenerating at the layer close (mechanics §14). The agent-worker bundle takes no skills input (K683) and is unaffected.

**Tests and checks:**
- `node --test bio-plane/test/m/skills/`: tests 54, pass 54, fail 0. New file `wizard.test.mjs` (R32 ×5). `pack.test.mjs` R5, R9, R10 rewritten; `edition.test.mjs`'s order check re-pointed.
- Users' tests: agent-worker `requirements`, `wire-vocabulary`; affordances `plane`; run-rules `rules`; ai-runs `converts`; control-plane `catalogue-end`, `affordances-pack`. All pass, 0 fail.
- `format`: 0 failures. `architecture skills`: 0 failures. `coverage skills`: 32 of 32 live ids named, 0 failures. `ownership skills tranche/T31`: 0 failures.

Size (session_01DcobKxG1hPDvC7ij2ey15E): test runs 11, module lines 1991

## J1 · COMPLETE

skills T31 complete. Entries applied: N528 (R1's R32 arm, R5, R9, R10 against published.screens, R32 the wizard_authoring layer) and N538 (rule 9's sentence now reads Civicsmith; before this it failed R28's test, because the canon had already moved). Module tests 54/54. format, architecture, coverage (32/32) and ownership: 0 failures. Users' tests pass. REPORT: bio-plane/dist/bio-plane.bundled.mjs (not_product) is stale after this change and needs regenerating at the layer close. Details are in my record's Completion section.

## B2 CHANGE (strength merged)

Merged `tranche/T31` (with strength #11) into `job/T31/skills`, no conflict. `node --test bio-plane/test/m/skills/`: tests 54, pass 54, fail 0, R28's `action_planning` test among them (it now passes with rule 9 reading Civicsmith). format, architecture, coverage (32/32) and ownership: 0 failures.

Size (session_01DcobKxG1hPDvC7ij2ey15E): test runs 12, module lines 1991
