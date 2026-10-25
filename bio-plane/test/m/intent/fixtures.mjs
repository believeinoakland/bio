/* intent's published fixtures (fix round 10; K4990, K4993, K4995, K5044): what the module answers, made by its real code over
   the real record, membership, promotion, entities and progressions each time a test calls one, never stored. A module that
   reads intent takes its answer from here and never builds one by hand. */
import { seeded, V } from "./fixture.mjs";

const must = (r, what) => {
  if (!r || r.ok !== true) throw new Error(`fixture ${what} refused: ${JSON.stringify(r).slice(0, 300)}`);
  return r;
};

/** R2, R6, R7, R15 (monitoring reads `watchSet`, `gaps` and `registerSource`): the real `intentOf(...)` over a project whose
 *  objective's condition reads one entity's instances of a three-stage progression (`proc`) at grade B, 50%. Two instances
 *  stand: ENT-1 meets it, ENT-2 (related to ENT-1 as `member_of`) has its `need` placed and its `award` missing, so one gap
 *  stands, an objective-gap. `intent` is the real module; `project` the project; `viewer` a participant; `gaps` and `watch`
 *  are its real answers to `gaps` and `watchSet` for the project; `captures` the digests `watch` names. */
export async function intentWorld() {
  const w = seeded();
  for (const [id, kind] of [["ENT-1", "body"], ["ENT-2", "office"]]) w.entity(id, kind);
  w.relate("ENT-2", "ENT-1", "member_of");
  w.define();
  await w.thread("ENT-1", { need: "A", award: "B" });
  await w.thread("ENT-2", { need: "A" });
  const viewer = V("bob");
  must(w.i.setCondition({ project: w.P, reason: "Measured by the record.", author: viewer, viewer,
    condition: { progression: "proc", entity: "ENT-1", relation: "member_of", required: { grade: "B", stages: ["need", "award"] },
                 satisfied: { share: 50 } } }), "condition");
  return { world: w, intent: w.i, project: w.P, viewer,
           gaps: w.i.gaps({ project: w.P, viewer }), watch: w.i.watchSet({ project: w.P }),
           captures: w.i.watchSet({ project: w.P }).captures };
}

/** R9 (C-111.15, NOT_YOURS): the real refusal of `declareAspiration` when a member declares a member-scope aspiration for
 *  another member, the row a door picks the answer's check and words by. Nothing is written. `refusal` is the answer;
 *  `world` the intent world it was made in. */
export function notYoursRefusal() {
  const w = seeded();
  const refusal = w.i.declareAspiration({ scope: "member", owner: "carol", statement: "Know who holds the contracts.", author: V("bob") });
  return { world: w, intent: w.i, refusal };
}
