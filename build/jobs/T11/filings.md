# filings (T11)

**Status** · session_01Bokq8y9ZX2oFtuYKbqK3YF · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two points on N217, both on my best reading; I carry on with them.

1. **The provider is not there yet.** Actions' `noSuchAction` (its R43) is not on `tranche/T11` nor on `origin/job/T11/actions`. I build against its Provides (the opening rules): filings imports `noSuchAction` from `../actions/index.mjs` and `#noAction` returns `noSuchAction(id, extra)`. Until actions' R43 is merged into the tranche, filings' module fails to load, so none of my tests can run. I ask you to merge actions early (§4) and send me a `CHANGE` when it is on the tranche; I then merge, run and complete. Meanwhile I write the tests against R43's stated shape.
2. **"`#noAction`'s second sentence rides `extra`" (K351).** My reading: the second of `#noAction`'s two `detail` sentences, "no module answers an action's read here, so no action is readable" (K248's case, no actions module given), rides as `extra: {why: <that sentence>}`; the first ("no action by that id is readable here; one you may not see answers the same") gives way to R43's one fixed `detail`. With actions present, `extra` is absent, so absent, invisible and not-an-action answer byte-identically to every other caller's `noSuchAction(id)`. C-115.2 is retired from `FILINGS_CHECKS` (a departure promotion R34 stamps; reported again at COMPLETE).

## Progress (FILINGS #3)

- **N217 applied** (commits on this branch): `#noAction` answers through actions' `noSuchAction(id, extra)` (its R43), `extra` = `{why: "no module answers an action's read here, so no action is readable"}` only when no actions module is given (K248); C-115.2 `NO_SUCH_ACTION` removed from `FILINGS_CHECKS` (id retired). Tests: `refusals.test.mjs` asserts every R1/R8/R13/R14 site answers byte-identically to `noSuchAction(id)` (absent, invisible, not an action), and the K248 case carries `why`.
- **N296:** every id R1–R21 checked against its tests: each holds and is tested at the interface in full (coverage 21/21). List for BOB at COMPLETE.
- **Verified so far** against a local, uncommitted stub of R43's stated shape: filings 34 pass, 0 fail; format, architecture, coverage (21/21), ownership: 0 failures each.
- Actions' R43 merged into the tranche (B3, K370) and into this branch; N217 finished against the real provider.

## Completion (FILINGS #3)

**Entries applied.**
- **N217** (K275, K351): every site answering a missing action (R1 `filingPrepare`, R8 `counselPacket`, R13 `filingsFor`, R14 `theoryPropose`, and R7's no-correspondence case) answers through actions' `noSuchAction` (its R43, row C-117.2), byte-identical to every other caller's; `#noAction`'s second sentence rides `extra` as `why` only in K248's case (no actions module), per B2. **C-115.2 `NO_SUCH_ACTION` departs** `FILINGS_CHECKS`, its id retired: a row change for promotion R34 to stamp. The Uses line's `(not yet met: N217)` on `actions` now holds.
- **N296:** every id holds and is tested at the interface in full: R1–R21 (coverage 21 of 21). Marks to strike in `build/requirements/filings.md`: the `(not yet met: new module)` on each of R1–R20 (R8–R11 also carry `, K13`; R2 and R15 `; K102`; R21 `; K171`, all held), the Status line's "Every requirement is *(not yet met: new module)*", and the Uses' `(not declared)` on `content` and `conformance` (both are in `modules.json`'s `uses`).

**Deferred.** None.

**Found in other modules (for BOB).**
- **affordances** (R19, `plane.test.mjs:389`), red on the tranche as merged, not by filings (this job's diff is filings' files only): `actionmove` called without a reason now refuses `ACTION_MOVE_NO_REASON` (actions' rename under K275), which is not in affordances' `JUSTIFICATION_REFUSALS`: 72 pass, 1 fail, 1 todo.
- **legacy-tests**: suites that count filings' rows or the `NO_SUCH_ACTION` sites (`refusal-wire.test.mjs`, the DEC-49 refusal-code guard) may need re-anchoring for C-115.2's departure.
- **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, rebuilt by BOB) still carries C-115.2; stale by this change.

**Tests and checks run.**
- `node --test bio-plane/test/m/filings/`: tests 34, pass 34, fail 0 (on the real actions provider, tranche @ K370 merged).
- Users of filings: `escalation` pass 28, fail 0; `affordances` pass 72, fail 1 (above), todo 1.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture filings`: 11 product files, 39 relative imports; 0 failures. `coverage filings`: 21 of 21 live requirement ids named by a test; 0 failures. `ownership filings tranche/T11`: 4 files changed; 0 failures.

Size (session_01Bokq8y9ZX2oFtuYKbqK3YF): test runs 6, module lines 1381

## J2 · COMPLETE

N217 and N296 applied; details, marks to strike, reports (affordances R19 red from actions' ACTION_MOVE_NO_REASON; C-115.2's departure for promotion R34; the bundle stale) and check lines in the record's Completion section. filings 34/0 on the real provider; escalation 28/0; format, architecture, coverage 21/21, ownership: 0 failures.
