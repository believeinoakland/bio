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

### REC-179 · running — a revision can rewrite an inquiry's surfaced_by. SPAWNED 2026-09-23 ~16:25Z by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on 0e7cc03e: no refusal comparing a revision's surfaced_by exists in store.mjs; D-78's restamp is gated on base === null. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after REC-178: an attribution the record states falsely is authority-class (SCHEDULER.md step 3), and the rule-2 surfacing row REC-171 writes would then contradict the bundle it describes (SCHEDULER #16, 2026-09-23; DEBT D-121's defect row, placed by LED-7 batch S16-2)
milestone: M7
interface: I3 — a new refusal on `op=promote`; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, rule 2's reach (the SURFACING ACT is what `surfaced_by` records, decided at the trust boundary), with the D-78 restamp's own stated intent that a revision carries the value forward.
depends-on: none. A replay under §11 item 5's migration paragraph (REC-173) is stated by the builder; anything it does not cover goes to BOB before building.
scope: promote refuses a revision whose `surfaced_by` differs from the current version's by a new refusal code with its canned translation, before any write.
accepts-when: through the op, a revision flipping `agent` to `human`, and one flipping `human` to `agent`, are each refused by name with the bundle byte-identical after; a revision keeping the value lands. NEGATIVE CONTROL: drop the comparison, and the flip arm lands and fails by name.
added: 2026-09-23 · SCHEDULER #16 (DEBT D-121, the defect row of the two sharing that id, verified at the code; `node tools/mintid.mjs REC`).

### REC-177 · running — airunopen accepts a declared bound with no positive allowed. SPAWNED 2026-09-23 ~16:25Z by CONDUCT #16. NOT LANDED, CHECKED BY CONTENT on 0e7cc03e: no allowance-required refusal in bio-checks.mjs. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: directly after REC-172 (in the cache) as BOB #30 placed it, the same bound fence; below the record-integrity rows REC-175 and REC-176 (SCHEDULER #15, 2026-09-23; BOB #30's inbox entry)
milestone: M9
interface: I3 — a new refusal on `op=airunopen`; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §14b item 6, *"A declared bound STATES its allowance"* (BOB #30, 2026-09-23; on `main` since `aaf19287`, landed by train `0e7cc03e`).
depends-on: REC-172 (done, `0e7cc03e`).
accepts-when: as the paragraph states it, with its NEGATIVE CONTROL.
added: 2026-09-23 · SCHEDULER #15 (BOB #30's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

### D-440 · running — the image arm's {part} mints on any non-container capture. SPAWNED 2026-09-23 16:31Z by CONDUCT #16 as a local worker (a cloud-session attempt at 16:27Z was stopped and archived before writing anything, per BOB #30's correction). NOT LANDED, CHECKED BY CONTENT on 0e7cc03e: bio-checks.mjs has no office-container gate on the image arm's {part}. Falsify rather than believe: a live worker holds an agent-* worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH, and never conclude queued from the absence alone.
order: with the claims the record cannot support, after D-57 and above D-390: a content row naming bytes its document does not hold, minted silently, CLAUDE.md §2's class; D-420 directly after it, the same function (BOB #24: *"one worker can take both"*) (SCHEDULER #9, 2026-09-21)
milestone: M4
interface: I3 — a new refusal on the image arm; the integrator mints and classifies the IC.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2 (*"`{part}` is a member of a CONTAINER's own bytes, and nothing else"*, which names this fence) and §3.4, with `docs/development/CLIENT-RENDERED.md` "DESIGNED 2026-09-21" (an image served beside a page is its own document).
depends-on: none.
scope: the row's named fix: `contentContextFor` tells the checker whether the capture is an office container, from its content type; the image arm refuses a `{part}` on any other capture BY NAME, saying an image served beside a page is its own document to acquire and cite whole; an office capture with no persisted image list keeps its undetermined admission, stated.
accepts-when: a `{part}` on an HTML capture is refused by name, pointing at acquiring the image; a container capture still mints; an office capture with no persisted list is admitted as undetermined, stated. How a liar passes it: refusing every `{part}`, so the container arm must mint. NEGATIVE CONTROL: remove the refusal, and the HTML arm fails by name.
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry, drained this commit; D-440's DEBT row; keeps its `D-` id).

uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-440» on entering the cache; re-read on `0e7cc03e`: still open.

### D-82 · running — an agent-surfaced focus shows like a member's. SPAWNED 2026-09-23 ~19:08Z by CONDUCT #16 as a SEPARATE CLOUD SESSION (the trial beat local ~10x; BOB #30 17:50Z). NOT LANDED, CHECKED BY CONTENT on 0e5f7054: app.html has no agent-surfaced inquiry marker. Falsify rather than believe: read the branch land/worker/D-82 and the cloud session titled WORKER D-82 (CONDUCT #16); never conclude queued from the absence alone.
order: MOVED UP 2026-09-23 by SCHEDULER #16 to directly after UI-73, with it: paths disjoint from `store.mjs`, `index.mjs` and `bio-checks.mjs` (`civicos-ui` only), which CONDUCT caps at 5 concurrent, so it fills a non-store slot under continuous spawning (BOB #30). Its own reason stands: after UI-73, the same member-surface class: a member reads a machine's question as a colleague's judgement, which §P's accountability rule exists to prevent; a gap over built stamping, so below the refusal words already shipping wrong (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M8
interface: I3 consumer (`surfaced_by`, stamped since D-78).
design: `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §"P · PROPOSAL", its accountability rule — *"what a member needs to know is that nobody has yet judged it worth asking"* — with `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 8.
depends-on: none — D-78's stamp is built.
scope: wherever an inquiry is listed or shown — the focus list, the review queue, beside a project — one marker for `surfaced_by: agent`, from one helper, saying nobody has yet judged it worth asking. It discounts nothing and hides nothing; a member's inquiry renders as today.
accepts-when: against the real plane, an inquiry a machine credential created shows the marker on every surface listing it, and one a member created shows none. How a liar passes it: marking by title or author text, so the fixture's two inquiries share both. NEGATIVE CONTROL: neuter the helper, and the agent-inquiry arm fails by name.
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-82's DEBT row of 2026-07-30, verified at the code; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-82» on entering the cache; its `order:` line is the current one.

### D-420 · running — an image {page, rect} row is bounded by the page set only. SPAWNED 2026-09-23 ~19:08Z by CONDUCT #16 as a SEPARATE CLOUD SESSION (the trial beat local ~10x; BOB #30 17:50Z). NOT LANDED, CHECKED BY CONTENT on 0e5f7054: coversImage has no {page, rect} branch. Falsify rather than believe: read the branch land/worker/D-420 and the cloud session titled WORKER D-420 (CONDUCT #16); never conclude queued from the absence alone.
order: directly after D-440, the same function and one worker for both (BOB #24): a KIND overclaim the crop already catches, so below D-440's silent mint (SCHEDULER #9, 2026-09-21, LED-7 batch S9-1)
milestone: M4
interface: I1 (a PDF reading's container extent gains its images) and I3 (a new refusal); the integrator mints and classifies the ICs.
design: `docs/development/EXTRACTION-BREADTH-DESIGN.md` §3.2 (the `image` reference's `{page, rect}` form; `covers` refuses from the container's own extent, by name) and §3.3 item 2 (a PDF's image objects and their painted rectangles, CPDF-18).
depends-on: none — CPDF-18's `structure().images` is built.
scope: the row's named fix: acquire persists `structure().images` as `container_extent.images` for a PDF (absent for a capture acquired before, stated as CAP-12 states an empty level), and `coversImage` gains the page-form branch: refuse a rect that no persisted placement equals, and ADMIT when the list is absent.
accepts-when: a rect where the page paints no image is refused by name at the mint; a rect equal to a persisted placement mints; a PDF acquired before the change is admitted with its absence stated. How a liar passes it: a tolerance so wide any rect matches, so the no-image arm uses a rect far from every placement. NEGATIVE CONTROL: drop the page-form branch, and the no-image arm fails by name.
added: 2026-09-21 · SCHEDULER #9 (BOB #24's inbox entry; LED-7 batch S9-1; D-420's DEBT row of 2026-09-18; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-420» on entering the cache; its `order:` line is the current one.

### M0-138 · queued — **`tools/status.mjs` `renderCell` JOINS EVERY CLAIM'S WHOLE TEXT INTO `BIO_System_Design.md` §3, SO EVERY LANDING THAT ADDS A CLAUSE PUSHES THE MAP OVER ITS 48 KiB CUT AND INTEGRATORS TRIM THE SOURCE OF TRUTH TO FIT ITS RENDERING** (CONDUCT #17 trimmed 5 claim texts in `construct-status.json` to land one batch). — owner BOB (`tools/status.mjs`, a BOB instrument), built by a worker.
order: FIRST of the backlog, as BOB #31 placed it: every train pays this merge tax; a process row admitted because it cuts gate and merge time (Bob, 2026-09-22) (SCHEDULER #16, 2026-09-23; BOB #31's inbox entry, drained this commit)
milestone: M0
interface: none
design: BOB #31's ruling of 2026-09-23 (the BOB INBOX entry drained to `docs/archive/ledgers/BOB-INBOX-drained.md`; BOB folds it into `docs/architecture/BIO_System_Design.md` §3's front matter), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none.
scope: `renderCell` renders each claim's FIRST SENTENCE (to the first `. ` outside backticks); the whole text stays in `construct-status.json`, served by `node tools/status.mjs <n>`; the design pointer stays verbatim; the 5 trimmed attributions are restored; the 48 KiB budget does not move.
accepts-when: `status.test.mjs`, `statussweep.test.mjs`, `corpuscheck.test.mjs` and `readbudget.test.mjs` green; `node tools/status.mjs --check` shows 0 drift after `--write`; the map is under budget. NEGATIVE CONTROL (`status.control.mjs`, a new arm): render whole texts again, and the budget check FAILs naming the map.
added: 2026-09-23 · SCHEDULER #16 (BOB #31's inbox entry, drained this commit; `node tools/mintid.mjs M0`).

### REC-180 · queued — **A REFUSAL RETURNED INSIDE `promote`'s `transactionSync` AFTER A WRITE COMMITS THAT WRITE: REC-141's project-id mint runs first, so a later `NO_TITLE`, `NAME_TAKEN` or `CAS_STALE` burns a minted id with no project.** Re-read on `0e5f7054`: `store.mjs` `promote` mints via `#mintProjectId` at the head of the callback and returns `{ ok: false }` further down without throwing. And `bio-plane/test/bias.test.mjs` ARM M checks `op=list`, which could not see the landed bundle REC-176 fixed. — owner RECORD.
order: first of the backlog: a write the record keeps after refusing the act is CLAUDE.md §2's worst class, and it corrects the site REC-176 just fixed (SCHEDULER #16, 2026-09-23; REC-176's worker via CONDUCT #16)
milestone: M6
interface: none expected (a refused act writes nothing); the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` (the Mechanical Verification Law: the record holds only what an act that landed wrote), with REC-126's `Store.#ROLLBACK` sentinel (`#reviewGates`) as the pattern.
depends-on: REC-176 (the same callback; on `land/conduct/c16-batch6`).
scope: (1) an `ok: false` returned from `promote`'s callback throws `Store.#ROLLBACK` carrying the refusal, and the outer catch returns it, so nothing written before it survives; then a sweep of `promote` for any other late refusal, each listed. (2) `bias.test.mjs` ARM M asserts `op=image` returns null for every id in the refused set.
accepts-when: in a NEW suite `bio-plane/test/rec180-promote-rollback.test.mjs`, through the op: a project creation refused `NAME_TAKEN` after the mint leaves the sequence and `minted_ids` byte-identical; `bias.test.mjs` ARM M green reading `op=image`. NEGATIVE CONTROL (`rec180-promote-rollback.control.mjs`): return the refusal instead of throwing, and the mint arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (REC-176's worker's two findings via CONDUCT #16, verified at the code; `node tools/mintid.mjs REC`).

### REC-181 · queued — **`op=promote` CAN MOVE A VERIFIED INFORMATION ITEM TO `retired` WHILE LIVE LEGS AND EDGES STILL CITE IT, BYPASSING `op=retire`'s `CITED` REFUSAL THAT State Rules §4.1 RESTS ON.** Re-read on `0e5f7054`: `store.mjs` `promote`'s only state-transition guard is the project's (`NOT_THE_OWNER`); `retire` runs `#restsOnLive` / `#citesInto` and refuses `CITED`. D-168's worker's fixture retired a cited item through promote and it answered ok. — owner RECORD.
order: directly after REC-180, the same `promote` callback: a retired item still resting under live legs is the record claiming what §4.1 forbids (CLAUDE.md §2), and D-168 just made a retired item uncitable, so the bypass is a correction to just-landed work (SCHEDULER #16, 2026-09-23; D-168's worker via CONDUCT #16)
milestone: M9
interface: I3 — a new refusal on `op=promote` (`CITED`, as `op=retire` answers it); the integrator mints and classifies the IC.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.1 (a retired item is NOT citable; retirement is refused while live legs cite it, BOB #30), with `op=retire`'s `CITED` refusal as the one predicate.
depends-on: REC-176, REC-178, D-168 (the same `promote` site; on `land/conduct/c16-batch6`).
scope: when `promote` moves an Information item INTO `retired`, it runs `retire`'s own `#restsOnLive` / `#citesInto` check and refuses `CITED` with the same offenders, before any write; or the builder routes that transition only through `op=retire`, stating which.
accepts-when: in a NEW suite `bio-plane/test/rec-181-promote-retire.test.mjs`, through the op: a promote retiring a cited verified item is refused `CITED` with the bundle byte-identical after; an uncited one retires. NEGATIVE CONTROL (`rec-181-promote-retire.control.mjs`): skip the check, and the cited arm lands and fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-168's worker's finding via CONDUCT #16, verified at the code; `node tools/mintid.mjs REC`).

### D-390 · queued — **`#frontierContent`'S INDEX-STATE READ BINDS ONE VARIABLE PER SUBJECT ON THE PAGE, UP TO `cap` — 200 BY DEFAULT, 2,000 AT THE** … (whole text: the cut archive)
order: after D-57: a read that must say WHICH absence is true fails outright on the first instance past ~100 content captures; below D-389, REC-160 and D-57 because it fails LOUDLY rather than claiming what the record cannot support (SCHEDULER #8, 2026-09-21, LED-7 S8-1 and S8-2)
milestone: M3
interface: none — the answer's shape does not move; the integrator classifies.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §5 (the frontier is a view over the log) and §6 (the … (whole text: the cut archive)
depends-on: none. **Sequence after D-389** (the same method's page cut, `store.mjs` `#frontierContent`).
accepts-when: a 200-subject page answers every row's index state, equal to the same rows read one chunk at a time; the sweep's list is in the landing. How a liar passes it: a fixture under … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #8 (LED-7 batch S8-1; D-390's DEBT row of 2026-09-16, verified at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-390» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-60 · queued — **`op=monitor` COMPARES RAW BYTES, SO A LEGISTAR PAGE READS `modified` ON EVERY TICK AND MONITORING REPORTS NOTHING.** It compares … (whole text: the cut archive)
order: after D-390, above CAP-14: M1's monitoring is noise on the class of page Oakland publishes on; below the claims the record cannot support because the design grades a change reported that did not happen as the cheaper error (DOCUMENT-PROFILES.md, "Three digests") (SCHEDULER #8, 2026-09-21, LED-7 S8-3)
milestone: M1
interface: I3 — `op=monitor` names the comparison it made; the integrator mints and classifies the IC.
design: `docs/development/DOCUMENT-PROFILES.md` §"Three digests, not one" — *evidentiary … answers … (whole text: the cut archive)
depends-on: none — FW-4's digests are built.
accepts-when: two fetches differing only in `__VIEWSTATE` read `unchanged`, compared evidentiary, with no flag raised; a real text change reads `modified`; a baseline with no determined … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #8 (LED-7 S8-3; D-60's DEBT row, traced at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-60» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-169 · queued — **A DISPOSED INTAKE INQUIRY IS WRITTEN WITHOUT THE `disposition_reason` C-2.8 REQUIRES.** `dispose` sets it with … (whole text: the cut archive)
order: after D-65, first of the silent record defects on built paths: the record holds a bundle its own catalogue rejects, CLAUDE.md §2's class; D-171 and D-179 follow, the honesty batch BOB #26 placed together (SCHEDULER #12, 2026-09-22, LED-7)
milestone: M7
interface: none expected — the bytes gain the line C-2.8 already requires; the integrator classifies.
design: `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §"J · JUSTIFIED TRANSITION" (*disposition of a … (whole text: the cut archive)
depends-on: none — `Store.#setOrAddScalar` is built (the conclude path uses it).
accepts-when: an intake-created inquiry, deferred and dismissed, passes C-2.8 with its reason in the bytes; a member-created one disposes byte-identically to today. How a liar passes it: a … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #12 (LED-7; D-169's DEBT row of 2026-08-03, verified at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-169» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-171 · queued — **`#revisionKind` NAMES A REVISION'S WRITER BY A CALLER'S KEY: C-20.1's writer lookup breaks a tie on `created` with** … (whole text: the cut archive)
order: directly after D-169, the same honesty batch (its DEBT row: beside D-169); a wrong writer needs two manifest entries sharing one `created`, so it follows the defect every intake disposal meets (SCHEDULER #12, 2026-09-22, LED-7)
milestone: M7
interface: none — the answer's shape does not move; the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §6 (I-20, mechanical-writer conformance … (whole text: the cut archive)
depends-on: none.
accepts-when: two manifest entries sharing `created`, the later written with the lexically smaller `snap_key`, read the LATER one's writer. How a liar passes it: a fixture whose later write … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #12 (LED-7; D-171's DEBT row of 2026-08-04, verified at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-171» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
