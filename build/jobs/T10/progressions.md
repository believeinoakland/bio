# progressions (T10)

**Status** · session_01AUvfDhJvdEvaWM3SYVnhr6 · depth 2 · WORKING · handled B1

## J1 · QUESTION

**N118's "C-100 stops minting rows" against R27 and K275.** N118 says C-100 stops holding rows for `NOT_FOUND`, `NO_ENTITY`, `NO_KEY`, `NO_LABEL`, `NO_SHA`, `NO_SUCH_ENTITY`, `NOT_A_DISPOSITION` (other modules mint them for other conditions; the DEC-49 guard's arm G flags exactly these seven, plus `LISTENER_DECLARED`, as PROGRESSION_CHECKS codes minted elsewhere). R27 says every refusal carries its code, row and translation; K275 (later) says a code minted for a module's own condition is renamed in that module's requirements. R1, R5, R6, R9, R14, R15, R19, R21 still name these codes.

**My best reading, which I am building now:** keep the codes as R1–R21 name them (no rename: that would be a requirement change, yours); drop their six rows from C-100 (`NO_SUCH_ENTITY` goes to entities' R36 row, N208; `LISTENER_DECLARED` to membership R81, N202), and answer them as row-less generic codes `{ok: false, reason, code, detail, …}` under the catalogue's REC-64 rule, as K163 did for `NO_TARGET`/`NO_SUCH_BUNDLE` (run-productions R13 excepts them). R27 then needs your wording of that exception (as run-productions R13 has); my R27 test states it: every code this module answers either carries its row or is one of the named generic codes. None of the seven is in the guard's surface reach through anything but C-100 except `NOT_FOUND`, which content's `NOT_FOUND` row still covers, so the reach ratchet does not move.

**The alternative** (K275's): rename each to a code of its own (`PROGRESSION_NO_KEY` …) with a row each; say so and I rename.

Every other C-100 code stays, each `where` naming one function and one marked region wrapping the whole refusal (N242); a code minted in several of this module's functions (`NO_SUCH_PROGRESSION`, `NO_STAGE`, `BAD_STAGE`, `NO_CAPTURE`, `NOT_CONCERNED`, `NO_REASON`) converges on one private helper that holds its region (K231).

## J2 · QUESTION

**Replaces J1.** Measured since J1: dropping the seven rows raises the DEC-49 guard's reach ratchet from 33 to 38 untranslated codes (ceiling 32). `NOT_A_DISPOSITION`, `NOT_FOUND`, `NO_ENTITY`, `NO_LABEL` and `NO_SHA` are in the surface's reach (app.html names them; UI mocks feed them; `act-dispose` drives the progression dispose flow, so `NOT_A_DISPOSITION` is *this module's* refusal reaching a member). With no row, a member would see machine vocabulary: N118 as written costs DEC-49. `NO_KEY` alone leaves the reach cleanly.

**My best reading now, which I am building:** apply N118 only where it costs no member a translation. `NO_KEY` (C-100.1) leaves C-100 as a row-less generic code (REC-64, K163); `NO_SUCH_ENTITY` goes to entities R36 (N208), `LISTENER_DECLARED` to membership R81 (N202). The other five keep their rows for now, each `where` one function and one marked region (N242), `NO_ENTITY` converged on one helper within this module; arm G keeps flagging those five exactly as before T10 (no new failure). R27 then needs the one exception for `NO_KEY`.

**What only you can rule (K275, per code):** `NOT_A_DISPOSITION` looks like one condition at its three sites (this module, inquiry, legacy-store's project arm): under K275 the earliest (this module) would provide one helper and hold the one row, the others calling it: a new Provides entry here. `NOT_FOUND`, `NO_ENTITY`, `NO_LABEL`, `NO_SHA` name different subjects at other modules' sites: K275 would rename mine (`PROGRESSION_VERSION_NOT_FOUND` …), which needs your requirement wording and a surface that keys on the new names (legacy-ui). Tell me which, and I apply it in this job.
