# workbooks (T41)

**Status** · session_015Xxi8gSWqxgZKESRaSag2Y · depth 2 · COMPLETE · handled B1

## Work (kept current; not a mailbox entry)

Reading set: measured at about 225 KB (this module's requirements 11 KB; code 90 KB and tests 85 KB under its paths; layer 5's row of `build/layers.md`; the Purpose of each of the ten used modules and the services my Uses names: calculations `readTable`, `read`; calc-grammar `parseFigure`, `resultKey`; office-readers R30, R17; record-core `transact`, `declareTable`; membership's Terms, R43, R44, R60, R77, R85, R88, R18; provenance and content as Uses names them), under 300 KB, so read whole myself; no worker summary. Also read: K2442, K2448, the plan's T41-12a and rule 4 (11) at this START, and membership's record's line for workbooks.

## Completion

Entries applied: T41-12a (N822, D54; K2408, K2442), tests only. My requirements assume no administrator sight: R13 withholds a workbook whose project, capture or bound source the viewer may not see, reading membership's `inSight`, so an administrator at a hidden project's `EXISTENCE` is answered as an absent workbook, as R44 asks of a read inside a project; no QUESTION.

- `add.test.mjs`:129 (R13) re-stated: alice, an administrator neither invited nor joined to the hidden project P, binding an extent into P's workbook is answered exactly as an absent workbook and nothing is bound; negative control: once bob invites her (an invited administrator), the bind holds.
- `add.test.mjs` R13 gains a D54 case: an administrator and the founder (both spellings) are withheld P's workbook on every read (`readWorkbook`, `inputsOf`, `lint`) and act (`recordCheck`, `recompute`) exactly as an absent one, nothing written; negative control: P set discoverable by its owner, all three see it whole, while dave, a member outside it, still does not.
- `notes.test.mjs`:46 (R11) re-stated: alice's check, uninvited, is answered `NO_SUCH_WORKBOOK`; invited by the owner, her check as a second member holds (the disclosed list unchanged).

Deferred: none. Found in other modules: none. No provided service changed, so no user's suite is owed. No generated artifact touched.

Tests and checks:
- `node --test bio-plane/test/m/workbooks/`: tests 26, pass 26, fail 0 (before: 26 tests, 2 fail, the two D54 reds at add.test.mjs:129 and notes.test.mjs:46).
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 145 modules, 144 requirements files; 0 failures.
- `checks/architecture.mjs workbooks`: 15 product files, 49 relative imports; 0 failures.
- `checks/coverage.mjs workbooks`: 18 of 18 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs workbooks tranche/T41`: 0 failures (run after commit).

Size (session_015Xxi8gSWqxgZKESRaSag2Y): test runs 3, module lines 2814

## J1 · COMPLETE

T41-12a applied (tests only): add.test.mjs:129 (R13) and notes.test.mjs:46 (R11) re-stated for D54 — an uninvited administrator is answered as an absent workbook, an invited one sees it; new R13 D54 case (administrator and founder, both spellings, withheld on every read and act, nothing written; negative control: P set discoverable, all three see it whole, a member outside still not). No requirement text assumes the old sight. 26/26; format, architecture, coverage 18/18, ownership: 0 failures. Record: build/jobs/T41/workbooks.md.
