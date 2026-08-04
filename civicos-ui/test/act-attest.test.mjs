/* UI-6 — THE FOURTH ACT: ATTESTATION, a member co-attesting a HELD capture
 * (BIO_Interaction_Constructs v0.2 — the ACT construct + the WEIGHT LADDER's
 * TOP rung `attested`, §A ATTESTATION).
 *
 * Drives the ONE MOTION the construct names, through the plane's op=attest
 * (I3), and proves each step plus the weight-ladder position AND the honesty
 * fence:
 *   1 CHOOSE      co-attest — timestamp only, or timestamp + opt-in public
 *                 web archive (off by default: asking publishes the interest).
 *   2 PRE-FLIGHT  see WHAT THIS ACT NEEDS *before* it runs — storage, a capture
 *                 hash, and the capture being in the record — each stated as a
 *                 requirement, with the commit control ABSENT until every one is
 *                 met. CORRECTED 2026-08-05 BY UI-24, never exempted: this step
 *                 used to COMPOSE THE PLANE'S REFUSALS (NO_STORAGE -> BAD_SHA ->
 *                 NO_SUCH_CAPTURE, in the store's own checking order, each with
 *                 a sentence THIS SURFACE wrote). Right codes, invented words —
 *                 the arm-(d) shape DEC-8 forbids, and the last of the five
 *                 pre-DEC-8 residues UI-12 named. `ballotNeeds` took the same
 *                 treatment in UI-22; the reasoning and the "why not a probe"
 *                 measurement are on `attestPreflight` in app.html.
 *   3 AUTHOR      GENUINELY ABSENT — op=attest takes no member text; the
 *                 evidence is the token, not words. (No reason field exists.)
 *   4 RECEIPT     what the plane returned — the stored RFC3161 token and the
 *                 capture's HONEST new standing; on NO_ATTESTATION, every
 *                 recorded attempt and the standing left unchanged.
 *
 * THE HONESTY (load-bearing, index.mjs:2304): co-attestation raises Grade B
 * TOWARD evidentiary weight and NEVER yields Grade A. The receipt's stated
 * resulting standing is Grade B (carried in a machine-checkable data-standing
 * marker); it must never claim the act reached Grade A.
 *
 * accepts-when (QUEUE UI-6): co-attesting a held capture through op=attest
 * succeeds and yields a receipt showing the HONEST resulting standing (Grade B,
 * strengthened toward evidentiary weight, NEVER Grade A); the act shows its
 * weight-ladder position (`attested`) and states what it needs before it runs
 * (bad sha / no such capture / no storage -> the commit control is absent and
 * op=attest is never sent); a NO_ATTESTATION failure shows every recorded
 * attempt and leaves the standing unchanged.
 *
 * WHAT UI-24 ADDED, beside the correction above: this act's LABEL is published
 * now. REC-38 answered UI-22's delegation with a `capture_acts` block on both
 * shapes of `op=affordances`, so the bar's button, this dialog's heading and the
 * commit control all read the producer's own word — asserted against
 * `bio-plane/src/affordances.mjs`'s real export, imported, never against a copy.
 * The harness boots the catalogue the way `boot()` does, because a harness that
 * supplied a label the application could not load would be UI-22's no-caller
 * defect wearing this item's clothes.
 *
 * WHAT IS STILL THIS SURFACE'S OWN, DELIBERATELY: the GRADE FENCE — that
 * co-attestation strengthens a Grade B capture TOWARD evidentiary weight and
 * never reaches Grade A. REC-38 refused to invent a published `prompt` for it
 * because it is a claim about what the record asserts, and it is raised as
 * DEC-39 for Bob to rule. Every fence assertion below therefore stands
 * unchanged, and must keep standing until that ruling lands.
 *
 * NEGATIVE CONTROL: make the surface CLAIM Grade A from co-attestation
 * (`const ATTEST_YIELDS_GRADE = "B"` -> `"A"`) and the receipt's stated standing
 * flips to Grade A — the honesty assertion (`data-standing="B"`, never "A")
 * fails. RUN MECHANICALLY below in a second VM context built from the source
 * with that exact mutation. RUN 2026-07-31: grade "B" -> receipt data-standing
 * "B", "toward evidentiary weight", no Grade-A claim (honest); grade "A" ->
 * receipt data-standing "A" (over-claims Grade A), 2 honesty assertions flip.
 * Restored source -> green. RE-RUN 2026-08-05 under UI-24's changes, same
 * result, same 2 assertions.
 *
 * NEGATIVE CONTROL (UI-24's own), RUN ON DISK 2026-08-05 IN TWO ARMS, app.html
 * and bio-plane/src/affordances.mjs each restored byte-identical (sha256
 * c007d20035cc25febf7e75bb0a9711fa398e3899c855b1fbb2df4e18551dd2a8 and
 * 2bef33646cab45bc429a7a7704fd3e2c0c0ef802e13372ee5db945b6f9b470d7 before and
 * after). RESTORE THE HAND-SPELLED LABEL: in `app.html`'s `attestBar` put
 * `Co-attest this capture&hellip;` back in place of `${esc(cact.label)}`, and in
 * `openAttestDialog` put it back in the `<h2 id="az-h">`.
 *
 *   ARM 1 — the copy alone. **THIS SUITE STAYS ENTIRELY GREEN (69/69).**
 *   `node test/run.mjs` still fails, but only on `document-page.test.mjs`'s
 *   SOURCE-LEVEL pin ("the label this surface used to write is gone from the
 *   source, not merely unreached"). That is REC-38's own finding reproduced
 *   exactly one layer out: AN IDENTICAL COPY AGREES AT ZERO COST AND PASSES
 *   EVERY BEHAVIOURAL ASSERTION. It is why the structural pin exists and why it
 *   must not be softened into a rendered-value check.
 *
 *   ARM 2 — the copy PLUS a drift, which is what a copy is actually dangerous
 *   for: with the literal restored, change the plane's own published label
 *   (`CAPTURE_ACTS`' attest entry -> "Timestamp this capture with an outside
 *   authority"). 1 of 69 FAILS here — "the dialog heads itself with the RECORD'S
 *   OWN name for the act" — because the heading was the one site still holding
 *   the copy while the bar's button and the commit control had already been
 *   repointed at `attestActLabel()`. The count is small and is reported as
 *   measured: a surface that keeps ONE literal is caught by ONE assertion, which
 *   is the argument for having no literal rather than for having more
 *   assertions.
 */
import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";
/* THE PLANE'S OWN PUBLICATION, IMPORTED (UI-24). REC-38 publishes a
   `capture_acts` block on both shapes of `op=affordances`, and this mock answers
   the producer's real array rather than a hand-written copy of it — a copy
   agrees at zero cost and would prove nothing about the label the surface now
   reads (REC-35's finding, restated on a label by REC-38's own control). The
   `act-proposal.test.mjs` / `add-surface.test.mjs` precedent for importing a
   plane module into a UI harness. */
import { CAPTURE_ACTS } from "../../bio-plane/src/affordances.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

const GOOD_SHA = "a".repeat(64);   // a well-formed capture hash (64 hex)

/* ---- the mock plane: records every op, mirrors op=attest (I3) ----
   `mode:"ok"` returns a stored RFC3161 timestamp; `mode:"none"` returns the
   NO_ATTESTATION answer (http 502, ok:false) with the recorded attempts, the
   exact shape index.mjs returns when every authority is unreachable. */
function makePlane(mode){
  const CALLS = [];
  function fetch(u, opts){
    const url = new URL(u, "https://plane.test");
    const op = url.searchParams.get("op");
    const R = o => ({ ok:true, json:async()=>o });
    let body = null; try{ body = opts && opts.body ? JSON.parse(opts.body) : null; }catch(_){}
    CALLS.push({ op, method:(opts&&opts.method)||"GET", body,
      params:Object.fromEntries(url.searchParams.entries()) });
    /* ADDED 2026-08-05 (UI-24). The act's LABEL and RUNG are published now, so
       the surface reads them and this harness must supply what the application
       supplies — the catalogue read `boot()` does, answered in the WIRE shape.
       `decorateAct` adds needs/mode/rung/weight/prompt around the array below;
       what this surface consumes is `label` and `rung`, so those are what the
       mock carries, taken from the producer's own export. */
    if(op==="affordances")
      return R({ ok:true, result:{ target:null, catalog:[], vocabularies:{},
        capture_acts: CAPTURE_ACTS.map(a=>({ ...a, weight:null, needs:"contribute",
                                             mode:"session", rung:a.id==="attest"?"attested":null, prompt:null })) },
        store:"bio", tokenClass:null });
    if(op==="attest"){
      const sha = String(body && body.sha256 || "").toLowerCase();
      // the plane's OWN refusal shape (index.mjs): a bad sha / missing capture
      // would refuse here — but the surface pre-flights those, so a call that
      // reaches this mock has already cleared them. Guard anyway, honestly.
      if(!/^[0-9a-f]{64}$/.test(sha))
        return { ok:false, json:async()=>({ ok:false, reason:"BAD_SHA", detail:"attest takes the sha256 of a capture already in the store" }) };
      if(mode==="none"){
        return { ok:false, json:async()=>({ ok:false, reason:"NO_ATTESTATION",
          attempts:[ { service:"https://freetsa.org/tsr", attempted:"2026-07-31T00:00:00Z", ok:false, note:"http 503" },
                     { service:"https://tsa.example/tsr", attempted:"2026-07-31T00:00:01Z", ok:false, note:"network" } ],
          note:"Every attempt was recorded. A register showing a failed attempt and one showing no attempt are different claims." }) };
      }
      const tokenSha = "b".repeat(64);
      const out = { ok:true,
        attempts:[ { service:"https://freetsa.org/tsr", attempted:"2026-07-31T00:00:00Z", ok:true, kind:"rfc3161", token_sha256:tokenSha, token_bytes:1234 } ],
        attestation:{ file:"snapshots/timestamp-"+tokenSha.slice(0,12)+".tsr", kind:"rfc3161",
                      service:"https://freetsa.org/tsr", sha256:tokenSha, bytes:1234, over:sha },
        note:"A trusted timestamp over the capture hash. Anyone can check it with openssl ts -verify against the authority's certificate; this plane obtains and stores it, and does not claim to have verified the signature." };
      if(body && body.archive===true) out.archive = { service:"web.archive.org", locator:"https://web.archive.org/web/2026/"+(body.locator||"") };
      return R(out);
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
    Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
    setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
    document:doc, location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,opts)=>plane.fetch(u,opts) };
  ctx.globalThis = ctx; vm.createContext(ctx); ctx.__els = els;
  return ctx;
}

const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__pf=attestPreflight;"
  + "globalThis.__open=openAttestDialog;globalThis.__validate=attestValidate;"
  + "globalThis.__choose=attestChoose;globalThis.__do=doAttest;globalThis.__ctx=()=>ATTEST_CTX;"
  + "globalThis.__ladder=weightLadderHtml;globalThis.__can=canAttest;"
  + "globalThis.__claim=attestStandingClaim;globalThis.__yields=ATTEST_YIELDS_GRADE;"
  + "globalThis.__loadActSource=loadActSource;globalThis.__label=attestActLabel;";

/* ASYNC SINCE 2026-08-05 (UI-24), and the await is the correction rather than
   plumbing: the surface reads this act's name from the plane now, so a harness
   that booted it without the catalogue would be a mock supplying what the
   application never did — UI-22's `loadActSource` no-caller defect, which is the
   one this project has already paid for twice. `boot()` awaits it before the
   first screen paints; so does this. */
async function boot(source, plane){
  const ctx = makeCtx(plane);
  vm.runInContext(source + EXPORTS, ctx);
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
  await ctx.__loadActSource(true);
  return ctx;
}

const SRC = appScript();
const plane = makePlane("ok");
const ctx = await boot(SRC, plane);

/* ============================================================
   THE HONESTY SOURCE OF TRUTH — co-attestation yields B, never A.
   ============================================================ */
ok("the surface's yielded grade is B (toward evidentiary weight), never A", ctx.__yields==="B");
const claimUp = ctx.__claim(true);
ok("the standing claim on success is Grade B, not A", claimUp.grade==="B");
ok("the standing claim says 'toward evidentiary weight'", /toward evidentiary weight/i.test(claimUp.line));
ok("the standing claim explicitly denies Grade A", /not.*Grade A/i.test(claimUp.line));
const claimDown = ctx.__claim(false);
ok("with no token obtained, the standing is unchanged Grade B", claimDown.grade==="B" && /unchanged/i.test(claimDown.line));

/* ============================================================
   WHAT THIS ACT TAKES — a pure function, proved directly.

   CORRECTED 2026-08-05 BY UI-24, NEVER EXEMPTED, and the correction is the
   point of the rider rather than a consequence of it. What stood here asserted
   that the pre-flight COMPOSED A REFUSAL — `refusal.reason` NO_STORAGE ->
   BAD_SHA -> NO_SUCH_CAPTURE, in the plane's own checking order, each carrying
   a `detail` sentence this SURFACE had written. Every code was right and every
   sentence was ours, which is exactly the arm-(d) shape UI-12 named: a suite
   pinning the CODE calls it correct forever while the member reads words the
   record never said. The mirrored ORDER was the same defect one layer up — a
   surface restating a checking sequence it does not own and cannot be told has
   changed.

   So the assertions are inverted rather than deleted: the function answers
   whether the act HAS WHAT IT NEEDS and nothing else, each row a requirement
   stated as a requirement, and the sentences and the order are asserted GONE.
   Anything that survives to commit is worded by `op=attest` and rendered
   verbatim, which the refusal path below already proved and still proves.
   `ballotNeeds` took this treatment in UI-22; this is the fifth and last
   pre-DEC-8 residue taking it.
   ============================================================ */
const pfGood = ctx.__pf({ sha:GOOD_SHA });
ok("pre-flight: a held capture on a configured instance meets every requirement", pfGood.ready===true);
const pfBad = ctx.__pf({ sha:"not-a-hash" });
ok("pre-flight: a bad capture hash leaves the hash requirement unmet",
   pfBad.ready===false && pfBad.gates.find(g=>g.id==="sha").pass===false);
const pfMissing = ctx.__pf({ sha:GOOD_SHA, held:false });
ok("pre-flight: a hash the record does not hold leaves the held requirement unmet",
   pfMissing.ready===false && pfMissing.gates.find(g=>g.id==="held").pass===false);
const pfNoStore = ctx.__pf({ sha:GOOD_SHA, hasStorage:false });
ok("pre-flight: an instance with no evidence storage leaves the storage requirement unmet",
   pfNoStore.ready===false && pfNoStore.gates.find(g=>g.id==="storage").pass===false);
ok("pre-flight names three requirements the member can read",
   pfNoStore.gates.length===3 && pfNoStore.gates.some(g=>g.id==="storage"));
/* THE CORRECTION, ASSERTED AS AN ABSENCE — the half that keeps the residue from
   coming back under a different field name. */
ok("pre-flight composes NO refusal — no reason code, no detail, no order of its own",
   !("refusal" in pfNoStore) && !("ok" in pfNoStore));
ok("and no requirement carries a sentence this surface wrote",
   pfNoStore.gates.every(g=>!("need" in g) && typeof g.title === "string"));
ok("nor does it restate the plane's checking sequence anywhere",
   !ctx.__pf({ sha:"nope", hasStorage:false, held:false }).gates.some(g=>/NO_STORAGE|BAD_SHA|NO_SUCH_CAPTURE/.test(JSON.stringify(g))));

/* ============================================================
   THE WEIGHT LADDER — attestation sits on the TOP rung, `attested`.
   ============================================================ */
const lad = ctx.__ladder("attested");
ok("the ladder shows all four rungs", ["reversible","reasoned","terminal","attested"].every(r=>lad.includes(r)));
ok("the ladder marks THIS act's rung as attested", /wl-rung on[\s\S]*?attested/.test(lad) && lad.includes("this act"));
ok("the ladder teaches this act is irreversible and public", /irreversible/.test(lad) && /public/.test(lad));

/* the affordance is capability + session shaped, like release/dispose */
ok("canAttest holds for a session with contribute", ctx.__can()===true);

/* ============================================================
   STEP 1 CHOOSE + STEP 2 PRE-FLIGHT rendered in the dialog.
   ============================================================ */
ctx.__open("INFO-2026-0007", "The sewer contract, as published", GOOD_SHA, "https://city.example/agenda.pdf");
const els = ctx.__els;
const dlg0 = els.get("#dlg")._html;
ok("CHOOSE: the dialog offers timestamp-only and timestamp+archive", /Timestamp only/.test(dlg0) && /public web archive/i.test(dlg0));
ok("CHOOSE: the public-archive option warns it PUBLISHES the interest", /publishes/i.test(dlg0.toLowerCase()) || /PUBLISHES/.test(dlg0));
ok("the dialog names the document by title", dlg0.includes("The sewer contract, as published"));
ok("HONESTY: the dialog shows what co-attestation does AND cannot, before it runs", /What co-attestation does/i.test(dlg0) && /Cannot:/.test(dlg0));
ok("HONESTY: the pre-flight-time block denies Grade A and says 'toward evidentiary weight'", /toward evidentiary weight/i.test(dlg0) && /make this Grade A/i.test(dlg0)===true);
ok("NO AUTHOR STEP: the dialog carries no reason textarea (the act has no member text)", !/<textarea/i.test(dlg0));
ok("the dialog's weight ladder marks the top rung `attested`", /wl-rung on[\s\S]*?attested/.test(dlg0));
ok("the ladder is HONEST that the key is the authority's, not the member's", /authority/i.test(dlg0) && /no signing key of your own/i.test(dlg0));
const pf0 = els.get("#az-pf")._html;
ok("PRE-FLIGHT: the panel is painted before the act runs", /what this act needs/i.test(pf0));
ok("PRE-FLIGHT: on a held capture, the panel clears and says no words to author", /no words to author|evidence is the timestamp/i.test(pf0));

/* THE LABEL COMES FROM THE RECORD (UI-24). REC-38 publishes `capture_acts`, so
   the heading and the commit control are the producer's word for this act —
   asserted against the PLANE'S OWN EXPORT, not against a string written here,
   because a copy agrees at zero cost. */
const PUBLISHED_LABEL = CAPTURE_ACTS.find(a=>a.id==="attest").label;
ok("the surface reads the act's name from the publication and keeps none of its own",
   ctx.__label() === PUBLISHED_LABEL);
ok("the dialog heads itself with the RECORD'S OWN name for the act",
   new RegExp('<h2 id="az-h">'+PUBLISHED_LABEL.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+'</h2>').test(dlg0));
const btns0 = els.get("#az-btns")._html;
ok("the commit control EXISTS once the act has what it needs", /id="az-go"/.test(btns0));
ok("and it carries the published label, never a verb composed here",
   btns0.includes(PUBLISHED_LABEL));

/* ============================================================
   AN UNMET REQUIREMENT: a hash the record does not hold.

   CORRECTED 2026-08-05 BY UI-24, NEVER EXEMPTED. What stood here asserted that
   the surface REFUSED with the plane's reason code and told the member "nothing
   has been recorded" — a sentence this file wrote, over a code the store owns.
   Under UI-22's treatment the surface composes no refusal at all: the commit
   control is ABSENT while a requirement is unmet (Membership Architecture v2
   §5, absent-not-greyed), so there is nothing to click and no words to invent.
   `doAttest` stays as a FAIL-CLOSED GUARD, which is what the second assertion
   below still proves: op=attest is never sent on an uncleared pre-flight.
   ============================================================ */
const c = ctx.__ctx(); c.held = false;   // simulate the capture not being in the store
ctx.__validate();
const btnsNo = els.get("#az-btns")._html;
ok("with a requirement unmet the commit control is ABSENT, not greyed",
   !/id="az-go"/.test(btnsNo) && !/disabled/.test(btnsNo));
ok("and the panel states WHICH requirement is unmet, in a heading and not a judgment",
   /The capture is in the record/.test(els.get("#az-pf")._html));
const before = plane.CALLS.length;
const rRef = await ctx.__do();
ok("the guard holds even when the act is called directly: it names the unmet requirement to its caller",
   rRef && rRef.refused===true && rRef.unmet==="held");
ok("the refused act sent NO op=attest — nothing reaches the plane on an uncleared pre-flight",
   !plane.CALLS.slice(before).some(x=>x.op==="attest"));
ok("and the surface composes no refusal sentence of its own",
   !/won't run|will not run|nothing has been recorded|you need to/i.test(els.get("#az-err")._html));
c.held = true;   // restore for the success path
ctx.__validate();

/* ============================================================
   THE SUCCESS PATH: co-attest a held capture -> op=attest -> RECEIPT.
   ============================================================ */
const r2 = await ctx.__do();
const attCall = plane.CALLS.find(x=>x.op==="attest");
ok("the act sends op=attest as a POST", !!attCall && attCall.method==="POST");
ok("the act sends the capture's sha256, and no member text", !!attCall && attCall.body && attCall.body.sha256===GOOD_SHA && !("reason" in attCall.body) && !("author" in attCall.body));
ok("timestamp-only by default: no archive requested unless chosen", !("archive" in attCall.body));
ok("the successful act returned the plane's attestation object", r2 && r2.ok===true && r2.attestation && r2.attestation.over===GOOD_SHA);
const rc = els.get("#dlg")._html;
ok("RECEIPT: the act is confirmed co-attested", /Co-attested\./.test(rc));
ok("RECEIPT: it shows the stored RFC3161 token (kind + service + bytes)", /rfc3161/i.test(rc) && /freetsa/i.test(rc));
ok("RECEIPT: it shows the token is OVER the capture hash", rc.includes(GOOD_SHA));
ok("RECEIPT: it renders the plane's own note verbatim (does not claim to have verified the signature)", /does not claim to have verified the signature/i.test(rc));
ok("RECEIPT: it states the weight-ladder rung (attested)", /attested/.test(rc));

/* THE HONESTY, ON THE RECEIPT — the load-bearing assertion. The stated
   resulting standing is Grade B (toward evidentiary weight), NEVER Grade A.
   Checked on the machine-readable data-standing marker so the honest prose
   ("not Grade A") does not confuse presence-of-string with the CLAIM. */
ok("RECEIPT HONESTY: the stated standing is Grade B", /data-standing="B"/.test(rc));
ok("RECEIPT HONESTY: the surface NEVER claims the act reached Grade A", !/data-standing="A"/.test(rc));
ok("RECEIPT HONESTY: the standing says strengthened TOWARD evidentiary weight", /toward evidentiary weight/i.test(rc));

/* ============================================================
   THE ARCHIVE CHOICE: opting into a public archive rides on the op body.
   ============================================================ */
const planeA = makePlane("ok"); const ctxA = await boot(SRC, planeA);
ctxA.__open("INFO-2026-0007", "with archive", GOOD_SHA, "https://city.example/agenda.pdf");
ctxA.__choose(true);
ok("choosing the archive sets it on the act context", ctxA.__ctx().archive===true);
await ctxA.__do();
const attA = planeA.CALLS.find(x=>x.op==="attest");
ok("the archive choice sends archive:true and the locator to op=attest", !!attA && attA.body.archive===true && attA.body.locator==="https://city.example/agenda.pdf");
ok("the archive appears on the receipt", /web\.archive\.org/i.test(ctxA.__els.get("#dlg")._html));

/* ============================================================
   THE FAILURE PATH: NO_ATTESTATION — every authority tried, none attested.
   The receipt shows every recorded attempt and leaves the standing UNCHANGED,
   never over-claiming. (A register showing a failed attempt and one showing
   NO attempt are different claims — so the attempts belong on screen.)
   ============================================================ */
const planeN = makePlane("none"); const ctxN = await boot(SRC, planeN);
ctxN.__open("INFO-2026-0007", "sewer", GOOD_SHA, "");
const rN = await ctxN.__do();
ok("a NO_ATTESTATION answer is handled as an honest failure (not swallowed)", rN && rN.refused===true && rN.reason==="NO_ATTESTATION");
const rcN = ctxN.__els.get("#dlg")._html;
ok("FAIL RECEIPT: it states no timestamp was obtained", /No timestamp was obtained/i.test(rcN));
ok("FAIL RECEIPT: it shows every recorded attempt with its reason", /freetsa/i.test(rcN) && /http 503|network/i.test(rcN));
ok("FAIL RECEIPT HONESTY: the standing is UNCHANGED Grade B, never A", /data-standing="B"/.test(rcN) && !/data-standing="A"/.test(rcN) && /unchanged/i.test(rcN));

/* ============================================================
   THE VOCABULARY GUARD: no plane-internal jargon reaches the member through
   the authored chrome (choose / honesty / pre-flight / ladder / receipt /
   surface-side refusal). The plane's own note + a REAL plane refusal are the
   intentional verbatim-passthrough paths and are not scoped here (release and
   dispose render plane voice verbatim the same way).
   ============================================================ */
const chrome = dlg0 + pf0 + lad + els.get("#az-err")._html;
for(const word of ["op=", "op=attest", "NO_SUCH_CAPTURE", "BAD_SHA", "NO_ATTESTATION",
                   "NO_STORAGE", "CAPTURES", "TSA_ENDPOINTS", "storeName", "tokenClass"])
  ok(`the authored act chrome never says "${word}"`, !chrome.includes(word));

/* ============================================================
   NEGATIVE CONTROL — RUN, not inferred. Rebuild the surface from the source
   with the honesty source-of-truth flipped to claim Grade A
   (`const ATTEST_YIELDS_GRADE = "B"` -> `"A"`), run the SAME success act, and
   confirm the receipt now OVER-CLAIMS: its stated standing flips to Grade A,
   so the honesty assertions above no longer hold. This is the exact break the
   declaration line names.
   ============================================================ */
const BROKEN = SRC.replace('const ATTEST_YIELDS_GRADE = "B";',
                           'const ATTEST_YIELDS_GRADE = "A"; /* NEGATIVE CONTROL: over-claims Grade A */');
ok("the negative-control mutation actually changed the source", BROKEN !== SRC);
const planeNC = makePlane("ok"); const ctxNC = await boot(BROKEN, planeNC);
ctxNC.__open("INFO-2026-0007", "sewer", GOOD_SHA, "");
await ctxNC.__do();
const rcNC = ctxNC.__els.get("#dlg")._html;
ok("NEG-CONTROL: with the grade flipped, the receipt CLAIMS Grade A (data-standing=A)", /data-standing="A"/.test(rcNC));
ok("NEG-CONTROL: and it NO LONGER shows the honest B standing — the honesty assertion would fail",
   !/data-standing="B"/.test(rcNC));
/* control-of-the-control: the intact surface never claimed Grade A (proven above) */
ok("NEG-CONTROL contrast: the intact surface claimed Grade B, never A", /data-standing="B"/.test(rc) && !/data-standing="A"/.test(rc));

if(fails.length){ console.error(`act-attest: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`act-attest: ${n} assertions, all green — choose · what the act NEEDS (no refusal composed) · absent-not-greyed commit · the PUBLISHED label from the plane's own export · NO author (op takes none) · receipt · weight-ladder(attested) · HONESTY (B toward evidentiary, never Grade A — DEC-39 pending); negative controls RUN (Grade-A claim · the hand-spelled label restored)`);
