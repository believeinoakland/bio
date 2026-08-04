/* UI-2 — THE FIRST ACT: focus disposition, a JUSTIFIED TRANSITION
 * (BIO_Interaction_Constructs v0.2 — the ACT construct + the WEIGHT LADDER, §J).
 *
 * Drives the ONE MOTION the construct names, through the plane's op=select +
 * op=dispose (I3), and proves each of the four steps plus the weight-ladder
 * position:
 *   1 CHOOSE      defer / dismiss this question (the two dispositions).
 *   2 PRE-FLIGHT  see WHAT IT WILL REFUSE and WHY *before* it runs — the C-2.8
 *                 reason requirement, the reason grammar, and the legal-move
 *                 gate, computed from the op's declared refusal shape + the
 *                 question's known state (op=dispose has no dry-run).
 *   3 AUTHOR      the reason — REQUIRED, and NEVER prefilled.
 *   4 RECEIPT     what the plane returned (the act happened; here is the record).
 *
 * accepts-when (QUEUE UI-2): disposing a question WITH an authored reason succeeds
 * and yields a receipt (op=select then op=dispose called, receipt rendered from
 * the plane's return); the act is REFUSED with the reason shown when the reason
 * is absent, AND op=dispose is never called — the surface refuses before the
 * plane is even reached.
 *
 * NEGATIVE CONTROL: remove the reason-required pre-flight gate in doDispose (the
 * `if(!pf.ok){…return}` early return) and the empty-reason act is NO LONGER
 * refused in the surface — op=dispose is now sent with an empty reason. RUN
 * MECHANICALLY below in a second VM context built from the source with that
 * exact gate disabled (`if(!pf.ok){` -> `if(false){`). RUN 2026-07-31: gate
 * intact -> an empty-reason doDispose sends NO op=dispose (refused in surface);
 * gate removed -> the same call sends op=dispose with reason:"" (2 control
 * assertions flip). Restored source -> green.
 */
import vm from "vm"; import { webcrypto } from "crypto";
/* The catalog itself, so the surface's mirrored state machine is pinned to the
   table op=dispose() imports rather than to a literal in this file (UI-10). */
import { STATES } from "../../bio-plane/checks/bio-checks.mjs";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---- the mock plane: records every op, mirrors op=select + op=dispose ---- */
function makePlane(){
  const CALLS = [];
  function fetch(u, opts){
    const url = new URL(u, "https://plane.test");
    const op = url.searchParams.get("op");
    const R = o => ({ ok:true, json:async()=>o });
    let body = null; try{ body = opts && opts.body ? JSON.parse(opts.body) : null; }catch(_){}
    CALLS.push({ op, method:(opts&&opts.method)||"GET", body,
      params:Object.fromEntries(url.searchParams.entries()) });
    if(op==="select"){
      const ids = (body && Array.isArray(body.ids)) ? body.ids : [];
      return R({ ok:true, handle:"sel_"+ids.join("_"), kind:"enumerated", n:ids.length, expires:"2026-08-01T00:10:00Z" });
    }
    if(op==="dispose"){
      const to = url.searchParams.get("to");
      const reason = String(url.searchParams.get("reason")||"").trim();
      const handle = url.searchParams.get("handle");
      const id = (handle||"").replace(/^sel_/,"");
      // the plane's OWN refusal shape (store.mjs dispose): a reason is required
      if(!reason) return { ok:false, json:async()=>({ ok:false, reason:"NO_REASON",
        detail:"a disposition with no reason would produce a bundle the catalog rejects" }) };
      return R({ ok:true, to, reason, handle, disposed:[id], weight:"refuse", drift:null });
    }
    return R({ ok:false, reason:"unexpected op "+op });
  }
  return { CALLS, fetch };
}

/* ---- a DOM stub good enough for innerHTML inspection (task-inbox's shape) ---- */
function makeCtx(plane){
  const els = new Map();
  function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
    Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }
  const doc = { querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}}, getElementById:()=>el(),
    hidden:false, createElement:()=>el(), body:{appendChild(){}} };
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
    document:doc, location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,opts)=>plane.fetch(u,opts) };
  ctx.globalThis = ctx; vm.createContext(ctx); ctx.__els = els;
  return ctx;
}

const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__pf=disposePreflight;"
  + "globalThis.__open=openDisposeDialog;globalThis.__validate=disposeValidate;"
  + "globalThis.__choose=disposeChoose;globalThis.__do=doDispose;"
  + "globalThis.__ladder=weightLadderHtml;globalThis.__LEGAL=DISPOSE_LEGAL;"
  + "globalThis.__legalFor=disposeLegal;";

function boot(source, plane){
  const ctx = makeCtx(plane);
  vm.runInContext(source + EXPORTS, ctx);
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
  return ctx;
}

const SRC = appScript();
const plane = makePlane();
const ctx = boot(SRC, plane);

/* ============================================================
   THE PRE-FLIGHT is a pure function — prove it directly first.
   ============================================================ */
const pfEmpty = ctx.__pf({ state:"surfaced", to:"deferred", reason:"" });
ok("pre-flight: an empty reason WILL refuse (C-2.8)", pfEmpty.ok===false && pfEmpty.refusal.reason==="NO_REASON");
ok("pre-flight names a reason gate the member must clear", pfEmpty.gates.some(g=>g.id==="reason" && !g.pass));
const pfGood = ctx.__pf({ state:"surfaced", to:"deferred", reason:"duplicates an open audit" });
ok("pre-flight: an authored reason clears every gate", pfGood.ok===true && pfGood.refusal===null);
const pfBad = ctx.__pf({ state:"surfaced", to:"deferred", reason:'has a "quote"' });
ok("pre-flight: a quote in the reason WILL refuse (grammar)", pfBad.ok===false && pfBad.refusal.reason==="BAD_REASON");
const pfLong = ctx.__pf({ state:"surfaced", to:"deferred", reason:"x".repeat(161) });
ok("pre-flight: an over-long reason WILL refuse (grammar)", pfLong.ok===false && pfLong.refusal.reason==="BAD_REASON");
/* the legal-move gate, mirrored from the plane's own table */
const pfElev = ctx.__pf({ state:"elevated", to:"deferred", reason:"ok reason" });
ok("pre-flight: an elevated question cannot be disposed (ILLEGAL_TRANSITION)", pfElev.ok===false && pfElev.refusal.reason==="ILLEGAL_TRANSITION");
const pfSame = ctx.__pf({ state:"deferred", to:"deferred", reason:"ok reason" });
ok("pre-flight: a no-op move (already deferred) is refused, not silently accepted", pfSame.ok===false && pfSame.refusal.reason==="ILLEGAL_TRANSITION");
ok("pre-flight: reason outranks the move gate, as the plane checks it (order)",
   ctx.__pf({ state:"elevated", to:"deferred", reason:"" }).refusal.reason==="NO_REASON");
/* CORRECTED 2026-08-04 (UI-10). The old assertion pinned the surface's table
   against the FOCUS machine by hand — `elevated.length===0` and nothing else —
   which is a literal restating a literal, and it went on passing while REC-10
   collapsed the construct into the INQUIRY and REC-13/14/16 added concluded,
   published and divided beneath it. The pin now goes to the CATALOG, which is
   the same table op=dispose() imports, so a machine change moves both sides or
   fails here. */
ok("the surface's legal-transition table IS the catalog's inquiry machine",
   JSON.stringify(ctx.__LEGAL) === JSON.stringify(STATES.inquiry.edges));
ok("an open question can be deferred and dismissed, under either spelling of open",
   ["open","surfaced"].every(st => ctx.__LEGAL[st].includes("deferred") && ctx.__LEGAL[st].includes("dismissed")));
ok("a divided question is terminal", ctx.__LEGAL.divided.length===0);
/* A bundle written under EITHER legacy name is pre-flighted against the SAME
   machine, because that is what the store does: op=dispose() normalizes the
   row's type and then applies STATES.inquiry.edges to it, so a surface that
   pre-flighted a `focus` row against the old focus machine would be honest
   about a refusal the plane does not make. `elevated` has no entry in the
   inquiry machine and is refused for exactly that reason. */
for(const spelling of ["focus","problem",null])
  ok(`a ${spelling||"bundle naming no type"} row is pre-flighted against the inquiry machine, as op=dispose reads it`,
     JSON.stringify(ctx.__legalFor(spelling)) === JSON.stringify(STATES.inquiry.edges));
ok("and `elevated`, which the inquiry machine does not have, is therefore refused",
   ctx.__legalFor("focus").elevated === undefined && pfElev.refusal.reason==="ILLEGAL_TRANSITION");

/* ============================================================
   THE WEIGHT LADDER — dispose sits on `reasoned`.
   ============================================================ */
const lad = ctx.__ladder("reasoned");
ok("the ladder shows all four rungs", ["reversible","reasoned","terminal","attested"].every(r=>lad.includes(r)));
ok("the ladder marks THIS act's rung as reasoned", /wl-rung on[\s\S]*?reasoned/.test(lad) && lad.includes("this act"));
ok("the ladder teaches that a justification is required and never prefilled", lad.includes("never prefilled"));

/* ============================================================
   STEP 1 CHOOSE + STEP 2 PRE-FLIGHT rendered in the dialog.
   ============================================================ */
ctx.__open("FOCUS-2026-0004", "Why did the sewer contract skip competitive bid?", "surfaced", "deferred");
const els = ctx.__els;
const dlg0 = els.get("#dlg")._html;
ok("CHOOSE: the dialog offers both dispositions (defer & dismiss)", dlg0.includes("Defer") && dlg0.includes("Dismiss"));
ok("CHOOSE: the chosen disposition names the question by title", dlg0.includes("Why did the sewer contract skip competitive bid?"));
const pf0 = els.get("#dz-pf")._html;
ok("PRE-FLIGHT: the panel is painted before the act runs", /what it will refuse/i.test(pf0));
ok("PRE-FLIGHT: with no reason yet, it shows the reason requirement", /Required/.test(pf0));
ok("PRE-FLIGHT: the commit button is disabled until the pre-flight clears", els.get("#dz-go").disabled===true);
/* AUTHOR is never prefilled: the textarea carries a placeholder HINT, not a value */
ok("AUTHOR: the reason field is never prefilled (placeholder only)", dlg0.includes("placeholder=") && dlg0.includes("></textarea>"));

/* the empty-reason ACT is refused IN THE SURFACE — op=dispose never sent */
const before = plane.CALLS.length;
const r1 = await ctx.__do();
ok("empty-reason act returns refused (surface-side)", r1 && r1.refused===true && r1.reason==="NO_REASON");
ok("empty-reason act sent NO op=select", !plane.CALLS.slice(before).some(c=>c.op==="select"));
ok("empty-reason act sent NO op=dispose — refused BEFORE the plane", !plane.CALLS.some(c=>c.op==="dispose"));
ok("empty-reason act shows the reason to the member, and says nothing was written",
   /nothing has been written/i.test(els.get("#dz-err")._html) && /reason/i.test(els.get("#dz-err")._html));

/* ============================================================
   AUTHOR the reason, then STEP 4 RECEIPT.
   ============================================================ */
els.get("#dz-reason").value = "Duplicates the audit already open under Project 14; nothing new to pursue here";
ctx.__validate();
ok("with a reason authored, the pre-flight clears and the button enables", els.get("#dz-go").disabled===false);
ok("the cleared pre-flight says the act is ready", /ready/i.test(els.get("#dz-pf")._html));

const r2 = await ctx.__do();
/* op=select then op=dispose, in that order */
const selCall = plane.CALLS.find(c=>c.op==="select");
const dispCall = plane.CALLS.find(c=>c.op==="dispose");
ok("the act builds a ONE-focus enumerated selection (op=select)", !!selCall && selCall.body && Array.isArray(selCall.body.ids) && selCall.body.ids.length===1 && selCall.body.ids[0]==="FOCUS-2026-0004");
ok("the act disposes that selection (op=dispose) with the chosen state", !!dispCall && dispCall.params.to==="deferred");
ok("the act sends the AUTHORED reason to the plane", dispCall.params.reason.includes("Duplicates the audit already open"));
ok("op=select was sent before op=dispose", plane.CALLS.indexOf(selCall) < plane.CALLS.indexOf(dispCall));
/* the actor is the plane's to stamp — the browser never sends one */
ok("the browser never sends an author/actor (the plane stamps it)",
   !("author" in dispCall.params) && !("actor" in dispCall.params));
/* the RECEIPT renders what the plane returned */
const rc = els.get("#dlg")._html;
ok("RECEIPT: the act is confirmed done", /Deferred\./.test(rc));
ok("RECEIPT: it shows the focus now reads as deferred", rc.includes('chip deferred') || /reads as/.test(rc));
ok("RECEIPT: it shows the reason AS RECORDED by the plane", rc.includes("Duplicates the audit already open"));
ok("RECEIPT: it states the weight-ladder rung (reasoned)", /reasoned/.test(rc));
ok("the successful act returned the plane's receipt object", r2 && r2.ok===true && Array.isArray(r2.disposed) && r2.disposed[0]==="FOCUS-2026-0004");

/* ============================================================
   CHOOSE is live: switching to dismiss re-runs the pre-flight.
   ============================================================ */
const plane2 = makePlane(); const ctx2 = boot(SRC, plane2);
ctx2.__open("FOCUS-2026-0009", "A second question", "surfaced", "deferred");
ctx2.__choose("dismissed");
ctx2.__els.get("#dz-reason").value = "Out of scope for this record";
ctx2.__validate();
await ctx2.__do();
const disp2 = plane2.CALLS.find(c=>c.op==="dispose");
ok("switching the choice to dismiss disposes to dismissed", !!disp2 && disp2.params.to==="dismissed");
ok("the dismiss receipt confirms Dismissed", /Dismissed\./.test(ctx2.__els.get("#dlg")._html));

/* ============================================================
   THE VOCABULARY GUARD: no plane-internal jargon reaches the member
   through the authored dialog chrome (choose / pre-flight / ladder /
   receipt / surface-side refusal). The §J verbatim passthrough of a
   REAL plane refusal is a separate, intentional path and is not scoped
   here (release renders plane reasons verbatim the same way).
   ============================================================ */
const chrome = dlg0 + pf0 + lad + rc + els.get("#dz-err")._html + ctx2.__els.get("#dlg")._html;
for(const word of ["op=", "op=dispose", "handle", "sel_", "selection", "current_state",
                   "disposition_reason", "EDGE_REASON", "capture_sha", "bundle.md"])
  ok(`the act surface never says "${word}"`, !chrome.includes(word));

/* ============================================================
   NEGATIVE CONTROL — RUN, not inferred. Rebuild the surface from the
   source with the reason-required pre-flight gate DISABLED, and confirm
   the empty-reason act is no longer refused in the surface: op=dispose
   is now sent (to the plane, which then refuses it — but the SURFACE no
   longer does). This is the exact break the declaration line names.
   ============================================================ */
const BROKEN = SRC.replace(/if\(!pf\.ok\)\{\s*\/\/ the surface refuses, before the plane/,
                           "if(false){ // NEGATIVE CONTROL: reason-required pre-flight gate removed");
ok("the negative-control mutation actually changed the source", BROKEN !== SRC);
const planeNC = makePlane(); const ctxNC = boot(BROKEN, planeNC);
ctxNC.__open("FOCUS-2026-0004", "sewer", "surfaced", "deferred");
/* leave the reason EMPTY, then commit */
await ctxNC.__do();
ok("NEG-CONTROL: with the gate removed, an empty-reason act IS sent to the plane (op=dispose called)",
   planeNC.CALLS.some(c=>c.op==="dispose"));
ok("NEG-CONTROL: and it carried an EMPTY reason — the surface no longer enforced C-2.8",
   planeNC.CALLS.some(c=>c.op==="dispose" && String(c.params.reason||"").trim()===""));
/* control-of-the-control: the intact surface did NOT send that call (proven above) */
ok("NEG-CONTROL contrast: the intact surface sent no op=dispose for an empty reason",
   !plane.CALLS.some(c=>c.op==="dispose" && String(c.params.reason||"").trim()===""));

if(fails.length){ console.error(`act-dispose: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`act-dispose: ${n} assertions, all green — choose · pre-flight refusal · authored reason · receipt · weight-ladder(reasoned); negative control RUN`);
