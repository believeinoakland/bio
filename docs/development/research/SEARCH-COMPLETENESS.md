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

## The measured result that answers Bob's question most directly

**TREC 2011 required each participating team to estimate its OWN recall, then scored the
estimate against the gold standard. It is the closest thing in the literature to a
controlled test of search self-assessment, and it failed badly.** The coordinators:

> *"The results are not encouraging. Most runs for most topics dramatically overestimated
> recall at all cutoff levels. Such an overestimate might lead the manager of a review
> effort to **terminate the review prematurely, due to the false belief that a high level
> of recall had been achieved**."*

Individual errors ran to **+95 points** (estimated 100% recall, actual 5%) and **−87
points**, in both directions, routinely exceeding 50. And the coordinators stated the
measurement ceiling outright: *"it is unclear whether improvements in recall measures
above 70% are meaningful, given the inherent uncertainties arising from sampling and human
assessment of responsiveness."*

**So the specific thing Bob's question asks about — a searcher deciding it has found
enough — is the thing measured to fail.** Not the tools; the judgment.

Three further measurements make the ground under any completeness number visible:

- **The gold standard is ~24% wrong.** When TREC 2010 escalated *unappealed* first-pass
  assessments to blind adjudication, **23.5% were overturned** — assessments nobody had
  challenged. Every published confidence interval is computed against that.
- **Correcting the gold standard alone moved best-run recall from under 20% to about
  80%** on TREC 2009 — same systems, same documents, only the reference changed.
- **Reading everything scores 57%.** An exhaustive expert manual review of an entire
  collection measured **0.57 recall** when scored by an independent assessor (TREC 4). And
  a single person re-reviewing their own work blind two years later agrees with themselves
  at Jaccard **80.6% / 60.2% / 64.2%**.

## THE FINDING THAT VALIDATES THE THREE-AXIS MODEL FROM OUTSIDE

**A loss at an earlier level caps everything downstream, invisibly, while the completeness
number computed at the later level still looks fine.** Two independent measurements, from
two different levels, both from the eDiscovery record:

- **ACQUISITION level — *In re Biomet*.** From the producing party's own sworn affidavit:
  a 19.5M collection was keyword-filtered to 3.9M before review began. Sampling estimated
  ~370,000 responsive in the full collection and **~148,000 in the DISCARDED set** — so
  roughly **40% of responsive documents were gone before review started, capping
  achievable recall at ~60% no matter how good the subsequent review was.**
- **CONTENT/EXTRACTION level — TREC 2008.** The collection was OCR'd documents. Relevant
  documents that **no team could retrieve** had systematically worse OCR quality (mean
  scores 0.617/0.462/0.533) than those found by at least one team (0.868/0.730/0.857).
  Restricting to well-OCR'd documents raised the best team's recall from **0.624 to
  ~0.80**. **The recall estimates were partly measuring scan quality.**

**That is BIO's document axis and content axis, measured, in someone else's data.** A
document not acquired cannot be extracted; text not extracted cannot be connected; and a
completeness claim made at the meaning level is silently bounded by both — with nothing in
the number itself revealing it. **This is why a missing-information answer must name its
LEVEL, and why a completeness claim computed at one level and reported as if it covered
the whole is an overclaim by construction.**

The corollary is Grossman & Cormack's multiplication argument, which BIO should carry
explicitly: recall through a pipeline multiplies. *"If keyword culling were to achieve 70%
recall, the TAR tool were to achieve 80% recall, and manual review were to achieve 75%
recall, the recall of a review effort combining them in sequence would be 70%×80%×75% =
42%."* Scoring only the last stage is *"at best, an extreme case of moving the goalposts."*

## AGGREGATION GAMING — R2's forbidden composition, at a fourth altitude

**A global completeness figure hides a per-slice failure, and it has happened in
litigation.** In *Epic Games v. Apple*, plaintiffs showed that 2.2M of 3.8M produced
documents were versions of a single auto-generated email, and that **Apple could exceed
75% overall recall while achieving just 57% across everything else** — despite a protocol
that already excluded auto-generated sets over 2% of the total. The academic form is
Guha, Henderson & Zambrano's worked example: find 700 of 800 reports and 50 of 200 emails,
report **75% global recall** while email recall is 25%.

**BIO already refuses this shape at three altitudes** — R2 forbids composing the two
strength axes into one letter, DEC-32 forbids a finding taking anything but its weakest
necessary leg, and DEC-44 forbids a case deriving a single case-level strength. **This is
the same rule at a fourth: completeness must be per-finding and per-level, never composed
into one figure for a case.** A case-level completeness number would be the exact Apple
manoeuvre, available to us by accident rather than design.

## THE CEILING: perfect work measures at 70%

**The number that calibrates every expectation here.** Grossman & Cormack, in the law
review exchange that settled the question:

> *"**Even a perfect review, performed by an expert — with a recall of 100% — is unlikely
> to achieve a measured recall of higher than 70%**, if the final responsiveness
> assessment is made by a second, independent expert."*

The TREC coordinators concur — *"it is unclear whether improvements in recall measures
above 70% are meaningful"* — and Voorhees puts the general bound at *"65% precision at 65%
recall, since that is the level at which humans agree with one another."*

**A metric that cannot distinguish flawless work from 70% is useless as a target**, and
the same authors say why in terms this project already uses: *"when statistical outcomes
become goals, they are subject to Goodhart's Law: 'When a measure becomes a target, it
ceases to be a good measure.'… the statistical tail wagging the best-practices dog."*

**And the "75% standard" is folklore with a fully traced genealogy.** No court has ever
held that any percentage is the legal standard. Every number in the case law is
party-proposed (*Global Aerospace*), party-stipulated (*Domestic Airline*, *Lawson*), or
expressly non-dispositive (*Broiler Chickens*: *"the absolute number in its own right
shall not be dispositive… a recall estimate somewhat lower than this does not necessarily
indicate that a review is inadequate, nor does a recall in this range or higher
necessarily indicate that a review is adequate"*). The 75% originates as Blair & Maron's
searchers' own aspiration — which they missed by 55 points.

**A completeness figure is also meaningless without its UNIT.** The same JOLT reviews
scored **76.8%** at message level and **84.1%** at document level — seven points apart on
identical work. Grossman & Cormack: citing a recall value *"without specifying the set of
ESI over which their own recall is calculated… is an invalid comparison."* For BIO, whose
whole model is four levels and two units (documents and content), this is not a footnote:
**any completeness claim must name both its level and its unit or it says nothing.**

## VALIDATION IS OBLIGATORY, AND IT MUST BE END-TO-END

The strongest modern holding, *In re Diisocyanates* (Special Master James C. Francis IV,
2021), and it converts validation from good practice into a duty:

> *"**As applied to the complexities of TAR, the principle of reasonableness incorporates
> an obligation for the producing party to validate its search.**… **This requirement for
> validation applies to search terms just as it does to TAR.**"*

And it rejected a stopping threshold measured over the wrong stage: defendants proposed
70% recall computed only over the post-keyword set, which the Special Master held plainly
unreasonable because **70% at the culling stage × 70% at the review stage = 49%
end-to-end** — *"a defendant would claim a recall rate of 70% when, in fact, it had
produced less than half of the responsive documents."*

**That is a court holding behind the cross-level cap this document already derives from
the Biomet and OCR measurements**, and it is the rule BIO's four levels make unavoidable:
a completeness claim computed at the meaning level is bounded by extraction, which is
bounded by acquisition — and reporting the last stage alone is *"at best, an extreme case
of moving the goalposts."*

**What the certification actually certifies** — the 1983 Advisory Committee Note, and it
is the most load-bearing sentence in the whole legal apparatus:

> *"the signature certifies that the lawyer has made **a reasonable effort to assure that
> the client has provided all the information and documents available** to him that are
> responsive to the discovery demand."*

Reasonable **effort**, not achieved completeness — *"an objective standard"*, and
*"ultimately, what is reasonable is a matter for the court to decide on the totality of
the circumstances."*

**And the countervailing case, which is the one BIO should build against.** Owning the
method is not the end of it — *Victor Stanley v. Creative Pipe* (Grimm, C.M.J.):

> *"Selection of the appropriate search and information retrieval technique requires
> careful advance planning by persons qualified to design effective search methodology.
> The implementation of the methodology selected should be tested for quality assurance;
> and **the party selecting the methodology must be prepared to explain the rationale for
> the method chosen to the court, demonstrate that it is appropriate for the task, and
> show that it was properly implemented.**"*

The defendants lost precisely there: *"Defendants neither identified the keywords selected
nor the qualifications of the persons who selected them."* **That is D-196 stated as a
holding — the method is yours, but you must be able to show what you did, and an
unrecorded search cannot be shown.**

**One distinction worth carrying into the four-level model.** *Zervos* holds that a good
faith averment that items do not exist ordinarily resolves the question — but the court
applied a limit that maps exactly onto BIO's states: **good faith covers the search
actually performed; it does not excuse a search never attempted.** `LOOKED_ABSENT` is
defensible; `NEVER_LOOKED` presented as absence is not.

**The burden allocation is settled and BIO should copy it**: the producing party chooses
the method (Sedona Principle 6) and **must validate it**; the challenger must show a
**specific deficiency** to compel more — speculation does not suffice. *Winfield* is the
model of what that yields in practice: when a deficiency was shown, the court ordered
samples of the discarded set but held the *method* itself work product. **Transparency
into RESULTS, not into METHOD, and only on a documented deficiency.**

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

## THERE ARE EXACTLY THREE STRATEGIES, AND ONLY ONE IS HONEST ABOUT THE DENOMINATOR

The final strand — capture-recapture, systematic-review saturation, optimal stopping and
active-learning stopping criteria — resolves the whole question into three families:

1. **ESTIMATE the denominator** — capture-recapture (Lincoln-Petersen, Chapman), Chao's
   estimator inside TAR, thematic-saturation ratios. **Requires assumptions about the
   unobserved that are, by construction, unverifiable from the observed.**
2. **BOUND it** — refuse to estimate the unknown quantity; instead test a null hypothesis
   about it and reject.
3. **SUBSTITUTE PROCESS for it** — Cochrane's MECIR, PRISMA-S, the two-source rule. Makes
   the search auditable while leaving coverage unmeasured. **Every mandatory Cochrane
   search standard is of this type**, and the nearest thing to a stopping rule in the whole
   apparatus is C37: rerun the search within 12 months. A calendar deadline, not an
   epistemic one.

**Family 2 has exactly one well-evidenced instance, and it is the most useful finding in
this entire research pass.**

### Callaghan & Müller-Hansen's hypergeometric stopping criterion

*Systematic Reviews* 9:273 (2020), open access, with reference implementations.

Interrupt the search, draw a **random sample from the UNSEEN** items, and — because this
is sampling without replacement — treat the count of relevant items found as
hypergeometric. Then test `H₀: recall < target` and **stop only when H₀ is rejected at
the chosen confidence.** Because the tail probability is decreasing in the unknown
population, the test takes the *maximum* probability over every population compatible with
H₀: **conservative by construction.**

In the empirical comparison of stopping methods across simulations, **it is the only
method that never stops before target** (0% misses; overshoots by >20% in just 9% of
cases). Everything else fails badly — one common heuristic family misses target in ~91% of
simulations, achieving 20–25% actual recall.

**And its authors demolish the two heuristics BIO would most naturally have reached for:**

- **"Screen until you have found the expected number"** (estimate prevalence, screen to
  it): worked example — 20,000 items, 2.5% prevalence, 1,000-item sample — **falls short
  of 95% recall in 48% of cases**, and in only 23% of cases both saves work and hits target.
- **"Stop after k consecutive irrelevant results"**: three defects, and the third is the
  one that matters most for BIO. **Recall depends on the NUMBER of unseen relevant items,
  not their proportion — so "2% of a larger number means more relevant documents are
  missed." Perversely, where the machine has performed well, a low proportion among the
  unchecked indicates LOWER recall, not higher. The intuitive signal points the wrong way.**

**This is buildable, and it is the shape BIO should adopt if it ever quantifies anything:
sample the unseen, test a floor, and refuse to claim more than the test supports.**

## THE UNIVERSAL KILLER, CONFIRMED BY SIX FIELDS INDEPENDENTLY

**Correlated searchers**, and every field discovered it separately without reference to the
others:

- **Epidemiology** — positive dependence between sources *underestimates* the hidden
  population; a real study of problem drug users produced estimates from **288,000 to
  927,000** with non-overlapping intervals from models that all fit the data.
- **Software inspection** — cooperating reviewers violate independence; *"most models
  underestimate."*
- **Systematic review** — databases share indexing conventions and publisher feeds, so
  overlap is structurally inflated and estimated completeness structurally optimistic.
- **TAR** — ensemble classifiers trained on shared labels are strongly correlated, biasing
  Chao's estimator downward and **stopping too early.**
- **Journalism** — and this is the one that should end the argument. **Ben Bradlee caught
  it himself in 1972**: the Watergate reporters *"suddenly found that of their two sources
  of information, one of them had received the information from the first source so that
  it really still was only one source."* Thirty years later the same failure ran at
  national scale through the Iraq WMD reporting.
- **Bibliographic capture-recapture** — Webster & Kemp's own warning: the method *"will
  fail most dramatically if there is a sub-population that is much more difficult to find;
  it is possible that both searchers could miss all or most of that sub-population, and
  will overestimate the accuracy of their search."*

**In every case the error runs the SAME DIRECTION: correlation makes the search look more
complete than it is.** This is overwhelming independent confirmation of D-195, and it
raises the independence check from a good idea to the single highest-value thing BIO can
build here — because content-addressed provenance makes it computable, and no other field
has that.

**Two further properties, both counter-intuitive and both load-bearing:**

- **These methods report HIGH CONFIDENCE exactly when they are wrong.** A stratum
  invisible to every searcher produces high apparent agreement, hence high apparent
  coverage. Confidence and correctness diverge precisely at the failure.
- **Optimising for coverage destroys the completeness signal.** Searching more sources
  improves recall while making the independence assumption worse; inspection methods that
  deliberately minimise reviewer overlap to maximise coverage destroy the very overlap
  capture-recapture needs. **There is a real trade-off between finding more and KNOWING
  how much you found**, and BIO should expect to pay it rather than be surprised by it.

**One more folklore correction worth carrying**, because it is the rule everyone reaches
for: Barry Sussman, the Washington Post editor who actually ran the Watergate coverage —
*"I don't know who concocted this two-source nonsense… none of the editors above me ever
mentioned it, nor did I mention it to the reporters. **There was no two-source rule.**"*

## Two findings about WHERE verification effort actually goes

Both are about human behaviour rather than method, and both bear directly on how BIO
should shape its surfaces:

- **Verification effort is INVERSELY related to a claim's consequence.** Reconstruction
  interviews with 28 journalists about specific published stories found *"a small, easily
  checkable fact needs to be checked; a larger but greyer assertion, not so much."* The
  checkable gets checked because it *can* be; the load-bearing claim escapes because it
  cannot be settled cheaply. **A system that makes small checks easy and says nothing about
  large ones will amplify this**, not correct it.
- **The unit of verification should be the SENTENCE, not the story.** Der Spiegel's
  documentation department — the only genuinely itemised standard found in journalism —
  underlines every verifiable item and marks it correct / incorrect / not verifiable. **And
  the same department passed Claas Relotius's fabrications for years**, because a system
  that adjudicates *checkable assertions* is structurally blind to fabricated unverifiable
  colour, scenes and unnamed sources. BIO's per-leg discipline is the right unit; the
  Relotius lesson is that what carries no checkable assertion escapes the mechanism
  entirely.

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
- **Naming the gaps** — ICIJ publishes no consolidated methodology; no field supplied a
  documented case of its own standard being correctly followed and still failing; several
  primary sources were unreachable from this environment (publisher paywalls, several
  newsroom sites, the Sedona Conference's own server) and are cited through courts quoting
  them, which is weaker; and the eDiscovery literature offers essentially nothing on
  material categorically outside the corpus — coded language, off-system communication,
  non-text evidence — which is structurally argued and unmeasured.

**All seven strands returned.** The last of them supplied the one method in family 2
(Callaghan's hypergeometric bound) and the six-field confirmation of the correlated-searcher
failure — neither of which I predicted, and the second of which overturned a ruling made
earlier the same day. That is the strongest evidence available that the research was worth
running rather than reasoned from priors.

**And the honest part: I have no denominator either.** I cannot know what I failed to
search for, my strands were not independent (I wrote all five prompts, so they share my
framing — the correlated-source failure, applied to me), and "saturation" across sources I
selected is precisely the blind spot the TREC mail-in-campaign failure describes.

So this document does what it recommends: it states its frame rather than claiming its
coverage. **That recursion is not a rhetorical flourish — it is the finding.** A search
process cannot certify its own completeness, at any altitude, and the honest output is a
disclosed process plus a stated frame that someone else can attack.
