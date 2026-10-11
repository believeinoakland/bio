/* doorbell's refusal rows (R21; requirements: `build/requirements/doorbell.md`). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation.
 *
 * C-85.1–C-85.5 (`KNOCK_CHECKS`, R4–R9) and C-118.2, C-118.3, C-118.4 and C-118.7 (R3, R13, R14) move with their raisers,
 * numbers kept (K93 (3); the map's doubt 3). While `capture` keeps its copy of the doorbell (K625; its delete is T43,
 * N849), each row stays DEFINED ONCE, in `capture`'s `checks.mjs`, and this file re-exports it (K2609; one row, one
 * site, K231): `KNOCK_CHECKS` is capture's own object, and `DOORBELL_CHECKS` names capture's four row objects, never a
 * copy of one. Each row's `where` names this module's raiser (K2627: capture's job re-points them in its file): the
 * functions and DEC-49 regions `build/extraction/capture-split.md` §2 names, `#noSuchKnock`, `pullKnock`,
 * `inboxResolve` and `#knockRateRefusal` in `index.mjs`, the three pre-store helpers and `knockerSecretWeak` in
 * `door.mjs`. The physical move of the rows is N851, with capture's delete. C-118's other rows, and its next free
 * number, stay `capture`'s. */
import { CAPTURE_CHECKS, KNOCK_CHECKS } from "../capture/checks.mjs";

/* C-85 (R4–R9). Not frozen, as capture holds it: R9's missing row fails loud, and its test removes a row to prove it. */
export { KNOCK_CHECKS };

/* C-118.2 `NO_SUCH_KNOCK` (R3, R13), C-118.3 `KNOCKER_SECRET_WEAK` (R14), C-118.4 `KNOCK_DISCARDED` (R13) and C-118.7
   `RESOLVE_NO_REASON` (R3): capture's row objects themselves. */
export const DOORBELL_CHECKS = Object.freeze({
  NO_SUCH_KNOCK: CAPTURE_CHECKS.NO_SUCH_KNOCK,
  KNOCKER_SECRET_WEAK: CAPTURE_CHECKS.KNOCKER_SECRET_WEAK,
  KNOCK_DISCARDED: CAPTURE_CHECKS.KNOCK_DISCARDED,
  RESOLVE_NO_REASON: CAPTURE_CHECKS.RESOLVE_NO_REASON,
});
