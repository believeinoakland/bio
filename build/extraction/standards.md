# standards — extraction map

**Status** · Drafted by a worker for BOB #48, 2026-09-27 (P18), measured at `tranche/T6` @ `c7dfd835ef` (`store.mjs` 33,816 lines, `index.mjs` 9,069, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,317). ADOPTED by BOB #50, 2026-09-27 (K171), after its review (`docs/development/transition/drafts/layer9-review.md`); re-measured at `tranche/T7` @ `62a9517b6f` (`main` @ `8899ac7d97`, T6's layers 1–2 merged): `store.mjs` 33,760 lines, `bio-checks.mjs` 14,629, `index.mjs` and `schema.mjs` unchanged. Every `bio-checks` line cited below is unchanged; `store.mjs` lines cited up to about 5,800 are 2 later, and later ones about 56 earlier (review §3.1), not re-edited line by line. §5's questions are resolved by K171 (and K172), as marked. The contract is `build/requirements/standards.md` (R1–R15); K4, K23, K31, K61, K88, K102, K108 (5) (N72) apply. The module exports `standardsOf(ctx)` (K61). A new module: `modules.json` gives it no `from`, and none is needed (§1). Its first job writes it from its requirements.

## 1. What moves to `standards`

Nothing. Searched `store.mjs`, `index.mjs`, `schema.mjs` and `bio-checks.mjs` for a held standard, `standard_sources`, `inForce`, `STD-`, a standard's supersession or proposal: none. No catalogue row, table, op or migration belongs to it. **Schema (K4):** its tables (`standards`, `standard_texts`, `standard_proposals`, Suggestions) are new, declared to purge (R14).

**Measured size:** 0 lines moved. Estimated 500–800 lines of new code (requirements, Size).

## 2. What stays, or belongs to another module, and why

| what | where today (T6) | owner | why |
| --- | --- | --- | --- |
| D-149's `LAW_LEVELS`, `GOVERNING_LAWS_MAX`, `CITATION_MAX`, `governingLawsOf` | bio-checks 643–694 | `actions` (its map) | the laws the group's own request is made under, not a standard a government act is measured against |
| `LAW_PROPOSAL_STATES`, `lawProposalState`, `lawProposalLabel`, `LAW_PROPOSAL_WHY_MAX` | bio-checks 743–800 | `legacy-checks` (K92 (2)) | one composer, read by R9 by import; see §5.1 |
| `isMachineIdentity` (with `isMachineStamp`) | bio-checks 1667–1693 | `legacy-checks` | REC-46's one predicate (R1, R11) |
| `actionLaws`, `#lawEntries`, `actionLawsPropose`, `#lawProposalsFor` | store 5207–5271, 5291–5324, 5547–5587, 5604–5630 | `actions` | REC-195's member-states, machine-proposes, stored-apart pattern is the model for R9–R10; nothing is shared but `lawProposalLabel` |
| `action_law_proposals` DDL | schema 1877–1885 | `actions` | the model for `standard_proposals`, not reused |
| `code_section` references from a document's text | docprofile `doctypes/regulation.mjs` 258, `staff-report.mjs` 301 | `docprofile` | where a citation is first read; an AI run may seed a proposal from it (Suggestions), not this module |
| `SOURCE_KINDS` (R1's six kinds), `standard_sources` validation, `combine`'s union of the section | jurisdictions/index.mjs 24, 313–323, 601 | `jurisdictions` | R1 and R3 import them |

## 3. What earlier modules must provide (uses)

| use | service | in its Provides? |
| --- | --- | --- |
| `jurisdictions` | `combine(list).view.standard_sources` with `cite` as `{re, flags}`; `SOURCE_KINDS` | yes (R12–R16, R23). The source's `level` (R31, N72) is stated, not yet met: `standard_sources` has no `level` field (validator 316); built by the `jurisdictions` job before layer 9 (`next.md`, K171) |
| `record-core` | `getSetting` (the active profiles), `allocId`, `transact`, `stampInstant`, `declarePurge` | yes |
| `membership` | `viewerPredicate` (R5; a non-project bundle's rule, R43) | yes |
| `promotion` | `promote` for a standard as a record object (R15) | `promote` yes; the `STD-` type is registered in the catalogue by the head-of-layer `legacy-checks` job (§5.2, K171 (1)) |
| `content` | `contentRow`, `standings`, `passageNotice` | yes (content R19–R20, `passageNotice`) |
| `legacy-checks` | `isMachineIdentity`; `proposalLabel` | `isMachineIdentity` yes; `proposalLabel` added by the head-of-layer `legacy-checks` job (K171 (2)) |

## 4. The ADDED lines expected in the legacy modules

- `legacy-checks`: the `STD` prefix in `BUNDLE_ID_RE` and `ANN_ID_RE` (23–24), `OBJECT_TYPES` (40) and a `standard` state table in `STATES` (272–507), added by the head-of-layer `legacy-checks` job, not this one (K171 (1)); catalogue rows for R1's new refusal codes if DEC-49 applies to them (K107 (3)'s pattern). About 10 lines.
- `legacy-store`: dispatch entries for the new ops routing to `standardsOf(this.ctx)`; `legacy-index`/`control-plane`: `OPS` entries and op classes (K3). About 15 lines.

## 5. Undetermined, conflicts, and code others could claim

1. **`lawProposalLabel`'s sentences are the governing-laws proposal's.** R9 says "`lawProposalLabel`'s three states, one composer", but `LAW_PROPOSAL_STATES` (bio-checks 769–776) says "proposed these citations … this action's list of governing laws". Reused as is, a standard proposal is labelled with an action's sentence. BOB decides: a subject-neutral composer in `legacy-checks` (the three states shared, the sentence per subject) that `actions`, `standards`, `conformance` and `filings` all read, or a sentence of this module's beside the shared state. *Resolved: `proposalLabel(p, "standard")` (K171 (2)).*
2. **A record object needs a type the catalogue does not know.** R15 (K102) makes a standard a promoted bundle, but promotion's type knowledge is the catalogue's hard-coded prefixes and state tables (`BUNDLE_ID_RE`, `OBJECT_TYPES`, `STATES`; promotion R9, R15). Promotion's Provides has no type registration. Also `allocId` answers `<prefix>-<year>-NNNN` (record-core R1) while `BUNDLE_ID_RE` needs a slug after it. BOB decides whether the job adds the type to `legacy-checks` (§4) or `promotion` gains a type registration (the same holds for `conformance`, `consequences` and `escalation`, K108 (3)). *Resolved: the catalogue, by one head-of-layer `legacy-checks` job; `allocId` plus a slug satisfies `BUNDLE_ID_RE` (K171 (1)).*
3. **N72 is not yet folded.** K108 (5) says R3's match carries the source's `level`; R3 still lists `source, kind, issuer, profile, basis`, and `jurisdictions` R31/R23's level is not built (§3). Both precede the job. *Resolved: folded into R3 (K171 (3)); the level is built by the `jurisdictions` job before layer 9.*
4. **Instance-wide bundles.** A standard is "the instance's, not a project's" (K88 (2)); promotion R19 and membership's non-project rule (R43) must admit a promoted bundle with no project. Not verified against promotion's code; the job confirms it. *Resolved: membership R43 already admits it; the job tests it (K171 (12)).*
5. **Not yet met:** every R1–R15 (new module). Nothing in the code meets any of them.
6. **Tests:** no old-battery suite anchors on this module. `affordances` (layer 11) later publishes the new ops (N115's pattern).
