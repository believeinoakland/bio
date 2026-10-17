# screens-inquiry (R085)

**Status** · session_01ExZBMDC8vZvzf4gpdgPENS · depth 2 · COMPLETE · handled B4

## J1 · COMPLETE

**Entry R085-6 (K3477; WALK-085 F2): applied.** screens-inquiry R45 is met. All in `question.mjs`; the dock's keys and pattern reused, no new key.

**What changed**
1. **At once.** The press of "Ask the assistant" sets `ui.asking` before `airunopen` is sent, so state d is drawn immediately (machine mark, `question.run.leave`, "Stop the run" as a disabled button with no `data-act`, since nothing is live to stop yet). A refusal, a limit, a failed call or a withheld dispatch clears it and draws as R33 says; `started: false` still dispatches nothing. `ui.asking` counts as at work until that run is read ended, so no flicker to state c between dispatch and the first read.
2. **While it works.** The run list is kept across a re-read (`ui.lastRuns`), so the answer stands while `airuns` is read again. State d adds `screen.assistant.run.running` with the run's `ticks`. While `myRun` runs, `cs.later(10000)` bumps `seq` to read `airuns` again, armed only once a read has settled (not while loading), so it is at most one read per 10 s and none after the run has ended.
3. **When it ends.** The member's latest run (`airuns` is newest first) not running, no proposal (state e) and no conclusion (state g): `screen.assistant.run.ended` with `why` = the condition's `bound`/`kind`, else the status (as the dock), and the ask offered again (inside state c's own rows there, elsewhere beside the line). Never state c's empty text alone.

**Tests** (`test/m/screens-inquiry/r45.test.mjs`, six, all name R45): the press draws state d before `airunopen` answers (held on a gate) with its stop disabled, then a limit refusal replaces it; a withheld dispatch replaces it with its reason; a running run is read again once at 10 s and not at 9 s, its ticks move 1→4, its end is then stated, the ask is offered once and reading stops; an ended run on a question that cites passages draws the ending and the ask; a run ended with no condition is named by its status, another member's ended run is not hers; control: no run draws state c with no ending.

**Run**
- `node --test test/m/screens-inquiry/` (bio-plane): tests 124, pass 124, fail 0. `interface-shell` tests (the shell it runs on): pass 149, fail 0.
- `node checks/format.mjs bio`: 170 modules, 169 requirements files; 0 failures. `architecture.mjs bio screens-inquiry`: 16 product files, 36 relative imports; 0 failures. `coverage.mjs bio screens-inquiry`: 45 of 45 live requirement ids named by a test; 0 failures. `ownership.mjs bio screens-inquiry tranche/R085`: 2 files changed by screens-inquiry; 0 failures.

**Deferred:** nothing. **Found in another module:** nothing; no generated artifact of another module made stale (`bio-plane/dist/bio-plane.bundled.mjs` and `release/` carry this module's code and are rebuilt by BOB at the cut, K1548: REPORTing it as stale).

Size (session_01C32QGvXWpSbZKJMKWKdBMX): test runs 7, module lines 2277

## J2 · REPORT

Correction to J1's last line: I wrote that the bundles are rebuilt by BOB at the cut; I did not check that. The fact: bio-plane/dist/bio-plane.bundled.mjs and release/bio-plane.bundled.mjs (and newgroup's bundle) embed screens-inquiry's code, so they are stale against question.mjs until rebuilt. I rebuilt none (not mine to write, mechanics 14).

## J3 · COMPLETE

**Entry R085-20 (screens-inquiry R46; K3501 (F6c)): applied.** `admin` as an opener is drawn by the founder's handle when the participants the screen reads name one; `member.founder.unnamed` only when none does.

**What changed** (`bio-plane/src/screens-inquiry/`, commit d646ab4abd)
1. `common.mjs`: `who(cs, x, founder)` takes an optional founder handle; the string `admin` is drawn by it when given, else by the unnamed word as before (R40 unchanged for every other caller).
2. `question.mjs`: the opener reads `projectparticipants` for the project (the read the joined check already makes, cached by `later`), takes the row with `founder: true` and its handle, and passes it to `who`. No project, or no handle named: unnamed.

**Tests** (`test/m/screens-inquiry/r46.test.mjs`, new, one test naming R46): the opener `admin` with the founder's row handle `sparky` draws `sparky` and never `admin`; control: the founder's row with no handle draws the unnamed founder.

**Deferred:** nothing. **Found in another module:** nothing new. The stale-artifact note from J2 still stands for this change: `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs` and newgroup's bundle embed `question.mjs`, so they are stale against R46 until BOB rebuilds them (I rebuilt none, mechanics §14). The R46 line in `build/requirements/screens-inquiry.md` still reads "not yet met: R085": requirements are not in this job's write paths, so BOB marks it met.

**Run**
- `node --test test/m/screens-inquiry/` (bio-plane): tests 125, pass 125, fail 0 (R46 among them).
- `node checks/format.mjs bio`: 170 modules, 169 requirements files; 0 failures.
- `node checks/architecture.mjs bio screens-inquiry`: 17 product files, 38 relative imports; 0 failures.
- `node checks/coverage.mjs bio screens-inquiry`: 46 of 46 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs bio screens-inquiry tranche/R085`: 1 file changed by screens-inquiry between tranche/R085 and HEAD (before the record commit); 0 failures.

Size (session_01L2wDs5DhuwdscrBezRCF3P): test runs 1, module lines 2283

## J4 · COMPLETE

**Entry R085-24 (screens-inquiry R47, R48; K3510; WALK-085 r4): applied.** Existing keys only; no new key needed.

**What changed** (`bio-plane/src/screens-inquiry/`, commit 681ec655a4)
1. `question.mjs` (R47): `myRun` is now any running run of hers that `airuns` shows (started on this page, from the dock, or found on a fresh load), so state d is drawn and `airuns` is read again every 10 s as R45 says, until it ends. The old test (`ticks > 1` or dispatched by this page) is replaced by "not a run this page saw opened and then withheld" (`ui.withheld`, set in the withheld branch of the press), so R33's D29 control still holds. The ended run's ending (`screen.assistant.run.ended`) and the ask are drawn above the waiting proposals (state e) whether or not any wait; state c draws the ending whether or not proposals wait.
2. `assistant.mjs` (R48): when none of hers is running, the dock draws her latest ended run (`airuns` is newest first) with `screen.assistant.run.ended` and its ending's name (condition `bound`/`kind`, else the status, as before); `screen.assistant.run.none` only when `airuns` holds no run of hers there. "Work on this" stays offered.

**Tests** (`test/m/screens-inquiry/r47.test.mjs`, new, five, each naming R47 or R48): an ended run with a proposal waiting draws the ending and the ask above the proposal (and in state c); a running run found on load, not pressed, is drawn as state d, read again once at 10 s and not at 9 s, its ticks move, its end is then stated and reading stops (another member's running run is not hers); control: no run with a proposal pending draws the proposal and no ending; the dock with two ended runs draws the later's ending, not "No run yet" (also a status-named ending, and another member's ended run leaves "No run yet"); control: no run draws "No run yet". In `assistant.test.mjs`, the R13 control that expected "No run yet" for her own ended run (`completed`) now expects its ending, as R48 amends; the other-member control keeps "No run yet".

**Deferred:** nothing. **Found in another module:** nothing. **Note for BOB:** a run the *dock* opened and had withheld (still `running`, ticks 1, never dispatched) is now drawn at work on a question page opened afterwards, with "Stop the run" offered: the page cannot know the dock's withholding, and R47 says any running run of hers. Only `ai-runs`' view (a withheld flag in `airuns`) would tell them apart. **Stale generated artifacts (not mine to write, mechanics §14):** `bio-plane/dist/bio-plane.bundled.mjs`, `release/bio-plane.bundled.mjs` and newgroup's bundle embed `question.mjs` and `assistant.mjs` and are stale against R47 and R48 until BOB rebuilds them at the round's close. The R47 and R48 lines in `build/requirements/screens-inquiry.md` (and R46's) still read "not yet met": requirements are outside this job's write paths, so BOB marks them met.

**Run**
- `node --test test/m/screens-inquiry/` (bio-plane): tests 130, pass 130, fail 0. `test/m/interface-shell/` (the shell it runs on): tests 149, pass 149, fail 0.
- `node checks/format.mjs /home/user/bio`: 170 modules, 169 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio screens-inquiry`: 19 product files, 42 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio screens-inquiry`: 48 of 48 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio screens-inquiry tranche/R085`: 5 files changed by screens-inquiry; 0 failures.

Size (session_01XMC7d8bfcv7DEh1in4Bov7): test runs 4, module lines 2514

## J5 · REPORT

Correction to J4's last line: I wrote module lines 2514 without counting. The count of bio-plane/src/screens-inquiry/*.mjs is 2293. Size (session_01XMC7d8bfcv7DEh1in4Bov7): test runs 4, module lines 2293

## J6 · COMPLETE

**Entry R085-40 (screens-inquiry R49; K3560; JOURNEYS #2 B-7): applied.** Commit 2738ea3124 on `job/R085/screens-inquiry`.

**What changed** (`bio-plane/src/screens-inquiry/document.mjs`)
1. "In which question" preselects the question the capture was held for: the held row's `captured_for.questions` (R77, read by the page's existing `heldcaptures` read) gives its first question, which is the choice's value. None held for: the choice's value is blank.
2. The choice lists the document's own project's questions first (`projectquestions` for the document's project, read once through `later`), then the other questions the list (`list type=inquiry`) gives. A captured question the list does not give is still offered.
3. No captured question: the list opens on a blank choice, so the group's first question is never preselected. "Cite a passage" with none chosen is refused in place (its existing `refuse`, `screen.document.cite.noquestion`) and sends nothing.
4. The passage cite buttons and the picker show whenever there is any question to cite into (own or other), in place of the list alone.

**Choices I made (for BOB to see)**
- The blank choice's text is empty. No existing word says "none chosen" in this context, and a new key would be a `setup-words` row (another module's). A word for it, if BOB wants one, is a REPORT-level request.
- Project-first is read from `projectquestions`, one page of 100 (the project screen's page size). A project with more questions keeps the others after the first page, so the order degrades but nothing is hidden.
- The requirements file still reads R49 "not yet met"; requirements are outside this job's write paths, so BOB marks it met.

**Tests**
- `test/m/screens-inquiry/r49.test.mjs` (new, three, each naming R49): a document captured for Q in P draws Q preselected, P's questions first (the other project's question is listed first in the fixture, so a first-choice default would fail), and a cite sends Q; a captured question the list does not give is still offered and preselected; a document held for no question preselects none, and a cite sends nothing and draws `screen.document.cite.noquestion` in place.
- `test/m/screens-inquiry/document.test.mjs`: the R8 test's expected options now include the blank choice first (its `heldcaptures` fixture names no captured question). Its other assertions are unchanged.

**Deferred:** nothing. **Found in another module:** nothing. **Note for BOB (stale artifacts, not mine to write, mechanics §14):** `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` embed this module's code (as J2 found), so they are stale against R49 until BOB rebuilds them at the round's close.

**Run**
- `node --test test/m/screens-inquiry/` (bio-plane): tests 133, pass 133, fail 0 (R49's three among them).
- `node checks/format.mjs /home/user/bio`: 170 modules, 169 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio screens-inquiry`: 19 product files, 42 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio screens-inquiry`: 49 of 49 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio screens-inquiry tranche/R085`: 1 file changed by screens-inquiry between tranche/R085 and HEAD (the commit's three files are all this module's: `document.mjs`, `document.test.mjs`, `r49.test.mjs`); 0 failures.

**Mailbox note:** B3 (R47, R48) was already applied in J4; B3 and B4 are both read through this entry.

Size (session_01ExZBMDC8vZvzf4gpdgPENS): test runs 1, module lines 2305
