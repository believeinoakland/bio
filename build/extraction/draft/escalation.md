# escalation — extraction map

**Status** · DRAFT by a drafting worker for BOB #48, 2026-09-27 (P18), measured at tranche/T6 @ c7dfd835ef; for BOB's review. (`store.mjs` 33,816 lines, `index.mjs` 9,069, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,317.) The contract is `build/requirements/escalation.md` (R1–R20); K4, K12, K14, K23, K31, K61, K92 (3), K102, K108 (3) and (5) (N72) apply. The module exports `escalationOf(ctx)` (K61). A new module: no `from`, and none is needed (§1).

## 1. What moves to `escalation`

Nothing. `grep -i escalat` over `store.mjs` and `index.mjs` at T6 finds only unrelated uses: DEC-10's notification escalation in the scheduler registry comment (store 1911), de-escalation of overclaims (store 10268, index 2248, 2273), a queue finding kind (store 19325), the capture ladder (index 5881); the host governor's back-off now lives in `bio-plane/src/host-governor/`. No catalogue row, table, op or migration belongs to it. **Schema (K4):** `escalations`, `escalation_moves`, `escalation_evaluations`, `escalation_attachments`, `escalation_declines` are new, declared to purge (R20).

**Measured size:** 0 lines moved. Estimated 800–1,200 lines of new code.

## 2. What stays, or belongs to another module, and why

| what | where today (T6) | owner | why |
| --- | --- | --- | --- |
| `RESOLUTIONS` (with `escalated`) | bio-checks 838 | `actions` | an action's resolution word; this module never writes it |
| `CORRESPONDENCE_DIRECTIONS` (`sent`, `received`, `no_response`) | bio-checks 811 | `actions` | the ledger facts R5–R7, R11 read through `actionRead` |
| `actionClockNext`, `actionOverdue` | store 1261–1281 (statics) | `actions` (`actionFacts`, its R12; actions map §5.6) | R6's time trigger reads the one clock rule, never a copy |
| progressions' declared stages and overdue marking | `bio-plane/src/progressions/` | `progressions` | a member's template for a recurring process; the protocol's stages are fixed (Suggestions) and not reused |
| `isMachineIdentity` | bio-checks 1667–1693 | `legacy-checks` | R17 |

## 3. What earlier modules must provide (uses)

| use | service | in its Provides? |
| --- | --- | --- |
| `record-core` | `allocId`, `transact`, `stampInstant`, `declarePurge` | yes |
| `membership` | `viewerPredicate`, `projectAuthority`, `sight` (R20) | yes |
| `jurisdictions` | `combine`'s `counterparties` with `elected` (R12) and `oversight` (N72) | `elected` yes (built, validator index.mjs ~331); **`oversight` not built** (jurisdictions R24's, not yet met) |
| `conformance` | `determinationRead`, `determinationsFor` (R1, R4, R14) | yes; "the same act" is undefined (§5.3) |
| `consequences` | `addressed` (R3, R14) | yes; the empty case is unstated (§5.4) |
| `actions` | `actionRead` (R29), `actionsFor` (R30), `actionFacts` (R12), the `breach: true` leg rule (R8) | yes; R8, R29, R30 are actions' not yet met, same tranche, earlier. The `accountability` purpose and standard R12 needs are not in actions' document (§5.5) |
| `filings` | `filingsFor` (R13), the available-actions block (R15) | `filingsFor` yes; the block is offered only through `publication` (filings map §5.6) |
| `promotion` | `promote`, an escalation being a record object (K108 (3)) | **not in uses** (§5.1) |

## 4. The ADDED lines expected in the legacy modules

- `legacy-checks`: the `ESC` prefix and an escalation state table (`open`, `suspended`, `ended`) if K108 (3) stands (standards map §5.2); catalogue rows for new codes if DEC-49 applies.
- `legacy-store`, `legacy-index`/`control-plane`: dispatch, `OPS` entries and classes for `escalationOpen`, `escalationRead`, `escalationAttach`, `escalationEvaluate`, `escalationAdvance`, `escalationDecline`, `escalationEnd`, `escalationSuspend`, `escalationResume`, `escalationsDue` (K3). About 25 lines. `monitoring` (layer 10) calls R16 in process.

## 5. Undetermined, conflicts, and code others could claim

1. **Record object or tables.** K108 (3) rules an escalation a record object; the requirements' Suggestions still say "not settled … stays these tables until BOB rules", and N72 asks the file to state it. If it is a record object, `modules.json` uses gain `promotion`, and the type needs the catalogue entries of standards map §5.2. BOB folds N72.
2. **N72's oversight check is not folded.** K108 (5): R12's `oversight_request` and `audit_request` check the office's `oversight` marker; R12 checks only `elected` for `official_request`. Needs jurisdictions R24's `oversight` built first.
3. **"The same act" (R14)** has no identity in `conformance` (conformance map §5.5); R14 cannot be built until BOB says what it is.
4. **Consequences with no parts** read `addressed` vacuously under consequences R9, so R14 could end an escalation on consequences never recorded (consequences map §5.3). And if compliance is restored by a determination that supersedes the escalation's own, R14 reads `addressed` for a superseded determination (consequences map §5.4).
5. **Stage-7 acts' fields.** R12 needs each attached action to state an `accountability` purpose and the standard it seeks enforced; `actions`' document (its Terms) and C-2.10's action checks carry neither, only `breach: true` (actions R8). Either actions' requirements gain the two fields (and a check), or escalation records them on the attachment (R9) rather than the action. BOB decides.
6. **R2's "first met" instant** is a Suggestion (the latest date of the ids that meet it); R16's ordering and every age depend on it. BOB confirms it as a requirement.
7. **Not yet met:** every R1–R20 (new module).
