# AI-DESIGN hand-offs to BOB

Entries `A<n>`, newest last. BOB reads past its cursor at takeover and each backstop check.

**Read by BOB** · through A2

## A1 · 2026-10-17 · Question 1 done: what exists
Record: `NOTES.md` §Q1 (sources, tables with requirement ids). Nothing decided; no product code touched; no secret read or written.

**Finding in one line.** The part of the assistant that matters most is already provider-neutral: the harness's control tables and fences, the worker's loop and plane-side checks, the run object and bounds, the credential and grant machinery, the account cascade shape (project, else member, else team; at limit refuses), switches, keep-away limits, sealing, and usage/limit counting. What is Anthropic's is one thin layer: the model call (`agent-model`: one endpoint, Messages-API shapes, Claude model ids and prices), the Claude Code runner and sign-in (`agent-runner`, the unbuilt remote route), the two account kinds (`apikey`, `signin`), and the words that name Anthropic in disclosures.

**What the design must add** (stated, not decided): no requirement has a place for a *provider id*; `usage` and `effort` are Messages-API-shaped; the sign-in-has-no-usd rule is tied to account kind; tool use and image input are assumed of every AI. These shape Q2 (which AIs can meet them) and Q3 (the boundary).

**Needs from BOB, none urgent:** (a) D14's AI bar is not stated in `rulings-active.md`; I will read it in `build/rulings.md` before Q3 unless told otherwise. (b) I read `build/terms/anthropic.md` and `words.json` next only for method (how terms are recorded), not for Anthropic content.

**Next:** Q2, candidate AIs, from providers' own latest pages, quoted with page and date; workers sonnet/medium. Open points are recorded as open (K3540).

## A2 · 2026-10-17 · Question 2 done: candidate AIs
Record: `NOTES.md` §Q2 (per provider: page, quote as relayed, date read; OPEN items listed), `OPTIONS.md` §Q2 (options and recommendation). No product code touched; no secret read or written; no bot protection worked around (openai.com policy and pricing pages, x.ai terms and privacy, returned 403 and stay OPEN).

**Surveyed:** OpenAI, Google Gemini, Mistral, Cohere, Cloudflare Workers AI and AI Gateway, Together, Fireworks, Groq, OpenRouter, xAI, DeepSeek. Anthropic excluded (K3717).

**Findings for BOB.**
1. Every provider's account is the team's own. Four terms bar resale or transfer of keys (Mistral, Fireworks, Together, OpenRouter) and others are silent on an app *holding* a customer's key; no page confirms it is allowed. This is the main legal OPEN. Proposed handling: record as open (K3540), restrict nothing, and have the design never rely on a Civicsmith-held shared key.
2. Cloudflare Workers AI is the one route needing no key from the team (the Worker's binding uses the team's own account); its models, prices, rate limits and no-training statement are confirmed from Cloudflare's pages, but per-model tool/JSON flags, response usage fields and Workers AI terms are OPEN. A multi-turn tool loop on premium models is limited to 20 requests per minute.
3. Only OpenRouter documents an app-facing OAuth flow giving a member a user-owned key.
4. Facts that bear on the boundary (Q3): usage fields differ across providers; Cohere and Groq (strict) cannot combine a schema with tools in one request; effort/caching exist only on some.
5. Two flags that are Bob's (policy): DeepSeek stores and processes data in the PRC under PRC law by its own text; Gemini's free tier uses data for training and human review.

**Question for Bob (via BOB), with recommendation.** Which ways may a team connect an AI: pasted key, sign-in flow, built in on the team's own Cloudflare? Recommendation: pasted key plus built-in Cloudflare first, sign-in flow where a provider documents one; no shared Civicsmith key. Options and tradeoffs: `OPTIONS.md` §Q2. Not urgent: Q3 proceeds without waiting, assuming "pasted key and built-in" as the working case.

**Needs a person:** the blocked terms pages (OpenAI, xAI) and counsel's read of the "app holds the customer's key" question; BOB to say whether to put them to Bob.

**Next:** Q3, the boundary (one neutral interface, one adapter per AI, cascade); first read K1364 and its named rulings, and the Capability Ladders "Labelled drafts" row, as BOB directed.
