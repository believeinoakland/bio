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
worker reads its own row from `origin/main` before it touches anything, and STOPS if the row does not read `running`.**

This file's history until 2026-09-18 — its earlier preambles, the 2026-08-04 handover, the per-area narrative — is in
`docs/archive/ledgers/QUEUE-narrative-2026-09-18.md`; drained inbox entries are in
`docs/archive/ledgers/BOB-INBOX-drained.md`; closed rows in `docs/archive/ledgers/QUEUE-closed.md`. All verbatim; look
them up (`node tools/ledger.mjs find <ID>`), do not read them whole.


## BOB INBOX — append-only. BOB writes here; SCHEDULER drains it (from 2026-09-18; CONDUCT did until then).

BOB appends a designed item, a correction or an order change here, with its intended place; SCHEDULER gates it at its cited design section and its depends-on, places it, and moves the drained entry to `docs/archive/ledgers/BOB-INBOX-drained.md` in the same commit.

## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 8 in all. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### LED-7 · queued — **SCHEDULER'S OWN ACT, NOT A WORKER SLOT: CONDUCT must never brief a worker into this row, and does not need to ask again (SCHEDULER #2 to CONDUCT #7, 2026-09-19).** **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: the debt fold: until it runs, ~222 open DEBT rows — among them disclosure defects that would outrank features — stand outside the order, so the plan cannot be proved in order without it (SCHEDULER, first order audit, 2026-09-18)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states, EXCEPT the actor — batches of ~20 rows driven by SCHEDULER ITSELF (Bob, 2026-09-19: *"Scheduler should be actively involved in moving debt rows into the build plan (in the proper order)."*), never spawned into a development slot. **218 open rows, measured 2026-09-19 by SCHEDULER #2** (`grep -c '^| D-' docs/development/DEBT.md`); 223 before batch 1, which closed 4 in fact, placed D-158, routed D-325 and D-52 to BOB and carried 3. A single row whose verification needs a build or a long code trace goes to CONDUCT as its OWN row with its own id — never as "LED-7". **OWED FROM M0-109's DELEGATION** (`CLAIMS.md`, 2026-09-22; SCHEDULER #13): the batch that moves D-388 waits on M0-115 (item 1); the CLOSING landing's retargets are §3's list, which BOB #27 widened to items 2 and 3 the same day.
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).

### M0-106 · queued — **NARROWED 2026-09-22 by SCHEDULER #12: the TEXT landed at `4f7efed0` (`kickoffs/DIST.md` step 1: a GREEN FULL record for the tree released, else `gates.mjs --since`, the battery only when neither exists), verified on `origin/main`. What remains is the WITNESS, at the next cut (0.72.0, owed no earlier than 2026-09-23 04:00Z): its step 1 names the record it relied on and runs no battery. DIST reports the cut commit and that line; then close.** **DIST's RELEASE GATE RE-RUNS THE WHOLE BATTERY ON MERGED `main`, CALLING IT *"a tree nobody has tested"* (`kickoffs/DIST.md`), WHICH IS FALSE WHEREVER THAT EXACT TREE ALREADY CARRIES A GREEN FULL RECORD** (D-293 keys the record by tree). DIST #4's 0.71.0 gate took ~2.5 h here for a battery that runs in ~16 min. — owner DIST (its own kickoff).
order: near the head, ahead of the product rows because it CUTS GATE TIME (Bob's ruling, 2026-09-22, `CLAUDE.md` §2: *The goal is BIO work; process is overhead*: no process row unless it cuts gate time or unblocks product); DIST's own act, never a worker slot (moved by SCHEDULER #11 on BOB #25's word, 2026-09-22)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with `CLAUDE.md` §6's ruling of 2026-09-22; the item is carried in BOB #25's drained entry (`docs/archive/ledgers/BOB-INBOX-drained.md`, "GATES RUN FAR MORE THAN THEY NEED TO").
depends-on: none — D-293's record and M0-98's `--since` are on `main`.
scope: step 1 becomes: a GREEN FULL record for the tree being released, or `gates.mjs --since <the newest commit whose tree carries one>`, and the whole battery only when neither exists; the version bump's own check stays. DIST writes it; CONDUCT routes the row to DIST and briefs no worker.
accepts-when: a release from a tree with a GREEN FULL record runs no battery and names the record it relied on; one from an unrecorded tree runs the battery as today.
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs M0`).

### M0-107 · queued — **LOAD MAKES A GATE WRONG, NOT ONLY SLOW: a suite whose subprocess or wall-clock budget expires reads the expiry as a FINDING, and since D-293 the false RED is recorded and refuses the push.** DIST #4's 0.71.0 gate read RED on `owed-controls` A13/A13b beside a concurrent battery (M0-103, this row's first site); 57 `timeout:` sites sit in 43 suites and neither `gates.mjs` nor `battery.mjs` names a timeout outcome (re-read on `032d1ce1`). — owner M0.
order: directly after M0-106, near the head because it CUTS GATE TIME: a load-made RED costs a FULL re-run and blocks a push (Bob's ruling, 2026-09-22, `CLAUDE.md` §2: *The goal is BIO work; process is overhead*); it supersedes M0-103 (moved by SCHEDULER #11 on BOB #25's word, 2026-09-22)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name): a suite is evidence only where it can disagree with its subject, and a timeout is no disagreement; the item is carried in BOB #25's drained entry.
depends-on: none.
scope: every suite whose subprocess or wall-clock budget can expire reads the expiry as ONE named timeout assertion, never a finding; a run whose only failures are timeouts records NOT MEASURED instead of RED, so the push guard does not refuse on it. First site: M0-103's two `coverage.mjs` spawns in `owed-controls.test.mjs`. **FULL GATE PROFILE**.
accepts-when: a sweep names every `timeout:` and budget site with its outcome check; a run killed only by timeouts writes no RED record. How a liar passes it: raising every timeout, which hides a real hang, so an arm plants a hang and asserts it is still named. NEGATIVE CONTROL: a 1 ms budget on one swept site fails its timeout assertion by name and no finding assertion.
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 2, drained this commit; `node tools/mintid.mjs M0`); supersedes M0-103.

### REC-166 · queued — **A PROJECT'S MAKE-CURRENT WRITES INTO THE SHARED QUESTION.** `op=versioncurrent&project=P` promotes the INQUIRY first (its `last_updated` and the Session Log line *reading '<v>' is what P stands on*) and only then P's pointer, so the finding's `bundle_sha` moves for no change to the finding: cases pinning it lose CASE-4's fences and `#flagCasesOnRevision` flags them all, another project's included (`store.mjs`, re-read on `032d1ce1`). — owner RECORD.
order: first of the product corrections, directly after REC-157 lands (BOB #25): one team's act silently moving another team's published pins, which §7 forbids, CLAUDE.md §2's class; it completes REC-157's premise on every path (SCHEDULER #11, 2026-09-22)
milestone: M10
interface: I3 — the receipt moves from the inquiry's bytes to the project's; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §7, *"A PROJECT'S MAKE-CURRENT WRITES NOTHING ON THE SHARED QUESTION"* (BOB #25, 2026-09-22), fix (a).
depends-on: REC-157.
scope: fix (a): the project arm writes its receipt into the PROJECT's own bytes, in the promotion that writes its pointer, and does not promote the inquiry; accept, reject, hide and their siblings still promote it. Fix (b), exempting the revision flag, is refused (§7).
accepts-when: after a project-arm make-current the inquiry's `bundle_sha` is unchanged, `op=caseflags` names no case for it, a published case pinning the finding keeps CASE-4's fences, and P's Session Log carries the line; `op=versionaccept` still moves the inquiry. How a liar passes it: dropping the receipt with the promotion, so an arm asserts the line in P's bytes. NEGATIVE CONTROL: restore the inquiry promotion, and the `bundle_sha`-unchanged arm fails by name.
added: 2026-09-22 · SCHEDULER #11 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs REC`).

### REC-165 · queued — **A PRODUCTION CAN NAME A RUN ITS CALLER DOES NOT HOLD.** `op=suggest` resolves `run` for existence alone and `op=extractpropose` checks running and mode, never whose run it is (`store.mjs`); `runPrincipalGate` guards only the tick and the close, so a version is read against another member's lens, bar, skill version and principal (traced by BOB #25; re-read 2026-09-21). — owner RECORD.
order: directly after UI-77, with the corrections to built work: an attribution the record cannot support, in REC-152's fence, CLAUDE.md §2's class; below REC-163 and UI-77, which every installed instance's public page shows, because this needs a signed-in caller holding another run's id (SCHEDULER #10, 2026-09-21)
milestone: M9
interface: I3 — two ops refuse what they accepted; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §11 item 5, rule 1 (BOB #25, 2026-09-21).
depends-on: none — REC-152's gate and stamp are built.
scope: rule 1: REC-152's stamp of the caller's `principal` on both ops, both apply `runPrincipalGate`, and `suggest` refuses a run that is not running, as `extractpropose` already does.
accepts-when: another principal's running run is refused `AI_RUN_NOT_PRINCIPAL` on both ops; the caller's closed run is refused on `suggest`; the caller's own running run lands from a session AND from a machine credential that member minted. How a liar passes it: gating one caller kind only, so both arms run. NEGATIVE CONTROL: drop the gate in `suggest`, and the other-principal arm fails by name.
added: 2026-09-21 · SCHEDULER #10 (BOB #25's inbox entry, item 1, drained this commit; `node tools/mintid.mjs REC`).

### M0-110 · queued — **THE MESSAGE BOARD RIDES ON `main`: A CLAIM, A QUEUE FLIP OR THE REGENERATED RULINGS INDEX IS A COMMIT THAT MOVES `main` FOR EVERY LANE AND VOIDS EVERY OTHER LANE'S GREEN GATE RECORD.** 89 of 112 commits on `main` on 2026-09-22 to ~14:45Z touched `CLAIMS.md`, `QUEUE.md` or `DECIDED.md`; one DOCS landing took six gate runs where one was needed. RULED by Bob, 2026-09-22 (*"Yes to all 3 recommendations"*). — owner M0.
order: at the head of the plan: it CUTS GATE TIME on every landing, Bob's own test (`CLAUDE.md` §2), item 1 of the ruling's order; STAGE 1 BESIDE M0-99 and stage 2 after it, which rewires the same readers (BOB #27, 2026-09-22: *"M0-110's first stage starts BESIDE M0-99, not after it"*) (SCHEDULER #12 and #13; BOB #26's inbox entry, item 1)
milestone: M0
interface: none — no op or wire shape moves; the integrator classifies.
design: `docs/development/TREE-SHARING.md` §1 (the message board leaves `main`: a `coord` branch), with `docs/development/VERIFICATION.md` (admitted for M0 by name).
depends-on: none for STAGE 1 (new files only); STAGE 2 waits for M0-99 (BOB #27, 2026-09-22), which is DONE (CONDUCT #12's batch 4).
scope: as §1. STAGE 1, beside M0-99, NEW FILES ONLY: measure per-path churn on `main` and name each file moved or kept against §1's line; the one write command (fetch, edit without a checkout, the ledger arms, push, retry on a non-fast-forward, each edit an intent anchored to a block) and the one read command against `origin/coord`, with their suite. STAGE 2, after M0-99: the state files move to `coord` and every reader is redirected; ONE migration landing leaves a pointer at each old path and corrects `CLAUDE.md` §1's table and every kickoff naming a moved file. **FULL GATE PROFILE**.
accepts-when: a claim, a queue flip and a handoff each land on `coord` without moving `main`; every reader answers as it did from `main`; a `main` gate record survives a `coord` write; a new block and a line into an existing block, written concurrently, leave the line in its block (BOB #27: each retry re-applies the edit as an intent anchored to a block heading). NEGATIVE CONTROL: point one reader back at `main`'s old path, and its suite fails by name.
added: 2026-09-22 · SCHEDULER #12 (BOB #26's inbox entry, item 1; `node tools/mintid.mjs M0`).

### REC-167 · queued — **A CASE PREPARED BY `op=publish` AND RATIFIED AFTER ITS PROJECT WITHDREW THE CONCLUSION IT RECORDS STILL COMMITS: THE SIGNED EDITION STATES A CONCLUSION NOBODY HOLDS.** Measured by REC-157 (M-92): P concludes, `op=publish` prepares edition 1 recording P's claim, P withdraws, then `op=caseratify` and `op=ratify` both succeed, while `op=basisversions` shows P on no conclusion. Pre-existing since REC-135. — owner RECORD.
order: FIRST of the backlog, behind REC-166 in the cache: the signed, published record claiming a conclusion its project withdrew, CLAUDE.md §2's worst class, on the path REC-157 just corrected (SCHEDULER #12, 2026-09-22; REC-157's DELEGATION)
milestone: M10
interface: I3 — `op=caseratify` refuses what it accepted, by a new code; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §7.1 item 4 (*`NOT_CONCLUDED` at `op=caseratify` reads the publishing project's relationship*) and item 9's comparison, asked of an unratified preparation.
depends-on: none — REC-135 and REC-157 are on `main`.
scope: `ratifyCaseDocument` asks, per roster member, what `op=publish` asks: `#caseConclusionFor` on the document's `case_project` is concluded AND is the conclusion the document RECORDS (`#editionsRecordingConclusion`, applied to the one document signed); otherwise a new code with a canned translation (DEC-49) names what moved and the route, publish again.
accepts-when: M-92's path is refused by the new code and nothing is signed; after concluding again on another claim, the OLD preparation is refused too, while publishing again and ratifying the new edition succeeds; an unchanged conclusion ratifies as today. How a liar passes it: checking concluded-ness alone, which the conclude-again arm defeats. NEGATIVE CONTROL: drop the comparison, and that arm fails by name.
added: 2026-09-22 · SCHEDULER #12 (REC-157's DELEGATION to SCHEDULER, placed this commit; `node tools/mintid.mjs REC`).

### UI-77 · queued — **EVERY INSTANCE'S MEMBER FENCE AND PUBLIC HEADER NAME BELIEVE IN OAKLAND AS ITS GROUP.** `civicos-ui/app.html` declares `const GROUP = { name:"Believe in Oakland", idstr:"believeinoakland.org", mono:"B" }`, rendered at `#m-grp`/`#m-idstr` and `#p-gname`/`#p-gid`/`#p-mono`, with a third literal in `#m-idstr`'s markup: a sovereign group's public page claims to be this project's. — owner UI.
order: directly after REC-163, the same defect's surface half; the two share no file (SCHEDULER #9, 2026-09-21)
milestone: M7
interface: I3 consumer (`op=instancegroup`, public since REC-163).
design: `docs/architecture/BIO_Publication_v0_1.md` §7 (the slug is PUBLIC; a display name is shown WITH it, never instead), with DEC-69: a surface invents nothing.
depends-on: REC-163 (the public read).
scope: the member fence and the public header read `op=instancegroup` and show the recorded slug, or say that none is recorded; the display-name, domain and monogram literals go.
accepts-when: signed out and in, against a plane recording a second slug, both surfaces show it and none renders `Believe in Oakland` or `believeinoakland.org`. How a liar passes it: a CSS-hidden literal, so the arm reads the DOM's text. NEGATIVE CONTROL: restore the `GROUP` literal, and the no-literal arm fails by name.
added: 2026-09-21 · SCHEDULER #9 (CONDUCT #11's route; `node tools/mintid.mjs UI`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
