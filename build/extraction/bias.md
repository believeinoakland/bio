# bias — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `7d91579` (after membership's early merge) by a drafting worker for BOB #42 (P18). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (51,006 lines), `schema.mjs` (3,964), `checks/bio-checks.mjs` (16,591) and `index.mjs` (13,438); the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/bias.md` (R1–R32); K4, K6, K23, K31, K61, K62 (1) and K64 apply. The module exports `biasOf(ctx)`, its one instance per Durable Object `ctx`, reaching `record-core`, `membership` and `promotion` through their factories (K61); `legacy-store` delegates to it. `from` should read `["legacy-store", "legacy-checks"]`: the bias checks and C-26 are in the catalogue. Nothing moves from `index.mjs` (§2).

## 1. What moves to `bias`

| what | where today | lines | moves |
| --- | --- | --- | --- |
| PL-12 header, the manifest and inhale bounds, `#biasRefuse`, `biasAdopt`, `BIAS_MACHINE_PREFIX`, `#biasStatementRows`, `biasManifest`, `biasInhale` | store.mjs | 49011–49666 | yes (R11–R21) |
| `bias-state-edge` and `bias-set-refusal` regions inside `promote` | | 18833–18971 | yes, as checks registered with `promotion` (R8, R9); `promote()` itself is `promotion`'s to rewire (K62 (1)) |
| the `bias_statements` projection and the adoption re-pin inside `promote` | | 19436–19488 | yes, as a projection registered with `promotion` (R10) |
| dispatch: `biasmanifest`, `biasadopt`, `biasinhale` | | 50202–50234 | yes (K3); `biasadopt`'s arm that arms the scheduler becomes R23's notice |
| `BIAS_STATEMENT_KINDS` with its comment | bio-checks.mjs | 835–856 | yes |
| the three predicates (`BIAS_VERDICT_WHOLESALE`, `BIAS_VERDICT_SPEAKER`, `BIAS_BAR_PHRASING`) and `checkBiasExtension` | bio-checks.mjs | 5102–5325 | yes (R1–R7, R31); its call inside `checkBundle` (7006) becomes a check registered with the gate (§5.3) |
| the C-26 header and `BIAS_CHECKS` rows C-26.1–C-26.12 | bio-checks.mjs | 8905–9104 | yes (R29) |

**Schema (K4).** `bias_statements` and `bias_adoptions` with their indexes (schema.mjs 2387–2459). Both are in `legacy-store`'s `declarePurge` list (store.mjs 871, 875), from which the job removes them when this module declares its own (R30, K23).

**Checks it needs and does not take:** `STATES.bias` (bio-checks.mjs 462–506), read through `vocabFor` for R8; `STATES` is one object for every type and stays in the catalogue until its owner is settled (§5.4). C-70.1 and project authority (`membership`).

**Measured size:** store.mjs 881 (380 without comment-only and blank lines), bio-checks.mjs 446 (228), schema.mjs 73 (28): about 1,400 lines, about 640 of code.

## 2. What stays, or goes elsewhere, and why

| what | where today | lines | goes to | why |
| --- | --- | --- | --- | --- |
| `#biasForRun`, the D-86 sweep (`BIAS_DEBT_*`, `#biasDebtFingerprint`, `#biasDebtPending`, `#biasDebtRecipients`, `#biasDebtSweep`, `#obligationsBiasDebt`), the REC-207 settlements (`#biasDebtSettle`, `#biasDebtSettlements`, `#biasDebtSettledView`, `biasDebtResolve`, `biasDebtRead`, `#biasDebtDischargeByRerun`) | store.mjs 46240–46828 | 589 | `ai-runs` (§5.1) | keyed by run; it reads `ai_runs` and `aiRunRead`, layer 6 |
| `SETTLED_BY_AN_ACT` | 831–836 | 6 | `ai-runs` | the sweep's |
| dispatch `biasdebtresolve`, `biasdebt` | 50496–50504 | 9 | `ai-runs` | |
| the `bias-debt` alarm consumer | 3744–3763 | — | `ai-runs`, registered with `scheduler` | |
| `BIAS_CHECKS` C-26.13–C-26.19 with their header | bio-checks.mjs 9105–9173 | 69 | `ai-runs` | the debt's refusals |
| `bias_debts`, `bias_debt_sweeps`, `bias_debt_settlements`, the `settled_kind` migration | schema.mjs 3660–3691, 3823–3849; store.mjs 1363 with its comment | 59 | `ai-runs` | |
| the frozen manifest and the "Bias Manifest" section of a case document | store.mjs 9240 and `#caseDocumentText` | — | `publication` | it calls R18 at publication |
| `index.mjs`: the op table (962–980), `BIAS_ACTIONS` (2003), the gates (2796, 12078–12090) and the author stamp (12286) | index.mjs | — | `control-plane` | K3 |

## 3. Callers to rewire

Each calls a moved method or reads a bias table today, and calls `biasOf(ctx)` after.

- `biasManifest`: `publishCase` (9240), `aiRunOpen`'s lens at the open (45170), `#biasForRun` (46240-range, moving to `ai-runs`).
- `#biasDebtPending` after a promotion (49718) and after `biasadopt` (50220): replaced by R23's notice, on which `ai-runs` registers.
- `#biasDebtFingerprint` reads `bias_adoptions` joined to `bundles`: becomes R22.
- `#counts` (32130): the two table counts, through a count this module provides or a stated read contract.
- `#dispositionOf`'s `biasdebtresolve` pointer (queue) follows `ai-runs`.
- `checkBundle` (bio-checks.mjs 7006): the gate runs R1–R7 through `promotion`'s registered checks.

## 4. Old-battery tests that anchor on the moved source

Source-reading suites and negative controls (`legacy-tests` entries, K53): `bias.test.mjs` (it asserts `biasInhale` has no write path off the source), `nc-pl12.mjs`, `nc-m038.mjs`, `d84-case-manifest.test.mjs`, `bounds.test.mjs` and `derivation-bounds.test.mjs` (the manifest's cap by name), `gate-reads.test.mjs`, `identity-claims.test.mjs` (the stamped author of `biasadopt`), `hygiene.test.mjs`, and `civicos-ui/check-refusal-codes.mjs`/`check-semantics.mjs` (the C-26 rows, `pinnedState`). The debt's suites follow `ai-runs`: `d86-bias-debt.test.mjs` and `.control.mjs`, `rec207-bias-debt-settle.test.mjs` and `.control.mjs`, `run-conditions.test.mjs`, `scheduler.test.mjs`.

## 5. Undetermined, conflicts, and code others could claim

1. **The debt sweep is `ai-runs`'.** The task names debt sweeps as bias code, and the doctrine places bias debt beside bias. But every row is keyed by an AI run, the sweep compares lenses through `aiRunRead`, its recipients are the run's principal and the project's owners, and a re-run discharges it at `aiRunClose`. `bias` is layer 5 and `ai-runs` layer 6. Proposed: the sweep, its tables and C-26.13–C-26.19 go to `ai-runs` (732 lines), which reads R18 and R22 and registers on R23. If Bob answers Open for Bob 3 yes (debt on members' work too), the mechanism comes back here as a registration that `ai-runs` and `inquiry` fill.
2. **Missing uses edges.** `bias` registers with `promotion` (R8–R10), which is not in its `uses`. `ai-runs` calls `biasManifest` (the lens at the open, `#biasForRun`) and does not declare `bias`. `entities` is declared and used only by R25, which is not yet built; C-26.2 today checks the key's shape alone. Proposed: add `promotion` to `bias`, and `bias` to `ai-runs`.
3. **The gate's call.** `checkBundle` in the catalogue calls `checkBiasExtension` (7006) for every bundle. Once the check moves here, the catalogue cannot import it (layer 1), so the gate runs it as a registered check, as K64 did for promotion's own.
4. **`STATES`.** The bias machine is one entry of the catalogue's `STATES`, which the promote path reads for every type. Proposed: it stays in the catalogue, read as today, until `legacy-checks` is divided.
5. **Instance adoption.** `index.mjs`'s comment (962–976) records the choice Open for Bob 1 asks about; if Bob restricts instance adoption to administrators, the refusal is this module's (R11), not the op table's.
6. **Other claimants.** `ai-runs`: the debt and the run's bias block. `publication`: the frozen manifest. `promotion`: the two refusal regions sit inside `promote()`, which is its to move (K62 (1)). `inquiry`: HUNCH debt (`UNCLEARED_HUNCH`).
