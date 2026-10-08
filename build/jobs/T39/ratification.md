# ratification (T39)

**Status** · session_01Ky2nmjoLmrWwGBPjKWFCBF · depth 2 · WORKING · handled B3

## J1 · COMPLETE

T39-13 (N805) done on `job/T39/ratification` (`ab78f16297`, then a tidy commit; no merge of `tranche/T39` needed, no file I read changed there).

**Entries applied**
- **R42 (N805; K2308):** a refusal of the commit itself (publication R51, R58, R59, R57's C-122.6 `PHOTO_MARKS_CHANGED_SINCE`, and C-122.7 once T39-11 lands) was already a stop, `SCHEDULED_CHECK_REFUSED` (C-58.10), with `cause.code` and `cause.translation`. But `refusedStop` (`schedule.mjs`:183–193) dropped the refusal's `check`. It now carries `check` too, exactly as the commit answered it, and only when the refusal has one: a row-less refusal such as `CASE_EDITION_ALREADY_RATIFIED` gets no `check: undefined`. C-122.7 needs nothing more here: it is relayed the same way as soon as publication answers it.
- **R39 (wording):** no code change. A member document's copy is held at `<store>/obscured/<sha>`, beside a photo's (case-carriage R15 and its T39 note), so `copyMaterials`, keyed on `held: "derived"`, already copies it. The comment (`ops.mjs`:233–238) now names it.

**Test (R42 as worded):** `scheduled-commit.test.mjs`, over the real publication (R66, R67) and the real case-carriage (reached through publication):
- a real PNG is marked twice and carried as its copy;
- the edition is signed through `op=publishat` into the real waiting list;
- the mark is withdrawn after signing;
- `publication.publishDue` runs past the time.

It finds the edition `stopped`: one reason, C-58.10, whose `cause` is `{code: PHOTO_MARKS_CHANGED_SINCE, check: C-122.6, translation: <that row's translation>}`. Nothing is committed. Negative control: with the marks as signed, the same edition publishes. Without the fix, the test fails on `cause.check`; that failure was reproduced. To run it, `fixture.mjs`'s `world()` takes an optional `carriage` ({bucket, store}) and forwards it to publication.

**Fixed in my own module, from the reader's summary:**
- Two test titles named the retired R38. They now name R8 (case-catalogue R3).
- Two comments in `checks.mjs` still said "awaiting T35's stamp". The note is removed.

**Reading set:** over 300 KB, so (3).
- I read whole:
  - my requirements;
  - layer 8's row of `layers.md`;
  - `index.mjs`, `schedule.mjs`, `schedule.test.mjs` and `fixture.mjs`;
  - publication R57, R66 and R67, and its `schedule.mjs` (`scheduleEdition`, `publishDue`, `takeOne`) and C-122.6's row;
  - case-carriage's Purpose, R1, R13, R15–R16 and `marksLapsed`;
  - publication's `t38.test.mjs` setup.
- One worker read in full the other five source files and the other 17 test files, with my requirements. Its summary, about 5.9 KB, cites file and line for every statement. It found no test deep-equalling a stop or cause (so adding `check` breaks nothing), plus the items fixed above.

**Deferred:** none.

**Other modules:** none. Publication R67's T39 clause, recording `check` and `cause` as given, is already built (`publication/schedule.mjs` `takeOne`).

**Tests and checks run**
- `node --test test/m/ratification/`: tests 218, pass 218, fail 0 (twice, after each commit). No layer tests are named; no service another module uses changed.
- format: 0 failures.
- architecture: 0 failures.
- coverage: 47 of 47 live ids named, 0 failures.
- ownership: 8 files, 0 failures.

**P6:** 3,543 lines (3,540 at START).

Size (session_01Ky2nmjoLmrWwGBPjKWFCBF): test runs 5, module lines 3543

## J2 · COMPLETE · re B2

B2 (CHANGE, K2370) done. I merged `tranche/T39` at `3cd773ce11`; R42's re-wording read.

**Applied**
- **R42.** A refusal of the commit itself now stops with one `SCHEDULED_CHECK_REFUSED` (C-58.10) entry per refusal the commit answers.
  - `commitStops` (`schedule.mjs`) maps each entry of the commit's `refusals`, in its order. With no `refusals` list, it maps the single top-level refusal.
  - Each `cause` is that refusal's own `code`, `check`, `translation` and `detail`, through `refusedStop`.
  - `#publishScheduled` uses it at the commit's refusal (`index.mjs`:869).
- **R3.** No code change. Both halves already relay the commit's refusal whole: the store half returns it, and `caseRatifyOp` spreads it into its 409. So `refusals` reaches the caller as the commit answered it. Now tested.

**Tests** (`scheduled-commit.test.mjs`), built against publication's stated shape until its merge: a commit stub answers C-122.6 and C-122.7, each `{reason, code, check, translation, photos|documents, detail}`, the first also at top level.
- Over the real `publishDue`: two reasons, each C-58.10, with causes `[PHOTO_MARKS_CHANGED_SINCE C-122.6, DOCUMENT_COPY_CHANGED_SINCE C-122.7]`, in the commit's order and with their own translations. A lone C-122.7 with no list gives one entry. Nothing is committed. Before the fix, this test fails.
- R3: `ratifyCaseDocument` answers the commit's refusal deep-equal, and `caseRatifyOp`'s 409 body carries the same `refusals`.
- The earlier real-photo test still passes.

When publication merges, I merge the tranche again and re-run as you say. My test uses a placeholder translation for C-122.7's row; when that row lands I will switch it to publication's `rowOf`.

**Tests and checks run**
- `node --test test/m/ratification/`: tests 220, pass 220, fail 0.
- format: 0 failures.
- architecture: 0 failures.
- coverage: 47 of 47, 0 failures.
- ownership: 9 files, 0 failures.

**P6:** 3,552 lines.

Size (session_01Ky2nmjoLmrWwGBPjKWFCBF): test runs 8, module lines 3552
