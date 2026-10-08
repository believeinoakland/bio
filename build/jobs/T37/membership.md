# membership (T37)

**Status** · session_01Cp2NRbxdmMxPhCZerTfGF4 · depth 2 · WORKING · handled B0

## J1 · QUESTION

`bio-plane/test/members.test.mjs` (my `tests` path) is red on `tranche/T37` before my change: it throws at :66 (0 of 96 run), unrecorded in rule 6 and in T36's close. Cause: T36-36 (admission R20 `CREDENTIAL_IN_ADDRESS`, R5 `MEMBER_TOKEN_RETIRED`; K2166). The suite sent every credential as `token=` in the address, and five arms used the shared `MEMBER_TOKEN`. No membership code is involved.

My best reading, applied in this job (P8: a flaw in my own module's tests); tell me if you want it otherwise:
(1) Transport only: the suite's `GET`/`POST` helpers lift `token=` out of the address into `Authorization: Bearer`. No assertion changes.
(2) The retired-token arms are re-pinned to admission R5's answer, never loosened. "member token cannot create members" now expects `MEMBER_TOKEN_RETIRED`. The D-157 arms "shared MEMBER_TOKEN receives no cover / still reads the handle roster / no cover reaches it" become one arm, "refused the roster, no `result`, no cover in the answer", plus "no cover value reaches it". "Nor can the shared machine credential" with `administer=true` now expects `MEMBER_TOKEN_RETIRED`. The roster read at :544 ("machine member token reads the roster", 2) moves to an ordinary member's session (`M2`), same count.
Result: members 95 pass, 0 fail (96 before: three asserts became two).
