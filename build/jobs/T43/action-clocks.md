# action-clocks (T43)

**Status** · session_014tjdf4yFn78qjmuSy3i49E · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**T43-20 applied on `job/T43/action-clocks` (0bbde8c0ba). Tests only.**

**Entry applied**
- `fixture.mjs` `w.action()` (was :162) now prepends the default `counterparty` (`CP`) and `action_kind: records_request` only when the caller's `lines` do not carry that top-level key themselves. A front-matter key is written once (promotion R38, C-2.1; record-grammar R9). No assertion and no other file changed.
- Rule 4 (11)'s action-clocks reds are cleared, each with its assertion unchanged: `calendar.test.mjs`:60, 132, 201, 247, 278 and `factreader.test.mjs`:39, 72, 80, 119, 138. `overdue.test.mjs`:151 (rule 4 (8)) passes.

**Deferred:** nothing.

**Found in other modules:** nothing new. The digest found no user's public part that depends on this fixture.

**How the reading set was read (mechanics §17)**
- **Read whole by me:**
  - `build/requirements/action-clocks.md`;
  - every file under `src/action-clocks/` (`index.mjs`, `count.mjs`, `ics.mjs`, `checks.mjs`, `schema.mjs`);
  - every file under `test/m/action-clocks/` (the fixture and 9 test files);
  - `build/layers.md` (its head table, "No jurisdiction", the layer 9 contract and the action-grammar section);
  - the plan's T43-20 entry and rule 4;
  - K2625 and K2706.
- **Read by one helper agent in this session:** the public parts, in full, of the 14 used modules and of the 8 users (filings, action-plans, monitoring, affordances, queue-producers, op-declarations, answer-envelope, plane). It wrote a digest citing each section. Its points: actions R9 holds `counterparty` as one map, never a list; record-grammar R9 makes a duplicate top-level key a C-2.1 finding; promotion R38 refuses that finding at the door (K2706 extends it to creations). So the fix needs no requirement change.

**Tests**
- action-clocks, `node --test test/m/action-clocks/`: 55 pass, 0 fail (before: 45 pass, 10 fail).
- My users:
  - filings 70/0; action-plans 63/0; monitoring 124/0; queue-producers 84/0; plane (with `test/system/migrate-released.test.mjs`) 185/0.
  - affordances 231 pass, 1 fail: `t36.test.mjs`:55, rule 4 (10).
  - op-declarations 125 pass, 8 fail: `t34`:68, 145, 307; `t37`:105, 177, 218; `t38`:76, 87. All rule 4 (10).
  - answer-envelope 25 pass, 5 fail: `catalogue-end`:17, `envelope`:63, `families`:49, 377, 424. All rule 4 (9).
- None of these reds is mine.

**Checks** (from civicos-process)
- format: 147 modules, 146 requirements files; 0 failures.
- architecture . action-clocks: 15 product files, 68 relative imports; 0 failures.
- coverage . action-clocks: 15 of 15 live requirement ids named by a test; 0 failures.
- ownership . action-clocks tranche/T43: 1 file changed; 0 failures.

Size (session_014tjdf4yFn78qjmuSy3i49E): test runs 10, module lines 0 (src unchanged; fixture +5 −2)
