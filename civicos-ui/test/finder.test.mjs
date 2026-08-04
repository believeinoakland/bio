/* UI-21 — E1 THE EVIDENCE FINDER. One finder, TWO NAMED ROUTES, and the
 * intersection REFUSED rather than approximated.
 *
 * WHAT THIS HARNESS IS FOR, and it is not "does the screen render". The item it
 * covers exists because retrieval in this system is TWO DISJOINT SYSTEMS
 * (SB-EVIDENCE §1.1) and the ways a surface can lie about that are specific:
 *
 *   1. by adding two counts that measure different populations,
 *   2. by ranking two answers together on a scale nobody defined,
 *   3. by INTERSECTING two independently-capped result sets in the browser and
 *      presenting the short answer as a complete one,
 *   4. by degrading to a weaker read in a byte-identical UI (D-142),
 *   5. by ejecting a member who is holding a live lease,
 *   6. by inventing an expiry, a drift report, a scope or a vocabulary the plane
 *      did not publish.
 *
 * Every assertion below is one of those six. The mock plane MIRRORS the real
 * answers' shapes — `op=search` returns `{query:{warnings},gate,total,limit,hits,
 * widen}` and `op=concerns` returns `{entity_id,found,entity,count,
 * resolution_count,documents:[{capture_sha,bundle_id,ref,grade,established,
 * needs_confirmation,method,at}]}` — because a mock that answered a friendlier
 * shape would be proving something the plane does not do. Every answer is
 * WRAPPED, which is what check-mock-envelope.mjs's arm B judges.
 *
 * THE NUMBERS ARE CHOSEN SO A COMBINED TOTAL CANNOT HIDE. The text route
 * answers 4, the subjects route answers 3, the overlap is 2. 4+3=7 appears
 * nowhere else in the fixture, so a digit sweep for a standalone 7 is a real
 * instrument rather than a hopeful one — the queue.test.mjs precedent, where an
 * invented count had to be caught by a sweep and not by a hedging sentence.
 * NEGATIVE CONTROL (a) below is what proves that: the sweep was the ONLY
 * assertion that fired, and the prose about overlaps stayed green beside a
 * fabricated total. Do not weaken it into a wording check.
 *
 * ===================== NEGATIVE CONTROL, THREE ARMS =====================
 * RUN 2026-08-05 (ui21-agent), each arm ONE edit in civicos-ui/app.html,
 * restored byte-identically after each: app.html's sha256 was taken before the
 * break and after the restore and returned to
 * e67cda5545d97a81cccb9739fe9b77bba4f876cb04fc394c86e3cd35bd86d949 every time.
 * The three edits are scripted so a later session re-runs them in one step
 * instead of re-deriving how to break the subject.
 *
 *   (a) PRESENT A COMBINED TOTAL ACROSS THE TWO ROUTES. In `finderOverlapHtml`,
 *       add one line above the overlap row reporting `t.total + s.count`:
 *         <div class="kv"><span class="k">Found in all</span>
 *           <span class="v plain">${esc(String(t.total + s.count))} documents</span></div>
 *       -> RUN: 1 of 85 failed —
 *          "NO COMBINED TOTAL: the sum of the two route counts appears nowhere".
 *       WORTH KNOWING, and it is why this arm matters: the DIGIT SWEEP is the
 *       only thing that fired. The sentence "the overlap is labelled an OVERLAP
 *       and never a total" stayed GREEN, because it is still there — the added
 *       line is perfectly well-worded English sitting beside a perfectly honest
 *       paragraph, and only the NUMBER is the lie. A suite that asserted the
 *       explanation and not the arithmetic would have called this correct. That
 *       is queue.test.mjs's finding arriving again at a different altitude: an
 *       invented count is caught by a sweep, never by a hedging sentence.
 *
 *   (b) OFFER A GRADE CONTROL IN THE CITE FLOW. In `citePaint`'s `roleBlock`,
 *       add beside the role options:
 *         <div class="dz-choose">${BASIS_GRADES.map(g=>`<label class="dz-opt">
 *           <input type="radio" name="cx-grade" onchange="citeRole(this.value)">
 *           <span class="dz-verb">Grade ${g}</span></label>`).join("")}</div>
 *       -> RUN: 1 of 85 failed HERE ("NO GRADE CONTROL is offered anywhere in
 *       the flow the finder hands off to") AND 1 of 145 in cite-act.test.mjs
 *       ("NO GRADE CONTROL IS OFFERED ANYWHERE ON THIS PATH"). TWO INDEPENDENT
 *       INSTRUMENTS on two surfaces, which is what this rule warrants: a grade a
 *       member CHOSE is a measurement the record did not make.
 *       INSTRUMENT FINDING, and it changed this file. The first version of this
 *       arm failed ONLY in cite-act: the finder's grade sweep ran over the
 *       SELECTION pane, which the added control does not touch, so the finder
 *       reported green while the defect was two clicks away from its own act
 *       strip. The fixture now carries a QUESTION in `op=list`, and the handoff
 *       is driven past the candidate list onto the arm that HAS a role control —
 *       the only place a grade control could ever be smuggled in. A sweep that
 *       cannot reach the surface it is about is not a sweep.
 *
 *   (c) RESTORE THE op=list SUBSTRING FALLBACK (D-142). In `finderTextRoute`,
 *       replace the catch with the one this item deleted:
 *         }catch(e){ const list = await loadRecord(); const ql = q.toLowerCase();
 *           const hits = list.filter(b=>(b.title||"").toLowerCase().includes(ql));
 *           return { asked:true, q, hits, total:hits.length, warnings:[] }; }
 *       -> RUN: 3 of 85 failed —
 *          "a route that cannot answer SAYS SO in the record's own words"
 *          "THE GATE IS NOT BYPASSED: a failing query never falls back to op=list"
 *          "no client-side substring filter over op=list survives on the search path".
 *       The middle one NAMES THE OP, which is the clause that matters: `op=list`
 *       is a different read with its own posture, not a cheaper `op=search`. A
 *       surface that swaps one for the other answers a WEAKER question in a
 *       BYTE-IDENTICAL UI and a member cannot tell which engine replied — which
 *       is D-142's third and worst clause, and the reason the deletion is
 *       asserted by a static sweep as well as by behaviour.
 * ======================================================================== */
import vm from "vm";
import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0, bad = 0;
const ok = (what, cond) => { n++; if(!cond){ bad++; console.log("  FAIL " + what); } };

/* ---------------- the DOM stub ---------------- */
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, checked:false,
    addEventListener(){}, querySelectorAll(){ return []; }, querySelector(){ return el(); },
    insertAdjacentHTML(p,h){ e._html += h; }, focus(){}, click(){}, remove(){} };
  Object.defineProperty(e,"innerHTML",{ get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}

/* ---------------- the record ---------------- */
const ENT = "ENT-0031";
/* Four documents the TEXT route finds; three the SUBJECTS route finds; TWO in
   both. Deliberately disjoint ids elsewhere so the overlap is a real
   intersection and not an artefact of the fixture being one list. */
const TEXT_HITS = [
  { bundle_id:"INFO-0001", object_type:"information", title:"Sewer fund transfer schedule", current_state:"verified",  last_updated:"2026-07-20" },
  { bundle_id:"INFO-0002", object_type:"information", title:"Marina construction invoice",  current_state:"collected", last_updated:"2026-07-21", criticality:"crucial" },
  { bundle_id:"INFO-0003", object_type:"information", title:"Ordinance 13579 as adopted",   current_state:"verified",  last_updated:"2026-07-22" },
  { bundle_id:"INFO-0004", object_type:"information", title:"Budget appendix C",            current_state:"verified",  last_updated:"2026-07-23" },
];
const CONCERN_DOCS = [
  { capture_sha:"a".repeat(64), bundle_id:"INFO-0001", ref:"Ordinance 13579", grade:"A", established:true,  needs_confirmation:false, method:"identifier", at:"2026-07-24" },
  { capture_sha:"b".repeat(64), bundle_id:"INFO-0003", ref:"Ord. 13579",      grade:"C", established:false, needs_confirmation:true,  method:"name",       at:"2026-07-24" },
  /* A capture whose BUNDLE the viewer gate withheld — REC-25's redactor answers
     `bundle_id: null` rather than refusing the row. It must render, must NOT be
     selectable, and must NOT be counted in the overlap. */
  { capture_sha:"c".repeat(64), bundle_id:null,        ref:"Ordinance 13579", grade:"B", established:true,  needs_confirmation:false, method:"identifier", at:"2026-07-25" },
];
const ENTITY = { entity_id:ENT, kind:"instrument", label:"Ordinance 13579", note:null, aliases:[], relations:[] };
/* A QUESTION, so the handoff from the finder into the cite flow can be driven
   past the candidate list and onto the arm that HAS a role control — which is
   the only place a grade control could ever be smuggled in. Without this the
   finder's grade sweep would only cover the selection pane, and negative
   control (b) would have had one instrument instead of two. */
const CITING_QUESTION = { bundle_id:"INQ-0900", object_type:"inquiry",
  title:"Did the sewer fund pay for the marina?", current_state:"open", last_updated:"2026-07-30" };

const SEARCHFIELDS = {
  fields: {
    id:{type:"text",freeText:false,column:"bundle_id"},
    type:{type:"text",freeText:false,column:"object_type"},
    title:{type:"text",freeText:true,column:"title"},
    state:{type:"text",freeText:false,column:"current_state"},
    monitored:{type:"bool",freeText:false,column:"monitor_enabled"},
    reeval:{type:"bool",freeText:false,column:"reeval_flag"},
    /* REC-12's two AXES are real published fields; `grade` deliberately is NOT,
       which is what makes the refusal fixture below a fact rather than a prop. */
    capture:{type:"text",freeText:false,column:"inquiry_capture_strength"},
    connection:{type:"text",freeText:false,column:"inquiry_connection_strength"},
  },
  ftsColumns:["title","body","meta","locator","authority"],
  defaultFacets:["type","state"], idsMax:50000,
  syntax:["bare words are AND, ranked by relevance", "field:value filters"],
};

const PUBLISHED_CITE = { id:"cite", label:"Cite into a case", weight:"report", needs:"contribute",
                         mode:"session", rung:null, prompt:null, appliesTo:["information","project","inquiry"] };

/* ---------------- the mock plane ---------------- */
const CALLS = [];
let FAIL_SEARCH = false, FAIL_FIELDS = false, NO_ENTITY = false;
const SELECTION = { made:null, released:[], resolveN:2, moved:false };

function ctxFor(){
  const els = new Map();
  const ctx = {
    console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
    matchMedia:()=>({matches:false}),
    document:{ querySelector:s=>{ if(s==="#docscroll") return null; if(!els.has(s)) els.set(s, el()); return els.get(s); },
               querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
               getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){}} },
    location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch: async (url, init) => {
      const u = new URL(url, "https://plane.test");
      const p = Object.fromEntries(u.searchParams);
      const op = p.op;
      CALLS.push({ op, params:p, body: init && init.body ? JSON.parse(init.body) : null });
      /* EVERY answer WRAPPED — the shape index.mjs's generic passthrough sends,
         which is what the D-173 guard judges (UI-23). */
      const W = o => ({ ok:true, json: async()=>({ ok:true, result:o, store:"bio", tokenClass:"member" }) });
      const REFUSE = o => ({ ok:false, json: async()=>({ ok:false, ...o }) });

      if(op === "searchfields"){
        if(FAIL_FIELDS) return REFUSE({ reason:"NO_FIELDS", detail:"the record could not answer which fields it has" });
        return W(SEARCHFIELDS);
      }
      if(op === "search"){
        if(FAIL_SEARCH) return REFUSE({ reason:"BAD_QUERY", detail:"the record could not compile this query" });
        const q = p.q || "";
        /* A scoped query answers a SUBSET, so a scope that composed nothing
           would be visible as the wrong count rather than as no error. */
        const scoped = /type:inquiry/.test(q) ? [] : /state:collected/.test(q) ? TEXT_HITS.slice(1,2) : TEXT_HITS;
        return W({ query:{ q, terms:[], match:"and", sort:null, warnings: /nosuchfield/.test(q) ? ["unknown field 'nosuchfield'"] : [], mode:"page" },
                   gate:{ scope:"member", applied:2 }, total: scoped.length, limit:500, offset:0,
                   hits: scoped, facets:{}, widen:null });
      }
      if(op === "concerns"){
        if(p.id !== ENT) return W({ ok:true, entity_id:p.id, found:false, entity:null, count:0, resolution_count:0, documents:[] });
        return W({ ok:true, entity_id:ENT, found:true, entity:ENTITY,
                   count:CONCERN_DOCS.length, resolution_count:4, documents:CONCERN_DOCS });
      }
      if(op === "entitybyalias"){
        if(NO_ENTITY || String(p.alias||"").toLowerCase() !== "ordinance 13579")
          return W({ ok:true, alias:p.alias, alias_norm:String(p.alias||"").toLowerCase(), count:0, entities:[] });
        return W({ ok:true, alias:p.alias, alias_norm:"ordinance 13579", count:1, entities:[ENTITY] });
      }
      if(op === "affordances"){
        if(!p.target) return W({ target:null, catalog:[PUBLISHED_CITE],
                                 vocabularies:{ basis_roles:["supports","cuts_against"] } });
        return W({ target:p.target, object_type:"information", current_state:"verified",
                   acts:[PUBLISHED_CITE], vocabularies:{ basis_roles:["supports","cuts_against"] } });
      }
      if(op === "select"){
        const ids = (init && init.body ? JSON.parse(init.body).ids : []) || [];
        if(!ids.length) return REFUSE({ reason:"EMPTY", detail:"an enumerated selection needs at least one id" });
        SELECTION.made = { handle:"sel-9f2c14ab0d31", ids:ids.slice() };
        return W({ handle:SELECTION.made.handle, kind:"enumerated", n:ids.length, q:"",
                   expires:"2026-08-05T14:30:00Z", ttlSeconds:1800, gate:{applied:1} });
      }
      if(op === "selection"){
        if(!SELECTION.made || p.handle !== SELECTION.made.handle)
          return REFUSE({ reason:"NO_SUCH_SELECTION", detail:"unknown, released, or expired" });
        return W({ ok:true, handle:p.handle, kind:"enumerated", q:"", owner:"member:alice",
                   n:SELECTION.resolveN, snapshotN:SELECTION.made.ids.length, weight:"report",
                   moved:SELECTION.moved,
                   drift:{ revised:SELECTION.moved ? [{ bundleId:"INFO-0001", was:"b".repeat(64), now:"c".repeat(64), class:"authored" }] : [],
                           purged:SELECTION.moved ? ["INFO-0003"] : [], hidden:[], added:0,
                           removed:SELECTION.moved ? 1 : 0, kind:"enumerated" },
                   members:SELECTION.made.ids.slice(0, SELECTION.resolveN),
                   expires:"2026-08-05T15:00:00Z", gate:{applied:1} });
      }
      if(op === "selectionrelease"){ SELECTION.released.push(p.handle); SELECTION.made = null; return W({ ok:true, released:p.handle }); }
      /* op=list carries the CITING objects too, because the cite flow's
         candidate list is built from it — a question among them, so the
         finder-to-cite handoff can be driven all the way to the role control. */
      if(op === "list") return W(TEXT_HITS.concat([CITING_QUESTION]));
      if(op === "whoami") return W({ session:true, capabilities:["contribute"], handle:"alice", administer:false });
      return W({});
    },
  };
  ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  vm.runInContext(appScript() + `
;globalThis.__go = go;
globalThis.__renderFinder = renderFinder;
globalThis.__runSearch = runSearch;
globalThis.__quickSearch = quickSearch;
globalThis.__sxClear = sxClear;
globalThis.__finderScope = finderScope;
globalThis.__finderScopes = finderScopes;
globalThis.__finderPlan = finderPlan;
globalThis.__finderRunOnly = finderRunOnly;
globalThis.__finderHold = finderHold;
globalThis.__finderCheckSelection = finderCheckSelection;
globalThis.__finderReleaseSelection = finderReleaseSelection;
globalThis.__finderActGo = finderActGo;
globalThis.__FIND = () => FIND;
globalThis.__FINDSEL = () => FINDSEL;
globalThis.__setQ = v => { FIND.q = v; };
globalThis.__PLANE = PLANE;
globalThis.__CUR = () => CUR;
globalThis.__loadSearchFields = loadSearchFields;
globalThis.__CITE = () => CITE;
globalThis.__citeChoose = citeChoose;
`, ctx);
  ctx.__PLANE.token = "tok"; ctx.__PLANE.session = true;
  ctx.__PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };
  ctx.__els = els;
  return ctx;
}
const pane = (ctx, sel) => (ctx.__els.get(sel) || { _html:"" })._html || "";
/* TYPE THE WAY A MEMBER DOES. `searchEl()` prefers the MASTHEAD box on desktop
   and the screen's own on a narrow viewport; the stub reports desktop, so a
   harness that only filled `#s-q` would be driving the box the surface does not
   read — and every assertion after it would be about a query nobody ran. Both
   are set, which is also what the surface itself does on every run. */
function type(ctx, q){
  ctx.document.querySelector("#m-search").value = q;
  ctx.document.querySelector("#s-q").value = q;
}

/* ================= (1) THE SCOPES COME FROM op=searchfields ================= */
{
  const ctx = ctxFor();
  await ctx.__renderFinder({ scope:null });
  const scopes = ctx.__finderScopes();
  ok("scopes are composed, and every one is a selector over a field the plane published",
     scopes.length > 0 && scopes.every(s => SEARCHFIELDS.fields[s.q.split(":")[0]] !== undefined));
  ok("the two questions the deleted Monitoring screen answered are published selectors now",
     scopes.some(s=>s.q === "monitored:true") && scopes.some(s=>s.q === "reeval:true"));
  ok("no scope is offered over a field the plane does not publish",
     !scopes.some(s => /^(grade|concerns|entity|phase):/.test(s.q)));
  ok("the scope strip says where the vocabulary came from",
     pane(ctx,"#f-scopes").includes("op=searchfields"));
  ok("op=searchfields was actually asked", CALLS.some(c=>c.op==="searchfields"));

  /* THE COMPOSITION IS ASSERTED ON THE WIRE. A scope that composed nothing
     would leave the query bare, and this is what would catch it. */
  CALLS.length = 0;
  await ctx.__finderScope("inquiries");
  const sq = (CALLS.find(c=>c.op==="search")||{params:{}}).params.q || "";
  ok("choosing a scope sends the record's own selector, composed from its field list",
     /(^|\s)type:inquiry(\s|$)/.test(sq));
  ok("and a scoped route reports the RECORD's count for the scope, not a filtered page",
     /<b>0<\/b> documents on this route/.test(pane(ctx,"#f-res")));

  /* AND WITH NO PUBLISHED FIELDS THERE ARE NO SCOPES — not guessed ones. */
  const ctx2 = ctxFor();
  FAIL_FIELDS = true;
  await ctx2.__renderFinder({ scope:null });
  ok("a plane that cannot name its fields yields NO scopes rather than invented ones",
     ctx2.__finderScopes().length === 0);
  ok("and the surface states why, in the record's own words",
     pane(ctx2,"#f-scopes").includes("could not be asked") && pane(ctx2,"#f-scopes").includes("NO_FIELDS"));
  FAIL_FIELDS = false;
}

/* ============ (2) TWO ROUTES, TWO COUNTS, ONE OVERLAP, NO TOTAL ============ */
let bothPane = "";
{
  const ctx = ctxFor();
  await ctx.__renderFinder({ scope:null });
  type(ctx, "Ordinance 13579");
  await ctx.__runSearch();
  const res = bothPane = pane(ctx,"#f-res");

  ok("BOTH ROUTES ARE ASKED, and asked in parallel from one query",
     CALLS.some(c=>c.op==="search") && CALLS.some(c=>c.op==="concerns"));
  ok("each route is NAMED on the surface",
     /Text and fields/.test(res) && /Subjects/.test(res));
  ok("THE TEXT ROUTE STATES ITS OWN COUNT, from the plane's own `total`",
     /<b>4<\/b> documents on this route/.test(res));
  ok("THE SUBJECTS ROUTE STATES ITS OWN COUNT",
     /<b>3<\/b> documents on this route/.test(res));
  ok("AND AN OVERLAP FIGURE, merged by bundle_id",
     /Found by both routes<\/span><span class="v plain"><b>2<\/b>/.test(res));
  ok("the overlap is labelled an OVERLAP and never a total",
     /it is an overlap and not a total/.test(res) && /Found by both routes/.test(res));

  /* NEGATIVE CONTROL (a)'s instrument: a DIGIT SWEEP. 4+3=7, and 7 appears in
     no legitimate figure in this fixture, so a standalone 7 anywhere in the
     results pane means somebody added the two counts. The queue.test.mjs
     lesson: an invented number is caught by a sweep, not by a hedging
     sentence. */
  const sumSweep = (res.match(/\b7\b/g) || []).filter(x => x);
  ok("NO COMBINED TOTAL: the sum of the two route counts appears nowhere",
     sumSweep.length === 0);
  ok("and the surface SAYS why there is no single number",
     /Why there is no single number/.test(res));

  /* NO BLENDED RANKING: each route says what IT ranked on, and the two
     sentences are different because the two orders are. */
  ok("the text route states its own ordering", /ranked by relevance/.test(res));
  ok("the subjects route states its own ordering, which is a different one",
     /how strongly each resolution was established/.test(res));
  ok("and says outright that the two are a different question over a different table",
     /A different question, a different table and a different order/.test(res));

  /* THE WITHHELD ROW. REC-25's redactor answers bundle_id:null; it renders, it
     is not selectable, and it is not in the overlap. */
  ok("a capture whose bundle the viewer gate withheld still RENDERS as a capture",
     /capture cccccccccccc/.test(res));
  ok("and is not offered as something to select, because there is no id to select",
     (res.match(/type="checkbox"/g)||[]).length === TEXT_HITS.length + 2);
  ok("the subject the route resolved is named with the record's own label and id",
     res.includes("Ordinance 13579") && res.includes(ENT));
  ok("the record's own grade renders per document, honestly — a C is unconfirmed",
     /Grade A/.test(res) && /Grade C/.test(res) && /unconfirmed/.test(res));
}

/* ====== (3) THE SUBJECTS ROUTE'S BOUND IS EXACT SPELLING, AND IT IS SAID ==== */
{
  const ctx = ctxFor();
  await ctx.__renderFinder({ scope:null });
  type(ctx, "Ordinance 13579");
  await ctx.__runSearch();
  ok("the exact-spelling limit is STATED even when the route FOUND something",
     /EXACT match/.test(pane(ctx,"#f-res")) && /f-subj-bound/.test(pane(ctx,"#f-res")));
  ok("and it says the widening read does not exist rather than implying it might",
     /does not exist yet/.test(pane(ctx,"#f-res")));

  type(ctx, "ordinnance 13579");   // one letter off
  await ctx.__runSearch();
  const near = pane(ctx,"#f-res");
  ok("a near-miss name finds NOTHING on the subjects route — the bound is real, not decorative",
     /<b>0<\/b> documents on this route/.test(near));
  ok("and the limit is stated beside the empty answer, so it is not read as 'the record holds none'",
     /EXACT match/.test(near));

  /* BY ID the bound does not apply, and the surface says so. */
  type(ctx, `concerns:${ENT}`);
  CALLS.length = 0;
  await ctx.__runSearch();
  const byId = pane(ctx,"#f-res");
  ok("addressing a subject BY ID skips the registry lookup entirely",
     CALLS.some(c=>c.op==="concerns") && !CALLS.some(c=>c.op==="entitybyalias"));
  ok("and carries no spelling bound", !/EXACT match/.test(byId));
  ok("a query that is ONLY a subject leaves the text route NOT ASKED, stated as such",
     /Not asked/.test(byId));
  ok("and with only one route answering, no comparison is claimed",
     /Only one route answered/.test(byId));
}

/* ========= (4) THE CROSS-SEAM QUERY IS REFUSED, NOT APPROXIMATED ========= */
{
  const ctx = ctxFor();
  await ctx.__renderFinder({ scope:null });
  await ctx.__loadSearchFields(true);
  const plan = ctx.__finderPlan(`concerns:${ENT} state:collected grade:>=B`);
  ok("the parse puts each term on the seam that can answer it",
     plan.subjects.length === 1 && plan.text.length === 1 && plan.unpublished.length === 1);
  ok("and `grade` is recognised as a field NEITHER route publishes",
     plan.unpublished[0].field === "grade");

  CALLS.length = 0;
  type(ctx, `concerns:${ENT} state:collected grade:>=B`);
  await ctx.__runSearch();
  const ref = pane(ctx,"#f-res");
  ok("THE QUERY IS REFUSED", /CROSS_SEAM_QUERY/.test(ref));
  ok("AND NOTHING WAS ASKED OF EITHER ROUTE — the refusal happens before any call",
     !CALLS.some(c=>c.op==="search") && !CALLS.some(c=>c.op==="concerns"));
  ok("the refusal names which term belongs to which seam",
     /Answered only by the subjects route/.test(ref) && /Answered only by the text and fields route/.test(ref)
     && /Answered by neither/.test(ref));
  ok("it says WHY it is refused rather than computed — the capped intersection under-reports invisibly",
     /capped/.test(ref) && /would look exactly like a complete answer/.test(ref));
  ok("and names the downstream consequence: a case makes a claim about its own completeness",
     /a case makes a claim about how complete its evidence is/.test(ref));
  ok("TWO RUNNABLE ALTERNATIVES ARE OFFERED",
     /id="f-alt-text"/.test(ref) && /id="f-alt-subjects"/.test(ref));
  ok("each alternative spells out exactly what it will run",
     ref.includes("state:collected") && ref.includes(`concerns:${ENT}`));
  ok("the unfilterable field is explained rather than dropped in silence — and where it CAN be read is named",
     /report the record&rsquo;s own grade <b>per document<\/b>/.test(ref));

  /* AND THEY RUN. An alternative that is offered and does not work is worse
     than none: this drives both buttons and asserts each reaches its own route
     and only its own. */
  CALLS.length = 0;
  await ctx.__finderRunOnly("text");
  ok("the text alternative RUNS, and reaches only the text route",
     CALLS.some(c=>c.op==="search") && !CALLS.some(c=>c.op==="concerns"));
  ok("and it answers with that route's own count",
     /<b>1<\/b> document on this route/.test(pane(ctx,"#f-res")));

  CALLS.length = 0;
  type(ctx, `concerns:${ENT} state:collected grade:>=B`);
  await ctx.__runSearch();
  CALLS.length = 0;
  await ctx.__finderRunOnly("subjects");
  ok("the subjects alternative RUNS, and reaches only the subjects route",
     CALLS.some(c=>c.op==="concerns") && !CALLS.some(c=>c.op==="search"));

  /* A query on ONE seam is NOT refused — the refusal has to be about the mix. */
  type(ctx, "state:collected sewer");
  await ctx.__runSearch();
  ok("a single-seam query is not refused: the rule is about the MIX, not about selectors",
     !/CROSS_SEAM_QUERY/.test(pane(ctx,"#f-res")));
  type(ctx, "nosuchfield:x");
  await ctx.__runSearch();
  ok("and an unpublished field ALONE goes to the plane, whose own warning renders",
     /unknown field/.test(pane(ctx,"#f-res")));
}

/* ============ (5) D-142: A ROUTE THAT CANNOT ANSWER SAYS SO ============ */
{
  const ctx = ctxFor();
  await ctx.__renderFinder({ scope:null });
  FAIL_SEARCH = true;
  CALLS.length = 0;
  type(ctx, "Ordinance 13579");
  await ctx.__runSearch();
  const res = pane(ctx,"#f-res");
  ok("a route that cannot answer SAYS SO in the record's own words",
     /BAD_QUERY/.test(res) && /could not compile/.test(res));
  ok("THE GATE IS NOT BYPASSED: a failing query never falls back to op=list",
     !CALLS.some(c=>c.op==="list"));
  ok("and no result rows are rendered for the route that failed",
     !/INFO-0002/.test(res.slice(0, res.indexOf("Subjects"))));
  ok("while the OTHER route still answers — one route failing is not the finder failing",
     /<b>3<\/b> documents on this route/.test(res));
  FAIL_SEARCH = false;
}

/* ====== (6) AN EMPTY QUERY CLEARS THE RESULTS AND DOES NOT EJECT ====== */
{
  const ctx = ctxFor();
  /* Routed through `go` rather than `renderFinder` directly, because what is
     being asserted is that the member does not LEAVE — which is a fact about
     CUR, and CUR only means anything if the router put them here. */
  await ctx.__go("search");
  type(ctx, "Ordinance 13579");
  await ctx.__runSearch();
  ok("the finder is the screen the member is on", ctx.__CUR().key === "search");
  ok("and it has answers standing", /documents on this route/.test(pane(ctx,"#f-res")));
  ctx.__sxClear("m");
  ok("clearing the box leaves the member on the finder — a lease-holding surface cannot eject them",
     ctx.__CUR().key === "search");
  ok("and the results are cleared rather than left standing for a query nobody asked",
     pane(ctx,"#f-res") === "");
  await ctx.__runSearch();
  ok("an empty finder says nothing has been ASKED, not that the record is empty",
     /empty box, not an empty record/.test(pane(ctx,"#f-res")));
}

/* ===== (7) THE LIVE SELECTION: PUBLISHED EXPIRY, PUBLISHED DRIFT, ONE LEASE ===== */
{
  const ctx = ctxFor();
  await ctx.__renderFinder({ scope:null });
  type(ctx, "Ordinance 13579");
  await ctx.__runSearch();

  /* The DOM stub returns no elements from querySelectorAll, so the picked set
     is driven the way the surface would be driven: through the results pane's
     own checkbox ids, which are asserted to exist above. */
  const picked = ["INFO-0001","INFO-0002","INFO-0003"];
  ctx.__els.get("#f-res").querySelectorAll = () => picked.map(id => ({ dataset:{ id }, checked:true }));
  CALLS.length = 0;
  await ctx.__finderHold();
  const sel = ctx.__FINDSEL();
  const selCall = CALLS.find(c=>c.op==="select");
  ok("holding a set takes a REAL lease through op=select, enumerated",
     !!selCall && selCall.params.kind === "enumerated" && selCall.body.ids.length === 3);
  ok("the handle is read from inside the envelope (D-173's class, closed)",
     sel && sel.handle === "sel-9f2c14ab0d31");
  const lease = pane(ctx,"#f-sel");
  ok("THE EXPIRY SHOWN IS THE PLANE'S PUBLISHED ONE",
     /id="f-lease-expires"/.test(lease) && /Aug 2026|Aug 5, 2026|5 Aug 2026/.test(lease));
  ok("and the surface says the expiry is the record's, not a countdown it invented",
     /not a countdown this page invented/.test(lease));
  ok("no surface-side timer is started for the lease",
     !/ttl|countdown|seconds left/i.test(lease.replace(/not a countdown this page invented/,"")));

  /* THE DRIFT IS THE PLANE'S REPORT. */
  SELECTION.moved = true; SELECTION.resolveN = 2;
  CALLS.length = 0;
  await ctx.__finderCheckSelection();
  const moved = pane(ctx,"#f-sel");
  ok("asking what moved goes to op=selection, the plane's own re-resolution",
     CALLS.some(c=>c.op==="selection"));
  ok("THE DRIFT RENDERED IS THE PLANE'S OWN ARRAYS, named per kind",
     /Revised since you picked them/.test(moved) && /INFO-0001/.test(moved)
     && /Gone from the record/.test(moved) && /INFO-0003/.test(moved));
  ok("the snapshot size and the current size are both shown when they differ",
     /When you picked them/.test(moved) && /holding 2 documents/.test(moved));
  ok("and the expiry moved with the plane's answer, because using a selection extends it",
     /3:00|15:00|Aug/.test(moved));

  /* THE ACT STRIP, FROM THE PUBLISHED CATALOGUE. */
  ok("the act offered over a held set is the record's, under the record's own label",
     moved.includes(PUBLISHED_CITE.label));
  ok("NO GRADE CONTROL is offered over a held selection",
     !/name="cx-grade"/.test(moved) && !/citeGrade\(/.test(moved));

  /* THE LEASE IS PASSED, NOT RE-TAKEN. */
  CALLS.length = 0;
  ctx.__finderActGo("cite");
  await new Promise(r=>setTimeout(r,0));
  const cite = ctx.__CITE();
  ok("the cite flow receives the finder's OWN handle",
     cite && cite.handle === "sel-9f2c14ab0d31");
  ok("AND TAKES NO SECOND LEASE — no op=select is issued by the cite flow",
     !CALLS.some(c=>c.op==="select"));
  ok("and it neither renews nor releases the finder's lease",
     !CALLS.some(c=>c.op==="selection") && !CALLS.some(c=>c.op==="selectionrelease"));
  ok("the ids handed on are the ids the member was SHOWN",
     JSON.stringify(cite.ids) === JSON.stringify(picked));

  /* AND ON PAST THE CANDIDATE LIST, onto the arm that has a role control — the
     only place on this path where a grade control could ever appear. Driven
     from the FINDER's own selection, which is what makes this an end-to-end
     handoff rather than two surfaces asserted apart. */
  ctx.__citeChoose(CITING_QUESTION.bundle_id);
  const dlg = pane(ctx,"#dlg");
  ok("a QUESTION reached from the finder's selection raises the role control",
     /name="cx-role"/.test(dlg));
  ok("NO GRADE CONTROL is offered anywhere in the flow the finder hands off to",
     !/name="cx-grade"/.test(dlg) && !/citeGrade\(/.test(dlg));
  ok("and the commit stays ABSENT until the role is stated", !/id="cx-cite"/.test(dlg));

  /* RELEASING IS THE MEMBER'S, AND IT REACHES THE PLANE. */
  CALLS.length = 0;
  await ctx.__finderReleaseSelection();
  ok("letting a set go releases the plane's lease rather than just forgetting it here",
     CALLS.some(c=>c.op==="selectionrelease") && SELECTION.released.includes("sel-9f2c14ab0d31"));
  ok("and the surface returns to offering a fresh hold",
     /f-sel-go/.test(pane(ctx,"#f-sel")));
  SELECTION.moved = false; SELECTION.resolveN = 2;
}

/* ============ (8) THE DELETIONS, ASSERTED AS ABSENCES ============ */
{
  const src = appScript();
  ok("`reverseRefs` is GONE — the client-side reverse walk is not merely unused",
     !/\breverseRefs\s*\(/.test(src) && !/async function reverseRefs/.test(src));
  ok("`REVREF_CACHE` is gone with it", !/REVREF_CACHE\s*[=\[]/.test(src));
  ok("the surface-side scope map is gone by name",
     !src.includes("SEARCH_" + "SCOPES"));
  ok("`renderFiltered` is gone", !/function renderFiltered/.test(src));
  ok("`renderMonitoring` and its table are gone",
     !/function renderMonitoring/.test(src) && !/function monTable/.test(src));
  ok("`backFromEmptySearch` is gone as a FUNCTION, not merely unreferenced",
     !/function backFromEmptySearch/.test(src));
  ok("`widenSearch` is gone", !/function widenSearch/.test(src));
  ok("no client-side substring filter over op=list survives on the search path",
     !/toLowerCase\(\)\.includes\(ql\)/.test(src));
  ok("`monitorNext` SURVIVES — the document page still reads it, and deleting it would take a fact with it",
     /function monitorNext/.test(src));
}

if(bad) { console.log(`finder: ${n} assertions, ${bad} failed`); process.exit(1); }
console.log(`finder: ${n} assertions, all green — one finder over TWO NAMED ROUTES asked in parallel, each stating its OWN count (4 and 3) with an overlap merged by bundle_id (2) and no combined total anywhere (digit-swept), no blended ranking and each route naming what it ordered on; the subjects route's EXACT-SPELLING bound stated whether it found anything or not (REC-36 is not built here) and absent when a subject is addressed by id; a cross-seam query REFUSED before any call is made, naming which term belongs to which seam and offering TWO alternatives that actually run; scopes composed from op=searchfields with none offered over an unpublished field and none invented when the plane cannot be asked; a failing route saying so in the record's words with NO op=list fallback (D-142); an empty query clearing results without ejecting a member who holds a lease; and a live selection whose PUBLISHED expiry and PUBLISHED drift are rendered, handed to the cite flow without a second lease and released through the plane`);
