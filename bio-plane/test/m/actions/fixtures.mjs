/* actions' published fixtures (fix round 10; K4990, K4993, K4995): each is made by actions' real code over the real
   modules it uses (./fixture.mjs) when a test calls it, never stored. A user takes `actions` (the real module on a real
   database) and the ids and viewers that answer to its reads. */
import { world, V } from "./fixture.mjs";

const A = "ACTN-2026-0001-a", INFO = "INFO-2026-0001-d", UNKNOWN = "ACTN-2026-0404-x";

/** R29, R106: `actionRead` as it answers a visible action, an unknown id, an action the viewer may not see and a
 *  bundle that is no action. The three refusals are one answer, R43's `NO_SUCH_ACTION` (R106), differing in the id
 *  they name. */
export function actionRead() {
  const w = world();
  w.action(A);
  w.doc(INFO);
  const viewer = V("alice"), outsider = "nobody";
  return { actions: w.a, world: w, viewer, outsider, action: A, notAnAction: INFO, unknown: UNKNOWN,
           read: w.a.actionRead({ id: A, viewer }),
           unknownAnswer: w.a.actionRead({ id: UNKNOWN, viewer }),
           unseenAnswer: w.a.actionRead({ id: A, viewer: outsider }),
           notAnActionAnswer: w.a.actionRead({ id: INFO, viewer }) };
}

/** R30, R62: the refusals a target that is unknown, unseen or no action draws from the actions module's reads of one
 *  target: `addresseeSuggest` names the bundle (`NO_SUCH_BUNDLE`, `NOT_AN_ACTION`), `actionRead` answers R43's
 *  `NO_SUCH_ACTION`; `actionsFor` over an unknown determination answers an empty page, not a refusal. */
export function actionsForRefusal() {
  const w = world();
  w.action(A);
  w.doc(INFO);
  const viewer = V("alice"), outsider = "nobody";
  return { actions: w.a, world: w, viewer, outsider, action: A, notAnAction: INFO, unknown: UNKNOWN,
           unknownTarget: w.a.addresseeSuggest({ action: UNKNOWN, subject: "ENT-2026-0001-e", viewer }),
           unseenTarget: w.a.addresseeSuggest({ action: A, subject: "ENT-2026-0001-e", viewer: outsider }),
           notAnActionTarget: w.a.addresseeSuggest({ action: INFO, subject: "ENT-2026-0001-e", viewer }),
           unknownRead: w.a.actionRead({ id: UNKNOWN, viewer }),
           emptyPage: w.a.actionsFor({ determination: "CONF-2026-0404-determination", viewer }) };
}
