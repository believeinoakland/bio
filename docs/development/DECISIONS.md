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
enacted: 2026-08-03 · CONDUCT — 5318b53: CPDF-9 and CPDF-10 enqueued with both 2026-08-02 amendments folded in (four placements incl. the service and service+AI chain; text_source as a CHAIN each step of which can only weaken; the attestation ceiling reachable from both paths; the digits measurement; text-layer-provenance detection); FW-15 carries the OCR-reaches-reading_refs clause. Grade doctrine (fidelity bounds the CAPTURE axis, no machine mints the grade) is stated in the item scopes so the measurement cannot be read as permission. Reasoning in QUEUE.md (CPDF-9/CPDF-10) and this entry.

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
enacted: 2026-08-03 · CONDUCT — 5318b53: the office-formats debt row (D-124, the renumbered D-122) already reads M2 · open, ruled; OFFICE-FORMATS.md step 6 UNGATED in place (runs alongside steps 3–4, carried by COFF-3/4/5's evidentiary cores); the entity-axis link added to M4's absorbs list in MILESTONES.md. Reasoning in OFFICE-FORMATS.md and D-124.

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
enacted: 2026-08-03 · CONDUCT — nothing in the queue and no code change, as the entry itself rules: FW-6 shipped the deciding behaviour. Recorded so a later session does not quietly reverse it. Reasoning in this entry and the FW-6 landing note in QUEUE.md.

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
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-28 enqueued verbatim from the handover (refuse at the ACT on the MACHINE_CANNOT_RELEASE precedent; keep the fence; leave taskdrain alone). Reasoning in QUEUE.md (REC-28) and D-151.

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
enacted: 2026-08-03 · CONDUCT — 5318b53: the plane-sourced pre-flight doctrine is stated on REC-19's scope (no act surface before it exists); the renders-no-refusal-it-computed-itself clause added to UI-12, UI-14, UI-16, UI-19 and UI-20's acceptance; UI-10 carries the D-138 half (check-semantics.mjs must read bio-checks.mjs) as not optional. Reasoning in QUEUE.md (REC-19, UI-10/12/14/16/19/20).

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
enacted: 2026-08-03 · CONDUCT — nothing in the queue and no code change, as the entry itself rules: FW-10 already ships the confirmed behaviour. Recorded against quiet reversal. Reasoning in this entry.

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
enacted: 2026-08-03 · CONDUCT — duplicate of DEC-5, closed without separate enactment; DEC-5's enacted line carries the work. The register lesson (scan open entries for the same SUBJECT before adding one) stands recorded here.

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
enacted: 2026-08-03 · CONDUCT — 5318b53: the provisional stands as the derivation layer (overdue derived on read, nothing minted per instance); the relevance/routing/preference layer is queued as REC-20 and REC-21 under M8, reshaped by DEC-16 (the EVENT is the unit of state; every-ancestor grouping). Reasoning in QUEUE.md (REC-20/REC-21) and BIO_Interaction_Constructs_v0_1.md's QUEUE section.

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
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-14 re-based on editions (published not terminal; published_bundles re-keyed (bundle_id, edition), appends; D-144 closes as a feature; a citing leg names its edition); REC-22 enumerates and serves editions; REC-17 surfaces the re-evaluation obligation on a new edition; REC-16's PUBLISHED_CANNOT_DIVIDE stands. Reasoning in QUEUE.md item scopes and RECONCILED §4 Q1 (settled in place).

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
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-14's completeness block gains the declared-and-justified subject position (the gate is the declaration, never contact, never a favourable answer); REC-24 gains request_for_comment naming the specific inquiries disclosed, the authored window, captured-not-summarised returns; UI-17's stage recorded on its deferred scope (before signing — it changes the sha). AUDIENCES.md carries the H4/H6 correction pointer. Reasoning in QUEUE.md (REC-14/REC-24) and D-153.

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
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-24 carries the outcome/impact split (impact requires a basis leg on evidence that is not our own action; unproven is a stated state, never a fifth grade); UI-19 renders it. Reasoning in QUEUE.md (REC-24/UI-19).

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
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-11 admits grade_source: hunch (author+date, only authored grade above D, bias debt); REC-12 composes a hunch normally; REC-15 (deferred) carries UNCLEARED_HUNCH; REC-18 unblocked from the ruling (blocked on UI-13 alone, builds the earned path a hunch clears into); UI-11 shows a hunch as a hunch from the moment it is made. Manifest registration sequenced behind D-84 (M4) as the entry directs. Reasoning in BIO_Declared_Bias_v0_1.md (bias debt) and QUEUE.md item scopes.

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
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-20's case populated with every ancestor over an R3-bounded walk, exhausted → undetermined, state on the EVENT; REC-21 asserts the record-act/preference boundary plus the change-is-itself-an-event rule; UI-14 renders one event under several cases, resolved-by-X, never a gap. The unpopulated-column provisional retired. Reasoning in BIO_Interaction_Constructs_v0_1.md's QUEUE section and QUEUE.md item scopes.

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
  **AMENDED 2026-08-03 (Bob, in review): THE GROUP SETS THE DEFAULT.** *"...settable at the
  project level (with the default for new projects defined at the group level), and clearly
  disclosed in every published case."* Two additions the original ruling did not carry: the
  GROUP holds the default required strength that a new project starts from, and the project may
  then set its own. The disclosure half was already ruled. Bob's framing in the same review
  supplies the worked consequence: a lawyer's project may require *"beyond a reasonable
  doubt"* where a reporter's requires *"convincing"* — and a lawyer building on a reporter's
  published case sees the standard it was held to and the bias it was produced under, and may
  need to BOLSTER it to meet their own standard before relying on it. The standard is authored
  by the group about its own work; it is never set by who somebody is.
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
enacted: 2026-08-03 · CONDUCT — 5318b53, as amended: REC-14 stamps the group-default/project-override required_strength pair into the ratified bytes beside the derived strengths (absent bar gates nothing and says so); REC-15 (deferred) carries BELOW_PROJECT_STRENGTH naming the axis; UI-18 renders declared bar beside reached strength, prominently. Reasoning in QUEUE.md (REC-14/UI-18) and RECONCILED §4 Q2 (settled in place).

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
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-12's comparator EXCLUDES an ungraded leg from the population (inert, named, not load-bearing; UNRATED as the boundary case); UI-11 renders it so. D-159's watch (no fourth defence before use shows need) stands. Reasoning in RECONCILED §1.1's amendment block and QUEUE.md (REC-12/UI-11).

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
  **AMENDED 2026-08-03 (Bob, in review): THE NAME OF THE PROPERTY IS CORRECTED — PUBLISHING
  IS AN IRREVERSIBLE ACT, and it may be the only one.** *"Publishing IS an irreversible act!
  It's (one of?) the only irreversible acts. (However another edition of a published case can
  be published - as a separate document. However a claim can be removed from a finding,
  potentially rescinding it to an inquiry once again.)"* The MECHANISM of this ruling is
  unchanged and both halves of it stand: correction is always possible, and it always moves
  FORWARD — a new edition (a separate document, all published editions stand), a withdrawal by
  another attested act (both stand), a finding rescinded to an inquiry by removing its claim.
  What is corrected is the vocabulary: the 2026-08-02 text said "an attestation must be
  reversible", and that word overclaims — the ACT is irreversible, because what it published
  never stops answering and can never be unpublished. Reversible-with-a-record and
  irreversible-with-forward-correction are the same design; the second is the honest name for
  it. The rung ladder's top rung is IRREVERSIBLE again, with the correction path stated beside
  it rather than instead of it.
decided: 2026-08-02 · Bob
enacted: 2026-08-03 · CONDUCT — 5318b53, as amended: FW-14's ladder top rung reads IRREVERSIBLE with the correction path beside it (correction always moves forward; below it, attested acts cannot be undone SILENTLY); UI-17a states it; O1's full ceremony inherits it on waking. Reasoning in QUEUE.md (FW-14/UI-17a) and this entry.

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
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-15's deferred scope carries the rule (op=publishpreflight refuses UNCLEARED_HUNCH and nothing else on bias grounds; the manifest SHOWN in the artifact). BIO_Declared_Bias_v0_1.md's blocking paragraph was amended in place by the BOB session. Reasoning there and in QUEUE.md (REC-15).

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
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-12 computes two measurements over two POPULATIONS (capture over documents reached, connection over edges; a leg is an edge carrying both grades). Confirms Q6's pair-of-floors independently (UI-18). Reasoning in BIO_Case_Making_v0_1.md §R2 and QUEUE.md (REC-12).

### DEC-22 · answered
raised: 2026-08-03 · Bob, in the review of the study document
for: bob
question: Is a HUNCH only an asserted connection, or the general form of an ASSUMPTION —
  including an unsupported claim — and does the system work on the member's behalf toward it?
why it is Bob's: doctrine. It widens a construct he ruled into existence (DEC-15) and creates
  a machine driver in the member's path, which touches the "less narrative" stance.
provisional: the narrow reading was running — DEC-15 defined the hunch as a CONNECTION
  asserted ahead of its evidence, temporary declared bias, cleared before publication.
blocks: nothing built. It reshapes REC-13's entry conditions (a claim may be added with NO
  legs), the queue/objectives design, and the evidence-finder scope, all before they exist.
alternative: keep hunches connection-only; treat an unsupported claim as merely an
  incomplete finding with no standing of its own.
recommendation: none was offered; this arrived as a ruling.
reversal cost: low now; rises when the objectives engine exists.
response: **A HUNCH IS AN ASSUMPTION — and an unsupported claim is one, and it is a STANDING
  OBJECTIVE.** Bob, 2026-08-03: *"Part of the process of developing a finding or building a
  case is setting up assumptions - which in CivicOS are called Hunches. So a part of the user
  journeys that should be supported is the creation of an inquiry immediately followed by the
  adding of an unsupported claim (or several claims) to the inquiry. The system will recognize
  those unsupported claims by adding them to a list of objectives it can pursue on the user's
  behalf. In the course of searching for information related to the claim (both by the user
  and the system's objective engine) legs may be created that are added to the claim. Some
  legs may be supportive of the claim, while others cut against. But both types are added.
  Both content and claims are searched in the process of searching for such evidence."*
  **FOUR CONSEQUENCES, recorded so a build session does not re-derive them:**
  - **The hunch construct has two shapes, one debt.** An asserted CONNECTION (DEC-15,
    unchanged) and an UNSUPPORTED CLAIM added to an inquiry. Both are temporary declared
    bias; neither survives to publication (`UNCLEARED_HUNCH` covers both).
  - **An unsupported claim is a first-class OBJECTIVE.** The system recognises it and may
    pursue it: gathering candidate material bearing on the claim, from which the member
    builds legs — supporting AND cutting against, both kept (invariant 7).
  - **The search behind it covers CONTENT and CLAIMS** — documents, and concluded inquiries
    whose findings bear on the question. This is a requirement on the evidence finder's
    scope (the S4 two-systems split must not exclude inquiries from either side).
  - **THE "LESS NARRATIVE" LINE HOLDS AND IS NOW STATED PRECISELY.** The empty
    exploring row (machine chooses what a member should look into: REFUSED, a recommendation
    engine) is not violated by the objective engine, because pursuing a claim the member
    AUTHORED is directed by the member's own words. The engine's work lands under
    DISCOVERING, driven by the claim.
decided: 2026-08-03 · Bob
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-13 permits a claim with no legs as a standing objective (entry conditions for concluded unchanged); the machine-pursuit half is DEC-24's doctrine, parked with the S-item decompositions until Bob resumes the thread. Reasoning in QUEUE.md (REC-13) and this entry.

### DEC-23 · answered
raised: 2026-08-03 · Bob, in the review of the study document
for: bob
question: Is CONTENT — a piece of information extracted from a document — a first-class thing
  the record can point at, and is it the target of a leg, a citation and a connection?
why it is Bob's: doctrine about what the record can express, and it changes the object model
  before anything is built on it.
provisional: DOCUMENT-level addressing was running. A leg, a citation and a connection each
  address a whole capture or bundle; `readings`, `reading_refs` and `resolutions` already hold
  sub-document material, and nothing can point at any of it.
blocks: REC-11 (basis), REC-18 (leg grade), and the D-161/D-163/D-123 cluster.
alternative: keep document-level targets and treat passage anchoring as a later refinement.
recommendation: none offered; it arrived as a ruling, after three prior statements of it that
  this session under-read.
reversal cost: low today; very high once legs, citations and connections are built against
  document identity, because every edge would need re-keying.
response: **CONTENT IS THE UNIT THE RECORD POINTS AT, and a whole document is simply its widest
  extent.** Bob, 2026-08-03: *"a target can be a document - but it can also be a piece of
  content extracted from a document… we should be using the word 'content' to refer to a piece
  of information extracted from a document, and a piece of content can be broad enough that it
  refers to the entire document."*
  **AND THE ANSWER TO HIS QUESTION IS YES, WITH A REASON THE STACK ALREADY CONTAINS.** He asked
  whether extraction matters *"on the road to extracting meaning from the archive"*. `LAYERS`
  runs L2 STRUCTURE → **L3 CONTENT** → L4 INTENT: content is already named as the layer between
  bytes-with-shape and meaning. Nothing can be connected, cited or reasoned over until the thing
  being pointed at is smaller than a filing cabinet — pointing at a 300-page PDF is not pointing.
  **THE FINDING THIS EXPOSES, and it is the twin of the one the study already made about L7.**
  The study's headline structural finding is that L7 (claim) is a named layer with no object.
  **L3 (content) is a second one, and nobody noticed.** Extraction EXISTS — `readings` keyed by
  capture, `reading_refs` giving each reference within a capture a kind/key/label, `resolutions`
  keyed `(capture_sha, ref, entity_id)` and graded — but **no edge in the system can point at
  any of it.** The record knows a reference sits at a place in a document and cannot let a claim
  cite it. The two absences fail together: a claim that could cite a passage is exactly what
  neither layer can express.
  **IT ALSO COLLAPSES THREE DEBT ROWS INTO ONE PRIMITIVE.** D-161 (a connection discards the
  passage anchor `resolutions` already holds), D-163 (a citation cannot point inside a document),
  and D-123 (I2's element reference is PDF-shaped and office formats need a per-container form)
  are all the same missing thing: **an addressable content extent**. They must be solved once.
  **CONSEQUENT SHAPE, recorded so a build session does not re-derive it:** a leg points at
  CONTENT or at another inquiry; a connection relates two pieces of CONTENT; a citation points
  at CONTENT. Content carries its EXTENT (which part of the document) and HOW IT WAS EXTRACTED
  (publisher text layer, machine reading, OCR, member transcription) — the second is never
  hidden, per DEC-4: machine-produced text must never be indistinguishable from publisher text.
  Capture grade stays a property of the DOCUMENT; how content was extracted is its own fact.
decided: 2026-08-03 · Bob
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-11 and REC-18 carry the leg-points-at-CONTENT ruling as a named provisional (target stays an INFO-/INQ- id until D-164's parked content-extent primitive resumes; no second reference vocabulary meanwhile); IC-1's resolution records the same constraint on the element-reference union. D-164's supersession of D-161/D-163/D-123's framing stands. Reasoning in this entry, D-164, and INTERFACE-CHANGES.md IC-1.

### DEC-24 · answered
raised: 2026-08-03 · Bob, in the review of the study document
for: bob
question: What is the machine's role in the member's journey, and what boundary governs it?
why it is Bob's: doctrine. It decides how much of the member's thinking the system may do, which
  is the "less narrative" stance applied to ourselves.
provisional: unstated, which was the problem. The only rules were negative and scattered — the
  assembly rule (a surface may gather what a member wrote, and may not draft, suggest, template
  or complete), the refused recommendation engine, D-89 (bias never shapes what is captured),
  DEC-4 (OCR text never indistinguishable from publisher text), D-151/DEC-7 (a machine credential
  may not resolve or attest).
blocks: nothing built, and it must not stay unstated — it shapes REC-13, the queue/objectives
  design, the evidence finder's scope and every act surface.
alternative: leave AI out of the system definition until the substrate exists.
recommendation: none offered; it arrived as a ruling.
reversal cost: low now; the cost of NOT stating it is that each build session invents its own
  boundary, which is how a recommendation engine arrives by accident.
response: **AI IS PART OF THE SYSTEM DEFINITION NOW, AND THE BOUNDARY IS: THE MACHINE MAY DO THE
  LOOKING; THE MEMBER DOES THE CONCLUDING.** Bob, 2026-08-03: *"We need to design the workflow so
  that the journey is as productive and insightful as it can be. We'll integrate AI elements into
  the framework to support those productivity and insight objectives… These promise to be very
  important and promising capabilities related to the exploring and discovering verbs. We don't
  need to fully architect and design them now, but they must be part of the system definition
  now."*
  **FOUR ROLES**, derived from his examples and placed on the path verbs:
  - **EXTRACT** (discovering) — document → CONTENT (DEC-23), and resolve what it names to
    registry entries. This is the role that makes everything else addressable.
  - **PURSUE** (discovering) — an unsupported claim is a standing OBJECTIVE (DEC-22); find
    material bearing on it and return candidates, supporting AND cutting against.
  - **FIND** (exploring) — search across **both content and claims**: documents held, and
    concluded inquiries whose findings bear on the question.
  - **CHECK** (across all) — read the record ADVERSARIALLY and raise what it finds: a leg that
    does not bear on its claim, an extraction that does not match the page image, a search too
    narrow for the completeness the case will assert, a conclusion below its project's declared
    required strength. Bob named the targets: *"a project, inquiries, claims, content extraction,
    document search"*. **This is the role most worth building**: the stated threat model is
    self-directed overclaiming, so a machine whose job is to argue against the group's own work
    is aimed at the right target.
  **AND HIS OTHER QUESTION IS ANSWERED YES:** an AI may research an inquiry with NO claims, or
  one whose claims do not reach the declared strength. Both are objectives of the same kind — the
  first is the inquiry itself, the second is the shortfall — and neither crosses the boundary,
  because the member authored the question and the standard.
  **THE BOUNDARY, IN FOUR RULES:**
  1. **The machine proposes; the member authors.** Every role returns CANDIDATES; a candidate
     enters the record only through a member act carrying their name. This is what preserves
     authored-and-never-prefilled for the conclusion, the reason, the falsifier and the
     completeness statement — the fields where a suggestion silently becomes testimony.
  2. **The machine may not choose the question.** It works on objectives the member set. It never
     proposes what to be curious about. This is the refused recommendation engine, and it is why
     the empty EXPLORING machine-driver row stays empty as a design position.
  3. **Machine work is labelled and graded as machine work.** `produced_by` already records mode
     and tier on every bundle; extend rather than reinvent. Machine-read text is never presented
     as publisher text (DEC-4); a machine-proposed connection is a HUNCH — declared bias carrying
     debt — until earned or attested by a member.
  4. **A checker raises; it never resolves.** An adversarial pass produces an item in a queue,
     not a change to the record. And no machine credential performs the attested act.
  **NOT DESIGNED HERE, and deliberately:** which model performs which role, how candidates are
  ranked or presented, what an objective costs to run, and how a check's confidence is expressed.
  The roles and the boundary are the system definition; the architecture is later work.
  **AMENDED 2026-08-03 (Bob, in review): RULE 1 HAS A SECOND HALF, AND WITHOUT IT THE FIRST
  HALF IS HOLLOW — THE MACHINE MUST SHOW ITS WORK.** Bob, on the authored-reason field: *"the
  system does know why. If that reason isn't going to be the pre-fill value of the field, then
  it should at least be there to read and consider so that she knows why this is a proper
  action… an AI might have found this connection. So Anna may really need to learn from this
  beat 3 process. So the beat 3 experience should include enough context (even links to each
  end) to support her diving as far into the context as she needs to."*
  **HE IS RIGHT, AND EMPTY WAS NEVER THE SAME AS BARE.** Rule 1 said the member AUTHORS. But
  authorship over something the member cannot see the reasoning for is not authorship — it is a
  rubber stamp, and rubber-stamping is a failure mode this project has already named once, in
  DEC-4, where routine member attestation of machine-read text was the risk to design against.
  A rule that says "the member authors" while permitting a bare field produces the exact outcome
  it was written to prevent, and does so most often precisely when the proposal came from the
  machine rather than from the person signing it.
  **SO RULE 1 READS, IN FULL: the machine never writes the member's reason, and it never hides
  why it thought there was one.** Beside the empty field — never inside it — the surface shows
  the derivation: both ends of the proposed link, the entity they share, how firmly it is tied
  and what would raise it, and the method that produced it. Each is a LINK the member may follow
  to the page image, to the capture and its provenance, and to that entity elsewhere in the
  record. Depth is the member's choice, not the surface's.
  **THIS IS CONSISTENT WITH THE ASSEMBLY RULE AND DOES NOT WEAKEN IT**, on the §4 Q5 test: an
  assembly is permitted when keyed on the SUBJECT the member is writing about, and refused when
  keyed on the ANSWER-SHAPE of the question being asked. The derivation is subject material —
  the evidence and how it connects. A candidate sentence would be answer-shaped. **Show the
  reasoning; never the sentence.**
decided: 2026-08-03 · Bob
enacted: 2026-08-03 · CONDUCT — 5318b53: the four roles and four boundary rules are doctrine, recorded here and referenced from REC-13's pursue path; no role is decomposed into items (deliberately — architecture is later, and the S-item decompositions are parked with Bob's thread). Nothing queued contradicts a rule; a machine credential is refusable on every authored act already queued (REC-13, REC-28, CPDF-10's attestation). Reasoning in this entry.

### DEC-25 · deferred
raised: 2026-08-03 · session BOB, from Bob's action-plan ruling
for: bob
question: What, if any, part of an ACTION PLAN is published?
why it is Bob's: doctrine, risk carrying his name, and effects on people outside the project. A
  plan holds the group's strategic deliberation, which is both the most sensitive material the
  system will hold and the most likely to be sought under legal process.
provisional: **THE PLAN IS WORKING MATERIAL AND IS NEVER PUBLISHED** — the conservative branch,
  and it blocks nothing. The two-bucket fence already keeps working material off the public read
  path by construction, so this is the default rather than a new mechanism.
blocks: nothing. S11 is unbuilt and `impacting` has no working process at all.
alternative: publish some of it — most plausibly the steps actually TAKEN and their outcomes, on
  the argument that a reader judging a case should see what the group did about it.
recommendation: KEEP IT UNPUBLISHED, and make that structural rather than a permission check.
  What legitimately reaches the public is already covered without touching the plan: an action's
  OUTCOME can become evidence (DEC-14 governs claims about our own impact), and the group's
  declared position on contacting the subject is published under DEC-13.
reversal cost: low while nothing is built; high once plans exist and groups have written
  candidly in them under one rule.
trigger: **a group asks to include any part of a plan in a published case**, or a published
  case's account of what the group did is materially incomplete without it — whichever comes
  first. Until then the never-published default costs nothing and is the safe branch.
response: **DEFERRED.** Bob, 2026-08-03: *"I also need to defer DEC-25 for now."*
  **AND THE DEFERRAL CARRIES ONE CONSEQUENCE A LATER SESSION MUST NOT MISS, because deferring
  this is not neutral the way deferring most questions is.** The provisional is not merely a
  placeholder: groups will write in their plans candidly BECAUSE the plans are private. Every
  day the default runs, more material accumulates that was authored under a promise. **So if
  this is ever answered the other way, it can only apply PROSPECTIVELY** — to plans written
  after the change, with the group told before they write. Retroactively publishing deliberation
  that was recorded under a privacy assumption would be a betrayal of the members who wrote it,
  and it is the kind of harm this project's stance exists to refuse. Enact the deferral with
  that constraint attached, not as a bare "not now".
decided: 2026-08-03 · Bob
enacted: 2026-08-03 · CONDUCT — the deferral stands with its constraint ATTACHED, not bare: the never-published provisional runs; if ever answered the other way it applies PROSPECTIVELY only (plans are written under a privacy promise, and retroactive publication would betray it). S11 stays parked with Bob's thread; the trigger is in this entry. Reasoning in this entry.


### DEC-26 · answered
raised: 2026-08-03 · Bob, in the action-plan discussion
for: bob
question: May an action plan be built on findings that are not yet established, and is doing so
  the same as claiming the action is justified?
why it is Bob's: doctrine. It decides whether the record may hold reasoning about what is not
  yet proven.
provisional: unstated. The map written earlier the same day did not address it, and a build
  session reading only the overclaiming doctrine could plausibly have refused it.
blocks: nothing built. It shapes S11 and the pre-flight on any outward act.
alternative: permit planning only from established findings.
recommendation: agree, and record the reasoning rather than the agreement.
reversal cost: low now. High later in an unusual way: a group that used the system to think
  with, and then found its thinking treated as assertion, would stop writing reasoning down.
response: **AGREED, AND THE DESIGN ALREADY CONTAINS THE PRINCIPLE.** Bob, 2026-08-03: *"the
  process of building up an understanding of what's needed to justify an action isn't the same
  as claiming that the action is justified. Not at all! Agreed?"*
  **It is the same move as two rulings already made.** A HUNCH is a connection asserted ahead of
  its evidence so a line of thought can be followed (DEC-15). An UNSUPPORTED CLAIM is a standing
  objective (DEC-22). Both were permitted on one reasoning: investigation is free, PUBLICATION is
  gated. Planning from an unestablished finding is that move one level up, and refusing it would
  contradict both.
  **THE COST OF REFUSING IS THE ARGUMENT.** An investigator does this reasoning regardless — in a
  notebook, in their head, in an email thread. Refusing to hold it does not make the record more
  honest, it makes it LESS COMPLETE, and drives the real shape of the investigation into exactly
  the places this system exists to replace.
  **THE PRINCIPLE: the gate belongs at the ACT, not at the reasoning.** A plan may rest on
  premises not yet established; an act reaching outside the group may not be taken on them.
  **TWO DIRECTIONS, both first-class.** FORWARD from a hypothesis — *if this finding held, what
  options open?* — asserts nothing about whether it holds. BACKWARD from an action — *what else
  would need to be true for action X to be credible?* — **is the more valuable, and is the
  objectives engine pointed at a new target**: its output is a WORK LIST of findings that do not
  yet exist, each becoming an objective under DEC-22.
  **THE SAFEGUARD IS LABELLING, NOT REFUSAL, and Bob named it first:** *"A property of action
  plans that are presented is which elements of the plan are currently supported by the
  evidence."* Every plan element carries a support status — **established** (meets the project's
  declared required strength) · **short of the standard** (real findings, gap named per leg) ·
  **hypothetical** (rests on a finding that does not yet exist) — rendered identically everywhere,
  as `undetermined` is. **The overclaiming failure would not be planning from a hypothesis; it
  would be hiding that it had.**
  **BUILD CONSEQUENCES:** a hypothetical premise is declared and is bias debt of the hunch kind,
  so nothing resting on it publishes while it stands — no new gate needed; an outward act's
  pre-flight refuses when its step is not `established`, naming the premise and the shortfall,
  which is where DEC-17's project-declared strength first does mechanical work.
decided: 2026-08-03 · Bob
enacted: 2026-08-03 · CONDUCT — nothing queued yet: S11 is parked with Bob's thread, and the support-status labelling (established / short of the standard / hypothetical) plus the act-gate rule enter S11's decomposition when it resumes. Recorded so the build session finds the gate at the ACT, not at the reasoning. Reasoning in this entry.

### DEC-27 · answered
raised: 2026-08-03 · Bob, in the review of the study document
for: bob
question: Should CivicOS have an ASSISTANT — a prompt affordance on every surface, taking free
  natural-language text (and voice) — and what governs what it is allowed to do with what it is
  given?
why it is Bob's: doctrine. A general-purpose prompt that can create objects and start acts is
  the single largest surface area the machine will ever have onto the record, and it touches
  every rule about authorship.
provisional: nothing. No such affordance is designed or built; today a member drives the system
  by finding the right screen.
blocks: nothing built. It adds a surface and a construct.
alternative: no assistant; keep every capability behind the surface that owns it.
recommendation: adopt, and the value of the entry is the BOUNDARY rather than the adoption.
reversal cost: low now, very high later — an assistant that acquired the habit of committing
  things directly would be relied on, and taking that back would break how members work.
response: **ADOPT.** Bob, 2026-08-03: *"Just as most full featured UXs include a search box…
  CivicOS should have an Assistant feature. At the top of every surface should be a tag… Hitting
  this tag will expand into a larger window-ish dialog that a user can type anything into… It's
  a feature that allows users to drive the system through natural text input - including voice
  transcription."*
  **IT IS BOTH A CONSTRUCT AND A SURFACE**, and saying so avoids a category error: the TAG is
  present on every surface (like the ACT, which is not a screen and instantiates inside several),
  while the expanded dialog is a place with its own states — S12.
  **THREE REQUEST KINDS, and Bob's three examples are one of each — which is why the boundary
  cannot be one rule:**
  - **FIND** (*"show me new content uncovered over the weekend on the Sewer Fund project"*) — a
    read. No ceremony; it changes nothing.
  - **CREATE** (*"I want to open a new project to explore this tip"*) — proposes objects: a
    project, an inquiry, and the unsupported CLAIMS the member's own prose already contains.
  - **ACT** — anything that changes the record or reaches outside the group.
  **THE RULE A BUILD SESSION WOULD MOST LIKELY GET WRONG, stated first: THE ASSISTANT MAY
  INITIATE AN ACT, AND THE ACT STILL RUNS ITS FOUR BEATS.** It is not a shortcut past the
  pre-flight, the authored reason or the receipt. An assistant that could commit directly would
  be a back door around every safeguard in the system, and it would be the most convenient door
  in the product — which is exactly why it must not exist.
  **WHY THE CREATE CASE IS NOT A VIOLATION OF THE AUTHORSHIP RULES, which is the question that
  matters most.** When a member types *"the annual audit is just a controlled audit rather than
  the general audit that's required"*, and the system turns that into a claim, **the member
  authored the claim** — those are their words. The machine chose the SHAPE, not the content.
  That is transcription and routing, not generation, and it is on the permitted side of the
  assembly rule for the same reason a member's own notes are.
  **BUT THE SHAPE-CHOOSING IS INTERPRETATION, so three limits follow:**
  1. **The assistant never commits. It proposes a structure, shows it, and the member confirms**
     — DEC-24 rule 1, of which this is simply the most visible instance. And per rule 1's second
     half, it shows its work: *this is what I read as the question, these as claims, these as
     the people and bodies named.*
  2. **It may only structure what the member SAID. It may not add propositions the member did
     not state.** If it believes a fourth claim is implied, it ASKS; it does not assert. Adding
     an unstated claim is the machine choosing the question, which DEC-24 rule 2 refuses.
  3. **It may propose project defaults from a self-identification and may never silently set
     them.** Bob's examples open *"I'm a journalist"* and *"I'm a resident of Oakland"*, which
     bear on the project's declared required strength (DEC-17) and its action repertoire. But
     that strength is a DECLARATION the group makes about its own work — inferring it from a
     phrase and applying it quietly would hollow out the declaration. Propose, show, confirm.
  **VOICE TRANSCRIPTION carries one consequence worth naming.** Transcribed speech is
  machine-produced text, and if a mis-transcription flows into an authored field it corrupts the
  member's own testimony — the one thing the record cannot afford to get wrong. So transcribed
  text is always shown for correction before it becomes anything, and that it was transcribed is
  recorded. This is DEC-4's principle (machine-produced text is never indistinguishable from
  what a person wrote) applied to the member's own words instead of a publisher's.
  **RELATION TO THE QUEUE, so the two do not drift into duplicating each other:** S1 THE QUEUE
  pushes — it says what wants the member. The ASSISTANT pulls — the member asks. Same material,
  opposite direction, and Bob's third example is deliberately a pull of what the queue would
  otherwise have pushed.
  **EXTENDED 2026-08-03 (Bob, same review): THE STANCE IS PERMISSIVE, THE ASSISTANT IS NOT A
  MEMBER, AND MULTI-STEP WORK IS A WIZARD.** *"It's an assistant, not a member… it can't do
  anything that breaks the rules (but it can do anything that doesn't break the rules!). If what
  it's asked to do involves multiple steps, it can create a wizard that opens up the right
  surface for the current step and explains what needs to be done, why, and how it fits into the
  objective. This enables the user to complete that step and press next (or finish), after which
  the assistant checks to make sure it was done correctly, and advances to the next step."*

  **(a) THE FRAMING IS CORRECTED: DEFAULT PERMITTED, BOUNDED BY THE RULES.** The version above
  reads as a list of prohibitions, which would produce a timid assistant that asks permission
  for things nothing forbids. The rules already encode everything that matters. Inside them the
  assistant should be as useful as it can be.
  **THE LINE IS AUTHORSHIP, NOT WRITING**, and that distinction is what makes the permissive
  stance safe. The assistant may do anything the record can attribute MECHANICALLY — run a
  search, gather candidates, gather content out of a document, run a check, and yes **capture a
  document**, because a capture asserts nothing a person must vouch for: it records that these
  bytes came from that address at that time, and the provenance is the honest machine account of
  what happened. What it may not do is anything requiring a person to VOUCH: a conclusion, an
  authored reason, a completeness statement, an attestation, or a grade asserted rather than
  earned. Those are testimony, and testimony has a name on it.

  **(b) ATTRIBUTION: THE ASSISTANT IS A NAMED NON-MEMBER ACTOR, AND BOTH FACTS ARE RECORDED.**
  "Not a member" has a consequence the record cannot fudge. If the assistant acted inside the
  member's identity, everything it did would carry that person's name, and the record's
  attribution — the thing this whole system is for — would stop distinguishing what a person did
  from what a machine did at their request. So the record states BOTH: *the assistant captured
  this, at Anna's request.*
  **The plane already has this shape and it should be extended rather than reinvented:** a
  selection lease stamps `member:<id>` for a session and `token:<class>` for a machine
  credential, precisely so *"an unattended writer can take the lock without borrowing a person's
  name and without being anonymous"* (`index.mjs`). The assistant is that pattern with a
  clearer name.

  **(c) THE WIZARD — how multi-step work gets done when the assistant cannot do the steps.**
  This resolves the gap the entry above left open: the assistant may not perform authored acts,
  yet a member's request often needs several. The answer is that the assistant CONDUCTS and the
  member ACTS. For each step it **opens the surface that already owns that step** — it does not
  reproduce the surface inside itself, which would fork the interface — and says what this step
  is, why it is needed, and how it serves the thing the member asked for. The member does the
  step and presses next; the assistant checks the result and moves on.
  **AND THE CHECK IS ADVISORY, NEVER ENFORCEMENT — this is the part a build session will get
  wrong.** If the wizard's check could BLOCK, the rules would live in two places: in the plane,
  and in the wizard. That is exactly the defect DEC-8 refuses, where a surface keeps its own copy
  of the plane's rules and drifts from them. **Enforcement stays where it already is** — the
  pre-flight and the gate — and they are unchanged. The wizard's check is help: it tells a
  member something looks unfinished or inconsistent, and the member decides. If a thing must be
  refused, it is refused by the plane at the act, not by the wizard at the step.
  **The wizard also gives the show-your-work rule somewhere to land at a larger scale.** Rule 1's
  second half says the machine never hides why it thought there was a reason; a wizard step says
  why THIS step, and how it fits the objective — so a member is never moved through a sequence
  they cannot see the shape of.
  **CLARIFIED 2026-08-03 (Bob, same review), AND IT CORRECTS THE PARAGRAPH ABOVE.** *"The
  assistant/wizard gets its understanding of the rules from the server - which is the source of
  trust in that regard."*
  **THE ASSISTANT IS A SURFACE, SO DEC-8 ALREADY GOVERNS IT AND NOTHING NEW IS NEEDED.** DEC-8:
  the pre-flight is *plane-sourced always* — *"a surface may render a refusal it received from
  the plane; it may never compute one"*, because *"a refusal is knowable by the browser exactly
  when the browser holds a copy of the rule, and a copy is drift waiting to happen."* The
  assistant holds no copy of the rules. It asks.
  **WHAT THIS CORRECTS:** the wizard paragraph reached for DEC-8's REASONING (two copies drift)
  and drew the wrong conclusion from it — *therefore the check is merely advisory*. The right
  conclusion is *therefore the assistant is plane-sourced like every other surface*. There was
  never a second copy to be advisory about.
  **SO THE WIZARD MAY BE DEFINITE ABOUT RULES, and should be.** When it says a step cannot
  proceed, it is relaying the plane's own refusal in the plane's own words — the same answer the
  act's pre-flight gives, surfaced earlier. That is not a second gate; it is the same gate, seen
  sooner. An assistant that hedged about a rule it could simply have asked about would be worse,
  not safer.
  **TWO KINDS OF CHECK, and only the second is advisory — the distinction the original paragraph
  was groping for:**
  - **RULE checks** are the plane's, relayed verbatim, and carry the plane's authority.
  - **OBJECTIVE checks** are about whether the member's own stated goal has been met — *you said
    you wanted three claims and there are two* — and those are advisory BY NATURE, because the
    objective belongs to the member and not to the record. The assistant may observe; the member
    decides.
  **ARCHITECTURAL CONSEQUENCE WORTH NAMING: the assistant introduces NO NEW TRUST BOUNDARY.** It
  is bound by the same mechanism that binds every other surface, which is why a general-purpose
  prompt with wide reach does not widen the system's attack surface in the way one might expect.
decided: 2026-08-03 · Bob
enacted: 2026-08-03 · CONDUCT — nothing queued yet: S12 and its wizard are parked with Bob's thread; the assistant holds no copy of the rules (asks the plane, bound by DEC-8, no new trust boundary) and that constraint is recorded for its decomposition. Reasoning in this entry.

### DEC-28 · answered
raised: 2026-08-03 · session BOB (RECONCILED §4 Q8 / SB-CORE §5, working the open questions at
  Bob's direction)
for: bob-session
question: Is `divided` a STATE or a DISPOSITION?
why it is this session's: data-model vocabulary and mechanism. RECONCILED flagged it only
  because REC-16 must not ship it SILENTLY — the requirement was an explicit decision with its
  reasoning recorded, not that the decision was Bob's.
provisional: SB-CORE models it as a terminal state; REC-16 is unbuilt, so nothing ships either
  way yet and nothing is blocked.
blocks: none.
alternative: a disposition, beside `deferred` and `dismissed`, which are also terminal-ish.
recommendation: terminal state — see response.
reversal cost: low until REC-16 ships; a rename after that touches vocabulary on every surface
  that renders an inquiry's lifecycle.
response: **A TERMINAL STATE, reached only by the division act.** Decided by this session,
  2026-08-03. The line between the two families is not terminality — `deferred` and `dismissed`
  are terminal-ish too — it is WHAT THE WORD CLAIMS ABOUT THE QUESTION. A disposition is a
  member's judgment about a well-formed question: deferred says *not now*, dismissed says *not
  worth pursuing*, and the question survives the judgment unchanged; what changed is the group's
  stance toward it. Division says the QUESTION ITSELF was malformed — it was two questions — and
  the parent is corrected FORWARD into its children. That is DEC-19's shape (correction always
  moves forward) and the supersession family, not the declination family. Three consequences
  make this material rather than taxonomy:
  1. **The reason grammar.** Division's authored reason belongs to the ACT and covers the whole
     restructuring (R4-b, one reason for the division). Routing it through `disposition_reason`
     would make one field carry two grammars — a stance toward a question, and an account of a
     restructuring — and every consumer of the field would have to know which it holds.
  2. **A disposition can be revisited; `divided` cannot.** A deferred inquiry comes back. A
     divided parent's legs are OWNED by its children now, and un-dividing would be the record
     changing its mind in silence. The terminality is structural, not a policy choice, which is
     exactly what "state" says and "disposition" does not.
  3. **The surfaces already render it as a state** — `⟨INQUIRY⟩ · divided  divided by ⟨ana⟩ on
     ⟨2026-08-03⟩` (SB-CORE:1267), with the parent's card naming where every leg went — and
     R4-e's published-edge correction treats the divided parent as a terminal node the surface
     may NAME and never serve. Both were designed on the state reading.
decided: 2026-08-03 · session BOB
reasoning recorded in: this entry; RECONCILED §4 Q8 is marked settled by it in place.
for CONDUCT to enact: a scope note on REC-16 — `divided` ships as a terminal STATE written by
  `op=inquirydivide`, its reason is the act's reason, and `disposition_reason` is untouched.
  Nothing else changes; SB-CORE already drew it this way.
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-16 ships divided as a terminal STATE written by op=inquirydivide, the reason is the act's reason, disposition_reason untouched. Reasoning in QUEUE.md (REC-16) and this entry.

### DEC-29 · answered
raised: 2026-08-03 · session BOB (RECONCILED §4 Q7 — CRITIQUE D-7's two halves R4 does not
  reach)
for: bob
question: Division's two residuals after R4: (a) must division carry severance's PER-LEG reason
  cost, or does one authored reason plus total disclosure stand? (b) may the surface offer
  `[ Divide this… ]` at the exact moment the weakest leg is holding the member's strength down?
why it is Bob's: R4 is his ruling and these are the two things it explicitly chose not to
  cover; (b) is doctrine about whether the system may propose an act whose visible effect is a
  higher publishable strength — the compellingness line (C3).
provisional: nothing is blocked; both are live only when REC-16 ships. (a) runs as R4 is
  written: one authored reason for the whole division. (b) runs as SB-CORE:1070-1073 draws it,
  wording confined to the structural act, proposing no split and no wording.
blocks: none.
alternative: (a) a per-leg reason on apportionment, equalising the cost with severance.
  (b) remove the contextual prompt; division stays reachable only from the standing action row.
recommendation: KEEP BOTH, on one observation the register did not yet contain: **division
  cannot do severance's work at a discount, because the apportionment table refuses to drop a
  leg** — *"every leg gets a home… Neither is not"* (R4-a). Severance REMOVES material from a
  question; division only RE-HOMES all of it, with the parent recording where every leg went
  and each published child naming its parent and siblings. The two acts do not substitute, so
  cost parity between them defends nothing — and the per-leg judgment division does involve is
  already recorded PER LEG, in the apportionment itself. A per-leg reason would be friction
  theatre on an act whose disclosure is already total. For (b), keep the prompt: the moment the
  weakest leg is named is the moment the member can actually act on the structure, and what
  polices misuse is R4's friction plus the fact that NOTHING LEAVES THE RECORD — the sibling
  exists, and the published child must name it, so the raised strength conceals nothing. One
  requirement instead of a timing rule: the prompt's wording must state the disclosure — that
  the other question stays on the record and the published child will name it — so what is
  offered is visibly honesty, not concealment. (DEC-26's principle, one construct over: the
  gate is at the act, not at the reasoning that led there.)
reversal cost: low both ways until REC-16 ships; (b)'s wording clause is a UI string.
response: **RECOMMENDATION ADOPTED.** Bob, 2026-08-03: *"I'll follow your recommendation."*
  (a) One authored reason for the whole division stands; the disclosure, not per-leg friction,
  is the counterweight — division cannot do severance's work at a discount because no leg may
  be dropped. (b) The divide prompt stays at the moment the weakest leg is named, and its
  wording MUST state the disclosure: the other question stays on the record and the published
  child will name it.
decided: 2026-08-03 · Bob
reasoning recorded in: this entry (the recommendation carries the full argument).
for CONDUCT to enact: REC-16 gains the prompt-wording clause as an acceptance item; RECONCILED
  §4 Q7 marked settled by this entry.
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-16 keeps one authored reason per division and gains the prompt-states-the-disclosure acceptance clause. RECONCILED §4 Q7 settled in place. Reasoning in QUEUE.md (REC-16).

### DEC-30 · answered
raised: 2026-08-03 · session BOB (RECONCILED §4 Q10 — four files, one question)
for: bob
question: Is DIVISION owner-scoped or author-scoped, and does CONCLUDING an inquiry need a
  ballot when a project has multiple owners?
why it is Bob's: capability reach on two of the record's heaviest acts, and the accountability
  shape of a conclusion — doctrine.
provisional: nothing is blocked. REC-16 ships division author-scoped (any `contribute` holder,
  act attributed); concluding is a single member's act, as everywhere else in the corpus.
blocks: none.
alternative: owner-scoped division (the §7 pattern — owners decide structure); conclusion by
  ballot among owners.
recommendation: AUTHOR-SCOPED division and NO BALLOT on concluding, with the same reason under
  both: **the record wants ONE NAME on every judgment.** Division is how a member escapes an
  overclaiming mix, so owner-only would let an owner hold another member's name against an
  overclaim that member can see — de-escalation must never require permission from someone
  whose incentive may run the other way (SB-CORE's own argument, and it is decisive). A ballot
  on concluding would make conclusions committee products with diluted accountability, and the
  machinery for disagreement already exists in a better shape: a conclusion is an act with a
  name and a date, reopening is an act (DEC-12), strength falling is an event that propagates
  (DEC-16), and contradiction is a thing to FIND (D-80). Dissent that must be expressed before
  the act is a veto; dissent expressed on the record after it is evidence.
reversal cost: asymmetric, and it favours this branch: adding a ballot later is additive;
  removing one later takes away a protection someone relied on. Author-scoping likewise
  reverses to a predicate on the act if practice shows abuse.
response: **RECOMMENDATION ADOPTED.** Bob, 2026-08-03: *"I'll follow your recommendation."*
  Division is author-scoped — any `contribute` holder, act attributed — and concluding needs
  no ballot: one name on every judgment, with disagreement expressed through reopening,
  propagation and contradiction-finding, on the record, after the act.
decided: 2026-08-03 · Bob
reasoning recorded in: this entry.
for CONDUCT to enact: REC-16 ships author-scoped as already planned, now settled rather than
  provisional; REC-13's conclude path gains no owner gate and no ballot. RECONCILED §4 Q10
  marked settled by this entry.
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-16 author-scoped as SETTLED; REC-13's conclude gains no owner gate and no ballot. Reasoning in QUEUE.md (REC-16/REC-13).

### DEC-31 · deferred
raised: 2026-08-03 · session BOB (RECONCILED §4 Q14 third bullet; AUDIENCES rows 13–14)
for: bob
question: What is ADDRESSED NON-PUBLIC DELIVERY — a case sent to one recipient (a confidential
  referral, a pre-publication briefing) — and when does a persistent RENDERING someone acted on
  become a record?
why it is Bob's: effects on people outside the project (a recipient relies on it), risk
  carrying his name, and it sits on neither side of the two-bucket fence — DEC-25's
  neighbourhood.
provisional: nothing is blocked. Both are modelled provisionally as an ACTION — the member
  performs the delivery outside the system and records having done it — and the two-bucket
  fence stays intact: nothing non-public leaves the instance by any system path.
blocks: none.
alternative: design the third bucket now — a delivery construct with recipient identity,
  hashing, and re-serving.
recommendation: DEFER with a named trigger, and bind ONE constraint now. AUDIENCES' own line —
  *"settled by the first lawyer, not by argument"* — is right: designing confidential delivery
  before any group needs one is designing custody in the abstract, the mistake DEC-2 exists to
  refuse. Trigger: **the first group that asks to send a case to a named recipient without
  publishing it.** The constraint that must NOT wait, because it is retroactively unfixable in
  exactly the way DEC-25's is: any rendering that leaves the instance addressed to someone
  carries its hash, its date, its author and both threshold floors IN-BAND (H4's rule, extended
  from published renderings to addressed ones) — so that if the recipient acts on it, what they
  acted on is checkable later. A rendering sent outward without those is an unverifiable claim
  wearing the group's name; recording them costs nothing at the moment of sending and cannot be
  done after.
reversal cost: the deferral costs nothing (the action-model provisional blocks nothing); the
  in-band constraint is a rendering rule, cheap now, impossible retroactively.
response: **DEFERRED, per the recommendation.** Bob, 2026-08-03: *"I'll follow your
  recommendation to defer."* The recommendation was defer-plus-bind, so BOTH halves are in
  force: the delivery construct waits for its trigger, and the in-band rule binds NOW — any
  rendering that leaves the instance addressed to someone carries its hash, date, author and
  both threshold floors inside itself. The rule costs nothing before the construct exists and
  cannot be applied retroactively after.
trigger: the first group that asks to send a case to a named recipient without publishing it.
decided: 2026-08-03 · Bob
reasoning recorded in: this entry; the in-band extension belongs beside H4 in AUDIENCES.md.
for CONDUCT to enact: record the H4 extension (addressed renderings carry hash, date, author
  and both floors in-band) in AUDIENCES.md §8's rule, so the first session to build any
  outward rendering inherits it. RECONCILED §4 Q14's delivery bullet marked deferred by this
  entry.
enacted: 2026-08-03 · CONDUCT — 5318b53: deferred on its trigger (first group asking for addressed non-public delivery), and the BOUND rule is recorded now — addressed renderings carry hash, date, author and both floors in-band — on UI-18's scope beside H4 (the AUDIENCES.md header pointer names it). Reasoning in this entry and QUEUE.md (UI-18).

### DEC-32 · open
raised: 2026-08-03 · session BOB (Bob's overlapping-utility example,
  BIO_Case_Making_v0_1.md, clarified by him 2026-08-03)
for: bob
question: May one finding hold SEVERAL PARALLEL CLAIMS — two independent bodies of support
  answering one question — or must the utility example split into two inquiries whose published
  rendering reassembles them?
why it is Bob's: doctrine — what a finding IS and what its stated strength may claim. The
  example is his and the lean toward plurality is his.
provisional: nothing is blocked; `inquiry_basis` does not exist, so both shapes remain cheap.
blocks: none.
alternative: two inquiries under a parent whose rendering reassembles them — already weakened
  in the doc's own analysis, because it splits an answer a reader needs whole.
recommendation: ADOPT PLURALITY, shaped as GROUNDS rather than claim-objects: one finding, ONE
  conclusion, `1..n` named GROUNDS, each ground a labelled partition of the basis legs that the
  member asserts is INDEPENDENTLY SUFFICIENT. Today's flat basis is the degenerate case — one
  implicit ground — so nothing existing changes shape. This keeps the collapse intact: a ground
  has no identity, no falsifier of its own, and cannot be cited alone, so nothing nested
  rebuilds the multiplicity the collapse removed. And it carries the consequence that is the
  real payoff, because it changes the strength arithmetic: **grounds compose DISJUNCTIVELY —
  the finding's strength is its strongest sufficient ground, and a ground's strength is the
  weakest leg within it.** A conclusion established at B on the constitutional ground is
  established at B, full stop; the regulatory ground offered beside it at C weakens nothing —
  where today the weakest-leg rule holds the whole finding to C and pushes the member toward
  division. So plurality removes one of the two honest pressures behind DEC-29's divide prompt,
  and it is not an overclaim, because "independently sufficient" is the member's authored
  judgment, per ground, with their name on it — the same accountability shape as the conclusion
  itself. R1 composes cleanly: a suspended leg suspends its GROUND; the finding suspends only
  when EVERY ground is suspended (DEC-18's pattern, one level up). Q14's contradiction case
  stays separate and stays undesigned — grounds agree on the conclusion; contradiction is two
  conclusions disagreeing.
reversal cost: low now, while `inquiry_basis` is unbuilt. Rising after: once grounds exist,
  renderings and citations will hang off their labels.
CLARIFIED 2026-08-03 by Bob, twice, and the entry stays OPEN pending his read of the answers:
  (1) *"You talk about grounds, but what that really is is multiple claims."* **CONCEDED —
  semantically each ground IS a claim: the same proposition asserted on a distinct basis.**
  What the grounds shape refuses is not claim-plurality; it is separate OBJECT IDENTITY for
  each claim inside the finding. The sharpened test this exchange produced, which is the
  useful residue: **count the falsifiers.** If the parallel supports assert the SAME
  proposition, they share ONE falsifier — that is plurality inside one finding, whatever the
  surface vocabulary calls it (calling them "claims" on screen is fine). If they assert
  DIFFERENT propositions (*the regulations do not forbid it* vs *the constitution
  affirmatively grants it*), each has its OWN falsifier — and a thing with its own falsifier
  is an inquiry, so that case is composition (recursion, already answered), with the
  published rendering free to present the family together.
  (2) He asked for the weakest-leg rule to be justified by example — answered in session with
  the conjunctive/disjunctive distinction: weakest-leg is right when every leg is
  load-bearing (the reader must be able to check every link the claim NEEDS, so the claim's
  checkability is its least-checkable necessary link); his utility example is the case where
  legs are NOT all necessary (independent sufficient bases), which is exactly why the flat
  model needs this decision. One rule, two shapes: min over necessary legs, max over
  independently sufficient bases.
RULED IN PART 2026-08-03 by Bob — THE ARITHMETIC IS SETTLED: *"The simple truth is that
  sometimes the weakest is the claim's strength, and other times it's not. The difference is
  really whether the relationship between legs is AND or OR."* So a claim's basis carries the
  RELATIONSHIP, not just the legs: strength is the MINIMUM over AND-related legs and the
  MAXIMUM over OR-related branches (minimum within each branch, since a branch is itself an
  AND). What remains open is only the OBJECT SHAPE — whether the OR-branches are claims
  inside one finding (one proposition, one falsifier) with separate inquiries reserved for
  distinct propositions (the falsifier-count test), which awaits Bob's confirmation. Any
  build touching REC-12's strength derivation must model the AND/OR relationship from the
  start; a flat implicit-AND basis is now known to be wrong.
RECOMMENDATION SHARPENED 2026-08-04, at Bob's request ("you're more tuned into the place
  of falsifiers — what's your recommendation, and why?"). **ADOPT THE FALSIFIER-COUNT TEST,
  and the reason is that it is not a second rule beside the AND/OR arithmetic — it IS that
  arithmetic, read from the other side.** Strength composes: MIN over AND legs, MAX over OR
  branches (Bob's ruling). Refutation composes DUALLY: to refute an AND chain you break ANY
  ONE necessary link; to refute an OR set you must break EVERY branch. Those are De Morgan
  duals, so the falsifier count is not an extra judgment a member must make — it is entailed
  by the AND/OR relationship they have already declared. One rule, two faces.
  **AND THAT DISSOLVES THE APPARENT PROBLEM WITH BOB'S OWN EXAMPLE.** The clarification
  worried that "the regulations do not forbid it" and "the constitution affirmatively grants
  it" are different propositions with different falsifiers, which would route the utility
  example to separate inquiries — the outcome the example was raised to resist. Under the
  dual, it does not: an OR-composed finding has ONE falsifier, and it is COMPOUND —
  *every ground fails*. Compound is not plural. It is finite, checkable, and each branch is
  nameable, which is exactly what a falsifier has to be. So the utility example is ONE
  finding, as Bob leaned, and the falsifier test agrees rather than overriding him.
  **THE OPERATIONAL TEST, stated so a member can apply it without this reasoning:** *would
  refuting this ground alone change the conclusion?* If NO — the other ground still carries
  it — the grounds are OR-related and live inside one finding. If YES, the leg was necessary
  (AND) all along. **And the test for separate OBJECT IDENTITY is CITABILITY: does anything
  need to cite this part ALONE?** Identity exists so a thing can be referenced; a ground no
  leg will ever cite by itself does not need an id, and giving it one rebuilds the
  multiplicity D-127's collapse removed. When a member genuinely needs to cite *the
  constitution grants it* on its own — in another inquiry, for another conclusion — that is
  the signal it was always its own inquiry, and recursion (already answered) composes it.
  **THE HAZARD TO NAME, because the ruling creates it:** OR takes the MAX, so a member has a
  standing incentive to bundle a weak ground beside a strong one and publish at the strong
  one's grade. Three things already contain it and no new machinery is needed: *independently
  sufficient* is an AUTHORED judgment carrying the member's name (the same accountability
  shape as the conclusion itself); the compound falsifier is the check, because a member who
  cannot state a falsifier requiring EVERY branch to fail has not got OR-related branches;
  and each ground's legs stay visible, so a reader tests sufficiency rather than taking it.
  What I would NOT do: mint a separate falsifier per ground. It reads as more honest and is
  less — it converts one checkable compound falsifier into several partial ones, none of
  which refutes the finding, and a reader who breaks one would reasonably believe they had.
BOB'S CONSTRAINT, 2026-08-04, and it governs the BUILD rather than the meaning: *"the
  average CivicOS [member] doesn't have a philosophy degree. So the nuances of multiple
  claims and falsifiers will be lost on the average user. So the system needs to support the
  user through the experience so that what they end up with is correct and proper. The flip
  side… we don't want a user to be able to game the system by packaging the legs across
  different claims to beneficially raise or lower the strength to match their bias."*
  **BOTH HALVES ARE SATISFIED BY ONE MOVE: the member is never asked for the STRUCTURE,
  only for CONSEQUENCES, and the structure is derived from their answers.** The elicitation
  design, decided by this session as mechanism (Bob's 2026-07-31 delegation) and binding on
  REC-11/REC-12 and the UI-11/UI-12 surfaces:
  1. **NEVER show AND / OR / disjunction / grounds — not even as tooltips.** The vocabulary
     is the analyst's, not the member's, and a member who must learn it to state a finding
     will state a worse finding.
  2. **ASK ONE CONSEQUENCE QUESTION PER LEG, in the member's own terms:** *"If this turned
     out to be wrong, would your answer still hold?"* Anyone can answer that about their own
     reasoning without vocabulary. "No, my answer falls" → the leg is NECESSARY (AND). "Yes,
     because of these others" → it is INDEPENDENTLY SUFFICIENT with them (an OR branch).
     The relationship Bob ruled is ENTAILED by the answers; it is never asked for.
  3. **SHOW THE DERIVED FALSIFIER BACK, in plain words, and let them correct it.** *"Your
     answer fails only if ALL of these fail: …"* versus *"…fails if ANY of these fails: …"*.
     **Reading a falsifier is enormously easier than authoring a structure**, and it is the
     one check that catches a mis-elicited structure: a member who reads it and says "no,
     that's not right" has just corrected the model without knowing the model exists.
  4. **THE DEFAULT IS AND, AND THAT IS THE ANTI-GAMING KEYSTONE.** An unstructured basis
     stays implicit-AND — weakest leg — which is the CONSERVATIVE direction. Independent
     sufficiency must be affirmatively claimed, per branch. So strengthening a finding by
     repackaging requires an ACT that carries the member's name; it can never happen by
     omission, by default, or by a member simply not understanding the question.
  5. **THE STRUCTURE IS AUTHORED BEFORE THE STRENGTH IS SHOWN.** This is the ordering rule
     and it is the difference between a design that resists bias and one that invites it: a
     member shown the grade first will reorganise legs against it, exactly as a prefilled
     justification invites a rationalisation (the J-construct's never-prefill rule, one
     construct over). Consequence first, arithmetic second.
  6. **RESTRUCTURING AFTER SEEING THE STRENGTH IS LEGAL, RECORDED AND ATTRIBUTED** — never
     blocked. A member may legitimately realise their structure was wrong. The defence is
     visibility, not prohibition: it is a revision with an authored reason, and the system
     may NOTICE the pattern (a weak leg moved into its own branch immediately after a
     strength drop) and surface it to the member and the reader. Derived informs, authored
     binds (D-90) — a machine may not refuse the act and must not hide it.
  7. **AND THE READER IS THE FINAL CHECK, which is what makes this safe to ship**: the
     published case shows each branch and its legs, so "these were independently sufficient"
     is a claim ANY reader can test against the legs themselves. Bias survives a private
     judgment; it does not survive a published structure with the member's name on it.
  **Falsifiable, per the constructs doctrine:** if members routinely answer the consequence
  question one way and then correct the derived falsifier, the elicitation is wrong and the
  question needs rewording — measure it on the first real inquiries rather than predicting it.

### DEC-33 · answered
raised: 2026-08-03 · Bob, in session (on S8, the publication ceremony)
for: bob
question: When is the publication ceremony — the five-step member-facing process — built?
why it is Bob's: priority, on the heaviest act in the system.
provisional: publishing exists only in the operator's page; no member-facing process.
blocks: nothing — the deferral IS the answer.
alternative: build the ceremony on the existing chain order (REC-14 → REC-22 → UI-18, with
  UI-17 the ceremony surface).
recommendation: n/a — raised already answered.
reversal cost: none; deferring surface work is the cheap branch by construction.
response: **THE PROCESS IS DEFERRED; A PLACEHOLDER SURFACE SHIPS IN ITS PLACE.** Bob,
  2026-08-03: *"The publication process is very involved. Defer anything related to the
  process, though create a placeholder surface."*
  THIS SESSION'S SCOPE DETERMINATION, which is tactical and mine: "the process" is the
  MEMBER-FACING CEREMONY and its process-specific supports — **UI-17 (the five-step ceremony)
  and REC-15 (`op=publishpreflight`, the ceremony's dry-run) are deferred.** The PLANE's
  publication machinery is NOT the process and stays queued: REC-14 (publish + editions)
  carries DEC-12/DEC-19 doctrine, REC-22 is the public read path, and UI-18 is the READER's
  page — all needed by S9 whatever the ceremony looks like, and all reachable today through
  the operator's page, which remains the publishing route in the meantime. The PLACEHOLDER:
  S8 exists as an entry point that states what publication is, that the ceremony is coming,
  and that publishing currently runs through the group's operator — honest narration of an
  absent capability, surface-scoped, exactly the Q12 rule.
  RE-ENTRY CONDITION, named so nobody re-raises early: the chain through UI-18 has landed and
  a group needs to publish without its operator.
decided: 2026-08-03 · Bob
reasoning recorded in: this entry.
for CONDUCT to enact: UI-17 and REC-15 move to DEFERRED with this entry as the reason; a
  small UI item for the S8 placeholder is added where UI-17 sat; REC-14/REC-22/UI-18 are
  unaffected. Kickoffs naming UI-17 as next-up must be corrected in the same pass.
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-15 and UI-17 moved to blocked with this ruling as the reason and Bob-reopens-the-thread as the trigger; UI-17a queued in UI-17's place (entry point stating what publication is, operator-run for now, Q12 narration); REC-14, REC-22 and UI-18 stay queued — they are not the process. No kickoff names UI-17 as next-up (checked). Reasoning in QUEUE.md (REC-15/UI-17/UI-17a).

### DEC-34 · answered
raised: 2026-08-03 · Bob, in session (on S9, the published case)
for: bob
question: What IS the published-case artifact, physically?
why it is Bob's: doctrine — the form of the thing a stranger checks; risk carrying the
  group's name on every copy that circulates.
provisional: none existed; S9 had "no data path" and no artifact form.
blocks: none.
alternative: HTML-only serving from the instance, no portable artifact.
recommendation: n/a — raised already answered.
reversal cost: low until REC-14/REC-22 build to it; the artifact form shapes both.
response: **A PROTECTED BUNDLE-LIKE CONTAINER, REDUCED ALSO TO A SET OF PDF RENDERINGS THAT
  SURVIVE OUTSIDE THE WORKFLOW.** Bob, 2026-08-03: *"I envision a published case as a
  protected zip. A bundle-like object. But this bundle must also be reduced to a set of pdf
  documents. But the pdfs are just renderings of the bundle accessible outside the CivicOS
  workflow. So they must be write protected and brazened with unavoidable info about the
  case, the author, bias, edition #, TOC, etc."*
  this session's determinations, which follow from the ruling and are mine:
  - **"PROTECTED" MEANS TAMPER-EVIDENT, NOT TAMPER-PROOF, and the record must never claim
    otherwise.** A PDF's write-protection flag is advisory — any free tool strips it — and
    zip passwords either use broken encryption or lock out the stranger S9 exists to serve
    ("read it, check it, print it — without our cooperation"). Claiming write-protection as
    the guarantee would be the record claiming more than it can support. What actually
    protects: (1) the container carries a MANIFEST of the hash of every part, itself signed
    by the group's published key; (2) each PDF's hash is in `published_shas`, so any copy
    anywhere can be checked against the instance — the existing answer-by-hash mechanism,
    extended to renderings; (3) the write-protect flag is ALSO set, as friction for honest
    users, never as the claim. A modified copy is not prevented; it is DETECTABLE by anyone,
    which is the stronger property because it needs no DRM and no cooperation.
  - **THE BRAZENING IS H4 MADE UNAVOIDABLE, and it goes on every page, not a cover sheet.**
    H4 already rules that qualifiers travel inside the artifact in every rendering because
    files get forwarded. Bob's list lands as a running header/footer on EVERY page of every
    PDF: case id and title, edition number (DEC-12), the authors, the declared bias
    (DEC-20 — it travels), both threshold floors of the stance rendered (Q6), the artifact
    hash, and where to verify it. A page separated from its document still names what it is.
    The TOC is the container's manifest rendered readable: every part, every PDF, every hash.
  - **THE ZIP IS THE BUNDLE'S PORTABLE FORM, not a new object.** A published case is already
    a bundle (documents + attachments + history); the container is that bundle serialised
    with its renderings beside it. One artifact, two audiences: the zip for whoever will
    verify structurally, the PDFs for whoever will read, print and forward. Editions
    (DEC-12) apply to the container as a whole — a new edition is a new container with a new
    hash, and earlier editions keep answering.
decided: 2026-08-03 · Bob
reasoning recorded in: this entry; the artifact form belongs in AUDIENCES.md beside H4 and
  in REC-14/REC-22's scope when CONDUCT enacts.
for CONDUCT to enact: REC-14 gains the container form (manifest + signature + editions over
  the container); REC-22 serves the container and its parts by hash; UI-18 renders from it;
  a rendering item gains the every-page brazening as an acceptance clause with the negative
  control "a page rendered without the header fails the harness". Sequencing unchanged —
  this shapes items already queued rather than adding one.
enacted: 2026-08-03 · CONDUCT — 5318b53: REC-14 carries the container form (zip + signed hash manifest, editions over the container); REC-22 serves it and its PDF renderings with the per-page header (case id, edition, authors, declared bias, both floors, hash, verification pointer) and the page-without-header negative control; UI-18 renders it. Tamper-EVIDENT, never claimed tamper-proof. Reasoning in QUEUE.md (REC-14/REC-22/UI-18).

### DEC-35 · answered
raised: 2026-08-03 · CONDUCT (from CPDF-9's measurement and CPDF-10's placement note)
for: bob
question: Which external OCR service does CPDF-10 build against, on which account, at
  whose cost? The measurement (MEASUREMENTS.md 2026-08-03) rules out both in-account
  wasm placements by bundle size; the recommended first placement is an external
  service, which means choosing a vendor, opening/funding an account, and putting a
  credential in `.env` — a recurring cost and a named third party in every
  transcription's provenance chain, both of which carry Bob's name.
why it is Bob's: money (a paid service), and an external relationship — the record
  will permanently name the service in the provenance of every OCR'd document. The
  privacy half is already ruled (DEC-5: public records; DEC-4: this is not D-94's
  egress question — we send a document out, we do not fetch one).
provisional: CPDF-10 stays `queued`, not active — nothing blocks on the answer,
  because FW-15 (its acceptance prerequisite) runs first regardless and the rest of
  the board is full. No vendor is being evaluated in code; nothing is built against
  a guessed API shape.
alternative: skip the service and wait for the ocr-worker fleet-member end-state —
  rejected as the FIRST step by the measurement's own gating (it needs a deployed
  workerd CPU probe and a page-to-pixels renderer, neither of which exists), though
  it remains the preferred end-state.
recommendation: pick a service whose OCR output includes per-region confidence and
  coordinates (the chain and the image-region anchor need both), whose terms permit
  processing public government records, and whose identity+version can be pinned in
  the provenance chain. The local tesseract fast-model floor it must beat: 99.96%
  character accuracy, 90/90 digits, zero minted digits on the ground-truthed page.
reversal cost: low before any corpus is transcribed; after that, re-running under a
  different service produces different claims and every leg resting on the old ones
  keeps naming the old service — which is by design, but makes switching noisy.
response: **MEASURE MOONDREAM FIRST — the question's premise is reframed before it is
  answered.** Bob, 2026-08-04, on being shown that Cloudflare Workers AI now carries an
  OCR-capable vision model (Moondream 3.1, coordinates included, reachable through the
  `env.AI` binding on the Free plan): *"I'm thinking that from the perspective of a new
  instance setting up, having everything in Cloudflare would be a simplification"* —
  and it is more than a simplification. The external-service question as raised
  optimised for THIS instance; the product is SOVEREIGN instances, and an OCR path that
  requires every future group to open, fund and hold a credential for a second vendor
  account is a D-115-class distribution liability. The in-account path removes the new
  account, the standing credential (a binding, not a key) and the new third party in
  the provenance chain, for every instance the installer ever creates.
  THE RULING: (1) probe Moondream 3.1 on our own instance FIRST — it costs nothing and
  needs no setup (CPDF-11, handed through the BOB INBOX); (2) at equal fitness against
  the ground-truth floor, the IN-ACCOUNT path wins and becomes the default instance
  path; (3) the external service is the ESCALATION tier (documents whose grade demands
  a calibrated-confidence engine) or the fallback if the probe fails, with Azure DI
  Read the primary external candidate per the survey; (4) NOTHING IS FUNDED NOW — the
  Azure account walkthrough is shelved pending the probe.
  ON THE CONFIDENCE CONTRACT, Bob's question answered in session ("we do need that,
  right?") and the determination is this session's under delegation: the record needs
  the FUNCTION of per-region confidence, not the number. Two functions: the refusal
  trigger (garble → undetermined) and the checkability anchor (the image region a
  reader or attester checks against pixels). The anchor needs COORDINATES, which
  Moondream claims and CPDF-11 verifies — non-negotiable. The trigger, for a
  confidence-less engine: the chain states `confidence: none` first-class; the
  engine's transcription-fidelity CAP is set lower by measurement (DEC-4's existing
  knob — no machine mints the grade); pseudo-confidence (asking the model how sure it
  is, thresholded as if calibrated) is FORBIDDEN as the costs-nothing class; but
  measured self-refusal is earnable — CPDF-11's degradation ladder scores whether the
  model refuses or invents on degraded regions, and only that measured reliability can
  license structured self-refusal as a per-region trigger. Escalation to the
  calibrated tier or to attestation covers legs the cap cannot.
decided: 2026-08-04 · Bob
reasoning recorded in: research/OCR-SERVICE-SURVEY.md (the Cloudflare section and the
  confidence-function analysis) and this entry.
for CONDUCT to enact: queue CPDF-11 (in the BOB INBOX 2026-08-04); fund no external
  account; when CPDF-10 is next scoped, its acceptance changes from "per-region
  confidence" to "per-region confidence WHERE THE ENGINE SUPPLIES IT; a stated
  `confidence: none` in the chain otherwise, with the fidelity cap set by
  measurement" — the provenance-chain and image-region requirements are unchanged.
enacted: 2026-08-04 · CONDUCT — the inbox entry drained: CPDF-11 queued and spawned out of band (measurement, no slot, nothing funded); CPDF-10's placement re-based in place (in-account default pending GO; external the escalation tier; confidence-where-supplied with the forbidden pseudo-confidence and the earnable measured self-refusal recorded); the renderer named as CPDF-12 behind CPDF-11's verdict. Reasoning in DEC-35 itself, research/OCR-SERVICE-SURVEY.md's Cloudflare section, and QUEUE.md (CPDF-10/11/12).

### DEC-36 · answered
raised: 2026-08-03 · CONDUCT (lifted from REC-20's report — the worker built the instruction and named the tension)
for: bob
question: When a queue item's ancestor set includes a case the member CANNOT SEE, the
  contract reports the set `undetermined` with reason `out_of_view` — no id, no title,
  no state, no count. But the fact of incompleteness is itself an EXISTENCE SIGNAL:
  the member learns that something they cannot see sits above their item. D-15 §7.9
  says an uninvited member does not see a project "not its existence"; DEC-16 says a
  silently shorter set is indistinguishable from nobody caring. The two rules point
  opposite ways on this one bit. Which yields?
why it is Bob's: doctrine — the collision of two of his own rulings, and it decides
  what an uninvited member can INFER about the group's private structure.
provisional: as shipped by REC-20 — the fact of incompleteness only (DEC-16's
  honesty), never any identifying detail or count (D-15's fence). The member learns
  "your item participates in something not visible to you" and nothing else.
alternative: full D-15 silence — the ancestor set simply omits invisible cases and
  reports `determined`, indistinguishable from a complete set.
recommendation: keep the shipped behaviour. The existence bit leaks structure only in
  the aggregate and only to members already invited to SOMETHING touching the item;
  full silence resurrects DEC-16's named failure (a truncated set reading as a
  complete one) on the exact surface members open by habit. If Bob rules the other
  way, reversal is one predicate and migrates nothing.
reversal cost: one predicate, no migration, no stored state either way.
response: **ADOPTED — keep the shipped behaviour.** Bob, 2026-08-04: *"Let's go with
  CONDUCT's recommendation."* The member learns that their item participates in
  something not visible to them, and nothing else — no id, no title, no state, no
  count. D-15's fence yields exactly one bit, and only to members already invited to
  something touching the item; full silence would resurrect DEC-16's named failure (a
  truncated set indistinguishable from a complete one) on the surface members open by
  habit. The two rulings are reconciled by scope rather than by one overriding the
  other: D-15 governs IDENTITY and DETAIL (absolute), DEC-16 governs COMPLETENESS
  (the fact that something is missing is stated, never the thing itself).
decided: 2026-08-04 · Bob
reasoning recorded in: this entry; the contract behaviour REC-20 shipped stands
  unchanged, so nothing migrates.
for CONDUCT to enact: no code change — record the ruling against REC-20's
  `out_of_view` behaviour so a later session does not read it as an unresolved
  tension and "fix" it toward silence. Add the scope reconciliation above to
  `BIO_Interaction_Constructs_v0_1.md`'s QUEUE section beside DEC-16's doctrine.
enacted: 2026-08-04 · CONDUCT — no code change (the shipped behaviour stands); the ruling recorded against REC-20's landed line and the identity-vs-completeness scope reconciliation added to BIO_Interaction_Constructs_v0_1.md's QUEUE section beside DEC-16's doctrine, so a later session cannot read the tension as unresolved. Reasoning in this entry and that section.

### DEC-37 · answered
raised: 2026-08-04 · CONDUCT (lifted from DIST-1's report)
for: bob
question: Is a scoped MONITOR_TOKEN worth opening a FOURTH token class in the plane's
  auth surface? Today every monitor tick and archive fallback on every installed
  instance authenticates as ADMIN_TOKEN — the root-of-trust credential — to do two
  narrow things (call op=monitor; drive the archive arm of op=acquire). Scoped, a
  leaked daemon credential would be a monitoring nuisance; today it is a total
  instance compromise. The cost is a doctrine-visible widening of the auth surface
  (classify() recognises exactly three tokens, and the class set is
  CAPABILITIES-adjacent ground that has been deliberately narrow).
why it is Bob's: the security posture of every deployed instance carries his name,
  and the three-token narrowness reads as doctrine.
provisional: the ADMIN_TOKEN fallback continues (it is the shipped behaviour and
  nothing blocks); REC-33 holds the worked one-change recipe, blocked on this entry.
  DIST-1 already established the installer must NOT bind a token the plane cannot
  classify — an armed alarm firing 401s forever is worse than the fallback.
alternative: run monitoring on ADMIN_TOKEN indefinitely, accepting root-of-trust
  exposure on a standing unattended path as the price of a minimal auth surface.
recommendation: mint the class. The unattended daemon path is exactly where a
  credential lives longest and travels furthest (it is bound into every installed
  instance's config), and least-privilege there buys real containment for one small,
  well-understood widening. REC-33's recipe keeps ADMIN_TOKEN as a fallback so no
  existing instance breaks.
reversal cost: low before instances carry the token; after, removing the class
  re-inerts monitoring on updated instances until a second update rebinds.
response: **MINT IT.** Bob, 2026-08-04: *"Sounds like we need a daemon token."*
  **AND HIS NAMING IS ADOPTED OVER THE ENTRY'S — `DAEMON_TOKEN`, not
  `MONITOR_TOKEN`**, and it is not cosmetic: the credential drives the archive arm of
  `op=acquire` as well as `op=monitor`, so naming it for one of its two consumers
  would have invited the next unattended consumer to either mis-scope itself under a
  monitor name or mint a FIFTH class. The class is the UNATTENDED PATH, not the
  monitor. Scope it to exactly the two verbs it needs today and widen by decision, not
  by drift.
  The reasoning that carries it: this credential is bound into every installed
  instance's configuration and sits there unattended indefinitely — the place a
  credential lives longest and travels furthest. Today a leak there is total instance
  compromise; scoped, it is a monitoring nuisance. That containment is worth one
  well-understood widening of an auth surface that is otherwise deliberately narrow.
  ADMIN_TOKEN stays as a FALLBACK so no installed instance breaks (REC-33's recipe),
  and DIST-1's constraint is binding: the installer must never bind a token the plane
  cannot classify — an armed alarm firing 401s forever is worse than the fallback, so
  the plane learns the class BEFORE any installer binds it.
decided: 2026-08-04 · Bob
reasoning recorded in: this entry and REC-33's scope.
for CONDUCT to enact: unblock REC-33; rename its `MONITOR_TOKEN` to `DAEMON_TOKEN`
  throughout, with the two-consumer reasoning above recorded at `classify()` so the
  next unattended consumer knows the class is the PATH and not the verb; sequence the
  plane's recognition of the class BEFORE the installer binds it (DIST-1).
enacted: 2026-08-04 · CONDUCT — REC-33 unblocked and renamed to Bob's DAEMON_TOKEN (the class is the unattended path; scoped to its two verbs, widened by decision), ADMIN_TOKEN fallback kept, DIST-1's never-bind-an-unclassifiable-token constraint carried as binding; the installer half stays a follow-on DIST item behind REC-33's landing. Reasoning in this entry and REC-33's scope.

### DEC-39 · open
raised: 2026-08-04 · CONDUCT (lifted from REC-38's report)
for: bob
question: The co-attestation honesty fence — "a co-attestation raises Grade B toward
  evidentiary weight; it never reaches Grade A" — is member-facing wording that is a
  CLAIM ABOUT WHAT THE RECORD ASSERTS, and it currently lives only in the surface's
  own sentence. Should the plane publish fence wording for the attest act (the
  DEC-29(b) prompt treatment — the sentence travels WITH the control), and if so,
  what does it say?
why it is Bob's: the sentence states what an attestation is worth, which is grade
  doctrine — the R2/DEC-4 neighbourhood — and a wrong sentence here overclaims or
  underclaims on every capture a member co-attests.
provisional: the surface keeps its current sentence (unchanged since UI-2's era);
  the plane publishes the attest LABEL (REC-38) and no fence wording; UI-24's rider
  renders the published label and deliberately does NOT invent fence wording.
alternative: let the surface keep authoring it indefinitely — rejected as the
  provisional's end-state because it is the last member-facing claim about the
  record's semantics that the record does not own.
recommendation: publish it via the prompt mechanism REC-16 built (one act publishes
  a prompt today; the machinery exists), with wording Bob confirms — the current
  surface sentence is a reasonable draft but it is a doctrine statement and should
  be his.
reversal cost: nil before publication; after, the usual wording-migration (the
  drift guard names it).
### DEC-40 · open
raised: 2026-08-04 · CONDUCT (lifted from UI-18's report)
for: bob
question: The published-case THRESHOLD STANCES — the named set a reader picks from,
  each resolving to a pair of independent floors (Q6's settled form). Q6 settled the
  FORM, not the SET, and a published stance name is a thing readers will quote back
  at us. What is the set, what are its labels, what are its floor pairs?
why it is Bob's: published member- and public-facing wording that encodes floor
  VALUES — how strong a case must be for a given use — which is doctrine wearing a
  menu.
provisional: UI-18's four doing-labelled stances (AUDIENCES §0 forbids who-labels):
  Reading the whole case (none/none) · Citing this in a filing (A/A) · Checking this
  against records you already hold (none/B) · Quoting this in something you publish
  (B/none). The labels are a doctrine consequence; the floor values are a worker's
  judgement; both are one edit to change.
alternative: ship no named stances — only the raw pair-of-floors control. Rejected
  as the provisional because Q6's own reasoning says the reader picks a STANCE.
recommendation: confirm or amend the four; the floor values are the part most worth
  his eye (A/A for a filing may be right or may be unreachable in practice).
reversal cost: one edit while unpublicised; after real readers quote a stance name,
  renames are noisy.

### DEC-41 · open
raised: 2026-08-04 · CONDUCT (lifted from UI-18's report)
for: bob
question: DEC-34 says the published case is "reduced also to PDF renderings". The
  browser-side rendering now exists with the per-page header enforced, and
  print-to-PDF from it produces a compliant document — but NOTHING produces a
  server-side PDF that joins the container's parts[] (the manifest's layout.note
  reserves the join; the plane's suite asserts no page-shaped artifact is produced
  there). Does the CONTAINER need to carry a rendering, or does the browser path
  satisfy the ruling?
why it is Bob's: it is his artifact-form ruling's scope — what a downloaded
  container IS — and a server-side PDF renderer in workerd is a real build (the
  CPDF-12 renderer neighbourhood) his call should precede.
provisional: the container ships without a rendering; the browser rendering carries
  the header rule; the layout.note keeps the join reserved so the shape does not
  change under readers if the answer is yes.
alternative: build the server-side renderer (likely a fleet member) so every
  container carries its PDF — cost is the renderer CPDF-12's measurement would
  partially price.
recommendation: the browser path likely satisfies the ruling's INTENT (a reader can
  produce a compliant PDF from the artifact), but "the container carries its own
  rendering" is a stronger claim about a forwarded file — genuinely his to weigh.
reversal cost: none while the join stays reserved.

### DEC-42 · answered
raised: 2026-08-04 · session BOB (from CPDF-11's NO-GO and a re-reading of CPDF-9)
for: bob
question: Does an instance REQUIRE the group's own Workers Paid plan ($5/month)? This
  reverses the standing ruling *"Workers Paid is an optimisation, never a requirement"*
  (`CAPTURE-SCALING.md`), which was made to protect the sovereign installer's promise
  that a community organisation can run its own record without expensing a subscription.
why it is Bob's: it changes what every future group must PAY to run an instance —
  effects on people outside the project, and the sovereignty promise carries his name.
provisional: nothing was blocked; Free remained the requirement while the question stood.
alternative: hold Free as the requirement and pay for it in engineering — build the page
  renderer, prove Moondream's composed shape at n>>1, and accept a generative engine
  capped at C with no per-region confidence; or fund an external OCR service and put a
  second vendor account, a card and a third-party name in every group's install and in
  every transcription's provenance chain.
recommendation: REQUIRE Paid. The measurements had made Free the more expensive choice in
  every currency except the $5.
response: **ACCEPTED — Paid becomes a requirement.** Bob, 2026-08-04, and the reasoning
  is his inventory rather than the OCR result: *"I would certainly like a new instance to
  be free, but let's take inventory of what's already needed before this decision"* — a
  Cloudflare account, a card on the account, R2 within the free realm but with real
  charges beyond it. *"So now we're saying a new instance needs all that AND a $5/month
  charge. Okay, that's the reality."*
  **THE RULING RESTS ON A MEASURED INVENTORY, NOT ON WANTING THE FEATURE**, and that is
  why it is not a reversal of the sovereignty doctrine but a correction of a premise it
  rested on. The original ruling protected a group that could install with NO financial
  relationship to Cloudflare. That group does not exist: an instance already needs an
  account and a payment method, and R2 already bills beyond its free allowance as the
  record grows. The honest description of the change is **$0/month plus a card becomes
  $5/month plus a card** — not free becomes paid.
  ONE CORRECTION TO THE INVENTORY, measured this turn rather than accepted: **a registered
  domain is NOT required.** `newgroup/src/index.mjs:324` (`ensureSubdomain`) provisions a
  `workers.dev` prefix on a fresh account and deploys to `<slug>.<sub>.workers.dev`. A
  custom domain is an option a group may take, never a prerequisite. The prerequisite list
  is therefore: a Cloudflare account · a payment method · Workers Paid · R2 (free tier,
  billed past it). Workers Paid is also independent of the zone plan — it is NOT unlocked
  by Cloudflare Pro and does not require it (`CLIENT-RENDERED.md`).
what the $5 actually buys, and it is why this was the cheap answer:
  - **CPU per invocation 10 ms → 30 s default, 5 min maximum.** This is the line that was
    blocking the best engine on the table. CPDF-9 measured tesseract at **99.96% character
    accuracy, 90/90 digits, ZERO minted** — it IS the floor every other candidate is scored
    against — and a dedicated fleet member FITS (0.72 MB gzip with the model read from R2).
    It was never blocked on size; it was blocked on the ~17–54M reference-iterations per
    page against a Free kill window of ~40–42M. **My previous report to Bob said WASM OCR
    was ruled out on bundle size. That was wrong** — it was true only of the two placements
    DEC-35 named (in-plane, and inside the existing pdf-worker), and the measurement
    plainly records that a third dedicated member fits. Corrected here rather than quietly.
  - Worker size 3 MB → 10 MB · external subrequests 50 → 10,000 · requests 100k/day → no
    daily cap · cron triggers 5 → 250 · Browser Run 10 min/day → 10 hr/month.
  - At realistic instance scale the $5 is FLAT: a group capturing ~500 documents/month with
    ~14% scanned is ~70 OCR pages ≈ 105,000 CPU-ms against 30,000,000 included — 0.35%.
    Ten times that volume is ~3.5%. Nothing realistic approaches the included allowances.
  - And it is a CLASSIC engine, so it supplies the per-word confidence and coordinates
    DEC-35 named as constraints and Moondream failed — the anchor that CPDF-11 measured as
    FAIL (2 of 24 box-checks; a confident box for a figure not on the page).
decided: 2026-08-04 · Bob
reasoning recorded in: this entry; `CAPTURE-SCALING.md` (the superseded ruling, corrected
  in place with its original reasoning kept); `CLIENT-RENDERED.md`; DEBT D-54 and D-185.
for CONDUCT to enact: (1) **D-54 changes character** — the installer no longer merely
  DETECTS the plan, it REQUIRES Paid, verifies it, and refuses to complete honestly rather
  than installing something quietly degraded (the D-106 class this protects against).
  (2) **CPDF-12 is re-scoped again**: the renderer/composed-shape probes are no longer the
  in-account route's only hope — measure the TESSERACT FLEET MEMBER first (a deployed wasm
  CPU probe walked in reference iterations under Paid, per CPDF-9's own "authoritative
  Worker CPU needs a deployed wasm probe" caveat), and note that for the image-only class
  a page is typically ONE embedded image, so image EXTRACTION may serve where rasterising
  was assumed — verify across the corpus before building a renderer. (3) **CPDF-10's
  placement is now in-account tesseract**, pending that probe; the external tier stays
  unfunded. (4) Correct every document carrying the superseded ruling — done in this
  session's commit for `CAPTURE-SCALING.md`, `CLIENT-RENDERED.md`, `kickoffs/CAPTURE.md`,
  `DEBT.md` and `MILESTONES.md`; `CIVICOS_UI_STATE.md`'s entry is dated history and is
  deliberately NOT rewritten. (5) The free-tier-rot warning in `CAPTURE-SCALING.md` INVERTS
  and must not be lost — see D-185.
enacted:

### DEC-43 · open
raised: 2026-08-04 · CONDUCT (lifted from REC-33's report)
for: bob
question: When does `#monitorToken()`'s ADMIN_TOKEN fallback retire, and what tells us
  it is safe to? The fallback is what stops installed instances breaking when the
  plane learns the daemon class before any installer binds it (DEC-37's own
  sequencing). It is also a silent, permanent licence for root-of-trust monitoring:
  an instance that never binds DAEMON_TOKEN keeps spending ADMIN_TOKEN forever and
  NOTHING reports it except an operator reading op=selftest.
why it is Bob's: it decides whether DEC-37's containment is real in the field or
  advisory. The fleet-visibility half is D-116's version-authority problem wearing a
  credential, and the posture is his.
provisional: the fallback stays (nothing breaks, containment is opt-in per instance).
alternative: (a) sunset it when DIST-2 lands and instances have had one update cycle;
  (b) keep it but make the fleet visible — a report of which instances still run on
  the fallback, so the gap is a number rather than a hope; (c) leave it indefinitely
  and accept the ruling is advisory in the field.
recommendation: (b) then (a) — measure who is still on the fallback before removing
  it, because removing it blind re-inerts monitoring on any instance that missed the
  update, which is the failure DIST-1's constraint exists to prevent, arriving from
  the other side.
reversal cost: low either way while the fallback stands; high if it is removed before
  the fleet is visible.

## Answered, awaiting enactment

_(none)_

## Enacted

_(none — entries move here with their commit and the document carrying the reasoning)_
