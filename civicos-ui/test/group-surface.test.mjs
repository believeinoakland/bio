/* NEGATIVE CONTROL: `node civicos-ui/test/group-surface.control.mjs` (from the repo root) — a BASELINE and four arms,
 * each mutating `civicos-ui/app.html` ALONE on disk, restored and verified by sha256 AND `cmp` against a per-arm
 * pristine copy. Declared before arming, and the results of the run are in the control's own header:
 *   BASELINE -> GREEN · (A) THE ROW'S CONTROL, the `GROUP` literal restored -> RED, the no-literal arm failing BY NAME
 *   · (B) THE LIAR, a CSS-hidden literal built at run time beside the slug -> RED, the DOM-TEXT arm failing by name ·
 *   (C) a silence read as "none" -> RED, the silence arm failing by name · (D) OVER-STRICTNESS, the absence said in
 *   other words -> GREEN.
 *   RUN 2026-09-22 by UI-77 against app.html 1db08737… (1,410,168 bytes; re-run after the state was renamed `silent`, figures identical), every arm restored and verified by sha256 and
 *   `cmp`, the file IDENTICAL to pristine at the end — 5/5 AS DECLARED: BASELINE GREEN 45/45 · (A) RED 10/45, both
 *   DOM-text no-literal arms failing by name (with the markup and source census arms, every slug arm and every none and
 *   silence arm, which the literal overwrote) · (B) RED 31/45, SIGNED OUT/SIGNED IN NO-LITERAL failing by name while
 *   SOURCE NO-LITERAL stayed GREEN — the census cannot see a name built at run time and the DOM arm did · (C) RED 41/45,
 *   the 502 and older-plane silences failing on the HEADER only (the fence's `recR` throws on a non-OK answer, so its
 *   catch still says "could not read" — the arm moved one path of two, and the header arm is the one that saw it), the
 *   true-absence arms GREEN · (D) GREEN 45/45.
 * =========================================================================
 * UI-77 — THE MEMBER FENCE AND THE PUBLIC HEADER SHOW THE GROUP THE RECORD RECORDS, OR SAY THAT NONE IS RECORDED.
 * Design: `docs/architecture/BIO_Publication_v0_1.md` §7 point 1 (the slug is PUBLIC; a display name is shown WITH it,
 * never instead — and no display name is built), consuming IC-174 (`op=instancegroup`, public since REC-163).
 *
 * THE DEFECT: `app.html` declared one group's display name, domain and monogram as a literal and painted them into
 * the member fence (`#m-grp`, `#m-idstr`) and the public header (`#p-gname`, `#p-gid`, `#p-mono`), with the domain a
 * third time in `#m-idstr`'s markup. `newgroup` installs this file into every sovereign group's account, so every
 * instance's public page named THIS project's group as its own.
 *
 * NO MOCK OF THE READ. The plane runs in miniflare from `bio-plane/src/index.mjs` — the real control plane, the real
 * Durable Object — and `app.html`'s own `fetch` is bridged to it (project-id-surface's instrument). Planes booted:
 *   SECOND — a store whose first boot bound `INSTANCE_NAME` to a slug that is NOT this project's (the row's "plane
 *            recording a SECOND slug"): both surfaces, signed out AND signed in, show that slug;
 *   NONE   — a store whose first boot bound none, so it records no group: both surfaces SAY so, in words;
 *   SILENT — the SECOND plane with its `op=instancegroup` made to fail three ways (the store's own 502 envelope, an
 *            older plane's refusal of a stranger, a transport that throws): both surfaces say they could not read the
 *            group, and NEVER that none is recorded and never the slug (REC-52: a silence is not an absence).
 * Signed in is a real enrolled member signed in with a SESSION, through the real `boot()`.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: KEEP THE LITERAL AND HIDE IT WITH CSS. A browser
 * shows the slug; the page still carries the old name. So the no-literal arms read the DOM's TEXT — every element the
 * surface touched, its `textContent` AND the text of its `innerHTML`, hidden or not — and never visibility; the
 * control's arm (B) is that liar, building the name at run time so the source census cannot be what catches it.
 * And a SURFACE THAT SAYS NOTHING passes every no-literal arm, so the recorded arms demand the SLUG and the none arm
 * demands WORDS.
 *
 * WHAT THIS CANNOT SEE, stated: a page as a browser lays it out (no layout engine runs; the markup arm reads the served
 * markup's static text, the drive arms read what the script wrote); any served UI file but `app.html` (the class sweep
 * below names the others and what each is); and a live instance — Cloudflare is not reachable from this environment,
 * so live verification is UNDETERMINED, not claimed.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard the writer's
   own output. SHARED from the plane's test estate; census: `stdio-census.test.mjs`. */
import fs from "fs";
import vm from "vm";
import { webcrypto } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { appScript } from "./extract.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("group-surface: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/. " + String(e && e.message || e));
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const ADM = "adm-ui77", MEM = "mem-ui77", PRB = "prb-ui77";
function plane(instanceName){
  return new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
    script: fs.readFileSync(IDX, "utf8"),
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } },
    r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, PROBE_TOKEN: PRB, VERSION: "test",
                ...(instanceName ? { INSTANCE_NAME: instanceName } : {}) },
  });
}
/* THE SECOND SLUG — a group that is not this project's, in the installer's slug grammar. */
const SECOND = "harbour-watch-coalition";
/* The literals the row names, matched case-insensitively and with any spacing, so a respelling is still caught. */
const LITERALS = [/believe\s*in\s*oakland/i, /believeinoakland\.org/i];
const hasLiteral = (t) => LITERALS.some(re => re.test(String(t || "")));
const NONE_RE = /\bno group\b.*\brecorded\b/i;          // the absence, said in words (not pinned to one spelling)
const SILENT_RE = /could not read (its|the) group/i;    // the silence, said as a silence

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
async function memberSession(mf){
  const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method:"POST", body: JSON.stringify(body) })).json());
  const mk = async (id, role) => {
    const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:["contribute"] }, ADM);
    if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
    const en = await post("enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-1` });
    if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
    const lg = await post("login", { role:`member:${id}`, password:`${id}-passphrase-1` });
    if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
    return lg.token;
  };
  await mk("ruth", "admin"); await mk("gus", "admin");
  return mk("olive", "member");
}

/* ---- ONE LOADED APP per scenario: a fresh DOM stub, a fresh script context, a bridge that records what was SENT. */
const text = (h) => String(h||"").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
function loadApp(fetchImpl){
  const els = new Map();
  function el(){
    const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
      value:"", _html:"", textContent:"", scrollTop:0, disabled:false, checked:false, addEventListener(){},
      querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
      remove(){}, onclick:null, onchange:null, setAttribute(){}, getAttribute(){ return null; } };
    Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
    return e;
  }
  const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
  const SENT = [];
  async function bridge(u, opts){
    const url = new URL(u, "http://x");
    SENT.push({ op: url.searchParams.get("op"), params: Object.fromEntries(url.searchParams.entries()) });
    return fetchImpl(url, opts);
  }
  const ctx = { console:{ log(){}, warn(){}, error(){}, info(){} }, URL, URLSearchParams, JSON, Array, Object, String,
    Number, Math, Date, RegExp, Promise, Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder,
    crypto:webcrypto, Blob:class{}, IntersectionObserver:undefined, setInterval:()=>1, clearInterval(){},
    setTimeout:fn=>{fn();return 1}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
    document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
      documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
      createElement:()=>el(), body:{appendChild(){}} },
    location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
    localStorage:{ getItem:()=>null, setItem(){} }, window:{ addEventListener(){}, open:()=>null },
    fetch:bridge };
  ctx.globalThis = ctx; vm.createContext(ctx);
  vm.runInContext(appScript() + ";globalThis.__U = {PLANE, boot, enterPublished, previewShell, paintGroup,"
    + " get PUB_GROUP(){ return PUB_GROUP; } };", ctx);
  /* The DOM's TEXT, hidden or not: every element the surface touched, its textContent and its innerHTML's text. */
  const domText = () => [...els.entries()].map(([k, e]) => `${k}: ${e.textContent} ${text(e._html)}`).join("\n");
  const at = (s) => { const e = els.get(s); return e ? (String(e.textContent || "") + " " + text(e._html)).trim() : ""; };
  const state = (s) => { const e = els.get(s); return e && e.dataset ? e.dataset.group : undefined; };
  return { U: ctx.__U, SENT, domText, at, state };
}
const mfFetch = (mf) => (url, opts) => mf.dispatchFetch(url.toString(), opts);
const FENCE = ["#m-grp", "#m-idstr"], HEADER = ["#p-gname"];

let exitCode = 1;
const planes = [];
try {
/* ============================================================
   0. THE SERVED MARKUP: the five sites carry no literal, and the three that speak carry the SILENT line
   ============================================================ */
console.log("\n--- the served markup names nobody before any read ---");
{
  const src = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const siteText = (id) => { const m = new RegExp(`<(\\w+)[^>]*\\bid="${id}"[^>]*>([^<]*)</\\1>`).exec(src); return m ? m[2] : null; };
  const sites = ["m-grp", "m-idstr", "p-gname", "p-gid", "p-mono"];
  for(const id of sites) ok(`MARKUP: #${id} is found as a simple element in app.html`, siteText(id) !== null);
  ok(`MARKUP NO-LITERAL: none of the five sites' static text names a group (read: ${JSON.stringify(sites.map(siteText))})`,
     sites.every(id => !hasLiteral(siteText(id))));
  ok("MARKUP SILENT: #m-grp, #m-idstr and #p-gname say, before any read, that the group was not read — never a name",
     ["m-grp", "m-idstr", "p-gname"].every(id => SILENT_RE.test(siteText(id) || "")));
  /* THE CLASS, over the whole served file (comments included, because a comment in a served page IS served): the
     two literals the row names occur nowhere in app.html. What it cannot see: a name assembled at run time from
     parts — which is what the DOM-text arms below read, and what the control's liar arm builds. */
  const hits = LITERALS.map(re => (src.match(new RegExp(re.source, "gi")) || []).length);
  console.log(`  census: app.html ${src.length} characters; literal hits ${JSON.stringify(hits)}`);
  ok(`SOURCE NO-LITERAL: app.html contains neither literal anywhere (hits ${JSON.stringify(hits)})`,
     src.length > 100000 && hits.every(h => h === 0));
}

/* ============================================================
   1. A PLANE RECORDING A SECOND SLUG — signed out, then signed in
   ============================================================ */
console.log(`\n--- a plane recording "${SECOND}": both surfaces show it, signed out and in ---`);
const mfS = plane(SECOND); planes.push(mfS);
{
  const ig = rP(await (await mfS.dispatchFetch("http://x/api/?op=instancegroup")).json());
  ok(`the plane itself answers a stranger the second slug (${JSON.stringify(ig)})`, ig && ig.group === SECOND);
}
const OLIVE = await memberSession(mfS);
{
  /* SIGNED OUT: the public header, holding nothing. */
  const A = loadApp(mfFetch(mfS));
  A.U.enterPublished(true);
  await A.U.PUB_GROUP;
  ok(`SIGNED OUT, HEADER: #p-gname shows the recorded slug (read "${A.at("#p-gname")}")`, A.at("#p-gname") === SECOND);
  ok(`SIGNED OUT, HEADER: the monogram is the slug's own first character (read "${A.at("#p-mono")}")`, A.at("#p-mono") === "H");
  ok("SIGNED OUT, HEADER: no domain is shown — none is verified (§7 point 3)", A.at("#p-gid") === "");
  ok("SIGNED OUT, HEADER: the site is marked recorded", A.state("#p-gname") === "recorded");
  const igSent = A.SENT.filter(s => s.op === "instancegroup");
  ok("SIGNED OUT: the header read op=instancegroup exactly once, holding NO credential",
     igSent.length === 1 && !("token" in igSent[0].params));
  ok(`SIGNED OUT NO-LITERAL: the DOM's text, hidden or not, names neither literal:\n${A.domText()}`, !hasLiteral(A.domText()));
}
{
  /* SIGNED IN: a real member session, through the real boot — the member fence. */
  const B = loadApp(mfFetch(mfS));
  B.U.PLANE.token = OLIVE; B.U.PLANE.session = true;
  let bootErr = null;
  try{ await B.U.boot(); }catch(e){ bootErr = e; }
  ok(`SIGNED IN: boot() completed (${bootErr ? JSON.stringify(bootErr && (bootErr.message || bootErr)).slice(0, 200) : "ok"})`, !bootErr);
  for(const s of FENCE) ok(`SIGNED IN, FENCE: ${s} shows the recorded slug (read "${B.at(s)}")`, B.at(s) === SECOND);
  for(const s of FENCE) ok(`SIGNED IN, FENCE: ${s} is marked recorded`, B.state(s) === "recorded");
  const igSent = B.SENT.filter(s => s.op === "instancegroup");
  ok("SIGNED IN: the fence read op=instancegroup through the member's own credential (the store every other read asks)",
     igSent.length >= 1 && igSent[0].params.token === OLIVE);
  /* ...and the public header, entered WITH a credential held, reads the public answer holding nothing. */
  B.U.enterPublished(true);
  await B.U.PUB_GROUP;
  ok(`SIGNED IN, HEADER: #p-gname shows the recorded slug (read "${B.at("#p-gname")}")`, B.at("#p-gname") === SECOND);
  const pubSent = B.SENT.filter(s => s.op === "instancegroup").slice(1);
  ok("SIGNED IN, HEADER: the public header's read carried NO credential", pubSent.length === 1 && !("token" in pubSent[0].params));
  ok(`SIGNED IN NO-LITERAL: the DOM's text, hidden or not, names neither literal:\n${B.domText().slice(0, 3000)}`, !hasLiteral(B.domText()));
}

/* ============================================================
   2. A PLANE RECORDING NO GROUP — both surfaces SAY so
   ============================================================ */
console.log("\n--- a plane recording no group: both surfaces say so, in words ---");
const mfN = plane(null); planes.push(mfN);
{
  const ig = rP(await (await mfN.dispatchFetch("http://x/api/?op=instancegroup")).json());
  ok(`the plane itself answers that it records none (${JSON.stringify(ig).slice(0, 80)}…)`, ig && ig.ok === true && ig.group === null);
}
const OLIVE_N = await memberSession(mfN);
{
  const A = loadApp(mfFetch(mfN));
  A.U.enterPublished(true);
  await A.U.PUB_GROUP;
  ok(`NONE, SIGNED OUT, HEADER: #p-gname says no group is recorded (read "${A.at("#p-gname")}")`,
     NONE_RE.test(A.at("#p-gname")) && A.state("#p-gname") === "none");
  ok("NONE, HEADER: the monogram and the domain line are empty — nothing stands in for a group", A.at("#p-mono") === "" && A.at("#p-gid") === "");
  ok("NONE NO-LITERAL (signed out)", !hasLiteral(A.domText()));
  const B = loadApp(mfFetch(mfN));
  B.U.PLANE.token = OLIVE_N; B.U.PLANE.session = true;
  let bootErr = null;
  try{ await B.U.boot(); }catch(e){ bootErr = e; }
  ok("NONE, SIGNED IN: boot() completed", !bootErr);
  for(const s of FENCE) ok(`NONE, SIGNED IN, FENCE: ${s} says no group is recorded (read "${B.at(s)}")`,
     NONE_RE.test(B.at(s)) && B.state(s) === "none");
  B.U.enterPublished(true);
  await B.U.PUB_GROUP;
  ok(`NONE, SIGNED IN, HEADER: #p-gname says no group is recorded (read "${B.at("#p-gname")}")`, NONE_RE.test(B.at("#p-gname")));
  ok("NONE NO-LITERAL (signed in)", !hasLiteral(B.domText()));
}

/* ============================================================
   3. A SILENCE IS NOT AN ABSENCE — the read fails three ways
   ============================================================ */
console.log("\n--- a read that fails says it could not read, never that none is recorded ---");
const SILENCES = {
  "the store's own 502": () => new Response(JSON.stringify({ ok:false, error:"STORE_DID_NOT_ANSWER" }), { status:502 }),
  "an older plane refusing a stranger": () => new Response(JSON.stringify({ ok:false, error:"NOT_AUTHENTICATED" }), { status:401 }),
  "a transport that throws": () => { throw new TypeError("fetch failed"); },
};
for(const [how, answer] of Object.entries(SILENCES)){
  const f = (url, opts) => url.searchParams.get("op") === "instancegroup" ? answer() : mfS.dispatchFetch(url.toString(), opts);
  const A = loadApp(f);
  A.U.enterPublished(true);
  await A.U.PUB_GROUP;
  const B = loadApp(f);
  B.U.PLANE.token = OLIVE; B.U.PLANE.session = true;
  try{ await B.U.boot(); }catch(_){}
  const read = [A.at("#p-gname"), ...FENCE.map(s => B.at(s))];
  ok(`SILENCE (${how}): the header and the fence say they could not read the group (read ${JSON.stringify(read)})`,
     read.every(t => SILENT_RE.test(t)));
  ok(`SILENCE (${how}): NEITHER surface says that none is recorded (read ${JSON.stringify(read)})`,
     read.every(t => !NONE_RE.test(t)) && [A.state("#p-gname"), ...FENCE.map(s => B.state(s))].every(x => x === "silent"));
  ok(`SILENCE (${how}): no name stands in — not the slug and no literal`,
     read.every(t => !t.includes(SECOND)) && !hasLiteral(A.domText() + B.domText()));
}

/* ============================================================
   4. PREVIEW HOLDS NO PLANE: it reads nothing and names nobody
   ============================================================ */
console.log("\n--- the preview shell names nobody ---");
{
  const P = loadApp(mfFetch(mfS));
  P.U.previewShell();
  await new Promise(r => setImmediate(r));   /* every microtask the unawaited paint queued has run */
  ok(`PREVIEW: the fence says the group was not read (read ${JSON.stringify(FENCE.map(s => P.at(s)))})`,
     FENCE.every(s => SILENT_RE.test(P.at(s))));
  ok("PREVIEW: op=instancegroup was not asked (preview holds no plane)", !P.SENT.some(s => s.op === "instancegroup"));
  ok("PREVIEW NO-LITERAL", !hasLiteral(P.domText()));
}

exitCode = fails.length ? 1 : 0;
} finally {
  for(const mf of planes) await mf.dispose();
}
console.log(`\ngroup-surface: ${n - fails.length}/${n} assertions passed`);
if(fails.length){ console.error(`group-surface: ${fails.length} of ${n} assertions FAILED`); }
process.exit(exitCode);
