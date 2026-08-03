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

### DEC-4 · answered
raised: 2026-07-31 · CONDUCT (lifted from CPDF-5's report)
for: bob
question: Should the record ever extract text from SCANNED / image-only PDFs (no text layer), or is "captured but stated as unreadable" the permanent honest answer for that document class?
why it is Bob's: effects on the record's COVERAGE (a class it can capture but never read) and priority (whether a Tier-3 OCR capability is ever built).
provisional: nothing is blocked. Scanned PDFs are already marked `text-undetermined: no text layer` — the extractor emits nothing rather than mojibake, which is the correct doctrine. Tier 1 (in-plane) and Tier 2 (pdf-worker, CPDF-6) cover the text-bearing corpus; OCR is NOT on the near roadmap.
blocks: none — not CPDF-6.
alternative: never build OCR; accept that image-only documents are captured-but-unreadable and say so — the honest limit.
recommendation: accept the limit for now. On CPDF-5's 14-document sample the scanned class is ~14% and skews to design/scan artifacts, not the deliberative record (agendas, staff reports, budgets all carry a text layer). OCR is a large capability (Tesseract-WASM or an external service) for a minority that is largely not the substance CAPTURE exists to graph. Revisit only if a substantive deliberative document turns out to be scan-only.
reversal cost: low. Marking undetermined is honest and reversible; adding OCR later is purely additive.
response: **BUILD IT. The recommendation is OVERRULED.** Bob, 2026-08-01: *"Some PDFs will be
  released in the public record as image only. The textual contents of these images need to be
  extracted and investigated for meaningful content."*
  The recommendation rested on a sample statistic — ~14% of a 14-document sample, skewing to
  design and scan artifacts — and treated coverage as a volume question. It is not one. **A
  document class the record can capture and can never read is a hole an adversary can put
  things in**, and it does not have to be a large class to matter: it has to contain one
  document. The class is also not randomly assigned. Scanned-only is what a signed order, an
  exhibit, a handwritten annotation, a faxed correspondence and an item deliberately released
  as an image all look like, and those are the parts of a record most likely to be the finding.
  "Largely not the substance CAPTURE exists to graph" was an inference from a 14-document
  sample, not a measurement of the corpus, and it should have been labelled as such.
  ALSO OVERRULED: *"investigated for meaningful content"* puts OCR text on the READING path,
  not merely in a text field. An image-only PDF must reach the entity axis exactly as a
  text-layer PDF does (FW-15's L2→L3 wire), or the class is captured, readable, and still
  ungraphed.
this session's determinations, which follow from the ruling and are mine:
  - **OCR TEXT IS DERIVED FROM PIXELS AND MUST NEVER BE INDISTINGUISHABLE FROM TEXT THE
    PUBLISHER WROTE.** This is the one thing that could turn this capability into an
    overclaiming defect, so it is structural and not a convention. Extracted text carries
    `text_source: 'layer'`; OCR carries `text_source: 'ocr'` with the engine, its version and a
    per-region confidence. They are different provenance and the record says so everywhere the
    text is shown, cited or indexed. A member reading a figure must be able to tell whether the
    document said it or a machine guessed it.
  - **AN OCR CITATION CARRIES ITS IMAGE REGION.** A basis leg resting on OCR'd text names the
    page and rect, so a reader checks the claim against the pixels rather than against our
    transcription. This is the same move as `published_shas` answering by hash: the check does
    not depend on trusting us.
  - **OCR NEVER RAISES A CAPTURE GRADE**, and a low-confidence region reads `undetermined`
    rather than a best guess — the mojibake rule that produced the current honest behaviour,
    applied one layer up. A garbled OCR line is exactly the invented attribution the gate
    doctrine forbids.
  - **MEASUREMENT FIRST, and it is a real gate, not diligence theatre.** Whether OCR runs
    in-plane at all is unknown: a WASM engine's size against the Worker bundle limit, and its
    CPU against the isolate ceiling (D-56, D-36). The pdf-worker fleet member (I6) is the
    fallback and an external service is the second. Nothing is designed before that number
    exists — `CLAUDE.md`'s measure-do-not-assume rule, and three archive-design claims already
    failed exactly here.
decided: 2026-08-01 · Bob
reasoning recorded in: this entry, and DEBT D-152 (the OCR tier with its provenance rules and
  the measurement that gates it).
for CONDUCT to enact: **CPDF-9** (measure OCR feasibility in workerd — bundle size, CPU, and
  accuracy on a real Oakland scanned exhibit; commits no product code) and **CPDF-10** (the
  Tier-3 OCR path behind whichever tier the measurement permits), both handed over in the BOB
  INBOX and both placed on M2. D-91's PDF-text arc gains the image-only branch. FW-15's
  acceptance gains an OCR'd document reaching `reading_refs`.
AMENDED 2026-08-02 by Bob, and it widens the item in three ways: *"It's my sense that the
  ability to extract text from imaged PDFs will be a very important capability that the
  workflow must have in order to be effective. That said, these capabilities may not fit into
  an OCR-specific worker. Research and measurement will be key to making that determination.
  Another alternative would be to use a reliable web service that provides those capabilities.
  Whether as a BIO worker or a service, the OCR fidelity may necessitate that further post
  processing by a BIO resident AI function may be required in some cases. In any case, the
  generated output will need to be assessed and graded."*
  (a) **THE PLACEMENT SET IS FOUR, NOT THREE**, and an external SERVICE is a first-class
  candidate rather than a last resort. CPDF-9 measures in-plane, the pdf-worker fleet member
  (I6), an external service, and a service-plus-post-processing chain. **The service option
  carries a cost the other three do not and CPDF-9 must price it**: the transcription becomes
  a claim by a third party we do not control and cannot re-run identically once they change
  their model. So the record must name the SERVICE, its endpoint identity and the date, exactly
  as it names an engine and a version — a transcription is only checkable if you can say who
  made it. No confidentiality issue arises (these are public records, DEC-5), and this is not
  the same as the egress question in D-94: we are sending a document out, not fetching one.
  (b) **A BIO RESIDENT AI FUNCTION MAY POST-PROCESS, AND IT IS A SECOND DERIVATION, NOT A
  REPAIR.** Recorded as a chain and never collapsed: pixels → OCR → AI correction. Each step is
  named with what performed it, and **each step can only weaken the claim, never strengthen
  it** — an AI that "cleans up" a garbled line has produced a more READABLE text, not a more
  RELIABLE one, and the danger of this capability is precisely that its output looks better
  than its input. `text_source` therefore records the chain rather than a single token.
  (c) **THE GRADE, WHICH IS THE PART THAT NEEDED DECIDING.** *"The generated output will need
  to be assessed and graded"* — and this session's determination is that **it does NOT mint a
  third axis.** R2 was hard-won and a third scale would be paid for on every surface. It bounds
  the CAPTURE axis, and the argument is that the capture axis already asks the right question:
  *how well do we know that this is what the source published.* For a text-layer PDF, byte
  provenance answers it entirely. For an image-only PDF it does not — knowing the bytes arrived
  perfectly says nothing about whether the text says what we transcribed, because a SECOND STEP
  sits between the source and the claim. So the capture grade of a leg resting on derived text
  is the weakest link of (byte provenance, transcription fidelity), which is the discipline
  already in use rather than a new one.
  (d) **AND NO MACHINE MINTS THE TRANSCRIPTION GRADE**, on the recogniser precedent
  (`schema.mjs:739-743`, *"the RECOGNISER never mints a D"*). Machine OCR and AI correction are
  both bounded below a ceiling the measurement sets. **A member who checks the transcription
  against the image is TESTIFYING** — the existing `resolvetestify` construct, with an author, a
  date and accountability — and that is the only route to the top of the transcription scale.
  This is also what makes the region-anchor in (b) of the original ruling load-bearing rather
  than nice: a member cannot testify to a transcription they cannot see the pixels for.
  (e) The exact grade VALUES wait on CPDF-9, as Bob says. The doctrine above does not: it is
  decidable now, and deciding it now is what stops the measurement being read as permission.
AMENDED AGAIN 2026-08-02. Bob: *"The sequence pixels → ocr → ai is only part of the chain. A
  member can attest that the transcription is accurate. That can be sufficient to raise the
  grade to the same level as text. Right?"*
  **RIGHT — and the question exposes a defect in the model it was asked about, which is worth
  more than the answer.** My framing said machine steps are *"capped below a ceiling"* and that
  attestation is *"the only route to the top of the transcription scale"*, which quietly treated
  A TEXT LAYER as the top of that scale. It is not, and the repository already knows it.
  **A TEXT LAYER IS ITSELF AN UNVERIFIED TRANSCRIPTION.** `pdfstructure.mjs`'s Tier-1 extractor
  decodes shown bytes *"through the font's /ToUnicode CMap"* and its own header records the
  consequence: *"a byte a font's /ToUnicode does not cover, or a font that carries no /ToUnicode
  at all, produces an `undetermined` marker naming the font — never a substituted or best-effort
  character."* So what we call "the text" is a MAPPING THE FILE SUPPLIES from glyph codes to
  characters. It is the publisher's claim about what their own glyphs mean, and it can be
  absent, partial, or wrong while the page renders perfectly.
  **AND THE SHARPEST CASE IS THE COMMON ONE: a scanned document run through the publisher's own
  OCR and saved as a "searchable PDF" HAS a text layer, and that text layer is SOMEBODY ELSE'S
  OCR OUTPUT, unverified.** Under the model as I stated it, we would grade a city scanner's
  unchecked OCR as authoritative publisher text while grading our own OCR of the same pixels as
  derived. That is incoherent, and it is the *"an equality that costs nothing to produce is not
  evidence"* rule being violated in our favour rather than against us.
  **SO THE CEILING WAS NEVER "HAS A TEXT LAYER". IT IS "VERIFIED AGAINST THE RENDERED IMAGE",
  and that is reachable from both paths.** Corrected model: a text layer and an OCR run are both
  TRANSCRIPTIONS of what was published — one supplied by the publisher, one derived by us — and
  a member's attestation against the rendered image is the strongest position either can reach.
  Attestation therefore applies to a TEXT LAYER too, and should be offered there; an unattested
  text layer and an unattested OCR differ in provenance and in likely accuracy, not in kind.
  three qualifications, decided, because "yes" without them would be the overclaim:
  - **ATTESTATION IS SCOPED TO WHAT WAS ACTUALLY CHECKED**, and the scope is recorded. Attesting
    the region a leg cites is not attesting the document, and a 200-page scanned budget attested
    wholesale is a weaker claim than one figure checked against its rect. **A leg citing outside
    the attested extent does not inherit the attested grade.** This is what makes the image-region
    anchor load-bearing twice over.
  - **THE CHAIN IS STILL RECORDED.** Attestation sets the GRADE; it does not erase the history.
    `text_source` keeps `pixels → ocr(engine,version) → ai(function,version) → attested(member,
    date, extent)`, because how a transcription was produced stays a fact about it after somebody
    checks it. Verification supersedes the chain as the grade determinant and never as the record.
  - **AND THE FAILURE MODE TO WATCH IS ROUTINE ATTESTATION**, since this is the one act that can
    lift a machine product to the top of the scale. It is a member act with an author and a date
    like any other testimony, it is refusable to a machine credential (D-151's rule), and CPDF-9
    should measure where human checking actually fails — digits, which is precisely where OCR
    fails and where skimming fails too.
  one thing CPDF-9 gains from this: **detect whether a PDF's text layer was itself
  machine-generated** (producer metadata routinely names the scanner or OCR software), because
  the record should be able to say *this text came from the publisher's own OCR* rather than
  presenting it as authored text. That is measurable, it is cheap, and nothing today looks.

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

### DEC-12 · answered
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
response: **REVISABLE, WITH EDITIONS.** Bob, 2026-08-01: *"A closed finding can be reopened,
  and a published case can be revised, though when republished, the edition number must be
  incremented and the case treated as a separate document."*
  The EDITION is the part the recommendation did not have and it is what makes revisable safe.
  "Revisable" on its own is ambiguous between amending a thing and replacing it; an incremented
  edition treated as a SEPARATE DOCUMENT settles it — edition 2 does not overwrite edition 1,
  it joins it. So a reader who relied on edition 1's hash is not betrayed, because edition 1
  still answers, still carries its own attestation and its own date, and still says what it
  said. The correction stays attached to the thing corrected, which was the recommendation's
  argument, and nothing is rewritten, which was terminality's argument. Both were reaching for
  a property editions provide.
  **AND IT CONVERTS D-144 FROM A DEFECT INTO A MISSING FEATURE.** The register recorded that
  the code is split against itself: `published_shas` is keyed `(sha256, bundle_id, path)` and
  APPENDS, so a hash stays answerable forever, while `published_bundles` is keyed on
  `bundle_id` and UPSERTS, so re-ratifying destroys the prior signature, attestor, time and
  gate version. Under this ruling the append is RIGHT and the upsert is simply not yet
  edition-aware. The fix is `published_bundles` keyed `(bundle_id, edition)`, which is a smaller
  change than either branch of the original question implied.
  REOPENING is settled in the same sentence and is worth stating separately because a build
  session will meet it first: `concluded → open` is a legal transition, so a finding nobody has
  published can be reopened without ceremony. What reopening does NOT do is unpublish: editions
  already published stay published. The inquiry's own state and its publication history are two
  different records, and this ruling is what makes them independent.
this session's determinations, decided rather than returned:
  - **A CITATION NAMES AN EDITION.** If a case is a separate document per edition, then a basis
    leg resting on a published case must say WHICH edition, or C-21.2's inheritance rule ("a
    case built on a case cannot be stronger than the case beneath it") has no fixed thing to
    compare against. `target_id` plus an edition, and a leg citing edition 1 keeps citing
    edition 1 when edition 2 appears — it does not silently follow.
  - **AND THE SUPERSESSION IS SURFACED, NOT FOLLOWED.** REC-17's re-evaluation obligation
    already exists for exactly this shape: an inquiry whose basis names edition 1 surfaces "the
    case you rest on has a newer edition", and the member decides. Nothing recomputes a strength
    on their behalf, because the strength was not changed for them.
  - **REVISING IS NOT DIVIDING.** REC-16 keeps `PUBLISHED_CANNOT_DIVIDE`. Division says the
    parent was malformed and does not continue; a new edition says the case continues and is
    corrected. Making a published case divisible because it is now revisable would collapse two
    acts that mean opposite things about the original.
  - **WHAT MAY CHANGE BETWEEN EDITIONS IS EVERYTHING, AND WHAT MAY NOT IS THE HISTORY.** An
    edition may reach a different conclusion, drop a leg, or retract entirely. It may not alter
    or remove a prior edition, and the exclusion statement is authored fresh per edition under
    C-21.1's byte-check — a completeness claim carried forward unchanged is the checkbox that
    gate exists to refuse.
decided: 2026-08-01 · Bob
reasoning recorded in: this entry; `research/RECONCILED.md` §4 Q1 is CLOSED by it, and §0's
  *"whether a published bundle may be REVISED is not decided by this file"* now is.
for CONDUCT to enact: REC-14 changes materially and the amendment is in the BOB INBOX —
  `published` is NO LONGER TERMINAL, `edition` is required frontmatter and is stamped into the
  ratified bytes, `published_bundles` is re-keyed `(bundle_id, edition)`, and `publishedList()`
  enumerates editions rather than one row per bundle. REC-22's public index and UI-18's case
  page become edition-aware (a hash resolves to its edition; prior editions stay readable).
  D-144's disposition changes from defect-to-fix to feature-to-build under M10.

### DEC-13 · answered
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
response: **ADOPT — AND THE GATE IS THE DECLARATION, NOT THE ACT.** Bob, 2026-08-01: *"I would
  suggest that the question of whether a case be put to its subject before publication with the
  response inside the artifact should be to do so. However the publisher's determination and
  justification on this question can be an element of the recorded bias of that group that is
  also inside the case."*
  **THE SECOND SENTENCE IS THE DESIGN AND IT DISSOLVES THE OBJECTION THIS ENTRY COULD NOT
  ANSWER.** The recommendation asked for a mandatory pre-publication contact stage, and the
  honest counter was the tipping-off hazard `AUDIENCES.md` names — a group facing a
  non-supportive City (DEC-1: *"we expect to be seen as hostile"*) may have real cause not to
  give notice, and a mandate would either be broken quietly or would suppress the case. A
  mandate has exactly two failure modes and this ruling has neither, because **what is required
  is not the contact. It is the group's DECLARED, JUSTIFIED POSITION on the contact, carried
  inside the published artifact.** A group that sought comment says so and prints what came
  back. A group that deliberately did not says so and says why, and a reader weighs that
  justification exactly as they weigh any other declared bias. Nobody is forced to tip anybody
  off, and nobody gets to be silent about having chosen not to.
  **AND IT REUSES A CONSTRUCT RATHER THAN MINTING A GATE.** Filing this as declared bias is not
  a filing convenience. It is correct: a decision to publish without putting specifics to the
  subject is a *disposition of the publisher that shapes the reading*, which is the definition
  the bias construct already carries, and it is subject to the same malformedness rule and the
  same ratification review as every other statement. So this needs no new machinery, and it
  makes the bias manifest — which already travels with publication as part of the evidentiary
  record — carry the one disclosure the practice literature says is most often missing.
  THE EXTERNAL EVIDENCE STANDS BEHIND THE FIRST SENTENCE AND IS PROFESSIONAL-STANDARDS GRADE,
  not opinion: the SPJ code; GAGAS/Yellow Book, where obtaining the views of responsible
  officials is a REPORTING REQUIREMENT and GAO's own protocols give an agency 7 to 30 calendar
  days on a draft, expect a single position with the rationale for any disagreement, and print
  the response beside the finding; and the Columbia review of Rolling Stone, which identified a
  comment request made WITHOUT SPECIFICS as the central failure. So what `AUDIENCES.md` §9 lists
  as hazards H4 and H6 — the pre-ratification rendering that leaves the building, and the
  embargo — are not hazards to be avoided. They are the workflow, and that file needs correcting
  rather than working around.
this session's determinations, decided rather than returned:
  - **THE ASK CARRIES SPECIFICS OR IT IS NOT AN ASK.** The Rolling Stone finding is precise and
    it is the difference between the ceremony working and being a ritual: the action must NAME
    THE SPECIFIC INQUIRIES it disclosed, so *"we contacted them"* and *"we put these four claims
    to them"* are different rows in the record. `action_kind` gains `request_for_comment`, and
    it names its inquiries the way a basis leg names its targets.
  - **THE WINDOW IS AUTHORED BY THE GROUP, WITH 7–30 DAYS AS THE SOURCED PRECEDENT** — not a
    constant this project invents. It is the same shape as a progression's declared due-by, and
    DEC-10 already rules what happens when an authored clock runs out.
  - **WHAT COMES BACK IS CAPTURED, NOT SUMMARISED**, and a non-response is recorded as a
    non-response with its date. A refusal to reply is a dated first-party fact about the body
    and is frequently the more useful one. This is REC-24's correspondence ledger, which already
    has the capture-or-testify structure this needs.
  - **THE RESPONSE MAY CHANGE THE CASE, AND THAT IS THE POINT.** A reply that supplies a
    document or contradicts a leg re-enters as evidence and can move a strength. It does not
    get a veto, and it does not get to be omitted.
  - **THE GATE AT RATIFICATION IS THAT THE POSITION IS DECLARED AND JUSTIFIED — NEVER THAT THE
    ANSWER WAS FAVOURABLE**, and never that contact happened.
decided: 2026-08-01 · Bob
reasoning recorded in: this entry, and DEBT D-153. **`research/AUDIENCES.md` is NOT edited**,
  deliberately: it is a research pass, and a pass is a record of what it concluded. Correcting
  it in place would rewrite history and hide that the practice evidence arrived later and
  overturned it. Same treatment `RECONCILED.md` gave the storyboard files — the correction lives
  in a live surface and a pointer goes on the pass. So D-153 records that H4 and H6 are NOT
  hazards to be avoided but the required workflow, and that row 14's "delivery with no bucket"
  is the main path for any case naming anybody rather than an edge case.
for CONDUCT to enact: three amendments in the BOB INBOX. REC-14's completeness block gains the
  subject-response declaration as a required, authored, never-prefilled element. REC-24 gains
  `request_for_comment` and the named-inquiries link. UI-17's ceremony gains the stage, ordered
  BEFORE signing, since authoring it changes the sha. `D-153` records the AUDIENCES correction.

### DEC-14 · answered
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
response: **THE SAME STANDARD, AND UNPROVEN IS THE DEFAULT.** Bob, 2026-08-01: *"I would agree
  with the conclusions of ProPublica. Should a CivicOS group make claims about the impact of
  its work, absent outside supporting evidence, those claims should be viewed as unproven."*
  Invariant 7 turned on ourselves, and answered the way the record answers everything else.
  **THE OPERATIVE CLAUSE IS "ABSENT OUTSIDE SUPPORTING EVIDENCE", and it is a narrower and
  better rule than the recommendation offered.** The recommendation said most impact claims stay
  UNRATED forever. That is not what this says. It says the causal claim is unproven UNTIL
  external evidence establishes it — so impact is reachable, by the same route any other claim
  is: cite something outside our own action. A council member's statement naming the report, a
  staff memo referencing it, a hearing record — those are captured documents with their own
  provenance and their own grade, and a claim resting on them is a claim like any other. What is
  refused is impact asserted from SEQUENCE ALONE, which is precisely the claim this record would
  refuse from a public body.
  **AND THE PROPUBLICA VOCABULARY GIVES THE MIDDLE TERM THAT KEEPS THIS FROM BEING A RULE ABOUT
  SILENCE.** Their methodology paper distinguishes IMPACT from OUTCOMES — *"opportunities for
  change"* such as a hearing convened, a study commissioned, a commission appointed, which it
  calls *"'outcomes' short of impact."* An outcome is a dated, capturable, first-party fact about
  the body that requires NO causal claim at all. So the record carries outcomes at full strength
  and holds impact to the standard: *"we asked on this date, this changed on that date"* is
  fully sayable, and *"our asking caused it"* is unproven until something outside us says so.
  The record ends up with more to say, not less.
  WHY THE EVIDENCE MADE THIS NECESSARY RATHER THAN FASTIDIOUS, kept because a later session will
  be tempted to soften it: Worthy's FOI study found 53% of articles sought accountability and
  that few elicited a response, with 40% of requesters reporting their leverage DECREASED; the
  Metaketa I coordinated trials of information-and-accountability interventions pool to
  approximately zero. **Publication is not reliably the active ingredient.** A system that
  assumed otherwise about itself would be running on exactly the narrative it exists to remove.
this session's determinations, decided rather than returned:
  - **UNPROVEN IS A STATED STATE, NOT A LOW GRADE.** It reuses the R1 shape — the chain has no
    computed strength on that axis and names why — rather than minting a fifth grade or floating
    an impact claim at D. A low grade would say we established it weakly; unproven says we have
    not established it.
  - **THE OUTCOME/IMPACT LINE IS STRUCTURAL, AT THE WRITE PATH**, not a rendering convention. An
    `action`'s recorded consequence is an OUTCOME by default; promoting it to an impact claim
    requires a basis leg pointing at evidence that is not our own action. Same discipline as
    `grade_source`: the machine never mints the stronger one.
  - **AND THE HONEST ASYMMETRY IS ALLOWED TO STAND.** A body's non-response to our action IS a
    first-party fact about the body and is fully claimable (DEC-13, REC-24). It is our claim to
    have CAUSED something that is held. Those are different claims and only one of them is about
    us.
decided: 2026-08-01 · Bob
reasoning recorded in: this entry, and DEBT D-128's consequence half, whose delta analysis is
  where an unguarded causal claim would otherwise have entered.
for CONDUCT to enact: REC-24's consequence half gains the outcome/impact split and the
  unproven state; the amendment is in the BOB INBOX. No new item — it is a constraint on one
  already queued.

### DEC-15 · answered
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
response: **IT RESOLVES IT — the fork was a false one, and the answer is a LIFECYCLE with a
  gate.** Bob, 2026-08-01, prefaced *"I'm not sure if what follows helps resolve this open
  decision. If not, keep it open and ask again."* It does, completely, and this entry records
  why rather than merely asserting it — because the connection is not obvious and a later
  session should be able to check the reasoning rather than take it.
  HIS RULING, in his words: *"Exploration and discovery are distinct processes from that of
  publishing. Sometimes a valuable element of putting a case together comes down to a hunch…
  another way of looking at a hunch is that it's temporary bias. The investigator thinks this is
  true. In order for it to be useful during the investigative phases of an inquiry, hunch-based
  connections must be given a temporary high enough grade that otherwise disconnected evidence
  can be brought together and related where they otherwise wouldn't without that hunch. However
  — and this is important — a hunch is bias debt. It must be cleared before a finding can be
  published. A published case must pass the gate of sound and credible without any hunch
  connections."*
  **WHY THIS ANSWERS THE QUESTION.** The entry asked whether a document leg's connection grade
  is EARNED from the record or AUTHORED by the member, and treated those as exclusive. They are
  not: they belong to different phases of the same object. **During `open`, a connection grade
  may be AUTHORED — that is a hunch, and it is what makes the graph traversable before the
  evidence exists. At `published`, no hunch may remain — so every leg is EARNED or is honest
  testimony.** D1(a) and D1(b) were each describing one end of a lifecycle and arguing about
  which was the whole thing. `grade_source` does not collapse to one value; it gains a third,
  and the third is temporary by construction.
  **AND IT NEEDS NO NEW GATE, WHICH IS THE FINDING THAT MATTERS FOR THE BUILD.**
  `BIO_Declared_Bias_v0_1.md`, "Bias debt", already ends: *"A work product carrying bias debt
  cannot advance its workproduct_state or be ratified for publication until the debt is
  settled."* That sentence was written for a different case — a bias statement CHANGING, leaving
  old analysis owed a re-run — and it turns out to state Bob's rule exactly. So *"a hunch must be
  cleared before a finding can be published"* is not a new constraint on ratification. It is the
  EXISTING constraint, reached by registering the hunch as what it is.
  **AND IT SETTLES WHAT "CLEARED" MEANS WITHOUT ANYONE HAVING TO RULE ON IT**, which was the one
  ambiguity I could not close on my own. Bias debt is *"cleared by re-running the evaluation
  under the current set"*. Retiring a hunch changes the effective bias set, which marks debt,
  which is cleared by re-running the analysis WITHOUT the hunch's licensing effect. So the test
  is not "delete the leg" and it is not "leave it in unrated" — it is **the case must still hold
  when the hunch is removed from the set.** In practice a leg whose grade came from a hunch has
  either acquired a real grade by publication time or has none, and under R1 an ungraded leg
  suspends its axis, so a case leaning on an uncleared hunch cannot publish at a claimed
  strength. The machinery that enforces this already exists and was built for something else.
this session's determinations, which are mechanism and therefore mine:
  - **`grade_source` GAINS `hunch`**, beside `resolution` (earned) and `testimony` (a member's
    signed grade-D account). A hunch grade is authored, carries an author and a date like
    testimony, and is the ONLY authored grade permitted above D — because its whole purpose is
    to be high enough to connect things, and its whole safety is that it cannot survive
    publication.
  - **A HUNCH IS VISIBLE AS A HUNCH EVERYWHERE, from the moment it is made.** Not disclosed at
    publication — visible on the inquiry page, in the strength panel, and in any export, from
    the first read. The failure mode this construct invites is a hunch quietly ageing into a
    fact because nobody re-read the leg, and the defence is that it never stops announcing
    itself.
  - **`op=publishpreflight` REFUSES `UNCLEARED_HUNCH`, naming every leg**, in the same list as
    `NO_SIGNERS` and the gate findings. A member learns this before signing, not after, which is
    REC-15's entire reason for existing.
  - **THE BIAS-BUNDLE HALF IS SEQUENCED, NOT SKIPPED.** Registering a hunch as a first-class
    bias statement needs `object_type: bias`, which does not exist in the check catalogue (D-84,
    placed on M4). So the leg-level `grade_source: 'hunch'` and the publication refusal ship
    with the claim layer where they actually bite, and the manifest registration lands with
    D-84. That is a sequencing call and it is stated so nobody later concludes the bias half was
    forgotten.
  - **A HUNCH IS NOT AN `undetermined` LEG AND MUST NOT BE COMPOSED AS ONE.** R1 suspends an
    axis when a grade is ABSENT; a hunch grade is PRESENT and asserted. During `open` it composes
    normally — that is what makes it useful — and the case is simply unpublishable while it
    stands. Treating a hunch as undetermined would destroy exactly the traversability Bob's
    ruling exists to preserve.
  - **REC-18 IS NO LONGER BLOCKED ON A RULING**, only on UI-13's registry write surface. Its
    scope changes: it builds the EARNED path (`grade_source: 'resolution'`) as the thing a hunch
    is cleared INTO, rather than waiting to learn whether earned grades exist at all.
decided: 2026-08-01 · Bob
reasoning recorded in: `docs/architecture/BIO_Declared_Bias_v0_1.md`, "RULED 2026-08-01: a
  HUNCH is temporary declared bias, and it is bias debt" — placed in the Bias debt section
  because that is the rule it turns out to be an instance of.
for CONDUCT to enact: amendments in the BOB INBOX to REC-11 (`grade_source` admits `hunch`),
  REC-12 (a hunch grade composes normally and is never treated as undetermined), REC-15
  (`UNCLEARED_HUNCH`), REC-18 (unblocked from the ruling; scope narrowed to the earned path),
  UI-11 and UI-12 (a hunch leg is visibly a hunch, and the strength panel says the case cannot
  publish while one stands). D-154 records the construct. No new item: every piece lands inside
  one already queued, which is the same result the reconciliation pass found for R1–R4.

### DEC-16 · answered
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
context added 2026-08-01, at Bob's request — *"I need more context in order to understand how
  to make the decision."* Fair; the entry assumed the collapse and stated a consequence of it.
  The question restated from the beginning:
  **WHAT CHANGED UNDERNEATH YOUR DEC-10 RULING.** When you ruled that the queue groups by case
  — *"all events associated with the same focus or project should be aggregated together into a
  single notification"* — a `focus` was a LEAF. A document connected to a focus, the focus sat
  in a project, and that was the whole depth. The type collapse (D-127) made `focus`, `finding`
  and `case` one recursive type, `inquiry`, whose basis legs may point at OTHER INQUIRIES. So
  questions now nest, and "the case an event belongs to" is no longer one thing.
  **A CONCRETE INSTANCE, which is the part the entry was missing.** MEMBER A opens
  INQ-1 *"Was the sewer fund misused?"*. It rests on INQ-2 *"Was the $2.1m transfer
  authorised?"*, which MEMBER B opens, and INQ-2 rests on INFO-88, a controller memo B cited.
  All three sit in the Sewer Fund project. Now the monitor detects that the City has replaced
  the page INFO-88 was captured from.
  - **NEAREST ancestor:** only B is notified — they made the connection to INQ-2, which is the
    nearest case. A, who owns the top question and may be days from publishing it, hears
    nothing, and the leg their conclusion rests on has moved underneath them.
  - **EVERY ancestor:** A and B are both notified. But one event now produces entries on
    INQ-2, on INQ-1 and on the project — three groups for one thing — which breaks your own
    *"one standing entry per (member, case)"* and re-creates the flood the relevance filter was
    ruled in to prevent.
  **WHY IT IS YOURS AND NOT A SESSION'S:** both branches lose something you named as
  load-bearing in DEC-10 — the first loses the member who staked something on the leg, the
  second loses the single standing entry. The reconciliation pass looked for a tiebreaker across
  sixteen files and found none.
  **WHAT IT COSTS TO GET WRONG:** very little, and this is worth knowing before spending
  thought on it. The key is derived from the citation edge at read time and stored nowhere, so
  changing the answer re-groups the feed on the next read and migrates no data. Nothing is
  blocked meanwhile — REC-20 ships the column unpopulated and every item sits ungrouped, which
  invents no home for anything.
  **MY RECOMMENDATION IS UNCHANGED and it is a middle:** nearest by default, and an event also
  surfaces on an ancestor once that ancestor is CONCLUDED or PUBLISHED — because that is the
  moment a member has staked a claim on the leg and the record owes them the news. Below that,
  silence on ancestors is right: an open question resting on forty documents should not narrate
  all forty to whoever opened it.
response: **EVERY ANCESTOR, WITH ONE SHARED RESOLUTION.** Bob, 2026-08-02: *"It's my sense that
  every ancestor should be told. However if a member resolves the notice then it needn't be
  presented to other users after that. Is it that simple, or is there more to it?"*
  **IT IS ESSENTIALLY THAT SIMPLE, AND IT IS A BETTER ANSWER THAN THE MIDDLE I RECOMMENDED —
  for a reason worth recording, because my recommendation was built on a bad assumption.** The
  every-ancestor branch was argued down in this entry on the ground that *"one event appears in
  N groups and breaks DEC-10's one standing entry per (member, case)."* That objection assumed
  the notification is the unit — N COPIES of an event, each needing separate handling. The
  second sentence of Bob's answer removes the assumption: **the EVENT is the unit of state, with
  one state and N homes.** It appears in every group it is relevant to and is handled once. The
  flood objection dissolves without a second mechanism, and DEC-10's invariant is untouched,
  because the standing entry is still per (member, case) — an event appearing in several entries
  does not create several entries.
  **AND IT IS THE ANSWER THAT MATCHES WHAT THE THING ACTUALLY IS.** The City replacing a page
  under INFO-88 is ONE fact about the world. Nearest-ancestor made it private to whoever
  happened to cite the document; every-ancestor-with-shared-resolution makes it what it is — a
  fact the case needs to know about, which anyone standing on it can settle for everyone.
  **THERE IS MORE TO IT, AND IT IS FOUR SMALL THINGS, ALL REUSING EXISTING RULES.**
  - **NOTHING VANISHES SILENTLY, so "not presented" is not deletion.** A resolution is
    attributed and dated and stays in the case's history; a member who did not resolve it sees
    *resolved by X on this date*, not an empty space. This is your own DEC-10 rule
    (muting-is-personal / dismissing-is-a-record-act) one level up — and note that shared
    resolution makes it MORE important, because now one member's act clears another member's
    queue, which is exactly the case where a silent disappearance would be indistinguishable
    from a bug.
  - **THE RESOLVER MAY BE AT THE WRONG ALTITUDE — and the design is safe anyway, for a reason
    that must be stated or someone will "fix" it.** B at INQ-2 answering *does this leg still
    hold* is not answering A's question at INQ-1, *does this change my conclusion*. If B resolves
    it by looking and finding nothing changed, clearing it for A is correct. If B resolves it by
    CHANGING something — regrading the leg, severing it, replacing the capture — that is
    precisely when A most needs to know, and a naive shared resolution would hide it. The
    safeguard is not to keep it open for everybody. It is that **an act which changes the record
    is itself an event**, which propagates by the same every-ancestor rule. So a no-op
    resolution correctly clears it for all, and a substantive one clears it and immediately
    raises its own. No new machinery: that is the ordinary consequence loop.
  - **WHO MAY RESOLVE: any member who can see the case and holds `contribute`, attributed —
    not only the member who authored the connection.** Restricting it to the author strands the
    event when that member is inactive or gone, which is the same failure D-98's routing ladder
    exists to prevent and the same reasoning that keeps an unassigned task claimable (DEC-7).
    A machine credential may not resolve (D-151's act-level refusal).
  - **"EVERY ANCESTOR" IS A GRAPH WALK AND IT INHERITS R3'S DEPTH BOUND.** The basis graph is a
    DAG enforced at write, and derivation carries a bound whose exhaustion reports `undetermined`
    rather than failing. The notification fan-out is that same walk, so it takes the same bound —
    and an exhausted walk must SAY the ancestor set is undetermined rather than silently
    notifying a truncated set. A quietly truncated notification set is indistinguishable from
    nobody caring, which is the failure this whole ruling is about.
decided: 2026-08-02 · Bob
reasoning recorded in: this entry, and `docs/architecture/BIO_Interaction_Constructs_v0_1.md`'s
  QUEUE section, which carries DEC-10's grouping rules and now carries the nesting case.
for CONDUCT to enact: amendments in the BOB INBOX. REC-20's `case` is populated with EVERY
  ancestor over the bounded walk, and **item state lives on the EVENT, not on the (member, case)
  entry** — that is the load-bearing shape change. REC-21's mute stays personal and structurally
  distinct from resolution, which is now more important rather than less. UI-14 shows one event
  under several cases, resolves once, and renders the attribution rather than a gap.

### DEC-17 · answered
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
response: **THE PROJECT DECLARES ITS REQUIRED STRENGTH, AND THE CASE PUBLISHES IT
  PROMINENTLY.** Bob, 2026-08-01: *"As is already in the development record, the level of
  evidentiary strength required for different purposes varies. A property of a BIO project is
  this level of evidentiary strength. This value is prominently included in the published
  case."*
  **THIS IS A BETTER ANSWER THAN EITHER OPTION THE ENTRY OFFERED, and the reason is that both
  of mine put the standard in the wrong place.** The recommendation said nothing should make an
  unsupported case harder to state, because a global floor would refuse honest weak findings.
  The alternative was a floor. Both assumed the standard, if any, belongs to the SYSTEM. It
  belongs to the GROUP, and to a particular piece of their work: a project convened to decide
  whether to refer something to an auditor needs a different standard from one convened to
  decide whether a thing is worth looking at, and both are legitimate. A single system-wide
  answer was always going to be wrong for one of them.
  **AND IT THREADS `AUDIENCES.md` §5 EXACTLY, which a per-audience gate could not.** That file
  rules that per-audience relaxation is *"a structural prior by role — the same defect as a
  suspicion flag, with the sign reversed"*, and that a threshold belongs on a RENDERING and never
  on ratification. A PROJECT-declared strength is not a reader property: it is authored by the
  group, before the work, about their own intentions. Nobody's standard is set by who they are.
  **IT ALSO ANSWERS THE ORIGINAL QUESTION IN A WAY NEITHER OPTION DID.** What makes an
  unsupported case harder to state is not friction and not refusal. It is that **the group
  publishes the bar it set for itself, beside the strength it reached** — so falling short is
  legible to a reader without the system having to decide what "short" means. That is the same
  move as the declared exclusion and the declared bias: the discipline comes from having said in
  advance what you were going to do.
  AND IT LANDS ON AN OPEN ITEM: `BIO_Content_Framework_v0_10.md` §12 has recorded since v0.1 that
  a claim *"needs a standard of proof attached and that is doctrine rather than architecture. It
  is the next design conversation, not this one."* This is that conversation, arriving.
this session's determinations, decided rather than returned:
  - **THE DECLARED STRENGTH IS A PAIR, per R2** — a required capture strength and a required
    connection strength — because a scalar would re-collapse the two axes the resolutions
    separated, in the one field a reader is most likely to quote.
  - **IT GATES RATIFICATION WITHIN ITS OWN PROJECT, and this is the one place I am reading
    beyond what was said.** Bob's word is *required*, and DEC-10's principle is that an authored
    expectation is the group executing its own act rather than the system imposing one — so a
    case falling short of its project's own declared bar is refused at `publishpreflight`,
    naming the shortfall per axis. **The escape is loud, not absent:** the group may amend the
    project's declared strength, and the amendment is an authored, dated, on-the-record act
    visible in the published case. You can lower your own bar; you cannot do it quietly. If the
    intent was instead that a shortfall PUBLISHES with the gap shown rather than being refused,
    that is a one-line change to the preflight and nothing else moves — say so and it changes.
  - **A PROJECT WITH NO DECLARED STRENGTH GATES NOTHING**, and the case says so rather than
    showing a blank. `undetermined` is first-class here as everywhere; an absent bar is not a
    bar of zero, and it must not render as one.
  - **AN INQUIRY OUTSIDE ANY PROJECT HAS NO BAR.** The declaration is a property of a project,
    which is a container with membership and access control, and inheriting a bar from somewhere
    else would invent one.
decided: 2026-08-01 · Bob
reasoning recorded in: this entry, and DEBT D-155. `research/AUDIENCES.md` §5 is not edited
  (same reason as D-153): its ruling that a threshold may never gate ratification stands as
  written, and is about the AUDIENCE axis. D-155 records that the PROJECT axis is a different
  one, authored by the group about its own work rather than assigned by reader role, and is
  where a threshold may legitimately gate.
ADDED 2026-08-02 by Bob, and it is a vocabulary finding rather than a change to this ruling:
  *"the term 'audiences' is being used in 2 different contexts and refers to different things.
  In gathering up requirements on which BIO development is driven, the word audience is used to
  refer to different user types. But when referring to reader and consumers of a published
  case, the audience are elements of the public who read a published case and use the
  information, analysis, and conclusions a case contains."*
  He is right and it is checkable: `research/AUDIENCES.md` enumerates *"eight audiences"* that
  mix both senses in one list — an administrator and a lawyer reading a published case belong
  to the second sense, while *"the publisher's own future members"* and the primary archetype
  (*a member of a community accountability group*) are BIO USERS and belong to the first. The
  word `archetype` appears twice in the whole file.
  **AND THE CONFLATION IS WHY §5 HAD TO BE WRITTEN DEFENSIVELY.** Its hard constraint — *"a
  per-audience relaxation is a structural prior by role… if administrators need a lower
  threshold, that is a threshold on a RENDERING, and it must never be a threshold on
  RATIFICATION"* — is correct and stays. But it reads as a warning against a temptation, and the
  temptation only exists because "administrator" was sitting in a list that mixed a BIO USER
  TYPE with a CASE READER. Separate the senses and the rule becomes a definition instead of a
  guard: renderings vary by AUDIENCE, capabilities and journeys vary by USER TYPE, and neither
  ever reaches ratification.
  **This ruling is unaffected and is slightly clarified by it.** DEC-17 puts the bar on the
  PROJECT — authored by the group, before the work, about its own intentions — which is neither
  sense. It is not assigned by who reads the case and not by who uses the instrument.
  DISAMBIGUATION ADOPTED, recorded as D-156: **AUDIENCE** is reserved for readers and consumers
  of a published case, which is the sense the threshold and rendering machinery attaches to;
  the requirements sense becomes **USER TYPE** (`ARCHETYPE` where a document already uses it,
  since `JOURNEY-PRIMARY.md` and `AUDIENCES.md` both do). This is the D-68 vocabulary class,
  caught before it reached the code rather than after — no surface names either concept yet, so
  the correction costs documents and no migration.
for CONDUCT to enact: amendments in the BOB INBOX — `project` frontmatter gains
  `required_strength{capture, connection}` (C-2.9 already requires a non-empty `objective`, so
  the shape and its check have a precedent in the same object); REC-15's preflight refuses
  `BELOW_PROJECT_STRENGTH` naming the axis; REC-14 stamps the declared bar into the ratified
  bytes beside the derived strength, so a reader sees both in the same frozen artifact; UI-18
  renders them together. D-155 records it.

### DEC-18 · answered
raised: 2026-08-02 · Bob, in the review of the study document
for: bob
question: Does an ungraded leg leave the whole conclusion UNRATED, or only fail to
  contribute to it?
why it is Bob's: doctrine. R1 is his resolution and this refines it; it decides what a
  published strength asserts when part of the basis is unestablished.
provisional: R1 as written was running — ANY leg with no grade left the chain with no
  computed strength, naming the leg. `RECONCILED` §1.1 R1-h explicitly REFUSED the
  alternative, calling it the laundering R1's first bullet forbids.
blocks: REC-12's comparator, and therefore UI-17 step 2, UI-18's index rows and every
  surface that renders a strength.
alternative: R1 unchanged — one ungraded leg unrates the whole chain.
recommendation: none was offered; this arrived as a correction rather than a question.
reversal cost: rises once cases are published under either rule, because a published
  strength means something different under each.
response: **AN UNGRADED LEG IS INERT, NOT UNRATING.** Bob, 2026-08-02: *"An ungraded leg
  doesn't contribute to a conclusion, but if there are other graded legs, then it doesn't
  suspend the conclusion either."*
  **THIS IS NOT THE BEHAVIOUR R1-h REFUSED, AND THE DISTINCTION IS THE WHOLE RULING.**
  What R1 forbade was grading on the determined legs *while the ungraded leg still counted
  as part of what the conclusion rested on* — the conclusion drew support from a leg that
  paid nothing toward strength, which is laundering. Bob's rule removes the support as well
  as the cost: an ungraded leg **contributes nothing**. It is not weighed, it is not
  averaged, it does not floor, and it does not unrate. It sits in the basis, named and
  visible, as a leg that is present and not yet load-bearing.
  So the conclusion is graded on its load-bearing legs, and that is honest because those
  are the only legs it rests on.
  **THE RESIDUAL CASE SURVIVES:** if EVERY leg is ungraded there are no load-bearing legs,
  the conclusion rests on nothing established, and it is UNRATED naming all of them. R1's
  behaviour is therefore not deleted — it becomes the boundary case rather than the rule.
  **AND THE PLURAL IS PART OF THE RULING** (Bob, same review): *"more than one leg may have
  no established grade, in which case every such leg will be named."* Every ungraded leg is
  named, always — one or many — which is what keeps "inert" from meaning "invisible".
decided: 2026-08-02 · Bob

### DEC-19 · answered
raised: 2026-08-02 · Bob, in the review of the study document
for: bob
question: Is an attestation irreversible, or must it be correctable?
why it is Bob's: doctrine, and it decides what a published signature promises. It is the
  one act the design called irreversible.
provisional: IRREVERSIBLE was running and is stated in two places —
  `BIO_Interaction_Constructs_v0_1.md` §A (*"Separate from a justified transition because it
  cannot be undone"*) and the review document's rung ladder.
blocks: nothing built; it reshapes O1, the publication ceremony, before it exists.
alternative: irreversible, as written.
recommendation: none offered; it arrived as a correction.
reversal cost: low now, high once cases are published under the irreversible reading.
response: **AN ATTESTATION MUST BE REVERSIBLE, BECAUSE PEOPLE MAKE MISTAKES.** Bob,
  2026-08-02: *"You say that an attested rung is irreversible. But people make mistakes or
  misinterpret. An attestation must be reversible to correct mistakes. (Though there may be
  a record of the attestation and reversal in the record.)"*
  **THE PARENTHESIS IS THE MECHANISM AND IT RESOLVES THE APPARENT CONFLICT WITH DEC-12.**
  Reversal is not erasure. The attestation happened, and a record whose purpose is
  attribution cannot un-happen it; what reversal means is a further ATTESTED act — dated,
  attributed, signed — that retracts the first, with both standing in the record. The
  published bytes stay answerable, so a reader who relied on the original can still see
  exactly what they relied on and can now also see that it was withdrawn.
  **THIS MAKES THE RUNG LADDER'S TOP TWO NAMES WRONG, NOT ONLY ITS TOP ONE.** DEC-12 already
  ruled that a published case may be revised as a new edition and that a closed finding may
  be reopened — so `terminal` (*"cannot be walked back"*) was already stale and nobody had
  noticed. Corrected: what distinguishes the top of the ladder is not that the act cannot be
  undone but that **it cannot be undone SILENTLY** — every correction is itself an act on the
  record, with a name and a date on it. That is a stronger guarantee than irreversibility and
  it is the one this project actually wants.
decided: 2026-08-02 · Bob

### DEC-20 · answered
raised: 2026-08-02 · Bob, in the review of the study document
for: bob
question: Must all bias debt be cleared before publication, or only a hunch?
why it is Bob's: doctrine. It decides what publication asserts about the group's own
  declared position.
provisional: ALL bias debt blocked publication. `BIO_Declared_Bias_v0_1.md` §"Bias debt":
  *"A work product carrying bias debt cannot advance its workproduct_state or be ratified
  for publication until the debt is settled."*
blocks: nothing built; the publication pre-flight (`op=publishpreflight`) is designed and
  not yet built, and this changes what it refuses.
alternative: the blanket rule, as written.
recommendation: none offered; it arrived as a correction.
reversal cost: low — nothing is built against either reading.
response: **ONLY A HUNCH BLOCKS. OTHER BIAS DEBT IS DISCLOSED AND TRAVELS.** Bob,
  2026-08-02: *"Not all bias needs to be cleared before a piece is published. The only bias
  type that must be clear before publication is hunches."* And, in the same review: *"Bias is
  public and accompanies every published case produced under that bias."*
  **THE TWO SENTENCES TOGETHER GIVE THE PRINCIPLE, WHICH THE BLANKET RULE DID NOT HAVE: bias
  debt is DISCLOSED; hunch debt is DISQUALIFYING — because a hunch inflates a GRADE and
  ordinary bias only frames interpretation.** A declared standing position is a lens a reader
  can apply or discount for themselves, and it is published with the case precisely so they
  can. It costs the reader nothing to be told. A HUNCH is different in kind: it is a
  connection asserted ahead of its evidence, carrying a grade it has not earned, so a case
  published over an uncleared hunch states a strength that is not true — which is the
  overclaiming this project's threat model calls the dangerous half. The blanket rule was
  reaching for the hunch case and caught everything.
  **CONSEQUENCE FOR THE MANIFEST:** the bias manifest was already *"part of the evidentiary
  record"* that *"travels with publication"*, so the publicity half is not a change — it is
  a promotion from a property of the manifest to a stated guarantee of publication, and the
  published case must SHOW it rather than merely cite it.
decided: 2026-08-02 · Bob

### DEC-21 · answered
raised: 2026-08-02 · Bob, in the review of the study document
for: bob
question: Capture grade and connection grade grade DIFFERENT OBJECTS — a capture is the act
  of reading a document in, a connection is an edge between pieces of information. So why are
  those two grades combined into a conclusion's "strength"?
why it is Bob's: doctrine. R2 is his resolution and this changes its mechanism.
provisional: R2 as written was running — *"a chain carries the weakest CAPTURE grade among its
  evidentiary legs and the weakest CONNECTION grade among its inferential legs"*, i.e. each leg
  belongs to ONE axis and the two axes are read off two disjoint sets of legs.
blocks: REC-12's comparator and REC-18's grade source; UI-17 step 2 and UI-18's index rows
  render the result.
alternative: R2 unchanged.
recommendation: this entry answers rather than asks — the correction follows from the two
  definitions Bob supplied in the same review, so it is recorded as derived rather than put
  back to him. If he disagrees with the derivation it reverses in one line, because nothing
  is built.
reversal cost: low today and rising — REC-12 is the first item that would build the wrong
  population into a comparator.
response: **THEY ARE NOT COMBINED — AND R2'S MECHANISM IS WRONG WHILE ITS CONCLUSION IS RIGHT.**
  Bob, 2026-08-02: *"A capture is the act of reading a document in. A connection is an edge
  between 2 or more pieces of information… They're different things. So why are those grades
  combined?"*
  **They are not, and the word PAIR invited the reading that they are one two-part score.**
  R2's conclusion stands and is unchanged: nothing averages, mixes or collapses them, and no
  rendering may reduce them to one letter. What is wrong is R2's account of WHICH LEGS CARRY
  WHICH AXIS, and Bob's definitions are what expose it:
  - a CAPTURE grade is a property of an INFORMATION object — how the bytes were read in;
  - a CONNECTION grade is a property of an EDGE between pieces of information.
  A leg of a basis IS an edge, pointing at a target. So a leg has a connection grade of its
  own, and if its target is a document that document has a capture grade. **A single document
  leg therefore carries BOTH grades — which R2's own corrected example already shows**
  (`RECONCILED` §1.2 R2-e: *"capture ⟨B⟩ — a direct capture by this instance · connection ⟨A⟩
  — the document links them itself"*). One leg, two grades. The "evidentiary legs versus
  inferential legs" split cannot survive its own worked example.
  **CORRECTED, and this is what REC-12 must build.** A conclusion reports two independent
  measurements over two DIFFERENT POPULATIONS, not one measurement over two kinds of leg:
  - **CAPTURE** — the weakest capture grade among all the DOCUMENTS the conclusion reaches.
    Answers *"how well do we know these are the bytes the body published?"*
  - **CONNECTION** — the weakest connection grade among all the EDGES the conclusion rests on.
    Answers *"how well established are the relationships this reasoning uses?"*
  They are reported side by side because a reader needs both to know what checking the case
  would take. Side by side is not composition: they are two facts about two different kinds of
  thing, and neither can substitute for the other.
  **WHAT R2 ALREADY GOT RIGHT AND MUST NOT BE RE-OPENED:** a CONNECTION's own grade is composed
  from `connections.a_grade` and `b_grade` — how each END resolved to the shared entity — and
  that composition is legitimate because both ends are the same kind of measurement. The schema
  carries exactly this shape. R2's 2026-08-01 refinement said so, and it stands.
  **AND IT CONFIRMS §4 Q6 INDEPENDENTLY.** A threshold was settled as two independent floors
  because the axes move independently by reader; under this correction they are not merely
  independent, they range over different populations, so a single shared floor was never
  expressible in the first place.
decided: 2026-08-02 · Bob (definitions) · session BOB (derivation)

## Answered, awaiting enactment

_(none)_

## Enacted

_(none — entries move here with their commit and the document carrying the reasoning)_
