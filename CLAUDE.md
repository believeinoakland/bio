# BIO UX Study — lane charter

Loaded automatically, every session. Read it whole. It says what this lane is for, which of BIO's
rules bind it, which do not, and how its work is kept.

## 1. Purpose

Study the experience of CivicOS **top to bottom**: every person who touches it, every path they take,
from a group installing its instance to a member answering a question, making a case, telling a story
and taking action on a living civic system. The product of this lane is **a UX design proposal Bob can
rule on**, not code. The current UI is evidence to study, not a constraint to preserve.

## 2. Scope: what this lane may do

**This lane owns BIO's UX design, broadly** (Bob, 2026-09-24). It studies options, and it creates
and evolves the UX that is actually built and integrated into the BIO code base. **It may touch
whatever in the `bio` repo it needs to for that.** There is no path fence.

**Everything this lane saves is DISJOINT from BIO development** (Bob, 2026-09-24). BIO development
runs separately, under a different account. This lane never writes where that process writes.

- **Refs it writes:** `ux-study` (the study record) and branches named `ux/<topic>` (a finished
  change to the product, based on `main`). No others.
- **Refs it never writes:** `main`, `coord`, `land/*`, worker branches, `gate-results`, or any other
  branch it did not create.
- **Shared state it never writes:**
  - no `tools/mintid.mjs` (the lane numbers its own items `UX-n`)
  - no `coord.mjs write`: no BOB INBOX, QUEUE, CLAIMS or handoffs
  - no ledger rows or measurements filed into BIO's registers
  - no messages into the dev lanes
  - no deploys
- **Reading is unrestricted:** `main`, `coord`, the tools, the corpus, and the running UI (with
  `store=scratch` on every live call).

**How the UX reaches the product.** A `ux/<topic>` branch carries a complete, tested change: it runs
`main`'s own suites green, and its commit says what it changes and why. It enters `main` only when
Bob hands it to BIO development, which integrates it by its own process: rows, gates, the train and
deploys. Because live UI work also touches `civicos-ui/app.html`, a `ux/` branch stays small and is
rebased onto `main` just before handoff.

**On `ux-study`, this charter governs.** A `ux/` branch is held to `main`'s test suites so that it can
be integrated, but it is not bound by `main`'s process, which is for the lanes that write to `main`.

## 3. What binds, and what does not

**Binds: the doctrine. It is what the design exists to express.**

- CivicOS exists to answer questions, make a case, tell a story and take action (Bob, 2026-08-01).
- **Trustworthiness of the record is the product.** "Less narrative" binds us first. A screen that
  makes the record look like it says more than it can support is a worse defect than a missing
  screen.
- **Sparse is normal.** When something is missing, the UI must say *which* layer is missing: no meaning
  derived, nothing extracted, the document never read, or nobody looked. Designing that honesty is
  first-class work, not an error state.
- No structural prior against any class of actor. Bad actors are identified by evidence.
- **Undetermined is first-class and stated.** That goes for the UI and for this lane's own claims.
- **Do not guess.** Use `bio`'s tools for every claim about the system:
  - `node tools/status.mjs <topic>`: what is built, partial or absent.
  - `node tools/decided.mjs "<subject>"`: what Bob has ruled.
  - The design corpus, cited by **section**.

  "Not found" is not "absent": say which.
- **Live calls name `store=scratch`, every time.** Never drive the ops that refuse scratch
  (invitelook, enroll, instancegroup, groupidentity) against the live instance. Use the UI's mocks for
  those flows.

**Does not bind the study: the development process.** No gates, `plancheck`, `CLAIMS.md`, ledgers, `QUEUE.md`,
`construct-status.json` upkeep, lane messaging or DIST rules. Those govern changes to the product,
and the study changes none of it. The lane does not change `main` itself (§2).

## 4. Every claim carries its state

Tag every statement about a screen, flow or capability with one of these:

| tag | meaning | evidence required |
| --- | --- | --- |
| **BUILT** | exists and a person can reach it | `status.mjs` plus the UI, seen |
| **DESIGNED** | ruled or specified, not built | a corpus section or a `decided.mjs` hit |
| **PROPOSED** | this lane's idea | none, but labelled as ours |
| **UNDETERMINED** | nobody has said | say who would decide |

A proposal that silently assumes an unbuilt substrate is a defect in the proposal.

## 5. Method: the study proceeds in this order

1. **Inventory.** Who: every actor and role (Membership, Assistant & AI Roles). What: every construct
   a person meets (System Design map). Where: every current screen and state, captured.
2. **Journeys.** One file per end-to-end journey, stitched from all three inventories. At minimum:
   - install and first run
   - invite, enroll and join, including discoverable and hidden projects
   - capture and intake
   - asking a question and getting an answer, including sparse and refused answers
   - making a case
   - telling a story and publishing
   - taking action
   - working with the assistant
   - review and release
   - governance and membership changes
3. **Critique.** For each journey: where the current UI, or the absence of one, fails the doctrine or
   the person. Cite the screen and the corpus section.
4. **Divergence.** Alternative concepts per journey, cheap and many. See §7 for where this happens.
5. **Convergence.** A recommended information architecture, interaction model and pattern library.
   Patterns for provenance, uncertainty, sparseness, refusal and declared bias come first: they are
   where CivicOS differs from every other product.
6. **Proposal.** What Bob rules on: decisions requested, each with its options and our
   recommendation.

## 6. How the work is kept

| path | what | read how |
| --- | --- | --- |
| `CLAUDE.md` | this charter | whole, every session |
| `STUDY-NEXT.md` | where the study stands and what is next, from measured state | whole, every session |
| `DECISIONS.md` | Bob's rulings in this lane, dated, verbatim where possible | looked up |
| `QUESTIONS.md` | open questions only Bob can answer, batched | whole, when meeting Bob |
| `inventory/` | actors, constructs, screens (with screenshots in `screens/`) | by file |
| `journeys/` | one file per journey: map, critique, concepts | by file |
| `patterns/` | converged patterns | by file |
| `prototypes/` | clickable HTML, styled from `bio/civicos-ui/tokens.css` | published as artifacts |
| `rounds/` | `PLAYBOOK.md` (how a round runs), `CLOSING-PROMPT.md`, one folder per round | playbook whole, before a round |
| `claude-ai/` | the claude.ai project's instructions, glossary and setup | by file |
| `proposal/` | the deliverable | whole |

- Commit and push at the end of every working block. A container is not a record.
- Past 75% context: write `STUDY-NEXT.md`, push it, and hand over to a fresh session.

## 7. The two venues

- **Claude Code** (this lane's home): anything that needs the whole corpus, the code, the tools,
  the running UI or the record.
- **claude.ai**: bounded rounds of divergent thinking. Each round starts from a packet this lane
  writes, under 40k tokens: the charter's §1, §3 and §4, one journey or question, the relevant
  excerpts and screenshots, and what to bring back. Each round ends with a round summary returned to
  `rounds/`.
- Nothing from claude.ai is recorded as BUILT or DESIGNED until this lane has checked it against the
  record.

## 8. Working with Bob

Bob is the architect and the design authority. Bring him doctrine, priority and decisions between
real alternatives, batched in `QUESTIONS.md`, each with a recommendation. Decide everything else.
Report what was learned and decided, not activity. When he is wrong, show the evidence.
