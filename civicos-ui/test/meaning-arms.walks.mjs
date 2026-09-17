#!/usr/bin/env node
/* UI-63's BYTE-IDENTICAL MEASUREMENT — the fence around this item, measured
 * rather than promised.
 *
 * Run from the REPO ROOT, before and after the change:
 *     node civicos-ui/test/meaning-arms.walks.mjs
 *
 * WHY THIS EXISTS AND WHY IT IS A SEPARATE INSTRUMENT FROM THE SUITE. UI-62
 * routed `passage:` and left `leg:`, `resolves:` and `content:` exactly where
 * they were ON PURPOSE, and wrote an over-strictness arm to prove that the
 * walks it did not mean to change did not change. UI-63 is the item that moves
 * those three — so its FIRST obligation is not to break that proof. A suite
 * assertion can only say "still true"; it cannot say "the same bytes". This
 * prints the bytes.
 *
 * TWO BUCKETS, AND THEIR EXPECTED BEHAVIOUR IS DECLARED BEFORE THE RUN:
 *
 *   PINNED — every walk UI-62's over-strictness arm pins that passes through
 *     `finderPlan` or a panel this item can reach, plus a sweep of ordinary
 *     queries the item has no business changing. Its digest MUST BE IDENTICAL
 *     before and after. If it moves, the change is wider than its row.
 *
 *   ARMS — the three meaning arms this item is about. Its digest MUST CHANGE.
 *     A run where PINNED holds and ARMS also holds is a change that did
 *     nothing, which is the other way this could be wrong and is the reason
 *     this bucket is printed rather than only the first.
 *
 * THE COMPOSER WALKS UI-62 ALSO PINS (a cite opened with no passage) are NOT
 * here and are not forgotten: they are reached through `citePaint`, which this
 * item does not touch and cannot reach from `finderPlan`. They are measured by
 * RUNNING `passage-surface.test.mjs` itself, which is the fence suite and is
 * never amended by this item.
 *
 * The plane is REAL, under miniflare, and the store is EMPTY on purpose: every
 * walk below is a walk of the PARSE and of the not-asked panels, and seeding a
 * corpus would add a variable this measurement is not about. `meaning` is
 * published off the compiler's own registry and does not depend on content.
 */
import "../../bio-plane/test/stdio.mjs";
import fs from "fs";
import vm from "vm";
import { createHash, webcrypto } from "crypto";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { appScript } from "./extract.mjs";

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("meaning-arms.walks: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/ (this probe drives the actual plane; nothing here is mocked).");
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
  bindings: { ADMIN_TOKEN: "adm-ui63", MEMBER_TOKEN: "mem-ui63", PROBE_TOKEN: "prb-ui63", VERSION: "test" },
});

const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){} },
  localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
  fetch: (u, opts) => mf.dispatchFetch(new URL(u, "http://x").toString(), opts) };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE", "loadSearchFields", "SEARCH_FIELDS", "PASSAGE_ARM", "finderPassageArm",
  "finderPlan", "finderPassageRoute", "finderCrossSeamHtml",
  "finderTextPanelHtml", "finderSubjectsPanelHtml",
].join(",") + "};", ctx);
const U = ctx.__U;
U.PLANE.token = "mem-ui63";
U.PLANE.session = true;
U.PLANE.me = { member:"m_probe", handle:"probe", session:true, administer:false, capabilities:["contribute"] };
await U.loadSearchFields(true);
if (!U.finderPassageArm()) {
  console.error("meaning-arms.walks: the plane did not publish the passage arm — this probe's ground is wrong.");
  await mf.dispose(); process.exit(1);
}

/* A walk is (name, value). `finderPlan` is serialised WHOLE — every bucket, in
   order — because the thing this item moves is which bucket a term is in, and a
   probe that printed only a length could not tell a move from a deletion. */
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rec = [];
const walk = (bucket, name, value) => rec.push({ bucket, name, value });
const planOf = (q) => { const p = U.finderPlan(q); return {
  q: p.q, crossSeam: p.crossSeam, words: p.words,
  text: p.text, subjects: p.subjects, unpublished: p.unpublished, passages: p.passages }; };

/* ---- PINNED: the two not-asked panels UI-62 pins by exact string ---- */
walk("PINNED", "finderTextPanelHtml({asked:false})", U.finderTextPanelHtml({ asked:false }, new Set()));
walk("PINNED", "finderSubjectsPanelHtml({asked:false})", U.finderSubjectsPanelHtml({ asked:false }, new Set()));

/* ---- PINNED: the passages route not asked on an empty query ---- */
{
  const e = await U.finderPassageRoute(U.finderPlan(""));
  walk("PINNED", "finderPassageRoute(finderPlan(''))", { asked: e.asked, env: !!e.env, armUnpublished: !!e.armUnpublished });
}

/* ---- PINNED: `passage:` against a plane that does not publish the arm ---- */
{
  const saved = U.SEARCH_FIELDS.meaning;
  U.SEARCH_FIELDS.meaning = null;
  walk("PINNED", "finderPlan('passage:x') WITH NO `meaning` PUBLISHED", planOf(`${U.PASSAGE_ARM}:x`));
  walk("PINNED", "finderPlan('leg:hunch') WITH NO `meaning` PUBLISHED", planOf("leg:hunch"));
  U.SEARCH_FIELDS.meaning = saved;
}

/* ---- PINNED: the ordinary queries. Bare words, published fields, the grammar
       prefixes, the subjects seam, `passage:`, and the names the record
       publishes as NEITHER — the true negative this item must not remove. ---- */
for (const q of [
  "sewer fund",
  '"sewer fund" main',
  "type:inquiry",
  "state:collected",
  "sort:updated",
  "has:title",
  "fm:source.authority=oaklandca",
  "-type:action",
  "nosuchfield:x",
  "grade:>=B",
  "concerns:ENT-0031",
  "concerns:ENT-0031 state:collected grade:>=B",
  "passage:hydrostatic",
  "concerns:ENT-1 passage:hydrostatic",
  "passage:hydrostatic grade:>=B",
]) {
  walk("PINNED", `finderPlan(${JSON.stringify(q)})`, planOf(q));
  const p = U.finderPlan(q);
  if (p.crossSeam) walk("PINNED", `finderCrossSeamHtml(${JSON.stringify(q)})`, U.finderCrossSeamHtml(p));
}

/* ---- ARMS: the three this item is about, alone and crossed ---- */
for (const q of [
  "leg:hunch",
  "resolves:>=B",
  "content:pdf-page",
  "leg:grade>=B",
  "content:cap<C",
  "concerns:ENT-0031 leg:hunch",
  "concerns:ENT-0031 resolves:>=B",
  "concerns:ENT-0031 content:uncited",
  "concerns:ENT-0031 leg:hunch resolves:>=B content:stale grade:>=B",
]) {
  walk("ARMS", `finderPlan(${JSON.stringify(q)})`, planOf(q));
  const p = U.finderPlan(q);
  if (p.crossSeam) walk("ARMS", `finderCrossSeamHtml(${JSON.stringify(q)})`, U.finderCrossSeamHtml(p));
}

const dump = (bucket) => rec.filter((r) => r.bucket === bucket)
  .map((r) => `${r.name}\n${typeof r.value === "string" ? r.value : JSON.stringify(r.value)}`).join("\n----\n");
const PINNED = dump("PINNED"), ARMS = dump("ARMS");
if (process.argv.includes("--print")) console.log(PINNED + "\n========\n" + ARMS);
console.log(`\nPINNED  ${rec.filter(r=>r.bucket==="PINNED").length} walk(s)  sha256 ${sha(PINNED)}`);
console.log(`ARMS    ${rec.filter(r=>r.bucket==="ARMS").length} walk(s)  sha256 ${sha(ARMS)}`);
console.log(`\nPINNED must be IDENTICAL across the change. ARMS must DIFFER.`);
await mf.dispose();
process.exit(0);
