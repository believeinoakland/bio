# capture-requests — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` by a drafting worker for BOB #42 (P18, N35). Line ranges are `grep -n`-verified in `bio-plane/src/store.mjs` (54,618 lines), `index.mjs` (13,438), `schema.mjs` (4,287) and `checks/bio-checks.mjs` (16,591) at that date; the extraction job confirms them. A method's range runs from its signature to its closing brace; the comment block above it goes with it. The contract is `build/requirements/capture-requests.md` (R1–R36); K23, K31, K58 and K61 apply. The module exports a factory answering its one instance per Durable Object `ctx`, and reaches `record-core`, `membership`, `capture`, `host-governor`, `observation-log`, `inquiry` and `ai-runs` through theirs (K61).

## 1. What moves to `capture-requests`

All in `store.mjs` unless named otherwise.

| what | where today | lines | moves |
| --- | --- | --- | --- |
| section header, `CAPTURE_REQUEST_TICK_BATCH`, `…_PER_HOST_PER_TICK`, `…_TTL_MS`, `…_TICK_MS`, `#captureRequestTickMs`, `#captureRequestConfigured`, `#captureRequestPending` | store.mjs | 44506–44571 | yes (R11, R12). `#captureRequestConfigured` tests `env.SELF` and a bound daemon/admin credential; with the in-process arm (R16) `env.SELF` is no longer needed (§4) |
| `captureRequest` | | 44579–44830 | yes (R1–R9) |
| `#captureRequestAttribution` | | 44832–44865 | yes, as a public service (R10); the queue's producers call it today |
| `captureRequestDrain` | | 44869–45103 | yes (R11–R22) |
| `static #renderHoldReason` | | 45109–45115 | yes (R25) |
| `#captureRequestConduct`, `#captureRequestHostHeld`, `#captureRequestMemberAgent` | | 45117–45218, 45223–45226, 45232–45239 | yes (R14). `#captureRequestHostHeld` reads `host_governor` directly; it becomes host-governor's `isHeld` (its R14). `#captureRequestMemberAgent` reads `files` for the inquiry's `bundle.md`; it becomes an `inquiry` read |
| `#fireCaptureRequest` | | 45257–45294 | rewritten to call `capture`'s in-process arm (R15, R16); the `env.SELF` fetch, the credential and D-334's `MONITOR_NO_LIVE_CREDENTIAL` path go |
| `captureRequestDraining` | | 45304–45328 | retires with its op once the arm is in process (Suggestions); until then, moves |
| `captureRequests` | | 45340–45406 | yes (R23–R25) |
| the `capture-request-drain` consumer entry | `#schedConsumers` | 3675–3695 | the entry stays with the scheduler's registry and calls this module (§3.2) |
| store-op routes `capturerequest`, `capturerequestdrain`, `capturerequestdraining`, `capturerequests` | store.mjs `fetch` | 53866–53885 | yes (K3) |
| OPS rows and their comment | index.mjs | 1552–1579 | yes (R30); `control-plane` keeps routing |
| `captureRequestArm` | index.mjs | 3963–4025 | no: it is `capture`'s refusal of an outside `via: "capture-request"` (C-28.13, capture R37); it shrinks to that refusal |
| `capturerequest` in `AI_RUN_ACTIONS`, `RUN_PRODUCTION_ACTIONS`, `NEEDS` (`contribute`), the viewer-stamp list; `capturerequestdrain` in `UNATTENDED_BY_DECISION` | index.mjs | 1943, 1983, 2787, 12102–12111, 4321–4323 | stay with `control-plane` (routing, stamps) and are the input to R1, R8, R30 |
| `capture_requests` DDL, comment and three indexes | schema.mjs | 2668–2790 | yes (K4) |
| additive columns `lead_inquiry`, `run_woken_at`, `render` | store.mjs `ADDITIVE_COLUMNS` | 1143–1169 (entries 1149, 1157, 1169) | yes |
| C-28 family and its helpers: `CAPTURE_PURPOSES`, `CAPTURE_UA_MODES`, `userAgentIsLegible`, `CIVICOS_CONTACT_URL`, `civicosUserAgent`, `CAPTURE_REQUEST_CHECKS` | bio-checks.mjs | 9175–9455 | stay in `legacy-checks` (capture also uses `civicosUserAgent` and C-28.13); every C-28 `where` string names a store.mjs site and must be updated to the module's path (K6) |

About 1,050 lines move or are rewritten, about 450 of the 902 store lines being code.

## 2. What reads `capture_requests` from outside, and where it goes

| what | lines | owner | rewire |
| --- | --- | --- | --- |
| `#conditionsCaptureRequested`, `#findingsOutOfInquiryLead`, `#conditionsRenderDeferred` | 29463–29510, 29629–29716, 30718–30774 | `queue` (layer 11, later) | call R26 and R10; D-581's bound (R27) |
| `#observationBundles`, case `sweep` | 46714–46798 (the `capture_requests` read at 46764–46770) | `observation-log` (layer 5, earlier) | cannot call a later module: R28 registered with observation-log (K31) |
| `#aiRunWakeTickMs`, `#aiRunWakeHolds`, `#aiRunWakeRuns`, `#aiRunWake` (the run wake) | 49014–49016, 49053–49064, 49070–49081, 49113–49194 | `ai-runs` (earlier) or `scheduler` (later; D-583's triage) | through R29, registered with ai-runs (K31) or called by scheduler; `#aiRunWakeTickMs` follows `#captureRequestTickMs` and `#aiRunWakeHolds` asks `#captureRequestConfigured` |
| census `captureRequests` | 32594–32599, 34653–34655 | `record-core` | this module's `declarePurge` (R35) |
| purge per bundle (`DELETE … WHERE target=?`, `UPDATE … SET lead_inquiry=NULL`) and whole store | 34289–34326, 34594–34601 | `record-core` | declared (R35); see §4 on the UPDATE |
| `PROJECT_NAMING_READS.capturerequests` | 35947 | the dispatcher (membership map §3.6) | unchanged |
| `op=acquire`'s capture-request arm | index.mjs 8006, 8051–8076 | `capture` | becomes the in-process arm; `op=acquire` refuses the via from outside (K58) |

## 3. Conflicts with the layering, and interfaces BOB decides (P17)

1. **`modules.json` uses.** R14 needs `host-governor`'s `isHeld`, which is not in this module's `uses`; add it (layer 3). `scheduler` (layer 10) runs the drain's consumer but lists no `capture-requests`; add it. Open question 1's recommendation would add `promotion`.
2. **The scheduler consumer.** The entry at 3675–3695 calls the drain, `#captureRequestPending` and `#captureRequestTickMs`; it stays in the registry and reaches them through this module's factory, so R11's pending count and the cadence (60 s, `env.CAPTURE_REQUEST_TICK_MS`) become services.
3. **Earlier modules reading this table.** `observation-log` (sweep authority) and `ai-runs` (the wake) read `capture_requests` today. By K31 they offer a registration and this module registers R28 and R29. The alternative for the wake is to move it to `scheduler`, where D-583 was triaged.
4. **Private calls leaving the module:** `#one`/`#rows`, `Store.#aiIso`, `Store.#rand` (copies); `#aiRunInSight` and `ai_runs` read directly (to ai-runs' run sight and a run read); `runPrincipalGate` (`airun.mjs`, ai-runs); `viewerPredicate` and `#bundleGate` (membership R43); `normalizeType`, `parseFrontmatter` and the `bundles`/`files` reads (record-core `bundleInfo`, and an `inquiry` read for the member agent); `#observe` and `#lookAuthority` (observation-log's append; `#lookAuthority`'s `sweep` arm is unreachable here because the door requires a run); `#tickRunning` (non-re-entrancy: this module keeps its own flag); `#monitorToken`, `#monitorTokenBound` (monitoring's; only `#captureRequestConfigured` keeps a presence test).

## 4. Undetermined, and found in this reading

- **"Configured" after K58.** With the arm in process, the drain no longer needs `env.SELF` or to spend a credential. What R11's "configured" should then test (a bound daemon credential as the unattended act's stamp, or a setting) is BOB's; the draft keeps the stated property, inert unless configured.
- **Purge's lead clearing.** record-core R46's keyed form deletes rows; clearing `lead_inquiry` without deleting the row (34326) is not expressible. Either R46 gains a clearing form or this module registers a purge listener.
- **Three defects not in the old plan:** a body's `at` sets `requested_at` and `expires` (R6); a body's `request` is used as the id and a held one throws (R7); a row left `draining` by an interrupted tick is never read again (R21).
- **The member agent** is written by nothing in the product (inquiry's requirement; Suggestions).
- The schema comment says both principals are copied from the run; since REC-168 the plane principal is the caller's stamp (R8). The comment is corrected at extraction.
- **Tests** were not mapped. Candidates by name, under `bio-plane/test/`: `capturerequests.test/.control`, `rec168-capturerequest-principal.test/.control`, `rec165-production-principal`, `leadslug.test/.control`, `d522-unattended-render`, `rendered-capture`, `d260-resume`, `scheduler.test/.control`, `run-conditions`, `daemon-token`, `aicredential.test/.control`, `fence-e2e.test/.control`, `d270-refusal-truth.test/.control`, `refusal-wire`, `derivation-bounds`, `bounds`, `gate-reads`, `project-sight.test/.control`, `meaning-bounds`, `migrate-released`, `current`, `verdict-reader`, `vf4-live-scratch` (31 files touch the table or ops). The job sorts them.
