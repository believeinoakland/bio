import "../../bio-plane/test/stdio.mjs";   /* D-282: a suite that exits keeps its own tally (stdio-census ARM B1). */
/* T35-74 (F1, K1874; admission R20, control-plane R59): the surface's credential travels in a
   request's `Authorization: Bearer` header, and a review grant's secret in a POST's JSON body,
   never in an address. Driven at the surface's own transports with a recording `fetch`: every
   tokened seam (`recR`, `recPostR`, the two `op=capture` reads) and the recipient door's three
   calls (`reviewcopy`, `reviewcomment`, `statementack`). A sentinel credential and a sentinel
   secret are searched for in EVERY address the surface asked for, not a sample. */
import { appScript } from "./extract.mjs"; import vm from "vm"; import { webcrypto } from "crypto";

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if(cond){ pass++; console.log("  PASS ", name); }
  else { fail++; console.log("  FAIL ", name); if(detail !== undefined) console.log("        ", JSON.stringify(detail)); }
};

const TOKEN = "f1sentinel" + "a".repeat(54);          /* a session token's shape: 64 printable characters */
const SECRET = "f1secret" + "b".repeat(40);
const BYTES = new TextEncoder().encode("held bytes");
const SHA = [...new Uint8Array(await webcrypto.subtle.digest("SHA-256", BYTES))].map(x=>x.toString(16).padStart(2,"0")).join("");

const els = new Map();
function el(){ return { classList:{add(){},remove(){},toggle(){},contains(){return true}}, style:{}, dataset:{}, value:"",
  innerHTML:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){}, querySelectorAll(){return[]},
  querySelector(){return el()}, insertAdjacentHTML(){}, focus(){}, appendChild(){}, remove(){} }; }
const $$ = s => { if(!els.has(s)) els.set(s, el()); return els.get(s); };

const SEEN = [];
const headerOf = (init, name) => {
  const h = (init && init.headers) || {};
  for(const k of Object.keys(h)) if(k.toLowerCase() === name) return h[k];
  return undefined;
};
async function recordingFetch(u, init){
  const url = new URL(u, "https://x.test");
  SEEN.push({ address: url.pathname + url.search, method: (init && init.method) || "GET",
              auth: headerOf(init, "authorization"), body: init && init.body });
  const op = url.searchParams.get("op");
  if(op === "capture") return { ok:true, status:200, arrayBuffer: async () => BYTES.buffer.slice(0) };
  if(op === "reviewcopy") return { ok:true, status:200, json: async () => ({ ok:true, result:{ ok:true, kind:"review-copy", comments:[], acknowledgements:[] } }) };
  return { ok:true, status:200, json: async () => ({ ok:true, result:{ ok:true } }) };
}
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"", origin:"https://x.test", pathname:"/" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch: recordingFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {PLANE, recR, recPostR, fetchCapture, fetchParts, rvsOpen, rvsComment, rvsAcknowledge, rvsField};", ctx);
const U = ctx.__U;
const since = n => SEEN.slice(n);
const noneInAddress = (list, s) => list.every(r => !r.address.includes(s));

console.log("\n--- 1. a session's every tokened seam sends the credential in the header (T35-74, F1) ---");
U.PLANE.token = TOKEN; U.PLANE.session = true;
let n = SEEN.length;
await U.recR("whoami");
await U.recR("search", { q: "budget" });
await U.recPostR("select", { ids: ["b1"] });
await U.recPostR("release", {}, { handle: "h1" });
const cap = await U.fetchCapture(SHA);
const parts = await U.fetchParts([{ path:"a.p000", bytes:BYTES.length, sha:SHA }]);
const tokened = since(n);
ok("T35-74: six requests made, one per call (four through rec/recPost, two op=capture reads)", tokened.length === 6, tokened.map(r=>r.address));
ok("T35-74: each carries `Authorization: Bearer <the session>` exactly", tokened.every(r => r.auth === "Bearer " + TOKEN), tokened.map(r=>r.auth));
ok("T35-74: the credential appears in NO address the surface asked for", noneInAddress(tokened, TOKEN), tokened.map(r=>r.address));
ok("T35-74: no address carries a `token` parameter at all", tokened.every(r => !new URLSearchParams(r.address.split("?")[1]).has("token")));
ok("T35-74: the requests still name their op and parameters in the address",
   tokened[1].address.includes("op=search") && tokened[1].address.includes("q=budget") && tokened[3].address.includes("handle=h1"),
   tokened.map(r=>r.address));
ok("T35-74: the POST seam keeps its JSON body and content type beside the header",
   tokened[2].method === "POST" && tokened[2].body === JSON.stringify({ ids:["b1"] }));
ok("T35-74: the captures still arrive and verify", cap.ok === true && cap.sha === SHA && parts.ok === true, { cap: cap.ok, parts: parts.ok });

console.log("\n--- 2. a pasted machine token travels the same way ---");
U.PLANE.token = "machine-" + TOKEN; U.PLANE.session = false;
n = SEEN.length;
await U.recR("list");
await U.fetchCapture(SHA);
ok("T35-74: a pasted token is sent as `Bearer <token>` and never in the address",
   since(n).length === 2 && since(n).every(r => r.auth === "Bearer machine-" + TOKEN && !r.address.includes(TOKEN)), since(n));

console.log("\n--- 3. a surface holding nothing sends no header ---");
U.PLANE.token = null; U.PLANE.session = false;
n = SEEN.length;
await U.recR("publishedmanifest");
await U.recPostR("select", { ids: [] });
await U.fetchCapture(SHA);
ok("T35-74: with no credential, no Authorization header and no token parameter",
   since(n).length === 3 && since(n).every(r => r.auth === undefined && !r.address.includes("token")), since(n));

console.log("\n--- 4. the recipient door: the grant's secret in the body, never the address ---");
U.PLANE.token = TOKEN;                    /* even a member's surface sends no token through this door */
n = SEEN.length;
await U.rvsOpen(SECRET);
U.rvsField("comment", "a recipient's comment");
await U.rvsComment();
await U.rvsAcknowledge();
const door = since(n);
const byOp = op => door.filter(r => r.address.includes("op=" + op));
const bodyOf = r => { try{ return JSON.parse(r.body); }catch(_){ return null; } };
ok("T35-74: the door asked reviewcopy, reviewcomment and statementack",
   byOp("reviewcopy").length >= 1 && byOp("reviewcomment").length === 1 && byOp("statementack").length === 1, door.map(r=>r.address));
ok("T35-74: the secret appears in NO address the door asked for", noneInAddress(door, SECRET), door.map(r=>r.address));
ok("T35-74: each of the door's calls is a POST whose JSON body carries the secret",
   door.every(r => r.method === "POST" && bodyOf(r) && bodyOf(r).secret === SECRET), door.map(r=>({a:r.address, m:r.method, b:r.body})));
ok("T35-74: reviewcomment's body keeps the comment's text beside the secret",
   (bodyOf(byOp("reviewcomment")[0]) || {}).text === "a recipient's comment");
ok("T35-74: the door carries no session credential, in a header or anywhere",
   door.every(r => r.auth === undefined && !r.address.includes(TOKEN) && !String(r.body).includes(TOKEN)));

console.log("\n--- 5. the whole run ---");
ok("T35-74: neither sentinel appears in any of the " + SEEN.length + " addresses this run asked for",
   noneInAddress(SEEN, TOKEN) && noneInAddress(SEEN, SECRET));

console.log(`\ncredential-in-header: ${pass} pass, ${fail} fail`);
if(fail) process.exit(1);
