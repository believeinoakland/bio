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

BOB appends a designed item, a correction or an order change here, with its intended place; SCHEDULER gates it at its cited design section and its depends-on, places it, and moves the drained entry to `docs/archive/ledgers/BOB-INBOX-drained.md` in the same commit. **Nothing is waiting.**

## THE CACHE — the next rows, in order

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 8 in all. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### UI-72 · running — **SPAWNED 2026-09-19 by CONDUCT #7. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: `actRefusalHtml` in `origin/main:civicos-ui/app.html` still reads `const words = r.detail || r.error || ""` and never consults `r.translation` — NOT landed, checked by content. UI-66's own comment at `refusalTranslated` records that it applied the translation at TWO sites only and reported the class change rather than making it; this row IS that class change. Paths are DISJOINT from D-270 (`app.html` vs `index.mjs`/`bio-checks.mjs`), but the two MEET semantically — D-270 gives ops true sentences and canned translations, this row makes the surface show them — so they are candidates to batch under one gate. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **`civicos-ui/app.html`'s `actRefusalHtml` SHOWS A REFUSAL's `detail` EVEN WHEN THE PLANE SENDS A CANNED `translation`, on every surface that uses it — the member reads the plane's internal wording instead of its label.** Found by UI-66, routed by CONDUCT #6, 2026-09-19; fix named. A correction to landed surfaces. — owner UI.
order: a correction to landed surfaces (refusals show internal detail over the plane's label); with the corrections, after UI-67 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (no plane change)
design: DEC-49 (`node tools/decided.mjs "DEC-49"`) as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it — *refusals carry the plane's own label*: every condition has a named code and a canned translation — and the rule `acquireWhy` already applies in `app.html`.
depends-on: none.
scope: `actRefusalHtml` renders the `translation` first when the plane sends one (as `acquireWhy` does), the `detail` only where no translation exists; `version-review` §7's pinned wording is CORRECTED in the same change with its reason. Every surface calling `actRefusalHtml` is listed in the landing.
accepts-when: the harness drives a refusal that carries a translation on each listed surface and sees the translation; one without a translation still shows the detail; `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: dropping `detail` everywhere, so the no-translation arm must still show it. NEGATIVE CONTROL: restore detail-first, and the translation arm fails by name.
added: 2026-09-19 · SCHEDULER (UI-66's finding, routed by CONDUCT #6; id minted with `node tools/mintid.mjs UI`).

### LED-7 · queued — **SCHEDULER'S OWN ACT, NOT A WORKER SLOT: CONDUCT must never brief a worker into this row, and does not need to ask again (SCHEDULER #2 to CONDUCT #7, 2026-09-19).** **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: the debt fold: until it runs, ~222 open DEBT rows — among them disclosure defects that would outrank features — stand outside the order, so the plan cannot be proved in order without it (SCHEDULER, first order audit, 2026-09-18)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states, EXCEPT the actor — batches of ~20 rows driven by SCHEDULER ITSELF (Bob, 2026-09-19: *"Scheduler should be actively involved in moving debt rows into the build plan (in the proper order)."*), never spawned into a development slot. **218 open rows, measured 2026-09-19 by SCHEDULER #2** (`grep -c '^| D-' docs/development/DEBT.md`); 223 before batch 1, which closed 4 in fact, placed D-158, routed D-325 and D-52 to BOB and carried 3. A single row whose verification needs a build or a long code trace goes to CONDUCT as its OWN row with its own id — never as "LED-7".
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).

### MK-3 · queued — ATTRIBUTION ON THE CASE CONTRIBUTION ACT — required and never prefilled, one of the four levels (group, project, the member's cover, the member by name); OFF-THE-RECORD as a STRUCTURAL ABSENCE — no field can hold a source's identity; … (whole text: the cut archive) — owner RECORD; surfaces are Program B's and are NOT rowed.
order: BOB #14's items 3 and 6 (2.firsthand, 13.attribution); MK-1 is done; its first act keeps an off-the-record account from leaking at publication (SCHEDULER, first order audit, 2026-09-18)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4 (attribution: chosen by the attesting member, carried with the act) and §Incomplete (the case act identified)
depends-on: MK-1; and the case contribution act IDENTIFIED at the artifact (§Incomplete) — if it cannot be identified, STOP and route to BOB
accepts-when: **FIRST (BOB #14, 2026-09-18): the published projection HONOURS the attribution level BEFORE any authored observation can be published — the author's handle sits in the bundle's provenance document and session log, so without this an off-the-record account leaks by construction. MK-1 lands a FENCE that refuses an authored bundle (and any finding or case containing one) at publication, if any path to publication exists; LIFTING THAT FENCE IS MK-3's OWN ACT, done only once the projection is proved to honour every level, with a control arm per level.** Then: through the case ops: each level round-trips into the published projection exactly as chosen; nothing is prefilled; off-the-record publishes no identity by construction; battery green by its COMPLETION LINE.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «MK-3». A worker READS IT before building.

### D-158 · queued — **A signing key registered for a member who never ENROLLED reads `active` on `op=signerlist` while `op=ratify` refuses it (`SIG_UNKNOWN_KEY`): the roster claims more than the gate grants.** Folded from DEBT.md by LED-7 batch 1 (SCHEDULER, 2026-09-19), keeping its id; verified not yet fixed at the code. — owner RECORD.
order: LED-7 batch 1: a correction to landed work where the record overclaims (a key reads active that ratify refuses), so ahead of features; small (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 — a refusal added at `op=signeradd` (IC minted with `node tools/mintid.mjs IC`; the integrator classifies)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` (enrolment, and signing keys as a member's), with the row's own analysis in `docs/archive/ledgers/DEBT-closed.md` («D-158», `node tools/ledger.mjs find D-158`): refusing at write is preferred over joining `members` at read.
depends-on: none.
accepts-when: `op=signeradd` for a member whose status is `invited` is refused by name; the same key after enrolment is added and reads `active`, and `op=ratify` accepts its signature; `op=signerlist` never shows `active` for a key `op=ratify` would refuse, asserted against the other view. NEGATIVE CONTROL: drop the enrolment check, and the invited-member arm fails by name. Battery green own-baseline by its COMPLETION LINE; `node tools/plancheck.mjs --local` then BARE.

### D-270 · running — **SPAWNED 2026-09-19 by CONDUCT #7. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: `C-39.2` and `C-39.3` appear ZERO times in `origin/main:bio-plane/checks/bio-checks.mjs`, so the item is NOT landed, checked by content. The branch `origin/worktree-agent-aafee89563a3f2d42` is EVIDENCE, not mergeable — 1573 commits behind. **The SEQUENCE CHECK reports to CONDUCT, not SCHEDULER: no SCHEDULER session is live** (SCHEDULER #2 stood down, #3 chipped and not started), and a report routed to a stood-down lane is a question nobody is present to read. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **SIX OPS ANSWER WITH NO REFUSAL CODE AT ALL, so DEC-49 cannot reach them — and for FIVE of them the session gate's sentence is FALSE** (the machine-credential sentence, sent where that is not the reason). Measured 2026-08-09. — owner RECORD.
order: FIRST, CONFIRMED by BOB #17: a false rationale SUPPRESSES ITS OWN BUG REPORT — a member told the absence is a DECISION will not report it as a gap. Above M0-78 because it reaches a MEMBER (SCHEDULER #2, 2026-09-19)
milestone: M8
interface: I3 — IC-55 is PROPOSED on the branch (2026-08-09), NEVER RESOLVED. The integrator re-reads its base and re-classifies.
design: DEC-49 with DEC-37/DEC-52's split. **RULED by BOB #17, 2026-09-19 — THREE sentences, not two:** (a) "not for a person" ONLY where that decision is recorded; (b) "your credential does not reach this verb", always sayable; (c) for an OMISSION, neither — state the fact, invent no rationale. Cite his folded home once on main.
depends-on: none. **SEQUENCE CHECK (BOB #17):** D-136's fix DELETES the refusal this row rewords, for its ops. When re-deriving, REPORT the intersection of these five with D-136's three to SCHEDULER before rewording; disjoint, and this order stands.
scope: **THE BRANCH IS EVIDENCE, NOT A MERGEABLE ARTIFACT.** `origin/worktree-agent-aafee89563a3f2d42` (`484ed359`) is **1573 commits BEHIND main**, its 180 lines in `index.mjs`. Read its suite, control and MEASUREMENTS; re-derive on current main. Still open: `C-39.2`/`C-39.3` are ZERO times in main's catalogue.
accepts-when: each of the six answers with a DEC-49 row (`code`, `check`, `translation`); the five send a true sentence under the three-sentence rule; `refusal-wire.test.mjs`' set-pin is CORRECTED with its reason and still fails BOTH ways. How a liar passes it: one generic code for all six, so each op's is pinned by name. NEGATIVE CONTROL: restore the single condition, and the five-op arm fails naming them.
added: 2026-09-19 · SCHEDULER #2 (LED-7 batch 2; found by CONDUCT #7; keeps its `D-` id).

### D-136 · queued — **THE §4.7 VOTE CANNOT BE CAST BY A PERSON, AND ON THE ONE REACHABLE PATH THE CALLER NAMES THE VOTER.** `adminendorse`, `adminremove` and `membercaps` are `["admin","probe"]`, in no session set; `by` is stamped only for `PROJECT_ACTIONS` plus two. Seven releases of governance arithmetic rest on attributions the caller supplies. — owner RECORD.
order: SECOND. A forgeable governance vote outranks the hole below it. Below D-270 on the GOVERNED TEXT, not my judgement — §4.7's *"Until it lands, the plane must not tell a member that this absence is a decision"* IS D-270's sentence (c), so D-270 precedes it (SCHEDULER #2, 2026-09-19)
milestone: M8
interface: I3 — session reach and a `by` stamp on three ops; the integrator mints and classifies it.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §4.7, the block "THE SECTION 4.7 VOTE CANNOT BE CAST BY A PERSON TODAY" (BOB #17, `95fb3e4c`).
depends-on: none. **D-134 is NOT beside this row:** its surface is placeable only ONCE THIS LANDS (§4.7) — a surface over an unfenced act is a second path in.
scope: **ONE LANDING; THIS ROW REFUSES TO BE SPLIT.** Server-stamp `by` from the session on `adminendorse`, `adminremove` AND `membercaps` (§4.9's capability edit, same bearer-only state) and give all three session reach, together. Either half alone is worse than neither: stamping without reach makes the vote unreachable; reach without stamping leaves it forgeable. D-421's class (C-32.14/C-32.15).
accepts-when: a signed-in administrator casts an endorsement, a removal vote and a capability edit, each stamped as THEM by the server; a bearer credential naming another administrator as `by` is REFUSED; the arithmetic still refuses an addition without consensus. How a liar passes it: honouring a sent `by` for a session caller, so the suite drives one sending another's id. NEGATIVE CONTROL: drop the stamp, and the forged-voter arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (LED-7; BOB #17's ruling `95fb3e4c`; keeps its `D-` id).

### D-432 · queued — **AN OPAQUE ID CAN BE REISSUED ACROSS A WHOLE-STORE PURGE, so a citation of the purged object silently resolves to a NEW one.** `allocId`'s counter never reissued, because `purge` keeps `seq`; `Store#mintOpaqueId` checks uniqueness against LIVE rows only, and a purge deletes those rows. A single-bundle purge does the same for its `PROJ` id. — owner RECORD.
order: THIRD, above M0-78. A correction to JUST-LANDED work, which outranks new work — and the failure is SILENT: a citation keeps resolving and answers the WRONG object, which outranks the instruments below it, blind rather than wrong. 1 in 10,000 per draw per prior id of that prefix and year: rare, not improbable (SCHEDULER #2, 2026-09-19)
milestone: M8
interface: I5 — one IC; the minter gains a table it consults.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7's minted-id rules, with the `op=purge` comment that is the precedent extended — *"allocid must never reissue an identifier that has already existed"* — and §7's legacy-residue bullet: **citations must keep resolving.**
depends-on: none. REC-151 (`8e14effe`) and REC-141 (`11aa7b13`) are on `origin/main`; this corrects the minter they landed.
scope: the row names the whole fix — a purge-exempt `minted_ids` table beside `seq`, written in the MINTER'S CALLER'S transaction, exempt from `purge` on `seq`'s reasoning, listed in `hygiene.test.mjs`' exemptions; and `#mintOpaqueId`'s `taken` asks it as well as the live rows. New tables go before the `host_governor` block.
accepts-when: an id minted, purged, then redrawn under a FORCED collision is refused by the ledger rather than reissued; `purge`'s own proof still passes with the table exempt. How a liar passes it: exempting the table without the minter reading it, so the arm FORCES a collision rather than trusting the write. NEGATIVE CONTROL: drop the ledger from `taken`, and that arm fails by name.
added: 2026-09-19 · SCHEDULER #2 (at REC-151's close, which made its `D-` id citable; keeps that id).

### M0-78 · queued — **TWO NEGATIVE CONTROLS MEASURE NOTHING: `caseproduction.control.mjs` arms (C) and (H) THROW INSIDE THE FIXTURE, on the old sources too, so their declared `mustFail` assertions are never evaluated and the control line claims coverage the evidence base does not have.** CONDUCT #7, 2026-09-19. — owner M0 / VERIFY.
order: AHEAD OF FEATURES though its prefix is M0 — a control that cannot fail makes the record claim more than it can support, which CLAUDE.md §2 grades worse than a missing feature. BOB #16's M0-last rule was written for M0 BUILD items, not an evidence-base hole. Placed HIGH **provisionally**; the doctrine call is ROUTED TO BOB (SCHEDULER #2, 2026-09-19)
milestone: M0
interface: none
design: `docs/development/VERIFICATION.md`'s negative-control process with CLAUDE.md §5 — a control is evidence only when it FAILS at a NAMED assertion.
depends-on: none. Verified at the code by SCHEDULER #2: both arms are registered in `bio-plane/test/caseproduction.control.mjs`, validated only by `preflight` from `bio-plane/scripts/armdecay.mjs`.
scope: diagnose the fixture-level throw; repair (C) and (H) so each arms and fails BY NAME with `mustNotFail` green. **AND WIDEN THE DETECTOR, the larger half:** `preflight` counts an arm's own QUOTE in the file it writes — it proves the ANCHOR is live and can never prove the FIXTURE runs, so this class is invisible BY CONSTRUCTION to the census built to catch dead arms. Arm (H) already records having silently stopped arming once (M0-25).
accepts-when: (C) and (H) run ALONE each fail at their declared named assertion, `mustNotFail` green; a fixture-level throw in ANY arm is reported as a DEAD ARM, not passed; restores verified by sha256 AND `cmp`. How a liar passes it: deleting or exempting the two arms, so the registered-arm count is asserted too. NEGATIVE CONTROL: break a healthy arm's fixture the same way, and the census names it.
added: 2026-09-19 · SCHEDULER #2 (CONDUCT #7's finding, verified at the code; `node tools/mintid.mjs M0`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | DS-1 — **its blocker is now DISCHARGED** (DS-1 done above). **UNDETERMINED, and stated rather than rounded off:** DIST #2 said plainly it did NOT verify DS-3, and `BIO_Distribution_v0_1.md` §8 makes no satisfied-claim for it either — so nobody has looked. Not absence of the work, absence of a reader. DIST's to take up |
| FLEET | FL-6 | the Claude-account cascade at runtime | **DS-3** |
