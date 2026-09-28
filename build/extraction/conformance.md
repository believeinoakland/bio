# conformance — extraction map

**Status** · Drafted by a worker for BOB #48, 2026-09-27 (P18), measured at `tranche/T6` @ `c7dfd835ef` (`store.mjs` 33,816 lines, `index.mjs` 9,069, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,317). ADOPTED by BOB #50, 2026-09-27 (K171), after its review (`docs/development/transition/drafts/layer9-review.md`); re-measured at `tranche/T7` @ `62a9517b6f` (`main` @ `8899ac7d97`, T6's layers 1–2 merged): `store.mjs` 33,760 lines, `bio-checks.mjs` 14,629, `index.mjs` and `schema.mjs` unchanged. Every `bio-checks` line cited below is unchanged; `store.mjs` lines cited up to about 5,800 are 2 later, and later ones about 56 earlier (review §3.1), not re-edited line by line. **Re-cited** on `tranche/T7` @ `fd7e691a17` by a worker for BOB #53 (K214), after T7's layers 7 and 11 (`store.mjs` 18,726 lines, `schema.mjs` 1,176, `checks/bio-checks.mjs` 13,732): every `store.mjs`, `schema.mjs`, `bio-checks.mjs` and module-file line below is current there, superseding the sentence before; `index.mjs` cites were re-cited at T8's opening, on `tranche/T8` @ 12e2067a5f (K226). §5's questions are resolved by K171 (and K172), as marked. The contract is `build/requirements/conformance.md` (R1–R17); K4, K12, K23, K31, K61, K88, K102 apply. The module exports `conformanceOf(ctx)` (K61). A new module: `modules.json` gives it no `from`, and none is needed (§1).

## 1. What moves to `conformance`

Nothing. `grep` over `store.mjs`, `schema.mjs`, `index.mjs` and `bio-checks.mjs` for `compliant`, `noncompliant`, `determination` (as a record of an act), `CONF-` and a comparison finds none; "determination" hits (bio-checks 2724–2729, 7460–7880, 9873–9953) are DEC-44's and D-199's case determinations, unrelated. No catalogue row, table, op or migration belongs to it. **Schema (K4):** its tables (`determinations`, `determination_standards`, `determination_findings`, `determination_questions`, `comparison_proposals`) are new, declared to purge (R16).

**Measured size:** 0 lines moved. Estimated 700–1,000 lines of new code.

## 2. What stays, or belongs to another module, and why

| what | where today (T6) | owner | why |
| --- | --- | --- | --- |
| `published_cases`, `published_case_members` (`version_sha`, `role`) DDL | schema 387, 455 | `publication` | "published" is membership of a published case edition (R2); read through publication |
| `#caseRelationOf`, the fact `caseMember` | store 2192–2207, the registration at 724 (legacy-store's, in publication's name, K206) | `publication` (its R4) | answers the finding's **current** sha only; see §5.3 |
| `action_basis` DDL, `actionBasisFindings` (C-2.10: legs on `INFO`/`INQ`/`PROB`/`FOCUS`) | schema 678, bio-checks 4202–4250 | `actions` | its R8 makes a breach action rest on a determination; it needs this module's prefix (§5.2) |
| `lawProposalLabel` and its states | bio-checks 769–800 | `legacy-checks` | R12 reads it by import (§5.1) |
| `isMachineIdentity` | bio-checks 1631–1642 | `legacy-checks` | R1, R13 |

## 3. What earlier modules must provide (uses)

| use | service | in its Provides? |
| --- | --- | --- |
| `record-core` | `allocId`, `transact`, `stampInstant`, `declarePurge` | yes |
| `membership` | `sight`, `projectAuthority(project, author, "joined")`, `viewerPredicate` | yes (R43, R44, R55) |
| `promotion` | `promote` (the determination, R17; R6's new inquiry) | `promote` yes; the `CONF-` type by the head-of-layer `legacy-checks` job (K171 (1)); two bundles land as two promotions in one outer `transact` (§5.4, K171 (5)) |
| `content` | `contentRow`, `passageNotice` | yes |
| `inquiry` | `supersededBy`, `stateHistory` | provided and merged (K189, K190): `supersededBy` (`inquiry/index.mjs` 474, in its R16–R19 reads) and `stateHistory` (491, inquiry R19) |
| `strength` | `inquiryStrength` | provided and merged (K188): `strength/index.mjs` 258, strength R6; no store copy remains |
| `reevaluation` | `onBasisChanged` (its R8) | built and merged in T7 (K205): `reevaluation/index.mjs` 503 (`changesOf`, R9, at 548); reevaluation's requirements still mark R8 and R9 not yet met, for BOB to lift at T8's opening; re-checked when this job starts |
| `publication` | a finding-version's membership of a published edition of a project, its frozen pair | `publishedEditionsOf` (publication R37, K171 (4)), not yet met; publication is not yet extracted |
| `standards` | `standardRead`, `inForce` | yes (standards R5, R7) |
| `legacy-checks` | `isMachineIdentity`; `proposalLabel` | `isMachineIdentity` yes; `proposalLabel` added by the head-of-layer `legacy-checks` job (K171 (2)) |

## 4. The ADDED lines expected in the legacy modules

- `legacy-checks`: the `CONF` prefix and a `determination` state table (standards map §5.2), added by the head-of-layer `legacy-checks` job (K171 (1)), and `CONF` accepted as a `rests_on` target for `actions` R8 (bio-checks 4202–4250 is actions'; it changes with actions' job); catalogue rows for new refusal codes if DEC-49 applies.
- `legacy-store`, `legacy-index`/`control-plane`: dispatch, `OPS` entries and classes for `determine`, `determinationRead`, `determinationsFor`, `comparisonPropose` (K3). About 20 lines.

## 5. Undetermined, conflicts, and code others could claim

1. **`lawProposalLabel`'s sentence** names an action's governing-laws citations (bio-checks 769–776, unchanged); R12 needs a comparison's. As standards map §5.1. *Resolved: `proposalLabel(p, "comparison")` (K171 (2)).*
2. **A new record type** (`determination`, `CONF-`): as standards map §5.2. *Resolved (K171 (1)).*
3. **R2's read is not in publication's Provides.** R2 needs "is version V of finding F a member of a ratified edition of a case owned by project P, and which"; publication R4 answers the current sha only (and counts an unsigned preparation), R10 refuses a finding in several cases. Proposed: publication states a read `publishedEditionsOf({finding, version?, project?})` before layer 9, or conformance composes R7 with the case owner (`cases`); BOB decides. *Resolved: publication R37 `publishedEditionsOf`; conformance composes nothing (K171 (4)).*
4. **R6 lands two bundles together.** The determination and a new inquiry "land together or not at all", but `promote` is one bundle per call; `inquiry` R26 is not yet met for the same reason. Needs a promotion service that promotes several bundles in one `transact`, or R6 read as two promotions with a compensating refusal. BOB decides. *Resolved: two `promote` calls in one outer `transact`; the job reports if they cannot nest (K171 (5)).*
5. **"The same act" has no identity.** An act is a value `{description, actor, at|period, evidence}` with no id, yet R7 (supersede only "of the same act"), R11's `act` filter and escalation R14 compare acts. BOB decides what makes two acts the same (an act id minted by the first determination, or equality of actor and date). *Resolved: an `ACT-` id minted by the first determination (K171 (6)).*
6. **Visibility.** `viewerPredicate` shows every non-project bundle to every member (membership R43); a determination is a project's bundle but not a project, so R15's rule rests on `sight(project, viewer)` for each read, not on the predicate alone. *Resolved: every read gates on `sight` first (K171 (10)).*
7. **Code names.** R1's `NOT_A_PARTICIPANT` differs from what `projectAuthority` answers (`PROJECT_ACT_NOT_A_PARTICIPANT`, membership R55); the job either maps it or answers membership's. Same in `consequences` R1 and `escalation` R1. *Resolved: the modules answer `NOT_A_PARTICIPANT`, translating membership's in one line (K171 (11)).*
8. **Not yet met:** every R1–R17 (new module).
