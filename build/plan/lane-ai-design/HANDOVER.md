# AI-DESIGN hand-over to BOB

**Status.** 2026-10-21, AI-DESIGN #2. Prepared at Bob's request; **to be passed to BOB when Bob says so** (BOB was mid-redeploy). Everything is on branch `lane/ai-design` only (Bob, 2026-10-19: brainstorming stays on the lane branch; no pull request opened, because BOB merges development pull requests into `main`). No question is open with Bob.

## Read in this order
1. `AI-PROVIDER-REQUIREMENTS.md`: the clean, current requirements. Start here; its §9 lists what BOB records and reconciles.
2. `BOUNDARY-REQUIREMENTS.md`: the provider-neutral boundary (BR1–BR32) and packaging options (BOB's; Option 1 recommended).
3. `SUITE-REQUIREMENTS.md`: Gate 1 (per entry and part, extending D14's test bar) and characterization.
4. `WAY-THERE.md`: every requirement of the six assistant modules classified keep / adapt / Anthropic adapter / test container / retire / parked; conflicts with today's rulings; a suggested order of work for N1220.
5. `TESTS.md`: live test L1 done (gateway-held key, proven); L2 (OpenRouter) and L3 (first screening run) proposed and agreed in principle, each waiting on what it needs.
6. `UX-REQUIREMENTS.md`: what to pass to the UX design lane (needs, not designs), including the security-tools screen it should borrow from.
Background, only where a point needs it: `REQUIREMENTS.md` (Bob's words verbatim, AIR1–AIR45, §1–§17), `NOTES.md` (sources, quoted), `PROCESS.md`, `OPTIONS.md`, `HANDOFF.md` (A1–A39).

## For BOB to do
1. **Record Bob's decisions as K rulings.** Each is marked [Bob] in `AI-PROVIDER-REQUIREMENTS.md`, with his words and date in `REQUIREMENTS.md` §8–§17 (AIR20–AIR45, plus the answers in §11–§17).
2. **Reconcile the rulings they supersede or except** (`AI-PROVIDER-REQUIREMENTS.md` §9; `WAY-THERE.md` §3): K3717, K3347, K2352/K1755, K2353, AIR17/AIR19's privacy bar, AIR35's fixed origin exclusion; K3061 stays with the Anthropic plan profile.
3. **Refresh N1220** in `build/plan/next.md` from these documents (it still says "none of them Anthropic's" and cites only AIR1–AIR10).
4. **Pass `UX-REQUIREMENTS.md` to the UX design lane.**
5. **Decide the technical points the lane left to BOB:** packaging (`BOUNDARY-REQUIREMENTS.md` §10), the order of work (`WAY-THERE.md` §6), the suite's repeat counts, formats and the extended R75 record (`SUITE-REQUIREMENTS.md` §15), the catalogue channel, and the installer asking each team's copy for a Cloudflare credential able to create gateways and store keys (AIR45).

## Loose ends
- L1's clean-up is complete (2026-10-21): the lane deleted its test Worker; Bob revoked the OpenAI key and deleted the gateway `aidesign-test` and the secrets `aidesign-test_openai_default` and `aidesign-control`.
- The session's Cloudflare credential cannot manage AI Gateway or Secrets Store; future live tests in that area need Bob's dashboard steps or a wider credential (Bob's choice).
