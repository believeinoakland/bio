/* harness8: openBundle END TO END. Renders a full document page against a
   stubbed plane serving a realistic bundle (prose, glossary, chunked pdf,
   promotion log, revision, projection with references). Any ReferenceError
   or render failure in the page path fails here instead of in production. */
import fs from "fs";
import { appScript } from "./extract.mjs"; import vm from "vm"; import { webcrypto } from "crypto";
const els=new Map();
function el(sel){ const e={sel,classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},value:"",_html:"",textContent:"",scrollTop:0,disabled:false,offsetHeight:120,
  addEventListener(){},querySelectorAll:()=>[],querySelector:()=>el(),insertAdjacentHTML(p,h){e._html+=h},focus(){},click(){},remove(){}};
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}});
  return e; }
const BUNDLE_MD = `---
title: FY2026-27 adopted budget, Sewer Service Fund
object_type: information
current_state: verified
criticality: crucial
content_hash: sha256:abc123
source_status: live
source:
  locator: https://example.gov/budget.pdf
  authority: City of Oakland
  retrieved: 2026-07-19
---
The SSF transfers appear in the ACFR appendix.

## Session Log

### Session 2026-07-19 | First capture (daemon monitor-tick) | daemon
Trigger: named gathering request GATH-1
Changes: Bundle created at collected.

### Session 2026-07-21 | Ratification: collected to verified | georgia
Trigger: second member ratification pass
Changes: collected to verified released under I-18.`;
const IMG = {
 "bundle.md": BUNDLE_MD,
 "data/provenance.json": '{"grade":"B"}',
 "data/glossary.json": '{"SSF":"Sewer Service Fund: the enterprise fund at the center of the case."}',
 "snapshots/budget.pdf.p000": {sha256:"a".repeat(64), bytes:100},
 "snapshots/budget.pdf.p001": {sha256:"b".repeat(64), bytes:50},
 "snapshots/budget.pdf.tsr": {sha256:"c".repeat(64), bytes:10},
 "_history/bundle_20260720T000000Z_aaaa.md": "old text",
 "_history/promotion_20260721T000000Z_bbbb.json": JSON.stringify({target:"INFO-X",base:"e3b0",files:[{name:"bundle.md",sha256:null}],created:"2026-07-21T00:11:22Z",author:"bob",skill_version:"bio-plane"}),
};
const PROJ = { bundle_id:"INFO-X", object_type:"information", group_id:"believe-in-oakland", title:"FY2026-27 adopted budget, Sewer Service Fund",
 current_state:"verified", criticality:"crucial", bundle_sha:"d".repeat(64), monitor_enabled:1, monitor_frequency:"daily",
 monitor_last_checked:"2026-07-27T12:00:00Z", reeval_flag:0, annotations_open:0, fm_json:null };
const CITER = { bundle_id:"PROJ-1", object_type:"project", title:"Sewer franchise diversion", current_state:"forming", last_updated:"2026-07-20" };
const CITER_PROJ = { bundle_id:"PROJ-1", fm_json: JSON.stringify({references:[{rel:"cites",target:"INFO-X",status:"confirmed",note:"the budgeted transfers"}]}) };
const ctx={console,URL,URLSearchParams,JSON,Array,Object,String,Number,Math,Date,RegExp,Promise,Uint8Array,Uint16Array,Map,Set,TextEncoder,crypto:webcrypto,
 Blob:class{}, IntersectionObserver:undefined,
 setInterval:()=>1,clearInterval(){},setTimeout:fn=>{fn();return 1},requestAnimationFrame:fn=>fn(),
 document:{querySelector:s=>{if(!els.has(s))els.set(s,el(s));return els.get(s)},querySelectorAll:()=>[],addEventListener(){},documentElement:{setAttribute(){}},getElementById:()=>el(),hidden:false,createElement:()=>el(),body:{appendChild(){}}},
 location:{protocol:"https:"},history:{pushState(){},back(){}},localStorage:{getItem:()=>null,setItem(){}},
 window:{addEventListener(){},open:()=>null},
 fetch: async (u)=>{
   const q=new URL(u,"https://x.test").searchParams, op=q.get("op");
   const reply=o=>({ok:true,json:async()=>o});
   if(op==="image") return reply({ok:true,result:IMG});
   if(op==="projection") return reply({ok:true,result:q.get("id")==="PROJ-1"?CITER_PROJ:PROJ});
   if(op==="list") return reply({ok:true,result:[CITER,{bundle_id:"INFO-X",object_type:"information",title:"t",current_state:"verified",last_updated:"2026-07-20"}]});
   return reply({ok:true,result:{}});
 }};
ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(appScript()+";globalThis.__open=openBundle;",ctx);
await ctx.__open("INFO-X", true);
const html = els.get("#content")._html;
const must = [
  ["dochead frozen header","class=\"dochead\""],
  ["title","FY2026-27 adopted budget"],
  ["open control as link-tab","class=\"openlink\""],
  ["open control text","Open the document"],
  ["verified seal fact","Released by georgia"],
  ["crucial seal fact","Load-bearing for: Sewer franchise diversion"],
  ["monitor last","Last re-checked"],
  ["monitor next","next about"],
  ["bundle glossary term wrapped","data-pop-gloss=\"SSF\""],
  ["shared glossary term wrapped","data-pop-gloss=\"ACFR\""],
  ["session log narrative","Ratification: collected to verified"],
  ["promotion record mapped","revision recorded"],
  ["promotion author","bob"],
  ["type tag","data-ft=\"pdf\""],
  ["revision compare","compare to current"],
  ["artifact link","budget.pdf"],
  ["trust hash","abc123"],
  ["cited-by row","the budgeted transfers"],
  ["all four strata","id=\"s4\""],
  ["own scroll box","id=\"docscroll\""],
  ["stratum triangle + body","class=\"sbody\""],
  ["prose subsection collapsible","class=\"csec\""],
  ["session log is a csec heading","onclick=\"triToggle(this)\""],
  ["source material collapsible","The source material</h2><div class=\"cbody\""],
];
const misses = must.filter(([n,pat])=>!html.includes(pat));
if(misses.length) throw new Error("document page missing: "+misses.map(m=>m[0]).join("; ")+"\n---\n"+html.slice(0,600));
if(html.includes("Could not reach the plane")) throw new Error("errPane rendered");
const headEnd = html.indexOf('id="docscroll"');
if(html.slice(0,headEnd).includes('section class="stratum"')) throw new Error("a stratum leaked above the scroll box");
if(!html.slice(headEnd).includes('id="s1"')||!html.slice(headEnd).includes('id="s4"')) throw new Error("strata not inside the scroll box");
if(html.slice(0,headEnd).indexOf("docband")<0) throw new Error("band not in the fixed header");
console.log("harness8: full document page renders with every element present");
