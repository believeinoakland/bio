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
/* The catalog, so what ADOPT writes is pinned to the type and first state the
   plane itself would accept rather than to a literal in this file (UI-10). */
import { STATES } from "../../bio-plane/checks/bio-checks.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* THE PLANE'S OWN WORDS for op=proposedispose's refusals, copied verbatim from
   bio-plane/src/store.mjs `proposeDispose()`. Added 2026-08-05 (UI-22): the
   suite pins THESE SENTENCES, because a suite that pinned only the reason code
   would pass an invented one — the arm-(d) instrument UI-12 named. */
const PROP_WORDS = {
  NOT_A_DISPOSITION: "a proposal is deferred (parked) or dismissed (declined); adopting one authors a "
                   + "focus (op=promote) and is not a disposition",
  NO_REASON: "deferring or dismissing the record's own question is recorded with a reason, in the "
           + "member's own words — a disposition with no reason ages a finding with no account of why",
  BAD_REASON: "a reason is at most 160 characters and cannot contain a quote, a backslash, or a "
            + "newline: the restricted frontmatter grammar has no escapes",
};

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
    /* The stub mints under the prefix the SURFACE asks for, so a surface that
       asked for the retired prefix would be visible here rather than papered
       over by a fixture that always answers FOCUS- (UI-10). */
    if(op==="allocid") return R({ result:{ id:(url.searchParams.get("prefix")||"INQ") + "-2026-" + String(++seq).padStart(4,"0") } });
    if(op==="promote") return R({ result:{ ok:true, bundle_id:(body&&body.bundleId) } });
    /* CORRECTED 2026-08-05 (UI-22): the mock now answers op=proposedispose in
       the store's OWN ORDER and with the store's OWN SENTENCES (store.mjs
       `proposeDispose()`), in the ENVELOPE the control plane really sends.
       It answered a bare `{ok:false, reason:"NO_REASON"}` with no detail, which
       let the surface's invented sentence look necessary. */
    if(op==="proposedispose"){
      if(opts.noDisposeOp) return { ok:false, json:async()=>({ ok:false, error:"unknown op" }) };
      const to = body && body.to;
      const reason = String((body&&body.reason)||"").trim();
      const REF = x => ({ ok:false, json:async()=>({ ok:true, result:x }) });
      if(!["deferred","dismissed"].includes(to))
        return REF({ ok:false, reason:"NOT_A_DISPOSITION", to, detail:PROP_WORDS.NOT_A_DISPOSITION });
      if(!reason) return REF({ ok:false, reason:"NO_REASON", detail:PROP_WORDS.NO_REASON });
      if(reason.length > 160 || /["\\\r\n]/.test(reason))
        return REF({ ok:false, reason:"BAD_REASON", detail:PROP_WORDS.BAD_REASON });
      return R({ ok:true, result:{ ok:true, key:body&&body.key, to, reason } });
    }
    /* UI-22: the disposition SET is the plane's now on this surface too. */
    if(op==="affordances")
      return R({ ok:true, result:{ target:null, catalog:[],
        vocabularies:{ dispositions:["deferred","dismissed"] } } });
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

/* CORRECTED 2026-08-04 (UI-14). `proposalsFrom` and `proposalCardHtml` no longer
   exist: the D-79 aggregation moved INTO THE PLANE (op=queue emits one FINDING
   per (progression, stage) out of proposalsFeed) and the Proposals screen's card
   was replaced by the queue row. The exports below follow the code — `__row` is
   the queue's item renderer and `__asProp` is the act context taken from a
   FINDING — and the assertions that used to prove a browser-side aggregation now
   prove the row RENDERS THE PRODUCER'S OWN COUNT rather than recomputing one.
   Everything from §P down is unchanged: the three affordances, the required
   reason, the never-prefilled fields and op=promote are the same acts on the
   same shapes, reached from a different surface. */
const EXPORTS = ";globalThis.__PLANE=PLANE;"
  + "globalThis.__row=queueItemHtml;globalThis.__asProp=queueFindingAsProposal;globalThis.__badge=proposalDerivedBadgeHtml;"
  /* CORRECTED 2026-08-05 (UI-22): `proposalDisposePreflight` and
     `proposalActValidate` no longer exist. The pre-flight computed and WORDED
     its own NOT_A_DISPOSITION / NO_REASON / BAD_REASON over a literal token
     array; the flow now takes the NO-REFUSAL SHAPE (no probe is available —
     op=proposedispose judges the progression and stage keys BEFORE the reason,
     so there is no withholdable last field) and the record words everything
     that survives to the commit. `__paint` replaces `__actVal`; `__author`
     is how a reason is written, because the field is `onchange` now. */
  + "globalThis.__ctxLine=proposalContext;globalThis.__pfAdopt=proposalAdoptPreflight;"
  + "globalThis.__openAct=openProposalAct;globalThis.__paint=proposalActPaint;globalThis.__author=proposalActAuthor;"
  + "globalThis.__doDisp=doProposalDispose;globalThis.__propState=()=>PROP_ACT;"
  + "globalThis.__openAdopt=openProposalAdopt;globalThis.__adoptVal=proposalAdoptValidate;globalThis.__doAdopt=doProposalAdopt;"
  + "globalThis.__setProps=(a)=>{PROPOSALS_LAST=a;};globalThis.__ADOPT_KINDS=PROP_ADOPT_KINDS;"
  + "globalThis.__loadActSource=loadActSource;globalThis.__dispositions=dispositions;";

async function boot(source, plane){
  const ctx = makeCtx(plane);
  vm.runInContext(source + EXPORTS, ctx);
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
  /* UI-22: the disposition tokens are the plane's answer now, so they are
     LOADED before the surface is driven — a surface driven before the load
     offers nothing at all, which is the behaviour the item wants. */
  await ctx.__loadActSource(true);
  return ctx;
}

const SRC = appScript();

/* A FINDING as op=queue publishes it — the shape REC-20 landed and REC-32 kept:
   one item per (progression, stage), ALREADY aggregated by the plane, carrying
   `basis.n` (the instance count), the weakest grade across those instances, and
   the producer's own summary and detail sentences. The three procurement
   instances that used to arrive here as three instance reads are now the
   producer's `n: 3`; the second, different missing stage is a SECOND item, which
   is what "one check is one question" looks like from this side of the wire. */
const FIND_SOLIC = {
  id:"FINDING::procurement::solicitation", class:"FINDING", kind:"missing_predecessor",
  case:{ state:"determined", ungrouped:false, reasons:[], depth_bound:6, ancestors:[
    { id:"INQ-2026-0400", type:"inquiry", title:"Was the award competitively bid?",
      state:"open", terminal:false, depth:1 }] },
  subject:{ kind:"progression_stage", id:null, progression_key:"procurement",
            stage_key:"solicitation", bundles:["INFO-2026-0400"] },
  summary:"Procurement: the 'RFP / RFQ / IFB' stage is usually required and absent",
  detail:"3 instances of this progression reach 'RFP / RFQ / IFB' without it",
  basis:{ source:"proposalsFeed", progression_key:"procurement", stage_key:"solicitation",
          kinds:["missing_predecessor"], n:3, grade:"C", grade_determined:true,
          overdue_count:0, surfaced_by:"machine",
          detail:"a finding is DERIVED (D-79): the record's own question, aggregated one per "
               + "(progression, stage), graded the weakest instance and never averaged." },
  age:{ state:"undetermined", reason:"derived_on_read",
        detail:"a derived finding is recomputed at read time and has no creation instant" },
  assignee:null, assignee_role:null,
  options:[{ id:"release", label:"Release to verified", weight:"reasoned", needs:"contribute",
             mode:"session", rung:"reasoned" }],
};
const FIND_CONTRACT = { ...FIND_SOLIC,
  id:"FINDING::procurement::contract",
  subject:{ ...FIND_SOLIC.subject, stage_key:"contract" },
  summary:"Procurement: the 'signed agreement' stage is always required and absent",
  detail:"1 instance of this progression reaches 'signed agreement' without it",
  basis:{ ...FIND_SOLIC.basis, stage_key:"contract", n:1, grade:"A" } };
const FIND_UNDET = { ...FIND_SOLIC, id:"FINDING::p::s",
  basis:{ ...FIND_SOLIC.basis, grade:null, grade_determined:false } };

const plane = makePlane({});
const ctx = await boot(SRC, plane);

/* ============================================================
   D-79 — AGGREGATE, DO NOT DROWN. The rule is the PLANE'S now; what this suite
   holds the SURFACE to is that it renders the producer's own count and never
   recomputes one, and that one check is one row rather than N.
   ============================================================ */
const props = [FIND_SOLIC, FIND_CONTRACT].map(ctx.__asProp);
const solic = props[0];
ok("D-79: the act context is keyed by the producer's aggregation key, not by a bundle id",
   solic.key==="procurement::solicitation");
ok("D-79: one check is ONE row — two distinct missing stages are two rows, never four",
   props.length===2 && props[1].key==="procurement::contract");
const card = ctx.__row(FIND_SOLIC);
ok("D-79: the row states the producer's own instance count and says it is grouped as ONE item",
   /<b>3<\/b> instance[s]? of this one check, grouped as ONE item rather than 3/.test(card));
ok("D-79: the count is the RECORD's — the surface makes no count of its own",
   ctx.__asProp(FIND_SOLIC).n===3 && ctx.__asProp(FIND_CONTRACT).n===1);
/* the strength grade is the WEAKEST across instances (a case is only as strong as
   its weakest link) — computed by the plane, carried on the basis, rendered here. */
ok("the finding's grade is the producer's weakest-instance grade, rendered unmodified",
   solic.grade==="C" && solic.grade_determined===true && /Grade C/.test(card));
/* undetermined is honest and is STATED, never filled in with a letter. */
ok("undetermined is HONEST: an undetermined aggregate grade renders as undetermined, never a guess",
   ctx.__asProp(FIND_UNDET).grade===null && ctx.__asProp(FIND_UNDET).grade_determined===false
   && /Strength: <b>undetermined<\/b>/.test(ctx.__row(FIND_UNDET))
   && !/Grade [ABCD]/.test(ctx.__row(FIND_UNDET).split("Strength")[1] || ""));

/* ============================================================
   D-82 — THE PROPOSAL LOOKS DERIVED, and NEVER like an established fact.
   ============================================================ */
ok("D-82: the row is marked SURFACED BY THE RECORD (surfaced_by machine, REC-3's distinction)",
   /Surfaced by the record/i.test(card));
ok("D-82: the row says nobody has yet judged it worth pursuing (the exact thing a member must know)",
   /Nobody has yet decided it is worth pursuing/i.test(card) || /not yet judged/i.test(card));
ok("D-82: the row frames it as a QUESTION the record raised, not an established finding",
   /a question the record raised, not an established finding/i.test(card));
ok("D-82: the grade is shown as HOW it was established, never as credibility or as fact",
   /Grade C/.test(card) && /not how much to trust it/i.test(card) && /not a judgment that the question matters/i.test(card));
ok("D-82: the record's OWN sentence is what the member reads, verbatim, not one composed here",
   card.includes("the 'RFP / RFQ / IFB' stage is usually required and absent")
   && card.includes("3 instances of this progression reach"));

/* ============================================================
   §P — EXACTLY THREE affordances: adopt / defer / dismiss, and only three.
   ============================================================ */
ok("EXACTLY three affordances are offered: adopt, defer, dismiss",
   card.includes('data-prop-adopt') && card.includes('data-prop-defer') && card.includes('data-prop-dismiss'));
const actBtns = (card.match(/data-prop-(adopt|defer|dismiss)=/g)||[]).length;
ok("there are precisely THREE act controls on the card, no fourth", actBtns===3);
/* CORRECTED 2026-08-04 (UI-14). The old sweep ran over the WHOLE card, and it
   was right when the card was the whole surface: there was nothing else on it,
   so any fourth verb anywhere was a fourth affordance on the proposal.
   The queue row is not the whole surface. It carries, beside the three, the
   PRODUCER'S OWN `options[]` — REC-19's derivation of what may be done to the
   object the finding is about, the same answer op=affordances gives, labels and
   rungs verbatim. "Release to verified" appearing there is the record publishing
   an act on a DOCUMENT, not a fourth thing to do to the proposal, and a sweep
   that cannot tell those apart would force this surface to censor the producer —
   which is the DEC-8 failure in reverse. So the sweep is scoped to the ENTRY
   CONTROLS, where §P's rule actually lives, and a second assertion holds the
   options block to being the producer's and nothing else. */
const entry = card.slice(card.indexOf('class="q-entry-acts"'));
for(const forbidden of ["Publish", "Release", "Ratify", "Sign", "Endorse", "Retire", "Delete"])
  ok(`the proposal's own controls offer no ${forbidden} affordance (only the three)`,
     !new RegExp(">[^<]*"+forbidden).test(entry));
/* A finding's subject is a progression STAGE, not a bundle, so there is no
   document for the option to open — and a control that cannot work is rendered
   as a stated fact rather than as a greyed button (Q12: absent, never disabled). */
const optLabels = [...card.matchAll(/class="q-opt(?:-flat)?"[^>]*>([^<]*)</g)].map(m=>m[1]);
ok("every label in the options block is one the PRODUCER published, verbatim — none is composed here",
   optLabels.length===1 && optLabels[0]==="Release to verified");
ok("an option with no document behind it is stated, never rendered as a disabled control",
   !/disabled/.test(card));
ok("and the options block says whose acts they are, so it is not read as a fourth affordance",
   /What the record publishes as doable here/.test(card));

/* ============================================================
   DEFER / DISMISS — a reason is REQUIRED and NEVER prefilled (pre-flight, pure).
   ============================================================ */
/* REWRITTEN 2026-08-05 (UI-22), and it is a CORRECTION of the suite's subject.
   The three assertions that stood here drove `proposalDisposePreflight`, a pure
   function on the surface that decided and WORDED op=proposedispose's refusals.
   They were true, and what they asserted was the defect. The flow now takes the
   NO-REFUSAL SHAPE: the commit control is ABSENT until the act has what it
   takes, and the record words everything that survives to it. */
const els = ctx.__els;
const dlgNow = () => els.get("#dlg")._html;
const propResidue = h => Object.values(PROP_WORDS).reduce((a,w)=>a.split(w).join(" "), String(h));
const PROP_PROSE = /(won't run|will not run|is refused until|you need to|before this can run|nothing stands in the way|what it will refuse|only deferring and dismissing are dispositions here)/i;

ok("the disposition tokens this surface offers are the ones op=affordances published",
   JSON.stringify(ctx.__dispositions()) === JSON.stringify(["deferred","dismissed"]));
{
  const bare = makeCtx(makePlane({}));
  vm.runInContext(SRC + EXPORTS, bare);
  ok("before op=affordances answers, this surface knows NO disposition either — no literal array survives",
     bare.__dispositions().length === 0);
}

/* the dialog: choose + the ABSENT commit, reason never prefilled */
ctx.__setProps(props);
ctx.__openAct(solic.key, "deferred");
const dlg0 = dlgNow();
ok("CHOOSE: the dialog offers both dispositions (defer & dismiss)", /Defer/.test(dlg0) && /Dismiss/.test(dlg0));
ok("the dialog shows the record's question as CONTEXT, not as the member's claim", dlg0.includes(ctx.__ctxLine(solic)));
ok("AUTHOR: the reason field is never prefilled, and carries no drafted placeholder",
   /id="pa-reason"[^>]*>\s*<\/textarea>/.test(dlg0) && !/placeholder=/.test(dlg0));
ok("THE COMMIT CONTROL IS ABSENT while the act lacks a reason — not present and greyed",
   !/id="pa-go"/.test(dlg0));
ok("and nothing on the panel forecasts a refusal in this page's own words", !PROP_PROSE.test(propResidue(dlg0)));
ok("no length rule is copied onto the page", !/maxlength=/.test(dlg0) && !dlg0.includes("160"));
ok("the weight ladder places the act on 'reasoned' (never prefilled)", /reasoned/.test(dlg0) && /never prefilled/.test(dlg0));

/* the empty-reason act cannot be COMMITTED because there is no control to press */
const before = plane.CALLS.length;
const r1 = await ctx.__doDisp();
ok("with no reason the act cannot run at all, and nothing was sent",
   !plane.CALLS.slice(before).some(c=>c.op==="proposedispose"));
ok("and the surface wrote no refusal of its own while doing so", r1 === undefined || !r1.detail);

/* AUTHOR the reason: the control APPEARS. Then commit, then the RECEIPT. */
ctx.__author("These awards are below the competitive-bid threshold, so no solicitation was required");
ok("with a reason authored the commit control EXISTS", /id="pa-go"/.test(dlgNow()));
const r2 = await ctx.__doDisp();
const dispCall = plane.CALLS.find(c=>c.op==="proposedispose");
ok("the act records the disposition through op=proposedispose with the chosen state", !!dispCall && dispCall.body.to==="deferred");
ok("the act sends the AUTHORED reason", dispCall.body.reason.includes("below the competitive-bid threshold"));
ok("the act sends the proposal KEY (a proposal is addressed by its aggregation key, not a bundle id)", dispCall.body.key===solic.key);
ok("the browser never sends an author/actor (the plane stamps it)", !("actor" in dispCall.body) && !("author" in dispCall.body));
const rc = dlgNow();
ok("RECEIPT: the act is confirmed done, under the RECORD's own token", /Deferred\./.test(rc));
ok("RECEIPT: it shows the reason AS RECORDED", rc.includes("below the competitive-bid threshold"));
ok("the successful act returned the plane's receipt", r2 && r2.ok===true);

/* A REFUSAL THE RECORD MAKES: the surface renders its sentence and no other. */
{
  const p = makePlane({}); const c = await boot(SRC, p);
  c.__setProps(props); c.__openAct(solic.key, "deferred");
  c.__author('a reason with a "quote" in it, which the record’s grammar has no escape for');
  await c.__doDisp();
  const h = c.__els.get("#dlg")._html;
  ok("the record's OWN BAD_REASON sentence is what renders", h.includes(PROP_WORDS.BAD_REASON));
  ok("and its code is shown beside it, unmodified", h.includes("BAD_REASON"));
  ok("no sentence of this surface's own accompanies it", !PROP_PROSE.test(propResidue(h)));
}

/* THE BUILD GAP: when op=proposedispose is absent this build says so. The one
   sentence the surface still writes is about WHICH PLANE ANSWERED, not about a
   rule the record applied, and it is asserted as exactly that. */
const planeNo = makePlane({ noDisposeOp:true }); const ctxNo = await boot(SRC, planeNo);
ctxNo.__setProps(props); ctxNo.__openAct(solic.key, "dismissed");
ctxNo.__author("out of scope for this record");
const rNo = await ctxNo.__doDisp();
ok("GAP: with the op absent the act is refused as a gap, having written nothing",
   rNo && rNo.refused===true && rNo.gap===true);
ok("GAP: the surface says which build answered, and says nothing about the record's rules",
   /does not expose the op/i.test(ctxNo.__els.get("#dlg")._html)
   && /not a rule the record applied/i.test(ctxNo.__els.get("#dlg")._html));

/* ============================================================
   ADOPT — author an INQUIRY in the member's OWN words; the plane stamps
   surfaced_by.

   CORRECTED 2026-08-04 (UI-10). Every assertion below used to author `focus`,
   because this surface offered "Focus" and "Problem" as two things a proposal
   could become. They were one type wearing two spellings and the display
   collapsed them anyway (SB-EVIDENCE A-f), so REC-10 collapsed the construct
   and this item removed the choice: a proposal is adopted into an `inquiry`,
   full stop. The legacy spellings are asserted below to STILL clear the kind
   gate, because the record is append-only and a caller may still name one.
   ============================================================ */
const paEmpty = ctx.__pfAdopt({ kind:"inquiry", title:"", statement:"", canContribute:true });
ok("ADOPT pre-flight: an unwritten question is refused — a title and a statement are REQUIRED",
   paEmpty.ok===false && (paEmpty.refusal.reason==="NO_TITLE"));
const paNoStmt = ctx.__pfAdopt({ kind:"inquiry", title:"why no bids?", statement:"", canContribute:true });
ok("ADOPT pre-flight: a title without a statement is refused (the statement is the member's judgment)",
   paNoStmt.ok===false && paNoStmt.refusal.reason==="NO_STATEMENT");
const paNoCap = ctx.__pfAdopt({ kind:"inquiry", title:"t", statement:"s", canContribute:false });
ok("ADOPT pre-flight: a credential without contribute cannot author (NO_CONTRIBUTE)", paNoCap.refusal.reason==="NO_CONTRIBUTE");
const paGood = ctx.__pfAdopt({ kind:"inquiry", title:"t", statement:"s", canContribute:true });
ok("ADOPT pre-flight: an authored title and statement clear the gates", paGood.ok===true);
for(const legacy of ["focus","problem"])
  ok(`ADOPT pre-flight: the legacy spelling '${legacy}' still clears the kind gate (append-only)`,
     ctx.__pfAdopt({ kind:legacy, title:"t", statement:"s", canContribute:true }).ok===true);
ok("ADOPT pre-flight: something that is not a question at all is refused BY NAME",
   ctx.__pfAdopt({ kind:"project", title:"t", statement:"s", canContribute:true }).refusal.reason==="BAD_KIND");
/* The member is never asked to choose between two words for one thing. */
ok("ADOPT offers exactly ONE kind, so there is no wrong choice to make",
   ctx.__ADOPT_KINDS.length===1 && ctx.__ADOPT_KINDS[0][0]==="inquiry");

ctx.__setProps(props);
ctx.__openAdopt(solic.key);
const adlg = els.get("#dlg")._html;
ok("ADOPT dialog shows the record's question as CONTEXT, labelled 'not to copy'",
   /not to copy/i.test(adlg) && adlg.includes(ctx.__ctxLine(solic)));
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
ok("ADOPT writes an INQUIRY bundle (the record's question becomes the member's)", promoteCall.body.meta.object_type==="inquiry");
ok("and it is written at the state the catalog calls first for an inquiry",
   promoteCall.body.meta.current_state===STATES.inquiry.legal[0]);
ok("ADOPT carries the member's AUTHORED title, not the machine's question",
   promoteCall.body.meta.title==="Why did these three hauling contracts skip competitive bidding?");
const md = (promoteCall.body.files||[]).find(f=>f.path==="bundle.md").text;
ok("ADOPT's bundle.md carries the member's statement, in their own words", md.includes("Three contracts to the same kind of vendor"));
ok("ADOPT: the browser NEVER sends surfaced_by — the plane stamps it from the session (REC-3)",
   !md.includes("surfaced_by: agent") && !/"surfaced_by"/.test(JSON.stringify(promoteCall.body.meta)));
ok("ADOPT succeeded and returned the new INQ- id", ra && ra.ok===true && /^INQ-2026/.test(ra.id));
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
const ctxNC = await boot(BROKEN, makePlane({}));
const cardNC = ctxNC.__row(FIND_SOLIC);
ok("NEG-CONTROL: with the marker removed, the card NO LONGER says 'Surfaced by the record'",
   !/Surfaced by the record/i.test(cardNC));
ok("NEG-CONTROL: with the marker removed, the card NO LONGER says nobody has yet judged it — it reads as an established finding",
   !/Nobody has yet decided it is worth pursuing/i.test(cardNC) && !/not yet judged/i.test(cardNC));
/* control-of-the-control: the intact card DID carry both signals (proven above, re-asserted here) */
ok("NEG-CONTROL contrast: the intact card carried the derived signal the broken one lost",
   /Surfaced by the record/i.test(card) && /Nobody has yet decided it is worth pursuing/i.test(card));

/* ============================================================
   NEGATIVE CONTROL, SECOND ARM — THE ARM-(d) INSTRUMENT, added 2026-08-05 by
   UI-22 and RUN. Make `doProposalDispose` keep the record's reason CODE and
   substitute a sentence written on the surface. The code stays right, so a
   suite pinning only codes would be GREEN through this arm — which is exactly
   what DEC-8 exists to catch. RUN 2026-08-05: 3 of 74 failed. Restored.
   ============================================================ */
{
  const BROKEN2 = SRC.replace(
    ": ((inner && typeof inner === \"object\" && (inner.reason||inner.detail||inner.error)) ? inner : { reason:\"NO_ANSWER\", detail:String(e) });",
    ": { reason:(inner && inner.reason) || \"NO_ANSWER\", detail:\"The reason you wrote is not one the record will take. Shorten it and try again.\" };");
  ok("NEG-CONTROL (arm d): the mutation actually changed the source", BROKEN2 !== SRC);
  const c = await boot(BROKEN2, makePlane({}));
  c.__setProps(props); c.__openAct(solic.key, "deferred");
  c.__author('a reason with a "quote" in it');
  await c.__doDisp();
  const h = c.__els.get("#dlg")._html;
  ok("NEG-CONTROL (arm d): the reason CODE is still correct — a code-only suite would be GREEN here",
     h.includes("BAD_REASON"));
  ok("NEG-CONTROL (arm d): but the record's own sentence is GONE", !h.includes(PROP_WORDS.BAD_REASON));
  ok("NEG-CONTROL (arm d): and the residue scan names the SURFACE as the author of what stands there",
     PROP_PROSE.test(propResidue(h)) || /not one the record will take/.test(h));
}

if(fails.length){ console.error(`act-proposal: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`act-proposal: ${n} assertions, all green — D-79 aggregation · D-82 visibly-derived · exactly adopt/defer/dismiss · published tokens · absent commit · plane-worded refusals · op=promote adopt; negative controls RUN (derived marker · arm-(d) right code + invented sentence)`);
