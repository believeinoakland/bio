# machinery-producers (T48)

**Status** · session_018zbHQNu1aoAASfEkUGvrde · depth 2 · WORKING · handled B1

## Completion

**Read, whole**: `build/requirements/machinery-producers.md`; the module `bio-plane/src/machinery-producers/index.mjs` (1,097 lines before); the test `world.mjs` and the first 70 lines of `conditions.test.mjs` (the other tests are run); of `instance-setup` R89, R90 only the notice read; `membership` R86; `queue` R54; `plane` R52; the T48 plan's entry T48-58.

**Entries applied**: T48-58, R11 and R12. `conditionItems` also answers an active administrator the `OBLIGATION::update-ready::<version>` item for the ready release in `deps.updateNotice()`; a failed or absent read answers no item and `facts: {failed: ["update-ready"]}` (the key is present only then, so R1's `{items}` answer is unchanged otherwise). New `update.test.mjs` (5 tests: R11 x4, R12 x1); `world.mjs` takes `updateNotice`.

**My readings of what the requirements leave open** (carried on, none blocks): (1) `detail` of the to-do is the object `{version, date, security}`, since R11 says it "carries" those for the interface's words (every other item's `detail` is a string); (2) `updateNoticeState()`'s `decisions` is a list of `{version, kind: start|later|skip, at, until?}`, read together with `ready.decision` (R89); the latest by `at` on the ready version decides; `until` may be an instant or a calendar day (a day is read on the local day, R10, at UTC+14 if no zone is held); (3) the to-do's `recipients` lists the active administrators; `case` is the ungrouped home set; `subject` is `{kind: "release", version}`; its sentence is my draft, the interface's words are BOB's.

**Deferred**: none. **Found in another module**: none. The requirements file's "not yet met: T48" marks on R11 and R12 are BOB's to clear.

**Ran**: `node --test bio-plane/test/m/machinery-producers/` 29 pass, 0 fail. `checks/format` 0 failures; `checks/architecture` 0 failures; `checks/coverage` machinery-producers 12 of 12 ids named; `checks/ownership` 0 failures. `checks/run.mjs`: format and architecture 0 failures; its coverage reds (22) name other modules, none machinery-producers.

Size (session_018zbHQNu1aoAASfEkUGvrde): test runs 3, module lines 1202
