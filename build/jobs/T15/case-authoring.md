# case-authoring (T15)

**Status** · session_017F7CenwNVr8EttZdzGn7Pc · depth 2 · WORKING · handled B2

## J1 · QUESTION

Best readings, which I am building on now; the first one is shared with PUBLICATION #5 (its R10 reads what my R14/R31 write), so please relay or rule.

1. **The tension section's frontmatter shape** (restricted grammar: arrays of flat objects only). Written after `case_conclusions:`, always present in a `/5` document (empty list when nothing is disclosed):
   - `tensions_disclosed: <n>`, `tensions_highlighted: <n>`, `tensions_depth_stated: "<the one-level sentence>"`
   - `case_tensions:` one entry per disclosed candidate: `candidate`, `finding`, `state` (`open` | `explained_not_shown` | `taken_up` | `resolved`), `kind` (`irreconcilable` or null), `unseen_other_side` (true|false), `depth: 1`, `acknowledged_by`, `acknowledged_at`, `words` (the owner's, quoted, or null), `explanation` (quoted or null); for a fully seen one `a_kind`, `a_text`, `a_source`, `a_date`, `a_doctype`, `a_capture`, and the same `b_…`; for a highlighted one only `side_kind`, `side_text`, `side_source`, `side_date`, `side_doctype`, `side_capture` (the seen side) and `highlight: "<R31's fixed sentence>"`. `a_source`/`side_source` is the source's bundle or inquiry id (the text is `fmSafe`d, printed verbatim in the body).
   - `case_tension_sentences:` one entry per sentence: `target` (the member), `candidate`, `template` (`in_tension` | `explained` | `irreconcilable` | `unseen`), `sentence` (quoted).
   The body gains `## Tensions Disclosed` after `## The Conclusions This Case Records`. The format string stays publication's `CASE_DOCUMENT_FORMAT` (it becomes `/5` when PUBLICATION #5 merges; I merge the tranche then and my `/5` test goes green; until then it is a `test.todo` naming that cause).
2. **Malformed `tensionsDisclosed`** (R31 names no refusal): absent or null is `[]`; a non-array, or an entry that is not an object naming a `candidate` string, is `DISCLOSURE_NOT_STANDING` (C-120.2) naming `ord`; `words` over 2,000 characters or holding a quote, backslash or line break is R3's `BAD_COMPLETENESS` with `field: tensionsDisclosed[i].words` (the grammar has no escapes), asked in R31's step. A candidate listed twice is disclosed once.
3. **What counts as "a read that fails" (C-120.3):** `unresolvedRecordOn` answering `undetermined: true`, `truncated: true`, or a non-zero `undetermined_legs` (a leg whose referent could not be read is a read not made whole).
4. **R31's place:** right after R12 and before R7's derivation (which draws an id), so C-120.1–C-120.3 draw no id.
5. **R32 with no targets** answers an empty list rather than R3's `NO_TARGET` (R32 names only R2's and R4's refusals); duplicates are read once. R1's machine fence is not asked (R32 names only R2's), but R2's owner test needs the `author` stamp.
6. **Op stamps for control-plane:** `op=publishtensions` takes `viewer` and `author` (as `op=publish`). `op=publish` gains `tensionsDisclosed` in the body only.

## J2 · QUESTION

Replaces J1 (items 1, 2, 4, 5, 6 unchanged; item 3 revised, item 7 added).

3. **What counts as "a read that fails" (C-120.3):** `unresolvedRecordOn` answering `undetermined: true` or `truncated: true`, as R31 says, and nothing more. Its extra `undetermined_legs` (a document leg with no content row, so no passage-level referent to look for a conflict on) is NOT a refusal: treating it as one refused every case resting on a whole-document leg (my own R17 fixture). It is stated instead (R26): frontmatter `case_tensions_unread:` (`- target`, `legs`) and a body sentence per member, and the answers carry `tensions_legs_unread` / `legs_unread`.
7. **Frontmatter additions for PUBLICATION #5** beyond J1 item 1: `case_tensions_unread:` as above, between `tensions_depth_stated` and `case_tensions`. The answer of `op=publish` gains `tensions`, `tensions_highlighted`, `tensions_legs_unread` (R15's list, a wording for BOB).
