/* CONTROL for (a): the same Miniflare with the same five stub workers and a trivial plane-named worker with the same bindings (a DO class Store, R2) but NOT the bundle, so the runtime's own share is known. */
import { writeFileSync, mkdirSync } from "node:fs";
import { start, status, sleep, r1 } from "./lib.mjs";
mkdirSync("/home/user/wt-chain/proto-mem/dist", { recursive: true });
const p = "/home/user/wt-chain/proto-mem/dist/trivial.mjs";
writeFileSync(p, `import { DurableObject } from "cloudflare:workers";
export class Store extends DurableObject { async fetch(){ return new Response("ok"); } }
export default { async fetch(req, env){ const s = env.STORE.get(env.STORE.idFromName("bio")); return await s.fetch(req); } };`);
const w = await start({ bundle: p });
const out = {};
const at = (l) => { const s = status(w.pid); out[l] = { rss: r1(s.rss), anon: r1(s.anon), file: r1(s.file) }; };
at("after_ready_no_request"); await w.call("/?x=1"); await sleep(1000); at("after_first_request");
console.log(JSON.stringify(out, null, 1)); await w.close();
