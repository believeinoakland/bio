# capture (T51)

**Status** · session_0165wJwi73CSfM1M67RfnGVr · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

**COMPLETE**, T51-21 · capture (commit `2d3b2dc73a` on `job/T51/capture`).

**Entries applied**
1. **R77 (N1235)**: every held row, an archive's included, also answers `actor` (the capture's first actor by instant, an upload's stamp as stored), `retrieved` (the whole-second UTC instant of the capture's first receipt) and `bytes` (the register's size of the capture, the archive's for an archive row); each null when the record cannot say. They are read for rows the viewer's sight already admits, so an unseen document gives none.
2. **R88 (N1235)**: `state: held_and_vouched` lists the held documents and the Information documents at `verified`, by the same sight, filters, sorts and bound; each row carries `standing`, a vouched one `vouched: {by, at}` from the latest `verified` entry of its `bundle.md` `state_history` (null per missing field); a vouched row (and a vouched file beside an archive) is not asked of R78's examination (`eligible: null` with a basis), so R91's wait is not spent on it; no vouched row carries `set_aside`; `held` and `set_aside` answer as before; the refusal names the three values.
3. **R96 (A64)**: `heldAt` and its arm `heldat` in `captureOps` (`address`, `sha256`, `check=1|true`, `viewer`, and the member stamp `by`). The answer is as R96 states it. Without `check` it reads the record alone and never fetches; with `check` (a member session only, else `MEMBER_SESSION_REQUIRED` 403) one `governedFetch` for the copy's address, conditional on `validatorsOf`, decides `unchanged` (304, or bytes hashing to the copy's digest) or `changed` with `served_sha256`; nothing is filed and the one write is R8's outcome. A copy that is no plain fetch (a rendered capture by `capture.method`/`pair.primary` in its register document, a non-`direct` route, an export address, an unreadable register document) and a digest with no public address read `undetermined` with their own basis.
4. **Stale comment** `d57selflink.test.mjs`:9 restated (no `civicos-ui`).

**Decisions of mine, for BOB to record** (details under P17; none needs Bob)
- **Basis sentences are inline.** `words.json` and `words-reads.json` are the design stream's, and `t50-words.test.mjs` pins `WORD_KEYS` to that `reads` list, so the new sentences (R88's vouched `eligibility_basis`, R96's `changed.basis`) are held in `index.mjs` as builder diagnostics, beside the stable `state`/`standing` fields screens-intake draws its own keyed words from (`screen.capture.a64.*`). If BOB wants them keyed, the design stream adds the keys and a later capture job swaps the strings.
- **Member stamp** for `heldat`'s `check`: the route reads the control plane's `by`, and the fence is R86's (`isMachineIdentity`, blank, `member:` alone). L11's op declaration and control-plane route must pass `by` (and `viewer`) for `op=heldat`.
- `versions` and `earlier_differs` count every visible capture at the address by digest (R96 literal), an archive sighting of different bytes included.
- The compared copy is the newest visible capture at the address by last retrieval, compared as instants; a capture filed in no bundle is not held (R96's register-home rule, unlike `gradeNoteOf`'s).

**Deferred**: none.

**Found in other modules**: nothing new. `op-declarations` has no `heldat` entry (L11's, K3829), so the plane refuses the route until T51's op-declarations job adds it. Four tests outside capture fail identically at `tranche/T51` without my commit (capture-requests/plane R48; screens-inquiry document x3), the plan's inherited reds.

**Tests and checks**
- `node --test bio-plane/test/m/capture/ bio-plane/test/cap13-reuse-pages.test.mjs bio-plane/test/d57selflink.test.mjs`: 199 tests, 199 pass, 0 fail, 0 skipped (20 new in `t51.test.mjs`, naming R77, R88 and R96; `held.test.mjs` and `t47.test.mjs` updated for the new row fields and the third `state`).
- Other modules' tests that read `heldcaptures` (capture-requests, ratification, screens-inquiry, instance-setup): 50 of 54 pass; the 4 failures are identical on the commit before mine.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs` (all and capture): 0 failures. `checks/coverage.mjs capture`: 49 of 49 live ids named, 0 failures. `checks/ownership.mjs /home/user/bio capture tranche/T51 job/T51/capture`: 7 files changed by capture, 0 failures. `checks/run.mjs`: capture clean; the 9 coverage failures are other modules'.

Size (session_0165wJwi73CSfM1M67RfnGVr): test runs 9, module lines 3756
