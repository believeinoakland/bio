# admission (T50)

**Status** · session_01QHhDyvdY7dW9CPvpQkC1u8 · depth 2 · WORKING · handled B1

## Completion (ADMISSION #13, T50-79)

**Entries applied** (module `admission`, `bio-plane/src/admission/index.mjs`):
- **R29** (N1179): in `admit`, inside the R25 block and before the password is asked, an op that is an administrator's own act (`GOVERNANCE_ACTIONS`, `CUSTODIAL_ACTIONS`, and every op of `OP_FAMILIES` of kind `admin` or `roster`, read by `administratorsOwnActs()`, no list held here) and that `REAUTH_ACTS` names, asked by a session whose rights read `administer !== true`, is refused 403 with `membership.notAnAdmin(member, op)` (R84's one answer); `reauthdue` is not asked. Today the set is `adminendorse`, `adminremove`, `memberset`, `memberadd` (role `admin`), `groupkeyset`.
- **R30** (N1186): `aiViewerOf(cred)` (exported) is `membership.projectViewer(principal, cred.project)` when the row carries a project, else the principal; `aiTaskScope`'s viewer (so `readerOf`) and `callerViewer` (stamp and `carry: false`) use it. `aiCredentialLook` already answers the project viewer as `principal`, so for a real look this changes nothing (R149 never re-scopes); a row whose principal came without its project is no longer read wider than its project.
- **R31** (N1146): `words.test.mjs`' key test now reads the design's 31-key list: every key is a word, every row code is `refusal.<CODE>`, the session key is there, the eight others are each named with their reason, and a code with no key fails by name.

**Tests changed to follow R29** (the old arrangements encoded a plain member passing to an administrator's act): `harness.mjs` gains `S.admin` (an enrolled administrator's session); `admission.test.mjs` R12 control and `doors.test.mjs` R19 use it (a non-administrator asking `groupkeyset` is now `NOT_AN_ADMIN`, still no store call); `t47.test.mjs` R25's open/shut sessions are administrators. New: `t50.test.mjs` (R29 with controls, R30 with controls, over membership's own fixture).

**Deferred:** none.

**For BOB (other documents, not code):**
- Requirement text: R19 says admission "adds no fence of its own" for the group-key ops; R29 now puts `NOT_AN_ADMIN` first for `groupkeyset` (the answer credentials R33 would give, asked earlier). R28 still quotes "22 keys at `fa3c8b7e8e`" (R31 supersedes it). Both are BOB's wording.
- Another module: `control-plane` `r53-routes.test.mjs` R53 fails on `tranche/T50` as it stands without my change (verified by stash); it is the control-plane's, not mine.
- Inherited red `words.test.mjs` R28 (plan rule 5 (11)) is now green; screens-entry R21 waits for T50-28.

**Ran:** `node --test bio-plane/test/m/admission/*.test.mjs`: 58 tests, 58 pass, 0 fail. Users: `signin-door` and `control-plane` tests, 307 tests, 306 pass, 1 fail (R53, above, red before my change). Checks: format 0 failures; architecture (admission) 0 failures; coverage (admission) 31 of 31 live ids named, 0 failures; ownership 0 failures (8 files); `checks/run.mjs`: format 0, architecture 0, channels 0, coverage 25 failures (other modules' unmet ids, none admission's).

Size (session_01QHhDyvdY7dW9CPvpQkC1u8): test runs 7, module lines 1578
