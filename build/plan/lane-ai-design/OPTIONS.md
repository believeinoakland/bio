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

## Q2b · Plans, sessions and caching, model controls (for AIR2, AIR3, AIR6–AIR9)

Facts: `NOTES.md` §Q2b. Working bar: Bob's provisional agreement to AIR1–AIR10 and the §4 recommendations of `REQUIREMENTS.md` (K3735); revisable.

### What a team can safely choose today, by plan class
| Plan class | Who may use it for Civicsmith (as read) | Product behaviour proposed |
|---|---|---|
| **API pay-as-you-go account owned by the team** (Google paid, Mistral, OpenRouter; others OPEN) | the account holder's application serving its own end users: confirmed text at Google, Mistral, OpenRouter | selectable at team, project and member level; the usual recommended class |
| **API free tier** | evaluation; data may be used or human-reviewed at Google and Mistral | offered only with a plain warning, off by default for team material; refused where the provider says "do not submit sensitive … information" (policy question A2-3 still with Bob) |
| **Consumer subscription** (ChatGPT, Gemini AI plans, Le Chat, Grok) | no provider confirms use through an app; Google bars the CLI-OAuth pattern; OpenAI's Sign in with ChatGPT is the one documented route (preview, "selected private apps") | member level only, and only where the provider documents a route; otherwise listed as "not available for use with Civicsmith" with the reason and source |
| **Business/team seats** (ChatGPT Business, Workspace, Le Chat Team) | shared use by the seat holders; app use OPEN | shown with scope "T, app use unconfirmed"; not offered until confirmed |
| **Built in via the team's Cloudflare account** | app serving others OPEN in what was read | working case for teams with no outside account (A2 recommendation), terms to be confirmed before it is the default |

### Design consequences (inputs to Q3)
1. **Plan catalogue as data**: provider → plans → {price basis, included, limits, scope (1/T/APP/OPEN), clause, source URL, date confirmed}. Scope is enforced by the account setter (AIR3).
2. **Model catalogue as data**: provider → models → {context, max output, price in/cached/out, capabilities, effort values and default, batch/priority options}; filled at build time from providers' models endpoints where they publish prices and effort (xAI, DeepSeek, OpenRouter, Together), otherwise from vetted, dated entries.
3. **Source of truth for session context is the plane's run record**, sent as append-only history with a provider-neutral `session key`; provider-held state (OpenAI, Gemini, xAI, Mistral) is an optional optimisation per adapter, never used where zero-data-retention is on or the team's keep-away limits forbid retention.
4. **Neutral usage record**: tokens in/out, cached, reasoning, cost where stated, null where not; derived price from the catalogue when the provider states none (as `agent-model` R13 does today).
5. **Efficiency levers to expose per adapter**: automatic cache (nothing to do but keep prompts append-only), explicit cache key (Mistral), batch for non-interactive work (50% at six providers; fits explore and extraction, not live asks), priority off by default.
6. **Signup (AIR9)**: links to the provider's own signup page and, where documented, OAuth (OpenRouter) or Sign in with ChatGPT (OpenAI). No provider documents a referral or special-plan arrangement for Civicsmith; special pricing remains a future arrangement the catalogue can carry once one exists, and nothing is promised before then.

### Still OPEN (need a person, a later retry, or counsel)
OpenAI terms and usage policies, ChatGPT pricing, SIWC terms and eligibility; xAI consumer/enterprise terms; Cloudflare Galileo page and civic credits; Cloudflare Workers AI terms and per-model licences; Cohere current Subscription Agreement; Vertex AI pricing and terms; Mistral consumer terms; Fireworks and Together data terms and team plans; Groq pricing and Services Agreement; streaming and tool-call-in-stream details for Mistral, xAI, Together, Fireworks, Groq, DeepSeek; Fireworks and Cloudflare reasoning controls; Cohere caching and batch.
