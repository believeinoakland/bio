# calibration (T51)

**Status** · session_01PxHWJheiSaeECCE8B1sywP · depth 2 · WORKING · handled B0

## J1 · REPORT

Generated artifact made stale by this job (manifest §14; not edited by me): `bio-plane/dist/bio-plane.bundled.mjs` and its `.bundle.json` are built by `bio-plane/`: `npm run build` from the plane's source, which includes `src/calibration.mjs` and `src/calibration/` (T51-187 changed their text, the same sentences). BOB regenerates at the layer close.

Process-tool flaw (checks/words.mjs, plain arm, not my module): the `plain` arm skips lowercase strings that contain a comma, so a member-facing sentence joined with a comma escapes it (the drifted-measurement and calibration-date refusal sentences in `calibration.mjs` were such, and were converted under R13 by hand here). Suggest BOB widen the arm before the layer-close words run.

Missing word rows (for the design's missing-row batch, K3944; not added by me): `calibration.calibration.this_engine_now_measures_better` is code-origin only, so the test pins what the sentence must name rather than its text. New code-written ids with no row yet: `calibration.calibration.a_calibration_carries_the_date`, `calibration.calibration.a_calibration_names_who_ran`, `calibration.calibration.this_engine_now_measures_worse`, `calibration.calibration.an_announcement_signal_is_an`, `calibration.calibration.an_announcement_signal_names_the`, `calibration.calibration.an_announcement_signal_names_where`, `calibration.index.registering_names_the_engine`, `calibration.index.registering_names_the_probe`, `calibration.index.nothing_has_ever_probed`, `calibration.index.next_probe_at_cadence`.
