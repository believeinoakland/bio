**Round** · R1 · layer 1 CLOSED · layer 2 CLOSED · layer 3 CLOSED · layer 5 OPEN · layer 6 OPEN · layer 8 OPEN · layer 9 OPEN · layer 10 OPEN · layer 11 OPEN
# Plan T52 · the beta (K5257)
**Status** · OPEN · BOB #319 · session_018Bhced5gpDxaidQNabEbp6 · depth 1
**Jobs** · entities: ENTITIES #1 session_018BhcecQhnVK36CsiRUDvsz; events: EVENTS #1 session_018BhcefVAkEW3F8ikST3nS6; money: MONEY #1 session_018Bhcef9ixS7sA7mnPM5bZx; explore: EXPLORE #1 session_018BhcefeUbMPbsVYnH7PqGj; query-language: QUERY-LANGUAGE #1 session_018Bhced7XwxHM61Lrxj2vxC
**Owed** · none

T52 is the beta, with all of its requirements (Bob, K5257). Its rounds are written from `next.md` and the 0.87.0 walk's placement (K5354); R14 (civicos-process PR #13) is adopted before its first test run (K5351).

# Plan: T52 round R1 · the beta's first round, every entry that can now be done

**Status** · Written by a planning worker for BOB #318 on 2026-10-27, to be opened with `proc round open --round R1 --plan build/plan/T52-R1.md`. T52 is the beta, with all of its requirements (Bob, K5257). 0.87.0 is released and deployed (K5350), so every "after the alpha" and "after the release" reason in `next.md` has lapsed; the round carries each entry that can be done (P19). Each entry left out is at the end, with its one hard reason. Read whole to write it: `next.md`; the walk's placement in `build/plan/walk-T51b-live/` (PL1 `placement-entries-1.md` W1-W16, PL2 `-2` W17-W28, PL3 `-3` W29-W33, PLB `placement-boundaries.md`, PLD `placement-design-unknown.md` for DS and U items); the T52 marks in the requirement files (K5342).

**Reading an entry.** A `W#` entry keeps only its cause lines; the walker's case, the code lines and why the tests missed it are in the PL file's section W#, read whole at START. Every cause: the red test first through the walker's real entry (`fix-round.md` (3)), K4426's four. `first: settle X` = the placement could not prove the cause (PLD section 4): the job's first act is that read or measurement, a diagnosis file with a reproduction (K4428) before any fix, or a record that nothing is wrong. `[waits: X]` = that part is left out (list at the end); the rest of the entry is done. A sentence the design does not hold is REPORTed, never written (K3930); BOB regenerates `setup-words` at each design merge. `after W#` = the job uses that entry's result: an earlier layer is merged first, the same layer BOB carries it (P10).

**BOB's acts, not module entries** (before R1 opens, or alongside): (1) before each layer's START, writes the requirement lines the entries name (C-12.2's key family; the releasable-bundle helper; `entities` for names with no reference; each id an entry cites) and folds the design rows now on `main` that they cite (DEC-412 (3) (4), DEC-414, DEC-415, DEC-416, DEC-443; K945); (2) sends PLD section 3 (35 items) and the screen questions C-K2, C-K6, B-K19, D-K9, E-K7 to UX-DESIGN as the one HANDOFF (B541); (3) runs K4599's throwaway test of a multi-read op for the Project screen on a scratch copy, never biosmoke8, timed from outside, and gives the figures to layer 11's jobs at START; (4) settles U5 early (the bytes of capture `9dce360a…` through the pinned converter, see file-safety), so that a `file-scanner` cause joins layer 1's START; (5) the §5.10 pass of fix round 10 (items 101 (4), 122 (3), 127 (3), 128: marker re-points, the `DECLARED_OPS` rename, orphan runs, node-vs-null assertions; the 89 fixtures lines), one pass while no job runs; (6) `deploy-test.yml` (cannot start a fresh copy; on the shared account a copy's member run re-points the one `agent-worker`, K5350): a fresh copy goes through the installer, or the workflow refuses a copy without a store; CI is BOB's; (7) T52's redeploy and the measuring walk after the last layer closes. R14 is adopted (K5351): a test run reports a missing result with its cause.

## Legacy census

`modules.json` marks no module legacy and holds none (178 modules, none with `from`). `layers.md`: `legacy-checks`, `legacy-store`, `legacy-index`, `legacy-tests` retired (K858, K1006); `legacy-ui` retired at T51 (T51-126, K4100), `civicos-ui/` gone. No legacy module remains; no entry retires one; no hard reason is needed.

## Layer 1

**setup-words**
- T52-1 · K5339 red · R13 (`inquiry.index.pass_grounds_an_array`'s braces, a design-stream row, `fix-round-10-words.md` item 95): first: settle the cause, then fix it.

**record-grammar**
- T52-2 · W1 · D-K1 · BLOCKER · C-12.2 accepts every history key the manifest lists (connections writes `<stamp with ms>_links_<hex>`), so a case resting on a capture whose page links to a held document signs; history is never rewritten (BOB's ruling of the placement, PLB BQ1). Add the C-12.2 test over every `snapKey:` writer (connections `_links_`, strength `_bar`, investigation `_plan`/`_close`, contradiction `takeup_`/`resolve_`). `case-checker/program.mjs` is regenerated, never hand-edited. PL1 W1.

**format-registry**
- T52-3 · K5339 red · R31 (SHEET C32 C33 C23 C24: delimited text read as a sheet): first: settle the cause on the tranche tip, then fix it.

**pdf-pixels**
- T52-4 · W2 · C-K13 · MAJOR · a faint receipt read as a PDF is refused `NOTHING_TRANSCRIBED` as a PNG (`preparePicture` sets `text_found:false`). First: settle which test inside `preparePicture` trips on `c087-faint-receipt.png` (generated; log `lines` and `median`). Green: the PNG returns the PDF path's text. PL1 W2.

**pdf-worker**
- T52-5 · K5339 red · `structure.test.mjs`: first: settle the cause, then fix it.

## Layer 2

**member-roster**
- T52-6 · W3 · A-K6 tally · MINOR · `memberList` returns a proposed administrator's row with the endorsers and the administrators still awaited (`endorsedBy`, `endorsementsOwed` exist): member-roster R83 (K5369). PL1 W3.

**membership**
- T52-7 · W4 · A-K8 (b)(c) · MINOR · `projectInvite` answers a distinct code for invited-not-joined, and checks `founderHandle()` first ("that is you / already an owner"); `memberByHandle` stays (R48): membership R157 (K5369). The owner-add arm `project-roster/index.mjs:295` has the same shape: it joins only if the red test reaches it. Words owed. PL1 W4.

**project-roster**
- T52-99 · MEMBERSHIP #1's finding (W4's owner-add arm, PL1 W4 (c)) · MINOR · `projectOwnerAdd`, `projectOwnerRemove` and `projectOwnerRescue` resolve the founder's handle to the founder: project-roster R45 (K5373).

**promotion**
- T52-8 · K5339 red · `row-census.test.mjs`: first: settle the cause, then fix it.

## Layer 3

**provenance**
- T52-9 · W5 · B-K1 · BLOCKER · one helper files a releasable bundle (canonical dataset with its own `content_hash`, `data/dataset.json`, the `snapshots/` file, the chain), with `screens-intake/capture.mjs:141-189`'s dataset shape (copied, not moved: that file is served to the browser and stays as it is; BOB's, K5370): provenance R81; the testimony filer (`provenance/index.mjs:2010-2018`) calls it. `ratification/release.mjs:195-201` is right and untouched. Tested through the real entries: a pulled knock, an unpacked archive member, a testimony each vouched ("Vouched for by …"); control: an upload. W22 (store-door) and W33 (control-plane) call it. PL1 W5.

**acquisition**
- T52-10 · N1261 · K4459 · `checks.mjs:362` reads `refusal.CAPTURE_NOT_KEPT` (DEC-412's row, now on `main`) instead of its stand-in; `checks.test.mjs` R29 R31 stay green. START drafted at `build/plan/archive/starts-T51-F4/acquisition-2.txt`.

**capture**
- T52-11 · R113 *(not yet met: T52)* · a file past the request-body ceiling is sent in parts and written with R2's own multipart upload (`beginPartedUpload`, `putUploadPart`, `completePartedUpload`, `abortPartedUpload`); with control-plane R72.

**file-safety**
- T52-12 · N1261 · K4459 · `checks.mjs:96` reads `SIGNATURES_RUN_RECENT` by `rowWord`, `STAND_INS` dropped (R24 green; the key is in `words-reads.json`). START drafted at `archive/starts-T51-F4/file-safety-2.txt`.
- T52-13 · U5 · B-K4 / LB-4 · first: settle the bytes of capture `9dce360a…` (the alpha walk's `INFO-2026-0192`, still "cannot make a safe view") through the pinned converter (`soffice --headless --convert-to pdf`), against today's file's zip entries: a malformed old file means only the sentence `refusal.NOT_RENDERABLE` (B-K13) is wrong; an unsupported feature means `file-scanner`'s entry (BOB's act 4, else an entry of `next.md`). PLD U5.

## Layer 5

**entities**
- T52-14 · W6 · C-K24 · MINOR (parked, K5303) · a free-prose memo naming followed entities yields names the resolver can match; `resolutions.unresolved` also lists the unmatched names; `resolvetestify` no longer requires `ref` for a document with no recognised reference (C-M7). Joins this round: entities R67 (K5387). PL1 W6.
- T52-15 · `resolve` declared `weight: reasoned` but takes no `reason` field; the act works (K5314). First: settle which side is wrong, the op's fields or its grade, with op-grades' entry.

**events**
- T52-16 · W7 · E-K4 · MAJOR · every `IN (...)` in events (`#datedLane`, `#eventsCiting`, `#governingMany`, `:656`, `:674`, `:734`, `events/owner.mjs:65`) binds under 100 parameters (a Durable Object's SQLite allows 100; the standard's page asks for 200 captures and today throws `STORE_DID_NOT_ANSWER` on every load). First: settle at the real shape (K4428 (4)): `op=timeline&captures=` with 90, 120, 200 shas on the shipped store. C-K10: each timeline item carries its event's relations (kind, other end, withdrawn); W30 draws them. events R56, R57 (K5387). PL1 W7.

**money**
- T52-17 · W8 · C-K6 · MAJOR · the refusal sentence never prints `*` for a body (a fiscal year sent alone). [waits: where a team states its fiscal year (Bob's ruling), so the sentence's pointer and whether the screen offers "Or its fiscal year"]. C-K7: `neighbours` answers a set id (`MSR-…`): the payer, the payee and the source document by title, for facts whose payer and payee are entities or funds. [waits: facts recorded with names as written: a node for the written name, or the screen asks for entities (Bob's ruling)]. money R34, R35 (K5387). PL1 W8.

**explore**
- T52-18 · W9 · C-K22 label · MINOR · an event node is named in the Timeline's words (`screen.timeline.kind`), not "award · undated". W30 draws the grade word and the source link. PL1 W9.

**retrieval**
- T52-101 · query-language R35 (K5389) · test-only · retrieval's tests that assert a snippet's match in brackets (`passage-arm.test.mjs`'s R11/R15/R54 and R79 tests, `t51-round9.test.mjs` R95, `t51-fix2.test.mjs`) read `MARK_OPEN` and `MARK_CLOSE` (imported from query-language, never copied); after query-language merges (K5393).

**query-language**
- T52-19 · W10 · B-K5 marker · MAJOR · the match marker in a snippet is one the stored text cannot contain (or offsets), so a literal "[placed nowhere]" or "[object Object]" is not eaten; W28 adapts the drawer. PL1 W10.

## Layer 6

**inquiry**
- T52-20 · re-walk 11 C (2) · K5332 · moving a leg that sits in a ground to the other side is refused `BASIS_REFUSED` (C-2.8): the refusal names the ground and tells the member to take the passage out of it first (the job confirms whether `inquiry` or `inquiry-grammar` makes the finding; W29 maps it).

**citation**
- T52-21 · W11 · C-K5 · MAJOR · "Remove a citation" removes the one passage cited and "Put it on the other side" moves that passage's leg only, so the record's per-document edge no longer drags every passage (BOB's ruling of the placement, PLB BQ15). W29 maps the refusal's own sentence. PL1 W11.

**contradiction**
- T52-22 · `candidatesFor` publishes a member-flagged candidate (`flagged_by`) in its answer, so screens-inquiry's `t51-fix11-b89.test.mjs` `answer(c)` takes it and R138's flags list can be drawn (SCREENS-INQUIRY #34 J64; K5282).

**agent-worker**
- T52-102 · `requirements.test.mjs` red in a batch run of query-language's users (`proc tests --users`), green alone (QUERY-LANGUAGE #1, K5393): first: settle the cause (shared state, ordering or memory; R14's memory watch), then fix it; "flake" is not a cause.

## Layer 8

**public-read**
- T52-23 · R45 *(not yet met: T52)* · `publishedcase` serves each finding's basis version (name and identity) from the signed document only, and the case's header list (DEC-34) names it; screens-publish R6 draws it.

**ratification**
- T52-24 · K5343 reds (2) · first: measure each on the tranche tip and settle its cause, then fix it.

**case-disclosures**
- T52-25 · W12 · D-K4 · MAJOR · `case-disclosures.index.late_proves` is filled with the member's date, not the raw ISO instant. PL1 W12.

**case-inputs**
- T52-26 · W13 · E-K5 · MAJOR · an administrator's session acknowledges as its member (BOB's ruling of the placement); the dead answer `NO_REVIEW_COPY` for a viewer not starting `member:` gets a distinct code for any case still refused; W31 maps it. Control: the member succeeds. PL1 W13.

**case-authoring**
- T52-27 · W14 · E-K3 · BLOCKER · the pre-flight answers `published` per draft (`case_documents.draft_id`, publication R40), not per case, so a second draft over a published case shows its steps; the case's published edition stays as a note. The screen is unchanged. Test: a draft made through the question page's "Prepare a case from this" after edition 1. PL1 W14.

**case-check**
- T52-28 · W15 · D-K9 answer half · MINOR · a published edition answers `published` from `casecheck` even with no check row (DEC-444: the read-only editor's ladder no longer reads "Not checked yet"). PL1 W15.

## Layer 9

**conformance**
- T52-29 · W16 · E-K2 · MAJOR · the refusal for an undetermined binding names the true cause (the act's event has no date) and the door that settles it (the Timeline), and the reason is not nested twice ("placed nowhere (placed nowhere …)", `datesOf`, `whenWords`); B-K5 note: first: settle with one test that `${not.why}`/`${und.why}` never print "[object Object]", no fix if it passes. PL1 W16.

**actions**
- T52-30 · U25 · E U-10 / H3b(a) · first: settle whether a silence recorded before the reply was due is accepted and its stage dropped (`actions/index.mjs:1836-1862`, `t45.fields`, the `no_response` arm against the clock); fix it if so. PLD U25.

**filings**
- T52-31 · W17 · E-K8 · MINOR · the counsel packet's claim is read from an empty `## Conclusion` section as empty, not as the next heading (`#fact`). PL2 W17.

**action-plans**
- T52-32 · W18 · E-K11 · MINOR · the tier reason stores the option's own words, not "the tier option opt-1 of plan PLN-…". PL2 W18.
- T52-33 · U19 · E U-4 / K7, N4 · first: settle whether the owner's checks list or the screen repeats each sentence per scenario ("Checks · 9" for two); the closed plan keeps its checks.

## Layer 10

**following**
- T52-34 · `checks.test.mjs:20` imports `src/plane/register.mjs`, deleted at `51f57fa193`: re-point it (JURISDICTIONS #20 J12; K5289).

## Layer 11

Every screen job of this layer also draws DEC-445's rows and DEC-446's layout that touch its screens (merged `fb5f9dc2a9`, K5394): the singulars (`screen.finder.named.one`, `screen.findin.searched.one`, `document.unread.page`), `screen.finder.shown`, `screen.timeline.dated.meta.nograde`, `screen.find-in.notread.which`, `refusal.SUBJECT_IN_ACTIVE_PLAN.named`, the Document page's display rows (`screen.document.basis.*`, `screen.document.reading.*`), and DEC-446's DS2, DS4, DS5, DS10, DS13, DS18, DS20, DS32, DS35 as the mockup shows.

**wizard-scripts**
- T52-35 · W19 · A-K16 · MINOR · the shipped wizards' approver is a member-facing name in the data, not "BOB"; the draw stays. [waits: the approver's word, the design's]. PL2 W19.
- T52-36 · DEC-443 (U486, `2892f29ccb`; K5315) · re-take the registry: the four acts (`factconfirm` on setup, `leggrade` on question, `resolve` on document, `signerknown` on queue); regenerate its data. interface-shell R134's re-points retire in their own entry.

**op-grades**
- T52-37 · R46 *(not yet met: T52)* · `expertisewithdraw` (DEC-386) has the entry Reasoned, source the kit; the totality names it.
- T52-38 · `resolve` weight: settled by ENTITIES #1 (K5392): `reasoned` stands with no `reason` field, so op-grades changes nothing here; its job confirms its table agrees and closes the entry.

**affordances**
- T52-39 · DEC-443 · reads `act.leggrade.does`, `act.signerknown.does`, `act.factconfirm.does` and the five `act.standard*.does` by key (ACT_HELP words move; three tests re-pinned); DEC-444's two ACT_HELP sentences (`counselpacketread`, `counselpacketexport`).

**tasks**
- T52-40 · W20 · A-K2 refusal half · MAJOR · `taskForward` refuses before any write, with a sentence, a target who cannot see the item's `refers_to` bundle (R2, R3), and answers which members can. Control: a participant receives it; a task in "NOT IN A CASE" still arrives. PL2 W20.

**instance-setup**
- T52-41 · W21 · A-K10 · MINOR · the website check's detail never names the older product's file (`civicos-group.json`); the second read stays (R8, DEC-124). Words owed. PL2 W21.

**op-declarations**
- T52-42 · K4599 (a) with N1264 · declares the combined read: one op that carries a declared list of reads for a screen, and its answer's shape; first the Project screen, then each screen. First: BOB's throwaway test figures (his act 3). See store-door.

**admission**
- T52-43 · N1264 · K4533 · the object-side admission: one call to the object per op instead of two to four (whoami 1, projectlist 2, groupidentity 3, bootstrap 4, queue 2; targets 1, 1, 2, 2): the object resolves the session, judges `admit` and stamps. The deployed `in-<route>` time is 0-1 ms (a hop of 110-125 ms is transport, PERFORMANCE P11) and the room's minimum placement is in (K4747), so the fold is the lever. First: settle the figures on the deployed copy that confirm it.

**store-door**
- T52-44 · W22 · B-K1 pull filer · BLOCKER · `pull.mjs` files the knock through provenance's helper (after W5). Red then green: the knock to "Vouched for by …". PL1 W22.
- T52-45 · N1264 and K4599 (a) · executes the admission fold and the combined read in one object call; with admission and op-declarations.

**store-assembly**
- T52-46 · K5343 red (1) · first: settle the cause, then fix it.
- T52-47 · a world's network double is bound per world (STORE-REQUEST #8 J21 (2)).

**store-request**
- T52-48 · R22 *(not yet met: T52)* · the split by copy, then delete: `control-plane/index.mjs` holds none of R2 to R13, R23, R24 and calls `innerRequest` for every store request; the constants of R24 and `promotedTypeOf` are imported from here.

**interface-shell**
- T52-49 · W23 · A-K11 frame, A-K12, A-K14, D-K16 · MINOR · one function says what the queue number counts (snoozed excluded), used by the rail, the top bar and the 390 bar and handed to the Queue page (W28); a signed-out deep link or unknown address shows one plain sentence above the sign-in form (words owed); a locked stored session is drawn once (the shell overlay or the front, not both) and the avatar's tip closes when the menu opens at 390 touch; opening one "Confirm" popover closes another act's. First: settle U4, the rail's "6" against the top bar's "10" (`QUEUE_COUNTS.todo`; whether a screen's `cs.band(n)` changes `BAND`). PL2 W23.
- T52-50 · K5327 · `readAll`/`readsOf` show a failed `reads` (never a silent "Still loading"); a shell test evaluates every module's served `SCREENS` source for free module-scope names.
- T52-51 · DEC-443 · R134's four re-points retire (after wizard-scripts).
- T52-52 · N1263 (DEC-414) · every control at 390 px has its 44 px target (Home 120, Queue 89, Find 73, Projects 37 under 30 px; links in running text about 24 px by padding, DEC-412 (4)).
- T52-53 · K4599 (a) · the shell asks one combined read per screen (after op-declarations and store-door).

**screens-entry**
- T52-54 · W24 · A-K1, A-K7 · MAJOR · setup part 8 does not say "the only administrator" when the roster holds two; the join page names the invitation's role and capabilities in plain words, and the recovery-code page's explanation no longer says "claimed". Words owed. PL2 W24.
- T52-55 · R2 *(not yet met: T52)* · the sign-in panel and its states as R2 states them.
- T52-56 · DEC-443 · draws `act.factconfirm.label.setup` and `screen.setup.zone.how.help`.

**screens-wizards**
- T52-57 · W25 · A-K17 · MINOR · "Continue: Welcome a new member" remembers the step reached, or says it starts again at step 3 (BOB's choice at the job). PL2 W25.

**screens-settings**
- T52-58 · W26 · A-K6 name and draw, A-K13, A-K15 · MINOR · a proposed administrator's row is named by its `cover` and draws "n of m endorsed, still to endorse: …" (after W3); 14 signing keys are 14 list items and a language box never parts from its word; Security reads "In the last 7 days" (the period is a length). PL2 W26.

**screens-intake**
- T52-59 · W27 · B-K2, B-K3, B-K8, B-K9, B-K16, B-K18 · MAJOR · "Which person" draws the posts, not "[object Object]"; the safe view of a Word, PowerPoint or scanned PDF draws something (first: settle what `op=safeview` returns; [waits: where the pages are drawn, a UX ruling]); a mistyped address says what an address must be; the empty lead form names its field, not the reason; the recorder can read back what they recorded (withheld says so; the sight list preselects the recorder); the "Put back in the inbox as new" line clears after a pull; the observation form draws the photo control R3 states (B-K15) and Held captures offers the plane's `HELD_SORTS` order and a search (B-K17, R4; BOB's reading of the requirements, K5357). [waits: B-K19 source link from the Held row]. First: settle U7, why the knock reads "New" 4.1 s after "Move into the record" (order and answers of `inboxpull` and `inboxget`, `browser.mjs:124-141` coalescing). PL2 W27.
- T52-60 · N1263 · reads `screen.capture.reading.pending` and `screen.capture.logins.store`.
- T52-61 · restore SCREENS-INTAKE #28 J60 (c)'s removed cases on STORE-REQUEST #8's recipes.

**screens-daily**
- T52-62 · W28 · A-K2 offer (after W20), A-K4, A-K5, A-K11 Queue half (after W23), B-K5 display half (after W10), B-K11, B-K12 · MAJOR · Forward offers only members who can see the item and never the viewer; "Choose several" Forward moves what one-by-one Forward moves, or each row says why, and names the ask as the Queue does; no "Done: act.taskdecide.label.queue" (a sweep over every act that sets `ui.done` finds its words row); the Queue line counts as the masthead does ("1 item waits on you" owed); a record's snippet shows words, no `##` or session log; the passage count says passages and documents truthfully ("{n} passages in 1 document" row owed, DS11); the widen button is not labelled "Search". PL2 W28.
- T52-63 · N1263 · reads `screen.queue.vouchband.apart` (bell and sidebar count queue items only, the band its own number).
- T52-64 · U1 · LA-7 · first: settle m1's `op=memberlist` and Home's `data.members` state; guard "Yours: ." until the list is known (certain either way). Also LB-18: the `cs.call` start and settle order for "Still loading" at 1.5 s on `council NOT zzzqqq …`.
- T52-65 · K4599 (a) · Home and Queue read one combined read.

**screens-inquiry**
- T52-66 · W29 · A-K3+C-K14, A-K8 (a), A-K9, B-K7+C-K16, C-K1+D-K2, C-K4+D-K11, C-K5 sentence, C-K9, C-K12, C-K19, C-K21, D-K10, D-K12, E-K9, E-K15 · MAJOR · cause lines (detail PL3 W29): no "Undetermined, because {reason}" for a document with no title or while a read loads (real name; `state.loading`); a sentence on a successful project invite (after W4); "Who can find it" history prints each sentence once (tests pinning the wrong text are corrected); the stored authority sentence's ISO instant is drawn as a date; an unrated capture axis leads to the fold "What this passage earns" (D-K2: the publish gate unchanged); "Shared origin" names documents by title and passages by words; `sever`/`reinstate` carry `refusals: { BASIS_REFUSED }` (after W11); "Find a document" finds a held file by name through a read that takes one; a document refused whole offers "Type a page's words yourself"; "Left as it was the question already cited it · Page 1" is one sentence; the missing passage side is named; the unjoined project's breadcrumb; no "reading-1" after concluding; re-concluding after "Reopen this finding" sends the new reading; the help promising a preset claim is drawn only when one is preset. First: settle E-K9's link (`current` survives the withdrawal) and C-K1's `[data-leggrade]` under each passage (`op=earnedbasis&id=INQ-2026-0019`). [waits: C-K2 where a question's subject is stated (UX-DESIGN, B541); B-K19 first half]. C-K4: a shared origin is compared within one side only, as today (BOB's, K5357).
- T52-67 · first: settle the UNKNOWNs of this module (PLD section 4): U8 (a "Yes, because of" answered "No" shows no "Set aside" line: the walker's basis in a screens-inquiry test), U10 (a PDF's Document heading "untitled": `op=reading` for `INFO-2026-0261`; owner with reading-pipeline), U12 (a swallowed press at about 1 s: whether `[data-reason]` exists at 3 s; else an interface-shell entry of `next.md`), U16 (an invited member told "You can see that this project exists, but not its work, until you join it."), U26 (a published case's finding says nothing on the question page), U27 (Reopen answers with no result line).
- T52-68 · FR-28 block R84-R139 *(not yet met: T52)* · each act is sent as its owner declares it, and a test names each requirement; includes re-walk 11 C (3): the "after the strength was shown" line draws the grades, and (2) the ground-naming refusal (inquiry's entry).
- T52-69 · DEC-443 · draws `act.leggrade.label.question` (`screen.question.leggrade.act` retired).
- T52-70 · N1263 · reads `act.readheld.label.document`, `screen.document.readnow.refused.NO_HOME`, `.NO_WHOLE_OBJECT`, `screen.document.cite.repair.says`.
- T52-71 · R138's list clause: the flags raised on a document, from `contradictioncandidates` (the key `screen.document.flags.head` is held; after contradiction's entry).
- T52-72 · the memory watch (R14, adopted): `document`, `fr28-document` (12.6 GB, killed by the container) and `t51-document` run within the cap, the old defect found and fixed; K5343 reds (5): first: settle each cause.
- T52-73 · K4599 (a) · the Project screen first reads the combined read.

**screens-investigate**
- T52-74 · W30 · C-K11+E-K1, C-K10 draw (after W7), C-K17, C-K18, C-K22 draw half · BLOCKER · "Record a dated fact" on an event's row dates that event through `eventattest` (the field's belonging to the button is said), so an undated event can be dated and Noncompliant recorded (W16's door); the Timeline draws each event's links and kind; the money table's amounts have separators and "a/an" agrees; a button that asks nothing does not say "Asks for a reason" (UX decides the mark, DS list); the graph step's grade letter has its word and the source link opens the passage. After W7 green, a failed `timeline` read on the standard's page draws a sentence (`standard.mjs:175`). PL3 W30.
- T52-75 · re-walk 11 C (4) · K5332 · the timeline's event picker and kind chooser use labels, not raw kinds (with C-M9).
- T52-76 · U9 · C-K8 · first: settle whether `op=entity&id=…` goes out after `op=relationdeclare` and its `relations` hold the new tie (the redraw or `repeatSet`/`changedReads`); U23: the document pickers list every team document, oldest first: settle the `heldcaptures` filter the picker uses (it may be C-K9's cause).
- T52-77 · DEC-443 · builds Explore's "Documents that name them" inside "Follow from here" (`search`, DEC-410).

**screens-publish**
- T52-78 · W31 · D-K3, D-K5, D-K6, D-K7, D-K8, D-K9 screen half, D-K13, D-K14, D-K15, D-K17, D-K18 · MAJOR · cause lines (detail PL3 W31): the pre-flight names a document by its title, not a hash; "leaves nothing material out" does not untick after Save and a reload or ask to confirm a claim never made; "The draft is prepared." once, the details open or say what opens them; the role, position and box draw "Changes here are not saved yet" (`typing: edited` on the three `cs.checks`, R81 after R135); after the member's acknowledgment the section does not redraw "Still loading" (first: settle the request trace after the act, were `casedraft`/`reviewcopy` asked again); a team member is not "an outside reader" and the role is not said twice; "Stop sharing" says it ended; a draft naming no case is titled by its title in file name and reader's heading; singular rows for one finding and one piece of evidence (words owed); `/app/docket/<project>` shows no raw id. D-K9 (DEC-444, K5368): a case whose newest edition is published opens its editor read-only, `screen.case-editor.published.*` and `screen.case-editor.next.lead`, linking to Docket's "Start the next edition"; no draft fields, ladder or bias line.
- T52-79 · FR-30 block R44-R81 *(not yet met: T52)* · a test names each requirement.
- T52-80 · U13 / U15 · first: settle with a trace of one sign act (`casedocument`, the password check, the browser signing, `caseratify`), on a case that fails D-K1 and one that does not, after W1 and W14.

**screens-action**
- T52-81 · W32 · E-K6, E-K17, E-K7 (functional part), E-K10 (also re-walk 11 E), C-K20+E-K12, E-K13, E-K14, E-K16 · MAJOR · cause lines (detail PL3 W32): a proposed law has a control to choose it, and a request with no laws offers a way (`screen.action.law.none`); acting before a determination takes a ground (a legal deadline with date and citation, or an irreversible act, what and when) and, once W30 records a noncompliant determination, "Name the determination it rests on"; "Brief counsel" draws the packet's id and version, a "made" line and a way to read and export it; the Matter head and plan line read the body's label, not `ENT-…`; the plan's add-option form clears its tier after a success; the template save says it is saved; "WHOSE MOVE", "THE CLOCK", "NEXT" say something true for a planned action; "Waiting on … reply" ends after a recorded Denial. E-K7 (DEC-444, K5368): "Packets made for this action" per version, reading (`counselpacketread`) and export (`counselpacketexport`), `screen.counsel.made.*`, `.section.*`, `.sections.marking`, `.export.note`. PL3 W32.
- T52-82 · re-walk 11 E (K5328) · N1's `screen.request.office.undated` is drawn.
- T52-83 · N1263 · the request's agency and office are two fields (DEC-412 (3)).
- T52-84 · first: settle U20 (the "The action started ·" line with nothing after the dot, the empty-addressee case through `start-send.mjs:138-145`), U21 ("The due date to be reminded of": grep the row; likely the design's, to B541), U22 (one reply costs two presses and a reason: read `actioncorrespond`'s `done`), U24 (the body choice offers only one body: read it in `request.mjs`).

**control-plane**
- T52-85 · W33 · B-K1 archive filer · BLOCKER · `archive.mjs` files an unpacked archive member through provenance's helper (after W5). Red then green: an unpacked member vouched. PL3 W33.
- T52-86 · R29, R64, R72, R74, R107 *(not yet met: T52)* · no handler receives a caller-supplied stamp; a secret's digest reaches the store only in the body; `captureupload` and its four parted ops (with capture R113); `pagetranscribe`; the stamped viewer reaches `inboxpull` and `inboxresolve`.
- T52-87 · a team with no place profile states its zone in Settings and "Share for review" is no longer refused (SCREENS-SETTINGS #23 J47; K5287), through the door.
- T52-88 · N1264 and K4599 (a) · routes the combined read and the folded admission, stamps declared.

**plane**
- T52-89 · R1, R9, R111, R112, R113, R114 *(not yet met: T52)* · the Store class builds by `assembleStore`; no row, refusal or answer of its own; the `ask`/`draft` RPCs; `pagetranscribe` through `extraction`'s `pageTranscribeOp`; `knock` through `doorbellPublicOp`; `dispatchMemberRun` and `groupFields` RPCs. If R114 proves to rest on the remote path, REPORT: it moves to N1220's side.
- T52-90 · K5343 reds (4) · first: settle each cause, then fix it.
- T52-91 · N1264 and K4599 (a) · the Store's RPC for the folded admission and the combined read.

**installer-steps**
- T52-92 · N1265 (2) · DEC-415 (U450, on `main`) · "Check my account": after Cloudflare's permission page, every R70 preflight check at once plus a payment-method probe that keeps nothing, a per-check list with each fix and link, re-runnable.

**installer**
- T52-93 · R33 `newgroup/test/realsize.test.mjs` four reds (install and update memory cases at real size, red on the tranche tip with 0.86.0 too): the test's fake Cloudflare refuses the upload ("this release's description of its program can't be read"), its child build not yet read; first: settle that; the installer itself reads 0.87.0's statements cleanly. K5343 reds (13): first: settle each cause.
- T52-94 · N1265 (1) (3) · DEC-415/DEC-416 · "Get ready", five plain steps ahead of the installer, each opening the exact Cloudflare page, links checked on a schedule; "Install now" only when every line is ready within the session. Regenerate `bio-plane/public/newgroup/index.html`.
- T52-95 · N1275 · K5039, K5043 · the installer's "Questions people ask" block under its two buttons (drawn in `mock-screens.js`, now on `main`).

**site**
- T52-96 · N1275 · `/start`'s fourth "What you need" bullet ("No Cloudflare account yet? …"); `node site/build.mjs` regenerates `pages.mjs`.

**journey-check**
- T52-97 · R20, R21, R23, R24, R25, R26, R28 *(not yet met: T52)* · assistant-needing steps reported as not walked, never failed; the carried screens and states become pairs; "Page 1"; the published frame is walked; the `OLD_PAGE` trip-wire and `/sign` 404; R17's scan clears; DEC-340's checks.
- T52-98 · a knock, pull and vouch step and a testimony vouched (W5's gap: `journeys.mjs` has none; provenance R81 files both, K5381), and the walk of N1265's three installer steps.

## Completion round (P10: modules whose layer has closed)

**file-safety** (layer 3)
- T52-103 · DEC-449 (UX-DESIGN U493, `cf94163859`, B544) · test-only · `STAND_INS` drops `SIGNATURES_RUN_UNDER_WAY` now that `refusal.SIGNATURES_RUN_UNDER_WAY` has its row; R24 (`rows.test.mjs`) green. Done instead by BOB as a §5.10 mechanical pass at layer 5's close (no job running), with DEC-449 and DEC-450 (U494, `2ac5195725`) merged in the same step, so R24 is never red on the tranche (K5397).

**file-scanner** (layer 1)
- T52-100 · U5 (T52-13 settled by FILE-SAFETY #1, K5384) · MAJOR · the pinned LibreOffice 7.4.7.2 cannot load a streamed docx (data-descriptor flag 0x8, 28-byte extras; corpus docgen `alpha-B-6`); `renderer.mjs`'s `plainPackage` already converts it, but a render failed before stays failed because `renderer_version` holds only package versions (`handler.mjs:27`): file-scanner R36 (parked in `req-ahead-T52.md` until this round's START). Test with the streamed docx: refused by the old version, rendered once the version moves. After T52's redeploy (BOB's act 7) the live image is checked to carry `plainPackage` and capture `9dce360a…` renders.

## Left out, each with its one hard reason

Bob's pending decisions:
- The tests sweep (K5313, K5258): every finding and refusal carries its code, word key and values, tests assert those, the words check refuses sentence fragments, one pass in BOB's session or per module · Bob's A or B choice, `build/plan/tests-rethink-T52.html`. With it: the control-plane sweep that every `OPS` row with `classes: null`, outside `INSTANCE_SETUP_OPS`, is claimed by a public door arm (PUBLIC-READ #40 J40).
- N1220, the assistant, and what waits on it: N842, N1198, N1199, N1200, N1219, N1276, N1105 (K3347), installer-steps R26 and R31 (the remote Worker bound at install; K3718 (2)), N1258 (the charge-or-rule answer and its accuracy measure, DEC-405 option B for the first beta), N1260's first-beta part, N1259's assisted part (`registerask`, `registermatch`, `registerwatchpropose`) · Bob's (K3717, N1220: the AI-DESIGN lane's outcome reaches him first).
- N824 email capture · Bob's (D42 "email: A", after upload is in use). N858 (template and procedure-guide texts) · Bob's review as `filing-templates` R15's reviewer. N923 and N1159 (the stewards' address, Email Routing acts on the account) · Bob's (K2799, K3470). N1110 · Bob's (the rule's approval) and the directory is not built. N1256 federal offices built in · Bob's, "as time and tokens allow" (DEC-401), placed when he says. N1267a (XLSX windowed cells) · Bob's higher row than 250,000 (K4831 (10)); at today's row no cause. N1269 and N1272 · Bob's (options not yet put to him). N1270 audio, video and forums · Bob's ruling: not in 1.0, nothing to build. N1271 the record split across objects (capacity study first, then options) · Bob's (K4635). Speed (b), a team's objects placed near it (PERFORMANCE P15) · Bob's acceptance.
- Parts of the walk's entries, each named in its entry: C-K2 where a question's subject is stated (W29); C-K6 where a team states its fiscal year and C-K7 as-written payer and payee (W8); B-K19 the source link (W27, W29); where the safe view's pages are drawn (B-K3, W27) · Bob's UX, through UX-DESIGN (B541; #42 brings C-K2, C-K6, B-K19 to him with options, answers D-K9 and E-K7 as the design's).

New capability whose requirements are not yet written (requirements to be drafted by BOB and brought to Bob where his, P5):
- N1259 public registers and outside alerts: two new modules, `register-readers` (layer 1, pure file reader, filter, reduced copy) and `registers` (layer 5: listing, a team's own register, plan with delta and time estimate, sliced resumable import, row store, search, cited row, compare, remembered filter); amended requirement lines in jurisdictions (register definitions), connection-grammar, court-doctypes, acquisition (streaming arm, arrival reduction, probe), extraction (`held_as_register`), content (row extents, labelled extract), case-grammar (K1483 for registers), corpus-export, publication, public-read, case-checker, case-disclosures, monitoring, following (`register-query`), scheduler (consumer), affordances, notice-producers; the ops (`registerlist`, `registerdefine`, `registerplan`, `registerimport`, `registersearch`, `registerrowcite`, `registerwatch`, `registerwatchstop`, `alertconnect` and K4403's `registerfilter`, `registerdelta`, `registerpreread`, `registerpropose`; names BOB's); the screen `registers` after DEC-407/DEC-411. Bob's open points (K4403 does not answer): names in a remembered filter, a storage cap, who may start a team-wide pre-read, a team's own statement of terms, what a stated interest is. Also needed: the draft's M-R3, M-R4, M-R7, M-R8 measures. Drafts: `draft-T52-DEC406.md`, `draft-T52-plan.md`.
- N1260 following the trail (alpha part): requirements for `connection-grammar` (`orderPaths`, `pathStrength`, `groupParallel`, `BOUNDS.paths`), `connections` (`named_in`), `money` (finer kinds, `moneyByParty`), `explore` (every connection, most direct, `shorterThan`, the 2 s stop with a resume token), `affordances` (dimension map, `DIMENSION_ONWARD`), the screens' "Follow from here" (`followfrom`, `exploreall`, `explorepath`, `exploreshorter`, `moneyby`; names BOB's), journey-check's act counter and 2 s assertion. Drafts: `draft-T52-DEC409.md`, `draft-T52-plan.md`.
- N1257 places in layers (federal and California layers researched and read-only, county and city layers, how layers stack, a team's own research marked as such): requirements for `jurisdictions`, `instance-setup`, `screens-settings`; the researched content does not yet exist (outside the product).
- N1266 the file types (.doc, .xls, TSV, RTF, JSON, XML, TIFF, HEIC, GIF, WebP, .eml, .msg, ZIP contents): Bob wants the types closely studied before the list is final (K4632); then requirements for `format-registry` and each new reader. N1267 the sizes (K4628 option B: 100 MB or 5,000 pages, 50 MB or about 1 million rows, 50 MB an image, 500 MB an archive; refused in plain words with the size, read whole, held once downstream per CSV-READER #3's measure): requirements for every reader, `extraction`, `reading-pipeline`, `acquisition`, `control-plane` uploads. N1273 the region picker: requirements for `installer`, `newgroup`, `plane` and UX-DESIGN's rows.
- N1268 the acceptance corpus · its files (real public files per type, small, typical, largest allowed) do not yet exist and wait on N1266's list; it also needs a live test copy.

A measurement or deployment outside the round:
- N751 (no issuer policy beyond the 74 read exists to measure on). N853c (a real photograph captured and read live; W2 prepares it). N1262 (the cost appears only at tens of thousands of candidates). N1274 (the load test on a scratch copy). Timing UNKNOWNs, each measured on a quiet copy after T52's redeploy, its cause then an entry of `next.md`: U2 and U3 cold loads (interface-shell, screens-entry), U6 `captureupload`, `inboxpull`, `namedrequests` (screens-intake, capture), U11 Document and Money over 2 s (screens-inquiry, screens-investigate), U13 and U15 beyond the trace above (screens-publish), U14 Project and Question at 390 (screens-inquiry), U17 and U18 acts and a 12.4 s stall (control-plane).

Outside the product:
- N829 (the test set's matters do not exist; who writes them is Bob's). The sentences owed to the walk's entries (PL2/PLD "words owed": A-K1 second-administrator sentence, A-K5 queue.done tail, A-K7, A-K8, A-K10, A-K11 singular, A-K12, A-K15, A-K16, B-K11, C-K18, C-K21, D-K6, D-K14, D-K17, E-K5, E-K14) and DS1 to DS35 (B541): the design's rows do not yet exist; each job does everything else and REPORTs the missing sentence.
