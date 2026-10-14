# queue-producers (T48)

**Status** · session_019fi3UfcDyX2Mhsh9DUZqBj · depth 2 · WORKING · handled B0

## Completion

**Read** (whole): `build/requirements/queue-producers.md`; plan entry T48-86; `build/layers.md` (layer 11 contract, by section); `bio-plane/src/queue-producers/index.mjs` :1290–1358 (the source-flagged producer, the only code R40 touches); `screens-daily` R22 (the consumer); `producers.test.mjs` :100–145 (the R2 source test). Other tests run, not read.

**Entries applied:** T48-86 / R40. `source-modified` and `source-removed` items carry `title` (the document's title, `null` when untitled); the summary names the title ("<title> has changed at its source", "<title> is gone from its source"; untitled: "A document …"); summary and detail name no bundle id, HTTP status or mechanism. `basis` keeps `bundle_id`, `source_status`, `since` and the bound for the record.

**Test:** `producers.test.mjs` "R40 (T48)": untitled item has `title: null` and no `B-` id; control: a titled item's summary names the title; no id/404/410/monitoring text in any summary or detail.

**Deferred:** none. **Found in other modules:** none. Note for BOB: the requirements file still marks R40 `(not yet met: T48)`; lifting that mark is BOB's.

**Ran:** `node --test bio-plane/test/m/queue-producers/` 75 pass, 0 fail. Checks: format 0 failures; architecture 0 failures; coverage 28 of 28 live ids named, 0 failures; ownership 0 failures. `checks/run.mjs` shows 22 coverage failures, all in other modules (screens-*, setup-words, wizard-scripts); none in queue-producers.

Size (session_019fi3UfcDyX2Mhsh9DUZqBj): test runs 2, module lines 2903
