import "../../bio-plane/test/stdio.mjs";   /* D-282: a suite that exits keeps its own tally (stdio-census ARM B1). */
/* T36-38 (N711, K1936 Q3): the shared member token is retired, and admission refuses it as a
   member bearer (T36-36). The surface therefore takes no pasted token: its gate offers sign-in
   only, and every request it builds carries the session `op=login` answered, in the
   `Authorization` header, or nothing. Driven at the surface's interface: the gate's served
   markup, and its controls clicked with a recording `fetch`. A sentinel shared token is put in
   EVERY place a page could read one from (any element whose id or name names a token, the
   address, local storage) and searched for in every address, header and body the run asked for. */
import { appScript } from "./extract.mjs"; import vm from "vm"; import fs from "fs"; import { webcrypto } from "crypto";

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if(cond){ pass++; console.log("  PASS ", name); }
  else { fail++; console.log("  FAIL ", name); if(detail !== undefined) console.log("        ", JSON.stringify(detail)); }
};

const SHARED = "membertokensentinel" + "m".repeat(45);   /* what a pasted MEMBER_TOKEN would be */
const SESSION = "sessionsentinel" + "s".repeat(49);      /* what op=login answers */
const TOKENISH = /token/i;

/* ---- 1. the served gate: no field, control or words that take a token ---- */
console.log("\n--- 1. the gate takes no pasted token (T36-38) ---");
const html = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
const gate = (/<div id="gate"[\s\S]*?<!-- ============ WORKING SPACE/.exec(html) || [""])[0];
ok("T36-38: the gate's markup was found", gate.length > 0);
const tags = [...gate.matchAll(/<(input|button|textarea|select|label|a)\b[^>]*>/gi)].map(m => m[0]);
const tokenTags = tags.filter(t => TOKENISH.test(t));
ok("T36-38: no input, button, label or link of the gate names a token (id, name, for or placeholder)", tokenTags.length === 0, tokenTags);
const words = gate.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ");
ok("T36-38: the gate's visible words offer no token and no paste", !/token|paste/i.test(words), words.match(/[^.]*(token|paste)[^.]*/i));
const inputs = [...gate.matchAll(/<input\b[^>]*\bid="([^"]+)"/gi)].map(m => m[1]).sort();
ok("T36-38: the gate's inputs are the plane address, the member handle and the password, and nothing else",
   JSON.stringify(inputs) === JSON.stringify(["g-base", "g-handle", "g-pw"]), inputs);

/* ---- the page, run with a recording fetch and a DOM that offers the sentinel everywhere ---- */
const SEEN = [];
const headersOf = init => { const h = (init && init.headers) || {}; const o = {}; for(const k of Object.keys(h)) o[k.toLowerCase()] = h[k]; return o; };
async function recordingFetch(u, init){
  const url = new URL(u, "https://x.test");
  SEEN.push({ address: url.pathname + url.search, method: (init && init.method) || "GET",
              headers: headersOf(init), body: init && init.body !== undefined ? String(init.body) : "" });
  const op = url.searchParams.get("op");
  const json = op === "login" ? { ok:true, result:{ ok:true, role:"m1", token:SESSION, expires:0 } }
             : op === "whoami" ? { ok:true, result:{ tokenClass:"session", session:true, member:"m1", handle:"m1", administer:false, capabilities:["contribute"] } }
             : { ok:true, result:{ ok:true } };
  return { ok:true, status:200, json: async () => json, text: async () => "test", arrayBuffer: async () => new ArrayBuffer(0) };
}
const els = new Map();
function el(key){
  const id = String(key || "").replace(/^#/, "");
  return { id, classList:{add(){},remove(){},toggle(){},contains(){return true}}, style:{}, dataset:{},
    value: id === "g-handle" ? "m1" : id === "g-pw" ? "pw1" : TOKENISH.test(id) ? SHARED : "",
    innerHTML:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){}, querySelectorAll(){return[]},
    querySelector(){return el()}, insertAdjacentHTML(){}, focus(){}, appendChild(){}, remove(){}, setAttribute(){},
    getAttribute(){return null} };
}
const $$ = s => { if(!els.has(s)) els.set(s, el(s)); return els.get(s); };
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
  setInterval:()=>1, clearInterval(){}, setTimeout:()=>1, clearTimeout(){}, requestAnimationFrame:()=>1,
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:id=>$$("#" + id), hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"#token=" + SHARED, search:"?token=" + SHARED, href:"https://x.test/?token=" + SHARED + "#token=" + SHARED,
    origin:"https://x.test", pathname:"/" },
  history:{ pushState(){}, replaceState(){}, back(){} },
  localStorage:{ getItem:k => TOKENISH.test(k) ? SHARED : null, setItem(){}, removeItem(){} },
  sessionStorage:{ getItem:k => TOKENISH.test(k) ? SHARED : null, setItem(){}, removeItem(){} },
  window:{ addEventListener(){}, open:()=>null },
  fetch: recordingFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
let loaded = null;
try{ vm.runInContext(appScript() + ";globalThis.__U = {PLANE, signIn, authHeaders};", ctx); loaded = true; }
catch(e){ loaded = e; }
ok("T36-38: the page's script runs to its end with the gate as served (no handler left pointing at a removed control)",
   loaded === true && !!ctx.__U, String(loaded && loaded.stack || loaded));
const U = ctx.__U || {};
const settle = () => new Promise(r => setImmediate(r));
const carries = (r, v) => r.address.includes(v) || r.body.includes(v) || Object.values(r.headers).some(h => String(h).includes(v));

/* ---- 2. every control of the gate, clicked: none sends the shared token ---- */
console.log("\n--- 2. no control of the gate sends a value from a token-named field ---");
const gateControls = [...els.entries()].filter(([k, e]) => k.startsWith("#g-") && typeof e.onclick === "function").map(([k]) => k).sort();
ok("T36-38: the gate's live controls are sign-in, the public record and the preview, and no token control",
   JSON.stringify(gateControls) === JSON.stringify(["#g-preview", "#g-pub", "#g-signin"]), gateControls);
for(const k of gateControls.filter(k => k !== "#g-signin")){
  try{ await els.get(k).onclick(); }catch(_){}
  await settle();
}
ok("T36-38: no gate control but sign-in (the public record, the preview) sends any credential",
   SEEN.every(r => r.headers.authorization === undefined && !carries(r, SHARED)), SEEN);

/* ---- 3. sign-in: the page reaches the plane under the member's session, in the header ---- */
console.log("\n--- 3. sign-in reaches the plane under the member's session (op=login) ---");
let n = SEEN.length;
try{ await els.get("#g-signin").onclick(); }catch(_){}
for(let i = 0; i < 20; i++) await settle();
const after = SEEN.slice(n);
const login = after.find(r => r.address.includes("op=login"));
ok("T36-38: sign-in posts the member's handle and password to op=login, with no credential", !!login && login.method === "POST"
   && JSON.parse(login.body).role === "m1" && JSON.parse(login.body).password === "pw1" && login.headers.authorization === undefined, login);
const tokened = after.filter(r => r.headers.authorization !== undefined);
ok("T36-38: after sign-in the page asks the plane under the session (op=whoami among its requests)",
   tokened.some(r => r.address.includes("op=whoami")), after.map(r => r.address));
ok("T36-38: every credentialed request carries exactly `Bearer <the session op=login answered>`",
   tokened.length > 0 && tokened.every(r => r.headers.authorization === "Bearer " + SESSION), tokened.map(r => [r.address, r.headers.authorization]));
ok("T36-38: the session never rides an address", after.every(r => !r.address.includes(SESSION)), after.map(r => r.address));
ok("T36-38: the surface holds the session as its credential", U.PLANE && U.PLANE.token === SESSION && U.PLANE.session === true);

/* ---- 4. the dev host's proxy carries the session to the plane ---- */
console.log("\n--- 4. the dev host forwards the session's header to the plane, and nothing else of it ---");
{
  const src = fs.readFileSync(new URL("../worker.template.mjs", import.meta.url), "utf8")
    .replace("__APP_HTML_BASE64__", Buffer.from("<html></html>").toString("base64"));
  const host = (await import("data:text/javascript;base64," + Buffer.from(src).toString("base64"))).default;
  const AT = [];
  const env = { PLANE: { fetch: async req => { AT.push({ url: req.url, auth: req.headers.get("authorization"),
    ct: req.headers.get("content-type"), body: req.method === "POST" ? await req.text() : "" });
    return new Response("{}", { headers: { "content-type": "application/json" } }); } } };
  await host.fetch(new Request("https://ui.test/api/?op=whoami", { headers: { authorization: "Bearer " + SESSION } }), env);
  await host.fetch(new Request("https://ui.test/api/?op=select", { method: "POST",
    headers: { authorization: "Bearer " + SESSION, "content-type": "application/json" }, body: "{\"ids\":[]}" }), env);
  await host.fetch(new Request("https://ui.test/api/?op=publishedmanifest"), env);
  ok("T36-38: a GET and a POST reach the plane with `Authorization: Bearer <the session>` exactly",
     AT.length === 3 && AT[0].auth === "Bearer " + SESSION && AT[1].auth === "Bearer " + SESSION, AT);
  ok("T36-38: the POST keeps its body and content type beside the header", AT[1].body === '{"ids":[]}' && AT[1].ct === "application/json", AT[1]);
  ok("T36-38: a request holding no credential reaches the plane with none", AT[2].auth === null, AT[2]);
  ok("T36-38: the session never rides the plane address the host builds", AT.every(r => !r.url.includes(SESSION)), AT.map(r => r.url));
}

/* ---- 5. the whole run ---- */
console.log("\n--- 4. the whole run ---");
ok("T36-38: no request of the " + SEEN.length + " this run asked for carries the shared token, in an address, a header or a body",
   SEEN.length > 0 && SEEN.every(r => !carries(r, SHARED)), SEEN.filter(r => carries(r, SHARED)));

console.log(`\nmember-token-retired: ${pass} pass, ${fail} fail`);
if(fail) process.exit(1);
