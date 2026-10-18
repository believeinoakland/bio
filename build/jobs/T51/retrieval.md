# retrieval (T51)

**Status** · session_01JxyVZhdF7dFTzuF5dsCwRc · depth 2 · WORKING · handled B1

## Work notes (RETRIEVAL #20)

- **R88 met** (`index.mjs`): `routesCrossed(ast)` over `query-language`'s parse (`plan.ast`, its R1: no new requirement needed there; a `meaning` node of arm `passage` is the passages route, every other leaf the fields route). `search` and `meaningRows` refuse `ROUTES_CROSSED` (`routes: ["fields","passages"]`, `detail` naming both) before any statement runs. Readings I took: an `OR` is crossed when one branch holds a passage term and another branch of the same `OR` holds any other term, at any depth, a `NOT` keeping its operand's route; the parse is the plan's own, so under `rows=passage` bare words are already passage words (query-language R31) and `sewer OR parks` is not crossed there, and under `rows=leg` bare words are dropped (R32). The widened (OR) reading of an empty conjunction is not offered when it would cross routes (`widen` null). Tests: `t51.test.mjs` (R88 twice).
- **R89 met**: `scope.existence_only_projects` (`[{project, name}]` from `membership.existenceAct`, never `owners`) and `scope.existence_only_count`, on every meaning arm. The key `existence_only_count` for "their count" is my choice. Three existing tests that deep-equal the scope's keys (`content-arm.test.mjs` x3 assertions, `meaningread.test.mjs`) gained the two keys. Tests: `t51.test.mjs` (R89 twice).
- Stale comment `checks.mjs`:73 reworded (no longer cites `app.html`).
- **R87 and R90 not started**: both need `retrieval-browse` (R87 reads its `BROWSE_SCOPES` and `scopeMembers`, R13 there; R90 delegates to it). It is not built yet (its job just started). Waiting for BOB's CHANGE.
- Inherited/expected red: `words.test.mjs` "keys are the owner's declared list": `words-reads` already lists retrieval's 49 keys; the 15 moved keys leave `words.mjs` with the delete (R90).

## J1 · REPORT

R88 and R89 are met and pushed (index.mjs, t51.test.mjs; module suite 197 pass, 1 fail). R88 needed nothing new from query-language: I read each term's route from plan.ast. R89 adds scope.existence_only_projects and scope.existence_only_count. The stale checks.mjs:73 comment is reworded. Three existing tests that deep-equal the scope's keys gained the two R89 keys. R87 and R90 both need retrieval-browse (BROWSE_SCOPES/scopeMembers; the delegation), which is not built yet, so I am waiting for your CHANGE after it merges. The one red is words.test.mjs 'keys are the owner's declared list': it clears when the 15 moved keys leave words.mjs with the R90 delete. Record: build/jobs/T51/retrieval.md, Work notes.
