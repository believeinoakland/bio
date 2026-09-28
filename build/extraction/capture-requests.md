# capture-requests — extraction map

**Status** · Checked against `tranche/T7` @ `e15806be` by a worker for BOB #50 (P18) (`store.mjs` 33,756 lines, `index.mjs` 9,069, `schema.mjs` 1,948, `checks/bio-checks.mjs` 14,629); every line number below is re-measured there (the measured sizes are left as first measured). Corrections: all lines re-measured; `capture`'s job already moved `captureRequestArm` and `op=acquire`'s capture-request arm into `capture/acquire.mjs` (234–245, the in-process-only refusal) and rewired `#fireCaptureRequest` to call `captureOf(ctx).acquire` in process (store 29094), so R15–R16's arm exists and the `env.SELF` fetch is gone from the fire (it stays only in `#captureRequestConfigured`'s presence test, 28394–28400); `#observationBundles` and the sweep are `observation-log`'s now, reading `capture_requests` through the `sweep` authority legacy-store registers (store 731–734, observation-log R13), which is R28's registration point; the per-bundle DELETE is `record-core`'s declared purge (store 703), only the `lead_inquiry` clearing (22043) still in `purge`; the census is `#counts` (20662); `runtime-limits.unattendedCredential` (its R26) is not built yet. Measured 2026-09-26 on `tranche/T3` by a drafting worker for BOB #42 (P18, N35). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (54,618 lines), `index.mjs` (13,438), `schema.mjs` (4,287) and `checks/bio-checks.mjs` (16,591) at that date; the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/capture-requests.md` (R1–R36); K23, K31, K58 and K61 apply. The module exports a factory answering its one instance per Durable Object `ctx`, and reaches `record-core`, `membership`, `capture`, `host-governor`, `observation-log`, `inquiry` and `ai-runs` through theirs (K61).

## 1. What moves to `capture-requests`

All in `store.mjs` unless named otherwise.

| what | where today | lines | moves |
| --- | --- | --- | --- |
| section header, `CAPTURE_REQUEST_TICK_BATCH`, `…_PER_HOST_PER_TICK`, `…_TTL_MS`, `…_TICK_MS`, `#captureRequestTickMs`, `#captureRequestConfigured`, `#captureRequestPending` | store.mjs | 28339–28404 | yes (R11, R12). `#captureRequestConfigured` tests `env.SELF` and a bound daemon/admin credential; with the in-process arm (R16) `env.SELF` is no longer needed (§4) |
| `captureRequest` | | 28412–28655 | yes (R1–R9) |
| `#captureRequestAttribution` | | 28665–28698 | yes, as a public service (R10); the queue's producers call it today |
| `captureRequestDrain` | | 28702–28936 | yes (R11–R22) |
| `static #renderHoldReason` | | 28942–28947 | yes (R25) |
| `#captureRequestConduct`, `#captureRequestHostHeld`, `#captureRequestMemberAgent` | | 28950–29050, 29056–29058, 29064–29070 | yes (R14). `#captureRequestHostHeld` reads `host_governor` directly; it becomes host-governor's `isHeld` (its R14). `#captureRequestMemberAgent` reads `files` for the inquiry's `bundle.md`; it becomes an `inquiry` read |
| `#fireCaptureRequest` | | 29089–29123 | already calls `capture`'s in-process arm (`captureOf(ctx).acquire`, 29094; R15, R16), rewired by `capture`'s job; moves as it is |
| `captureRequestDraining` | | 29134–29158 | retires with its op once the arm is in process (Suggestions); until then, moves |
| `captureRequests` | | 29170–29236 | yes (R23–R25) |
| the `capture-request-drain` consumer entry | `#schedConsumers` | 2024–2105 | the entry stays with the scheduler's registry and calls this module (§3.2) |
| store-op routes `capturerequest`, `capturerequestdrain`, `capturerequestdraining`, `capturerequests` | store.mjs `fetch` | 33296–33314 | yes (K3) |
| OPS rows and their comment | index.mjs | 1370–1397 | yes (R30); `control-plane` keeps routing |
| `captureRequestArm` | capture/acquire.mjs 234–245 (moved from index.mjs) | no: it is `capture`'s refusal of an outside `via: "capture-request"` (C-28.13, capture R37), already shrunk to that refusal by `capture`'s job |
| `capturerequest` in `AI_RUN_ACTIONS`, `RUN_PRODUCTION_ACTIONS`, `NEEDS` (`contribute`), the viewer-stamp list; `capturerequestdrain` in `UNATTENDED_BY_DECISION` | index.mjs | 1772, 1812, 2648, 7681–7686, 3912–3917 | stay with `control-plane` (routing, stamps) and are the input to R1, R8, R30 |
| `capture_requests` DDL, comment and three indexes | schema.mjs | 1363–1485 | yes (K4) |
| additive columns `lead_inquiry`, `run_woken_at`, `render` | store.mjs `ADDITIVE_COLUMNS` | 979–1005 (entries 985, 993, 1005) | yes |
| C-28 family and its helpers: `CAPTURE_PURPOSES`, `CAPTURE_UA_MODES`, `userAgentIsLegible`, `CIVICOS_CONTACT_URL`, `civicosUserAgent`, `CAPTURE_REQUEST_CHECKS` | bio-checks.mjs | 7482–7748 | stay in `legacy-checks` (capture also uses `civicosUserAgent` and C-28.13); every C-28 `where` string names a store.mjs site and must be updated to the module's path (K6) |

About 1,050 lines move or are rewritten, about 450 of the 902 store lines being code.

## 2. What reads `capture_requests` from outside, and where it goes

| what | lines | owner | rewire |
| --- | --- | --- | --- |
| `#conditionsCaptureRequested`, `#findingsOutOfInquiryLead`, `#conditionsRenderDeferred` | 17838–17885, 18004–18091, 19093–19149 | `queue` (layer 11, later) | call R26 and R10; D-581's bound (R27) |
| the `sweep` authority (was `#observationBundles`) | store 731–734, legacy-store's registration with `observation-log` (its R13) | `observation-log` (layer 5, extracted) | cannot call a later module: R28 replaces legacy-store's registration (K31) |
| `#aiRunWakeTickMs`, `#aiRunWakeHolds`, `#aiRunWakeRuns`, `#aiRunWake` (the run wake) | 30489–30492, 30528–30539, 30545–30556, 30588–30669 | `ai-runs` (earlier) or `scheduler` (later; D-583's triage) | through R29, registered with ai-runs (K31) or called by scheduler; `#aiRunWakeTickMs` follows `#captureRequestTickMs` and `#aiRunWakeHolds` asks `#captureRequestConfigured` |
| census `captureRequests` | `#counts` 20662 | `record-core` | this module's `declarePurge` (R35) |
| purge per bundle (`DELETE … WHERE target=?` through the declared purge, store 703; `UPDATE … SET lead_inquiry=NULL`, 22043) and whole store | 703, 22038–22098 | `record-core` | declared (R35); see §4 on the UPDATE |
| `PROJECT_NAMING_READS.capturerequests` | 22641 | the dispatcher (membership map §3.6) | unchanged |
| `op=acquire`'s capture-request arm | capture/acquire.mjs 227–245 (moved) | `capture` | already the in-process arm; `op=acquire` refuses the via from outside (K58) |

## 3. Conflicts with the layering, and interfaces BOB decides (P17)

1. **`modules.json` uses.** R14 needs `host-governor`'s `isHeld`, which is not in this module's `uses`; add it (layer 3). `scheduler` (layer 10) runs the drain's consumer but lists no `capture-requests`; add it. Open question 1's recommendation would add `promotion`.
2. **The scheduler consumer.** The entry at 2024–2105 calls the drain, `#captureRequestPending` and `#captureRequestTickMs`; it stays in the registry and reaches them through this module's factory, so R11's pending count and the cadence (60 s, `env.CAPTURE_REQUEST_TICK_MS`) become services.
3. **Earlier modules reading this table.** `observation-log` (sweep authority) and `ai-runs` (the wake) read `capture_requests` today. By K31 they offer a registration and this module registers R28 and R29. The alternative for the wake is to move it to `scheduler`, where D-583 was triaged.
4. **Private calls leaving the module:** `#one`/`#rows`, `Store.#aiIso`, `Store.#rand` (copies); `#aiRunInSight` and `ai_runs` read directly (to ai-runs' run sight and a run read); `runPrincipalGate` (`airun.mjs`, ai-runs); `viewerPredicate` and `#bundleGate` (membership R43); `normalizeType`, `parseFrontmatter` and the `bundles`/`files` reads (record-core `bundleInfo`, and an `inquiry` read for the member agent); `#observe` and `#lookAuthority` (observation-log's append; `#lookAuthority`'s `sweep` arm is unreachable here because the door requires a run); `#tickRunning` (non-re-entrancy: this module keeps its own flag); `#monitorToken`, `#monitorTokenBound` (monitoring's; only `#captureRequestConfigured` keeps a presence test).

## 4. Undetermined, and found in this reading

- **"Configured" after K58.** With the arm in process, the drain no longer needs `env.SELF` or to spend a credential. What R11's "configured" should then test (a bound daemon credential as the unattended act's stamp, or a setting) is BOB's; the draft keeps the stated property, inert unless configured.
- **Purge's lead clearing.** record-core R46's keyed form deletes rows; clearing `lead_inquiry` without deleting the row (22043) is not expressible. Either R46 gains a clearing form or this module registers a purge listener.
- **Three defects not in the old plan:** a body's `at` sets `requested_at` and `expires` (R6); a body's `request` is used as the id and a held one throws (R7); a row left `draining` by an interrupted tick is never read again (R21).
- **The member agent** is written by nothing in the product (inquiry's requirement; Suggestions).
- The schema comment says both principals are copied from the run; since REC-168 the plane principal is the caller's stamp (R8). The comment is corrected at extraction.
- **Tests** were not mapped. Candidates by name, under `bio-plane/test/`: `capturerequests.test/.control`, `rec168-capturerequest-principal.test/.control`, `rec165-production-principal`, `leadslug.test/.control`, `d522-unattended-render`, `rendered-capture`, `d260-resume`, `scheduler.test/.control`, `run-conditions`, `daemon-token`, `aicredential.test/.control`, `fence-e2e.test/.control`, `d270-refusal-truth.test/.control`, `refusal-wire`, `derivation-bounds`, `bounds`, `gate-reads`, `project-sight.test/.control`, `meaning-bounds`, `migrate-released`, `current`, `verdict-reader`, `vf4-live-scratch` (31 files touch the table or ops). The job sorts them.
