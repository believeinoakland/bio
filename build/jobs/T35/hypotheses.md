# hypotheses (T35)

**Status** · session_016UPzGLbp62BPHEDSMqCmk1 · depth 2 · COMPLETE · handled B1


## Completion

**Entry applied (T35-41; N658, DEC-144, K1774).** On J1's reading (no answer yet; an answer changes only its point (1)).
- R11: `noteRevise({note, text, by})` replaces one note's text in place (`UPDATE`, one row), refusals in order `MACHINE_CANNOT_NOTE`, `NO_SUCH_NOTE` (absent, deleted or another's, one answer), `NOTE_NO_TEXT`, `NOTE_TOO_LONG` (bytes, refused, never cut), each writing nothing; answers `{ok, note, at}`, never `courtStatement`; the note keeps its number and turns. R11's text checks are one helper shared with `noteWrite`.
- R12: `notesOf` answers each note with `revised` (its last revision's instant, or null); a deleted note is in no answer.
- R13: `noteDelete({note, by})` removes the note's row and its turns in one transaction, answering `{ok, note, deleted: true}`; refusals `MACHINE_CANNOT_NOTE`, `NO_SUCH_NOTE`; a turn never deletes a note, and a turned note may still be revised and deleted; what a turn made is untouched.
- R14, R15: no earlier text and no deleted note is left in any table (tested over every table of the store); `member_notes` gains the column `revised`, added at boot to an older copy's table (`NOTES_ADDED_COLUMNS`, `PRAGMA table_info`); AUTOINCREMENT keeps a deleted number from reuse, across a boot.
- R7: `hypothesesOps` gains `noterevise`, `notedelete`, each member from the body's stamp.
- Rows: C-134.13–C-134.16's `where` name `noteRevise` / `noteDelete` (no new code); they await promotion's stamp (accepted red 2).
- Red 20 cleared: `notes.test.mjs` re-pinned to membership R108's current sentence ("Your group's Civicsmith keeps…").
- Reading recorded: the founder's stamp (`admin`) names no note-keeping member, so it is refused `MACHINE_CANNOT_NOTE` at every notes act (T34's behaviour, unchanged), reaching no member's note.

**Deferred.** None of the entry. One observation, not fixed (BOB's call on R12's meaning): note numbers come from one counter for the whole group, so a member who keeps two notes can see from the gap between their numbers that notes were kept by others meanwhile (not whose, nor whose count). R12 says nothing names how many another member keeps; a per-member number would close it but changes the key R11's Terms describe. T34's test already treats numbers as outside R12's comparison.

**Found in other modules.**
- `control-plane` `r53-routes.test.mjs` (red 29, already red on `tranche/T35`) now also names `noterevise` and `notedelete` as ops with no spec: their specs are op-declarations' (T35-70), their routing control-plane's (T35-72), as B1 says.
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (hypotheses' source changed), regenerated at the layer's close (§14).

**Tests and checks run** (after merging `tranche/T35` @ 72300ddd6a):
- `node --test bio-plane/test/m/hypotheses/`: tests 30, pass 30, fail 0 (red 20 green).
- Users of hypotheses: affordances `t34` 9/0, plane `t33` 16/0; affordances `t33` 1 fail, op-declarations `t34` 2 fail, `t33` 1 fail, control-plane `r53-routes` 1 fail, each failing identically on `tranche/T35` without this job (accepted reds 9, 23, 29), only `r53-routes`' message gaining the two ops above.
- `format`: 130 modules, 129 requirements files; 0 failures. `architecture hypotheses`: 9 product files, 29 relative imports; 0 failures. `coverage hypotheses`: 15 of 15 live ids; 0 failures. `ownership hypotheses tranche/T35`: 7 files; 0 failures.

Size (session_016UPzGLbp62BPHEDSMqCmk1): test runs 5, module lines 763

## J1 · QUESTION

R14 (T35) says after a deletion no row of this module holds 'a sign that it existed', and R11 says a member is answered the court statement once. My best reading, on which I am building: (1) `member_note_told` records that a member was told the court statement, a fact about the member and not about any note, so it stays when that member's notes are deleted (deleting it would make R11 answer the statement a second time); (2) SQLite's AUTOINCREMENT high-water mark (one number per table, in `sqlite_sequence`) is the means R14 itself requires ('a later note never takes a deleted note's number'), not a note's marker. Nothing else of a deleted note is kept: its row and turns go in one act. Carrying on; an answer only changes (1).
