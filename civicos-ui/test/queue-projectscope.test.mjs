/* UI-110 — A PROJECT-SCOPED FINDING JOINS A QUEUE SELECTION, AND ITS CASE IS NEVER DEFAULTED
 * (NOTIFICATIONS.md §"MARKED AS HANDLED — and handling has a SCOPE, which differs by class", with D-266).
 *
 * THE ROW'S ACCEPTS-WHEN: *"a project-scoped finding joins a selection and the set act carries its project; an item
 * with two homes is not sent until the member names one (the measured failure it moves: null for scope=project)."*
 * Before this landing `queueSetOpsFor` answered NO set act for an item whose `disposition.scope` is `project`, so no
 * member could tick one, although REC-205 measured the plane's set act taking a `project` PER ITEM.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * The criterion is what the RECORD did with each item — under WHICH case the decision was recorded — so
 * `bio-plane/src/index.mjs` runs under miniflare with `bio-plane/test/d266scope.test.mjs`'s fixture, copied rather than
 * re-invented: two projects share one question and stand on two readings, so two stance-divergence FINDINGs exist and
 * each is filed under BOTH projects (two homes), and a progression finding beside them is a shared-record finding
 * (scope `instance`). After one team decides a stance finding its homes shrink to ONE, which is how the single-home
 * half is reached through the record rather than by a forced field.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) STILL NOT SELECTABLE — §1 asserts the tick on the project-scoped item, and §3/§4 that it goes in the act.
 *  (2) A DEFAULTED CASE — a surface that sends a two-home item under its first home (or any home) before the member
 *      names one. §2 counts the wire: the one call must carry the shared finding and NOT the two-home one, and the
 *      picker must mark no case chosen. That is D-266's rule: defaulting picks whose judgment the record carries.
 *  (3) THE WRONG SHAPE — a surface that sends `key` for a project-scoped item is refused by the plane's IC-60 bridge;
 *      §3 asserts the item goes as (project, finding) and the READ-BACK asserts the record put it under that case.
 *  (4) A REASON OF THE SURFACE'S OWN — §5 asserts the plane's refusal reaches the kept item as the plane sent it.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - The DOM is a stub, the reach every civicos-ui suite has: the picker's `onchange` is not fired by a browser, so the
 *    suite calls the function it names (`queueHomeTo`) and asserts separately that `queueWire` binds it.
 *  - ONE credential (an administrator, joined to both projects) drives both teams' decisions, the instrument
 *    convenience `d266scope.test.mjs` states for itself; it is not a claim about the membership model.
 *  - §5 is a UNIT arm over the live painted state: the surface itself never sends a project-scoped item without its
 *    project, so the refusal the plane gives such a call (the IC-60 bridge's) is reached by FORCING one item's
 *    published `scope` to what a pre-IC-60 plane would have published. It establishes that the plane's words reach
 *    the member on the kept item; it does not establish that any live plane publishes that shape today.
 *  - THAT REFUSAL CARRIES NO CANNED TRANSLATION. The plane mints it with a `reason` and a `detail` and no DEC-49
 *    `code`/`translation` (store.mjs `proposeDispose`, both sites), so what reaches the member is the plane's own
 *    `detail`, verbatim — the record's words, but not DEC-49's canned ones. That is a plane defect, D-623, minted and sent
 *    to SCHEDULER by this row's worker, not closed here. Its code is NAMED UNQUOTED in this
 *    file on purpose: `check-refusal-codes.mjs`' R3 walk counts a quoted code in a suite as one a HARNESS MOCK feeds
 *    the surface, and no mock here feeds it — the real plane sends it.
 *
 * NEGATIVE CONTROL: arms declared and run in `queue-projectscope.control.mjs`; results recorded on the lines below.
 * CONTROL RESULT 2026-09-25 (UI-110 worker), `node civicos-ui/test/queue-projectscope.control.mjs`, all SIX arms, each
 * armed alone on the EXTRACTED script (app.html never edited; its sha256 read before and after the run, 954c8406…837
 * both, 1,638,078 bytes), each splice asserted to match exactly once. EVERY ARM AS DECLARED (three declarations
 * AMENDED from this run's printed figures — the control file says which and why):
 *   baseline    exit 0 · 23 pass / 0 fail
 *   nullscope   exit 1 · 12/11 — THE ROW'S CONTROL: `queueSetOpsFor` answers nothing for scope=project again, and
 *               "a PROJECT-SCOPED finding carries a tick that FEEDS THE SET" FAILS BY NAME, with §2's picker and count
 *               arms, §3 and §4. §0, §2's wire arms (the shared finding still goes alone), §5 and §6 green.
 *   preselect   exit 1 · 14/9 — THE NO-DEFAULT ARM: the first home stands in for the member's choice, and "THE
 *               TWO-HOME FINDING IS NOT SENT until the member names one of its cases" FAILS BY NAME, with the picker's
 *               no-choice arm, the bar's count arms, §2's read-back and §3's two act arms. §1, §4, §5, §6 green.
 *   pickdefault exit 1 · 22/1 — the picker alone shows a default: "the picker marks NO case chosen" fails and nothing else.
 *   keyshape    exit 1 · 17/6 — a project-scoped item sent as `key`: §3's "CARRIES ITS PROJECT" and read-back, and §4.
 *   spelling    exit 0 · 23/0 — OVER-STRICTNESS, as declared: the item built in another key order is correct work.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282: a file that exits flushes its own tally */
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
  console.error("queue-projectscope: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const APP = process.env.UI110_APP_SRC || null;   /* the control harness hands a mutated app script through this */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-ui110", MEMBER_TOKEN: "mem-ui110", PROBE_TOKEN: "prb-ui110", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {
/* ============================================================ 0. THE GROUND (d266scope.test.mjs's fixture) */
console.log("\n--- 0. the ground: two projects, one question, two stance findings under both, one progression finding ---");
const enrol = async (memberId, role, caps) => {
  const add = await POST(`op=memberadd&token=adm-ui110`, { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add.ok) throw new Error(`memberadd ${memberId}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

/* ------------------------------------------------------------- FIXTURES
   The document shapes are current.test.mjs's, which is deliberate: this suite and
   that one must be able to disagree about BEHAVIOUR without disagreeing about what a
   project or a reading looks like. */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", "and"),
    ...scalar("state", "suggested"), ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("run", v.run), ...scalar("author", "ruth"), ...scalar("at", v.at ?? NOW),
    ...scalar("state_by", undefined), ...scalar("state_at", undefined),
    ...scalar("state_reason", undefined)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ['  - version: "' + v.name + '"', ...scalar("ground", g),
     ...scalar("asserted_by", "ruth"), ...scalar("at", NOW)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ['  - version: "' + v.name + '"', ...scalar("target", l.target),
     ...scalar("role", "supports"), ...scalar("ground", l.ground),
     ...scalar("grade", "B"), ...scalar("grade_axis", "capture"),
     ...scalar("grade_source", "capture")].join("\n")));
  return ["basis_versions:", ...rows,
          ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
          ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};
const inquiryMd = (id, { versions = [], basis = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Did the sewer fund transfer follow the adopted process?"`,
  "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(basis.length ? ["references:", ...basis.flatMap((b) => [`  - target: ${b}`,
      "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(basis.length ? ["basis:", ...basis.flatMap((b) => [`  - target: ${b}`, "    role: supports"])] : []),
  ...versionLines(versions),
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
/* CORRECTED 2026-09-18 (REC-141, IC-158): creation bytes of a project carry no `id:` line
   (PROJECT_ID_IN_BYTES), so `id` null writes none; the plane mints the id and writes it. */
const projectMd = (id, { title, cites = [] } = {}) => ["---",
  ...(id ? [`id: ${id}`] : []), "object_type: project", `title: "${title}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(cites.length
    ? ["references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
    : ["references: []"]),
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base: null,
  snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
          created: NOW, last_updated: LATER } });
const mustPromote = async (id, text, type) => {
  const r = await promote(id, text, type);
  if (!r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};

const LEDGER = "INFO-2026-5000-ledger", MINUTES = "INFO-2026-5000-minutes";
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7)
   and a creation naming one is refused PROJECT_ID_SUPPLIED. The creation names no bundleId; the id
   is read from the answer. `name` (the id the suite used to choose) keeps the meta title and key. */
const createProject = async (name, text) => {
  const r = await POST(`op=promote&token=${RUTH}`, {
    base: null, snapKey: `${name}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: `Bundle ${name}`,
            current_state: "forming", created: NOW, last_updated: LATER } });
  if (!r.ok || typeof r.bundleId !== "string") throw new Error(`create ${name}: ${JSON.stringify(r).slice(0, 800)}`);
  return r.bundleId;
};
let A, B; /* minted below (REC-141) */
const INQ = "INQ-2026-5000-sewer-transfers";
const RUN_A = "AIRUN-2026-5000-oversight", RUN_B = "AIRUN-2026-5000-budget";

/* THE PROGRESSION DOCUMENT, PROMOTED FIRST so the shared question can cite it. That
   citation is not decoration: it is what puts the SHARED-RECORD finding under BOTH
   projects, and without it "one act clears it everywhere" would be asserted over a
   single case and would prove nothing about `everywhere`. */
const RCAP = "c".repeat(63) + "3";
const RDOC = "INFO-2026-5000-filed";
{
  const rmd = infoMd(RDOC);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: RCAP, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
               entities: [{ ref: "contract:D266S", kind: "contract", key: "D266S",
                            label: "D-266 fixture contract" }] } }] });
  const r = await POST(`op=promote&token=${RUTH}`, {
    bundleId: RDOC, base: null, snapKey: `${RDOC}-1-${sha("r").slice(0, 6)}`,
    files: [{ path: "bundle.md", text: rmd, bytes: rmd.length, sha256: sha(rmd) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [],
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${RDOC}`,
            current_state: "collected", created: NOW, last_updated: LATER } });
  if (!r.ok) throw new Error(`promote ${RDOC}: ${JSON.stringify(r).slice(0, 800)}`);
}
for (const d of [LEDGER, MINUTES]) await mustPromote(d, infoMd(d), "information");

const V1 = { name: "opening account", run: RUN_A, at: "2026-07-03T00:00:00Z",
  description: "The first reading: the ledger and the minutes together show the transfer.",
  grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail" }, { target: MINUTES, ground: "paper trail" }] };
const V2 = { name: "the ledger alone", run: RUN_B, at: "2026-07-04T00:00:00Z",
  description: "Second reading: the ledger carries the finding without the minutes.",
  grounds: ["the ledger"], legs: [{ target: LEDGER, ground: "the ledger" }] };

A = await createProject("PROJ-2026-5000-oversight", projectMd(null, { title: "Oversight", cites: [INQ] }));
B = await createProject("PROJ-2026-5000-budget", projectMd(null, { title: "Budget", cites: [INQ] }));
const openRun = async (run, ctx) => {
  const r = await POST(`op=airunopen&token=${RUTH}`, {
    run, contextType: "project", contextId: ctx,
    label: `D-266 fixture — a run working under ${ctx}`, mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 10, unit: "requests" }], leaseMs: 600000 });
  if (r?.started !== true) throw new Error(`airunopen ${run}: ${JSON.stringify(r).slice(0, 600)}`);
};
await openRun(RUN_A, A);
await openRun(RUN_B, B);
await mustPromote(INQ, inquiryMd(INQ, { versions: [V1, V2], basis: [LEDGER, MINUTES, RDOC] }), "inquiry");

/* §6 RULE 5: a project can only stand on a reading its members have ACCEPTED, so the
   fixture accepts before it stands. That is the product's own order of acts. */
const accept = async (version) =>
  POST(`op=versionaccept&token=${RUTH}&target=${encodeURIComponent(INQ)}`
     + `&version=${encodeURIComponent(version)}`, { affirmed: true });
const makeCurrent = async (project, version) =>
  POST(`op=versioncurrent&token=${RUTH}&target=${encodeURIComponent(INQ)}`
     + `&version=${encodeURIComponent(version)}&project=${encodeURIComponent(project)}`, {});
{
  const a1 = await accept(V1.name), a2 = await accept(V2.name);
  if (a1.ok === false || a2.ok === false)
    throw new Error(`versionaccept: ${JSON.stringify([a1, a2]).slice(0, 600)}`);
  const c1 = await makeCurrent(A, V1.name), c2 = await makeCurrent(B, V2.name);
  if (c1.ok === false || c2.ok === false)
    throw new Error(`versioncurrent: ${JSON.stringify([c1, c2]).slice(0, 600)}`);
}

/* THE PROGRESSION, so the feed carries a SHARED-RECORD finding beside the
   stance-scoped ones. Only the LATER stage is placed, so `filed` is a
   missing-required proposal. */
const PKEY = "d266s-flow";
{
  const def = await POST(`op=progressiondefine&token=${RUTH}`, {
    progressionKey: PKEY, label: "D-266 fixture flow",
    stages: [{ key: "filed", label: "Filed", cardinality: "1", required: "always" },
             { key: "heard", label: "Heard", after: "filed", cardinality: "1", required: "always" }] });
  if (!def.ok) throw new Error(`progressiondefine: ${JSON.stringify(def).slice(0, 600)}`);
  const ent = await POST(`op=entitycreate&token=${RUTH}`,
    { kind: "contract", label: "D-266 fixture contract", aliases: ["contract:D266S"] });
  await POST(`op=resolve&token=${RUTH}`, { captureSha: RCAP });
  const th = await POST(`op=thread&token=${RUTH}`, { progressionKey: PKEY,
    entityId: ent?.entity_id, placements: [{ stage: "heard", captureSha: RCAP }] });
  if (th?.ok === false) throw new Error(`thread: ${JSON.stringify(th).slice(0, 600)}`);
}


const queue = async () => GET(`op=queue&token=${RUTH}&limit=500`);
const ITEMS = (q) => (q && Array.isArray(q.items)) ? q.items : [];
const byId = (q, id) => ITEMS(q).find((i) => i && i.id === id) || null;
const homesOf = (it) => ((it && it.case && Array.isArray(it.case.ancestors)) ? it.case.ancestors : [])
  .filter((a) => a && a.type === "project").map((a) => a.id).sort();
const STANCE_ABOUT_B = `FINDING::stance-changed-here-not-elsewhere::${INQ}::${B}`;
const STANCE_ABOUT_A = `FINDING::stance-changed-here-not-elsewhere::${INQ}::${A}`;
const SHARED_FINDING = `FINDING::${PKEY}::filed`;
{
  const q = await queue();
  ok("fixture: both stance findings are in ruth's feed, each PROJECT-SCOPED and filed under BOTH projects",
     [STANCE_ABOUT_A, STANCE_ABOUT_B].every((id) => { const it = byId(q, id);
       return it && it.disposition?.scope === "project" && it.disposition?.available === true
         && JSON.stringify((it.disposition.projects || []).slice().sort()) === JSON.stringify([A, B].sort()); }),
     JSON.stringify([STANCE_ABOUT_A, STANCE_ABOUT_B].map((id) => byId(q, id)?.disposition)));
  ok("fixture: the shared-record finding is there too, scope instance",
     byId(q, SHARED_FINDING)?.disposition?.scope === "instance", JSON.stringify(byId(q, SHARED_FINDING)?.disposition));
}

/* ============================================================ THE SURFACE, ITS FETCH BRIDGED TO THAT PLANE */
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
    let body = null; try { body = opts && opts.body ? JSON.parse(opts.body) : null; } catch (_) {}
    WIRE.push({ op: url.searchParams.get("op"), body });
    return mf.dispatchFetch(url.toString(), opts);
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext((APP ? fs.readFileSync(APP, "utf8") : appScript()) + ";globalThis.__U = {" + [
  "PLANE", "renderQueue", "queueSelectionToggle", "queueApplySet", "loadActSource", "queueSelClear", "queueHomeTo",
].join(",") + ", SEL: () => [...QUEUE_SEL], RET: () => [...QUEUE_RETAINED.keys()]"
  + ", WIRESRC: () => String(queueWire)"
  /* §5 only: forces ONE field of ONE live painted item. Named FORCE so no reader mistakes it for the record. */
  + ", FORCESCOPE: (id, scope) => { const it = QUEUE_ITEMS.get(String(id)); if(it && it.disposition) it.disposition.scope = scope; }"
  + " };", ctx);
const U = ctx.__U;
U.PLANE.token = RUTH;
U.PLANE.session = true;
U.PLANE.me = { member: "ruth", handle: "ruth", session: true, administer: true, capabilities: ["contribute", "publish"] };

const Q = () => $$("#q")._html;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const reEsc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const itemBlock = (id) => (new RegExp(`<article class="q-item[^"]*" data-id="${reEsc(esc(id))}"[\\s\\S]*?</article>`).exec(Q()) || [null])[0];
const keptBlock = (id) => (new RegExp(`<div class="q-item" data-id="${reEsc(esc(id))}">[\\s\\S]*?</div></div>`).exec(Q()) || [null])[0];
const unent = (s) => String(s || "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
const pickerOf = (id) => (new RegExp(`<select data-qsethome="${reEsc(esc(id))}">[\\s\\S]*?</select>`).exec(Q()) || [null])[0];
const sentDisposals = (from) => WIRE.slice(from).filter((w) => w.op === "proposedispose");
/* An item's identity as a SET, never as a JSON string: the over-strictness arm builds it in another key order. */
const same = (a, b) => JSON.stringify(Object.entries(a || {}).sort()) === JSON.stringify(Object.entries(b || {}).sort());

await U.loadActSource(true);
await U.renderQueue();

/* ============================================================ 1. THE SELECTION ARM */
console.log("\n--- 1. a PROJECT-SCOPED finding is selectable ---");
ok("fixture: the project-scoped finding is painted", !!itemBlock(STANCE_ABOUT_B), Q().slice(0, 300));
ok("a PROJECT-SCOPED finding carries a tick that FEEDS THE SET (it names queueSelectionToggle)",
   new RegExp(`data-qsel="${reEsc(esc(STANCE_ABOUT_B))}"[^>]*queueSelectionToggle`).test(itemBlock(STANCE_ABOUT_B) || ""),
   (itemBlock(STANCE_ABOUT_B) || "").slice(0, 600));

/* ============================================================ 2. THE ASK ARM — two homes, not sent until named */
console.log("\n--- 2. a finding with TWO homes is selected beside a shared-record finding: it waits, unsent ---");
U.queueSelectionToggle(STANCE_ABOUT_B, true);
U.queueSelectionToggle(SHARED_FINDING, true);
const pk = pickerOf(STANCE_ABOUT_B);
ok("selected, the two-home finding ASKS: a picker naming both of its cases",
   !!pk && [A, B].every((p) => new RegExp(`value="${reEsc(esc(p))}"`).test(pk)), String(pk));
ok("and the picker marks NO case chosen — its only default is the option that chooses nothing",
   !!pk && !/ selected>/.test(pk) && /<option value="">/.test(pk), String(pk));
ok("the bar COUNTS the finding held back, so a set sent without it is not read as the whole selection",
   /data-sethomewait>1 selected finding is filed under more than one case/.test(Q()), Q().slice(Q().indexOf("q-selbar"), Q().indexOf("q-selbar") + 900));
ok("the bar's dispose control counts only what it would SEND (the one shared-record finding)",
   /Defer or dismiss the selected findings \(1\)/.test(Q()));
let before = WIRE.length;
await U.queueApplySet("proposedispose", { to: "deferred", reason: "we will come back to the flow after the vote" });
let sent = sentDisposals(before);
ok("ONE op=proposedispose call, carrying ONE item: the shared-record finding by its key",
   sent.length === 1 && Array.isArray(sent[0].body?.items) && sent[0].body.items.length === 1
   && sent[0].body.items[0].key === `${PKEY}::filed`, JSON.stringify(sent.map((w) => w.body)));
ok("THE TWO-HOME FINDING IS NOT SENT until the member names one of its cases — no item names it, and no item names a project",
   sent.length === 1 && sent[0].body.items.every((i) => i.finding !== STANCE_ABOUT_B && !("project" in i))
   && !("project" in sent[0].body), JSON.stringify(sent.map((w) => w.body)));
ok("it is still listed, still selected and still filed under both cases; the shared finding left the list",
   !!itemBlock(STANCE_ABOUT_B) && U.SEL().includes(STANCE_ABOUT_B) && !U.SEL().includes(SHARED_FINDING)
   && !itemBlock(SHARED_FINDING), JSON.stringify({ sel: U.SEL(), shared: !!itemBlock(SHARED_FINDING) }));
ok("READ BACK: the record holds no decision on the two-home finding under either case",
   await (async () => { const q = await queue();
     const d = ((q.disposed && q.disposed.findings) || []).filter((r) => r.finding === STANCE_ABOUT_B);
     return d.length === 0 && JSON.stringify(homesOf(byId(q, STANCE_ABOUT_B))) === JSON.stringify([A, B].sort()); })());

/* ============================================================ 3. NAMED — the set act carries its project */
console.log("\n--- 3. the member names case A: the set act carries (project, finding) ---");
U.queueHomeTo(STANCE_ABOUT_B, A);
ok("the picker now marks A, the member's own choice, and the bar holds nothing back",
   new RegExp(`value="${reEsc(esc(A))}" selected>`).test(pickerOf(STANCE_ABOUT_B) || "") && !/data-sethomewait/.test(Q()),
   String(pickerOf(STANCE_ABOUT_B)));
before = WIRE.length;
await U.queueApplySet("proposedispose", { to: "dismissed", reason: "our team has read their reading and stays" });
sent = sentDisposals(before);
ok("ONE call whose item CARRIES ITS PROJECT: { project: A, finding: the item's own published finding }, and no key",
   sent.length === 1 && sent[0].body.items.length === 1
   && same(sent[0].body.items[0], { project: A, finding: STANCE_ABOUT_B }), JSON.stringify(sent.map((w) => w.body)));
ok("it was applied: no longer selected, no note kept", !U.SEL().includes(STANCE_ABOUT_B) && !U.RET().includes(STANCE_ABOUT_B),
   JSON.stringify({ sel: U.SEL(), ret: U.RET() }));
ok("READ BACK: the record put the decision under case A and NO OTHER — the item is still filed under B",
   await (async () => { const q = await queue();
     const d = ((q.disposed && q.disposed.findings) || []).filter((r) => r.finding === STANCE_ABOUT_B);
     return d.length === 1 && d[0].project === A && d[0].scope === "project"
       && JSON.stringify(homesOf(byId(q, STANCE_ABOUT_B))) === JSON.stringify([B]); })());

/* ============================================================ 4. ONE HOME — its own case, said on the item */
console.log("\n--- 4. the same finding, now filed under ONE case: it goes under that case, which the item says ---");
await U.renderQueue();
U.queueSelectionToggle(STANCE_ABOUT_B, true);
ok("selected, the one-home finding NAMES the case its decision is recorded under, and draws no picker",
   new RegExp(`data-selhome="${reEsc(esc(STANCE_ABOUT_B))}">Recorded as the case [^<]*${reEsc(esc(B))}`).test(itemBlock(STANCE_ABOUT_B) || "")
   && !pickerOf(STANCE_ABOUT_B), (itemBlock(STANCE_ABOUT_B) || "").slice(0, 900));
before = WIRE.length;
await U.queueApplySet("proposedispose", { to: "dismissed", reason: "budget team agrees, no action" });
sent = sentDisposals(before);
ok("the set act carries the item's OWN project, B",
   sent.length === 1 && sent[0].body.items.length === 1
   && same(sent[0].body.items[0], { project: B, finding: STANCE_ABOUT_B }), JSON.stringify(sent.map((w) => w.body)));
ok("READ BACK: decided under B as well, and the finding has left the feed",
   await (async () => { const q = await queue();
     const d = ((q.disposed && q.disposed.findings) || []).filter((r) => r.finding === STANCE_ABOUT_B);
     return d.map((r) => r.project).sort().join() === [A, B].sort().join() && !byId(q, STANCE_ABOUT_B); })());

/* ============================================================ 5. THE PLANE'S REFUSAL, IN ITS OWN WORDS (a unit arm) */
console.log("\n--- 5. a refusal of a project-scoped item reaches the member as the plane sent it (unit arm — see the header) ---");
await U.renderQueue();
U.queueSelClear();
U.queueSelectionToggle(STANCE_ABOUT_A, true);
U.FORCESCOPE(STANCE_ABOUT_A, "instance");   /* what a plane built before IC-60 published: no project scope */
before = WIRE.length;
await U.queueApplySet("proposedispose", { to: "dismissed", reason: "a reason" });
sent = sentDisposals(before);
ok("fixture: the forced item went as the pre-IC-60 key shape (no project) — the call the plane refuses",
   sent.length === 1 && "key" in sent[0].body.items[0] && !("project" in sent[0].body.items[0]), JSON.stringify(sent.map((w) => w.body)));
const kept = itemBlock(STANCE_ABOUT_A) || keptBlock(STANCE_ABOUT_A);
ok("it is KEPT, carrying the plane's code and the plane's own sentence naming what to send, verbatim",
   !!kept && /q-retained/.test(kept) && /NO_PROJECT_SCOPE/.test(unent(kept))
   && /it needs the project you are acting for/.test(unent(kept)), unent(kept));
ok("READ BACK: nothing was written for it", await (async () => { const q = await queue();
  return ((q.disposed && q.disposed.findings) || []).filter((r) => r.finding === STANCE_ABOUT_A).length === 0; })());

/* ============================================================ 6. THE PICKER IS WIRED */
console.log("\n--- 6. the case picker is bound, on an attribute of its own ---");
ok("queueWire binds [data-qsethome] to queueHomeTo", /\[data-qsethome\][\s\S]{0,80}queueHomeTo/.test(U.WIRESRC()));
} finally {
  await mf.dispose();
}
console.log(`\nqueue-projectscope: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
