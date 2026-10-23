# READING-ARCHITECTURE lane: state for the next session

**Status** · Written by READING-ARCHITECTURE #1 (`session_01Gpv8oKYGd6HrRswr3cXHmy`), 2026-10-23, at about 41% of its context window. Replaced whole at each handoff. Read with `CHARTER.md` and `HANDOFF.md`.

## Done (committed on `lane/reading-architecture`)

| deliverable | file | entry |
|---|---|---|
| 1 | `REQUIREMENTS.md` (97 requirements RR-A1..RR-M5, 49 conflicts, 45 gaps, Bob's questions §6) | RA1 |
| 2 | `PLATFORM.md` (65 Cloudflare pages read raw 2026-10-23, 303 quotes script-checked; spikes in `spikes/`; P-M1..P-M24 live measurements) | RA2 |
| 3 | `CHALLENGES.md` (17 failure classes C1–C17, recurrence table, live facts, unknowns, 17 obligations for OPTIONS) | RA3 |

## In progress: deliverable 4, `OPTIONS.md`

- The lane's design is written as a brief: the shared shape S1–S9 every option needs, four whole architectures (A hardened in-object; B a reader object per document; C Workflows carry the read with Workers readers; D Workflow-carried with container-read heavy kinds), the comparison axes, and the recommendation (D, staged: the shared shape first, then the Workflow carrier with the light kinds, then container readers kind by kind, each after its live measurements). The brief is copied to `options-brief.md` in this folder; OPTIONS.md must keep its substance.
- Spikes for OPTIONS (Workflows in Miniflare; native tools vs wasm; a range-read check) were started in scratch. If the session ended before their results were committed, re-run them: the prompt is in the brief's spirit and `spikes/RESULTS.md` shows the method.
- Next: a writer (sonnet, medium) expands the brief into `OPTIONS.md` reading REQUIREMENTS, PLATFORM and CHALLENGES whole (about 310 KB: split it, or give the writer only §1 and §7 of CHALLENGES plus the brief, with the rest read by helpers); the lane reads the draft whole, corrects it, commits it, and adds RA4.

## Then

- Deliverable 5, `FOR-BOB.md`: only what is Bob's (P17): the architecture choice A–D at its high level, with an explanation he can understand; money (container cost per heavy read, from PLATFORM §6.4); what members experience (time to whole and "being read N of M", the refusal sentence, whether a safety hold gates reading). Also sort under P17 the questions in REQUIREMENTS §6 and CHALLENGES §6, and SHEET #1's eight and DOCS #1's eleven (K4815, in `envelope-sheets-T51.md` and `envelope-docs-T51.md`, read whole by the lane's helpers E3 and E4). Ask nothing K4628/K4630 already answers (K4803, K4809). BOB renders it for him.
- Deliverable 6, `GAP.md`, only after Bob confirms an architecture.

## Context for the successor

- Scratch (helper outputs) does not survive the container. Everything the next session needs is in this folder; the helper shares' findings are summarised in the three deliverables.
- K4814 left three points to the lane: G122's helper question (resolved by K4811 (8), the other containers' audit stays with the lane: covered by option D's declared-size rule S3), S18(d) (does the door bound a PUT body before `arrayBuffer`: PLATFORM P-M1, P-M20), F-7 (the central question: CHALLENGES C7, OPTIONS).
- Method that worked: shares under ~300 KB to sonnet-medium helpers told the task and what follows; consolidators on a fixed schema; a writer; the lane reads the result whole. Cloudflare docs must be fetched as raw Markdown (page URL + `index.md`), never through WebFetch (it summarises).
