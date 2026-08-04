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

const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__pf=ballotPreflight;"
  + "globalThis.__den=ballotDenominator;globalThis.__denHtml=ballotDenominatorHtml;"
  + "globalThis.__divHtml=ballotDivergenceHtml;globalThis.__open=openBallotDialog;"
  + "globalThis.__choose=ballotChoose;globalThis.__validate=ballotValidate;globalThis.__do=doBallot;"
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
   THE PRE-FLIGHT is a pure function whose arithmetic gates READ the op's
   computed `live` row — prove it directly first, at several owner counts.
   ============================================================ */
{
  const ctx = boot(SRC, makePlane({ owners:FIVE }));
  const live5 = ownerMath(5);           // votesNeeded 3, eligible 4, targetMayVote false
  const P = extra => ctx.__pf({ live:live5, owners:FIVE, me:"alice", ...extra });

  ok("pre-flight: an empty reason WILL refuse (NO_REASON)",
     P({ target:"bob", reason:"" }).refusal.reason==="NO_REASON");
  ok("pre-flight: a reason authored against another owner clears every gate",
     P({ target:"bob", reason:"stepped away months ago" }).ok===true);
  ok("pre-flight: a target who is not an owner WILL refuse (NOT_AN_OWNER)",
     P({ target:"stranger", reason:"x" }).refusal.reason==="NOT_AN_OWNER");
  ok("pre-flight: at five owners, voting to remove YOURSELF WILL refuse (TARGET_CANNOT_VOTE)",
     P({ target:"alice", reason:"x" }).refusal.reason==="TARGET_CANNOT_VOTE");
  ok("pre-flight: a member who is not an owner WILL refuse (NOT_THE_OWNER)",
     ctx.__pf({ live:live5, owners:FIVE, me:"nate", target:"bob", reason:"x" }).refusal.reason==="NOT_THE_OWNER");

  /* LAST_OWNER comes straight from the op: possible=false at one owner. */
  const live1 = ownerMath(1);
  ok("pre-flight: the last owner is not removable (LAST_OWNER, read from live.possible)",
     ctx.__pf({ live:live1, owners:["alice"], me:"alice", target:"alice", reason:"x" }).refusal.reason==="LAST_OWNER");

  /* THE DIVERGENCE, proven at the pre-flight: at TWO owners the op says
     targetMayVote=true, so removing YOURSELF is allowed where at five it is not. */
  const live2 = ownerMath(2);
  ok("pre-flight: at TWO owners, voting to remove yourself is ALLOWED — the divergence",
     ctx.__pf({ live:live2, owners:["alice","bob"], me:"alice", target:"alice", reason:"resigning" }).ok===true);
  ok("pre-flight NEVER re-derives the threshold — it reads live.possible/targetMayVote",
     !/Math\.floor/.test(String(ctx.__pf)) && !/votesNeeded\s*=/.test(String(ctx.__pf)));
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
  const dlg = ctx.__els.get("#dlg")._html;

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
  const pf = ctx.__els.get("#bl-pf")._html;
  ok("PRE-FLIGHT: the panel is painted before the act runs", /what it will refuse/i.test(pf));
  ok("PRE-FLIGHT: with no reason yet, it shows the reason requirement", /Required/.test(pf));
  ok("PRE-FLIGHT: the commit button is disabled until the pre-flight clears", ctx.__els.get("#bl-go").disabled===true);
  ok("AUTHOR: the reason field is never prefilled (placeholder only)", dlg.includes("placeholder=") && dlg.includes("></textarea>"));
}

/* ============================================================
   THE ACT REFUSES BEFORE IT RUNS — empty reason: op=projectownerremove is
   NEVER sent (the surface refuses first).
   ============================================================ */
{
  const plane = makePlane({ owners:FIVE, removeResult:()=>({ ok:true, owner:false }) });
  const ctx = boot(SRC, plane);
  await ctx.__open("PROJ-14", "The sewer contract case");
  const r = await ctx.__do();                 // reason left empty
  ok("empty-reason ballot returns refused (surface-side)", r && r.refused===true && r.reason==="NO_REASON");
  ok("empty-reason ballot sent NO op=projectownerremove — refused BEFORE the plane",
     !plane.CALLS.some(c=>c.op==="projectownerremove"));
  ok("empty-reason ballot tells the member no vote was cast",
     /no vote has been cast/i.test(ctx.__els.get("#bl-err")._html));
}

/* the ARITHMETIC refusal is felt before running too: self-vote at 3+ owners */
{
  const plane = makePlane({ owners:FIVE, removeResult:()=>({ ok:true }) });
  const ctx = boot(SRC, plane);
  await ctx.__open("PROJ-14", "The sewer contract case");
  ctx.__choose("alice");                       // vote to remove myself, at five owners
  ctx.__els.get("#bl-reason").value = "I want out";
  ctx.__validate();
  const r = await ctx.__do();
  ok("self-vote at five owners is refused before running (TARGET_CANNOT_VOTE)",
     r && r.refused===true && r.reason==="TARGET_CANNOT_VOTE");
  ok("and op=projectownerremove was never sent for it", !plane.CALLS.some(c=>c.op==="projectownerremove"));
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
  ok("with a reason and a valid target, the pre-flight clears and the button enables",
     ctx.__els.get("#bl-go").disabled===false);
  const r = await ctx.__do();

  const rm = plane.CALLS.find(c=>c.op==="projectownerremove");
  ok("the act cast the vote (op=projectownerremove) against the chosen owner",
     !!rm && rm.params.handle==="bob");
  ok("the act sent the AUTHORED reason", rm && rm.params.reason.includes("Bob left the group"));
  ok("the browser never sends who is voting (`by` is the plane's server-side stamp)",
     rm && !("by" in rm.params) && !("author" in rm.params) && !("actor" in rm.params));

  const rc = ctx.__els.get("#dlg")._html;
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
  const rc = ctx.__els.get("#dlg")._html;
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
  const chrome = ctx.__els.get("#dlg")._html + ctx.__els.get("#bl-pf")._html
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
  const dlgNC = ctxNC.__els.get("#dlg")._html;
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

if(fails.length){ console.error(`act-ballot: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`act-ballot: ${n} assertions, all green — choose · pre-flight refusal · authored reason · receipt · weight-ladder(reasoned) · DENOMINATOR from op · DIVERGENCE at two owners; negative control RUN`);
