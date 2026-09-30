# skills (T18)

**Status** · session_01WZbhNakAfMP7YbpXxh8Xzd · depth 2 · COMPLETE · handled B4

## J1 · QUESTION

Four readings I am building on now (step 3); each needs your wording or ruling, none blocks me.

(1) §1a, "R1, R3, R7 as folded": `skills.md` on the tranche still words R1 and R3 over `machineFences(catalogue)` (the fold did not re-word them). My reading, from K585 (1): `renderPack(published)` takes one argument; `boundary.fences` is `published.fences` carried unchanged, `fences_sourcing` `driven`; R1's "`machineFences(catalogue)` is empty" becomes "`published.fences` is not a non-empty list" (the throw names `published.fences`); R7's `machineFences(catalogue)` unchanged and pure, for control-plane to compute `fences` with (layer 11). Proposed R1 clause: "... `published.fences` is absent or not a non-empty list ...". Proposed R3: "`boundary.fences` is `published.fences`, unchanged (control-plane's `machineFences` over its `CHECK_FAMILIES`, K585 (1)) ...". Proposed Terms: **published** gains `fences`.

(2) R28's `acts` against R23. R28 says the acts are "read from `published.catalog` by id ... never typed as a list here"; the catalogue publishes no property marking a proposal act, and `action-plans` is later in the order, so an id must be named to be read. My reading: each id is named once, as a selector (R23's `machine` precedent), in a map keyed by the requirement that defines it, and the entry carried is the catalogue's own, unchanged. Proposes: `optionpropose` (action-plans R11), `standardpropose` (standards R9), `comparisonpropose` (conformance R12), `theorypropose` (filings R14), `communicationprepare` (filings R23). Leaves to a member (the act a member takes on each, from the same requirements and §4 rule 1): `optionadopt` (action-plans R11), `standardadopt` (standards R9), `determine` (conformance R12), `filingapprove`, `filingsent` (filings R6, R7). Proposed R23 re-wording: "... the published tokens it names are the `machine` act mode and R28's act ids, each a selector over the published catalogue."

(3) R28/R29, a missing act. R29: no `optionpropose` in the catalogue → the layer is R9's stated absence (`load_when` "never, in this edition", `sourcing` `absent`, `body` `{}`, `absent_because` naming the plan mode and the missing act). With `optionpropose` present, another named act missing is R1's throw naming it (the fold's `deltas/skills.md` note), so no half layer renders. Proposed R1 clause: "... or, when `published.catalog` holds `optionpropose`, an act R28 names is not in it". The present form's `load_when` is R28's sentence with ", in the plan mode" appended (R29).

(4) Convert `skillsequencing` (the R18 wording to propose): "R18 ... and the re-exported object states who owns each later mode's enabling condition (`enabling_condition_owned_by`), what no gate reaches (`does_not_reach`, naming its C-109.1 and a deployment) and that it holds no gate (`holds_no_gate`), none carrying control-flow authority (R16); the rendered `deployment_sequence` layer is `authored` and its note states it is instruction holding no flag." Tested that way; the fields are run-rules' R9 object, read through the re-export.

Also: my `airun.mjs` / `ai-runs/deployment.mjs` re-points and R29's "R18's order carries `plan` last" wait for your CHANGE that run-rules has merged.

## J2 · REPORT

§1a applied at 76c333a1c6: `renderPack(published)` renders `published.fences` and throws when it is not a non-empty list (R1, J1 (1)). Two effects in `agent-worker`, both its §1a entry this layer, reported for its job:

(a) `agent-worker/test/requirements.test.mjs`:84 builds `PACK = renderPack(PUBLISHED_ANSWER, CATALOGUE)` at load; its `PUBLISHED_ANSWER` has no `fences`, so the suite now fails at load ("op=affordances published no fences"). Measured: agent-worker's `test/` was 3 pass / 4 fail on the tranche (agent-worker.test, fanout, harness, versions: its own N402 arms), 2 / 5 with this branch; the new red is requirements.test alone. The fix is its fixture carrying `fences: machineFences(CATALOGUE)` (skills R7, the same harvest control-plane will publish), or its R48 stub answer.

(b) `agent-worker/src/index.mjs`:385 `renderPack(pub.result, CATALOGUE)`: the second argument is now ignored, and until control-plane publishes `fences` (layer 11, K585 (1)) the live plane's answer carries none, so R48's render refuses `PACK_UNRENDERABLE` (502) before any turn. Reached only when model turns run (`model` set), so nothing changes in a deployment today; but between layer 6 and layer 11 no pack renders against the live plane. Accept as the order's consequence, or have agent-worker's R48 read `fences` from the stub until control-plane's merge.

Old suites now red and left unrun (K653): `test/skillpack.test.mjs` (renderPack with a catalogue, C4 arms), `test/d260-resume.test.mjs`:213, `test/skillsequencing.test.mjs` block E (all render against a live `op=affordances` without fences); `test/system/machinefences-dec49.test.mjs` still calls `machineFences(CATALOGUE)`, unchanged.

## J3 · COMPLETE

Job complete on `job/T18/skills` (@ this entry; code at 76c333a1c6 and the re-point commit after it), tranche merged through 652ab1a3c9 / run-rules 8d070e74ec.

**Entries applied**
- N-A3 (K608) and K660: the `action_planning` layer (R5's order, R28, R29) in `skilldoctrine.mjs` (`ACTION_RULES`, `PLANNING_ACTS`, `actionPlanningLayer`), spread into the pack before `recipes`. Rules 1–3, 6, 8–10, 12, 13, each heading and sentence found in its own numbered paragraph of `BIO_Action_v0_1.md` §4 by R21's normaliser. Acts per K674: each id named once as a selector keyed by its defining requirement, the catalogue's own entry carried unchanged. No `optionpropose` published → R9's stated absence (today's plane); with it, any other named act missing → R1's throw naming it.
- §1a (K585 (1); N245, N337, N403): `renderPack(published)` renders `published.fences` unchanged (`driven`), R1 throws on absent or empty fences; `machineFences(catalogue)` unchanged and pure (R7), for control-plane R41.
- Convert `skillsequencing` (skills' share): R18's new clauses (owner of the enabling condition, `does_not_reach` naming C-109.1 and a deployment, `holds_no_gate`, no control-flow authority; the layer `authored`, its note instruction holding no flag).
- Re-points (after B3): `airun.mjs` and `ai-runs/deployment.mjs` imports → `run-rules` in both source files and the tests; R29's "plan last" pinned in R18's test.
- Marks met, for BOB to strike (rule (5)): R28, and R29's skills half (the absence, rule 12's clause, `plan` in `load_when`, the order's `plan` last). R29's "a plan-mode segment refuses before any turn" is `agent-worker` R48's. Still not met, unchanged: R10 (SK-5), R27's imported form (contradiction R41). No catalogue row moved or changed (nothing `awaiting stamp`).

**Deferred:** nothing.

**Found in other modules**
- `agent-worker` (J2): `test/requirements.test.mjs`:84's fixture carries no `fences` (red at load since 76c333a1c6); `src/index.mjs`:385 R48 refuses `PACK_UNRENDERABLE` against the live plane until control-plane publishes `fences` (layer 11), reached only with model turns. Both its §1a entry.
- `run-rules`: R14's `deploys_apart.plan.deployed` is a boolean inside the re-exported `DEPLOYMENT_SEQUENCE`, which the `deployment_sequence` layer carries into the pack; its note said "holds no flag". Handled here (R18's test admits exactly run-rules' `deploys_apart.<mode>.deployed`; the note now reads "holds no flag of its own", naming the plane's open as the reader). No change asked of run-rules.
- Old suites now red, left unrun (K653): `test/skillpack.test.mjs`, `test/d260-resume.test.mjs`:213, `test/skillsequencing.test.mjs` block E (each renders over a live `op=affordances` without `fences`, or with a catalogue argument).

**Tests and checks**
- `node --test bio-plane/test/m/skills/`: tests 39, pass 39, fail 0 (new `planning.test.mjs`: R28 ×4, R29).
- Layer tests: none named in `build/manifest.md`. Users of `renderPack`: agent-worker `test/` 2 pass / 5 fail with this branch vs 3 / 4 on the tranche, the one new red `requirements.test.mjs` (J2).
- `checks/format.mjs`: 82 modules, 77 requirements files; 0 failures. `architecture.mjs … skills`: 7 product files, 37 relative imports; 0 failures. `coverage.mjs … skills`: 29 of 29 live requirement ids named by a test; 0 failures. `ownership.mjs … skills tranche/T18`: 8 files changed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01WZbhNakAfMP7YbpXxh8Xzd): test runs 14, module lines 1696
