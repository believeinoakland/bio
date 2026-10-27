# AI-DESIGN hand-offs to BOB

Entries `A<n>`, newest last; section 0 is rewritten whole after every entry (LANES.md §1). A1–A41 (AI-DESIGN #1 and #2) are in `build/plan/archive/lane-ai-design/HANDOFF-A1-A41.md`; a successor does not read the archive at takeover.

## 0 · The state now and the next steps

**Lane** · AI-DESIGN #3 (`session_018BhcedQQCRAKFMw8Mi8Xka`, Opus) handed over at 44% context on 2026-10-27 after A51. Branch `lane/ai-design` (T53 merged in at U500). BOB is the session on `build/plan/current.md`'s Status line on `tranche/T53` (BOB #322, `session_018Bhcedcx1arC3HPfsGQvzJ`, at hand-over). PLANNING #2 is `session_018Bhceg7ptZUBDjGtWWSVz4`. Scope: AI provider selection and the assistant designed whole (LANES.md §2).

**The design is complete and folded by PLANNING.** A43–A47 are merged into `tranche/T53`. Every draft is READY:
- New modules: `draft-ai-catalogue.md` (L2), `draft-ai-gate.md` (L6), `draft-ai-issuer.md` (L11, Civicsmith's own Worker).
- Adapted modules: `draft-ai-accounts.md` with `draft-ai-accounts-dec465.md`; `draft-credentials.md`; `draft-agent-model.md`; `draft-ai-use.md`; `draft-agent-runner.md` (the test container); `draft-agent-run-path.md` (agent-worker, agent-steps, agent-harness, ai-runs); `draft-run-record.md` (observation-log, ai-runs); `draft-run-rules.md`; `draft-signatures.md` (R49–R56); `draft-instance-setup.md` (R107–R109; R107 and R108 placed in installer R2 and installer-steps R45 by PLANNING).
- Screens and costs: `draft-assistant-screens.md` (§4 ops with owner, rung, class and reads; §7 names; §8 interface-shell R20; §9 retired); `draft-ai-costs.md`.
- Supporting: `NEXT-ENTRIES.md`; frame `DESIGN-BRIEF.md`; facts `INVENTORY.md`.

**BOB's decisions** · K5457 (every For BOB point of A43), K5471 (`NS_AI_RUN`; a member clears their own payer flag).

**Bob's answers** (in `DECISIONS.md`, AD1–AD49):
- Folded: AI1 K5475 (Gate 1 admits; the real-matters set is a standing check per AI), AI3–AI5 K5477–K5479, AI6 K5480 (re-test cap, switch, `retesting-off` queue item), AI7 K5481, K5459 (paying owners see per-member use).
- **Not yet folded:**
  - **AI8, K5482:** "A, but the shared results page shows all AI, even those not approved yet by the team. They stay active for 6 months and are statistically joined to present overall results." BOB's details: results not repeated by Civicsmith are shown as reported by teams, not confirmed; a result over six months old leaves the combined figures; sealed records are kept while active and, for a listed AI, while listed plus a year. AQ8 (a) holds: the sending team sees its own result at once.
  - **AI9, K5483:** A. Keep offering the last list; say it is old after two weeks.
  - **AI10, K5484:** "B", bring each of the five separately. Written as AI12–AI16 (`QUESTIONS-AI12-AI16.html`) and sent to BOB for the page; their lines stay drafts until answered.

**Also answered and folded by #3 after hand-over:** AI2 A (K5485; the screens draft's rows already follow it; AD50), AI11 B (K5486: a shared account may go on any project the member has joined; `draft-ai-accounts-dec465.md` R49 changed; AD51).

**Open with Bob** · AI12–AI16 (on the page).

**Next steps, in order**
1. Fold AI8 (K5482):
   - `draft-ai-catalogue.md`: library rows R43/R44 cover every tested AI, listed or not; a six-month activity window (named parameter); combined figures across teams' results; "reported by teams, not confirmed" until Civicsmith repeats.
   - `draft-ai-gate.md`: R63 `resultRow`, and the joining of results.
   - `draft-ai-issuer.md`: retention, sealed records kept while active, and for a listed AI while listed plus a year.
   - Also the screens' `airesults` note, and AD50 in `DECISIONS.md`.
2. Fold AI9 (K5483): the catalogue's staleness lines are already A (stale after `stale_after_days`); mark them decided; AD51.
3. As Bob answers AI2, AI11 and AI12–AI16, fold each answer: clear its "pending" marks and add an AD line.
4. Answer PLANNING's and BOB's questions; keep each file under its cap (`proc sizes`); hand over at 40%.

## A42 · 2026-10-27 · Bob's AI decisions as K-ruling lines (READY); the lane's files brought up to date
**For BOB:** `RULINGS-FOR-BOB.md` §2: six lines to number and record, each applying K1762 (3), none needing Bob; §3: N1220's refreshed text for `next.md`. `DECISIONS.md`: Bob's decisions AD1–AD42, verbatim, with the K that recorded each. **Finding:** K4421, K4443 and K4464 had already recorded AIR11–AIR45 and the answers of `REQUIREMENTS.md` §11–§17 (provisional, as K3735); what was missing is the reconciliation: K3347 was never named, AIR17 (a)/AIR19's privacy bar and AIR35's origin exclusion were varied by later words with no line saying so, K3735's and K3804's open AI questions were never closed, K3061's project and team subscription cases were left, and N1220 still reads "T51's focus". **Need:** nothing from Bob; BOB to record the lines. Next: the design itself (section 0, steps 1–6).

## A43 · 2026-10-27 · The assistant designed whole: every module draft READY for PLANNING; Bob's ten questions
**For BOB:** the drafts listed in section 0, each in the house format with KEEP/AMEND/RETIRE/NEW per existing id and Tests with negative controls, names reconciled across them (`draft-assistant-screens.md` §7). Two new modules (`ai-catalogue` L2, `ai-gate` L6), one new Civicsmith service (`ai-issuer` L11), `agent-runner` repurposed, the remote Claude Code gate (`agent-worker` R110) retired in favour of "AI path ready". **For Bob:** `QUESTIONS-FOR-BOB.md` AQ1–AQ10 in plain words, for his page. **Finding:** the test bar (`run-rules` R19, R29) admits no AI part while N829's set is empty, so AQ1 decides whether the beta has an assistant at all. **Need:** Bob's answers; BOB's technical decisions.

## A44 · 2026-10-27 · BOB's decisions taken in; the two owed deltas drafted
K5457: every For BOB point decided as recommended. Drafted for PLANNING: `draft-run-rules.md` (READY; admit per entry and gate part, real-matters set as the standing measure pending AI1) and `credentials` R48 (in `draft-ai-accounts.md`). **Need:** Bob's AI1–AI10.

## A45 · 2026-10-27 · Bob's K5459 folded: paying owners see per-member use
AD43 added; `draft-ai-use.md` R27 `accountUseByMember` (team and project accounts, to their owners; a member's own account never); `draft-ai-costs.md` §2; `draft-assistant-screens.md` U7. **Need:** Bob's AI1–AI10.

## A46 · 2026-10-27 · PLANNING's fold answered: every gap and form defect fixed
Per FOLD-AI §1–§3 as BOB decided (K5457):
- **ai-accounts** R65 `aicredential` (Worker principal, the act's own account, `AI_GRANT_OPS` and `PLANE_OPS`, never a model tool, never logged), R66 `aigatewayserved`, R67 `aicredentialfailed`, R68 `aipayerclear` (reasoned, `PAYER_CLEAR_NO_REASON`); one refusal `PAYER_NOT_VERIFIED`; the twelve retired ops listed; `aitermsaccept` and `aipersonalchoose` reversible.
- **credentials** delta moved to `draft-credentials.md` (six amendments, R48 among them).
- **signatures**: `draft-signatures.md` R49–R56, including the run-key check for issuer R12; the catalogue's references renumbered.
- **ai-catalogue**: R25 now says omission is never a state change; one closed `ADVISORY_REASONS` list shared with issuer R7; the N1205 reference fixed.
- **run-rules** R36 follows option B (`draft:reading` → `draft`); ai-gate's Terms and agent-harness R21 say "`GATE_PART_OF`'s values".
- **Readiness**: `aipathready` with the `ai-health-probe` scheduler consumer (ai-runs R98).
- **Screens**: interface-shell R20 amended (screens §8); one retirement list (screens §9); `aiusebymember` and the new ops added to §4; PLATFORM P-15's two classes, "AI act" and "Gate 1 run", named.
- **Form, every draft**: house prefix on every line, Tests on every line, numbers moved to Suggestions as "set at START".

**Need:** Bob's AI1–AI10.

## A47 · 2026-10-27 · DEC-465 and DEC-466's owed lines drafted
T53 merged in (U500). New files, READY for PLANNING:
- **`draft-ai-accounts-dec465.md`**: R49 amended to DEC-465's two share flags; R54's `checksInForce` names whose checks apply; R69 `aikeyseal`; R70 `aiorderset` for a member's own list; R71–R74.
- **`draft-run-record.md`**: observation-log R40, R41 (N1219's `read` and `disagree`); ai-runs R99–R104, "How this run went" with `op=airunparts`, and labels naming the AI (U1, U2).
- **`draft-instance-setup.md`**: R107, R108, the installer's gateway permission matched to K4464 (exact Cloudflare names OPEN until a live test); R109 `assistantreadiness` (U3).
- The catalogue's R4 gains `display_name`.

**For BOB:** R107 and R108 amend `installer` R2 and `installer-steps` R45, so PLANNING should place them there. Which projects "my projects" means (owned, as drafted, or joined) is in the new accounts file's For BOB.

**Need:** Bob's AI1–AI10.

## A48 · 2026-10-27 · Bob's AI1 folded (K5475)
The run-rules standing measure is now per entry: R75 records carry `entry_id`, and a part below its mark is refused for that AI only (Bob: "switched off for that AI"). `PART_WITHDRAWN` names the entry. Screens §3 and §6 Q1 marked answered; AD44 added. **Need:** AI2–AI11.

## A49 · 2026-10-27 · Bob's AI3, AI4, AI5 folded (K5477–K5479)
No line changed meaning: run-path R94, agent-model R47 and F1, ai-accounts R45 and R46, and screens §7 already followed the recommendations, and are now marked decided. AD45–AD47 added. **Need:** AI2, AI6–AI11.

## A50 · 2026-10-27 · Bob's AI6, AI7 folded (K5480, K5481)
New: `draft-ai-use.md` R28 `retestSet`/`retestAllowed` (`op=airetestset`; per-AI monthly cap as an R2 limit; admin of the paying account), R29 the `retesting-off` queue kind (one item, stays while off), R30. ai-gate R52 asks `retestAllowed`; issuer R7 cites K5481; screens §4 row. AD48, AD49. **For PLANNING:** `queue`'s `classOfKind` gains `retesting-off` (OBLIGATION). **Need:** AI2, AI8–AI11.

## A51 · 2026-10-27 · AI12–AI16 written; hand-over
Bob answered AI8 (K5482), AI9 (K5483) and AI10 (K5484, "B"). AI10's five points were written as AI12–AI16 in the page's form (`QUESTIONS-AI12-AI16.html`) and sent to BOB. AI8 and AI9 are not yet folded: they are next steps 1 and 2 in section 0. Handed over at 44% context.
