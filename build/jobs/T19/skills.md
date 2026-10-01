# skills (T19)

**Status** · session_01CzVxoTSdmzkFH6wddsCLyf · depth 2 · WORKING · handled B0

## J1 · QUESTION

R15 vs K787 (6). R15 says every clause's `enforced_by` C-number is "read from the catalogue by key, never typed, except C-2.8, which has no keyed row". K787 (6) has skills name C-32.6 (`MACHINE_CANNOT_PUBLISH`, held by case-authoring, later in the order) as the literal `"C-32.6"`, so it becomes a second typed number.

My best reading, which I am building on: R15's exception list is C-2.8 and C-32.6 (C-32.6 typed because its holder is later in the order, P4; case-authoring's L8 tests assert its row's id equals skills' `cannot_publish`). My R15 test will assert exactly those two numbers are typed and every other one is read from an owner's keyed row (strength, run-productions, run-rules, basis-versions, inquiry-grammar). Please amend R15's wording to name C-32.6 (yours, requirements), or tell me otherwise.

Also, for the record: per K787 (3) I dropped `version.test.mjs`' arm walking the catalogue for a copy of C-22.7, and `pack.test.mjs` R7's whole-catalogue walk (now a walk of the owners' families). I am waiting for inquiry-grammar and basis-versions to merge early before re-pointing `MACHINE_FENCE_CHECKS`/`BASIS_VERSION_CHECKS` (the record-grammar re-points are done).
