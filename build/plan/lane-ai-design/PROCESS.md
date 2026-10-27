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

## 8 · Refinement 2026-10-19 (Bob): tests run in a locked Civicsmith container that also generates and locks the bundle
Bob's direction: "AI tests run and submitted by outside teams/members will run in a locked CS container that can't (easily) be hacked. The results bundle will be generated and locked in the same context."

**What this fixes.** It replaces §5 steps 1–5's "the team's copy runs the harness" with one sealed unit: a Civicsmith-built container image holds the suite, the harness, the scorer's inputs, and the bundle sealer. The team supplies only what is theirs (provider endpoint, key, plan, model) and receives only the sealed bundle.

**What already exists to build on (from `NOTES.md` §Q1).** `agent-runner` already is a digest-pinned container image run as a Durable Object container: no built-in tools, no settings sources, nothing persisted, one WebSocket in, an egress allow-list naming only the hosts it needs (R10), logging of refused egress (R34), no credential held beyond one conversation (R8, R9), and a "nothing survives a conversation" rule. The test container is the same pattern with a different image: egress allowed only to the one provider host under test and to Civicsmith's issuer, key held in memory for one run, nothing written to disk, no shell.

**The container, concretely.**
1. Image built and digest-pinned by Civicsmith; the release names the digest; the test screen starts only that digest.
2. Input in: provider host, key, model, plan declaration. Key lives in memory for the run and is never written to the bundle or logs (scrubbed as `agent-runner` R29 does).
3. At start it requests a **challenge** (nonce plus item selection) from a Civicsmith issuer; items arrive sealed to the container's ephemeral key. Expected answers never reach it.
4. It runs the suite, recording the raw exchange (bodies, provider request ids, rate-limit headers, usage, timings).
5. It builds the bundle and **seals it to Civicsmith's public key inside the container**, adds a signature by an ephemeral key generated in the container whose public half and the image digest are in the manifest, then emits only the sealed file. The team can see the plaintext manifest first (what will be sent) but cannot alter the sealed contents.
6. Scoring happens on Civicsmith's side from the opened bundle.

**The question the container does not settle: whose account runs it?**
| Option | How it works | Tamper resistance | Problems |
|---|---|---|---|
| **X · In the team's own Cloudflare account** (like the copy itself) | team starts the pinned image from the test screen | **Tamper-evident, not tamper-proof**: the team owns the platform and could in principle swap the image or read container memory, and nothing in what was read gives remote attestation of an image (Cloudflare Containers attestation: **OPEN**, not found in what was read) | cost lands on the team's account (Containers plan/pricing **OPEN**); key never leaves the team's account, which is the best fit with providers' key-transfer terms |
| **Y · In Civicsmith's account** (a hosted test service) | the team sends endpoint and key to a Civicsmith service that runs the container | strongest: Civicsmith controls the platform, image, signing key and scoring | the team's key leaves its account: Mistral §2.2(h) "buy, sell, or transfer API keys … with a third party", Fireworks 3.4(d), Together 4.3(d), OpenRouter 7(4)/§7.14 and others read as barring or not addressing it (OPEN, counsel); Civicsmith bears compute and abuse risk (an open relay to arbitrary hosts unless egress is limited to a vetted provider list and rate-limited); Civicsmith becomes a custodian of third parties' keys |
| **Z · Same image run by the team locally** (Docker on the team's machine) | the team runs the digest-pinned image beside their local model or private endpoint | same as X | needed for local/private models a Worker cannot reach; team needs Docker |

**Findings to weigh (facts, not decisions).**
- A seal inside a container only protects against a party who does *not* control the container's host. Against the team itself, X and Z give evidence (digest, nonce, request ids reconcilable with the provider's own billing, ephemeral signature) but not proof; Y gives proof of what ran but costs the key-custody and terms problems.
- The key-transfer clauses make Y risky *for outside teams' production keys*. A mitigation to test, not assume: a dedicated test key with a low spend cap that the team revokes afterward (OpenRouter's OAuth issues user-owned keys; OpenAI and Google offer per-project keys with limits). Whether providers' terms allow a third party to hold such a key briefly is OPEN for each; a written answer from the provider would settle it (§2 step 1).
- Using Y only for **Civicsmith-run** tests on accounts Bob holds (the sample accounts) is clean and gives the *Reproduced* grade; X/Z results stay *Reported* until reproduced.

**Recommendation (for Bob via BOB; provisional).** Build the sealed container once and run it in X (and Z for local models) for outside teams, graded Reported; run the same image under Civicsmith's control (Y) only on Civicsmith's own sample accounts, graded Reproduced. Revisit offering Y to outside teams when provider confirmations on key handling exist. This keeps every team's key inside its own account and still gives Bob comparable, tamper-evident bundles.

**New requirement text for AIR15/AIR16** (replace the "copy runs the harness" wording): the suite runs only inside a digest-pinned Civicsmith container that holds the key in memory for one run, limits egress to the provider under test and the issuer, builds and seals the bundle inside itself, and records the digest, nonce and an ephemeral signing key in the manifest; the grade of a result is Reproduced only when Civicsmith ran it on an account it controls.

**Open for later:** Cloudflare Containers plan, price and limits per run; whether any attestation of the running image exists; sealed-box format and key custody for Civicsmith's private key; how a Docker run reports its digest honestly; what a team sees while a run is in progress (Q5).

## 9 · Gate 0: privacy requirements (added 2026-10-20 from Bob's direction; draft for his ruling)
The order becomes: **Gate 0 privacy → Gate 1 conformance → characterization → Bob's decision → release.** Nothing is run on a model at a host that fails Gate 0 (it also saves test cost).

**Draft checklist, each point answered from the host's own text (quote, page, date) or OPEN.** The points are the lane's draft; what is required is Bob's policy.
1. Inputs and outputs are not used to train or improve models (paid/API terms, not free tier).
2. No human review of content by default.
3. Retention: stated period; zero-data-retention available and used where the host offers it; any provider-held conversation state off unless the team's keep-away limits allow it.
4. Jurisdiction and processing location stated; operator and governing law known (e.g. a host operating and storing data in a jurisdiction Bob excludes fails).
5. The host's terms permit this use (an application serving the account holder's own members) and the key handling Civicsmith does; written provider confirmation where the text is silent.
6. Sub-processors and onward routing: none unstated; through an aggregator, the aggregator's own retention and logging policy is a separate entry.
7. Breach and incident commitments stated, or OPEN and shown as OPEN.
8. Compatible with the group's keep-away limits (they bind every account, K2352) and with disclosure naming the host before first use.

**Who this binds.** Direct providers, aggregators (per request routing pinned as AIR18), open-weight hosts, and any team-owned or local endpoint that is later offered to others. A team's *own* local endpoint used only by that team is the team's responsibility; whether it may be used by the assistant before the release includes it, or only through the test flow, is a question for Bob (recommended: only through the test flow until included, so the offered list stays closed).

**Consequences found in the research.** OpenRouter by default allows providers that "store user data non-transiently and may train on it" and falls back across hosts, so an unpinned OpenRouter entry would fail Gate 0; its routing controls make a pinned entry possible. DeepSeek's own API stores and processes in the PRC under PRC law; the same model run by a US host is a different (model, host) entry. Free tiers at Google and Mistral fail point 1 and 2.
