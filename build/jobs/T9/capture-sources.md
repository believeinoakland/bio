# capture-sources (T9)

**Status** · session_019czpcPFyCtgasvVAZPH4Xs · depth 2 · WORKING · handled B3

## J1 · QUESTION

N189 and N123, my reading, building on it meanwhile.

(1) N189 (3), K275. `CAPTURE_CREDENTIAL_NO_KEY`'s second condition is a failure to encrypt or write after every check passed (`credentialSupply`'s catch); `CAPTURE_CREDENTIAL_NO_SUCH`'s is a failure to read or write during a withdrawal (`credentialWithdraw`'s catch). (An unknown id and one `by` may not see stay one condition, answered alike, as R57 says and as K275 treats `NO_SUCH_PROJECT`.) Proposed codes and rows:
- `CAPTURE_CREDENTIAL_SUPPLY_FAILED`, C-105.10, "The credential could not be encrypted and stored, so nothing was written. Nothing you entered is repeated here; try again, and if it keeps failing tell an administrator."
- `CAPTURE_CREDENTIAL_WITHDRAW_FAILED`, C-105.11, "The credential could not be read or withdrawn just now, so nothing was changed. Try again, and if it keeps failing tell an administrator."
R55 gains, after `NO_KEY`: "`CAPTURE_CREDENTIAL_SUPPLY_FAILED` when encrypting or writing fails after every check passed; its detail never repeats the error's own words." R57 gains: "`CAPTURE_CREDENTIAL_WITHDRAW_FAILED` when the credential cannot be read or the withdrawal written; nothing is changed."
N189 (1), (2): every C-105 row gains a `where` naming its one function and a DEC-49 region; `NOT_PERMITTED` (supply and withdraw) is decided in one helper, `#r63Refusal`, so it is minted at one site (K231); `NO_SUCH`'s translation becomes "No credential by that id is visible to you here. One that does not exist and one you may not see are answered alike, so this is not a hint either way."

(2) N189 (4), bounds.
- `credentialsForFetch`: no interface change. The admitted scopes, narrowest-then-newest order, and host go into the SQL (`LIMIT 1`); a revoked requester's own `member` rows are withdrawn by one bounded UPDATE before it.
- `credentialList`: R58 becomes `credentialList({viewer, scope, project, limit}) → {entries, limit, truncated}`: `limit` 200 (`CREDENTIAL_LIST_LIMIT`), the caller's to lower and never raise, one row read past it, `truncated` measured (membership R82's shape), the first `limit` entries in supply order. Visibility is in the SQL so the cut is over what the viewer sees: own `member` rows, `group` rows, and `project` rows through membership's R43 `viewerPredicate` joined on record-core's `bundles` (R37's `bundle_id`, `object_type`); an administrator every row. Private Uses gains membership's `viewerPredicate` (R43). No product caller reads it today (the `capturecredentials` op is a Suggestion), so the shape change breaks nothing.

(3) N123. The constructor registers `onRevoked("capture-sources", …)` (membership R79); the listener withdraws the member's unwithdrawn `member` rows inside the revoking act (`withdrawn_by` = `REVOCATION`, ciphertext destroyed). `credentialsOf` is created at the store's start (through `captureRequestsOf`), so this is at start. The read-time sweep stays only as a backstop for rows revoked before the registration existed. R63's sentence becomes: "…its ciphertext is destroyed at once, by membership's revocation notice (R79, N123), registered at start; a `member` credential of a supplier revoked before the registration is withdrawn at the first read that meets it."

## J2 · COMPLETE

**Entries applied** (B1, K288 answering J1; merged `tranche/T9` after B2/B3):
- N123: `CaptureCredentials`' constructor registers `onRevoked("capture-sources", …)` (membership R79); `credentialsOf` is created at the store's start through `captureRequestsOf`. The listener withdraws the revoked member's unwithdrawn `member` rows inside the revoking act (`withdrawn_by` `(revocation)`, ciphertext and IV destroyed); `project` and `group` rows are kept. The read-time sweep stays as the backstop for a supplier revoked before the registration existed (R63 as folded).
- N189 (1): every C-105 row carries a `where` (`src/capture-sources/credentials.mjs <fn> > <region>`) with its DEC-49 region marked in the source; `NOT_PERMITTED` is decided in one helper, `#r63Refusal`, so it is minted at one site (K231).
- N189 (2): `NO_SUCH`'s translation as K288 took it; `NO_SECRET`'s lengthened too (40 characters, at the edge of the same floors).
- N189 (3): `CAPTURE_CREDENTIAL_SUPPLY_FAILED` C-105.10 (encrypt/write failure in supply) and `CAPTURE_CREDENTIAL_WITHDRAW_FAILED` C-105.11 (read/write failure in withdraw), each at its own site; `NO_KEY` and `NO_SUCH` now each name one condition.
- N189 (4): `credentialsForFetch` reads one row (`LIMIT 1`: host, the admitted scopes, narrowest then newest, all in SQL); a revoked requester's own `member` rows are withdrawn first by one UPDATE. `credentialList({viewer, scope, project, limit}) → {entries, limit, truncated}`: `CREDENTIAL_LIST_LIMIT` 200, lowered never raised, one row past, visibility in the SQL (own `member`, `group`, `project` through membership's `viewerPredicate` joined on `bundles`' R37 columns; an administrator everything), so the cut falls on what the viewer sees.

**Own-module improvement:** `cdxQuery` (R33) asked `limit=NaN` for a non-numeric limit and `limit=0` for 0; now any limit that is not a whole non-zero number asks the default 40 (tested).

**Deferred:** none.

**Found in other modules (legacy-tests' suites, reported, not edited):**
- `test/derivation-bounds.test.mjs` (already red at T8's close, 69/4): its census no longer lists `capture-sources/credentials:{credentialList, credentialsForFetch}`, as N189 meant. Its graded roster now also names `capture-sources/credentials:credentialList:found` ("CUT GRADED", "SOURCE GRADED"), which the suite's pinned list does not hold. The census figure and roster need legacy-tests to re-pin them.
- I found no other product caller of `credentialList`, so the shape change reaches no module; the `capturecredentials` op (a Suggestion) is not built.

**Tests and checks** (on `job/T9/capture-sources` after merging `tranche/T9`):
- `node --test test/m/capture-sources/`: tests 72, pass 71, fail 0, todo 1 (R37, Memento, K48: unscheduled).
- Users: `test/m/capture-requests/` + `test/m/membership/`: pass 144, fail 0, todo 1; `test/m/capture/`: pass 59, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture capture-sources`: 10 product files, 17 relative imports; 0 failures. `coverage capture-sources`: 63 of 63 live requirement ids named by a test; 0 failures. `ownership capture-sources tranche/T9`: 5 files changed; 0 failures.

Size (session_019czpcPFyCtgasvVAZPH4Xs): test runs 9, module lines 2245
