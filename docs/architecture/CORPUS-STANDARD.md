# The design corpus standard

**Status** · v0.1, written 2026-09-14 by session BOB #10 at Bob's direction the same day, as of 2026-09-14. This is the standard every design document in this repository is held to: what the corpus is, which levels it has, and the FRONT MATTER every document carries so that a reader can tell, without reading the body, what the document is, where it sits, how complete it is, and what it still lacks. The rules are Bob's (§1); the grammar and the checker that enforces it (`tools/corpuscheck.mjs`, run by `plancheck`) are the mechanism, and the mechanism is this session's. Complete at its level for what it governs today; §6 names what it does not yet govern.

**Place in the system** · This document governs the FORM of the design corpus, not its content. It sits beside `README.md` (the catalog of documents) and above every document in `docs/architecture/` and the design documents it lists in §5, all of which must satisfy it. `BIO_System_Design.md` is the level-0 document this standard requires to exist; `tools/corpuscheck.mjs` is its enforcement; `tools/plancheck.mjs` runs that enforcement before every push.

**Incomplete sections** ·
- §5 — the design documents under `docs/development/` are listed and only some are governed yet; the rest join the governed table as each is retrofitted (an act per owner, routed through the queue). The two tables together are the count: whatever stands under "Not yet governed" is what is still owed.
- §6 — whether the ledgers (`DECISIONS.md`, `DEBT.md`, `QUEUE.md`, `MEASUREMENTS.md`) should carry a variant of this front matter is not decided; they are append-only registers with their own hygiene checks and are deliberately outside this standard for now.

**Contents**
- [1. Why this exists — Bob's ruling of 2026-09-14, and the receipt](#1-why-this-exists-bobs-ruling-of-2026-09-14-and-the-receipt)
- [2. The levels](#2-the-levels)
- [3. The front matter](#3-the-front-matter)
- [4. The rules that keep it current](#4-the-rules-that-keep-it-current)
- [5. Governed documents outside docs/architecture](#5-governed-documents-outside-docsarchitecture)
  - [Not yet governed — design documents that owe front matter](#not-yet-governed-design-documents-that-owe-front-matter)
- [6. What this standard does not govern, and why](#6-what-this-standard-does-not-govern-and-why)
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
repo needs; and the words "as of YYYY-MM-DD">

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
  one date.
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

## 5. Governed documents outside docs/architecture

Every `docs/architecture/*.md` is governed without being listed. Design documents elsewhere
are governed once they appear in this table — the checker reads it — and a document
joins the table in the same commit that gives it front matter.

| document | level | home (level-1) | since |
| --- | --- | --- | --- |
| `docs/development/CONTENT-EXTENT-DESIGN-SPACE.md` | 2 | `BIO_Content_Framework_v0_10.md` Part II §18 | 2026-09-14 |
| `docs/development/MULTI-INSTANCE-ISOLATION.md` | 2 | `BIO_System_Design.md` §distribution | 2026-09-14 |
| `docs/development/UI-PLAN.md` | 2 | `BIO_Interaction_Constructs_v0_1.md` (§3 construct 12) | 2026-09-14 |
| `docs/development/UI-KICKOFF.md` | 2 | `BIO_Interaction_Constructs_v0_1.md` (§3 construct 12) | 2026-09-14 |
| `docs/development/NOTIFICATIONS.md` | 2 | `BIO_Interaction_Constructs_v0_1.md` (§3 construct 12; also serves construct 10) | 2026-09-14 |

### Not yet governed — design documents that owe front matter

Listed so the frontier is explicit. Each joins §5's table when its owner retrofits it;
CONDUCT sequences the acts. The `--write` half is mechanical; the Status, Place and
Incomplete fields need the owner's judgment.

| document | owner | note |
| --- | --- | --- |
| `docs/development/STORE-AS-CACHE.md` | BOB | retrieval design; Part II §14.2–14.3 carry its tables |
| `docs/development/INVESTIGATIVE-SESSION.md` | BOB | DEC-60/61/62 reasoning; the IS build plan's source |
| `docs/development/IS-BUILD-PLAN.md` | CONDUCT | complete (43/43 rows) — a closed plan, candidate for the archive rather than for front matter |
| `docs/development/RETRIEVAL-SUBSTRATE.md` | RECORD | the FTS5-in-the-DO specification |
| `docs/development/DOCUMENT-PROFILES.md` | FRAMEWORK | docprofile's own design |
| `docs/development/ASSISTANT-PILOT.md` | SKILL | the assistant pilot design |
| `docs/development/AUTHORITY-AND-TRUST.md` | CAPTURE | the 2026-07-30 rulings on authority |
| `docs/development/LINK-FIDELITY.md`, `ARCHIVE-FALLBACK.md`, `SOURCE-ACCESS.md`, `CAPTURE-SCALING.md`, `CAPTURE-FIDELITY.md`, `CLIENT-RENDERED.md` | CAPTURE | capture designs |
| `docs/development/SCHEDULER.md` | RECORD | the alarm model (`NOTIFICATIONS.md`, the queue content this row also named, joined the governed table above on 2026-09-14 — UI-58) |
| `docs/development/OFFICE-FORMATS.md` | CONTENT-OFFICE | the format axis |
| `docs/development/INBOX-GRAMMAR.md`, `CONFORMANCE-AND-INTAKE-ARC.md`, `PROCESS-INVENTORY.md`, `PRACTICE-SURVEY.md`, `FINDINGS-WORKPLAN.md`, `RETRIEVAL-PROBE.md` | CONDUCT | designs and studies; some are closed history and belong in the archive |
| `docs/development/research/*.md` | BOB | the case-making research set; parked with DEC-33 |

## 6. What this standard does not govern, and why

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
  nothing else reads it as current.
- **The honesty of a Status.** The checker can prove a Contents matches, a date is not
  behind the file, and every incomplete bullet names a real section. It cannot prove a
  document that says "complete" is complete. That is the reviewer's job — Bob reviews as a
  reader who has not lived in the repo, and this front matter is written for exactly that
  reader.

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
