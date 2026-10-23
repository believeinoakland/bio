# Review of draft-G55-plan.md (against diagnosis-R6-g55-measure.md, section 0 of fix-round-6-T51.md, "### G50" shape)

Four fields per cause are present (cause with file:line, missed, design, failing-first, platform check L/P), the owners are in merge order, and the main file:line claims check out (`combine` at `jurisdictions/index.mjs:1660`, entities `view()` :2054, `entityByIdentifier` :1220, money `#view()` :217, `ingestMoney` :1653-1730, wrangler `limits` :175 with no `cpu_ms`). The defects are below.

## DEFECTS

1. **The measurement file does not hold the G55 figures.** `diagnosis-R6-g55-measure.md` is the G45 platform check L (33.0 s / 181.6 s / 2.4 MB / 13.35 MB, its lines 14-26) and nothing else. The plan's 89.0 % / 90.6 % / 40 % `clone` profile, node 44.0 s and 1.4 s held, 2.2 ms per fact, 0.3 ms per written fact, 0.02 ms per unidentified row, 0.37 s, 2.0 s and 5.3 s (all resolving) are in no file of the repo. Its base is also `7d86a96ff3`, not the entry's "base `origin/tranche/T51`".
   Fix: before IN FORCE, append the cpu-prof summary and the held-view and all-resolving runs to the measure file (command, base commit, table shape, one machine) and cite that file in (1). Otherwise write "owed to the job's first step", not "certain".

2. **`combineStats()` in jurisdictions is the wrong place, and its requirement is not amended.** `jurisdictions/index.mjs:5-9` says PURE (R17) and lists the services (`list, get, validate, combine, isLocale`). A module-level mutable counter in a layer-1 service with about 25 callers (grep of `combine(`) is a new service with no requirement row, and the STARTs never tell the jurisdictions job to amend `requirements/jurisdictions.md`.
   Fix, preferred: drop the jurisdictions owner. Entities and money each count their own view builds (a `viewBuilds()` count beside the private held field), and the tests sum them; this removes one job from the chain. If BOB keeps `combineStats`, add "amend the Services list (R17) and name the new service" to the jurisdictions START, plus a test that `combine` answers are unchanged.

3. **Cache correctness is under-specified, and "freeze it in a test" is not a safeguard.**
   - `getSetting` returns the parsed value (`record-core/index.mjs:1813-1822`), not text. Write the key as `JSON.stringify` of the parsed value, with a non-array, null or unreadable value keyed as `[]`, as `view()` reads it today.
   - `combine`'s answer is "the caller's own copy" (`jurisdictions/index.mjs:5`), so mutating it is allowed by contract. Entities passes the view to `#schemeOf`, `Entities.#inScheme`, `#validOn` -> `validAt({view})` (civil-time) and id-spaces, and spreads it shallowly (`{...c.view, conflicts}` :2057), so the `conflicts` array and every nested section would be shared by all callers. A single mutation would poison every later lookup, silently.
   - Fix: the held object is deep-frozen when held (production code, not only a test), and the job lists every reader of `view()` (:585, 1124, 1189, 1222, 1258, 1338, 1442, 2032, 2098), plus id-spaces and civil-time, as read. Add a test where a stale-mutation attempt throws.
   - Invalidation is otherwise sound. Each call re-reads the setting, so a change within or between acts is seen. `HELD` profiles are code, fixed per deploy. A test for "changed between two acts" belongs in (4), not only in entities and money alone.

4. **The memory bound of the held value is not stated.** I measured `combine` over both held profiles: about 145 KB of view and 5.3 ms. Two holders (entities and money) keep one each, replaced and never accumulated, per Durable Object, so well under any bound. Say so in (3), with "one entry per holder, replaced when the key changes". Also say the held view is dropped on DO eviction and rebuilt by the next call.

5. **The per-act resolution cache has three holes.**
   - (a) For a crosswalk column, the key `(scheme-or-crosswalk, value)` must include `table`, `from` and `to`, or two columns share an answer.
   - (b) The crosswalk branch of `#resolveParty` (`calculations/index.mjs:1639-1646`) scans the whole crosswalk table with `t.objects()` on every call. That is O(rows x crosswalk size), is unmeasured, and the cache is the only fix. Put a crosswalk table in (4)(b) and in the L probe.
   - (c) Do not cache a thrown lookup. `entityByIdentifier` returns null on any throw (:1243), and a cached null reads as "not registered" for every later row of that payer.
   - Also state the within-act staleness argument: `money.recordFact` is synchronous (`money/index.mjs:282`), so no entity can appear mid-act except through an interleaved request, and the cache is per act.

6. **The tests do not go through the op, though (4) says they do.** `g45-ingest.test.mjs` calls `w.c.ingestMoney(...)` (line 41), not the op `moneyingest` (`calculations/index.mjs:2346`, via `calculationsOps`, already imported there). Entry-header text "each through the op's real entry `moneyingest`" is false for (a)-(f).
   Fix: drive (a), (b), (d) and (e) through `calculationsOps(c)...moneyingest` with a member `by`, and say that the door itself is exercised only by L.

7. **Tier 2 contradicts itself on what the 18,098-row answer is.** (3) says a table finished in the first slice "stores the record as today, byte for byte (the inline rule of G45 holds)" and (d) asserts "record byte for byte as G45's". But (3) and (e) bound the answer to 1,000 items per list, with `moneyingestread` for the rest, for the same 18,098-row table (17,796 `not_written`). G45 test (a) asserts the answer lists all 17,796. BOB note 4 admits changes only "where bounded under tier 2".
   Fix: pick one. Recommended: a run finished in the act answers whole, as G45 and K4630 say (that is the "nothing cut" the member already has), and the bound and the read apply only to `state: "ingesting"` and to a finished run read later. Then the answer size is bounded by `INGEST_ROWS_MAX` (13 MB at 100,000, which the plan already reports). Otherwise name each G45 assertion that changes, and state it as a change to what a member may do (a Bob item).
   Either way the bounded answer must carry an explicit `complete: false` / `more` key and the true counts (K4571, no silent partial read). The draft has counts but no marker key.

8. **Money's "step 1" is already answerable, and the plan hedges it for no reason.** `record.transact` nests as a savepoint, measured in Miniflare (`record-core/index.mjs:429-434`). `recordFact` is synchronous (`money/index.mjs:282` -> `#record.transact`), and the act's `await` of it only yields a microtask. So one slice in one outer `transact` works with no change to money, and a kill rolls the whole slice back (`transactionSync`), which is what makes "re-run writes no fact twice" true.
   Fix: state this in (3), delete the "if not, name the smallest change to BOB" branch and the money note 2 first half, and have the job confirm by test. State one more consequence: R66 `afterCommit` notices of 2,000 facts are held until the outer commit, so the slice also bounds that list.

9. **Re-entry and authority of the ticks are missing.**
   - (a) Money is not idempotent by source (plan's own statement), so a member who sends `moneyingest` again for the same binding and rows while a record is `ingesting` writes every fact twice, over a window of minutes. Add: while a record for the same `(binding, rows)` is `ingesting`, the act answers that record (or `ALREADY_INGESTING`); test it.
   - (b) The record key today is `sha({binding, rows, by, at})` (:1715); tier 2 must fix it at slice 1 and store `by`, `reason`, the picked rows, and the table sha, so a tick (which has no member) acts as the asker and stamps as the act does.
   - (c) `moneyingestread` must apply `#sees(bundle_id, viewer)` as the act does (:1659-1660), answering an unseen ingest as no such ingest. Add a test with a member who cannot see the binding.

10. **K4571 is not met for reads of the facts while a run is `ingesting`.** The committed slices' facts are visible at once to money reads, calculations, detectors and screens, while the table is only partly read. That is a partial reading with no word saying so. The plan is silent.
    Fix: state what a reading of those facts says (e.g. money's reads of facts whose `source.binding` has an `ingesting` record carry that fact; or hold the facts invisible to reads until the final slice commits), and bring the choice to BOB as a tier-2 detail with a test. If BOB rules it is not needed, record why.

11. **"The member is told" has no owner and no test.** (3) says "the notice is NOTICE's, words owed to UX-DESIGN, B491"; there is no NOTICE module in the owners list or in `modules.json` for this entry, no `localize` ids listed, and no test in (4) that the member sees the in-progress state or the completion (K4562 asks for both: what is happening and when done).
    Fix: name the module that raises the completion notice (or say the `moneyingestread {kind: "state"}` plus the in-progress answer are the telling, and which screen reads it), list the `calculations.*` ids for "being ingested", "rows done of total", "done", "stopped", and add a test that the notice or state reads in words from `text_units`, not only that a row exists (R-STOP).

12. **A failing slice would spin the alarm for ever.** The consumer is due "while any ingest is `ingesting`", and a slice that throws re-runs from the stored cursor on every wake. The daily consumers avoid this (`scheduler/index.mjs`, "a pass that throws ... counts the day as run, so it never spins (R3)"); the draft has no such rule, and (d) injects one throw only.
    Fix: add an attempt count on the record, a `state: "stopped"` after N failed slices (N a named constant), the member told with the reason, and a scheduler test that a permanently failing tick leaves no due consumer.

13. **Wiring owners are wrong.** The plane does not hand the scheduler "the others" at `plane/store.mjs:217-280` (that is where `money` and `calculations` are built). The scheduler builds its default owners itself (`schedulerOf`, `scheduler/index.mjs:~882-890`); the plane hands only `fileSafety` and `questionExplorer` (`store.mjs:492`), which the scheduler cannot build. So the `calculations` owner entry, the `ingest` consumer and its `uses` belong to the scheduler job; "a fresh boot re-arms the alarm" is the scheduler's own start (R11), tested there. Plane likely needs no change; drop it or show the line that needs one.
    Also: `modules.json` `scheduler.uses` lacks `calculations` (the ownership check would flag the import); name who edits it. State that the tick budget is counts (slice constants), not milliseconds: the clock is frozen inside the object (`cpu.mjs`), so a consumer-style `budgetMs` (`DETECTORS_BUDGET_MS`) cannot bound it.

14. **The slice bound is mis-stated.** A slice ends at 20,000 rows judged or 2,000 facts, so its worst case is 2,000 x 0.3 ms plus about 18,000 x 0.02 ms, about 1.0 s, not "about 0.6 s". Say "up to about 1 s on this machine" or lower `INGEST_SLICE_ROWS` to 10,000. Both are one machine's figures; the 2 s bar needs margin for the platform, so state the margin.

15. **R-OLD for tier 2 is not in the entry or the tests.** The additive columns (`state`, `next_row`) appear only in BOB's note for calculations, not in (3) or (4). Add to (3): "new data only; a stored ingest row reads as `done` and is never rewritten". Add a test over a G45-shape stored row (no `state`) read through `ingestOf` and `moneyingestread`, and run `bio-plane/test/system/migrate-released.test.mjs` (plane's tests) as the control.

## GAPS

- Money's START lacks "amend `requirements/money.md`" for the held view (entities has it; R-FOUR's fix should be in the requirement). The scheduler START should amend the registry text of R24 ("five consumers close the registry").
- Op census: `moneyingest` is listed in two places in op-declarations (`index.mjs:301` and the list near :2718) and in t33.mjs :62 and :284. Say which list a read op joins (a read op probably belongs in only the first) and that `owners.test.mjs` and `t33*.test.mjs` pass.
- (4)(a): "statements executed at most 3 per distinct unidentified payer" is loose. One lookup is 2 statements (`getSetting` + the identifier select; `getSetting` stays per call because the key is read each time). Write 2 per distinct payer plus the facts' own, or the assertion cannot be red-then-green exactly.
- L probe: add a crosswalk-column table, and for tier 2 run the real alarm in Miniflare (not only `ingestTick` called by hand) to show the ticks fire, and report per-slice work counts. The CPU bound remains read, not asserted, which is right (R-CLOCK).
- Report to BOB (not Bob): `limits.cpu_ms` stays unset by this entry, as the plan says. Since the draft's own text shows 33 s is over the default 30 s, record in `build/rulings.md` that tier 1 alone is the fix for the mixed tables and that live P is the only proof.
- `INGEST_ROWS_MAX` lift: keep it as drafted (BOB later), but state that tier 2 needs the measure of a 20 MiB table through slices before any lift.
- Scope: not widened. The only creep is items 2 and 13 (extra owners); removing them narrows the entry.

## VERDICT

Not ready: 15 defects (3, 7, 9, 10, 11, 12 are design-level for tier 2; 1, 5, 6 touch tier 1); tier 1 is sound once defects 1-6 are fixed, and tier 2 should not open until 7-13 are resolved in the text.
