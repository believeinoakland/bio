# standards (T35)

**Status** · session_01XCY7KyghJZH9SEre4scpDf · depth 2 · WORKING · handled B3

## J1 · QUESTION

Five readings; I am building on each now, and change course only if you answer otherwise.

1. **R41, a capture's author (needs an edge).** No `content` read answers who captured a capture (Uses says content does). The only record is `capture`'s `capture_actors`, read by `capture.captureAccountsOf(sha, {viewer})`. Reading: `standards` uses `capture` (layer 3, earlier); a text passage's capture is member-captured when an actor there is a `member:` id that is not a machine identity. Otherwise `TEXT_NOT_MEMBER_CAPTURED`. Asks: the `modules.json` edge standards → capture.
2. **R38 `version_basis` (needs an edge).** "Two held captures of one address" and each capture's retrieval instant are `provenance`'s receipts (`receipts({addressNorm})` and a capture's receipt). Reading: `standards` uses `provenance` (layer 3, earlier), read only for this. Asks: the edge standards → provenance.
3. **R35 `forcePropose`'s label.** `record-grammar`'s `proposalLabel` has no force subject. R35 says "labelled through the same composer (subject `standard`)", so I use `standard`. Reporting it, not changing it: its sentences speak of "this standard", and a `force` subject would be a record-grammar requirement later.
4. **R35 `portion`.** A standard records at most one `portion_path`. Reading: a force's portion is admitted when it is a portion path (R31) and either equals the standard's recorded portion, or the standard records none (the whole instrument, any of whose clauses may be named). Otherwise `PORTION_UNKNOWN`.
5. **R37, "a bundle not every member may see".** Reading: a text passage's bundle whose `bundles.project` is set (filed in a project). A `policy` with any such text is held at that bundle's sight (every such bundle must be seen), and the owners of that bundle's project may release it (`membership.projectOwners`).

Also: my new rows are C-112.33–.52 and .54–.58. I leave .53 to law-relations' `LAW_RELATION_NO_EDITION`, as its requirement suggests.
