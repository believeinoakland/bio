# public-read (T51)

**Status** · session_01LwWDy5JCBriNttXnEF6fAW · depth 2 · WORKING · handled B9

## J1 · QUESTION

Two readings in R38 I took on my best judgement; I carry on with them and will change on your answer.

1. `pinned: false`. A case's pin names the finding edition by hash, so for a pinned member `finding.bundle_sha` equals `version_sha` by construction and `false` could never occur. My reading: when the pin names bytes nothing published holds, the case document's own stated member edition (`case_roles[].edition`) is used, if that edition is published at other bytes: the entry lists that edition as `finding` with `pinned: false` (the pin does not match the bytes published at the edition the case states). If the document states no published edition either, the case is not listed (it pins no published edition of the finding). Pin-less member (legacy) answers `pinned: null`.
2. `signed_by` is the signer of the case document of the edition (always, when a signed document is held), with `strength_from` saying whether the pair is stated in that document (`case_document`) or in the member's own signed bytes (`member_bytes`, a pre-/2 document); `finding_signed_by` is the finding's own signer. The two are never copied from each other.

Also: R38's `detail`, `strength_detail` and `signer_detail` are inline sentences in the module (as `NOT_PUBLISHED`'s are); I cannot add keys to the word table (`setup-words` is not mine).

## J2 · COMPLETE

**Entries applied (T51-75).**
- R38 `publishedFrozen({id})` / `op=publishedfrozen`: new store read in `public-read/index.mjs`, one set-based read of the pins and one `caseEditionState` per case edition, no finding bytes fetched; added to `publicReadOps` and `PUBLIC_READ_OWN_OPS` (`reads.mjs`). Readings taken are in J1 (QUESTION), awaiting your answer.
- R39: no code needed; `finding-page.test.mjs` gives it its own explicit tests (identity and signing, body incl. override, unavailable/withheld body, basis served/named/edition-named, graph and division, verification, store silence refused whole, several-cases resolution).
- Stale comments restated: `credit.mjs`:11, `index.mjs`:1159, `publication/worker.mjs`:322.
- `served.mjs` (test helper) gains the `publishedfrozen` answers so the voice/place/word rules cover them.

**Deferred:** none. **Found in other modules:** none. The op is declared and routed by `op-declarations` (T51-107) and `control-plane` (T51-123); until then it is reachable only through the plane store's op map.

**Tests/checks:** `node --test test/m/public-read/`: 226 pass, 0 fail (20 new: frozen.test.mjs 10, finding-page.test.mjs 10). format: 0 failures; architecture public-read: 0 failures; coverage public-read: 39 of 39 ids named, 0 failures; ownership: 8 files, 0 failures. `checks/run.mjs`: 23 failures, all in other modules (none public-read).

Size (session_018PacXfPZi6itmHMiic6QeW): test runs 7, module lines 3767

## J3 · REPORT

Word rows for R38's four sentences (no placeholders in any). Keys and English, as the module now says them inline:

- `public-read.frozen.detail.cases`: "Each entry is one published case edition's own frozen reading of this finding, as that case's signed document states it; no case's reading stands for another, and none is combined with any other."
- `public-read.frozen.detail.none`: "This finding is published and no published case edition pins it, so no case froze a reading of it."
- `public-read.frozen.strength_detail.none`: "This case edition records no frozen pair for this finding, and none is supplied here."
- `public-read.frozen.signer_detail.unstated`: "A signer this answer does not state is one no signed document held here names; the case document's signer and the finding's own are two facts, and neither stands in for the other."

(The first two share `detail`: `cases` when the answer holds a case, `none` when `cases` is empty.) Keeping the inline English until the rows land; I will switch to `word(key)` on your CHANGE.

## J4 · COMPLETE

CHANGE B3 processed. Merged `tranche/T51`. R3's `closing` now reads through `lensClosingSentencesOf(doc.fm)` (`index.mjs`), so each document speaks in its own format's words. The three failing tests now pin the format they mean: `edition-statements.test.mjs` builds `/5` documents and expects `/5`'s closing sentences (its section builders given `format: "bio-case-document/5"`); `standing.test.mjs` pins `CASE_DOCUMENT_FORMAT_V7` for its `/7` arm.

Tests: `node --test test/m/public-read/`: 226 pass, 0 fail. format, architecture, coverage (39 of 39), ownership: 0 failures. Still inline English for R38's four sentences until the design rows land.

Size (session_018PacXfPZi6itmHMiic6QeW): test runs 10, module lines 3769

## J5 · COMPLETE

CHANGE B4 processed (B3 was done in J4). Merged `tranche/T51`. R38's four sentences (`detail` cases/none, `strength_detail`, `signer_detail`) are now read through `word(key)`; no inline English remains. `frozen.test.mjs` asserts the answers equal `word(key)` and `hasWord` for each of the four keys, with a control that reaches `strength_detail` and `signer_detail`.

Tests: `node --test test/m/public-read/`: 227 pass, 0 fail. format, architecture, coverage (39 of 39), ownership: 0 failures.

Size (session_018PacXfPZi6itmHMiic6QeW): test runs 12, module lines 3769

## J6 · REPORT

**REPORT (T51-233 words, public-read)** — for your decision, not applied.

1. **Two words-check findings left inline (plain arm), by reason.** `index.mjs` `registerGroupIdentity` answers `PROVIDER_MALFORMED` / `PROVIDER_DECLARED` with a detail sentence ("the team's identity source is registered with its door, identity(); nothing was registered" and "... is already registered; the first stands ..."). These are wiring refusals from instance-setup at start, read by no member. Please settle with the design stream (unkeyed list, K3944).
2. **Other registration refusals, same reason, left inline** (not flagged by the check): `registerEvidenceBlock` (index ~242–246), `registerPublicReads` (index ~378–386). Same ruling would cover them.
3. **Wire grammar, left inline:** the `requiredArgument` shape/detail strings in `door.mjs` (42, 67, 110), `index.mjs` `publishededitions`/`publishedfrozen` NO_ID details (~736, ~810), and `worker.mjs` `publishedcase` requires-argument (~604–607). API-caller text, not a member's sentence.
4. **Signed-adjacent text routed through `localize`.** The container manifest's `verify`, `layout.note` and the two in-band `over` strings are now `localize(...)`. Their bytes are unchanged (no row exists), so existing containers verify as before. Decision for you (K1333): if the design adds rows for these keys, new containers' manifest bytes change. Either these keys never get rows, or a row is a new container version.
5. **Words check blind spot.** `checks/words.mjs` does not flag some stitched sentences that members read (e.g. `index.mjs` `evidencePackage` detail, `graph_detail` before this job, `NOT_PUBLISHED` detail). I converted the ones I found in this module as well (R13). Widening the check to those shapes would catch the rest of the family.
6. **Test-side regex copies kept on purpose:** structural checks (hashes, ids, formats), fixture text the test invents, negative controls for old wording, and fragments under the threshold. Two sentences are built inline with no word or constant (`criteria` "Standard · binds …" in `publication`; "is already registered by" in `public-read`), so they cannot be converted from this module.

## J7 · COMPLETE

**COMPLETE (T51-233 words, public-read).** Entries applied:
- Words-check findings: all 14 inline and 11 test copies fixed; the 2 `plain` findings (index `registerGroupIdentity`, see REPORT 1) are left inline for your ruling.
- Also converted, per R13 (member-facing sentences the check does not flag): `index` evidence-package, altitudes, graph, tensions/blocks, loose-record and NOT_PUBLISHED details; `worker` CASE_DOCUMENT_UNSERVABLE, `verify`, `layout.note`, the two in-band `over` strings, the case-file part request; `casefile` notAssembled details and causes; `container` part-missing.
- Test copies and regex copies converted across the module's test files; the rest kept as listed in REPORT 6.
- Wording is unchanged: every converted en was verified against the HEAD source (byte-identical comparison).

Deferred: none. Found in other modules: none new.

Tests and checks:
- `node --test test/m/public-read/`: 227 pass, 0 fail.
- format: 176 modules, 0 failures. architecture public-read: 0 failures. coverage public-read: 39 of 39 ids named, 0 failures. ownership public-read: 20 files, 0 failures.
- words public-read: inline 2, plain 2 (the registration findings in REPORT 1), testcopy 0, missingkey 0, marker 0, unkeyed 8.
- setup-words build --check: stale-rows note only (expected), no refusal naming public-read.

Size (session_01FPRrUF9Cu3BMKX1o1aFaK6): test runs 4, module lines 3663

## J8 · COMPLETE

**COMPLETE again (after CHANGE B6, K4026).** Applied:
- (4) The container manifest's `verify`, `layout.note` and the two in-band `over` texts are plain constants again (`LAYOUT_NOTE`, `VERIFY_TEXT`, `VERIFY_MEMBER_PAIR`, `OVER_CONTAINER`, `OVER_CASE_FILE` in `publication/worker.mjs`), same bytes, pushed. They are on the design's unkeyed list with R8's batch.
- (1)-(3): the registration and API-caller details stay inline and go to the unkeyed list with R8's batch, accepted by name until then.
- Every other R13 conversion stands.

Tests and checks: `node --test test/m/public-read/`: 227 pass, 0 fail. format: 0 failures. architecture public-read: 0 failures. words public-read: inline 5 (the 4 manifest constants and 1 registration detail, all accepted by name in B6), plain 2 (the registration details), testcopy 0.

Size (session_01FPRrUF9Cu3BMKX1o1aFaK6): test runs 5, module lines 3663

## J9 · COMPLETE

**C2 met (public-read R39, R3).** A published finding's `body.conclusion` and `body.falsifies` now carry the words, never a heading: the signed case document's `case_conclusions` claim and falsifier first, the front matter's authored words next, the section's own words (heading removed) last, `null` when there are none. `authored` is unchanged.
- `publication/worker.mjs`: `sectionWords` strips the heading `sectionText` keeps (record-grammar R36 untouched); `body.conclusion`/`falsifies` read `fnd.case_words`, then `fm`, then the section.
- `public-read/index.mjs`: `publishedCase` adds `case_words: {claim, falsifier} | null` to each `findings` entry, read from the signed document's `case_conclusions` (`caseWordsOf`), never live.
- Test `finding-words.test.mjs` (4, written first and seen failing): concluded finding (front matter only) answers its words; signed claim before authored; control: section words answer without heading; none -> null.

**For BOB (requirement text):** R39's `findings` entry list and its `body` line do not yet state the order claim -> authored -> section, nor the new `case_words` field on the entry (R3's findings). Please add them at the fold; the field is public-read's own and I kept it as the one carrier from the store to the Worker.

Reading taken: where a signed claim and authored words both exist, the signed claim wins (as your START says); a section's words come after authored.

Tests: `test/m/public-read/` 232 pass, 0 fail; publication 150 pass, 0 fail (1 skipped); screens-publish, plane worker, ratification converted-d, network-notices, mk6 test: 281 pass, 0 fail. checks: format 1 failure (`build/rulings.md:4298`, not mine); architecture public-read 0; coverage public-read 40 of 40, 0; words 0 findings; ownership 0 failures (4 files).
Nothing deferred. Nothing found in other modules.

Size (session_01YFbwaESicnaBkDk7GZ5Su5): test runs 7, module lines 3706

## J10 · QUESTION

Two readings for R41, built on my best judgement; I carry on and will change on your answer.

1. **Handles (R41 (3)).** `public-read` has no way to turn a member id into a handle: neither `member-roster` (`memberFacts(id).handle`, its R68; the founder's through its R76/`founderHandle`) nor `membership` (which delegates to it) is in my `uses`. Best reading: `publishedCase` reads the handle through `membership.memberFacts(id)` at the call (a dep `members`, default `membershipOf(host)`, reached at the read as `record` and `roster` are), and names by handle every value of the keys that hold a member (`member`, `author`, `statement_by`, `by`, `acknowledged_by`) that resolves to a member: the completeness writer and publisher, the acknowledgements, each `attestor` and `delivered_by`, the case document's. A founder who holds no handle is named by the design's word `member.founder.unnamed`; a member with a row and no handle by `shell.card.member`; a value that resolves to no member (`undetermined`, a review grant's id) stays as it is. **Please add `membership` (or `member-roster`) to public-read's `uses` in `build/modules.json`**; until then `checks/architecture.mjs` will show the one import, and the handle tests run on the real `membership` of the fixture world. `publishedFrozen` (R38) names signers by `member` too; R41 does not cover it, so I leave it and report it here for you to decide.

2. **`document: {name, place}` (R41 (1)).** The signed case states no document title. What it states for a document leg: the `grading_facts:` row (`kind` `document`, its `captures`), the `passages:` row (`content_id`, `capture_sha`, `extent`) and the `materials:` row (`ref`, `sha`, `origin`). Best reading: `name` is the material row's `origin` as signed (its `ref` when the origin is not stated), `place` is the passage's `extent` exactly as signed (e.g. `{kind: "pdf-page", page: 2}`; the screen words it), `null` when the leg cites the whole document; a leg whose grading fact is not a captured document, or a document that states no grading facts (before `/6`, or withheld), carries `document: null`. If you want a human title, `case-grammar` R12 and `case-disclosures` R7 would have to sign one; that is for those modules and the design, not this job.

## J11 · COMPLETE

**Fix round 3 (B8): C47 and C94 met (public-read R41, amending R39, R3, R38).**
- **C47.** Each `basis` entry of `op=publishedcase`'s per-finding answer carries `document: {name, place}`, read from the signed case document (`public-read/legs.mjs`, `legReaderOf`; `publication/worker.mjs`): `name` the material row's `origin` (else `ref`), `place` the passage's signed `extent`, `null` for a leg on working material or where the document states no grading facts; nothing of the document's bytes is served. The finding carries `falsifier` beside `case_words` (its published bytes' falsifier, `null` when none or unreadable).
- **C94.** `publishedCase` names every member by handle (completeness writer and publisher, acknowledgements, each `attestor` and `delivered_by`, the case document's, who acknowledged a tension); `publishedFrozen`'s signers likewise (BOB's J10 answer, B9). The signed text, the manifest and as-signed blocks are untouched. Handles come through `membership.memberFacts` (dep `members`); founder with none: `member.founder.unnamed`; member with none or an unreadable roster: `shell.card.member`; a non-member value stays.
- Tests (written first, seen failing): `evidence-names.test.mjs` (6, with controls). Updated to handles: convert-deliverer, convert-publishedcase, finding-page (basis keys gain `document`), frozen, published, sampling (R13 shape unchanged, `by` is a handle), tensions.

Tests: public-read 238 pass, 0 fail. Downstream (publication, ratification, network-notices, plane, control-plane, review, filings, case-import, case-checker, screens-publish, screens-inquiry, op-declarations, capture): 2712 tests, 2709 pass, 3 fail, none in my files and none touching my diff: `plane/release.test.mjs:74` (screen.objective.purpose held by the words list) and case-checker R13, R25 (committed `program.mjs` is not the build); I did not fix them.
Checks: architecture 0 failures; words 0; coverage public-read 0 (other modules' R-ids unnamed, not mine); format 1 failure (`build/rulings.md`, not mine); ownership 0 failures (13 files).
Deferred / for BOB: as-signed blocks (`captures[].member` and acknowledgement, `lens`) name members as signed and are left so; a cover-level attribution must not be turned into a handle. `publishedEditions`/`publishedList` still name signers by id (R2, outside R41).

Size (session_01LwWDy5JCBriNttXnEF6fAW): test runs 9, module lines 3836

## J12 · COMPLETE

COMPLETE (B8, fix round 3): C47 and C94 met, R41. Details, suites, checks and Size line in my record's J11. Public-read 238 pass; downstream 3 reds not mine (plane release.test:74, case-checker R13/R25).

Ringing BOB failed (its session is archived); the pushed J12 is the message (mechanics §13).
