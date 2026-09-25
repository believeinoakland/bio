/* D-82 — AN AGENT-SURFACED QUESTION IS MARKED WHEREVER A QUESTION IS LISTED OR SHOWN, AND A MEMBER'S IS NOT.
 *
 * DESIGN AUTHORITY: `docs/architecture/BIO_Interaction_Constructs_v0_1.md` §"P · PROPOSAL", its accountability rule —
 * an assistant-surfaced focus must LOOK like one, "not to discount it, because a good question stands on its merits
 * whoever asked it, but because what a member needs to know is that nobody has yet judged it worth asking" — with
 * `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 8 ("an assistant-surfaced focus must be written and
 * shown as one (D-78, D-82)"). The WRITTEN half is D-78's: the plane stamps `surfaced_by` from the actor class at the
 * trust boundary. This suite is the SHOWN half.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) MARK BY TITLE, AUTHOR OR TEXT — a question "that sounds like a machine's". The fixture's two questions are
 *      byte-identical but for their ids: the same title, the same question, the same `author`, the same references.
 *      Section 1 asserts that of the rows a member sees, so a marker keyed on anything a member reads cannot tell them
 *      apart and must mark both or neither.
 *  (2) MARK BY WHAT THE CALLER SENT. Each question's bytes CLAIM THE OPPOSITE of what it is: the machine's says
 *      `surfaced_by: human`, the member's says `surfaced_by: agent`. The plane restamps both (D-78), and section 1
 *      reads the stamp back over the wire, so a surface trusting the bytes-as-sent marks the wrong one.
 *  (3) MARK BY THE ID'S SHAPE — both ids have the same shape.
 *  (4) MARK EVERY QUESTION — every MEMBER arm below is the over-strictness direction: the member's question renders
 *      with NO marker on every surface that lists it.
 *  (5) PASS BY EMPTINESS — every surface arm first asserts that BOTH rows are present, so a surface that listed
 *      nothing cannot pass the "no marker on the member's" arm for free.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * The criterion is what the RECORD holds: `bio-plane/src/index.mjs` under miniflare, members enrolled through the
 * real ops, the machine's question created by an instance deploy token (a machine credential — no member session)
 * inside a run it holds (REC-171's shared fixture), the member's by her own session. Nothing is mocked.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - IT CANNOT prove a browser paints what the harness's `innerHTML` holds; the DOM is a stub, the same reach every
 *    civicos-ui suite has.
 *  - THE QUEUE AND THE REVIEW SCREEN ARE NOT SURFACES HERE, and that is measured, not skipped: section 6 asserts that
 *    `op=queue` names neither question as a subject (an OBLIGATION's subject is a captured document's bundle, the one
 *    CONDITION names a document, a FINDING is a progression stage and already carries `proposalDerivedBadgeHtml`), and
 *    the Review screen lists `information` only. A producer that one day routes a question there owes this marker.
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/agent-surfaced-inquiry.control.mjs` — arms declared in its header; its run
 * is recorded on the `NEGATIVE CONTROL:` line at the foot of this file.
 */
import { withSurfacingRun } from "../../bio-plane/test/surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: shared, for its side effect. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { appScript } from "./extract.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("agent-surfaced-inquiry: the real plane could not be started — miniflare is not installed.");
  console.error("  Run `npm ci` in bio-plane/ (this suite drives the actual plane; nothing here is mocked).");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const MACHINE = "mem-d82";   /* the instance's MEMBER deploy token: a machine credential, no member behind it */
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d82", MEMBER_TOKEN: MACHINE, PROBE_TOKEN: "prb-d82", VERSION: "test",
              INSTANCE_NAME: "fixture-group" },
}));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const enc = encodeURIComponent;

/* ============================================================
   0. THE GROUND
   ============================================================ */
console.log("\n--- 0. the ground: a real plane, two questions identical but for who opened them ---");
const enrol = async (memberId, password, role, capabilities = ["contribute"]) => {
  const add = rP(await POST("op=memberadd&token=adm-d82", { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member", ["contribute", "create_projects"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const DOC = "INFO-2026-8200-ledger";
const BASE = "INQ-2026-8200-base";     /* a member's question both cite: its page lists them under what relies on it */
const AGENT = "INQ-2026-8200-first";   /* opened by the machine credential */
const MEMBER = "INQ-2026-8200-other";  /* opened by pilar's own session */
const QUESTION = "Was the transfer booked before the council approved it?";

const inquiryMd = (id, question, claims, refs) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${question}"`,
  "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "references:", ...refs.flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", `surfaced_by: ${claims}`, 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "", "## Question", "", question, "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "A minute of the council that contradicts the booking order.", "",
  "## Session Log", "", `### Session ${LATER} | Formation | seed`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Record ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []",
  "---", "", "## Summary", "", "A captured record.", "", "## Provenance Notes", "", "## Session Log", "",
  "## Review Notes", ""].join("\n");
const projectMd = () => ["---", "object_type: project", `title: "Oversight"`, "current_state: forming",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references:", ...[AGENT, MEMBER].flatMap((t) => [`  - target: ${t}`, "    rel: cites", "    status: confirmed"]),
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let seq = 0;
const promote = async (id, md, type, state, token) => {
  const r = rP(await POST(`op=promote&token=${token}`, {
    ...(id === null ? {} : { bundleId: id }), base: null, snapKey: `d82-${++seq}`, author: "seed",
    meta: { object_type: type,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] }));
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  return r;
};
await promote(DOC, infoMd(DOC), "information", "collected", PILAR);
await promote(BASE, inquiryMd(BASE, "What did the council approve?", "human", [DOC]), "inquiry", "open", PILAR);
/* (2): each question's bytes claim the OPPOSITE of what it is. */
await promote(AGENT, inquiryMd(AGENT, QUESTION, "human", [DOC, BASE]), "inquiry", "open", MACHINE);
await promote(MEMBER, inquiryMd(MEMBER, QUESTION, "agent", [DOC, BASE]), "inquiry", "open", PILAR);
const PROJ = (await promote(null, projectMd(), "project", "forming", PILAR)).bundleId;
if (typeof PROJ !== "string") throw new Error("promote project: the plane returned no minted id");

const fmScalar = (text, key) => {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(String(text).split("\n---")[0] || text);
  return m ? m[1].trim().replace(/^"|"$/g, "") : null;
};
const stampOf = async (id) => fmScalar(rP(await GET(`op=image&token=${PILAR}&id=${enc(id)}`))["bundle.md"], "surfaced_by");
const projStampOf = async (id) => {
  const p = rP(await GET(`op=projection&token=${PILAR}&id=${enc(id)}`));
  try { return JSON.parse(p.fm_json).surfaced_by; } catch { return undefined; }
};

/* ============================================================
   1. THE RECORD, RE-MEASURED — the stamp is the plane's, and it contradicts the bytes sent
   ============================================================ */
console.log("\n--- 1. the plane's stamp, read back over the wire ---");
ok("THE MACHINE'S QUESTION IS STAMPED `agent` BY THE PLANE, though its bytes claimed `human` (D-78) — in its bytes and its projection",
  (await stampOf(AGENT)) === "agent" && (await projStampOf(AGENT)) === "agent",
  `${await stampOf(AGENT)} / ${await projStampOf(AGENT)}`);
ok("THE MEMBER'S QUESTION IS STAMPED `human` BY THE PLANE, though its bytes claimed `agent` — in its bytes and its projection",
  (await stampOf(MEMBER)) === "human" && (await projStampOf(MEMBER)) === "human",
  `${await stampOf(MEMBER)} / ${await projStampOf(MEMBER)}`);
const listAnswer = rP(await GET(`op=list&token=${PILAR}`));
const listed = (id) => (Array.isArray(listAnswer) ? listAnswer : []).find((b) => b.bundle_id === id) || {};
ok("THE LIAR'S INPUTS ARE IDENTICAL: the plane lists both questions with the SAME title, type and state",
  listed(AGENT).title && listed(AGENT).title === listed(MEMBER).title
  && listed(AGENT).object_type === listed(MEMBER).object_type && listed(AGENT).current_state === listed(MEMBER).current_state,
  JSON.stringify([listed(AGENT).title, listed(MEMBER).title]));
ok("and NO list read carries `surfaced_by` — which is why the surface must ask the record rather than read a row",
  !("surfaced_by" in listed(AGENT)) && !("surfaced_by" in listed(MEMBER)));
const indep = rP(await GET(`op=search&token=${PILAR}&mode=ids&facets=none&q=${enc("type:inquiry fm:surfaced_by=agent")}`));
ok("the record's own answer to `type:inquiry fm:surfaced_by=agent`, taken independently, names the machine's question and not the member's or the base",
  Array.isArray(indep.ids) && indep.ids.includes(AGENT) && !indep.ids.includes(MEMBER) && !indep.ids.includes(BASE)
  && indep.truncated === false && indep.total === indep.ids.length,
  JSON.stringify(indep.ids));

/* ============================================================
   THE SURFACE, LOADED, ITS FETCH BRIDGED TO THAT PLANE
   ============================================================ */
const els = new Map();
function el(){
  const e = { classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
    value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
    querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){},
    remove(){}, onclick:null, onchange:null, setAttribute(){}, getAttribute(){ return null; } };
  Object.defineProperty(e, "innerHTML", { get(){ return e._html; }, set(v){ e._html = v; } });
  return e;
}
const $$ = (s) => { if (!els.has(s)) els.set(s, el()); return els.get(s); };
const WIRE = [];
let REFUSE_SET_READ = false;   /* section 7: the set read fails, so the surface must SAY it cannot tell */
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(),
  matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){},
    documentElement:{setAttribute(){}}, getElementById:()=>el(), hidden:false,
    createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", hash:"" }, history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  sessionStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => {
    const url = new URL(u, "http://x");
    WIRE.push({ op: url.searchParams.get("op"), params: Object.fromEntries(url.searchParams.entries()) });
    if (REFUSE_SET_READ && url.searchParams.get("op") === "search" && /fm:surfaced_by/.test(url.searchParams.get("q") || ""))
      return new Response(JSON.stringify({ ok: false, error: "the record did not answer" }), { status: 503 });
    return mf.dispatchFetch(url.toString(), opts);
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = {" + [
  "PLANE", "renderRecord", "finderScope", "openProjectWorkspace", "openBundle", "openInquiry",
].join(",") + ", FIND: () => FIND };", ctx);
const U = ctx.__U;
U.PLANE.token = PILAR;
U.PLANE.session = true;
U.PLANE.me = { member: "pilar", handle: "pilar", session: true, administer: false,
               capabilities: ["contribute", "create_projects"] };

/* THE MARKER, recognised by what a member reads plus its one attribute — never by calling the helper, so neutering the
   helper is a real control. */
const MARK = /data-surfaced-by="agent"[^>]*>[^<]*nobody has yet judged it worth asking/;
const unent = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const tableRow = (html, id) => (new RegExp(`<tr class="row" data-id="${id}"[\\s\\S]*?</tr>`).exec(html) || [null])[0];
const linkRow = (html, id) => (html.match(/<div class="linkrow"[^>]*>[\s\S]*?<\/div>/g) || [])
  .find((r) => unent(r).includes(`"${id}"`) || unent(r).includes(`'${id}'`)) || null;
const setReads = () => WIRE.filter((w) => w.op === "search" && /fm:surfaced_by=agent/.test(w.params.q || "")).length;

/* Every listing surface is judged by the SAME four arms. */
function judge(surface, html, rowOf){
  const a = rowOf(html, AGENT), m = rowOf(html, MEMBER);
  ok(`${surface} · CORPUS: the surface lists BOTH questions (a list of nothing passes every "no marker" arm for free)`,
     !!a && !!m, `agent row ${!!a} · member row ${!!m}`);
  ok(`${surface} · AGENT: the machine's question carries the marker — nobody has yet judged it worth asking`,
     !!a && MARK.test(a), a ? a.slice(0, 300) : "no row");
  ok(`${surface} · MEMBER: the member's question renders with NO marker (the over-strictness direction)`,
     !!m && !/data-surfaced-by/.test(m) && !/judged it worth asking/.test(m), m ? m.slice(0, 300) : "no row");
  ok(`${surface} · NO UNDETERMINED NOTE where the record answered completely`,
     !/data-surfaced-undetermined/.test(html));
}

/* ============================================================
   2. THE RECORD LIST
   ============================================================ */
console.log("\n--- 2. the record list (op=list) ---");
let before = setReads();
await U.renderRecord();
judge("RECORD LIST", $$("#rectable")._html, tableRow);
ok("RECORD LIST · the set came from the record: the surface asked `fm:surfaced_by=agent` once", setReads() === before + 1,
   `${before} -> ${setReads()}`);

/* ============================================================
   3. THE FOCUS LIST — the finder's Questions scope
   ============================================================ */
console.log("\n--- 3. the focus list: the finder's Questions scope (op=search type:inquiry) ---");
before = setReads();
await U.finderScope("inquiries");
judge("FOCUS LIST", $$("#f-res")._html, tableRow);
ok("FOCUS LIST · the set came from the record", setReads() === before + 1, `${before} -> ${setReads()}`);

/* ============================================================
   4. BESIDE A PROJECT
   ============================================================ */
console.log("\n--- 4. beside a project: the workspace's contents ---");
await U.openProjectWorkspace(PROJ);
judge("PROJECT", $$("#content")._html, linkRow);

/* ============================================================
   5. WHERE A DOCUMENT OR A QUESTION LISTS WHAT RELIES ON IT
   ============================================================ */
console.log("\n--- 5. what relies on a document, and on a question ---");
await U.openBundle(DOC);
judge("DOCUMENT PAGE · cited by", $$("#content")._html, linkRow);
await U.openInquiry(BASE);
judge("QUESTION PAGE · what relies on this", $$("#content")._html, linkRow);

/* ============================================================
   6. WHERE A QUESTION IS SHOWN — its own page, and the document page opened on it
   ============================================================ */
console.log("\n--- 6. the question itself, shown ---");
await U.openInquiry(AGENT);
const pa = $$("#content")._html;
ok("QUESTION PAGE · AGENT: the machine's question's own page carries the marker, beside its phase",
   /<p class="lede">[\s\S]*?<\/p>/.test(pa) && MARK.test((/<p class="lede">[\s\S]*?<\/p>/.exec(pa) || [""])[0]), pa.slice(0, 400));
await U.openInquiry(MEMBER);
const pm = $$("#content")._html;
ok("QUESTION PAGE · MEMBER: the member's question's page carries NO marker anywhere",
   /What it rests on/.test(pm) && !/data-surfaced-by/.test(pm), pm.slice(0, 300));
await U.openBundle(AGENT);
const ba = $$("#content")._html;
ok("RECORD PAGE · AGENT: opened from the record list, the machine's question carries the marker among its seals",
   MARK.test((/<span class="seals">[\s\S]*?<\/span><\/span>|<span class="seals">[\s\S]*$/.exec(ba) || [""])[0]), ba.slice(0, 300));
await U.openBundle(MEMBER);
const bm = $$("#content")._html;
ok("RECORD PAGE · MEMBER: opened from the record list, the member's question carries NO marker anywhere",
   /class="seals"/.test(bm) && !/data-surfaced-by/.test(bm));

/* The queue, MEASURED rather than skipped. */
const qa = rP(await GET(`op=queue&token=${PILAR}`));
ok("THE QUEUE NAMES NEITHER QUESTION AS A SUBJECT today — measured, so this suite's silence about it is a finding, not a gap",
   Array.isArray(qa.items) && !qa.items.some((it) => it.subject && [AGENT, MEMBER].includes(it.subject.id)),
   JSON.stringify((qa.items || []).map((it) => it.subject)));

/* ============================================================
   7. UNDETERMINED IS STATED
   ============================================================ */
console.log("\n--- 7. when the record does not answer, the list says it cannot tell — and marks nobody ---");
REFUSE_SET_READ = true;
await U.renderRecord();
const ur = $$("#rectable")._html;
ok("UNDETERMINED · the record list still lists both questions, and marks NEITHER when it cannot tell",
   !!tableRow(ur, AGENT) && !!tableRow(ur, MEMBER) && !/data-surfaced-by/.test(ur));
ok("UNDETERMINED · and SAYS so once: an unmarked question here is not thereby a member's",
   (ur.match(/data-surfaced-undetermined/g) || []).length === 1 && /not thereby a member/.test(ur), ur.slice(-400));
REFUSE_SET_READ = false;

/* NEGATIVE CONTROL: `node civicos-ui/test/agent-surfaced-inquiry.control.mjs`, run 2026-09-23 (D-82), six arms each
 * ALONE, all AS DECLARED, app.html restored by sha256 and content after each: BASELINE 34/0 · (A) the helper neutered
 * -> 27/7, every AGENT arm on all seven surfaces fails by name, every MEMBER and CORPUS arm green · (B) the liar marking
 * every question -> 26/8, every MEMBER arm fails, every AGENT arm green · (C) the list read ignoring the stamp -> 24/10,
 * the five list MEMBER arms and the record page's cited-question row fail, the question's own page stays green ·
 * (D) OVER-STRICTNESS, the page reading the projection before the bytes -> 34/0 · (E) the undetermined note dropped ->
 * 33/1, that arm alone. */
console.log(`\nagent-surfaced-inquiry: ${pass} pass, ${fail} fail`);
await mf.dispose();
if (fail) process.exitCode = 1;
