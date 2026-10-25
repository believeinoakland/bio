/* case-check's published fixtures (fix round 10, Wave A batch 5; K4990, K4993, K4995, K5044): the answers this module gives to a
   caller of `caseCheckOf`, made by this module's real code when the function is called, over the test world of fixture.mjs, and
   never stored. A user's test takes the answer from here and does not write it by hand. Each is checked by fixtures.test.mjs,
   which calls it and checks the real answer. */
import { standard, args, V, F1 } from "./fixture.mjs";

/** `caseCheckOf({case, viewer})` (R2) for a viewer who may not see the case: `out` is in no project, the case is held in one
 *  `ann` owns, and a case that is not there is asked for beside it. Both answers are the real refusal, `{ok: false, reason:
 *  "NO_SUCH_CASE", ...}`, the same bytes. `world` is the test world; `case` the held case's id. */
export function caseCheckOfNoSuchCase() {
  const w = standard();
  const held = w.c.checkAndHold(args([F1]));
  return {
    world: w, case: held.case, viewer: V("out"),
    refusal: w.c.caseCheckOf({ case: held.case, viewer: V("out") }),
    absent: w.c.caseCheckOf({ case: "CASE-2099-9999", viewer: V("out") }),
  };
}
