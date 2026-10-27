# AI-DESIGN hand-offs to BOB

Entries `A<n>`, newest last; section 0 is rewritten whole after every entry (LANES.md §1). A1–A41 (AI-DESIGN #1 and #2) are in `build/plan/archive/lane-ai-design/HANDOFF-A1-A41.md`; a successor does not read the archive at takeover.

## 0 · The state now and the next steps

**Lane** · AI-DESIGN #3 (`session_018BhcedQQCRAKFMw8Mi8Xka`, Opus), started 2026-10-27 by BOB #320 under LANES.md (K5421, K5422). Branch `lane/ai-design`, merged with `tranche/T53` at `7d73412b` (T53's versions taken for every file outside this folder: the lane branch carried stale T50/T51 copies of BOB's files). Scope (LANES.md §2): AI provider selection (a team's, a project's, a member's AI) and the assistant designed whole: what it does on every screen and journey, its modules (keep, adapt, retire), the provider boundary, its tests and limits, its costs to a team.

**Delivered** · A42: `RULINGS-FOR-BOB.md`, READY: six K-ruling lines for BOB (A41's condition met; K3347 reconciled; privacy as evidence plus team-set checks over AIR17 (a)/AIR19; the origin rule as the seventh check; K3735's and K3804's open AI questions closed; K1755, K2352, K2353, K3061 reconciled) and N1220's refreshed text. `DECISIONS.md`: Bob's 42 decisions in his words (AD1–AD42), each with the K that recorded it. Most of Bob's AIR words were already recorded (K3735, K4421, K4443, K4464); the lines are only what was not.

**Housekeeping** · `NOTES.md` split by subject (`NOTES-2.md` holds §Q2d, §Q2e, §Q-secrets) and the old HANDOFF archived, so every file is under its cap.

**Open with Bob** · none. Bob's: nothing asked now (`RULINGS-FOR-BOB.md` §4 says what comes to him later, as one rendered page).

**Next steps, in order**
1. Read the house format (`build/requirements/README.md`), then `WAY-THERE.md`, `BOUNDARY-REQUIREMENTS.md` and `AI-PROVIDER-REQUIREMENTS.md` whole (the design's base).
2. Inventory, by a Sonnet worker (medium): what the assistant does today on every screen and journey (the canon `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md`, the screens' and agent modules' requirements), and what DEC-420 (U456, `bf152ef3f3`) drew for AI provider selection; output a table per screen and journey, cited.
3. Draft, one file per module, in the house format: the new modules (`ai-catalogue`, `ai-gate`; layer and `uses` proposed), the adapted ones (`agent-model` as the provider interface and adapters, `ai-accounts`, `ai-use`, `credentials`, `agent-worker`, `agent-harness`, `ai-runs`), the retired or parked (`agent-runner`'s path, the Claude sign-in), the assistant per screen and journey, ops and grades, what is measured and on what copy, costs to a team; BOB's points (§5 of `RULINGS-FOR-BOB.md`) each with a recommendation.
4. Needs to other lanes through BOB: PLATFORM (a time budget for each AI screen and op; the gateway and catalogue channel per service level); UX-DESIGN (anything DEC-420 lacks).
5. Bring Bob, through BOB, one rendered page: the requirements he has not ruled one by one (AIR24, AIR26, AIR28, AIR37–AIR40, new ones), options and recommendations.
6. Mark each draft READY for PLANNING; record each in `MAP.md`'s row through BOB.

## A42 · 2026-10-27 · Bob's AI decisions as K-ruling lines (READY); the lane's files brought up to date
**For BOB:** `RULINGS-FOR-BOB.md` §2: six lines to number and record, each applying K1762 (3), none needing Bob; §3: N1220's refreshed text for `next.md`. `DECISIONS.md`: Bob's decisions AD1–AD42, verbatim, with the K that recorded each. **Finding:** K4421, K4443 and K4464 had already recorded AIR11–AIR45 and the answers of `REQUIREMENTS.md` §11–§17 (provisional, as K3735); what was missing is the reconciliation: K3347 was never named, AIR17 (a)/AIR19's privacy bar and AIR35's origin exclusion were varied by later words with no line saying so, K3735's and K3804's open AI questions were never closed, K3061's project and team subscription cases were left, and N1220 still reads "T51's focus". **Need:** nothing from Bob; BOB to record the lines. Next: the design itself (section 0, steps 1–6).
