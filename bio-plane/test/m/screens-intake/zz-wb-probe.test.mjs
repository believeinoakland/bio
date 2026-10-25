import { test } from "node:test";
import { members, openWorld, main, text, ok } from "./page.mjs";
test("probe", async () => {
  const t = await members({ mai: ["contribute", "create_projects"] });
  const w = t.world;
  const project = await w.recipes.project(t.mai, "P");
  const q = await w.recipes.question(t.mai, project, { title: "Q", text: "Q?" });
  const address = "https://records.example.gov/inspections/2019.html";
  w.script(address, async () => new Response("<html><head><title>x</title></head><body><p>y</p></body></html>", { status: 200, headers: { "content-type": "text/html" } }));
  await t.mai.act("capturerequest", { body: { address, target: q.id } });
  const real = await t.mai.read("capturerequests", { query: { limit: "50" } });
  const row = real.requests[0];
  const variants = { none: undefined, old: { request: "CR-1", host: "records.example.gov", state: "refused", source_reason: "login", requested_at: "2026-10-01T00:00:00Z", principal_plane: "member:mai" }, oldrequested: { request: "CR-1", host: "records.example.gov", state: "requested", requested_at: "2026-10-01T00:00:00Z", principal_plane: "member:mai" }, nodate: { ...row, requested_at: undefined, updated: undefined },  all: row, noAttr: { ...row, attribution: undefined }, noAt: { ...row, requested_at: undefined }, plane: { ...row, principal_plane: "member:mai" }, state: { ...row, state: "wait" }, noAddr: { ...row, address: undefined } };
  for (const [k, r] of Object.entries(variants)) {
    const p = await openWorld("/app/capture/address", { world: w, as: t.mai, plane: { capturerequests: async () => ok({ ...real, requests: r ? [r] : [] }) } });
    console.log("PROBE", k, row.state, /could not be read/.test(text(p)));
  }
});
