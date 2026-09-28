# reevaluation — extraction map

**Status** · Checked against `tranche/T7` @ `e15806be` by a worker for BOB #50 (P18) (`store.mjs` 33,756 lines, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,629, `index.mjs` 9,069); every line number below is re-measured there (the measured sizes are left as first measured). Corrections: lines re-measured; `content` is extracted, so the notice's passage arm (`VERSION_NOTICE_ADDRESSES_MAX` … `#versionNoticeFor`) is already gone from the store to content/index.mjs (`noticeForRow` 1046, `passageNotice` 1115) and content/notice.mjs, leaving `#capturedAddresses` (25431–25442) between the D-394 header and `versionNotice`; the `bundles.reeval_*` columns are already `retrieval`'s (retrieval/schema.mjs 28, projection.mjs 16, 80), not in the store's migrations; `versionChain` and `#refEdgeSevered` are delegations to `provenance` and `connections` (store 25274, 2890); §5.2 is met: `promotion` offers `onReopened` (its R46, promotion/index.mjs 173), and legacy-store registers reevaluation's answer there in its name (store 794–795), so `reopen`'s field has its route. Measured 2026-09-26 on `tranche/T3` @ `f324df9b0f` (`store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682, `index.mjs` 13,438) by a drafting worker for BOB #43 (P18). A method's range runs from the comment block above it to its closing brace. The contract is `build/requirements/reevaluation.md` (R1–R24); K3, K4, K6, K23, K31, K61, K73 (5) apply. The module exports `reevaluationOf(ctx)` (K61), reaching `inquiry`, `content`, `connections`, `strength`, `basis-versions`, `provenance`, `membership` and `promotion` through theirs. `from` should read `["legacy-store", "legacy-checks"]`. Nothing moves from `index.mjs`: its op table rows (`reevaluations` 527, `changedfromaudit` 693, `versionnotice` 727) and the stamping sites (the viewer-stamp list, 7548, 7627) are `control-plane`'s routing and authentication.

## 1. What moves to `reevaluation`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| `#reevalRaisedBy` with its comment | store | 2876–2888 | becomes `raise` (R7), with the cause and `since` the four callers pass today |
| the REC-17 / P-64 header, `reevaluations`, `#reevalLegsEarned`, `#reevalMoved`, `#frontmatterOf`, `#basisFrontmatter` | store | 20751–21116 | R1–R6; `#frontmatterOf` and `#basisFrontmatter` as strength's map §2 already says |
| D-256 header, `changedFromAudit`, `CHANGED_FROM_AUDIT_LIMIT_DEFAULT`, `_MAX`, `CHANGED_FROM_SENTENCE` | store | 25276–25374 | R12–R13 |
| D-394 header, `VERSION_NOTICE_LEGS_MAX` | store | 25376–25430 | R11; `VERSION_NOTICE_ADDRESSES_MAX` onward is already `content`'s (`passageNotice`, extracted); `#capturedAddresses` (25431–25442) after it is shared with `strength`'s `#independenceOf` (a copy each, or a `provenance` read) |
| `versionNotice` | store | 25443–25516 | R10–R11; the passage arm calls `content.passageNotice` instead of `#versionNoticeFor` |
| dispatch `changedfromaudit`, `reevaluations`, `versionnotice` | store | 32878–32880, 32923–32931, 33112–33117 | K3 |
| `REEVAL_SOURCES`, `checkReevalPending` (C-10.1) with its header | bio-checks | 1208–1256 | R22, registered with `promotion` as a check; the call at 1205 inside the core frontmatter check is removed with it |
| the C-80 header, `VERSION_NOTICE_NO_SUBJECT` (C-80.1), `VERSION_NOTICE_NO_INQUIRY` (C-80.2) | bio-checks | 13060–13090 | R10; `VERSION_NOTICE_NO_CONTENT` (C-80.3, 13091–13101) goes to `content` (still in the catalogue at this commit); the object is split by the first job to move, numbers unchanged (content map §5.4) |

**Schema (K4).** No table moves. The `bundles.reeval_flag`, `reeval_since`, `reeval_source` columns are a projection of `reeval_pending` that `retrieval` has already taken (K75 (3); retrieval/schema.mjs 28, 41, projection.mjs 16, 80); the store still reads them in `reevaluations` (20845–20919); this module reads the triple off the dependent's document instead (Suggestions). R14–R16 add this module's own tables when they are built, keyed by the bundle they are about and declared to purge (K23).

**Measured size:** store.mjs 622 (295 code), bio-checks.mjs 81 (about 40): about 700 lines, about 335 of code.

## 2. What stays in `legacy-store` or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `VERSION_NOTICE_ADDRESSES_MAX`, `VERSION_NOTICE_STATES`, `#extentBoundUnheld`, `#extentTestAcross`, the grades, `#versionNoticeFor` and their helpers | content/index.mjs 1008–1140, content/notice.mjs (extracted) | `content` | its `passageNotice` (R29–R31); K73 (5) |
| `basisFor`, `restingOn`, `#restsOnLive`, `Store.supersededByOf`, `earnedBasisRegistry`, `Store.#capturedAt` | store 20716–20750 and elsewhere | `inquiry` | R16–R17, R13–R14 there; this module calls them |
| `#refEdgeSevered` | store 2890 (a delegation); connections/index.mjs 831 | `connections` (extracted) | `edgeSevered` (its R22) |
| `strengthOf`, `STRENGTH_AXES` | store 21117ff. | `strength` | R4 calls it |
| `versionChain` | store 25274 (a delegation); provenance/index.mjs 1465 | `provenance` (extracted) | its service (R12 calls it) |
| `caseFlags`, dispatch `caseflags` | store 3142–3225 | `publication` | the revision flags read published cases only |
| the monitor-tick envelope that writes `reeval_pending` (`MECHANICAL_FIELD_SETS['monitor-tick']`, bio-checks 5204; index.mjs 6323, 6390) | bio-checks, index | `promotion` (the envelope) and `monitoring` (the writer) | a writer of the authored flag, not a reader of the obligation |
| the four acts' `reevaluation` reply fields | store 2861–2869, 794–795 (the reopen registration), 6948–6956, 10686–10691 | `inquiry` (dispose, divide: `onRaised`), `promotion` (reopen, through `onReopened`, its R46, built), `publication` (edition) | each act stays with its module and calls R7 |

## 3. Callers to rewire

- `#reevalRaisedBy`: `dispose` (2869), `reopen` (legacy-store's `onReopened` registration, 794–795), the edition arm of `publishCase` (6955), `divide` (10691) → `raise` (R7), through `inquiry.onRaised`, promotion's `onReopened`, and `publication` directly.
- `this.strengthOf` (20924), `this.earnedBasisRegistry` and `Store.#capturedAt` (`#reevalLegsEarned`), `this.#restsOnLive`, `Store.supersededByOf`, `this.#refEdgeSevered`, `this.#viewerSees`, `this.#bundleRedactor`, `this.versionChain`, `this.#versionNoticeFor` → the owning modules' services (§2).
- `REOPENABLE_FROM` is already `promotion`'s export (`promotion/index.mjs` 34).
- `published_bundles` (`#reevalMoved`'s `MAX(edition)`) is `publication`'s table, later in the order: read through the fact `publishedRegistry` registered with `promotion` (K83 (5)), as `inquiry` reads it.
- Direct SQL on `inquiry_basis` (20819, 20833, 25484) → `inquiry`'s stated read contract (inquiry map); on `register` and `captured_locators` (25333, 25440) → `provenance`'s read contract (its R48).

## 4. Old-battery tests that anchor on the moved source

Suites that follow the module: `reevaluation.test.mjs`, `rec118-reeval-earned.test.mjs` (block 5 pins the three earned-grade resolvers to one policy by source text), `versionnotice.test.mjs`, `versionchain.test.mjs` (the `changedFromAudit` arms, the no-write assertion), `severedhomes.test.mjs` (the severed-leg arm). Negative controls and pins that read moved text (a `legacy-tests` entry, K53): `nc-d394.mjs` (the notice, split with `content`), `nc-rec118.mjs`, `nc-rec114.mjs`, `nc-rec119.mjs`, `bounds.test.mjs` and `derivation-bounds.test.mjs` (the method-signature segmenter over `CHANGED_FROM_AUDIT_*` and `VERSION_NOTICE_LEGS_MAX`), `check-firing.test.mjs` (C-10.1, C-80), `hygiene.test.mjs`, `gate-reads.test.mjs`, `project-sight.test.mjs`/`.control.mjs` (the op's classes), `inquirystrength.test.mjs` and `d280-strengthbar.test.mjs` (the `strength` block of the answer).

## 5. Undetermined, conflicts, and code others could claim

1. **Uses.** Declared: `legacy-checks`, `record-core`, `content`, `connections`, `inquiry`, `basis-versions`, `strength`. The moved code also calls `membership` (the gates, the redactor), `promotion` (`REOPENABLE_FROM`, the published registry fact) and `provenance` (`versionChain`, `register`, `captured_locators`). Proposed: add all three.
2. **`reopen`'s field has no route.** Met since: `promotion` offers `onReopened` (its R46, promotion/index.mjs 173) and legacy-store registers this module's answer in its name (store 794–795); the job moves that registration here.
3. **C-10.1's home.** It checks a universal frontmatter field and runs inside the core check at 1205; it could be `record-core`'s or `promotion`'s. Placed here because it is the obligation's authored form; it runs registered with `promotion`.
4. **Open for Bob 1–3** (the stored flag against the derived obligation; a weaker derivation; `chain_unread`) change what R16, R17 and R14 build, not what moves.
5. **Other claimants.** `content`: the notice's passage arm (settled, K73 (5)). `provenance`: `changedFromAudit` reads only its chain (its map §2 left it to "content/publication readers"). `publication`: `caseFlags`, the edition act. `inquiry`: the reverse lookups this module reads.

## 6. The ADDED lines expected in the legacy modules

- `store.mjs`: `import { reevaluationOf } from "./reevaluation/index.mjs"`; `reevaluations`, `versionNotice` and `changedFromAudit` become one-line delegations (`return reevaluationOf(this.ctx).reevaluations(args)`, likewise) so the old battery and the dispatch keep working; `#reevalRaisedBy` becomes a delegation to `raise` until `inquiry`, `promotion` and `publication` call it themselves; the `onRaised` registration `legacy-store` makes for `inquiry` points at `raise`. About 10 lines.
- `bio-checks.mjs`: nothing added; the call at 1205 and the two ranges are removed, and C-10.1 runs through the module's registered check.
