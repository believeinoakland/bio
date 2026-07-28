import fs from "fs";
import { appScript } from "./extract.mjs"; import vm from "vm";
const els=new Map();
function el(){return{classList:{add(){},remove(){},toggle(){},contains(){return true}},style:{},dataset:{},value:"",innerHTML:"",textContent:"",scrollTop:0,addEventListener(){},querySelectorAll(){return[]},querySelector(){return el()},insertAdjacentHTML(){},focus(){}}};
const ctx={console,URL,URLSearchParams,JSON,Array,Object,String,Number,Math,Date,RegExp,Promise,Uint16Array,Map,Set,CSS:{escape:x=>x},
 setInterval:()=>1,clearInterval(){},setTimeout:(fn)=>{fn();return 1},requestAnimationFrame:fn=>fn(),
 document:{querySelector:s=>{if(!els.has(s))els.set(s,el());return els.get(s)},querySelectorAll:()=>[],addEventListener(){},documentElement:{setAttribute(){}},getElementById:()=>el(),hidden:false},
 location:{protocol:"https:"},history:{pushState(){},back(){}},localStorage:{getItem:()=>null,setItem(){}},
 window:{addEventListener(){}},
 fetch:async(u)=>({ok:true,json:async()=>({ok:true,result: String(u).includes("op=list")?[]:{}})})};
ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(appScript()+`;globalThis.__X={sealFor,SEMANTICS,NAVSTACK,navRemember,navBackDo,CUR,restoreScroll,go,openBundle:null};globalThis.__go=go;`,ctx);
const G=ctx.__X;

// seals: verified is the good fill, crucial is the attention ring with "!"
const v=G.sealFor("state","verified","information");
if(!v.includes("s-good")||!v.includes(">V<")||!v.includes('data-pop-state="verified"')) throw new Error("verified seal wrong: "+v);
const c=G.sealFor("crit","crucial");
if(!c.includes("s-attn")||!c.includes(">!<")) throw new Error("crucial seal wrong: "+c);
const m=G.sealFor("flag","monitored");
if(!m.includes(">M<")||m.includes("s-good")) throw new Error("monitored seal wrong: "+m);
if(G.sealFor("state","nonsense","information").includes("s-good")) throw new Error("unknown state must not read good");
// every declared state and flag has a usable mark (single glyph)
for(const t of Object.values(G.SEMANTICS.types)) for(const [k,r] of Object.entries(t.states))
  if(!(r.mark||r.chip) ) throw new Error("no mark path for "+k);
// back restores the exact scroll through the render cycle
ctx.document.querySelector("#content").scrollTop=777;
G.navRemember();                     // leaving the record at 777
ctx.document.querySelector("#content").scrollTop=0;   // now elsewhere
await G.navBackDo();                 // back
if(ctx.document.querySelector("#content").scrollTop!==777) throw new Error("scroll not restored: "+ctx.document.querySelector("#content").scrollTop);
console.log("harness5: seals and back-restore checks pass");
