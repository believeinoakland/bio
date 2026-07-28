import fs from "fs";
import { appScript } from "./extract.mjs"; import vm from "vm"; import { webcrypto } from "crypto";
const els=new Map();
function el(){return{classList:{add(){},remove(){},toggle(){},contains(){return true}},style:{},dataset:{},value:"",innerHTML:"",textContent:"",scrollTop:0,disabled:false,offsetHeight:120,addEventListener(){},querySelectorAll(){return[]},querySelector(){return el()},insertAdjacentHTML(){},focus(){},href:"",download:"",click(){this._clicked=true},remove(){}}};
const ctx={console,URL,URLSearchParams,JSON,Array,Object,String,Number,Math,Date,RegExp,Promise,Uint8Array,Uint16Array,Map,Set,TextEncoder,crypto:webcrypto,
 Blob:class{constructor(a,o){this.type=o&&o.type}}, 
 setInterval:()=>1,clearInterval(){},setTimeout:fn=>{fn();return 1},requestAnimationFrame:fn=>fn(),
 document:{querySelector:s=>{if(!els.has(s))els.set(s,el());return els.get(s)},querySelectorAll:()=>[],addEventListener(){},documentElement:{setAttribute(){}},getElementById:()=>el(),hidden:false,createElement:()=>el(),body:{appendChild(){}}},
 location:{protocol:"https:"},history:{pushState(){},back(){}},localStorage:{getItem:()=>null,setItem(){}},
 window:{addEventListener(){},open:()=>({location:"",close(){}})},
 fetch:async()=>({ok:true,json:async()=>({ok:true,result:{}})})};
ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(appScript()+`;globalThis.__X={setGloss,glossWrap,sealFor,monitorNext,fmtWhenFull,artKind,mdLite};`,ctx);
const G=ctx.__X;

// per-bundle glossary layers and retracts
G.setGloss({"SSF":"Sewer Service Fund: the enterprise fund at the center of the case."});
const w1=G.glossWrap("The SSF and the ACFR");
if(!w1.includes('data-pop-gloss="SSF"')||!w1.includes('data-pop-gloss="ACFR"')) throw new Error("layered gloss failed: "+w1);
G.setGloss(null);
if(G.glossWrap("The SSF").includes("data-pop-gloss")) throw new Error("gloss did not retract");

// seals carry instance facts in title and popover data
const sv=G.sealFor("state","verified","information","Released by georgia on 21 Jul 2026.");
if(!sv.includes("Released by georgia")||!sv.includes('data-pop-extra=')) throw new Error("verified fact missing: "+sv);
const sc=G.sealFor("crit","crucial",null,"Load-bearing for: Sewer franchise diversion.");
if(!sc.includes("Load-bearing for")) throw new Error("crucial fact missing");

// monitor arithmetic
const nx=G.monitorNext("2026-07-20T00:00:00Z","daily");
if(!nx || nx.toISOString().slice(0,10)!=="2026-07-21") throw new Error("monitorNext daily wrong: "+nx);
if(G.monitorNext("2026-07-01T00:00:00Z","weekly").toISOString().slice(0,10)!=="2026-07-08") throw new Error("weekly wrong");
if(G.monitorNext(null,"daily")!==null || G.monitorNext("2026-07-01","fortnightly")!==null) throw new Error("unknown freq must be null");

// html captures are recognized and would render sandboxed, never as a tab
if(G.artKind("snapshots/page.html").view!=="html") throw new Error("html kind");
console.log("harness7: header facts, layered glossary, monitor math pass");
