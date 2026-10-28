# AI-DESIGN hand-offs to BOB

Entries `A<n>`, newest last; section 0 is rewritten whole after every entry (LANES.md §1). A1–A41 (AI-DESIGN #1 and #2) are in `build/plan/archive/lane-ai-design/HANDOFF-A1-A41.md`; a successor does not read the archive at takeover.

## 0 · The state now and the next steps

**Lane** · AI-DESIGN #4 (`session_018BhcedHXD9yareupMq6poX`, Opus) **spun down** on BOB #330's SPIN DOWN (`session_018BhcedfM8dV8rPodwgBjD3`, 2026-10-28; an account move, K5417) after A61. The successor (#5) starts from `NEXT-SESSION-PROMPT.md` and archives #4. Branch `lane/ai-design`. BOB is the session on `build/plan/current.md`'s Status line on `tranche/T53`; check it with get_session before each message. Scope: AI provider selection and the assistant designed whole (LANES.md §2).

**The design is complete.** Every draft in this folder is READY and final against Bob's answers AI1–AI16 (`DECISIONS.md` AD1–AD58, each with its K):
- New modules: `draft-ai-catalogue.md` (L2), `draft-ai-gate.md` (L6), `draft-ai-issuer.md` (L11, Civicsmith's own Worker).
- Adapted modules: `draft-ai-accounts.md` with `draft-ai-accounts-dec465.md` (DEC-465, DEC-471, R68 `aicreditsclear`, R75, R76); `draft-credentials.md`; `draft-agent-model.md`; `draft-ai-use.md`; `draft-agent-runner.md`; `draft-agent-run-path.md`; `draft-run-record.md`; `draft-run-rules.md`; `draft-signatures.md`; `draft-instance-setup.md`.
- Screens and costs: `draft-assistant-screens.md` (ops §4, needs U1–U11 §5, names §7); `draft-ai-costs.md`. Supporting: `NEXT-ENTRIES.md`, `DESIGN-BRIEF.md`, `INVENTORY.md`.

**Open with Bob:** nothing. **Open with BOB:** nothing (BOB's K5490–K5492 and the wait lengths, 5/15/60 minutes, are folded). UX-DESIGN drew U8–U11 (DEC-471, DEC-475, DEC-476); the drafts are aligned with all three.

**State for PLANNING:** PLANNING last folded A43–A47. Not yet folded, A48–A61: AI1–AI16 folded; new lines catalogue R54, R55 (R43–R45 amended); gate R67 (R53, R63 amended); issuer R25, R26 (R13, R16–R18 amended); ai-use R28–R33; instance-setup R110; ai-accounts R47 amended (no terms refusal), R68 replaced, R75, R76; run-record R105 (wait lengths); screens ops `airesultown`, `aihealthset`, `aihealthpreview`, `aicreditsclear`, U8–U11. New `queue` kinds: `retesting-off`, `ai-credits-stop` (one kind, three causes).

**Outside the lane, raised by Bob's account in this session (2026-10-28) and answered there, not relayed:** whether capture is blocked. Findings: robots.txt is never read (BOB-3, `capture-requests` R14); the renamed `Civicsmith/0.87.0 (+contact; instance; purpose)` agent was admitted (200) by oaklandca.gov's Akamai on 2026-10-27 from this container, the bare token and a browser user-agent string refused (403), so the member-browser UA delegation may buy nothing from a server; `SOURCE-ACCESS.md`'s table is of the old `CivicOS` name and never re-measured. Whether to relay this to BOB was asked of the user and not yet answered; a successor relays it only if the user says so.

**Next steps, in order**
1. Take over (prompt), archive #4, tell BOB.
2. Answer PLANNING's and BOB's questions as they fold A48–A61; read `MAP.md` and the other lanes' section 0 at each entry; keep each file under its cap (`proc sizes`, and commit only when it lists nothing); hand over at 40%.
3. After the build's first measuring run, confirm PLATFORM's AI act and Gate 1 run figures (screens §4).

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

## A52 · 2026-10-27 · Bob's AI8 and AI9 folded (K5482, K5483)
AI-DESIGN #4 took over (T53 merged in; #3 archived). **AI8:** `draft-ai-catalogue.md` R43–R45 (rows name a `subject_id`, an entry or a tested AI; only rows tested within `RESULT_ACTIVE_MONTHS`, Bob's six, are returned, with `on_list` and `confirmed`), new R54 (tested AIs, never offered) and R55 (the combined records); `draft-ai-gate.md` R63 (a row for every scored result, listed or not, no decision of Bob's needed) and new R67 `combineResults` (pooled group counts, Wilson interval, verdict on the pooled figures); `draft-ai-issuer.md` R13 `result_token`, R16 (`subject_id`, re-scores supersede, `SCORE_WITHIN`), R17 active rows and `combinedFor`, R18 retention by Bob's rule (active, or listed plus a year), new R25 `GET /ai/result/<token>` (the sending team's own result at once); screens `airesultown`, U8, §7 names. **AI9:** catalogue R32, R40 marked decided. AD55, AD56. **Finding:** K5487's opt-in health counts are not drafted (next step 1). **Need:** BOB's view of the four For BOB points; U8 relayed to UX-DESIGN.

## A53 · 2026-10-27 · Bob's AI12 health counts drafted (K5487)
K5487 lets teams "opt in to send counts of errors and refusals, never their content"; the drafts still deferred them (issuer For BOB 9). Now: `draft-ai-use.md` R31 `countHealth` (per entry and UTC day: calls, refused, silent, each error class; no owner, member or content), R32 the team's switch `op=aihealthshare` (administrators, off by default), R33 `healthReport` and `op=aihealthpreview` (exactly what would leave), R7's tables; `draft-instance-setup.md` R110 the daily `health-send` consumer (plain POST, no identifying header); `draft-ai-issuer.md` R26 `POST /ai/health` summing into one row per (entry, day), keeping nothing of the request, and `healthFor`; `draft-ai-gate.md` R53 the `health` signal, `watch` only; screens §4 two ops, §5 U9, §7. **Need:** BOB's view of B9, B10 and issuer For BOB 9; U9 relayed to UX-DESIGN. The lane's scope is drafted READY; AI15 and AI16 are Bob's.

## A54 · 2026-10-27 · DEC-471's owed act drafted: `aicreditsclear` and its Queue item (K5478)
T53 merged in (U504). `draft-ai-accounts-dec465.md` R68 (full new text, replacing `draft-ai-accounts.md` R68): `op=aicreditsclear`, DEC-471's "Clear it and turn the account back on", rung reversible with name and time (DEC-471 asks no reason; `PAYER_CLEAR_NO_REASON` dropped), clearing the flag for any of its three causes; R75 the `ai-credits-stop` Queue item (OBLIGATION, to whoever may clear it, `screen.aiproviders.stands.credits`, one per flagged account, closed by the clear or the account's removal), replacing R45's notice. `aipayerclear` renamed everywhere. Screens §4 row, U10. **Need:** BOB's view of For BOB 5–7 there; U10 relayed to UX-DESIGN.

## A55 · 2026-10-27 · BOB's K5490 and K5491 folded
K5490: the four A52 points marked decided. K5491: `draft-ai-use.md` R31 counts with a `personal` flag (never the account) and R33 leaves a personal subscription's calls out of every report and preview; B9 changed, B10 and issuer 9 decided. **Need:** For BOB 5–7 of A54; Bob's AI15, AI16.

## A56 · 2026-10-27 · BOB's K5492 folded
A54's For BOB 5–7 marked decided in `draft-ai-accounts-dec465.md`. Nothing open with BOB. **Need:** Bob's AI15, AI16.

## A57 · 2026-10-27 · Bob's AI15 folded (K5493)
Binding terms are optional reading behind a link beside the connect act, never a required step: `draft-ai-catalogue.md` R22, R23 (`needs_reconfirmation` is Civicsmith's review flag only); `draft-ai-accounts-dec465.md` R76 `termsNoticesDue` (one notice per account and term before it takes effect, nothing waits; `TERMS_NOTICE_DAYS` proposed 14); screens U11 (replaces the terms half of `UX-REQUIREMENTS.md` item 6); AD57. The free-tier acceptance (`aitermsaccept`, AD21) is unchanged. **Need:** U11 relayed to UX-DESIGN; Bob's AI16.

## A58 · 2026-10-27 · Bob's AI16 folded (K5494); the lane's drafts final for PLANNING
AI16 A: `draft-ai-issuer.md` stands whole (status line); AD58. The last "marked pending" status notes cleared from `draft-agent-model.md`, `draft-agent-runner.md`, `draft-credentials.md`, `draft-agent-run-path.md` (its For Bob 1 marked answered, K5477) and `draft-ai-accounts.md`. Every AI question is answered; section 0 lists what PLANNING has not yet folded (A48–A58). **Need:** nothing from Bob; PLANNING to fold A48–A58.

## A59 · 2026-10-27 · Drafts aligned with DEC-475 (U8–U10 drawn)
UX-DESIGN's DEC-475 (U508) drew U8–U10 and Bob's AI6, AI8, AI9, AI11–AI14. Aligned: `op=aihealthset` (was `aihealthshare`, ai-use R32, screens); `queue.retesting-off.summary` (ai-use R29); the three payer-flag word keys in dec465 R75 (one Queue kind, the cause in the item, as K5492); run-record R105: `WAIT_THEN_SWITCH_CHOICES` drawn as 5, 15, 60 minutes, and the plain `aiwait` takes the same lengths; screens `airesultsread` also reads the team's allowed list for "Tested, not on your team's list"; U8–U10 marked drawn. DEC-475's "three payer-flag stops" are one kind with three causes (K5492). **For BOB:** confirm the wait lengths (DEC-475 marks them BOB's). **Need:** nothing from Bob.

## A60 · 2026-10-27 · Wait lengths confirmed
BOB #323 confirmed `WAIT_THEN_SWITCH_CHOICES` 5, 15, 60 minutes for `aiwaitswitch` and `aiwait`; run-record R105 marked. Nothing open with BOB or Bob.

## A61 · 2026-10-27 · Aligned with DEC-476 (U11 drawn)
DEC-476 drew AI15: no terms acceptance at connection, a fold of quoted terms beside "Switch it on", `ai.notice.termschange` (already dec465 R76's key). Aligned: `draft-ai-accounts.md` R47 no longer refuses a personal subscription for a changed terms version (`PERSONAL_CHOICE_TERMS_CHANGED` dropped; the version is recorded and marked stale later, as before); screens `aitermsaccept` is the free-tier warning only; U11 marked drawn. **Need:** nothing.

## A62 · 2026-10-28 · Spun down
BOB #330's SPIN DOWN (account move). Section 0 and `NEXT-SESSION-PROMPT.md` rewritten for AI-DESIGN #5. Nothing in progress; nothing open with Bob or BOB.
