# escalation — extraction map

**Status** · Drafted by a worker for BOB #48, 2026-09-27 (P18), measured at `tranche/T6` @ `c7dfd835ef` (`store.mjs` 33,816 lines, `index.mjs` 9,069, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,317). ADOPTED by BOB #50, 2026-09-27 (K171), after its review (`docs/development/transition/drafts/layer9-review.md`); re-measured at `tranche/T7` @ `62a9517b6f` (`main` @ `8899ac7d97`, T6's layers 1–2 merged): `store.mjs` 33,760 lines, `bio-checks.mjs` 14,629, `index.mjs` and `schema.mjs` unchanged. Every `bio-checks` line cited below is unchanged; `store.mjs` lines cited up to about 5,800 are 2 later, and later ones about 56 earlier (review §3.1), not re-edited line by line. §5's questions are resolved by K171 (and K172), as marked. The contract is `build/requirements/escalation.md` (R1–R21); K4, K12, K14, K23, K31, K61, K92 (3), K102, K108 (3) and (5) (N72) apply. The module exports `escalationOf(ctx)` (K61). A new module: no `from`, and none is needed (§1).

## 1. What moves to `escalation`

Nothing. `grep -i escalat` over `store.mjs` and `index.mjs` at T6 finds only unrelated uses: DEC-10's notification escalation in the scheduler registry comment (store 1911), de-escalation of overclaims (store 10212, index 2248, 2273), a queue finding kind (store 19269), the capture ladder (index 5881); the host governor's back-off now lives in `bio-plane/src/host-governor/`. No catalogue row, table, op or migration belongs to it. **Schema (K4):** `escalations`, `escalation_moves`, `escalation_evaluations`, `escalation_attachments`, `escalation_declines` are new, declared to purge (R20).

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
| `jurisdictions` | `combine`'s `counterparties` with `elected` (R12) and `oversight` (N72) | `elected` yes (built, validator index.mjs ~331); **`oversight` stated, not yet met** (jurisdictions R24's); built by the `jurisdictions` job before layer 9 (K171 (3)) |
| `conformance` | `determinationRead`, `determinationsFor` (R1, R4, R14) | yes; "the same act" is the act id (§5.3, K171 (6)) |
| `consequences` | `addressed` (R3, R14) | yes; the empty case is `undetermined` (§5.4, K172) |
| `actions` | `actionRead` (R29), `actionsFor` (R30), `actionFacts` (R12), the `breach: true` leg rule (R8) | yes; R8, R29, R30 are actions' not yet met, same tranche, earlier. The `accountability` purpose and standard R12 needs are not in actions' document (§5.5) |
| `filings` | `filingsFor` (R13), the available-actions block (R15) | `filingsFor` yes; the block as `availableActions` (filings R21, K171 (14)) |
| `promotion` | `promote`, an escalation being a record object (K108 (3)) | yes; in uses (K108 (3) stands; K171 (3)); the `ESC-` type by the head-of-layer `legacy-checks` job (K171 (1)) |

## 4. The ADDED lines expected in the legacy modules

- `legacy-checks`: the `ESC` prefix and an escalation state table (`open`, `suspended`, `ended`; K108 (3) stands), added by the head-of-layer `legacy-checks` job (K171 (1)); catalogue rows for new codes if DEC-49 applies.
- `legacy-store`, `legacy-index`/`control-plane`: dispatch, `OPS` entries and classes for `escalationOpen`, `escalationRead`, `escalationAttach`, `escalationEvaluate`, `escalationAdvance`, `escalationDecline`, `escalationEnd`, `escalationSuspend`, `escalationResume`, `escalationsDue` (K3). About 25 lines. `monitoring` (layer 10) calls R16 in process.

## 5. Undetermined, conflicts, and code others could claim

1. **Record object or tables.** K108 (3) rules an escalation a record object; the requirements' Suggestions still say "not settled … stays these tables until BOB rules", and N72 asks the file to state it. If it is a record object, `modules.json` uses gain `promotion`, and the type needs the catalogue entries of standards map §5.2. BOB folds N72. *Resolved: escalation R21, uses + `promotion` (K171 (3)).*
2. **N72's oversight check is not folded.** K108 (5): R12's `oversight_request` and `audit_request` check the office's `oversight` marker; R12 checks only `elected` for `official_request`. Needs jurisdictions R24's `oversight` built first. *Resolved: folded into R12 (K171 (3)); `oversight` by the `jurisdictions` job before layer 9.*
3. **"The same act" (R14)** has no identity in `conformance` (conformance map §5.5); R14 cannot be built until BOB says what it is. *Resolved: the act id (K171 (6)).*
4. **Consequences with no parts** read `addressed` vacuously under consequences R9, so R14 could end an escalation on consequences never recorded (consequences map §5.3). And if compliance is restored by a determination that supersedes the escalation's own, R14 reads `addressed` for a superseded determination (consequences map §5.4). *Resolved: the empty case `undetermined` (K172); addressed on a superseded determination's parts accepted (K171 (7)).*
5. **Stage-7 acts' fields.** R12 needs each attached action to state an `accountability` purpose and the standard it seeks enforced; `actions`' document (its Terms) and C-2.10's action checks carry neither, only `breach: true` (actions R8). Either actions' requirements gain the two fields (and a check), or escalation records them on the attachment (R9) rather than the action. BOB decides. *Resolved: on the attachment (K171 (15)).*
6. **R2's "first met" instant** is a Suggestion (the latest date of the ids that meet it); R16's ordering and every age depend on it. BOB confirms it as a requirement. *Resolved: R2's text (K171 (16)).*
7. **Not yet met:** every R1–R21 (new module).
