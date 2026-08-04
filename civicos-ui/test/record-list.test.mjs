/* The record list: identity band, Type column, sortable headers both
   directions, seal-form state indicators with disclosure.
 *
 * THIS SUITE IS ALSO THE UI'S LEGACY-ALIAS REGRESSION (UI-10), the way
 * search.test.mjs is the plane's. The FOC-1 row below deliberately arrives
 * spelled `focus` in state `elevated` — a row written under the record's SECOND
 * name — and the assertions are that it renders IDENTICALLY to a canonical
 * `inquiry` row: same Type word, same seal, same scope. The plane's boot
 * normaliser projects `inquiry` for such a row today, so this fixture stands in
 * for the un-normalised case (a hand-authored document, a restored backup) and
 * proves the surface does not need the normalisation to have happened.
 *
 * CORRECTED 2026-08-04 (UI-10): the Type cell used to be asserted as ">Focus<"
 * and the scoped search as "type:focus" / "in Focuses". Both were written under
 * the second name. The member-facing word is now derived from the phase the
 * question is in, so a row in a pre-conclusion state reads "Inquiry" whatever
 * its stored spelling — which is the whole point of collapsing the type. */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
const els=new Map();
function el(){const e={classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},value:"",_html:"",textContent:"",scrollTop:0,disabled:false,addEventListener(){},querySelectorAll:()=>[],querySelector:()=>el(),insertAdjacentHTML(){},focus(){},click(){},remove(){}};Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}});return e;}
const LIST=[
 {bundle_id:"INFO-2",object_type:"information",title:"Bravo doc",current_state:"verified",criticality:"crucial",last_updated:"2026-07-21"},
 {bundle_id:"FOC-1",object_type:"focus",title:"Alpha focus",current_state:"elevated",last_updated:"2026-07-19"},
 {bundle_id:"PROJ-1",object_type:"project",title:"Charlie project",current_state:"forming",last_updated:"2026-07-20"},
 /* the same construct under its CANONICAL name, and in each phase, so the three
    member-facing words are exercised against the states that produce them */
 {bundle_id:"INQ-1",object_type:"inquiry",title:"Delta question",current_state:"open",last_updated:"2026-07-22"},
 {bundle_id:"INQ-2",object_type:"inquiry",title:"Echo finding",current_state:"concluded",last_updated:"2026-07-23"},
 {bundle_id:"INQ-3",object_type:"inquiry",title:"Foxtrot case",current_state:"published",last_updated:"2026-07-24"},
];
const ctx={console,URL,URLSearchParams,JSON,Array,Object,String,Number,Math,Date,RegExp,Promise,Uint8Array,Uint16Array,Map,Set,TextEncoder,crypto:webcrypto,Blob:class{},IntersectionObserver:undefined,
 setInterval:()=>1,clearInterval(){},setTimeout:fn=>{fn();return 1},requestAnimationFrame:fn=>fn(),
 document:{querySelector:s=>{if(s==="#docscroll")return null;if(!els.has(s))els.set(s,el());return els.get(s)},querySelectorAll:()=>[],addEventListener(){},documentElement:{setAttribute(){}},getElementById:()=>el(),hidden:false,createElement:()=>el(),body:{appendChild(){}}},
 location:{protocol:"https:"},history:{pushState(){},back(){}},localStorage:{getItem:()=>null,setItem(){}},window:{addEventListener(){},open:()=>null},
 fetch:async u=>{const p=new URL(u,"https://x.t").searchParams; const op=p.get("op"); const R=o=>({ok:true,json:async()=>o});
   if(op==="list")return R({ok:true,result:LIST});
   if(op==="search"){ ctx.__LASTQ=p.get("q");
     if(p.get("q")==="") return R({ok:true,result:{hits:[
       {bundle_id:"I1",object_type:"information",title:"Watched one",current_state:"verified",monitor_enabled:1,monitor_frequency:"daily",monitor_last_checked:"2026-07-27T12:00:00Z",last_updated:"2026-07-20"},
       {bundle_id:"I2",object_type:"information",title:"Flagged one",current_state:"collected",criticality:"crucial",reeval_flag:1,last_updated:"2026-07-21"}]}});
     return R({ok:true,result:{hits:[{bundle_id:"FOC-1",object_type:"focus",title:"Alpha focus",current_state:"elevated",last_updated:"2026-07-19"}]}}); }
   return R({ok:true,result:{}});}};
ctx.globalThis=ctx; vm.createContext(ctx);
vm.runInContext(appScript()+";globalThis.__r=renderRecord;globalThis.__s=listSortBy;",ctx);
await ctx.__r();
const head = els.get("#content")._html, table = els.get("#rectable")._html;
if(!head.includes('class="recband"')) throw new Error("record band missing");
for(const c of ["Item","Type","State","Updated"]) if(!table.includes(">"+c)) throw new Error("column missing: "+c);
if(!table.includes(">Info<")||!table.includes(">Project<")) throw new Error("type cells wrong");
/* ONE VOCABULARY: the legacy `focus` row and the canonical `inquiry` row both
   read Inquiry, and the phase decides the word for the other two. */
if((table.match(/>Inquiry</g)||[]).length!==2) throw new Error("legacy and canonical rows do not read the same word: "+table);
if(!table.includes(">Finding<")) throw new Error("a concluded question must read as a Finding");
if(!table.includes(">Case<")) throw new Error("a published question must read as a Case");
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
/* ================= CORRECTED 2026-08-05 BY UI-21 =================
   TWO BLOCKS STOOD HERE AND ARE MOVED, not exempted, because their SUBJECT
   moved and this file is about the RECORD LIST.

   (1) THE SCOPED SEARCH. It drove `quickSearch` from the Questions screen and
       asserted the plane query carried `type:inquiry sewer`, that the results
       said "in Questions", and that a legacy `focus` row survived the scope.
       The scope came from a surface-side map of hand-written query strings —
       the very table UI-10 had to correct here after the second rename — and
       UI-21 DELETED it. Scopes are composed from `op=searchfields` now, so what
       used to be asserted about a literal is asserted about a COMPOSITION
       against the published field list, in `finder.test.mjs`, which drives the
       scope strip, both routes and the whole query surface. The legacy-alias
       clause this file exists to protect is UNCHANGED and still asserted above,
       over the Type column and the seals, where it does not depend on a screen
       that no longer exists.

   (2) THE MONITORING COLUMNS. They drove `renderMonitoring`, a second list
       surface with its own table, which filtered ONE PAGE of the record in the
       browser on `monitor_enabled` / `reeval_flag` and presented the survivors'
       count as the record's. UI-21 deleted it: both questions are published
       selectors (`monitored:true`, `reeval:true`) the plane compiles, gates and
       COUNTS, and they are finder scopes now. `monitorNext` — the computation
       those columns were really testing — survives and is exercised where it is
       still read, on the DOCUMENT PAGE's monitored seal, by
       document-page.test.mjs ("monitor last" / "monitor next").
   ================================================================= */
console.log("record-list: band, type column, sorting, seals all pass");
