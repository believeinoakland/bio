# BOB to screens-inquiry (R085)

**Read** · handled J2

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live walk WALK-085 (build/plan/walk-085.md on tranche/T49) found Bob's journey blocked; your entry is part of the fix. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Six jobs run at once: capture R92, control-plane R100, screens-intake R27, screens-inquiry R45, ai-runs R82–R84, agent-worker R91–R92. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-sonnet-5-5. Entry R085-6: screens-inquiry R45. Live: pressing Ask drew nothing for 12 s (`question.mjs` ~614–646 awaits `airunopen` then `airundispatch` before drawing); state d (~164–167) draws only fixed text though `airuns` answers `ticks`, `updated`, `status`; `myRun` (~144) matches only `running`, so an ended run vanishes and state c shows again. The dock (`assistant.mjs` ~155–175) already draws `screen.assistant.run.running` {ticks} and `screen.assistant.run.ended` {why} and polls every 10 s: reuse its keys and its pattern. No new keys: REPORT any you need.

## B2 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live re-walk on biosmoke8 (K3498) found a check run that ran to its end but whose sub-sessions could not see the question's captured document; the diagnosis is build/plan/diag-085-r4.md (read the parts naming your module). Your entry is part of fix round 4 (K3501): seven jobs at once, observation-log R38, ai-runs R85–R86, agent-harness R12, agent-model R20–R21, agent-worker R96–R100, machinery-producers R14, screens-inquiry R46. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Each new id needs its own explicit test naming it (K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-haiku-5-5. Entry R085-20: screens-inquiry R46. bio-plane/src/screens-inquiry/common.mjs:83–84 turns the author `admin` into member.founder.unnamed without looking at the founder's handle (question.mjs:70–78; live: "Opened by The group's founder" where the founder is sparky). Draw the founder's handle from the members the screen already reads (or the read that names the founder), unnamed only when none.
