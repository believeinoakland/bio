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

**2026-09-21 · BOB #22 · `tools/decided.mjs` CANNOT SEE MOST OF BOB'S ANSWERED DECISIONS, AND IT HAS COST A RE-ASK (M-85).**
Design: `docs/development/VERIFICATION.md` (admitted for M0 by name), with the tool's own header, which calls the index a
FLOOR. Verified at the code: `MARKER` in `tools/decided.mjs` is an uppercase-only word list, while `DECISIONS.md` records
an answer in a lowercase `decided:` field, so an entry whose `response:` carries no uppercase marker word is not indexed.
13 of 19 entries are not filed under their own id, 11 of them answered or enacted; `decided.mjs "severance"` returns
DEC-29 and DEC-72, not DEC-70, which rules exactly that. SCHEDULER #5 sent D-280 (c) to BOB eleven days after Bob ruled
it, and BOB #22 was one step from ruling the opposite. `CLAUDE.md` §1 names this tool the one source for what has been
decided, so place it first among the instruments. Sequence with D-341 (same file): one file, one suite, one gate.

1. **M0 (FULL GATE PROFILE):** a `DECISIONS.md` entry that carries a `decided:` line is indexed as ONE ruling under its own
   `DEC-n` (text from `response:`, date from `decided:`), beside the prose `MARKER` scan and never replacing it; an `open`
   or `deferred` entry is not indexed as a ruling. **Accepts when** every answered or enacted `### DEC-n` heading is
   returned by `decided.mjs "DEC-n"` (a printed count equality against the file's own headings), `decided.mjs
   "severance"` returns DEC-70, and a deferred entry is not returned. **The cheap defeat to refuse:** lower-casing
   `MARKER`, which floods the index with every prose *decided*, so an arm asserts the index grows only by the entries it
   did not already file and files none twice. NEGATIVE CONTROL: drop the field arm, and the equality fails naming DEC-70.

**2026-09-21 · BOB #22 · `op=reevaluations` SAYS A SEVERED LEG *RESTS ON* ITS TARGET AND PUBLISHES NO STATUS — the gap
DEC-70 leaves at its own pin.** Design: `docs/development/DECISIONS.md` DEC-70 (Bob, 2026-09-10): *severance discharges
SUPPORT, never CONNECTION*, and *the connection INFORMS, never binds*. Verified at the code: `Store#reevaluations` reads
legs from `inquiry_basis`, which drops `status`, and its edition cause says *"this leg rests on edition N"* for every
leg; nothing in the answer says a leg was withdrawn. `#refEdgeSevered` is the one predicate, and `restingOn` already
publishes a status from it. D-280 closed this commit; nothing is superseded.

1. **RECORD (M9; I3 additive, the integrator mints the IC):** each obligation leg carries `status` (`severed` |
   `confirmed`) from `#refEdgeSevered(bundle, target)`, and a severed leg's edition detail says the withdrawn leg NAMED
   edition N rather than resting on it. The obligation still fires (DEC-70) and derives nothing from strength. **Accepts
   when** a drive through the op shows a severed leg `status: "severed"` with wording that claims no support, and a
   confirmed leg unchanged. **The cheap defeat to refuse:** filtering the severed leg out, which reverses DEC-70, so
   `d280-strengthbar.test.mjs` SITE (c) stays green; an unrecorded or unrecognised `status` reads `confirmed`. NEGATIVE
   CONTROL: drop the status, and the severed-leg arm fails by name.

**2026-09-21 · BOB #22 · M0-83 GAINS ITEM (4): `tools/retirable.mjs` JUDGES OTHER REPOSITORIES' SESSIONS AGAINST BIO'S
REMOTES** (measured by BOB #21, BOB-NEXT §3.4). Design: M0-83's own. Fed the account's whole `list_sessions`, it called
24 Supervisor sessions RETIRABLE (their cwd no longer exists) and 15 Alpha-Pipeline sessions HOLD; BOB #22's sweep fed
BIO sessions only, by hand, which is this fix done manually. Amends M0-83's scope; supersedes nothing.

1. **M0-83 item (4) (owner BOB; FULL GATE PROFILE):** judge only sessions whose `cwd` resolves inside this repository (the
   primary checkout or `.claude/worktrees/*`) and report the rest OUT OF SCOPE, never RETIRABLE, HOLD or PROTECTED, with
   their count printed. **Accepts when** an input mixing a BIO session, another repository's and a vanished cwd judges the
   first and names the other two out of scope. **The cheap defeat to refuse:** a prefix match on the path, so an arm feeds
   a sibling directory sharing the prefix and asserts it is out of scope. NEGATIVE CONTROL: drop the scope test, and the
   other-repository arm fails by name.

**2026-09-21 · BOB #22 · D-260 RULED — AN INSTANCE MAY HOLD ONE ORGANISATION-PRINCIPAL `ai` CREDENTIAL AND RESUMES ONLY
THE RUNS IT OPENED (SCHEDULER (#5)'s Q3).** Design: `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6, the D-260
paragraph (this commit); the deploy half is `BIO_Distribution_v0_1.md` §6's bullet. Verified at the code: a run's
principal is stamped `principal/tokenId` at the open (`index.mjs`, D-199 (4)); only that principal ticks or closes it
(REC-152, C-22.12); a machine credential stamps an empty actor, so an organisation key may open a run within its scope;
`AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`. Place D-260 under its own id with the dispatch fix
on its row; a member-principal run's non-resumption is the stated limitation in that paragraph.

1. **RECORD with FLEET (M9; I8, which leaves PROVISIONAL when this lands):** FL-4's wake dispatches a woken run to
   `agent-worker` with the instance's organisation credential ONLY when that credential's stamped principal equals the
   run's `principal_plane`, and otherwise logs that it did not; the dispatch hands `claude_accounts` its instance level.
   **Accepts when** a run the instance credential opened resumes after its capture completes, and a member's run is not
   dispatched and says so. **The cheap defeat to refuse:** dispatching every woken run and leaning on REC-152 to refuse
   the tick, so the arm asserts the member's run is never DISPATCHED.
2. **DIST, after 1:** install and update carry that credential as a secret the way `DAEMON_TOKEN` is carried, never in the
   record, denylisted by `tokens.mjs` on publication.

**2026-09-21 · BOB #22 · D-293 RULED — THE PUSH GUARD NEVER RUNS `tools/gates.mjs`, AND IS TO REFUSE A TREE WHOSE
RECORDED VERDICT IS RED, WHICH IS NOT BUILT (SCHEDULER (#5)'s Q4).** Design: `docs/development/VERIFICATION.md`, the push-guard section, which
already states the first half: the hook *"runs `decided.mjs --check` and REFUSES a stale push"*, nothing more. THIS ENTRY
CARRIES THE SECOND HALF until it is built, because that file is at its reading budget (24,567 of 24,576 B) and its
register block is quoted by `register-grammar.control.mjs`'s arms, so a cut there is its owner's act: the builder adds
the refusal's one line in the landing that builds it. Measured (M-85): a full gate takes ~25 minutes and `main` took 48
first-parent commits from 13:00Z on 2026-09-21, 46 of 47 gaps under 25 minutes, so a push-time gate would rebase and
re-gate without converging. Place D-293 under its own id, owner M0.

1. **M0 (FULL GATE PROFILE):** `gates.mjs` records its verdict and class keyed by the tree it measured, only when that tree
   was CLEAN, untracked under the git common dir; the guard refuses a push whose tip tree carries a RED record, naming it,
   and says nothing when none exists. **Accepts when** a RED gate then a push of that tree is refused by name, and a GREEN,
   an unrecorded and a changed tree each pass. **The cheap defeat to refuse:** keying on the commit sha, which an amend of
   the message alone evades, so the arm amends and asserts the refusal holds. NEGATIVE CONTROL: drop the guard's lookup,
   and the RED-then-push arm fails by name.

**2026-09-21 · BOB #22 · D-195'S SHARED-ORIGIN DISCLOSURE AT THE MEMBER'S OWN ELICITATION — TWO ITEMS, IN ORDER (SCHEDULER
(#5)'s Q1, RULED).** Design: `docs/development/INVESTIGATIVE-SESSION.md` §12 clause (c) (this commit). Verified at the
code: UI-27's read-back (`elicFalsifier`) prints *"Your answer fails only if ALL of these fail"* and reads no
independence (`versionstrength` and `independence` occur 0 times in `civicos-ui/app.html`); `Store#independenceOf` has
two consumers, `op=suggest`'s check and `op=versionstrength`'s read of a STORED version. Place after UI-74, which shows
the same fact at the accept ceremony; whichever lands second reuses the first's rendering.

1. **RECORD (M9; I3 additive, an IC):** a read returning `#independenceOf` for a PROPOSED partition over an inquiry's
   existing legs, gated as `op=versionstrength` is, writing nothing, `checked`/`complete` as they already are. **Accepts
   when** two parts sharing a capture read as sharing an origin, independent parts read clean, a one-part partition reads
   `checked: false`, and the answer equals `op=versionstrength`'s once the partition is written. **The cheap defeat to
   refuse:** a second derivation that agrees today, so a control swaps in a copy differing in one branch and fails by name.
2. **UI (M9), after 1:** the read-back names each shared origin between the parts it lists, once (DEC-69), before the
   answers are written; it prefills nothing, refuses nothing, shows no strength and no AND/OR word. **Accepts when** two
   correlated reasons show their origin and the member's answers are written unchanged. **The cheap defeat to refuse:**
   blocking or reordering the answers on a shared origin, which turns an informing fact into a gate.

## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 8 in all. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### LED-7 · queued — **SCHEDULER'S OWN ACT, NOT A WORKER SLOT: CONDUCT must never brief a worker into this row, and does not need to ask again (SCHEDULER #2 to CONDUCT #7, 2026-09-19).** **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: the debt fold: until it runs, ~222 open DEBT rows — among them disclosure defects that would outrank features — stand outside the order, so the plan cannot be proved in order without it (SCHEDULER, first order audit, 2026-09-18)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states, EXCEPT the actor — batches of ~20 rows driven by SCHEDULER ITSELF (Bob, 2026-09-19: *"Scheduler should be actively involved in moving debt rows into the build plan (in the proper order)."*), never spawned into a development slot. **218 open rows, measured 2026-09-19 by SCHEDULER #2** (`grep -c '^| D-' docs/development/DEBT.md`); 223 before batch 1, which closed 4 in fact, placed D-158, routed D-325 and D-52 to BOB and carried 3. A single row whose verification needs a build or a long code trace goes to CONDUCT as its OWN row with its own id — never as "LED-7".
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).

### D-436 · running — **SPAWNED 2026-09-21 by CONDUCT #10. NOT LANDED, CHECKED BY CONTENT at spawn: on `origin/main` @ `b83e705c`, `believe-in-oakland` occurs 23 times in `bio-plane/src/store.mjs` (`grep -a -c`). Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **THE PLANE STAMPS A LITERAL PRODUCING GROUP, `believe-in-oakland`, SO A SOVEREIGN GROUP'S RECORD NAMES THE WRONG PRODUCER IN ITS OWN SIGNED BYTES.** `store.mjs` defaults a bundle's `group` to that literal wherever frontmatter carries none (18 fallbacks, 2 trimmed-argument defaults, 1 in `index.mjs`), and three sites stamp it UNCONDITIONALLY: `testify`'s `bundle.md` frontmatter, its promote `meta`, and project creation. The plane holds no group identity at all; the installer already knows the slug, which is the worker name. — owner RECORD, with DIST.
order: SECOND, after REC-156 and AHEAD of any release a new group installs (BOB #19, 2026-09-21): signed bytes cannot be corrected once published, so on a newly installed instance this falsehood becomes permanent (SCHEDULER #4, 2026-09-21)
milestone: M7
interface: I3 and I5 — the durable group value and its first-bootstrap write; the integrator mints and classifies the IC. DIST passes the slug the installer already holds.
design: `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §3.1 (the core field `group`: the producing group's slug, which travels with the bundle), with the design call made in D-436's own row (`node tools/ledger.mjs find D-436`).
depends-on: none.
scope: the slug becomes ONE value in the Durable Object's durable state, written once at the instance's first bootstrap from the slug the installer holds; every default and every stamp reads it; a bundle's `group` is never a literal. **Never a deploy-time var:** it appears in signed bytes, so a redeploy must not be able to change it silently.
accepts-when: an install under a second slug writes no `believe-in-oakland` into any bundle it writes. How a liar passes it: a value re-read from a deploy var, so the arm changes the var and asserts the value did not move. NEGATIVE CONTROL: restore one literal, and the arm fails by name.
added: 2026-09-21 · SCHEDULER #4 (BOB #19's inbox entry, drained this commit; keeps its `D-` id).

### M0-79 · running — **SPAWNED 2026-09-21 by CONDUCT #10. NOT LANDED, CHECKED BY CONTENT at spawn: on `origin/main` @ `b83e705c`, `node civicos-ui/check-refusal-codes.mjs` EXITS 0 while printing `floors 98 corpus / 319 refusals · corpus GREW by 29` — the slack is printed and passes. D-254, the file's other item, LANDED at `cac06ae7`. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **FOUR DEC-49 FLOORS ARE SLACK AND THE GUARD PRINTS IT WITHOUT FAILING** — `civicos-ui/check-refusal-codes.mjs` reads `outcomeReturns` 126 against a floor of 98 and says *"corpus GREW by 28"* on a GREEN run; `vocabularies` 22 vs 11, `vocabularyTerms` 110 vs 64, `untranslated` 297 vs 270. A floor with slack is the floor not being a ratchet — and this one announces its slack and passes. — owner M0.
order: THIRD on this file, after D-433 (running) and D-254 — whichever lands last re-reads the others. It is the INSTRUMENT CLUSTER's doctrine on the floor side: a check that reports where it should gate cannot fail, which CLAUDE.md §2 grades worse than a missing feature (SCHEDULER #3, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with the FLOOR table.s header — *"slack in a floor is not harmless: it is the floor not being a ratchet."*
depends-on: none. **Sequence after D-254** (same file).
scope: **FAIL on slack beyond a stated bound, rather than print it.** The file already computes every measured/floor pair, so the arm is a comparison it is one line from making. The bound is a design call the worker states AT THE SITE: zero for figures a landing is expected to move in the same turn, non-zero only where the header already argues it (`bodyLines` sits deliberately far below its measurement — do not gate that one without saying why).
accepts-when: with any one floor left stale by a landing, the guard EXITS NON-ZERO naming that figure, its floor and its measured value; a landing that moves a floor in the same turn stays green. How a liar passes it: gating only the figures currently equal — so the arm asserts the FULL set of floor keys is covered or explicitly exempted.
NEGATIVE CONTROL: drop one floor by one and the guard fails BY NAME; today it prints and passes.
added: 2026-09-19 · SCHEDULER #3 (CONDUCT #7's item 2, RE-MEASURED — its own figures no longer reproduce, four others do; see MEASUREMENTS.md).

### D-434 · running — **SPAWNED 2026-09-21 by CONDUCT #10. NOT LANDED, CHECKED BY CONTENT at spawn: on `origin/main` @ `b83e705c`, `RECIPES[capture-a-document-and-ground-a-question-on-it]` (`civicos-ui/app.html:2317`) still ends on `{ surface: "inquiry", op: "inquiryground",` at line 2325. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **A PUBLISHED RECIPE REFUSES THE MEMBER AT ITS OWN LAST STEP.** `app.html`.s `RECIPES[capture-a-document-and-ground-a-question-on-it]`, ends on `op=inquiryground` — which authors the DEC-32 PARTITION over legs that ALREADY EXIST and refuses `NO_BASIS` when there are none. On a fresh capture the member is REFUSED; on a question with legs it regroups them and attaches the document to nothing. The op for this act is `op=cite`. **PART 1 ONLY.** — owner UI.
order: FIRST. The record telling a member to do what the plane refuses is the record claiming more than it can support, which CLAUDE.md §2 grades above every feature — and it is PUBLISHED, so it is wrong in the member.s hands. One edit plus its arm (SCHEDULER #3, 2026-09-20)
milestone: M8
interface: none — part 1 changes no interface.
design: `docs/development/INVESTIGATIVE-SESSION.md` §0 · Vocabulary, which ALREADY BANS this: *"GROUND PARTITION … is **never a surface word**"* — DEC-32.s elicitation clause 1 bans it from every member-facing surface. The recipe breaks a ban a governed document already states: enforcement, not a new rule.
depends-on: none.
scope: **PART 1 ONLY; THE ROW REFUSES TO GROW.** Correct the step and its `why` to `op=cite`, or split into cite-then-ground if the recipe means both — plus one arm that DRIVES it end to end, since its id appears nowhere outside `app.html`. **PART 2 IS NOT PLACED:** no arm of `surface-registry.test.mjs` asks whether a step.s op can perform its act, and BOB ruled it must be SIZED first — inventing a model of every op to judge a `why` string is the citation-invented-to-pass-a-check failure.
accepts-when: the recipe is driven end to end against the plane and COMPLETES. How a liar passes it: editing the `why` to match the wrong op — so the arm DRIVES it and asserts no refusal, instead of reading text.
NEGATIVE CONTROL: restore `op=inquiryground` and the drive arm fails by name at `NO_BASIS`.
added: 2026-09-20 · SCHEDULER #3 (BOB #18.s inbox entry, drained this commit).

### REC-157 · queued — **A CASE KEEPS ASSERTING A CLAIM ITS PROJECT WITHDREW, AND DEC-19's ONE ROUTE FORWARD — A NEW EDITION — IS REFUSED.** Since REC-135 (IC-166) a published case records the PROJECT's adopted claim; when the project withdraws and concludes again on another claim, `op=publish` still refuses `ALREADY_A_CASE_MEMBER`, whose pin is `#caseRelationOf(id).member` — the finding at its `bundle_sha`, which never moved. — owner RECORD.
order: SECOND, after D-434: a correction to just-landed work (REC-135, `84a66a30`) failing in the PUBLISHED record — the case says what its project no longer stands on and cannot be corrected forward, CLAUDE.md §2's class; below D-434 only because publishing runs through the operator (DEC-33) (SCHEDULER #5, 2026-09-21)
milestone: M10
interface: I3 — `op=publish` succeeds where it refused; the integrator mints and classifies the IC.
design: `docs/development/INVESTIGATIVE-SESSION.md` §7.1 item 9 (BOB #19, 2026-09-21), which applies items 4 and 7.
depends-on: none. REC-135 (item 4, `#caseConclusionFor`) and REC-136 (item 7, `op=withdrawconclusion`) are on `origin/main`.
scope: `ALREADY_A_CASE_MEMBER` compares the RELATIONSHIP, as `NOT_CONCLUDED` does: a new edition is warranted when the publishing project's latest conclusion is not the one the pinned edition recorded, whether or not `bundle_sha` moved. `op=reopen` does NOT change. A project that withdrew and has not concluded again still gets `NOT_CONCLUDED`, and its last edition stands (DEC-19).
accepts-when: REC-135's own probe path — conclude, publish, withdraw, conclude on another claim, publish — reaches a SECOND edition recording the new claim; publishing unchanged still refuses `ALREADY_A_CASE_MEMBER`. How a liar passes it: dropping the refusal, so the unchanged arm must still refuse. NEGATIVE CONTROL: pin on `bundle_sha` alone again, and the second-edition arm fails by name.
added: 2026-09-21 · SCHEDULER #5 (BOB #19's inbox entry, drained this commit; `node tools/mintid.mjs REC`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist)**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
