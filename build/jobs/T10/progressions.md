# progressions (T10)

**Status** · session_01AUvfDhJvdEvaWM3SYVnhr6 · depth 2 · WORKING · handled B1

## J1 · QUESTION

**N118's "C-100 stops minting rows" against R27 and K275.** N118 says C-100 stops holding rows for `NOT_FOUND`, `NO_ENTITY`, `NO_KEY`, `NO_LABEL`, `NO_SHA`, `NO_SUCH_ENTITY`, `NOT_A_DISPOSITION` (other modules mint them for other conditions; the DEC-49 guard's arm G flags exactly these seven, plus `LISTENER_DECLARED`, as PROGRESSION_CHECKS codes minted elsewhere). R27 says every refusal carries its code, row and translation; K275 (later) says a code minted for a module's own condition is renamed in that module's requirements. R1, R5, R6, R9, R14, R15, R19, R21 still name these codes.

**My best reading, which I am building now:** keep the codes as R1–R21 name them (no rename: that would be a requirement change, yours); drop their six rows from C-100 (`NO_SUCH_ENTITY` goes to entities' R36 row, N208; `LISTENER_DECLARED` to membership R81, N202), and answer them as row-less generic codes `{ok: false, reason, code, detail, …}` under the catalogue's REC-64 rule, as K163 did for `NO_TARGET`/`NO_SUCH_BUNDLE` (run-productions R13 excepts them). R27 then needs your wording of that exception (as run-productions R13 has); my R27 test states it: every code this module answers either carries its row or is one of the named generic codes. None of the seven is in the guard's surface reach through anything but C-100 except `NOT_FOUND`, which content's `NOT_FOUND` row still covers, so the reach ratchet does not move.

**The alternative** (K275's): rename each to a code of its own (`PROGRESSION_NO_KEY` …) with a row each; say so and I rename.

Every other C-100 code stays, each `where` naming one function and one marked region wrapping the whole refusal (N242); a code minted in several of this module's functions (`NO_SUCH_PROGRESSION`, `NO_STAGE`, `BAD_STAGE`, `NO_CAPTURE`, `NOT_CONCERNED`, `NO_REASON`) converges on one private helper that holds its region (K231).
