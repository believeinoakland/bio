# wizard-scripts (T48)

**Status** · session_0129Q6YKSGffXsuManXadjRF · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**COMPLETE** · wizard-scripts T48-55 (R37, R38, R39) · branch `job/T48/wizard-scripts` @ the commit after this entry.

**Read (whole):** `build/requirements/wizard-scripts.md`; the START; `roles/JOB.md`; `build/manifest.md`; layer 11's contract in `build/layers.md` (the opening and the split map's parts that name this module); the module's `index.mjs`, `data.mjs`, `build-data.mjs`, `front-doors.mjs`, `start.mjs`, `writing-help.mjs` (the parts R24 reads); of `ai-accounts` only `aiKeptAway` and its factory (R7, R34); the tests that name R10, R23, R24, R27, R33, R35, R36 (`reads`, `start`, `writing-help`, `t47`, `library`, `invariants`, `fixture`). The vendored design files (`registry.json`, `library.json`) were read by script against the PR #34 merge (`4664e8efd4`, taken from git).

**Entries applied**
- **T48-55, `ai-accounts`:** `aiKeptAway` is read from `ai-accounts` (`aiAccountsOf`), asked `{use: "draft"}`; an `ai-accounts` that cannot be reached or throws answers its own `KEPT_AWAY_UNREADABLE` (fail closed, as before). `credentials` is no longer imported; the factory's dependency is `accounts`.
- **R37:** `startFrom`'s `doors` end with the sixth, `{door: "elsewhere", scripts: [], opens: "elsewhere"}` (`ELSEWHERE_DOOR`, frozen; `library.json` holds none at `4664e8efd4`), answered to every viewer whatever is offered. The `elsewhere` route's `pointer` is `{places, pointers}` (checked: `places` strings, `pointers` objects, both lists) or `null`; a string, a throw or no provider give `null`.
- **R38:** registry re-taken at `4664e8efd4` (67 screens, 329 acts, 5 owed: `elsewhere`, `updates`, no `dash-home`); library: "Update your group's Civicsmith" v1, "Set up and claim" v4 (step 3 no act), "Start and send" v3 (`labeled`), each approved by BOB under K2241 on 2026-10-14. `build-data.mjs` regenerates `screen-registry.mjs`, `civicsmith-library.mjs` and `front-doors.mjs` (reproduced T47's bytes first, then the new args).
- **R39:** `wizards` (default listing) now lists what is offered to every member who may see it; the other states stay to owners and administrators, except that a member's own drafts are also listed to her (the requirement's control: her `state: "draft"` read answers only her own drafts).
- **K3261 D1:** "labelled" re-spelled "labeled" in this module's member-facing words (`checks.mjs`, WIZARD_DRAFT_REFUSED's check and translation). Older library versions stay as written.

**Deferred:** nothing.

**Found in other modules (reported to BOB)**
- `build/modules.json`: `wizard-scripts` still lists `credentials` in `uses` (the code no longer imports it) · BOB's file.
- `op-declarations`' tests that read this module's carried registry and library at PR #33's head now fail on the re-take (its R65 owns the re-take): 8 tests, R21/R27 (T35, T37, T38 sentences), R52 (R29, R30), R54/R60 (both). They name the update acts (`updatestart`, `updatelater`, `updateskip`) as owed, 88 not 89 function acts, and an `owed:` act in the library. 14 other op-declarations tests were already red at the START (R19/R6, R43, R49, R51).
- `plane` registers `wizardRegister` with a `door` that has no `pointer` provider; the sixth route's `pointer` answers `null` until its job registers one answering `{places, pointers}` (R37).
- Requirements: R22's "seventeen scripts" and R33's "five doors" read as R37/R38 amend them; no change asked.

**Tests and checks** (from `bio-plane/`, `node --test test/m/wizard-scripts/`): `tests 94, pass 94, fail 0, skipped 0` (new: `t48.test.mjs` names R37 twice and R38 twice; `reads.test.mjs` names R39; R10, R20, R23, R33, R35, R36, R22, R30 and the writing-help tests re-stated for the new snapshot, `ai-accounts` and the sixth door).
Layer users run (skills, screens-wizards, instance-setup, screens-action, screens-daily, queue, affordances, screens-settings, plane, op-declarations): 1351 tests, 19 fail, all in op-declarations (8 above, 11 inherited red; the baseline had 14 there).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage names no failure for `wizard-scripts` (21 other modules' failures are theirs); channels 0 failures.
- `node checks/ownership.mjs /home/user/bio wizard-scripts tranche/T48`: 20 files changed by wizard-scripts, 0 failures.

Size (session_0129Q6YKSGffXsuManXadjRF): test runs 12, module lines 2598
