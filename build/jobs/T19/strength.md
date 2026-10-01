# strength (T19)

**Status** · session_01SjzXY7cP7WiFCBXg3KiFsc · depth 2 · WORKING · handled B0

## J1 · QUESTION

B1's deletion of the catalogue's `STRENGTH_STATES`: confirmed over the repository first, as asked, and `converts.test.mjs`:10 is **not** its last importer. `civicos-ui/check-semantics.mjs`:77 (legacy-tests, layer 11) also imports `STRENGTH_STATES` from `bio-plane/checks/bio-checks.mjs` (with ten other names), and compares it with app.html's copy at :354 and :364. Seventeen `civicos-ui/test/*` suites run that script. Deleting the export would break its module link (`does not provide an export named`) before anything runs. No other importer at HEAD: ratification reads strength's own (K691/K692). The bundles take it only through the plane's source.

My reading: I make every rule-1 re-point and drop the parity arm at `converts.test.mjs`:10, so no strength file imports `bio-checks.mjs`. I **hold** the catalogue's `STRENGTH_STATES` under rule 1 for legacy-tests' importer, record it as found in another module, and do not delete it. The fix is a one-word re-point in `check-semantics.mjs`, to `../bio-plane/src/strength/index.mjs`, in legacy-tests' L11 job. After that, legacy-index or legacy-checks deletes the copy. Once the parity arm is gone, nothing checks that the catalogue's copy agrees with strength's, so the held copy could drift. It has not changed since T7.

Alternative, if you rule it: you widen my write to that one import line. I am going ahead on my reading. This answer does not change what I build next.
