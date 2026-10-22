# Fix round 5, E2: why the assembled plane cannot read the 1,300-page PDF (diagnosis, K4548)

Diagnosis worker (sonnet medium), 2026-10-22, on a scratch merge of `job/T51/plane` (PLANE #50's J29) with `tranche/T51`; nothing tracked changed. Measured on node v26.10.

**(1) A real out-of-memory, at the reading.** PLANE's `l77-size` child at `--max-old-space-size=300` aborts after about 17 s ("Ineffective mark-compacts near heap limit"). Calling `readHeld` directly on the same Store (no ledger, alarm, promotion or SQL writes in play) dies the same way. The heap climbs from about 130 to 300 MB in one synchronous stretch inside docprofile's document-type detection over the full text, before any unit is written. Uncapped, the run completes (134 units, 37-40 s).

**(2) Root cause: roster-reader's detectors over the whole text.**
- `bio-plane/src/plane/wiring.mjs:22-31` `registerReaders` registers doctypes, legistar, roster-reader, court, budget and generic; extraction's fixture (`bio-plane/test/m/extraction/fixture.mjs:20`) registers only doctypes, so `c5b-memory` never runs the others' `detect`.
- `docprofile/readtext.mjs:273` → `doctypeFor` / `alsoFor` (`docprofile/doctypes/registry.mjs:85,102`) hand every registered `detect` the whole text (20,166,920 characters here), twice (the recognise pass and `alsoFor`).
- `roster-reader/lines.mjs:178` `linesOf`: `out.push({ text: t.trim().replace(/\s+/g, " "), ... })` over all ~160,800 lines, built by `staff-roster.mjs` `readRows` (:122-135) and by org-chart's `detect`. On node 26 the global replace leaves a cons-string chain per line: 160k such lines retain about 243 MB against 25 MB flattened. The snapshot at the 300 MB limit held 170 MB of strings and 113 MB of concatenated strings, retained through arrays of `{text}`.
- Bisect in extraction's own child, same file, cap 300: doctypes only completes (peak +109 MB above idle); adding legistar, court, budget or generic one at a time completes (+115-126); adding roster OOMs; all of `registerReaders()` OOMs. `staff_roster.detect` alone on a 19.8 MB text: OOM at 100 and 200; at 300 completes, +167 MB (org_chart +132).

**(3) Owner:** roster-reader (layer 1). docprofile hands the whole text to every `detect` twice (a contributor); extraction's test gap is its narrower registry.

**(4) Measured fix, step one only** (flatten the string in `linesOf`): extraction's child with roster registered OOMs at 110, completes at 140 (57 s), 180 and 300; without roster it completes at 88. So flattening is not enough: the 160k-line array and the text copies remain; the detectors must not hold every line of a 20 MB text (a cheap pre-check, a line-by-line scan, or a bounded window as docprofile's R38 `ctx.pages` does).

**(5) Not established:** whether workerd's V8 builds the same cons chains (node 26 measured only); the platform's real peak; the 22 MiB 600-page PDF's 160 MB need (probably the same cause over about 10 MB of text, not run); the 6-17 MB each of the court, budget, legistar and generic detectors add.

Scratch evidence (not committed): `/tmp/claude-0/-home-user-bio/a9d76432-da24-584e-a6bc-be2b459871f8/scratchpad/diag/`.
