# ASSISTANT-HOSTING → BOB: hand-offs

Entries `S<n>`, newest last. BOB reads this at takeover and at each backstop check (K3538).

## S1 · 2026-10-16 · inventory and draft criteria, for Bob

**Done.** Charter step 1 (inventory) to a first cut, step 2 (screen) provisionally, step 4's criteria as a draft. Files: `OPTIONS.md` (22 entries, screen, five families), `COMPARISON.md` (contexts, gates, 14 draft criteria, three ways to compare), `NOTES.md` (findings with sources; one research pass by a worker, sonnet at medium, read-only, 2026-10-16). Nothing tested yet; no session, credential or instance used.

**What the inventory found, in short.**
- Every option is four separate choices: *where Claude Code runs*, *whose credential*, *how long a process lives*, and *the call shape*. Two gains (a fewer-turn call shape; a warm process) are available on any host, so they are not credited to a host.
- After the screen, five families remain: (1) product-hosted on a held token (today, warm/per-run variants, other hosts); (2) Anthropic-hosted session with the product serving rows (routine fire; session driven by `--cloud`); (3) a runner on a machine the member or team owns, on its own sign-in, the product holding nothing (new; includes background sessions and, for Team/Enterprise, self-hosted environments); (4) the member's own Claude with Civicsmith as a connector or plugin (strong for chat; control for checks to be tested, since Claude does not support MCP sampling); (5) GitHub-hosted, scheduled checks only.
- Screened out, with reasons in `OPTIONS.md`: Remote Control and Cowork and Claude Tag as ways to *run checks* (no product control); Claude in Chrome; cloud-provider and federated credentials (billed API access, K3347's spirit — recorded, not proposed).
- One route is a question, not an option: Anthropic's approval ("Unless previously approved", AT-19), reached only through sales (AT-25). Whether to ask is Bob's; listed so it is weighed.
- New cost fact: Cloudflare bills container CPU on active use only and memory on provisioned size while running, so keeping a standard-1 warm costs about $0.036 an hour in memory (NOTES §2.5).

**For Bob (BOB to bring; P17).** Two things, both in the rendered page https://claude.ai/artifact/APQkn9goZZkxyi9kkt7VK4 :
1. **The criteria.** Accept, merge or drop the 14 (C1–C14; the charter's draft plus C7 plan reach, C11 accounting, C14 scale), and the four contexts (team / member × small / large).
2. **How to compare.** Options: A gates then weighted scores per context, with sensitivity (recommended); B must-have / nice-to-have; C pairwise ranking. Under A, Bob later sets the weights per context.

**Next, without waiting.** Step 3 on each family: documentation second pass for the pages not yet read whole, then cheap tests. First tests planned (`TESTS.md`): warm-process and per-run timing on a local copy (no credential); the connector served-loop control test with a scratch MCP server; the routine probe as designed (needs Bob's one act, already written up in `design-remote-routine.md` §5).

**Lane state.** Session `session_01YE7nwvJxdhu4Xc9nnb77MX`, branch `tranche/T49`, folder `build/plan/study-assistant-hosting/`.
