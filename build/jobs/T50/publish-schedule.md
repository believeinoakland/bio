# publish-schedule (T50)

**Status** · session_01BBPoRLfr22hvrayRJTSbv9 · depth 2 · COMPLETE · handled B0

## J1 · REPORT

For BOB (requirements are yours, so nothing is edited here):
1. R1's text still carries the marker *(not yet met: T50)* on its governing-zone sentence. The zone is now read as retrieval R69 reads it (local-facts first, then the profiles), and the tests named R1 in test/m/publish-schedule/zone.test.mjs pass. Please strip the marker.
2. Side effect, same as retrieval R69 notes: the first zone read in a store makes local-facts' instance, which creates its empty local_fact_acts and local_rule_acts tables. No rows are written. The plane makes every module at boot, so this does not arise there. Tests assert that a refusal writes nothing after the instance exists.
3. Not run: the product-wide checks show 33 coverage failures in other modules (screens-*, installer, interface-shell, etc.), none in publish-schedule. Architecture reports 0 failures.

## J2 · COMPLETE

Entry applied: T50-84 (R1's governing zone, read as retrieval R69 reads it: local-facts' governing value for each active profile's time_zone when the profiles agree, else the profiles' own time_zone through jurisdictions.combine, else none, never UTC; two profiles governing different zones govern none). Code: bio-plane/src/publish-schedule/schedule.mjs (groupZone) and index.mjs (a localFacts dep, default localFactsOf(host), lazily read). Tests: bio-plane/test/m/publish-schedule/zone.test.mjs (four tests naming R1: profile zone; a local correction governing; no profile held, refused and writes nothing; two disagreeing profiles, refused and writes nothing), with the earlier module tests unchanged.
Deferred: none. Found in another module: none; the only other entry, T50-83 (ratification), reads the same zone, and this module's zone code is its own.
Commit 55372f55bd pushed to job/T50/publish-schedule.
Tests: node --test test/m/publish-schedule/ → tests 26, pass 26, fail 0.
Checks (civicos-process, product /home/user/bio): format 0 failures; architecture publish-schedule 0 failures (10 product files); coverage publish-schedule 11 of 11 live ids named by a test, 0 failures; ownership tranche/T50 0 failures; checks/run.mjs: 33 coverage failures, all in other modules (none in publish-schedule), channels 0 failures.
Size (session_01BBPoRLfr22hvrayRJTSbv9): test runs 4, module lines 619
