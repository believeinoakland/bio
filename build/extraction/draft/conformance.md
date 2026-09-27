# conformance — extraction map

**Status** · DRAFT by a drafting worker for BOB #48, 2026-09-27 (P18), measured at tranche/T6 @ c7dfd835ef; for BOB's review. (`store.mjs` 33,816 lines, `index.mjs` 9,069, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,317.) The contract is `build/requirements/conformance.md` (R1–R17); K4, K12, K23, K31, K61, K88, K102 apply. The module exports `conformanceOf(ctx)` (K61). A new module: `modules.json` gives it no `from`, and none is needed (§1).

## 1. What moves to `conformance`

Nothing. `grep` over `store.mjs`, `schema.mjs`, `index.mjs` and `bio-checks.mjs` for `compliant`, `noncompliant`, `determination` (as a record of an act), `CONF-` and a comparison finds none; "determination" hits (bio-checks 2775–2780, 7600–7925, 10368–10370) are DEC-44's and D-199's case determinations, unrelated. No catalogue row, table, op or migration belongs to it. **Schema (K4):** its tables (`determinations`, `determination_standards`, `determination_findings`, `determination_questions`, `comparison_proposals`) are new, declared to purge (R16).

**Measured size:** 0 lines moved. Estimated 700–1,000 lines of new code.

## 2. What stays, or belongs to another module, and why

| what | where today (T6) | owner | why |
| --- | --- | --- | --- |
| `published_cases`, `published_case_members` (`version_sha`, `role`) DDL | schema 576–588, 644–653 | `publication` | "published" is membership of a published case edition (R2); read through publication |
| `#caseRelationOf`, the fact `caseMember` | store 2940–2961, 781 | `publication` (its R4) | answers the finding's **current** sha only; see §5.3 |
| `action_basis` DDL, `actionBasisFindings` (C-2.10: legs on `INFO`/`INQ`/`PROB`/`FOCUS`) | schema 867–876, bio-checks 4256–4304 | `actions` | its R8 makes a breach action rest on a determination; it needs this module's prefix (§5.2) |
| `lawProposalLabel` and its states | bio-checks 743–800 | `legacy-checks` | R12 reads it by import (§5.1) |
| `isMachineIdentity` | bio-checks 1667–1693 | `legacy-checks` | R1, R13 |

## 3. What earlier modules must provide (uses)

| use | service | in its Provides? |
| --- | --- | --- |
| `record-core` | `allocId`, `transact`, `stampInstant`, `declarePurge` | yes |
| `membership` | `sight`, `projectAuthority(project, author, "joined")`, `viewerPredicate` | yes (R43, R44, R55) |
| `promotion` | `promote` (the determination, R17; R6's new inquiry) | `promote` yes; a new type no (standards map §5.2); two bundles landing together no (§5.4) |
| `content` | `contentRow`, `passageNotice` | yes |
| `inquiry` | `supersededBy`, `stateHistory` (R19, not yet met: D-592) | yes, `stateHistory` built by T6-1 |
| `strength` | `inquiryStrength` | yes (T6-4) |
| `reevaluation` | `onBasisChanged` (its R8) | stated; not yet met; T6-12 builds it |
| `publication` | a finding-version's membership of a published edition of a project, its frozen pair | partly: R4 (current sha), R7 `publishedRegistryFor` (frozen pairs), R10; no (finding, version, project) read (§5.3). Publication is not yet extracted |
| `standards` | `standardRead`, `inForce` | yes (standards R5, R7) |
| `legacy-checks` | `isMachineIdentity`, `lawProposalLabel` | yes (exports) |

## 4. The ADDED lines expected in the legacy modules

- `legacy-checks`: the `CONF` prefix and a `determination` state table (standards map §5.2), and `CONF` accepted as a `rests_on` target for `actions` R8 (bio-checks 4256–4304 is actions'; it changes with actions' job); catalogue rows for new refusal codes if DEC-49 applies.
- `legacy-store`, `legacy-index`/`control-plane`: dispatch, `OPS` entries and classes for `determine`, `determinationRead`, `determinationsFor`, `comparisonPropose` (K3). About 20 lines.

## 5. Undetermined, conflicts, and code others could claim

1. **`lawProposalLabel`'s sentence** names an action's governing-laws citations (bio-checks 769–776); R12 needs a comparison's. As standards map §5.1: BOB decides.
2. **A new record type** (`determination`, `CONF-`): as standards map §5.2.
3. **R2's read is not in publication's Provides.** R2 needs "is version V of finding F a member of a ratified edition of a case owned by project P, and which"; publication R4 answers the current sha only (and counts an unsigned preparation), R10 refuses a finding in several cases. Proposed: publication states a read `publishedEditionsOf({finding, version?, project?})` before layer 9, or conformance composes R7 with the case owner (`cases`); BOB decides.
4. **R6 lands two bundles together.** The determination and a new inquiry "land together or not at all", but `promote` is one bundle per call; `inquiry` R26 is not yet met for the same reason. Needs a promotion service that promotes several bundles in one `transact`, or R6 read as two promotions with a compensating refusal. BOB decides.
5. **"The same act" has no identity.** An act is a value `{description, actor, at|period, evidence}` with no id, yet R7 (supersede only "of the same act"), R11's `act` filter and escalation R14 compare acts. BOB decides what makes two acts the same (an act id minted by the first determination, or equality of actor and date).
6. **Visibility.** `viewerPredicate` shows every non-project bundle to every member (membership R43); a determination is a project's bundle but not a project, so R15's rule rests on `sight(project, viewer)` for each read, not on the predicate alone.
7. **Code names.** R1's `NOT_A_PARTICIPANT` differs from what `projectAuthority` answers (`PROJECT_ACT_NOT_A_PARTICIPANT`, membership R55); the job either maps it or answers membership's. Same in `consequences` R1 and `escalation` R1.
8. **Not yet met:** every R1–R17 (new module).
