# answer-envelope (T35)

**Status** · session_017eKYzzg1hrdp8PcUr1pMS3 · depth 2 · WORKING · handled B3

## J1 · QUESTION

Two readings, both carried on unless you answer otherwise.

(1) `uses` edge. R6's test drives `withPagePolicy` over both pages the plane serves as HTML: the setup page (`setupPage`, through `instance-setup`'s `src/setup.mjs`, already in my uses) and the signer page (`SIGN_HTML`, `src/signpage.mjs`, owned by `signatures`, not in my uses). My best reading: add `signatures` to answer-envelope's `uses` (layer 1, earlier; a test-only import). Until you add it, the architecture check names that one import.

(2) Where R6's route-level test lives. R6 says "a test fetches each HTML route twice". The routes (`/sign`, `/`) are `control-plane`'s `makeFetch`, a later module my tests cannot import; until T35-72 it calls its own `withPagePolicy`. My reading: my tests check R6 in full at my interface (`withPagePolicy` over each served page's real bytes, twice: two different nonces, a `script-src` of `'nonce-<n>'` alone with no other source, every `<script>` of each body carrying its response's nonce, no other origin anywhere in the policy, non-HTML untouched), and the door-level fetch-twice arm is control-plane's in T35-72 once its door calls this module's `withPagePolicy`. The same holds for the door-driven cases of `envelope.test.mjs` (R21–R25 through `makeFetch`): I test R1–R5 at this module's functions and leave those cases to control-plane's job to keep, re-name or delete; I delete nothing of control-plane's.

## Completion

**Entries applied (T35-80).**
- (C-1) Copied from `control-plane`: `PAGE_POLICY`, `withPagePolicy` (`index.mjs` 83–96) and the envelope and decoration block (`index.mjs` 226–528: `json`, `dec49Decorate`/`dec49Attach`, `doAnswer`, `storeRefusal`, `storeSilent`, `relayAnswer`, `STORE_SILENT_*`, `planeInternalError`/`planeInternalAnswer`, `replayRow`, `requiredArgumentRow`, `requiredArgument`, `installationRow`, `dispatchRow`, `StoreSilent`) into `bio-plane/src/answer-envelope/index.mjs`; `checks.mjs` and `families.mjs` whole beside it. Code unchanged but for R6; comments' R ids re-pointed (control-plane R21–R25 → R1–R5, R43 → R7; other ids named `control-plane` Rn). `index.mjs` exports every name the plane and the doors read (`json`, `doAnswer`, `storeSilent`, `storeRefusal`, `relayAnswer`, `STORE_SILENT_*`, `requiredArgument`, the row readers, `dec49Row`, `dec49Attach`, `CHECK_FAMILIES`, `CHECK_FAMILY_FILES`, `StoreSilent`, the four check tables); `checks.mjs` keeps `DISPATCH_CHECKS` at its path and name for store-door (B2).
- (R8) `where` re-pointed: C-61.1, C-69.2, C-69.3 → `src/answer-envelope/index.mjs`; C-69.4, C-69.5 → `src/store-door/dispatch.mjs`; C-69.1, C-68.2–.4, C-66.6 keep `src/control-plane/index.mjs`. Codes, checks and translations unchanged. These five `where` changes await stamp (accepted red 2).
- (Red 26, K1974) `src/law-relations/checks.mjs` joins `CHECK_FAMILY_FILES` directly before `src/standards/checks.mjs`; the list ends with `src/answer-envelope/checks.mjs`, alone (R7).
- (F17, R6) `withPagePolicy` is async: for a `text/html` answer it reads the body, draws a fresh 128-bit nonce (`crypto.getRandomValues`, base64), sets `script-src 'nonce-<n>'` alone (no `'self'`, host, `'unsafe-inline'` or `'unsafe-eval'`; the other directives as before), gives every `<script>` start tag `nonce="<n>"` (replacing any nonce it carried; tags found as HTML tokenises them: comments and the raw text of script, style, textarea and title passed over, quoted attribute values respected) and (B3, K2038) fills every `NONCE_SLOT` (`__CSP_NONCE__`, setup-page R28) in the body. `content-length` is dropped; status and other headers kept. A body that cannot be read answers R5's `PLANE_INTERNAL_ERROR`. Any other answer leaves untouched. Both served pages have one inline script and no inline handlers, so they run as before.
- (R7) The catalogue-end snapshot `rows-before-r43.json` moves here with R7's test; 48 translations re-worded by their owners in T35 are re-pinned in this copy (its `changed.note` names them): the DEC-149 sweep rows (K1847) and C-26.2 (BIAS #11 J1), C-112.3 (standards T35-31, K1713). Each keeps its check; no code lost; no other row moved.
- Tests (all naming their ids): `envelope.test.mjs` R1–R5, R8, R9 at this module's functions; `page-policy.test.mjs` R6 (both pages twice over their real bytes, nonce entropy and freshness over 2,000 responses, tokenising, the slot, non-HTML untouched, unreadable body); `families.test.mjs` R2, R7 (moved from control-plane's, plus law-relations' place and rows); `catalogue-end.test.mjs` R7, R2 (moved). `load.mjs` loads the module under node (the `cloudflare:workers` stand-in, as control-plane's harness).

**Files for the `modules.json` row** (paths `bio-plane/src/answer-envelope/`, tests `bio-plane/test/m/answer-envelope/`): `src/answer-envelope/index.mjs`, `checks.mjs`, `families.mjs`; `test/m/answer-envelope/envelope.test.mjs`, `page-policy.test.mjs`, `families.test.mjs`, `catalogue-end.test.mjs`, `load.mjs`, `rows-before-r43.json`.

**Deferred.** None of this module's.

**Found in other modules (REPORT to BOB).**
1. Red 26 does not clear at this merge; it moves. This module's totality arm (`families.test.mjs` R2, R7) names `bio-plane/src/control-plane/checks.mjs` `BOOTSTRAP_CHECKS`, `DISPATCH_CHECKS`, `REPLAY_CHECKS`, `REQUIRED_ARGUMENT_CHECKS` (control-plane's copy, distinct row objects) until T35-72 deletes that file; it is green otherwise (measured with the row filled locally: 10 pass, 1 fail, that one). control-plane's own totality test names `law-relations/checks.mjs` today and, once this module's row is filled, also this module's four tables, until T35-72 deletes its `families.mjs` and that test.
2. control-plane (T35-72): its door calls this module's `withPagePolicy` (now async: `return await withPagePolicy(res)` in `planeDoor`), and holds R6's route-level arm (`/sign`, `/`, `/?store=scratch` fetched twice; B2). Its `catalogue-end.test.mjs` (red 19) and `rows-before-r43.json`, `families.test.mjs`, `page-policy.test.mjs` and `envelope.test.mjs`'s non-door cases are now this module's; its copy goes with the deletion.
3. plane (T35-73): `door.mjs`:24–25 and `index.mjs`:5–6 re-point to `../answer-envelope/index.mjs` (every name they read is exported here; `PUBLISHED_STORE`, `caseReader`, `captureKey`, `storageAbsent` stay control-plane's).
4. setup-page: `NONCE_SLOT` is held here as the literal K2038 names (`__CSP_NONCE__`); setup-page's export must spell the same. Nothing in this module imports setup-page.
5. No generated artifact is stale: nothing bundled imports this module yet.

**Tests and checks run.**
- `node --test test/m/answer-envelope/` (bio-plane): tests 26, pass 24, fail 2: the two named in (1) and the row (`families.test.mjs` "R2, R7 (K585 (1))" and "R2, R7 (T33-89 …)", which read this module's files' owner from `modules.json`; with the row filled locally the second passes and the first names only control-plane's copy).
- `node checks/format.mjs`: 133 modules, 132 requirements files; 0 failures.
- `node checks/architecture.mjs … answer-envelope`: with the row filled locally, 9 product files, 97 relative imports; 0 failures (with the empty row: 0 files, as B1 says).
- `node checks/coverage.mjs … answer-envelope`: with the row filled locally, 9 of 9 live ids named by a test; 0 failures.
- `node checks/ownership.mjs … answer-envelope tranche/T35`: with the row filled locally, 10 files; 0 failures (with the empty row, 9 failures, every one a file of this module's paths).

Size (session_017eKYzzg1hrdp8PcUr1pMS3): test runs 11, module lines 802

## J2 · REPORT

Found for other modules (details in my record, "Found in other modules"):
1. Red 26 moves rather than clears: my totality arm names control-plane's `checks.mjs` copy (its four tables) until T35-72 deletes it; control-plane's own totality test names `law-relations/checks.mjs` and, once my row is filled, my four tables, until T35-72 deletes its families and test.
2. control-plane (T35-72): `withPagePolicy` is now async (`return await withPagePolicy(res)`); R6's route-level fetch-twice arm is its (B2). Its catalogue-end test (red 19), `rows-before-r43.json`, families, page-policy and envelope's non-door cases are now mine; my copy of the snapshot is re-pinned for 48 T35 owner re-wordings (listed in its `changed.note`).
3. plane (T35-73): `door.mjs`:24–25 and `index.mjs`:5–6 re-point to `../answer-envelope/index.mjs`; every name they read is exported, except `PUBLISHED_STORE`, `caseReader`, `captureKey`, `storageAbsent`, which stay control-plane's.
4. setup-page: I hold `NONCE_SLOT` as K2038's literal `__CSP_NONCE__` (exported here as `NONCE_SLOT`); setup-page's export must spell the same.
