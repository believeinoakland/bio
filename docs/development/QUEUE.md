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

### D-179 · running — SPAWNED 2026-09-23 20:53Z by CONDUCT #17 from the BACKLOG as a cloud worker (session 'WORKER <ID> (CONDUCT #17)'), under BOB #31's 20:51Z ruling; recorded here by SCHEDULER #16 so no refill places it twice. A worker finds this row with ledger.mjs find.
order: directly after D-171, beside D-169 and D-171 as BOB #26 placed it: a silent move of the record's provenance row, CLAUDE.md §2's class (SCHEDULER #12, 2026-09-22; BOB #26's inbox entry, item 1)
milestone: M7
interface: I3 — `op=promote` refuses what it accepted; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §8 (one capture, one home, the original's; BOB #26, 2026-09-22).
depends-on: none — C-53.8's fence is built.
accepts-when: held bytes promoted under a second bundle are refused and the first bundle's register row is byte-identical after; a revision re-registering its own bytes lands; a caller who … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #12 (BOB #26's inbox entry, item 1, drained this commit; D-179's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-179» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-128 · integrated — finished; land/worker/D-128 @ 726480af integrated on land/conduct/c17-batch3 @ 419272eb, waiting for its train — flipped by SCHEDULER #16
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

### D-311 · integrated — finished; land/worker/D-311 @ 2fee8c79 integrated on land/conduct/c17-batch3 @ a8066053, waiting for its train. CORRECTION to this row's text and D-310's argument (D-311's worker, verified by CONDUCT #17): projectremove is not an administrator's act; the store refuses any NON-OWNER, and the act is derived from that refusal.
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

### D-278 · integrated — finished; land/worker/D-278 @ e5e6d6e3 integrated on land/conduct/c17-batch3 @ d93d29c4, waiting for its train — flipped by SCHEDULER #16
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

### COFF-13 · integrated — finished; land/worker/COFF-13 @ 62b93406 integrated on land/conduct/c17-batch3 @ a6f0479a (IC-205 renumbered IC-207), waiting for its train — flipped by SCHEDULER #16
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

### D-182 · running — SPAWNED 2026-09-23 ~21:16Z by CONDUCT #17 as a SEPARATE CLOUD SESSION titled WORKER D-182 (CONDUCT #17); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-182 and that session; never conclude queued from the absence alone.
order: after D-220, above the features: an overclaim on the field that carries legal exposure — CLAUDE.md §2's class, in the action plan a member files from (SCHEDULER #6, 2026-09-21; ruled on SCHEDULER #6's Q4)
milestone: M10
interface: I3 and I5 — a new value and published words; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2, *"`risk_tier`, RULED 2026-09-21 by BOB #21"*: the Roadmap §8 words (1 file freely, 2 file with caution, 3 do not file without counsel) and UNDETERMINED, as authority and counterparty gained (D-130).
depends-on: none.
scope: `risk_tier` gains UNDETERMINED, written wherever no member stated a tier and never defaulted to 1; only a member's authored act sets 1, 2 or 3; the plane publishes the three words (REC-38's pattern) and a surface invents none. Rows already written at the default: the builder states how they read, and never back-fills an assessment nobody made.
accepts-when: an action created with no tier reads UNDETERMINED through the ops; a member's act sets 2 and reads *file with caution*; nothing writes 1 by default. How a liar passes it: a surface rendering UNDETERMINED over a stored 1, so the arm reads the stored row. NEGATIVE CONTROL: restore the default of 1, and the no-tier arm fails by name.
added: 2026-09-21 · SCHEDULER #6 (LED-7; ruled on its row's two options; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-182» on entering the cache; its `order:` line is the current one.

### D-178 · running — SPAWNED 2026-09-23 ~21:21Z by CONDUCT #17 as a SEPARATE CLOUD SESSION titled WORKER D-178 (CONDUCT #17); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/D-178 and that session; never conclude queued from the absence alone.
order: with the M10 corrections, after D-182 and above the features: the audit DIST's ladder needs clean before a version serves reports correct legs as offenders and skips the checks it exists to run, CLAUDE.md §2's class; last of them because no member reads it (SCHEDULER #12, 2026-09-22, LED-7)
milestone: M10
interface: I3 — `op=audit`'s tallies move; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 5 (*Inheritance is per axis*, C-21.2), with `docs/architecture/BIO_Distribution_v0_1.md` §6, rung 6 (`op=audit` clean).
depends-on: none — `publishedRegistryFor` is built, and the write path's gate facts already pass it.
scope: FIRST a corpus count of what the injection moves (inherited legs that stop reading C-2.8; C-21.1 and C-21.2 findings that appear), in `MEASUREMENTS.md`; then the sweep passes `publishedRegistryFor(bundle, targets)` beside `earnedRegistry`, as the gate facts do.
accepts-when: an audit over a fixture reads a correctly inherited leg clean and an own grade on a published case as C-21.2; the count is recorded before the landing. How a liar passes it: an empty registry object, which silences C-2.8 and enables nothing, so the own-grade arm must fire. NEGATIVE CONTROL: drop the injection, and the inherited-leg arm fails by name at C-2.8.
added: 2026-09-22 · SCHEDULER #12 (LED-7; D-178's DEBT row of 2026-08-04, verified at the code; keeps its `D-` id).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «D-178» on entering the cache; its `order:` line is the current one.

### UI-74 · running — SPAWNED 2026-09-23 ~21:21Z by CONDUCT #17 as a SEPARATE CLOUD SESSION titled WORKER UI-74 (CONDUCT #17); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/UI-74 and that session; never conclude queued from the absence alone.
order: the first feature, after D-52: DEC-24's member half — the machine proposes, the member concludes — has no door, and the IS plan recorded it done at 43/43; below the corrections because the status authority claims no ceremony (SCHEDULER #5, 2026-09-21)
milestone: M9
interface: I3 consumer (`op=versionaccept`; `op=versionstrength`'s `independence`) — both built.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 (a)–(b), with `docs/archive/IS-BUILD-PLAN.md`'s UI-43 row as the scope it was built to.
depends-on: none; both ops are built — CHECK AT THE CODE at spawn.
scope: UI-43's scope RE-DERIVED on current `main` — the branch is EVIDENCE, 1,836 commits behind, never merged blind: the four beats, the falsifier read back, independent sufficiency AFFIRMED per branch before a name lands, DEC-46's lens diff in the ceremony, REC-36's withholding — PLUS D-195's shared origin, which the branch never read (`independence` 0×): the plane derives it; the ceremony shows it BEFORE the affirmation, and never refuses.
accepts-when: an OR accept requires the per-branch affirmation; a fixture whose two parts share a capture shows that origin before it, and one with independent parts shows NONE; driven against the real plane. NEGATIVE CONTROLS: drop the affirmation, or hide the field, and each arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (D-397's third branch and D-195, verified at the code; `node tools/mintid.mjs UI`).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «UI-74» on entering the cache; its `order:` line is the current one.

### REC-161 · running — SPAWNED 2026-09-23 ~21:26Z by CONDUCT #17 as a SEPARATE CLOUD SESSION titled WORKER REC-161 (CONDUCT #17); gate = its own suites, control and plancheck. Falsify rather than believe: read the branch land/worker/REC-161 and that session; never conclude queued from the absence alone.
order: 1 of 2, directly after UI-74, which shows the same fact at the accept ceremony (BOB #22, 2026-09-21: SCHEDULER #5's Q1, RULED)
milestone: M9
interface: I3 additive — an IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c) (BOB #22, 2026-09-21).
depends-on: none — `#independenceOf` is built.
scope: a read returning `#independenceOf` for a PROPOSED partition over an inquiry's existing legs, gated as `op=versionstrength` is, writing nothing, `checked`/`complete` as they already are.
accepts-when: two parts sharing a capture read as sharing an origin, independent parts read clean, a one-part partition reads `checked: false`, and the answer equals `op=versionstrength`'s once the partition is written. How a liar passes it: a second derivation that agrees today, so a control swaps in a copy differing in one branch and fails by name.
added: 2026-09-21 · SCHEDULER #7 (BOB #22's inbox entry, drained this commit; `node tools/mintid.mjs REC`).
uncut: 2026-09-23 by SCHEDULER #16, restored WHOLE from `docs/archive/ledgers/QUEUE-cut-2026-09-22.md` «REC-161» on entering the cache; its `order:` line is the current one.

### CPDF-22 · queued — **ONE SHAPE FOR "ADMITTED, BOUND NOT HELD": D-440 (IC-198) answers `undetermined: {level, why}` for an image `{part}`, while D-420 (IC-203/IC-204) answers `image_bound: {determined:false, empty_level, why}` for an image `{page, rect}` — two shapes for one statement on I5 mint answers.** `image_bound` is withdrawn before any client reads it. — owner CONTENT-PDF (D-420's paths).
order: directly after M0-138, first of the product rows, as BOB #31 placed it: no client may read `image_bound` before it goes; after M0-138 because every train pays that tax (SCHEDULER #16, 2026-09-23; BOB #31's inbox entry, drained this commit)
milestone: M4
interface: I5 — `image_bound` withdrawn for `undetermined: {level, why}`, through ONE IC; the integrator mints and classifies it.
design: `docs/architecture/BIO_System_Design.md` §3, construct 12 (UNDETERMINED as a display primitive; D-440's `undetermined` is the record's shape), with BOB #31's ruling of 2026-09-23 (the drained inbox entry).
depends-on: D-420, D-440 (both on `land/conduct/c17-batch1`; the train that lands it).
scope: every "admitted, bound not held" mint answer carries `undetermined: {level, why}`; `image_bound` is removed at every producer and reader.
accepts-when: `bio-plane/test/d420-image-page.test.mjs` reads `undetermined.level` and `undetermined.why` for a `{page, rect}` on a pre-change PDF, `d440-image-part.test.mjs` green, and `git grep -n image_bound -- bio-plane civicos-ui` returns nothing. NEGATIVE CONTROL (`nc-d420.mjs`, a new arm): restore the `image_bound` key, and D-420's suite fails by name.
added: 2026-09-23 · SCHEDULER #16 (BOB #31's inbox entry, drained this commit; `node tools/mintid.mjs CPDF`).

### REC-182 · queued — **TWO MANIFEST READS ORDER BY `created` ALONE, SO TIED ROWS COME BACK IN AN UNDEFINED ORDER: `op=export`'s `promotions` and `gateFacts`' `manifest`.** Re-read on `91bcea6b`: `store.mjs` lines 30093 and 31072 end `ORDER BY created`; D-171 made `#revisionKind` `created DESC, rowid DESC` and REC-32 the same. Harm UNDETERMINED: no consumer found that picks by position. And State Rules §6 I-20's *"immediately prior recorded snapshot"* does not say what prior means on a `created` tie. — owner RECORD.
order: directly after CPDF-22 (REC-181 is in the cache): the same class D-171 just closed (a correction to just-landed work), the record's own order undefined on a tie; below the promote-integrity rows because no consumer is known to be harmed (SCHEDULER #16, 2026-09-23; D-171's worker via CONDUCT #17)
milestone: M6
interface: none (an order made total, as written); the integrator classifies.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §6, I-20 (mechanical-writer conformance: the immediately prior recorded snapshot), with D-171's landed `created DESC, rowid DESC` as the precedent.
depends-on: D-171 (its order is the precedent; on `land/conduct/c17-batch2`).
scope: (1) both ORDER BYs gain `, rowid` (write order on a tie); a sweep of `store.mjs` manifest reads for any other untied `created` order, each tied or listed; (2) I-20's text states that on a `created` tie, prior means write order.
accepts-when: in a NEW suite `bio-plane/test/rec-182-created-tie.test.mjs`, through the ops: two manifest rows with an equal `created` come back from `op=export` and the gate in write order on every run; I-20 names the tie rule. NEGATIVE CONTROL (`rec-182-created-tie.control.mjs`): drop `, rowid` from one read, and its arm fails by name.
added: 2026-09-23 · SCHEDULER #16 (D-171's worker's finding via CONDUCT #17, verified at the code; `node tools/mintid.mjs REC`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
