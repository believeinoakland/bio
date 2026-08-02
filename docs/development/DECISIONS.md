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

### DEC-8 · open
raised: 2026-07-31 · UI (UI-2, the first ACT — focus disposition)
for: bob-session
question: The ACT construct's DEFINING property (v0.2, the `ACT` row) is "see what it will refuse and why BEFORE it runs". v0.2 does not say HOW that pre-flight is produced, and there are two readings with different costs. (a) The surface COMPUTES it from the op's declared refusal contract plus the state the surface already holds — a client-side mirror of the plane's refusal logic. (b) The plane exposes a DRY-RUN — an op that runs the real op's refusal checks and writes nothing, returning the named refusals — and the surface just renders them. UI-2 used (a), because every one of `op=dispose`'s refusals is client-knowable: the C-2.8 reason requirement is unconditional, the reason grammar is a static rule, and the legal-transition gate is computable from the focus's own `current_state` against the plane's `LEGAL` table (mirrored, and already guarded by `check-semantics.mjs`). So which is the doctrine for the ACT construct in GENERAL, once an act's refusals depend on server-side state the surface cannot see?
why it is Bob's: it is the implementation doctrine of the construct's defining property, and it shapes the PLANE's op surface (whether a dry-run family gets built) and how much plane logic the UI is permitted to mirror — the exact drift class `INTERFACES.md` names (the `searchfields` copy, the semantics table). A pre-flight that mirrors a refusal the surface cannot actually evaluate would be a surface telling a member something the plane has not confirmed, in a product whose whole subject is not claiming more than can be supported. That is heavier than a data-model choice.
provisional: NOTHING IS BLOCKED, and the two-construct collapse HELD for this act (see the UI-2 verdict). UI-2 ships reading (a): `disposePreflight()` is a pure function computing the gates from the declared refusal shape + the known state, isolated so its body can be swapped. The mirrored `LEGAL` table is tiny and its state tokens are already reconciled against the plane by the existing semantics check, so this particular mirror cannot silently drift. The provisional for the GENERAL case: keep computing the pre-flight in the surface where every refusal is client-knowable, and the DAY the first act arrives whose refusals depend on unseen server state — the citation-lifecycle acts `sever`/`reinstate`/`retire` (a refusal turns on the citation graph and cited-Information), and the bulk SELECTION-SCOPED forms (drift classified from the manifest) are the likely first — add a plane-side dry-run for THAT act rather than mirroring more plane logic into the browser. Build against what exists now; do not build the dry-run before an act needs it.
blocks: none. UI-2 needed no dry-run and reshaped no plane path.
alternative: mandate a plane-side dry-run NOW, as the uniform mechanism for every act's pre-flight. Rejected as the provisional because it is capability the current act does not need (and `PARALLELISM.md`/`CLAUDE.md` both say build against what exists), but recorded here so the choice is made BEFORE the first act that genuinely needs it, not discovered after a surface has already shipped a mirror it cannot honour.
recommendation: keep the surface-computed pre-flight while an act's refusals are fully client-knowable (dispose, and release, whose acknowledgment/mitigation rules are static), and introduce a plane dry-run op — a DELEGATION to RECORD at that point — for the first act whose refusal depends on server-side state. The seam is already in place: `disposePreflight()` is the one function that would call it.
reversal cost: low. Replacing `disposePreflight()`'s body with a dry-run call is local to `civicos-ui`, and the mirrored `LEGAL` table would then be DELETED rather than maintained — a reduction, not a migration.
response:
decided:
enacted:

### DEC-9 · open
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
response:
decided:
enacted:

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

## Answered, awaiting enactment

_(none)_

## Enacted

_(none — entries move here with their commit and the document carrying the reasoning)_
