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
 * THE HONESTY, AND IT IS PUBLISHED NOW — CORRECTED 2026-08-04 BY UI-28 (DEC-39),
 * NEVER EXEMPTED. What stood here said the fence in this file's own letters:
 * "co-attestation raises Grade B toward evidentiary weight and never yields
 * Grade A", with the receipt's standing pinned to that letter. Every word of it
 * was a CLAIM ABOUT WHAT THE RECORD ASSERTS being made by the surface and
 * re-made by its suite, and a pin written in the same letters as the subject
 * agrees with it at zero cost forever. Bob ruled (DEC-39) that the PLANE
 * publishes the fence and that it must state THE QUESTION CO-ATTESTATION
 * ANSWERS; REC-43 landed it as `prompt` on `capture_acts`' attest entry,
 * composed from `EARNED_CAPTURE_CEILING` and the rank above it. So this suite
 * asserts against the PUBLICATION and against the ENFORCED RULE — imported, both
 * of them — and spells no grade letter of its own anywhere.
 *
 * THREE THINGS THIS SUITE DOES NOT RE-DERIVE, recorded by UI-28 so no later
 * session argues them out of the file. (i) THE WORDING IS CONDUCT'S DRAFT UNDER
 * BOB'S RULING and not Bob's own sentence — DEC-39 says so in its own words — so
 * the assertion is against the PUBLICATION and never against the DECISIONS.md
 * entry and never against a copy typed here. (ii) The published `prompt` is a
 * PLAIN STRING carrying no markdown; the ruling's bold labels and blockquote
 * breaks are that document's rendering. (iii) Whether the three parts should be
 * carried as STRUCTURE on the published field is an open I3 shape question
 * CONDUCT deliberately did not pre-decide — this is built against the string,
 * and the surface splits it by SHAPE (`What …:`) while holding no label of its
 * own. The split is measured below rather than trusted: the rendered parts must
 * REASSEMBLE into the publication exactly.
 *
 * accepts-when (QUEUE UI-6, widened by UI-28): co-attesting a held capture
 * through op=attest succeeds and yields a receipt showing what the act DID and
 * the PUBLISHED fence for what it is worth; the act shows its weight-ladder
 * position (`attested`) and states what it needs before it runs (bad sha / no
 * such capture / no storage -> the commit control is absent and op=attest is
 * never sent); a NO_ATTESTATION failure shows every recorded attempt and leaves
 * the standing unchanged; and NO surface in this region claims the grade the
 * enforced rule says co-attestation cannot reach.
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
 * WHAT WAS STILL THIS SURFACE'S OWN UNTIL 2026-08-04, AND IS NOT NOW: the GRADE
 * FENCE. REC-38 refused to invent a published `prompt` for it because it is a
 * claim about what the record asserts; that refusal is what routed the question
 * to Bob, DEC-39 answered it, and UI-28 is the surface half. The line that stood
 * here — "every fence assertion below therefore stands unchanged, and must keep
 * standing until that ruling lands" — has been honoured by CORRECTING those
 * assertions at the site rather than deleting them: each one still guards the
 * same property and now reads it out of the publication.
 *
 * NEGATIVE CONTROL, UI-28's, IN TWO ARMS, both RUN MECHANICALLY on every
 * invocation in a second VM context / over a mutated source string, and both
 * RE-RUN ON DISK 2026-08-04 against the FINAL files with every file restored
 * BYTE-IDENTICALLY afterwards (sha256 compared before and after each arm).
 *
 *   ARM (a) — THE COPY, and it is the KEPT-AND-RETARGETED anchor of the old
 *   control. Put a local grade constant back and give `attestFenceHtml` a
 *   HAND-WRITTEN copy of the published fence instead of the publication. THE
 *   RENDERED SURFACE IS THEN INDISTINGUISHABLE — every member-facing assertion
 *   about the rendered fence stays green, because an identical copy agrees at
 *   zero cost (REC-35's finding, restated on this sentence by REC-43's own arm
 *   (a)). What fails is the STRUCTURAL sweep over the source regions, NAMING the
 *   copy. RUN ON DISK 2026-08-04: **3 of 83**, and the sweep printed NINE
 *   complaints — four grade letters spelled in the region, four verbatim runs of
 *   the publication, and the retired constant by name. THE THIRD FAILURE IS THE
 *   ONE NOBODY PREDICTED and it is the better argument: with a copy in hand the
 *   surface RENDERS A FENCE THE RECORD NEVER PUBLISHED — the no-fence-no-act
 *   gate stops holding, because the gate reads the publication and the block
 *   reads the copy. A copy does not merely risk drift; it re-arms the surface to
 *   speak when the record is silent.
 *
 *   ARM (b) — THE RETARGET. The old arm flipped a local constant to "A"; there
 *   is no constant now, so the arm flips what it was really testing: make the
 *   surface CLAIM THE UNREACHABLE GRADE, with the letter taken from the
 *   ENFORCED RULE (`UNREACHABLE_CAPTURE_GRADE`) rather than typed, in the one
 *   sentence the surface still writes for itself (the standing line). The sweep
 *   fires — and it fires on the REMAINDER, after everything the plane published
 *   has been subtracted, because the publication ITSELF names that grade in
 *   order to deny it and a sweep that could not tell those apart would be
 *   unusable. RUN ON DISK 2026-08-04: **5 of 83**, the first naming the claim.
 *
 *   ARM (c) — MOVE THE RULE, which is what the whole design is for and is worth
 *   one line to prove. Change `EARNED_CAPTURE_CEILING` in
 *   `bio-plane/checks/bio-checks.mjs` ALONE (B -> C) and touch nothing else:
 *   **83/83 STILL GREEN**, the member now reading the new ceiling and the new
 *   unreachable grade, with no edit in `app.html` and none in this file. Then
 *   the same moved rule WITH arm (a)'s copy in place: **14 of 83 FAIL** — a
 *   member told the old ceiling while the gate refuses above the new one, which
 *   is the record overclaiming on a doctrine sentence and is exactly REC-43's
 *   arms (b)/(c) reproduced one layer out at the surface.
 *
 * All three arms restored every file BYTE-IDENTICALLY, sha256 compared before
 * and after each: app.html 8f28e66b…, bio-checks.mjs d8da7b9d….
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
   plane module into a UI harness.

   WIDENED 2026-08-04 (UI-28) TO THE FENCE, AND TO THE RULE UNDER IT. Two
   imports, not one, because they measure different things. `ATTEST_FENCE` is
   what the member must receive — the PUBLICATION, never the DECISIONS.md entry
   and never a copy. `EARNED_CAPTURE_CEILING` / `UNREACHABLE_CAPTURE_GRADE` are
   what the plane ENFORCES (`checkEarnedLeg` refuses a leg claiming more than the
   ceiling), and the fence's two grade letters are composed from them, so this
   suite can assert that the wording a member reads is a FUNCTION of the rule
   rather than a sentence that happens to agree with it today. A DIRECT IMPORT is
   available here where UI-30 had to read `store.mjs` textually: neither module
   touches `cloudflare:workers`. */
import { CAPTURE_ACTS, ATTEST_FENCE } from "../../bio-plane/src/affordances.mjs";
import { EARNED_CAPTURE_CEILING, UNREACHABLE_CAPTURE_GRADE } from "../../bio-plane/checks/bio-checks.mjs";

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
       `decorateAct` adds needs/mode/rung/weight/prompt around the array below.

       CORRECTED 2026-08-04 (UI-28), NEVER EXEMPTED: this mock hand-answered
       `prompt:null` for every capture act, which was true of the wire when it
       was written and became FALSE the moment REC-43 landed. A mock that answers
       a shape the plane no longer sends is D-173's class at the CONTENT altitude
       — UI-30 measured the same defect on a retired login code and the suite
       stayed green through it. The prompt is now `decorateAct`'s own expression
       (`a.prompt ?? null`) over the PRODUCER'S array, so the fence this surface
       renders is the one the plane publishes and nobody typed it. */
    if(op==="affordances")
      return R({ ok:true, result:{ target:null, catalog:[], vocabularies:{},
        capture_acts: CAPTURE_ACTS.map(a=>({ ...a, weight:null, needs:"contribute",
                                             mode:"session", rung:a.id==="attest"?"attested":null,
                                             prompt:a.prompt ?? null })) },
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
  + "globalThis.__claim=attestStandingClaim;"
  /* CORRECTED 2026-08-04 (UI-28): `__yields` exported the local grade constant,
     which no longer exists — the fence and its letters come from the plane. What
     is exported instead is the two functions that READ the publication, so the
     suite can measure that the surface renders it whole and adds nothing. */
  + "globalThis.__fence=attestFence;globalThis.__fenceHtml=attestFenceHtml;"
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
   THE HONESTY SOURCE OF TRUTH — THE PUBLICATION, AND THE RULE UNDER IT.

   CORRECTED 2026-08-04 BY UI-28 (DEC-39), NEVER EXEMPTED. What stood here was
   five assertions written in the same letters as the surface they judged: the
   local constant is "B"; the standing claim's grade is "B"; it says "toward
   evidentiary weight"; it denies "Grade A". Every one of them passed because
   two copies of the same sentence agree, and none of them could have noticed
   the sentence being WRONG — which is what DEC-39 found it to be, not in its
   letters but in its silence: it never said what question co-attestation
   answers, so a reader reaches for it to solve a directness problem it has
   nothing to do with. The property they were guarding — this surface never
   overclaims what a co-attestation is worth — is guarded below, against the
   publication and against the enforced rule.
   ============================================================ */

/* THE INSTRUMENTS, AND THEY ARE GUARDED BEFORE THEY ARE USED (UI-30's
   measurement, which this item is a direct consumer of: an extraction that
   silently yields "" makes every `includes()` trivially true — the zero-cost
   equality arriving in the INSTRUMENT rather than the subject).

   `strip` takes rendered HTML down to its text. `without` subtracts the
   PUBLICATION from that text, and the sweep reads the REMAINDER — because the
   published fence NAMES the unreachable grade in order to deny it, so a sweep
   that could not tell the record's denial from the surface's claim would either
   fire on the honest rendering or have to be weakened into uselessness. This is
   UI-30's "subtract what the plane said and read what is left", one item on. */
const FENCE = String(ATTEST_FENCE).replace(/\s+/g," ").trim();
const strip = h => String(h==null?"":h).replace(/<[^>]*>/g," ")
  .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&amp;/g,"&")
  .replace(/\s+/g," ").trim();
const without = h => strip(h).split(FENCE).join(" ").replace(/\s+/g," ").trim();
/* Any GRADE CLAIM at all, in the remainder. Not "the letter A" — the letters are
   the rule's and this file spells none; the sweep looks for the SHAPE of a grade
   claim and reports whatever letter it finds. */
const gradeClaims = h => (without(h).match(/\bGrade\s+[A-Z]\b/g) || []);

ok("INSTRUMENT: the imported publication is a non-empty plain string with no markup",
   typeof ATTEST_FENCE === "string" && FENCE.length > 200 && !/[<>&"]/.test(FENCE));
ok("INSTRUMENT: the enforced ceiling and the grade above it are single distinct letters",
   /^[A-Z]$/.test(String(EARNED_CAPTURE_CEILING)) && /^[A-Z]$/.test(String(UNREACHABLE_CAPTURE_GRADE))
   && EARNED_CAPTURE_CEILING !== UNREACHABLE_CAPTURE_GRADE);
/* THE WORDING IS A FUNCTION OF THE RULE, not a copy that agrees today. If the
   ceiling moves, the published sentence moves with it and this stays true; a
   sentence pinned to a typed letter would not. */
ok("the publication states the ENFORCED ceiling and denies the grade above it, both as the rule spells them",
   FENCE.includes("Grade " + EARNED_CAPTURE_CEILING) && FENCE.includes("Grade " + UNREACHABLE_CAPTURE_GRADE));
ok("and the publication states WHAT QUESTION co-attestation answers — DEC-39's correction, not decoration",
   /what co-attestation answers/i.test(FENCE) && /what it does not answer/i.test(FENCE)
   && /what it is worth/i.test(FENCE));

/* THE SURFACE READS IT AND KEEPS NONE OF ITS OWN. Asserted against the plane's
   export; the mock answers the producer's array, so this is the wire and not a
   fixture agreeing with itself. */
ok("the surface's fence IS the publication, character for character", ctx.__fence() === ATTEST_FENCE);
const fenceHtml = ctx.__fenceHtml();
ok("the rendered fence carries the publication WHOLE", strip(fenceHtml) === FENCE);
ok("and the rendering adds NOT ONE WORD of its own", without(fenceHtml) === "");
/* THE SPLIT IS MEASURED, NOT TRUSTED (UI-28 (ii)/(iii)). The published string is
   plain and the surface styles it by splitting on the SHAPE of the three labels
   the ruling wrote. If that split ever dropped, reordered or re-worded a part,
   the reassembly below stops equalling the publication. Whether the parts should
   instead be published as STRUCTURE is an open I3 question; this measures that
   the string treatment is honest meanwhile. */
const parts = (fenceHtml.match(/<p class="az-part">([\s\S]*?)<\/p>/g) || []);
ok("the fence renders as the three labelled parts the ruling wrote", parts.length === 3);
ok("and the parts REASSEMBLE into the publication exactly — nothing added, nothing lost",
   parts.map(strip).join(" ").replace(/\s+/g," ").trim() === FENCE);
ok("each part is headed by its own published label, emphasis added and words not",
   parts.every(p=>/<p class="az-part"><b>[^<]{1,60}:<\/b>/.test(p)));

/* WHAT THE SURFACE STILL SAYS FOR ITSELF — the OUTCOME of the act, and never
   what it is worth. The marker is machine-readable so the sweep has something
   exact to judge, and it is deliberately not a grade letter. */
const claimUp = ctx.__claim(true);
ok("the success standing states what the act DID, marked `attested`", claimUp.standing === "attested");
ok("and it claims no grade of its own", gradeClaims(claimUp.line).length === 0);
const claimDown = ctx.__claim(false);
ok("with no token obtained the standing is UNCHANGED, and still claims no grade",
   claimDown.standing === "unchanged" && /unchanged|nothing/i.test(claimDown.line)
   && gradeClaims(claimDown.line).length === 0);

/* THE ACT IS NOT OFFERED WITHOUT ITS FENCE. REC-38's rule for the LABEL, applied
   to the wording DEC-39 attached to the act: where the record publishes no
   fence, this surface neither composes one nor offers the act naked. */
{
  const planeNF = makePlane("ok");
  const innerFetch = planeNF.fetch;
  planeNF.fetch = async (u, opts) => {
    const r = await innerFetch(u, opts);
    const url = new URL(u, "https://plane.test");
    if(url.searchParams.get("op") !== "affordances") return r;
    const j = await r.json();
    j.result.capture_acts = j.result.capture_acts.map(a=>({ ...a, prompt:null }));
    return { ok:true, json:async()=>j };
  };
  const ctxNF = await boot(SRC, planeNF);
  ok("with no fence published, the surface holds none", ctxNF.__fence() === "" && ctxNF.__fenceHtml() === "");
  ok("and the act's dialog REFUSES TO OPEN rather than offering it unfenced",
     ctxNF.__open("INFO-2026-0007", "sewer", GOOD_SHA, "") === null);
}

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
/* CORRECTED 2026-08-04 (UI-28), NEVER EXEMPTED. These two asserted the surface's
   OWN block by its own headings ("What co-attestation does", "Cannot:") and its
   own letters ("make this Grade A") — pins in the same words as the subject. The
   property is unchanged: the member meets the fence BEFORE the act runs. What
   changed is where the words come from, so the assertion reads the publication
   and the subtraction proves the dialog carries it rather than something like
   it. */
ok("HONESTY: the dialog carries the PUBLISHED fence, whole, before the act runs", strip(dlg0).includes(FENCE));
ok("HONESTY: and the dialog claims no grade of its own once the publication is subtracted",
   gradeClaims(dlg0).length === 0);
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

/* THE HONESTY, ON THE RECEIPT — the load-bearing assertion, CORRECTED
   2026-08-04 (UI-28) AND NOT WEAKENED. What stood here read the machine-readable
   marker for the earned grade letter and for the absence of the letter above it,
   and pinned the prose "toward evidentiary weight". The marker is no longer a
   grade at all: a grade letter written by this surface, even into a data
   attribute, is the surface stating doctrine under a machine-readable name. So
   the marker says what the act DID, the fence says what it is worth in the
   record's own words, and the third assertion is the RETARGETED control's
   instrument — no claim of the unreachable grade survives subtraction. */
ok("RECEIPT: the stated standing is the act's OUTCOME, not a grade", /data-standing="attested"/.test(rc));
ok("RECEIPT: the receipt carries the PUBLISHED fence for what the act is worth", strip(rc).includes(FENCE));
ok("RECEIPT HONESTY: with the publication subtracted, the receipt claims NO grade — including the unreachable one",
   gradeClaims(rc).length === 0);

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
/* CORRECTED 2026-08-04 (UI-28): the marker is the outcome, not a grade letter
   (see the success receipt above). The property is the same and is stronger for
   being swept: nothing was strengthened, so nothing may claim a grade at all —
   and this receipt does not render the fence either, because "what it is worth"
   is about a strengthening that did not happen. */
ok("FAIL RECEIPT HONESTY: the standing is UNCHANGED and claims no grade whatever",
   /data-standing="unchanged"/.test(rcN) && /unchanged|nothing/i.test(rcN) && gradeClaims(rcN).length === 0);

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
   THE STRUCTURAL SWEEP OVER THE SOURCE — because an identical copy agrees at
   zero cost and passes every rendered-value assertion above (REC-38 measured
   that on this act's LABEL; REC-43 measured it again on this very SENTENCE).
   The rendered assertions prove the member meets the publication; only this
   proves the surface has stopped AUTHORING it.

   TWO REGIONS, because the act lives in two places: the bar `renderDocument`
   draws and the act region itself. THE READ IS GUARDED — a region that could not
   be found, that came back short, or that lost its anchors is a COMPLAINT and
   not a silent pass, which is the trap UI-30 named: an extraction yielding ""
   would make every "does not contain" trivially true.
   ============================================================ */
const RETIRED_CONST = "ATTEST_" + "YIELDS_" + "GRADE";   // assembled: the file enforcing the absence is not an instance of it
/* The runs to look for are taken FROM THE PUBLICATION, split by the same shape
   the surface splits on. Nothing here is typed. */
const PUBLISHED_RUNS = FENCE.split(/(?=\bWhat\b[^:.]{0,60}:)/)
  .map(s=>s.trim()).filter(s=>s.length >= 40).concat([FENCE]);
function fenceSourceSweep(src){
  const c = [];
  const flat = s => s.replace(/\s+/g," ");
  const region = (name, from, to, anchors) => {
    const i = src.indexOf(from); const j = i < 0 ? -1 : src.indexOf(to, i + from.length);
    if(i < 0 || j < 0){ c.push(`INSTRUMENT: the ${name} region could not be read from app.html`); return null; }
    const text = flat(src.slice(i, j));
    if(text.length < 500) c.push(`INSTRUMENT: the ${name} region read only ${text.length} characters`);
    for(const a of anchors) if(!text.includes(a)) c.push(`INSTRUMENT: the ${name} region lost its anchor \`${a}\``);
    return text;
  };
  const regions = [
    ["document page's attest bar", region("document page's attest bar",
      "--- attestation, the fourth ACT", "--- UI-20: THE PLANE-PUBLISHED ACT STRIP",
      ["attestBar =", "openAttestDialog("])],
    ["attest act", region("attest act",
      "function canAttest()", "U8: THE ADD SURFACE",
      ["attestFenceHtml", "attestReceipt", "attestStandingClaim"])],
  ];
  for(const [name, text] of regions){
    if(!text) continue;
    for(const g of (text.match(/\bGrade\s+[A-Z]\b/g) || []))
      c.push(`the ${name} region SPELLS A GRADE LETTER ("${g}") — the letters belong to the enforced rule`);
    for(const run of PUBLISHED_RUNS)
      if(text.includes(run))
        c.push(`the ${name} region holds a VERBATIM COPY of the publication ("${run.slice(0,44)}…")`);
  }
  if(src.includes(RETIRED_CONST)) c.push(`the retired local grade constant \`${RETIRED_CONST}\` is back in app.html`);
  return c;
}
const sweepNow = fenceSourceSweep(SRC);
ok("SOURCE: the attest regions hold no copy of the publication, spell no grade letter, and keep no local grade constant"
   + (sweepNow.length ? " — " + sweepNow.join(" · ") : ""),
   sweepNow.length === 0);

/* ============================================================
   NEGATIVE CONTROLS — RUN, not inferred, both arms mechanical.

   ARM (a) THE COPY. Give `attestFenceHtml` a hand-written copy of the fence and
   put the local grade constant back. The point of the arm is what STAYS GREEN.
   ARM (b) THE RETARGET of the old control: the surface CLAIMS THE UNREACHABLE
   GRADE. The letter comes from `UNREACHABLE_CAPTURE_GRADE`, so if the enforced
   rule moves, this arm keeps testing the right thing instead of a stale letter.
   ============================================================ */
const COPY_SRC = SRC.replace("  const fence = attestFence();",
  "  const fence = " + JSON.stringify(ATTEST_FENCE) + ";   /* NEGATIVE CONTROL (a): a hand-written copy */\n"
  + "  const " + RETIRED_CONST + " = \"" + EARNED_CAPTURE_CEILING + "\";"
  + "   // Grade " + EARNED_CAPTURE_CEILING + " toward evidentiary weight, never Grade " + UNREACHABLE_CAPTURE_GRADE);
ok("NEG-CONTROL (a): the copy mutation actually changed the source", COPY_SRC !== SRC);
const copyComplaints = fenceSourceSweep(COPY_SRC);
ok("NEG-CONTROL (a): the structural sweep FAILS and NAMES the copy, the letter and the constant — "
   + copyComplaints.join(" · "),
   copyComplaints.length >= 3
   && copyComplaints.some(x=>/VERBATIM COPY/.test(x))
   && copyComplaints.some(x=>/SPELLS A GRADE LETTER/.test(x))
   && copyComplaints.some(x=>x.includes(RETIRED_CONST))
   && !copyComplaints.some(x=>/^INSTRUMENT/.test(x)));
/* AND THE FINDING: the copy renders IDENTICALLY. Every rendered-value assertion
   is green against it, which is why the pin above is structural and must never
   be softened into a rendered-value check. (Run ON DISK the arm shows one more
   thing this in-VM version cannot: with the copy in hand the surface renders a
   fence the record never published, because the no-fence gate reads the
   publication while the block reads the copy. See the header.) */
const ctxCopy = await boot(COPY_SRC, makePlane("ok"));
ctxCopy.__open("INFO-2026-0007", "sewer", GOOD_SHA, "");
const dlgCopy = ctxCopy.__els.get("#dlg")._html;
ok("NEG-CONTROL (a) CONTRAST: the copy is INDISTINGUISHABLE on screen — same fence, no grade claim, zero cost",
   strip(dlgCopy).includes(FENCE) && gradeClaims(dlgCopy).length === 0);

const BROKEN = SRC.replace(/line:`An independent timestamp authority[^`]*`/,
  "line:`The capture is now Grade " + UNREACHABLE_CAPTURE_GRADE + ".`   /* NEGATIVE CONTROL (b) */");
ok("NEG-CONTROL (b): the retargeted mutation actually changed the source", BROKEN !== SRC);
const planeNC = makePlane("ok"); const ctxNC = await boot(BROKEN, planeNC);
ctxNC.__open("INFO-2026-0007", "sewer", GOOD_SHA, "");
await ctxNC.__do();
const rcNC = ctxNC.__els.get("#dlg")._html;
ok("NEG-CONTROL (b): the receipt now CLAIMS the grade the enforced rule says co-attestation cannot reach — "
   + gradeClaims(rcNC).join(", "),
   gradeClaims(rcNC).includes("Grade " + UNREACHABLE_CAPTURE_GRADE));
ok("NEG-CONTROL (b): and it claims it BESIDE the honest publication, which the sweep sees through",
   strip(rcNC).includes(FENCE));
/* control-of-the-control: the intact receipt carried the same publication and
   claimed nothing beside it (proven above, restated against the same instrument). */
ok("NEG-CONTROL contrast: the intact receipt claimed no grade at all", gradeClaims(rc).length === 0);

if(fails.length){ console.error(`act-attest: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`act-attest: ${n} assertions, all green — choose · what the act NEEDS (no refusal composed) · absent-not-greyed commit · the PUBLISHED label AND the PUBLISHED FENCE from the plane's own export, whole and reassembled · no act offered without its fence · NO author (op takes none) · receipt · weight-ladder(attested) · HONESTY swept on the REMAINDER after the publication is subtracted (DEC-39 landed); negative controls RUN (the copy, indistinguishable on screen and named by the structural sweep · the retargeted claim of the unreachable grade)`);
