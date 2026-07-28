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
vm.runInContext(appScript()+`;globalThis.__X={fetchParts,artKind,renderSourceItem,VIEW_REG:()=>VIEW_REG};`,ctx);
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
console.log("harness6: verified viewer checks pass");
