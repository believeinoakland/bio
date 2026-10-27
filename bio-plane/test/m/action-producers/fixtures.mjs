/* action-producers' published fixtures (fix round 10; K4990, K4993, K4995): each is made by action-producers' real code over
   the real modules it uses (./world.mjs) when a test calls it, never stored. A user takes the answer `actionItems` gives to
   the read it asks and the member and instant it asks it of. */
import { world, NOW, iso, page, DAY, day } from "./world.mjs";

/** R13, R14: `actionItems` as it answers a member who sees one overdue clock entry (R1's CONDITION, to the member who created
 *  the action) and a member who sees none, at `now`; its `facts` beside the items. */
export function actionItems() {
  const w = world({ actionClocks: { overdueClocks: () => page([
    { action: "ACT-1", ord: 0, date: day(NOW - 3 * DAY), basis: "the records act", text: "response due", status: "pending", past: true,
      project: "PRJ-1", created_by: "alice", owed_by: "body", basis_of: { kind: "rule", citation: "c" }, steps: [], local_day: day(NOW), zone: "UTC" }]) } });
  w.member("alice"); w.member("bob"); w.member("olga");
  w.bundle("PRJ-1", "project"); w.bundle("ACT-1", "action");
  w.join("PRJ-1", "olga", { owner: true }); w.join("PRJ-1", "alice");
  return { world: w, actionProducers: w.p, now: NOW, member: "alice", other: "bob",
           due: w.read("alice"), none: w.read("bob"), at: iso(NOW) };
}
