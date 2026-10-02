# reevaluation (T23)

**Status** · session_01PEPeHZZNBH4is5sf9GQyeP · depth 2 · COMPLETE · handled B1

## Completion (REEVALUATION #13)

**Entries applied** (B1; N497, K1087, K1099, N469's rule; K1138):
1. `bio-plane/test/m/reevaluation/wpretraction.test.mjs`:51: promotion's fact `publishedCaseRegistry` is registered under the module that provides it now, `publication` (`publication/index.mjs`:2652), as content's and provenance's fixtures do. No assertion changes its meaning. It was my tests' only `"legacy-store"` registrant; the fixture's other facts (`fixture.mjs`:100–102) already name `instance-setup` and `publication`.
2. Re-scan of my paths and tests (N469, N471, N480, N502's kind): one more stale live note, fixed: `attribution.test.mjs`:6 said "Nothing calls `levelMoved` before ratification's job"; ratification calls it now (`ratification/index.mjs`:921, its R36), so it now says the caller is a later layer and the tests drive `levelMoved` directly. Comment only. No `legacy-store`, `legacy-tests`, `tools/`, T20-deleted file, old-process document (CLAUDE.md section, kickoff, lane) or `awaiting stamp` note is left in my paths. Provenance notes stay: `index.mjs`:9–14 (extracted from `store.mjs` and the catalogue in T7), `index.mjs`:1232 and :1283 (BOB #31's dated ruling, also outward text), `notice.test.mjs`:128 and `obligation.test.mjs`:387 (converted suites, T18). "Legacy boolean" (`checks.mjs`, R22) is the domain term for a bare `reeval_pending`, not a module name. The "layer 8" stand-in notes in `caseparts.test.mjs`:4 and `wpretraction.test.mjs`:4 are accurate (publication is layer 8).

No requirement carries a `not yet met: T23` mark; none added. No provided service changed. Tests only: no generated artifact staled; regenerated nothing.

**Deferred:** none.

**Found in other modules / BOB's files:** none. (`build/layers.md`'s layer-7 table still gives `store.mjs` as the reevaluation row's source: a provenance column, left as is.)

**Tests** (from `bio-plane/`):
- `node --test test/m/reevaluation/`: tests 90, pass 90, fail 0.
- `node --test test/m`: tests 5053, pass 5038, fail 3, todo 12. The three reds are exactly those accepted by name: control-plane `inbox-door.test.mjs`:81 (red 9) and queue `catalogue.test.mjs` R1 (:34) and R5 (:116) (red 13). No other red.

**Checks** (from `civicos-process/`):
- `format`: 87 modules, 86 requirements files; 0 failures
- `architecture reevaluation`: 15 product files, 61 relative imports; 0 failures
- `coverage reevaluation`: 29 of 29 live requirement ids named by a test; 0 failures
- `ownership reevaluation tranche/T23`: 3 files changed; 0 failures

Size (session_01PEPeHZZNBH4is5sf9GQyeP): test runs 3, module lines 2225

## J1 · COMPLETE

N497 applied: wpretraction.test.mjs:51 registers publishedCaseRegistry under publication (publication/index.mjs:2652); no assertion changed. Re-scan (N469, N471, N480, N502's kind, K1138) found one more stale live note, fixed: attribution.test.mjs:6 said nothing calls levelMoved before ratification's job; ratification calls it now (its R36), re-worded, comment only. Provenance notes kept. Tests only; no generated artifact staled. test/m/reevaluation 90/90; whole test/m 5038 pass, 3 fail, exactly the accepted reds (control-plane inbox-door.test.mjs:81; queue catalogue.test.mjs R1 :34, R5 :116). Checks: format, architecture, coverage (29/29), ownership (3 files) all 0 failures. Nothing found in other modules. Record: build/jobs/T23/reevaluation.md on job/T23/reevaluation.
