# ai-use — requirements

**Status** · In force: a new module (layer 6, directly before `ai-runs`; K657, K1043), its requirements BOB's, written for T40 from `build/plan/draft-T40-N812.md` part C (N812; Bob's K2350, K2352, K2353; adopted K2373, its doubts settled K2376; applied K2394). R1–R4 were `ai-runs` R48–R51, retired there with pointers (B10). Last changed T40 (T40-7: R1–R9 new; N812; K2373, K2376, K2394, K2400). Last changed T41 (T41-22: R10 `estimate`, R11 `actualOf`, new; R4 and R9 amended, folded with T40's text, D12; as `draft-T41-investigation.md` §3.6, K2405, K2418), not yet met; every requirement not yet met (T41).

**Size (P6).** About 900 lines: about 350 copied from `ai-runs/index.mjs`:2591–2940 (the counter, the ceilings and the reads, K624), with the limits, the judging and the reads added. Well under 4,000.

## Public

### Purpose

What each AI account has spent and may spend. It counts each use against the account that paid and the member whose act it was, holds each account owner's money limits, judges a use against them, and answers each owner its own use and each member theirs. It holds no credential, and it does not choose which account pays (that is `credentials`').

### Provides

Terms. An **owner** is the holder of one AI account: `group` (its administrators act), `project:<id>` (any one of its owners acts) or `member:<id>` (that member alone acts) (`credentials` R54–R56). A **use** is a `credentials.USE_KINDS` entry (`ask`, `draft`, `run`, `standing`, `explore`). A **limit** is `{owner, scope, unit, period, amount, inclusive}`. A **period** is the current local `day` or `month` of the group's calendar (`civil-time`); a month's limit resets on the 1st. With no limit set, nothing is capped here (a provider's own spend limit answers as `ai-runs` states). `viewer` and `by` are the control plane's stamps. Every refusal names `code` and carries its row's `check` and `translation` (R8).

**Counting** (`countUsage`)
- **R1** (was `ai-runs` R48, R49; B8) *(not yet met: T41)* `countUsage({owner, member, use, mode, model, usage, calls, at})` is called in the caller's transaction.
  - `owner` is `group`, `project:<id>` or `member:<id>`.
  - `usage` is `agent-model` R5's shape plus `estimated_cost_usd` (its R13).
  - It adds to the counter `ai_usage`, kept per owner, member, local day (`civil-time.localDay`) and `use`: the token sums, `calls` (a `null` counted as one), and `estimated_cost_usd`. `countAskUsage({member, mode, usage, calls, at})` (was `ai-runs` R48's; K2400) counts an ask or a draft (no run) the same way, with `mode` `ask` or `draft` and its owner as `accountFor` answered it; any other `mode` is refused `AI_RUN_CONSUME_INVALID`. It sums the figure `usage` carries and never reads a price table (`agent-model` R13 prices a `null` figure on `apikey`; K2376).
  - A malformed entry is refused `AI_RUN_CONSUME_INVALID` (`run-rules` R3), counting nothing.
  - The counter holds no content, question or address, and is declared `export: "admin-only"`.
  - Rows from before T40 are kept with owner "not recorded" and count toward no limit.

**Limits** (`aiLimitSet`)
- **R2** (D39; B4; was `ai-runs` R50's setting half) *(not yet met: T41)* `aiLimitSet({owner, scope, unit, period, amount, inclusive?, by})`.
  - `scope` is `overall`, a `USE_KINDS` entry, or (A4) `per_member` for a group or project account.
  - `unit` is `usd`, `tokens` or `calls`. `usd` on a member's sign-in is refused `LIMIT_UNIT_UNAVAILABLE`.
  - `period` is `day` or `month`.
  - `amount` is a positive number (`usd` to the cent; the others whole), or `null` to remove the limit.
  - `inclusive` (default `true`) is allowed only for a use scope.
  - Anything else is refused `AI_LIMIT_INVALID`, naming the field.
  - Who may set it is the owner's own act: the member (`NOT_YOUR_CEILING`); a project owner (`credentials`' R54 refusals); an active administrator (`NOT_AN_ADMIN`).
  - At most one limit is held per owner, scope, unit and period. Each set is appended with who and when.
  - The migration writes today's ceilings as B4 says: a member's own daily ceiling becomes that member's account's `overall` day limits in tokens and calls; the copy-wide ceiling becomes the group account's `per_member` day limits.

**Judging** (`useCheck`)
- **R3** (D38 C, D39; B3, B5; was `ai-runs` R50's judging half) *(not yet met: T41)* `useCheck({owner, member, use, at})` answers `null` or `AI_LIMIT_REACHED` with `{whose, scope, unit, period}` and its plain-words row, naming no cost.
  - It refuses when, for the current period, any of these has reached its amount:
    - the owner's `use` limit;
    - its `overall` limit, counted over the uses that are not exclusive, unless `use`'s limit is exclusive;
    - its `per_member` limit, counted over `member`'s use of that account.
  - It judges only the paying account's limits (D38: never another account's money limits).
  - For `explore` it refuses `EXPLORE_NOT_ENABLED` when the owner's `explore` setting is `no` (A5, B6; K2400). With `yes` and no `explore` limit held, `explore` is judged against the `overall` limit alone; `ask` without that day's approval is R6's answer, not this one's.
  - It writes nothing and never throws. A counter that cannot be read answers the refusal (fail closed).

**Reads** (`aiUsage`, `aiUsageMine`, `limitsReached`)
- **R4** (was `ai-runs` R51; B8) *(not yet met: T41)* `aiUsage({owner, viewer, month})` answers that account's owners the month's use per `use`, summed over members and naming none. Anyone else is refused as R2 refuses. `aiUsageMine({viewer, day?, month?})` answers a member their own use per payer and per use, against each limit that bound them, (T41, D12; amended) a cost per answer only to the paying account's owners (R10, R11); nobody sees another member's spending. Neither writes.
- **R5** (B7) *(not yet met: T41)* `limitsReached({viewer, at})` answers, for each account the viewer owns, each limit first reached in its current period: `{owner, scope, unit, period, period_start, reached_at}`, with a stable key per owner, limit and period. It is for `notice-producers` R16, writes nothing and never throws.

**Exploring** (`exploreAllowed`, `exploreAsk`, `exploreAsksPending`, `exploreApprove`)
- **R6** (A5, K2350; B6) *(not yet met: T41)* `exploreAllowed({owner, question, at})` is for the explorer (B9). It answers `null`, `{ask: true}`, or a refusal:
  - `EXPLORE_NOT_ENABLED` when the owner's `explore` is `no`;
  - `{ask: true}` when it is `ask` and the owner has not approved exploring for that local day (R9);
  - R3's `AI_LIMIT_REACHED` (its `overall` limit and its `explore` limit, B5);
  - `credentials.aiKeptAway({use: "explore"})`;
  - the question outside the owner's scope (B6; `connections.citesInto` for a project), or every project it is drawn on keeping its material from `explore` (`credentials.projectsKeptAway`).
  - With `null` it also answers `label: {kind: "machine", enabled_by: owner}`, which the explorer attaches to what it offers.
- **R9** (A5, K2350; K2376 (2)) *(not yet met: T41)* `exploreAsk({owner, at, what})` records, for an owner whose `explore` is `ask`, at most one pending ask a local day, stating what is worth exploring; `exploreAsksPending({viewer, at})` answers them to that account's owners, and `notice-producers` R16 makes each one "Ask" queue item (DEC-69, DEC-94's form; its words the design stream's; `queue` R1 gains the kinds, K2376); `exploreApprove({owner, day, by})`, by one of those owners, approves exploring for that day; silence means no. A second ask that day answers the first's key and mints nothing. Refusals as R2's for who may act. `exploreAsksPending` writes nothing and never throws. (T41, D12; amended) Each Ask item states the questions and R10's rough cost.

**Cost before and after** (`estimate`, `actualOf`; T41-22; D12)
- **R10** *(not yet met: T41)* (D12) `estimate({owner, use, mode, count?, at})` answers, before an AI act or exploring run (or a batch, `ai-runs` R74), a range `{low, high, unit}` from that account's measured runs of that use and mode, or `"not known yet"` until enough are measured (the count BOB's); money where the account reports cost, tokens and calls on a subscription; answered only to the account's owners.
- **R11** *(not yet met: T41)* (D12) `actualOf({run | act, viewer})` answers the actual cost after, as R10's units, only to the paying account's owners; F11's "never shown" retires for those owners only.
- **R12** *(not yet met: T41)* (DEC-188, owed: the panel's reads; K2448) `aiLimits({owner, viewer})` (`op=ailimits`, declared by `op-declarations` R41) answers each limit set on one account (R2's table: scope, use, unit, period, inclusive or on top), with its use in the current period (R5's sums, naming no member) and its history (set, changed, removed; who and when), to that account's owners only (`credentials` R60's owners: the member, the project's owners, or administrators for the group's key); anyone else is refused as `credentials` R60 refuses them, writing nothing.
- **R13** *(not yet met: T41)* (DEC-188 (7); K2448) The member-facing sentence of each refusal is read by key from the design stream's `words.json`: `AI_LIMIT_REACHED` as `ai.refused.limit`, `ai.refused.limit.overall` or `ai.refused.limit.member` by its scope, `{whose}` filled from `ai.whose.group`, `ai.whose.project` or `ai.whose.own`, never a cost; `AI_LIMIT_INVALID` as `ai.refused.limitinvalid`; `LIMIT_UNIT_UNAVAILABLE` as `ai.refused.unitunavailable`; `EXPLORE_NOT_ENABLED` as `ai.refused.explorenotenabled`; R9's Ask item as `ai.queue.exploreask`. A key the words file lacks fails its test, never a fallback sentence.

## Private

### Uses

- `record-grammar`: the shared grammar names and the refusal shape (R8).
- `civil-time`: `localDay` and the local month (R1–R5, R9).
- `record-core`: `declareTable`, `transact` (R1, R7).
- `membership`: the administrator test and `notAnAdmin` (its R64, R84), `isProjectOwner` (its R54) (R2, R4, R5, R9).
- `credentials`: `USE_KINDS` (its R55), the project account's owner refusals (its R54), `aiKeptAway` and `projectsKeptAway` (its R57), the owner's `explore` value (its R55) (R2, R6, R9).
- `connections`: `citesInto` (R6's project scope).
- `run-rules`: `AI_RUN_CONSUME_INVALID`'s row (its R3, R11) and the retired ceiling codes' successors (its R20).

### Invariants

- **R7** *(not yet met: T41)* The tables (`ai_usage`, `ai_limits` and their history) are declared through `record-core.declareTable`: `export: "admin-only"`, `sight: "group"`, purged only with the whole store. A project's limits are deleted with its project.
- **R8** *(not yet met: T41)* Each code it mints is an invariant with its test (K6), its rows in its own `checks.mjs`: `AI_LIMIT_REACHED` (carrying `whose`, `group`, `project` or `own`, `scope` and `period`; it replaces `AI_USE_CEILING_REACHED` and `AI_USE_COPY_CEILING_REACHED`, retired in `run-rules` R20), `AI_LIMIT_INVALID`, `LIMIT_UNIT_UNAVAILABLE` and `EXPLORE_NOT_ENABLED` (B11; K231), each taking the next free number of this module's family at the job's START and awaiting promotion's stamp (T41).

### Satisfies

- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §6 (the account cascade, as folded at T40's opening, K2373).
- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 "Cross-cutting rulings" and §10 (exploring, K1481 revised for exploring only, K2373).
- INVESTIGATION-DESIGN D34, D37, D38, D39 as Bob answered them (K2350, K2352, K2353); K1450 (no cost per answer; retired for the paying account's owners by D12, R4, R10, R11, T41), K1755 (every use the member's act).

### Suggestions

- **Build by copy (K624, K2275 (3)).** Copy `ai-runs/index.mjs`:2591–2940 (the counter, the ceilings and the reads) here first; `ai-runs` (T40-8) deletes its copy and re-points after this module merges.
- **The explorer is not built here** (B9; N815): R6 and R9 are its gate and its daily ask, built and tested without it.
- **Tests.** Each refusal gets a negative control; R3's inclusive and exclusive arms (an exclusive use refused only at its own limit, and the overall limit judged without it); R1's `null` `calls` counted as one; `explore` refused `EXPLORE_NOT_ENABLED` at `no`, and at `yes` with no `explore` limit judged on `overall` alone (control: under the overall limit it passes); a pre-T40 row counted toward no limit; R9's second ask on a day minting nothing.

## Open for Bob

None: Bob's answers are A1–A5 (K2350, K2352, K2353); the rest is BOB's (K2373, K2376).
