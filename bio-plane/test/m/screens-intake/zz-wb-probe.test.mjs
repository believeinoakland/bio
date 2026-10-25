import { test } from "node:test";
import { members } from "./page.mjs";
test("probe", async () => {
  const t = await members({ mai: ["contribute", "create_projects"] });
  const w = t.world;
  const prj = await w.recipes.project(t.mai, "Budget");
  const q = await w.recipes.question(t.mai, prj, { title: "Q", text: "What?" });
  const ADDR = "https://www.oaklandca.gov/documents/fy23-25-adopted-budget-book-final-reduced-size.pdf";
  const big = new Uint8Array(26 * 1024 * 1024); for (let i = 0; i < big.length; i++) big[i] = (i * 31 + (i >> 8)) & 255;
  w.script(ADDR, async () => new Response(big, { status: 200, headers: { "content-type": "application/pdf" } }));
  const asked = await t.mai.act("capturerequest", { body: { address: ADDR, target: q.id } });
  const drained = await w.door({ url: "/api/?op=capturerequestdrain", init: { method: "POST", headers: { "content-type": "application/json" }, body: "{}" } }, { token: w.env.DAEMON_TOKEN });
  console.log("PROBE drained", JSON.stringify(drained.json).slice(0, 1200));
  const sha = drained.json.result.captured[0].sha;
  for (const [op, qy] of [["reading", { sha256: sha }], ["readheld", { sha }], ["reading", { sha256: sha }]]) { try { console.log("PROBE", op, JSON.stringify(await t.mai.read(op, { query: qy }), (k, v) => (Array.isArray(v) && v.length > 3 ? `[${v.length}]` : v)).slice(1200, 4000)); } catch (e) { console.log("PROBE ERR", op, String(e.message).slice(0, 600)); } }
  console.log("PROBE heldat", JSON.stringify(await t.mai.read("heldat", { query: { address: ADDR } })).slice(0, 900));
});
