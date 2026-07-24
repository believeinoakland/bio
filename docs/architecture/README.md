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

**Each document is authored as `.docx` and published with a generated
`.md` beside it.** The `.docx` is the source of truth and the `.md` is a
projection: greppable, diffable, and readable by a session or by anyone
without Word. When a document changes, both are regenerated. If they ever
disagree, the `.docx` governs.

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

**BIO_Membership_Architecture_v1** — covers and handles, administrators and
the two-administrator floor, capabilities, burner-URL invitations, project
participation, and secure verified export. A first-class document rather
than an addendum, and the specification the current build works from. Its
Section 9 records the root of trust as architecture debt.

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

The C-series check catalog is referenced throughout State Rules and the
Bundle Skill design, but its implementation, `bio-checks`, lives in the
Apps Script codebase rather than in this corpus. The Cloudflare plane
currently ships `plane-gate/0.1`, which implements the mechanical integrity
subset and records its own version on every publication so the gap is
visible in the record rather than assumed away. Porting the full catalog
needs the check source, not these documents.
