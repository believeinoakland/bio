# actions (T11)

**Status** · session_01QJraYCYw3CtTBeXsM2piAx · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two readings I am building now (step 3: I carry on while you answer).

**Q1 (N217, K275: `NO_REASON`).** `actionMove`'s `NO_REASON` (R13) is its own condition: a move of an action states no reason. It has no row today, and four other modules hold rows named `NO_REASON` for their own conditions (progressions, intent, escalation, consequences). My reading: rename it `ACTION_MOVE_NO_REASON`, with its own row C-117.4 in this module (`actionMove > is-move-reason`); R13's wording `NO_REASON` → `ACTION_MOVE_NO_REASON` is yours to change (K238: a code is interface detail). Actions mints no `NOT_A_PARTICIPANT`. Affordances' `reasoned` code list (`src/affordances.mjs` 453, 711) names `NO_REASON` for `actionmove`; that is a later module's (layer 11), and I will REPORT it.

**Q2 (the refusal-code guard, arm G).** `pendingClocks` answers `BAD_DATE` for a `before` that is not a date (R31 names no refusal), sharing C-33.6's code with `actionCorrespond`'s entry date: two conditions, one code. My reading: its own code `PENDING_CLOCKS_BAD_BEFORE`, row C-117.5. `monitoring` passes a refused read's `reason` through without testing it (`deadlineRecheck`), so nothing downstream breaks.

Not questions, for your record: N246's `NO_RULE` I resolve by R32's second arm (removed; an absent `rule` is answered `NO_SUCH_RULE` at that code's place). `BAD_RISK_TIER` (actionRiskTier and actionRiskPropose, one condition) and `ACTION_NO_DETERMINATION` (two sites in `#breachRefusal`) each go through one helper, as N297's `RECORDS_LAW_REFUSED` does.

## J2 · QUESTION

**Replaces J1** (same two readings; one new fact on Q1). Built as read below; the module's 37 tests are green.

**Q1 (N217, K275: `NO_REASON`).** `actionMove`'s `NO_REASON` (R13) is its own condition: a move of an action states no reason. It had no row, and four other modules hold rows named `NO_REASON` for their own conditions. Built: renamed `ACTION_MOVE_NO_REASON`, its own row C-117.4 (`actionMove > is-move-reason`). R13's wording is yours to change (K238). **New fact:** affordances' `JUSTIFICATION_REFUSALS` (`src/affordances.mjs` 453; `actionmove: "reasoned"` 711) lists `NO_REASON`, so `test/m/affordances` R19 ("every `reasoned` op … is refused with a code in JUSTIFICATION_REFUSALS") goes red (72/1; 73/0 without my change), and affordances has no job in T11. So either (a) the rename stands and affordances gains `ACTION_MOVE_NO_REASON` in that list (a one-line entry, T11 layer 11 or T12), or (b) I keep `NO_REASON` minted here, give it no row, and N217's `NO_REASON` share waits for affordances. My recommendation is (a), in T11's layer 11 if you can add it, since the break is one line in the list. Say which, and I conform.

**Q2 (the refusal-code guard, arm G).** `pendingClocks`' `BAD_DATE` (a `before` that is not a date; R31 names no refusal) shared C-33.6's code with `actionCorrespond`'s entry date. Built: its own code `PENDING_CLOCKS_BAD_BEFORE`, row C-117.5. `monitoring` passes a refused read's `reason` through untested.

## J3 · REPORT

R43 built and tested at b437a79c76 (`noSuchAction` exported from `src/actions/index.mjs`, row C-117.2 in `ACTION_CATALOGUE_CHECKS`; test `t11.test.mjs` R43). The rest of the job is on the same commit, all 37 of the module's tests green; I am running the checks now and will post COMPLETE. B3 read: J2 (which replaced J1 before B3 arrived) asks nothing B3 does not settle, so no answer to J2 is needed.

## J4 · COMPLETE

All entries applied at b437a79c76 (`job/T11/actions`), on `tranche/T11` merged after B3. The module's 37 tests pass; format, architecture, coverage and ownership pass.

**Entries applied**
- **N283 (its read):** `pendingClocks` seeks `bundles b JOIN bundle_projection bp ON bp.bundle_id = b.bundle_id` (`PROJECTION_TABLE` imported from retrieval, R61). The fixture makes the table with retrieval's own `migrate()` and writes the clock column into it.
- **N231 (R42):** `kinds()` never throws (an unreadable setting or view answers the product's kinds) and writes nothing; `actionsOps` offers it as the read op `actionkinds` → `{ok: true, kinds}`.
- **N237, N277 (R3, R31):** `ACTION_TOO_LARGE` (C-117.3, `#tooLarge`), with `part`, `count` and `limit`, refuses a creation or revision holding over 500 `action_basis` or 500 `correspondence` entries (an act's promotion included). A replay over the limit lands and is projected not at all, never half-projected. `project`'s read of the held legs is bounded. `pendingClocks` reads at most 500 actions a page (`LIMIT 501`, `truncated` when more follow). `cursor` is the last action read. A page never cuts an action: one whose entries would not fit goes whole to the next page. An action alone holding more entries than a page is answered alone, its first `limit`, with `cut_inside` stating it.
- **N246, N277 (R18, R32):** C-73.3's translation names `LAW_LEVELS` (federal, state, county, city). R32's `NO_RULE` is removed: an absent `rule` is answered `NO_SUCH_RULE` at that code's place (R32's second arm).
- **N261 (R16):** `#releaseLease` calls record-core's `releaseLease` (R61), with no `try` wrapper and no zero-length lease. Tested by a spy on the record handed to actions, on the success path and a refusal after the lease.
- **N271 (R8):** `#breachRefusal` reads the viewer `pkg.actorViewer ?? pkg.viewer ?? c.viewer ?? author`: the session's stamp on `op=promote` (promotion's "For callers") wins over a caller's `viewer`. Tested as the control plane stamps a member session (bare author, `actorViewer`).
- **N217 (K275, K368):** R43 `noSuchAction` and its row C-117.2 (reported at J3). R13's `NO_REASON` → `ACTION_MOVE_NO_REASON` (C-117.4). Actions mints no `NOT_A_PARTICIPANT`.
- **N297 (its share):** `RECORDS_LAW_REFUSED` is minted by one helper, `recordsLawRefusal` in `checks.mjs` (C-73.6's `where` now names it). The write refuses by it, and the audit's `recordsLawFindings` reads it.

**Improvements found in my own module (done)**
- `BAD_RISK_TIER` (C-90.2) was minted at two sites for one condition (the act and a proposal): now one, `#badRiskTier`.
- `ACTION_NO_DETERMINATION` was minted at two sites and had no row: now one site with a row, C-117.6. The "no conformance on this host" case keeps `cause: CONFORMANCE_UNAVAILABLE`.
- `pendingClocks`' `BAD_DATE` → `PENDING_CLOCKS_BAD_BEFORE` (C-117.5, K368).
- R33's clock-shape comparison no longer spreads inside its governed region, so the guard's inherited-verdict count drops by one (7 → 6).
- Tests run at the plane's shape: a cursor from `sql.exec` and workerd's 50-byte LIKE/GLOB cap (K313, K316).

**Requirement marks my work meets (for you to strike; ownership keeps a job out of `build/requirements/`)**
R3's "not yet met: N237"; R16's "not yet met: N261"; R18's "not yet met: N246"; R31's second mark, "not yet met: N237" (its first, layer 10's contract, is monitoring's); R32's "not yet met: N246"; R42's "not yet met: N231"; R43's "not yet met: N217". R8's text holds for `op=promote` now (N271).

**Catalogue rows for promotion R34's stamp:** added C-117.2 `NO_SUCH_ACTION`, C-117.3 `ACTION_TOO_LARGE`, C-117.4 `ACTION_MOVE_NO_REASON`, C-117.5 `PENDING_CLOCKS_BAD_BEFORE`, C-117.6 `ACTION_NO_DETERMINATION` (all in `ACTION_CATALOGUE_CHECKS`, no new family). Changed: C-73.3's translation (the levels), C-73.6's `where` (`src/actions/checks.mjs recordsLawRefusal > is-records-law`), C-90.2's `where` (`src/actions/index.mjs #badRiskTier > is-bad-risk-tier`). Removed as a code: `NO_RULE` (it had no row).

**Found in other modules**
- **conformance:** K275 makes `DETERMINATION_SUPERSEDED` conformance's to provide as one helper, but its Provides words none. So actions R8 (`#breachRefusal`) and escalation still each mint it, and the guard's arm G names both sites. When conformance provides the helper, actions R8 calls it.
- **monitoring (N283, its share, layer 10):** its fixture writes `bundles.action_clock_next` (`test/m/monitoring/fixture.mjs` 115, 144). With this change `pendingClocks` seeks `bundle_projection`, so monitoring's R34, R44 and R35 tests go red (40/3; 43/0 before) until its fixture writes the projection row. Its own code only calls `pendingClocks`, which is unchanged in shape for the first page.
- **affordances:** R19 red (72/1), `JUSTIFICATION_REFUSALS` lacks `ACTION_MOVE_NO_REASON`. Routed to T12 by you (N310).
- **filings, escalation:** their suites pass against this branch (33/0, 28/0). Arm G names `NO_SUCH_ACTION` at three sites until their jobs call `noSuchAction`.
- **legacy-index (N231, its share):** `op=actionkinds` needs its op spec (every signed-in class, `mutating: false`) in `src/index.mjs`, beside `actionquotes` (676).
- **legacy-tests:** `test/action-loop.test.mjs` 398 expects `NO_REASON` from `op=actionmove`. The refusal-code guard (`civicos-ui/check-refusal-codes.mjs`) has floor slack from this change and others: rows, governed sites, regions, region lines, codes checked, refusals judged, outcome returns. That suite is legacy-tests' to re-pin.

**Deferred:** nothing. One limit is stated rather than fixed. A single action holding more pending entries than one page (500) is answered in part, with `cut_inside` stating it. R31's cursor names actions, not entries, so its remaining entries are not reachable by paging. The clock is not bounded by R3.

**Tests and checks**
- `node --test test/m/actions/` → tests 37, pass 37, fail 0 (new: `t11.test.mjs`, 7 tests; R13, R18, R28, R31, R32 extended).
- Users' suites: `test/m/filings` pass 33 fail 0; `test/m/escalation` pass 28 fail 0; `test/m/monitoring` pass 40 fail 3 (above); `test/m/affordances` pass 72 fail 1 (above).
- `civicos-ui/check-refusal-codes.mjs`: 61 failures (64 before this change). Arm G no longer names `RECORDS_LAW_REFUSED`, `BAD_RISK_TIER` or `BAD_DATE`; the rest are other modules' or floor slack.
- `node checks/format.mjs` → 0 failures; `architecture.mjs … actions` → 0 failures; `coverage.mjs … actions` → 43 of 43 live ids named, 0 failures; `ownership.mjs … actions tranche/T11` → 7 files, legacy-store and legacy-checks 0 lines added, 0 failures.

Size (session_01QJraYCYw3CtTBeXsM2piAx): test runs 14, module lines 3495
