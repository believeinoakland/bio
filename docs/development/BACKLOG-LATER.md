# The backlog's tail — the same order, continued

`docs/development/BACKLOG.md` holds the head of the order, within its budget; this file holds the REST of the same
order, and its first row comes directly after `BACKLOG.md`'s last (`docs/development/WORK-PIPELINE.md` §2). It is
LOOKED UP, never read whole: find any row with `node tools/ledger.mjs find <ID>`. Rows arrive and leave only by
tool: a placement that puts `BACKLOG.md` over its budget moves whole rows from its foot to the head of this file,
and a refill or any later write moves them back as room frees (`tools/ledger.mjs` `planRebalance`). No row is
ever cut to fit. No whole-file budget; a row is held to 2 KiB, as in the backlog.

## Rows

### CPDF-21 · queued — **`kickoffs/CONTENT-PDF.md` IS 25,863 B AGAINST THE 24,576 B READING BUDGET**, so the lane cannot read its own instructions … (whole text: the cut archive)
order: directly after REC-154, its class and its precedent: it breaks CLAUDE.md §1's reading budget for a build lane, every CONTENT-PDF worker pays it on every spawn, and it is cheap and mechanical (SCHEDULER #6, 2026-09-21; SCHEDULER #5's handoff)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget — *a … (whole text: the cut archive)
depends-on: none. **Same line as REC-154** (`CUT` in `tools/readbudget.mjs`): whichever lands second re-reads the first.
accepts-when: `node tools/readbudget.mjs` no longer warns on CONTENT-PDF.md and lists it in `CUT`; the archived text is byte-identical to what left the live file. How a liar passes it … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs CPDF`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «CPDF-21» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-82 · queued — **NARROWED TWICE ON 2026-09-21: WHAT IS LEFT IS THE OCCUPANCY RULE AT THE INTEGRATOR'S NO-BOB FALLBACK START.** The … (whole text: the cut archive)
order: beside REC-154, the reading-budget class, and after M0-81, which builds the occupancy judgement this rule points at (SCHEDULER #4, 2026-09-21, re-measured; placed by SCHEDULER #3, 2026-09-20)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) with CLAUDE.md §1's reading budget … (whole text: the cut archive)
depends-on: none. Sequence after M0-81.
accepts-when: `node tools/readbudget.mjs` reads CONDUCT.md under budget with 0 failing; the kickoff states the check at the fallback start and cites BOB.md; anything cut is byte-identical in the archive.
added: 2026-09-20 · SCHEDULER #3 (BOB #18's inbox entry); narrowed 2026-09-21 by BOB #19 and SCHEDULER #4 (BOB #19's inbox entry, drained this commit).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-82» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-120 · queued — **`mintid --audit --base` DIFFS `main` ONLY, SO AN ID ALLOCATED ON `coord` IS INVISIBLE TO THE INTEGRATION-SIDE CHECK.** `audit()` (`tools/mintid.mjs`) reads `git diff <base>...HEAD`; since M0-110's cutover every DEBT row, plan heading and ledger archive — the allocation sites — lands on `coord`. Found by M0-110's worker (CONDUCT #14). — owner M0.
order: first of the ledger tooling, before LED-8: an id collision check blind to where ids are now minted is the costs-nothing green, latent until two lanes mint the same id on `coord`; behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #14, 2026-09-23; M0-110's finding)
milestone: M0
interface: none
design: `docs/development/TREE-SHARING.md` §1 (the state moves to `coord`; every reader follows it), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — M0-110 is done.
scope: the audit also diffs the `origin/coord` range (the ids a branch's coord writes added since its base), reading through `tools/coord.mjs`, and says which side each allocation came from.
accepts-when: an id allocated twice, once on `main` and once on `coord`, is reported as a collision by name. NEGATIVE CONTROL: drop the coord range, and that arm fails by name.
added: 2026-09-23 · SCHEDULER #14 (M0-110's finding, via CONDUCT #14; `node tools/mintid.mjs M0`).

### M0-128 · queued — **`coord.mjs write` REBALANCES THE BACKLOG AFTER EVERY WRITE, A CLAIM OR A STATUS WORD INCLUDED, WHERE BOB #29 RULED THAT ONLY A WRITE CHANGING THE PLAN'S MEMBERSHIP OR SIZE MAY.** `write()` (`tools/coord.mjs`, re-read on `619dfa65`) runs `applyIntent(dir, { op: "rebalance", auto: true })` whenever its `rebalance` option is true, which is the default, whatever the intents; `WORK-PIPELINE.md` §2 names this *"the correction owed (M0)"*. Harmless today (a rebalance conserves every row verbatim), so it breaks M0-110's partition of writers only in principle: a lane's claim can move a plan row it never read. — owner M0.
order: with the ledger tooling, directly after M0-120 and before LED-8: a ruled correction to a landed tool, but WORK-PIPELINE §2 itself says a stray rebalance is harmless, so it neither cuts gate time nor unblocks product and sits behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #15, 2026-09-23; BOB #29's ruling of the same day)
milestone: M0
interface: none
design: `docs/development/WORK-PIPELINE.md` §2, *"WHICH WRITES REBALANCE — RULED 2026-09-23 by BOB #29"*, with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none — M0-119 is on `main`.
scope: `write()` adds its automatic rebalance only when an intent changes a plan file's membership or size: `insert`, `row`, `refill`, `archive`, or an `append`, `line` or `replace` whose file is `QUEUE.md`, `BACKLOG.md` or `BACKLOG-LATER.md`; a `status` word, a claim, a handoff or a DELEGATION does not. The explicit `rebalance` intent is unchanged; `coord.test.mjs` gains the arms.
accepts-when: a write of only a `CLAIMS.md` append or a `-NEXT.md` replace leaves both plan files byte-identical even when the backlog is over budget; an `insert` over budget still moves the tail. NEGATIVE CONTROL: rebalance on every write again, and the claim-only arm fails by name.
added: 2026-09-23 · SCHEDULER #15 (BOB #29's ruling in WORK-PIPELINE §2; `node tools/mintid.mjs M0`).

### LED-8 · queued — **SIX REGISTERED ID COLLISIONS: `ledger.mjs find` ANSWERS TWO DIFFERENT ROWS FOR ONE ID.** D-121 and D-124 each name two … (whole text: the cut archive)
order: behind the product rows, first of the ledger tooling (Bob, 2026-09-22: *process is overhead*; SCHEDULER #12): AMBIGUITY STATED, not the record over-claiming — the tools REFUSE loudly rather than corrupt (`archive D-121 --dry-run` prints both dispositions and stops), and LED-7 folds around the two rows (SCHEDULER #2 + BOB #17, 2026-09-19)
milestone: M0
interface: none
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7, the bullet "The legacy residue" … (whole text: the cut archive)
depends-on: none.
accepts-when: `find` returns BOTH rows for a collided id and SAYS it collided; `mintid --audit` still reads 0 breaks; every existing citation of the four still resolves. How a liar passes … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #2 (batch 4; found by CONDUCT #7; no-renumber ruling by BOB #17).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «LED-8» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### LED-9 · queued — **A PIPELINE INVARIANT READS `status.mjs`, SO A DEPENDENT CANNOT BE SEQUENCED ABOVE UNBUILT SUBSTRATE.** P4 fails the plan when a … (whole text: the cut archive)
order: with LED-8, the ledger tooling: preventive, not a live defect — no row is mis-sequenced today, checked by hand. Earned by THREE catches in one day (D-60, D-115, D-116): a row read as done because the thing underneath it was (SCHEDULER #2 + BOB #17, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`, the law this gate is an arm of, with `WORK-PIPELINE.md`'s P1–P5 … (whole text: the cut archive)
depends-on: none.
accepts-when: a row depending on a construct `status.mjs` reads ABSENT fails the plan NAMING both; one whose substrate is BUILT passes; **a row naming substrate only in prose is UNJUDGED** … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #2 (D-404's fix, ruled by BOB #17).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «LED-9» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-115 · queued — **`corpuscheck.test.mjs` §5 REQUIRES THE LINE `| D-388 |` IN THE LIVE `DEBT.md`, SO THE LED-7 BATCH THAT MOVES D-388, BY ANY** … (whole text: the cut archive)
order: behind the product rows, with the ledger tooling after LED-9 (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*): it unblocks one fold move, D-388's, a question with BOB, so nothing runnable waits on it; it MUST land before the batch that moves D-388 (SCHEDULER #13, 2026-09-22; M0-109's DELEGATION, item 1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a suite is evidence only where it can … (whole text: the cut archive)
depends-on: none.
accepts-when: the arm passes with D-388 open in DEBT and with D-388 moved to the backlog under its own id, and fails by name with D-388 archived closed while the UNDECIDED set is non-empty. … (whole text: the cut archive)
added: 2026-09-22 · SCHEDULER #13 (M0-109's DELEGATION to SCHEDULER, item 1; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #13 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-115» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-107 · queued — **THE INSTALLER HAS NO SCRIPTED DEPLOY.** `newgroup/DEPLOY.md` documents a dashboard paste of the bundled module, which records … (whole text: the cut archive)
order: with the preventive instruments, after LED-9: DIST's law reads the installer back BY HAND at every cut (`kickoffs/DIST.md` step 9: the embedded version, and `bindings: []` still empty), so nothing ships unverified today; the script moves it from discipline to instrument (SCHEDULER #6, 2026-09-21, LED-7 batch 15)
milestone: M7
interface: I4 — the release artifact's deploy path; the integrator classifies it.
design: `docs/architecture/BIO_Distribution_v0_1.md` §6, the deploy-to-serve ladder — *every rung read back … (whole text: the cut archive)
depends-on: none.
accepts-when: a deploy whose read-back differs from the signed bytes, carries another version or shows any binding reports FAILURE by name; a clean one reports the hash it read. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 15; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-107» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-211 · queued — **DIST's GATE STEP 8 SAYS `op=audit` CLEAN, AND ON A RECORD PAST 200 DOCUMENTS A CLEAN FIRST PAGE SATISFIES THAT WORDING.** `op=audit` answers one page (`checked` is the page size, `cursor` non-null means more; REC-57); `kickoffs/DIST.md` step 8 (re-read on `b5ce975a`) reads only *"`op=audit` clean."* Latent until an instance passes 200 documents. — owner DIST (its own kickoff).
order: behind the product rows with DIST's instruments, directly after D-107: preventive wording, latent today (biosmoke7 holds fewer than 200 documents), so it neither cuts gate time nor unblocks product (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #15, 2026-09-23, LED-7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): verify by the positive artifact — a clean audit is every page clean, not the first.
depends-on: none — REC-57's `cursor` and `total` are on `main`.
scope: step 8 reads: `op=audit` walked to a null `cursor`, every page clean (D-200's known findings named), with the pages and `total` stated in the report. DIST's own act; CONDUCT routes it to DIST and briefs no worker.
accepts-when: DIST's next cut report states the audit's pages and `total` and a null final cursor.
added: 2026-09-23 · SCHEDULER #15 (LED-7; D-211's DEBT row of 2026-08-05; keeps its `D-` id).

### D-438 · queued — **THE DEC-49 GUARD'S REAL-TREE CONTROL HARNESS `civicos-ui/test/refusal-codes.control.mjs` IS RED: FOUR ARMS FAIL THAT ARE NOT** … (whole text: the cut archive)
order: behind the product rows, FIRST of the instrument cluster, which follows in its prior order (Bob, 2026-09-22, `CLAUDE.md` §2: *process is overhead*: no battery runs a `.control.mjs`, so repairing one cuts no gate time and unblocks no product; SCHEDULER #12); with M0-93: a control red on a green `main` measures nothing, D-355's class (SCHEDULER #7, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), the section … (whole text: the cut archive)
depends-on: none. D-254 corrected (n2) at `cac06ae7`.
accepts-when: the harness runs to its foot with every arm AS DECLARED, each re-declaration dated at its site. How a liar passes it: re-pinning (r2)/(r6) to whatever prints, so the two … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-438» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-102 · queued — **THREE INSTRUMENTS PASS WHERE THEY SHOULD FAIL.** (1) `bio-plane/scripts/coverage.mjs`: `REGISTER_FLOOR` and `FLEET_FLOOR` … (whole text: the cut archive)
order: directly after D-438, the DEC-49 guard's controls: (3) is a control measuring nothing, D-438's class; (1) and (2) are M0-79's doctrine one file over (SCHEDULER #8, 2026-09-21; CONDUCT #10's routes)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with M0-79's `SLACK` table in the guard … (whole text: the cut archive)
depends-on: none — M0-79 is on `main`.
accepts-when: slack in a coverage floor exits non-zero naming it; an untracked file cannot hide a fall of `r3Fed`; `nc-rec64.mjs` runs every arm AS DECLARED. How a liar passes it: gating … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #8 (verified at the code; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-102» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-93 · queued — **`bio-plane/test/delegations.control.mjs` IS RED ON `main`: ITS A1 AND A6 ASSUME ONE AFFIRMATION LINE PER DELEGATION BLOCK, AND** … (whole text: the cut archive)
order: with D-438, first of the instrument cluster: a control red on a green `main` (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with its M0-51 rule: *never rename a … (whole text: the cut archive)
depends-on: none.
accepts-when: the control reads every arm AS DECLARED on `main` with the two-line block in place, and leaves the tree byte-identical. How a liar passes it: deleting the older line, so the … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-93» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-123 · queued — **`pipeline-readers.control.mjs`'S PLANT ARMS WRITE INTO A POINTER, SO THEIR PLANTED ROWS ARE INVISIBLE AND THE CONTROL MEASURES NOTHING.** Since M0-110 `docs/development/BACKLOG.md` on `main` is a 219 B `COORD-POINTER:` line; the control appends ZZ-41..ZZ-45 to it (its 200 B floor passes), and `readState` follows any file that BEGINS with the tag (`isPointer`, `tools/coord.mjs`) to `origin/coord`, so no reader sees a plant (verified at the code on `c5c83dc4`; M0-119's worker's finding). — owner M0.
order: with the instrument cluster, directly after M0-93: a control that cannot fail, D-438's class; behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #14, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a control is evidence only when it fails at a named assertion; with `TREE-SHARING.md` §1's reading layer (`BIO_COORD_REF` names a planted ref).
depends-on: none — M0-110 is done.
scope: the control plants through a local ref named by `BIO_COORD_REF` (as `coord.test.mjs` does), never the working tree's pointer, and asserts before arming that the file it plants into is not a pointer.
accepts-when: every PLANT arm reads AS DECLARED, each failing by name with its plant in place, and the tree is byte-identical after. NEGATIVE CONTROL: plant into the pointer again, and the new not-a-pointer assertion fails by name.
added: 2026-09-23 · SCHEDULER #14 (M0-119's worker's finding via CONDUCT #14, verified at the code; `node tools/mintid.mjs M0`).

### M0-124 · queued — **THREE CONTROL ARMS DIE ON THE BASE ITSELF SINCE REC-167: `case-edition-conclusion.control.mjs` (d) and (e) and `caselifecycle.control.mjs` (c).** C-65.1 (`CASE_CONCLUSION_MOVED`) now refuses each fixture's ratification before the arm's break is reached, so the arms fail for a reason unrelated to what they declare. D-442's worker's finding, fix named (CONDUCT #14). — owner M0.
order: with the instrument cluster, directly after M0-123: controls that fail on an unbroken subject measure nothing, D-438's class; behind the product rows (SCHEDULER #14, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): *break only the thing* — a control that moves a second variable refutes nothing.
depends-on: none — REC-167 is on `main`.
scope: re-aim each arm to break only `op=publish`'s use of the conclusion reader, with a fixture whose ratification C-65.1 admits.
accepts-when: each of the three arms reads AS DECLARED: green unbroken, failing by name when armed; the files byte-identical after. NEGATIVE CONTROL: arm each against the unbroken base, and it stays green.
added: 2026-09-23 · SCHEDULER #14 (D-442's worker's finding via CONDUCT #14; `node tools/mintid.mjs M0`).

### D-424 · queued — **`nc-mk4.mjs`'S `machinewide` ARM ANCHORS ON `gate.member == null) return false;`, WHICH NO LONGER EXISTS IN `src/`, SO BOB #14'S VISIBILITY RULING HAS NO LIVE CONTROL.** The rule moved into `Store#leadReach` at REC-129 and REC-132 (`#positionalMember`; `who == null` returns null); the arm's anchor (`bio-plane/test/nc-mk4.mjs`, re-read on `619dfa65`) matches 0 times in `bio-plane/src/`, so the arm cannot arm, and `lead.test.mjs`'s `NEGATIVE CONTROL:` line still records it as run AS DECLARED on 2026-09-18. — owner M0 with RECORD.
order: with the instrument cluster, directly after M0-124: a control that cannot arm measures nothing, D-438's class; behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #15, 2026-09-23, LED-7 batch S15-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a control is evidence only when it fails at a named assertion; *break only the thing*.
depends-on: none — REC-129 and REC-132 are on `main`.
scope: re-point the arm at `#leadReach`'s rule (widen the machine read to unfiltered where `who == null`), assert each anchor matches exactly once before arming, re-run the arm, and re-date `lead.test.mjs`'s `NEGATIVE CONTROL:` line with the result.
accepts-when: the `machinewide` arm reads AS DECLARED, failing by name on the member-token and organisation-key arms; the tree is byte-identical after. NEGATIVE CONTROL: restore the stale anchor, and the match-once assertion fails by name.
added: 2026-09-23 · SCHEDULER #15 (LED-7 batch S15-1; D-424's DEBT row of 2026-09-18, verified at the code; keeps its `D-` id).

### M0-94 · queued — **`bio-plane/test/m025-arm-census.mjs` PRINTS AN `UNCLASSIFIED` DRIVER, ONE EXITING NON-ZERO WITH NO PHRASE ITS MATCHER KNOWS** … (whole text: the cut archive)
order: directly after M0-93 and D-438, the two drivers it would turn red on landing: a gate that reports where it should fail cannot fail, M0-79's doctrine on the census side (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the census's own D-333 and M0-78 … (whole text: the cut archive)
depends-on: M0-93, D-438.
accepts-when: a fixture driver exiting 1 with an unknown phrase turns the census exit 1, naming it; the population is stated. How a liar passes it: teaching the matcher the fixture's phrase … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-94» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-380 · queued — **ON A FRESH WORKTREE `ocr-worker`'S SUITE IS SILENTLY UNRUN WHILE THE BATTERY READS GREEN, AND ITS SKIP GIVES A REMEDY THAT** … (whole text: the cut archive)
order: with the instrument cluster, directly after M0-94: a gate reading green over a suite that did not run, M0-79's doctrine on the fleet side; below M0-94 because the `fleet:` line names the dark member on every run (SCHEDULER #10, 2026-09-21, LED-7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `MEASUREMENTS.md` M-31 §6: the … (whole text: the cut archive)
depends-on: none.
accepts-when: with only `bio-plane/` installed, the battery runs every fleet suite and names no member dark; a member that truly cannot resolve is told a remedy that works for it. How a liar … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #10 (LED-7; D-380's DEBT row of 2026-09-16, verified at the code; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-380» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-427 · queued — **THE UI HARNESS RUNNER JUDGES A SUITE BY ITS EXIT STATUS ALONE, SO A UI SUITE THAT PRINTS A FAILURE AND EXITS 0 READS `PASS`.** `civicos-ui/test/run.mjs` (re-read on `619dfa65`) prints `PASS` whenever `execFileSync` returns; M0-67's cross-check in `bio-plane/scripts/battery.mjs` (a printed failure with exit 0 is RED, `EXIT/TALLY DISAGREE`) never reached the UI estate. Latent (no UI suite is known to do it), but M0-126 will cache a unit's PASS, so a false one would stop re-running. — owner M0 with UI.
order: with the instrument cluster, directly after D-380: a gate reading green over a suite that failed, M0-79's doctrine on the UI side; below D-380 because no UI suite is known to print a failure and exit 0 (SCHEDULER #15, 2026-09-23, LED-7 batch S15-1)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): verify by the positive artifact, never the absence of an error.
depends-on: none — M0-67's cross-check is on `main`.
scope: `run.mjs` reads each suite's printed tally and fails a suite whose tally reports a failure while it exits 0, naming it `EXIT/TALLY DISAGREE` as `battery.mjs` does, through ONE shared reader rather than a copy.
accepts-when: a planted UI suite printing one failure and exiting 0 turns the harness red naming it; every real suite still reads as today. NEGATIVE CONTROL: drop the tally read, and the planted arm reads PASS and fails by name.
added: 2026-09-23 · SCHEDULER #15 (LED-7 batch S15-1; D-427's DEBT row of 2026-09-18, verified at the code; keeps its `D-` id).

### M0-129 · queued — **`civicos-ui/test/bound-sweep.test.mjs`'S METHOD-HEAD PATTERN SKIPS `async` METHODS, SO AN ASYNC OP'S BOUND IS NEVER SWEPT.** `methodBodies` matches `^ {2}(?:static\s+)?name(` (re-read on `cdfaea39`); an `async` method has no head, so its body is folded into the method above it. Found by D-85's worker (CONDUCT #15). — owner M0 with UI.
order: with the instrument cluster, directly after D-427: a sweep blind to a class of method, M0-79's doctrine; latent, since no swept op is known to be missed today (SCHEDULER #15, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a check is evidence only where it can fail.
depends-on: none.
scope: admit `async\s+` (and `static async`) in the head pattern; state which ops, if any, newly enter the sweep and their verdicts.
accepts-when: a planted `async` method with an unbounded read is found and fails by name; every existing verdict unchanged or its move attributed. NEGATIVE CONTROL: drop the `async` alternative, and the planted arm reads clean and fails by name.
added: 2026-09-23 · SCHEDULER #15 (D-85's worker's finding via CONDUCT #15; `node tools/mintid.mjs M0`).

### M0-80 · queued — **FOUR REFUSAL CODES ARE PINNED GREEN BY ABSENCE RATHER THAN BY AGREEMENT** — the plane sends a canned `translation` for … (whole text: the cut archive)
order: with the instrument cluster and NOT beside UI-73, though they were routed together. A fixture narrower than the wire is a check that cannot fail — M0-78's doctrine exactly — whereas UI-73 is a surface correction. CLAUDE.md §5: an equality that costs nothing to produce is not evidence (SCHEDULER #3, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a suite is evidence only where it can … (whole text: the cut archive)
depends-on: none. Measured in `docs/development/MEASUREMENTS.md` M-72 (UI-72, 2026-09-19).
accepts-when: each of the four pins DISAGREES with the plane when the translation is wrong, proved by feeding a wrong one; the narrower-than-wire count is printed per suite and floored. How … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's routed item 4; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-80» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-92 · queued — **`tools/rowdesign.mjs` PASSES A DESIGN POINTER TO A FILE THAT DOES NOT EXIST.** `citations()` drops a full `docs/…md` path … (whole text: the cut archive)
order: with the instrument cluster, after M0-80 and above M0-87: a check that PASSES where it should fail — CLAUDE.md §5's costs-nothing green — where M0-87 is a false WARN; latent today (0 dead paths across `QUEUE.md` and `BACKLOG.md`, measured 2026-09-21) (SCHEDULER #6, 2026-09-21; the D-339 worker's DELEGATION item 4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header: it cannot … (whole text: the cut archive)
depends-on: none.
accepts-when: a fixture row citing a wrong directory is reported dead by name; the right full path still passes; a bare unique basename still resolves. How a liar passes it: dropping the … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #6 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-92» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-437 · queued — **REC-76's VERDICT READER SAYS IT READS EVERY BOOLEAN-PRODUCING OPERATOR, AND READS SIX: `<=`, `>=`, `instanceof` and `in` are** … (whole text: the cut archive)
order: with the instrument cluster, after M0-92: a reader blind to an operator class but latent, a `gap` as its row classifies it (D-378's precedent), so below the controls red today (SCHEDULER #7, 2026-09-21; the D-254 worker via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), the section … (whole text: the cut archive)
depends-on: none. **Sequence after D-438**: the guard's harness reads the reader's figures.
accepts-when: each operator's reading passes; each moved figure is attributed to the print it came from. How a liar passes it: a floor nudged to fit, so every move cites its print. NEGATIVE … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-437» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-87 · queued — **`tools/rowsubstrate.mjs` SCORES A ROW WHOSE EVERY CITED ANCHOR IS UNRESOLVABLE AS UNCOVERED, so `plancheck` prints a false** … (whole text: the cut archive)
order: with the instrument cluster, after M0-80: an instrument claiming about what it cannot see, the class the cluster closed three of (CONDUCT #8's DELEGATION 2026-09-20 item 2); a WARN, and latent, so below the rows that hide a failure (SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header … (whole text: the cut archive)
depends-on: none.
accepts-when: a fixture row whose only anchor is a bold paragraph is UNJUDGED or judged at document level, never a finding; a row whose resolved section lacks every symbol still is one. How … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #12 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-87» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-88 · queued — **`caseproduction.control.mjs` ARM (H) NOW DRIVES THE PARTICIPATION FENCE, NOT THE COMMIT IT DECLARES.** It forges the committed … (whole text: the cut archive)
order: with the instrument cluster, after M0-80: a control proving less than it declares — a second defect in a control the cluster repaired (CONDUCT #8's DELEGATION 2026-09-20 item 3; SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a control is evidence only when it FAILS at a … (whole text: the cut archive)
depends-on: none.
accepts-when: the arm reaches the commit; §8's arm fails BY NAME while the four named act-side refusal arms stay green; the control leaves the tree byte-identical. How a liar passes it: a joined project … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-88» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-89 · queued — **`D384_STAYS` WAS MEASURED WHILE `*eachImage` WAS INVISIBLE, so the hand-admitted compensation for the walk's helper blind spot*** … (whole text: the cut archive)
order: with the instrument cluster, after M0-80: D-414's named residue (*"a row of its own and is reported rather than taken here"*, at the census in `derivation-bounds.test.mjs`); an undercount a ratchet cannot catch (CONDUCT #8's DELEGATION 2026-09-20 item 4; SCHEDULER #4, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-384 (`node tools/ledger.mjs find` … (whole text: the cut archive)
depends-on: none. **Same file as M0-44** — one worker at a time.
accepts-when: `eachImage` carries a verdict in `D384_STAYS` or `D384_LEAVES` with its reason; the class figure is taken from a printed run, its delta attributed. How a liar passes it: a verdict with no … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-89» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### D-439 · queued — **TWO MORE SHARED MECHANISMS ARE HAND-KEPT COPIES, NEITHER PINNED.** (1) A READER: `stripComments`, `quotedIn`, `literalsOf`, … (whole text: the cut archive)
order: after M0-89, the instrument cluster's end: copies that agree today, the drift a pin would catch, so debt and not a live defect (SCHEDULER #7, 2026-09-21; the D-254 worker via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with D-254's single-homed verdict reader … (whole text: the cut archive)
depends-on: none.
accepts-when: four suites import one reader, three derive their list, every suite's tally unchanged. How a liar passes it: a renamed second copy, so the pin extracts by behaviour. NEGATIVE CONTROL: add a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; the D-254 worker's DEBT row; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-439» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-95 · queued — **34 CONTROL DRIVERS LEAVE THEIR PEN IN THE TREE WHEN A RUN FAILS: `nc-rec95.mjs` and `nc-rec129.mjs` never remove theirs, and 32** … (whole text: the cut archive)
order: after D-439, closing the instrument cluster: residue a failed control leaves, a second variable in the next run (CLAUDE.md §5: *break only the thing*), not a false measurement (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), its driver law (the D-331 section): … (whole text: the cut archive)
depends-on: none. Sequence with M0-96: whichever lands second re-reads the first.
accepts-when: each fixed driver, forced to exit non-zero, leaves no pen and a clean `git status`. How a liar passes it: removing on exit 0 only, so the forced-red arm is required. NEGATIVE CONTROL: drop … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-95» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-96 · queued — **TWO CONTROL DRIVERS INSTALL SIGINT/SIGTERM/SIGHUP HANDLERS OVER SYNCHRONOUS CHILDREN, SO A STOP SIGNAL WAITS FOR THE END OF THE** … (whole text: the cut archive)
order: directly after M0-95, the same class, a driver's behaviour on an abnormal exit; last of the cluster, because the run still restores, late (SCHEDULER #7, 2026-09-21; D-355's route via CONDUCT #10)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), its driver law (the D-331 section): … (whole text: the cut archive)
depends-on: none. Sequence with M0-95.
accepts-when: each driver SIGTERMed mid-arm exits promptly with its subjects byte-identical by sha256 and `cmp`. How a liar passes it: removing the handlers, so the SIGTERM arm asserts the restore. … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #11 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-96» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-77 · queued — **`tools/mintid.mjs`' MAIN-GUARD COMPARES `resolve(process.argv[1])` WITH `import.meta.url`, WHICH NODE REALPATHS — so `mintid`** … (whole text: the cut archive)
order: first of the queued M0 rows: a silent exit 0 in the id allocator every lane uses is a costs-nothing green (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — tools' entry guards
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): *verify by the positive artifact, never … (whole text: the cut archive)
depends-on: none.
accepts-when: `mintid` run through a symlinked path prints its MINTED line and exits 0, and one run through a path that is not the script exits non-zero or prints nothing BY DESIGN, stated … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (M0-73's worker's finding via CONDUCT #6; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-77» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-118 · queued — **SIX LIVE-VERIFICATION HELPERS READ THE KEYS ONLY FROM A `.env` FILE, SO IN THE CLOUD, WHERE THE KEYS ARE ENVIRONMENT VARIABLES** … (whole text: the cut archive)
order: first of the live verifications, directly before M0-68, M0-69 and M0-70, which run through `vf4-call.mjs`' loader; it pays only once the cloud's network admits `*.workers.dev` (M-99), so it neither cuts gate time nor unblocks product today and sits behind the product rows (Bob, 2026-09-22, `CLAUDE.md` §2) (SCHEDULER #14, 2026-09-22; BOB #28's inbox entry, item 2)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `CLAUDE.md` §8: secrets are the … (whole text: the cut archive)
depends-on: none — `loadEnv()` in `fl1-billing-surface-check.mjs` reads `process.env` first and a `.env` found upward second.
accepts-when: each helper, run with the keys in the environment and no `.env`, reaches its first call. NEGATIVE CONTROL: restore `vf4-call.mjs`' file-only read, and that arm fails by name.
added: 2026-09-22 · SCHEDULER #14 (BOB #28's inbox entry, item 2, drained this commit; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #14 (2026-09-22, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-118» in `docs/archive/ledgers/QUEUE-cut-2026-09-22.md`. A worker READS IT before building.

### M0-68 · queued — **`bio-plane/test/vf4-live-scratch.mjs` ARM 4b-ii STILL ASSERTS D-323's REFUSAL, and D-323 is CLOSED: against any current plane** … (whole text: the cut archive)
order: M0, right after the battery tally: an instrument asserting a closed defect fails against every current plane — a correction to a superseded test (SCHEDULER, 2026-09-18)
milestone: M0 (background lane, holds no slot)
interface: none — a live-scratch instrument's arm; no plane source moves
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with the file's own DATED NOTE of … (whole text: the cut archive)
depends-on: none (D-323 done).
accepts-when: arm 4b-ii passes against the current plane with the new spelling asserted and NO refusal, or is retired with W8 named as its successor; the dated note records which, and why … (whole text: the cut archive)
added: 2026-09-18 · SCHEDULER (FLEET's measurement of 2026-09-19, routed by CONDUCT #5; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-68» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-72 · queued — **`mergecarry.control.mjs` ARM 5 REPORTS A FALSE FAIL: its declared mustFail name "the register is the three the sweep found" no** … (whole text: the cut archive)
order: M0; a negative control reporting a false FAIL, with M0-68's class of test corrections (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a control driver
design: `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none.
accepts-when: `node bio-plane/test/mergecarry.control.mjs` reads all 7 arms AS DECLARED; the control leaves the tree byte-identical; `node tools/plancheck.mjs --local` then BARE. How a liar … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (BOB #16's message; the fix was named).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-72» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-74 · queued — **`bio-plane/test/curated-producer.probe.mjs` FAILS 9/1 ON `main`: it reads the severance check from `#restsOnLive`'s** … (whole text: the cut archive)
order: M0; a probe failing on main for a moved check, with the other instrument corrections (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a probe's source read
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-267 (`node tools/ledger.mjs` … (whole text: the cut archive)
depends-on: none.
accepts-when: `node bio-plane/test/curated-producer.probe.mjs` from `bio-plane/` reads 10 pass, 0 fail; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: widening the read … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (CONDUCT #6's report; fix named; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-74» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-133 · queued — **`tools/fw21-onpoint-probe.mjs` EXITS 2 (`GROUND BROKEN`) ON `main`: ITS OWN CHECK STILL EXPECTS PAGE 2 TO READ GRADE A AND REACHING, WHICH REC-120's RULE NO LONGER GIVES.** Reproduced by SCHEDULER #15 on `91913d6b` (local, no network): page 2 reads `{"grade":null,"reaching":0,"undetermined":1}` — UNDETERMINED until a member chooses the on-point mention (REC-120; REC-122 is that choice) — so the probe's ground check fails before anything it measures counts. Already so on `4355bfda`. Found by REC-171's worker (CONDUCT #15). — owner M0 with CONTENT.
order: with the probe corrections, directly after M0-74 (a probe failing on `main` for a moved rule, its class): a probe, never a gate unit, so it cuts no gate time and sits behind the product rows (SCHEDULER #15, 2026-09-23)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `docs/architecture/BIO_Content_Framework_v0_10.md` §14.5 (the connection pair; REC-120's undetermined answer until a member chooses).
depends-on: none — REC-120 is on `main`.
scope: re-base the probe's ground check on REC-120's rule: page 2 reads UNDETERMINED with no choice made, and reaches only after the probe makes the member's on-point choice (when REC-122 exists) or states that it cannot; page 7 stays `outside`; a dated note at the site.
accepts-when: `node tools/fw21-onpoint-probe.mjs` exits 0 on `main` with page 2 read as UNDETERMINED and page 7 `outside`, and exits 2 if page 7 is ever reached. NEGATIVE CONTROL: restore the grade-A ground check, and the probe exits 2 by name.
added: 2026-09-23 · SCHEDULER #15 (REC-171's worker's finding via CONDUCT #15, reproduced; `node tools/mintid.mjs M0`).

### M0-90 · queued — **MK-1's PUBLISH PROBE CANNOT DRIVE ITS PATH 3, the `op=caseratify` route C-53.12 fences.** Its fixture concludes without naming … (whole text: the cut archive)
order: with M0-74, the probe corrections: a probe path that cannot run, now stated rather than hidden; the measurement a lifted fence will need (SCHEDULER #4, 2026-09-21; MK-3's report, CONDUCT-NEXT §4)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with … (whole text: the cut archive)
depends-on: none.
accepts-when: `node bio-plane/test/mk1-publish-probe.mjs` prints PATH 3 driven, with C-53.12's refusal code, and no DEAD ARM line for it. How a liar passes it: a path reported driven that … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #4 (`node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-90» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-91 · queued — **NO SUITE FEEDS C-2.8 A NON-STRING `content_id`, SO THE ARM THAT CLOSED D-362 HAS NEVER BEEN DRIVEN.** `checkLegExtentGrammar` … (whole text: the cut archive)
order: with the M0 instrument corrections (M0-74, M0-90): a fix with no arm is one refactor from being undone, and what it guards is a SILENT drop (SCHEDULER #5, 2026-09-21)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name) — a check is evidence only where a suite … (whole text: the cut archive)
depends-on: none.
accepts-when: the leg is refused BY NAME at C-2.8 with the parse in the path, and the existing string arms stay green. How a liar passes it: a hand-built leg whose `content_id` is already a … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #5 (LED-7 batch 10, D-362's instrument; `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-91» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-40 · queued — **AN INFORMATION FIXTURE STILL WRITES `criticality: "notable"`, WHICH C-2.7 REFUSES, THOUGH ITS ROW SAID IT WAS FIXED.** … (whole text: the cut archive)
order: with the probe corrections, after M0-91: a fixture non-conformant for a reason unrelated to what it measures, and a template a later session can copy; no suite is wrong today (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §5's *break only the … (whole text: the cut archive)
depends-on: none.
accepts-when: `cite-scale.mjs` builds only conformant Information (C-2.7 passes over its bundles), and each of the three data sites carries its comment. How a liar passes it: changing the … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-40's DEBT row of 2026-07-25, re-measured; keeps its `D-` id).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-40» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-75 · queued — **`bundle.test.mjs` AND `livefire.test.mjs` PRINT NO TALLY LINE, so every battery headline carries M0-65's "EXCLUDES 2 untallied suite(s)"** … (whole text: the cut archive)
order: M0; M0-65 is ON MAIN (5a6d5913), so runnable: retires its EXCLUDES segment (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — two suites' report lines
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with D-413 (closed by M0-65) and … (whole text: the cut archive)
depends-on: M0-65 (its EXCLUDES segment and widened tally reader; in CONDUCT #6's gate).
accepts-when: a full battery's headline carries no EXCLUDES segment, and its assertion total rises by exactly the two suites' printed tallies, stated in the landing; `cd bio-plane && npm` … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (M0-65's worker's suggestion, routed by CONDUCT #6; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-75» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-76 · queued — `d280-strengthbar.control.mjs` READS NOT AS DECLARED ON EVERY RUN (arm C2 and the severedhomes arms), and D-280's site (a) — the … (whole text: the cut archive)
order: M0, with the instrument corrections; ruled by BOB #16 (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — a control driver and one suite's arm
design: `docs/development/VERIFICATION.md` (admitted for M0 by name; its one-copy rule), with D-267 and D-280 … (whole text: the cut archive)
depends-on: none.
accepts-when: `node bio-plane/test/d280-strengthbar.control.mjs` reads EVERY arm AS DECLARED and the site-(a) arm fails by name; the control leaves the tree byte-identical; the C-6.1 … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-76» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-69 · queued — A WHOLE-STORE PURGE OF THE SCRATCH STORE CLEARS THE IDENTITY TABLES; A PURGE OF THE RECORD STORE NEVER DOES, structurally (BOB … (whole text: the cut archive)
order: M0, after the battery tally and M0-68: a live verification whose scratch keeps member rows stops measuring the same subject twice (SCHEDULER, 2026-09-19)
milestone: M0 (a live verification that stops measuring the same subject twice is the verification defect)
interface: I3 — behaviour at scratch only; an IC if the op's published answer changes (the integrator classifies)
design: `docs/architecture/BIO_Distribution_v0_1.md` §6 rung 6, "What 'swept after' means" (BOB #16, folded … (whole text: the cut archive)
depends-on: none in code.
accepts-when: a scratch purge leaves every enumerated identity table empty; a record-store purge driven through the op leaves `members` byte-identical; a new member-keyed table added to the … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-69» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-70 · queued — **VF-4's LIVE-SCRATCH INSTRUMENT STATES ON ITS OWN OUTPUT THAT ARM 2a LEAVES A `proposed` MEMBER BY DESIGN (Membership v2 §4.7)** … (whole text: the cut archive)
order: M0, after M0-68 and M0-69: the same instrument file as M0-68, and its purge-after rests on M0-69 (SCHEDULER, 2026-09-19)
milestone: M0 (background lane, holds no slot)
interface: none — the instrument `bio-plane/test/vf4-live-scratch.mjs`
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.7 (administrator consensus) and … (whole text: the cut archive)
depends-on: M0-69 (the purge must take scratch identity) and M0-68 (SAME FILE — one worker at a time in `vf4-live-scratch.mjs`).
accepts-when: a run's output carries the statement at arm 2a; after the run, scratch `members` reads empty; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: a purge call … (whole text: the cut archive)
added: 2026-09-19 · SCHEDULER (BOB #16's inbox entry, item 3; id minted with `node tools/mintid.mjs M0`).
cut: cut to its fields by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-70» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### VF-7 · queued — CANNOT RUN until the next DIST deploy; queued now so the future act is an ITEM the deploy's integration meets, not a telling a … (whole text: the cut archive)
order: M0 VERIFY lane, after the battery tally: it watches a credential class (DEC-43's zero), now a read-back since the 0.58.0 deploy armed it (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (VERIFY lane, holds no slot)
interface: none — it watches, it does not publish a shape
design: `docs/development/SCHEDULER.md` §"The mechanism, and how the next consumer joins" (the … (whole text: the cut archive)
depends-on: **the next plane deploy through `deploy.mjs`** (DIST's next cut — D-297's release is the likely carrier)
accepts-when: (on the deploy landing) both first activations measured and recorded with the serving build named; the first armed tick attributed to the scoped class; `op=audit` clean after … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «VF-7» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-92 · queued — **`op=file` WITH A MEMBER TOKEN RETURNED AN INTERMITTENT 403 UNDER SEQUENTIAL LOAD** (the live instance, July): a different … (whole text: the cut archive)
order: last of the live verifications, after D-207: a July observation on a plane rebuilt many times since, with no report of recurrence; a bounded measurement that names a cause or retires the claim (SCHEDULER #6, 2026-09-21, LED-7 batch 11)
milestone: M0
interface: none — a probe; a fix it finds is its own row
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with CLAUDE.md §5: *a blocker is a … (whole text: the cut archive)
depends-on: none.
accepts-when: `MEASUREMENTS.md` carries the probe with its load, its count and the build; the row closes either way. How a liar passes it: a probe lighter than July's, so the load is stated beside the row's.
added: 2026-09-21 · SCHEDULER #6 (LED-7 batch 11; keeps its `D-` id).
cut: cut to its fields (SCHEDULER #8, 2026-09-21) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-92» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### D-59 · queued — **`contemporaneous`, THE STRONGEST LINK-FIDELITY VERDICT, HAS NEVER BEEN OBSERVED ON REAL DATA, AND MAY BE UNREACHABLE FOR MOST** … (whole text: the cut archive)
order: with the live verifications, after D-92: a measurement deciding whether a verdict arm earns its complexity, not a defect shipping, since `undetermined` is honest meanwhile (SCHEDULER #7, 2026-09-21, LED-7)
milestone: M3
interface: none — a probe
design: `docs/development/LINK-FIDELITY.md`, which defines the verdict and names the establishing routes that … (whole text: the cut archive)
depends-on: none.
accepts-when: `MEASUREMENTS.md` carries the per-host table with N, the interval and the build; the row closes either way. How a liar passes it: hosts chosen for static bytes, so the list … (whole text: the cut archive)
added: 2026-09-21 · SCHEDULER #7 (LED-7; D-59's DEBT row of 2026-07-30; keeps its `D-` id).
cut: cut to its fields (SCHEDULER #8, 2026-09-21) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «D-59» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-66 · queued — `m025-arm-anchor-witness.test.mjs` CLOSES THE COMMENTARY CLASS ON ITS LABEL HALF AND NOT ON ITS ANCHOR HALF — prose in a … (whole text: the cut archive)
order: M0; an instrument producing false findings (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — an instrument that penalises a driver for documenting how it … (whole text: the cut archive)
interface: none — `bio-plane/test/m025-arm-anchor-witness.test.mjs`
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY … (whole text: the cut archive)
depends-on: none
accepts-when: prose in a block comment naming an anchor-bearing shape is NOT read as an anchor; a live anchor in code still is; the reach figures before and after are stated with any … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-66» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-64 · queued — M0-41's CONTROL ARM 3 NO LONGER HAS A SUBJECT:
order: M0; a control arm proving less than it declares (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — an arm that measures something other than what it declares … (whole text: the cut archive)
interface: none — `bio-plane/test/m041-instrument-census.control.mjs` (a `.control.mjs`, not discovered by the battery)
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY … (whole text: the cut archive)
depends-on: none
accepts-when: the control's run reports every arm AS DECLARED, or arm 3 is RETIRED with the falsifier's measurement at the site; the planted id uses the target's real heading shape; arms 1 … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-64» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-44 · queued — FLIPPED TO `running` AND REVERTED WITHIN THE HOUR, 2026-09-17, by CONDUCT #1, and the reversal is recorded rather than silently undone.
order: M0; seven truncated claims invisible to the bounds instrument (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot)
interface: none — a reader's pattern and the rosters derived from it; no plane source moves
design: `docs/development/VERIFICATION.md` — the test estate's own authority, admitted for the M0 lane BY … (whole text: the cut archive)
depends-on: none (M0-38 landed the grading and pinned the blind spot rather than fixing it)
accepts-when: each of the seven previously-invisible claims appears in a roster the instrument prints, or is named as out of reach with its reason; **every roster the widened pattern feeds** … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-44» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### M0-33 · queued — D-353 RULED at M0-29's integration (CONDUCT #11, mechanism):
order: M0; a third census shape (SCHEDULER, 2026-09-18, re-ordered at the lift of the M0 hold)
milestone: M0 (background lane, holds no slot) — the test estate's own instrument
interface: none — control drivers and the census only
design: `docs/development/VERIFICATION.md` §"A THROWING CONTROL DRIVER VALIDATES EVERY ANCHOR BEFORE IT ARMS ANYTHING (D-331, 2026-09-14)" … (whole text: the cut archive)
depends-on: none (M0-29 landed the sweep and its adjudication table)
accepts-when: the census reports the sweep's tally section (0 open candidates on the estate as landed, the three retired instances listed as adjudicated); one unadjudicated candidate … (whole text: the cut archive)
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «M0-33» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### SK-5 · blocked — RE-STATED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18):
order: blocked: no plane op publishes the surface registry (SCHEDULER, first order audit, 2026-09-18)
milestone: M9
interface: I3 — **it needs the plane to PUBLISH the surface registry, which nothing does today; that is the** … (whole text: the cut archive)
design: `docs/development/ASSISTANT-PILOT.md` §1 (the five-layer training pack — the **Recipes** row is this … (whole text: the cut archive)
depends-on: a published surface registry (unbuilt). **NOT schedulable until that exists** — recorded so the … (whole text: the cut archive)
accepts-when: (on unblocking) a recipe whose step names a surface or an op that does not exist **FAILS THE BUILD**; the pack's `absent_because` body is replaced by the layer rather than edited around.
cut: cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19) and again by SCHEDULER #9 (2026-09-21, the backlog's 150 KiB budget); the row as it stood before this cut is VERBATIM under «SK-5» in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md`. A worker READS IT before building.

### UI-60 · blocked — RESTORED AT THE FIRST ORDER AUDIT (SCHEDULER, 2026-09-18):
order: blocked: waits on Bob's re-prioritisation of UI (SCHEDULER, first order audit, 2026-09-18)
milestone: M8
interface: none
depends-on: Bob's re-prioritisation of UI (DEC-33's deferral and the 2026-09-15 content direction stand)
accepts-when: the decomposition exists as rows and this pointer is marked superseded naming them.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «UI-60». A worker READS IT before building.
narrowed: 2026-09-23 by SCHEDULER #17 (CONDUCT #17's 22:00Z finding (2), verified at c17-batch5 @ 7c4f6b5f): UI-43's version acts are DRAINED — versionaccept/reject/consider/revert by UI-74's accept ceremony, versionhide by UI-42, versioncurrent by UI-45. Residue still owed: `attesttext` (in `ACTS_AWAITING_SURFACE`, 0 hits in `app.html`), the doorbell ops `inboxget`/`inboxresolve` (0 hits), and U13, U14, expertise/licences and verified export (unchecked: no op to grep).

### REC-15 · blocked
order: blocked: DEC-33's deferral stands (the live publishing route is a human's own session); BOB #14's item 11 also places it after items 2, 5 and 6 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
behind-interface: I3
depends-on: REC-14
accepts-when: (on waking) as `BUILD-ORDER.md` §2 (REC-15) plus — preflight reports `UNCLEARED_HUNCH` naming each hunch leg and … (whole text: the cut archive)
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
cut: this row is cut to its fields (SCHEDULER #8, 2026-09-21, the backlog's 150 KiB budget); its full text, scope included, is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` under «REC-15». A worker READS IT before building.

### UI-17 · blocked
order: blocked: rests on REC-15 (SCHEDULER, first order audit, 2026-09-18)
milestone: M10
behind-interface: I3
depends-on: REC-15, UI-11
accepts-when: (on waking) as `RECONCILED.md` §3.1 (UI-17), including the Q5 negative control — any prior deferral/dismissal/severance … (whole text: the cut archive)
added: 2026-08-01 · BOB · deferred 2026-08-03 per DEC-33
cut: this row is cut to its fields (SCHEDULER #8, 2026-09-21, the backlog's 150 KiB budget); its full text, scope included, is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-21.md` under «UI-17». A worker READS IT before building.

### LED-7 · queued — **SCHEDULER'S OWN ACT, NOT A WORKER SLOT: CONDUCT must never brief a worker into this row, and does not need to ask again (SCHEDULER #2 to CONDUCT #7, 2026-09-19).** **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: MOVED OUT OF THE CACHE to the foot of the plan by SCHEDULER #15, 2026-09-23: it is SCHEDULER's own continuous act and never a worker slot, but P3 counts every cache row, so holding it cached cost CONDUCT one worker (CONDUCT #15's report). It has no build position; the fold runs from here, batch by batch. (Placed first by SCHEDULER, first order audit, 2026-09-18.)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states, EXCEPT the actor — batches of ~20 driven by SCHEDULER ITSELF (Bob, 2026-09-19), never a development slot; a row needing a build goes to CONDUCT under its OWN id. The batch that moves D-388 waits on M0-115 (M0-109's DELEGATION).
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).
