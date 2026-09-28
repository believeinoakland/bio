# standards (T8)

**Status** · session_01UmVjw9n9gtCPtw463X9hRc · depth 2 · WORKING · handled B2

## J1 · QUESTION

Four readings; I am building on each now and will bring the work in line with your answer.

1. **Refusal family.** standards' refusal rows are a family of its own in `src/standards/checks.mjs` (K174's pattern). C-111 is intent's highest; C-112 onward is unused on `tranche/T8` and on every layer-9 job branch. My reading: **C-112 `STANDARDS_CHECKS`** (standards being first in layer 9). Six jobs mint families at once, so please assign (or confirm) mine.
2. **R3 "a withheld fact (jurisdictions R15)".** `combine` unions `standard_sources` (R14) and never withholds an entry, so no R15 conflict can reach R3 from that section. My reading, per R15's "never chooses between profiles that disagree" and the Suggestions' "two profiles that disagree (withheld, so undetermined)": when entries from **different profiles** match the citation and differ in `source`, `kind`, `issuer` or `level`, the answer is `source: undetermined`, its why naming both. Two matches from one profile take the first (the profile's own order), and matches that agree take the first. `combine` answering `ok: false` (a profile no longer held or invalid) is also undetermined.
3. **R5 "any id for a viewer naming no member".** My reading is membership R43's rule, through `inSight`. A member sees every standard (a bundle outside any project); a machine credential and the founder's `admin` see it too; any other viewer (none, malformed) gets `NO_SUCH_STANDARD`. The same gate applies to `standardsIn`, and to `standardAdopt`'s proposal lookup.
4. **R11 at the write.** To hold "the only writers of a standard are R1 and R10", standards registers a promotion step (R39) refusing a `standard`-type promotion not made by its own acts: a raw `op=promote` of a `STD-` bundle, or any revision, is refused with a new code `STANDARD_WRITTEN_ELSEWHERE` in my family. A replay (restore) is admitted.
