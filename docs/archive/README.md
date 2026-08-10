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

## Adding to the archive

Move the file with `git mv`, add a row above saying what it was and why it closed, and
**re-run `node tools/mintid.mjs --list` to confirm no floor fell.** Do not move anything
that code reads from disk — today that is `DECISIONS.md`, `kickoffs/CONDUCT.md`,
`IS-BUILD-PLAN.md` and `INVESTIGATIVE-SESSION.md` — and do not move a file `plancheck`
names.
