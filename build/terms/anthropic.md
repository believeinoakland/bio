# Anthropic's terms: the register

**Status** · Written 2026-10-06 by a worker for BOB on `tranche/T34`, from the live pages read that day (K1762, K1763). Supersedes, as the place to cite, the quotations in `plan/measures-T33/assistant-substrate.md` §1 (read 2026-10-05), which stay as that day's evidence.

**Purpose.** The one home for every statement about what Anthropic's plans and terms permit or forbid. Each entry quotes a source sentence verbatim, names the page and the date read, and states the one plan or product it governs.

**Rule.** Every statement elsewhere in `build/` or the canon about Anthropic's terms cites an id here (`AT-n`) and never paraphrases beyond the entry's scope: one plan's rule is never generalised to another (K1762 (2)). Where the pages are silent, the statement cites the question under **Unresolved** and assumes neither answer. A product limit Bob chose is cited to his ruling, never to this register (**Bob's choices**). Each entry is re-read against its live page at each tranche's opening and before any ruling relies on it (K1762, K1763); a changed sentence is replaced here with its new date, and the statements citing it are re-checked.

**How these were read (2026-10-06).** The five pages BOB named were fetched with WebFetch, asked to quote verbatim, and checked against the same pages downloaded whole over HTTPS; the others were downloaded whole and quoted from their text. Reached: every page cited below. Not reached: `https://www.anthropic.com/legal/service-terms` (404; the page is `service-specific-terms`, cited as AT-18). Not fetched: the support article "Logging in to your Claude account" linked from AT-11, and the Usage Policy (`https://www.anthropic.com/legal/aup`), neither needed for a question below.

Sources, with the date each page states:
- **L** · Claude Code "Legal and compliance", https://code.claude.com/docs/en/legal-and-compliance (undated).
- **A** · Claude Code "Authentication", https://code.claude.com/docs/en/authentication (undated).
- **CT** · Consumer Terms of Service, https://www.anthropic.com/legal/consumer-terms ("Effective October 8, 2025").
- **CM** · Commercial Terms of Service, https://www.anthropic.com/legal/commercial-terms ("Effective June 17, 2025").
- **SS** · Service Specific Terms, https://www.anthropic.com/legal/service-specific-terms ("Effective August 31, 2026").
- **S** · "Use the Claude Agent SDK with your Claude plan", https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan ("June 16, 2026").
- **SDK** · Agent SDK overview, https://code.claude.com/docs/en/agent-sdk/overview (undated).
- **K** · "Get your Claude API key", https://platform.claude.com/docs/en/get-api-key (undated).
- **W** · "Workspaces", https://platform.claude.com/docs/en/manage-claude/workspaces (undated).
- **TE** · "Use Claude Code with your Team or Enterprise plan", https://support.claude.com/en/articles/11845131-use-claude-code-with-your-team-or-enterprise-plan (undated).
- **EP** · "What is the Enterprise plan?", https://support.claude.com/en/articles/9797531-what-is-the-enterprise-plan (undated).
- **PM** · "Use Claude Code with your Pro or Max plan", https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan (undated).

## Which terms govern which plan

### AT-1
- **Governs:** all plans
- **Source:** https://code.claude.com/docs/en/legal-and-compliance ("License")
- **Read:** 2026-10-06
- **Text:**
  > Your use of Claude Code is subject to:
  >
  > * Commercial Terms of Service - for Team, Enterprise, and Claude API users
  > * Consumer Terms of Service - for Free, Pro, and Max users
- **Bears on:** which terms a statement may cite: Free, Pro and Max are under the Consumer Terms; Team, Enterprise and the API under the Commercial Terms.

### AT-2
- **Governs:** Free/Pro/Max (Consumer Terms)
- **Source:** https://www.anthropic.com/legal/consumer-terms (opening)
- **Read:** 2026-10-06
- **Text:**
  > These Terms of Service ("Terms") govern your use of Claude.ai, Claude Pro, and other products and services that we may offer for individuals, along with any associated apps, software, and websites (together, our "Services").

  > Please note: Our Commercial Terms of Service govern your use of any Anthropic API key, the Anthropic Console, or any other Anthropic offerings that reference the Commercial Terms of Service. For clarity, this does not include Claude.ai or Claude Pro use for individuals or entities.
- **Bears on:** the Consumer Terms reach plans offered "for individuals"; an API key and the Console are under the Commercial Terms, not these.

## Free, Pro and Max (Consumer Terms)

### AT-3
- **Governs:** Free/Pro/Max (Consumer Terms)
- **Source:** https://www.anthropic.com/legal/consumer-terms (§2, "Account creation and access")
- **Read:** 2026-10-06
- **Text:**
  > You may not share your Account login information, Anthropic API key, or Account credentials with anyone else. You also may not make your Account available to anyone else. You are responsible for all activity occurring under your Account, and you agree to notify us immediately if you become aware of any unauthorized access to your Account by sending an email to support@anthropic.com.
- **Bears on:** a Free, Pro or Max subscription serving a group's members: forbidden; a member using their own Pro or Max subscription for their own asks: not barred by this sentence.

### AT-4
- **Governs:** Free/Pro/Max (Consumer Terms)
- **Source:** https://code.claude.com/docs/en/legal-and-compliance ("Acceptable use")
- **Read:** 2026-10-06
- **Text:**
  > Advertised usage limits for Pro and Max plans assume ordinary, individual usage of Claude Code and the Agent SDK.
- **Bears on:** a member's Pro or Max token used by the product: its advertised limits assume that member's ordinary, individual use (see U-5 for unattended runs).

## Team and Enterprise (Commercial Terms)

### AT-5
- **Governs:** Team/Enterprise (Commercial Terms)
- **Source:** https://code.claude.com/docs/en/authentication ("Log in to Claude Code"; "Claude for Teams or Enterprise")
- **Read:** 2026-10-06
- **Text:**
  > **Claude for Teams or Enterprise**: log in with the claude.ai account your team admin invited you to.

  > Team members install Claude Code and log in with their claude.ai accounts.
- **Bears on:** a Team or Enterprise seat is signed in to by the member it was given to; whether it may serve others is not stated (U-1).

### AT-6
- **Governs:** Team/Enterprise (Commercial Terms)
- **Source:** https://www.anthropic.com/legal/service-specific-terms (§A, "Claude for Work (Team Plan; Enterprise Plan)")
- **Read:** 2026-10-06
- **Text:**
  > Customer must inform its Users that (i) they are accessing an administered service offering that enables Customer's access to and control over data submitted to the Services by Customer and its Users, and (ii) use of the Services is subject to Anthropic's policies, including the Privacy Policy and Usage Policy.
- **Bears on:** a Team or Enterprise plan is the organization's administered offering to its own Users, who must be told so; it says nothing on one seat serving several people (U-1).

### AT-7
- **Governs:** Team/Enterprise (Commercial Terms)
- **Source:** https://support.claude.com/en/articles/9797531-what-is-the-enterprise-plan ("Usage-based pricing")
- **Read:** 2026-10-06
- **Text:**
  > The seat fee only covers access to the platform and doesn't include any usage. All usage across Claude, Claude Code, and Cowork is billed separately at standard API rates, based on what your team actually consumes. There are no per-seat usage limits and no included token allowance.
- **Bears on:** the cost of a member's own Enterprise (usage-based) seat: metered at API rates, not a flat price.

### AT-8
- **Retired 2026-10-08 (K2332):** its text is no longer on page S (the "For Team and Enterprise admins" section is gone). Kept as a record of what the page said on 2026-10-06; no statement may rest on it. Team plans' monthly API credits are now pooled (AT-28).

## API and Console organizations (Commercial Terms)

### AT-9
- **Governs:** API and Console organizations (Commercial Terms)
- **Source:** https://code.claude.com/docs/en/legal-and-compliance ("Authentication and credential use")
- **Read:** 2026-10-06
- **Text:**
  > This does not restrict how customers provision and manage their own API keys or third-party inference provider credentials — for example, configuring an API key in a development environment, secrets manager, or machine image for use by the customer's own authorized users — provided the resulting usage is billed to the key owner under their agreement with Anthropic (or the applicable provider) and is not resold or intermediated as described above.
- **Bears on:** a group-level API key serving the group's members: permitted, billed to the group as key owner, not resold or intermediated (whether a group's members are its "authorized users": U-4).

### AT-10
- **Governs:** API and Console organizations (Commercial Terms)
- **Source:** https://www.anthropic.com/legal/commercial-terms (opening; §A.1)
- **Read:** 2026-10-06
- **Text:**
  > These Commercial Terms of Service ("Terms") are an agreement between Anthropic and you or the organization, company, or other entity that you represent ("Customer"). […] They govern Customer's use of Anthropic API keys and any other Anthropic offerings that references these Terms, as well as all related Anthropic tools, documentation and services (the "Services").

  > A.1. Overview. Subject to these Terms, Anthropic gives Customer permission to use the Services, including to power products and services Customer makes available to its own customers and end users ("Users").
- **Bears on:** an organization holding an API key may use it to power a product for its own end users: permitted.

### AT-11
- **Governs:** API and Console organizations (Commercial Terms)
- **Source:** https://www.anthropic.com/legal/commercial-terms (§D.4, §D.5, §H.1)
- **Read:** 2026-10-06
- **Text:**
  > D.4. Use Restrictions. Customer may not and must not attempt to (a) access the Services to build a competing product or service, including to train competing AI models or resell the Services except as expressly approved by Anthropic; (b) reverse engineer or duplicate the Services; or (c) support any third party's attempt at any of the conduct restricted in this sentence.

  > D.5. Service Account. Customer is responsible for all activity under its account.

  > H.1. Payment of Fees. Customer is responsible for fees incurred by its account, at the rates specified on the Model Pricing Page, unless otherwise agreed by the parties.
- **Bears on:** the group key's holder answers for all use and fees under it and may not resell it: the group key is the group's, never charged on to members.

### AT-12
- **Governs:** API and Console organizations (Commercial Terms)
- **Source:** https://platform.claude.com/docs/en/get-api-key ("Choose a key type")
- **Read:** 2026-10-06
- **Text:**
  > A **personal key** acts as you, and stops working if you leave an organization. A **service account key** represents a service account which can be used by workloads such as CI pipelines, production services, or agents. Use a personal key for your own development, and a service account key for anything shared.
- **Bears on:** the kind of key a group should hold for its copy: Anthropic advises a service-account key for shared use (advice, not a bar).

### AT-13
- **Governs:** API and Console organizations (Commercial Terms)
- **Source:** https://platform.claude.com/docs/en/manage-claude/workspaces (opening; "How workspaces work")
- **Read:** 2026-10-06
- **Text:**
  > Workspaces provide a way to organize your API usage within an organization. Use workspaces to separate different projects, environments, or teams while maintaining centralized billing and administration.

  > **API keys** can be scoped to a single workspace. In this case, they can only access resources within that workspace.
- **Bears on:** one Console organization may hold separate keys per project or team, billed centrally: permitted (a project-level key is excluded by Bob's choice, not by this page).

## Claude Code run inside a product

### AT-14
- **Governs:** Claude Code run inside a product
- **Source:** https://code.claude.com/docs/en/legal-and-compliance ("Can customers offer Claude Code in their products?")
- **Read:** 2026-10-06
- **Text:**
  > Unless we've mutually agreed otherwise, preinstalling or running Claude Code in your products or services (e.g. in hosted sandboxes or other agent infrastructure) requires agreeing to our Commercial Terms of Service and complying with the conditions below:
  >
  > * **The Claude Code binary must not be modified.** Claude Code must be installed and run as published by Anthropic, and customers may not remove, disable, or restrict any authentication method built into it (including methods that permit signing in with a Claude account or the user's own API key).
- **Bears on:** the `agent-runner` container: whoever runs it accepts the Commercial Terms, and Claude Code runs unmodified with no authentication method removed.

### AT-15
- **Governs:** Claude Code run inside a product
- **Source:** https://code.claude.com/docs/en/legal-and-compliance ("Can customers offer Claude Code in their products?")
- **Read:** 2026-10-06
- **Text:**
  > **Customers may not pay for, resell, or intermediate Claude usage on their end users' behalf.** Each end user must authenticate with their own Anthropic API key, Claude subscription plan credentials, or 3P inference provider credential (Amazon Bedrock, Google Cloud's Agent Platform, Microsoft Foundry). That usage is billed directly to the end user under their own agreement with Anthropic or, for third-party inference providers, with the applicable provider.
- **Bears on:** hosted Claude Code (the subscription path through `agent-runner`): each member authenticates with their own credential; whether the group key may drive that path is not settled (U-3).

### AT-16
- **Governs:** Claude Code run inside a product
- **Source:** https://code.claude.com/docs/en/legal-and-compliance ("Authentication and credential use")
- **Read:** 2026-10-06
- **Text:**
  > **Developers** building products or services that interact with Claude's capabilities, including those using the Agent SDK, should use API key authentication through Claude Console or a supported cloud provider. Anthropic does not permit third-party developers to offer Claude.ai login into their own applications, or to route requests through Free, Pro, or Max plan credentials on behalf of their users.
- **Bears on:** routing one Free, Pro or Max subscription's requests for other people: forbidden; Team and Enterprise credentials are not named in this sentence (U-1).

### AT-17
- **Governs:** Claude Code run inside a product
- **Source:** https://code.claude.com/docs/en/legal-and-compliance ("Authentication and credential use")
- **Read:** 2026-10-06
- **Text:**
  > Moreover, developers may not collect, store, or intermediate Claude.ai credentials or session tokens — sign-in to a Claude account must complete through Anthropic's own flow.
- **Bears on:** a member's subscription token held sealed in the group's copy: the risk Bob weighed (K1537, K1547); whether the copy is "the developer" here is open (U-2).

### AT-18
- **Governs:** Claude Code run inside a product
- **Source:** https://code.claude.com/docs/en/legal-and-compliance ("Authentication and credential use")
- **Read:** 2026-10-06
- **Text:**
  > Nor does it prevent an end user from signing in to the unmodified Claude Code binary with their own Claude subscription, including where a platform hosts Claude Code as described under *Can customers offer Claude Code in their products?* above.
- **Bears on:** a member signing in to hosted, unmodified Claude Code with their own subscription, for their own use: permitted.

### AT-19
- **Governs:** Claude Code run inside a product
- **Source:** https://code.claude.com/docs/en/agent-sdk/overview
- **Read:** 2026-10-06
- **Text:**
  > Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK. Use the API key authentication methods described in the Quickstart instead.
- **Bears on:** a product built on the Agent SDK offering claude.ai login: not allowed without Anthropic's approval; API keys are the stated path.

### AT-20
- **Governs:** Claude Code run inside a product
- **Source:** https://code.claude.com/docs/en/authentication ("Generate a long-lived token")
- **Read:** 2026-10-06
- **Text:**
  > Bare mode does not read `CLAUDE_CODE_OAUTH_TOKEN`. If your script passes `--bare`, authenticate with `ANTHROPIC_API_KEY` or an `apiKeyHelper` instead.
- **Bears on:** the subscription path must not run Claude Code in bare mode.

## All plans

### AT-21
- **Governs:** all plans
- **Source:** https://code.claude.com/docs/en/legal-and-compliance ("Authentication and credential use")
- **Read:** 2026-10-06
- **Text:**
  > **OAuth authentication** is intended exclusively for purchasers of Claude Free, Pro, Max, Team, and Enterprise subscription plans and is designed to support ordinary use of Claude Code and other native Anthropic applications.
- **Bears on:** a subscription token (OAuth) is for the plan's purchaser's ordinary use of Claude Code; API keys are the other method.

### AT-22
- **Governs:** all plans
- **Source:** https://code.claude.com/docs/en/authentication ("Generate a long-lived token")
- **Read:** 2026-10-06
- **Text:**
  > For CI pipelines, scripts, or other environments where interactive browser login isn't available, generate a one-year OAuth token with `claude setup-token`

  > The command opens the same browser authorization flow as `/login`, and the token prints to the terminal after you approve access in the browser. It does not save the token anywhere; copy it and set it as the `CLAUDE_CODE_OAUTH_TOKEN` environment variable wherever you want to authenticate

  > This token authenticates with your Claude subscription and requires a Pro, Max, Team, or Enterprise plan. It can only make model requests, so it can't establish Remote Control sessions or fetch claude.ai connectors.
- **Bears on:** a member's subscription token: made through Anthropic's own sign-in flow by `claude setup-token`, one year, Pro, Max, Team or Enterprise (not Free), model requests only.

### AT-23
- **Governs:** all plans
- **Source:** https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan ("Update October 7, 2026", "Update June 15, 2026")
- **Read:** 2026-10-08 (replaces the 2026-10-06 text, K2332)
- **Text:**
  > Update October 7, 2026: Claude Max and Team plans now include monthly API credits, which cover the Claude Agent SDK, claude -p, the Claude API, and Claude Managed Agents. You can still use the Claude Agent SDK, claude -p, and third-party apps with your subscription limits.

  > Update June 15, 2026: We’ve paused the previously-announced changes to Claude Agent SDK usage. For now, nothing has changed: Claude Agent SDK, claude -p, and third-party app usage still draw from your subscription limits.
- **Bears on:** the subscription path's billing: it draws on the member's plan's usage limits; the change remains paused, and the page no longer promises notice before one takes effect (U-6). Separate monthly API credits exist for Max and Team (AT-28).

### AT-24
- **Governs:** all plans
- **Source:** https://support.claude.com/en/articles/11145838-use-claude-code-with-your-pro-or-max-plan
- **Read:** 2026-10-06
- **Text:**
  > Important: If you have an ANTHROPIC_API_KEY environment variable set on your system, Claude Code will use this API key for authentication instead of your Claude subscription (Pro, Max, Team, or Enterprise plans), resulting in API usage charges rather than using your subscription's included usage.
- **Bears on:** a run given both credentials bills the API key, so the runner passes exactly one (`agent-runner` R2).

### AT-25
- **Governs:** all plans
- **Source:** https://code.claude.com/docs/en/legal-and-compliance ("Authentication and credential use")
- **Read:** 2026-10-06
- **Text:**
  > Anthropic reserves the right to take measures to enforce these restrictions and may do so without prior notice.
  >
  > For questions about permitted authentication methods for your use case, please contact sales.
- **Bears on:** the questions below go to Anthropic's sales; an answer in writing is cited here as a new entry.

### AT-26
- **Governs:** Claude Code's sign-in (Pro, Max; Team and Enterprise as invited)
- **Source:** https://code.claude.com/docs/en/authentication ("Log in to Claude Code")
- **Read:** 2026-10-06 (quoted by the design session, U81; checked verbatim by BOB #124 the same day)
- **Text:**
  > If your browser shows a login code instead of redirecting back after you sign in, paste it into the terminal at the `Paste code here if prompted` prompt. This happens when the browser can't reach Claude Code's local callback server, which is common in WSL2, SSH sessions, and containers.
  >
  > You can authenticate with any of these account types:
  >
  > * **Claude Pro or Max subscription**: log in with your claude.ai account. […]
  > * **Claude for Teams or Enterprise**: log in with the claude.ai account your team admin invited you to.
- **Bears on:** Claude Code hosted in a group's container: a member signing in completes Anthropic's sign-in in their own browser, and the login code must then reach the hosted binary's own prompt. The page lists no Free plan among the account types for Claude Code (it lists also Console, cloud providers and a cloud gateway, outside the member's subscription path).

### AT-27
- **Governs:** Claude Code's stored credentials (every account type)
- **Source:** https://code.claude.com/docs/en/authentication ("Credential management")
- **Read:** 2026-10-06 (as AT-26)
- **Text:**
  > On Linux, credentials are stored in `~/.claude/.credentials.json` with file mode `0600`.
  >
  > Claude Code manages `.credentials.json` through `/login` and `/logout`.
- **Bears on:** a member's sign-in through hosted Claude Code's own login is written by the binary into the container it runs in (the group's), not by Civicsmith's code.

### AT-28
- **Governs:** Max and Team plans (not Free, Pro or Enterprise)
- **Source:** https://support.claude.com/en/articles/17154008-monthly-api-credits-for-max-and-team-plans
- **Read:** 2026-10-08 (K2332). Its "Supplemental Credit Terms" not yet read.
- **Text:**
  > Available on Max and Team plans, including discounted Team plans. Free, Pro, and Enterprise plans aren't eligible.

  > On Team plans, credits for all seats are pooled into one monthly balance, capped at $500.

  > To claim your credit, you link a Claude Console organization to your plan. Credits go to that organization each month.

  > Shared across the organization. Everyone with an API key in the linked organization draws from the same balance.

  > The credits are for building your own apps and agents on the Claude Platform. They don't cover interactive Claude Code sessions or extra usage after you hit your plan's limits.

  > Does this cover claude -p ? API credits cover claude -p and the Claude Agent SDK when you run them yourself with an API key from your linked Claude Console organization, because that usage is billed as Agent SDK usage. When you're signed in with your Claude plan instead, claude -p and Agent SDK usage still draw from your plan's usage limits and don't use your API credits.
- **Bears on:** a Max or Team holder's API key in a linked Console organization draws on monthly credits, under the Commercial Terms' API rules (AT-9, AT-10), subject to U-3 and U-4; a sign-in still draws on the plan's limits (AT-23).

### AT-29
- **Governs:** all plans
- **Source:** https://code.claude.com/docs/en/authentication
- **Read:** 2026-10-08 (K2332; whether it is new since 2026-10-06 is not known)
- **Text:**
  > Renewing early matters most for sessions that run unattended. A background session in agent view or a Remote Control session that outlives the login stops making progress once the credential expires and can't recover until you sign in again.
- **Bears on:** unattended sessions on a sign-in are described as a use case, with their expiry; it does not say whether such use on a subscription is "ordinary" (U-5).

## Unresolved: ask Anthropic

Questions the pages read on 2026-10-06 do not answer, which matter to this product. Each states what the pages say and what they do not; no statement elsewhere assumes either answer.

- **U-1 · A Team or Enterprise plan's credentials serving a group's copy.** Say: the Consumer Terms' bar on making an Account available to anyone else governs Free, Pro and Max (AT-1, AT-3); developers may not route requests through "Free, Pro, or Max plan credentials" on their users' behalf (AT-16); Team and Enterprise members sign in with the account their admin invited them to (AT-5); the plan is the organization's administered offering to its Users (AT-6); AT-8's advice on shared automation is withdrawn from its page (K2332); Team plans' API credits are pooled across the linked organization (AT-28). Do not say: whether one Team or Enterprise seat's token, or an organization-level credential of such a plan, may serve other members of the group through the group's copy, or whether each member's own seat token is the only permitted use.
- **U-2 · Holding a member's subscription token in the group's copy.** Say: developers may not "collect, store, or intermediate Claude.ai credentials or session tokens" (AT-17); an end user may sign in to the unmodified binary with their own subscription where a platform hosts it (AT-18); the token is made by the holder in Anthropic's own flow and set "wherever you want to authenticate" (AT-22). Do not say: whether a group's self-hosted copy that seals the member's own `setup-token` output and passes it to hosted Claude Code is "a developer storing" it, or the member's own configuration of their own token; nor who "the developer" is when the group, not the project, runs the copy.
- **U-3 · The group's API key and hosted Claude Code.** Say: a customer's own API key may serve "the customer's own authorized users" (AT-9); but where Claude Code runs inside a product, "each end user must authenticate with their own" credential and the customer may not "pay for … or intermediate Claude usage on their end users' behalf" (AT-15). Do not say: whether a group's key serving its members through the Messages API (no Claude Code) is outside AT-15, or whether the group key may drive the `agent-runner` path; nor whether the group, or the project that publishes BIO, is "the customer".
- **U-4 · Who a group's "authorized users" are.** Say: the key owner's "own authorized users" (AT-9); the Customer's "own customers and end users ('Users')" (AT-10). Do not say: whether a civic group's members, who are not its employees and may be an unincorporated association's volunteers, are its authorized users or Users.
- **U-5 · Unattended runs on a member's subscription.** Say: Pro and Max limits "assume ordinary, individual usage of Claude Code and the Agent SDK" (AT-4); OAuth supports "ordinary use" (AT-21); `setup-token` is for "CI pipelines, scripts, or other environments" (AT-22). Do not say: whether a member's standing question, re-run by the scheduler and calling the model on that member's token without their act each time, is ordinary individual use.
- **U-6 · The paused Agent SDK change.** Say: the change is paused and, "for now", Agent SDK, `claude -p` and third-party app usage still draw from subscription limits; separate monthly API credits exist for Max and Team (AT-23, AT-28). Do not say: whether or when the paused change will take effect, or that notice will precede it (the page no longer says so, K2332).
- **U-7 · A member signing in through hosted Claude Code's own login, from a Civicsmith screen.** Say: the binary is unmodified (AT-14); the member uses their own subscription, billed to them (AT-15); the sign-in completes on Anthropic's own page (AT-17); an end user signing in to "the unmodified Claude Code binary with their own Claude subscription, including where a platform hosts Claude Code" is not prevented (AT-18); the member's browser shows a login code that must reach the hosted binary's `Paste code here if prompted` prompt (AT-26), and the binary stores the result in the container (AT-27); Anthropic directs such questions to sales (AT-25). Do not say: (a) whether a Civicsmith screen that takes the login code and passes it to the binary, or carries the member's keystrokes to the binary's own prompt, "collect[s] … or intermediate[s] Claude.ai credentials or session tokens" (AT-17); (b) whether a Civicsmith button that starts that sign-in offers "Claude.ai login into their own applications" (AT-16) or is the member "signing in to the unmodified Claude Code binary" (AT-18); (c) whether the credential the binary writes in the group's container is the developer "stor[ing]" it (AT-17; as U-2); (d) who agrees to the Commercial Terms as the one "running Claude Code in your products" (AT-14): each group, or Civicsmith's makers (as U-2). Answerable only by Anthropic (AT-25); whether to ask is Bob's (the layouts page's S6).

## Bob's choices (not Anthropic's rules)

Product limits Bob ruled. They are cited to his rulings, never to this register, and no statement presents them as Anthropic's.

- **The subscription token is member-level** (K1547, K1755: Bob, "we'll also support a per-member subscription token that will only be used by that member"; "Only the subscription token was limited to the member; I didn't limit API keys"). For Free, Pro and Max the terms also bar sharing (AT-3, AT-16); for Team and Enterprise the pages are silent (U-1). The product limit holds on every plan by Bob's choice.
- **There is no project-level Claude account** (K1502, "Own subscriptions only", whose project clause K1755 left standing: "the rest of K1502 stands"). No Anthropic page forbids a project-scoped API key (AT-13); the product has none by Bob's choice.
- For reference, **the group-level API key** is also Bob's choice (K1755); it is one the terms permit (AT-9, AT-10), subject to U-3 and U-4.
