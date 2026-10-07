# citation (T35)

**Status** · session_013PbWmoBUuyHPeboigwqVPg · depth 2 · WORKING · handled B2

## J1 · QUESTION

**An edge: citation uses `provenance`.** R1's `found` names only `capture_sha` (retrieval R73's match); "resolve the document from the capture" needs a capture→bundle read, and none of citation's Uses answers one (record-core, content, retrieval, membership hold none; `content.captureFor` is bundle→capture). The one read is `provenance.homeOf(captureSha)` (its R4), which events and people already use for the same match. Best reading, which I am building on: `modules.json` citation `uses` gains `provenance` (layer 3, so P4 holds), and the requirement's Uses gains one line: "`provenance`: `homeOf` (R4), the document a found match's capture is held in (R1)". The module takes `provenance` as a dep (default `provenanceOf(host)`). A capture with no home, or one in a bundle the viewer may not see, is answered alike as `FOUND_MALFORMED` ("naming no document"), as retrieval answers `CAPTURE_NOT_HELD` alike.

Two smaller readings, decided unless you say otherwise: (a) the question's refusals (`NO_SUCH_QUESTION`, `NOT_AN_INQUIRY`) come directly after the three found refusals, before the selection/citing object; (b) the new rows are C-45.14 `CITE_ONE_SOURCE`, C-45.15 `FOUND_MALFORMED`, C-45.16 `FOUND_CAPTURE_MOVED`, C-33.52 `NO_SUCH_QUESTION`, C-33.53 `NOT_AN_INQUIRY` (acquisition took C-33.50–51 and C-45.13 on the tranche; another L6 job may pick the same numbers, so please deconflict at merge).

The architecture check will refuse the import until the edge is in `modules.json`; I need only that and the Uses line, then I merge `tranche/T35`.

## Completion

**Entries applied.** T35-42:
- (N698, DEC-164 (4), (5); K1865, K1941, K1982) `cite` takes `found`, one match as `retrieval.findIn` answers it (R73), in place of `handle` and `extent`. It reads only the capture and the extent, never the words. The document comes from `provenance.homeOf` (the K1982 edge). An unseen home answers like an absent one: `FOUND_MALFORMED`. The extent becomes the part bag a named part arrives in (`extent_<field>`, exported as `foundExtentBag`), so the found document and part meet every member and part refusal at `report` weight. A field no leg carries (such as `space`) is refused `UNKNOWN_EXTENT_FIELD`, never dropped. Refused first, writing nothing: `CITE_ONE_SOURCE` (C-45.14: both sources, neither, or a found plus a named part), `FOUND_MALFORMED` (C-45.15), `FOUND_CAPTURE_MOVED` (C-45.16: the match's capture is not `content.captureFor`'s pin; names `document`, `found_capture`, `pinned_capture`). The optional `question` comes next, per the J1 (a) reading: `NO_SUCH_QUESTION` (C-33.52, absent and unseen alike) and `NOT_AN_INQUIRY` (C-33.53). It changes no other judgement. R3: with `found`, the Session Log's trigger names the document, says it was found by search and names the capture; `drift` and `moved` are false, and `handle`, `gate` and `expires` are null. A named question is appended to the trigger (`; for question <id>`). The answer always carries `question` (null when none). `op=cite` reads `found` as one JSON query parameter (passed on as sent when it does not parse) and `question`.
- (DEC-149, R12) Sweep row `index.mjs`:378, `INQUIRY_UNAVAILABLE`'s `detail`, now says "your group's Civicsmith was created without them". A test names it, and checks that no row translation or refusal detail calls the Civicsmith "instance", "plane", "server" or "copy".

**Rows awaiting stamp (accepted red 2):** C-33.52 `NO_SUCH_QUESTION`, C-33.53 `NOT_AN_INQUIRY`, C-45.14 `CITE_ONE_SOURCE`, C-45.15 `FOUND_MALFORMED`, C-45.16 `FOUND_CAPTURE_MOVED` (all new, in `citation/checks.mjs`).

**Deferred.** None.

**Found in other modules (for BOB).**
- `op-declarations` / `affordances`: `op=cite` now takes `found` (JSON) and `question` query parameters. Whatever publishes cite's parameters to members (affordances' act description, op-declarations' spec if it lists parameters) should name them. Not changed here.
- `plane` (`plane/store.mjs`:472) passes `citationOps(citationOf(ctx), url)` with no body, so a found match travels in the query (at most a few hundred bytes; the words travel too unless the caller strips them). If a body is preferred, plane would pass `body` and this map would read `body.found` (one line here).
- control-plane's catalogue snapshots (`rows-before-r43.json`, catalogue-end, catalogue-totality: reds 19 and 26) may need the five new rows when T35-72 re-pins. Neither failing test names a citation row today (checked).

**Tests and checks.**
- `node --test bio-plane/test/m/citation/`: tests 66, pass 66, fail 0 (new `found.test.mjs`, 11 tests naming R1, R2, R3, R7, R12; R3, R11 and route tests extended).
- Users of citation and tests that drive `op=cite` (members, retrieval t33, queue feed, standards, affordances, basis-versions d216, queue-producers, run-productions, admission mint, control-plane, plane): 706 pass, 13 fail, the same 13 as on the tranche without this change (inherited reds 19, 22, 25, 26, 29 and op-declarations' 9/23), with no new failure.
- Layer tests: none named in `build/manifest.md`.
- `format`: 130 modules, 129 requirements files; 0 failures. `architecture`: 12 product files, 46 relative imports; 0 failures. `coverage`: 12 of 12 live requirement ids named by a test; 0 failures. `ownership`: 7 files changed by citation between tranche/T35 and HEAD; 0 failures.

Size (session_013PbWmoBUuyHPeboigwqVPg): test runs 10, module lines 1186
