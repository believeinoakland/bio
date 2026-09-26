# entities — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `7d915799` (after membership's early merge) by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (51,006 lines), `schema.mjs` (3,964), `checks/bio-checks.mjs` (16,591) and `index.mjs` (13,438) at that commit; the extraction job confirms them. A method's range runs from the comment block above it to its closing brace. The contract is `build/requirements/entities.md` (R1–R32); K1, K6, K23, K31, K35, K61 and K64 apply, with N4, N6 and N13. The module exports `entitiesOf(ctx)`, its one instance per Durable Object `ctx`, reaching `record-core`, `membership`, `extraction` and `provenance` through their factories on the same `ctx` (K61); `legacy-store` delegates to it. `from` should read `["legacy-store", "legacy-checks"]` (K64's pattern: C-91 is in the catalogue). Nothing moves from `index.mjs` (§2).

## 1. What moves to `entities`

All in `store.mjs` unless named otherwise.

| what | where today | lines | moves |
| --- | --- | --- | --- |
| REC-203 header, `idMatch`, `IDMATCH_ADDRESS_LIMIT` | store.mjs | 23216–23307 | yes (R20–R25), with N6: the view-first `id-spaces` services over the active profiles' view; `id-spaces`' legacy adapter (its R26, K35) retires in the same tranche |
| REC-36 header, `documentsNamingEntity`, `readingNamePlan`, `#ENTITY_KINDS`, `#RELATION_KINDS` | | 25039–25405 | yes (R17–R19, R1, R3); `readingNamePlan`'s place-name default is N4 (R19) |
| `#refTermsSql`, `#refReachSql`, `#isUninformative`, `#CORRESPONDENCE`, `#CORRESPONDENCE_RANK`, `#PARTIAL_*`, `#candOrderCmp`, the FW-6 header, `createEntity`, `addEntityAlias`, `declareRelation`, `readEntity`, `entitiesByAlias`, `readRelation`, `#entityView` | | 25466–25759 | yes (R1–R7, R17). `readingname.test.mjs` pins that `store.mjs` names `reading_ref_terms t` once: it follows the module |
| the FW-7 header, `#GRADE_RANK`, `#isEstablished`, `#MEANING_LIMIT_*`, `#OCCURRENCES_PER_REF`, `#upsertResolution`, `#entitiesByAliasNorm`, `#recognise`, `#recogniseTier`, `resolveReferences`, `#resolveOne`, `testifyResolution`, `#resolutionView`, `resolutionsForCapture`, `documentsConcerning` | | 25761–26178 | yes (R9–R16). `#upsertResolution`'s `#stampConnectionDirty` call and `resolveReferences`' `#armConnectionDerive` become R13's listeners (`connections`, and the scheduler's arming, registered by `legacy-store` until `scheduler` is extracted, K72 (9)); `#resolveOne`'s `#observeResolutionAttempt` becomes R13's attempt listener (`observation-log`). `#GRADE_RANK`, `#MEANING_LIMIT_*` and `#OCCURRENCES_PER_REF` are shared with `connections`: exported, or a copy each |
| `#strongestResolutionsFor` | | 27347–27361 | yes, as `strongestByCapture` (R16) |
| dispatch: `readingname`, `readingnameplan`, `entitycreate` … `relation`, `resolve`, `resolvetestify`, `resolutions`, `concerns` | | 49949–49990 | yes (K3), except `readingtermsclear`, `readinghistoryclear`, `reindexnames` (extraction's) |
| dispatch: `idmatch` | | 50390–50396 | yes |
| `IDSPACE_CHECKS` (C-91) | bio-checks.mjs | 16337–16365 | yes (R29); translations rewritten under N6 (R25) |
| `ENTITY_KINDS`, `RELATION_KINDS` | affordances.mjs 194–202 | 9 | yes (R7); `affordances` re-exports them (N13) |

**Schema (K4).** `entities`, `entity_aliases`, `entity_relations` (schema.mjs 746–829) and `resolutions` with its five indexes (830–901). Today `legacy-store` declares them to purge (store.mjs 870, 890); the job removes them there when `entities` declares its own (R30, K23).

**Checks it needs and does not take:** C-75 (the per-item set form, `#perItem`), the act-shape `NO_BASIS`/`NO_CITATION` rows (`actNoBasis`, `actNoCitation`), `isMachineIdentity`.

**Measured size:** store.mjs 1,235 (574 code), bio-checks.mjs 29 (23), schema.mjs 156 (50), affordances.mjs 9: about 1,430 lines, about 650 of code.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | lines | goes to | why |
| --- | --- | --- | --- | --- |
| `#normAlias`, `#cleanLabel`, `#labelTerms`, `#refTermSources` (the term fold) | store.mjs 25406–25465 | 60 | `extraction` (its map §1, R19) | the reading writer (`#writeOneReading` 20105–20107) and `#backfillRefTerms` (24349–24350) fold terms with them; the alias index must fold identically (R3), so `entities` imports them |
| `documentsByReference` | 24990–25037 | — | `extraction` (its R28) | reads the reading only |
| `#observeResolutionAttempt` (43820), `#missingMeaningCause` (43931) | store.mjs | — | `observation-log` | they write and read `observation_log`, later in the order; R13 hands it the attempt |
| `#stampConnectionDirty`, the sweep, the scheduler entry, `deriveConnections` onward | store.mjs | — | `connections` | its map |
| C-2.8, the subject-entity check inside `promote` (18432) | store.mjs | — | `inquiry` | an inquiry's grammar, registered with `promotion` (K31), calling `has` (R7) |
| `index.mjs`: `REGISTRY_ACTIONS` (1904), the op classes (1330, 1375–1394), `REC30_VIEWER_READS` (11931), the stamps of `declaredBy` and `resolvedBy` (13135–13170) | index.mjs | — | `control-plane` | routing, authentication and stamps stay (K3) |

## 3. Callers to rewire

Each calls a moved method or reads an entities table today, and calls `entitiesOf(ctx)` after.

- `has`: `promote` (18432, C-2.8, through `inquiry`'s registered check), `#assembleInstance` (27771), `threadInstance` (27911), `dischargeStage` (28052), `earnedBasisRegistry` (27438).
- `strongestByCapture`: `earnedBasisRegistry` (27460), `progressions` (27918, 28060).
- Direct SQL on `resolutions`: `#narrowCandidateList` (14638), `#contradictionK4` (15029–15030), `#contradictionLadder` (15164–15167), `connections`' reads (26362–26364, 26698, 26749, 26776, 26940), `#missingMeaningCause` (43934). Each takes a service or the stated read contract (requirements, Suggestions); BOB decides which.
- Direct SQL on `entities`: `#frontierMeaning` (44133), `#counts` (31962–31964) and `purge`'s report (33519), which read the declared tables.
- `affordances.mjs` stops defining `ENTITY_KINDS`/`RELATION_KINDS` and re-exports them (N13).
- `index.mjs` is unchanged: its ops route to the store, which delegates.

## 4. Old-battery tests that anchor on the moved source

Negative controls and pins that read the text of moved code move or re-anchor with it (a `legacy-tests` entry, K53): `readingname.test.mjs` (`#labelTerms`, `#normAlias`, `#recogniseTier`, `#refTermsSql`, `readingNamePlan`; the fold part follows `extraction`), `ref-variance.control.mjs` (`#normAlias`, extraction's), `nc-m038.mjs`, `bounds.test.mjs` and `derivation-bounds.test.mjs` (the `documentsNamingEntity` arms), `meaning-bounds.test.mjs` (`#upsertResolution`; it reads the dispatch table positionally, so the moved entries must keep the `op: () => this.method(` shape or the bound walk loses them), `d470-catalog-census.test.mjs` and `rec203-idspaces.test.mjs` (C-91; N6 moves the latter to the new names), `hygiene.test.mjs` (purge lists), and `civicos-ui/check-refusal-codes.mjs` (the DEC-49 regions `is-idspace-*`). Suites that drive the behaviour through the plane and follow the module as its tests: `entityregistry`, `resolution`, `resolveset`, `readingname`, `rec203-idspaces`, `machine-fences` (the stamps). `label-variance-probe.mjs` and `ref-variance-probe.mjs` are measurement instruments.

## 5. Undetermined, conflicts, and code others could claim

1. **Uses.** `modules.json` gives `entities` `jurisdictions`, `legacy-checks`, `id-spaces`, `record-core` and `content`. The moved code also calls `membership` (the viewer gate, R14–R22), `extraction` (the fold and the read contract over `reading_refs`, `reading_ref_terms` and `readings`) and `provenance` (the captured locators, R48 there; `originOf`, R23). Nothing calls `content`. Proposed: add `membership`, `extraction` and `provenance`, and drop `content`.
2. **Listeners, not calls.** `connections`, `observation-log` and `scheduler` come later in the order. The resolve path reaches them only through R13's registrations: `legacy-store` registers each until its module is extracted. `observation-log`'s `uses` already names `entities`. `connections` registers the dirty mark.
3. **The sight question** (requirements Open for Bob 1) decides whether R14 and R15 keep their rows. The job builds whichever Bob rules. Until then the answers stay as they are.
4. **N6.** `op=idmatch` moves to the view-first services, and the view comes from the active profiles (`record-core` R26, not yet met: N10). Until N10, K35's fallback stays in force: every non-test profile `jurisdictions` holds. The outward text of `idmatch` belongs to `affordances` in N6, and C-91's translations belong here (R25).
5. **Shared constants.** `#GRADE_RANK` and `#MEANING_LIMIT_DEFAULT/MAX` are used by `connections`, progressions and the earned-basis registry. `entities` exports them, and each later module imports them.
6. **Other claimants.** `extraction`: the term fold (§2). `observation-log`: the resolution attempt row and the missing cause. `inquiry`: C-2.8. `progressions`, `strength`: `strongestByCapture`. The themes region (store 22904–23215: `themeDeclare`, `themePlace`, `themePropose`, `themeRead`; Framework §8.4 says a theme is not an entity) is claimed by no module. `connections` or a module of its own could hold it, and BOB places it.
