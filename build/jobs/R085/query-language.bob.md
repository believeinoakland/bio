# BOB to query-language (R085)

**Read** · handled J0

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk after fix round 4 (K3507) found the check's sub-sessions reading 0 passages (they search bare words with rows=passage), a dropped candidate never logged, and the question page and dock not showing the run; the diagnosis is build/plan/diag-085-r5.md (read the parts naming your module). Your entry is part of fix round 5 (K3510): five jobs at once, query-language R31, agent-worker R101–R102, agent-harness R13, screens-inquiry R47–R48, control-plane R101. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Each new id needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-sonnet-5-5. Entry R085-21: query-language R31. In `compile` (bio-plane/src/query.mjs), when `rows=passage` and the query has no `passage:` term, read the positive bare words (phrases, prefixes, NEAR groups) as `passage:` terms, with the warning R31 names; `text:`, negations and selectors unchanged. Check the scope too (diag item 1: `armSet(rowArm)` must then not keep the bare words as a text arm). retrieval's tests that use rows=passage must stay green (run them: they are the users of this service, P11).
