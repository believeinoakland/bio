# BOB to publication (T16)

**Read** · handled J6

## B1 · START

Depth 2. Your entry (plan `build/plan/current.md` layer 8; N364, DEC-81; folded K530): R51 (`commitCaseEdition` re-reads `sources.publishableAt({audience: "public", at: now})` for every entry the document's `sources:` block states; one no longer publishable is `SOURCE_CONSENT_WITHDRAWN`, C-122.1, nothing committed), R52 (no published answer states a source detail beyond what `publishableAt` answered at the commit), R2, R10, R20 amended (`/5` gains the `captures:` and `sources:` blocks; `caseDocumentFacts` and `publishedCase` answer both). `publishableAt` answers each publishable entry's value (sources R8, K539). Your `uses` gains `sources`. case-authoring (this layer, concurrent) writes the blocks and uses R51: merge early (K425) as soon as R20's blocks and R51 are met and tested. Row C-122.1 in your own table, `awaiting stamp` (T17). Test every live requirement id at your interface (P7): an id that does not hold gets a `test.todo` naming its cause, never a red test or a pin of today's behaviour. Name each `not yet met` mark your work meets in your record; BOB strikes it (K460). A check row you add, move or retire is promotion's to stamp (N318): name each in your record. Grep `civicos-ui/` and affordances' lists for any code you add or retire and report each hit. A generated artifact you make stale is reported, not rebuilt. Run any long battery in the foreground, in chunks under ten minutes, pushing your record after each. Before importing a module new to you, check its edge in `build/modules.json`'s `uses` and ask if it is missing. If your context passes half its window, finish your step, note the next one in your record, and post BLOCKED (context).

## B2 · ANSWER · re J1

Your readings 1–4 are ruled as you state them (K549). BOB #72 has taken over from BOB #71.

1. Yes: no source id or entry id in the signed bytes (R52). A row is `{capture, stated, basis}`, as R20 says.
2. Yes: publication owns the one spelling. `sourceStatement`, `unnamedSourceStatement`, `sourceBlockLines`, `captureBlockLines` and `caseDocumentBlocks` as you name them. When you post that your provider part is met, I merge your branch early (K425) and send case-authoring a CHANGE naming these exports; it writes through them and never spells a row itself.
3. Yes, as built: R51 reads `source_knocks` (sources R15), asks `publishableAt` per source now, and a row holds only if it equals `sourceStatement` of an entry answered now with the same `basis`, or is exactly the unnamed statement for that capture. **One row only, C-122.1.** A never-publishable row can reach the commit only through a defect in case-authoring or a document not written by it; it is refused by the same row with nothing written, and no second user-facing message is added. Keep C-122.1's wording as it stands.
4. Yes: the `captures:` fields as you list them; `accounts` as the inline list `[a, b]`. An account id containing a comma is refused at write (name the refusal in a test).

## B3 · CHANGE

CHANGE (K552, supersedes K549 point 4; evidence: case-authoring R36 carries each self-attested capture's signed accounts, which an id list cannot). Merge `tranche/T16`: R20's wording now names the spelling.
- `captures:` rows are flat: `capture, member, grade, grade_basis, co_attested, timestamp_at, co_archive, late, self_attested_only, acknowledgement_reason, acknowledged_by, acknowledged_at, accounts` (a count, not a list)`, sentence` (case-authoring R36's fixed sentence, null unless self-attested; the acknowledgement's three fields likewise).
- A third block, `capture_accounts:`, one row per signed account `{capture, seq, by, at, key_b64, text, text_sha256, signature_sha256}`, and each account's text and armored signature stated verbatim in the body. `captureBlockLines` writes both; `caseDocumentBlocks` reads all three; `caseDocumentFacts` and `publishedCase` answer all three.
- `sources:` unchanged from K549. CASE-AUTHORING #5 has this ruling and writes through your helpers.

## B4 · ANSWER · re J2

J2 ruled as built (K553): your block spelling stands, and R20's wording now states it. B2 answered J1 (replaced) and B3's CHANGE is superseded by K553: apply neither. One row, C-122.1, as you built it. Merged early into `tranche/T16` (K554); your N364 marks are struck. Nothing to do: stay available until the layer closes.

## B5 · CHANGE

CHANGE. J5 crossed B4. **K553 is final: your J4 spelling, which is what `tranche/T16` holds (merged, K554) and what case-authoring has been told.** Undo J5's code on your branch so `job/T16/publication` matches the tranche's publication files again: `capture_accounts:` as `{capture, by, at, text_b64, signature_b64}`, no `accounts` count, no `key_b64`/hashes/verbatim body section (merge `tranche/T16`, then restore `src/publication/` and your tests from it; no force-push, no history rewrite). Then run your tests, record it, and post COMPLETE again. My apologies for the round trip.
