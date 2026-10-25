/* action-plans' published fixtures (fix round 10; K4990, K4993, K4995): each is made by action-plans' real code over the
   real modules it uses (./fixture.mjs) when a test calls it, never stored. A user takes `actionPlans` (the real module on
   a real database) and the ids and viewers that answer to its reads. */
import { seeded, opened, option, V, ms, by } from "./fixture.mjs";

const UNKNOWN = "PLN-2026-0404-x";

/** R6, R17, R46: `planRead` as it answers a plan a viewer may see (ok) and an unknown id (R1's `NO_SUCH_PLAN`, the same
 *  answer for a plan the viewer may not see); `checkpointsDue` over an open plan whose second scenario holds a checkpoint
 *  due three days after the plan starts, at a time before it and a time after it; `plansToLookAgain` over a paused plan
 *  with a look-again day, before that day and on it. */
export function planRead() {
  const w = seeded();
  opened(w, [w.SI, w.S1]);
  option(w);
  const set = w.ap.scenarioSet({ plan: w.PL, scenario: 1, name: "Quick", phases: [{ id: "q", name: "Q", options: [], starts: "plan_start",
    checkpoint: { after_days: 3 } }], ...by("alice") });
  if (!set.ok) throw new Error(`fixture scenario refused: ${JSON.stringify(set).slice(0, 400)}`);
  const paused = seeded();
  opened(paused, [paused.SI, paused.S1]);
  const pause = paused.ap.planPause({ id: paused.PL, reason: "Waiting on the audit", look_again: "2026-11-01", ...by("bob") });
  if (!pause.ok) throw new Error(`fixture pause refused: ${JSON.stringify(pause).slice(0, 400)}`);
  const viewer = V("bob"), outsider = V("dave");
  const before = ms("2026-10-02T12:00:00Z"), after = ms("2026-10-15T12:00:00Z");
  const lookBefore = ms("2026-10-20T12:00:00Z"), lookOn = ms("2026-11-01T12:00:00Z");
  return { actionPlans: w.ap, world: w, pausedWorld: paused, viewer, outsider, id: w.PL, pausedId: paused.PL, unknown: UNKNOWN,
           read: w.ap.planRead({ id: w.PL, viewer }),
           unknownAnswer: w.ap.planRead({ id: UNKNOWN, viewer }),
           unseenAnswer: w.ap.planRead({ id: w.PL, viewer: outsider }),
           notDue: w.ap.checkpointsDue({ nowMs: before }),
           due: w.ap.checkpointsDue({ nowMs: after }),
           notYet: paused.ap.plansToLookAgain({ nowMs: lookBefore }),
           lookAgain: paused.ap.plansToLookAgain({ nowMs: lookOn }) };
}
