# The assistant's costs to a team, and what is measured on which copy (draft)

**Status** · DRAFT, AI-DESIGN #3, 2026-10-27; READY for PLANNING and PLATFORM. No requirement lines of its own: the lines that carry these costs are in `draft-ai-use.md` (usage, estimates, thresholds), `draft-ai-gate.md` (test cost and ceiling, characterization), `draft-agent-model.md` (gateway log as a usage source) and `draft-ai-catalogue.md` (prices with date). This file says who pays what, and how each figure is obtained. Every figure below is an example from the lane's research (`NOTES.md`, `NOTES-2.md`, read 2026-10-17 to 10-21, grade Stated unless marked) and is to be re-confirmed before it is shown. An unconfirmed figure is OPEN and restricts nothing (K3540).

## 1. Who pays what

| cost | paid by | to whom | shown where |
|---|---|---|---|
| **AI tokens** for every ask, draft and run | the account that served the act: team, project or member (cascade and order; AD36–AD39) | the provider, directly, on the account's own plan. Civicsmith charges nothing and handles no payment (AIR9) | `aimine` (a member's own 30 days), `aiproviders` (spend against limit per account, by project), `aimoments` (h) before and after a run |
| **Subscription plans** (a member's personal one, or a team plan) | the subscriber | the provider, flat | "not measurable in money", never zero (AIR26); tokens and calls only |
| **Built-in Cloudflare AI** (Workers AI, the default for a team with no outside account, AD26) | the team | Cloudflare, on the team's own account. Example: a daily free allowance, then a per-unit price (Stated, Cloudflare's pages; figures OPEN until re-read) | as AI tokens |
| **AI Gateway** (holds the team's keys, AIR45; logs every call) | the team | Cloudflare. Core gateway use and stored keys are free while in beta (Stated); cost after beta OPEN; logs fill the team's account | `aiproviders` notes the gateway's own limits |
| **Gate 1 test run** of an unlisted AI (`aitest`) | the team that runs it | the provider (the test's requests) and Cloudflare (the container's compute) | `aitest` shows both before the run, with a spending ceiling the run stops before (`draft-ai-gate.md`) |
| **Civicsmith's own tests** (screening, re-tests, canaries) | Civicsmith | providers, on Bob's sample accounts | Bob's monthly cap per AI (AQ6) |
| **The issuer service** (the list and test intake) | Civicsmith | Cloudflare, account `20b5…7f72` | Civicsmith's own operations |

Example price spread, to show why the estimate matters (same model, `gpt-oss-120b`, per million tokens in / out, Stated 2026-10-21): Nebius, Together, Groq and Fireworks $0.15 / $0.60; Cloudflare $0.35 / $0.75; the cheapest OpenRouter hosts $0.03 / $0.15 (lower precision). The catalogue carries each price with its date; the estimate uses the entry's measured all-in cost of standard tasks, not list prices alone.

## 2. What a team sees, and when

1. **Before connecting:** each plan's price basis and an estimate for typical work (from characterization's standard tasks) (`aiproviders` "Add an AI").
2. **Before a run or a costly act:** an estimate range on the account that will serve it; if a hop is possible, the extra cost of moving (a cold cache) (`aimoments` (h)).
3. **After:** the actual cost, by AI and effort, beside the estimate (`ai-use` R11, R15).
4. **Over time:** spend against each limit; alerts at thresholds the owner sets; reconciliation with the provider's own figures where it offers them, else the gateway log's per-call cost.

## 3. What is measured, and on which copy

| measure | how | copy and account | feeds |
|---|---|---|---|
| Gate 1 verdict per (AI, part) | the suite, scored by code | Civicsmith's own runs on Bob's sample accounts (graded Reproduced); a team's container run (Reported) | catalogue, results library |
| Characterization: start cost and time, turn latency, consistency, context, all-in cost of standard tasks, uptime with its period | `ai-gate` T3 | Civicsmith's own runs | estimates, the "typical work" figure |
| Drift | canaries, a small fixed subset re-run on a schedule | Civicsmith's own copy (biosmoke8 or its successor) and accounts | lifecycle: watch, lapsed (AQ7) |
| Real cost per act | the neutral usage record per call | each team's own copy | that team's `aimine`, `aiproviders` |
| Health (errors, refusals, latency per AI) | content-free counts, opt-in (AD38) | teams that opt in | drift signal |
| Time to first progress and to a checked answer | PLATFORM's budget check, with a stub AI and with a listed AI | Civicsmith's scratch copy (PLATFORM's load test) | PLATFORM's "AI act" class (`draft-assistant-screens.md` §5 P1) |
| Accuracy over time on real matters | the standing measure (N1258), once the matters exist (N829) | Civicsmith's own copy | results library; withdrawal of a part below its mark (AQ1 B) |

## 4. Open, to measure before any figure is shown
Workers AI per-model prices and what its binding reports as usage; AI Gateway's cost after beta and its log retention; the container's compute cost per test tier; each listed entry's all-in cost of standard tasks (needs the first screening run, `TESTS.md` L3, on Bob's sample accounts).
