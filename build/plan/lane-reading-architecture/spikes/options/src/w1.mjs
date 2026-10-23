import { mk, j, sleep } from "./w-lib.mjs";
import fs from "node:fs";
const B = "/tmp/claude-0/-home-user-bio/ace00fc7-30a5-5161-8a63-7cfeb7cb24c6/scratchpad/options/spikes";
const P = B + "/data/w1"; fs.rmSync(P, { recursive: true, force: true });
const mf = await mk(P); const out = {};
async function wait(wf, id, ms = 60000) { const t0 = Date.now(); let s;
  while (Date.now() - t0 < ms) { s = await j(mf, `/status?wf=${wf}&id=${id}`); if (["complete","errored","terminated"].includes(s.status)) break; await sleep(100); } return s; }
// a + e
let t0 = Date.now(); console.log(await j(mf, "/create?wf=Fifty&id=a1")); 
let s = await wait("Fifty", "a1"); const total = Date.now() - t0; console.log("a1", s, total);
let d = await j(mf, "/dump?id=a1"); const ts = d.map(r => r.t);
out.a = { status: s.status, steps: d.length, allRunOnce: d.every(r => r.n === 1), totalMs: total, perStepMs: total / 50, firstToLastMs: ts[ts.length-1] - ts[0], gaps: ts.slice(1).map((t,i)=>t-ts[i]).slice(0,10) };
// b
t0 = Date.now(); await j(mf, "/create?wf=Flaky&id=b1"); s = await wait("Flaky", "b1"); 
d = await j(mf, "/dump?id=b1"); console.log("b1", JSON.stringify(s), JSON.stringify(d));
out.b = { status: s.status, output: s.output, error: s.error, dump: d, totalMs: Date.now() - t0 };
// d
for (const bytes of [1048576, 1048577]) { const id = "d" + bytes; await j(mf, `/create?wf=Big&id=${id}&p=` + encodeURIComponent(JSON.stringify({ bytes })));
  s = await wait("Big", id); console.log(id, JSON.stringify(s).slice(0, 600)); out["d" + bytes] = s; }
fs.writeFileSync(B + "/results/w1.json", JSON.stringify(out, null, 1));
await mf.dispose(); process.exit(0);
