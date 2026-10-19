# AI provider support: the evidence process

**Status.** Drafted 2026-10-19 by AI-DESIGN #1 from Bob's description of the process (kept verbatim in §1). A proposal for BOB and Bob; nothing in it is ruled. It adds requirements AIR11–AIR16 (see `REQUIREMENTS.md` §6) and sets the question order for Q3–Q5.

## 1 · The direction, verbatim
> At a high level, Civicsmith's purpose is to separate evidence-based facts from narrative. So the means by which a team or member choose an AI provide for their assistant must also be evidence-based.
> So it seems to me that there are several steps involved in adding support for an AI provider's plans to Civicsmith, and another set of steps involving in presenting the supported options to teams/members and supporting their use of their provider of choice. Something elements are part of the initial design and development processes we're doing now. Some happen during release updates, and some happen with the involvement of teams/members.
> - We are designing AI provider support that meets the list of requirements that we're building.
> - The AI provider support will be broad enough to support all legitimate available plans, whether they're open models or proprietary, cloud, hosted, or local.
> - The first gate an AI model must meet is that it must be capable of meeting Civicsmith's requirements and metrics, which we're beginning to define in this lane.
> - Those models that meet the grade through this first gate also need to be characterized based on a number of service level properties that include: session start costs/time; average turn latency; privacy, training terms; operational consistency, reasonableness; individual, team, enterprise limitations; context window size; all-in cost of performing standardized comparison tasks; uptime 9s
> - Determining whether a model meets the first gate requirements, and determining the properties of a service likely require at least a sample account for use during configuration and testing. I'll start by contacting several candidate providers about a trail account for these purposes. But there also need to be a means for outside Civicsmith teams/members to configure and test other provider plans that I haven't yet tested. Those tests must be run under Civicsmith control, with no opportunity for the results to be gamed. There should ideally be a means of forwarding the results of these tests in a standard encrypted bundle to me so that I can compare them and choose whether to include those AI service options in the next Civicsmith release.

## 2 · The process in three phases
Every statement the product makes about an AI is one of three grades, shown as such (the way the record grades sources): **Reproduced** (Civicsmith ran the test itself on an account it controls and kept the transcript), **Reported** (a team's test bundle, or a provider's own page, not yet reproduced), **Stated** (taken from the provider's text, with the page and date). Nothing is shown as a fact without its grade, source and date.

| Phase | When | Who | Steps |
|---|---|---|---|
| **A. Design and build** | now | the lane, BOB, Bob | define the requirements (AIR1–16), the conformance suite and the characterization measures; build the provider-neutral interface, catalogue schema, test harness and bundle format |
| **B. Release** | each release | Bob decides, BOB/jobs build | intake a candidate → Gate 1 → characterize → Bob's inclusion decision → the release carries the catalogue entry **with its evidence record** |
| **C. Team and member** | at runtime | team leader, member | see the included options with their evidence and plan scope; choose, connect, use; **or** run Civicsmith's test on a provider/plan not yet included and send the encrypted bundle to Bob |

### Phase B in steps (the same steps for any provider, open or proprietary, cloud, hosted or local)
1. **Intake (Stated).** Provider, plan(s), models, the terms clauses on who may use the plan and for what, privacy/training terms, limits, prices; each fact with its quote, page and date; unconfirmed = OPEN. Ask the provider for **written confirmation** where the terms are OPEN (e.g. "may a team-owned account serve its members through an application?"); a written answer is stronger evidence than a reading.
2. **Gate 1 · Can it do the work (Reproduced).** A fixed, versioned **conformance suite** run against the model through its adapter; pass/fail by code against known answers (§3).
3. **Characterize (Reproduced where measurable, otherwise labelled).** The service-level properties of §4, measured over a fixed number of repeats on the plan.
4. **Decision.** Bob compares evidence records and decides what joins the release (policy). A model that fails Gate 1 may still be listed as "not suitable for: <roles>" with its results if Bob chooses.
5. **Release.** The catalogue entry, the suite version and the evidence record ship in the release and are shown to teams. Entries older than a set age display "last confirmed <date>".

## 3 · Gate 1: the conformance suite (first draft of what is measured)
Principles: every item has a known answer or a code check; the plane's own checks do the scoring wherever they exist (labels, citation resolution, schema validity), so the suite uses the real fences; no item depends on a human judging prose.

| Group | What is shown | Check |
|---|---|---|
| G1 Tool use | calls named tools with valid arguments over multi-turn loops; handles parallel calls and error results | arguments validate against the tool schemas; run reaches the expected end state |
| G2 Structured output | returns the report shapes the harness demands (`checkReport`) | `checkReport` passes |
| G3 Grounding | answers only from supplied records; every claim cites an existing address; never invents a quote | the plane's citation-resolution and quote-in-document checks (canon §3 rules 1, 3, 9) |
| G4 Restraint | does not conclude, attest, accept or choose the question; obeys the fence when told to ignore it | no refused act attempted; injected instructions inside record text are ignored (R62) |
| G5 Reading | long-context recall at the stated window (needle placed at several depths); image transcription where the role needs images | exact-match against fixtures |
| G6 Consistency | the same task repeated N times: answer-set agreement, error rate | statistics over N |
| G7 Honest uncertainty | says "not found" when the record lacks the answer | expected absence answers (D-129 vocabulary) |
| G8 Efficiency | tokens and cost for the standard tasks; effect of caching/session reuse | recorded, compared across providers |

Result per role: **passes / passes with limits / not suitable** (e.g. serves ask and draft but not investigate). Thresholds are Bob's to set once the suite exists; the lane proposes them with the measured spread (Q4).

## 4. Characterization: how each property is measured or evidenced
| Property | Evidence | Grade |
|---|---|---|
| Session start cost/time | fixed system prompt + tool set + pack: input tokens, cost and time to first token on a cold session, and on a warm cached one | Reproduced |
| Average turn latency | median, 90th percentile and spread over N standard turns, same region/time-of-day stamp | Reproduced |
| Privacy and training terms | quote, page, date; data retention, training, human review, ZDR availability, residency; written provider confirmation if obtained | Stated (or Reported, if written confirmation) |
| Operational consistency / reasonableness | G6 results plus error and 429 rate, truncation and refusal rate, and answers a reviewer judged unreasonable on a fixed sample | Reproduced |
| Individual / team / enterprise limitations | plan scope (1 / T / APP / OPEN) with the clause | Stated |
| Context window | the stated window and the **effective window** measured by G5 | Stated + Reproduced |
| All-in cost of standardized tasks | measured tokens × catalogue price, reconciled with the provider's own billing/usage figures; includes retries and any session start | Reproduced |
| Uptime ("nines") | cannot be proved by a few tests; evidence is (a) the provider's published SLA text, (b) its status-page history for a stated period, (c) Civicsmith's own periodic probes over a stated window; each shown with its period, never as a bare "99.9%" | Stated / Reported / Reproduced, labelled |

## 5 · Phase C: team and member testing of unlisted plans, built so results cannot be gamed
The team's copy runs on the team's own Cloudflare account, so the lane assumes the team could change anything running in it. The design therefore **does not trust the team's copy to score itself**; it makes tampering visible and puts the answers where the team cannot reach.

1. **Civicsmith owns the test.** The suite, its fixtures and its harness are shipped signed and versioned in the release; the test screen only runs that version. The team supplies only the provider endpoint, key, plan and model to be tested.
2. **Synthetic inputs only.** Test content is Civicsmith's fixtures; no team record, member data or key goes into a bundle. The team sees exactly what will be sent and approves it.
3. **Answers stay with Civicsmith.** The copy sends fixtures and records the **raw exchange** (request and response bodies, response headers including the provider's request ids and rate-limit headers, usage figures, timings). **Scoring happens on Civicsmith's side** from the raw transcript against answers the copy never held. The copy's own pass/fail, if shown, is labelled "preliminary".
4. **Fresh items.** Each run draws from a larger item bank by a challenge nonce, so a team cannot learn the items; the nonce and bank version are in the bundle.
5. **Tamper evidence.** The bundle records the harness version hash, the nonce, the order and timing of calls, and the provider's own request ids and usage figures so a reviewer can cross-check them against the provider's billing. A bundle that does not reconcile is marked "unverified", never "failed".
6. **Everything is a claim until reproduced.** A bundle is **Reported**. It moves to **Reproduced** only when Civicsmith runs the same suite on an account it controls. Bob decides which Reported plans merit a reproduction run (needing a sample account, which is why he is contacting providers).
7. **The bundle.** One standard file: a manifest (suite and harness versions, nonce, date, provider, plan, model, region), the raw transcripts, the measured properties, the team's declared plan scope and the terms page they relied on. It is encrypted to Civicsmith's public key (a sealed box; the team's copy never holds the private key), carries no secrets, can be downloaded and sent by any route, and can be inspected by the team before sending (decrypting is impossible for them after sealing, so they are shown the plaintext manifest first). Whether a direct "send to Civicsmith" upload is built is a separate question: a download-and-send path needs no Civicsmith service.
8. **Honest limit.** A determined team that fabricates transcripts cannot be fully stopped without the provider's cooperation; the answer is step 6 (Reported is not Reproduced), provider request ids that can be checked, and, if a provider offers it, provider-signed usage statements.

## 6 · Sample accounts: what the lane needs from Bob's outreach
Nothing is run until BOB agrees each test (charter). The lane proposes this order and the one thing to ask for in each case, so Bob's contacts yield evidence:
1. **Cloudflare Workers AI** (the team's own copy runs there): needs no new account; confirm Workers AI terms for application use and per-model tool/schema support.
2. **OpenRouter**: one account gives access to many hosted and open-weight models for early Gate 1 comparison; the routed provider (not OpenRouter) holds the data, so latency and privacy must also be re-tested direct.
3. **One direct account each at a frontier hosted provider** (OpenAI, Google, Mistral), and **one open-weight host** (Groq, Fireworks or Together).
4. **A local model** (e.g. a team's own machine or server with an OpenAI-compatible endpoint): needs a reachable URL (a tunnel, since a Worker cannot reach a machine's localhost); proves "local" support.
Ask each provider for: trial credits or a test plan; written confirmation of the terms points that are OPEN (app use by a team-owned account, key handling, data use); and any program for civic teams.

## 7 · What this changes in the lane's work
- **Q3 (boundary)** now also covers the evidence side: catalogue entries carry grade, source and date; adapters expose what the suite and bundle need (raw exchange, request ids, usage); local/OpenAI-compatible endpoint adapter.
- **Q4 (testing)** becomes "define the suite, the thresholds and the characterization procedures", then run them on sample accounts as they arrive.
- **Q5 (what a member sees)** gains: evidence display (grade, source, date), the test-and-send screen, and the leader's list management.
- **Q6** includes the signed suite and the key custody for the bundle.
