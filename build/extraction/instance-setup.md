# instance-setup — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `f324df9b` (`store.mjs` 49,817 lines, `schema.mjs` 3,964, `checks/bio-checks.mjs` 15,682, `index.mjs` 13,438) by a drafting worker for BOB #43 (P18). The contract is `build/requirements/instance-setup.md` (R1–R31). K3, K23, K31, K61, K69 and N38 apply. The module already owns `setup.mjs` and `livefire.mjs`. What moves in is the group-identity cluster C-64 (K69) and the instance's own report arms from `index.mjs`. `from` should read `["legacy-store", "legacy-checks", "legacy-index"]`. The module exports `instanceSetupOf(ctx, env)` (K61) and the page and report functions.

**K98 amendment** · 2026-09-26, by a drafting worker for BOB #43 (P18), measured on `tranche/T3` @ `566bb7f811` (the same line counts as above): `op=runtime`, `op=cpuprobe` and the store's runtime observations and probe trail come here (§1a); the contract gains R33–R42.

## 1. What moves to `instance-setup`

| what | where today | lines | notes |
| --- | --- | --- | --- |
| D-436 header, `GROUP_SLUG_RE`, `#producingGroup`, `#recordGroupAtFirstBoot`, `NO_GROUP_RECORDED`, `instanceGroup`, `instanceGroupPublic`, `instanceGroupSeed` | store | 32566–32689 | R1–R4. Not `#groupUndetermined` (32690–32699, §2) |
| REC-164 header, the display-name and domain constants, `#groupDomainRecheckMs`, `#groupIdentityRefusal`, `#groupIdentityGate`, `#groupIdentityCurrent`, `#groupIdentityHistory`, `#groupDomainLatestCheck`, `groupNameSet`, `groupDomainSet`, `#instanceAddress`, `#checkGroupDomain`, `#groupDomainWake`, `#groupDomainTick`, `groupIdentityPublic`, `groupIdentity`, `GROUP_DOMAIN_CHECKS_MAX` | store | 32701–32933 | R5–R11. `#activeAdmins` becomes membership's `isAdministrator` (R64); `governorAdmit`/`governorReport` become `host-governor`'s; `#armScheduler` becomes the scheduler registration |
| the `group-domain-recheck` consumer entry | store | 3745–3753 | R9; registered from here (§3), not written in the list |
| `firstBoot` → `#recordGroupAtFirstBoot()` call | store | 1415–1417 | R2; the detection (914) is record-core's (§2) |
| `promotion.registerFact("producingGroup", …)` | store | 900 | R1; registered by this module |
| dispatch `instancegroup`, `instancegrouppublic`, `instancegroupseed`, `groupnameset`, `groupdomainset`, `groupidentity`, `groupidentitypublic` | store | 49548–49560 | this module's Durable Object routes (the `membershipOps` pattern) |
| `instance_group` | schema | 42–62 | K4; declared exempt (R28) |
| `group_identity_history`, `group_domain_checks` | schema | 3622–3658 | K4; declared exempt (R28) |
| `INSTANCE_GROUP_CHECKS` rows C-64.2, C-64.3, C-64.5, C-64.6, C-64.7, and the family header | bio-checks | 14080–14147 (less C-64.1 at 14097–14104 and C-64.4 at 14118–14126) | R30 |
| `publicInstanceGroup`, `PUBLIC_GROUP_PROJECTIONS` | index | 3744–3766 | the one public reader of R3/R10 (the `/` route and `op=instancegroup` both call it) |
| `FLEET_BINDINGS`, `MEMBER_VERSION_WAIT_MS`, `memberVersions` | index | 4043–4097 | R17 |
| the `op=instancegroup` and `op=groupidentity` arms | index | 6257–6311 | R3, R10, R11; the credential and namespace resolution in them stays `control-plane`'s (`caseReader`, `scopeFor`) |
| the `op=bootstrap` arm (the unauthenticated block's tail) | index | 6829–6847 | R17 |
| `op=selftest`, `op=livefire` arms | index | 7311–7384, 7402–7437 | R18, R19; the verdict-keyed HTTP status stays in the arm |

**Measured size moving in:** `store.mjs` 390 (245 code), `schema.mjs` 58 (24), `bio-checks.mjs` 68 (50), `index.mjs` 262 (127): about 780 lines, about 450 of code. With the owned files (1,671; 1,230 code), about 2,440.

## 1a. The instance's own limits (K98)

| what | where today | lines | notes |
| --- | --- | --- | --- |
| the "What runs here have COST" comment, the `op=runtime` arm, the `op=cpuprobe` arm with its comment | index | 7432–7489 | R37, R38 (R39, R40 to build); `doAnswer`, `storeSilent`, `json` stay `control-plane`'s |
| `import { cpuProbe } from "./cpu.mjs"` | index | 315 | moves with the arm (`runtime-limits`' export; `index.mjs` has no other reader) |
| the "Measured runtime cost" header, `recordRuntimeObservation` | store | 36015–36039 | R33 |
| `runtimeObservations`, `cpuProbeState`, `recordCpuProbeStep` | store | 36205–36235 | R34–R36 (R34 to build) |
| dispatch `recordruntime`, `runtimeobservations`, `cpuprobestate`, `recordcpuprobestep` | store `fetch` | 48921, 48926–48928 | this module's Durable Object routes; `recordruntime` is replaced by R42's listener once `capture` offers R55 |
| `runtime_observations` with its comment, `cpu_probe` with its comment | schema | 411–442 | declared exempt (R41), as `hygiene.test.mjs` (806, 833) states them |

**Measured size moving in:** `index.mjs` 59 (about 36 code), `store.mjs` 60 (about 47), `schema.mjs` 32 (about 16): about 150 lines, about 100 of code. The module is then about 2,590 lines (about 1,960 code), well under 4,000.

**What stays:** the `OPS` rows `runtime` (index 989) and `cpuprobe` (996) and `UNATTENDED_BY_DECISION.cpuprobe` (4319–4320) are `control-plane`'s (K98). `cpu.mjs` (`makeMeter`, `burn`, `cpuProbe`) stays `runtime-limits`'. `capture_limits` and `captureLimit`, which R37 reads, are `capture`'s (its R23).

**The one writer from an earlier module.** `runtime_observations` is written today only by `acquire` (index 9005–9018, the store path `recordruntime`), which is `capture`'s, layer 3. It cannot call this module, so the call is inverted: `capture` offers a listener registration (its R55) and this module registers at start (R42). Until this module is extracted, `legacy-store` registers the recording. `cpu_probe` is written only by `op=cpuprobe`'s checkpoint (index 7477–7480).

## 2. What stays, or goes elsewhere, and why

| what | where today | goes to | why |
| --- | --- | --- | --- |
| `#groupUndetermined` and its DEC-49 region | store 32690–32699 | stays in `legacy-store` for `inquirydivide` (12448), `strengthbar` (13282, 13377) and `testify` (21149), and moves with each | those acts' refusal; each reads the fact through `promotion` (N56) |
| the other readers of `#producingGroup` (attribution 20751) | store | the owning module, through the fact | K31: later modules read a registered fact, never this module |
| C-64.1 `GROUP_UNDETERMINED` | bio-checks 14097–14104 | `promotion` | raised at the write (promotion R13, `rowRefusal`); layer 2 cannot read a layer-11 row |
| C-64.4 `GROUP_IDENTITY_NEEDS_SESSION` and `identityFenceRow` | bio-checks 14118–14126; index 12647–12657, 4175–4181 | `control-plane` | the bearer fence at the door (control-plane R17) |
| `withProducingGroup` | bio-checks 14149–14171 | `promotion` (already its caller, `stampGroup`) | K69 named `#stampGroup`, which T3 already moved into `promotion/index.mjs` 113 |
| first-boot detection (`PRAGMA table_info(bundles)` before the schema pass) | store 914 (inside `#migrate`) | `record-core` | its schema; it answers the fact to this module (Suggestions) |
| the `/` route, `namespaceGate`, `caseReader`, `IDENTITY_ACTIONS` and the stamps of `by`, `author`, `origin` | index 6100–6130, 1849–1855, 12640–12680 | `control-plane` | routing, authentication and stamps (K3) |
| `claim`, `login`, `invitelook`, `enroll` arms | index 6177–6214 | `membership` (its R1, R2, invitations) | their services; the bootstrap-credential checks C-68.2–C-68.4 are `control-plane`'s |

## 3. ADDED lines expected in the legacy modules

- `legacy-store`: removes §1's code, and gains a consumer registration on its alarm list (`registerConsumer(name, {due, wake, tick})`, the K72 (9) listener pattern). It holds the registration until `scheduler` is extracted. Line 900's registration is removed, since promotion refuses a fact registered twice (R39). The readers in §2 call `promotionOf(this.ctx).fact("producingGroup")` (N56).
- `legacy-index`: its `Store` export wraps `legacy-store`'s class. The constructor calls `instanceSetupOf(ctx, env).start({firstBoot})` inside the same `blockConcurrencyWhile`, after the schema pass. The fetch routes this module's Durable Object ops before the legacy map. Both move to `control-plane` if it becomes the composition root (control-plane Open for Bob 1).
- `record-core`: a first-boot answer (for example `firstBoot()`). This needs a requirement in its approved file, which BOB adds as an interface addition (K61's precedent).

## 4. Old-battery tests that anchor on the moved source

These read or patch moved text, and each is a `legacy-tests` entry (K53): for K98, `subresources.test.mjs` 1140–1190 (the four store paths, `op=runtime`, and `op=cpuprobe` refused to a member) and `plane-envelope.test.mjs` 1043–1045 (a silent `runtimeobservations`), which run through ops and stay green while the routes behave, and `fl1-cpu-probe.mjs` and `ocr-measure-probe.mjs` (live probes, not the battery); for the rest, `instance-group.test.mjs` and `.control.mjs` (the former pins `GROUP_SLUG_RE` to the installer's `SLUG_RE` by source), `group-public.test.mjs` and `.control.mjs`, `group-identity.test.mjs` and `.control.mjs`, `d456-namespace-scope.test.mjs` (the `groupidentity` arm), `livefire.test.mjs`, `setup-honesty.test.mjs`, `setup-signeradd.control.mjs`, `refusal-wire.test.mjs` §6c (livefire's verdict), `hygiene.test.mjs` (the purge exemptions listed from `schema.mjs`), `add-surface.test.mjs` (the two intake surfaces together), the DEC-49 census suites that read the `is-instance-group-seed`, `is-group-*` regions, and `bounds.test.mjs` (`GROUP_DOMAIN_CHECKS_MAX` below its method). Suites that follow the module: the group, group-identity, livefire and setup-page suites.

## 5. Undetermined, conflicts, and code others could claim

1. **The composition root.** Every layer-11 module extracted from `legacy-store` (`affordances`, `queue`, this one) needs something later than itself to start it and route its Durable Object ops. That is `legacy-index` now and `control-plane` later, if Bob agrees (control-plane Open for Bob 1).
2. **Uses.** Declared: `jurisdictions`, `legacy-checks`, `runtime-limits`. The moved code calls `record-core`, `membership`, `promotion`, `host-governor` and the scheduler registration. `legacy-store` is used through that registration until `scheduler` exists, and it is allowed as `*earlier`.
3. **`op=bootstrap`.** The Durable Object route (`bootstrapState`, `storeVersion`) is `membership`'s (R72, K57). This module takes only the Worker's composition around it (R17).
4. **N10.** Nothing reads `JURISDICTION_PROFILES` today, and `jurisdiction_profiles` is not yet written (record-core R26 not met). R12–R16 are new work, not an extraction.
5. **D-719** is built on `land/worker/D-719` @ `8ab99e48` (`historyOrder`), to be judged against R25. D-732 (its twin in `civicos-ui`) is `legacy-ui`'s.
6. **R40 (the probe's runs).** `cpu_probe` is keyed on the step alone. Keeping runs apart needs a run column (or a table per run) and a migration of the existing trail, whose rows cannot now be told apart by run; they would be kept as one legacy run, stated as such.
7. **R34 (the unit).** `runtime_observations`' columns are named `*_ms` and hold a byte count for its one metric. Recording the unit per metric needs a column, or a unit fixed by the metric's name; the old rows' unit is the metric's (`capture_work_bytes`, bytes).
