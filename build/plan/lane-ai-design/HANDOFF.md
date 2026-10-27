# AI-DESIGN hand-offs to BOB

Entries `A<n>`, newest last; section 0 is rewritten whole after every entry (LANES.md §1). A1–A41 (AI-DESIGN #1 and #2) are in `build/plan/archive/lane-ai-design/HANDOFF-A1-A41.md`; a successor does not read the archive at takeover.

## 0 · The state now and the next steps

**Lane** · AI-DESIGN #3 (`session_018BhcedQQCRAKFMw8Mi8Xka`, Opus), started 2026-10-27 by BOB #320 (LANES.md, K5421, K5422); BOB now #321. Branch `lane/ai-design` (T53 merged in). Scope: AI provider selection and the assistant designed whole (LANES.md §2).

**Delivered** · A42 `RULINGS-FOR-BOB.md` (recorded by BOB as K5428–K5433; N1220 replaced). A43: the whole design, every draft **READY for PLANNING** (lines that depend on Bob follow the recommendation, marked pending):
- `draft-ai-catalogue.md` (new, layer 2), `draft-ai-issuer.md` (new Civicsmith-run Worker, layer 11), `draft-ai-accounts.md` (+ credentials delta), `draft-agent-model.md` (the provider interface and adapters), `draft-ai-use.md`, `draft-ai-gate.md` (new, layer 6), `draft-agent-runner.md` (repurposed as the test container), `draft-agent-run-path.md` (agent-worker, agent-steps, agent-harness, ai-runs), `draft-assistant-screens.md` (every screen and journey, the six parts, DEC-420's ops with owner, rung, budget class and reads; §7 the canonical names), `draft-ai-costs.md`, `NEXT-ENTRIES.md` (N829, N842, N1105, N1198–N1200, N1219, N1258, N1276 placed).
- Frame: `DESIGN-BRIEF.md`; facts: `INVENTORY.md`; Bob's words: `DECISIONS.md` (AD1–AD42).

**Open with Bob** · `QUESTIONS-FOR-BOB.md` AQ1–AQ10, on Bob's page `build/plan/beta/QUESTIONS.html` as AI1–AI10 (BOB #321, 2026-10-27; AQ8's three parts as one). PLANNING is folding the READY drafts; BOB is answering the "For BOB" points. AQ1 matters most: the real-matters test set is empty (N829), so under today's bar no member could use the assistant in the beta.

**Decided by BOB (K5457):** every "For BOB" point of A43 as recommended (Option 1 packaging; issuer custody (b); `op=aicredential`; `ROLE_NEEDS`; K2892 read as "every part deployed and passed"; `NEXT-ENTRIES.md`; numbers set at START). The `[rec]` marks in the drafts and `DESIGN-BRIEF.md` now read as decided. **For PLANNING (owed, K5457):** `draft-run-rules.md` (the test bar per AI and part: R19, R29, R30 amended, R36 `GATE_PART_OF`, R37 pending AI1) and `credentials` R48's wording (in `draft-ai-accounts.md`, For BOB 13). PLANNING #2 is `session_018Bhceg7ptZUBDjGtWWSVz4`.

**Was for BOB** · each draft's "For BOB" section (technical points with a recommendation). The cross-draft ones: packaging (`DESIGN-BRIEF.md` §1); who picks the entry (`agent-model.entryFor`, R55); the secret reaching the Worker by `op=aicredential` (run-path For BOB 1); unsigned challenge with the nonce table authoritative (lane recommends); library rows hold parts, speed and task cost only (lane recommends); `run-rules` `TEST_BAR_PARTS` migrated to the six part ids (no draft owns it: PLANNING); `signatures` R49–R53 (catalogue's Uses).

**PLANNING's fold (FOLD-AI §1–§3, K5457) answered in A46:** every gap and form defect fixed; `draft-credentials.md` and `draft-signatures.md` (R49–R56) split out as their own files.

**Bob's AI1 answered (K5475):** option B, as recommended. A part reaches members once the chosen AI passes Gate 1; the real-matters set becomes a standing check, and a part below its mark is switched off for that AI only. Folded into `draft-run-rules.md` R19 and R37 (per entry) and `draft-assistant-screens.md` §3; recorded as AD44. AI2–AI11 still open.

**Bob's AI3, AI4, AI5 answered (K5477–K5479),** all as recommended: a run asks the member only when the payer changes; on a payer mismatch the answer is kept and the account is stopped until cleared; a personal subscription must be on the team's allowed list. Drafts already worked this way; marked decided; AD45–AD47. Still open: AI2, AI6–AI11.

**Merged and decided (BOB #322, K5471):** A46 and A47 merged into `tranche/T53`. `NS_AI_RUN` approved as a third signing namespace. A member may clear a payer flag on their own account (R68). R107 and R108 placed by PLANNING in `installer` R2 and `installer-steps` R45. "My projects" (owned or joined) is now on Bob's page; "owns" stays drafted until he answers.

**Needs placed** · PLATFORM: an "AI act" budget class and the assistant's declared reads (`draft-assistant-screens.md` §5 P1, P2). UX-DESIGN: U1–U6, sent by BOB as B555.

**Next steps, in order**
1. On Bob's answers (through BOB): fold each into the drafts and `DECISIONS.md`; clear the "pending" marks.
2. On BOB's technical decisions: revise the drafts.
3. Answer PLANNING's questions as it folds the drafts; keep `MAP.md`'s row current through BOB.
4. Optional, when a credential with AI Gateway access exists: check `aiconnect`'s dashboard labels live (DEC-420 owed).

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
