# filings — extraction map

**Status** · DRAFT by a drafting worker for BOB #48, 2026-09-27 (P18), measured at tranche/T6 @ c7dfd835ef; for BOB's review. (`store.mjs` 33,816 lines, `index.mjs` 9,069, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,317.) The contract is `build/requirements/filings.md` (R1–R20); K4, K13, K23, K31, K61, K92 (4), K102, K108 (4)–(5) (N72), N69 apply. The module exports `filingsOf(ctx)` (K61). A new module: no `from`, and none is needed (§1).

## 1. What moves to `filings`

Nothing. `grep` for a template, a pre-filled filing, an evidence package block, a counsel packet or a candidate theory over `store.mjs`, `index.mjs`, `container.mjs`, `deliverer.mjs` and `bio-checks.mjs` finds only the tier words and the `court_filing` stage (§2). No catalogue row, table, op or migration belongs to it. **Schema (K4):** `filing_drafts`, `filing_approvals`, `filing_sendings`, `counsel_packets`, `counsel_packet_exports`, `theory_proposals` are new, declared to purge (R19).

**Measured size:** 0 lines moved. Estimated 900–1,300 lines of new code.

## 2. What stays, or belongs to another module, and why

| what | where today (T6) | owner | why |
| --- | --- | --- | --- |
| `RISK_TIERS` (the tier words: "do not file without counsel"), `riskTierState` | bio-checks 538–551 | `actions` | the action's risk tier (actions R23–R25); R2 reads it through `actionRead` |
| `CORRESPONDENCE_DIRECTIONS`, `CORRESPONDENCE_STAGES` (`sent` includes `court_filing`) | bio-checks 811, 4505–4509 | `actions` | R7's `sent` entry is written by `actions.actionCorrespond` with its vocabulary |
| `actionCorrespond`, `#spliceCorrespondence` | store 4923ff. | `actions` | R7 calls it |
| `ACTION_KINDS` (a state's records law and local kinds) | bio-checks 524 | `actions` (its R10 retires the place names) | the kinds R1–R4 read come from the profile's `action_kinds`, never from here (R20) |
| `lawProposalLabel` and states; `isMachineIdentity` | bio-checks 743–800, 1667–1693 | `legacy-checks` | R5, R14, R16 read them by import (§5.1) |
| `container.mjs` (the stored ZIP) | `bio-plane/src/container.mjs` | `publication` | a possible packet format (Suggestions); R11 forbids any path to publication, so a copy or a pure import only |
| `attest`, `attestStatus` | provenance/index.mjs 599–731 | `provenance` | writes attestations; R9 needs a read (§5.4) |

## 3. What earlier modules must provide (uses)

| use | service | in its Provides? |
| --- | --- | --- |
| `jurisdictions` | `combine`'s `action_kinds` (tier, venue, template, laws), `counterparties`, `deadlines`, `records_laws`; `advisory` (R4), `legal_organisations` (R15), `holidays` (N72) | kinds, tier, venue, template, counterparties, deadlines yes (R24–R29, built); **`advisory`, `legal_organisations`, `holidays` not built** at T6 (jurisdictions R25, R32–R36 not yet met; `SECTIONS`, index.mjs 16–18, holds none) |
| `record-core` | `allocId`, `transact`, `stampInstant`, `getSetting`, `declarePurge` | yes |
| `membership` | `viewerPredicate` | yes |
| `provenance` | a capture's digest, locator, capture time (`homeOf`, `receipts`), attestations; capturing the approved bytes | digest/locator/time yes; **no read of a capture's recorded attestations** (§5.4) |
| `content` | the passages facts and exhibits cite | yes |
| `publication` | a finding's published edition (R3, R9); the evidence-package registration (its R36) for R15 | editions yes (R9, R10); R36 stated, not yet met (K108 (4), N69); publication not yet extracted |
| `standards` | `standardRead`, `inForce` | yes (standards R5, R7) |
| `conformance` | `determinationRead`, `determinationsFor`, R10's flag | yes |
| `consequences` | `consequencesOf` | yes |
| `actions` | `actionRead` (R29), `actionCorrespond` (R15–R16), `clockPropose` (R32), the action's risk tier, legs, counterparty and governing laws | yes; R29 and R32 are actions' not yet met |

## 4. The ADDED lines expected in the legacy modules

- `legacy-store`, `legacy-index`/`control-plane`: dispatch, `OPS` entries and classes for `filingPrepare`, `filingApprove`, `filingRecordSent`, `counselPacket`, `counselPacketRead`, `counselPacketExport`, `filingsFor`, `theoryPropose` (K3). About 25 lines. Catalogue rows for new codes if DEC-49 applies.
- `publication` (by then extracted): nothing; filings fills R36's registration at start (K31).

## 5. Undetermined, conflicts, and code others could claim

1. **`lawProposalLabel`'s sentence** names an action's governing-laws citations (bio-checks 769–776); R5 and R14 label drafts and theories with it. As standards map §5.1: BOB decides.
2. **N72 is not folded, and conflicts with "Decided by BOB".** K108 (5) says R9's claim deadlines count business days on the holiday calendar; R9 still says a date is computed "only from … a `calendar` count", and the last "Decided by BOB" line says "calendar counts only", while `actions` R32 (which that line cites) now counts business days by `jurisdictions` R33. BOB folds N72 into R9 and corrects the ruling line.
3. **Prerequisites not yet built.** `jurisdictions` R25's `advisory`, R32 and R33 (R4, R15, N72) and `publication` R36 (R15) must land before this job; `actions` R29 (`actionRead`) and R32 (`clockPropose`) are the same tranche's, earlier in the order.
4. **Exhibits' attestations (R9).** An attestation is recorded in the capture's document entry (C-18: `co_archive`, `timestamp`); provenance offers `attest` but no read of what was recorded. Proposed: provenance states a read `attestationsOf(captureSha)`, or R9 reads the entry from the bundle document; BOB decides.
5. **Governing tier when the profile gives the kind none** is "the action's tier alone" (Terms), but R1 refuses `KIND_NO_TEMPLATE` for such a kind at Tier 1–2 anyway; only a counsel packet (Tier 3) is reachable then. Consistent, noted for the tests.
6. **Escalation reads the available-actions block** (escalation R8) directly, but R15 offers it only as a block inside `publishedCase`. The job exports the block's function for `escalation` too, or escalation reads the published case; BOB decides.
7. **Not yet met:** every R1–R20 (new module).
