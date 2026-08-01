/* UI-6 — THE FOURTH ACT: ATTESTATION, a member co-attesting a HELD capture
 * (BIO_Interaction_Constructs v0.2 — the ACT construct + the WEIGHT LADDER's
 * TOP rung `attested`, §A ATTESTATION).
 *
 * Drives the ONE MOTION the construct names, through the plane's op=attest
 * (I3), and proves each step plus the weight-ladder position AND the honesty
 * fence:
 *   1 CHOOSE      co-attest — timestamp only, or timestamp + opt-in public
 *                 web archive (off by default: asking publishes the interest).
 *   2 PRE-FLIGHT  see WHAT IT WILL REFUSE and WHY *before* it runs — the op's
 *                 declared refusals in the plane's order (NO_STORAGE -> BAD_SHA
 *                 -> NO_SUCH_CAPTURE), computed from the op's shape + the doc
 *                 page's known capture sha (op=attest has no dry-run).
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
 * weight-ladder position (`attested`) and pre-flights its refusals (bad sha /
 * no such capture / no storage -> the surface refuses, op=attest never sent);
 * a NO_ATTESTATION failure shows every recorded attempt and leaves the standing
 * unchanged.
 *
 * NEGATIVE CONTROL: make the surface CLAIM Grade A from co-attestation
 * (`const ATTEST_YIELDS_GRADE = "B"` -> `"A"`) and the receipt's stated standing
 * flips to Grade A — the honesty assertion (`data-standing="B"`, never "A")
 * fails. RUN MECHANICALLY below in a second VM context built from the source
 * with that exact mutation. RUN 2026-07-31: grade "B" -> receipt data-standing
 * "B", "toward evidentiary weight", no Grade-A claim (honest); grade "A" ->
 * receipt data-standing "A" (over-claims Grade A), 2 honesty assertions flip.
 * Restored source -> green.
 */
import vm from "vm"; import { webcrypto } from "crypto";
import { appScript } from "./extract.mjs";

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
  + "globalThis.__claim=attestStandingClaim;globalThis.__yields=ATTEST_YIELDS_GRADE;";

function boot(source, plane){
  const ctx = makeCtx(plane);
  vm.runInContext(source + EXPORTS, ctx);
  ctx.__PLANE.session = true;
  ctx.__PLANE.me = { member:"m_alice", session:true, administer:false, capabilities:["contribute"] };
  return ctx;
}

const SRC = appScript();
const plane = makePlane("ok");
const ctx = boot(SRC, plane);

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
   THE PRE-FLIGHT is a pure function — prove it directly, in the plane's order.
   ============================================================ */
const pfGood = ctx.__pf({ sha:GOOD_SHA });
ok("pre-flight: a held capture on a configured instance clears every gate", pfGood.ok===true && pfGood.refusal===null);
const pfBad = ctx.__pf({ sha:"not-a-hash" });
ok("pre-flight: a bad capture hash WILL refuse (BAD_SHA)", pfBad.ok===false && pfBad.refusal.reason==="BAD_SHA");
const pfMissing = ctx.__pf({ sha:GOOD_SHA, held:false });
ok("pre-flight: a hash the record does not hold WILL refuse (NO_SUCH_CAPTURE)", pfMissing.ok===false && pfMissing.refusal.reason==="NO_SUCH_CAPTURE");
const pfNoStore = ctx.__pf({ sha:GOOD_SHA, hasStorage:false });
ok("pre-flight: an instance with no evidence storage WILL refuse (NO_STORAGE)", pfNoStore.ok===false && pfNoStore.refusal.reason==="NO_STORAGE");
ok("pre-flight: storage outranks the hash gate, as the plane checks it (order)",
   ctx.__pf({ sha:"nope", hasStorage:false }).refusal.reason==="NO_STORAGE");
ok("pre-flight: BAD_SHA outranks NO_SUCH_CAPTURE (order)",
   ctx.__pf({ sha:"nope", held:false }).refusal.reason==="BAD_SHA");
ok("pre-flight names three gates the member can read", pfNoStore.gates.length===3 && pfNoStore.gates.some(g=>g.id==="storage"));

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
ok("PRE-FLIGHT: the panel is painted before the act runs", /what it will refuse/i.test(pf0));
ok("PRE-FLIGHT: on a held capture, the panel clears and says no words to author", /ready|no words to author|evidence is the timestamp/i.test(pf0));
ok("the commit button is enabled once the pre-flight clears", els.get("#az-go").disabled===false);

/* ============================================================
   A surface-side refusal: a hash the record does not hold. op=attest
   must NEVER be sent — the member meets NO_SUCH_CAPTURE before the plane.
   ============================================================ */
const c = ctx.__ctx(); c.held = false;   // simulate the capture not being in the store
const before = plane.CALLS.length;
const rRef = await ctx.__do();
ok("a not-held capture is refused IN THE SURFACE", rRef && rRef.refused===true && rRef.reason==="NO_SUCH_CAPTURE");
ok("the refused act sent NO op=attest — refused BEFORE the plane", !plane.CALLS.slice(before).some(x=>x.op==="attest"));
ok("the surface refusal tells the member nothing was recorded", /nothing has been recorded/i.test(els.get("#az-err")._html));
c.held = true;   // restore for the success path

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
const planeA = makePlane("ok"); const ctxA = boot(SRC, planeA);
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
const planeN = makePlane("none"); const ctxN = boot(SRC, planeN);
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
const planeNC = makePlane("ok"); const ctxNC = boot(BROKEN, planeNC);
ctxNC.__open("INFO-2026-0007", "sewer", GOOD_SHA, "");
await ctxNC.__do();
const rcNC = ctxNC.__els.get("#dlg")._html;
ok("NEG-CONTROL: with the grade flipped, the receipt CLAIMS Grade A (data-standing=A)", /data-standing="A"/.test(rcNC));
ok("NEG-CONTROL: and it NO LONGER shows the honest B standing — the honesty assertion would fail",
   !/data-standing="B"/.test(rcNC));
/* control-of-the-control: the intact surface never claimed Grade A (proven above) */
ok("NEG-CONTROL contrast: the intact surface claimed Grade B, never A", /data-standing="B"/.test(rc) && !/data-standing="A"/.test(rc));

if(fails.length){ console.error(`act-attest: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`act-attest: ${n} assertions, all green — choose · pre-flight refusals · NO author (op takes none) · receipt · weight-ladder(attested) · HONESTY (B toward evidentiary, never Grade A); negative control RUN`);
