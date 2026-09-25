/* D-189 — A PROJECT THAT CARRIES ITS OWN BIAS SAYS SO, ON THE PROJECT AND ON WHAT IT PUBLISHES, AGAINST THE REAL PLANE.
 * Design: `docs/architecture/BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption" (DEC-46) — *"Project managers
 * define project bias. A project bias bundle may add statements and may OVERRIDE (nullify or replace) instance
 * statements"*; *"Every work product cites its BIAS MANIFEST … The manifest is part of the evidentiary record and
 * travels with publication."*
 *
 * THE ROW'S ACCEPTS-WHEN: *"a project with an adopted set shows it; an empty manifest shows no indicator. NEGATIVE
 * CONTROL: render the indicator on an empty manifest, and that arm fails by name."*
 *
 * WHAT WAS WRONG, measured on `origin/main` @ 5e8a65a8: no line of `app.html` called `op=biasmanifest`, `op=biasadopt`
 * or `op=biasinhale` (construct 7.ui ABSENT), so no page could say a project carries a bias of its own; and the
 * published case page's "Declared bias" field printed the HUNCH legs alone, under a comment reading *"DECLARED BIAS is
 * the HUNCH legs and nothing else"* — while D-84 stamps the bias sets in force into the very case document it signs.
 *
 * ===================== WHY THE PLANE HERE IS REAL =====================
 * `bio-plane/src/index.mjs` runs under miniflare. Bias sets are written, offered and adopted through op=promote and
 * op=biasadopt at INSTANCE and at PROJECT scope; two cases are published with op=publish and signed with a real
 * `ssh-keygen` key (op=caseratify, `caseceremony.mjs`), ONE before anything was adopted and ONE after. The workspace
 * renders op=biasmanifest's answer; the published page renders the signed case document's own block, as the case's
 * container (op=publishedcase's `manifest.case_document`) carries it. No fixture of either answer exists in this file.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (1) SAY "ITS OWN BIAS" FOR ANY SET IN FORCE — §2 renders a project working under the INSTANCE's set alone, where
 *      the page must say the project carries none of its own.
 *  (2) READ TODAY'S LENS ON THE PUBLISHED PAGE — §4 re-opens case X, published BEFORE anything was adopted, after
 *      both sets are in force: its signed bytes say nothing was in force, and the page must still show no indicator.
 *      (The published page is credential-free; op=biasmanifest is not, so it could not ask — and §4 asserts it did not.)
 *  (3) DRAW AN INDICATOR FOR EVERY ANSWER — §1 renders the empty manifest on both surfaces; the control's `empty*`
 *      arms are exactly that liar, and each fails by name.
 *
 * ================== WHAT THIS SUITE CANNOT SEE, STATED ==================
 *  - The DOM is a stub, the reach every civicos-ui suite has; the rendered HTML is read as text.
 *  - `in_force: null` (a pin whose bytes the record cannot produce) is "not reachable through the ops"
 *    (construct-status 7.manifest-stamped) and is not driven; nor is a LOCK VIOLATION or a PROJECT NULLIFICATION.
 *  - `pins_proposed` (REC-210) is rendered by the workspace and not driven here. REC-219 (integrated, not on main)
 *    carries it into the FROZEN block; the published page does not read it until that lands.
 *  - The published page's two NO-DOCUMENT branches (no container yet — the `awaiting` window — and a container carrying no
 *    case document) and the pre-D-84 `absent` branch are not driven against the plane; `publishedcase.test.mjs`'s
 *    mocks reach the first.
 *
 * NEGATIVE CONTROL: arms declared and run in `project-bias.control.mjs`; results recorded on the line below.
 * CONTROL RESULT 2026-09-25 (D-189 worker), `node civicos-ui/test/project-bias.control.mjs`, exit 0, every arm armed
 * alone on the EXTRACTED script, each splice matched exactly once:
 *   baseline     exit 0 · 26 pass / 0 fail.
 *   emptyproject exit 1 · 25/1 — "§1 THE WORKSPACE DRAWS NO INDICATOR for an empty manifest", as declared.
 *   emptycase    exit 1 · 24/2 — "§1 THE PUBLISHED PAGE DRAWS NO INDICATOR" and §4 "FROZEN, NOT TODAY'S", as declared.
 *   ownignored   exit 1 · 23/3 — §3 "marks ONE set as its own", "THE WORKSPACE SAYS B CARRIES ITS OWN BIAS", AND §3
 *                "names both sets" — ONE MORE than declared, and it is the arm's own reach, not a second cause: with
 *                `own` emptied the "This project's own" row is never drawn, so B's set leaves the page with it.
 *   hunchonly    exit 1 · 23/3 — §4's three case-Y arms, as declared.
 *   spelling     exit 0 · 26/0 — OVER-STRICTNESS, GREEN as declared.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: shared, for its side effect. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { execFileSync, spawnSync } from "child_process";
import { mkdtempSync, writeFileSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { appScript } from "./extract.mjs";
import { ratifyCase } from "../../bio-plane/test/caseceremony.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${String(detail).slice(0, 600)}` : ""}`); fail++; }
};
let mf = null;
const finish = async (code) => {
  console.log(`\nproject-bias: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const enc = encodeURIComponent;

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("project-bias: FAILED — ssh-keygen is not on PATH, and a case document is published only once it is "
    + "signed; this suite does not pass over a fixture it could not build");
  process.exit(1);
}
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("project-bias: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
const APP = process.env.D189_APP_SRC || null;   /* the control harness hands a mutated app script through this */
mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname, script: fs.readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "d189-instance", ADMIN_TOKEN: "adm-d189", MEMBER_TOKEN: "mem-d189",
              PROBE_TOKEN: "prb-d189", DAEMON_TOKEN: "dmn-d189", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const must = async (what, r) => {
  if (!r || r.ok !== true) { ok(`FIXTURE: ${what}`, false, JSON.stringify(r).slice(0, 400)); await finish(1); }
  return r;
};

try {
/* ============================================================
   0. THE GROUND — case-frozen-pair.test.mjs's publishing fixture, through the real ops
   ============================================================ */
console.log("\n--- 0. the ground: two projects over one question, one case published before any bias set is adopted ---");
const dir = mkdtempSync(join(tmpdir(), "d189-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "iris", "-f", join(dir, "iris"), "-q"]);
const keyB64 = readFileSync(join(dir, "iris.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "iris"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const add = await must("memberadd iris", await POST("op=memberadd&token=adm-d189",
  { memberId: "iris", cover: "cover for iris", role: "admin", capabilities: ["contribute", "publish"] }));
await must("enroll iris", await POST("op=enroll", { invite: add.invite, handle: "iris", password: "iris-passphrase-1" }));
const lg = await POST("op=login", { role: "member:iris", password: "iris-passphrase-1" });
if (!lg?.token) { ok("FIXTURE: login iris", false, JSON.stringify(lg)); await finish(1); }
const IRIS = lg.token;
await must("register iris's signing key",
  await POST("op=signeradd&token=adm-d189", { keyB64, memberId: "iris", comment: "iris laptop" }));

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`] : v === undefined ? []
  : typeof v === "boolean" ? [`    ${k}: ${v}`] : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", "and"), ...scalar("state", "suggested"),
    ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("claim", v.claim), ...scalar("author", "iris"), ...scalar("at", NOW)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ['  - version: "' + v.name + '"', ...scalar("ground", g), ...scalar("asserted_by", "iris"), ...scalar("at", NOW)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ['  - version: "' + v.name + '"', ...scalar("target", l.target), ...scalar("role", "supports"),
     ...scalar("ground", l.ground), ...scalar("grade", l.grade), ...scalar("grade_axis", "capture"),
     ...scalar("grade_source", "capture")].join("\n")));
  return ["basis_versions:", ...rows, ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
          ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};
const inquiryMd = (id, { title, versions = [], basis = [] }) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${title}"`,
  "current_state: open", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: d189-instance",
  ...(basis.length ? ["references:", ...basis.flatMap((b) => [`  - target: ${b}`, "    rel: cites", "    status: confirmed"])]
                   : ["references: []"]),
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle", "    description: The adopted budget may restate it.",
  ...(basis.length ? ["basis:", ...basis.flatMap((b) => [`  - target: ${b}`, "    role: supports"])] : []),
  ...versionLines(versions),
  "---", "", "## Question", "", "Did the transfer follow the process?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: d189-instance", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = (title, cites) => ["---", "object_type: project", "schema: project@1", `title: "${title}"`,
  "current_state: investigating", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: d189-instance",
  "references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."', "---", "", "## Thesis Summary", "",
  "A project.", "", "## Open Questions", "", "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");
let snapSeq = 0;
/* CORRECTED 2026-09-25 at the c22-batch30 union (CONDUCT #22), never exempted: this item was cut before D-563, whose
   C-86.3 refuses an envelope title the held document contradicts (`Bundle <id>` / `Project <label>` against the
   document's own `title:`). The envelope now carries the document's OWN title, read from its front matter, so the
   request and the document name it alike; its dates were already the document's own (NOW / LATER). */
const ownTitle = (text) => { const m = /^title: "(.*)"$/m.exec(text); return m ? m[1] : undefined; };
const promote = (id, text, type) => POST(`op=promote&token=${IRIS}`, {
  bundleId: id, base: null, snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information" ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "d189-instance", title: ownTitle(text) ?? `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER } });
const createProject = async (label, text) => {
  const r = await POST(`op=promote&token=${IRIS}`, { base: null,
    snapKey: `${label}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "d189-instance", title: ownTitle(text) ?? `Project ${label}`,
            current_state: "investigating", created: NOW, last_updated: LATER } });
  if (!r?.ok || typeof r.bundleId !== "string") { ok(`FIXTURE: create project ${label}`, false, JSON.stringify(r)); await finish(1); }
  return r.bundleId;
};

const LEDGER = "INFO-2026-8189-ledger", MINUTES = "INFO-2026-8189-minutes", AUDIT = "INFO-2026-8189-audit";
for (const d of [LEDGER, MINUTES, AUDIT]) await must(`promote ${d}`, await promote(d, infoMd(d), "information"));
const V1 = { name: "paper trail", claim: "The transfer followed the process the council adopted in 2024.",
  description: "The ledger and the minutes together show the transfer was authorised.", grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail", grade: "B" }, { target: MINUTES, ground: "paper trail", grade: "C" }] };
const V2 = { name: "the audit", claim: "The transfer bypassed the council vote the adopted process requires.",
  description: "The audit shows the transfer happened without the required vote.", grounds: ["the audit"],
  legs: [{ target: AUDIT, ground: "the audit", grade: "A" }] };
const Q = "INQ-2026-8189-shared";
await must(`promote ${Q}`, await promote(Q, inquiryMd(Q, { title: "Did the transfer follow the process?",
  versions: [V1, V2], basis: [LEDGER] }), "inquiry"));
/* A works under whatever the INSTANCE adopts; B adopts a set of its OWN. */
const A = await createProject("oversight", projectMd("Oversight", [Q]));
const B = await createProject("neighbours", projectMd("Neighbours", [Q]));
const act = (verb, target, version, extra = "") =>
  POST(`op=version${verb}&token=${IRIS}&target=${enc(target)}&version=${enc(version)}${extra}`, {});
for (const v of [V1, V2]) await must(`accept ${v.name}`, await act("accept", Q, v.name, `&reason=${enc("the evidence holds")}`));
const FALSIFIER = "a council minute showing the vote was never taken";
let pubSeq = 0;
const publish = (project, extra = {}) => { const n = ++pubSeq; return POST(`op=publish&token=${IRIS}`, {
  project, scope: `Whether the record answers ${Q} (publication ${n}).`, targets: [Q], roles: { [Q]: "load_bearing" },
  statement: `This case does not cover the 2025 transfers (publication ${n}).`, subjectPosition: "sought_no_answer",
  subjectJustification: `The subject was asked and declined to comment (publication ${n}).`,
  biasAcknowledgement: `The publishing project is funded by a party with an interest (publication ${n}).`,
  excluded: [{ target: null, description: `The 2025 transfers (publication ${n})`, reason: "Out of scope." }], ...extra }); };
const ratifyQ = (bundleSha) => POST(`op=ratify&token=${IRIS}`, { bundleId: Q, expectedSha: bundleSha, sig: signRatify(Q, bundleSha) });
const lensOf = (p) => GET(`op=biasmanifest&token=${IRIS}&scope=project&scopeId=${enc(p)}`);

/* CASE X — published from A while NOTHING is adopted anywhere. */
const L0 = await lensOf(A);
ok("FIXTURE: before any adoption the plane answers A's scope with an EMPTY manifest — in_force false, nothing named, "
 + "no replacement marker",
   L0?.ok === true && L0.in_force === false && (L0.bundles || []).length === 0 && !("pins_proposed" in L0),
   JSON.stringify(L0));
await must("A stands on reading 1", await act("current", Q, V1.name, `&project=${enc(A)}`));
await must("A concludes", await POST(`op=conclude&token=${IRIS}&falsifier=${enc(FALSIFIER)}&target=${enc(Q)}&project=${enc(A)}`, {}));
const pubA = await must("A publishes case X over Q", await publish(A));
await ratifyCase(async (q, b) => POST(q, b), pubA, { dir, key: "iris", token: IRIS });
await must("Q ratifies at case X's pin", await ratifyQ(pubA.bundleSha));
const CASE_X = String(pubA.caseId);

/* ============================================================ THE SURFACE */
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null,
  setAttribute(){}, getAttribute(){ return null; } };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }
const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
const WIRE = [];
let HASH = "";
const ctx = { console, URL, URLSearchParams, JSON, Array, Object, String, Number, Math, Date, RegExp, Promise,
  Uint8Array, Uint16Array, Map, Set, TextEncoder, TextDecoder, crypto: webcrypto, Blob: class{}, IntersectionObserver: undefined,
  setInterval:()=>1, clearInterval(){}, setTimeout:fn=>{fn();return 1;}, requestAnimationFrame:fn=>fn(), matchMedia:()=>({matches:false}),
  document:{ querySelector:$$, querySelectorAll:()=>[], addEventListener(){}, documentElement:{setAttribute(){}},
    getElementById:()=>el(), hidden:false, createElement:()=>el(), body:{appendChild(){}} },
  location:{ protocol:"https:", get hash(){ return HASH; }, set hash(v){ HASH = v; } },
  history:{ pushState(){}, back(){}, replaceState(){} },
  localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} }, sessionStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
  window:{ addEventListener(){}, open:()=>null },
  fetch: async (u, opts) => {
    const url = new URL(u, "http://x");
    WIRE.push(Object.fromEntries(url.searchParams.entries()));
    return mf.dispatchFetch(url.toString(), opts);
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext((APP ? fs.readFileSync(APP, "utf8") : appScript())
  + ";globalThis.__U = { PLANE, openProjectWorkspace, pubOpen };", ctx);
const U = ctx.__U;
U.PLANE.base = "http://x";
U.PLANE.token = IRIS;
U.PLANE.session = true;
U.PLANE.me = { member: "iris", handle: "iris", session: true, administer: false, capabilities: ["contribute"] };
const workspace = async (p) => { await U.openProjectWorkspace(p); return $$("#content")._html; };
const published = async (cid) => { await U.pubOpen(cid); return $$("#pub-body")._html; };
const strip = (h) => String(h).replace(/<[^>]*>/g, " ").replace(/&middot;/g, "·").replace(/&mdash;/g, "—")
  .replace(/&amp;/g, "&").replace(/&rsquo;/g, "'").replace(/\s+/g, " ");
const OWN = /carries its own bias/i;

/* ============================================================ 1. THE EMPTY MANIFEST — NO INDICATOR */
console.log("\n--- 1. an EMPTY manifest shows no indicator, on the workspace and on the published page ---");
{
  const html = await workspace(A);
  ok("§1 reach: A's workspace rendered", html.includes("Who is working on this"), strip(html).slice(0, 300));
  ok("§1 THE WORKSPACE DRAWS NO INDICATOR for an empty manifest — no bias section at all, while the plane answers "
   + "A's scope in_force false with nothing named",
     !/data-project-bias=/.test(html) && !/data-bias-in-force=/.test(html) && !OWN.test(strip(html))
     && !/The bias this project works under/.test(html), strip(html).slice(0, 600));
  ok("§1 and it did ASK: op=biasmanifest at project scope for A (an empty section drawn without asking would pass the arm above)",
     WIRE.some((w) => w.op === "biasmanifest" && w.scope === "project" && w.scopeId === A), JSON.stringify(WIRE.map((w) => w.op)));
  const px = await published(CASE_X);
  ok("§1 reach: the published page for case X rendered its header", /data-dec34="1"/.test(px), strip(px).slice(0, 300));
  ok("§1 THE PUBLISHED PAGE DRAWS NO INDICATOR for case X, whose signed document says nothing was in force",
     !/data-case-bias=/.test(px) && !OWN.test(strip(px)), strip(px).slice(0, 600));
  const pcx = await GET(`op=publishedcase&id=${enc(CASE_X)}`);
  ok("§1 and the page HAD the signed document in hand — case X's container carries it, with its empty block (an "
   + "indicator suppressed for want of a document would pass the arm above)",
     typeof pcx?.manifest?.case_document?.text === "string" && /\n  in_force: false\n/.test(pcx.manifest.case_document.text)
     && !/data-case-bias="no-document"/.test(px), JSON.stringify(pcx?.manifest?.case_document ?? null).slice(0, 300));
}

/* THE BIAS SETS: one at INSTANCE scope, one at B's PROJECT scope, each written in draft, offered, adopted and
   promoted to `adopted` through the real doors (queue-recipients.test.mjs's sequence). */
const biasMd = (id, state, sid, text) => ["---", `id: ${id}`, "object_type: bias", "schema: bias@1", `title: "Lens ${id}"`,
  `current_state: ${state}`, "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: human", "  capability_tier: member", "group: d189-instance", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "statements:", `  - id: ${sid}`, '    kind: "scrutiny"', '    subject: "ENT-2026-0007"',
  `    text: ${JSON.stringify(text)}`, '    justification: "The office is a party to several matters this group is examining."',
  "    citations: []", "    locked: false", "---", "", "## Statements", "", "The lens this group works under.", "",
  "## Adoption", "", "Adopted at the members' meeting.", "", "## What This Does Not Enforce", "",
  "BIO checks that each statement names a registered subject and carries a justification.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const HEAD = new Map();
const writeBias = async (id, state, sid, text) => {
  const md = biasMd(id, state, sid, text);
  const r = await POST(`op=promote&token=${IRIS}`, { bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260925T07${String(++snapSeq).padStart(4, "0")}Z_bias`,
    meta: { object_type: "bias", group: "d189-instance", title: `Lens ${id}`, current_state: state,
            created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] });
  if (r?.bundleSha) HEAD.set(id, r.bundleSha);
  return r?.ok === true;
};
const BI = "BIAS-2026-8189-instance", BP = "BIAS-2026-8189-project";
const TI = "Claims from the city attorney's office need a second record.";
const TP = "Claims from a council member's own office need a document the office did not write.";
const adoptOk = [
  await writeBias(BI, "draft", "si1", TI), await writeBias(BI, "proposed", "si1", TI),
  (await GET(`op=biasadopt&token=${IRIS}&bundleId=${BI}`))?.ok === true, await writeBias(BI, "adopted", "si1", TI)];
const LI = await lensOf(A);
ok("FIXTURE: the INSTANCE set is in force over A, and the plane names it at scope `instance` alone",
   adoptOk.every(Boolean) && LI?.in_force === true
   && JSON.stringify((LI.bundles || []).map((b) => [b.bundle_id, b.scope])) === JSON.stringify([[BI, "instance"]]),
   JSON.stringify({ adoptOk, LI }));
adoptOk.push(await writeBias(BP, "draft", "sp1", TP), await writeBias(BP, "proposed", "sp1", TP),
  (await GET(`op=biasadopt&token=${IRIS}&bundleId=${BP}&scope=project&scopeId=${enc(B)}`))?.ok === true,
  await writeBias(BP, "adopted", "sp1", TP));
const LB = await lensOf(B);
const LA2 = await lensOf(A);
ok("FIXTURE: B's scope names BOTH sets — its own at scope `project` and the instance's — and A's still names the "
 + "instance's alone (a project set binds its project only)",
   adoptOk.every(Boolean) && LB?.in_force === true
   && JSON.stringify((LB.bundles || []).map((b) => [b.bundle_id, b.scope]).sort())
      === JSON.stringify([[BI, "instance"], [BP, "project"]].sort())
   && JSON.stringify((LA2?.bundles || []).map((b) => b.bundle_id)) === JSON.stringify([BI]),
   JSON.stringify({ adoptOk, LB: LB?.bundles, LA2: LA2?.bundles }));

/* CASE Y — published from B under both sets. */
await must("B stands on reading 2", await act("current", Q, V2.name, `&project=${enc(B)}`));
await must("B concludes", await POST(`op=conclude&token=${IRIS}&falsifier=${enc(FALSIFIER)}&target=${enc(Q)}&project=${enc(B)}`, {}));
const pubB = await must("B publishes a NEW case Y over Q", await publish(B, { newCase: true }));
await ratifyCase(async (q, b) => POST(q, b), pubB, { dir, key: "iris", token: IRIS });
await must("B's ratification of Q (the same bytes: a retry)", await ratifyQ(pubB.bundleSha));
const CASE_Y = String(pubB.caseId);
const docOf = async (pub) => GET(`op=casedocument&case=${enc(pub.caseDocument.case_id)}&edition=${pub.caseDocument.edition}`);
const DX = await docOf(pubA), DY = await docOf(pubB);
ok("FIXTURE: case X's SIGNED document says nothing was in force; case Y's names both sets and B's own at scope project",
   typeof DX?.text === "string" && /\n  in_force: false\n/.test(DX.text) && !/\n  - bundle_id: /.test(DX.text)
   && typeof DY?.text === "string" && /\n  in_force: true\n/.test(DY.text)
   && DY.text.includes(`  - bundle_id: ${BP}\n    revision: `) && DY.text.includes(`  - bundle_id: ${BI}\n    revision: `)
   && /bundle_id: BIAS-2026-8189-project\n    revision: [0-9a-f]{64}\n    scope: project/.test(DY.text),
   JSON.stringify({ x: DX?.text?.slice(0, 900), y: DY?.text?.slice(0, 900) }));
/* §0 INSTRUMENT: the sets' ids appear in op=publishedcase's answer for case Y at EXACTLY ONE path — inside the signed
   case document the container carries whole — so a published page that names them read them out of those bytes. */
const PCY = await GET(`op=publishedcase&id=${enc(CASE_Y)}`);
const namingPaths = (o, at = "", out = []) => { if (typeof o === "string") { if (o.includes(BI) || o.includes(BP)) out.push(at); }
  else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) namingPaths(v, at + "." + k, out); return out; };
ok("§0 INSTRUMENT: op=publishedcase for case Y names the bias sets ONLY inside `manifest.case_document.text` — the signed "
 + "document the container carries, and that document's text is the case's own (its sha is the one op=casedocument serves)",
   PCY?.ok !== false && JSON.stringify(namingPaths(PCY)) === JSON.stringify([".manifest.case_document.text"])
   && PCY.manifest.case_document.text === DY.text && PCY.manifest.case_document.doc_sha === DY.doc_sha,
   JSON.stringify(namingPaths(PCY)));

/* ============================================================ 2. THE INSTANCE'S SET ONLY */
console.log("\n--- 2. project A works under the instance's set alone: shown, and NOT called its own ---");
{
  const html = await workspace(A);
  ok("§2 reach: the workspace rendered", html.includes("Who is working on this"), strip(html).slice(0, 300));
  const m = /data-project-bias="([^"]*)"/.exec(html);
  ok("§2 A's workspace shows the set in force and marks ZERO sets as its own", !!m && m[1] === "0" && html.includes(BI),
     strip(html).slice(0, 600));
  ok("§2 and does NOT say A carries its own bias", !OWN.test(strip(html)));
  ok("§2 the statement in force is shown in the record's words", html.includes("city attorney"));
}

/* ============================================================ 3. THE ROW'S ACCEPTS-WHEN */
console.log("\n--- 3. project B carries its own bias: the workspace says so and shows the set ---");
{
  const html = await workspace(B);
  const m = /data-project-bias="([^"]*)"/.exec(html);
  ok("§3 B's workspace marks ONE set as its own", !!m && m[1] === "1", strip(html).slice(0, 600));
  ok("§3 THE WORKSPACE SAYS B CARRIES ITS OWN BIAS", OWN.test(strip(html)), strip(html).slice(0, 600));
  ok("§3 and names both sets, its own and the instance's", html.includes(BP) && html.includes(BI));
  ok("§3 and both statements in force, in the record's words", html.includes("council member") && html.includes("city attorney"));
  const asked = WIRE.filter((w) => w.op === "biasmanifest");
  ok("§3 WIRE: the workspace asked op=biasmanifest at PROJECT scope for the project it shows",
     asked.some((w) => w.scope === "project" && w.scopeId === B), JSON.stringify(asked));
}

/* ============================================================ 4. THE PUBLISHED PAGE */
console.log("\n--- 4. the published case carries the bias sets its signed document froze, and no others ---");
{
  const py = await published(CASE_Y);
  const m = /data-case-bias="([^"]*)"/.exec(py);
  ok("§4 case Y's page marks ONE set as the project's own", !!m && m[1] === "1", strip(py).slice(0, 600));
  ok("§4 THE PUBLISHED PAGE SAYS THE CASE'S PROJECT CARRIES ITS OWN BIAS, naming both sets",
     OWN.test(strip(py)) && py.includes(BP) && py.includes(BI), strip(py).slice(0, 800));
  const stamped = (/\n  statements_sha: ([0-9a-f]{64})\n/.exec(DY.text) || [])[1];
  ok("§4 and carries the statements hash the signed document froze", !!stamped && py.includes(stamped));
  const px = await published(CASE_X);
  ok("§4 FROZEN, NOT TODAY'S: case X, published before either set, still shows no indicator after both are in force",
     !/data-case-bias=/.test(px) && !px.includes(BI) && !px.includes(BP));
  const pubOps = [...new Set(WIRE.filter((w) => !w.token).map((w) => w.op))].sort();
  ok("§4 WIRE: the published page made no read beyond those it already made — the bias sets come out of the container "
   + "it holds, never out of a working-record op or a credentialed call",
     !WIRE.some((w) => w.op === "casedocument" || (w.op === "biasmanifest" && !w.token))
     && pubOps.every((op) => ["instancegroup", "publishedbytes", "publishedcase", "publishedmanifest", "verify"].includes(op)),
     JSON.stringify(pubOps));
}

/* ============================================================ 5. THE CORRECTED SENTENCE */
console.log("\n--- 5. the hunch-only sentence is gone ---");
{
  const src = APP ? fs.readFileSync(APP, "utf8") : appScript();
  ok("§5 app.html no longer says declared bias is the hunch legs and nothing else",
     !/HUNCH legs and nothing else/.test(src));
}
} finally {
  await finish();
}
