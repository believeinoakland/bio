# publication (T15)

**Status** · session_016tDen5uWKPk2idprPvDn7o · depth 2 · WORKING · handled B3

## J1 · QUESTION

Best readings, which I am building on now (none stops me):

1. **The `/5` tension section (R10 reads what case-authoring R14/R31 writes).** I adopt CASE-AUTHORING #4's J1 item 1 shape exactly as the grammar R10 reads: `case_tensions:` rows (`candidate`, `finding`, `state`, `kind`, `unseen_other_side`, `depth`, `acknowledged_by`, `acknowledged_at`, `words`, `explanation`, `a_*`/`b_*` for a seen pair, `side_*` + `highlight` for a highlighted one) and `case_tension_sentences:` rows (`target`, `candidate`, `template`, `sentence`), plus `tensions_disclosed`, `tensions_highlighted`, `tensions_depth_stated`. Publication exports the one reader, `caseTensionsOf(docText)`, beside R20's predicates, so no module parses the section a second way. R10's `state` words map from the row: `open` → "open", `explained_not_shown` → "explained, not yet shown", `taken_up` → "taken up as a question", `resolved` + `kind: irreconcilable` → "held irreconcilable, to be reopened by new evidence". For a highlighted row R10 answers only the seen side, `unseen_other_side: true` and the fixed sentence, whatever else the bytes hold (DEC-85 enforced at the read too).
2. **R20's grammar moves into publication** (`src/publication/checks.mjs`): it can no longer be re-exported from the catalogue, since `legacy-checks` is first in the order and may not import it. The catalogue keeps its own `/4` copy for its own `checkCaseDocument`, which `gate.mjs` uses only as a fallback when no promotion instance registers ratification's; that fallback would refuse a `/5` document C-41.1. I report it, it is legacy-checks'.
3. **R50.** "A side the project's owners may not see": `unresolvedRecordOn` is asked once per owner of the case's owning project (`membership.projectOwners`, as `member:<id>`); a candidate unseen by any owner is answered as unseen (its unseen answer). A case whose project has no owner is asked with a viewer that sees nothing (fail closed: every side withheld). `limit` counts cases. "Did not disclose" compares candidate ids with the edition's `case_tensions`; a disclosed candidate `unresolvedRecordOn` no longer answers is `resolved_since: true` (its current kind is not stated: that read answers only unresolved ones). A member whose read fails or is truncated is stated `undetermined`/`truncated` on its entry, never dropped. An older (`/4`) edition disclosed nothing, so all its candidates are answered.
4. No new op: R50 is in-process (for `queue`); R10 rides `op=publishedcase` as it is.

## Completion

**Entries applied** (N345; K481, K498, K499):
- **R20** `CASE_DOCUMENT_FORMAT` is `bio-case-document/5`; `/4`–`/1` accepted as written (`CASE_DOCUMENT_FORMAT_V4` added); `caseDocumentStatesMemberBlocks`, `caseDocumentRequiresDisclosures` and `caseDocumentRequiresV4Disclosures` hold for `/5` as for `/4`; `caseDocumentRequiresTensionSection` for `/5` only. Pure and never throwing (a throwing getter included). The grammar is now defined in `src/publication/checks.mjs`, no longer re-exported from the catalogue (K498 (2)).
- **R10** `publishedCase` answers `tensions` (read from the signed document, never live), `highlighted`, `tensions_detail`, `tensions_unread` (K499), and on each finding its attributed sentences (`tensions`). States in R10's four words. A highlighted entry answers only its seen side, `unseen_other_side: true` and case-authoring R31's fixed sentence, whatever else the bytes hold (DEC-85 held at the read). A document before `/5` answers `tensions: null` with its sentence; a `/5` document with no readable section is undetermined, never `[]`. The one reader is `caseTensionsOf(docText)` (`src/publication/tensions.mjs`), exported for every module.
- **R50** `caseTensions({project?, after, limit})`, in-process for `queue`: per case at its latest ratified edition, `unresolvedRecordOn` asked for each member at its pin, once per owner of the owning project; undisclosed candidates answered, disclosed ones no longer answered `resolved_since: true` (only when every read was whole); unseen by any owner answered unseen; no owner fails closed (viewer that sees nothing); failed/cut reads stated in `unread`. Pages by case (1–200, `CASE_TENSIONS_MAX`), cursor. Writes nothing, never throws.
- `uses` contradiction: imported `contradictionOf` (edge declared in `modules.json`); reached lazily, a test may pass its own.

**`not yet met` marks my work meets** (for BOB to strike, K460): R10 (N345), R20 (N345), R50 (N345).

**Rows added, moved or retired:** none (no check row; promotion stamps nothing of mine). **New ops:** none; R50 is in-process, R10 rides `op=publishedcase` (no stamp change). **`civicos-ui/` and affordances' lists:** no hit for anything added or retired (one unrelated word "highlighted" in `app.html`:13465).

**Found in other modules (reported in J2):**
1. **ratification** `test/m/ratification/checks.test.mjs`:133 (R8, N211) is red: the catalogue's copy of `checkCaseDocument` still names `/4` in C-41.1's message while ratification's reads `/5`. It is the gap K498 routed to T16 as N361 (legacy-checks' copy in `bio-checks.mjs`:8128–8156); nothing of publication's to change.
2. **case-authoring** `test/m/case-authoring/document.test.mjs` R14 asserts `/4` and is red until CASE-AUTHORING #4 lands its `/5` (as its J1 expects). Until then `op=publish` writes `/5` documents without the tension section; publication reads such a document as undetermined (`TENSIONS_UNREADABLE_SENTENCE`), never as "none disclosed".
3. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale (plane source changed); not rebuilt (§14).
4. **legacy-tests:** suites reading `bio-case-document/4` as current (e.g. `test/rec219-case-document-v4.test.mjs`, `test/d470-catalog-census.test.mjs`, `test/casesign.test.mjs`) are N345's re-anchors, already in the plan.
5. `store.mjs`:132 imports the catalogue's `CASE_DOCUMENT_FORMAT` and does not use it (legacy-store; a removal when next touched).

**Deferred:** none. R30, R32 stay `test.todo` with their causes (unchanged).

**Tests and checks:**
- `node --test test/m/publication/`: 100 pass, 0 fail, 2 todo (R30, R32).
- Users of publication (P11): review 30/0, conformance 36/0, filings 35/0, monitoring 65/0 (6 todo), affordances 76/0, queue 69/0, control-plane 52/0; ratification 73/1 and case-authoring 38/1, the two failures above.
- `format`: 0 failures. `architecture publication`: 20 files, 66 imports, 0 failures. `coverage publication`: 50 of 50 live ids, 0 failures. `ownership publication tranche/T15`: 7 files, legacy 0 added/0 removed, 0 failures.
- Note: R50's tests use a stand-in for contradiction R29 answering exactly its shapes (minting a real duty candidate needs a measured AI run); R10's use the section written as case-authoring's J1 shape.

Size (session_016tDen5uWKPk2idprPvDn7o): test runs 17, module lines 5945

## J2 · REPORT

Found in other modules (details in my record's Completion): (1) ratification test/m/ratification/checks.test.mjs:133 (R8, N211) is red: the catalogue's /4 copy of checkCaseDocument now differs from ratification's /5 in C-41.1's message; this is K498's N361 gap, nothing of publication's. (2) case-authoring R14 test asserts /4 and is red until CASE-AUTHORING #4 lands /5; meanwhile op=publish writes /5 without the section, which publication reads as undetermined, never as none. (3) bio-plane/dist/bio-plane.bundled.mjs is stale (not rebuilt). (4) legacy-tests: suites reading bio-case-document/4 as current are N345's planned re-anchors. (5) store.mjs:132 imports the catalogue's CASE_DOCUMENT_FORMAT unused (legacy-store).
