# membership (T47)

**Status** · session_011oUnEgjgR8iwQexLBg4vjp · depth 2 · COMPLETE · handled B4

## Record

**How the reading set was read** (mechanics §17, K2032; B1). I read these whole myself: `roles/JOB.md`, `build/manifest.md`, `build/requirements/membership.md` (public and private), my entry T47-7 and the plan's rules 3 and 5 it cites, all of my module's code (`index.mjs`, `checks.mjs`, `schema.mjs`), `module-order.test.mjs` and `members.test.mjs`. Helpers in this session, each given my entry, read the rest whole and wrote me digests citing file and line: my other 26 test files and `fixture.mjs`; the public parts of my Uses (`record-grammar`, `signatures`, `record-core`, `test-support`); `build/layers.md`'s layer-2 contract; and `instance-setup` R17, R80, R81 with the code that builds `bootstrap`. I acted on both digests. The sources stay binding.

**Entries applied (T47-7):**
- **R83** `MODULE_ORDER` now equals `build/modules.json` with T47's six in the file's places:
  - `case-inputs` after `case-account`, in layer 8;
  - `action-records` after `action-grammar`, in layer 9;
  - `screens-wizards` after `interface-shell`, in layer 11;
  - `screens-investigate`, `screens-publish`, `screens-action` after `screens-inquiry` and before `control-plane`, in layer 11.
- **R83, module-order.test.mjs re-pinned.**
  - New explicitly named test "R83 T47-7 …" (K874). It pins each of the six by both neighbours, in `MODULE_ORDER` and in the file, and checks each one's layer.
  - Negative control: a list without one of the six, or with one out of place, is refused; T46's list is behind the file.
  - The tolerance is by name: every module the file gives no paths must be one of T47's six, and `NOT_YET_BUILT` is exactly those six. A forged T46 module without paths is refused.
- **N991.** The T46-4 test is re-pinned. T46's six are held to their filled paths on disk and are never tolerated, and their run is pinned inside layer 11's run, now interleaved with T47's screens. The `case-account` neighbour pin now reads `→ case-inputs`.
- **R132, members.test.mjs.** Its REC-41 assertions now name R132. They are one instrument, run on the live answer and on mutants (K874):
  1. no role, member id or handle at any key or value;
  2. no ISO instant but `consumedAt`;
  3. no object or array at any top-level key, empty ones included (the old check missed an empty nested array);
  4. the key set is exactly R132's twelve;
  5. new: `test_instance`, `part_signin`, `part_scanner` and `part_safe_view` are each present and `true`, `false` or `null`.

  The roster is now proved through `memberlist` *before* the sweep, as R132 says. **Red until T47-75:** 3 assertions (arms 3–5), all from `parts` being nested. That is one more than rule 5's "(2)", because arm 5 is new; same cause.
- `index.mjs`'s header names T47 and R132. R132's answer is built by instance-setup and credentials, not here.

**Flaws dealt with in my own module (P8):**
- Test titles named retired or wrong ids. `t19-enrol-boot` named R59, now R115. Two `t45-project-guard` titles named R126 for C-56.6, now R128 only.
- Stale headers and comments citing retired ids, now pointing to where those ids went:
  - `t14` (R41, R39);
  - `t9` (R82, R39, R40);
  - `t20` (R96);
  - `fixture.mjs` (R59);
  - `index.mjs` (R96, R40).
- `fixture.mjs`'s `enrol` had a dead branch (both arms returned the same thing), now one line.
- `t34-joining`'s R111 purge-class check was guarded by `if (tables)` and could skip silently. It now asserts that `declaredTables` exists.

**Noted, not changed** (no failure hidden; each is a test-strength question, outside T47-7's entries):
- `ownership.test.mjs`'s R60 test asserts only `ok: false`, not each act's code.
- `t35-words`' battery uses lower bounds.
- `no-such-project` samples three acts.
- `t45` does not pin R128's kept bare-"Civicsmith" exception.

All of these are carried to the next membership job.

**Reading for BOB (no question needed unless you read it otherwise):**
- R83's "tolerated names are exactly those of the six still without paths": I built the tolerance by name and only while the file gives a module no paths. A T47 job that merges with paths is then held to them without re-pinning this test.
- `t40-handles` line 133 asserts that a member's own earlier handle reads `free` to that member through `handleCheck`'s viewer arm. R123 says `taken` when R16 would refuse it, and R16 is the enrolment rule (another member's handle or earlier handle). I left the test as it stands; it is a reading for the next requirements touch.

**Other modules:**
- No other module's test turns red with my change. Of the 20 reds in the whole `test/m` run (11 files: op-declarations, ai-use, affordances, action-replies, answer-envelope, case-authoring, run-rules), the same 20 fail on `tranche/T47` without my change.
- My change turns three tests green: `standards/reads.test.mjs` R29, `promotion/registry.test.mjs` R39/R45/R46 and `progressions/order.test.mjs` R41 (the MODULE_ORDER reds of rule 5).
- The plane bundle composes membership, so this merge stales it. I did not touch it.

**Tests and checks run** (on this commit):
- `node --test test/m/membership/` (in `bio-plane/`): tests 219, pass 219, fail 0. At START, the t9 R79 order test and module-order were red; both are green now.
- `node test/members.test.mjs`: 95 pass, 3 fail. The 3 are R132 arms 3–5, red until T47-75 as above. At START it was 93 pass, 2 fail.
- `node --test "test/m/**/*.test.mjs"`: tests 11250, pass 11215, fail 20, all 20 pre-existing on `tranche/T47` (checked file by file there: 20 fail). The 29 non-membership test files reading `MODULE_ORDER` or `modules.json`: 3 fail on `tranche/T47`, 0 fail here.
- `checks/format.mjs`: 165 modules, 158 requirements files; 0 failures.
- `checks/architecture.mjs … membership`: 0 failures.
- `checks/coverage.mjs … membership`: 98 of 98 live ids named by a test; 0 failures.
- `checks/ownership.mjs … membership tranche/T47`: 11 files; 0 failures.
- `checks/run.mjs` over the product: architecture 3059 files, 0 failures. Coverage has 12 failures, every one another module's id (accepted-work, basis-versions, capture-requests, capture, citation, credentials, host-governor, local-facts, progressions, project-roster, record-core, sources); membership has none. Channels: 0 failures.
- No layer tests are named in the manifest.

Size (session_016WwjpKLhCxuVTMA1W4e1CC): test runs 14, module lines 3,756.

## J1 · REPORT

Other modules (details in my record): no test of another module turns red with my change; the 20 reds of the whole test/m run (op-declarations, ai-use, affordances, action-replies, answer-envelope, case-authoring, run-rules) fail identically on tranche/T47 without it. My change turns green standards/reads R29, promotion/registry R39/R45/R46 and progressions/order R41 (rule 5's MODULE_ORDER reds). The plane bundle composes membership, so this merge stales it; I did not touch it. members.test.mjs's R132 reds are 3, not rule 5's 2: the new scalar arm (part_* present, true/false/null) is red for the same cause, nested parts, until T47-75.

## J2 · COMPLETE

T47-7 applied: R83 MODULE_ORDER holds T47's six in modules.json's places, with its own named test and negative control; T46's six held to their paths (N991); R132 named by members.test.mjs's REC-41 sweep (twelve keys, flat scalars, no nested value at any key, roster proved first, instrument run on mutants), red (3) until T47-75. membership tests 219/219; format, architecture, coverage (98/98), ownership: 0 failures; run.mjs architecture 0 failures. Own-test flaws fixed; readings for you (the tolerance read by name while pathless; t40 line 133) and deferred test-strength notes are in my record.

**B2 (CHANGE; K3037):** merged `tranche/T47` (R133 new; record-core merged).
- **R133** Every `*_CHECKS` table `checks.mjs` exports, and so `index.mjs` re-exports, is now a frozen map whose rows are frozen too, built by one helper (`frozenRows`). The six tables are `MEMBERSHIP_CHECKS`, `MEMBER_ID_CHECKS`, `CUSTODIAL_CHECKS`, `PROJECT_AUTHORITY_CHECKS`, `PROJECT_VISIBILITY_CHECKS` and `CASE_AUTHORITY_CHECKS`. Before this, five tables were plain objects, and `MEMBERSHIP_CHECKS`' `LAST_COMMITTED_OWNER` row was not frozen. No code changed or row moved. Only promotion reads them from outside (`CUSTODIAL_CHECKS`), and only reads.
- **Tested by name** in `t47-check-tables.test.mjs` (4 tests). The `*_CHECKS` exports are found from the module itself, so a later table is held too.
  - Each table and each row is frozen, and each row is exactly `{check, where, translation}`.
  - Every write throws and changes nothing.
  - Each code has one row across all the tables, and each check id belongs to one row. A negative control seeds a code held twice and is refused.
  - The module-level refusals (`notAnAdmin`, `noSuchProject`, `notAParticipant`, `noSuchMember`, `notTheOwner`, `listenerRefusal`'s two codes) each carry their one row's check and translation.
  - Control: on the tables before this change, 2 of the 4 tests fail.
- `node --test test/m/membership/`: tests 223, pass 223, fail 0. promotion with answer-envelope: 170 tests, 1 fail, the pre-existing `answer-envelope/envelope.test.mjs` R8, which is among the 20 on `tranche/T47`. `members.test.mjs` is unchanged (95 pass, 3 fail, R132 until T47-75).
- format (165 modules, 160 requirements files), architecture, coverage (99 of 99) and ownership (13 files, tranche/T47): 0 failures each.

Size (session_016WwjpKLhCxuVTMA1W4e1CC): test runs 18, module lines 3,762.

## J3 · COMPLETE

B2 applied (replaces J2's COMPLETE, which I posted before reading B2): tranche/T47 merged; R133 met — every exported *_CHECKS table and its rows frozen (five tables and one row were not), tested by name in t47-check-tables.test.mjs (frozen, writes throw, one row per code across tables with a negative control, module-level refusals carry their row; 2 of 4 fail on the unfrozen tables). membership 223/223; members.test.mjs unchanged (R132, 3 red until T47-75); format, architecture, coverage 99/99, ownership: 0 failures. Record updated.

## J4 · QUESTION

R140's parenthetical names the tolerated names at this job's merge as screens-entry, screens-wizards, screens-investigate, screens-publish, screens-action. But build/modules.json on tranche/T47 still gives case-inputs (L8) and action-records (L9) no paths: their jobs have not run. My reading, which I am building: the rule governs ('the tolerated names are exactly those still without paths'), so the test tolerates by name the seven new modules (T47's six and screens-entry) only while each is pathless, and today that is all seven; the parenthetical is read as the screens alone being at issue for this job. Nothing waits on the answer; say if you read it otherwise, or if you will correct the parenthetical.

**B3 (START; T47-82, R140; MEMBERSHIP #37, session_011oUnEgjgR8iwQexLBg4vjp).**

*How the reading set was read* (mechanics §17, K2032; B3). I read these whole myself: `roles/JOB.md`, `build/manifest.md`, `build/requirements/membership.md`, my entry T47-82, all of my module's code (`index.mjs`, `checks.mjs`, `schema.mjs`) and `module-order.test.mjs`. A helper in this session, given my entry, read the rest whole and wrote me a digest citing file and line: my other 27 test files, `fixture.mjs` and `members.test.mjs`; the public parts of my Uses (`record-grammar`, `signatures`, `record-core`, `test-support`); and every test or source outside membership that reads `MODULE_ORDER` or pins layer-11 neighbours. I acted on the digest. The sources stay binding.

*Entry applied (T47-82):*
- **R140.** `MODULE_ORDER` holds `screens-entry` in layer 11, directly after `interface-shell` and before `screens-wizards`, as `build/modules.json` does.
- **Tolerance by name.** The test tolerates as not yet built exactly the modules the file gives no paths, and each only while it has none: today `case-inputs`, `action-records`, `screens-entry`, `screens-wizards`, `screens-investigate`, `screens-publish` and `screens-action`. This follows my J4 QUESTION and BOB's B4 answer (K3073).
- **R140's own test**, "R140 T47-82 …" in `module-order.test.mjs`, checks:
  - the list equals the file;
  - the module's layer and both of its neighbours, in the list and in the file;
  - a list without it fails, and so does a list holding it out of place on either side (the pin refuses both);
  - the tolerance arm, with a control: `interface-shell` without paths is not tolerated;
  - `setup-page` and `legacy-ui` are in the list exactly while the file names them.
- **Re-pinned around the new module:** T46's and T47-7's pins (`RUN_11`), the tolerated-names set, and the "every module built" title.
- **Control on the old list:** without `screens-entry`, 5 of the 12 order tests fail, R140's among them.

*Flaws dealt with in my own module (P8):*
- Stale comments re-pointed:
  - `index.mjs`'s header now runs to R140;
  - R85's caller is `store-door` R2, not control-plane R27;
  - R11's setup home is `setup-page` R15, not instance-setup;
  - `schema.mjs`'s `handle_history` comment cited R124 as live; it is retired, and no row has been appended since T46.
- `ownership.test.mjs` R60 (deferred by T47-7): each act is now asserted by its code (invite and remove `NOT_THE_OWNER`, visibility `PROJECT_VISIBILITY_NOT_THE_OWNER`, join `NOT_INVITED`). Leave has been added (R87's refusal, byte for byte), and the test asserts that nothing is written.
- `t35-words` (deferred by T47-7): lower bounds became exact values.
  - The tables are now discovered from the module, and the row count is exactly 46.
  - The battery is exactly 70 answers, 66 refusals and 122 texts.
  - It gains `HANDLE_FIXED`, `noSuchMember`, `notTheOwner` and `joinDoors`' refusal, which it had left out.
- `t34-joining` R104: the title says a switched-off link answers like the others, but none was in the equality set. One is now.
- `t42-hold-reach` compared `noSuchProject` with itself, so it could not fail. It now compares an act's answer.
- `t47-check-tables`: its negative control could not fail. The same check now runs on three forgeries.
- `administrators` R8: both halves of the ejection's other half are asserted, not either one.
- `t46` asserts the roster size exactly.
- `t41` had a wrong id (R13) in a title.
- `t38` defined a getter twice; the duplicate is gone.
- `members.test.mjs`:
  - a check that could not fail (`length >= 0`) now can;
  - two comments stated the retired two-administrator floor.

*Readings for BOB (no change made; each turns on a requirement):*
1. **t40 line 133 (carried from T47-7) and `handleCheck`'s viewer arm.** An active member checking their own current or earlier handle is answered `free`, because `#heldByAnother` excludes the asker. That exclusion is left over from R124's change of handle. With R129 no handle changes, so `free` to its holder means nothing. R16 says "every member's … every handle", and R123 says `taken` "when R16 would refuse it".
   - My reading: the viewer arm should answer `taken` for any handle anyone holds or held, the asker included.
   - The invitation arm is unaffected, since an invitee has no handle.
   - This changes a provided service's answer, so I left it for a requirement touch.
2. **R128's kept exception.** `words.json`'s `refusal.PROJECT_GUARD_UNCHECKED` now reads "Your group's Civicsmith couldn't check…" (commit de9b00750e, DEC-198 (7)), which conforms to R112. R128 says the row is read by key once the word conforms. That condition looks met; the move is a requirement change, so I did not make it.
3. **R78/R61 test breadth.** The R61 tests sample acts. A table of every project-naming op, with a census against `membershipOps`, would prove "every act". I left it as noted (a test-strength question).

*Other modules:*
- No other module's test turns red with my change. The whole `test/m` run has 11308 tests: 11270 pass and 23 fail. The 23 are in 14 files: op-declarations, ai-use, affordances, answer-envelope, case-authoring, credentials t47, plane roster and run-rules t46. Those 14 files give the same 113 tests and 23 failures on `tranche/T47` without my change (run in a worktree).
- The plane bundle composes membership, so this merge stales it. I did not touch it.

*Tests and checks* (this commit):
- `node --test test/m/membership/` (in `bio-plane/`): tests 224, pass 224, fail 0.
- `node test/members.test.mjs`: 95 pass, 3 fail. The 3 are R132's, red until T47-75 (rule 5, 7c), unchanged.
- `checks/format.mjs`: 166 modules, 164 requirements files; 0 failures.
- `checks/architecture.mjs … membership`: 0 failures.
- `checks/coverage.mjs … membership`: 100 of 100 live ids named; 0 failures.
- `checks/ownership.mjs … membership tranche/T47`: 0 failures.
- `checks/run.mjs`:
  - architecture: 3067 files, 0 failures;
  - coverage: 46 failures, every one another module's (membership has none);
  - channels: 0 failures.
- No layer tests are named in the manifest.

Size (session_011oUnEgjgR8iwQexLBg4vjp): test runs 16, module lines 3,764.
