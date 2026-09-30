# publication (T16)

**Status** · session_019hjZa97BwV8fCGD6XMVLQD · depth 2 · WORKING · handled B1

## J1 · QUESTION

R20's `sources:` row is `{capture, stated, basis}`, and R51 must re-read `publishableAt` for "every entry the block states". My best reading, which I am building on now (case-authoring writes to it, so answer early if it is wrong):

1. **No source id or entry id in the signed bytes.** Either would let a reader link two captures (or two cases) to one source, which is a detail `publishableAt` never answered (R52). So a row carries only `capture`, `stated` and `basis`, as R20 says.
2. **`stated` has one spelling, mine.** publication exports `sourceStatement(entry)` (the text one `publishableAt` entry is stated as: `<kind>[ <attribute>]: <value>`, `known to the group, not recorded` for a value-less entry, a `hostile` entry's claim sentence) and `unnamedSourceStatement({capture, received})` (case-authoring R37's "an unnamed source" with the receipt's digest and time, `basis: null`), plus `sourceBlockLines(rows)` / `captureBlockLines(rows)` so the bytes are written one way, and `caseDocumentBlocks(text)` as the one reader (R2, R10).
3. **R51 at the commit:** for each row, the sources behind its `capture` are read from `sources`' `source_knocks` read contract (sources R15), `publishableAt({source, audience: "public", at: now})` is asked of each, and the row holds only if its `stated` equals `sourceStatement` of an entry answered now with the same `basis`, or it is exactly the unnamed statement for that capture. Any other row is `SOURCE_CONSENT_WITHDRAWN` (C-122.1) and nothing is written. That also refuses a row that was never publishable (R52's guard at the commit), under C-122.1's sentence, whose "withdrew consent" is then not strictly true. Is one row enough, or do you want a second row (e.g. C-122.2 "states a source detail that was never publishable") for that case? I am building C-122.1 only unless told otherwise.
4. `captures:` rows: `capture, member, grade, grade_basis, co_attested, timestamp_at, co_archive, late, self_attested_only, acknowledgement` (optional), `accounts` as an inline list `[a, b]` (the grammar's only list form, so an account id may not contain a comma).
