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

## H5 · 2026-10-09 · Actions D18–D20 put, D20–D22 ruled: responses and what they change

**Carries:** D18 (narrowing the breach override to stated grounds) and D19 (the number of scenarios; K590 ruling 8) put to Bob from his page comments, open. Bob, 2026-10-09, on D20 and beyond (words in `DECISIONS.md`):
- **D20 ruled:** a response that may itself be an infraction becomes a new matter, kept in the same project or opened as a linked project, member's choice each time, linked both ways. The lane's principles stand (the body's response is evidence, the group's own act never is; suspected until a member determines; good faith first; the case changes only through evidence, docket entry at once; the plan gains the matter; the chain shown, never a count).
- **D21 ruled:** "The system's support for actions should respond to reported responses by investigating how it affects the actions being taken or planned. The action options should be updated accordingly." Lane's reading: on a recorded response, a deterministic re-examination for every member (clocks recomputed, phases whose start holds, options whose premise or date changed marked, the profile's next routes offered) plus AI where enabled (investigation lane D34–D39); suggestions added and affected options marked with why; chosen options, scenarios and actions change only by a member's act (K590 (1), (7)).
- **D22 ruled:** plans may be acted on before a case is published, so a publication may include a record of actions taken. Reading: the published "what we did" lane (K1494; actions R66) carries outward acts only, never the plan's deliberation (DEC-25), never confidential or counsel-matter items (D4 open).
- Bob asked whether a missed reply date must be answered on evidence before it is a violation: answered yes, as canon already holds (Ladders §10; notice-producers R5; action-plans R38): "Noticed" until a member determines noncompliance against the standard on the record.

**Requirements must say (when the design is folded):** the "arose from" link between a response and a new matter, both ways, across projects; the response-driven re-examination (D21) as an act-triggered read and, where enabled, an AI run within the account's limits; the published lane's exclusions (D22 with D4).

## H6 · 2026-10-09 · Actions D1 and D23 ruled; D24 put

**Carries:** Bob, 2026-10-09: "D1: as recommended" — (c): outward acts are classed by what the text does; asking an office to examine, or enforcing the group's own request on its own dated record, is never held back; a sentence asserting a breach needs a determination or the open override; flagged sentences are resolved by the member before approval, her confirmation recorded (S1 §B1 "For BOB": `actions` R8, `filings` R6). D23 (Bob's words in `DECISIONS.md`): a case may pass every publication check and be held, unpublished, while the project acts first — a "checked and held" state, no time limit, voided by any change to the evidence until re-run. D24 put to Bob: may a determination rest on a checked-but-held case (today `conformance` R2 needs a published edition; Action §2).

## H7 · 2026-10-09 · Actions D2, D3, D4, D5, D7 ruled; D6 re-explained

**Carries:** Bob, 2026-10-09: "D2: C / D3: as recommended / D4: A / D5: as recommended / D6: Need a better, more detailed explanation / D7: A". Each decision's full text with its "For BOB" refs is S1 §B (B2–B5, B7). In brief, requirements must say:
- **D2:** everything the group sends (filings R1–R5, communications R23) gets the case-account check (Investigation §11, D56): unsupported sentences pointed out; a sentence the record contradicts held by default, sendable only by the open override with a reason (Action rule 2's pattern); questions never flagged; claims about a body rest on the published (or, if D24 rules so, checked) case or the group's own dated correspondence.
- **D3:** the window computed and shown beside the gate's refusal (action-clocks R2 from a profile §54960.1 rule, not yet held); a quick one-finding case path, no publication check waived; and (d) an action sent under override may join the escalation once a determination is made, override kept in its history — **revises K600 (a)** (escalation R23).
- **D4:** three scopes: confidential act (never in any published product or timeline; actions R66 excludes it from the published lane); counsel matter as its own project membership (never published, never evidence, privilege marking on packets, warning on sharing outside); a member's own source role stays in her hidden project. Promises to people as notes on the action.
- **D5:** a curing act counts for "compliance restored" (escalation R14, conformance "same act" — the §D defect); harm addressed = a member's reasoned statement with evidence per part, optional words (remedied, mitigated, compensated, acknowledged, cannot be undone), no percentage; a dated outcome entry on the published case at once (docket R1), the determination with the next edition.
- **D7:** a spoken promise becomes a commitment Civicsmith holds the body to only once confirmed in writing or stated publicly; until then "as heard" in members' own accounts; the office's silence after the group's confirming letter recorded as a dated fact.

## H8 · 2026-10-09 · Actions D24 ruled: a checked, held case supports a determination

**Carries:** Bob, 2026-10-09: "D24: B". A member may determine a breach on findings that passed every publication check and are held (D23). **Requirements must say:** `conformance` R2 accepts a finding-version that is a member of a checked-and-held edition of the project as well as a published one, pinning that check; actions and everything prepared from them carry "rests on findings checked for publication on <date>, not yet published"; any change to the evidence the check covered voids it (the determination reads undetermined until the check is re-run, never silently kept); on publication the determination re-pins to the published edition. Canon: Action §2 and rule 2 ("rests on a published finding") are amended by this; the lane's canon draft will carry the wording. D3's quick route becomes "check the case" (no publication needed).

## H9 · 2026-10-10 · lane paused by Bob

**Carries:** Bob, 2026-10-10: "Pause development and save everything to the repo so that development can continue in the other account." Everything is committed and pushed on `design/actions` (this folder: `RESUME.md` rewritten as a full handover, `DECISIONS.md`, `HANDOFF.md`, `actions-design.html`, `research/`). Ruled: D1–D5, D7, D17, D20–D24. Open with Bob: D6, D8–D16, D18, D19. Step 5 (design write-up, capability ladder, canon draft, requirements hand-off) not started. The working page's artifact (https://claude.ai/artifact/3LPhoZ6geoYBnt7XvDqUM8) belongs to the old account; a successor in the new account republishes `actions-design.html` as a new artifact. No session of this lane is running; BOB starts a successor (ACTIONS-DESIGN #2) when Bob resumes it, told to follow `RESUME.md`.

## H10 · 2026-10-10 · lane resumed in Bob's primary account; new page link

**Carries:** ACTIONS-DESIGN #2 (`session_01RukQneSYmxg4FvfJ9aXccd`), started by BOB #149 (`session_01EyAmJMZV2GNzEmkDJkdcik`) on Bob's direction of 2026-10-10 ("Yes, start actions design and ux substrate lanes"), takes over from ACTIONS-DESIGN #1. The working page is republished from this account at **https://claude.ai/artifact/JH9AK7rgmxRNR9QjPL3s5d**; the old link (3LPhoZ6geoYBnt7XvDqUM8) is frozen and no longer updated. The two comment threads left open there (D18, D19) are carried by the page's §7 and `DECISIONS.md`. The twelve open decisions (D6, D8–D16, D18, D19) are put to Bob again. No ruling asked of BOB.

## H11 · 2026-10-11 · Actions D6 ruled: how plans and pursuits end, and how watching stops

**Carries:** Bob, 2026-10-11: "D6a: a / D6b: b / D6c: a / D6d: b", all as recommended (full text: page §7 D6, S1 §B6). **Requirements must say:**
- **6a:** escalation gains a member-set state "stopped pursuing" with a required reason; it is never shown as success nor counted as ended (compliance restored + consequences addressed stays the only "ended"); it stops proposing next stages; a member may reopen it with a reason at the stage where it stopped. The published "what we did" lane (D22) shows "stopped pursuing, <date>"; the reason stays internal unless a member writes it into the case.
- **6b:** closing a plan records the reason, a closing summary assembled from the record at the moment of closing (a frozen copy of the "where it stands" view, D14; each matter's determinations, cure, consequences addressed, each action's resolution, escalation state, watched promises, declined options with reasons, what is still running), and an optional member note. Never machine-written prose, never published (DEC-25), available to members for the next edition. No achievement rating.
- **6c:** a success record per matter: a member's statement of what changed and when, resting on cited evidence, optionally with figures computed from cited sources (consequences' arithmetic pattern); sequence may be stated; causation only on evidence other than the group's own act; may be carried into the case's next edition as an outcome. Consequences remain breach-only; recognition actions (U12) may rest on it.
- **6d:** at plan close, and when every watched promise in a matter is met, the plan lists once each watch it set up (following a body, watching a page, a promise watched as a duty, a standing question) and asks per watch: keep until a member-chosen date, or stop now. Every watch then carries an end date shown wherever it appears. Watches another plan or project relies on are listed but not offered for stopping. Asked once, never a reminder.

## H12 · 2026-10-11 · Actions D8 ruled: starting texts, guides, legal facts, other states, rule-writing

**Carries:** Bob, 2026-10-11: "D8: as recommended" (full text: page §7 D8, S1 §B8; also confirmed D7 unchanged). **Requirements must say:**
- **Templates:** Civicsmith ships a Tier 1 set per jurisdiction profile (records request; records request with immediate-disclosure request; follow-up on a passed date; reconsideration letter; ethics-commission mediation request; written public comment; grand jury complaint; Brown Act demand, carrying the Tier 2 advisory), each written by a named person from public sources, professionally reviewed, approved and attributed under the template process (K903 (6), K921, `filing-templates` R8–R10). A template is offered only after the member has chosen the act. No court-petition templates until licensed certification (deferred). Fixes `wizard-scripts` R22's `@records-request`, which names a template that does not exist.
- **Guides:** a sourced procedure guide per kind of action per profile, labelled "legal information, not legal advice", listing expected replies and routes in profile order, unranked; read by members and used by the assistant as its reading list (Investigation §6 reading-guide pattern); groups may add their own.
- **Facts at the moment they matter:** profile facts surfaced with citations only on a relevant trigger (paid attendee at a meeting → lobbyist threshold; recording → all-party consent; threat letter → anti-SLAPP window, fees, finding counsel). Whether a protection applies, condition by condition, waits for deferred D-165 (K1474 (ii)–(iv)).
- **Other places:** a state is supported when a group there asks; the profile schema is extended now so the first out-of-state group is not blocked (`jurisdictions` R27, R45, K1445); no generic fallback ("a missing fact reads undetermined").
- **Rule-writing:** a member drafts a jurisdiction rule with its primary source; a second member confirms (a professional for Tier 2–3 matters); it applies in that group at once and may be offered to the shared profile (`local-facts`).

## H13 · 2026-10-11 · Actions D9 ruled: counsel briefing at any stage; defence packet

**Carries:** Bob, 2026-10-11: "D9: as recommended" (b) (page §7 D9, S1 §B9). **Requirements must say:** `filings` R8 no longer refuses a counsel packet for want of a determination (`NO_DETERMINATION`) and needs no override: the breach gate sits at the outward act (Action rule 2), and a packet goes only to the group's own counsel by a member's hand. The packet shows each matter's support as it stands (e.g. "1 suspected, hypothetical"; determined; checked-and-held per D24). A **defence purpose** is added: each challenged statement with its finding and sources, the pressure received (letters, demands), and defence deadlines with citations (e.g. anti-SLAPP window). Candidate theories stay labelled candidates; the packet never says "you have a claim" nor whether a protection applies (K1474, D-165 deferred). Refs: `filings` R8–R10, R14, R24; Action §7 (4); with D4 the packet belongs to a counsel matter and carries the privilege marking.

## H14 · 2026-10-11 · Actions D10 ruled: who places a litigation hold; hold notice

**Carries:** Bob, 2026-10-11: "D10: as recommended" (a), (a) (page §7 D10, S1 §B10). **Requirements must say:** a litigation hold may be placed by any member who can see the action or the case, by an act with a stated reason (e.g. "we anticipate litigation"), not only from a pressure entry on an action (`actions` R48, R52, R54–R60); a pressure mark on the docket (`docket` R2, the §D defect) can raise one the same way; and a counsel matter (D4) can. On placement Civicsmith prepares a **hold notice** in plain words listing what members should keep outside Civicsmith (email, texts, chats with disappearing messages off, notes, photos), sent by a member's own hand; no per-member read or compliance record (the measuring of members is excluded). Unchanged: nothing named in a hold is purged (DEC-113, K1252); the device half waits for device storage (K1251); "counsel's review of these defaults is advised" stays.

## H15 · 2026-10-11 · Actions D11 ruled: Civicsmith never advocates; evidence check only on advocacy material

**Carries:** Bob's D11 direction, D11a and D11b (words in `DECISIONS.md`; page §7 D11). **Requirements must say:**
- Civicsmith's own outputs (published cases, planning-run options, templates, guides, assistant drafts) never take or propose a policy or vote position. Action rule 9 ("policy advocacy and candidate support are not actions") stands; canon draft adds Bob's distinction: members and groups may hold positions; Civicsmith does not rule on policy.
- **Advocacy material is not an action:** not prepared, templated, suggested, stamped, sent, recorded as the group's action, or shown in the published "what we did" lane (D22). The planning run never suggests an advocacy option (`action-plans` R12 `lobbying` flag read again: lobbying stays only to enforce or restore an existing requirement).
- **Evidence check on member-written material:** a member may submit text she wrote; each factual claim and each position sentence is marked supported (findings cited), not supported, or contradicted by the record (same machinery as the D2 case-account check). It points out only: nothing held, nothing certified, no mark usable outside. Where the material and its check result are kept (the member's own space, not the group's action record) is a lane/BOB detail; proposed: the member's own notes.
- **Assistant (D11b):** stays with facts and requests to examine/apply existing requirements; never drafts or proposes position sentences.
- **Election notice:** when an action's text names a pending measure or candidate, the campaign-spending rule is shown once with its citation, as legal information (D8); never a block. Thanks to an elected office whose holder is a candidate gets the same notice.
- Testimony as an action: factual testimony on any matter plus asking a body to examine or apply an existing requirement (original option (b)); position sentences in it are pointed out for the member to remove or keep outside Civicsmith.
