# AI provider support: requirements for the UX design lane

**Status.** 2026-10-21, AI-DESIGN #1. These are the needs the UX lane must meet. The lane designs nothing here; how each need looks and flows is the UX lane's. Source requirements: `AI-PROVIDER-REQUIREMENTS.md` (ids in brackets are the working list in `REQUIREMENTS.md`).

## A. Structure
1. **Connection configuration is organised at the top level by provider, then each of that provider's plans and types** (API account, subscription, aggregator, gateway, built-in, custom endpoint), in the way the cybersecurity options are presented [AIR29, Bob].
2. The UX serves a wide diversity of AI capabilities and configurations: different plan scopes, credentials means, model and effort controls, limits, and roles served.
3. Two audiences, with the cascade project, else member, else team: team leaders (what is offered, budgets, order) and individual members (what they use, their own accounts where permitted).

## B. What each provider/plan/type must be able to show
- Plan scope: one person / team / application / unconfirmed; and the restrictions the provider places on it.
- Evidence: grade (Reproduced / Reported / Stated), source, date, "last confirmed", and any pending effective date of a changed term.
- Price basis and a cost estimate for typical work; free-tier status.
- Privacy summary (training, retention, human review, location) and, for a free tier that reads or trains on content, the plain warning with an **acceptance step** that is recorded.
- Roles the AI can serve and cannot (and why), from the conformance results; model and effort choices exactly as the provider offers them.
- Status: listed / watch / lapsed / retired, with the reason; health (available, degraded, down).
- Terms that bind the team's use that matter to civic work, in plain words, once at connection (e.g. a provider's rules on political content, legal or public-benefit advice, disclosure of AI use).
- Position in the owner's ordered list.

## C. Flows the UX must cover
1. **Guided connection for every provider and plan; never leave the user to sort it out unsupported** [AIR30, Bob]: where to sign up, what to choose, what to copy or approve, how to confirm it works; including provider sign-in flows and the reference-instead-of-hold option for tokens [AIR32]; where a plan requires a member-controlled runtime, guidance for setting it up [AIR37].
2. Choosing and using an AI optimally: defaults that work; plain words ("team", "record": K3472); disclosure naming the provider before first use; connection status; clear refusals with who can fix them.
3. **Leader configuration:** which AIs, models and plans members may use; narrowing at project level; member additions where permitted; changes recorded with who and when.
4. **Budgets and ordered accounts:** set limits, see spend, set alert thresholds, declare and reorder the ordered list; see exactly when and why work continued on a later account (every switch shown, attributed, declinable by the member) [Bob: failover allowed].
5. **Cost visibility:** per account, owner, member and run; estimate before a run; actual after; "not measurable in money" for plans that report none.
6. **Failure and outage moments:** limit reached, provider down, model retired, capability mismatch, deliberate switch: plain choices (wait, switch, continue without AI), never a silent change.
7. **Test and send:** for a plan not in the catalogue, a flow to run Civicsmith's locked test, show the estimated cost first, show exactly what will be sent in the sealed results bundle, and send it; plus where to see results others have contributed (the central results library, summaries with grade and date).
8. Live progress of the assistant's work and answers shown only after Civicsmith's check, as already ruled (K3602), unchanged for every AI.

## D. Constraints
- Never present a claim without its grade and date; OPEN restricts nothing and is shown as unconfirmed.
- Never sign anyone up or handle payment on the user's behalf; never state a price the provider has not confirmed.
- No provider is special-cased in words or layout; Anthropic appears as one provider among the others.
