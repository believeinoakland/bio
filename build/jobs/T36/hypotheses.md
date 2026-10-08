# hypotheses (T36)

**Status** · session_011Q6j1JLW7wPn81YSfaL2Qx · depth 2 · WORKING · handled B1

## Reading set (mechanics §17, N739)

Measured as mechanics §3 asks: my requirements (15 KB), layer 6's row of `build/layers.md`, the plan's T36-20 entry, its "Rules at the opening", K2126 and the draft's hypotheses section, the rulings T36-20 cites (K1983, K2007, K1489), my code (49 KB, 3 files) and tests (78 KB, 7 files), each used module's Purpose, and the services my Uses names (record-grammar R46–R48; record-core R1, R2, R7, R8, R21–R24, R32, R39, R46, R80; membership R43, R76, R80, R107, R108; promotion R39; connection-grammar's Provides whole; explore R19; calculations R30). About 190 KB, under 300 KB: read whole by me, no workers, no summary.

## Completion

**Entry applied (T36-20; N727; K1983, K2007, K1489, K2126).** R14's T36 sentence is met. `member_notes` is now keyed by `(member, note_id)`. Each member's next number comes from their own high-water mark in a new table, `member_note_numbers` (`member`, `last`), set in the same transaction as the note. Nothing shared across members is drawn, so a member's numbers, their order and their gaps depend only on that member's own notes. Using the mark rather than `MAX(note_id)` keeps R14's "a later note never takes a deleted note's number", including after deleting the latest note. Interfaces are unchanged: R11's `note`, R12's newest-first order and `after` cursor, R13's `note` argument.
- **Upgrade (in `migrate`, at boot, in one `record-core.transact`).** A store keyed by the old group-wide AUTOINCREMENT `note_id` is renumbered per member from 1, in present order (`ROW_NUMBER() OVER (PARTITION BY member ORDER BY note_id)`). Text, `at` and `revised` are kept. Turns follow their notes by `(member, old number)`. Each member's mark is set to their last number. The old table, its index `member_note_turns_of` and the shared sequence's `sqlite_sequence` row are dropped, so the old numbers are kept nowhere. It is idempotent: a store already keyed by `(member, note_id)` is left alone. If it fails part-way it rolls back whole, and the next boot retries.
- **My detail decisions (BOB's to confirm):**
  - (1) The mark is declared through `record-core.declareTable` with `sight: "owner"`, `export: "never"`, `version_chain: false` and `purge: "exempt"`. A whole-store purge clears the notes but keeps the marks, so no number is ever taken twice, purged store or not. This is how record-core keeps its own id counter (its R23), and how the old shared `sqlite_sequence` behaved. The mark holds no text and no other member's count. R14's "nothing marks that it existed" is read, as the T35 test already read it, with the number's high-water mark as R14's own way of never reusing a number. It is not counted in the notes tables (`NOTES_TABLES` unchanged; exported as `NOTE_NUMBERS_TABLE`).
  - (2) A consequence of per-member numbers: two members' notes can carry the same number. "Another's note" (R11, R13) is therefore a number the asker does not hold. Asked by a member who holds that number themselves, the act reaches that member's own note, never the other's. The T35 delete test is re-aimed accordingly (below).
- **Tests.**
  - New: `notes-t36.test.mjs`, 4 tests naming R14 (and R12, R15).
    - Ann keeps 3 notes, vera keeps 50 and deletes 20, the boss keeps 7, then Ann keeps 3 more. Everything Ann can learn is byte-identical to a world where nobody else kept anything: her numbers (1–6), every page and cursor of `notesOf`, the op, and every `noteRevise`/`noteTurn`/`noteDelete` answer on 15 numbers around hers and theirs. The same holds the other way for vera. On the old code this test fails (Ann's numbers came out `1, 2, 3, 61, 62, 63`).
    - Control: Ann deletes her latest note and her next note does not take its number, across a boot and a whole-store purge too; the mark's declaration is checked.
    - Migration of an interleaved shared-sequence store with deletions and turns: dense per member, turns on the right notes, no shared mark left, a second boot changes nothing.
    - The migration is one act (a failure part-way leaves the old store whole), and an empty old store boots clean.
  - Changed:
    - `fixture.mjs`: `others()` also leaves out this module's new table.
    - `notes-t35.test.mjs`:
      - The R15 "older copy" builds the literal T34 table, since it can no longer be derived from the current schema.
      - The R14 "no marker" test leaves out the member's own mark beside `sqlite_sequence`, and asserts the mark holds only `{member, last}`.
      - The R13 delete test's "another's note" uses a number of Ann's that the asker does not hold (per-member numbers, decision (2)).
  - No test was skipped or weakened.

**Deferred:** nothing.

**Found in other modules / artifacts (REPORT J1):**
- The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from this change's source (§14). It is BOB's to regenerate at L6's close.
- `control-plane` `test/m/control-plane/r53-routes.test.mjs`:66 fails identically on the untouched `tranche/T36` tip. It is not in rule 5's red list by name; it looks like red 17's family (routes without specs), but that is BOB's to confirm.
- My own requirements' Uses names `membership`'s `viewerPredicate`, `inSight` and `courtNotice`, but the code also calls `positionalMember` (membership R76) to name a note's member (since T34). This is a wording gap in Uses for BOB; the behaviour is unchanged.

**Tests and checks run.**
- `node --test bio-plane/test/m/hypotheses/`: 34 pass, 0 fail.
- Users of this module (affordances t33, t34; plane t33; op-declarations t33, t34, t35; control-plane r53-routes): 73 pass, 5 fail. The same 5 fail identically on `tranche/T36` without my change: reds 19, 17 (×2), 13, and r53-routes:66 above.
- No layer tests are named in `build/manifest.md`.
- Checks, run from the process repository:
  - `format`: 135 modules, 134 requirements files; 0 failures.
  - `architecture`: 11 product files, 34 relative imports; 0 failures.
  - `coverage`: 15 of 15 live requirement ids named by a test; 0 failures.
  - `ownership` against `tranche/T36`: 6 files; 0 failures.
- P6: the module is 810 lines (`bio-plane/src/hypotheses/`), well under about 4,000.

Size (session_011Q6j1JLW7wPn81YSfaL2Qx): test runs 10, module lines 810

## J1 · REPORT

(1) Generated artifact made stale (§14): the plane bundle bio-plane/dist/bio-plane.bundled.mjs (not_product), from bio-plane/src/hypotheses/; BOB's to regenerate at L6's close. (2) control-plane test/m/control-plane/r53-routes.test.mjs:66 fails identically on the untouched tranche/T36 tip; it is not in rule 5's red list by name (it reads as red 17's family, routes without specs): BOB's to confirm and name. (3) hypotheses' own requirements: Uses names membership viewerPredicate, inSight, courtNotice, but the code also calls positionalMember (membership R76) to name a note's member (since T34): a wording gap in Uses, behaviour unchanged.
