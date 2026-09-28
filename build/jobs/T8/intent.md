# intent (T8)

**Status** · session_01498Aa1KS9kWphfbKsDZgkv · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N180, intent's refusal family and codes. My best reading, which I am building now; tell me where it is wrong.

1. **Family.** Intent's own rows renumber into **C-111** (the next free; N180 says you assign it): C-111.1 to C-111.28, in the order the rows stand today. C-2.9 (NO_OBJECTIVE, R1/R22) keeps its id.
2. **`NO_STATEMENT`** (R8; today C-110.10, colliding with the catalogue's C-33.14 `publishCase`): intent mints **`PURSUIT_UNSTATED`** for a goal or aspiration with no statement or bounds. R8 names `NO_STATEMENT`, so R8's wording changes to `PURSUIT_UNSTATED` (yours to fold).
3. **Arm G's `BAD_GRADE` and `NO_SUCH_PROJECT`** (intent's rows are the only rows for codes other modules also mint: strength `BAD_GRADE` at its index 741; membership, citation, promotion, strength and legacy-store `NO_SUCH_PROJECT`):
   - `BAD_GRADE` is a different condition at strength's site, so intent mints **`CONDITION_BAD_GRADE`** for R2's "not A–D" (R2's wording changes; yours). Strength's `BAD_GRADE` then has no row: strength's to own (I will REPORT it).
   - `NO_SUCH_PROJECT` is one condition everywhere (a project absent or unseen, answered as absent, R23), and R2, R3, R23 name it. I keep the code and its row; declaring it one condition in the guard's `MULTI_SITE_CLOSED` is the guard owner's (legacy-tests), which I will REPORT. If you rule instead that the row belongs to membership, I remove mine and relay membership's.
4. **The guard's `where` grammar**: every row becomes `src/intent/index.mjs <fn> > <region>` naming the one function holding the region (`#checkProject`, `#checkPursuit`, `#conditionRefusal`, …); the shared `mint.X` helpers become one named module-level function each, so the guard finds them; `is-dead-end-noted` is widened past the region floor.

None of this blocks me: I am building on this reading and carry on with N199, N179, N181, N178 and K229 meanwhile.

## J2 · REPORT

Found while building layer 7's intent entries; none changed by me.

**Requirement wording (yours to fold):**
1. **R9**'s "Every aspiration is readable by every member of the group" contradicts N199/K222: a `project` aspiration is now seen only by a viewer who sees its project (as R23 reads it). Proposed: "The group's and a member's aspirations are readable by every member; a project's by every member who may see the project (R23)."
2. **R7**'s `watchSet` gained a page (N181 (1), for monitoring's N170 cursor): `watchSet({project, after?, limit?}) → {entities, progressions, captures, limit, truncated, cursor, measure_truncated}`. `limit` defaults to 1,000 and is clamped to 1–1,000. `captures` is in capture order after `after`. `cursor` is the last capture answered when more follow, else null. monitoring (layer 10) reads it.
3. N181's bounds add published fields to answers other modules read: `progress` and `gaps` gain `limit` and `truncated`. Past 1,000 matched instances, `satisfied` is null with its reason. `aspirationsFor` gains `departures_limit` and `departures_truncated`; `pursuitOf` gains `goals_limit`, `goals_truncated`, `triaged_limit` and `triaged_truncated`; `proposals` gains `set_aside_limit` (200, newest first) and `set_aside_truncated`.
4. The Status line's "Not yet met: R2–R18, R26 … R27, R28" now reads met: all 28 live ids are tested at the interface and green.

**legacy-tests** (each measured on `job/T8/intent`, against the pre-job tree):
- gate-reads 114/1: the one red is its classification list. N199 now gates `aspirationcontacts`, `pursuit` and `intentproposals` (`reevaluationnotices` is N200's), so they can be classified.
- bounds 203/3 → 201/5: four intent ops now publish a cap (`objectiveprogress`, `aspirations`, `pursuit`, `intentproposals`). The WALK roster and PIN arms want them driven.
- derivation-bounds 69/4 → 66/7: `#departures`, `#measure`, `#triaged` and `watchSet` left the census (209 → 204), and `pursuitOf` left both SET 2 rosters and the UNREAD list. The by-name pins need re-pinning. One arrival: `servesOf:named` (R28's 1,000-subject cut over the caller's own lists), which the IN-MEMORY roster names ASSEMBLED.
- Now green: refusal-wire 38/4 → 42/0, overdue-successor 21/1 → 22/0 (N179), airuns 53/1 → 54/0 (the `intent_triage_key` index is read), hygiene (C) (`GRADES` is the catalogue's).
- DEC-49 guard (`civicos-ui/check-refusal-codes.mjs`): 100 → 86 failures. Intent's C-110 collisions, `where`s, orphan markers and the region floor are clear. Its floors moved with this landing (rows 635, census 921, reach 671, governedSites 351, regions 304, regionLines 4459, codesChecked 709, outcomeReturns 216, refusalsJudged 689, untranslated 282) and are the guard owner's to re-anchor.

**Arm G, other modules' codes:** `NO_SUCH_PROJECT` waits on N208, as you ruled. `NO_SUCH_ENTITY` is the same case: intent mints it for a condition or aspiration naming an unknown entity, and progressions holds its row (arm G: 8 sites across entities, progressions and intent). It wants N208's treatment, with entities holding the one helper.

**Generated artifact:** intent's source is in `bio-plane/dist/bio-plane.bundled.mjs`, so this landing stales it. It is `not_product`'s and regenerated at the layer close.

## J3 · COMPLETE

**Entries applied** (layer 7's intent bullet, B1; J1 answered by B2, K238):
- **N199 (R23), first.** (1) A triage act on a gap records the gap's project, and `proposals`' `set_aside` is gated on the project an act concerns, including one derived from a gap's key (`intent::<project>::…`). (2) A `project` aspiration is seen only by a viewer who sees its project: `pursuitOf`, `contacts`, `aspirationsFor` and `declareGoal` all enforce this. A goal's `aspiration` pointer reads null to anyone else.
- **N179.** Intent reaches progressions lazily through the host, so the plane's `env`-built instance is the one it reads. The interface test builds in the plane's order and judges an overdue finding at `BIO_NOW_MS`. It fails on the old eager build.
- **N180 (K238).** Family C-111.1–.28, with C-2.9 kept. `PURSUIT_UNSTATED` and `CONDITION_BAD_GRADE` are intent's own codes. Every `where` reads `src/intent/index.mjs <fn> > <region>`. Each shared code is one governed helper (D-484's shape), and the two machine refusals carry their guard inside their region. `is-dead-end-noted` is widened.
- **N181.** Every intent `#rows(` read carries a `LIMIT` with a published cap, read one past so a cut says so: `#departures`, `#measure` (1,000; a cut measure decides no `satisfied`), `#triaged` (now `#isDecided`, `#decidedAmong` and `#setAside`), `pursuitOf` (goals 200, triage acts 1,000) and `watchSet` (paged, with a cursor). `op=pursuit` publishes only bounded collections. `GRADES` is the catalogue's `BASIS_GRADES`. `intent_triage_key` is read by triage's lookup.
- **N178 (K228).** R27: `ageDue` and `ageWake`, in milliseconds, share R17's ageable scan. A question R17 could not move stays due. R28: `servesOf`, for scheduler's rank. It is read as the plane, writes nothing and never throws. It is no op.
- **K171/K229.** Aspiration and goal ids are `ASP-<y>-<n>-aspiration` and `GOAL-<y>-<n>-goal`, a question opened from a proposal is `INQ-<y>-<n>-question`, and each carries C-2.2's core fields (`group` is stamped by promotion). The catalogue's C-1.2 and C-2.2 hold on both new types (tested).
- **R26's test** asserts the refusal and that nothing is written, not a code.

**Deferred, and why:** `#aspirations` walks every aspiration document through record-core's paged `listByType`, and `contacts` pairs them. No requirement bounds either, and a cap would change R12's and R13's answers. It wants a published bound worded in R12 and R13 first (yours).

**Found in other modules:** in J2 (REPORT).

**Tests and checks** (on `job/T8/intent`, `tranche/T8` merged at B2):
- `node --test bio-plane/test/m/intent/`: 35 tests, 35 pass, 0 fail. New: R27, three R28 tests, the N179 plane build, and N199's arms in R23. Both the N179 and N199 tests were run red against the pre-job source.
- Layer tests: none in `build/manifest.md`. Legacy suites run for the entries: listed in J2. refusal-wire 42/0, overdue-successor 22/0, airuns 54/0, hygiene 1334/1 (basis-versions'), gate-reads 114/1, bounds 201/5, derivation-bounds 66/7, rung-ladder 48/1 (unchanged), affordances 99/0.
- `node checks/format.mjs /home/user/bio` → format: 69 modules, 64 requirements files; 0 failures
- `node checks/architecture.mjs /home/user/bio intent` → architecture: 10 product files, 35 relative imports (0 naming no tracked file, not judged); 0 failures
- `node checks/coverage.mjs /home/user/bio intent` → coverage: 1 modules, 28 of 28 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs /home/user/bio intent tranche/T8` → ownership: 10 files changed by intent between tranche/T8 and HEAD; legacy-checks: 0 line(s) added, 0 removed; legacy-store: 0 line(s) added, 0 removed; 0 failures

Size (session_01498Aa1KS9kWphfbKsDZgkv): test runs 32, module lines 1833
