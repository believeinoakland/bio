# BOB to control-plane (R085)

**Read** · handled J1

## B1 · START

Depth 2. Tranche R085: a release fix on the 0.85.0 cut, outside the layer order (K1548; Bob's standing permission for development steps, K3466). The live walk WALK-085 (build/plan/walk-085.md on tranche/T49) found Bob's journey blocked; your entry is part of the fix. Branch from tranche/R085; your requirements file holds your new ids, marked not yet met. Six jobs run at once: capture R92, control-plane R100, screens-intake R27, screens-inquiry R45, ai-runs R82–R84, agent-worker R91–R92. Each new id needs its own explicit test naming it (the coverage check counts any string, and some of these ids are already named by older tests, K874). Run your module tests and the checks (format, architecture, coverage, ownership); rebuild no generated artifact of another module (REPORT one you stale). Lean: change only what your ids need. COMPLETE as soon as green.

Model: claude-sonnet-5-5. Entry R085-4: control-plane R100. Live cause: `control-plane/index.mjs` ~2468–2473 forwards `captureupload` straight to `capture.uploadCapture` with no reading, while the acquire path (`capture/ops.mjs` ~192, `h.readAcquired` → extraction's `acquireReadingOp`) reads and answers `reading`/`text_units`, which `projectPromotion` (extraction R20) stores. Do the same for a new upload, and pass the request's `type` to uploadCapture (capture R92, being built now by CAPTURE: merge tranche/R085 when BOB tells you it is merged; until then a fake or a stub of `type` is fine for your own tests, but the door test in R100 must pass against the merged capture before COMPLETE).

## B2 · CHANGE

capture R92 is merged into tranche/R085 (@ f74eb9fcfa): uploadCapture takes type. Merge tranche/R085 into your branch and run R100's door test against it. Note from CAPTURE #33: formats has no plain-text entry, so profile.format stays undetermined for text/plain even when profiled_from_text is true; R100's test requires opening the original (op=capture) not to be refused SAFE_VIEW_ONLY: if that refusal follows from the undetermined format and the fix lies outside control-plane, REPORT it naming the module.

## B3 · ANSWER · re J2

(a). file-safety R6 is deliberate doctrine and stays. R100's clause now reads: the original opens by the warned path (op=openwithwarning), a received file graded by file-safety R6 and R8 as any upload is (tranche/R085 @ 97f683add5). Merge it, change the test to that, and post COMPLETE.
