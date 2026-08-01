# Decisions for Bob: the return channel

Established 2026-07-31 at Bob's direction. `QUEUE.md`'s `BOB INBOX` carries changes
DOWN from the BOB session to CONDUCT. **This file carries questions UP.** Without it
the channel ran one way: a worker or CONDUCT raising something architectural had to
put it in CONDUCT's own session window, which is the wrong room to discuss it in and
leaves the reasoning in a transcript rather than in the record.

## How it flows

1. **A worker or CONDUCT raises a decision item** at the close of its turn, in the
   shape `kickoffs/README.md` defines. CONDUCT is the SOLE WRITER of new entries here
   — it lifts a worker's item in at integration, applying the three tests first, so an
   item that the repository already answers never reaches this file.
2. **The BOB session surfaces every `open` entry** at the start of its turn and again
   at the close. Bob discusses it there, where the architecture context is.
3. **The BOB session writes `response:` and `decided:`** and sets the entry to
   `answered`. It does not enact.
4. **CONDUCT drains `answered` entries** as part of its loop, exactly as it drains the
   inbox: it enacts the answer, records `enacted:` with the commit AND the document
   that now carries the REASONING, and the entry stays forever as the record of why.

An entry is never deleted. This file is append-only and the status line is the one
thing that changes, on the `DEBT.md` precedent — the history of what was asked is
worth as much as the record of what was answered.

## Two rules that keep this from becoming a bottleneck

**AN OPEN DECISION NEVER BLOCKS WORK.** Bob's standing instruction, 2026-07-31: never
block on getting his answer when the work can proceed. So every `open` entry MUST
carry a `provisional:` line saying what is running in the meantime — and if the
honest answer is that nothing is blocked, it says that. An entry with no provisional
is a session that stopped, and `plancheck` refuses it.

The corollary from `kickoffs/README.md` still governs: **ship a provisional only when
it is cheap to reverse.** If the provisional would be expensive to undo, the right
move is not to run it and ask — it is to run the CHEAP alternative and say so.

**ONLY WHAT IS ACTUALLY BOB'S GETS IN.** Apply the three tests before writing an
entry, not after: it is not a decision if the repository or a standing ruling already
answers it; it is not a decision if the raising session is better placed to make it;
and it is not a decision item if it cannot be acted on without reading the diff.
Activation order, sequencing, mechanism, scoping and which item runs next are NOT his
— ruled explicitly on 2026-07-31. What is his: **doctrine** (what the record means and
may claim), **risk carrying his name** (legal, the City), **effects on people outside
the project**, and the gated mechanical acts.

An empty file is the healthy state.

## Entry format

    ### DEC-<n> · <open | answered | deferred | enacted>
    raised:       <date> · <who>
    for:          <bob | bob-session>   see "Who an entry is FOR", below
    question:     <one line, in the terms of the RECORD, not the code>
    why it is Bob's: <doctrine | risk he carries | outside effects | a gated act>
    provisional:  <what is running NOW — REQUIRED; "nothing is blocked" is valid>
    blocks:       <queue item ids, or none>
    alternative:  <the other option, stated fairly enough that choosing it is easy>
    recommendation: <the raising session owes a view>
    reversal cost: <and whether it rises once data exists under the current choice>
    trigger:      <REQUIRED if deferred: the condition that reopens it>
    response:     <the answer — written by the BOB session>
    decided:      <date>
    enacted:      <commit · and the document that now carries the reasoning>

## Who an entry is FOR, and why CONDUCT does not have to get that right

Added 2026-07-31, within an hour of the file existing, because CONDUCT immediately
raised something real that was NOT Bob's: two sessions sharing one working tree. It
went to Bob's ear because this file only had one destination.

So an entry names `for:`.

- **`for: bob-session`** — architectural or process questions this session resolves
  ITSELF. Coordination mechanism, interface shape, sequencing, how areas are carved.
  These are surfaced to Bob as a LINE, not a question: decided, here is why.
- **`for: bob`** — doctrine, risk carrying his name, effects on people outside the
  project, and the gated acts. Only these are put to him.

**CONDUCT should raise it either way and let this session triage.** Applying the three
tests is the BOB session's job, not a bar CONDUCT must clear before speaking. A
mis-filed entry costs one reclassification; an unraised one costs the thing going
unrecorded, which is what happened here.

---

## Open

### DEC-1 · answered
raised: 2026-07-31 · BOB (seeded from DEBT D-94)
question: Do we ask the City of Oakland to allowlist the CivicOS user-agent?
why it is Bob's: risk carrying his name, and relations with the City.
provisional: nothing is blocked. Capture works today because the honest
  `CivicOS/<version> (+<url>; instance <name>; <purpose>)` string is admitted — measured
  2026-07-30, with the contact URL the discriminator. The archive fallback and egress
  diversity proceed regardless.
blocks: none
alternative: never ask; rely on the archive path and egress diversity, and accept that
  admission rests on not being recognised.
recommendation: hold, which is the current position. The City is non-supportive, so an
  allowlist request hands a hostile party the exact string to block — the ask inverts
  from a mitigation into a disclosure. Revisit only if admission is withdrawn anyway,
  at which point the cost of asking has already been paid.
reversal cost: asymmetric and rising. Not asking stays reversible forever; asking
  cannot be unsent, and D-94's ladder means the string we would disclose is the one
  thing keeping capture working.
response: NO, and CLOSED rather than held. Bob, 2026-07-31: "We expect Oakland to view
  us as hostile to the administration's interests. Besides, every CivicOS instance, and
  there could be a number of them running at some point, would each have to request
  inclusion on that allowlist." The second half is a STRUCTURAL argument the raising
  session had not made, and it is what closes the question instead of postponing it:
  blocking the `CivicOS/` token is ONE action for them and total for us, while
  allowlisting is one request per instance, forever, for both sides — so the mitigation
  gets more expensive exactly as the project succeeds, which means it is not a
  mitigation. The first half raises the standing assumption from "the City is
  non-supportive" to "we expect to be seen as hostile", which is now what the access
  strategy must survive.
decided: 2026-07-31 · Bob
reasoning recorded in: docs/development/SOURCE-ACCESS.md, section "RULED, 2026-07-31:
  the allowlist is NOT a viable mechanism" — including the asymmetry table, why the
  request is itself a disclosure, and why BIO still does not disguise its requests.
for CONDUCT to enact: (1) D-94's status changes from "the allowlist request, Bob's to
  make" to the allowlist arm CLOSED, the exposure remaining and unmitigated on that
  axis. (2) The two mitigations that DO scale are promoted: `CAP-3` (nothing invokes
  the archive fallback) becomes the primary resilience item rather than a backstop, and
  the member-driven capture path for egress diversity needs a debt row and a milestone
  placement — it is named nowhere in the ledger today.
enacted: 2026-07-31 · CONDUCT — D-94's allowlist arm marked CLOSED and D-120 (member-driven egress diversity) added and placed in MILESTONES; CAP-3 promoted to primary resilience in QUEUE.md. Reasoning in SOURCE-ACCESS.md (per Bob's response).

### DEC-2 · deferred
raised: 2026-07-31 · BOB (seeded from DEBT D-1)
question: What should a ROOT OF TRUST be for a BIO group — who holds it, how does it
  survive a person leaving, and what does losing it cost?
why it is Bob's: doctrine, of the same weight as the membership model. Three parts of
  that model lean on it.
provisional: `ADMIN_TOKEN` is the root of trust, and it became one by accident — it is
  a bootstrap credential acting as a proxy for hosting access, with no custody model
  (no m-of-n, no split custody), no audit trail, and no rotation that does not return
  the instance to unclaimed. Section 8's verified export already requires it rather
  than in-app administrator status, on the reasoning that an export any administrator
  can run is the most efficient attack in the system.
blocks: none today. It bounds how much weight the membership guarantees can carry.
alternative: leave it as the bootstrap credential and document the limit honestly,
  which is what is happening by default.
recommendation: do not design this in the abstract. The useful next step is one
  question answered from the field — what a real group can actually hold — because a
  custody model that assumes a hardware key or two reliable officers is a model that
  fails silently in the group it was built for.
reversal cost: low now, high later. Every governance rule written on top of the
  current root inherits its weakness, and migrating a root of trust after instances
  exist means re-establishing trust rather than editing a field.
response: DEFERRED, deliberately and with a trigger. Bob, 2026-07-31: "At this time I'm
  not sure what the correct answer to this (recurring) question is. I again suggest
  that it be deferred until we have a greater understanding from a running BIO instance
  with multiple members." The word "again" is the useful part: this has been re-raised
  more than once and re-answered the same way, which is waste. It now has a NAMED
  TRIGGER so no session re-asks before the trigger and none forgets after it.
trigger: a BIO instance running with MULTIPLE MEMBERS, from which what a real group can
  actually hold in custody can be observed rather than assumed. Until then any custody
  model is a guess about people, and a guess about people is the part of a security
  design that fails silently.
decided: 2026-07-31 · Bob
reasoning recorded in: DEBT D-1, whose disposition becomes DEFERRED with this trigger.
for CONDUCT to enact: update D-1's disposition to name the trigger, so a future session
  reads "deferred until X" rather than "open doctrine" and does not re-raise it.
enacted: 2026-07-31 · CONDUCT — D-1's disposition set to DEFERRED with the named trigger (a BIO instance running with multiple members) in DEBT.md.

### DEC-3 · answered
raised: 2026-07-31 · CONDUCT (relayed by Bob; it belongs in this file, which is why
  `for:` now exists)
for: bob-session
question: BOB and CONDUCT are editing the same working tree live, so CONDUCT's
  integrations keep meeting a BOB session's half-finished work and its plancheck gate
  fires on a mess it did not make. What is the durable separation?
why it is this session's: coordination mechanism. Not doctrine, not risk carrying
  Bob's name, not an outside effect. Bob's standing instruction is explicit that
  sequencing and mechanism are not his.
provisional: BOB published immediately on hearing this, so CONDUCT's tree is clean now.
  That is a mitigation, not a fix — it shortens the dirty window rather than removing
  it, and a BOB turn is long.
blocks: nothing. CONDUCT reported it works around the collision.
alternative: leave both in the main checkout and rely on BOB committing more often.
  Rejected: it makes correctness depend on how often a long turn remembers to commit,
  which is the class of discipline this repository has watched fail four times today.
recommendation: ONE SESSION PER WORKING TREE, no exceptions. CONDUCT keeps main
  because it integrates and pushes continuously; BOB moves to `--worktree BOB`.
reversal cost: none. It is where a session runs.
response: ADOPTED, decided by this session. The root cause is locatable: PARALLELISM.md
  said "`ARCH` works in the MAIN checkout", written when ARCH was ONE session. ARCH
  split into CONDUCT and BOB on 2026-07-31 and BOTH inherited the main checkout, which
  put two long-running sessions in one tree with none of the claims system's
  protection — a claim reserves PATHS BETWEEN checkouts and does nothing about two
  sessions writing one tree. The rule's stated reason has also inverted: it avoided a
  worktree "that would have to push them back", and pushing is now understood to be
  the very act that makes a change reach anyone. So the same misunderstanding produced
  BOTH of today's coordination failures — an untracked kickoff that reached no worker,
  and two sessions in one tree. Both treated the main checkout as a shared surface
  rather than the repository as the channel.
decided: 2026-07-31 · session BOB
reasoning recorded in: docs/development/PARALLELISM.md, "ONE SESSION PER WORKING TREE",
  which carries the correction and why the original was right for a premise that
  stopped holding.
for CONDUCT to enact: nothing in the queue. This turn is the last BOB turn in the main
  checkout; the next one starts in `--worktree BOB`. If you see the main tree dirty
  from now on, it is YOURS.
enacted: 2026-07-31 · CONDUCT — nothing in the queue; the enactment is operational (BOB moves to --worktree BOB; CONDUCT owns the main checkout). Reasoning in PARALLELISM.md "ONE SESSION PER WORKING TREE". Acknowledged: the main tree is CONDUCT's from here.

### DEC-4 · open
raised: 2026-07-31 · CONDUCT (lifted from CPDF-5's report)
for: bob
question: Should the record ever extract text from SCANNED / image-only PDFs (no text layer), or is "captured but stated as unreadable" the permanent honest answer for that document class?
why it is Bob's: effects on the record's COVERAGE (a class it can capture but never read) and priority (whether a Tier-3 OCR capability is ever built).
provisional: nothing is blocked. Scanned PDFs are already marked `text-undetermined: no text layer` — the extractor emits nothing rather than mojibake, which is the correct doctrine. Tier 1 (in-plane) and Tier 2 (pdf-worker, CPDF-6) cover the text-bearing corpus; OCR is NOT on the near roadmap.
blocks: none — not CPDF-6.
alternative: never build OCR; accept that image-only documents are captured-but-unreadable and say so — the honest limit.
recommendation: accept the limit for now. On CPDF-5's 14-document sample the scanned class is ~14% and skews to design/scan artifacts, not the deliberative record (agendas, staff reports, budgets all carry a text layer). OCR is a large capability (Tesseract-WASM or an external service) for a minority that is largely not the substance CAPTURE exists to graph. Revisit only if a substantive deliberative document turns out to be scan-only.
reversal cost: low. Marking undetermined is honest and reversible; adding OCR later is purely additive.
response:
decided:
enacted:

### DEC-5 · open
raised: 2026-07-31 · CONDUCT (lifted from CAP-3's report)
for: bob
question: Should the archive-fallback monitor self-invoke `op=acquire` by routing a DAEMON CREDENTIAL into the Durable Object (over an `env.SELF` service binding), or should the self-invocation take a path that places no standing credential in the DO?
why it is Bob's: risk carrying his name — a token-exposure surface on every instance's security posture (a compromised DO could drive acquisition under a daemon credential).
provisional: nothing is blocked and nothing is exposed today. CAP-3's consumer is INERT until `env.SELF` + the token are wired, which is itself a gated DIST/installer step (the CAP-3→DIST delegation in CLAIMS). The fallback stays "built and idle" on live instances exactly as before; the mechanism is proven in tests.
blocks: none in the queue — it gates only the LIVE arming of CAP-3.
alternative: a self-invocation path that holds no standing daemon credential in the DO (e.g. the DO calling the acquire logic directly rather than over an authenticated HTTP self-binding).
recommendation: settle it WHEN DIST provisions the fleet's service bindings (it must, for CPDF-6's pdf-worker binding too) — it is the same "how does a Worker safely call another Worker on this instance" question. Prefer no standing credential in the DO if the direct-call alternative is clean.
reversal cost: low in code (the consumer no-ops without the binding); higher once instances deploy with a credential path baked into the installer template.
response:
decided:
enacted:

### DEC-6 · open
raised: 2026-07-31 · FRAMEWORK (FW-6, the SUBJECT REGISTRY slice)
for: bob-session
question: The SUBJECT REGISTRY is ONE construct serving both the bias doctrine and the framework's entity axis (D-83). Safeguard 4 of `BIO_Declared_Bias_v0_1.md` names exactly four SUBJECT kinds — source, institution, office, movement. The framework's entity axis (`BIO_Content_Framework_v0_10.md`:248) names more — person, body, ordinance, parcel, contract, fund. Does a bias STATEMENT get to take a person or an ordinance as its subject, or are the four safeguard-4 kinds the only ones a bias statement may address (with the rest admitted to the registry purely as framework entities to be graphed)?
why it is Bob's: doctrine. It fixes what a declared-bias statement is ALLOWED to be about, which is the reach of the bias construct itself — a heavier question than a data-model choice, and adjacent to safeguard 4's malformedness rule (a statement may raise scrutiny and assert patterns but never issue verdicts about a source/speaker wholesale).
provisional: NOTHING IS BLOCKED. FW-6 built the registry under a single `entities` table whose `kind` is the UNION of both vocabularies (all ten kinds admitted, validated closed at the write path), because D-83 says the construct is built ONCE and a registry admitting only the four could not carry the ordinance or contract the framework must graph. The registry does not itself decide what a bias statement may reference; that constraint, when Bob rules it, lives at the bias-statement write/ratify path (a future slice), not in the registry shape. So both answers remain reachable without a migration.
blocks: none. The bias-statement path that would enforce the answer is not yet built; FW-6 and the next slice (resolving reading references to entities) are indifferent to it.
alternative: split the vocabulary — the SUBJECT registry proper carries only the four safeguard-4 kinds, and the framework's other entity kinds live as a distinct class of registry entry that bias statements may not name as a subject. Rejected as the provisional because it reintroduces the two-registries risk D-83 exists to kill, but trivially expressible later as a rule over `kind` rather than a second table.
recommendation: keep the union table and rule the CONSTRAINT at the bias-statement path when it is built. The entity axis genuinely needs person/ordinance/etc. as first-class subjects a case is about; whether a *bias* statement may target them is a smaller, later gate that a `kind ∈ {source,institution,office,movement}` check expresses in one line, with no cost to the registry now.
reversal cost: low. The answer becomes a predicate on `kind` at the bias-statement write path; no registry migration either way, since every kind already coexists in one table.
response:
decided:
enacted:

### DEC-7 · open
raised: 2026-07-31 · RECORD (REC-4, the TASK-ACTOR FENCE)
for: bob-session
question: REC-4 added the server-side fence so a member who is neither a task's `assignee` nor an admin is refused `taskresolve`/`taskforward` (NOT_YOURS). Two judgement calls sit under it. (a) The fence is only meaningful — and the Tasks screen only works — if the ASSIGNEE can reach these ops, so REC-4 opened `taskforward`/`taskresolve` to a member/admin SESSION (they were machine-credential-only, and `app.html` was already firing `recPost("taskresolve", …)` from a signed-in browser, which the plane answered "requires a machine credential"). (b) An honestly `unassigned` task is left CLAIMABLE by any caller that reaches the op, rather than only by "the routed role".
why it is Bob's: I judged both to be `bio-session` (mechanism/sequencing, mine to decide) rather than doctrine, and NOTHING IS BLOCKED, so this is surfaced as a LINE, not a question. It is filed only because (a) widens who can act on a task — an authorization reach — and (b) fixes who may claim an unheld obligation, and both deserve a reader who disagrees an easy place to say so.
provisional: SHIPPED in REC-4. (a) `taskforward`/`taskresolve` are in `SESSION_OPS` (member and admin) with `NEEDS[op] = null` — no working capability, because the authorization is identity (is this THIS member's task), which the store's fence answers, exactly as `release` records for its own named-member rule. The actor is stamped server-side from the session, so a browser cannot sign as someone else. A machine credential (`token:member`/`token:probe`/`token:admin`) is neither the assignee nor a member-admin, so it is fenced off an ASSIGNED task and confined to unassigned ones — which matches the standing rule that capabilities gate a SESSION and never a machine credential, and the D-98 note that "a daemon cannot close somebody's work". The admin override is `#isAdminMember` (the ROOT admin session; any in-app `role='admin'` member) — the same "group admin" the routing falls back to. (b) `#refuseNotYours` returns `null` (allow) when `assignee === "unassigned"`: such a task exists precisely because routing found no PM and no active admin, so requiring assignee-or-admin would strand it forever.
blocks: none.
alternative: (a) keep the ops machine-credential-only and enforce the fence purely at the store on injected actor strings — rejected: it leaves the Tasks screen dead for the legitimate owner and makes "the assignee succeeds" untestable through the control plane. (b) narrow "claimable" to the routed role only (a member matching `member_expertise`, else the PM, else a group admin) rather than any caller — defensible, but the routing that produced `unassigned` had already exhausted PM and admin, and `member_expertise` is elsewhere doctrine'd as a HINT for a human forward rather than an automatic gate, so a hard expertise gate on claiming would be stricter than the routing itself.
recommendation: keep both. (a) is the only reading in which forward/resolve are the "member actions" D-98 and the construct call them, and it is additive (no previously-admitted caller is now refused). (b) keeps the unassigned path open exactly as D-98's routing intends ("still visible and still routable by hand") while the fence still bites on every ASSIGNED task.
reversal cost: low both ways. (a) reverts by removing the two ops from `SESSION_OPS`/`NEEDS` (and re-strands the UI, so it would come with a different task-action design). (b) becomes a predicate over the claimant's role at the top of `#refuseNotYours`; no data migration, since assignment is already a per-task field.
response:
decided:
enacted:

## Answered, awaiting enactment

_(none)_

## Enacted

_(none — entries move here with their commit and the document carrying the reasoning)_
