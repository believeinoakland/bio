import { test } from "node:test";
import { members } from "./page.mjs";
const show = (x, n = 900) => JSON.stringify(x, (k, v) => (Array.isArray(v) && v.length > 4 ? `[${v.length}]` : v)).slice(0, n);
test("probe", async () => {
  const t = await members({ mai: ["contribute", "create_projects"], rosa: ["contribute", "create_projects"] });
  const w = t.world;
  const knock = async (body) => { const k = await w.door({ url: "/api/?op=knock", init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } }); if (!k.json.ok) throw new Error(JSON.stringify(k.json)); return k.json; };
  const S = "a-long-secret-of-twenty-chars";
  const a = await knock({ contentText: "alpha alpha", note: "n1", knockerSecret: S });
  const b = await knock({ contentText: "beta beta", note: "n2", knockerSecret: S });
  const a2 = await knock({ contentText: "alpha alpha", note: "n1 again", knockerSecret: S });
  const c = await knock({ contentText: "gamma" });
  for (const [label, o, who] of [["pull a", a, t.mai], ["pull b", b, t.mai], ["pull a2", a2, t.mai], ["pull a2 again", a2, t.mai], ["pull c", c, t.mai]]) {
    try { console.log("PROBE", label, show(await who.act("inboxpull", { body: { knockId: o.knockId, reason: "It bears on our question." } }))); } catch (e) { console.log("PROBE ERR", label, String(e.message).slice(0, 400)); }
  }
  console.log("PROBE resolve", show(await t.mai.act("inboxresolve", { body: { knockId: (await knock({ contentText: "spam", note: "s", knockerSecret: S })).knockId, status: "discarded", reason: "Spam." } })));
  const list = (await t.mai.read("inbox")).inbox;
  console.log("PROBE list", list.map((k) => [k.knock_id, k.status, k.capture_sha && k.capture_sha.slice(0, 6), k.pseudonym]).join(" | "));
  const A = list.find((k) => k.knock_id === a.knockId);
  console.log("PROBE sourceof", show(await t.mai.read("sourceof", { query: { capture: A.capture_sha } })));
  const so = await t.mai.read("sourceof", { query: { capture: A.capture_sha } });
  console.log("PROBE rung", show(await t.mai.read("sourcerung", { query: { source_id: so.sourceId } })));
});
