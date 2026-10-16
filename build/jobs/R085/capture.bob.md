# BOB to capture (R085)

**Read** · handled J0

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live walk WALK-085 (build/plan/walk-085.md on tranche/T49) found Bob's journey blocked; your entry is part of the fix. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Six jobs run at once: capture R92, control-plane R100, screens-intake R27, screens-inquiry R45, ai-runs R82–R84, agent-worker R91–R92. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-sonnet-5-5. Entry R085-3: capture R92. Live cause (BOB's diagnosis): `capture/index.mjs` ~691 profiles an upload with `ct: null`, so a plain .txt reads `format: undetermined`, `profiled_from_text: false`, never read as text; opening it is also refused SAFE_VIEW_ONLY. control-plane (R100) will pass `type` to `uploadCapture`.
