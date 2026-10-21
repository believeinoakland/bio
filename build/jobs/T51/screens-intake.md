# screens-intake (T51)

**Status** · session_016TLvaypBQx6X3AHUVwEdcN · depth 2 · COMPLETE · handled B18

## Record

**Entry applied (T51-117):** R38, R39 and R40 on `capture`, `open-file` and `held`; DEC-342; the words findings; the inherited red.

- **R38** (`capture.mjs`): `sendAcquire` now asks `heldat` (`address`, `check: "true"`) before `acquire`, from the press alone (never from "Finish it", "Capture the new copy", the other acts or a page load). Not held: `acquire` goes as R1 says. Held and `unchanged` or `changed`: nothing is sent; the sheet row names the copy (title from the `held_and_vouched` list, `Open it` a reference to `document` at `copy.document`, the member by the handle `memberlist` gives, the day by `cs.date`); `changed` draws the three A64 sentences and "Capture the new copy" (an `acquire` act carrying `data-again`, which skips the look) and "Leave it". Held and `undetermined`: the same row without any claim of unchanged or changed, and the same two acts. A `heldat` refused, unanswered or `held: null` is drawn failed beside the address (the same words rule as the shell's R13, `refusalHtml`), `acquire` is not sent and the act stays usable; while it is out the line says `state.loading`.
- **R39** (`open-file.mjs`): `openoriginal` and `openwithwarning` go through `cs.download` with `verify` the subject's digest; a match says `screen.open-file.digest.checked` then `.opened`; a difference hands nothing over and draws `refusal.DIGEST_MISMATCH`, or `.unheld` when `heldat` by digest (a read, no `check`) says the team holds no such file; the act stays usable. The safe view is not verified. Nothing of the member's is sent or kept.
- **R40** (`held.mjs`, `capture.mjs`): an upload's row reads the row's own `actor`, `retrieved` and `bytes`; the uploader is the handle `memberlist` gives for the stamp's member (never the id; none drawn where the roster does not name them); `collected_since` is no longer used. `bundleFor` and the Unfinished titles read `heldcaptures` with `state: "held_and_vouched"`; "Cite a passage" looks nothing up.
- **DEC-342** (`capture.mjs`): `promoteDocument` no longer falls back to the builder's `detail`; a promotion's refusal is drawn by `refusal.<CODE>` when the table holds it, else the answer's translation, else `refusal.uncatalogued` with the code; the same for open-file's refusals.
- **Words** (4 findings): the five-code hand-list in `capture.test.mjs` is now the screen's own `refusals`; the ops hand-list in `common.test.mjs` is assembled from the open-file screen's own `reads` and `acts`; the two test copies ("Captured for a question you may not see", "It contains a macro.") are neutral fixtures. `capture.test.mjs`:66's regular expression compares with `refusal.HOST_COOLING_OFF` by key.
- Tests: R38 (7 tests), R39 (4), R40 (2, and the R35 tests re-read for R40), refusal-words controls. `heldat` is stubbed in the tests: it is declared in `op-declarations` only by T51-107.

**Fix round FR-26 (SCREENS-INTAKE #10, START B7, CHANGE B8/B9):** entries applied: 1 (R42), 2 (R43), 3 (R44), 4 (R45), 5 (R46), 6 (R47), 7 (R48, built now: the START says B406 is drawn), 8 (R49), 9 (R50), 10 (R51). The new and amended requirement lines are in `build/requirements/screens-intake.md` (R42–R51, each marked not yet met: T51), not here.

- **R42** `capture.mjs`: `checkOutcome(cs, answer, title)` draws `screen.capture.address.checked.{modified,removed,unchanged,unknown}` from `status` and `note`; exported by name from `bio-plane/src/screens-intake/index.mjs` for `screens-inquiry` (the one owner, K4164; carried in `parts` as `capture`'s own are). The four rows are not yet in `words.json` (HANDOFF B419; B10 accepts the `hasWord` tests red by name until they land).
- **R43** new `about-knocker.mjs` (`sourceof` by the capture digest, `sourcerung`, `sourcepublishable`, `memberlist`, `peopledirectory`; `sourcedisclose`, `sourceconsent`, `sourceconsentwithdraw`, `sourcepersonlink`, `writinghelp`); `inbox.mjs` draws `knocksof` ("Other material from this knocker", only where another knock of the secret is in the inbox) and the door to the source.
- **R44** new `leads.mjs` (`lead`, `leadread`, `leadlook`, `leadshare`, `writinghelp`). **R46/R48** new `watching.mjs` (`monitoring`, `monitorpause`, `monitorslate`, `sweeps`; `namedrequests`, `namedrequestset`, `sweepset`, `sweepratify`, `writinghelp`).
- **R45** the render choice and the told-and-unoffered web archive; **R47** the login section (`capturerequests` read; `capturecredentialsupply` then `capturerequestretry`; list and withdraw); **R49** `doneAcquire` asks `heldat` by digest on `existed: true`; **R50** working line, status line under the button, untitled name (kind and site), existed link, `ACQUIRE_TIMED_OUT` by its key; **R51** `held.mjs` "Open it".
- Existing tests changed because behaviour R49/R50 amend: titles of untitled captures (R33 control and its callers: "A PDF from www.example.gov", never the file part), `existed: true` no longer "captured" (the callers script `heldat` by digest or a promotion), `t48` R18 (the credential section is its own, so the capture's acts are counted as the row holding `acquire`), `common` R9 (`capturerequests` is a screen read) and R8/R15 (eight screens), `page.mjs` (registers the owners' new declarations through the harness collector).
- **Not built:** I-34 (progress while a timestamp is made; the act is not identified, as the START says). "A link to another source" is not offered in `sourcedisclose`'s kind choice: the drawing gives it no target field (the inbox's `sourcelink` records a link). "Add another place" is not a button: the places are one to a line.
- **Reds:** see the REPORT (the `hasWord` reds by name, and the reds that are another module's).

**Deferred / reported (REPORT to BOB):**
1. R39's mismatch test (`open-file.test.mjs`, "R39 altered bytes hand nothing over") is red until `interface-shell` R98 (`cs.download`'s `verify`) is merged: the kit in `tranche/T51` ignores `verify`. The match, safe-view and control tests pass because the stale kit hands the bytes over unchecked; after the merge the matching tests prove the check too (their bytes hash to the subject).
2. No word for A64's "captured by <member>, <date>" (`screen.document.capturedby` needs `{source}`), "nothing was added", or the undetermined row's sentence: drawn without them (the unchanged row shows handle · day · "the site still gives the same document"; the undetermined row names the copy only).
3. "Leave it" has its own explanation (`screen.capture.leaveit.help`), but `cs.act` takes no explanation key but `act.<op>.here.<place>` (interface-shell R90) and a Leave it that is an `acquire` act would draw `act.acquire.does`; it is drawn as a quiet link to the same route with the help as its explanation. It clears the row and, as a navigation, the typed address.
4. The design's `mk-data` class (the compared copy's title) is not defined by any served stylesheet (R56 refuses it); drawn with `rec`.
5. `heldat` (`op-declarations`, T51-107) is not declared yet; `check` needs a member session.
6. A29 stays open as the entry says (BOB's, the design's to say whether `document` lists what a captured page lacks).

**Size (session_01XiUV1oniArn1H66oUHgn4p):** test runs 12, module lines 1384

**B12 CHANGE (K4243, SCREENS-INTAKE #11): "Your leads" is `leadlist`.** `leads.mjs` reads `leadlist` (observation-log R20) as its `list` read and draws one row per lead the plane answers (`lead_id`, `words`, `state`), in the plane's order, each with "Open it" (`leadread` by `lead_id`). The page-memory list (`ui.mine`, `ui.pending`) and the stale "The plane lists no leads" comment are gone: writing a lead, a look or a share is followed by the shell reading every read again (the default; no `rereads`), so a lead written in the visit appears because the record lists it. An empty or failed list draws no list (the design draws none; it has no row for an empty "Your leads"). The requirement line is **R52** (new, amends R44; R44's sentence about page memory amended), in `build/requirements/screens-intake.md`, marked not yet met: T51. Tests (`t51-leads.test.mjs`): R52 ×2 (the rows are the plane's, in its order, one per lead; a lead written but not listed is not drawn, control; empty and failed draw no list), and R44's helpers now script `leadlist`. Size and checks in J9.

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

## J7 · REPORT

REPORT (FR-26, found in other modules and in the design; none blocks my COMPLETE):

**Other modules (each shown by a test of mine that is red on `tranche/T51` for that cause alone):**
1. `wizard-scripts` `DECLARED_OPS.writinghelp` accepts `field`, `told`, `draftHeld` but not `op`, which its arm reads (`writingHelp({op, field, …})`, R27: the act the draft is for). Every screen's `{op, field, told}` request therefore fails interface-shell's guard (`FieldMismatch … writinghelp sent op`). Red since before this round: `capture.test.mjs` "R3 R10 writinghelp under the words…" and "…carries the test-instance label…". My three new screens send the same body; their tests only draw the button (`t51-common.test.mjs`). Fix: add `op` to `accepts`.
2. `op-declarations`: `SESSION_OPS.member` and `.admin` do not hold the reads `knocksof`, `leadread`, `monitoring`, `monitorslate`, so `cs.act` draws none of them for a member (their hand rows are `classes: [admin, member]`). Red for that cause alone: `common.test.mjs` "R8 every act … a member's session reaches … every registry act is drawn", R43 "the knocker's other material", R44 "reading it back / recording a look / sharing / the refusals", R46 "an empty list… the list act" and "what is due".
3. `link-sweep` `DECLARED_OPS.sweepset` and `.sweepratify` are mutating with no `needs`: `registerDeclaredOps` refuses them (`NEEDS_MISSING (R80)`), so `OPS` never holds them (my `watching` act list names them, as the registry's owed acts). My test helper adds `needs: "contribute"` and the stamps to those two rows only for the page (`page.mjs`), so the screens' requests are still held to link-sweep's declared fields. Nothing registers the new ops (`capturecredential*`, `namedrequest*`, `sweep*`) for the served plane yet (`registerDeclaredOps` is called by tests only): FR-32's, I assume.
4. `observation-log` has no read that lists a member's leads (`leadread` needs an id): the design draws "Your leads, every lead you can read". The screen keeps the leads written in the visit in page memory and opens one by its id (`/app/leads/<id>`); leads written in an earlier visit are unreachable from the screen. A list read would close it.
5. `interface-shell` has no hook for a refused act: the capture's working line (`screen.capture.address.working`, A1) is cleared when the answer is drawn (`done`) and after 90 s by a page timer; after a refusal it stays up to 90 s. A `failed` hook on an act would end it at once.
6. `interface-shell`'s own test `t50.test.mjs` "R73 … every act of the nine screen modules' real SCREENS composes" is red because of my `capture` and `watching` act lists: the served `OPS` holds `capturecredential*`, `namedrequestset` and `sweep*` only once an owner's `DECLARED_OPS` is registered, and nothing in the process registers them (item 3). It turns green when the plane's assembly (FR-32) or the harness registers them. The other interface-shell reds I compared (acts, frame, kit, session, b17: 12 tests) are the same 12 with my module as the tranche has it.
7. Generated artifact: `bio-plane/dist/bio-plane.bundled.mjs` (the page's source) is stale by this change.

**The design (UX-DESIGN):**
8. Rows I read that `words.json` lacks (J5, J6; B10, B11 accepted them red by name): the four `screen.capture.address.checked.*`; and `screen.about-knocker.{known.head, attribute.label, attribute.occupation, attribute.employer, attribute.role, kind.name, value.label, value.help, knownto.label, audience.member, audience.group, audience.public, evidence.label, confirms.none, consent.detail, person.which, notrecorded}`, `screen.leads.{mine.head, one.head, written, look.head, look.opt.unclear, look.opt.found, look.which, share.head, share.project, state.absent, state.unclear, state.part, state.found}`, `screen.watching.{running.head, running, paused, pause, resume, list.head, counts, slate.head, sweeps.head, sweep.pages}`. **One more than J6 gave:** `screen.watching.project` "Which project" (the named request and the sweep are kept in a project's gathering file; the drawing has no field for which project, and `namedrequestset` and `sweepset` require `bundle`). Not read after all: `screen.capture.cred.askedby` and `.givenby` (J6 proposed them; the login rows draw the member by handle, then the day, with no connecting words).
9. Drawing/owner mismatches I resolved without asking: the sweep's "How often" offers daily, weekly and monthly (link-sweep R1 takes no hourly or none; the drawing offers five); the budget is one field, `per_run`, and `backlog` is sent as ten times it, at most 1,000 (R1 requires both); "Add another place" is not a button (the places are one to a line); "A link to another source" is left out of the disclose form (no target field is drawn; the inbox's `sourcelink` records a link); the render choice's legend "What to keep" has no row on the capture screen, so it reads `screen.watching.sweepdef.match` (same English); "Open the source" has no row, so the door is labelled by the target screen's name `screen.about-knocker.name`.
10. The whole-draw reset of a `cs.choice` to its seeded value after any redraw (a chosen audience returns to "The team" after the first act) is the kit's (R90), not this module's.

The reds this module's own record names for the missing rows (they pass with the rows present, shown by a local overlay of exactly the rows listed above): every test that draws a key of item 7 (R42 ×2, R43 ×3, R44 ×7, R46 ×6, R48 ×2, R26 ×2, R14 "NOT_MONITORED…", R16 "Check it now").

## J8 · COMPLETE

COMPLETE (FR-26, SCREENS-INTAKE #10). All ten entries applied: 1 (R42), 2 (R43), 3 (R44), 4 (R45), 5 (R46), 6 (R47), 7 (R48, built now as the START says the drawing is merged), 8 (R49), 9 (R50; I-34 not built, as the START says), 10 (R51). Pushed on `job/T51/screens-intake` (merged `tranche/T51` @ ed9d7a119b). The new and amended requirement lines are in `build/requirements/screens-intake.md` (R42–R51, each marked not yet met: T51), not in the record; the ownership check lists that one file, accepted at the merge (K4210).

**Exported for `screens-inquiry`:** `checkOutcome(cs, answer, title)`, a named export of `bio-plane/src/screens-intake/index.mjs` (defined in `capture.mjs`), answering the HTML of the sentence for the check's `status` and `note`; also carried in `capture`'s `parts`. It reads `screen.capture.address.checked.{modified,removed,unchanged,unknown}`.

**New screens** registered in `SCREENS` (eight now): `about-knocker`, `leads`, `watching`. The inbox gains `knocksof` and the door to the source.

**Tests and checks** (clean tree, no overlay): module tests 177, pass 149, fail 28. The 28 are, by name:
- *Accepted red until the design's rows land (B10, B11; HANDOFF B419, B423):* every test that draws a key of REPORT item 8: R42 ×2, R43 "nothing known / recording what became known / what became known and how", R44 ×7, R46 ×6 (the list, pause and resume, the non-administrator, the sweeps, an empty list, what is due: the last two also red for item 2), R48 ×2, R26 ×2 (each screen's keys are words; the capture screen's keys), R14 "NOT_MONITORED…", R16 "Check it now". With exactly those rows added by a local overlay (not committed) every one of them passes.
- *Another module's, REPORT items 1–3:* R3 ×2 (`writinghelp` declaration omits `op`), R8 "every registry act is drawn / a member's session reaches" and the tests above that also need `knocksof`, `leadread`, `monitoring`, `monitorslate` in `SESSION_OPS`.
With the rows and those four reads present (both overlays) the module is 175 pass, 2 fail (the `writinghelp` pair only).
`format` 0 failures; `architecture screens-intake` 0 findings; `coverage screens-intake` 50 of 50 ids named; `ownership` one file (the requirements file, above); `checks/run.mjs`: words shows only `missingkey` for the keys of REPORT item 8 (6 literal keys in my tests), no `inline`, `copy` or `marker` for my files (I fixed a `testcopy` of mine). Existing tests changed for behaviour R49/R50 amend are listed in my record.

**Not done, by the START or by an owner:** I-34 (progress while a timestamp is made; the act is unidentified). The `interface-shell` and other reds in REPORT (J7). Entry 7's `writinghelp` is under the request's description only.

Size (session_0135JUZBcFJA8xpZHnkjPVFw): test runs 48, module lines 2155

## J9 · COMPLETE

COMPLETE (B12, K4243, SCREENS-INTAKE #11). "Your leads" is drawn from `leadlist`: `leads.mjs` reads it as `list`, draws one row per lead the plane answers (in its order, "Open it" by `lead_id`), and keeps no list of its own. The page-memory list and the "plane lists no leads" comment are removed; a lead written in the visit appears because the shell reads every read again after the act. An empty or failed list draws no list (the design has no empty-state row for it; reported, nothing invented).

**Requirement id for BOB: R52** (new, amends R44), in `build/requirements/screens-intake.md`, marked not yet met: T51. Tests: R52 ×2 in `t51-leads.test.mjs` (rows as the plane answers; control: a lead the viewer may not read, not listed by the plane, is not drawn, even when just written). Checks: format 0 failures; architecture 0; coverage 51 of 51; ownership 0 failures; words: only the 6 missingkey lines already in J8 (not mine to add).

Module suite: 179 tests, 156 pass, 23 fail. All 23 are the reds J8 named: the design's missing word rows (HANDOFF B419, B423; accepted by B10, B11), now including `screen.leads.mine.head` and `screen.leads.one.head`, which the leads tests read; and other modules' (writinghelp `op`, SESSION_OPS reads, link-sweep needs). With a local, uncommitted overlay of those two rows plus `screen.leads.state.unclear`, all 9 leads tests pass.

Size (session_01BrnZiLD3xe4Eof2hHkGjyT): test runs 8, module lines 2145

## J10 · COMPLETE

COMPLETE (B13, K4246, SCREENS-INTAKE #11). The R8 test "every act names one op OPS holds and a member's session reaches" now asks reach by interface-shell R12's rule: a mutating op by `SESSION_OPS.member`, a read by `OPS[op].classes` including member (both read from op-declarations' exports; no hand list). It passes.

Suite: 179 tests, 157 pass, 22 fail. Every remaining red is a missing design row (UNKNOWN_WORD, or the raw key drawn/asserted for a row that does not exist): `screen.capture.address.checked.{modified,removed,unchanged,unknown}` (R14, R16, R26 capture, R42 x2); `screen.about-knocker.*` (R43 x3); `screen.leads.{mine.head,one.head,...}` (R44 x4, R52 x2); `screen.watching.{running.head,running,pause,resume,sweep.pages,...}` (R46 x5, R48 x2); R26 "each screen's words" (all the above). Checked: no red has any other cause. R52 stays as written (still in the requirements file; BOB's "struck" may mean otherwise: say if it should move).

Size (session_01BrnZiLD3xe4Eof2hHkGjyT): test runs 12, module lines 2145

## J11 · COMPLETE

COMPLETE (B14, K4248, SCREENS-INTAKE #11). `tranche/T51` merged (the design's rows regenerated). Module suite: 179 tests, 179 pass, 0 fail: every red I named as a missing row is green. Checks: format 0 failures; architecture 0; coverage 51 of 51; words 0 failures (missingkey 0); ownership 0 failures (2 files: the requirements file and tests); `setup-words build --check` clean. `checks/run.mjs` over the whole tree shows failures only in other modules (agent-harness, agent-runner, installer-steps, journey-check coverage; op-grades testcopy), none naming screens-intake.

Also drawn now, from the design's new rows: `screen.capture.cred.askedby` (the turned-away row: member, day, tries) and `.givenby` (the stored login's row); `screen.watching.sweep.pages.one` for a budget of one page. Not drawn: `screen.capture.cred.given.summary` ("Once a login has been given"): the drawing wraps a just-given login's row in a details after the supply; this screen draws the stored login in its own row (list and withdraw) and keeps no separate just-given row. Say if it should be added. R52 stays as written in the requirements file.

Size (session_01BrnZiLD3xe4Eof2hHkGjyT): test runs 17, module lines 2150

## J12 · REPORT

Found while completing B15 (checks/run.mjs over the whole tree). None is in screens-intake; none is changed by this job.

1. screens-inquiry: coverage names R110 and R119 by no test. R119 is the requirement moved to screens-intake as R53 (K4258). Please retire the screens-inquiry R119 line, or the coverage check keeps counting it.
2. Coverage, other modules: agent-harness R17; agent-runner R37, R38, R40; installer-steps R26, R31; journey-check R19. Each is named by no test under its module's tests path.
3. Words, other module: op-grades bio-plane/test/m/op-grades/t37.test.mjs:32 is a testcopy finding ("translation-directed: keyed by a language and an interface word").
4. Generated artifacts made stale by this job's source change: bio-plane/dist/bio-plane.bundled.mjs and release/bio-plane.bundled.mjs both carry screens-intake's open-file.mjs. Not regenerated here (manifest §14); to regenerate at layer close.

## J13 · COMPLETE

COMPLETE (B15, K4260, SCREENS-INTAKE #12). R53 met.

Entry applied: R53 (moved from screens-inquiry R119). `open-file.mjs`: each scan note is drawn as `screen.open-file.note.line` with its tool from `screen.open-file.tool.<tool>` and its result from `screen.open-file.result.<result>`, never the raw values; a key the words do not hold draws `shell.unread`; only a note that has scanned draws its engine, version and date. `index.mjs`: the open-file reads list names the five new keys (`screen.open-file.tool.clamav`, `screen.open-file.result.{clean,found,failed,not_scanned}`). Commit f21b6306d8 on job/T51/screens-intake.

Tests (written first; the two R53 tests fail on the pre-change code and pass now): R53 each result draws its line by key (control: no raw result); R53 engine, version and date on a scan that ran, none on not_scanned, and an unknown tool draws shell.unread. The R5 fixture now names the tool as the plane does (`clamav`), not the display name.

Suite: `node --test bio-plane/test/m/screens-intake/` 181 tests, 181 pass, 0 fail, 0 skipped.

Checks (from civicos-process, product /home/user/bio): format 0 failures; architecture 0; coverage 0 (52 of 52 live ids named by a test); ownership 0 failures (4 files: the three code files and the job record, all in the module's paths); `checks/run.mjs`: words 0 findings for screens-intake; failures only in other modules, reported in my REPORT.

Deferred: none. Other-module findings and one stale generated bundle are in my REPORT.

Size (session_01VMaZFp9WEEsWKQj2NDgzHf): test runs 4, module lines 2163

## Fix round 2 (SCREENS-INTAKE #13, START B16 / CHANGE B15; model sonnet, medium)

**Entries applied:** R49 (C9, C10), R50 (C11), R53 (met by the code already on the branch; its tests are `open-file.test.mjs`), R54 (C25), and the causes C14, C23, C28 (the part the plane allows), C29, C45, C78, C90, C91, DEC-394 (3b) and (3c), CAUSE-CAPTURE-T51 J2 (draw `render_pending` and a pending attestation, `capture.file_name`, pickers).

- **C9 / C10 (R49)** `capture.mjs` `doneAcquire`, `doneUpload`, parts `homeOf` and `refusedHtml`. `existed: true` asks `heldat` by digest (no `check`) through `homeOf`; a document the viewer sees is linked and nothing is written. `acquire` already carries the question as `for`, and acquisition R47 records the ask (`recordCapturedFor`) also when `existed` is true, so the screen sends no second record. None that shows: the address arm promotes (as before); the file arm promotes when the answer carries the document, else writes nothing (see report 1). `CAPTURE_HELD_BY_ANOTHER_BUNDLE` names the holder and links it (title read from its bundle, `shell.card.document` where unreadable) when the promotion's refusal carries `holder`; without it, the sentence alone.
- **C11 (R50)** `failedAcquire` clears `working`; `acquire` re-reads only `open`; every other act of `capture` names the reads it changed (`rereads`).
- **C14 (R77, R88)** `capture` reads `heldcaptures` once with `fields: "picker"` (`state: held_and_vouched`, limit 200); no act re-reads it. `held` reads its two lists (held, set aside) once each; `heldcaptures` and `release` re-read only `held`. `todos.mjs`, `grouprules.mjs` and `money.mjs` are other modules' files (screens-daily, screens-settings, screens-investigate): their wave-2 jobs hold C14's rest.
- **C23 (R4)** `held`: opened for a project (`/app/held/<PROJ-…>`) both lists read `heldcaptures` with that `project`; a row's project name opens that filter and the filter has a way back (`screen.held.name`); each held row says `state.item.review.name`. The squeezed "Open the file" control is CSS (C81, `cause-shell-t51`).
- **C25 (R54)** `titleOf`: reading title, else the document's stated title, else its file name (`capture.file_name`, an upload's `name_stated` or its own name), else `document.untitled.web` (host and day); `screen.held.untitled` where there is no host. R50's kind-and-site sentence is replaced (its keys leave the screen's list). An upload uses the same function.
- **C29 (R3)** the testimony's result links the document (`cs.ref`), named by the first of the member's own words; no id, no link, and no blank.
- **C45 (R25)** "For which question" names the question by its title (the one read for the routed question, else the search hit's), else `shell.card.question`.
- **C78 (R47)** the explanation of "Show the stored logins" is the next thing under that button, before the list.
- **C90 (R46)** "Pause the watching" / "Resume" only for `view.me.administer === true`; the state is said to all.
- **C91 (R44, R46)** `capture` draws doors to `/app/watching` and `/app/leads` (`screen.watching.name`, `screen.leads.name`) when `cs.can("capturerequest")` (a member or administrator who may act on the record).
- **C28 (R7, R32)** the knock's detail shows its fingerprint under `screen.document.fingerprint`. The rest of C28 is not the screen's (reports 2 and QUESTION).
- **J2** `render_pending.note` and a pending attestation's note are drawn in the plane's own words under the result; the finishing of a render continuation is "Finish it" (R31), the capture session being in `opencaptures`.
- **DEC-394 (3b)** met by R47 (supply, list, withdraw on `capture`; keys `act.owed_capturecredential….label.capture` as they are); tests `t51-credentials.test.mjs`. **(3c)** new, below.

**Requirement lines for BOB to fold** (none written in the requirements file by me):
- **R55** (DEC-394 3c; `capture-requests` R23; amends R47) `capture`'s address tab lists the member's own capture requests (`capturerequests`, the one read that also serves R47) under `screen.capture.later.head` with `.about`, each with its address, the day asked and its state: `requested` or `draining` as `screen.capture.later.waiting`, `captured` as `.captured`, `refused` as `.turned`; a request another member asked, an `expired` one and an empty list are not drawn. Test: `t51-fix2.test.mjs` "R55".
- **R56** (C91; amends R44, R46) `capture` draws a door to `watching` and to `leads` (`screen.watching.name`, `screen.leads.name`) for a viewer who may act on the record; none otherwise. Test: "C91".
- **R4 amended** (C23) `held` opened with a project subject reads that project's captures; a row names its state by `state.item.review.name`; a project name opens the filter.
- **R7/R32 amended** (C28) a knock's detail shows its fingerprint (`screen.document.fingerprint`).
- **R3 amended** (C29) the testimony's result links the document. **R25 amended** (C45) the question is named by its title. **R47 amended** (C78) the note under "Show the stored logins". **R46 amended** (C90) pause and resume are an administrator's. **R50 amended** (C11) a refusal clears the working note at once and stays drawn. **R40 note**: `bundleFor` still reads `heldcaptures` in full (it needs the source address, which the picker does not give).

**Tests changed because a requirement was amended** (not weakened): the R50 untitled sentence (kind and site) is R54's host and day in `capture.test.mjs` (R33 control, the slug of the bundle id), `t51-capture.test.mjs`, `t51-check.test.mjs`; the testimony's sentence now links (`capture.test.mjs` R3); `common.test.mjs` R8 (an act may name the reads it changed); `t51-credentials.test.mjs` R47 (the paywall request is now in the member's "requests for later", so the control is about the login section); `t51-watching.test.mjs` R46 (the pause is an administrator's; the refusal test is for an administrator who has lost standing).

**Words I needed and did not find (QUESTION):** see the QUESTION. Drawn from existing keys: doors, the other-home link, the filter's way back.

**Reports (other modules, P9):**
1. `capture` R86: `captureupload` answers `existed: true` with no `document` even when the record holds only a receipt and no home (the interrupted upload of C10), so the screen cannot file one for the viewer; it files when the answer carries the document and links a visible holder. Proposed: answer the document (as a new upload's) when `holds.registered` is not true.
2. `doorbell`: a knock stores no file name or type and no read gives its bytes before the pull, so C28's name, type and safe view cannot be drawn; "put back" (`inboxresolve` to `new`, `doorbell` R3) is served but has no word for its button.
3. `capture` R77: a held row does not say its capture has no object under its fingerprint (parts-only past 32 MiB); the screen cannot withhold vouch or OCR from it. Proposed: a field on `capture` (`whole: false`).
4. `capture` R40/`bundleFor`: `heldat` by address would give the copy's document at the cost of one look instead of a 1000-row list; R40 names the list.
5. The Held list needs each row's grade, so it cannot use the picker read: it reads two full lists of 50.
6. `screens-inquiry` suite on `tranche/T51` already has three reds (R10 document and entry 25 acts, R5 R14–R16 acts: `contradictionflag` in the registry); same on an untouched checkout of the tranche.
7. Coverage reds in the process checks are other modules' (agent-harness, agent-runner, control-plane, installer-steps, journey-check, screens-inquiry R123–R125).

**Checks:** `node checks/run.mjs`: format 0, architecture 0, words 0 (screens-intake), coverage: screens-intake not listed among its 6 failures; ownership: 14 files, 0 failures.
**Suites:** screens-intake 201 of 201; screens-inquiry 410 of 413 (the three are on the tranche untouched); control-plane 324 of 324.

**Size (session_016TLvaypBQx6X3AHUVwEdcN):** test runs 9, module lines 2233

## J14 · QUESTION

QUESTION (fix round 2; no answer is needed to finish what is done): words and two decisions for C28 and C10, my best reading first.

1. C28, the inbox. The plane stores no file name or type for a knock and gives no read of its bytes before the pull, so the screen can draw the fingerprint (done, `screen.document.fingerprint`) but not name, type or a safe-view door; that is a doorbell change (REPORT 2 in my record). "Put it back" (`inboxresolve` to `new`, doorbell R3) is served by the plane; the screen has no word for its button, and `act.inboxresolve.label.inbox` ("Discard with a reason") and its explanation would mislead. Keys I need written: the button and its explanation for putting a discarded knock back (suggested `act.inboxresolve.label.inbox.putback` with its explanation), and the sentence after it is done. I will draw it when they exist.
2. C9: the other-home refusal has no `{holder}` in `refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE`; I draw its sentence and then a link to the holder named by its title, built only from existing keys. If you want the holder inside the sentence, the key needs a `{holder}` fill.
3. C23, Held's project filter has no label word; I opened it from the project name in each row (a link to `/app/held/<project>`) with `screen.held.name` as the way back. A drawn "All projects / Project" choice would need its keys.
4. C10: `captureupload` answers `existed: true` without a document, so the screen can link a visible holder but cannot file a document for the viewer when none shows (REPORT 1). Do you want `capture` R86 to answer the document in that case (my proposal), or is the link enough?

## J15 · COMPLETE

COMPLETE (T51 fix round 2, B15 and B16). Causes met: C9 and C10 (R49: a visible holder is linked and nothing written; `for` rides on acquire so the plane records the ask; the other-home refusal names and links the holder; the file arm files only when the answer carries the document, REPORT 1), C11 (R50 `failed` hook), C14 my part (R77/R88: one picker read on capture, acts re-read only what they changed; Held reads its two lists once), C23 Held (R4: project filter, one state word), C25 (R54: title, file name, host and day), C29, C45, C78, C90, C91, C28 the fingerprint (the rest is the plane's and needs words: QUESTION J14), DEC-394 (3b) (R47 as built, tested) and (3c) (R55 new), J2 (render_pending, pending attestation, file_name, pickers). Requirement lines for you to fold are in my record (R55, R56 and the amendments of R3, R4, R7/R32, R25, R46, R47, R50). Suites: screens-intake 201 of 201; control-plane 324 of 324; screens-inquiry 410 of 413 (the three reds are on an untouched tranche/T51 too: registry acts, `contradictionflag`). Checks: format, architecture, words 0 findings for my files; coverage lists none of mine (the six reds are other modules'); ownership 14 files, 0 failures. Reported to you (details in my record): capture R86 existed answer carries no document; doorbell stores no name or type and no pre-pull read; capture R77 has no field for a capture with no object under its fingerprint (so vouch and OCR cannot be withheld); bundleFor could use heldat; Held needs the full read for grades. Not mine: todos.mjs, grouprules.mjs, money.mjs (C14's rest, wave 2 jobs of screens-daily, screens-settings, screens-investigate). Tests I changed because requirements were amended (R54, C29, C90, R8's act re-reads) are listed in the record.
Size (session_016TLvaypBQx6X3AHUVwEdcN): test runs 9, module lines 2233

## B17 CHANGE applied (CONTROL-PLANE #43, K4326)

`acquire`'s `ACQUIRE_TIMED_OUT` is drawn by what the 504 says it `kept`: `held` and `undetermined` by `refusal.ACQUIRE_TIMED_OUT.held` / `.undetermined`, anything else by the base `refusal.ACQUIRE_TIMED_OUT`. Those two keys are not yet in the word table, so the screen falls back to the base words until they are (its test asserts the keyed word once `hasWord` holds it; the keys are not in the screen's word list yet, because the words check refuses a listed key the table lacks: add them to `SCREEN_KEYS.capture` when the rows exist). Also from the merge: the registry now lists `capturerequests` on `capture` (DEC-394 3c): "Show my requests for later" (`act.capturerequests.label.capture`) is drawn and re-reads the list. screens-intake 202 of 202; format, architecture, words 0.

## J16 · COMPLETE

COMPLETE (B17 applied): ACQUIRE_TIMED_OUT drawn by kept (held/undetermined keys fall back to the base words until the rows exist; add them to SCREEN_KEYS.capture then); the merged registry's capturerequests act is drawn. screens-intake 202 of 202; format, architecture, words 0; ownership 0. Size (session_016TLvaypBQx6X3AHUVwEdcN): test runs 5, module lines 2245

## B18 ANSWER applied

Put-back (C28): a discarded knock offers `inboxresolve` to `new` (the shell asks the reason) labelled `act.inboxresolve.label.inbox.putback`, drawn only once that row exists in the word table (until then no raw key is drawn; the test branches on `hasWord` and must be re-read when the row lands, the done sentence's key was not named so none is drawn). Link-enough for C10 and the Held filter accepted. Waiting for CAPTURE #41 and DOORBELL #5 (name, type; `whole: false` withholding of vouch and OCR): a CHANGE then. screens-intake 203 of 203; format, architecture, words 0; ownership 0.

## J17 · COMPLETE

COMPLETE (B17 and B18 applied): put-back of a discarded knock drawn once act.inboxresolve.label.inbox.putback exists (no raw key before); B17 as J16. Waiting for CAPTURE #41 and DOORBELL #5 (CHANGE then). screens-intake 203 of 203; format, architecture, words 0; ownership 0. Size (session_016TLvaypBQx6X3AHUVwEdcN): test runs 3, module lines 2250
