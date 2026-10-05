@@FILE INVENTORY.md.txt (121 lines; read 1-121 complete)
@@WHAT
- INVENTORY (src/action-design/INVENTORY.md.txt): ACTION_DESIGN #1, 2026-09-29, step 1 of the Action design week: an inventory of what canon, approved requirements and code say about Actions, tested against Bob's framing of 2026-09-29 (kinds of groups, roles, communications, lawyers, auditors, unions). "It decides nothing." Read at `main` @ `5bb688333c`. Summarises the six built layer-9 modules (standards, conformance, consequences, actions, filings, escalation), where the chain breaks, 16 disagreements among documents, and the gaps split into Bob's decisions and BOB's build work. Draws on four detailed `sources/` inventories (the other four files of this set).
@@TIME
- [BUILT] INVENTORY §1 item 1, line 7 — six layer-9 modules built in T8, hardened T9/T11/T12, ~9,400 lines source / 7,000 tests, 181 tests pass, 45 ops routed; missing "anything that tells a member a deadline passed or a stage is due".
- [DOCTRINE] INVENTORY §3 Clocks, line 35 — "The clock runs. Deadlines are deadlines" (Operational Principle 3). "Every dated deadline names the statute, order or commitment it comes from."
- [GAP] INVENTORY §3 Clocks, line 35 — six uncoordinated deadline designs: "The canon holds six deadline designs with no stated relation among them: the action's clock, due dates on correspondence, task clocks, progression intervals, plan-step deadlines and escalation stage 3."
- [DESIGN] INVENTORY §3 Stages, line 31 — Design Requirement 7's seven stages; canon promises each "defined entry conditions, defined actions, defined timelines, and documented trigger conditions" and defines none; approved `escalation` requirements supply them.
- [BUILT] INVENTORY §4 table, line 52 — `actions` holds "clock with bases".
- [GAP] INVENTORY §4 escalation row, line 54 — "Nothing tells a member a stage is due."
- [GAP] INVENTORY §4 "Nothing is pushed", line 59 — "Monitoring's deadline recheck is never called, and the queue has no kind for an overdue clock or a due escalation. Both answer when asked; neither tells anyone."
- [GAP] INVENTORY §4, line 61 — real profile has "13 action kinds, 5 offices (all unmeasured), 1 deadline, no holidays and no templates".
- [CONFLICT] INVENTORY §5 item 4, line 68 — "Clocks stored or derived. State Rules makes the clock \"the authoritative deadline register\", marked overdue by a machine (I-11, I-20); Case Making says \"the clock is never encoded\" and status is derived when read."
- [GAP] INVENTORY §6 BOB's to plan, lines 100, 103 — "Schedule monitoring's deadline recheck; give the queue kinds for an overdue clock and a due escalation." "Profile data: templates, holidays, measured offices and deadlines."
- [BUILT] INVENTORY §4 standards row, line 49 — standards carry "period in force".
@@ORGANISATIONS
- [DESIGN] INVENTORY §1 item 2, line 8 — built model is narrow: "one group whose members all stand alike, acting against a government office, because of a breach."
- [GAP] INVENTORY §1 item 4, line 10 — "No record holds a kind of actor. No role says who may send or speak for the group." "an action has one addressee".
- [GAP] INVENTORY §2 table, line 17 — group kinds (activists, journalists, lawyers, auditors, unions) "Recognised in words, never as data"; Case Making frame "media report, activists fix, administrators respond, lawyers support or change a claim (\"the list is open\")"; DEC-27; Roadmap §12 group "type" field with no stated effect; requirements: "Not modelled. One instance is one group."; code: "No group type anywhere."
- [GAP] INVENTORY §2 roles row, line 18 — four capabilities (contribute, publish, create projects, administer); project owner, joined, invited; declared expertise "gates nothing"; requirements: any member with `contribute` may take every layer-9 act; "Nothing says who drafts, approves, sends or speaks for the group."
- [GAP] INVENTORY §2 communications row, line 22 — "An addressee must be a government office, so a journalist or newspaper cannot be one."
- [DESIGN] INVENTORY §2 lawyers row, line 23 — lawyers: Tier 3 counsel, legal organisations; requirements: "Outside named counsel only (the counsel packet); profile legal organisations." Verdict "Partly covered, as a recipient only."
- [GAP] INVENTORY §2 auditors row, line 24 — auditors "Only as venues and addressees (City Auditor complaints, grand jury, State Controller)"; requirements "An office marked `oversight`; stage 7's audit request"; "Gap as actors. They exist only as offices."
- [GAP] INVENTORY §2 unions row, line 25 — unions/special interests never actors; Roadmap §1 "protection network"; handled by disclosure (Requirement 6) and declared bias; "Gap, and a doctrine question".
- [DOCTRINE] INVENTORY §3 Addressees, line 37 — "an office, named in its official capacity, never a person (Requirement 6: \"Accountability belongs to the role and the institution\")."
- [BUILT] INVENTORY §4 actions row, line 52 — Action object holds "addressee office"; consequences row line 51: to whom "(a class, fund, program, service or body, never a person)".
- [GAP] INVENTORY §4, line 61 — real profile "5 offices (all unmeasured)".
- [CONFLICT] INVENTORY §5 item 5, line 69 — "Addressee shape. State Rules shows a free string; the requirements refuse it and require an office by role and body."
- [CONFLICT] INVENTORY §5 item 15, line 79 — two stances toward government: Roadmap's "war" and "protection network" (unions, City Attorney, external auditor, Council) vs System Design/Case Making "all stakeholders are presumed to want better outcomes."
- [CONFLICT] INVENTORY §5 item 12, line 76 — audience vs user type; "no record holds either".
- [OPEN] INVENTORY §6 items 1, 5, 6, 9, lines 86, 90, 91, 94 — who the "groups" are (user type / audience / addressee); roles for acting; communications to non-government recipients and "confidential referral to an oversight body"; cross-group work.
- [GAP] INVENTORY §6 BOB's, line 103 — profile "measured offices".
@@LAW
- [BUILT] INVENTORY §4 standards row, line 49 — "What a government act is measured against: statute, regulation, ordinance, court, policy, commitment; its captured text, citation, period in force, and source from the profile." 18 tests pass. Gap: "No Legal/Policy Lookup skill exists to propose standards."
- [BUILT] INVENTORY §4 conformance row, line 50 — "A member's determination that a named act is compliant, noncompliant or unclear, per standard, resting on findings published in a ratified case of the same project. A machine compares, never determines." 36 pass. Gap: "Needs the whole case and ratification path first. Nothing acts on a compliant determination."
- [BUILT] INVENTORY §4 actions row, line 52 — action carries "governing laws, fee quotes"; "`breach: true` actions must rest on a live determination"; only product kinds are records request, request for comment and other.
- [DESIGN] INVENTORY §1 item 2, line 8 — approved layer contract: "An action rests on a published finding and on a standard held in the record."
- [DOCTRINE] INVENTORY §1 item 5, line 11 — five doctrines: standards and bars "indexed on the work, not the person" (DEC-17, DEC-54); "We take no position on what the policies should be" (Operational Principle 1); DEC-24; Case Making §4; Design Requirement 12.
- [DESIGN] INVENTORY §3 Kinds of action named, line 29 — records requests; grand jury complaints; State Controller referrals; City Auditor whistleblower complaints; Brown Act reports; public comment; council testimony; media outreach (Tier 1); records court petitions (Tier 2); Prop 218 challenges, taxpayer actions, consent-decree motions, constitutional claims (Tier 3) — "Every named action, venue and deadline is Californian."
- [DESIGN] INVENTORY §3 Risk tiers, line 33 — Design Requirement 8 amended 2026-09-26: "1 file freely, 2 file with caution, 3 do not file without counsel"; tier set only by a member, never defaults, revised only by authored act with reason (D-182).
- [CONFLICT] INVENTORY §5 item 1, line 65 — layer contract "An action rests on a published finding" contradicts records requests, DEC-13 request for comment, DEC-31 review copy, DEC-26 gate ("established", not "published").
- [CONFLICT] INVENTORY §5 item 6, line 70 — State Rules lists seven kinds including California's `cpra_request`; requirements moved to law-neutral `records_request` and profile kinds.
- [CONFLICT] INVENTORY §5 item 10, line 74 — tier per kind or per action; "filings take the stricter of the two."
- [GAP] INVENTORY §6 BOB's to plan, line 104 — verify a member can create a `breach: true` action through promote ("reported refused in T9, probably fixed, not pinned by a test").
- [OPEN] INVENTORY §6 item 8, line 93 — what "consequences addressed" and an adequate response mean.
- [GAP] INVENTORY §6 item 11, line 96 — Action layer has no level-1 design and no row in System Design §3.
@@COURTS
- [DESIGN] INVENTORY §3 Kinds of action named, line 29 — court-adjacent actions: grand jury complaints, records court petitions (Tier 2), Prop 218 challenges, taxpayer actions, consent-decree motions, constitutional claims (Tier 3), litigation support.
- [BUILT] INVENTORY §4 standards row, line 49 — standards include kind "court" (a court order/ruling as a standard).
- [BUILT] INVENTORY §4 filings row, line 53 — "Tier 1–2 drafts filled from the profile's template ... Tier 3: the counsel packet." Gap: "The real profile has no templates, so every Tier 1–2 draft is refused there."
- [DESIGN] INVENTORY §3 Risk tiers, line 33 — Tier 3 "do not file without counsel (a counsel packet is prepared for counsel the group names; it is never published and never fileable)".
- [BUILT] INVENTORY §4 escalation row, line 54 — seven stages from a live noncompliant determination; member advances or declines; ends only when compliance restored and consequences addressed. 29 pass.
- [CONFLICT] INVENTORY §5 items 2-3, lines 66-67 — mechanical vs human escalation (Requirement 7 vs Roadmap; requirements chose proposal + member's act, K102); seven stages vs six.
- [CONFLICT] INVENTORY §5 item 7, line 71 — three outcome vocabularies: action resolution (complied, denied, escalated, withdrawn), correspondence outcome (granted, denied, partial, reversed, affirmed, none stated), escalation evaluation (complied, partial, denied, none).
- [GAP] INVENTORY §6 item 10, line 95 — "may a Tier 2 or 3 action, or a counsel packet, rest on Grade B evidence?"
@@ANALYSIS
- [BUILT] INVENTORY §4 consequences row, line 51 — "What a breach did, to whom (a class, fund, program, service or body, never a person), measured, computed from the record or assessed by a member, with causation as its own finding; whether each part is addressed." 24 tests pass; "None structural" gaps.
- [BUILT] INVENTORY §4 actions row, line 52 — "fee quotes" held on the action.
- [OPEN] INVENTORY §6 item 8, line 93 — meaning of "consequences addressed".
@@QUESTIONS
- [GAP] INVENTORY §1 item 1, line 7 — missing "any AI skill that prepares the work"; §4 line 60 — "No skills. The only skill pack is the investigative session."
- [GAP] INVENTORY §4 standards row, line 49 — "No Legal/Policy Lookup skill exists to propose standards."
- [DOCTRINE] INVENTORY §3 The human boundary, line 43 — "AI skills provide support. Humans make every decision" (Roadmap §10); "No tool has authority to approve, reject, or gate any work product or action" (Requirement 12); "the AI prepares, never files" is the layer contract's phrase, not canon's.
- [DESIGN] INVENTORY §2 group kinds row, line 17 — DEC-27: "I'm a journalist" may lead the assistant to *propose* a project's action repertoire.
- [DESIGN] INVENTORY §3 The action plan, line 41 — "The machine suggests and checks and never adopts a step."
- [DOCTRINE] INVENTORY §1 item 5, line 11 — "The machine may do the looking, and the member does the concluding (DEC-24)."
- [DESIGN] INVENTORY §1 item 3, line 9 — System Design: CivicOS exists to "answer questions, make a case, tell a story, and take action."
@@DOCTRINE
- [DOCTRINE] INVENTORY §1 item 5, line 11 — five doctrines: standards/bars "indexed on the work, not the person" (DEC-17, DEC-54); Operational Principle 1 "We take no position on what the policies should be"; DEC-24 machine looks, member concludes; bad actors "identified by evidence, never assumed by role" (Case Making §4); "No tool may gate an action" (Design Requirement 12).
- [DOCTRINE] INVENTORY §3 Addressees, line 37 — office in official capacity, never a person (Requirement 6).
- [DOCTRINE] INVENTORY §3 What leaves the instance, line 39 — published case signed, irreversible; evidence package "the primary output of the escalation protocol"; anything addressed carries hash, date, author and both threshold floors in-band (Publication §3 rule 9); "An action leaves only through a member's own hands and is recorded afterwards (DEC-31, provisional)"; action plan never published (DEC-25, deferred).
- [DOCTRINE] INVENTORY §3 The action plan, line 41 — "The gate belongs at the ACT, not at the reasoning" (DEC-26).
- [CONFLICT] INVENTORY §5 item 16, line 80 — DEC-26's refusal of an unestablished outward act vs Requirement 12 (no tool gates an action) and Requirement 8 ("Any individual can initiate" Tier 1).
- [CONFLICT] INVENTORY §5 item 8, line 72 — edges `action_basis`, `responds_to`, `references` outside State Rules' closed edge vocabulary, new kinds "require a spec revision".
- [CONFLICT] INVENTORY §5 item 13, line 77 — Case Making canon "whole" in requirements/README.md, but its own banner: "several body sentences are now false as written".
- [GAP] INVENTORY §6 record-keeping defects, lines 109-112 — actions.md marks R4–R11, R22, R28–R33, R40, R41 "not yet met" though built; monitoring R34–R35 and publication R36–R37 likewise; next.md lists N61, N129, N130 applied (K232); "DEC-1 to DEC-67 ... are not readable on `main`"; State Rules §4.4 not amended.
- [DESIGN] INVENTORY §7, line 120 — P7: "every requirement tested at the interface".
@@CROSS
- INVENTORY shows LAW (standards), TIME (action clocks), ORGANISATIONS (offices) and ANALYSIS (consequences) are all built inside layer 9 and serve only acting on a determination, which itself "Needs the whole case and ratification path first" (line 50) — confirms the brief's structural observation for law/time/calculation: none of it is reachable before publication and ratification.
- Organisations appear only as addressee offices and profile venues (auditors, grand jury, State Controller "exist only as offices", line 24); there is no model of organisations as actors or of their relations — the ORGANISATIONS construct exists only to address mail.
- TIME is fragmented: six deadline designs with no stated relation (line 35) plus a stored-vs-derived conflict (line 68) and no push of overdue state (line 59); holidays absent from the real profile (line 61) though business-day logic needs them.
- "Every named action, venue and deadline is Californian" (line 29) — LAW/TIME/COURTS knowledge in the canon is jurisdiction-specific and must live in profiles.
