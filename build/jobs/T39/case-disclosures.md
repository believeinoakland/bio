# case-disclosures (T39)

**Status** · session_017U4puvgg5SbVfxAghkjSpV · depth 2 · WORKING · handled B2

## J1 · REPORT

Two findings outside my module, both from building R6's member-document arm against case-carriage R16 (not yet on the tranche; built against its stated interface, a local stub of `COPY_CLEANED_LABEL` never committed).

1. **case-authoring's tests go red once case-carriage and I merge (another module; no T39 entry).** Its fixture (`test/m/case-authoring/fixture.mjs`:278–280) composes the real case-disclosures over the real case-carriage. Measured now: with my change and today's case-carriage (no `documentCopy`), 144 of 164 case-authoring tests fail (every document reads `DOCUMENT_COPY_UNDETERMINED`, fail closed); without my change, 164 of 164 pass. After case-carriage merges, its real R16 answers every fixture document captured without a receipt (`w.doc` default) `fetched: false`, so `pending`, and a load-bearing chain is refused `DOCUMENT_COPY_PENDING` (R6 item 2). Either way case-authoring's fixture needs a `documentCopy` answer (e.g. a stand-in answering `public`, as mine does, or its documents given receipts); `photos.test.mjs`:35 builds its own `caseCarriage` stand-in with `photoMarks` only and needs `documentCopy` too. answer-envelope and plane also compose case-disclosures; I have not run their tests (larger) and will after the merge. This is required behaviour, not a flaw of mine; it needs a case-authoring change (tests only) in T39, or an accepted red.
2. **R23's wording (my requirements).** R23 says the one write this module reaches is `sources.sourceOf`'s minting. case-carriage R16 now adds a second: `documentCopy` queues a member document neither queued nor derived, inside the caller's transaction. My code comment states it; R23's text should name it (BOB's: requirements). I read it as R16 states and built on that.
