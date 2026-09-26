# reevaluation — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b0f` (`store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682, `index.mjs` 13,438) by a drafting worker for BOB #43 (P18). A method's range runs from the comment block above it to its closing brace. The contract is `build/requirements/reevaluation.md` (R1–R24); K3, K4, K6, K23, K31, K61, K73 (5) apply. The module exports `reevaluationOf(ctx)` (K61), reaching `inquiry`, `content`, `connections`, `strength`, `basis-versions`, `provenance`, `membership` and `promotion` through theirs. `from` should read `["legacy-store", "legacy-checks"]`. Nothing moves from `index.mjs`: its op table rows (`reevaluations` 749, `changedfromaudit` 897, `versionnotice` 931) and the stamping sites (11976, 12052) are `control-plane`'s routing and authentication.

## 1. What moves to `reevaluation`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| `#reevalRaisedBy` with its comment | store | 4792–4803 | becomes `raise` (R7), with the cause and `since` the four callers pass today |
| the REC-17 / P-64 header, `reevaluations`, `#reevalLegsEarned`, `#reevalMoved`, `#frontmatterOf`, `#basisFrontmatter` | store | 31193–31557 | R1–R6; `#frontmatterOf` and `#basisFrontmatter` as strength's map §2 already says |
| D-256 header, `changedFromAudit`, `CHANGED_FROM_AUDIT_LIMIT_DEFAULT`, `_MAX`, `CHANGED_FROM_SENTENCE` | store | 36670–36768 | R12–R13 |
| D-394 header, `VERSION_NOTICE_LEGS_MAX` | store | 36770–36824 | R11; `VERSION_NOTICE_ADDRESSES_MAX` onward (36825–37180) is `content`'s (`passageNotice`) |
| `versionNotice` | store | 37182–37254 | R10–R11; the passage arm calls `content.passageNotice` instead of `#versionNoticeFor` |
| dispatch `changedfromaudit`, `reevaluations`, `versionnotice` | store | 48536–48539, 48586–48591, 48943–48950 | K3 |
| `REEVAL_SOURCES`, `checkReevalPending` (C-10.1) with its header | bio-checks | 1226–1274 | R22, registered with `promotion` as a check; the call at 1223 inside the core frontmatter check is removed with it |
| the C-80 header, `VERSION_NOTICE_NO_SUBJECT` (C-80.1), `VERSION_NOTICE_NO_INQUIRY` (C-80.2) | bio-checks | 14039–14070 | R10; `VERSION_NOTICE_NO_CONTENT` (C-80.3, 14071–14077) goes to `content`; the object is split by the first job to move, numbers unchanged (content map §5.4) |

**Schema (K4).** No table moves. The `bundles.reeval_flag`, `reeval_since`, `reeval_source` columns (migrations 1045–1047, projected at 1762–1801, indexed at 1542, listed at 1856 and 2203) are a projection of `reeval_pending` that `retrieval` takes (K75 (3)); this module reads the triple off the dependent's document instead (Suggestions). R14–R16 add this module's own tables when they are built, keyed by the bundle they are about and declared to purge (K23).

**Measured size:** store.mjs 622 (295 code), bio-checks.mjs 81 (about 40): about 700 lines, about 335 of code.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `VERSION_NOTICE_ADDRESSES_MAX`, `VERSION_NOTICE_STATES`, `#extentBoundUnheld`, `#extentTestAcross`, the grades, `#versionNoticeFor` and their helpers | store 36825–37180 | `content` | its `passageNotice` (R29–R31); K73 (5) |
| `basisFor`, `restingOn`, `#restsOnLive`, `Store.supersededByOf`, `earnedBasisRegistry`, `Store.#capturedAt` | store 31157–31191 and elsewhere | `inquiry` | R16–R17, R13–R14 there; this module calls them |
| `#refEdgeSevered` | store 4805ff. | `connections` | `edgeSevered` (its R22) |
| `strengthOf`, `STRENGTH_AXES` | store 31559ff. | `strength` | R4 calls it |
| `versionChain` | store, before 36670 | `provenance` | its service (R12 calls it) |
| `caseFlags`, dispatch `caseflags` | store | `publication` | the revision flags read published cases only |
| the monitor-tick envelope that writes `reeval_pending` (`MECHANICAL_FIELD_SETS['monitor-tick']`, bio-checks 5877; index.mjs 10308, 10754) | bio-checks, index | `promotion` (the envelope) and `monitoring` (the writer) | a writer of the authored flag, not a reader of the obligation |
| the four acts' `reevaluation` reply fields | store 4782–4789, 7894–7897, 8976–8986, 12714–12721 | `inquiry` (dispose, divide: `onRaised`), `promotion` (reopen, through a registration it must offer), `publication` (edition) | each act stays with its module and calls R7 |

## 3. Callers to rewire

- `#reevalRaisedBy`: `dispose` (4784), `reopen` (7896), the edition arm of `publishCase` (8985), `divide` (12721) → `raise` (R7), through `inquiry.onRaised`, promotion's reopen registration, and `publication` directly.
- `this.strengthOf` (31365), `this.earnedBasisRegistry` and `Store.#capturedAt` (`#reevalLegsEarned`), `this.#restsOnLive`, `Store.supersededByOf`, `this.#refEdgeSevered`, `this.#viewerSees`, `this.#bundleRedactor`, `this.versionChain`, `this.#versionNoticeFor` → the owning modules' services (§2).
- `REOPENABLE_FROM` is already `promotion`'s export (`promotion/index.mjs` 36).
- `published_bundles` (`#reevalMoved`'s `MAX(edition)`) is `publication`'s table, later in the order: read through the fact `publishedRegistry` registered with `promotion` (K83 (5)), as `inquiry` reads it.
- Direct SQL on `inquiry_basis` (31260, 37222) → `inquiry`'s stated read contract (inquiry map); on `register` and `captured_locators` (36724) → `provenance`'s read contract (its R48).

## 4. Old-battery tests that anchor on the moved source

Suites that follow the module: `reevaluation.test.mjs`, `rec118-reeval-earned.test.mjs` (block 5 pins the three earned-grade resolvers to one policy by source text), `versionnotice.test.mjs`, `versionchain.test.mjs` (the `changedFromAudit` arms, the no-write assertion), `severedhomes.test.mjs` (the severed-leg arm). Negative controls and pins that read moved text (a `legacy-tests` entry, K53): `nc-d394.mjs` (the notice, split with `content`), `nc-rec118.mjs`, `nc-rec114.mjs`, `nc-rec119.mjs`, `bounds.test.mjs` and `derivation-bounds.test.mjs` (the method-signature segmenter over `CHANGED_FROM_AUDIT_*` and `VERSION_NOTICE_LEGS_MAX`), `check-firing.test.mjs` (C-10.1, C-80), `hygiene.test.mjs`, `gate-reads.test.mjs`, `project-sight.test.mjs`/`.control.mjs` (the op's classes), `inquirystrength.test.mjs` and `d280-strengthbar.test.mjs` (the `strength` block of the answer).

## 5. Undetermined, conflicts, and code others could claim

1. **Uses.** Declared: `legacy-checks`, `record-core`, `content`, `connections`, `inquiry`, `basis-versions`, `strength`. The moved code also calls `membership` (the gates, the redactor), `promotion` (`REOPENABLE_FROM`, the published registry fact) and `provenance` (`versionChain`, `register`, `captured_locators`). Proposed: add all three.
2. **`reopen`'s field has no route.** `promotion` is earlier; its requirements offer checks, projections and facts (R39–R40) but no hook for an act's reply, so `reopen`'s `reevaluation.raised` cannot be produced once `legacy-store`'s wrapper (7894–7897) goes. Proposed: promotion offers `onReopened`, filled here (a flaw in promotion's reopen requirements, reported).
3. **C-10.1's home.** It checks a universal frontmatter field and runs inside the core check at 1223; it could be `record-core`'s or `promotion`'s. Placed here because it is the obligation's authored form; it runs registered with `promotion`.
4. **Open for Bob 1–3** (the stored flag against the derived obligation; a weaker derivation; `chain_unread`) change what R16, R17 and R14 build, not what moves.
5. **Other claimants.** `content`: the notice's passage arm (settled, K73 (5)). `provenance`: `changedFromAudit` reads only its chain (its map §2 left it to "content/publication readers"). `publication`: `caseFlags`, the edition act. `inquiry`: the reverse lookups this module reads.

## 6. The ADDED lines expected in the legacy modules

- `store.mjs`: `import { reevaluationOf } from "./reevaluation/index.mjs"`; `reevaluations`, `versionNotice` and `changedFromAudit` become one-line delegations (`return reevaluationOf(this.ctx).reevaluations(args)`, likewise) so the old battery and the dispatch keep working; `#reevalRaisedBy` becomes a delegation to `raise` until `inquiry`, `promotion` and `publication` call it themselves; the `onRaised` registration `legacy-store` makes for `inquiry` points at `raise`. About 10 lines.
- `bio-checks.mjs`: nothing added; the call at 1223 and the two ranges are removed, and C-10.1 runs through the module's registered check.
