# plane (T29)

**Status** · session_013R53oRbit9nK4tT9VYdbFQ · depth 2 · WORKING · handled B1

## J1 · QUESTION

plane's `uses` in `modules.json` lack the two T29 modules, so R18's work fails `architecture.mjs` until BOB records them. Best reading, on which I proceed:
- add `case-disclosures` (src: `store.mjs` calls `caseDisclosuresOf(ctx, {attestation})`, as R18 and Uses name);
- add `case-carriage`, a test-only use: B1's re-point of `accepted.test` R16 to `caseCarriageOf(ctx).acceptedWork`, and R18's test of its two tables (`CASE_CARRIAGE_EXEMPT`) existing and declared at boot. R18's Uses line says "case-carriage: none directly"; I read that as the source, which stays without an import. If you would rather the tests not import it, say so and I read through `publicationOf(ctx).caseCarriage` instead.
