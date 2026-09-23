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

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 12 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### REC-179 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: directly after REC-178: an attribution the record states falsely is authority-class (SCHEDULER.md step 3), and the rule-2 surfacing row REC-171 writes would then contradict the bundle it describes (SCHEDULER #16, 2026-09-23; DEBT D-121's defect row, placed by LED-7 batch S16-2)
milestone: M7
interface: I3 — a new refusal on `op=promote`; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, rule 2's reach (the SURFACING ACT is what `surfaced_by` records, decided at the trust boundary), with the D-78 restamp's own stated intent that a revision carries the value forward.
depends-on: none. A replay under §11 item 5's migration paragraph (REC-173) is stated by the builder; anything it does not cover goes to BOB before building.
scope: promote refuses a revision whose `surfaced_by` differs from the current version's by a new refusal code with its canned translation, before any write.
accepts-when: through the op, a revision flipping `agent` to `human`, and one flipping `human` to `agent`, are each refused by name with the bundle byte-identical after; a revision keeping the value lands. NEGATIVE CONTROL: drop the comparison, and the flip arm lands and fails by name.
added: 2026-09-23 · SCHEDULER #16 (DEBT D-121, the defect row of the two sharing that id, verified at the code; `node tools/mintid.mjs REC`).

### REC-177 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: directly after REC-172 (in the cache) as BOB #30 placed it, the same bound fence; below the record-integrity rows REC-175 and REC-176 (SCHEDULER #15, 2026-09-23; BOB #30's inbox entry)
milestone: M9
interface: I3 — a new refusal on `op=airunopen`; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §14b item 6, *"A declared bound STATES its allowance"* (BOB #30, 2026-09-23; on `main` since `aaf19287`, landed by train `0e7cc03e`).
depends-on: REC-172 (done, `0e7cc03e`).
accepts-when: as the paragraph states it, with its NEGATIVE CONTROL.
added: 2026-09-23 · SCHEDULER #15 (BOB #30's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### D-440 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: with the claims the record cannot support, after D-57 and above D-390: a content row naming bytes its document does not hold, minted silently, CLAUDE.md §2's class; D-420 directly after it, the same function (BOB #24: *"one worker can take both"*) (SCHEDULER #9, 2026-09-21)
milestone: M4
interface: I3 — a new refusal on the image arm; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2 (*"`{part}` is a member of a CONTAINER's own bytes, and nothing else"*, which names this fence) and §3.4, with `docs/development/CLIENT-RENDERED.md` "DESIGNED 2026-09-21" (an image served beside a page is its own document).
depends-on: none.
scope: the row's named fix: `contentContextFor` tells the checker whether the capture is an office container, from its content type; the image arm refuses a `{part}` on any other capture BY NAME, saying an image served beside a page is its own document to acquire and cite whole; an office capture with no persisted image list keeps its undetermined admission, stated.
accepts-when: a `{part}` on an HTML capture is refused by name, pointing at acquiring the image; a container capture still mints; an office capture with no persisted list is admitted as undetermined, stated. How a liar passes it: refusing every `{part}`, so the container arm must mint. NEGATIVE CONTROL: remove the refusal, and the HTML arm fails by name.
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry, drained this commit; D-440's DEBT row; keeps its `D-` id).

uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-440» on entering the cache; re-read on `0e7cc03e`: still open.

### D-82 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: MOVED UP 2026-09-23 by SCHEDULER #16 to directly after UI-73, with it: paths disjoint from `store.mjs`, `index.mjs` and `bio-checks.mjs` (`civicos-ui` only), which CONDUCT caps at 5 concurrent, so it fills a non-store slot under continuous spawning (BOB #30). Its own reason stands: after UI-73, the same member-surface class: a member reads a machine's question as a colleague's judgement, which §P's accountability rule exists to prevent; a gap over built stamping, so below the refusal words already shipping wrong (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M8
interface: I3 consumer (`surfaced_by`, stamped since D-78).
design: `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §"P · PROPOSAL", its accountability rule — *"what a member needs to know is that nobody has yet judged it worth asking"* — with `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 8.
depends-on: none — D-78's stamp is built.
scope: wherever an inquiry is listed or shown — the focus list, the review queue, beside a project — one marker for `surfaced_by: agent`, from one helper, saying nobody has yet judged it worth asking. It discounts nothing and hides nothing; a member's inquiry renders as today.
accepts-when: against the real plane, an inquiry a machine credential created shows the marker on every surface listing it, and one a member created shows none. How a liar passes it: marking by title or author text, so the fixture's two inquiries share both. NEGATIVE CONTROL: neuter the helper, and the agent-inquiry arm fails by name.
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-82's DEBT row of 2026-07-30, verified at the code; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-82» on entering the cache; its `order:` line is the current one.

### D-420 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: directly after D-440, the same function and one worker for both (BOB #24): a KIND overclaim the crop already catches, so below D-440's silent mint (SCHEDULER #9, 2026-09-21, LED-7 batch S9-1)
milestone: M4
interface: I1 (a PDF reading's container extent gains its images) and I3 (a new refusal); the integrator mints and classifies the ICs.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2 (the `image` reference's `{page, rect}` form; `covers` refuses from the container's own extent, by name) and §3.3 item 2 (a PDF's image objects and their painted rectangles, CPDF-18).
depends-on: none — CPDF-18's `structure().images` is built.
scope: the row's named fix: acquire persists `structure().images` as `container_extent.images` for a PDF (absent for a capture acquired before, stated as CAP-12 states an empty level), and `coversImage` gains the page-form branch: refuse a rect that no persisted placement equals, and ADMIT when the list is absent.
accepts-when: a rect where the page paints no image is refused by name at the mint; a rect equal to a persisted placement mints; a PDF acquired before the change is admitted with its absence stated. How a liar passes it: a tolerance so wide any rect matches, so the no-image arm uses a rect far from every placement. NEGATIVE CONTROL: drop the page-form branch, and the no-image arm fails by name.
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry; LED-7 batch S9-1; D-420's DEBT row of 2026-09-18; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-420» on entering the cache; its `order:` line is the current one.

### M0-138 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: FIRST of the backlog, as BOB #31 placed it: every train pays this merge tax; a process row admitted because it cuts gate and merge time (Bob, 2026-09-22) (SCHEDULER #16, 2026-09-23; BOB #31's inbox entry, drained this commit)
milestone: M0
interface: none
design: BOB #31's ruling of 2026-09-23 (the BOB INBOX entry drained to `docs/archive/ledgers/BOB-INBOX-drained.md`; BOB folds it into `docs/architecture/BIO_System_Design.md` §3's front matter), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none.
scope: `renderCell` renders each claim's FIRST SENTENCE (to the first `. ` outside backticks); the whole text stays in `construct-status.json`, served by `node tools/status.mjs <n>`; the design pointer stays verbatim; the 5 trimmed attributions are restored; the 48 KiB budget does not move.
accepts-when: `status.test.mjs`, `statussweep.test.mjs`, `corpuscheck.test.mjs` and `readbudget.test.mjs` green; `node tools/status.mjs --check` shows 0 drift after `--write`; the map is under budget. NEGATIVE CONTROL (`status.control.mjs`, a new arm): render whole texts again, and the budget check FAILs naming the map.
added: 2026-09-23 · SCHEDULER #16 (BOB #31's inbox entry, drained this commit; `node tools/mintid.mjs M0`).

### REC-180 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: first of the backlog: a write the record keeps after refusing the act is CLAUDE.md §2's worst class, and it corrects the site REC-176 just fixed (SCHEDULER #16, 2026-09-23; REC-176's worker via CONDUCT #16)
milestone: M6
interface: none expected (a refused act writes nothing); the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` (the Mechanical Verification Law: the record holds only what an act that landed wrote), with REC-126's `Store.#ROLLBACK` sentinel (`#reviewGates`) as the pattern.
depends-on: REC-176 (the same callback; on `land/conduct/c16-batch6`).
scope: (1) an `ok: false` returned from `promote`'s callback throws `Store.#ROLLBACK` carrying the refusal, and the outer catch returns it, so nothing written before it survives; then a sweep of `promote` for any other late refusal, each listed. (2) `bias.test.mjs` ARM M asserts `op=image` returns null for every id in the refused set.
accepts-when: in a NEW suite `bio-plane/test/rec180-promote-rollback.test.mjs`, through the op: a project creation refused `NAME_TAKEN` after the mint leaves the sequence and `minted_ids` byte-identical; `bias.test.mjs` ARM M green reading `op=image`. NEGATIVE CONTROL (`rec180-promote-rollback.control.mjs`): return the refusal instead of throwing, and the mint arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (REC-176's worker's two findings via CONDUCT #16, verified at the code; `node tools/mintid.mjs REC`).

### REC-181 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: directly after REC-180, the same `promote` callback: a retired item still resting under live legs is the record claiming what §4.1 forbids (CLAUDE.md §2), and D-168 just made a retired item uncitable, so the bypass is a correction to just-landed work (SCHEDULER #16, 2026-09-23; D-168's worker via CONDUCT #16)
milestone: M9
interface: I3 — a new refusal on `op=promote` (`CITED`, as `op=retire` answers it); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (a retired item is NOT citable; retirement is refused while live legs cite it, BOB #30), with `op=retire`'s `CITED` refusal as the one predicate.
depends-on: REC-176, REC-178, D-168 (the same `promote` site; on `land/conduct/c16-batch6`).
scope: when `promote` moves an Information item INTO `retired`, it runs `retire`'s own `#restsOnLive` / `#citesInto` check and refuses `CITED` with the same offenders, before any write; or the builder routes that transition only through `op=retire`, stating which.
accepts-when: in a NEW suite `bio-plane/test/rec-181-promote-retire.test.mjs`, through the op: a promote retiring a cited verified item is refused `CITED` with the bundle byte-identical after; an uncited one retires. NEGATIVE CONTROL (`rec-181-promote-retire.control.mjs`): skip the check, and the cited arm lands and fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-168's worker's finding via CONDUCT #16, verified at the code; `node tools/mintid.mjs REC`).

### D-390 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: after D-57: a read that must say WHICH absence is true fails outright on the first instance past ~100 content captures; below D-389, REC-160 and D-57 because it fails LOUDLY rather than claiming what the record cannot support (SCHEDULER #8, 2026-09-21, LED-7 S8-1 and S8-2)
milestone: M3
interface: none — the answer's shape does not move; the integrator classifies.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §5 (the frontier is a view over the log) and §6 (the readers), with D-36's measured ceiling (`node tools/ledger.mjs find D-36`).
depends-on: none. **Sequence after D-389** (the same method's page cut, `store.mjs` `#frontierContent`).
scope: chunk the subject list at 64, each chunk's rows merged into the one `indexState` map; a fixture of 200+ subjects driven through `op=frontier&level=content`; then SWEEP every `IN` list built from a `limit`-bounded page, `#frontierMeaning` first, chunking each or stating its bound, every site listed with its verdict. **FULL GATE PROFILE**.
accepts-when: a 200-subject page answers every row's index state, equal to the same rows read one chunk at a time; the sweep's list is in the landing. How a liar passes it: a fixture under 100 subjects, which never meets the ceiling, so its count is asserted above it. NEGATIVE CONTROL: restore the single unchunked `IN`, and the 200-subject arm fails by name.
added: 2026-09-21 · SCHEDULER #8 (LED-7 batch S8-1; D-390's DEBT row of 2026-09-16, verified at the code; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-390» on entering the cache; its `order:` line is the current one.

### D-60 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: after D-390, above CAP-14: M1's monitoring is noise on the class of page Oakland publishes on; below the claims the record cannot support because the design grades a change reported that did not happen as the cheaper error (DOCUMENT-PROFILES.md, "Three digests") (SCHEDULER #8, 2026-09-21, LED-7 S8-3)
milestone: M1
interface: I3 — `op=monitor` names the comparison it made; the integrator mints and classifies the IC.
design: `docs/development/DOCUMENT-PROFILES.md` §"Three digests, not one" — *evidentiary … answers "has the substance changed?", which is what monitoring asks* — with `BIO_Content_Framework_v0_10.md` §5.
depends-on: none — FW-4's digests are built.
scope: monitoring compares the EVIDENTIARY digest when the baseline recorded one as determined and the fetched bytes normalise under the same handler with certainty, through acquire's one function; otherwise raw, and the answer says which. Substance unchanged writes no `modified` and raises no flag. `resolveLinks`' bracket is NOT in scope: D-59 measures it first.
accepts-when: two fetches differing only in `__VIEWSTATE` read `unchanged`, compared evidentiary, with no flag raised; a real text change reads `modified`; a baseline with no determined digest compares raw and says so. How a liar passes it: normalising everything, so the real-change arm must read `modified`. NEGATIVE CONTROL: compare raw again, and the viewstate arm fails by name.
added: 2026-09-21 · SCHEDULER #8 (LED-7 S8-3; D-60's DEBT row, traced at the code; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-60» on entering the cache; its `order:` line is the current one.

### D-169 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: after D-65, first of the silent record defects on built paths: the record holds a bundle its own catalogue rejects, CLAUDE.md §2's class; D-171 and D-179 follow, the honesty batch BOB #26 placed together (SCHEDULER #12, 2026-09-22, LED-7)
milestone: M7
interface: none expected — the bytes gain the line C-2.8 already requires; the integrator classifies.
design: `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §"J · JUSTIFIED TRANSITION" (*disposition of a focus to deferred or dismissed, which C-2.8 requires a reason for*).
depends-on: none — `Store.#setOrAddScalar` is built (the conclude path uses it).
scope: `dispose` writes the reason with `#setOrAddScalar`; a suite arm creates an inquiry through intake, disposes it, and runs the catalogue over the result.
accepts-when: an intake-created inquiry, deferred and dismissed, passes C-2.8 with its reason in the bytes; a member-created one disposes byte-identically to today. How a liar passes it: a hand-built fixture already carrying the line, which never meets `mdFor`, so the arm creates it through intake. NEGATIVE CONTROL: restore `#setScalar` at the site, and the intake arm fails by name at C-2.8.
added: 2026-09-22 · SCHEDULER #12 (LED-7; D-169's DEBT row of 2026-08-03, verified at the code; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-169» on entering the cache; its `order:` line is the current one.

### D-171 · integrated — finished; its branch is on a pushed batch (c17-batch2 @ f8b7124e) waiting for its train — flipped integrated by SCHEDULER #16 under Bob's 20:59Z direction (it holds no cache slot; done only when its sha is on origin/main)
order: directly after D-169, the same honesty batch (its DEBT row: beside D-169); a wrong writer needs two manifest entries sharing one `created`, so it follows the defect every intake disposal meets (SCHEDULER #12, 2026-09-22, LED-7)
milestone: M7
interface: none — the answer's shape does not move; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §6 (I-20, mechanical-writer conformance, C-20.1), with REC-32's `rowid DESC` at its site as the precedent.
depends-on: none.
scope: `#revisionKind` orders by `created DESC, rowid DESC`, as REC-32's derivation does, and the two sites say they agree.
accepts-when: two manifest entries sharing `created`, the later written with the lexically smaller `snap_key`, read the LATER one's writer. How a liar passes it: a fixture whose later write also has the larger key, which never tells the orders apart, so the arm's keys run against write order. NEGATIVE CONTROL: restore `snap_key DESC`, and that arm fails by name.
added: 2026-09-22 · SCHEDULER #12 (LED-7; D-171's DEBT row of 2026-08-04, verified at the code; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-171» on entering the cache; its `order:` line is the current one.

### D-179 · running — SPAWNED 2026-09-23 20:53Z by CONDUCT #17 from the BACKLOG as a cloud worker (session 'WORKER <ID> (CONDUCT #17)'), under BOB #31's 20:51Z ruling; recorded here by SCHEDULER #16 so no refill places it twice. A worker finds this row with ledger.mjs find.
order: directly after D-171, beside D-169 and D-171 as BOB #26 placed it: a silent move of the record's provenance row, CLAUDE.md §2's class (SCHEDULER #12, 2026-09-22; BOB #26's inbox entry, item 1)
milestone: M7
interface: I3 — `op=promote` refuses what it accepted; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (one capture, one home, the original's; BOB #26, 2026-09-22).
depends-on: none — C-53.8's fence is built.
accepts-when: held bytes promoted under a second bundle are refused and the first bundle's register row is byte-identical after; a revision re-registering its own bytes lands; a caller who … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #12 (BOB #26's inbox entry, item 1, drained this commit; D-179's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-179» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-128 · running — SPAWNED 2026-09-23 20:53Z by CONDUCT #17 from the BACKLOG as a cloud worker (session 'WORKER <ID> (CONDUCT #17)'), under BOB #31's 20:51Z ruling; recorded here by SCHEDULER #16 so no refill places it twice. A worker finds this row with ledger.mjs find.
order: a correction to built work, directly after the honesty batch (D-169, D-171, D-179): the record keeping less than it held, silently, CLAUDE.md §2's class; BOB #27: *"a correction to built work: `op=progressiondefine` overwrites today"* (SCHEDULER #14, 2026-09-22; BOB #27's inbox entry, item 3)
milestone: M4
interface: I3 and I5 — a definition's versions, and the version an instance read and a finding name; the … (whole text: the cut archive)
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions" (BOB #27, 2026-09-22).
depends-on: none — progressions and their two findings are built (`node tools/status.mjs progression`).
accepts-when: a revised definition leaves the prior version readable with its basis, and an instance read or a finding names the version it was read against. How a liar passes it: a history … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #14 (BOB #27's inbox entry, item 3, drained this commit; D-128's DEBT row of 2026-08-01; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-128» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-54 · integrated — finished; land/worker/D-54 @ 418b2620 integrated on land/conduct/c17-batch3 @ 772429dc, waiting for its train — flipped by SCHEDULER #16
order: with the product rows, after CAP-14: a preventive M7 configuration nothing reads wrong today; D-107, beside which it stood, is DIST's deploy tooling and moved behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*) (SCHEDULER #12; placed by SCHEDULER #7, 2026-09-21, LED-7)
milestone: M7
interface: I4 — the plane's deploy configuration; the integrator classifies it.
design: `docs/architecture/BIO_Distribution_v0_1.md` §6, the deploy-to-serve ladder (every rung read back) … (whole text: the cut archive)
depends-on: none.
accepts-when: the deployed script's settings carry the explicit value, read back after the deploy. How a liar passes it: a value equal to today's default with no reason, so the site cites what the plane needs.
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-54's DEBT row of 2026-07-29, NARROWED at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-54» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-311 · running — SPAWNED 2026-09-23 20:53Z by CONDUCT #17 from the BACKLOG as a cloud worker (session 'WORKER <ID> (CONDUCT #17)'), under BOB #31's 20:51Z ruling; recorded here by SCHEDULER #16 so no refill places it twice. A worker finds this row with ledger.mjs find.
order: after REC-158, with the plane's who-may-do-what: an act OFFERED that the store refuses is an overclaim in the pre-flight; the roster half costs narration only (no surface renders one off it) (SCHEDULER #6, 2026-09-21, LED-7 batch 14)
milestone: M8
interface: I3 — an addition to the published act set and a narrowing for machine credentials; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Interaction_Constructs_v0_1.md` … (whole text: the cut archive)
depends-on: none — D-310's pattern (IC-75) is built.
accepts-when: each roster act is offered exactly where its store act succeeds, pair by pair; a machine credential is offered nothing its class is refused. How a liar passes it: reusing … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 14; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-311» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-125 · running — SPAWNED 2026-09-23 20:53Z by CONDUCT #17 from the BACKLOG as a cloud worker (session 'WORKER <ID> (CONDUCT #17)'), under BOB #31's 20:51Z ruling; recorded here by SCHEDULER #16 so no refill places it twice. A worker finds this row with ledger.mjs find.
order: last of the M8 corrections, after D-82: DEC-10's ruled act is missing rather than anything claimed falsely, so below the rows that correct what a member is told (SCHEDULER #12, 2026-09-22; BOB #26's inbox entry, item 2)
milestone: M8
interface: I5 and I3 — a derived table and `op=queuemute`'s item form; the integrator mints and classifies the ICs.
design: `docs/development/NOTIFICATIONS.md` "MARKED AS HANDLED" (BOB #26, 2026-09-22), DEC-10's (b) and (c).
depends-on: none — REC-21's per-case mute is built.
accepts-when: A's item mute of finding F puts F in A's `suppressed` while B's feed and `op=proposals` still carry it and no disposition row exists; A's case mute of `overdue_successor` … (whole text: the cut archive)
widened: 2026-09-23 by SCHEDULER #14 on BOB #29's ruling (D-170 folded in): A's item mute of a `governor-holding-host` item puts it in A's `suppressed` while B's feed still carries it and nothing is written; a case-less per-KIND condition mute and any OBLIGATION mute are still refused (`NOTIFICATIONS.md` "MARKED AS HANDLED").
added: 2026-09-22 · SCHEDULER #12 (BOB #26's inbox entry, item 2, drained this commit; D-125's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-125» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-278 · running — SPAWNED 2026-09-23 20:53Z by CONDUCT #17 from the BACKLOG as a cloud worker (session 'WORKER <ID> (CONDUCT #17)'), under BOB #31's 20:51Z ruling; recorded here by SCHEDULER #16 so no refill places it twice. A worker finds this row with ledger.mjs find.
order: after D-125 and before COFF-13, with the refusal class (UI-73, REC-159, REC-162): every site's `error` is TRUE today, so it follows the rows correcting what a member is told falsely; above COFF-13 because group (4) meets every copy installed without storage (SCHEDULER #13, 2026-09-22; BOB #26's inbox entry, item 1)
milestone: M9
interface: I3 — the reasons join the vocabulary, `error` kept beside each; the integrator mints and classifies the IC.
design: DEC-49 as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it (every condition … (whole text: the cut archive)
depends-on: none — D-270's pattern and C-61.1's `requiredArgument` are built.
accepts-when: each site answers its `reason`, check and translation with `error` unchanged; `queueAbsent` still tells an older plane apart; `preauth-vocabulary.test.mjs` stays green … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (BOB #26's inbox entry, item 1; D-278's DEBT row of 2026-08-09; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-278» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-219 · integrated — finished; land/worker/D-219 @ d428bcaf integrated on land/conduct/c17-batch3, waiting for its train — flipped by SCHEDULER #16
order: directly before D-423, one worker for both (the same `schema.mjs` comments): the record describing its own contents more weakly than they are, a correction to built work, below D-278 because the grade itself is right (SCHEDULER #15, 2026-09-23, LED-7; BOB #30's ruling)
milestone: M8
interface: I3 — the method string on NEW grade-D resolutions; the integrator classifies it.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.1, *"Grade D's label — CORRECTED 2026-09-23 by BOB #30"* (landed at `4355bfda`).
depends-on: none — its design is on `main` (`4355bfda`).
scope: the method string and the two `schema.mjs` comments follow §8.1's wording (no semicolon or backtick inside a `--` comment); rows already written keep theirs (D-256's shape), stated in the landing; a sweep for other "no basis" meaning "no captured basis".
accepts-when: a new grade-D resolution's stored method reads the new wording through the op; an older row is byte-identical. NEGATIVE CONTROL: restore the old string, and the wording arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (LED-7; D-219's DEBT row of 2026-08-06; keeps its `D-` id).

### CAP-14 · running — SPAWNED 2026-09-23 ~21:08Z by CONDUCT #17 as a SEPARATE CLOUD SESSION titled WORKER CAP-14 (CONDUCT #17); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/CAP-14 and that session; never conclude queued from the absence alone.
order: after D-389 and behind CAP-13, the same reuse machinery and files, one worker at a time; below CAP-13 because it adds provenance the record omits rather than correcting a figure it overstates (SCHEDULER #6, 2026-09-21; the D-339 worker's item 3, ruled)
milestone: M2
interface: I5 and I1 — a derived column and an additive manifest field; the integrator mints and classifies the ICs.
design: `docs/development/CAPTURE-SCALING.md` §Job one, *"RULED 2026-09-21 by BOB #21 … a reused part names the capture it came from"*, which carries the build, with `BIO_Intake_Doctrine_v1_1.md` §2.
depends-on: none. Sequence after CAP-13 (same files).
scope: as the ruling builds it: `site_assets.last_fetched_by`, the primary capture sha whose fetch set `last_fetched`, written beside it on every FETCHED observation and never moved by a reuse (through the reshape pass, before schema application); each reused part carries it as `reused_from`; the reusing capture's `site_asset_refs` row keeps it, taken from the observation itself; `reusedParts` reads that row, never `site_assets`.
accepts-when: a reused part names the capture whose fetch served it, and a later fetch moving `site_assets` does not change what an earlier reuse names; a reuse recorded before the build reads UNDETERMINED as to its source, never inferred from timestamps. How a liar passes it: reading `site_assets` at report time, so the arm fetches again and asserts the earlier reuse still names the old capture. NEGATIVE CONTROL: read `reusedParts` from `site_assets`, and that arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs CAP`).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «CAP-14» on entering the cache; its `order:` line is the current one.

### COFF-13 · running — SPAWNED 2026-09-23 ~21:08Z by CONDUCT #17 as a SEPARATE CLOUD SESSION titled WORKER COFF-13 (CONDUCT #17); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/COFF-13 and that session; never conclude queued from the absence alone.
order: below the M8 corrections, above the features (it sat below LED-8, which Bob's ruling of 2026-09-22 moved behind the product rows — SCHEDULER #12): it refuses something TRUE — a record defect, not a gap — but errs in the CONSERVATIVE direction and reaches only decks with unreadable trailing slides, so it ranks under the defects above it (SCHEDULER #2, 2026-09-19)
milestone: M9
interface: I2 — a producer change on the text shape, so an IC is minted and the integrator classifies it.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §15's structure-shape row and §16's persistence paragraph, which both state this residue by name and say closing it is a producer change on I2.
depends-on: none. COFF-11 (IC-100) and COFF-12 landed the producer and wire halves this completes.
scope: a deck entry emits its own LENGTH — the slides the DECK has, not the ones the reader could open — and the wire carries it onto the persisted reading beside the slide list. The slide map is already keyed on each slide's OWN number (COFF-12), so the length is the missing fact, not a re-keying. `.odp` states an honestly NULL length if the format cannot answer, as `.ods` does for its grid.
accepts-when: a deck whose LAST slide part is unreadable still admits a citation of that slide, and a citation past the real deck is still refused C-45.1 BY NAME with the figure in the refusal. How a liar passes it: emitting the READABLE slide count as the length, which is the defect — so the fixture's deck must have an unreadable TRAILING slide and the arm must assert the length exceeds the readable list. NEGATIVE CONTROL: emit the readable count instead, and the trailing-slide arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (LED-7 batch 7, at D-359's close; `node tools/mintid.mjs COFF`).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «COFF-13» on entering the cache; its `order:` line is the current one.

### D-52 · running — SPAWNED 2026-09-23 ~21:08Z by CONDUCT #17 as a SEPARATE CLOUD SESSION titled WORKER D-52 (CONDUCT #17); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-52 and that session; never conclude queued from the absence alone.
order: security-class, first above the features: Membership v2 §8.1's promise that an export is never silent rests on this notification and only the looking half is built; below the silent defects because the export IS logged and §8.1 says so (SCHEDULER #5, 2026-09-21)
milestone: M7
interface: I3 — a queue item kind gains a producer; the integrator mints and classifies the IC.
design: `docs/development/NOTIFICATIONS.md` §The catalogue (the export entry, FINDING) and §The item contract, with `BIO_Membership_Architecture_v2.md` §8.1 as the requirement. **§8.1's "no notification channel anywhere" is SUPERSEDED by BOB #19's narrowing (the channel is the queue; only TRANSPORT is Bob's, D-98); its fold into §8.1 was asked of BOB on 2026-09-21 — read the landed §8.1 first.**
depends-on: none in code.
scope: a generator raising `export-performed` to EVERY administrator's queue when `export_log` gains a row, its `basis` naming that row, options from the producer. It is the first generator to take an `N-<n>`, so register `N` in `tools/mintid.mjs` (absent from `--list` on 2026-09-21) — **FULL GATE PROFILE**. Email is Bob's (D-98) and out of scope.
accepts-when: one export writes one item per administrator, each naming the `export_log` row, and a non-administrator gets none; `mintid N` mints. How a liar passes it: raising to the exporter alone, so the arm counts EVERY administrator. NEGATIVE CONTROL: drop the generator, and that arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (BOB #19's inbox entry, drained this commit; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-52» on entering the cache; its `order:` line is the current one.

### D-84 · running — SPAWNED 2026-09-23 ~21:08Z by CONDUCT #17 as a SEPARATE CLOUD SESSION titled WORKER D-84 (CONDUCT #17); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-84 and that session; never conclude queued from the absence alone.
order: directly after D-52, above the features: DEC-20's *disclosed* — the manifest SHOWN in the artifact — is missing from every published case, and one published without it is corrected only by a new edition (DEC-19) (SCHEDULER #6, 2026-09-21, LED-7 batch 11)
milestone: M10
interface: I3 — the case document gains the manifest; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption" — *"The manifest is part of the evidentiary record and travels with publication"* — and §"The bias acknowledgement, authored at export", whose manifest row reads *computed and stamped by the plane*.
depends-on: none — PL-12's manifest and pins are built.
scope: at case publication the plane stamps the manifest in force for the case's project scope — its pairs and `statements_sha` — into the signed case document, FROZEN and never recomputed; the acknowledgement stays authored beside it.
accepts-when: a case published under an adopted set names each pair and the hash; adopting a new revision afterwards leaves the published bytes identical; with nothing adopted the document says no manifest was in force. How a liar passes it: recomputing at read time, so the arm moves the lens after publishing and asserts the bytes did not move. NEGATIVE CONTROL: drop the stamp, and the named-lens arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 11; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-84» on entering the cache; its `order:` line is the current one.

### D-220 · running — SPAWNED 2026-09-23 ~21:08Z by CONDUCT #17 as a SEPARATE CLOUD SESSION titled WORKER D-220 (CONDUCT #17); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-220 and that session; never conclude queued from the absence alone.
order: after D-84, above the features: a deployed machine role over-counts what the record holds — the false-coverage hazard `STORE-AS-CACHE.md` names — in work a member reads and may accept; a correction to built work (SCHEDULER #6, 2026-09-21, LED-7 batch 12)
milestone: M9
interface: I8 consumer of `op=versionchain` (I3, built); no shape moves unless the builder finds one.
design: `docs/development/INVESTIGATIVE-SESSION.md` §"What the session sees" — *"AND IT MUST READ DOCUMENT VERSIONS AS VERSIONS (D-220, Bob 2026-08-06) … The session is consumer (3) on that row."*
depends-on: none — `op=versionchain` is built.
scope: the run reads an address's versions through `op=versionchain` and counts a document once, its versions as versions, wherever it counts or cites held material; the skill doctrine says so. Consumer (2), monitoring per address, is UNJUDGED here: the builder checks it at spawn and states it.
accepts-when: a fixture holding several captures of one address reads as ONE document with its versions, and a run's coverage counts it once. How a liar passes it: deduplicating by title or text, which merges different documents — so the fixture carries two different documents sharing a title. NEGATIVE CONTROL: drop the chain read, and the one-document arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 12; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-220» on entering the cache; its `order:` line is the current one.

### D-182 · queued — **AN ACTION NOBODY ASSESSED IS RECORDED AT `risk_tier` 1 — *FILE FREELY* — ON THE ONE FIELD THAT CARRIES LEGAL EXPOSURE.** C-2.10 admits 1, 2 and 3; nothing publishes member words for them and no undetermined value exists, so both writers keep the floor. RULED by BOB #21 (2026-09-21): both halves in one row. — owner RECORD, then UI.
order: after D-220, above the features: an overclaim on the field that carries legal exposure — CLAUDE.md §2's class, in the action plan a member files from (SCHEDULER #6, 2026-09-21; ruled on SCHEDULER #6's Q4)
milestone: M10
interface: I3 and I5 — a new value and published words; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, *"`risk_tier`, RULED 2026-09-21 by BOB #21"*: the Roadmap §8 words (1 file freely, 2 file with caution, 3 do not file without counsel) and UNDETERMINED, as authority and counterparty gained (D-130).
depends-on: none.
scope: `risk_tier` gains UNDETERMINED, written wherever no member stated a tier and never defaulted to 1; only a member's authored act sets 1, 2 or 3; the plane publishes the three words (REC-38's pattern) and a surface invents none. Rows already written at the default: the builder states how they read, and never back-fills an assessment nobody made.
accepts-when: an action created with no tier reads UNDETERMINED through the ops; a member's act sets 2 and reads *file with caution*; nothing writes 1 by default. How a liar passes it: a surface rendering UNDETERMINED over a stored 1, so the arm reads the stored row. NEGATIVE CONTROL: restore the default of 1, and the no-tier arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7; ruled on its row's two options; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-182» on entering the cache; its `order:` line is the current one.

### REC-159 · running — APPROVED by Bob ~21:08Z (BOB #31); CONDUCT #17 re-spawns it 2026-09-23 (the earlier worker's permission check refused the membership-op authority change; code only, no live instance). **AN ENROLLED ADMINISTRATOR IS REFUSED §4.9's CUSTODIAL ACTS FROM THEIR OWN SESSION, WITH A SENTENCE THAT IS FALSE OF THEM.** … (whole text: the cut archive)
order: directly before REC-155, on the same `SESSION_OPS` sets and `d270-refusal-truth`'s ROLE literal: a false refusal shipping to a real administrator outranks a determination owed (SCHEDULER #7, 2026-09-21; REC-156's DELEGATION via CONDUCT #10)
milestone: M8
interface: I3 — four ops gain session reach and three a stamped `by`; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.9 (each act is EVERY administrator's) and … (whole text: the cut archive)
depends-on: none. D-136 and REC-156 are on `main`.
accepts-when: an enrolled administrator performs all four from their session, attributed to them; a member is refused by name. How a liar passes it: widening the class without the roster … (whole text: the cut archive)
scope-amended: + memberset/signeradd/signerset record the server-stamped actor in a new `by` column; existing rows read `not recorded` (BOB #31 21:08Z; attribution lives in the record). The accepts-when gains an arm per op through the op, and its NEGATIVE CONTROL drops one op's stamp.
added: 2026-09-21 · SCHEDULER #7 (REC-156's DELEGATION; `node tools/mintid.mjs REC`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
