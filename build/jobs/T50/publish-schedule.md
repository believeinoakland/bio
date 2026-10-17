# publish-schedule (T50)

**Status** · session_01BBPoRLfr22hvrayRJTSbv9 · depth 2 · WORKING · handled B0

## J1 · REPORT

For BOB (requirements are yours, so nothing is edited here):
1. R1's text still carries the marker *(not yet met: T50)* on its governing-zone sentence. The zone is now read as retrieval R69 reads it (local-facts first, then the profiles), and the tests named R1 in test/m/publish-schedule/zone.test.mjs pass. Please strip the marker.
2. Side effect, same as retrieval R69 notes: the first zone read in a store makes local-facts' instance, which creates its empty local_fact_acts and local_rule_acts tables. No rows are written. The plane makes every module at boot, so this does not arise there. Tests assert that a refusal writes nothing after the instance exists.
3. Not run: the product-wide checks show 33 coverage failures in other modules (screens-*, installer, interface-shell, etc.), none in publish-schedule. Architecture reports 0 failures.
