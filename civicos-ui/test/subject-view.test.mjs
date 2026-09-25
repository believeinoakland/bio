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
 *
 * NEGATIVE CONTROL (UI-95, derivation stated): RUN 2026-09-25. ARM 1 — drop the render,
 * deleting `${c && c._err ? "" : connectionsDerivationHtml(c)}` from subjConnectionsHtml
 * (anchor matched once): declared MUST FAIL the cut-set arm, MUST NOT fail the whole,
 * failed-read or document-page arms. Actual: 7 of 48 failed, led by "UI-95 · CUT-SET: a cut
 * derivation shows the plane's sentence VERBATIM beside the list", plus the three
 * unrecorded causes, the empty-list, over-strictness and missing-key arms; the whole arms
 * held. ARM 2 — delete connectionsDerivationHtml's `if(d.cut !== true && d.derived ===
 * "derived") return ``;` so a whole derivation renders too: declared MUST FAIL the two
 * "shows no derivation sentence" arms and nothing else. Actual: exactly those 2 of 48.
 * Each arm restored from a per-arm pristine copy, `cmp` equal, sha256 dcc684cd9095b083…
 * (1,599,985 B) before and after; 48/48 green.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not
   discard the writer's own output. SHARED from the plane's test estate rather than copied into
   this one — ONE implementation, so `bio-plane/test/tally-through-pipe.test.mjs` guards it for
   both estates and a node release closing the private door goes red once instead of half. The
   import is for its SIDE EFFECT and is idempotent. Census: `stdio-census.test.mjs`. */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
/* UI-95: the derivation sentences come from the plane's OWN function, imported, never a hand
   copy — a copy agrees with the surface for free and with the plane on nothing. */
import { derivationStatement } from "../../bio-plane/src/airun.mjs";

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
  ],
  /* CORRECTED 2026-09-25 (UI-95): since D-241 the plane's entity arm ALWAYS carries
     `derivation`, and this fixture predated it — it answered a shape the real plane no
     longer sends. It now carries a WHOLE recorded derivation, the ordinary case, which
     the surface must render as nothing beyond the list. */
  derivation: derivationStatement({ at:"2026-07-25T00:00:00Z", state:"PRESENT",
    detail:"the derivation read 2 document(s) concerning this entity and wrote 1 connection(s)" }) };

function mockFetch(u, opts){
  const url = new URL(u, "https://plane.test");
  const op = url.searchParams.get("op");
  /* CORRECTED 2026-08-04 (UI-13), and the old spelling is why this needed
     correcting rather than exempting. This mock used to answer
       { ok:true, json:async()=>o }
     — the store's return at the TOP LEVEL — and the real plane never answers
     that shape: the Durable Object wraps every answer as {ok:true, result:<the
     store's return>} and the control plane adds store/tokenClass around it. So
     the surface's `r.entities` / `r.found` reads agreed with this mock and with
     nothing else, and against a live plane the Subjects screen answered "No
     subject in the registry is known by …" for every subject that WAS in it
     (D-173). The mock now answers the ENVELOPE the plane actually sends, and
     app.html reads it through `recR`. `civicos-ui/test/intent-write.test.mjs`
     drives the same surface against the REAL plane in miniflare, which is what
     found this; a mock agreeing with itself agrees on nothing. */
  const R = o => ({ ok:true, json:async()=>({ ok:true, result:o, store:"bio", tokenClass:"member" }) });
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
  "globalThis.__lookupSubject=lookupSubject;globalThis.__showEntity=showEntity;" +
  "globalThis.__subjConnectionsHtml=subjConnectionsHtml;globalThis.__docConnectionsHtml=docConnectionsHtml;", ctx);

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

/* ---- UI-95: THE DERIVATION'S EXTENT, beside the page's (D-241, CONTENT-SEARCH-DESIGN §4.3) ----
   `truncated` says whether THIS PAGE was cut; `derivation` says whether the derivation that
   wrote the rows was. A cut derivation read under the ceiling came back `truncated:false`
   over PART of the set. Every sentence below is the plane's own, from derivationStatement,
   and must appear VERBATIM (DEC-8) — escaped for HTML and nothing else. */
const escH = s => String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const connSec = h => (/Connections among these documents<\/h2>([\s\S]*?)<\/section>/.exec(h)||[])[1] || "";
const LEAD = "The record says of the derivation behind this list:";
const CUT = derivationStatement({ at:"2026-09-20T00:00:00Z", state:"partial",
  detail:"the derivation over 32 document(s) concerning this entity was CUT by its pair bound" });
const LOOKED_ABSENT = derivationStatement({ at:"2026-09-20T00:00:00Z", state:"LOOKED_ABSENT",
  detail:"the derivation ran over 3 document(s) concerning this entity and formed no connection" });
const NEVER = derivationStatement(null, "never_looked");
const PRELOG = derivationStatement(null, "pre_log");
const UNDET = derivationStatement(null, "purged");
/* the fixtures are what they claim to be — a control over a mislabelled fixture refutes nothing */
ok("UI-95 · INSTRUMENT: the cut fixture IS cut and names its documents", CUT.cut === true && CUT.documents === 32 && /CUT/.test(CUT.says));
ok("UI-95 · INSTRUMENT: the whole fixtures are recorded and not cut",
   CONNECTIONS.derivation.cut === false && CONNECTIONS.derivation.derived === "derived"
   && LOOKED_ABSENT.cut === false && LOOKED_ABSENT.derived === "derived");
ok("UI-95 · INSTRUMENT: the three unrecorded fixtures are the three causes",
   NEVER.derived === "never_derived" && PRELOG.derived === "pre_log" && UNDET.derived === "undetermined");

/* the live path: the whole derivation the base fixture carries adds NO sentence */
const wholeSec = connSec(html);
ok("UI-95 · a WHOLE derivation read through op=connections shows no derivation sentence",
   wholeSec.includes("INFO-2026-0100") && !wholeSec.includes(LEAD) && !wholeSec.includes(escH(CONNECTIONS.derivation.says)));

/* the cut-set arm — THE NEGATIVE CONTROL's target, driven through op=connections */
const savedDerivation = CONNECTIONS.derivation;
CONNECTIONS.derivation = CUT;
await ctx.__showEntity("ENT-1", ENTITY, true);
const cutSec = connSec(els.get("#subj-res")._html);
CONNECTIONS.derivation = savedDerivation;
ok("UI-95 · CUT-SET: a cut derivation shows the plane's sentence VERBATIM beside the list",
   cutSec.includes(LEAD) && cutSec.includes(escH(CUT.says)));
ok("UI-95 · CUT-SET: the cut sentence sits beside the connection it qualifies", cutSec.includes("INFO-2026-0200"));

/* the other arms, through the panel function the subject view calls */
const panel = c => connSec(ctx.__subjConnectionsHtml(c));
const withD = d => ({ ...CONNECTIONS, derivation:d });
ok("UI-95 · a whole derivation that formed no connection shows no derivation sentence",
   !panel({ ...withD(LOOKED_ABSENT), connections:[], count:0 }).includes(LEAD));
for(const [name, d] of [["never derived", NEVER], ["pre-log", PRELOG], ["undetermined", UNDET]])
  ok(`UI-95 · an UNRECORDED derivation (${name}) shows the plane's sentence verbatim`,
     panel(withD(d)).includes(LEAD) && panel(withD(d)).includes(escH(d.says)));
ok("UI-95 · the never-derived sentence shows over an EMPTY list too",
   panel({ ...withD(NEVER), connections:[], count:0 }).includes(escH(NEVER.says)));
/* over-strictness: a cut derivation whose `says` the plane words differently still renders it,
   because the surface keys on `cut`, not on a phrase it expects */
const REWORDED = { ...CUT, says:"a sentence the plane may one day word <otherwise> & still mean cut" };
ok("UI-95 · OVER-STRICTNESS: a cut derivation in a spelling the surface did not anticipate still shows, escaped",
   panel(withD(REWORDED)).includes(escH(REWORDED.says)));
/* an entity-arm answer with no derivation key is stated undetermined, never read as complete */
const { derivation:_drop, ...noKey } = CONNECTIONS;
ok("UI-95 · an answer WITHOUT the derivation key says the record did not say, rather than implying the set is whole",
   /did not say whether the derivation behind this list was cut/.test(panel(noKey)) && !panel(noKey).includes(LEAD));
ok("UI-95 · a failed read states no derivation at all", !/derivation/.test(panel({ connections:[], _err:true })));
/* the capture arm publishes no derivation: the document page must not grow the undetermined sentence */
const docPanel = ctx.__docConnectionsHtml({ ...noKey, entity_id:null, capture_sha:"a".repeat(64) }, "a".repeat(64));
ok("UI-95 · the document page (capture arm, no derivation by design) states nothing about a derivation",
   !/derivation behind this list/.test(docPanel) && !docPanel.includes(LEAD));

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
