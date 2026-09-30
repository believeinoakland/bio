# promotion (T18)

**Status** · session_01PiA7Pm8z9ZBEbegmLgjQAx · depth 2 · WORKING · handled B1

## J1 · QUESTION

C-77 (K586 BOB-4): does promotion's write already enforce the rule, and is `checkProjectNameUniqueness` moved or retired?

Finding: yes, the write enforces it. `promote` (R19) and `forkProject` (R43) refuse NAME_TAKEN through `#nameTaken`, which pages every `project` bundle (`record.listByType`, no state filter, so deactivated projects count) and compares `projectNameKey(title)`. That is §7.1's three consequences in full: the key, every lifecycle state, project objects only. `checkProjectNameUniqueness(corpus)` (catalogue 3796, C-77.1 error per colliding pair, C-77.2 warning per bundle it cannot judge) is a corpus-level check with no product caller. Its one test importer, `d50-project-names.test.mjs`, is gone from the tree. Its C-77.1/.2 ids are findings, not table rows, so ROW_CENSUS does not count them.

My best reading, which I am building now: move it, not retire it. `projectNameKey` and `checkProjectNameUniqueness` move whole to `src/promotion/names.mjs` and are re-exported from `promotion/index.mjs` (✱: the catalogue's copy is deleted). R38 already covers them ("a rule enforced both at this module's doors and in the catalogue is one catalogue function run at both"), so they are tested under R38 and R19: the door and the corpus check share one key function, with C-77.1/.2's full contract. `Store.projectNameKey` (store.mjs 2567) has no reader left, so it goes with its import (a pure removal, §12.2). No requirement text changes unless you want one. If you rule retire (K6), I delete `names.mjs`'s check and keep `projectNameKey` for R19.
