# AI-DESIGN notes (sources read, quoted)

Newest section last. Quotes are from the files named; R-ids are each module's own. Documents were read whole by the lane or by sonnet-medium workers told to read whole (K3588); the workers' reports are summarised here, not copied.

## Q1 · What exists (read 2026-10-17)

### Sources read whole
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` (lane, whole).
- `build/requirements/`: `agent-runner`, `agent-harness`, `agent-worker`, `agent-model`, `ai-accounts`, `ai-use`, `ai-runs`, `credentials` (workers, whole).
- `build/rulings-active.md` (worker, whole; §1 and §3 are the focus).
- Not read, named as the next reads: `build/terms/anthropic.md`, `words.json` (member-facing sentences may say "Anthropic"/"Claude"), `ASSISTANT-PILOT.md`, `INVESTIGATIVE-SESSION.md`, `build/rulings.md` for D14's AI bar text (**not stated in `rulings-active.md`**; it appears only as "D14's AI bar" with the test-instance exception, line 26).

### What the canon fixes (provider-independent by its own words)
- Canon §1: "the construct is, above all, a set of BOUNDARIES that hold regardless of which model, prompt or vendor sits behind them." The assistant "introduces NO NEW TRUST BOUNDARY" (DEC-27); "THE LINE IS AUTHORSHIP, NOT WRITING".
- Four roles FIND / PURSUE / EXTRACT / CHECK (DEC-24); rules §3.1–12 (machine proposes, member authors; labelled as machine work; no machine credential performs an attested act; an AI never travels on a member's token; endpoint surface is the fence; refusals carry the plane's own label; what it reads vs. what enters the record).
- The canon says of the cascade (§6): "Which Claude account a run travels on is a cascade — member → project → instance", re-ruled K2352/K2353: "for a member's act, the project's account if it has one, with the project's limits; else the member's own, with the member's limits; else the group's, with the group's limits; ... one at its limit, or with that use switched off, refuses rather than passing the act on."
- Canon §8: the assistant's flow, wizard, prompt entry point, FIND end to end are DESIGNED (`ASSISTANT-PILOT.md`), not built; the investigative session (run object, bounds, log, checks) is built.

### Rulings in force (`rulings-active.md`)
- K3717/K3718: no Anthropic AI in the new direction; assistant not disabled; "Just don't put any more effort into getting it to work"; K3718(5): K3347's bar "read as about the Anthropic assistant it was ruled for; how each other AI is reached is the lane's to explore."
- Cascade (line 74): K1755/K1757/K1547/K2352/K2353/K3347; K2892 "A member's own sign-in runs check and plan for that member only".
- K3602 Choice A (line 70): "a member sees the assistant's progress (what it is reading, composing, checking) as it happens, and its answer only after Civicsmith's check; never unchecked words."
- K3061/K3060 (line 27): token held until revoked/dropped is allowed; "never raise U-2 or U-7 again" (Anthropic-specific).
- K1881 (line 18): protective limits added without asking; "a limit that changes what a member or group may do is Bob's."
- K1880 (line 71): reading public sites vs. record capture. K3472: "'team', never 'group', in any text people read, from T50" (code and requirements still say group).
- K3538/K3558/K3574: study method: every viable option understood and tested, bottom-up, "just trying to understand, measure, test".
- K2425/K3540: a terms point is raised only if confirmed from the latest provider text; an open point is not a problem until shown to be.

### Provider-NEUTRAL today
| What | Where |
|---|---|
| Control-flow tables, gate-mode, pass/stop rules, judgement fence, report shape/checks, plan flow, spawn contract | `agent-harness` R1–R16, R18–R19 (harness "names nothing of a vendor"; only R17 `remoteBrief` is conditional) |
| Worker loop: fanout/collect/compose/dedup/submit/adjust/close, bounds, no-model-sets-bounds, plane-side shape checks, tool allow-lists (`PLANE_OPS`, `ASK_OPS`), record text only in tool results, refusals never reworded, run log shape | `agent-worker` R1–R5, R7–R12, R17–R27, R37–R39, R43, R49–R55, R60–R63, R94–R105, R113–R118 |
| Run object, bounds (`fetches, subsessions, wallclock, runtime, mints, surfaces, proposals, lease`), one exit, lease/reap/wake, run log, mode admission, surfacing | `ai-runs` R9–R17, R24–R29, R31–R32, R40–R47, R77–R78, R81–R89 |
| Agent credential base (`organisation`/`member`, task scope, hash-only storage, expiry), run credential, ask/standing grants, keyed services | `credentials` R12–R15, R27–R29, R31–R32, R42, R53, R63 |
| Account cascade shape (project→member→group, first held-and-on is the one used, off ⇒ refuse never fall through), per-use switches (nine `USE_KINDS`), who may set, material limits (keep-away), disclosure-before-first-paid-act ordering, change history, sealing (AES-256-GCM, never exported) | `ai-accounts` R2–R4, R6–R7, R9–R17, R20–R34 |
| Usage counting, limits `{owner, scope, unit usd/tokens/calls, period}`, `useCheck` refuses at limit (fail closed), estimates, per-model/effort recording, explore gates | `ai-use` R1–R15 |
| Relay idea (the model's tool calls travel to the Worker, whose table decides every call) | `agent-runner` R3; `agent-model` R6–R7 |
| Run/log/trace/egress logging shapes | `agent-runner` R29–R31, R34, R39 |

### Tied to Anthropic today
| What | Where |
|---|---|
| Model call: Messages API at one `MODEL_ENDPOINT`, `x-api-key`, `cache_control`, `output_config.effort`, `stop_reason:"refusal"`, 429 `enforced_spend_limit_reached`, `search_result`/`image` block shapes, usage fields (`cache_read_input_tokens`, `cache_creation_input_tokens`, `total_cost_usd`) | `agent-model` R2–R5, R12, R14–R15, R19, R21; `ai-runs` R72 |
| Model ids and prices in requirements: `claude-opus-5-5`, `claude-sonnet-5-5`, Anthropic's published rates; `MODEL_FOR_MODE` | `agent-model` R1, R13, R19; `agent-worker` R98; `ai-runs` R88; `ai-use` R15 |
| Claude Code runner: unmodified Agent SDK in a container, built-in tools off, egress to Anthropic hosts only; sign-in via the binary (`claude setup-token`, OAuth code, `CLAUDE_CODE_OAUTH_TOKEN`) | `agent-runner` R1–R2, R4, R10, R16–R22, R27–R28, R30, R32–R33; terms gates R22–R23 |
| The remote route (a Claude Code cloud session reached through a tool door), unbuilt/conditional, "until the remote path works on a copy, that copy's assistant does not run" (K3610) | `agent-runner` R36–R40; `agent-worker` R109–R111 (R111 "not yet met: T50"); `agent-harness` R17 |
| Account kinds `apikey` and `signin` only; `subscription` retired. Group/project key "an Anthropic API key"; member's "Claude subscription"; subscription token 20–2000 chars; "Claude is today's only provider" | `ai-accounts` R1, R5, R7, R10, R18–R19; `agent-model` R2, R11; `agent-worker` R6, R32 |
| Member-facing notices naming Anthropic ("go to Anthropic under that account", D311) and refusal wording "connect their Claude account again" | `ai-accounts` R8, R12; `agent-worker` R82; `credentials` R66, R73 |
| Terms register and rules (AT-n, U-n; K3061 settled U-2/U-7) | `build/terms/anthropic.md`; rulings lines 27, 30 |

### Mixed (neutral idea, Anthropic-shaped content) — the design's real work
1. **Account `kind`**: `apikey`/`signin` mean "Anthropic API key"/"Claude sign-in"; no requirement has a place for a **provider id**, a per-provider endpoint, or per-provider connection flow (`agent-model` R10 assumes one `MODEL_ENDPOINT`).
2. **`usage` shape** inherited from the Messages API: cache fields and `total_cost_usd` may not exist for other providers; `null`-not-zero (`agent-model` R5) and `estimated_cost_usd` null-priced-at-highest-rate (R13) are the neutral hooks.
3. **Units**: `ai-use` R2/R10 say a sign-in has no `usd` ("`LIMIT_UNIT_UNAVAILABLE`") — ties the unit rule to account kind rather than to "does the provider report cost".
4. **`effort`** (`low…max`, `output_config.effort`) assumes every AI has such a dial.
5. **Tool use / relay**: harness and worker assume a model that calls tools by name with structured results; `agent-runner` R3 does it via in-process MCP tools; `remoteBrief` assumes an HTTP tool door. An AI without tool use fits only a degraded path.
6. **Image transcription and `read`** (`USE_KINDS` `transcribe`, `read`) assume image input.
7. **Disclosure** (D311): mechanism neutral (once, before first paid act); text names Anthropic.
8. **Run-credential revocation** on "sign-in cleared" (`credentials` R63/R73) presumes a per-member sign-in lifecycle.
9. **Group vs team wording**: K3472 says "team" in text people read; K3717 says "a team's, a project's, and a member's choosing"; code and requirements still say group.
10. **Where it runs**: `agent-worker` is a Cloudflare Worker with ~4,077 source lines, past the 4,000 limit (split is N1205); `agent-model` calls out from the Worker; the container route (`standard-1`) is Anthropic's.

### Bookkeeping found
- R35/R30 vs R109/R110 in `agent-worker` disagree until R35 is reworded (RUNNER vs REMOTE).
- Stale text: `agent-worker` R98 and `ai-runs` R88 hard-code Claude model ids in requirement text.
- `rulings-active.md` does not state D14's AI bar (read it in `build/rulings.md`/requirements before Q3's cascade is designed).
- Unbuilt/accepted-red by K3718(2): agent-runner R36–R38, R40; agent-worker R111; agent-harness R17; screens-settings R41; installer R56, R58; journey-check R19 (not re-verified here).

## Q2 · Candidate AIs (read 2026-10-17, by six sonnet/medium workers on the providers' own pages)

**Method and caveats.** Each worker fetched only the provider's own latest docs, pricing, terms and privacy pages. The fetch tool returns a model-written summary of a page, so quotes are "as relayed" and must be re-checked against the raw page before they go into any formal document or to counsel. A page showing no date is marked "no date shown". Anything not confirmed from the provider's current text is **OPEN** and restricts nothing (K3540, K2425). Pages blocked by bot protection were not worked around: openai.com policy/pricing pages (403), x.ai terms and privacy (403). One Cloudflare docs page contained text aimed at the reader as an instruction; the worker ignored it (nothing acted on).
Prices are USD per 1M tokens (input / cached input / output). Model names are as the pages gave them.

### OpenAI
- Connect: API key, bearer; org/project headers choose the billing project. https://developers.openai.com/api/docs/api-reference/authentication (no date shown): "The OpenAI API accepts bearer credentials from API keys or from short-lived access tokens."
- **Sign in with ChatGPT (preview)**: an app may ask to use the user's Plus/Pro plan for eligible Responses calls; "open-source projects, personal projects that run locally, and selected private apps" at launch; plan use "only for the application they connected"; users cannot pool or resell; app cannot charge users for it (from search snippet of the terms; terms page 403). https://developers.openai.com/siwc/token-sharing-open-source (no date shown). Preview limits: `store:false`, `stream:true`, no `max_output_tokens`/`temperature`, no hosted MCP. **OPEN:** whether a hosted multi-user app qualifies.
- Tools: strict function calling with JSON schema; images in (PNG/JPEG/WEBP/GIF). https://developers.openai.com/api/docs/guides/function-calling.
- Models (https://developers.openai.com/api/docs/models, no date shown): gpt-6-astra 1.05M ctx / 128K out, $10 / $1 / $50; gpt-6.1-sol $2 / $0.10 / $10; gpt-6-luna $0.10 / $0.01 / $0.50 (pricing page, ≤272K).
- Limits: headers `x-ratelimit-*`, `Retry-After`; 429 `rate_limit_error`; hard monthly spend limit makes requests return 429 (rate-limits guide).
- Data: "data sent to the OpenAI API is not used to train or improve OpenAI models"; abuse logs "up to 30 days"; ZDR by approval (https://developers.openai.com/api/docs/guides/your-data). Residency per project; regional processing +10%. **OPEN:** default retention of stored Responses; terms and usage policies (403); per-response usage fields.

### Google Gemini
- Connect: API key from AI Studio, billed per project/billing account (https://ai.google.dev/gemini-api/docs/api-key, updated 2026-10-06; billing page updated 2026-09-28). OAuth documented "appropriate for a testing environment". **OPEN:** production OAuth for end users; consumer subscriptions for apps (nothing says yes).
- Tools: function calling with modes `auto/any/none/validated`, parallel and compositional; thought signatures must be passed back in a hand-written loop on Gemini 3 (https://ai.google.dev/gemini-api/docs/function-calling). Structured output: JSON Schema "available only to Gemini 3 series models" (updated 2026-10-13). Images up to 3,600 per request.
- Models (https://ai.google.dev/gemini-api/docs/models, updated 2026-10-13): gemini-4-argon 1,048,576 ctx / 65,536 out (up to 1,048,576 with long decode); gemini-3.8-flash same. Pricing (updated 2026-10-16): Argon $2 / $0.10 / $10 until Nov 30 then $4 / $0.20 / $20; 3.8 Flash $0.75 / $0.075 / $3.75 until Dec 31 then $1.50 / $0.15 / $7.50. Announced increases.
- Limits: RPM/TPM/RPD "applied per project, not per API key"; no rate-limit headers found; 429 `RESOURCE_EXHAUSTED`.
- Data (https://ai.google.dev/gemini-api/terms, updated 2026-04-28): free tier "human reviewers may read, annotate, and process your API input and output"; paid: "Google doesn't use your prompts" to improve products; logged "for a limited period". Vertex AI: no training without permission; caches ≤24 h.
- Residency: Developer API **OPEN**; Vertex regional endpoints.
- Terms: developers only, 18+, available regions only; EEA requires paid services; **OPEN:** end users' own keys, an app holding keys for several teams.
- Usage: `promptTokenCount`, `cachedContentTokenCount`, `candidatesTokenCount`, `toolUsePromptTokenCount`, `thoughtsTokenCount`, `totalTokenCount`.

### Mistral AI
- Connect: keys scoped to a workspace; admin and member roles; inactive until a payment method is on file (https://docs.mistral.ai/admin/quickstarts/manage-workspaces, no date shown). Fits team = organisation, project = workspace.
- Tools: `tool_choice auto/any/none`, parallel; app drives the loop. Structured output on Large 4 (Public Preview, Oct 6 2026); schema limits **OPEN**. Vision on several models.
- Models: Large 4 1M context; **OPEN:** max output, other models' contexts. Large 4 $0.68 / $0.07 / $2.09 shown as sale price (list $1.36 / $0.14 / $4.18).
- Limits: per model RPS and TPM, viewed in Admin; spend cap returns 429; scope **OPEN** (sources conflict).
- Data: ZDR available; "You do not need ZDR to opt out of model training"; Commercial Terms (effective 2026-09-25) §4.2 no training "except" listed cases incl. Labs/Preview models. **OPEN:** default retention; region.
- Terms §2.2(h): no "buy, sell, or transfer API keys or any type of Mistral AI account from, to, or with a third party"; §2.2 pass-down to end users. Admin usage API is Enterprise only.

### Cohere
- Connect: organisation-level; production key needs an Owner to accept the SaaS agreement; trial keys not for production (https://docs.cohere.com/docs/going-live). No project construct found.
- Tools: sequences and parallel calls; **`response_format` json_schema "not supported in combination with the `documents` or `tools` parameters"**. Vision on command-a-plus-05-2026 and others.
- Models (https://docs.cohere.com/docs/models, no date shown): command-a-plus-05-2026 128k ctx / 64k out; command-a-03-2025 256k / 8k. Pricing page lists only older models (Command R+ 08-2024 $2.50 / $10). Newer-model production limits via sales.
- Limits: trial 20 req/min, 1,000 calls/month; production 500 req/min on listed models.
- Data (https://cohere.com/data-usage-policy, updated 2025-12-05): "We automatically delete logged prompts and generations after 30 days"; training opt-out in dashboard; **OPEN:** default for API; SaaS agreement (2025-04-08) lets Cohere use customer data "to improve and enhance the services" (legal read needed). Hosting: US-Central (search snippet).
- Terms: Permitted Users are the customer's employees/contractors; credentials are Cohere's confidential information; a shared platform key "likely a breach" (worker's reading; counsel to confirm).
- Usage: `usage.billed_units`, `usage.tokens`, `usage.cached_tokens`.

### Cloudflare Workers AI and AI Gateway
- Connect: **Workers binding `env.AI`, no key**: "Using Workers AI always accesses your Cloudflare account" (https://developers.cloudflare.com/workers-ai/get-started/workers-wrangler/, updated 2026-08-27). Also REST token and OpenAI-compatible `/v1/chat/completions` (updated 2026-09-18). Per-project/member credentials **OPEN** (binding is account-wide).
- Models (https://developers.cloudflare.com/workers-ai/models/, updated 2026-08-12): gpt-oss-120b, llama-3.3-70b-instruct-fp8-fast, llama-4-scout, mistral-small-3.1, qwen3, kimi-k2.6, glm-5.3, deepseek-v4 and others. Tool/JSON flags per model **OPEN** (read from the catalogue at build time). Contexts: gpt-oss-120b 128,000; llama-3.3-70b 24,000; kimi-k2.6 262.1k; glm-5.3 1M. `max_tokens` default 256.
- Pricing (updated 2026-10-15): "10,000 Neurons per day at no charge"; paid $0.011 / 1,000 Neurons; gpt-oss-120b $0.35 / – / $0.75; llama-3.3-70b $0.293 / – / $2.253; kimi-k2.6 $0.95 / $0.16 / $4.00 (needs paid billing). Payer: the team's Cloudflare account.
- Limits (updated 2026-09-17): text generation 300 req/min for most models; **20 req/min** for models needing Workers Paid (50 with prepaid gateway credits).
- Data (https://developers.cloudflare.com/workers-ai/platform/data-usage/, updated 2026-10-16): "Cloudflare does not use Customer Content processed by Workers AI to train AI models." Residency: Regional Services ✘, Customer Metadata Boundary ✅; actual inference location **OPEN**.
- Terms: Workers AI-specific terms and per-model licences (Llama, Gemma …) **OPEN**. Response `usage` fields **OPEN**.
- **AI Gateway** (https://developers.cloudflare.com/ai-gateway/): caching, rate limiting, logs, unified billing (5% credit fee; OpenAI, Anthropic, Google, xAI, Groq …), **BYOK in Secrets Store with `cf-aig-byok-alias` per key** (updated 2026-09-22). Core features free.

### Together AI · Fireworks AI · Groq · OpenRouter (open-weight hosts / aggregator)
- Together: key per project (https://docs.together.ai/docs/quickstart); tools and JSON mode, no reliability figures; terms (2026-05-19) §4.3(d) "resell, lease, license, or assign the Services"; §4.1 no "financial or medical information"; ZDR by opt-out toggle; training only with opt-in; usage `prompt/completion/total_tokens`.
- Fireworks: key; "Fireworks has Zero Data Retention by default"; terms (2026-07-10, raw text) 3.4(d) no "buy, sell or transfer API keys without our prior written consent", 3.4(e) no resale; 3.6 no training on Content; spend tiers, 80% warning, requests pause at 100% of monthly limit; context windows **OPEN**; usage includes cached and reasoning tokens.
- Groq: key per organisation; "All models hosted on Groq support tool use"; **strict structured output not combinable with tool use or streaming**; limits RPM/RPD/TPM/TPD with `x-ratelimit-remaining-*`; "By default, Groq does not retain customer data for inference requests"; customer data in US GCP; pricing page and Services Agreement **OPEN**.
- **OpenRouter**: the only one documenting an app-facing **OAuth PKCE** flow that returns "a user-controlled API key" (https://openrouter.ai/docs/guides/overview/auth/oauth, no date shown); "Inference is billed at the provider's list price"; 5.5% fee on credit purchase; terms (2026-08-31) 7(4) bars "reselling API access to Models"; "OpenRouter does not use your Inputs or Outputs for model training" but "Some Model Providers may use" them; per-request `data_collection:"deny"` and `zdr:true` routing filters; a request can be rejected 402 on estimated in-flight cost; usage includes `cost`, `is_byok`.

### xAI and DeepSeek
- xAI: team-level billing, prepaid or invoiced; tools with parallel calls; structured outputs with tools only on Grok 4 family; models 500k–1M ctx; grok-4.7 $2 / $0.50 / $6; "all API requests and responses are stored on our servers … for 30 days"; "never trains on your API inputs or outputs without your explicit permission"; default endpoint "does not guarantee a processing region", US endpoint covers only two models; terms and privacy 403 (**OPEN**); operator country **OPEN** (docs name "SpaceXSI").
- DeepSeek: operator "Hangzhou DeepSeek Artificial Intelligence Co., Ltd."; Terms "governed by the laws of the People's Republic of China"; Privacy Policy: "directly collect, process and store your Personal Data in People's Republic of China"; inputs may train models with opt-out (API coverage **OPEN**); 1M ctx; deepseek-flash $0.15 / $0.003 / $0.6 off-peak; tools `function` only, `json_object` only.

### What the sources say across providers (facts, not recommendations)
1. **Every provider's key is the team's own account.** None document a way for Civicsmith to hold one account that serves many teams; three terms (Mistral §2.2(h), Fireworks 3.4(d), Together 4.3(d), OpenRouter 7(4), Cohere SaaS) bar resale or transfer of keys/access. Civicsmith holding a key a team set is not addressed by any of them: OPEN everywhere.
2. **Cloudflare is the only route needing no key from the team**, because every team's copy already runs there.
3. **Training:** stated "no training" by default: OpenAI API, Cloudflare Workers AI, Mistral (outside preview), Fireworks, xAI, Together (opt-in), OpenRouter (own), Groq (unaddressed, OPEN). Free tiers differ: Gemini free tier is reviewed by humans and used for training.
4. **Tool use plus schema in one call** is not supported by Cohere or Groq (strict); Gemini's schema works with tools only on Gemini 3.
5. **Usage shape varies:** token counts exist everywhere; cached-token and cost fields differ (OpenRouter `cost`, Cohere `billed_units`, Gemini `thoughtsTokenCount`). Cloudflare's response fields are OPEN.
6. **Residency:** only Vertex, OpenAI (per project, +10%), xAI (US endpoint) and Cloudflare (metadata boundary) document anything; DeepSeek is plainly PRC.
7. Consumer-subscription routes: only OpenAI's Sign in with ChatGPT preview exists, and its terms bar the pattern Civicsmith would need unless approved (OPEN).
