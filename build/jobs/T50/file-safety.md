# file-safety (T50)

**Status** · session_01Ngr3SpogWDysPQgvCLp5r5 · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings of R45 I am building on; answer only if you want either changed.

1. SAFE_VIEW_TEXT_MAX: START did not state the figure, so I used the suggested 262,144 characters (exported, in R21's list).

2. R11 says `original` is R9's answer, and R9 grades the file, which today reads the whole file to find its format; R45 says the text view reads at most four bytes for each character kept, however large the file. To meet both, the module now reads at most the first 4 x SAFE_VIEW_TEXT_MAX = 1,048,576 bytes to decide a file's format. A file that ends within them is judged exactly as before (the whole file, UTF-8 checked end to end). A longer file whose start is a PDF, an office/OpenDocument container, an archive or a compound file is read whole as before. Any other longer file is judged by its first 1,048,576 bytes (cut back to a whole character), the rest unread, and the safe view, the grade (R6), R8/R9 and the deeper check's structure check all use that one judgment.
   Consequence: a plain-text file over 1 MiB is graded `text` (low) without its tail checked for NUL or invalid UTF-8; before, such a tail made it `unknown` (high). ClamAV still scans the whole file before any original opens.
   Alternative if you want it stricter: a file longer than 1 MiB whose tail was not read is graded high with the existing reason `unread`, so its original opens only by the warned path.
   I am carrying on with the reading above (the change would be one line in the grade).

## J2 · COMPLETE

COMPLETE. T50-57 file-safety, pushed on `job/T50/file-safety` (tranche/T50 merged in).

Entries applied:
- R45 (+R21): `safeView` of a plain-text file answers `{ok, kind:"text", derived, of, text, truncated, original}`, the file's own characters (byte order mark kept, nothing interpreted) cut at `SAFE_VIEW_TEXT_MAX` = 262,144 (exported; confirmed B2). It needs no renderer (answers with none bound), is never sent to the renderer (`renderBatch` counts it `none`), is served under a scan hold, and is counted as a `safe_views` figure. The module reads at most the first 4 x SAFE_VIEW_TEXT_MAX bytes to decide a file's format (one `#look` for the view, R6, R8/R9, the structure check and the render); a file that ends within them is judged as before; a longer PDF, container or compound file is read whole; any other longer file is graded high with the existing reason `unread` (B2), so nothing is graded lower for an unread rest.
- Plan rule 6: no member-facing English in the module. New `words.mjs` holds keys; `checks.mjs` rows, `THREAT_REASONS`, `PROVIDER_REASON_WORDS` and `kinds.mjs`' shared sentence and R38's fallback are `word(key)` (`WORD_KEYS` exported = the 76 `reads` in words-reads.json, tested). "labeled" re-spelled in a comment. Tests that quoted English now read the key.
Deferred: none.

Found in another module / for BOB:
- `words-reads.json` marks the 14 finding-kind sentences in `kinds.mjs` `unkeyed` with the reason "the wire's detail ... for builders", but R38's `words` is a member-facing sentence (DEC-169's card). They stay in source (no key exists); the design lane should key them (a REPORT under plan rule 6).
- The detail strings (unkeyed, for builders) still say "Your group's Civicsmith", which R42's test requires; rule 6's "team" applies to text people read, so unchanged.
- Inherited reds: running the 15 other modules' test directories that mention file-safety gives 26 failures (affordances t36, op-declarations t33-t48, answer-envelope, screens-settings, plane roster, scheduler plane, store-door routes, op-grades t48); the same 26 fail identically on tranche/T50 before my change, none caused by it.

Tests: file-safety 64 pass, 0 fail (new text-view.test.mjs: R45 x5 incl. the 1,048,576-byte boundary B2 asked for; amended absent, rows, view for keys). Checks (process repo): format 0 failures; architecture 0 failures for file-safety; coverage 45 of 45 ids; ownership 0 failures; `run.mjs` architecture 0 failures, its 24 coverage failures are other modules'.
Size (session_01Ngr3SpogWDysPQgvCLp5r5): test runs 8, module lines 2345
