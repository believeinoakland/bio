import fs from "fs";
import { appScript } from "./extract.mjs"; import vm from "vm";
const els = new Map();
function el(){ return { classList:{add(){},remove(){},toggle(){},contains(){return true}},
  style:{}, dataset:{}, value:"", innerHTML:"", textContent:"", disabled:false, checked:false,
  addEventListener(){}, querySelectorAll(){return[]}, querySelector(){return el()},
  insertAdjacentHTML(pos,html){ this._inserted=(this._inserted||"")+html; },
  focus(){}, onclick:null, oninput:null };}
const CALLS = [];
const ctx = {
  console, URL, URLSearchParams, JSON, TextEncoder, setTimeout, Array, Object, String, Number, Math, Date, RegExp, Promise,
  document: { querySelector: s => { if(s==="#docscroll") return null; if(!els.has(s)) els.set(s, el()); return els.get(s); },
              querySelectorAll: () => [], addEventListener(){}, documentElement:{setAttribute(){}} },
  location: { protocol: "https:" },
  fetch: async (url, init) => {
    const u = new URL(url, "https://x.test"); const op = u.searchParams.get("op");
    CALLS.push({op, params:Object.fromEntries(u.searchParams), method:(init&&init.method)||"GET", body:init&&init.body?JSON.parse(init.body):null});
    const reply = o => ({ ok:true, json: async()=>o });
    if(op==="select"){
      const b = CALLS[CALLS.length-1].body;
      if(!b || !Array.isArray(b.ids) || !b.ids.length) return reply({ok:false, reason:"EMPTY"});
      return reply({ok:true, handle:"sel-abc123", kind:"enumerated", n:b.ids.length});
    }
    if(op==="release"){
      const p = CALLS[CALLS.length-1].params;
      if(!p.acknowledgment) return reply({ok:false, reason:"NO_ACKNOWLEDGMENT", detail:"..."});
      if(p.handle!=="sel-abc123") return reply({ok:false, reason:"NO_SUCH_SELECTION"});
      return reply({ok:true, released:["INFO-1","INFO-2"], acknowledgment:p.acknowledgment, mitigation:p.mitigation});
    }
    if(op==="search") return reply({ok:true, result:{hits:[
      {bundle_id:"INFO-1",title:"Doc one",object_type:"information",current_state:"collected",last_updated:"2026-07-20",criticality:"routine"},
      {bundle_id:"INFO-9",title:"Crucial doc",object_type:"information",current_state:"collected",last_updated:"2026-07-21",criticality:"crucial"}],total:2}});
    if(op==="list") return reply({ok:true, result:[]});
    if(op==="whoami") return reply({ok:true, result:{session:true,capabilities:["contribute"],handle:"georgia"}});
    return reply({ok:true, result:{}});
  },
};
ctx.addEventListener=()=>{}; ctx.history={pushState(){}}; ctx.localStorage={getItem:()=>null,setItem(){}}; ctx.IntersectionObserver=undefined; ctx.setInterval=()=>1; ctx.clearInterval=()=>{}; ctx.requestAnimationFrame=fn=>fn(); ctx.history={pushState(){},back(){}}; ctx.addEventListener=()=>{}; ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
const code = appScript();
vm.runInContext(code + `
;globalThis.__go = go; globalThis.__rec = rec; globalThis.__recPost = recPost; globalThis.__X = { PLANE, canRelease, loadReviewRows, doRelease, releaseRefusal, REL_RULE, openReleaseDialog, rvCount, renderReview };`, ctx);
const G = ctx.__X;
G.PLANE.token="tok"; G.PLANE.session=true; G.PLANE.me={session:true, capabilities:["contribute"], handle:"georgia"};
if(!G.canRelease()) throw new Error("canRelease should be true");
G.PLANE.me.capabilities=[]; if(G.canRelease()) throw new Error("canRelease must require contribute");
G.PLANE.me.capabilities=["contribute"];
const rows = await G.loadReviewRows();
if(rows.length!==2 || rows[1].criticality!=="crucial") throw new Error("loadReviewRows wrong");
ctx.document.querySelector("#rel-ack").value = "Batch is homogeneous, same capture run";
ctx.document.querySelector("#rel-mit").value = "Sampled five against sources";
try{
  const selp = await ctx.__recPost("select",{ids:["INFO-1","INFO-2"]},{kind:"enumerated"});
  console.log("stepwise select ok", selp.handle);
  const relp = await ctx.__rec("release",{handle:selp.handle,acknowledgment:"a",mitigation:"b"});
  console.log("stepwise release ok", relp.released);
  await ctx.__go("review");
  console.log("stepwise go ok");
}catch(err){ console.log("stepwise threw:", err && (err.stack||JSON.stringify(err))); }
CALLS.length=0; CALLS.push({op:"search"}); // keep later assertions meaningful
await G.doRelease(["INFO-1","INFO-2"]);
const sel = CALLS.find(c=>c.op==="select");
const rel = CALLS.find(c=>c.op==="release");
if(!sel || sel.method!=="POST" || sel.params.kind!=="enumerated" || sel.body.ids.length!==2) throw new Error("select call malformed: "+JSON.stringify(sel));
if(!rel || rel.params.handle!=="sel-abc123" || !rel.params.acknowledgment.includes("homogeneous") || rel.params.token!=="tok") throw new Error("release call malformed: "+JSON.stringify(rel));
const rv = ctx.document.querySelector("#rv");
if(!(rv._inserted||"").includes("Released 2 documents")){
  console.log("CALLS:", JSON.stringify(CALLS.map(c=>c.op)));
  console.log("rel-err:", ctx.document.querySelector("#rel-err").innerHTML);
  console.log("rv.innerHTML len:", (rv.innerHTML||"").length);
  throw new Error("success card missing: "+rv._inserted);
}
const html = G.releaseRefusal({reason:"ENTRY_REQUIREMENTS", detail:"verified state has entry requirements",
  offenders:[{id:"INFO-4", missing:["data/dataset.json","a file in snapshots/"]}]});
if(!html.includes("INFO-4") || !html.includes("data/dataset.json") || !html.includes("ENTRY_REQUIREMENTS")) throw new Error("refusal render wrong: "+html);
const html2 = G.releaseRefusal({reason:"ILLEGAL_TRANSITION", offenders:[{id:"INFO-7", from:"verified"}]});
if(!html2.includes("currently verified")) throw new Error("illegal transition render wrong");
if(!G.REL_RULE.test('has "quote"') || !G.REL_RULE.test("back\\slash") || !G.REL_RULE.test("new\nline") || G.REL_RULE.test("clean text, fine.")) throw new Error("REL_RULE mismatch");
console.log("harness: all release-flow checks pass");
