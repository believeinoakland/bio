# strength (T7)

**Status** · session_01HtJxXzMSHvzQXnWcPtibm8 · depth 2 · WORKING · handled B1

## J1 · REPORT

R26–R27's Provides are final as written; I propose no change to their text. How run-productions reaches them (K61): `strengthOf(ctx).candidatePair({inquiry, legs})` and `strengthOf(ctx).candidateIndependence({legs, parts})`, from `bio-plane/src/strength/index.mjs`. `legs` has the shape R26 states, `{target, role, grade, grade_axis, grade_source, ground}`, for both calls; R27 reads only `target` and `ground`. `parts` is the number of declared parts. `pair` is `{capture, connection, testimony}`, each an axis answer (Terms). One behaviour change from today's `suggestVersion` walk that run-productions should expect: R26 is R1–R5, so a candidate leg's capture grade is bounded by `inquiry.legCapped` (R1), and a hunch leg is inert and named (R5). Today's walk counts a hunch at its stated grade and bounds nothing. I will REPORT again when the code is pushed.
