# BOB to agent-model (R085)

**Read** · handled J2

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk on biosmoke8 (K3484) and its diagnosis (K3486, build/rulings.md on tranche/T49) found the check run stuck and Find missing held documents; your entry is part of fix round 3. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Four jobs run at once: agent-worker R93–R94, agent-model R17–R18, agent-harness R11, screens-daily R35. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-sonnet-5-5. Entry R085-10: agent-model R17, R18. R17: the sub-session `report` tool (`subsessionTools` in src/model.mjs) told the model its 500-character summary limit only as a schema `maxLength`, and live reports ran 599–957 characters; state the bounds in the description and make `condition` an enum of `contract.returns.conditions` when present (agent-harness R11 adds them, built now by AGENT-HARNESS #5; your test supplies its own contract). R18: `converse` gains `checkFinal`, one hand-back, on both the apikey path (model.mjs) and the signin path (signin.mjs `conversation`). AGENT-WORKER #26 will call it as R18 states, so keep its shape exactly.

## B2 · CHANGE

CHANGE (Bob's K3490): merge tranche/R085 into your branch. Your entry gains R19: a check's sub-sessions on claude-sonnet-5-5 at effort low, every other conversation on claude-opus-5-5 at effort medium; `converse` takes `role: "subsession"`; effort sent as `output_config.effort` (apikey) and as the conversation request's `effort` (signin; agent-runner R32, built now by AGENT-RUNNER #8); MODEL_PRICES gains both models at the rates R19 states. Opus 5.5 rejects `thinking: {type: "disabled"}` and `budget_tokens` (400): send neither. Its own explicit R19 test.

## B3 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk on biosmoke8 (K3498) found a check run that ran to its end but whose sub-sessions could not see the question's captured document; the diagnosis is build/plan/diag-085-r4.md (read the parts naming your module). Your entry is part of fix round 4 (K3501): seven jobs at once, observation-log R38, ai-runs R85–R86, agent-harness R12, agent-model R20–R21, agent-worker R96–R100, machinery-producers R14, screens-inquiry R46. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Each new id needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-sonnet-5-5. Entry R085-17: agent-model R20 and R21. R20: subsessionTools (src/model.mjs ~428) — `rows` an enum of contract.arms when given, a new `ids` array property (maxItems 20), and the description saying how to reach a document (bare words match records' own text only; `passage:<word>` searches documents' words; `id:<record id>`; `ids` limits the read, so rows=passage with a subject's id reads that document's passages; read the contract's subjects first). No subject id in any description (R12). R21: converse answers `model` and `effort` on both paths.
