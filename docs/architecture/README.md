# Architecture

**Status** · The catalog of the design corpus: one entry per document with what it is for and its status, the publication note of July 24, 2026, and the note on what is referenced but not here. Current as of the corpus at `origin/main` on 2026-09-14; complete at its level — every document in this directory has an entry. Since 2026-09-14 the corpus is held to `CORPUS-STANDARD.md`, and `BIO_System_Design.md` places the constructs the documents describe. as of 2026-09-25.

**Place in the system** · The index of `docs/architecture/`. `BIO_System_Design.md` is the level-0 map (constructs and their homes); this file is the catalog (documents and their status); `CORPUS-STANDARD.md` is the form both are held to. A reader new to the repository reads the Roadmap first, then the system design, then the construct they need.

**Incomplete sections** · None — every `.md` in this directory has an entry below, checked against the directory listing on 2026-09-14.

**Contents**
- [Mission and objectives](#mission-and-objectives)
- [Requirements](#requirements)
- [Architecture](#architecture)
- [Design and doctrine](#design-and-doctrine)
- [The corpus itself](#the-corpus-itself)
- [A note on what is not here](#a-note-on-what-is-not-here)

---

The doctrine corpus: what BIO is, what it must do, and how it is built.
Committed to the public repository on July 24, 2026 so that a working
session can read everything it needs with no credentials and nothing
attached, which is what SESSION-KICKOFF.md has always promised and could
not deliver while these documents lived on one person's machine.

**Nothing here is secret.** The corpus was checked before publication for
credential material, contact details, named private individuals, and
confidentiality markings, and contains none. Design Requirement 6 fixes the
naming policy the documents follow: individuals appear only in their
official capacity in connection with specific documented actions, and
accountability belongs to the role and the institution.

**Markdown is the source of truth.** Decided July 24, 2026. These documents
were authored in Word and converted once; the `.docx` originals were removed
in the same commit rather than kept as a second copy that could silently
diverge. Prose belongs in text that greps, diffs, reviews in a pull request,
and renders in place, and binary blobs in version history are permanent and
opaque. Edit the `.md` files directly from here on.

## Mission and objectives

**BIO_Complete_Roadmap_v5** — the mission of record. Values, operational
principles, the seven-category UX (Context, Search, New Developments,
Monitoring, Communications, Projects, Settings), and the sequencing of the
whole undertaking. Read this first if you are new.

## Requirements

**BIO_Design_Requirements_v2** — fifteen requirements in eight
categories, each derived from the values, and the system fails if any is
violated. Load-bearing throughout the rest of the corpus: Requirement 1
(fully distributed, administrators as custodians rather than authorities),
Requirement 2 (works at every scale without modification, genuinely useful
to one person), Requirement 13 (functions under active opposition), and
Requirement 14 (no single point of failure) are cited by name in the
architecture documents and in review.

## Architecture

**BIO_System_Design** — the level-0 map, v0.1 DRAFT (2026-09-14, awaiting Bob's
review): the purpose and the path, the system in one view, every major construct
with its importance, relationships, home document and state, the capability ladder
as the completeness map, the runtime shape, and the doctrine spine. Read it after
the Roadmap and before any construct's document; the three constructs it named
homeless at v0.1 (the assistant, publication, distribution) received their documents
on 2026-09-14, below.

**BIO_Assistant_and_AI_Roles_v0_1** — the level-1 home of construct 11 (v0.1 DRAFT,
2026-09-14, awaiting Bob's review): the four roles FIND / PURSUE / EXTRACT / CHECK,
the rules stated once (the machine looks, the member concludes; no machine credential
performs an attested act; an AI never travels on a member's token; transcripts never
in the record), what is built (the investigative session, the credential cascade,
the running-session surface), what is designed (the assistant pilot), and the frontier.

**BIO_Publication_v0_1** — the level-1 home of construct 13 (v0.1 DRAFT, 2026-09-14,
awaiting Bob's review): one-way publication, editions, the bar on the project, the
fence on the provenance chain, bias public, the eight audiences and their output acts,
attribution as the attesting member's choice, the ceremony deferred on DEC-33's
trigger, and what is dishonest today.

**BIO_Distribution_v0_1** — the level-1 home of construct 15 (v0.1 DRAFT, 2026-09-14,
awaiting Bob's review): the sovereign instance and what its boundary buys, the signed
release and its namespaces, the fleet as a membership rule, the installer's contract
with the group's account, the deploy-to-serve ladder, and multi-instance isolation as
planned.

**BIO_Functional_Architecture_v3** — the three concurrent layers,
Information, Analysis, and Action, with every function a group needs mapped
to a layer, the AI skills that support each, and where human judgment is
required. Annotated in v3 with the daemon realization and the escalation
ladder.

**BIO_Technical_Architecture_Decisions_v10** — the technology decisions
that answer the functional architecture's open questions. Note that
Section 10's decision against per-member tokens is superseded by the
membership architecture below; the rest stands.

**BIO_Membership_Architecture_v2** — covers and handles, administrators and
the two-administrator floor, capabilities, burner-URL invitations, project
participation and ownership, and secure verified export. A first-class
document rather than an addendum, and the specification the current build
works from. Its Section 9 records the root of trust as architecture debt.

**BIO_Membership_Architecture_v1 — SUPERSEDED by v2, July 26, 2026, and
REMOVED 2026-09-25 at Bob's direction** (only the latest version stays).
It remains readable on the branch `snapshot/pre-refactor-2026-09-25`. v2
carries a change table at the top listing every difference.

## Design and doctrine

**BIO_State_Rules_Consistency_v1_5** — the data-store rules every skill
and every implementation writes against: object schemas, the closed
relationship vocabulary, state lifecycles, cascade semantics, and the
violation-to-repair mapping. The most operationally load-bearing document
in the corpus; sessions consult it constantly.

**BIO_Intake_Doctrine_v1_1** — how material enters the record, the
escalation ladder that decides who does the work (daemon, session, human),
and the handling of lawful-but-confidential discoveries.

**BIO_Content_Framework_v0_10** — at v0.11 inside (2026-09-15) under the
`v0_10` filename, so every `framework:LINE` citation in code and record
stays exact. Part I (§§1–13), approved 2026-07-30, is the extraction
substrate: recognisers, regions and digests, change layers, content types,
connections and their grade, progressions, intent, declared bias. Part II
(§§14–19) is the single authoritative content design — content as the unit
the record points at (DEC-23), the forms content takes, the extraction
process as built, how content is organized and reached, and the central gap
(D-164) stated once — every construct marked built, designed, gestured or
absent. Read it for what content IS before touching anything that points at
a document.

**BIO_Bundle_Skill_Composite_Design_v1_7** — the design of the bundle skill
that was the store's single write authority. **Status: superseded
implementation, inherited format.** The Cloudflare plane replaced that
runtime, but the bundle format, the promotion semantics, and the C-series
check catalog it describes are what the plane implements and must continue
to satisfy. Read it for the format and the checks, not for the runtime; the
retired runtime's own build record is in `docs/archive/architecture/`.

**BIO_Communications_Platforms** — the analysis behind platform selection
for group and inter-group communication. **Status: operational selection,
revisit as platforms change.** Kept rather than folded because it answers a
question every new group asks and because Requirement 13 makes
individual-level blocking and moderation a requirement rather than a
preference.

## The corpus itself

**CORPUS-STANDARD** — the standard every design document is held to since
2026-09-14 (Bob's ruling): the levels of the corpus, the front matter every
document carries (Status with completeness and `as of` date, Place in the system,
an explicit Incomplete sections list, a generated Contents), the rules that keep it
current, and the governed set. `node tools/corpuscheck.mjs` enforces it and
`plancheck` runs it.

**CONSTRUCTS** — the 2026-07-30 inventory of the document-profile and content
constructs, their consumers, overlaps and the FW build plan; the evidence beneath
Part I of the Content Framework. An inventory at a date: read its plan section's
BUILT markers, not its tables, for what is true now.

## A note on what is not here

**The Conversion Plan is referenced but is NOT in this repository.** Six
documents cite it, most often as "Conversion Plan step 6" (a benchmark at 5,000
and 20,000 bundles against a prediction table) and "Conversion Plan probe 1"
(FTS5 virtual tables versus an exported index). A reader following those
references will not find the document, and the benchmark they name records
actuals with nothing to compare them against. Recorded here rather than edited
out of the six documents, because the references are honest about what was
DECIDED and only misleading about what is READABLE, and rewriting six documents'
prose to remove a name risks changing what they meant.

What survives of it, and where the answers actually live:

- **Probe 1 was answered by measurement, not by the plan.** FTS5 inside the
  Durable Object won, and `development/RETRIEVAL-SUBSTRATE.md` is the resulting
  specification. `development/RETRIEVAL-PROBE.md` holds the actuals.
- **Step 6's benchmark exists and runs**, as `npm run bench:retrieval` at 20,000
  bundles, and `npm run bench 20000` for the store harness. There is no
  prediction table to check them against and there will not be one, so the bench
  is judged against the previous run and against the shape of the curve rather
  than against a threshold nobody can read. That is weaker than the plan
  intended and it is the honest position. See D-28.

The C-series check catalog was also once listed here as absent. It is not
anymore: `bio-plane/checks/bio-checks.mjs` carries it, hash-verified, and
`plane-gate/1.0` RUNS it rather than reimplementing it. That note is kept in
outline only so a reader of an older revision can see the gap closed rather than
wonder whether it was quietly dropped.

**Added July 27, 2026:** `BIO_Declared_Bias_v0_1.md` joins the corpus as a
first-class architecture document: bias as a declared, justified construct,
with the subject registry, masking safeguards, bias debt, regrade and the
cross-group rerun. In the same pass the construct formerly named Problem is
renamed FOCUS throughout the corpus, with legacy literals remaining valid
aliases in append-only history and in code until the rename arc lands.
