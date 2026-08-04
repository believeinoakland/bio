/* UI-31 — THE VOCABULARY GUARD REACHES THE PRE-AUTHENTICATION SURFACES.
 *
 * WHY THIS EXISTS, and it decides everything about how it is built.
 *
 * UI-4's member-facing vocabulary guard and its siblings — `subject-view`,
 * `capture-honesty`, `document-structure`, `inquiry-page`, `queue`, the act
 * suites — are each scoped to their OWN rendered surface. Every one of those
 * surfaces is behind a credential. So **no guard in this repository covered any
 * surface a member can see BEFORE authenticating**, and that is now where the
 * plane's own vocabulary stands: REC-41 gave `op=login` its first refusal
 * SENTENCE, UI-30 renders it verbatim under DEC-8, and it says "no active
 * credential", "a salted derivation", "its stored hash", "this instance" on the
 * first screen a member ever meets.
 *
 * **THIS FILE DOES NOT SETTLE WHO OWNS THE WORDING.** That is DEC-49, open with
 * Bob. It turns an UNMEASURED tension into a MEASURED one, and nothing else:
 * nothing here translates a plane sentence, blanks one, or introduces a mapping
 * layer, and `app.html` is not touched by this item at all.
 *
 * THREE THINGS IT DOES.
 *
 *   1 REACH. It drives every surface a member can see before authenticating —
 *     the gate as it is served, the token panel, a refused sign-in, a sign-in
 *     against a plane that cannot be reached, an empty token, the public record,
 *     the design preview, and the two published ADDRESSES that resolve at load
 *     for somebody holding nothing.
 *
 *   2 REPORT, NOT FAIL. Every plane-vocabulary term it finds is printed with the
 *     surface it stands on and where the words came from. It does not FAIL on
 *     them. A guard that failed on the shipped sentence would leave a surface
 *     two choices, and DEC-8 forbids both: compose a translation, or blank what
 *     the plane said. Pressuring a surface into inventing wording is the
 *     bug-in-the-gate shape `CLAUDE.md` names, so the arm reports until Bob has
 *     ruled. **HOW IT BECOMES A FAILING ARM: set `REPORT_ONLY` to `false`.** One
 *     line, at the arm itself, and it is correct under EITHER answer to DEC-49 —
 *     (a) the plane learns member-facing wording and the plane-sourced hits go
 *     away at their source; (b) surfaces get a licensed translation layer and
 *     they go away at the surface. Either way "no plane vocabulary reaches a
 *     pre-authentication surface" is the state the ruling produces.
 *
 *   3 THE MEASUREMENT ITSELF, printed as `PRE-AUTH VOCABULARY REPORT:` lines and
 *     carried into `docs/development/MEASUREMENTS.md` with its date and this
 *     file as the instrument, because DEC-49 should be answered against a
 *     measurement rather than an impression.
 *
 * EVERYTHING IS FOUND BY WALKING, BECAUSE A LIST FALLS BEHIND THE THING IT
 * DESCRIBES (D-93). Three walks, and each one's own reach is asserted:
 *
 *   - THE SURFACES. The gate's own markup in `app.html` is the authority on what
 *     a member can touch before signing in: every `id` in it is read out, and
 *     every one the script binds a handler to is a pre-authentication entry
 *     point that some scenario below must drive. Add a control to the gate and
 *     this file fails until it is driven.
 *   - THE ADDRESSES. `publishedRouteFromHash()` is the one router that runs at
 *     load with no credential. Its own body is read for the address shapes it
 *     matches, and each shape must be driven. Add a third address and this file
 *     fails until it is driven.
 *   - THE TERMS. The term list is not written here. It is HARVESTED from every
 *     sibling vocabulary sweep in this directory — each of them is a
 *     `for(const word of [...])` over a surface's rendered HTML — so this guard
 *     inherits every term its siblings already police and cannot fall behind
 *     them. Four PHRASES are added on top and declared as added: they are the
 *     four DEC-49 itself quotes, and a measurement that could not see the very
 *     words the decision is about would be worthless.
 *
 * A WALK THAT COVERS NOTHING PASSES EVERYTHING. This project has hit that class
 * three times in two days — UI-30 found it in an instrument, REC-49 had an arm
 * that first fired ZERO, UI-28 had to guard a source-region read that would have
 * made every `includes()` trivially true. So every walk here asserts its own
 * reach BY NAME and BY COUNT, every scenario asserts a marker proving it
 * rendered its subject rather than an error pane, and the harvested surface set
 * is compared to an expected set with both differences named.
 *
 * HOW A TERM IS ATTRIBUTED, and it is the honest half of the report. For each
 * scenario the mock records every string the PLANE answered. Each occurrence of
 * a term in the rendered HTML is located, and if its character range falls
 * inside a run of text the plane supplied (raw or `esc()`-escaped) it is
 * PLANE-SOURCED; otherwise the surface put it there and it is SURFACE-AUTHORED.
 * That is per-occurrence and not per-term, so the same word can be plane-sourced
 * in one place and surface-authored in another, which is exactly what happens.
 *
 *   UNAVOIDABLE = plane-sourced. DEC-8 forbids the surface translating it or
 *     blanking it, so nothing UI can do today removes it; only DEC-49 can.
 *   INCIDENTAL  = surface-authored. This surface wrote the word and could word
 *     it differently tomorrow without touching a ruling.
 *
 * That partition is mechanical, and it is deliberately NOT a judgement about
 * whether any particular word is bad. It says who would have to act.
 *
 * WHAT THIS DOES NOT MEASURE, stated so nobody trusts it for more. The
 * plane-sourced side is measured against what the MOCK answers. For `op=login`
 * that is the plane's own constant, read textually out of `bio-plane/src/store.mjs`
 * and never typed here, so the refusal is exact. For `op=publishedmanifest` and
 * `op=publishedcase` the fixtures are wire-shaped but are this file's own, so a
 * real instance's `detail` sentences may carry terms these do not: the
 * plane-sourced column for the published surfaces is a LOWER BOUND. The
 * surface-authored column is exact everywhere, because it is read off the
 * shipped `app.html`.
 *
 * Run alone: `node test/preauth-vocabulary.test.mjs`.
 *
 * NEGATIVE CONTROL, FIVE ARMS, RUN 2026-08-04 against this file as it stands and
 * the counts are that run's. Arms (a)-(d) are reached through this file's own
 * switches, the way `auth-surface.test.mjs`'s arm (c) is, so each is re-runnable
 * in ONE STEP and NOTHING is written to disk — there is no restore to get wrong.
 * Arm (e) is on disk and `app.html` was restored byte-identically after it,
 * sha256 compared before and after.
 *
 *   (a) HIDE A MEMBER-FACING SURFACE FROM THE WALK — the item's own control, run
 *       three times because the three hidings fail through three different
 *       assertions and each names something the others cannot.
 *       `UI31_HIDE=public-record node test/preauth-vocabulary.test.mjs`
 *       -> **2 of 29 FAIL**: the scenario set ("MISSING: public-record") and the
 *       gate control that lost its only driver ("UNCOVERED: g-pub").
 *       `UI31_HIDE=design-preview` -> **3 of 30 FAIL**: those two
 *       (`design-preview`, `g-preview`) plus the surface set, which prints
 *       "STOPPED COVERING: [#content, #m-grp, #m-handle, #m-idstr, #rail]" —
 *       five member-facing surfaces that leave the walk with that one scenario.
 *       `UI31_HIDE=case-address-at-load` -> **3 of 30 FAIL**: the scenario, the
 *       published ADDRESS SHAPE nothing opens any more (the failure prints the
 *       router's own regex, `/^#case\/([A-Za-z0-9._-]+)(?:\/e(\d+))?$/`), and
 *       the harvest collapsing from 33,412 characters to 8,727. **THIS IS THE
 *       ARM THAT PROVES THE ADDRESS WALK IS LOAD-BEARING**: that scenario
 *       renders into `#pub-body`, which another scenario also renders, so a
 *       surface-set check alone would have stayed perfectly green while the
 *       largest pre-authentication surface in the product stopped being read.
 *
 *   (b) NEUTER THE TERM HARVEST — `UI31_EMPTY_TERMS=1`. The walk over the
 *       sibling suites returns nothing, which is "covers nothing, passes
 *       everything" arriving in the instrument rather than the subject.
 *       RUN: **4 of 31 FAIL** — the empty harvest ("read 0 suites []"), the
 *       inherited terms, DEC-49's own four phrases, and the attribution's
 *       non-degeneracy, which collapses with them.
 *
 *   (c) BREAK THE ATTRIBUTION — `UI31_NO_PLANE_RANGES=1` makes every occurrence
 *       read as surface-authored, which is what a silently-failing subtraction
 *       looks like (UI-28's instrument lesson: the publication must be
 *       subtracted before the remainder means anything, and UI-30's, that an
 *       extraction yielding "" makes every `includes()` trivially true).
 *       RUN: **1 of 31 FAILS**, printing "0 plane-sourced rows and 16
 *       surface-authored" — the report would have blamed this surface for the
 *       plane's own sentence, which is the one error that would have misdirected
 *       DEC-49 outright.
 *
 *   (d) THE REPORTING ARM AS A FAILING ARM — `UI31_ENFORCE=1`, which is exactly
 *       the one-line flip DEC-49's answer will make permanent. RUN: **1 of 31
 *       FAILS**, naming all thirteen terms with their sources. That is what this
 *       file will say the day the ruling lands, measured now rather than
 *       promised.
 *
 *   (e) ON DISK — put a plane term where no plane put it. The gate's own token
 *       hint in `app.html` gains the words "including every capture_sha". RUN:
 *       the report grows from 13 terms to 14 and the new row is
 *       `"capture_sha" x1 (1 visible) INCIDENTAL [inherited] | surface:
 *       gate-as-served app.html:#gate (served markup)` — the right term, the
 *       right surface, and attributed to the surface that wrote it rather than
 *       to the plane. Under `UI31_ENFORCE=1` the failing arm names all fourteen.
 *       Run a second time with `op=login` in the same hint instead: the term
 *       list stays 13 because the case page already carries `op=`, and what
 *       moves is that row's SOURCE list, which gains the gate — so the report
 *       distinguishes a new word from a known word at a new site.
 *       This arm answers what the four switch arms cannot: **does the report SEE
 *       something it was not built against**, or is it only reproducing its own
 *       fixtures. `app.html` restored byte-identically after both runs, sha256
 *       478ba5ca0fe141d34832d7b14ed33d43c907334bc1d51ac55abea9603d3478b3 before
 *       and after, `git status` clean on that file.
 */
import vm from "vm"; import fs from "fs"; import path from "path";
import { webcrypto } from "crypto";
import { fileURLToPath } from "url";
import { appScript } from "./extract.mjs";

const SELF = fileURLToPath(import.meta.url);
const HERE = path.dirname(SELF);
const UIROOT = path.dirname(HERE);

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* The switches the negative-control arms are reached through. Nothing on disk is
   mutated by any of them. */
const HIDE            = process.env.UI31_HIDE || "";
const EMPTY_TERMS     = !!process.env.UI31_EMPTY_TERMS;
const NO_PLANE_RANGES = !!process.env.UI31_NO_PLANE_RANGES;

const APP_SRC  = fs.readFileSync(path.join(UIROOT, "app.html"), "utf8");
const SCRIPT   = appScript();
/* `app.html`'s own escaper, mirrored so a plane string can be located in the
   rendered HTML in the form the surface actually wrote it. */
const esc = s => (s==null?"":String(s)).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

/* ============================================================
   WALK 1 — THE GATE'S OWN MARKUP NAMES WHAT A MEMBER CAN TOUCH
   ============================================================
   The gate is served as static HTML, so the markup is the authority on what
   exists before a single line of script has decided anything. Every `id` in it
   is read out; every one the script binds a handler to is an entry point some
   scenario below must drive. A hand-kept list of gate controls would be a list
   that falls behind `app.html` the first time somebody adds a button. */
function gateMarkup(){
  const start = APP_SRC.indexOf('<div id="gate">');
  if(start < 0) return "";
  /* balance <div …> against </div> from the opening tag */
  let i = start, depth = 0;
  const tag = /<\/?div\b[^>]*>/g;
  tag.lastIndex = start;
  let m;
  while((m = tag.exec(APP_SRC))){
    depth += m[0][1] === "/" ? -1 : 1;
    i = m.index + m[0].length;
    if(depth === 0) break;
  }
  return depth === 0 ? APP_SRC.slice(start, i) : "";
}
const GATE = gateMarkup();
const GATE_IDS = [...new Set([...GATE.matchAll(/\bid="([A-Za-z0-9_-]+)"/g)].map(x => x[1]))].sort();
/* A control is BOUND when the script attaches a handler to it by id. Both event
   properties the gate uses are looked for; a third would show up as a control
   with no binding and be reported as unreachable rather than silently dropped. */
const BOUND = GATE_IDS.filter(id =>
  new RegExp('\\$\\("#' + id.replace(/[-]/g, "\\-") + '"\\)\\.on(click|input)\\s*=').test(SCRIPT));

ok("WALK 1 REACH: the gate's markup was extracted from app.html and is the real thing",
   GATE.length > 800 && GATE.includes('id="g-signin"') && GATE.includes("</div>"));
ok("WALK 1 REACH: the gate declares the controls this walk expects — "
   + "found [" + GATE_IDS.join(", ") + "]",
   GATE_IDS.length === 12
   && ["gate","g-base","g-err","g-handle","g-preview","g-pub","g-pw","g-signin","g-token","g-token-go",
       "g-token-toggle","g-token-wrap"].every(id => GATE_IDS.includes(id)));
ok("WALK 1 REACH: six of them are BOUND to a handler and are therefore entry points — "
   + "found [" + BOUND.join(", ") + "]",
   BOUND.length === 6
   && ["g-base","g-preview","g-pub","g-signin","g-token-go","g-token-toggle"].every(id => BOUND.includes(id)));

/* ============================================================
   WALK 2 — THE ADDRESSES THAT RESOLVE FOR SOMEBODY HOLDING NOTHING
   ============================================================
   `boot()` cannot run without a credential, so the routers it asks are not
   pre-authentication surfaces. `publishedRouteFromHash()` is: `app.html` calls
   it at the top level, before the gate is ever shown, precisely so a published
   address resolves for a stranger. Its OWN body is read for the address shapes
   it matches, and each shape must be driven below. */
function fnBody(name){
  const h = SCRIPT.indexOf("function " + name + "(");
  if(h < 0) return "";
  const end = SCRIPT.indexOf("\n}", h);
  return end < 0 ? "" : SCRIPT.slice(h, end + 2);
}
const PUBROUTE = fnBody("publishedRouteFromHash");
const ADDRESS_SHAPES = [...PUBROUTE.matchAll(/\/\^#([^/\\]|\\.)*\//g)].map(x => x[0]);
const ROUTE_FNS = [...new Set([...SCRIPT.matchAll(/\b([A-Za-z]*[Rr]outeFromHash)\(/g)].map(x => x[1]))].sort();

ok("WALK 2 REACH: publishedRouteFromHash's body was read and is the real function",
   PUBROUTE.length > 200 && PUBROUTE.includes("enterPublished"));
ok("WALK 2 REACH: it matches exactly two published ADDRESS SHAPES — found ["
   + ADDRESS_SHAPES.join(" , ") + "]", ADDRESS_SHAPES.length === 2);
/* A NEW ROUTER IS A NEW ADDRESS, and an address that resolves before sign-in is
   a pre-authentication surface. This does not judge the new one; it stops it
   from arriving unclassified. */
ok("WALK 2 REACH: the script declares exactly the four routers this walk has classified — found ["
   + ROUTE_FNS.join(", ") + "] (a fifth must be classified as pre-auth or not before this passes)",
   ROUTE_FNS.length === 4
   && ["actionRouteFromHash","projectRouteFromHash","publishedRouteFromHash","routeFromHash"]
        .every(f => ROUTE_FNS.includes(f)));
ok("WALK 2 REACH: and app.html asks the published router at the TOP LEVEL, outside boot()",
   /\n\s*if\(\/\^#\(published[\s\S]{0,80}publishedRouteFromHash\(\);?\n?\}catch/.test(SCRIPT)
   || SCRIPT.slice(SCRIPT.indexOf("/*__PUBLISHED_CASE_END__*/")).includes("publishedRouteFromHash()"));

/* ============================================================
   THE PLANE, MIRRORED AT THE WIRE
   ============================================================ */

/* THE REFUSAL SENTENCE IS READ OUT OF THE PLANE, NEVER TYPED HERE — UI-30's
   technique, for UI-30's reason: a hand-typed copy agrees with its source at
   zero cost and leaves every assertion green while the two drift, and this file
   exists to measure that sentence's exact words. `store.mjs` cannot be imported
   (it opens with `import … from "cloudflare:workers"`), so it is read textually,
   the way `check-semantics.mjs` already reads it. The read is GUARDED: an
   extraction that silently yielded "" would make the whole measurement report
   nothing and pass. */
const STORE_SRC = fs.readFileSync(path.join(UIROOT, "..", "bio-plane", "src", "store.mjs"), "utf8");
function planeLoginRefusal(){
  const block = /static LOGIN_REFUSAL_DETAIL = \{\n([\s\S]*?)\n {2}\};/.exec(STORE_SRC);
  if(!block) return null;
  const out = {};
  for(const part of block[1].split(/^ {4}(?=[A-Z_]+:)/m)){
    const k = /^([A-Z_]+):/.exec(part);
    if(!k) continue;
    const lits = [...part.slice(k[0].length).matchAll(/"((?:[^"\\]|\\.)*)"/g)]
      .map(x => JSON.parse('"' + x[1] + '"'));
    if(lits.length) out[k[1]] = lits.join("");
  }
  return out;
}
const REFUSAL = planeLoginRefusal();
const REFUSAL_CODE = REFUSAL ? Object.keys(REFUSAL)[0] : "";
const REFUSAL_SENTENCE = REFUSAL ? REFUSAL[REFUSAL_CODE] : "";
ok("the plane's login-refusal sentence is readable from here, whole, and is prose",
   !!REFUSAL_CODE && REFUSAL_SENTENCE.length > 200 && /^[a-z].*\.$/s.test(REFUSAL_SENTENCE));

/* The two public ops. Wire-shaped: `op=publishedmanifest` is WRAPPED (index.mjs
   re-wraps it explicitly), `op=publishedcase` is FLAT (its own handler), which
   is what `check-mock-envelope.mjs`'s wire map says and what its arm B judges
   these answers against. */
const CASE_ID = "CASE-2026-0001", FIND_ID = "FIND-2026-0001";
const SHA = "a".repeat(64), MAN = "b".repeat(64), CAP = "c".repeat(64);
const MANIFEST_ANSWER = {
  ok:true, scope:"published",
  published:[{ bundle_id:FIND_ID, edition:1, title:"Was the sewer transfer authorised?", bundle_sha:SHA,
    ratified_at:"2026-07-01T09:00:00Z", attestor_key:"SHA256:zzz", gate_version:"1.20.0",
    strength:{ capture:"B", connection:"C" }, required:{ capture:"B", connection:"C" } }],
  cases:[{ case_id:CASE_ID, edition:1, scope:"Whether the sewer transfer was authorised.",
    ratified_at:"2026-07-01T10:00:00Z", manifest_sha:MAN,
    manifest:JSON.stringify({ format:"bio-case-container/2", case:CASE_ID, edition:1,
      findings:[{ bundle_id:FIND_ID, strength:{ capture:"B", connection:"C" },
                  required_strength:{ capture:"B", connection:"C" } }] }) }],
  caseMembers:[{ case_id:CASE_ID, edition:1, ord:0, bundle_id:FIND_ID }],
  shas:[],
  detail:"every hash here is verifiable by anyone with ssh-keygen and the doorbell, without this "
       + "instance's cooperation or continued existence.",
};
const CASE_ANSWER = {
  ok:true, caseId:CASE_ID, edition:1,
  scope:"Whether the sewer transfer was authorised.",
  completeness:"Every finding this case declared has been ratified.",
  ratified_at:"2026-07-01T10:00:00Z", opened:"2026-06-01T00:00:00Z", complete:true, awaiting:[],
  findings:[{ ord:0, bundle_id:FIND_ID, title:"Was the sewer transfer authorised?", bundle_sha:SHA,
    ratified_at:"2026-07-01T09:00:00Z", gate_version:"1.20.0",
    sig_armored:"-----BEGIN SSH SIGNATURE-----\nAAAA\n-----END SSH SIGNATURE-----",
    attestor:{ member:"vera", key_b64:"AAAAC3Nza" },
    strength:{ capture:"B", connection:"C" }, required:{ capture:"B", connection:"C" },
    parts:[{ path:"bundle.md", sha256:SHA, kind:"bundle", bytes:512 },
           { path:"snapshots/memo.bin", sha256:CAP, kind:"capture", bytes:2048 }],
    serves:[], names:[], unresolved:[],
    division:{ parent:null, siblings:[],
      detail:"a division's parent and siblings are NAMED and never served." },
    object_type:"finding",
    body:{ state:"published", from_sha:SHA, question:"Was the sewer transfer authorised?",
      conclusion:"The transfer was made without the authorisation the ordinance requires.",
      falsifies:"A council authorisation dated before the transfer.", excludes:"",
      authored:{ conclusion:null, falsifier:null }, detail:"" },
    basis:[{ bundle_id:"INFO-2026-0100", title:"The transfer memo", role:"supports",
      grade:{ capture:"B", connection:"C" }, sha256:CAP, load_bearing:true }],
    bytes:"op=publishedbytes&sha256=" + SHA }],
  manifest_sha:MAN,
  manifest:{ format:"bio-case-container/2", case:CASE_ID, edition:1,
    findings:[{ bundle_id:FIND_ID, strength:{ capture:"B", connection:"C" },
                required_strength:{ capture:"B", connection:"C" } }] },
  files:[{ path:CASE_ID + "/" + FIND_ID + "/bundle.md", sha256:SHA, bytes:512 }],
  editions:[1], edition_index:[{ edition:1, ratified_at:"2026-07-01T10:00:00Z", manifest_sha:MAN }],
  latest_edition:1,
  detail:"this is one published edition of a case.",
  verification:{ container:"op=publishedbytes&sha256=" + MAN, manifest:"op=publishedbytes&sha256=" + MAN,
    findings:[{ bundle_id:FIND_ID, bytes:"op=publishedbytes&sha256=" + SHA }],
    detail:"every hash here is checkable by anyone with ssh-keygen, without this instance." },
};

/* Every string the plane hands over in a scenario, recursively, so the report
   can say who wrote each word rather than guessing. */
function stringsOf(v, out){
  out = out || [];
  if(typeof v === "string"){ if(v.length >= 4) out.push(v); }
  else if(Array.isArray(v)) for(const x of v) stringsOf(x, out);
  else if(v && typeof v === "object") for(const k of Object.keys(v)) stringsOf(v[k], out);
  return out;
}

/* ---- the mock, wrapping every answer the way the plane does ---- */
function makePlane(mode){
  const CALLS = [];
  const SAID = [];                       // every string the plane answered here
  const opts = mode || {};
  async function fetch(u, init){
    const url = new URL(String(u), "https://plane.test");
    const op = url.searchParams.get("op");
    let body = null; try{ body = init && init.body ? JSON.parse(init.body) : null; }catch(_){}
    CALLS.push({ op, method:(init && init.method) || "GET", token:url.searchParams.get("token"), body });
    if(opts.unreachable) throw new TypeError("Failed to fetch");
    const R = o => ({ ok:true, json:async()=>o });
    const W = r => R({ ok:true, result:r, store:"bio", tokenClass:null });
    const say = r => { stringsOf(r, SAID); return r; };
    /* store.mjs login(): a refusal is a VALUE inside a successful envelope, and
       it carries the plane's own sentence beside its one code (REC-41). */
    if(op === "login")
      return W(say({ ok:false, reason:REFUSAL_CODE, detail:REFUSAL_SENTENCE }));
    if(op === "publishedmanifest") return W(say(MANIFEST_ANSWER));
    if(op === "publishedcase")     return R(say(CASE_ANSWER));
    return { ok:false, json:async()=>({ ok:false, error:"unknown op " + op }) };
  }
  return { CALLS, SAID, fetch };
}

/* ---- a DOM stub with REAL class lists, and an element map that IS the walk:
   whatever the surface wrote to, this file harvests, so a surface nobody thought
   of is still measured. ---- */
function makeCtx(plane, hash){
  const els = new Map();
  function el(){
    const classes = new Set();
    const e = {
      classList:{ add:(...c)=>c.forEach(x=>classes.add(x)),
                  remove:(...c)=>c.forEach(x=>classes.delete(x)),
                  toggle:(c,on)=>{ if(on===undefined){ classes.has(c)?classes.delete(c):classes.add(c); }
                                   else if(on) classes.add(c); else classes.delete(c); },
                  contains:c=>classes.has(c) },
      classes, style:{}, dataset:{}, value:"", _html:"", textContent:"", scrollTop:0,
      disabled:false, offsetHeight:120, addEventListener(){}, removeEventListener(){},
      querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(p,h){ e._html += h; },
      focus(){}, click(){}, remove(){}, setAttribute(){}, getAttribute:()=>null, onclick:null, oninput:null,
    };
    Object.defineProperty(e,"innerHTML",{ get(){ return e._html; }, set(v){ e._html = v; } });
    return e;
  }
  const doc = {
    querySelector:s=>{ if(!els.has(s)) els.set(s, el()); return els.get(s); },
    querySelectorAll:()=>[], addEventListener(){},
    documentElement:{ _attrs:{}, setAttribute(k,v){ this._attrs[k]=v; }, getAttribute(k){ return this._attrs[k]; } },
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{ appendChild(){} },
  };
  const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
    Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
    IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;},
    clearTimeout(){}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({ matches:false }),
    document:doc, location:{ protocol:"https:", hash: hash || "" },
    history:{ pushState(){}, back(){}, replaceState(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:async(u,init)=>plane.fetch(u,init) };
  ctx.globalThis = ctx; vm.createContext(ctx); ctx.__els = els; ctx.__doc = doc;
  return ctx;
}

const EXPORTS = ";globalThis.__PLANE=PLANE;globalThis.__signIn=signIn;globalThis.__previewShell=previewShell;"
  + "globalThis.__enterPublished=enterPublished;globalThis.__tokenConnect=tokenConnect;"
  + "globalThis.__toggleToken=()=>$(\"#g-token-toggle\").onclick();"
  + "globalThis.__setBase=v=>$(\"#g-base\").oninput({target:{value:v}});";

function load(plane, hash){
  const ctx = makeCtx(plane, hash);
  vm.runInContext(SCRIPT + EXPORTS, ctx);
  return ctx;
}
const settle = () => new Promise(r => setTimeout(r, 0));

/* Everything the member could read, harvested from whatever the surface wrote
   to. Not a list of selectors — the map is populated by `app.html` itself. */
function harvest(ctx){
  const out = new Map();
  for(const [sel, e] of ctx.__els){
    const html = e._html || "";
    const text = e.textContent ? String(e.textContent) : "";
    if(html || text) out.set(sel, html + (text ? "\n" + text : ""));
  }
  return out;
}

/* ============================================================
   THE SCENARIOS — every surface a member can see before authenticating
   ============================================================
   Each declares WHICH entry point it exercises, and the cross-check below binds
   these declarations to what walks 1 and 2 discovered. A scenario dropped from
   this list fails the walk by name; a control or an address nobody drives fails
   the walk by name. */
const SCENARIOS = [];
async function scenario(key, label, spec){
  if(HIDE === key) return;                       // NEGATIVE CONTROL (a)
  const rec = { key, label, controls:spec.controls || [], address:spec.address || null,
                surfaces:new Map(), said:[] };
  const plane = makePlane(spec.mode);
  const ctx = load(plane, spec.hash || "");
  if(spec.drive) await spec.drive(ctx, plane);
  await settle();
  rec.surfaces = harvest(ctx);
  /* A surface a member reads that no script wrote — the served markup itself.
     Carried as an explicit entry rather than injected into the DOM stub, so the
     harvest stays what `app.html` actually rendered. */
  for(const [k, v] of (spec.extra || [])) rec.surfaces.set(k, v);
  rec.said = plane.SAID.slice();
  rec.calls = plane.CALLS.slice();
  rec.ctx = ctx;
  SCENARIOS.push(rec);
  return rec;
}
const E = (c, sel) => c.__doc.querySelector(sel);

const SERVED = "app.html:#gate (served markup)";

/* 1 THE GATE AS IT IS SERVED. No script has run for the member yet: this is the
   markup itself — every label, hint and placeholder a member reads before
   touching anything, including the token panel's text, which is served with the
   page and merely revealed later. */
await scenario("gate-as-served", "the sign-in gate, as served", {
  controls:[], extra:[[SERVED, GATE]],
});

/* 2 THE TOKEN PANEL, revealed by the gate's own control. It RENDERS NOTHING NEW
   — its words are in the served markup above — so what is driven here is the
   reveal itself, and the marker below is the class flip rather than a string.
   The stub starts the panel in the class the markup serves it with, or the
   toggle would be measured against a state that never ships. */
await scenario("token-panel", "the token panel, revealed", {
  controls:["g-token-toggle"],
  drive:(ctx)=>{
    if(/id="g-token-wrap"[^>]*class="[^"]*\bhidden\b/.test(GATE))
      E(ctx, "#g-token-wrap").classList.add("hidden");
    ctx.__toggleToken();
  },
});

/* 3 THE PLANE ADDRESS FIELD, typed into. Also renders nothing new; what is
   driven is that the address a member types becomes the address the surface
   uses, before any credential exists. */
await scenario("plane-address", "a plane address typed at the gate", {
  controls:["g-base"],
  drive:(ctx)=>{ ctx.__setBase("https://plane.example"); },
});

/* 4 A REFUSED SIGN-IN — the surface this whole item is about. */
await scenario("refused-signin", "a refused sign-in", {
  controls:["g-signin"],
  drive:async(ctx)=>{
    E(ctx, "#g-handle").value = "member:m_alice";
    E(ctx, "#g-pw").value = "not the password";
    await ctx.__signIn();
  },
});

/* 5 A SIGN-IN AGAINST A PLANE THAT CANNOT BE REACHED. `teach()`'s fallback is
   this surface's own sentence and no plane sent it — the one refusal at the gate
   that is entirely the surface's, which is why it is driven separately. */
await scenario("unreachable-plane", "a sign-in against an unreachable plane", {
  controls:["g-signin"], mode:{ unreachable:true },
  drive:async(ctx)=>{
    E(ctx, "#g-handle").value = "member:m_alice";
    E(ctx, "#g-pw").value = "whatever";
    await ctx.__signIn();
  },
});

/* 6 CONNECT WITH AN EMPTY TOKEN — the gate's other refusal, also its own. */
await scenario("empty-token", "connect pressed with no token", {
  controls:["g-token-go"],
  drive:async(ctx)=>{ await ctx.__tokenConnect(); },
});

/* 7 THE PUBLIC RECORD — reached with NO credential, which is the product claim. */
await scenario("public-record", "the published record, entered with no credential", {
  controls:["g-pub"],
  drive:async(ctx)=>{ ctx.__enterPublished(); await settle(); },
});

/* 8 THE DESIGN PREVIEW — the whole working shell, rendered before sign-in. */
await scenario("design-preview", "the design preview, before any credential", {
  controls:["g-preview"],
  drive:(ctx)=>{ ctx.__previewShell(); },
});

/* 9 and 10 THE TWO PUBLISHED ADDRESSES, resolved AT LOAD by app.html's own
   top-level code — no gate, no sign-in, no handler of this file's. The hash is
   set before the script runs, exactly as a stranger's browser would. */
await scenario("published-address-at-load", "the published index address, opened by a stranger", {
  controls:[], address:"#published", hash:"#published",
  drive:async()=>{ await settle(); },
});
await scenario("case-address-at-load", "a published case address, opened by a stranger", {
  controls:[], address:"#case/", hash:"#case/" + CASE_ID,
  drive:async()=>{ await settle(); },
});

/* ============================================================
   REACH — asserted, because a walk that covers nothing passes everything
   ============================================================ */
const KEYS = SCENARIOS.map(s => s.key);
const EXPECT_KEYS = ["gate-as-served","token-panel","plane-address","refused-signin","unreachable-plane",
                     "empty-token","public-record","design-preview","published-address-at-load",
                     "case-address-at-load"];
{
  const missing = EXPECT_KEYS.filter(k => !KEYS.includes(k));
  ok("REACH: every pre-authentication scenario was driven — MISSING: "
     + (missing.length ? missing.join(", ") : "none, " + KEYS.length + " driven"),
     missing.length === 0);
}
/* THE CROSS-CHECK THAT BINDS THE WALK TO THE COVERAGE. Walk 1 discovered which
   gate controls are entry points; this asserts every one of them is driven by
   some scenario. Add a control to the gate and this names it; drop a scenario
   and this names the control that lost its only driver. */
{
  const driven = new Set(SCENARIOS.flatMap(s => s.controls));
  const uncovered = BOUND.filter(id => !driven.has(id));
  ok("REACH: every BOUND gate control is driven by a scenario — UNCOVERED: "
     + (uncovered.length ? uncovered.join(", ") : "none, all " + BOUND.length),
     uncovered.length === 0);
}
/* And the same for walk 2's address shapes: each shape the load-time router
   matches must be opened by a scenario. This is the arm that keeps
   `case-address-at-load` load-bearing — it renders into `#pub-body` like the
   index does, so a selector-only check would not notice its absence. */
{
  const driven = SCENARIOS.map(s => s.address).filter(Boolean);
  const undriven = ADDRESS_SHAPES.filter(sh =>
    !driven.some(a => sh.includes(a.replace(/^#/, "").replace(/\/$/, ""))));
  ok("REACH: every published ADDRESS SHAPE the load-time router matches is opened by a scenario — "
     + "UNDRIVEN: " + (undriven.length ? undriven.join(" , ") : "none, both driven as [" + driven.join(", ") + "]"),
     undriven.length === 0 && driven.length === 2);
}
/* THE SURFACES ACTUALLY WALKED, by name and by count. */
const ALL_SURFACES = [...new Set(SCENARIOS.flatMap(s => [...s.surfaces.keys()]))].sort();
const EXPECT_SURFACES = ["#content","#g-err","#m-grp","#m-handle","#m-idstr",
                         "#p-gid","#p-gname","#p-mono","#pl","#pub-body","#rail", SERVED];
{
  const missing = EXPECT_SURFACES.filter(s => !ALL_SURFACES.includes(s));
  const extra   = ALL_SURFACES.filter(s => !EXPECT_SURFACES.includes(s));
  ok("REACH: the walk covers exactly the pre-authentication surfaces it claims — "
     + "STOPPED COVERING: [" + (missing.join(", ") || "nothing") + "] · "
     + "NEWLY RENDERED AND UNCLASSIFIED: [" + (extra.join(", ") || "nothing") + "] · "
     + "walked " + ALL_SURFACES.length + ": " + ALL_SURFACES.join(", "),
     missing.length === 0 && extra.length === 0);
}
/* EVERY SCENARIO RENDERED ITS OWN SUBJECT. A scenario that silently produced an
   error pane, or nothing at all, would enlarge the walk's claimed reach while
   measuring nothing — the zero-cost outcome arriving in the instrument. */
const S = k => SCENARIOS.find(x => x.key === k);
const textOf = (k, sel) => { const s = S(k); return s && s.surfaces.get(sel) || ""; };
const allOf = k => { const s = S(k); return s ? [...s.surfaces.values()].join("\n") : ""; };
if(S("gate-as-served"))
  ok("REACH: the gate scenario carries the served markup, sign-in control and all",
     textOf("gate-as-served", SERVED).includes('id="g-signin"')
     && /Sign in to open this group's working record/.test(textOf("gate-as-served", SERVED)));
if(S("token-panel"))
  ok("REACH: the token panel scenario actually revealed the panel",
     !S("token-panel").ctx.__doc.querySelector("#g-token-wrap").classList.contains("hidden"));
if(S("plane-address"))
  ok("REACH: the plane-address scenario actually set the address on the surface",
     S("plane-address").ctx.__PLANE.base === "https://plane.example");
if(S("refused-signin")){
  ok("REACH: the refused sign-in reached op=login with NO credential and was refused",
     S("refused-signin").calls.some(c => c.op === "login" && c.token === null)
     && S("refused-signin").ctx.__PLANE.session !== true);
  ok("REACH: and the gate rendered the plane's own sentence, whole — which is the subject of this item",
     REFUSAL_SENTENCE.length > 0 && textOf("refused-signin", "#g-err").includes(REFUSAL_SENTENCE));
}
if(S("unreachable-plane"))
  ok("REACH: the unreachable-plane scenario rendered this surface's OWN fallback sentence",
     /Could not reach the plane/.test(textOf("unreachable-plane", "#g-err")));
if(S("empty-token"))
  ok("REACH: the empty-token scenario rendered the gate's own refusal and sent nothing",
     /paste a token first/.test(textOf("empty-token", "#g-err")) && S("empty-token").calls.length === 0);
if(S("public-record")){
  ok("REACH: the public record was reached with NO credential on the wire",
     S("public-record").calls.some(c => c.op === "publishedmanifest" && c.token === null)
     && S("public-record").calls.every(c => c.token === null));
  ok("REACH: and it listed the group's published case rather than the empty statement",
     textOf("public-record", "#pl").includes(CASE_ID)
     && !/has not published any case files/i.test(textOf("public-record", "#pl")));
}
if(S("design-preview"))
  ok("REACH: the design preview rendered the working shell with no credential and asked the plane nothing",
     textOf("design-preview", "#rail").length > 500
     && /Preview mode/.test(textOf("design-preview", "#content"))
     && S("design-preview").calls.length === 0);
if(S("published-address-at-load"))
  ok("REACH: the #published address resolved AT LOAD, uncredentialed, from app.html's own top-level code",
     S("published-address-at-load").calls.some(c => c.op === "publishedmanifest" && c.token === null)
     && S("published-address-at-load").ctx.__doc.documentElement.getAttribute("data-space") === "published");
if(S("case-address-at-load"))
  ok("REACH: the #case/<id> address resolved AT LOAD and drew the case, not a not-published pane",
     S("case-address-at-load").calls.some(c => c.op === "publishedcase" && c.token === null)
     && textOf("case-address-at-load", "#pub-body").includes("Was the sewer transfer authorised?")
     && !/Not published/.test(textOf("case-address-at-load", "#pub-body")));
/* And the walk is not thin: a harvest of a few hundred characters would satisfy
   every assertion above while measuring almost nothing. */
{
  const chars = SCENARIOS.reduce((a,s)=>a + [...s.surfaces.values()].join("").length, 0);
  ok("REACH: the walk harvested " + chars + " characters of member-facing pre-authentication surface",
     chars > 30000);
}

/* ============================================================
   WALK 3 — THE TERM LIST, HARVESTED FROM THE SIBLING GUARDS
   ============================================================
   Every member-facing vocabulary sweep in this directory has the same shape: a
   `for(const word of [...])` whose body asserts `!html.includes(word)`. They are
   read here rather than copied, so this guard polices, on the pre-authentication
   surfaces, exactly the vocabulary its siblings already police on theirs — and
   it cannot fall behind them. Sweeps that are not substring sweeps (the
   publication-entry reversibility sweep builds a RegExp) are excluded by the
   `includes(word)` requirement, because their entries are ordinary English. */
function harvestSiblingTerms(){
  if(EMPTY_TERMS) return { terms:[], files:[] };   // NEGATIVE CONTROL (b)
  const files = fs.readdirSync(HERE).filter(f => f.endsWith(".test.mjs") && path.join(HERE,f) !== SELF).sort();
  const terms = new Set(); const from = [];
  for(const f of files){
    const src = fs.readFileSync(path.join(HERE, f), "utf8");
    let hit = 0;
    for(const m of src.matchAll(/for\(const word of \[([\s\S]*?)\]\)([\s\S]{0,300})/g)){
      if(!m[2].includes("includes(word)")) continue;
      for(const lit of m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)){ terms.add(JSON.parse('"' + lit[1] + '"')); hit++; }
    }
    if(hit) from.push(f + "(" + hit + ")");
  }
  return { terms:[...terms].sort(), files:from };
}
const SIBLING = harvestSiblingTerms();
/* THE FOUR PHRASES DEC-49 ITSELF QUOTES, added on top and declared as added.
   They are not identifiers, so no sibling sweep contains them; a measurement
   that could not see the very words the open decision is about would be
   worthless. Nothing else is added by hand. */
const DEC49_PHRASES = ["no active credential", "a salted derivation", "its stored hash", "this instance"];
const TERMS = [...new Set([...SIBLING.terms, ...(EMPTY_TERMS ? [] : DEC49_PHRASES)])];

ok("WALK 3 REACH: the term list was harvested from the sibling sweeps and is not empty — read "
   + SIBLING.files.length + " suites [" + SIBLING.files.join(", ") + "]",
   SIBLING.terms.length > 0 && SIBLING.files.length >= 8);
ok("WALK 3 REACH: it inherits " + SIBLING.terms.length + " terms from the siblings, including the ones "
   + "every one of them polices", ["op=", "capture_sha", "bundle_id"].every(t => SIBLING.terms.includes(t)));
ok("WALK 3 REACH: and it carries the four phrases DEC-49 quotes, so the measurement can see its own subject",
   DEC49_PHRASES.every(p => TERMS.includes(p)));

/* ============================================================
   ATTRIBUTION — who wrote each word
   ============================================================
   A term occurrence is PLANE-SOURCED when it sits inside a run of text the plane
   supplied, raw or escaped; otherwise this surface wrote it. Per occurrence, not
   per term: the same word is plane-sourced in one place and surface-authored in
   another, and collapsing that would misreport who has to act. */
function planeRanges(html, said){
  if(NO_PLANE_RANGES) return [];                   // NEGATIVE CONTROL (c)
  const ranges = [];
  /* A surface may render a LINE of what the plane sent rather than the whole of
     it — `sig_armored`'s first line is the case page's signature row — so each
     line counts as plane territory in its own right. Without this an excerpt of
     the plane's own bytes reads as words this surface wrote. */
  const parts = [...new Set(said.flatMap(s => [s, ...String(s).split("\n")]))];
  for(const s of parts){
    for(const v of [s, esc(s)]){
      if(v.length < 8) continue;
      let i = html.indexOf(v);
      while(i >= 0){ ranges.push([i, i + v.length]); i = html.indexOf(v, i + 1); }
    }
  }
  return ranges;
}
const inside = (ranges, a, b) => ranges.some(r => r[0] <= a && r[1] >= b);
/* WHAT A MEMBER ACTUALLY READS. The sibling sweeps run over rendered HTML,
   attributes and all, and this one does too so the two are comparable — but a
   term that only ever appears inside a `data-` attribute or a class name is not
   the same finding as one printed on the page, and DEC-49 turns on what a member
   READS. So every count is reported twice: over the HTML, and over the visible
   text with tags removed and entities resolved. */
const visibleText = h => String(h).replace(/<[^>]*>/g, " ")
  .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"')
  .replace(/&middot;/g,"·").replace(/&hellip;/g,"…").replace(/&rarr;/g,"→").replace(/&larr;/g,"←");

/* THE STRUCTURAL DETECTOR, which is a RULE rather than a list and so cannot fall
   behind. Any SCREAMING_SNAKE_CASE identifier standing on a member-facing
   surface is machine vocabulary by its shape alone — no list has to be kept
   current for it to be caught, and it is how `MEMBER_TOKEN` (printed as a FIELD
   LABEL at the gate) is found. The inherited term list would never have had it:
   no sibling surface shows it, because no sibling surface is the gate. */
const SNAKE = /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g;
/* The second structural rule, and it needed a discriminator to be worth having.
   A bare ALL-CAPS token is either an ACRONYM (`R2`, `CORS`, `SSH`) or ordinary
   EMPHASIS (`THE WHOLE CASE`), and this surface uses a lot of the second. The
   rule that separates them without a dictionary and without a list: an emphasis
   word is a word, so it also appears in ordinary case somewhere on the same
   surface; an acronym does not. Measured before it was adopted — with the
   discriminator off, this arm reported `THE`, `WHOLE`, `WAS`, `OUT`, `OWN` and,
   worse, `CASE` and `FIND` out of this file's own fixture ids. Tags are stripped
   WITHOUT inserting a space here, so `Civic<span>OS</span>` reads as `CivicOS`
   and the product's own name is not mistaken for an acronym.
   THE RULE STOPS AT FOUR CHARACTERS, and the limit is named rather than hidden:
   at five it reported `SERVE` (from *"a leg this surface can SERVE"*) beside
   `BEGIN` (from a PEM signature armor), and on these surfaces a five-letter
   all-caps token is emphasis far more often than it is an acronym. The armored
   signature is still flagged at the same site, by `SSH`. */
const ACRONYM = /\b[A-Z][A-Z0-9]{1,3}\b/g;
const tightText = h => String(h).replace(/<[^>]*>/g, "")
  .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"');

function countIn(hay, t, ranges){
  let i = hay.indexOf(t), plane = 0, surface = 0;
  while(i >= 0){
    if(inside(ranges, i, i + t.length)) plane++; else surface++;
    i = hay.indexOf(t, i + 1);
  }
  return { plane, surface };
}

/* HITS: one row per (scenario, surface, term, source), carrying both counts. */
const HITS = [];
for(const sc of SCENARIOS){
  for(const [sel, html] of sc.surfaces){
    const vis = visibleText(html);
    const rRaw = planeRanges(html, sc.said);
    const rVis = planeRanges(vis, sc.said);
    const acronyms = [...new Set([...tightText(html).matchAll(ACRONYM)].map(m => m[0]))]
      .filter(a => !vis.includes(a.toLowerCase()));
    const structural = new Set([...html.matchAll(SNAKE)].map(m => m[0]).concat(acronyms));
    const subjects = [...TERMS.map(t => [t, "inherited"]), ...[...structural].map(t => [t, "structural"])];
    for(const [t, kind] of subjects){
      const raw = countIn(html, t, rRaw);
      const v   = countIn(vis,  t, rVis);
      if(raw.plane)   HITS.push({ scenario:sc.key, surface:sel, term:t, kind, source:"plane",
                                  count:raw.plane,   visible:v.plane });
      if(raw.surface) HITS.push({ scenario:sc.key, surface:sel, term:t, kind, source:"surface",
                                  count:raw.surface, visible:v.surface });
    }
  }
}
ok("the structural detector found SCREAMING_SNAKE identifiers on the pre-authentication surfaces, so the "
   + "rule is live rather than decorative — " + [...new Set(HITS.filter(h=>h.kind==="structural").map(h=>h.term))].join(", "),
   HITS.some(h => h.kind === "structural"));
/* THE ATTRIBUTION IS NON-DEGENERATE, and this is the assertion that catches a
   silently broken subtraction. If the plane ranges came back empty, every
   occurrence would read surface-authored and the report would blame the surface
   for the plane's own sentence — the zero-cost equality arriving in the
   instrument (UI-28's lesson, one item on). */
{
  const planeSide   = HITS.filter(h => h.source === "plane");
  const surfaceSide = HITS.filter(h => h.source === "surface");
  const refusalAttributed = planeSide.some(h => h.scenario === "refused-signin");
  ok("ATTRIBUTION: the partition is non-degenerate — " + planeSide.length + " plane-sourced rows and "
     + surfaceSide.length + " surface-authored, and the refusal sentence's own terms are attributed to "
     + "the PLANE (they are read out of store.mjs, so anything else means the subtraction broke)",
     planeSide.length > 0 && surfaceSide.length > 0 && refusalAttributed);
}

/* ============================================================
   THE REPORT — the measurement DEC-49 should be answered against
   ============================================================ */
const byTerm = new Map();
for(const h of HITS){
  if(!byTerm.has(h.term)) byTerm.set(h.term, { plane:new Set(), surface:new Set(), n:0, vis:0, kind:h.kind });
  const e = byTerm.get(h.term);
  e[h.source].add(h.scenario + " " + h.surface);
  e.n += h.count; e.vis += h.visible;
}
const ordered = [...byTerm.entries()].sort((a,b)=> b[1].vis - a[1].vis || b[1].n - a[1].n || a[0].localeCompare(b[0]));
const R = s => console.log("PRE-AUTH VOCABULARY REPORT: " + s);
R("walked " + ALL_SURFACES.length + " surfaces over " + SCENARIOS.length + " scenarios, "
  + SCENARIOS.reduce((a,s)=>a + [...s.surfaces.values()].join("").length, 0)
  + " characters of member-facing pre-authentication surface, against " + TERMS.length
  + " inherited terms plus two structural rules.");
R(ordered.length + " plane-vocabulary terms reach " + new Set(HITS.map(h=>h.surface)).size
  + " of the " + ALL_SURFACES.length + " pre-authentication surfaces walked, across " + SCENARIOS.length
  + " scenarios: " + HITS.reduce((a,h)=>a+h.count,0) + " occurrences in the rendered HTML, "
  + HITS.reduce((a,h)=>a+h.visible,0) + " of them in text a member READS.");
R("UNAVOIDABLE = the plane said it and DEC-8 forbids this surface translating or blanking it, so only "
  + "DEC-49 can remove it. INCIDENTAL = this surface wrote it and could word it differently today "
  + "without touching a ruling. BOTH = it arrives by both routes and each has its own owner.");
R("x<n> counts the rendered HTML the way every sibling sweep counts it; (<v> visible) counts only what "
  + "survives with the tags removed. A term with 0 visible stands in an attribute or a class name.");
for(const [term, e] of ordered){
  const owner = e.plane.size && e.surface.size ? "BOTH" : (e.plane.size ? "UNAVOIDABLE" : "INCIDENTAL");
  R("  " + JSON.stringify(term) + "  x" + e.n + " (" + e.vis + " visible)  " + owner + "  [" + e.kind + "]"
    + (e.plane.size   ? "  | plane: "   + [...e.plane].join("; ")   : "")
    + (e.surface.size ? "  | surface: " + [...e.surface].join("; ") : ""));
}

/* ============================================================
   THE REPORTING ARM — and the one line that makes it a failing arm
   ============================================================
   DEC-49 is OPEN. Until it is answered, a guard that FAILED here would leave the
   surface only the two moves DEC-8 forbids — compose a translation, or blank
   what the plane said — and a gate that pressures someone into inventing wording
   is a bug in the gate (CLAUDE.md). So this arm REPORTS.

   **WHEN DEC-49 IS ANSWERED, SET `REPORT_ONLY` TO `false`. That is the whole
   change**, and it is right under either answer: (a) the plane learns
   member-facing wording, so the plane-sourced rows disappear at their source;
   (b) surfaces get a licensed translation layer, so they disappear at the
   surface. Either way the state the ruling produces is "no plane vocabulary
   reaches a pre-authentication surface", which is what the assertion below then
   holds the harness to — naming every term, surface and source it still finds.
   `UI31_ENFORCE=1` runs that arm today without editing anything, which is how
   its exact failure was measured for the negative-control line above. */
const REPORT_ONLY = !process.env.UI31_ENFORCE;
{
  const named = ordered.map(([t,e]) => JSON.stringify(t) + "("
    + (e.plane.size ? "plane" : "") + (e.plane.size && e.surface.size ? "+" : "")
    + (e.surface.size ? "surface" : "") + ")").join(", ");
  ok("DEC-49 IS OPEN, so this arm REPORTS rather than fails: " + ordered.length
     + " plane-vocabulary terms stand on pre-authentication surfaces — " + named,
     REPORT_ONLY || HITS.length === 0);
}

if(fails.length){ console.error(`preauth-vocabulary: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`preauth-vocabulary: ${n} assertions, all green — every surface a member can see BEFORE authenticating is walked (the gate as served, its token panel, its address field, a refused sign-in, an unreachable plane, an empty token, the public record, the design preview, and both published addresses resolved at load by app.html's own top-level code); the walk's own reach asserted by name and by count against the gate's markup, the load-time router's address shapes and the sibling suites' own sweeps; and the plane vocabulary standing on those surfaces REPORTED with its exact terms, each occurrence attributed to the plane or to this surface — reported and not failed, because DEC-49 is open and a guard that failed would force a surface to invent a translation DEC-8 forbids; NEGATIVE CONTROL: RUN, five arms — (a) UI31_HIDE=<scenario> hides a member-facing surface from the walk and the harness fails NAMING what it stopped covering (three hidings run, 2/29, 3/30, 3/30) (b) UI31_EMPTY_TERMS=1 neuters the term harvest, 4/31 (c) UI31_NO_PLANE_RANGES=1 breaks the attribution so the plane's own sentence would be blamed on this surface, 1/31 (d) UI31_ENFORCE=1 runs the reporting arm AS the failing arm DEC-49's answer will make it, 1/31 (e) ON DISK, app.html's gate hint gains "capture_sha" and the report grows 13 terms to 14 naming the gate as the author — app.html restored byte-identically, sha256 478ba5ca… before and after`);
