# screens-intake (T51)

**Status** · session_0135JUZBcFJA8xpZHnkjPVFw · depth 2 · WORKING · handled B11

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

**B5 CHANGE applied:** `tranche/T51` merged (interface-shell R90–R103 with `cs.download` `verify`, op-declarations, the registry); no local stand-in of a provider remains. The suite now runs against the real providers: 123 of 123 pass (three runs; one earlier run showed a single timing flake in the promotion test of R1/R21, green on every re-run). R39's mismatch test passes against the real kit. Checks: words 0 failures (module, and no line naming it over the whole tree), format, architecture, coverage (40 of 40) and ownership clean; `setup-words build --check` reports stale rows of another module (op-declarations), none naming this module. Size (session_01XiUV1oniArn1H66oUHgn4p): test runs 19, module lines 1388

## J3 · COMPLETE

COMPLETE (T51-117), B5 applied. `tranche/T51` merged; the suite runs against the real providers: 123 of 123 pass (R39's mismatch test now proves the digest check through the real `cs.download` verify; one earlier single run showed a timing flake in the R1/R21 promotion test, green on every re-run). Words check 0 failures (module, and no line naming it over the whole tree), format, architecture, coverage (40 of 40) and ownership clean; the setup-words stale-rows note names op-declarations' rows only. Record: `build/jobs/T51/screens-intake.md`.

**B6 CHANGE applied (K4094):** `held` drew a project by its record id (`screen.held.project` filled with `r.project`, a PROJ id with its slug) and an unnamed archive file by its document id. A row now names its project by the name `projectlist` gives (a new read), a project the list does not name is not drawn at all, and "no project" is said only for a row with none; an archive's file with no name is `screen.held.untitled`. Test "B6 …" with its controls. 124 of 124 module tests pass; words 0 failures, coverage 40 of 40, architecture and ownership clean. Size (session_01XiUV1oniArn1H66oUHgn4p): test runs 22, module lines 1400

## J4 · COMPLETE

COMPLETE (B6, K4094). held no longer draws a slug: a row names its project by the name projectlist gives (a project it does not name is not drawn, never its id), and an archive file with no name is screen.held.untitled, never its document id. Test B6 with controls; 124 of 124 module tests pass; words 0 failures, coverage 40 of 40, architecture and ownership clean.

## J5 · QUESTION

Entry 1 (C55, R42) needs four member-facing sentences that no drawn row holds. I searched `words.json` and `rows.mjs` (keys under `screen.capture.address.*`, `screen.document.monitor.*`, `monitoring.*`): the only drawn one is `screen.capture.address.checked` ("Checked {title} just now…"), which is today's single answer. The `monitoring.note.*` rows are the plane's own notes, already English in the answer, not drawn rows. Words rules (K3810, DRAWN_MODULES) forbid me `localize` in a screens module and forbid inventing a sentence on a drawn screen.

My best reading, which I am building now: four keys in place of `screen.capture.address.checked`, chosen by the answer's `status` (modified / removed / unchanged, any other or none = could not be told), each with `{title}`, the last also with `{note}` (the plane's note, drawn as record data):
- `screen.capture.address.checked.modified`: "Checked {title} just now: the page reads differently from the copy your team holds. Nothing was captured; capture it again to keep the new copy."
- `screen.capture.address.checked.removed`: "Checked {title} just now: the site no longer gives this page. The copy your team holds is kept."
- `screen.capture.address.checked.unchanged`: "Checked {title} just now: the site still gives the same document your team holds."
- `screen.capture.address.checked.unknown`: "Checked {title} just now, but it could not be told whether the page changed: {note}"

Please have UX-DESIGN write these four rows (or give the rows they prefer) into `words.json`; I will use the keys as I give them and rename on your word. `screens-inquiry` will import one exported function, `checkOutcome(cs, answer, title)`, returning the sentence's HTML; it is carried in a screen's `parts` as `capture.mjs`' own parts are. Until the rows exist my R42 tests cannot pass `hasWord`; I carry on with the other entries and will post BLOCKED (cause: needs Bob? no: needs the design's rows) only if they are still absent when everything else is done.

## J6 · QUESTION

Entries 2, 3 and 5 (R43, R44, R46) and entry 6 (R47): the drawn screens `about-knocker`, `leads`, `watching` and capture's login section have **headings, field labels, options and status words that no word row holds** (DEC-375/381 wrote the sentences, not these labels; `mock-screens.js` draws them inline). K3810 and the words check (`DRAWN_MODULES`) forbid me to write them, so I need rows. I compared every English literal of the four drawings with `words.json` (rows I could reuse with the same English are used already). Missing, with the key I will read them by, English exactly as drawn, so UX-DESIGN can add them under these keys or tell me theirs; I rename on your word:

about-knocker: `screen.about-knocker.known.head` "What became known"; `.attribute.label` "Which attribute"; `.attribute.occupation` "Occupation"; `.attribute.employer` "Employer"; `.attribute.role` "Role"; `.kind.name` "A name"; `.value.label` "What it is"; `.value.help` "At most 400 characters."; `.knownto.label` "Who knows it"; `.audience.member` "One member"; `.audience.group` "The team"; `.audience.public` "The public"; `.evidence.label` "Your evidence"; `.confirms.none` "No claim"; `.consent.detail` "Which detail"; `.person.which` "Which person"; `.notrecorded` "not recorded".
leads: `screen.leads.mine.head` "Your leads"; `.one.head` "One lead"; `.written` "Written by you on {date}"; `.look.head` "Record a look"; `.look.opt.unclear` "Could not tell"; `.look.opt.found` "It is there"; `.look.which` "Which one"; `.share.head` "Share it with a project"; `.share.project` "Which project"; the four result words as the list shows each look (drawn once: "We looked and could not tell"): `.state.absent`, `.state.unclear` "We looked and could not tell", `.state.part`, `.state.found` (the other three are not drawn; please word them).
watching: `screen.watching.running.head` "The watching"; `.running` "Watching is running."; `.paused` "Watching is paused."; `.pause` "Pause the watching"; `.resume` "Resume the watching"; `.list.head` "Every watched address"; `.counts` "{due} due now · {scheduled} scheduled · {unscheduled} not scheduled · {ended} ended"; `.slate.head` "What is due"; `.sweeps.head` "Sweeps"; `.sweep.budget`/`.sweep.pages` "{count} pages".
capture's login section: `screen.capture.cred.askedby` "Asked for by {name}, {date} · tried {count} time(s)"; `.givenby` "Given by {name}, {date}".
Also for C55 (my J5): the four `screen.capture.address.checked.*` rows.

Until the rows exist my tests for these cannot pass `hasWord`; I build everything else, and if they are still absent when the rest is done I post BLOCKED (cause: needs the design's rows) rather than invent a sentence.
