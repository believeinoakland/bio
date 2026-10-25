import { test } from "node:test";
import { inWorld, openAs } from "./world.mjs";
import { main } from "./fixtures.mjs";
test("probe", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "Rent case");
  const court = (await me.act("entitycreate", { body: { kind: "body", label: "Alameda Housing Tribunal", forum_kind: "court", note: "A court." } })).entity_id;
  const proc = (await me.act("entitycreate", { body: { kind: "proceeding", label: "the lease rent case", note: "x", proceeding: { forum: court, kind: "civil", number: "24CV123456" } } })).entity_id;
  const ev = async (b) => { const r = await me.act("createevent", { body: b }); console.log("EV", JSON.stringify(r)); return r.event_id; };
  await ev({ kind: "filing", where: "The petition filed", attestations: [{ testimony: "We filed it.", value: "2026-10-01", project }], concerns: [proc] });
  await ev({ kind: "hearing", where: "Hearing on the motion", attestations: [{ testimony: "Set by the court.", value: "2026-11-04", project }], concerns: [proc] });
  const action = (await me.act("actioncreate", { body: { document: ["---", "id: PENDING", "object_type: action", 'title: "The rent schedules"', "current_state: planned",
    'created: "2026-10-01T12:00:00Z"', 'last_updated: "2026-10-01T12:00:00Z"', "project: " + project, "proceeding: " + proc, 'action_kind: "records_request"', "counterparty:", `  state: "named"`, `  role: "City Clerk"`, `  body: "City Council"`, "---", "", "The rent schedules.", ""].join("\n") } }));
  console.log("ACT", JSON.stringify(action));
  await me.act("actioncorrespond", { query: { target: action.id, direction: "sent", at: "2026-10-02", account: "We asked." } });
  await me.act("clockpropose", { body: { target: action.id, rule: "records_response" } });
  const pr = (await me.read("clockproposals", { query: { action: action.id } })).proposals;
  console.log("PROP", JSON.stringify(pr.map((x) => [x.key, x.rule, x.date])));
  const a = await me.act("clockadopt", { body: { target: action.id, proposal: pr.find((x) => x.rule === "records_response").key, why: "x" } });
  console.log("ADOPT", JSON.stringify(a));
  console.log("DATES", JSON.stringify(await me.read("proceedingdates", { query: { proceeding: proc } })));
});
