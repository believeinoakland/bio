# events (T48)

**Status** · session_01Hh14tQpXPK6FZSMjo3UbV7 · depth 2 · COMPLETE · handled B3

## Completion

**Read:** whole, by this session: `build/requirements/events.md`; layer 5's contract in `build/layers.md`; my entry T48-19 and the opening's rules in `build/plan/current.md`; every file of my code (`index.mjs`, `schema.mjs`, `checks.mjs`, `time.mjs`, `follow.mjs`, `owner.mjs`, `uses.mjs`, `recorded.mjs`); and the tests I changed or wrote on (`fixture.mjs`, `pages.test.mjs`, `relations.test.mjs`, `events.test.mjs`) (P20). The reading set was 740 KB, over the 600 KB limit (mechanics §17 (3)). Two helpers in this session read the rest in full and wrote digests citing each section: (1) the public part of all 13 modules in my Uses, and entities' R53 on `tranche/T48`; (2) my other eight test files (`ops`, `datedfacts`, `owner`, `participants`, `recordedby`, `follow`, `reads`, `uses`). The sources stayed binding: I read `owner.test.mjs`'s parts myself before changing them, and entities' `notAProceeding` at its source.

**Entries applied:** T48-19 (N1031, K3145), R52 (K3207, after B2), and N1063 (K3228).
- **R50.** Each item in `timeline`'s world lane now also answers:
  - `participants`: the event's participants exactly as R26 answers them, with superseded rows left out, at most `ITEM_PARTICIPANTS_MAX` (50), in R26's order;
  - `participants_total` and `participants_truncated`;
  - `grade`: the governing attestation's grade. It is null, with `grade_why`, for an item placed nowhere, including one whose dated attestation the viewer cannot see, and one whose cache is stale (`grade_why` says so).

  Only attestations in sight are listed or counted (R40). The fields are computed only for the items the limit answers, and each capture's resolutions are read once per call. The "what we did" lanes are unchanged.
- **R51.** `RELATION_KINDS` gains `precedes`. `relate` refuses it as follows:
  - `MEMBER_ACT_ONLY` for a machine or absent stamp, after R17's refusals;
  - the attestation's own refusals;
  - `ORDER_ALREADY_DATED`, with `answer` naming R31's answer, when the pair's `when`s already order it at the act.

  The relation is held, graded and withdrawn as every relation is. `sequence` now works as follows:
  - **Dates settle the order:** they govern, `basis: "dates"`, and each standing `precedes` relation the viewer may see is answered beside it in `cited`, with `agrees`.
  - **Dates leave it undetermined:** a direct standing relation in sight answers `before` or `after`, `basis: "cited"`, with `relation_id`, `grade`, `relation_ids` and `dates_why`.
  - **Relations order the pair both ways:** `undetermined`, "the cited orders disagree", with both ids.
  - **Never:** no chain, nothing stored, never withdrawn by the module.

  A stale cache still fails closed. `precedes` is the owner's `event_precedes` link (R35), so OWNER_KINDS has 24 kinds.
- **R52.** `proceedingStatusAt` answers `entities.notAProceeding(detail, {entity_id})`, so the code, its row C-91.9 and its sentence are entities'.
- **N1063.** The R35 walk test in `pages.test.mjs` is now bounded by its work rather than by a clock. The fixture's `metered` counts the statements run and rows read, which no machine load changes. What it proves is not loosened:
  - The walk (4 pages, then 4,000 vote nodes) is held to at most 6 statements and 20 rows a vote; measured, it is about 5.1 and 16.4.
  - A vote answered from its page must cost at most a third of the same node asked alone; measured, about 3 statements against 20.
  - With the batching disabled, the test fails, at 112,192 statements (it also overran the 10 s budget).

  Under 8-way load I measured that even the main thread's own CPU time grows about 1.5×, so no clock measure is load-independent. The time stays as a diagnostic.

**Flaws found in my own module and fixed (P8):**
- `#itemsFor` kept an event's roles apart from the attestations they rest on. A role resting on a hidden capture was answered beside a visible one in `eventsFor`, `timeline` and `statementsOf` (R40). Each role is now kept with its attestation.
- `owner.test.mjs`'s R35 page-cost test had the same load-sensitive clocks as N1063 (four pages under half the budget; a kind not asked under 200 ms). It is bounded the same way: at most 3 statements and 9 rows a vote, and at most 5 statements and 5 rows for a kind not asked.

**Tests:**
- New `drawn.test.mjs`, 11 tests, each with its control:
  - R50: 4 tests;
  - R40 roles: 1 test;
  - R51: 5 tests (cited before/after with grades, testimony graded D; `ORDER_ALREADY_DATED` after R17's refusals and `MEMBER_ACT_ONLY`; disagreement, no chain, withdrawn and unseen relations; dates later governing with `agrees`, nothing stored; the `event_precedes` connection);
  - R52: 1 test, equal to `notAProceeding`'s answer, through the op too.
- `relations.test.mjs` R17's closed list gains `precedes`.
- `owner.test.mjs`: the kind count is 24 and names `precedes`, with the work bounds above.
- `pages.test.mjs`: N1063.

**Deferred:** none.

**Found in another module:** nothing new. The users' reds below are red identically without this change.

**Tests and checks run:**
- events, `node --test bio-plane/test/m/events/` after merging `tranche/T48` (B3): tests 75, pass 75, fail 0. `pages` and `owner` run 8 times at once: 7/7 each time.
- The 29 modules that use events, with `test/system/migrate-released.test.mjs`, before B2: tests 3100, pass 3074, fail 17, cancelled 1. The cancelled one is migrate-released under load; alone it passes 1/0.
  - The 17 failures are in 12 files, and each fails with the same counts on `tranche/T48` without this change (a worktree at 9bd8d7ad5f):
    - affordances `t36` (2);
    - answer-envelope `envelope` (1) and `families` (1);
    - control-plane `envelope`:433 (1);
    - filings `t46` (1);
    - following `checks` (1);
    - op-declarations `t33` (1), `t34` (2), `t37` (1), `t38` (1), `t46` (3), `t47` (2).
  - Rule 5 (6) names answer-envelope `families` R2, `envelope` R14 and control-plane `envelope`:433. The others are not events' and are left to their modules' entries.
  - R52 changed only the refusal's added fields: none of them reads `proceedingStatusAt`'s refusal shape.
- `node checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
- `node checks/architecture.mjs . events`: 21 product files, 71 relative imports; 0 failures.
- `node checks/coverage.mjs . events`: 52 of 52 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs . events tranche/T48`: 8 files; 0 failures.
- `node checks/run.mjs` over the product:
  - format 0, architecture 0 (3,279 files) and channels 0 failures;
  - coverage 44 failures, all other modules' ids not yet met (rule 5 (1)), none of them events'.

Size (session_01Hh14tQpXPK6FZSMjo3UbV7): test runs 12, module lines 2688
