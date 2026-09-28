# capture-requests (T7)

**Status** · session_01NwvumqeZpXpPVxqHF2TYjC · depth 2 · WORKING · handled B3

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
