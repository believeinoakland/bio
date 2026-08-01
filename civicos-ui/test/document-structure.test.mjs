/* UI-9 — THE DOCUMENT'S PLACE IN THE ACCOUNTABILITY WEB (CONSTRUCTS Step 8,
 * PRESENTATION, the document-page half; UI-4 is the per-subject half).
 *
 * Drives the FULL document page (openBundle) against a stubbed plane and proves
 * the four things UI-9's accepts-when names, plus the honesty properties the
 * framework makes load-bearing:
 *   (1) the SUBJECTS the document resolves to (op=resolutions by capture), each
 *       at its §8.1 grade — a Grade C reads UNCONFIRMED, never established
 *       (established/needs_confirmation are READ FROM the op, not the letter);
 *   (2) the graded CONNECTIONS to other documents (op=connections by capture),
 *       the connection taking the WEAKER of its two ends;
 *   (3) the PROGRESSIONS this document sits in and at which stage, and
 *   (4) an OVERDUE-successor note WHEN one exists (REC-8's overdue_successor,
 *       "N days overdue" from the op's OWN overdue_by_ms) and NONE when not.
 * Items (3)/(4) read a DELEGATED op (op=captureprogressions) the way UI-5 reads
 * op=proposals; the delegation is recorded in CLAIMS.md.
 *
 * NEGATIVE CONTROL: force the overdue seam docFindingOverdue() to return true
 * regardless of the finding kind — then a NON-overdue (missing_predecessor)
 * finding on the RFP document renders an OVERDUE note ("... it is overdue",
 * class "docprog-finding overdue") when NOTHING is overdue, so the "no overdue
 * note when nothing is overdue" property is violated. This suite RUNS that
 * mutation in-process (renderRFP against a patched source) and asserts the
 * overdue marker is ABSENT under the real seam and PRESENT under the forced one,
 * so the seam is proven load-bearing. RUN 2026-07-31: real seam -> no overdue
 * marker on the RFP doc (green); forced `return true` -> the marker appears
 * (the honest property would fail) -> the negative control is effective. The
 * §8.1 Grade-C-not-established property rides UI-4's subjGradeBadge, whose own
 * negative control is recorded in subject-view.test.mjs.
 */
import fs from "fs"; import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---- the fixtures: two documents, one with an OVERDUE successor, one with a
   NON-overdue missing step (so the negative control has a finding to flip) ---- */
const SHA_MEETING = "a".repeat(64);
const SHA_RFP     = "b".repeat(64);
const SHA_OTHER   = "e".repeat(64);

function bundleMd(title, capSha){ return `---
title: ${title}
object_type: information
current_state: verified
content_hash: sha256:${capSha}
source:
  authority: City of Oakland
  retrieved: 2026-07-19
---
The document body.

## Session Log

### Session 2026-07-19 | First capture (daemon monitor-tick) | daemon
Changes: Bundle created at collected.`; }

const IMG = {
  "INFO-MEETING": { "bundle.md": bundleMd("City Council meeting 2026-07-15", SHA_MEETING) },
  "INFO-RFP":     { "bundle.md": bundleMd("RFP 2210 award", SHA_RFP) },
};
const PROJ = {
  "INFO-MEETING": { bundle_id:"INFO-MEETING", object_type:"information", group_id:"believe-in-oakland",
    title:"City Council meeting 2026-07-15", current_state:"verified", bundle_sha:"d".repeat(64), fm_json:null },
  "INFO-RFP": { bundle_id:"INFO-RFP", object_type:"information", group_id:"believe-in-oakland",
    title:"RFP 2210 award", current_state:"verified", bundle_sha:"f".repeat(64), fm_json:null },
};
const LIST = [
  { bundle_id:"INFO-MEETING", object_type:"information", title:"City Council meeting 2026-07-15", current_state:"verified", last_updated:"2026-07-19" },
  { bundle_id:"INFO-RFP",     object_type:"information", title:"RFP 2210 award",                  current_state:"verified", last_updated:"2026-07-19" },
];

/* op=resolutions by capture: on the meeting doc, one Grade A (established) and one
   Grade C (correspondence) — established/needs_confirmation are the plane's. */
const RESOLUTIONS = {
  [SHA_MEETING]: { ok:true, capture_sha:SHA_MEETING, count:2, resolutions:[
    { capture_sha:SHA_MEETING, bundle_id:"INFO-MEETING", ref:"person:sheng-thao", entity_id:"ENT-A",
      grade:"A", method:"the source's own identifier", established:true,  needs_confirmation:false, at:"2026-07-19T00:00:00Z" },
    { capture_sha:SHA_MEETING, bundle_id:"INFO-MEETING", ref:"name:Sheng Thao",   entity_id:"ENT-C",
      grade:"C", method:"name correspondence",         established:false, needs_confirmation:true,  at:"2026-07-19T00:00:00Z" },
  ] },
  [SHA_RFP]: { ok:true, capture_sha:SHA_RFP, count:0, resolutions:[] },
};
/* op=entity: the subject labels the panel resolves (bounded fan-out). */
const ENTITY = {
  "ENT-A": { ok:true, found:true, entity:{ entity_id:"ENT-A", kind:"person", label:"Sheng Thao" } },
  "ENT-C": { ok:true, found:true, entity:{ entity_id:"ENT-C", kind:"person", label:"Sheng Thao" } },
};
/* op=connections by capture: the meeting doc connects to INFO-OTHER, graded the
   weaker of its ends (B and C -> C), so it is never established. */
const CONNECTIONS = {
  [SHA_MEETING]: { ok:true, capture_sha:SHA_MEETING, count:1, connections:[
    { a_capture_sha:SHA_MEETING, b_capture_sha:SHA_OTHER, entity_id:"ENT-A",
      a_bundle_id:"INFO-MEETING", b_bundle_id:"INFO-OTHER",
      grade:"C", a_grade:"B", b_grade:"C", established:false, needs_confirmation:true,
      asserted_by:"system", basis:"both concern Sheng Thao", at:"2026-07-20T00:00:00Z" },
  ] },
  [SHA_RFP]: { ok:true, capture_sha:SHA_RFP, count:0, connections:[] },
};
/* op=captureprogressions (DELEGATED): the meeting doc sits at the `meeting` stage
   of a `meeting` progression whose required `minutes` successor is OVERDUE; the RFP
   doc sits at the `award` stage of a `procurement` progression with a required but
   NOT-overdue missing `contract` step (a missing_predecessor, never overdue). */
const CAPPROG = {
  [SHA_MEETING]: { ok:true, capture_sha:SHA_MEETING, instances:[
    { progression_key:"meeting", progression_label:"meeting", entity_id:"ENT-M1",
      entity_label:"City Council 2026-07-15", stage_key:"meeting", stage_label:"meeting", findings:[
      { kind:"overdue_successor", stage_key:"minutes", stage_label:"minutes", required:"always",
        grade:"B", grade_determined:true, established:true, needs_confirmation:false,
        deadline:"2026-07-25T00:00:00Z", overdue_by_ms:6*86400000,
        predecessor_stage:"meeting", predecessor_at:"2026-07-15T00:00:00Z", within_interval:"10 days" },
    ] },
  ] },
  [SHA_RFP]: { ok:true, capture_sha:SHA_RFP, instances:[
    { progression_key:"procurement", progression_label:"procurement", entity_id:"ENT-P1",
      entity_label:"RFP 2210", stage_key:"award", stage_label:"award", findings:[
      { kind:"missing_predecessor", stage_key:"contract", stage_label:"signed contract", required:"always",
        grade:"B", grade_determined:true, established:true, needs_confirmation:false },
    ] },
  ] },
};

/* ---- a DOM stub good enough for innerHTML inspection ---- */
function el(sel){ const e={ sel, classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, offsetHeight:120, offsetTop:0,
  addEventListener(){}, querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(p,h){e._html+=h}, focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }

/* Render one bundle through openBundle in a fresh context over `scriptSrc`, and
   return the #content innerHTML. A fresh context per render keeps the module
   caches from leaking between the two documents and lets the negative control
   run against a mutated source. */
async function render(scriptSrc, bundleId){
  const els = new Map();
  function mockFetch(u){
    const q = new URL(u, "https://x.test").searchParams; const op = q.get("op");
    const reply = o => ({ ok:true, json:async()=>o });
    if(op==="image")      return reply({ ok:true, result: IMG[q.get("id")] || {} });
    if(op==="projection") return reply({ ok:true, result: PROJ[q.get("id")] || {} });
    if(op==="list")       return reply({ ok:true, result: LIST });
    if(op==="links")      return reply({ ok:true, links: [] });
    if(op==="resolutions")        return reply(RESOLUTIONS[q.get("sha256")] || { ok:true, resolutions:[] });
    if(op==="connections")        return reply(CONNECTIONS[q.get("sha256")] || { ok:true, connections:[] });
    if(op==="captureprogressions")return reply(CAPPROG[q.get("sha256")] || { ok:true, instances:[] });
    if(op==="entity")     return reply(ENTITY[q.get("id")] || { ok:true, found:false, entity:null });
    return reply({ ok:true, result:{} });
  }
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
    document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el(s)); return els.get(s); }, querySelectorAll:()=>[],
      addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){}} },
    location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch: async u => mockFetch(u) };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(scriptSrc + ";globalThis.__open=openBundle;", ctx);
  await ctx.__open(bundleId, true);
  return els.get("#content")._html;
}

/* the render markers of an ACTUAL overdue finding (not the section's prose, which
   mentions the word "overdue" while explaining what the panel shows). */
function hasOverdueNote(html){
  return html.includes("docprog-finding overdue")
      || /\d+\s*days?\s*overdue/.test(html)
      || html.includes("overdue today")
      || html.includes("it is <b>overdue</b>");
}

const SRC = appScript();

/* ================= the OVERDUE meeting document ================= */
const meeting = await render(SRC, "INFO-MEETING");
ok("the panel is present on the document page", meeting.includes("What the record knows about this document"));

/* (1) subjects this document resolves to, at their grades */
ok("the subjects section is shown", /Subjects this document names/.test(meeting));
ok("the resolved subject is named by its label, not a raw id", meeting.includes("Sheng Thao"));
ok("the Grade A resolution is shown established", meeting.includes("Grade A · established"));
ok("the Grade A resolution names HOW it was established", meeting.includes("Established by the source's own identifier"));
ok("the Grade C resolution is flagged unconfirmed", meeting.includes("Grade C · unconfirmed"));
ok("the Grade C resolution says plausible, not established", meeting.includes("Plausible, not established"));
ok("the Grade C resolution is NEVER shown as established", !/Grade C · established/.test(meeting));

/* (2) graded connections */
ok("the connections section is shown", /Documents this one connects to/.test(meeting));
ok("the connection names the OTHER end", meeting.includes("INFO-OTHER"));
ok("the connection states it takes the weaker of its ends", /weaker/.test(meeting) && /Grade B and Grade C/.test(meeting));
ok("the weaker-C connection reads unconfirmed, never established",
   meeting.includes("Grade C · unconfirmed") && !/Grade C · established/.test(meeting));

/* (3) progression membership, at its stage */
ok("the processes section is shown", /Processes this document is part of/.test(meeting));
ok("the document's progression membership is shown", /In the <b>meeting<\/b> process/.test(meeting));
ok("the document's stage in the progression is shown", /this document is the <b>meeting<\/b>/.test(meeting));

/* (4) an OVERDUE successor note, WHEN one exists — N days from the op's own value */
ok("an overdue successor note is shown when one exists", hasOverdueNote(meeting));
ok("the overdue note states how many days overdue (from the op, not computed here)", meeting.includes("6 days overdue"));
ok("the overdue note carries the missing successor stage", meeting.includes("minutes"));

/* ================= the NOT-overdue RFP document ================= */
const rfp = await render(SRC, "INFO-RFP");
ok("the RFP document shows its progression membership", /In the <b>procurement<\/b> process/.test(rfp));
ok("the RFP document shows its stage", /this document is the <b>award<\/b>/.test(rfp));
ok("the RFP's missing-but-not-overdue step is shown as awaited, not overdue",
   /no document fills it yet/.test(rfp));
ok("NO overdue note appears when nothing is overdue", !hasOverdueNote(rfp));

/* ================= the DELEGATION degrades honestly ================= */
/* when op=captureprogressions is absent (unknown op), the progression half shows a
   named gap rather than inventing membership. */
const SRC_NOOP = SRC; // same source; simulate the missing op via the fetch mock
async function renderNoProg(bundleId){
  const els = new Map();
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
    document:{ querySelector:s=>{ if(!els.has(s)) els.set(s, el(s)); return els.get(s); }, querySelectorAll:()=>[],
      addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){}} },
    location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch: async u => { const q=new URL(u,"https://x.test").searchParams, op=q.get("op"); const reply=o=>({ok:true,json:async()=>o});
      if(op==="image") return reply({ok:true,result:IMG[q.get("id")]||{}});
      if(op==="projection") return reply({ok:true,result:PROJ[q.get("id")]||{}});
      if(op==="list") return reply({ok:true,result:LIST});
      if(op==="links") return reply({ok:true,links:[]});
      if(op==="resolutions") return reply(RESOLUTIONS[q.get("sha256")]||{ok:true,resolutions:[]});
      if(op==="connections") return reply(CONNECTIONS[q.get("sha256")]||{ok:true,connections:[]});
      if(op==="entity") return reply(ENTITY[q.get("id")]||{ok:true,found:false,entity:null});
      if(op==="captureprogressions") return { ok:true, json:async()=>({ ok:false, error:"unknown op captureprogressions" }) };
      return reply({ok:true,result:{}}); } };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(SRC_NOOP + ";globalThis.__open=openBundle;", ctx);
  await ctx.__open(bundleId, true);
  return els.get("#content")._html;
}
const gap = await renderNoProg("INFO-MEETING");
ok("with the delegated op absent, the panel still renders", gap.includes("What the record knows about this document"));
ok("the missing per-document lookup is stated honestly, not faked",
   /cannot yet say which processes this document is part of/.test(gap));
ok("no progression membership is invented when the op is absent", !/In the <b>meeting<\/b> process/.test(gap));
ok("the subjects and connections still render when only the progression op is absent",
   gap.includes("Grade A · established") && gap.includes("INFO-OTHER"));

/* ================= the vocabulary guard: no plane jargon reaches the member ==== */
for(const word of ["op=", "capture_sha", "entity_id", "needs_confirmation", "overdue_by_ms",
                   "grade_determined", "progression_key", "stage_key", "asserted_by"])
  ok(`the document structure panel never says "${word}"`, !meeting.includes(word));

/* ================= NEGATIVE CONTROL (RUN in-process) ==================
   Force docFindingOverdue() to return true regardless of kind; the RFP's
   NON-overdue missing step then renders an overdue note when nothing is overdue.
   The real seam must NOT produce that marker (asserted above); the forced seam
   MUST — proving the seam is load-bearing and this suite would catch a regression. */
const MUT = SRC.replace(
  "function docFindingOverdue(f){ return !!f && f.kind === \"overdue_successor\"; }",
  "function docFindingOverdue(f){ return true; }");
ok("the negative-control seam docFindingOverdue was found and patched", MUT !== SRC);
const rfpForced = await render(MUT, "INFO-RFP");
ok("NEGATIVE CONTROL: forcing the overdue seam makes a non-overdue step render as overdue",
   hasOverdueNote(rfpForced));
ok("NEGATIVE CONTROL: the real seam did NOT render that overdue note (load-bearing)",
   !hasOverdueNote(rfp) && hasOverdueNote(rfpForced));

if(fails.length){ console.error(`document-structure: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`document-structure: ${n} assertions, all green — resolved-subjects-with-grades, Grade-C-unconfirmed-not-established, graded-connections, progression-membership-and-stage, overdue-when-present + none-when-not, honest-gap-when-op-absent, negative-control effective`);
