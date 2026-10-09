# inquiry-grammar (T41)

**Status** · session_019r4sMshUDytbLD9gL3qFXk · depth 2 · WORKING · handled B2

## J1 · QUESTION

R18's representation, and my best reading of the closed shape (I am building on this reading now; the answer does not block me).

1. Representation. R18 states `bias_applied` as a list of objects on a leg. A leg is itself an item of `basis[]`, and record-grammar R7 lets a list item hold scalars only (the reason R17 flattens a derived connection into five `derivation_*` scalars). So a `bias_applied` list cannot be written in a bundle's front matter; it can only arrive as a parsed value (an act's JSON input, or a caller's ctx). My reading: the grammar judges the value as R18 states it, wherever it comes from, and invents no flat form. If you want it representable in front matter (a flat form, or a top-level block keyed by leg ord, as `division_apportionment` is), that is a requirement change: tell me which.

2. The shape as I check it (each departure one C-2.8 error, code `BIAS_APPLICATION_MALFORMED`, naming `basis[i].bias_applied[j]` and the field): absent, null or '' is no application; an empty list is admitted (nothing applied); not a list is one error; an item that is not an object is one error; `statement` a non-empty string (trimmed), never a minted form (K2474); `effect` one of `grade_lowered`, `leg_excluded`, `inference_refused`; `grade_lowered` requires `from` and `to` in `BASIS_GRADES` with `to` strictly weaker than `from` (a lowering); `from`/`to` on any other effect is an error; any key outside `statement, effect, from, to` is an error (the shape is closed). It runs on every object leg the lead and theme arms let through, the derived kinds (R11, R14, R15, R17) included, and moves no grade and is never compared with the leg's own grade.

3. For basis-versions R48 (which uses "R18's shape" with effects `inference_refused`, `scrutiny_raised`): I export `BIAS_EFFECTS` and `biasAppliedFindings(label, value, findings, {effects, checkId})`, effects and the check id parameters, the code and row this module's (as `importedLegFindings` takes `checkId`).
