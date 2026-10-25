import { test } from "node:test";
import { inWorld, openAs } from "./world.mjs";
import { main } from "./fixtures.mjs";
test("probe", async () => {
  const { world, me } = await inWorld();
  await world.recipes.profiles(me, ["oakland-alameda"]);
  const project = await world.recipes.project(me, "P");
  const lease = await world.recipes.hold(me, "Lease", "The adopted budget moves 4,200,000 dollars from the Sewer Fund 3100 to the General Fund 1010 for 2021-22.", project);
  const trail = await world.recipes.trail(me, project, "T");
  const source = { capture_sha: lease.sha, extent: { kind: "document" } };
  const df = (await me.act("recorddatedfact", { body: { captureSha: lease.sha, extent: { kind: "document" }, kind: "entered", value: "2022-06-30", method: "stated in the document" } })).dated_fact.dated_fact_id;
  const ev = await me.act("createevent", { body: { kind: "other", attestations: [{ datedFactId: df }] } });
  console.log(JSON.stringify(ev));
  const a = (await me.act("recordfact", { body: { currency: "USD", sign: "+", precision: "exact", period: { from: "2021-07-01", to: "2022-06-30" }, source, concerns: [ev.event_id], amount: "1.00", as_read: "1", kind: "transfer", phase: "actual", stage: "paid", basis: "cash", from: { as_written: "A" }, to: { as_written: "B" } } })).fact_id;
  await me.act("moneysetpropose", { body: { setId: trail, factId: a, method: "m" } });
  console.log(JSON.stringify(await me.read("moneyset", { query: { id: trail } })).slice(0, 1500));
  const p = await openAs(world, me, "/app/money/" + trail);
  console.log("PAGE", main(p).textContent.slice(0, 700));
});
