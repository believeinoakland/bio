# membership (T45)

**Status** · session_019Mx293Q1PFFwRus5nYUaPq · depth 2 · WORKING · handled B2

## Record

**How the reading set was read** (mechanics §17, K2032; B1). Read whole by me: `roles/JOB.md`; `build/manifest.md`; `build/requirements/membership.md` (public and private); the public parts of `record-grammar`, `signatures`, `record-core` and `test-support` (my Uses); `build/layers.md`'s layer 2 contract; my entry T45-2 in `build/plan/current.md` with rules 1–5 at the opening; K657, K2781, K2784, K2786; `draft-T45-lower.md` §1.2 and §10; all of my module's code (`index.mjs`, `checks.mjs`, `schema.mjs`, 3,693 lines at START); `module-order.test.mjs`, `fixture.mjs` and the R124/R125 part of `t40-handles.test.mjs`. My other tests (24 files and `members.test.mjs`) were read whole by a helper in this session, told my entries, which wrote me a digest of what each pins, citing each file (K2032, §17 (3)); I acted on it where it bore on R128 and R83 (the refusal orders and exact answers of R32 and R45 it pins, the fixture registering no guard, `t9-notice-sight-bounds`' second R83 pin). The sources stay binding.

**Entries applied (T45-2):**
- **R128** `registerProjectActGuard(module, fn)`: one slot, one registration whoever makes it, `LISTENER_MALFORMED` / `LISTENER_DECLARED` (naming the holder) through R81. R32 (`projectInvite`) calls `fn({act: "invite", projectId, by})` after `ALREADY_A_PARTICIPANT`, and R45 (`projectVisibilitySet`) calls `fn({act: "visibility", projectId, by, setting})` after `PROJECT_VISIBILITY_UNKNOWN_SETTING`, each before any write and before R116's/R117's notice. A refusal (an object with `ok: false` and a non-empty `reason`) is answered unchanged, the same object; null proceeds; a throw, a promise (its rejection swallowed), or anything else refuses `PROJECT_GUARD_UNCHECKED`. No guard: the acts proceed as before (every existing test of R32 and R45 unchanged and green). No table read but my own; no table added.
- **New row** (K107 (3), K174; the job names it): `PROJECT_GUARD_UNCHECKED` is **C-56.6** (C-56, a person's acts in a project; C-56.5 is project-roster's), in `MEMBERSHIP_CHECKS`, `where` `src/membership/index.mjs #projectActGuarded > is-project-guard-checked`, answered with `project` and `act`. Its translation is my draft, re-wordable by the UX stream (draft §10 lists it): "Whether this project's own rules allow that could not be checked, so nothing was changed. Try again in a moment." (R112-clean, tested). **For promotion's stamp (T45-4): one new row, C-56.6.**
- **R83** `MODULE_ORDER` gains `case-check` (L8, review → · → conformance), `action-holds` (L9, actions → · → action-clocks), `action-replies` (L9, action-clocks → · → filing-templates), `plan-work` (L9, action-plans → · → monitoring), `action-producers` (L11, machinery-producers → · → queue-producers), equal to `modules.json`; each tolerated by name as not yet built and pinned between its two neighbours, with K874's negative control.

Not-yet-met marks this job meets: **R128** and **R83's T45 clause** (test file `t45-project-guard.test.mjs`, 8 tests; `module-order.test.mjs`, 9 tests).

**Flaws found and dealt with in my own module (P8):**
- `module-order.test.mjs` still tolerated `doorbell` and `case-account` as not yet built though both merged in T42 (harmless, since both have paths, but the T42-3 negative control pinned the stale list): the tolerated names are now exactly T45's five, and doorbell and case-account are asserted held to their paths.
- `index.mjs`' header named R4–R127 (now R128, with T45's entries), and `notAnAdmin`'s comment listed the retired R41 among its callers (now `project-roster` R5).
- Noted, not changed (sound, out of my entries' reach): the digest names some weak tests in my module (ownership R60 asserts only `ok: false`; t14's "R22 refusal order" tests one step; t34 R111's exemption check sits inside `if (tables)`; `t9-notice-sight-bounds`' R83 test re-states module-order's). Deferred to a later membership job: each is a test strengthening with no requirement change; none hides a failure today.
- Deferred: none of my entries.

**Other modules:** none changed. For `project-roster` (T45-3), which registers the guard: it registers `registerProjectActGuard("project-roster", fn)` once at start; `fn` is called synchronously with `{act, projectId, by, setting?}` and must answer null or a refusal (`ok: false`, a non-empty `reason`) synchronously; a promise reads as unchecked. The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) composes membership, so this merge stales it (accepted red 5, regenerated at L2's close); I did not touch it. Accepted red 8 (`standards` R29 "the move to layer 5") passes now on this branch.

**Tests and checks run** (final, on this commit):
- `node --test test/m/membership/*.test.mjs` (in `bio-plane/`): tests 210, pass 210, fail 0, skipped 0.
- `node test/members.test.mjs`: members: 95 pass, 0 fail.
- MODULE_ORDER's readers (25 test files of other modules naming it): tests 237, pass 237, fail 0; `test/m/standards/*.test.mjs`: tests 78, fail 0 (R29 green); `test/m/promotion/*`, `test/m/project-roster/*`: tests 159, fail 0.
- `checks/format.mjs`: 152 modules, 151 requirements files; 0 failures. `checks/architecture.mjs … membership`: 0 failures. `checks/coverage.mjs … membership`: 95 of 95 live ids named by a test; 0 failures. `checks/ownership.mjs … membership tranche/T45`: 0 failures.
- No layer tests are named in the manifest.

Size (session_019Mx293Q1PFFwRus5nYUaPq): test runs 9, module lines 3,744 (under 4,000, K617).

## J1 · COMPLETE

T45-2 done, pushed on job/T45/membership. R128 registerProjectActGuard (one slot via R81; R32 and R45 call it after their own refusals, before any write; a refusal answered unchanged, null proceeds, anything else PROJECT_GUARD_UNCHECKED; none registered: acts as today). New row C-56.6 PROJECT_GUARD_UNCHECKED (my draft translation, re-wordable) for promotion's stamp. R83: MODULE_ORDER gains case-check, action-holds, action-replies, plan-work, action-producers in modules.json's places, tolerated as not yet built and pinned. Membership tests 210/210, members 95/95, MODULE_ORDER readers 237/237; standards R29 (accepted red 8) now green. format, architecture, coverage (95/95), ownership: 0 failures. Plane bundle staled (accepted red 5). No file outside my paths. Module 3,744 lines. Details in my record.

**B2 (CHANGE; K2799):** merged `tranche/T45` (R83's clause amended, `stewards` in `modules.json`, layer 11, last, directly after `installer`). `MODULE_ORDER` gains `stewards` last; `module-order.test.mjs` tolerates it by name as not yet built (six names now) and pins it after `installer` with nothing after it, with K874's negative control (a list without it, or holding it before `installer`, refused).
- `node --test test/m/membership/*.test.mjs`: tests 210, pass 210, fail 0. `members.test.mjs`: 95 pass, 0 fail.
- MODULE_ORDER's readers, `standards`, `promotion`, `project-roster`: tests 484, pass 484, fail 0.
- format (153 modules, 152 requirements files), architecture, coverage (95 of 95), ownership: 0 failures each.

Size (session_019Mx293Q1PFFwRus5nYUaPq): test runs 12, module lines 3,745.
