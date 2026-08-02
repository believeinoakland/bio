# The case-making research study — what to read, and in what order

Sixteen files, ~1.1 MB, produced by thirteen passes between 2026-08-01 and 2026-08-02.
This file exists because the directory does not explain itself: four of the passes are
SUPERSEDED, three were written in parallel by sessions that could not read each other, and
a reader who opens one at random will read text that has since been overturned.

## The review document

**The consolidated record of this study, with the diagrams, is published for Bob's review:**

    https://claude.ai/code/artifact/7862c5d4-0454-429c-8b9c-00492b61e4ef

It carries the journey, the ten surfaces, the layer stack, the 94-process coverage matrix,
the 133 drawn states, what does not exist, the seventeen decisions and the six questions
still open. It is a RENDERING of the files below and is not authoritative over them — where
it and `RECONCILED.md` disagree, `RECONCILED.md` is the design. First published
2026-08-02 by session BOB.

## Reading order

1. **`RECONCILED.md` — THE DESIGN.** Read it first and read it whole. It resolves 38
   contradictions across the corpus, applies the four resolutions R1–R4 passage by passage,
   and re-derives the build order (17 of 35 items changed, 18 unchanged, 0 added). **Where
   it and `SB-CORE` / `SB-EVIDENCE` / `SB-OUTPUT` / `BUILD-ORDER` disagree, it wins and
   those four are history.**
2. **`BUILD-ORDER.md` §2** — the queue-format items, as amended by `RECONCILED.md` §3. Do
   not take an item from here without checking §3 first: eleven items instruct a worker to
   build behaviour the resolutions REFUSE.
3. **`PROBLEM-DOMAIN.md`** — the only externally-sourced pass, and the one that contradicts
   the design. It is what produced DEC-13 and DEC-14.
4. **`CRITIQUE.md`** and **`COMPLETENESS-AUDIT.md`** — the adversarial and coverage passes.

Everything else is an input to those four: `JOURNEY-PRIMARY` (the path and the ten
surfaces), `UI-BASELINE` (what exists today), `SB-CORE` / `SB-EVIDENCE` / `SB-OUTPUT` (the
storyboards), `PROCESS-CATALOGUE` and `MACHINE-PROCESSES` (the 94 processes), `LAYERS`,
`CAPABILITIES`, `AUDIENCES`, `DATA-MODEL`.

## Two things that will mislead a reader who does not know them

- **`AUDIENCES.md` uses one word for two concepts** (D-156): in requirements gathering
  "audience" means USER TYPES, and about a published case it means the READERS of that
  case. The file enumerates eight "audiences" mixing both. Adopted vocabulary: AUDIENCE is
  the reader of a published case; USER TYPE (or ARCHETYPE) is the requirements sense.
- **`AUDIENCES.md` §9 lists pre-publication contact among its HAZARDS.** That is overturned
  by DEC-13 and D-153 — the practice literature treats it as the required workflow. The
  pass is deliberately NOT edited, because a pass is a record of what it concluded and
  correcting it in place would hide that the evidence arrived later.

**Research passes are not edited after the fact.** They take a pointer; the correction
lives in a live surface (`DECISIONS.md`, `DEBT.md`, `MILESTONES.md`). That is the same
treatment `RECONCILED.md` gave the storyboards, and it is deliberate.
