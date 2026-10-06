# local-facts (T34)

**Status** · session_01Sf3T2zSYHW6geULZ8hLeeo · depth 2 · WORKING · handled B1

## Completion

**Entries applied.**
- **T34-19** (N562; K1563 (10); R6 as BOB worded it, K1746). `factPath` takes `list?`: a holiday entry of a named closure list (`jurisdictions` R47) has its own path, `<profile>/holidays/<year>/list=<name>[/<offices>]`, never the office calendar's path for the same year and offices; `parseFactPath` reads it back (a list name outside R47's `^[a-z][a-z0-9_]*$`, a second `list=`, or `list=` after the offices gives null). Each list's year is a fact as any holiday year is: it is listed by `factStatus`/`factsDue`, confirmed, corrected (validated as that entry's own `days`) and disputed apart from the office calendar's, with R3's horizons; withheld as a conflict it reads `absent`. `governingPath` keeps to the office calendar: an office's own holiday entry is never a named list's entry naming it (R6's signature takes no `list`).
- **T34-78** (DEC-149, local-facts' share). C-126.2's translation (`checks.mjs`:17) and the no-time-zone horizon `why` (`index.mjs`:265) reworded to need no name; `factStatus`'s list `note` (`index.mjs`:364) says "your group's Civicsmith transmits nothing". One test names each changed string and scans every answer a member reads.

**Deferred.** None.

**Found in other modules.**
- Inherited reds, each red on `tranche/T34` without this change (stashed and re-run): `control-plane` `catalogue-end.test.mjs` R43/R22, "ADMINS_FIRST lost its row" (membership retired the code at T34-10, R12; the snapshot's `changed.retired` does not list it); `op-declarations` `t33.test.mjs` R19/R6, "credentials: groupkeyset has no spec" (a T34 credentials op with no spec yet; L11's).
- Generated artifacts made stale (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` carry local-facts' source (C-126.2's old translation among it); BOB regenerates at the layer close.
- For `action-clocks` (T34-50) and `filings`: `factStatus({})` and `factsDue({})` now list a profile's named-list years too (the test profile gives nine facts, not seven). Their tests pass unchanged.

**Tests and checks.**
- `node --test bio-plane/test/m/local-facts/`: tests 38, pass 38, fail 0.
- Users of local-facts (progressions, retrieval, action-clocks, filings, affordances, queue-producers, control-plane, plane and `test/system/migrate-released.test.mjs`, with queue, civil-time, lines, membership's module-order, op-declarations and intent, whose tests name it): tests 1230, pass 1228, fail 2 (the two inherited reds above).
- `checks/format.mjs`: 126 modules, 125 requirements files; 0 failures. `checks/architecture.mjs … local-facts`: 11 product files, 32 relative imports; 0 failures. `checks/coverage.mjs … local-facts`: 9 of 9 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … local-facts tranche/T34`: 9 files changed; 0 failures.

Size (session_01Sf3T2zSYHW6geULZ8hLeeo): test runs 7, module lines 769
