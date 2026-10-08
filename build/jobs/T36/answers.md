# answers (T36)

**Status** · session_01NcqCSLewdSY9g7i4K6H25W · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

**T36-23 applied** (53b59c7207 on `job/T36/answers`).
- (N729, its share; K1991, K2126) R28: a selection is frozen at set time through `retrieval.selectionRead` (R77), never `selectionResolve` (`standing.mjs` `setFind`). Setting a find extends no selection's life; `NO_SUCH_SELECTION` (an expired selection left unswept), `NOT_YOURS` and `SCOPE_TOO_LARGE` each write nothing. Named by a new test of its own, `standingfind.test.mjs` "R28 (N729; K1991) …", which fails on the old code (seen) and passes on the new.
- (K2122) Red 21 cleared: `findWorld` calls `w.retrieval.recordedReads()` beside `zone()`, making the four recording modules' tables as the plane's boot does.

**Deferred:** nothing.

**Reading set:** measured as mechanics §3 asks: own requirements 22 KB, code and tests 177 KB, the 18 used modules' Purposes 11 KB, retrieval's R19, R73, R76, R77 and its `recordedReads`/`selectionRead` code, layer 6's row: about 240 KB, under 300, read whole by me.

**For BOB (other modules):**
- `build/requirements/answers.md` R28 still carries `*(not yet met: T36)*`; met now, BOB's to clear at merge.
- control-plane `r53-routes.test.mjs`:66 (R53) fails: calculations' map serves `spotcheck`, `spotcheckvisit` with no spec or `OP_STAMPS` entry, from T36-19's merge (red 19's cause), not on rule 5's list. Not this job's change (it touches no op map); belongs with T36-30/T36-35.

**Tests:** answers `bio-plane/test/m/answers/`: 44 pass, 0 fail. Users' tests: agent-worker 10/0; scheduler 95/0; affordances 206/2 (reds 19, 20); notice-producers 61/0; op-declarations 90/3 (reds 13, 17); answer-envelope 24/2 (reds 11, 18); store-door 36/0; control-plane 166/1 (the R53 above); plane 130/0; system `migrate-released` 1/0.

**Checks:** format: 135 modules, 0 failures; architecture: 17 product files, 0 failures; coverage: 29 of 29 live ids named, 0 failures; ownership: 0 failures.

Size (session_01NcqCSLewdSY9g7i4K6H25W): test runs 8, module lines 1,559 (P6: well under 4,000).
