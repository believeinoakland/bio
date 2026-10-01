# escalation (T21)

**Status** · session_01XnQkJQSGg5SKNNSMx7mZyS · depth 2 · WORKING · handled B1

## Completion (ESCALATION #9)

**Entries applied**
- **N462** (K916, K933; R7, R8, R13, R26). `bio-plane/src/escalation/index.mjs`: an evaluation's trigger id is `<id>/evaluation#<n>`, `n` its place (1, 2, …) among the escalation's evaluations (`evaluationId`), in place of `${e.id}/evaluation/${ev.seq}` (the log's number, which counted every act, a withheld attachment among them). R13's compatibility: `#history` answers an advance's trigger id recorded in the old form `<id>/evaluation/<seq>` in R7's form when that log entry is an evaluation of this escalation, and leaves it as recorded when it names none (a non-evaluation entry, a number past the log, another escalation's id); the document is never edited (R18). R26's "a withheld action meets no trigger for that viewer" was the code's behaviour already (`#triggers` counts only `#sight`'s visible actions); it is now proved.
- **Re-keyed** `test/m/escalation/stages.test.mjs`:134 (`/evaluation/6` → `/evaluation#1`); no other pin of the old form in the repository (grepped all `.mjs`, `.js`, `.html` outside `dist/`).
- **N469**: re-scanned my paths for notes naming a file T20 deleted as live (runners, suites that assert, pin or anchor, "the battery"): none.

**`not yet met: T21` marks met** (for BOB to strike, K775 (6)): R7; R8; R13 (the compatibility rule); R26's two (the evaluation's trigger id standing, N462; and a withheld action meeting no trigger, N460/K933).

**Proof** (`bio-plane/test/m/escalation/`):
- `stages.test.mjs` "R7 …": every completed reading proposes 4→5 and 4→7 naming `#1`; a second and third evaluation with a decline between are `#2`, `#3` while their log numbers are 6, 7, 9; the advance records `#3` and the history answers it.
- `stages.test.mjs` "R8 …": stage 5's to-7 names `#1`, the evaluation's log number being greater than 1.
- `stages.test.mjs` "R13 compatibility (N462) …": two rounds (evaluations #1 and #2), the document replayed as the old code recorded it (both advances in `/evaluation/<seq>`, plus three old-form ids naming no evaluation); the read answers `#1` and `#2` and leaves the three; every other history field equal; the document still holds the old form; a read writes nothing; a later act keeps the old log byte for byte.
- `invariants.test.mjs` "R26 R7 R8 …": in R26's world the evaluation of a withheld action's reply is `#1` for both viewers and with nothing withheld, and no answer to bob carries `/evaluation/`; at stage 5 a withheld action's sent entry meets 5→6 for alice only (bob: not met, `ids: []`, "no breach action is attached at stage 5"), `escalationsDue` per viewer likewise, and bob's advance and decline on it answer `TRIGGER_NOT_MET` and `EDGE_NOT_PROPOSED` writing nothing; at stage 6 a reply on it meets 6→4 for alice only, and bob sees alice's advance with `ids: []`; a reply bob can see meets it for him.
- Negative control: with the change reverted, exactly these four tests fail (34 pass, 4 fail).

**Deferred:** nothing.

**Found elsewhere / generated artifacts:** my change to `bio-plane/src/escalation/index.mjs` stales the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`; BOB regenerates at the layer close): REPORT J1. No other module pins the old id form.

**Tests and checks run**
- `node --test bio-plane/test/m/escalation/`: tests 38, pass 38, fail 0 (baseline before the change: 36 pass, 0 fail).
- Users of escalation, unchanged and green: action-plans 43 pass, monitoring 72, queue-producers 47, queue 76, affordances 133, plane 28; 0 fail each.
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures.
- `node checks/architecture.mjs … escalation`: 12 product files, 45 relative imports; 0 failures.
- `node checks/coverage.mjs … escalation`: 26 of 26 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … escalation tranche/T21`: 4 files changed; 0 failures.

**Read:** my requirements (both parts), layer 9's contract (`build/layers.md`), my module's code and tests whole, my entries in `build/plan/current.md` (rule 1, the L9 roster, the escalation entry), BOB's START. Of my uses' public parts I relied on what my own requirements' Uses state; the change touches no service of theirs.

Size (session_01XnQkJQSGg5SKNNSMx7mZyS): test runs 14, module lines 1554
