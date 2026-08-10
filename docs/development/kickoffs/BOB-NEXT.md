# BOB — resume here. Written 2026-08-10 by the outgoing BOB, which was asked whether it was still clean enough to run and answered no.

Read `kickoffs/BOB.md` (the role), then this. This file is what that cannot tell you:
the state, the one task waiting, and an honest account of how this session degraded.

## State at handoff — GREEN and PUBLISHED

`origin/main` = **`cc99ec1`**. Battery exit 0, `node bio-plane/scripts/coverage.mjs
--strict` exit 0 read unpiped, `node civicos-ui/test/run.mjs` exit 0, `node
tools/plancheck.mjs` **0 fail / 0 warn**. Working tree clean, local even with the remote.

**The corpus was consolidated today.** Live corpus 7.35 MB → 3.56 MB; the reading a
kickoff demands ~565k → ~295k tokens; 3.83 MB moved to `docs/archive/` with nothing
deleted and nothing edited. `docs/archive/CORPUS-STUDY.md` is the study, the plan,
what was done, and what was deliberately not. **Read it once before touching the corpus.**

**New in the loop, and it is the thing that answers "why do sessions re-ask settled
questions":** `node tools/decided.mjs "<subject>"` indexes all 600 rulings in the corpus
— only 12% of which are in `DECISIONS.md` — and `plancheck` now FAILS on a stale
`docs/DECIDED.md`. Regenerate it in any turn that rules on anything.

---

## THE TASK THAT WAS WAITING — DONE 2026-08-10 by the incoming BOB

**Bob's instruction: the retired substrate (a hosted document-store plus its scripted
endpoint runtime, gone since July 2026) leaves the architecture record. Executed and
landed on `main` (62e6328), and extended the same day on his reaffirmation ("Period."):
the platform-hosting advice to adopting groups was swept too (DEC-67, answered).**

What was done, where to read it:

- Three architecture documents rewritten with per-reference judgment; the retired
  runtime's own sections moved VERBATIM to `docs/archive/architecture/` (two files,
  indexed in `docs/archive/README.md`). Localized references in a dozen further live
  documents rewritten in place. The platform advice in `BIO_Communications_Platforms.md`,
  `BIO_Complete_Roadmap_v5.md` §Function 2 and `BIO_Design_Requirements_v2.md` R9
  restated vendor-neutrally.
- **The append-only ledgers were NOT edited** — their rows are dated records of what was
  measured and decided on that runtime, and a ledger is not architecture. The archive
  keeps every moved byte. `mintid` floors measured identical before and after.
- The doctrine that outlived the runtime stays live, stated by PROPERTY rather than
  vendor: the constrained-endpoint admission criteria, the interruption model, the
  full-id-is-the-identity rule, the store-enforces-its-own-guarantees rule, the
  one-check-codebase law and its embedded-gate transport.

**The standing rule this leaves behind: the retired substrate's vendor names do not
appear in live surfaces.** Dated ledger rows, measurement literals (a recorded
user-agent string), code literals the plane still excludes by name, and the archive are
the four licensed exceptions — each is a record or a mechanism, not a description of the
architecture.

---

## THE SESSION-HEALTH ACCOUNT, because you will need it about yourself

Asked whether it was still clean enough to run, this session's honest answer was **no**,
and the reason is not the number of mistakes. **It is that four of them were one class,
and the fourth landed inside the paragraph describing the class.**

- The DECIDED index **indexed its own output** and reported 997 rulings against 568 — an
  instrument answering about itself, in the tool written to relieve exactly that.
- The generated index then **made an op claim it was only QUOTING**, and `op-claims`
  attributed it to the index rather than the source.
- My `QUEUE.md` register **manufactured a claim about an op that has never existed**, by
  truncating a real op name mid-token.
- Writing that defect up, **`CORPUS-STUDY.md` asserted the same non-existent op** and
  turned the battery red.

Every one was caught by a gate rather than by review, and nothing durable was lost. But
the class narrowed while the corrections were being written, which is what saturation
looks like from the inside. **Two framing errors point the same way:** this session first
measured the corpus in LINES, which understated the ledgers by half and made a volume
problem look like a tidiness problem; and it accepted the premise that the corpus was
full of duplicated statements, which measurement put at **1%**.

**So: when your corrections start landing in the same place as your errors, hand off.**
That rule came from the outgoing CONDUCT on 2026-08-09 and it applied here one day later.

## Owed to Bob — do not re-derive

**Five `open` entries in `DECISIONS.md`: DEC-43, DEC-48, DEC-50, DEC-51, DEC-53.** All
raised 2026-08-04, all running under provisionals, none blocking. **DEC-53's revisit
trigger has FIRED** (bulk resolution, via DEC-52's 2026-08-06 mechanism) and it is the
one to put first.

**One ruling never got a DEC number and is genuinely his** — D-266 in `DEBT.md`: may one
team's dismissal silence another team's notification about that other team's stance?
`proposal_dispositions` is instance-wide by design (DEC-16) while a stance is a project's
own property (§7, D-216), and the record settles neither. Free to decide either way today.

**D-205 — rotate `BIO_ADMIN_TOKEN`.** His alone. The credential was printed into a worker
transcript by a stack trace; it is admin over the live instance. The machine path is the
clipboard route `CLAUDE.md` defines.

## What this session did NOT do, so nobody assumes it did

- `INTERFACE-CHANGES.md` was not rolled: IC-39 through IC-57 are resolutions CONDUCT
  still owes, not closed history.
- `MEASUREMENTS.md` and `DECISIONS.md` were not rolled.
- Four HELD claims dated 2026-08-09 remain in `CLAIMS.md` and look stale. **Releasing
  another session's claim is CONDUCT's, not housekeeping.**
- ~~The substrate-removal task above~~ — done, see above.

---

# THE INITIAL PROMPT FOR THE NEXT BOB — paste the block below the rule

---

Kickoff: session BOB, new focus. You support Bob's requirements / UX / architecture work
for the BIO / CivicOS project.

Working directory is `/Users/sparky/ClaudeCodeBIO` (the wrapper); the repo is `bio/`.
**Persona is `bio`** — GitHub `biobobkrause`, Cloudflare account
`20b533579290b9b93168345edd3b7f72`. Never the `neo` persona, which this machine defaults
to. Credentials are in `.env`; read them there, never print one.

**Run in your own worktree** (`bio-worktrees/BOB`) unless `git worktree list` and a clean
tree show main is free. A live CONDUCT session holds `main` and merges continuously; one
session per tree (DEC-3). Fetch before anything.

READ IN THIS ORDER, and trust `origin/main` over anything in this prompt:
  `CLAUDE.md`
  `docs/development/kickoffs/BOB.md`            (the role, and the closing protocol)
  `docs/development/kickoffs/BOB-NEXT.md`       (START HERE — state, the task, the health account)
  `docs/archive/CORPUS-STUDY.md`            (what the corpus is, and what was done to it)
Then `git fetch` and verify the state yourself rather than believing it.

**BEFORE RAISING ANY QUESTION**, run `node tools/decided.mjs "<subject>"`. 600 rulings are
indexed and only 12% are in `DECISIONS.md`. It is a floor on what has been settled, never
a ceiling.

**YOUR FIRST JOB IS THE STANDING ONE:** read `DECISIONS.md` and surface every `open` entry
to Bob in one line each. There are SIX — DEC-43, 48, 50, 51, 53, 67 — plus D-266's
unnumbered ruling and D-205, which is his alone. Do not re-argue them; surface and
recommend. DEC-53's revisit trigger has FIRED; it goes first.

**The substrate-removal task is DONE** (2026-08-10, landed on `main` at 62e6328;
scope and outcome recorded above). **YOUR FIRST WORKING MOVE:
work the open decision list with Bob** — DEC-53's fired trigger first, then DEC-67
(raised by the removal), then the 2026-08-04 four — and take his focus from there.

MECHANICS, unchanged and binding:
  - Decisions that are genuinely Bob's only — doctrine, his risk, effects on people
    outside the project. Resolve everything the repo answers. **Tactical calls are yours;
    never block on him, and never report tactical STATE.**
  - Gate every push with `node tools/gates.mjs` — it measures the diff and runs the
    profile the change class owes: docs-only prose runs the doc-facing suites plus
    plancheck; anything else runs the full four (battery, `coverage.mjs --strict`
    read UNPIPED, `civicos-ui/test/run.mjs`, plancheck).
  - Regenerate `docs/DECIDED.md` in any turn that rules on anything; plancheck gates it.
  - Hand architectural change over through the `BOB INBOX` at the top of `QUEUE.md`,
    append-only. Correct any kickoff your change supersedes in the same turn.
  - NOTATION IS SETTLED: `classDiagram` for structure, `stateDiagram-v2` for lifecycle,
    edges labelled with the ACT. Never mix; never hand-roll arrow semantics.
  - The review document: source `docs/development/research/review-document.html`,
    published at https://claude.ai/code/artifact/7862c5d4-0454-429c-8b9c-00492b61e4ef —
    edit the file, verify, republish **passing `url:`** or Bob's link silently breaks.
    Favicon 📋, keep it. Run `tools/mermaid-check.mjs` before any republish.
  - Measure, do not recall. Read the repo rather than remembering it.

**And the one to carry above any of it:** an instrument that answers about ITSELF reads as
a measurement of something else. When your corrections start landing in the same place as
your errors, hand off.
