# AI-DESIGN options (per question: options, tradeoffs, recommendation)

The lane recommends; Bob decides policy, requirements, high-level architecture and UX (P17). Nothing here is ruled.

## Q2 · Which AIs are viable for a non-technical civic team

Facts: `NOTES.md` §Q2. Read it with its caveats (page summaries, OPEN items).

### The decision that shapes everything: how does a team "bring" an AI?
Plain version for Bob: today a team connects "Claude." With several AIs, each team (or project, or member) must connect *its own account* with some AI company, because every provider's terms we could read bar a platform from reselling or pooling access, and none say whether an app may hold a customer's key. There are three ways a team can connect.

| Way | How it feels | Fits | Problems |
|---|---|---|---|
| **A. Pasted key**: team pastes its provider key; Civicsmith seals it (as it seals keys today) | an admin makes an account elsewhere, copies a key | every API provider | non-technical teams must manage an account and billing elsewhere; each terms page is silent on an app holding the key (OPEN) |
| **B. Sign-in flow**: team clicks "Connect", approves, a key arrives | closest to today's sign-in | OpenRouter (OAuth PKCE, user-owned key) is documented; OpenAI's ChatGPT sign-in is a restricted preview | only one provider documents it |
| **C. Built in**: the team's own Cloudflare account serves the AI, no key | nothing to connect; billed on the team's Cloudflare bill | Cloudflare Workers AI, and Cloudflare AI Gateway BYOK | model quality/tool support narrower; per-model facts OPEN; Workers AI-specific terms OPEN |

### Candidate groups
1. **Hosted frontier models** (OpenAI, Google Gemini, Mistral, Cohere, xAI): strongest tool use and long context; paid account per team; data terms are good on paid tiers (no training stated), weaker on free tiers (Gemini free: human review and training).
2. **Open-weight models on a host** (Cloudflare Workers AI; Together, Fireworks, Groq): cheapest, several state no retention by default (Fireworks, Groq); tool use varies by model; Groq cannot combine strict schema with tools.
3. **Aggregator** (OpenRouter): one connection reaches many models; documents OAuth so a member connects without pasting a key; privacy depends on the routed provider unless the team forces `zdr` or `data_collection:"deny"`.
4. **Gateway** (Cloudflare AI Gateway): sits in the team's own Cloudflare account; BYOK, caching, rate limits and logs for whichever provider the team picks.

### Provider-specific flags for Bob (policy, not technical)
- **DeepSeek:** operator, storage and governing law are in the PRC (its own text). Whether civic teams may use it is a policy call; the lane suggests treating it as excluded unless Bob says otherwise.
- **xAI:** data processing region is not guaranteed on the default endpoint; operator country not confirmed.
- **Free tiers:** Gemini's free tier uses data for training; a rule that Civicsmith refuses unpaid tiers where the provider says so is a policy.

### Recommendation (for Bob, via BOB)
1. Design for **two connection ways at the start**: a pasted key (A) for any provider, and the built-in Cloudflare route (C) as the default for teams with no outside account. Add sign-in flow (B) only where a provider documents it (OpenRouter today). This keeps the choice among providers real without a provider-specific design.
2. Treat "which AIs" as **a list Civicsmith maintains, each entry carrying only facts that were confirmed**; an AI joins the list when it passes the small live tests (Q4). Initial pool for testing: Cloudflare Workers AI (gpt-oss-120b, llama-3.3-70b, kimi-k2.6, glm-5.3), OpenAI, Gemini, Mistral through the pasted-key route, OpenRouter through OAuth.
3. Do **not** offer a Civicsmith-held shared key serving many teams (every terms page we read bars the pattern or is silent).
4. Carry as policy questions for Bob when Q3 is ready: the free-tier rule; DeepSeek/xAI; whether a team may pick an AI whose data terms differ from the group's keep-away limits (the keep-away limits already bind every account: K2352).

### What this leaves OPEN (to close with the provider, a human reading in a browser, or counsel)
OpenAI terms and usage policies; xAI terms and privacy; Groq Services Agreement; Cloudflare Workers AI terms and model licences; per-model tool/JSON flags and response usage fields on Cloudflare; whether any provider permits an app to hold a customer's key. Closing these needs a person for the blocked pages; the lane never works around bot protection.
