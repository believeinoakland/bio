# leg-earning (T41)

**Status** · session_018Dq5y3nwTnhZrikpr65p7D · depth 2 · WORKING · handled B2

## J1 · QUESTION

My readings of T41-14, on which I am building now (answer only if one is wrong):
1. R16 `route_basis`: kept as today, the provenance bases of the authored routes, sorted, unique (`CAPTURE_RECEIVED_NOT_FETCHED`, `CAPTURE_ROUTE_UNRECORDED`); the `why` names each route in words from provenance's answered `route` (`doorbell` "received through the doorbell", `upload` "uploaded by a member", none "no fetch route recorded"), in that order, joined by "; ".
2. R15: a "passage of an AI transcription" is a content row asked through `earned`'s `contentIds` whose chain holds an `ai_transcription` step covering the row's extent (text-chain `stepCovers`; a whole-document row, any such step). Its `earned.content[<cid>].capture` becomes a passage-grain ceiling `{grain: "passage", mode: "ceiling", grade, ...}`: when content's standing finds a covering attestation made against the row's chain (`transcription.determinant: "attestation"`, from `attestText`), the grade is the capture's own byte grade from its route (provenance `captureGrade`; an authored route stated as authored; an unruled route undetermined); otherwise grade null, `undetermined_because: "CAPTURE_FIDELITY_UNMEASURED"`, naming the AI reading and the remedy. Every other row keeps content's document pointer. The document-grain `earned.capture` is unchanged (already undetermined through `captureBound`, text-chain R104).
3. R13 answers `{ok, id, projects: [ids], limit, cursor}`: ids ascending after `after`, severed citers skipped, `cursor` the last id when more remain else null; `limit` a positive integer clamped to 500, default 100; `NO_ID` without an id.
4. R14 answers `{ok, id, projects: [{id, name}], truncated}`; a question the viewer cannot see answers `NO_SUCH_BUNDLE` as an absent one (R11); a project is listed only when not hidden (`visibilityOf`) and R44's `sight` is FULL or EXISTENCE for the viewer, `name` its `bundles.title`; hidden projects take no slot.
