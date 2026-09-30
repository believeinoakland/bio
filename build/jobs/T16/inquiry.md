# inquiry (T16)

**Status** · session_01H5mTTXgEPXqH137mj1KHYa · depth 2 · WORKING · handled B1

## J1 · QUESTION

N369, the catch in `contradictionFindings` (`src/inquiry/contradiction.mjs`:208–211). No existing row is true of it: C-2.11 says the link is not a candidate id, and the only nearby row for a check that threw, C-102.3 `AUDIT_CHECK_FAILED`, is the audit's and says "the audit changes nothing". My best reading, which I am building now: a new row in inquiry's own table, awaiting T17's stamp (promotion's, N318):

| C-2.18 | `CONTRADICTION_ARM_FAILED` | "The check of this question's contradiction fields (its link, its resolution, what it explores) stopped with an error instead of answering, so the question is refused rather than let through. The error is in the check and says nothing yet about the document. Nothing was written." |

`where`: `src/inquiry/contradiction.mjs contradictionFindings > is-contradiction-arm-judged` (a DEC-49 region round the catch). It stays inside `BASIS_REFUSED` with the other R47 findings (R11), so the document fails closed as today; only the code and the words change. It needs R38's list (C-2.11–C-2.17 → C-2.18) and R47 a line ("a document the arm cannot judge is `CONTRADICTION_ARM_FAILED` (C-2.18); it never passes"). If you prefer another code or wording, answer and I will rename.
