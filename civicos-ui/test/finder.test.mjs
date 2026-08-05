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
 *
 * ============ UI-25's ARMS (d)-(j), RUN 2026-08-05 (ui25-agent) ============
 * Each arm is ONE anchored edit, run ON DISK against the FINAL files and
 * restored byte-identically after every one: `civicos-ui/app.html` returned to
 * sha256 1fdb2741d0b557f2a65ecccb1f3507620a388f12270230a7887ed533094a0c7c and
 * this file to 70069885f1b73729bd4ec80c8f4e03fb5f3e913251b94da3ea21eb0275626ee6
 * before and after all of them. The arms are scripted so a later session
 * re-runs them in one step instead of re-deriving how to break the subject.
 *
 *   (d) THE ITEM'S OWN — CAP THE QUERY SELECTION AT THE PAGE. In
 *       `finderHoldQuery`, hold the page's rows instead of the question:
 *         recPostR("select", {}, { kind:"query", q })
 *           -> recPostR("select", { ids:((FIND.text&&FIND.text.hits)||[]).map(h=>h.bundle_id) },
 *                       { kind:"enumerated" })
 *       -> RUN: **25 of 132 FAIL**, and the one the item turns on names the
 *       bound in its own words: "THE COMPLETENESS BOUND IS BROKEN: the held set
 *       reaches STRICTLY MORE than the page could ever tick". Every drift, cite
 *       and receipt assertion falls with it, because a set that is secretly the
 *       page cannot report a criterion's drift and cannot hand an act a
 *       question. `cite-act.test.mjs` stays GREEN throughout — the defect is
 *       invisible from a surface that never holds a query selection, which is
 *       why the arm lives here.
 *
 *   (e) BLUR THE TWO DRIFTS — `selectionMoved` reads `moved` for both kinds:
 *         return selectionIsQuery(x) ? !!(x.drift && x.drift.digestChanged) : !!x.moved;
 *           -> return !!x.moved;
 *       -> RUN: **3 of 132 FAIL** — "AND THE SURFACE SAYS THE ANSWER CHANGED
 *       ANYWAY — digestChanged is read, not `moved`", plus BOTH receipt
 *       assertions. THIS IS THE ARM WORTH READING. The plane's own `moved` is
 *       `revised.length + removed + added > 0`, all three of which are ZERO for
 *       a query selection whose answer swapped one document for another at a
 *       constant count — so the fixture is not contrived, it is the condition.
 *       AND THE INSTRUMENT FINDING: only 3 move, not more, because the drift
 *       ROWS render off the drift object either way and stay correct. What is
 *       lost is the HEADING on the lease and THE WHOLE RECEIPT — `citeDriftHtml`
 *       returns "" when it thinks nothing moved, so the member who blurs these
 *       two facts loses the report at exactly the moment it is written into a
 *       case. The narrow failure count is the point rather than a weakness.
 *
 *   (f) RENDER PER-ROW LANGUAGE OVER A QUERY SELECTION — `selectionDriftHtml`'s
 *       `if(d.kind === "query")` -> `if(false)`, so a criterion's drift falls
 *       through to the arm written for stored rows.
 *       -> RUN: **4 of 132 FAIL**, including "it says the record CANNOT say
 *       which documents moved, rather than leaving the silence to read as 'none
 *       did'" and the unchanged-digest arm. The enumerated branch renders no
 *       rows for a query selection (there are none), so the surface goes SILENT
 *       rather than wrong — and silence here reads as "nothing changed", which
 *       is UI-26's measurement (an unstated bound reads as completeness)
 *       arriving inside a drift report.
 *
 *   (g) DROP THE PAGE-BOUND STATEMENT from the results panel (`(capped ||
 *       atLimit)` -> `(false)`).
 *       -> RUN: **2 of 132 FAIL** — the consequence sentence and the record's
 *       own published page limit. The COUNT LINE stays green and stays true
 *       ("1200 documents on this route · showing the first 500"): the
 *       arithmetic was never the lie, and a member reading it still would not
 *       know that what they can TICK is bounded by it.
 *
 *   (h) THE REVIEW SCREEN — `REVIEW_TOTAL` discarded again, which is the state
 *       this item found it in. Run against `release-flow.test.mjs`.
 *       -> RUN: FAILS, quoting the defect verbatim: `Awaiting review (2)`
 *       rendered over a record that answered 731.
 *
 *   (i) THE CITE FLOW STOPS DROPPING A LEAKED LIST — `citeOverSelection` passes
 *       `ids` through regardless of kind.
 *       -> FIRST RUN: **GREEN, 0 of 130**, AND THAT IS AN INSTRUMENT FINDING
 *       KEPT RATHER THAN TIDIED. `finderHoldQuery` already stores an empty
 *       `ids`, so the guard was handed `[]` whatever it did and the assertion
 *       above it was passing at ZERO COST — a guard fed by the absence of the
 *       thing it watches for. The suite now calls `citeOverSelection` AS THE
 *       CALLER THAT DOES NOT EXIST YET (a query selection handed a full page of
 *       ids) and the arm bites: **1 of 132 FAIL**.
 *
 *   (j) THE INSTRUMENT'S OWN — disarm the large corpus (`BIG = true` ->
 *       `BIG = false`), so the fixture answers 4 hits with no cap.
 *       -> RUN: **4 of 132 FAIL**, and they are exactly the four page-bound
 *       assertions. The other 128 stay green, which is the honest reading: the
 *       criterion mechanism does not need a large corpus to work, and only the
 *       BOUND statements are claims about a page being short. An arm that had
 *       moved everything would have meant the fixture, not the surface, was
 *       carrying the assertions.
 * ======================================================================== */
import vm from "vm";
import fs from "fs";
import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

/* ============================================================
   UI-25's WIRE CONTENT, READ OUT OF THE PLANE RATHER THAN TYPED HERE.

   A mock must answer the wire CONTENT and not merely the wire SHAPE (D-173's
   family, and REC-39's routed measurement on `auth-surface`'s `PLANE_WORDS`:
   a hand-typed copy agrees with its source at ZERO COST, leaves every
   behavioural assertion green, and goes on agreeing after the two have drifted).
   This item's whole subject is a sentence the plane composes for a QUERY
   selection whose rows it cannot name — so a hand copy of that sentence is
   exactly the defect wearing this item's clothes.

   `store.mjs` cannot be imported (it opens with `import … from
   "cloudflare:workers"`, which only workerd provides), so it is read TEXTUALLY,
   the way `check-semantics.mjs` and `auth-surface.test.mjs` already read it.

   THE EXTRACTION IS GUARDED, because one that silently yielded "" would make
   every `includes()` below trivially true — the costless equality arriving in
   the INSTRUMENT rather than in the subject (UI-30's finding). */
const STORE_SRC = fs.readFileSync(new URL("../../bio-plane/src/store.mjs", import.meta.url), "utf8");
function planeQueryDriftDetail(){
  /* `selectionResolve`'s query arm: `drift.detail = "…" + "…";` — the
     concatenated string literals, joined the way the source joins them. */
  const m = /drift\.detail = ((?:\s*"(?:[^"\\]|\\.)*"\s*\+?)+);/.exec(STORE_SRC);
  if(!m) return "";
  return [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map(x => JSON.parse('"' + x[1] + '"')).join("");
}
const PLANE_QUERY_DRIFT_DETAIL = planeQueryDriftDetail();
/* AND THE PLANE'S OWN `moved` FORMULA, pinned as a RELATION rather than as a
   value. This surface renders `digestChanged` as a fact SEPARATE from `moved`,
   and the reason that is necessary rather than decorative is that the plane's
   `moved` is computed from the three PER-ROW figures and `digestChanged` is not
   a term in it — so a query selection whose answer swaps one document for
   another at a constant count reports `moved:false` while its answer is not the
   answer the member holds. Pinning the relation asserts no value and rules
   nothing: if the plane ever folds `digestChanged` into `moved`, this fails
   HERE and a session re-reads the surface deliberately instead of the surface
   quietly becoming redundant. */
const PLANE_MOVED_FORMULA = (/const moved = ([^;]+);/.exec(STORE_SRC) || [,""])[1];

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

/* ---- UI-25's CORPUS THAT DOES NOT FIT IN A PAGE ---------------------------
   The plane's `LIMIT_MAX` is 500 and `finderTextRoute` asks for exactly that,
   so a member with more hits than that can tick rows from the first 500 and
   from nowhere else. The fixture is a REAL page of 500 against a record that
   answers 1,200, because the assertion this item turns on is a DELTA between
   what the page can reach and what the criterion reaches — an absolute would
   be satisfied by a harness that walked nothing. */
const PAGE_LIMIT = 500;
const BIG_TOTAL = 1200;
const BIG_PAGE = Array.from({ length: PAGE_LIMIT }, (_, i) => ({
  bundle_id: `INFO-${String(9000 + i)}`, object_type:"information",
  title:`Sewer fund ledger page ${i + 1}`, current_state:"verified", last_updated:"2026-07-26" }));
/* The record's answer AFTER something moved: the same SIZE, different members.
   This is the shape a count can never show and the digest always can, and it is
   the one the surface must not report as "nothing moved". */
const BIG_TOTAL_AFTER = BIG_TOTAL;

/* ---------------- the mock plane ---------------- */
const CALLS = [];
let FAIL_SEARCH = false, FAIL_FIELDS = false, NO_ENTITY = false;
/* UI-25: when on, `op=search` answers a full page against a much larger total. */
let BIG = false;
const SELECTION = { made:null, released:[], resolveN:2, moved:false };
/* UI-25's query selection, kept apart from the enumerated one above so a test
   cannot pass by confusing the two. `digestChanged` is the fact under test and
   is set independently of the per-row arrays, exactly as the plane sets it. */
const QSEL = { made:null, n:BIG_TOTAL, digestChanged:false, added:0, removed:0 };

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
        /* UI-25: the record answers MORE than it will send, which is the whole
           condition this item exists for. `total` is the plane's own COUNT(*)
           over the full scope; `hits` is one page of it. */
        if(BIG)
          return W({ query:{ q, terms:[], match:"and", sort:null, warnings:[], mode:"page" },
                     gate:{ scope:"member", applied:2 }, total: BIG_TOTAL, limit: PAGE_LIMIT, offset:0,
                     hits: BIG_PAGE, facets:{}, widen:null });
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
        /* UI-25: `selectionCreate` decides the kind from what it was handed and
           a QUERY selection stores the CRITERION, not the rows — so it takes no
           ids, it is bounded by nothing, and its `n` is the record's WHOLE
           answer rather than a page of it. */
        if(p.kind === "query"){
          QSEL.made = { handle:"sel-q4e81b0c9d72", q: p.q || "" };
          return W({ handle:QSEL.made.handle, kind:"query", n:QSEL.n, q:QSEL.made.q,
                     expires:"2026-08-05T14:30:00Z", ttlSeconds:1800, gate:{applied:1} });
        }
        if(!ids.length) return REFUSE({ reason:"EMPTY", detail:"an enumerated selection needs at least one id" });
        SELECTION.made = { handle:"sel-9f2c14ab0d31", ids:ids.slice() };
        return W({ handle:SELECTION.made.handle, kind:"enumerated", n:ids.length, q:"",
                   expires:"2026-08-05T14:30:00Z", ttlSeconds:1800, gate:{applied:1} });
      }
      if(op === "selection"){
        if(QSEL.made && p.handle === QSEL.made.handle){
          /* THE QUERY ARM, ANSWERED THE WAY `selectionResolve` ANSWERS IT.
             The per-row arrays are EMPTY and stay empty — a query selection
             stores no rows, so there is nothing for the plane to name — and
             `moved` is computed from the plane's OWN formula over the three
             per-row figures, which is why it can be FALSE beside a changed
             digest. The mock does not hand-set it; hand-setting it would let
             this fixture disagree with the plane about the one relation the
             surface depends on. */
          const drift = { revised:[], purged:[], hidden:[],
                          added:QSEL.added, removed:QSEL.removed, kind:"query",
                          ...(QSEL.digestChanged ? { digestChanged:true, detail:PLANE_QUERY_DRIFT_DETAIL } : {}) };
          const moved = drift.revised.length + drift.removed + drift.added > 0;
          return W({ ok:true, handle:p.handle, kind:"query", q:QSEL.made.q, owner:"member:alice",
                     n:QSEL.digestChanged ? BIG_TOTAL_AFTER : QSEL.n, snapshotN:QSEL.n,
                     weight:"report", moved, drift,
                     /* The plane answers members even for a query selection —
                        it re-runs the criterion — and the surface must still not
                        present them as a list the member picked. */
                     members: BIG_PAGE.slice(0, 3).map(h=>h.bundle_id),
                     expires:"2026-08-05T15:00:00Z", gate:{applied:1} });
        }
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
      /* UI-25: the act the finder hands a selection to, answered the way
         `cite()` answers it — the plane resolves the handle at the moment the
         act runs and reports the drift it found, so a query selection's receipt
         carries a query-shaped drift object. */
      if(op === "cite"){
        const isQ = !!(QSEL.made && p.handle === QSEL.made.handle);
        const cited = isQ ? BIG_PAGE.slice(0, 3).map(h=>h.bundle_id) : ((SELECTION.made && SELECTION.made.ids) || []);
        return W({ ok:true, project:p.project, handle:p.handle, citingObjectType:"project",
                   weight:"report", moved:isQ ? false : SELECTION.moved,
                   cited, alreadyCited:[], bundleSha:"d".repeat(64),
                   drift: isQ
                     ? { revised:[], purged:[], hidden:[], added:0, removed:0, kind:"query",
                         ...(QSEL.digestChanged ? { digestChanged:true, detail:PLANE_QUERY_DRIFT_DETAIL } : {}) }
                     : { revised:[], purged:[], hidden:[], added:0, removed:0, kind:"enumerated" } });
      }
      if(op === "selectionrelease"){ SELECTION.released.push(p.handle); SELECTION.made = null; QSEL.made = null; return W({ ok:true, released:p.handle }); }
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
/* UI-25 */
globalThis.__finderHoldQuery = finderHoldQuery;
globalThis.__finderQueryCriterion = finderQueryCriterion;
globalThis.__selectionIsQuery = selectionIsQuery;
globalThis.__selectionMoved = selectionMoved;
globalThis.__doCite = doCite;
globalThis.__citeOverSelection = citeOverSelection;
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

/* ================================================================
   (9) UI-25 — THE UNCAPPED QUERY SELECTION, AND THE TWO DRIFTS THAT ARE
       DIFFERENT FACTS.

   The page above is `op=search` at `limit:500`. A member with more hits than
   that can tick rows from the first 500 and from nowhere else, so the set they
   cite into a case is SILENTLY SHORT — and a case is a document that makes a
   COMPLETENESS CLAIM. Everything below is one of three things:

     (i)   the page bound is STATED where a member is about to act on it,
     (ii)  the criterion selection SURVIVES PAST THE PAGE — asserted as a DELTA
           between what the page reaches and what the lease reaches, never
           against an absolute a harness that walked nothing would also satisfy,
     (iii) `digestChanged` is rendered as ITS OWN FACT and never as per-row
           drift, in BOTH directions: the query arm names no row because there
           is none to name, and the enumerated arm still names every one.
   ================================================================ */
{
  BIG = true;
  const ctx = ctxFor();
  await ctx.__renderFinder({ scope:null });
  type(ctx, "sewer fund");
  await ctx.__runSearch();
  const res = pane(ctx,"#f-res");
  const askedQ = (CALLS.filter(c=>c.op==="search").pop()||{params:{}}).params.q;

  /* ---- (i) THE PAGE IS BOUNDED, AND THE BOUND IS STATED WHERE IT BITES ---- */
  ok("the route reports the RECORD's total and not the size of the page it was sent",
     new RegExp(`<b>${BIG_TOTAL}</b> documents on this route`).test(res)
     && new RegExp(`showing the first ${PAGE_LIMIT}`).test(res));
  ok("THE CONSEQUENCE OF THE PAGE IS STATED, not merely the arithmetic — what a member can TICK is bounded by it",
     /id="f-text-cap"/.test(res)
     && new RegExp(`Anything you tick here comes from these ${PAGE_LIMIT} only`).test(res));
  ok("and the record's own published page limit is rendered rather than captured and dropped",
     new RegExp(`the most it will send in one go is ${PAGE_LIMIT}`).test(res));
  const bar = pane(ctx,"#f-sel");
  ok("a SECOND way to hold material is offered beside the picked-rows lease",
     /id="f-sel-all"/.test(bar) && /id="f-sel-go"/.test(bar));
  ok("and the difference between the two is stated before either is used",
     /id="f-hold-bound"/.test(bar) && /Hold everything this query matches/.test(bar)
     && /is not bounded by this page/.test(bar));
  ok("the boundary neither lease crosses is named: the subjects route is a separate index",
     /Neither holds anything the <b>subjects<\/b> route found/.test(bar));

  /* ---- (ii) THE CRITERION SELECTION SURVIVES PAST THE PAGE ---- */
  CALLS.length = 0;
  await ctx.__finderHoldQuery();
  const qcall = CALLS.find(c=>c.op==="select");
  const qsel = ctx.__FINDSEL();
  ok("holding everything takes a REAL lease through op=select, kind:query",
     !!qcall && qcall.params.kind === "query");
  ok("THE CRITERION IS SENT, AND NO ROWS ARE — the record stores the question, not the page",
     !!qcall && qcall.params.q === askedQ
     && !(qcall.body && Array.isArray(qcall.body.ids) && qcall.body.ids.length));
  ok("the criterion held is BYTE-IDENTICAL to the one op=search was asked, so the member holds the answer to the question they were shown a count for",
     qcall.params.q === askedQ && askedQ.length > 0);
  /* THE COMPLETENESS BOUND, AS A DELTA. The page reaches 500; the lease reaches
     1,200. Asserting `n === 1200` alone would also pass for a surface that
     never sent the criterion at all, because the fixture would happily answer
     it — the DIFFERENCE between the two is what this item bought. */
  ok("THE COMPLETENESS BOUND IS BROKEN: the held set reaches STRICTLY MORE than the page could ever tick",
     qsel && qsel.kind === "query" && qsel.n > BIG_PAGE.length
     && qsel.n - BIG_PAGE.length === BIG_TOTAL - PAGE_LIMIT);
  ok("and the lease carries NO list of the page's rows, because it is not a list",
     Array.isArray(qsel.ids) && qsel.ids.length === 0);

  const lease = pane(ctx,"#f-sel");
  ok("the lease card says WHICH KIND of set it is, in the markup and in words",
     /data-selkind="query"/.test(lease)
     && /holding your question, and everything it answers/.test(lease));
  ok("it renders the criterion the record is holding",
     lease.includes(askedQ));
  ok("IT STATES THAT IT IS NOT BOUNDED BY THE PAGE, naming the page's own size",
     new RegExp(`not bounded by the ${PAGE_LIMIT} documents this screen listed`).test(lease));
  ok("it states the count is the record's WHOLE answer rather than a page of it",
     new RegExp(`<b>${BIG_TOTAL}</b> documents`).test(lease)
     && /the record&rsquo;s count of its whole answer, not of a page/.test(lease));
  ok("AND IT STATES WHAT THE CHOICE COSTS — the record can say the answer moved and not which documents did",
     /cannot tell you WHICH documents changed|and not WHICH documents changed/.test(lease));
  ok("no row from the page is presented as a member of the held set",
     !lease.includes(BIG_PAGE[0].bundle_id));

  /* ---- (iii) DIGEST DRIFT IS ITS OWN FACT ----
     The plane reports `moved:false` here, because `moved` counts PER-ROW
     movement and a query selection has none to count — while `digestChanged` is
     true and the answer is not the answer the member holds. A surface keyed on
     `moved` alone renders "nothing moved" over a set that changed. */
  QSEL.digestChanged = true; QSEL.added = 0; QSEL.removed = 0;
  CALLS.length = 0;
  await ctx.__finderCheckSelection();
  const drifted = pane(ctx,"#f-sel");
  const answered = CALLS.find(c=>c.op==="selection");
  ok("asking what the answer is now goes to op=selection, the plane's own re-resolution",
     !!answered);
  ok("THE PLANE ITSELF REPORTS moved:false HERE — this fixture is the condition, not a convenience",
     ctx.__FINDSEL().moved === false && ctx.__FINDSEL().drift.digestChanged === true);
  ok("AND THE SURFACE SAYS THE ANSWER CHANGED ANYWAY — digestChanged is read, not `moved`",
     /The answer moved/.test(drifted)
     && !/reports that nothing moved/.test(drifted));
  ok("it says the record CANNOT say which documents moved, rather than leaving the silence to read as 'none did'",
     /cannot tell you which documents moved/.test(drifted)
     && /There is no list here because there is none to show &mdash; not because nothing changed/.test(drifted));
  ok("NO PER-ROW REPORT IS INVENTED for a set the record stores no rows for",
     !/Revised since you picked them/.test(drifted)
     && !/Gone from the record/.test(drifted)
     && !BIG_PAGE.slice(0,5).some(h=>drifted.includes(h.bundle_id)));
  ok("THE CONSTANT-SIZE CASE IS NAMED — the answer changed without changing count, which no total could have shown",
     /The same number of documents as before/.test(drifted)
     && /replaced by something else/.test(drifted));
  /* THE PLANE'S OWN SENTENCE, and it is the plane's because it was read out of
     the plane rather than typed into this file. */
  ok("the record's own account of the limit is rendered verbatim",
     PLANE_QUERY_DRIFT_DETAIL.length > 60 && drifted.includes(PLANE_QUERY_DRIFT_DETAIL));
  ok("and that sentence really is the plane's — extracted, whole, and about the criterion",
     /stores the criterion rather than the rows/.test(PLANE_QUERY_DRIFT_DETAIL));
  ok("THE RELATION THIS SURFACE DEPENDS ON, PINNED: the plane's `moved` is per-row and digestChanged is NOT a term in it",
     PLANE_MOVED_FORMULA.length > 0
     && /revised/.test(PLANE_MOVED_FORMULA) && !/digestChanged/.test(PLANE_MOVED_FORMULA));

  /* AND THE OTHER DIRECTION: an unchanged digest is not silence either. */
  QSEL.digestChanged = false;
  await ctx.__finderCheckSelection();
  const same = pane(ctx,"#f-sel");
  ok("an UNCHANGED answer says what the record actually compared — the whole answer, not each document",
     /ran your question again and got back the same documents in the same order/.test(same)
     && /it is not a check of each document one by one/.test(same));
  ok("and it does not claim per-document verification it never did",
     !/Revised since you picked them/.test(same));

  /* ---- THE CITE FLOW CONSUMES IT ---- */
  QSEL.digestChanged = true;
  await ctx.__finderCheckSelection();
  CALLS.length = 0;
  ctx.__finderActGo("cite");
  await new Promise(r=>setTimeout(r,0));
  const cite = ctx.__CITE();
  ok("the cite flow receives the QUERY lease's own handle",
     cite && cite.handle === "sel-q4e81b0c9d72");
  ok("AND TAKES NO SECOND LEASE", !CALLS.some(c=>c.op==="select"));
  ok("THE PAGE'S IDS ARE NOT CARRIED INTO THE ACT — there is no list, and the flow is not handed one",
     Array.isArray(cite.ids) && cite.ids.length === 0 && cite.selKind === "query");
  /* AND THE GUARD THAT DROPS THEM IS DRIVEN AT ITS OWN ALTITUDE, because the
     assertion above does NOT reach it. FOUND BY THIS ITEM'S OWN ARM (i), which
     came back GREEN: `finderHoldQuery` already stores an empty `ids`, so
     `citeOverSelection` is handed `[]` whatever it does with it, and the check
     inside it was passing at zero cost — an outcome nobody had to produce is
     not evidence (CLAUDE.md). The guard exists for a caller that does not exist
     yet, so it is called AS THAT CALLER: a query selection handed alongside a
     full page of ids. If it ever stops dropping them, a member's case cites the
     page instead of the answer. */
  {
    const leak = BIG_PAGE.slice(0, 4).map(h=>h.bundle_id);
    await ctx.__citeOverSelection("sel-q4e81b0c9d72", leak, PUBLISHED_CITE, null,
                                  { kind:"query", q:askedQ, n:BIG_TOTAL });
    const forced = ctx.__CITE();
    ok("A CALLER THAT HANDS A QUERY SELECTION A LIST OF ROWS HAS THE LIST DROPPED, not passed through",
       Array.isArray(forced.ids) && forced.ids.length === 0
       && forced.selKind === "query" && forced.criterion === askedQ);
    ok("and not one of those rows reaches the dialog as something being cited",
       !leak.some(id => pane(ctx,"#dlg").includes(id)));
  }
  ok("the criterion travels with it", cite.criterion === askedQ);
  const dlg = pane(ctx,"#dlg");
  ok("the dialog names WHAT IS BEING CITED as the question, not as a page of documents",
     /id="cx-criterion"/.test(dlg) && dlg.includes(askedQ)
     && /<b>not<\/b> a list of documents, and <b>not<\/b> the page you were looking at/.test(dlg));
  ok("it says the record works out the members when the act RUNS",
     /at the moment this act runs/.test(dlg));
  ok("it reports the record's whole-answer count and says it may differ by the time the act runs",
     new RegExp(`<b>${BIG_TOTAL}</b>`).test(dlg) && /It may be a different number now/.test(dlg));
  ok("NO ROW FROM THE PAGE IS RENDERED AS THE THING BEING CITED",
     !BIG_PAGE.slice(0,5).some(h=>dlg.includes(h.bundle_id)));
  ok("and the cross-seam boundary is restated at the moment of commitment, where it is acted on",
     /Anything only the <b>subjects<\/b> route found/.test(dlg));

  /* AND IT RUNS, against the handle and not against a list. */
  ctx.__citeChoose("INFO-0001");
  CALLS.length = 0;
  await ctx.__doCite();
  const citeCall = CALLS.find(c=>c.op==="cite");
  ok("THE ACT REACHES THE PLANE CARRYING THE QUERY LEASE'S HANDLE",
     !!citeCall && citeCall.params.handle === "sel-q4e81b0c9d72");
  ok("and no enumerated selection was minted behind the member's back",
     !CALLS.some(c=>c.op==="select"));
  const receipt = pane(ctx,"#dlg");
  ok("THE RECEIPT DESCRIBES THE SAME SELECTION IN THE SAME WORDS as the screen that held it",
     /cannot tell you which documents moved/.test(receipt)
     && receipt.includes(PLANE_QUERY_DRIFT_DETAIL));
  ok("and it says the act ran over the record's answer AT THE MOMENT IT RAN, not over the page",
     /The record&rsquo;s answer moved/.test(receipt)
     && /not the documents this page listed earlier/.test(receipt));
  BIG = false; QSEL.digestChanged = false; QSEL.made = null;
}

/* ---- (iii) THE OTHER DIRECTION: AN ENUMERATED SELECTION STILL NAMES EVERY ROW.
        The two kinds must not collapse into each other, and a suite that only
        proved the query arm says nothing would be satisfied by a surface that
        had stopped naming rows for BOTH. ---- */
{
  const ctx = ctxFor();
  await ctx.__renderFinder({ scope:null });
  type(ctx, "Ordinance 13579");
  await ctx.__runSearch();
  const picked = ["INFO-0001","INFO-0002","INFO-0003"];
  ctx.__els.get("#f-res").querySelectorAll = () => picked.map(id => ({ dataset:{ id }, checked:true }));
  await ctx.__finderHold();
  SELECTION.moved = true; SELECTION.resolveN = 2;
  await ctx.__finderCheckSelection();
  const en = pane(ctx,"#f-sel");
  ok("an ENUMERATED lease is marked as one and still names every row that moved",
     /data-selkind="enumerated"/.test(en)
     && /Revised since you picked them/.test(en) && /INFO-0001/.test(en)
     && /Gone from the record/.test(en) && /INFO-0003/.test(en));
  ok("and it SAYS WHY it can name them — the record kept the list because the member picked it",
     /You picked these documents, so the record kept the list/.test(en));
  ok("the query arm's sentences do NOT appear over a picked set",
     !/cannot tell you which documents moved/.test(en)
     && !/holding your question/.test(en));
  ok("and the picked lease states ITS bound too: it reaches those documents and nothing else",
     /if the record&rsquo;s answer to your query is longer than the page you ticked them on, the rest is not in here/.test(en));
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
