# The 89 fixtures findings, sorted — S4 (2026-10-27)

**Result.** 86 cleared in the sweep (test files only, comments only); 3 left, each needing a judgment, listed for T53 jobs. Check after the sweep, on `lane/tests-sweep` with `tranche/T53` merged in: `fixtures: answer 0, stub 0, code 0, contract 3; 3 failures`.

## Cause of the 86 (mechanical)

Every one was `contract-no-run`: the user module's hand-built `owedLater`, `keepLater`, `registerJob`, `armJobs` or `jobRegistrarStub` was marked `// fixtures-contract: plane <id>`, but the provider's contract run moved to `store-assembly` (`r10-fixtures-run.test.mjs`, K5200 item 99), which is `plane`'s successor for the ledger and the registrar and is later in `modules.json` than every user. The fix is the marker's provider name only: `plane` becomes `store-assembly` for the contract ids `job-registrar`, `keep-later`, `owed-ledger` (66 marker lines in 25 files; no code line changed). `test-support`'s own `job-registrar-stub.mjs` (4 candidates) had no marker; it now carries `// fixtures-contract: store-assembly job-registrar`, which the provider's run names (`fixtures-run: test-support job-registrar`).

Files by user module: acquisition (23 files), capture (6), doorbell (1), file-safety (1), monitoring (1), test-support (1).

## Left: needs a judgment (3, all `orphan-run`, all in `bio-plane/test/m/store-assembly/r10-fixtures-run.test.mjs`)

For T53's **store-assembly** job (with the **control-plane** and **screens-intake** jobs):

| line | `fixtures-run:` | why it is not mechanical |
|---|---|---|
| 23 | control-plane job-registrar | control-plane's tests now run the real store's registrar (`r72-parted.test.mjs:40`, `r9-seam-limits.mjs:282`); no hand-built value carries a marker. Either the line is dead (delete it) or control-plane still owes a stand-in that is to carry the marker. Only the owners know. |
| 29 | control-plane owed-ledger | same: `t51-visitor-copy.test.mjs:33` wraps the real ledger (a spy, not a stand-in). |
| 27 | screens-intake owed-later | no screens-intake test holds an `owedLater`; the header of the file says the line waits for a user's marker, so the plan of screens-intake decides whether one is coming. |

Not guessed: deleting these lines edits the provider's contract list, which is the store-assembly job's.

## Notes for PLANNING

- The fixtures check was 89 and is 3; no product source changed.
- After the sweep merges, `fixtures` (in `checks/run.mjs`) reports 3 until the store-assembly job settles these lines.
