/* UI-83 — A REVISION OF A DECLARED FLOW, THROUGH THE PROGRESSION FORM, AGAINST THE REAL PLANE.
 *
 * THE DESIGN (`BIO_Content_Framework_v0_10.md` §8.2, "The declared flow, and its revisions"; BOB #27,
 * 2026-09-22; built on the plane by D-128): a progression definition is APPEND-ONLY. A re-definition that
 * changes anything writes a NEW version, and the plane refuses it (no basis) without the member's statement
 * of why the declared flow changes and (no citation) without where that basis is published or held; the
 * prior version stands and reads back. D-128 left the member surface with NO basis field, so every revision
 * a member made through the form was refused with nothing on the page to meet the refusal. This suite drives
 * the form's own handlers — `renderProgressions`, `progKeyChanged`, `progDefinePreflight`, `progDefineGo` —
 * with `app.html`'s `fetch` bridged to the real plane in miniflare.
 *
 * A REAL SIGNED-IN MEMBER, NEVER THE DEPLOY MEMBER_TOKEN: REC-189 found that token is a MACHINE identity
 * (`class:member`), so an act driven with it is not a member's act. The member here is enrolled and logs in
 * through op=memberadd / op=enroll / op=login, and the surface carries HER session token; the suite asserts
 * the recorded author of each version is her, which a machine credential could not produce.
 *
 * WHAT IT PROVES, in the row's accepts-when order:
 *   1. the first declaration takes no basis fields and lands as version 1;
 *   2. opening the same key offers the two fields, naming the version the plane says stands;
 *   3. a revision WITHOUT either is refused, and what the member reads is the plane's refusal through
 *      `refusalWords(r)` — never a sentence composed here — with the code beside it; nothing is written;
 *   4. a revision WITH both lands as version 2, carrying the member's statement and citation verbatim,
 *      authored by her, with version 1 standing beside it, and the receipt says so.
 *
 * THE CANNED TRANSLATION IS NOT THERE, AND THIS SUITE SAYS SO RATHER THAN ASSERTING IT (UI-83's finding).
 * The row expected the no-basis refusal to read as a canned translation. MEASURED: the plane's refusal for
 * a revision without a basis, and without a citation, carries NO DEC-49 translation — neither code has a row
 * in any `*_CHECKS` family, and the citation code is minted at three sites (relationdeclare, discharge and
 * this revision), so a sentence is a structural change (one governed helper and one row), which is the
 * plane's, not this surface's. So `refusalWords(r)` falls to the store's own `detail`, and that is what the
 * member reads; this suite asserts the pane reads exactly `refusalWords(r)` and PRINTS whether a translation
 * came, so the day the row lands the print changes and nothing here has to be un-asserted. The codes are
 * compared in this file and never spelled as quoted literals in its prose: the suite feeds the surface
 * nothing (the plane is real), so by D-433 each is OBSERVED, and a quoted spelling in a comment reads to
 * the DEC-49 guard's matcher as a mock handing the surface the code (CASE-6's finding, `reachGap`'s note).
 *
 * NEGATIVE CONTROL: RUN 2026-09-24 by UI-83. Drop the citation field — in `app.html`'s `progDefineDraft`,
 * replace `...(citation ? { citation } : {})` with `...({})`, so the form never sends what the member wrote.
 * DECLARED BEFORE ARMING: the revision arm MUST fail by name, its pane reading the no-citation code; arms 1-3
 * MUST NOT fail. RESULT: 9 of 30 assertions FAILED, all in arm 4 — "the form SENT both fields", then "the
 * revision WITH both fields is ACCEPTED — it does not read NO_CITATION" (the pane read the plane's code),
 * then every version-2 assertion; arms 1-3 stayed green. The first run of this arm read 8 of 30 and found
 * the INSTRUMENT wrong: "authored by the signed-in member" passed over version 1's row, which carries the
 * same author, so it now asserts the version and the author together. Restored by cp from a per-arm
 * pristine copy; app.html sha256 bc16b3a8ce57a80ce797fedab84a1716f218fa4b2e9f84fe6b76e2d1e7da0fcf before and
 * after, cmp identical, 1478342 bytes. OVER-STRICTNESS ARM: the basis and citation typed with surrounding
 * whitespace and a newline (a spelling nobody anticipated) — 30 of 30 green, because the plane trims and
 * the suite compares what the plane recorded; this file restored by cp and cmp.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard its output. */
import fs from "fs";
import vm from "vm";
import { webcrypto } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

/* ---- the REAL plane, in miniflare, resolved from bio-plane's dev dependency (intent-write's instrument).
   Not installed -> FAIL, never skip: a suite that quietly stops testing its subject is the defect. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("progression-revision: the real plane could not be started — run `npm ci` in bio-plane/.");
  console.error("  " + String(e && e.message || e));
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui83", MEMBER_TOKEN: "mem-ui83", PROBE_TOKEN: "prb-ui83", VERSION: "test",
              INSTANCE_NAME: "fixture-group" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method:"POST", body: JSON.stringify(body) })).json());
const get  = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

/* ---- a REAL enrolled member with a session. The first two roster members are administrators (the
   roster's own rule, intent-write's arrangement); IRIS is the member who declares and revises. ---- */
const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-ui83");
  if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await post("enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-1` });
  if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role:`member:${id}`, password:`${id}-passphrase-1` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ruth", ["contribute"], "admin");
await member("gus",  ["contribute"], "admin");
const IRIS = await member("iris", ["contribute"]);
const ME = await get("whoami", "", IRIS);
ok("the surface's credential is a SESSION, signed in as a member — not the deploy member token",
   ME && ME.session === true && typeof ME.member === "string" && ME.member.length > 0);

/* ---- the DOM stub and the bridge (intent-write's shape) ---- */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
const html = (s) => $$(s)._html;
const CALLED = [];
async function bridgeFetch(u, opts){
  const url = new URL(u, "http://x");
  CALLED.push({ op:url.searchParams.get("op"), token:url.searchParams.get("token"), body:opts && opts.body });
  return mf.dispatchFetch(url.toString(), opts);
}
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:bridgeFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE","PROG","renderProgressions","progAddStage","progKeyChanged","progDefinePreflight","progDefineGo",
  "refusalWords","esc",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = IRIS;
U.PLANE.session = true;
U.PLANE.me = ME;

const fill = (stages) => stages.forEach((s, i) => {
  $$(`#pg-st-${i}-key`).value = s.key; $$(`#pg-st-${i}-label`).value = s.label;
  $$(`#pg-st-${i}-card`).value = "1"; $$(`#pg-st-${i}-after`).value = s.after || "";
  $$(`#pg-st-${i}-req`).value = s.req || "always";
});
const defineCalls = () => CALLED.filter(c => c.op === "progressiondefine");

/* ============================================================
   1. the first declaration: no basis fields, version 1
   ============================================================ */
console.log("\n--- 1. the first declaration takes no basis and lands as version 1 ---");
await U.renderProgressions();
ok("the definition control is rendered for a signed-in member who contributes", /pg-key/.test(html("#prog-new")));
$$("#pg-key").value = "council-meeting";
$$("#pg-label").value = "How a council meeting is supposed to go";
fill([{ key:"agenda", label:"The agenda" }, { key:"minutes", label:"The minutes", after:"agenda" }]);
await U.progKeyChanged();
ok("a key the record does not hold offers NO basis fields", html("#pg-revise") === "" && U.PROG.standing === null);
ok("and the pre-flight clears, so the commit control is offered", /pg-go/.test(html("#pg-pf")));
await U.progDefineGo();
const v1 = await get("progression", "key=council-meeting", IRIS);
ok("the plane holds version 1", v1.found === true && v1.version === 1 && v1.version_count === 1);
ok("authored by the signed-in member, not a machine class", v1.declared_by === ME.member && !/^class:/.test(v1.declared_by||""));
ok("the first-declaration receipt reads as a declaration", /is declared, in 2 stages/.test(html("#pg-pf")));

/* ============================================================
   2. the same key: the form offers the two fields and names the version that stands
   ============================================================ */
console.log("\n--- 2. revising: the form offers the basis and the citation ---");
ok("after the declaration the form already knows the key is held", U.PROG.standing && U.PROG.standing.version === 1);
await U.renderProgressions();
$$("#pg-key").value = "council-meeting";
await U.progKeyChanged();
const rev = html("#pg-revise");
ok("opening a held key offers a field for WHY it changes", /id="pg-basis"/.test(rev));
ok("and a field for WHERE that is published or held", /id="pg-cite"/.test(rev));
ok("naming the version the plane says stands, not one this surface counted", /version 1\b/.test(rev));
ok("and saying the earlier version stays on the record", /stays on the record/.test(rev));
$$("#pg-label").value = "How a council meeting is supposed to go";
fill([{ key:"notice", label:"The public notice" },
      { key:"agenda", label:"The agenda", after:"notice" },
      { key:"minutes", label:"The minutes", after:"agenda" }]);
/* renderProgressions drew two stages; the third is added the way a member adds one */
await U.progAddStage();
$$("#pg-key").value = "council-meeting";
await U.progKeyChanged();
fill([{ key:"notice", label:"The public notice" },
      { key:"agenda", label:"The agenda", after:"notice" },
      { key:"minutes", label:"The minutes", after:"agenda" }]);
await U.progDefinePreflight();
ok("with every stage answered the pre-flight clears — the basis is judged at the commit", /pg-go/.test(html("#pg-pf")));

/* ============================================================
   3. a revision WITHOUT either field: the canned refusal, and nothing written
   ============================================================ */
console.log("\n--- 3. without either field: the plane's refusal, through refusalWords ---");
$$("#pg-basis").value = ""; $$("#pg-cite").value = "";
const before3 = defineCalls().length;
await U.progDefineGo();
const sent3 = JSON.parse(defineCalls()[before3].body || "{}");
ok("the form sent the revision with no basis and no citation (nothing invented for the member)",
   !("basis" in sent3) && !("citation" in sent3));
const pane3 = html("#pg-pf");
ok("the pane reads the plane's no-basis code", /NO_BASIS/.test(pane3));
/* the same refusal, asked of the plane directly with the body the form sent, is the one the member met */
const refusal3 = await post("progressiondefine", { ...sent3 }, IRIS);
ok("the plane refuses that body for its missing basis", refusal3 && refusal3.ok === false && refusal3.reason === "NO_BASIS");
const words3 = U.refusalWords(refusal3);
ok("what the member reads is exactly refusalWords(r) — the plane's words, not a sentence composed here",
   words3.length > 0 && pane3.includes(U.esc(words3)));
ok("and those words are the plane's translation when it sends one, else the store's own detail",
   words3 === (refusal3.translation || refusal3.detail));
console.log(`  NOTE: the no-basis refusal ${typeof refusal3.translation === "string" && refusal3.translation
  ? "carries a canned translation" : "carries NO canned translation (DEC-49 gap, UI-83's finding) — the member reads the store's detail"}`);
const after3 = await get("progression", "key=council-meeting", IRIS);
ok("a refused revision wrote NOTHING — version 1 still stands alone", after3.version === 1 && after3.version_count === 1);

/* ============================================================
   4. a revision WITH both: version 2, basis verbatim, version 1 beside it
   ============================================================ */
console.log("\n--- 4. with both fields: a landed version ---");
const BASIS = "The Sunshine Ordinance requires a public notice ten days before a regular meeting.";
const CITE  = "Oakland Municipal Code 2.20.070";
$$("#pg-basis").value = BASIS; $$("#pg-cite").value = CITE;
const before4 = defineCalls().length;
await U.progDefineGo();
const sent4 = JSON.parse((defineCalls()[before4] || {}).body || "{}");
ok("the form SENT both fields, as the member wrote them", sent4.basis === BASIS && sent4.citation === CITE);
ok("with the member's session token, not the deploy member token",
   defineCalls()[before4] && defineCalls()[before4].token === IRIS);
const pane4 = html("#pg-pf");
ok("the revision WITH both fields is ACCEPTED — it does not read NO_CITATION", !/NO_CITATION/.test(pane4));
ok("nor NO_BASIS", !/NO_BASIS/.test(pane4));
const v2 = await get("progression", "key=council-meeting", IRIS);
ok("the plane holds version 2 as current", v2.version === 2 && v2.current === true && v2.version_count === 2);
ok("carrying the member's statement and citation verbatim",
   v2.basis && v2.basis.statement === BASIS && v2.basis.citation === CITE);
/* version 2 AND its author together: read alone, the author would pass over version 1's row, which
   carries the same member (measured under the negative control — it passed for free there). */
ok("version 2 is authored by the signed-in member", v2.version === 2 && v2.declared_by === ME.member);
ok("in the three stages the member declared", v2.stage_count === 3);
const old = await get("progression", "key=council-meeting&version=1", IRIS);
ok("version 1 stands beside it and reads back in its two stages", old.version === 1 && old.current === false && old.stage_count === 2);
ok("the receipt says a new version was recorded and the earlier one stays",
   /as version 2/.test(pane4) && /Version 1 stays on the record/.test(pane4));
ok("and the form now names version 2 as what stands", /version 2\b/.test(html("#pg-revise")));

if(fails.length){ console.error(`progression-revision: ${fails.length} of ${n} assertions FAILED`); process.exit(1); }
console.log(`progression-revision: ${n} assertions, all green — a revision through the form offers a basis and a citation, sends both, lands version 2 beside version 1 authored by a signed-in member, and without them reads the plane's no-basis refusal through refusalWords and writes nothing`);
process.exit(0);
