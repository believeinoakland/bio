# Draft: governed filing templates, and the local calendar and offices

**Status** · DRAFT by a design-drafting worker for BOB, 2026-10-01, on `tranche/T20`, from K903 (6) (Bob's direction), N-A14 (`build/plan/action-fold/t18-entries.md`, "Not in T18"), K613 (3), K701 (3) and `filings` R26 as built. For Bob's approval: the requirements and UX are his (P5, P17); the module split is architecture, also his, with BOB's recommendation. Nothing here is built; until Bob approves, the first profile prepares no filing (`KIND_NO_TEMPLATE`), as today.

**Bob's direction (K903 (6), verbatim):** "A filing's wording is not to be taken lightly. It's important that it be optimally accurate, appropriate, and compelling. A member may be able to compose the wording, but most will need support, either from the assistant or professional. Reducing a response down to a template is an additional challenge. So who generates a template, when, and associated notes and comments should be associated with every template. (There may eventually be a means for CivicOS groups to share templates.) You can research and provide holidays and office hours of a jurisdiction (with a process for confirming them). But I think that templates need a more formalized authoring, approval, and attribution process."

## What exists today (measured on `tranche/T20`)

- **Two places a template can come from, neither governed.** (a) The profile: `jurisdictions` R25's `template` on an `action_kinds` entry, plain text with a `basis`; the first profile holds none (N-A14). (b) The group's library: `filings` R26 (`templateSave`, `templatesFor`, built, `bio-plane/src/filings/index.mjs`:1271): a member keeps an approved filing draft, or an edit of it, as a named template for a kind. It records the saver and time and nothing else: no version, review, approval, notes, comments, contributors, retirement, or record of which template a filing used.
- **Holidays**: `jurisdictions` R33 holds `holidays: [{year, days, basis}]`; the first profile has none, so every business-day count is undetermined (`action-clocks` R2, `filings` R9). **Office hours**: no field anywhere; no profile holds a time zone.
- **A basis** (`jurisdictions` R2) names a measurement (`M-<n>`), a ruling, or `UNMEASURED`. Nothing records whether a fact was confirmed by anyone, or when it should be checked again.

## 1. Filing templates as governed records

### What a template is

A **template** is wording a group may file in its own name, with named blanks (`{{name}}`, the closed set `filings` publishes) that `filingPrepare` fills from the record. It serves **one action kind** (`jurisdictions` R25, never a Tier 3 kind) and is written for **named jurisdiction profiles** (its wording cites their law and venue). It carries **notes** (when to use it, when not, what the wording relies on, cautions) and a **comment thread**, and it has a full **history of who made it and who vouched for it**.

A template has **versions**. Each version is fixed text with its SHA-256; it is never edited. Changing the wording makes a new version, which goes through the lifecycle again.

### Lifecycle of a version

| state | how it gets there | who may do it |
| --- | --- | --- |
| **draft** | a member starts one: from nothing, from an approved filing (today's `templateSave` path), from another template's version (a derivative), or by adopting an assistant's proposal | a member only. The assistant **proposes** wording (a labelled machine proposal, D2, `record-grammar`'s `proposalLabel(…, "template")`); a member adopts it into a draft, and the adoption names the run |
| *(draft revised)* | the draft's text changes; each revision is kept with its author | members; the assistant only by a further proposal a member adopts |
| **in review** | a member submits a fixed text (its SHA) for review, naming the reviewers asked | a member |
| **reviewed** | each review is recorded against that SHA: reviewer, kind, scope, outcome (`no concerns`, `concerns`, `changes requested`), comments, date | a member reviewer, or a **professional reviewer** (below). The assistant may give a labelled machine critique that is shown, but it never counts as a review |
| **approved** | the approver records approval of exactly the reviewed SHA | a member who holds approval for the template's scope (Q2), **not the version's sole author** (Q3), after the reviews the tier requires (Q4) |
| **superseded** | a later version of the same template is approved | automatic when the next version is approved; names the successor and why |
| **retired** | withdrawn from use, with a reason | an approver of its scope |

Also: a draft or a version in review may be **withdrawn** by its author (kept, never deleted). Any text change after a review makes a new version: reviews never carry over to text they did not read.

**Only an approved, current version is offered by `filingPrepare`.** A preparer may name an older approved (superseded) version only explicitly, and the filing then says so. A retired version is refused.

### The professional reviewer

Most groups will want a lawyer or other professional to read a template. Many will not be members. The design reuses the **review copy's** grant pattern (`review` R6–R10): a member grants a named person a revocable read-and-comment link to one version; the person's review is recorded as `kind: professional`, with the **name, organisation, and credential as they state them** (for example a bar number), the scope they say they reviewed for ("legal sufficiency under <profile>'s law", "plain language", …), the outcome and the date. CivicOS records what was stated and does not verify a credential; the template shows it as stated. A member with declared expertise (`membership`) may review as a member; their expertise is shown with the review.

### Attribution held on every version

- **authored by**: the member who made the version, and when;
- **contributors**: each member who revised it, and each assistant run whose proposal a member adopted (`run id`, model, skill pack version, what it proposed), each dated;
- **derived from**: the filing, template version or proposal it started from;
- **reviews**: as above;
- **approved by** and when; **superseded by** / **retired by**, when and why;
- **serves**: kind, tier at approval, profile ids, locale;
- **notes**: written by members on the version (and carried forward to a new version for its author to keep or change);
- **comments**: a thread on the template, each comment naming its version, its author (member, professional reviewer through the grant, or a labelled assistant run) and its date.

Every name is held **by value** as well as by member id (handle at the time, and organisation for a professional), so the history still reads when the template leaves this instance (sharing, below) or a member leaves.

### What a filing records

A filing draft prepared from a template records `template: {id, version, sha, origin}` (`origin`: `profile` or `group`, later `imported`). `filingsFor` and the filing's page show it with the version's approval and reviews. If the version is later superseded or retired, the filing is **flagged** (it is not changed, and approval is not refused): "prepared from version 3, since retired: <reason>". The approved and sent bytes are the member's (`filings` R6), whatever the template said.

### Templates in the profile

A profile's template is local wording shipped with the product, so it must carry the same history. Recommendation (Q1): a profile `template` entry carries `{id, version, text, sha, notes, authored_by, contributors, reviews, approved_by, approved_at, basis}`, approved through the build (a Bob ruling, `K<n>`, or a reviewer Bob names); on each instance it appears in the library as an approved template of origin `profile`, read-only. A group never edits it; it may make a derivative, which is the group's own template with its own lifecycle.

### Room for sharing between groups (not built now)

Nothing is built for sharing. The design keeps the door open by: (1) ids that are opaque and never counters, so imports cannot collide; (2) attribution held by value, with the text's SHA; (3) an `origin` field (`profile`, `group`, and later `imported` with the giving group and its signature); (4) one rule stated now: **an imported template arrives as a draft of the receiving group's**, its whole history kept and read-only, and it is used only after the receiving group's own review and approval. How a receiving group sees the giver's trust is DEC-93's question (the five trust levels), not this design's.

## 2. The local calendar and offices

### What is recorded

- **Holidays** (`jurisdictions` R33, existing): per year, the days the offices close. Recommend per office where they differ (a county office closes on days the city's does not): `holidays` gains an optional `offices` (counterparty roles it applies to); absent, it applies to all.
- **Office hours** (new): on a counterparty (R24) or a venue (R25), `hours: {weekly: [{day, open, close}], closed_note?, basis}`, and the profile's `time_zone` (an IANA name), which hours and a "received after close" rule need.
- **Every such fact's source**: its `basis` names a measurement entry (`M-<n>`, `docs/development/measurements/`) which holds the source's address and title, the publisher (the jurisdiction's own page, administrative code, labour agreement, or posted notice), the **retrieval date**, the words quoted, and the capture's SHA-256 where captured.

### How BOB's workers research

1. A worker searches the jurisdiction's **own** publications first (official holiday schedule, municipal or county code, labour agreements, the office's contact page); secondary sources only to find the primary one.
2. Each fact gets one measurement entry (above). Conflicting sources are recorded, both, and the fact is left out (undetermined) until a ruling or a member resolves it.
3. The profile is written with basis `M-<n>` and **status `researched`**. A worker never states a fact it could not source; a year not published is not guessed (`R33`: a year listed is complete, so it is listed only when complete).

### Confirmation

A researched fact is **unconfirmed** until a member confirms it on their instance:

- **Who**: a member (never a machine). The assistant may re-check the source and propose "unchanged" or "changed", labelled; a member decides.
- **How it is recorded**: confirm, correct, or dispute, with `how` (checked the official page at an address, called the office, visited), the date, and for a correction the corrected value with its source. Kept with attribution; nothing is overwritten.
- **What deadline computations say** (`action-clocks` R2, `filings` R9):
  - confirmed: computed, as today;
  - **unconfirmed**: computed, and stated "counted on an unconfirmed calendar (researched from <source>, <date>)";
  - disputed, conflicting, or a year not listed: **undetermined**, with why.
- **Correction on one instance** (Q6): recommend the member's correction governs that instance's counts, marked "corrected locally by <member>, <date>", and is reported upstream for a profile fix.
- **Re-confirmation**: each confirmation lapses (a year's holidays when the next year's schedule is due, recommend 1 November of the year before; office hours after 6 months, Q7), and lapsed reads as unconfirmed. One queue item per lapsed fact a member's action depends on, raised once and never repeated unless the member asks (DEC-94). A filing returned because an office was closed is a reason to dispute.

## 3. Where it lives

Architecture is Bob's (P17). BOB's recommendation:

- **New module `filing-templates`, layer 9, between `action-clocks` and `filings`.** It owns templates, versions, notes, comments, reviews, grants, approvals and retirement, and the import from the profile. `filings` reads it: `filings` R26 (`templateSave`, `templatesFor`) **moves** to it (filings R26 retired with a pointer; the built code moves, P18). Why not inside `filings`: `filings` is already 1,876 lines (`bio-plane/src/filings/`, measured) with nine services; this adds about eight acts and five tables; one session should read a module whole (P6).
- **New module `local-facts`, layer 9, first (before `standards`).** It holds members' confirmations, corrections and disputes of any profile fact, keyed by the fact's path, starting with holidays and office hours, and answers each fact's status. `jurisdictions` stays layer 1 and pure data (it gains the fields only); `action-clocks` and `filings` read the status. Generic by key so any `UNMEASURED` fact (an office, a deadline) can later be confirmed the same way.
- **Changes in existing modules**: `jurisdictions` (fields), `record-grammar` (the `template` proposal subject), `filings` (records the version used, reads only approved versions), `action-clocks` (status in counts), `queue-producers` (two OBLIGATION kinds), `skills` (the drafting layer), `affordances` and `control-plane` (the new ops).

### Requirement clauses, drafted

Ids continue each file's numbering; before Bob's approval a draft may renumber (README rule 6).

**`filing-templates` (new; R-numbers from R1)**

- **R1** A template is `{id, kind, profiles, name, scope, versions}`, `id` an opaque `TPL-` id (never a counter); `kind` an `action_kinds` kind of every named profile, not of Tier 3 in any (`TEMPLATE_TIER3`); `profiles` a non-empty list of profile ids; `scope` the project it belongs to, or `group` (Q2).
- **R2** A version is `{template, version, text, sha, state, notes, author, contributors, derived_from?, reviews, approved?, ended?}`. `version` counts from 1 within its template. `text` is non-empty UTF-8 within `filings`' length bound, every `{{name}}` a blank `filings` publishes (else `TEMPLATE_BLANK_UNKNOWN`, naming it). `sha` is the SHA-256 of `text`. A version's text never changes after it is created.
- **R3** `templateDraft({template?, kind?, profiles?, name?, text, from?, notes?, author, viewer})` creates a template's first draft, or a new draft version of an existing one. `from` is one of: an approved filing draft (`filings` R6), a template version, or a proposal (R6). Only a member: a machine or unstamped author is `MACHINE_CANNOT_DRAFT_TEMPLATE`. A template with a draft or in-review version open is refused `TEMPLATE_DRAFT_OPEN`, naming it.
- **R4** `templateRevise({version, text, author, viewer})` replaces a draft's text by a new revision, keeping every earlier revision with its author and time; the version's `sha` is its latest revision's. Refused `NOT_A_DRAFT` for a version past draft, and for a machine as R3.
- **R5** `contributors` lists, in time order, every member who revised the version and every adopted proposal's run (`run`, model, skill pack version, the proposal id), each dated. It is written by R3, R4 and R6 and by nothing else.
- **R6** `templatePropose({template? | kind, text, why, proposer, viewer})`: any credential may propose wording, stored apart, labelled `proposalLabel(proposer, "template")`, `why` at most 1,000 characters; it is a template only when a member names it as `from` in R3 or adopts it in R4 (`adopt: proposal`), and then its run joins `contributors`.
- **R7** `templateSubmit({version, reviewers, author, viewer})` moves a draft to `in_review`, fixing its `sha`. `reviewers` names members, or professionals by a grant (R8); empty is `NO_REVIEWERS`.
- **R8** `templateReviewGrant({version, recipient, organisation, fingerprint, by, viewer})` gives a non-member a revocable read-and-comment door to one version, as `review` R6–R10 do for a review copy (the dead answer, byte-identical, for every other caller). Revocation as `review` R7.
- **R9** `templateReview({version, outcome, scope, comment?, credential?, reviewer | grant})` records one review against the version's `sha`: `outcome` one of `no_concerns`, `concerns`, `changes_requested`; `scope` the words the reviewer gives (1–200 characters); `credential` as the professional states it, shown as stated, never verified. A machine is `MACHINE_CANNOT_REVIEW`. A review of a `sha` that is not the version's is `REVIEW_STALE`.
- **R10** `templateApprove({version, by, viewer})` refusals in order: `MACHINE_CANNOT_APPROVE`; `NO_SUCH_TEMPLATE` (absent or invisible, one answer); `NOT_IN_REVIEW`; `NOT_AN_APPROVER` (the scope's approval right, Q2); `APPROVER_IS_AUTHOR` (the approver is the version's author and its only contributor, Q3); `REVIEWS_INSUFFICIENT` (the tier's required reviews, Q4, are not all `no_concerns`, or a `changes_requested` stands). On success the version is `approved`, the previous approved version `superseded` with its successor named.
- **R11** `templateRetire({template, version?, reason, by, viewer})` retires a version or the whole template, `reason` 1–500 characters, by an approver of its scope.
- **R12** Notes: each version carries `notes` (at most 8,000 characters, each edit kept with its author and time) until it leaves draft; after that, notes are added, never changed. A new version starts with its predecessor's notes, marked as carried.
- **R13** `templateComment({template, version, text, author | grant, viewer})`: 1–4,000 characters, attributed to the member, the grant, or a labelled run; `templateComments` reads them, newest last, capped as `review` R14.
- **R14** `templatesFor({kind?, profile?, state?, viewer})` lists the templates the viewer may see with each version's state, author, approver and review summary; by default only approved current versions. `templateRead({template, version?, viewer})` answers one version with its whole attribution (R2, R5, R9, R10, R12) and the thread's count.
- **R15** The profile's templates (`jurisdictions` R40) are read as approved versions of origin `profile`, with the attribution the profile carries; no act of R3–R11 applies to them except R3 with `from` (a derivative) and R13.
- **R16** Every name in attribution is held by value (the handle, or a professional's name and organisation, at the time of the act) beside the member id.
- **R17** Nothing is deleted. Templates, versions, revisions, notes, reviews, grants, comments, approvals and retirements are append-only and declared to purge (K23).
- **R18** No place, law, venue or template wording is in the module's behaviour or outward text; the tests use the test profile.

**`jurisdictions`**

- **R40** An `action_kinds` entry's `template` (R25) is `{id, version, text, notes, authored_by, contributors, reviews, approved_by, approved_at, basis}`: `authored_by` and `approved_by` non-empty names; `reviews` `[{reviewer, kind, organisation?, scope, outcome, at}]`; `approved_at` a date; `basis` a ruling (`K<n>`) or `TEST`. A template text without attribution is `TEMPLATE_UNATTRIBUTED`. (Amends R25; R28's codes gain it.)
- **R41** `time_zone`: `{value, basis}`, an IANA time-zone name (`VALUE_INVALID` otherwise). One value per key (R15).
- **R42** A counterparty (R24) or a venue (R25) may carry `hours`: `{weekly: [{day, open, close}], basis}`, `day` one of `mon`–`sun`, `open` and `close` `HH:MM` with `open` before `close`; a day not listed is closed. Absent, the office's hours are undetermined (R27). `HOURS_INVALID` otherwise.
- **R43** A `holidays` entry (R33) may carry `offices`: counterparty roles it applies to; absent, all. A business-day count for an office uses the years that apply to it.
- **R44** Every holiday year, `hours` and `time_zone` carries `status`: `researched` (basis a measurement, `M-<n>`) or `ruled` (basis a ruling). The measurement entry names the source's address, publisher, retrieval date and the words relied on.
- **R45** The test profile supplies R40–R44, including a holiday year applying to one office only.

**`local-facts` (new; R-numbers from R1)**

- **R1** `factConfirm({path, act, how, value?, source?, by, viewer})` records a member's `confirm`, `correct` or `dispute` of the profile fact at `path` (a closed set of paths: a holiday year, an office's hours, the time zone). `how` 1–500 characters; `correct` needs `value` (valid as the profile's own field) and `source`. A machine is `MACHINE_CANNOT_CONFIRM`; an unknown path `NO_SUCH_FACT`.
- **R2** `factStatus({path})` answers `confirmed`, `unconfirmed`, `corrected`, `disputed` or `absent`, with the latest act's member, date and `how`, and the value that governs on this instance (the profile's, or the correction's, Q6). A confirmation lapses at its fact's horizon (R3) and then reads `unconfirmed`, naming the lapsed confirmation.
- **R3** Horizons: a holiday year's confirmation lasts until that year ends, and a year not confirmed by 1 November of the year before is due; an office's hours lapse 183 days after confirmation (Q7).
- **R4** `factsDue({viewer})` lists the facts unconfirmed or lapsed that a live action's clock or deadline reads, once each.
- **R5** Append-only; nothing overwritten; every act names its member and date. A machine may propose (`proposalLabel`) that a source is unchanged or changed; it never confirms.

**`action-clocks`** (amends R2)

- **R10** A `business` count, and a count that depends on an office's hours, states the calendar's `status` from `local-facts` R2: computed with "counted on an unconfirmed calendar (<source>, <date>)" when `unconfirmed`; computed with the correcting member named when `corrected`; `undetermined` with why when `disputed` or `absent`.

**`filings`**

- **R26** *(retired: moved to `filing-templates` R3, R14; K<n>)*
- **R27** `filingPrepare` (R1) takes `template: {id, version?}` and uses only an approved version; an older approved version only when named, and the answer says it is superseded; a retired version is `TEMPLATE_RETIRED`. With none named, it uses the current approved version for the kind and profiles: the group's if one exists and the preparer chose it, else the profile's; neither is `KIND_NO_TEMPLATE`.
- **R28** Every filing draft records `template: {id, version, sha, origin}`; `filingsFor` (R13) shows it with the version's approver and reviews, and flags a draft whose version was later superseded or retired, naming why. Nothing in the draft changes.
- **R29** R9's deadlines state the calendar status as `action-clocks` R10.

**`record-grammar`**

- **R42** `PROPOSAL_STATES` gains `template` (R38's form).

**`queue-producers`**

- **R20** OBLIGATIONs `template-review-requested`: one per review a member is named for and has not given (`filing-templates` R7).
- **R21** OBLIGATIONs `local-fact-due`: one per fact `local-facts.factsDue` answers, raised once, never repeated unless the member asks (DEC-94).

**`skills`**

- **R30** An `authored` layer `filing_drafting`, `load_when` "the run proposes a filing template's wording or critiques one": the clauses the run works under (it proposes, never decides; it states its sources; it names blanks only from `filings`' set; it flags wording that asserts a fact the record does not hold).

## 4. Open questions for Bob

1. **Should profile templates exist, or should every template be the group's?** Recommend: keep both. The profile's are the starting library, approved through the build by you or a reviewer you name, and shipped with their history. A group may copy one and adapt it as its own.
2. **Who may approve a template: the project's owner, or an administrator for the whole group?** Recommend: by default a template belongs to the project that made it, and the project's owner approves. Making it group-wide is a second approval, by an administrator.
3. **May the author approve their own template?** Recommend: no. Someone other than the sole author must approve.
4. **What review is required before approval?** Recommend: Tier 1 needs one member review with no concerns. Tier 2 needs a professional review with no concerns, or an approver's written reason for going without one. That reason is shown wherever the template is.
5. **Do professional reviewers have to be members?** Recommend: no. A member sends them a private, revocable link to one version. Their stated credential is shown as they stated it and is never verified.
6. **If a member corrects a holiday or office hours on their instance, does the correction govern there?** Recommend: yes, on that instance only. It is marked with who corrected it and when, and it is reported to us so we can fix the profile.
7. **How often must the calendar and office hours be re-confirmed?** Recommend: each year's holidays by 1 November of the year before, and office hours every six months. Each is one reminder, not repeated unless asked.
8. **May deadlines be counted on an unconfirmed calendar?** Recommend: yes, clearly marked "unconfirmed" with its source and date. Disputed or missing facts make the deadline undetermined.
9. **The two new modules** (`filing-templates`, `local-facts`). Recommend: approve both as placed above; they are architecture, which is yours.
10. **Which tranche?** Yours. Recommend: the requirements in the next tranche to open. The first profile's research (holidays, hours, time zone) can be done by a BOB worker as soon as you approve §2. Its first templates come only from the approval process here.
