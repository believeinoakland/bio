# READING-ARCHITECTURE lane: state for the next session

**Status** · Written by READING-ARCHITECTURE #1 (`session_01Gpv8oKYGd6HrRswr3cXHmy`), 2026-10-23, at about 47% of its context window (final). Replaced whole at each handoff. Read with `CHARTER.md` and `HANDOFF.md`.

## Done (committed on `lane/reading-architecture`)

| deliverable | file | entry |
|---|---|---|
| 1 | `REQUIREMENTS.md` (97 requirements RR-A1..RR-M5, 49 conflicts, 45 gaps, Bob's questions §6) | RA1 |
| 2 | `PLATFORM.md` (65 Cloudflare pages read raw 2026-10-23, 303 quotes script-checked; spikes in `spikes/`; P-M1..P-M24 live measurements) | RA2 |
| 3 | `CHALLENGES.md` (17 failure classes C1–C17, recurrence table, live facts, unknowns, 17 obligations for OPTIONS) | RA3 |

## In progress: deliverable 4, `OPTIONS.md`

- The lane's design is `options-brief.md`: the shared shape S1–S9, four whole architectures A–D, the comparison axes, the recommendation (D, staged; C the fallback; A not a fallback) and the spike results that bind it (`spikes/options-RESULTS.md`: Workflows run locally but resumed only when poked after a restart; native OCR is only 1.3–1.6x wasm, so D's case is memory headroom and format coverage, not OCR speed).
- A writer (sonnet, medium) expanded it into **`OPTIONS-draft.md` (79 KB), committed UNREVIEWED.** Its writer's notes, to check: WN1 sheet-worker is the formula-recompute engine, not a reader (the brief's A/B lists were wrong); WN2 agent-runner's 27 s start was the default instance size; WN3 three OCR times per page in the inputs (1.6 s live, 6.7–7.9 s spike, 10.4 s comment); WN4 D drawn with "the kind decides", a size threshold left to BOB; WN5 a readers-only bundle idle of 20 MB is an assumption; WN6 RR-F1's "64 MB above idle" cannot hold at an 87 MB idle. It added three points beyond the brief, marked: interactive point reads (`cellsOf`, `cropOf`) must not depend on a cold container; D's exposures (native tools against "no character guessed", GPL/AGPL licences to check, hostile input, no container here has read a real file); a thin job-progress check in C.
- **Next (successor's first act):** read `OPTIONS-draft.md` whole against `options-brief.md`; correct it; save as `OPTIONS.md`, delete the draft, add RA5, push.

## Then

- Deliverable 5, `FOR-BOB.md`: only what is Bob's (P17): the architecture choice A–D at its high level, with an explanation he can understand; money (container cost per heavy read, from PLATFORM §6.4); what members experience (time to whole and "being read N of M", the refusal sentence, whether a safety hold gates reading). Also sort under P17 the questions in REQUIREMENTS §6 and CHALLENGES §6, and SHEET #1's eight and DOCS #1's eleven (K4815, in `envelope-sheets-T51.md` and `envelope-docs-T51.md`, read whole by the lane's helpers E3 and E4). Ask nothing K4628/K4630 already answers (K4803, K4809). BOB renders it for him.
- Deliverable 6, `GAP.md`, only after Bob confirms an architecture.

## Context for the successor

- Scratch (helper outputs) does not survive the container. Everything the next session needs is in this folder; the helper shares' findings are summarised in the three deliverables.
- K4814 left three points to the lane: G122's helper question (resolved by K4811 (8), the other containers' audit stays with the lane: covered by option D's declared-size rule S3), S18(d) (does the door bound a PUT body before `arrayBuffer`: PLATFORM P-M1, P-M20), F-7 (the central question: CHALLENGES C7, OPTIONS).
- Method that worked: shares under ~300 KB to sonnet-medium helpers told the task and what follows; consolidators on a fixed schema; a writer; the lane reads the result whole. Cloudflare docs must be fetched as raw Markdown (page URL + `index.md`), never through WebFetch (it summarises).
