/* UI-5 — THE THIRD ACT: a PROPOSAL, a DERIVED finding awaiting an authored act
 * (BIO_Interaction_Constructs v0.2 — the ACT construct + §P PROPOSAL; D-90
 * invariant 8 "derived things inform and authored acts bind"; D-82 the DISPLAY
 * half; D-79 aggregate-not-drown). This is v0.2's FALSIFIABLE test act THREE:
 * v0.2 folded PROPOSAL into the ACT surface, and this suite is the test of that
 * claim — see the COLLAPSE VERDICT recorded in CLAIMS.md / the session report.
 *
 * It proves, driving the surface's own functions:
 *   D-79  many instances of ONE check are ONE proposal with N instances, NEVER N.
 *   D-82  a proposal renders VISIBLY as one — its derived / "nobody has yet judged
 *         it" nature shown — and NEVER as an established fact. This is the marker
 *         the negative control removes.
 *   §P    EXACTLY three affordances: ADOPT / DEFER / DISMISS, and only three.
 *   J     DEFER/DISMISS require a reason, NEVER prefilled, refused in the surface
 *         before the plane; ADOPT authors a focus in the member's OWN words (the
 *         machine's question is context, never put in their mouth) and the browser
 *         never sends surfaced_by — the plane stamps it (REC-3).
 *
 * accepts-when (QUEUE UI-5): a derived finding renders as visibly a proposal (its
 * surfaced_by / derived nature shown, never established), offers exactly
 * adopt/defer/dismiss, and requires a reason on defer/dismiss.
 *
 * NEGATIVE CONTROL: remove the "visibly a proposal" marker — neuter
 * proposalDerivedBadgeHtml so it returns "" — and the proposal card no longer
 * carries the derived signal, so it reads as an ESTABLISHED FINDING (D-82
 * regressed). RUN MECHANICALLY below in a second VM context built from the source
 * with that exact function stubbed. RUN 2026-07-31: marker intact -> the card
 * carries "Surfaced by the record" AND "Nobody has yet" and reads as a question;
 * marker removed -> both are gone from the card and it reads as an established
 * finding (2 control assertions flip). Restored source -> green.
 */
import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---- the mock plane: records every op, mirrors allocid + promote +
   proposedispose (the ADOPT and DEFER/DISMISS backings) ---- */
function makePlane(opts){
  opts = opts || {};
  const CALLS = [];
  let seq = 0;
  function fetch(u, o){
    const url = new URL(u, "https://plane.test");
    const op = url.searchParams.get("op");
    const R = x => ({ ok:true, json:async()=>x });
    let body = null; try{ body = o && o.body ? JSON.parse(o.body) : null; }catch(_){}
    CALLS.push({ op, method:(o&&o.method)||"GET", body,
      params:Object.fromEntries(url.searchParams.entries()) });
    if(op==="allocid") return R({ result:{ id:"FOCUS-2026-" + String(++seq).padStart(4,"0") } });
    if(op==="promote") return R({ result:{ ok:true, bundle_id:(body&&body.bundleId) } });
    if(op==="proposedispose"){
      if(opts.noDisposeOp) return { ok:false, json:async()=>({ ok:false, error:"unknown op" }) };
      const reason = String((body&&body.reason)||"").trim();
      if(!reason) return { ok:false, json:async()=>({ ok:false, reason:"NO_REASON" }) };
      return R({ ok:true, key:body&&body.key, to:body&&body.to, reason });
    }
    if(op==="proposals"){
      if(opts.noFeedOp) return { ok:false, json:async()=>({ ok:false, error:"unknown op" }) };
      return R({ result:{ instances: opts.instances||[] } });
    }
    return R({ ok:false, reason:"unexpected op "+op });
  }
  return { CALLS, fetch };
}

/* ---- a DOM stub good enough for innerHTML inspection (act-dispose's shape) ---- */
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
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
    document:doc, location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,opts)=>plane.fetch(u,opts) };
  ctx.globalThis = ctx; vm.createContext(ctx); ctx.__els = els;
  return ctx;
}

const EXPORTS = ";globalThis.__PLANE=PLANE;"
  + "globalThis.__from=proposalsFrom;globalThis.__card=proposalCardHtml;globalThis.__badge=proposalDerivedBadgeHtml;"
  + "globalThis.__q=proposalQuestion;globalThis.__pfDisp=proposalDisposePreflight;globalThis.__pfAdopt=proposalAdoptPreflight;"
  + "globalThis.__openAct=openProposalAct;globalThis.__actVal=proposalActValidate;globalThis.__doDisp=doProposalDispose;"
  + "globalThis.__openAdopt=openProposalAdopt;globalThis.__adoptVal=proposalAdoptValidate;globalThis.__doAdopt=doProposalAdopt;"
  + "globalThis.__setProps=(a)=>{PROPOSALS_LAST=a;};";

function boot(source, plane){
  const ctx = makeCtx(plane);
  vm.runInContext(source + EXPORTS, ctx);
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
  return ctx;
}

const SRC = appScript();

/* the derived instance reads, exactly the op=instance shape (FW-9): a missing
   REQUIRED stage surfaces as a finding. THREE procurement instances share ONE
   missing 'solicitation' stage — the D-79 case: one check across three instances. */
const INSTANCES = [
  { progression_key:"procurement", progression_label:"Procurement", entity_id:"ENT-1", entity_label:"Recology Hauling Contract",
    findings:[ { kind:"missing_predecessor", stage_key:"solicitation", stage_label:"RFP / RFQ / IFB", required:"usually", grade:"A", grade_determined:true } ] },
  { progression_key:"procurement", progression_label:"Procurement", entity_id:"ENT-2", entity_label:"Waste Management Contract",
    findings:[ { kind:"missing_predecessor", stage_key:"solicitation", stage_label:"RFP / RFQ / IFB", required:"usually", grade:"C", grade_determined:true } ] },
  { progression_key:"procurement", progression_label:"Procurement", entity_id:"ENT-3", entity_label:"GreenTeam Contract",
    findings:[ { kind:"missing_predecessor", stage_key:"solicitation", stage_label:"RFP / RFQ / IFB", required:"usually", grade:"A", grade_determined:true },
               /* a SECOND, different missing stage on this instance — a distinct question */
               { kind:"missing_predecessor", stage_key:"contract", stage_label:"signed agreement", required:"always", grade:"A", grade_determined:true } ] },
];

const plane = makePlane({ instances:INSTANCES });
const ctx = boot(SRC, plane);

/* ============================================================
   D-79 — AGGREGATE, DO NOT DROWN. proposalsFrom is pure; prove it directly.
   ============================================================ */
const props = ctx.__from(INSTANCES);
ok("D-79: three instances of ONE missing check become ONE proposal with N instances, not three items",
   props.some(p => p.stage_key==="solicitation" && p.n===3 && p.instances.length===3));
ok("D-79: a DIFFERENT missing stage is its OWN proposal, not merged into the first",
   props.some(p => p.stage_key==="contract" && p.n===1));
ok("D-79: exactly two proposals emerge (one per distinct check), not four (one per finding)",
   props.length===2);
const solic = props.find(p => p.stage_key==="solicitation");
ok("the aggregated proposal names its progression and stage", solic.progression_key==="procurement" && solic.stage_key==="solicitation");
ok("the biggest pattern sorts first (drowning is many small items; this is one big question)", props[0].stage_key==="solicitation");
/* the strength grade is the WEAKEST across instances (a case is only as strong as its weakest link) */
ok("the proposal's grade is the WEAKEST across its instances (A,C,A -> C), never the strongest",
   solic.grade==="C" && solic.grade_determined===true);
/* undetermined is honest: one undetermined instance makes the group's grade undetermined, never guessed */
const undetProps = ctx.__from([{ progression_key:"p", entity_id:"E", findings:[
  { kind:"missing_predecessor", stage_key:"s", required:"always", grade:"A", grade_determined:true },
  { kind:"missing_predecessor", stage_key:"s", required:"always", grade:null, grade_determined:false } ] }]);
ok("undetermined is HONEST: any undetermined instance makes the aggregate grade undetermined, never a guess",
   undetProps[0].grade===null && undetProps[0].grade_determined===false);

/* ============================================================
   D-82 — THE PROPOSAL LOOKS DERIVED, and NEVER like an established fact.
   ============================================================ */
const card = ctx.__card(solic);
ok("D-82: the card is marked SURFACED BY THE RECORD (surfaced_by machine, REC-3's distinction)",
   /Surfaced by the record/i.test(card));
ok("D-82: the card says nobody has yet judged it worth pursuing (the exact thing a member must know)",
   /Nobody has yet decided it is worth pursuing/i.test(card) || /not yet judged/i.test(card));
ok("D-82: the card frames it as a QUESTION the record raised, not an established finding",
   /a question the record raised, not an established finding/i.test(card));
ok("D-82: the grade is shown as HOW it was established, never as credibility or as fact",
   /Grade C/.test(card) && /not how much to trust it/i.test(card) && /not a judgment that the question matters/i.test(card));
ok("D-82: the question is rendered (the member reads the record's own words)",
   card.includes(ctx.__q(solic)) && /Why do these 3 procurement/i.test(card));

/* ============================================================
   §P — EXACTLY THREE affordances: adopt / defer / dismiss, and only three.
   ============================================================ */
ok("EXACTLY three affordances are offered: adopt, defer, dismiss",
   card.includes('data-prop-adopt') && card.includes('data-prop-defer') && card.includes('data-prop-dismiss'));
const actBtns = (card.match(/data-prop-(adopt|defer|dismiss)=/g)||[]).length;
ok("there are precisely THREE act controls on the card, no fourth", actBtns===3);
for(const forbidden of ["Publish", "Release", "Ratify", "Sign", "Endorse", "Retire", "Delete"])
  ok(`the proposal offers no ${forbidden} affordance (only the three)`, !new RegExp(">[^<]*"+forbidden).test(card));

/* ============================================================
   DEFER / DISMISS — a reason is REQUIRED and NEVER prefilled (pre-flight, pure).
   ============================================================ */
const pfEmpty = ctx.__pfDisp({ to:"deferred", reason:"" });
ok("pre-flight: an empty reason WILL refuse (NO_REASON) — a reason is required",
   pfEmpty.ok===false && pfEmpty.refusal.reason==="NO_REASON");
ok("pre-flight names a reason gate the member must clear", pfEmpty.gates.some(g=>g.id==="reason" && !g.pass));
const pfGood = ctx.__pfDisp({ to:"dismissed", reason:"below the solicitation threshold" });
ok("pre-flight: an authored reason clears every gate", pfGood.ok===true && pfGood.refusal===null);
const pfQuote = ctx.__pfDisp({ to:"deferred", reason:'has a "quote"' });
ok("pre-flight: a quote in the reason WILL refuse (BAD_REASON grammar)", pfQuote.ok===false && pfQuote.refusal.reason==="BAD_REASON");

/* the dialog: choose + pre-flight rendered, reason never prefilled */
ctx.__setProps(props);
ctx.__openAct(solic.key, "deferred");
const els = ctx.__els;
const dlg0 = els.get("#dlg")._html;
ok("CHOOSE: the dialog offers both dispositions (defer & dismiss)", /Defer/.test(dlg0) && /Dismiss/.test(dlg0));
ok("the dialog shows the record's question as CONTEXT, not as the member's claim", dlg0.includes(ctx.__q(solic)));
ok("AUTHOR: the reason field is never prefilled (placeholder only)", dlg0.includes("placeholder=") && /id="pa-reason"[^>]*>\s*<\/textarea>/.test(dlg0));
ok("the pre-flight is painted before the act runs", /what it will refuse/i.test(els.get("#pa-pf")._html));
ok("the commit button is disabled until the pre-flight clears", els.get("#pa-go").disabled===true);
ok("the weight ladder places the act on 'reasoned' (never prefilled)", /reasoned/.test(dlg0) && /never prefilled/.test(dlg0));

/* the empty-reason ACT is refused IN THE SURFACE — op=proposedispose never sent */
const before = plane.CALLS.length;
const r1 = await ctx.__doDisp();
ok("empty-reason act returns refused (surface-side)", r1 && r1.refused===true && r1.reason==="NO_REASON");
ok("empty-reason act sent NO op=proposedispose — refused BEFORE the plane",
   !plane.CALLS.slice(before).some(c=>c.op==="proposedispose"));
ok("empty-reason act shows the reason to the member, and says nothing was written",
   /nothing has been written/i.test(els.get("#pa-err")._html));

/* AUTHOR the reason, then RECEIPT */
els.get("#pa-reason").value = "These awards are below the competitive-bid threshold, so no solicitation was required";
ctx.__actVal();
ok("with a reason authored, the pre-flight clears and the button enables", els.get("#pa-go").disabled===false);
const r2 = await ctx.__doDisp();
const dispCall = plane.CALLS.find(c=>c.op==="proposedispose");
ok("the act records the disposition through op=proposedispose with the chosen state", !!dispCall && dispCall.body.to==="deferred");
ok("the act sends the AUTHORED reason", dispCall.body.reason.includes("below the competitive-bid threshold"));
ok("the act sends the proposal KEY (a proposal is addressed by its aggregation key, not a bundle id)", dispCall.body.key===solic.key);
ok("the browser never sends an author/actor (the plane stamps it)", !("actor" in dispCall.body) && !("author" in dispCall.body));
const rc = els.get("#dlg")._html;
ok("RECEIPT: the act is confirmed done (deferred)", /Deferred\./.test(rc));
ok("RECEIPT: it shows the reason AS RECORDED", rc.includes("below the competitive-bid threshold"));
ok("the successful act returned the plane's receipt", r2 && r2.ok===true);

/* the DELEGATION path: when op=proposedispose is absent, the surface says so and writes nothing */
const planeNo = makePlane({ noDisposeOp:true }); const ctxNo = boot(SRC, planeNo);
ctxNo.__setProps(props); ctxNo.__openAct(solic.key, "dismissed");
ctxNo.__els.get("#pa-reason").value = "out of scope for this record";
ctxNo.__actVal();
const rNo = await ctxNo.__doDisp();
ok("GAP: with the delegated op absent the act is refused as a gap, having written nothing",
   rNo && rNo.refused===true && rNo.gap===true);
ok("GAP: the surface says the record cannot yet keep a proposal's disposition (names the delegation)",
   /cannot yet keep a proposal.s disposition/i.test(ctxNo.__els.get("#pa-err")._html) && /proposedispose/.test(ctxNo.__els.get("#pa-err")._html));

/* ============================================================
   ADOPT — author a focus in the member's OWN words; the plane stamps surfaced_by.
   ============================================================ */
const paEmpty = ctx.__pfAdopt({ kind:"focus", title:"", statement:"", canContribute:true });
ok("ADOPT pre-flight: an unwritten focus is refused — a title and a statement are REQUIRED",
   paEmpty.ok===false && (paEmpty.refusal.reason==="NO_TITLE"));
const paNoStmt = ctx.__pfAdopt({ kind:"focus", title:"why no bids?", statement:"", canContribute:true });
ok("ADOPT pre-flight: a title without a statement is refused (the statement is the member's judgment)",
   paNoStmt.ok===false && paNoStmt.refusal.reason==="NO_STATEMENT");
const paNoCap = ctx.__pfAdopt({ kind:"focus", title:"t", statement:"s", canContribute:false });
ok("ADOPT pre-flight: a credential without contribute cannot author (NO_CONTRIBUTE)", paNoCap.refusal.reason==="NO_CONTRIBUTE");
const paGood = ctx.__pfAdopt({ kind:"focus", title:"t", statement:"s", canContribute:true });
ok("ADOPT pre-flight: an authored title and statement clear the gates", paGood.ok===true);

ctx.__setProps(props);
ctx.__openAdopt(solic.key);
const adlg = els.get("#dlg")._html;
ok("ADOPT dialog shows the record's question as CONTEXT, labelled 'not to copy'",
   /not to copy/i.test(adlg) && adlg.includes(ctx.__q(solic)));
ok("ADOPT: the title and statement fields are never prefilled (placeholders only)",
   /id="ad-title"[^>]*placeholder=/.test(adlg) && /id="ad-statement"[^>]*placeholder=[^>]*>\s*<\/textarea>/.test(adlg));
ok("ADOPT: the statement field carries NO machine-authored default value (never prefilled — J is absolute)",
   /id="ad-statement"[^>]*>\s*<\/textarea>/.test(adlg));

/* author it, commit, and confirm op=promote is the backing and surfaced_by is NOT sent by the browser */
els.get("#ad-title").value = "Why did these three hauling contracts skip competitive bidding?";
els.get("#ad-statement").value = "Three contracts to the same kind of vendor with no solicitation on record; worth establishing whether a threshold or an exemption applies.";
ctx.__adoptVal();
ok("with a title and statement authored, ADOPT's button enables", els.get("#ad-go").disabled===false);
const before2 = plane.CALLS.length;
const ra = await ctx.__doAdopt();
const promoteCall = plane.CALLS.slice(before2).find(c=>c.op==="promote");
ok("ADOPT authors through op=promote", !!promoteCall);
ok("ADOPT writes a FOCUS bundle (the question becomes a member's focus)", promoteCall.body.meta.object_type==="focus");
ok("ADOPT carries the member's AUTHORED title, not the machine's question",
   promoteCall.body.meta.title==="Why did these three hauling contracts skip competitive bidding?");
const md = (promoteCall.body.files||[]).find(f=>f.path==="bundle.md").text;
ok("ADOPT's bundle.md carries the member's statement, in their own words", md.includes("Three contracts to the same kind of vendor"));
ok("ADOPT: the browser NEVER sends surfaced_by — the plane stamps it from the session (REC-3)",
   !md.includes("surfaced_by: agent") && !/"surfaced_by"/.test(JSON.stringify(promoteCall.body.meta)));
ok("ADOPT succeeded and returned the new focus id", ra && ra.ok===true && /^FOCUS-2026/.test(ra.id));
const arc = els.get("#dlg")._html;
ok("ADOPT receipt states surfaced_by human — a person judged it worth pursuing", /surfaced_by: human/.test(arc));

/* ============================================================
   NEGATIVE CONTROL — RUN, not inferred. Rebuild the surface from the source with
   the "visibly a proposal" marker (proposalDerivedBadgeHtml) NEUTERED to return
   "", and confirm the card loses its derived signal — so it reads as an
   ESTABLISHED FINDING (D-82 regressed). This is the exact break the declaration
   line names.
   ============================================================ */
const BROKEN = SRC.replace(
  /function proposalDerivedBadgeHtml\(p\)\{\n  return `<div class="prop-derived">[\s\S]*?<\/div>`;\n\}/,
  'function proposalDerivedBadgeHtml(p){ return ""; /* NEGATIVE CONTROL: the visibly-a-proposal marker removed */ }');
ok("the negative-control mutation actually changed the source", BROKEN !== SRC);
const ctxNC = boot(BROKEN, makePlane({}));
const cardNC = ctxNC.__card(ctxNC.__from(INSTANCES).find(p=>p.stage_key==="solicitation"));
ok("NEG-CONTROL: with the marker removed, the card NO LONGER says 'Surfaced by the record'",
   !/Surfaced by the record/i.test(cardNC));
ok("NEG-CONTROL: with the marker removed, the card NO LONGER says nobody has yet judged it — it reads as an established finding",
   !/Nobody has yet decided it is worth pursuing/i.test(cardNC) && !/not yet judged/i.test(cardNC));
/* control-of-the-control: the intact card DID carry both signals (proven above, re-asserted here) */
ok("NEG-CONTROL contrast: the intact card carried the derived signal the broken one lost",
   /Surfaced by the record/i.test(card) && /Nobody has yet decided it is worth pursuing/i.test(card));

if(fails.length){ console.error(`act-proposal: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`act-proposal: ${n} assertions, all green — D-79 aggregation · D-82 visibly-derived · exactly adopt/defer/dismiss · reason required & never prefilled · op=promote adopt · negative control RUN`);
