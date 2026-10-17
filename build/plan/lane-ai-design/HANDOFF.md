# AI-DESIGN hand-offs to BOB

Entries `A<n>`, newest last. BOB reads past its cursor at takeover and each backstop check.

**Read by BOB** · through A5

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

## A3 · 2026-10-17 · Requirements for multi-AI support taken in
Record: `REQUIREMENTS.md` (the direction kept verbatim in §1; made specific as AIR1–AIR10, each with how it is checked and what today's design does; §3 research gaps; §4 questions for Bob; §5 effect on Q3–Q5). Nothing decided; no product code touched.

**For BOB.** (1) These need Bob's ruling as requirements (P17); §4 has the four questions with a recommendation each (adopt AIR1–10; personal subscriptions for a member's own use only where terms allow, with scope enforced; weaker AIs allowed and named; a dated, release-carried provider catalogue). (2) If the direction came from Bob in his own words, say so, so the verbatim text in §1 can be recorded in `build/rulings.md` as his (K1762: his words govern).

**Plan change (the lane's own).** Before Q3, run **Q2b**: plans and their terms per provider, session/caching facilities, model-by-model controls, signup and partner programs (`REQUIREMENTS.md` §3). Workers sonnet/medium. Q3 then designs a provider-neutral interface plus a plan-and-capability catalogue. Tell me if you prefer Q3 first.

## A4 · 2026-10-17 · Direction agreed in the lane session; Q2b started
In the lane session the person directing it wrote: "I agree with your recommendations for now, though this is a conversation in which they're bound to evolve." The lane treats AIR1–AIR10 and the four recommendations in `REQUIREMENTS.md` §4 as the **working bar, provisional and open to change**. That is not yet a K ruling: BOB to record it (as Bob's if it was his words) and to expect revisions. Q2b (plans and terms, sessions and caching, model controls, signup and programs) is running now; Q3 follows.

## A5 · 2026-10-17 · Q2b done: plans and terms, sessions and caching, model controls
Record: `NOTES.md` §Q2b (tables with sources and OPEN items), `OPTIONS.md` §Q2b. Nothing decided; no product code touched. Blocked pages (OpenAI policies and pricing, x.ai terms and /grok, Cloudflare Galileo) were not worked around and stay OPEN: a person must read them.

**Findings that matter.**
1. **The one plan class whose terms read as allowing a team's application to serve its own users is a pay-as-you-go API account owned by that team** (confirmed text at Google, Mistral, OpenRouter; OPEN at OpenAI, xAI, Cohere, Cloudflare). No provider confirms a consumer subscription may power an app; Google bars the CLI-OAuth pattern; OpenAI's Sign in with ChatGPT (preview) is the one documented route and its terms are unread.
2. **No documented referral or special-pricing arrangement for Civicsmith exists at any provider found**; programs found are unconfirmed (Google for Startups credits, OpenAI nonprofit chat seats, Cloudflare Galileo). AIR9's "special plans" therefore stays a future arrangement the catalogue can carry.
3. **Session design:** provider-held conversation state conflicts with zero data retention at OpenAI, xAI and probably Mistral; Groq has none. So the plane's run record stays the source of truth with append-only history and a neutral session key; provider state is an optional per-adapter optimisation (AIR7).
4. **Efficiency:** caching is automatic at most providers; batch is ~50% off at six; usage reports differ (cost only at OpenRouter). The harness needs neutral "session key", "cached tokens" and "reasoning tokens" fields.
5. **Effort/model controls are per model, not per provider**, and only xAI, DeepSeek, OpenRouter and Together publish prices or effort machine-readably; the catalogue is partly hand-vetted and dated.

**Needs from BOB.** Nothing new to decide. A2's three questions (connection ways, DeepSeek, free tiers) remain with Bob; Q2b adds a fourth for him when convenient: consumer subscriptions listed as "not available for use with Civicsmith" unless a provider documents a route (recommended). A person should read the blocked pages and counsel the "app holds the customer's key" point.

**Next:** Q3, the boundary: provider-neutral interface, plan and model catalogues, adapters, session and usage shapes, cascade. Will read K1364 and the Capability Ladders "Labelled drafts" row first.
