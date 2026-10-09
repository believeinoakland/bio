# Resume: actions design lane

**Lane:** ACTIONS-DESIGN #1 (`session_01VDxYUZBV7s4gVx8xWwmCVY`), started 2026-10-09 by BOB #146 (`session_017Mqb4UstLxePtEby56C1kS`) on Bob's direction (D43 of the investigation lane, K2382; entry N817 in `build/plan/next.md`). Branch `design/actions`.

**Purpose.** Bob, 2026-10-09: "we need to dive every bit as deeply into the requirements, current capabilities, additional capabilities needed, design, and use cases of Actions" as the investigation lane did for investigations. This lane researches, maps, and designs the support CivicOS gives members through the action plan, and ends with a canon draft and a hand-off to BOB for requirements.

## Rules of the lane

- Write ONLY `docs/development/actions-design/` on `design/actions`. Never `build/`, canon (`docs/architecture/`), product code, `docs/development/ux-substrate/`, or `main`. Commit and push after each step.
- P17 with Bob: he decides only policy, doctrine, requirements, high-level architecture and UX, each brought with a plain explanation, options and a recommendation, with full context (his standing direction to the investigation lane: background, what exists, an example of each option, trade-offs, reasons). Show him documents rendered as Artifacts, never Markdown source. He does not edit files or enter commands. Lower-level choices are made here or by BOB, not asked.
- Bob's decisions here are D-numbers in `DECISIONS.md`, from D1; written "Actions D<n>" where they could be confused with the investigation lane's D's. Never K or DEC numbers.
- Hand-offs to BOB go in `HANDOFF.md` as `H<n>`; BOB answers with K rulings. Requirements stay BOB's (P5). Canon changes are approved by Bob and placed by BOB.
- Screens are owed to the UX design stream; this lane designs behaviour, requirements, capabilities and use cases.
- Keep this file current. When context passes half its window: update it, say in `HANDOFF.md` a successor is needed (BOB starts it).

## Model to follow

The investigation lane, branch `design/investigation`, `docs/development/investigation-design/` (`RESUME.md`, `HANDOFF.md` H1–H43, `DECISIONS.md`, `investigation-design.html`): one working page rendered for Bob, carried forward; decisions register; hand-offs; ended with canon `BIO_Investigation_v0_1.md` (K2419–K2421).

## Prior work to build on (not this lane's)

- `docs/development/action-design/` (singular, on `main`): ACTION_DESIGN #1 of the old process, 2026-09-29/30: `ACTION-PLAN.md` (Bob's ten rulings of 2026-09-29 on the action plan, and MATRIX §6 D1–D6 agreed 2026-09-30), `INVENTORY.md`, `MATRIX.md`, `sources/`. Its D-numbers are that lane's, not this one's; cite them as "action-design 2026-09-30 D<n>".
- Canon: `BIO_Action_v0_1.md`, `BIO_Case_Making_v0_1.md` §THE ACTION PLAN, `BIO_Investigation_v0_1.md`, Capability Ladders actions rungs.

## Plan

1. **Research** what exists: canon on actions, investigation canon, Ladders actions rungs, earlier Actions rulings in `build/rulings.md`, requirements of the modules that carry actions (`build/modules.json`), the prior action-design folder. Workers read in full and summarise with citations.
2. **Map** current capabilities (built and tested) against canon and rulings; name every gap.
3. **Use cases:** complaints, filings, public comment, records requests, meetings, campaigns, follow-ups on outcomes; each traced through today's product and what it should do.
4. **Design:** requirements, capabilities, behaviour; each open question to Bob with options and a recommendation.
5. On Bob's approval: canon draft and a hand-off to BOB for requirements (as investigation H43).

## State

- 2026-10-09: started; RESUME and HANDOFF H1 written.
- 2026-10-09: step 1 under way. Six readers write `research/R1`–`R6`: R1 core canon (Action, Case Making, Investigation, Ladders), R2 other canon, R3 rulings (incl. UX DECs), R4 the old action-design lane, R5 the action modules (requirements, code, tests run), R6 adjacent modules and what a member can do today. Next: read them, write the step-1/2 synthesis into the working page `actions-design.html`, render for Bob.
- 2026-10-09: steps 1–2 done. R1–R6 in `research/`. Working page `actions-design.html` = https://claude.ai/artifact/3LPhoZ6geoYBnt7XvDqUM8 (publish the same file path to update; from a new session pass that URL). HANDOFF H2. Next: step 3, the twenty use cases in page §6, each traced today vs should; then step 4 questions to Bob (D1 on).
