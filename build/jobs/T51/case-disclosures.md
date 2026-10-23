# case-disclosures (T51)

**Status** · session_01JCHNeQistwMeSv51kQxgRA · depth 2 · COMPLETE · handled B6

## J1 · QUESTION

QUESTION (my best reading is below; I carry on with it).

R33 (`dated` on `photosOf`) needs two services case-disclosures does not yet declare, and two tests need two more for K3268's "assemble a hand-list from the other module's own declaration". `checks/architecture.mjs` fails on exactly these four, nothing else:

1. `civil-time` (src): `localDay(instant, zone)` for the local day of the attesting capture's instant (`capture_actors.at`, read through `capture.captureAccountsOf`, the same first actor that gives `taken_by`).
2. `retrieval` (src): `zone()` (its R69), the team's governing time zone, the same read `ratification` R44 and `publish-schedule` R1 use. Reached lazily as `caseDisclosuresOf` reaches its others; a test passes its own.
3. `image-cover` (tests only): `COVER_REFUSALS`, so photos.test.mjs builds its refusal-code list from the module's table, not by hand.
4. `doc-clean` (tests only): `CLEAN_REFUSALS`, so documents.test.mjs does the same.

Please add `civil-time`, `retrieval`, `image-cover`, `doc-clean` to case-disclosures' `uses` in `build/modules.json` (and the requirements' Uses lines if you keep them in step). Until then my architecture check shows these 4 failures; they are the only ones.

Also for your record: the design stream's word row `case-disclosures.document_case_findings` says "acknowledgment"; the code's signed sentence says "acknowledgement" (case document byte-pinned by seam.test's hashes, K1333). I kept the code's spelling (a signed text changes only as a new version) and read it through `localize`; if you want the design's spelling, that is a new case-document version, your call.

## J2 · REPORT

REPORT: T51-150 work is done and pushed on job/T51/case-disclosures (tranche/T51 merged in). I am not posting COMPLETE yet because J1 is open: `checks/architecture.mjs` shows 4 failures, all the undeclared uses J1 asks you to add (civil-time, retrieval; tests: image-cover, doc-clean). Once modules.json has them I re-run the checks and post COMPLETE.

Done:
- R33: `photosOf` answers `dated`, the local day (civil-time `localDay`) in the team's zone (retrieval `zone()`) of the first capture actor's instant, null with no zone, an unreadable instant or no visible attesting member. Tests: Pacific 2026-10-12T23:30Z -> 2026-10-12; 2026-10-13T03:30Z still 2026-10-12; the same instants in Pacific/Auckland are the next day; null for no zone, "", unknown zone, non-string zone, a throwing zone read, a malformed instant, no actor.
- Words: all 39 findings and the 6 K3962 copies fixed; `checks/words.mjs` reads 0 failures for the module. Where the design has a row I read it by key (tension templates, FLAG_SENTENCE, signature, owner's words, gaps, labels, etc., each byte-identical to before); the rest use new `case-disclosures.<stem>.<slug>` localize ids. Every renderer's output is byte-identical to before (seam.test's hashes plus my own old-vs-new comparison over extra rows). Test hand-lists now come from image-cover's and doc-clean's own tables. Tests compare with word/localize, none holds a sentence.
- Tests: 100 pass, 0 fail. coverage 33/33; format 0; ownership 0 failures; words 0.

Judged not read by a member (not converted; settle with the design stream, K3944):
1. `BAD_COMPLETENESS` details (index.mjs, accepted.mjs, people.mjs `basesListed`/`REF_WORDS`, selfAttestedJudged, tieAttestationJudged, accountJudged, biasApplicationsOf): they describe an op argument's shape to the caller ("X is a list of {…}"); wire grammar.
2. Inner fragments joined into refusal `detail`s (`${target}: ${ref} ${sha} lacks …`, "on", "under", "relied on by", "edition … of import …", "is co-attested"/"is not a document this case rests on"): the outer sentences are converted; screens read `refusal.<CODE>`, never `detail` (DEC-342, U370).
3. `why`/`reason` diagnostics inside `undetermined` lists that carry an exception message (`e.message`) or another module's `reason` code.
4. `#liveText` etc. internal reason codes, `"leg"`/`"conclusion"` where-paths (`basis[i].bias_applied[j]`): identifiers.
Converted anyway though it is a refusal `detail`: hunch, person basis, tie attestation, tensions undetermined, disclosure/flag not standing, and the seven account details.

Found elsewhere, for you: the design row `case-disclosures.document_case_findings` spells "acknowledgment"; the signed sentence is "acknowledgement" (see J1); kept as signed.

## J3 · COMPLETE

COMPLETE: T51-150, case-disclosures.
Entries applied: R33 (`photosOf` `dated`: civil-time `localDay` in retrieval's `zone()`, null when unreadable, never a UTC day); the 39 words findings and the 6 K3962 test copies (by design key where a row exists, else `case-disclosures.<stem>.<slug>` via localize; renderer bytes unchanged, pinned by seam.test's hashes; hand-lists built from image-cover's and doc-clean's tables).
Deferred: none. Diagnostics judged not read by a member are listed in J2. Nothing found in another module beyond J1/J2's design-row spelling note (answered B2).
Ran: case-disclosures tests 100 pass, 0 fail; checks/run.mjs: format 0 failures, architecture 0 failures, words 0 for this module (coverage lines for other modules are theirs; case-disclosures 33 of 33); setup-words build --check: stale-rows note only; ownership 0 failures (15 files).
Size (session_01P9n81fc4LnyRtWrhbQ6VPS): test runs 8, module lines 2389

## J4 · COMPLETE

COMPLETE: fix round 2, case-disclosures, causes C39 and C40 (my part).
C39 (R2, R16): `restingCaptures` and `hunchDebt` read live legs only. `inquiry_basis` drops the leg's status, so the live set is read from the member's own `references[]` (severed = the first entry for the target is `status: severed`, connections R22's rule; unreadable document = live). A finding whose cited leg was severed rests on no capture for the gate, and a hunch on a severed leg is no debt. Tests (seen failing first): "R2 (C39)" (severed leg unnamed, live leg named, same finding with the citation live names both), "R16 (C39)" (control: same hunch live is UNCLEARED_HUNCH).
C40 (R2): CO_ATTESTATION_UNACKNOWLEDGED now carries `missing` per capture (`["timestamp"]`, `["co_archive"]` or both), also in its detail (localize ids `case-disclosures.index.capture_lacking`, `missing_timestamp`, `missing_co_archive`); `captureFacts` answers `missing` too. Test "R2 (C40)": neither, timestamp only, co-archive only; control: a capture with both is not named.
For BOB (screens-inquiry's half, wave 2): `attest` does NOT write the co-archive from what the document page sends. attestation R3 asks the co-archive only with `archive: true` and a public https `locator`; `screens-inquiry/document.mjs:940-942` sends `{sha256}` alone, so the timestamp is obtained and the co-archive never is. No change belongs in `attestation` (R1-R3 are right); the act must send `archive: true` and the document's public locator, and draw what the gate's `missing` (or the answer's attempts) says is still absent. Requirement-id note: no new id was written for C39/C40 in this file; the tests name R2 and R16, whose lines they meet.
Ran: case-disclosures 103 pass, 0 fail; case-authoring 208 pass; case-account 48 pass. checks/run.mjs: architecture 0 failures; format and coverage failures shown are not this module's (rulings.md:4298 K4301; other modules' ids); words 0 for case-disclosures; setup-words --check: stale-rows note only (names my new localize id, expected); ownership 0 failures (4 files).
Size (session_01QauuYoWqCoXNu8JWm2WmuR): test runs 7, module lines 2395

## J5 · COMPLETE

COMPLETE: fix round 3, case-disclosures, cause C40 (my part), requirement R2.
Why the pre-flight shows neither proof after `reattest`: `capture.lateAttestationsOf` is right and `captureFacts` already read it (a late successful timestamp counted, stated `late`; test "R2: a timestamp or co-archive obtained late"). The loss is one hop later, in case-authoring: `#notCoAttested` (case-authoring/index.mjs:1679-1692) builds the pre-flight's `not_co_attested` rows as `{capture, by, findings}` only, dropping the facts the capture rows (`disclosureBlocks` `captures`) carry, so screens-publish (ceremony.mjs:200-208) has nothing to draw but its fixed "no trusted time stamp, no outside copy". Nothing is wrong in capture or attestation.
Built (case-disclosures): `captureFacts` now also answers `timestamp_late` (the timestamp is one `reattest` made) and `late_words` (null, or the key `case-disclosures.index.late_proves`, "late: proves the bytes existed by {at}, not at capture"); `missing` ([timestamp, co_archive] still absent) and `timestamp_at` were already there. The same two fields ride on the gate's `CO_ATTESTATION_UNACKNOWLEDGED` entries and on every `disclosureBlocks` capture row. Test "R2 (C40)" (seen failing first): after a late timestamp the facts show `timestamp_at` (late), `timestamp_late: true`, `missing: ["co_archive"]`, `late_words`; the gate entry and the capture row carry the same; controls: no attempt misses both and is not late; a failed late attempt counts nothing; a timestamp made at capture is not late.
FOR BOB (case-authoring is not mine, P9): `#notCoAttested` should add `timestamp_at`, `co_archive`, `missing`, `late`, `timestamp_late`, `late_words` from the capture row `c` (they are already on it) to each `not_co_attested` row; screens-publish then draws `late_words` and the `missing` proof. Without that, the page cannot say it. Stand-in: `case-disclosures.index.late_proves` is a plain `localize` default until the design stream writes the row (no new row requested beyond that key).
Proposed R2 amendment (BOB writes requirements): in "One capture's facts" add: "`timestamp_late` is true when the timestamp is one a late attempt made, and `late_words` then states 'late: proves the bytes existed by <at>, not at capture' (else null); `missing` names which of timestamp and co_archive is still absent. The gate's `CO_ATTESTATION_UNACKNOWLEDGED` entries and the disclosure capture rows carry the same."
Ran: case-disclosures 104 pass, 0 fail; case-authoring 214 pass; case-account 48 pass. checks/run.mjs: architecture 0 failures, words 0 failures, ownership 0 failures (3 files); format 1 failure (rulings.md:4346 K4349, not mine) and coverage failures all in other modules (case-authoring R83 etc., not mine); setup-words --check: stale-rows note only, naming my new localize id (expected).
Size (session_018K9QjDh8UDnKT5iYTG88A5): test runs 5, module lines 2417

## J6 · COMPLETE

COMPLETE: fix round 4, case-disclosures, cause C47 (writes `title`), requirement R7 (K4438).

(1) Root cause, certain: `materials.mjs` `materialRows` wrote `{ref, kind, sha, text_sha, origin, archived_copy, included, rests_under, obscured}` and no title, so the signed row could not name the document. Now each row carries `title` after `rests_under`: for a document, the title its record states (`bundles.title` of the bundle the capture is registered under, record-core R37's stated read contract: the title acquisition R98 read from the capture and promotion filed), trimmed; `null` for an observation (not asked), for a blank or missing title, and for an unreadable one (R18: states less). The address is never taken for it. Nothing about a person is added (R26). `disclosureBlocks` hands `materialRows` a `title(m)` reader.
STATED READING for BOB: "the capture's own title" is read from the document's bundle (the only place the record keeps it; `captured_locators` and `register` hold none). A bundle that registers several captures answers one title for all of them.
(2) Missed because: the rows were only ever compared against hand-written expected rows with no title field; no test followed a chain to the name a signed row carries. Test-gap fix: the new R7 test builds documents through the fixture's real promote (title stated in the document), chains them through a real finding, and reads the rows `disclosureBlocks` writes; the three existing row expectations (carries, documents, photos) and the unit test now state `title`.
(3) Red first: "R7 (fix round 4, C47; K4438): each materials: row carries `title` ..." failed before the change (actual `undefined` for all four rows; expected the FAQ and Capture B titles and two nulls), green after (105 pass, 0 fail). Walker's case: titles "Freedom of Information Act: frequently asked questions" and "Capture B" (not the address https://example.org/<id>, asserted unequal). Controls: an observation's row `title: null`; a document with no title `null`; blank words `null`. The chain was built by the fixture's real ops (promote, register, receipt, finding), not CASE-2026-4783 itself.
(4) N (pure code). R-OLD: new cases only; nothing rewrites a signed case, and the writer (case-grammar) reads a row without `title` as before.

UNTIL case-grammar R12 (`title`) merges: its writer/reader drops the field, so the case document's bytes are unchanged and the round-trip asserts (carries, documents, photos) compare every field but `title` through `fixture.sameRowsButTitle` and check `title` equal wherever the reader returns it. When case-grammar merges, that helper needs no change; the reader's `title` is then checked against the rows. A direct test of the written block with `title` waits on case-grammar's job.

Ran: case-disclosures 105 pass, 0 fail. Users: case-authoring 222/0, case-account 48/0, case-inputs 71/0, review 86/0, case-check 34/0 (impact.mjs lists 47 modules through the import closure; these are the ones that call the service). `checks/format` 0 failures; `architecture case-disclosures` 0; `coverage case-disclosures` 33 of 33; `words case-disclosures` 0 failures; `ownership case-disclosures origin/tranche/T51` 0 failures (7 files, all mine). setup-words `--check`: stale-rows note names citation's row, not mine.
Found elsewhere: none.
Size (session_01NhpmPg6Tvjeaftfvxn46LM): test runs 9, module lines 2427

## J7 · COMPLETE

COMPLETE: CHANGE B6 done (case-grammar R12 merged: tranche/T51 merged into my branch).
Applied: the three row round-trip tests (R6/R7 materials, R7 photo, R7 member document) now compare `materialsOf(fm).materials` to the written rows whole, `title` included; the tolerant helper `sameRowsButTitle` is removed. New direct test, in the R7 title test: `materialBlockLines` writes both titles into the case document's lines and `materialsOf` reads the rows back equal, `title` included (null titles too). Red first: the same test run with the pre-merge `case-grammar/materials.mjs` restored fails (file fails, 0 pass); green with the merged one. The restore was undone; no case-grammar file is changed.
Ran: case-disclosures 105 pass, 0 fail. Users: case-authoring 225/0, case-account 48/0, case-inputs 71/0, review 86/0, case-check 34/0. format, architecture, coverage 33 of 33, words, ownership (7 files): 0 failures.
Size (session_01NhpmPg6Tvjeaftfvxn46LM): test runs 15, module lines 2427

## Fix round 6 · G47 (CASE-DISCLOSURES #17, session_01JCHNeQistwMeSv51kQxgRA, START B7)

**Providers' state (as of this work).** G47's owners merge in `modules.json` order: CASE-GRAMMAR #20, PUBLICATION #36, CASE-CHECKER #16, CASE-DISCLOSURES #17 (this job), CASE-INPUTS #8, CASE-AUTHORING #41. None of the others was merged on `tranche/T51` when I merged it (92bcf1c38b). So `case-grammar` does not yet write or read the optional `sha` of an attestation row; the front-matter rows therefore carry it only once it merges (seam red by name, below).

**What changed.**
- `bio-plane/src/case-disclosures/materials.mjs` `materialRows` (:75-111): counts the `ref`s of its `materials` argument over all the materials of the call and sets `sha` (the material's) on each of that material's attestations (member, timestamp, co-archive, project, group) only where its `ref` occurs on two or more materials; a `ref` that occurs once adds no key. The docstring says so.
- `bio-plane/src/case-disclosures/document.mjs` `carriesBodyLines` (:123-137): prints under a row `att.filter((a) => (a.sha ? a.sha === m.sha : a.ref === m.ref))`. A comment above states the rule. No folding of lines by text.
- Tests: `test/m/case-disclosures/fixture.mjs` gains `w.captures(id, count)` (one bundle registering `count` captures of one source, each registered at its own instant); new `test/m/case-disclosures/g47-body.test.mjs`, 4 tests, all built by the real `materialRows` through `disclosureBlocks` over real captures (legs naming a content row over each capture), no hand-made array.

**Failing-first, red then green.**
1. 501 captures of one `ref` (R7, R10): red today (seen): every attestation of the ref lacks `sha` (and the body is 15.6 MB-class by the old join); green: all 1,002 attestations carry their own capture's `sha`, each row prints exactly its two lines (its own registration time, no other capture's), the body is linear in the rows.
2. Two captures of one source (R7, R10): red (seen): no `sha`; green: each row prints only its own project and group lines.
3. `materialRows` sets `sha` only on refs occurring twice or more, counted over all materials of the call (two captures of one source plus a third source in one call; and a bare call): red (seen), green.
4. Control (K4671, K4672): materials of three sources: no attestation states `sha`, and each row prints the lines of its `ref` as before: green before and after (the control); the existing byte pins in `seam.test.mjs` (hashes of `carriesBodyLines` over fixed rows) pass unchanged.

**Measures BOB asked for.** The body for 501 captures of one source is **about 230 KB** (232,527 B in the test, 230,022 B in the measure below; about 460 B a row: the long row sentence plus two attestation lines), linear in the rows. The START's "under 100 KB" does not hold for the body (its 100 KB figure was an estimate), and I did not weaken the claim silently: the test asserts the true property (body ≤ rows × one row's bytes) and a loose 300 KB ceiling. The 15,624,248 B of repeated attestation lines are gone (each row prints its two). Measured at 501 captures of one source (real `disclosureBlocks`): the body section 230,022 B; `case-grammar`'s `materials:`/`material_attestations:` blocks about 164 KB before `sha`, and `sha` adds one 64-character field to each of the 1,002 attestation rows (about 75 KB more, written once `case-grammar` merges). The document's total is the START's 1,208,774 B (which already holds this body once, not 251,000 times) plus about 75 KB: about 1.28 MB, under the 1.5 MiB bound PUBLICATION #36 sets, by a margin of about 1.2x; BOB weighs that margin, not this job (I measured only this module's two sections, not the whole document).

**Seam tests still red by name.** The front matter's `material_attestations:` rows carry `sha` only once `case-grammar` merges `MATERIAL_ATTESTATION_FIELDS`' optional `sha` and `materialAttestationLines` writes it (CASE-GRAMMAR #20); `materialRows` already hands it on. Nothing in this module's suite is red waiting on it; case-authoring's through-the-door test (its `document.test.mjs`, R17) waits on case-grammar, publication, case-checker and this job.

**No pinned old lines.** I searched the product source and tests for the printed line (`Attested:` / `case-disclosures.document.attested_by`): its readers are `case-authoring` (index, tests), `case-checker/program.mjs` (generated) and the words rows. No test of case-checker or case-catalogue pins the repeated lines; every test of the users I ran passes (below).

**Census ops.** None of this module's: it holds no op and no accepted key (R23); none changes.

**Stale generated artifact (found, not mine to write):** `bio-plane/src/case-checker/program.mjs` bundles `case-disclosures` through `case-checker`'s uses (it carries the `Attested:` sentence), so my change stales it. `case-checker` R13 and R25 are red both before and after my change (inherited, as the START says: BOB regenerates at the round end).

**Deferred / found elsewhere.** Nothing deferred. Nothing found in another module beyond the above and the bound's margin.

**Requirement line proposed (BOB writes it): R7, appended.** "(G47; K4669, K4671, K4672) Where the same `ref` occurs on two or more of the materials handed to `materialRows` (captures of one source), each attestation of such a material states its capture's `sha`, and the case document's body prints under a material's row only the attestations that state its `sha`, else those of its `ref`, so a capture's row never shows another capture's timestamp, archive or register line. With one material to a `ref` no attestation states `sha` and the document is byte for byte what it was. Tests: 501 captures of one source print two attestation lines a row, each its own; control: three sources print as before." R10 needs no change (its levels are unchanged; `sha` only joins the row).

**Tests and checks run** (all from `bio-plane/` under `node --import ./test/platform-sqlite.mjs --test --test-force-exit`, one suite at a time):
- `test/m/case-disclosures/`: tests 113, pass 113, fail 0 (the 4 new included).
- Users: case-authoring 241/241, case-inputs 71/71, case-account 48/48, case-check 34/34, case-tensions 24/24, case-catalogue 16/16 pass; case-checker 95: 93 pass, 2 fail = R13 and R25, the same two with this module's source at its previous commit.
- `checks/run.mjs`: format 0 failures, architecture 0, coverage 0 (34 of 34 ids named), channels 0, words 0 failures (inline 0, plain 0, testcopy 0, missingkey 0); my diff adds no string literal to the words count.
- `checks/ownership.mjs case-disclosures tranche/T51 job/T51/case-disclosures`: 0 failures.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: affects 47 of 176 modules (853 of 2,412 test files, through the module graph); I ran the module's direct users above, not all 853.

Size (session_01JCHNeQistwMeSv51kQxgRA): test runs 14, module lines 2447
