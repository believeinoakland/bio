# monitoring (T46)

**Status** · session_01WcnbxryvVs5QhjBgBUaUPA · depth 2 · WORKING · handled B0

## Completion (MONITORING #19)

**Read.** My requirements, whole. The plan entries T46-41 and T46-32/T46-34, and B1. My code, whole: `index.mjs`, `checks.mjs`, `schema.mjs` (P20; no flaw found beyond what is below). The reading set at START was 1,354 KB, over the 600 KB limit (mechanics §17 (3)), so two helpers in this session each read their part whole and wrote me a digest citing every section. The sources stay binding, and I went back to them where it mattered.
- One helper read every file under `test/m/monitoring/`.
- The other read the public parts of all 26 used modules and layer 10's contract in `build/layers.md`.
- From source myself: `action-clocks` `pendingClocks`/`dueAtOf` (R1, R19) and `actions` `dueInstant` and its R33/R98 bound.

**Applied** (T46-41; R73, amending R34 and R50):
- **R34 and R50 read a timed entry's instant from the `pendingClocks` item.** The new module function `dueInstantOf(item)` reads the item's `due_at` on its own date, in its `due_zone`. It replaces `#dueInstant`, which read the action's document. Neither `deadlineRecheck` nor `deadlineRecheckWake` reads an action's document for the instant any more.
  - An item answering both null is a date-only entry.
  - A wall time the zone skips or repeats is read by its date alone and never marked early.
  - The wake loop's document-read pruning is gone with the document read.
- **R34's time-of-day arm is met through `actions` R98.** The two `test.todo` tests are now tests naming R34 and R73.
- The T45 interim test is retired. It asserted that the 12:01 mark is refused `CLOCK_STATUS_NOT_MECHANICAL` and lands the next day, which R98 makes false. The "never early" half of it is kept by the 11:59 control.
- **New tests naming R73:**
  - The instant comes from the item, not the document: an item stripped of its time of day is read by its date alone though the document states one. The control is the item as action-clocks answers it, marked at its instant.
  - The wake reads each item's own instant with the document read made to throw. Cases: an item in its own zone; seconds; both null; no fields; `due_at` with no zone; a time not on its date; an unreadable zone.
- **Reading (R73 does not state it):** an item with `due_at` but `due_zone` null, which happens when no zone is held for the action, is read by its date alone. It is never read in another zone and never marked early.

**Found in other modules / artifacts** (REPORT J1):
- `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from my change to `src/monitoring/index.mjs`. It is regenerated at layer close.
- `actions` R98 reads the zone of a timed entry with no `due_zone` from R12's place (the instance's view). `action-clocks` R19 answers the action's zone (`actionZone(fm, view)`). Where these differ, monitoring could send a mark that actions refuses. That mark is reported `failed` and held to the next local day (N429), never a loop, but the two should read one zone.
- `dueAtOf`, which `actions` R98 names, is stated in no requirement of `action-clocks`. It is a private helper there.
- My own requirements' Uses names civil-time `localDay`, `dayRange` and `isCalendarDate`, but the code also uses `bounds` (R2) for the instant. It is an existing edge, so only the wording is missing. The R34/R73 "not yet met" marks are BOB's to clear.

**Deferred:** none.

**Tests and checks.**
- monitoring: 137 pass, 0 fail, 0 todo.
- The users' suites, as a guard: following 73/0, link-sweep 29/0, scheduler 129/0, machinery-producers 24/0, queue-producers 74/0.
- format, architecture (monitoring), coverage (60 of 60 live ids) and ownership (3 files): 0 failures each.
- `checks/run.mjs` over the product: architecture 0 failures, format 0, channels 0. Coverage shows 17 failures, all in other modules (layer 11 and inherited); none are monitoring's.

Size (session_01WcnbxryvVs5QhjBgBUaUPA): test runs 9, module lines 3682

## J1 · REPORT

Found outside monitoring (details in my record's Completion): (1) bio-plane/dist/bio-plane.bundled.mjs is stale from src/monitoring/index.mjs, for layer close. (2) actions R98 reads an unzoned timed entry's zone from R12's place, action-clocks R19 from the action's zone (actionZone); where they differ monitoring's mark is refused and held a day (N429). They should read one zone. (3) dueAtOf, named by actions R98, is stated in no action-clocks requirement. (4) My Uses omit civil-time bounds (an existing edge, wording only).
