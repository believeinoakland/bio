# legacy-checks — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30. `legacy-checks` has no requirements file (its own tests, P7); this is the head-of-layer entry's text, in K171 (1)–(2)'s pattern (the layer-9 record types and `proposalLabel`'s subjects), for what `action-plans` and `filings` R23 need from the catalogue before layer 9. If T18 forms `record-grammar` and moves the id grammar and type vocabulary into it first (K585 (4); `draft-T18.md` §2: `BUNDLE_ID_RE`, `ANN_ID_RE`, `OBJECT_TYPES` are in T18's stage), the id and type half is `record-grammar`'s job and the catalogue re-exports it; `STATES` and `proposalLabel` stay here until T19 either way.

## The entry

1. **The `PLN-` record type** (`action-plans` R2; K171 (1)'s pattern): `BUNDLE_ID_RE` and `ANN_ID_RE` gain `PLN`; `OBJECT_TYPES` gains `PLN: 'action_plan'` (no legacy spelling); `STATES` gains `action_plan: { legal: ['open', 'closed'], edges: { open: ['closed'], closed: [] } }`. Promotion gains no type registration (K171 (1)).
2. **`proposalLabel`'s subjects** (K171 (2)'s closed sentence table): `plan_option` (a proposed plan option: "a machine credential proposed this option …" / "a member proposed …" / "the record does not say who proposed this option", each saying it is not an option until a member adopts it, `action-plans` R11) and `communication` (a prepared communication draft: nobody has approved or sent it, `filings` R23), worded as `filing_draft`'s are.
3. Tests at the catalogue: a `PLN-` id parses and types as `action_plan`; `open → closed` is the only edge; each new subject answers its three sentences and an unknown subject still throws.
