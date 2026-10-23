import { mk, j, sleep } from "./w-lib.mjs";
import fs from "node:fs";
const B = "/tmp/claude-0/-home-user-bio/ace00fc7-30a5-5161-8a63-7cfeb7cb24c6/scratchpad/options/spikes";
const P = B + "/data/w3"; fs.rmSync(P, { recursive: true, force: true });
let mf = await mk(P); const out = {};
async function wait(wf, id, ms = 60000) { const t0 = Date.now(); let s;
  while (Date.now() - t0 < ms) { s = await j(mf, `/status?wf=${wf}&id=${id}`); if (["complete","errored","terminated"].includes(s.status)) break; await sleep(100); } return s; }
// strings at the boundary
for (const n of [1048574, 1048576, 1048577]) {
  // reuse Big with a string via bytes -> need string; emulate by param
}
await j(mf, "/create?wf=Fifty&id=c1&p=" + encodeURIComponent(JSON.stringify({ slowMs: 200 })));
await sleep(4000);
const before = await j(mf, "/dump?id=c1"); console.log("before", before.length);
await mf.dispose(); await sleep(2000);
mf = await mk(P);
console.log("status", (await j(mf, "/status?wf=Fifty&id=c1")).status);
await sleep(5000);
console.log("after 5s steps", (await j(mf, "/dump?id=c1")).length);
console.log("create same id:", JSON.stringify(await j(mf, "/create?wf=Fifty&id=c1").catch(e=>String(e))).slice(0,200));
await sleep(3000);
console.log("after create steps", (await j(mf, "/dump?id=c1")).length);
console.log("pause", JSON.stringify(await j(mf, "/op?wf=Fifty&id=c1&op=pause")));
await sleep(500);
console.log("resume", JSON.stringify(await j(mf, "/op?wf=Fifty&id=c1&op=resume")));
const s = await wait("Fifty", "c1", 40000); const d = await j(mf, "/dump?id=c1");
console.log("final", s.status, "distinct", d.length, "multi", JSON.stringify(d.filter(r=>r.n>1)));
out.c = { before: before.length, final: s.status, distinct: d.length, multi: d.filter(r=>r.n>1) };
fs.writeFileSync(B + "/results/w3.json", JSON.stringify(out, null, 1));
await mf.dispose(); process.exit(0);
