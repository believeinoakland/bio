/* NEGATIVE CONTROL: `node civicos-ui/test/authored-group.control.mjs` (from the repo root) — a BASELINE and three arms,
 * each mutating `civicos-ui/app.html` ALONE on disk, restored and verified by sha256 AND `cmp` against a per-arm pristine
 * copy. Declared before arming: BASELINE -> GREEN · (A) THE ROW'S CONTROL, one `meta.group` literal restored in `addGo`
 * -> RED, "PLANTED-SLUG (SENT) — the Add surface, a typed note" failing BY NAME while "PLANTED-SLUG (HELD)" for the same
 * drive does NOT fail (the plane stamps over a caller) · (B) THE LIAR, a different hard-coded slug in `mdFor`'s bytes ->
 * RED, "PLANTED-SLUG (SENT) — the proposal adoption" failing by name while "SOURCE NO-LITERAL" stays GREEN · (C)
 * OVER-STRICTNESS, a comment inside the meta -> GREEN.
 *   RUN 2026-09-23 by UI-79 against app.html b2cedae2… (1,411,534 bytes), every arm restored and verified by sha256 and
 *   `cmp`, the file IDENTICAL to pristine at the end — 4/4 AS DECLARED: BASELINE GREEN 40/40 · (A) RED 31/40, both
 *   `addGo` SENT arms, SOURCE NO-LITERAL, SOURCE NO-PLACE, WRITER addGo and three NONE arms failing (on a store recording
 *   none the literal is kept as the caller's statement, so the creation is WRITTEN — the defect's own consequence) ·
 *   (B) RED 32/40, all three SENT arms, MDFOR and the three NONE arms failing, the literal census GREEN · (C) GREEN 40/40.
 *   RE-RUN 2026-09-25 by UI-70 after its correction (the project drive ticks the setting a member chooses): 4/4 AS
 *   DECLARED, the same figures (40/40 · 31/40 · 32/40 · 40/40), app.html ef1d85cc… (1,625,805 bytes) restored IDENTICAL.
 */
/* =========================================================================
 * UI-79 — THE MEMBER UI COMPOSES NO PRODUCING GROUP: A BUNDLE IT AUTHORS CARRIES THE GROUP THE INSTANCE RECORDS.
 * Design: the State Rules document (`BIO_State_Rules_Consistency_v1_5.md`, named WITHOUT its directory on purpose: this
 * suite reads no prose, and the gate's selector makes a suite that spells that directory doc-facing — and one that names
 * the selector's own file a reader of every path it walks — which put this suite in every prose-only landing's
 * selection: measured by `statepaths.test.mjs`, 61 units against its ceiling of 60)
 * §3.1 and its D-436 amendment (a bundle's `group` is
 * the ONE recorded value per instance, stamped by the plane into every creation, never a literal), with DEC-8 (a
 * surface invents nothing). Consumes IC-172 (`op=promote` stamps the recorded group; `op=instancegroup` reads it).
 *
 * THE DEFECT: `app.html` wrote one group's slug as a literal into every document it composed (`mdFor`'s `group:` line)
 * and into three `op=promote` metas, and named that group's city in the FY glossary entry and the Add form's
 * placeholder. `newgroup` installs this file into every sovereign group's account, so every instance's member UI stated
 * THIS project's group as the producer of what its members wrote.
 *
 * NO MOCK OF THE WRITE. The plane runs in miniflare from `bio-plane/src/index.mjs` — the real control plane, the real
 * Durable Object — and `app.html`'s own `fetch` is bridged to it, recording every request AS THE PLANE RECEIVED IT.
 *   PLANTED — a store whose first boot bound `INSTANCE_NAME` to a slug DRAWN AT RANDOM PER RUN (the row's "plane
 *             recording a SECOND slug"): every creation the surface authors is held carrying that slug;
 *   NONE    — a store recording no group: the surface's creation is refused C-64.1 in the plane's own words, and
 *             nothing is written.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks: HARD-CODE A DIFFERENT SLUG. The plane stamps its
 * recorded group over whatever a caller says, so "the held bundle carries the recorded slug" passes a surface that
 * still composes a literal. So the slug is PLANTED at random, and the arm that decides is the one reading what the
 * surface SENT: every group it states, in its bytes or its meta, must be the planted one or absent — and a surface that
 * cannot know a random slug in advance can only pass by stating none. The held-bytes arms are asserted too, because a
 * surface that sends nothing and a plane that stamps nothing would also agree on "no literal".
 *
 * WHAT THIS CANNOT SEE, stated: the revision path `reviseWithCapture` is judged at its SOURCE (its promote `meta`
 * names no group) and not driven — it needs a captured subresource set, and a revision's `meta.group` is not read by
 * the plane at all (IC-172); a page as a browser lays it out; any served UI file but `app.html`; and a live instance
 * (Cloudflare is not reachable from this environment, so live verification is UNDETERMINED, not claimed). The comment
 * stripper models strings, nested template literals and regular-expression literals by a heuristic, not a parser; its
 * corpus is printed and floored, and the Oakland lines it leaves in CODE must equal the declared recogniser list exactly,
 * so a mis-strip shows up as a count, not as silence.
 *
 * A VACUOUS ARM THIS SUITE SHIPPED WITH, AND WHAT CAUGHT IT: the first full gate (tree 045580b2) went RED at
 * `op-claims.test.mjs`, which found this file asking the plane for an op named `record` — which does not exist. The NONE arm "the record
 * holds no bundle" had read the refusal as an empty list and passed over nothing. It now asks `op=list` (the read the
 * UI's own `loadRecord` makes), and the same read of the PLANTED plane must list what the drives wrote, so an answer
 * that cannot see a write cannot read as "none".
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard the writer's
   own output. SHARED from the plane's test estate; census: `stdio-census.test.mjs`. */
import fs from "fs";
import vm from "vm";
import { webcrypto, randomBytes } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { appScript } from "./extract.mjs";
import { INSTANCE_GROUP_CHECKS } from "../../bio-plane/checks/bio-checks.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } }

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("authored-group: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/. " + String(e && e.message || e));
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const ADM = "adm-ui79", MEM = "mem-ui79", PRB = "prb-ui79";
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

/* THE PLANTED SLUG — drawn per run, in the installer's slug grammar, so no literal anywhere can equal it by design. */
const letters = [...randomBytes(8)].map(b => "abcdefghijklmnopqrstuvwxyz"[b % 26]).join("");
const PLANTED = `ward-${letters}-watch`;
/* The literals the row names, matched case-insensitively and across any separator, so a respelling is caught. */
const LITERAL_RE = /believe[\s_-]*in[\s_-]*oakland/i;
const PLACE_RE = /oakland/i;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
async function members(mf){
  const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
    `http://x/api/?op=${op}${tok ? "&token=" + tok : ""}`, { method:"POST", body: JSON.stringify(body) })).json());
  const mk = async (id, role, caps) => {
    const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, ADM);
    if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
    const en = await post("enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-1` });
    if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
    const lg = await post("login", { role:`member:${id}`, password:`${id}-passphrase-1` });
    if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
    return lg.token;
  };
  await mk("ruth", "admin", ["contribute"]); await mk("gus", "admin", ["contribute"]);
  return mk("olive", "member", ["contribute", "create_projects"]);
}
const readAs = (mf, tok) => async (op, qs) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}${qs ? "&" + qs : ""}`)).json());

/* ---- ONE LOADED APP per plane: a DOM stub, a script context, a bridge that records what was SENT. ---- */
const text = (h) => String(h||"").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
function loadApp(mf, token){
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
    let body = null;
    if(opts && typeof opts.body === "string"){ try{ body = JSON.parse(opts.body); }catch(_){ body = opts.body; } }
    SENT.push({ op: url.searchParams.get("op"), params: Object.fromEntries(url.searchParams.entries()), body });
    return mf.dispatchFetch(url.toString(), opts);
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
  vm.runInContext(appScript() + ";globalThis.__U = {PLANE, addGo, renderAdd, doProposalAdopt, mdFor, GLOSSARY,"
    + " ADD_TYPES, FIRST_STATE, vocabFor};", ctx);
  const U = ctx.__U;
  U.PLANE.token = token; U.PLANE.session = true;
  U.PLANE.me = { member:"olive", handle:"olive", session:true, administer:false, capabilities:["contribute", "create_projects"] };
  /* openBundle is replaced by a recorder: the page it would draw is not this suite's subject, the id it opens is. */
  const OPENED = [];
  ctx.__open = async (id) => { OPENED.push(id); };
  vm.runInContext("openBundle = globalThis.__open;", ctx);
  /* Everything the surface wrote, RAW (attributes such as a placeholder included) and as text. */
  const surface = () => [...els.entries()].map(([k, e]) => `${k}: ${e.textContent} ${e._html}`).join("\n");
  return { U, ctx, SENT, $$, surface, OPENED };
}

/* What the surface SENT about a producing group, on every promote: its bytes' top-level `group:` and its meta's group. */
const fmOf = (md) => { const s = String(md||""); if(!s.startsWith("---\n")) return ""; const e = s.indexOf("\n---", 4); return e < 0 ? "" : s.slice(4, e); };
const groupLine = (md) => { const m = /^group:[ \t]*(.*)$/m.exec(fmOf(md)); return m ? m[1].trim().replace(/^["']|["']$/g, "") : null; };
function statedGroups(SENT){
  const out = [];
  for(const s of SENT.filter(x => x.op === "promote")){
    const md = s.body && Array.isArray(s.body.files) ? (s.body.files.find(f => f && f.path === "bundle.md") || {}).text : null;
    out.push({ bytes: groupLine(md), meta: s.body && s.body.meta && "group" in s.body.meta ? s.body.meta.group : null });
  }
  return out;
}

let exitCode = 1;
const planes = [];
try {
/* ============================================================
   0. THE SOURCE: no literal anywhere; Oakland only where a recogniser measured it; every writer names no group
   ============================================================ */
console.log("\n--- the source composes no group and names no place ---");
{
  const src = fs.readFileSync(new URL("../app.html", import.meta.url), "utf8");
  const litHits = (src.match(new RegExp(LITERAL_RE.source, "gi")) || []).length
                + (src.match(/believeinoakland/gi) || []).length;
  console.log(`  census: app.html ${src.length} characters; literal hits ${litHits}`);
  ok(`SOURCE NO-LITERAL: app.html names the old group's slug nowhere, comments included (hits ${litHits})`,
     src.length > 100000 && litHits === 0);

  /* The comment stripper: surface-registry's, made NEWLINE-PRESERVING (line numbers survive) and taught REGULAR-EXPRESSION
     LITERALS — without them a quote inside a regex (`/["']/`) flips the string state and the rest of the file is read
     inside-out, comments as code (measured on the first run of this suite: 20 comment lines reported as code). A `/`
     opens a regex where an expression may START: after an operator or opening bracket, or after `return`/`typeof`.
     And TEMPLATE NESTING: a `${…}` inside a template literal is code again, and may hold a template of its own (the
     second run of this suite desynced at the first nested one, `recordRows`). A stack of brace depths carries it.
     Pinned before it is used. */
  const strip = (s) => { let out = "", i = 0, inS = null, prev = ""; const N = s.length; const tpl = [];
    while(i < N){ const c = s[i], d = s[i+1];
      if(inS){ if(c === "\\"){ out += c + (d||""); i += 2; continue; }
        if(inS === "`" && c === "$" && d === "{"){ tpl.push(0); inS = null; out += "${"; i += 2; prev = "{"; continue; }
        if(c === inS){ inS = null; prev = "a"; } out += c; i++; continue; }
      if(tpl.length && c === "{"){ tpl[tpl.length - 1]++; }
      if(tpl.length && c === "}"){ if(tpl[tpl.length - 1] === 0){ tpl.pop(); inS = "`"; out += c; i++; continue; } tpl[tpl.length - 1]--; }
      if(c === '"' || c === "'" || c === "`"){ inS = c; out += c; i++; continue; }
      if(c === "/" && d === "*"){ const e = s.indexOf("*/", i+2); const seg = s.slice(i, e < 0 ? N : e+2); out += seg.replace(/[^\n]/g, " "); i = e < 0 ? N : e+2; continue; }
      if(c === "/" && d === "/"){ const e = s.indexOf("\n", i); i = e < 0 ? N : e; out += " "; continue; }
      if(c === "/" && (prev === "" || /[(,=:[!&|?{};+\-*%<>~^]/.test(prev) || /(?:^|[^\w$])(?:return|typeof)\s*$/.test(out.slice(-12)))){
        let j = i + 1, cls = false;
        while(j < N && s[j] !== "\n"){ const x = s[j]; if(x === "\\"){ j += 2; continue; }
          if(cls){ if(x === "]") cls = false; } else if(x === "[") cls = true; else if(x === "/") break; j++; }
        if(j < N && s[j] === "/"){ j++; while(j < N && /[a-z]/.test(s[j])) j++; out += s.slice(i, j); i = j; prev = "a"; continue; }
      }
      if(!/\s/.test(c)) prev = c;
      out += c; i++; }
    return out; };
  const probe = strip(`const a = 1; /* c1 \n Oakland */ const b = "/* keep */"; // c2\nconst r = /["'\`]/g; x = a / 2; /* c3 */\n`
    + "const t = `a ${f ? `in ${g({k:1})} /* k2 */` : \"\"} b`; /* c4 */\nconst c = 3;");
  ok("the stripper removes comments, keeps strings, regex literals, nested templates and code, and keeps line numbers",
     !probe.includes("c1") && !probe.includes("c2") && !probe.includes("c3") && !probe.includes("c4") && probe.includes('"/* keep */"')
     && probe.includes("/[\"'`]/g") && probe.includes("x = a / 2") && probe.includes("/* k2 */") && probe.includes("const c = 3")
     && probe.split("\n").length === 5);
  const script = appScript();
  const code = strip(script);
  ok(`the stripped corpus is real (${code.length} of ${script.length} characters)`, code.length > script.length * 0.4);
  const codeLines = code.split("\n");
  const placeInCode = codeLines.map((l, i) => [i + 1, l.trim()]).filter(([, l]) => PLACE_RE.test(l));
  const placeInComments = script.split("\n").filter((l, i) => PLACE_RE.test(l) && !PLACE_RE.test(codeLines[i] || "")).length;
  /* THE LEFT LIST, declared: each is a RECOGNISER heuristic measured on that city's own documents — page furniture a
     published PDF repeats, and the municipal-code citation form — and none is the surface naming a group. */
  const RECOGNISERS = [
    [/^\/\^City of Oakland\$\/i,$/, 2, "page furniture a published PDF repeats (two recognisers' furniture lists)"],
    [/^const CODE_REF = \/.*Oakland\\s\+Municipal\\s\+Code/, 1, "the municipal-code citation form (CODE_REF)"],
    [/^const REG_CODE_REF = \/.*Oakland\\s\+Municipal\\s\+Code/, 1, "the municipal-code citation form (REG_CODE_REF)"],
  ];
  console.log(`  census: ${placeInCode.length} code line(s) name the place, ${placeInComments} comment line(s) do (provenance of measurements; not the surface)`);
  for(const [ln, l] of placeInCode) console.log(`    code ${ln}: ${l.slice(0, 120)}`);
  const unexplained = placeInCode.filter(([, l]) => !RECOGNISERS.some(([re]) => re.test(l)));
  ok(`SOURCE NO-PLACE: every code line naming the place is a declared recogniser (unexplained: ${JSON.stringify(unexplained)})`,
     unexplained.length === 0);
  for(const [re, want, why] of RECOGNISERS){
    const got = placeInCode.filter(([, l]) => re.test(l)).length;
    ok(`the declared recogniser is still there, ${want}× — ${why} (found ${got})`, got === want);
  }
  /* The markup a member is served outside the script, and every placeholder anywhere in the file. */
  const markup = src.replace(/<script>[\s\S]*?<\/script>/g, " ");
  ok("MARKUP NO-PLACE: the served markup outside the script names no place", !PLACE_RE.test(markup) && !LITERAL_RE.test(markup));
  const placeholders = [...src.matchAll(/placeholder="([^"]*)"/g)].map(m => m[1]);
  console.log(`  census: ${placeholders.length} placeholder(s) read`);
  ok(`PLACEHOLDERS NO-PLACE: none of ${placeholders.length} placeholders names a place (${JSON.stringify(placeholders.filter(p => PLACE_RE.test(p)))})`,
     placeholders.length >= 10 && placeholders.every(p => !PLACE_RE.test(p)));

  /* THE WRITERS: every function that promotes is one of the three this suite knows, and none states a group in its meta. */
  const fnBody = (name) => { const m = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`).exec(code); if(!m) return null;
    const i = code.indexOf("{", m.index); let d = 0; for(let p = i; p < code.length; p++){ const c = code[p];
      if(c === "{") d++; else if(c === "}"){ d--; if(d === 0) return code.slice(i, p + 1); } } return null; };
  const writers = [...code.matchAll(/(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(m => m[1])
    .filter((nm, i, a) => a.indexOf(nm) === i).filter(nm => /recPostR\(\s*"promote"/.test(fnBody(nm) || ""));
  ok(`the promote writers are exactly addGo, doProposalAdopt and reviseWithCapture (read: ${JSON.stringify(writers.sort())})`,
     JSON.stringify(writers.sort()) === JSON.stringify(["addGo", "doProposalAdopt", "reviseWithCapture"]));
  for(const w of writers){
    const b = fnBody(w);
    const metas = [...b.matchAll(/meta\s*:\s*\{([^}]*)\}/g)].map(m => m[1]);
    ok(`WRITER ${w}: its promote meta names no group (${metas.length} meta literal(s) read)`,
       metas.length >= 1 && metas.every(m => !/\bgroup\s*:/.test(m)));
  }
}

/* ============================================================
   1. A PLANE RECORDING A PLANTED SLUG — what the surface authors carries it, and the surface sent none of its own
   ============================================================ */
console.log(`\n--- a plane recording the planted slug "${PLANTED}" ---`);
const mfP = plane(PLANTED); planes.push(mfP);
{
  const ig = rP(await (await mfP.dispatchFetch("http://x/api/?op=instancegroup")).json());
  ok(`the plane itself records the planted slug (${JSON.stringify(ig).slice(0, 160)})`, ig && ig.group === PLANTED);
}
const OLIVE = await members(mfP);
const readP = readAs(mfP, OLIVE);
const A = loadApp(mfP, OLIVE);
const heldGroup = async (id) => {
  const img = await readP("image", "id=" + encodeURIComponent(id));
  const md = img && img["bundle.md"];
  const pj = await readP("projection", "id=" + encodeURIComponent(id));
  const row = pj && (pj.projection || pj.bundle || pj);
  return { bytes: typeof md === "string" ? groupLine(md) : undefined, projection: row ? row.group_id : undefined };
};

/* The mdFor bytes of every type the Add surface offers name no group. */
{
  const types = A.U.ADD_TYPES.map(([v]) => v);
  const withGroup = types.filter(t => /^group:/m.test(fmOf(A.U.mdFor("X-1", t, A.U.vocabFor(A.U.FIRST_STATE, t), "t", "b", "2026-09-23T00:00:00Z"))));
  ok(`MDFOR: the bytes composed for each of ${types.length} Add types name no group (named: ${JSON.stringify(withGroup)})`,
     types.length >= 3 && withGroup.length === 0);
}

const drives = [
  ["the Add surface, a typed note (information)", async () => {
    A.$$("#a-type").value = "information"; A.$$("#a-title").value = "What the ward office said";
    A.$$("#a-body").value = "Heard at the counter."; A.$$("#a-loc").value = ""; A.$$("#a-auth").value = "";
    await A.U.addGo(); return A.OPENED[A.OPENED.length - 1]; }],
  ["the Add surface, a project (the plane mints its id)", async () => {
    A.$$("#a-type").value = "project"; A.$$("#a-title").value = "The ward's paving money";
    A.$$("#a-body").value = "Where it went.";
    /* CORRECTED 2026-09-25 BY UI-70 (REC-197; Membership v2 §7.14), never exempted: a project's creator now
       CHOOSES discoverable or hidden, neither preselected, and the Add surface sends nothing until they have —
       so this drive, which created a project without choosing, reached no op=promote at all. It ticks the
       choice a member makes; this suite's subject (the group the surface states) is unchanged by it. */
    A.$$("#a-vis-hidden").checked = true;
    await A.U.addGo(); return A.OPENED[A.OPENED.length - 1]; }],
  ["the proposal adoption", async () => {
    vm.runInContext(`PROP_ADOPT_CTX = { key:"k1", kind:"inquiry", proposal:{ key:"k1", progression_label:"Budget cycle",
      stage_label:"Adoption", n:2, instances:[{ entity_label:"Fund A" }, { entity_label:"Fund B" }] } };`, A.ctx);
    A.$$("#ad-title").value = "Was the paving money adopted?"; A.$$("#ad-statement").value = "I am pursuing whether it was.";
    const r = await A.U.doProposalAdopt(); return r && r.ok ? r.id : null; }],
];
for(const [label, drive] of drives){
  A.SENT.length = 0;
  let id = null, err = null;
  try{ id = await drive(); }catch(e){ err = e; }
  const rendered = text(A.$$("#a-err")._html) + " " + text(A.$$("#ad-err")._html);
  ok(`${label}: the plane accepted the creation (rendered: "${rendered.trim()}"${err ? `; threw ${String(err && err.message || err)}` : ""})`,
     typeof id === "string" && id.length > 0);
  const stated = statedGroups(A.SENT);
  ok(`${label}: the surface reached op=promote (${stated.length} sent)`, stated.length >= 1);
  ok(`PLANTED-SLUG (SENT) — ${label}: every group the surface STATED, in its bytes or its meta, is the planted slug or none (stated: ${JSON.stringify(stated)})`,
     stated.length >= 1 && stated.every(s => (s.bytes === null || s.bytes === PLANTED) && (s.meta === null || s.meta === PLANTED)));
  if(typeof id === "string"){
    const h = await heldGroup(id);
    ok(`PLANTED-SLUG (HELD) — ${label}: the bundle it authored carries the planted slug in its bytes (read ${JSON.stringify(h.bytes)})`, h.bytes === PLANTED);
    ok(`PLANTED-SLUG (PROJECTION) — ${label}: the record's projection names the planted slug (read ${JSON.stringify(h.projection)})`, h.projection === PLANTED);
  }
}

/* What a member sees: the Add form as rendered (its placeholder is an attribute a member reads), and the glossary. */
{
  try{ await A.U.renderAdd(); }catch(e){ ok(`renderAdd ran (${String(e && e.message || e)})`, false); }
  const form = A.$$("#content")._html;
  ok("the Add form was rendered, and it carries the issuer field", /id="a-auth"/.test(form));
  const surface = A.surface();
  ok(`RENDERED NO-PLACE: everything the surface wrote, raw markup and attributes included, names neither the place nor the old slug (${surface.length} characters)`,
     surface.length > 1000 && !PLACE_RE.test(surface) && !LITERAL_RE.test(surface));
  const gloss = Object.entries(A.U.GLOSSARY);
  ok(`GLOSSARY NO-PLACE: none of ${gloss.length} glossary entries names a place (${JSON.stringify(gloss.filter(([, v]) => PLACE_RE.test(v)).map(([k]) => k))})`,
     gloss.length >= 5 && gloss.every(([, v]) => !PLACE_RE.test(v)));
  ok("GLOSSARY: FY is still explained", typeof A.U.GLOSSARY.FY === "string" && /fiscal year/i.test(A.U.GLOSSARY.FY));
}

/* ============================================================
   2. A PLANE RECORDING NO GROUP — the surface does not supply one; the plane refuses, in its own words
   ============================================================ */
console.log("\n--- a plane recording no group: the creation is refused in the plane's words, and nothing is written ---");
const mfN = plane(null); planes.push(mfN);
{
  const OLIVE_N = await members(mfN);
  const B = loadApp(mfN, OLIVE_N);
  B.$$("#a-type").value = "information"; B.$$("#a-title").value = "A note with no group to name";
  B.$$("#a-body").value = "Written on a store that records none."; B.$$("#a-loc").value = "";
  await B.U.addGo();
  const pr = B.SENT.filter(s => s.op === "promote");
  const rendered = text(B.$$("#a-err")._html);
  const tr = INSTANCE_GROUP_CHECKS.GROUP_UNDETERMINED.translation;
  ok("NONE: the surface reached op=promote and stated no group of its own",
     pr.length === 1 && statedGroups(B.SENT).every(s => s.bytes === null && s.meta === null));
  ok(`NONE: the member reads the plane's canned translation of C-64.1, not a bare code (rendered: "${rendered}")`,
     typeof tr === "string" && tr.length > 20 && rendered.includes(text(tr).slice(0, 60)));
  ok("NONE: nothing was opened as though written", B.OPENED.length === 0);
  /* The record's list (op=list, the read the UI's own loadRecord makes), asked of BOTH planes: the planted one must list
     what the drives wrote, so an answer that is not a list, or a list that cannot see a write, cannot read as "none". */
  const listOf = async (mf, tok) => rP(await (await mf.dispatchFetch(`http://x/api/?op=list&token=${tok}`)).json());
  const planted = await listOf(mfP, OLIVE);
  ok(`the planted plane's op=list is a list and sees the three bundles the drives wrote (read ${Array.isArray(planted) ? planted.length : JSON.stringify(planted).slice(0, 120)})`,
     Array.isArray(planted) && planted.length >= 3);
  const rows = await listOf(mfN, OLIVE_N);
  ok(`NONE: the record holds no bundle (read ${Array.isArray(rows) ? rows.length : JSON.stringify(rows).slice(0, 120)})`,
     Array.isArray(rows) && rows.length === 0);
  ok("NONE NO-PLACE: the refusal as rendered names neither the place nor the old slug",
     !PLACE_RE.test(B.surface()) && !LITERAL_RE.test(B.surface()));
}

exitCode = fails.length ? 1 : 0;
} finally {
  for(const mf of planes) await mf.dispose();
}
console.log(`\nauthored-group: ${n - fails.length}/${n} assertions passed`);
if(fails.length){ console.error(`authored-group: ${fails.length} of ${n} assertions FAILED`); }
process.exit(exitCode);
