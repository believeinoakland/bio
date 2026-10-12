# publication (T46)

**Status** · session_015HY6DrM4gxmJtgrtDXma3h · depth 2 · COMPLETE · handled B0

## Record

**How the reading set was read** (mechanics §17, K2032; B1: 1314 KB, over the 600 KB limit). I read these whole myself:
- `roles/JOB.md`, `build/manifest.md` and my entry T46-66 in `build/plan/current.md`.
- `build/requirements/publication.md`, public and private.
- All of my module's code: `deliverer.mjs`, and `publication/checks.mjs`, `door.mjs`, `index.mjs`, `schema.mjs` and `worker.mjs`.
- `t41.test.mjs`, the test my entry changes.
- `fixture.mjs`, the parts I used.
- membership R123–R126 and R129 (my entry's subject).

Two helpers in this session read the rest whole. Each was told my entry and wrote me a digest citing file and line:
- **My other 24 test files**, with `fixture.mjs` whole. The digest found no other test that calls `handleChange`, `registerHandleGuard` or `HANDLE_FIXED`, or that depends on a handle being changeable.
- **The public parts of all 21 of my Uses**, and layer 8's contract in `build/layers.md`. The digest found nothing that constrains R76 or R77 beyond what the change below keeps: the registration stands, the guard is not called, and `HANDLE_FIXED` names no case.

The sources stay binding.

**Entry applied (T46-66, test only; K2928).** In `t41.test.mjs`, R76's handle-change arm is re-pinned to membership R129. The test now checks:
- R76's registration with `membership.registerHandleGuard` is made at start, and a second registration is refused `LISTENER_DECLARED` naming `publication`. Both are unchanged.
- A change by a member whose work is in a published case, and a change by a member with none, are each refused `HANDLE_FIXED`, with no `case` or `edition`.
- The two answers are identical, so the published-work fact decides nothing.
- Nothing is written (whole-store snapshot), and both handles are unchanged.
- The control: `publishedWorkOf` still names the case for the first member and null for the second.

No requirement, capability or service changed. N909's hold before a split was not engaged.

**Flaws dealt with in my own module (P8).**
- Two comments in `index.mjs` said membership's handle change *asks* the guard: the factory's registration comment and `publishedWorkOf`'s doc. Under membership R125's T46 sentence no act asks it. Both now say the registration stands and is not asked while no handle is changed (R129). These are comment changes only.

Noted, and not changed:
- The R30 `test.todo` is the requirement's own "not yet met (D-246)".
- Several tests pin a row's declared `where` string (`invariants` :151, `t37` :136, `t39` :50, `t45` :46). That string is the exported catalogue row, part of the interface, so these are not source-text checks.
- The invariant tests for R25, R26 and R34 (`published.test.mjs` :175–211, `invariants.test.mjs` :164–181) sweep a chosen set of reads and answers rather than every one. **Deferred:** a full sweep needs an every-op harness, which is outside a test-only entry. Every live id is named and checked, and coverage passes.

**Other modules (no REPORT needed; for BOB's information):**
- `membership`'s requirements still cite the retired R124 in R125 ("R124 calls `fn`"), R128 ("fail closed, as R124"), R123 and R16 (the earlier handles). The T46 sentences decide in each case. This is text wording for BOB.
- `layers.md`'s T29 note says publication "drops sources, extraction and accepted-work". `modules.json` still lists `sources` and `accepted-work` among publication's uses, and the fixture builds them as test stand-ins forwarded to case-carriage.
- My change stales no generated artifact: the plane bundle composes `publication/index.mjs`, but only comments changed. The rebuild at layer close covers it.

**Tests and checks run** (on this commit, with `tranche/T46` merged):
- `node --test test/m/publication/t41.test.mjs` (in `bio-plane/`): before the change, tests 8, pass 7, fail 1 (the R76 arm, as MEMBERSHIP #35's J2 reported). After it, tests 8, pass 8, fail 0.
- `node --test test/m/publication/`: tests 142, pass 141, fail 0, todo 1 (R30).
- Process checks:
  - `checks/format.mjs`: 159 modules, 158 requirements files; 0 failures.
  - `checks/architecture.mjs … publication`: 30 product files; 0 failures.
  - `checks/coverage.mjs … publication`: 48 of 48 live ids named by a test; 0 failures.
  - `checks/ownership.mjs … publication tranche/T46`: 0 failures.
- `checks/run.mjs` over the product (K2950): architecture had 2,949 product files and 0 failures. Coverage had 33 failures, all in other modules (interface-*, screens-*, monitoring, notice-producers, op-grades, plan-work, setup-*, wizard-scripts) and none in publication. Format and channels had 0 failures.
- I changed no service I provide, so no user module's tests were due. No layer tests are named in the manifest.

Size (session_015HY6DrM4gxmJtgrtDXma3h): test runs 3, module lines 4,466.
