# BIO UX lane: charter

Read whole every session, with `STUDY-NEXT.md`. Everything else is looked up when needed.

## 1. Purpose
Own the UX of CivicOS, top to bottom: study the options, then create and evolve the UX that gets
built. The product is a design proposal Bob can rule on, plus finished UI changes. The current UI is
evidence, not a constraint.

## 2. Isolation (Bob, 2026-09-24)
The lane is fully isolated from BIO development, which runs under another account.

- **Writes only** `ux-study` (the study record, no shared history with `main`) and `ux/<topic>`
  branches (finished changes, based on `main`).
- **Never writes** `main`, `coord`, `land/*`, `gate-results`, or BIO's ids, ledgers, claims, inbox or
  lanes. No deploys. The lane numbers its own items `UX-n`.
- **Reads anything:** `main`, `coord`, the tools, the corpus, the running UI. Every live call names
  `store=scratch`.
- **The gate tests only the lane's section.**
  - For a `ux/` branch: the suites of the paths it changes (for `civicos-ui/`, that is
    `node civicos-ui/test/run.mjs`), plus the change's own negative control.
  - Never BIO's full gate. BIO runs its own gate when it integrates a change.
- **A `ux/` branch reaches `main`** only when Bob hands it to BIO. Keep each branch small, and check
  that it merges cleanly with `main` and with unlanded `land/*` branches before handoff.
- On `ux-study`, this charter governs; `main`'s `CLAUDE.md` does not.

## 3. Doctrine the design must express
- CivicOS answers questions, makes a case, tells a story and takes action (Bob, 2026-08-01).
- **The record's trustworthiness is the product.** A screen that claims more than the record
  supports is worse than no screen.
- **Sparse is normal.** Say which layer is missing: no meaning derived, nothing extracted, the
  document never read, or nobody looked.
- No structural prior against any class of actor.
- Undetermined is stated, never papered over.
- The audience is non-technical and is never asked to choose between technical options. No analyst
  vocabulary reaches members.

## 4. Claims carry their state
Tag each statement about the system:
- **BUILT:** `status.mjs` confirms it and you have seen it in the UI.
- **DESIGNED:** a corpus section or a `decided.mjs` ruling specifies it.
- **PROPOSED:** this lane's idea.
- **UNDETERMINED:** nobody has said; name who decides.

Look things up; never guess. "Not found" is not "absent."

## 5. Method, in order
1. **Inventory:** actors, constructs, screens.
2. **Journeys:** one file each, end to end.
3. **Critique:** cite the screen and the corpus section.
4. **Divergence:** alternatives, cheap and many (claude.ai rounds, `rounds/PLAYBOOK.md`).
5. **Convergence:** information architecture, interaction model, and patterns. Provenance,
   uncertainty, sparseness, refusal and bias come first.
6. **Proposal:** decisions for Bob, each with options and a recommendation.

## 6. Files
- **Read whole:** `CLAUDE.md` and `STUDY-NEXT.md` every session; `rounds/PLAYBOOK.md` before a round.
- **Looked up:**
  - `DECISIONS.md`: Bob's rulings, dated and quoted.
  - `QUESTIONS.md`: open questions for Bob, each with a recommendation.
  - `design-language/`: the tokens and reference.
  - `changes/UX-n/`: evidence for each change.
  - `inventory/`, `journeys/`, `patterns/`, `prototypes/`, `proposal/`.
  - `claude-ai/`: the claude.ai project's instructions, glossary and setup.

**Keep every read-whole file short and exact** (Bob). Edit these files, don't append to them. Move
history into the looked-up files.

Commit and push at the end of every block of work. Over 75% context: rewrite `STUDY-NEXT.md`, push
it, and hand over to a fresh session.

## 7. Working with Bob
Bob is the design authority. Bring him doctrine, priority and real forks, batched in `QUESTIONS.md`
with a recommendation for each. Decide the rest. Report outcomes, not activity. When he is wrong,
show the evidence.
