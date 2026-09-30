# membership (T16)

**Status** · session_01Nism1JK1EosdBHAiFXkWHn · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings of R89/R90 I am building on now; tell me if any is wrong.

1. **"every administrator (R86) is notified".** Membership has no notice store and no module before layer 11 delivers notices. My reading: R89's answer carries `notified`, the R86 list at that instant, and the registration stays on the signer row (`origin: "self"`, `registered_by`, `added`), which is what the notice is read from; delivering an item to each administrator (an inbox or queue item) is layer 11's (tasks, queue-producers or control-plane), which I name in my record as a report. I add no listener slot, since R89 names none. I notify on every accepted call, `existed: true` included.
2. **A key `by` already holds.** R89 answers `existed: true`, and the key is left `active` with `origin: "self"` and `registered_by: by`, even when it was revoked or registered by an administrator. Re-activating a revoked key gives the member nothing beyond what registering a new key would, and every administrator is notified and can revoke it again (R26).
3. **Refusals outside R89's list.** A `by` that is absent (unstamped) is `MACHINE_CANNOT_REGISTER_KEY`, because nobody is behind it. The founder (`admin`, no member row) answers R25's `NO_SUCH_MEMBER` through the same member bar: a key on no member row would never attest (R27). R90 answers `NO_SUCH_KEY` for every key `by` does not hold, including when `by` is a machine or absent. `MACHINE_CANNOT_REGISTER_KEY` gets no row (only C-96.15 is required); R89's `BAD_KEY` relays R25's own region, so C-96.8 keeps its one site. The ops (`op=signerregister`, `op=signerrevoke`) are not added to `membershipOps`; their routes and stamps are control-plane's.

## J2 · COMPLETE

**Entries applied** (branch `job/T16/membership` @ the commit carrying this entry; `tranche/T16` merged in after B2):
- **N357 (W1): R43, R88.** `viewerPredicate` treats `member:admin` as the founder's viewer: it sees every bundle, exactly as bare `admin` does, and names the member `admin` (bare `admin` names none). `hiddenBundles` answers null for both. `#requester` (R49–R53) now accepts either spelling for the founder, so the two spellings cannot answer differently there. The directory (R48) lists nothing for `member:admin`, since the founder is at FULL everywhere; bare `admin` still gets `PROJECT_DIRECTORY_NEEDS_A_MEMBER`, as R48 words it.
- **N364: R27, R89, R90, R91, rows C-96.15 and C-96.16 (K535).** `signers` gains `origin` and `registered_by`, added at boot and never back-filled. An older row reads `origin: "admin"` (R25 was the only way to register a key then) and `registered_by: "not recorded"`. R25 records `origin 'admin'` and its stamped actor, a rebinding included. `signerRegisterOwn` (R89) checks, in order: `MACHINE_CANNOT_REGISTER_KEY` (a machine, the operator's bearer or an unstamped call), then `BAD_KEY` (relayed from R25's own region, so C-96.8 keeps one site), then R25's member bar (the founder gets `NO_SUCH_MEMBER`), then `SIGNER_KEY_HELD_BY_ANOTHER` (C-96.15, naming no one), then `SIGNER_KEY_REVOKED` (C-96.16; the key stays revoked). An active held key answers `existed: true` and nothing is rewritten. A new key is stored `active`, `origin: "self"`, `registered_by: by`. Every accepted call answers `notified` with R86's `activeAdmins()` at that instant. `signerRevokeOwn` (R90) is never refused for a key the member holds (`already: true` the second time). Every other key gets signerSet's own `{ok: false, reason: "NO_SUCH_KEY"}`. `SIGNER_ATTESTS` is unchanged, so R91 holds: it never reads `origin`.
- **R83.** `MODULE_ORDER` gains `sources`, `tasks`, `queue-producers` in `modules.json`'s order; `module-order.test` is green.

**`not yet met` marks my work meets** (for BOB to strike): R27 (N364), R43 (N357), R89, R90, R91 (N364), and the file Status line's "W1 (N357) … N364 … not yet met".

**Check rows for promotion's stamp (N318):** added C-96.15 `SIGNER_KEY_HELD_BY_ANOTHER` (`signerRegisterOwn > is-signer-key-held`) and C-96.16 `SIGNER_KEY_REVOKED` (`signerRegisterOwn > is-signer-key-revoked`), both in `MEMBERSHIP_CHECKS`. No row moved or retired. `MACHINE_CANNOT_REGISTER_KEY` and R90's `NO_SUCH_KEY` have no row, as K535 read 3 stands.

**Ops, for control-plane (layer 11):** `op=signerregister` becomes `signerRegisterOwn({keyB64, comment, by})`, and `op=signerrevoke` becomes `signerRevokeOwn({keyB64, by})`. `by` is stamped from the member's own session, never from the body (spread, then override, as `signeradd`). Neither is added to `membershipOps`.

**Reported, not mine to change:**
1. **N375 (queue-producers, T17):** delivering the R89 notice to each administrator. It reads the key's row (`origin: "self"`, `registered_by`, `added`) and the answer's `notified`.
2. **control-plane:** the comment at `src/control-plane/index.mjs`:605–615 ("`member:admin` cannot carry it: the predicate's administrator arm reads a `members` row the founder never has") is stale since N357. Both spellings now carry the founder's sight. The founder's viewer stamp (bare `admin`, :627) is unaffected.
3. **Callers that build `member:<id>` from a member id** get the founder's full sight when the id is `admin`, as R43 now says: review `index.mjs`:561 (a draft's editor), bias :705, publication :1172 (owners), ratification :552 (the attestor), queue :2440 (identity). capture-sources `credentials.mjs`:114's special case (`admin` becomes bare `admin`) is now redundant but still correct. Residual: a store holding a member enrolled with id `admin` before REC-132 reserved it would now see every bundle through `member:admin`. `memberAdd` refuses that id today (`MEMBER_ID_RESERVED`).
4. **Generated artifact (§14):** `bio-plane/dist/bio-plane.bundled.mjs` bundles `src/membership/*.mjs`, so it is stale. I did not rebuild it.
5. **civicos-ui and affordances greps:** there are no hits for `signerRegisterOwn`, `signerRevokeOwn`, `signerregister`, `signerrevoke`, `SIGNER_KEY_HELD_BY_ANOTHER`, `SIGNER_KEY_REVOKED`, `MACHINE_CANNOT_REGISTER_KEY`, `registered_by`, `member:admin` or `MODULE_ORDER`. Related hits:
   - `civicos-ui/app.html`:2263 reads `signerlist`, whose rows gain `origin` and `registered_by` (additive).
   - `app.html`:14736–14865 is the custodial `signeradd`/`signerset` surface. It has no self-registration surface; that is the interface's to build (the redesign).
   - affordances lists no signer op yet; its R3 names the two new ops.
6. **ratification:** `test/m/ratification/checks.test.mjs`:133 is red, on `tranche/T16` without my change as well: it is the parity test K529 retires.

**Deferred:** nothing.

**Tests and checks run:**
- `node --test bio-plane/test/m/membership/`: 123 pass, 0 fail. The new file is `t16-own-keys.test.mjs`; `sight`, `hidden-bundles` and `requests-fence-facts` were updated where they pinned the pre-N357 answers.
- Negative controls, each restored after: reverting N357 gives 4 fails; re-registering a revoked key, 1; `attests` reading `origin`, 4; rebinding allowed, 3; an older row's origin null, 2; `MODULE_ORDER` without `sources`, 2.
- Users of membership: `node --test bio-plane/test/m/` gives 2998 tests, 2976 pass, 1 fail (item 6, pre-existing), 21 todo.
- `format`: 0 failures. `architecture membership`: 0 failures. `coverage membership`: 91 of 91, 0 failures. `ownership membership tranche/T16`: 8 files, 0 failures.

Size (session_01Nism1JK1EosdBHAiFXkWHn): test runs 15, module lines 3870
