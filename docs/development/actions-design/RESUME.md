# Resume: actions design lane

**State: RESUMED 2026-10-10** by ACTIONS-DESIGN #2 (`session_01RukQneSYmxg4FvfJ9aXccd`, Bob's primary account), started by BOB #149 (`session_01EyAmJMZV2GNzEmkDJkdcik`) on Bob's direction of 2026-10-10 ("Yes, start actions design and ux substrate lanes"). The working page is now https://claude.ai/artifact/JH9AK7rgmxRNR9QjPL3s5d (H10). Earlier: paused 2026-10-10 by Bob ("Pause development and save everything to the repo so that development can continue in the other account"). Everything is on branch `design/actions` in this folder. A successor continues from here, in any account, by reading this file whole, then `DECISIONS.md`, then `HANDOFF.md` H1–H9, then the working page `actions-design.html` (its §7 holds every decision's full text as Bob saw it).

**Lane:** ACTIONS-DESIGN #1 (`session_01VDxYUZBV7s4gVx8xWwmCVY`), started 2026-10-09 by BOB #146 (`session_017Mqb4UstLxePtEby56C1kS`) on Bob's direction (investigation lane D43, K2382; N817 in `build/plan/next.md`). Branch `design/actions`. Model: the investigation lane on `design/investigation`, `docs/development/investigation-design/`.

**Purpose.** Bob, 2026-10-09: "we need to dive every bit as deeply into the requirements, current capabilities, additional capabilities needed, design, and use cases of Actions" as the investigation lane did. The lane researches, maps, and designs how Civicsmith supports members through the action plan, and ends with a canon draft and a hand-off to BOB for requirements.

## Rules of the lane

- Write ONLY `docs/development/actions-design/` on `design/actions`. Never `build/`, canon (`docs/architecture/`), product code, `docs/development/ux-substrate/`, or `main`. Commit and push after each step.
- P17 with Bob: he decides only policy, doctrine, requirements, high-level architecture and UX, each brought with full context (his standing direction: background, what exists, a concrete example of each option, trade-offs, reasons for the recommendation), in plain language with no module names or R-ids in Bob-facing text. Show him documents rendered as Artifacts, never Markdown source. He does not edit files or enter commands. Lower-level choices are made by the lane or BOB, recorded, not asked.
- Bob's decisions here are D-numbers in `DECISIONS.md` ("Actions D<n>" where confusable with the investigation lane's). Never K or DEC numbers. Record his words verbatim.
- Hand-offs to BOB go in `HANDOFF.md` as `H<n>`; BOB answers with K rulings. Requirements stay BOB's (P5). Canon changes are approved by Bob and placed by BOB.
- Screens are owed to the UX design stream; this lane designs behaviour, requirements, capabilities and use cases.
- When context passes half its window: update this file, say in `HANDOFF.md` a successor is needed.

## The working page

- Source: `actions-design.html` in this folder (HTML artifact source: no `<html>/<head>/<body>`; `<title>Actions Design</title>`; tokens on `:root` with dark-mode blocks; styling modelled on the investigation lane's page).
- **Current page (this account): https://claude.ai/artifact/JH9AK7rgmxRNR9QjPL3s5d** (icon `compass`, published 2026-10-10 by ACTIONS-DESIGN #2); republish this one.
- Formerly published by the old account at https://claude.ai/artifact/3LPhoZ6geoYBnt7XvDqUM8. That artifact belongs to the old account; a session in another account cannot republish to it unless Bob grants edit access. **In the new account, publish `actions-design.html` as a new artifact (icon `compass`)** and give Bob the new link; record it here and in HANDOFF.
- Sections: 1 Bob's direction · 2 what canon says an action is · 3 what is built · 4 the gaps · 5 readings settled here · 6 the twenty use cases (table) · 7 decisions for Bob (D1–D24, each with background, options with examples, trade-offs, recommendation; ruled ones tagged with Bob's words) · 8 the research record.
- Bob comments on the page. Two comment threads on the old artifact were left open for his reply: D18 (narrowing the override) and D19 (scenario count). Their content is in §7 and `DECISIONS.md`.

## Where the work stands

1. **Step 1, research: done.** `research/R1`–`R6` (core canon; other canon; rulings incl. UX DECs; the old 2026-09-29/30 action-design lane; the 11 action modules with tests run 2026-10-09, 724/725, the one red the accepted filings fixture N819; adjacent modules and what a member can do today).
2. **Step 2, map: done.** Page §3–§5; HANDOFF H2. Main finding: the backend is built and green, a member reaches almost none of it (old interface: list, create, view and four acts on an action); what exists serves one shape (a group acting against an office over a breach).
3. **Step 3, use cases: done.** `research/U1-U5.md`, `U6-U10.md`, `U11-U15.md`, `U16-U20.md` (twenty traced cases, Oakland/California law cited, "verify" marks where unchecked); `research/S1-synthesis.md` (§A table, §B the sixteen consolidated decisions with "For BOB" refs, §C 27 details for the lane/BOB, §D 19 defects, §E capabilities needed).
4. **Step 4, the design: in progress (decisions phase).**
   - **Ruled:** D1, D2, D3, D4, D5, D6 (2026-10-11, H11), D7, D8 (2026-10-11, H12), D9 (H13), D17, D20, D21, D22, D23, D24 (words and readings in `DECISIONS.md`; requirements notes in HANDOFF H4–H8).
   - **Open with Bob:** D10, D11, D12, D13, D14, D15, D16, D18, D19.
5. **Step 5: not started.** When Bob has answered: write the design itself on the page (requirements, capabilities, behaviour), folding S1 §C details and §E capabilities, the D20 principles 1–6, D21's re-examination, and a proposed capabilities ladder for actions (none exists in `BIO_Capability_Ladders_v0_1.md`); then a canon draft (amending `BIO_Action_v0_1.md`, including §2/rule 2 for D24, rule 2's classes for D1, the records-request rules D-147/148/149 given a home) for Bob's approval, then a hand-off to BOB for requirements, as the investigation lane's H43.

## Next actions for a successor

1. ~~Publish `actions-design.html` as a new artifact in the new account~~ done 2026-10-10 (H10); D6, D8–D16, D18, D19 put to Bob again the same day.
2. Record each answer verbatim in `DECISIONS.md`, tag it on the page, add an `H<n>` with what requirements must say, commit and push.
3. Then step 5 as above.

## Log

- 2026-10-09: started; RESUME, HANDOFF H1, DECISIONS. Six research readers R1–R6.
- 2026-10-09: steps 1–2 done; working page published; H2. Page corrections later: `records_request` is built (action-grammar R3); the ladders' "overdue on the UTC day" note is likely stale (K1657).
- 2026-10-09: step 3 done (U1–U20, S1); D1–D16 put to Bob; H3.
- 2026-10-09: Bob's comments and answers: D17 ruled (all options listed; replaces K660 (2)); D18, D19 put from his questions; D20–D22 ruled (responses that are infractions; re-examination on a reported response; publications record actions taken); D23 ruled (a case checked then held to act first); D24 put; D1, D2, D3, D4, D5, D7 ruled; D6 re-explained; D24 ruled. H4–H8.
- 2026-10-10: paused by Bob for continuation in another account; H9.
- 2026-10-10: resumed by ACTIONS-DESIGN #2 (`session_01RukQneSYmxg4FvfJ9aXccd`) in Bob's primary account; page republished as https://claude.ai/artifact/JH9AK7rgmxRNR9QjPL3s5d; the twelve open decisions put to Bob again; H10.
- 2026-10-11: D6 ruled (6a a, 6b b, 6c a, 6d b); H11.
- 2026-10-11: Bob confirmed D7 ("D7: as recommended"), unchanged from 2026-10-09; asked whether he meant D8.
- 2026-10-11: D8 ruled as recommended; H12.
- 2026-10-11: D9 ruled (b); H13.
