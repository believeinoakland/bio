# actions (T19)

**Status** · session_01PfT65KAmSNhQYGsUShyY6o · depth 2 · WORKING · handled B2

## J1 · QUESTION

Two readings, both on B1's split deletion; I carry on with both while you answer. Stage one is pushed (cc6579b240): record-grammar re-points (index.mjs:39, fixture.mjs:19), N428 (`pendingClocks`, its two bounds, C-117.5's row and R31's tests gone), N427 (`contactNotAMember`, `contactId` exported, the write answering through them; row C-117.11's `where` now `contactNotAMember > is-contact-member`), R51 tested; module 60/0. Waiting on action-grammar's early merge for the rest.

(1) `actions/checks.mjs` has importers later than me that only their own jobs re-point: control-plane `src/control-plane/families.mjs`:51,103 (`import * as ACTIONS`, its CHECK_FAMILY_FILES: the eight `*_CHECKS` families its refusal decoration composes; product code, L11), instance-setup `src/setup.mjs`:23 and `test/m/instance-setup/{page,worker-page}.test.mjs` (`RISK_TIERS`, `riskTierState`; L11), escalation `test/m/escalation/stages.test.mjs`:8 (`ACTION_CATALOGUE_CHECKS`; L9, after me). And affordances `src/affordances.mjs`:89 reads `PRODUCT_KINDS`, `RISK_TIERS`, `LAW_LEVELS`, `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`, `RESOLUTIONS` from `actions/index.mjs` (its tests also `actionKinds`). My reading: "checks.mjs deleted" is its code: the file stays as a pure re-export from action-grammar, no code and no catalogue import, of `RISK_TIERS`, `riskTierState` and the eight `*_CHECKS` families; `index.mjs` re-exports from action-grammar the names affordances and its tests read; N447 (T20) drops both once control-plane, instance-setup, affordances and escalation have re-pointed. Deleting the file outright would break the plane's refusal decoration and setup.mjs until L11.

(2) The catalogue's action share, re-scanned (K787 (1)): every name action-grammar takes, the K766 set (`LEAD_ID_RE`, `leadLegFindings`, `LEAD_CHECKS`, `checkLegExtentGrammar`) and `CONTENT_HASH_RE` have no importer but `actions/checks.mjs`, except: `ACTION_KINDS` (affordances `test/m/affordances/catalogue.test.mjs`:195, L11) and `lawProposalLabel` (action-clocks `src/action-clocks/index.mjs`:31, which its own START re-points after me). My reading: I hold those two (affordances' and action-clocks' jobs delete them as last importers) and delete the rest once action-grammar has merged, after re-checking the catalogue's own internal callers (`checkLegExtentGrammar` is still called by the catalogue at :879, :2635, :2921, :4380; `CONTENT_HASH_RE` by C-2.7's held copy at :213; each stays while a held caller does). legacy-ui (`civicos-ui/`, unrun, K633) imports `RISK_TIERS`, `lawProposalLabel` and reads `lifecycleFindings`/`LEAD_CHECKS`: I read it as holding nothing, like the old suites (K787 (9)).

## Completion (ACTIONS #6)

**Entries applied** (`build/plan/current.md` layer 9; B1, B2 = K835):
- **The split's deletion.** `src/actions/index.mjs` imports every grammar name, arm, reader and row from `../action-grammar/index.mjs`; `export * from "./checks.mjs"` is gone. `src/actions/checks.mjs` holds no code and imports no catalogue: per K835 it is a pure re-export from action-grammar of `RISK_TIERS`, `riskTierState` and the eight `*_CHECKS` families, for control-plane's `CHECK_FAMILY_FILES`, instance-setup's `setup.mjs` and escalation's test. `index.mjs` re-exports from action-grammar the names affordances and its tests read (`PRODUCT_KINDS`, `RISK_TIERS`, `LAW_LEVELS`, `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`, `RESOLUTIONS`, `actionKinds`). N447 (T20) drops both.
- **Moved Rs' tests deleted:** R38 (rows), R40 (vocabulary, both copies), R31 (N428, below), and the GAO precedent's assertions (action-grammar R6). The mixed tests that named R4, R20, R21, R37 or R44 keep their arms on live Rs and are retitled (R6, R15, R51, R1); the moved names they read come from action-grammar.
- **Rule 1 re-points:** `index.mjs`:39 and `test/m/actions/fixture.mjs`:19 to record-grammar. No actions file imports `bio-checks.mjs`. The unused `BUNDLE_ID_RE` import was dropped.
- **The catalogue's action share deleted** (legacy-checks −407, 0 added): `RISK_TIERS`, `riskTierState`, `ACTION_BASIS_KINDS`, `CORRESPONDENCE_DIRECTIONS`, `RFC_RESPONSE_WINDOW_PRECEDENT`, `actionBasisFindings`, `correspondenceFindings`, `QUOTE_KEYS`, `QUOTE_NUMBER_RE`, `ORD_RE`, `isQuoteEntry`, `quoteValue`, `quoteFindings`, `CORRESPONDENCE_STAGES`, `CORRESPONDENCE_OUTCOMES`, `DECISION_STAGES`, `LIFECYCLE_KEYS`, `lifecycleFindings`. **Held, each confirmed over the repository:**
  - `ACTION_KINDS` and `lawProposalLabel`, per K835: affordances' test and action-clocks read them, and they go at control-plane's whole deletion.
  - `LEAD_ID_RE`, `leadLegFindings`, `LEAD_CHECKS` and `checkLegExtentGrammar` (the K766 set). The catalogue's held `checkInquiryBasis` (:691, calling them at :722 and :879) and `basisVersionFindings` (:2662) still call them, so they are not `actionBasisFindings`' alone.
  - `CONTENT_HASH_RE`: C-2.7's held copy (:213) still reads it.
- **N428:** `pendingClocks`, `PENDING_CLOCKS_MAX`, `PENDING_CLOCKS_ACTIONS_MAX`, `PENDING_CLOCKS_BAD_BEFORE`'s row and R31's tests (read, t11, t12) deleted. The fixture's retrieval step that fed only R31 went too.
- **N427:** `contactNotAMember(extra?)` and `contactId(value)` are module-level exports, as `noSuchAction` is. The write's `CONTACT_NOT_A_MEMBER` is answered through `contactNotAMember` alone. The static `Actions.contactId` is replaced.
- The 6 store delegation lines are legacy-store's (B1). Nothing deferred.

**Requirements met, each with its test** (BOB strikes the marks, K775 (6)):
- R43: t11 "R43 noSuchAction answers the one refusal…".
- R45 (`contactNotAMember`, `contactId`): t19 "R45 contactNotAMember is the one answer…", t19 "R45 the write answers CONTACT_NOT_A_MEMBER through contactNotAMember…", t18 "R45 contact…".
- R51: t19 "R51 the audit's action arm is registered with record-core's audit, with the instance's kinds"; read "R51 R36 the audit reports…"; t17 "R1 R51 …" (three); t18 "R51 R7 …".

**Found in other modules** (also in REPORT J2):
- **action-grammar** R9, `src/action-grammar/checks.mjs`: row C-117.11 (`CONTACT_NOT_A_MEMBER`) has `where` `src/actions/index.mjs #contactAndPlan > is-contact-member`. The code is now minted in `contactNotAMember` (region `is-contact-member` moved with it), so the `where` should read `src/actions/index.mjs contactNotAMember > is-contact-member`, awaiting stamp. My copy said so before deletion; t19 does not assert the `where`, since the row is action-grammar's.
- **control-plane** (L11): `families.mjs`:51,103 reads `src/actions/checks.mjs`, now a re-export. It should name `src/action-grammar/checks.mjs` instead, which also reaches C-73.6's re-anchored row.
- **affordances, instance-setup** (L11) and **escalation** (L9, its `stages.test.mjs`:8): re-point to action-grammar (N447 then drops actions' re-exports).
- **legacy-checks**: `bio-checks.mjs`:128's comment still says `CONTENT_HASH_RE` is for `correspondenceFindings`, and the comments on `ACTION_KINDS` (:26) and `lawProposalLabel` (:45) still name `actions`. They are stale, but §12.2 forbids added lines there, so they are left for the catalogue's deleter.
- No generated artifact was regenerated by me. `bio-plane/dist/bio-plane.bundled.mjs` is stale against the plane's source (actions, the catalogue); BOB regenerates at the layer close (§14).

**Tests and checks:**
- `node --test test/m/actions/`: pass 57, fail 0.
- Users of my services: action-grammar 22/0, action-clocks 20/0, action-plans 38/0, filings 45/0, escalation 32/0, record-grammar 57/0.
- Five modules fail as they did before my change, failure for failure (compared before and after on this branch): legacy-checks 20/3, affordances 119/4, instance-setup 80/4, monitoring 69/1, control-plane 84/1.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio actions`: 0 failures. `checks/coverage.mjs bio actions`: 40 of 40 live ids named, 0 failures. `checks/ownership.mjs bio actions tranche/T19`: legacy-checks 0 added, 407 removed; 0 failures.

Size (session_01PfT65KAmSNhQYGsUShyY6o): test runs 14, module lines 2535
