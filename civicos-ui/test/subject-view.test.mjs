/* UI-4 — THE SUBJECT VIEW ("what the record knows about a subject").
 *
 * Drives the member surface over the plane's M4 reverse index: op=entitybyalias
 * (find a subject by name/alias), op=entity (by id), op=concerns (every document
 * that concerns it, each with its §8.1 resolution grade), op=connections (the
 * graded links among those documents). Proves the four things UI-4's accepts-when
 * names, plus the two honesty properties the framework makes load-bearing:
 *   (1) look up an entity by alias;
 *   (2) list the documents that concern it WITH their grades;
 *   (3) a Grade C document renders as UNCONFIRMED, never as established
 *       (established/needs_confirmation are READ FROM op=concerns, not re-derived);
 *   (4) a declared relation renders WITHOUT a connection grade (D-83: constitutive,
 *       not evidentiary — it shows justification + citation and no A–D grade).
 *
 * NEGATIVE CONTROL: break the honest-grade seam in app.html — make subjGradeBadge()
 * take the ESTABLISHED branch regardless of the plane's flags (e.g. change
 * `if(established && !needsConfirm){` to `if(true){`) — and the Grade-C assertions
 * fail: the C document now renders "Grade C · established" instead of "Grade C ·
 * unconfirmed", so both "a Grade C document is shown as unconfirmed" and "a Grade C
 * document is never shown as established" fail, and the connection's weaker-C
 * assertion fails too. RUN 2026-07-31: with the seam forced to `if(true){`, 5 of
 * <n> assertions failed ("the Grade C document is flagged unconfirmed", "the Grade
 * C document is NEVER shown as established", "the C document says plausible-not-
 * established", "no Grade C anywhere reads as established", "the weaker-C connection
 * reads unconfirmed"); restored to `if(established && !needsConfirm){` -> all green.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---- the mock plane: answers the four read ops UI-4 consumes ---- */
const CALLS = [];
const ENTITY = {
  entity_id:"ENT-1", kind:"person", label:"Sheng Thao", note:null,
  declared_by:"m_alice", at:"2026-07-20T00:00:00Z",
  aliases:[
    { alias:"Sheng Thao", canonical:true,  declared_by:"m_alice", at:"2026-07-20T00:00:00Z" },
    { alias:"Mayor Thao", canonical:false, declared_by:"m_alice", at:"2026-07-21T00:00:00Z" },
  ],
  relations:[
    { relation_id:"REL-1", relation:"member_of", from_entity:"ENT-1", to_entity:"ENT-9",
      direction:"out",
      justification:"The mayor sits on the Oakland City Council as its presiding member.",
      citation:"City Charter Art. IV §400", declared_by:"m_alice", at:"2026-07-22T00:00:00Z" },
  ],
};
/* op=concerns: one established (Grade A) document, one correspondence (Grade C).
   established / needs_confirmation are the plane's, exactly as documentsConcerning
   surfaces them — the UI reads them, it does not re-derive them from the letter. */
const CONCERNS = { ok:true, entity_id:"ENT-1", found:true,
  entity:{ entity_id:"ENT-1", kind:"person", label:"Sheng Thao" },
  count:2, resolution_count:2,
  documents:[
    { capture_sha:"a".repeat(64), bundle_id:"INFO-2026-0100", ref:"person:sheng-thao",
      grade:"A", method:"the source's own identifier", established:true,  needs_confirmation:false, at:"2026-07-23T00:00:00Z" },
    { capture_sha:"c".repeat(64), bundle_id:"INFO-2026-0200", ref:"name:Sheng Thao",
      grade:"C", method:"name correspondence",         established:false, needs_confirmation:true,  at:"2026-07-24T00:00:00Z" },
  ] };
/* op=connections: the one pair, graded the WEAKER of its ends (B and C -> C), so it
   is never established. */
const CONNECTIONS = { ok:true, entity_id:"ENT-1", capture_sha:null, count:1,
  connections:[
    { a_capture_sha:"a".repeat(64), b_capture_sha:"c".repeat(64), entity_id:"ENT-1",
      a_bundle_id:"INFO-2026-0100", b_bundle_id:"INFO-2026-0200",
      grade:"C", a_grade:"B", b_grade:"C", established:false, needs_confirmation:true,
      asserted_by:"system", basis:"both documents concern Sheng Thao", at:"2026-07-25T00:00:00Z" },
  ] };

function mockFetch(u, opts){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  const R = o => ({ ok:true, json:async()=>o });
  CALLS.push({ op, alias:url.searchParams.get("alias"), id:url.searchParams.get("id") });
  if(op==="entitybyalias"){
    const norm = (url.searchParams.get("alias")||"").trim().toLowerCase();
    const hit = ENTITY.aliases.some(a=>a.alias.toLowerCase()===norm);
    return R(hit ? { ok:true, alias:url.searchParams.get("alias"), count:1, entities:[ENTITY] }
                 : { ok:true, alias:url.searchParams.get("alias"), count:0, entities:[] });
  }
  if(op==="entity")      return R(url.searchParams.get("id")==="ENT-1" ? { ok:true, found:true, entity:ENTITY } : { ok:true, found:false, entity:null });
  if(op==="concerns")    return R(CONCERNS);
  if(op==="connections") return R(CONNECTIONS);
  return R({ ok:false, reason:"unexpected op "+op });
}

/* ---- a DOM stub good enough for innerHTML inspection ---- */
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }

const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
    hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:async(u,opts)=>mockFetch(u,opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() +
  ";globalThis.__PLANE=PLANE;globalThis.__renderSubjectView=renderSubjectView;" +
  "globalThis.__lookupSubject=lookupSubject;globalThis.__showEntity=showEntity;", ctx);

ctx.__PLANE.session = true;
ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };

/* ---- (1) look up a subject BY ALIAS ---- */
await ctx.__renderSubjectView();
els.get("#subj-q").value = "Mayor Thao";        // a non-canonical alias, on purpose
await ctx.__lookupSubject();
const html = els.get("#subj-res")._html;
ok("op=entitybyalias was called to find the subject by name", CALLS.some(c=>c.op==="entitybyalias" && c.alias==="Mayor Thao"));
ok("the subject's kind is shown", /Person/.test(html));
ok("the subject's label is shown", html.includes("Sheng Thao"));
ok("the aliases are shown (canonical and other)", html.includes("Mayor Thao") && html.includes("Known as"));

/* ---- (4) a DECLARED RELATION renders WITHOUT a connection grade (D-83) ---- */
const relSec = (/Declared relations<\/h2>([\s\S]*?)<\/section>/.exec(html)||[])[1] || "";
ok("the declared relation is shown", /member of/i.test(relSec));
ok("the relation carries its justification", relSec.includes("presiding member") || relSec.includes("City Council"));
ok("the relation carries its citation", relSec.includes("City Charter"));
ok("the relation is labelled CONSTITUTIVE, not evidence", /constitutive statement, not evidence/.test(relSec));
/* the load-bearing property: no A–D grade anywhere on a declared relation */
ok("a declared relation carries NO §8.1 grade", !/Grade [ABCD]/.test(relSec));

/* ---- (2) every document that concerns it, WITH its grade ---- */
ok("op=concerns was called for the reverse index", CALLS.some(c=>c.op==="concerns" && c.id==="ENT-1"));
ok("the established (Grade A) document is listed", html.includes("INFO-2026-0100"));
ok("the correspondence (Grade C) document is listed", html.includes("INFO-2026-0200"));
ok("the Grade A document is shown as established", html.includes("Grade A · established"));
ok("the Grade A document names HOW it was established", html.includes("Established by the source's own identifier"));

/* ---- (3) the Grade C document is UNCONFIRMED, NEVER established ---- */
ok("the Grade C document is flagged unconfirmed", html.includes("Grade C · unconfirmed"));
ok("the C document says plausible, not established", html.includes("Plausible, not established"));
/* subjGradeBadge only ever emits '· established' on the established branch, so this
   single assertion is the honest-C property and the negative control's target. */
ok("the Grade C document is NEVER shown as established", !html.includes("Grade C · established"));
ok("no Grade C anywhere reads as established", !/Grade C · established/.test(html));
ok("the established document is never mislabelled unconfirmed", !html.includes("Grade A · unconfirmed"));

/* ---- the graded connections among those documents ---- */
ok("op=connections was called", CALLS.some(c=>c.op==="connections" && c.id==="ENT-1"));
ok("the connection between the two documents is shown", html.includes("INFO-2026-0100") && html.includes("INFO-2026-0200") && /&harr;|↔/.test(html));
ok("the connection states it takes the weaker of its two ends", /weaker/.test(html));
/* the connection's grade is the weaker end (B,C -> C): it must read unconfirmed */
ok("the weaker-C connection reads unconfirmed, never established",
   html.includes("Grade C · unconfirmed") && !/Grade C · established/.test(html));

/* ---- a subject found BY ID reads directly through op=entity ---- */
CALLS.length = 0;
await ctx.__showEntity("ENT-1");
ok("op=entity reads a subject by its id", CALLS.some(c=>c.op==="entity" && c.id==="ENT-1"));

/* ---- an unknown name is honest, never a phantom ---- */
els.get("#subj-q").value = "Nobody Here";
await ctx.__lookupSubject();
const miss = els.get("#subj-res")._html;
ok("an unknown name is stated as not in the registry, not invented",
   /No subject in the registry is known by/.test(miss));

/* ---- the vocabulary guard: no plane-internal jargon reaches the member ---- */
for(const word of ["op=", "capture_sha", "entity_id", "needs_confirmation", "resolutions",
                   "reading_ref", "declared_by", "asserted_by"])
  ok(`the subject surface never says "${word}"`, !html.includes(word));

if(fails.length){ console.error(`subject-view: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`subject-view: ${n} assertions, all green — lookup-by-alias, concerns-with-grades, Grade-C-unconfirmed-not-established, relation-without-grade, graded-connections`);
