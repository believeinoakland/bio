# legacy-index (T9)

**Status** · session_015C5rwaRYuaTLYD3SanCUps · depth 2 · COMPLETE · handled B2

**Job** · LEGACY-INDEX #6, session `session_015C5rwaRYuaTLYD3SanCUps`, branch `job/T9/legacy-index`, the legacy-index bullet of layer 11 (`build/plan/current.md`). This is a legacy module: no requirements file and no `tests` path. Its contract is the bullet, BOB's START (B1) and CHANGE (B2), and the op maps of the modules it routes. B1 and B2 are applied.

**Read whole:** `roles/JOB.md`, `build/manifest.md`, `build/plan/current.md`, LEGACY-INDEX #5's record (`build/jobs/T8/legacy-index.md`), LEGACY-STORE #1's T9 record, and the withdrawn route code (`7a4bbdb7ea`, `09008ee746`). Also the op maps the routes feed: `standardsOps`, `conformanceOps`, `consequencesOps`, `filingsOps`, and the store's ten named escalation entries (`store.mjs`, N216). For `index.mjs` (7,030 lines), I read the sites the routes touch: `OPS`, the action arrays, `SESSION_OPS`, `NEEDS`, the viewer list, the query stamps, the body stamps, `resolveSession` and `aiTaskScope`.

## Entries applied

- **K263's share of N216: layer 9's routes, exactly as LEGACY-INDEX #5's table states them.** The code is `09008ee746` reversed (which restores `7a4bbdb7ea`'s layer-9 part). Only the `OPS` comment changed: it no longer says the store answers `unknown op`.
  - Every op has classes `admin, member, probe`, and `viewer` is stamped in the URL (the fail-closed viewer list).
  - Every act is in both `SESSION_OPS` sets and has `NEEDS` `contribute`. Reads carry no `NEEDS` row.
  - Each act's identity is stamped from the session, never from the caller:
    - standards: `author`, or `proposer` for `standardpropose`, in the body. The caller's copies are deleted first, and an empty POST body is stamped too.
    - conformance, consequences, filings and escalation: `author` in the query.
    - The identity is the positional one: a session gets `member:<id>` (the founder gets `member:admin`), an `ai` key gets `class:ai/<tokenId>`, and any other credential gets `class:<cls>`.
  - **The count is 36, not 34.** The table itself lists 36 ops, which is also legacy-store's count: standards 6, conformance 5, consequences 6, filings 9, escalation 10. All 36 are routed. The "34" in the START and the plan is a miscount.
- **B2:** merged `tranche/T9` (affordances, K310) and re-ran the six suites named. Results are below.

## Deferred

Nothing in my module.

## Found in other modules (REPORT J1)

1. **standards:** `op=standard` with no `id` answers `{ok:false, reason:"NO_ID", detail}` with no `code`, `check` or `translation`. This is a codeless refusal (D-495's class). It is the only one among the 36 ops, and it is the module's own answer (`standardRead`), not the route's.
2. **affordances / legacy-tests:** `rung-ladder` has two reds that name layer-9 acts. They are byte-identical on the tranche tip, so they are not caused by the routes.
   - NO UNBACKED CLAIM: `addressedrecord`, `consequencerevise`, `escalationadvance`, `escalationdecline`, `escalationevaluate` and `escalationsuspend` are ranked `reasoned`, but the suite's no-account probe does not find a reason refusal for them.
   - `reversible`: `escalationresume` carries it, but the suite's list of published ways back does not include it.
   - Either the rows change (affordances) or the pin changes (legacy-tests).
3. **legacy-tests:** `project-sight` 11g++ is unchanged at 248/1 (LEGACY-STORE J2's re-anchor). The other reds in the six suites are the same on both trees, so they are not mine: `affordances`' three facts-region source scans and the `#retiredNotCitable` scan (`affordanceFacts` moved to `affordances/facts.mjs`), `plane-envelope`'s four D-240 arms, and `d311-roster-affordances`' two arms.
4. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from `index.mjs`. It is BOB's to regenerate at the layer close (§14). Not rebuilt here.
5. **Noted, no defect:** an `ai` key reaches these acts only if its member-authored `writes` names them. Otherwise `aiTaskScope` refuses it with the coded `AI_BEYOND_TASK_SCOPE` before the store is reached.

## Tests and checks

No `tests` path (legacy), so no test is committed.

**A scratch driver through the whole plane in Miniflare** (not committed). It uses the real `Store`, subclassed only so that it echoes what reached it when a request carries `echo=1`.
- **Results:** 23 pass, 0 fail on this branch. 4 pass, 19 fail with the tranche tip's `index.mjs`. 9 pass, 14 fail with only the two author-stamp sites disabled; restored byte-identical.
- **Stamps, from the echo:** for every one of the 36 ops, what reached the store was checked for seven callers:
  - a member session, an administrator session and the founder session;
  - the admin, member and probe bearers;
  - an `ai` key whose scope names the 22 acts.

  For each caller, `viewer` is the session's D-15 viewer (the founder's is `admin`; the `ai` key's is its principal's, `member:pilar`), and each act's `author` or `proposer` is the caller's identity. The caller's own `viewer`, `author` and `proposer` were sent in the query and the body, and each was overwritten. An empty POST body to a standards act is stamped too.
- **Each op answers through its module (the real durable object):**
  - None of the 36 answers `UNKNOWN_OP`, and an unrouted op still does (the control).
  - Each module returns its own coded refusal for an act asked of nothing: `STANDARD_NO_CITE`, `NO_SUCH_PROJECT`, `NO_SUCH_DETERMINATION`, `NO_SUCH_FILING`, `NO_SUCH_ESCALATION`.
  - `standards`, `determinations` and `escalationsdue` answer ok.
  - **Refusal-wire:** the only codeless answer is standards' `NO_ID` (REPORT 1).
- **Identity reaches the module (one arm per class, and more):**
  - The probe and admin bearers each send `author=member:nadia` in the query and the body. They are still refused by name on all 16 acts that refuse a machine: `MACHINE_CANNOT_DECLARE_STANDARD`, `…_DETERMINE`, `…_ADDRESS`, `…_APPROVE`, `…_FILE`, `…_NAME_COUNSEL`, `…_EXPORT`, and escalation's eight.
  - A member sending `author=class:probe` meets none of them.
  - A standard proposal is labelled `member:pilar` (`member_proposed`) from a member and `class:admin` (`machine_proposed`) from the bearer.
  - A member's declaration passes the machine fence and stops at `STANDARD_NO_TEXT`.
- **NEEDS:** a view-only member is refused `NOT_CAPABLE` on all 22 acts and admitted to all 14 reads.

**B2's six suites, with `tranche/T9` merged (@ `b57d27ce9b`), against the tranche tip's `index.mjs`:**

| suite | this branch | tranche tip | what differs |
|---|---|---|---|
| `affordances` | 96/4 | 95/5 | "NON_ACTS names only ops in NEEDS" is green here |
| `rung-ladder` | 46/2 | 44/4 | BACKWARD and EXACTLY are green here; two reds remain on both trees (REPORT 2) |
| `refusal-wire` | 42/0 | 42/0 | green on both |
| `project-sight` | 248/1 | 248/1 | 11g++ on both (REPORT 3) |
| `plane-envelope` | 60/4 | 60/4 | the same four arms |
| `d311-roster-affordances` | 19/2 | 19/2 | the same two arms |

- **Green with both merged:** `refusal-wire`, and the route arms in `affordances` and `rung-ladder`. Every remaining red is identical on the tip.
- The whole battery was started before B2 arrived. It was stopped when B2 said not to repeat it, and its partial results are not used.
- No layer tests (manifest).

**Checks** (civicos-process, on the merged branch):
- `format: 69 modules, 64 requirements files; 0 failures`
- `architecture: 29 product files, 53 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 0 modules, 0 of 0 live requirement ids named by a test; 0 failures`
- `ownership: 2 files changed by legacy-index between tranche/T9 and HEAD; 0 failures`

Size (session_015C5rwaRYuaTLYD3SanCUps): test runs 36, module lines 7,030

## J1 · REPORT

For routing; the detail is in my record (§ Found in other modules).
1. **standards:** `op=standard` with no `id` answers `{ok:false, reason:"NO_ID"}` with no code, check or translation. It is a codeless refusal (D-495), the only one among the 36 ops, and it comes from the module's `standardRead`, not from the route.
2. **affordances / legacy-tests:** `rung-ladder` has two reds, identical on the tranche tip, so not from the routes. NO UNBACKED CLAIM names `addressedrecord`, `consequencerevise`, `escalationadvance`, `escalationdecline`, `escalationevaluate` and `escalationsuspend` (ranked `reasoned`, but no reason refusal is found for them). `reversible` names `escalationresume` (not in the suite's list of ways back). Either the rows change or the pin does.
3. **legacy-tests:** these reds are the same on both trees: `project-sight` 11g++ (LEGACY-STORE J2), `affordances`' facts-region source scans (`affordanceFacts` moved), `plane-envelope`'s four D-240 arms, `d311-roster-affordances`' two.
4. **Stale generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale from `index.mjs`, for the layer close (§14).

## J2 · COMPLETE

Job complete on `job/T9/legacy-index`, with `tranche/T9` merged (B2). The full account is in my record.
- **Routed:** layer 9's routes, exactly as LEGACY-INDEX #5's table states them. There are 36, not 34: the table lists 36, which is also legacy-store's count. The code is `09008ee746` reversed. Each op carries the viewer stamp; each act carries `NEEDS` `contribute`, is in both session sets, and has its `author`/`proposer` stamped from the session and never from the caller.
- **Scratch plane driver** (real durable object, plus an echo): 23/0 here, 4/19 on the tip, and 9/14 with only the author stamps disabled. No layer-9 op answers `UNKNOWN_OP`. Each answers through its module's op. Machines are refused by name even when sending a member's `author`. The only codeless refusal is standards' own `NO_ID` (REPORT J1).
- **B2's six suites, branch vs tip:** affordances 96/4 vs 95/5 (NON_ACTS green); rung-ladder 46/2 vs 44/4 (BACKWARD and EXACTLY green); refusal-wire 42/0 on both; project-sight 248/1 on both; plane-envelope 60/4 on both; d311-roster-affordances 19/2 on both. Every remaining red is identical on the tip (REPORT J1).
- **Checks:** format, architecture, coverage and ownership all report 0 failures.
