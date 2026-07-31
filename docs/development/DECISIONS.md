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
enacted:

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
enacted:

## Answered, awaiting enactment

_(none)_

## Enacted

_(none — entries move here with their commit and the document carrying the reasoning)_
