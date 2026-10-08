# N812 — AI use across groups, projects and members (draft for BOB, T39, for T40)

**Status** · Drafted by a worker for BOB during T39 (P18; K2348 (2)); **adopted by K2373** with Bob's answers (K2350, K2352, K2353): part A records them, B6 and parts C's credentials R54, R56, R59, ai-use R2, R6, R9 and notice-producers R16 are revised to them. Each module's text is applied to its requirements file before its layer's START in T40, as T39's were (K2343).

Sources: `next.md` N812; INVESTIGATION-DESIGN `HANDOFF.md` H4–H6 and `DECISIONS.md` D34, D37, D38, D39 (with Bob's D39 brainstorm, marked "not a ruling"), on `origin/design/investigation`; K1450, K1479, K1481, K1500, K1502, K1547, K1755, K2275, K2334, K2348; `terms/anthropic.md` (AT-13, U-3, U-4, "Bob's choices"); requirements of `ai-runs`, `credentials`, `agent-model`, `instance-setup` (whole), and of `membership`, `project-roster`, `answers`, `run-rules`, `agent-worker`, `store-door`, `wizard-scripts`, `notice-producers`, `op-declarations`, `control-plane` (the parts named); `modules.json`. Code checked: `ai-runs/index.mjs`:2591–2940 (the use counter and ceilings), `membership/checks.mjs`:346.

## 0. Facts that bear on the draft

1. **Built today** (`ai-runs` R48–R52; `credentials` R22–R37, R43, R51): accounts are a member's own (API key, or sign-in to their own subscription) and the group's API key; nothing at project level. Use is counted per member, local day and mode, in tokens and calls, never by payer. A member's own daily ceiling binds all that member's use, the group key's included; an administrator's copy-wide ceiling below it binds every member, whatever account pays. Switches: `suggestions` and `standing` per member reference and per group key; none for a sign-in (K2275). Keep-away (R51) is group-wide and all-or-nothing.
2. **"No project-level Claude account"** is Bob's choice (K1502's project clause, left standing by K1755), recorded in `terms/anthropic.md` "Bob's choices" and in `credentials`' Purpose. D34 ("some projects may have additional resources available … which account is used") reverses it. No Anthropic page forbids a project-scoped API key (AT-13, workspaces). The subscription token is member-level only, by Bob's choice (K1547, K1755).
3. **Neither path reports money the payer is billed.** The Messages API (API key) answers token counts only; `total_cost_usd` is `null` there (`agent-model` R5). The Agent SDK (a sign-in) states a `total_cost_usd`, but on a subscription that is a notional figure, not a charge. So "money where the account reports cost" (H6) can only mean: an API-key account, its money **estimated** by the copy from tokens at a held price per model.
4. **No project-owner refusal is exported.** `membership` mints `PROJECT_ACT_NOT_THE_OWNER` inside its own acts (`checks.mjs`:346) and exports `isProjectOwner` (R54) and `projectOwners` (R65), but no refusal builder like `notAnAdmin` (R84). `credentials` would need one (K231: one code, one site).
5. **Order.** `credentials` is index 36 (L2), before `run-rules` (79), `ai-runs` (80) and `agent-model` (86). A list of use kinds that `credentials` reads must therefore live in `credentials` or earlier, not in `run-rules`.

## A. Bob's answers (P17)

- **A1** (K2352 (1) replaced by K2353): a project's account is an Anthropic API key, or a member's own subscription (sign-in) only while that member is the project's only member; with more than one member, only an API key. BOB's details (K2353): "member" is every participant, owners included; a second member's join is not refused, the subscription stops serving the project at once and the owners are told once; it serves again if the project returns to one member.
- **A2** (K2352 (2)): (a) any one owner of a project sets its AI settings alone, each change recorded with who and when and visible to every owner.
- **A3, A4** (K2352 (3)–(4)): an account owner's limits are the limits of their own account only. For a member's act: the project's account if it has one, with the project's limits; else the member's own, with the member's limits; else the group's, with the group's limits. Every account owner can set usage limits. BOB's details: the administrator's copy-wide ceiling becomes the group account's own limit (per member, as the group sets it), binding no other account; the account the cascade chooses is the one used, so an account at its limit, or with that use switched off, refuses and the act never moves to the next account; there is no `payer` choice.
- **A5** (K2350, H7, Bob's D39 settled): each account owner (group, project, member) sets exploring to No, Ask every day or Yes. "No" means not paid from this account, and a lower level does not inherit a higher one's setting. "Ask every day" raises at most one queue item a day to the account's owners, only when something is worth exploring, silence meaning no. "Yes" runs within the overall limit and the exploring limit (inclusive or exclusive). A group administrator's "no AI at all" (keep-away) binds project and member levels; a group money setting binds only the group key.

## B. BOB's readings (P17; recorded once in `rulings.md` with the folding K)

- **B1 · Account owners and accounts.**
  - Three owner kinds: the group (its administrators act), a project (its owners act, A2) and a member (that member alone acts).
  - Each owner holds at most one account: the group key, one project key, or the member's own (an API key or a sign-in).
  - Provider-neutral wording (D34): "AI account", "the AI provider", "Claude, today's only provider". No `provider` field is added until a second provider is built.
- **B2 · Kinds of use.** `USE_KINDS` is `ask`, `draft`, `run`, `standing` and `explore`.
  - Every run mode (`check`, `investigate`, `extract`, `plan`) counts as `run`.
  - A standing question's AI half counts as `standing`.
  - `suggestions` (K1479) stays a switch on `ask`'s answers. It is not a kind of use.
  - Each account has a switch per kind, `explore` excepted (B6). The defaults keep today's behaviour: `ask`, `draft` and `run` on, `standing` and `suggestions` off.
- **B3 · Two kinds of setting** (D38 C).
  - **Material limits.** The group (`credentials` R51 widened) and each project (new) may withhold their material from AI, for every kind of use or for named ones. A material limit binds every account, whoever pays. For an act in that project's context it refuses the act. In any other act, reads under a grant drop that project's rows the way hidden-project rows are dropped (`answers` R2). "No exploring on our material" is a material limit on `explore`.
  - **Money limits.** These belong to one account and bind only that account. A member's own account is never bound by the group's or a project's money limits, and always by their material limits. In the other direction, a member's own limit no longer binds the group key's use on their behalf. That changes `ai-runs` R50 as built.
- **B4 · Limits** (D39).
  - Per account: one **overall** limit, plus **per-use** limits for each kind of use. Under A4 (K2352), group and project accounts also get a **per-member** limit.
  - Each limit has an `amount`, a `unit` and a `period`.
  - Units: `usd` only on an API-key account, as the copy's estimate (fact 3); `tokens` (input plus output, cache reads and writes included) and `calls` on every account. `usd` is refused on a sign-in.
  - Periods: `day` or `month`, the group's local calendar (`civil-time`). A month's limit resets on the 1st.
  - With no limit set, nothing is capped, apart from the provider's own spend limit, whose 429 answers in plain words (`ai-runs` R50 as now).
  - Today's ceilings migrate as follows. A member's own daily ceiling becomes that member's account's `overall` day limits in tokens and calls. Under A4 (K2352), the copy ceiling becomes the group account's `per_member` day limits.
- **B5 · Inclusive and exclusive** (D39).
  - Every use counts toward its own per-use limit.
  - **Inclusive** (the default): the use also counts toward the overall limit, and is refused when either is reached.
  - **Exclusive**: the use does not count toward the overall limit, and is refused only at its own. It is a separate allowance on top, so the most an account can spend in a period is the overall limit plus the sum of its exclusive limits.
  - The overall limit is judged on the sum of all uses except exclusive ones.
  - Limits in different units are each judged on their own figures.
- **B6 · Exploring** (A5; K2350). Each account holds `explore`: `no` (the default), `ask` or `yes`, set by its owner as its other switches are.
  - `yes`: exploring this owner pays for runs within its `overall` limit and its `explore` limit when one is held (inclusive or exclusive, B5).
  - `ask`: before exploring this owner would pay for, the owner's approval for that local day is needed: at most one queue item a day to the account's owners (DEC-69, DEC-94's form), raised only when the explorer has something worth exploring; silence means no for that day.
  - `no`: never paid from this account; nothing is inherited from another level.
  - Scope by owner: the group explores any question of the group; a project explores the questions it draws on (`connections.citesInto`). A member's scope waits on D36 (open) and is not built.
  - Material limits on `explore` (keep-away, the group's or a project's) cut the scope and bind every level.
  - What an exploring run produces is labelled the machine's, with `enabled_by` naming the owner: "the group", the project's name, or the member's handle (H6). Members decide what becomes evidence (D33).
- **B7 · Told once at a limit.**
  - The first time a limit of an account is reached in a period, that account's owners are told once for that period. Owners are the administrators for the group, the project's owners for a project, and the member for their own account. One item per account, limit and period goes through `notice-producers` and `queue`, which mint it once (DEC-94).
  - A member whose act is refused gets the plain refusal at that act. It names whose limit was reached ("your group's", "this project's", "your own") and never a cost (K1450).
  - Exploring that stops at its limit tells only its enabling owner.
- **B8 · Attribution and sight.**
  - Every use is still the act of the member who made it (K1755). It is counted to the paying account and to that member.
  - Each account's owners read their own account's use per month and per kind of use, summed over members and naming none (K1450; DEC-68).
  - A member reads their own use across every payer, with the limits that bound them.
  - Rows counted before T40 recorded no payer. They are kept as "payer not recorded" and count toward no account's limit.
- **B9 · Scope of T40** (BOB's: what goes into a tranche).
  - T40 builds the accounts, switches, material limits, money limits, counting, judging, reads and the told-once item. It also builds the exploring gate (`exploreAllowed`) and the label.
  - The explorer itself is held with a named hard reason (P19): what an exploring run searches, its mode and its run path, and how its finds reach "members working on a question". That waits on D35, D36 and the step model (D32), all open with the lane.
  - A new `next.md` entry carries the explorer.
  - Standing questions are unchanged (K2348; N796 is unaffected).
- **B10 · The new module `ai-use`** (P6). `ai-runs` is 3,297 lines today. This work adds about 600 to it, which would take it to about 3,900.
  - `ai-runs` R48–R51, the counter, the ceilings and the reads (`index.mjs`:2591–2940, about 350 lines), move to a new module `ai-use`. It is layer 6, placed directly before `ai-runs`.
  - `ai-use` gains the limits.
  - `membership`'s `MODULE_ORDER` (R83) gains the module, accepted red until membership's job, as for `doc-clean` (T39 rule 8 (6)).
- **B11 · Codes** (K231).
  - `AI_USE_CEILING_REACHED` and `AI_USE_COPY_CEILING_REACHED` retire, their numbers never reused, for one `AI_LIMIT_REACHED` minted by `ai-use`. It carries `whose` (`group`, `project` or `own`), `scope` and `period`.
  - New codes:
    - `credentials`: `AI_USE_SWITCHED_OFF`, `PROJECT_AI_KEPT_AWAY`.
    - `ai-use`: `AI_LIMIT_INVALID`, `LIMIT_UNIT_UNAVAILABLE`, `EXPLORE_NOT_ENABLED`.
  - Each takes the next free number of its module's family at the job's START and awaits promotion's stamp.

## C. Requirements by module (marked *(not yet met: T40)*)

### credentials (L2, index 36)
- **Purpose, amended** *(not yet met: T40)*. Replace "each member's own Claude account reference" with "the AI accounts the assistant's use is paid by (a member's own, a project's, the group's; Claude is today's only provider)". Replace "There is no project-level Claude account, and the subscription token is each member's own … (K1755, R33–R36)" with "The subscription token is each member's own, by Bob's choice (K1547, K1755; `build/terms/anthropic.md`, Bob's choices). A project may hold one Anthropic API key (D34, A1; R54) and the group one (K1755, R33–R36)."
- **R54** (D34, D37; A1 (K2353), A2) *(not yet met: T40)* A project holds at most one account, set by any one of its owners: `projectKeySet({project, key, by})` holds an Anthropic API key, replacing any earlier account; `projectSigninSet({project, by})` makes the acting owner's own sign-in (R43) the project's account, refused `PROJECT_NOT_SOLE_MEMBER` while the project has any other participant (owners included); `projectAccountRemove({project, by})` and `projectAccountSwitch({project, on, by})` act on whichever is held.
  - They act by a project owner only (`membership` R54, after `membership` R44's sight: a project the caller cannot see answers as absent). Anyone else is refused `PROJECT_ACT_NOT_THE_OWNER` through `membership.notTheOwner` (its R122). A machine credential is refused the same way.
  - An empty `key` is refused `NO_SECRET`.
  - The account is off when first set. A key is sealed, never shown, exported or logged, as R34 seals the group key; a sign-in account holds no secret, only the member it is. Each act is recorded with its owner and the instant, never the key. The account is cleared when its project is deleted, and a sign-in account when its member's sign-in is removed (R43).
  - A sign-in account serves only while its member is the project's only participant: when another joins, the join is not refused, the account stops serving at once (R56 goes on to each member's own account, then the group's), and the project's owners are told once (`notice-producers` R16); it serves again when the project returns to that one member.
  - `projectAccountState({project, viewer})` answers its owners `{held, kind, on, set_at, by, uses, serving}` (`serving` false while a sign-in account is suspended by a second member) and its joined participants `{on, serving}`, and anyone else as absent.
- **R55** (D34; K1479, K1500; B2) *(not yet met: T40)* `USE_KINDS`, exported and frozen, is `["ask", "draft", "run", "standing", "explore"]`.
  - Every account holds a switch for each kind except `explore`, which holds `no`, `ask` or `yes` (B6, default `no`), plus `suggestions`: a member's own reference and a member's sign-in (closing K2275's gap), the project key and the group key.
  - `accountUsesSet({owner, switch, on, by})` sets one. A member's own account is set by that member only (R22's refusals). The project key is set by an owner (R54's refusals). The group key is set by an active administrator (R33's refusals). Any other name is refused `UNKNOWN_SWITCH`.
  - Defaults: `ask`, `draft` and `run` on; `standing` and `suggestions` off.
  - A sign-in's `standing` switch is held, but R32 keeps refusing a sign-in's standing questions `STANDING_SWITCH_OFF` while N796 is held with Bob (K2334, K2376).
  - R25's and R37's `suggestions` and `standing` switches become two of these, with their stored values kept. `groupKeySwitches()` and R32's standing check read them unchanged.
- **R56** (D38; A3, A4 (K2352); amends R35) *(not yet met: T40)* `accountFor({member, act})` takes `act` as `{kind, member, project?}`. `kind` is a `USE_KINDS` entry other than `explore`. `project` is allowed only when the member is a joined participant (`membership` R54); otherwise it is refused as R54's absence.
  - The cascade answers the first account that is held and on (and, for a project's sign-in account, serving):
    1. With `project`: the project's account, as `{kind: "apikey", level: "project", project, key}`, or for a sign-in account `{kind: "signin", level: "project", project, member}` (that member's own sign-in, R43, carrying no secret).
    2. The member's own account, as now (a reference, or `signin`).
    3. The group key.
  - The account answered is the one used: when its switch for `kind` is off, the act is refused `AI_USE_SWITCHED_OFF`, naming whose, and never moves to the next account (Bob, K2352: "that's the one used"; R35's rule that a held account is answered whatever another's switches). When none is held, it is refused `NO_ACCOUNT`.
  - Keep-away (R57) is asked first, as R35 asks it now.
  - A project key's notice (R58) is due as R36's is: `PROJECT_KEY_NOTICE_DUE`. A project's sign-in account needs none (the member's own use).
  - R35's other sentences stand. On the wire, `level` may be `project`, and `project` is carried.
- **R57** (D38 C; B3; amends R51, R52, R35's `aiKeptAway`) *(not yet met: T40)* A material limit is `{on, uses, reason}`, `uses` being `USE_KINDS` entries (all of them when absent).
  - `aiKeepAwaySet` (R51) takes `uses`.
  - `projectAiKeepAwaySet({project, on, uses?, reason, by})` sets one for a project, by an owner (R54's refusals, R51's reason rule), appended as R51's are. `projectAiKeepAwayState({project, viewer})` answers the project's participants.
  - `aiKeptAway({project?, use?})` answers the group's refusal (`AI_KEPT_AWAY`) when the group's limit covers `use`, else `PROJECT_AI_KEPT_AWAY` (its row, with reason, set by and set at) when `project`'s limit covers `use`, else `null`. With neither argument it answers as now. When a setting cannot be read, it fails closed (K2093).
  - `projectsKeptAway({use})` answers the ids of projects whose limit covers `use`, for reads under a grant (`answers` R30) and exploring's scope (`ai-use` R9).
  - Material limits bind every account. They are the one site for both codes.
- **R58** (D311, K1478 (i); as R36) *(not yet met: T40)* A member is told, once and before their first act a project's key pays for, that their questions and the material read go to Anthropic under that project's API account. This uses `projectKeyNotice({member, project})` and `projectKeyNoticeSeen({member, project, by})`.
- **R59** (K2353) *(not yet met: T40)* `projectAccountsSuspended({viewer, at})` answers, for each project the viewer owns whose sign-in account stopped serving because a second member joined, `{project, member, since}` with a stable key per project and suspension, for `notice-producers` R16. It writes nothing and never throws.
- **R30, amended** *(not yet met: T40)* The project keys' table is declared `export: "never"`, exempt from purge but deleted with its project, and readable only through R54's service. Material-limit rows are declared as R51's.
- **Uses** add `membership`: `isProjectOwner`, `isJoinedParticipant` (R54), `sight` (R44) and `notTheOwner` (R122).

### membership (L2, index 34)
- **R122** (K231; for `credentials` R54–R57) *(not yet met: T40)* `notTheOwner(by, projectId)` is a module-level function: the one answer `PROJECT_ACT_NOT_THE_OWNER`, with its existing row, and shaped as R84's.
- **R83**: `MODULE_ORDER` gains `ai-use` (B10).

### run-rules (L6, index 79)
- **R20, amended** *(not yet met: T40)*. `AI_USE_CEILING_REACHED` and `AI_USE_COPY_CEILING_REACHED` retire, their numbers never reused. `AI_NO_ACCOUNT`'s translation adds "or the account that would serve has this use switched off" only where `AI_USE_SWITCHED_OFF` is not answered. `ai-use`'s rows are its own (B11).

### ai-use (new; L6, inserted at index 80 before `ai-runs`; path `bio-plane/src/ai-use/`; tests `bio-plane/test/m/ai-use/`)
Purpose: what each AI account has spent and may spend. It counts each use against the account that paid and the member whose act it was, holds each account owner's money limits, judges a use against them, and answers each owner its own use and each member theirs. It holds no credential, and it does not choose which account pays (that is `credentials`').
- **R1** (was `ai-runs` R48, R49; B8) *(not yet met: T40)* `countUsage({owner, member, use, mode, model, usage, calls, at})` is called in the caller's transaction.
  - `owner` is `group`, `project:<id>` or `member:<id>`.
  - `usage` is `agent-model` R5's shape plus `estimated_cost_usd` (its R13).
  - It adds to the counter `ai_usage`, kept per owner, member, local day (`civil-time.localDay`) and `use`: the token sums, `calls` (a `null` counted as one), and `estimated_cost_usd`. It sums the figure `usage` carries and never reads a price table (`agent-model` R13 prices a `null` figure on `apikey`; K2376).
  - A malformed entry is refused `AI_RUN_CONSUME_INVALID` (`run-rules` R3), counting nothing.
  - The counter holds no content, question or address, and is declared `export: "admin-only"`.
  - Rows from before T40 are kept with owner "not recorded" and count toward no limit.
- **R2** (D39; B4; was `ai-runs` R50's setting half) *(not yet met: T40)* `aiLimitSet({owner, scope, unit, period, amount, inclusive?, by})`.
  - `scope` is `overall`, a `USE_KINDS` entry, or (A4) `per_member` for a group or project account.
  - `unit` is `usd`, `tokens` or `calls`. `usd` on a member's sign-in is refused `LIMIT_UNIT_UNAVAILABLE`.
  - `period` is `day` or `month`.
  - `amount` is a positive number (`usd` to the cent; the others whole), or `null` to remove the limit.
  - `inclusive` (default `true`) is allowed only for a use scope.
  - Anything else is refused `AI_LIMIT_INVALID`, naming the field.
  - Who may set it is the owner's own act: the member (`NOT_YOUR_CEILING`); a project owner (`credentials`' R54 refusals); an active administrator (`NOT_AN_ADMIN`).
  - At most one limit is held per owner, scope, unit and period. Each set is appended with who and when.
  - The migration writes today's ceilings as B4 says.
- **R3** (D38 C, D39; B3, B5; was `ai-runs` R50's judging half) *(not yet met: T40)* `useCheck({owner, member, use, at})` answers `null` or `AI_LIMIT_REACHED` with `{whose, scope, unit, period}` and its plain-words row, naming no cost.
  - It refuses when, for the current period, any of these has reached its amount:
    - the owner's `use` limit;
    - its `overall` limit, counted over the uses that are not exclusive, unless `use`'s limit is exclusive;
    - its `per_member` limit, counted over `member`'s use of that account.
  - It judges only the paying account's limits (D38: never another account's money limits).
  - For `explore` it refuses `EXPLORE_NOT_ENABLED` while the owner holds no `explore` limit (B6).
  - It writes nothing and never throws. A counter that cannot be read answers the refusal (fail closed).
- **R4** (was `ai-runs` R51; B8) *(not yet met: T40)* `aiUsage({owner, viewer, month})` answers that account's owners the month's use per `use`, summed over members and naming none. Anyone else is refused as R2 refuses. `aiUsageMine({viewer, day?, month?})` answers a member their own use per payer and per use, against each limit that bound them, never a cost per answer (K1450). Neither writes.
- **R5** (B7) *(not yet met: T40)* `limitsReached({viewer, at})` answers, for each account the viewer owns, each limit first reached in its current period: `{owner, scope, unit, period, period_start, reached_at}`, with a stable key per owner, limit and period. It is for `notice-producers` R16, writes nothing and never throws.
- **R6** (A5, K2350; B6) *(not yet met: T40)* `exploreAllowed({owner, question, at})` is for the explorer (B9). It answers `null`, `{ask: true}`, or a refusal:
  - `EXPLORE_NOT_ENABLED` when the owner's `explore` is `no`;
  - `{ask: true}` when it is `ask` and the owner has not approved exploring for that local day (R9);
  - R3's `AI_LIMIT_REACHED` (its `overall` limit and its `explore` limit, B5);
  - `credentials.aiKeptAway({use: "explore"})`;
  - the question outside the owner's scope (B6; `connections.citesInto` for a project), or every project it is drawn on keeping its material from `explore` (`credentials.projectsKeptAway`).
  - With `null` it also answers `label: {kind: "machine", enabled_by: owner}`, which the explorer attaches to what it offers.
- **R9** (A5, K2350) *(not yet met: T40)* `exploreAsk({owner, at, what})` records, for an owner whose `explore` is `ask`, at most one pending ask a local day, stating what is worth exploring; `exploreAsksPending({viewer, at})` answers them to that account's owners, and `notice-producers` R16 makes each one "Ask" queue item (DEC-69, DEC-94's form; its words the design stream's; `queue` R1 gains the kinds, K2376); `exploreApprove({owner, day, by})`, by one of those owners, approves exploring for that day; silence means no. A second ask that day answers the first's key and mints nothing. Refusals as R2's for who may act.
- **R7** *(not yet met: T40)* The tables (`ai_usage`, `ai_limits` and their history) are declared through `record-core.declareTable`: `export: "admin-only"`, `sight: "group"`, purged only with the whole store. A project's limits are deleted with its project.
- **R8** *(not yet met: T40)* Each code it mints is an invariant with its test (K6), its rows in its own `checks.mjs`.
- **Uses**: `record-grammar`, `civil-time`, `record-core`, `membership`, `credentials`, `connections`, `run-rules`.

### ai-runs (L6, index 81 after the insert)
- **R48–R51** *(retired: moved to `ai-use` R1–R4, B10)*.
- **R52, amended** (D38; A3) *(not yet met: T40)*
  - A run, ask, draft or standing question carries the account `credentials.accountFor` answers for the member's act, with `kind` its use (`run`, `ask`, `draft`, `standing`) and `project` the run's project context.
  - Before anything is written, it asks `ai-use.useCheck` for that account's owner. `open` (R9), `tick` (R11) and an ask, draft or standing question are refused there as R50 refused before.
  - `tick`'s `usage` entries are counted through `ai-use.countUsage` with that owner, the member and the use.
  - The run records `principal_claude` as the paying owner (`member:<id>`, `project:<id>`, `group`) and `principal_claude_ref` as the member whose act it is. R19 answers both.
  - The rest of R52 stands.
- **Uses** add `ai-use`.

### answers (L6, index 85)
- **R30** (D38; B3) *(not yet met: T40)*
  - An ask carries an optional `project` (one the member has joined) and calls `accountFor` with kind `ask`.
  - A standing question's AI half calls it with kind `standing`, without `project` (K2348: standing questions unchanged otherwise).
  - Each is judged by `ai-use.useCheck` in place of the ceiling.
  - R2 widens: every read under a grant also removes the rows of projects `credentials.projectsKeptAway({use})` names, before the read log records them. A count counts none of them.
  - R19's conditions read `AI_LIMIT_REACHED` where they read the ceiling.
- **Uses** add `ai-use`.

### agent-model (L6, index 87)
- **Purpose, amended** *(not yet met: T40)*: "How a model turn reaches the AI provider an account names (today Anthropic's Claude only)". The account it is given is "the member's own, a project's or the group's API key".
- **R11, amended** *(not yet met: T40)* A reference of `level` `project` is taken exactly as `group` is: `apikey` only, sent as a member's.
- **R13** (B4; fact 3) *(not yet met: T40)*
  - `MODEL_PRICES`, a reviewed edit beside `MODEL_FOR_MODE`, holds USD per million input, output, cache-read and cache-write tokens for each model. Every `MODEL_FOR_MODE` model must be priced, which a test checks.
  - On the `apikey` path, every outcome's `usage` adds `estimated_cost_usd` from its figures at that model's prices. Where a figure is `null` on the `apikey` path, that figure is priced at the model's highest rate, never as zero (K2376); it is always `null` on the `signin` path.
  - `total_cost_usd` stays as the provider states it.

### agent-worker (L6, index 89)
- **R71** (D34; A3) *(not yet met: T40)* R6, R10, R29, R32, R33 and R57 accept `level` `project`, with `project` carried and never a secret. A project's key serves the member's act exactly as the group's does: R10's payer is still the member. A project's sign-in account (`credentials` R54, K2353) is that one member's own sign-in and runs as `agent-runner` R2's `{kind: "signin", member}`, exactly as the member's own.

### wizard-scripts (L11, index 120)
- **R27, amended** *(not yet met: T40)* The ceiling codes become `AI_LIMIT_REACHED` (`ai-use` R3), answered at the door with `AI_USE_SWITCHED_OFF`.

### notice-producers (L11, index 126)
- **R16** (B7; K2353, K2376) *(not yet met: T40)* One "Ask" item per entry of `ai-use.exploreAsksPending`, and one "Noticed" item per entry of `ai-use.limitsReached` and of `credentials.projectAccountsSuspended` for the viewer, keyed by its stable key so `queue` mints it once per account, limit and period. Its words are the design stream's (NOTICE). It names whose limit, which use and the period's end, and never a member.
- **Uses** add `ai-use`.

### instance-setup (L11, index 130; after T39 L11's split)
- **R65, R67, amended** *(not yet met: T40)*
  - Refusals `AI_USE_CEILING_REACHED` and `AI_USE_COPY_CEILING_REACHED` become `AI_LIMIT_REACHED`, with `AI_USE_SWITCHED_OFF` after `AI_NO_ACCOUNT`.
  - "Within that account's daily ceiling (`ai-runs` R50)" becomes "within that account's limits for `draft` (`ai-use` R3)".
  - Drafts carry no project.
  - No other change.

### op-declarations (L11, index 131)
- **R41** *(not yet met: T40)* `OPS` declares the following, each for a session only (`machineClasses: []`), with acts `by`-stamped and reads `viewer`-stamped, and keys read from the body only (as R24 does for `groupkeyset`):
  - `projectkeyset`, `projectsigninset`, `projectaccountremove`, `projectaccountswitch`, `projectaccountstate`, `projectkeynotice`, `projectkeynoticeseen`, `projectaikeepaway`, `projectaikeepawaystate` and `accountusesset` (`credentials`);
  - `ailimitset`, `ailimits`, `aiusage` with `owner`, `exploreapprove` (`ai-use`).
  - `aiceilingset` and `aicopyceilingset` retire to `ailimitset`.
- **Uses** add `ai-use`.

### store-door (L11, index 134)
- **R10, amended** *(not yet met: T40)* It resolves `accountFor` with kind `draft`. Before any model turn, in order: `credentials.aiKeptAway({use: "draft"})`; `AI_NO_ACCOUNT` or `AI_USE_SWITCHED_OFF`; then `ai-use.useCheck`'s `AI_LIMIT_REACHED`, in place of the two ceiling codes.
- **Uses** add `ai-use`.

### control-plane (L11, index 135)
- **R69** (as R56) *(not yet met: T40)* It routes R41's ops through `credentials`' and `ai-use`'s maps with the declared stamps, none taken from the caller. A project key is passed from the body only and never logged, stored, echoed or answered.
- **Uses** add `ai-use`.

### plane (L11, index 136)
- `plane` registers `ai-use`'s factory and counts. **Uses** add `ai-use`.

**`modules.json` edges** (the new module inserted at index 80; every edge points earlier):
- `ai-use`: `record-grammar` (0), `civil-time` (2), `record-core`, `membership` (34), `credentials` (36), `connections`, `run-rules` (79).
- `ai-runs`: `ai-use`.
- `answers`: `ai-use`.
- `notice-producers`: `ai-use`.
- `op-declarations`: `ai-use`.
- `store-door`: `ai-use`.
- `control-plane`: `ai-use`.
- `plane`: `ai-use`.
- `credentials`: no new module edge; it already uses `membership`.

**No edge points later.** Two traps were avoided:
- `USE_KINDS` is held in `credentials` (36), not `run-rules` (79), because `credentials` reads it.
- `MODEL_PRICES` is applied in `agent-model` (87), so `ai-use` (80) only sums a figure that is already in `usage` and never reads the price table.

## D. Sizes (lines over `modules.json` paths, source only, measured on `tranche/T39` today), with estimates after N812

| module | today | after (est.) |
|---|---|---|
| credentials | 2,837 | ~3,250 |
| membership | 3,307 | ~3,330 |
| run-rules | 2,056 | ~2,070 |
| ai-use (new) | 0 | ~900 (≈350 moved + limits, judging, reads) |
| ai-runs | 3,297 | ~3,000 (−350 moved, +50) |
| answers | 1,590 | ~1,660 |
| agent-model | 781 | ~840 |
| agent-worker | 2,785 | ~2,810 |
| wizard-scripts | 2,388 | ~2,390 |
| notice-producers | 863 | ~930 |
| instance-setup | 4,228 → 3,299 after T39 L11 (`setup-words.mjs`, 929, leaves) | ~3,305 |
| op-declarations | 3,284 | ~3,400 |
| store-door | 580 | ~600 |
| control-plane | 3,274 | ~3,330 |

**Near 4,000:**
- `instance-setup` is fine only once T39 L11's split lands. N812 must not be scheduled ahead of it.
- Without B10, `ai-runs` would reach about 3,900.
- `op-declarations`, `control-plane`, `membership` and `queue-producers` (3,431, untouched here) are the next nearest.

## E. Order of jobs (by layer, in `modules.json` order)

1. **L2:** `membership` (R122, R83's `ai-use`), then `credentials` (R54–R58, Purpose, R30). `credentials` codes against R122 once membership merges.
2. **L6:** `run-rules` (R20) → `ai-use` (new: R1–R8, with the ceiling migration) → `ai-runs` (R48–R51 retired, R52) → `answers` (R30) → `agent-model` (Purpose, R11, R13) → `agent-worker` (R71). `ai-use` and `ai-runs` merge in that order. `ai-runs`' deletion of the moved code follows `ai-use`'s merge, the copy-then-delete pattern of K2275 (3).
3. **L11:** `wizard-scripts` → `notice-producers` → `instance-setup` → `op-declarations` → `store-door` → `control-plane` → `plane`. Then promotion's stamp for the new rows (C-29's, `ai-use`'s family, `run-rules`' retirements) in T40's stamp job or T41's.

**Owed outside the jobs (with the folding K):**
- Canon:
  - Capability Ladders §10 ("No standing AI run except a member's standing question") and its "Cross-cutting rulings": K1481 revised for exploring only.
  - Assistant and AI Roles §6: the cascade, A3.
  - `terms/anthropic.md` "Bob's choices": its project clause replaced by A1's answer, citing AT-13, with U-3 and U-4 noted as applying to a project key.
  - `credentials`' Purpose.
- A NOTICE to UX-DESIGN: the project's AI settings screen, limits with inclusive or exclusive, the told-once item, the `enabled_by` label, the project's account (key or sole member's sign-in) and its suspension notice, the project key's disclosure, and the Ask-every-day exploring item.
- A new `next.md` entry for the explorer (B9: D35, D36, the step model); the Ask-every-day gate and item are built in T40 (ai-use R9, K2350).
