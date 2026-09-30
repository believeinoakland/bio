# sources (T17)

**Status** · session_01BuH77QM4Gg6KVGSfhNvcHf · depth 2 · WORKING · handled B1

## Completion

**Entries applied.**
- N377 (K547): R15's `source_knocks` read contract pinned by a test at the module, `test/m/sources/contract.test.mjs` "R15 …": the table has exactly the columns `(knock_id, source_id, capture_sha, bytes, received)`, in that order and no other; its rows are exactly one per pulled knock a minted source stands behind, each equal to the inbox's receipt (and to the capture's stated `source.receipt`); a knock left new, a discarded knock and a pulled knock whose source is not minted have none; rows are written once and never changed by later reads or acts; no secret, digest, pseudonym, contact, note or disclosed value appears in it. R15's `not yet met` mark (`build/requirements/sources.md`) is BOB's to strike: coverage now passes, 15 of 15.
- B1's `mintExhausted` note (K576): the mint already answered through `record-core.mintExhausted("SRC")` (`src/sources/index.mjs`, `sourceOf`). Now tested: "R1 a source id that cannot be drawn …" fills record-core's ledger with every `SRC-<year>` id and shows `sourceOf` answers `MINT_EXHAUSTED`, prefix `SRC`, C-59.6's check and translation and the source-naming detail, and writes nothing, not even the `source_knocks` row of a held source's knock read in the same capture (the transaction rolls back).

**Improvements in this module (found while pinning R15).**
- *A flaw against R15 and reevaluation R28, fixed.* A source was bound only to the knocks whose capture someone had read through `sourceOf`. A pseudonym's other pulled knocks had no `source_knocks` row, so reevaluation R28, which finds a capture's source only through that table, would miss a rung move for a finding resting on an unread capture of the same knocker. Now `#bindKnocks` binds every pulled knock of a pseudonym (from capture's `knocksOf`, its R67, paged) when the source is minted, and again inside the transaction of every act that may move its rung (R2, R6, R7, R11), before the listeners hear the move. A knock without a secret is its source's only knock, so reading it is enough. Tested in the R15 test (a knock pulled after the minting is bound before the R10 call).
- *A gap in R10, fixed.* A `same_secret` link (R6) raises the *linked* source's rung (R9) as well, but only the linking source's listeners were called, so reevaluation never heard that move. Now each listener is also called for the linked source, with the same entry, when its rung moves; an evidence link, which moves nothing there, calls none. Tested: `contract.test.mjs` "R10 a link that moves the linked source's rung …". The answer's `notified` counts both calls.

**Deferred.** None.

**Found in other modules.** None. (Reevaluation, publication, case-authoring, affordances and control-plane suites pass with the change; reevaluation now also hears linked-source moves, which R28 asks for.)

**Run.**
- `node --test test/m/sources/` (from `bio-plane/`): tests 24, pass 24, fail 0 (21 before, plus 3 new).
- Mutation check: removing the bind at minting, the bind before an act, or the `mintExhausted` answer each fails the matching new test.
- Users of this module, since R10's behaviour widened: `node --test test/m/sources/ test/m/reevaluation/ test/m/publication/ test/m/case-authoring/ test/m/affordances/ test/m/control-plane/`: tests 445, pass 442, fail 0, todo 3 (pre-existing `test.todo`s).
- Layer tests: none named in `build/manifest.md`.
- `node checks/format.mjs`: 72 modules, 67 requirements files; 0 failures.
- `node checks/architecture.mjs … sources`: 10 product files, 25 relative imports; 0 failures.
- `node checks/coverage.mjs … sources`: 15 of 15 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … sources tranche/T17`: 3 files changed by sources; 0 failures.

Size (session_01BuH77QM4Gg6KVGSfhNvcHf): test runs 7, module lines 837
