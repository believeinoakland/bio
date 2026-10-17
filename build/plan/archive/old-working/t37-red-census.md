# T37 red census: failing module tests on `tranche/T37`

Commissioned by K2184 (K2185). Run on `tranche/T37` @ `4023b1e6e2` (after MEMBERSHIP #28 and CREDENTIALS #8 merged; PROMOTION #35 not yet merged), Node v26.10.0, from `bio-plane/`: `node --test test/m/` (it recurses). Result: 8,769 tests, **8,693 pass, 63 fail**, 13 todo, 589 s. The working tree was clean before and after. The job's count of 68 came from an earlier tip or its own branch. This run counts 63.

Module tests outside `test/m` were also run for the modules T37 has touched so far: jurisdictions 114/0, file-scanner 50/0, `members.test` 1/0, row-census 1/0, bundler's four system tests 4/0, `migrate-released` 1/0, `newgroup/test` + `newgroup-bundle-fresh` 52/0. One outside test fails: promotion's `d526-refusal-order.test.mjs` (row 64 below).

## Summary (63 in `test/m`, plus 1 outside)

| cause | tests | in rule 6 | not named |
|---|---|---|---|
| (a) T36 L11's admission change: the test's own helper sends a credential in the URL (`CREDENTIAL_IN_ADDRESS`, C-38.10). Once that is fixed, the shared `MEMBER_TOKEN` uses also need to move (`MEMBER_TOKEN_RETIRED`, C-38.11) | 53 | 5 (red 15) | **48** |
| (b) PR #14's screen registry or design files on `main` (`mock-acts.js`, `library.json`, registry) | 6 | 5 (reds 7, 11) | **1** |
| (e) a T37 change (T37-4's `paras`; T37-6's re-code) | 3 | 3 (reds 12, 13, 14) | 0 |
| (d) carried accepted red, no new cause (progressions R41) | 1 | 1 (red 4) | 0 |
| (c) a stale generated bundle | 0 | — | 0 |
| **total `test/m`** | **63** | **14** | **49** |
| outside `test/m`: rule 4's N761 interim red (T37-6, then T37-33) | 1 | rule 6 item 8, not named at any START | **1** |

Each of the 49 unnamed `test/m` reds is cause (a), except one: affordances `t36.test.mjs`:36, which is cause (b). Every cause-(a) red, accepted or not, falls in a setup or `before` hook. The helper sends `?op=…&token=…`, admission answers 400 `CREDENTIAL_IN_ADDRESS`, and so `memberadd` returns no `invite`. The next `enroll` then answers `NO_SUCH_INVITATION`, and every test after it in that file fails. The fix is the one MEMBERSHIP #28 made to `bio-plane/test/members.test.mjs` (K2182, K2183): send the token in the `Authorization` header (or in the body for a binding token), and replace each use of the shared `MEMBER_TOKEN` class with an enrolled member's session. For a test that drives the retired-token path, pin admission R5's answer. Never loosen the check. Most of these files were red when T36 closed (K2168 says "no other red open"), so T36's whole-`test/m` run missed them.

Line numbers in rule 6 that have drifted: red 4 is the test at `order.test.mjs`:12 (it asserts at :15); red 13 is now at `emitted.test.mjs`:131 (not :129); red 15 now fails earlier, at `plane.test.mjs`:79 (the `promote` in `create`), with `CREDENTIAL_IN_ADDRESS`. It does not reach :93's `AI_CREDENTIAL_NO_SECRET` yet.

## The table

Layers: L1 closed (K2180); L2 started and closing (K2181–K2184); L3 and L4 STARTs drafted, not started; L5 onward not started.

| # | test file:line | test name (short) | cause | owner | layer | covered by | the one-line fix |
|---|---|---|---|---|---|---|---|
| 1 | affordances/plane.test.mjs:151 | R13 NO_TARGET / NO_SUCH_BUNDLE alike | (a) `before`'s `memberadd` sends `token=` in the address (:44, :68), so `enroll ruth` gets `NO_SUCH_INVITATION` (:72) | affordances | 11 | none (T37-27 exists, does not name it) | `call`/`GET`/`POST`/`offered` send the token in `Authorization`; replace the 31 `MEM` uses with an enrolled member's session |
| 2 | affordances/plane.test.mjs:167 | R14 answer carries R14's facts | (a) same `before` | affordances | 11 | none | as row 1 |
| 3 | affordances/plane.test.mjs:179 | R14 declared_type, basis_legs from front matter | (a) | affordances | 11 | none | as row 1 |
| 4 | affordances/plane.test.mjs:194 | R14 citation facts (live, severed, reinstatable) | (a) | affordances | 11 | none | as row 1 |
| 5 | affordances/plane.test.mjs:206 | R14 what rests on an inquiry | (a) | affordances | 11 | none | as row 1 |
| 6 | affordances/plane.test.mjs:214 | R14 R15 machine asked of `author` | (a) | affordances | 11 | none | as row 1 |
| 7 | affordances/plane.test.mjs:220 | R15 positional facts asked of identity | (a) | affordances | 11 | none | as row 1 |
| 8 | affordances/plane.test.mjs:234 | R15 roster asked of `by` | (a) | affordances | 11 | none | as row 1 |
| 9 | affordances/plane.test.mjs:242 | R15 positional fact null on wrong type | (a) | affordances | 11 | none | as row 1 |
| 10 | affordances/plane.test.mjs:254 | R16 R14 facts are counts, never ids | (a) | affordances | 11 | none | as row 1 |
| 11 | affordances/plane.test.mjs:269 | R23 joined-project predicates | (a) | affordances | 11 | none | as row 1 |
| 12 | affordances/plane.test.mjs:286 | R14 R9 R18 sever/reinstate on inquiry target | (a) | affordances | 11 | none | as row 1 |
| 13 | affordances/plane.test.mjs:319 | R17 R37 the catalogue with no target | (a) | affordances | 11 | none | as row 1 |
| 14 | affordances/plane.test.mjs:361 | R17 every catalogue act carries a mode | (a) | affordances | 11 | none | as row 1 |
| 15 | affordances/plane.test.mjs:370 | R17 with a target | (a) | affordances | 11 | none | as row 1 |
| 16 | affordances/plane.test.mjs:400 | R26 vocabularies.action_kind | (a) | affordances | 11 | none | as row 1 |
| 17 | affordances/plane.test.mjs:423 | R21 every label is this module's own | (a) | affordances | 11 | none | as row 1 |
| 18 | affordances/plane.test.mjs:435 | R18 roster acts offered where accepted | (a) | affordances | 11 | none | as row 1 |
| 19 | affordances/plane.test.mjs:470 | R18 R9 R10 projectjoin/projectleave | (a) | affordances | 11 | none | as row 1 |
| 20 | affordances/plane.test.mjs:517 | R18 projectleave to an owner | (a) | affordances | 11 | none | as row 1 |
| 21 | affordances/plane.test.mjs:553 | R19 every `reasoned` op refused without reason | (a) | affordances | 11 | none | as row 1 |
| 22 | affordances/plane.test.mjs:587 | R19 reasoned registry, progression, theme acts | (a) | affordances | 11 | none | as row 1 |
| 23 | affordances/plane.test.mjs:617 | R19 R35 R37 the two drives reach every `reasoned` op | (a) | affordances | 11 | none | as row 1 |
| 24 | affordances/plane.test.mjs:664 | R19 R2 inquiryground `reasoned` | (a) | affordances | 11 | none | as row 1 |
| 25 | affordances/plane.test.mjs:678 | R20 MACHINE_REFUSALS both ways | (a) | affordances | 11 | none | as row 1 |
| 26 | affordances/plane.test.mjs:734 | R22 asking writes nothing | (a) | affordances | 11 | none | as row 1 |
| 27 | affordances/plane.test.mjs:745 | R24 no null rung without stated absence | (a) | affordances | 11 | none | as row 1 |
| 28 | affordances/t36-backing.test.mjs:75 | R19 aikeepaway refused with NO_REASON | (e) T37-6 re-coded C-29.32 to `AI_KEEP_AWAY_NO_REASON` | affordances | 11 | red 14; T37-26 + T37-27 | re-pin :76–80 to `AI_KEEP_AWAY_NO_REASON` (T37-27) after T37-26 lists it in `JUSTIFICATION_REFUSALS` |
| 29 | affordances/t36.test.mjs:36 | R48 ACT_HELP holds exactly the design's 207 texts | (b) PR #14 (`e08cd35ecb`, commit `23445bcaab`) withdrew texts from `mock-acts.js`: it now holds 203 keys (`projectcreated`, `countask`, `registerproceeding`, `deadlinecompute`, `claimidentity`, `setpassword`, `assistantset` gone; `owed_obscuremark`, `owed_setpassword` added). The assertion fails at :40 (`203 !== 207`) | affordances | 11 | T37-27 (ACT_HELP regenerated from PR #14's `mock-acts.js`), **not named in rule 6** | T37-27 regenerates `ACT_HELP` and re-states the test's counts and named keys (NO_OP, RETIRED, OWED lists); name it in rule 6 meanwhile |
| 30 | capture-requests/plane.test.mjs:102 | R30 class reach of capturerequest ops | (a) `world()`'s `call` (:47) sends `token=` in the address; the first assertion to fail is `create` (:79). Then rule 4's `AI_CREDENTIAL_NO_SECRET` at :93 until T37-33 | capture-requests | 6 | red 15 (until T37-33) | `call` sends `Authorization`; replace the `mem-cr` uses with a session. **No T37 entry does this**: T37-33 clears only the :93 part |
| 31 | capture-requests/plane.test.mjs:123 | R16 R31 R14 the spine in the plane | (a), same setup | capture-requests | 6 | red 15 | as row 30 |
| 32 | capture-requests/plane.test.mjs:148 | R19 R42 R38 a 503 holds the row | (a), same setup | capture-requests | 6 | red 15 | as row 30 |
| 33 | capture-requests/plane.test.mjs:169 | R14 member-browser request (N295) | (a), same setup | capture-requests | 6 | red 15 | as row 30 |
| 34 | capture-requests/plane.test.mjs:181 | R48 drained capture listed by heldcaptures | (a), same setup | capture-requests | 6 | red 15 | as row 30 |
| 35 | capture/plane.test.mjs:52 | R21 R27 R73 capture, links, archivelookup, acquire behind the token | (a) `send(\`op=capture&token=${T.member}…\`)`: 400 `CREDENTIAL_IN_ADDRESS` (expects 200); also the shared `T.member` (7 uses) | capture | 3 | none (T37-38 exists, does not name it) | send the token in `Authorization`; use an enrolled member's session for `T.member` |
| 36 | extraction/r70.test.mjs:32 (asserts :47) | R70 R1 R19 R30 a .docx table's cells | (e) T37-4's `paras` is a seventh cell key | extraction | 4 | red 12; T37-45 | as T37-45 |
| 37 | host-governor/ops.test.mjs:23 | R18 op=governorstate answers hosts | (a) the `before` `memberadd ruth` (token in the address) gets `CREDENTIAL_IN_ADDRESS`; every test in the file fails | host-governor | 3 | **none** | send the token in `Authorization`; replace the `T.member` class uses (3) with a member's session (R18's "member class" reach re-read against admission R5) |
| 38 | host-governor/ops.test.mjs:41 | R19 governorconfig refuses NEED_HOST, BAD_APPETITE | (a) | host-governor | 3 | none | as row 37 |
| 39 | host-governor/ops.test.mjs:102 | R27 the store's own refusal relayed | (a) | host-governor | 3 | none | as row 37 |
| 40 | host-governor/ops.test.mjs:118 | R27 STORE_DID_NOT_ANSWER | (a) | host-governor | 3 | none | as row 37 |
| 41 | host-governor/ops.test.mjs:150 | R27 R18 R19 relay handed | (a) | host-governor | 3 | none | as row 37 |
| 42 | host-governor/ops.test.mjs:179 | R18 R19 the Worker's arm answers two ops | (a) | host-governor | 3 | none | as row 37 |
| 43 | host-governor/ops.test.mjs:234 | R18 governorstate reached by admin, member, probe | (a) | host-governor | 3 | none | as row 37 |
| 44 | host-governor/ops.test.mjs:253 | R19 governorconfig reached by admin, probe, founder | (a) | host-governor | 3 | none | as row 37 |
| 45 | host-governor/ops.test.mjs:284 | R18 R14 a refusal reported is the hold | (a) | host-governor | 3 | none | as row 37 |
| 46 | op-declarations/t34.test.mjs:64 | R21 R5 every registry `function` is an op (`countask is no registry function`) | (b) PR #14's registry | op-declarations | 11 | red 11; T37-31 | as T37-31 (R21 reads the registry as PR #14 left it) |
| 47 | op-declarations/t34.test.mjs:135 (asserts :148) | R21 R27 `owed` acts (`obscuremark`, `setpassword` new) | (b) | op-declarations | 11 | red 11; T37-31 | as T37-31 |
| 48 | op-declarations/t34.test.mjs:279 (asserts :286) | R27 DEC-148's seven owed acts | (b) | op-declarations | 11 | red 11; T37-31 | as T37-31 |
| 49 | plane/release.test.mjs:12 | R19 every required script passes | (b) "Set up and claim" step 11 names `assistantset`, which PR #14's `setup` screen no longer offers (`WIZARD_ACT_UNKNOWN`, C-131.22) | plane | 11 | red 7; T37-25 | the library's version 2 (T37-25, Bob's approval) |
| 50 | plane/release.test.mjs:18 (asserts :25) | R19 negative control: only a required failure counts | (b) same cause: the required failure is already present | plane | 11 | red 7; T37-25 | as row 49 |
| 51 | plane/worker.test.mjs:43 (asserts :68) | R6 the door answers through the hooks | (a) its own negative control: `op=stats&token=adm-plane` expects 401 (admission R20); admission now answers 400 `CREDENTIAL_IN_ADDRESS` (C-38.10) | plane | 11 | **none** | re-pin :67–68 to 400 `CREDENTIAL_IN_ADDRESS`, `check` C-38.10 (the refusal named, not loosened) |
| 52 | progressions/order.test.mjs:12 (asserts :15) | R41 layer 5–8 listeners in MODULE_ORDER | (d) a stale pinned order (`law-relations` unexpected) | progressions | 5 | red 4; T37-12 | as T37-12 |
| 53 | reading-pipeline/emitted.test.mjs:131 | R28 .docx cells exactly as emitted | (e) T37-4's `paras` per cell | reading-pipeline | 4 | red 13 (at :129 in rule 6); T37-9 | as T37-9 |
| 54 | scheduler/plane.test.mjs:56 | R9 a selection leaves the alarm armed | (a) `POST("op=select&token=adm-sch")`: `CREDENTIAL_IN_ADDRESS` | scheduler | 10 | none (T37-24 exists, does not name it) | `GET`/`POST` (:42–43) send `Authorization`; replace the 4 `mem-sch` uses with a member's session |
| 55 | scheduler/plane.test.mjs:113 | R9 a resolution arms the connection sweep | (a) `entitycreate&token=mem-sch` | scheduler | 10 | none | as row 54 |
| 56 | scheduler/plane.test.mjs:137 (asserts :152) | R5 R9 past-dated clock entry arms the deadline re-check | (a) `memberadd&token=adm-sch` gets no invite, so `enroll` is false | scheduler | 10 | none | as row 54 |
| 57 | scheduler/plane.test.mjs:177 (asserts :182) | R12 a run woken when its request expires | (a) as row 56 (`NO_SUCH_INVITATION`) | scheduler | 10 | none | as row 54 |
| 58 | scheduler/plane.test.mjs:249 | R9 a ratified sweep arms its wake | (a) its `add` (memberadd) `CREDENTIAL_IN_ADDRESS` | scheduler | 10 | none | as row 54 |
| 59 | setup-page/worker-page.test.mjs:173 | R1 one reader of the group | (a) `api(A, \`op=promote&token=${ADM}\`)` (:177) | setup-page | 11 | none (T37-43 exists, does not name it) | the test's `api(…token=…)` calls (:177, :182, :201, :254–255, :270, :296–298, :368–370) send `Authorization`; `MEM` uses become a session |
| 60 | setup-page/worker-page.test.mjs:190 | R1 a store recording no group | (a) `instancegroupseed&token=${ADM}` (:201) | setup-page | 11 | none | as row 59 |
| 61 | setup-page/worker-page.test.mjs:238 (throws :260) | R5 R7 risk tier through the form | (a) `op=projection&token=…` answers a refusal, so `proj.action` is undefined | setup-page | 11 | none | as row 59 |
| 62 | setup-page/worker-page.test.mjs:276 (asserts :297) | R5 a Question through the form | (a) as row 61 (projection undefined) | setup-page | 11 | none | as row 59 |
| 63 | setup-page/worker-page.test.mjs:345 (throws :368) | R13 active profiles through the Worker's route | (a) `op=profiles&token=…` refused, so `.profiles` is undefined | setup-page | 11 | none | as row 59 |
| 64 | (outside `test/m`) bio-plane/test/d526-refusal-order.test.mjs | the suite threw: `aicredentialmint: no token` | (e) rule 4 / N761: T37-6 makes credentials read `secretSha` from the body only; control-plane still sends it in the query until T37-33 (`AI_CREDENTIAL_NO_SECRET`, C-29.33). PROMOTION #35's branch already fixes this file's (a) part (K2182) | promotion | 2 | rule 6 item 8 (rule 4's interim reds), **not named** at credentials' or promotion's START | name it as a rule 4 red until T37-33 (at PROMOTION #35's merge, K2184's practice) |

## Owners with no T37 entry, or whose entry does not cover the red, by layer

**L2 (closing; promotion in flight)**
- promotion: `d526-refusal-order.test.mjs` (row 64) is red from T37-6 (rule 4, N761) until T37-33. No fix is due in L2. It needs naming as an accepted red at PROMOTION #35's merge, the way K2184 named reds 14 and 15.

**L3 (START drafted, not started): both fixes can join the START**
- **host-governor: no T37 entry.** 9 reds (rows 37–45), all from one `before` hook. Fix: tokens in `Authorization`, the `T.member` class replaced by an enrolled member's session (as `members.test.mjs`, K2182). A new small test-only entry (`req: none`).
- **capture: T37-38 does not cover it.** 1 red (row 35). Fix: the `capture/plane.test.mjs` token transport and the `T.member` uses. Add it to T37-38's START (test only).

**L6 (not started)**
- **capture-requests: no T37 entry.** 5 reds (rows 30–34) are accepted as red 15 "until T37-33", but T37-33 only clears the :93 `AI_CREDENTIAL_NO_SECRET` part. The `CREDENTIAL_IN_ADDRESS` part is in the test's own `call` (:47) and the `mem-cr` uses, and no entry fixes it. Fix: a test-only capture-requests entry at L6's START. Red 15 then reads "until T37-33" for the :93 part only.

**L10 (not started)**
- **scheduler: T37-24 does not cover it.** 5 reds (rows 54–58). Fix: `GET`/`POST` send `Authorization`, and the 4 `mem-sch` uses become a member's session. Add it to T37-24's START.

**L11 (not started)**
- **affordances: T37-27 does not cover `plane.test.mjs`.** 27 reds (rows 1–27), one `before` hook. Fix: `call`/`offered` tokens in `Authorization`, and the 31 `MEM` uses become sessions. Add it to T37-27's START. Also row 29 (`t36.test.mjs`:36, cause (b)) is covered by T37-27's `ACT_HELP` regeneration but not named in rule 6. Name it as an accepted red until T37-27.
- **setup-page: T37-43 does not cover it.** 5 reds (rows 59–63). Fix: the test's `api(…&token=…)` calls send `Authorization`, and the `MEM` uses become a session. Add it to T37-43's START.
- **plane: no T37 entry.** 1 red (row 51): `worker.test.mjs`:67–68's negative control expects 401 where admission now answers 400 `CREDENTIAL_IN_ADDRESS` (C-38.10). Fix: re-pin it to the named refusal. Either a new test-only plane entry or a share of T37-25's START (release.test's owner is the same module). Rows 49–50 stay red 7 until T37-25.

Until those STARTs, the 49 unnamed `test/m` reds and row 64 are not accepted by name. Rule 6 needs an addendum naming them, or the census as its list. Also correct the drifted lines in rule 6 for reds 4, 13 and 15.
