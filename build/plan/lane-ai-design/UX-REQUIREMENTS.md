# AI provider support: requirements for the UX design lane

**Status.** 2026-10-21, AI-DESIGN #1; §E added by AI-DESIGN #2 after reading the security-tools screen. These are the needs the UX lane must meet. The lane designs nothing here; how each need looks and flows is the UX lane's. Source requirements: `AI-PROVIDER-REQUIREMENTS.md` (ids in brackets are the working list in `REQUIREMENTS.md`).

## A. Structure
1. **Connection configuration is organised at the top level by provider, then each of that provider's plans and types** (API account, subscription, aggregator, gateway, built-in, custom endpoint), in the way the cybersecurity options are presented [AIR29, Bob].
2. The UX serves a wide diversity of AI capabilities and configurations: different plan scopes, credentials means, model and effort controls, limits, and roles served.
3. Two audiences, with the cascade project, else member, else team: team leaders (what is offered, budgets, order) and individual members (what they use, their own accounts where permitted).

## B. What each provider/plan/type must be able to show
- Plan scope: one person / team / application / unconfirmed; and the restrictions the provider places on it.
- For a member's **personal subscription** [Bob, 2026-10-21, AIR41]: offered at the member level only, never as a project's or team's account; the provider's stated restrictions shown in plain words with source and date at connection (and again when they change); the member's choice to use it recorded; nothing more is asked of them.
- Evidence: grade (Reproduced / Reported / Stated), source, date, "last confirmed", and any pending effective date of a changed term.
- Price basis and a cost estimate for typical work; free-tier status.
- Privacy summary (training, retention, human review, location) and, for a free tier that reads or trains on content, the plain warning with an **acceptance step** that is recorded.
- Roles the AI can serve and cannot (and why), from the conformance results; model and effort choices exactly as the provider offers them.
- Status: listed / watch / lapsed / retired, with the reason; health (available, degraded, down).
- Terms that bind the team's use that matter to civic work, in plain words, once at connection (e.g. a provider's rules on political content, legal or public-benefit advice, disclosure of AI use).
- Position in the owner's ordered list.
- **The six privacy checks [Bob, 2026-10-21, AIR42]:** every entry's answer to each (met / not met / unconfirmed, with source and date); all six required by default; **the team's administrators** decide which stay required for the team, and those are locked; a project owner or member can tick or untick only the checks the administrators left unticked [Bob, revised 2026-10-21]; entries failing a required check are not offered; every change is recorded with who, when and at which level; the screen should make plain which checks are locked by the team and which the person may change. Also shown, never required: whether the terms permit this use; breach commitments.
- **Origin setting [Bob, 2026-10-21, AIR43]:** models from Chinese developers hidden by default; the member can change the setting.

## C. Flows the UX must cover
1. **Guided connection for every provider and plan; never leave the user to sort it out unsupported** [AIR30, Bob]: where to sign up, what to choose, what to copy or approve, how to confirm it works; including provider sign-in flows and the reference-instead-of-hold option for tokens [AIR32]; where a plan requires a member-controlled runtime, guidance for setting it up [AIR37].
2. Choosing and using an AI optimally: defaults that work; plain words ("team", "record": K3472); disclosure naming the provider before first use; connection status; clear refusals with who can fix them.
3. **Leader configuration:** which AIs, models and plans members may use; narrowing at project level; member additions where permitted; changes recorded with who and when.
4. **Budgets and ordered accounts:** set limits, see spend, set alert thresholds, declare and reorder the ordered list; see exactly when and why work continued on a later account (every switch shown, attributed, declinable by the member) [Bob: failover allowed]; before material first goes to a provider or host not yet disclosed, including after a switch, the disclosure notice is shown and the step waits [Bob, 2026-10-21]; a use the owner switched off is refused, never moved to another account [Bob, 2026-10-21].
5. **Cost visibility:** per account, owner, member and run; estimate before a run; actual after; "not measurable in money" for plans that report none.
6. **Failure and outage moments:** limit reached, provider down, model retired, capability mismatch, deliberate switch: plain choices (wait, switch, continue without AI), never a silent change.
7. **Test and send:** for a plan not in the catalogue, a flow to run Civicsmith's locked test, show the estimated cost first, show exactly what will be sent in the sealed results bundle, and send it; plus where to see results others have contributed (the central results library: per AI, the parts it passed and its limits, speed and cost of standard jobs, who tested it and when; never test transcripts or a sending team's name without its consent) [Bob, 2026-10-21].
8. Live progress of the assistant's work and answers shown only after Civicsmith's check, as already ruled (K3602), unchanged for every AI.

## D. Constraints
- Never present a claim without its grade and date; OPEN restricts nothing and is shown as unconfirmed.
- Never sign anyone up or handle payment on the user's behalf; never state a price the provider has not confirmed.
- No provider is special-cased in words or layout; Anthropic appears as one provider among the others.

## E. The security-tools screen these options should resemble (read 2026-10-21)
**Where it is.** Settings > Security, screen `security` (administrators only): drawing `docs/development/ux-substrate/screens/mock-screens.js` `SCR.security`; words `screens/words-drawn.json` `screen.security.*`; requirements `screens-settings` R15, R43, `file-safety` R27–R31, `file-scanner` R19–R29; the UX stream's DEC-165, DEC-166, DEC-168, DEC-169 (amended K1949, DEC-173), DEC-259. It is the same on `main` and the UX stream's branch. (Bob called it "the cybersecurity UX"; the screen's own word is "Security".) Read whole by a sonnet/medium worker; the lane has not drawn anything.

**How it is organised.** The page leads with how things stand (the security level and counts, folded), then **one list of the tools in use**: each row is one vendor product with its kind, a one-line statement of what it is sent, who receives it, how long it keeps files and whether it shares, and either an "On" status or Remove. The catalogue of tools that can be added sits in a fold ("Add another checker") and is grouped by **kind of tool first, then vendor product**; only a few products have plan-like variants. Products that are refused are shown with the reason in plain words; products whose vendor does not state its handling are "not offered until it states". Each catalogue entry holds its handling facts (each stated or "not stated"), source pages and the date read, the exact fields to ask for by label, write-only credentials and a harmless test probe. Adding a tool: a table of what it is sent and who keeps what, an "I understand" box where the vendor keeps files, the fields, **"Test it with a harmless test file"**, then **"Turn it on"**; a tool stays off until its test passes; changing a tool means removing and adding it again. Members see only one line saying it is the administrators' and who they are.

**What the AI options need from it (requirements, not design):**
1. The row pattern: each connected AI account shown as one row with provider, plan and type, a one-line statement of what is sent where and kept how long (the Gate 0 facts), its status (on, health, listed/watch/lapsed) and Remove.
2. The catalogue held in a fold below what is in use, never leading the page.
3. Each fact shown stated, "not stated", or OPEN, with source and date (AIR11); the security screen's "not stated" convention matches the lane's OPEN.
4. The refused and held lists with plain reasons: providers or plans refused (for example a plan whose terms bar this use, models refused by the origin policy) and those held until a fact is confirmed (for example a host pin that cannot yet be verified).
5. Fields asked exactly as the plan entry lists them, by label; credentials write-only, never shown again; the reference option (AIR32) as another way to fill a credential field.
6. **Test before turning on:** every new connection runs the connect test (Gate 1 tier T0, `SUITE-REQUIREMENTS.md` §7) and stays off until it passes; the "I understand" step is where the free-tier warning is accepted (AIR31) and where binding terms are shown (AIR38, AIR40).
7. The generic entry (the security screen's ICAP or webhook template) corresponds to the custom OpenAI-compatible endpoint, usable only through the test flow until a release lists it [Bob].

**Where the AI options differ, so the UX lane has new work:**
- **Top-level grouping.** The security catalogue is grouped by kind of tool, then vendor; Bob asked for **provider first, then each provider's plans and types** (AIR29). The lane takes his words as written; see question E1.
- **Members as well as leaders.** Security is administrators only; AI choice has members choosing among what the team allows and adding their own where permitted (AIR10), and project owners narrowing.
- **Plans, cost and budgets.** The security screen has a monthly limit per tool but no plan tiers, price comparison, estimates, spend against limit or alerts (AIR26, AIR27).
- **Ordered accounts and failover** (AIR25, AIR27): no counterpart.
- **Per-role results.** Which parts of the assistant a chosen AI has passed, passes with limits, or is not suitable for (`SUITE-REQUIREMENTS.md` SR10, SR25), and the refusal when a member asks for a part the chosen AI has not passed.
- **Test and send** for unlisted plans: the cost estimate and spend ceiling before the run (SR40–SR42), progress while it runs, the plaintext manifest before sending (SR60), and the result's grade afterwards.

**Question E1 for Bob (UX), with recommendation. Answered 2026-10-21 [Bob]: (a), provider first** (`REQUIREMENTS.md` §12). The security screen groups by kind of tool first. For AI options: (a) **provider first, then that provider's plans and types**, as Bob described, borrowing the security screen's row, facts, refused and held lists, and test-then-turn-on flow; (b) plan type first (API account, subscription, aggregator, built-in, custom endpoint), then provider, mirroring the security screen's kind-first grouping. **Recommended: (a)**: people arrive knowing the provider they already pay; the type is a property of each plan, and a provider like OpenAI offers several types at once.
