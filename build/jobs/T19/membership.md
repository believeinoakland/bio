# membership (T19)

**Status** · session_01HzHv55JX2Tnkf7jv6Tquna · depth 2 · COMPLETE · handled B12

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

## J5 · QUESTION

The split's deletion (B9) finds three callers of membership's credential code that K636 BOB-1's two named copies (`attestingKeys`, `aiCredentialLook`) do not cover, at tranche/T19 @ 773b7be152 merged:
- `queue-producers/index.mjs`:2259 `this.#membership.signerList()` (L11);
- `control-plane/dispatch.mjs`:237–238 `membershipOf(ctx).signerRegisterOwn(...)` and `.signerRevokeOwn(...)` (L11; the plan already has control-plane re-point these to credentials).
Deleting them breaks both modules until their L11 jobs.

**My best reading:** keep `signerList`, `signerRegisterOwn` and `signerRevokeOwn` as named copies too (K636 BOB-1's pattern, deleted by membership's T20 job once queue-producers and control-plane re-point in L11), with what they need: `#signerMemberBar`, `#keyShaped`, `SIGNER_ATTESTS`, the BAD_KEY answer, rows C-96.15–.17, and the catalogue's `SIGNER_ENROLMENT_CHECKS` import. So I would delete `AI_CREDENTIAL_CHECKS` from the catalogue now (no copy needs it) but **not** `SIGNER_ENROLMENT_CHECKS` (B6/K779), and keep `BAD_KEY` and C-96.15–.17 here, all held twice with credentials' until T20 (K529's lag). Everything else in B3/B9 is deleted: sessions and passwords, `signerAdd`, `signerSet`, the AI mint/revoke/list, their routes, tables and tests, the interim arms, the direct session and signer writes in `memberSet`/`adminRemove`, the exempt list.

The other reading: queue-producers and control-plane re-point in this layer instead (not my files). I am doing everything else now; the copies' part waits on your answer.

## J6 · COMPLETE

**COMPLETE**, `job/T19/membership` @ the commit "membership: the split's deletion" (pushed; tranche/T19 @ 773b7be152 merged in).

**Entries applied** (`build/plan/current.md` layer 2; B1–B10):
- **The seam** (merged early, K776): R92 `sessionRights`; R94 `registerClaimed`, with R64 `isAdministrator` and R86 `activeAdmins` reading it; R95 `registerPasswordSetter` (K774, K778), with `ENROL_NOT_RECORDED` (new row **C-96.18**); R79 `onRevoked` unchanged.
- **The split's deletion** (B3, B9; K637, K774, K778, K779): `bootstrapState`, `claim`, `setPassword`, `login`, `session`, `LOGIN_REFUSAL_DETAIL` and the timing equaliser; `signerAdd`, `signerSet`; `aiCredentialMint`, `aiCredentialRevoke`, `aiCredentials`; the routes `aicredential*`, `bootstrap`, `claim`, `login`, `setpassword`, `session`, `signeradd`, `signerlist`, `signerset`; the tables `credentials`, `sessions`, `bootstrap`, `signers`, `ai_credentials` and their additive columns; the moved Rs' tests (R1–R3, R25–R30, R62, R70, R72, R73, R89–R91: `t16-own-keys`, `t17-machine-register-key`, and those parts of `signin`, now `capabilities-arithmetic`, and `expertise-keys-ai`, now `expertise`; t16's one R43 test moved to `sight`). The interim claimed and password arms are gone. `memberSet` and `adminRemove` no longer write sessions or signers: they tell R79's listeners (R8, R20). `MEMBERSHIP_EXEMPT_TABLES` is `members`, `member_expertise`, `admin_votes`, `hosting_access`. The catalogue's `AI_CREDENTIAL_CHECKS` is deleted (117 lines).
- **Named copies kept** (K636 BOB-1): `attestingKeys`, `aiCredentialLook` (with `SIGNER_ATTESTS` and the AI projection helpers); and, on **J5's reading (still unanswered)**, `signerList`, `signerRegisterOwn`, `signerRevokeOwn` with `#signerMemberBar`, `#keyShaped`, the BAD_KEY answer, rows C-96.15–.17 and the catalogue's `SIGNER_ENROLMENT_CHECKS` (so that family is **not** deleted from the catalogue yet). If you rule the other way, a CHANGE re-opens me and I delete them.
- **Families** into `membership/checks.mjs` (byte-equal copies, names kept): `MEMBER_ID_CHECKS`, `CUSTODIAL_CHECKS`, `PROJECT_AUTHORITY_CHECKS`, `PROJECT_VISIBILITY_CHECKS`, `PROJECT_JOIN_REQUEST_CHECKS`, `CASE_AUTHORITY_CHECKS`; C-33.28, C-33.48 into `MEMBERSHIP_CHECKS`; exported from `index.mjs`. `CUSTODIAL_CHECKS` keeps BAD_KEY while the `signerRegisterOwn` copy mints it.
- **R43's project fence** (N426); **R83** `MODULE_ORDER` = `modules.json` (site-profiles, credentials, inquiry-grammar, action-grammar, plane; a layer-1 misorder fixed).
- **Legacy-store's share:** the boot reindex in `migrate()` (store.mjs: 7 lines removed); the reserved-id finding registered through record-core's R68 under `membership` (the store's own block stays until L10, K783).
- **N70's bounds:** already met (R82); unchanged.
- **Converts:** `converts.test.mjs`, the membership shares of `statusby`, `adminvote`, `founder-sight`, `members`, `project-authority`, `project-discoverable`, `ratify-authority`, `project-sight`.
- `isMachineIdentity`, `MACHINE_CLASS_PREFIX` from record-grammar (K780); a stale test reference in a comment corrected.

**Deferred:** none of mine.

**Found in other modules (their files; I cannot change them).** Whole `test/m`: 4,374 tests, 4,077 pass, **277 fail**, 20 todo. Three of those fail on `tranche/T19` without my branch (capture R37 ×2, control-plane R22), and five are query-language's `b.project` (J2, routed to L5). The other ~269 are **other modules' test fixtures that still use the credential code membership no longer holds**. None is a product failure, since the store wires `credentials` (`credentialsOf(ctx).migrate()` creates the tables and registers the claim, the setter and the listener):
- calling `membership.claim` (or `m.claim`, `w.membership.claim`): ai-runs 54, bias 35, capture-sources 17, instance-setup 4, provenance 2, monitoring 1;
- building membership without credentials, so `no such table: signers`/`credentials` (the `attestingKeys` copy, `signerList` and the door read `signers`): ratification 80, queue-producers 32, queue 17, publication 16 (+3 downstream: two door 502s, one `aiCredentialMint`), capture 3, tasks 2, intent 1, affordances 1, case-authoring 1 (R34, downstream).

Each needs its fixture to construct `credentialsOf(ctx)` (or a stand-in registering R94, R95 and R79, as `test/m/membership/fixture.mjs` now does) and to claim through credentials. Modules in layers before credentials' users may need `uses: credentials` for that, or a stand-in. **Merge timing is yours:** merging my deletion turns these red until each module's fixture is re-pointed. The plane bundle (`bio-plane/dist`) is stale by my change; it is regenerated at the layer close.

**Tests and checks:**
- `node --test test/m/membership/`: tests 136, pass 136, fail 0.
- `node --test test/m/`: tests 4374, pass 4077, fail 277 (above), todo 20.
- `checks/format.mjs`: 87 modules, 82 requirements files; 0 failures.
- `checks/architecture.mjs … membership`: 21 product files, 54 relative imports; 0 failures.
- `checks/coverage.mjs … membership`: 78 of 78 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … membership tranche/T19`: 25 files; legacy-store 0 added, 7 removed; legacy-checks 0 added, 117 removed; 0 failures.

Size (session_01HzHv55JX2Tnkf7jv6Tquna): test runs 30, module lines 3637

## J7 · COMPLETE

**COMPLETE again** after B11 (K784) and B12 (K785), `job/T19/membership` @ "membership: C-63 held with its named copies; the catalogue's SIGNER_ENROLMENT_CHECKS deleted". J6 stands, with these changes:
- `SIGNER_ENROLMENT_CHECKS` (C-63) copied into `membership/checks.mjs` (names, ids, `where`s, translations unchanged), with BAD_KEY and C-96.15–.17 already there. It is read by the `signerList`, `signerRegisterOwn` and `signerRevokeOwn` named copies (until T20, N445). The catalogue's family is deleted (38 lines; legacy-checks now 155 removed, 0 added).
- **No membership file imports the catalogue** (K785): `index.mjs` reads record-grammar and its own `checks.mjs`; every test under `test/m/membership/` reads record-grammar or membership's own checks (`grep bio-checks` over `src/membership` and `test/m/membership` finds nothing).

**Tests and checks:**
- `test/m/membership`: tests 136, pass 136, fail 0.
- Whole `test/m`: tests 4374, pass 4077, fail 277, todo 20. These are the same failures J6 lists by module: 3 already on tranche/T19, 5 query-language, ~269 in other modules' fixtures. None is new.
- format: 0 failures.
- architecture: 21 product files, 53 imports; 0 failures.
- coverage: 78 of 78 live requirement ids named by a test; 0 failures.
- ownership: 25 files; legacy-store 0 added, 7 removed; legacy-checks 0 added, 155 removed; 0 failures.

Size (session_01HzHv55JX2Tnkf7jv6Tquna): test runs 32, module lines 3676
