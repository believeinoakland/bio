# capture-sources (T7)

**Status** · session_01KeNRofea8FepQThMPbuAiL · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Six points on building R55–R63; I am building on these readings now, and only (1) blocks my ownership check.

1. **Paths.** The credentials need a file of their own, and my `paths` are the four files `render.mjs`, `browserrender.mjs`, `cdx.mjs` and `drive.mjs`, none of which the credentials belong in. My reading: add `bio-plane/src/capture-sources/` to `capture-sources`' `paths` in `build/modules.json`. The code would go in `bio-plane/src/capture-sources/credentials.mjs` (the store, over `record-core` and `membership`) and the tests in `bio-plane/test/m/capture-sources/credentials.test.mjs`. Until then `checks/ownership.mjs` will name that file.
2. **Catalogue rows.** The credentials' nine refusals need check ids and translations. `capture-sources` does not use `legacy-checks`, so it cannot import a row from `bio-checks.mjs`. My reading: the module holds its own family, `CAPTURE_CREDENTIAL_CHECKS`, as **C-105** (the highest in use is C-104). The rows are C-105.1 `NOT_A_MEMBER`, .2 `BAD_KIND`, .3 `BAD_HOST`, .4 `BAD_SCOPE`, .5 `NO_PROJECT`, .6 `NO_SECRET`, .7 `NOT_PERMITTED`, .8 `NO_KEY` and .9 `NO_SUCH`, each prefixed `CAPTURE_CREDENTIAL_`. The catalogue's version (gate.mjs, d470) is untouched, because nothing is added to `bio-checks.mjs`. If they belong in `legacy-checks`, that is a REPORT to that module.
3. **`principalPlane` (R56).** capture-requests' `principal_plane` is the control plane's `principal` stamp: `member:<id>` for a session, `<member principal>/<tokenId>` for an AI credential, and a machine class otherwise. My reading: a `member` credential is admitted when that stamp names its supplier, as `<id>`, `member:<id>` or `member:<id>/<token>`, so that a member's own AI credential's run uses the member's own credentials. A machine class or an organisation credential names no member and is never admitted to a `member` credential.
4. **The key.** The instance's key is a Worker secret, `CAPTURE_CREDENTIALS_KEY`, passed by the caller as `credentialsOf(ctx, {key})`. Any non-empty string works, and the AES-256-GCM key is derived from it by HKDF-SHA-256. There is a fresh 12-byte IV per row, and the associated data is the row's id, scope and project (Suggestions). Absent or empty, it is `NO_KEY` (R55, R56). No op is added in this job: the ops are the control plane's, and capture-requests is the first caller (layer 6).
5. **Async.** WebCrypto is async, so `credentialSupply`, `credentialsForFetch` and `credentialWithdraw` answer Promises that never reject. `credentialList` is synchronous.
6. **Viewer and `by` (R58, R63).** A viewer is membership's viewer string. `member:<id>` is that member, and the founder's `admin` is the administrator `admin`. Any other string, a machine class included, sees nothing. `by` is a member id. A revoked `member` credential (K159) is withdrawn with `withdrawn_by: "(revocation)"`, a string no member id can be, and `withdrawn_at` is the read that met it.

## J2 · COMPLETE

**Entries applied.** The layer-3 entry, the K103/K109 credentials (R55–R63), as folded (K157–K159) and with J1's six readings adopted (K174). The amended Purpose and R47 are met: the module's one store is the credentials table, declared to record-core's purge as `capture-sources`' own. New file `bio-plane/src/capture-sources/credentials.mjs`:
- `credentialsOf(ctx, {key})`: one instance per storage, over `recordOf` and `membershipOf`.
- `credentialSupply`, `credentialsForFetch` and `credentialWithdraw` answer Promises and never reject. `credentialList` is synchronous.
- Table `capture_credentials`, purge-declared as `{keys: ["project"], whole: "scope='project'"}`, so `member` and `group` rows are never cleared.
- Encryption: AES-256-GCM with an HKDF-SHA-256 key from `CAPTURE_CREDENTIALS_KEY`, a fresh IV per row, and the id, scope and project as associated data.
- `CAPTURE_CREDENTIAL_CHECKS`, C-105.1–C-105.9.
- Revocation (K159): each read sweeps the rows it meets. A `member` credential whose supplier is no longer active is withdrawn at that read, with `withdrawn_by: "(revocation)"`, and its ciphertext is destroyed.
- No refusal echoes a caller's value, so a secret given in the wrong field is never shown back. No op, per B2.

**Deferred.** None. N123, the immediate revocation notice, waits on membership as planned.

**Other modules.** None found flawed. For capture-requests (layer 6), when it wires R41–R42: it passes `key: env.CAPTURE_CREDENTIALS_KEY` on the first `credentialsOf` call. It passes the row's `principal_plane`, `target` and `host` to R56. The obligations in the requirements' Suggestions (the ops, the redirect rule, provenance marking) are the callers'. No generated artifact is made stale: nothing in a bundled member imports these files.

**Tests.** `node --test bio-plane/test/m/capture-sources/`: tests 69, pass 68, fail 0, todo 1. The todo is R37, not yet met and unscheduled (K48). The new suite `credentials.test.mjs` has 15 tests over the real record-core and membership (node:sqlite). It covers every R55 refusal in order, the scopes, hosts and ordering of R56, R57, and the viewers of R58. It covers a raw scan of every table for known secrets (R59), a sweep of every answer shape (R60), `readImage` and the bundle tables (R61), and a ciphertext moved to another scope failing to decrypt (R62). It covers R63's permission matrix, revocation at each of the three reads, and purge. There are no layer tests (manifest).

**Checks** (civicos-process `checks/`):
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture`: 10 product files, 17 relative imports; 0 failures.
- `coverage`: 63 of 63 live ids named by a test; 0 failures.
- `ownership` vs `tranche/T7`: 3 files changed; 0 failures.

Size (session_01KeNRofea8FepQThMPbuAiL): test runs 5, module lines 2153
