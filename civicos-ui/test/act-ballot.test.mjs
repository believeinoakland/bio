/* UI-3 — THE SECOND ACT: a BALLOT (project owner removal, section 7.10)
 * (BIO_Interaction_Constructs v0.2 — the ACT construct + the WEIGHT LADDER, §B).
 *
 * v0.2's FALSIFIABLE test, ACT TWO: does the ACT construct hold for an act
 * UNLIKE the justified transition? A ballot is a multi-party act with COMPUTED
 * arithmetic, so it exercises the SAME one motion UI-2 established plus the two
 * properties the BALLOT type adds (§B): SHOW THE DENOMINATOR (a checkable
 * tally, read FROM the arithmetic op — never "pending approval", never
 * recomputed) and DISPLAY THE DIVERGENCE AT TWO OWNERS (the boundary a shared
 * implementation gets wrong, shown from the op's own table).
 *
 * Drives the plane ops (I3) op=projectownerarith (the computed tally + the
 * divergence table), op=projectparticipants (the owners to choose from) and
 * op=projectownerremove (the ballot act), and proves:
 *   1 CHOOSE      which owner this removal is about (the two dispositions'
 *                 analogue: a multi-party act still starts by choosing).
 *   2 PRE-FLIGHT  see WHAT IT WILL REFUSE and WHY *before* it runs — a reason
 *                 (NO_REASON), the owner/target identity, and the ARITHMETIC
 *                 gates (LAST_OWNER, TARGET_CANNOT_VOTE) READ off the plane's
 *                 computed `live` row, not re-derived in the browser.
 *   3 AUTHOR      the reason — REQUIRED and NEVER prefilled.
 *   4 RECEIPT     the running tally FROM op=projectownerremove's return
 *                 (VOTES_SHORT have/need/deciders), shown as a fact — the vote
 *                 landed, the ballot is simply not yet decided — or the carried
 *                 outcome. Never "pending approval".
 *   + DENOMINATOR ("N of M owners' votes") and DIVERGENCE (the n=2 row) read
 *     FROM op=projectownerarith, shown, not restated.
 *
 * accepts-when (QUEUE UI-3): the ballot shows the computed tally/denominator
 * FROM the arithmetic op, and the act refuses+explains before it runs (empty
 * reason / last owner / self-vote at 3+ owners → surface refuses,
 * op=projectownerremove never sent).
 *
 * NEGATIVE CONTROL: break the DENOMINATOR wiring — `ballotDenominator` reads
 * `live.votesNeeded` from the op; replace it with a constant (`need: 99`) — and
 * the shown tally NO LONGER reflects the op (the dialog reads "99 of 5" where
 * the op computed 3 of 5). RUN MECHANICALLY below in a second VM context built
 * from the source with that exact wiring broken. RUN 2026-07-31: intact → the
 * dialog shows "3 of 5" (the op's votesNeeded); wiring broken → the same dialog
 * shows "99 of 5", no longer the op's figure. Restored source → green.
 */
import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
/* A DOM stub only creates an element when it is QUERIED, so a section where the
   surface never touched `#bl-err` (because the act returned before it could)
   has no entry for it. Reading through H keeps "it was never written" and "it
   was written empty" the same assertion, which is what these checks mean. */
const H = (c, sel) => ((c.__els.get(sel)) || { _html:"" })._html;
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---- the plane's OWN owner arithmetic, mirrored here ONLY to BUILD the mock
   op response the surface must READ (store.mjs ownerMath). The point of the
   suite is that the surface reads these numbers off the op, not that the test
   is ignorant of them. ---- */
function ownerMath(nn){
  if(nn<=1) return { owners:nn, votesNeeded:0, eligibleVoters:0, targetMayVote:false, possible:false,
                     why:"one owner is the floor, so the last owner is not removable" };
  if(nn===2) return { owners:2, votesNeeded:2, eligibleVoters:2, targetMayVote:true, possible:true,
                      why:"both owners must agree, the departing one included: resignation with the other's assent" };
  const votesNeeded = Math.floor(nn/2)+1, eligibleVoters = nn-1;
  return { owners:nn, votesNeeded, eligibleVoters, targetMayVote:false, possible: votesNeeded<=eligibleVoters,
           why:"a majority of all owners, the target counted in the denominator and not voting" };
}
const arithTable = () => [1,2,3,4,5,6,7,8,9].map(ownerMath);

/* ---- the mock plane: records every op, mirrors the three ballot ops ----
   CORRECTED 2026-08-04 by UI-16, never exempted, and this correction is the
   reason the dialog could not have worked the day it was written (D-173).
   Every Durable-Object answer arrives WRAPPED — `{ok:true, result:<the store's
   own return>}`, with `store`/`tokenClass` added around it by the control plane
   — and a store REFUSAL is a VALUE inside that envelope, carried on HTTP 200,
   never a throw. This mock answered the three project ops BARE and answered a
   refusal as a non-ok HTTP response, so it was shaped exactly like the surface's
   two mistakes: `arith.live` and `pp.participants` read off the envelope, and a
   `catch` arm for VOTES_SHORT that no real plane could ever enter. 47
   assertions passed against it, including the receipt the act exists to show.
   The mock now answers what the plane answers, and the surface reads through
   `actAsk`, which opens the envelope and carries a refusal back as a refusal. */
function makePlane(cfg){
  const CALLS = [];
  const R = o => ({ ok:true, json:async()=>o });
  const W = o => R({ ok:true, result:o, store:"bio", tokenClass:"member" });
  function fetch(u, opts){
    const url = new URL(u, "https://plane.test");
    const op = url.searchParams.get("op");
    const params = Object.fromEntries(url.searchParams.entries());
    let body = null; try{ body = opts && opts.body ? JSON.parse(opts.body) : null; }catch(_){}
    CALLS.push({ op, method:(opts&&opts.method)||"GET", body, params });
    if(op==="projectownerarith")
      return W({ ok:true, projectId:params.projectId, table:arithTable(), live: ownerMath(cfg.owners.length) });
    if(op==="projectparticipants")
      return W({ ok:true, projectId:params.projectId,
                 participants: cfg.owners.map(h=>({ handle:h, owner:1, state:"joined" })) });
    if(op==="projectownerremove")
      return W(cfg.removeResult ? cfg.removeResult(params) : { ok:true });
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
    Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
    document:doc, location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,opts)=>plane.fetch(u,opts) };
  ctx.globalThis = ctx; vm.createContext(ctx); ctx.__els = els;
  return ctx;
}

/* CORRECTED 2026-08-05 (UI-22). `ballotPreflight` and `ballotValidate` no
   longer exist under those names, and the rename is the correction: the
   function computed a REFUSAL — a store reason code with a sentence written on
   this surface attached to it — which UI-16 named the FOURTH pre-DEC-8 residue.
   Its GATES were always right (they read `op=projectownerarith`'s live row) and
   they survive as `ballotNeeds`, which answers only whether the act has what it
   takes. No probe is available here: `projectOwnerRemove()` judges the TARGET
   before the reason and WRITES the vote at the end of the same method, so a
   probe carrying real values would cast the vote. Hence the no-refusal shape. */
const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__pf=ballotNeeds;"
  + "globalThis.__den=ballotDenominator;globalThis.__denHtml=ballotDenominatorHtml;"
  + "globalThis.__divHtml=ballotDivergenceHtml;globalThis.__open=openBallotDialog;"
  + "globalThis.__choose=ballotChoose;globalThis.__validate=ballotPaint;globalThis.__do=doBallot;"
  + "globalThis.__ladder=weightLadderHtml;globalThis.__can=canBallot;";

function boot(source, plane){
  const ctx = makeCtx(plane);
  vm.runInContext(source + EXPORTS, ctx);
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = { member:"m_alice", handle:"alice", session:true, administer:false, capabilities:["contribute"] };
  return ctx;
}

const SRC = appScript();
const FIVE = ["alice","bob","carol","dan","eve"];   // me = alice

/* ============================================================
   WHAT THE ACT TAKES is a pure function whose arithmetic gates READ the op's
   computed `live` row — prove it directly first, at several owner counts. The
   assertions below are the SAME facts the old pre-flight asserted, moved off
   `refusal.reason` (which this surface no longer composes) and onto whether the
   act is READY and which requirement is outstanding.
   ============================================================ */
{
  const ctx = boot(SRC, makePlane({ owners:FIVE }));
  const live5 = ownerMath(5);           // votesNeeded 3, eligible 4, targetMayVote false
  const P = extra => ctx.__pf({ live:live5, owners:FIVE, me:"alice", ...extra });
  const outstanding = r => r.needs.filter(g=>!g.pass).map(g=>g.id);

  ok("needs: an empty reason leaves the act NOT ready, with the reason outstanding",
     P({ target:"bob", reason:"" }).ready===false && outstanding(P({ target:"bob", reason:"" })).includes("reason"));
  ok("needs: a reason authored against another owner makes the act ready",
     P({ target:"bob", reason:"stepped away months ago" }).ready===true);
  ok("needs: a target who is not an owner leaves the target requirement outstanding",
     outstanding(P({ target:"stranger", reason:"x" })).includes("target"));
  ok("needs: at five owners, voting to remove YOURSELF is not a vote you may cast",
     outstanding(P({ target:"alice", reason:"x" })).includes("vote"));
  ok("needs: a member who is not an owner has the owner requirement outstanding",
     outstanding(ctx.__pf({ live:live5, owners:FIVE, me:"nate", target:"bob", reason:"x" })).includes("owner"));

  /* LAST_OWNER comes straight from the op: possible=false at one owner. */
  const live1 = ownerMath(1);
  const last = ctx.__pf({ live:live1, owners:["alice"], me:"alice", target:"alice", reason:"x" });
  ok("needs: the last owner is not removable, read from live.possible", outstanding(last).includes("possible"));
  ok("and the ONLY words beside that row are the arithmetic op's OWN `why`",
     last.needs.find(g=>g.id==="possible").planeWords === ownerMath(1).why);

  /* THE DIVERGENCE, proven here: at TWO owners the op says targetMayVote=true,
     so removing YOURSELF is allowed where at five it is not. */
  const live2 = ownerMath(2);
  ok("needs: at TWO owners, voting to remove yourself is ALLOWED — the divergence",
     ctx.__pf({ live:live2, owners:["alice","bob"], me:"alice", target:"alice", reason:"resigning" }).ready===true);
  ok("this function NEVER re-derives the threshold — it reads live.possible/targetMayVote",
     !/Math\.floor/.test(String(ctx.__pf)) && !/votesNeeded\s*=/.test(String(ctx.__pf)));
  /* THE UI-22 PROPERTY, asserted structurally: it composes no refusal at all. */
  ok("and it composes NO refusal — no reason code, no detail, nothing to word",
     !/refusal/.test(String(ctx.__pf)) && !/detail\s*:/.test(String(ctx.__pf))
     && P({ target:"bob", reason:"" }).refusal === undefined);
  for(const code of ["NOT_THE_OWNER","NOT_AN_OWNER","NO_REASON","LAST_OWNER","TARGET_CANNOT_VOTE"])
    ok(`the ballot surface names no ${code} refusal of its own`, !new RegExp(`reason:\\s*"${code}"`).test(SRC));
}

/* ============================================================
   THE WEIGHT LADDER — the ballot sits on `reasoned`, the SAME rung UI-2's
   act taught, and carries its own note about being OURS not mine.
   ============================================================ */
{
  const ctx = boot(SRC, makePlane({ owners:FIVE }));
  const lad = ctx.__ladder("reasoned", "Removing an owner is <b>reasoned</b>, and it is <b>ours</b> not mine.");
  ok("the ladder shows all four rungs", ["reversible","reasoned","terminal","attested"].every(r=>lad.includes(r)));
  ok("the ladder marks THIS act's rung as reasoned", /wl-rung on[\s\S]*?reasoned/.test(lad) && lad.includes("this act"));
  ok("the ladder note is the ballot's own (ours, not mine), not dispose's", lad.includes("ours") && !lad.includes("Deferring or dismissing"));
}

/* ============================================================
   THE DENOMINATOR — shown, and read FROM the arithmetic op (§B).
   ============================================================ */
{
  const plane = makePlane({ owners:FIVE });
  const ctx = boot(SRC, plane);
  await ctx.__open("PROJ-14", "The sewer contract case");
  const dlg = H(ctx,"#dlg");

  ok("the surface fetched the computed tally (op=projectownerarith)", plane.CALLS.some(c=>c.op==="projectownerarith"));
  ok("the surface fetched the owners to choose from (op=projectparticipants)", plane.CALLS.some(c=>c.op==="projectparticipants"));
  /* the op computed 3 of 5 — the surface shows exactly that, not a recomputation */
  ok("DENOMINATOR: the dialog shows the op's computed tally (3 of 5)", dlg.includes("3 of 5"));
  ok("DENOMINATOR: it names how many may vote (4 of the 5), also from the op", dlg.includes("4 of the 5"));
  ok("DENOMINATOR: it is a CHECKABLE count, never 'pending approval'", !/pending approval/i.test(dlg) || dlg.includes("never"));
  ok("DENOMINATOR: ballotDenominator reads the op field, it does not compute one",
     ctx.__den(ownerMath(5)).need===3 && ctx.__den(ownerMath(5)).of===5);

  /* the DIVERGENCE table, from the op's `table` */
  ok("DIVERGENCE: the two-owner row is present and FLAGGED as the divergence",
     /bl-div[\s\S]*?the divergence/.test(dlg));
  ok("DIVERGENCE: the two-owner row shows the departing owner is one of the votes",
     dlg.includes("incl. the departing owner"));
  ok("DIVERGENCE: the two-owner row carries the plane's OWN words (why), not a UI restatement",
     dlg.includes("resignation with the other"));
  ok("DIVERGENCE: the one-owner row says not removable (from live.possible=false)",
     dlg.includes("not removable"));

  /* CHOOSE + the pre-flight painted in the dialog */
  ok("CHOOSE: the dialog offers the owners as targets (bob, carol, …)", dlg.includes(">bob<") || dlg.includes("bob"));
  ok("CHOOSE: the member's own row is marked (you)", dlg.includes("(you)"));
  const pf = H(ctx,"#bl-pf");
  ok("the panel states WHAT THE ACT TAKES, before the act runs", /What this act takes/i.test(pf));
  ok("and it forecasts no refusal in this page's own words",
     !/what it will refuse/i.test(pf) && !/Required, and never written for you/.test(pf)
     && !/is refused until/i.test(pf) && !/nothing stands in the way/i.test(pf));
  ok("THE COMMIT CONTROL IS ABSENT until the act has what it takes — not present and greyed",
     !/id="bl-go"/.test(H(ctx,"#bl-commit")) && !/disabled/.test(H(ctx,"#bl-commit")));
  ok("AUTHOR: the reason field is never prefilled, and carries no drafted placeholder",
     dlg.includes("></textarea>") && !/id="bl-reason"[^>]*placeholder=/.test(dlg));
}

/* ============================================================
   THE ACT CANNOT RUN WITHOUT WHAT IT TAKES — and it says nothing about the
   record while it cannot. op=projectownerremove is NEVER sent.
   ============================================================ */
{
  const plane = makePlane({ owners:FIVE, removeResult:()=>({ ok:true, owner:false }) });
  const ctx = boot(SRC, plane);
  await ctx.__open("PROJ-14", "The sewer contract case");
  const r = await ctx.__do();                 // reason left empty
  ok("with no reason there is no control, and a direct call casts nothing", r === undefined);
  ok("empty-reason ballot sent NO op=projectownerremove", !plane.CALLS.some(c=>c.op==="projectownerremove"));
  ok("and the surface wrote no refusal of its own while doing so",
     !/no vote has been cast/i.test(H(ctx,"#bl-err"))
     && !/won't run/i.test(H(ctx,"#dlg")));
}

/* the ARITHMETIC requirement is felt before running too: self-vote at 3+ owners
   leaves the act NOT ready, so no control exists and nothing is sent. */
{
  const plane = makePlane({ owners:FIVE, removeResult:()=>({ ok:true }) });
  const ctx = boot(SRC, plane);
  await ctx.__open("PROJ-14", "The sewer contract case");
  ctx.__choose("alice");                       // vote to remove myself, at five owners
  ctx.__els.get("#bl-reason").value = "I want out";
  ctx.__validate();
  ok("self-vote at five owners leaves the act unready, so the control is ABSENT",
     !/id="bl-go"/.test(H(ctx,"#bl-commit")));
  const r = await ctx.__do();
  ok("and op=projectownerremove was never sent for it", !plane.CALLS.some(c=>c.op==="projectownerremove"));
  ok("and nothing was worded about it here",
     !/TARGET_CANNOT_VOTE/.test(H(ctx,"#dlg"))
     && !/does not vote/.test(H(ctx,"#bl-err")));
}

/* ============================================================
   A REFUSAL THE RECORD MAKES — the surface renders its sentence, verbatim,
   and none of its own. This is the arm the no-refusal shape rests on: what the
   probe cannot reach, the record words at commit time.
   ============================================================ */
const PLANE_NOT_THE_OWNER = "only an owner of this project votes on its ownership";
{
  const plane = makePlane({ owners:FIVE,
    removeResult:()=>({ ok:false, reason:"NOT_THE_OWNER", detail:PLANE_NOT_THE_OWNER }) });
  const ctx = boot(SRC, plane);
  await ctx.__open("PROJ-14", "The sewer contract case");
  ctx.__choose("bob");
  ctx.__els.get("#bl-reason").value = "stepped away months ago";
  ctx.__validate();
  const r = await ctx.__do();
  const err = H(ctx,"#bl-err");
  ok("the record's OWN sentence is what renders", err.includes(PLANE_NOT_THE_OWNER));
  ok("and its code is shown beside it, unmodified", err.includes("NOT_THE_OWNER"));
  ok("the refused act reports the record's code back to its caller", r && r.reason==="NOT_THE_OWNER");
  ok("no sentence of this surface's own accompanies it",
     !/won't run/i.test(err) && !/no vote has been cast/i.test(err) && !/Only an owner of a project votes/.test(err));
}

/* ============================================================
   A VALID VOTE that does NOT yet carry — the RECEIPT shows the running tally
   FROM the op's return (VOTES_SHORT), as a fact, never "pending".
   ============================================================ */
{
  const THREE = ["alice","bob","carol"];       // votesNeeded 2
  const plane = makePlane({ owners:THREE,
    removeResult:p => ({ ok:false, reason:"VOTES_SHORT", projectId:p.projectId, handle:p.handle,
      have:1, need:2, deciders:["alice"], owners:3, votesNeeded:2, eligibleVoters:2 }) });
  const ctx = boot(SRC, plane);
  await ctx.__open("PROJ-14", "The sewer contract case");
  ctx.__choose("bob");
  ctx.__els.get("#bl-reason").value = "Bob left the group in March";
  ctx.__validate();
  /* CORRECTED 2026-08-05 (UI-22): the control is ABSENT until the act has what
     it takes and then EXISTS — it is never rendered disabled, so there is no
     `disabled` flag left to assert on. */
  ok("with a reason and a valid target, the commit control EXISTS",
     /id="bl-go"/.test(H(ctx,"#bl-commit")) && !/disabled/.test(H(ctx,"#bl-commit")));
  const r = await ctx.__do();

  const rm = plane.CALLS.find(c=>c.op==="projectownerremove");
  ok("the act cast the vote (op=projectownerremove) against the chosen owner",
     !!rm && rm.params.handle==="bob");
  ok("the act sent the AUTHORED reason", rm && rm.params.reason.includes("Bob left the group"));
  ok("the browser never sends who is voting (`by` is the plane's server-side stamp)",
     rm && !("by" in rm.params) && !("author" in rm.params) && !("actor" in rm.params));

  const rc = H(ctx,"#dlg");
  ok("RECEIPT: the vote is recorded, the ballot not yet decided", /Your vote is in/.test(rc));
  ok("RECEIPT: it shows the running tally FROM the op (1 of 2)", rc.includes("1 of 2"));
  ok("RECEIPT: it says what still must happen (1 more owner must vote)", /1 more owner must vote/.test(rc));
  ok("RECEIPT: it shows the reason as recorded", rc.includes("Bob left the group"));
  ok("RECEIPT: never the phrase 'pending approval'", !/pending approval/i.test(rc));
  ok("the recorded-but-undecided act returned the tally, not a bare refusal",
     r && r.recorded===true && r.have===1 && r.need===2);
}

/* ============================================================
   A VOTE THAT CARRIES — the RECEIPT reads the carried outcome from the return.
   ============================================================ */
{
  const TWO = ["alice","bob"];                 // at two, unanimity; alice removing bob with bob's assent
  const plane = makePlane({ owners:TWO,
    removeResult:p => ({ ok:true, projectId:p.projectId, handle:p.handle, owner:false,
      stillAParticipant:true, owners:["alice"], deciders:["alice","bob"] }) });
  const ctx = boot(SRC, plane);
  await ctx.__open("PROJ-14", "The sewer contract case");
  ctx.__choose("bob");
  ctx.__els.get("#bl-reason").value = "Agreed handover of ownership";
  ctx.__validate();
  const r = await ctx.__do();
  const rc = H(ctx,"#dlg");
  ok("CARRIED: the receipt confirms the removal carried", /Carried\./.test(rc));
  ok("CARRIED: it names who is no longer an owner", rc.includes("bob"));
  ok("CARRIED: it lists the deciders FROM the return", rc.includes("alice") && rc.includes("bob"));
  ok("CARRIED: it shows the owners now, from the return", /Owners now[\s\S]*?alice/.test(rc));
  ok("CARRIED: the act returned the plane's carried receipt", r && r.ok===true && r.owner===false);
}

/* ============================================================
   THE VOCABULARY GUARD — no plane-internal jargon reaches the member through
   the ballot's authored chrome. (A REAL plane refusal is rendered verbatim by
   `actRefusalHtml` — UI-12's one plumbing for every act. CORRECTED 2026-08-04
   by UI-16: this used to name `ballotRefusalHtml`, which was deleted because it
   composed a sentence of its own — "The plane refused, and cast no vote" —
   whenever the plane's answer carried no words, which is what DEC-8 forbids.)
   ============================================================ */
{
  const plane = makePlane({ owners:FIVE, removeResult:()=>({ ok:true }) });
  const ctx = boot(SRC, plane);
  await ctx.__open("PROJ-14", "The sewer contract case");
  const chrome = H(ctx,"#dlg") + H(ctx,"#bl-pf")
    + ctx.__ladder("reasoned","x") + ctx.__denHtml(ownerMath(5), null) + ctx.__divHtml(arithTable());
  for(const word of ["op=", "projectownerremove", "projectownerarith", "votesNeeded", "eligibleVoters",
                     "member_id", "VOTES_SHORT", "current_state", "capture_sha", "bundle.md"])
    ok(`the ballot surface never says "${word}"`, !chrome.includes(word));
}

/* ============================================================
   NEGATIVE CONTROL — RUN, not inferred. Rebuild the surface from the source
   with the DENOMINATOR WIRING broken (ballotDenominator returns a CONSTANT for
   `need` instead of the op's `live.votesNeeded`), and confirm the shown tally
   NO LONGER reflects the op: the dialog reads "99 of 5" where the op computed
   3 of 5. This is the exact break the declaration line names.
   ============================================================ */
{
  const BROKEN = SRC.replace("need: live.votesNeeded, of: live.owners,",
                             "need: 99 /* NEGATIVE CONTROL: denominator wiring broken */, of: live.owners,");
  ok("the negative-control mutation actually changed the source", BROKEN !== SRC);

  const planeNC = makePlane({ owners:FIVE });
  const ctxNC = boot(BROKEN, planeNC);
  await ctxNC.__open("PROJ-14", "The sewer contract case");
  const dlgNC = H(ctxNC,"#dlg");
  /* Scope to the DENOMINATOR panel's own "takes <b>N of M</b>" line — the
     divergence table also renders "3 of 5" (its n=5 row, straight from the op's
     `table`, a DIFFERENT §B wiring), so the break shows precisely in the
     denominator panel and nowhere it should not. */
  ok("NEG-CONTROL: with the wiring broken, the denominator panel shows the CONSTANT (takes 99 of 5)",
     dlgNC.includes("takes <b>99 of 5</b>"));
  ok("NEG-CONTROL: and the denominator panel NO LONGER shows the op's computed figure (takes 3 of 5)",
     !dlgNC.includes("takes <b>3 of 5</b>"));

  /* control-of-the-control: the intact surface DID show the op's figure — the
     denominator panel reads the op, and the divergence table is untouched. */
  const planeOK = makePlane({ owners:FIVE });
  const ctxOK = boot(SRC, planeOK);
  await ctxOK.__open("PROJ-14", "The sewer contract case");
  const dlgOK = ctxOK.__els.get("#dlg")._html;
  ok("NEG-CONTROL contrast: the intact denominator panel shows the op's 3 of 5, never 99",
     dlgOK.includes("takes <b>3 of 5</b>") && !dlgOK.includes("takes <b>99 of 5</b>"));
}

/* ============================================================
   NEGATIVE CONTROL, SECOND ARM — THE ARM-(d) INSTRUMENT, added 2026-08-05 by
   UI-22 and RUN. Restore what this item deleted: a `need:` SENTENCE on the
   requirement rows, composed here, rendered where the record's own account
   belongs. The reason CODES the record uses are untouched by the mutation — a
   suite pinning only codes would be GREEN through it — so the assertion pins
   the SENTENCE and names this surface as its author.
   RUN 2026-08-05: 3 of 79 failed. Restored byte-identical.
   ============================================================ */
{
  const BROKEN = SRC.replace(
    '{ id:"reason", title:"A reason, in your words",          pass:why.length>0 },',
    '{ id:"reason", title:"A reason, in your words", pass:why.length>0, planeWords:"Required, and never written for you. It is refused until you write one." },');
  ok("NEG-CONTROL (arm d): the mutation actually changed the source", BROKEN !== SRC);
  const ctxD = boot(BROKEN, makePlane({ owners:FIVE }));
  await ctxD.__open("PROJ-14", "The sewer contract case");
  const pfD = H(ctxD,"#bl-pf");
  ok("NEG-CONTROL (arm d): a sentence this surface wrote now stands where only the record's account belongs",
     /is refused until you write one/i.test(pfD));
  ok("NEG-CONTROL (arm d): and the panel's own scan catches it",
     /(is refused until|Required, and never written for you)/i.test(pfD));
  /* control-of-the-control */
  const ctxE = boot(SRC, makePlane({ owners:FIVE }));
  await ctxE.__open("PROJ-14", "The sewer contract case");
  ok("NEG-CONTROL (arm d) contrast: the intact panel carries no such sentence",
     !/(is refused until|Required, and never written for you)/i.test(H(ctxE,"#bl-pf")));
  /* And the ONE prose the intact panel does carry is the arithmetic op's own. */
  const ctxF = boot(SRC, makePlane({ owners:["alice"] }));
  await ctxF.__open("PROJ-14", "The sewer contract case");
  ok("the only words the intact panel puts beside an outstanding requirement are the op's own `why`",
     H(ctxF,"#bl-pf").includes(ownerMath(1).why));
}

if(fails.length){ console.error(`act-ballot: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`act-ballot: ${n} assertions, all green — choose · what the act TAKES (no refusal composed) · absent-not-greyed commit · plane-worded refusal · authored reason · receipt · ladder · DENOMINATOR from op · DIVERGENCE at two owners; negative controls RUN (denominator wiring · arm-(d) invented sentence)`);
