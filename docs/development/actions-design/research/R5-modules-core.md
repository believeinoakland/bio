# R5 — the built Action layer: eleven modules, requirement by requirement

**Status** · Research for the ACTIONS-DESIGN lane, written 2026-10-09 by a read-only worker on the working tree at `d59005b7c2` (`actions-design: step 1 readers dispatched`; `main` after PR #20, T40 archived CLOSING, K2422). Nothing but this file was written. Tests were run with Node v26.10.0 from the repository root (`node --test bio-plane/test/m/<module>/`); `bio-plane/node_modules` was already present.

**Scope** · Layer 9: `action-grammar`, `actions`, `action-clocks`, `filing-templates`, `filings`, `escalation`, `action-plans`, `conformance`, `consequences`. Layer 10: `monitoring`, `following` (`build/modules.json` `layer` field). For each module, this file covers (a) its requirements, (b) the code and tests, (c) the test run, (d) each requirement's state, and (e) its `modules.json` entry and plan entries. A section on member reachability and a closing table follow.

## Findings in brief

1. **Built.** Every one of the eleven modules is built: its requirements file says "every requirement met", and every live R-id is named in at least one test title. The exceptions are retired ids and `monitoring` R29, which is run by `link-sweep`.
2. **Tests.** 725 tests ran and 724 passed. The one failure is `filings` `outward.test.mjs:136` (R25). It is a **known, accepted red**, N819 (K2387). The cause is the test fixture, not the product: publication's fixture `doc(id)` has recorded a direct receipt since K2378, so the exhibit the test treats as ungraded now reads grade B. The tests-only fix, T40-9a, was moved to T41 without being started (`build/plan/archive/T40.md`:45, :116).
3. **Member reachability is the gap.** The plane routes every op of these modules (`bio-plane/src/plane/store.mjs`:587–600), and `op-declarations` declares them. The only member surface, however, is the legacy UI `civicos-ui/app.html`, and it reaches only a thin slice:
   - it opens an action (`openAction`, :9500) and shows its projection;
   - it authors an action document through the generic record flow (:3319–3358);
   - it calls `actionmove`, `actionlaws`, `actionlawspropose` and `actioncorrespond`;
   - it calls `monitor` (a monitoring tick) and shows the queue (`op=queue`). The queue items these modules feed (`action-clock-overdue`, `action-reminder`, `escalation-stage-proposed`, `plan-checkpoint-due`, `template-review-requested`, `litigation-hold`) are rendered generically by kind.

   No screen calls conformance (determine/compare), consequences, escalation, action-plans, filings, filing-templates, reminders, `clockadopt`/`clocksics`, holds, pressure, quotes, risk tier set or propose, or any `following` op. The wizard scripts name some of these acts (`addresseesuggest`, `communicationprepare`, `filingapprove`, `filingrecordsent` (an alias of `filingsent`), `clockadopt`, `optionstart`, `followregister`), but `FRONT_DOORS` is `[]` and no runner exists (N821).
4. **Stale text.** Three documents read older than the facts:
   - `filing-templates.md`'s Status says "R27 not yet met (T37)", but R27 was merged in T37 (K2233), and its four tests (`grant-channel.test.mjs`) pass.
   - `following.md` still carries the banner "DRAFT by a requirements-drafting worker … not reviewed" and an "Open for BOB" list in Suggestions, although its Status says it is in force with every requirement met (K2027).
   - `build/handoff.md`:21 says "T40 open, HELD", while `archive/T40.md` says CLOSING.
5. **Plans.**
   - `build/plan/current.md` does not exist: T40 is archived and T41 is not yet opened.
   - `build/plan/next.md` holds no entry that changes these modules. It holds N817, the actions design lane (this lane), and N821, which notes that "most built ops have no screen".
   - The only open item that touches a module is the carried T40-9a (filings, tests only).

---

## 1. action-grammar (layer 9)

**(a) Requirements** · `build/requirements/action-grammar.md`, 71 lines, read in full. Status: in force; it is `actions`' second split for size (K617, K653) and was met by ACTION-GRAMMAR #1 (K835). It last changed in T33 (T33-72: R12), and every requirement is met (K1846). Open for Bob: none.

| R | gist |
|---|---|
| R1 | `RISK_TIERS`, `riskTierState`, `actionKinds(view)`: the one vocabulary of tier and kind (was actions R40) |
| R2 | the vocabularies, exported unchanged (`ACTION_KINDS`, `PRODUCT_KINDS`, basis kinds, directions, resolutions, lifecycle stages and outcomes, quote keys, `lawProposalLabel`); `LAW_LEVELS` re-exported from jurisdictions |
| R3 | a `records_request` `law` of at most 200 characters; `law` on another kind is `RECORDS_LAW_REFUSED` (C-73.6); old kinds read as written |
| R4 | the quote grammar `quoteFindings` (C-72.1–.5) |
| R5 | the records-request lifecycle grammar `lifecycleFindings` (C-94.1–.9); no due date is computed |
| R6 | a `request_for_comment` names the inquiries it put (an `advances` leg) and a clock entry (DEC-13); `RFC_RESPONSE_WINDOW_PRECEDENT` is a citation only |
| R7 | `checkActionExtension`: the audit arm for C-2.10 and C-11.1; "past its date" is on the office's local day (K1444 (iii)) |
| R8 | the readers `actions` calls (`riskTierHistoryOf`, `governingLawsOf`, `requestLifecycleOf`, `consequenceState`, `counterparty*`, `respondsToEdgeFindings`, `clockMovesNotMechanical` and their bounds), byte-identical |
| R9 | the check rows it holds (C-2.10, C-6.1, C-11.1, C-32.x, C-33.x, C-72.x, C-73.x, C-90.x, C-94.x, C-101, C-117.x) |
| R10 | pure: no record, clock or network |
| R11 | no place named; the test profile is used |
| R12 | entity ids tested by `record-grammar`'s `idPattern` (four or more digit counters) |

Rulings cited: K617, K653, K835, K1846, K6, K585, K603, K766, K899, K1444, DEC-13, DEC-14, DEC-24, DEC-49, DEC-113, N396, N428; and the canon rows C-2.10, C-6.1, C-11.1, C-72.x, C-73.x, C-90.x, C-94.x and C-117.x.

**(b) Code** · `bio-plane/src/action-grammar/`: `checks.mjs` (1,369 lines), `grammar.mjs` (469) and `index.mjs` (5, a re-export). It is a pure library with no ops and no tables. It exports the vocabularies, `recordsLaw*`, `quoteFindings`, `lifecycleFindings`, `actionBasisFindings`, `correspondenceFindings`, `checkActionExtension`, the readers, and the check tables (`ACTION_FENCE_CHECKS`, `ACTION_ACT_CHECKS`, `QUOTE_CHECKS`, `LIFECYCLE_CHECKS` and others). There is nothing for a member to do here directly.

**Tests** · `bio-plane/test/m/action-grammar/` has 29 tests in one file, `grammar.test.mjs`, with a corpus golden (`corpus.mjs`, `golden.json`) and a fixture. The names are in Appendix A.

**(c) Run** · 29 tests: 29 pass, 0 fail.

**(d) Per requirement** · R1–R12 are built and tested; each R-id is named in a test title.

**(e) modules.json** · uses: record-grammar, jurisdictions, civil-time, connections, inquiry-grammar. `modules.json` has no per-module status field; it has only a top-level `status` amendment log. There is no plan entry.

---

## 2. actions (layer 9)

**(a) Requirements** · `actions.md`, 175 lines, read in full. Status: in force; approved by Bob 2026-09-26 (K102), with the Action layer folded in (K608, K611). It has been split twice (K617, K653). The last fold was T34 (R68, R69; K1830), and every requirement is met (K1847). One open dependency: **DEC-113's device half waits for a device-storage module (K1251)**. Open for Bob: none.

| R | gist |
|---|---|
| R1 | refusals at the write: the machine tier fence (C-32.19), `RISK_TIER_REWRITTEN`, `ACTION_BASIS_REFUSED`, `CORRESPONDENCE_REFUSED`, `RESPONDS_TO_REFUSED` |
| R2 | governing laws change only through `actionLaws` (`GOVERNING_LAWS_REWRITTEN`) |
| R3 | projection: legs, ledger and quotes replaced whole in the promotion; at most 500 legs and 500 entries (`ACTION_TOO_LARGE`) |
| R4 | retired (→ action-grammar R3) |
| R5 | a machine may not state a records law (C-32.20); one stated before reads MACHINE-STATED |
| R6 | the law arm enforced at the write (C-73.6) |
| R7 | five C-2.10 arms at the write (C-101): kind, tier, counterparty, resolution, clock-entry shape |
| R8 | `breach: true` rests on a live determination (`ACTION_NO_DETERMINATION`, `DETERMINATION_SUPERSEDED`), unless a member states a `premise_override` with a reason; the override is disclosed downstream |
| R9 | the addressee arms: office (role and body, entity id filled from the bridge); press, organisation or group; audience; undetermined; never a person. A breach action addresses an office |
| R10 | kinds: the product's (`records_request`, `request_for_comment`, `other`) plus the profile's; `ACTION_KIND_UNKNOWN` |
| R11 | a leg onto a document is pinned to its capture at the write (`extent_capture`) |
| R12 | `actionFacts`: pure; `clock_next` and `clock_overdue` on the office's local day, never UTC |
| R13, R14 | `actionMove`: refusals in order; the lifecycle `planned→active\|abandoned`, `active→awaiting_response\|resolved\|abandoned`, `awaiting_response→active\|resolved\|abandoned`; a resolution on `resolved` |
| R15–R17 | `actionCorrespond`: refusal order; a 30-second lease; an append-only entry (capture or testimony); a `responds_to` edge on another bundle, once |
| R18, R19 | `actionLaws` (a member replaces the list) and `actionLawsPropose` (stored apart, labelled) |
| R20, R21 | retired (→ action-grammar R4, R5) |
| R22 | lifecycle text and token rules (C-94.11, .12) |
| R23, R24 | `actionRiskTier`: refusals; an append-only tier history |
| R25, R26 | the read block (kind, tier and history, counterparty, clock, legs, ledger, laws and proposals, lifecycle, the action's own outcome, responses, the office holder, standards, proceeding); R26 is the action's own outcome (DEC-14), never "consequence" |
| R27 | `actionQuotes`: at most 500, no comparison |
| R28 | `actionRiskPropose`: stored apart; at most 12 shown |
| R29, R30 | `actionRead` and `actionsFor` (filters; 200 a page) |
| R31, R32, R40, R44, R50 | retired (→ action-clocks, action-grammar) |
| R41 | the old `cpra_request` kind reads as written; no law is named in code |
| R42 | `kinds()` and `op=actionkinds` |
| R43 | `noSuchAction`: the one NO_SUCH_ACTION answer (C-117.2) |
| R45 | `contact` (a member id) and `contactNotAMember`/`contactId` |
| R46 | `plan` and `option` set on creation only (`PLAN_LINK_REWRITTEN`) |
| R47 | `actionCreate` (`op=actioncreate`) = a promotion; `op=action` and `op=actions` |
| R48 | the `pressure` mark on a received entry (legal, retaliation, discrediting, other); `actionPressure` |
| R49 | no refusal for a capture grade; grades are shown in filings |
| R51 | the audit arm registered with record-core |
| R52, R56–R60 | the litigation hold: `actionHold`, `actionHoldRelease`, `holdReleasePreview`, `projectHolds`, `holdsReleased`, `purgeHeld` (DEC-113) |
| R54, R55 | `holdsDue` (for queue-producers); the capture hold reader |
| R61 | the `PLN-` id by `idPattern` |
| R62 | `addresseeSuggest`: offices from `custodian_of`/`responsible_for` lines; a suggestion only |
| R63 | a bare-name counterparty refused `COUNTERPARTY_REFUSED` |
| R64 | a law may name a held `STD-` standard |
| R65 | `proceeding` (a proceeding entity) |
| R66, R67 | the events timeline source; the duties trigger source |
| R68 | `place()` and `zoneOf()` |
| R69 | the ratification hold reader |
| R33, R34, R36, R39 | invariants: the machine fence (only `deadline-recheck` moves pending→overdue); an append-only ledger and tier history; invisible = absent, purge-declared tables; no place named |

Rulings cited (most cited first): K617, DEC-113, K653, DEC-14, K102, DEC-13, K1830, K1252, K1251, K1023, K899, K597, K590, K608, K275, K64, K75, N312, C-117.x; plus about sixty more single citations.

**(b) Code** · `bio-plane/src/actions/index.mjs` (3,108 lines) and `schema.mjs` (256).
- **Record:** the action is a bundle of type `action`, written through promotion.
- **Tables:** `action_basis`, `correspondence`, `action_quotes`, `action_law_proposals`, `action_risk_proposals`, `action_overrides`, `action_pressure`, `action_holds`, `action_hold_projects`.
- **Services:** actionCreate, actionMove, actionCorrespond, actionLaws, actionLawsPropose, actionRiskTier, actionRiskPropose, actionPressure, actionHold, actionHoldRelease, holdReleasePreview, projectHolds, holdsDue, holdsReleased, purgeHeld, actionQuotes, actionRead, actionsFor, addresseeSuggest, and the eventSource and triggerSource registrations.
- **Module functions:** noSuchAction, contactNotAMember, contactId, actionFacts, zoneOf.
- **Ops (`actionsOps`):** actionmove, actionlaws, actionrisktier, actionlawspropose, actionriskpropose, actioncorrespond, actioncreate, action, actions, addresseesuggest, actionpressure, actionhold, actionholdrelease, actionholdpreview, projectholds, actionquotes, actionkinds.

**What a member can do (API):** create an action; move it through its lifecycle; record correspondence, sent, received or no-response, with quotes and lifecycle places; state the governing laws and the risk tier; mark pressure and place or release a litigation hold; read actions and quotes; and ask for addressee suggestions.

**Tests** · 13 files, 96 tests: `acts` 8, `read` 8, `t11` 5, `t12` 2, `t17` 7, `t18` 14, `t19` 3, `t20` 5, `t22` 3, `t27` 8, `t33` 13, `t34` 8, `write` 12. The names are in Appendix A.

**(c) Run** · 96 tests: 96 pass, 0 fail.

**(d) Per requirement**
- Every live R-id is built and tested: R1–R3, R5–R19, R22–R30, R33, R34, R36, R39, R41–R43, R45–R49, R51, R52, R54–R69 are all named in test titles.
- The only piece not built is DEC-113's device half under R52 (a device checking for a hold before deleting a transcript), which waits for a device-storage module (K1251). R58 is the read that device would ask, and it is built.

**(e) modules.json** · uses: record-grammar, jurisdictions, civil-time, record-core, membership, promotion, provenance, content, connections, retrieval, inquiry, conformance, entities, lines, events, standards, duties, action-grammar, capture, ratification. There is no plan entry.

---

## 3. action-clocks (layer 9)

**(a) Requirements** · `action-clocks.md`, 91 lines, read in full. Status: in force; split from `actions` (K617, K624), with the reminders as Bob ruled them (DEC-94; K613–K615). It last changed in T35 (T35-62: R11 clarified), and every requirement is met (K2021). Open for Bob: none.

| R | gist |
|---|---|
| R1 | `pendingClocks({before})`: paged pending entries across visible actions (monitoring's read); `PENDING_CLOCKS_BAD_BEFORE` |
| R2 | `clockPropose`: an entry computed from a profile deadline (calendar or business days, holidays, roll, extension, close of business), with its trace; undetermined with why; stored apart, never written to `clock[]` |
| R3 | `overdueClocks`: for queue-producers R15, with project, creator and `zone` |
| R4 | `reminderSet`: a member's own reminder row (set, change, remove); never a field of the action; at most 50 an action; `reminderRefused` |
| R5 | `remindersDue` (queue-producers R18) |
| R6 | `reminderAnswer`: a further reminder or none (DEC-10) |
| R10 | a business count states each holiday year's `local-facts` status (unconfirmed, corrected, disputed or absent → undetermined, confirmed) |
| R11 | `calendarFactsRead`: the local-fact paths live deadlines read, closure lists included |
| R12 | `factReader(localFacts, viewer)`: for filings R30 |
| R13 | `clockAdopt` (`op=clockadopt`): a member adopts a proposal into `clock[]` through the action's revision |
| R14 | `clocksIcs` (`op=clocksics`): a one-off iCalendar download; nothing pushed |
| R15 | `lateness`: an index over the group's own deadlines (commitment, dependency, window) only; never about government |
| R7 | invariant: every deadline names its basis kind (`rule`, `commitment`, `dependency`, `window`); overdue derived at read |
| R8 | invariant: nothing reminds unless a member asked (DEC-69, DEC-94); no outside channel |
| R9 | invariant: invisible = absent; tables purge; no place named |

Rulings cited: DEC-94, K624, K617, K615, K613, K1431, N609, N311, K998, K614, K1675, K1444, K1440, DEC-77, DEC-69, DEC-10, K1451, K1471, K921, K1847, K2021, DEC-149, and others.

**(b) Code** · `bio-plane/src/action-clocks/`: `index.mjs` (1,071 lines), `count.mjs` (322: computeDeadline, factReader, holiday reading), `ics.mjs` (109), `checks.mjs` (59) and `schema.mjs` (68).
- **Tables:** `action_clock_proposals`, `action_reminders`, `leaves`.
- **Services:** pendingClocks, clockPropose, overdueClocks, reminderSet, remindersFor, remindersDue, reminderAnswer, calendarFactsRead, clockAdopt, clocksIcs, lateness.
- **Ops:** reminderset, reminderanswer, clockadopt, clocksics, clocklateness.
- **Wiring:** queue-producers reads `remindersDue` and `overdueClocks`; monitoring reads `pendingClocks`.

**Tests** · 9 files, 55 tests: `adopt` 5, `calendar` 9, `clocks` 8, `factreader` 5, `ics` 3, `lateness` 2, `overdue` 7, `reminders` 10, `worked` 6 (the 20 worked deadline examples).

**(c) Run** · 55 tests: 55 pass, 0 fail.

**(d) Per requirement** · R1–R15 are all built and tested; each is named in a test title.

**(e) modules.json** · uses: record-grammar, jurisdictions, record-core, membership, promotion, provenance, retrieval, conformance, actions, action-grammar, local-facts, civil-time, standards, calc-grammar. There is no plan entry.

---

## 4. filing-templates (layer 9)

**(a) Requirements** · `filing-templates.md`, 104 lines, read in full. Status: in force; approved by Bob 2026-10-01 (K921, K924; K922 moved `FILING_BLANKS` here). It last changed in T35 (R26, K1869) and T37 (T37-23: Terms, R27 new). **Its Status line says "R27 not yet met (T37)". That is stale:** R27 was merged by FILING-TEMPLATES #6 (K2233), and its tests pass.

| R | gist |
|---|---|
| R1 | a template `{id TPL-, kind, use file\|brief, profiles\|general, name, scope, origin}`; `TEMPLATE_TIER3_FILE`; name taken |
| R2 | a version `{text, sha, state, notes, author, contributors, derived_from, reviews, approved, ended}`; blanks must be in `FILING_BLANKS`; text frozen after draft |
| R3 | `templateDraft`: a new template or a new draft version; `from` a version, a proposal or (through filings only) an approved filing |
| R4, R5 | `templateRevise`, which keeps every revision; `contributors` |
| R6 | `templatePropose`: any credential; stored apart (`TPP-`), labelled |
| R7 | `templateSubmit`: to `in_review` with member reviewers |
| R8 | `templateReviewGrant` and `templateGrantRevoke`: a revocable professional review door by a secret digest; the one dead answer |
| R27 | `secretSha` read only from the internal request body, never the query (N761) |
| R9 | `templateReview`: a member's or a professional's review; outcomes `no_concerns`, `concerns`, `changes_requested` |
| R10 | `templateApprove`: by a project owner, not the sole author; reviews required by tier (Tier 1: one member; Tier 2, a Tier 3 brief or undetermined: one professional, or a reason); the earlier approved version becomes `updated`; `widen` to the group by an administrator |
| R11 | `templateRetire`: retire the whole template, or withdraw a draft or in-review version |
| R12, R13 | notes (8,000 characters) and comments |
| R14 | `templatesFor` and `templateRead`: offered versions, the latest the default |
| R15 | the profile's templates read as approved, origin `profile` |
| R19 | `FILING_BLANKS`, `FILING_TEXT_MAX`, `blanksOf` |
| R20 | `reviewsRequested` (queue) |
| R21 | `TEMPLATE_STATES`, `TEMPLATE_USES`, `REVIEW_OUTCOMES` |
| R25, R26 | `offeredVersion` (for filings), by id or by the `@handle` name |
| R16–R18, R22–R24 | invariants: attribution held by value; nothing deleted; no place named; a machine only proposes and comments; the C-115/C-125 rows; visibility |

Rulings cited: K921, K922, K924, K933, K1869, K2129, K2175, K1874, K903, N702, N761, N476, K1038, K2233, DEC-24.

**(b) Code** · `bio-plane/src/filing-templates/`: `index.mjs` (1,350 lines), `schema.mjs` (191), `checks.mjs` (209) and `blanks.mjs` (37).
- **Tables:** `tpl_templates`, `tpl_versions`, `tpl_revisions`, `tpl_notes`, `tpl_events`, `tpl_reviewers`, `tpl_proposals`, `tpl_reviews`, `tpl_grants`, `tpl_grant_revocations`, `tpl_comments`.
- **Version states:** draft → in_review → approved → updated | withdrawn; a template may be retired.
- **Ops:** templatedraft, templaterevise, templatepropose, templatesubmit, templatereviewgrant, templategrantrevoke, templatereview, templateapprove, templateretire, templatecomment, templatecomments, templates, templateread.
- **Service:** `offeredVersion`, used by filings and the wizard; `reviewsRequested` is read by queue-producers.

**Tests** · 6 files, 56 tests: `draft` 9, `grant-channel` 5 (R27), `invariants` 8, `lifecycle` 15, `reads` 13, `review` 6.

**(c) Run** · 56 tests: 56 pass, 0 fail.

**(d) Per requirement** · R1–R27 are built and tested; each is named in a test title, R27 included.

**(e) modules.json** · uses: record-grammar, jurisdictions, record-core, membership, action-grammar. There is no plan entry; the stale Status line is noted for BOB.

---

## 5. filings (layer 9)

**(a) Requirements** · `filings.md`, 130 lines, read in full. Status: in force; approved by Bob 2026-09-26 (K102), with R8–R12 Bob's (K13), K171 folded, and filing templates per K921, K922 and K924 (R26 retired). It last changed in T35 (T35-64: R8; K1739, K1742), and every requirement is met (K2023). Open for Bob: none. Not in this version by design: **sending by the instance** (email or portal) is Bob's to add (K102). The instance transmits nothing; a member files by the venue's means.

| R | gist |
|---|---|
| R1, R2 | `filingPrepare` refusals; the governing tier is the stricter of the kind's and the action's; undetermined is refused; Tier 3 goes to `TIER3_COUNSEL_PACKET` |
| R3 | every blank is filled from the record with its source, or left as `[UNFILLED: name]` with why; never invented |
| R4 | a Tier 2 draft carries the profile's advisory note |
| R5 | any credential prepares; stored apart and labelled; `evidence: false`; drafts are never edited |
| R6 | `filingApprove`: member only; `FILING_STALE`, `STILL_UNFILLED`; approved once; the SHA recorded |
| R7 | `filingRecordSent`: one `sent` correspondence entry; `proposed` next state and clock entries; nothing transmitted |
| R8 | `counselPacket` at every tier; a reason required (`PACKET_NO_REASON`); counsel required at Tier 3 or undetermined; `NO_DETERMINATION` unless overridden; carriage of copyrighted standards (passages relied on only) |
| R9 | six sections: facts, chronology, exhibits (attestations), standards, candidate theories, deadlines; consequences as recorded |
| R10 | the marking "Prepared for review by … Not legal advice. Not for filing."; never fileable |
| R11 | never published; `counselPacketRead` and `counselPacketExport` (export recorded; a machine refused) |
| R12 | versions; `basis_changed` flags |
| R33 | the chronology as an events timeline read: "what they did" and "what we did" lanes apart |
| R13 | `filingsFor` (escalation's read) |
| R14 | `theoryPropose`: candidate theories against named standards |
| R15, R21 | the evidence package's available-actions block; `availableActions({determination})` |
| R22 | in-band quartet stamps on approved bytes and exports |
| R23 | `communicationPrepare`: a draft message to any addressee; same approve and send path |
| R24 | the premise-override disclosure, first on the face |
| R25 | each exhibit's capture grade and co-attestation; the venue's evidence standard flags; never a refusal |
| R26 | retired (→ filing-templates) |
| R28, R29 | template or own words (`TEMPLATE_NOT_NAMED`, `TEMPLATE_KIND_MISMATCH` and others); the draft records its template; flags for not-written-for-jurisdiction, updated or retired |
| R30 | deadlines state the calendar status through `action-clocks.factReader` |
| R31 | a packet `briefing` section from a `brief` template |
| R32 | `templateSave`: an approved filing → a `filing-templates` draft |
| R16–R20, R27 | invariants: a machine never approves, sends, names counsel or exports; Tier 3 never yields a fileable document; sources named; append-only; no place named; withheld whole |

Rulings cited: K102, K13, K171, K921, K922, K924, K1739, K1742, K2019, K2023, K316, K254, K108, K998, K1038, K1494, K651, K600, K597, K903, DEC-36, DEC-88, K1025, N653, N331, N217, K275, N72.

**(b) Code** · `bio-plane/src/filings/`: `index.mjs` (1,791 lines), `schema.mjs` (167), `checks.mjs` (171) and `dates.mjs` (55).
- **Tables:** `filing_drafts`, `filing_approvals`, `filing_sendings`, `counsel_packets`, `counsel_packet_exports`, `theory_proposals`, `communication_drafts`, `filing_templates` (the pre-move library, migrated).
- **Ops:** filingprepare, communicationprepare, templatesave, filingapprove, filingsent (alias `filingrecordsent`), counselpacket, counselpacketread, counselpacketexport, filingsfor, theorypropose, availableactions.
- **States:** a draft is prepared → approved (once) → sent (once); packets are versioned, with `basis_changed` flags.

**Tests** · 12 files, 70 tests: `approve-send` 6, `chronology` 5, `held-back` 3, `outward` 6, `packet` 14, `premise` 3, `prepare` 10, `reads` 6, `refusals` 3, `sight` 4, `templates` 8, `wording` 2.

**(c) Run** · 70 tests: **69 pass, 1 fail**. The failing test is `outward.test.mjs:136`, "R25 every draft and packet shows each exhibit's capture grade …":
- assertion at :147: expected `[null, false]`, actual `['B', false]`, for the exhibit meant to be ungraded;
- this is the known accepted red **N819** (K2387): the fixture inherits publication's `doc(id)` receipt (K2378), so the exhibit grades B;
- the tests-only fix is T40-9a, moved to T41 unstarted. The product behaviour (R25) is not in doubt: the companion R25 test, with the venue standard and flags, passes.

**(d) Per requirement**
- Every live R-id is built and tested: R1–R25, R27–R33.
- R25 has one red test, and its cause is the fixture.
- R26 is retired.

**(e) modules.json** · uses: record-grammar, jurisdictions, record-core, membership, promotion, provenance, attestation, content, publication, standards, conformance, consequences, actions, action-clocks, public-read, strength, filing-templates, local-facts, events. Plan: `archive/T40.md`:45 has **T40-9a · filings (tests only) · N819**, moved to T41 (:116). `next.md` has no filings entry.

---

## 6. escalation (layer 9)

**(a) Requirements** · `escalation.md`, 129 lines, read in full. Status: in force; approved by Bob 2026-09-26 (K102), with R11 and R12 Bob's (K14), R14's undetermined case approved (K172), and DEC-89 as approved (K1019). It last changed in T33 (T33-76: R4 and R12 amended, R30 new; K1442), and every requirement is met (K1659). Open for Bob: none.

| R | gist |
|---|---|
| R1 | `escalationOpen`: a member with a reason; a live noncompliant determination; a joined participant; one open per determination |
| R2, R3 | `escalationRead`: each edge's trigger derived at `nowMs`, naming ids or what is missing; `proposed` with the first-met instant and age; `exit` gives two conditions separately |
| R4 | stage 1 documentation → 2 when the determination is live and the actor is an office (entity resolved) |
| R5 | stage 2 notification: an attached breach action → 3 on a `sent` entry |
| R6 | stage 3 clock: a member-stated clock entry → 4 on a received/no_response entry or a passed clock |
| R7 | stage 4 response evaluation → 5 or 7 when the latest evaluation is denied, partial or none; complied points at R14 |
| R8 | stage 5 legal tools: breach actions with filings and packets; available actions from `filings.availableActions` → 6 on sent, → 7 |
| R9 | `escalationAttach` at stages 2, 5 and 7 only; a breach action resting on this determination |
| R10 | `escalationEvaluate`: complied, partial, denied or none, with a reason; append-only |
| R11 | stage 6 sustained attention → 4 on a newer received entry |
| R12 | stage 7 political accountability: five purposes (official, oversight or audit request, testimony, enforcing legislation), naming the breached standard; elected and oversight checks by lines and profile; offers targets |
| R13 | `escalationAdvance` (`TRIGGER_NOT_MET`) and `escalationDecline` (`EDGE_NOT_PROPOSED`) |
| R14 | `escalationEnd` only when compliance is restored (a live compliant determination of the same act for each standard) and the consequences are addressed |
| R15 | suspend and resume; never ends |
| R27 | `declineToEscalate` (DEC-89): a reasoned decline, superseded later |
| R28 | `escalationStatus`: escalated, declined or neither |
| R29 | `escalationReasonDraft`: a machine pre-assembled reason, labelled; never a reason until the member sends it |
| R16 | `escalationsDue` (monitoring, queue-producers R17) |
| R22 | `escalationsFor` (action-plans) |
| R23 | an overridden action is refused `ACTION_PREMISE_OVERRIDDEN` |
| R30 | the events timeline source ("what we did") |
| R24 | `ESCALATION_NO_REASON` (C-116.24) everywhere a reason is taken |
| R25 | the `escalationOps` map |
| R17–R21, R26 | invariants: a machine never acts; append-only; no significance or score; invisible = absent; a record object `ESC-`; an attached action the viewer may not see is withheld whole |

Rulings cited: K102, K14, K172, K171, K1019, K1442, K1659, K12, K1025, K913, K933, K108, K275, K730, K766, K600, K1494, DEC-88, DEC-89, DEC-36, DEC-24, N462, N460, N309, N312, N217, N433, N485, N216, K262, K671, K760.

**(b) Code** · `bio-plane/src/escalation/`: `index.mjs` (1,589 lines), `ops.mjs` (33), `doc.mjs` (130: the escalation as an `ESC-` record object with a log section), `schema.mjs` (115) and `checks.mjs` (234).
- **Constants:** `STAGES` 1–7, `STAGE_TABLE` {1:[2], 2:[3], 3:[4], 4:[5,7], 5:[6,7], 6:[4], 7:[4]}, `ATTACHING_STAGES` [2,5,7], `READINGS`, `ACCOUNTABILITY_PURPOSES`. Escalation states are open, suspended and ended.
- **Tables:** `escalations`, `escalation_moves`, `escalation_evaluations`, `escalation_attachments`, `escalation_declines`, `escalation_declines_to_open`.
- **Ops:** escalationopen, escalation, escalationattach, escalationevaluate, escalationadvance, escalationdecline, escalationend, escalationsuspend, escalationresume, escalationsdue, declinetoescalate, escalationstatus, escalationreasondraft.

**Tests** · 10 files, 63 tests: `codes-ops` 3, `decline` 6, `draft` 7, `exit` 6, `invariants` 9, `open` 4, `real` 8 (over real neighbours), `stages` 11, `structure` 7, `voice` 2.

**(c) Run** · 63 tests: 63 pass, 0 fail.

**(d) Per requirement** · R1–R30 are all built and tested.

**(e) modules.json** · uses: record-grammar, jurisdictions, record-core, membership, promotion, conformance, consequences, actions, filings, action-grammar, entities, lines, events. There is no plan entry.

---

## 7. action-plans (layer 9)

**(a) Requirements** · `action-plans.md`, 146 lines, read in full. Status: in force; Bob reviewed it 2026-09-30 as "correct and complete enough" (K608 (3)). The module and R20 are Bob's (K590), and the planning skill is per K660. It last changed in T34 (T34-61: R14, R38), and every requirement is met (K1845). Open for Bob: none.

| R | gist |
|---|---|
| R1–R3 | `planOpen`: project, title and subjects (an inquiry, i.e. suspected; or a determination outcome, i.e. determined); a subject is in at most one open plan per project |
| R4, R5 | `planSubjectAdd` and `planSubjectRemove` with a reason; `determined_since` shown, never auto-added |
| R6–R8 | `planRead` (subjects, options, proposals, scenarios, started actions with state, escalations with stage, checks, history); `plansFor`; liveness derived |
| R9, R10 | `optionAdd` and `optionRevise`: summary, detail, category (mitigation, legal, awareness, journalistic, grassroots, other), subjects, addressee (actions' shape), regulated dates with basis, tier (legal), enforces and lobbying |
| R11 | `optionPropose` (any credential, stored apart, labelled) and `optionAdopt` |
| R12 | lobbying must name what it enforces (`LOBBYING_NO_REQUIREMENT`) |
| R13 | `optionDispose`: open, chosen, declined, done or blocked (declined and blocked need a reason); bulk, all or none |
| R14–R16, R38 | `scenarioSet` (at most three scenarios; phases with starts, checkpoint, condition and branches; cycles refused); `when_subject` and `when_duty` starts; `checkpointRecord` met or not_met |
| R17 | `checkpointsDue` (queue) |
| R18 | `optionStart`: composes and promotes an action from a chosen option (addressee, dates as clock entries, `rests_on` legs, plan and option, contact, breach and override) and sets reminders in the same act |
| R37 | `optionStartPreview`: a dry run, with the refusal shown first (DEC-115) |
| R19 | derived checks: past dates, missing branches, dead subjects, outward-on-hypothetical, no hostile-response branch, superseded lobbying target |
| R20 | `planClose`: a member, with a reason |
| R21 | a project's `work_kinds` (reporting, fixing, legal, oversight, other) |
| R29 | reminders chosen with the option, set through `action-clocks` once the action exists |
| R30–R34 | the planning run (an AI run, mode `plan`): `optionPropose` by a machine needs a running plan run, sources and the bound; the disclosure sentence; `planProposals`, a tray paged five at a time, strongest first, no score |
| R36 | member words say "matter", never "subject" (DEC-114) |
| R22 | `noSuchPlan` |
| R23–R28, R33, R35 | invariants: a checkpoint is never a finding about government; a machine only proposes; never published; no cost, assignee, hours or score keys (`OPTION_KEY_REFUSED`); append-only; undetermined, never a default; withheld whole |

Rulings cited: K590, K597, K600, K608, K613, K614, K615, K617, K624, K660, K710, K711, K727, K1444, K1466, K1649, K1650, K1661, K1845, K903, DEC-8, DEC-10, DEC-24, DEC-25, DEC-26, DEC-27, DEC-36, DEC-69, DEC-70, DEC-77, DEC-94, DEC-114, DEC-115, N427, N601.

**(b) Code** · `bio-plane/src/action-plans/`: `index.mjs` (1,926 lines), `values.mjs` (282: the vocabularies and phase checks), `checks.mjs` (311), `doc.mjs` (123: the `PLN-` record object) and `schema.mjs` (152).
- **Tables:** `plans`, `plan_subjects`, `plan_options`, `plan_option_revisions`, `plan_option_proposals`, `plan_scenarios`, `plan_checkpoints`, `plan_history`, `plan_runs`.
- **States:** plan open → closed; option dispositions open, chosen, declined, done, blocked; checkpoint judgements met and not_met.
- **Ops:** planopen, plansubjectadd, plansubjectremove, plan, plans, optionadd, optionrevise, optionpropose, optionadopt, optiondispose, scenarioset, checkpointrecord, optionstart, optionstartpreview, planclose, planproposals.
- **Services:** `checkpointsDue` (read by queue-producers); `planRunCheck` and `runOpened` for ai-runs.

**Tests** · 11 files, 63 tests: `duty-starts` 9, `invariants` 5, `open` 7, `options` 6, `preview` 7, `read` 5, `runs` 6, `scenarios` 5, `sight` 5, `start` 5, `words` 3.

**(c) Run** · 63 tests: 63 pass, 0 fail.

**(d) Per requirement** · R1–R38 are all built and tested, including "R19b", the hostile-response check.

**(e) modules.json** · uses: record-grammar, jurisdictions, record-core, membership, promotion, provenance, inquiry, leg-earning, strength, run-rules, ai-runs, standards, conformance, actions, action-clocks, filings, escalation, duties. Plan: `next.md` N817 (this lane) builds on the action plan; there is no entry to change the module.

---

## 8. conformance (layer 9)

**(a) Requirements** · `conformance.md`, 150 lines, read in full. Status: in force; approved by Bob 2026-09-26 (K102), K171 folded. It last changed in T35 (T35-61: Terms amended, R27–R29 new; K1723, K1740), and every requirement is met (CONFORMANCE #14, K2021). Open for Bob: none.

| R | gist |
|---|---|
| R1 | `determine` refusals: a member only, a joined participant, the act, findings, standards, rows, outcome, unclear question, no significance, cause |
| R2 | findings must be published in the project's case edition, pinned |
| R3 | standards in force at the act's `when` (`not_in_force` refused; undetermined stated) |
| R4, R5 | outcome per standard, never composed; disagreement stated; compliant carries the same obligations |
| R6 | unclear names questions (an existing or new inquiry), landing atomically |
| R7 | never edited; `supersedes` with a reason, once |
| R8 | no significance, severity, priority, urgency, rank or score keys |
| R9–R11 | `determinationRead` (pinned editions, frozen and live strength pairs, act with participants, `outcomes_differ`); the `basis_changed` flag; `determinationsFor` (200 a page) |
| R12, R18 | `comparisonPropose`: stored apart, labelled, never an outcome; may cite a contradiction inquiry; `comparisonRead`; size caps |
| R19, R20 | `noSuchDetermination` and `determinationSuperseded`: single-site answers |
| R21, R22 | `comparisonFacts` from a contradiction (member names `standardSide`); `cause` with evidence, else "cause not established"; recommendation or policy refused |
| R25, R26 | the act is an `events` event with an office actor (entity); legacy `ACT-` ids aliased |
| R27 | bindingness: noncompliant only against a binding standard; a benchmark is never "violation" |
| R28 | comparisons may judge an organisation's act, never a person's; determinations judge offices only |
| R29 | a measure row (`did: {calc, result_key}`) with denominator and population |
| R23 | own reason codes |
| R13–R17, R24 | invariants: a member only; rests on a published finding and a standard; invisible = absent; append-only; a record object `CONF-`; withheld whole |

Rulings cited: K102, K171, K12, K1723, K1740, K1713, K1465, K1485, K2021, K275, K249, K264, K503, K569, K603, K1649, DEC-44, DEC-72, DEC-76, DEC-77, DEC-84, DEC-145, N345, N362, N651, N233, N309, N312.

**(b) Code** · `bio-plane/src/conformance/`: `index.mjs` (1,686 lines), `schema.mjs` (197) and `checks.mjs` (202).
- **Tables:** `determinations`, `determination_standards`, `determination_rows`, `determination_findings`, `determination_questions`, `determination_supersessions`, `determination_flags`, `determination_causes`, `comparison_proposals`, `comparison_proposal_contradictions`, `comparison_proposal_uses`.
- **Values:** `OUTCOMES` compliant, noncompliant, unclear; row `READINGS` aligns, diverges, open. A determination is live or superseded.
- **Ops:** determine, determination, determinations, comparisonpropose, comparison, comparisonfacts.

**Tests** · 10 files, 81 tests: `act-event` 10, `contradiction-cause` 11, `dec149` 2, `determine` 18, `helpers` 6, `reads` 12, `record` 7, `t35` 10, `t36` 4, `t37` 1.

**(c) Run** · 81 tests: 81 pass, 0 fail.

**(d) Per requirement** · R1–R29 are all built and tested.

**(e) modules.json** · uses: record-grammar, record-core, membership, promotion, content, inquiry, strength, contradiction, reevaluation, publication, standards, corpus-export, entities, events, civil-time, calculations. There is no plan entry.

---

## 9. consequences (layer 9)

**(a) Requirements** · `consequences.md`, 96 lines, read in full. Status: in force; approved by Bob 2026-09-26 (K102), with R2–R4 Bob's (K12) and R9's empty case approved (K172). It last changed in T34 (T34-49: R2, R15, R16), and every requirement is met (K1845). Open for Bob: none.

| R | gist |
|---|---|
| R1 | `consequenceRecord` refusals: a live noncompliant determination for that standard; a joined participant; affected kind; measure unit; exact decimal; period |
| R2 | `computed`: a basis `{op: sum\|difference\|count\|product\|ratio, operands}` over content figures, money facts or calculation outputs; exact arithmetic; weakest grade; a machine may record computed parts |
| R3 | `assessed`: a member's value or range with a rationale and what it rests on; machine refused |
| R4 | `undetermined` with why; never zero |
| R5 | causation: an inquiry finding, else `unproven`; zero measure `not_applicable` |
| R6 | `consequenceRevise` makes a successor; never edited |
| R7 | `consequencesOf`: totals only within one state, unit and currency; undetermined and unproven listed |
| R8 | the `basis_changed` flag |
| R9 | `addressedRecord` (a member, with evidence) and `addressed()` (escalation's exit check); no parts reads "no consequence recorded" |
| R10 | `affected.kind: person` only as a document names them; protected sources |
| R11–R16 | invariants: no composed figure or score; no assumed harm; append-only; a record object `CONS-`; withheld whole; person sight |

Rulings cited: K102, K12, K172, K171, K283, K1448, K1484, K1483, K1649, K1845, DEC-14, DEC-21, DEC-44, DEC-78, N257, N576, N600, K903, DEC-36.

**(b) Code** · `bio-plane/src/consequences/`: `index.mjs` (1,148 lines), `measures.mjs` (128: exact arithmetic over `calc-grammar`), `schema.mjs` (111) and `checks.mjs` (56).
- **Tables:** `consequence_parts`, `consequence_operands`, `consequence_addressed`.
- **States:** parts computed, assessed or undetermined; addressed or not_addressed (overall also undetermined); causation established, unproven or not_applicable.
- **Ops:** consequencerecord, consequencerevise, consequence, consequencesof, addressedrecord, addressed.

**Tests** · 6 files, 41 tests: `addressed` 4, `assessed` 5, `computed` 12, `person` 5, `reads` 10, `record` 5.

**(c) Run** · 41 tests: 41 pass, 0 fail.

**(d) Per requirement** · R1–R16 are all built and tested.

**(e) modules.json** · uses: record-grammar, record-core, membership, promotion, provenance, content, inquiry, strength, conformance, entities, calc-grammar, money, calculations, people. There is no plan entry.

---

## 10. monitoring (layer 10)

**(a) Requirements** · `monitoring.md`, 207 lines, read in full. Status: in force; approved by Bob 2026-09-26 (K102), with R17's act as Bob agreed (K1019). R53–R64 were retired to `link-sweep` (N506), and `per_meeting` and register following are `following`'s. The last fold was T33 (R15, R34, R50 amended; R69 new), and every requirement is met (K1855). Open for Bob: none. For the action layer, the relevant parts are R33–R35, R44 and R50. The rest is the document-watch daemon.

| R | gist |
|---|---|
| R1–R10 | `monitor({bundleId})`: one tick of a monitored document (refusals, governed fetch, baseline, removed or unreachable, Drive shells, comparison and assess, mechanical `monitor-tick` promotion, capture of modified bytes, the answer) |
| R11–R13 | `recordLook`: observation rows; the captured-locator write; the address type kept |
| R14–R18, R52 | cadence: authored word, contract default, an address's own frequency (`addressFrequencySet` with canned or custom reasons), volatility lengthening |
| R19–R23, R45 | the scheduler ticks (cadence, archive fallback): 50 a tick, ranked, epoch claims, non-reentrant, in-process, always on |
| R24 | retired (K372) |
| R25 | capture reachability recorded |
| R26 | `driveShells` |
| R27 | the gathering grammar (C-18.5) at promotion |
| R28 | named requests gathered on cadence (standing intent) |
| R29 | ratified sweeps (run by link-sweep) |
| R30 | pause and resume by an administrator; the due slate |
| R31, R32, R47, R48 | items for queue and machinery producers; the `monitoring({viewer})` read; `archiveEligible`; `flagged` |
| R33 | sources of live objectives and published findings proposed for monitoring |
| **R34** | a pending clock past its local day is marked `overdue` by the mechanical `deadline-recheck` promotion; the telling is queue-producers R15 |
| **R44** | the mark is bounded: pending → overdue only |
| **R35** | an overdue clock or a recorded response asks escalation whether a trigger is met; never advances |
| **R50** | `deadlineRecheckWake` and `deadlineRecheckDue` |
| R46, R51 | `counts()`, registered |
| R65, R66 | `sweepHost()` and `registerSweep` (link-sweep's seam) |
| R67, R68 | the docket watch (case-import) |
| R36–R43, R49, R69 | invariants: fetch only what store state authorises; mechanical detection; a shell never "unchanged"; governed refusals are not source failure; no lens; tables; checks; no place named; store refusal relay; `idPattern` |

Rulings cited: K102, K1019, K1855, N506, K1159, K1181, K372, K1051, K1096, K1102, K1392, K1444, K1036, K1038, K1850, K649, K717, K719, K529, K260, K261, K380, K391, K403, K406, K421, N224, N230, N314, N324, N330, N339, N349, N429, N534, DEC-37, DEC-43, DEC-101, DEC-116.

**(b) Code** · `bio-plane/src/monitoring/`: `index.mjs` (3,027 lines), `checks.mjs` (228) and `schema.mjs` (152).
- **Tables:** `monitor_fired`, `monitor_tick_epoch`, `monitor_address_type`, `monitor_address_frequency`, `monitor_gathering_run`.
- **Services:** monitor, recordLook, monitoring, driveShells, flagged, archiveEligible, addressFrequencySet, pause, slate, proposals (R33), watched, cadenceDue/Wake/Tick, archiveDue/Wake/Tick, deadlineRecheck/Due/Wake (R34, R50), actionCommitted (R35's hook on an action promotion), sweepHost, registerSweep, counts.
- **Ops:** paused, monitor, monitorlook (a store route), driveshells, monitoring, monitorpause, monitorslate, addressfrequencyset.
- **Scheduler:** calls `cadenceTick`, `archiveTick` and `deadlineRecheck` (`bio-plane/src/scheduler/index.mjs`).

**Tests** · 13 files, 121 tests: `cadence` 11, `docket` 12, `gathering` 4, `invariants` 9, `look` 4, `queue-reads` 10, `reads` 3, `relay` 3, `seam` 14, `tick` 13, `ticks` 15, `understanding` 17 (R33–R35, R44, R50), `voice` 6.

**(c) Run** · 121 tests: 121 pass, 0 fail.

**(d) Per requirement**
- Built and tested: R1–R28, R30–R52 (excluding retired R24, which still has a title that pins its retirement), R65–R69.
- R29 is built in `link-sweep` and not tested here.
- R53–R64 are retired.

**(e) modules.json** · uses: record-grammar, runtime-limits, subresources, jurisdictions, format-registry, docprofile, record-core, membership, promotion, host-governor, provenance, capture-sources, capture, acquisition, observation-log, retrieval, intent, reevaluation, publication, actions, action-clocks, escalation, credentials, case-import, civil-time. There is no plan entry.

---

## 11. following (layer 10)

**(a) Requirements** · `following.md`, 91 lines, read in full. Status: in force; a new module reviewed in T33 (K1505; T33-79), a seam beside monitoring. It last changed in T35 (T35-65: R20, R21; K1727, K1740), and every requirement is met (K2027). **Stale:** the file still opens with the banner "DRAFT by a requirements-drafting worker for BOB #114, not reviewed", and its Suggestions still list seven "Open for BOB" items (uses, how `per_meeting` names its body, and others). The code resolved the body link with `perMeetingBody` and `per_meeting_links`.

| R | gist |
|---|---|
| R1 | `followBody({body, from, until})`: a member's follow of a body with a Legistar id for a period; `unfollow` |
| R2 | the body tick reads Legistar events, items, votes and matters as captures and hands them to `legistar-reader` and `events.followedImport` |
| R3 | a changed enactment record is captured as a new version (a version notice follows through reevaluation) |
| R4–R6 | `per_meeting` captures at meeting start minus the notice period; unscheduled with a reason; lateness stated |
| R7, R8 | `followRegister` (static or rendered); account or fee registers only by the member's `refreshRegister` act |
| R9 | `followPersonQuery`: one identifier the profile lists; never by name or across registers |
| R10, R11 | `followPortal` snapshots (vintages); `snapshotDiff` keyed field by field |
| R12, R13, R19 | `followDue`, `followWake`, `followTick` (50, ranked, claimed under monitoring's host; paused honoured); `onFollowed` |
| R14 | `follows({viewer})` |
| R20 | every held policy's published copy watched every 7 days with no member act; versions kept; handed to standards |
| R21 | `policyChanges`: the "Noticed" read for notice-producers |
| R15–R18 | invariants: no paid or credentialed unattended fetch; mechanical; tables declared; no place named |

Rulings cited: K1505, K617, K1727, K1740, K2027, K2038, K1443, K1444, K1445, K1449, K1468, K1484, K1666, K1881, DEC-145, N741, N506, D13, D201.

**(b) Code** · `bio-plane/src/following/`: `index.mjs` (903 lines), `legistar.mjs` (85), `meetings.mjs` (73), `snapshot.mjs` (103), `schema.mjs` (101) and `checks.mjs` (71).
- **Tables:** `follows`, `follow_reads`, `per_meeting_links`, `per_meeting_captures`, `portal_snapshots`, `policy_versions`.
- **Values:** `FOLLOW_KINDS` body, register, person-query, portal, policy. "meeting" in the Terms is handled through `per_meeting_links`, not as a follow kind. Cadences are daily, weekly and monthly.
- **Ops:** followbody, unfollow, followregister, followpersonquery, followportal, permeetingbody, refreshregister, follows, snapshots, snapshotdiff.
- **Wiring:** `policyChanges` is read by notice-producers; `followTick` by the scheduler.

**Tests** · 7 files, 50 tests: `body` 5, `checks` 4, `meetings` 4, `policy` 6, `portal` 2, `registers` 4, `tick` 6.

**(c) Run** · 50 tests: 50 pass, 0 fail.

**(d) Per requirement** · R1–R21 are all built and tested.

**(e) modules.json** · uses: record-grammar, jurisdictions, civil-time, legistar-reader, record-core, membership, provenance, capture, extraction, entities, events, monitoring, standards, acquisition, content. These cover the requirements file's "not in Rule 3" list, except `promotion`. There is no plan entry.

---

## Member reachability

**Plane.** Every op named above is in the plane's route map. `bio-plane/src/plane/store.mjs`:587–600 spreads actionsOps, actionClocksOps, conformanceOps, consequencesOps, filingsOps, filingTemplatesOps, actionPlansOps, escalationOps, monitoringOps and followingOps. `op-declarations/index.mjs` declares them, mostly to member classes; `addresseesuggest` is declared through the `actions` family (:321), and `followregister` with the following family (:249). An authenticated member client can therefore call all of them over the API.

**Legacy UI** (`civicos-ui/app.html`, 26,550 lines, the only member screen set; it stays until the new interface replaces it, K633 and K1849). It reaches:

| op or behaviour | where in `app.html` |
|---|---|
| open an action and show its projection (`op=projection`) | `openAction` :9500 |
| author an action document (`action_kind`, `risk_tier`) through the generic new-record flow | :3319–3358 |
| `actionmove` | `openActionMove` :9810 |
| `actionlaws` and `actionlawspropose` | — |
| `actioncorrespond` | — |
| `monitor` (an act on a record) | :2267, :2278 |
| the queue (`op=queue`): action-layer items rendered generically by `kind` | :15901 |

The queue items from these modules are `action-clock-overdue`, `action-reminder`, `escalation-stage-proposed`, `plan-checkpoint-due`, `template-review-requested`, `litigation-hold` and `litigation-hold-released`.

**No screen for:** risk tier set or propose, quotes, pressure, holds, addressee suggestions, reminders, clock adopt, ICS, lateness, any `conformance`, `consequences`, `escalation`, `action-plans`, `filings` or `filing-templates` op, and any `following` op.

**Wizard scripts** (`wizard-scripts/civicsmith-library.mjs`, `screen-registry.mjs`) name the screens "request" and "start-send", with acts such as `addresseesuggest`, `actioncreate`, `actionlaws`, `communicationprepare`, `filingprepare`, `filingapprove`, `filingrecordsent` (an alias of `filingsent`, op-declarations :75), `optionstartpreview`, `optionstart`, `clockadopt` and `followregister`. However, `FRONT_DOORS` is `[]` (`front-doors.mjs`) and no runner exists (N821), so they are not reachable either.

---

## Closing table

| module | reqs (live / retired) | built | tested | test result | member-reachable? | notable gaps |
|---|---|---|---|---|---|---|
| action-grammar | 12 / 0 | all | all | 29/29 pass | n/a (pure library) | none |
| actions | 57 live / 11 retired (R4, R20, R21, R31, R32, R35, R37, R38, R40, R44, R50; R53 never assigned) | all; DEC-113 device half not built (K1251) | all | 96/96 pass | partly: legacy UI view, create (generic), move, laws, correspond; the rest API-only | no UI for tier, holds, pressure, quotes, addressee suggest |
| action-clocks | 15 / 0 | all | all | 55/55 pass | API only; queue items generic | no reminder, adopt or ICS screens |
| filing-templates | 27 (R1–R27) | all | all | 56/56 pass | API only; queue item generic | Status line stale ("R27 not yet met"; met K2233) |
| filings | 32 live / 1 retired (R26) | all; instance sending excluded by design (K102) | all | **69/70**: 1 fail, `outward.test.mjs:136` R25, accepted red N819 (fixture), fix T40-9a → T41 | API only (wizard names it; no front door) | the red test; no UI |
| escalation | 30 / 0 | all | all | 63/63 pass | API only; queue item generic | no UI |
| action-plans | 38 (R1–R38) | all | all | 63/63 pass | API only; queue item generic | no UI; the planning run needs ai-runs; N817 design lane |
| conformance | 29 / 0 | all | all | 81/81 pass | API only | no UI for determine or compare |
| consequences | 16 / 0 | all | all | 41/41 pass | API only | no UI |
| monitoring | 56 live / 13 retired (R24, R53–R64) | all (R29 in link-sweep) | all but R29 (in link-sweep) | 121/121 pass | partly: legacy `monitor` act and queue items | action-layer share (R34, R35, R44, R50) is mechanical |
| following | 21 / 0 | all | all | 50/50 pass | API only (wizard names `followregister`; no front door) | stale DRAFT banner and Open-for-BOB list in its requirements |
| **total** | | | | **724 / 725** | | |

Plan files: `build/plan/current.md` is absent (T40 archived CLOSING, T41 not opened). `build/plan/next.md` has no entry that changes these modules beyond N817 (this lane) and N821 ("most built ops have no screen"). `archive/T40.md` carries T40-9a (filings tests) to T41.

---

## Appendix A — test files and test names, per module

Titles are taken from each `test(` call and cut at 150 characters or at the first quote or backtick.


### action-grammar

- `grammar.test.mjs`:
  - R1, R2: every vocabulary and bound is exported with its value unchanged from before the move
  - R2: LAW_LEVELS is jurisdictions
  - R2: kindReadsAsWritten reads exactly ACTION_KINDS; isQuoteEntry and quoteValue answer as before the move
  - R1: riskTierState reads 1, 2, 3 and undetermined (absent, null, the word) and nothing else; RISK_TIERS holds each tier
  - R1, R11: actionKinds(view) answers the product
  - R3: the records law: C-2.10
  - R3 by hand: law only on a records_request, at most RECORDS_LAW_MAX characters, absent reads undetermined; the refusal carries C-73.6
  - R4: quoteFindings answers, for every entry of every ledger, what it answered before the move
  - R4 by hand: each refusal first found (C-72.1–C-72.5); a waiver is a revision to zero and both stand; negative control: a clean quote answers nothing
  - R5: lifecycleFindings answers, for every entry of every ledger, what it answered before the move
  - R5 by hand: each refusal (C-94.1–C-94.9); DUE_CITE_NOT_GOVERNING is not asked here; no due date is computed; negative control: a clean chain answers
  - R6: actionBasisFindings and correspondenceFindings answer, for every document, what they answered before the move
  - R6 by hand (DEC-13): a request_for_comment names an inquiry it advances and states a window as a clock entry; a rests_on leg or an advances leg onto a
  - R7: checkActionExtension reports, for every document under every instance kind set, the findings it reported before the move
  - R7 by hand: a missing counterparty and a pending clock entry past its date are reported (C-2.10, C-11.1); any other document gets nothing; it answers 
  - R8: every reader and arm actions calls answers, for every document and scalar, what actions
  - R8 by hand: governingLawsOf
  - R9: the rows C-117.26 NO_SUBJECT (actions R62), C-117.27 MACHINE_CANNOT_SET_PROCEEDING and C-117.28 NOT_A_PROCEEDING (actions R65) are held in ACTION_
  - R9: the litigation-hold rows C-117.20 MACHINE_CANNOT_SET_HOLD, C-117.21 HOLD_REFUSED, C-117.22 HOLD_NO_LEGAL_MARK are held in ACTION_CATALOGUE_CHECKS,
  - R9: the hold rows C-117.23 HOLD_RELEASE_IS_ITS_OWN_ACT, C-117.24 HOLD_PROJECTS_REFUSED, C-117.25 HOLD_ALREADY_RELEASED (DEC-113) are held in ACTION_CA
  - R9: every row is held as before the move, number and translation unchanged; C-73.6
  - R9 by hand: the rows are exactly C-32.3, .4, .18, .19, .20; C-33.3–.9; C-72.1–.8; C-73.1–.6; C-90.1–.6; C-94.1–.12; C-101.1–.5; C-117.1–
  - R6, R8 (K899 (1)): text a member reads says record, never bundle: actionBasisFindings
  - R10: pure: deeply frozen inputs are read without change, and the same inputs give the same answers
  - R10: never throws on a document it cannot read; with nowMs given, the clock is not read
  - R11: no place is named in the module
  - R12: every entity id the module tests (counterparty.entity_id, under every named kind, at the arm and in the audit) is tested by record-grammar
  - R7 (K1444 (iii)): a pending clock entry is past its date only once the office
  - R7, R8, R9 (T34-87; DEC-149, K1811): a member reads \

### actions

- `acts.test.mjs`:
  - R13 R14 actionMove: refusals in order, then one state_history entry and a promotion; the clock is untouched
  - R15 R16 R34 actionCorrespond: refusals in order; one entry appended with the server
  - R17 a received capture of another bundle gains one responds_to edge naming the action, once
  - R18 actionLaws: refusals in order; the whole list replaced, stamped and logged; R19 the proposal never sets it
  - R15 R22 the act refuses by action-grammar
  - R23 R24 actionRiskTier: refusals in order; one appended history entry; the answer states prior and words
  - R27 actionQuotes: one axis; by request with absence levels; by counterparty exactly; at most 500
  - R28 actionRiskPropose: refusals; stored apart and labelled; never the tier; the read lists at most 12, newest first
- `read.test.mjs`:
  - R12 actionFacts is pure; null for another type or an unparsable document; overdue on the office
  - R12 an entry whose basis says close of business is overdue from the close of the office
  - R25 R26 the projection block: derived at now beside the cached flag; legs, ledger, laws, proposals, lifecycle, own outcome, responses
  - R29 R36 actionRead answers R25
  - R30 actionsFor filters visible actions in id order, at most 200 a page, truncated by reading one past
  - R51 R36 the audit reports C-2.10 and C-11.1 over an action, a missing counterparty and a past pending entry; tables purge with the action
  - R36 every table this module creates is keyed by bundle_id, listed in ACTIONS_TABLES and cleared by the purge
  - R39 R41 no place is named in outward text; an old records-law kind names no law; tests run on the test profile
- `t11.test.mjs`:
  - R3 an action document holds at most 500 legs and 500 correspondence entries: more is refused ACTION_TOO_LARGE at the write; a replay over the limit is
  - R16 actionCorrespond releases its lease through record-core
  - R8 a member
  - R42 kinds() answers the kinds the instance accepts now, over the active profiles
  - R43 noSuchAction answers the one refusal for an action the caller may not see: fixed fields, one sentence, its catalogue row; extra adds and never rep
- `t12.test.mjs`:
  - R8 (N312) a breach action resting only on a superseded determination is refused DETERMINATION_SUPERSEDED, answered through conformance R20
  - R8 (N312) the answer is conformance
- `t17.test.mjs`:
  - R1 R51 a request for comment naming no inquiry is refused at the write and reported by the audit, by name
  - R1 R51 only an advances leg onto an inquiry is a disclosed inquiry: a rests_on leg, or an advances leg onto a document, is not
  - R1 R29 a request for comment naming the inquiry it put, with its window, is accepted: the disclosed question is a row
  - R1 R51 a request for comment stating no response window is refused at the write and reported by the audit
  - R1 R51 the window
  - R10 R1 another kind is not asked: a records request naming no inquiry and no window lands
  - R15 R34 a non-response to a request for comment is recorded with its date, as a named member
- `t18.test.mjs`:
  - R7 R13 
  - R9 the addressee
  - R9 R8 a breach action addresses an office, else ADDRESSEE_NOT_AN_OFFICE; one stating no addressee lands
  - R8 a member
  - R45 contact: a member id, set or changed by a member only, naming a member; shown in the read
  - R46 plan and option: set on creation only, never changed or removed; shown in the read
  - R47 actionCreate is a promotion of an action document, its id minted; op=actioncreate, op=action and op=actions
  - R48 pressure: marked on a received entry by a member, with actionCorrespond or later by actionPressure; never rewritten; read apart; actionsFor pressu
  - R49 no action is refused for the grade of what it rests on: a breach action resting on a determination and a document of any grade lands
  - R51 R7 the C-2.10 audit
  - R25 R12 a stated undetermined tier reads back undetermined, never defaulted; its fact is null
  - R1 the D-505 union: an action is known by its document or its envelope, and the union only adds refusals
  - R2 GOVERNING_LAWS_REWRITTEN with no envelope type: the document alone makes it an action
  - R9 an entity_id the subject registry holds as a person is refused COUNTERPARTY_REFUSED, its finding naming the arm; on an office arm one naming no off
- `t19.test.mjs`:
  - R45 contactNotAMember is the one answer to a contact naming no member: fixed fields, its row C-117.11, one sentence; extra adds and never replaces; ne
  - R45 the write answers CONTACT_NOT_A_MEMBER through contactNotAMember, asking contactId as a later module would
  - R51 the audit
- `t20.test.mjs`:
  - R52 actionHold: refusals in R52
  - R52 R25 in_place then released: both statements kept, the latest stands; the read shows a legal mark
  - R54 holdsDue lists a legal mark until a hold is stated; never another kind, never an invisible action; the state is not asked
  - R54 holdsDue pages at 500 in (action id, position) order, with cursor and truncated; paging through each cursor reaches every mark
  - R13 (K899 (1)) the move
- `t22.test.mjs`:
  - R55 capture asks actions
  - R55 a reader whose read fails answers true, so capture may not clear; the reader writes nothing and never throws
  - R55 registered once per host: a second actionsOf registers nothing, and capture holds the one reader, actions
- `t27.test.mjs`:
  - R52 actionHold: refusals in R52
  - R52 R25 R36 a hold records the action
  - R56 actionHoldRelease: refusals in R56
  - R57 holdReleasePreview: refusals in R57
  - R58 projectHolds: 1 to 50 distinct project ids (C-117.24); held with since and recorded_by, false, or null when absent or not seen at FULL; never fals
  - R59 holdsReleased: each release that ended a hold in place, with its placers and the restarted the viewer sees; never an invisible action; pages at 50
  - R59 holdsReleased pages at 500 in (action, position, sequence) order; paging through each cursor reaches every release
  - R60 purgeHeld: false with no hold in place; the whole store, a held project, its material, an action carrying a hold and an undeterminable bundle whil
- `t33.test.mjs`:
  - R61 the plan id is tested by record-grammar
  - R15 BAD_DATE refuses a YYYY-MM-DD that names no calendar day (civil-time R6); a real one lands
  - R9 R47 actionCreate fills an office arm
  - R9 R25 the read shows who held the office on the action
  - R63 (C-8
  - R64 R18 R19 a governing law may name a held standard the viewer may see; the citation stays the member
  - R64 R5 a records-request law may name a held standard as 
  - R65 an action may state its proceeding: set and changed by a member, an entity of kind proceeding; shown with its status on the action
  - R62 addresseeSuggest answers the offices held as custodian_of or responsible_for a subject, as R9
  - R66 the 
  - R67 the trigger source: each sent entry of a records request addressed to the duty
  - R33 R25 the mechanical recheck and the lifecycle read on the office
  - R51 the audit
- `t34.test.mjs`:
  - R68 place() answers the active profiles
  - R68 zoneOf answers the IANA zone a place states (its time_zone
  - R68 R12 read through place() and zoneOf, a local day is the office
  - R69 at start actions registers once with ratification.registerHoldReader a reader holdsOn({project}); a second actionsOf registers nothing
  - R69 holdsOn answers R58
  - R69 holdsOn answers null when it cannot complete the read (no project named, the holds unreadable), never false; it writes nothing and never throws
  - R69 against ratification R45: with no reader op=publishat answers SCHEDULE_UNCHECKABLE for want of one; with actions
  - R10 R45 R8 (DEC-149, T34-87) the member-facing details name 
- `write.test.mjs`:
  - R1 a machine may not state, change or drop a member
  - R1 a member
  - R1 legs, ledger and responds_to are refused by name, each with findings (C-2.10, C-6.1)
  - R2 governing laws change only through the act, replay included (C-73.1)
  - R3 legs, ledger and quotes are replaced whole from the document; no server time but recorded_at
  - R6 R41 law rides a records_request only, a citation (action-grammar R3), refused at the write (C-73.6); an old kind reads as written
  - R5 a machine may not state, change or remove a records law; one stated before reads MACHINE-STATED (C-32.20)
  - R7 R9 R10 the five C-101 arms at the write; a missing counterparty and a past pending entry land
  - R8 a breach action rests on a live determination the author may see, read through conformance (K252)
  - R11 a leg onto a document pins the capture presented at the write; a later capture does not move it; an old leg is never back-filled
  - R33 a machine revision moves only a past pending entry to overdue, by the mechanical recheck (C-117.1)
  - R8 R15 R16 a correspondence on a breach action resting on a live determination the author sees is accepted, over the real conformance (K256)

### action-clocks

- `adopt.test.mjs`:
  - R13 a member adopts a standing proposal in one act: the entry, with its basis and trace, is appended to clock[] by a revision of the action; the propo
  - R13 refusals in order: MACHINE_CANNOT_ADOPT_CLOCK, NO_SUCH_ACTION, NO_SUCH_CLOCK_PROPOSAL (never proposed, or already adopted), CLOCK_PROPOSAL_UNDETER
  - R7 every deadline names its basis kind: rule (a law or order, which may name a held standard, its in-force state read on the date, the member
  - R8 a machine never adopts a deadline, and this module
  - R13 the op clockadopt reads the control plane
- `calendar.test.mjs`:
  - R10 a business count reads the holiday entries for all offices and those naming the action
  - R10 R12 a rule that names a closure list counts on that list alone, and the list
  - R10 on the first profile
  - R10 the count states each year
  - R11 calendarFactsRead lists, once each, the holiday entries and office hours a live business-day deadline reads, from this year to its latest pending 
  - R11 (N689) calendarFactsRead also lists each entry of the named closure list a live deadline
  - R11 (N689) a list a rule only rolls on is listed; a path a rule and its observed both name is listed once; a list entry for another office, a list no 
  - R11 at most 500 actions are read, 
  - R11 each path
- `clocks.test.mjs`:
  - R1 pendingClocks lists pending entries dated before 
  - R1 pendingClocks reads at most 500 actions a page in id order after 
  - R1 (N311) a page runs in (action, position) order and may end inside an action: its cursor 
  - R1 (N311) an action with more pending clock entries than a page (500) is read whole across pages
  - R2 clockPropose computes from the profile
  - R2 a rule held without a primary source is no basis (UNMEASURED, K1445): a profile holding one does not combine, and the count itself refuses it; a so
  - R2 a business-day count runs on the profile
  - R2 the close of business is the governing office
- `factreader.test.mjs`:
  - R12 factReader answers each holiday entry as R10
  - R12 a lapsed confirmation is unconfirmed, naming the day it was made; the count says so
  - R12 negative controls: an entry naming no local fact, a factStatus that throws or refuses, or an answer local-facts cannot give is absent with why; no
  - R12 factReader answers null when localFacts has no factStatus, and the count then states its calendar not_read, saying so without calling the group
  - R12 one reader: the same count through factReader and through the count
- `ics.test.mjs`:
  - R14 clocksIcs answers one iCalendar file of the pending dated entries of the named actions: an all-day event on the entry
  - R14 a one-off file the member saves: no address is published, nothing is pushed; an absent or invisible action answers actions.noSuchAction; at most 2
  - R14 the renderer: each zone
- `lateness.test.mjs`:
  - R15 lateness counts the group
  - R15 never a finding about government: no rule entry is counted, no counterparty is named, nothing is raised; a malformed period is refused
- `overdue.test.mjs`:
  - R3 overdueClocks lists every overdue or past pending entry of open visible actions, with the action
  - R3 a pending entry is past from the local day after its date in the action
  - R3 (N609) each item carries 
  - R3 pages run in (action, position) order, at most 500 entries and 500 actions a page, 
  - R7 overdue is derived at the read and a stored status is reported beside the derivation, never in place of it; a proposal carries its basis and no dat
  - R9 every read answers an invisible action as an absent one; the module
  - R3 R5 the action
- `reminders.test.mjs`:
  - R4 reminderSet: a member sets, changes and removes their own reminder; it is a row of this module
  - R4 refusals in order: MACHINE_CANNOT_SET_REMINDER, NO_SUCH_ACTION (absent, invisible, not an action alike), then REMINDER_REFUSED naming each arm
  - R4 remindersFor answers an action
  - R5 remindersDue lists each unanswered reminder whose day has come, on a pending entry of an open visible action: due on its local day and not before, 
  - R5 (N609) each due item carries 
  - R5 pages run in (action, entry, day) order, at most 500, 
  - R6 reminderAnswer: the member answers a due reminder with another later day, or with none; a second answer is refused; the document is unchanged
  - R8 nothing reminds that no member asked for; a machine never sets, changes or answers a reminder; this module never adds, removes or re-dates a clock 
  - R4 R6 the ops reminderset and reminderanswer read the control plane
  - R4 (N427) reminderRefused(arm, detail, extra?) is exported, the one answer REMINDER_REFUSED is minted through: its row, its arm and detail, a caller
- `worked.test.mjs`:
  - R2 worked examples P1–P6 (published, CCP §§12, 12a, 1005): backward court days, the backward roll, calendar days, the forward roll, and each year
  - R2 worked examples E1, E2 (published and wrong): the statute
  - R2 worked example R1 (official record, Gov. Code §945.6(a)(1)): six months from 2023-11-17 is 2024-05-17; with the roll the profile
  - R2 worked example C1 (OMC 2.20.070(C)): a Monday special meeting
  - R2 worked examples O1–O6 and N6 (the City
  - R2 worked examples F1–F3 (derived, FOIA 5 U.S.C. §552(a)(6)): 20 working days on the federal list, its 10-day extension

### filing-templates

- `draft.test.mjs`:
  - R1 a template is {id, kind, use, profiles, name, scope, origin, versions}: an opaque TPL- id (never a counter), scope its project, origin group
  - R1 the template
  - R1 a name held by a retired template is free again in its scope; a general template is offered under every profile and its tier is the active view
  - R2 a version is {template, version, text, sha, state, notes, author, contributors, derived_from, reviews, approved, ended}; version counts from 1; sha
  - R2 the text
  - R3 templateDraft: a new version of a named template keeps its kind, use, profiles, name and scope, counts on, and records derived_from for a version, 
  - R3 refusals in order: MACHINE_CANNOT_DRAFT_TEMPLATE, NO_SUCH_TEMPLATE, TEMPLATE_SCOPE_REFUSED, TEMPLATE_DRAFT_OPEN, TEMPLATE_RETIRED, R1
  - R19 FILING_BLANKS and FILING_TEXT_MAX are exported frozen and unchanged from filings
  - R21 TEMPLATE_STATES, TEMPLATE_USES and REVIEW_OUTCOMES are exported frozen, as the Terms and R9 give them (and as the profile
- `grant-channel.test.mjs`:
  - R27 templatereviewgrant takes the new grant
  - R27 templatereview
  - R27 templatecomment
  - R27 templatecomments
  - R27 templateread
- `invariants.test.mjs`:
  - R16 every name in attribution is held by value beside its id: a later change of handle leaves the history reading as it was
  - R17 nothing is deleted or rewritten: every act appends to this module
  - R18 no place, law, venue or template wording is in the module
  - R22 a machine writes only a proposal and a labelled comment: it never drafts, revises, submits, grants, reviews, approves, widens, retires or withdraw
  - R23 each refusal carries its row {check, where, translation} from this module
  - K927 the migration takes each template filings R26 saved as a draft of origin group, never approved: author its saver, derived_from its filing draft, 
  - the ops map: each op reads the control plane
  - R23 (DEC-149) a member reads the group
- `lifecycle.test.mjs`:
  - R4 templateRevise replaces a draft
  - R4 refusals in order: MACHINE_CANNOT_DRAFT_TEMPLATE, NO_SUCH_TEMPLATE, TEMPLATE_SCOPE_REFUSED, NOT_A_DRAFT, R2
  - R5 contributors lists, in time order, every member who revised and every adopted proposal
  - R6 templatePropose: any credential proposes, stored apart under an opaque TPP- id, labelled proposalLabel(proposer, \
  - R6 refusals in order: TEMPLATE_NO_PROPOSER, NO_SUCH_TEMPLATE, TEMPLATE_KIND_REFUSED (for a kind), R2
  - R7 templateSubmit moves a draft to in_review, fixing its text and sha, recording the members asked; a live grant alone also suffices
  - R7 refusals in order: MACHINE_CANNOT_DRAFT_TEMPLATE, NO_SUCH_TEMPLATE, TEMPLATE_SCOPE_REFUSED, NOT_A_DRAFT, REVIEWER_UNKNOWN (naming the first), NO_RE
  - R10 a full lifecycle at Tier 1: one member review with no concerns; the approver an owner who is not the sole author; approval records approver, insta
  - R10 at Tier 2 a professional review, or in its place the approver
  - R10 an undetermined tier needs a professional review or a reason; a standing changes_requested refuses; a later review of the same sha stands in place
  - R10 refusals in order: MACHINE_CANNOT_APPROVE_TEMPLATE, NO_SUCH_TEMPLATE, NOT_IN_REVIEW, NOT_AN_APPROVER, APPROVER_IS_AUTHOR (the sole author refused,
  - R10 the earlier approved version becomes updated, naming its successor, and stays offered; widen makes a project template group-wide, by an administra
  - R11 retiring a whole template: by an approver of its scope, with a reason; none of its versions is offered, each stays readable with the reason, no ne
  - R11 withdrawing a draft or in-review version: by its author, with a reason; an approved or updated version is never withdrawn alone
  - R12 notes: at most 8,000 characters, each edit kept with author and time, edited through R3 and R4 while a draft; after that added as notes, never cha
- `reads.test.mjs`:
  - R14 templatesFor lists every offered version (approved and updated, of templates not retired) with its metadata, the latest approved marked default; d
  - R14 filters: kind, use, profile (templates naming it and the general ones, each saying whether written for it), and state lists drafts, in review, wit
  - R14 at most 200 templates, newest first, with truncated measured past the bound
  - R14 templateRead answers one version (the latest approved by default) with its whole attribution, its proposals adopted, its comments
  - R15 the profile
  - R15 a profile template whose text names a blank outside FILING_BLANKS is not offered and reads TEMPLATE_BLANK_UNKNOWN
  - R20 reviewsRequested lists every (version, member) pair asked, in review, with no review of the present sha; in (version id, member) order, at most 50
  - R20 each item names the template
  - R24 a project
  - R25 offeredVersion answers the version a filing may use with its metadata: absent, the latest approved (default); a named updated version with updated
  - R26 a template
  - R26 offeredVersion takes {name, project?, version?} in place of template: among templates not retired that the viewer may see, the project
  - R26 refusals in order, each writing nothing: template and name both or neither, or a name not @ and a handle, TEMPLATE_REF_REFUSED; no such template i
- `review.test.mjs`:
  - R8 templateReviewGrant: a participant opens a revocable door to one draft or in-review version, an opaque TRG- id, by a secret
  - R8 refusals in order: MACHINE_CANNOT_DRAFT_TEMPLATE, NO_SUCH_TEMPLATE, TEMPLATE_SCOPE_REFUSED, GRANT_RECIPIENT_REFUSED, GRANT_NO_SECRET; a version pas
  - R8 revocation records the revoker and instant; a second answers existed: true with the first; every caller with a secret not live receives one byte-id
  - R9 templateReview records one review against the present sha: a member (with declared expertise shown) or a professional through a grant (recipient, o
  - R9 refusals in order: MACHINE_CANNOT_REVIEW_TEMPLATE, the dead answer or NO_SUCH_TEMPLATE, NOT_IN_REVIEW, REVIEW_REFUSED, REVIEW_STALE
  - R13 templateComment: 1–4,000 characters, naming its version, attributed to the member, the grant, or a labelled run; templateComments lists newest l

### filings

- `approve-send.test.mjs`:
  - R6 refusals in order: MACHINE_CANNOT_APPROVE, NO_SUCH_FILING (absent and invisible one answer), FILING_STALE naming what changed, STILL_UNFILLED, TEXT
  - R6 FILING_STALE names each change since the draft: the tier, the counterparty, the determination, the governing laws, a superseded determination
  - R6 a member approves the draft
  - R7 refusals: MACHINE_CANNOT_FILE, NO_SUCH_FILING, NOT_APPROVED, ALREADY_SENT, then actions
  - R7 R30 the sending is one 
  - R16 nothing a machine writes approves, sends, names counsel or exports; a machine prepares drafts and proposals, each labelled
- `chronology.test.mjs`:
  - R33 the chronology is events
  - R33 R27 an event of the set the reader may not see is withheld whole, dated or placed nowhere: left out of the lane, never stood in for, named nowhere
  - R33 a truncated lane says so; a set the record cannot name, a timeline no module answers, and one that refuses are each said in words, never an empty 
  - R33 the chronology is assembled into the version and kept: a later event changes no version already assembled, and the next version reads it
  - R33 the chronology is one dated timeline read per reader (N602): every read names the act
- `held-back.test.mjs`:
  - R8 a standard whose access is not free is carried by its designation, edition, issuer, citation, adoption and access and only the passages relied on: 
  - R8 a standard
  - R8 R9 access as standards holds it: paywalled and reading-room standards carried with only the passages relied on, in the members
- `outward.test.mjs`:
  - R22 an approved filing
  - R22 every counsel-packet export carries the in-band quartet over the packet
  - R23 communicationPrepare: any credential prepares a communication for an action, stored apart, labelled, evidence: false, from no template; R6 and R7 
  - R25 every draft and packet shows each exhibit
  - R25 the venue
  - R19 communications are keyed to their action and purged with it; the retired R26 library
- `packet.test.mjs`:
  - R8 refusals in order: MACHINE_CANNOT_NAME_COUNSEL, NO_SUCH_ACTION, NO_COUNSEL (at Tier 3 or an undetermined tier; a counsel given at any tier without 
  - R8 PACKET_NO_REASON (C-115.44): a reason absent, not a string, blank or only whitespace, or over 2,000 characters is refused with nothing written, ask
  - R9 the six sections, each item naming its record source: facts, the chronology (a timeline read, R33), exhibits with provenance and attestations, stan
  - R9 an exhibit
  - R9 a claim deadline
  - R30 a packet
  - R10 every section, the head and every export carry the marking; no caption, venue heading, signature, prayer or template; fileable is false
  - R10 with no counsel named (Tier 1 or 2) every section, the head and every export carry the group
  - R11 the packet is never published and has no path to publication; it is read only by a member who may see the action (NO_SUCH_PACKET otherwise); an ex
  - R12 assembling again makes a new version and earlier versions stay readable; a version is flagged basis_changed, naming each cause, and nothing in it 
  - R14 any credential may propose a candidate theory and remedy against named standards, stored apart and labelled, why at most 1,000 characters; NO_STAN
  - R10 R22 the export
  - R27 R12 a superseded standard whose successor the reader may not see is named superseded without by, its cause stating out_of_view: true; a successor 
  - R27 R12 a flagged determination
- `premise.test.mjs`:
  - R3 the addressee
  - R8 an action stating a premise override and no live determination gets a counsel packet: assembled with R24
  - R24 a draft, packet or communication prepared from an action carrying a premise override carries, first on its face and in every export and approved b
- `prepare.test.mjs`:
  - R1 refusals in order: NO_AUTHOR (FILING_NO_PREPARER), NO_SUCH_ACTION (absent and invisible one answer), ACTION_CLOSED, FILING_TIER_UNDETERMINED, TIER3
  - R1 R28 TEMPLATE_NOT_NAMED (never the retired KIND_NO_TEMPLATE) also when no profile is active and when the active profiles disagree on the template (w
  - R2 the stricter of the kind
  - R3 every blank is filled from the record naming its source, or left as a visible [UNFILLED: name] marker listed with why; never from the preparer
  - R3 the producing group is read through promotion
  - R4 a Tier 2 draft carries the profile
  - R5 any credential may prepare; the draft is stored apart, labelled with its preparer and whether it is machine work, answered evidence: false with a s
  - R17 a Tier 3 governing tier never yields a template, a pre-filled filing or a fileable document; a profile cannot hold a Tier 3 template
  - R17 the brief arm: a brief template yields only a packet
  - R20 no place, law, venue or template is named in behaviour or outward text: each comes from the active profiles, the test profile included; none activ
- `reads.test.mjs`:
  - R13 filingsFor lists the action
  - R15 the available-actions block of a published case a live determination rests on: every kind against its offices with tier and words; for Tier 3 the 
  - R15 the block is registered with publication once, at start, and computed at each read
  - R21 availableActions answers R15
  - R18 every filled value, packet item and chronology event names the record source it was read from; an undetermined fact is stated as undetermined, nev
  - R19 drafts, approvals, sendings, packets, exports and proposals are append-only, keyed to the action and declared to purge; every read answers an acti
- `refusals.test.mjs`:
  - R1 R6 R7 R8 R11 R13 R14 R21 R23 R28 R31 R32 each refusal of this module carries its code, its C-115 row and translation; one actions answered passes t
  - R1 R3 R8 R15 R21 with a layer-9 provider absent, filings refuses or states the fact undetermined, never passes it (K248)
  - R1 R8 R13 R14 every missing action is answered through actions
- `sight.test.mjs`:
  - R11 a counsel packet is read only by a member who may see the action and the project of every determination and consequence it draws on: NO_SUCH_PACKE
  - R13 filingsFor leaves out every draft and packet drawing on a determination or consequence in a project the viewer may not see, naming nothing of it (
  - R6 R7 R19 a draft drawing on a determination in a project the viewer may not see answers as absent to approval and to recording it sent
  - R27 R3 R9 R21 a finding conformance withholds from the reader is withheld whole: the draft
- `templates.test.mjs`:
  - R28 R3 a filing takes at most one of template and text: the profile
  - R28 the template
  - R28 naming neither, with no profile file template for the kind: TEMPLATE_NOT_NAMED listing at most 20 offered file templates for the kind (never a bri
  - R29 every draft records template {id, version, sha, origin}, or null for the member
  - R29 filingsFor shows each draft
  - R31 counselPacket takes a brief template at every tier: its text filled from the record (each blank naming its source, [UNFILLED] where none) is the s
  - R32 templateSave hands an approved draft
  - R32 the group
- `wording.test.mjs`:
  - R7 R16 (DEC-149) MACHINE_CANNOT_FILE
  - R20 R9 R3 (DEC-149) with no jurisdiction profile active the answer says your group

### escalation

- `codes-ops.test.mjs`:
  - R24 every act that takes a reason (R1
  - R25 escalationOps(escalation, url, body) holds exactly the thirteen arms, each a function of no arguments answering what its service answers: the nine
  - R25 over the module itself: each arm answers exactly what the named service answers on the same record
- `decline.test.mjs`:
  - R1 the author
  - R9 escalationAttach requires the attacher
  - R1 R9 a store written before the reasons is migrated forward: escalations and escalation_attachments gain their reason columns, an earlier row reads n
  - R27 declineToEscalate is refused exactly as R1 refuses an opening, in R1
  - R28 escalationStatus answers neither, then declined, then escalated after a later opening, then declined after that escalation ends and a later declin
  - R27 R17 MACHINE_CANNOT_DECLINE_TO_ESCALATE is its own row, C-116.46, minted in declineToEscalate, with its own translation; C-116.26
- `draft.test.mjs`:
  - R29 the draft states, part by part and each part naming the record id it was assembled from, the determination and each noncompliant standard it pursu
  - R29 what could not be read is stated undetermined, never filled: the actions or the consequences unreadable, a standard with no basis in the read, its
  - R29 an action resting on the determination that the viewer may not see is left out whole: no id, no clock, no count; a viewer who may see it is answer
  - R29 every date passed without a response is read at nowMs by actions R12
  - R29 R17 the draft is labelled machine work through record-grammar
  - R29 refusals, as R1 asks them and answered exactly as R1 answers them: NO_SUCH_DETERMINATION (absent and unseen one answer), DETERMINATION_SUPERSEDED,
  - R29 R19 no answer of the draft carries a significance, severity, priority, urgency, rank or score, as a key or in its words, refused or answered
- `exit.test.mjs`:
  - R14 escalationEnd refuses MACHINE_CANNOT_END, NO_SUCH_ESCALATION, COMPLIANCE_NOT_RESTORED (naming the ids) unless every pursued standard has a live co
  - R15 escalationSuspend (a member, with a reason) stops proposals being reported as due and the read says it is suspended and since when, its clocks run
  - R16 escalationsDue lists every open escalation with a proposed edge not advanced or declined since its trigger was met, with the edge, instant and age
  - R3 R14 a provider this host does not have is never read as met or empty: the read and every act that needs it answer PROVIDER_UNAVAILABLE naming it, a
  - R3 R14 consequences, merged (K250), is reached through consequencesModule on the same host when not given: with no consequence recorded the exit reads
  - R22 escalationsFor answers every escalation of a determination the viewer may see, oldest first, each with its id, state and stage; an absent or invis
- `invariants.test.mjs`:
  - R17 nothing a machine writes opens, declines to open, attaches to, evaluates, advances, declines, suspends or ends an escalation, nor promotes its doc
  - R18 every opening reason, decline to escalate, attachment reason, stage move, evaluation, decline, suspension and end is appended with who, when and w
  - R19 no input or answer carries a significance, severity, priority, urgency, rank or score; a stage act
  - R20 every read and act answers an escalation in a project the viewer may not see as absent; the tables are declared to purge; no place, office or law 
  - R20 the factory migrates its tables at construction (K267): after escalationOf(host) with no explicit migrate(), a whole-store purge and a bundle purg
  - R21 an escalation is a record object of its own type: an ESC- bundle of type escalation promoted through promotion, its states the catalogue
  - R17 R20 every refusal this module mints carries its code, its C-116 row and the member
  - R26 an attached action the viewer may not see is withheld whole from the read: it leaves actions, R6
  - R26 R7 R8 a withheld action meets no trigger for the viewer who may not see it, whatever the stage, and no act of theirs is taken on it; an evaluation
- `open.test.mjs`:
  - R1 refusals in order: MACHINE_CANNOT_OPEN, NO_SUCH_DETERMINATION (absent and invisible one answer, through conformance R19), DETERMINATION_SUPERSEDED 
  - R2 the read derives each edge
  - R3 exit answers R14
  - R4 stage 1 is entered by opening; its trigger to 2 is a live determination whose act
- `real.test.mjs`:
  - R1 R4 R14 over the real conformance: a live noncompliant determination opens at stage 1 pursuing its noncompliant standard, the actor
  - R9 over the real actions: a breach action resting on the determination attaches at stage 2; one not recorded for the breach does not; an absent one is
  - R5 R6 R7 over the real actions (K256): a sent entry on the attached breach action, recorded through actions.actionCorrespond, meets 2→3 at its date;
  - R1 over the real conformance: NO_SUCH_DETERMINATION (absent and unseen) and DETERMINATION_SUPERSEDED are conformance
  - R23 over the real actions (K600 (a)): a member
  - R29 over the real conformance, actions and consequences (their published shapes): the draft states the noncompliant standard with the basis the determ
  - R4 R29 R30 over the real conformance: the actor
  - R12 over the real actions and conformance: an oversight request to an office the profile marks not an oversight body is refused with no line held, and
- `stages.test.mjs`:
  - R5 stage 2
  - R6 stage 3
  - R7 stage 4: its act is a member
  - R8 stage 5: breach actions attached here with their filings or counsel packets (filings.filingsFor); what is available listed through filings.availabl
  - R9 escalationAttach refuses in order MACHINE_CANNOT_ATTACH, NO_SUCH_ESCALATION, NO_SUCH_ACTION (actions R43 noSuchAction), NOT_A_BREACH_ACTION, STAGE_
  - R23 escalationAttach refuses an action carrying a premise_override (actions R8) ACTION_PREMISE_OVERRIDDEN, after NO_SUCH_ACTION and before NOT_A_BREAC
  - R10 escalationEvaluate refuses in order MACHINE_CANNOT_EVALUATE, NO_SUCH_ESCALATION, NOT_IN_EVALUATION, READING_UNKNOWN, NO_SUCH_RESPONSE, RESPONSE_FO
  - R11 stage 6 is entered from 5 and has no act of its own; its trigger to 4 is a received entry on an attached action recorded after the latest evaluati
  - R12 stage 7, entered from 4 or 5: each attachment states one accountability purpose and at least one pursued standard; NOT_ACCOUNTABILITY, NOT_THE_BRE
  - R13 escalationAdvance refuses MACHINE_CANNOT_ADVANCE, NO_SUCH_ESCALATION, NOT_OPEN, ESCALATION_NO_REASON (R24), ILLEGAL_STAGE (with the legal ones), T
  - R13 compatibility (N462): an advance recorded before R7
- `structure.test.mjs`:
  - R4 the act
  - R12 an oversight or audit request lands on a line held on the attachment
  - R12 the line is judged on the attachment
  - R12 at stage 7 the read offers the offices holding an oversees or appoints line to the actor
  - R30 escalation registers once with events.registerEventSource at start; for an explicit set, its source answers each act on the escalations the viewer
  - R30 over the real events: escalation is registered in the timeline
  - R29 a T33 act (conformance R25) is worded from its event: its kind and its when as events holds it (a day, a span with precision and zone, on or befor
- `voice.test.mjs`:
  - R3 R14 DEC-149: PROVIDER_UNAVAILABLE
  - R17 R20 DEC-149: no translation in escalation

### action-plans

- `duty-starts.test.mjs`:
  - R14 R38: a phase may start on a duty occurrence
  - R14 R38: PHASE_MALFORMED
  - R38: an overdue response activates the next step: derived when read, never stored, and answered as a question with its derivation
  - R38: the occurrence
  - R38: occurrence absent names the next one triggered after the phase
  - R38 R17: a duty-started phase
  - R38 R23: a duty occurrence is the body
  - R38 R35: an obligation the viewer may not see is withheld whole from the read, and the plan says out_of_view
  - R38: without the duties provider, a read that needs it answers PLAN_PROVIDER_UNAVAILABLE, never in part
- `invariants.test.mjs`:
  - R27: no act rewrites a row of history; the log only grows; every table is declared to purge and a purge empties it
  - R28: a fact not supplied answers undetermined, never a default; no place is named in outward text; the test profile only
  - R1 R6 R7 R9 R11 R13 R14 R16 R18 R20 R31 R34: actionPlansOps reaches each service with the stamped author, viewer, proposer and principal, never the bo
  - R6 R30: a provider this host has not been given answers PROVIDER_UNAVAILABLE, never a partial answer
  - R6 R30 (DEC-149): PLAN_PROVIDER_UNAVAILABLE
- `open.test.mjs`:
  - R1: each refusal in order, one per code, the valid call landing, and two faults answering the earlier
  - R2: a plan opens as a PLN- record, open, with its project, title, subjects in order, author and time; support answered
  - R3: one open plan per subject per project; another project may hold it; closing frees it; a different standard is another subject
  - R4: subjects added and removed with a reason; a removed subject
  - R5: a determination on a suspected subject
  - R22: every NO_SUCH_PLAN answers through noSuchPlan, one code and sentence; a visible plan never answers it
  - R25: a plan is never published: an outsider and a public reader are answered as for an id that names nothing
- `options.test.mjs`:
  - R9: each refusal in order; a legal option with no tier reads undetermined; a revision keeps the prior readable
  - R10: every addressee arm lands; a private individual, or an arm missing its parts, is refused
  - R11: a proposal is stored apart, labelled, never an option; a member adopts it once; a machine cannot adopt
  - R12: a lobbying option names in enforces a standard or a determined subject; the module never judges text
  - R13: several options disposed in one act, all or none; declined and blocked need a reason; history keeps each
  - R26: each refused key is refused OPTION_KEY_REFUSED; none is stored or answered; an option without them lands
- `preview.test.mjs`:
  - R37: a start that would land answers would_start with the action R18 composes (kind, addressee, clock entries with bases, legs with each matter
  - R37: the preview spends no id: a start after any number of previews takes the id it would have taken with none
  - R37: each refusal is R18
  - R37: a reminder action-clocks refuses at the start is the preview
  - R37: a plan or option the viewer may not see is answered exactly as R18 answers it
  - R37 (R35): a matter the viewer may not see is withheld whole from the preview
  - R37: op=optionstartpreview reaches the preview with the stamped author and viewer, never the body
- `read.test.mjs`:
  - R6: planRead answers every named part, with a started option
  - R7: plansFor lists visible plans in id order, at most 200 a page, truncated by reading one past; subject finds them
  - R8: liveness is derived on read: superseded names the successor, a closed inquiry reads closed, an option bound to dead subjects says so
  - R19: each check appears with its reason and changes nothing; a plan with none answers no checks
  - R19b: a scenario whose outward options have no branch for a hostile response is flagged; a not_met branch clears it
- `runs.test.mjs`:
  - R30: the plan-mode open check: absent and invisible alike, another project, closed, not joined; a suspected-only plan passes
  - R11 R31: a machine
  - R32: a machine proposal answers its disclosure, why, sources and work_kinds at the open; an adopted option keeps disclosure and origin; the action doe
  - R33: every act but optionPropose refuses a machine credential by its code; the same acts by a member land
  - R24: a machine proposes and nothing else: optionPropose by a machine lands; every other act refuses it
  - R34: the tray pages twelve proposals as five, five, two in submission order, no score; a foreign cursor and run refuse
- `scenarios.test.mjs`:
  - R14: a three-phase scenario with a checkpoint and both branches lands; refusals; replacing keeps history; at most three
  - R15: a phase starting on another subject
  - R16: on the checkpoint
  - R17: checkpointsDue lists a due, unjudged checkpoint once, oldest first, with days since due; judged and closed ones are absent
  - R23: a checkpoint missed or judged not_met is never a finding, condition or fact about the government; the reminder is present
- `sight.test.mjs`:
  - R35 (R6): a subject the viewer may not see leaves subjects, each option
  - R35 (R6): a started option whose action the viewer may not see has no action key; the history keeps the act without it
  - R35 (R8): a superseded determination whose successor the viewer may not see reads superseded with no successor key
  - R35 (Terms): a determination resting on a finding the viewer may not see is short, never measured over the visible findings alone
  - R35 (R7, R34): plansFor and the tray withhold an unseen subject too; asked by it, plansFor finds nothing
- `start.test.mjs`:
  - R18: a chosen option starts an action carrying its addressee, dated clock entries with bases, legs, plan, option and contact
  - R18: a breach action on an inquiry-only subject is refused by actions R8, unless the member states an override, which the action discloses
  - R29: choosing a dated option holds the member
  - R20: a member closes a plan with a reason; it stays readable; its subjects join a new plan; nothing closes it by itself
  - R21: an owner sets work_kinds; planRead shows them; an unknown kind, a machine or a non-owner is refused; they gate nothing
- `words.test.mjs`:
  - R36: the words scan finds a sentence calling a matter a subject, and leaves codes, keys and other modules
  - R36: every translation of this module
  - R36: every refusal this module mints, each detail

### conformance

- `act-event.test.mjs`:
  - R25 R1: ACT_NO_EVENT (C-113.29) for an act that names no event, first among the act
  - R25: NO_SUCH_EVENT for an event absent or one the viewer may not see, one answer, events
  - R25: ACTOR_NOT_AN_OFFICE (C-113.30) for an entity_id that is not an office entity (a person, an organisation, an absent id); an office entity is the a
  - R25: an absent entity_id is filled from the office entity seeded for that role and body (the bridge); with none held the actor stands as {role, body, 
  - R25 R9: determinationRead answers the act
  - R25 R24: a participant the viewer may not see is withheld whole, and an event the viewer may not see leaves event null; the read states out_of_view: t
  - R25 R3: the act
  - R26: an ACT- id recorded before T33 and not aliased reads as recorded with act_unaliased: true, its description, actor and date; a new determination n
  - R26 R7 R11: once a member aliases an ACT- id to an event, it answers that event and is the same act: read, listed and superseded as one; a determinati
  - R25 R26 R16: a store made before T33 gains the act
- `contradiction-cause.test.mjs`:
  - R1 R22: R22
  - R22: CAUSE_UNSTATED for a statement blank, not text, absent or over 2,000 characters; at the bound it is accepted
  - R22: CAUSE_NOT_EVIDENCED for no evidence, a blank id, content the record does not hold, or content the author may not see; a hypothesized cause never 
  - R22: a determination carrying recommendation or policy, at any depth and in any case, is RECOMMENDATION_IS_AN_ACTION, and writes nothing
  - R9 R22 R24: determinationRead answers the cause with its evidence, or cause null with \
  - R9 R4: outcomes_differ is true, with its statement and no duty, when the per-standard outcomes are not all the same; false when they are
  - R12 R24: a comparison may name the contradiction inquiry it came from; the proposal records the link and still carries no outcome; an absent, invisibl
  - R21: comparisonFacts answers requires from the side the member names and did from the other, each with its source, content id and date, labelled the r
  - R21: standardSide is named by the member and never defaulted; R12
  - R21: once the question is concluded, the facts carry its resolution, and still no outcome
  - R21 (N362): each side
- `dec149.test.mjs`:
  - R21 DEC-149: STANDARD_SIDE_UNNAMED (C-113.28) says your group
  - R12 R19 R20 R21 R22 R25 R26 DEC-149: no refusal row or member-facing sentence of this module names the group
- `determine.test.mjs`:
  - R1 R13: a machine or empty author is refused first; a member who has joined determines (negative control)
  - R1 R25: refusals in R1
  - R1: NO_SUCH_PROJECT for an absent id, a bundle that is not a project and a project not seen, one answer; membership
  - R1: DETERMINATION_NOT_A_PARTICIPANT (K380
  - R1 R25: ACT_INCOMPLETE names the missing or unreadable part: actor role and body, evidence, content not held; the act takes no description or date of 
  - R1 R2 R14: a determination rests on findings this project published in a ratified case edition, and pins that edition and version
  - R1 R3 R14: each standard is one the record holds, read through standards.inForceAt at the act event
  - R1: ROWS_INCOMPLETE for a standard with no row or a row missing what it requires, what was done or its reading; OUTCOME_UNKNOWN for a missing or unkno
  - R4: the outcome is given per standard and never composed; a disagreement with the rows is accepted and stated beside it, never corrected
  - R5: a compliant determination carries exactly a noncompliant one
  - R6: an unclear outcome names at least one question, each an inquiry the author may see or a new one opened in the same act, in the project
  - R6 R9: a question
  - R6: the determination and every inquiry it opens land together or not at all; a refused determination rolls back the inquiry and spends no id
  - R7 R19 R20 R25: a determination is never edited; the same act is the same event; supersedes names an earlier determination of the same act in the same
  - R8: no input carries a significance, severity, priority, urgency, rank or score, at any depth and in any case; no answer carries one
  - R1 R18: a determination carries at most the bounded number of findings, standards, rows, questions and evidence ids
  - R13: nothing a machine writes is a determination or an outcome: the act refuses a machine, and a raw promotion or a revision of a determination is ref
  - R23: a supersession with no reason is CONFORMANCE_NO_REASON (C-113.22), one over 500 characters or not text CONFORMANCE_BAD_REASON (C-113.17), each ro
- `helpers.test.mjs`:
  - R19: noSuchDetermination answers {ok:false, reason, code, check, translation, determination, detail}: the id as asked (null when none), one fixed sent
  - R19: extra adds a caller
  - R19 R9 R15: determinationRead and R7
  - R20: determinationSuperseded answers {ok:false, reason, code, check, translation, determination, superseded_by, detail}: its own row naming this funct
  - R20: extra adds a caller
  - R20 R7: a second supersession of a determination answers through determinationSuperseded, naming the first and its successor, and writes nothing
- `reads.test.mjs`:
  - R9 R19 R25: determinationRead answers R1
  - R9 R11 R24: a finding or standard the viewer may not see is withheld whole, with its outcome, rows and disagreement, and the read and each R11 item st
  - R11 R24: determinationsFor states out_of_view on the item that withheld something, never on the page
  - R6 R9 R24: a question whose inquiry the viewer may not see keeps its question and opened, and loses its inquiry key; the read states out_of_view: true
  - R10 R24: a pinned finding hidden from the viewer and reopened: its cause is withheld with it, the read holds no trace of it and states out_of_view: tr
  - R10 R24: a standard superseded by one the viewer may not see keeps its cause without the detail naming it; a passage cause the viewer may not see is w
  - R10: flagged basis_changed, naming each cause (a finding reopened, superseded or published in a later edition; a standard superseded; a newer capture 
  - R10: reevaluation
  - R11 R15: determinationsFor lists at most 200 a page in id order (a lower limit honoured, a higher not), truncated by reading one past, with its filter
  - R15: every read answers a determination in a project the viewer may not see as an absent one; a hidden project
  - R1 R9 R11 R12 R18 R21: the ops route to the services, and the author, proposer and viewer are the control plane
  - R12 R24: comparisonRead withholds whole a standard the viewer may not see, with its rows, and an evidence id or question inquiry the same, stating out
- `record.test.mjs`:
  - R12: a comparison a machine prepared or a member suggested is stored apart, labelled with who made it and whether it is machine work, and answered wit
  - R12 R18: a proposal naming an outcome anywhere is refused PROPOSAL_CANNOT_DETERMINE; one carrying a significance is refused; the project is seen first
  - R8 R12: no comparison answer carries a significance, severity, priority, urgency, rank or score, nor an outcome
  - R12 R18: a determination may name the proposal it drew on, and the proposal records that; a proposal absent or of another project is refused
  - R16: determinations, supersessions, flags and proposals are append-only (no act changes a row it wrote), and each table is declared to record-core
  - R16: no place is named in this module
  - R17: a determination is a record object of its own type, promoted through promotion, with history, audit and export like a finding; a correction is a 
- `t35.test.mjs`:
  - R27: each standard
  - R27: noncompliant against a standard that does not bind the body is STANDARD_NOT_BINDING (C-113.32), naming the standard and the body; an undetermined
  - R27: a row or question of a benchmark that calls the act violated, a violation or nonconforming (whole words, any case) is BENCHMARK_CALLED_NONCONFORM
  - R27: a diverges reading against a benchmark is answered \
  - R27 R12: a comparison holds each standard
  - R28: a comparison may compare the act of an office or an organisation of any sector, named by entity_id; a person is ACTOR_IS_A_PERSON (C-113.34), any
  - R28 R25: a comparison takes the act as determine does: ACT_NO_EVENT for none, NO_SUCH_EVENT for an event absent; the people who took part are the even
  - R29: a row may state what was done as a measure {calc, result_key}; it is answered with the calculation
  - R29: a calculation absent or one the viewer may not see is answered as calculations answers it (NO_SUCH_CALCULATION), the same for both, with no row o
  - R29: the measure is held beside the rule and never as it: no standard
- `t36.test.mjs`:
  - R27 R3: a determination noncompliant against a standard with no stated end, on an act within a member
  - R27: noncompliant on an act the day after the recorded through date is STANDARD_NOT_BINDING (C-113.32), bindingness undetermined, its detail saying no
  - R27: once the member
  - R3 R27: a compliant determination on the act the day after the through date is accepted, the standard
- `t37.test.mjs`:
  - R28 R23: every row of the table names in its where the function that holds its region, and the region inside it: C-113.34 and C-113.35 name #comparedA

### consequences

- `addressed.test.mjs`:
  - R9: addressedRecord
  - R9: overall addressed across every mix of states; the latest record per part wins
  - R9 R5 (N257, K172, K283): a group
  - R9: addressedRecord is accepted on a superseded determination
- `assessed.test.mjs`:
  - R3: a member
  - R5 R12: with no inquiry, or one not concluded, the causation is unproven, stated, and the part lands
  - R5 R12: a concluded inquiry establishes the causation, naming it, with its strength pair per axis
  - R5 R12 (N257): a part whose measure is zero answers causation not_applicable, whatever inquiry is named
  - R6: a part is never edited; a revision records a successor with R1
- `computed.test.mjs`:
  - R2: a figure is read by calc-grammar
  - R2: the value is calc-grammar
  - R2: operands of different currencies or units are refused as calc-grammar refuses them (UNIT_MISMATCH)
  - R2: a money fact is an operand, its amount as held and its own grade; a total money refuses is refused by its code
  - R2: a calculation
  - R2 (N576): a calculation operand
  - R15 (N576): a calculation operand leaves the operands exactly when calcStatusOf answers it not visible to the viewer
  - R2: each operand carries its grade; the part
  - R2: a machine
  - R4: a part with no measure, or whose computation lacks an operand, is undetermined with why, never zero
  - R4: a passage held in a form this module does not read leaves the computation undetermined, never the author
  - R11: no answer composes states into one figure or carries a significance, severity, priority or score
- `person.test.mjs`:
  - R16: a viewer who may see the passage
  - R16 (DEC-78): a person the record holds as a protected source is withheld from every viewer the link does not admit
  - R16 (N600): no link held leaves the capture
  - R16 (N600): a person withheld for a link is answered exactly as for a capture the viewer may not see; several links admit only those every one admits
  - R15: a money fact the viewer may not see leaves the operands; the computed value and grade stand
- `reads.test.mjs`:
  - R7: every live part, totals only within one state, unit and currency, labelled with the parts they count
  - R7: totals are calc-grammar
  - R8: a newer capture that does not carry an operand
  - R8: a causation inquiry reopened or superseded flags the part basis_changed, naming why; its causation stands as recorded
  - R15: a computed part
  - R15: an undetermined computation keeps its why without a withheld operand
  - R15: an established causation whose inquiry pat may not see is {state} alone; reopened, it raises pat no cause
  - R15: an assessed part
  - R15 R8: a newer capture of a withheld operand
  - R13 R14: a part
- `record.test.mjs`:
  - R1: a valid part lands; each refusal holds in the requirement
  - R1 R3 (K171 (9)): a machine
  - R10: people are a class or an office, or a person a document in the record names; a kind is one of the list
  - R13: parts, revisions and addressed records are append-only, declared to purge, and unseen parts read as absent
  - R14: a part is a CONS- record object promoted through promotion, with history, audit and export

### monitoring

- `cadence.test.mjs`:
  - R14 which frequency governs: an authored word the catalogue knows; an unknown authored word is undetermined; else the contract read; else undetermined
  - R14 the tick answers the same rule the plan schedules by
  - R15 the subject is an address: versions group by address, the current version
  - R16 the plan: never checked is due; nothing authored and nothing read is due (unread); no interval is unscheduled with its reason; else due or next; l
  - R52 addressFrequencySet refuses, in order, each with its row and nothing written: a machine author; an address no visible subject is at (absent and in
  - R52 a canned and a custom setting are each recorded with the reason (key and sentence, or the words), who and when; a later one replaces it, null retu
  - R52 through the route: the body
  - R17 an address
  - R18 a document whose substance has not moved across repeated checks earns a longer interval: one step up daily, weekly, monthly per 10 unchanged check
  - R18 an authored frequency and an address
  - R15 (K1484 C2 row 11) an address may be a public register
- `docket.test.mjs`:
  - R67 a watch is due when never read, or when its last read plus 24 hours is at or before now; the tick reads watchedImports to its end and reads due wa
  - R67 a read is a GET of the watch
  - R67 otherwise the read is unreadable with its reason (http_<status>, not_json, not_a_docket, too_large, fetch_failed), recorded with no answer
  - R67 a governed refusal records nothing, counts as governed and leaves the watch due; it is never unreadable (R39)
  - R67 a recordDocketRead that refuses or throws is failed with its reason, and the epoch stays open (R21): the retry skips the claimed watch until the e
  - R67 each tick reads due watches after its batch
  - R68 cadenceDue answers due while a watch is due; cadenceWake is now + 1 s while one is due, and otherwise takes the earliest instant a watch next fall
  - R68 given the rank, a watch is offered as {kind: docket, id: its import, waitingSince: last_read.at + 24 h, or null when never read}, and the due watc
  - R30 while paused no docket is read and the tick says so; not due while paused, the pause looked at again one interval on while a watch is in force; re
  - R36 a docket read fetches only the watch
  - R2 (N538) the tick fetches as the Civicsmith agent, acquisition
  - R67 R68 (settled readings 2 and 5): a governed read spends one of the 50 as any read does; a 200 docket answer is read even when case-import records i
- `gathering.test.mjs`:
  - R42 C-18.5: every arm of checkGatheringGrammar finds its violation, and a well-formed queue finds none (the sweep arm, R66
  - R27 a non-replay promotion carrying a malformed gathering queue is refused GATHERING_REFUSED with its findings; a replay is exempt; a bundle without t
  - R42 C-18.5 runs in the audit through record-core
  - R69 the gathering id C-18.5 tests is the core record-grammar
- `invariants.test.mjs`:
  - R36 the daemon fetches only what store state authorizes: op=monitor takes a bundle id, never a caller
  - R37 detecting change is mechanical: a tick writes only monitor-tick
  - R38 an equality that costs nothing is not evidence: a shell
  - R39 a governed refusal is a fact about the instance: its look is marked governed and it never counts as the source failing
  - R40 bias never shapes what is monitored: no service takes a lens, and a lens passed changes no plan
  - R41 the tables are this module
  - R42 this module
  - R42 each check moved here holds as an invariant: C-18.5 (gathering.test), C-48.8 and C-48.9 answered with this module
  - R43 no place is named in this module
- `look.test.mjs`:
  - R11 one observation row per look, authority sweep naming the bundle, level document, subject the address; each outcome
  - R12 a changed look names a capture only when the register holds it under this bundle and it is the digest seen; it then records the version once
  - R12 (N164
  - R13 what a tick read the address as is kept per normalised address; undetermined never erases; an unknown contract word is undetermined with the word
- `queue-reads.test.mjs`:
  - R47 archiveEligible(now): of at most 50 addresses at the floor, oldest failing run first, those capture answers fallback_eligible, each {address, firs
  - R47 a 51st address at the floor gives truncated; the 50 read are the oldest failing runs
  - R47 a paused daemon still lists its eligible addresses, with paused set (R30)
  - R47 never throws: a read that fails answers ok false in words, with limit, truncated and paused
  - R48 flagged({viewer, limit}): the monitored documents whose last tick flagged them, each {bundleId, source_status, since}, in id order; unflagged and 
  - R48 at most limit (1–200, default 200), truncated when more follow
  - R48 reads past more than one page of monitored documents to find its flagged ones (K391
  - R48 a hidden flagged document is neither listed nor counted (K391)
  - R48 a restyled tick is not flagged (R8: a change assess settles raises no flag)
  - R48 never throws: a read that fails answers ok false in words
- `reads.test.mjs`:
  - R26 driveShells: pages Google-addressed bundles through sight; classifies each harvestable Drive baseline; unreadable and not-documents counted; shell
  - R32 monitoring({viewer}): every monitored address the viewer may see, with its plan row, the unscheduled among them
  - R32 monitoring({viewer}): a row names no bundle the viewer cannot see — versions, newer_unmonitored and a disagreement withhold a hidden project
- `relay.test.mjs`:
  - R49 a store refusal (ok false below 500) behind the monitor relay is answered with the store
  - R49 a 500 with no answer is 502 STORE_DID_NOT_ANSWER with no stack; a STORE_INTERNAL_ERROR
  - R49 an answer is still relayed at its status, and an answered reply of the wrong shape stays a silence
- `seam.test.mjs`:
  - R65 sweepHost() answers the same frozen set of services on every call, writing nothing and never throwing
  - R65 paused() is R30
  - R65 openEpoch, claim and closeEpoch are R21
  - R65 running is R22
  - R65 ranked(list, item, rank, now) is R19
  - R65 land(request, filed, at, say) is R28
  - R65 gate(viewer) is membership
  - R66 registerSweep takes one share, once: a module
  - R66 with nothing registered, C-18.5 reads no sweep arm: no sweeps[] entry draws a finding of R27
  - R66 with a share registered, R27
  - R66 a registered grammar that throws, or answers no list, fails closed: the gathering is refused as by a finding of C-18.5, at the write and in the au
  - R66 the registered fence is asked last, after the grammar admits the file, and its refusal is the promotion
  - R66 dueForSlate(now, sees) answers the due sweeps R30
  - N506
- `tick.test.mjs`:
  - R1 refusals, in order, each writing nothing; a store silence is named, never ABSENT
  - R1 from the Worker, the stamps are composed from what the door decided, never read from the request: a session
  - R2 the tick fetches the Drive export or the locator, through the host governor; a governed refusal writes a governed look and nothing else
  - R3 the baseline: the Drive export row, else the locator
  - R3 the tick
  - R4 removed, unreachable, and the Drive shell refusals (C-48.8, C-48.9), each shell writing an unreachable look and leaving the document untouched
  - R5 comparison: rendered frame, no baseline, evidentiary only when both sides earned it, else raw; 
  - R6 assess over the baseline
  - R7 a shell captured as the document grades no change: the status withdrawn, the look indeterminate; removed is not affected
  - R8 one mechanical promotion changing only the permitted fields, with a Session Log entry; every other file carried unchanged; the flag rule
  - R8 a change assess settles as routine or restyled raises no flag
  - R9 a non-rendered modified tick captures what it fetched, files it with a register row, and says why whenever it cannot
  - R10 the answer
- `ticks.test.mjs`:
  - R19 the cadence tick: due while a subject is due; wake now + 1 s, else next, else null; at most 50 by R1–R10; its answer
  - R19 (N224) given the scheduler
  - R20 the archive tick: due every firing; wake now + interval while a failing run reaches the floor; fires eligible addresses oldest first through acqui
  - R20 (N224) given the rank, the archive tick reads at most ten times its batch oldest failing run first, offers each as {kind: address, id, waitingSinc
  - R21 a retry never fires a subject twice; an open epoch is reused while fresh and replaced after; a tick closes its epoch only when nothing failed and 
  - R22 a tick is not re-entrant: one called while the same tick runs answers busy and does nothing
  - R23 the ticks call R1–R10 and capture.acquire in process and spend no credential
  - R24 with the ticks in process (R23) no binding or credential is tested: configured() is true on every instance and a fire spends nothing
  - R45 monitoring runs on every instance where a document asks, no binding or credential a condition of it; an administrator
  - R30 an administrator pauses the daemon: monitoring
  - R30 (N314, N324) a pause or resume asked by a member who is not an administrator is refused NOT_AN_ADMIN through membership.notAnAdmin (its R84, row C
  - R30 R66 the due slate: every monitored address due, open named request and due sweep (the registered share
  - R25 each tick
  - R46 counts() answers the rows held in R41
  - R51 R46
- `understanding.test.mjs`:
  - R28 each open named request whose cadence is due is captured through capture.acquire from its locators in order, the publisher first, through the capt
  - R28 a request not open, one whose cadence is none, and a request not due capture nothing; bytes the record already holds land nothing new and are reco
  - R28 (K1102) the bundle
  - R28 the cadence tick runs due requests after its batch
  - R31 the reads answer what queue-producers publishes: flagged (R48) names each flagged tick
  - R33 (N170) the sources a live objective rests on are known to monitoring through intent
  - R33 (N230) the sources a published finding rests on are known to monitoring through publication
  - R34 a pending clock entry whose date has passed is marked overdue by a mechanical deadline-recheck promotion changing only clock[].status and last_upd
  - R34 the overdue mark R44 writes is what action-clocks.overdueClocks reads for queue-producers
  - R44 the mark reads action-clocks.pendingClocks and moves an entry only from pending to overdue; met, waived and overdue entries are left; nothing is a
  - R35 when a clock is marked overdue or a response is recorded against an action, monitoring asks escalation (as its own viewer) whether a stage
  - R50 deadlineRecheckWake(now) answers the start of the local day (the jurisdiction
  - R50 the wake follows pendingClocks
  - R50 deadlineRecheckDue(now) answers the wake
  - R50 (N429) an entry of an action whose last R34 mark failed is left out of the wake
  - R34 R50 (K1444 (iii)) an entry
  - R34 R50 with no zone held for the actions
- `voice.test.mjs`:
  - R4 R42 DEC-149: C-48.8
  - R1 DEC-149: a Drive address of an unrecognised shape is refused with a detail whose own sentence says your group
  - R8 DEC-149: the Session Log line of a Drive tick names the export it fetched and what it was composed from, with no name for the group
  - R16 R32 DEC-149: an address checked per meeting is unscheduled with the reason that its meeting schedule is not one your group
  - R28 R65 DEC-149: a landing that could not complete says so with no name for the group
  - R42 DEC-149: no translation in this module

### following

- `body.test.mjs`:
  - R1 followBody refuses, in order and writing nothing, a machine author, a body absent or unseen, a body with no Legistar identifier, and a bad period; 
  - R1 only a body and period a member follows is read: no follow, no read; the period bounds every Legistar query
  - R2 a followed body
  - R3 a matter whose enactment record differs from its last capture is captured as a new version of its Legistar address; no notice is raised here and no
  - R18 no place is named in the module
- `checks.test.mjs`:
  - R1 ${row.check} ${code}: the refusal carries its code, its row and the member
  - R1 C-137.1–C-137.20: following
  - R18 (DEC-149): no row
  - R4 the per-meeting link
- `meetings.test.mjs`:
  - R4 a per_meeting watch naming its body is captured at each meeting
  - R4 the link is a member
  - R5 a watch with no body, a body with no recurrence and no observed meeting in 24 months, or a notice period the profile does not hold with a primary s
  - R6 each per_meeting capture states the alarm
- `policy.test.mjs`:
  - R20 every held policy whose text is from a capture of a public https address is watched with no member act, author none, due 7 days from its last read
  - R20 the tick reads a watch every 7 days as a capture through acquire attributed to it: the same bytes land nothing new, different bytes are kept as a 
  - R20 an address that does not answer is recorded failed with its reason and stays watched, read again 7 days on; one behind an account or a fee is neve
  - R20 a watch ends when its policy is superseded, its listeners told; each capture takes the sight of the policy it watches
  - R21 policyChanges answers one entry per kept capture differing from the one before, in order, paged by cursor, with amendment_held; a change in a poli
  - R21 with since (an instant), only changes whose later capture
- `portal.test.mjs`:
  - R10 followPortal follows a dataset keyed to its normalised query with a declared key; each tick captures the answer as a snapshot, a vintage valid at 
  - R11 snapshotDiff answers added and removed rows by key and each changed field {key, field, before, after}; a key missing or repeated is undetermined w
- `registers.test.mjs`:
  - R7 followRegister records a member switching a watch on; refusals as R1
  - R8 a register behind an account, or fee-bearing, is never read on the tick (member_act_required, nothing fetched); refreshRegister is its member
  - R9 followPersonQuery follows one register
  - R15 nothing a member
- `tick.test.mjs`:
  - R12 due while any follow or per_meeting capture is due; wake is the earliest instant one falls due, or null; a follow is due daily from its last read 
  - R13 a tick reads at most 50 due subjects, oldest due first or in the rank
  - R14 follows answers every follow the viewer may see with its subject, author, period, cadence, last read, next due and unscheduled reason, so a follow
  - R16 following is mechanical: a tick captures and records, lands at collected and never verified, and states no meaning of a change
  - R17 its tables are declared with their classes; a person query
  - R19 onFollowed: one registration per module; after a follow is recorded, ended, or its next due instant changes, fn({follow, due}) is called once afte
