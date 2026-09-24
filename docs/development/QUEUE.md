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
- **2026-09-24 18:30Z · BOB #33 · A DEFECT IN THE LANE LOOP, for one M0 row placed AHEAD of product (it cost 5 of 16 slots, measured):**
  the cache counts ROWS, and a worker that goes quiet (finished without reporting, stuck, or waiting on a question) leaves its row `running`.
  Nothing wakes CONDUCT, so the slot is held with nobody working. Measured at 18:22Z: 9 worker sessions RUNNING against 14 rows marked
  running (D-492, M0-173 and REC-212 idle; D-510 queued with no worker). The rule is now in the kickoffs (CONDUCT.md step 4, BOB.md's stall
  probe; land/bob/batch-0924c). **The row builds the instrument, so it does not rest on a lane remembering:** `tools/slots.mjs` reads a
  `list_sessions` listing on stdin (as `occupancy.mjs` does, in both the cloud's `{ccr:{data}}` shape and the bare array) plus coord's
  QUEUE.md. It prints each row marked `running` with its worker's session status, and names every idle-worker row, every queued row with no
  worker, and the count of RUNNING workers against CACHE_ROWS. Exit 1 when any slot is unworked. Accepts when it names D-492, M0-173 and
  REC-212 on a listing and coord of 18:22Z. NEGATIVE CONTROL: match titles loosely, and a `WORKER D-49` session satisfies D-492, failing
  by name.
- **2026-09-24 18:33Z · BOB #33 · CORRECTION to the 18:30Z idle-slot entry, before it is rowed:** CONDUCT #20 read the three sessions that entry
  names (D-492, M0-173, REC-212). None was stalled: each was waiting on its own background gate, which `list_sessions` reports as IDLE. The
  measured gaps were only D-510 (queued, no worker) and one cache slot unfilled. So `tools/slots.mjs` must NOT treat an IDLE status as a stall.
  It names (a) queued rows with no worker session, (b) an open cache slot, and (c) rows marked `running` whose worker has had no update for
  45+ minutes (the listing's `updated_at`), which are REPORTED for a lane to read, never flipped. Accepts when D-510 and the open slot of 18:22Z are
  named, and the three gating sessions are not. Place it after product, not ahead: the cost measured was 2 slots, not 5.


## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 16 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). **At most 10 worker sessions are live at once** (Bob, 2026-09-24 ~03:08Z, via BOB #32; until 05:00Z, then 6, and no new spawn from 06:00Z): a `running` row whose worker has FINISHED and awaits integration holds no session, so the cache keeps a few `queued` rows behind the live ten and no slot waits. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### M0-140 · integrated — **MOVED TO THE HEAD OF THE CACHE 2026-09-24 by BOB #32 on Bob's instruction, and WIDENED to retire the debt construct entirely.** **DEBT.md LEAVES THE PROCESS: its last three rows (D-313, D-391, D-388) are CLOSED IN FACT on `main` 548eb2c5 and are closed BY this row, Bob's 22:09Z ruling removes it — CLAUDE.md §1/§4, `tools/owed.mjs`, plancheck's DEBT arms, `tools/ledger.mjs`'s DEBT handling, `coord.mjs`'s `LC-debt-*` and `LC-undecided-route` arms, `corpuscheck.test.mjs` §5's D-388 pin, and the kickoffs.** — owner M0 (tools), with BOB for CLAUDE.md and the kickoffs.
status: running — SPAWNED 2026-09-24 ~15:50Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER M0-140 (CONDUCT #20), base origin/main 68fecb8d, on development's RESUMPTION (Bob via BOB #32 15:40Z, cap 10). Falsify rather than believe: a live worker hold… (headline restored by SCHEDULER #18 from coord history; CONDUCT #20's F4)
order: FIRST in the cache (Bob, 2026-09-24 ~15:15Z: "Do it ... once that is done, we can remove all reference to the debt construct"); ahead of the product rows by Bob's word.
milestone: M0
interface: none — process tooling.
design: `docs/development/WORK-PIPELINE.md` §3 (LED-7's end state: DEBT.md at 0, then archived), with `docs/development/VERIFICATION.md`.
depends-on: none (its one prerequisite, land/bob/folds-0924b, is on main at 548eb2c5).
scope: (1) close D-313, D-391, D-388 (dispositions drafted on `scheduler18/row-drafts`: Framework §16 "THREE STATED LIMITS", CONTENT-SEARCH D-391 part 2, CORPUS-STANDARD §6) and retire `DEBT_FLOOR_BYTES` with `nc-m039.mjs`'s planting; (2) archive DEBT.md whole into `docs/archive/ledgers/`; (3) REMOVE EVERY REFERENCE TO THE DEBT CONSTRUCT (Bob, 2026-09-24): every live tool and suite that reads or names DEBT (`owed.mjs`, `plancheck.mjs`, `ledger.mjs`, `coord.mjs` LC-debt-* and LC-undecided-route, `corpuscheck.test.mjs` §5, and the ~57 tool/test files `git grep -il debt` lists — re-point or delete each, stating which), and every live instruction: CLAUDE.md §1 and §4, `kickoffs/*.md`, WORK-PIPELINE, ORCHESTRATION; archives keep their history untouched. (4) THE PROCESS RULE THAT REPLACES IT, stated once in CLAUDE.md §4 and WORK-PIPELINE: a defect found anywhere is diagnosed until its fix can be named, minted `D-` with `node tools/mintid.mjs D`, and sent to SCHEDULER, who places it as a plan row in build order (or to BOB first when the fix needs design); there is no side list. BOB #33 reviews the CLAUDE.md wording before the landing.
accepts-when: `node tools/plancheck.mjs`, the coord ledger checks and the full gate pass with no DEBT.md; `git grep -il "debt"` over live tools, suites, CLAUDE.md, kickoffs and development docs returns only archive pointers, each named in the landing; D-313/D-391/D-388 read done in the ledger archive. NEGATIVE CONTROL: restore one reader, and its arm fails naming the missing file.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs M0`).

### D-497 · integrated — **THE PROJECT DIRECTORY'S CANDIDATE SCAN IS STILL LINEAR IN THE GROUP'S PROJECTS: `#sight` is a JS predicate, so D-479's page bounds the ANSWER but not the rows read.** Found by D-479's worker. — owner RECORD.
status: running — SPAWNED 2026-09-24 ~15:50Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER D-497 (CONDUCT #20), base origin/main 68fecb8d, on development's RESUMPTION (Bob via BOB #32 15:40Z, cap 10). Falsify rather than believe: a live worker holds the branch land/worker/D-497; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone. (headline restored by SCHEDULER #18 from coord history, 2026-09-24 16:2xZ; CONDUCT #20's F4)
order: after D-495: a bound on work, not on disclosure; the answer is already capped (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z)
milestone: M8
interface: none (I5 additive if an index table is added; the integrator classifies).
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (items 7.9, 7.14): one sight rule, never a second copy.
depends-on: D-479 (its train).
scope: give sight a row source it reads (an owner-set-derived index) so the candidate query bounds in SQL, with the sight rule stated once.
accepts-when: `bounds.test.mjs` shows the candidate read bounded. NEGATIVE CONTROL: restore the JS filter over the unbounded scan and the bounds arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### DIST-13 · running — 2026-09-24 ~17:45Z by DIST #6 itself (session_01Vi1XTVwxcBBMStifuBasLZ) on BOB #33's instruction; base origin/main 58293bf3; no release. — **THE INSTALLER'S FALLBACK PLANE IS SEVEN RELEASES STALE: `newgroup/dist/newgroup.bundled.mjs` embeds RELEASE_VERSION 0.71.0 while `newgroup/src/release.mjs` carries signed 0.78.0 (verified at d536f834), and nothing guards the bundle's freshness.** Found by D-481's worker. — owner DIST (M0/FLEET for the guard).
order: after DIST-11, with DIST's rows: an unverified fallback that serves an old plane is a correction to the distribution record (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:21Z)
milestone: M8
interface: none.
design: `docs/architecture/BIO_Distribution_v0_1.md` §5 "The installer" and §3 "The release".
depends-on: none.
scope: NARROWED 2026-09-24 06:01Z (SCHEDULER #18): the REBUILD is done (land/dist/newgroup-dist-078 @ cfe2d0cc, on c20-batch17, 0.71.0 → 0.78.0 from newgroup/src at d536f834); what remains is an FL-9-shaped freshness guard asserting the bundle's embedded RELEASE_VERSION, and its source, equal `release.mjs`'s — DIST's caveat: after DIST-9 lands the rebuilt bundle LAGS DIST-9's installer code until rebuilt, which this guard catches.
accepts-when: the guard passes on the rebuilt bundle. NEGATIVE CONTROL: restore the 0.71.0 bundle and the guard fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs DIST`).

### UI-92 · integrated — **THE WORKSPACE CANNOT SHOW A PROJECT'S DRAFTS.** REC-198's list, rendered. — owner UI.
status: running — SPAWNED 2026-09-24 ~15:55Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER UI-92 (CONDUCT #20), base origin/main 68fecb8d (cap 16, Bob via BOB #32 15:45Z). Falsify rather than believe: a live worker holds the branch land/worker/UI-92; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone. (headline restored by SCHEDULER #18 from coord history, 2026-09-24 16:2xZ; CONDUCT #20's F4)
order: directly after REC-198 (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 consumer (REC-198's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-198.
scope: the workspace lists the project's drafts from the plane's read; each opens.
accepts-when: every draft the plane lists appears and opens. NEGATIVE CONTROL: stub the list empty, and the listed-draft arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### REC-194 · running — **AN ACKNOWLEDGEMENT MAY MATCH ANOTHER CASE WHOSE STATEMENT IS BYTE-IDENTICAL: D-150 binds it to the statement's bytes, not to ONE case identity.** Publication §3 rule 13 (folded): *an acknowledgement binds to ONE case identity; it never matches another case whose statement is byte-identical.* — owner RECORD.
status: running — SPAWNED 2026-09-24 ~15:55Z by CONDUCT #20 as a SEPARATE CLOUD SESSION titled WORKER REC-194 (CONDUCT #20), base origin/main 68fecb8d (cap 16, Bob via BOB #32 15:45Z). Falsify rather than believe: a live worker holds the branch land/worker/REC-194; if none does, this row is UNDETERMINED between queued and done-awaiting-integration — READ THE BRANCH and that session, and never conclude queued from the absence alone. (headline restored by SCHEDULER #18 from coord history, 2026-09-24 16:2xZ; CONDUCT #20's F4)
order: (held behind REC-193: both edit the statementack code; CONDUCT #20 05:08Z) directly after REC-193, the same block (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 — the `statementack` op's binding narrows to one case; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (BOB #32's ruling, folded).
depends-on: D-150, REC-193.
scope: an acknowledgement records and is matched by the case identity it was given for; a second case in the project with byte-identical statement text lists none of the first's.; and the DRAFT DOOR matches only the draft's own document/case, never an unsigned edition-1 document of another case with the same statement text (widened by SCHEDULER #18 2026-09-24 on BOB #32's 03:40Z instruction via CONDUCT #20; c18-batch7fix's finding). Extend D-150's suite.
accepts-when: two cases with identical statements, one acknowledged: the other's completeness block lists nobody; and two cases' unsigned edition-1 documents with identical statements: the draft door of one finds none of the other's. NEGATIVE CONTROL: match by statement hash alone, and the "the twin case lists nobody" arm fails by name; match the draft door by statement text across the project, and the draft-door arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (BOB #32's G3; `node tools/mintid.mjs REC`).

### D-507 · integrated — **SIX STATEMENT_ACK_* REFUSALS REACH A MEMBER UNTRANSLATED: NO_SUBJECT, ALREADY_SIGNED, NOT_A_PARTICIPANT, NO_STATEMENT, BY_ITS_AUTHOR and REC-193's AUTHOR_UNDETERMINED have no row in any `*_CHECKS` family (only DOCUMENTS_OVER_BOUND, C-82.1, does), so the member reads the plane's authored `detail` with no DEC-49 translation.** Found by UI-89's worker. — owner RECORD (BOB sees the six sentences' wording).
order: at the backlog head: refusals a member cannot read, on a landed surface (SCHEDULER #18, 2026-09-24; via CONDUCT #20 07:19Z)
milestone: M10
interface: I3 additive — six catalogued codes; the catalogue version moves; FULL gate.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, following REC-79's single-helper shape.
depends-on: REC-193.
scope: rows C-82.2..C-82.7 in STATEMENT_ACK_CHECKS inside a DEC-49 REGION; route acknowledgeStatement's returns through its `refusal` helper; rebuild the bundle; move check-refusal-codes' floors from the print.
accepts-when: each of the six arrives with its translation. NEGATIVE CONTROL: return one code outside the helper and the DEC-49 guard names it.
note: 2026-09-24 16:25Z — BOB #33 APPROVED the six `translation:` values (C-82.2..C-82.7): use them verbatim, as drained to `docs/archive/ledgers/BOB-INBOX-drained.md` ("Drained 2026-09-24 by SCHEDULER #18"); the worker may fix a factual error at the code and says so in its commit.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-508 · integrated — **THE KNOCK LIMITER'S REFUSALS ARE BARE STORE REASONS: RATE_IP and RATE_GLOBAL carry no DEC-49 code or translation, so a refused knocker reads a raw reason.** Found by D-496's worker. — owner RECORD.
order: after D-507, the same shape (SCHEDULER #18, 2026-09-24; via CONDUCT #20 07:19Z)
milestone: M2
interface: I3 additive — two catalogued codes; the catalogue version moves.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, at the door `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §2a "The doorbell: material from anyone" designs (folded on main e9b21be6).
depends-on: D-496.
scope: catalogue RATE_IP and RATE_GLOBAL with translations in a DEC-49 REGION on the knock path, through one helper; move the floors from the print.
accepts-when: a rate refusal arrives with its code and translation. NEGATIVE CONTROL: return the bare reason and the guard names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### REC-212 · running — **THE CASE DOCUMENT CONFLATES TWO ACTS: `completeness.author` names who PREPARED AND PUBLISHED it, and C-41.10's author exclusion reads that name, so the writer of the statement can ratify it when someone else published.** REC-193's finding (1). BOB #32 RULED (b), 2026-09-24 06:11Z (cite until folded): two acts, two names, never conflated. — owner RECORD.
order: after REC-194, the same statementack family; after REC-193 lands (SCHEDULER #18, 2026-09-24)
milestone: M10
interface: I3 — `completeness.statement_by` added; the integrator classifies.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13, with BOB #32's ruling of 06:11Z (cite until folded); Case Making prose states the two roles.
depends-on: REC-193.
scope: carry the draft's server-stamped `statement_by` onto the document at publish; `author` keeps its meaning; C-41.10 excludes `statement_by`; a pre-existing case with none reads UNDETERMINED and its ratify is refused by name, never back-filled from `author`; `op=caseratify` and `op=publishedcase` show both names.
accepts-when: a statement's writer cannot ratify a case another member published. NEGATIVE CONTROL: point C-41.10 back at `author` and that arm is admitted, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs REC`).

### REC-211 · running — **A DISPOSITION BINDS WHATEVER DEFINITION IS CURRENT AT THE ACT, NOT THE ONE THE MEMBER SAW: REC-184 stamps the version at the act, so a definition revised in between is disposed of unseen.** BOB #32's DEFINITION_MOVED ruling owed at REC-184's integration and not paid there (CONDUCT #20 04:56Z). — owner RECORD.
order: after D-496 at the backlog head: a correction to just-landed work, where an authored act binds what was not authored (SCHEDULER #18, 2026-09-24)
milestone: M4
interface: I3 MAJOR — a refusal where an answer stood; the integrator classifies.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §8.2 "The declared flow, and its revisions", with BOB #32's DEFINITION_MOVED ruling (~03:14Z; cite until folded): authored acts bind what was authored.
depends-on: REC-184.
scope: the disposition act carries `definitionVersion`; if the definition moved since, refuse DEFINITION_MOVED by name, catalogued with its DEC-49 translation.
accepts-when: a stale-version disposition is refused DEFINITION_MOVED and a current one is admitted. NEGATIVE CONTROL: drop the version check and the stale-version arm is admitted, failing by name.
note: 2026-09-24 05:22Z (CONDUCT #20, integ1b report 2): the READ half is built (a disposition records the version it judged; applies/applies_because say whether it still governs); this row is the WRITE half only.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs REC`).

### D-500 · integrated — **THE OBSERVATION-LOG WATERMARK CLASSIFIES A RECORD DIFFERENTLY FROM RUN TO RUN: `#hiddenSets`' watermark read and `#contentAxisTally` compare MIN(at) with `register.registered` at different precisions (one-second against milliseconds), so a same-second pair flips class intermittently.** D-486's narrowed trace. BOB #32 RULED (2026-09-24 05:04Z): the watermark STAYS VIEWER-INDEPENDENT (never taken through the caller's sight, never narrowed per viewer); a hidden run's reclassification is the accepted cost ONLY IF DETERMINISTIC. — owner RECORD.
order: after REC-211, a correction to D-486, run once c20-batch14 lands (SCHEDULER #18, 2026-09-24)
milestone: M8
interface: none.
design: `docs/development/OBSERVATION-LOG-DESIGN.md` §6 "The readers", with BOB #32's ruling of 05:04Z, which this row FOLDS into §6 in the same landing.
depends-on: D-486.
scope: compare at ONE precision (milliseconds) in both readers; fold the rule into §6; also relabel `observation-log.test.mjs`'s second section `I` (absorbs M0-151, withdrawn).
accepts-when: a same-second pair classifies identically on every run, pinned by an arm; §6 states the rule. NEGATIVE CONTROL: restore the mixed precision and the same-second arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-501 · integrated — **A PAGE'S TIER-2 AWARD COMPARES RAW `text.length`, so a newline policy moves its margin (129 → 77 in D-481's measurement) with no glyph changing hands.** Found by D-481's worker (M-133). — owner CONTENT-PDF.
order: after D-500, with the extraction corrections (D-481 rides the next train) (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:21Z)
milestone: M2
interface: none.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16 (how content is extracted today).
depends-on: D-481.
scope: compare non-whitespace characters (or decoded code points) in the tier-2 award.
accepts-when: the same page's award is unchanged under two newline policies. NEGATIVE CONTROL: restore raw length and the newline arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-502 · integrated — **TWO RUNS ON ONE BASELINE SEPARATED BY A HORIZONTAL JUMP NOW CONCATENATE (D-481's stated cost: agenda glue tokens 5 → 13, 0.32%), because glyph advance widths are not read.** Found by D-481's worker (M-133). — owner CONTENT-PDF.
order: after D-501, the same reader (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:21Z)
milestone: M2
interface: none.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §16, with the tier-1 line limit CONDUCT folds at D-481's integration.
depends-on: D-481.
scope: parse /Widths + /FirstChar and /W + /DW in `loadFont`, track the pen, set the word-gap threshold from a measured distribution; restate §16's limit when met.
accepts-when: the agenda sample's glue tokens return to ≤ 5 without losing D-481's words/page. NEGATIVE CONTROL: ignore widths and the glue arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### M0-164 · integrated — **`coord.mjs write --status <ID> <state> --note …` REPLACES A ROW'S HEADLINE, so every flip note overwrites the defect it names: all 15 rows CONDUCT #20 flipped on 2026-09-24 lost their headlines (restored by SCHEDULER #18 from f8fd4a77^/0cf9783c^).** Found by M0-158's worker. — owner M0.
order: at the head of the M0 rows: every status write corrupts the plan's own record (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:19Z)
milestone: M0
interface: none.
design: `docs/development/WORK-PIPELINE.md` and `docs/development/VERIFICATION.md` (a status word changes state, never the row's claim).
depends-on: none.
scope: `--status` keeps the headline and writes the note on a separate `status:` line (replacing any earlier one).
accepts-when: a flip with a note leaves the headline byte-identical. NEGATIVE CONTROL: restore the replacing behaviour and the headline arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-159 · integrated — **`tools/train.mjs run --drop a,b,c` DROPS NOTHING: the comma list is read as ONE branch name, matches no waiting row, and is silently ignored, so every waiting branch merges (forbidden ones included); the only sign is `dropped: a,b,c` beside the waiting count.** It happened on 2026-09-24 07:08Z; CONDUCT #20 killed the run by PID before any gate or push, and main was untouched. — owner M0.
order: at the head of the M0 rows: a process defect that risks main itself (SCHEDULER #18, 2026-09-24; via CONDUCT #20 07:15Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (an instrument that silently does nothing is worse than none).
depends-on: none.
scope: in `runTrain` (near `const drop = new Set(opts.drop || [])`), refuse to start with a named error when any `--drop` entry matches no row of `train.mjs list`; also split on commas.
accepts-when: `--drop x,y` naming no waiting branch is refused by name, and a valid comma list drops each named branch. NEGATIVE CONTROL: restore the silent ignore and the refusal arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-160 · running — **`status.mjs` DOES NOT FLAG AN AMBIGUOUS PROBE: a `hit` matching more than once in its file pins nothing — D-498's first probe (`limit: cap, truncated`) matched 24 times in `store.mjs` and stayed green on an unrelated op.** Found by D-498's worker. — owner M0.
order: after M0-159, beside M0-155 (probes going false-green on comments), the same class (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:13Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a check that cannot fail is worse than none).
depends-on: none.
scope: a `--check` arm failing any probe `hit` that matches more than once in its file; re-pin every claim it names.
accepts-when: `node tools/status.mjs --check` reads 0 ambiguous probes. NEGATIVE CONTROL: widen one claim's `hit` to match twice and the arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-165 · integrated — **FOUR SUITES ARE SELECTED FOR ANY MEASUREMENTS-ONLY CHANGE BY A DATA STRING: `measured_by: "MEASUREMENTS.md 2026-08-03 (CPDF-9)"` in calibration, reextract, textchain and tier3-layer-parts reads to the gate as a MEASUREMENTS reader.** Found by M0-153's worker. — owner M0.
order: after M0-160, with the gate-time rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:33Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the gate runs the class the diff measures).
depends-on: M0-153.
scope: drop `.md` from those provenance labels; textchain's own /MEASUREMENTS/ assertion survives; expect ~45 → ~41 units, measured.
accepts-when: a MEASUREMENTS-only diff no longer selects the four. NEGATIVE CONTROL: restore one `.md` label and that suite is selected again, by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-173 · running — **A GATE'S VERDICT DEPENDS ON OTHER LANES' TIMING: every unit that runs plancheck reads the MOVING `origin/coord` (`gates.mjs` §3a: *"it reads what plancheck reads, the whole tree and `origin/coord`"*), so a coord write mid-gate can flip it. CONDUCT #20 measured `planning-hygiene.test.mjs` failing once mid-gate at ~17:1xZ and passing 76/0 on a re-run of the identical tree.** — owner M0.
order: at the backlog head: a gate whose verdict depends on timing undermines every train's gate and costs a red round (it cuts gate time, so the lane's law admits it at the head); D-511..D-510 above it wait on the running train, so no security row is delayed (BOB #33, 17:26Z; SCHEDULER #19, 2026-09-24)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a gate measures ONE tree; *do not change the tree while a gate is running*).
depends-on: none.
scope: the gate reads coord ONCE at its start, pins that commit, and every plancheck-running unit (planning-hygiene among them) reads the pinned snapshot, never the moving `origin/coord`; the gate's record names the pinned coord sha.
accepts-when: a coord write during a gate cannot change any unit's verdict. NEGATIVE CONTROL: with the pin removed, write coord mid-run and the suite's assertion flips by name.
added: 2026-09-24 · SCHEDULER #19 (BOB #33's inbox trigger 17:26Z; `node tools/mintid.mjs M0`).

### D-492 · running — **D-64's RENDER ALLOWANCE CLAIMS A BOUND THE CODE DOES NOT HOLD: `renderAdmit` admits while `spent_ms < allowance`, but `renderSpend` adds the time only AFTER the Worker's render finishes, so N concurrent renders are all admitted against one `spent_ms`. The overrun is in-flight × (wait timeout 15,000 ms + navigation), not "at most one render" as its docstring says.** Diagnosed by CONDUCT #20 at `land/worker/D-64` @ b1ffb5a0. — owner CAPTURE.
order: after DIST-9, AHEAD of D-64's other follow-ons: a correction to D-64's own claim outranks new work, and a record that claims more than it holds is the worse defect (CLAUDE.md §2; SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:25Z)
milestone: M2
interface: I5 — a `reserved_ms` column on `render_allowance`; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "There is no collision: rendering is available on the free tier" (the free tier's daily allowance is the budget this admits against).
depends-on: D-64.
scope: `renderAdmit` reserves the render's maximum cost (its `asked` wait timeout plus the navigation bound) into `reserved_ms`, admitting only if spent + reserved + this ≤ allowance; `renderSpend` releases it and adds the reported time; an unreported render stays charged. Correct the docstring to the bound then held.
accepts-when: K concurrent admits against room for exactly J reservations admit J and defer K−J, admits interleaved before any spend. NEGATIVE CONTROL: drop the reservation and the concurrency arm admits all K, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-499 · integrated — **A RENDER WHOSE WAIT FIRED ON ITS TIMEOUT IS NOT DISTINGUISHED FROM ONE WHOSE CONDITION MET: D-64's render block does not record which fired, so a possibly-incomplete rendering reads as the whole page.** BOB #32's ruling owed at D-64's integration and not paid there (CONDUCT #20 04:56Z). — owner CAPTURE.
order: after D-492, with D-64's corrections: a correction to landed work outranks its follow-ons (SCHEDULER #18, 2026-09-24)
milestone: M2
interface: I3 additive — `render.wait.fired`; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "What must be recorded on a rendered capture", with BOB #32's timeout ruling on the D-64 row (coord a04264b8; cite until folded): the capture keeps its GRADE, its COMPLETENESS is UNDETERMINED, never presented as the whole page, never refused.
depends-on: D-64.
scope: the render block records `wait.fired: "timeout"|"condition"`; the reading derives "render may be incomplete (wait timed out)". Drive with a stub renderer through `op=acquire`.
accepts-when: a timed-out render reads the sentence with its grade intact; a condition-met render does not. NEGATIVE CONTROL: record every wait as `condition` and the timeout arm fails by name.
note: 2026-09-24 05:22Z (CONDUCT #20): first confirm D-64's `rendererFor` seam admits a stub; if it does not, making it do so is this row's first act.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### DIST-11 · running — 2026-09-24 ~17:45Z by DIST #6 itself (session_01Vi1XTVwxcBBMStifuBasLZ) on BOB #33's instruction; base origin/main 58293bf3; no release. — **THE DEPLOY DERIVATION REFUSES A `browser` BINDING (UNKNOWN_BINDING_CLASS), so no instance can hold the `BROWSER` binding D-64's render arm needs.** BOB #32 asked for it (~03:14Z, via CONDUCT #20). — owner DIST.
order: after DIST-9, first of D-64's follow-ons: the binding class must exist before any config names the binding (SCHEDULER #18, 2026-09-24)
milestone: M8
interface: I8 additive — a `browser` binding class; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "There is no collision: rendering is available on the free tier" (Browser Rendering is on every tier, so an optimisation, never a requirement).
depends-on: D-64.
scope: teach the deploy derivation the `browser` class FIRST; then add `"browser": {"binding": "BROWSER"}` to `bio-plane/wrangler.jsonc` and newgroup's config.
accepts-when: a deploy derived with the binding succeeds and a config without it still installs. NEGATIVE CONTROL: drop the class and the derivation refuses UNKNOWN_BINDING_CLASS by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs DIST`).

### D-490 · running — **NO RENDERER EXISTS: D-64's render arm answers every `render: true` with 501 RENDER_NO_RENDERER, so a client-rendered source is still captured as its empty shell.** Found by D-64's worker. — owner CAPTURE.
order: after DIST-11, whose binding it runs behind (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:17Z)
milestone: M2
interface: I3 — render answers a capture instead of 501; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "There is no collision: rendering is available on the free tier" and "What must be recorded on a rendered capture".
depends-on: D-64; DIST-11 for live verification.
scope: `@cloudflare/puppeteer` behind `rendererFor(env.BROWSER)`; absent binding keeps the 501, stated.
accepts-when: with a (mocked) binding a render produces D-64's pair. NEGATIVE CONTROL: unbind and the arm answers RENDER_NO_RENDERER by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-491 · running — **THE SWEEP CANNOT ASK FOR A RENDER: `capture_requests` has no `render` column, so D-64's sweep deferral is NARROWED, not closed.** Found by D-64's worker. — owner CAPTURE.
order: after D-490 (SCHEDULER #18, 2026-09-24; via CONDUCT #20 03:17Z)
milestone: M2
interface: I5 — a `render` column on `capture_requests`; the integrator classifies.
design: `docs/development/CLIENT-RENDERED.md` "RULED 2026-09-23 by BOB #32: the method, the primary, and the unattended sweep".
depends-on: D-64.
scope: carry `render` through captureRequestDrain → `#fireCaptureRequest`, held as RENDER_DEFERRED until a renderer answers.
accepts-when: a render request survives the drain as RENDER_DEFERRED. NEGATIVE CONTROL: drop the column's carry and the arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-480 · running — **A HIDDEN PROJECT CAN CROWD A VISIBLE ONE OUT OF THE SHARED-QUESTION CANDIDATES: `#queueSharedInquiryCandidates` groups over UNGATED refs capped at 64, so past 64 shared questions a hidden project's citations take a candidate slot and flip the served `inquiries_truncated` — a count-shaped side channel, D-447's and D-464's class.** Found by D-464's worker. — owner RECORD.
order: at the head with the disclosure rows (SCHEDULER #17, 2026-09-24; via CONDUCT #19)
milestone: M8
interface: none — the candidate selection; the answer's shape is unchanged.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.9: a project the caller cannot see answers exactly as one that does not exist).
depends-on: D-464 (finished; rides the train after c19-batch9).
scope: count DISTINCT VISIBLE citers in the HAVING clause (a gate join), or apply the cap after the gate.
accepts-when: with more than 64 shared questions, adding hidden-project citations changes neither the candidates nor `inquiries_truncated`. NEGATIVE CONTROL: group over ungated refs again, and the hidden-crowding arm fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`).

### D-472 · running — **MONITORING A DRIVE-LINKED DOCUMENT CRIES WOLF ON EVERY TICK: `op=monitor` fetches the bundle's `source.locator` itself (`const locator = fm.source?.locator` → the governed fetch), which is Google's app shell, not the export address, so the comparison runs raw and reads `modified` every time.** Read at the code on `main`. — owner CAPTURE.
order: after D-469, with the head corrections: a monitor that reports change where none happened misleads members every tick (SCHEDULER #17, 2026-09-24; D-351's worker via CONDUCT #19; renumbered from its clone's colliding "D-467")
milestone: M3
interface: none — the monitor's fetch path.
design: `docs/architecture/BIO_Content_Framework_v0_10.md` §6 (the monitoring contract), with D-351's Drive export arm.
depends-on: D-351 (finished; rides the train after c19-batch9).
scope: in `op=monitor`, route the locator through `readDriveAddress`, fetch `exportAddress` under the governor, and apply acquire's shell refusal (C-48.5, C-48.7). Extend `bio-plane/test/monitor-assess.test.mjs`.
accepts-when: an unchanged Drive document reads `unchanged` across two ticks. NEGATIVE CONTROL: fetch the raw locator again, and the two-tick arm reads `modified` and fails by name.
added: 2026-09-24 · SCHEDULER #17 (`node tools/mintid.mjs D`, the id CONDUCT #19 named).

### D-511 · running — **A LIVE HOLE IN A LANDED FENCE: `op=promote` honours a caller's `replay: true`, so any machine or session can exempt its promotion from the fences D-505 built.** BOB #33 RULED (2026-09-24 17:05Z): *`replay` IS THE SERVER'S WORD* (INVESTIGATIVE-SESSION.md §11 item 5, folded on main e9b21be6). — owner RECORD.
order: at the backlog head: a live hole in a landed fence (BOB #33, 17:05Z: *placed high*; SCHEDULER #18)
milestone: M7
interface: I3 — a refusal where an answer stood; FULL gate.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 "The RUN is an object", item 5 as BOB #33's ruling states it (folded on main e9b21be6).
depends-on: D-505.
scope: in promote's admission, delete a caller's `replay` unless the call is ADMIN class with no session (the class migrate.mjs uses since REC-173); INVERT, never delete, D-505's `risk-tier.test.mjs` §7 arm (ix).
accepts-when: a machine or session sending `replay: true` is refused C-32.19 by name, and the migration suite migrates clean. NEGATIVE CONTROL: drop the class test and arm (ix) fails by name.
added: 2026-09-24 · SCHEDULER #18 (BOB #33 inbox 17:05Z; `node tools/mintid.mjs D`).

### D-509 · running — **A FALSE GREEN ON THE MACHINE-FENCE SENTINEL: `machine-fences.control.mjs` arm (2) stays green when it must fail. Driven, not read: with the identity predicate neutered, a machine's `op=strengthbar` DOES set the group's required evidentiary strength, but block (ix) reads back group=believe-in-oakland while the act writes to the store's PRODUCING group (D-436 moved the write, not the read).** Found by D-503's worker (id minted by it). — owner RECORD.
order: at the backlog head: a control that cannot fail on the authority boundary no machine may cross (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:52Z)
milestone: M7
interface: none.
design: `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 4, with `docs/development/VERIFICATION.md` "The negative-control register".
depends-on: D-503.
scope: add `group: GROUP` to block (ix)'s strengthbar body; re-measure the publication arms that run after it (MOVE_VERSION, REVIEW, SET_LAWS, RISK_TIER), since a group-wide bar can gate them.
accepts-when: `node test/machine-fences.control.mjs` exits 0 with every arm as declared. NEGATIVE CONTROL: arm (2) itself — neuter the predicate and it now fails by name.
added: 2026-09-24 · SCHEDULER #18 (placed; `D-509` minted by land/worker/D-503).

### D-510 · running — **`promote` TRUSTS THE ENVELOPE'S TYPE OVER THE DOCUMENT'S: `bundles.object_type` and the action_basis/correspondence projection are gated on the caller's `meta.object_type`, while `#projectRow`'s action columns come from the document's own front matter — so a member can promote an ACTION under an envelope saying information: it lands typed information with `action_risk_tier` set and its basis and correspondence never projected.** Found by D-505's worker (finding 3). — owner RECORD.
order: at the backlog head: the record holding an action it does not index as one (CLAUDE.md §2; SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:48Z)
milestone: M7
interface: I3 — a disagreeing envelope refused (or normalised); the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`action` is the impact substrate), with C-2.5 (a document's type is pinned to its id prefix).
depends-on: D-505.
scope: `promote` derives the projected type from the promoted document; an envelope `meta.object_type` that disagrees is refused by name (catalogued, DEC-49), not silently obeyed.
accepts-when: an action promoted under an information envelope is refused (or lands typed action with its basis and correspondence projected). NEGATIVE CONTROL: gate on the envelope again and that arm lands typed information, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### M0-169 · running — **TWO DERIVATIONS OF "A FIXTURE'S MODULE CLOSURE": `bio-plane/test/gatedeps.mjs` (M0-154; follows dynamic literals, lexer-blanked) and `civicos-ui/test/refusal-codes.test.mjs` `copyImports` (D-254; static-only, column-anchored).** Found by M0-154's worker. — owner M0 (UI reviews).
order: after M0-168, with the gate instruments (SCHEDULER #18, 2026-09-24; via CONDUCT #20 16:50Z) AHEAD of the product rows by Bob's 17:41Z rule: a new import in gates.mjs breaks a hand-copied fixture with a false red (a false gate result costs a round) (SCHEDULER #19, 2026-09-24).
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a fixture derives what it carries; one derivation, not two).
depends-on: M0-154.
scope: one helper with a `dynamic: true|false` mode; refusal-codes reads it.
accepts-when: both callers use the one helper and stay green. NEGATIVE CONTROL: add an import the static mode cannot see and the dynamic-mode arm names it.
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
