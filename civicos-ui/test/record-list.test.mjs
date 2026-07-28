/* The record list: identity band, Type column, sortable headers both
   directions, seal-form state indicators with disclosure. */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
const els=new Map();
function el(){const e={classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},value:"",_html:"",textContent:"",scrollTop:0,disabled:false,addEventListener(){},querySelectorAll:()=>[],querySelector:()=>el(),insertAdjacentHTML(){},focus(){},click(){},remove(){}};Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}});return e;}
const LIST=[
 {bundle_id:"INFO-2",object_type:"information",title:"Bravo doc",current_state:"verified",criticality:"crucial",last_updated:"2026-07-21"},
 {bundle_id:"FOC-1",object_type:"focus",title:"Alpha focus",current_state:"elevated",last_updated:"2026-07-19"},
 {bundle_id:"PROJ-1",object_type:"project",title:"Charlie project",current_state:"forming",last_updated:"2026-07-20"},
];
const ctx={console,URL,URLSearchParams,JSON,Array,Object,String,Number,Math,Date,RegExp,Promise,Uint8Array,Uint16Array,Map,Set,TextEncoder,crypto:webcrypto,Blob:class{},IntersectionObserver:undefined,
 setInterval:()=>1,clearInterval(){},setTimeout:fn=>{fn();return 1},requestAnimationFrame:fn=>fn(),
 document:{querySelector:s=>{if(s==="#docscroll")return null;if(!els.has(s))els.set(s,el());return els.get(s)},querySelectorAll:()=>[],addEventListener(){},documentElement:{setAttribute(){}},getElementById:()=>el(),hidden:false,createElement:()=>el(),body:{appendChild(){}}},
 location:{protocol:"https:"},history:{pushState(){},back(){}},localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},open:()=>null},
 fetch:async u=>{const op=new URL(u,"https://x.t").searchParams.get("op");const R=o=>({ok:true,json:async()=>o});
   if(op==="list")return R({ok:true,result:LIST}); return R({ok:true,result:{}});}};
ctx.globalThis=ctx; vm.createContext(ctx);
vm.runInContext(appScript()+";globalThis.__r=renderRecord;globalThis.__s=listSortBy;",ctx);
await ctx.__r();
const head = els.get("#content")._html, table = els.get("#rectable")._html;
if(!head.includes('class="recband"')) throw new Error("record band missing");
for(const c of ["Item","Type","State","Updated"]) if(!table.includes(">"+c)) throw new Error("column missing: "+c);
if(!table.includes(">Info<")||!table.includes(">Focus<")||!table.includes(">Project<")) throw new Error("type cells wrong");
if(!table.includes('data-pop-state="verified"')||!table.includes('class="seal')) throw new Error("state not seal-form");
if(!table.includes('data-pop-crit="crucial"')) throw new Error("crucial seal missing");
// sort by title ascending: Alpha, Bravo, Charlie
ctx.__s("title");
const t1 = els.get("#rectable")._html;
const order = ["Alpha focus","Bravo doc","Charlie project"].map(x=>t1.indexOf(x));
if(!(order[0]<order[1]&&order[1]<order[2])) throw new Error("asc sort wrong: "+order);
if(!t1.includes("\u25B2")) throw new Error("asc arrow missing");
// again: descending
ctx.__s("title");
const t2 = els.get("#rectable")._html;
const order2 = ["Charlie project","Bravo doc","Alpha focus"].map(x=>t2.indexOf(x));
if(!(order2[0]<order2[1]&&order2[1]<order2[2])) throw new Error("desc sort wrong");
if(!t2.includes("\u25BC")) throw new Error("desc arrow missing");
console.log("record-list: band, type column, sorting, seals all pass");
