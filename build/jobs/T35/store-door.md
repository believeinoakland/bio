# store-door (T35)

**Status** · session_01MXpTEk4ANkFVxAzUYMNVuY · depth 2 · WORKING · handled B5

## J1 · QUESTION

Three readings I am building on; nothing stops while you answer.

1. **R9's header (F1).** `control-plane` R59 says the grant reaches the store "in the request's body or a header" but names neither. The store's internal request is built fresh by the Worker (no caller header reaches it), and a body field would mix with the route's own arguments (R11 logs the body as `args`). My reading: the door reads an ask's grant only from the header `x-bio-grant` (exported as `GRANT_HEADER` from `store-door/dispatch.mjs`), for every read under a grant (R11) and for `askcheck`; never from the query, never from the body. `control-plane` (T35-72) sets that header where `index.mjs`:1089 sets `?grant=` today. The door reads no session itself (the `session` stamps read by `credentials`' `signout` routes and `capture`'s are those modules' maps, not this door's). If you want `Authorization: Bearer` instead, it is a one-line change.
2. **`DISPATCH_CHECKS`.** I import it from `../answer-envelope/checks.mjs`, assuming T35-80 copies `checks.mjs` whole under that name (the split plan's C-1 row). If ANSWER-ENVELOPE names it otherwise, I re-point after its merge.
3. **The step's name (R5).** `plane/store.mjs`:94 `STEP = "control-plane"`; `STEP_ORDER` filters the name out of `MODULE_ORDER` and inserts it before the first layer-11 module, so `plane` can register under `"store-door"` by changing that one constant, rank unchanged. My tests register it under `"store-door"` at that rank. Whether plane renames it is T35-73's (reported in my record).

## J2 · COMPLETE

T35-81 complete (commits on `job/T35/store-door`). Not yet merged with answer-envelope: `dispatch.mjs` and two tests import `../answer-envelope/checks.mjs` (K2037), which lands with T35-80; I tested against an untracked copy of `control-plane/checks.mjs` at that path (not committed). After T35-80's merge, say so and I merge the tranche branch and re-run.

**Files, for my `modules.json` row:** paths `bio-plane/src/store-door/` (`dispatch.mjs` 351, `pull.mjs` 124, `step.mjs` 37; 512 lines); tests `bio-plane/test/m/store-door/` (`harness.mjs`, `record.mjs`, `dispatch.test.mjs`, `purge-hold.test.mjs`, `promotion-step.test.mjs`, `pull.test.mjs`, `routes.test.mjs`).

**Uses: 18 more needed, test-only.** The architecture check, run with my row filled in, fails 19 imports in `test/m/store-door/record.mjs`. That is the record fixture copied from control-plane's. It composes the modules a promotion's steps and the testimony path reach, in the composition root's order, and R5's and R7's tests need it. The modules, all earlier in the order: attestation, provenance-routes, calibration, extraction, content, entities, connections, progressions, bias, observation-log, retrieval, inquiry-grammar, inquiry, basis-versions, contradiction, run-productions, capture-requests, intent. The fix is to add these to the row's `uses` (control-plane declares them all). The other option, a slimmed fixture, would weaken R5's testimony-path tests; say if you want it.

Entries applied:
- **(C-2)** Copied `dispatch.mjs`, `pull.mjs` and `step.mjs` whole. The only changes:
  - `DISPATCH_CHECKS` is now read from `answer-envelope/checks.mjs`.
  - Comments re-point to R1–R11 (a `control-plane` id is named as such).
  - R9, below.
  - `controlPlaneRoutes` keeps its name, so plane's composition is unchanged.
- **(F1, its share) R9:** `dispatch` reads the grant only from the `x-bio-grant` header (`GRANT_HEADER`, `grantOf(req)`).
  - A `grant` in the query or body is not read. A query grant is also not logged among R11's arguments.
  - The grant is handed to the route map as `store.routes(url, body, grant)` and to `controlPlaneRoutes(ctx, url, body, grant)`, so `askcheck` reads it there and not from `q("grant")`.
  - The door makes no request of its own (tested with a `fetch` spy).
  - `CREDENTIAL_IN_ADDRESS` is not this door's to answer: it builds no answer for the Worker's caller. That is control-plane's, admission's and publication's.
- **(N686, its share) R10:** the per-act resolution is the door's and is unchanged. Before either draft's handler it answers `NOT_AN_ADMIN`, `ASSISTANT_OFF`, `AI_NO_ACCOUNT`, both ceilings and credentials' own refusal, then hands the handler `{on, account: {kind, level}}`.
  - No `/draft` call is the door's. The `/draft` call itself, the account in agent-worker R6's wire shape (with its `secret`, which this door never holds, per K1755) and the grant mint are control-plane R57's (T35-72) and plane's wiring (T35-73). See the REPORT below.
- **Tests moved, case by case** (copies; control-plane's job deletes its own):
  - `dispatch.test.mjs`: R26→R1, R27→R2.
  - `purge-hold.test.mjs`: R46→R4, all except the last case, the Worker's relay (R23), which stays control-plane's.
  - `promotion-step.test.mjs`: R42→R5, registered as `"store-door"` at the old rank.
  - Pull cases, R36→R7: `inbox-door`'s four store-side cases and `doorbell`'s four. The Worker-side cases stay.
  - Door cases from elsewhere: `doorbell`'s sources-map and own-key cases (R1); `r50-routes`' tally (R8); `t34-routes`' two draft cases (R10) and `askusage`'s `calls`; `r53-routes`' read log and ask routes (R11); `envelope`'s store half of R25 (R6); `r48-routes`' `projectholds` classification (R3).
  - New: R1's map census, R3's frame for the three hold ops, R9, and R12.

Deferred: none.

**For other modules (REPORT):**
- **answers:** `answers/ops.mjs`:11 reads `grant` from the query, for `rule` and `answercheck`. Once control-plane sends the grant only in `x-bio-grant`, these get no grant, so `rule` would record under none. They need the grant the door now hands as `store.routes`' third argument, which plane passes to `answersOps` (a fourth argument). That is answers' and plane's F1 share; I changed neither.
- **plane (T35-73):**
  - `store.mjs`:426 `routes: (url, body) => this.routes(url, body)` should pass the third argument through to `controlPlaneRoutes` and `answersOps`.
  - `STEP = "store-door"` (K2037).
  - Re-point `:69–70` to `store-door/`.
- **control-plane (T35-72):** set `x-bio-grant` where `index.mjs`:1088–1089 sets `?grant=` (K2037). `/draft` needs the wire account (above).

Tests: `node --test bio-plane/test/m/store-door/`: 35 pass, 0 fail. `manifest.md` names no layer tests.

Checks (from the process repository):
- `format`: 0 failures.
- `architecture` (row empty, as B1 says): 0 product files, 0 failures. With my row filled in locally: the 19 test-only uses above.
- `coverage` (row empty): 12 of 12 not named, expected. With the row filled in: 12 of 12 named, 0 failures.
- `ownership store-door tranche/T35`: 0 failures.

Size (session_01MXpTEk4ANkFVxAzUYMNVuY): test runs 9, module lines 512

## J3 · REPORT

Correction to J2's ownership line: I ran it before committing. Run on HEAD with my row empty, `ownership store-door tranche/T35` gives 11 files and 10 failures: my ten new files are outside the empty `paths`, which B1 expects. With the row filled in as J2 lists it (run locally, not committed), it gives 11 files and 0 failures. Nothing else in J2 changes.

## J4 · COMPLETE

B3 and B4 applied (commit on `job/T35/store-door`; `tranche/T35` merged as B3 asked).
- **R9 (K2038, K2041 (a)):** `dispatch` reads `x-bio-session`, `x-bio-grant` and `x-bio-credential-sha` (`SESSION_HEADER`, `GRANT_HEADER`, `CREDENTIAL_SHA_HEADER`). It sets each header's value on the in-process URL that `store.routes(url, body, grant)` receives, overriding any query value: the session as `session` and `t`, the grant as `grant`, the digest as `sha`.
  - The grant is still also handed as the third argument.
  - A header that is absent leaves the URL as the Worker sent it. This keeps parameters that are not credentials, such as capture's `loadcapturesession` `session` id and extraction's `session=1` flag, and the grant ids that review, wizard-scripts, filing-templates and docket revoke by.
  - R11's read log takes the read's arguments before the headers are handed on, so no session or digest is logged.
- **K1986:** `askusage` now passes `b.mode ?? "ask"` to `countAskUsage`. A draft's usage counts under `draft`; ai-runs refuses any other mode.
- **K2041 (b):** noted. Architecture, run with my row filled in locally: 0 failures.

Tests: `node --test bio-plane/test/m/store-door/`: 36 pass, 0 fail. New: an R9 case for the three headers, through credentials' `session` and `aicredentiallook` and answers' `answercheck` over a real record. R11's `askusage` case now covers `draft`, `run` refused, and the absent mode as `ask`. Still tested against an untracked copy of `control-plane/checks.mjs` at `answer-envelope/checks.mjs`, now removed; I re-run after T35-80 merges, as B4 (c) says.

Checks on HEAD, with my row empty as on the tranche: format 0 failures; architecture 0 failures; coverage 12 ids unnamed and ownership 10 failures, both because the row is empty (expected). With the row filled in locally: architecture 0 failures, coverage 12 of 12 named, ownership 11 files and 0 failures.

Size (session_01MXpTEk4ANkFVxAzUYMNVuY): test runs 12, module lines 533
