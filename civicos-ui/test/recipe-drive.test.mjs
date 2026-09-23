/* D-434 PART 1 — A PUBLISHED RECIPE IS DRIVEN END TO END AGAINST THE REAL PLANE, AND IT COMPLETES.
 *
 * DESIGN: `docs/development/INVESTIGATIVE-SESSION.md` §0 · Vocabulary — the grouping of a question's reasons is
 * "the analyst's and schema's term … and is never a surface word" (DEC-32 clause 1). The recipe
 * `RECIPES[capture-a-document-and-ground-a-question-on-it]` (civicos-ui/app.html, the SURFACES block), whose goal is
 * to bring a document in from outside and put it under an existing question, ended on `op=inquiryground` — the op
 * that authors DEC-32's grouping over legs a question ALREADY rests on (`groundInquiry`, bio-plane's store), which
 * refuses NO_BASIS when there are none. So the record's own published path REFUSED the member at its last step on a
 * question resting on nothing, and on a question with legs it regrouped them and put the captured document under
 * NOTHING. The act that puts a document under a question is `op=cite`, carried on the DOCUMENT's page.
 *
 * WHY THIS SUITE DRIVES INSTEAD OF READING. The row's liar is a `why` edited to match the wrong op: text agrees with
 * text for free, so no step here is judged by its words. The recipe is READ OUT OF app.html AS DATA (the same
 * SURFACES block the registry suite evaluates, taken from the runtime), and every step it names is PERFORMED against
 * the REAL plane — miniflare running `bio-plane/src/index.mjs`, the real Durable Object and SQLite — as a signed-in
 * member performs it on the step's own surface. A step passes only on the PLANE's answer; the recipe passes only when
 * its GOAL holds afterwards, read back independently.
 *
 * HOW EACH STEP IS PERFORMED — one binding per (surface, op) PAIR, each mirroring the call in app.html that the
 * member's click reaches, and sent through app.html's OWN transport seams (`actAsk`, `intentAsk`, `recPostR`), so
 * the request is the surface's and never a copy of it:
 *   add/acquire            the Add surface's own act, `addGo()`: it fetches (op=acquire) and files what it fetched
 *                          (op=allocid, op=promote). Performed WHOLE, because the filing is several plane calls this
 *                          harness must not re-implement. JUDGED on the plane's answer to op=acquire, off the bridge.
 *   bundle/projection      the document page's read of what the record made of the capture (`getProjection`'s call).
 *   bundle/cite            the document page's cite act as `doCite` sends it: op=select over the document, then
 *                          op=cite into the question, with a role the member picks from the plane's published list.
 *   inquiry/inquiryground  the question page's grouping act as `doElicit` sends it: op=inquiryground carrying the one
 *                          set `elicLabel` files over every leg the question holds (none, on a fresh question). KEPT
 *                          although no recipe names it once D-434 lands: it is the op the recipe named, and the
 *                          negative control restores it — so the defect is caught by the PLANE's own refusal rather
 *                          than by this harness not knowing the op.
 *   any other pair         FAILS, naming the pair. A step this suite cannot perform is a step it cannot vouch for.
 * For an ACT the plane must also PUBLISH it (op=affordances, then the page's own `actReachable`) on the object whose
 * page the member is on. A capability the record does not publish is ABSENT from that page, never greyed, so a
 * recipe routing the member to it routes them to nothing.
 *
 * THE GOAL, read back through op=image and the plane's own frontmatter parser: the question's basis carries a leg on
 * the captured document, and every leg it rested on before is still there. DRIVEN OVER TWO EXISTING QUESTIONS,
 * because the defect had two halves — one resting on nothing (the member was refused), and one already resting on a
 * leg (the step "succeeded" and put the document under nothing).
 *
 * ONE SECONDARY CHECK, over the words and never instead of the drive: the goal and every step's `why` are what
 * ASSISTANT-PILOT.md §3's wizard renders ("the why in one sentence"), so §0 binds them — no word of the analyst
 * vocabulary, judged by the ONE derived family (`analyst-vocabulary.mjs`), never by a list written here. The recipe's
 * `id` is NOT judged: nothing renders it (the registry suite asserts the SURFACES block is never rendered), it is the
 * handle the queue and the ledgers cite, and renaming it is not this item's — it is named in D-434's report.
 *
 * WHAT THIS DOES NOT COVER, stated so a green run is not read as more: it drives ONE recipe. PART 2 of D-434 — an arm
 * asking of EVERY recipe step whether its op can perform the step's act — is NOT placed and is not built here.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/recipe-drive.control.mjs` — a BASELINE and five arms, each mutating
 * civicos-ui/app.html ALONE on disk (one anchored replacement asserted to match exactly once), restored from a
 * per-arm pristine copy and verified by sha256 AND `cmp`. Declared BEFORE arming: BASELINE -> GREEN; (A) the last
 * step RESTORED to `op=inquiryground` with its original words -> RED, a failing line naming the plane's NO_BASIS;
 * (B) THE LIAR — `op=inquiryground` kept, the `why` rewritten to describe citing -> RED, naming NO_BASIS; (C) THE
 * HALF-FIX — `op=cite` with the surface left at `inquiry` -> RED, naming the unperformable pair; (D) the last step
 * DELETED (every remaining step completes) -> RED, naming the GOAL; (E) OVER-STRICTNESS — cite, then group, the split
 * the row itself names -> GREEN. RUN 2026-09-21 by D-434's worker: 6/6 AS DECLARED — BASELINE 25/25, (A) 19/25 and
 * (B) 20/25 each failing on "REFUSED NO_BASIS" (and (B) on no vocabulary line), (C) 17/23 on NO SUCH PAIR, (D) 18/20
 * on both GOAL lines, (E) 30/30; app.html restored by sha256 and `cmp` after every arm. The per-arm lines are in the
 * control driver's header.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: a writer's own exit must not discard the writer's
   own output. SHARED from the plane's test estate; census: `stdio-census.test.mjs`. */
import fs from "fs";
import vm from "vm";
import { webcrypto, createHash } from "crypto";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { appScript } from "./extract.mjs";
import { parseFrontmatter } from "../../bio-plane/checks/bio-checks.mjs";
import { analystHits, reachLine } from "./analyst-vocabulary.mjs";

let n = 0; const fails = [];
function ok(msg, cond){ n++; if(!cond){ fails.push(msg); console.error("  FAIL", msg); } else console.log("  PASS", msg); }

const RECIPE_ID = "capture-a-document-and-ground-a-question-on-it";

/* ---- the REAL plane, in miniflare, resolved from bio-plane's own dev dependency. Not installed is a FAILURE,
   never a skip: this suite's whole point is that nothing the recipe does is mocked. ---- */
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try{ ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch(e){
  console.error("recipe-drive: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/. " + String(e && e.message || e));
  process.exit(1);
}

/* The documents the recipe's first step fetches, served by `outboundService` so the plane's real fetch path runs
   without the network (acquire.test.mjs's instrument). One address per capture, each with its own bytes: a second
   capture of the SAME bytes is the Add surface's "already held" branch, which is a different path. Everything else
   the plane fetches (the timestamp authorities `addGo` asks) is answered 500 and recorded as a failed attempt, which
   the Add surface carries on from by design. */
const HOST = "www.oaklandca.gov";
const served = (p) => `The Sewer Fund transfer memo (${p}). Served for D-434's recipe drive; the words are the fixture's.\n`;
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d434", MEMBER_TOKEN: "mem-d434", PROBE_TOKEN: "prb-d434", VERSION: "test",
              /* D-95's precedent (acquire.test.mjs): this suite is about a recipe, not pacing. */
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0",
              /* CORRECTED 2026-09-23 BY UI-79 (D-436, IC-172; State Rules §3.1), never exempted. This plane recorded NO
                 producing group, and its seeds stated one group's slug as a LITERAL in their bytes and their meta — the pin
                 the member UI carried, true of one instance and false of every instance `newgroup` installs. A store's
                 producing group is ONE recorded value, written at its FIRST BOOT from the slug the installer binds, and the
                 plane stamps it into every creation whatever a caller says; so the store records one here, the way every
                 installed store does, and the seeds name none. The slug is deliberately no real group's. */
              INSTANCE_NAME: "fixture-group" },
  outboundService(request){
    const u = new URL(request.url);
    if(u.hostname === HOST && u.pathname.startsWith("/d434/"))
      return new Response(served(u.pathname), { headers: { "content-type": "text/plain" } });
    return new Response("unscripted", { status: 500 });
  },
});
let exitCode = 1;
try {
/* Direct plane calls, for SEEDING the precondition and for INDEPENDENT read-back only. Every step the recipe names
   goes through app.html's own seams and the bridge below. */
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method:"POST", body: JSON.stringify(body) })).json());
const get = async (op, qs, tok) => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* A REAL ENROLLED MEMBER, signed in with a SESSION (project-id-surface's instrument). This matters to the drive and
   is not ceremony: the grouping act refuses a MACHINE credential before it reads anything (MACHINE_CANNOT_GROUND),
   so a drive run under a bearer token would meet that refusal and never the one this item is about. */
const member = async (id, caps, role = "member") => {
  const add = await post("memberadd", { memberId:id, cover:`cover for ${id}`, role, capabilities:caps }, "adm-d434");
  if(!add || !add.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await post("enroll", { invite:add.invite, handle:id, password:`${id}-passphrase-1` });
  if(!en || !en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await post("login", { role:`member:${id}`, password:`${id}-passphrase-1` });
  if(!lg || !lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await member("ruth", ["contribute"], "admin");
await member("gus",  ["contribute"], "admin");
const NINA = await member("nina", ["contribute"]);

/* ---- the DOM stub (project-id-surface's shape) ---- */
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
const text = (h) => String(h||"").replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();

/* ---- the bridge: every request the surface makes, recorded with the plane's ANSWER. The answer is read from a
   CLONE, so the surface still receives the real Response whole (the envelope probe's own rule). ---- */
const SENT = [];
async function bridgeFetch(u, opts){
  const url = new URL(u, "http://x");
  const params = Object.fromEntries(url.searchParams.entries());
  let body = null;
  if(opts && typeof opts.body === "string"){ try{ body = JSON.parse(opts.body); }catch(_){ body = opts.body; } }
  const res = await mf.dispatchFetch(url.toString(), opts);
  let answer = null;
  try{ answer = JSON.parse(await res.clone().text()); }catch(_){ answer = null; }
  SENT.push({ op: params.op, params, body, status: res.status, answer });
  return res;
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
  "PLANE", "RECIPES", "SURFACES", "addGo", "actAsk", "intentAsk", "recPostR", "actsFor", "actNamed",
  "actReachable", "loadActSource", "actVocab", "elicLabel",
].join(",") + "};", ctx);
const U = ctx.__U;
/* The document page is not the Add surface's act, and the recipe's NEXT step is what reads it — so `openBundle` is
   REPLACED by a recorder here: the id the Add surface opens is the capture this drive carries forward. */
const OPENED = [];
vm.runInContext("openBundle = globalThis.__openBundleSpy;", Object.assign(ctx, {
  __openBundleSpy: async (id) => { OPENED.push(id); } }));

U.PLANE.token = NINA;
U.PLANE.session = true;
U.PLANE.me = { member:"nina", handle:"nina", session:true, administer:false, capabilities:["contribute"] };

/* THE RECIPE, AS THE RUNTIME HOLDS IT. JSON round-tripped because values built in the vm realm carry its prototypes
   (the registry suite paid for that once and wrote it down). */
const RECIPES = JSON.parse(JSON.stringify(U.RECIPES || []));
const recipe = RECIPES.find(r => r && r.id === RECIPE_ID) || null;
console.log(`\n--- the recipe under drive, read out of app.html ---`);
ok(`RECIPES[${RECIPE_ID}] is authored in app.html (${RECIPES.length} recipe(s) read from the runtime)`, !!recipe);
const STEPS = recipe && Array.isArray(recipe.steps) ? recipe.steps : [];
ok(`and it is an ordered list of steps (${STEPS.length}) — a recipe with none would pass every drive below vacuously`,
   STEPS.length >= 2);
for(const [i, st] of STEPS.entries()) console.log(`  steps[${i}]  ${st && st.surface}/${st && st.op}  — ${st && st.why}`);

/* ============================================================
   THE PRECONDITION: two EXISTING questions — one resting on nothing, one already resting on a leg
   ============================================================
   The questions are seeded through the REAL promote path in the shape content-extent.test.mjs establishes. The leg
   of the second rests on a document the Add surface itself captured, so nothing about that document is hand-made. */
const NOW = "2026-09-21T00:00:00Z", LATER = "2026-09-21T01:00:00Z";
const inquiryMd = (id, legs) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  ...(legs.length
    ? ["references:", ...legs.flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: confirmed"])]
    : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(legs.length ? ["basis:", ...legs.flatMap((t) => [`  - target: ${t}`, "    role: supports"])] : []),
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
let snapSeq = 0;
const seedQuestion = async (id, legs) => {
  const t = inquiryMd(id, legs);
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260921T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "inquiry", title: `What does ${id} rest on?`,
            current_state: "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: t, bytes: t.length, sha256: sha(t) }], register: [] }, "mem-d434");
  if(!r || r.ok === false) throw new Error(`seed ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  return id;
};
const heldMd = async (id) => {
  const img = await get("image", "id=" + encodeURIComponent(id), NINA);
  const md = img && img["bundle.md"];
  return typeof md === "string" ? md : null;
};
const legTargets = async (id) => {
  const md = await heldMd(id);
  const fm = md ? (parseFrontmatter(md).data || {}) : {};
  return (Array.isArray(fm.basis) ? fm.basis : []).filter(l => l && typeof l === "object").map(l => String(l.target));
};

/* The Add surface, driven as a member fills it: an address, the issuer they claim, a title. Nothing is prefilled by
   this harness beyond what a member types; the surface decides everything else. */
const addDocument = async (path, title) => {
  $$("#a-type").value = "information";
  $$("#a-title").value = title;
  $$("#a-body").value = "What the memo says about the transfer.";
  $$("#a-loc").value = `https://${HOST}${path}`;
  $$("#a-auth").value = "Oakland City Administrator";
  $$("#a-subs").checked = false; $$("#a-arch").checked = false;
  $$("#a-err")._html = "";
  const from = SENT.length, opened = OPENED.length;
  await U.addGo();
  const mine = SENT.slice(from);
  return { acquire: mine.filter(s => s.op === "acquire").pop() || null,
           promote: mine.filter(s => s.op === "promote").pop() || null,
           id: OPENED.length > opened ? OPENED[OPENED.length - 1] : null,
           rendered: text($$("#a-err")._html) };
};

const Q_FRESH = await seedQuestion("INQ-2026-4340-rests-on-nothing", []);
const prior = await addDocument("/d434/prior-memo.txt", "The prior transfer memo");
if(!prior.id) throw new Error(`the Add surface did not file the prior document (rendered: "${prior.rendered}")`);
const Q_LEGGED = await seedQuestion("INQ-2026-4341-rests-on-a-leg", [prior.id]);
ok(`the precondition holds: ${Q_FRESH} rests on nothing`, (await legTargets(Q_FRESH)).length === 0);
ok(`and ${Q_LEGGED} already rests on one leg, the Add surface's own capture ${prior.id}`,
   JSON.stringify(await legTargets(Q_LEGGED)) === JSON.stringify([prior.id]));

/* ============================================================
   THE BINDINGS — how a member performs each (surface, op) pair
   ============================================================ */
/* A refusal is the plane's `ok:false`, at whichever layer it arrived: the store's own answer inside the envelope, or
   the control plane's flat one. Its CODE and its SENTENCE both travel into the failing line, so a red run names what
   the record said rather than that something went wrong. */
const refusalIn = (answer) => {
  if(!answer || typeof answer !== "object") return { reason: "NO_ANSWER", detail: "the plane returned nothing readable" };
  const inner = (answer.result && typeof answer.result === "object") ? answer.result : null;
  if(answer.ok === false) return { reason: answer.reason || answer.error || "REFUSED", detail: answer.detail || answer.error || "" };
  if(inner && inner.ok === false) return { reason: inner.reason || "REFUSED", detail: inner.detail || "" };
  return null;
};
const words = (r) => r ? `${r.reason}${r.detail ? ` — "${String(r.detail).slice(0, 240)}"` : ""}` : "";
const offeredOn = async (target, actId) => {
  const a = await U.actsFor(target);
  const act = a && a.ok ? U.actNamed(a.acts, actId) : null;
  return { published: !!act, reachable: !!act && !!U.actReachable(act) };
};

const BINDINGS = {
  /* THE ADD SURFACE'S OWN ACT. What it fetched becomes the document every later step addresses. */
  "add/acquire": async (c) => {
    const r = await addDocument(c.path, c.title);
    const refused = r.acquire ? refusalIn(r.acquire.answer)
      : { reason: "NOT_SENT", detail: `the Add surface never sent op=acquire (it rendered: "${r.rendered}")` };
    const filed = r.promote ? refusalIn(r.promote.answer) : null;
    c.doc = r.id;
    return { refusal: refused, done: !refused && !!(r.acquire.answer && r.acquire.answer.document),
             after: refused ? null
               : !r.promote ? `the fetch answered, and the surface never filed it (it rendered: "${r.rendered}")`
               : filed ? `the fetch answered, and filing it was refused: ${words(filed)}`
               : !c.doc ? "the capture was filed, and the surface opened no document"
               : null,
             sent: SENT.length };
  },
  /* THE DOCUMENT PAGE'S READ — the call `getProjection` makes. */
  "bundle/projection": async (c) => {
    const a = await U.actAsk("projection", { id: c.doc });
    const pr = a.accepted ? a.result : null;
    return { refusal: a.accepted ? null : a.refusal, done: !!pr && (pr.bundle_id === c.doc || !!pr.fm_json),
             after: a.accepted && !pr ? "the plane answered with no projection of the capture" : null };
  },
  /* THE DOCUMENT PAGE'S CITE ACT, as `doCite` sends it. The act must be offered on the DOCUMENT (its act bar) and
     the question must be one the dialog offers as a citing object (`citeCandidates` lists only objects the plane
     publishes `cite` on). The role is the member's pick from the plane's published list; this harness names none
     of its own. */
  "bundle/cite": async (c) => {
    const onDoc = await offeredOn(c.doc, "cite");
    const onQuestion = await offeredOn(c.question, "cite");
    await U.loadActSource();
    const roles = JSON.parse(JSON.stringify(U.actVocab("basis_roles") || []));
    const role = roles[0];
    let handle = null, sel = null;
    try{ sel = await U.recPostR("select", { ids: [c.doc] }, { kind: "enumerated" }); handle = sel && sel.handle; }
    catch(e){ return { offered: onDoc.reachable && onQuestion.published, on: `${c.doc} (and ${c.question} as the citing object)`,
                       refusal: refusalIn(e) || { reason: "NO_SELECTION", detail: String(e) }, done: false }; }
    const a = await U.actAsk("cite", { project: c.question, handle, note: "", role });
    return { offered: onDoc.reachable && onQuestion.published,
             on: `${c.doc} (published ${onDoc.published}, reachable ${onDoc.reachable}) with ${c.question} offered as the citing object (${onQuestion.published})`,
             refusal: a.accepted ? null : a.refusal, done: a.accepted, detail: `role '${role}' of [${roles.join(", ")}]` };
  },
  /* THE QUESTION PAGE'S GROUPING ACT, as `doElicit` sends it, over the legs `openElicit` reads. */
  "inquiry/inquiryground": async (c) => {
    const onQ = await offeredOn(c.question, "inquiryground");
    const p = await U.actAsk("projection", { id: c.question });
    let fm = null; try{ fm = p.accepted && p.result && p.result.fm_json ? JSON.parse(p.result.fm_json) : null; }catch(_){ fm = null; }
    const legs = (fm && Array.isArray(fm.basis)) ? fm.basis.filter(l => l && typeof l === "object") : [];
    const ords = legs.map((_, i) => i);
    const grounds = ords.length ? [{ ground: U.elicLabel(ords, 0), legs: ords }] : [];
    const a = await U.intentAsk("inquiryground", { target: c.question, grounds });
    return { offered: onQ.reachable, on: `${c.question} (published ${onQ.published}, reachable ${onQ.reachable})`,
             refusal: a.accepted ? null : a.refusal, done: a.accepted };
  },
};

/* ============================================================
   THE DRIVE — every step, in the recipe's order, judged on the plane's answer
   ============================================================ */
async function drive(label, question, path){
  console.log(`\n--- the recipe, driven onto ${label}: ${question} ---`);
  const c = { question, path, title: `The transfer memo for ${question}`, doc: null };
  const before = await legTargets(question);
  let stoppedAt = null;
  for(let i = 0; i < STEPS.length; i++){
    const st = STEPS[i] || {};
    const pair = `${st.surface}/${st.op}`;
    const where = `${label} · steps[${i}] ${pair}`;
    const bind = Object.prototype.hasOwnProperty.call(BINDINGS, pair) ? BINDINGS[pair] : null;
    if(!bind){
      ok(`${where}: a member can perform this step — NO SUCH PAIR: surface '${st.surface}' carries no way for this suite to perform op=${st.op} toward the recipe's goal, so the step is not vouched for`, false);
      stoppedAt = i; break;
    }
    const r = await bind(c);
    if(r.offered !== undefined)
      ok(`${where}: the plane PUBLISHES op=${st.op} to this member on ${r.on}`, !!r.offered);
    ok(`${where}: the plane answered op=${st.op} without refusal${r.refusal ? ` — REFUSED ${words(r.refusal)}` : ""}${r.detail ? ` (${r.detail})` : ""}`,
       !r.refusal && !!r.done);
    if(r.after) ok(`${where}: ${r.after}`, false);
    if(r.refusal || !r.done || r.after){ stoppedAt = i; break; }
  }
  ok(`${label}: the recipe COMPLETED all ${STEPS.length} of its steps${stoppedAt === null ? "" : ` — it stopped at steps[${stoppedAt}]`}`,
     stoppedAt === null && STEPS.length > 0);

  /* THE GOAL, read back independently of every call above. */
  const after = await legTargets(question);
  ok(`${label}: GOAL — ${question}'s basis now carries a leg on the captured document ${c.doc || "(none was captured)"} (legs now: ${after.join(", ") || "none"})`,
     !!c.doc && after.includes(c.doc));
  ok(`${label}: and every leg it rested on before is still there (before: ${before.join(", ") || "none"})`,
     before.every(t => after.includes(t)));
  if(c.doc){
    const md = await heldMd(c.doc);
    const fm = md ? (parseFrontmatter(md).data || {}) : {};
    ok(`${label}: the captured document ${c.doc} is in the record as the Add surface filed it (information, from the address the member typed)`,
       fm.object_type === "information" && !!fm.source && String(fm.source.locator) === `https://${HOST}${path}`);
  }
  return c;
}

await drive("a question resting on nothing", Q_FRESH, "/d434/memo-for-a-fresh-question.txt");
await drive("a question already resting on a leg", Q_LEGGED, "/d434/memo-for-a-legged-question.txt");

/* ============================================================
   §0, OVER THE WORDS THE WIZARD WILL RENDER — secondary, and never instead of the drive
   ============================================================ */
console.log(`\n--- §0: the recipe's member-destined words carry no analyst vocabulary ---`);
console.log("  " + reachLine());
ok("the ONE derived family can see the term in this register — it fires on the words this recipe used to carry",
   analystHits("Ground the question on the captured document.").length > 0);
if(recipe){
  const said = [["goal", recipe.goal], ...STEPS.map((s, i) => [`steps[${i}].why`, s && s.why])];
  for(const [where, w] of said){
    const hits = analystHits(String(w || ""));
    ok(`RECIPES[${RECIPE_ID}].${where} carries none of the analyst vocabulary (found: ${hits.map(h => h.token).join(", ") || "none"})`,
       typeof w === "string" && w.length > 10 && hits.length === 0);
  }
}

exitCode = fails.length ? 1 : 0;
} finally {
  await mf.dispose();
}
console.log(`\nrecipe-drive: ${n - fails.length}/${n} assertions passed`);
if(fails.length){ console.error(`recipe-drive: ${fails.length} of ${n} assertions FAILED`); }
process.exit(exitCode);
