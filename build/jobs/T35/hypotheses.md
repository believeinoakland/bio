# hypotheses (T35)

**Status** · session_016UPzGLbp62BPHEDSMqCmk1 · depth 2 · WORKING · handled B1

## J1 · QUESTION

R14 (T35) says after a deletion no row of this module holds 'a sign that it existed', and R11 says a member is answered the court statement once. My best reading, on which I am building: (1) `member_note_told` records that a member was told the court statement, a fact about the member and not about any note, so it stays when that member's notes are deleted (deleting it would make R11 answer the statement a second time); (2) SQLite's AUTOINCREMENT high-water mark (one number per table, in `sqlite_sequence`) is the means R14 itself requires ('a later note never takes a deleted note's number'), not a note's marker. Nothing else of a deleted note is kept: its row and turns go in one act. Carrying on; an answer only changes (1).
