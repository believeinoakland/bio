# Comparison: criteria and scoring (ASSISTANT-HOSTING)

**Status** · Agreed with Bob, 2026-10-16 (K3540): method A, "let's not worry too much about assigning weights unless it's clear what the weight should be"; the 14 criteria and four contexts are the working set. No option is scored yet; scores come only from evidence in `NOTES.md` and `TESTS.md`.

## 1. Contexts (scored separately)

The answer may differ by context (Bob: "one option may be best at the team level, while a different option works for members using their own account"). Each option is scored once per context:

| Id | Context | What it means |
|---|---|---|
| X1 | **Team, shared work** | a check or chat run for the team's shared records, on the team's Cloudflare, on a credential the team's rules allow |
| X2 | **Member, own account** | a member running the assistant on their own Claude subscription, for their own use |
| X3 | **Small team** (1–5 active members) | few runs a day; idle most of the time; one person may set everything up |
| X4 | **Large team** (20+ active members) | many runs at once; setup must not depend on each member's hand work; concurrency and cost dominate |

X1/X2 is *whose* work and credential; X3/X4 is *scale*. A score is given for each pairing that applies.

## 2. Gates (pass or fail, before any scoring)

An option that fails a gate is screened out in `OPTIONS.md` with the reason and evidence; it is not scored.

| Gate | Source |
|---|---|
| G1 No API key in any form, never proposed | K3347 |
| G2 The product, not the model, decides every step of a run | agent-harness; the run's control table |
| G3 No credential travels in a URL | K1874 |
| G4 Runs Claude for a Civicsmith member on that member's or team's own subscription (or is a pure host for one that does) | charter, the question |

Terms are **not** a gate. Under K3540 a terms point enters the comparison only when confirmed against Anthropic's latest published text, read live and quoted; an unconfirmed or ambiguous point is not raised and places no restriction.

## 3. Draft criteria

Each criterion has a plain definition, what is measured, and a 0–3 scale. **Bold** are the charter's draft; the others are added for Bob to accept, merge or drop.

| # | Criterion | What is measured | 3 = | 0 = |
|---|---|---|---|---|
| C1 | **Functionality and control** | can it run a whole check: product-served tools, the four level sub-sessions, model and effort per step, chat; and *how* G2 holds (by construction, or by prompt and settings) | all, control by construction | a needed function missing |
| C2 | **Speed** | seconds from "start" to first model token; overhead per turn; whole-check time on the reference check | overhead under 5 s a run | overhead over 60 s a run, or unbounded |
| C3 | **Context** | whether context is kept where the check wants it (the parent's rows) and kept apart where it must be (each level's independent judgement) | both, by design | neither |
| C4 | **Cost to the team (Cloudflare)** | $ per reference check and $ per idle day, at X3 and X4 | ≈ $0 | grows per member whether used or not, and material |
| C5 | **Cost to the subscription** | tokens per reference check beyond the work itself (start-up prompts, closing turns, re-sent transcripts), as a share of a 5-hour window | minimal overhead | overhead comparable to the work |
| C6 | **Setup burden** | one-time and recurring steps for the team and for a member; steps only a person can do; renewals (e.g. a 30-day login) | none beyond today's sign-in | per-member hand-built setup, recurring |
| C7 | Plan reach | which plans can use it (Free, Pro, Max, Team, Enterprise; settings an Owner can turn off) | every paid plan | one tier only |
| C8 | **Where members' data goes** | where record text and findings travel and how long they persist outside the team's copy (API only; a session transcript in the member's account; a third-party host) | API call only, nothing kept outside the copy | durable copies in places the team cannot see or delete |
| C9 | **Security** | attack surface given to untrusted record text (shell, network, connectors); credential held, its scope and lifetime | no tools but the product's, no shell, narrow credential | full shell and network with a broad credential |
| C10 | **Reliability and documented status** | GA, beta, experimental or undocumented; number of outside dependencies; known failure modes and recovery | GA, one dependency, clean recovery | undocumented internal API |
| C11 | Accounting | whether usage figures come back to the product (ai-runs R48) | exact per conversation | none |
| C12 | **Terms** | confirmed points only (K3540): Anthropic's latest text, read live and quoted, that bears on the option | a confirmed text permits it | a confirmed text forbids it (then it is a gate failure, not a score) |
| C13 | **Build effort** | size and modules touched; what stays as it is | none or S | L across many modules |
| C14 | Scale and concurrency | runs at once per member and per team; documented caps | no practical cap at X4 | hard caps a large team hits |

"Fit by context" (charter) is not a criterion here: it is the result of scoring under each context (section 1).

## 4. How to compare: options for Bob

**Recommendation: method A.**

- **A. Gates, then scores per context — chosen (K3540); weights only where a weight is clear.** Gates screen; each surviving option gets a 0–3 score per criterion from evidence, each score tagged with its evidence grade (tested, documented, reported, inferred). Bob sets a weight per criterion *per context* (e.g. setup burden matters more for X4, data location more for X2). The table shows the weighted totals and how they move if a weight changes (sensitivity), so a close call is visible as close. Why: objective where evidence exists, honest about where it does not, and the weights are where Bob's values enter, explicitly.
- **B. Gates, then must-have / nice-to-have, no numbers.** Simpler to read; ties are frequent and the reasoning stays verbal.
- **C. Pairwise ranking** (each option against each, per criterion). Good for 3–4 finalists, unwieldy for 10+.

Under A, an inferred score never decides alone: where the top two differ only on inferred scores, the test that would settle it is named in `TESTS.md` before a recommendation is made.

## 5. Reference check (for C2, C4, C5)

Scores for speed and cost are taken on one reference workload so options compare like for like: the R085 check as measured in `build/plan/study-assistant-link.md` (about 27 conversations a run, about 10 a pass, four level sub-sessions per pass, Opus at medium for the parent, Sonnet at low for levels), plus one short chat exchange. Where an option changes the call shape (fewer conversations, one context), the saving is shown separately from the hosting effect.

## 6. Measured so far, beside the local runner (K3574, K3584)

Not scored; observations that the scores will rest on. Local: today's runner on standard-1 (`ladder-r7.md`): about 40 s from accept to the CLI's first call in five conversations (41.6, 40.5, 40.4, 41.3, 40.9 s), then 0.6–1.9 s per model call and about 3 s per turn; one plane read about 0.1 s. Remote (`TESTS.md` "Remote series"): a cloud session on haiku answers a one-word question in 6–18 s from creation (4.6 s once), 3 s to a message on a session already up, 7–8 s from a fired routine, 13–18 s with one tool call to the plane's instance (reached: `0.85.0`); with a repository attached the clone alone is 34 s, before the repository's own start hook. The cloud environment reaches the instance. Costs per answer on haiku: $0.003; the routine's default model costs 18 times that. Cells with no data yet: d2 (finishing), a cloud session driven turn by turn through several tool calls like a check, concurrency, other hours.

Added 19:52Z (`TESTS.md` "Remote series", part 2): a cloud session holds a flat 3.0–3.2 s per tool call over 40 calls to the instance (72 s for 20, 125 s for 40); a repository attached makes the start 228–249 s (clone 34 s plus this repository's own start hook) against 6–18 s without; an archived session returns in about 15 s with its history. The cloud account shows overage with the weekly limit "rejected" yet is served.

### 6a. Folded from S11–S17 (2026-10-16): what was measured, by option, before scoring (K3603)

Observations only (method A scoring waits for BOB #196, after the 11:00 UTC reset). Evidence in `TESTS.md` ("Remote series", parts 1–4, "Container size cells", the three full-dialogue cells), `ladder-r7.md` and `HANDOFF.md` S5–S17. All [test] unless marked.

| | Local runner (today's path), standard-1 / standard-4 | Cloud session per conversation (d), haiku | Message to a live session (d) | Routine per question (c) |
|---|---|---|---|---|
| Start to first answer | CLI's first call 40.4–41.6 s after the conversation starts, warm, on both sizes (nine conversations); **83.5 s cold** (container itself 1.46 s); then 0.6–2.5 s per model call | 3 / 6 / 18 s (n = 2 + BOB's 4.6 s); with a repository 228–249 s the first time (clone 34 s + the repository's start hook), 55 s the second time | 2.8 and 3.0 s | 7.1–8.1 s |
| Per turn with tool calls | about 3 s (1.6 model + 1.4 relay and CLI); a plane read 0.02–0.4 s (once 2.8 s) | 3.0–3.2 s a call, flat over 40 calls; 18.6 s with a 15 s sleep per call | n/a | n/a |
| Concurrency | not tested | **6 and 7 sessions within 5 s: 7.1–9.9 s each, none queued** (ten at once not completed) | n/a | n/a |
| Size | request bodies 51–125 KB per model call; context grows 1.4–10 KB a turn | **212 KB read whole from a file in the attached repository: 54.7 s, context 165 k tokens, answer of 62 KB back through git, hashes equal both ends; 212 KB through tool results and a 25 KB final message: correct** | `send_message` wraps messages as data; not a carrier | prompt = a real user turn |
| Credential | the product holds the member's sign-in (K3061) | a session signs in itself from environment variables and calls credentialed ops (login, whoami, search, 0.7–2.6 s) | n/a | n/a (connectors limited) |
| Failures and limits met | CLI keeps calling the model up to 24 s after a close (N7); closed conversation leaves the container running 2 min (N6) | archived session: `session_inactive`, back in ~15 s after unarchive with its history; **the account's monthly spend limit cut every session at 19:59Z** and again briefly at 21:01Z | same | the routine's default model was sonnet (18 times the cost) until set |
| Cost per short answer | model $ per call (S6: $0.70–2.50 a whole check) | $0.0026–0.0035 (one word); $0.033 for 40 tool calls; $0.077 for the 212 KB reading | similar | $0.003 (haiku) / $0.052 (sonnet) |

Reading across (no score): the local runner's time sits in a 40 s wait before the CLI's first call that is the container's, not the CLI's (a cloud session starts the same CLI in 3–18 s) and not the container size's; remote sessions show a steady per-turn cost, take a 212 KB text whole from a repository or tool results, and run into account-level limits (spend) before any session-level one. Not measured: the sessions service's prompt-size limit (needs a programmatic client and Bob's claude.ai login), a run over 10 minutes, ten at once, self-hosted environments (e), the composite route (`claude -p --cloud`).
