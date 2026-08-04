# How do you know you have found enough?

Research, 2026-08-04 (session BOB), at Bob's direction:

> *"Given the information sparsity at every level, how does the search process determine
> whether the thing being searched for (in a reasonable level of correctness and
> completeness) has been discovered?"*

Five research strands: legal eDiscovery and technology-assisted review; newsroom sourcing
standards; documented post-mortems of verification failures; open-source investigation
methodology; and the disciplines that cannot know their denominator. Every external claim
is attributed; vendor claims, court holdings, peer-reviewed work and folklore are labelled
as such throughout the underlying reports.

## THE ANSWER, and it is not the one the question expects

**No field has a completeness threshold. Every serious one substitutes something else,
and they substitute the SAME thing: a defensible PROCESS, disclosed, whose residual error
is small relative to what further searching would cost.**

The most formal answer available is the legal one, and it is explicit that it does not
solve the problem:

- **Cormack & Grossman**, who invented modern TAR, in their most-cited engineering paper:
  *"it remains an open question how best to decide when to terminate the TAR process…
  Methods for achieving a reliable, efficient, quantitative estimate remain elusive."*
- **The Berkeley Protocol** — the only formal published standard for open-source
  investigation, UN OHCHR plus UC Berkeley, 150+ expert consultations — contains **no
  confidence scale and no numeric corroboration rule anywhere in 102 pages.** It requires
  veracity be established *"with sufficient accuracy"* and leaves *sufficient* undefined,
  deferring to the downstream tribunal's standard of proof.
- **The Verification Handbook** refuses a threshold in writing: *"this handbook won't
  present journalists… with one-size-fits-all simple steps to verification."*
- **Federal Rule of Civil Procedure 26(g)(1)(B)** requires only that a response be formed
  *"after a reasonable inquiry"* — **a standard of CONDUCT, not a standard of RESULT.**

**And the field's own numbers explain why.** Recall sample size scales as 1/prevalence:
estimating recall to ±5% at 95% confidence needs roughly 385 RELEVANT documents in the
sample, so at 1% prevalence that is ~38,500 documents reviewed to produce one number.
TREC Legal Track published confidence intervals up to **52 points wide** — a "77.8%
recall" statistically indistinguishable from 48% or from 100%.

## Six measured facts that kill the obvious approaches

1. **There is no gold standard to measure against.** The eDiscovery Institute's Verizon
   study blind re-reviewed 5,000 documents from a 1.8M-document production: two expert
   teams agreed with the original review 75.6% and 72.0% of the time, and **with each
   other 70.3%**. Of documents the original review called responsive, Team A found 48.8%
   and Team B 53.9%. Grossman and Cormack's own conclusion: *"The notion that there is a
   'ground truth' for the relevance for every document in a TAR review is **illusory**."*
2. **Practitioners' confidence in their own recall is worthless.** Blair & Maron (1985),
   the study that founded the field: attorneys stipulated they must retrieve at least 75%
   of relevant documents and believed they had. Measured recall was **~20%** — and they
   had iterated and refined, so this is not a straw-man of naive keyword search.
3. **The industry's standard validation method is refuted by the people who invented
   TAR.** Elusion testing samples the discarded set to estimate what was missed. The
   Grossman-Cormack Glossary's own worked example: a search returning 1,000 documents of
   which **none** are relevant scores **1.001% elusion** — near-perfect by that metric, at
   zero recall. In live Irish litigation (O'Halloran, Grossman, Cormack et al., 2024) the
   elusion test **overstated recall by 16 to 36 points** across five request-sets; the
   authors *"urge that its use be discontinued in legal practice."* Four reasons: low
   prevalence yields no positives so it predicts near-perfect recall; high prevalence
   swamps it; the original reviewers know these documents are *supposed* to be
   non-responsive; and **"one can easily receive full marks when assessing one's own
   work."**
4. **Re-testing until you pass is statistically invalid, and it is what everyone does.**
   *"All RPET approaches suffer from sequential bias induced by multiple testing: the
   process is more likely to stop when sampling fluctuation gives an over-optimistic
   estimate of effectiveness."* Run a validation, fail, train more, re-sample, pass — the
   pass is an artifact of the retries.
5. **"No new results" does not mean "nothing left."** The TREC 2016 knee-method failure:
   the stopping rule *"had missed entirely an expansive 'mail-in' campaign consisting of
   thousands of essentially identical messages."* **A gain curve cannot distinguish *no
   more relevant documents* from *no more relevant documents that look like what I have
   been finding*.** A supervised classifier with no relevant examples of a facet in its
   training set scores F1 ≈ 0.00 on that facet — a blind spot by construction.
6. **The denominator itself can be wrong by two orders of magnitude.** TREC 2009 Legal
   Track topic 51: training judgments estimated **95** relevant documents; new judgments
   estimated **26,404** — a 278× move, and *"most of the contribution… came from just 3
   documents"* sitting in under-sampled strata carrying weights of ~8,000 each.

**And Goodhart's law is invoked by name in the literature**: *"the focus on achieving
'high recall and high precision' has encouraged gaming of metrics performed to validate a
production effort."* A completeness number is a target, and a target gets optimised.

## What the fields substitute instead — five mechanisms, and BIO already has four

| Substitute | Where it comes from | BIO's equivalent |
| --- | --- | --- |
| **Reasonable inquiry, certified** — a standard of conduct, signed | Rule 26(g)(1)(B) | **the completeness statement** (authored, per edition, byte-checked) |
| **Proportionality** — enough is relative to the stakes, not absolute | Rule 26(b)(1)'s six factors; Sedona | **DEC-17's project-declared `required_strength`**, a PAIR, set before the work |
| **Burden on the challenger** — a doubter must show inadequacy with evidence, not speculation | Sedona Principle 7; *Hubbard*: *"speculation that there is more will not suffice"* | **the published case + answer-by-hash**: a reader can check, and a challenge must point at something |
| **Auditability instead of truth** — document the process so someone else can catch the error later | Berkeley Protocol, Bellingcat, ICIJ, all four newsrooms | **provenance chains, append-only history, `cuts_against` legs** |
| **Adversarial steps and a veto held OUTSIDE the work** | Columbia on Rolling Stone; Thornburgh-Boccardi on CBS; BBC's mandatory referral | **DEC-13's subject position; the publication ceremony** — the one BIO has only in part |

**The gap is the fourth column's one blank: BIO's completeness statement is PROSE.** It
asserts what a case does not cover, and it carries `excluded` rows for things deliberately
left out. **It records nothing about what was SEARCHED.** So it is a claim of the exact
kind the literature says is worthless — Blair & Maron's attorneys made that claim
sincerely at 20% recall.

## The convergence: the observation log is what makes a completeness claim defensible

**This is the load-bearing finding of the whole day's work, because two separate design
threads meet here.**

`STORE-AS-CACHE.md` argues for an **observation log** — an append-only record of every
LOOK, including the ones that returned nothing — kept separate from the write-once record,
because *archives record absence and caches retry it away*. It was argued there on
provenance grounds.

It is also, exactly, **the disclosed-process half of a defensible completeness claim.**
A completeness statement backed by an observation log can say what no prose assertion can:

> *We searched these sources, at these levels, on these dates, on these leads, and this is
> what came back — including the empty results.*

That is Rule 26(g)'s reasonable inquiry, made checkable. **The two designs are one
design**, and neither is worth much alone: an observation log nobody publishes is
bookkeeping, and a completeness statement with nothing behind it is Blair & Maron.

## What BIO can do that none of these fields can

Three of them, and each falls out of properties BIO already has:

1. **TEST SOURCE INDEPENDENCE — the failure that defeats everyone else.** Circular
   reporting is named as a hazard by the Berkeley Protocol with *no test supplied*;
   triangulation failed in the Verification Handbook's own lead case study (fourteen
   honest eyewitnesses, all wrong the same way); the NYT's Iraq coverage had two
   institutional categories of source fed by one pipeline. **BIO's provenance is
   content-addressed and records origin, so shared upstream origin between two branches is
   DERIVABLE.** No newsroom can compute this. Recorded as D-195; it is the missing check
   under DEC-32's OR-max arithmetic.
2. **NAME THE LEVEL OF AN ABSENCE.** Every field above conflates *we found nothing* with
   *there is nothing*. BIO's four levels make the distinction expressible: no meaning
   derived, nothing extracted, no document held, or not on the internet — four different
   claims with four different next moves.
3. **GIVE AN ABSENCE ITS AUTHORITY.** RFC 2308's rule — *a negative answer with no proof
   of authority is not recordable* — has a BIO analogue that no other field has:
   **a member's authored lead** (D-194). *"We went looking for the contract this tip
   described and there is none"* is a finding with a name behind it; the same empty result
   with no lead behind it cost nothing to produce.

## Recommendation

**Do not build a completeness metric. Build a completeness RECORD.** Specifically:

1. **Never report a recall-like number.** The denominator is unknowable at BIO's
   prevalence, the literature's own confidence intervals are 40–60 points wide at low
   richness, and Goodhart applies the moment a number becomes the target.
2. **Never adopt elusion testing** as validation. Its inventors have asked the profession
   to stop, and its failure mode — assessing one's own work — is exactly the
   costs-nothing-to-produce class BIO already refuses.
3. **The completeness statement gains a SEARCH RECORD**, drawn from the observation log:
   which levels were searched, on which leads, with which outcomes, including the empty
   ones. Authored prose stays; it is now backed rather than freestanding.
4. **Proportionality is already built — use it.** DEC-17's declared `required_strength` is
   the project's own statement of how good is good enough, authored before the work, and
   *"you can lower your own bar, you cannot do it quietly."* That is the field's answer
   (enough is relative to stakes) with better accountability than the courts get.
5. **Adopt the adversarial steps the post-mortems recommend rather than a count.** In four
   of five documented failures the written sourcing rules were formally SATISFIED — the
   rules that held were countable (source counts, review existed, contact attempted) and
   the failures were uncountable (independence, adversarial contact, chain of custody,
   non-denial read as confirmation). Both rigorous inquiries recommended **veto authority
   and mandatory adversarial steps**, not higher counts.
6. **If a validation sample is ever built, copy *In re Broiler Chickens***: partition into
   produced / human-excluded / machine-excluded, sample all three, combine into ONE BLIND
   sample with no indication of origin, and have it assessed by someone who did not do the
   original work. And carry its own caveat: *"the absolute number in its own right shall
   not be dispositive."*

**One boundary worth stating loudly.** The *Broiler Chickens* protocol says: *"This
Validation Protocol assumes that the completeness or adequacy of the Collection has
already been established."* **Every recall number in the entire eDiscovery literature is
conditioned on the corpus being right.** BIO's problem is the one that assumption sets
aside — and the literature offers almost nothing on it. That is why the four-level model
and the authored frontier are not refinements; they are the actual problem.

## How this research decided it was comprehensive — Bob's second question

Asked deliberately, and it is the same question one level up. What I actually used:

- **Domain coverage** — I sought fields that face the problem under *different* pressures:
  legal (adversarial, with a tribunal), journalism (adversarial, no tribunal), human-rights
  OSINT (formal, deferred threshold), and the statistical disciplines. The reasoning was
  that a convergence across incentive structures is worth more than depth in one.
- **Saturation** — later strands began returning the same substitutes (process,
  disclosure, proportionality, auditability) in new vocabulary. That is weak evidence and
  I am treating it as weak: it is exactly the *"no more results that look like what I have
  been finding"* failure, one level up.
- **Adversarial check** — I looked specifically for the strongest refutation of my own
  framing, which is how the elusion critique surfaced. It came from the inventors of the
  method I would otherwise have recommended.
- **Naming the gaps** — capture-recapture estimation was commissioned and had not returned
  when this was written; ICIJ publishes no consolidated methodology; no field supplied a
  documented case of its own standard being correctly followed and still failing.

**And the honest part: I have no denominator either.** I cannot know what I failed to
search for, my strands were not independent (I wrote all five prompts, so they share my
framing — the correlated-source failure, applied to me), and "saturation" across sources I
selected is precisely the blind spot the TREC mail-in-campaign failure describes.

So this document does what it recommends: it states its frame rather than claiming its
coverage. **That recursion is not a rhetorical flourish — it is the finding.** A search
process cannot certify its own completeness, at any altitude, and the honest output is a
disclosed process plus a stated frame that someone else can attack.
