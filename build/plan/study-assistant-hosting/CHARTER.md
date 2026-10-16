# Study: where and how the assistant runs (ASSISTANT-HOSTING)

**Status** · Open. Chartered by BOB #192, 2026-10-16, on Bob's direction (K3538): "this is a serious decision that needs to be seriously considered, decided, designed, and developed." The decision is Bob's (high-level architecture, P17). This lane studies, tests and compares; it decides nothing and changes no product code.

## The question
How should Civicsmith's assistant run Claude for a team and for a member, so that a check is fast, keeps its context, stays under the product's deterministic control, is affordable, keeps members' records where they should be, and works within Anthropic's terms? The answer may differ by context: a team's shared work, a member on their own subscription, small and large teams.

## Fixed constraints (rulings of Bob's; never reopened here)
- No API keys, in any form, and never proposed (K3347).
- Holding a member's or team's subscription token is allowed and is not raised again (K3061; U-2, U-7).
- Any statement about Anthropic's terms cites `AT-n`/`U-n` in `build/terms/anthropic.md`, or says plainly the register does not cover it (K1762).
- The product, not the model, decides every step of a run (agent-harness; the run's control table).
- No credential travels in a URL (K1874).

## Work, in order
1. **Inventory.** Every option known (start from `build/plan/study-assistant-link.md`, `study-remote-sessions.md`, `design-remote-routine.md`, and K3536, K3537), and research for options not yet found. Candidates to examine, not a closed list:
   - (a) today's local Claude Code process per conversation in the Cloudflare container;
   - (b) one local process per run (streaming input, pre-warm);
   - (c) a routine fired per question, the session writing back;
   - (d) a cloud session made per run and driven with `claude -p --cloud <id>`;
   - (e) self-hosted environments;
   - (f) Remote Control;
   - (g) Civicsmith as a remote MCP connector, used from the member's own Claude (web, desktop, Claude Code);
   - (h) the Agent SDK hosted elsewhere;
   - (i) GitHub-hosted runs.
2. **Screen.** Drop each option that cannot meet the fixed constraints or the product's needs, saying exactly why, with evidence.
3. **Understand and test** each viable option: documentation first (official, with URL and date read), then what others report, then small, cheap tests that confirm each claim (mark each documented, reported, tested or inferred). Any test needing an act only Bob can take is listed, with plain steps, for BOB to bring to him.
4. **Criteria and comparison.** Agree the criteria with Bob first (draft: functionality and control, speed, context, cost to the team on Cloudflare and on the subscription, setup burden for a team and a member, where members' data goes, security, reliability and documented status, terms, build effort, fit by context). Then build an objective comparison, scored from evidence.
5. **Recommendation** per context, brought to Bob through BOB with options; Bob decides; BOB records the K and plans the design and build.

## How the lane works
- Its record is this folder on `tranche/T49` (and the open tranche branch after): `NOTES.md` (findings, each with its evidence), `OPTIONS.md` (the inventory and screen), `TESTS.md` (each test, steps, results), `COMPARISON.md`. Commits only here. Never `main`, never product code, never another lane's files.
- Workers name model and effort (K3518): haiku at low for mechanical work, sonnet at medium for reading, research and tests; never above the lane's model.
- Tests use Bob's account as the stand-in member, with the least use of his subscription that answers the question; probe sessions are archived after use; nothing is written to biosmoke8 beyond what a test needs.
- It reports to BOB in `HANDOFF.md` (entries `S<n>`), read by BOB at takeover and each backstop check; Bob may also work with it directly in its session. A question for Bob is put to him with an explanation, options and a recommendation.
