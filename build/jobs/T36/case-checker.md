# case-checker (T36)

**Status** · session_012BekBB8UfaZQaG1nz8xvro · depth 2 · WORKING · handled B0

## J1 · QUESTION

R22 details, my best reading (I proceed on it; answer only if you want otherwise):
1. The `criteria` file's content (case-grammar R13, public-read R33: "the rows … in canonical JSON") is a JSON **list** of R72 rows. Anything else is passed to R21 as is, which answers `MALFORMED` `criteria`.
2. `standards_use` is R21's own answer (`{ok, refusals?, unjudged?}`). Each judged row whose `access` is not `free` and that carries no `captures` adds an `unjudged` entry `{standard, portion, body, check: "COPYRIGHTED_TEXT_CARRIED"}`. R21's "not held" entries keep their shape. `COPYRIGHTED_PASSAGE_UNRELIED` is still judged over the row's `passages` and the case's passage rows. R21 itself is unchanged, so case-authoring's pre-flight sees the same answer as before.
3. A `criteria` file that the manifest lists but the case file doesn't carry, or carries with other bytes: `standards_use` is `{ok: null, detail}`. The detail names the file and its SHA-256 to fetch. R9 fills it like any missing file. It adds no entry to any finding (R22: it changes no result).
4. The `/2` spec uses case-grammar's `caseFilePath` spellings for `archive`, `container` and `criteria`. I'll check them against case-grammar's merge.
