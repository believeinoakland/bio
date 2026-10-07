# civil-time (T35)

**Status** · session_01FWZ869SsVrV3mffbRFWTNY · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied: T35-2** (N690; K1847, DEC-149; req: none). `calendar.mjs`:78 "is disputed on this instance" → "is disputed in your group's Civicsmith" and `cannot be read on this instance${…}` → `cannot be read in your group's Civicsmith${…}`; :112 `counted on a correction that governs on this instance, now …` → `… governs in your group's Civicsmith, now …`; :113 `counted on a calendar corrected on this instance${…}` → `… corrected in your group's Civicsmith${…}`. `recurrence.mjs`:197 (an occurrence of a recurrence) stays, as the sweep says. The two code comments at `calendar.mjs`:2 and :30 that say "on this instance" are not member-facing text and are not sweep rows; left as they are. No interface or requirement changes.

**Tests.** New test in `rules.test.mjs`, "R16 R25 DEC-149: …", checks each of the four strings whole (disputed; unreadable with and without a why; a governing correction; a corrected calendar with and without member and day) and that no answer says "this instance" or "the plane". The two R16 assertions that pinned the old wording are re-worded to the new.

**Found in other modules (REPORT J1):**
- `action-clocks`: `bio-plane/test/m/action-clocks/factreader.test.mjs`:64 (`/disputed on this instance by member:bob/`) and :112 (`/cannot be read on this instance: local facts' read failed: storage gone/`) pin civil-time's old wording, which reaches them through `computeDeadline`'s why. With this change action-clocks is 51 pass, 2 fail (53/0 before); each needs "this instance" → "your group's Civicsmith". Its test comment `calendar.test.mjs`:2 says the same words (not an assertion).
- Generated artifacts made stale (mechanics §14): `bio-plane/src/case-checker/program.mjs` and `bio-plane/dist/bio-plane.bundled.mjs` both embed `civil-time/calendar.mjs`; regenerate at the layer's close (K1540's order).

**Deferred:** nothing.

**Tests and checks run:**
- `node --test bio-plane/test/m/civil-time/`: tests 65, pass 65, fail 0.
- `node --test bio-plane/test/m/action-clocks/`: pass 51, fail 2 (the two above; 53/0 on the tranche).
- `format`: 129 modules, 128 requirements files; 1 failure (test-support's `make-zip.mjs`, accepted red 13).
- `architecture civil-time`: 14 product files, 31 relative imports; 0 failures.
- `coverage civil-time`: 29 of 29 live requirement ids named by a test; 0 failures.
- `ownership civil-time tranche/T35`: 0 failures (run after the commit below).

Size (session_01FWZ869SsVrV3mffbRFWTNY): test runs 5, module lines 1386

## J1 · REPORT

action-clocks: factreader.test.mjs:64 (/disputed on this instance by member:bob/) and :112 (/cannot be read on this instance: local facts' read failed: storage gone/) pin civil-time's old wording, which reaches them through computeDeadline's why. After T35-2 action-clocks is 51 pass, 2 fail (53/0 on tranche/T35); each regex needs 'this instance' -> 'your group's Civicsmith'. Its comment calendar.test.mjs:2 says the same words. Generated artifacts made stale (§14): bio-plane/src/case-checker/program.mjs and bio-plane/dist/bio-plane.bundled.mjs (both embed civil-time/calendar.mjs).
