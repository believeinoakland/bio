# Lane: AI design (AI-DESIGN)

**Status** · Open. Chartered by BOB #204, 2026-10-17, on Bob's ruling (K3717): "development will continue with a focus on evolving the assistant capabilities to be architected to support several different AIs based on a team's, a projects, and a member's choosing. Anthropic AIs will not be included in the AIs we'll be looking to support. Let's create a new lane, call it the AI design lane, to begin exploring the issues related to this new direction." The lane studies and recommends; it changes no product code and decides nothing. Its findings reach Bob through BOB, and his decisions are K rulings.

## The job
Work out how Civicsmith's assistant should be architected so a team, a project and a member can each choose among several AIs, none of them Anthropic's, and bring BOB the options for each question that is Bob's (policy, requirements, high-level architecture, UX), each with an explanation he can understand, the options and a recommendation (P17).

## Questions to explore, in order
1. **What exists.** The assistant as built: read whole the canon (`docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md`), the Purpose and Provides of `agent-runner`, `agent-worker`, `agent-harness`, `agent-model`, `ai-accounts`, `ai-use`, `ai-runs`, `credentials` (`build/requirements/`), and `build/rulings-active.md` §1, §3 (the AI accounts cascade K1755…; live progress, checked answers K3602; D14's AI bar). List what is tied to Anthropic (the model calls, the Claude Code runner, the sign-in, words) and what is already provider-neutral (the control table, the plane's check, the run log, budgets).
2. **Candidate AIs.** Which AIs are viable for a non-technical civic team: hosted models from other providers, open-weight models served by a host (Cloudflare's own among them, since every team's copy runs on Cloudflare), and anything else that fits. For each, from the provider's own latest pages, quoted with page and date read: how a team, project or member connects (each provider's own way), tool use and structured output, context size, cost and who pays, rate limits, data retention and training use, where it runs, and its terms on use by an application like Civicsmith. Never guess a term: a point not confirmed from the provider's latest text is recorded as open and restricts nothing (the rule Bob set for Anthropic's terms, K3540, K2425, applied to every provider).
3. **The boundary.** One provider-neutral interface the harness calls, and one adapter per AI behind it: where it sits among the modules (packaging is BOB's, so the lane proposes and BOB decides), what it must carry (judged rows, tools, checks, usage and cost, progress events), and how choices cascade (project, else member, else team; an AI at its limit refuses, never moves on).
4. **Testing.** Bottom up (K3558, K3574): each candidate's lowest layer proven first by small live tests, each recorded with what held on repetition, before anything above it.
5. **What a member sees.** The screens and words choice needs, as questions for the UX design stream through BOB (never the lane's own drawings).
6. **The way there.** What of today's assistant code is kept, adapted or retired, as material for N1220 (`build/plan/next.md`).

## How the lane works
- Its record is this folder on the open tranche branch (`tranche/T50`, then the next): `NOTES.md` (sources read, quoted), `OPTIONS.md` (per question: options, tradeoffs, recommendation), `TESTS.md` (live tests, once BOB agrees each). Commits only here; never `main`, product code, `docs/`, another lane's files or `docs/development/ux-substrate/`.
- Earlier study material it may use as input (read whole what it relies on): `build/plan/study-assistant-hosting/` (ended, K3718), `build/plan/design-remote-routine.md`.
- It reports to BOB in `HANDOFF.md` (entries `A<n>`, newest last), read by BOB at takeover and each backstop check. A question for Bob goes there with an explanation, options and a recommendation; BOB puts it to him.
- No credential, key or secret is printed or committed. A live test that needs an account Bob does not hold is proposed in `HANDOFF.md` first; an act only Bob can take is named there in plain steps.
- Web access is standing (K3656); a site's bot protection is never worked around.
- An act refused by a permission or safety check is never worked around: recorded in `HANDOFF.md`.
- Workers name model and effort (K3518): haiku at low for mechanical work, sonnet at medium for reading and research. Reading is whole, never scanned (P20, K3588); a document too large is read by workers told the task.
- The lane hands over when its context passes half its window: `HANDOFF.md` names the next steps, and BOB starts AI-DESIGN #n+1.
