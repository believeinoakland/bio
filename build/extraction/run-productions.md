# run-productions — extraction map

**Status** · Checked against `tranche/T7` @ `e15806be` by a worker for BOB #50 (P18) (`store.mjs` 33,756 lines, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,629, `index.mjs` 9,069); every line number below is re-measured there (the measured sizes are left as first measured). Corrections: all lines re-measured; `content` is extracted, so `mintContent`, `captureFor`, `contentContextFor` and `mintLabel` are its (content/index.mjs 421, 187, 205, 70; store keeps delegations at 15808–15811, and `extractPropose` already calls `contentOf(ctx).captureFor`, 16335); `#citesInto` is already a delegation to `connections` (store 2893); the retired-target predicate is `citation`'s (its R5), no longer `inquiry`'s; `stampInstant`'s owner is named (`record-core`, its R47), which settles §5.4; `SUGGEST_LEVELS` is one line now (7040, with its comment from 7036). Measured 2026-09-26 on `tranche/T3` @ `35ea098` (unchanged at `1c205209`) by a drafting worker for BOB #42 (P18, N54, K82), split from ai-runs' map. Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (49,817 lines), `schema.mjs` (3,964), `checks/bio-checks.mjs` (15,682) and `index.mjs` (13,438); the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/run-productions.md` (R1–R19); K3, K6, K23, K31, K61, K73 (2), K78 (3), K82 (2) and (4), K83 (3)–(4) and N55 apply. The module exports `runProductionsOf(ctx, env)`, reaching its uses through their factories (K61); `legacy-store` delegates to it. `from` reads `["legacy-store", "legacy-checks"]`.

## 1. What moves

| what | where today | lines | moves |
| --- | --- | --- | --- |
| PL-3/IS-4 region: header, `SUGGEST_LEGS_MAX` (27326), `SUGGEST_ORIGIN_MAX` (27331), `suggestVersion` (27334), `#suggestionPersisted` (28235), `#suggestionFrontmatter` (28314) | store.mjs | 27283–28337 | yes (R1–R9) |
| SK-8 region: header, `#mintsBound` (16211), `#posFields`, `extractPropose` (16250), `extractProposals` (16460) | store.mjs | 16144–16540 | yes (R10–R13); `#mintsBound` and the consumption upsert become `ai-runs.boundOf`/`consumeBound` |
| dispatch `extractpropose`, `extractproposals` | store.mjs | 32993–33009 | yes (K3) |
| dispatch `suggest` | store.mjs | 33280–33295 | yes (K3) |
| `SUGGEST_LEVELS` with its comment | bio-checks.mjs | 7036–7040 | yes (R6); its only other reader is `skills` (`skilldoctrine.mjs` 81), later |
| `SUGGEST_CHECKS` header and rows C-27.1–C-27.14, C-27.16–C-27.19 | bio-checks.mjs | 7081–7285 | yes (R16); C-27.15 (7286–7292, `VERSION_KIND_UNKNOWN`) stays with `basis-versions` (its R1), the family split by number |
| `suggest_refusals` with its comment | schema.mjs | 1326–1361 | yes (R2, R17) |
| `proposed_readings` with its comment | schema.mjs | 1617–1688 | yes (R11, R17) |

The purge entries (store.mjs 692: `proposed_readings` by bundle; 702: `suggest_refusals` by target) move to this module's own `declarePurge` (R17).

**Measured size:** about 1,780 lines, about 800 without comment-only and blank lines: `store.mjs` 1,464 (635), `bio-checks.mjs` 204 (128), `schema.mjs` 108 (35). Well under 4,000.

## 2. What stays, or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `SUGGEST_KINDS` (7022–7039) and C-27.15 | bio-checks.mjs | `basis-versions` (its R1; K82 (4)) | `basisVersionFindings`, earlier, reads it; this module re-exports it |
| `isBoilerplate`, `BOILERPLATE_FORMS` (7042–7079) | bio-checks.mjs | `legacy-checks` until an owner is named | `narrow` (basis-versions, 13385) calls it too; imported here |
| the version's frontmatter composition (`#fmSafe`, `#appendFmRows`, `#setScalar`, `#appendSessionLog`, `Store.#rand`) and the `promote` call (27939–28020) | store.mjs | `basis-versions`' `appendVersion` (its R28) | the one composer of a version; `#appendFmRows` is already basis-versions' (its map §1) |
| `basisVersionsOf`, `#versionCollections`, `BASIS_VERSIONS_LIMIT_MAX` | store.mjs 14353, 25612, 25525 | `basis-versions` | called for C-27.10's candidate and R5's read-back |
| `#strengthWalk`, `#independenceOf`, `STRENGTH_AXES`, the depth bound (`QUEUE_ANCESTOR_DEPTH`, 17244) | store.mjs 21627, 25758, 21203 | `strength` | called for C-27.9 and C-27.11; `strength` keeps its own depth bound (its Suggestions) and the origin limit (its R12) |
| `#retiredNotCitable` | store.mjs 3326 | `citation` (its R5, N55) | the store's one retired-target predicate |
| `#citesInto` | store.mjs 2893 (a delegation); connections/index.mjs 841 | `connections` (extracted) | R1's context rule |
| `mintContent`, `captureFor`, `contentContextFor`, `mintLabel` | content/index.mjs 421, 187, 205, 70 (extracted; store 15808–15811 delegate) | `content` (K73 (1)) | R11 |
| `extractrun.mjs` (`EXTRACT_RUN_MODE`, `proposalChain`, `checkProposedRef`, `proposedReadingGrade`, `mintRatio`) | extractrun.mjs | `extraction` (its R41–R43) | used, not moved |
| `#narrowCandidateList`'s extract arm (12448–12462) | store.mjs | `basis-versions` (its R25) | it reads `proposed_readings`; this module fills the candidate source (R14) |
| `RUN_PRODUCTION_ACTIONS`, the op classes, the `principal`, `author`, `proposedBy` stamps, `extractPropose`'s refusal list (index.mjs 630–634, 1772–1812) | index.mjs | `control-plane` | K3 |

## 3. Callers to rewire

Each calls a moved method or reads a moved table today, and calls the module's factory after.

- The run: `suggestVersion` (27391–27411) and `extractPropose` (16270–16282) read `ai_runs` and call `#aiRunInSight` and `runPrincipalGate`: through `ai-runs.runFor` and R5. `extractPropose` reads and writes `ai_run_bounds` (16213, 16424): through `ai-runs.boundOf` and `consumeBound`, inside one transaction.
- The version write: `suggestVersion` composes `bundle.md` and calls `this.promote` (27939–28020, the call at 28004): through `basis-versions.appendVersion` (its R28), which promotes. Its read-back (28105–28106) and candidate composition (27860) call `basis-versions`.
- `suggestVersion`'s held compositions (`inquiry_basis_versions`, 27899): through `basis-versions`' read (its map §3 proposes a read contract).
- `extractProposals`' ratio reads `content`, `inquiry_basis` and `inquiry_basis_version_legs` (16520–16531): through `content`'s machine-minted rows and the cited-by reads of `inquiry` and `basis-versions`, or stated read contracts; BOB decides which.
- `#narrowCandidateList` (12450) reads `proposed_readings`: through R14's registration.
- `#counts` (20579 `proposed_readings`, 20656 `suggest_refusals`): through a count this module provides, as bias's and connections' maps propose for theirs.
- `#independenceOf` (25759) reads `Store.SUGGEST_ORIGIN_MAX`: `strength` holds the limit (K78 (3)); this module re-exports it for R5's `origin_limit`.
- `skills` (`skilldoctrine.mjs` 81) imports `SUGGEST_LEVELS` and `SUGGEST_CHECKS`: from this module once they move.

## 4. Old-battery tests that anchor on the moved source

Source-patching controls and source-reading suites that re-anchor with the move (`legacy-tests` entries, K53): `suggest.control.mjs`, `rec165-production-principal.control.mjs`, `dec65-strength-reach.control.mjs`, `nc-sk8.mjs`, `rec75-sweep.mjs`, `identity-claims.test.mjs`, `d470-catalog-census.test.mjs`, `gate-reads.test.mjs` (the `extractproposals` classification), `airun.test.mjs` and `run-conditions.test.mjs` (their production arms), `civicos-ui/check-refusal-codes.mjs` (the `is-suggest-*` DEC-49 regions). Suites that drive the behaviour and follow the module: `suggest.test.mjs`, `rec165-production-principal.test.mjs`, `extractrun.test.mjs` (its op half; the pure half is `extraction`'s), `d168-retired-cite.test.mjs`, `dec65-strength-reach.test.mjs`, `dec65-single-part.test.mjs`, `vf4-suggestprobe.mjs`, `vf4-live-scratch.mjs`, and `agent-worker/test/plane-suggest.mjs`. `wire-vocabulary.test.mjs`/`.control.mjs` read `SUGGEST_LEVELS` from the plane's source and follow it here.

## 5. Undetermined, conflicts, and code others could claim

1. **`uses`.** From the code: `legacy-checks`, `text-chain`, `record-core`, `membership`, `extraction`, `content`, `connections`, `inquiry`, `basis-versions`, `strength`, `ai-runs`, all earlier. `promotion` is not listed: today `suggestVersion` calls `promote` directly, but basis-versions' R28 (`appendVersion`) is its door, as that draft states; if BOB keeps the direct call, add `promotion`. When N55 splits `citation` from `inquiry` and the retired predicate goes with cite, `citation` joins the uses.
2. **What the earlier drafts must say after this split.** `basis-versions` R25, R28, R30 and its Suggestions name `ai-runs` for the extract candidates, `appendVersion`'s caller and C-27.10: each becomes `run-productions`. `strength` R12 names "`ai-runs`' suggestion check": `run-productions`'. `strength` provides no service today for the pair over a candidate's legs (the walk with `legsOverride`) or the independence over them; its Provides needs both (its map §3 lists `suggestVersion` as their caller). `skills`' `legacy-checks` use for `SUGGEST_LEVELS` and `SUGGEST_CHECKS` becomes a use of `run-productions` once they move.
3. **D-572** (a level-empty candidate per named question) came here with `op=suggest` (K83 (4)). Its accepted change is in `agent-worker`'s table (one candidate per named question) and `observation-log`'s entry shape (a level observation names its question); the plane's `op=suggest` already takes the named question as `target`. Proposed: re-target it to `agent-worker` and `observation-log`, leaving nothing here.
4. **`stampInstant`** is called for R2's instants. Settled since: it is `record-core`'s (its R47, `record-core/index.mjs` 36; store imports it at 227), so this module imports it from there.
5. **Other claimants.** `ai-runs`: the run, its gates and bounds. `basis-versions`: the version write, the kinds, the narrow candidates. `strength`: the pair and independence. `content`: the mint. `extraction`: the EXTRACT vocabulary. `skills`, `agent-worker`: readers of `SUGGEST_LEVELS` and `SUGGEST_CHECKS`; `agent-worker` calls `op=suggest` over HTTP only (no code edge).
