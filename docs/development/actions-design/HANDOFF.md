# Actions design lane: handoff to BOB

Numbered entries; BOB answers each in rulings (K). Decision states live in `DECISIONS.md`.

## H1 · 2026-10-09 · the lane has started

**Carries:** ACTIONS-DESIGN #1 (`session_01VDxYUZBV7s4gVx8xWwmCVY`) has started on `design/actions` (N817, K2382), with `RESUME.md` (purpose, rules, plan). It begins step 1, research of canon, rulings, requirements and built modules on actions, including the old-process lane's `docs/development/action-design/` (Bob's rulings of 2026-09-29/30 on the action plan). No ruling asked.

## H2 · 2026-10-09 · steps 1–2 done: what exists and what is missing (page 1)

**Carries:** the working file `actions-design.html`, rendered for Bob at https://claude.ai/artifact/3LPhoZ6geoYBnt7XvDqUM8. From now on the lane updates that one page. Research reports R1–R6 are in `research/`. No ruling is asked of Bob yet; his questions come with the use cases (step 3) and the design (step 4).

**Main finding:** the 11 action modules are built and their requirements met; tests run 2026-10-09: 724/725 (the one red is the accepted filings fixture N819, T40-9a in T41). A member reaches almost none of it: the old interface offers list, create, view and four acts on an action; there are no screens for plans, determinations, consequences, filings, templates, escalation, reminders, holds or following; action to-dos show in the queue but their own reply ops are never drawn (and "Mark resolved" on them is refused). This is N821's and the UX stream's.

**For BOB to note or correct (no ruling from Bob asked):**
- The records-request rules (Case Making D-147, D-148, D-149: one round trip, outcome vocabulary, a due date citing a governing law, a fee quote as evidence, every governing law named) are built but have lost their canonical home since Action §6 made Case Making's action paragraphs history. The lane will place them in its canon draft; until then BOB may want to note it.
- Stale texts (R2 §contradictions, R3 §M): FA Function 3 and Roadmap §10 still say escalation "activates"; State Rules I-11 "marked overdue", §1.2 ID grammar, §4.4 kinds; Publication §3 rule 15(d) matches quotes by the old free-text counterparty; NOTIFICATIONS lists email as open; `filing-templates.md` status says R27 unmet (met, K2233); `following.md` keeps a DRAFT banner; K899 (7) superseded by DEC-113 unmarked; K92 (5), K11, K13 not marked amended; K102's "for now" never lifted for layer-9 modules.
- No K ruling records this lane's start or Bob's 2026-10-09 words; N817 in `next.md` still reads "Not today".
- Ladders TIME L1 records overdue marked on the UTC day (7–8 h early in Pacific); K1657 moved actions R12/R25/R33 to the office's local day, so the ladder note is likely stale: re-check both code sites (U6–U10 worker), correct the ladder.

**Readings this lane settles as detail (BOB to confirm or overrule in a K):**
1. K1466's "activate": the phase waiting on a duty occurrence opens and its options are offered as ready; a member starts each (as action-plans R14/R38 already build); member choice (K590 (1), (7), DEC-69) holds.
2. escalation R29's pre-assembled reason is a sourced list of record facts labelled machine work, not writing help, so it stands beside K1841 (1) (no writing help in a reason field).
3. Addressee and obligor are distinct: an action about a person's statutory duty goes to the enforcing office (Action rule 6 with K1453, K1505 (12)).
4. Where Case Making's action sections and Action v0.1 differ (decision tree vs scenarios, resources, the established-step gate), Action governs (Action §5 #13).

**Next:** step 3, twenty use cases (listed on the page, section 6).

## H3 · 2026-10-09 · step 3 done: twenty use cases; sixteen decisions put to Bob

**Carries:** the twenty use cases traced (`research/U1-U5.md` … `U16-U20.md`) and their synthesis `research/S1-synthesis.md`; the working page (same URL) now has the use-case table (§6) and D1–D16 put to Bob (§7), registered in `DECISIONS.md`. No ruling yet.

**For BOB now (no ruling from Bob needed):**
- S1 §C: 27 lower-level details with proposed settlements (BOB's or this lane's; the lane will fold the design-level ones into step 4).
- S1 §D: 19 defects and record corrections. The ones a tranche may want: the old add form sends a bare-name counterparty that actions R63 refuses, so old-interface actions can only be "undetermined"; the queue shows action to-dos with no door to answer them; wizard `@records-request` names a template that doesn't exist; `filings` R8 refuses a counsel packet without a determination (a defence packet is mislabelled); escalation's "same act" rule (R14, conformance Terms) means a breach cured by a new act can never end; to-dos route to a departed member (queue-producers R15–R18 "else" unspecified); actions R66 puts every correspondence entry in the "what we did" lane, which a published timeline can freeze (K1494) — confidential referrals and counsel advice can leak; a docket legal-pressure mark raises no hold; the Oakland profile has no 2027 holidays and no Brown Act, §933/§933.05, Clerk, PEC or state-body data.
- Earlier corrections to page 1 made: `records_request` is built (action-grammar R3); the "UTC overdue" ladder note is likely stale (K1657).
- D3 (d) revises K600 (a)'s "an overridden action never joins an escalation", recorded as Bob's; it is put to him as a change to his own ruling.

## H4 · 2026-10-09 · Actions D17 ruled: all suggested options listed

**Carries:** Bob, 2026-10-09, on the working page: "My understanding of audience use cases has evolved to the point that I think that all action options should listed, not just the top 5." This replaces K660 (2) (best first five, then the next five on request). **Requirements must say:** the planning run lists every option it proposes, with no cut-off and no paging by five (`action-plans` R34's tray and its `after` cursor are read again; skills R28's planning skill likewise). Unchanged: no score shown (R32, rule 3), options collapsed to their summary with sorting (old lane A16, UX), the member's own options, unticked = undecided (K590 (7)). Order and filters are a detail for the lane's design (step 4) and the UX stream.
