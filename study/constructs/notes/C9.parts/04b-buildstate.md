@@FILE sources_build-state.md.txt (chunk 211-415; with chunk 1-210 the file is complete)
@@TIME
- [BUILT] build-state §1.5 filings Services, line 212 — "`filingRecordSent` (R7): writes one `sent` correspondence entry on the action and proposes the next state and clock entries."
- [RULING] build-state §1.5 Rulings, line 239 — "K108 (5): holiday calendar."
- [BUILT] build-state §1.6 escalation, lines 248, 254 — "A met trigger is **proposed** with its age"; "`escalationRead` (R2, R3: triggers, proposals and exit, derived at `nowMs`)."; line 260 "`escalationsDue` (R16, monitoring's read)".
- [BUILT] build-state §1.6, line 259 — `escalationSuspend` / `escalationResume` (R15); states open, suspended, ended (line 264).
- [BUILT] build-state §2(b) Deadline vocabulary, line 326 — "**Deadline:** `{rule, applies_to (kind | claim), days, count ∈ calendar, business, starts ∈ received, filed, act, known, extension?, citation}` (jur R26)." (calendar vs business days; start events received/filed/act/known — "known" supports discovery-rule limitation windows; optional extension; citation = basis).
- [BUILT] build-state §2(b), line 322 — "**Clock status:** pending, met, overdue, waived."
- [BUILT] build-state §2(b) escalation table stage 3, line 338 — "3 clock | ... a member-stated clock entry with its basis (`clockPropose` may propose one) (R6) | →4: after `sent`, a `received` or `no_response` entry, or the earliest pending clock is past. With no clock entry, it never triggers by time".
- [BUILT] build-state §2(b) stage 6, line 341 — "6 sustained_attention | ... none of its own; monitoring watches clocks and responses (R11)".
- [BUILT] build-state §2(c), line 354 — profile `deadlines` (R26) "including `applies_to: claim` for the counsel packet".
- [BUILT] build-state §2(c), line 358 — "`holidays` (R33): a complete year, for business-day counts. A count into an unlisted year is undetermined."
- [DOCTRINE] build-state §2(c), line 350 — "An absent section is answered as undetermined, never defaulted (jur R27; std R13; fil R20; esc R20; act R39)."
- [BUILT] build-state §2(d) Monitoring, line 366 — "R34/R44: a mechanical `deadline-recheck` marks `pending→overdue` only, reading `actions.pendingClocks`, and \"its action's members are told\"."; line 367 R35: after overdue/response asks `escalationsDue`, "It never advances."
- [GAP] build-state §2(d), line 370 — "`deadlineRecheck` (1967) and `escalationsSeen` exist, but **nothing in `src/` calls `deadlineRecheck`**. Only `test/m/monitoring/understanding.test.mjs` does. So the overdue mark and the escalation ask are not wired into any tick on this checkout."
- [GAP] build-state §2(d) Queue, lines 373-375 — "`escalationsSeen()` \"names none of R31's four kinds; no item is minted from it until a kind is catalogued\""; "`queuestate.mjs` has **no** kind for an overdue action clock or a due escalation."; "\"members are told\" (mon R34) and a proposed stage reaching a member's queue have **no delivery path yet**. There is no open N-entry for it."
- [BUILT] build-state §2(d) Scheduler, line 378 — "No layer-9 dependency. Its uses do not include actions or escalation (MJ line 73). It reaches monitoring only."
- [BUILT] build-state §2(e), line 391 — "The one machine write to a clock is the mechanical `deadline-recheck` pending→overdue (act R33; mon R44)."
- [BUILT] build-state §1.5 Record, line 222 — `CPK-` packet versioned, flagged `basis_changed`.
@@ORGANISATIONS
- [BUILT] build-state §2(b), line 304 — "**Office levels:** state, county, city, district (jur R24)."; line 303 "**Law levels:** federal, state, county, city."
- [BUILT] build-state §2(b), line 319 — "**Counterparty:** `{named: role, body, level?, entity_id?}` or `{undetermined: basis}`. It is an office, never a person. The profile offers `counterparties {role, body, level, elected, oversight?, basis}` (act R9; jur R24)."
- [BUILT] build-state §2(c), line 352 — profile `counterparties` (R24) "with `elected`, and `oversight` (unmarked means undetermined)."
- [BUILT] build-state §2(c), line 357 — "`legal_organisations` (R32): `{name, evaluates (Tier 3 kinds), contacts}`"; line 361 first profile "names HJTA and the First Amendment Coalition (R30, R36; K283 (2))".
- [BUILT] build-state §2(b) stage 7, line 342 — purposes ∈ {official_request, oversight_request, audit_request, testimony, enforcing_legislation}; "`official_request` needs an office not marked `elected: false`; oversight and audit requests need one not marked `oversight: false` (R12)" — the only organisational attributes used in logic (elected, oversight).
- [BUILT] build-state §2(b) stage 1→2, line 336 — trigger "the determination is live and the actor is an office (R4)"; stage 2 line 337 "a breach action addressed to the actor's office".
- [GAP] build-state §3 table, line 409 — "One instance is one producing group (instance-setup Purpose). Members differ only by `admin` role, capabilities `contribute`/`publish`/`create_projects`, and declared expertise (membership R4, R12). No group type or actor type exists anywhere in `build/requirements/` (grep for journalist, lawyer, auditor, union, activist, press: no hits)." Lawyers "external named counsel, \"not a member of the instance\""; auditors "only as a **counterparty office** marked `oversight`".
- [GAP] build-state §3 table, line 410 — "No spokesperson, legal lead, approver or reviewer role exists."; layer-9 routes all need `contribute` (K312).
- [GAP] build-state §3 table, line 413 — "the counterparty must be a government office (act R9; jur R24), so a newspaper or journalist cannot be addressed as a counterparty."
- [DESIGN] build-state §2(a), line 298 — actions do not require a joined project participant; conformance, consequences, escalation do.
- [GAP] build-state — no model of organisational relationships, reporting lines, positions vs holders over time, or responsibility: offices are flat `{role, body, level, elected, oversight}` profile entries (lines 319, 352).
@@LAW
- [DESIGN] build-state §2(a), line 281 — layer contract: "An action rests on a published finding and a standard held in the record; the group decides every act, the AI prepares and never files; compliance is recorded as carefully as noncompliance; every deadline names its basis" (L table row 9).
- [BUILT] build-state §2(a), line 284 — "`determine` refuses unless every finding is published by the project (conf R2, R14) and every standard is held and not out of force (R3)." (as-of applicability check at determination).
- [BUILT] build-state §2(a), lines 285-288 — consequenceRecord needs live noncompliant outcome (cons R1); escalationOpen needs live noncompliant determination (esc R1); counselPacket needs live determination (fil R8); available-actions block needs published case with live determination (fil R15, R21).
- [BUILT] build-state §2(a), line 295 — "**Standards and comparisons.** They exist independently of any finding (std R1; conf R12: comparison before publication is inquiry work, K102)." — KEY: standards and comparisons are usable before publication (but sit in layer 9, so inquiry code cannot call them).
- [GAP] build-state §2(a), line 296 — "A **`compliant` determination** exists, but nothing downstream consumes it except escalation's exit (esc R14)."
- [BUILT] build-state §2(b), line 302 — "**Standard kinds:** statute, regulation, ordinance, court, policy, commitment (std R1, R12; jur R23)."
- [BUILT] build-state §2(b), line 303 — "**Law levels:** federal, state, county, city. A legacy `local` reads as written (jur R31; K108 (1))."
- [BUILT] build-state §2(b), line 313 — profile `action_kinds {kind, label, tier?, laws?, venue?, template?, advisory?, basis}` (act R10; jur R25).
- [BUILT] build-state §2(c), lines 351, 355 — profile `standard_sources` (R23) each with `level` (R31); `records_laws` (R7) by law level.
- [BUILT] build-state §2(b) stage 7, line 342 — each attached action has "at least one pursued standard"; "enforcing_legislation" purpose.
- [BUILT] build-state §2(b) Exit, line 344 — "a live `compliant` determination of the same act for every pursued standard, **and** `consequences.addressed = addressed`. `undetermined` gives `CONSEQUENCES_UNDETERMINED` (K172)." "Policy advocacy and candidate support have no purpose value (R12; K14)."
- [BUILT] build-state §1.6, line 249 — escalation ends only when compliance restored and consequences addressed (Operational Principle 6).
- [BUILT] build-state §1.5, line 225 — "**Governing tier** is the stricter of the profile kind's tier and the action's tier. It is undetermined when the action's tier is, and then the filing is refused".
- [DOCTRINE] build-state §2(c), line 361 — "No module names a place (L \"No jurisdiction in the product\")."
@@COURTS
- [BUILT] build-state §2(b), line 325 — "**Venue means:** portal, mail, email, in_person, court (jur R25)."
- [BUILT] build-state §1.5 Record, lines 221-228 — `FIL-` draft → approval (SHA-256) → one sending; `CPK-` packet versioned with exports; theory proposals; filled blank `{name, value, source}` or `[UNFILLED: name]` (R3); packet marking "Prepared for review by … Not legal advice. Not for filing." "It has no caption, venue, signature or prayer (R10)."
- [BUILT] build-state §1.5 Services, lines 213-217 — `counselPacket` (R8–R10, R12), `counselPacketRead`, `counselPacketExport` (R11), `filingsFor` (R13), `theoryPropose` (R14), evidence-package available-actions block (R15; pub R36), `availableActions({determination})` (R21).
- [GAP] build-state §1.5, lines 230, 233 — not yet met: R3's producing-group blank (N331), in T14.
- [RULING] build-state §1.5, lines 237-242 — K13 (Bob; amends DR 8); K102 stricter tier, no transmission, advisory is profile data; K316/K319 packet reads need sight of every drawn-on determination's project.
- [BUILT] build-state §2(b) Risk tiers, lines 314-318 — Tier 1 template no advisory; Tier 2 template plus advisory; "Tier 3: no template ever; counsel packet only (fil R2, R4, R17; jur R25, R28 `TEMPLATE_TIER3`)".
- [BUILT] build-state §2(b) escalation stages table, lines 332-343 — seven stages and edges (1→2, 2→3, 3→4, 4→5, 4→7, 5→6, 5→7, 6→4, 7→4); stage 5 legal_tools: "breach actions attached with filings or counsel packets; available kinds by tier via `availableActions` (R8)".
- [BUILT] build-state §1.6, lines 264-267 — `ESC-` states/edges; evaluation reading ∈ {complied, partial, denied, none} (R10); one open/suspended escalation per determination (R1); action attaches to one escalation at one stage (R9).
- [RULING] build-state §1.6, line 273 — K14 (Bob, stage 7; amends DR 7); K172 (Bob).
- [BUILT] build-state §2(a), line 293 — first profile kinds include `grand_jury`, `controller_referral`, `litigation_support`, Tier 2 `records_petition`, Tier 3 kinds (`jurisdictions/profiles/oakland-alameda.mjs` 208–229).
- [GAP] build-state — no record of a court case, docket, parties, filings by others, orders or judgments as objects to read/track; courts appear only as a standard kind (`court`), a venue means (`court`), a deadline basis (`applies_to: claim`) and outbound filings/counsel packets.
@@ANALYSIS
- [BUILT] build-state §2(b) Consequences vocab, lines 306-312 — affected kinds class, fund, program, service, body, other; units money, benefits, services, time, count; ops sum, difference, count, product, ratio; states computed, assessed, undetermined; causation established, unproven, not_applicable; addressed/not_addressed/undetermined.
- [BUILT] build-state §2(e), line 387 — a machine may "record a **computed** consequence part, labelled, with operands shown (cons R2; K102)".
- [DOCTRINE] build-state §2(e), line 401 — "Significance, severity, priority, urgency and scores are refused as inputs and absent from answers (conf R8; cons R11; esc R19; K12)."
- [BUILT] build-state §1.5, line 221 — approval with SHA-256 (reproducibility of the approved draft).
@@QUESTIONS
- [DOCTRINE] build-state §2(e) "A machine may", lines 384-391 — propose a standard (std R9); propose a comparison "with rows and questions but never an outcome (conf R12)"; record a computed consequence part; propose risk tier, governing laws or a clock entry (act R19, R28, R32); prepare filing drafts and counsel packets' candidate theories (fil R5, R14, R16).
- [DOCTRINE] build-state §2(e) "A machine may never", lines 393-399 — declare a standard (std R11); determine (conf R13); assess or address a consequence (cons R3, R9); move an action, correspond, set tier, laws, records law, or edit the clock (act R33); approve, send, name counsel or export (fil R16); open, attach, evaluate, advance, decline, suspend or end an escalation (esc R17).
- [DESIGN] build-state §2(e), line 401 — "Escalation proposals are the protocol's derivation, \"never an act\" (esc R17)." "The Escalation Protocol skill explains; a member acts (esc Suggestions)."
- [BUILT] build-state §2(b), line 346 — proposal labels: machine_proposed, member_proposed, unstated, keyed governing_laws, standard, comparison, filing_draft, theory (K171 (2)).
- [BUILT] build-state §1.5, line 227 — labels `proposalLabel(...,"filing_draft"|"theory")` (R5, R14).
@@DOCTRINE
- [DOCTRINE] build-state §1.6, line 250 — escalation "takes no position on policy (esc.md Purpose; R14; R19)"; line 344 "Policy advocacy and candidate support have no purpose value (R12; K14)"; "An escalation can be suspended or resumed but never withdrawn (R15)."
- [DOCTRINE] build-state §2(c), lines 350, 361 — absent profile section = undetermined, never defaulted; "No module names a place".
- [DOCTRINE] build-state §2(b), line 314 — risk tier "never defaulted; D-182".
- [DESIGN] build-state §2(a), lines 283-290 — contract "enforced **fully only on the determination chain**"; on the action object it binds only `breach: true` actions.
- [DOCTRINE] build-state §3, line 415 — "the approved layer-9 requirements model **one group, one kind of member, acting against government offices, on a breach**." "Adding them would be a requirements and architecture change, which is Bob's to make (CLAUDE.md P17)."
- [BUILT] build-state §2(d), line 380 — affordances grades layer-9 ops on the rung ladder (aff R2; K264, K309, K375).
@@CROSS
- build-state §2(b)/(c) lines 326, 358: the richest TIME structure in the product is the profile `deadlines` grammar (calendar/business days; start events received/filed/act/known; extension; citation) plus `holidays` per complete year — but it lives in `jurisdictions` (layer 1) data and is consumed only by `actions.clockPropose` (layer 9); no general date/time service exists for inquiry or the assistant.
- line 295: standards and comparisons "exist independently of any finding" and comparison before publication is "inquiry work" (K102) — the LAW construct is logically usable during investigation, yet structurally in layer 9 above inquiry (layer 6), so inquiry/assistant code cannot call `standardsIn`/`inForce`/`comparisonPropose`. Strong evidence for the brief's structural observation.
- line 370-378: TIME notifications are entirely undelivered — the overdue mark is never computed in production and the queue has no kind; scheduler does not reach layer 9. So for TIME the "built" state answers only when asked.
- ORGANISATIONS: the profile's `counterparties` (role, body, level, elected, oversight) and `legal_organisations` are the only organisation data; `entity_id` (line 319) optionally links a counterparty to `entities` (layer 5) — the potential bridge between an organisations construct and actions.
- COURTS/LAW: a court decision or order is a `standard` (kind `court`), so precedent/orders can be measured against but not modelled as cases.
