# contradiction — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `35ea098` (after promotion's merge) by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (49,817 lines), `schema.mjs` (3,964), `checks/bio-checks.mjs` (15,682), `contradiction.mjs` (83) and `index.mjs` (13,438); the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/contradiction.md` (R1–R23); K6, K23, K31, K61 and K64 apply. The module exports `contradictionOf(ctx)`, reaching its uses through their factories on the same `ctx` (K61); `legacy-store` delegates to it. `from` should read `["legacy-store", "legacy-checks"]`.

## 1. What moves to `contradiction`

| what | where today | lines | moves |
| --- | --- | --- | --- |
| the labels, `JUDGEMENT_PROMPT` and its digest, `judgementSide`, `renderJudgementInput` | contradiction.mjs | 1–83 | stays in place (already the module's path); may move under `bio-plane/src/contradiction/` with a re-export |
| REC-146 header, `CONTRADICTION_PAIRS_MAX`, `CONTRADICTION_KEYS`, `#contradictionDoc`, `#contradictionK1`–`#contradictionK4` with K3's two arms, `#contradictionExtent`, `#contradictionLadder`, `#CONTRADICTION_ABSENCE`, `contradictionPairs` | store.mjs | 14536–15163 | yes, as `pairs` (R5–R12) |
| `#candidateSide`, `#appendContradictionCandidate`, `contradictionPropose` | store.mjs | 15165–15304 | yes, as `propose` (R13–R16); its run read becomes the registered gate (R21) |
| dispatch `contradictionpropose`, `contradictionpairs` | store.mjs | 49095–49105 | yes (K3) |
| `CONTRADICTION_PAIR_CHECKS` (C-60.1), `CONTRADICTION_CANDIDATE_CHECKS` (C-93.1–C-93.7), with their headers | bio-checks.mjs | 13829–13909 | yes (R20) |
| `contradiction_candidates` and its index | schema.mjs | 3906–3936 | yes (K4); its purge entry (store.mjs 880, keys `a_bundle_id`, `b_bundle_id`) moves to the module's own `declarePurge` (R22) |

**Measured size:** store.mjs 780 (527 code), contradiction.mjs 83 (42), bio-checks.mjs 81 (54), schema.mjs 31 (20): about 975 lines, about 640 of code.

## 2. What stays, and why

| what | where | goes to | why |
| --- | --- | --- | --- |
| the op classes (`contradictionpairs`, `contradictionpropose`), `RUN_PRODUCTION_ACTIONS`, `AI_RUN_ACTIONS`, the capability map, viewer gates and the proposer stamp | index.mjs 867–881, 1943–1983, 2148–2152, 2209, 2314–2318, 12133–12152, 12502–12503 | `control-plane` | routing, authentication and stamps (K3) |
| `contradiction-overstrict.test.mjs`, `contradiction-gate.mjs`, `contradiction-corpus.mjs`, `contradiction-judge-baseline.mjs`, `contradiction-judge-recorded.mjs` | bio-plane/test | this module's tests (a `legacy-tests` entry moves them) | they measure R2's prompt and the pairing |
| `#bundleGate`, `viewerPredicate` | store.mjs, membership | `membership` | called, not moved |

## 3. Callers to rewire

- `contradictionPairs`: `contradictionPropose` (inside the module) and the dispatch only.
- The run gate (R21): `contradictionPropose` reads `ai_runs` (15226) and calls `#aiRunInSight` and `runPrincipalGate` (`airun.mjs`, `ai-runs`, later in the order). `legacy-store` registers a gate built from those until `ai-runs` is extracted; `ai-runs` then registers its own.
- Reads of other modules' tables inside the moved code, each to a service or a stated read contract (BOB decides which): `inquiry_basis` (K1, K4, the ladder), `inquiry_basis_versions` and `inquiry_basis_version_legs` (K2, K3, K4, the ladder), `bundles.inquiry_subject_entity` (K2), `content` (the K4 join, `#contradictionExtent`, `#candidateSide`), `readings` (`#contradictionDoc`), `resolutions` (K4 and the ladder; entities' draft proposes a read contract).
- `CONTRADICTION_LABELS` is imported by store.mjs (line 370-range import block) only for `contradictionPropose`; it leaves with it.

## 4. Old-battery tests that anchor on the moved source

Source-patching controls that re-anchor with the move (`legacy-tests` entries, K53): `nc-rec146.mjs` (patches `store.mjs` and `index.mjs`), `contradiction-overstrict.control.mjs` (patches `store.mjs`'s keys and the baseline judge), `rec168-capturerequest-principal.control.mjs` (patches `RUN_PRODUCTION_ACTIONS` in `index.mjs`, which stays). Census suites naming moved methods: `derivation-bounds.test.mjs` (`#contradictionK3Same:rows`, `#contradictionK3Doc:rows`, `#contradictionK3`), `run-conditions.test.mjs` (`contradictionPropose` as an `AUTHORISES` reader of `ai_runs`; it stops reading when R21 is met), `gate-reads.test.mjs` (the op's gate text). Suites that drive the behaviour and follow the module as its tests: `contradictionpairs.test.mjs`, `contradiction-overstrict.test.mjs`.

## 5. Undetermined, conflicts, and code others could claim

1. **The run gate.** `contradiction` is earlier than `ai-runs`, which already declares a use of it. Proposed: R21's registration (K31). The alternative is K73 (2)'s precedent for `extractPropose`: the whole `propose` act to `ai-runs`, leaving here the table and an append service; that splits C-93 across two modules, so this draft keeps the act here.
2. **Uses.** `modules.json` gives `record-core`, `content`, `inquiry`. The moved code also needs `legacy-checks`, `membership`, `basis-versions`, `entities` and `extraction` (R-Uses). Proposed: add all five.
3. **The design's stated gaps** (its Incomplete sections): the `viewer` and `not_run` absence levels, K3's document arm excluding an inquiry target, and versioning a claim side by its text's digest are the build's decisions, recorded in the design as gaps. They are wording for BOB when the design is next edited, not questions for Bob.
4. **Other claimants.** `ai-runs`: the `propose` act (item 1). `entities`: the K4 join's `resolutions`. `extraction`: `#contradictionDoc`'s reading. `skills`: packaging the prompt (not built).
