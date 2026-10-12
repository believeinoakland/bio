# membership (T47)

**Status** · session_016WwjpKLhCxuVTMA1W4e1CC · depth 2 · COMPLETE · handled B1

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
