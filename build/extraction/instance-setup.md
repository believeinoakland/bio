# instance-setup — extraction map

**Status** · Re-measured 2026-09-28 on `tranche/T10` @ `6faa8084` by a worker for BOB #59 (P18) (`store.mjs` 7,302 lines, `schema.mjs` 310, `checks/bio-checks.mjs` 12,315, `index.mjs` 7,041, `setup.mjs` 1,424, `livefire.mjs` 247). Originally measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`store.mjs` 49,817, `schema.mjs` 3,964, `bio-checks.mjs` 15,682, `index.mjs` 13,438) by a drafting worker for BOB #43 (P18), with the K98 amendment measured on `tranche/T3` @ `566bb7f811`; the T3 line ranges are kept in brackets. The contract is `build/requirements/instance-setup.md` (R1–R42). K3, K23, K31, K61, K69, K98, K102 and N10, N38, N234, N235 apply. The module already owns `setup.mjs` and `livefire.mjs`. What moves in is the group-identity cluster C-64 (K69, N38: its requirements R1–R11 are written and approved, K102), the instance's own report arms from `index.mjs` and the instance's own limits (K98). `from` reads `["legacy-store", "legacy-checks", "legacy-index"]` (modules.json). The module exports `instanceSetupOf(ctx, env)` (K61) and the page and report functions.

**Since T3.** The first-boot detection is record-core's `isFirstBoot()` (record-core/index.mjs 251; its R54), read by the store at 670. `#groupUndetermined` has left `legacy-store` for `inquiry` (inquiry/index.mjs 252), and `strength` raises C-64.1 itself (strength/index.mjs 773). `capture` offers R55's listener, and `legacy-store` registers the runtime recording on it (store 641), so `acquire` no longer writes through `recordruntime`. `actions` re-exports `RISK_TIERS` and `riskTierState` (actions/checks.mjs 24). record-core's `setSetting` validates `jurisdiction_profiles` (record-core/index.mjs 877–889), and `extraction`, `monitoring`, `actions` and `standards` read it.

## 1. What moves to `instance-setup`

| what | where today | lines (T3) | notes |
| --- | --- | --- | --- |
| D-436 header, `GROUP_SLUG_RE`, `#producingGroup`, `#recordGroupAtFirstBoot`, `NO_GROUP_RECORDED`, `instanceGroup`, `instanceGroupPublic`, `instanceGroupSeed` | store | 5600–5719 (32566–32689) | R1–R4. `GROUP_SLUG_RE` (5642) is exported from here for the installer (N234, below) |
| REC-164 header, the display-name and domain constants, `#groupDomainRecheckMs`, `#groupIdentityRefusal`, `#groupIdentityGate`, `#groupIdentityCurrent`, `#groupIdentityHistory`, `#groupDomainLatestCheck`, `groupNameSet`, `groupDomainSet`, `#instanceAddress`, `#checkGroupDomain`, `#groupDomainWake`, `#groupDomainTick`, `groupIdentityPublic`, `groupIdentity`, `GROUP_DOMAIN_CHECKS_MAX` | store | 5721–5955 (32701–32933) | R5–R11. `#activeAdmins` becomes membership's `isAdministrator` (R64); `governorAdmit`/`governorReport` are `host-governor`'s; the arm is the scheduler registration's |
| the `group-domain-recheck` consumer entry | store constructor | 655–658 (3745–3753) | R9; registered from here (§3), not written in the list |
| `#migrate`'s `if (firstBoot) this.#recordGroupAtFirstBoot()` with its comment | store | 830–832 (1415–1417) | R2; `firstBoot` is already record-core's `isFirstBoot()` (670) |
| `promotion.registerFact("producingGroup", …)` | store constructor | 608 (900) | R1; registered by this module |
| dispatch `instancegroup`, `instancegrouppublic`, `instancegroupseed`, `groupnameset`, `groupdomainset`, `groupidentity`, `groupidentitypublic` (with comments) | store `fetch` map | 7214–7228 (49548–49560) | this module's Durable Object routes (the `membershipOps` pattern) |
| `instance_group` with its comment | schema | 18–38 (42–62) | K4; declared exempt (R28) |
| `group_identity_history`, `group_domain_checks` with their comments | schema | 273–306 (3622–3658) | K4; declared exempt (R28) |
| `INSTANCE_GROUP_CHECKS` rows C-64.2, C-64.3, C-64.5, C-64.6, C-64.7, and the family header | bio-checks | 10976–10992, 11001–11013, 11024–11045 (14080–14147, less C-64.1 and C-64.4) | R30. C-64.1 (10993–11000) and C-64.4 (11014–11023) go elsewhere (§2) |
| `publicInstanceGroup`, `PUBLIC_GROUP_PROJECTIONS` with header | index | 3514–3536 (3744–3766) | the one public reader of R3/R10 (the `/` route and `op=instancegroup` both call it) |
| `FLEET_BINDINGS`, `MEMBER_VERSION_WAIT_MS`, `memberVersions` with header | index | 3749–3791 (4043–4097) | R17. `FLEET_BINDINGS` (3764) is exported from here for the installer (N234) |
| the `op=instancegroup` and `op=groupidentity` arms with their comments | index | 4379–4428 (6257–6311) | R3, R10, R11; the credential and namespace resolution in them stays `control-plane`'s (`caseReader`, `scopeFor`, `classify`) |
| the `op=bootstrap` arm (the unauthenticated block's tail) | index | 4576–4595 (6829–6847) | R17. Not `knock` (4575), now `capture/doorbell.mjs`'s `knockOp` |
| `op=selftest`, `op=livefire` arms | index | 5009–5080, 5103–5114 (7311–7384, 7402–7437) | R18, R19; the verdict-keyed HTTP status stays in the arm |
| `import { livefire }`, `import { setupPage }` | index | 2–3 | move with the arms and the `/` route's call (control-plane imports `setupPage` from here) |

**Measured size of §1 moving in (T10):** `store.mjs` 377 lines (243 code), `schema.mjs` 55 (24), `bio-checks.mjs` 52 (36), `index.mjs` 222 (129): about **706 lines, about 431 of code** (T3: about 780, 450).

## 1a. The instance's own limits (K98)

| what | where today | lines (T3) | notes |
| --- | --- | --- | --- |
| the "What runs here have COST" comment, the `op=runtime` arm, the `op=cpuprobe` arm with its comment | index | 5133–5190 (7432–7489) | R37, R38 (R39, R40 to build); `doAnswer`, `storeSilent`, `json` stay `control-plane`'s. Lines 5115–5132 above it are orphaned comments about `capture` and `links`, not this module's |
| `import { cpuProbe } from "./cpu.mjs"` | index | 139 (315) | moves with the arm (`runtime-limits`' export; `index.mjs` has no other reader) |
| the "Measured runtime cost" header, `recordRuntimeObservation`, `runtimeObservations`, `cpuProbeState`, `recordCpuProbeStep` | store | 6253–6308 (36015–36039, 36205–36235) | R33–R36 (R34 to build). Now one contiguous block |
| capture's `compute` listener (`capture.on("compute", …, recordRuntimeObservation)`) | store constructor | 641 (new row) | R42: `legacy-store` registers it today on capture's R55; this module registers it at start. R42 is met in substance; its "not yet met" note in the requirements is stale |
| dispatch `recordruntime`, `runtimeobservations`, `cpuprobestate`, `recordcpuprobestep` | store `fetch` | 7096, 7099–7101 (48921, 48926–48928) | this module's Durable Object routes. `recordruntime` has no product caller left (only `subresources.test.mjs` and `plane-envelope.test.mjs` call it), so it can be dropped with R42 |
| `runtime_observations` with its comment, `cpu_probe` with its comment | schema | 42–73 (411–442) | declared exempt (R41), as `hygiene.test.mjs` states them |

**Measured size moving in (T10):** `index.mjs` 59 (37 code), `store.mjs` 61 (48), `schema.mjs` 32 (16): about **150 lines, about 100 of code** (unchanged since T3).

## 1b. Rows added for requirements and plan entries the T3 map lacked

| what | where | lines | why |
| --- | --- | --- | --- |
| N234: export `GROUP_SLUG_RE` (store 5642, a `legacy-store` static today) and `FLEET_BINDINGS` (index 3764, unexported today) from this module; the installer imports both and drops its copies (`newgroup/src/index.mjs` 154 `SLUG_RE`, 299 `MEMBER_BINDINGS`) | this module's exports | 2 exports | N234 (INSTALLER #1 J2.1, K265); requirements' Suggestions "For the installer". `installer` already uses `instance-setup` (modules.json) |
| N235: `mdFor`'s named counterparty, written `{state: named, name}` | `setup.mjs` 864–945 (the counterparty at 928–940) and the form's "A named counterparty" field (352) | edit | N235 (LEGACY-TESTS #5 J2, K267): actions R9 refuses it on creation (`{state: named, role, body, level?}`). **R24 does not state the shape** (§5.6) |
| R32: the page's `RISK_TIERS`, `riskTierState` from `actions` instead of `legacy-checks` | `setup.mjs` 19, 36, 925 | 1 import | R32 (N65 (3)), not met; `actions` now re-exports both (actions/checks.mjs 24), so the change is an import. `actions` is not in this module's `uses` (§5.2) |
| N10: `profiles()`, `profilesSet({profiles, by})`, the first-boot record of `JURISDICTION_PROFILES`, the page's profile section | to build | new, about 150–250 lines | R12–R16 (N10; R14 and R15 also K102), not met. Nothing writes the setting yet; record-core's `setSetting` (877) validates it and four modules read it |
| R34: the unit per metric; R39: a checkpoint the store does not confirm ends the probe; R40: probe runs kept apart | `recordRuntimeObservation`, `runtimeObservations` (store 6259–6288), the `cpuprobe` arm (index 5163–5190), `cpu_probe` (schema 68–73) | edits and a migration | R34, R39, R40 (K98), not met: the columns are still `*_ms` holding bytes; the checkpoint's answer is not read; `cpu_probe` is keyed on the step alone |
| R25: history order by `seq` or by snap key | `setup.mjs` | edit | R25 (D-719), not met; built on `land/worker/D-719` @ `8ab99e48` (`historyOrder`), to be judged |

**Module size (T10):** moving in §1 706 (431) + §1a 150 (100) = about **856 lines, about 531 of code**. With the owned files (`setup.mjs` 1,424, 1,094 counted as code since it is mostly page markup; `livefire.mjs` 247, 137): about **2,530 lines**, plus §1b's new work (about 250–350): about **2,800–2,900**, well under 4,000. No P6 flag.

**What stays:** the `OPS` rows `runtime` and `cpuprobe` and `UNATTENDED_BY_DECISION.cpuprobe` are `control-plane`'s (K98). `cpu.mjs` (`makeMeter`, `burn`, `cpuProbe`) stays `runtime-limits`'. `capture_limits` and `captureLimit`, which R37 reads, are `capture`'s (its R23).

## 2. What stays, or goes elsewhere, and why

| what | where (T3) | now | why |
| --- | --- | --- | --- |
| `#groupUndetermined` and its DEC-49 region | store 32690–32699 | **gone** to `inquiry` (inquiry/index.mjs 252, `inquirydivide`); `strength` raises C-64.1 itself (773) | each reads the fact through `promotion` (N56) |
| the other readers of `#producingGroup` | store (attribution 20751) | attribution is gone to its module; **still in the store:** `filingsOf(ctx, {…, producingGroup: () => this.#producingGroup()})` (627) | K31: `filings` (layer 9) reads the registered fact through `promotion` (§3) |
| C-64.1 `GROUP_UNDETERMINED` | bio-checks 14097–14104 | still in bio-checks at 10993–11000, its `where` naming `inquiry` | `promotion` (earliest raiser; promotion, inquiry and strength raise it) |
| C-64.4 `GROUP_IDENTITY_NEEDS_SESSION` and `identityFenceRow` | bio-checks 14118–14126; index 12647–12657, 4175–4181 | bio-checks 11014–11023; index 3825–3832 (`identityFenceRow`), 6170–6172 (the fence) | `control-plane` (R14) |
| `withProducingGroup` | bio-checks 14149–14171 | bio-checks 11047–11064; read by `promotion` (promotion/index.mjs 122) | `promotion`. `legacy-store` still imports it (store 425) and reads it nowhere: an unused import to drop |
| first-boot detection | store 914 (inside `#migrate`) | **done**: record-core `isFirstBoot()` (251), read at store 670 | record-core R54 |
| the `/` route, `namespaceGate`, `caseReader`, `IDENTITY_ACTIONS` and the stamps of `by`, `author`, `origin` | index 6100–6130, 1849–1855, 12640–12680 | index 4223–4252 (`/`), 2994 (`namespaceGate`), 3481 (`caseReader`), 1767 (`IDENTITY_ACTIONS`), the forward (5291–7041) | `control-plane` (K3) |
| `claim`, `login`, `invitelook`, `enroll` arms | index 6177–6214 | index 4299–4336 | `membership`; the bootstrap-credential checks C-68.2–C-68.4 (4301–4312) are `control-plane`'s |

## 3. ADDED lines expected in the legacy modules

- `legacy-store`: removes §1's and §1a's code, and gains a consumer registration on its alarm list only while `scheduler` routes through it (`scheduler.register` is already `scheduler`'s own, so this module registers directly). Line 608's registration is removed, since promotion refuses a fact registered twice (R39). `filingsOf`'s `producingGroup` (627) reads `promotionOf(ctx).fact("producingGroup")` (N56). The `capture.on("compute", …)` line (641) leaves with R42.
- `legacy-index`: its `Store` export (150) wraps `legacy-store`'s class. The constructor calls `instanceSetupOf(ctx, env).start({firstBoot: recordOf(ctx).isFirstBoot()})` inside the same `blockConcurrencyWhile`, after the schema pass. The fetch routes this module's Durable Object ops before the legacy map. Both move to `control-plane` when it becomes the composition root (K93).
- `record-core`: nothing (the T3 map's first-boot answer is built: R54).

## 4. Old-battery tests that anchor on the moved source

These read or patch moved text, and each is a `legacy-tests` entry (K53): for K98, `subresources.test.mjs` (the four store paths, `op=runtime`, and `op=cpuprobe` refused to a member) and `plane-envelope.test.mjs` (a silent `runtimeobservations`, and `recordruntime`), which run through ops and stay green while the routes behave, and `fl1-cpu-probe.mjs` and `ocr-measure-probe.mjs` (live probes, not the battery); for the rest, `instance-group.test.mjs` and `.control.mjs` (the former pins `GROUP_SLUG_RE` to the installer's `SLUG_RE` by source, retired by N234's import), `group-public.test.mjs` and `.control.mjs`, `group-identity.test.mjs` and `.control.mjs`, `d456-namespace-scope.test.mjs` (the `groupidentity` arm), `livefire.test.mjs`, `setup-honesty.test.mjs`, `setup-signeradd.control.mjs`, `refusal-wire.test.mjs` §6c (livefire's verdict), `hygiene.test.mjs` (the purge exemptions listed from `schema.mjs`), `add-surface.test.mjs` (the two intake surfaces together; N235's counterparty), the DEC-49 census suites that read the `is-instance-group-seed`, `is-group-*` regions, and `bounds.test.mjs` (`GROUP_DOMAIN_CHECKS_MAX` below its method). Suites that follow the module: the group, group-identity, livefire and setup-page suites.

## 5. Undetermined, conflicts, and code others could claim

1. **The composition root.** Every layer-11 module extracted from `legacy-store` (`affordances`, `queue`, this one) needs something later than itself to start it and route its Durable Object ops. That is `legacy-index` now and `control-plane` later (K93, decided).
2. **Uses (modules.json).** Declared: `legacy-checks`, `jurisdictions`, `runtime-limits`, `record-core`, `membership`, `promotion`, `host-governor`, `scheduler`. The requirements also use `capture` (`captureLimit`, R37; the listener of its R55, R42) and `actions` (`RISK_TIERS`, `riskTierState`, R24, R32); neither is declared. Both are earlier (layers 3 and 9), so both may be added.
3. **`op=bootstrap`.** The Durable Object route (`bootstrapState`, `storeVersion`) is `membership`'s (R72, K57). This module takes only the Worker's composition around it (R17).
4. **N10.** R12–R16 are new work, not an extraction. record-core R26 is now met (`setSetting` validates the list), and `extraction`, `monitoring`, `actions`, `standards` already read the setting; nothing writes it until R13/R14 are built.
5. **R40 (the probe's runs)** and **R34 (the unit)**: unchanged since T3. `cpu_probe` is keyed on the step alone, and `runtime_observations`' columns are `*_ms` holding a byte count for its one metric (`capture_work_bytes`). Each needs a column and a migration of the existing rows (kept as one legacy run; the old rows' unit is the metric's, bytes).
6. **Contradiction, N235.** R24 says the form offers "a named counterparty or 'not determined yet' with a basis"; the page writes a named counterparty as `{state: named, name}`, which actions R9 refuses on creation (`{state: named, role, body, level?}`). R24 needs the shape stated as actions R9's (a role and a body, not a name), and the form's field changes with it. BOB folds R24 before the job builds it.
7. **Stale requirement notes.** The requirements' Status still gives the T3 line ranges and "`#groupUndetermined` stays in `legacy-store`" (Suggestions), which is no longer true (§2); R42's "not yet met" note says `acquire` writes through `recordruntime`, which is no longer true (§1a). Neither changes a requirement's meaning.
