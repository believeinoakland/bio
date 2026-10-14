# following (T48)

**Status** · session_01QH7GDMqWRepVCj3VBS4ktb · depth 2 · COMPLETE · handled B1

## Completion (T48-53)

**Read, whole:** `build/requirements/following.md`; `build/manifest.md`; the T48 plan's L10 entries; `build/layers.md` (layer 10 contract); all of `bio-plane/src/following/` (`index.mjs`, `checks.mjs`, `schema.mjs`); the test files that name a requirement I changed (`registers.test.mjs`, `checks.test.mjs`) and the fixture. Of the modules I use, only the services my entries touch: `events` (`followedRegister` and its R38 body, `eventsFor`, `proceedingStatusAt`, `readEvent`'s event view), `entities` (`noSuchEntity`, `notAProceeding`, `readEntity`), `actions` (`actionsFor` with `proceeding`, its R65 refusal site), `action-clocks` (`ourDeadlines`, its R18).

**Entries applied (T48-53):**
- **R29** `followRegister` takes `proceeding` (an entity of kind `proceeding` the author may see). Refusals after R7's and before R22's `WATCH_END_REFUSED`: absent or unseen `NO_SUCH_ENTITY` (one answer, `entities.noSuchEntity`), another kind `NOT_A_PROCEEDING`. The proceeding is held in the follow's subject (no new column). Each read of such a follow hands the newest capture to `events.followedRegister({captureSha, proceeding, by})` as the machine: a tick's read (an unchanged read too, so an import events refused is asked again), and `refreshRegister` (the answer states what events answered in `register_import`). A refusal events answers is counted in the tick's `failed` with its reason; the read is `failed`, `last_read` is not moved, so the follow stays due. `follows` answers `proceeding` per follow, or null.
- **R30** `proceedingDates({proceeding, from?, to?, viewer})` (`op=proceedingdates`), two lanes: `proceeding` (`events.eventsFor`'s placed events then those placed nowhere, each with its `when`, kind, label and captures, and `events.proceedingStatusAt` for today) and `group` (`action-clocks.ourDeadlines` entries whose action is in `actions.actionsFor({proceeding})`, both paged and bounded). Each lane at most 500 items, `truncated`. No lateness, writes nothing. `from`/`to` bound both lanes; a non-day or inverted pair is refused `BAD_PROCEEDING_DATES` (new row C-137.26, my `checks.mjs`).
- **R31** `NOT_A_PROCEEDING` is `entities.notAProceeding`'s answer in both places; this module mints none and holds no row for it (the `action-grammar` row R29 first named is superseded by R31, so `action-grammar` is not imported).

**Best readings (no QUESTION posted; none decided what I would build next):** the "label" of a lane event is the event's stated place (`where`), else its kind (events holds no other label); `when` undetermined is stated as `when: null, when_undetermined: true, why`; the group lane drops `ourDeadlines`' `past` flag and says (R30 "states no lateness"); `BAD_PROCEEDING_DATES` is a new refusal because R30 names no row for a bad bound.

**Deferred:** none.

**Found in other modules (for BOB):**
1. `op-declarations` / `op-grades` / `store-door`: `proceedingdates` is a new op served by `followingOps`; it needs its spec and grade in L11 (their tests do not yet know it; their 14 reds at this head are the same 14 as before my change).
2. `modules.json`: `following`'s `uses` lists `action-grammar`, which this module does not import after R31 (architecture shows 0 failures; the edge is now unused). Requirements' Uses text for R29 still names it.
3. Row census: C-137.26 `BAD_PROCEEDING_DATES` is a new row (accepted red 5 (2), until T49's stamp).
4. Inherited, environment: `test/m/following/checks.test.mjs` shows a file-level failure from `journey-check` (`playwright-core` not installed in this container; its walk imports every plane file); all 27 of its own tests pass. Same before my change.

**Tests and checks:**
- `node --test test/m/following/` (from `bio-plane/`): 87 tests, 86 pass; the one failure is the file-level `playwright-core` import above, not a test of this module. New `proceeding.test.mjs`: 12 tests, 12 pass (R29: hand-over by tick and by refresh with events' real writes concerning the proceeding, control without `proceeding` hands nothing, refusals and their order each with controls, events' refusals counted in `failed` and the follow stays due; R30: two lanes with the other-proceeding and body-owed controls, bounds, 500 with `truncated` across pages, placed-nowhere, sight, refusals; R31: entities' own answer). `checks.test.mjs` gains the C-137.26 case.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage for `following` 31 of 31 live ids named; (other modules' coverage failures are not mine). `node checks/ownership.mjs /home/user/bio following tranche/T48`: 6 files changed, 0 failures.

Size (session_01QH7GDMqWRepVCj3VBS4ktb): test runs 9, module lines 1986

## J1 · COMPLETE

T48-53 complete: R29, R30, R31 met; following's tests pass (87, one file-level playwright-core import failure inherited from journey-check's walk); format, architecture, coverage (31/31), ownership 0 failures. For BOB: proceedingdates needs its op spec and grade (op-declarations, op-grades, store-door); new row C-137.26 BAD_PROCEEDING_DATES (census, accepted red 5 (2)); action-grammar edge in following's uses is now unused. Details in the record.
