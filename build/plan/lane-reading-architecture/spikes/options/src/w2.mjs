import { mk, j, sleep } from "./w-lib.mjs";
import fs from "node:fs";
const B = "/tmp/claude-0/-home-user-bio/ace00fc7-30a5-5161-8a63-7cfeb7cb24c6/scratchpad/options/spikes";
const P = B + "/data/w2"; fs.rmSync(P, { recursive: true, force: true });
let mf = await mk(P); const out = {};
async function wait(wf, id, ms = 60000) { const t0 = Date.now(); let s;
  while (Date.now() - t0 < ms) { s = await j(mf, `/status?wf=${wf}&id=${id}`); if (["complete","errored","terminated"].includes(s.status)) break; await sleep(100); } return s; }
// b: attempt times
await j(mf, "/create?wf=Flaky&id=b2"); let s = await wait("Flaky", "b2");
let a = await j(mf, "/atts?id=b2"); const t = a.map(r => r.t);
out.b = { status: s.status, attempts: a.map(r => r.step), gapsMs: t.slice(1).map((x, i) => x - t[i]) }; console.log(JSON.stringify(out.b));
// d: bigger and string, and with retries 0
for (const bytes of [2097152, 10485760]) { const id = "dd" + bytes; await j(mf, `/create?wf=Big&id=${id}&p=` + encodeURIComponent(JSON.stringify({ bytes })));
  s = await wait("Big", id); out["d" + bytes] = { status: s.status, error: s.error, output: s.output }; console.log(bytes, JSON.stringify(out["d" + bytes])); }
// c: resume
await j(mf, "/create?wf=Fifty&id=c1&p=" + encodeURIComponent(JSON.stringify({ slowMs: 200 })));
await sleep(4000);
const before = await j(mf, "/dump?id=c1"); console.log("steps before dispose", before.length);
await mf.dispose(); console.log("disposed"); await sleep(3000);
mf = await mk(P); const tr = Date.now();
let st = await j(mf, "/status?wf=Fifty&id=c1"); console.log("status right after restart", st.status);
s = await wait("Fifty", "c1", 90000); const d = await j(mf, "/dump?id=c1");
const at = await j(mf, "/atts?id=c1");
const multi = d.filter(r => r.n > 1);
out.c = { stepsBeforeDispose: before.length, statusAfterRestart: st.status, finalStatus: s.status, distinctSteps: d.length, stepsRunMoreThanOnce: multi, secondsToFinishAfterRestart: (Date.now() - tr) / 1000, totalAttempts: at.length };
console.log(JSON.stringify(out.c));
fs.writeFileSync(B + "/results/w2.json", JSON.stringify(out, null, 1));
await mf.dispose(); process.exit(0);
