# doorbell (T51)

**Status** · session_01SJ3MSM2hnThczxNQgrgj8g · depth 2 · COMPLETE · handled B7

## Completion (T51-182, the words pass; session_01C6MLP8YoCGd3BrWthJxfJ5)

**Entries applied.** T51-182 (the words findings in `build/plan/words-pass/doorbell.md`):
- The 13 `plain` findings, all judged member-readable (each a refusal's `detail`, a `basis`, an evidence sentence, a capture method label or a pseudonym's note), each now `localize("doorbell.<stem>.<slug>", en, vars)` in `src/doorbell/door.mjs` (1) and `src/doorbell/index.mjs` (12). No REPORT of a string no member reads: none was found.
- The 10 conversion findings (1 handlist, 9 test copies): `rows.test.mjs` hand-list of capture's codes now comes from `CAPTURE.CAPTURE_CHECKS`; the C-118 and C-85 expectations now read each row's translation as `EXPECT` (new `test/m/doorbell/expect.mjs`: `word(key)` or `localize(id, en)` per row, the product's own ids), compared by equality, not by copied text; `doorbell.test.mjs`, `t35.test.mjs` and `knock-origin.test.mjs` compare the same way; `knock-origin`'s signal fixture is now a neutral token (`origin member`); `t35`'s `these bytes` assertion compares with `localize` filled from the inbox row.
- The 5 `code` test copies: the same comparison, in the same files.

**Deferred.** `test/m/doorbell/knocker.test.mjs:205` holds a regular-expression fragment of the `these bytes were received` sentence. The words check does not count it (zero findings), so I left it; BOB may want it converted with the rest of R13's test copies.
**Not mine (seen in the repository-wide run).** `checks/run.mjs /home/user/bio` reports failures in other modules (wizard-scripts and others); none names doorbell. `setup-words/build.mjs --check` reports `rows.mjs` stale (the expected note); no refusal names doorbell.
**For BOB.** `expect.mjs` holds one `localize` id the product does not use (`doorbell.checks.group_can_see`), to name the sentence every refusal shares (R9). Its text is the product's own, so the test compares with it; a row for it would change nothing.

**Checks.** `node checks/words.mjs /home/user/bio doorbell`: 0 failures (was 27). `node checks/format.mjs /home/user/bio`: 0 failures. `node checks/architecture.mjs /home/user/bio doorbell`: 0 failures. `node checks/coverage.mjs /home/user/bio doorbell`: 25 of 25 live ids named by a test, 0 failures. `node checks/ownership.mjs /home/user/bio doorbell tranche/T51 job/T51/doorbell`: 0 failures. `node --test bio-plane/test/m/doorbell/`: 73 of 73 pass.

**Size (session_01C6MLP8YoCGd3BrWthJxfJ5): test runs 3, module lines 1144**

## J1 · COMPLETE

T51-182 done: the 13 plain findings and the 10 conversion findings are fixed (commit e8ac15435f on job/T51/doorbell). words check 0 failures (was 27); format, architecture, coverage and ownership 0 failures; doorbell tests 73 of 73 pass. Open for BOB: knocker.test.mjs:205 holds a regex fragment of a product sentence (not counted by the check, left as is); expect.mjs uses one localize id not used by the product (doorbell.checks.group_can_see). Record: build/jobs/T51/doorbell.md, Completion section.

## CHANGE (K3982) · re-completion

Merged `tranche/T51`. Both open points closed:
1. `knocker.test.mjs`: the regular-expression copy of the `these bytes` sentence is now an equality with the product's own `localize("doorbell.index.these_bytes_were_received_at", en, vars)`, the vars read from the inbox row and the pull's inputs.
2. `expect.mjs`: the minted `doorbell.checks.group_can_see` constant is deleted. The tests that held it now read `EXPECT[code]` (the product's own key per row) by equality; the shared sentence is no longer asserted on its own.
Also `rows.test.mjs` uses a plain token ("changed translation") in place of the deleted constant.

**Checks:** `node checks/words.mjs /home/user/bio doorbell`: 0 failures. `node --test bio-plane/test/m/doorbell/`: 73 of 73 pass. format, architecture, coverage (25 of 25) and ownership (8 files, 0 failures) all 0 failures. `setup-words/build.mjs --check`: the stale-rows note only, no refusal naming doorbell.

**Not mine (seen in the repository-wide run, reported to BOB under P9):** `provenance/register-checks.test.mjs:186,196` copies the doorbell's sentences; `control-plane/doorbell.test.mjs:296,514` and `screens-entry/front.test.mjs:55` hand-list ops and keys.

**Size (session_01C6MLP8YoCGd3BrWthJxfJ5): test runs 4, module lines 1144**

## J2 · COMPLETE

CHANGE K3982 done (commit d09363a33a on job/T51/doorbell, tranche/T51 merged). (1) knocker.test.mjs:205 now compares asserts by equality with the product's localize call, vars from the inbox row. (2) expect.mjs's minted doorbell.checks.group_can_see is deleted; tests read EXPECT[code] by equality. words check doorbell: 0 failures; doorbell tests 73/73; format, architecture, coverage, ownership 0 failures; setup-words check: stale-rows note only. Reported under P9, not mine: provenance/register-checks.test.mjs:186,196 copy doorbell sentences; control-plane/doorbell.test.mjs:296,514 and screens-entry/front.test.mjs:55 hand-list keys/ops. Record: build/jobs/T51/doorbell.md, CHANGE section.

## Completion (fix round 2, B3: C28's plane half, a knock's name and type; DOORBELL #5, session_01M3qW5twDUffgj9DdAeC1Tc)

**Entries applied.**
- A knock records the file name and media type its sender stated. `knock` takes `fileName` and `mediaType` (the Worker forwards them when strings); the inbox row holds `file_name` and `media_type` (two additive columns, null on every older row); `inboxList` rows and `inboxGet`'s item answer both. Bounded: the name to 255 characters with control characters dropped, the type to 127; white space trimmed; a value that is not a string or is empty once cleaned is absent (null). Never a type check: nothing reads the stated type to admit or refuse, the file-safety scan still decides. The sender's answer carries neither.
- K4208: declared the census ops I own that had no declaration and are reachable: `inboxget`, `doorbelltally`, `pulledknocks` (`DECLARED_OPS`, rows copied from the existing hand rows and op-grades' descriptions).

**Proposed requirement line (BOB writes it):** **R27** *(T51; K4328; amends R3 and R25)* A knock records the file name and media type its sender stated: `knock` takes `fileName` and `mediaType`, each kept as text of at most 255 and 127 characters, control characters dropped and white space trimmed, else absent (null); neither is ever read as a type check (the file-safety scan decides). The inbox row holds both (R25: two additive columns, null on a row written before), and `inboxList` and `inboxGet` answer `file_name` and `media_type`, null for a knock that stated none. The knock's own answer to its sender carries neither. Test: `knock-name.test.mjs`, with its controls (neither stated; non-string, blank; a type that lies about the bytes is recorded as stated and the knock accepted). R25's list of the inbox's additive columns gains the two.

**What a safe view of the bytes before the pull would take (not in this entry).** A new member-only read (`inboxview`, signed-in member session, no machine credentials) that fetches the knock's bytes (the evidence-store object or the inline copy, hashed against the row's digest), runs them through the file-safety scan, and answers only what the scan allows: for a type it judges viewable, a bounded rendering (text excerpt, or a still image) or a refusal naming the scan's finding; never the raw bytes and never a stated type taken on trust. It needs: a doorbell requirement for the read and its bound; file-safety's scan reachable from this module (an addition to `uses`, and the layer contract permitting doorbell to call it); the op declared (op-declarations, op-grades), routed by control-plane/plane, and a screen door in screens-intake. It writes nothing (no receipt, no capture), so the pull stays R13's only filing act.

**Deferred.** None.
**Found in other modules (P9).** (1) `op-declarations` hand-declares the inbox list as `inbox`, but this module's route is `inboxlist`; the plane's R71 refuses a declared op with no route of that name, so I could not declare it from here. Whoever owns the route map (plane/control-plane) must alias `inbox` to the doorbell's `inboxlist` route, or the hand row be renamed, before the owner can declare it. (2) Reds seen and not mine (present without my change): `screens-intake` R8 (registry acts), control-plane R17 `groupdescriptiondraft`, `screens-*` R24 words.

**Checks.** `node --test --test-force-exit bio-plane/test/m/doorbell/`: 85 of 85 pass (73 at the last completion; 4 are R27's, 3 the declared reads', the rest came with the tranche merge). Users: control-plane, sources, store-door (437 of 438; the red is `groupdescriptiondraft`, control-plane's, on the tranche tip too), plane declarations 5 of 5 after dropping the `inbox` row, op-declarations and op-grades 391 of 391. `format` 0 failures; `architecture doorbell` 0; `coverage doorbell` 26 of 26 live ids named, 0 failures; `words doorbell` 0 failures; `ownership doorbell` 0 failures; `setup-words build --check`: the stale-rows note only (a control-plane row), none naming doorbell. Each R27 test was seen failing before the code.

Size (session_01M3qW5twDUffgj9DdAeC1Tc): test runs 9, module lines 1180

## J3 · COMPLETE

COMPLETE (fix round 2, B3: C28's plane half). A knock now records the file name and media type its sender stated (fileName, mediaType; bounded 255/127, control characters dropped, absent = null, never a type check) and inboxList/inboxGet answer file_name and media_type; the sender's answer carries neither. Proposed line R27 (and R25's additive columns) is in my record's Completion for you to write. Safe view before the pull: described in the record (a member-only inboxview read through file-safety's scan, answering only what it allows; needs a requirement, file-safety in uses, op declaration and routing, and an intake door). Also declared inboxget, doorbelltally, pulledknocks (K4208). For P9: the inbox list is hand-declared as 'inbox' but routed as 'inboxlist', so plane R71 refuses my declaring it; the route owner must alias or rename. Doorbell 85/85; coverage 26/26; format, architecture, words, ownership 0 failures; users (control-plane, sources, store-door, plane, op-declarations, op-grades) green but for reds not mine. Commit 5e8dc44721 plus a counts fix on job/T51/doorbell.

## Completion (fix round 3, wave 1, B4: C28's knock answers, Small 1; DOORBELL #6, session_012xGAhuEiWYxdWHqLzyKcUo)

**Entries applied.**
1. **C28\* (the plane half).** Round 2 already recorded the sender's stated file name and media type on the inbox row and answered them from `inboxList` and `inboxGet`. The check the entry asked for found `knocksOf` (`op=knocksof`, R15) missing them: its row selected neither. It now selects `file_name` and `media_type`, so all three reads (`inboxlist`, `inboxget`, `knocksof`) answer both, null for a knock that stated none. The name is held in this module's `inbox` table (no part outside `doorbell`), so no QUESTION was needed. `pulledknocks` (R18) is a fixed-field read for `sources` and is unchanged.
2. **Small 1.** `DECLARED_OPS` declares `inboxlist` where `doorbellOps` routes it (class, weight and description as the existing `inbox` hand row and op-grades read it; fields `status`, `sort`, `dir`, `limit`, `after`, none required). The member-facing description is `localize("doorbell.declared.inboxlist", …)`, written once.

**Tests (each seen failing first).** `knock-name.test.mjs`: "R27 R15: knocksof answers the file name and media type …" and its control (a knock that stated neither answers both null through `knocksof` and `inboxget`). `declared-ops.test.mjs`: "R26 doorbell declares inboxlist where the route is" (every op in `DECLARED_OPS` is a key of `doorbellOps`, and `declaredOpHolds` for `inboxlist`) and its control (the declared list's classes and no-write, and the route answers the list). Words are read by key; no sentence is copied.

**Proposed requirement lines (BOB writes).** (a) R27 amended: "`knocksOf` (R15) rows answer `file_name` and `media_type` as `inboxList` and `inboxGet` do, null for a knock that stated none." (b) R26 amended: `inboxlist` joins `knock`, `knocksof`, `inboxpull`, `inboxresolve` (and the three reads round 2 added) among the declared ops.

**Not mine, for BOB (P9).** The alias half of Small 1 is `op-declarations`' and `control-plane`'s: `inbox` is still a hand row in `op-declarations` (`OPS_HAND`, also named in its act lists) and the control plane maps `inbox` to the `inboxlist` route (`DO_PATH`). To make `inbox` the alias of the declared `inboxlist`, `OP_ALIASES` there needs `inbox: "inboxlist"` and the hand row renamed `inboxlist`; until then both are declared (the owner's `inboxlist` is merged as a new op, `inbox` untouched, and the alias still answers). Their R81 agreement holds today because no hand row is named `inboxlist`.
**Deferred.** None.

**Suites and checks.** `node --test --test-force-exit bio-plane/test/m/doorbell/`: 88 of 88 pass (85 before). Users: sources 44/44, op-declarations 242/242, op-grades 145/145, test-support 65/65, control-plane `m/` 0 failures, plane 279 of 280 and store-door 52 of 53; the reds (`plane` R24 words of the screens, `store-door` R17 `groupdescriptiondraft`) are on the tranche tip too and not mine. `build/plan/impact.mjs origin/tranche/T51 HEAD` lists 85 affected modules; its summary shows short counts for other modules (pdf-worker, agent-steps, agent-worker, corpus-export, journey-check, public-read and others) that I did not trace; I ran the direct users above and the plane and control-plane suites, and did not compare the rest against the tip. `checks/format.mjs`: one failure, `build/rulings.md:4346` (K4349), not mine and on the tip. `architecture doorbell` 0, `coverage doorbell` 27 of 27 live ids named, `words doorbell` 0 failures, `ownership doorbell origin/tranche/T51 job/T51/doorbell` 0 failures.

**Safe view before the pull (not in this entry).** As round 2 recorded: a member-only read (`inboxview`) that fetches the knock's bytes, hashes them against the row's digest, runs them through the file-safety scan and answers only what the scan allows; it needs a doorbell requirement, `file-safety` in `uses` (layer contract permitting), the op declared and routed, and a screen door in screens-intake. `later-ux.md` (K4332) holds it.

Size (session_012xGAhuEiWYxdWHqLzyKcUo): test runs 8, module lines 1182

## J4 · COMPLETE

COMPLETE (fix round 3, wave 1, B4). C28: knocksof now answers file_name and media_type (inboxlist and inboxget already did); the name is held in doorbell's inbox row, nothing outside. Small 1: inboxlist declared in DECLARED_OPS where routed. Tests seen failing first, with controls: knock-name.test.mjs (R27 R15) and declared-ops.test.mjs (R26). Doorbell 88/88; sources, op-declarations, op-grades, test-support green; plane and store-door each one red (R24 words, groupdescriptiondraft) also on the tranche tip. format has one red (rulings.md:4346, K4349) on the tip; architecture, coverage 27/27, words, ownership 0. Proposed lines: R27 amended (knocksOf rows answer both), R26 gains inboxlist. For BOB (P9): the alias half of Small 1 is op-declarations' and control-plane's: OP_ALIASES needs inbox -> inboxlist and the hand row renamed; until then both are declared and the alias answers. Safe view needs a requirement, file-safety in uses, the op declared and routed, and an intake door (record). Record: build/jobs/T51/doorbell.md.

## Round 5 (E5), DOORBELL #7 · session_01SJ3MSM2hnThczxNQgrgj8g

Read whole: `fix-round-5-T51.md`, `build/requirements/doorbell.md`, `src/doorbell/index.mjs`; `fix-round-5-step0.md` does not exist yet (none of my entries waits on it).

**Root cause** (`src/doorbell/index.mjs:652`): `profileOf({... ct: null ...})`; the pull ignores the knock's stored `media_type` and `file_name` (columns written at :463, read at :502), so `profile.profiled_from_text` is false for a `text/plain` knock and the reading states "not read as text".
**Why the tests missed it:** `knock-origin` and the control-plane F6 case pull a probe type and a PDF; no test pulls plain text.
**Failing-first** (`test/m/doorbell/knock-text.test.mjs`, R13): the walker's case (273 bytes of text, `knock-b.txt`, `text/plain`) and the `.TXT`/`.md` no-type case are red now (`false !== true`); the NUL, not-UTF-8, `application/pdf` and no-name-no-type controls pass today and must stay green.
**Provider not merged:** the fix calls acquisition's `textTypeOf({bytes, type, name})` (plan section 3, merge 2). It is not on `tranche/T51` at 7115408d02 (`git grep textTypeOf` finds nothing). The test is written; the code waits for the merge (no copy of the rule is made here).

## J5 · QUESTION

E5 is ready except for its provider. My failing-first test (test/m/doorbell/knock-text.test.mjs, R13) is red on the walker's case: root cause src/doorbell/index.mjs:652 (ct: null; the knock's stored media_type and file_name are ignored). The fix is one call to acquisition's textTypeOf({bytes, type, name}), which the plan puts at merge 2 (before me), but tranche/T51 at 7115408d02 has no textTypeOf (git grep finds none; acquisition's round-5 job is not among the six started). Smallest thing I need: acquisition's textTypeOf on tranche/T51, with the signature the plan names; ring me when it is merged and I will merge tranche/T51 and finish. I will not copy the rule. If you would rather I wait on nothing, say so and I will add the call behind your chosen signature.

**Done (E5).** Merged `tranche/T51` (acquisition's `textTypeOf` is on it). `src/doorbell/index.mjs:18` imports `textTypeOf`; `:652-655` `#pull` computes `ct = textTypeOf({bytes, type: row.media_type, name: row.file_name})` and hands it to `profileOf` (was `ct: null`). No copy of the rule.
**Red then green:** `knock-text.test.mjs` R13 cases 1 and 2 red before (`false !== true`, recorded above), green after; controls (NUL, not UTF-8, `application/pdf` over text, no name and no type) green before and after. New data only: a knock pulled before this keeps its stored profile.
**Suites:** `node --test --test-force-exit bio-plane/test/m/doorbell/`: 92 of 92 pass. `build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 1 of 176 (doorbell only), affected test files 1.
**Checks:** `checks/run.mjs`: format, architecture, coverage (6610 of 6610), channels, words (inline 0, plain 0, testcopy 0, missingkey 0) 0 failures; ownership 0 failures.
**Proposed requirement line (BOB writes):** R13 add: "A pulled knock is profiled with the text type acquisition's `textTypeOf` answers for its bytes, its stated media type and file name (the upload's rule, acquisition R102); a knock whose bytes are not text, or whose stated type is not a text type, is profiled as before. New data only."
**Through the door** (`op=knock`, `inboxpull`, `op=reading`) is control-plane's seam test.
Size (session_01SJ3MSM2hnThczxNQgrgj8g): test runs 4, module lines 1155

## J6 · COMPLETE

E5 done. src/doorbell/index.mjs:18 imports acquisition's textTypeOf; #pull (:652-655) passes the knock's media_type and file_name through it into profileOf (was ct: null). Failing-first knock-text.test.mjs (R13): walker's case and the .txt/.md no-type case red before, green after; controls (NUL, not UTF-8, application/pdf over text, no name/type) green throughout. Doorbell suite 92/92; impact: doorbell only; checks/run.mjs and ownership 0 failures, words count not up. New data only. Proposed R13 line is in my record (BOB writes). Through-the-door seam test is control-plane's. Size (session_01SJ3MSM2hnThczxNQgrgj8g): test runs 4, module lines 1155.
