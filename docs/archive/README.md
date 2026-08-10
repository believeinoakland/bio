# The archive — closed, kept, and still searchable

Nothing here is deleted and nothing here has been edited. These are documents whose work
is FINISHED: superseded design passes, closed history, and dead handovers. They were
moved out of `docs/development/` and `docs/architecture/` on 2026-08-10 so that a session
orienting itself reads the live record rather than the whole of it.

**They are still reachable in the two ways that matter.** `node tools/decided.mjs`
scans this directory by construction, so every ruling made in these files is still
indexed and still quoted with a pointer; and `tools/mintid.mjs` counts ids mentioned
here, so **no id floor fell when they moved** — measured before and after across all
twenty namespaces, identical.

**Why they left the working tree, in one number:** the reading `CLAUDE.md` and the
kickoffs demand before a session may work totalled ~565,000 tokens. No session could read
its own required reading list, so it read some of it and the rest of the record was
invisible to it. See `docs/development/CORPUS-STUDY.md`.

## A pass is a record of what it concluded

**None of these files has been corrected in place, and none ever should be.** Where a
pass was later overturned, the correction lives in a live surface — `DECISIONS.md`,
`DEBT.md`, `MILESTONES.md` — and the pass keeps saying what it said. Editing it would
hide that the evidence arrived after the conclusion, which is the one thing the dated
record is for.

## What is here

### `research/` — the case-making study, 2026-08-01 to 08-02

Thirteen passes in two days. **`RECONCILED.md` superseded them and stayed live** in
`docs/development/research/`, along with `README.md` (the reading guide), `DATA-MODEL.md`
(still cited by six code sites as the model's source) and `review-document.html` (the
source of Bob's published review).

| file | what it was | why it closed |
| --- | --- | --- |
| `SB-CORE.md`, `SB-EVIDENCE.md`, `SB-OUTPUT.md` | the three storyboards | written in parallel by sessions that could not read each other; **`RECONCILED.md` wins wherever they disagree** |
| `BUILD-ORDER.md` | the derived build order | superseded by `RECONCILED.md` §3. **Eleven of its items instruct a worker to build behaviour the R1–R4 resolutions REFUSE** — this is the most dangerous file in the archive and the reason it is no longer beside the live queue |
| `CRITIQUE.md`, `COMPLETENESS-AUDIT.md` | the adversarial and coverage passes | their findings became R1–R4 and the DEC entries |
| `PROBLEM-DOMAIN.md` | the only externally-sourced pass | produced DEC-13 and DEC-14 |
| `AUDIENCES.md` | user types and readers | **uses one word for two concepts (D-156)**, and its §9 lists pre-publication contact among HAZARDS, which DEC-13 overturned |
| `PROCESS-CATALOGUE.md`, `MACHINE-PROCESSES.md` | the 94 processes | inputs to `RECONCILED.md` |
| `JOURNEY-PRIMARY.md`, `LAYERS.md`, `CAPABILITIES.md`, `UI-BASELINE.md`, `SEARCH-COMPLETENESS.md` | journey, layer stack, capability and baseline passes | inputs |
| `OCR-SERVICE-SURVEY.md` | vendor survey | a survey, not a decision |

### Closed history

| file | what it was |
| --- | --- |
| `PLAN.md` | the original plan. `CLAUDE.md` has called it closed history since `QUEUE.md` replaced it |
| `IS-SWEEP-2026-08-07.md` | the investigative-session sweep; its sequencing was enacted into `QUEUE.md` and superseded by `IS-BUILD-PLAN.md` |
| `kickoffs/BOB-HANDOVER-2026-08-04.md` | a handover to a session that has since been replaced twice |
| `kickoffs/CONDUCT-BOOTSTRAP.md` | the first CONDUCT bootstrap, superseded by `kickoffs/CONDUCT.md` |
| `apps-script-README.md` | the Apps Script accelerator's notes. **That runtime no longer exists** — the plane is a Cloudflare Worker |

### `architecture/` — the retired runtime's own sections, moved 2026-08-10

**Bob, 2026-08-10: "Remove all references to Google Drive and App Script, as that's not
part of the system architecture."** He is right and the references were wrong: the built
system is a Cloudflare Worker plus a Durable Object with SQLite and R2. The removal was
not a find-and-replace — it was a per-reference judgment about whether the reasoning
around a reference survived the substrate change or went with it. **What survived stayed
in the live document, stated in terms of the PROPERTY rather than the vendor. What is
here is what the retired runtime was**, verbatim and unedited.

| file | what it holds |
| --- | --- |
| `BIO_Technical_Architecture_Decisions_v10-retired-runtime.md` | the v5–v10 revision log, the first client as built, three technology-stack rows, the transport findings, the registry of ten endpoint operations with their admission reasoning, the sequence-uniqueness non-invariant, and the promotion gate's deployment lag |
| `BIO_Bundle_Skill_Composite_Design_v1_7-retired-runtime.md` | the v1.1–v1.7 revision log, the endpoint's subtree in the component inventory, and the measured component sizes at 0.1.0 |

**Read the registry admissions.** They are the clearest worked examples in the record of
what the constrained-endpoint criteria actually demand of an operation — including an
admission that states its own worst case in plain words, which is the standard the live
Section 10.4 now holds every admission to.

**Two things were deliberately NOT touched, and both were measured rather than assumed.**
The append-only ledgers keep every retired-runtime row they carry: those are dated records
of what was measured and decided ON that runtime, and editing them rewrites history, which
is the one thing this record refuses. And `BIO_Communications_Platforms.md` with
`BIO_Design_Requirements_v2.md`'s R9 keep their platform recommendations to ADOPTING
GROUPS — those name a place a group might host its own work products, which is not our
substrate and is a different doctrine question.

### `ledgers/` — closed operational history, rolled 2026-08-10

**`DECISIONS-2026-08.md` joined the rolls on 2026-08-10 (second pass, same day):** 57
answered/enacted entries, 383 KB — rolled once the open list hit zero, because the live
file's job is the open list and its settled history had become 93% of its bytes. The live
file keeps the rules, deferred entries, entries whose enactment CONDUCT still owes, and
the byte-read entries (DEC-39, DEC-32/DEC-33).

Rolled out of the live ledgers, unedited, because those files had grown past what a
session could read. **In every case the live file keeps its rules and everything still
open**, and the split was verified LOSSLESS — every block present exactly once across
the pair — before either file was written.

| file | what moved | the live file went from |
| --- | --- | --- |
| `CLAIMS-2026-08.md` | 217 released claims | 1.69 MB → 26 KB |
| `QUEUE-2026-08.md` | 195 `done`/`superseded` items | 931 KB → 83 KB |
| `DEBT-closed-2026-08.md` | 110 rows whose status is not `open` | 532 KB → ~315 KB |

**`QUEUE.md` keeps a one-line register of every closed id, and that is not cosmetic:**
`planning-hygiene` builds its queue-id set from this file's `### <ID> · <state>` headings
and checks every `QUEUED <ID>` cross-reference in the corpus against it, and `mintid`
reads its floors from the same prose.

**`INTERFACE-CHANGES.md` was NOT rolled**, and the reason is worth keeping: it looks 49-of-52
resolved, and it is not. IC-39 through IC-57 read `PROPOSED … the version bump and the
RESOLUTION are CONDUCT's` — **resolutions still OWED**, not closed history. Rolling them
would have hidden outstanding work behind a tidy file. `DECISIONS.md` and the open half
of `DEBT.md` stay whole for the same kind of reason.

## Adding to the archive

Move the file with `git mv`, add a row above saying what it was and why it closed, and
**re-run `node tools/mintid.mjs --list` to confirm no floor fell.** Do not move anything
that code reads from disk — today that is `DECISIONS.md`, `kickoffs/CONDUCT.md`,
`IS-BUILD-PLAN.md` and `INVESTIGATIVE-SESSION.md` — and do not move a file `plancheck`
names.
