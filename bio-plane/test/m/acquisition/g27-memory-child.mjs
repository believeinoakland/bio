/* acquisition R5 (G27), the child of g27-g32-t51.test.mjs: run with `node --expose-gc`. A page is captured as a visitor saw it, the render
   is still running when the request's wait is over and returns after the request has ended with a reply of six 7 MiB bodies (42 MiB; the
   renderer sends bodies as base64 text, so about 56 MiB of strings). It prints one JSON line: the heap held after collection, above where
   it stood before the reply came back, whether "Finish it" filed the pair, and how many of the bodies the record holds. */
import { world, run, network, HTML, page, sha } from "./fixture.mjs";
import { acquire } from "../../../src/acquisition/index.mjs";

const MIB = 1024 * 1024;
const PG = "https://r.example/big";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const heap = async () => { for (let i = 0; i < 4; i++) { globalThis.gc(); await sleep(20); } return process.memoryUsage().heapUsed / MIB; };
const bodyOf = (i) => Buffer.alloc(7 * MIB, i + 1);

let release; const gate = new Promise((r) => (release = r));
const w = world({ env: { RENDERER: { fetch: async (u, init) => { await gate;
  const url = JSON.parse(init.body).url;
  const requests = [];
  for (let i = 0; i < 6; i++) requests.push({ url: `https://r.example/asset${i}.bin`, type: "image", outcome: "completed", body_base64: bodyOf(i).toString("base64") });
  return new Response(JSON.stringify({ ok: true, html: HTML("<p>rendered</p>"), elapsed_ms: 9, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
    dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: url, status: 200, requests, scripts: [], wait: { asked: { until: "networkidle", timeout_ms: 15000 }, fired: "networkidle" } })); } } } });
// fixtures-contract: plane owed-ledger
w.store.owedLater = async () => ({ ok: true });

const first = await run(w, { [PG]: () => page(HTML("<div id=app></div>")) }, { locator: PG, render: true }, { renderWaitMs: 20 });
const sid = first.body.render.session;
const before = await heap();
release();
for (let i = 0; i < 600 && !w.store.state.spends.length; i++) await sleep(10);
await sleep(1500);
const after = await heap();
const net = network({ [PG]: () => page(HTML("<div id=app></div>")) });
let done;
try { done = await acquire(w.store, { continue: sid }, { cls: "member", member: true, sessMember: "m1", storeName: "bio" }); } finally { net.restore(); }
let bodiesHeld = 0;
for (let i = 0; i < 6; i++) if (w.held(sha(bodyOf(i)))) bodiesHeld++;
console.log(JSON.stringify({ heldMiB: after - before, finished: done.status === 200 && done.body.document && done.body.document.capture.method === "rendered", bodiesHeld }));
process.exit(0);
