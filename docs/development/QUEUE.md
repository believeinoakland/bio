# The work queue

**The cache of the build plan** (`docs/development/WORK-PIPELINE.md`): the BOB INBOX's undrained entries, then the open
rows IN ORDER. **SCHEDULER owns this file** (`kickoffs/SCHEDULER.md`): it drains the inbox, orders the rows, and marks,
archives and replenishes; **CONDUCT writes one word — a row's `queued` → `running`**, pushed before its worker spawns.
READ WHOLE by every session.

**Statuses.** `queued`: runnable and unclaimed. `running`: a live worker holds an `agent-*` worktree with a claim on the
row's paths — and when none does, the row is UNDETERMINED between `queued` and done-awaiting-integration: read (1) a
`worktree-agent-*` branch whose commits name the item, then (2) the item's block in `CLAIMS.md` (`released:` means it
finished on purpose); only with neither does it fall back to `queued`. `blocked`: cannot run until something outside the
queue moves, and says what. `done` and `superseded` leave for the archive (`node tools/ledger.mjs archive <ID>`). **A
worker reads its own row from `coord` (`node tools/coord.mjs read docs/development/QUEUE.md`; M0-110, corrected by SCHEDULER #14) before it touches anything, and STOPS if the row does not read `running`.**

This file's history until 2026-09-18 — its earlier preambles, the 2026-08-04 handover, the per-area narrative — is in
`docs/archive/ledgers/QUEUE-narrative-2026-09-18.md`; drained inbox entries are in
`docs/archive/ledgers/BOB-INBOX-drained.md`; closed rows in `docs/archive/ledgers/QUEUE-closed.md`. All verbatim; look
them up (`node tools/ledger.mjs find <ID>`), do not read them whole.


## BOB INBOX — append-only. BOB writes here; SCHEDULER drains it (from 2026-09-18; CONDUCT did until then).

BOB appends a designed item, a correction or an order change here, with its intended place; SCHEDULER gates it at its cited design section and its depends-on, places it, and moves the drained entry to `docs/archive/ledgers/BOB-INBOX-drained.md` in the same commit.
- **2026-09-25 13:02Z · BOB #36 · BOB CONFIRMS (Bob, ~13:00Z): "no new job spawns until we get all these jobs merged." The no-spawn rule holds UNTIL every current job is merged: batch30 and batch31 landed, every running worker's branch integrated and trained, and no finished branch left unmerged. Bob lifts it; nobody infers it lifted.** It covers ANY new session by ANY lane: SCHEDULER's workers, and CONDUCT's integration sessions too. This corrects BOB #36's 12:52Z note to CONDUCT that helpers were "yours to judge". CONDUCT's in-session subagents that do the merging itself are not new jobs and are allowed. Rows keep being minted and placed; none is spawned.



## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 16 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). **At most 10 worker sessions are live at once** (Bob, 2026-09-24 ~03:08Z, via BOB #32; until 05:00Z, then 6, and no new spawn from 06:00Z): a `running` row whose worker has FINISHED and awaits integration holds no session, so the cache keeps a few `queued` rows behind the live ten and no slot waits. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### D-612 · integrated — **EVERY REAL GOOGLE DOC EXPORT EMBEDS `Fonts/fontN.ttf`, REFERENCED BY `svg:font-face-uri`, AND D-351's MEMBER RULE REFUSES THOSE REFERENCES, so the .odt digest reads UNDETERMINED on ALL 8 real Docs (M-167) and the monitor's false "changed" alarm for Docs survives D-473.** Found by D-473's worker (05:49Z). — owner CAPTURE.
status: integrated — SCHEDULER #22 07:02Z: tip f2dcbc6c (CARRIES D-473 737913b0), GATE 367/367 GREEN FULLREUSE (21100 assertions), tree 30feba7f; font-face-uri discounted, Pictures/ still refuse; moved count UNDETERMINED (M-167 not re-addressable), minted a re-measure row; rides batch30
order: directly after D-473, which it completes: D-473's widening reaches no real Doc until fonts are admitted (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: none unless a digest's grade changes on the wire (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` (the ODF evidentiary rule, D-351 §5: a presentational part, as styles.xml).
depends-on: none (stacked on D-473's branch).
scope: in `referencedMembers`, do not count an href on a font-face-uri element (by local name); Pictures/ and Object N/ references still refuse.
accepts-when: a real-shaped .odt with Fonts/ and no image reads determined, and one with an image still refuses (moves: 8 of 8 real Docs undetermined). NEGATIVE CONTROL: count fonts again and the fonts arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-473's worker).

### D-578 · integrated — **A PROMOTE REVISION WHOSE DOCUMENT AND ENVELOPE BOTH STATE NO TYPE LEAVES `promotedType` UNDEFINED, and the INSERT throws "NOT NULL constraint failed: bundles.object_type": the caller gets a raw error with a store.mjs stack instead of a named refusal (reproduced through op=promote on the D-547 tree; the transaction rolls back, nothing lands).** Found by D-547's worker (01:36Z). — owner RECORD.
status: integrated — SCHEDULER #23 06:55Z: tip 700a432d (stacked on D-563 30cac9a6), GATE 94/94 GREEN FULLREUSE (7680 assertions; 365 units reused from 64ad0306's 384/387, 3 shape pins corrected), tree 5468c228; C-86.5 PROMOTED_TYPE_UNSTATED, additive type_carried; M-177; CATALOG 1.31.0->1.32.0; minted D-628, D-629
order: after D-563, with the promote corrections: a raw stack on a public op breaks DEC-49 and leaks internals (SCHEDULER #21, 2026-09-25)
milestone: M7
interface: I3 — a typeless revision carries the head's type forward, stated; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5, D-510's derivation and D-547's retype fence (C-86.2).
depends-on: D-547; D-563 (same promote function; SCHEDULER #22).
scope: a revision that states no type takes the head's `cur.object_type` (the only type D-547 admits), stated on the answer, never silent; a CREATION that states no type keeps its existing refusal.
accepts-when: a typeless revision lands carrying the head's type and says so; no op=promote answer carries a stack (moves: a raw NOT NULL error). NEGATIVE CONTROL: drop the carry-forward and the typeless-revision arm reads the raw error, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-547's worker).

### D-546 · integrated — **`op=promote` ASKS NO STATE-EDGE TABLE EXCEPT FOR BIAS: D-468 fenced a bias set's moves against its STATES edges, and every other type with a head can still move along an edge its table does not declare.** D-468's worker. BOB #34 RULED 2026-09-24 23:55Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #21; cite until folded): *the fence governs moves MADE FROM NOW ON; the history stays as it was written, and is COUNTED and SAID.* — owner RECORD.
status: integrated — SCHEDULER #23 08:25Z: tip b690552a (stacked on D-578 700a432d), GATE 81/81 GREEN FULLREUSE (6674 assertions; 378 reused, first run 384/388 with four instruments corrected by name), tree 10a972c9; C-86.6 STATE_MOVE_UNDECLARED on promote, new admin op statemovecensus; M-179; construct 3.state-edge; CATALOG 1.33.0 (506); minted D-673, D-674
order: after D-547, with the promote corrections: a disallowed move lands in the record (CLAUDE.md §2); BOB #34 ruled it product order (SCHEDULER #21, 2026-09-24)
milestone: M7
interface: I3 — refusal codes on op=promote for types other than bias; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4 (per-type schemas and state machines), with BOB #34's 23:55Z ruling, folded into §4 by this row.
depends-on: none (D-468 done; stacked on land/worker/D-578 @ 700a432d, integrated — same promote function, D-578 first; read `promotedType`, now carried before 7.1's scan).
scope: (1) MEASURE the corpus first: per type, the count of recorded moves whose edge is undeclared today, with dates, in `measurements/<id>.md`; (2) lift D-468's fence to every type with a head: promote refuses any move its type's table does not declare, for every caller by a named DEC-49 code; (3) never rewrite, reverse or repair a stored move; where a reader meets one it is stated "made by a path the current rules do not allow (before <fence date>)", neither valid nor invalid, and never larger or smaller than the count shows; (4) `STATES` keeps its valid-but-unreachable states for reading old records, unreachable by promote.
accepts-when: an undeclared move on a non-bias type is refused by name, a stored undeclared move reads with the dated sentence and is unchanged, and the measurement states the per-type counts (moves: promote asks no table but bias). NEGATIVE CONTROL: drop the fence for one type and its undeclared-move arm lands, failing by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by D-468's worker).

### D-627 · integrated — **A FULL-PAGE IMAGE WHOSE ONLY TEXT IS A FOLIO IS NOT ROUTED TO OCR SINCE D-608: the page bears text so it rightly carries no `no_text_layer`, but its CONTENT is unread and nothing says so (INFO-2026-0301 pages 633, 634, 645-651: a coverage regression D-608's provisional accepts until this lands).** BOB #35 RULED 05:50Z: two facts, two markers. — owner CONTENT-PDF.
status: integrated — SCHEDULER #23 07:17Z: tip 056d3092 (stacked on D-608 ffcc300b), GATE 387/387 GREEN FULLREUSE (21928 assertions), tree f08a82d9; docs fold of BOB #35 06:25Z into §16 re-run 210/210 GREEN FULLREUSE, tree 9195fd44; image_content_unread marker + routing; M-178; construct 5.pdf-image-content; minted D-633
order: at the head of the backlog, beside D-606 (per-page OCR, running): a coverage regression on landed work outranks features; BOB #35: *"say WHICH absence"* (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 — a new page marker `image_content_unread` and its OCR route; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with BOB #35's 05:50Z ruling (this row's worker folds it) and D-420's `container_extent.images`.
depends-on: none (stacked on land/worker/D-608 @ ffcc300b).
scope: MEASURE FIRST over the FY23-25 budget book and M-174's corpus each page's painted-image share of its area and its glyph count; set both thresholds where image-only pages separate from text pages (in-between pages read UNDETERMINED, never forced); a page over the image share and under the glyph floor carries `image_content_unread` naming both figures, and `needsTier3` routes it to OCR as it routes a no-text page. OCR output stays machine-read and never raises a grade (DEC-4).
accepts-when: those 9 pages carry the marker with their figures and route to OCR; text pages do not (moves: 9 unread pages routed nowhere). NEGATIVE CONTROL: drop the coverage arm and INFO-2026-0301's pages 633/634/645-651 read no marker and route nowhere, by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs D`; BOB #35 05:50Z).

### D-616 · integrated — **PAGES PAST THE PER-REQUEST OCR BUDGET ARE NEVER READ ON A LATER REQUEST: D-606 caps each acquire at 24 member invocations (M-175), and the re-read (op=pdfstructure&ocr=1) starts from tier-1 text, so it asks for the SAME first pages again; a 58-page scan leaves 34 pages unread for good.** Found by D-606's worker (06:06Z). Affects every scan over 24 image-only pages. — owner CONTENT-PDF.
status: integrated — SCHEDULER #23 08:10Z: tip 849c1a09 (stacked on D-606 f04460ab), GATE 80/80 GREEN FULLREUSE (6554 assertions; full run 386/387, its superseded red corrected), tree 7d773b0f; the tail re-read asks only untranscribed pages (<=24), two scoped tier-3 parts on a changed build; union points and IC with CONDUCT
order: at the head of the reader corrections, directly after D-606 which it completes: most of a long scan unread with no path to read it (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 — a re-read advances through the unread tail; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-606's per-page loop and budget.
depends-on: none (stacked on D-606's branch).
scope: seed tier3Extend with the pages the stored reading already transcribed, so each re-read (or a deferred task) asks only for the untranscribed tail and advances by up to the budget; the reading states how many pages remain; transcribed pages are never re-asked.
accepts-when: a 30-image-page fixture reads 24 pages on the first acquire and the remaining 6 on one re-read, with no page asked twice (moves: pages past the budget unread for good). NEGATIVE CONTROL: start the re-read from tier-1 text again and the second pass re-asks page 1, failing by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-606's worker).

### D-623 · integrated — **`op=proposedispose` MINTS NO_PROJECT_SCOPE AT TWO SITES (store.mjs proposeDispose: the scoped-without-project refusal and the IC-60 key bridge) WITH NO DEC-49 CODE OR TRANSLATION, so a member meets the plane's raw detail and UI-110's clause "NO_PROJECT_SCOPE reaches the member in its DEC-49 words" cannot be met.** Found by UI-110's worker (06:19Z). — owner RECORD.
status: integrated — SCHEDULER #23 07:26Z: tip 1c701e33 on 5e8a65a8, GATE 79/79 GREEN FULLREUSE (6478 assertions, 378 units reused); actNoProjectScope + region is-act-no-project-scope, C-33.48, I3 additive; CATALOG 1.30.0->1.31.0; d470 census 502->503; D-624 may render the new translation
order: at the head, with the DEC-49 translation rows: a member-facing refusal with no canned words (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: I3 additive — a catalogued code and translation; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one governed helper, one region, one condition).
depends-on: none.
scope: a row in a DEC-49 family (e.g. ACT_SHAPE_CHECKS) with a canned translation, built literally at both sites inside DEC-49 regions; census and reach floors move to their printed figures.
accepts-when: a project-scoped dispose without a project answers NO_PROJECT_SCOPE with its translation at both sites, driven through the op (moves: 2 untranslated member-facing sites). NEGATIVE CONTROL: strip the translation and each site's arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by UI-110's worker).

### D-575 · integrated — **A CONNECTION'S PAIR SAYS "which nobody has chosen" WHILE A MEMBER'S CHOICE STANDS, AND NEVER STATES A LAPSE: `Store#pairSelection`'s `says` ends that way on every row on `op=connections&id=`/`&sha256=`, including one carrying a current `on_point`; that arm's `on_point` never states a lapse (only the `content=` arm does).** Found by UI-91's worker (01:25Z). — owner RECORD.
status: integrated — SCHEDULER #22 06:44Z: tip 617fd5ef, GATE 73/73 GREEN FULLREUSE over b2d73275's 386/386, tree 36299aeb; the pair sentence names choices and lapses; I3 additive; civicos-ui onpoint-choice.test corrected (UI-112 may meet it); rides batch30
order: after D-576, with the connection corrections: the record contradicting itself about a member's act (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 additive — `lapsed`/`why` on `on_point[side]`, and the selection sentence's content; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair), with REC-122's on-point choice (IC-232, C-74).
depends-on: UI-91.
scope: in `connectionsFor`'s `withChoice` (store.mjs, REC-122 block) check each current choice's ref against resolutions as `connectionGradeForContent` does and carry lapsed/why on `on_point[side]`; pass the choice state into `#pairSelection` so the sentence does not say "nobody has chosen" where a choice exists.
accepts-when: a chosen pair's sentence names the choice, and a choice whose resolution is gone reads lapsed with its why, on both arms (moves: a self-contradicting sentence). NEGATIVE CONTROL: drop the choice state from `#pairSelection` and the chosen-pair arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by UI-91's worker).

### UI-112 · integrated — **UI-91's ON-POINT CHOICE WILL BE REFUSED FOR A MENTION READ ON SEVERAL PAGES ONCE D-454 LANDS: D-454 makes `op=connectionchoose` take `occurrence=` and refuse C-74.4 CONNECTION_CHOICE_OCCURRENCE_UNNAMED when a string read at several places is named alone, and UI-91's `docChooseOnPoint` (both integrated, neither on main) sends no occurrence.** Found at SCHEDULER #21's reading of both reports (01:38Z). — owner UI.
status: integrated — SCHEDULER #22 06:36Z: tip bfd57de2, GATE 233/233 GREEN FULLREUSE (15352 assertions), tree 7d91b35f; the chooser offers each occurrence; r3Fed 82->83; rides batch30; minted D-625 (unplaced, see SCHEDULER-NEXT)
order: after D-575, with the connection surface: a chooser that the plane refuses for the common case offers an act that fails (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: none (reads D-454's I3: `occurrence=`, `occurrences` on the act and on connections&content= mentions).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair), with D-454's occurrence key and REC-122's choice (C-74).
depends-on: UI-91, D-454.
scope: the chooser offers each OCCURRENCE (page and position, from the plane's `occurrences`), sends `occurrence=` on the act, renders C-74.4 in its DEC-49 words, and shows a pre-D-454 choice the plane states AMBIGUOUS as it says.
accepts-when: a subject string read on three pages offers three choices and each is accepted (moves: C-74.4 on every multi-page mention). NEGATIVE CONTROL: omit `occurrence=` and the three-page arm reads C-74.4, failing by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs UI`).

### REC-215 · integrated — **NO MACHINE PROPOSAL OF A RISK TIER EXISTS, LABELLED AND APART FROM THE MEMBER'S VALUE.** BOB #33's risk-tier ruling (21:18Z; recorded in the inbox entry of 21:55Z), item 3: `actionriskpropose` (not yet an op), REC-195's shape. — owner RECORD.
status: integrated — SCHEDULER #22 06:50Z: tip 788649dc, GATE 386/386 GREEN FULLREUSE (21913 assertions), tree d359ded7; the risk proposal act (NON_ACTS, never writes the tier), C-90.6; CATALOG 1.30.0->1.31.0 (503); construct 8.risk-tier-proposal BUILT; rides batch30
order: after UI-104 (BOB #33: after (1), the proposal half last) (SCHEDULER #19, 2026-09-24)
milestone: M7
interface: I3 additive — a proposal read labelled machine work; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (only a member's authored act sets a tier), with REC-195's labelled-proposal shape and BOB #33's risk-tier ruling (sent by message 21:18Z, cited elsewhere as "21:21Z"; RECORDED in the BOB INBOX entry of 21:55Z, drained to `BOB-INBOX-drained.md` by SCHEDULER #20).
depends-on: REC-214.
scope: a proposal of a tier with its basis, stored apart from the member's value and labelled machine work; it never sets the tier.
accepts-when: a proposal reads labelled machine work and the tier is unchanged until a member acts (the measured failure it moves: no proposal read). NEGATIVE CONTROL: let the proposal write the tier and the "the tier is the member's" arm fails by name.
context: REC-216's audit (F1-F4, SCHEDULER #19's worker) and BOB #33's 21:55Z ruling: every `*propose` op is NON_ACTS in `bio-plane/src/affordances.mjs` (REC-195's reasoning) and a member states the value with their own act; so this proposal is a machine READ, never a member act in ACTS, and its surface SHOWS it beside the member's tier with no adopt control, as UI-102 (a2d974aa) does for the governing-laws proposal.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs REC`).

### M0-197 · integrated — **NO INSTRUMENT SEES A NEGATIVE-CONTROL ARM WHOSE PATCH ANCHOR HAS DRIFTED: four in one hour (D-535's statepaths arm b, D-600's nc-cap12 dropslides, D-601's default-discoverable, D-235's suggest.control arms) had not armed for days, each found only by a worker running its driver.** BOB #35 RULED 04:25Z: a standalone M0 instrument, not M0-188's family. — owner M0.
status: integrated — SCHEDULER #23 08:15Z: tip 11818309, GATE 81/81 GREEN FULLREUSE (6578 assertions, 377 units reused; first run 385/386, pen-sweep fixed), tree 388a3d87; tools/anchordrift.mjs in every gates profile: 316 drivers, 2204 LIVE, 51 DRIFT allowed and dated, 4 UNREADABLE; minted D-630..D-663 (bar D-633/D-635/D-641), D-678
order: at the head of the process rows, before M0-142: it cuts gate time, since a drifted control today costs a worker round to find (CLAUDE.md §2) (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative control: break the subject, watch the suite fail at a NAMED assertion), with BOB #35's 04:25Z ruling.
depends-on: none.
scope: a pure reader that loads every `*.control.mjs` driver's arm table, dry-applies each arm's anchor by COUNTING matches (never editing), and fails naming driver and arm when an anchor matches 0 times, or more than once where the arm edits one site; it runs in EVERY gate profile; a driver whose arms cannot be loaded as data is named UNREADABLE, never skipped. D-600's arm is its first expected failure.
accepts-when: the reader runs in every profile and names each drifted or UNREADABLE driver (moves: drifts found a worker round late). NEGATIVE CONTROL: reword one anchored line in a fixture copy and the arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs M0`; BOB #35 04:25Z).

### D-620 · integrated — **363 OF 376 bio-plane SUITES COMPARE WITH `JSON.stringify` EQUALITY, WHICH READS AN ABSENT VALUE IN AN ARRAY AS `null`, so any arm asserting a STATED null cannot tell it from a dropped key (measured in reviewcopy.control arm v, which stayed green until hardened).** Found by D-568's worker (05:36Z). — owner M0.
status: integrated — SCHEDULER #23 07:21Z: tip 72d488e0 (one commit over main 5e8a65a8), GATE 310/310 GREEN TARGETED (19125 assertions), tree 4dea9721; test-only: statedJSON comparator in 268 null-asserting suites + stated-null guard; hygiene reach floor 45->47; no defect minted
order: after M0-196, with the gate-instrument rows: an arm that cannot fail on a dropped key is a control that refutes nothing (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an equality that costs nothing to produce is not evidence).
depends-on: none.
scope: a shared comparator whose serialiser maps undefined to a distinct sentinel; adopt it in every suite that asserts a null (grep assertions naming null), not all 363.
accepts-when: each null-asserting suite uses the comparator and fails on a dropped key (moves: stated-null arms blind to a dropped key). NEGATIVE CONTROL: drop a stated-null key in one fixture and its arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-568's worker).

### D-542 · integrated — **THE DEC-49 GUARD SCORES A CODE "OUT OF REACH" WHEN ITS SURFACE RENDERS THE PLANE'S OWN WORDS: `check-refusal-codes.mjs` puts a code in reach only by R1 (a catalogue row), R2 (a code LITERAL in `app.html`) or R3 (a harness mock), so UI-68's review-copy surface, which renders `detail` and keys on no literal, left TEN of D-448's eleven codes scored out of reach for a day while a member could meet them.** Found by D-448's worker (branch `land/worker/D-448` 5eadd905: the Publication front matter and `13.review-copy` both carry "D-542 carries that fix (reach-by-op) and is NOT BUILT"). — owner M0 (the guard).
status: integrated — SCHEDULER #23 07:33Z (relayed by CONDUCT #22): tip fac514e0 on 5e8a65a8, GATE 101/101 GREEN (8063 assertions); CARRIES D-562; DEC-49 guard R5/R6: reach 488->595, reachGap ceiling 39->146 (D-641 owes it back); minted D-641, D-664; rides batch30
order: after D-550, with the DEC-49 instrument rows behind the product rows: it makes a false gate result (a reachable code read as unreachable) visible, which is product quality, but nothing regresses today since D-448 catalogues all eleven (Bob's 17:41Z rule) (SCHEDULER #21, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a guard's verdict is a statement about its walk, never about the member), with DEC-49's rule that every refusal a member can meet carries a canned translation.
depends-on: D-448.
scope: teach the walk REACH-BY-OP: a code minted on an op that a surface in `civicos-ui/app.html` calls (by the op's name through its request helpers) is IN REACH whether or not the surface names the code literally; an op no surface calls stays out of reach.
accepts-when: on D-448's parent (origin/main 9f8b69e6's review-copy mints) the walk sorts the ten review-copy codes IN REACH rather than F6 (the measured failure it moves: ten of eleven scored out of reach while UI-68's surface existed). NEGATIVE CONTROL: remove the surface's call to `reviewcopy`, and those codes fall back to out of reach by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by D-448's worker).

### D-574 · integrated — **D-550's ONE-MINT-SITE GUARD (arm G) AND ITS SWEEP WALK ONLY `store.mjs` AND `index.mjs`, so multi-site codes in other plane files go unwatched: AI_RUN_BOUND_UNKNOWN (4 sites, airun.mjs), TEXT_ATTEST_EXTENT (4) and TEXT_ANCHOR_MISSING (4, textchain.mjs), CAL_SIGNAL_SHAPE (3, calibration.mjs), AI_RUN_SKILL_VERSION_UNNAMED (2, skillpack.mjs) among them; the whole of `bio-plane/src` reads 93 candidates, not 62.** Found by D-550's worker (00:42Z). — owner M0 (the guard).
status: integrated — SCHEDULER #23 07:55Z: tip 06494735 on 5e8a65a8, GATE 104/104 GREEN FULLREUSE (8314 assertions), tree 4c524fbe; arm G reads every bio-plane/src/*.mjs but three stated; CEILING.multiSiteCodes 59->65; minted D-668
order: after D-542, with the DEC-49 instrument rows behind the product rows: it widens a guard, and no gate result is false today (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument states what it reads), with DEC-49's one-code-one-condition rule as D-484 settled it.
depends-on: D-550.
scope: widen `MULTI_SITE_FILES` to every `bio-plane/src` file, excluding by stated reason each file that PUBLISHES codes as data rather than minting them (affordances.mjs first); move the ceiling and candidate set to the printed figures.
accepts-when: arm G reads every src mint site and names the codes above (moves: two files walked of the plane's many). NEGATIVE CONTROL: plant a second site of a single-site code in textchain.mjs and arm G fails naming it.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-550's worker).

### D-560 · integrated — **`tools/release-assemble.mjs` (~140) STILL NAMES THE ONE-BUNDLE COMMAND: its NO_ARTIFACT detail says "Run `npm run build` in <dir>/", and the assembler dies on the FIRST missing artifact, so a releaser fixes one bundle at a time.** M0-188's sibling site (found by M0-188's worker, via CONDUCT #20 23:45Z). — owner DIST (the path), M0.
status: integrated — SCHEDULER #22 06:40Z: tip fc35dbf0, GATE 75/75 GREEN TARGETED (5844 assertions), tree bcaf7fe5; the assembler names every missing artifact once with node tools/bundles.mjs; no release cut
order: after D-548, with the process rows behind the product rows: it costs a release round, not a gate round, and no release is cut until the plan's current scope is done (BOB #34 22:30Z) (SCHEDULER #21, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a remedy an instrument prints must be the whole remedy), with M0-178's `node tools/bundles.mjs`.
depends-on: M0-188.
scope: the NO_ARTIFACT sentence names `node tools/bundles.mjs`, and the assembler reports every missing artifact before it dies; extend fleetbundles' TOTAL arm to cover it, or give release-assemble its own arm.
accepts-when: with two artifacts missing, one run names both and the one command (the measured failure it moves: one-at-a-time, the wrong command). NEGATIVE CONTROL: restore the old sentence and the arm fails by name.
added: 2026-09-24 · SCHEDULER #21 (id minted by M0-188's worker).

### D-566 · integrated — **THREE MORE HAND-KEPT TOOL COPY LISTS SURVIVE M0-170: `bio-plane/test/gates.test.mjs` ~924 (`["coord.mjs", "statepaths.mjs"]`) and `bio-plane/test/status.test.mjs` ~343 and ~565 (`["walkfloor.mjs", "provenance.mjs", "walkfigure.mjs"]`, status.mjs's closure), so a new import in the subject breaks its fixture with a false red.** Found by M0-170's worker (F2, 00:14Z). — owner M0.
status: integrated — SCHEDULER #23 07:24Z (relayed by CONDUCT #22): tip 25d51c4f on 5e8a65a8, GATE 75/75 GREEN TARGETED (5834 assertions); test-only: seven hand module lists derived via moduleClosure; rides batch30
order: after D-560 (D-569 is running), with the process rows: a false red costs a gate round only when the subject gains an import (M0-170's precedent, Bob's 17:41Z rule) (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a fixture derives what it carries).
depends-on: M0-170.
scope: replace each list with `moduleClosure({ repo, roots: [<tool>], dynamic: false })` as M0-170 did; state the sweep's reach (literal-name copies only).
accepts-when: an import added to coord.mjs or status.mjs leaves both suites green (moves: three hand lists). NEGATIVE CONTROL: restore one list, add an import, and that suite fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by M0-170's worker).

### D-564 · integrated — **SEVEN MORE SUITES END AT THEIR FIRST FIXTURE FAILURE ("FIXTURE ABORTED": dispose and exit), so one broken fixture hides every later section: casesearched, casesign, d150-statement-acknowledgement, d507-statement-ack-translation, rec212-statement-writer, reviewcopy, reviewcopy-inband.** Found by D-548's worker (00:33Z); 3 of 351 suites carry a `block()` recorder. — owner RECORD (the suites).
status: integrated — SCHEDULER #23 07:30Z: tip ae807e25 on 5e8a65a8, GATE 77/77 GREEN TARGETED (5899 assertions; the seven suites 85/85 on 0cdf6408); block() recorder in seven suites; coverage arms 2357->2368; pen-sweep UNCLASSIFIED ceiling 18->19 (M0-196 drops it to 13 at union); minted D-667
order: after D-566, with the process rows behind the product rows: it hides later failures for a round but no gate result is false (D-548's precedent) (SCHEDULER #21, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a suite measures every arm it declares).
depends-on: D-548.
scope: adopt `block()` and the per-section tally, -1 for a section that died, a section never reported a FAIL by name, as D-548 did; state the matcher's reach (the literal "FIXTURE ABORTED" only).
accepts-when: in each suite, one section's fixture broken leaves every other section reporting its tally (moves: 7 suites ending at the first failure). NEGATIVE CONTROL: break one fixture per suite and the others still report; disarm the recorder and the foot is missing, by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-548's worker).

### DIST-15 · queued — **THE INSTALLER'S `limits.subrequests` IS PINNED TO `wrangler.jsonc`, NOT CARRIED FROM THE SIGNED RELEASE, and a release without it is not refused: the signed manifest has no plane-limits field.** DIST-7's residue (DIST #6, 23:15Z): adding the field to the fleet statement (`bio-release-fleet/2`) would break every older installer's fleetSig reconstruction and degrade its updates to a plane-only install. — owner DIST.
status: queued — SCHEDULER #22 06:34Z: DIST's own row (the installer is out of bounds for workers); left for DIST #7
order: directly after DIST-7's place, in product order; the release-format choice is DIST's own (SCHEDULER #20, 2026-09-24)
milestone: M7
interface: I5 — a release-format change; the integrator classifies.
design: `docs/architecture/BIO_Distribution_v0_1.md` (the installer installs the signed release as released), with IC-82's carry of `compat` as the precedent.
depends-on: DIST-7.
scope: DIST decides the format first and records it in Distribution: a SEPARATELY signed plane-limits field, or a `/3` statement older installers are told to skip; then the installer carries `limits.subrequests` from the signed release and refuses a release without it by name.
accepts-when: `newgroup/test/` asserts both uploads send the RELEASE's `limits.subrequests`, a release without it is refused by name, and an older installer still verifies its fleet signature (the measured failure it moves: the value read from `wrangler.jsonc`, not the signed release). NEGATIVE CONTROL: strip the field from a signed release and the refusal arm fails by name.
added: 2026-09-24 · SCHEDULER #20 (`node tools/mintid.mjs DIST`).

### D-734 · running — **op=verify ANSWERS "NOT PUBLISHED" FOR A RATIFIED CASE DOCUMENT's doc_sha (measured on 6 ratified editions): only bundle parts and MANIFEST.json are in published_shas, and op=verify's own sentence equates "not published" with "never ratified" — false, on the no-account verify surface.** D-731's part (b); its part (a), the page's button checking op=casedocument, rides inside D-712. BOB #36 RULED 2026-09-25 11:50Z (drained by SCHEDULER #24; cite until folded). — owner RECORD.
status: running — SCHEDULER #24 13:00Z: spawned, stacked on land/worker/D-712 @ f10b1024
order: FIRST queued in the cache, directly after D-712, whose button it lets switch back to op=verify: the record claiming LESS than it holds on the public surface (CLAUDE.md §2) (SCHEDULER #24, 2026-09-25)
milestone: M10
interface: I3 — additive published_shas kind `case_document`; op=verify answers published:true naming it; op=publishedbytes serves the bytes; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §4 (the verify surface, usable with no account), with BOB #36's 11:50Z ruling.
depends-on: none (stacked on land/worker/D-712 @ f10b1024, integrated with D-731 part (a), on UI-121 @ 6ceb9b9b).
scope: at caseratify register the case document's sha in published_shas (kind case_document); op=verify answers published:true naming the kind; op=publishedbytes serves the bytes from case_documents.text, checked byte-identical to the signed sha. Fold into Publication §4. The button's switch back to op=verify is an optional UI follow-up, not this row.
accepts-when: op=verify on each of the 6 ratified editions' doc_sha answers published:true, kind case_document; publishedbytes serves bytes whose sha256 equals it; an unratified draft's document sha still answers not published (moves: 6 ratified documents reading never-ratified). NEGATIVE CONTROL: skip the registration and the 6-edition arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (`node tools/mintid.mjs D`, D-731 part (b), BOB #36 inbox).

### D-626 · integrated — **TWO PLANE SENTENCES STILL SAY A DRAFT THAT NAMES NO CASE IS A NEW CASE (D-538's class): C-87.6 REVIEW_NO_SUCH_CASE's translation ends "Leave the name off and the draft is a new case." (false since D-538: leaving it off lets publication DERIVE the case), and PUBLISH_DRAFT_NOT_THIS_CASE's detail calls `#caseIdentitySentence(di.caseId, di.edition)` without the draft's newCase, so a new-case draft is described with the derivation sentence.** Found by UI-106's worker (06:24Z). — owner RECORD.
status: integrated — SCHEDULER #23 07:45Z: tip 2a5d4ed8 on 5e8a65a8, GATE 61/61 GREEN FULLREUSE (5816 assertions; 395 units reused from c201e853's 385/385), tree 0de3bdb7; C-87.6 translation, PUBLISH_DRAFT_NOT_THIS_CASE detail/remedy take newCase, acknowledgeStatement fixed; regionLines +3; C-87.6 under changed: at union; derivation-draft condition to BOB (unminted)
order: after D-618, with the review-copy corrections: D-538's class in two more sentences (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: I3 — one translation's wording and one detail; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with D-538's identity sentence and BOB #32's newCase ruling.
depends-on: none.
scope: reword C-87.6's translation to say leaving the name off lets publication derive the case and asking for a new case is the separate choice; pass the draft's newCase into #caseIdentitySentence at is-publish-draft-this-case; census row per M0-195 (a translation change is behaviour).
accepts-when: neither sentence calls a derived draft new, and a new-case draft's refusal reads the new-case sentence (moves: 2 sentences claiming a new case). NEGATIVE CONTROL: drop newCase from the call and the new-case arm reads the derivation sentence, failing by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by UI-106's worker).

### D-346 · integrated — **THE THREE OPENDOCUMENT ENTRIES EMIT NO `core-properties` AND NO `intra` LINK: `odf.mjs` never reads `meta.xml` or the manifest and says so with `outside_content_xml_not_read` markers, while Content Framework §16 says the formats "preserve the same evidence".** — owner COFF.
status: integrated — SCHEDULER #23 07:12Z: tip 96eeb2d5 (stacked on D-612 f2dcbc6c on D-473 737913b0), GATE 367/367 GREEN FULLREUSE (21129 assertions), tree 4ee5b0c9; ODF meta.xml core-properties + manifest intra links; construct 5.odf-envelope; I2 IC the integrator's; design gap (no ODF column in OFFICE-FORMATS part-map table) to BOB
order: after D-320 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: I2 — the ODF part-map gains two item kinds; the integrator mints and classifies the IC.
design: `docs/development/OFFICE-FORMATS.md` §"What each part-map offers, and where it maps onto I2".
depends-on: none.
scope: read `meta.xml` into `core-properties`; walk the manifest for sha256 `intra` links; remove both markers. Extend `bio-plane/test/formats-odf.test.mjs`.
accepts-when: a planted creator appears as a `core-properties` item; a package without `meta.xml` still states the absence. NEGATIVE CONTROL: skip the `meta.xml` read, and the planted-creator arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### REC-204 · integrated — **AN OFFICE DOCUMENT'S ENVELOPE IS EXTRACTED AND NEVER CONTENT: tracked-change authors, comments, core properties and speaker notes are emitted by the format parsers and never projected, indexed or searchable (`textUnitsFor`: *"SPEAKER NOTES ARE NOT INDEXED"*).** Under DEC-5, surface it all. — owner RECORD.
status: integrated — SCHEDULER #23 07:36Z: tip 79be56b0 on 5e8a65a8, GATE 385/385 GREEN FULL (21886 assertions), tree e018ac73; ninth extent kind envelope (tracked-change/comment/core-property/speaker-note) indexed by op=acquire; construct 5.envelope; I2/I5 IC the integrator's; leg citing an envelope item NOT built
order: with the M2 extraction rows, after D-346 (SCHEDULER #17, 2026-09-23; D-124's first row, placed under a new id because D-124 names two rows)
milestone: M2
interface: I2/I5 — a NINTH extent kind, `envelope`, with an item-kind field; the integrator mints the IC for the extent census.
design: `docs/development/OFFICE-FORMATS.md` "THE ENVELOPE AS CONTENT" (on `land/bob/rulings-0923b` @ fd93bf1d, riding the next train): the extent carries the capture's grade, `cited_as` distinguishes it, and it is indexed LABELLED as envelope.
depends-on: none.
scope: the `envelope` extent and its projection; index each item labelled as its kind. Extend `bio-plane/test/search.test.mjs`.
accepts-when: a passage search finds a tracked-change author and speaker-note text, each labelled as envelope. NEGATIVE CONTROL: drop the envelope arm, and the tracked-change-author search returns 0 by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-375 · integrated — **`OBSERVATION-LOG-DESIGN.md` §4.2's FOURTH OUTCOME HAS NO PRODUCER: the persisted reading carries no character count, so `contentObservationsFor` cannot write LOOKED_ABSENT for a scan read to nothing, and it reads PRESENT.** `counts.chars` exists at acquire and is dropped. — owner CAPTURE, then RECORD.
status: integrated — SCHEDULER #23 08:00Z: tip 9a5df6e6 on 5e8a65a8, GATE 80/80 GREEN FULLREUSE (6535 assertions; 377 units reused from 384/385, its red corrected), tree b2988081; reading text_chars/text_glyphs/text_undetermined; LOOKED_ABSENT only when tier 3 ran and no residue; construct 9.content-absent BUILT; I5 additive IC the integrator's; adjacent-line merge with D-374; below-floor provisional with BOB
order: after D-346: a read that claims more than it holds, CLAUDE.md §2's worst class (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M3
interface: I5 additive — the reading's count; the integrator mints and classifies the IC.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §4.2.
depends-on: none.
scope: persist `counts.chars` on the reading at `op=acquire`; add the LOOKED_ABSENT branch in `contentObservationsFor`. Extend `bio-plane/test/observation-content.test.mjs` beside B8.
accepts-when: a scan read to zero characters writes LOOKED_ABSENT. NEGATIVE CONTROL: drop the count, and that arm reads PRESENT and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-374 · integrated — **A `pdf-page` EXTENT'S `rect` IS BOUNDED BY NOTHING: `checkContentExtent` asks only for four finite numbers, while `pagepixels.mjs` already computes each page's MediaBox and the plane never receives it.** — owner CONTENT-PDF, CAPTURE, RECORD.
status: integrated — SCHEDULER #23 07:40Z: tip c7703c3d on 5e8a65a8, GATE 84/84 GREEN FULLREUSE (6852 assertions; reuses 384/386 full run, reds fixed), tree ac4c7545; reading.page_boxes, C-45.1 bounds a pdf-page rect by MediaBox; construct 5.pdf-page-rect-bound; I5/I6 IC the integrator's; adjacent-line merge with D-375 at the acquire assembly; minted D-670, D-671
order: after D-375: content minted on a region the page does not have (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5/I6 — per-page `{w,h}` on the reading (nullable); the integrator mints and classifies the IC.
design: `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6 (which gains the bound).
depends-on: none.
scope: carry per-page dimensions onto the reading; the extent check refuses a rect outside the MediaBox by name (the stricter mechanism; clip-and-state is the architect's alternative if preferred). Extend the extent suite.
accepts-when: `[0,0,999999,999999]` is refused by name; a rect inside mints. NEGATIVE CONTROL: drop the bound, and the oversize arm mints and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-415 · integrated — **A WORKBOOK'S `sheet-range` UNITS ARE WHOLE SHEETS ONLY: `formats-xlsx.mjs` turns `definedNames` into anchor links and emits one `usedSheetRange` per sheet; table parts and ODF named ranges are not read.** — owner COFF.
status: integrated — SCHEDULER #23 07:50Z: tip 48245247 on 5e8a65a8, GATE 385/385 GREEN FULLREUSE (21877 assertions), tree 190b28c6; xlsx defined names + table parts, ods named/database ranges emit sheet-range rangeUnits (skips with reasons); I2 additive, IC the integrator's; construct 5.tables-images probes; minted D-672
order: after D-374 (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I2 — finer sheet-range units; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.3 item 1.
depends-on: none.
scope: a defined name and a table part each emit a `sheet-range` unit; a multi-area name is skipped with a stated reason. Extend `bio-plane/test/fw19-extent-arms.test.mjs`.
accepts-when: a fixture's defined name emits its unit. NEGATIVE CONTROL: before the fix the defined-name arm emits none and fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-419 · integrated — **THE CROP OF A CITED PDF IMAGE EXISTS AND NOTHING CAN ASK FOR IT: `cropImage` lives only in `pdf-worker/src/imagecrop.mjs`, with no route and no plane op.** — owner CONTENT-PDF, then RECORD; a UI item renders it.
status: integrated — SCHEDULER #23 08:48Z: tip 914bb380 on 5e8a65a8, GATE 386/386 GREEN FULLREUSE (21904 assertions), tree d0073437; pdf-worker POST /crop (I6 additive), the new content-crop read (I3 additive), C-99.1-5; CATALOG 1.30.0->1.31.0; census 223->224; construct 5.image-crop BUILT; two new governed regions (regionLines re-read at union); minted D-675
order: after D-416; display only, behind every over-claim (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I6 — a `POST /crop` route; I3 — a read-only op; the integrator mints and classifies the ICs.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4.
depends-on: none.
scope: the member route and a read-only plane op returning the crop for a cited image extent. Extend `pdf-worker/test/` and a plane suite.
accepts-when: a cited image extent returns its crop through the op. NEGATIVE CONTROL: route to the whole page, and the crop-dimensions arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-625 · integrated — **AN UNPLACED OCCURRENCE OF A STRING READ AT SEVERAL PLACES CAN NEVER BE CHOSEN: the choose act reads an empty `occurrence=` as NONE NAMED (`String(args.occurrence).trim() || null`), so the empty key an unplaced read carries is unreachable, and the member is refused C-74.4 for a place the plane itself listed.** Found by UI-112's worker (D-625 minted on land/worker/UI-112). — owner RECORD.
status: integrated — SCHEDULER #23 08:40Z: tip a42ba046 on 5e8a65a8, GATE 385/385 GREEN FULLREUSE (21875 assertions), tree d274e079; ABSENT vs PRESENT-EMPTY occurrence kept apart at the op line and the act; empty on a single-placed-read ref now C-74.3; I3 IC the integrator's; UI-112 union rewrites its D-625 sentences (text in the report); regionLines +1; minted D-676, D-677
order: head of the backlog — a correction to just-landed work (D-454 done, UI-112 integrated) outranks new work (SCHEDULER #23, 2026-09-25; verified at the code on origin/main store.mjs, the `named` line of the connection-choose act)
milestone: M4
interface: I3 — the choose act treats a PRESENT-but-empty `occurrence=` as the empty key; an ABSENT one is still none named. The integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair; UI-112's sentence naming D-625 as not built).
depends-on: none (D-454 done; UI-112 integrated, rides its batch — the surface already sends what the op lists).
scope: distinguish `occurrence` absent from `occurrence` present and empty in the choose act; the empty key selects the unplaced read; §14.5's and construct `6.on-point-ui`'s "an unplaced occurrence cannot be chosen" sentences corrected in the same commit.
accepts-when: a fixture string read at two places, one unplaced, is chosen at its unplaced occurrence and the portion grade answers from it. NEGATIVE CONTROL: restore the `|| null` collapse and the unplaced-choice arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (from SCHEDULER #22's hand-over; fix named by UI-112's worker).

### D-629 · integrated — **THE STORE ANSWERS ANY THROWN ERROR WITH ITS STACK: `Store.fetch`'s catch (store.mjs, the outermost handler) returns `String(e.stack)` to the caller for ANY throw on ANY op, and `index.mjs` has the same shape — so file paths, line numbers and constraint text reach a caller, and a constraint error reads as a stack instead of a refusal.** Found by D-578's worker (minted on land/worker/D-578). — owner RECORD.
status: integrated — SCHEDULER #23 09:30Z: tip 5e202b33 on 5e8a65a8, GATE 386/386 GREEN (21887 assertions), tree 128b3612; Store.fetch catch -> STORE_INTERNAL_ERROR (C-69.2) with correlation, no stack; index.mjs gains an outermost catch -> PLANE_INTERNAL_ERROR (C-69.3); IC-354 PROPOSED (I3, MAJOR-shaped) for CONDUCT; CATALOG 1.30.0->1.31.0; the default export became const PLANE (suites re-anchored); minted D-679
order: near the head — a disclosure defect outranks features (SCHEDULER.md loop step 3), behind D-625 only because that corrects just-landed work (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — every op's unhandled-error answer becomes a named internal-error code with no stack; the integrator classifies (BREAKING-shaped for any caller reading the text).
design: `docs/architecture/BIO_System_Design.md` §2 (trustworthiness of the record; DEC-49's named refusals), with CLAUDE.md §2 "less narrative binds us first".
depends-on: none.
scope: both outermost catches answer a named internal-error code and a correlation id, never the stack or message text; the stack is logged server-side; no op's named refusal changes.
accepts-when: a forced throw on a public op and on a member op answers the named code with no stack, path or line text (moves: String(e.stack) to the caller). NEGATIVE CONTROL: return the stack again and the no-stack arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-578's worker).

### REC-206 · integrated — **AN AGENDA ITEM'S MEMBERSHIP IN A FILE EXISTS ONLY AS RECT CO-LOCATION AN INSTRUMENT INFERS: tier-1 text units carry no position and a LinkRecord carries no anchor text.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *DESIGN IT — I2 gains position on tier-1 text units (page and rect) and anchor text plus a rect on LinkRecord; membership is DERIVED from containment, labelled machine work and graded inferred, never presented as the publisher's link.* — owner CONTENT-PDF, then RECORD.
status: integrated — SCHEDULER #23 09:20Z: tip 17ed9704 on 5e8a65a8, GATE 82/82 GREEN FULLREUSE (6612 assertions; 376 reused from 383/386, its three whole-output pins corrected by removing the new keys by name), tree 9206aa0d; tier-1 lines with rects, LinkRecord anchor, derived membership (machine, grade C, inferred) beside links[]; construct 5.pdf-positional PARTIAL; I2/I3 additive ICs the integrator's; structure 182->335 KB; grade-mapping gap to BOB
order: with the M2 extraction rows, after D-246; I2 PROVISIONAL, RECORD after PDF, as ruled (SCHEDULER #17, 2026-09-23, LED-7 S17-4; CPDF-3's worker)
milestone: M2
interface: I2 PROVISIONAL — positions and anchors; I3 — the derived membership; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (BOB folds it), with BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: CPDF-3 (`integrated`).
scope: the PDF member emits page and rect per tier-1 unit and anchor text plus rect per link; the plane derives item-to-file membership by containment, labelled and graded inferred.
accepts-when: an agenda's item-to-file membership reads derived, labelled machine work, graded inferred. NEGATIVE CONTROL: present it as a publisher link, and the labelling arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-340 · integrated — **CHROME IS A PROPERTY OF THE SITE AND THE PLANE RECORDS IT NOWHERE: `site_chrome` exists only in `LINK-FIDELITY.md`, which RATIFIES it as a derived table regenerable by scan; no table and no per-host navigation-change read are built.** — owner CAPTURE, then RECORD.
status: integrated — SCHEDULER #23 09:20Z: tip fdf6c8c9 on 5e8a65a8, GATE 386/386 GREEN FULLREUSE (21908 assertions), tree a1bde48f; NARROWED premise (links.chrome existed, never set): links carry chrome/chrome_basis, derived site_chrome + site_chrome_refs (in purge), new op navchanges; construct 2.site-chrome BUILT; census 224/120; I3/I5 ICs the integrator's; design gap + disclosure question to BOB
order: after D-419, with the M4 extraction rows (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: I5 — a derived table (in `purge`); I3 — a per-host read; the integrator mints and classifies the ICs.
design: `docs/development/LINK-FIDELITY.md` §"Chrome: rendering and connection are different problems".
depends-on: none.
scope: derive `site_chrome` per host by scan, add it to `purge`, and a read naming links a host's navigation lost between captures.
accepts-when: two captures of one host whose nav lost a link make the read name that link. NEGATIVE CONTROL: derive per page instead of per host, and the arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-177 · integrated — **THE CAPTURE GRADE BELOW THE CEILING IS STILL AUTHORED: `store.mjs` says *"there is no per-document capture grade anywhere in this schema"*; `#legEarnedCapture` applies REC-88/105's CEILING, not a measured value, so a member-authored grade under it stands unmeasured.** — owner CAPTURE, then RECORD.
status: integrated — SCHEDULER #23 09:10Z: tip 406ab5c1 on 5e8a65a8, GATE 385/385 GREEN (21876 assertions), tree a843d823; earned per-capture grade from captured_locators.via for direct captures read by #capturedAt (all four readers); archive-only stays undetermined — BOB's 07:55Z ruling rides D-693; construct 2.capture-grade PARTIAL; I3/I5 for the integrator
order: after D-191 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M9
interface: I3/I5 — a derived per-capture grade read by the strength walk; the integrator mints and classifies the ICs.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part I (the chain rules), with DEC-4 and DEC-75 (*capture grade is about the fetch path*).
depends-on: none — the ceiling (REC-88, REC-105) is built.
scope: derive a per-capture grade from `captured_locators.via` plus authority state, read it in `#strengthWalk`. The letter for a non-direct `via` is UNDETERMINED by any ruling found; if none covers it, that part goes to BOB (REC-50's precedent) and the row builds the direct case first.
accepts-when: a member-authored C on a direct capture reads the earned grade, not the authored one. NEGATIVE CONTROL: read the authored grade again, and that arm fails by name. Extend the strength suite.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-194 · integrated — **A MEMBER'S LEAD HAS A PLANE AND NO SURFACE: `op=lead`, `leadlook`, `leadread` and `leadshare`, the `leads` table and the internet frontier's read of them are built (`status.mjs` 10.lead), and `app.html` makes no lead call.** — owner UI.
status: integrated — SCHEDULER #23 08:30Z: tip 45437e4d on 5e8a65a8, GATE 320/320 GREEN (18842 assertions; 70 plane units reused), tree 93d52578; LEADS surface (op=lead, frontier internet, leadread, leadlook, leadshare); construct 10.lead surface BUILT, 9.ui PARTIAL; CIVICOS_UI_STATE v120 provisional; minted D-681, D-682
order: after D-177, a member surface on a built plane (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M4
interface: I3 consumer.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (the lead's surface).
depends-on: none — the plane half is built.
scope: a member writes a lead, records a look, and sees the frontier's LOOKED_ABSENT against it; the lead is shared only by the member's act. New harness in `civicos-ui/test/`.
accepts-when: a member writes a lead, records a look, and sees LOOKED_ABSENT against it. NEGATIVE CONTROL: stub `op=lead`, and the write-and-look arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; the plane half closed; keeps its `D-` id).

### D-189 · integrated — **NO SURFACE CAN SAY A PROJECT CARRIES ITS OWN BIAS: `op=biasmanifest` computes the effective set with project nullifications, `7.ui` is ABSENT, and `app.html` still says *"DECLARED BIAS is the HUNCH legs and nothing else"*.** — owner UI.
status: integrated — SCHEDULER #23 08:20Z: tip 4a9d1b21 on 5e8a65a8, GATE 111/111 GREEN FULLREUSE (8245 assertions; 281 units reused), tree 37ceea6b; project workspace reads op=biasmanifest at project scope; published case page adds the frozen bias sets to DEC-34 Declared bias; construct 7.ui ABSENT->PARTIAL; design gap (how a reader is shown the manifest; invited-not-joined) provisional, to BOB; reads REC-219's pins_proposed once it lands
order: after D-194 (SCHEDULER #17, 2026-09-23, LED-7 S17-2; verified at the code on `02603e88`)
milestone: M8
interface: I3 consumer.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption" (DEC-46).
depends-on: none — the manifest read is built.
scope: the project and publication surfaces read the manifest at project scope and state that the project carries its own bias; the hunch-only sentence is corrected. New harness in `civicos-ui/test/`.
accepts-when: a project with an adopted set shows it; an empty manifest shows no indicator. NEGATIVE CONTROL: render the indicator on an empty manifest, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-2; keeps its `D-` id).

### D-664 · integrated — **`civicos-ui/test/refusal-codes.control.mjs` IS STALE ON MAIN: on 5e8a65a8 arms (c), (e) and (r2) fail and (r5) THROWS on a moved anchor (store.mjs ~18517), so no arm after (r5) runs — the negative control for the refusal-code guard is not controlling anything.** Found by D-542's worker (minted on land/worker/D-542). — owner M0.
status: integrated — SCHEDULER #23 09:02Z: tip 597afbb3 on 5e8a65a8, GATE 73/73 GREEN FULLREUSE (6222 assertions), tree 60d5cc9b; test-only: (r5) anchored on the region END marker, (c)(e)(r2)(r6) re-measured, 47 arms 0 FAIL; D-662 (the same arm) closes with this landing; union with D-542 merges clean, needs (o1)/(o2) in the table and D-690; minted D-690
order: after D-641 — the control of the guard D-641 moves; a check that cannot fail is worse than none, so it precedes the rest of the process rows (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control), CLAUDE.md §5 (re-run a subject's control after changing it).
depends-on: none (D-542's R5/R6, integrated at fac514e0, adds arms; re-measure on the union if it lands first).
scope: re-anchor (r5) by its region marker, not a line; re-measure (c), (e) and (r2) and correct each with a comment saying why the old anchor was wrong; record the result on the suite's NEGATIVE CONTROL line.
accepts-when: every arm runs and each fails by name when its subject is broken, restored by hash (moves: three arms failing and one throwing on main). NEGATIVE CONTROL: this row is one — its record is the arm table.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-542's worker, relayed by CONDUCT #22).

### REC-201 · integrated — **A RECORDS REQUEST CAN ONLY BE A CALIFORNIA ONE: the action kind is `cpra_request`, and sovereign groups sit outside California.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *DESIGN DIRECTION ADOPTED — a law-neutral `records_request` kind carrying a `law` field; `cpra_request` stays readable as written.* — owner RECORD.
status: integrated — SCHEDULER #23 08:35Z: tip 45ce0bc5 on 5e8a65a8, GATE 81/81 GREEN (6597 assertions; 377 units reused; first run's affordances pin corrected 8->9), tree bfc5338a; records_request kind + law on op=projection, C-2.10; construct 8.records-request PARTIAL; I3/I5 IC the integrator's; union with D-147 adds no conflicted file (rebuild bundles, status --write)
order: behind the current M9/M10 product rows, as ruled (SCHEDULER #17, 2026-09-23; D-149's builder)
milestone: M10
interface: I3/I5 — a new action kind; the integrator mints the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: D-149 (`integrated` on c17-batch7).
scope: the `records_request` kind with its `law` field alongside D-149's governing-laws list; existing `cpra_request` actions read unchanged. Extend D-149's suite.
accepts-when: a `records_request` under a non-California law files and reads its law; an old `cpra_request` reads byte-identically. NEGATIVE CONTROL: rewrite `cpra_request` on read, and the unchanged arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### REC-202 · integrated — **A MEMBER CANNOT TAKE UP OR SET ASIDE AT THE INQUIRY'S GRAIN: the code declares an `options_grain` gap (offered at document grain, missing at inquiry grain) in `store.mjs`'s findings producers, and no row carried it.** BOB #32's ruling of 2026-09-23 23:08Z (cite until folded): *row it — a missing member door.* — owner RECORD if an op is missing, UI otherwise; check at the code at spawn.
status: integrated — SCHEDULER #23 09:15Z: tip 1716321d on 5e8a65a8, GATE 386/386 GREEN (21886 assertions), tree e98dd230; NARROWED as BOB #35 ruled 08:10Z: inquiry grain closed (lead publishes inquiry_acts: take up = cite, set aside = project-scoped proposedispose), stance/version stay §7 closures; UI doors, and the queue no longer offers acts the plane refuses NO_PROJECT_SCOPE; construct 12.lead-inquiry-acts BUILT; I3 additive IC the integrator's
order: behind the current M9/M10 product rows, before the M0 group (SCHEDULER #17, 2026-09-23; D-213's residue)
milestone: M9
interface: I3 — possibly an act; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §8 (the inquiry's QUESTION is a first-class object), with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: none — PL-15's out-of-inquiry lead is built.
scope: offer "take this up" and "set aside" at the inquiry grain wherever the code declares the gap; close the declared `options_grain` entries.
accepts-when: a member takes up and sets aside a finding at the inquiry grain, and no declared `options_grain` gap remains. NEGATIVE CONTROL: withhold the inquiry-grain option, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### D-680 · integrated — **A DERIVATION DRAFT (no `caseId`, no `newCase`) IS REFUSED `PUBLISH_DRAFT_NOT_THIS_CASE` ON AN EXISTING CASE'S FURTHER EDITION: publishCase's is-publish-draft-this-case region passes it only when `predicted === 1`, refusing the very deferral D-538 names.** BOB #35 RULED 2026-09-25 07:35Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; the whole ruling there, cite until folded): it binds to the case publication derives, any edition; a named case binds only if it IS the derived one, else refused by name with both. Found by D-626's worker. — owner RECORD.
status: integrated — SCHEDULER #23 09:35Z: tip 0d17eb0e (on D-626 2a5d4ed8), GATE 385/385 GREEN FULLREUSE on code tree 4b4e30c7, docs fold 307/307 GREEN on tree 37636a8e; derivation draft binds on any edition; C-44.6 PUBLISH_DRAFT_CASE_NOT_DERIVED; signed completeness.draft_case; CATALOG 1.30.0->1.31.0 (changed C-44.4, C-87.6); regionLines 4253->4264 (re-read at union); minted D-683
order: with the corrections at the head of the backlog, after D-671 — it corrects just-landed D-626's region (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 — a derivation draft admitted on a further edition; a new named refusal for a named case that differs from the derived one; the signed document's case-provenance statement; the integrator mints and classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 and §6A.4, with BOB #35's 07:35Z ruling, folded into §3 rule 13 by this row.
depends-on: none (stacked on land/worker/D-626 @ 2a5d4ed8, integrated; its reworded refusal text then says what this row makes true).
scope: in is-publish-draft-this-case, a draft with neither caseId nor newCase passes when the act's case equals the derived case; a named case differing from the derived one is refused by name with both; the signed document carries derived-at-publication or named-and-confirmed.
accepts-when: a derivation draft publishes as a further edition of the derived case, and a mismatched named case is refused with both cases (moves: `predicted !== 1` refusing a further edition). NEGATIVE CONTROL: restore `predicted !== 1` for the derivation arm and rec217-draft-binding's new further-edition arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, on BOB #35's 07:35Z ruling).

### D-633 · integrated — **WHEN TIER 2 WINS A PAGE, `mergeTier2Text` REPLACES ITS MARKERS, SO D-627's `image_content_unread` IS LOST AND THE PAGE ROUTES NOWHERE.** Reproduced through op=acquire with an answering tier-2 stub (the held INFO-2026-0301 does not escalate, so D-627's own pages are routed today). Found by D-627's worker (minted on land/worker/D-627). — owner CONTENT-PDF.
status: integrated — SCHEDULER #23 09:05Z: tip cbc5ae9b (ff over ae6d5a49; on D-627 056d3092), GATE 388/388 GREEN FULLREUSE (21956 assertions), tree a2ff404c; carries image_content_* across a tier-2 win and RE-GRADES by tier 2's glyphs (BOB #35 08:05Z); folded into §16; no IC
order: head of the backlog, before D-635 — a correction to just-landed work (D-627 integrated) outranks new work, and D-635 builds on the same routed pages (SCHEDULER #23, 2026-09-25)
milestone: M2
interface: none expected (a marker kept, not a new one); the integrator classifies if the chain's wire moves.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (tier markers; D-627's image-content rule, folded there by D-627).
depends-on: none (stacked on land/worker/D-627 @ 056d3092, integrated, itself on D-608 @ ffcc300b).
scope: in `textchain.mjs`, carry the base page's `image_content_*` markers onto a page tier 2 wins — they are facts about its images, not about the decode; tier-2's own markers otherwise unchanged.
accepts-when: a page carrying `image_content_unread` that tier 2 wins keeps the marker and still routes to OCR through op=acquire (moves: the marker dropped at the tier-2 merge). NEGATIVE CONTROL: drop the carry and the tier-2-wins arm fails by name, reading no marker.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-627's worker).

### D-670 · integrated — **A `pdf-page` RECT CARRIES NO COORDINATE SPACE IN THE CONTENT GRAMMAR: OCR anchors are image pixels (the ocr member's §2) while content extents and image placements are default user space (IC-203); `#posFields` passes `space` through and `legExtent` / `canonicalExtent` / `extentCovers` drop or ignore it — so an OCR region's pixel rect proposed through `op=extractpropose` is addressed as user space, refused C-45.1 when off the page since D-374 and passed BY ACCIDENT when it fits.** Attestation regions cannot be bounded either. Found by D-374's worker (minted on land/worker/D-374). — owner CONTENT-PDF, RECORD.
status: integrated — SCHEDULER #23 09:55Z: tip 9385caf7 (on D-374 c7703c3d), GATE 387/387 GREEN FULLREUSE (21923 assertions), tree bc528f2e; pdf-page and image extents carry space; non-user space REFUSED C-45.13 (not converted: needs D-671 and a MediaBox); diagnosis corrected to readingSource; op=narrow candidates and legExtent swept; CATALOG 1.30.0->1.31.0; I3/I5 IC the integrator s; construct 5.pdf-page-rect-space
order: near the head, after D-633 — the record claiming a region it does not address is the over-claim CLAUDE.md §2 ranks worst, and it corrects just-landed D-374 (SCHEDULER #23, 2026-09-25)
milestone: M2
interface: I3/I5 — the pdf-page arm gains `space`; a non-user space refused by name (or converted); the integrator mints and classifies.
design: `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §6 (the pdf-page rect and its bound, D-374), with IC-203's user-space convention.
depends-on: none (stacked on land/worker/D-374 @ c7703c3d, integrated).
scope: add `space` to the pdf-page arm; the checker refuses by name any space other than user space, OR converts image-px with the image dims, /Rotate and the MediaBox (state which, and why); `extentCovers` answers false across spaces; existing extents without `space` read as user space, stated.
accepts-when: an OCR pixel rect proposed through op=extractpropose is refused or converted by name, never admitted as user space (moves: a pixel rect addressed as points). NEGATIVE CONTROL: drop `space` at `#posFields` and the pixel-rect arm admits it, failing by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-374's worker).

### D-672 · integrated — **A WORKBOOK'S SHEET-RANGE UNITS EXIST AND NOTHING INDEXES THEM: `textUnitsFor` (index.mjs) yields nothing for `sheets[]`, and the store says so ("nothing yet writes a workbook's sheet-range units into the index"); CONTENT-SEARCH-DESIGN §4.1's Incomplete bullet still says the index "waits on the sheet-range arm", which has existed since FW-19.** Found by D-415's worker (minted on land/worker/D-415). — owner RECORD.
status: integrated — SCHEDULER #23 09:05Z: tip f676a996 (on D-415 48245247), GATE 385/385 GREEN FULLREUSE (21883 assertions), tree 3444e188; one sheet-range unit per sheet indexed; store admits xlsx/ods/csv; §4.1 corrected; I3/I5 additive IC the integrator's; union with REC-204 on CAPTURE_TEXT_UNIT_CONTAINERS (take both sets); nc-rec91 nowire re-anchored; minted D-684, D-685
order: after D-680 — it makes D-415's just-emitted units findable, on a unit §4.1 already designs (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3/I5 — the index admits sheet-range units; the integrator mints and classifies.
design: `docs/development/CONTENT-SEARCH-DESIGN.md` §4.1 (*a sheet's unit is a sheet-range*).
depends-on: none (stacked on land/worker/D-415 @ 48245247, integrated — for the named units; the whole-sheet unit rests only on FW-19, done).
scope: `textUnitsFor` recognises `sheets[]` by shape and emits one unit per sheet keyed by its `range` extent; the store's unit arm admits sheet-range; §4.1's Incomplete bullet corrected. Indexing the NAMED units (per-cell text subsets) is NOT designed — state it, do not build it.
accepts-when: a passage search over a captured workbook finds a cell's text in one unit labelled sheet-range (moves: workbook text unsearchable). NEGATIVE CONTROL: drop the sheets[] arm and the workbook search arm returns 0 rows, failing by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-415's worker).

### D-635 · integrated — **A PAGE ROUTED TO OCR WHOSE FOLIO DECODED LOSES ITS DERIVATION-PART PLACEMENT: BOB #35 RULED 06:25Z APPEND — the page keeps its layer text, the transcription is appended, and the page is listed in BOTH derivation parts, because D-252's guarantee that layer text is never lost outranks the parts' partition.** Minted by D-627's worker (its full finding rides its report). — owner CONTENT-PDF.
status: integrated — SCHEDULER #23 08:58Z: tip d31c52bf (on D-627 056d3092), GATE 388/388 GREEN FULLREUSE (21966 assertions), tree 78573944; APPEND: mergeTier3Text appends to a routed glyph page, both parts listed, extent.part on overlap; M-180 names every partition reader; I6 optional fields for the integrator; composes with D-633; minted D-686, D-687
order: directly after D-627, which creates the routed-with-folio pages it concerns (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 — a page may appear in both derivation parts; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with D-252's guarantee and BOB #35's 06:25Z ruling (this row's worker folds it).
depends-on: none (stacked on land/worker/D-627 @ 056d3092, integrated, itself on D-608 @ ffcc300b; D-633 runs on the same base).
scope: append the transcription to the page's layer text and list the page in both parts; FIND EVERY READER that assumes the parts partition pages (the "who else reads it" rule, CLAUDE.md §5), list each by name in the landing, and correct or prove each one.
accepts-when: a routed page with a decoded folio keeps its folio and gains its transcription, appears in both parts, and every named partition reader reads it correctly (moves: layer text lost or a page in one part only). NEGATIVE CONTROL: list the page in one part only and the both-parts arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-627's worker; BOB #35 06:25Z).

### D-665 · integrated — **A CHART OR TABLE PAINTED AS AN IMAGE UNDER A TEXT TITLE IS NEVER ROUTED TO OCR, AND NO SIGNAL YET SEPARATES IT FROM A PHOTO: BOB #35 RULED 06:25Z that the per-image `image_unread` marker states the truth without a classifier, and that ROUTING waits on one measured signal.** — owner CONTENT-PDF.
status: integrated — SCHEDULER #23 09:25Z: tip e9392ac8 (on D-627 056d3092), GATE 388/388 GREEN FULLREUSE (21960 assertions), tree 0354e698; per-image image_unread above a measured 0.001 floor (M-182: 323 markers, 209 pages); ROUTING STAYS OFF, measured (no signal separates charts from photos); decodeView keeps markers out of needsTier2/readText; union with D-633/D-635 is D-697
order: after D-635, the follow-up BOB #35 named after D-627: routing is a cost question, measured before it is switched on (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 only if a routing rule is set (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with BOB #35's 06:25Z ruling and M-178.
depends-on: none (stacked on land/worker/D-627 @ 056d3092, integrated, itself on D-608 @ ffcc300b; D-633 and D-635 run on the same base).
scope: over M-178's 49 classified pages MEASURE one signal (image pixel dimensions against the page's text area, or glyph density outside the painted rects) and set the routing rule where the classes separate; if none separates, routing stays off and the measurement says so. If D-627 did not carry the per-image `image_unread` marker (rect and area share, above D-420's size floor), build it here.
accepts-when: the signal's separation is recorded with date and instrument, and either a routing rule routes the chart-under-title pages or the record states none separates (moves: the class unrouted with no measurement). NEGATIVE CONTROL: invert the rule and the chart arm routes nowhere, by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs D`; BOB #35 06:25Z).

### D-615 · integrated — **`op=promote` STILL PROJECTS `bundles.created` AND `last_updated` FROM THE ENVELOPE, though the document states both (CORE_FIELDS): D-563's class, the last two fields.** Found by D-563's worker (05:47Z). — owner RECORD.
status: integrated — SCHEDULER #23 10:00Z: tip 8b3ab6ae (on D-546 b690552a), GATE 389/389 GREEN FULLREUSE (21983 assertions), tree 38c68c14; promote derives created/last_updated from the document; C-86.7 ENVELOPE_DATES_DISAGREE; projectfork stamps its own created; CATALOG 1.33.0->1.34.0; M-181 (0 of 31 differ); 22 plane + 1 UI fixtures corrected; minted D-692
order: after D-546, the same promote function one worker at a time: the envelope is a label, the document states what it is (SCHEDULER #22, 2026-09-25)
milestone: M7
interface: I3 — the projection's two dates; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510/D-563's derivation.
depends-on: none (stacked on land/worker/D-546 @ b690552a, integrated, itself on D-578 @ 700a432d on D-563 — same promote function).
scope: derive created and last_updated from the document as D-563 derives title and state; take a read-only census of live drifts FIRST (as M-172 did) before refusing a contradicting envelope; envelope as fallback only where the bytes state none.
accepts-when: the projection shows the document's dates, and a contradicting envelope is refused by name or recorded per the census (moves: envelope dates over the document's). NEGATIVE CONTROL: project the envelope's dates again and the date arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-563's worker).

### D-681 · integrated — **NO LEAD OP LISTS A MEMBER'S LEADS: D-194's surface lists from op=frontier&level=internet, whose `looked` keeps the latest look per SUBJECT (the lead's words; `#frontierInternet`), so a lead whose words equal another readable lead looked at later appears in neither `looked` nor `never_looked` — it vanishes from the member's list.** Found by D-194's worker (minted on land/worker/D-194). — owner RECORD.
status: integrated — SCHEDULER #23 10:10Z: tip ae80ca25 (on D-194 45437e4d), GATE 386/386 GREEN FULLREUSE (21893 assertions), tree 8078757b; a new bounded lead-list read (one row per lead, viewer-fenced), surface swapped to it; construct 9.ui back to ABSENT (no UI frontier caller); census 223->224; coverage floors re-read at union; I3 additive IC the integrator s
order: head of the backlog after D-671 — a correction to just-landed D-194: the list claims to be the member's leads and drops one (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3 — a new leads read or a regrouped frontier; the integrator mints and classifies.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (the lead's surface; its Incomplete bullet names this).
depends-on: none (stacked on land/worker/D-194 @ 45437e4d, integrated — the surface swaps its list read in the same landing).
scope: a new leads read (the author's and shared-to-me leads, bounded, each with its latest state) OR key `#frontierInternet`'s `looked` grouping on the lead rather than the subject — state which and why; the surface swaps its list read.
accepts-when: two readable leads with the same words, looked at in turn, both appear in the member's list with their own latest states (moves: a lead vanishing). NEGATIVE CONTROL: group by subject again and the same-words arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-194's worker).

### D-689 · integrated — **A MACHINE CREDENTIAL CAN STATE A RECORDS REQUEST'S GOVERNING LAW: nothing fences `law` on a `records_request` (REC-201) or the creation of a `cpra_request` from an `ai` credential, though which law governs is the member's characterization (D-149's C-32.18 fences only the governing-laws list).** BOB #35 RULED 2026-09-25 08:25Z, (b) FENCE BOTH, from DEC-24 and D-149 (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded): a machine may only PROPOSE either (REC-195's shape) and a member's act adopts; existing machine-created `cpra_request` rows read MACHINE-STATED, never rewritten. — owner RECORD.
status: integrated — SCHEDULER #23 10:45Z: tip 4ef3d303 (on REC-201 45ce0bc5), GATE 386/386 GREEN FULLREUSE (21914 assertions), tree 91214111; machine fence C-32.20 MACHINE_CANNOT_STATE_RECORDS_LAW on a CHANGE of the law key (BOB 08:25Z + 08:55Z folded into §2); law.stated_by from the introducing version; 6 fixtures corrected to records_request; construct 8.records-law-fence BUILT; CATALOG claims 1.34.0 (union picks one); regionLines +14; D-147 (on main now) union: keep lifecycle + governing_laws + law lines in #actionDerived
order: at the backlog head after D-682, the first row after REC-201 (running), which adds the `law` field this fences (BOB #35's placement; SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 — a named refusal for a machine credential; a machine-stated reading on existing rows; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*), with BOB #35's 08:25Z ruling, folded into §2 by this row.
depends-on: none (stacked on land/worker/REC-201 @ 45ce0bc5, integrated — it adds the `law` field this fences).
scope: refuse by name an `ai` credential stating `law` or creating a `cpra_request`; offer the propose-then-adopt path as REC-195 does for the list; a pre-fence machine-created row reads machine-stated from its recorded author class, unchanged.
accepts-when: an `ai` credential's cpra_request is refused by name and a member adopts its proposal (moves: a machine stating the law). NEGATIVE CONTROL: an `ai` credential creating a cpra_request is refused by name, and the pre-fence machine row reads machine-stated — lift the fence and the first arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, BOB #35's 08:25Z ruling).

### D-682 · integrated — **NO LEAD OP PUBLISHES WHAT A LOOK'S STATE MEANS: D-194's surface mirrors OBSERVATION_STATES in app.html (LEAD_STATE_WORDS, guarded against airun.mjs), and `partial`'s plane sentence carries a maintainer's parenthetical that is not member text.** Found by D-194's worker (minted on land/worker/D-194). — owner RECORD.
status: integrated — SCHEDULER #23 10:20Z: tip 1d635376 (on D-194 45437e4d), GATE 61/61 GREEN FULLREUSE on tree 85b052c5 (full battery 385/385 on 30e7f701, its only red the floor file corrected in 1d635376); vocabulary on leadread and frontier internet; LEAD_STATE_WORDS mirror deleted; I3 additive IC the integrator s; UNION WITH D-681: its lead-list op must carry the vocabulary and set LDS.vocab (CONDUCT told)
order: head of the backlog after D-671, with D-681 (running): the same surface's second plane gap (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3 additive — a `vocabulary` block on op=leadread and op=frontier level=internet; the integrator classifies.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5, with op=airunlog's `vocabulary` as the precedent shape.
depends-on: none (stacked on land/worker/D-194 @ 45437e4d, integrated — the surface deletes its mirror in the same landing; D-681 runs on the same base).
scope: op=leadread and frontier level=internet carry `vocabulary: { states: <the five>, outcomes: LEAD_LOOK_OUTCOMES }` with member-safe wording for `partial`; the surface reads it and deletes LEAD_STATE_WORDS.
accepts-when: the surface renders every state from the plane's vocabulary with no client mirror (moves: a mirrored vocabulary). NEGATIVE CONTROL: drop `vocabulary` from the op and the surface's state arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-194's worker).

### D-675 · integrated — **op=content REFUSES THE PLANE'S OWN `store=` PARAMETER AS A PREDICATE: `op=content&id=<row>&store=bio` answers FIXED_KEY_ONLY rejected ["store"], so op=content cannot be called with store=scratch — which CLAUDE.md §5 requires on EVERY live-verification call, leaving the choice between touching the real record and not verifying.** Driven in miniflare by D-419's worker (minted on land/worker/D-419). — owner RECORD.
status: integrated — SCHEDULER #23 09:50Z: tip 977da39d on 5e8a65a8, GATE 386/386 GREEN FULLREUSE (21879 assertions), tree 5f1ca597; the generic DO forward strips store beside token and op, so op=content takes store=scratch; swept the 4 whole-query-set consumers; makes D-419s contentCrop strip redundant (harmless) at union
order: at the head, spawned directly — a verification-safety defect on main (a live check forced into `bio`) outranks features (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — op=content (and any other fixed-key read found) admits store=; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §17 (organization and access — the content read op=content serves), with CLAUDE.md §5's scratch rule (every live-verification call names store=scratch) and D-325's `scopeFor`.
depends-on: none (on main today).
scope: the generic DO forward (index.mjs, the `inner` URL build) stops passing `store` into the store's predicate set for op=content, as the new content-crop read already strips it — OR Store.CONTENT_READ_PARAMS admits it; SWEEP every other fixed-key read for the same refusal and fix each found; list them by name.
accepts-when: op=content&id=<row>&store=scratch answers the scratch row, and store=bio the bio row, through the op (moves: FIXED_KEY_ONLY on store=). NEGATIVE CONTROL: pass `store` through again and the scratch arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-419's worker).

### UI-120 · integrated — **NO SURFACE RENDERS A CITED IMAGE'S CROP: D-419 built the new content-crop read (the crop of a cited PDF image extent, through the pdf member's POST /crop) and no page asks for it.** D-419's own row: *a UI item renders it*. — owner UI.
status: integrated — SCHEDULER #23 10:05Z: tip b6a94713 (on D-419 914bb380), GATE 61/61 GREEN FULLREUSE (5834 assertions), tree 91eac1b1; Show the cited image on image-extent legs only, asked on use; C-99 refusals rendered; surface-registry D1 78->80, D5 54->55, r3Fed 82->87; CIVICOS_UI_STATE v120 provisional (third claimant); orientation sentence gap stated
order: after D-677, with the display surfaces (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3 consumer.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4 (the crop of a cited image; D-419 updated it).
depends-on: none (stacked on land/worker/D-419 @ 914bb380, integrated).
scope: where a content row cites an image extent, the page offers its crop from the new content-crop read; C-99's refusals render in the plane's DEC-49 words; the crop is labelled as derived from the capture it names; nothing prefetched for a stranger.
accepts-when: a member viewing a cited image extent sees its crop, and a non-image extent shows no control (moves: a built op no surface asks). NEGATIVE CONTROL: stub the new content-crop read and the render arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs UI`, D-419's owed surface).

### D-690 · integrated — **`civicos-ui/check-refusal-codes.mjs` ENDS IN A BARE `process.exit(1)` WITHOUT THE D-282 FLUSH IMPORT, and D-542 grows its output 38 KB -> 61 KB: measured on the D-542 union with a plant, 7 of 32 parallel runs lost the tail (zero ratchet lines), so the guard's FAIL lines can vanish under load.** stdio-census ARM D's known residual, now LIVE. Found by D-664's worker (minted on land/worker/D-664). — owner UI (the 2026-09-16 M0->UI delegation).
status: integrated — SCHEDULER #23 09:45Z: tip eea7e8a5 on 5e8a65a8 (merges clean with D-542), GATE 84/84 GREEN FULLREUSE (6693 assertions), tree 4c98eee5; flush import on three check-*.mjs; stdio-census ARM D inverted; M-183: 0/64 truncated with the import, up to 13/32 without; RIDES WITH D-542; minted D-691
order: running now — it must land WITH or BEFORE D-542 (integrated, batch30), or the refusal-code guard can read green by losing its failures; a gate-trust defect that blocks a product landing (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (a run without its final line did not finish; admitted for M0 by name), with D-282's flush import.
depends-on: none (on main; measured against D-542's union).
scope: add `import "../bio-plane/test/stdio.mjs";` on line 2 after the shebang; remove the file from stdio-census.test.mjs RESIDUAL and shrink its header; do the same for check-semantics.mjs and check-mock-envelope.mjs (the same residual).
accepts-when: 16 parallel runs x2 of the guard with a plant on the D-542 union lose no bytes (moves: 7 of 32 truncated). NEGATIVE CONTROL: remove the import and the truncation trial fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-664's worker).

### D-684 · integrated — **A text/csv CAPTURE THROUGH op=acquire IS READ AS PROFILE TEXT AND NEVER REACHES THE FORMAT WIRE: the `canRead` branch wins, so a CSV gets no text_units and `reading.text_container` null — its cells are unsearchable though the csv format entry exists.** Measured in D-672's suite. Found by D-672's worker (minted on land/worker/D-672). — owner RECORD.
status: integrated — SCHEDULER #23 11:20Z: tip 9f6112d3 (on D-672 f676a996), GATE 385/385 GREEN FULLREUSE (21887 assertions), tree a6a4764a; a textual capture whose format entry declares text() reaches the format wire (CSV found by passage search); I1/I5 additive; adjacent-line union with D-374/D-375 at the acquire assembly; minted D-694
order: spawned directly after D-672 — it makes the same workbook-class search reach CSV, a correction to just-landed search work (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3/I5 additive — CSV text_units and text_container; the integrator classifies.
design: `docs/development/CONTENT-SEARCH-DESIGN.md` §4.1 (a sheet's unit is a sheet-range; D-672 built it for xlsx/ods and admitted csv in the store).
depends-on: none (stacked on land/worker/D-672 @ f676a996, integrated, itself on D-415 @ 48245247).
scope: in op=acquire, run the registered format entry's text() and textUnitsFor for a FORMAT-axis match even when profile text exists; the profile reading is kept as today.
accepts-when: a captured .csv is found by passage search in one sheet-range unit and its reading names its container (moves: text_units absent for CSV). NEGATIVE CONTROL: let the canRead branch short-circuit again and the CSV arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-672's worker).

### UI-119 · integrated — **NO SURFACE LETS A MEMBER STATE A RECORDS REQUEST'S `law`: REC-201 added the `records_request` kind and its `law` field, and neither app.html's action intake nor setup.mjs's page offers it, so every request filed there reads law UNDETERMINED — honest, and thin.** From REC-201's worker's report. — owner UI.
status: integrated — SCHEDULER #23 10:50Z: tip 530a3559 (on REC-201 45ce0bc5), GATE 101/101 GREEN FULLREUSE (8063 assertions) on tree f6580fa9, full battery 384/385 on c9c136e8 (its two reds fixed in 530a3559); law field on action intake and setup.mjs (kind chooser, refusedWhy); construct 8.records-request PARTIAL; CIVICOS_UI_STATE v120 provisional; minted D-695, D-696
order: after D-689 — the member's statement surface, after the fence that keeps a machine from making it (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 consumer.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*; folded by REC-201), with BOB #35's 08:25Z machine fence (D-689).
depends-on: none (stacked on land/worker/REC-201 @ 45ce0bc5, integrated; D-689 runs on the same base).
scope: a `law` control on app.html's action intake and setup.mjs's page when the kind is records_request, nothing prefilled (DEC-69); the plane's refusal (C-2.10) renders in its DEC-49 words; a machine-proposed law (D-689) is shown as proposed, adopted only by the member's act.
accepts-when: a member files a records_request naming a law and op=projection reads it verbatim (moves: law always undetermined from the surface). NEGATIVE CONTROL: drop the control's value from the act and the stated-law arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs UI`, REC-201's report).

### D-693 · integrated — **AN ARCHIVE-ONLY CAPTURE'S GRADE READS UNDETERMINED (CAPTURE_GRADE_VIA_UNRULED) THOUGH IT IS RULED: BOB #35 RULED 2026-09-25 07:55Z from doctrine on record (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded) — a capture whose only source is an archive replay (via archive.org) EARNS C as a MEASURED value, the same shape as the direct case, strictly below a direct capture; a capture with NO recorded via stays undetermined, named.** D-177's remainder: its worker could not take the edit and shipped the archive case undetermined. — owner RECORD.
status: integrated — SCHEDULER #23 10:15Z: tip c55e4419 (on D-177 406ab5c1), GATE 385/385 GREEN FULLREUSE (21883 assertions), tree 0945915f; ARCHIVE_CAPTURE_GRADE derived (C); archive-only earns C as measured; fetch carries archive/unrecorded/earned_via/whole; §14.2 fetch-path table, BOB 07:55Z folded; construct 2.capture-grade BUILT; minted D-698; no-locator naming question to BOB
order: spawned directly after D-177, which it completes (SCHEDULER #23, 2026-09-25)
milestone: M9
interface: I5 read semantics — an archive-only capture's leg reads at C; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.2, with ARCHIVE-FALLBACK.md's two-hop GRADE-C chain and AUTHORITY-AND-TRUST's transitive trust as BOB #35 applied them 07:55Z.
depends-on: none (stacked on land/worker/D-177 @ 406ab5c1, integrated).
scope: derive the archive letter in store.mjs from BASIS_GRADES, one rank below EARNED_CAPTURE_CEILING (UNREACHABLE_CAPTURE_GRADE's pattern), pinned in the suite to C and to op=acquire's stamped archive letter; captureBound(chain, thatLetter) is the measured letter for an archive-only capture; keep CAPTURE_GRADE_VIA_UNRULED for a via no ruling names; flip suite 9d and nc-d177 arm (b); move the construct probe; fold both 07:55Z rulings into §14.2 and clear its "routed to BOB" bullet.
accepts-when: a leg on an archive-only capture reads C as measured, and a no-via capture reads undetermined by name (moves: a ruled case read undetermined). NEGATIVE CONTROL: return the archive via to CAPTURE_GRADE_VIA_UNRULED and 9d fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, D-177's report).

### D-686 · integrated — **EVERY UNIT OF A MIXED DOCUMENT READS `chain_kind` 'ocr': `content.chain_kind` is the WHOLE chain's last step, so a text-layer page of a document OCR also touched is labelled as OCR'd.** Predates D-635. Found by D-635's worker. BOB #35 RULED 2026-09-25 09:05Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded): REPLACE on content, KEEP on capture_text, ONE function — `content.chain_kind` becomes the kind of the last derivation step covering the unit's page (partKeyOf / stepCovers), stored at mint or computed at read (the builder's choice, no second computation); existing rows are derived values, recomputing them is not a rewrite; `capture_text.chain_kind` stays document-level and its reader text says "the last step of this document's chain, not how any given page was read". — owner CONTENT-PDF, RECORD.
status: integrated — SCHEDULER #24 11:05Z: RE-TIPPED to 526cc17f (was 8c55a9c2; on D-635 d31c52bf), GATE 80/80 GREEN FULLREUSE (6532 assertions), full run on 591ecfa6 387/388 with its owed-controls red fixed, tree 524f6471; CARRIES BOB #35 09:35Z no-page mixed (591ecfa6), which overlaps D-710; a D-635 shared page still reads the last part appended (D-723 corrects); IC: content.chain_kind changes meaning (plain column, REC-104 store rebuilt); D-699 is the probe defect it re-reported
order: after D-671 with the PDF corrections, UNBLOCKED by BOB #35 09:05Z (SCHEDULER #23, 2026-09-25)
milestone: M2
interface: I5 — content.chain_kind changes meaning (IC REQUIRED; readers change); the integrator mints and classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (the derivation chain and its parts), with BOB #35's 09:05Z ruling, folded into Part II (the content object, extraction method) by this row.
depends-on: none (stacked on land/worker/D-635 @ d31c52bf, integrated, on D-627 — its overlapping parts and partKeyOf).
scope: one function computing a unit's chain kind from the last step covering its page; every reader and writer calls it; recompute existing rows; capture_text's reader text as ruled.
accepts-when: on a mixed fixture a text-layer page's unit reads its layer kind and an OCR'd page's reads 'ocr' (moves: every unit 'ocr'). NEGATIVE CONTROL: revert to the generated whole-chain column and the text-layer arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-635's worker).

### D-674 · integrated — **`manifest.created` IS THE WRITER'S `meta.last_updated`, NOT THE PLANE'S CLOCK: D-546's suite landed an amendment dated BEFORE the move preceding it, so every reader ordering by REC-182's `created` (op=export's promotions, the gate facts) can be steered out of write order by the caller.** Found by D-546's worker (minted on land/worker/D-546). — owner RECORD.
status: integrated — SCHEDULER #23 10:55Z: tip 96a7802f on 5e8a65a8, GATE 87/87 GREEN FULLREUSE (6654 assertions) on tree 8815078a, full 383/386 on 6f795f5f with its 3 reds fixed; every reader orders by rowid (export promotions, gateFacts, #revisionKind, capture-completed-unattended); created stays the writer s date; State Rules I-20; construct 3.write-order BUILT; union with D-546 on the State Rules Status line (keep both); minted D-700
order: after D-673, with the promote corrections — a caller-supplied date that orders the record is a provenance hop a caller can invent (CLAUDE.md §5) (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — the order op=export states for promotions; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.7 (write order is the record's order), with REC-182's `created`.
depends-on: none (on main today; D-546's census, integrated, pairs by write order already).
scope: order by rowid (write order) in every reader that orders by `created`, OR stamp the plane's clock into manifest.created and keep the writer's date beside it named as the writer's; list each reader by name.
accepts-when: an amendment carrying a backdated writer date reads AFTER the move it follows in op=export and the gate facts (moves: caller-steered order). NEGATIVE CONTROL: order by `created` again and the backdated arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-546's worker).

### D-641 · integrated — **107 REFUSAL CODES A MEMBER CAN RECEIVE HAVE NO CANNED TRANSLATION: D-542's R5/R6 walk brought them into reach (reach 488->595) and they are the whole reachGap rise 39->146 — e.g. relationdeclare NO_ENDS / SELF_RELATION, queuemute NO_KINDS, progressiondefine NO_STAGES; the publishedbytes codes overlap D-561.** Listed by check-refusal-codes' `IN REACH ONLY BY OP` line. Found by D-542's worker (minted on land/worker/D-542). — owner RECORD (REC-64's sweep).
status: integrated — SCHEDULER #24 11:43Z: tip 93741fbf (on D-542 fac514e0, carries D-562), GATE 386/386 GREEN FULLREUSE (22570 assertions), tree 605e2f7d; reachGap 146->39: 103 translated (C-100 REACH_BY_OP_CHECKS), 4 NOT_ON_THE_WIRE; 38 multi-site codes one mint each; acquire no-body split to FETCH_NO_BODY (non-additive); CATALOG 1.30.0->1.31.0; floors re-read at union; D-561 partly discharged (NOT_FOUND, NOT_PUBLISHED remain)
order: after D-628 — a member told a bare code instead of words is DEC-49's own defect and product, ahead of the process rows (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 additive — translations only; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it (member-facing refusals carry canned words), with `docs/development/VERIFICATION.md` (the DEC-49 guard) and D-542's R5/R6 arms as built.
depends-on: none (stacked on land/worker/D-542 @ fac514e0, integrated — the reach walk that lists them).
scope: for each of the 107, a DEC-49 row with its translation, OR show at the code that it never leaves on the wire and narrow the walk at that op; lower CEILING.reachGap in the same commit to the measured remainder. Batches of about 20 per commit are fine; the row closes when the gap is 39 or below and each exception is stated.
accepts-when: reachGap reads the measured remainder and every in-reach code carries words or a stated not-on-the-wire reason (moves: reachGap 146). NEGATIVE CONTROL: strip one new translation and the guard names that code.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-542's worker, relayed by CONDUCT #22).

### D-668 · integrated — **FIVE REFUSAL CODES TELL A MEMBER SOMETHING FALSE AT ONE OF THEIR SITES (DEC-49's one-code-one-condition rule, D-484): `calibrationSubjectRegister` refuses REGISTERING a subject with CAL_NO_PROBE / CAL_UNNAMED (written for a calibration MEASUREMENT); `checkAttestation` answers a missing DATE with TEXT_ATTEST_EXTENT ("say how much you checked") and a missing member with TEXT_ATTEST_MACHINE ("the credential is an automated one"); a `typed` step with no member gets TEXT_CHAIN_STEP_UNNAMED ("a machine read the text").** OBS_PRESENT_NO_REFERENT (airun.mjs) is UNDETERMINED: judge it. Found by D-574's worker (minted on land/worker/D-574). — owner RECORD (text-chain, calibration, airun paths), M0 for the ceiling.
status: integrated — SCHEDULER #24 11:10Z: tip 02848426 (on D-574 06494735), GATE 385/385 GREEN (21881 assertions), tree bfe55bbe; seven false-condition sites split into their own codes (CAL_SUBJECT_UNNAMED C-42.9, CAL_SUBJECT_NO_PROBE C-42.10, CAL_UNATTRIBUTED C-42.8, TEXT_ATTEST_UNATTRIBUTED C-35.16, TEXT_ATTEST_UNDATED C-35.17, TEXT_CHAIN_TYPED_UNNAMED C-35.15, OBS_PRESENT_REFERENT_UNBACKED C-22.17); CEILING.multiSiteCodes 65->59; CATALOG 1.30.0->1.31.0; I3 new wire codes; union with D-641 re-reads floors from prints; minted D-705
order: after D-641, with the DEC-49 translation rows — a false sentence to a member is the over-claim CLAUDE.md §2 ranks worst (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — new named codes; an IC if a surface builds on them; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one code, one condition), with `docs/development/VERIFICATION.md` (the DEC-49 guard, arm G).
depends-on: none (stacked on land/worker/D-574 @ 06494735, integrated — arm G walks the files these sites are in).
scope: give each of the five conditions its own code, catalogue row and translation; judge OBS_PRESENT_NO_REFERENT at its site and split it if false; remove each from MULTI_SITE_CANDIDATES and lower CEILING.multiSiteCodes in the same landing.
accepts-when: each of the five conditions answers its own code whose words are true of it, through the op (moves: five false translations). NEGATIVE CONTROL: route one condition back to its old code and arm G fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-574's worker).

### D-679 · integrated — **THREE PUBLIC OPS ANSWER A STORE FAILURE AT HTTP 200: index.mjs's op=invitelook, enroll and login read the store's answer as `json(await r.json(), 200)` and never read `ok`, so an anonymous caller is told success-status for a failure (since D-629 it at least carries a named code, not a stack).** REC-52's class. Found by D-629's worker (minted on land/worker/D-629). — owner RECORD.
status: integrated — SCHEDULER #23 10:30Z: tip 8894350b (on D-629 5e202b33), GATE 387/387 GREEN FULLREUSE (21908 assertions), tree 673b179f; FOUR public doors (claim, login, invitelook, enroll) now answer a store silence 502 STORE_DID_NOT_ANSWER via doAnswer; bytes on success unchanged; plane-envelope DETECTOR C widened to bound reads (61->62); d629 U1/L3 corrected
order: spawned directly after D-629, which it completes: the public door must not say 200 for a failure (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — the three public ops' failure status; the integrator classifies.
design: `docs/architecture/BIO_System_Design.md` §2 (trustworthiness of the record), with REC-52's doAnswer / storeSilent pattern as built.
depends-on: none (stacked on land/worker/D-629 @ 5e202b33, integrated).
scope: open the three through doAnswer and answer storeSilent (502) on a non-answer, or relay the store's status; sweep every other public route for the same read.
accepts-when: a forced store failure on each of the three answers a non-200 status with its named code (moves: HTTP 200 on failure). NEGATIVE CONTROL: restore the bare json(..., 200) on one and its arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-629's worker).

### D-683 · integrated — **A READING OF A NO-CASE DRAFT IS NOT COUNTED UNDETERMINED ON A FURTHER EDITION PUBLISHED WITHOUT draft=: `#statementAcknowledgements`' unbound COUNT query asks `edition=?`, but such readings are recorded at edition 1 (D-568), so the count drops them.** Established from the code, not driven. Found by D-680's worker (minted on land/worker/D-680). — owner RECORD.
status: integrated — SCHEDULER #23 10:35Z: tip 80d1db46 (on D-680 0d17eb0e), GATE 385/385 GREEN FULLREUSE (21885 assertions), tree 6fc9ca57; reproduced through op=publish; the unbound count drops its edition filter; Publication §3 rule 13 As built; minted D-703
order: spawned directly after D-680, the same edition filter D-680 removed from the link arm (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 — the unbound count on a further edition; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 and §6A.4 (as D-680 folded BOB #35's 07:35Z ruling).
depends-on: none (stacked on land/worker/D-680 @ 0d17eb0e, integrated, on D-626).
scope: drop the edition predicate from the count's case_id IS NULL arm, as D-680 did for the link arm; drive it first through the op (a further edition published without draft=).
accepts-when: a no-case draft's reading counts UNDETERMINED on a further edition (moves: the reading dropped from the count). NEGATIVE CONTROL: restore `edition=?` on that arm and the further-edition arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-680's worker).

### D-701 · integrated — **op=links AND D-340's navchanges DISCLOSE GATED CAPTURES: both name capture shas and page addresses to any member with no viewer stamp, so a member outside a gated bundle's project learns that the bundle exists and what it holds.** BOB #35 RULED 2026-09-25 09:30Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded): FILTER BY THE VIEWER, not intended — every row passes the viewer predicate BEFORE grouping or counting, and no count includes a row the viewer cannot see (the lead rule, MEMBER-KNOWLEDGE-DESIGN §5). Raised by D-340's worker. — owner RECORD.
status: integrated — SCHEDULER #23 11:10Z: tip 414439d2 (on D-340 fdf6c8c9), GATE 80/80 GREEN FULLREUSE (6513 assertions; 379 reused), tree 108a2ffa; #captureGate via #bundleGate; links and navchanges filter by the viewer before counting; gate-reads UNGATED->GATED; D-340 may now ride with it; minted D-706 (linkproject)
order: HEAD of the backlog — a disclosure defect outranks every feature (SCHEDULER.md loop step 3) (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — both ops' answers filtered by the viewer; the integrator classifies.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (a caller who cannot see receives exactly the answer a nonexistent row would give), with BOB #35's 09:30Z ruling.
depends-on: none (stacked on land/worker/D-340 @ fdf6c8c9, integrated — navchanges; op=links is on main).
scope: op=links and navchanges pass every row through the viewer predicate before grouping or counting; counts move only with visible rows; sweep the other link-family reads for the same.
accepts-when: a member outside a gated bundle's project sees neither its shas nor its addresses from either op, nor any count that moves with them (moves: disclosure). NEGATIVE CONTROL: a member outside a gated bundle's project calls both ops and must see neither its shas nor its addresses, nor any count that moves with them — drop the filter and it fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, BOB #35's 09:30Z ruling).

### D-688 · integrated — **`LIFECYCLE_TEXT_UNWRITABLE` (D-147, C-94.11) IS TWO CONDITIONS UNDER ONE CODE: C-94.11's sentence about exemptions and citation is FALSE for the token-field case (e.g. stage=Appeal), so a member is told something untrue.** Found at batch29's union figures pass (CONDUCT #22); the union declares it in arm G's MULTI_SITE_CANDIDATES and raises CEILING.multiSiteCodes 59->60 for it. — owner RECORD.
status: integrated — SCHEDULER #23 11:00Z: tip ca653547 on main 95fe7bc7, GATE 409/409 GREEN FULLREUSE (22932 assertions), tree 02302d5b; LIFECYCLE_TOKEN_MALFORMED C-94.12 split out (region is-lifecycle-token); five QUOTE_* judged closed; CEILING.multiSiteCodes 60->54; CATALOG 1.31.0->1.32.0 (may collide with D-668/D-641); floors re-read at union
order: after D-668, with the one-code-one-condition rows (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 — a new named code for the token-field case; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one code, one condition), with `docs/development/VERIFICATION.md` (arm G).
depends-on: none (D-147 done, on main 95fe7bc7).
scope: split the token-field case into its own code, catalogue row and translation; remove LIFECYCLE_TEXT_UNWRITABLE from MULTI_SITE_CANDIDATES and lower CEILING.multiSiteCodes back to 59. Optionally judge the five QUOTE_* candidates (same has()/refusal() shape the union judged CLOSED for D-147's nine) and lower the ceiling for each closed.
accepts-when: stage=Appeal answers its own code whose words are true of it, through the op (moves: a false sentence). NEGATIVE CONTROL: route the token-field case back to C-94.11 and arm G fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, CONDUCT #22's batch29 finding).

### D-673 · integrated — **C-4.2 AND A DOCUMENT'S IN-BYTES `state_history`: an undeclared edge in a document's OWN bytes has no reading under D-546's fence.** BOB #35 RULED 2026-09-25 08:00Z, option (b) (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded): it gets D-546's sentence ("made by a path the current rules do not allow (before <fence date>)") ONLY where the record's own history corroborates the same move — the pair in D-546's `statemovecensus` chain-joined moves for that bundle, at or before the fence; otherwise C-4.2 keeps the ERROR. A writer's timestamp never buys the pre-fence reading alone. M-179: 11 in-bytes entries, 0 undeclared — nothing live changes today. Minted by D-546's worker. — owner RECORD.
status: integrated — SCHEDULER #24 11:02Z: tip b8405ed4 (on D-546 b690552a), GATE 79/79 GREEN FULLREUSE (6489 assertions; first full run 388/389, its derivation-bounds red fixed), tree 1136ac51; C-4.2 reads a corroborated in-bytes undeclared edge in D-546 sentence (info), else ERROR; CATALOG 1.33.0->1.34.0; op=audit additive stated_moves (IC for CONDUCT); open note to BOB #36: fence-day move does not corroborate (strictly-before)
order: after D-628, with the promote corrections: it reads D-546's census and fence (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — C-4.2's corroborated reading; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.7, with BOB #35's 08:00Z ruling, folded into §4.7 by this row (clearing its D-673 Incomplete-sections bullet).
depends-on: none (stacked on land/worker/D-546 @ b690552a, integrated, on D-578 on D-563 — the fence and statemovecensus; D-615 runs on the same base).
scope: C-4.2 passes an undeclared in-bytes edge with D-546's sentence only when the census corroborates it at or before the fence; otherwise ERROR as today.
accepts-when: the corroborated twin passes with the sentence and the uncorroborated one fails (moves: no reading for an in-bytes undeclared edge). NEGATIVE CONTROL: a fixture carrying a backdated undeclared edge with no record corroboration must fail C-4.2 by name, and the corroborated twin must pass with the sentence.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-546's worker; placed on BOB #35's 08:00Z ruling).

### D-628 · integrated — **`op=promote` STILL THROWS A RAW NOT NULL STACK WHEN `current_state` (document and envelope), `meta.created` OR `meta.last_updated` IS STATED NOWHERE — for creations and revisions, and for `meta` sent as a string.** Found by D-578's worker (minted on land/worker/D-578). — owner RECORD.
status: integrated — SCHEDULER #24 11:00Z: tip db3b94a0 (on D-615 8b3ab6ae), GATE 81/81 GREEN FULLREUSE (6534 assertions; 381 reused from 6885e0a2 389/390, its m025 red corrected), tree d3ae26e9; revision carries head state/dates (fields_carried), creation unstated refused PROMOTED_FIELD_UNSTATED C-86.8; CATALOG 1.34.0->1.35.0; minted D-707
order: after D-615 — the same promote function as D-546, D-578 and D-615: one worker at a time (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — a named DEC-49 refusal on op=promote for a creation missing a required field; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4 (per-type schemas), with D-578's carry-or-refuse shape (C-86.5).
depends-on: none (stacked on land/worker/D-615 @ 8b3ab6ae, integrated, on D-546 on D-578 on D-563 — the same promote function).
scope: a revision carries the head's value for each field; a creation missing one is refused by a named DEC-49 code BEFORE the first write; a string `meta` is read or refused by name, never thrown.
accepts-when: each of the four fields absent on a creation is refused by name and on a revision is carried, with no stack in any answer (moves: a raw NOT NULL stack from promote). NEGATIVE CONTROL: remove the pre-write check and the creation arms fail by name, reading a stack.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-578's worker).

### D-618 · integrated — **A DRAFT THAT NAMES A CASE AND ALSO SETS `newCase` STILL ANSWERS THAT CASE'S NEXT EDITION beside a sentence saying its case is UNDETERMINED (publication refuses the pair CASE_IDENTITY_AMBIGUOUS), so the answer states an edition for a case the record has not chosen.** Found by D-568's worker (05:36Z). — owner RECORD.
status: integrated — SCHEDULER #23 11:05Z: tip dc4c41f9 on main 95fe7bc7, GATE 409/409 GREEN FULLREUSE (22930 assertions), tree 6ca8ddfc; #statedEdition null for the caseId+newCase pair across six answers (sixth: the live grant row); dead grants keep their stored edition; reviewcopy.control arms x,y,z (may collide at union); minted D-708
order: after D-613, with the review-copy corrections: D-568's class, one branch over (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: I3 — `edition` reads null for that pair; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's newCase ruling and D-568's `#statedEdition`.
depends-on: none (D-568 done, on main 95fe7bc7 via batch29).
scope: #statedEdition answers null when caseId and newCase are both set, in the same five answers D-568 covers.
accepts-when: a case-naming newCase draft answers edition null in all five (moves: an edition beside an undetermined case). NEGATIVE CONTROL: answer the named case's next edition again and the ambiguous-pair arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-568's worker).

### UI-117 · integrated — **A DRAFT HOLDING BOTH `caseId` AND `newCase` IS NOT SURFACED ON THE REVIEW-COPY FORM: BOB #35 RULED 2026-09-25 06:45Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded) — SURFACE it, never refuse to load, never drop `newCase` silently.** The form loads such a draft and shows BOTH values exactly as stored, with one plain line: this draft names an existing case AND a new one, and cannot be published until an owner keeps one (the plane refuses the pair, CASE_IDENTITY_AMBIGUOUS). Keeping one is the owner's own act — a save that clears the other field — offered with neither preselected (DEC-69). Found as UI-106's form gap. — owner UI.
status: integrated — SCHEDULER #24 11:27Z: tip 88d67095 on main 95fe7bc7, GATE GREEN FULLREUSE 62/62 re-run (5937 assertions) over the full run 336/336 on 3ad95d30 (its r4Suites 42->43 red fixed), tree 0f4c581e; the review-copy form loads a both-held draft as both, neither choice preselected (§6A.4, BOB #35 06:45Z); CIVICOS_UI_STATE v130 provisional (UI-118 claims v130 too); merge by hand with UI-118
order: after D-618 — the same both-identity pair, its plane half first (BOB #35's placement, 06:45Z; SCHEDULER #23, 2026-09-25)
milestone: M10
interface: none expected (UI only; reads what the draft already carries).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #35's 06:45Z ruling, folded into §6A.4 by this row.
depends-on: none (UI-106 done, on main 95fe7bc7 via batch29).
scope: the review-copy form round-trips a both-valued draft unchanged, renders both values and the one line, and offers "keep the existing case" / "keep the new case" as saves that clear the other field; nothing prefilled.
accepts-when: a both-valued draft loads, shows both, and a save without an owner's choice keeps both (moves: the form drops `newCase` silently). NEGATIVE CONTROL: restore the silent drop, and the arm that round-trips a both-valued draft fails by name, reading `newCase` gone.
added: 2026-09-25 · SCHEDULER #23 (BOB #35's inbox entry of 06:45Z).

### D-698 · integrated — **op=acquire STILL TYPES ITS ARCHIVE GRADE LETTER (index.mjs: `grade: via === "archive.org" ? "C" : EARNED_CAPTURE_CEILING`) — a second copy of a RULED value (D-693's ARCHIVE_CAPTURE_GRADE), pinned equal only by suite 9d; and acquire.test.mjs asserts the arm is "a TYPED letter, OPEN BY DECISION", which is now false.** Found by D-693's worker (minted on land/worker/D-693). — owner RECORD.
status: integrated — SCHEDULER #23 11:15Z: tip c0f7a56f (on D-693 c55e4419), GATE 385/385 GREEN FULLREUSE (21885 assertions), tree 049024b0; ARCHIVE_CAPTURE_GRADE exported from the catalogue, imported by store and index; acquire.test corrected; release/ and newgroup/dist carry the old stamp until DIST s next cut
order: spawned directly after D-693, which it completes (one ruled value, one definition) (SCHEDULER #23, 2026-09-25)
milestone: M9
interface: none (the same letter, one source).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.2 (the fetch-path table D-693 added), with BOB #35's 07:55Z ruling.
depends-on: none (stacked on land/worker/D-693 @ c55e4419, integrated, on D-177 @ 406ab5c1).
scope: export ARCHIVE_CAPTURE_GRADE from checks/bio-checks.mjs beside UNREACHABLE_CAPTURE_GRADE; import it in store.mjs and index.mjs; correct acquire.test.mjs's assertion with a comment saying why (never exempt).
accepts-when: the acquire stamp and the grade reader read one exported constant (moves: a typed duplicate of a ruled value). NEGATIVE CONTROL: change the exported letter and both the acquire stamp arm and 9d move together, failing by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-693's worker).

### UI-118 · integrated — **THE EXPORTED REVIEW COPY OMITS THE DATE TIE: when op=reviewcopy's `last_change.undetermined_within` is non-empty, UI-69's exported page carries `inband` but not `last_change`, so its Date line states a single last change the record cannot settle.** An owed UI act from D-573's report (via CONDUCT #22, batch29 union). — owner UI.
status: integrated — SCHEDULER #24 11:20Z: tip 14d8ae9e on main 95fe7bc7, GATE 77/77 GREEN FULLREUSE (6610 assertions; 411 reused; full run 336/336 on 01af37f1, its three reds fixed), tree c574f6d3; the exported review copy carries last_change.stated beneath each Date line when a tie exists; no file when the tie names a recipient (BOB #36 10:26Z: keep the refusal); CIVICOS_UI_STATE v130 provisional; union with UI-117 by hand on the export functions and review-copy.control arm (M)
order: after UI-117, with the review-copy surface rows (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 consumer.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 (the review copy's in-band quartet), with D-573's `last_change.undetermined_within`.
depends-on: none (UI-69 and D-573 done, on main 95fe7bc7 via batch29).
scope: the export renders the tie statement beside its Date line in the plane's words whenever undetermined_within is non-empty; nothing when empty.
accepts-when: an exported copy of a draft with a tie shows the statement by its Date line (moves: a single date beside a tie). NEGATIVE CONTROL: drop last_change from the export and the tie arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs UI`, CONDUCT #22's relay of D-573).

### UI-121 · integrated — **NO SURFACE SENDS `draft=` OR SHOWS `draft_case`: D-680 made the signed block state how its case was bound (derived_at_publication, named_and_confirmed, new_case_asked_at_publication, named_by_draft, new_case_asked_by_draft) and refuses a named case that is not the derived one (C-44.6), and no page offers the draft binding or shows which way the case was bound.** From D-680's worker's report. — owner UI.
status: integrated — SCHEDULER #24 11:23Z: HOLD — trains ONLY with or after D-712 (BOB #36 11:22Z, CLAUDE.md §2): without it the public case page tells strangers a signed case is unsigned. D-712 running, stacked on this tip 6ceb9b9b. Integrated: tip 6ceb9b9b (on D-680 0d17eb0e), GATE 318/318 GREEN FULLREUSE, tree 1d682494; NARROWED to part 2; parts 1+3 are UI-122
order: after UI-118, with the review-copy and publication surfaces (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 consumer.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (as D-680 folded BOB #35's 07:35Z and 08:15Z rulings).
depends-on: none (stacked on land/worker/D-680 @ 0d17eb0e, integrated, on D-626; D-683 runs on the same base).
scope: the publish act can name its draft (`draft=`), nothing preselected; a published case page states its `draft_case` in the plane's words; C-44.4 and C-44.6 render in their DEC-49 words with both cases named.
accepts-when: a member publishes from a named draft and the case page states how its case was bound (moves: a signed statement no surface shows). NEGATIVE CONTROL: drop draft_case from the page and the statement arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs UI`, D-680's report).

### D-667 · integrated — **ELEVEN MORE SUITES CAN ABORT A FIXTURE WITHOUT REPORTING WHICH SECTIONS NEVER RAN: four print "FIXTURE ABORTED" (d448-review-copy-translation, d543-instant-precision, rec213-reviewcopy-writer, rec217-draft-binding) and seven reach `process.exit` through a bail/abort/die const (case-edition-conclusion, case-project-conclusion, caselifecycle, caseratify-conclusion, current-shared-question, d442-publish-writes-nothing, rec170-manifest-pair).** D-548 and D-564 fixed eight; this is the sweep's remainder. Found by D-564's worker (minted on land/worker/D-564). — owner M0 (the suites).
status: integrated — SCHEDULER #24 10:57Z: tip d26851e7 (stacked on D-564 ae807e25), GATE 77/77 GREEN TARGETED (5899 assertions), tree a7be68a8; eleven suites under block()/needs(), d564-block.control 18 suites x 3 arms AS DECLARED; test-only; minted D-711; rec217 union with D-521/D-626/D-680 needs unique section names 7/8/9 (worker report)
order: after D-628, behind the head's product corrections: a process row that cuts false-green risk in the gate, placed near the head but never above product (CLAUDE.md §2, Bob 2026-09-22; SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (a suite measures every arm it declares), with D-548's block() recorder as built.
depends-on: none (stacked on land/worker/D-564 @ ae807e25, integrated — its d564-block.control.mjs SUITES table is extended here).
scope: adopt D-548's block() recorder and needs() in the eleven suites; add each to d564-block.control.mjs's SUITES table; state the matcher's blind spot (an abort under another name, an inline top-level process.exit) on the control's line.
accepts-when: each of the eleven, with one fixture broken, names the sections that never ran and its totals are unchanged when whole (moves: an abort that hides unrun sections). NEGATIVE CONTROL: disarm the recorder in one suite and its broken-fixture arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-564's worker).

### D-703 · integrated — **A SIGNED CASE DOCUMENT CREDITS THE PUBLISHER WITH AN EDITOR'S SENTENCE: `#statementWriter`'s `here` (`(d.case_id ?? null) === null && Number(edition) === 1`) matches a no-case draft only at edition 1, so when ella writes the exclusion statement in a no-case draft and iris publishes edition 2 without draft=, completeness.statement_by reads "iris" — "wrote this exclusion statement in the act that published this case" — into a signed document.** Driven in a scratch probe. Found by D-683's worker (minted on land/worker/D-683). — owner RECORD.
status: integrated — SCHEDULER #24 11:04Z: tip 3401cd78 (on D-683 80d1db46), GATE 385/385 GREEN FULLREUSE (21886 assertions; excludes 3 untallied, 23 UI units reused), tree 618f07c1; #statementWriter no-case arm at any edition, reproduced via op=publish 41/1 -> 42/0; I3: who a signed statement names as writer on a further edition; stated gap -> D-725
order: spawned directly — a false attribution in signed bytes is the over-claim CLAUDE.md §2 ranks worst, and it corrects the D-680/D-683 chain (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 — who a signed statement names as writer on a further edition; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (as D-680 folded BOB #35's rulings: a no-case draft binds on any edition) and §6A.4.
depends-on: none (stacked on land/worker/D-683 @ 80d1db46, integrated, on D-680 on D-626).
scope: drop the edition condition from `here` (a no-case draft's identity reads edition 1 per D-568, and since D-680 it publishes any edition); state, do not widen, the known gap that the writer read looks at every no-case draft rather than the named one.
accepts-when: edition 2 published without draft= names ella as writer in the signed block (moves: the publisher credited with an editor's bytes). NEGATIVE CONTROL: restore `Number(edition) === 1` and the edition-2 writer arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-683's worker).

### D-695 · integrated — **C-2.10's `law` ARM NEVER RUNS AT THE ACT: REC-201's recordsLawFindings is called only by the audit sweep (checkBundle), so op=promote LANDS a 250-character law (measured) and a law on a kind that is not records_request — the refusal REC-201 declared exists only in the catalogue.** Found by UI-119's worker (minted on land/worker/UI-119). — owner RECORD.
status: integrated — SCHEDULER #24 11:07Z: tip b6ebf625 (on D-689 4ef3d303), GATE 387/387 GREEN FULLREUSE (21933 assertions; excludes 3 untallied), tree f274fe7c; promote runs recordsLawFindings, RECORDS_LAW_REFUSED C-73.6 (region is-promote-records-law); CATALOG 1.35.0 (union reconciles); union: UI-119 D-695 PINNED arm becomes a driven refusal; minted D-717
order: spawned directly — a declared refusal the act does not enforce lets the record hold what its rules forbid (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 MAJOR-shaped — a refusal where an answer stood; the integrator mints and classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*), with DEC-49 as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it.
depends-on: none (stacked on land/worker/D-689 @ 4ef3d303, integrated, on REC-201 @ 45ce0bc5 — the same promote action block).
scope: in promote's action block, run recordsLawFindings beside actionBasisFindings and refuse under a named reason carrying findings[].detail (a new DEC-49 region); sweep other catalogue arms that run only in checkBundle and list each; correct ui119's "D-695 PINNED" arm into a driven refusal.
accepts-when: a 250-character law and a law on another kind are refused by name at op=promote (moves: a forbidden value landing). NEGATIVE CONTROL: remove the call and the over-long-law arm lands, failing by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by UI-119's worker).

### D-700 · integrated — **THE GATE'S C-20.1 AUDIT STILL WALKS A BUNDLE'S `_history/manifest.json` IN SNAP-KEY ORDER, not write order: readImage sorts by key and bio-checks.mjs sorts entries by key, so the gate's "prior" can differ from the plane's since D-674 ordered every plane reader by rowid.** State Rules §6 already said "sent to SCHEDULER" (REC-182) and no plan row existed. Found by D-674's worker (minted on land/worker/D-674). — owner RECORD, CHECKS.
status: integrated — SCHEDULER #24 11:43Z: report received: tip 50116ded (on D-674 96a7802f), GATE 80/80 GREEN FULLREUSE over full run 385/387 on 80c0ce1b (owed-controls fixed; gateresults passed alone), tree 61ef327f; readImage writes seq (I1 additive), historyWriteOrder, C-20.1 walks write order; union with D-546/D-615/D-673 keeps every State Rules Status sentence; minted D-718 (spawned), D-719 (placed)
order: spawned directly after D-674, which it completes (the plane and its gate read one order) (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I1/I3 — the image carries write order; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §6 (I-20, as D-674 amended it: "prior" is write order).
depends-on: none (stacked on land/worker/D-674 @ 96a7802f, integrated).
scope: the image carries write order (rowid or a seq) for each manifest entry; C-20.1 walks it instead of the snap key; images without it read the key order and say so.
accepts-when: a bundle whose snap-key order differs from its write order is audited in write order by C-20.1 (moves: gate and plane disagreeing on "prior"). NEGATIVE CONTROL: sort by key again and the divergent-order arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-674's worker).

### D-710 · integrated — **A WHOLE-DOCUMENT UNIT OF A MIXED DOCUMENT READS `ocr` (the chain's last step), which is the overstatement D-686 exists to remove.** BOB #35 RULED 2026-09-25 09:35Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded): a new value, `mixed` — chainKindFor answers the single kind when every derivation step covering the unit is one kind, and `mixed` when they differ; not NULL, since the record KNOWS it was read both ways; every reader that labels machine-read text treats `mixed` as CONTAINING machine-read text (DEC-4); an office unit with one kind reads that kind. D-686 (integrated) shipped the provisional last-step answer. — owner CONTENT-PDF, RECORD.
status: integrated — SCHEDULER #24 11:55Z: tip f34c4c9f, ONE commit on D-686 526cc17f (earlier 8c55a9c2 work never pushed, superseded), GATE 388/388 GREEN FULLREUSE (21990 assertions; excludes 3 untallied), tree 715cc0a6; unscoped-first chain reads undetermined (NULL), grammar names content:mixed, CHAIN_LAST driven through the op; nc-d710 arms as declared; D-686 IC must cover mixed and this undetermined case
order: at the backlog head after D-697 — it corrects just-integrated D-686 and rides its IC (SCHEDULER #23, 2026-09-25)
milestone: M2
interface: I5 — the chain-kind vocabulary gains `mixed`; rides D-686's IC; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.2 (as D-686 folded BOB #35's 09:05Z ruling), with the 09:35Z ruling folded there by this row.
depends-on: none (stacked on land/worker/D-686 @ 8c55a9c2, integrated, on D-635 on D-627).
scope: chainKindFor answers `mixed` for a no-page unit whose covering steps differ; every machine-read-text reader treats it as containing machine-read text; the search grammar and reader sentences name it.
accepts-when: the mixed fixture's whole-document unit reads `mixed`, and a one-kind document reads its kind (moves: a whole-document unit read as ocr). NEGATIVE CONTROL: the old last-step answer (`ocr`) fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, BOB #35's 09:35Z ruling).

### D-708 · integrated — **op=statementack's `listed` SENTENCE STATES AN EDITION AND A LISTING FOR A CASE THE RECORD HAS NOT CHOSEN: for a draft naming C1 AND asking for a new case, `#caseIdentitySentence(ident.caseId, ident.edition)` is called WITHOUT newCase and says "the completeness block of the next edition (N) of C1 lists this acknowledgement…", though publication refuses the pair.** Found by D-618's worker (minted on land/worker/D-618). — owner RECORD.
status: integrated — SCHEDULER #24 11:25Z: tip 656b0817 (on D-618 dc4c41f9), GATE 409/409 GREEN FULLREUSE (22932 assertions; excludes 3 untallied), tree 5b637947; statementack listed sentence for a pair draft is its own branch (no edition, no listing promised); NEGATIVE CONTROL 30 arms as declared; minted D-721 (placed) and D-720 (needs design, with BOB #36)
order: spawned directly after D-618, the same both-identity class one sentence over (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 — the listed sentence for the pair; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's newCase ruling and D-618's `#statedEdition`.
depends-on: none (stacked on land/worker/D-618 @ dc4c41f9, integrated, on main 95fe7bc7).
scope: pass draftNewCase to `#caseIdentitySentence` at that call (or branch the pair to a sentence saying no case document can list it until one instruction is withdrawn); sweep the other callers D-618 read and state any left alone (publish's draft-mismatch detail is D-626/D-680's region).
accepts-when: for a both-identity draft the acknowledgement's listed sentence names no edition and no listing (moves: an edition stated for an unchosen case). NEGATIVE CONTROL: drop newCase from the call and the pair arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-618's worker).

### D-706 · integrated — **op=linkproject DISCLOSES AND WRITES ACROSS THE VIEWER FENCE: it resolves any capture sha with NO viewer, so a member of no project received a hidden target's capture sha and the hidden project's id (`edges[].to`, `target_capture`, `source_bundle`) and wrote a links_to ref INTO the hidden project.** Measured by D-701's worker (minted on land/worker/D-701). — owner RECORD.
status: integrated — SCHEDULER #24 11:34Z: tip 6dd3e530 (on D-701 414439d2), GATE 388/388 GREEN FULLREUSE (21964 assertions; excludes 3 untallied), tree 8740f7bc; DISCLOSURE HALF: linkViewer stamped on linkproject, hidden source answers not-held and writes nothing, hidden targets out of the answer and its counts; d706-linkproject.test 20/0, NEGATIVE CONTROL 4 arms as declared; the WRITE HALF is D-722 (stacked)
order: spawned directly — a disclosure defect outranks every feature; it completes D-701's viewer fence (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — linkproject's answer filtered by the viewer; the integrator classifies.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (a caller who cannot see receives exactly the answer a nonexistent row would give), with BOB #35's 09:30Z viewer-filter ruling as D-701 built it.
depends-on: none (stacked on land/worker/D-701 @ 414439d2, integrated, on D-340 @ fdf6c8c9).
scope: DISCLOSURE HALF ONLY: stamp the viewer; refuse a hidden source capture as the record's not-held answer; keep invisible targets out of the answer and its counts (projected, skipped_*, unresolved). THE WRITE HALF (may an outsider's act write an edge to or from a bundle they cannot see) is with BOB #36 — do not decide it; state it.
accepts-when: a member of no project calling op=linkproject on a shared or hidden capture sees no hidden sha, project id or count (moves: disclosure). NEGATIVE CONTROL: drop the viewer stamp and the outsider arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-701's worker).

### D-702 · integrated — **D-340 JUDGES A LINK AS SITE CHROME BY CONTAINMENT ONLY, so a page-local sidebar that varies reads as a LOST chrome link (same_page:false).** BOB #35 RULED 2026-09-25 09:30Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded): chrome for links needs containment AND recurrence — site chrome is what RECURS across the site's pages in a chrome region; a page-local sidebar is page content; where recurrence cannot be measured (one page of the site held) the link reads chrome UNDETERMINED, never a loss. — owner CAPTURE.
status: integrated — SCHEDULER #24 12:31Z: tip 71a5d050 (on D-701 414439d2), GATE 388/388 GREEN FULLREUSE (21964 assertions), tree 5d403292; chromeJudge weighs recurrence over viewer-visible observations: lost only when 2+ distinct pages carried it, else page content or chrome undetermined; navchanges adds pages and undetermined (shape change, I3/I5); d340/d701 pins corrected; minted D-729
order: after D-701, the same op's second correction (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3/I5 — navchanges' judgement and the derived site_chrome; the integrator classifies.
design: `docs/development/LINK-FIDELITY.md` §"Chrome: rendering and connection are different problems", with BOB #35's 09:30Z ruling, folded there by this row.
depends-on: none (stacked on land/worker/D-701 @ 414439d2, integrated, on D-340 @ fdf6c8c9; D-706 runs on the same base).
scope: a link is chrome when contained in a chrome region AND recurring across the host's held pages; a single held page reads chrome undetermined; a varying sidebar's links are content; navchanges names a loss only for chrome by both tests.
accepts-when: a varying page-local sidebar reports no lost chrome link, and a one-page host reads undetermined (moves: a sidebar read as lost chrome). NEGATIVE CONTROL: judge by containment alone and the sidebar arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, BOB #35's 09:30Z ruling).

### D-685 · integrated — **THE ACQUIRE WIRE'S BUDGET LOOP DROPS A WHOLE UNIT whose text plus envelope exceeds the remaining budget (524,288 B), instead of carrying its per-unit-capped prefix (the store caps a unit at 128 KiB with truncated=1) — so a large sheet (M-20: 72.6 MB over 1,056 sheets) silently loses units from search.** Diagnosed at the code, not measured. Found by D-672's worker (minted on land/worker/D-672). — owner RECORD.
status: integrated — CONDUCT #23 12:34Z: worker report — tip 3094f19b (on D-684 9f6112d3), GATE 385/385 GREEN FULLREUSE (21895 assertions); truncated units carried; I3 additive text_units[].truncated; M-184, D-724 minted; rides batch30 after D-684
order: after D-684, the same acquire path, one worker at a time (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3 — a truncated unit carried where one was dropped; the integrator classifies.
design: `docs/development/CONTENT-SEARCH-DESIGN.md` §4.1, with the store's per-unit cap (CAPTURE_TEXT_UNIT_CAP) and the truncated flag.
depends-on: none (stacked on land/worker/D-684 @ 9f6112d3, integrated, on D-672 on D-415 — the same acquire wire).
scope: MEASURE first (a fixture over the budget) in measurements/<id>.md; charge min(bytes, CAPTURE_TEXT_UNIT_CAP) and carry the prefix with `truncated: true`, which the store honours; state what is still dropped when even prefixes exceed the budget.
accepts-when: a unit over the remaining budget is carried truncated and marked so, and search finds its prefix (moves: a unit silently dropped). NEGATIVE CONTROL: charge the whole unit again and the carried-prefix arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-672's worker).

### D-709 · integrated — **A CAPTURE WITH NO RECORDED FETCH ROUTE IS SILENT: a document with no locator carries no `fetch` key, so a reader cannot tell "the route was measured and is absent" from "nobody measured it".** BOB #35 RULED 2026-09-25 10:05Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded): STATE IT ON EVERY ENTRY — a no-locator capture carries `fetch: {route: "unrecorded"}`, and its grade reads authored-under-ceiling, never as measured (CLAUDE.md §4: undetermined is first-class and stated). Raised by D-693's worker. — owner RECORD.
status: integrated — CONDUCT #23 12:47Z: worker report — tip 97e2925c (on D-698 c0f7a56f), GATE 385/385 GREEN (21887 assertions); no-locator capture states fetch route unrecorded; IC-355 PROPOSED on the branch (resolve at union); rides batch30 after D-698
order: after D-698 (running on D-693), the same earned-basis entries (SCHEDULER #23, 2026-09-25)
milestone: M9
interface: I5 — additive `fetch.route: "unrecorded"` on every no-locator capture entry; an IC required; the integrator mints and classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.2 (the fetch-path table D-693 added), with BOB #35's 10:05Z ruling, folded there by this row.
depends-on: none (stacked on land/worker/D-698 @ c0f7a56f, integrated, on D-693 @ c55e4419).
scope: every capture entry with no locator carries fetch {route: "unrecorded"}; its leg grade reads authored-under-ceiling and says so; the ~30 suites that pin whole entries are CORRECTED with a comment saying why, never exempted.
accepts-when: a no-locator capture's entry states route unrecorded and its leg reads authored-under-ceiling (moves: a silent entry). NEGATIVE CONTROL: omit the key again and the stated-route arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, BOB #35's 10:05Z ruling).

### D-692 · integrated — **A REVISION WHOSE BYTES RESTATE `created` LANDS, and bundles.created keeps the creation's value (the ON CONFLICT arm never writes it), so the row and the head bytes disagree — measured: a creation dated 2026-07-24 revised to bytes saying 2020-01-01 landed, and the row still says 2026-07-24.** None live (M-181). Found by D-615's worker (minted on land/worker/D-615). — owner RECORD.
status: integrated — CONDUCT #23 11:41Z: worker report — tip 332c594e (on D-628 db3b94a0), GATE 390/390 GREEN FULLREUSE (22031 assertions); C-86.9 REVISION_REDATES_CREATION; CATALOG 1.36.0 to re-read at union; minted D-726; rides batch30 C2 after D-628
order: after D-628, the same promote function, one worker at a time (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — a named refusal on op=promote; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (C-2.5 and D-615's derivation), with State Rules v1.5 §4.7's rule that a writer's timestamp never buys an earlier reading (BOB #35 09:05Z/08:00Z, D-673).
depends-on: none (stacked on land/worker/D-628 @ db3b94a0, integrated, on D-615 @ 8b3ab6ae).
scope: refuse by name a non-replay revision whose document's `created` differs from the head's (C-86.2's shape, one field over); replay exempt as D-615 made it. Decided by SCHEDULER #23: refusal, not moving the row — moving it would let any writer backdate a creation, which the record's own rules already refuse elsewhere.
accepts-when: a revision restating a different `created` is refused by name, and one restating the same lands (moves: row and bytes disagreeing). NEGATIVE CONTROL: drop the check and the backdated-revision arm lands, failing by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-615's worker).

### D-712 · integrated — **THE PUBLISHED CASE PAGE TELLS EVERY STRANGER A SIGNED, RATIFIED CASE IS UNSIGNED: pubCaseHtml's "The case document · signed by …" line reads `c.document`, which op=publishedcase NEVER serves (Store.publishedCase builds state.document through #caseEditionState and its return omits it), so it prints "This case edition's own document has not been signed yet".** Measured by UI-121's worker: data-casedoc="none" on five cases each signed through op=caseratify. publishedcase.test.mjs's fixture carries a `document` key the live op does not (D-173's class). — owner RECORD.
status: integrated — SCHEDULER #24 12:57Z: RE-TIPPED f10b1024 (was 6e1e4669) carrying D-731 part (a): the Verify button asks op=casedocument (ratified at that sha), driven live 58/0; GATE 73/73 GREEN FULLREUSE re-run over 385/385 at 6e1e4669, tree 7aff9a05; preauth-vocabulary apiQ pin 10 corrected. UI-121 + D-712 at f10b1024 may train together (BOB #36 holds met); part (b) is D-734
order: spawned directly, ahead of the backlog: the record claiming LESS than it holds on the one page strangers read is a trustworthiness defect (CLAUDE.md §2, "less narrative" binds us first) and a correction to just-landed work (SCHEDULER #24, 2026-09-25)
milestone: M10
interface: I3 — additive `document` on op=publishedcase; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 (rule 13, the published case states its signed document) and §9.
depends-on: none (stacked on land/worker/UI-121 @ 6ceb9b9b, integrated, on D-680 @ 0d17eb0e; its draft-binding fixtures sign through op=caseratify).
scope: publishedCase() returns `document: state.document`; publishedcase.test.mjs's fixture is anchored to the live wire (correct it with a comment saying why the old fixture was wrong); the page's signed-document line then reads true. The UI-only alternative (read op=casedocument for that line) is the fallback only if the plane field cannot be served to a stranger.
accepts-when: on each of the five draft-binding cases a stranger's published case page reads the signing line, never "not been signed yet" (moves: data-casedoc="none" on five signed cases). NEGATIVE CONTROL: drop `document` from the return and the stranger arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by UI-121's worker).

### M0-139 · integrated — **TWO ARMS OF `current.control.mjs` CANNOT FAIL: arm 8 refuses to arm (its anchor occurs twice in `store.mjs` since REC-124 added `#findingsConcludedElsewhere` with `#findingsStanceDiverged`'s guard), and arm 7's must-fail name survives in `current.test.mjs` only as a comment, and no suite asserts `no_project_scope`.** Predates D-125 (read on 91bcea6b, main and c17-batch4). — owner M0.
status: integrated — SCHEDULER #24 11:30Z: tip 03935461 on main 95fe7bc7, GATE 79/79 GREEN TARGETED (6089 assertions), tree 7137f076; NARROWED: arm 8 split 8a/8b (anchor occurred 3 times), arm 7 fails the new no_project_scope assertion by name, 8a fails by name; 8b is DECLARED-GREEN because op=purge deletes what its producer reads, so its witness is D-727; the driver records a never-armed arm as WRONG
order: first of the M0 rows, ahead of process tooling: a negative control that cannot fail is a product suite (the queue's findings) left unverified, not a gate-time tool (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (3), verified by string count)
milestone: M0
interface: none — a control and one assertion.
design: `docs/development/VERIFICATION.md` (the negative control and its `NEGATIVE CONTROL:` line; CLAUDE.md §5's *"Run the negative control"*).
depends-on: none.
scope: split arm 8 into 8a and 8b, each anchored on its producer's signature line plus the guard; add a `current.test.mjs` assertion driving a finding filed under no project to `available:false, reason:"no_project_scope"` and point arm 7's must-fail at it.
accepts-when: `node bio-plane/test/current.control.mjs` reports every arm run and 0 NOT as declared; 8a and 8b each fail "PURGE THE SHARED QUESTION AND BOTH ITEMS GO QUIET", arm 7 fails the new no-scope assertion by name. NEGATIVE CONTROL: the control's own arms, each recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs M0`).

### D-725 · integrated — **A SIGNED CASE DOCUMENT CAN NAME THE WRITER OF ANOTHER CASE'S DRAFT: `#statementWriter` reads EVERY no-case draft in the project, not the draft `draft=` named, so a same-bytes no-case draft prepared for another case answers for this one — its author is named in completeness.statement_by, or drafts_disagree/UNDETERMINED if the authors differ.** Stated (not built) by D-703's worker in the code, Publication §3 rule 13 and construct 13.statement-ack. — owner RECORD.
status: integrated — SCHEDULER #24 11:47Z: tip c90c4b10 (on D-703 3401cd78), GATE 385/385 GREEN (21888 assertions; excludes 3 untallied), tree 837962e2; with draft= the writer read consults THAT draft only; reproduced via op=publish 42/2 -> 44/0; rule 13 and 13.statement-ack no longer state the gap; the no-cut hold on D-703 is answered
order: spawned directly, stacked on D-703: a false attribution in signed bytes outranks every feature (CLAUDE.md §4, never invent an attribution) and corrects just-landed work (SCHEDULER #24, 2026-09-25)
milestone: M10
interface: I3 — who a signed statement names as writer when draft= is given; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (a no-case draft binds on any edition; the draft named is the draft read) and §6A.4.
depends-on: none (stacked on land/worker/D-703 @ 3401cd78, integrated, on D-683 @ 80d1db46).
scope: when draft= is given, the writer read consults THAT draft only; without draft=, keep D-703's behaviour and its stated disagreement. Remove the stated gap from rule 13 and construct 13.statement-ack once built.
accepts-when: two same-bytes no-case drafts by different authors, one named by draft=: the publish names the named draft's author, never the other and never UNDETERMINED (moves: another draft's author named, or a needless UNDETERMINED). NEGATIVE CONTROL: read every project draft again and the named-draft arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (`node tools/mintid.mjs D`, D-703's stated gap).

### D-717 · integrated — **FIVE ACTION-FAMILY CATALOGUE ARMS RUN ONLY IN THE AUDIT (checkBundle), so a member's op=promote SAVES what they forbid (measured by D-695's worker): an action_kind outside ACTION_KINDS; a risk_tier outside its vocabulary; a counterparty that is the placeholder "to be named" or incoherent; `resolved` with no resolution; a C-11.1 clock entry with no basis or malformed.** — owner RECORD.
status: integrated — SCHEDULER #24 12:23Z: tip 94cdeb45 (on D-695 b6ebf625), GATE 81/81 GREEN FULLREUSE (6611 assertions; first full run red only on affordances, fixed), tree d05d30c3; C-101 ACTION_CATALOGUE_CHECKS: five refusals at op=promote (all 16 forbidden writes reproduced first); missing counterparty and past-due stay audit-only; CATALOG 1.35.0->1.36.0 (union picks one); counterparty.test guard that could never throw corrected; supersedes REC-23 stance except the missing counterparty (BOB told)
order: spawned directly, stacked on D-695 (same action block): a forbidden value landing in the record is a trustworthiness defect and D-695's own class (SCHEDULER #24, 2026-09-25)
milestone: M7
interface: I3 — named refusals on op=promote for five action arms; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (the action object and its catalogue arms), with D-130 / DEC-13 and C-11.1.
depends-on: none (stacked on land/worker/D-695 @ b6ebf625, integrated, on D-689 @ 4ef3d303).
scope: refuse each of the five by name in promote's action block, as D-695 did for C-2.10's law (one DEC-49 region each or one region naming the arm); split checkCounterparty so a MISSING counterparty stays audit-only. Left to the audit by design: counterparty absent, and silently-past-due. STATE, do not classify: the non-action families.
accepts-when: each of the five is refused by name at op=promote and nothing it forbids is saved (moves: five forbidden values saved); an absent counterparty still saves and the audit still reports it. NEGATIVE CONTROL: remove one refusal and its arm saves again, failing by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-695's worker).

### M0-171 · integrated — **`versions.test.mjs` HARVESTS SCHEMA TABLES WITH A LOOSE PATTERN (`/CREATE TABLE IF NOT EXISTS (\w+)/g`, ~line 719), so it still counts the prose phantom `would` that M0-155 removed from the census.** Found by M0-155's worker. — owner M0.
status: integrated — SCHEDULER #24 12:02Z: tip 4a13c257 on main 95fe7bc7, GATE 79/79 GREEN TARGETED (6108 assertions), tree 6e6a9daf; versions.test harvest uses the \s*\( tail and is PINNED to the schema.mjs share of status.mjs tableSites (114=114); measured: the loose pattern did not count `would` on this tree (the -- line filter kept it out); whole census 123 vs status.mjs comments 116 UNDETERMINED (M0-181)
order: after M0-160, beside the probe-accuracy rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 17:07Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument counts code, not prose).
depends-on: M0-155.
scope: add the `\s*\(` tail `hygiene.test.mjs` (~line 685) uses; re-read the table count from its print.
accepts-when: versions.test's table census equals M0-155's 114. NEGATIVE CONTROL: drop the tail and the `would` phantom returns, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-172 · integrated — **`status.control.mjs` LEAVES ITS PEN BEHIND (`.status-harness/`, 25 KB `pristine.status`), and `.gitignore`'s pen preamble mis-cites WORKER.md.** BOB #33 RULED (17:12Z): a control driver's PEN is not a session's SCRATCH; in-worktree, gitignored, item-named pens STAND. — owner M0 (fold into any open M0 batch).
status: integrated — CONDUCT #23 12:29Z: worker report — tip 2f64cd95 (on main 95fe7bc7), GATE 90/90 GREEN FULLREUSE (6949 assertions); 15 controls to controlPen, readbudget describe; no IC; minted D-730, D-735; rides batch30
order: after M0-171, small; fold into an open M0 batch rather than its own gate (BOB #33, 17:12Z; SCHEDULER #18) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a driver cleans up after a clean run), with BOB #33's ruling of 17:12Z (cite until folded).
depends-on: M0-155.
scope: (1) status.control.mjs removes `.status-harness/` on a clean run; (2) `.gitignore`'s pen preamble says pens are a driver's mechanism, gitignored and item-named, distinct from session scratch; (3) WORKER.md's scratch bullet adds "a control driver's declared, gitignored pen is not scratch".
accepts-when: a clean status.control.mjs run leaves no `.status-harness/`. NEGATIVE CONTROL: remove the cleanup and the pen-gone arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (BOB #33 inbox 17:12Z; `node tools/mintid.mjs M0`).
scope-add: 2026-09-24 by SCHEDULER #19 (via CONDUCT #20, 17:25Z and 18:17Z): control drivers writing `${file}.pristine-<arm>` beside the source, an UNDECLARED pen BOB's ruling does not stand — battery-residue, contradiction-overstrict, d249-port, d301-census, d389-fullfetch, dec65-strength-reach, m041-instrument-census, m057-authority, rec174-supplyfetch, tally-through-pipe, walkfloor, and every `nc-*.mjs` harness (D-499 fixed nc-d64). Fix: a PEN from `mkdtempSync(join(tmpdir(), "<tag>-control-"))`.

### D-721 · integrated — **#caseIdentitySentence's PAIR BRANCH STILL STATES "the next edition (N) of C1 — but …" for a draft naming C1 AND asking for a new case, in op=casedraft, casedrafts, reviewcopy and reviewgrant (boundTo), beside D-618's `edition: null`: the sentence names an edition the record has not chosen.** Found by D-708's worker (minted on land/worker/D-708). — owner RECORD.
status: integrated — CONDUCT #23 12:38Z: worker report — tip 3ef19436 (on D-708 656b0817), GATE GREEN FULLREUSE (62/62 this run; full 409 on f68d42df red only on regionLines, fixed); pair sentence reworded, draft_edition null for pair/derived (IC MAJOR); minted D-728; rides batch30 after D-708 with D-720 (keep both)
order: spawned directly, stacked on D-708 (same sentence family): a sentence claiming more than the record holds is the "less narrative" defect (CLAUDE.md §2) and corrects just-landed work (SCHEDULER #24, 2026-09-25)
milestone: M10
interface: I3 — the pair sentence's wording on four ops; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 and §6A.4 (D-618: a pair draft states no edition).
depends-on: none (stacked on land/worker/D-708 @ 656b0817, integrated, on D-618 @ dc4c41f9).
scope: drop the edition number from the pair branch — name the case as the draft names it, then the refusal; re-read the civicos-ui suites that draw this sentence verbatim and correct them with a comment; publish's draft-mismatch detail (is-publish-draft-this-case) is in scope if it calls the pair branch.
accepts-when: no op answering for a pair draft states an edition number (asserted in reviewcopy block 14 and at each of the four ops) (moves: an edition stated beside edition:null). NEGATIVE CONTROL: restore the numbered pair sentence and the no-edition arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-708's worker).

### D-720 · integrated — **A READING ACKNOWLEDGED ON A DRAFT THAT NAMES C1 AND ALSO SETS newCase IS KEYED UNDER C1's NEXT EDITION: #statementAcknowledgements lists every row at a case identity (draft match '*'), so C1's signed document can list a reading given on a draft that may become ANOTHER case — the record claiming a binding nobody made.** Diagnosed from the code by D-708's worker (statementack INSERT; #statementAcknowledgements' WHERE), not yet driven. BOB #36 RULED 2026-09-25 11:30Z, option (1) (drained by SCHEDULER #24; cite until folded). — owner RECORD.
status: integrated — CONDUCT #23 12:26Z: worker report — tip 8e04cbe9 (on D-708 656b0817), GATE 409/409 GREEN FULLREUSE (22939 assertions); ack on C1+newCase draft keyed (NULL,1): case_id null/bound false where C1/true = IC MAJOR; rides batch30 after D-708
order: first queued in the cache: a false binding listed in signed bytes outranks every feature (CLAUDE.md §2), and it corrects D-708 (SCHEDULER #24, 2026-09-25)
milestone: M10
interface: I3 — a pair draft's reading carries no case identity until a publish names the draft; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (REC-194, BOB #32: reading A's statement is not reading B's), with BOB #36's 11:30Z ruling.
depends-on: none (stacked on land/worker/D-708 @ 656b0817, integrated, on D-618 @ dc4c41f9; D-721 runs beside it on #caseIdentitySentence).
scope: op=statementack on a pair draft writes case_id NULL, bound to the draft (as a derived draft's reading is); #statementAcknowledgements' '*' draft match never lists a NULL-case row under a case identity; REC-217's publish draft= binds it. Rejected: refusing the ack; treating C1 as chosen. Fold into §3 rule 13. Reproduce through op=statementack first.
accepts-when: an ack on a C1-plus-newCase draft is NOT listed in C1's document at its next edition, even when that edition is authored from another draft or the case door with a byte-identical statement; after a publish naming that draft it IS listed in the case that publish produced (moves: a reading listed under a case nobody chose). NEGATIVE CONTROL: restore the C1 key and the not-listed arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-708's worker; BOB #36 inbox).

### D-722 · integrated — **op=linkproject's WRITE HALF: it resolves a second time WITHOUT the viewer, so an outsider's act writes an edge into a project they cannot see (measured by D-706's worker: a hidden-plus-visible address writes the HIDDEN edge, leaving op=links' tally one short; the edge sits unattributed).** BOB #36 FINAL RULING 2026-09-25 11:15Z, (A)+(C) (drained to `BOB-INBOX-drained.md` by SCHEDULER #24; cite until folded; supersedes 10:50Z/10:58Z part 3). — owner RECORD.
status: integrated — SCHEDULER #24 12:46Z: tip 46ed027d (on D-706 6dd3e530), GATE 81/81 GREEN FULLREUSE (6864 assertions), tree b17c72f0; (A) one resolution through #captureGate, writes = answered edges; (C) hidden bundle= answers NO_SUCH_BUNDLE (stated tightening: an id naming nothing now refused too); joined test for a project source, linkproject in POSITIONAL_ACTS; d706 WRITE HALF arm inverted; refs sweep found no read leaking a hidden links_to edge
order: directly behind D-706, whose disclosure half it completes; a write across the viewer fence is a disclosure defect and outranks every feature (SCHEDULER #24, 2026-09-25)
milestone: M7
interface: I3 — linkproject writes only the edges its answer names; bundle= naming a hidden bundle answers NO_SUCH_BUNDLE; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7.9 (REC-138 "not its existence" at the ACTS; REC-134's joined test), with BOB #36's 11:15Z ruling.
depends-on: none (stacked on land/worker/D-706 @ 6dd3e530, integrated, on D-701 @ 414439d2).
scope: (A) resolve ONCE through the viewer's #captureGate and write exactly the edges the answer names; remove the unfiltered second resolution. (C) bundle= naming a bundle the caller cannot see answers NO_SUCH_BUNDLE. (1) a hidden source answers not-held and writes nothing; (2) the JOINED test (as cite) applies where the source bundle is a project's. Fold into LINK-FIDELITY.md and add linkproject to §7.9's REC-134 act list; option B is NOT rowed.
accepts-when: an outsider's arms leave the hidden project's refs byte-identical (witness before and after); a hidden-plus-visible address writes the VISIBLE edge and op=links' tally equals linkproject's counts; a member who sees both ends still writes the hidden target's edge (moves: an outsider's write into a hidden project). NEGATIVE CONTROL: restore the unfiltered write resolution and the outsider arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (BOB #36 inbox).

### D-630 · integrated — **`suggest.control` arm 7: ANCHOR DRIFT — `    if (prior) {` matches 2 since D-536, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — CONDUCT #23 11:50Z: worker report — tip c33a2194 (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6608 assertions), anchordrift GREEN; suggest.control arm 7 re-anchored, allowance removed; test-only, no IC; rides batch30
order: after D-667, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-631 · integrated — **`adminvote.control` arm stamp-dropped: ANCHOR DRIFT — matches 2 (REC-164), so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — SCHEDULER #24 11:55Z: tip 3092ad35 (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6590 assertions), tree 392dba8a; adminvote.control stamp-dropped re-anchored, allowance deleted, arm alone 57/24 as declared; anchordrift.json deletion adjacent to D-630 (keep both)
order: after D-630, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-707 · integrated — **op=promote STILL RETURNS A RAW NOT NULL STACK for a missing snapKey (manifest.snap_key), a file with no path (files.path) and a blob file with no bytes (files.bytes)** — the three fields D-578/D-628 did not reach. Found by D-628's worker. — owner RECORD.
status: integrated — SCHEDULER #24 12:29Z: tip 95839afa (on D-692 332c594e), GATE 391/391 GREEN FULLREUSE (22115 assertions; excludes 3 untallied), tree 89405417; four refusals before the transaction C-86.10..13 (snapKey, file path, file content, blob bytes), reproduced first; declared tightening I3; CATALOG 1.36.0->1.37.0; GOVERNING_LAWS_REWRITTEN misattribution measured and STATED (with BOB #36)
order: after D-692, the same promote function, one worker at a time: a raw stack on a public op breaks DEC-49 and leaks internals (SCHEDULER #24, 2026-09-25)
milestone: M7
interface: I3 — three named refusal codes on op=promote; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (C-2.5; the promote corrections D-578 and D-628 built as C-86.5 and C-86.8).
depends-on: none (stacked on land/worker/D-692 @ 332c594e, integrated, on D-628 @ db3b94a0).
scope: refuse each of the three by a named DEC-49 code before the transaction, as C-86.8 does for unstated fields. STATE, do not decide: a null files entry, or a bundle.md whose text is a number, is refused GOVERNING_LAWS_REWRITTEN, which names the wrong cause (diagnosis undetermined; measure and report it).
accepts-when: each of the three answers its named code and no op=promote answer carries a stack (moves: three raw NOT NULL errors). NEGATIVE CONTROL: drop one refusal and its arm reads the raw error, failing by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-628's worker).

### D-718 · integrated — **C-17.2's classifyDivergence (bio-checks.mjs) STILL SORTS _history/manifest.json BY SNAP KEY, so its anchor and intervening set can be the wrong ones when keys run against write order — the audit D-700 corrected for C-20.1, one check over.** Found by D-700's worker. — owner CHECKS.
status: integrated — SCHEDULER #24 12:35Z: tip 689cd6d1 (on D-700 50116ded), GATE 388/388 GREEN (21917 assertions; excludes 3 untallied), tree c6219116; classifyDivergence walks historyWriteOrder (seq), info finding when key order is used; reproduced first 6/7 (hidden intervening promotion; wrong anchor); C-17.2 is info/warn so op=audit cannot show it (stated); release/newgroup bundles still carry the old classifier (DIST)
order: spawned directly, stacked on D-700: an audit that names the wrong anchor misstates the record, and it completes just-landed work (SCHEDULER #24, 2026-09-25)
milestone: M7
interface: none unless a finding's anchor changes on the wire (the integrator classifies).
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §6 (I-20, write order, as D-700 amended it).
depends-on: none (stacked on land/worker/D-700 @ 50116ded, integrated, on D-674 @ 96a7802f).
scope: classifyDivergence walks historyWriteOrder(hist.entries).entries (D-700's export), falling back to snap-key order with its INFO finding as C-20.1 does; reproduce first with a history whose keys run against write order.
accepts-when: a divergence whose anchor was written before a later-keyed edit names the write-order anchor and intervening set (moves: a wrong anchor). NEGATIVE CONTROL: sort by key again and the write-order arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-700's worker).

### D-719 · integrated — **THE BUNDLE VIEW'S HISTORY LIST (src/setup.mjs, #b-history) SORTS ENTRIES BY SNAP KEY, so a member reads a bundle's history in an order other than the one it was written in, since D-700 made write order the record's.** Found by D-700's worker. — owner UI.
status: integrated — SCHEDULER #24 12:37Z: tip 8ab99e48 (on D-700 50116ded), GATE 388/388 GREEN FULLREUSE (21912 assertions; excludes 3 untallied), tree da080bc5; setup.mjs historyOrder (same predicate as historyWriteOrder), #b-history states which order it shows; reproduced first 2/6; minted D-732 (spawned)
order: after D-718, the same write-order field; a surface showing an order the record does not hold (SCHEDULER #24, 2026-09-25)
milestone: M7
interface: none — reads D-700's additive `seq`.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §6 (I-20, write order, as D-700 amended it).
depends-on: none (stacked on land/worker/D-700 @ 50116ded, integrated, on D-674 @ 96a7802f).
scope: #b-history sorts by seq when every entry carries one, else by snap key as today; the page states which order it shows.
accepts-when: a bundle whose keys run against write order lists its history in write order (moves: a history shown out of write order). NEGATIVE CONTROL: sort by key again and the write-order arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-700's worker).

### D-632 · integrated — **`aicredential.control` arms 3 and 5: ANCHOR DRIFT — arm 3 matches 0; arm 5 matches 3, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — CONDUCT #23 12:24Z: worker report — tip 1ca6abd4 (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6603 assertions); aicredential.control arms 3,5 re-anchored, allowances removed; test-only, no IC; rides batch30 (keep every anchordrift.json deletion)
order: after D-631, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-634 · integrated — **`caseflip.control` arms c, f: ANCHOR DRIFT — match 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — CONDUCT #23 13:12Z: worker report — tip 8904b832 (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6568 assertions); caseflip.control arms c,f re-anchored, allowances removed; test-only, no IC; minted D-733; rides batch31
order: after D-632, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-723 · integrated — **A PAGE TWO PARTS SHARE (D-635: folio from the text layer, OCR transcription appended) READS `ocr` — the part appended last — though BOB #35's 09:35Z rule makes a unit covered by steps of different kinds `mixed`; the record calls the text-layer part machine-read.** BOB #36 RULED 2026-09-25 11:05Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #24; cite until folded): D-686's 09:05Z page rule is SUPERSEDED for this case only. — owner CONTENT.
status: integrated — SCHEDULER #24 12:48Z: tip fe2b9a6d, ONE commit on D-710 f34c4c9f, GATE 388/388 GREEN FULLREUSE (21995 assertions; excludes 3 untallied), tree b1fd6919; chainKindFor page branch asks every covering part, a D-635 shared page reads mixed; unreadable extent behind a covering part undetermined; nc-d723 arms as declared, nc-d686 two arms re-anchored; construct 4.unit-chain-kind-mixed ADDED as BUILT; rides D-686 IC
order: directly behind D-710, which it completes: a correction to just-landed work outranks new work, and "less narrative" binds us first (SCHEDULER #24, 2026-09-25)
milestone: M2
interface: I3 — a shared page's content.chain_kind reads `mixed`; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14 (chain_kind, as D-686 and D-710 write it), with BOB #36's 11:05Z ruling.
depends-on: none (stacked on land/worker/D-710 @ f34c4c9f, integrated, on D-686 @ 526cc17f).
scope: `textchain.mjs` chainKindFor's page branch answers `mixed` for a page covered by two steps of different kinds; a page read one way keeps its one kind. Correct content-chain-kind.test.mjs 1b, 2b and 3 with a comment saying why the old assertion was wrong; move construct 4.unit-chain-kind-mixed to BUILT; fold the rule into the Content Framework's chain_kind section. Unchanged (CONFIRMED): content:ocr stays an equality and never names a mixed unit; content:mixed names it; capture_text.chain_kind stays the chain's LAST step and never reads mixed.
accepts-when: a D-635 appended page reads `mixed` and a text-layer-only or OCR-only page keeps its one kind (moves: a shared page reading `ocr`). NEGATIVE CONTROL: restore the last-appended rule and the shared-page arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (BOB #36 inbox).

### D-636 · integrated — **`d266scope.control` arm 2: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — CONDUCT #23 12:28Z: worker report — tip 54490e02 (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6547 assertions); d266scope.control arm 2 re-anchored, allowance removed; test-only, no IC; rides batch30
order: after D-634, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-637 · integrated — **`d85-surface-run.control` arm no-lens-at-open: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — SCHEDULER #24 13:00Z: tip 1c4a573e (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6556 assertions), tree 5a6c4389; d85-surface-run no-lens-at-open re-anchored (1 match here and on main), allowance deleted, arm alone 40/7 as declared
order: after D-636, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-638 · integrated — **`dec65-strength-reach.control` arm a2: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — CONDUCT #23 12:47Z: worker report — tip 238517e1 (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6536 assertions); dec65-strength-reach.control arm a2 re-anchored, allowance removed; test-only, no IC; minted D-736 (arm 3 declaration stale); rides batch30
order: after D-637, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-639 · integrated — **`fence-e2e.control` arm (3): ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — CONDUCT #23 12:45Z: worker report — tip 80a66f56 (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6564 assertions); fence-e2e.control arm 3 re-anchored, allowance removed; test-only, no IC; rides batch30
order: after D-638, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-640 · integrated — **`m025-anchor-witness.control` arm T1: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — SCHEDULER #24 13:00Z: tip fbf2e6a4 (on M0-197 11818309), GATE 80/80 GREEN FULLREUSE (6509 assertions), tree 7257f343; m025-anchor-witness T1 moved to casepin head (casesign census already red on the unmodified tree, so not a control), allowance deleted, arm alone as declared; minted D-737
order: after D-639, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-642 · integrated — **`nc-coff12` arm slidesbyposition: ANCHOR DRIFT — matches 0 — the same line as D-600 (integrated); re-anchor on the union, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — SCHEDULER #24 13:12Z: tip d6a6e52f (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6566 assertions), tree 44ce7366; nc-coff12 SLIDE_KEYING re-anchored (1 match here and on main), allowance deleted, arm alone 3/3 declared by name; the patch now isolates the keying (pads to deck length), two assertions moved to held-open with the reason
order: after D-640, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-643 · running — **`nc-cpdf18` arm textpin: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: running — SCHEDULER #24 12:28Z: spawned, stacked on land/worker/M0-197 @ 11818309 (anchordrift.json exists only there)
order: after D-642, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-726 · running — **A REVISION WHOSE BYTES RESTATE A DIFFERENT `group` LANDS, and bundles.group_id keeps the creation's (the ON CONFLICT arm never writes it), so the row and the head bytes disagree — measured through op=promote in a local Miniflare: row group_id believe-in-oakland, head bytes `group: some-other-group`.** D-692's class, one column over. Live-corpus count UNDETERMINED. Found by D-692's worker. — owner RECORD.
order: after D-707, the same promote function, one worker at a time (SCHEDULER #24, 2026-09-25)
status: running — SCHEDULER #24 12:29Z: spawned, stacked on land/worker/D-707 @ 95839afa
milestone: M7
interface: I3 — a new named refusal on op=promote where a revision used to land; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (C-2.5; D-692's C-86.9 shape), with State Rules v1.5 §4.7.
depends-on: none (stacked on land/worker/D-707 @ 95839afa, integrated, on D-692 @ 332c594e).
scope: refuse a non-replay revision whose document's `group` differs from the head's group_id (REVISION_REGROUPS_BUNDLE), replay exempt, after CAS and before the first write, as C-86.9 does. Measure the live-corpus count if reachable, else state it undetermined. STATE, do not sweep further: other columns written only at creation.
accepts-when: a revision restating a different group is refused by name and nothing is written; the same group respelt, and a revision stating none, still land (moves: a row and its head bytes disagreeing on group). NEGATIVE CONTROL: drop the refusal and the regroup arm lands, failing by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-692's worker).

### D-729 · running — **THE LINK SURFACE LABELS EVERY chrome=1 LINK "site navigation" (civicos-ui/app.html linkRow), but chrome=1 is CONTAINMENT only, so a page-local <aside> sidebar link is called site navigation — more than BOB #35's 09:30Z ruling (containment AND recurrence) allows.** Found by D-702's worker (minted on land/worker/D-702). — owner UI.
order: spawned directly, stacked on D-702: a surface claiming more than the record holds is the "less narrative" defect (CLAUDE.md §2) and corrects just-landed work (SCHEDULER #24, 2026-09-25)
status: running — SCHEDULER #24 12:31Z: spawned, stacked on land/worker/D-702 @ 71a5d050
milestone: M2
interface: none — the label only.
design: `docs/development/LINK-FIDELITY.md` §Chrome (containment is a classification recorded on the link; site chrome needs recurrence, BOB #35 09:30Z as D-702 folded it).
depends-on: none (stacked on land/worker/D-702 @ 71a5d050, integrated, on D-701 @ 414439d2).
scope: label the stored classification as what it is ("in a page-furniture region (<basis>)"), never "site navigation"; correct link-surface.test.mjs's pin (~228-231) with a comment saying why the old label was wrong. NOT in scope: a per-link recurrence verdict on op=links that would let the surface say "site navigation" for a `site` link — plane work, with BOB #36.
accepts-when: no link row says "site navigation" from containment alone; a contained link reads its region and basis (moves: a sidebar link called site navigation). NEGATIVE CONTROL: restore the old label and the no-overclaim arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-702's worker).

### D-644 · integrated — **`nc-fw17` arm nullhonest: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — SCHEDULER #24 13:05Z: tip eb82f304 (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6572 assertions), tree a04c8c91; nc-fw17 nullhonest re-anchored on the reading_refs INSERT position line (1 match here and on main), allowance deleted, arm alone 56/7 as declared
order: after D-643, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-732 · integrated — **THE DOCUMENT PAGE (civicos-ui/app.html, stratum 4) LISTS A BUNDLE'S HISTORY BY SNAP KEY under "Everything that has ever happened to this …": parseLog sorts _history/promotion_*.json by path and "Earlier revisions, kept" sorts _history/bundle_*.md by key, though D-700 made write order the record's.** D-719's class on the member surface. Found by D-719's worker. — owner UI.
status: integrated — CONDUCT #23 13:17Z: worker report — tip f64bad66 (on D-719 8ab99e48), GATE GREEN FULLREUSE (73/73; full 102/102 on 2a85abc6 red only on stdio-census, fixed); document page history in write order; no IC; rides batch31 after D-719
order: spawned directly, stacked on D-719: a surface showing an order the record does not hold, under a heading that claims the whole history (SCHEDULER #24, 2026-09-25)
milestone: M7
interface: none — reads D-700's additive `seq`.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §6 (I-20, write order, as D-700 amended it).
depends-on: none (stacked on land/worker/D-719 @ 8ab99e48, integrated, on D-700 @ 50116ded).
scope: order both lists by the image's _history/manifest.json seq when every entry carries a distinct integer one (historyOrder/historyWriteOrder's predicate), else by key, and state which order is shown, as D-719 did for #b-history.
accepts-when: a bundle whose keys run against write order lists both its promotions and its kept revisions in write order, and the page says so (moves: a history shown out of write order). NEGATIVE CONTROL: sort by key again and the write-order arm fails by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-719's worker).

### D-724 · running — **A PARTIAL CAPTURE INDEX SKIPS AN OVER-BOUND UNIT SILENTLY: both budget loops (index.mjs textUnitsFor, store.mjs #writeCaptureText) `continue` past it and write later units that fit, but only a COUNT is kept, so a search miss in sheet 4 cannot say sheet 4 was NEVER INDEXED rather than holding no match; CONTENT-SEARCH-DESIGN §4.3 calls the index a prefix.** Measured by D-685's worker (M-184, Z5). BOB #36 RULED 2026-09-25 11:20Z, option (b) (drained by SCHEDULER #24; cite until folded). — owner RECORD.
order: behind D-685, the same budget loops, one worker at a time; saying WHICH absence is true is first-class (CLAUDE.md §2), so it leads D-694 (SCHEDULER #24, 2026-09-25)
status: running — SCHEDULER #24 12:40Z: spawned, stacked on land/worker/D-685 @ 3094f19b
milestone: M4
interface: I3 — additive skipped unit keys on the read that carries `partial`; the integrator classifies.
design: `docs/development/CONTENT-SEARCH-DESIGN.md` §4.3, with BOB #36's 11:20Z ruling.
depends-on: none (stacked on land/worker/D-685 @ 3094f19b, integrated, on D-684 @ 9f6112d3).
scope: (1) correct §4.3 and the #writeCaptureText docblock to "every unit that fit, in reading order, with gaps"; (2) a `partial` capture records the unit keys it SKIPPED, from both loops, and the read that reports a capture's indexing state serves them as "not indexed: over the bound". Option (a), break at the first over-bound unit, is REJECTED.
accepts-when: Z5's workbook reads S5 indexed and names S4 skipped over the bound; a capture under the bound names none (moves: a silent gap). NEGATIVE CONTROL: drop the skipped-key write and the Z5 arm fails naming S4.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-685's worker; BOB #36 inbox).

### D-728 · running — **op=publish case=C1 draft=<a draft naming C1 AND setting newCase> PUBLISHES and binds that draft to C1's next edition (measured: ok:true, edition 2, completeness.draft = the pair draft), though D-618 ruled the pair UNDETERMINED and every pair sentence (D-708, D-721) says publication refuses the two instructions together — the record doing what its own sentences say it refuses.** Found by D-721's worker. — owner RECORD.
order: spawned directly, stacked on D-721 (same is-publish-draft-this-case region): a signed binding the record's own rule forbids, in signed bytes (SCHEDULER #24, 2026-09-25)
status: running — SCHEDULER #24 12:43Z: spawned, stacked on land/worker/D-721 @ 3ef19436
milestone: M10
interface: I3 — a new refusal where a publish used to land; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 and §6A.4 (D-618: a pair draft's case is UNDETERMINED; publication refuses the two instructions together).
depends-on: none (stacked on land/worker/D-721 @ 3ef19436, integrated, on D-708 @ 656b0817).
scope: in is-publish-draft-this-case treat a pair draft as standing at no case edition (compare #statedEdition, null, so it never matches) and answer PUBLISH_DRAFT_NOT_THIS_CASE; reproduce through op=publish first. If BOB #36 rules instead that the publisher's explicit case= resolves the pair, the fix becomes rewording D-708's sentence — do not decide that; the named fix follows D-618 as ruled.
accepts-when: op=publish case=C1 naming a pair draft is refused by name and writes nothing; a draft naming C1 only still publishes (moves: a pair draft bound by a publish). NEGATIVE CONTROL: compare the draft's named edition again and the pair arm publishes, failing by name.
added: 2026-09-25 · SCHEDULER #24 (id minted by D-721's worker).

### D-645 · integrated — **`nc-mk4` arms machinewide/noshare/sharewide, aiscope: ANCHOR DRIFT — three match 0; aiscope matches 3, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — SCHEDULER #24 13:07Z: tip 995f6b3f (on M0-197 11818309), GATE 80/80 GREEN FULLREUSE (6509 assertions), tree c735e3d7; nc-mk4 machinewide, aiscope, noshare, sharewide re-anchored on #leadReach predicate and the identity stamps (1 match each here and on main), four allowances deleted, each arm alone as declared; lead.test NEGATIVE CONTROL line still carries 09-18 figures (stated)
order: after D-644, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-646 · integrated — **`nc-rec113` arm blind: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — CONDUCT #23 13:18Z: worker report — tip 78d04f15 (on M0-197 11818309), GATE 80/80 GREEN FULLREUSE (6509 assertions); nc-rec113 blind arm re-anchored, allowance removed; test-only, no IC; minted D-739; rides batch31
order: after D-645, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-647 · integrated — **`nc-rec114` arms b, c, e: ANCHOR DRIFT — match 2 each, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — SCHEDULER #24 13:16Z: tip cdaa1b3b (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6545 assertions), tree 53ef3c1e; nc-rec114 b, c, e anchored from #legEarnedCapture own header (a byte-identical twin body made them match 2), 1 match each here and on main, three allowances deleted; the verdict now refuses any undeclared failure (was never enforced)
order: after D-646, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-648 · integrated — **`nc-rec118` arms b, d: ANCHOR DRIFT — match 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: integrated — CONDUCT #23 13:10Z: worker report — tip 1bbab3f1 (on M0-197 11818309), GATE 81/81 GREEN FULLREUSE (6538 assertions); nc-rec118 arms b,d re-anchored, allowances removed; test-only, no IC; minted D-740; rides batch31
order: after D-647, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-649 · running — **`nc-rec64` arm 1: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: running — SCHEDULER #24 12:54Z: spawned, stacked on land/worker/M0-197 @ 11818309 (anchordrift.json exists only there)
order: after D-648, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-650 · running — **`nc-rec82` arms oob/nochain/overstrict: ANCHOR DRIFT — match 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
status: running — SCHEDULER #24 13:00Z: spawned, stacked on land/worker/M0-197 @ 11818309 (anchordrift.json exists only there)
order: after D-649, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-651 · queued — **`nc-rec91` arm nowire: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-650, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-652 · queued — **`nc-rec94` arms writer, cause: ANCHOR DRIFT — writer matches 0; cause matches 2, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-651, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
