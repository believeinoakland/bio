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

### REC-151 · running — **SPAWNED 2026-09-19 by CONDUCT #6. DEPENDS-ON CHECKED AGAINST THE CODE at spawn: REC-141's opaque `PROJ-` mint is on `main` (11aa7b13); `CASE`/`DRAFT`/`RVG` still mint from `allocId`'s counter. Falsify rather than believe: a live worker holds an `agent-*` worktree with a claim on the paths its scope names; if none does, this row is UNDETERMINED between `queued` and done-awaiting-integration — READ THE BRANCH, and never conclude `queued` from the absence alone.** **Prior state, kept as the record: queued** — **A MINTED ID CARRIES NO COUNT, for every other gated prefix: `CASE`, `DRAFT`, `RVG` minted OPAQUE (a CSPRNG suffix, checked unique), and `op=allocid` REFUSES every gated prefix, `PROJ` included (BOB #16, 2026-09-19).** `allocId`'s `seq` is per prefix per year, so a sequential id counts objects a caller cannot see — a §7.9 DISCLOSURE, ahead of features. — owner RECORD.
order: a §7.9 disclosure (a sequential id counts hidden objects); REC-141 is ON MAIN (11aa7b13), so runnable; above the UI corrections at BOB #16's direction (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 — `op=allocid` gains a refusal, so the integrator classifies (IC minted with `node tools/mintid.mjs IC`)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7, the bullets "A MINTED ID CARRIES NO COUNT" and "The legacy residue" (BOB #16, `d7ce3f86`).
depends-on: REC-141 (its opaque `PROJ-` mint is the pattern this row extends) — MET: `11aa7b13` is an ancestor of `origin/main`, verified by SCHEDULER #2, 2026-09-19. The earlier text “parked with UI-66, not yet on main” was true when written and is now false; corrected rather than left, because a worker reads this line. — CHECK AT THE CODE at spawn.
scope: enumerate every `allocId` caller and state, per prefix, gated (opaque) or shared (counter kept); mint the gated ones opaque; refuse gated prefixes at `op=allocid`; COUNT the legacy non-`PROJ-` project ids in the record namespace for the limitation's statement. Existing ids are never rewritten.
accepts-when: two mints in a row of each gated prefix do not differ by one; `op=allocid` with a gated prefix is refused; the per-prefix table and the legacy count are in the landing. How a liar passes it: a suffix from `Math.random` or derived from the counter passes a "not sequential" arm and is still predictable, so the suite asserts the CSPRNG source by name. NEGATIVE CONTROL: restore the counter for one prefix, and its arm fails by name. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (BOB #16's inbox entry `d7ce3f86`, item 2; id minted with `node tools/mintid.mjs REC`).

### UI-67 · queued — **THE QUESTION'S PAGE RENDERS THE NO-PROJECT CONCLUSION with `noProjectConclusionHtml` from `getProjection`, and invalidates `PROJ_CACHE` for that inquiry when a conclusion or a withdrawal lands (BOB #16, 2026-09-19).** — owner UI.
order: REC-144 is ON MAIN (071e34dc), so runnable: the question page renders its read (SCHEDULER, 2026-09-19)
milestone: M9
interface: I3 consumer (of REC-144's IC)
design: `docs/development/INVESTIGATIVE-SESSION.md` §7.1, the paragraph "The question's page reads the no-project conclusion from `op=projection`" (BOB #16, `7c150df0`).
depends-on: REC-144 — CHECK AT THE CODE at spawn. And REC-142 (done, `3203139b`).
scope: `civicos-ui/app.html`'s question page reads the field from `getProjection` and renders it with the existing `noProjectConclusionHtml`; the projection cache entry for the inquiry is invalidated on a conclusion or a withdrawal. **ALSO (SCHEDULER, 2026-09-19, from REC-142's landing): discharge the DELEGATION 2026-09-18 RECORD (REC-142) -> UI in `CLAIMS.md`** — on a question concluded with no project, the question page's no-project conclude dialog is now offered to a joined member and then refused `ILLEGAL_TRANSITION`; UI decides whether to point it at the stance page, and the harness asserts no dialog is offered that the plane then refuses.
accepts-when: the UI harness concludes an inquiry with no project against the real plane and the question's page shows it; a withdrawal clears it without a reload. `bound-sweep` ARM G stays green with NO new CARRIED-OUT-WHOLE entry — the read is uncapped, so an exemption added to pass ARM G is the defeat. NEGATIVE CONTROL: drop the cache invalidation, and the withdrawal arm fails naming it.
added: 2026-09-19 · SCHEDULER (BOB #16's inbox entry `7c150df0`, item 2; id minted with `node tools/mintid.mjs UI`).

### UI-72 · queued — **`civicos-ui/app.html`'s `actRefusalHtml` SHOWS A REFUSAL's `detail` EVEN WHEN THE PLANE SENDS A CANNED `translation`, on every surface that uses it — the member reads the plane's internal wording instead of its label.** Found by UI-66, routed by CONDUCT #6, 2026-09-19; fix named. A correction to landed surfaces. — owner UI.
order: a correction to landed surfaces (refusals show internal detail over the plane's label); with the corrections, after UI-67 (SCHEDULER, 2026-09-19)
milestone: M8
interface: I3 consumer (no plane change)
design: DEC-49 (`node tools/decided.mjs "DEC-49"`) as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it — *refusals carry the plane's own label*: every condition has a named code and a canned translation — and the rule `acquireWhy` already applies in `app.html`.
depends-on: none.
scope: `actRefusalHtml` renders the `translation` first when the plane sends one (as `acquireWhy` does), the `detail` only where no translation exists; `version-review` §7's pinned wording is CORRECTED in the same change with its reason. Every surface calling `actRefusalHtml` is listed in the landing.
accepts-when: the harness drives a refusal that carries a translation on each listed surface and sees the translation; one without a translation still shows the detail; `node civicos-ui/test/run.mjs` from the repo root, unpiped, exit 0; `node tools/plancheck.mjs --local` then BARE. How a liar passes it: dropping `detail` everywhere, so the no-translation arm must still show it. NEGATIVE CONTROL: restore detail-first, and the translation arm fails by name.
added: 2026-09-19 · SCHEDULER (UI-66's finding, routed by CONDUCT #6; id minted with `node tools/mintid.mjs UI`).

### LED-7 · queued — **THE FOLD: every open DEBT row TRIAGED AT THE CODE and archived by one of three doors (closed in fact with its evidence · a BACKLOG item in build order keeping its `D-` id · a stated permanent limitation in its home design); then DEBT.md archived whole and new defects written straight into the backlog.** — waits on LED-6 (it writes into the backlog LED-6 creates). **EXEMPT FROM THE M0 HOLD BY NAME.**
order: the debt fold: until it runs, ~222 open DEBT rows — among them disclosure defects that would outrank features — stand outside the order, so the plan cannot be proved in order without it (SCHEDULER, first order audit, 2026-09-18)
milestone: M0 (process, Bob's direction 2026-09-18: *"those debts should be appropriately folded into the build plan so that those debts are retired - in the right build order."*)
interface: none
design: `docs/development/VERIFICATION.md` (admitted for M0 by name), read with `docs/development/WORK-PIPELINE.md` §3, which carries LED-7's design and accepts-when.
depends-on: LED-6
scope: as §3 states — batches of ~20 rows under workers; 222 open rows measured by BOB, 6 of them pointing at an open queue item.
accepts-when: as §3 states it.
added: 2026-09-18 · CONDUCT #5 (BOB #15's inbox entry of that date).

### REC-135 · queued — §7.1 ITEM 4: A PROJECT'S CONCLUSION REACHES THE CASE — `op=publish`'s `NOT_CONCLUDED`, `op=reopen` and legs resting on an inquiry read the PROJECT's conclusion (REC-124's `conclusions[]` row), not the inquiry's own shared state; the … (whole text: the cut archive) — owner RECORD.
order: first feature: BOB #14 item 2 (8.claim) — the project conclusion reaching the case; REC-136 is ON MAIN since c7f2df67, so it is runnable (SCHEDULER, 2026-09-18)
milestone: M8
interface: I3, and I5 if the case bytes or schema carry the adoption (ICs minted with `node tools/mintid.mjs IC`; whether an inquiry's own `concluded` changing meaning for a case is breaking is THIS IC's to decide, per IC-150's resolution).
design: `docs/development/INVESTIGATIVE-SESSION.md` §7.1 item 4, with `BIO_Case_Making_v0_1.md` "What a CLAIM is" and the State Rules §4 amendment §7.1 carries.
depends-on: REC-136 — sequenced by CONDUCT #5 (mechanism, CONDUCT's own): BOB's §7.1 item 8 rules that item 4 does NOT depend on item 6, and it does not. But item 4 READS a project's conclusion, and REC-136 changes that record from a replaceable row into an APPEND-ONLY HISTORY (item 7). Building … (whole text: the cut archive)
accepts-when: two projects on one shared inquiry, one concluded and one not: the concluded one can publish a case that records ITS adopted claim, and the other gets `NOT_CONCLUDED`. A legacy published case verifies byte-identically. How a liar passes it: reading the inquiry's own state passes when both projects agree, so the two projects must DISAGREE. NEGATIVE CONTROL: point the publish gate back at the inquiry's shared state, and the disagreement arm fails.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «REC-135». A worker READS IT before building.

### MK-3 · queued — ATTRIBUTION ON THE CASE CONTRIBUTION ACT — required and never prefilled, one of the four levels (group, project, the member's cover, the member by name); OFF-THE-RECORD as a STRUCTURAL ABSENCE — no field can hold a source's identity; … (whole text: the cut archive) — owner RECORD; surfaces are Program B's and are NOT rowed.
order: BOB #14's items 3 and 6 (2.firsthand, 13.attribution); MK-1 is done; its first act keeps an off-the-record account from leaking at publication (SCHEDULER, first order audit, 2026-09-18)
milestone: M3 — the member's own knowledge enters the record as what it is
interface: I3
design: `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` §4 (attribution: chosen by the attesting member, carried with the act) and §Incomplete (the case act identified)
depends-on: MK-1; and the case contribution act IDENTIFIED at the artifact (§Incomplete) — if it cannot be identified, STOP and route to BOB
accepts-when: **FIRST (BOB #14, 2026-09-18): the published projection HONOURS the attribution level BEFORE any authored observation can be published — the author's handle sits in the bundle's provenance document and session log, so without this an off-the-record account leaks by construction. MK-1 lands a FENCE that refuses an authored bundle (and any finding or case containing one) at publication, if any path to publication exists; LIFTING THAT FENCE IS MK-3's OWN ACT, done only once the projection is proved to honour every level, with a control arm per level.** Then: through the case ops: each level round-trips into the published projection exactly as chosen; nothing is prefilled; off-the-record publishes no identity by construction; battery green by its COMPLETION LINE.
cut: this row is cut to its fields (LED-6 step (3), SCHEDULER, 2026-09-19); its full text — headline, scope, accepts-when and controls — is VERBATIM in `docs/archive/ledgers/QUEUE-cut-2026-09-19.md` under «MK-3». A worker READS IT before building.

### REC-146 · queued — **CONTRADICTION'S IDENTIFY, 1 of 3: THE PAIRING READ — the plane forms candidate pairs by the four keys, viewer-gated and bounded per key, and states which level was empty; NO judgement and NO write.** — owner RECORD.
order: BOB #14's item 5 (8.contradiction), after the claim and attribution rows it follows; the pairing read first (SCHEDULER, 2026-09-19)
milestone: M9
interface: I3 (an IC minted with `node tools/mintid.mjs IC`)
design: `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` §2 (pairing is the plane's), §4 (the keys K1–K4), §6 (visibility, bounds, the empty-level statement) and §9 item 1, beneath `BIO_Case_Making_v0_1.md` §CONTRADICTION.
depends-on: none in code — CHECK AT THE CODE at spawn.
scope: §4's four keys, viewer-gated (§7.9, Membership §7 item 7.14), bounded PER KEY with `limit`/`truncated`, §6's empty-level statement (four distinct facts, never a bare empty list), and a count of pairs NOT formed because a date or doctype was undetermined.
accepts-when: through the op, each key's pair count on a fixture whose count is exact; the empty-level statement distinguishes its four facts; an unseen project's material forms no pair. How a liar passes it: a key that silently widens its join finds more pairs, so each key's join is pinned by an exact-count fixture. NEGATIVE CONTROL: widen one key's join, and its pinned count fails by name. Battery green own-baseline by its COMPLETION LINE; `node scripts/coverage.mjs --strict` exit read UNPIPED; `node tools/plancheck.mjs --local` then BARE.
added: 2026-09-19 · SCHEDULER (BOB #16 inbox "CONTRADICTION'S IDENTIFY IS DESIGNED", item 1).

### D-158 · queued — **A signing key registered for a member who never ENROLLED reads `active` on `op=signerlist` while `op=ratify` refuses it (`SIG_UNKNOWN_KEY`): the roster claims more than the gate grants.** Folded from DEBT.md by LED-7 batch 1 (SCHEDULER, 2026-09-19), keeping its id; verified not yet fixed at the code. — owner RECORD.
order: LED-7 batch 1: a correction to landed work where the record overclaims (a key reads active that ratify refuses), so ahead of features; small (SCHEDULER, 2026-09-19)
milestone: M10
interface: I3 — a refusal added at `op=signeradd` (IC minted with `node tools/mintid.mjs IC`; the integrator classifies)
design: `docs/architecture/BIO_Membership_Architecture_v2.md` (enrolment, and signing keys as a member's), with the row's own analysis in `docs/archive/ledgers/DEBT-closed.md` («D-158», `node tools/ledger.mjs find D-158`): refusing at write is preferred over joining `members` at read.
depends-on: none.
accepts-when: `op=signeradd` for a member whose status is `invited` is refused by name; the same key after enrolment is added and reads `active`, and `op=ratify` accepts its signature; `op=signerlist` never shows `active` for a key `op=ratify` would refuse, asserted against the other view. NEGATIVE CONTROL: drop the enrolment check, and the invited-member arm fails by name. Battery green own-baseline by its COMPLETION LINE; `node tools/plancheck.mjs --local` then BARE.

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | FL-2 (landed) — **`BIO_Distribution_v0_1.md` §8 (BOB #11, 2026-09-14) finds this SATISFIED by D-297's closing; not marked done here by CONDUCT: DIST #2 confirms at its next touch (routed by CONDUCT #11 at the drain)** |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | DS-1 — **same finding as DS-1 (`BIO_Distribution_v0_1.md` §8): satisfied by D-297's closing per BOB #11; DIST #2 confirms** |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | DS-1 |
| FLEET | FL-6 | the Claude-account cascade at runtime | **DS-3** |
