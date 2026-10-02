# control-plane (T24)

**Status** · session_01WYCVoGouBeS6W17LzRHYia · depth 2 · WORKING · handled B1

## J1 · COMPLETE

All three entries are applied, plus K1207, in 0b4bacf54a. **Merge me after op-declarations:** my routes read its lists, and `option-preview.test.mjs` needs its R11 declaration.

**Entries applied**
- **(1) N506, R45 `sweeps`.** The door forwards `sweeps` to the store route of that name, stamped `viewer` through `ACTION_LAYER_READS`. op-declarations' branch now fills that list from `LINK_SWEEP_READS`. `r45-routes.test.mjs` takes the route from link-sweep's own map (`linkSweepOps`) and checks that monitoring's map no longer holds `sweeps`. Reaching the store needs plane's L11 composition of link-sweep's map. You can strike R45's "not yet met: T24" mark at merge.
- **(2) N490, `optionstartpreview`.** op-declarations puts it in `ACTION_PLANS_PREVIEWS`, inside `QUERY_AUTHOR_ACTIONS`. So the door stamps `author` (the positional identity, `optionstart`'s expression) and `viewer` with no change to the door's code. The new `option-preview.test.mjs` covers the op:
  - its spec and both session sets;
  - that it is a route of action-plans' own map;
  - that it is forwarded in the caller's namespace, for all six callers;
  - its stamps, with every stamp forged, in GET and POST;
  - that its stamps equal `optionstart`'s.
  
  Negative controls: the daemon class is refused `CLASS_FORBIDDEN` with nothing forwarded; near names are `UNKNOWN_OP`; action-plans' `plan` read carries no `author`. If the op is placed among the reads only, the test goes red; I tried that against a local copy.
- **(3) N502.** `checks.mjs`:55 now says C-69.4 was stamped by 1.44.0. `checks.mjs`:121 now says C-61.1's move was stamped by 1.49.0.
- **K1207.** `CHECK_FAMILY_FILES` gains `src/link-sweep/checks.mjs` after monitoring. `families.test.mjs`:47 (R22) is green. A new test, named R22 and R43, checks:
  - the file's place in the list;
  - that each of C-18.16–C-18.18 is decorated with its own row;
  - that monitoring's file no longer holds those rows.
  
  Negative control: the list without link-sweep's file misses `SWEEP_CHECKS`.
- **Re-scan (N469's rule), re-worded in `index.mjs`.** These notes named retired things as if they were live:
  - five store methods named as `Store#…`/`Store.…`: `inSight`, `rosterInSight`, `memberAdd`, `ROOT_ADMIN`, `sessionRights`. They are membership's now, and the comments say so. The member-list read is now worded as "membership's member list".
  - "the session block above" and "`op=export` … in this file". These now point to admission's session resolution and admission's export refusal.
  - "the catalogue's `normalizeType`", twice. It is record-grammar's.
  - "`op=affordances`/`op=queue` … their own handlers above", three times. Those handlers are reached through plane's hooks.
  - "monitoring's `sweeps`". It is link-sweep's.
  
  Past-tense history notes are left as they are.

**Rows.** I added or changed no catalogue row, so there is nothing `awaiting stamp` (red 5).

**Deferred.** Nothing.

**Other modules and artifacts**
- **Generated artifact.** My change under `bio-plane/src/control-plane/` stales the plane's bundle (`bio-plane/dist/bio-plane.bundled.mjs`). I regenerated nothing.

**Runs**
- `test/m/control-plane/` on my branch: 126 tests, 124 pass, 2 fail. Both fails are `option-preview.test.mjs`, waiting on op-declarations' R11. With op-declarations' branch file in place (temporarily, not committed): 125 pass, 1 fail. That fail is `declarations.test.mjs`' affordances totality, which is red 6.
- Whole `test/m` on my branch: 5,278 tests, 5,259 pass, 8 fail, no skips. The fails:
  - the 2 preview tests above;
  - affordances `catalogue.test.mjs`:524 and :903 (red 6);
  - plane `compose.test.mjs`:101, `door.test.mjs`:183 and `notices.test.mjs`:140 (red 7: the sweep composition, and op=queue through the plane);
  - plane `notices.test.mjs`:33, the test holding line 39 (red 9).
- **Checks.** format: 88 modules, 0 failures. architecture: 36 files, 0 failures. coverage: 29 of 29 ids. ownership: 7 files, 0 failures.

Size (session_01WYCVoGouBeS6W17LzRHYia): test runs 9, module lines 3529
