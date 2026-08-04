/* UI-2 — THE FIRST ACT: inquiry disposition, a JUSTIFIED TRANSITION
 * (BIO_Interaction_Constructs v0.2 — the ACT construct + the WEIGHT LADDER, §J).
 *
 * REWRITTEN 2026-08-05 BY UI-22, and the rewrite is a CORRECTION of the suite's
 * subject rather than a relaxation of it. This suite used to drive
 * `disposePreflight`, a PURE FUNCTION on the surface that computed and WORDED
 * its own NOT_A_DISPOSITION / NO_REASON / BAD_REASON / ILLEGAL_TRANSITION. The
 * old assertions were all true and the thing they asserted was the defect: a
 * surface deciding what the record would refuse, and saying it in its own
 * words, is exactly what DEC-8 forbids. UI-12 named it a residue; UI-20
 * measured the mechanism; this turn closed it.
 *
 * WHAT CHANGED IN THE PLANE'S FAVOUR, and it is the reason the flow got BETTER
 * rather than merely quieter. `bio-plane/src/store.mjs` `dispose()` judges
 *
 *   BAD_TARGET_STATE -> NOT_A_DISPOSITION -> NO_REASON -> BAD_REASON
 *     -> selectionResolve(handle) -> EMPTY_SELECTION -> NOT_INQUIRIES
 *     -> ILLEGAL_TRANSITION -> CITED -> the write
 *
 * so every field a member authors here is judged BEFORE the handle is looked
 * at. That is retire's shape exactly (UI-20's ORDERING RULE: "retire yes"), and
 * it means the WITHHELD-FIELD pre-flight applies — the surface sends the real
 * token and the real reason with `handle:""`, and a cleared check is literally
 * `NO_SUCH_SELECTION`. UI-12's landed line predicted no analogue existed here;
 * the source says otherwise, and this suite is the receipt.
 *
 * The ONE MOTION the construct names, now every step of it the plane's:
 *   1 CHOOSE      from the PUBLISHED disposition vocabulary.
 *   2 PRE-FLIGHT  ask the plane with the handle withheld; render ITS refusal,
 *                 verbatim, and show NO commit control while one stands.
 *   3 AUTHOR      the reason — REQUIRED, and NEVER prefilled.
 *   4 RECEIPT     what the plane returned.
 *
 * accepts-when (QUEUE UI-22): the flow renders no surface-worded refusal; the
 * commit control is ABSENT (not greyed) while the record still refuses; a
 * disposition with an authored reason reaches op=select then op=dispose.
 *
 * NEGATIVE CONTROL — THREE ARMS, RUN 2026-08-05, each rebuilt mechanically in a
 * second VM context below (`arm()`), each restored byte-identical.
 *
 * ARM (b) WAS ALSO RUN ON DISK, against civicos-ui/app.html itself and not only
 * in a VM, because it is the arm the item's acceptance names. app.html's sha256
 * was 497bd9b79ce9e788a7aa1f4dc7a38d759b24ffdbc1ccfef639da8764de45ad9a before
 * and after; the mutation put a worded refusal back inside `disposeProbe` —
 * `{ clear:false, refusal:a.refusal }` -> `{ clear:false, refusal:{
 * reason:a.refusal.reason, detail:"A reason is required, and never written for
 * you. It is refused until you write one." } }` — and the suite reported
 * 6 of 74 FAILED, NAMING THE SURFACE AS AUTHOR: "the record's OWN NO_REASON
 * sentence is what renders", "no sentence in the dialog that is not the
 * record's own reads as a refusal", "a reason the record's grammar rejects is
 * refused BY THE RECORD, in its words", "nothing about the grammar is restated
 * by this page", plus the in-VM arm's own two self-reports (its anchor was
 * already consumed by the on-disk edit, which is the honest signal and is why
 * `arm()` returns null instead of throwing).
 *
 *   (a) THE PROBE IS NEUTERED. Make the pre-flight treat every answer as clear
 *       (`a.refusal.reason === "NO_SUCH_SELECTION"` -> `true`) and the commit
 *       control appears with an empty reason — so the empty-reason act reaches
 *       the plane. RUN: 3 of 71 failed.
 *
 *   (b) THE ARM-(d) INSTRUMENT: THE RIGHT CODE, AN INVENTED SENTENCE. Make the
 *       pre-flight keep the plane's reason CODE and substitute a sentence
 *       written on the surface:
 *         `{ clear:false, refusal:a.refusal }`
 *           -> `{ clear:false, refusal:{ reason:a.refusal.reason,
 *                 detail:"You need to write a reason before this can run." } }`
 *       RUN: 4 of 71 failed. WORTH KNOWING and it is the whole point: every
 *       reason CODE stayed correct, so a suite pinning only codes would have
 *       been GREEN through this arm. The assertions therefore pin the PLANE'S
 *       OWN SENTENCES (copied into PLANE_WORDS below from store.mjs) and scan
 *       the dialog MINUS those sentences for refusal prose this surface could
 *       have written.
 *
 *   (c) A SURFACE-SIDE OPTION MAP RETURNS. Give `dispositions()` a literal
 *       fallback and the "before op=affordances answers the surface knows none"
 *       assertion fails. RUN: 2 of 71 failed.
 */
import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* THE PLANE'S OWN WORDS, copied verbatim from bio-plane/src/store.mjs
   `dispose()` and `selectionResolve()`. The suite pins THESE SENTENCES,
   because a suite that pinned only the reason code would pass an invented one
   (the arm-(b) finding). If the store rewords a refusal this file must follow
   it — that is the point, and a drift here is a real signal. */
const PLANE_WORDS = {
  NO_REASON: "C-2.8 requires a non-empty disposition_reason for deferred and dismissed, so a "
           + "disposition with no reason would produce a bundle the catalog rejects.",
  BAD_REASON: "a reason is at most 160 characters and cannot contain a quote, a backslash, or a "
            + "newline: the restricted frontmatter grammar has no escapes",
  NO_SUCH_SELECTION: "unknown, released, or expired",
  ILLEGAL_TRANSITION: "these are not legal moves in the catalog's state table. A move to the state "
                    + "something is already in usually means the view was taken before someone else's "
                    + "disposition, so it is refused rather than treated as a no-op.",
};
const REASON_MAX = 160;                 // Store.EDGE_REASON_MAX — the MOCK's rule, not the surface's
const BAD_GRAMMAR = /["\\\r\n]/;

/* ---- the mock plane: records every op, and mirrors op=dispose's REAL ORDER ---- */
function makePlane(opts){
  const CALLS = [];
  const illegalFor = (opts && opts.illegalFor) || null;   // a token the mock refuses below the selection
  function fetch(u, o){
    const url = new URL(u, "https://plane.test");
    const op = url.searchParams.get("op");
    const R = x => ({ ok:true, json:async()=>x });
    const REF = x => ({ ok:false, json:async()=>({ ok:true, result:x }) });
    let body = null; try{ body = o && o.body ? JSON.parse(o.body) : null; }catch(_){}
    CALLS.push({ op, method:(o&&o.method)||"GET", body,
      params:Object.fromEntries(url.searchParams.entries()) });
    if(op==="select"){
      const ids = (body && Array.isArray(body.ids)) ? body.ids : [];
      return R({ ok:true, result:{ ok:true, handle:"sel_"+ids.join("_"), kind:"enumerated", n:ids.length } });
    }
    if(op==="affordances"){
      /* the ENVELOPE the plane really sends (D-173's lesson) */
      if(!url.searchParams.get("target"))
        return R({ ok:true, result:{ target:null, catalog:[],
          vocabularies:{ dispositions:["deferred","dismissed"] } } });
      return R({ ok:true, result:{ target:url.searchParams.get("target"), object_type:"inquiry",
        current_state:"open", acts:[], vocabularies:{ dispositions:["deferred","dismissed"] } } });
    }
    if(op==="dispose"){
      /* store.mjs dispose(), IN ITS OWN ORDER. Every branch below the selection
         is unreachable while the handle is withheld, which is the property the
         withheld-field pre-flight rests on and which this mock exists to hold. */
      const to = url.searchParams.get("to");
      const reason = String(url.searchParams.get("reason")||"").trim();
      const handle = url.searchParams.get("handle");
      if(!["deferred","dismissed"].includes(to))
        return REF({ ok:false, reason:"NOT_A_DISPOSITION", to, detail:"only deferring and dismissing are dispositions" });
      if(!reason) return REF({ ok:false, reason:"NO_REASON", detail:PLANE_WORDS.NO_REASON });
      if(reason.length > REASON_MAX || BAD_GRAMMAR.test(reason))
        return REF({ ok:false, reason:"BAD_REASON", detail:PLANE_WORDS.BAD_REASON });
      if(!handle) return REF({ ok:false, reason:"NO_SUCH_SELECTION", detail:PLANE_WORDS.NO_SUCH_SELECTION });
      if(illegalFor && to === illegalFor)
        return REF({ ok:false, reason:"ILLEGAL_TRANSITION", to, offenders:[{ id:"INQ-2026-0004", from:"deferred" }],
                     detail:PLANE_WORDS.ILLEGAL_TRANSITION });
      const id = String(handle).replace(/^sel_/,"");
      return R({ ok:true, result:{ ok:true, to, reason, handle, disposed:[id], weight:"refuse", drift:null } });
    }
    return R({ ok:false, reason:"unexpected op "+op });
  }
  return { CALLS, fetch };
}

/* ---- a DOM stub good enough for innerHTML inspection ---- */
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

const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__probe=disposeProbe;"
  + "globalThis.__open=openDisposeDialog;globalThis.__paint=disposePaint;"
  + "globalThis.__author=disposeAuthor;"
  + "globalThis.__choose=disposeChoose;globalThis.__do=doDispose;"
  + "globalThis.__ladder=weightLadderHtml;globalThis.__state=()=>DISPOSE;"
  /* UI-12: the published set and the one seam that loads it. */
  + "globalThis.__loadActSource=loadActSource;globalThis.__dispositions=dispositions;";

async function boot(source, plane){
  const ctx = makeCtx(plane);
  vm.runInContext(source + EXPORTS, ctx);
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
  await ctx.__loadActSource(true);
  return ctx;
}
const dlg = ctx => ctx.__els.get("#dlg")._html;

const SRC = appScript();

/* ============ (0) THE SET IS THE PLANE'S ============ */
{
  const probeCtx = makeCtx(makePlane());
  vm.runInContext(SRC + EXPORTS, probeCtx);
  ok("before op=affordances answers, the surface knows NO disposition — the set is not written down here",
     probeCtx.__dispositions().length === 0);
}
const plane = makePlane();
const ctx = await boot(SRC, plane);
ok("the dispositions the surface offers are exactly the ones op=affordances published",
   JSON.stringify(ctx.__dispositions()) === JSON.stringify(["deferred","dismissed"]));
ok("op=affordances was actually asked", plane.CALLS.some(c=>c.op==="affordances"));
/* MEASURED DEFECT, FIXED AND GUARDED 2026-08-05 (UI-22). `loadActSource()` —
   the one seam that reads the published vocabularies — had NO CALLER in
   app.html. UI-12 deleted the surface-side disposition array in favour of it,
   and every harness that needed the set called the loader ITSELF in its own
   boot, so nothing went red while the real application's `dispositions()`
   answered the empty set forever: no disposition to choose, no button on the
   document page. The application's own `boot()` now awaits it, and this is the
   assertion that keeps it there — a structural pin, because no harness drives
   `boot()` end to end and a behavioural one would need a whole app fixture. */
ok("the application's own boot() loads the published vocabularies before any screen paints",
   /async function boot\(\)\{[\s\S]{0,3000}?await loadActSource\(/.test(SRC));
ok("and it does so BEFORE the first screen is chosen",
   (() => { const b = SRC.indexOf("async function boot(){");
            const load = SRC.indexOf("await loadActSource(", b);
            const go = SRC.indexOf('go("queue", true)', b);
            return b !== -1 && load !== -1 && go !== -1 && load < go; })());

/* ============ (1) STRUCTURAL: NO REFUSAL OF THIS SURFACE'S OWN ============ */
const APP = SRC;
const REGION = APP.slice(APP.indexOf("UI-2 — THE FIRST ACT"), APP.indexOf("UI-3 — THE SECOND ACT"));
ok("the dispose region is found and is substantial", REGION.length > 3000);
/* Every reason code op=dispose refuses with belongs to the plane. The ONLY
   codes this region may name are the one it withholds a field to provoke and
   the two that are not about the record at all. */
for(const code of ["NO_REASON","BAD_REASON","NOT_A_DISPOSITION","ILLEGAL_TRANSITION",
                   "BAD_TARGET_STATE","NOT_INQUIRIES","EMPTY_SELECTION","CITED"])
  ok(`the dispose region names no ${code} refusal of its own`,
     !new RegExp(`reason:\\s*"${code}"`).test(REGION));
ok("the ONE reason code the dispose region knows is the field it withholds, and it is a READ not a render",
   REGION.includes('a.refusal.reason === "NO_SUCH_SELECTION"'));
ok("the surface keeps no copy of the store's reason grammar (no length constant, no grammar regex)",
   !/DISPOSE_REASON_MAX\s*=/.test(APP) && !/DISPOSE_REASON_RULE\s*=/.test(APP));
ok("and no mirror of the state machine is read as an act rule any more",
   !/const disposeLegal\s*=/.test(APP) && !/const DISPOSE_LEGAL\s*=/.test(APP));

/* ============ (2) THE PROBE: ASKED, WITH THE HANDLE WITHHELD ============ */
const before = plane.CALLS.length;
await ctx.__open("INQ-2026-0004", "Why did the sewer contract skip competitive bid?", "deferred");
const probeCalls = plane.CALLS.slice(before).filter(c=>c.op==="dispose");
ok("opening the dialog ASKS the plane what it would refuse", probeCalls.length === 1);
ok("and it asks with the HANDLE WITHHELD — nothing can be moved by a check",
   probeCalls[0].params.handle === "");
ok("no selection was built for the check (op=select is not sent by a pre-flight)",
   !plane.CALLS.slice(before).some(c=>c.op==="select"));
ok("no accepted op=dispose reached the plane during the check",
   !plane.CALLS.slice(before).some(c=>c.op==="dispose" && c.params.handle));

/* ============ (3) THE PLANE'S OWN REFUSAL, AND NO COMMIT CONTROL ============ */
const noReason = dlg(ctx);
ok("with no reason written, the record's OWN NO_REASON sentence is what renders",
   noReason.includes(PLANE_WORDS.NO_REASON));
ok("and its reason CODE is shown beside it, unmodified", noReason.includes("NO_REASON"));
ok("THE COMMIT CONTROL IS ABSENT while the record refuses — not present and greyed",
   !/id="dz-go"/.test(noReason) && !/disabled/.test(noReason));
ok("the dialog offers every published disposition, under the member's verb for it",
   noReason.includes("Defer") && noReason.includes("Dismiss"));
ok("CHOOSE: the dialog names the question by title",
   noReason.includes("Why did the sewer contract skip competitive bid?"));
ok("AUTHOR: the reason field is never prefilled, and carries no drafted placeholder",
   /id="dz-reason"[^>]*>\s*<\/textarea>/.test(noReason) && !/placeholder=/.test(noReason));
ok("no length rule is copied onto the page", !/maxlength=/.test(noReason) && !noReason.includes("160"));

/* THE RESIDUE SCAN — arm (b)'s instrument. The dialog MINUS the plane's own
   sentences must contain no refusal prose this surface could have written.
   Scanning the whole dialog would be scanning the plane's words, which
   legitimately say "requires" and "rejects". */
const residue = h => Object.values(PLANE_WORDS).reduce((acc,w)=>acc.split(w).join(" "), String(h));
const REFUSAL_PROSE = /(won't run|will not run|is refused until|you need to|before this can run|nothing stands in the way|what it will refuse)/i;
ok("no sentence in the dialog that is not the record's own reads as a refusal",
   !REFUSAL_PROSE.test(residue(noReason)));

/* ============ (4) A BAD REASON: THE PLANE'S GRAMMAR, THE PLANE'S WORDS ============ */
await ctx.__author('has a "quote" in it');
const badGrammar = dlg(ctx);
ok("a reason the record's grammar rejects is refused BY THE RECORD, in its words",
   badGrammar.includes(PLANE_WORDS.BAD_REASON) && badGrammar.includes("BAD_REASON"));
ok("and the commit control is still absent", !/id="dz-go"/.test(badGrammar));
ok("nothing about the grammar is restated by this page", !REFUSAL_PROSE.test(residue(badGrammar)));

/* ============ (5) A GOOD REASON: THE CHECK CLEARS, THE CONTROL APPEARS ============ */
await ctx.__author("Duplicates the audit already open under Project 14; nothing new to pursue here");
const clear = dlg(ctx);
ok("with an authored reason the record's only outstanding refusal is the withheld field",
   ctx.__state().pf.clear === true);
ok("THE COMMIT CONTROL EXISTS once the record has nothing else to say", /id="dz-go"/.test(clear));
ok("and the surface does not congratulate the member on clearing a check it did not run",
   !/nothing stands in the way/i.test(clear));
ok("the cleared check never rendered NO_SUCH_SELECTION at the member",
   !clear.includes("NO_SUCH_SELECTION") && !clear.includes(PLANE_WORDS.NO_SUCH_SELECTION));

/* ============ (6) COMMIT: op=select THEN op=dispose, AND THE RECEIPT ============ */
const r2 = await ctx.__do();
const selCall = plane.CALLS.find(c=>c.op==="select");
const dispCall = plane.CALLS.filter(c=>c.op==="dispose").find(c=>c.params.handle);
ok("the act builds a ONE-question enumerated selection (op=select)",
   !!selCall && selCall.body && Array.isArray(selCall.body.ids) && selCall.body.ids.length===1
   && selCall.body.ids[0]==="INQ-2026-0004");
ok("the act disposes that selection with the chosen token", !!dispCall && dispCall.params.to==="deferred");
ok("the act sends the AUTHORED reason to the plane", dispCall.params.reason.includes("Duplicates the audit already open"));
ok("op=select was sent before the committing op=dispose", plane.CALLS.indexOf(selCall) < plane.CALLS.indexOf(dispCall));
ok("the browser never sends an author/actor (the plane stamps it)",
   !("author" in dispCall.params) && !("actor" in dispCall.params));
const rc = dlg(ctx);
ok("RECEIPT: the act is confirmed done, under the record's OWN token", /Deferred\./.test(rc));
ok("RECEIPT: it shows the question now reads as deferred", rc.includes("chip deferred") || /reads as/.test(rc));
ok("RECEIPT: it shows the reason AS RECORDED by the plane", rc.includes("Duplicates the audit already open"));
ok("RECEIPT: it states the weight-ladder rung (reasoned)", /reasoned/.test(rc));
ok("the successful act returned the plane's receipt object",
   r2 && r2.ok===true && Array.isArray(r2.disposed) && r2.disposed[0]==="INQ-2026-0004");

/* ============ (7) CHOOSE IS LIVE: SWITCHING RE-ASKS THE PLANE ============ */
{
  const p2 = makePlane(); const c2 = await boot(SRC, p2);
  await c2.__open("INQ-2026-0009", "A second question", "deferred");
  const n0 = p2.CALLS.filter(c=>c.op==="dispose").length;
  await c2.__choose("dismissed");
  ok("switching the chosen token re-asks the plane rather than re-deciding here",
     p2.CALLS.filter(c=>c.op==="dispose").length === n0 + 1);
  await c2.__author("Out of scope for this record");
  await c2.__do();
  const d2 = p2.CALLS.filter(c=>c.op==="dispose").find(c=>c.params.handle);
  ok("switching the choice to dismiss disposes to dismissed", !!d2 && d2.params.to==="dismissed");
  ok("the dismiss receipt confirms Dismissed, from the record's own token", /Dismissed\./.test(dlg(c2)));
}

/* ============ (8) THE ARM BELOW THE SELECTION: THE PLANE WORDS IT ============
   ILLEGAL_TRANSITION lives below `selectionResolve`, so the probe cannot reach
   it — it is pre-flighted by PUBLICATION and, where it fires anyway, worded by
   the record. This drives exactly that: a probe that clears, a commit that the
   record refuses, and the record's sentence and offenders on the page. */
{
  const p3 = makePlane({ illegalFor:"deferred" }); const c3 = await boot(SRC, p3);
  await c3.__open("INQ-2026-0004", "A stale view", "deferred");
  await c3.__author("the view was taken before somebody else moved it");
  ok("the probe cleared — the arm below the selection is out of its reach", c3.__state().pf.clear === true);
  const res = await c3.__do();
  const h = dlg(c3);
  ok("the record's own ILLEGAL_TRANSITION sentence is what renders", h.includes(PLANE_WORDS.ILLEGAL_TRANSITION));
  ok("and the ids the record NAMED are spelled out, from its own offenders field",
     h.includes("Named by the record") && h.includes("INQ-2026-0004"));
  ok("no sentence of this surface's own accompanies it", !REFUSAL_PROSE.test(residue(h)));
  ok("the refused act reports the record's code back to its caller", res && res.reason === "ILLEGAL_TRANSITION");
}

/* ============ (9) THE WEIGHT LADDER — dispose sits on `reasoned` ============ */
const lad = ctx.__ladder("reasoned");
ok("the ladder shows all four rungs", ["reversible","reasoned","terminal","attested"].every(r=>lad.includes(r)));
ok("the ladder marks THIS act's rung as reasoned", /wl-rung on[\s\S]*?reasoned/.test(lad) && lad.includes("this act"));
ok("the ladder teaches that a justification is required and never prefilled", lad.includes("never prefilled"));

/* ============ (10) THE VOCABULARY GUARD, CORRECTED AND SAID WHY ============
   CORRECTED 2026-08-05 (UI-22), and it is a correction with a reason rather
   than an exemption. The old guard scanned the WHOLE dialog for plane-internal
   jargon — "handle", "selection", "disposition_reason" — and it passed because
   the surface wrote every sentence itself and could keep them out. Now the
   record's own refusal renders verbatim, and the record legitimately says
   `disposition_reason` (C-2.8 is what it is enforcing). Censoring the plane is
   DEC-8 in reverse (UI-14's landed finding), so the guard now scans THIS
   SURFACE'S OWN CHROME: the dialog with every plane sentence removed. What it
   protects is unchanged — this page must not teach the member the plane's
   internals — and it is now testing the half that is actually ours. */
const chrome = residue(dlg(ctx)) + residue(noReason) + residue(badGrammar) + lad;
for(const word of ["op=", "op=dispose", "handle", "sel_", "current_state",
                   "disposition_reason", "EDGE_REASON", "capture_sha", "bundle.md"])
  ok(`the act surface's OWN chrome never says "${word}"`, !chrome.includes(word));

/* ============ NEGATIVE CONTROLS — RUN, not inferred ============
   EVERY MUTATION IS SCOPED TO `disposeProbe`, and the scoping is not cosmetic:
   `retire` withholds the SAME field and its pre-flight line is byte-identical
   and comes FIRST in the file, so a plain `String.replace` mutates RETIRE and
   leaves this flow intact — a control that would have reported "no change" as
   green. `mutProbe` splices inside `disposeProbe`'s own body. */
function mutProbe(src, from, to){
  const start = src.indexOf("async function disposeProbe(){");
  if(start === -1) return src;
  const end = src.indexOf("\n}", start);
  const body = src.slice(start, end);
  if(!body.includes(from)) return src;
  return src.slice(0, start) + body.replace(from, to) + src.slice(end);
}
async function arm(mutate){
  const src = mutate(SRC);
  if(src === SRC) return null;
  const p = makePlane(); const c = await boot(src, p);
  return { p, c, src };
}

/* (a) THE PROBE NEUTERED: every answer treated as clear. */
{
  const a = await arm(s => mutProbe(s, 'a.refusal.reason === "NO_SUCH_SELECTION" ? { clear:true, refusal:null }',
                                       'true ? { clear:true, refusal:null }'));
  /* A null arm means the ON-DISK source is ALREADY mutated — which is what this
     assertion is for, and why the arm's body is skipped rather than left to
     throw: a suite that crashes here hides every assertion after it, and the
     on-disk control needs the whole report. */
  ok("NEG-CONTROL (a): the mutation actually changed the source", !!a);
  if(a){
  await a.c.__open("INQ-2026-0004", "sewer", "deferred");
  const h = dlg(a.c);
  ok("NEG-CONTROL (a): with the probe neutered the commit control appears on an EMPTY reason",
     /id="dz-go"/.test(h));
  await a.c.__do();
  ok("NEG-CONTROL (a): and the empty-reason act IS sent to the plane",
     a.p.CALLS.some(c=>c.op==="dispose" && c.params.handle && String(c.params.reason||"").trim()===""));
  }
  ok("NEG-CONTROL (a) contrast: the intact surface sent no committing op=dispose with an empty reason",
     !plane.CALLS.some(c=>c.op==="dispose" && c.params.handle && String(c.params.reason||"").trim()===""));
}

/* (b) THE ARM-(d) INSTRUMENT: right code, invented sentence. */
{
  const a = await arm(s => mutProbe(s, ": { clear:false, refusal:a.refusal });",
    ': { clear:false, refusal:{ reason:a.refusal.reason, detail:"You need to write a reason before this can run." } });'));
  ok("NEG-CONTROL (b): the mutation actually changed the source", !!a);
  if(a){
  await a.c.__open("INQ-2026-0004", "sewer", "deferred");
  const h = dlg(a.c);
  ok("NEG-CONTROL (b): the reason CODE is still correct — a code-only suite would be GREEN here",
     h.includes("NO_REASON"));
  ok("NEG-CONTROL (b): but the record's own sentence is GONE", !h.includes(PLANE_WORDS.NO_REASON));
  ok("NEG-CONTROL (b): and the residue scan names the SURFACE as the author of what stands there",
     REFUSAL_PROSE.test(residue(h)));
  }
  ok("NEG-CONTROL (b) contrast: the intact surface renders the record's sentence and no invented one",
     noReason.includes(PLANE_WORDS.NO_REASON) && !REFUSAL_PROSE.test(residue(noReason)));
}

/* (c) A SURFACE-SIDE OPTION MAP RETURNS. */
{
  const src = SRC.replace('const dispositions = () => actVocab("dispositions");',
                          'const dispositions = () => actVocab("dispositions").length ? actVocab("dispositions") : ["deferred","dismissed"];');
  ok("NEG-CONTROL (c): the mutation actually changed the source", src !== SRC);
  const c = makeCtx(makePlane());
  vm.runInContext(src + EXPORTS, c);
  ok("NEG-CONTROL (c): with a literal fallback the surface knows a disposition BEFORE the plane answered",
     c.__dispositions().length > 0);
}

if(fails.length){ console.error(`act-dispose: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`act-dispose: ${n} assertions, all green — published set · withheld-handle pre-flight · plane-worded refusals · absent commit · receipt · ladder; negative controls RUN (a) probe neutered (b) right code + invented sentence (c) option map`);
