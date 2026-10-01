# jurisdictions (T21)

**Status** · session_014nagcRH9hTKVppmJyfbM18 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I am building on; each answer only if you read it otherwise.

1. **M-188 (the county's 2026 list) is not written into the first profile.** K925 assigns it to no profile office, and R43 gives an entry either `offices` (a role or `{venue: <kind>}` of the profile) or none, and none means every office. With no office to name, the only way to write it would close every office on the county's days, which no source says. So the profile holds the court (M-189, `offices: [{venue: "records_petition"}]`), the City (M-190, `offices: ["Controller", "City Council", "City Auditor"]`, 09-09 and 11-11 left out) and the State (M-191, `offices: ["State Controller"]`); the Civil Grand Jury and the NextRequest venue have no 2026 entry, so a business count for them is undetermined. M-188 stays filed as a measurement.
2. **R44's `ruled` in the test profile takes the basis `TEST`.** R44 says "in a test profile, TEST" under `researched` only, but R22 makes every test-profile basis `TEST` and R45 asks for both statuses there; the only reading meeting all three is that `TEST` stands for either status in a test profile (and only there). Outside a test profile, `researched` needs every part of its basis to be `M-<n>` or a dated entry, `ruled` every part `D-`, `DEC-` or `K<n>`; `UNMEASURED` and a mixed basis are `BASIS_INVALID`.
3. **The court's `offices` is `{venue: "records_petition"}`, per R43**, not the venue's name string `"Alameda County Superior Court"` that M-189's ruling note writes. The requirement is the contract; M-189's wording may want aligning.
