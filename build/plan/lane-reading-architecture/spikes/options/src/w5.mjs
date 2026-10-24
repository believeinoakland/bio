import { mk, j, sleep } from "./w-lib.mjs";
import fs from "node:fs";
const B = "/tmp/claude-0/-home-user-bio/ace00fc7-30a5-5161-8a63-7cfeb7cb24c6/scratchpad/options/spikes";
const P = B + "/data/w5"; fs.rmSync(P, { recursive: true, force: true });
const mf = await mk(P); const out = {};
async function wait(id) { let s; for (let i=0;i<300;i++) { s = await j(mf, `/status?wf=Big&id=${id}`); if (["complete","errored","terminated"].includes(s.status)) break; await sleep(100); } return s; }
for (const [kind, n] of [["str",2097152],["str",3000000],["str",4194304],["str",6000000],["str",8388608],["str",10485760]]) {
  const id = `${kind}${n}`; await j(mf, `/create?wf=Big&id=${id}&p=` + encodeURIComponent(JSON.stringify({ bytes: n, kind })));
  const s = await wait(id); out[id] = { status: s.status, error: s.error?.message }; console.log(id, JSON.stringify(out[id]));
}
fs.writeFileSync(B + "/results/w5.json", JSON.stringify(out, null, 1));
await mf.dispose(); process.exit(0);
