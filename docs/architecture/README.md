# Architecture

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

**BIO_Design_Requirements_v2** — fourteen requirements in eight
categories, each derived from the values, and the system fails if any is
violated. Load-bearing throughout the rest of the corpus: Requirement 1
(fully distributed, administrators as custodians rather than authorities),
Requirement 2 (works at every scale without modification, genuinely useful
to one person), Requirement 13 (functions under active opposition), and
Requirement 14 (no single point of failure) are cited by name in the
architecture documents and in review.

## Architecture

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

**BIO_Membership_Architecture_v1 — SUPERSEDED by v2, July 26, 2026.** Kept
for the record and must not be worked from. Its Section 7.7 states the
OPPOSITE of v2's on who removes a project participant: v1 gave that
authority to administrators, v2 gives it to project owners. v2 carries a
change table at the top listing every difference.

## Design and doctrine

**BIO_State_Rules_Consistency_v1_5** — the data-store rules every skill
and every implementation writes against: object schemas, the closed
relationship vocabulary, state lifecycles, cascade semantics, and the
violation-to-repair mapping. The most operationally load-bearing document
in the corpus; sessions consult it constantly.

**BIO_Intake_Doctrine_v1_1** — how material enters the record, the
escalation ladder that decides who does the work (daemon, session, human),
and the handling of lawful-but-confidential discoveries.

**BIO_Bundle_Skill_Composite_Design_v1_7** — the design of the Apps Script
bundle skill. **Status: superseded implementation, inherited format.** The
Cloudflare plane replaced this runtime, but the bundle format, the
promotion semantics, and the C-series check catalog it describes are what
the plane implements and must continue to satisfy. Read it for the format
and the checks, not for the runtime.

**BIO_Communications_Platforms** — the analysis behind platform selection
for group and inter-group communication. **Status: operational selection,
revisit as platforms change.** Kept rather than folded because it answers a
question every new group asks and because Requirement 13 makes
individual-level blocking and moderation a requirement rather than a
preference.

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

