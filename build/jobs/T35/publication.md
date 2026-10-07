# publication (T35)

**Status** · session_01Vx8XnooM8HK7frXGpL3x5e · depth 2 · COMPLETE · handled B3


## Completion

**Entries applied (T35-54).**
- N597 (R61, K1643): the case-tensions delegates (`caseTensions`, `observationsNamingAuthor`, `attributionInForce`, `attributionFacts`, `attributionStatedFor`, `dischargeCaseFlags`, `flagCasesOnRevision`, `caseFlags`, `attributionStatements`, `attributeObservation`) and the re-export of `ATTRIBUTION_ACT_CHECKS`, `CASE_FLAGS_LIMIT`, `ATTRIBUTION_REASON_MAX`, `CASE_TENSIONS_MAX` are gone; `caseRelation` alone stays (affordances, T35-66); the case-grammar re-exports are unchanged. Merged after ratification and review (B3, K2003).
- N649 (R72, K2002): at a case edition's commit, after every refusal, the criteria (one row per distinct standard, portion and body a member's leg targets at its pin; member then leg order) are read from `standards.standardRead` and `bindsAt` as the signer (`admin` for the founder) on the commit's UTC day, the body's name from `entities.readEntity`, and frozen as JSON on a new nullable `published_cases.criteria` column (exempt with the row). Each row carries its label ("Standard · binds …" / "Benchmark · not binding on …") and access words; passages are a leg's `content_id` among the standard's text, else its `requires`, quoted as `requires_quoted` quotes them. A standard not answered is `stated: "not held"`, every other field null; it never refuses. R53 answers `criteria` (null with `criteria_detail` for an edition before T35). `modules.json` uses (standards, entities) are BOB's, from the START.
- N687 (R33): row C-122.5 `SCHEDULED_CHECK_UNAVAILABLE` in the C-122 family (`checks.mjs`), raised in `schedule.mjs` `unchecked`; a stopped edition's reasons carry its `check`.
- N681 (R74): `waitingEditionOf(caseId)`, viewer-free, never throws.
- F1 (R73): `door.mjs` reads the review grant's secret from the request body's `secret` (a helper `body`: an object, function or Promise); an address `secret` is still read when the body has none, and the answer (admitted or refused) carries `deprecated: "CREDENTIAL_IN_ADDRESS"`. Only the digest crosses to the store, as before.
- A flaw fixed in my own work during the job: a standard id is a slugged bundle id (`STD-2026-0001-policy`), so R72 matches `BUNDLE_ID_RE` with the `STD-` prefix, not the bare id pattern.

**Deferred.** None.

**Found in other modules (REPORT).**
1. `case-authoring` tests read through dropped delegates: `test/m/case-authoring/members.test.mjs`:177 (`w.publication.caseFlags`) and `carries.test.mjs`:104 (`w.publication.attributeObservation`). Red from publication's merge until case-authoring re-points them to case-tensions (one line each; T35-59).
2. `control-plane` `test/m/control-plane/converts.test.mjs`:136 (R30, R2 reviewcopy convert) pins the address form's 404 answer byte for byte; under R73 it now carries `deprecated: "CREDENTIAL_IN_ADDRESS"`. Red from publication's merge until T35-72 (send the secret in the body, or expect the deprecation).
3. The plane's door (`bio-plane/src/plane/door.mjs`:30, `plane`'s) must pass the request body to `publicationDoorOp` as `body` (for instance `body: () => req.clone().json()`) for R73's body form to work through the Worker; until then the address form works with the deprecation (T35-73 or control-plane, yours to place).
4. `public-read` serves R72's criteria from R53's state (R72: "public-read reads them there"); no T35 entry of public-read shows them yet.
5. Generated artifacts: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) is stale from this change, as from any plane source change (yours at L8's close). The new row C-122.5 awaits stamp (accepted red 2).

**Tests and checks.**
- publication `bio-plane/test/m/publication/`: 118 pass, 0 fail. No layer tests are named in `build/manifest.md`.
- Users of publication (a provided service changed): docket 59/0, public-read 131/0, project-stage 23/0, network-notices 72/0, case-disclosures 59/0, conformance 66/0, filings 67/0, monitoring 121/0, queue-producers 80/0, ratification 213/0, review 38/0, case-tensions 23/0, `system/migrate-released` 1/0; case-authoring 143/2 (report 1); control-plane 178/4: three equal on `tranche/T35` without this change (inherited reds 19, 26, 29), one mine (report 2); scheduler 94/1, affordances 201/2, op-declarations 81/3, plane 107/8: each equal on `tranche/T35` without this change (inherited reds 9, 22, 23, 29, 31).
- `format`: 130 modules, 0 failures. `architecture … publication`: 0 failures. `coverage … publication`: 50 of 50 live ids, 0 failures. `ownership … publication tranche/T35`: 13 files, 0 failures.

Size (session_01Vx8XnooM8HK7frXGpL3x5e): test runs 14, module lines 3716

## J1 · QUESTION

R72's `passages`, and the rows a standard no longer answers. I carry on with my best reading below; the answer decides only these details.

1. **Passages' text.** R72 reads passages "from `standards`", and Uses names `standardRead` (R5) for them. `standardRead` quotes only the `requires` passages (`requires_quoted`, `{content_id, text}`); it answers every other text passage as a content id without its words. A leg on a `STD-` target may name any passage of the standard's text by `content_id` (inquiry-grammar R4, R13).
   **My reading:** a leg's passages are its `content_id` when the standard holds it among its text, else (no `content_id`) the standard's `requires` passages; each quoted with the text `standardRead` answers for it (`requires_quoted`), and `text: null` where `standardRead` quotes none. Quoting every passage would need either a `content` edge (`passageText`, layer 4) or a quoting read in `standards`; both are yours (P17). Which, if either?
2. **The viewer and the date of the reads.** `standardRead` answers nothing without a viewer. **My reading:** the signer as viewer (`member:<attestorMember>`, `admin` when the founder signs), and `bindsAt`'s date the commit's UTC day.
3. **A standard no longer answered** (`stated: "not held"`): every other field null, so I make `label` and `access_words` null too (no "Benchmark" label on a row whose bindingness was never read).
4. **Storage:** a nullable `criteria` column on `published_cases` (JSON; null for an edition committed before T35, `[]` for none), exempt as the row is; R40's column list gains it (wording).

## J2 · QUESTION

Replaces J1 (its four points stand unchanged); adds point 5.

R72's `passages`, and the rows a standard no longer answers. I carry on with my best reading below; the answer decides only these details.

1. **Passages' text.** R72 reads passages "from `standards`", and Uses names `standardRead` (R5) for them. `standardRead` quotes only the `requires` passages (`requires_quoted`, `{content_id, text}`); it answers every other text passage as a content id without its words. A leg on a `STD-` target may name any passage of the standard's text by `content_id` (inquiry-grammar R4, R13).
   **My reading:** a leg's passages are its `content_id` when the standard holds it among its text, else (no `content_id`) the standard's `requires` passages; each quoted with the text `standardRead` answers for it (`requires_quoted`), and `text: null` where `standardRead` quotes none. Quoting every passage would need either a `content` edge (`passageText`, layer 4) or a quoting read in `standards`; both are yours (P17). Which, if either?
2. **The viewer and the date of the reads.** `standardRead` answers nothing without a viewer. **My reading:** the signer as viewer (`member:<attestorMember>`, `admin` when the founder signs), and `bindsAt`'s date the commit's UTC day.
3. **A standard no longer answered** (`stated: "not held"`): every other field null, so I make `label` and `access_words` null too (no "Benchmark" label on a row whose bindingness was never read).
4. **Storage:** a nullable `criteria` column on `published_cases` (JSON; null for an edition committed before T35, `[]` for none), exempt as the row is; R40's column list gains it (wording).
5. **Two members, one (standard, portion), two bodies.** R72 keys a row on `(standard, portion)` and takes `body` from "the member finding". When two members target the same portion with different `subject_entity`, one row cannot carry both bindingness answers (one may bind, the other be a benchmark, K1723). **My reading:** a row per distinct `(standard, portion, body)`, which is R72's `(standard, portion)` whenever the members agree; R72's wording would gain "and body".

## J3 · COMPLETE

T35-54 applied: case-tensions delegates and re-export dropped (caseRelation kept); R72 criteria frozen on published_cases.criteria at the commit, as K2002 ruled; R73 secret from the body, address form deprecated (CREDENTIAL_IN_ADDRESS); R74 waitingEditionOf; C-122.5. publication 118/0; format, architecture, coverage 50/50, ownership 13 files: 0 failures; 3,716 lines. Users run: new reds from this change, each in another module's test: case-authoring members.test.mjs:177 and carries.test.mjs:104 (dropped delegates, T35-59), control-plane converts.test.mjs:136 (the address form's answer now carries the deprecation, T35-72). Also reported: the plane's door must pass the body to publicationDoorOp; public-read to show R72's criteria; the plane bundle stale. Details in the record's Completion section.
