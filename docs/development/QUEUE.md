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

**The next rows of the build plan, in order** (`docs/development/WORK-PIPELINE.md` §1): those `running`, then the next runnable `queued` rows, at most 16 in all (`CACHE_ROWS`, sized to CONDUCT's capacity plus spare: Bob, 2026-09-23, `WORK-PIPELINE.md`). **At most 10 worker sessions are live at once** (Bob, 2026-09-24 ~03:08Z, via BOB #32; until 05:00Z, then 6, and no new spawn from 06:00Z): a `running` row whose worker has FINISHED and awaits integration holds no session, so the cache keeps a few `queued` rows behind the live ten and no slot waits. The order CONTINUES at the top of `docs/development/BACKLOG.md`. SCHEDULER replenishes this section with `node tools/ledger.mjs refill` as rows complete; CONDUCT flips a row here `queued` → `running` before its spawn. Each row's `order:` line says why it is where it is. A row marked `cut:` names where its full text sits; a worker reads that before building.

### D-498 · queued — **CONSTRUCT CLAIM `1.discoverable` SAYS THE DIRECTORY "LISTS A MEMBER'S DISCOVERABLE PROJECTS", but since D-479 it lists AT MOST `PROJECT_DIRECTORY_LIMIT` and says `truncated`.** Found by D-479's worker. — owner RECORD.
order: at the backlog head: the record claiming more than the plane does, one line (CLAUDE.md §2; SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z)
milestone: M8
interface: none.
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (item 7.14).
depends-on: D-479 (its train).
scope: amend the claim to "at most the cap, stated as truncated"; add a probe pinning `PROJECT_DIRECTORY_LIMIT`.
accepts-when: `node tools/status.mjs discoverable` reads the capped claim and its probe passes. NEGATIVE CONTROL: rename the constant and the probe fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-497 · queued — **THE PROJECT DIRECTORY'S CANDIDATE SCAN IS STILL LINEAR IN THE GROUP'S PROJECTS: `#sight` is a JS predicate, so D-479's page bounds the ANSWER but not the rows read.** Found by D-479's worker. — owner RECORD.
order: after D-495: a bound on work, not on disclosure; the answer is already capped (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:49Z)
milestone: M8
interface: none (I5 additive if an index table is added; the integrator classifies).
design: `docs/architecture/BIO_Membership_Architecture_v2.md` §7 (items 7.9, 7.14): one sight rule, never a second copy.
depends-on: D-479 (its train).
scope: give sight a row source it reads (an owner-set-derived index) so the candidate query bounds in SQL, with the sight rule stated once.
accepts-when: `bounds.test.mjs` shows the candidate read bounded. NEGATIVE CONTROL: restore the JS filter over the unbounded scan and the bounds arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### UI-100 · queued — **UI MOCKS OF THE PLANE'S REFUSALS ARE NARROWER THAN THE WIRE, ACROSS TWO FAMILIES: seven `unknown op` mocks carry no `translation` (act-proposal ×2, queue ×2, auth-surface, case-frozen-pair, document-structure; four compose "unknown op " + op, a sentence the plane never sent), and `requiredArgument`'s eight plane sites all carry C-61.1's translation while `publishedcase.test.mjs` mocks publishedbytes with `error` alone.** UI-84's class, found by its worker. — owner UI.
order: after UI-99, with the UI corrections to landed wire shapes (SCHEDULER #18, 2026-09-24; via CONDUCT #20 04:26Z)
milestone: M4
interface: none (test mocks).
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, with UI-84's derivation as the precedent.
depends-on: UI-84 (its train).
scope: build every such mock from `DISPATCH_CHECKS.UNKNOWN_OP` / the requiredArgument catalogue as UI-84 does, correcting the composed forms to the wire's shape; drive each surface and state whether it RENDERS the refusal or only gap-detects it; also correct `planeSaid`'s stale comment in `app.html` (it cites two sentences D-278 replaced).
accepts-when: no mock in the two families types a refusal by hand. NEGATIVE CONTROL: retype one mock's `error` without `translation` and the derivation arm names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs UI`).

### REC-195 · queued — **THE GOVERNING-LAWS LIST HAS NO MACHINE PROPOSAL: D-149 built the member's act and the machine refusal; the design's labelled machine proposal (*if built*) is not.** — owner RECORD.
order: after UI-90, a feature below the corrections: the list is complete without it (SCHEDULER #17, 2026-09-23; D-149's worker via CONDUCT #18)
milestone: M10
interface: I3 additive — a proposal read labelled machine work; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (*A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*): *a machine PROPOSAL, if built, is labelled machine work*.
depends-on: D-149 (`integrated` on c17-batch7).
scope: a proposal of citations and levels for an action, stored apart from the member's list and labelled machine work; it never sets the list, which only the member's act does.
accepts-when: a proposal is read labelled machine work, and the action's list is unchanged until the member acts. NEGATIVE CONTROL: let the proposal write the list, and the "the list is the member's" arm fails by name. New suite `bio-plane/test/rec195-laws-proposal.test.mjs`.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs REC`).

### M0-153 · queued — **CITING AN M-ID IN A SUITE'S PROSE MAKES THAT SUITE A MEASUREMENTS READER: `gates.mjs` `selectReaders` counts a bare `M-<n>` mention, comments included, contradicting "a comment reads nothing"; `statepaths` UNITS_CEILING then has zero slack against a MEASUREMENTS change.** Found by D-481's worker; M0-143 blanks comments only in the doc-facing selector. — owner M0.
order: after M0-150, with the gate-time rows (M0-146 is cached) (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:21Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (the gate runs the class the diff measures).
depends-on: M0-143.
scope: `selectReaders` reads through M0-143's comment-blanking (`codeOf`); re-derive UNITS_CEILING from its print.
accepts-when: a suite citing an M-id only in a comment is not a MEASUREMENTS reader. NEGATIVE CONTROL: read raw source and that suite is selected, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-154 · queued — **FOUR SUITES BUILD A FIXTURE REPO BY COPYING THE GATE'S TOOLS FROM A HAND-KEPT LIST (entries, gateresults, train, gates), so any new import in `gates.mjs` breaks them with ERR_MODULE_NOT_FOUND.** Found by M0-146's worker's first red. — owner M0.
order: after M0-153, with the gate-time rows: each new gate import costs a red round (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:33Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a fixture derives what it depends on, never a copy kept by hand).
depends-on: none.
scope: derive each suite's copy list from `gates.mjs`'s static imports (transitively), in one shared helper.
accepts-when: a new import added to `gates.mjs` leaves the four suites green. NEGATIVE CONTROL: restore one hand list, add an import, and that suite fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-155 · queued — **A CONSTRUCT PROBE WHOSE `hit` IS A STRING A COMMENT COULD CONTAIN CAN GO FALSE-GREEN: `8.risk-tier`'s probe was reading its own explanatory comment.** Found by D-483's worker. — owner M0.
order: after M0-154, with the instruments that can pass on nothing (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:53Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a check that cannot fail is worse than none).
depends-on: none.
scope: `status.mjs` probes match code with comments blanked (walkfloor's `stripComments`); re-read every claim and name any that flips.
accepts-when: `node tools/status.mjs --check` reads 0 drift with comments blanked. NEGATIVE CONTROL: a probe whose only match is a comment reads NOT BUILT, by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-157 · queued — **`gates.control.mjs` ARM G5 FAILS ITS OWN DECLARED ISOLATION ON MAIN (85/3): with the clean-at-start check removed, "a DIRTY tree is NOT recorded" breaks, although G5 declares the end-of-run check backs it.** Pre-existing; found by M0-146's worker. — owner M0.
order: after M0-156, with the gate instruments: a hand-run driver, not a battery arm (SCHEDULER #18, 2026-09-24; via CONDUCT #20 06:00Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a control's declared isolation is a claim to verify).
depends-on: none.
scope: read the armed run to find which path writes the second record (§2d reuse or early exit, or §4 fall-through); then restore the redundancy, or correct G5's declaration at its site.
accepts-when: G5 arms as declared, or its declaration states what it actually proves. NEGATIVE CONTROL: G5 itself, re-run after the change.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### M0-158 · queued — **FIVE DELEGATION BLOCKS IN coord `CLAIMS.md` CONTRADICT EACH OTHER AND NAME NO OWNER (near lines 17518, 18785, 19053, 19319, 19926 at 2026-09-24), so no lane is answerable for what they delegate.** Found by D-495's worker. — owner M0 (with each named area).
order: after M0-157, with the process rows (SCHEDULER #18, 2026-09-24; via CONDUCT #20 06:02Z)
milestone: M0
interface: none.
design: `docs/development/VERIFICATION.md` (a claim with no owner is a claim nobody verifies), with ORCHESTRATION.md "COMMUNICATING A CHANGE" for the DELEGATION form.
depends-on: none.
scope: read each block, name its owner, resolve each contradiction to one statement, and release or place what each delegates; a coord write, not a `main` commit.
accepts-when: each of the five names one owner and no two contradict. NEGATIVE CONTROL: none (a ledger edit).
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs M0`).

### DIST-13 · queued — **THE INSTALLER'S FALLBACK PLANE IS SEVEN RELEASES STALE: `newgroup/dist/newgroup.bundled.mjs` embeds RELEASE_VERSION 0.71.0 while `newgroup/src/release.mjs` carries signed 0.78.0 (verified at d536f834), and nothing guards the bundle's freshness.** Found by D-481's worker. — owner DIST (M0/FLEET for the guard).
order: after DIST-11, with DIST's rows: an unverified fallback that serves an old plane is a correction to the distribution record (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:21Z)
milestone: M8
interface: none.
design: `docs/architecture/BIO_Distribution_v0_1.md` §5 "The installer" and §3 "The release".
depends-on: none.
scope: NARROWED 2026-09-24 06:01Z (SCHEDULER #18): the REBUILD is done (land/dist/newgroup-dist-078 @ cfe2d0cc, on c20-batch17, 0.71.0 → 0.78.0 from newgroup/src at d536f834); what remains is an FL-9-shaped freshness guard asserting the bundle's embedded RELEASE_VERSION, and its source, equal `release.mjs`'s — DIST's caveat: after DIST-9 lands the rebuilt bundle LAGS DIST-9's installer code until rebuilt, which this guard catches.
accepts-when: the guard passes on the rebuilt bundle. NEGATIVE CONTROL: restore the 0.71.0 bundle and the guard fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs DIST`).

### UI-92 · queued — **THE WORKSPACE CANNOT SHOW A PROJECT'S DRAFTS.** REC-198's list, rendered. — owner UI.
order: directly after REC-198 (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 consumer (REC-198's IC).
design: `docs/architecture/BIO_Publication_v0_1.md` §6A.4, with BOB #32's ruling of 2026-09-23 23:08Z (cite until folded).
depends-on: REC-198.
scope: the workspace lists the project's drafts from the plane's read; each opens.
accepts-when: every draft the plane lists appears and opens. NEGATIVE CONTROL: stub the list empty, and the listed-draft arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (`node tools/mintid.mjs UI`).

### D-505 · queued — **NOTHING STOPS A MACHINE CREDENTIAL FROM CHANGING A RISK TIER A MEMBER SET: BOB #32's rule of 2026-09-24 (once a member sets a tier, no machine may change it, not even back to undetermined) is NOT BUILT, and no fence refuses a machine promote that writes a determined tier.** Found by D-483's worker. — owner RECORD.
order: at the backlog head: an authority boundary on the one field carrying legal exposure (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:53Z)
milestone: M7
interface: I3 MAJOR — a refusal where an answer stood; the integrator classifies.
design: `docs/architecture/BIO_Case_Making_v0_1.md` §2 (`risk_tier`: only a member's authored act sets 1, 2 or 3), with BOB #32's 2026-09-24 rule (cite until folded).
depends-on: D-483.
scope: a machine-fence refusal (catalogued, DEC-49 translation) on any machine write of a determined tier, or a change to a member-set one; D-494's harvest/catalogue agreement arm covers it.
accepts-when: a machine promote writing a tier is refused by name; a member's own set is admitted. NEGATIVE CONTROL: drop the fence and the machine arm is admitted, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-503 · queued — **FIVE MACHINE/OPERATOR FENCES IN `index.mjs` ARE CATALOGUED AND MINTED BUT NEVER DRIVEN: MACHINE_CANNOT_RATIFY, MACHINE_CANNOT_RATIFY_CASE, OPERATOR_TOKEN_CANNOT_RATIFY, _RATIFY_CASE and _GOVERN are outside `machine-fences.test.mjs`'s corpus (the `store.mjs` family only).** Found by D-494's worker (18 = 18 catalogued and minted). — owner RECORD.
order: at the backlog head: the authority boundary that no machine attests, with five of its fences asserted by nothing (SCHEDULER #18, 2026-09-24; via CONDUCT #20 05:33Z)
milestone: M7
interface: none.
design: `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 4 (no machine credential performs the attested act).
depends-on: D-494.
scope: extend `machine-fences.test.mjs` to drive each `index.mjs` fence with a machine or operator credential on a payload that would otherwise succeed, asserting the named refusal.
accepts-when: all five refuse by name through the op. NEGATIVE CONTROL: remove one fence's check and its arm is admitted, failing by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### D-506 · queued — **A FAILING CANARY READS AS A BARE BOOLEAN: `op=livefire` answers `ok:false` with no reason, code or error (status 500) when its 19-assertion self-test fails (`livefire.mjs` ~192-201, `index.mjs` ~6438), so a caller learns nothing exactly when it matters.** Found by D-495's worker. BOB #32 RULED (b), 2026-09-24 06:10Z (cite until folded): `ok` keeps meaning the op answered; the result moves to `verdict: "pass"|"fail"` with `failing: [names]` (empty on pass) under `ok:true`, HTTP 200. — owner RECORD (DIST updates its release check).
order: after D-503: the record staying silent where it must speak, on the release's own canary (SCHEDULER #18, 2026-09-24)
milestone: M8
interface: I3 MAJOR — `ok`'s meaning narrows for this op; an IC entry; the integrator classifies.
design: `docs/architecture/BIO_Distribution_v0_1.md` §6 "The deploy-to-serve ladder" (the live verification), with BOB #32's ruling of 06:10Z (cite until folded).
depends-on: none.
scope: return `verdict` and `failing`; `ok:false` only for a catalogued refusal; update in the SAME landing every caller that reads livefire's `ok` as the verdict (grep: battery.mjs, coverage.mjs, affordances.mjs, newgroup/src/release.mjs, DIST's release check, any UI).
accepts-when: a broken assertion yields `ok:true, verdict:"fail"` naming it. NEGATIVE CONTROL: break one assertion and drop its name from `failing`, and the arm fails by name.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

### REC-194 · queued — **AN ACKNOWLEDGEMENT MAY MATCH ANOTHER CASE WHOSE STATEMENT IS BYTE-IDENTICAL: D-150 binds it to the statement's bytes, not to ONE case identity.** Publication §3 rule 13 (folded): *an acknowledgement binds to ONE case identity; it never matches another case whose statement is byte-identical.* — owner RECORD.
order: (held behind REC-193: both edit the statementack code; CONDUCT #20 05:08Z) directly after REC-193, the same block (SCHEDULER #17, 2026-09-23)
milestone: M10
interface: I3 — the `statementack` op's binding narrows to one case; the integrator mints and classifies the IC.
design: `docs/architecture/BIO_Publication_v0_1.md` §3 rule 13 (BOB #32's ruling, folded).
depends-on: D-150, REC-193.
scope: an acknowledgement records and is matched by the case identity it was given for; a second case in the project with byte-identical statement text lists none of the first's.; and the DRAFT DOOR matches only the draft's own document/case, never an unsigned edition-1 document of another case with the same statement text (widened by SCHEDULER #18 2026-09-24 on BOB #32's 03:40Z instruction via CONDUCT #20; c18-batch7fix's finding). Extend D-150's suite.
accepts-when: two cases with identical statements, one acknowledged: the other's completeness block lists nobody; and two cases' unsigned edition-1 documents with identical statements: the draft door of one finds none of the other's. NEGATIVE CONTROL: match by statement hash alone, and the "the twin case lists nobody" arm fails by name; match the draft door by statement text across the project, and the draft-door arm fails by name.
added: 2026-09-23 · SCHEDULER #17 (BOB #32's G3; `node tools/mintid.mjs REC`).

### D-507 · queued — **SIX STATEMENT_ACK_* REFUSALS REACH A MEMBER UNTRANSLATED: NO_SUBJECT, ALREADY_SIGNED, NOT_A_PARTICIPANT, NO_STATEMENT, BY_ITS_AUTHOR and REC-193's AUTHOR_UNDETERMINED have no row in any `*_CHECKS` family (only DOCUMENTS_OVER_BOUND, C-82.1, does), so the member reads the plane's authored `detail` with no DEC-49 translation.** Found by UI-89's worker. — owner RECORD (BOB sees the six sentences' wording).
order: at the backlog head: refusals a member cannot read, on a landed surface (SCHEDULER #18, 2026-09-24; via CONDUCT #20 07:19Z)
milestone: M10
interface: I3 additive — six catalogued codes; the catalogue version moves; FULL gate.
design: DEC-49, as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it, following REC-79's single-helper shape.
depends-on: REC-193.
scope: rows C-82.2..C-82.7 in STATEMENT_ACK_CHECKS inside a DEC-49 REGION; route acknowledgeStatement's returns through its `refusal` helper; rebuild the bundle; move check-refusal-codes' floors from the print.
accepts-when: each of the six arrives with its translation. NEGATIVE CONTROL: return one code outside the helper and the DEC-49 guard names it.
added: 2026-09-24 · SCHEDULER #18 (`node tools/mintid.mjs D`).

## TRACKED ELSEWHERE — open plan rows whose ids another file allocates

`docs/archive/IS-BUILD-PLAN.md` ALLOCATES these ids as track-table rows, so a `### <ID> ·` heading here would allocate them a second time (`plancheck` fails that). Their status is tracked here until each is rowed under an id this file may open, or closed. DS-1/DS-2 are DIST-5's subject; DS-3 and FL-6 are routed to DIST and FLEET.

| who | row | what | blocked on |
| --- | --- | --- | --- |
| RECORD | PL-16 | the published case (IS-8, M10) — **RESHAPED BY DEC-72, not merely blocked.** Its finding-side stamping and its NO-case-level-bar assumption are both overtaken; `CASE-AS-PRODUCTION.md` and the CASE-1..CASE-6 rows are the live decomposition | **Bob** (DEC-33's ceremony deferral) **AND now DEC-72's redesign.** Read the design doc before touching it — supersession is never silent, so the row keeps its id and names what overtook it |
| **DIST** | DS-1 | D-115 — the installer installs the FLEET | **DONE 2026-09-19 — THIS TABLE WAS THE RECORD THAT WAS WRONG, corrected here with the reason (DIST-5's own act).** Landed at `8decf468` ("D-297: the installer installs the FLEET — verified, templated, degrading per member, on install AND update"). DIST #2 confirmed at its touch; VERIFIED INDEPENDENTLY BY SCHEDULER #2 AT THE CODE, not from either row: `8decf468` is an ancestor of `origin/main`, and `newgroup/src/index.mjs` carries a section headed "the fleet (IC-82/D-297)" and names `fleet` **27 times** — D-297's own opening measurement was that this file mentioned it **zero** times, which is the evidence from D-297 itself that DIST-5's accepts-when demanded |
| **DIST** | DS-2 | D-116 — version authority spans the fleet | **DONE 2026-09-19**, landed at `da3d4f17` ("DS-2: the version authority spans the fleet — and five of six sites disagreed with it"). VERIFIED BY SCHEDULER #2 AT THE CODE: ancestor of `origin/main`; `bio-plane/scripts/resolve-version.mjs` CONSUMES FLEET's own `discoverMembers` rather than re-implementing it, so the set checked cannot drift from the set built, and takes `bio-plane/package.json` as THE authority; `tools/release-assemble.mjs` refuses `VERSION_SKEW` and `VERSION_DISAGREES`; `resolveversion.test.mjs` arms BEHIND (ARM 2) and AHEAD (ARM 3) — the direction a one-sided check misses |
| **DIST** | DS-3 | the account cascade config (instance-level token; minting is a MEMBER act) | **D-260, PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling (its item 2 is DIST's deploy half).** Before that: **D-260 — NARROWED, and no longer blocked on DS-1 or unread** (DIST #3, then FLEET #3, 2026-09-21; verified at the code by SCHEDULER #4): its CONFIG half LANDED at `2de6f25f` (2026-09-12 — `instanceClaudeStatus`/`instanceClaudeToken` in `tokens.mjs`, the deploy sending and keeping the secret, the denylist's revocation-by-publication). Its acceptance — a configured instance token resolving at FL-6's third level — cannot be met by ANY configuration until the plane's calling side exists: `AGENT_WORKER` and `claude_accounts` occur 0 times in `bio-plane/src`, and `instanceClaudeToken` has no non-test caller. The dispatch fix is named on D-260. The member and project token surfaces are ABSENT, a design question DIST #3 sent to BOB |
| FLEET | FL-6 | the Claude-account cascade at runtime | **D-260 (the plane's caller does not exist), PLACED 2026-09-21 in `BACKLOG.md` on BOB #22's ruling**; FL-6's member half LANDED at `f5ed2bfa` (2026-09-12) and DS-3's config half at `2de6f25f` — DIST #3 and FLEET #3, verified by SCHEDULER #4 |
