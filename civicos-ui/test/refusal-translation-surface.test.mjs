/* UI-72 — A REFUSAL CARRYING A CANNED `translation` REACHES THE MEMBER IN THAT SENTENCE, ON EVERY ACT
 * SURFACE. Driven against the REAL PLANE.
 *
 * Design: DEC-49 (Bob, 2026-08-06), which amends DEC-8 — *"a surface MAY render an AUTHORED translation
 * keyed on an error code the plane SENT"*, the code RECEIVED and never inferred — restated as
 * `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 10: *"every condition the assistant
 * relays has a named code and a canned translation, and an untranslated code fails the harness."*
 *
 * ------------------------------------------------------------------ THE DEFECT IT CLOSES
 *
 * `actRefusalHtml` read `r.detail || r.error || ""` and never consulted `r.translation`. Both fields are
 * the plane's own words, so DEC-8 was never broken — but they are written for DIFFERENT READERS. `detail`
 * addresses A CALLER OF THE OP ("pass id=<INQ-…>", "send the fork with no newId", "…&no_falsifier=1"),
 * and `translation` is the sentence DEC-49 had authored FOR A MEMBER. So the member was shown something
 * TRUE OF THE OP AND FALSE OF THEIR SITUATION, at the one place a person meets the record. UI-66 fixed it
 * at the two sites it owned and recorded in its own comment that moving it inside `actRefusalHtml` was
 * *"a class change, reported, not made here"*. This suite is that class change's evidence.
 *
 * ---------------------------------------------------------- WHAT IT ASSERTS, AND THE LIAR EACH BEATS
 *
 *   ARM 1 · A REAL REFUSAL THE PLANE ACTUALLY EMITTED, rendered on a real member-facing surface. The
 *     plane runs in miniflare from `bio-plane/src/index.mjs`; a real member asks `op=basisversions` for a
 *     PROJECT through `versionReviewOpen`, and the store refuses BASIS_VERSIONS_NOT_AN_INQUIRY with its
 *     catalogue row's translation beside a `detail` written for the caller. **THE LIAR THIS BEATS:**
 *     showing `translation` when one is present but never proving a member-facing surface ever RECEIVES
 *     one. A fixture this suite typed would agree with itself for free; a plane that never sends the
 *     field would make the whole item decoration. So the refusal is READ OFF THE WIRE, its two sentences
 *     asserted DIFFERENT before anything is judged, and the rendered page compared to both.
 *
 *   ARM 2 · THE PREFERENCE IS IN ONE HELPER, NOT AT A LIST OF SITES. `refusalWords` is the only place the
 *     order is decided, and both renderers read it. **THE LIAR THIS BEATS:** wrapping the two or three
 *     call sites a suite happens to drive and leaving twenty-four untouched — which is exactly the state
 *     UI-66 left and this row exists to end. Asserted structurally, because no suite drives all
 *     thirty-seven sites: the per-site shim `refusalTranslated` is GONE, no site re-implements it, and
 *     neither renderer picks words without going through the helper.
 *
 *   ARM 3 · THE TWIN. `intentRefusalHtml` carried a BYTE-IDENTICAL copy of the defective line, serving ten
 *     member-facing panes, and UI-72's row did not name it — the class sweep did. Both now read the one
 *     helper. **THE LIAR THIS BEATS:** fixing only what was reported.
 *
 *   ARM 4 · AN EMPTY OR NON-STRING `translation` IS NOT A SENTENCE. `translation: undefined` has shipped
 *     to a member once (DEC-49's own floor note); taking `""` or an object as the answer would blank the
 *     member or print `[object Object]`. The same two shapes `admission-translation.test.mjs` pins for
 *     `acquireWhy`, pinned here for the act surfaces.
 *
 *   ARM 5 · THE OVER-STRICTNESS ARM. A refusal the plane did NOT translate must still reach the member in
 *     its `detail` — 297 of the plane's 592 refusal codes have no canned translation today
 *     (`check-refusal-codes.mjs` arm F), so a change that only rendered translations would blank most of
 *     the record's refusals. This arm must stay GREEN under every control arm below.
 *
 * WHAT THIS SUITE CANNOT SEE, stated rather than left to be found: it drives TWO of the thirty-seven call
 * sites through a real plane (ARM 1 and the four suites named in UI-72's report drive six more); the rest
 * are covered STRUCTURALLY by ARM 2, which reads shape and not behaviour. And 194 of the 198 hand-written
 * refusal fixtures in this estate carry no `translation` at all, so their `detail` pins are green by
 * absence rather than by agreement — UI-72 measured that and named the four codes where the fixture is
 * narrower than the wire (KIND_NOT_PERSONAL, NOT_CAPABLE, NO_ACKNOWLEDGMENT, NO_SUCH_SELECTION).
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/refusal-translation-surface.control.mjs` — a BASELINE and four
 * arms, each mutating `civicos-ui/app.html` ALONE on disk, restored and verified by sha256 AND `cmp`
 * against a per-arm pristine copy. Declared before arming: (A) THE ROW'S OWN — `refusalWords` reverted to
 * `r.detail || r.error || ""` -> RED at ARM 1, naming the caller's sentence the member would read, with
 * ARM 5 STILL GREEN; (B) THE TWIN — only `intentRefusalHtml` reverted -> RED at ARM 3, ARM 1 green, which
 * is what makes the twin's arm specific rather than a second reading of the same fact; (C) THE TRUTHY
 * TEST — `r.translation || r.detail || ...`, the spelling that looks right -> RED at ARM 4's non-string
 * shape (`[object Object]` reaches the member) while ARMS 1, 3 and 5 stay green; (D) OVER-STRICTNESS —
 * the helper's early return spelled `if(r.translation && typeof r.translation === "string")`, the same
 * rule in an order this suite did not anticipate -> GREEN, all arms.
 *
 * RUN 2026-09-19: **5/5 AS DECLARED** against app.html `3916f88a…` (1,405,511 bytes), restored by sha256
 * and `cmp` after every arm — BASELINE 29/0, (A) RED 4 failing, (B) RED 5 failing with ARM 1 green,
 * (C) RED 2 failing with ARMS 1/3/5 green, (D) GREEN 29/0. **Arm (A)'s declaration was WRONG on its first
 * run and the arm is what said so** — it declared that the failing line must name the CANNED sentence,
 * when a broken preference is precisely what makes that sentence vanish; it is now two-sided (the caller's
 * sentence present, the canned one absent) and the control's own header records why.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard the
   writer's own output. SHARED from the plane's test estate; census: `stdio-census.test.mjs`. */
import fs from "fs";
import vm from "vm";
import { webcrypto } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { appScript } from "./extract.mjs";
import { BASIS_VERSION_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

let n = 0; const fails = [];
function ok(msg, cond, extra){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg, extra == null ? "" : extra); }
  else console.log("  ok  ", msg); }

/* ---- the REAL plane, in miniflare. Not installed is a FAILURE, never a skip: this suite's whole point
   is that the sentence the member reads is one the plane actually sent. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("refusal-translation-surface: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/. " + String(e && e.message || e));
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui72", MEMBER_TOKEN: "mem-ui72", PROBE_TOKEN: "prb-ui72", VERSION: "test" },
});
let exitCode = 1;
try {
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method:"POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-ui72");
  if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await post("enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-1` });
  if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role:`member:${id}`, password:`${id}-passphrase-1` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ada",  ["contribute"], "admin");
await member("bram", ["contribute"], "admin");
const NELL = await member("nell", ["contribute", "create_projects"]);

/* A REAL PROJECT — the thing a member can ask for versions of and the plane cannot answer for. The id is
   the plane's own minted one (REC-141): nothing here composes it. */
const NOW = "2026-09-19T09:00:00Z";
const sha = async (t) => Array.from(new Uint8Array(await webcrypto.subtle.digest("SHA-256",
  new TextEncoder().encode(t)))).map(b => b.toString(16).padStart(2, "0")).join("");
const BODY = [ "---", "type: project", "title: The ferry contract", "current_state: forming", "---", "",
               "## Plan", "", "Who signed the ferry contract, and against which appraisal.", "",
               "## Status", "", "## Correspondence", "", "## Session Log", "", "## Review Notes", "" ].join("\n");
const made = await post("promote", {
  base: null, snapKey: "20260919T090000Z_aaaa1111", author: "nell",
  meta: { object_type: "project", group: "believe-in-oakland", title: "The ferry contract",
          current_state: "forming", created: NOW, last_updated: NOW },
  files: [{ path:"bundle.md", text: BODY, bytes: BODY.length, sha256: await sha(BODY) }],
  register: [],
}, NELL);
if(!made || made.ok === false || !made.bundleId) throw new Error("promote: " + JSON.stringify(made));
const PROJ = made.bundleId;

/* ---- the DOM stub and the bridge (project-id-surface's instrument) ---- */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, checked:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };

/* EVERY ANSWER THE PLANE GAVE, cloned before the surface reads it — a Response body is consumed once. */
const WIRE = [];
async function bridgeFetch(u, opts){
  const url = new URL(u, "http://x");
  const r = await mf.dispatchFetch(url.toString(), opts);
  try{ WIRE.push({ op:url.searchParams.get("op"), body: await r.clone().json() }); }catch(_){}
  return r;
}
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto:webcrypto, Blob:class{},
  IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1},
  requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch:bridgeFetch };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE","esc","refusalWords","actRefusalHtml","intentRefusalHtml","versionReviewOpen","versionReviewHtml",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = NELL;
U.PLANE.session = true;
U.PLANE.me = { member:"nell", handle:"nell", session:true, administer:false,
               capabilities:["contribute","create_projects"] };

const strip = (h) => String(h||"").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/* ============================================================
   0. THE GROUND — the plane really sends both sentences, and they really differ
   ============================================================ */
console.log("\n--- 0. the ground: the plane's own refusal, off the wire ---");
const ROW = BASIS_VERSION_CHECKS.BASIS_VERSIONS_NOT_AN_INQUIRY;
ok("the catalogue row exists and carries a real member-facing sentence",
   !!ROW && typeof ROW.translation === "string" && ROW.translation.trim().split(/\s+/).length >= 8,
   ROW && ROW.translation);
const WIRE_REF = await get("basisversions", "id=" + encodeURIComponent(PROJ), NELL);
ok("THE PLANE REALLY REFUSES a project's basis versions, by name",
   !!WIRE_REF && WIRE_REF.ok === false && WIRE_REF.reason === "BASIS_VERSIONS_NOT_AN_INQUIRY",
   JSON.stringify(WIRE_REF));
ok("and it really sends the canned translation on the wire (DEC-49), byte-identical to its catalogue row",
   WIRE_REF.translation === ROW.translation);
ok("and a `detail` beside it that is written for A CALLER OF THE OP",
   typeof WIRE_REF.detail === "string" && WIRE_REF.detail.length > 20);
/* THE FIXTURE IS ASSERTED DISCRIMINATING BEFORE ANYTHING IS JUDGED: if the two sentences agreed, every
   assertion below would pass whichever field the surface rendered, and the suite would measure nothing. */
ok("THE TWO SENTENCES DIFFER — without this, nothing below can tell which one the surface rendered",
   WIRE_REF.detail !== WIRE_REF.translation);

/* ============================================================
   1. A REAL MEMBER-FACING SURFACE RENDERS THE MEMBER'S SENTENCE
   ============================================================ */
console.log("\n--- 1. the version-review surface, driven through the real plane ---");
await U.versionReviewOpen(PROJ);
const page = U.versionReviewHtml();
ok("the surface rendered a refusal at all", /intent-ref-why/.test(page), page.slice(0, 300));
ok("THE MEMBER READS THE PLANE'S CANNED TRANSLATION, BYTE FOR BYTE",
   page.includes(`<div class="intent-ref-why">${U.esc(ROW.translation)}</div>`),
   (/<div class="intent-ref-why">([^<]*)<\/div>/.exec(page) || ["","<none>"])[1]);
ok("AND THE CALLER'S SENTENCE IS NOT ON THE PAGE — the defect UI-72 closes",
   !strip(page).includes(strip(WIRE_REF.detail)));
ok("the code is still shown as the record's own, unmodified",
   page.includes(`<div class="intent-ref-code mono">BASIS_VERSIONS_NOT_AN_INQUIRY</div>`));
ok("nothing of this sentence lives in app.html — the surface renders it, it does not know it",
   !fs.readFileSync(new URL("../app.html", import.meta.url), "utf8").includes(ROW.translation));

/* ============================================================
   2. THE PREFERENCE IS IN ONE HELPER, NOT AT A LIST OF SITES
   ============================================================ */
console.log("\n--- 2. one helper decides the order, for every call site ---");
const APP = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
const SCRIPT = appScript();
ok("`refusalWords` exists and is the surface's own function", typeof U.refusalWords === "function");
ok("UI-66's PER-SITE SHIM IS GONE — no site carries its own copy of the rule",
   !/\brefusalTranslated\b/.test(SCRIPT));
ok("and no site re-implements it under another name (a spread that rewrites `detail` from `translation`)",
   !/detail\s*:\s*[A-Za-z_$][\w$]*\.translation/.test(SCRIPT));
/* THE TWO RENDERERS, READ AS SOURCE. Behaviour is what ARMS 1 and 3 assert; this arm is the reason the
   other thirty-five call sites need no arm of their own — they all go through these two functions. */
const bodyOf = (name) => {
  const at = SCRIPT.indexOf(`function ${name}(r){`);
  return at < 0 ? "" : SCRIPT.slice(at, SCRIPT.indexOf("\n}", at));
};
for(const name of ["actRefusalHtml", "intentRefusalHtml"]){
  const b = bodyOf(name);
  ok(`${name} was found in app.html`, b.length > 40);
  ok(`${name} takes its words from the ONE helper`, /const words = refusalWords\(r\);/.test(b));
  ok(`${name} picks no words of its own — no second spelling to drift from the first`,
     !/r\.detail\s*\|\|/.test(b));
}
const sites = (SCRIPT.match(/\bactRefusalHtml\(/g) || []).length - 1;      /* less the declaration */
const twins = (SCRIPT.match(/\bintentRefusalHtml\(/g) || []).length - 1;
ok(`the census is non-empty and printed: ${sites} actRefusalHtml call site(s), ${twins} intentRefusalHtml call site(s)`,
   sites >= 20 && twins >= 8);

/* ============================================================
   3. THE TWIN — the same rule, on the intent panes
   ============================================================ */
console.log("\n--- 3. the twin renderer the class sweep found ---");
{
  const r = { ok:false, reason:"BASIS_VERSIONS_NOT_AN_INQUIRY", code:"BASIS_VERSIONS_NOT_AN_INQUIRY",
              check:ROW.check, translation:ROW.translation, detail:WIRE_REF.detail };
  const h = U.intentRefusalHtml(r);
  ok("an intent pane renders the plane's member-facing sentence, byte for byte",
     h.includes(`<div class="intent-ref-why">${U.esc(ROW.translation)}</div>`), strip(h).slice(0, 200));
  ok("and not the sentence written for a caller of the op", !strip(h).includes(strip(WIRE_REF.detail)));
  ok("the two renderers agree exactly — one rule, rendered the same way twice",
     U.intentRefusalHtml(r) === U.actRefusalHtml(r));
}

/* ============================================================
   4. AN EMPTY OR NON-STRING TRANSLATION IS NOT A SENTENCE
   ============================================================ */
console.log("\n--- 4. the shapes that would blank a member ---");
{
  const D = "the record could not do that, and here is the caller's account of why.";
  const empty = U.actRefusalHtml({ ok:false, reason:"X", translation:"", detail:D });
  ok("an EMPTY translation is not taken as the answer; the detail still reaches the member",
     empty.includes(U.esc(D)), strip(empty));
  const obj = U.actRefusalHtml({ ok:false, reason:"X", translation:{ text:"x" }, detail:D });
  ok("a NON-STRING translation is not rendered either — no `[object Object]` reaches a member",
     obj.includes(U.esc(D)) && !/\[object/.test(obj), strip(obj));
  ok("and neither shape blanks the page", strip(empty).length > 20 && strip(obj).length > 20);
}

/* ============================================================
   5. OVER-STRICTNESS — an UNTRANSLATED refusal still reaches the member
   ============================================================ */
console.log("\n--- 5. the over-strictness arm: 297 of the plane's codes have no translation ---");
{
  const D = "op=versionchain answers for ONE document address: pass address=<url>.";
  const h = U.actRefusalHtml({ ok:false, reason:"VERSION_CHAIN_NO_ADDRESS", detail:D });
  ok("a refusal the plane did NOT translate is rendered in its `detail`, exactly as before",
     h.includes(`<div class="intent-ref-why">${U.esc(D)}</div>`), strip(h));
  ok("an `error`-only refusal still reaches the member too",
     U.actRefusalHtml({ ok:false, error:"unknown op" }).includes(U.esc("unknown op")));
  ok("and a refusal with nothing at all still says so rather than rendering blank",
     strip(U.actRefusalHtml({ ok:false, reason:"X" })).includes("The record refused this and said nothing further"));
}

console.log(`\nrefusal-translation-surface: ${n} assertions, ${fails.length} failed — the plane's own refusal `
  + `(BASIS_VERSIONS_NOT_AN_INQUIRY, ${ROW.check}) read off the wire and rendered on a real surface; `
  + `${sites} actRefusalHtml and ${twins} intentRefusalHtml call sites covered structurally by the one helper`);
exitCode = fails.length ? 1 : 0;
if(fails.length) for(const f of fails) console.error("  FAILED:", f);
} finally { await mf.dispose(); }
process.exit(exitCode);
