# file-safety (T50)

**Status** · session_01Ngr3SpogWDysPQgvCLp5r5 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings of R45 I am building on; answer only if you want either changed.

1. SAFE_VIEW_TEXT_MAX: START did not state the figure, so I used the suggested 262,144 characters (exported, in R21's list).

2. R11 says `original` is R9's answer, and R9 grades the file, which today reads the whole file to find its format; R45 says the text view reads at most four bytes for each character kept, however large the file. To meet both, the module now reads at most the first 4 x SAFE_VIEW_TEXT_MAX = 1,048,576 bytes to decide a file's format. A file that ends within them is judged exactly as before (the whole file, UTF-8 checked end to end). A longer file whose start is a PDF, an office/OpenDocument container, an archive or a compound file is read whole as before. Any other longer file is judged by its first 1,048,576 bytes (cut back to a whole character), the rest unread, and the safe view, the grade (R6), R8/R9 and the deeper check's structure check all use that one judgment.
   Consequence: a plain-text file over 1 MiB is graded `text` (low) without its tail checked for NUL or invalid UTF-8; before, such a tail made it `unknown` (high). ClamAV still scans the whole file before any original opens.
   Alternative if you want it stricter: a file longer than 1 MiB whose tail was not read is graded high with the existing reason `unread`, so its original opens only by the warned path.
   I am carrying on with the reading above (the change would be one line in the grade).
