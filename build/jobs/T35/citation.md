# citation (T35)

**Status** · session_013PbWmoBUuyHPeboigwqVPg · depth 2 · WORKING · handled B0

## J1 · QUESTION

**An edge: citation uses `provenance`.** R1's `found` names only `capture_sha` (retrieval R73's match); "resolve the document from the capture" needs a capture→bundle read, and none of citation's Uses answers one (record-core, content, retrieval, membership hold none; `content.captureFor` is bundle→capture). The one read is `provenance.homeOf(captureSha)` (its R4), which events and people already use for the same match. Best reading, which I am building on: `modules.json` citation `uses` gains `provenance` (layer 3, so P4 holds), and the requirement's Uses gains one line: "`provenance`: `homeOf` (R4), the document a found match's capture is held in (R1)". The module takes `provenance` as a dep (default `provenanceOf(host)`). A capture with no home, or one in a bundle the viewer may not see, is answered alike as `FOUND_MALFORMED` ("naming no document"), as retrieval answers `CAPTURE_NOT_HELD` alike.

Two smaller readings, decided unless you say otherwise: (a) the question's refusals (`NO_SUCH_QUESTION`, `NOT_AN_INQUIRY`) come directly after the three found refusals, before the selection/citing object; (b) the new rows are C-45.14 `CITE_ONE_SOURCE`, C-45.15 `FOUND_MALFORMED`, C-45.16 `FOUND_CAPTURE_MOVED`, C-33.52 `NO_SUCH_QUESTION`, C-33.53 `NOT_AN_INQUIRY` (acquisition took C-33.50–51 and C-45.13 on the tranche; another L6 job may pick the same numbers, so please deconflict at merge).

The architecture check will refuse the import until the edge is in `modules.json`; I need only that and the Uses line, then I merge `tranche/T35`.
