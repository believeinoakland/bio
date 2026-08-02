# The problem domain: what civic accountability work actually is, and what it does to this design

Written 2026-08-01. **This document looks OUTWARD.** Thirteen prior passes studied the
SYSTEM; the one outside-in pass (`PRACTICE-SURVEY.md`) surveyed comparable SOFTWARE. None
studied the WORK. This one does: how accountability cases are actually made, what kills
them, what makes a public body actually change, what a records request really looks like
end to end, and what the people who do this say they lack.

It is not a second `AUDIENCES.md`. That pass asked *"is the difference between audiences a
rendering"* and answered it from inside the repo's own frame. This pass asks whether the
frame itself survives contact with the practice, and its deliverable is not the research —
it is **what each finding does to a named BIO construct**.

---

## 0 · Evidence discipline, and one thing that went wrong while writing this

Per `CLAUDE.md` ("a vendor's documentation is a claim, not a measurement"), every claim
below carries its provenance:

| tag | meaning |
| --- | --- |
| **[SOURCED]** | a named source with a link, whose own words support the claim. The source is still a CLAIM — a peer-reviewed finding, a government self-report and an NGO evaluation are three different things and the label says which |
| **[PRACTITIONER CLAIM]** | a named practitioner or professional body asserting something about their own practice. Evidence of what practitioners BELIEVE, not of what is true |
| **[MY INFERENCE]** | my reasoning over the above. Attackable, and meant to be |
| **[REPO]** | a file or line in this repository, named |
| **`undetermined`** | I looked and could not establish it. Stated rather than guessed |

**A recorded failure, because this project's rules require it.** While reading Stray's
*Making Artificial Intelligence Work for Investigative Journalism*, the summarising fetch
returned the quoted sentence *"Journalists spend roughly half their time on document
work."* I extracted the PDF and grepped it: **the phrase does not occur in the paper.** It
was a plausible-sounding fabrication produced by a summarising step, and if I had not run
the check it would now be a sourced-looking statistic in a design document — exactly the
failure mode `CLAUDE.md` describes when it says three claims the archive design rested on
turned out wrong when finally measured. Every direct quotation below was verified against
extracted text or against the fetched page. Where I could only reach a paywalled abstract,
the tag says so.

**Two structural limits of this pass, stated up front.** First, almost all the quantified
evidence about whether accountability work changes behaviour comes from *national* politics
and *federal* audit — Brazil, Uganda, Mexico, the US Congress, Westminster. Almost none of
it is about a community group and a city agency, which is BIO's actual case. Second, there
is no user research for this project and none is invented here.

---

## 1 · How accountability cases actually get made

There is not one practice. There are **three traditions** with different starting points,
different units of work, and different success conditions — and BIO has silently adopted
one of them while naming another as its primary audience. That is the most consequential
finding in this document and §6 (F1) states it as such.

### 1.1 The journalism tradition: hypothesis-first

The canonical method text is Mark Lee Hunter et al., *Story-Based Inquiry: A Manual for
Investigative Journalists*, published by UNESCO (2009; second edition 2025) and free
[SOURCED — [UNESCO](https://www.unesco.org/en/articles/new-edition-story-based-inquiry-global-reference-investigative-journalists);
[full text PDF](https://bird.tools/wp-content/uploads/2020/01/SBI_Manual.pdf)]. Its
sequence is printed at the foot of every page of the manual, verbatim:

> We discover a subject. We create a hypothesis to verify. We seek open source data to
> verify the hypothesis. We seek human sources. As we collect the data, we organise it — so
> that it is easier to examine, compose into a story, and check. We put the data in a
> narrative order and compose the story. We do quality control to make sure the story is
> right. We publish the story, promote and defend it.

Four things in that method matter here, and all four are verified against the text.

**(a) The hypothesis is decomposed and each part verified separately.** *"This happens
through a process in which we take apart the hypothesis and see what separate, specific
claims it makes. Then, we can verify each of those claims in turn."* [SOURCED, SBI ch. 2]
The manual's worked example takes one sentence — corruption in the school system has
destroyed parents' hopes — and generates a dozen sub-questions from its terms.

**(b) The method is explicitly a project-management device with a declared worst case.**
*"The worst case is that verification of the hypothesis will quickly show there is no
story, and the project can be ended without wasting significant resources."* The minimum
positive outcome is that the hypothesis is true and quickly verified; the maximum is that
other hypotheses logically follow [SOURCED, SBI ch. 2]. **Killing the inquiry early is a
designed-for outcome, not a failure.**

**(c) The organising artifact is a chronology, not a claim graph.** The manual's "master
file" chapter is unambiguous: *"When you move the data, give it a preliminary order. The
simplest order and the most powerful from an organisational standpoint is chronological.
Stack your events in the order they occurred."* The more developed variant, from Flemming
Svith of the Danish Institute for Computer-Assisted Reporting, is four spreadsheets: a
**document list** (numbered, chronological, with hyperlinks), a **source list** (human
contacts), a **chronology** of events including all contacts with sources, and the master
file itself [SOURCED, SBI ch. 5].

**(d) The contact log is a defence, not bookkeeping.** *"Make sure as well that you
document your contacts with sources… This information can be of critical importance if your
investigation is challenged, because it demonstrates that you made a serious effort of
research."* [SOURCED, SBI ch. 5] The defensible thing is a contemporaneous record of
**effort**, not an assertion of completeness made at the end.

**Where the time goes, as the manual describes it.** SBI does not quantify phases, and I
found no study that does — see §8. What it gives instead is three anecdotes about where
time is lost, and all three are retrieval failures rather than analysis failures: a lost
newspaper clip meant a verified event could not be published; *"a colleague once had to
abandon an investigation when he left a briefcase containing key files in a taxi"*; and
*"another spent a year looking for proof that her targets had conducted a certain study,
and then realised that she already had it in her files."* The manual's stated standard is
that you can put your hand on any asset **within 30 seconds** [SOURCED, SBI ch. 5].

**Quality control is a second person, not an assertion.** SBI ch. 7 sets out fact-checking
as a two-person procedure: *"You need at least two people — the author, and whoever is
checking the story… The checker… asks of every fact: 'How do you know that?'… If there is
no source, the author has to find one. If no source can be found, the passage must be
cut."* And the first of its four components is the completeness test, in almost the words
this repo uses for it: *"making sure that you are, in fact, telling a true story — not just
a story in which each fact is true, but one in which the facts add up to a larger truth. If
an alternative explanation makes more sense than yours, something is wrong."* [SOURCED,
SBI ch. 7]

The manual also carries a base-rate claim from Ariel Hart, then a fact-checker at the
Columbia Journalism Review: *"I have never checked a story that had no mistakes, whether
five pages long or two paragraphs."* [PRACTITIONER CLAIM, quoted in SBI ch. 7]

**Corroboration floor.** *"Once you have found at least four sources who confirm to you
that there is indeed corruption in the schools — less than four is a very risky base to
stand on…"* [PRACTITIONER CLAIM, SBI ch. 2]. Note it is a count of INDEPENDENT sources for
one claim, not a grade on one source.

### 1.2 The government-audit tradition: standards-first, with the subject's answer inside the artifact

Public-sector auditors work to the Generally Accepted Government Auditing Standards
("Yellow Book") [SOURCED — [GAO](https://www.gao.gov/yellowbook)], whose performance-audit
reporting chapter includes **obtaining the views of responsible officials** as a reporting
requirement.

GAO's own published protocols make the mechanics concrete: *"GAO will generally give an
agency from 7 up to 30 calendar days to comment on a draft report"*; GAO expects a single
agency position on the extent of agreement or disagreement with key findings, conclusions
and recommendations, **including the rationale for any disagreement**; where comments are
oral, GAO summarises them and sends the summary back to the official to verify accuracy
before the report is finalised [SOURCED — [GAO Agency Protocols,
GAO-19-55G](https://www.gao.gov/assets/gao-19-55g.pdf)].

**So in the audit tradition the subject's response is not a consequence of publication. It
is a component of the published artifact, obtained under a deadline, before publication.**

The follow-through machinery is equally explicit and is dated:

- **31 U.S.C. §720** requires an agency head to send a written statement of action taken or
  planned to two named congressional committees, the authorising committees and GAO
  **before the 181st day** after a GAO report, and to the Appropriations Committees with
  the next budget request [SOURCED —
  [uscode.house.gov](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title31-section720)].
- **OMB Circular A-50** requires a **management decision within six months** of a final
  audit report and implementation within one year "to the extent practicable", monitored by
  a designated **Audit Follow-up Official** [SOURCED —
  [OMB A-50](https://georgewbush-whitehouse.archives.gov/omb/circulars/a050/a050.html)].
- The Inspector General Act requires OIGs to report to Congress any audit report where
  final action remains open **12 months** after issuance [SOURCED, same].

Three properties recur: a **named accountable individual**, a **clock with a stated
statutory basis**, and a **standing recipient who will ask again**.

### 1.3 The community-organizing tradition: target-first

This is the tradition BIO's primary archetype actually belongs to, and its canonical
planning instrument is the **Midwest Academy Strategy Chart** — five columns filled in left
to right: Goals · Organizational Considerations · Constituency/People Power ·
Decision-Maker (Target) · Tactics [SOURCED —
[Midwest Academy Strategy Chart, 2015](https://www.countyhealthrankings.org/sites/default/files/media/document/resources/MidwestAcademy_Strategy_Chart_2015.pdf),
text extracted and verified].

Two lines from the chart, verbatim:

> **"Always a person with a name, not an institution!"** (of the Decision-Maker/Target)
>
> **"Goals are always concrete improvements in people's lives!"**

And it defines a **Secondary Target**: *"Someone over whom you have power, who has power
over the Decision-Maker (not used in most campaigns)."*

Note what is absent from the chart entirely: evidence, documents, findings, publication.
Tactics are listed as letter writing, petitions, phone calling, group visits to decision
makers, media events, rallies, public forums. **In this tradition a case is an instrument
of a campaign whose target and goal were fixed first.** [MY INFERENCE from the chart's
structure — the chart does not say this in words, but its column order is the argument.]

### 1.4 The records-driven tradition, at scale

The California Reporting Project is the best-documented example of community/newsroom
records work at scale: **more than 2,200 records requests to more than 700 law-enforcement
agencies annually since 2020, yielding more than 180,000 police files** [SOURCED —
[MuckRock](https://www.muckrock.com/news/archives/2023/nov/01/muckrock-helps-california-journalists-police-misconduct-records/)].
Before adopting a tracking platform, the reporters *"had been emailing records requests to
agencies one by one and using Google Sheets to track their progress, but the undertaking
was disjointed and hard to keep organized"*; a participating data journalist: *"Making
requests to more than 700 agencies every year and then managing requests over time is
difficult."* [PRACTITIONER CLAIM, same source]

**The unit of work here is a request FLEET, not a request.** §6 (F4) says what that does to
`action`.

---

## 2 · What kills this work

Failure modes are more informative than success stories, and they split cleanly into two
populations that fail by **completely different mechanisms**: the CASE fails one way, the
GROUP fails another. A design that defends only the first has defended half.

### 2.1 The case fails: what actually broke, step by step

**A right of reply that was technically performed and substantively empty.** This is the
single most common mechanical failure across the strongest post-mortems, and it is the most
transferable finding in this document.

- **Rolling Stone, "A Rape on Campus" (2014).** The Columbia Journalism School review (Coll,
  Coronel, Kravitz, 2015) — a formal external review — found that Erdely emailed Phi Kappa
  Psi asking for comment on "allegations of gang rape" **without date, names or details**.
  The report: *"If Erdely had provided Scipione and Collinsworth the full details she
  possessed instead of asking simply for 'comment,' the fraternity might have investigated
  the facts she presented."* It also states the general rule breached: *"Journalistic
  practice – and basic fairness – require that if a reporter intends to publish derogatory
  information about anyone, he or she should seek that person's side of the story."*
  [SOURCED, formal external review —
  [CJR](https://www.cjr.org/investigation/rolling_stone_investigation.php)]
- Two other failures in the same review are worth naming because both are *record*
  failures. The three corroborating friends were quoted **from the source's recollection of
  conversations and never independently contacted** — the review calls this the most
  consequential failure. And the fact-checker **found the gap and it died in the
  hierarchy**: the checker did not escalate to the department head, who said *"These
  decisions not to reach out to these people were made by editors above my pay grade."* The
  review names **confirmation bias** explicitly: *"the tendency of people to be trapped by
  pre-existing assumptions and to select facts that support their own views while
  overlooking contradictory ones… It seems to have been a factor here."* Verdict: *"The
  failure encompassed reporting, editing, editorial supervision and fact-checking."*
- **Nifong / Duke lacrosse (disbarred 2007, formal NC State Bar disciplinary finding).** DNA
  from four unidentified males, none a lacrosse player, was **omitted from the report given
  to the defence**; Nifong instructed the lab director to prepare a report that excluded the
  exculpatory results, and the director testified the initial report *"was never intended to
  be all-inclusive."* **The mechanism is not fabrication — it is a report scoped to
  exclude.** [SOURCED — [WRAL](https://www.wral.com/story/1584836/)]
- **Post Office / Horizon (UK statutory inquiry).** Fujitsu Europe's director conceded that
  references to bugs, errors and defects **were edited out of the evidence the Post Office
  relied on to prosecute subpostmasters** [SOURCED, statutory inquiry —
  [inquiry site](https://www.postofficehorizoninquiry.org.uk/reports-and-statements);
  concession reported by [The Register](https://www.theregister.com/2025/07/08/post_office_horizon_inquiry/)].
- **Hillsborough Independent Panel (2012).** **164 police statements were significantly
  altered; 116 amended to remove content unfavourable to South Yorkshire Police**, passing
  through solicitors' review before becoming evidence. Twenty-three years elapsed before the
  alteration was public. **The primary record was corrupted upstream of every inquiry that
  used it.** [SOURCED, formal panel —
  [report PDF](https://assets.publishing.service.gov.uk/media/5a7c9e4840f0b65b3de0a0ff/0581.pdf)]

**Claims that outran the document.** CBS's Killian memos (2004): the Thornburgh–Boccardi
independent panel found the documents were never authenticated, that **the views of
consulted experts were exaggerated in the broadcast**, and that dissenting experts were not
sought — the panel could not conclude the memos were forgeries either, which is the point
[SOURCED, formal panel, reported by
[CBS News](https://www.cbsnews.com/news/cbs-ousts-4-for-bush-guard-story-10-01-2005/)].
CNN's "Operation Tailwind" (retracted 1998): ambiguous on-camera statements were treated as
affirmation, and disputing experts got inadequate airtime [SOURCED —
[CNN's own retraction](https://www.cnn.com/US/9807/02/tailwind.johnson/)].

**The verification act with the highest yield is contacting the third party named in the
account, and in every case it was cheap and it was skipped.**

- *This American Life*, "Mr. Daisey and the Apple Factory" (2012): the source said his
  interpreter was unreachable and fact-checking stopped there; a reporter later found her in
  Shenzhen by simple search and she contradicted the account. 888,000 downloads before the
  retraction. **A source's claim that a witness is unreachable is itself a claim requiring
  verification.** [SOURCED — [TAL retraction episode](https://www.thisamericanlife.org/460/retraction)]
- LaCour & Green, *Science* (2014, retracted 2015): the fraud was caught when replicators
  **phoned the survey vendor named in the methods section, which said it had never run the
  study** [SOURCED — [Science](https://www.science.org/content/article/science-retracts-gay-marriage-paper-without-agreement-lead-author-lacour)].
- Surgisphere / *Lancet* + *NEJM* (retracted 2020): **provenance was never checked before
  publication and could not be checked after**; the NEJM authors wrote that they *"are unable
  to validate the primary data sources underlying our article"* [SOURCED —
  [STAT](https://www.statnews.com/2020/06/04/lancet-retracts-major-covid-19-paper-that-raised-safety-concerns-about-malaria-drugs/)].

**Concealment beats fabrication in frequency, and it leaves no artifact to falsify.** The
National Registry of Exonerations' *Government Misconduct and Convicting the Innocent*
(Gross, Possley, Roll, Stephens, 2020), across the first 2,400 US exonerations: **official
misconduct in 54%; concealing exculpatory evidence is the single most common type, present
in 44%; where it occurred, prosecutors were responsible in 73%** [SOURCED, registry
research report —
[PDF](https://exonerationregistry.org/sites/exonerationregistry.org/files/documents/Updated%20CP_Government_Misconduct_and_Convicting_the_Innocent%20(1).pdf)].
**This is the completeness failure, quantified.**

**Every fact true, the case wrong.**

- **Reinhart & Rogoff, "Growth in a Time of Debt" (2010)**, undone by Herndon, Ash & Pollin
  (2013): three stacked defects — an Excel range error dropping five countries, **selective
  exclusion of available data**, and unconventional weighting. Corrected mean growth above
  90% debt/GDP: **+2.2%, not −0.1%**. Only replication with the raw spreadsheet caught it
  [SOURCED — [PERI](https://peri.umass.edu/publication/does-high-public-debt-consistently-stifle-economic-growth-a-critique-of-reinhart-and-rogoff/)].
- **Summary-level evidence cannot be audited.** The ivermectin meta-analysis retraction chain
  turned on a preprint whose duplicated patient records were only visible at record level;
  *Nature Medicine*'s generalisation is that *"meta-analyses based on summary data alone are
  inherently unreliable"* [SOURCED, peer-reviewed —
  [Nature Medicine](https://www.nature.com/articles/s41591-021-01535-y)].
- **FBI microscopic hair comparison review (2015).** **26 of 28 examiners overstated matches
  in a pro-prosecution direction in more than 95% of the 268 trial transcripts reviewed.**
  The observations were real; **the inferential claim placed on them under oath exceeded what
  the method supported** — systematically, in one direction, for decades [SOURCED, joint
  FBI/DOJ/Innocence Project/NACDL review —
  [FBI](https://www.fbi.gov/news/press-releases/fbi-testimony-on-microscopic-hair-analysis-contained-errors-in-at-least-90-percent-of-cases-in-ongoing-review)].
- **Grenfell Tower Inquiry Phase 2 (2024)** found Arconic "deliberately concealed" fire-test
  data from 2005 and Celotex "embarked on a dishonest scheme to mislead its customers", and
  criticised the certification bodies: **the test certificates a diligent investigator would
  have relied on were themselves the falsified artifact** [SOURCED, statutory inquiry —
  [overview PDF](https://ctif.org/sites/default/files/2024-09/CCS0923434692-004_GTI%20Phase%202_Report%20Overview_E-Laying_0.pdf)].
- **ACORN (2009).** The California Attorney General's report found the "pimp costume" framing
  was constructed in the edit; the countermeasure that worked was **compelled production of
  the raw source material** in exchange for immunity [SOURCED, formal AG report —
  [CA OAG](https://oag.ca.gov/news/press-releases/brown-releases-report-detailing-litany-problems-acorn-no-criminality)].

### 2.2 The evidence itself does not hold: web capture, custody, authentication

- **Link and reference rot, measured.** Zittrain, Albert & Lessig, 127 Harv. L. Rev. F. 176
  (2014): **49.9% of links in US Supreme Court opinions no longer point to the cited
  material; >70% of URLs in law-journal citations suffer reference rot.** The paper's own
  distinction matters: *link rot* (404) versus *reference rot* (the page loads and the
  content has changed) — **and reference rot is the dangerous one, because it is silent**
  [SOURCED, peer-reviewed —
  [PDF](https://harvardlawreview.org/wp-content/uploads/2014/03/forvol127_zittrain.pdf)].
- Pew Research Center (May 2024): **38% of webpages that existed in 2013 were inaccessible by
  October 2023**, and **21% of government webpages contain at least one broken link**, worst
  at city level [SOURCED —
  [Pew](https://www.pewresearch.org/data-labs/2024/05/17/when-online-content-disappears/)].
- **An archived page is not self-authenticating.** *Weinhoffer v. Davie Shoring, Inc.*, 23
  F.4th 579 (5th Cir. 2022): Wayback Machine captures are **not eligible for judicial
  notice**, a private internet archive being *"short of being a source whose accuracy cannot
  reasonably be questioned"* under FRE 201 — partly because the Archive's own terms disclaim
  accuracy guarantees. The contrasting case, *United States v. Gasperini* (2d Cir.), admitted
  the same class of evidence **because live testimony from the Internet Archive's office
  manager was put on**. There is no circuit-uniform standard [SOURCED, appellate opinion —
  [Justia](https://law.justia.com/cases/federal/appellate-courts/ca5/20-30568/20-30568-2022-01-20.html)].
- **Enhancement is alteration.** *State of Washington v. Puloka* (King County Super. Ct.,
  2024) excluded AI-"enhanced" bystander video because the method lacked acceptance and
  introduced non-original detail [SOURCED —
  [GT Law](https://www.gtlaw.com/en/insights/2024/5/washington-court-rejects-novel-use-of-ai-enhanced-video-in-trial)].
- **The government's own archive vanished.** FOIAonline, the federal multi-agency FOIA portal
  including its public archive of requests and released records, was decommissioned on 30
  September 2023; MuckRock and POGO scraped and archived it privately [SOURCED —
  [MuckRock](https://www.muckrock.com/news/archives/2023/sep/26/foiaonline-shutting-down/)].
- **The liar's dividend is now an asymmetric cost.** Courts are requiring a factual predicate
  before entertaining an authenticity challenge, with sanctions for frivolous deepfake
  claims — meaning **genuine evidence now costs more to defend than fake evidence costs to
  allege** [SOURCED, practitioner/legal-press analysis —
  [Thomson Reuters](https://www.thomsonreuters.com/en-us/posts/ai-in-courts/deepfakes-evidence-authentication/)].

### 2.3 The group fails, and it fails for reasons unrelated to being right

- **The Civic Tech Graveyard** (Sifry & Stempeck, Civic Tech Field Guide) catalogues ~70
  named failures. Vote.com, Voter.com, Hotsoup, Speakout, Ruck.us, Votizen, Jumo, ChangeByUs
  and VoteIQ consumed **more than $20M combined and all died**, the diagnosis being *no user
  need of sufficient frequency or intensity*, plus incumbents already covering it. Brigade
  raised **$9.3M** and failed on adoption. **Intertwinkles was killed by an upstream
  dependency** — Mozilla Persona changes required unpaid maintenance nobody would do.
  Citizinvestor closed in 2018 having raised $282,737 across 37 funded projects, on which a
  5% commission could never cover operations [SOURCED, curated failure catalogue —
  [graveyard](https://civictech.guide/graveyard/);
  [analysis](https://civictech.guide/learning-from-the-civic-tech-graveyard/)].
  **Fundraising success does not predict survival, and dependency maintenance kills
  quietly.**
- **Code for America ended fiscal sponsorship for ~60 volunteer brigades in Feb 2023** —
  taking with it legal and insurance cover, organising infrastructure, and the right to their
  own "Code for X" names. Stated causes included post-pandemic volunteerism decline and
  difficulty sustaining multi-year funding for a volunteer network [SOURCED, the organisation
  itself — [CfA](https://codeforamerica.org/news/reflections-on-the-brigade-networks-next-chapter/);
  [StateScoop](https://statescoop.com/code-for-america-former-brigades-regroup/)].
- **Then the fallback collapsed too.** Most orphaned brigades moved to the Open Collective
  Foundation, which announced its own dissolution in Feb 2024 effective 31 Dec 2024, leaving
  **more than 600 collectives without a fiscal host**: *"Open Collective Foundation's business
  model is not sustainable…"* [SOURCED — [OCF](https://opencollective.com/foundation/updates/announcement-we-are-dissolving-open-collective-foundation-at-the-end-of-this-year)].
  **Two infrastructure collapses under the same volunteer groups in two years.**
- **Sunlight Foundation**: revenue **$8.9M (2013) → $327K (2016)**; labs closed 2016;
  organisation closed 2020, with a **failed executive search** cited as a primary proximate
  cause [SOURCED — [NPQ](https://nonprofitquarterly.org/2016/10/14/sunlight-labs-closes-innovation-go/);
  [The Fulcrum](https://thefulcrum.us/governance-legislation/sunlight-foundation)].
  **Leadership succession, not mission failure, closed it.**
- **Center for Public Integrity**: 36 years, Pulitzer-winning, ceased operations March 2025.
  Missed a ~$6M budget by **$2.5M**; a funder **rescinded a grant after the layoffs were
  announced**; CEO and editor-in-chief both departed Feb 2024; board chair plus four
  directors left with no replacements; staff **~25 in Jan 2024 → zero by Nov 2024** [SOURCED
  — [CJR](https://www.cjr.org/news/center-for-public-integrity-shutting-down.php)].
- **OCCRP lost 38% of operational funding in the Feb 2025 foreign-aid freeze and laid off 40
  people, one fifth of staff**, ending nearly all downstream grants to local partners
  [SOURCED — [ICIJ](https://www.icij.org/news/2025/02/foreign-aid-freeze-decimates-investigative-news-outlets-internationally/)].
- **Being right is not being made whole.** Francesca Gino sued Harvard and the three Data
  Colada bloggers for **$25M**; the defamation claims against the bloggers were dismissed in
  full in Sept 2024, and in **July 2025 the judge declined to make Gino pay their legal
  fees** [SOURCED — [Science](https://www.science.org/content/article/honesty-researcher-s-lawsuit-against-data-sleuths-dismissed);
  [Harvard Crimson](https://www.thecrimson.com/article/2025/7/12/gino-data-colada-legal-fees/)].
  **Three unpaid volunteers absorbed years of litigation cost for a correct finding.**
- **Burnout, with primary numbers.** Center for Effective Philanthropy, *State of Nonprofits
  2024* (n=239 leaders): **95% concerned about burnout, 34% "very much", and about 75% say
  burnout is impairing mission delivery** [SOURCED —
  [CEP](https://cep.org/news/press-releases/nonprofit-leaders-cite-burnout-as-a-top-concern-in-a-new-study-on-the-state-of-u-s-nonprofits/)].
  General volunteer attrition: roughly **one in three volunteers does no volunteering the
  following year** [SOURCED, older US federal data reported by
  [SSIR](https://ssir.org/articles/entry/the_new_volunteer_workforce)]. **Widely-circulated
  figures like "82% of nonprofit leaders report burnout" trace to content farms with no
  traceable methodology and are not used here.**

### 2.4 The finding survived and the follow-through did not

- **The 9/11 Public Discourse Project** was privately funded by the ten commissioners purely
  to track implementation of the 41 recommendations. It issued a report card of mostly
  mediocre and failing grades in **December 2005 — and dissolved on 31 December 2005**,
  weeks later. **The scoring function outlived the scorer by zero days.** [SOURCED —
  [IU archives](https://archives.iu.edu/html/VAC1262.html)]
- **The Ferguson Commission (2014–15)** issued 189 Calls to Action. Co-chair Rich McClure's
  own diagnosis was that **what was missing was an implementation mechanism — no organisation
  owned the recommendations**; a successor body was created to fill the gap, and ten years on
  its executive director says the work is not done [SOURCED —
  [Forward Through Ferguson](https://forwardthroughferguson.org/report/executive-summary/the-commission/);
  [STLPR](https://www.stlpr.org/race-identity-and-faith/2025-09-15/forward-through-ferguson-leader-work-10-years-alandmark-report)].
  A structural detail worth recording: **items the state could have acted on without waiting
  for the report were not passed** — the report was, in part, an excuse for delay.

### 2.5 Tools built for this work, and why they went unused

Knight Foundation's own "Lessons Learned" retrospective is the most honest funder
post-mortem I found [SOURCED —
[Knight](https://legacy.knightfoundation.org/features/knclessons/)]:

- **PANDA** was technically strong and praised for usability, and **newsrooms did not adopt
  it**: *"no longer in active development… by conventional measures it failed the test of
  sustainability."* The stated cause was that the team could not go full-time on development
  and marketing.
- **ScraperWiki**: below-expected journalist adoption, **news orgs would not pay**, learning
  curve too steep; survived by leaving the media market.
- **Zeega**: local news would not pay; custom consulting drained the team.
- **StoriesFrom**: under-staffed, and — counterintuitively and directly relevant to volunteer
  civic groups — **introducing partial compensation destroyed volunteer momentum.**

Stray's companion field study *What do Journalists do with Documents?* states the field-level
problem plainly: **almost nobody has built NLP tools journalists actually use, because
computer scientists lacked an accurate description of journalists' actual tasks** [SOURCED —
[PDF](http://jonathanstray.com/papers/What%20do%20journalists%20do%20with%20documents.pdf)].

Two corrections to assumptions this project might otherwise carry: **FOIA Machine did not
fail** — it merged into MuckRock in 2016 and still runs; the FOIA infrastructure that died
was the government's own. And **Klaxon was not abandoned** — the self-hosted version died of
**server-maintenance burden on individual users** and survived only by becoming serverless
inside someone else's platform as a DocumentCloud add-on [SOURCED —
[Nieman Lab](https://www.niemanlab.org/2016/11/twice-the-foia-fun-muckrock-bulks-up-its-records-request-resources-with-the-free-foia-machine-tool/);
[MuckRock](https://www.muckrock.com/news/archives/2023/dec/04/klaxon-cloud-free-simple-alerts-when-a-webpage-updates/)].
**DocumentCloud** is the survivor — 3.6M documents, 8,400+ journalists, 1,619 organisations —
and it survived by being **absorbed into MuckRock** when its original institutional home
stepped back [SOURCED —
[Knight](https://knightfoundation.org/articles/documentcloud-goes-from-start-up-to-newsroom-standard/)].
**Tools in this space survive by transferring custody to an organisation with a business
model, not by being good.** [MY INFERENCE, from the pattern across PANDA, ScraperWiki,
Klaxon, DocumentCloud and FOIA Machine.]

---

## 3 · What makes a public body actually respond

This section is the one where the outside evidence is strongest and where it is least
comfortable for the design. The short version: **publication is not the active ingredient.
Consequence is, and consequence is administered by an intermediary with power.**

### 3.1 The null results, first, because they are the most informative

- **Voter-information campaigns, pooled, do nothing.** Dunning et al., *Voter information
  campaigns and political accountability*, **Science Advances** (2019) — a preregistered
  meta-analysis of six coordinated field experiments across Benin, Brazil, Burkina Faso,
  Mexico and Uganda (×2) — found **no evidence overall that typical nonpartisan voter
  information campaigns shape voter behaviour**, with the pooled effect precisely estimated
  and statistically indistinguishable from zero. Knowledge moved modestly; vote choice did
  not [SOURCED, peer-reviewed —
  [Science Advances](https://www.science.org/doi/10.1126/sciadv.aaw2612);
  [EGAP summary](https://egap.org/resource/voter-information-campaigns-and-political-accountability-cumulative-findings-from-a-preregistered-meta-analysis-of-coordinated-trials/)].
- **Performance scorecards moved neither voters nor officials.** Humphreys & Weinstein's
  Uganda MP scorecard experiment built detailed per-MP performance records, told a random
  half of MPs two years in advance that their scores would be published, then ran
  workshops, household visits and flyers. Result: **no impact on voter choice and no impact
  on MP behaviour**; constituents in treated areas knew the scorecard existed but were **no
  better informed about their own MP's performance** [SOURCED, field experiment —
  [policy brief](https://assets.publishing.service.gov.uk/media/57a08aa0ed915d3cfd000866/Humphreys-and-Weinstein-2012-Policy-Brief.pdf)].
- **Information can demobilise.** Chong, De La O, Karlan & Wantchekon, *Does Corruption
  Information Inspire the Fight or Quash the Hope?*, Journal of Politics 77(1) (2015): in
  Mexico, corruption information reduced incumbent support **and also reduced turnout,
  reduced challenger support, and eroded partisan attachment** [SOURCED, peer-reviewed —
  [J. Politics](https://www.journals.uchicago.edu/doi/abs/10.1086/678766)]. This is direct
  evidence that publishing a true finding can make accountability worse.
- **Bottom-up monitoring did not survive scale-up.** Raffler, Posner & Parkerson, *The
  Weakness of Bottom-Up Accountability*, scaling citizen health-centre monitoring in Uganda
  from 50 to 376 centres: improved treatment quality and satisfaction, but **no effect on
  utilisation or on health outcomes including child mortality, and no evidence that citizen
  monitoring was the channel** for the quality gains [SOURCED —
  [PDF](https://poverty-action.org/sites/default/files/publications/The%20Weakness%20of%20Bottom-Up%20Accountability.pdf)].
- **Detection without punishment produces displacement, not deterrence.** Afridi & Iversen
  on India's MGNREGA social audits: audits detected irregularities effectively, but
  **repeated audits did not deter them** — corruption shifted from easy-to-detect labour
  irregularities to harder-to-detect materials irregularities. The authors call explicitly
  for a **time-bound process where transgressors are punished and follow-up responsibility
  is assigned and credibly enforced** [SOURCED —
  [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2424194)].
- **Naming and shaming produces strategic offsetting.** Hafner-Burton, *Sticks and Stones*,
  International Organization 62(4) (2008), 145 countries 1975–2000: governments spotlighted
  for abuses **continue or increase some violations while reducing others** [SOURCED,
  peer-reviewed —
  [Cambridge](https://www.cambridge.org/core/journals/international-organization/article/abs/sticks-and-stones-naming-and-shaming-the-human-rights-enforcement-problem/39C386310B323A85E58F4E687CA5F7D9)].
- **Published open data is mostly unread.** Quarati, *Open Government Data: Usage trends and
  metadata quality*, Journal of Information Science (2023), ~400,000 datasets across 28
  portals: most published datasets are very lightly used; half the French portal's datasets
  were never viewed; ~118,000 US portal datasets were viewed by no more than 12 users
  [SOURCED, peer-reviewed —
  [Sage](https://journals.sagepub.com/doi/10.1177/01655515211027775)].
- **Open Government Partnership's own independent evaluations.** Across 23 IRM Results
  Reports, **265 commitments assessed → 149 produced "early results" → 27 (≈10%) produced
  "major or outstanding" early results**; roughly 20% of commitments are completed overall
  [SOURCED, NGO self-evaluation —
  [OGP](https://www.opengovpartnership.org/stories/five-key-reflections-from-the-latest-irm-results-reports/)].

### 3.2 The FOI-specific evidence, which is the closest analogue to BIO

Ben Worthy, *More Open but Not More Trusted? The Effect of the Freedom of Information Act
2000 on the United Kingdom Central Government*, **Governance** 23(4): 561–582 (2010)
[SOURCED, peer-reviewed; full text extracted from
[this copy](https://accountabilityindia.in/sites/default/files/ben_worthy_-_more_open_but_not_more_trusted.pdf)].
Findings, in the paper's own words and figures:

- FOI achieved **transparency and accountability**, "though the latter only in particular
  circumstances", and did **not** achieve improved decision-making, improved public
  understanding, increased participation, or increased trust.
- *"FOI is not a direct tool for accountability but a means by which information can be
  obtained, and used, by accountability mechanisms."*
- Of press articles using FOI, **53% sought accountability in some fashion. "However, few
  attempts elicited a response or reaction from the intended target."**
- A journalist interviewed: *"It depends if politicians [or] pressure groups pick up on it
  and convert the raw information into a tool of accountability. It is a question of how
  people react."*
- **The requesters' own assessment is the number that should worry this project.** Asked
  whether FOI had increased *their own* ability to make government accountable, **20%
  agreed, 30% said no effect, and 40% felt it had DECREASED.**
- *"FOI works as a tool for accountability in the United Kingdom when circumstances,
  information and opportunity converge… However, it is not always a useful tool and does
  not automatically bring accountability."*

A worked example of the two-hop pattern from mySociety: a WhatDoTheyKnow request for the
Cabinet Office Precedent Book succeeded only after an ICO appeal, and *the results were
then highlighted to the campaign group Republic, who in turn framed the information for
journalists* [SOURCED, platform operator's own research —
[mySociety](https://research.mysociety.org/html/public-foi/)].

### 3.3 What DOES move a body, on the evidence

- **Legal exposure, not electoral exposure.** Avis, Ferraz & Finan, *Do Government Audits
  Reduce Corruption?*, Journal of Political Economy 126(5) (2018): a past audit reduces
  future corruption by **8%** and raises the probability of subsequent **legal action by
  20%**; the operative mechanism is the perceived **non-electoral** cost [SOURCED,
  peer-reviewed — [NBER w22443](https://www.nber.org/papers/w22443)].
- **Elections, but only where a local media channel exists.** Ferraz & Finan, *Exposing
  Corrupt Politicians*, QJE 123(2) (2008): releasing random federal audit results cut
  incumbent re-election probability by ~20%, **concentrated in municipalities with local
  radio** [SOURCED, peer-reviewed —
  [QJE](https://academic.oup.com/qje/article-abstract/123/2/703/1930865)].
- **Timing, and it decays.** Bobonis, Cámara Fuertes & Schwabe, *Monitoring Corruptible
  Politicians*, AER 106(8) (2016): Puerto Rico municipalities audited **shortly before an
  election** showed lower corruption and higher electoral accountability — **but the effect
  did not persist** into subsequent audits [SOURCED, peer-reviewed —
  [AEA](https://www.aeaweb.org/articles?id=10.1257%2Faer.20130874)].
- **Press attention, priced.** Snyder & Strömberg, *Press Coverage and Political
  Accountability* (JPE 2010): less-covered members of Congress testify less at hearings and
  serve less on constituency committees; a 1-SD increase in press–district congruence
  raises per-capita federal spending in the district by **3%** [SOURCED, peer-reviewed —
  [NBER w13878](https://www.nber.org/papers/w13878)]. Gao, Lee & Murphy, *Financing Dies in
  Darkness?*, Journal of Financial Economics (2020): after a local newspaper closes,
  municipal bond offering yields rise **5.5bp** (10.6bp for revenue bonds) — roughly
  **$650,000 extra per issue** [SOURCED, peer-reviewed —
  [JFE](https://www.sciencedirect.com/science/article/abs/pii/S0304405X19301606)].
- **Oversight hearings work, weakly.** Ban & Hill, *Efficacy of Congressional Oversight*,
  American Political Science Review 119(4) (2025): hearings produce subsequent declines in
  improper payments, but **"the magnitude of the effect is small relative to the scope of
  the problem, suggesting strong limits on the efficacy of oversight"** [SOURCED,
  peer-reviewed —
  [APSR](https://www.cambridge.org/core/journals/american-political-science-review/article/efficacy-of-congressional-oversight/97E953579A6DFA76120CAE956522A862)].
- **Legal citation beats moral appeal, in a records-request field experiment.** Municipal
  actors failed to respond to records requests **more than 70% of the time**; a reference to
  the FOI law **nearly doubled responsiveness**, while moral appeals had no effect [SOURCED,
  peer-reviewed field experiment —
  [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0167268124000489)].
  Relatedly, ben-Aaron et al., *Transparency by Conformity*, Public Administration Review
  (2017): telling an agency that peer agencies complied speeds response and raises
  fulfilment [SOURCED —
  [Wiley](https://onlinelibrary.wiley.com/doi/10.1111/puar.12596)].
- **The addressed, legally-binding individual request outperforms the published dataset.**
  Peisakhin & Pinto, *Is transparency an effective anti-corruption strategy?*, Regulation &
  Governance (2010): in Delhi slums, filing an RTI request was **almost as effective as
  paying a bribe** at obtaining a ration card, and far more effective than an NGO support
  letter [SOURCED, field experiment — [Yale ISPS](https://isps.yale.edu/research/publications/isps10-029)].

### 3.4 The single named official

The closest thing to a natural experiment is the UK Public Accounts Committee, which
summons the departmental **Accounting Officer personally**, requires a government response
within **two months** via a Treasury Minute, and tracks progress publicly. Wells & Rogers,
*Implementing Public Accounts Committee Recommendations*, Parliamentary Affairs 76(3)
(2023): of **615 recommendations 2010–12, 88% were fully or partly accepted — against ~40%
acceptance for ordinary departmental select committees**. But **only ~50% met the 12-month
deadline**, and the authors judge the progress reports **"data rich but information poor"**
and vulnerable to gaming, with prospective (i.e. not-yet-achieved) completion dates in
21.5% of cases [SOURCED, peer-reviewed —
[Parliamentary Affairs](https://academic.oup.com/pa/article/76/3/662/6532406)].

The Accounting Officer obligation is personal and continuous: officers *"should have systems
in place to monitor closely and continuously implementation of all accepted Committee
recommendations… and should write immediately to the Committee where it becomes clear that a
recommendation is no longer on track"* [SOURCED —
[HM Treasury](https://www.gov.uk/government/collections/treasury-minutes)].

**`undetermined`: no direct experimental test exists** of "finding addressed to a named
individual with a deadline" versus "finding published generally" inside a public body. The
88%-vs-40% gap is not a randomised comparison — PAC also selects higher-salience topics and
is backed by a national audit office. The support is convergent and circumstantial.

### 3.5 Follow-through rates, where anyone publishes them

- GAO self-reports **~75% of its recommendations implemented within four years** [SOURCED,
  government self-report, and GAO decides when a recommendation is "closed–implemented" —
  [GAO](https://www.gao.gov/about/what-gao-does/recommendations)].
- Seattle City Auditor, as of 31 Dec 2024: **72% implemented (672/928), 8% pending, and 20%
  closed with "no further follow-up planned"** — that last figure is the honest measure of
  findings that died [SOURCED — [Seattle](https://www.seattle.gov/city-auditor/reports)].
- Oakland City Auditor, as of 31 Dec 2023: **44% (117/265) of unique recommendations issued
  in the previous ten years implemented** [SOURCED —
  [Oakland](https://www.oaklandauditor.com/wp-content/uploads/2024/03/20240321_Audit-Recommendation-Follow-Up-Report_FINAL.pdf)].
  This is BIO's own named city.
- GAO's stated criteria for removing an item from its High-Risk List are **leadership
  commitment, agency capacity, a corrective action plan, a monitoring programme, and
  demonstrated progress** [SOURCED — [GAO-22-105184](https://www.gao.gov/products/gao-22-105184)].
  Note that the quality of the finding is not among them.

### 3.6 Measuring the consequence — and the standard practitioners actually apply to it

ProPublica's own white paper on impact (Richard Tofel, *Non-Profit Journalism: Issues Around
Impact*) is unusually candid, and what it concedes is directly load-bearing here [SOURCED,
publisher's own methodology paper; full text extracted from
[the PDF](https://s3.amazonaws.com/propublica/assets/about/LFA_ProPublica-white-paper_2.1.pdf)]:

- Impact entries are recorded *"only when ProPublica management believes, usually from the
  public record, that reasonable people would be satisfied that a clear causal link exists"*.
- It distinguishes **"opportunities for change"** — legislative hearings, an administrative
  study, the appointment of a commission — from impact itself: *"such opportunities are
  'outcomes' short of impact."*
- And then the concession: *"impact is easier to identify than to conclusively 'prove', and
  … those seeking to chart it must not shy away from an attitude that 'I know it when I see
  it.'"* Many of the paper's own examples *"might have difficulty withstanding a rigorous
  challenge in, for instance, a court of law or a philosophy seminar."*
- Tracking is bounded by attention, not by the record: *"series do not remain on the
  Tracking Report forever. Once ProPublica stops reporting on them, formal tracking ceases."*

### 3.7 Participatory budgeting, since community budget advocacy was named

- **Brazil, national panel, positive.** Gonçalves, *The Effects of Participatory Budgeting
  on Municipal Expenditures and Infant Mortality in Brazil*, World Development 53 (2014):
  PB municipalities shifted a larger budget share to sanitation and health and saw reduced
  infant mortality, and PB was budget-neutral [SOURCED, peer-reviewed —
  [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S0305750X13000156)].
- **New York City, ten-year panel, modest and compositional.** Hagelskamp et al., *Shifting
  Priorities*, New Political Science 42(2) (2020): PB-adopting council districts allocated
  greater proportions to schools, streets and public housing and smaller proportions to
  parks and housing preservation [SOURCED, peer-reviewed —
  [PDF](https://publicagenda.org/wp-content/uploads/Shifting-Priorities-Hagelskamp-et-al.pdf)].
  Scale check: roughly **$210m over 706 projects** in NYC PB
  [SOURCED — [PBP](https://www.participatorybudgeting.org/participatory-budgeting-in-nyc/)]
  against a city budget around two orders of magnitude larger. **PB changed *what*, not *how
  much*.** [MY INFERENCE from those two figures.]
- **Porto Alegre, the founding case, has been dismantled** — significant decline especially
  since 2017, attributed to declining political commitment and the absence of a mechanism
  feeding PB into long-term city planning [SOURCED —
  [Sage](https://journals.sagepub.com/doi/10.1177/1866802X261464354);
  [WRI](https://www.wri.org/research/porto-alegre-participatory-budgeting-and-the-challenge-of-sustaining-transformative-change)].

### 3.8 The framing text

Jonathan Fox, *The uncertain relationship between transparency and accountability*,
Development in Practice 17(4–5) (2007), distinguishes **opaque vs clear transparency** and
**soft accountability (answerability) vs hard accountability (answerability plus
consequences)**, and observes that transparency mobilises the power of shame *"yet the
shameless may not be vulnerable to public exposure, and truth often fails to lead to
justice"* [SOURCED, peer-reviewed —
[open copy](https://escholarship.org/uc/item/8c25c3z4)].

---

## 4 · The records-request lifecycle in practice

**This is the substrate `action` models, and it has never been checked against reality.** It
is checked here. Federal figures throughout are from DOJ OIP's *2025 Annual FOIA Report
Summary*, published 1 July 2026, covering 117 agencies [SOURCED, government self-report —
[DOJ OIP](https://www.justice.gov/oip/media/1450791/dl?inline=)].

### 4.1 The first deadline is not a deadline to produce anything

**California, which is BIO's jurisdiction.** Gov. Code §7922.535 requires an agency, within
**10 days** of receipt, to *determine* whether the request seeks disclosable records and to
notify the requester of the determination and the reasons. **This is not a deadline to
produce records** — it is a deadline to say what the agency intends. "Unusual circumstances"
permit a written extension of **no more than 14 days** [SOURCED, statute —
[leginfo](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?sectionNum=7922.535&lawCode=GOV);
[Justia](https://law.justia.com/codes/california/code-gov/title-1/division-10/part-3/chapter-1/article-2/section-7922-535/)].
So the first clock in a CPRA action expires **without any records having moved**, and the
production itself has no statutory date at all.

Note also what §7922.535(a) *does* require alongside the determination: *"the agency shall
also state the estimated date and time when the records will be made available."* The First
Amendment Coalition's reading is that the CPRA *"does not specify when records must be
produced"* and that courts have found it *"typically provides no remedy for failure to
timely comply"* [SOURCED, advocacy legal explainer —
[FAC](https://firstamendmentcoalition.org/resources/explainers/explainer-cpra-delays/)]. So
in California the enforceable clock is a promise-to-estimate; the estimate itself is not
enforceable. Police-misconduct records under SB 1421/16/519 are the narrow exception, at 45
days.

Federally, 5 U.S.C. §552(a)(6)(A)(i) is likewise a **20-working-day deadline to *determine*
whether to comply**, with a ten-working-day "unusual circumstances" extension under
§552(a)(6)(B)(i), and appeal rights of at least 90 days [SOURCED, statute —
[Cornell LII](https://www.law.cornell.edu/uscode/text/5/552)]. Two federal provisions worth
naming because they are clocks with teeth: §552(a)(6)(C) makes administrative remedies
**constructively exhausted** when the agency blows the limit, and §552(a)(4)(A)(viii) bars
the agency from **assessing search fees at all** if it missed a time limit.

State practice varies more than any single deadline field can express: Texas requires
"prompt" production with no fixed date but a 10-business-day certification, and — uniquely —
a body wishing to withhold **must ask the Attorney General for a decision within 10 business
days**; New York gives 5 business days to acknowledge and then requires "a date certain";
**Florida, Ohio and Wisconsin have no numeric deadline at all** ("reasonable time", "as soon
as practicable and without delay") [SOURCED, statute texts —
[TX §552.221](https://texas.public.law/statutes/tex._gov't_code_section_552.221),
[TX §552.301](https://texas.public.law/statutes/tex._gov't_code_section_552.301),
[NY POL §89](https://www.nysenate.gov/legislation/laws/PBO/89),
[FL §119.07](http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0100-0199/0119/Sections/0119.07.html),
[OH 149.43](https://codes.ohio.gov/ohio-revised-code/section-149.43),
[WI 19.35](https://docs.legis.wisconsin.gov/statutes/statutes/19/ii/35)].
**No authoritative primary 50-state deadline table exists**; circulating ones trace to vendor
blogs and should not be relied on.

### 4.2 What agencies actually take, and the direction of travel

| | FY2024 | FY2025 |
| --- | --- | --- |
| Requests received | 1,501,432 | **1,707,197** (+13.7%) |
| Backlog at year end | 267,056 | **339,671** (+27%) |
| Pending at year end | — | **463,541** |
| Average processing, **simple** track | 44.0 days | **48.96 days** |
| Full-time FOIA staff | 5,628.46 | **4,823.17** (−14.3%) |
| Total FOIA cost | $723.4M | **$661,394,858** |
| Fees collected | — | **$2,511,193** (= **0.38%** of cost) |

[SOURCED, government self-report, DOJ OIP FY2025 summary.] The backlog decade trend is
102,828 (FY2015) → 200,843 (FY2023) → **339,671 (FY2025)**. Only **23.12% of complex-track
requests were processed within the statutory 20 days** in FY2025, down from 27.43%; about a
quarter took longer than 100 days.

**Three cautions on those numbers, all of which a design must respect.**

1. **Concentration.** Five agencies received **84%** of all federal requests and **DHS alone
   received 60%** — overwhelmingly first-party immigration-file requests, not third-party
   document requests. Every government-wide average is dominated by a workload nothing like
   BIO's case [SOURCED, DOJ OIP; the criticism is also made by
   [Brechner](https://brechner.org/2025/04/30/foia-requests-denials-surge-fy-2024/)].
2. **Median and mean diverge enormously.** CFPB FY2025: simple track **median 1 day, average
   9.8, high 176**; complex **median 52.5, average 97.66, high 653** [SOURCED, agency annual
   report — [CFPB](https://files.consumerfinance.gov/f/documents/cfpb_fy2025-foia-annual-report.pdf)].
   **A median tells a requester nothing about their own tail risk.**
3. **The government's own numbers are unreliable.** GAO: *"Since 2013, many agencies have
   reported inaccurate times in one or more years"*, with agencies miscomputing weighted
   averages; of 14 agencies directed to file backlog-reduction plans, only 2 included goals
   and **none included timelines** [SOURCED — [GAO-24-106535](https://www.gao.gov/products/gao-24-106535)].

### 4.3 Dispositions — and why `resolution` is the wrong shape

Disposition of **all** processed federal requests [SOURCED, DOJ OIP FY2025]:

| outcome | FY2024 | FY2025 |
| --- | --- | --- |
| **Full grant** | 12.11% | **9.54%** |
| **Partial grant / partial denial** | 37.59% | **37.74%** |
| Full denial on exemptions | 3.33% | **3.17%** |
| **No responsive records** | 24.90% | **29.73%** |
| Improper request | 8.90% | **8.04%** |
| Duplicate | 3.82% | 3.24% |
| Withdrawn | 2.09% | 1.77% |
| Not an agency record | 2.34% | 1.48% |
| Not reasonably described | 1.04% | 1.21% |
| Fee-related | 0.32% | 0.46% |

**Half of all requests never reach the merits.** In FY2025, **49.56% (810,290) were closed
for procedural or administrative reasons** and only 50.44% were substantively processed —
and procedural closure is *rising* (46.97% in FY2024). Within the substantively processed
subset, **released in part is 74.82%** and released in full is 18.9%. **Partial production
is the default outcome, not the exception.**

**A denominator trap worth recording**, because it will otherwise look like a source
conflict. DOJ reports *"93.72% resulted in either a full or partial release"*; the New York
Times reports **47%**. Both are correct: 9.54% + 37.74% = 47.28% of *all processed* requests;
the same numerator over the *substantively processed* subset is 93.74%. The NYT's independent
analysis also reports **"the lowest grant rate since at least 2010"** and that requesters with
pending asks waited **longer than 240 days on average** [SOURCED via
[FOIA Advisor](https://www.foiaadvisor.com/foia-blog/2026/7/29/foia-news-nyt-report-on-foia-requests-in-limbo-or-unfulfilled);
the NYT original is paywalled and was not directly verified].

Most-cited exemptions, FY2025: **Ex. 6 (36.02%)** and **Ex. 7(C) (25.07%)** together account
for 61%; **Ex. 7(E) 23.45%**; **Ex. 5, deliberative process, is only 6.03%** — far below its
reputation, though RCFP calls it *"one of the most abused bases for denying access"* and
reports POGO finding identical records redacted differently depending on who asked [SOURCED,
advocacy — [RCFP](https://www.rcfp.org/foia-deliberative-process/)]. **Glomar has no
statutory basis and is not a tracked category** — there is no government-wide count of it
[SOURCED, origin in *Phillippi v. CIA*, 546 F.2d 1009 (D.C. Cir. 1976)].

### 4.4 Rolling production breaks the one-request-one-outcome model

There is **no federal statutory installment right**; interim release is DOJ guidance. But the
guidance's own consequence is the important part: agencies *"should offer the requester the
opportunity to appeal the initial determinations that are made on each successive interim
release"* [SOURCED — [DOJ OIP guidance](https://www.justice.gov/oip/blog/oip-guidance-importance-good-communication-foia-requesters)].

**So one request generates N determinations, N appeal clocks each of at least 90 days, and N
partial exemption sets — while the official statistics still count it as one request with one
disposition.** Washington State is the clearest express installment mandate: records
available *"on a partial or installment basis as records that are part of a larger set of
requested records are assembled or made ready"* [SOURCED — [RCW 42.56.080](https://app.leg.wa.gov/RCW/default.aspx?cite=42.56.080)].
California has no installment provision at all.

Courts set the cadence when the parties cannot agree: in *Seavey v. DOJ* (D.D.C. 2017) the
court rejected the FBI's proposed **500 pages/month** and ordered **not less than 2,850
pages/month** [SOURCED — [DOJ OIP summary](https://www.justice.gov/oip/seavey-v-doj-no-15-1303-2017-wl-3112816-ddc-july-20-2017-kessler-j)].

### 4.5 Appeals and litigation

- **Appeals received FY2025: 32,059, up 59.38%** on FY2024. Appeal backlog **up 116.5%** in
  one year. DHS alone accounted for 64% of appeals received.
- **Average appeal adjudication: 93.76 days** against a statutory 20 working days. Spread is
  extreme — SSA 10.33 days, DOJ 68.67, Dept. of War 195.37.
- **`undetermined`: there is no published government-wide appeal affirm/reverse rate.** DOJ's
  summaries publish volumes and times only. Two agency illustrations: CFPB FY2025, 68.8%
  affirmed and **0% completely reversed** (n=16); SEC, 76.7% affirmed with ~19.8% obtaining
  some relief (n=645). Treat as illustrative.
- **Litigation:** 889 federal FOIA lawsuits filed in FY2024, **more than 75% in the District
  of D.C.** [SOURCED via the FOIA Advisory Committee, reported by
  [MuckRock](https://www.muckrock.com/news/archives/2026/jul/22/what-requesters-need-to-know-about-the-foia-advisory-committees-recommendations-for-reform/)].
  Litigation cost the government **$50.7M in FY2025, 7.67% of all FOIA spending — about 20×
  what it collects in fees.**
- **Fee-shifting is the sharpest jurisdictional difference, and it favours California.**
  Federal §552(a)(4)(E) is discretionary ("may assess"). CPRA Gov. Code §7923.115(a) is
  mandatory: *"If the requester prevails in litigation filed pursuant to this chapter, the
  court **shall** award court costs and reasonable attorney's fees to the requester."* Fees
  run the other way only if the case is *"clearly frivolous"* [SOURCED, statute —
  [leginfo](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=7923.115)].
- **A *Vaughn* index** — an itemised correlation of each withheld document to a specific
  exemption — is available **only in litigation, on summary judgment**. The administrative
  requester gets no equivalent [SOURCED — [FOIA Wiki](https://foia.wiki/wiki/Vaughn_Indices)].

### 4.6 Fees

Federally, fee category determines what may be charged: commercial (search + review +
duplication), educational and news media (duplication only), all other (search +
duplication); usually no charge for the first two hours of search or the first 100 pages, and
**inability to pay is explicitly not a basis for a waiver** [SOURCED —
[FOIA.gov](https://www.foia.gov/faq.html)]. In California only the **direct cost of
duplication** may be charged (Gov. Code §7922.530(a)), and *National Lawyers Guild v. City of
Hayward*, 9 Cal.5th 488 (2020), held that "extraction" *"does not … cover the cost of
redacting exempt data from otherwise producible electronic records"* — striking a **$2,938.58
invoice for ~40 hours** of body-camera redaction. **Agencies bear their own redaction costs**
[SOURCED, California Supreme Court —
[opinion](https://caselaw.findlaw.com/court/ca-supreme-court/2067702.html)].

Documented deterrent quotes are real but are outliers: **~$15 million** for Palin-era Alaska
emails; **~$50 million** in Michigan for a driving-records tape; **>$9,000** in North
Carolina for two years of a town manager's email; **$1,000,000** from the Virginia State
Police [SOURCED, compiled by [RCFP](https://www.rcfp.org/open-government-sections/5-have-agencies-imposed-prohibitive-fees-to-discourage-requesters/);
Virginia via [VCIJ](https://vcij.org/stories/in-virginia-public-information-has-a-price)].
**But requesters do not rank fees as the main obstacle.** In a survey of 330 requesters,
excessive fees ranked only **4th** (mean 3.33/5), well behind **delay (4.44)** [SOURCED,
academic — Wagner & Cuillier].

### 4.7 The best field measurement of compliance

A. Jay Wagner, *Piercing the veil*, Government Information Quarterly 38(1) (2021): **1,002
identical-protocol requests across 9 states and 334 counties**, Feb–Dec 2019 [SOURCED,
peer-reviewed — [PDF](https://static1.squarespace.com/static/57c99b8829687f97347637d8/t/6014b1000ed6ee11a2f74328/1611968768850/Piercing+the+Veil+-+Government+Information+Quarterly.pdf)]:

- **63% positive, 34% "no responsive records", 3% negative or never completed.** Average 17
  days to completion, 11 to first response.
- State spread: **Washington 92% positive / 13 days** down to **Oklahoma 23% / 22 days** — a
  roughly fourfold compliance gap.
- **By agency type: District Attorney 99% positive, Sheriff 90%, Road 54%, County
  Administration 32%.** The counterparty's *function* predicts the outcome better than
  anything the requester does.
- Regressions found significant demographic and political predictors of outcome.
- **Note the convergence**: Wagner's field-measured 34% "no responsive records" is close to
  the federal self-reported 29.73%.

Platform and press-association figures corroborate the shape. MuckRock's own 2017 analysis of
30,000+ requests: **43% average success, median response 31 days, mean just over 70** — with
the platform's own caveat that requests covered only 2.7% of US jurisdictions [SOURCED,
platform self-report — [MuckRock](https://www.muckrock.com/news/archives/2017/mar/14/muckrock-foia-response-data/)];
its live counter reads 180,347 filed and 60,507 fulfilled. State averages ranged from
**Oregon 148 days** to **Vermont 11**. Press-association audits: Alabama, **52% of sheriff's
departments and 37% of police departments rejected** requests; New Mexico, 30% denied;
Wisconsin, 318 requests across 65 counties with **59 fulfilled only after custodians
illegally demanded the requester's identity or purpose** [SOURCED, advocacy audits indexed at
[NFOIC](https://www.nfoic.org/foi-audits/)].

**What requesters themselves report** (n=222, presented to the federal FOIA Advisory
Committee, 2022): receipt of records "every time" **4.05%**; **48.2% rated the overall
experience poor or terrible** against 14.86% good or excellent; **delay ranked the #1
problem at 4.44/5**, called an "extreme problem" by 61.36%; **59.28% never sue** and **59.46%
never appeal a fee** [SOURCED, government-hosted survey —
[NARA/OGIS](https://www.archives.gov/files/ogis/foia-advisory-committee/2020-2022-term/meetings/survey-overview-05.04.2022-1.pdf)].

### 4.8 The counterparty can restart or kill your clock

This is the part of the lifecycle no tracking model I have seen represents, and it is
growing.

- **Mass administrative closure.** A Federal Register notice of 14 August 2025 required anyone
  with a Department of Energy request filed before 1 October 2024 to **re-confirm interest
  within 30 days or have the request closed** [SOURCED, Federal Register —
  [notice](https://www.federalregister.gov/documents/2025/08/14/2025-15490/notice-of-the-department-of-energy-freedom-of-information-act-foia-still-interested-inquiry)].
- **"Clarify or close" scope letters.** The National Security Archive documented **26
  instances across 2024–25, 18 carrying closure threats**, including one giving **three
  business days** to respond, and reports 93 of its own requests hit by the DOE notice
  [SOURCED, advocacy audit —
  [NSArchive](https://nsarchive.gwu.edu/foia-audit/foia/2026-03-16/clarify-or-close-agency-scope-letters-undermine-rights-foia-requesters)].
- **Capacity is falling as demand rises** — staffing −14.3% government-wide against +13.7%
  requests — and the FOIA Advisory Committee's conclusion is that backlogs *"are no longer
  fixable solely by asking individual agency offices to work harder"* [SOURCED, reported by
  [MuckRock](https://www.muckrock.com/news/archives/2026/jul/22/what-requesters-need-to-know-about-the-foia-advisory-committees-recommendations-for-reform/)].

**So an outbound action can acquire an inbound obligation with a short fuse, and missing it
terminates the action.** §6 (F9) says what that does to the model.

### 4.9 Not every records right is a deadline. Some are windows that close.

Under the UK Local Audit and Accountability Act 2014 and the Accounts and Audit Regulations
2015, a local elector's rights of **inspection, questioning and objection** to a council's
accounts *"may only be exercised within a single period of 30 working days"* [SOURCED,
statute — [legislation.gov.uk](https://www.legislation.gov.uk/uksi/2015/234/part/5/made)].
Miss it and the right is gone for a year — there is nothing to chase and nobody is overdue.

The same shape recurs on the requester's side of FOIA: an appeal right of **at least 90 days**
that simply lapses, and a **30-day** or **three-business-day** window to answer a
clarify-or-close letter (§4.8). And the mirror image exists too — §552(a)(4)(A)(viii) means an
agency that misses its own deadline **forfeits search fees**, which is a clock on THEM whose
expiry is good news for us.

Older compliance audits, for historical range: press-association FOI audits report compliance
spanning roughly **22% to 70%** — South Carolina 2000 at 70% for state agencies, Connecticut
1999 at 22%, Colorado non-compliance in about a third of cases across all 63 counties
[SOURCED, secondary summary — [Reporters Committee](https://www.rcfp.org/journals/the-news-media-and-the-law-fall-2002/look-state-records-audits/)].
A 50-state exercise sending identical requests to 100 state offices reports **more than half
simply ignored the request** [SOURCED, vendor-published survey, treat accordingly —
[Logikcull](https://www.logikcull.com/blog/state-open-records-heat-map)]. Wagner's 2019 study
(§4.7) supersedes these on method and should be preferred.

**So `clock[]` must distinguish at least three kinds of obligation** — theirs, ours, and a
window that expires — and `status: waived` is not the same as `status: expired`. §6 (F8).

---

## 5 · What practitioners say they lack

The honest headline: **there is very little rigorous "what I wish I had" literature**, and
what exists is mostly tool-vendor content or conference tip sheets. The five findings below
are the ones I could source.

**5.1 The fear of missing something is the named bottleneck, and it is a RECALL problem.**
Stray et al.'s Overview study — a visual document-mining tool deployed to working
journalists across six published-story case studies, one a 2014 Pulitzer Public Service
finalist — reports that *"the frequently-used language of 'exploring' a document collection
is both too vague and too narrow to capture how journalists actually used our
application"*, and that the specific task characterisation only emerged from repeated
real-world deployment [SOURCED, peer-reviewed (IEEE TVCG 2015) —
[UBC tech report](https://www.cs.ubc.ca/labs/imager/tr/2014/Overview/)]. Document-set sizes
in the case studies were modest by e-discovery standards — 625 White House drilling emails,
6,849 Venezuela diplomatic cables. **[MY INFERENCE]**: the interesting number is how SMALL
these are. The problem was never volume; it was confidence of coverage.

**5.2 Newsroom standards resist codification, and the people who tried say so.** Stray,
*Making Artificial Intelligence Work for Investigative Journalism*, Digital Journalism 7(8)
(2019), quoting Reuters' Reg Chua on the Tracer system: *"Newsroom standards are rarely
formal enough to turn into code… 'The interesting exercise when you start moving to machines
is you have to start codifying this,' says Chua. 'Much like trying to program ethics for
self-driving cars, it's an exercise in turning implicit judgments into clear
instructions.'"* The same paper records the AP's parallel experience: *"Translating even the
simplest data means converting the loose guidelines a human reporter might follow into
concrete rules a computer can follow."* [SOURCED, peer-reviewed; verified in extracted text
— [PDF](https://jonathanstray.com/papers/Making%20Artificial%20Intelligence%20Work%20for%20Investigative%20Journalism.pdf)]

**5.3 Attaching documents to claims IS adopted where it is made easy.** Mor & Reich, *From
"Trust Me" to "Show Me" Journalism*, Journalism Practice 12(9) (2018), content-analysed 200
news items and 315 accompanying DocumentCloud documents and found the platform *"succeeds in
boosting massive use of documents, both by mainstream and alternative journalists"*, with
documents serving to support factual claims **in 96% of items** [SOURCED, peer-reviewed,
abstract only — [T&F](https://www.tandfonline.com/doi/abs/10.1080/17512786.2017.1376593)].
**Caveat that matters:** this measures publisher behaviour, not reader trust. The paper's
title asks whether it restores credibility; I did not obtain the full text and cannot say
what it concluded on that.

**5.4 Structuring costs the author, and the cost is real.** Jones & Jones, *Atomising the
News: The (In)Flexibility of Structured Journalism*, Digital Journalism 7(8) (2019), on two
BBC atomised-news experiments, characterise the practice as journalists **"writing for
machines"** — converting unstructured information into structured data to enable automated
recombination and reuse [SOURCED, peer-reviewed, abstract/summary only —
[T&F](https://www.tandfonline.com/doi/abs/10.1080/21670811.2019.1609372)]. Circa, the
best-known consumer attempt at atomised news, shut down; Bill Adair's diagnosis was that it
*wasn't structured enough*, while the common complaint was that the narrative outcome was
less compelling [PRACTITIONER CLAIM, reported by
[CJR](https://www.cjr.org/innovations/structured_journalism.php) and
[Nieman Lab](https://www.niemanlab.org/2015/06/one-thing-we-can-learn-from-circa-a-broader-way-to-think-about-structured-news/)].

**5.5 Tracking a request fleet over time is the named pain.** §1.4's California Reporting
Project account is the clearest practitioner statement of it, and the pain named is not
filing — it is **managing requests over time** and following up when an agency goes quiet
[PRACTITIONER CLAIM].

---

## 6 · THE DELIVERABLE — what each finding does to a named construct

Every row names the construct, states the verdict, and says what follows. **CONTRADICTS**
means the practice and the design cannot both be right. Nothing is softened.

| # | finding | construct | verdict | consequence |
| --- | --- | --- | --- | --- |
| **F1** | Three professional traditions; BIO's primary archetype belongs to the one BIO did not model | the whole spine; `inquiry` as root | **CONTRADICTS** | for a community group the goal and the named target come FIRST and the case is instrumental. Neither goal nor target is a first-class thing in BIO |
| **F2** | The subject's response belongs inside the artifact, obtained under deadline, BEFORE publication | the spine's ordering; `action` states | **CONTRADICTS** | a request-for-comment `action` must be a PRECONDITION of ratification, not a consequence of it |
| **F3** | A vague right of reply is not a right of reply — the ask must carry the specific claims | the `action`↔`inquiry` connection D-127 obs.2 names as missing | **STRAINS** | the record must show WHICH claims were put to the counterparty, not that contact occurred |
| **F4** | Real records work is a fleet: 2,200 requests to 700 agencies; 1,002 identical requests | `action.counterparty` (single required string) | **STRAINS badly** | one action per counterparty makes the fleet 700 objects with 700 clocks and no shared identity |
| **F5** | Partial production is the modal outcome (74.82% of substantively processed); "no responsive records" is 29.73%; ~50% close procedurally | `action.resolution` ∈ {complied, denied, escalated, withdrawn} | **CONTRADICTS** | `complied` (9.54%) and `denied` (3.17%) are the two RAREST federal outcomes. The enum cannot express what usually happens |
| **F6** | One request → N determinations, N appeal clocks, N exemption sets | `action` state machine (`resolved: []`, terminal) | **CONTRADICTS** | `resolved` being terminal makes an appeal unrepresentable, and appeals rose 59% in one year |
| **F7** | Deadlines with a stated statutory basis, a named official and a standing recipient are what correlate with follow-through | `clock[]` = `{date, text, description, basis, status}`, C-11.1 | **VALIDATES — most strongly of anything here** | keep it exactly as it is; the `basis` requirement is the field the outside evidence most supports |
| **F8** | Clocks come in three kinds: a deadline on THEM, a WINDOW that expires, a deadline on US that forfeits a right | `clock[].status` ∈ {pending, met, overdue, waived} | **STRAINS** | `waived` is not `expired`, and nothing says whose obligation it is |
| **F9** | The counterparty can restart or terminate your clock ("still interested", clarify-or-close, 3 business days) | `action`; the QUEUE | **STRAINS** | an outbound action can acquire an inbound obligation whose expiry KILLS it. No construct carries that |
| **F10** | Records arrive by email, portal, CD and paper | `information` intake | **STRAINS (build gap, not doctrine)** | doctrine allows locator "in hand"; `op=acquire` requires a public HTTPS locator. The object model is fine; the only provenance-bearing op is not |
| **F11** | 49.9% of SCOTUS opinion links rotted; 38% of 2013 pages gone by 2023; reference rot is silent | `information` capture-first citation | **VALIDATES strongly** | this is the design decision the outside evidence supports most cheaply |
| **F12** | An archived page is not self-authenticating (*Weinhoffer*, 5th Cir. 2022); it was admitted in *Gasperini* only with a live custodian | capture grade; the certification gap AUDIENCES.md row 12 found | **VALIDATES the gap, ESCALATES it** | the missing custodian attestation is not a lawyer's nicety — it is the difference between admitted and excluded |
| **F13** | Concealing exculpatory evidence appears in 44% of exonerations with official misconduct; SBI's first fact-check test is the alternative-explanation test | the completeness claim | **VALIDATES — the strongest validation of a BIO-specific invention** | nothing else in the surveyed practice has an authored exclusion statement, and the failure it targets is the most common one there is |
| **F14** | But completeness is caught by a SECOND PERSON asking "how do you know that?" — and at Rolling Stone the checker found the gap and it died in the hierarchy | the completeness claim as an authored field | **STRAINS** | an authored self-assessment is exactly what those editors produced. The reviewer needs standing, not the author a field |
| **F15** | The defensible artifact is a contemporaneous log of EFFORT, not a terminal assertion of coverage | `inquiry` (no session log); `action` has `## Session Log` | **STRAINS** | `inquiry` has no equivalent of `action`'s session log, and the log is what survives challenge |
| **F16** | FBI hair review: 26 of 28 examiners overstated in a pro-prosecution direction in >95% of 268 transcripts | R4 (division must cost what severance costs); invariant 7 | **VALIDATES** | systematic one-directional overstatement is real and institutional. A published child naming its parent and siblings is the right rule |
| **F17** | The honest answer that saved the NEJM authors was "we are unable to validate the primary data sources" | R1 (`undetermined` SUSPENDS, never floors) | **VALIDATES** | a rule that made `undetermined` expensive would have punished the only honest act available |
| **F18** | SBI's threshold is a COUNT of independent sources ("less than four is a very risky base"); pooling summary-level claims is "inherently unreliable" | the strength pair; D-72 connection grades | **STRAINS — a real gap** | weakest-link has no notion of INDEPENDENCE. Two Grade C connections from one source and two from unrelated sources compute identically |
| **F19** | The queue's grouping unit is the case; the recurring event stream is per-counterparty clock events across a fleet | the QUEUE (one entry per member×case) | **STRAINS** | at practice scale one entry reads "2,200 things need attention on this case" |
| **F20** | Impact is "easier to identify than to conclusively prove"; ProPublica's own examples would struggle "in a court of law" | the consequence loop (D-128); grading | **CONTRADICTS** | if a consequence is an `inquiry` under the same grade rules, every consequence claim suspends or grades D — or the project quietly accepts a weaker standard for its OWN claims than for its findings |
| **F21** | Consequence arrives after the project stops: A-50 gives six months; the 9/11 tracker dissolved weeks after scoring; Ferguson had "no organisation owning the recommendations" | `project` (`closed`), which contains the `action` that holds the clock | **STRAINS** | the follow-through obligation must outlive the workspace that created it |
| **F22** | Publication is not the active ingredient. Audits work through prosecution risk (+20% legal action); voter-information campaigns pool to zero; 40% of FOI requesters felt their own leverage DECREASED | the case as terminal deliverable | **CONTRADICTS** | the case is instrumental; the `action` is the product. AUDIENCES.md reached "divergence lives in `action`" — this is the same conclusion from the EFFECT side and it is stronger |
| **F23** | Groups die of succession, board failure, funder concentration, fiscal-host collapse and dependency maintenance — not of being wrong | Membership v2 §8.2 (rebuild without the instance) | **VALIDATES — and strains `newgroup`** | §8.2 is the design decision the failure evidence supports most. A sovereign per-group cloud account is also exactly the maintenance burden that killed self-hosted Klaxon |
| **F24** | "I have never checked a story that had no mistakes, whether five pages long or two paragraphs" | concluding as an act | **VALIDATES a mandatory check step** | a UI in which one member concludes an inquiry alone contradicts every professional practice surveyed |

### The five that matter, examined properly

**F1 — BIO is a journalism-tradition tool aimed at an organizing-tradition audience, and the
two traditions run in opposite directions.** This is the finding I would most want
challenged, and I state it plainly because the brief asks for that.

`BIO_Case_Making_v0_1.md` names the path as *questioning → exploring → discovering →
documenting → impacting*, and the collapse ruling makes `inquiry` the spine: a question that
gathers evidence, concludes, and publishes. That is precisely Story-Based Inquiry's sequence
— hypothesis, verify, organise, compose, quality control, publish — and SBI is the canonical
text of the journalism tradition [SOURCED, §1.1].

But `JOURNEY-PRIMARY.md` and `AUDIENCES.md` both name the primary archetype as **a member of
a community accountability group**, and that is the organizing tradition, whose canonical
planning instrument runs the other way. The Midwest Academy Strategy Chart's columns are
**Goals → Organizational Considerations → Constituency/People Power → Decision-Maker (Target)
→ Tactics**, its goals are *"always concrete improvements in people's lives"*, and its target
is *"always a person with a name, not an institution"* [SOURCED, §1.3]. Evidence, documents,
findings and publication appear **nowhere on the chart**. A case, in that tradition, is a
tactic selected because it shows power to a target already chosen.

Two consequences, and they are not cosmetic:

- **BIO has no goal object and no target object.** `project.objective` is the nearest thing
  and it is an attribute of a workspace, not a thing the queue reaches or the record claims
  against. `counterparty` exists only on `action`, arrives late, and is a free string.
- **The tool's centre of gravity is the inquiry; the archetype's centre of gravity is the
  campaign.** A member arriving from the organizing tradition will look for "who decides
  this, what do we want them to do, and when is the moment" and find a system that asks
  "what is your question."

[MY INFERENCE] The honest resolution is probably not to import the strategy chart. It is to
recognise that **`action` is where the organizing tradition lives in this model**, which is
the same place F22 and `AUDIENCES.md` §10.11 independently land, and to stop treating it as
the leaf of the spine.

**F2 and F3 — the subject's answer is an input to the artifact, not a consequence of it, and
the ask must be specific.** Three independent professional traditions agree:

- SPJ Code of Ethics: *"Diligently seek out subjects of news stories to give them the
  opportunity to respond to allegations of wrongdoing."* [SOURCED, professional code, text
  verified from [this copy](https://www2.hawaii.edu/~jour/spj/SPJcode.html); note this is the
  pre-2014 wording and the current revision phrases it slightly differently]
- GAGAS/Yellow Book requires **obtaining the views of responsible officials**, and GAO's own
  protocols give an agency **7 to 30 calendar days** on a draft report, expect a single
  position with **the rationale for any disagreement**, and print the response in the report
  [SOURCED, §1.2].
- The Columbia review of Rolling Stone found that a request for "comment" **without the
  specifics** was the failure: *"If Erdely had provided … the full details she possessed
  instead of asking simply for 'comment,' the fraternity might have investigated the facts
  she presented."* [SOURCED, §2.1]

`AUDIENCES.md` §7's diagram runs `… → RATIFY → CASE → rendering → action → consequence`, and
its §9 lists the pre-publication release of material as **hazards** — H4 ("the low-threshold
rendering that escapes") and H6 ("the embargo"). **The practice says H4 and H6 are not
hazards to be avoided. They are the required workflow.** An unratified rendering carrying
specific claims must leave the building, addressed to the subject, under a deadline, before
anything is ratified — and what comes back is captured, cited, and may change the case.

That is not a small edit. It means:

1. a `request_for_comment` (or equivalent) `action_kind`, and a **gate** on ratification that
   asks whether it was performed — not whether the answer was favourable;
2. the action must **name the specific inquiries it disclosed**, so "we contacted them" and
   "we put these four claims to them" are distinguishable in the record. This is one of the
   missing connections D-127 obs. 2 identifies, specified;
3. the fence has to permit a **pre-ratification addressed release**, which is exactly
   `AUDIENCES.md` row 14's "delivery with no bucket" — and the outside evidence says that row
   is not an edge case for oversight referrals. It is the main path for every case that names
   anybody.

**F5 and F6 — `action`'s outcome model does not fit the outcome distribution.** The enum is
`complied · denied · escalated · withdrawn`. Federally, **`complied` describes 9.54% of
processed requests and `denied` describes 3.17%** — the two rarest outcomes. The modal
outcome is **partial** (37.74% of all, 74.82% of substantively processed) and the
second-largest single category is **"no responsive records" at 29.73%**, which is neither
compliance nor denial and is the one an accountability group most needs to reason about,
because Wagner's field study measured **34% of 1,002 identical requests** ending that way
[SOURCED, §4.3, §4.7].

And `resolved: []` is terminal in the state table [REPO, `bio-checks.mjs`:74–81]. That makes
the following unrepresentable: an interim release resolves nothing; an appeal follows a
determination; a second determination follows the appeal; CPRA litigation follows that with
**mandatory fee-shifting to a prevailing requester** [SOURCED, §4.5]. Federal appeals rose
**59% in a single year**. **A model in which the most common outcome has no name and the most
consequential next step has no edge is not modelling this domain.**

Minimum honest repair: resolutions covering `partial`, `no_records`, `procedurally_closed`
and `constructively_denied`; a `resolved → active` edge or an explicit successor-action
relation for appeals; and an acknowledgement that **the unit is a determination, not a
request**.

**F13 with F14 — the completeness claim is right, and its enforcement point is wrong.** The
completeness claim is, on this evidence, **the best idea in the design**. Concealing
exculpatory evidence is the single most common form of official misconduct in US wrongful
convictions, present in **44%** of the 2,400 exonerations studied [SOURCED, §2.1]. Nifong
scoped a report to exclude. Fujitsu's defect references were edited out. South Yorkshire
Police amended 116 statements to remove unfavourable content. Reinhart & Rogoff's headline
survived three years on selective exclusion. **In every one of those, each retained fact was
true.** `PRACTICE-SURVEY.md` already recorded that no comparable tool offers this; the
outside evidence says it is aimed at the right target.

The strain is where it is enforced. `BIO_Case_Making_v0_1.md` makes it an **authored field on
the case, never prefilled** — the author states what was excluded and why. SBI puts the same
test on a **second person**: *"You need at least two people — the author, and whoever is
checking the story"*, and the first component of the check is the alternative-explanation
test [SOURCED, §1.1]. And Rolling Stone is the counterexample that decides it: **the
fact-checker did identify the gap, and it died going up the hierarchy** — *"These decisions
not to reach out to these people were made by editors above my pay grade"* [SOURCED, §2.1].

[MY INFERENCE] So the field is necessary and not sufficient, and the missing piece is not a
better field. It is **standing**: a reviewer whose refusal is recorded and whose objection
the ratification act cannot silently absorb. That is the same shape as `AUDIENCES.md` H4's
"in-band" rule, applied to a person instead of a document.

**F20 and F22 — the theory of change, and the standard applied to our own impact claims.**
Two separate problems that compound.

First, **publication is not the active ingredient**. Worthy: 53% of FOI-using press articles
sought accountability and *"few attempts elicited a response or reaction from the intended
target"*; FOI *"is not a direct tool for accountability but a means by which information can
be obtained, and used, by accountability mechanisms"*; and **40% of requesters felt their own
ability to hold government accountable had DECREASED** [SOURCED, §3.2]. Metaketa I's pooled
null across six coordinated RCTs; the Uganda scorecard null on voters *and* on politicians;
Mexico's demobilising effect; open-data portals with quartiles at zero downloads; OGP's ~10%
"major early results" [SOURCED, §3.1]. What does work runs through an intermediary with
power: **+20% probability of legal action** after a Brazilian audit, with the mechanism
identified as non-electoral [SOURCED, §3.3].

Second, and this is the uncomfortable one: **the consequence half cannot be held to BIO's own
evidentiary standard.** ProPublica, the most impact-disciplined publisher in the field, says
in its own methodology paper that impact is *"easier to identify than to conclusively
'prove'"*, that chartering it requires an attitude of *"I know it when I see it"*, and that
its own examples *"might have difficulty withstanding a rigorous challenge in, for instance,
a court of law"* [SOURCED, §3.6].

D-128 proposes measuring declared-versus-actual flow **on our own intervention**. If that
consequence claim becomes an `inquiry` graded like any other, then under R1 nearly every one
suspends for an `undetermined` causal leg, and the feature is honest and useless. If instead
it is recorded at a looser standard because it is ours, the project has done the exact thing
its doctrine names as the more dangerous half of the threat model. **Neither branch is
acceptable and the design has not chosen between them.** [MY INFERENCE, and I think it is the
most important unforced consequence in this document.]

The shape that might survive: record the consequence as **`information`** — the body did this
thing, captured with its own provenance — and treat the *attribution* as a separately named,
explicitly non-composing claim that never enters a strength chain. ProPublica's own
distinction supports it: hearings and commissions are *"'outcomes' short of impact"*, and
capturing an outcome is exactly what `information` already does.

**F23 — the one place the failure evidence is unambiguously on this design's side, and the
one place it is not.** Membership v2 §8.2 — published material content-addressed and
rebuildable *"without the cooperation, permission, or continued existence of the instance it
came from"* — is validated harder than anything else in the repo. Sunlight closed on a failed
executive search; the Center for Public Integrity went from ~25 staff to zero in ten months
on board dysfunction and a rescinded grant; the Open Collective Foundation's dissolution left
**600+ collectives without a fiscal host** two years after Code for America cut ~60 brigades
loose; Intertwinkles died of an upstream dependency nobody would maintain [SOURCED, §2.3].
**The institution and the record fail by completely different mechanisms, and §8.2 is the
only defence in the repo aimed at the first.**

The same evidence is less kind to `newgroup`. **Klaxon's self-hosted version died of
server-maintenance burden on individual users and survived only by becoming serverless inside
someone else's platform; DocumentCloud survived by being absorbed into an organisation with a
business model** [SOURCED, §2.5]. A sovereign Cloudflare account per group is the
distribution model *and* it is per-group operational surface owned by volunteers with 95%
burnout concern and roughly one-in-three annual attrition [SOURCED, §2.3]. I am not saying
the model is wrong — §8.2's guarantee is worth a lot and depends on it. I am saying **the
failure literature's single most repeated cause of death is the one `newgroup` creates**, and
nothing in the repo treats that as a risk. [MY INFERENCE.]

### Two smaller things the evidence settles

- **F18, independence.** BIO's capture axis already refuses cheap agreement — *"two empty-body
  digests agreeing agree on nothing"* [REPO, `CLAUDE.md`]. The **connection** axis has no
  equivalent. SBI's working threshold is a count of *independent* sources; *Nature Medicine*'s
  finding is that pooling summary-level claims without inspecting the underlying records is
  *"inherently unreliable"* [SOURCED, §1.1, §2.1]. Weakest-link composition, as specified,
  computes the same answer for two Grade C connections that share a source and two that do
  not. That is a gap in the strength pair, not in its two-axis structure.
- **F19, the queue.** `JOURNEY-PRIMARY.md` S1 groups "one standing entry per (member, case)".
  A group running even a hundredth of the California Reporting Project's fleet has hundreds of
  determination deadlines, appeal windows and clarify-or-close fuses, all belonging to one
  case. The grouping key that makes the queue readable at that scale is the **counterparty or
  the request fleet**, not the case.

---

## 7 · Where the evidence was too thin to conclude

Stated rather than papered over.

1. **Nothing measures where the time goes in this work.** SBI gives anecdotes; the Overview
   study characterises tasks but publishes no time allocation; no study I found decomposes an
   investigation into phases with durations. The one apparently-quantified claim I
   encountered was a fabrication (§0). **`undetermined`.**
2. **No causal decomposition of what makes a recommendation get implemented.** GAO reports
   ~75%, Seattle 72%, Oakland 44% — but nobody has isolated "named official" vs "due date" vs
   "statutory follow-up" as predictors. The 88%-vs-40% PAC gap is the strongest evidence for
   the named-official-plus-deadline design and it is **not a randomised comparison**.
3. **No experimental test of an addressed finding versus a published one inside a public
   body.** Everything in §3.4 is convergent and circumstantial.
4. **Government-wide FOIA appeal outcome rates are not published**, so I cannot say how often
   an appeal actually reverses. Two agency illustrations only, and they disagree in shape
   (CFPB 0% full reversal; SEC ~20% obtaining some relief).
5. **How often litigation is the only thing that produces records** — no study found.
6. **How often "unusual circumstances" extensions are invoked** — not a reported federal
   field.
7. **Whether requester identity changes agency behaviour** is survey self-report, not
   experiment. No US audit randomises journalist-vs-citizen against real agencies.
8. **Mor & Reich's conclusion on whether attached documents restore credibility** — I reached
   the abstract only, which reports adoption, not effect. The title's question is unanswered
   here.
9. **Der Spiegel's internal commission findings** on how its checking department failed over
   seven years of Relotius fabrications are not public in mechanical detail. Any specific
   claim about that failure should be treated as unverified.
10. **Almost none of the effectiveness evidence is about a community group and a city
    agency.** It is national politics and federal audit. The transfer to BIO's actual case is
    an assumption this document makes and cannot support.
11. **"Policy windows" is a heuristic, not a measured effect.** Kingdon's framework is widely
    used and contested in its operationalisation; no quantitative study isolates budget-cycle
    timing as a cause of finding uptake. The one clean timing result (Bobonis et al.) is
    electoral and **decays**.
12. **The record-object question this document does not answer**: whether the chronology —
    which is the organising artifact in both the journalism and the litigation traditions
    (§1.1, and a whole commercial software category) — should be a first-class BIO construct
    or a rendering over `information` and `action` dates. I found strong evidence that
    practitioners build one and no evidence about whether a derived one would serve. The
    vendor material asserting its necessity is marketing and is labelled as such.
