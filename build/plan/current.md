**Round** · R1 · layer 1 CLOSED · layer 2 CLOSED · layer 3 CLOSED · layer 5 CLOSED · layer 6 CLOSED
# Plan T52 · the beta (K5257)
**Status** · OPEN · BOB #320 · session_018BhcecJrZBGdFHx6zQiGAc · depth 1
**Jobs** · none
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
- T52-101 · query-language R35 (K5389) · test-only · retrieval's tests that assert a snippet's match in brackets (`passage-arm.test.mjs`'s R11/R15/R54 and R79 tests, `t51-round9.test.mjs` R95, `t51-fix2.test.mjs`) read `MARK_OPEN` and `MARK_CLOSE` (imported from query-language, never copied); after query-language merges (K5393). Widened (K5401): retrieval's own `#questionExcerpt` marks its match with the same two marks, so `t51-fix2.test.mjs` R92 reads them too; R92's sentence folded from the job's report.

**query-language**
- T52-19 · W10 · B-K5 marker · MAJOR · the match marker in a snippet is one the stored text cannot contain (or offsets), so a literal "[placed nowhere]" or "[object Object]" is not eaten; W28 adapts the drawer. PL1 W10.

## Layer 6

**inquiry-grammar**
- T52-20 · re-walk 11 C (2) · K5332 · moving a leg that sits in a ground to the other side is refused `BASIS_REFUSED` (C-2.8): the finding carries its own code and its repair tells the member to take the passage out of the ground first: inquiry-grammar R70 (`checkGrounds` makes it; inquiry and citation relay it unchanged; K5405). W29 maps it.

**citation**
- T52-21 · W11 · C-K5 · MAJOR · "Remove a citation" removes the one passage cited and "Put it on the other side" moves that passage's leg only, so the record's per-document edge no longer drags every passage (BOB's ruling of the placement, PLB BQ15). W29 maps the refusal's own sentence. citation R25 (K5405). PL1 W11.

**leg-earning**
- T52-105 · W11 (with T52-21) · `restingOn` and `restsOnLive` read each leg's own severed status, so a passage severed while another of the same document rests is not counted live: leg-earning R17 (K5405). Carried to citation by BOB (P10).

**contradiction**
- T52-22 · `candidatesFor` publishes a member-flagged candidate (`flagged_by`) in its answer, so screens-inquiry's `t51-fix11-b89.test.mjs` `answer(c)` takes it and R138's flags list can be drawn (SCREENS-INQUIRY #34 J64; K5282). R25 already states the field and `#present` sets it: the step is contradiction's published fixtures (its tests' own, from its real code) carrying a flagged candidate's answer, so a user's test builds none by hand; no requirement changes (K5405).

**agent-worker**
- T52-102 · `requirements.test.mjs` red in a batch run of query-language's users (`proc tests --users`), green alone (QUERY-LANGUAGE #1, K5393): first: settle the cause (shared state, ordering or memory; R14's memory watch), then fix it; "flake" is not a cause.

## Layers 8 to 11 and the completion round: carried (K5417)

T52 stopped after layer 6 by Bob's direction (K5417, K5418): every entry of layers 8 to 11 (T52-23 to T52-98, T52-104) and the completion round's T52-100 is moved whole to `build/plan/carried-T52-R1.md` for the beta's comprehensive plan.

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
