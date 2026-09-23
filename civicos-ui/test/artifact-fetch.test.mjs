import fs from "fs";
import { appScript } from "./extract.mjs"; import vm from "vm"; import { webcrypto } from "crypto";
const els=new Map();
function el(){return{classList:{add(){},remove(){},toggle(){},contains(){return true}},style:{},dataset:{},value:"",innerHTML:"",textContent:"",scrollTop:0,disabled:false,addEventListener(){},querySelectorAll(){return[]},querySelector(){return el()},insertAdjacentHTML(){},focus(){}}};
const sha = async b => [...new Uint8Array(await webcrypto.subtle.digest("SHA-256",b))].map(x=>x.toString(16).padStart(2,"0")).join("");
const P1 = new TextEncoder().encode("part-one-bytes"), P2 = new TextEncoder().encode("part-two");
const S1 = await sha(P1), S2 = await sha(P2);
const ctx={console,URL,URLSearchParams,JSON,Array,Object,String,Number,Math,Date,RegExp,Promise,Uint8Array,Uint16Array,Map,Set,TextEncoder,
 crypto: webcrypto, Blob: class{constructor(a,o){this.parts=a;this.type=o&&o.type}}, 
 setInterval:()=>1,clearInterval(){},setTimeout:(fn)=>{fn();return 1},requestAnimationFrame:fn=>fn(),
 document:{querySelector:s=>{if(!els.has(s))els.set(s,el());return els.get(s)},querySelectorAll:()=>[],addEventListener(){},documentElement:{setAttribute(){}},getElementById:()=>el(),hidden:false},
 location:{protocol:"https:"},history:{pushState(){},back(){}},localStorage:{getItem:()=>null,setItem(){}},
 window:{addEventListener(){}},
 fetch: async (u)=>{
   const q = new URL(u,"https://x.test").searchParams;
   if(q.get("op")==="capture"){
     const want = q.get("sha256");
     if(want===S1) return {ok:true, arrayBuffer:async()=>P1.buffer.slice(0)};
     if(want===S2) return {ok:true, arrayBuffer:async()=>P2.buffer.slice(0)};
     if(want==="feedbead") return {ok:true, arrayBuffer:async()=>new TextEncoder().encode("WRONG BYTES").buffer};
     return {ok:false, json:async()=>({ok:false,reason:"NOT_FOUND"})};
   }
   return {ok:true, json:async()=>({ok:true,result:{}})};
 }};
ctx.URLo = URL; ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(appScript()+`;globalThis.__X={fetchParts,artKind,renderSourceItem,sanitizeCapturedHtml,VIEW_REG:()=>VIEW_REG};`,ctx);
const G=ctx.__X;

// success: parts fetched in order, each verified, concatenated in order
const prog=[];
const ok = await G.fetchParts([{path:"a.pdf.p000",bytes:P1.length,sha:S1},{path:"a.pdf.p001",bytes:P2.length,sha:S2}],(i,n,g)=>prog.push([i,n,g]));
if(!ok.ok || ok.n!==2) throw new Error("fetchParts failed: "+JSON.stringify(ok));
const joined = new TextDecoder().decode(ok.bytes);
if(joined!=="part-one-bytespart-two") throw new Error("concat order wrong: "+joined);
if(prog.length!==2 || prog[1][2]!==P1.length+P2.length) throw new Error("progress wrong: "+JSON.stringify(prog));

// integrity: wrong bytes are REFUSED, never shown
const bad = await G.fetchParts([{path:"x.pdf.p000",bytes:11,sha:"feedbead"}]);
if(bad.ok || bad.reason!=="BYTES_DO_NOT_MATCH_THE_RECORD") throw new Error("mismatch not refused: "+JSON.stringify(bad));

// a missing capture carries the plane's reason
const miss = await G.fetchParts([{path:"y",bytes:1,sha:"0".repeat(64)}]);
if(miss.ok || miss.reason!=="NOT_FOUND") throw new Error("missing part reason wrong: "+JSON.stringify(miss));

// kinds
if(G.artKind("snapshots/x.pdf").view!=="pdf") throw new Error("pdf kind");
if(G.artKind("scan.JPG").type!=="image/jpeg") throw new Error("jpeg kind");
if(G.artKind("t.tsr").view!==null) throw new Error("tsr kind");
// captured html is defanged before it ever reaches a tab
const dirty = '<html><head><script src="x.js"></scr'+'ipt><style>a{}</style></head><body onload="evil()"><a href="javascript:steal()">x</a><img src="pic.png" onerror=evil()><p>The finding stands.</p></body></html>';
const clean = G.sanitizeCapturedHtml(dirty);
if(/<script/i.test(clean)) throw new Error("script survived");
if(/onload=|onerror=/i.test(clean)) throw new Error("handler survived");
if(/javascript:/i.test(clean)) throw new Error("javascript: survived");
if(!clean.includes("The finding stands.")||!clean.includes("<style>a{}</style>")||!clean.includes('src="pic.png"')) throw new Error("content harmed: "+clean);
/* D-192 ARM — THE VIEW-TIME GUARANTEE THAT A CAPTURED PAGE RUNS NO SCRIPT, pinned at the
   attribute that carries it (framework §15, the subresources and render-companion row).
   `sanitizeCapturedHtml` above is the SECOND line; the first is the frame's `sandbox`, and
   on the manifest path it is the ONLY one, because the render companion keeps its held
   scripts' bytes. So the assertion is on the attribute's VALUE, not its presence:
   `sandbox="allow-scripts"` EXISTS and runs code, and an arm asserting mere existence
   would pass it. An empty value (or a bare `sandbox`, which HTML reads identically) is
   the one reading that grants nothing — no scripts, and an opaque origin.
   Two readings, because either alone can be fooled:
   (a) DRIVEN — `openArtifact` is run on a verified html capture and every <iframe> in what
       it actually wrote, to the tab AND to the inline box, is read. This is the frame a
       member sees, not a string that resembles it.
   (b) SWEPT — every `<iframe` in app.html's SOURCE, so a second frame on a path (a) did not
       drive cannot ship unpinned. The matcher sees an `<iframe` written literally in the
       file; it CANNOT see a frame built by `createElement("iframe")` or by a tag split
       across a concatenation — so both spellings are counted and must be ZERO, which turns
       what the matcher cannot see into a refusal rather than a silence.
   NEGATIVE CONTROL: (1) `sandbox=""` → `sandbox="allow-scripts"` at the capture frame in
   app.html; (2) the attribute removed; both declared RED at a `D-192` assertion by name,
   and (3) over-strictness, `sandbox=""` → bare `sandbox`, declared GREEN; plus (4) a second,
   unsandboxed <iframe> appended to app.html and (5) a `createElement("iframe")` appended,
   both declared RED. RUN 2026-09-23 by D-192, each arm ALONE on app.html (pristine
   sha256 6ea12e5f…3813, 1,440,676 bytes): (1) RED at "D-192 driven/tab frame 0: capture
   frame sandbox grants "allow-scripts""; (2) RED at "D-192 driven/tab frame 0: capture frame
   has NO sandbox attribute"; (3) GREEN; (4) RED at "D-192 source frame 1"; (5) RED at
   "D-192 source: 1 frame(s) built in a spelling this arm cannot read"; a no-op baseline arm
   GREEN. All five AS DECLARED; every restore verified by sha256 AND cmp. */
{
  const ATTR = /\s([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  const frames = html => [...String(html).matchAll(/<iframe\b([^>]*)>/gi)].map(m => {
    const attrs = new Map();
    for(const a of m[1].matchAll(ATTR)){
      const name = a[1].toLowerCase();
      if(!attrs.has(name)) attrs.set(name, a[2] ?? a[3] ?? a[4] ?? "");   // HTML keeps the FIRST
    }
    return { tag: m[0].slice(0, 120), attrs };
  });
  const pin = (where, list) => {
    if(!list.length) throw new Error(`D-192 ${where}: no <iframe> found — the arm read an EMPTY corpus`);
    list.forEach((f, i) => {
      if(!f.attrs.has("sandbox")) throw new Error(`D-192 ${where} frame ${i}: capture frame has NO sandbox attribute: ${f.tag}`);
      const tokens = f.attrs.get("sandbox").trim();
      if(tokens !== "") throw new Error(`D-192 ${where} frame ${i}: capture frame sandbox grants "${tokens}" — it must be EMPTY: ${f.tag}`);
    });
    return list.length;
  };

  // (a) DRIVEN: a verified html capture opened through the shipped function.
  const PAGE = new TextEncoder().encode('<html><body onload="evil()"><script>evil()</scr'+'ipt><p>The finding stands.</p></body></html>');
  const SP = await sha(PAGE);
  const origFetch = ctx.fetch;
  ctx.fetch = async (u) => {
    const q = new URL(u, "https://x.test").searchParams;
    if(q.get("op")==="capture" && q.get("sha256")===SP) return {ok:true, arrayBuffer:async()=>PAGE.buffer.slice(0)};
    return origFetch(u);
  };
  ctx.TextDecoder = TextDecoder;
  let tab = "";
  ctx.window.open = () => ({ opener: 1, document: { open(){}, write(s){ tab += s; }, close(){} }, close(){} });
  ctx.URL = Object.assign(function(...a){ return new URL(...a); }, { createObjectURL: () => "blob:d192" });
  ctx.URL.prototype = URL.prototype;
  G.VIEW_REG()["d192"] = { base: "snapshots/page.html", parts: [{ path: "snapshots/page.html", bytes: PAGE.length, sha: SP }], total: PAGE.length };
  await vm.runInContext("openArtifact", ctx)("d192");
  const inline = els.get("#av-d192")?.innerHTML || "";
  if(!inline.includes("capframe")) throw new Error("D-192 driven: openArtifact wrote no capture frame to the inline box: " + inline.slice(0, 200));
  const nTab = pin("driven/tab", frames(tab)), nBox = pin("driven/inline", frames(inline));

  // (b) SWEPT: every literal <iframe in the shipped page's source.
  const SRC = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const nSrc = pin("source", frames(SRC));
  const hidden = (SRC.match(/createElement\(\s*["'`]iframe["'`]\s*\)|["'`]<ifr["'`]|\.sandbox\s*=/gi) || []);
  if(hidden.length) throw new Error(`D-192 source: ${hidden.length} frame(s) built in a spelling this arm cannot read (${hidden.join(", ")}) — extend the arm to read them`);
  console.log(`D-192: capture-frame sandbox EMPTY on every frame — driven tab ${nTab}, driven inline ${nBox}, source ${nSrc}`);
}
console.log("harness6: verified viewer checks pass");
