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

## A6 · 2026-10-19 · Bob's evidence process taken in: `PROCESS.md`, AIR11–AIR16
Record: `PROCESS.md` (his words verbatim in §1; three phases design / release / team-and-member; Gate 1 conformance suite; characterization with a method and grade for each of his seven properties incl. "uptime 9s"; the non-gameable team test and the encrypted bundle; the sample accounts to ask providers for), `REQUIREMENTS.md` §6 (AIR11–AIR16). No product code; nothing decided; no test run (each needs BOB's agreement first).

**For BOB.** (1) Record his words as his (K1762) and AIR11–16 as provisional like AIR1–10 (K3735). (2) Four questions to Bob in `REQUIREMENTS.md` §6, with recommendations: adopt AIR11–16; accept scoring on Civicsmith's side (Civicsmith receives synthetic-only transcripts and holds the bundle's private key); thresholds set by Bob after the suite is measured; sample accounts in the order in `PROCESS.md` §6 (Cloudflare, OpenRouter, one direct frontier account each, one open-weight host, one local endpoint), asking each provider for trial credit, **written** confirmation of its OPEN terms points, and any civic program.
**Design points worth Bob's eye.** (a) A team's copy runs on the team's own Cloudflare account, so anything it runs could be altered: the design therefore keeps answers and scoring on Civicsmith's side and grades team results *Reported* until Civicsmith reproduces them; it cannot stop a fabricated transcript outright and says so. (b) Uptime cannot be proved by a few tests; it is shown as SLA text, status-page history, or Civicsmith probes, each with its period. (c) "Local" models need a reachable address (a tunnel); a Worker cannot reach a machine's localhost.

**Next:** Q3 (boundary), now including the evidence side (catalogue entries with grade, source, date; adapters exposing raw exchange, request ids and usage; an OpenAI-compatible-endpoint adapter), then Q4 as "define the suite and procedures", Q5 including the test-and-send screen. First: K1364 and the "Labelled drafts" row.

## A7 · 2026-10-19 · Bob's sealed-container idea worked into `PROCESS.md` §8 (lane branch only)
Bob's refinement: team-run AI tests run in a locked Civicsmith container that also generates and seals the results bundle. `PROCESS.md` §8: the container design (it reuses the `agent-runner` pattern: digest-pinned image, egress allow-list, nothing persisted), who runs it (three options X team's account / Y Civicsmith's account / Z team's machine for local models), findings, and a provisional recommendation. Key finding: a seal inside the container protects against outsiders but not against the team that owns the host, and running it in Civicsmith's account makes Civicsmith a holder of teams' provider keys, which several providers' terms bar or do not address. Recommendation: X (and Z) for outside teams, graded Reported; Y only on Civicsmith's own sample accounts, graded Reproduced. Work stays on `lane/ai-design`; nothing pushed to any tranche or BOB branch (Bob, 2026-10-19). Nothing decided.

## A8 · 2026-10-20 · Bob: the offered list is closed and privacy-gated (AIR17–AIR19, Gate 0)
Recorded: `REQUIREMENTS.md` §7 (AIR17 closed vetted list; AIR18 entry = (model, host), host pinned, aggregator routing locked; AIR19 privacy requirements written, versioned, evidence-based), `PROCESS.md` §9 (Gate 0 privacy before Gate 1 and characterization; draft eight-point checklist). Lane branch only. Nothing decided.
**For BOB / Bob:** (1) The checklist's content is Bob's policy; the draft is the lane's. (2) Question: may a team use its own unlisted (e.g. local) endpoint with the assistant before a release includes it, or only through the test flow? Recommended: only through the test flow, keeping the list closed. (3) Open technical point to test, not assume: whether OpenRouter responses reliably name the serving host, which AIR18's "refuse a response from a non-vetted host" depends on.

## A9 · 2026-10-20 · Bob's answers to A8; OpenRouter host-naming check (documentation only)
**Bob (2026-10-20, in the lane session): both A8 questions "as recommended".** Recorded as provisional working bar (BOB to record as K): (1) a team's own unlisted/local endpoint may be used with the assistant only through the test flow until a release includes it, keeping the offered list closed; (2) verify by test, not assumption, whether OpenRouter responses reliably name the serving host.
**Documentation check for (2), read 2026-10-20** (https://openrouter.ai/docs/api-reference/overview and https://openrouter.ai/docs/guides/routing/provider-selection, no dates shown; fetch tool summarises, quotes as relayed): the response schemas list `id, choices, created, model, object, system_fingerprint, usage` and **no documented field naming the serving provider**; `model` "could also be" a different model than requested; response headers are not documented; `/api/v1/generation` by `id` exists but its fields are on a page not read (OPEN); `only` is "List of provider slugs to allow for this request"; `allow_fallbacks:false` is documented as guaranteeing the *top-ranked* provider serves only in the context of ordering; **whether `only:[X]` with `allow_fallbacks:false` guarantees no other host is not stated** (OPEN).
**Consequence.** AIR18's "refuse a response from a non-vetted host" cannot yet rely on the response alone. Two things to test live (a test needing an OpenRouter account, proposed here for BOB's agreement per charter): (a) read the Generation API reference and test what it reports for a finished request; (b) send a pinned request to a host forced to be unavailable and confirm the request fails rather than falls through. Until proven, an OpenRouter entry does not pass Gate 0 point 6.

## A10 · 2026-10-21 · Bob's summary picture recorded (AIR20–AIR22); gaps list given
`REQUIREMENTS.md` §8 (verbatim, AIR20–AIR22). Bob asked what the two brainstorming sessions cover that his three bullets omit; the lane answered in the session from its own record (it cannot see the other session). Points that need BOB/Bob: (1) centrally consolidated bundles that teams can access need a Civicsmith-run issuer, intake and results library, which do not exist, plus a rule for what teams see (summaries and grades, not raw transcripts); (2) "subscription" support is only as real as each provider's terms: no provider confirms a consumer subscription may power an app, OpenAI's Sign in with ChatGPT preview is the one documented route, Google bars the CLI-OAuth pattern.

## A11 · 2026-10-21 · Anthropic included; AIR23–AIR29 (drift, switching, cost, budgets, outages, UX requirement)
Recorded `REQUIREMENTS.md` §9 with Bob's words. **Correction to earlier entries:** NOTES §Q2 and A2 excluded Anthropic (K3717); Bob now includes it as a provider like any other. Q2c (Anthropic's plans and terms from its own pages, building on `build/terms/anthropic.md`) is needed before its Gate 0 entry. **Rulings for BOB to reconcile (the lane decides none):** K3717's exclusion; K3347's "no API-key support" (now relevant again); K2352/K1755 "refuses, never passing the act on" versus an owner-declared failover order (AIR25/AIR27). The lane's proposals are in the requirements; the plain-words list of open issues was given to Bob in the session.

## A12 · 2026-10-21 · Bob's answers to the eleven open issues; AIR30–AIR36
Recorded in `REQUIREMENTS.md` §10 (his words, provisional). New requirements: guided connection (AIR30), free-tier warning-and-accept (AIR31), credential references not just holding (AIR32), catalogue available independent of releases (AIR33), subscription restrictions as data (AIR34), interim origin policy (AIR35), central results service modelled on filing templates (AIR36). Sequencing for BOB: OpenRouter adapter first (with sign-in and host pinning), then the open OpenRouter tests through it. **Lane readings to confirm (BOB/Bob):** AIR35's scope (developer, not host), AIR36's analogy. **Research still to run (workers, sonnet/medium):** Q2c, latest fine print on subscription plans and Anthropic; Q-secrets, how teams can refer to a token in a password or secrets manager from a Worker. Documents Bob will fetch are listed in the session reply.

## A13 · 2026-10-21 · Bob's documents read; failover ruled allowed; AIR37–AIR38
`NOTES.md` §Q2c (OpenAI OSA/Service terms/ToU/Usage policies/SIWC/plans/API prices/nonprofits; xAI Enterprise and Consumer terms and privacy policy; Cloudflare Galileo). `REQUIREMENTS.md` §11: **Bob ruled ordered failover allowed** (K2352 exception; BOB to record as K), AIR37 (plans state allowed runtime and token location), AIR38 (binding terms as catalogue evidence). Key findings: (1) OpenAI's Sign in with ChatGPT is the sanctioned subscription route but needs a member-controlled runtime and forbids tokens in "a remote or managed environment", so a shared team Worker cannot hold it; (2) neither OpenAI's nor xAI's enterprise terms say whether a vendor may hold a customer's own API key (NOT ADDRESSED); both allow an app for the customer's end users with pass-through terms and broad customer indemnity; (3) OpenAI's usage policies bar campaigning/lobbying and automated high-stakes decisions without human review, which touches civic work; (4) Galileo gives no AI credits; (5) the file named `Groq prices.pdf` is a Grok screenshot, a Groq capture is still needed. Missing documents are listed at the end of the §Q2c notes.

## A14 · 2026-10-21 · Groq read from its own docs
`NOTES.md` §Q2c now includes Groq (Services Agreement 2026-06-22, AUP, DPA, model prices). No document needed from Bob. Notable: a third party holding a customer's key is NOT ADDRESSED, as at OpenAI and xAI; Groq's deprecations page and models page contradict each other on retired Llama models (a concrete drift example for AIR24); customer indemnity is uncapped. Still needed from Bob: the OpenAI and xAI documents listed in A13, plus the Anthropic gap list once the lane has checked the register.

## A15 · 2026-10-21 · Second batch of documents read (OpenAI API pricing, xAI AUP)
`NOTES.md` §Q2c addendum. Notable: a long-context price tier exists at OpenAI (input 2×, output 1.5× of short-context) which raises the cost of long-context probes; xAI's AUP bars "unauthorized automated … means, whether through a bot, script, or otherwise" and scraping or reselling Input or Output, so consumer-subscription use by an app is not supported by xAI's text; no political or election section. Documents Bob could not obtain stay OPEN. A worker is reading `build/terms/anthropic.md` to list Anthropic's gaps.

## A16 · 2026-10-21 · Anthropic's terms register read; gap list
`NOTES.md` §Q2d. The register covers Claude Code, Agent SDK, sign-in and key handling only; it does not cover retention, training, ZDR, residency, Usage Policy, SLA, deprecation, price changes or privacy/DPA, which Gate 0 needs. Tension recorded without a decision: AT-17 ("may not collect, store, or intermediate Claude.ai credentials or session tokens") versus K3061 (Bob: holding the token is allowed). The register itself needs K3061 added and U-2/U-7 updated (BOB/jobs, not this lane). Lane will read the Anthropic pages that load without a login via workers; Bob's capture only where blocked.
