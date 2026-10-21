# case-disclosures (T51)

**Status** · session_01QauuYoWqCoXNu8JWm2WmuR · depth 2 · COMPLETE · handled B2

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
