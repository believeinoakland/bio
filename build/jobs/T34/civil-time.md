# civil-time (T34)

**Status** · session_01P1fesUg99Ba4Qk6NUET8mr · depth 2 · COMPLETE · handled B1

## Completion (T34-3)

**Entries applied.**
- **N565** (K1566): `offsetAt` (`zone.mjs`) caches each zone's offsets keyed by the UTC hour. An hour whose two ends read the same offset holds it throughout; an hour holding a change keeps the change's second, found once by bisection, with the offsets either side, so changes off the hour (local mean time, quarter-hour zones) stay exact. The cache only remembers what the runtime answered (R26: same inputs, same answer); bounded at 200,000 hours per zone. New test (R1 R2): every second ±120 s around every 2026 change in the eight test zones, LA's 1883 LMT change (12:07:02) and Kathmandu's 1986 +05:30→+05:45, read twice (the second pass from the cache), agree with the runtime's own reading.
- **N603** (K1658; local-facts R2, R3): `calendar()` counts on a `factOf` answer's governing value whenever the answer says it is a correction (`corrected: true`, action-clocks R12's `factAnswer`), whatever the status reads now, as well as while it reads `corrected`; a value given as the whole entry counts by its `days`. The trace states it (R16, R25): the entry carries `governs: "correction"` (and `says`), the calendar's notes say "counted on a correction that governs on this instance, now <status>", and the rule's notes "counted on its correction, now <status>". A dispute still answers `FACT_DISPUTED`; a value not marked a correction is not counted on. Tests in R16.

**Measure (START):** M-X1a (`bio-plane/test/m/explore/mx1a.test.mjs`), explore's `elapsed`, before → after:
- seven-hop chain, 600 votes/yr: 4487, 4172, 4136 ms → 283, 266 ms
- council hub, 1,200 votes/yr: 181, 193, 200 ms → 15, 10 ms
- dense 5,000-node walk: 5170, 5618, 5909 ms → 293, 285 ms (about 15–20× faster)

**Deferred.** None.

**Found in other modules.**
- action-clocks: `count.mjs` `governedView` can now be dropped (T34-50, N603's user side), since civil-time counts on the governing correction itself. No change in behaviour while it stays (it hands civil-time the corrected days as the view's).
- Generated artifacts made stale by this change (mechanics §14): the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`) and the standalone checker `bio-plane/src/case-checker/program.mjs` (it bundles civil-time's `zone.mjs`, `calendar.mjs`, `rules.mjs`). Not written here.

**Tests and checks.**
- civil-time: 64 pass, 0 fail.
- Every module that uses civil-time (31): all 0 fail except scheduler 81/1, `R12: a run waiting on a request that reaches expired…`, the inherited red named in START (K1708). calc-grammar 29, connection-grammar 26, docprofile 56, doctypes 26, entities 82, events 44, lines 29, local-facts 33, standards 47, progressions 61, money 52, duties 30, people 35, explore 25, query-language 45, calculations 31, inquiry-grammar 49, inquiry 158, contradiction 119, ai-runs 69, answers 31, conformance 64, action-grammar 28, actions 88, action-clocks 51, monitoring 115, following 21, queue-producers 85, notice-producers 39, queue 125 (pass counts, 0 fail each).
- Layer tests: none named in `build/manifest.md`.
- `format`: 126 modules, 125 requirements files; 0 failures. `architecture civil-time`: 14 product files, 31 relative imports; 0 failures. `coverage civil-time`: 29 of 29 live requirement ids named by a test; 0 failures. `ownership civil-time tranche/T34`: 6 files changed; 0 failures.

Size (session_01P1fesUg99Ba4Qk6NUET8mr): test runs 9, module lines 1386

## J1 · COMPLETE

T34-3 applied (N565 offset cache per zone by the hour, exact at off-hour changes; N603 a governing correction counted whatever its status now, traced). M-X1a explore elapsed: chain 4136–4487 → 266–283 ms; dense 5170–5909 → 285–293 ms. civil-time 64/0; all 31 users 0 fail except scheduler R12 (inherited, K1708). format, architecture, coverage 29/29, ownership 6 files: 0 failures. Stales the plane bundle and case-checker program.mjs. action-clocks' governedView can go (T34-50). Record: build/jobs/T34/civil-time.md.
