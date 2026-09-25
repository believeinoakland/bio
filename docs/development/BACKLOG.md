# The backlog — everything still to do, in order

The middle file of the work pipeline (`docs/development/WORK-PIPELINE.md` §1–§2). `QUEUE.md` is the cache of the next
few items; this file holds every OTHER open item, in the order it will be processed — the top row is next.
What is done lives in the archive (`docs/archive/ledgers/QUEUE-closed*.md`).

- **Rows here use the queue's grammar** — a level-3 heading of an id, a middle dot and a state, then the row's fields
  (WORK-PIPELINE §1). A `blocked` row stays where the order put it, with what unblocks it.
- **Rows leave only by tool.** `node tools/ledger.mjs refill` moves the next runnable rows (state `queued`, every
  `depends-on` met) from the top of this file into the cache until the cache holds 8, deleting them here in the same
  act; a closed row leaves by `node tools/ledger.mjs archive <ID>`. Both refuse any move that does not conserve the id
  multiset of cache, backlog and archive, checked on the plan and again on what is read back from disk.
- **The order is SCHEDULER's** (`kickoffs/SCHEDULER.md`); new work is inserted at its place in the order.
- **Budget:** 150 KiB for the file, 2 KiB for a row (WORK-PIPELINE §2). A placement that puts this file over budget
  moves WHOLE rows from its foot to the head of `BACKLOG-LATER.md` — the same order's tail, looked up and never read
  whole — and a refill or any later write brings them back as room frees; no row is cut to fit (every `coord.mjs write`
  rebalances). `node tools/ledger.mjs invariants` prints the five pipeline invariants; `node tools/plancheck.mjs`
  enforces them.
- **Find any id** — here, in the tail, in the cache or in the archive — with `node tools/ledger.mjs find <ID>`.

Created EMPTY on 2026-09-18 by LED-6's tool half. The rows arrive with the migration (WORK-PIPELINE §5 steps 2–4),
performed by hand by the lane that owns the plan.

## Rows

### D-702 · queued — **D-340 JUDGES A LINK AS SITE CHROME BY CONTAINMENT ONLY, so a page-local sidebar that varies reads as a LOST chrome link (same_page:false).** BOB #35 RULED 2026-09-25 09:30Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded): chrome for links needs containment AND recurrence — site chrome is what RECURS across the site's pages in a chrome region; a page-local sidebar is page content; where recurrence cannot be measured (one page of the site held) the link reads chrome UNDETERMINED, never a loss. — owner CAPTURE.
order: after D-701, the same op's second correction (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3/I5 — navchanges' judgement and the derived site_chrome; the integrator classifies.
design: `docs/development/LINK-FIDELITY.md` §"Chrome: rendering and connection are different problems", with BOB #35's 09:30Z ruling, folded there by this row.
depends-on: D-340 (integrated, land/worker/D-340 @ fdf6c8c9).
scope: a link is chrome when contained in a chrome region AND recurring across the host's held pages; a single held page reads chrome undetermined; a varying sidebar's links are content; navchanges names a loss only for chrome by both tests.
accepts-when: a varying page-local sidebar reports no lost chrome link, and a one-page host reads undetermined (moves: a sidebar read as lost chrome). NEGATIVE CONTROL: judge by containment alone and the sidebar arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, BOB #35's 09:30Z ruling).

### M0-172 · queued — **`status.control.mjs` LEAVES ITS PEN BEHIND (`.status-harness/`, 25 KB `pristine.status`), and `.gitignore`'s pen preamble mis-cites WORKER.md.** BOB #33 RULED (17:12Z): a control driver's PEN is not a session's SCRATCH; in-worktree, gitignored, item-named pens STAND. — owner M0 (fold into any open M0 batch).
order: after M0-171, small; fold into an open M0 batch rather than its own gate (BOB #33, 17:12Z; SCHEDULER #18) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a driver cleans up after a clean run), with BOB #33's ruling of 17:12Z (cite until folded).
depends-on: M0-155.
scope: (1) status.control.mjs removes `.status-harness/` on a clean run; (2) `.gitignore`'s pen preamble says pens are a driver's mechanism, gitignored and item-named, distinct from session scratch; (3) WORKER.md's scratch bullet adds "a control driver's declared, gitignored pen is not scratch".
accepts-when: a clean status.control.mjs run leaves no `.status-harness/`. NEGATIVE CONTROL: remove the cleanup and the pen-gone arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (BOB #33 inbox 17:12Z; `node tools/mintid.mjs M0`).
scope-add: 2026-09-24 by SCHEDULER #19 (via CONDUCT #20, 17:25Z and 18:17Z): control drivers writing `${file}.pristine-<arm>` beside the source, an UNDECLARED pen BOB's ruling does not stand — battery-residue, contradiction-overstrict, d249-port, d301-census, d389-fullfetch, dec65-strength-reach, m041-instrument-census, m057-authority, rec174-supplyfetch, tally-through-pipe, walkfloor, and every `nc-*.mjs` harness (D-499 fixed nc-d64). Fix: a PEN from `mkdtempSync(join(tmpdir(), "<tag>-control-"))`.

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |

### D-671 · queued — **`pdf-worker/src/pagepixels.mjs` READS `/Rotate` FROM THE LEAF PAGE ONLY, though `/Rotate` is inheritable: a page inheriting `/Rotate 270` from `/Pages` renders un-turned — CPDF-12's 8.67%-character failure.** Found by D-374's worker (minted on land/worker/D-374). — owner CONTENT-PDF.
order: after D-670, with the PDF corrections at the head; after D-320, which moves the same line (SCHEDULER #23, 2026-09-25)
milestone: M2
interface: none expected (a rendering corrected, not a wire change).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (tier-3 OCR rendering), with D-374's inherited-box reading as built.
depends-on: D-374 (integrated, c7703c3d — exports `pdfPageBox`); D-320 (integrated, 46b43c35 — edits the same function).
scope: read /Rotate up the page tree, reusing pdfstructure's exported `pdfPageBox(doc, pageMap).rotate`; no second reader.
accepts-when: a fixture page inheriting /Rotate 270 from /Pages renders turned and OCRs its text (moves: an inherited rotation ignored). NEGATIVE CONTROL: read the leaf only and the inherited-rotate arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-374's worker).

### D-697 · queued — **D-665's per-image `image_unread` MARKER IS NOT HANDLED BY ITS TWO SIBLINGS' MERGES: D-633's carry in `mergeTier2Text` takes only image_content_*, so a page tier 2 wins drops a still-true `image_unread`; D-635's APPEND in `mergeTier3Text` does not discharge `image_unread` on a page OCR fills, as the replace path already does.** All three sit on land/worker/D-627 separately, so no branch holds the combination. From D-665's worker's union notes. — owner CONTENT-PDF.
order: head of the backlog after D-686 — a correction joining three just-landed rows (D-633, D-635, D-665), built on main once batch30 carries them (SCHEDULER #23, 2026-09-25)
milestone: M2
interface: none expected (markers carried/discharged as their meaning already says); the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (tier markers; BOB #35's 06:25Z per-image ruling and 08:05Z re-grade).
depends-on: D-633, D-635, D-665 (all integrated on D-627; ride batch30).
scope: mergeTier2Text carries `image_unread` with image_content_*; mergeTier3Text's append path discharges `image_unread` on a page OCR fills; nothing else moves.
accepts-when: a tier-2-won page keeps its image_unread, and an OCR-appended page loses it (moves: a dropped true marker, a kept false one). NEGATIVE CONTROL: drop either change and its arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, D-665's union notes).

### D-676 · queued — **THE ON-POINT CHOOSER DOES NOT OFFER AN UNPLACED OCCURRENCE, THOUGH THE ACT NOW ACCEPTS IT: app.html sends `occurrence` only when it is truthy (`if(d.onpointOccurrence)`), so the '' key D-625 made choosable is never sent, and UI-112's comment "the act reads an empty occurrence= as none named" becomes false.** Found by D-625's worker (minted on land/worker/D-625). — owner UI.
order: at the backlog head after D-682 — a correction joining two just-landed rows (D-625, UI-112) (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3 consumer.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair; UI-112's and D-625's sentences).
depends-on: D-625 (integrated, a42ba046), UI-112 (integrated, bfd57de2) — both ride batch30; build on main after it.
scope: offer the unplaced occurrence as its own choice and send `occurrence` whenever the attribute is PRESENT, including ''; correct UI-112's comment and the §14.5 / construct 6.on-point-ui sentences D-625's union names.
accepts-when: a member chooses the unplaced occurrence of a many-place string from the page and op=connectionchoose records '' (moves: an accepted choice the surface cannot make). NEGATIVE CONTROL: restore the truthy test and the unplaced-choice arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-625's worker).

### D-677 · queued — **THE CONTENT FRAMEWORK'S STATUS BULLET FOR D-454 IS SPLICED MID-SENTENCE INTO D-517's: "that figure is CONFIRMED [D-454's bullet] as its valley's midpoint", so both statements read garbled in the front matter.** Found by D-625's worker (minted on land/worker/D-625). — owner RECORD (docs).
order: after D-676, a docs-only correction to the same document; it may ride any Framework landing (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: none.
design: `docs/architecture/CORPUS-STANDARD.md` (front matter states what a document contains), for `docs/architecture/BIO_Content_Framework_v0_10.md`'s front matter.
depends-on: none.
scope: move D-454's bullet after D-517's sentence ends; no other text changes.
accepts-when: both bullets read whole in the front matter; corpuscheck 0 fail (moves: a spliced sentence). NEGATIVE CONTROL: none meaningful for prose; state so.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-625's worker).

### D-685 · queued — **THE ACQUIRE WIRE'S BUDGET LOOP DROPS A WHOLE UNIT whose text plus envelope exceeds the remaining budget (524,288 B), instead of carrying its per-unit-capped prefix (the store caps a unit at 128 KiB with truncated=1) — so a large sheet (M-20: 72.6 MB over 1,056 sheets) silently loses units from search.** Diagnosed at the code, not measured. Found by D-672's worker (minted on land/worker/D-672). — owner RECORD.
order: after D-684, the same acquire path, one worker at a time (SCHEDULER #23, 2026-09-25)
milestone: M4
interface: I3 — a truncated unit carried where one was dropped; the integrator classifies.
design: `docs/development/CONTENT-SEARCH-DESIGN.md` §4.1, with the store's per-unit cap (CAPTURE_TEXT_UNIT_CAP) and the truncated flag.
depends-on: D-684 (running; the same acquire wire).
scope: MEASURE first (a fixture over the budget) in measurements/<id>.md; charge min(bytes, CAPTURE_TEXT_UNIT_CAP) and carry the prefix with `truncated: true`, which the store honours; state what is still dropped when even prefixes exceed the budget.
accepts-when: a unit over the remaining budget is carried truncated and marked so, and search finds its prefix (moves: a unit silently dropped). NEGATIVE CONTROL: charge the whole unit again and the carried-prefix arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-672's worker).

### D-692 · queued — **A REVISION WHOSE BYTES RESTATE `created` LANDS, and bundles.created keeps the creation's value (the ON CONFLICT arm never writes it), so the row and the head bytes disagree — measured: a creation dated 2026-07-24 revised to bytes saying 2020-01-01 landed, and the row still says 2026-07-24.** None live (M-181). Found by D-615's worker (minted on land/worker/D-615). — owner RECORD.
order: after D-628, the same promote function, one worker at a time (SCHEDULER #23, 2026-09-25)
milestone: M7
interface: I3 — a named refusal on op=promote; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (C-2.5 and D-615's derivation), with State Rules v1.5 §4.7's rule that a writer's timestamp never buys an earlier reading (BOB #35 09:05Z/08:00Z, D-673).
depends-on: D-628 (same function).
scope: refuse by name a non-replay revision whose document's `created` differs from the head's (C-86.2's shape, one field over); replay exempt as D-615 made it. Decided by SCHEDULER #23: refusal, not moving the row — moving it would let any writer backdate a creation, which the record's own rules already refuse elsewhere.
accepts-when: a revision restating a different `created` is refused by name, and one restating the same lands (moves: row and bytes disagreeing). NEGATIVE CONTROL: drop the check and the backdated-revision arm lands, failing by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-615's worker).

### D-667 · queued — **ELEVEN MORE SUITES CAN ABORT A FIXTURE WITHOUT REPORTING WHICH SECTIONS NEVER RAN: four print "FIXTURE ABORTED" (d448-review-copy-translation, d543-instant-precision, rec213-reviewcopy-writer, rec217-draft-binding) and seven reach `process.exit` through a bail/abort/die const (case-edition-conclusion, case-project-conclusion, caselifecycle, caseratify-conclusion, current-shared-question, d442-publish-writes-nothing, rec170-manifest-pair).** D-548 and D-564 fixed eight; this is the sweep's remainder. Found by D-564's worker (minted on land/worker/D-564). — owner M0 (the suites).
order: after D-628, behind the head's product corrections: a process row that cuts false-green risk in the gate, placed near the head but never above product (CLAUDE.md §2, Bob 2026-09-22; SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (a suite measures every arm it declares), with D-548's block() recorder as built.
depends-on: D-564 (integrated, land/worker/D-564 @ ae807e25; its d564-block.control.mjs SUITES table is extended here).
scope: adopt D-548's block() recorder and needs() in the eleven suites; add each to d564-block.control.mjs's SUITES table; state the matcher's blind spot (an abort under another name, an inline top-level process.exit) on the control's line.
accepts-when: each of the eleven, with one fixture broken, names the sections that never ran and its totals are unchanged when whole (moves: an abort that hides unrun sections). NEGATIVE CONTROL: disarm the recorder in one suite and its broken-fixture arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-564's worker).

### D-630 · queued — **`suggest.control` arm 7: ANCHOR DRIFT — `    if (prior) {` matches 2 since D-536, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-667, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-631 · queued — **`adminvote.control` arm stamp-dropped: ANCHOR DRIFT — matches 2 (REC-164), so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-630, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-632 · queued — **`aicredential.control` arms 3 and 5: ANCHOR DRIFT — arm 3 matches 0; arm 5 matches 3, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-631, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-634 · queued — **`caseflip.control` arms c, f: ANCHOR DRIFT — match 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-632, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-636 · queued — **`d266scope.control` arm 2: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-634, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-637 · queued — **`d85-surface-run.control` arm no-lens-at-open: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-636, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-638 · queued — **`dec65-strength-reach.control` arm a2: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-637, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-639 · queued — **`fence-e2e.control` arm (3): ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-638, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-640 · queued — **`m025-anchor-witness.control` arm T1: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-639, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-642 · queued — **`nc-coff12` arm slidesbyposition: ANCHOR DRIFT — matches 0 — the same line as D-600 (integrated); re-anchor on the union, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-640, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-643 · queued — **`nc-cpdf18` arm textpin: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-642, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-644 · queued — **`nc-fw17` arm nullhonest: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-643, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-645 · queued — **`nc-mk4` arms machinewide/noshare/sharewide, aiscope: ANCHOR DRIFT — three match 0; aiscope matches 3, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-644, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-646 · queued — **`nc-rec113` arm blind: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-645, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-647 · queued — **`nc-rec114` arms b, c, e: ANCHOR DRIFT — match 2 each, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-646, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-648 · queued — **`nc-rec118` arms b, d: ANCHOR DRIFT — match 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-647, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-649 · queued — **`nc-rec64` arm 1: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-648, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-650 · queued — **`nc-rec82` arms oob/nochain/overstrict: ANCHOR DRIFT — match 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
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

### D-653 · queued — **`nc-rec97` arm overstrict: ANCHOR DRIFT — matches 2, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-652, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-654 · queued — **`nc-rec99` arm 7: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-653, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-655 · queued — **`rec168-capturerequest-principal.control` arms drop-gate/gate-sessions-only/gate-credentials-only: ANCHOR DRIFT — match 2 each (D-666's driver; re-anchor on the union), so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-654, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-656 · queued — **`reviewcopy-inband.control` arm e: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-655, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-657 · queued — **`scheduler.control` arm (6): ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-656, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-658 · queued — **`shadowed-refusals.control` arm 7: ANCHOR DRIFT — matches 2, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-657, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-659 · queued — **`strandedwork.control` arm A7: ANCHOR DRIFT — matches 2, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-658, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-660 · queued — **`strengthpair.control` arms 2, 2b: ANCHOR DRIFT — match 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-659, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-661 · queued — **`versionstate.control` arm 1a: ANCHOR DRIFT — matches 0, so the arm does not break the subject it names and its NEGATIVE CONTROL is not controlling.** Found by M0-197's anchor-drift reader (minted on land/worker/M0-197). — owner M0 (the driver's subject owner re-anchors).
order: after D-660, with M0-197's control-hygiene group behind the product corrections: a control that cannot fail is worse than none, and it is process (CLAUDE.md §2, Bob 2026-09-22) (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197, integrated at land/worker/M0-197 @ 11818309, holds this driver's dated allowance in `tools/anchordrift.json`; a fix landing after it deletes that allowance).
scope: re-anchor the named arm(s) on the subject line as it now reads, or lengthen to a unique span where the count is above 1; delete its allowance from `tools/anchordrift.json`.
accepts-when: the anchor-drift reader reads the driver LIVE with no allowance, and the arm run alone fails its subject by name (moves: a drifted anchor). NEGATIVE CONTROL: this row is one — the driver's own arm, recorded on its line.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-662 · queued — **`refusal-codes.control` ARM (r5): ANCHOR DRIFT — matches 0 and its arm() THROWS, so every later arm is unrun.** Found by M0-197's anchor-drift reader. DUPLICATE OF D-664 (running, the same arm, minted by D-542's worker): this row closes with D-664's landing and names nothing else. — owner M0.
order: after D-661, a duplicate kept so the id is accounted for (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name).
depends-on: D-664 (running).
scope: none of its own: D-664 re-anchors (r5) and re-measures (c), (e), (r2); delete this driver's allowance from `tools/anchordrift.json` with it.
accepts-when: D-664 lands and the reader reads refusal-codes.control LIVE (moves: a thrown arm). NEGATIVE CONTROL: D-664's.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-663 · queued — **FOUR CONTROL DRIVERS ARE UNREADABLE TO THE ANCHOR-DRIFT READER (fieldread, pipeline-readers, verdict-excluder, nc-rec116): their helpers run git and baseline side effects before any anchor table, so M0-197's dry-run tripwire names them UNREADABLE and their anchors are never checked.** Found by M0-197's worker. — owner M0.
order: after D-662, with M0-197's control-hygiene group (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name), with M0-197's anchor-drift reader.
depends-on: none (M0-197 integrated at 11818309 lists the four as allowed UNREADABLE).
scope: thread an anchor capture (anchortable.mjs's anchorTable/anchorEach) through their helpers, and guard their pre-table git and baseline side effects behind the dry-run check; remove their UNREADABLE allowances.
accepts-when: the reader reads all four READABLE with their anchor counts (moves: 4 unreadable drivers). NEGATIVE CONTROL: restore one pre-table side effect and the reader names that driver UNREADABLE again.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-678 · queued — **`walkfloor.control` ARM `phantom` IS NOT AS DECLARED ON UNTOUCHED MAIN (5e8a65a8): it hard-codes `5 of 6 attribution(s)`, and the corpus reads 3 at HEAD — so the arm's verdict depends on the corpus, not on the subject.** Not an anchor drift. Found by M0-197's worker. — owner M0.
order: after D-663, with M0-197's control-hygiene group (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name).
depends-on: none.
scope: derive the expected N of N+1 from the baseline run instead of a literal; correct the arm with a comment saying why the literal was wrong.
accepts-when: the phantom arm runs AS DECLARED at any corpus count (moves: a hard-coded 5 of 6). NEGATIVE CONTROL: break the subject and the phantom arm fails by name at the current count.
added: 2026-09-25 · SCHEDULER #23 (id minted by M0-197's worker).

### D-687 · queued — **`nc-cpdf10` ARM (f) IS A SURPRISE (fails 0) ON D-635's BASE TOO: since D-627, a page that loses `no_text_layer` is still routed by `image_content_unread`, so the arm's break no longer reaches its subject.** Found by D-635's worker (minted on land/worker/D-635). — owner M0 (CONTENT-PDF's driver).
order: after D-678, with M0-197's control-hygiene group (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (the negative control; admitted for M0 by name).
depends-on: none (D-627, integrated at 056d3092, is the cause; build after it lands).
scope: arm (f) also disarms the image_content route, so its break reaches the no_text_layer routing it names; record on the driver's line.
accepts-when: arm (f) fails its subject by name, AS DECLARED (moves: a surprise arm). NEGATIVE CONTROL: this row is one.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-635's worker).

### D-691 · queued — **TWO TEST HEADERS CLAIM THE UNFLUSHED-EXIT LOSS "CANNOT OCCUR AT ALL" ON LINUX (bio-plane/test/stdio.mjs's THE MECHANISM section; tally-through-pipe.test.mjs's header), while M-183 measured it ON LINUX under parallel load (a node {stdio:"pipe"} socketpair) — the record claims more than it supports.** Found by D-690's worker (minted on land/worker/D-690). — owner M0 (plane test estate; prose only).
order: after D-687, with the control-hygiene group — prose only, behind product (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test prose).
design: `docs/development/VERIFICATION.md` (a vendor's documentation is a claim, labelled as theirs; admitted for M0 by name), with M-183.
depends-on: D-690 (integrated, land/worker/D-690 @ eea7e8a5 — M-183 lands with it).
scope: correct both headers to cite M-183 (loss measured on Linux under parallel load; node's documentation is the vendor's claim); no code change.
accepts-when: neither header states the loss cannot occur on Linux, and both cite M-183 (moves: a false platform claim). NEGATIVE CONTROL: none meaningful for prose; state so.
added: 2026-09-25 · SCHEDULER #23 (id minted by D-690's worker).

### D-704 · queued — **`civicos-ui/check-mock-envelope.mjs` SPAWNS SUITES PIPED WITH NO `maxBuffer` (node's 1 MiB default), so a suite that overflows it is KILLED and its tally lost — D-387's reader-side class, left open as HALF 2 of CLAIMS.md's DELEGATION 2026-09-16 M0 (M0-36) -> UI, with no plan row.** D-387 closed for run.mjs; this caller was not covered. Raised by D-690's worker. — owner UI (the delegation).
order: after D-691, with the control-hygiene group — a tally that can vanish is a check that cannot fail (SCHEDULER #23, 2026-09-25)
milestone: M0
interface: none (test-only).
design: `docs/development/VERIFICATION.md` (a run without its final line did not finish; admitted for M0 by name), with D-387's measured ENOBUFS at 1,114,112 bytes.
depends-on: none.
scope: set an explicit maxBuffer (or stream to a file) for every child check-mock-envelope spawns, as run.mjs does since D-387; sweep the other civicos-ui check-*.mjs spawners; discharge half 2 of the delegation on coord CLAIMS.md.
accepts-when: an armed suite emitting over 1 MiB delivers its tally through check-mock-envelope (moves: a killed child). NEGATIVE CONTROL: remove the maxBuffer and the overflow arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs D`, D-690's report).

### REC-224 · queued — **AN OWNER'S STANDING REQUEST TO LEAVE CAN BECOME ONE THAT CAN NEVER BE HONOURED: if two owners both hold `leaving`, the first honoured strands the other; and `projectOwnerRemove` (§7.10) can remove the last committed owner while the rest hold `leaving`.** REC-186's two gaps (its worker, 02:28Z). BOB #34 RULED 2026-09-25 02:35Z (drained to `BOB-INBOX-drained.md`; cite until folded): the floor counts COMMITTED owners (owners holding no `leaving`); an owner's leave is REFUSED LAST_COMMITTED_OWNER when no OTHER committed owner exists; `projectOwnerRemove` is REFUSED when it would leave only leaving owners, naming them; one helper on Store.ownerMath's floor. — owner RECORD.
order: right after REC-186, in product order: a request that can never be honoured is an overclaim (BOB #31's reason, BOB #34 02:35Z) (SCHEDULER #21, 2026-09-25)
milestone: M8
interface: I3 — two named refusals; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7.6 and §7.10, with BOB #34's 02:35Z ruling, folded by this row with REC-186's fold.
depends-on: REC-186.
scope: as ruled; both refusals carry DEC-49 rows; one committed-owner helper serves projectLeave and projectOwnerRemove.
accepts-when: of two owners, the second to ask is refused while the first's request stands; removing the last committed owner while the others are leaving is refused by name (moves: an unhonourable request). NEGATIVE CONTROL: count owner flags instead of committed owners and both arms fail by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs REC`).

### D-586 · queued — **AN `ai` CREDENTIAL'S SCOPE ACCEPTS OPS NO CREDENTIAL CAN EVER PERFORM: `aiReachesAsMember` admits any op whose classes include `member` with no machineClasses, which covers GOVERNANCE_ACTIONS (adminendorse, adminremove, membercaps) and IDENTITY_ACTIONS (groupnameset, groupdomainset), whose `!viaSession` fences refuse every credential; so `op=aicredentialmint` records a permission that can never be honoured (MEASURED for adminendorse: mint ok:true, the act refused OPERATOR_TOKEN_CANNOT_GOVERN).** Found by REC-162's worker (02:37Z). — owner RECORD.
order: after REC-224, with the authority corrections: a recorded permission that can never be honoured is an overclaim on an authority surface (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M8
interface: I3 — the mint refuses those five ops; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (administrators do not run the instance) and §4.10, with the AI-credential scope's AI_SCOPE_BEYOND_MEMBER_REACH (C-29.9).
depends-on: REC-162.
scope: `aiReachesAsMember` returns false for ops fenced to sessions, expressed as one property of the op rather than two lists; the mint refuses them AI_SCOPE_BEYOND_MEMBER_REACH.
accepts-when: a machine-attest arm minting each of the five is refused by name, and a member op still mints (moves: a mint that records the impossible). NEGATIVE CONTROL: drop the session-fence test and the five arms mint, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by REC-162's worker).

### D-613 · queued — **`op=publishedbytes` WITH format=zip ANSWERS `DUPLICATE_PATH` AT HTTP 413: every `serialiseContainer` refusal is sent as 413, so a stranger is told a request is too large when it names a path twice.** Found by D-561's worker (04:43Z). — owner RECORD.
order: after D-586 (D-605 moved to the cache), with the public-door corrections: a status that states the wrong reason misleads a stranger on the public door (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: I3 — an HTTP status on one public refusal; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §4 (the public reads; §7 is attribution, per D-561's worker).
depends-on: D-561 (land/worker/D-561 @ 1ab197c5; it renames container TOO_LARGE to CONTAINER_TOO_LARGE).
scope: status by code in the serialiseContainer refusal path: 409 for DUPLICATE_PATH, 413 only for CONTAINER_TOO_LARGE; grep the path for any other code it returns and give each its own status.
accepts-when: a zip request naming a path twice answers 409 DUPLICATE_PATH, and an over-large one 413 (moves: a duplicate path reported as too large). NEGATIVE CONTROL: send 413 for every refusal again and the duplicate arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-561's worker).

### D-618 · queued — **A DRAFT THAT NAMES A CASE AND ALSO SETS `newCase` STILL ANSWERS THAT CASE'S NEXT EDITION beside a sentence saying its case is UNDETERMINED (publication refuses the pair CASE_IDENTITY_AMBIGUOUS), so the answer states an edition for a case the record has not chosen.** Found by D-568's worker (05:36Z). — owner RECORD.
order: after D-613, with the review-copy corrections: D-568's class, one branch over (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: I3 — `edition` reads null for that pair; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's newCase ruling and D-568's `#statedEdition`.
depends-on: D-568 (land/worker/D-568 @ d5da99bb).
scope: #statedEdition answers null when caseId and newCase are both set, in the same five answers D-568 covers.
accepts-when: a case-naming newCase draft answers edition null in all five (moves: an edition beside an undetermined case). NEGATIVE CONTROL: answer the named case's next edition again and the ambiguous-pair arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-568's worker).

### UI-117 · queued — **A DRAFT HOLDING BOTH `caseId` AND `newCase` IS NOT SURFACED ON THE REVIEW-COPY FORM: BOB #35 RULED 2026-09-25 06:45Z (drained to `BOB-INBOX-drained.md` by SCHEDULER #23; cite until folded) — SURFACE it, never refuse to load, never drop `newCase` silently.** The form loads such a draft and shows BOTH values exactly as stored, with one plain line: this draft names an existing case AND a new one, and cannot be published until an owner keeps one (the plane refuses the pair, CASE_IDENTITY_AMBIGUOUS). Keeping one is the owner's own act — a save that clears the other field — offered with neither preselected (DEC-69). Found as UI-106's form gap. — owner UI.
order: after D-618 — the same both-identity pair, its plane half first (BOB #35's placement, 06:45Z; SCHEDULER #23, 2026-09-25)
milestone: M10
interface: none expected (UI only; reads what the draft already carries).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #35's 06:45Z ruling, folded into §6A.4 by this row.
depends-on: UI-106 (integrated, land/worker/UI-106; rides batch30).
scope: the review-copy form round-trips a both-valued draft unchanged, renders both values and the one line, and offers "keep the existing case" / "keep the new case" as saves that clear the other field; nothing prefilled.
accepts-when: a both-valued draft loads, shows both, and a save without an owner's choice keeps both (moves: the form drops `newCase` silently). NEGATIVE CONTROL: restore the silent drop, and the arm that round-trips a both-valued draft fails by name, reading `newCase` gone.
added: 2026-09-25 · SCHEDULER #23 (BOB #35's inbox entry of 06:45Z).

### UI-118 · queued — **THE EXPORTED REVIEW COPY OMITS THE DATE TIE: when op=reviewcopy's `last_change.undetermined_within` is non-empty, UI-69's exported page carries `inband` but not `last_change`, so its Date line states a single last change the record cannot settle.** An owed UI act from D-573's report (via CONDUCT #22, batch29 union). — owner UI.
order: after UI-117, with the review-copy surface rows (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 consumer.
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 (the review copy's in-band quartet), with D-573's `last_change.undetermined_within`.
depends-on: UI-69, D-573 (both integrated, ride batch29).
scope: the export renders the tie statement beside its Date line in the plane's words whenever undetermined_within is non-empty; nothing when empty.
accepts-when: an exported copy of a draft with a tie shows the statement by its Date line (moves: a single date beside a tie). NEGATIVE CONTROL: drop last_change from the export and the tie arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs UI`, CONDUCT #22's relay of D-573).

### UI-121 · queued — **NO SURFACE SENDS `draft=` OR SHOWS `draft_case`: D-680 made the signed block state how its case was bound (derived_at_publication, named_and_confirmed, new_case_asked_at_publication, named_by_draft, new_case_asked_by_draft) and refuses a named case that is not the derived one (C-44.6), and no page offers the draft binding or shows which way the case was bound.** From D-680's worker's report. — owner UI.
order: after UI-118, with the review-copy and publication surfaces (SCHEDULER #23, 2026-09-25)
milestone: M10
interface: I3 consumer.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (as D-680 folded BOB #35's 07:35Z and 08:15Z rulings).
depends-on: D-680 (integrated, land/worker/D-680 @ 0d17eb0e).
scope: the publish act can name its draft (`draft=`), nothing preselected; a published case page states its `draft_case` in the plane's words; C-44.4 and C-44.6 render in their DEC-49 words with both cases named.
accepts-when: a member publishes from a named draft and the case page states how its case was bound (moves: a signed statement no surface shows). NEGATIVE CONTROL: drop draft_case from the page and the statement arm fails by name.
added: 2026-09-25 · SCHEDULER #23 (`node tools/mintid.mjs UI`, D-680's report).

### REC-226 · queued — **AN OWNER'S `projectinvite` OF A MEMBER WHOSE REQUEST TO JOIN IS OPEN LEAVES THE REQUEST OPEN, so the record holds a stale request the owner has in fact answered.** BOB #35 RULED 04:30Z on REC-150's gap (a), CHANGING the provisional: the invite CLOSES the request as `granted`, by the inviting owner, at that act. — owner RECORD.
order: after D-586, with the membership corrections: a request the owner answered still reading open is the record claiming less than happened (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: I3 — the request's state after an invite; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7.14, with BOB #35's 04:30Z ruling (this row's worker folds it).
depends-on: REC-150 (land/worker/REC-150 @ 1d02811f).
scope: one UPDATE through `Store#closeJoinRequests` in projectInvite, one suite arm. FOLD both rulings into §7.14: (a) as above; (b) KEEP: an administrator and the founder cannot ask to join (their sight is custodial), and C-95.2's refusal says so and names the invite path; remove the front matter's UNDECIDED (a) entry REC-150 added.
accepts-when: after an owner invites a member with an open request, the request reads granted by that owner (moves: a stale open request). NEGATIVE CONTROL: drop the UPDATE and the request reads open after the invite, by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs REC`; BOB #35 04:30Z).

### D-570 · queued — **`networkidle` NEVER FIRES ON THE FOUNDING CLIENT-RENDERED SOURCE: on oaklandca.opengov.com it fired in 0 of 16 runs (60 s cap; load at 3.6-9.0 s), so every render of it ends on its timeout reading "may be incomplete" and burns its whole reservation.** Found by D-520's worker (M-151). BOB #34 RULED (c) 2026-09-25 02:00Z (drained to `BOB-INBOX-drained.md`; cite until folded): load, then a 500 ms quiet window with no request YOUNGER than N seconds in flight, N MEASURED; `render.wait` records which rule fired (`networkidle` / `quiet_excluding_long_lived` / `timeout`), N, and the ignored requests' count and URLs; a quiet-window settle reads "settled; N long-lived request(s) still open were not waited for", never "complete". — owner CAPTURE.
order: after D-585, with the capture corrections: a render stated incomplete that the record could settle says less than it knows (BOB #34 02:00Z) (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: I3/I5 — `render.wait`'s rule, N and ignored requests; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md`, beside BOB #32's render rulings, with BOB #34's 02:00Z ruling, folded by this row.
depends-on: D-520.
scope: measure request lifetimes on the client-rendered corpus sources (extend M-151) and set N from them; implement the quiet window in the driver; record and state as ruled.
accepts-when: an opengov fixture settles by the quiet window with its open long-poll named; a page that never quiets still times out reading incomplete (moves: 16 of 16 timeouts). NEGATIVE CONTROL: drop the age exclusion and the opengov arm times out by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-520's worker).

### D-593 · queued — **A `text/csv` BODY'S READING TEXT AT ACQUIRE IS THE INTAKE LOSSY-UTF-8 DECODE, NEVER csv.mjs's `text()`: an undetermined-encoding byte reaches the content-type reader as U+FFFD, the sheet's cells are not the reader's units, and a csv over 8 MiB (multipart) is not read at all; only `application/csv` reached the format entry.** Found by REC-218's worker (02:51Z). — owner FRAMEWORK, RECORD.
order: after D-585, with the reader corrections: a reading of bytes the record cannot decode stated as text claims more than it holds (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: I1 — the reading text of a csv capture changes source; the integrator classifies.
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32" (the entry IS the csv reader), with REC-218's `reading.dialect`.
depends-on: REC-218.
scope: in op=acquire, when the detected format's registry entry has a `text()` slot, route the single-part body to the format wire instead of the intake decode, naming no format in index.mjs (the D-70 pin holds); the multipart case stays a stated undetermined.
accepts-when: a `text/csv` capture's reading units are the sheet's cells with the dialect recorded, and a latin-1 byte never becomes U+FFFD in them (moves: the intake decode for csv). NEGATIVE CONTROL: route text/csv back to the intake decode and the cell-units arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by REC-218's worker).

### D-591 · queued — **Tier 1 inflate (pdfstructure.mjs, DecompressionStream "deflate") refuses a Flate stream with bytes after the zlib end ("Trailing junk"), and the page then reads 0 chars with NO page marker: CAFR-2002 has 163 of 199 pages read empty that are in fact undecoded.** Found by D-585's worker (M-160). — owner CONTENT-PDF.
order: after D-593, with the reader corrections: an undecoded page that reads as empty claims more than the record holds (CLAUDE.md §2) (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: I1 — the per-page reading of a Flate PDF with trailing bytes changes; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16.
depends-on: D-585.
scope: (1) Tier 1 inflate tolerates bytes after the compressed stream's end (keep the decoded output, record the trailing count); (2) a page whose content stream Tier 1 could not decode carries a page marker so it cannot read as empty.
accepts-when: CAFR-2002's pages read with text where their streams decode, and no page reads 0 chars without a marker (measured into a measurements/ file). NEGATIVE CONTROL: restore the strict inflate and the trailing-bytes arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-585's worker).

### D-614 · queued — **`tier3Note`'s THIRD CLAUSE SAYS REFUSED PAGES "were dropped rather than allowed to overwrite text this document already had", BUT `mergeTier3Text` REFUSES FOR THREE REASONS (no such page; not asked about; carries glyphs) AND ONLY THE THIRD HAD TEXT, so the record can state text a page never had.** Found by D-607's worker (05:23Z). Not reachable with today's member, which answers only pages it is asked for: defence in depth. — owner CONTENT-PDF.
order: after D-591, with the reader corrections but behind the reachable ones: the same note class as D-607, unreachable today (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: none (a note's wording).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16.
depends-on: D-607 (land/worker/D-607 @ 3206221a, the same function).
scope: mergeTier3Text returns refused split by reason (refusedHadText apart); tier3Note says "overwrite text" only for that count, and neutral wording ("were not pages it was asked about, and were dropped") for the rest; test through op=acquire with a stub OCR member that answers for an unasked empty page.
accepts-when: a stub answer for an unasked empty page yields the neutral clause, and one for a page with glyphs the overwrite clause (moves: a stated overwrite of text that never existed). NEGATIVE CONTROL: collapse the reasons again and the unasked-page arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-607's worker).

### D-321 · blocked — **NO REAL IMAGE-ONLY PAGE IN THE CORPUS CARRIES AGENDA-SHAPED TEXT, SO THE `reading_refs` JOIN OVER REAL OCR IS PROVED ONLY ON SYNTHETIC INK (`ocr-member-e2e.test.mjs`).** — owner CONTENT-PDF.
status: blocked — SCHEDULER #22 06:10Z: NARROWED, NOT MET: no real scanned agenda page is held (git: M-170; instance biosmoke7 store=bio: 24 image-only pages, none agenda-shaped, M-170 part 2). Unblocks when a Legistar-shaped scanned agenda is held, or non-Legistar agenda breadth lands in the readers. land/worker/D-321b @ 5ebea344 (385/385 GREEN, carries D-321 3d7ad5a4) rides the train as a partial; minted D-622
order: after D-320; the page must come from bytes already held (the cloud proxy refuses Legistar) (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M2
interface: none — a fixture and an arm.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §16.
depends-on: none — the page comes from bytes already held; D-313 (the image-only corpus) is a stated limitation.
scope: commit one real scanned-agenda page image to the OCR fixtures; drive the join over it.
accepts-when: a real page's OCR yields a `reading_refs` hit. NEGATIVE CONTROL: switch the recogniser off, and the join reads empty by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-622 · queued — **NO TIER READS A JBIG2 OR JPX IMAGE-ONLY PAGE: `pdf-worker/src/pagepixels.mjs` `decodeImage` has no JBIG2Decode or JPXDecode decoder, so tier 3 refuses them UNSUPPORTED_FILTER while tiers 1-2 read 0 glyphs (M-166). The instance now holds 10 JBIG2 pages of enacted City legislation (Ordinance 13035 C.M.S.; a fund-amendment resolution) and 4 single-image JPX pages; CPDF-12 measured 0 of either in 2026-08.** Found by D-321 part 2's worker (06:00Z). — owner CONTENT-PDF.
order: after D-614, with the reader corrections: enacted legislation held and unread by every tier (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I6 — the member's pixel route widens; the integrator classifies.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §6, with CPDF-12's refusal as the landing pad and D-320's DCT decoder as the pattern.
depends-on: D-320 (land/worker/D-320 @ 46b43c35, the decoder seam).
scope: a JBIG2 generic-region decoder (MMR and arithmetic, with JBIG2Globals) and a JPX decoder in decodeImage, each checked pixel-exact against an independent decoder (jbig2dec or PyMuPDF; openjpeg) as D-320 was against Pillow; what they cannot decode is refused by name; measure CPU and memory in-isolate.
accepts-when: Ordinance 13035's JBIG2 page and one JPX page transcribe at tier 3 with pixel digests matching the reference decoder (moves: 14 held pages unread by every tier). NEGATIVE CONTROL: a no-op decoder fails the digest arms by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-321 part 2's worker).

### D-669 · queued — **M-167's POPULATION CANNOT BE RE-ADDRESSED: it committed only truncated file ids and the measuring pen is gone, so D-612's widening (fonts discounted) could not be re-measured and its moved count stands UNDETERMINED (predicted from M-167's refs column: 4 of 8 Docs move to determined).** Found by D-612's worker (06:31Z). — owner CAPTURE.
order: after D-622, with the measurement rows: a figure the record cannot re-take is weaker evidence, but no gate result is false (SCHEDULER #22, 2026-09-25)
milestone: M0 (a measurement)
interface: none (a measurement).
design: `docs/development/VERIFICATION.md` (measure; do not recall; a measurement names its population so it can be re-taken).
depends-on: D-612 (land/worker/D-612 @ f2dcbc6c).
scope: take a fresh public-government Google Docs and Slides population with FULL target ids committed in the measurement log, re-run tools/measure-odf-stability.mjs through the plane with store=scratch (witness counters before and after), and record the moved .odt count under D-612; never CAP-11's captures.
accepts-when: the .odt determined count after D-612 is measured on a re-addressable population, date and instrument stated (moves: an undetermined moved count). NEGATIVE CONTROL: count fonts again and the moved count falls back, by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs D`; D-612's worker's finding).

### D-572 · queued — **A MULTI-QUESTION PROJECT RUN HAS NO TARGET FOR A LEVEL-EMPTY CANDIDATE: after D-451 a project citing SEVERAL questions still seeds none, so its table-made candidates are refused SUGGEST_NO_TARGET.** Found by D-451's worker. BOB #34 RULED (c) 2026-09-25 02:05Z (drained to `BOB-INBOX-drained.md`; cite until folded): a level observation NAMES the question(s) its search was for; one candidate per NAMED question, never per cited question; an observation naming none keeps today's provisional (UNDETERMINED with the count, refused, logged) and the instrument states "N empty levels not attributed to a question". — owner RECORD, agent-worker.
order: after D-570, in product order: a candidate claiming a search the log does not show overclaims (BOB #34 02:05Z) (SCHEDULER #21, 2026-09-25)
milestone: M6
interface: I3 additive — the skill pack's observation shape gains `question`; the integrator classifies.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5 and §15, with BOB #34's 02:05Z ruling, folded by this row.
depends-on: D-451.
scope: the level observation carries `question` (one or several); the table targets each named question; an unnamed one stays provisional and is counted as unattributed by §15's instrument.
accepts-when: a run whose level observation names Q2 files exactly one level-empty candidate on Q2; one naming nothing is refused and counted unattributed (moves: SUGGEST_NO_TARGET on every multi-question run). NEGATIVE CONTROL: target every cited question and the named-only arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-451's worker).

### D-582 · queued — **A RENDER RESULT CODE IS TREATED AS "fetched nothing": C-83.6 RENDER_NOT_A_PAGE and C-83.7 RENDER_FAILED are decided AFTER the shell was fetched (index.mjs `is-render-result`), yet the drain gives the host slot back and holds the row, so a PDF asked for as a render is re-fetched every tick until expiry.** Found by D-523's worker (02:02Z). — owner CAPTURE.
order: after D-572, with the capture corrections: a fetch repeated every tick spends a source's courtesy for nothing (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: none unless a request's state changes on the wire (the integrator classifies).
design: `docs/development/CLIENT-RENDERED.md` (BOB #33's 19:54Z ruling as D-523 folded it), with `docs/development/NOTIFICATIONS.md` for the condition kinds.
depends-on: D-523.
scope: split admit codes from result codes in the drain; a result code spends the slot; RENDER_NOT_A_PAGE is terminal (refused).
accepts-when: a PDF asked as a render is fetched once and refused RENDER_NOT_A_PAGE (moves: a re-fetch every tick). NEGATIVE CONTROL: treat result codes as admit codes again and the once-only arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-523's worker).

### D-583 · queued — **A RUN WAITING ON A RENDER THAT EXPIRES IS NOT WOKEN: FL-4's `#aiRunWakeRuns` reads `captured` and `refused` only, so D-523's `expired` reaches the run's log and never wakes it.** Found by D-523's worker (02:02Z). — owner RECORD (FL-4's wake).
order: after D-582, with the capture corrections: a run left waiting on an ask that has ended (SCHEDULER #21, 2026-09-25)
milestone: M6
interface: none unless the wake detail's vocabulary is published (the integrator classifies).
design: `docs/development/CLIENT-RENDERED.md` (BOB #33's 19:54Z ruling as D-523 folded it), with `docs/development/NOTIFICATIONS.md` for the condition kinds.
depends-on: D-523.
scope: count `expired` as a completion under its own name in the wake detail, driven in scheduler.test.mjs.
accepts-when: a run waiting on a render request that expires is woken with "expired" named (moves: a run never woken). NEGATIVE CONTROL: drop `expired` from the wake set and the expiry arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-523's worker).

### D-584 · queued — **CAPTURE_FETCH_FAILED IS WRITTEN TO `capture_requests.code` AND CATALOGUED IN NO DEC-49 FAMILY, so D-523's render-deferred condition and op=capturerequests can show a member a code with no canned translation.** Found by D-523's worker (02:02Z). — owner CAPTURE.
order: after D-583, with the capture corrections: a code reaching a member untranslated is DEC-49's failure (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: I3 additive — code, check and translation; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` (BOB #33's 19:54Z ruling as D-523 folded it), with `docs/development/NOTIFICATIONS.md` for the condition kinds.
depends-on: D-523.
scope: catalogue CAPTURE_FETCH_FAILED as a C-28 row at one governed site, or keep it off the code column and say why.
accepts-when: a failed fetch's row carries a catalogued code with its translation (moves: an uncatalogued code on the column). NEGATIVE CONTROL: strip the row and the translation arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-523's worker).

### D-581 · queued — **A PLAIN CAPTURE REQUEST PAST ITS `expires` IS STILL DRAINED AND FETCHED: the drain reads `expires` only for render rows (D-523); and `#conditionsRenderDeferred` and `#conditionsCaptureRequested` walk `capture_requests` unbounded while terminal rows stay forever.** Found by D-523's worker (02:02Z; the unbounded walks admitted in derivation-bounds' census note, folded here). — owner CAPTURE, RECORD.
order: after D-584, with the capture corrections: an ask that has lapsed is still acted on (SCHEDULER #21, 2026-09-25)
milestone: M2
interface: I3 — a plain request's terminal `expired` state and op=queue's cut; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` (BOB #33's 19:54Z ruling as D-523 folded it), with `docs/development/NOTIFICATIONS.md` for the condition kinds.
depends-on: D-523.
scope: release an expired plain row as D-523 released a render row (state `expired`, its code kept, LOOKED_INDETERMINATE in the run log); bound both condition producers and publish the cut on op=queue. If what a lapsed PLAIN ask records needs a ruling, send it to BOB and build the render rule meanwhile.
accepts-when: a plain request past `expires` is not fetched and reads expired; the producers state their bound (moves: a lapsed ask fetched; unbounded walks). NEGATIVE CONTROL: skip the expiry test for plain rows and the lapsed-ask arm fetches, failing by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-523's worker).

### D-603 · queued — **EVERY SUBRESOURCE RECORD IN A CAPTURE MANIFEST CARRIES `fetched_at` FROM THE LOOP STEM, INCLUDING RECORDS NEVER FETCHED: a reused part (`fetched_this_capture: false`, whose real fetch instant is `reused_from_fetched_at`) and every policy-skipped, DEFERRED, CAP_REACHED, BUDGET_EXHAUSTED or refused reference, so the record claims a fetch at an instant nothing was fetched.** Found by D-191's worker (03:56Z). — owner CAPTURE.
order: after D-581, with the capture corrections ahead of features: a manifest stating a fetch that never happened is the record claiming more than it supports (CLAUDE.md §2) (SCHEDULER #22, 2026-09-25)
milestone: M2
interface: I5 — a manifest field narrowed; the integrator classifies (consumers checked by the finder: civicos-ui reads only reused_from_fetched_at; partFetchSpread reads fetched_at only for fetched parts).
design: `docs/development/CAPTURE-SCALING.md` §"Checking that a reused asset is still the same", with D-191's per-clock spread.
depends-on: D-191 (land/worker/D-191 @ 9351b715; the spread that reads fetched_at).
scope: keep `fetched_at` only on records whose request was ISSUED; stamp the others under a name that claims no fetch (`considered_at`) or drop it. Extend `bio-plane/test/subresources.test.mjs`.
accepts-when: a reused part and a policy-skipped reference carry no fetched_at (moves: every unfetched record claiming a fetch). NEGATIVE CONTROL: restore the stem's fetched_at and that arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-191's worker).

### UI-113 · queued — **NO SURFACE RENDERS A PUBLISHED CASE'S FROZEN `bias_manifest` BLOCK AT ALL (0 hits in civicos-ui), so REC-219's pending-adoption statement reaches no page.** Found by REC-219's worker (02:38Z). — owner UI.
order: after UI-110, with the surface halves of landed record rows (SCHEDULER #21, 2026-09-25)
milestone: M10
interface: none (reads REC-219's /4 block).
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 18, with Declared Bias "Bias bundles and adoption".
depends-on: REC-219; D-597 (the citations half, built on REC-219's branch at b9528b03).
scope: the published case page renders the frozen bias_manifest as the document states it, verbatim (DEC-8): the stated sentence, and pins_proposed_stated with each pending revision; /3, /2 and /1 documents render what they carry, never a default. ALSO (REC-219's report 03:40Z: no surface renders case_citations either): render the signed case_citations[] with each edge's state (pinned, only_capture, undetermined, no_capture, no_bytes) from op=casedocument's `citations`, and a /3 case's "version undetermined (signed before capture pins)".
accepts-when: a /4 case with a pending adoption shows it; a /3 case shows its own statement and nothing invented (moves: no surface); a /4 citation shows its pin state.  NEGATIVE CONTROL: drop the block and the pending arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs UI`).

### UI-115 · queued — **UI-69's EXPORTED REVIEW COPY OMITS D-573's TIE STATEMENT: the export prints "Date … the copy's last change" from the in-band quartet and carries no `last_change`, so a file that leaves the instance claims an order of two same-second acts the record cannot support.** Found by D-573's worker (05:23Z). — owner UI.
order: after UI-113, with the surface halves of landed record rows: a file read away from the instance holds only the page (SCHEDULER #22, 2026-09-25)
milestone: M10
interface: none (reads D-573's I3 key).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.3 point 1 (D-573's fold) and point 2 (UI-69's export).
depends-on: UI-69, D-573.
scope: beside the export's Date line, draw last_change.stated's tie sentence verbatim when last_change.undetermined_within is non-empty; the in-band quartet unchanged; the same on the member door's copy view if it shows the date.
accepts-when: an exported copy whose pick ties a whole-second act carries the plane's tie sentence beside its date, and an untied one carries none (moves: a tied date exported as ordered). NEGATIVE CONTROL: drop the sentence and the tied-export arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs UI`; D-573's finding).

### UI-116 · queued — **NO SURFACE SHOWS A MACHINE'S RISK-TIER PROPOSAL BESIDE THE MEMBER'S TIER: REC-215 built the plane half (op=projection's action block carries risk_tier_proposals, labelled), and the action page shows only the member's tier and history (UI-104).** The surface half of REC-215. — owner UI.
order: after UI-115, with the surface halves of landed record rows (BOB #33's risk-tier ruling: plane, then UI) (SCHEDULER #22, 2026-09-25)
milestone: M7
interface: none (I3 consumer of REC-215's projection block).
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (only a member's authored act sets a tier), with UI-102's shape for the governing-laws proposal (shown beside, no adopt control).
depends-on: REC-215, UI-104.
scope: on the action page beside UI-104's tier block, render each proposal as the plane labels it (machine work, its basis, its proposer), with NO adopt control; the member's own revise act stays the only way to set a tier; the plane's truncation stated.
accepts-when: against the real plane a proposal renders labelled beside the tier, and no control on the page sets the tier from it (moves: no surface for the proposal). NEGATIVE CONTROL: add an adopt control and the no-adopt arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs UI`; REC-215's worker's note).

### D-624 · queued — **THE SINGLE-ITEM DEFER/DISMISS DIALOG (`doProposalDispose` via `openProposalAct`) STILL SENDS `{key, to, reason}` FOR A PROJECT-SCOPED FINDING AND IS REFUSED NO_PROJECT_SCOPE: D-266's DELEGATION RECORD -> UI (2026-08-10), open since 2026-09-16 with no plan row.** Found by UI-110's worker (06:19Z). — owner UI.
order: after UI-115, with the surface halves of landed rows: the one-item act fails for every project-scoped finding (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: none (consumes REC-205's per-item project).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class", with D-266's NO_PROJECT_SCOPE.
depends-on: UI-110 (land/worker/UI-110 @ ba126d29; queueHomeFor and the picker); D-623 (the refusal's words).
scope: the dialog reads disposition.scope/projects, sends {project, finding}, reuses queueHomeFor and the ask-never-default picker; discharge D-266's DELEGATION block.
accepts-when: against the real plane a single project-scoped finding is deferred or dismissed through the dialog; a two-home finding is not sent until the member names one (moves: NO_PROJECT_SCOPE on every project-scoped dialog act). NEGATIVE CONTROL: send {key,to,reason} again and the dialog arm reads NO_PROJECT_SCOPE, failing by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by UI-110's worker).

### D-609 · queued — **A MEMBER CAN PLACE A DOCUMENT OR PASSAGE IN A THEME ONLY FROM THE THEME'S PAGE, BY TYPING ITS BUNDLE ID OR CONTENT ID: the document page and the passage row offer no "place in a theme" entry.** Found by UI-76's worker (04:05Z). — owner UI.
order: after UI-113, with the surface halves of landed rows: the act exists and is reachable only by an id a member must copy by hand (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: none (I3 consumer of op=themeread and op=themeplace).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.4, fences 1-3, as UI-76 built the Themes screen.
depends-on: UI-76 (land/worker/UI-76 @ 37035a59).
scope: on openBundle's page and on the passage row, a "Place in a theme" control that lists themes through op=themeread (its limit named, the bound stated by thmBoundHtml) and sends op=themeplace with that bundle id or content id; nothing preselected; the plane's canned refusal on failure.
accepts-when: against the real plane a member places a document and a passage from their own pages without typing an id (moves: placement by typed id only). NEGATIVE CONTROL: preselect a theme and the nothing-prefilled arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by UI-76's worker).

### REC-225 · queued — **NOTHING SETTLES A DOCUMENT'S ORIGIN SYSTEM WHEN ITS HOST SERVES MANY OFFICES: a multi-office host names no system, so M-157's 24 CIP matches read SYSTEM_UNDETERMINED through idmatch, and no member act can declare where a document came from.** BOB #35 RULED 2026-09-25 04:20Z on REC-203's gap (2): *"A HOST IS NOT AN ORIGIN"*. — owner RECORD.
order: after D-609, with the features over landed record rows: REC-203's matcher cannot count the pairs it was built for until an origin can be declared (SCHEDULER #22, 2026-09-25)
milestone: M4
interface: I3 — a new member act; the builder names the op and registers it in PLANNED_OPS; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 as BOB #35 folded it 04:20Z (land/bob/batch-0925c @ fc85cb3c).
depends-on: REC-203 (on main).
scope: a MEMBER'S ATTRIBUTED act declaring a document's origin system: per document, dated, append-only, latest wins; idmatch reads a declared origin before the host; a machine credential declaring is refused by name.
accepts-when: the CIP to Legistar pairs of M-157 count through idmatch once each side's origin is declared, and a machine credential declaring is refused by name (moves: 24 pairs SYSTEM_UNDETERMINED). NEGATIVE CONTROL: idmatch ignores the declaration and the declared-pair arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs REC`; BOB #35 04:20Z).

### UI-114 · queued — **NO SURFACE LETS A MEMBER DECLARE A DOCUMENT'S ORIGIN SYSTEM, OR SHOWS WHO DECLARED IT AND WHEN.** The surface half of REC-225 (BOB #35 04:20Z). — owner UI.
order: directly after REC-225, which it consumes (SCHEDULER #22, 2026-09-25)
milestone: M4
interface: I3 consumer (REC-225's op).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.3 as BOB #35 folded it 04:20Z, with REC-225's act.
depends-on: REC-225.
scope: on the document page, a declare-origin control (nothing preselected; the plane's canned refusal on failure) and the declaration history: who, when, which system, latest marked as standing; an undeclared multi-office host reads "origin undetermined", never the host's name as a system.
accepts-when: against the real plane a member declares an origin and sees it attributed and dated; an undeclared document reads undetermined (moves: no surface). NEGATIVE CONTROL: render the host as the system and the undetermined arm fails by name.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs UI`; BOB #35 04:20Z).

### D-604 · queued — **THE CONTRADICTION JUDGEMENT HAS NO GATE THAT DISCRIMINATES: M0-71's 26-pair synthetic corpus is scored perfectly by both model families (M-162: 0/17 false conflicts, recall 9/9), so it cannot rank judgements or speak to real documents.** Found by REC-147's worker; BOB #35 RULED 04:50Z: M0-71's corpus is now a FLOOR, not a gate; THRESHOLD 0 stays PROVISIONAL. — owner the contradiction area (RECORD).
order: after UI-114, with the M9 contradiction rows: it is the gate before any PRESENT surface puts a machine candidate in front of a member; BOB #35: *"make PRESENT's first row depend on it"* (no PRESENT row exists yet: it is not designed) (SCHEDULER #22, 2026-09-25)
milestone: M9
interface: none (a corpus, its labels and a measurement).
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §8 and §9, with BOB #35's 04:50Z ruling (this row's worker folds it).
depends-on: REC-147 (on main).
scope: a labelled corpus from REAL captured documents (minutes, staff reports, budget books), several times M0-71's size, with REC-147's hard negatives (a figure legitimately changed between dates; a summary dropping a qualifier; a rule and a compliant act reading opposite; across pages). Two independent labellers, each blind to the other and to the judgement's output, neither the prompt's author; a disagreed pair is EXCLUDED and reported undetermined; every label records who made it and whether a machine did. FOLD into §8: the ruling, plus REC-147's two gaps KEPT as built (version identity = frozen name + claim sha256; run context = the §6 viewer gate only), clearing their Incomplete entries.
accepts-when: the corpus size, its hard-negative count and the labellers' agreement are measured into a measurement, and the judgement's score over it is reported against the lexical baseline. NEGATIVE CONTROL: score the judgement with the disagreed pairs included and the reported figure moves, by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by REC-147's worker; BOB #35 04:50Z).

### D-592 · queued — **A REOPENED FINDING CANNOT SAY WHO REOPENED IT: `op=queue`'s `prior_disposition` names who DECIDED, and nothing publishes who REVISED the declared flow, so UI-109's item states that name is not on it.** Found by UI-109's worker (02:57Z). — owner RECORD, then UI.
order: after D-576, with the surface corrections: the reopened question's own account is incomplete where the record holds the fact (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 additive — the revising version's number, declared_by and at beside prior_disposition; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions".
depends-on: UI-109.
scope: proposalsFeed publishes, from progression_def_versions, the revising version's number, `declared_by` and `at` beside `prior_disposition`; UI-109's item renders them in the plane's words.
accepts-when: a reopened item names who revised the flow and when (moves: "not on it"). NEGATIVE CONTROL: drop the revising fields and the reopener arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by UI-109's worker).

### UI-107 · queued — **THE MUTE REPORT CANNOT OFFER A PER-CASE UNDO FOR A MUTED KIND THAT HOLDS NOTHING BACK TODAY: UI-97 draws no control there and states the named limit (member-respect SETS).** The surface half of D-534. — owner UI.
status: queued — D-534 (02:33Z): read mute.case_kinds (beside mute.cases, unchanged) and drop the per-case narrowing; correct the UI quotes of 'the muted KINDS nowhere' (member-respect.test, notifications.test/control, queue-unmute.test, CIVICOS_UI_STATE.md, construct-status 12.unmute's note)
order: directly after D-534, which it consumes (SCHEDULER #19, 2026-09-24)
milestone: M8
interface: I3 consumer (D-534's IC).
design: `docs/development/NOTIFICATIONS.md` §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class".
depends-on: D-534.
scope: `queueMuteReportHtml`'s per-case undo names every kind the member muted from D-534's published kinds, not only `suppressed[]`'s; retire the named limit in member-respect's SETS row.
accepts-when: against a real plane a member undoes a case mute whose kind holds nothing back today (the measured failure it moves: no control drawn). NEGATIVE CONTROL: read `suppressed[]` alone again and the quiet-kind arm fails by name.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs UI`).

### D-580 · queued — **`#captureForContent`'s "earliest" ORDERS TWO DIFFERENT CLOCKS IN ONE COLUMN: `register.registered` (the server's instant) and `readings.at` (a reading's OWN date from provenance bytes), so a capture held LATER of an older-dated document sorts first and the record presents the wrong version as the one it held first.** Found by REC-220's worker (measured in rec220-version-pin; a re-registration does not move it). — owner RECORD.
order: before REC-222, with the version-pinning corrections: the version a reference resolves to must be the one the record first held (Bob's 2026-09-25 00:40Z doctrine, rule 1) (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: none unless a resolved capture changes on the wire (the integrator classifies).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation), with Bob's 00:40Z doctrine as REC-220 built it.
depends-on: REC-220.
scope: order by when the record first held the bytes (a server stamp for the readings arm, or `captured_locators.first_retrieved`), never by a date read from the document.
accepts-when: an older-dated document captured later sorts after the earlier-held capture (moves: the wrong earliest). NEGATIVE CONTROL: order by `readings.at` again and the held-order arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by REC-220's worker).

### D-579 · queued — **AN ACTION'S BASIS LEG NAMES ONLY A BUNDLE: `action_basis[]` records no capture, so a later capture changes what the leg resolves to.** Found by REC-220's worker (item (b) of D-579; (a), the case edge, rides REC-219's `/4`; (c) is D-595). BOB #34 RULED 2026-09-25 02:30Z under Bob's 00:40Z version doctrine (drained to `BOB-INBOX-drained.md`; cite until folded): an action's basis leg gains an `extent_capture` slot in its frontmatter grammar, I5 ADDITIVE; legs without it read "version undetermined". — owner RECORD.
order: before REC-222, in the version-pinning chain: the notice needs pins to compare against (BOB #34 02:30Z) (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I5 additive — `extent_capture` on an action basis leg; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1, with Bob's 00:40Z doctrine and BOB #34's 02:30Z ruling.
depends-on: REC-220.
scope: stamp the capture the record presents at the act on each action basis leg, as REC-220's op=cite does; a leg without it reads "version undetermined", never back-filled.
accepts-when: a new action basis leg carries its capture, and a later capture on the bundle does not change what it resolves to (moves: bundle-only legs). NEGATIVE CONTROL: drop the stamp and the pin arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by REC-220's worker).

### D-595 · queued — **A RUN'S SUGGESTED VERSION LEGS NAME ONLY A BUNDLE: `op=suggest`'s `suggestVersion` composes legs without `extent_capture`, so a suggestion does not say which capture the run read.** Item (c) of D-579 (REC-220's worker). BOB #34 RULED 2026-09-25 02:30Z under Bob's 00:40Z version doctrine (drained to `BOB-INBOX-drained.md`; cite until folded): suggested version legs carry `extent_capture` through C-25.11's composition. — owner RECORD, agent-worker.
order: after D-579, before REC-222, in the version-pinning chain (BOB #34 02:30Z) (SCHEDULER #21, 2026-09-25)
milestone: M6
interface: I3 additive — `extent_capture` on a suggested leg; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 with C-25.11 (basis versions are frozen, composed without carry-forward), and BOB #34's 02:30Z ruling.
depends-on: REC-220.
scope: C-25.11's composition carries the capture the run read onto each suggested leg; a leg composed without one reads "version undetermined".
accepts-when: a run's suggestion names the capture it read, and an accepted suggestion keeps it (moves: bundle-only suggested legs). NEGATIVE CONTROL: drop `extent_capture` from the composition and the suggested-pin arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs D`).

### REC-222 · queued — **A MEMBER HOLDING A REFERENCE IS NEVER TOLD A NEWER VERSION AFFECTS IT: `op=versionnotice` is a PULL read, and nothing is pushed.** Bob's 00:40Z doctrine, rule 2 (item 3). — owner RECORD.
status: queued — REC-221 (01:51Z): notice-level affects reads 'undetermined' for chain_unread; REC-222 DECIDES whether chain_unread raises a notice (rule 2 says never silence; every address-less capture may be noisy) and states the decision
order: after REC-221, whose grade it reads (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 — a `newer_capture` reevaluation source, a queue kind and a mute kind; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation), with §14.4 and `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.8, and Bob's 2026-09-25 00:40Z version doctrine as BOB #34 decomposed it at 00:55Z (drained to `BOB-INBOX-drained.md`; cite until folded on BOB's batch branch).
depends-on: REC-221.
scope: `Store#reevaluations` gains `newer_capture`, raised per member-held reference graded AFFECTED or UNDETERMINED, never for A or B; one notice per (reference, newer capture), a yet newer capture raising a new one; queue and mute kinds on D-534's model; published cases tell the OWNERS once (Framework §18.1, Bob's 2026-09-24 option D).
accepts-when: an AFFECTED reference raises one notice and an A-graded one raises none (moves: nothing pushed). NEGATIVE CONTROL: raise for A and the silence arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs`).

### REC-223 · queued — **A MEMBER CANNOT ADOPT A NEWER VERSION OR RECORD KEEPING THE EARLIER ONE, so a notice can never close.** Bob's 00:40Z doctrine, rule 3 (item 4). — owner RECORD.
status: queued — REC-220 (02:20Z): KEEP can write extent_capture to pin an UNDETERMINED leg; use it
order: after REC-222 (and carries REC-202's queue door, BOB #35 08:10Z), which raises the notice these acts close (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: I3 — two member acts; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation), with §14.4 and `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.8, and Bob's 2026-09-25 00:40Z version doctrine as BOB #34 decomposed it at 00:55Z (drained to `BOB-INBOX-drained.md`; cite until folded on BOB's batch branch).
depends-on: REC-220, REC-222.
scope: ADOPT writes a NEW basis, cite or claim version pinned to the newer capture and retains the old; KEEP records "stays on the earlier version" with who, when, an optional why and both captures; both close the notice; a machine credential is refused (D-394's design, §5.8, §14.4). ALSO the QUEUE DOOR (BOB #35 2026-09-25 08:10Z, REC-202's Q2; drained): op=queue's `new-version-arrived-from-another-team` item offers ADOPT/KEEP, scoped to a project the member names and has joined, never defaulted (D-266's pattern).
accepts-when: adopt leaves the old version readable and the new one pinned; keep closes the notice and a re-read does not re-raise it for the same capture (moves: no act). NEGATIVE CONTROL: let a machine credential adopt and the refusal arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs`).

### UI-111 · queued — **NO SURFACE TELLS A MEMBER A NEWER VERSION AFFECTS WHAT THEY REFERENCED, OR OFFERS ADOPT / KEEP.** Bob's 00:40Z doctrine (item 5); construct 4.cross-version-ui. UI-96 draws the PULL notice where a citation shows; this row adds the pushed notice and the two acts. — owner UI.
order: after REC-223, the surface half of the version-doctrine chain (SCHEDULER #21, 2026-09-25)
milestone: M4
interface: none (reads REC-222's and REC-223's I3).
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §18.1 (the cross-version relation), with §14.4 and `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` §5.8, and Bob's 2026-09-25 00:40Z version doctrine as BOB #34 decomposed it at 00:55Z (drained to `BOB-INBOX-drained.md`; cite until folded on BOB's batch branch).
depends-on: REC-222, REC-223, UI-96.
scope: where the member meets a reference, and in the queue, show "a newer version of this document exists", the grade in the plane's words, and ADOPT / KEEP; show nothing for A and B.
accepts-when: an AFFECTED reference shows the notice and both acts, an A-graded one shows nothing (moves: no surface). NEGATIVE CONTROL: render for A and the silence arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (`node tools/mintid.mjs`).

### M0-142 · queued — **`meaning-bounds.test.mjs`'s BOUND_KEY HAS NO `max`: `/^(?:limit|cap|bound|page_size|[a-z_]*_limit)$/` (line 382), so a read bounded by a `max`/`*_max` key (bounded actionquotes) is counted BARE and correct work reads unbounded.** Found by c18-batch7fix's worker; verified at 548eb2c5 by CONDUCT #20 and SCHEDULER #18. — owner M0.
order: (held behind c20-batch11fix, SCHEDULER #18 03:47Z) after D-484, with the rows that cut gate time: an over-strict instrument fails correct work (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:37Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: land/conduct/c20-batch11fix on `main` (it rewrites meaning-bounds.test.mjs's segmenter; CONDUCT #20 03:46Z).
scope: add `max|[a-z_]*_max` to BOUND_KEY.
accepts-when: actionquotes' `max` counts as a bound. NEGATIVE CONTROL: remove actionquotes' published max, and the arm names it bare.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### D-611 · queued — **THE AGENT-WORKER'S SEGMENT BOUND IS A TURN COUNT (120), BUT ITS CPU CEILING SCALES WITH BYTES RE-SERIALISED (about turns squared times bytes per turn): M-168 measured no memory wall (P99 flat at 95-123 MB from 400 to 1,400 turns) and CPU binding at ~7-10 ms per MB re-serialised, so 120 is safe today by ~8x headroom but a heavier turn payload moves the ceiling with no bound noticing.** Found by D-312's worker (05:39Z). — owner FLEET.
order: after D-620, with the measured-bound rows: the shipped bound is safe today, so nothing fails; its unit is wrong (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none unless the shipped bound's unit changes (the integrator classifies; FLEET deploys).
design: `docs/development/VERIFICATION.md` (measure; do not recall), for the rule in `docs/development/INTERFACES.md` §"The memory bound, and how it is expressed".
depends-on: D-312 (land/worker/D-312 @ 223766d9; M-168).
scope: bound a segment on cumulative bytes re-serialised, with a margin under ~3 GB (M-168); state the unit at BOUND_SOURCE.
accepts-when: a segment whose turns are few but heavy is cut by the byte bound before the CPU ceiling (moves: a turn count blind to payload size). NEGATIVE CONTROL: bound on turns again and the heavy-turn arm runs past the byte margin, failing by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-312's worker).

### D-590 · queued — **FIVE CODES A REAL-PLANE UI SUITE READS IN A PANE CARRY NO CANNED TRANSLATION: BAD_REQUIRED (intent-write #pg-pf), NO_JUSTIFICATION (#rel-pf), NO_KIND (#ent-pf), each one mint site; NOT_CONCERNED (#pg-th-pf) and NO_REASON (conclude-reading, intent-write #pg-dis-pf, queue-peritem), multi-site (NO_REASON at 13 store.mjs sites + 1 affordances.mjs).** Found by D-485's worker (its ARM H/R4, 02:37Z; owed by name in R4_OWED). — owner RECORD.
order: after D-574, with the DEC-49 rows: a member meets these untranslated today (DEC-49), and the two multi-site codes are consolidated first (D-550/D-574's class) (SCHEDULER #21, 2026-09-25)
milestone: M8
interface: I3 additive — code, check and translation on each; the integrator classifies.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one governed helper, one region, one condition).
depends-on: D-485.
scope: a *_CHECKS row (ACT_SHAPE_CHECKS the natural family) with a canned translation for each; consolidate NOT_CONCERNED and NO_REASON behind one mint site first; remove each from R4_OWED and lower CEILING.reachGap in the same landing.
accepts-when: ARM H lists the five as reached AND translated, R4_OWED holds none of them (moves: five untranslated codes in panes). NEGATIVE CONTROL: strip one translation and ARM H fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by D-485's worker).

### D-599 · queued — **`NOT_CONCLUDED` IS IN REACH (preauth-vocabulary's published-case mock) WITH NO CANNED TRANSLATION: `store.mjs`'s NOT_CONCLUDED site has no DEC-49 row, so a member can meet the plane's raw code.** Found by M0-148's worker (F4, 03:40Z), once its R3-fed walk followed bindings. NO_REVIEW_COPY, the other new gap code, is D-448's. — owner RECORD.
order: after D-590, with the DEC-49 translation rows: the same class, one more code a member meets untranslated (SCHEDULER #22, 2026-09-25)
milestone: M8
interface: none.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, in D-484's settled shape (one governed helper, one region, one condition).
depends-on: M0-148 (the walk that sees it; land/worker/M0-148 @ 07f38280, carrying D-485).
scope: a DEC-49 row for store.mjs's NOT_CONCLUDED site in a *_CHECKS family, and CEILING.reachGap lowered by one from the guard's print (at union with D-448, re-read reach and reachGap from --strict).
accepts-when: check-refusal-codes --strict reads NOT_CONCLUDED translated and reachGap one lower (moves: 1 code in reach untranslated). NEGATIVE CONTROL: drop the row and the guard fails naming NOT_CONCLUDED.
added: 2026-09-25 · SCHEDULER #22 (id minted by M0-148's worker).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |

### REC-158 · queued — **THE PROVENANCE PAIR'S BEARER WRITE IS STAMPED `token:<class>` — NOBODY'S NAME — ON WHAT §4.10 CALLS A NAMED MEMBER'S** … (whole text: the cut archive)
order: directly after REC-155, which it waits on (BOB #20's entry): this landing REFUSES a caller, so it follows the session route DRIVEN, keeping D-200's chain-absent population a route to repair (SCHEDULER #5, 2026-09-21)
milestone: M8
interface: I3 — MAJOR, breaking for bearer writers of the pair; the integrator mints the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10, the provenance pair's bullet, with D-421 … (whole text: the cut archive)
depends-on: REC-155 — DRIVEN, not merely landed.
accepts-when: a bearer `apply=1` and a bearer `provenanceroute` are refused by name; a session's succeed and the author written is the session's member, never `token:<class>`; a bearer … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (BOB #20's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «REC-158» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-587 · queued — **`op=calibrate`'s `measured_by` IS A CALLER-SUPPLIED FREE STRING ("who or what ran the probe"), for bearers already and for sessions since REC-155, so the record can attribute a measurement to anyone.** Found by REC-155's worker (02:37Z). — owner RECORD.
order: after REC-158, with the calibration-write rows: an attribution a caller can hand the record is one a caller can invent (CLAUDE.md §5) (SCHEDULER #21, 2026-09-25)
milestone: M8
interface: I3/I5 — a server-stamped principal column beside `measured_by`; the integrator classifies.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.10 (the five session-reachable judgement and calibration acts), with the calibration register's provenance rules.
depends-on: REC-155.
scope: stamp the caller's principal server-side in a new column beside `measured_by` (session: its member; bearer: token:<class>), and label `measured_by` on every read as the caller's statement, never the record's attribution. RULED BOB #34 02:40Z: `measured_by` names the INSTRUMENT (a probe's or tool's name), as the caller states it, labelled as the caller's claim, never a person; WHO measured is the server-stamped principal in the new column; a reading that shows who measured shows the stamped principal, never measured_by; existing rows read "measured by: undetermined (recorded before the principal was stamped)". REC-155's provisional (all five joined ops need `contribute`) is CONFIRMED: fold both into Membership v2 §4.10 with this landing.
accepts-when: a calibration written through op=calibrate carries the server-stamped principal, and a reader sees measured_by as the caller's words (moves: attribution by free string). NEGATIVE CONTROL: drop the stamp and the principal arm fails by name.
added: 2026-09-25 · SCHEDULER #21 (id minted by REC-155's worker).

### MK-5 · queued — **AN OPINION IS NOT EVIDENCE — a case element with attribution, refused as a basis leg.** — owner RECORD; surfaces are Program B's … (whole text: the cut archive)
order: rests on MK-7's attribution act — re-pointed from MK-3, superseded 2026-09-21 (`MEMBER-KNOWLEDGE-DESIGN.md` §8) (SCHEDULER, first order audit, 2026-09-18; SCHEDULER #4, 2026-09-21)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §6 (an opinion is not evidence)
depends-on: MK-7 (it carries MK-7's attribution; §8 names MK-3's replacement (ii))
accepts-when: an opinion lands as a case element with its attribution and is refused as a leg, by name, through the ops; battery green by its COMPLETION LINE.
added: 2026-09-18 · CONDUCT #4 (from BOB #14's inbox; MEMBER-KNOWLEDGE-DESIGN.md §8, build-order items 3 and 6.)
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «MK-5» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### UI-71 · queued — **DISCOVERABLE OR HIDDEN, 4 of 4: the directory; the request button and comment; the owner's queue of open requests with grant** … (whole text: the cut archive)
order: after REC-149 and REC-150 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (REC-149's and REC-150's ICs)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 item 7.14.
depends-on: REC-149 and REC-150.
accepts-when: the harness requests, the owner grants, the requester sees `invited` and joins by the checkbox, all against the real plane; a hidden project never appears in the directory. … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (same entry, item 4).
cut: cut to its fields by SCHEDULER #10 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «UI-71» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### DIST-14 · blocked — **THE CSV SIZE BOUND (20 MiB, reused from COFF-6) IS NOT SETTLED: node measured 254.5 MiB of heap at the bound against Cloudflare's documented 128 MiB isolate (their claim), and local workerd walked a 73.6 MB body without the production cap applying.** FW-23's worker (finding 2, via CONDUCT #20 21:52Z). — owner DIST.
status: blocked — SCHEDULER #22 04:23Z: BLOCKED until DIST deploys a build carrying FW-23 (live /version 0.79.0 at 04:18Z, cut dd324152; csvCellRef and csvEntry 0 hits in its bundle); releases held by Bob; re-spawn after that deploy with DIST-14 arms in the live checks; 0 keys spent
order: after FW-24, with the measurements: the deciding figure needs a deployed plane, so it follows FW-23's landing and DIST's next deploy (SCHEDULER #19, 2026-09-24)
milestone: M2
interface: none unless the bound moves (the integrator classifies).
design: `docs/development/OFFICE-FORMATS.md` "CSV — DESIGNED 2026-09-24 by BOB #32", with `docs/development/VERIFICATION.md` (measure; do not recall; a vendor's documentation is their claim).
depends-on: FW-23.
scope: on the DEPLOYED plane, read a CSV just over 20 MiB in the scratch namespace (store=scratch named, counters witnessed before and after), record memory outcome and time in `measurements/<id>.md`; if it fails, set the bound from the measured ceiling and state it at the site. Costs 1 of 166 keys.
accepts-when: the measurement is recorded with date, instrument and the build that answered, and the bound is either confirmed or re-set from it (the measured failure it moves: a bound resting on a node heap figure and a vendor claim). NEGATIVE CONTROL: a CSV just under the bound reads clean, so a failure above it is attributable to size.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs DIST`).

### D-416 · queued — **A READING POSITION CANNOT FALL INSIDE A `sheet-range` EXTENT: `readingPositionInExtent` (`textchain.mjs`) returns false whenever the reading's arm and the extent's differ, so a cell reading never earns the connection its range should.** The image-rect and `doc-table` halves wait on readings that carry rects and paragraph spans (D-352). — owner FRAMEWORK.
order: after D-415, which emits the units it reads (SCHEDULER #17, 2026-09-23, LED-7 S17-3; verified at the code on `02603e88`)
milestone: M4
interface: none — the containment predicate.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2.
depends-on: D-415.
scope: the `sheet-range` half: a cell reading inside a range is contained. Extend the textchain suite.
accepts-when: a cell reading inside a sheet-range earns a connection. NEGATIVE CONTROL: restore the arm-mismatch false, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-3; keeps its `D-` id).

### D-246 · queued — **A RENDERING'S FILE HASH IS RUNTIME-DEPENDENT, AND DEC-41 ASKS FOR A HASH ANY COPY CAN CHECK.** BOB #32's ruling of 2026-09-23 23:30Z (cite until folded): *BOTH, LABELLED: `published_shas` carries the PIXEL hash (`pixels_sha256`, identical across node, workerd and Pillow) as the verifying value; the file hash is recorded beside it as "this file's bytes", for information only.* — owner CONTENT-PDF, then RECORD.
order: with the M2 extraction rows, after D-419 (SCHEDULER #17, 2026-09-23, LED-7 S17-4)
milestone: M2
interface: I3/I5 — `published_shas` for renderings; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.4 (the crop), with DEC-41 and BOB #32's ruling of 2026-09-23 23:30Z (cite until folded).
depends-on: D-419 (renderings reach the plane).
scope: when renderings join `published_shas`, the verifying value is `pixels_sha256`, the file hash beside it labelled; `imagecrop.mjs` already emits both.
accepts-when: a rendering published from workerd verifies against a Pillow-computed pixel hash. NEGATIVE CONTROL: verify by the file hash, and the cross-runtime arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (LED-7 S17-4; keeps its `D-` id).

### D-594 · queued — **`bio-plane/test/delegations.control.mjs` ARM A6 (~265) READS TODAY'S LOCAL DATE IN THE DRIVER AND COMPARES IT WITH THE DATE ITS CHILD `plancheck` READS FOR ITSELF (the cohort regex ~287), so the control fails on a correct tool across local midnight.** Found by M0-147's worker's class sweep (03:15Z). Latent; control driver only. — owner M0.
order: after M0-172, with the control-driver rows behind the product rows: no gate verdict is false today, it only reddens a control run that straddles midnight (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md`, the instant-independence rule M0-184's landing folds (BOB #35 03:25Z; the instant-dependent class D-231, D-487, M0-147).
depends-on: none.
scope: read the date ONCE in the driver and hand it to the child (a `--today` flag on plancheck), or accept iso or iso+1 in the cohort regex; prefer the flag.
accepts-when: under M0-147's clockpin at 23:59:59.999 local, A6 stays green across the straddle (moves: a midnight false red). NEGATIVE CONTROL: restore the driver's own date read under the pin and A6 fails by name.
added: 2026-09-25 · SCHEDULER #22 (id minted by M0-147's worker).

### D-600 · queued — **`bio-plane/test/nc-cap12.mjs` ARM `dropslides` NEVER ARMS (its patch matches 0 times, on origin/main too): its anchor `slides: sl ? slideExtents(sl) : null,` in `index.mjs` now reads `slides: sl || deckLen ? slideExtents(sl || []) : null,`, so capture-container-extent's slides control refutes nothing.** Found by D-535's worker (03:16Z). The control fails loudly (ARMED NO), so no gate result is wrong today. — owner M0.
order: after D-594, with the control-driver rows behind the product rows: a control that cannot arm is loud, not false (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative control: break the subject, watch the suite fail at a NAMED assertion).
depends-on: none.
scope: re-anchor `dropslides` on the current line (prefer an anchor keyed on `slideExtents(` so the next rewording is caught), re-run nc-cap12, and record the result on capture-container-extent's NEGATIVE CONTROL line.
accepts-when: nc-cap12 reports `dropslides` ARMED and the slides arm fails by name (moves: 1 arm that never armed). NEGATIVE CONTROL: the re-anchored patch itself; revert the anchor and the driver reports ARMED NO again.
added: 2026-09-25 · SCHEDULER #22 (id minted by D-535's worker).

### D-666 · queued — **`bio-plane/test/rec168-capturerequest-principal.control.mjs`'s ARMS drop-gate, gate-sessions-only AND gate-credentials-only DO NOT ARM: their anchor matches 2 sites (since D-85), so the capture-request principal gate's controls refute nothing.** Found by CONDUCT #22 at batch29's union (06:28Z); the union re-anchored the no-stamp arm onto REC-147's RUN_PRODUCTION_ACTIONS literal. M0-197 (running) may have minted the same drift; if so, close this as its duplicate. — owner M0.
order: after D-600, with the control-driver rows: a control that cannot arm is loud, not false (SCHEDULER #22, 2026-09-25)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative control: break the subject, watch the suite fail at a NAMED assertion).
depends-on: none.
scope: give the three arms a single-site anchor each; re-run the driver AS DECLARED and record it on the suite's NEGATIVE CONTROL line.
accepts-when: all three arms report ARMED and fail by name (moves: 3 arms that never armed). NEGATIVE CONTROL: the arms themselves.
added: 2026-09-25 · SCHEDULER #22 (`node tools/mintid.mjs D`; CONDUCT #22's union finding).

### M0-174 · queued — **`mintid`'s `D` NAMESPACE STILL GRADES DUPLICATES ACROSS TWO SHAPES AS ONE: since DEBT's retirement (M0-140) a `D-` is minted as a PLAN ROW, so its allocation site is the heading `### D-n ·`; the DEBT-table rows `| D-n |` are LEGACY allocations frozen at D-443. A heading and a legacy row for one id (M-57's 17 pairs) are the item and the row it closed, never a duplicate.** BOB #33 RULED, 2026-09-24 17:35Z (drained to `BOB-INBOX-drained.md`; cite until folded). — owner M0.
order: low in the M0 group, beside M0-172: small; fold into an open M0 batch if one fits (BOB #33, 17:35Z; SCHEDULER #19)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument reads the forms the ledger actually uses), with BOB #33's ruling of 17:35Z (cite until folded).
depends-on: M0-140.
scope: `mintid`'s allocation site for `D` is the plan-row heading in QUEUE, BACKLOG and their archives; the legacy table rows count toward the floor only; the duplicate check grades EACH shape within itself.
accepts-when: two `### D-n ·` headings are refused; the 17 cross-shape pairs pass; the floor reads 508 on coord f3ca0ad8. NEGATIVE CONTROL: collapse the two patterns into one, and the arm counting 120 false duplicates fails by name.
added: 2026-09-24 · SCHEDULER #19 (BOB #33 inbox 17:35Z; `node tools/mintid.mjs M0`).

### M0-184 · queued — **`VERIFICATION.md` IS 24,569 B AGAINST ITS 24,576 B BUDGET (readbudget's CUT set), so it cannot absorb a new rule: M0-166's section cannot land.** Found by M0-173's worker (C). — owner M0.
order: directly before M0-166, which it unblocks (SCHEDULER #19, 2026-09-24; via CONDUCT #20 19:16Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the reading budget), with `docs/archive/` as the home for finished provenance.
depends-on: none.
scope: move the D-263 PROVENANCE block (~2.4 KB, marked at both ends) to `docs/archive/`, and move `bio-plane/test/register-grammar.test.mjs`'s pin to the archived copy in the same landing. ALSO (M0-169's design gap, via CONDUCT #20 19:37Z): one sentence in "The battery runs every suite"'s Incomplete sections — a fixture's carry-list is DERIVED, once (`moduleclosure.mjs`, `gatedeps.mjs`). ALSO (BOB #35 03:25Z, M0-147's gap): beside M0-169's sentence, the instant-independence rule verbatim from the drained entry ("A suite's verdict must not depend on the instant it starts ... never a flake."). ALSO (BOB #35 04:25Z): D-485's R4 arm, written from D-485's report in the DEC-49 section, in as few lines as state it.
accepts-when: VERIFICATION.md reads ≥ 2 KB under budget and register-grammar stays green (the measured failure it moves: 7 B of headroom). NEGATIVE CONTROL: point the pin back at VERIFICATION.md and register-grammar fails by name. And `grep -c "instant it starts" docs/development/VERIFICATION.md` reads 1. And DEC-49's section names R4.
added: 2026-09-24 · SCHEDULER #19 (`node tools/mintid.mjs M0`).

### M0-166 · queued — **`VERIFICATION.md` HAS NO PROSE ON HOW THE GATE CLASSIFIES A DIFF OR SELECTS UNITS: the rule lives only in `gates.mjs`'s header comments, and M0-116, M0-143 and M0-153 each had to rediscover it.** Found by M0-153's worker. — owner M0 (the document's owner).
order: after M0-165, the same subject; prose, small (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:33Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (this row adds its missing section).
depends-on: M0-153, M0-184.
scope: a VERIFICATION.md section stating the classes, the reader derivation (comment-blanked), the doc-facing rule and its edge rule, citing `gates.mjs` sections, with front matter moved. ALSO (M0-154's F3): beside the D-93 sentence, \"a fixture DERIVES what it must carry from its subject's own imports, never a copy kept by hand (M0-154, `bio-plane/test/gatedeps.mjs`)\".
accepts-when: the section is on `main` and `corpuscheck` reads 0 fail. NEGATIVE CONTROL: none (prose).
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-168 · queued — **`control-register.mjs` `declarationAt` ENDS A DECLARATION AT ANY LINE CONTAINING THE MARKER PHRASE, so a mere citation truncates it and LOWERS the recorded arms count (measured: coverage --strict 2093 → 2081).** Found by M0-157's worker. — owner M0.
order: after M0-166 and AHEAD of M0-167: a register that under-counts is a false floor (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:36Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: none.
scope: break only where `markerPositions` says a marker BEGINS (the phrase followed by one of MARKER_SEPARATORS); re-read the coverage floor from the print. ALSO (REC-199's worker, via CONDUCT #20 21:43Z): `declarationAt` ends a declaration at the first blank line whose next paragraph does not open with an ordinal; measured reviewcopy.test.mjs credited 5 arms of 14 + baseline (`arms: 5, lines: 38`, main and branch), REC-133's and REC-198's arms never counted. Cross a blank line when ANY later paragraph of the same comment opens a list item; reviewcopy 5 -> 15 is its negative control; re-read REGISTER_FLOOR from the print. ALSO (M0-176 F3, CONDUCT #20 22:40Z): only a suite's FIRST `NEGATIVE CONTROL:` block is read, so `gates.test.mjs`'s later blocks go uncounted; count every block.
accepts-when: coverage --strict counts the full arms again, later blocks included. NEGATIVE CONTROL: a citation mid-declaration does not truncate it, and a real second marker still ends it — each arm by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-167 · queued — **`gates.control.mjs` NEVER ASSERTS THE ABSENCE OF UNDECLARED FAILURES: an arm measuring more than its subject is described, not caught — G2 fails 29 where 3 are declared, G17 fails 11 where 5 are.** Found by M0-157's worker. — owner M0.
order: after M0-166, with the gate instruments (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:36Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` "The negative-control register" (break only the thing).
depends-on: M0-157.
scope: enumerate each arm's true failure set, then adopt nc-rec111.mjs's subset check (s.failed ⊆ mustBreak ∪ alsoBreak ∪ a per-arm alsoExpected).
accepts-when: every arm's failures are declared and the check passes. NEGATIVE CONTROL: widen one arm's break and the subset check names the undeclared failure.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-162 · queued — **M0-99's DELEGATION BLOCK STAYS OPEN ON THREE STALE SENTENCES: `kickoffs/DIST.md` lesson 20, `kickoffs/SKILL.md`'s "Design sources" list, and FLEET-NEXT's "Carried memory" ("Regenerate docs/DECIDED.md; never merge it") still describe DECIDED.md as it was.** M0-158's one residue; the candidate words are written in the block on coord `CLAIMS.md`. — owner M0.
order: after M0-160, small: the last open item of a closed contradiction sweep (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:19Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a sentence other sessions read is a claim to keep true).
depends-on: M0-158.
scope: apply the block's candidate words to the three sentences (FLEET-NEXT on coord, the kickoffs on main); close M0-99's block.
accepts-when: the block reads closed and none of the three sentences says to regenerate or merge DECIDED.md. NEGATIVE CONTROL: none (prose).
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-163 · queued — **`tools/delegations.mjs` HAS NO GRAMMAR FOR A PER-ITEM CLOSURE: `**Items <range> CLOSED <date>**` reads as neither affirm nor discharge, which produced three of M0-158's five contradictions.** Found by M0-158's worker. — owner M0.
order: after M0-162, the same register (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:19Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument reads the forms the ledger actually uses).
depends-on: none.
scope: recognise the per-item closure form; plancheck §8's warning names a block whose per-item closures cover every item.
accepts-when: a block closed item by item reads closed. NEGATIVE CONTROL: drop the form from the grammar and that block reads open, by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-149 · queued — **A PUBLISHED `limit` HAS ONE GUARD: only `bounds.test` checks it; `meaning-bounds` grades the row source, not whether an op in the BOUNDED roster publishes its bound.** Found by D-479's worker. — owner M0.
order: after M0-142, the same suite (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the negative-control register).
depends-on: land/conduct/c20-batch11fix on `main` (it rewrites meaning-bounds' segmenter).
scope: a meaning-bounds arm asserting every op in the BOUNDED roster publishes a non-empty `bound`.
accepts-when: the arm lists the roster and passes. NEGATIVE CONTROL: drop the directory's published bound and the arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-150 · queued — **AN OP LEAVING THE BARE ROSTER INTO THE UNJUDGED BUCKET IS INVISIBLE TO THE FLOOR, which counts only what it still sees: `op=caseratify` was lost that way on `main`, found only by c20-batch11fix's RETURN-DELEGATE rule.** — owner M0.
order: after M0-149, the same suite; the class behind a silent loss (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z) MOVED 2026-09-24 ~17:30Z by SCHEDULER #19 behind the product rows, to the head of the M0 group after M0-139: the lane's law (CLAUDE.md §2, Bob 2026-09-22) puts a process row that neither cuts gate time nor unblocks product behind the product rows.
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a floor that cannot see a departure is not a floor).
depends-on: land/conduct/c20-batch11fix on `main`.
scope: an arm asserting every op the walk files is in exactly one judged bucket, or a ratchet on the UNJUDGED bucket's size.
accepts-when: the walk's buckets partition its ops. NEGATIVE CONTROL: hide one op's body behind an unfollowed delegate and the arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).
