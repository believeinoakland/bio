# credentials (T34)

**Status** · session_01D95uD2Xpjm9FPP1885hMkL · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

R34 asks the group key's table to be declared `export: "never"`, `sight: "admin"`. record-core's R21 (and its code, `index.mjs` ~1340) admits only `group`, `bundle`, `source` and `owner` for `sight`, so `declareTable` would refuse `TABLE_CLASS_UNKNOWN` and this module's start would throw.

**My best reading, which I am building now:** declare the group key's tables `export: "never"`, `sight: "group"` (as `keyed_services` is today). The key is never answered by any read, export or log whatever its sight; `groupKeyState` itself gives the full state to administrators only and `{on}` to other members (R34), so the administrator-only sight is enforced by the service, not by the class. If you want `sight: "admin"` as a class, it is a record-core R21 change (its job), and I would switch the declaration once it lands.

Two smaller readings, built the same way unless you say otherwise:
1. R36 `groupKeyNotice({member})` answers `due: true` exactly while the member has not recorded `groupKeyNoticeSeen`, whatever the group key's state; R35 refuses `GROUP_KEY_NOTICE_DUE` only on the group-key branch (a member's own reference is never held back by it). R32's standing mint does not refuse on the notice (R32's list of refusals does not name it); the model call goes through `accountFor`, which does.
2. R34: an active member who is not an administrator gets `{ok, on}` only; the group key's two switches (R37) are answered to administrators alone. A viewer who is not an active member is refused `NOT_AN_ADMIN` (through `membership.notAnAdmin`), writing nothing.

## J2 · REPORT

Found in other modules (each against its own requirements); none changed by me.

1. **answers** (for its T34-36 START): `test/m/answers/scope.test.mjs` "R1 the copy test" is now red, as you said it would be. `AI_GRANT_OPS` has 27 entries, holds `rule`, and uses the routed names `calculation`, `career`, `dutiesof`, `dutyoccurrences`, `linesof`, `structureat` and `money`. `ASK_SCOPE` still holds `calculations`, `careerof`, `duties`, `occurrences`, `lines` and `moneyfacts`. answers' list (and the test's `∪ {rule}` arm) moves in its own job.
2. **agent-worker** (L6): `test/ask.test.mjs` R55 pins `[["rule"], []]` as the difference between `ASK_OPS` and `AI_GRANT_OPS`. With `rule` now held, and the six renamed ops, it is red until `ASK_OPS` follows answers' list and the test returns to equality. `agent-worker/src/ops.mjs:56`'s comment says the same old relation.
3. **op-declarations** (L11): `test/m/op-declarations/t33.test.mjs` R19/R6 ("every op the owner serves to a caller has a spec") is red: credentials' map now serves `groupkeyset`, `groupkeyremove`, `groupkeyswitch`, `groupkeystate`, `groupkeynotice` and `groupkeynoticeseen`, whose specs are its R24 (T34). **Also `groupswitchset` (R37, the group key's own `suggestions`/`standing` switches, an administrator's act, `by` stamped, body `switch` and `on`) is served by credentials' map, but op-declarations R24 and control-plane R56 do not name it.** Without a spec and a route, an administrator cannot reach R37. The requirement gap is yours (op-declarations R24, control-plane R56, admission R19); a spec shaped like `groupkeyswitch`'s fits.
4. **control-plane** (L11), for its R31 entry (N616, K1685): `index.mjs:697–699` still asks `aigrantadmit` with `AI_GRANT_OPS[0]` to learn that a grant is live. That first entry is now `calculation`, not `calculations`. It still works, but `aiGrantHeld({token})` (R31) is the call to use. It is in-plane and not in credentials' ops map, so the store's `aigrantheld` arm in `dispatch.mjs` (beside `aigrantadmit`, line 289) is control-plane's to add.
5. **Callers of `accountReferenceFor`** (ai-runs `index.mjs:1698`, plane `ask.mjs:48`): unchanged and still working. A member served only by the group key gets `NO_ACCOUNT` there until each moves to `accountFor` (R35) in its own job. The answer shape changes from `{kind, secret}` to `{kind, level, key}`.
6. **Generated artifact:** `bio-plane/dist/bio-plane.bundled.mjs` is stale. It still carries `ACCOUNT_LEVEL_MEMBER_ONLY` and the old `AI_GRANT_OPS`. It is regenerated at layer close (manifest §14).

Users' suites, run against this branch and against `tranche/T34` (same inherited reds on both): provenance 88/1 (mk6, inherited), attestation 19/0, provenance-routes 37/0, capture-sources 82/0, acquisition 82/2 (inherited, K1737), capture 120/0, bias 57/0, ai-runs 69/0, answers 30/1 (item 1; tranche 31/0), intent 73/0, publication 97/0, control-plane 167/1 (inherited R43), op-declarations 68/1 (item 3; tranche 69/0), plane 111/0, admission 19/0; agent-worker 7/2 (R55, item 2; REC100 ×5 inherited).

## J3 · COMPLETE

**Entries applied (T34-11; B2–B4 and K1755–K1757, K1760):**
- (N580) R28: `AI_GRANT_OPS` names each op as the plane routes it. It holds `rule` and the routed names `calculation`, `career`, `dutiesof`, `dutyoccurrences`, `linesof`, `structureat` and `money`; the old six names are gone. 27 entries, frozen, sorted.
- (N616) R31 `aiGrantHeld({token})`: `{ok, member, viewer, expires}` exactly when R28 would admit a listed read, else `GRANT_NOT_HELD`. It writes nothing and never throws.
- R32 `aiGrantMintStanding({member, question})`: refused in order `ACCOUNT_MEMBER_NOT_ACTIVE`, `NO_ACCOUNT` (R35), `STANDING_SWITCH_OFF` (the switch of whichever account serves the member, R25 or R37), `NO_QUESTION`. The grant is shaped as R27's, held in `ai_grants` with `kind: 'standing'` and no session. It ends at its time, at R16, and when the member removes their reference (R22). It is not routed.
- R27: `NO_ACCOUNT` only when no account serves the member (R35); `GROUP_KEY_NOTICE_DUE` when the group key would serve them and its notice is unread. Every `by` but the member's own act is still refused.
- R26 retired (B3, K1756): `ACCOUNT_LEVEL_MEMBER_ONLY` and the `level` parameter are removed, as are the R26 test and its rows entry. A set naming 'organisation', a project or a machine class is now refused `NOT_YOUR_ACCOUNT`, as R22 refuses any principal but the acting member.
- R33–R37 (K1755, K1757): `groupKeySet` / `groupKeyRemove` / `groupKeySwitch` (administrators only, through `membership.notAnAdmin`; off when first set; each act recorded in `group_key_acts` with its administrator and instant, never the key). The key is sealed under the copy (salt `group-key:anthropic`, AAD-bound). `groupKeyState` gives administrators the full state with R37's switches, other active members `{on}`, and anyone else `NOT_AN_ADMIN`. `accountFor({member, act})` answers `{ok, kind, level, key}`: the member's own reference first, else the group key while held and on, for an active member who has read the notice. `groupKeyNotice` / `groupKeyNoticeSeen` (R36), and `groupSwitchSet` (R37; removing the key turns both switches off).
- R22, R25 amended: the switches govern only acts the member's own reference serves. `accountReferenceFor` is kept working for its callers.
- R30, R34: new tables `group_key`, `group_key_acts` (export never, sight group, K1760) and `group_key_notices` (export never, sight owner). `ai_grants` gains an additive `kind` column. All are purge-exempt (R18).
- Ops map: `groupkeyset`, `groupkeyremove`, `groupkeyswitch`, `groupkeystate`, `groupkeynotice` (viewer), `groupkeynoticeseen` (member = by) and `groupswitchset`. The key is taken from the body only.

**Check rows for promotion's stamp (T34-12):**
- New: C-29.25 `STANDING_SWITCH_OFF`, C-29.26 `NO_QUESTION`, C-29.27 `GROUP_KEY_NOTICE_DUE`.
- Retired, its id never reused: C-29.16 `ACCOUNT_LEVEL_MEMBER_ONLY`.
- Changed: C-29.20 `NO_ACCOUNT` (translation now names the group's key); C-29.19 `NO_SECRET` (`where` → `#noSecret > is-secret-given`); C-29.21 `UNKNOWN_SWITCH` (`where` → `#switchName > is-account-switch`, and "your assistant's" → "the assistant's"); C-29.24 `GRANT_NOT_HELD` (`where` → `#grantNotHeld > is-grant-held`).

**Deferred:** none.

**Found in other modules:** J2 (REPORT). In short: the answers copy test and agent-worker R55 are red until their L6 jobs. op-declarations' t33 R19/R6 is red until its R24 specs exist, and R37's `groupswitchset` has no spec or route in op-declarations R24 or control-plane R56 (a requirement gap). control-plane should call `aiGrantHeld` (N616). The bundled plane is stale until layer close.

**Tests and checks:**
- `node --test bio-plane/test/m/credentials/`: tests 66, pass 66, fail 0.
- Users' suites, against this branch and `tranche/T34` (J2): the only new reds are answers R1 copy test, op-declarations t33 R19/R6 and agent-worker R55, all reported. Every other red is inherited.
- No layer tests are named in the manifest.
- `format`: 126 modules, 125 requirements files; 0 failures.
- `architecture credentials`: 16 product files, 41 relative imports; 0 failures.
- `coverage credentials`: 36 of 36 live requirement ids named by a test; 0 failures.
- `ownership credentials tranche/T34`: 9 files changed; 0 failures.

Size (session_01D95uD2Xpjm9FPP1885hMkL): test runs 14, module lines 1733
