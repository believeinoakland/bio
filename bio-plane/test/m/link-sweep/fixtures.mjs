/* link-sweep's published fixtures (T51 fix round 10; K4990, K4993): the answers its two member doors give to a caller, sweepset
   (R13) and sweepratify (R14), made by its real code when the function is called, over the test world of fixture.mjs, and never
   stored. A user's test takes the answer from here and does not write it by hand. */
import { listWorld, SEED, doorQuery } from "./fixture.mjs";
import { linkSweepOps } from "../../../src/link-sweep/index.mjs";

export const FIXTURE_LIST = "INFO-2026-0960-fixture-list";
const PROJ = "PROJ-2026-0960-fixture";
const FIELDS = { title: "Council minutes", sources: ["https://records.example.org/council"], seeds: [SEED], match: { terms: ["minutes"] },
                 cadence: "weekly", budget: { per_run: 10, backlog: 20 } };

/* the op as the door runs it: the stamps in the address (doorQuery), the fields as the body */
const door = (w, op, body, who) => linkSweepOps(w.s, new URL("http://do/?" + doorQuery(op, who)), body)[op]();
/* the sweeps the viewer may see, as `sweeps` (R9) reads them after the call */
const read = (w, who) => w.s.sweeps({ viewer: who }).sweeps;

/** `sweepset` (R13): a member defines a sweep; the real answer, with the minted id and `ratified: false`, and the sweeps read
 *  back after it. */
export async function sweepsetAnswer() {
  const { w } = listWorld({ list: FIXTURE_LIST, project: PROJ, sweeps: [] });
  const answer = await door(w, "sweepset", { bundle: FIXTURE_LIST, ...FIELDS }, "member:alice");
  return { answer, read: read(w, "member:alice") };
}

/** `sweepratify` (R14): the project's owner ratifies a sweep she has defined; the real answer, and the sweeps read back. */
export async function sweepratifyAnswer() {
  const { w } = listWorld({ list: FIXTURE_LIST, project: PROJ, sweeps: [] });
  const made = await door(w, "sweepset", { bundle: FIXTURE_LIST, ...FIELDS }, "member:alice");
  const answer = await door(w, "sweepratify", { sweep: made.sweep, ratified: true }, "member:alice");
  return { sweep: made.sweep, answer, read: read(w, "member:alice") };
}

/** `sweepratify` (R14) by a joined member who owns nothing: the real SWEEP_RATIFY_NOT_AN_OWNER refusal, and the sweep still unratified. */
export async function sweepratifyNotOwner() {
  const { w } = listWorld({ list: FIXTURE_LIST, project: PROJ, sweeps: [] });
  const made = await door(w, "sweepset", { bundle: FIXTURE_LIST, ...FIELDS }, "member:alice");
  const answer = await door(w, "sweepratify", { sweep: made.sweep, ratified: true }, "member:bob");
  return { sweep: made.sweep, answer, read: read(w, "member:alice") };
}
