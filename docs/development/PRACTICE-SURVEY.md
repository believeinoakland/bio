# Practice survey: what comparable tools do, and what members will arrive expecting

Written 2026-08-01 as an outside-in research pass for the case-making design
(`architecture/BIO_Case_Making_v0_1.md`, D-127) and the queue construct
(`architecture/BIO_Interaction_Constructs_v0_1.md` v0.2, `NOTIFICATIONS.md`).

**This is a survey, not a design and not a measurement.** Every statement about
another tool below is an OUTSIDE CLAIM — almost all of it vendor or community
documentation — and is labelled with its source. Per CLAUDE.md, *a vendor's
documentation is a claim, not a measurement*, so nothing here says how users
actually behave; it says what a vendor says its product does, and what a member who
has used that product will therefore expect to find. Where I could not tie a
recommendation to a named tool's documented behaviour or to this repo's doctrine, I
did not make it.

**What the survey is FOR.** UI-PLAN "Who this is for" rules the audience
non-technical and the workflow's job as removing members from logistics. That makes
prior familiarity a real asset: a shape a member already knows costs nothing to
teach. It also makes it a real hazard, because several of the most familiar shapes
in this class of tool are optimised for *compellingness*, which
`BIO_Case_Making_v0_1.md` §4a names as the wrong axis.

---

## 1 · Evidence research and annotation

| tool | journey it supports | pattern a user has LEARNED | does well (claimed) | does badly / cuts against BIO |
| --- | --- | --- | --- | --- |
| **DocumentCloud** (MuckRock) | upload a public record, annotate it, publish the annotated document | a note is anchored to a REGION of a page; **note visibility is a property of the note** — private / organization / public, and colour-coded (blue / green / yellow) per [DocumentCloud help](https://embed.documentcloud.org/help/faq/) | visibility is legible at a glance rather than buried in a menu; notes are searchable ([MuckRock release notes, 2023](https://www.muckrock.com/news/archives/2023/jan/31/release-notes-note-searching-ocr-improvements-new-add-ons-and-other-documentcloud-improvements/)) | the annotation is the unit; there is no object for *a claim derived from several documents*, which is exactly the gap D-127 identifies. Provenance is "we uploaded this", not a custody chain |
| **Zotero** | collect sources, annotate, cite into a document | highlight in a built-in reader, then **"Add Note from Annotations"** assembles *your own* highlights into a note, each carrying a citation and a jump-back link to the source page ([Zotero PDF reader docs](https://www.zotero.org/support/pdf_reader); [Harvard Library guide](https://guides.library.harvard.edu/c.php?g=1245347&p=9207882)) | the round trip from claim back to the exact page is one click, and the citation travels with the excerpt automatically | citation formatting is the product; whether the source *supports* the claim is entirely the user's problem. Nothing computes or displays strength |
| **Obsidian** | private note graph, connections found later | `[[wikilinks]]`, a **backlinks pane on the note itself**, and **unlinked mentions** — text matching the note title that is not yet a link ([Obsidian help via DeepWiki](https://deepwiki.com/obsidianmd/obsidian-help/4.2-internal-links-and-graph-view)) | "what points at this" shown on the thing pointed at is now a near-universal expectation | the **graph view** rewards connection density visually. A dense graph looks like insight and is not evidence of any. Unlinked mentions are string coincidence presented in the same pane as authored links |
| **NVivo** | code a corpus, agree on the coding, report rigour | a **codebook**: every code has a definition and inclusion/exclusion criteria; agreement between coders is computed (percentage agreement, Cohen's kappa) and coding changes leave an audit trail ([USC library guide](https://guides.library.sc.edu/nvivo/queries); [Tandfonline 2025 on NVivo functional-language coding](https://www.tandfonline.com/doi/full/10.1080/13645579.2025.2595072)) | the discipline that a category must be DEFINED before it is applied, and that changing the definition is a recorded event, is the same discipline as this repo's `C-` catalogue | agreement statistics are easy to read as validity. Two coders agreeing costs little and proves little — the same failure mode CLAUDE.md names as *an equality that costs nothing to produce is not evidence* |

**Collision.** Zotero's extract-my-annotations is the one auto-composition in this
whole survey that BIO could take unchanged, and the reason is precise: **it assembles
the member's OWN prior words and never generates new ones.** That is the line the
prefill rule actually draws. Assembling what a member already wrote is not
attribution; drafting a justification for them is.

---

## 2 · Investigative case management and link analysis

| tool | journey | learned pattern | does well (claimed) | does badly / cuts against BIO |
| --- | --- | --- | --- | --- |
| **IBM i2 Analyst's Notebook** | build a picture of who is connected to whom | the **entity–link–property** model, drawn on a chart; link thickness/type carries meaning; social-network metrics rank importance ([IBM i2 9.2 user help](https://www.ibm.com/docs/en/SSJSV9_9.2.4/pdf/analysts_notebook_pdf.pdf); [i2 product page](https://i2group.com/solutions/i2-analysts-notebook)) | the vocabulary (entity / link / property) is the most widely learned investigative data model there is | **a drawn link reads as an established relationship.** The chart has no visual grammar for "this edge is grade D" or "undetermined" — and centrality metrics rank a node's importance by graph shape, which is compellingness, not support |
| **OCCRP Aleph** | search across many corpora, cross-reference a list of names against them | an **investigation workspace** you upload into; **cross-referencing** compares entities in your set against 300+ public datasets and returns candidate matches ([Aleph user docs](https://docs.aleph.occrp.org/users/investigations/cross-referencing/); [GIJN tipsheet](https://gijn.org/resource/using-aleph/)) | machine-proposed matches are presented as *leads to check*, not as facts — the framing D-82 requires | a match is a name collision until a person judges it. The workspace/published distinction is thin compared with BIO's two-bucket fence |
| **Everlaw Storybuilder** | discovery → trial prep: turn reviewed documents into a case | an **Evidence page** (documents, highlights, deposition excerpts added to a Story), **fact timelines** where each fact is backed by evidence, and **Drafts** for outlining arguments ([Everlaw KB: Introduction to Storybuilder](https://support.everlaw.com/hc/en-us/articles/206439403-Introduction-to-Storybuilder); [Evidence page](https://support.everlaw.com/hc/en-us/articles/360038816812-Storybuilder-Evidence-Page); [Drafts](https://support.everlaw.com/hc/en-us/articles/360038816832-Storybuilder-Drafts)) | fact-backed-by-evidence as the atom, and a chronology derived from those facts, is the closest commercial analogue to `inquiry` | **the Drafts half is a narrative composition workspace.** Its purpose is to make the argument land. Nothing in it asks what was left out, and no strength composes across the chain |

**Collision.** This category is where BIO's inversion bites hardest. Every tool here
is built to help a user assemble the most persuasive picture the material allows.
`BIO_Case_Making_v0_1.md` §4a rules the opposite: **easy to build a supported case,
hard to state an unsupported one.**

---

## 3 · E-discovery and legal-claim support

Sourced from vendor material and one encyclopaedia entry; treat all of it as claim.

- **Chain of custody as an artifact, not a feeling.** Relativity's marketing
  describes audit trails, chain-of-custody tracking and preserved processing metadata
  as what makes a review "defensible"
  ([Relativity eDiscovery](https://www.relativity.com/data-solutions/ediscovery/)).
  The expectation a lawyer brings is that **every document can answer "where did this
  come from and who touched it"** without anyone reconstructing it afterwards. BIO's
  provenance chain and `op=export` / `exportlog` are the same artifact; the difference
  is that BIO's is hash-anchored rather than log-anchored.
- **Withhold-and-log.** A privilege log must give enough detail to justify withholding
  *without disclosing the withheld substance*
  ([Wikipedia: Privilege log](https://en.wikipedia.org/wiki/Privilege_log); [Relativity
  blog, 7 Steps to Your Best Privilege Log](https://www.relativity.com/blog/7-steps-to-your-best-privilege-log-ever/)).
  This is the only widely-known convention that resembles BIO's **exclusion statement
  on a case** — you say what you left out and why. Two differences, both load-bearing:
  a privilege log exists to PROTECT the withholder; BIO's exclusion statement exists to
  EXPOSE the author. And Relativity claims automated log generation from coded metadata
  with configurable templates — which is exactly the prefill BIO must refuse.
- **Production is a deliberate, formatted, irreversible act.** Bates numbering,
  redaction, slipsheets, endorsements, load files (same Relativity source). A lawyer
  arrives expecting that *producing* is a distinct heavy step with its own settings —
  which supports keeping ATTESTATION on its own rung of the weight ladder rather than
  collapsing it into an act.
- **Scored relevance.** Relativity markets "AI-powered privilege decisions and log
  support" (same source). A confidence score smooths an undetermined leg into a
  number. BIO's strength is weakest-link over graded connections (D-72), and
  `undetermined` must survive the composition rather than be averaged away.

---

## 4 · Issue and obligation tracking with deadlines and assignment

| tool | journey | learned pattern | does well (claimed) | does badly / cuts against BIO |
| --- | --- | --- | --- | --- |
| **MuckRock** | file a records request and chase it | **status names whose move it is**: Awaiting Acknowledgement / Awaiting Response / Awaiting Appeal / Completed; follow-up is driven by the agency's own estimated date ([MuckRock FAQ](https://www.muckrock.com/faq/); [How MuckRock Works](https://www.muckrock.com/about/how-we-work/)) | this is the closest public analogue to BIO's `action` states, and `awaiting_response` is literally the same word. The clock belongs to the COUNTERPARTY, not to us | tracks the request, not the finding it produces; nothing links a response back to what it was asked for |
| **Linear** | triage incoming work, then own it | **Triage as a shared team inbox** with a small fixed verb set; **snooze that returns on a date OR on new activity, whichever comes first**; rules can route by priority/creator/due date/SLA ([Linear Triage docs](https://linear.app/docs/triage); [Linear Inbox docs](https://linear.app/docs/inbox)) | the snooze semantics are precisely what `BIO_Interaction_Constructs_v0_1.md` v0.2 specifies for a standing queue entry — re-notify on a snooze increment *or* when something new lands | routing rules are surface-side configuration. A rule that silently reassigns is the "silently dropped" failure D-79 forbids unless it ages with a recorded reason |
| **Jira-class trackers** (generic) | assign, prioritise, meet a date | priority ladders and coloured severity badges | universally understood | **severity ladders rot upward** — `NOTIFICATIONS.md` already rejects the four-severity hypothesis for exactly this reason and sorts by class instead |

---

## 5 · Notification and inbox systems that aggregate rather than flood

- **GitHub notifications.** Documented behaviour: an inbox you can **group by
  repository or by date**, each item carrying a **reason label** (mention, subscribed,
  review-requested), filterable with `reason:` queries and saveable as custom filters
  ([GitHub Docs: managing notifications from your inbox](https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox);
  [inbox filters reference](https://docs.github.com/en/subscriptions-and-notifications/reference/inbox-filters)).
  **Grouping by the user's unit of work, and telling them WHY an item is in front of
  them, are both already learned.** That is DEC-10's grouping-by-case and the item
  contract's `basis` field, arriving pre-taught.
  What it does badly: "Done" clears an item with no record and no reason, and the
  unread count is the primary signal — a volume proxy standing in for meaning.
- **GitHub Checks API.** A check run **declares its own action buttons** — up to three
  `{label, description, identifier}` objects — and GitHub renders them, dispatching
  `check_run.requested_action` with the identifier when one is clicked
  ([GitHub Docs: getting started with the Checks API](https://docs.github.com/rest/guides/getting-started-with-the-checks-api)).
  **This is a named, shipping precedent for `NOTIFICATIONS.md` rule 1** — options come
  from the producer, the surface only renders them — and it is worth citing when
  someone argues the surface should keep a kind→actions map for convenience.
- **Linear Inbox.** Snooze hides an item until a chosen time *or new activity*
  ([Linear Inbox docs](https://linear.app/docs/inbox)). Same source as above; called
  out separately because it is the aggregation behaviour BIO needs and the one place
  a commercial tool matches the doctrine without adjustment.

**Collision.** Every inbox in this class treats clearing as personal hygiene. BIO
cannot: `NOTIFICATIONS.md` scopes handling by class — an OBLIGATION resolved leaves
everyone's list, a FINDING dismissed is an authored record act with an author and a
reason, a CONDITION acknowledged is personal only. A single "mark all as done" button
would erase the distinction, and it is the most familiar button in the category.

---

## 6 · Public-facing evidence publication

- **Wikipedia verifiability.** Documented policy: **the burden of evidence lies with
  the editor who adds the material**; quotations, challenged material and contentious
  claims about living persons require an *inline* citation that DIRECTLY supports the
  material; `{{Citation needed}}` marks an unsupported claim in place rather than
  removing it ([Wikipedia:Verifiability](https://en.wikipedia.org/wiki/Wikipedia:Verifiability);
  [Template:Citation needed](https://en.wikipedia.org/wiki/Template:Citation_needed)).
  Two things here are already taught to the general public: **a superscript marker
  means "this rests on something you can check"**, and **a visible gap marker is
  normal rather than shameful.** The second is the single best-known precedent for
  rendering `undetermined` as first-class.
- **Wikidata's `somevalue` / `novalue`.** The data model distinguishes a known value,
  an **unknown value** ("some value exists, we do not know it"), and **no value**
  ("there is positively none") — and both specials are asserted statements, not
  absences ([Wikibase DataModel](https://www.mediawiki.org/wiki/Wikibase/DataModel);
  [Help:Statements](https://www.wikidata.org/wiki/Help:Statements)). This is a named
  precedent that *undetermined is first-class and STATED* is implementable and legible
  at scale, and it also names a distinction BIO's own `undetermined` currently blurs:
  "we could not determine" and "there is none" are different claims.
- **Bellingcat.** Described (secondary sources, not vendor docs) as a show-your-work
  method: articles present their data points through links and images so a reader sees
  the same evidence the researcher saw and can decide whether it supports the
  conclusion; the organisation archives source material before it disappears
  ([Bellingcat on open-source evidence in court, 2023](https://www.bellingcat.com/resources/2023/03/28/how-open-source-evidence-was-upheld-in-a-human-rights-court/);
  [OSINT.org profile](https://osint.org/bellingcat-revolutionizing-investigative-journalism-through-open-source-intelligence/)).
  This is U12's target reading experience with an existing audience.
  What it does badly for BIO's purposes: the reader is expected to do the composition
  themselves. Nothing states the STRENGTH of the conclusion or what was excluded.
- **Perma.cc.** Built on a measured finding — roughly 70% of links in law-journal
  citations and about half in cited U.S. Supreme Court opinions no longer reached the
  cited material — and its answer is that **the act of citing captures the source**,
  returning a permanent link to the capture ([Zittrain et al., Harvard Law Review
  Forum, 2014](https://harvardlawreview.org/forum/vol-127/perma-scoping-and-addressing-the-problem-of-link-and-reference-rot-in-legal-citations/);
  [Perma.cc](https://perma.cc/)). More than 150 law journals and the Law Library of
  Congress are claimed as users. **A citation resolving to a snapshot first and the
  live URL second is an established scholarly and judicial convention** — which is
  precisely BIO's captured bytes plus hash, and it means the archive-fallback surface
  is explaining something a lawyer or editor already accepts.

---

## ADOPT — conventions members already know, and BIO should not re-teach

1. **Backlinks on the cited thing.** "What relies on this" displayed where the cited
   item lives (Obsidian backlinks pane; Zotero's jump-back-to-page). U3 already ships
   `load-bearing-for` from reverse citations; keep it and extend it to inquiries.
2. **Note/annotation visibility as a colour-coded property of the note** (DocumentCloud
   private/organization/public). Maps onto D-15's three visibility positions and the
   two-bucket fence without inventing vocabulary.
3. **Inbox grouped by the member's unit of work, each item carrying its reason**
   (GitHub group-by-repository plus reason labels). DEC-10's group-by-case and the item
   contract's `basis` are the same shape; members will not need to learn it.
4. **Snooze that returns on a date OR on new activity, whichever is first** (Linear).
   Exactly the standing-entry re-notify rule v0.2 already specifies.
5. **Producer-declared options rendered by the surface** (GitHub Checks API `actions`
   / `requested_action`). Cite this when the surface is tempted to keep its own
   kind→actions map — the drift UI-PLAN already measured against `op=searchfields`.
6. **Status names that say whose move it is** (MuckRock: Awaiting Acknowledgement /
   Awaiting Response / Completed). `action.awaiting_response` already matches; extend
   the naming discipline to the rest of the lifecycle.
7. **A citation resolves to the capture first** (Perma.cc, adopted by 150+ law journals
   and the Law Library of Congress per its own claim). Makes the archive fallback and
   grade C legible instead of exotic.
8. **A defined catalogue entry before a category is applied, and a recorded change to
   the definition** (NVivo codebooks and coding audit trails). This is the `C-`/`N-`
   discipline; the survey confirms it is a convention researchers already expect.
9. **A visible gap marker in published text** (`{{Citation needed}}`; Wikidata
   `somevalue`/`novalue`). The public already reads "unsupported here" as ordinary.
10. **Assembling a member's OWN prior annotations into a note** (Zotero "Add Note from
    Annotations"). Permitted precisely because it generates no new words.

## DELIBERATELY VIOLATE — where the familiar shape breaks doctrine

Each of these is a convention a member will expect and must not get. Framed as
defects-if-adopted, not trade-offs.

1. **No narrative drafting surface** (violates Everlaw Storybuilder Drafts). The tool
   may hold facts, order them and show what backs them; it may not help compose the
   argument. `BIO_Case_Making_v0_1.md` §4a; the prefill rule extended from a field to
   a whole argument.
2. **No generated justification, reason, template or suggested wording anywhere**
   (violates Relativity's automated privilege-log generation from templates, and every
   "suggested reason" affordance in the category). A justification is read later as
   that member's own act; a generated one is a fabricated attribution.
3. **No single confidence score** (violates predictive-coding/relevance-score
   conventions). Strength is weakest-link over graded legs, and an `undetermined` leg
   must remain visible as undetermined rather than being smoothed into a number.
4. **No connection-density or centrality ranking, and no graph view that rewards it**
   (violates i2's social-network metrics and Obsidian's graph view). Connectedness is
   a property of the drawing, not evidence. Where BIO must draw edges, the grade
   travels with the edge and an ungraded edge renders as `undetermined`, not as a
   thinner line that reads as weaker-but-real.
5. **Machine-proposed connections are never presented as connections** (violates
   Obsidian's unlinked mentions sharing a pane with authored links; softens Aleph's
   cross-reference results). D-82: a derived thing must LOOK derived, because what the
   member needs to know is that nobody has judged it yet.
6. **No severity ladder and no unread badge as the primary signal** (violates
   GitHub/Jira convention). `NOTIFICATIONS.md` already ruled classes over severities;
   a count is a volume proxy and volume is not meaning.
7. **No "mark all as done"** (violates GitHub's Done and every inbox like it).
   Handling has a SCOPE that differs by class: a dismissed FINDING is an authored
   record act with a reason; only a CONDITION may be cleared personally and silently.
8. **The exclusion statement points at its author, not away from them** (inverts the
   privilege-log convention). A privilege log protects the withholder; a case's
   exclusion statement is the authored, never-prefilled admission of what was left out
   — the enforcement point for invariant 7.
9. **Publishing is not a toggle** (violates the CMS/`published: true` convention, and
   the D-127 pass explicitly rejected `finding.published = true`). Ratification is
   attested, irreversible and ceremonial — the top rung of the weight ladder, felt
   differently from every other act.
10. **A technical complication is never a choice, and never a retry spinner**
    (violates the generic "something went wrong — retry?" convention). A paced
    governor, a subrequest ceiling, a CID-font PDF: the system classifies it and shows
    status where the thing lives. UI-PLAN "Who this is for"; `NOTIFICATIONS.md` rule 4.

---

## Where the survey found NO precedent

Worth recording, because these are the parts that cannot be borrowed and will
therefore cost the most to design and to teach:

- **A completeness claim as an authored, published field.** Privilege logs are the
  nearest thing and they run the other direction. Nothing in this survey asks an
  author to state what they left out of an argument.
- **Strength composing along a basis chain**, where a case built on a case cannot be
  stronger than the case beneath it. Everlaw links facts to evidence; nothing computes
  over the link.
- **A published conclusion that is an INPUT to the next inquiry** rather than a
  terminus. Perma.cc makes a citation durable; no tool here makes a published case
  citable as basis with its strength inherited.
- **One object that renames through its lifecycle** (inquiry → finding → case). Every
  tool surveyed uses separate types for question, note and publication.

## What would falsify the recommendations above

Cheap tests, in the spirit of the v0.2 falsification note:

- If **U9 triage** ships with producer-declared options and the surface still needs a
  local kind→actions map for anything, adopt-item 5 was wrong or the item contract is
  under-specified.
- If members ask "which of these is most urgent" of a class-sorted queue often enough
  to matter, violate-item 6 has a cost worth naming — the answer is still not a
  severity ladder, but the queue needs an ordering rule that is not volume.
- If the first published case's exclusion statement is empty or boilerplate across
  several cases, violate-item 8 is being satisfied formally and not substantively,
  and the gate is doing nothing.
