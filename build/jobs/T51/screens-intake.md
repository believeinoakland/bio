# screens-intake (T51)

**Status** · session_01XiUV1oniArn1H66oUHgn4p · depth 2 · COMPLETE · handled B3

## Record

**Entry applied (T51-117):** R38, R39 and R40 on `capture`, `open-file` and `held`; DEC-342; the words findings; the inherited red.

- **R38** (`capture.mjs`): `sendAcquire` now asks `heldat` (`address`, `check: "true"`) before `acquire`, from the press alone (never from "Finish it", "Capture the new copy", the other acts or a page load). Not held: `acquire` goes as R1 says. Held and `unchanged` or `changed`: nothing is sent; the sheet row names the copy (title from the `held_and_vouched` list, `Open it` a reference to `document` at `copy.document`, the member by the handle `memberlist` gives, the day by `cs.date`); `changed` draws the three A64 sentences and "Capture the new copy" (an `acquire` act carrying `data-again`, which skips the look) and "Leave it". Held and `undetermined`: the same row without any claim of unchanged or changed, and the same two acts. A `heldat` refused, unanswered or `held: null` is drawn failed beside the address (the same words rule as the shell's R13, `refusalHtml`), `acquire` is not sent and the act stays usable; while it is out the line says `state.loading`.
- **R39** (`open-file.mjs`): `openoriginal` and `openwithwarning` go through `cs.download` with `verify` the subject's digest; a match says `screen.open-file.digest.checked` then `.opened`; a difference hands nothing over and draws `refusal.DIGEST_MISMATCH`, or `.unheld` when `heldat` by digest (a read, no `check`) says the team holds no such file; the act stays usable. The safe view is not verified. Nothing of the member's is sent or kept.
- **R40** (`held.mjs`, `capture.mjs`): an upload's row reads the row's own `actor`, `retrieved` and `bytes`; the uploader is the handle `memberlist` gives for the stamp's member (never the id; none drawn where the roster does not name them); `collected_since` is no longer used. `bundleFor` and the Unfinished titles read `heldcaptures` with `state: "held_and_vouched"`; "Cite a passage" looks nothing up.
- **DEC-342** (`capture.mjs`): `promoteDocument` no longer falls back to the builder's `detail`; a promotion's refusal is drawn by `refusal.<CODE>` when the table holds it, else the answer's translation, else `refusal.uncatalogued` with the code; the same for open-file's refusals.
- **Words** (4 findings): the five-code hand-list in `capture.test.mjs` is now the screen's own `refusals`; the ops hand-list in `common.test.mjs` is assembled from the open-file screen's own `reads` and `acts`; the two test copies ("Captured for a question you may not see", "It contains a macro.") are neutral fixtures. `capture.test.mjs`:66's regular expression compares with `refusal.HOST_COOLING_OFF` by key.
- Tests: R38 (7 tests), R39 (4), R40 (2, and the R35 tests re-read for R40), refusal-words controls. `heldat` is stubbed in the tests: it is declared in `op-declarations` only by T51-107.

**Deferred / reported (REPORT to BOB):**
1. R39's mismatch test (`open-file.test.mjs`, "R39 altered bytes hand nothing over") is red until `interface-shell` R98 (`cs.download`'s `verify`) is merged: the kit in `tranche/T51` ignores `verify`. The match, safe-view and control tests pass because the stale kit hands the bytes over unchecked; after the merge the matching tests prove the check too (their bytes hash to the subject).
2. No word for A64's "captured by <member>, <date>" (`screen.document.capturedby` needs `{source}`), "nothing was added", or the undetermined row's sentence: drawn without them (the unchanged row shows handle · day · "the site still gives the same document"; the undetermined row names the copy only).
3. "Leave it" has its own explanation (`screen.capture.leaveit.help`), but `cs.act` takes no explanation key but `act.<op>.here.<place>` (interface-shell R90) and a Leave it that is an `acquire` act would draw `act.acquire.does`; it is drawn as a quiet link to the same route with the help as its explanation. It clears the row and, as a navigation, the typed address.
4. The design's `mk-data` class (the compared copy's title) is not defined by any served stylesheet (R56 refuses it); drawn with `rec`.
5. `heldat` (`op-declarations`, T51-107) is not declared yet; `check` needs a member session.
6. A29 stays open as the entry says (BOB's, the design's to say whether `document` lists what a captured page lacks).

**Size (session_01XiUV1oniArn1H66oUHgn4p):** test runs 12, module lines 1384

## J1 · BLOCKED

BLOCKED (cause: tests, one red that is another module's to unblock). T51-117's work is done and pushed on `job/T51/screens-intake` (R38, R39, R40, DEC-342, the 4 words findings, the inherited capture.test.mjs:66 red). 122 of 123 module tests pass; `checks/words` shows nothing naming screens-intake (also over the whole tree); format, coverage (40 of 40 ids), `setup-words build --check` and ownership are clean. The one red is `open-file.test.mjs` "R39 altered bytes hand nothing over": the kit on `tranche/T51` ignores `cs.download`'s `verify` (interface-shell R98, T51-113, whose job has not merged), so a mismatch cannot yet be refused. Merge interface-shell into `tranche/T51` and send RESUME or CHANGE: I merge, re-run, and post COMPLETE. My record lists all of it.

REPORTs (details in my record):
1. No word for A64's "captured by <member>, <date>" (`screen.document.capturedby` needs `{source}`), for "nothing was added", or for the undetermined row's sentence: drawn without them.
2. "Leave it" needs its own explanation (`screen.capture.leaveit.help`), but `cs.act` takes only `act.<op>.here.<place>` (R90): drawn as a quiet link to the same route (it clears the typed address too). A kit option for a non-op action with an explanation key would fit.
3. The design's `mk-data` (compared copy's title) is not defined by a served stylesheet; drawn with `rec`.
4. `heldat` is not in `op-declarations` until T51-107; tests stub it. Also A29 remains BOB's open question.

**B3 CHANGE applied:** the design's three A64 rows (`captured_by`, `nothing_added`, `undetermined`) are drawn by key on the held row (R38); the records' report 2 (missing words) is closed. 122 of 123 module tests pass; the one red is R39's mismatch test, accepted by BOB (B2) until interface-shell R98 merges (the kit on `tranche/T51` at this merge still has no `verify`). When it merges and BOB sends a CHANGE, merge, re-run: the matching-bytes tests then prove the check as well. Checks: words 0 failures (module), `setup-words build --check` clean, format, architecture and coverage clean for this module, ownership 0 failures. Size (session_01XiUV1oniArn1H66oUHgn4p): test runs 15, module lines 1388

## J2 · COMPLETE

COMPLETE (T51-117), with the one accepted red. B3 applied: the A64 row draws `screen.capture.a64.captured_by`, `.nothing_added` and `.undetermined` by key. 122 of 123 module tests pass; the red is R39's mismatch test, accepted in B2 until interface-shell R98 merges (`cs.download`'s `verify` is still absent from the kit at this merge). Words check 0 failures, setup-words check clean, format, architecture and coverage clean for the module, ownership 0 failures. Send a CHANGE when interface-shell merges and I re-run it. Record: `build/jobs/T51/screens-intake.md`.
