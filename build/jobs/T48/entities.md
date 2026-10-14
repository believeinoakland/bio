# entities (T48)

**Status** · session_012L9wEk9N3XmRcXHwxLBwXH · depth 2 · WORKING · handled B2

## J1 · QUESTION

R53's row. The code's one row today is action-grammar's C-117.28 (`where` actions `#proceedingRefusal`), with an actions-only sentence ("An action belongs to a proceeding…"). Under K231/K275 (the earliest module in the order holds the helper and the row; R36's NO_SUCH_ENTITY precedent, progressions' C-100.12 giving way) my best reading, which I am building on:
(1) entities holds the one row, C-91.9 `NOT_A_PROCEEDING` in `ENTITY_CHECKS`, `where` `src/entities/index.mjs notAProceeding > is-proceeding-kind`;
(2) its sentence names no act, so it reads true for events, lines, actions and following: "This is asked of a proceeding, such as a case before a court or a board, and the subject named is registered as another kind. Name the proceeding itself. Nothing was written." (BOB's to reword; the UX stream's to revise);
(3) `notAProceeding(detail, extra?)` answers `{ok:false, reason, code, check, translation, detail, ...extra}`, `extra` never replacing those (R36's shape), a fixed default detail when none is given; it writes nothing and never throws;
(4) C-117.28 is retired in action-grammar's own job (not mine; I touch no other module). Until then the code is held by two checks.mjs files; that is a REPORT for you to place (rule 5 (2), or a CHANGE to action-grammar).
Say if any of (1)–(4) is wrong.
