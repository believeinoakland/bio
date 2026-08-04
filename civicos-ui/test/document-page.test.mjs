/* harness8: openBundle END TO END. Renders a full document page against a
   stubbed plane serving a realistic bundle (prose, glossary, chunked pdf,
   promotion log, revision, projection with references). Any ReferenceError
   or render failure in the page path fails here instead of in production. */
import fs from "fs";
import { appScript } from "./extract.mjs"; import vm from "vm"; import { webcrypto } from "crypto";
/* THE PLANE'S OWN PUBLICATION (UI-24). REC-38's `capture_acts` block is what the
   Attestation section's label and rung come from, and this harness answers the
   PRODUCER'S ARRAY rather than a copy of it — a copy agrees at zero cost, which
   REC-38's own negative control measured on this exact label. */
import { CAPTURE_ACTS } from "../../bio-plane/src/affordances.mjs";
const els=new Map();
function el(sel){ const e={sel,classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{},dataset:{},value:"",_html:"",textContent:"",scrollTop:0,disabled:false,offsetHeight:120,
  addEventListener(){},querySelectorAll:()=>[],querySelector:()=>el(),insertAdjacentHTML(p,h){e._html+=h},focus(){},click(){},remove(){}};
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}});
  return e; }
const BUNDLE_MD = `---
title: FY2026-27 adopted budget, Sewer Service Fund
object_type: information
current_state: verified
criticality: crucial
content_hash: sha256:abc123
source_status: live
source:
  locator: https://example.gov/budget.pdf
  authority: City of Oakland
  retrieved: 2026-07-19
---
The SSF transfers appear in the ACFR appendix.

## Summary

One bundle, one line of evidence.

## Session Log

### Session 2026-07-19 | First capture (daemon monitor-tick) | daemon
Trigger: named gathering request GATH-1
Changes: Bundle created at collected.

### Session 2026-07-21 | Ratification: collected to verified | georgia
Trigger: second member ratification pass
Changes: collected to verified released under I-18.`;
const IMG = {
 "bundle.md": BUNDLE_MD,
 /* WIDENED 2026-08-05 (UI-24), and it is a fixture that was thinner than the
    plane: `op=acquire` writes the captured document's own `capture.sha256` into
    this file, and `primaryCaptureSha` reads it. Without it this page could never
    render an Attestation section at all, so the section's assertions below were
    unreachable and the residue pin was the only thing standing over them. */
 "data/provenance.json": JSON.stringify({ grade:"B",
   documents:[{ role:"primary", capture:{ sha256:"e".repeat(64), bytes:2048,
                                          retrieved:"2026-07-19T09:00:00Z" } }] }),
 "data/glossary.json": '{"SSF":"Sewer Service Fund: the enterprise fund at the center of the case."}',
 "snapshots/budget.pdf.p000": {sha256:"a".repeat(64), bytes:100},
 "snapshots/budget.pdf.p001": {sha256:"b".repeat(64), bytes:50},
 "snapshots/budget.pdf.tsr": {sha256:"c".repeat(64), bytes:10},
 "_history/bundle_20260720T000000Z_aaaa.md": "old text",
 "_history/promotion_20260721T000000Z_bbbb.json": JSON.stringify({target:"INFO-X",base:"e3b0",files:[{name:"bundle.md",sha256:null}],created:"2026-07-21T00:11:22Z",author:"bob",skill_version:"bio-plane"}),
};
const PROJ = { bundle_id:"INFO-X", object_type:"information", group_id:"believe-in-oakland", title:"FY2026-27 adopted budget, Sewer Service Fund",
 current_state:"verified", criticality:"crucial", bundle_sha:"d".repeat(64), monitor_enabled:1, monitor_frequency:"daily",
 monitor_last_checked:"2026-07-27T12:00:00Z", reeval_flag:0, annotations_open:0, fm_json:null };
const CITER = { bundle_id:"PROJ-1", object_type:"project", title:"Sewer franchise diversion", current_state:"forming", last_updated:"2026-07-20" };
const CITER_PROJ = { bundle_id:"PROJ-1", fm_json: JSON.stringify({references:[{rel:"cites",target:"INFO-X",status:"confirmed",note:"the budgeted transfers"}]}) };
/* CORRECTED 2026-08-05 (UI-21). The "Cited by" section used to be built by
   `reverseRefs`, a CLIENT-SIDE walk over `op=list` + `op=projection` — which is
   why this file's mock had to hand the surface a citing project's `fm_json` and
   let the browser index it. That function is DELETED; the page reads
   `op=backlinks`, REC-25's gated reverse index, whose rows carry the citing
   object's own `from_title` / `from_type` / `from_state` / `status` / `note`.
   The old fixture is not exempted, it is superseded: `CITER_PROJ` is still used
   by the projection reads below, and the reverse edge is now answered by the op
   that actually answers it, in the shape the plane sends. */
const BACKLINKS = { ok:true, target:"INFO-X", backlinks:[
  { from:"PROJ-1", from_type:"project", from_title:"Sewer franchise diversion",
    from_state:"forming", rel:"cites", status:"confirmed", note:"the budgeted transfers" }]};
const ctx={console,URL,URLSearchParams,JSON,Array,Object,String,Number,Math,Date,RegExp,Promise,Uint8Array,Uint16Array,Map,Set,TextEncoder,crypto:webcrypto,
 Blob:class{}, IntersectionObserver:undefined,
 setInterval:()=>1,clearInterval(){},setTimeout:fn=>{fn();return 1},requestAnimationFrame:fn=>fn(),
 document:{querySelector:s=>{if(!els.has(s))els.set(s,el(s));return els.get(s)},querySelectorAll:()=>[],addEventListener(){},documentElement:{setAttribute(){}},getElementById:()=>el(),hidden:false,createElement:()=>el(),body:{appendChild(){}}},
 location:{protocol:"https:"},history:{pushState(){},back(){}},localStorage:{getItem:()=>null,setItem(){}},
 window:{addEventListener(){},open:()=>null},
 fetch: async (u)=>{
   const q=new URL(u,"https://x.test").searchParams, op=q.get("op");
   const reply=o=>({ok:true,json:async()=>o});
   if(op==="image") return reply({ok:true,result:IMG});
   if(op==="projection") return reply({ok:true,result:q.get("id")==="PROJ-1"?CITER_PROJ:PROJ});
   if(op==="backlinks") return reply({ok:true,result:BACKLINKS});
   if(op==="list") return reply({ok:true,result:[CITER,{bundle_id:"INFO-X",object_type:"information",title:"t",current_state:"verified",last_updated:"2026-07-20"}]});
   /* FLAT, like the plane (see the UI-24 note on the other mock below). */
   if(op==="links") return reply({ok:true,capture:q.get("capture"),links:[],resolved:0,unresolved:0});
   return reply({ok:true,result:{}});
 }};
ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(appScript()+";globalThis.__open=openBundle;",ctx);
await ctx.__open("INFO-X", true);
const html = els.get("#content")._html;
const must = [
  ["dochead frozen header","class=\"dochead\""],
  ["title","FY2026-27 adopted budget"],
  ["open control as link-tab","class=\"openlink\""],
  ["open control text","Open the document"],
  ["verified seal fact","Released by georgia"],
  ["crucial seal fact","Load-bearing for: Sewer franchise diversion"],
  ["monitor last","Last re-checked"],
  ["monitor next","next about"],
  ["bundle glossary term wrapped","data-pop-gloss=\"SSF\""],
  ["shared glossary term wrapped","data-pop-gloss=\"ACFR\""],
  ["session log narrative","Ratification: collected to verified"],
  ["promotion record mapped","revision recorded"],
  ["promotion author","bob"],
  ["type tag","data-ft=\"pdf\""],
  ["revision compare","compare to current"],
  ["artifact link","budget.pdf"],
  ["trust hash","abc123"],
  ["cited-by row","the budgeted transfers"],
  ["all four strata","id=\"s4\""],
  ["own scroll box","id=\"docscroll\""],
  ["stratum triangle + body","class=\"sbody\""],
  ["prose subsection collapsible","class=\"csec\""],
  ["session log is a csec heading","onclick=\"triToggle(this)\""],
  ["source material title-cased, prose-sized heading","class=\"ch2\""],
  ["source material renamed, collapsed","Source Material</h2><div class=\"cbody\""],
];
// default collapse: s2/s3/s4 closed, s1 open; Session Log closed, Summary open
for(const sid of ["s3","s4"]) if(!new RegExp('class="stratum closed" id="'+sid+'"').test(html)) throw new Error(sid+" not closed by default");
for(const sid of ["s1","s2"]) if(!new RegExp('class="stratum" id="'+sid+'"').test(html)) throw new Error(sid+" must open expanded");
if(!html.includes('class="csec closed"')) throw new Error("Session Log csec not closed");
const smIdx = html.indexOf("Source Material</h2>");
if(smIdx<0 || !html.slice(Math.max(0,smIdx-120),smIdx).includes('csec closed')) throw new Error("Source material must open collapsed");
const sumIdx = html.indexOf(">Summary</h2>");
if(sumIdx<0 || html.lastIndexOf('class="csec closed"', sumIdx) > html.lastIndexOf('class="csec"', sumIdx)) throw new Error("Summary must open expanded");
const misses = must.filter(([n,pat])=>!html.includes(pat));
if(misses.length) throw new Error("document page missing: "+misses.map(m=>m[0]).join("; ")+"\n---\n"+html.slice(0,600));
if(html.includes("Could not reach the plane")) throw new Error("errPane rendered");
const headEnd = html.indexOf('id="docscroll"');
if(html.slice(0,headEnd).includes('section class="stratum"')) throw new Error("a stratum leaked above the scroll box");
if(!html.slice(headEnd).includes('id="s1"')||!html.slice(headEnd).includes('id="s4"')) throw new Error("strata not inside the scroll box");
if(html.slice(0,headEnd).indexOf("docband")<0) throw new Error("band not in the fixed header");
console.log("harness8: full document page renders with every element present");

/* ============================================================================
   UI-22 (2026-08-05) — THE DOCUMENT PAGE'S THREE BARS COME FROM THE PLANE.

   ADDED, and the reason it is added rather than corrected is itself the finding:
   NOTHING IN THIS HARNESS PINNED THESE BARS. `relBar`, `dispBar` and `attestBar`
   each decided for itself whether its control existed — from the document's
   type, its state, a surface mirror of the catalog's edge table and a
   surface-side capability rule — and every one of those decisions could have
   been wrong without a single suite going red. (Measured this turn: the three
   bars were rewired onto `op=affordances` and all 26 harnesses stayed green
   before these assertions existed.) That is the hole this section closes.

   TWO of the three now exist only where the record PUBLISHES the act, under the
   record's own label. The THIRD, attestation, could not: `attest` is a NON_ACT
   in `bio-plane/src/affordances.mjs` — capture-directed, not object-directed —
   so `op=affordances` published no entry, no label, no `needs` and no `rung` for
   it in `acts`, on any object. That is doctrine rather than an omission, which
   is why UI-22 raised it as a DELEGATION instead of papering over it.

   THE DELEGATION LANDED (REC-38) AND THE THIRD BAR JOINED THE OTHERS 2026-08-05
   (UI-24). The plane publishes a `capture_acts` block beside the vocabularies on
   BOTH shapes of the op — label, needs, mode and rung — and this page reads it,
   so the last surface-authored act label in `app.html` is gone. AVAILABILITY is
   still this surface's read of a capture it holds plus the credential, and
   deliberately so: a capture act's subject is a sha, not this object, so the
   publication is metadata and deriving availability from it would put the
   publication in disagreement with `op=attest`'s own NO_SUCH_CAPTURE. What the
   publication gates is whether the control can be NAMED at all.

   WHAT IS STILL THIS SURFACE'S OWN AND MUST STAY SO FOR NOW: the grade fence
   ("toward evidentiary weight, never Grade A"). REC-38 refused to invent a
   published `prompt` for it — it is a claim about what the record asserts — and
   it is raised as DEC-39. Do not close it here.
   ============================================================================ */
{
  const mkEl = () => { const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{},
    dataset:{}, value:"", _html:"", textContent:"", scrollTop:0, disabled:false, offsetHeight:120,
    addEventListener(){}, querySelectorAll:()=>[], querySelector:()=>mkEl(),
    insertAdjacentHTML(p,h){ e._html += h; }, focus(){}, click(){}, remove(){} };
    Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; };

  /* `opts.captureActs` lets one arm publish NOTHING for the capture-directed
     acts, which is how the absent-section rule is driven (UI-24). Default: the
     plane's own block, decorated the way `decorateAct` decorates it. */
  const DECORATED = CAPTURE_ACTS.map(a=>({ ...a, weight:null, needs:"contribute",
    mode:"session", rung:a.id==="attest"?"attested":null, prompt:null }));
  async function page(acts, source, opts){
    const captureActs = (opts && opts.captureActs) || DECORATED;
    const E = new Map();
    const c = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
      Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
      setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
      document:{ querySelector:s=>{ if(!E.has(s)) E.set(s, mkEl()); return E.get(s); }, querySelectorAll:()=>[],
        addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>mkEl(), hidden:false,
        createElement:()=>mkEl(), body:{appendChild(){}} },
      location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
      localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
      fetch: async (u)=>{
        const p = new URL(u,"https://x.test").searchParams, op = p.get("op");
        const reply = o => ({ ok:true, json:async()=>o });
        if(op==="image") return reply({ ok:true, result:IMG });
        if(op==="projection") return reply({ ok:true, result: p.get("id")==="PROJ-1" ? CITER_PROJ : PROJ });
        if(op==="list") return reply({ ok:true, result:[CITER] });
        if(op==="backlinks") return reply({ ok:true, result:BACKLINKS });
        /* op=links is FLAT and always was — `index.mjs` answers it in its own
           handler with `json({ok:true, ...r.result})`, not through the
           passthrough. ADDED 2026-08-05 (UI-24): widening the provenance fixture
           to carry a real capture sha made `linksFor` reachable from this page
           for the first time, and the fallback below was answering it WRAPPED.
           The envelope guard caught it in the same turn, which is the whole
           argument for arm B: the surface reads through `recR`, which is
           shape-agnostic, so nothing else could have. */
        if(op==="links") return reply({ ok:true, capture:p.get("capture"), links:[], resolved:0, unresolved:0 });
        /* THE ENVELOPE the plane really sends, and the acts the record
           publishes for THIS object as it stands. */
        if(op==="affordances") return reply({ ok:true, result:{ target:p.get("target"),
          object_type:"information", current_state:"collected", acts,
          vocabularies:{ dispositions:["deferred","dismissed"] },
          capture_acts: captureActs } });
        return reply({ ok:true, result:{} });
      } };
    c.globalThis = c; vm.createContext(c);
    vm.runInContext((source || appScript()) + ";globalThis.__open=openBundle;globalThis.__PLANE=PLANE;globalThis.__loadActSource=loadActSource;", c);
    c.__PLANE.session = true;
    c.__PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };
    /* The published vocabularies, loaded the way boot() loads them — the seam
       UI-22 found had no caller in the application at all. */
    await c.__loadActSource(true);
    await c.__open("INFO-X", true);
    return E.get("#content")._html;
  }
  const bad = [];
  const T = (msg, cond) => { if(!cond) bad.push(msg); };

  const RELEASE = { id:"release", label:"Release (verify)", weight:"refuse", needs:"contribute",
                    mode:"session", rung:"reasoned", prompt:null };
  const DISPOSE = { id:"dispose", label:"Dispose (defer or dismiss)", weight:"refuse", needs:"contribute",
                    mode:"session", rung:"reasoned", prompt:null };

  /* ---- published: the sections exist, under the RECORD'S OWN LABELS ---- */
  const withActs = await page([RELEASE, DISPOSE]);
  T("the Release section appears where the record publishes the act", withActs.includes(">Release</h2>"));
  T("and its control carries the PUBLISHED label, not one written here",
    withActs.includes(">Release (verify)<") && !withActs.includes(">Release this document<"));
  T("the Disposition section appears where the record publishes the act", withActs.includes(">Disposition</h2>"));
  T("and its buttons come from the PUBLISHED disposition vocabulary",
    /openDisposeDialog\([^)]*&quot;deferred&quot;\)/.test(withActs) || withActs.includes("Defer&hellip;"));
  T("the disposition line names the act under the record's own label and rung",
    withActs.includes("Dispose (defer or dismiss)") && withActs.includes("reasoned"));

  /* ---- NOT published: BOTH sections are absent, and NOTHING explains why ----
     This is the arm-(d) instrument for this site. The two sentences deleted this
     turn each carried a correct FACT and an account of the record's rules
     written here: the crucial-release note ("that surface is not built yet") and
     the elevated-question note ("it can no longer be deferred or dismissed").
     A control that does not exist asserts nothing; a sentence explaining its
     absence asserts a great deal, and it is this surface saying it. */
  const noActs = await page([]);
  T("with the act unpublished the Release section is ABSENT", !noActs.includes(">Release</h2>"));
  T("with the act unpublished the Disposition section is ABSENT", !noActs.includes(">Disposition</h2>"));
  T("and NOTHING on the page accounts for either absence in this surface's own words",
    !/no longer be deferred or dismissed/i.test(noActs)
    && !/that surface is not built yet/i.test(noActs)
    && !/outside the release flow/i.test(noActs)
    && !/earlier vocabulary/i.test(noActs));
  T("the page still renders — an absent act is not an error", noActs.includes('id="docscroll"'));
  /* And the strip says what the record publishes, so an act is never silently dropped. */
  T("where the record publishes nothing, the strip says exactly that",
    noActs.includes("publishes no act on this"));

  /* ---- the sentences are gone from the SOURCE, not merely unreached ---- */
  const APPSRC = appScript();
  T("the crucial-release sentence is deleted from the source",
    !APPSRC.includes("that surface is not built yet"));
  T("the elevated-question sentence is deleted from the source",
    !APPSRC.includes("carried into a project under the record's earlier vocabulary"));

  /* ---- attestation: THE RESIDUE IS CLOSED ----------------------------------
     CORRECTED 2026-08-05 BY UI-24, NEVER EXEMPTED, and the inversion is the
     whole rider. What stood here asserted the residue as a residue: `attest` is
     a NON_ACT, `op=affordances` published no entry for it in `acts`, so this
     surface spelled its own label and the suite PINNED THAT — deliberately, so
     the delegation could not be forgotten. REC-38 answered the delegation with a
     published `capture_acts` block on both shapes of the op, so the pin is now
     its opposite: the label is READ, and the string this surface used to write
     is asserted GONE FROM THE SOURCE.

     ASSERTED AGAINST THE PLANE'S OWN EXPORT, imported, because a hand-written
     copy of the label would agree at zero cost and prove nothing — REC-38's own
     negative control found exactly that (a literal copy passes every wire
     assertion), which is why the second assertion here is STRUCTURAL: the
     literal must not be in `app.html` at all, whatever it says. */
  const ATTEST_LABEL = CAPTURE_ACTS.find(a=>a.id==="attest").label;
  T("the Attestation section carries the RECORD'S OWN name for the act",
    withActs.includes(ATTEST_LABEL + "&hellip;"));
  T("and the label this surface used to write is gone from the source, not merely unreached",
    !APPSRC.includes('>Co-attest this capture&hellip;<') && !APPSRC.includes('<h2 id="az-h">Co-attest this capture</h2>'));
  T("the section states the act's published RUNG rather than a weight named here",
    withActs.includes("<b>attested</b> weight"));
  T("and nothing on the page explains when attestation is unavailable",
    !/attestation is unavailable/i.test(noActs) && !/cannot be co-attested/i.test(noActs));
  /* WHERE THE PLANE PUBLISHES NO CAPTURE ACT, THE SECTION IS ABSENT — the
     `actVocab` rule applied to a label: a control the record has no word for is
     not one this surface will name. */
  const noCap = await page([RELEASE, DISPOSE], null, { captureActs:[] });
  T("with the capture-acts block unpublished the Attestation section is ABSENT",
    !noCap.includes(">Attestation</h2>"));
  /* SCOPED to the CONTROL, not to the word: the crucial-criticality tooltip
     legitimately says "co-attestations" (it is explaining what verifying a
     load-bearing document involves), so a bare word scan here would be a scan of
     the record's own vocabulary rather than of this surface's authorship. */
  T("no control for it is drawn, under the published name or any other",
    !/openAttestDialog\(/.test(noCap) && !noCap.includes(ATTEST_LABEL));
  T("and nothing accounts for the absence in this surface's own words",
    !/cannot be attested|no timestamp|attestation is not available/i.test(noCap));
  T("the page still renders — an unpublished capture act is not an error",
    noCap.includes('id="docscroll"'));

  /* ---- NEGATIVE CONTROL, RUN 2026-08-05, restored byte-identical ----------
     Put the crucial-release sentence back — a correct fact about the record,
     worded here, standing where an absent control belongs — and confirm the
     scan above FAILS naming this surface as its author.
     RUN: 1 of the assertions below flipped, plus the source-level one. */
  const BROKEN = APPSRC.replace(
    '      const act = publishedHere("release");\n      if(act)',
    '      const act = publishedHere("release");\n      if(!act && fm.criticality==="crucial") relBar = `<h2 class="sec">Release</h2><p class="rel-note" style="margin:0">Verifying crucial material is per-document work outside the release flow; that surface is not built yet.</p>`;\n      else if(act)');
  T("NEG-CONTROL (bars): the mutation actually changed the source", BROKEN !== APPSRC);
  const ncPage = await page([], BROKEN);
  T("NEG-CONTROL (bars): a sentence this surface wrote now stands where an absent control belongs",
    /that surface is not built yet/i.test(ncPage));
  T("NEG-CONTROL (bars) contrast: the intact page carries no such sentence",
    !/that surface is not built yet/i.test(noActs));

  if(bad.length) throw new Error("UI-22 bars: " + bad.length + " failed —\n  " + bad.join("\n  "));
  console.log("harness8+UI-22/24: the document page's release, disposition AND attestation sections come from op=affordances — the attest label and rung from REC-38's published capture_acts, asserted against the plane's own export; absent-and-silent where it publishes nothing; negative controls RUN");
}
