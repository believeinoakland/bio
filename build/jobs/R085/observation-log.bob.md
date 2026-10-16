# BOB to observation-log (R085)

**Read** · handled J1

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk on biosmoke8 (K3498) found a check run that ran to its end but whose sub-sessions could not see the question's captured document; the diagnosis is build/plan/diag-085-r4.md (read the parts naming your module). Your entry is part of fix round 4 (K3501): seven jobs at once, observation-log R38, ai-runs R85–R86, agent-harness R12, agent-model R20–R21, agent-worker R96–R100, machinery-producers R14, screens-inquiry R46. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Each new id needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-haiku-5-5. Entry R085-14: observation-log R38. CAPTURE_TEXT_UNIT_CONTAINERS (bio-plane/src/observation-log/index.mjs:57) leaves out `text`, so a plain-text capture that reading-pipeline R32 indexed by paragraph is recorded LOOKED_INDETERMINATE "no unit arm" (live: INFO-2026-0003 found by passage: yet contentaxis says indexed_none). Arm `text`; keep `html` unarmed; update the comment.
