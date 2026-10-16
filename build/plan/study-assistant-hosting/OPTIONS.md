# Options: inventory and screen (ASSISTANT-HOSTING)

**Status** · S1 inventory, 2026-10-16. Step 1 (inventory) done to a first cut; step 2 (screen) provisional, from documentation already read in the earlier studies and a fresh research pass (`NOTES.md` §2). Nothing here is decided. Marks: **[doc]** documented, **[rep]** reported, **[test]** tested, **[inf]** inferred; **[study]** = taken from `study-assistant-link.md`, `study-remote-sessions.md` or `design-remote-routine.md`, each of which carries its own sources.

## 1. The shape of the question: four independent choices

Every option is a combination of four choices. Keeping them apart shows that some "options" are really one choice in disguise, and that a few gains (a fewer-turn call shape, a bigger box) are available whichever host is chosen.

| Axis | Choices |
|---|---|
| **H. Where Claude Code (or Claude) runs** | the team's Cloudflare container · Anthropic's cloud VM (cloud session, routine) · a machine the member or team runs (laptop, home server, VPS) · a third-party sandbox host · the member's own Claude app (web, desktop, mobile) · a GitHub runner |
| **K. Whose credential, and what kind** | member's one-year inference token (`setup-token`, held by the copy, K3061) · member's full-scope claude.ai login (30-day cap for cloud sessions) · per-routine token · the member's own sign-in on their own machine or app (nothing held by the product) |
| **L. Process lifetime** | one process per conversation (today) · one per run · one kept warm across runs · one session holding context for a whole run |
| **S. Call shape** | multi-turn tool loop, product's tools relayed (today) · product-served "next row / answer" loop (the routine design's Option A) · single-shot judge call with structured output, no tools · member-driven chat with the product as a tool provider |

H and K decide the hosting question proper. L and S are mostly design choices *within* a host, and are scored separately so that a gain from S (e.g. dropping the closing turn) is not credited to a host.

## 2. Inventory

| Id | Option | H / K / L / S | Origin |
|---|---|---|---|
| a | **Local process per conversation** in the team's Cloudflare container (today) | container / held token / per conversation / tool loop | charter; [study] link |
| b | **Local process per run** (`streamInput`) or **pre-warmed** (`startup()`) in the same container | container / held token / per run or warm / tool loop | charter; [study] remote §5 |
| b′ | **Warm container kept per team** (long `sleepAfter`, one live process per active member) | container / held token / warm / tool loop | new (variant of b) |
| c | **Routine fired per run**, session calls back to the product's endpoint (next-row/answer) | cloud VM / routine token / per run / served loop | charter; [study] design-remote-routine |
| d | **Cloud session made per run, driven turn by turn** with `claude -p --cloud <id>` | cloud VM / full-scope login / per run / served loop | charter; K3537 |
| e | **Self-hosted environment**: sessions dispatched by `--environment` to a runner the team operates, read back by a Stop hook | team machine / full-scope login / per run / tool loop | charter; [study] remote R6, R9 |
| f | **Remote Control**: Claude Code on a machine the member or team runs, steered from claude.ai | member/team machine / full-scope login / long-lived / member-driven | charter; [study] remote §1b |
| g | **Civicsmith as a remote MCP connector**, used from the member's own Claude (web, desktop, mobile, Claude Code) | member's app / member's own sign-in / the app's / member-driven chat, product as tools | charter |
| g′ | **Civicsmith as a Claude Code plugin** (skills, subagents, MCP server bundled) run in the member's own Claude Code | member's machine / own sign-in / the app's / plugin-guided loop | new (variant of g) |
| h | **Agent SDK hosted elsewhere** (Fly, Modal, E2B, a VPS, other sandbox hosts) on the held token | third-party host / held token / any / any | charter |
| i | **GitHub-hosted runs** (Claude Code GitHub Action on the held token) | GitHub runner / held token / per run / tool loop | charter; [study] remote §1b |
| j | **Bring-your-own runner**: a small Civicsmith runner the member or team runs on their own computer or server, connecting *outbound* to the team's copy and running the Agent SDK on that machine's own Claude sign-in | member/team machine / own sign-in, nothing held / any / tool loop or served loop | new |
| k | **Single-shot judge calls** (`claude -p` / `query()` with no tools, structured output, one turn per judged row; the product does every read) | any host / held token / per call / judge | new (a call shape, scored on host a/b) |
| l | **Cowork remote sessions** | cloud / full-scope / per session / member-driven | new; pending research |
| m | **Cloud-provider inference** (Bedrock, Vertex, Foundry credentials) | any / provider credential / any / any | new; screened below |
| n | **Claude in Chrome** operating Civicsmith's own pages for the member | member's browser / own sign-in / — / model-driven UI | new; screened below |

Research for further options is in `NOTES.md` §2; additions it finds are appended here with their source.

## 3. Screen (provisional)

| Id | Verdict | Why, with evidence |
|---|---|---|
| a | **Viable** | runs today (R085); measured [study link T1–T2]; terms covered by AT-14, AT-15, AT-18, with U-2/U-7 settled by Bob (K3061) |
| b, b′ | **Viable** | documented SDK features (streaming input, `startup()`) [study remote L1–L3]; untested here |
| c | **Viable, conditionally** | passes G1–G4 on paper [study design-remote-routine §2]: the product serves every row, so G2 holds by construction of the served loop. Conditions: experimental API, hand-built routine and token per member, Pro/Max/Team/Enterprise with cloud sessions; terms not covered by the register |
| d | **Viable, conditionally** | needs the member's full-scope claude.ai login held by the product, renewed every 30 days [study remote R8]; that is the subject of AT-16/AT-17; Bob's K3061 settles holding a "subscription token", and whether that ruling reaches a full-scope login is a question for Bob, not BOB. Creation is interactive-only for hosted sessions; non-interactive creation needs a self-hosted environment [study remote R6–R7] — K3537's composite (routine fire to create, `--cloud` to drive) is the form to test |
| e | **Viable, Team/Enterprise only** | self-hosted environments are Team and Enterprise, public beta, off by default; the runner is the team's own machine [study remote R6]. For X2 on Pro/Max: screened out |
| f | **Screen out for runs; keep as a member convenience** | Remote Control is steered from claude.ai by a person; there is no documented way for the product to drive it [study remote §1b]; G2 cannot hold. A member may still use it to reach option j's runner |
| g, g′ | **Viable for chat and member-led work; doubtful for checks** | the member's own Claude decides when to call the product's tools, so G2 holds only if the product's tools refuse anything out of order (a served loop, as in c). Whether that is enough control for a check is a design question to test, not a screen-out. Strong on data and terms: nothing held, member's own sign-in. Facts pending research (plans, connector auth, sampling) |
| h | **Viable** | the same SDK pattern as a, on another host [study remote §1b, Agent SDK hosting]; differs on cost, start-up, where data travels |
| i | **Screen out for interactive use; keep for scheduled checks** | a GitHub runner starts per workflow (tens of seconds), needs a repository per team, and GitHub as one more place record text passes through [inf]; usable only where a check is scheduled, not asked |
| j | **Viable** | the product holds no credential (removes U-2/U-7 entirely; AT-18 covers a person signing in to the unmodified binary on their own machine); the runner dials out, so no inbound network to the member [inf]. Needs the member's machine on while it runs |
| k | **Viable as a call shape** | standard `claude -p` / `query()` use [study link D1]; scored as a modifier on a and b |
| l | **Pending** | research |
| m | **Screen out (G1, by its spirit), flagged** | a cloud provider's credential is billed API access, the thing K3347 ruled out; the register lists it beside API keys (AT-15). Recorded so it is not rediscovered; not proposed |
| n | **Screen out (G2)** | the model would drive the product's screens; the product cannot decide its steps |
