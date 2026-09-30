# publication (T16)

**Status** · session_019hjZa97BwV8fCGD6XMVLQD · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R20's `sources:` row is `{capture, stated, basis}`, and R51 must re-read `publishableAt` for "every entry the block states". My best reading, which I am building on now (case-authoring writes to it, so answer early if it is wrong):

1. **No source id or entry id in the signed bytes.** Either would let a reader link two captures (or two cases) to one source, which is a detail `publishableAt` never answered (R52). So a row carries only `capture`, `stated` and `basis`, as R20 says.
2. **`stated` has one spelling, mine.** publication exports `sourceStatement(entry)` (the text one `publishableAt` entry is stated as: `<kind>[ <attribute>]: <value>`, `known to the group, not recorded` for a value-less entry, a `hostile` entry's claim sentence) and `unnamedSourceStatement({capture, received})` (case-authoring R37's "an unnamed source" with the receipt's digest and time, `basis: null`), plus `sourceBlockLines(rows)` / `captureBlockLines(rows)` so the bytes are written one way, and `caseDocumentBlocks(text)` as the one reader (R2, R10).
3. **R51 at the commit:** for each row, the sources behind its `capture` are read from `sources`' `source_knocks` read contract (sources R15), `publishableAt({source, audience: "public", at: now})` is asked of each, and the row holds only if its `stated` equals `sourceStatement` of an entry answered now with the same `basis`, or it is exactly the unnamed statement for that capture. Any other row is `SOURCE_CONSENT_WITHDRAWN` (C-122.1) and nothing is written. That also refuses a row that was never publishable (R52's guard at the commit), under C-122.1's sentence, whose "withdrew consent" is then not strictly true. Is one row enough, or do you want a second row (e.g. C-122.2 "states a source detail that was never publishable") for that case? I am building C-122.1 only unless told otherwise.
4. `captures:` rows: `capture, member, grade, grade_basis, co_attested, timestamp_at, co_archive, late, self_attested_only, acknowledgement` (optional), `accounts` as an inline list `[a, b]` (the grammar's only list form, so an account id may not contain a comma).

## J2 · QUESTION

Replaces J1 (items 1–3 unchanged; item 4 revised, as built). The grammar is in `src/publication/blocks.mjs`, one file, so a different ruling is cheap to apply.

1–3. As J1: `sources:` rows carry only `capture`, `stated`, `basis` (no source or entry id, R52); `stated` is spelled by `sourceStatement(entry)`, the empty case by `unnamedSourceStatement({capture, received})` with `basis: null`; R51 re-derives the sources behind each capture (sources' `source_knocks`, its R15), asks `publishableAt({source, audience: "public", at: <the commit's instant>})` and refuses any row that is not an answered entry's spelling with the same basis, or the capture's unnamed statement: `SOURCE_CONSENT_WITHDRAWN` (C-122.1), nothing written. That also refuses a row never publishable (R52's guard) under C-122.1's sentence; one row unless you want a second.
4. **Revised.** An account is a signed text, so it cannot be an inline list. `captures:` rows are `capture, member, grade, grade_basis, co_attested, timestamp_at, co_archive, late, self_attested_only`; an acknowledged capture adds `acknowledgement_reason, acknowledged_by, acknowledged_at, sentence` (case-authoring R36's fixed sentence), which the reader answers as `acknowledgement: {reason, acknowledged_by, at, sentence}`. The accounts are their own block, `capture_accounts:` rows `capture, by, at, text_b64, signature_b64` (base64 of the exact bytes, so a stranger can still verify the signature; the flat grammar folds line breaks), which the reader answers back on each capture as `accounts: [{by, at, text, signature}]`. case-authoring writes both with `captureBlockLines(rows)` / `sourceBlockLines(rows)`.

## Completion

**Entries applied** (N364; DEC-81 items 1 and 3, DEC-78 item 5; K497, K509, K530, K539), as ruled in B2 (K549) and changed by B3 (K552, superseding K549 point 4):
- **R20** `/5` states three blocks. The grammar is one file, `src/publication/blocks.mjs`: `captures:` flat rows (`capture, member, grade, grade_basis, co_attested, timestamp_at, co_archive, late, self_attested_only, acknowledgement_reason, acknowledged_by, acknowledged_at, accounts` (a count)`, sentence`; the acknowledgement's three fields and `sentence` null unless self-attested); `capture_accounts:` rows (`capture, seq, by, at, key_b64, text` (one line)`, text_sha256, signature_sha256`), each account's text and armored signature also verbatim in the body under `## Capture Accounts`, each in a fence longer than any backtick run it holds; and `sources:` rows (`capture, stated, basis`, no source or entry id). Writers `captureBlockLines(rows)` (both front-matter blocks), `captureAccountsBodyLines(rows)` (the body section) and `sourceBlockLines(rows)`, for case-authoring R14, R35–R37; the one reader `caseDocumentBlocks(text)` answers `{captures, capture_accounts, sources, detail}`, each account with its verbatim `text` and `signature` and `verbatim: true` only when both hash to the row's `text_sha256` and `signature_sha256` (else the row's one-line text, `signature: null`, `verbatim: false`); before `/5` all null with `BLOCKS_PREDATE_SENTENCE`; a `/5` missing a block: that block null with `BLOCK_UNREADABLE_SENTENCE`; never throws. The one spelling of a stated source detail: `sourceStatement(entry)` and `unnamedSourceStatement({capture, received})`. All exported from `src/publication/index.mjs`.
- **R2** `caseDocumentFacts` answers `captures`, `capture_accounts`, `sources` and `blocks_detail` beside what it answered, under the same fence.
- **R10** `publishedCase` answers `captures`, `capture_accounts`, `sources` and `blocks_detail` from the signed document, never live; null with a sentence for an older document, an unsigned edition or a loose bundle. `op=publishedcase` carries them (the Worker spreads the store's answer).
- **R51** `commitCaseEdition`, after its existing refusals and before any write, re-reads each `sources:` row at the commit's instant: the sources behind the row's capture from `sources`' `source_knocks` read contract (its R15), `publishableAt({source, audience: "public", at})` asked of each; a row holds only as an answered entry's spelling with the same basis, or as the capture's unnamed statement. Any other row: `SOURCE_CONSENT_WITHDRAWN` (C-122.1, its check and translation), naming the captures, nothing written. A retry of a signature already committed answers `existed: true` as before (not re-read: the signed edition stands, DEC-78 item 5(d)). A source that cannot be read fails closed.
- **R52** holds by R51 at the commit (a row never publishable is refused the same way) and by every published read answering the signed bytes only.
- **Row C-122.1** `SOURCE_CONSENT_WITHDRAWN`, new family `CASE_SOURCES_CHECKS` ("a case's sources") in `src/publication/checks.mjs`, its site `commitCaseEdition > is-source-consent-withdrawn` (DEC-49 region), in `rowOf`. `uses` sources: `sourcesOf`, reached lazily (a test passes its own); the edge was already in `modules.json`.

**`not yet met` marks my work meets** (for BOB to strike, K460): R2 (N364), R10 (N364), R20 (N364), R51 (N364), R52 (N364), and the Status line's "N364 … not yet met".

**Rows added, moved or retired** (promotion's to stamp, N318): **added C-122.1** (`SOURCE_CONSENT_WITHDRAWN`, family `CASE_SOURCES_CHECKS`), `awaiting stamp` (T17). None moved or retired.

**`civicos-ui/` and affordances' lists:** no hit for `SOURCE_CONSENT_WITHDRAWN`, `C-122`, `CASE_SOURCES_CHECKS`, `caseDocumentBlocks`, `sourceStatement`, `blocks_detail` or `capture_accounts`. No op added or retired.

**Found in other modules (J3 REPORT):**
1. **case-authoring** writes the blocks with `captureBlockLines`, `captureAccountsBodyLines` and `sourceBlockLines`, and each `sources:` row's `stated` must be `sourceStatement(entry)` of an entry `publishableAt({audience: "public"})` answered, or `unnamedSourceStatement({capture, received})` with `received` the capture's first pulled knock (by `received`, then knock id: sources' `sourceOf` answers it as `source.receipt.received`). Any other spelling is refused at the commit.
2. **legacy-tests** (`civicos-ui/check-refusal-codes.mjs`, the DEC-49 guard): my share of its floors is one family (`CASE_SOURCES_CHECKS`), one row, one governed site and region, one refusal outcome; the guard is already red on the tranche from other jobs' growth (15 failures, all re-pins or others'). `row-census`' `AWAITING_STAMP` gains C-122.1.
3. **ratification** `test/m/ratification/checks.test.mjs`:133 (R8, N211) is red with or without this change (the catalogue's `/4` copy; K500, retired this tranche by ratification).
4. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale (plane source changed); not rebuilt (§14).
5. **sources** R15 (`source_knocks` as a read contract) is still `not yet met: its pin test, N377`; publication now reads it, so its columns `capture_sha`, `source_id`, `received`, `knock_id` are relied on.

**Deferred:** none. R30, R32 stay `test.todo` with their causes (unchanged). One row only, C-122.1 (K549).

**Note:** the code was pushed inside the mail commit `89fe8baf52` ("J2 QUESTION"): `mail post` commits what is staged. Not rewritten (no force-push).

**Tests and checks:**
- `node --test test/m/publication/`: 110 tests, 108 pass, 0 fail, 2 todo (R30, R32), before and after B3. New `sources.test.mjs`: R20 ×2 (K552's grammar, a tampered body copy answered `verbatim: false`), R2, R10, R51 ×3, R52. Negative control: with R51's refusal disabled, three tests fail (both R51 arms that refuse, and R52).
- Users of publication (P11): case-authoring 53/0, review 30/0, conformance 46/0, filings 35/0, monitoring 65/0 (6 todo), affordances 90/0, queue 69/0, control-plane 57/0; ratification 73/1, the pre-existing failure above (same without this change). queue-producers has no tests directory yet.
- `format`: 72 modules, 0 failures. `architecture publication`: 22 files, 76 imports, 0 failures. `coverage publication`: 52 of 52 live ids, 0 failures. `ownership publication tranche/T16`: 7 files, legacy 0 added / 0 removed, 0 failures.

After B3 (merged `tranche/T16`): users re-run with the same results; the four checks 0 failures (22 files, 76 imports; 52 of 52; 7 files, legacy 0/0).

Size (session_019hjZa97BwV8fCGD6XMVLQD): test runs 31, module lines 6251

## J3 · REPORT

Found in other modules (record, Completion): (1) case-authoring: write the /5 blocks with captureBlockLines / sourceBlockLines; each sources: row's stated must be sourceStatement(entry) of an entry publishableAt({audience: public}) answered, or unnamedSourceStatement({capture, received}) with received the capture's first pulled knock; any other spelling is refused at the commit (C-122.1). (2) legacy-tests: the DEC-49 guard's floors move by my one family (CASE_SOURCES_CHECKS), one row, one site/region, one refusal outcome; the guard is already red on the tranche (15 failures, others' growth). row-census AWAITING_STAMP gains C-122.1. (3) ratification checks.test.mjs:133 red with or without this change (K500). (4) bio-plane/dist/bio-plane.bundled.mjs stale, not rebuilt. (5) sources R15 (source_knocks read contract, pin test N377) is now relied on by publication.

## J4 · COMPLETE

R2, R10, R20, R51, R52 and row C-122.1 (awaiting stamp, T17) applied, on J2's reading (replaces J1); ready to merge early for case-authoring (K425). Strike the N364 not-yet-met marks on R2, R10, R20, R51, R52. publication 108 pass / 0 fail / 2 todo; users green except ratification's pre-existing K500 red; four checks 0 failures. Record: build/jobs/T16/publication.md, Completion. J2's questions still open: a ruling other than my reading re-opens it by CHANGE.

## J5 · COMPLETE

B3 (K552) applied on merged tranche/T16: captures: flat (accounts a count, acknowledgement and sentence null unless self-attested), capture_accounts: {capture, seq, by, at, key_b64, text, text_sha256, signature_sha256} with each account's text and armored signature verbatim in the body (## Capture Accounts, captureAccountsBodyLines), sources: as K549; caseDocumentBlocks reads all three, caseDocumentFacts and publishedCase answer all three. B2 (K549): one row C-122.1, as built. Provider part met: ready to merge early (K425); case-authoring's helpers are captureBlockLines, captureAccountsBodyLines, sourceBlockLines, sourceStatement, unnamedSourceStatement, caseDocumentBlocks. Strike N364's not-yet-met marks on R2, R10, R20, R51, R52. publication 108/0/2 todo; users green but ratification's pre-existing K500 red; four checks 0 failures. Record: Completion.
