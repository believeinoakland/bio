# capture-requests (T7)

**Status** · session_01NwvumqeZpXpPVxqHF2TYjC · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Seven points, each with my best reading. I am building on these readings now; none stops me yet except where marked.

1. **Uses.** My requirements' Uses name `promotion` (R38) and `runtime-limits` (R11, R37: `unattendedCredential`), which `modules.json` does not list for capture-requests, so the architecture check refuses either import. Reading: add both (both earlier in the order). Note runtime-limits R26 (`unattendedCredential`) is not built; until it is, my factory takes the presence test as an injected dependency defaulting to runtime-limits' R26 rule (`DAEMON_TOKEN` or `ADMIN_TOKEN` present), and I import nothing from runtime-limits.

2. **"Configured" after K58 (map §4).** The drain now fires `capture`'s in-process arm, so `env.SELF` is no longer needed. Reading: R11/R37 "configured" = runtime-limits R26's `bound` (a daemon or admin credential bound: the unattended act's stamp), and `env.SELF` is no longer asked.

3. **What `capture`'s in-process arm does not offer (layer 3, closed).** Its `captureRequest` arm takes `{locator, purpose, agent, render}` only. My R38 (origin `sweep`, deeming actor the run and both principals, matched scope the target), R39's conditional fetch with the held capture's validators, and R41's fetch with a member's credential and its provenance marking (used, whose, scope, not reproducible by the public) all need that arm to accept and act on more. Reading: I build my side in full: I read `credentialsForFetch` (key `env.CAPTURE_CREDENTIALS_KEY` on the first call, the row's `principal_plane`, `target`, `host`), the held capture's digest, and the origin, and pass them to the arm as `captureRequest.{credential, heldSha, origin}`; R39's no-validator half (identical bytes recorded as the held capture, the row pointing at its digest, the answer saying it was already held) I meet on my side from the arm's own answer; the conditional request, the credentialed fetch and the provenance marking wait on a `capture` entry (a later tranche), and I record R38/R39/R41 as partly met. Please confirm, or say if you want the capture entry now.

4. **R38's promotion.** "Promoted at `collected`" means a new `information` bundle composed by the plane (bundle.md at `collected` plus `data/provenance.json` with the capture document), created through `promotion.promote` under author `token:daemon`. Nothing in the plane composes an information document today (the UI and members do). Reading: this is new composition large enough to be its own entry; I defer R38 in this job (record-core `allocId("INFO", year)` for the id, the producing group from promotion R13) unless you rule it in. **This one decides what I build**; I carry on with everything else meanwhile.

5. **R40's reasons and the code for a source refusal.** Reading: from `capture`'s answer `SOURCE_REFUSED` with its status: 401 and 407 `login`, 402 `paywall`, 403 and 406 `user-agent` (D-94 measured a 403 as the answer to an agent the source refuses), 451 and any other refusal `other`; these source refusals are terminal (`refused`, so R42 can retry them), stored in a new column `source_reason`; a thrown fetch, a 5xx or 429 stays a hold under `CAPTURE_FETCH_FAILED` (C-28.17) with `source_reason` `other`. The terminal refusal needs a code of its own: C-28.17's sentence says the request is still queued. Proposed row (legacy-checks, which I cannot write): `CAPTURE_SOURCE_REFUSED`, C-28.19, `where` `src/capture-requests/index.mjs captureRequestDrain > is-capture-source-refused`, "The site turned this request away (it asked for a login, a payment, a different browser, or refused for another reason it gave). Nothing was captured. A member who can see the question may supply what the site asked for and ask again." Until it exists R19's catalogue test is red for this one code.

6. **Ops I cannot route.** `op=capturerequestretry` (R42) needs an OPS row in `index.mjs` (admin, member with `contribute`, mutating; and `contribute` in NEEDS), which is legacy-index's. I add the store route delegating to my module; the OPS row is legacy-index's (a REPORT). I also retire `captureRequestDraining` and its store route (my Suggestions); its OPS row in index.mjs goes stale for legacy-index.

7. **R27 and R29.** R27 read as: every R26 walk is bounded in SQL (`limit`, one row over for `truncated`, on an index), so terminal rows no longer enter an unbounded walk; I delete nothing (requests are scratch, but deleting a completed row unread is a product choice). R29: ai-runs (concurrent) states its wake reads "the wait source capture-requests registers" but names no service; I provide `waits` and `markWoken` and, from my factory, call `aiRuns.registerWaitSource("capture-requests", {waits, markWoken})` when ai-runs offers it. Please confirm that name to both of us. I also register observation-log's `sweep` resolver (R28) from my factory, replacing legacy-store's.

## J2 · REPORT

Work for other modules that this extraction makes visible. Measured on `job/T7/capture-requests` against `tranche/T7` (base worktree at `origin/tranche/T7`).

1. **legacy-checks.** Every C-28 `where` still names a `src/store.mjs` site that is gone. The DEC-49 guard reports the door, conduct and fetch-failed rows as unresolvable, and my three regions as unclaimed. Re-point them (K6):
   - C-28.1–.4, .14–.16 → `src/capture-requests/index.mjs captureRequest > is-capture-request`
   - C-28.6–.11 → `src/capture-requests/index.mjs #conduct > is-capture-conduct`
   - C-28.17 → `src/capture-requests/index.mjs drain > is-capture-fetch-failed`
   C-28.18 already names my file and now resolves. `CATALOG_VERSION` does not move, since no row changes.
2. **legacy-index** (layer 11, forwarded per K181 (6)):
   - (a) Add an OPS row for `capturerequestretry`: admin, and member with `contribute`, mutating, with the viewer and principal stamps. Add it to NEEDS (`contribute`) and to the viewer-stamp list. The store route is in place.
   - (b) Remove the `capturerequestdraining` OPS row. The op is retired: its function and store route are gone. Until the row goes, admin and probe get `unknown op: capturerequestdraining` with no code, which is refusal-wire's one new red.
3. **ai-runs** (K182): the store's run wake (`#aiRunWakeHolds`, `#aiRunWakeRuns`, the completion read) still reads `capture_requests` directly, counting `captured` and `refused` only. D-583 is met only once the wake reads my wait source. My factory calls `aiRuns.registerWaitSource("capture-requests", source)` when it is passed `aiRuns`, and `captureRequestsOf(ctx).waitSource()` answers the K182 shape. Legacy-store does not pass `aiRuns` yet, because no ai-runs factory exists on my branch. Whoever merges ai-runs wires the registration: pass `aiRuns` on the store's `captureRequestsOf` call, or call `registerWaitSource` with `waitSource()`. The wake's only store-side lines I touched are its two reads of my services, `drainIntervalMs()` and `configured()`.
4. **capture** (N140): the in-process arm ignores `captureRequest.credential`, which my drain now passes (R41), and offers no conditional fetch (R39). R38's origin and deeming actor wait on it too.
5. **legacy-tests** (layer 11). These suites are red here and green or less red on the base. Each red is a source pin, or a fixture that names its own request id or instant, which R6 and R7 now ignore by design. None is a behaviour fault. Checked: d522 with the minted id substituted is 21/0.
   - `capturerequests` 138/1 → 102/37: schema.mjs and store.mjs source pins; `CR-D491-*` body ids; `capturerequestdraining` arms; §9a import pin.
   - `d522-unattended-render` 21/0 → 12/9: body ids `CR-D522-*`.
   - `scheduler` 51/0 → 47/4: body `at` backdating request H.
   - `leadslug` 74/0 → 71/3: schema, ADD COLUMN and purge text pins.
   - `d334-monitor-credential` 41/0 → 39/2: `#captureRequestConfigured` and `#fireCaptureRequest` pins.
   - `bounds` 3 → 4 fails: the drain's constant pin.
   - `derivation-bounds` 7 → 8: M0-63's admitted members `#conditionsCaptureRequested` and `#findingsOutOfInquiryLead` no longer hold an unbounded row source. This is D-581's intended effect (R27): re-read their admission, don't re-pin it.
   - `project-sight` 11g++: `capturerequests` is routed through the module's ops spread.
   - `run-conditions` W3b: `captureRequest` has left store.mjs.
   - `refusal-wire`: see 2b.
   - The guard's `MULTI_SITE_CLOSED` entry for `CAPTURE_NOT_DRAINING` is now stale.
   Unchanged: the other 23 suites I ran that touch the table, including aicredential, rec168, rec165, rendered-capture, purge, migrate-released and notifications.
6. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale (fleetbundles 92/4, bio-plane only), as expected, for regeneration at the layer close.

## J3 · COMPLETE

**Entries applied.** T6-8, extracted per the map (re-checked, MAPS67) and the requirements, with J1's readings as adopted (K181, K182).

New module files, `bio-plane/src/capture-requests/`:
- `index.mjs`: the door, the attribution composer, the drain, the reads, retry, the wait source and the ops handlers.
- `schema.mjs`: the table's DDL, moved from `schema.mjs` with its comments corrected (the plane principal is the caller's stamp; the arm is in process). It adds R40's `source_reason` column and two read indexes.
- `checks.mjs`: C-108.1, `CAPTURE_SOURCE_REFUSED`.

The factory `captureRequestsOf(ctx, deps)` (K61):
- declares the table to record-core's purge, keyed by `target`;
- registers R28 as observation-log's `sweep` resolver, which legacy-store no longer registers;
- registers the K182 wait source with ai-runs when it is given `aiRuns`.

Legacy-store now only delegates:
- the scheduler consumer calls `drainPending`, `drainIntervalMs` and `drain`;
- the queue's three producers call R26's bounded reads and R10;
- purge calls `clearLead`;
- the run wake reads `drainIntervalMs` and `configured`;
- the ops route through `captureRequestsOps`;
- `captureRequestDrain` stays as a Durable Object method for the suites that call it.

Net change in legacy-store: 24 lines added, 1,114 removed.

Carried rows and not-yet-met ids now met:
- R6: the instance's clock, never a body's `at`; answers are the row as written.
- R7: the id is minted here, never a body's `request`; the door never throws.
- R11 and R37: "configured" is runtime-limits R26's `bound` rule, injected until R26 is built; `env.SELF` is no longer asked.
- R16: the arm is in process.
- R18 (D-582): C-83.6 is terminal and spends the host's slot; C-83.7 holds and spends it.
- R19 (D-584): C-28.17 at its region.
- R20 (D-581): every row past `expires`, plain or render, is released `expired` before selection.
- R21: a `draining` row left by an interrupted tick returns to `requested`, or expires.
- R27 (D-581): R26's walks are bounded in SQL on an index; nothing is deleted.
- R29 (D-583): `expired` counts as a completion, in `waits` and `markWoken` and in the K182 source.
- R40: `source_reason` by status, terminal statuses under C-108.1.
- R42: `captureRequestRetry` with region `is-capture-request-retry` minting C-28.18. LEGACY-CHECKS #2 REPORT 3 is applied: `is-capture-fetch-failed` is marked and C-28.18 is minted.
- N63's share: pending count and interval as named services, `expired` a completion.
- N39's share: fills observation-log's registration and offers ai-runs' wait source.
- CAPTURE-SOURCES #2's notes: the key goes on the first `credentialsOf` call; the row's `principal_plane`, `target` and `host` go to `credentialsForFetch`.

Retired, per my Suggestions: `captureRequestDraining` and its store route. The Suggestion that tests assert R9 "over the door's source" is not followed. R9 is tested at the interface: the door is driven with capture, the governor, credentials and `fetch` each failing the test if touched.

**Deferred.**
- R38's promotion at `collected` (N141, K181). My side is in place: the captured row carries the run, both principals and the target.
- R39's conditional fetch and R41's credentialed fetch with its provenance marking wait on capture's arm (N140). My side is built: the admitted credential is passed to the arm, and bytes already held (`existed`) are recorded as the held capture, the answer saying so.
- R30 for `capturerequestretry` waits on legacy-index's OPS row (K181 (6)).

**Found in other modules:** REPORT J2 (legacy-checks' C-28 `where`s; legacy-index's two OPS rows; ai-runs wiring the wait source; capture N140; legacy-tests' re-anchors, each measured on base and branch; the plane bundle stale).

**Tests** (`node --test bio-plane/test/m/capture-requests/`): tests 53, pass 53, fail 0.
- `door`, `drain`, `reads` and `retry` run over the real record-core, membership, observation-log, host-governor and capture-sources credentials on node:sqlite, with a scripted in-process capture arm.
- `plane` runs in Miniflare's Durable Object: R30's admission per class, and the spine end to end through the ops (R16, R31).
- Every live id is named by a test (42 of 42). No layer tests are named in the manifest.
- Old battery: 33 suites run on base and branch; the differences are in REPORT J2 §5.
- DEC-49 guard: 102 failures on the base, 103 here. Two base failures are cleared (the C-28.18 file now exists; `CAPTURE_FETCH_FAILED` has one site). Every new failure is a stale `where` or a stale declaration (REPORT §1, §5).
- fleetbundles: 92/4, bio-plane's bundle stale.

**Checks** (civicos-process):
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture`: 9 product files, 29 relative imports; 0 failures.
- `coverage`: 42 of 42 live requirement ids named by a test; 0 failures.
- `ownership` vs `tranche/T7`: 12 files changed; legacy-store 24 lines added, 1,114 removed; 0 failures.

Size (session_01NwvumqeZpXpPVxqHF2TYjC): test runs 45, module lines 1104
