/* (a) BASELINE: workerd + the bundle loaded, Store instantiated and idle.  node proto-mem/baseline.mjs [bundle]  (default: the committed plane bundle) */
import { start, status, rollup, sleep, r1, workerdPids } from "./lib.mjs";
const bundle = process.argv[2] || "/home/user/wt-mem/bio-plane/dist/bio-plane.bundled.mjs";
const before = status(process.pid);   /* the node driver itself, for scale */
const w = await start({ bundle });
const out = { bundle, workerd_pids: w.pids };
const at = async (label) => { const s = status(w.pid); out[label] = { rss: r1(s.rss), hwm: r1(s.hwm), anon: r1(s.anon), file: r1(s.file), threads: s.threads }; try { out[label].js_heap = await w.heap(); } catch (e) { out[label].js_heap = "n/a " + e.message; } };
await at("after_ready_no_request");
await sleep(2000); await at("after_ready_2s_idle");
const r1_ = await w.call("/?op=stats");
out.first_request_status = r1_.status;
await at("after_first_stats_request");
await sleep(3000); await at("after_first_request_plus_3s");
for (let i = 0; i < 5; i++) await w.call("/?op=stats");
await sleep(1000); await at("after_5_more_stats");
out.rollup = Object.fromEntries(Object.entries(rollup(w.pid)).map(([k, v]) => [k, r1(v)]));
console.log(JSON.stringify(out, null, 1));
await w.close();
