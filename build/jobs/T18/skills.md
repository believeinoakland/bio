# skills (T18)

**Status** · session_01WZbhNakAfMP7YbpXxh8Xzd · depth 2 · WORKING · handled B1

## J1 · QUESTION

Four readings I am building on now (step 3); each needs your wording or ruling, none blocks me.

(1) §1a, "R1, R3, R7 as folded": `skills.md` on the tranche still words R1 and R3 over `machineFences(catalogue)` (the fold did not re-word them). My reading, from K585 (1): `renderPack(published)` takes one argument; `boundary.fences` is `published.fences` carried unchanged, `fences_sourcing` `driven`; R1's "`machineFences(catalogue)` is empty" becomes "`published.fences` is not a non-empty list" (the throw names `published.fences`); R7's `machineFences(catalogue)` unchanged and pure, for control-plane to compute `fences` with (layer 11). Proposed R1 clause: "... `published.fences` is absent or not a non-empty list ...". Proposed R3: "`boundary.fences` is `published.fences`, unchanged (control-plane's `machineFences` over its `CHECK_FAMILIES`, K585 (1)) ...". Proposed Terms: **published** gains `fences`.

(2) R28's `acts` against R23. R28 says the acts are "read from `published.catalog` by id ... never typed as a list here"; the catalogue publishes no property marking a proposal act, and `action-plans` is later in the order, so an id must be named to be read. My reading: each id is named once, as a selector (R23's `machine` precedent), in a map keyed by the requirement that defines it, and the entry carried is the catalogue's own, unchanged. Proposes: `optionpropose` (action-plans R11), `standardpropose` (standards R9), `comparisonpropose` (conformance R12), `theorypropose` (filings R14), `communicationprepare` (filings R23). Leaves to a member (the act a member takes on each, from the same requirements and §4 rule 1): `optionadopt` (action-plans R11), `standardadopt` (standards R9), `determine` (conformance R12), `filingapprove`, `filingsent` (filings R6, R7). Proposed R23 re-wording: "... the published tokens it names are the `machine` act mode and R28's act ids, each a selector over the published catalogue."

(3) R28/R29, a missing act. R29: no `optionpropose` in the catalogue → the layer is R9's stated absence (`load_when` "never, in this edition", `sourcing` `absent`, `body` `{}`, `absent_because` naming the plan mode and the missing act). With `optionpropose` present, another named act missing is R1's throw naming it (the fold's `deltas/skills.md` note), so no half layer renders. Proposed R1 clause: "... or, when `published.catalog` holds `optionpropose`, an act R28 names is not in it". The present form's `load_when` is R28's sentence with ", in the plan mode" appended (R29).

(4) Convert `skillsequencing` (the R18 wording to propose): "R18 ... and the re-exported object states who owns each later mode's enabling condition (`enabling_condition_owned_by`), what no gate reaches (`does_not_reach`, naming its C-109.1 and a deployment) and that it holds no gate (`holds_no_gate`), none carrying control-flow authority (R16); the rendered `deployment_sequence` layer is `authored` and its note states it is instruction holding no flag." Tested that way; the fields are run-rules' R9 object, read through the re-export.

Also: my `airun.mjs` / `ai-runs/deployment.mjs` re-points and R29's "R18's order carries `plan` last" wait for your CHANGE that run-rules has merged.
