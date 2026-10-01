# membership (T19)

**Status** · session_01HzHv55JX2Tnkf7jv6Tquna · depth 2 · WORKING · handled B8

## J1 · QUESTION

The seam is built: `R94` asks for "with none registered … the instance reads as not claimed". Between my seam merging and CREDENTIALS #1 merging, nothing registers, so read literally the founder would stop being an administrator on the tranche branch (every founder-driven test in every module would go red). My reading: until the split's deletion, `#claimed()` answers from membership's own `credentials` table when nothing is registered (the code it is copied from, unchanged behaviour); a registration, once made, decides alone. The split's deletion removes that interim arm, so R94 holds literally at my COMPLETE. The R94 test for "none registered" is written to hold both before and after; at the deletion I add the arm "credential held, nothing registered → not claimed". Carrying on on this reading.

## J2 · REPORT

**The seam is ready to merge early** (rule 4): `job/T19/membership` @ 131f3c2318. What CREDENTIALS #1 builds on:
- `sessionRights(role)` (R92), public, total, writes nothing; `session()` reads it.
- `registerClaimed(module, fn)` (R94): one slot, refusals through `listenerRefusal` (R81); `isAdministrator` (R64) and `activeAdmins` (R86) read the founder through it (interim arm: see my QUESTION J2).
- `onRevoked` (R79), `memberFacts` (R68), `notAnAdmin` (R84), `listenerRefusal` (R81) unchanged. Until the split's deletion, R8/R20 still delete sessions and revoke signers themselves as well as telling the listeners, so credentials' R16 listener is idempotent beside them.
- R43's project fence (N426): `viewerPredicate`'s member arm judges a non-project bundle by its `bundles.project` (record-core R34/R37): seen exactly when its project is; empty/NULL project = no project; a project nobody holds = administrators only (fail closed).
- `MODULE_ORDER` (R83) = modules.json: gains site-profiles, credentials, inquiry-grammar and action-grammar (the last two are already in modules.json), and a pre-existing misorder fixed (runtime-limits, signatures before bundler).

Tests: `test/m/membership` 139 pass, 0 fail. Checks: format, architecture, coverage (77/77), ownership all 0 failures.

**Found in another module (query-language, L5):** with the fence, `test/m/query-language/fixture.mjs` builds a `bundles` table without `project`, so five of its tests fail `no such column: b.project` (converts.test.mjs:262, fields.test.mjs:45, projection.test.mjs:48, statements.test.mjs:103, statements.test.mjs:207). Whole `test/m`: 4,307 pass, 5 fail (those five), 20 todo. The fix is one column in that fixture (record-core R37 names `bundles.project` part of the contract); it is query-language's to write. Every other module's tests pass. No generated artifact touched by me needs regeneration beyond the plane bundle at the layer close.

Next, while credentials builds: the families into `membership/checks.mjs`, the boot reindex, the converts; then the reserved-id finding once record-core's R68 merges, and the split's deletion when you tell me credentials has merged.

## J3 · QUESTION

R95 (K774). Built on my best reading, pushed @ HEAD of `job/T19/membership`; tell me if any part is wrong.
1. **Signature.** `registerPasswordSetter(fn, module = "credentials")`: R95 names `(fn)`; the optional second argument only names the holder in R81's `LISTENER_DECLARED` (a non-function is `LISTENER_MALFORMED`; a second registration is refused). CREDENTIALS can call `registerPasswordSetter((a) => this.setPassword(a))`. The setter is called `fn({role, password})` (`role` = `member:<id>`), and answers like `setPassword` (`{ok: true, role}`); a throw or `{ok: false}` counts as not written.
2. **"Refuses as it would on a failed write."** No service throws, so the refusal needs a code. I minted `ENROL_NOT_RECORDED`, row **C-96.18** in `MEMBERSHIP_CHECKS` (next free C-96; translation: the enrolment could not be completed, nothing changed, the invitation link still works). It answers when no setter is registered (after the deletion) and when the setter throws or answers `ok: false`. The setter runs before any membership write, so the invitation stays live and the member stays `invited`. A new row: promotion's stamp should carry C-96.18 (and C-96.15–.17 leaving for credentials).
3. **Interim**, as J1's: until the split's deletion, with no setter registered `enroll` uses membership's own `setPassword` copy.

Also: in J2 "see my QUESTION J2" should read J1. And CHANGE B3's (1): `BAD_KEY` (C-96.8) stays in my `CUSTODIAL_CHECKS` copy until the deletion removes `signerAdd`, its one minter here; it goes then.

## J4 · REPORT

Progress, `job/T19/membership` @ HEAD (membership tests 158 pass, 0 fail). Done besides the seam:
- **Families** copied into `membership/checks.mjs`, names, ids, `where`s and translations unchanged (byte-compared against the catalogue): `MEMBER_ID_CHECKS`, `CUSTODIAL_CHECKS` (BAD_KEY leaves with the deletion), `PROJECT_AUTHORITY_CHECKS`, `PROJECT_VISIBILITY_CHECKS`, `PROJECT_JOIN_REQUEST_CHECKS`, `CASE_AUTHORITY_CHECKS`; C-33.28 `LAST_OWNER` and C-33.48 `LAST_COMMITTED_OWNER` into `MEMBERSHIP_CHECKS`. `index.mjs` and my tests read these; they are exported from `membership/index.mjs` too, for promotion's, case-authoring's and review's re-points. The catalogue's copies stay for their other importers (rule 1).
- **R95** as K778 words it; **C-96.18** new (stamp).
- **The boot reindex** is in `membership.migrate()` (skipped when no `bundles` table exists); `store.mjs`' boot call and its comment removed (a pure removal, 7 lines). Its delegate `#reindexProjectSight` stays (promotion's projection calls it).
- **The reserved-id finding** registers from `migrate()` through record-core's `registerAuditFinding("membership", "membership", finding)` (its R68) when the host's record-core offers it; until RECORD-CORE's R68 merges it registers nothing and the store's own `membership` block still answers. When record-core's audit (R73) replaces `store.mjs`' `auditPass`, that block (store.mjs ~650–670, with its `MEMBER_ID_CHECKS` import) goes with it: it is in the store's function record-core is taking, so I have not touched it.
- **Converts**: `test/m/membership/converts.test.mjs`, the membership shares of `statusby`, `adminvote`, `founder-sight`, `members`, `project-authority`, `project-discoverable`, `ratify-authority`, `project-sight` (12 tests; the key cascade, sign-in sentence and the other modules' shares are not mine).

**Found:** `modules.json` gives membership `uses` without `record-grammar`, while `membership.md`'s Uses names it (`isMachineIdentity`, `MACHINE_CLASS_PREFIX`); the architecture check refuses the import, so I still read them through the catalogue's re-export. Add `record-grammar` to membership's `uses` if you want the re-point in this job; it is a two-line change for me.

Waiting for your word that credentials has merged, to make the split's deletion.
