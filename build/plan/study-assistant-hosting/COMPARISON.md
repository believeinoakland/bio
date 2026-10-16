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
