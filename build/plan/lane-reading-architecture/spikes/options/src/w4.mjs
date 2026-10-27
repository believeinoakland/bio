import { mk, j, sleep } from "./w-lib.mjs";
import fs from "node:fs";
const B = "/tmp/claude-0/-home-user-bio/ace00fc7-30a5-5161-8a63-7cfeb7cb24c6/scratchpad/options/spikes";
const P = B + "/data/w4"; fs.rmSync(P, { recursive: true, force: true });
const mf = await mk(P); const out = {};
async function wait(id) { let s; for (let i=0;i<300;i++) { s = await j(mf, `/status?wf=Big&id=${id}`); if (["complete","errored","terminated"].includes(s.status)) break; await sleep(100); } return s; }
for (const [kind, n] of [["str",1048576],["str",1048577],["str",1048578],["str",1100000],["obj",1048576],["obj",1048577],["obj",1200000]]) {
  const id = `${kind}${n}`; await j(mf, `/create?wf=Big&id=${id}&p=` + encodeURIComponent(JSON.stringify({ bytes: n, kind })));
  const s = await wait(id); out[id] = { status: s.status, error: s.error?.message }; console.log(id, JSON.stringify(out[id]));
}
fs.writeFileSync(B + "/results/w4.json", JSON.stringify(out, null, 1));
await mf.dispose(); process.exit(0);
