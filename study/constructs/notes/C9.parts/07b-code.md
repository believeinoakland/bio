@@FILE sources_code.md.txt (chunk 151-297; with 1-150 the file is complete)
@@TIME
- [BUILT] code §1.5, line 152 — "`COUNTED_FROM` (`dates.mjs:7`); `deadlineDate` counts calendar or business days with holidays." — the only built business-day/holiday date arithmetic, inside `filings/dates.mjs` (49 lines, layer 9).
- [BUILT] code §1.6, line 169-170 — `escalationRead` :408 "with the derived triggers and proposals (`#triggers` :208)"; `escalationsDue` :864 "the open proposed edges, oldest first, at most 500".
- [BUILT] code §1.6, line 168 — `escalationSuspend` :815, `escalationResume` :841.
- [BUILT] code §5, line 226 — "`deadlineRecheck` (:1962-1996) marks passed `pending` clock entries `overdue` with one mechanical `deadline-recheck` promotion per action (actions `pendingClocks`, then promote at :2029). It then calls `escalationsDue`."
- [BUILT] code §5, line 227 — "`actionCommitted` (:2046) is registered with `promotion.onCommitted` (:2086). After every action commit it asks `escalation.escalationsDue` and keeps the answer in memory (`#escalated`, `escalationsSeen()` :2054)."
- [GAP] code §5, line 228 — "**nothing calls `deadlineRecheck`.** The scheduler has no "deadline-recheck" consumer (`scheduler/index.mjs:41-160`: selection-sweep, task-drain, archive-monitor, connection-derive, overdue-scan (progressions), queue-renotify, monitor-cadence, ai-run-reap, and others). No op routes it; only `test/m/monitoring/understanding.test.mjs:97-184` calls it." (Note: scheduler's `overdue-scan` serves progressions.)
- [GAP] code §5, line 229 — "`escalationsSeen()` is exposed by no op and feeds no queue item."
- [BUILT] code §5, line 230 — "overdue and triggers are also derived on read (`actionOverdue`, `actionFacts`, escalation `#triggers`), so `op=escalationsdue` and `op=escalation` answer correctly when asked. Nothing is pushed."
- [GAP] code §4, line 221 — "**Queue** (`queue/index.mjs`): no producer for overdue action clocks, due escalations, filings awaiting approval, or anything else in layer 9." Queue kinds cover governor, capture, stance, version, conclusion, export, notice, objective-gap, source-modified or removed, archive, monitoring-recheck, render-deferred, bias-debt.
- [BUILT] code §7, line 248 — deadlines: oakland-alameda "1: records_response, 10 calendar days + 14 extension, § 7922.535, UNMEASURED"; test-port-ellery "2 (business-day and calendar)".
- [GAP] code §7, line 250 — holidays: oakland-alameda "**absent**"; test-port-ellery "2026 and 2027".
- [BUILT] code §9, line 286 — "`request_for_comment` must name the specific inquiries it disclosed and a response window (DEC-13, `checks/bio-checks.mjs:3897-3911`)."
- [GAP] code §8, line 271 — escalation: "Advancing is manual. Nothing notifies: no queue producer, and the deadline recheck is unscheduled."
@@ORGANISATIONS
- [BUILT] code §7, line 240 — profile sections allowed: records_laws, standard_sources, counterparties (the offices), action_kinds, deadlines, legal_organisations, holidays. "There is no separate `offices` or `venues` section."
- [BUILT] code §7, line 246 — counterparties: oakland-alameda "5: Controller, City Council, Civil Grand Jury, City Auditor, State Controller; all UNMEASURED"; test profile 4.
- [BUILT] code §7, line 249 — legal_organisations: "2: HJTA (assessment_challenge, taxpayer_action), First Amendment Coalition (constitutional_claim)"; test 1.
- [BUILT] code §9, lines 290-293 — "**Actor role or group type: none on our side.** Roles in the code are the **government counterparty's office** (`counterparty.role`, `body`, `level`; profile `counterparties` with `elected` and `oversight`), and the act's actor (role and body) in conformance. The only group notion is `producing_group`, a setting that fills the filing `{{group}}` blank. There is no group type, member role or organisation type anywhere in the six modules; a grep for group_type and actor_role finds nothing."
- [GAP] code §3, line 207 — UI intake writes counterparty `{state: named, name}` (`app.html:3369-3371`, :19983); actions' check requires role and body and refuses it (`COUNTERPARTY_REFUSED`) — "Probable break (by reading, not run)".
- [BUILT] code §2, lines 191, 193 — every act needs `contribute` (`control-plane/ops.mjs:1476-1515`); author stamp on promote incl. `actorViewer` (`control-plane/index.mjs:2849-2867`).
- [BUILT] code §1.6, line 164 — stage-7 act needs one `ACCOUNTABILITY_PURPOSES` purpose (official_request, oversight_request, audit_request, testimony, enforcing_legislation; line 177).
@@LAW
- [BUILT] code §7, line 244 — records_laws: oakland-alameda "1: CPRA, Gov. Code § 7920.000 (D-149)"; test profile 3 (state, city, federal).
- [BUILT] code §7, line 245 — standard_sources: oakland-alameda "3: OMC (M-24), Ordinances and Resolutions (M-24), Cal. Gov. Code (UNMEASURED)"; test 2.
- [BUILT] code §7, lines 252-258 — Oakland's 13 action kinds: records_request t1 (NextRequest venue); grand_jury, controller_referral, media t1; public_comment, litigation_support, request_for_comment, other no tier; records_petition t2 (court venue, advisory); assessment_challenge, taxpayer_action, consent_decree_motion, constitutional_claim t3 (`oakland-alameda.mjs:197-218`).
- [GAP] code §7, line 259 — "**no Oakland action kind has a `template`.** On the real instance, `filingPrepare` answers `KIND_NO_TEMPLATE` for every kind ... Only Tier 3 counsel packets are producible."
- [BUILT] code §7, line 260 — profile active only if installer bound `JURISDICTION_PROFILES`; "With none bound, the kinds are only records_request, request_for_comment and other, and everything profile-derived is undetermined."
- [BUILT] code §8, line 266 — declare standard: routed, no UI; "Needs content ids of the text (`contentmint`)."
- [BUILT] code §8, line 267 — determine: routed, no UI; "Needs a finding **published in a ratified case edition of the project**... rests on the case-authoring and ratification path."
- [BUILT] code §9, lines 284, 287 — "`breach` is optional; only `breach: true` needs a determination (`actions/index.mjs:588-590`)"; legs `rests_on`/`advances` onto any bundle except another action.
- [GAP] code §6, line 234 — "There is **no Legal/Policy Lookup skill, no filing skill and no counsel skill**."
- [BUILT] code §6, line 235 — in `agent-worker/src` "standard" means the evidence-strength standard (`subsession.mjs:189-270`), not a legal standard (name collision).
@@COURTS
- [BUILT] code §1.6, lines 158-179 — escalation 1,421 lines source; `escalationOpen` :537 (`NOT_NONCOMPLIANT`), `escalationAttach` :595 (stages 2, 5, 7; `NOT_A_BREACH_ACTION`), `escalationEvaluate` :662, `escalationAdvance` :737/`escalationDecline` :758, `escalationEnd` :777; `STAGES` 1–7, `STAGE_TABLE`, `READINGS` complied/partial/denied/none, `JUDGMENT_KEYS` refused; ten ops routed in `store.mjs:3046-3068`.
- [BUILT] code §1.5, line 153 — filings ops: `filingprepare`, `filingapprove`, `filingsent`, `counselpacket`, `counselpacketread`, `counselpacketexport`, `filingsfor`, `theorypropose`, `availableactions`.
- [BUILT] code §1.5, line 155 — "`filingPrepare` does **not** need a determination... So it works for any action with a template."
- [GAP] code §1.5, line 156 — test profile templates use `{{records}}` and `{{bylaw}}`, not in `FILING_BLANKS`, "so they always stay unfilled".
- [BUILT] code §7, line 256 — Oakland `records_petition` tier 2 "with a court venue and an advisory".
- [GAP] code §8, line 270 — prepare filing: "**Oakland has no templates**, so `KIND_NO_TEMPLATE`. Tier 3 packets work."
- [GAP] code §8, line 273 — breach action via promote "probably fixed, but it is unverified" (`gate-reads.test.mjs:998-1000` "reported, not pinned").
- [GAP] code §9, line 297 — stages 6 and 7 "generate no outputs".
@@ANALYSIS
- [BUILT] code §1.5, line 152 — `deadlineDate` (calendar or business days with holidays) — date arithmetic in code.
- [BUILT] code §1.6, line 170 — `escalationsDue` sorted oldest first (age of proposals).
- [GAP] code — no dataset, spreadsheet, aggregate or chart facility in layer 9 beyond consequences' five ops and quotes-by-counterparty; "none" further in this chunk.
@@QUESTIONS
- [GAP] code §6, line 234 — "**One skill pack only:** `SKILL_PACK_ID = "investigative-session"` (`skillpack.mjs:155`, doctrine in `skilldoctrine.mjs`)." No Legal/Policy Lookup, filing or counsel skill; mentions only in requirement prose (`standards/index.mjs:13`, `checks/bio-checks.mjs:666`, `build/requirements/standards.md:37,64`).
- [BUILT] code §6, line 236 — "**What an AI could reach:** machine credentials may call the proposal ops `standardpropose`, `comparisonpropose`, `actionlawspropose`, `actionriskpropose`, `theorypropose` and `filingprepare` (the preparer is labelled with `proposalLabel`). The capability for all of them is `contribute` (`control-plane/ops.mjs:1483-1515`). No skill or run template drives these ops."
- [GAP] code §8, line 279 — "no skill that prepares standards, comparisons, theories or filings."
@@DOCTRINE
- [BUILT] code §2, lines 185-196 — routing: all 45 layer-9 op names in control-plane `OPS`; "every act needs the `contribute` capability"; fail-closed sight check on all layer-9 ops (`control-plane/index.mjs:2115`); "**Verdict:** everything a member needs is routed. The one exception is creating an action, which goes through the generic `op=promote`."
- [GAP] code §3, lines 198-209 — UI `civicos-ui/app.html` 26,551 lines; action loop surfaces only (UI-19, UI-90, UI-104); "**no** UI for standards, conformance or determinations, consequences, filings or counsel packets, escalation, `actionkinds`, `actionquotes` or `actionriskpropose`"; intake writes no `breach` field.
- [GAP] code §4, line 220 — "there is no act entry for standard, determination, consequence part, filing or escalation objects."
- [GAP] code §8, lines 275-279 — chain breaks at four points: no UI for five of six modules; no templates on real profile; determination needs ratified published case edition; no proactive layer.
- [BUILT] code §9, line 296 — outward texts that exist: filing drafts, counsel packets, available-actions block (`TIER_WORDS`, `COUNSEL_SENTENCE`).
@@CROSS
- code line 152 vs line 228: business-day/holiday date arithmetic exists only in `filings/dates.mjs` (layer 9), while the scheduler's only overdue consumer (`overdue-scan`) serves progressions (layer 5): the TIME capability is split across two places with no shared service, and action clocks are never swept.
- code line 267: LAW application (determine) depends on publication+ratification (layer 8) — confirms layer-9 LAW is unusable during investigation, except via proposals.
- code line 235: "standard" collides — evidence-strength standard in agent-worker vs legal standard in layer 9; any LAW support for the assistant must disambiguate.
- code line 236: the AI can already technically reach LAW proposal ops (`standardpropose`, `comparisonpropose`, `actionlawspropose`, `theorypropose`) via machine credentials, but no skill drives them — the QUESTIONS→LAW bridge is an unwritten skill, not a missing op.
