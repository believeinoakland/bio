# public-read (T51)

**Status** · session_01BEeDNCorrpjXyGB6RpWrrB · depth 2 · WORKING · handled B31

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

## J13 · COMPLETE

**Applied CHANGE B10 (K4369).** `publishedList` and `publishedEditions` now name signers by handle too: `attestor_member`, `delivered_by.member`, and in `publishedEditions` the `completeness` writer, publisher and readers; the same `membership.memberFacts` and fallbacks, as-signed blocks untouched. Test (`evidence-names.test.mjs`, "the public list and a finding's editions…", with the founder control); `convert-deliverer`, `published`, `sampling` updated to handles.
Tests: public-read 239 pass, 0 fail. Downstream (ratification, publication, network-notices, filings, plane, control-plane, screens-publish, screens-inquiry, review): 1996 tests, 1995 pass; only `plane/release.test.mjs:74` R24 fails, inherited and not mine. Checks: architecture 0, words 0, ownership 0 failures.
Size (session_01LwWDy5JCBriNttXnEF6fAW): test runs 12, module lines 3860

## J14 · COMPLETE

COMPLETE (B10): publishedList and publishedEditions name signers by handle; details in J13.

## J15 · QUESTION

QUESTION 1 (C47: where the document's title comes from). C48's half is done: R42 `publishedAddress` is built and tested red then green (commit on my branch). C47 I cannot build inside public-read, and the START's "R41 as it stands" does not give the walker's result.

Fact. R41 (1) as it stands says the entry's `name` is the signed material row's `origin` (else `ref`), which is why the page lists "https://www.foia.gov/faq.html". The signed case's `materials:` row (case-grammar R12: `{ref, kind, sha, text_sha, origin, archived_copy, included, rests_under}`; written by case-disclosures `materials.mjs:69`) carries NO title. public-read reads the published projection and the signed case only (R10, R14: answers must be identical with or without working material), so it cannot read the document's title from the register without breaking R10. The place ("Paragraph 4") already travels in `document.place` as the passage's signed `extent`; wording it ("Paragraph 4") and the "Relied on ·" dot are screens-publish's (R80).

Options.
 A (recommended): add the title to the signed material row: case-grammar R12 gains `title` (the document's title as the capture holds it, `null` when it has none), case-disclosures `materialRows` writes it, and R41 (1) becomes "name = the signed row's `title`, else `origin`, else `ref`". New case documents only (R-OLD: an older signed case keeps its address; a signed document is never rewritten). My part is then a few lines in legs.mjs plus the test on CASE-2026-4783's chain; case-grammar and case-disclosures are other modules' jobs, so BOB writes those two lines and they merge before me.
 B: keep the address as the name (no change to signed data) and have screens-publish word the place only; the walker's MINOR "title" stays open and is recorded as such.
 C: serve the title from the register at read time. Rejected: it makes the published answer depend on working material (R10/R14).

What I need: A or B. Until answered I carry on with the rest (checks, record); for A I will build legs.mjs and its test once case-grammar R12 and case-disclosures carry `title`.

## J16 · REPORT

REPORT (public-read, after B12). Built and pushed; not COMPLETE only because one test waits on a merge, named below.

C48 / R42 (my part): (1) CERTAIN: `PublicRead.publishedAddress({case, edition})` (index.mjs, before `publishedFrozen`), `/app/published/` + encodeURIComponent("<case>/<n>"); null for unpublished/unnamed. case-authoring:1702 composes `/app/published/${id}/${n}` unencoded and ceremony.mjs:134 its own: both to be replaced by the builder (their jobs). (2) the old tests never asked for the address; the new test uses the shell's route form as oracle. (3) published-address.test.mjs, 3 tests, red ("publishedAddress is not a function") then green, incl. the edition 2 control. (4) N.

C47 / R41 (my part): legs.mjs now names an entry by the row's `title`, else `origin`, else `ref`. Test: evidence-names.test.mjs "R41 (1), C47 ..." with controls (null, absent, blank title keep the address). Seen RED: actual name is the address. It stays RED BY NAME until case-grammar R12 carries `title` (CASE-GRAMMAR #19): its `materialsOf` reader (case-grammar/materials.mjs MATERIAL_FIELDS, :86, :131) drops `title` today. Nothing else of mine is open. (2) tested on a scripted entry; the fixture now signs a titled row through the real case document writer. (4) N.

Suites: public-read 242 pass before the C47 test, 1 red now by the above. Checks: ownership 0, format 0, architecture 0; coverage and words findings are other modules' (installer-steps, interface-shell, pdf-reader, queue, screens-*, op-grades t33/t51), none public-read.

Need: ring me (RESUME) once case-grammar's R12 `title` is on tranche/T51; I merge, rerun the suite and checks, and COMPLETE with the Size line.

## J17 · COMPLETE

COMPLETE (B14 RESUME applied; replaces my REPORT J16). Merged tranche/T51 (case-grammar #19 in).

C47 (R41): (1) legs.mjs:53 names an entry by the row's `title`, else `origin`, else `ref`; the place is the passage's signed extent, unchanged. (2) tests used a scripted entry with no title; evidence-names.test.mjs now signs a titled row through the real case-document writer (`caseDoc`), with controls (null, absent, blank title keep the address). (3) "R41 (1), C47 ...": RED (name was the address), red again after my edit until case-grammar's reader kept `title`, GREEN after the merge. (4) N. Said plainly: case-disclosures (the writer of `title`, #16) has not merged yet (no `title` in its materials.mjs), so the test hands a row with `title` to the real case-document writer and reader; the full path from a capture is the seam owner's (screens-publish) once #16 merges. "Paragraph 4" wording and the "Relied on ·" dot are screens-publish R80's.

C48 (R42): (1) PublicRead.publishedAddress, index.mjs; case-authoring:1702 and ceremony.mjs:134 compose their own and are to use it (their jobs). (2) the address was never asserted against the route; the oracle is the shell's route form. (3) published-address.test.mjs, red ("not a function") then green, with the edition 2 control. (4) N.

Requirement ids met: R41, R42. Suites: public-read 243 pass 0 fail. Downstream (impact): plane 5 fail and control-plane 1 fail are identical on origin/tranche/T51 (278/5 and 355/1 there too: route-map R5/R9, R24 release words, Home R81), not mine. Checks: ownership 0, format 0, architecture 0; coverage/words findings are other modules'. QUESTIONS: J15 answered (B12), none open.
Size (session_01RJ9Po6vVrCTxSZ695UZtwZ): test runs 9, module lines 2800

## J18 · COMPLETE

COMPLETE (B15 START applied; C47 seam, R43). Merged tranche/T51 first.

**What changed.** `bio-plane/src/public-read/legs.mjs`:22-26 new `extentOf` (the object as signed, or the canonical JSON text parsed; text that does not parse to an object gives null, never a throw); `legs.mjs`:59 reads the passage's extent through it. Header comment restated (R43). Nothing else in the module; no new `localize`/word sentence.

**Failing-first.** `evidence-names.test.mjs` fixture now hands the string the chain signs (`canonicalJson(extent)`): red (`place: null`, the R41 titled test too). `screens-publish/c47-seam.test.mjs` red ("the place is the passage's signed extent", `[null, null]`). After the fix both green. New test "R43 …" (evidence-names.test.mjs:209): canonical text, object, and five non-extents (`not json {`, empty, a JSON string, an array, `null`) give `place: null`.

**Suites.** public-read 244 pass 0 fail; screens-publish 255 pass 0 fail (c47-seam 1/1). Checks: format 0; architecture 0; coverage public-read 43 of 43 named, 0 failures; ownership 0 (3 files). `checks/run.mjs`: one failure, `machinery-producers` R16 (another module, not mine); words: inline 0, plain 0, testcopy 0, unkeyed 1982 (unchanged by me).

**R43 line proposed (met):** drop "*(not yet met: T51)*"; test: `public-read/evidence-names.test.mjs` "R43 …" and `screens-publish/c47-seam.test.mjs`.

Size (session_01SctGfdzcWmRNmq49hMahxN): test runs 7, module lines 2800

## J19 · QUESTION

QUESTION (G47, the timestamp tokens; needs a provider, not mine). Join and filter are done on my side (`index.mjs` caseFileFacts: a row stating `sha` joins that capture's material and is listed only if that capture is included; a row stating none joins by `ref` as before; a null `sha` is dropped from the carried row so earlier case files keep their bytes; tests `g47-attest.test.mjs`, red by name until CASE-GRAMMAR #20 merges, green here against a local stand-in of its reader/writer, not committed).

The tokens cannot be keyed per capture from what the projection holds. `case-carriage` registers each timestamp token (`hold(ref, "attestation", tokenSha, ...)`, index.mjs:231-312, from `#holdTokens(ref, home, sha...)`) in `published_shas` as (sha256 = the token's, bundle_id = the material's `ref`, path = `materials/<token sha>`, kind `attestation`): the capture it stamps is known at that call (`sha`) and not stored. My lookup (`index.mjs` caseFileFacts, the `held` read, bundle_id = `a.ref`) therefore returns every capture's tokens of that `ref` under each co-attestation row: with k = 2 captures both with tokens, capture A's row carries B's token and the reverse. They do collide; I cannot show they cannot.

Smallest thing I need: a stored link from a token to the capture it stamps, written by `case-carriage`'s `hold` for kind `attestation` (it has `sha` there) and carried through publication's `published_shas` registration, e.g. a nullable column `capture_sha` on `published_shas` (set only for kind `attestation`), or a path `materials/<capture sha>/<token sha>`. Then I key the lookup by (ref, row's `sha`) when the row states one, and by ref alone otherwise (earlier documents and rows read as before). Who owns it is yours to place (case-carriage, publication; their requirements say what a registered file's row is). My recommendation: the nullable column, since it keeps every existing `path=('materials/'||sha256)` read unchanged.

Until you answer I carry the tokens as before (all of the ref's, under each row), which is the misattribution the join fix removes for accounts; I have NOT hidden any. I will not COMPLETE with this open; I finish the rest (record, checks) and wait.

## J20 · COMPLETE

COMPLETE (B16 START applied, B17/B18 answered; G47 and G47t). Merged tranche/T51 first.

**What changed.** `bio-plane/src/public-read/index.mjs` caseFileFacts (~:1499-1530): (1) an attestation row stating `sha` (64 hex) joins the material of that `ref` AND capture, takes that capture's signed account, and is listed only if that capture is included (an excluded capture of an included `ref` is excluded); a row stating none joins by `ref` as before. (2) A null `sha` (as case-grammar's reader answers an absent one) is dropped from the carried row, so case files of earlier documents keep their bytes. (3) G47t: a `co_attestation` row stating `sha` reads tokens `AND (capture_sha IS NULL OR capture_sha=?)`, the sha lowercased and used only when 64 hex (any other value reads as none); a row stating none runs today's query. `held` items stay `{sha, text}`; no `capture_sha` in any answer. Census/op keys: none changes (K4208); `casefile.mjs` unchanged.

**Failing-first.** `test/m/public-read/g47-attest.test.mjs` (3 tests, R23): red before the fix (capture A's account under capture C's row, B's row without its own), green after against a local stand-in of case-grammar's reader/writer. `g47t-tokens.test.mjs` (3 tests, R23): real commit of one source with two captures and tokens; control green now (proves the setup holds both tokens); the other two green against local stand-ins (case-grammar `sha`, the column, `capture_sha` written), not committed. Edition-2 case not separately tested: the key is per capture, not per edition.

**Seam tests red by name (committed state):** g47-attest 2 of 3 wait for CASE-GRAMMAR #20 (the row's `sha`); g47t-tokens 2 of 3 wait for CASE-GRAMMAR #20, CASE-CARRIAGE #15 (writes `capture_sha`) and PUBLICATION #36 (the column). The shipped token query assumes the column, as B18 ruled; a row stating `sha` fails with "no such column" until publication merges. BOB posts a CHANGE as each lands.

**Suites.** public-read with the stand-ins 250 pass 0 fail; committed state: only the seam tests above red. publication 153 pass 0 fail (154 tests). screens-publish 5 red, identical on the unchanged tranche (G10/words, photos), not mine. Checks: format 0, architecture 0, coverage 43 of 43, ownership 0 (4 files), `checks/run.mjs` 0 failures, words unchanged (no new sentence).

**Deferred.** `index.mjs` `#editionItems` `originalOf` keys a copied material's original by `ref` (two copied captures of one `ref` keep the last); the case file also gives them one path (`caseFilePath("obscured", ref)`), so both are case-grammar/case-disclosures' format question; not touched.

**Requirement line proposed (BOB writes it):** R23's `attestations` gains: a row states the capture it attests (`sha`) only where its `ref` has two or more captures; it then joins that capture's material and account and is listed only if that capture is included; a `co_attestation` row stating `sha` carries the tokens `publication` held for that capture and those held for no one capture (null); a row stating none joins and carries by `ref` as before, and is carried with no `sha` key. Tests: g47-attest, g47t-tokens.

Size (session_01GnvpRhqTuRSK7Kr4FmJwte): test runs 9, module lines 2784

## J21 · COMPLETE

COMPLETE (B20 CHANGE applied; replaces J20's seam-red status). Merged tranche/T51 (case-grammar #20, case-carriage #15, publication #36, case-disclosures #17 in).

**Seam tests now green:** `g47-attest.test.mjs` 3/3 and `g47t-tokens.test.mjs` 3/3 against the real providers, no stand-ins. No code change since J20; my R23 test rows already omit a null `sha` (the carried row drops it), so the deepEqual of attestation rows stands unchanged (casefile.test R23 co-attestation green).

**Suites (preload).** public-read 250 pass 0 fail. Users: publication 164 pass 0 fail (165 tests); screens-publish + case-authoring 502 pass, 8 red: screens-publish's 5 (R3 x2, R4 R30, R24 x2: G10/words/photos) and case-authoring R55 x3 (case-disclosures R4/R7/R11 arms); all 8 fail identically with the tranche's own public-read `index.mjs` swapped in, so not mine; reported for BOB. Checks: `checks/run.mjs` 0 failures on all five, ownership 0 (4 files).

Requirement line and deferred `originalOf` as in J20. No open QUESTION.
Size (session_01GnvpRhqTuRSK7Kr4FmJwte): test runs 12, module lines 2784

## J22 · COMPLETE

**COMPLETE (G50, public-read; PUBLIC-READ #31).**

**Entries applied (G50 (A) and (B), commits in order).**
- `590c83d958` the R-OLD goldens, committed alone before any change: `test/m/public-read/make-g50-goldens.mjs` (a one-off, not run by the suite) and the JSON it recorded at the base `124e62bfa8`, `g50-old-goldens.json`: the one-capture case of `obscured.test.mjs`, g1 (a `ref` with a copy beside an included document) and g2 (a `ref` with an included and an excluded row), each with its stored manifest, every part's bytes, its complete edition and the files an order on the included document withholds.
- `78bb792864` **(A), committed alone** (`index.mjs` `#editionItems`): a copy is joined to its originals by its own hash, `Map<copySha, Set<originalSha>>` from the signed rows, lower-cased; the `ref` is read by `caseFileEntryOf(f.path)`, never by splitting the path. Needs no provider.
- `9c384c8103` **(B)**: `caseFileFacts` adds `capture` (the row's `sha` lower-cased; a copied row's is its original's) to each entry of a `ref` on two or more rows, or `capture: null, capture_invalid: true` for a sha that is not 64 hex; `buildCaseFile` spells `[ref, capture]` paths for the four kinds, names every file of a `capture_invalid` entry in `unheld` and never spells it plain, lists an identical (path, sha256) once, and states the format through `caseFileFormatFor` when a path states a capture (else `bio-case-file/3`, as before); `#editionItems` knows a captured file also by its kind's ref-level path and a copy also by its capture's `document` path; `withholdChains` keeps the directory prefix rule byte for byte for a one-row `ref` and every `/1`-`/3` manifest, and for a `ref` on several rows of a `/4` manifest matches the first link exactly (the `containers/<capture>.json` of the withheld document, the member in its path, no record text read) and falls back to the ref level for every other archive and record, leaving only another capture's own first-link record out. It never under-withholds and may over-withhold a sibling capture's outward chain (BOB records this in `build/rulings.md`).
- `65881aff31` the L probe (below).
- Not built into `dist/`; nothing deployed. `casefilefacts` is internal and is in no `DECLARED_OPS` (`index.mjs` declares `verify` only); `declared-ops.test.mjs` does not name it and pins no answer shape of it. G50 changes no census op and adds no sentence (no word row, no `localize`), so there are no new ids for the checker program.

**Cause (R-FOUR).** (A) `public-read/index.mjs` `#editionItems` built `originalOf = Map<ref, sha>` by `Map.set`, so k copied rows of one `ref` kept only the last original; run on two copies, `seal [A]` answered 200, 200 and `seal [B]` answered 451, 451. (B) `caseFilePath(kind, ref)` took one segment, so two included or copied rows of one `ref` gave two entries one path (`casefile.mjs` :120/:124/:145 at the base). Missed because no test had two `materials:` rows of one `ref` that carry files, and `obscured.test.mjs`' R28 test put the order on the document path, which withholds the copy whichever hash is stored. Gap fixed: `g50-copies.test.mjs` (the member's rows through the real assembly, the real store, `publishedbytes`, `publishedcase`, the real check), with the goldens above.

**Failing first, seen red.** Against `590c83d958`'s code (before (A)): the (A) tests red as the entry states (`seal [A]` 200, 200; `seal [B]` 451, 451); against that code the (B) arms red at the repeated path. The other arms are controls and were green.

**Tests and checks.**
- `node --test bio-plane/test/m/public-read/` under the preload, with `tranche/T51` merged (CASE-GRAMMAR #21 in it, B22): 280 tests, 280 pass, 0 fail (30 new in `g50-copies.test.mjs`). Before the provider merged, run against its job branch's code applied locally and never committed: 280/280; with no provider the module loaded and exactly the 22 G50 tests that assemble a `ref` on two rows were red, every other test green.
- Users: `build/plan/impact.mjs origin/tranche/T51 HEAD` names 53 modules, 916 test files besides this module's: 7,660 tests, 7,646 pass, 11 fail. Four are on your inherited list (case-checker R13, R25; screens-action `contract.test.mjs` R1–R6; plane `release` R24). The other seven (R29 pseudo-sentence arms in `journey-check`) pass in isolation on my branch and fail nowhere else I ran: the files that held the four gave the same 4 failures, 125 pass, on a clean `tranche/T51` copy and on my branch. I take the seven as order-dependent in the large run and not mine.
- Process repo: format 0 failures; architecture public-read 0; coverage public-read 43 of 43 ids named, 0; ownership public-read 8 files, 0 failures; `checks/run.mjs`: all 0 except words `inline 1` at `case-checker/spec.mjs:11` (inherited). `setup-words/build.mjs --check` is stale at `calculations.index.a_reason_is_at_most` (not mine; my module added no word).
- `obscured.test.mjs` is unchanged (I split its `publish` for a moment and put it back: `g50-copies.test.mjs` has its own harness that never reads the zip).

**Platform check L** (`test/m/public-read/g50-l.probe.mjs`, workerd under Miniflare, the real `assembleCaseContainer` and `publishedRoutes`, a real R2 binding, a SQLite Durable Object that stands in for the store: it answers `casefilefacts`, `verify`, `withheld` and records the manifest as `recordCaseManifest` does, so the object's own CPU is not what it measures): k = 501 held captures of one `ref`, 2 files each.
- Assembly (1 invocation): bucket get 1002, head 1011, put 6; object calls 2 (casefilefacts 1, recordcasemanifest 1); 2,016 SHA-256 digests; subrequests (bucket + object calls) 2,021; wall 1.4 s; workerd CPU 1.5 s; 1,010 files in 1 part; format `/4`; 0 unheld.
- Stored manifest: 239,643 B against the value bound 2,098,176 B (11% of it); 1,011 `published_shas` rows.
- Serve of part 1 (`publishedbytes&format=zip&part=1`): 200, 968,522 B; bucket get 1,011; object calls 3; 1,011 digests; subrequests 1,014; wall 0.8 s; CPU 0.9 s.
- Against ceilings: nothing passes the ceiling the plane pins (`wrangler.jsonc` `limits.subrequests` 10,000; 2,021 is 20% of it). Both counts are above 1,000, the Cloudflare default before February 2026 (the file's own comment), so an instance deployed without that pin would meet its ceiling at about k = 250 captures in the zip serve and 500 in the assembly. Local workerd enforces no subrequest limit, so this is a count, not a refusal. The case assembles today with the collision at the same cost, so none of it is G50's.

**Requirement lines I propose (BOB writes them).**
- R23, replacing "The case file states `bio-case-file/3`": "The case file states `bio-case-file/4` when a `ref` is on two or more rows of the case document's `materials:` block (counted over every row, carried or not) and the case file carries a `document`, `extracted_text`, `observation` or `obscured` file for it, else `bio-case-file/3`. For such a `ref` each of those files is carried under its row's capture (`case-grammar` R13), the row's `sha` lower-cased (a copied row's is its original's); a row whose `sha` is not 64 hex has no capture to spell, so its files are named in `unheld` and none is carried at a plain path. An identical (path, SHA-256) is listed once (an archive two captures share)."
- R28, after its sentence on a carried archive member: "A copy carried for a material is withheld by an order naming its own path, its `ref`'s `document` path, its capture's `document` path, its own hash, or the hash of an original it was made from, and never by `ref` alone: a `ref` on two copied rows has two originals, and an order naming one withholds that capture's copy only. A `document` file's own `container` record and archives are withheld with it: for a `ref` on one row, or in a `/1`-`/3` case file, every archive and record under the document's directory; for a `ref` on several rows of a `/4` case file, the record whose member is the document's capture, exactly, and every other archive and record of the `ref` at the ref level (so a sibling capture's outward chain may be withheld too, never the reverse)."
- Uses: `case-grammar`'s `caseFileEntryOf` (now answering `capture`), `caseFileFormatFor`, `refsOnSeveralRows` (a test pins that the facts' count agrees with it).

**Deferred:** none. **Found in other modules:** none new (the in-tree checker's `fileOf` by ref and `program.mjs` stay stale until case-checker #17 and BOB's regeneration, as the entry says).

Size (session_01NMAPmXtfQM81PpmWgAWnaY): test runs 14, module lines 3933

## J23 · COMPLETE

**COMPLETE (G54, public-read; CHANGE B23 and addendum B24).**

**Depends on `publication`'s G54 job, not yet in `tranche/T51`.** `publishedcase` reads the four `casefile_*` columns and the assembly writes through the `recordcasefile` hop, so with `tranche/T51` as it stands (no `recordCaseFileAttempt`, no columns) every `publishedcase` read of my module fails on the missing column and 165 of 298 public-read tests are red. I developed and ran against `publication`'s job branch applied to my working tree and never committed: 298 of 298 pass (281 existing, adjusted as listed below, 16 new in `g54-attempt.test.mjs`, 1 for the sentences). Please post a CHANGE when `publication` has merged; I will merge, re-run and say so. No feature check, as G47t.

**Contract for ratification (signatures).**
- `assembleCaseContainer({ env, stub, storeName, cs, via, maxBytes, prior })` (`publication/worker.mjs`): `prior = { materials_missing: [ {sha, ...} ], copy_error: Error|string|null, copy_code: <code>|null, absent: boolean }`, all optional. `copy_error` set: records `failed` at step `copy` and builds nothing; `materials_missing` non-empty: `failed` `MATERIAL_MISSING` at step `materials`; `absent: true` is the caller's confirmation (its evidence-store probe) that a missing material is gone, passed to the ledger so that the writer may reach `stopped`. Answers the manifest's hash, `parts`, `part_addresses`, `files`, `bytes`, `unheld`, `zip`, `inband` and `case_file: "built"`, as before plus those two; or `{ok:false, reason, code, step}` (`reason` `CASE_FILE_NOT_BUILT`, or the older statement's own `reason` with `code`/`step` added). It never throws.
- `recordCaseFileFailure({ stub, cs, via = null, step = "copy", error = null, code = null, absent = false })` → `Promise<{ok, state, code, step}>`; never throws; one `casefile_attempt` error line; `code` outside `CASEFILE_CODES` reads `BUCKET_FAILED` for a copy and `UNKNOWN` otherwise.
- Exports: `CASEFILE_CODES` (the closed set, 9) and `CASEFILE_FILES_MAX` (4,000), `publication/worker.mjs`; `caseFileStateOf`, `CASEFILE_PUBLIC_STATES`, `CASEFILE_BUILDING_STALE_MS` (120,000), `public-read/casefile.mjs`; `CASEFILE_SENTENCES`, `public-read/index.mjs`.

**Applied.**
- Steps and codes (one mapping, `casefileCodeOf`): `facts` store silent/throw `STORE_SILENT`; no bucket binding `NO_BUCKET` (step `bucket_put`, nothing recorded, the two silent skips removed); more than 4,000 files estimated from the facts `TOO_LARGE` (step `build`, not attempted); a finding's bytes absent `FINDING_MISSING`; an unheld material that names a well-formed sha and has no `why`, or `prior.materials_missing`, `MATERIAL_MISSING` (step `materials`, no manifest recorded); `bucket_put`/`manifest_put` throw `BUCKET_FAILED`; `record` silent `STORE_SILENT`, refused `NOT_RECORDED`; anything else `UNKNOWN`. `INTERRUPTED` is the public read's code for a `building` older than 2 minutes. `built` is recorded only after the manifest's own bytes are put; a failed `manifest_put` leaves `manifest_sha` set and the edition owed.
- What is not a missing material, and why: an entry with a `why` (by design), a null or malformed sha (a row stating no extracted text; a several-ref row whose sha is no sha, G50: `unspellable`), and an archive the commit did not register because it holds an image (`unregistered`, `case-carriage` R8: no retry heals it). Without these the common edition (no extracted text stated) and every edition resting on an archive that holds an image could never build.
- One `casefile_attempt` JSON line per attempt (`console.error` failed, `console.log` built): case, edition, via, step, ok, code, error (name and message cut to 160), files, bytes, recorded. No secret, no document text.
- `publishedcase` answers `case_file: {state, code, attempted_at, attempts}` (null for a ratified bundle in no case): `built` | `being_prepared` | `retrying` (code) | `stopped` (code `MATERIAL_MISSING`) | `waiting_on_members`; and the Worker's route `verification.case_file` the same. No sentence, `step`, `error` or `detail` in any answer (tested with a marker string in the thrown error). One choice beyond the entry, for BOB to confirm: `verification.container` and `.manifest` are null unless `case_file.state` is `built`, so a manifest recorded over bytes never stored is not offered as a download; every edition with a manifest and no ledger state (the three healthy ones) reads `built` and is unchanged.
- Census (K4208): `publishedcase` and `publishedbytes` accept no new key; their answers gain `case_file` and `verification.case_file`. `recordcasefile` is publication's hop, not mine. No op of this module is declared or changed.

**The 13 stand-in sentences (B24)**, `public-read/casefile-words.mjs`, `CASEFILE_SENTENCES`, each `localize(id, en)` with both literal, in no answer, English exactly as SCREENS-PUBLISH #20 gave it: `screen.published.casefile.{being_prepared, retrying, stopped, waiting_on_members}` and `screen.published.casefile.code.{NO_BUCKET, STORE_SILENT, MATERIAL_MISSING, FINDING_MISSING, BUCKET_FAILED, NOT_RECORDED, INTERRUPTED, TOO_LARGE, UNKNOWN}`. These 13 ids are new for the round-end regeneration of `rows.mjs`; the words check shows no new finding in this module (marker 0; `inline 1` is the inherited `case-checker/spec.mjs:11`). The page needs them as words: states `being_prepared`, `retrying`, `stopped`, `waiting_on_members` (not `built`) and the nine codes.

**Pinned tests changed to the entry's contract** (no case file while a material is missing): `casefile.test.mjs` (the fixture no longer lists a material never held; its next-to-last test states the `MATERIAL_MISSING` statement and the build's `unheld`), `archives.test.mjs` (the tampered-archive case reads the build and the statement), `obscured.test.mjs` (the unregistered and wrong-bytes copy case likewise), `finding-page.test.mjs` (`verification` gains `case_file`).

**Failing first.** `g54-attempt.test.mjs` is red on the base tree (it imports `recordCaseFileFailure` and `CASEFILE_CODES`, which the base lacks, so the file does not load; behaviourally the base throws on (a), (b), (c) and (e), records nothing and leaves (f) and (g) with a manifest). Listed cases: (a) `put` throws, (b) `casefilefacts` silent, (c) `recordcasemanifest` silent, (d) a finding's bytes absent, (e) `put` throws only for the manifest, (f) no binding, (g) a material absent and `prior.materials_missing`, each answering the statement, recording `failed` at its step and code, one error line, the edition owed (manifest set for (e), none for (f) and (g)); success order `building`, manifest bytes put, `built`; heal on the next attempt; `recordCaseFileFailure`; `prior.copy_error`; every public state; the closed set maps in one place. The control on the real bytes of 4783 and 6227 is not run here: those bytes live on the test copy and are not in this checkout (R-STOP: named). Platform check L is plane's.

**Tests and checks (with `publication`'s branch applied).** public-read 298/298. Users (`impact.mjs`, 53 modules, 916 files): 7,658 tests, 7,643 pass, 12 fail: the inherited case-checker R13/R25, screens-action R1-R6 and plane R24 reds, seven R29 pseudo-sentence arms that pass in isolation (as in G50), and one new: `R19, R6` (op-declarations: every op served by an owner's map has a spec), caused by `publication`'s `recordcasefile` hop, which is publication's to declare. format, architecture public-read, coverage public-read (43 of 43), ownership (10 files): 0 failures; words: no new finding.

**Deferred:** none. **Found in other modules:** `publication` G54's `recordcasefile` needs a spec in the ops census (R19 above); the completing paths in `ratification` must pass `prior` and call `recordCaseFileFailure` as stated.

Size (session_01NMAPmXtfQM81PpmWgAWnaY): test runs 24, module lines 4108

## J24 · COMPLETE

**COMPLETE again (G54, CHANGE B25).** `tranche/T51` merged (publication's ledger and PUBLISH-SCHEDULE in it); nothing in my code changed. Against the real `publication`, public-read: 298 tests, 298 pass, 0 fail. Users (`impact.mjs`, 916 files besides mine): 7,650 tests, 7,635 pass, 12 fail, all of them also failing on a clean `tranche/T51`, none mine: case-checker R13 and R25 and plane/screens-action reds (your inherited list); seven R29 pseudo-sentence arms (journey-check, pass in isolation); and op-declarations `t33.test.mjs` R19, R6 (a census spec for `recordcasefile`, red on the clean tranche as well, so publication's or op-declarations'). `absent` passes through to publication's writer; public-read never decides `stopped`. format, architecture, coverage public-read (43 of 43), ownership (10 files): 0 failures; words: no new finding. The 13 new word ids and the signatures are as in J23.

Size (session_01NMAPmXtfQM81PpmWgAWnaY): test runs 27, module lines 4108

## J25 · COMPLETE

**COMPLETE · fix round 8, G121 (R44).** Commit on `job/T51/public-read`.

**(1) Cause, as planned, confirmed by reading.** `publication/worker.mjs` `assembleCaseFile` put the case file's files one at a time (`for … if (!(await b.head(...))) await b.put(...)`), and `public-read/casefile.mjs` `buildCaseFile` read each material, extracted text, archive, copy, attestation token and calculation input after the last through `read(sha)`.

**Applied.** `casefile.mjs`: `export const CASEFILE_GROUP = 8`; `buildCaseFile` first reads every object it will need (findings' bytes, materials, extracted texts, registered archives, copies, attestation tokens, calculation inputs; each sha once, only well-formed ones, only those the facts do not carry inline) in groups of 8, keeps each answer or throw by hash, and hands it back where the assembly asks, so the files, `unheld`, statements and their order are what the one-at-a-time read gave, and a read that throws throws where it was asked (step `build`, code `UNKNOWN`, as before). `worker.mjs`: the `head` and `put` of the files run in groups of 8 over the distinct objects (two paths of one file are one object, which the sequential head already made one put). The manifest's own `head`/`put` is unchanged. Census (K4208): no op added or changed; the answers are byte for byte as before. Bound (R-SILENT): a group size of 8, stated here; it changes nothing a member may do.

**(2) Why the tests missed it:** nothing counted R2 calls or their depth and the bucket stand-ins answered at once. **Fixed:** `r8-assemble.test.mjs` records start and end of every `get`, `head` and `put` on a bucket that answers after a wait.

**(3) Failing-first, seen red on the base tree** (R44 named in every title): `head: peak concurrency at least 6 (1)` (both modes) and `read concurrency between 6 and 8 (1)`. Green after: 4 of 4. The file asserts, through the real commit, store and `assembleCaseContainer` over 19 files: peak concurrency of head, put and get at least 6 and never over 8; the golden set of keys (every file the manifest lists and the manifest's own bytes, once each; with the copied objects already present only the new ones); `buildCaseFile` with a slow read answers manifest, `unheld` and files equal to the one-at-a-time read's with no extra read; a throwing read stops at step `build`. Five runs on one core (`taskset -c 0`): 5 of 5.

**(4) Platform check:** L here (counts and concurrency). P is BOB's after the redeploy (the case file's phase in `caseratify;dur`). Depth of the case file's R2 chain with 12 files is now 2 groups x (head, put) = 4 plus ONE group of reads, where G120's sum assumed the two `PUBLISHED.get` calls in sequence (6): the reads are concurrent too, so the figure is 5 for the case file, one lower than the plan's sum; this is why.

**Requirement wording proposed for BOB (R44):** drop "*(not yet met: T51)*"; test: `r8-assemble.test.mjs`. Also: the reads of materials are issued first, before the file list is built, so an edition with a missing finding reads its materials before it is refused (the memory the assembly already held for files; bounded by `CASEFILE_FILES_MAX`).

**Tests and checks.** public-read: 302 tests, 302 pass, 0 fail. Users: `impact.mjs origin/tranche/T51 HEAD` names 52 modules; the 60 test files outside mine that name `assembleCaseContainer`, `buildCaseFile`, `casefile.mjs` or `caseratify` (case-checker, ratification, control-plane, plane, others): 634 tests, 634 pass, 0 fail. format 0 failures; architecture 0; coverage 44 of 44 ids named, 0; ownership 0 (4 files changed by public-read). words: 13 failures, none in this module's files (installer-steps `installer.fleet.logsunconfirmed`, screens-intake `refusal.PROMOTE_NOT_A_PARTICIPANT` and others, other owners'). **Deferred:** none. **Found in other modules:** none; stale generated artifacts: `bio-plane/dist/bio-plane.bundled.mjs` and its manifest are stale by this change (the plane bundles both files); BOB regenerates at the round end.

Size (session_01ASV3wk2NXRsmjWuZ5kcqd8): test runs 14, module lines 4142

## J26 · COMPLETE

**COMPLETE · fix round 9, job 50, G121b (R44).** Commit on `job/T51/public-read`.

**(1) Cause, confirmed by reading and by counting.** `publication/worker.mjs` `assembleCaseFile` put the case file's files in two barriered groups of 8, a `head` before every `put`, and put the manifest's own bytes (a `head` then a `put`) only after `recordcasemanifest`; `public-read/casefile.mjs` `buildCaseFile` read its materials in barriered groups; `assembleCaseContainer` awaited the `building` ledger call before the facts were asked. My reading agrees with the diagnosis (item 3). On the walker's one-finding case the longest awaited chain of R2 calls was 5 levels locally (10 on a twelve-file case with ten materials); R2 `get`, `head`, `put` each waited for the one before.

**Applied.** (a) `casefile.mjs` exports `inWindow(items, fn, width = CASEFILE_GROUP)`, a window of 8 that slides (the next call starts the moment one ends; answers settled results in item order; starts nothing after a failure), used for the reads of materials; `CASEFILE_BLIND_PUT_MAX` (256 KiB, proposed; BOB records). (b) `assembleCaseFile` records which shas it read from the bucket at their own key: a file of such a hash is held already and gets neither `head` nor `put`; every other file is put by its hash with no `head` before it (a file over `CASEFILE_BLIND_PUT_MAX` is asked after first, so a large file already held is not sent again). (c) The manifest's bytes are made before anything is written (`inbandQuartet` needs only the files' hashes) and put in the same window as the files, never above 8 at once; `recordcasemanifest` still follows the files; a failure of the manifest's own put is still stated after the record (step `manifest_put`, recorded, bytes not stored: `g54-attempt.test.mjs` (e) holds unchanged). (d) The `building` ledger call is issued while the facts are read, and awaited before any later ledger write (a late `building` would overwrite a `failed` or `built`).

Chain now: one level of reads, one of writes (files and manifest together), for up to 7 derived files besides the manifest; each further 8 add one level. The same objects are written; the answers are byte for byte as before.

**(2) Why the tests missed it.** Round 8's test counted peak concurrency and calls, not the awaited chain. **Fixed:** `r8-assemble.test.mjs` gives every bucket call a level (one more than the deepest call that had ended when it started) and asserts the top level.

**(3) Failing-first, seen red on the base tree:** `at most 3 levels of awaited R2 calls (5)` (the walker's one-finding case) and `(10)` (twelve files and more); `…/<sha> was read and is not written`. Green after: 9 of 9 in the file (new: the two depth cases, the read-is-held test, a file put that fails stops before the record at `bucket_put` and a manifest put that fails stops at `manifest_put`, the window's own test). Two older assertions in the same file stated the mechanism and changed with it, to the requirement's intent (same objects written, groups of 8 never exceeded): the `head` concurrency of at least 6 and "every object put was asked after by its head" are gone because heads are gone, and the golden key set now excludes the objects read from the bucket (held) and includes small objects already held that are put again with identical bytes.

**(4) Platform check:** L here (counts); P is BOB's: `assemble;dur` on the re-walk. **Old records:** none; stored data unchanged (new assemblies only; an object put twice is the same bytes under the same key).

**Requirement wording proposed for BOB (R44):** "The assembly's `head` and `put` of the files run in groups of 8 over the distinct objects ...; the manifest's own `head` and `put` are unchanged" becomes: "The assembly puts the files it derives, and the manifest's own bytes, in a sliding window of 8 over the distinct objects (two paths of one file are one object), each by its hash and with no `head` before the `put` (a file over 256 KiB is asked after first); an object it just read from the bucket at its own hash is held and is not touched. The reads of materials likewise. The manifest is recorded after its files; a failure of its own put is stated after the record. Test: `r8-assemble.test.mjs`: the longest awaited chain of R2 calls is at most 3 for up to 7 derived files." One consequence to know: if `recordcasemanifest` refuses after the manifest's bytes are in the bucket, those bytes stay there unserved (no `published_shas` row), as the manifest of a case already public.

**Tests and checks.** public-read: 308 tests, 308 pass, 0 fail. Users (`impact.mjs origin/tranche/T51 HEAD` names 52 modules; run: ratification, publication, plane `g54-sweep`, control-plane `r8-caseratify-calls` and `t51-round7-seam`, screens-publish, case-authoring `editions`, case-disclosures `g50-acts`): 526 + 295 tests, 0 fail. format: 176 modules, 1 failure (`office-readers`' path `bio-plane/src/office-xml.mjs`, not mine, on the tranche already); architecture public-read: 0 failures; coverage public-read: 44 of 44 ids named, 0 failures; ownership: 4 files, 0 failures; words: no finding in my module (19 failures round-wide, none mine).

Size (session_0184YebVjUHZmj4s1SrMEH85): test runs 9, module lines 3910

## J27 · COMPLETE

**COMPLETE (fix round 10, Wave A batch 4, public-read).** START B28 applied, commit 124baaaa6a on job/T51/public-read.

**Fixtures published** (`bio-plane/test/m/public-read/fixtures.mjs`, new; each made by the real code at call time, never stored; checked against the real answer in `fixtures.test.mjs`, new):
- `groupIdentityRegistrar` (R34): PROVIDER_MALFORMED, the first registration, PROVIDER_DECLARED. User: instance-setup (re-points in its job).
- `assembleCaseContainerRefusal` (K5074; R6, R23): MATERIAL_MISSING at materials, BUCKET_FAILED at bucket_put, CASE_FILE_NOT_ASSEMBLED naming the finding. Users: ratification g54-paths, g57-heal (re-pointed in ratification's job).

**Own fixture lines** (10 FIX-L contract markers, each on its own line directly above the value, `// fixtures-contract: <provider> <id>`): docket-real:21 and public-path:30, sampling:30, served:29 and relay:31 and door:29 (`answer-envelope door-helpers`); door:82, relay:40, relay:42 (`store-door store-replies`); group-fields:19 (`instance-setup group-identity-public`). The line numbers moved by the inserted marker lines.

**Markers added** (for the merge, K5060):
- `dec149.test.mjs` above line 130: `// fixtures-own: input` (a literal the negative control plants for the voice rule, which reads any answer; no module answers it).
- `g54-attempt.test.mjs` above line 220: `// fixtures-generic: SOMETHING_ELSE` (an invented code, on purpose, to prove a code outside the closed set reads UNKNOWN).

**Left at done** (`contract-no-run`, waiting on the providers' `fixtures-run`): answer-envelope door-helpers (6 lines above), store-door store-replies (3), instance-setup group-identity-public (1). Each provider's job runs its contract.

**Deferred:** none. **Found in other modules:** `screens-publish/g54-page.test.mjs:114` fails (the sentence "couldn't be built yet" is drawn HTML-escaped as `couldn&#39;t`). It fails identically on the base commit before this job, so it is not from this change: screens-publish's job, or the words/escaping path, to settle. The op-table entries and the three public-read FIX-E users re-point in their own jobs. The two `owner-ops.mjs` rows are not touched here.

**Tests and checks:**
- `node --test bio-plane/test/m/public-read/*.test.mjs`: 309 pass, 0 fail.
- touched files and fixtures.test: 61 pass, 0 fail.
- user modules named by impact that import the changed files (case-disclosures g50-acts, op-declarations t35, screens-publish c47-seam and g54-page, control-plane r45/r48/r49 routes and case-inputs-public): 34 pass, 1 fail (the escaping above; it fails on the base too).
- `checks/fixtures.mjs /home/user/bio public-read --list`: 0 failures; 10 `contract-no-run` (listed above), 2 `accepted` (the markers).
- format 0 failures (178 modules); architecture 0; coverage 44 of 44 live ids named; ownership 0 (12 files); words 0 failures.
- `impact.mjs origin/tranche/T51 HEAD`: 51 modules; the changed files are imported only by the user modules listed above.

Size (session_01BEeDNCorrpjXyGB6RpWrrB): test runs 4, module lines 2956

## J28 · QUESTION

**QUESTION (CHANGE B29: the case-file assembly to three hops).** I cannot reach three inside public-read's paths without changing a requirement. Decision for you.

**Measured.** `bio-plane/test/m/public-read/chain.test.mjs` (committed red, as the failing-first step) counts the logical chain: casefilefacts, then one bucket get, then seven puts (in parallel), then recordcasemanifest, then recordcasefile (built). The chain is 5, as the CHANGE says.

**Why each hop is there.** (1) The facts. (2) The reads: the files' bytes must be read before anything can be built or put. (3) The puts: they need the built content. (4) recordcasemanifest: G54 says a manifest is recorded once its files are in. (5) recordcasefile built: G54 says `built` is recorded only after the manifest's own bytes are stored.

**What is reachable.**
- Folding recordcasemanifest and recordcasefile(built) into one store op: chain 4. That op is in publication's index.mjs, outside my paths, so it needs publication's job or BOB's edit.
- Chain 3 needs also the reads folded into casefilefacts (the store returns the bytes), a large store change, or recording the manifest before its bytes are stored, which G54 forbids.

**Options.**
(a) Amend G54 so `built` may be recorded by the manifest's own record op, fold the two store calls (publication's op), and take chain 4. Ratification's own chain then has to be at most 5, not 6, for R60's bar of 10.
(b) Keep the requirements; the bar of 3 is unreachable, so ratification's own chain goes to 7.
(c) Fold the reads into casefilefacts (store-side, large): chain 3.

**Recommendation: (a).** Nothing else of the CHANGE is done. I did not change the assembly, since any change to it now would break G54. The module's tests are green apart from the red chain test. Waiting on BOB (J28).

## J29 · COMPLETE

**COMPLETE (CHANGE B31: the case-file chain to 4).** Merged `tranche/T51` (publication #39, R15) and applied the change in `bio-plane/src/publication/worker.mjs`.

**Entries applied.** The case file's own record (`recordcasemanifest`) now carries `built: manifestStored`, true only when the manifest's own bytes are stored (G54's order kept). `assembleCaseContainer` skips its separate built write for those results (a WeakSet marks them, so the answer's shape is unchanged). The legacy container path still writes built itself.

**Test changes.**
- `chain.test.mjs`: bar 4, seen red at 5 first. It now passes at 4 (`CHAIN_DEBUG` shows: recordcasefile, casefilefacts, bucket.get, seven puts, recordcasemanifest).
- `g54-attempt.test.mjs`: the success-order test asserted a separate `ledger:built` write after the manifest's bytes. It now asserts the folded `manifest:built=true` comes after the manifest's bytes and that no separate built write is made. The claim is the same.

**Deferred:** none. **Found in other modules:** none new. The ratification chain bar (R60's door bar of 11) is BOB's, as stated in B30.

**Tests and checks.**
- `node --test bio-plane/test/m/public-read/*.test.mjs`: 310 pass, 0 fail.
- `publication/*.test.mjs` plus ratification `g54-paths` and `g57-heal`: 214 pass, 0 fail.
- format 0 failures (178 modules); architecture 0; coverage 44 of 44; words 0; ownership 0 (13 files).
- fixtures `--list`: 4 `contract-no-run` remain, waiting on providers' `fixtures-run` (answer-envelope door-helpers, store-door store-replies, instance-setup group-identity-public). The rest are accepted.

Size (session_01BEeDNCorrpjXyGB6RpWrrB): test runs 6, module lines 2956
