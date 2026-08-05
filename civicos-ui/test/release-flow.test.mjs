/* THE RELEASE MOMENT — the review list, the release dialog and their refusals.
 *
 * NEGATIVE CONTROL: (h) UI-25, RUN 2026-08-05 on disk against the final
 * `civicos-ui/app.html`, restored byte-identically (sha256
 * 1fdb2741d0b557f2a65ecccb1f3507620a388f12270230a7887ed533094a0c7c before and
 * after) -> DISCARD THE PLANE'S `total` AGAIN in `loadReviewRows`
 * (`REVIEW_TOTAL = (r && typeof r.total === "number") ? r.total : null;` ->
 * `REVIEW_TOTAL = null;`), which is the state UI-25's sweep found this screen
 * in: it FAILS quoting the defect verbatim, `Awaiting review (2)` rendered over
 * a record that answered 731 — a short number presented as a complete one,
 * standing above a select-all box and a bulk Release control that writes a
 * member's name onto a state transition. The fixture drives the page size and
 * the record's total APART on purpose: where they agree, a surface reading
 * `hits.length` and one reading `total` are indistinguishable, and an equality
 * costing nothing to produce is not evidence (CLAUDE.md) — which is how this
 * defect survived a green suite.
 */
import fs from "fs";
import { appScript } from "./extract.mjs"; import vm from "vm";
const els = new Map();
function el(){ return { classList:{add(){},remove(){},toggle(){},contains(){return true}},
  style:{}, dataset:{}, value:"", innerHTML:"", textContent:"", disabled:false, checked:false,
  addEventListener(){}, querySelectorAll(){return[]}, querySelector(){return el()},
  insertAdjacentHTML(pos,html){ this._inserted=(this._inserted||"")+html; },
  focus(){}, onclick:null, oninput:null };}
const CALLS = [];
const ctx = {
  console, URL, URLSearchParams, JSON, TextEncoder, setTimeout, Array, Object, String, Number, Math, Date, RegExp, Promise,
  document: { querySelector: s => { if(s==="#docscroll") return null; if(!els.has(s)) els.set(s, el()); return els.get(s); },
              querySelectorAll: () => [], addEventListener(){}, documentElement:{setAttribute(){}} },
  location: { protocol: "https:" },
  fetch: async (url, init) => {
    const u = new URL(url, "https://x.test"); const op = u.searchParams.get("op");
    CALLS.push({op, params:Object.fromEntries(u.searchParams), method:(init&&init.method)||"GET", body:init&&init.body?JSON.parse(init.body):null});
    const reply = o => ({ ok:true, json: async()=>o });
    /* CORRECTED 2026-08-05 (UI-23), never exempted. `select` and `release` were
       answered UNWRAPPED here while `search`, `list` and `whoami` below were
       already wrapped — the suite carried both shapes and the two that were
       wrong were exactly the two the release flow READS a field off. Neither op
       has a dedicated handler in index.mjs, so both come back through the
       generic passthrough as `{ok:true, result:{…}, store, tokenClass}`: on the
       real plane `sel.handle` was `undefined` (the release named no selection)
       and `rel.released` was `undefined` (the receipt silently fell back to the
       ids the browser had asked about, reporting the REQUEST as the outcome).
       A refusal stays flat, and correctly so: a control-plane refusal really is
       `{ok:false, …}` with no envelope, and `rec`/`recPost` throw it. */
    const wrap = o => reply({ ok:true, result:o, store:"bio", tokenClass:"member" });
    if(op==="select"){
      const b = CALLS[CALLS.length-1].body;
      if(!b || !Array.isArray(b.ids) || !b.ids.length) return reply({ok:false, reason:"EMPTY"});
      return wrap({handle:"sel-abc123", kind:"enumerated", n:b.ids.length});
    }
    if(op==="release"){
      const p = CALLS[CALLS.length-1].params;
      if(!p.acknowledgment) return reply({ok:false, reason:"NO_ACKNOWLEDGMENT", detail:"..."});
      if(p.handle!=="sel-abc123") return reply({ok:false, reason:"NO_SUCH_SELECTION"});
      return wrap({released:["INFO-1","INFO-2"], acknowledgment:p.acknowledgment, mitigation:p.mitigation});
    }
    /* ADDED 2026-08-05 (UI-21). `loadReviewRows` no longer spells its query out
       as a literal — it COMPOSES `type:information state:collected` from the
       field list `op=searchfields` publishes, exactly as the finder's scopes do,
       and falls back to the weaker `op=list` read (SAYING SO) when a field it
       needs is not published. Both arms are driven below. */
    if(op==="searchfields") return reply({ok:true, result:{
      fields:{ type:{type:"text",freeText:false,column:"object_type"},
               state:{type:"text",freeText:false,column:"current_state"},
               title:{type:"text",freeText:true,column:"title"} },
      ftsColumns:["title","body","meta","locator","authority"], idsMax:50000, syntax:[] }});
    if(op==="search"){ ctx.__LASTQ = u.searchParams.get("q"); return reply({ok:true, result:{hits:[
      {bundle_id:"INFO-1",title:"Doc one",object_type:"information",current_state:"collected",last_updated:"2026-07-20",criticality:"routine"},
      {bundle_id:"INFO-9",title:"Crucial doc",object_type:"information",current_state:"collected",last_updated:"2026-07-21",criticality:"crucial"}],total:2}}); }
    if(op==="list") return reply({ok:true, result:[]});
    if(op==="whoami") return reply({ok:true, result:{session:true,capabilities:["contribute"],handle:"georgia"}});
    return reply({ok:true, result:{}});
  },
};
ctx.addEventListener=()=>{}; ctx.history={pushState(){}}; ctx.localStorage={getItem:()=>null,setItem(){}}; ctx.IntersectionObserver=undefined; ctx.setInterval=()=>1; ctx.clearInterval=()=>{}; ctx.requestAnimationFrame=fn=>fn(); ctx.history={pushState(){},back(){}}; ctx.addEventListener=()=>{}; ctx.window = ctx; ctx.globalThis = ctx;
vm.createContext(ctx);
const code = appScript();
vm.runInContext(code + `
;globalThis.__go = go; globalThis.__rec = rec; globalThis.__recPost = recPost; globalThis.__X = { PLANE, canRelease, loadReviewRows, doRelease, releaseRefusal, REL_RULE, openReleaseDialog, rvCount, renderReview };`, ctx);
const G = ctx.__X;
G.PLANE.token="tok"; G.PLANE.session=true; G.PLANE.me={session:true, capabilities:["contribute"], handle:"georgia"};
if(!G.canRelease()) throw new Error("canRelease should be true");
G.PLANE.me.capabilities=[]; if(G.canRelease()) throw new Error("canRelease must require contribute");
G.PLANE.me.capabilities=["contribute"];
const rows = await G.loadReviewRows();
if(rows.length!==2 || rows[1].criticality!=="crucial") throw new Error("loadReviewRows wrong");
/* UI-21: THE QUERY IS COMPOSED FROM THE PUBLISHED FIELD LIST, not spelled out
   here. Asserted on the wire (what the plane was actually asked) rather than on
   the source, so a literal reintroduced anywhere would still have to produce
   this — and the selectors are checked INDIVIDUALLY, because a suite pinning the
   whole string would be pinning an order this surface does not promise. */
if(!/(^|\s)type:information(\s|$)/.test(ctx.__LASTQ||"") || !/(^|\s)state:collected(\s|$)/.test(ctx.__LASTQ||""))
  throw new Error("review query not composed from the published fields: "+ctx.__LASTQ);
/* AND THE WEAKER ENGINE SAYS SO (D-142's third clause). Drop `state` from what
   the plane publishes and the composition cannot be made, so the surface falls
   back to op=list — where criticality is UNKNOWABLE, so no crucial seal can
   render. The screen must state that rather than show a bulk-release control
   over material it cannot tell is crucial. */
ctx.__NOSTATE = true;
const savedFetch = ctx.fetch;
ctx.fetch = async (url, init) => {
  const u = new URL(url, "https://x.test");
  if(u.searchParams.get("op")==="searchfields")
    return { ok:true, json: async()=>({ok:true, result:{ fields:{ type:{type:"text"} }, syntax:[] }}) };
  return savedFetch(url, init);
};
vm.runInContext(";globalThis.__reload=()=>loadSearchFields(true);globalThis.__via=()=>REVIEW_VIA;", ctx);
await ctx.__reload();
const weak = await G.loadReviewRows();
if(ctx.__via() !== "list") throw new Error("an unpublishable selector must fall back to the plain index, not send a hopeful string");
if(weak.some(b=>b.criticality)) throw new Error("the list fallback cannot know criticality and must not claim to");
await G.renderReview();
const rvHtml = els.get("#rv").innerHTML || "";
if(!rvHtml.includes("plain index"))
  throw new Error("D-142: a degraded review list must SAY which engine answered — a member cannot tell otherwise: "+rvHtml.slice(0,400));
ctx.fetch = savedFetch;
await ctx.__reload();

/* ============================================================
   UI-25 — THE REVIEW LIST IS A PAGE, AND IT MUST SAY SO.

   FOUND BY UI-25's SWEEP AND NOT NAMED IN ITS BRIEF. `loadReviewRows` asks
   `op=search` at `limit:500` and took `r.hits` while DISCARDING `r.total` — the
   plane's own COUNT(*) over the whole scope — and `paintReview` then printed
   `REVIEW_ROWS.length` as a bare figure inside "Awaiting review (N)". With more
   collected material than one page holds, that heading is a SHORT NUMBER
   PRESENTED AS A COMPLETE ONE, standing directly above a select-all box and a
   bulk Release control that records a member's name against a state
   transition. It is the finder's own rule — "the plane's own `total`, never
   `hits.length` dressed up as one" — never applied on this screen.

   The two numbers are driven APART here, because a fixture where they agree
   cannot tell a surface that reads `total` from one that reads `hits.length`:
   that is an equality costing nothing to produce (CLAUDE.md), and it is the
   reason this defect survived a green suite.
   ============================================================ */
{
  const savedF = ctx.fetch;
  const PAGE = 2, FOUND = 731;
  ctx.fetch = async (url, init) => {
    const u = new URL(url, "https://x.test");
    if(u.searchParams.get("op") === "search"){
      ctx.__LASTQ = u.searchParams.get("q");
      return { ok:true, json: async()=>({ ok:true, result:{ hits:[
        {bundle_id:"INFO-1",title:"Doc one",object_type:"information",current_state:"collected",last_updated:"2026-07-20"},
        {bundle_id:"INFO-9",title:"Crucial doc",object_type:"information",current_state:"collected",last_updated:"2026-07-21",criticality:"crucial"}],
        total: FOUND, limit: 500, offset: 0 } }) };
    }
    return savedF(url, init);
  };
  await G.renderReview();
  const capped = els.get("#rv").innerHTML || "";
  if(!capped.includes(`Awaiting review (${PAGE} of ${FOUND})`))
    throw new Error("UI-25: the heading must not print the page size as the count of what awaits review: " + capped.slice(0, 300));
  if(!/id="rv-bound"/.test(capped))
    throw new Error("UI-25: a review list short of the record's own total must STATE the bound; an unstated bound reads as completeness");
  if(!capped.includes(String(FOUND - PAGE)))
    throw new Error("UI-25: the bound must say HOW MANY are not on this page, in the record's own arithmetic");
  if(!/box that ticks every row/.test(capped))
    throw new Error("UI-25: the bound must name the consequence for the bulk control — select-all over a page is not select-all");
  /* THE OTHER DIRECTION, so the sentence is not simply always on: when the
     record's total AGREES with what it sent, there is no bound to state and
     stating one would be this screen inventing a doubt the record does not
     have. */
  ctx.fetch = savedF;
  await G.renderReview();
  const whole = els.get("#rv").innerHTML || "";
  if(!whole.includes("Awaiting review (2)") || /id="rv-bound"/.test(whole))
    throw new Error("UI-25: with the whole answer in hand the screen states no bound and prints the plain count: " + whole.slice(0, 300));
}

ctx.document.querySelector("#rel-ack").value = "Batch is homogeneous, same capture run";
ctx.document.querySelector("#rel-mit").value = "Sampled five against sources";
try{
  const selp = await ctx.__recPost("select",{ids:["INFO-1","INFO-2"]},{kind:"enumerated"});
  console.log("stepwise select ok", selp.handle);
  const relp = await ctx.__rec("release",{handle:selp.handle,acknowledgment:"a",mitigation:"b"});
  console.log("stepwise release ok", relp.released);
  await ctx.__go("review");
  console.log("stepwise go ok");
}catch(err){ console.log("stepwise threw:", err && (err.stack||JSON.stringify(err))); }
CALLS.length=0; CALLS.push({op:"search"}); // keep later assertions meaningful
await G.doRelease(["INFO-1","INFO-2"]);
const sel = CALLS.find(c=>c.op==="select");
const rel = CALLS.find(c=>c.op==="release");
if(!sel || sel.method!=="POST" || sel.params.kind!=="enumerated" || sel.body.ids.length!==2) throw new Error("select call malformed: "+JSON.stringify(sel));
if(!rel || rel.params.handle!=="sel-abc123" || !rel.params.acknowledgment.includes("homogeneous") || rel.params.token!=="tok") throw new Error("release call malformed: "+JSON.stringify(rel));
const rv = ctx.document.querySelector("#rv");
if(!(rv._inserted||"").includes("Released 2 documents")){
  console.log("CALLS:", JSON.stringify(CALLS.map(c=>c.op)));
  console.log("rel-err:", ctx.document.querySelector("#rel-err").innerHTML);
  console.log("rv.innerHTML len:", (rv.innerHTML||"").length);
  throw new Error("success card missing: "+rv._inserted);
}
const html = G.releaseRefusal({reason:"ENTRY_REQUIREMENTS", detail:"verified state has entry requirements",
  offenders:[{id:"INFO-4", missing:["data/dataset.json","a file in snapshots/"]}]});
if(!html.includes("INFO-4") || !html.includes("data/dataset.json") || !html.includes("ENTRY_REQUIREMENTS")) throw new Error("refusal render wrong: "+html);
const html2 = G.releaseRefusal({reason:"ILLEGAL_TRANSITION", offenders:[{id:"INFO-7", from:"verified"}]});
if(!html2.includes("currently verified")) throw new Error("illegal transition render wrong");
if(!G.REL_RULE.test('has "quote"') || !G.REL_RULE.test("back\\slash") || !G.REL_RULE.test("new\nline") || G.REL_RULE.test("clean text, fine.")) throw new Error("REL_RULE mismatch");
console.log("harness: all release-flow checks pass");
