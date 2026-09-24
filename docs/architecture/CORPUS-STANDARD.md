# The design corpus standard

**Status** · v0.2, written 2026-09-14 by session BOB #10 at Bob's direction the same day; §6 and §7 extended 2026-09-16 by M0-43. This is the standard every design document in this repository is held to: what the corpus is, which levels it has, and the FRONT MATTER every document carries so that a reader can tell, without reading the body, what the document is, where it sits, how complete it is, and what it still lacks. The rules are Bob's (§1); the grammar and the checker that enforces it (`tools/corpuscheck.mjs`, run by `plancheck`) are the mechanism, and the mechanism is this session's. v0.2 closed the hand-kept half: §5's table was correct with nothing making it stay correct, so §6 now carries a MACHINE-READABLE exclusion table and an UNDECIDED table, and the checker walks `docs/development/` and fails by name on a file that is in none of the three. Complete at its level for what it governs today; §6 names what it does not govern, and its UNDECIDED table names the three files nobody has classified. **§4 GAINED AN EIGHTH RULE AND §7 A SECOND HALF ON 2026-09-17 (M0-57), ON BOB'S RULING THE SAME DAY THAT `BIO_System_Design.md` §3 IS THE SINGLE AUTHORITY ON DESIGN STATUS**: a to-do list may point at a construct's status but may never restate it, and `corpuscheck --authority` refuses the restatement. **§7 states that arm's reach and its bounds together, deliberately** — the arm is narrow, it judges only a piece a §3 row cites by item number, and a checker believed to cover more than it does is the exact failure §4.8 exists to prevent. **§5 gained `MEMBER-KNOWLEDGE-DESIGN.md` on 2026-09-18 (BOB #14, `376e8551`); this date moved by CONDUCT #4 as the deterministic repair of a red bare `plancheck`.** §6 gained `WORK-PIPELINE.md` as a process document on 2026-09-18 (BOB #15). §6 gained `BACKLOG.md` as a ledger on 2026-09-18 (LED-6, which created it empty). §6 gained `TREE-SHARING.md` as a process document on 2026-09-22 (BOB #26, on Bob's ruling that day). §6 gained `measurements/*.md` and `interface-changes/*.md` as ledgers on 2026-09-23 (M0-100: one file per entry; the two old ledgers frozen history). as of 2026-09-24.

**Place in the system** · This document governs the FORM of the design corpus, not its content. It sits beside `README.md` (the catalog of documents) and above every document in `docs/architecture/` and the design documents it lists in §5, all of which must satisfy it. `BIO_System_Design.md` is the level-0 document this standard requires to exist; `tools/corpuscheck.mjs` is its enforcement; `tools/plancheck.mjs` runs that enforcement before every push.

**Incomplete sections** ·
- §5 — the design documents under `docs/development/` are listed and the governed table grows as each is retrofitted (an act per owner, routed through the queue); the "Not yet governed" table below is the live frontier and is the only place the remainder is counted, deliberately, because a count carried in this prose goes stale the moment an owner lands a retrofit. **That table is EMPTY as of 2026-09-14** — SK-6 landed the last retrofit — so §5 is complete for the corpus as it stands today and incomplete only in the sense that it grows: the section is kept on this list because a new design document arrives owing front matter and the frontier reopens with it.
- §6 — whether the ledgers (`DECISIONS.md`, `DEBT.md`, `QUEUE.md`, `MEASUREMENTS.md`) should carry a variant of this front matter is not decided; they are append-only registers with their own hygiene checks and are deliberately outside this standard for now. **AND ITS UNDECIDED TABLE IS INCOMPLETE BY CONSTRUCTION AND SAYS SO:** three files under `docs/development/` are classified by nothing and are listed there with the question each poses rather than assigned a class, because which files are governed is this document's decision and Bob owns it. D-388 is the row that drains them; the section is complete only when that table is empty.

**Contents**
- [1. Why this exists — Bob's ruling of 2026-09-14, and the receipt](#1-why-this-exists-bobs-ruling-of-2026-09-14-and-the-receipt)
- [2. The levels](#2-the-levels)
- [3. The front matter](#3-the-front-matter)
- [4. The rules that keep it current](#4-the-rules-that-keep-it-current)
- [5. Governed documents outside docs/architecture](#5-governed-documents-outside-docsarchitecture)
  - [Not yet governed — design documents that owe front matter](#not-yet-governed-design-documents-that-owe-front-matter)
- [6. What this standard does not govern, and why](#6-what-this-standard-does-not-govern-and-why)
  - [Undecided — files the walk found that nobody has classified](#undecided-files-the-walk-found-that-nobody-has-classified)
- [7. How the checker works, in one paragraph](#7-how-the-checker-works-in-one-paragraph)

---

## 1. Why this exists — Bob's ruling of 2026-09-14, and the receipt

Bob, 2026-09-14, on realising that the content construct had never been completed while
the member surfaces were about to be designed on top of it:

> *"The design corpus should be a set of documents that describe the system across
> levels. High-level design documents must describe the system broadly — but completely
> at that high level. Each major construct within that high-level design should be
> described in appropriate detail in a separate document for each high-level construct.
> The high-level description of each system construct should be rich enough for a reader
> to understand the construct's place (importance, relationship, etc) in the overall
> system. Each document, whether high-level or below, should include a self-description
> of its completeness, a table-of-contents, and a list of sections from the TOC that are
> still being developed (are incomplete). Incompleteness should be explicit, not assumed
> as derivable. All of this 'front matter' content should always be up to date for that
> document. The TOC should allow a development lane reacquainting itself with the system
> or construct of the system to surgically scan the TOC to find what it wants to know
> without having to inhale the entire document into its context window."*

**The receipt, measured from the record.** `BIO_Content_Framework_v0_10.md` was written
and approved on 2026-07-30 and then not touched, except for two incidental sweeps, until
2026-09-14 — 46 days — while DEC-23, DEC-24, the DEC-4 amendment and the whole extraction
build ruled and built content doctrine elsewhere. Its status line read *"supersedes
nothing yet"* and *"written to be extended rather than to be complete"*: an admission of
incompleteness that named nothing. The parked D-164 gap lived in `QUEUE.md` and in
`kickoffs/BOB.md`, not in the document that owned the construct. Until 2026-09-14 only two
files in the orientation set cited the framework — `README.md`, which filed it seventh
under "Design and doctrine" as "the extraction substrate", and `CONSTRUCTS.md` — while
`CLAUDE.md`, `MILESTONES.md` and every kickoff pointed at `STORE-AS-CACHE.md` and the
ledgers. And no architecture document carried a table of contents: zero of sixteen, so
sessions read `CLAUDE.md`'s three-sentence summary because a 2,000-line document could not
be scanned. Three failures, one cause: **a document could not say what it lacked, the
corpus had no level that placed it, and doctrine landed in ledgers rather than in the
construct's home.** This standard closes all three, and `corpuscheck` keeps them closed.

## 2. The levels

| level | what it is | documents | rule |
| --- | --- | --- | --- |
| **0 · the system** | one document describing the whole system broadly and COMPLETELY at that altitude: purpose, the path it serves, every major construct named with its importance, its relationships and its home document, and the runtime shape | `BIO_System_Design.md` | every major construct in the system appears here or it is not a major construct; every construct row names a level-1 home document |
| **1 · a construct** | one document per major construct, rich enough at its top to place the construct in the system, detailed enough below to build from | the `BIO_*` documents in `docs/architecture/` | a level-1 document is the AUTHORITY for its construct; a ruling about the construct is folded into it, not only recorded in a ledger |
| **2 · a design or study** | a design for part of a construct, a design-space study, a research note that a decision rests on | the design documents under `docs/development/` listed in §5 | governed once listed; a level-2 document names the level-1 document it serves in its Place in the system |
| **the mission** | the values, principles and requirements the system exists to satisfy | `BIO_Complete_Roadmap_v5.md`, `BIO_Design_Requirements_v2.md` | governed as level 1 by form; they own no construct, they own the constraints |
| **the ledgers** | append-only registers of state — decisions, debt, the queue, measurements, claims, interfaces | `docs/development/{DECISIONS,DEBT,QUEUE,MEASUREMENTS,CLAIMS,INTERFACES,INTERFACE-CHANGES}.md` | NOT governed by this standard (§6); each has its own hygiene check in `plancheck` and the battery |

The distinction that matters between a level-1 document and a ledger: **a ledger records
that something was decided; the construct's document says what the construct IS once the
decision is folded in.** `DECISIONS.md`'s `enacted:` line already has to name a document
that now carries the reasoning (`plancheck` refuses one that does not); under this
standard that document is the construct's home, and the fold updates the home's front
matter in the same commit.

## 3. The front matter

Every governed document begins with its title heading and then, before any other
heading, exactly these four fields in this order, closed by a `---` line:

```
# <Title>

**Status** · <what this document is; version and date as it states them; who approved
or ruled it and when; its completeness in plain words — complete at its level, partially
complete, draft, superseded (by what); the one caveat a reader who has not lived in the
repo needs; and, ONCE and LAST, the words "as of YYYY-MM-DD">

**Place in the system** · <which construct or level this document owns; which documents
depend on it and which supersede parts of it; why it matters>

**Incomplete sections** · None — <how that was established>
    OR a bulleted list follows, one bullet per section that is incomplete, stale,
    draft, superseded or describes a runtime that no longer exists:
- §<section number, or words from the heading> — <what is missing or stale>, <evidence>

**Contents**            OR   **Contents** (depth 2)
- [<heading>](#<slug>)       generated by `node tools/corpuscheck.mjs --write <file>`
  - [<subheading>](#<slug>)  from the document's own headings, levels 1–3 by default

---
```

What each field is FOR, so the prose is written to the purpose rather than to the grammar:

- **Status** answers *"can I rely on this, and how much?"* It must say the completeness
  in one of the plain words above, never leave it to be inferred from a version number,
  and it must carry `as of YYYY-MM-DD`. The checker refuses a Status whose date is
  earlier than the file's last commit: **a body edit that leaves the front matter behind
  is exactly the staleness this standard exists to catch**, and the cost of compliance is
  one date. **That date appears EXACTLY ONCE, is the LATEST, and sits at the END of the
  Status** — the checker reads the FIRST `as of` and refuses a second, because a Status with
  two is judged on the date a reader is least likely to think of as the date while the
  trailing one they do bump is read by nothing (M0-28, from SK-6's sweep: three governed
  documents carried two, benign only because the two were equal); a date written any other
  way — "measured 2026-08-01" — is not an `as of` and is untouched, so the Status may still
  say when a measurement was taken.
- **Place in the system** answers *"why would I read this, and what else must I read?"*
  It names the construct or level owned, the documents that depend on this one, and the
  documents that supersede parts of it. A level-2 document names its level-1 home.
- **Incomplete sections** is the honest frontier, stated where a reader looks first.
  Every bullet names a section that exists (the checker resolves `§14.6`, `§18`, `§Function
  2`, `§What is missing` against the headings; `§header`, `§footer`, `§preamble`, `§whole
  document` name the document's own matter). *"None"* is legal only with how it was
  established. **A section marked incomplete here and nowhere else is still correctly
  marked; a section incomplete in fact and unmarked here is the defect.**
- **Contents** is generated, never hand-maintained, and must equal the body's headings —
  the checker fails on the first divergence and prints the command that fixes it. It is
  what lets a lane scan a 2,000-line document for the one section it needs.

## 4. The rules that keep it current

1. **A landing that changes a construct updates its home document's front matter in the
   same commit** — the Status date at minimum, the Incomplete list whenever a section was
   completed, superseded, or added. `corpuscheck` enforces the date; the reviewer enforces
   the honesty.
2. **A ruling about a construct is folded into the construct's home document**, and the
   `enacted:` line in `DECISIONS.md` names that document. Recording the ruling only in a
   ledger is the failure §1 measured.
3. **A new major construct gets a level-1 document and a row in `BIO_System_Design.md`
   in the same landing.** An area may not be ACTIVE without a kickoff (ORCHESTRATION rule
   7); a construct may not be built without a home.
4. **Contents is regenerated with `--write`, never edited by hand.** A heading change is a
   Contents change; the checker will say so.
5. **The checker runs inside `plancheck`** — `node tools/plancheck.mjs` fails on any
   governed document that violates §3. Nothing here is advisory.
6. **Line-number citations into a governed document are a liability the citer carries.**
   Adding front matter shifts a document's lines once; ordinary editing shifts them
   forever. A citation into a design document names the SECTION (`framework §7`,
   `Part II §18`), and a line number, where one is kept for precision, is dated to a
   sha. The framework's Status records the one-time offset its front matter introduced.
   The same rule runs the other way: **a design document citing CODE names the SYMBOL**
   (the function, the op, the check number, the table) **and dates any line number to a
   sha** — the framework's Appendix A is the pattern: a measurement at a named sha, never a
   claim about the present tree. A line number with no sha is a hand-carried number, this
   project's most-repeated finding (CPDF-17 moved four files' lines the day the appendix
   landed).

7. **A queue row names the design it builds from — the governed document and section that is
   its scope's authority** (`Part II §18 piece 1`, `IC-83`, `Membership v2 §7`), and the worker
   reads that section before the code. A row whose design lives only in a ledger entry, an
   inbox note or a brief is the D-164 failure arriving one level down: the code gets built and
   the construct's document never learns it. Where the worker finds the design and the code
   disagree, the document's front matter says which is the authority; where the worker finds a
   gap in the design, it reports it to the document's Incomplete sections list through its
   report, and CONDUCT folds it at integration.

8. **DESIGN STATUS HAS ONE AUTHORITY, AND IT IS `BIO_System_Design.md` §3.** Ruled by Bob on
   2026-09-17, when he agreed the construct map is that authority and asked "that there aren't
   multiple sources of truth elsewhere in the record". A document may SAY what it lacks — that is
   §3's whole purpose — but a **to-do list that restates a CONSTRUCT'S design status is a second
   authority**, and a restated status is a copy that starts rotting the moment it is written. So a
   list of pieces still to be designed **POINTS at the construct map and at the design document,
   and never re-asserts the status itself**.

   **THE RECEIPT IS A SESSION'S OWN ERROR, which is why this is a rule and not a preference.** BOB
   #12 told Bob the claim class was UNDESIGNED **[audited 2026-09-17: HISTORICAL NARRATION of a corrected error, not a live claim — the claim class has been designed in `BIO_Case_Making_v0_1.md` since 2026-08-03 and `BIO_System_Design.md` §3 construct 8 now says so; this sentence is the receipt that earned the rule]**, because `BIO_Content_Framework_v0_10.md` §18's
   table listed "the claim object" among the pieces designed nowhere — while
   `BIO_Case_Making_v0_1.md` had designed it on 2026-08-03. Nobody was careless; the record
   contradicted itself in two places and the reader believed the nearer one. `corpuscheck`'s
   `--authority` arm (M0-57) refuses that shape, and §7 states what it can and cannot see —
   **which matters more than usual here, because a checker believed to cover more than it does is
   the exact failure this rule exists to prevent.**

## 5. Governed documents outside docs/architecture

Every `docs/architecture/*.md` is governed without being listed. Design documents elsewhere
are governed once they appear in this table — the checker reads it — and a document
joins the table in the same commit that gives it front matter.

| document | level | home (level-1) | since |
| --- | --- | --- | --- |
| `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` | 2 | `BIO_Content_Framework_v0_10.md` Part II §18 | 2026-09-14 |
| `docs/development/CONTENT-SEARCH-DESIGN.md` | 2 | `BIO_Content_Framework_v0_10.md` Part II §18 piece 2 (construct 9 names no level-1 home) | 2026-09-14 |
| `docs/development/OBSERVATION-LOG-DESIGN.md` | 2 | `BIO_Content_Framework_v0_10.md` Part II §18 piece 3 (construct 9 names no level-1 home) | 2026-09-14 |
| `docs/development/CONTRADICTION-IDENTIFY-DESIGN.md` | 2 | `BIO_Case_Making_v0_1.md` §CONTRADICTION (construct 8, 8.contradiction) | 2026-09-19 |
| `docs/development/MEMBER-KNOWLEDGE-DESIGN.md` | 2 | `BIO_Content_Framework_v0_10.md` Part II §18 piece 5 and §14.4 (D-184, D-194; constructs 2, 8, 10, 13) | 2026-09-18 |
| `docs/development/EXTRACTION-BREADTH-DESIGN.md` | 2 | `BIO_Content_Framework_v0_10.md` Part II §18 piece 4 and Part I | 2026-09-14 |
| `docs/development/MULTI-INSTANCE-ISOLATION.md` | 2 | `BIO_Distribution_v0_1.md` §7 | 2026-09-14 |
| `docs/development/STORE-AS-CACHE.md` | 2 | `BIO_Content_Framework_v0_10.md` Part II §14.2–14.3 | 2026-09-14 |
| `docs/development/INVESTIGATIVE-SESSION.md` | 2 | `BIO_Case_Making_v0_1.md`; `BIO_Content_Framework_v0_10.md` Part I §12; `BIO_Assistant_and_AI_Roles_v0_1.md` §4 | 2026-09-14 |
| `docs/development/research/README.md` | 2 | `BIO_Case_Making_v0_1.md` | 2026-09-14 |
| `docs/development/research/DATA-MODEL.md` | 2 | `BIO_Case_Making_v0_1.md` | 2026-09-14 |
| `docs/development/research/RECONCILED.md` | 2 | `BIO_Case_Making_v0_1.md` | 2026-09-14 |
| `docs/development/RETRIEVAL-SUBSTRATE.md` | 2 | `BIO_Content_Framework_v0_10.md` Part II §14.2–14.3 (construct 9 names no level-1 home) | 2026-09-14 |
| `docs/development/SCHEDULER.md` | 2 | `BIO_Technical_Architecture_Decisions_v10.md` §10.7 (construct 14 names no level-1 home) | 2026-09-14 |
| `docs/development/DOCUMENT-PROFILES.md` | 2 | `BIO_Content_Framework_v0_10.md` Part I | 2026-09-14 |
| `docs/development/OFFICE-FORMATS.md` | 2 | `BIO_Content_Framework_v0_10.md` Part I | 2026-09-14 |
| `docs/development/UI-PLAN.md` | 2 | `BIO_Interaction_Constructs_v0_1.md` (§3 construct 12) | 2026-09-14 |
| `docs/development/UI-KICKOFF.md` | 2 | `BIO_Interaction_Constructs_v0_1.md` (§3 construct 12) | 2026-09-14 |
| `docs/development/NOTIFICATIONS.md` | 2 | `BIO_Interaction_Constructs_v0_1.md` (§3 construct 12; also serves construct 10) | 2026-09-14 |
| `docs/development/AUTHORITY-AND-TRUST.md` | 2 | `BIO_Membership_Architecture_v2.md` (§3 construct 1); its capture-side rulings serve `BIO_Intake_Doctrine_v1_1.md` | 2026-09-14 |
| `docs/development/LINK-FIDELITY.md` | 2 | `BIO_Intake_Doctrine_v1_1.md` (§3 construct 2) | 2026-09-14 |
| `docs/development/ARCHIVE-FALLBACK.md` | 2 | `BIO_Intake_Doctrine_v1_1.md` (§3 construct 2) | 2026-09-14 |
| `docs/development/SOURCE-ACCESS.md` | 2 | `BIO_Intake_Doctrine_v1_1.md` (§3 construct 2) | 2026-09-14 |
| `docs/development/CAPTURE-SCALING.md` | 2 | `BIO_Intake_Doctrine_v1_1.md` (§3 construct 2) | 2026-09-14 |
| `docs/development/CAPTURE-FIDELITY.md` | 2 | `BIO_Intake_Doctrine_v1_1.md` (§3 construct 2) | 2026-09-14 |
| `docs/development/CLIENT-RENDERED.md` | 2 | `BIO_Intake_Doctrine_v1_1.md` (§3 construct 2) | 2026-09-14 |
| `docs/development/INBOX-GRAMMAR.md` | 2 | construct 14 has no level-1 document (`BIO_System_Design.md` §3) | 2026-09-14 |
| `docs/development/DOORBELL.md` | 2 | construct 14 has no level-1 document (`BIO_System_Design.md` §3) | 2026-09-24 |
| `docs/development/PRACTICE-SURVEY.md` | 2 | `BIO_Interaction_Constructs_v0_1.md` | 2026-09-14 |
| `docs/development/FINDINGS-WORKPLAN.md` | 2 | `BIO_Content_Framework_v0_10.md` Part I §12 | 2026-09-14 |
| `docs/development/RETRIEVAL-PROBE.md` | 2 | `BIO_Content_Framework_v0_10.md` Part II §14.2–14.3 | 2026-09-14 |
| `docs/development/ASSISTANT-PILOT.md` | 2 | `BIO_Assistant_and_AI_Roles_v0_1.md` §5 | 2026-09-14 |

### Not yet governed — design documents that owe front matter

Listed so the frontier is explicit. Each joins §5's table when its owner retrofits it;
CONDUCT sequences the acts. The `--write` half is mechanical; the Status, Place and
Incomplete fields need the owner's judgment.

**THE TABLE IS EMPTY AS OF 2026-09-14, AND THE EMPTY TABLE IS KEPT RATHER THAN DELETED.**
SK-6 retrofitted the last row — the assistant pilot design, SKILL's, now the final row of
§5's governed table above — so every design document this standard reaches carries front
matter. The heading and the header row stay because this is the frontier's register and a
register with nothing in it still says something: the next design document written under
`docs/development/` is owed front matter before it can be governed, and it is LISTED HERE
until its owner writes it. `bio-plane/test/corpuscheck.test.mjs` reads this sub-heading and
asserts that no row below it is governed; that arm is honest over an empty table and says so
in its own name, and it regains its teeth the moment a row returns. **No path is named in
this section in prose**, deliberately: the arm harvests backticked `docs/…md` paths from
everything under this heading, so a path mentioned here in passing would be read as a row.

| document | owner | note |
| --- | --- | --- |

**CONDUCT's seven are dispositioned, 2026-09-14 (M0-26), and the row is gone rather than ticked.** Four are
governed above. Three were CLOSED HISTORY by the queue row's criterion — every item they plan landed or
superseded, and nothing current builds against them — and went to `docs/archive/` with every reader repointed
in the same commit: `IS-BUILD-PLAN.md` (43/43; `coverage.mjs`, `owed-controls.test.mjs` and
`connections-sidebar.test.mjs` read it from disk and followed it), `CONFORMANCE-AND-INTAKE-ARC.md` (closed by
`planning-hygiene.test.mjs`'s own standing exemption) and `PROCESS-INVENTORY.md` (a dated 2026-08-01 snapshot).
**The archive is outside this standard (§6), so an archived document owes no front matter** — which is why a
closed document leaves this list without ever joining the governed table.

## 6. What this standard does not govern, and why

**THIS SECTION WAS PROSE AND IS NOW ALSO A TABLE, AND THAT IS THE POINT (M0-43).** §5's
governed table is hand-kept: correct today, with nothing making it stay correct. A design
document added under `docs/development/` was checked by NOTHING until somebody remembered
the row — M0-41's instrument census graded `corpuscheck` gated-in-part for exactly this, and
named the blind part. The remedy is **not** to let a directory walk decide what is governed
(see below, and §7), but to make the walk decide COVERAGE: every `.md` under
`docs/development/` must be **governed (§5), excluded here WITH A REASON, or listed as
UNDECIDED and routed** — and a file that is none of the three FAILS `corpuscheck` by name.
The exclusions below were already ruled, in the prose that follows the table; writing them as
rows changes no file's status and makes the ruling machine-readable so the tool can tell
*excluded on purpose* from *nobody looked*.

**The population, measured 2026-09-16 at `f3f2acba` rather than read off this section:** 62
`.md` files under `docs/development/` (recursive), of which 29 are governed by §5, 30 are
excluded by the rows below, and **3 were classified by nothing** — the first run's real
output, now the UNDECIDED table. **None of the 33 ungoverned files carries so much as one
front-matter field**, so the blind spot here is entirely PROSPECTIVE: nothing is silently
half-governed today, and the exposure is the next design document somebody writes.

**A row is a literal path or ONE `dir/*.md` glob — never `**`** — and the checker refuses a
broader pattern, because a pattern that swallows the directory classifies the population
without classifying anything. It also refuses an exclusion that shadows a §5 row: a file
cannot be both governed and excluded.

| pattern | class | why it is not governed |
| --- | --- | --- |
| `docs/development/DECISIONS.md` | ledger | append-only state, not description; checked row by row by `plancheck` and the battery |
| `docs/development/DEBT.md` | ledger | append-only state; every open row's disposition is a `plancheck` arm |
| `docs/development/QUEUE.md` | ledger | append-only state; `planning-hygiene` and `rowdesign` check it row by row |
| `docs/development/BACKLOG.md` | ledger | the pipeline's ordered open rows (WORK-PIPELINE §1); `tools/ledger.mjs` moves them and `plancheck` checks its five pipeline invariants |
| `docs/development/MEASUREMENTS.md` | ledger | append-only state; each figure carries its own date and instrument |
| `docs/development/MILESTONES.md` | ledger | the capability ladder's open work, appended and drained; its construct-set reasoning lives in `BIO_System_Design.md` §5 (classified 2026-09-24 by BOB #32 on Bob's delegation, D-388) |
| `docs/development/CIVICOS_UI_STATE.md` | ledger | the UI lane's per-session state log, prepended; `kickoffs/UI.md` is the lane's instructions (classified 2026-09-24 by BOB #32, D-388) |
| `docs/development/SESSION-KICKOFF-UI.md` | kickoff | a redirect to `kickoffs/UI.md`, kept because older documents and Bob's notes link to it (classified 2026-09-24 by BOB #32, D-388) |
| `docs/development/CLAIMS.md` | ledger | append-only state; `register-grammar` and the DELEGATION arm check it |
| `docs/development/INTERFACES.md` | ledger | append-only state; the interface arms check it |
| `docs/development/INTERFACE-CHANGES.md` | ledger | append-only state; `mergecarry` and the resolution arms check it |
| `docs/development/measurements/*.md` | ledger | one file per measurement entry since M0-100 (`MEASUREMENTS.md` is its frozen history); `tools/entries.mjs` reads both and `plancheck` §2e checks each file |
| `docs/development/interface-changes/*.md` | ledger | one file per interface-change entry since M0-100 (`INTERFACE-CHANGES.md` is its frozen history); `tools/entries.mjs` reads both and `plancheck` §2e checks each file |
| `docs/development/ORCHESTRATION.md` | process document | describes how the project works, not what the system is |
| `docs/development/PARALLELISM.md` | process document | describes how the project works, not what the system is |
| `docs/development/VERIFICATION.md` | process document | describes how the project works, not what the system is |
| `docs/development/WORK-PIPELINE.md` | process document | describes how work moves from backlog to queue to archive, not what the system is |
| `docs/development/TREE-SHARING.md` | process document | describes how the lanes share the repository and land on `main`, not what the system is |
| `docs/development/kickoffs/*.md` | kickoff | describes how a lane works; `plancheck` already checks each for the mechanisms it must carry |

The reasoning behind those rows, unchanged:

- **The ledgers** (`DECISIONS.md`, `DEBT.md`, `QUEUE.md`, `MEASUREMENTS.md`, `CLAIMS.md`,
  `INTERFACES.md`, `INTERFACE-CHANGES.md`). They are append-only state, not description;
  their currency is checked row by row by `plancheck` and the battery (`planning-hygiene`,
  `register-grammar`, `mergecarry`). A front matter over a register would restate what the
  rows already say.
- **The process documents** (`ORCHESTRATION.md`, `PARALLELISM.md`, `VERIFICATION.md`, the
  kickoffs). They describe how the project works rather than what the system is. They may
  adopt the grammar voluntarily; `plancheck` already checks the kickoffs for the
  mechanisms they must carry.
- **`docs/archive/**`.** Closed history is not edited. `decided.mjs` and `mintid` scan it;
  nothing else reads it as current. It is outside the population the checker walks, so it
  needs no row.
- **The honesty of a Status.** The checker can prove a Contents matches, a date is not
  behind the file, and every incomplete bullet names a real section. It cannot prove a
  document that says "complete" is complete. That is the reviewer's job — Bob reviews as a
  reader who has not lived in the repo, and this front matter is written for exactly that
  reader.

### Undecided — files the walk found that nobody has classified

**WHICH FILES ARE GOVERNED IS NOT THE CHECKER'S DECISION AND WAS NOT M0-43'S**; it is this
standard's, and Bob owns this document. So the three files the first coverage run named are
listed here with the question each one poses, rather than assigned a class by the session that
found them. **This table is LITERAL PATHS ONLY and every row must name a file that EXISTS** —
it is a closed, enumerated hole somebody drains, not an open bucket that swallows the next
file written. A new document does not land here by default; it FAILS. **D-388 drained it on 2026-09-24** (BOB #32, on Bob's
delegation: *"a low level detail"*); the table stays so the next unclassified file has a place to be named.

| document | what is undecided |
| --- | --- |

## 7. How the checker works, in one paragraph

`node tools/corpuscheck.mjs` reads the governed set (§5), parses each file's front matter
from the line after its first heading to the first `---` or heading, and fails the file
if any field is missing or out of order, if Status lacks `as of YYYY-MM-DD` or that date is
earlier than the file's last commit day (`git log -1 --format=%as`), if Status or Place is
too short to say anything, if Contents differs from the headings that follow the front
matter (levels 1–3, or the declared depth), or if an Incomplete bullet is malformed or
names a section the document does not have. `--write <file>` regenerates Contents in
place. `plancheck` imports the module and folds its failures into its own; a governed
document that fails corpuscheck fails the gate. `bio-plane/test/corpuscheck.test.mjs`
drives every arm and its negative control.

**AND IN THE SAME PASS IT CHECKS THAT DESIGN STATUS HAS ONE AUTHORITY (§4.8, M0-57).**
`statusAuthority()` reads `BIO_System_Design.md` §3's construct table and follows the citations the
MAP ITSELF wrote — a row carrying `§<section> item <n>` is the authority declaring which item of
another governed document belongs to which construct. It fails when FOUR corpus-authored signals
coincide: the citation resolves; the cited section says its items are still to be designed; the
cited item does not itself name where its design lives; and another document in that row's HOME
cell both declares the construct in its own `Place in the system` line and carries a body HEADING
containing every content word of the cited item's own bold key. `--authority` prints it alone; the
default invocation includes it, and `plancheck` folds it in.

**THE MATCH WAS MEASURED BEFORE IT WAS CHOSEN, AND THE NARROW FORM WAS TAKEN DELIBERATELY.** §3
calls construct 8 *Intent and inquiry — from goal to case*; §18 calls the piece *the claim object*.
**The two vocabularies share not one content word**, so no prose-similarity rule could pair them
without pairing most of the corpus with most of the corpus — and **an arm that fires on a healthy
state is worse than no arm**, because it is switched off inside a week and takes its true positives
with it. The explicit citation is narrower and it is what the tool uses.

**WHAT IT CANNOT SEE, STATED RATHER THAN IMPLIED CLOSED.** An undesignedness claim that no §3 row
CITES is invisible to it. A citation of any other shape — `Part II §18` with no item number,
`§14.2–14.3`, a bare document reference — is not resolved. A bold key of fewer than two content
words is skipped and SAID, because one generic noun is not a match this arm will make. A home
document that designs a piece without a heading naming it reads as absent. And a HIT is evidence
that a section EXISTS about the piece, never that its design is adequate. Every resolved citation
therefore reports a VERDICT **[audited 2026-09-17: a VOCABULARY LIST naming this tool's own verdict values, not an assertion that anything is undesigned]** — `RESTATED`, `points-at-its-design`, `honestly-undesigned`,
`list-claims-no-undesignedness` — so a clean run states what it EVALUATED rather than only that
nothing failed; `0 fail` cannot tell one authority from an arm that asked nothing. **`D-404`'s
`tools/rowsubstrate.mjs` asks a neighbouring question about ROWS and WARNS; this one asks about
DOCUMENTS and FAILS, because a contradiction between two governed documents is a defect rather
than a question.** **And the two fail in OPPOSITE directions on purpose, which is what lets this
one fail rather than warn.** `rowsubstrate`'s measured precision is 1 true of 3 verified, both
false positives sharing one mechanism — **the design names the RULE, not the IDENTIFIER**
(CONDUCT #3, 2026-09-17). That is a property of how this corpus is written, not of that tool. A
home document that designs a piece while naming only the rule reads to signal 4 as ABSENT, so this
arm stays SILENT: its failure mode is UNDER-REACH, which is a bound M0-58 measures, rather than a
false alarm, which is how an instrument gets switched off inside a week.

**And in the same pass it audits COVERAGE (M0-43).** `population()` walks every `.md` under
`docs/development/` RECURSIVELY — `research/` holds three governed documents, so a flat read
would leave a real subdirectory outside the audit while passing every table-driven arm — and
`coverage()` classifies each file against §5's governed table, §6's exclusion table and §6's
UNDECIDED table, failing by name on anything in none of the three. **Discovery decides the
population; the tables decide the class.** That division is deliberate and is the one
judgment call in this item: `docs/architecture/` is single-purpose, so there a path implies
governance and a walk can decide it alone; `docs/development/` is MIXED, so a walk that
governed what it found would assign a class to 33 files that §6 has already ruled the other
way for 30 of them — a decision belonging to this document, not to a checker. What a walk can
decide without overreaching is whether every file has been LOOKED AT, and that is the failure
the hand-kept table actually had. `--coverage` prints the classification alone; the default
invocation includes it, because a flag nobody passes is not a mechanism.
