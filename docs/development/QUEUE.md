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

### D-670 · running — **A `pdf-page` RECT CARRIES NO COORDINATE SPACE IN THE CONTENT GRAMMAR: OCR anchors are image pixels (the ocr member's §2) while content extents and image placements are default user space (IC-203); `#posFields` passes `space` through and `legExtent` / `canonicalExtent` / `extentCovers` drop or ignore it — so an OCR region's pixel rect proposed through `op=extractpropose` is addressed as user space, refused C-45.1 when off the page since D-374 and passed BY ACCIDENT when it fits.** Attestation regions cannot be bounded either. Found by D-374's worker (minted on land/worker/D-374). — owner CONTENT-PDF, RECORD.
status: running — SCHEDULER #23 07:45Z: spawned, stacked on land/worker/D-374 @ c7703c3d
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

### D-615 · running — **`op=promote` STILL PROJECTS `bundles.created` AND `last_updated` FROM THE ENVELOPE, though the document states both (CORE_FIELDS): D-563's class, the last two fields.** Found by D-563's worker (05:47Z). — owner RECORD.
status: running — SCHEDULER #23 08:25Z: spawned, stacked on land/worker/D-546 @ b690552a
order: after D-546, the same promote function one worker at a time: the envelope is a label, the document states what it is (SCHEDULER #22, 2026-09-25)
milestone: M7
interface: I3 — the projection's two dates; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, with C-2.5 and D-510/D-563's derivation.
depends-on: none (stacked on land/worker/D-546 @ b690552a, integrated, itself on D-578 @ 700a432d on D-563 — same promote function).
scope: derive created and last_updated from the document as D-563 derives title and state; take a read-only census of live drifts FIRST (as M-172 did) before refusing a contradicting envelope; envelope as fallback only where the bytes state none.
accepts-when: the projection shows the document's dates, and a contradicting envelope is refused by name or recorded per the census (moves: envelope dates over the document's). NEGATIVE CONTROL: project the envelope's dates again and the date arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-563's worker).

### D-681 · running — **NO LEAD OP LISTS A MEMBER'S LEADS: D-194's surface lists from op=frontier&level=internet, whose `looked` keeps the latest look per SUBJECT (the lead's words; `#frontierInternet`), so a lead whose words equal another readable lead looked at later appears in neither `looked` nor `never_looked` — it vanishes from the member's list.** Found by D-194's worker (minted on land/worker/D-194). — owner RECORD.
status: running — SCHEDULER #23 08:30Z: spawned, stacked on land/worker/D-194 @ 45437e4d
order: head of the backlog after D-671 — a correction to just-landed D-194: the list claims to be the member's leads and drops one (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3 — a new leads read or a regrouped frontier; the integrator mints and classifies.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5 (the lead's surface; its Incomplete bullet names this).
depends-on: none (stacked on land/worker/D-194 @ 45437e4d, integrated — the surface swaps its list read in the same landing).
scope: a new leads read (the author's and shared-to-me leads, bounded, each with its latest state) OR key `#frontierInternet`'s `looked` grouping on the lead rather than the subject — state which and why; the surface swaps its list read.
accepts-when: two readable leads with the same words, looked at in turn, both appear in the member's list with their own latest states (moves: a lead vanishing). NEGATIVE CONTROL: group by subject again and the same-words arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-194's worker).

### D-689 · running — **A MACHINE CREDENTIAL CAN STATE A RECORDS REQUEST'S GOVERNING LAW: nothing fences `law` on a `records_request` (REC-201) or the creation of a `cpra_request` from an `ai` credential, though which law governs is the member's characterization (D-149's C-32.18 fences only the governing-laws list).** BOB #35 RULED 2026-09-25 08:25Z, (b) FENCE BOTH, from DEC-24 and D-149 (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded): a machine may only PROPOSE either (REC-195's shape) and a member's act adopts; existing machine-created `cpra_request` rows read MACHINE-STATED, never rewritten. — owner RECORD.
status: running — SCHEDULER #23 08:35Z: spawned, stacked on land/worker/REC-201 @ 45ce0bc5
order: at the backlog head after D-682, the first row after REC-201 (running), which adds the `law` field this fences (BOB #35's placement; SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 — a named refusal for a machine credential; a machine-stated reading on existing rows; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*), with BOB #35's 08:25Z ruling, folded into §2 by this row.
depends-on: none (stacked on land/worker/REC-201 @ 45ce0bc5, integrated — it adds the `law` field this fences).
scope: refuse by name an `ai` credential stating `law` or creating a `cpra_request`; offer the propose-then-adopt path as REC-195 does for the list; a pre-fence machine-created row reads machine-stated from its recorded author class, unchanged.
accepts-when: an `ai` credential's cpra_request is refused by name and a member adopts its proposal (moves: a machine stating the law). NEGATIVE CONTROL: an `ai` credential creating a cpra_request is refused by name, and the pre-fence machine row reads machine-stated — lift the fence and the first arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, BOB #35's 08:25Z ruling).

### D-682 · running — **NO LEAD OP PUBLISHES WHAT A LOOK'S STATE MEANS: D-194's surface mirrors OBSERVATION_STATES in app.html (LEAD_STATE_WORDS, guarded against airun.mjs), and `partial`'s plane sentence carries a maintainer's parenthetical that is not member text.** Found by D-194's worker (minted on land/worker/D-194). — owner RECORD.
status: running — SCHEDULER #23 08:40Z: spawned, stacked on land/worker/D-194 @ 45437e4d
order: head of the backlog after D-671, with D-681 (running): the same surface's second plane gap (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3 additive — a `vocabulary` block on op=leadread and op=frontier level=internet; the integrator classifies.
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §5, with op=airunlog's `vocabulary` as the precedent shape.
depends-on: none (stacked on land/worker/D-194 @ 45437e4d, integrated — the surface deletes its mirror in the same landing; D-681 runs on the same base).
scope: op=leadread and frontier level=internet carry `vocabulary: { states: <the five>, outcomes: LEAD_LOOK_OUTCOMES }` with member-safe wording for `partial`; the surface reads it and deletes LEAD_STATE_WORDS.
accepts-when: the surface renders every state from the plane's vocabulary with no client mirror (moves: a mirrored vocabulary). NEGATIVE CONTROL: drop `vocabulary` from the op and the surface's state arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-194's worker).

### D-675 · running — **op=content REFUSES THE PLANE'S OWN `store=` PARAMETER AS A PREDICATE: `op=content&id=<row>&store=bio` answers FIXED_KEY_ONLY rejected ["store"], so op=content cannot be called with store=scratch — which CLAUDE.md §5 requires on EVERY live-verification call, leaving the choice between touching the real record and not verifying.** Driven in miniflare by D-419's worker (minted on land/worker/D-419). — owner RECORD.
status: running — SCHEDULER #23 08:48Z: spawned from main
order: at the head, spawned directly — a verification-safety defect on main (a live check forced into `bio`) outranks features (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — op=content (and any other fixed-key read found) admits store=; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §17 (organization and access — the content read op=content serves), with CLAUDE.md §5's scratch rule (every live-verification call names store=scratch) and D-325's `scopeFor`.
depends-on: none (on main today).
scope: the generic DO forward (index.mjs, the `inner` URL build) stops passing `store` into the store's predicate set for op=content, as the new content-crop read already strips it — OR Store.CONTENT_READ_PARAMS admits it; SWEEP every other fixed-key read for the same refusal and fix each found; list them by name.
accepts-when: op=content&id=<row>&store=scratch answers the scratch row, and store=bio the bio row, through the op (moves: FIXED_KEY_ONLY on store=). NEGATIVE CONTROL: pass `store` through again and the scratch arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-419's worker).

### UI-120 · running — **NO SURFACE RENDERS A CITED IMAGE'S CROP: D-419 built the new content-crop read (the crop of a cited PDF image extent, through the pdf member's POST /crop) and no page asks for it.** D-419's own row: *a UI item renders it*. — owner UI.
status: running — SCHEDULER #23 08:58Z: spawned, stacked on land/worker/D-419 @ 914bb380
order: after D-677, with the display surfaces (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3 consumer.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4 (the crop of a cited image; D-419 updated it).
depends-on: none (stacked on land/worker/D-419 @ 914bb380, integrated).
scope: where a content row cites an image extent, the page offers its crop from the new content-crop read; C-99's refusals render in the plane's DEC-49 words; the crop is labelled as derived from the capture it names; nothing prefetched for a stranger.
accepts-when: a member viewing a cited image extent sees its crop, and a non-image extent shows no control (moves: a built op no surface asks). NEGATIVE CONTROL: stub the new content-crop read and the render arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs UI`, D-419's owed surface).

### D-690 · running — **`civicos-ui/check-refusal-codes.mjs` ENDS IN A BARE `process.exit(1)` WITHOUT THE D-282 FLUSH IMPORT, and D-542 grows its output 38 KB -> 61 KB: measured on the D-542 union with a plant, 7 of 32 parallel runs lost the tail (zero ratchet lines), so the guard's FAIL lines can vanish under load.** stdio-census ARM D's known residual, now LIVE. Found by D-664's worker (minted on land/worker/D-664). — owner UI (the 2026-09-16 M0->UI delegation).
order: running now — it must land WITH or BEFORE D-542 (integrated, batch30), or the refusal-code guard can read green by losing its failures; a gate-trust defect that blocks a product landing (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (a run without its final line did not finish; admitted for M0 by name), with D-282's flush import.
depends-on: none (on main; measured against D-542's union).
scope: add `import "../bio-plane/test/stdio.mjs";` on line 2 after the shebang; remove the file from stdio-census.test.mjs RESIDUAL and shrink its header; do the same for check-semantics.mjs and check-mock-envelope.mjs (the same residual).
accepts-when: 16 parallel runs x2 of the guard with a plant on the D-542 union lose no bytes (moves: 7 of 32 truncated). NEGATIVE CONTROL: remove the import and the truncation trial fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-664's worker).

### D-684 · running — **A text/csv CAPTURE THROUGH op=acquire IS READ AS PROFILE TEXT AND NEVER REACHES THE FORMAT WIRE: the `canRead` branch wins, so a CSV gets no text_units and `reading.text_container` null — its cells are unsearchable though the csv format entry exists.** Measured in D-672's suite. Found by D-672's worker (minted on land/worker/D-672). — owner RECORD.
order: spawned directly after D-672 — it makes the same workbook-class search reach CSV, a correction to just-landed search work (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3/I5 additive — CSV text_units and text_container; the integrator classifies.
design: `docs/development/CONTENT-SEARCH-DESIGN.md` §4.1 (a sheet's unit is a sheet-range; D-672 built it for xlsx/ods and admitted csv in the store).
depends-on: none (stacked on land/worker/D-672 @ f676a996, integrated, itself on D-415 @ 48245247).
scope: in op=acquire, run the registered format entry's text() and textUnitsFor for a FORMAT-axis match even when profile text exists; the profile reading is kept as today.
accepts-when: a captured .csv is found by passage search in one sheet-range unit and its reading names its container (moves: text_units absent for CSV). NEGATIVE CONTROL: let the canRead branch short-circuit again and the CSV arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-672's worker).

### UI-119 · running — **NO SURFACE LETS A MEMBER STATE A RECORDS REQUEST'S `law`: REC-201 added the `records_request` kind and its `law` field, and neither app.html's action intake nor setup.mjs's page offers it, so every request filed there reads law UNDETERMINED — honest, and thin.** From REC-201's worker's report. — owner UI.
status: running — SCHEDULER #23 09:05Z: spawned, stacked on land/worker/REC-201 @ 45ce0bc5
order: after D-689 — the member's statement surface, after the fence that keeps a machine from making it (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 consumer.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*; folded by REC-201), with BOB #35's 08:25Z machine fence (D-689).
depends-on: none (stacked on land/worker/REC-201 @ 45ce0bc5, integrated; D-689 runs on the same base).
scope: a `law` control on app.html's action intake and setup.mjs's page when the kind is records_request, nothing prefilled (DEC-69); the plane's refusal (C-2.10) renders in its DEC-49 words; a machine-proposed law (D-689) is shown as proposed, adopted only by the member's act.
accepts-when: a member files a records_request naming a law and op=projection reads it verbatim (moves: law always undetermined from the surface). NEGATIVE CONTROL: drop the control's value from the act and the stated-law arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs UI`, REC-201's report).

### D-693 · running — **AN ARCHIVE-ONLY CAPTURE'S GRADE READS UNDETERMINED (CAPTURE_GRADE_VIA_UNRULED) THOUGH IT IS RULED: BOB #35 RULED 2026-09-25 07:55Z from doctrine on record (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded) — a capture whose only source is an archive replay (via archive.org) EARNS C as a MEASURED value, the same shape as the direct case, strictly below a direct capture; a capture with NO recorded via stays undetermined, named.** D-177's remainder: its worker could not take the edit and shipped the archive case undetermined. — owner RECORD.
order: spawned directly after D-177, which it completes (SCHEDULER #23, 2026-09-25)
milestone: M9
interface: I5 read semantics — an archive-only capture's leg reads at C; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.2, with ARCHIVE-FALLBACK.md's two-hop GRADE-C chain and AUTHORITY-AND-TRUST's transitive trust as BOB #35 applied them 07:55Z.
depends-on: none (stacked on land/worker/D-177 @ 406ab5c1, integrated).
scope: derive the archive letter in store.mjs from BASIS_GRADES, one rank below EARNED_CAPTURE_CEILING (UNREACHABLE_CAPTURE_GRADE's pattern), pinned in the suite to C and to op=acquire's stamped archive letter; captureBound(chain, thatLetter) is the measured letter for an archive-only capture; keep CAPTURE_GRADE_VIA_UNRULED for a via no ruling names; flip suite 9d and nc-d177 arm (b); move the construct probe; fold both 07:55Z rulings into §14.2 and clear its "routed to BOB" bullet.
accepts-when: a leg on an archive-only capture reads C as measured, and a no-via capture reads undetermined by name (moves: a ruled case read undetermined). NEGATIVE CONTROL: return the archive via to CAPTURE_GRADE_VIA_UNRULED and 9d fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, D-177's report).

### D-686 · running — **EVERY UNIT OF A MIXED DOCUMENT READS `chain_kind` 'ocr': `content.chain_kind` is the WHOLE chain's last step, so a text-layer page of a document OCR also touched is labelled as OCR'd.** Predates D-635. Found by D-635's worker. BOB #35 RULED 2026-09-25 09:05Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded): REPLACE on content, KEEP on capture_text, ONE function — `content.chain_kind` becomes the kind of the last derivation step covering the unit's page (partKeyOf / stepCovers), stored at mint or computed at read (the builder's choice, no second computation); existing rows are derived values, recomputing them is not a rewrite; `capture_text.chain_kind` stays document-level and its reader text says "the last step of this document's chain, not how any given page was read". — owner CONTENT-PDF, RECORD.
status: running — SCHEDULER #23 09:15Z: spawned, stacked on land/worker/D-635 @ d31c52bf
order: after D-671 with the PDF corrections, UNBLOCKED by BOB #35 09:05Z (SCHEDULER #23, 2026-09-25)
milestone: M2
interface: I5 — content.chain_kind changes meaning (IC REQUIRED; readers change); the integrator mints and classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (the derivation chain and its parts), with BOB #35's 09:05Z ruling, folded into Part II (the content object, extraction method) by this row.
depends-on: none (stacked on land/worker/D-635 @ d31c52bf, integrated, on D-627 — its overlapping parts and partKeyOf).
scope: one function computing a unit's chain kind from the last step covering its page; every reader and writer calls it; recompute existing rows; capture_text's reader text as ruled.
accepts-when: on a mixed fixture a text-layer page's unit reads its layer kind and an OCR'd page's reads 'ocr' (moves: every unit 'ocr'). NEGATIVE CONTROL: revert to the generated whole-chain column and the text-layer arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-635's worker).

### D-674 · running — **`manifest.created` IS THE WRITER'S `meta.last_updated`, NOT THE PLANE'S CLOCK: D-546's suite landed an amendment dated BEFORE the move preceding it, so every reader ordering by REC-182's `created` (op=export's promotions, the gate facts) can be steered out of write order by the caller.** Found by D-546's worker (minted on land/worker/D-546). — owner RECORD.
status: running — SCHEDULER #23 09:20Z: spawned from main
order: after D-673, with the promote corrections — a caller-supplied date that orders the record is a provenance hop a caller can invent (CLAUDE.md §5) (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — the order op=export states for promotions; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.7 (write order is the record's order), with REC-182's `created`.
depends-on: none (on main today; D-546's census, integrated, pairs by write order already).
scope: order by rowid (write order) in every reader that orders by `created`, OR stamp the plane's clock into manifest.created and keep the writer's date beside it named as the writer's; list each reader by name.
accepts-when: an amendment carrying a backdated writer date reads AFTER the move it follows in op=export and the gate facts (moves: caller-steered order). NEGATIVE CONTROL: order by `created` again and the backdated arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-546's worker).

### D-641 · running — **107 REFUSAL CODES A MEMBER CAN RECEIVE HAVE NO CANNED TRANSLATION: D-542's R5/R6 walk brought them into reach (reach 488->595) and they are the whole reachGap rise 39->146 — e.g. relationdeclare NO_ENDS / SELF_RELATION, queuemute NO_KINDS, progressiondefine NO_STAGES; the publishedbytes codes overlap D-561.** Listed by check-refusal-codes' `IN REACH ONLY BY OP` line. Found by D-542's worker (minted on land/worker/D-542). — owner RECORD (REC-64's sweep).
status: running — SCHEDULER #23 09:20Z: spawned, stacked on land/worker/D-542 @ fac514e0
order: after D-628 — a member told a bare code instead of words is DEC-49's own defect and product, ahead of the process rows (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 additive — translations only; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it (member-facing refusals carry canned words), with `docs/development/VERIFICATION.md` (the DEC-49 guard) and D-542's R5/R6 arms as built.
depends-on: none (stacked on land/worker/D-542 @ fac514e0, integrated — the reach walk that lists them).
scope: for each of the 107, a DEC-49 row with its translation, OR show at the code that it never leaves on the wire and narrow the walk at that op; lower CEILING.reachGap in the same commit to the measured remainder. Batches of about 20 per commit are fine; the row closes when the gap is 39 or below and each exception is stated.
accepts-when: reachGap reads the measured remainder and every in-reach code carries words or a stated not-on-the-wire reason (moves: reachGap 146). NEGATIVE CONTROL: strip one new translation and the guard names that code.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-542's worker, relayed by CONDUCT #22).

### D-668 · running — **FIVE REFUSAL CODES TELL A MEMBER SOMETHING FALSE AT ONE OF THEIR SITES (DEC-49's one-code-one-condition rule, D-484): `calibrationSubjectRegister` refuses REGISTERING a subject with CAL_NO_PROBE / CAL_UNNAMED (written for a calibration MEASUREMENT); `checkAttestation` answers a missing DATE with TEXT_ATTEST_EXTENT ("say how much you checked") and a missing member with TEXT_ATTEST_MACHINE ("the credential is an automated one"); a `typed` step with no member gets TEXT_CHAIN_STEP_UNNAMED ("a machine read the text").** OBS_PRESENT_NO_REFERENT (airun.mjs) is UNDETERMINED: judge it. Found by D-574's worker (minted on land/worker/D-574). — owner RECORD (text-chain, calibration, airun paths), M0 for the ceiling.
status: running — SCHEDULER #23 09:25Z: spawned, stacked on land/worker/D-574 @ 06494735
order: after D-641, with the DEC-49 translation rows — a false sentence to a member is the over-claim CLAUDE.md §2 ranks worst (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — new named codes; an IC if a surface builds on them; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one code, one condition), with `docs/development/VERIFICATION.md` (the DEC-49 guard, arm G).
depends-on: none (stacked on land/worker/D-574 @ 06494735, integrated — arm G walks the files these sites are in).
scope: give each of the five conditions its own code, catalogue row and translation; judge OBS_PRESENT_NO_REFERENT at its site and split it if false; remove each from MULTI_SITE_CANDIDATES and lower CEILING.multiSiteCodes in the same landing.
accepts-when: each of the five conditions answers its own code whose words are true of it, through the op (moves: five false translations). NEGATIVE CONTROL: route one condition back to its old code and arm G fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-574's worker).

### D-679 · running — **THREE PUBLIC OPS ANSWER A STORE FAILURE AT HTTP 200: index.mjs's op=invitelook, enroll and login read the store's answer as `json(await r.json(), 200)` and never read `ok`, so an anonymous caller is told success-status for a failure (since D-629 it at least carries a named code, not a stack).** REC-52's class. Found by D-629's worker (minted on land/worker/D-629). — owner RECORD.
order: spawned directly after D-629, which it completes: the public door must not say 200 for a failure (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — the three public ops' failure status; the integrator classifies.
design: `docs/architecture/BIO_System_Design.md` §2 (trustworthiness of the record), with REC-52's doAnswer / storeSilent pattern as built.
depends-on: none (stacked on land/worker/D-629 @ 5e202b33, integrated).
scope: open the three through doAnswer and answer storeSilent (502) on a non-answer, or relay the store's status; sweep every other public route for the same read.
accepts-when: a forced store failure on each of the three answers a non-200 status with its named code (moves: HTTP 200 on failure). NEGATIVE CONTROL: restore the bare json(..., 200) on one and its arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-629's worker).

### D-683 · running — **A READING OF A NO-CASE DRAFT IS NOT COUNTED UNDETERMINED ON A FURTHER EDITION PUBLISHED WITHOUT draft=: `#statementAcknowledgements`' unbound COUNT query asks `edition=?`, but such readings are recorded at edition 1 (D-568), so the count drops them.** Established from the code, not driven. Found by D-680's worker (minted on land/worker/D-680). — owner RECORD.
order: spawned directly after D-680, the same edition filter D-680 removed from the link arm (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 — the unbound count on a further edition; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 and §6A.4 (as D-680 folded BOB #35's 07:35Z ruling).
depends-on: none (stacked on land/worker/D-680 @ 0d17eb0e, integrated, on D-626).
scope: drop the edition predicate from the count's case_id IS NULL arm, as D-680 did for the link arm; drive it first through the op (a further edition published without draft=).
accepts-when: a no-case draft's reading counts UNDETERMINED on a further edition (moves: the reading dropped from the count). NEGATIVE CONTROL: restore `edition=?` on that arm and the further-edition arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-680's worker).

### M0-139 · queued — **TWO ARMS OF `current.control.mjs` CANNOT FAIL: arm 8 refuses to arm (its anchor occurs twice in `store.mjs` since REC-124 added `#findingsConcludedElsewhere` with `#findingsStanceDiverged`'s guard), and arm 7's must-fail name survives in `current.test.mjs` only as a comment, and no suite asserts `no_project_scope`.** Predates D-125 (read on 91bcea6b, main and c17-batch4). — owner M0.
order: first of the M0 rows, ahead of process tooling: a negative control that cannot fail is a product suite (the queue's findings) left unverified, not a gate-time tool (SCHEDULER #17, 2026-09-23, CONDUCT #17's 21:43Z finding (3), verified by string count)
milestone: M0
interface: none — a control and one assertion.
design: `docs/development/VERIFICATION.md` (the negative control and its `NEGATIVE CONTROL:` line; CLAUDE.md §5's *"Run the negative control"*).
depends-on: none.
scope: split arm 8 into 8a and 8b, each anchored on its producer's signature line plus the guard; add a `current.test.mjs` assertion driving a finding filed under no project to `available:false, reason:"no_project_scope"` and point arm 7's must-fail at it.
accepts-when: `node bio-plane/test/current.control.mjs` reports every arm run and 0 NOT as declared; 8a and 8b each fail "PURGE THE SHARED QUESTION AND BOTH ITEMS GO QUIET", arm 7 fails the new no-scope assertion by name. NEGATIVE CONTROL: the control's own arms, each recorded on the suite's `NEGATIVE CONTROL:` line.
added: 2026-09-23 · SCHEDULER #17 (CONDUCT #17's finding; `node tools/mintid.mjs M0`).

### M0-171 · queued — **`versions.test.mjs` HARVESTS SCHEMA TABLES WITH A LOOSE PATTERN (`/CREATE TABLE IF NOT EXISTS (\w+)/g`, ~line 719), so it still counts the prose phantom `would` that M0-155 removed from the census.** Found by M0-155's worker. — owner M0.
order: after M0-160, beside the probe-accuracy rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 17:07Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument counts code, not prose).
depends-on: M0-155.
scope: add the `\s*\(` tail `hygiene.test.mjs` (~line 685) uses; re-read the table count from its print.
accepts-when: versions.test's table census equals M0-155's 114. NEGATIVE CONTROL: drop the tail and the `would` phantom returns, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
