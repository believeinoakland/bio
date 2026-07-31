# Authority, delegated trust, and who answers the question

Written 2026-07-30. Records rulings Bob made during the CAPTURE session of that
date. Sections marked RULED are his and are not to be re-litigated. Nothing here
is BUILT yet; this is the design the next sessions implement.

## The problem this replaces

`capture.authority` holds exactly one value, and today it is not determined by
anything. `op=acquire` requires `body.authority` as a non-empty string and files
it verbatim. Nothing derives it, checks it, or records how it was reached. So
the authority machinery below is not a refinement of something that exists. It
is new.

D-55 blocked all rendered capture on the grounds that a rendered document may
carry content from several parties while the field holds one value, and that
per-origin sub-document attribution does not exist. That framing is superseded.

## RULED: the renderer is immaterial. Authority follows the DATA.

Bob, 2026-07-30. Sometimes what is being rendered is GIS data, a CAD drawing, or
a paper posted to a hosting platform, and the rendering is genuinely executed by
third-party tools. **Which tool executed the rendering does not matter.** What
matters is whose data is being rendered and what claims are being made, by whom,
on the evidence presented in the rendering.

This kills the design that preceded it. An earlier proposal was to block
non-first-party origins during a render so that a rendered capture would have
exactly one author. That would have destroyed precisely the captures this project
most needs: a city parcel layer served through a mapping vendor's viewer, a CAD
drawing in a viewer, a document on a hosting platform. Blocking third-party
origins captures nothing in all three cases.

Two axes, and they had been collapsed into one:

- **Execution.** Whose code runs. A security question about what the plane is
  willing to execute. Answered by an allowlist built through consideration.
- **Authorship.** Whose data, and who is asserting what on it. The evidentiary
  question. The renderer's identity is irrelevant to it.

The operative rule: **follow the data, not the code.** A viewer origin that
fetched its payload from the hosting site is a tool rendering the host's data,
and the authority is the host. An origin that injected content it brought with it
is an author.

## RULED: authority is three-valued, and undetermined is a task

Bob, 2026-07-30. Where the determination can be made mechanically, authority is
assigned during capture. Where it cannot, authority is set to a value indicating
that the determination needs a human or an AI. A record of every capture so
labelled is kept and made visible, so that it is followed up and clarified.

This decouples D-55 from D-53's granularity wall, and that is why it works. "The
record has not established who authored this material" is a TRUTHFUL statement at
document granularity. It needs no finer structure to be honest. What blocked
rendered capture was never the missing granularity as such; it was that the
record would assert something false by crediting a city with a vendor's copy. A
capture that says it does not know asserts nothing false. When per-origin
attribution arrives it refines records that were never wrong.

It also lands on vocabulary that already exists and is already ratified:
`undetermined` is first-class throughout the verdict machinery and must be STATED
rather than omitted.

On the capture, mirroring `verdict` / `verdict_basis` / `verdict_at` rather than
inventing a shape:

- `authority` — the determination, when one was made
- `authority_state` — `determined` | `undetermined`
- `authority_basis` — how it was reached, or why it could not be. Dated. Recorded
  in BOTH cases, because "we established this mechanically" is as much a fact as
  "we could not."

### RULED: an authority-undetermined capture cannot be PUBLISHED

Bob, 2026-07-30. The ratification fence already stops it reaching `verified`, so
evidentiary use is covered. Publication is a separate act and a separate fence:
the published bucket is the group speaking in public, and it must not publish
material it cannot attribute.

Implemented as a gate check in `bio-checks` rather than only as a write-path
refusal, so the condition is reportable on a corpus handed in from elsewhere.
That is the D-50 lesson: the write path prevents the damage, the catalog makes it
conformance-checkable.

## RULED: transitive trust is accepted, with disclosure and adjustment

Bob, 2026-07-30. The **no transitive trust** rule in
`BIO_Technical_Architecture_Decisions_v10` is revised. Transitive trust is
accepted so long as it is disclosed in the provenance chain and the grade,
confidence and other properties are adjusted accordingly.

Bob's supporting observation: archive.org is performing a role quite similar to
ours. They capture documents from other sites, without the hosting site
requesting the service, and make them publicly available, searchable and
retrievable.

What this needs:

- **`provenance_chain`**, an ordered array of hops from us back to the origin.
  Each hop names who, what they assert, the evidence, and whether the assertion
  is cryptographically bound or merely stated.
- **Grade becomes a function of the chain**, not of the method. A direct fetch is
  one hop. An archive-sourced capture is two, with the weaker hop unsigned, and
  grades below a direct capture of the same document.

  This is consistent with the client-rendered ruling rather than in tension with
  it. There, a render takes the SAME grade because the chain is the same length
  and the execution was first-party. Here the chain is genuinely longer. Grade
  tracks directness, never technique.
- **Confidence is recorded per hop**, not as one number, so the reason stays
  legible.

**The boundary to hold: what is inherited is the FACT OF PUBLICATION, never the
CREDIBILITY OF THE CONTENT.** An archive attests that a server sent these bytes
at this instant. It attests nothing about whether the figures in them are right.
Keeping those apart is what stops the web of trust becoming a shared reputation
score, which `BIO_Design_Requirements_v2` section 4 rules out.

This gives D-53 its first worked example.

## RULED: undetermined authority goes to a todo list, like an inbox

Bob, 2026-07-30. Capture daemons run outside the context of a member, but they
act on interests established by one or more members. The task of determining a
document's authority is assigned to the **project manager**, and where a project
has no manager, to a **group admin**. The assignee may forward it to another
member they judge best able to attest to the authority.

Every user has a todo list that behaves like an email inbox. Bob has noted that
the transport and UI surface might later BE email.

That parenthesis is load-bearing. If the transport may become email, then:

- **Field bounds are enforced at WRITE time, not at render time.** An
  authority-determination task carries strings lifted from a captured page,
  including whatever publisher name the site claims for itself. Today the
  gathering queue's defence is that the exporter renders those fields as quoted
  data so a litterer cannot steer a member's session. Email leaves that
  discipline entirely: it renders in a client we do not control, in a surface
  where a plausible-looking instruction is what phishing looks like.
- The task record is **transport-agnostic** and assumes no rendering surface.

Build it as a `tasks` table modelled on the gathering queue rather than invented
fresh, reusing C-18.5's grammar bounds and the quoted-data exporter. The F5
threat shape is identical.

`member_expertise` is append-only with a confirmation state, a confirmer and a
withdrawal per entry, which is exactly what routing a question to the
best-placed member needs. What is missing is the queue and the telling. **D-52
records that BIO has no notification channel at all**, which is the same gap seen
from a second direction.

## RULED: an alternative source counts as a re-fetch, for MONITORING

Bob, 2026-07-30. If a direct re-fetch fails for some number of attempts or over
some period, a fetch to an alternative source such as archive.org counts as a
re-fetch **for monitoring purposes**.

This composes with the earlier ratification ruling rather than conflicting with
it. Ratification requires that the re-fetch attempt and its OUTCOME be recorded,
not that it succeed, so a 403 is already a valid recorded outcome and does not
block ratification. The archive fetch supplies the monitoring observation. Both
work.

Thresholds, CHOSEN and not measured, and labelled as ours: **three consecutive
direct failures, or fourteen days of failure, whichever comes first.**

Two consequences:

- **`captured_locators` needs a `via` column.** Without it the contemporaneity
  bracket arm compares archive bytes against live bytes as one observation
  stream and reports a change that is a provenance difference. Two sources
  agreeing is STRONGER evidence than one source repeating; two sources
  disagreeing is not evidence of change at all. The arm cannot tell those apart
  without knowing which is which.
- **"Unreachable" is not a property of a host.** It is a property of a host and
  an egress. Unreachable from Workers and unreachable from a member's browser
  are different facts, and only the second justifies falling back. The 2026-07-30
  user-agent measurement is the proof: the same host was simultaneously
  unreachable to the plane and reachable to three other clients.

## What D-55 becomes

Narrowed, not closed. Rendered capture is unblocked: a rendered document whose
authorship cannot be determined mechanically is captured with
`authority_state: undetermined`, held, followed up through the task list, and
barred from publication until resolved. What survives is the genuinely deferred
case, which is the day BIO wants to treat a third party's script output as
evidence in its own right. That still needs per-origin sub-document attribution
and still shares a wall with D-53.

## RULED 2026-07-31: what publication actually requires

Bob, 2026-07-31: "A capture can be published if there are no undetermined
authority links in the provenance. So recording that the capture was done
through IA is proper, even if the content authority is still undetermined."

That separates two things this project had been calling by one name.

**PROVENANCE AUTHORITY** is who served us the bytes at each hop. We always know
our own leg, and an archive hop names the archive. This is what a published hash
attests: these bytes, this address, this date, this route.

**CONTENT AUTHORITY** is who ISSUED the document. Frequently unknown, and
legitimately so.

The publication fence sits on the FIRST. C-18.9 previously refused publication
whenever the content authority was undetermined, and that was wrong for the
project's own reason: a hard refusal on a missing attribution pressures whoever
wants to publish into INVENTING one, which is exactly the false assertion the
three-valued ruling exists to prevent. D-97 removed that pressure at the intake
gate. Leaving it at the publication gate moved it rather than removing it, and
arguably made it worse, because by then a member has done the work and wants it
out.

So, as of catalog 1.18.0 and plane 0.55.0, a bundle at or past verified is
refused when:

1. a captured document carries NO provenance chain, because a published hash
   claims a route and that document names none;
2. any hop in the chain names no attestor, because an unattributed hop cannot
   support the only claim publication makes;
3. the content authority is undetermined AND SILENT, with no dated basis.

Content-undetermined material with a dated basis MAY be published. Publishing
"we do not know who issued this, and here is when we recorded that" is honest.
Publishing it with the question quietly absent is not, and that is the line.

Two things this does NOT change. Ratification is still a member's signed act, so
nothing publishes itself; this decides what a member is allowed to sign for. And
an undetermined capture still raises a D-98 inbox task at the moment of capture,
so the question still reaches a person — it simply no longer blocks the record
from saying what it honestly holds while the question is open.
