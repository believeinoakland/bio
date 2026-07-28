import fs from "fs";
import { appScript } from "./extract.mjs"; import vm from "vm";
const els=new Map();
function el(){return{classList:{add(){},remove(){},toggle(){},contains(){return true}},style:{},dataset:{},value:"",innerHTML:"",textContent:"",scrollTop:0,addEventListener(){},querySelectorAll(){return[]},querySelector(){return el()},insertAdjacentHTML(){},focus(){}}};
const ctx={console,URL,URLSearchParams,JSON,Array,Object,String,Number,Math,Date,RegExp,Promise,Uint16Array,Map,Set,setInterval:()=>1,clearInterval(){},
 document:{querySelector:s=>{if(s==="#docscroll")return null;if(!els.has(s))els.set(s,el());return els.get(s)},querySelectorAll:()=>[],addEventListener(){},documentElement:{setAttribute(){}},getElementById:()=>el(),hidden:false},
 location:{protocol:"https:"},history:{pushState(){}},localStorage:{getItem:()=>null,setItem(){}},
 window:{addEventListener(){}},
 fetch:async()=>({ok:true,json:async()=>({ok:true,result:{}})})};
ctx.requestAnimationFrame=fn=>fn(); ctx.setTimeout=(fn,ms)=>{try{fn()}catch(e){}return 1}; ctx.history={pushState(){},back(){}}; ctx.addEventListener=()=>{}; ctx.globalThis=ctx;
vm.createContext(ctx);
const code=appScript();
vm.runInContext(code+`;globalThis.__X={glossWrap,GLOSSARY,mdLite,NAVSTACK,navRemember,navLabel,STRATA_INFO,stratum,CUR};`,ctx);
const G=ctx.__X;

// glossary wraps prose text but never inside tags or attributes
const w=G.glossWrap('<a href="http://x/ACFR">the ACFR of FY23</a> and sha256 rules');
if(!w.includes('href="http://x/ACFR"')) throw new Error("glossary broke a tag: "+w);
if(!(w.match(/data-pop-gloss="ACFR"/g)||[]).length) throw new Error("ACFR not wrapped");
if(!w.includes('data-pop-gloss="FY"')) throw new Error("FY not wrapped");
if(!w.includes('data-pop-gloss="sha256"')) throw new Error("sha256 not wrapped");
// every glossary key has prose
for(const [k,v] of Object.entries(G.GLOSSARY)) if(!v || v.length<20) throw new Error("thin glossary entry "+k);
// mdLite output passes through glossWrap
const md=G.mdLite("The ACFR shows the transfer.");
if(!md.includes("data-pop-gloss")) throw new Error("prose not glossed: "+md);
// nav stack remembers scroll and labels sensibly
ctx.document.querySelector("#content").scrollTop=420;
G.navRemember();
const top=G.NAVSTACK[G.NAVSTACK.length-1];
if(top.scroll!==420||top.key!=="record") throw new Error("nav remember wrong: "+JSON.stringify(top));
if(G.navLabel(top)!=="The record") throw new Error("nav label wrong");
// stratum wrapper carries the eyebrow and the id
const st=G.stratum("s3","<p>x</p>");
if(!st.includes('id="s3"')||!st.includes("Trust")||!st.includes("eyebrow-s")) throw new Error("stratum wrapper wrong");
console.log("harness4: refinement checks pass");
