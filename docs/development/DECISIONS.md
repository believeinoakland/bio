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

### DEC-5 · answered
raised: 2026-07-31 · CONDUCT (lifted from CAP-3's report)
for: bob
question: Should the archive-fallback monitor self-invoke `op=acquire` by routing a DAEMON CREDENTIAL into the Durable Object (over an `env.SELF` service binding), or should the self-invocation take a path that places no standing credential in the DO?
why it is Bob's: risk carrying his name — a token-exposure surface on every instance's security posture (a compromised DO could drive acquisition under a daemon credential).
provisional: nothing is blocked and nothing is exposed today. CAP-3's consumer is INERT until `env.SELF` + the token are wired, which is itself a gated DIST/installer step (the CAP-3→DIST delegation in CLAIMS). The fallback stays "built and idle" on live instances exactly as before; the mechanism is proven in tests.
blocks: none in the queue — it gates only the LIVE arming of CAP-3.
alternative: a self-invocation path that holds no standing daemon credential in the DO (e.g. the DO calling the acquire logic directly rather than over an authenticated HTTP self-binding).
recommendation: settle it WHEN DIST provisions the fleet's service bindings (it must, for CPDF-6's pdf-worker binding too) — it is the same "how does a Worker safely call another Worker on this instance" question. Prefer no standing credential in the DO if the direct-call alternative is clean.
reversal cost: low in code (the consumer no-ops without the binding); higher once instances deploy with a credential path baked into the installer template.
response: SURFACE IT ALL, and the recommendation above is OVERRULED — correctly. Bob,
  2026-08-01: "These are public documents… There's no reason to redact anything, even
  internal metadata, from public records. Let the human analyst have the information
  and options of deciding what matters and what doesn't. I contend that who edited a
  document and when IS evidence that's every bit as relevant as other document
  content. It demonstrates the actions of people and departments. That's gold."
  THE RECOMMENDATION WAS NOT MERELY OVERRULED, IT WAS SELF-DEFEATING, and that is
  worth recording rather than quietly dropping. "Present and not promoted" kept the
  metadata off indexes and facets — but an analyst can only decide what matters if
  they can FIND it, and the patterns that make this evidence (a department's editing
  behaviour, a figure changed days before publication, one office touching documents
  it has no business in) are only visible ACROSS documents. Withholding it from the
  index would have withheld exactly the capability the material is valuable for. The
  reasoning error was treating this as a disclosure question when it is an EVIDENCE
  question about a public record.
  SO IT IS EVIDENTIARY, not a footnote: creator, lastModifiedBy, revision count and
  instants; tracked changes with author, date and the superseded wording; comments
  with author and date; speaker notes; hidden sheets. Extracted as structure,
  projected, indexed and searchable like any other content.
  ONE CONSEQUENCE THAT GOES FURTHER THAN THE QUESTION ASKED: "the actions of people
  and departments" is the ENTITY AXIS (M4, D-71, D-83). A person and an office are
  entities; "who edited what, when" is a reading resolved ACROSS documents, which
  D-71 already calls the single largest piece of manual work in case development.
  Office-document metadata is therefore a first-class INPUT to the entity axis rather
  than a per-document curiosity, and it strengthens M4's case rather than sitting
  beside it.
  SCOPE, stated because Bob stated it and an unscoped ruling would be over-applied:
  this covers PUBLIC RECORDS. He explicitly noted "there may be other situations where
  they're not and there are restrictions on what should be on the record or redacted."
  Material arriving under restriction — a records response carrying statutory
  redactions, member-origin or confidential-source material — is NOT settled by this
  and is recorded as D-124 with its trigger.
decided: 2026-08-01 · Bob
reasoning recorded in: docs/development/OFFICE-FORMATS.md (the evidentiary section,
  rewritten from "risk" to evidence) and DEBT D-122; the scope boundary in D-124.
for CONDUCT to enact: D-122's disposition changes from DOCTRINE to M2 — it is now
  build work, not an open question. `OFFICE-FORMATS.md` step 6 is UNGATED and moves
  from last to alongside steps 3–4, since the evidentiary extras are no longer a
  follow-on. Add the entity-axis link to M4's absorbs list.
enacted:

### DEC-6 · answered
raised: 2026-07-31 · FRAMEWORK (FW-6, the SUBJECT REGISTRY slice)
for: bob-session
question: The SUBJECT REGISTRY is ONE construct serving both the bias doctrine and the framework's entity axis (D-83). Safeguard 4 of `BIO_Declared_Bias_v0_1.md` names exactly four SUBJECT kinds — source, institution, office, movement. The framework's entity axis (`BIO_Content_Framework_v0_10.md`:248) names more — person, body, ordinance, parcel, contract, fund. Does a bias STATEMENT get to take a person or an ordinance as its subject, or are the four safeguard-4 kinds the only ones a bias statement may address (with the rest admitted to the registry purely as framework entities to be graphed)?
why it is Bob's: doctrine. It fixes what a declared-bias statement is ALLOWED to be about, which is the reach of the bias construct itself — a heavier question than a data-model choice, and adjacent to safeguard 4's malformedness rule (a statement may raise scrutiny and assert patterns but never issue verdicts about a source/speaker wholesale).
provisional: NOTHING IS BLOCKED. FW-6 built the registry under a single `entities` table whose `kind` is the UNION of both vocabularies (all ten kinds admitted, validated closed at the write path), because D-83 says the construct is built ONCE and a registry admitting only the four could not carry the ordinance or contract the framework must graph. The registry does not itself decide what a bias statement may reference; that constraint, when Bob rules it, lives at the bias-statement write/ratify path (a future slice), not in the registry shape. So both answers remain reachable without a migration.
blocks: none. The bias-statement path that would enforce the answer is not yet built; FW-6 and the next slice (resolving reading references to entities) are indifferent to it.
alternative: split the vocabulary — the SUBJECT registry proper carries only the four safeguard-4 kinds, and the framework's other entity kinds live as a distinct class of registry entry that bias statements may not name as a subject. Rejected as the provisional because it reintroduces the two-registries risk D-83 exists to kill, but trivially expressible later as a rule over `kind` rather than a second table.
recommendation: keep the union table and rule the CONSTRAINT at the bias-statement path when it is built. The entity axis genuinely needs person/ordinance/etc. as first-class subjects a case is about; whether a *bias* statement may target them is a smaller, later gate that a `kind ∈ {source,institution,office,movement}` check expresses in one line, with no cost to the registry now.
reversal cost: low. The answer becomes a predicate on `kind` at the bias-statement write path; no registry migration either way, since every kind already coexists in one table.
response: **ADMIT EVERY REGISTRY KIND AS A LEGAL BIAS SUBJECT. No `kind` whitelist is
  written at the bias-statement path, now or later.** Decided by this session, 2026-08-01.
  FW-6's provisional (one `entities` table, the union vocabulary) therefore stands as the
  answer and not as a holding position.
  THE ARGUMENT THAT DECIDES IT, and it inverts the question. A narrow whitelist was
  proposed as a safeguard. Check what it would guard: `office` is ALREADY one of the four
  safeguard-4 kinds, and a statement whose subject is an office — asserting a prior against
  whoever holds it — is the closest thing in this system to the structural-prior-by-role
  that `CLAUDE.md` forbids outright. Meanwhile the kinds the whitelist would EXCLUDE
  (person, ordinance, parcel, contract, fund) are the specific, evidence-bearing ones, the
  ones a pattern statement can actually cite. **So the whitelist admits the doctrinally
  riskiest kind and refuses the safest ones.** It is protection that protects nothing.
  THE SECOND ARGUMENT, which is why this is not merely harmless but right. Declared bias is
  a DISCLOSURE construct: it exists so that what a group already believes is stated where a
  reader can discount it. A group that campaigned against a measure, or that already
  believes a named official acts in bad faith, HAS that bias whatever the vocabulary
  permits. Refusing the subject kind does not remove the bias; it removes the declaration of
  it and pushes it into the unstated priors — which is precisely the masking the five
  safeguards exist to defeat. A vocabulary restriction on a disclosure construct makes the
  record less honest, not more.
  WHAT ACTUALLY CONSTRAINS A BIAS STATEMENT, and it is unchanged and sufficient: the
  MALFORMEDNESS RULE (a statement may raise scrutiny, constrain inference and assert
  evidenced patterns, and may NEVER issue a verdict — refused no matter who declares it),
  the CITATION REQUIREMENT on `kind=pattern`, strictest-wins in the effective set, the loud
  interaction review a new subject triggers, and the group as backstop. Every one of those
  operates identically whatever the subject's kind. None of the five safeguards is a kind
  restriction, and safeguard 4's own argument is about registry-versus-free-text and about
  declared relations — not about a closed kind list.
  A DEFECT FOUND WHILE DECIDING THIS, recorded because it is the sort of thing that decides
  a later argument by accident: **the bias document contradicts itself about the fourth
  kind.** "Statement anatomy" says a subject is *"the source, institution, office, or TOPIC
  it addresses"*; safeguard 4 says the registry carries *"sources, institutions, offices and
  MOVEMENTS"*. So the "exactly four kinds" this entry was written against were never four
  agreed kinds — they were two overlapping lists of four. That is further reason not to
  build a gate on the list, and it is corrected in the document by this ruling.
  THE RESIDUAL, stated with its trigger rather than left to be rediscovered: the sharpest
  edge is a bare `scrutiny` statement naming a NATURAL PERSON with a justification and no
  citations. That is admitted here. If practice shows it being used to do what the
  malformedness rule forbids — a verdict wearing a scrutiny statement's clothes — the fix is
  the one-line predicate this entry always said it was, and it belongs to Bob because it is
  doctrine about a named individual. **Trigger: the first bias bundle carrying a
  person-subject statement that a reviewer challenges as a verdict.** Nobody should re-raise
  it before then; there is nothing to reason from until a real one exists.
decided: 2026-08-01 · session BOB
reasoning recorded in: docs/architecture/BIO_Declared_Bias_v0_1.md, "RULED 2026-08-01: the
  subject vocabulary is the registry's, and the malformedness rule is the constraint" —
  which also corrects the anatomy/safeguard-4 disagreement.
for CONDUCT to enact: nothing in the queue and no code change. FW-6 shipped the deciding
  behaviour already; this ruling makes the union table the answer rather than a provisional,
  and removes a gate a future bias-statement slice would otherwise have felt obliged to add.

### DEC-7 · answered
raised: 2026-07-31 · RECORD (REC-4, the TASK-ACTOR FENCE)
for: bob-session
question: REC-4 added the server-side fence so a member who is neither a task's `assignee` nor an admin is refused `taskresolve`/`taskforward` (NOT_YOURS). Two judgement calls sit under it. (a) The fence is only meaningful — and the Tasks screen only works — if the ASSIGNEE can reach these ops, so REC-4 opened `taskforward`/`taskresolve` to a member/admin SESSION (they were machine-credential-only, and `app.html` was already firing `recPost("taskresolve", …)` from a signed-in browser, which the plane answered "requires a machine credential"). (b) An honestly `unassigned` task is left CLAIMABLE by any caller that reaches the op, rather than only by "the routed role".
why it is Bob's: I judged both to be `bio-session` (mechanism/sequencing, mine to decide) rather than doctrine, and NOTHING IS BLOCKED, so this is surfaced as a LINE, not a question. It is filed only because (a) widens who can act on a task — an authorization reach — and (b) fixes who may claim an unheld obligation, and both deserve a reader who disagrees an easy place to say so.
provisional: SHIPPED in REC-4. (a) `taskforward`/`taskresolve` are in `SESSION_OPS` (member and admin) with `NEEDS[op] = null` — no working capability, because the authorization is identity (is this THIS member's task), which the store's fence answers, exactly as `release` records for its own named-member rule. The actor is stamped server-side from the session, so a browser cannot sign as someone else. A machine credential (`token:member`/`token:probe`/`token:admin`) is neither the assignee nor a member-admin, so it is fenced off an ASSIGNED task and confined to unassigned ones — which matches the standing rule that capabilities gate a SESSION and never a machine credential, and the D-98 note that "a daemon cannot close somebody's work". The admin override is `#isAdminMember` (the ROOT admin session; any in-app `role='admin'` member) — the same "group admin" the routing falls back to. (b) `#refuseNotYours` returns `null` (allow) when `assignee === "unassigned"`: such a task exists precisely because routing found no PM and no active admin, so requiring assignee-or-admin would strand it forever.
blocks: none.
alternative: (a) keep the ops machine-credential-only and enforce the fence purely at the store on injected actor strings — rejected: it leaves the Tasks screen dead for the legitimate owner and makes "the assignee succeeds" untestable through the control plane. (b) narrow "claimable" to the routed role only (a member matching `member_expertise`, else the PM, else a group admin) rather than any caller — defensible, but the routing that produced `unassigned` had already exhausted PM and admin, and `member_expertise` is elsewhere doctrine'd as a HINT for a human forward rather than an automatic gate, so a hard expertise gate on claiming would be stricter than the routing itself.
recommendation: keep both. (a) is the only reading in which forward/resolve are the "member actions" D-98 and the construct call them, and it is additive (no previously-admitted caller is now refused). (b) keeps the unassigned path open exactly as D-98's routing intends ("still visible and still routable by hand") while the fence still bites on every ASSIGNED task.
reversal cost: low both ways. (a) reverts by removing the two ops from `SESSION_OPS`/`NEEDS` (and re-strands the UI, so it would come with a different task-action design). (b) becomes a predicate over the claimant's role at the top of `#refuseNotYours`; no data migration, since assignment is already a per-task field.
response: **BOTH KEPT AS SHIPPED — and (b) has a hole the entry did not see, which this
  ruling closes.** Decided by this session, 2026-08-01, after reading the code rather than
  the summary of it.
  (a) KEEP, and the reasoning in the entry is right and does not need repeating except for
  the part that carries it: opening `taskforward`/`taskresolve` to a member session is
  ADDITIVE — no caller previously admitted is now refused — and the actor is stamped
  server-side, so a browser cannot sign as somebody else. The alternative leaves the Tasks
  screen dead for the task's legitimate owner and makes *"the assignee succeeds"* untestable
  through the control plane, which is the failure `CLAUDE.md`'s TEST-THROUGH-THE-OP rule
  exists to prevent — `op=invitelook` shipped with a ReferenceError while 1276 assertions
  passed. Enforcement at the store on injected actor strings is a fence nobody can drive.
  (b) KEEP the claimability of an honestly unassigned task, for the entry's reason: the
  routing that produced `unassigned` had ALREADY exhausted PM and active admin, and
  `member_expertise` is doctrine'd as a HINT for a human forward rather than an automatic
  gate — so a hard expertise gate on CLAIMING would be stricter than the routing that
  created the state, and would strand the task forever.
  **THE HOLE, VERIFIED IN THE SOURCE THIS TURN.** `#refuseNotYours` (`store.mjs:6943-6946`)
  returns `null` — allow — the moment `assignee === "unassigned"`, before it ever looks at
  who is calling. `taskforward` and `taskresolve` both carry `"probe"` in their `classes`
  (`index.mjs:271-272`). So **a machine credential can RESOLVE an unassigned task**: an
  obligation is closed, with a history entry reading `actor: "token:probe"`, and no member
  ever acted. The entry's own justification says a machine is *"fenced off an ASSIGNED task
  and confined to unassigned ones"* and cites *"a daemon cannot close somebody's work"* — and
  that is exactly true and exactly insufficient. **A daemon cannot close somebody's work; it
  can close NOBODY'S work, and closing is the act.** The store's own comment two functions
  down calls `taskResolve` *"Also a member action"*, and `index.mjs:602-604` calls both verbs
  *"MEMBER actions performed by a PERSON through their session"*. The code permits what its
  comments forbid.
  **THE FIX IS THE PRECEDENT ALREADY IN THE FILE, not a new rule.** `release`
  (`store.mjs:1857-1861`) refuses any author matching `/^token:/` with `MACHINE_CANNOT_RELEASE`
  and the reason *"a machine credential may read and may prepare the review packet, and may
  not release."* Same shape here: refuse at the ACT, not at the fence, so the refusal does not
  depend on assignment state at all. `taskresolve` gains `MACHINE_CANNOT_RESOLVE` and
  `taskforward` gains `MACHINE_CANNOT_FORWARD`. This also lines up with where the claim layer
  is going — REC-13 mints `MACHINE_CANNOT_CONCLUDE` on the same precedent, so the record ends
  with ONE rule stated in three places rather than three judgements: **a machine may surface,
  route and prepare; a member authors, resolves and concludes.**
  WHY THE FENCE STAYS TOO, rather than being replaced: the fence answers *is this THIS
  member's task* and the act refusal answers *is this a person at all*. They are different
  questions and the second is not derivable from the first — which is the whole reason the
  hole existed.
  ONE THING DELIBERATELY NOT DONE: `taskdrain` is untouched. It is the daemon's path and
  draining is not resolving.
decided: 2026-08-01 · session BOB
reasoning recorded in: this entry, and DEBT D-151 (the verified defect, with the offending
  lines and the negative control that must fail).
for CONDUCT to enact: **REC-28**, handed over in the BOB INBOX — a small RECORD item that
  adds the two act-level machine refusals, removes `"probe"` from the two ops' `classes`,
  and corrects the `#refuseNotYours` comment, which currently states the guarantee the code
  does not make. It supersedes nothing and blocks nothing; it is placed on M8 beside the
  queue work that will make these two verbs member-visible for the first time.

### DEC-8 · answered
raised: 2026-07-31 · UI (UI-2, the first ACT — focus disposition)
for: bob-session
question: The ACT construct's DEFINING property (v0.2, the `ACT` row) is "see what it will refuse and why BEFORE it runs". v0.2 does not say HOW that pre-flight is produced, and there are two readings with different costs. (a) The surface COMPUTES it from the op's declared refusal contract plus the state the surface already holds — a client-side mirror of the plane's refusal logic. (b) The plane exposes a DRY-RUN — an op that runs the real op's refusal checks and writes nothing, returning the named refusals — and the surface just renders them. UI-2 used (a), because every one of `op=dispose`'s refusals is client-knowable: the C-2.8 reason requirement is unconditional, the reason grammar is a static rule, and the legal-transition gate is computable from the focus's own `current_state` against the plane's `LEGAL` table (mirrored, and already guarded by `check-semantics.mjs`). So which is the doctrine for the ACT construct in GENERAL, once an act's refusals depend on server-side state the surface cannot see?
why it is Bob's: it is the implementation doctrine of the construct's defining property, and it shapes the PLANE's op surface (whether a dry-run family gets built) and how much plane logic the UI is permitted to mirror — the exact drift class `INTERFACES.md` names (the `searchfields` copy, the semantics table). A pre-flight that mirrors a refusal the surface cannot actually evaluate would be a surface telling a member something the plane has not confirmed, in a product whose whole subject is not claiming more than can be supported. That is heavier than a data-model choice.
provisional: NOTHING IS BLOCKED, and the two-construct collapse HELD for this act (see the UI-2 verdict). UI-2 ships reading (a): `disposePreflight()` is a pure function computing the gates from the declared refusal shape + the known state, isolated so its body can be swapped. The mirrored `LEGAL` table is tiny and its state tokens are already reconciled against the plane by the existing semantics check, so this particular mirror cannot silently drift. The provisional for the GENERAL case: keep computing the pre-flight in the surface where every refusal is client-knowable, and the DAY the first act arrives whose refusals depend on unseen server state — the citation-lifecycle acts `sever`/`reinstate`/`retire` (a refusal turns on the citation graph and cited-Information), and the bulk SELECTION-SCOPED forms (drift classified from the manifest) are the likely first — add a plane-side dry-run for THAT act rather than mirroring more plane logic into the browser. Build against what exists now; do not build the dry-run before an act needs it.
blocks: none. UI-2 needed no dry-run and reshaped no plane path.
alternative: mandate a plane-side dry-run NOW, as the uniform mechanism for every act's pre-flight. Rejected as the provisional because it is capability the current act does not need (and `PARALLELISM.md`/`CLAUDE.md` both say build against what exists), but recorded here so the choice is made BEFORE the first act that genuinely needs it, not discovered after a surface has already shipped a mirror it cannot honour.
recommendation: keep the surface-computed pre-flight while an act's refusals are fully client-knowable (dispose, and release, whose acknowledgment/mitigation rules are static), and introduce a plane dry-run op — a DELEGATION to RECORD at that point — for the first act whose refusal depends on server-side state. The seam is already in place: `disposePreflight()` is the one function that would call it.
reversal cost: low. Replacing `disposePreflight()`'s body with a dry-run call is local to `civicos-ui`, and the mirrored `LEGAL` table would then be DELETED rather than maintained — a reduction, not a migration.
response: **THE PRE-FLIGHT IS PLANE-SOURCED ALWAYS. A surface may RENDER a refusal it
  received from the plane; it may never COMPUTE one.** Decided by this session, 2026-08-01,
  and it REVISES the provisional rather than confirming it. The provisional said *keep
  computing the pre-flight in the surface where every refusal is client-knowable*. That is
  the wrong axis and the evidence for saying so did not exist when the entry was written.
  WHY "CLIENT-KNOWABLE" IS THE WRONG TEST. A refusal is client-knowable exactly when the
  surface HOLDS A COPY of the rule — the `LEGAL` table, the `NEEDS` map, the reason grammar.
  So the test licenses precisely the thing `INTERFACES.md` names as the drift class, and it
  licenses it in proportion to how much the surface has already copied. It gets easier to
  satisfy the worse the problem gets.
  AND THE COPY'S ONE DEFENCE IS MEASURED FALSE. UI-2's argument rested on the mirrored
  `LEGAL` table being *"already guarded by `check-semantics.mjs`"*. **D-138, verified
  2026-08-01: `civicos-ui/check-semantics.mjs` reads `app.html` and `store.mjs` and never
  reads `bio-checks.mjs`** — zero occurrences — while `app.html:1690-1693` claims it does. It
  binds two copies to each other and leaves the AUTHORITY unchecked. A drift in the check
  catalogue passes silently. So the mirror was defended by a guard that does not guard, which
  is this project's favourite defect class and the third instance of it this month.
  **THE RULE, in the form a build session can apply without re-deriving it.** The plane is
  the source of every refusal a member is shown, by one of exactly two mechanisms, and the
  choice between them is not taste:
    1. **PUBLICATION — the default.** The plane publishes the refusal contract and the
       surface renders it: the `NEEDS` map, the legal-edge table EXPORTED from the catalogue
       (not copied), the set-application weight, `SESSION_OPS` membership, the rung, and the
       object vocabularies. This is `op=affordances` (REC-19), and it mints no new pattern —
       `whoami` already publishes capabilities and `op=searchfields` already publishes the
       query language. Publication is not a mirror: there is one authority and the surface
       holds no second copy of it.
    2. **DRY RUN — when a refusal turns on state the surface cannot see.** A non-mutating op
       that runs the real act's refusal checks, writes nothing, and returns the named
       refusals in the store's own order. This is `op=publishpreflight` (REC-15), and it
       exists because publication's refusals depend on the gate, the signer set and R2 object
       state — none of which a browser can evaluate, and one of which (`NO_SIGNERS`) is
       today discovered LAST, after the member has already signed.
  **A surface computes nothing in either case.** `disposePreflight()` keeps its seam and
  loses its body: once REC-19 publishes the legal edges, the mirrored `LEGAL` table is
  DELETED rather than maintained — a reduction, which is what makes this cheap.
  THIS COSTS NOTHING EXTRA, which is why it is decidable now rather than being a wish. Both
  mechanisms are already in the build order for their own reasons, REC-19 is already ordered
  ahead of every act surface, and REC-19 already deletes surface-side maps in five places
  (`DISPOSITIONS`, `TASK_KIND_UI`, and the three copies UI-12/UI-14/UI-20 would otherwise
  create). The ruling names the principle those items were each following separately.
  THE STANDING TEST for a future act, so this does not have to be re-argued per surface:
  *can the surface state this refusal without holding a rule the plane also holds?* If yes,
  it came from `op=affordances`. If no, the act needs a dry-run op, and building the surface
  first is building a mirror it cannot honour. **A surface that tells a member what will be
  refused, on its own authority, is a surface claiming more than it can support** — which is
  the failure this whole product is organised against, appearing in the interface layer.
decided: 2026-08-01 · session BOB
reasoning recorded in: docs/architecture/BIO_Interaction_Constructs_v0_1.md, "RULED
  2026-08-01: the pre-flight is plane-sourced — publication by default, dry-run when the
  refusal needs unseen state", inside the ACT ladder where the defining property is stated.
for CONDUCT to enact: nothing new in the queue — REC-19 and REC-15 already carry the work.
  Two amendments travel with the build order in the BOB INBOX: UI-12/UI-14/UI-16/UI-19/UI-20
  each acquire "renders no refusal it computed itself" as an acceptance clause, and UI-10's
  D-138 half (make `check-semantics.mjs` read `bio-checks.mjs`) is what keeps the interim
  honest until REC-19 lands.

### DEC-9 · answered
raised: 2026-07-31 · FRAMEWORK (FW-9, progression instances + the missing-predecessor finding)
for: bob-session
question: A progression stage's required-ness (framework §8.2) is one of `always`, `usually`, `sometimes`, `never`, `unless_exception`. FW-9's missing-predecessor finding fires when a REQUIRED stage has no threaded document. `always`/`usually` clearly fire and `sometimes`/`never` clearly do not — the kickoff enumerates exactly those. `unless_exception` is the open one: framework §8.2 says "a skipped stage is not automatically a finding: a skipped stage with **no exception document** is", so its finding turns on the ABSENCE of an exception document — and the exception-document machinery is explicitly DEFERRED past FW-9. So when a `unless_exception` stage is missing and FW-9 cannot yet check for an exception document, does the instance (a) stay SILENT (no finding), (b) fire a plain missing-predecessor finding, or (c) fire a finding FLAGGED "dischargeable, exception-doc check not yet built"?
why it is Bob's: it is the doctrine of what the record CLAIMS when it cannot yet check the thing that would discharge a skip — the framework's own "award with no solicitation" headline example uses `unless_exception` in the §8.2 table, so the choice governs whether that exact example surfaces before the exception-doc slice lands. Firing a plain finding claims impropriety the record cannot yet substantiate (a lawful sole-source would read as a gap); staying silent hides a real absence the moment a group DOES want it seen. Both cut against the product's core (not claiming more than can be supported / a finding reports but does not decide), so the line is doctrine, not a data-model choice.
provisional: NOTHING IS BLOCKED. UPDATED 2026-07-31 (FW-10): the exception-document machinery this decision waited on now EXISTS (see the note below), so the provisional has MOVED from (a) to (c). FW-10 runs (c) — `unless_exception` is now DISCHARGEABLE: `Store.#REQUIRED_FIRES = {always, usually, unless_exception}`, and a required `unless_exception` stage fires a missing-predecessor finding ONLY when required-and-UNDISCHARGED; a discharging exception document turns it into a distinct "discharged" state instead. This is DEC-9's own recommendation. It is STILL cheap to reverse: dropping `unless_exception` from that one set returns it to silence (option a), and stored rows are unaffected (grade, findings and discharges are derived on read). The choice that remains Bob's is the POLICY — whether an undischarged `unless_exception` stage should fire by default at all — not the mechanism.
note (FW-10, 2026-07-31, framework-agent-fw10): the mechanism the recommendation named now exists. Exception documents that discharge a lawful skip are modelled (`progression_exceptions`, I5 1.6.0; `op=discharge` writes, `op=exceptions` reads), `#assembleInstance` consults them (a missing required stage with a discharging exception → a "discharged" state, not a finding), and `unless_exception` has graduated to fire-only-when-undischarged. So the "cannot yet check for an exception document" premise in the question is GONE; what is left for Bob is purely the policy in `recommendation` below. DEC-9 is LEFT OPEN deliberately — the mechanism was implemented as the provisional (c), the policy ruling is Bob's.
blocks: none. FW-9 ships the missing-predecessor finding for always/usually, which is M4's acceptance; `unless_exception` waits on the exception-doc slice it structurally depends on.
alternative: fire a plain missing-predecessor finding for `unless_exception` now (option b), so the §8.2 headline example surfaces from the canonical table without a group re-declaring the stage. Rejected as the provisional because it would have the record report a lawful sole-source award as a gap with no way yet to discharge it — claiming more than can be supported, the one failure mode CLAUDE.md names as worse than a missing feature.
recommendation: keep silence (a) until the exception-document slice exists, then graduate `unless_exception` to a DISCHARGEABLE finding (c) — visible but flagged "a published exception document may lawfully discharge this; not yet checked" — rather than a plain one. That is the honest end state: the absence is reported, the adjudication is named as pending, and the finding still does not decide.
reversal cost: low. The requiredness→fires decision lives in one set + one branch in `#assembleInstance` (store.mjs); graduating `unless_exception` is a local change plus the exception-doc check it waits on, and stored `progression_instances` rows are unaffected (grade and findings are derived on read).
response: **AN UNDISCHARGED `unless_exception` STAGE FIRES. Option (c) as FW-10 shipped it
  is the answer, not the provisional.** Decided by this session, 2026-08-01. And it is
  decidable HERE, without going to Bob, because Bob already ruled the governing principle on
  the same day in DEC-10 — the entry two above this one.
  **THE PRINCIPLE IS DEC-10'S, APPLIED.** DEC-10 asked whether an overdue clock may act when
  nobody decided anything, and Bob's answer corrected the framing at the root: *"For a step
  that's marked as due-by, no new evidence and no human act still changes its state… THE
  DUE-BY WAS AUTHORED."* A group declaring a stage `unless_exception` is the same act in the
  same place — the progression definition is authored, and `unless_exception` means *this
  body is required to do this unless it publishes a reason not to*. So a stage skipped with no
  exception document is not the machine substituting for a judgement; it is **the group's own
  declared expectation being realised**, which DEC-10 puts on the binding side of D-90 rather
  than the informing side. Silence (option a) would have the record decline to report a gap
  the group itself defined as a gap.
  **THE PREMISE THAT MADE SILENCE RIGHT IS GONE, and that is the second half.** This entry was
  written when the exception-document machinery was deferred, so firing meant reporting a
  lawful sole-source award as a gap with **no way for anyone to discharge it** — claiming more
  than the record can support, which `CLAUDE.md` calls worse than a missing feature. FW-10
  built the discharge: `progression_exceptions` (I5 1.6.0), `op=discharge` writes, `op=exceptions`
  reads, and `#assembleInstance` turns a required-but-discharged stage into a "discharged"
  state rather than a finding. The finding now fires **only when required AND undischarged**,
  and the body holds the means to clear it. That is not the same claim the deferred version
  would have made.
  **AND THE DROWNING OBJECTION IS ANSWERED BY A RULING THAT ALREADY EXISTS, not by a new
  one.** The honest worry about firing by default is volume — D-79's *"one task per instance"*
  flood. DEC-10 settled that too: **an overdue or missing condition is NOTIFIED only when the
  progression instance connects to a Focus or Project**, and the connection is an authored act
  by a member. So "fires" and "reaches a person" are two different things and only the first is
  decided here. A `unless_exception` finding on a progression nobody connected to a case sits
  in the derived feed and notifies no one — Bob's own words, *"sometimes paperwork just
  silently doesn't get done… those conditions can be ignored."* Relevance stops the flood;
  requiredness does not have to.
  WHAT THE FINDING MAY NOT DO, restated because it is where this could still go wrong: it
  REPORTS and does not DECIDE. A missing-predecessor finding on an `unless_exception` stage
  says the stage is required, no threaded document was found, and no exception document
  discharges it. It does not say the skip was improper, and no surface may render it as
  impropriety. The framework's headline example — an award with no solicitation — surfaces as
  an absence with its discharge route named, which is exactly what a lawful sole-source
  publisher needs in order to clear it.
  ONE CORRECTION TO THIS ENTRY'S OWN RECOMMENDATION, worth stating so the next reader does not
  think the flag was dropped by accident: the recommendation asked for a finding *"flagged
  'a published exception document may lawfully discharge this; not yet checked'."* The second
  clause is now FALSE and must not ship — the check IS built. A flag saying "not yet checked"
  on a check that runs would be the record misdescribing its own machinery. What survives of
  the recommendation is the first clause: the finding names the discharge route.
decided: 2026-08-01 · session BOB
reasoning recorded in: this entry, which is where DEC-10's principle is applied, plus a
  cross-reference from DEC-10. `docs/development/NOTIFICATIONS.md` already carries the
  relevance filter that keeps this from drowning anyone.
for CONDUCT to enact: nothing in the queue and no code change — FW-10 already ships the
  decided behaviour (`Store.#REQUIRED_FIRES = {always, usually, unless_exception}`). The
  enactment is that `unless_exception` is now SETTLED rather than provisional, so a later
  session must not quietly return it to silence, and any surface rendering the finding must
  name the discharge route rather than a "not yet checked" caveat.

### DEC-11 · answered
renumbered: 2026-07-31 · CONDUCT — this entry collided with the daemon-credential DEC-5 above (BOB-session and CONDUCT numbered independently); renumbered DEC-5→DEC-11, content unchanged.
raised: 2026-07-31 · BOB (from `OFFICE-FORMATS.md` research, D-124 — renumbered from D-122)
for: bob
question: When the record holds a Word, Excel or PowerPoint document, may it SURFACE
  the personal data the publisher left inside it — `lastModifiedBy` naming a member of
  staff, a tracked change attributing an edit to a person, a comment candid about a
  named individual?
why it is Bob's: effects on people outside the project. These are named individuals
  who did not publish this about themselves, and the surfacing decision is the
  D-77 / invariant-7 neighbourhood rather than a display choice.
provisional: nothing is blocked and nothing is built. Office-format support is
  research only. Steps 1 to 5 of the build order (the FORMAT registry, the container
  reader, structure, text, and the measurement on real documents) are unaffected by
  this answer; only step 6, the evidentiary extras, waits on it. CAPTURING is not in
  question either way — the record holds what was served, and stripping bytes would
  break the hash and the premise.
blocks: step 6 of `OFFICE-FORMATS.md` only.
alternative: surface everything the document contains, on the reasoning that we hold
  what was served and the body chose to publish the file; or the reverse, extract the
  evidentiary structure and never surface the person-identifying metadata at all.
what is literally in the file, so the question is concrete rather than abstract:
  `docProps/core.xml` — `<dc:creator>`, `<cp:lastModifiedBy>`, `<cp:revision>17</>`,
  created and modified instants. `word/comments.xml` — `<w:comment w:author="…"
  w:date="…">` with the comment text. Tracked changes — `<w:ins w:author="…"
  w:date="…">` around inserted text and `<w:del>` around deleted text, so the
  PREVIOUS WORDING and who replaced it are both recoverable. XLSX carries the same
  core.xml plus authored cell comments; PPTX adds `notesSlide` parts.
the two scenarios, which is why this is not obvious either way:
  FOR surfacing — a staff report whose tracked changes show a cost figure moved from
  $4.2M to $2.8M three days before publication, by a named deputy. That is precisely
  the finding this project exists to make, and "someone changed it" is a far weaker
  claim than the record showing who and when. Redacting the author would make the
  finding unciteable at the moment it matters most.
  AGAINST surfacing — a junior analyst appears as `lastModifiedBy` on two hundred
  routine documents. Aggregated that is a work-pattern profile of one person: who
  touched what, who worked late, when someone was on leave. Nobody asked for it, no
  case needs it, and it only becomes POSSIBLE if the field is searchable across the
  corpus rather than sitting on a document.
the line the asymmetry suggests: the first is a fact ABOUT A DOCUMENT; the second is a
  pattern ABOUT A PERSON, and the second is created by INDEXING rather than by holding.
  BIO's subject is an institution, not the individuals who staff it — a named officer
  acting in an official capacity in a way that bears on a finding is in scope; a
  corpus-wide index of who edited what is a different instrument altogether.
what "present and not promoted" would MEAN operationally, since it is the
  recommendation and it must be enforceable rather than a UI convention:
    held in the bytes — always, no choice, the hash forbids anything else
    extracted into structure — yes, so a later session can re-evaluate it
    shown when a member opens that document — yes
    projected into an indexed/filterable column, a search facet, a digest or an
      export summary — NO
    on the published (public) surface — no by default; a separate question
  The plane already has the mechanism: `bundles` holds indexed columns and `fm_json`
  holds the per-schema tail, so "not promoted" is a PROJECTION decision that is
  structurally enforceable, not a rule the UI has to remember.
recommendation: a middle position, and it follows the record's own grain. HOLD
  everything (no choice there), EXTRACT everything into structure, but treat
  person-identifying metadata as present-and-not-promoted: available when a member
  goes looking at a document, never in a list, a search facet, a digest or an export
  summary. The asymmetry is the point — a staff member's name showing up because
  somebody opened the document they wrote is different from that name being
  searchable across the corpus. Tracked changes and comments are the harder case,
  because their evidentiary value is often exactly the attribution; my recommendation
  is that they surface WITH the attribution when a member reads the document, since a
  redacted edit history would be a claim we cannot support.
reversal cost: rises once data exists. What is surfaced becomes searchable, cited and
  possibly published; unsurfacing it later does not unpublish it. Cheap to decide now,
  expensive after a corpus of office documents is indexed.
response: DUPLICATE of DEC-5, which Bob ANSWERED on 2026-08-01 — read that entry, not
  this one. Closed here rather than left open so the same question cannot collect two
  different answers, which is the failure mode a decisions register exists to prevent.
  The answer: surface it all. These are public documents; there is no reason to redact
  anything, internal metadata included; who edited a document and when IS evidence,
  because it demonstrates the actions of people and departments. Scope is PUBLIC
  records — restricted material is D-124, deferred with a trigger.
  WORTH NOTING FOR THE REGISTER ITSELF: two sessions raised one question within hours,
  which is not a fault — CONDUCT is told to raise rather than to pre-filter, and an
  unraised item costs more than a misfiled one. But it does mean a session should scan
  open entries for the same SUBJECT before adding one, and the BOB session (which
  triages) is where a duplicate should be caught.
decided: 2026-08-01 · Bob, via DEC-5
enacted:

### DEC-10 · answered
raised: 2026-07-31 · record-agent-8 (REC-8, CONSTRUCTS Step 7)
for: bob
question: When a required successor stage is OVERDUE and no member has acted on it, should the
  record ESCALATE it beyond a proposal — mint a task, open a Focus, or push it onto a review queue —
  or does it stay a surfaced proposal until a member adopts, defers or dismisses it?
why it is Bob's: doctrine and the shape of the member's attention. CONSTRUCTS Step 7 names the
  consumer as "the review queue, or a Focus, which Bob has not ruled on"; D-79 rules that a machine
  finding must not "drown" a member by minting one task per instance; and the discovery-loop doctrine
  (Step 8b) says nothing is adopted automatically and nothing vanishes silently. Whether an AGEING
  clock is allowed to cross from "surfaced" into "assigned work" is exactly the escalation policy
  that is his, not this session's.
provisional: NOTHING IS BLOCKED, and the honest default is running. An overdue successor surfaces
  as an `overdue_successor` finding on `op=proposals` — a DISTINCT kind beside `missing_predecessor`,
  carrying the instance's grade and the deadline — adopted / deferred / dismissed through the SAME
  REC-6/REC-7 proposal machinery a member already uses. The scheduled `overdue-scan` consumer on
  REC-1's DO alarm is the PUSH SIGNAL (it wakes at the next deadline and self-terminates) and mints
  NOTHING per instance. So the record NOTICES and surfaces, and does not yet drown.
blocks: none
alternative: let an undischarged, undisposed overdue proposal that has aged past some threshold
  ELEVATE automatically — to a Focus at `surfaced` (advisory, commits nobody, per Step 8b's assistant-
  surfacing ruling) or onto a dedicated review queue — so a genuinely-overdue obligation is not lost
  merely because no one happened to read the feed.
recommendation: hold the proposal-only default for now, and revisit once the review queue exists as
  a real surface (Step 8b). Escalation without a queue to escalate INTO would just be a task per
  instance, which is the D-79 drowning the doctrine forbids; and an overdue finding is derived and
  clock-relative, so an auto-minted task could outlive the gap it was minted for. When Step 8b lands
  the aggregation + ageing disciplines, an aged overdue proposal moving to a Focus at `surfaced` is
  the natural elevation and fits the existing machinery.
reversal cost: LOW and it stays low. Overdue is derived on read (no stored finding, no minted task),
  so turning escalation on later mints nothing retroactively and turning it off strands nothing — the
  reversal is which consumer reads the same derived feed, not a data migration.
trigger (if deferred rather than answered): CONSTRUCTS Step 8b landing the review
  queue as a real surface WITH its aggregation and ageing disciplines, plus D-73's
  exception documents. Those two together are what turn "escalate" from a task flood
  into one aggregated item pointing at gaps the body has not already discharged.
response: NOTIFY, and the framing this entry rested on was WRONG at the root. Bob,
  2026-08-01: "For a step that's marked as due-by, no new evidence and no human act
  still changes its state." The D-90 argument recorded above -- that an overdue
  successor is the WORLD changing with nobody deciding anything, so it informs rather
  than binds -- does not hold, and the correction is worth keeping because it is
  precise. **The due-by was AUTHORED.** A progression stage declaring "minutes follow
  within N days" is a group's own expectation, so the deadline passing is not an
  observation about the world, it is the DECLARED EXPECTATION BEING REALISED. The
  clock is executing an authored act rather than substituting for one, which puts it
  on the binding side of D-90 rather than the informing side. What follows is not
  escalation-to-task; it is NOTIFICATION.
  THE REAL QUESTION, restated by Bob and it is the harder one: how does the system
  find the members who might be interested? "Sometimes paperwork just silently doesn't
  get done (or at least done on time). Those conditions can be ignored."
  THE RELEVANCE FILTER, RULED: **an overdue condition matters when the progression
  instance has a CONNECTION TO A FOCUS OR PROJECT.** Overdue things with no case
  connection are noise and are not notified at all. This solves the drowning problem
  far better than the aggregation reframe above did: aggregation makes a flood
  countable, relevance stops it being a flood. And it fits the record's grain, because
  the connection is an AUTHORED act -- a member said this document matters to this
  case, so the record can honestly tell them the thing they said matters has a gap.
  WHO IS NOTIFIED, RULED (Bob: "perhaps the member recorded as having made the
  connection"): the member who AUTHORED the connection to the Focus or Project. Where
  that member is inactive or gone, fall back down D-98's existing ladder -- project
  manager, then an active group admin, then honestly unassigned -- rather than
  inventing a second routing rule. Where several members connected the same
  progression, each is notified, and muting is per member.
  THE UX, RULED: the notification must offer (a) remind me again at a further
  increment overdue, (b) stop notifying me about this one, (c) stop notifying me about
  that GROUP of overdue things.
decided: 2026-08-01 · Bob
reasoning recorded in: this entry and D-125 (the notification-preference state, which
  the plane does not have). The D-90 correction is recorded here rather than in D-90,
  because D-90's own rule is unchanged -- what changed is which side of it a declared
  due-by falls on.
this session's tactical determinations, decided rather than returned:
  - **MUTING IS PERSONAL; DISMISSING IS A RECORD ACT, and they must never be one
    control.** This is the hazard in the UX as described and it is worth naming loudly:
    if "stop notifying me" also dismisses the finding, one member's inbox hygiene
    erases a finding for the whole group. The finding stands; only that member's
    notification stops. Nothing disappears silently.
  - **The increment is the stage's OWN declared interval**, not a new constant. If
    minutes are due within 21 days, the next increment is 21 days. The expectation
    already carries the number; inventing a second one would let them drift.
  - **The mute GROUP is keyed on the axes the connection was made on** -- the
    progression type (all meeting->minutes), the body, or the Focus/Project -- so a
    member can mute what they actually mean rather than a bucket the system chose.
  - **The channel already exists and is the inbox** (D-98's `tasks`), which is the
    QUEUE construct in `BIO_Interaction_Constructs`. No new transport is needed for
    the in-app case, and D-52 ("there is no notification channel in this system at
    all", raised for export notification) is substantially answered by the same
    mechanism -- one channel, three consumers, which is the D-86 lesson applied.
AMENDED 2026-08-01, same conversation, and it supersedes the aggregation reasoning
  earlier in this entry rather than sitting beside it. Bob: "all events associated with
  the same focus or project should be aggregated together into a single notification,
  as long as the notification interface is rich enough to allow the group of things to
  be handled both individually and at a group level."
  **THE AGGREGATION KEY IS THE CASE, NOT THE FINDING TYPE**, and that is the whole
  improvement. The version this entry argued earlier grouped by KIND -- "fourteen
  bodies have minutes overdue" -- which is a system-shaped bucket that crosses cases,
  so a member working the sewer fund is told about parks minutes. Grouping by Focus or
  Project groups by the member's own unit of work: "three things need attention on the
  Sewer Fund project." And it needs no second axis, because the aggregation key is the
  SAME connection the relevance filter already keys on.
  **IT ALSO WIDENS THE UNIT from overdue to ALL EVENTS on the case**, which is broader
  than the question this entry asked and is the right generalisation: a missing
  predecessor, a monitor-detected source change, an authority-undetermined capture on a
  document the case cites, an assistant-surfaced proposal against the project. So the
  notification construct is PER-CASE, not per-finding-type, and the member's queue is
  organised by case rather than by item kind.
  this session's further tactical determinations:
  - **The per-case item is a STANDING, ACCUMULATING queue entry, not a stream of
    messages.** This dissolves the digest-cadence question rather than answering it:
    there is no "notify every N hours" job and no rolled-up email schedule. One live
    item per (member, case) exists while it has unhandled events, updates as events
    arrive, and RE-notifies only on a snooze increment or when a new event lands after
    the member last looked.
  - **A group-level mute is scoped to the KINDS PRESENT WHEN IT WAS MADE.** A
    genuinely new kind of event on that case surfaces again. Otherwise "mute this case"
    becomes a permanent blindfold, which is the silent disappearance the doctrine
    forbids -- the same hazard as muting-versus-dismissing, one level up.
  - **Group-level and item-level acts are the SELECTION-SCOPED modifier** already
    defined in `BIO_Interaction_Constructs` -- the same weights, the same
    see-what-it-refuses-before-it-runs. This is its first use outside the record
    surfaces and the first real test that the modifier generalises.
  - **Grouping needs no new stored relation.** `tasks.refers_to` names a bundle; the
    case comes from the citation edge that already exists, so the group is DERIVED from
    the authored connection rather than duplicated beside it.
for CONDUCT to enact: DEC-10's provisional stands as the DERIVATION layer (overdue is
  still derived on read, still mints nothing per instance); what is added on top is the
  relevance filter, the routing, and the preference state in D-125. Place under M4
  beside the progression work, with the inbox half under M8.
enacted:

### DEC-12 · open
raised: 2026-08-01 · BOB (from the reconciliation pass, Q1)
for: bob
question: May a PUBLISHED case be revised and re-published, or is publication terminal?
why it is Bob's: doctrine. It decides what a published hash promises a reader, and it is
  the one act the system calls irreversible.
provisional: TERMINAL is running, because that is what `DATA-MODEL` and `SB-CORE` assume
  and it is the safer of the two to reverse. Nothing is blocked either way.
blocks: nothing today. It settles D-144's fix and the publication storyboard's S16.
alternative: revisable, with each publication carrying its own attestation and superseding
  the last — which is what `SB-OUTPUT` drew and what the code half-does already.
the code is SPLIT and that is the sharpest fact: `published_shas` is keyed
  `(sha256, bundle_id, path)` and APPENDS, so a hash stays answerable forever;
  `published_bundles` is keyed on `bundle_id` and UPSERTS, so re-ratifying destroys the
  prior signature, attestor, time and gate version (D-144). So today the bytes accumulate
  and the attestations do not — which is neither answer, and is a defect under either.
recommendation: REVISABLE, with attestations accumulating. Terminal sounds stronger and is
  weaker in practice: a record that cannot publish a correction can only publish a second
  case that contradicts the first, leaving a reader to work out which is current. Revisable
  keeps the correction attached to the thing corrected, and the append-only history is what
  makes it honest rather than a rewrite. It also matches what the bytes already do.
reversal cost: rises with data. Once cases are published under one rule, changing it means
  reinterpreting what existing published hashes claimed.
response:
decided:
enacted:

### DEC-13 · open
raised: 2026-08-01 · BOB (from PROBLEM-DOMAIN.md, the first externally-sourced pass)
for: bob
question: Must a case be put to its SUBJECT for response BEFORE publication, with the
  response carried inside the published artifact?
why it is Bob's: effects on people outside the project — it gives the subject of a case a
  right of reply — and it changes what publication means.
provisional: NOT doing it. `AUDIENCES.md` section 7 runs `RATIFY -> CASE -> action`, so
  contact happens after publication if at all, and that file lists pre-publication
  contact among its HAZARDS.
blocks: nothing built. It reshapes the publication ceremony (SB-OUTPUT O1) before it is
  built, which is cheap now and expensive later.
alternative: publish first and let the subject respond afterwards, which is what the
  design currently assumes.
the practice says the current ordering is INVERTED, and the sources are professional
  standards rather than opinion: the SPJ code; GAGAS/GAO audit protocol, which gives the
  audited body 7-30 days on a DRAFT and prints its rationale for disagreement alongside
  the finding; and the Columbia Journalism School review of Rolling Stone's "A Rape on
  Campus", which identified a comment request made WITHOUT SPECIFICS as the central
  failure. On that evidence, what the design lists as a hazard is what the practice
  treats as mandatory.
recommendation: ADOPT, and make it a stage of the ceremony rather than a courtesy. A case
  put to its subject with specifics, a stated window, and the response carried in the
  published artifact is stronger evidence than the same case published cold — the reply is
  itself a dated first-party fact about the body, and a refusal to reply is too. It also
  fits the record's grain: it is the same move as recording an attestation attempt that
  failed rather than omitting it. The hazard AUDIENCES named is real and is about
  tipping-off, so the window should be stated and short rather than open-ended.
reversal cost: low now, high after the ceremony is built and cases are published under the
  other rule — a published case cannot acquire a right of reply retroactively.
response:
decided:
enacted:

### DEC-14 · open
raised: 2026-08-01 · BOB (from PROBLEM-DOMAIN.md)
for: bob
question: Are BIO's claims about its OWN impact held to the same evidentiary standard as
  its findings about a public body?
why it is Bob's: doctrine, and it is invariant 7 turned on ourselves.
provisional: unstated, which is the problem — D-128's consequence loop assumes an action's
  outcome becomes evidence about how the system responds, and nothing says how strongly
  that causal link must be established.
blocks: nothing today; it settles what D-128's consequence half may claim.
the evidence is uncomfortable and is why this cannot stay unstated: Worthy's study of FOI
  outcomes found 53% of articles sought accountability and that "few elicited a response",
  with 40% of requesters reporting their leverage DECREASED; the Metaketa I coordinated
  trials of information-and-accountability interventions pool to approximately zero; and
  ProPublica itself concedes impact is "easier to identify than to conclusively prove".
  So publication is not reliably the active ingredient, and a causal claim from our own
  action to a body's behaviour is exactly the kind of claim this record would refuse from
  anyone else.
alternative: hold impact claims to the same standard, which under the UNRATED rule (R1)
  means most of them stay unrated forever, and the consequence loop reports sequence
  rather than causation.
recommendation: the same standard, stated plainly — and accept that this makes most impact
  claims UNRATED. The record can say "we asked on this date, this changed on that date"
  without claiming the first caused the second, which is honest and still useful. Applying
  a looser standard to our own claims than to the body's would be the exact failure the
  declared-bias doctrine exists to catch, and it would be undetectable from inside.
reversal cost: low. It is a rule about what may be claimed, not stored data.
response:
decided:
enacted:

### DEC-15 · open
raised: 2026-08-01 · BOB (from the reconciliation pass, Q4 — the only Tier-1 question that
  blocks a build item outright)
for: bob
question: Where does a document leg's CONNECTION grade come from — is it EARNED from the
  record (the strongest resolution of that document's captures to the inquiry's subject
  entity), or AUTHORED outright by the member who cited it?
why it is Bob's: doctrine. It fixes what a grade on a claim's leg MEANS, and therefore what
  a case's stated strength is a statement about. `DATA-MODEL.md:864-871` flags its own
  recommendation as *"my determination from the only grade vocabulary that exists, not a
  citation"* — so the repository does not answer it and no session should pretend it does.
provisional: nothing is blocked, because nothing above grade D is reachable yet. Every leg
  today is either ungraded (which R1 now makes honest: the axis suspends and names the leg)
  or a member's testimony, which is ALWAYS grade D and carries an author and a date. REC-18
  is the item that would earn a higher grade and it is the one item in the build order marked
  `blocked`.
blocks: REC-18 — and therefore any connection strength above D, and therefore every audience
  threshold that is not "everything".
alternative: AUTHORED (D1(a)). A member states the grade when they cite, `grade_source`
  collapses to one value, and the honesty rests entirely on the member. Simpler, reachable
  immediately, and it makes the grade an opinion the record repeats rather than a fact the
  record holds.
narrowed since it was first raised, and the narrowing matters: R2 splits this in half. A
  document leg has TWO grades — a CAPTURE grade and a CONNECTION grade — and **the capture
  half needs no ruling**, because the record already earned it from how the bytes arrived
  (and grade A for a direct capture is forbidden and enforced). Only the CONNECTION half is
  open. That halves what this decision costs to get wrong.
recommendation: EARNED (D1(b)), with testimony kept as the honest fallback. The whole
  discipline of this record is that an equality or an outcome the caller can hand us is not
  evidence — a caller-supplied A is exactly that, and `schema.mjs:739-743` already states the
  rule the write path would enforce: *"the RECOGNISER never mints a D; the model holds it so a
  member can testify, never the machine."* Earned grades also make weakest-link composition
  do its work without anyone policing it. The price is real and should be stated: D1(b)
  requires an inquiry to name a registry entity, and the registry has NO WRITE SURFACE until
  UI-13 — so on the day REC-18 lands with no UI-13, every instance has an empty registry and
  no leg can earn anything. That is a sequencing cost, not an argument against.
reversal cost: rises with data. Grades authored under one rule and earned under another are
  not comparable, and a published case freezes whichever it used into its own bytes.

### DEC-16 · open
raised: 2026-08-01 · BOB (from the reconciliation pass, Q3 — your own DEC-10 ruling, whose
  premise the type collapse removed)
for: bob
question: When a member's queue groups events BY CASE, and questions now nest inside other
  questions, is the grouping key the NEAREST case an event belongs to, or EVERY case above
  it?
why it is Bob's: DEC-10 is his ruling and this is its premise changing underneath it. He
  ruled the aggregation key is the case *"as long as the notification interface is rich
  enough to allow the group of things to be handled both individually and at a group level"*
  — decided when a focus was a LEAF. Under the collapse an inquiry rests on other inquiries,
  so "the case" is no longer one thing.
provisional: REC-20 ships the `case` column and populates NOTHING — every item sits
  UNGROUPED and is never given an invented home. That is the honest default and it costs one
  predicate to switch either way.
blocks: nothing built. It settles REC-20's population rule, UI-14's grouping, and REC-21's
  mute scope — all three of which ship without it and would have to be revisited with it.
alternative: the two branches ARE the alternatives, and their costs are symmetric, which is
  why no session should pick: NEAREST means a member working the root question never hears
  about the legs it rests on — the gap surfaces to whoever connected the leg, not to whoever
  owns the argument. EVERY means one event appears in N groups, which breaks DEC-10's own
  *"one standing entry per (member, case)"* and re-creates the flood relevance was supposed
  to stop.
recommendation: NEAREST, with one addition that costs little and repairs its worst case — an
  event on a leg also surfaces on an ancestor when that ancestor is CONCLUDED or PUBLISHED,
  because that is the moment a member has staked something on the leg and the record owes
  them the news. Below that, silence on ancestors is right: an open question that rests on
  forty documents should not narrate all forty. This is a recommendation and not a
  determination — the reconciliation pass looked for a tiebreaker in sixteen files and found
  none, which is the signal that the ruling's author should see it rather than a session
  inventing one.
reversal cost: low and it stays low. The key is derived from the citation edge at read time,
  not stored, so changing it re-groups the feed and migrates nothing.

### DEC-17 · open
raised: 2026-08-01 · BOB (from the reconciliation pass, Q2 — a claim three research files
  made and this session has WITHDRAWN)
for: bob
question: What makes an UNSUPPORTED case harder to state than a supported one — or is the
  answer that nothing does, and the record relies on honest grading alone?
why it is Bob's: doctrine about the cost of an act, which is exactly what `CLAUDE.md`
  reserves. Every candidate answer is a new gate on publishing, and a gate on publishing is a
  statement about who may say what.
provisional: nothing is blocked and one partial answer is already RUNNING. R1 supplies it:
  a thin case can no longer publish wearing a letter it did not earn — an ungraded leg
  suspends the axis, the case publishes as suspended, and it names the leg that is why. So
  the record no longer LAUNDERS weakness, which is the half that was actually failing.
blocks: nothing mechanically. It blocks three research files' right to claim design
  constraint C3 is discharged, which this session has withdrawn rather than left standing.
alternative: accept that nothing makes it harder, and say so explicitly in the doctrine — the
  record's defence against an unsupported case is that its strength is stated, per axis, with
  the weak leg named, and a reader can see it. Honest, cheap, and already built.
recommendation: the alternative — state the limit rather than build a gate. A global strength
  floor on publication is its own doctrine problem (it would refuse honest weak findings,
  which is the opposite of the product), and `AUDIENCES.md` §5 already forbids a per-audience
  gate. What is missing is not friction but a stated position, and the position "we do not
  stop you; we make what you are standing on visible" is defensible and matches everything
  else here. Recorded as a recommendation rather than decided because writing it down IS the
  doctrine.
reversal cost: low. It is a rule about the cost of an act, and no stored data depends on it.

## Answered, awaiting enactment

_(none)_

## Enacted

_(none — entries move here with their commit and the document carrying the reasoning)_
