/* UI-81 — THE PUBLISHED CASE PAGE, HANDED A FINDING ID SEVERAL CASES PIN, OFFERS THOSE CASES AS
 * CHOICES, OPENS EACH ONE, AND NEVER PICKS ONE; AND THE PLANE'S REFUSAL CARRIES ITS CANNED TRANSLATION.
 *
 * BIO_Publication_v0_1.md §3 rule 12 (D-442) makes a finding pinned by several cases the normal
 * shape: a finding is shared, and each case pins it by its sha. `op=publishedcase` handed that
 * finding's id alone refuses and NAMES every case (D-309, IC-74) — each case is its own artifact,
 * with its own scope and completeness statement, so serving one would choose for the reader. Before
 * this item `pubOpen` printed that answer under "Not answered", as if the question had failed; the
 * record had answered it, with the list. And DEC-49 (restated as BIO_Assistant_and_AI_Roles_v0_1.md
 * rule 10: every code a surface can receive has a translation) could not see the code at all: no
 * `*_CHECKS` row named it, and the surface keys on the refusal's `cases[]`, never on the code.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (a) PICK THE FIRST CASE AND OPEN IT SILENTLY — the page then "works" for a reader who meant that
 *      case. So section 2 asserts that opening the finding id painted NO case page and asked the plane
 *      for NO case by name, and that BOTH named cases are offered.
 *  (b) OFFER TWO CHOICES THAT BOTH OPEN THE SAME CASE. So section 3 CLICKS each choice (its own
 *      `onclick`, run in the page) and asserts the page then holds THAT case, read back from the plane,
 *      with this finding in it.
 *  (c) PRINT THE CODE — the cheapest honest-looking page. Section 2 asserts no machine code renders and
 *      the words above the choices are the plane's own `translation`, verbatim.
 *
 * WHY IT IS REAL: the two cases exist only once ratified with real SSHSIG signatures, so the plane is
 * `bio-plane/src/index.mjs` under miniflare and the fixture is UI-80's (`case-frozen-pair.test.mjs`,
 * itself D-442's): two projects, two cases over one finding. Every expected value is read back from
 * the plane's own public op. WHAT IT CANNOT SEE: a plane older than this item (no `translation` on
 * the refusal) is driven over a wire-shaped mock in section 4; nothing is live (no deploy is this
 * item's).
 *
 * NEGATIVE CONTROL: `node civicos-ui/test/several-cases-choice.control.mjs` from the repo root — every
 * arm ALONE, each anchor matched EXACTLY ONCE, restored by cp from a per-arm pristine copy and
 * verified by sha256 AND cmp. RUN 2026-09-23 by the UI-81 worker, 13/13 AS DECLARED on its sixth run, on the tree
 * merged onto origin/main 91913d6b (arm F3 added on the fourth: the plane's caseflip.test.mjs RED 58/1 at its C-44.2
 * assertion alone), against app.html 8d6bb395f2bafae0… (1,427,596 B), bio-checks.mjs 9921ca44e8993097… (828,961 B),
 * store.mjs 710efa533ccf22e2… (2,842,453 B), every file IDENTICAL after. Baselines: suite 15/0, guard GREEN.
 *   (A) THE ROW'S — the C-44.2 row dropped -> guard RED, 9 failures, naming the ORPHANED REGION
 *       `is-finding-in-several-cases` and eight floors, and NEVER THE CODE: without its row the code is out of the
 *       reach again, which is main's blindness exactly (declared naming the code on the first run; that declaration was
 *       wrong and is corrected in the control, not smoothed).
 *   (A2) the row's `translation` dropped -> guard RED, 1 failure, BY THE CODE: "CASE_DERIVATION_CHECKS.
 *       FINDING_IN_SEVERAL_CASES has NO CANNED TRANSLATION".
 *   (B) THE LIAR — `pubOpen` opens the FIRST case silently -> 5/10, at "NEVER PICKS" and "CHOICES" (and the plane arms
 *       green). Its FIRST run never reached this suite's foot: section 4's mock answered the refusal to every id, so the
 *       liar recursed on it forever — a second cause, fixed in the MOCK (it answers the finding's id only).
 *   (C) the defect as shipped (no choices branch) -> 6/9, at "CHOICES" and "THE PLANE'S WORDS".
 *   (D) the code printed -> 12/3, at "NO RAW CODE" and "THE PLANE'S WORDS"; "CHOICES" green.
 *   (E) every choice opens the first case -> 12/3, at "OPENS: the choice for case <the second>" and "EDITION".
 *   (F) the store's `refusal` helper removed, the row kept -> 15/0 GREEN: declared RED on the first run and came back
 *       GREEN, a finding about the ARM — D-262's `dec49Attach` decorates every `ok:false` answer whose reason has a row,
 *       so the ROW is what the wire carries; the helper is the literal the guard's region reads. Re-declared GREEN.
 *   (F2) the row's translation dropped, through this suite -> 13/2, at "DEC-49: the refusal carries" and "THE PLANE'S
 *       WORDS"; "CHOICES", "NEVER PICKS" and "OPENS" green (the page falls back to the plane's detail).
 *   (BEFORE) the three files as origin/main @ 4355bfda -> 4/11, at "DEC-49: the refusal carries", "CHOICES", "THE
 *       PLANE'S WORDS" and the rest; "SUBSTRATE" green.
 *   (G) OVER-STRICTNESS — the page's own heading and note re-worded -> 15/0 GREEN.
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
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
let mf = null;
const finish = async (code) => {
  console.log(`\nseveral-cases-choice.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const enc = encodeURIComponent;

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("several-cases-choice.test.mjs: FAILED — ssh-keygen is not on PATH, and a case exists only once "
    + "ratified with a real signature; this suite does not pass over a fixture it could not build");
  process.exit(1);
}
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("several-cases-choice: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
  process.exit(1);
}
const IDX = new URL("../../bio-plane/src/index.mjs", import.meta.url);
mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX.pathname,
  script: fs.readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "ui81-instance", ADMIN_TOKEN: "adm-ui81", MEMBER_TOKEN: "mem-ui81",
              PROBE_TOKEN: "prb-ui81", DAEMON_TOKEN: "dmn-ui81", VERSION: "test",
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

/* ============================================================
   0. THE GROUND — UI-80's fixture (D-442's), through the real ops
   ============================================================ */
const dir = mkdtempSync(join(tmpdir(), "ui81-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "iris", "-f", join(dir, "iris"), "-q"]);
const keyB64 = readFileSync(join(dir, "iris.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "iris"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const add = await must("memberadd iris", await POST("op=memberadd&token=adm-ui81",
  { memberId: "iris", cover: "cover for iris", role: "admin", capabilities: ["contribute", "publish"] }));
await must("enroll iris", await POST("op=enroll", { invite: add.invite, handle: "iris", password: "iris-passphrase-1" }));
const lg = await POST("op=login", { role: "member:iris", password: "iris-passphrase-1" });
if (!lg?.token) { ok("FIXTURE: login iris", false, JSON.stringify(lg)); await finish(1); }
const IRIS = lg.token;
await must("register iris's signing key",
  await POST("op=signeradd&token=adm-ui81", { keyB64, memberId: "iris", comment: "iris laptop" }));

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
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: ui81-instance",
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
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: ui81-instance", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = (title, cites) => ["---", "object_type: project", "schema: project@1", `title: "${title}"`,
  "current_state: investigating", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: ui81-instance",
  "references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."', "---", "", "## Thesis Summary", "",
  "A project.", "", "## Open Questions", "", "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");
let snapSeq = 0;
const promote = (id, text, type) => POST(`op=promote&token=${IRIS}`, {
  bundleId: id, base: null, snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information" ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "ui81-instance", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER } });
const createProject = async (label, text) => {
  const r = await POST(`op=promote&token=${IRIS}`, { base: null,
    snapKey: `${label}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "ui81-instance", title: `Project ${label}`,
            current_state: "investigating", created: NOW, last_updated: LATER } });
  if (!r?.ok || typeof r.bundleId !== "string") { ok(`FIXTURE: create project ${label}`, false, JSON.stringify(r)); await finish(1); }
  return r.bundleId;
};

const LEDGER = "INFO-2026-8180-ledger", MINUTES = "INFO-2026-8180-minutes", AUDIT = "INFO-2026-8180-audit";
for (const d of [LEDGER, MINUTES, AUDIT]) await must(`promote ${d}`, await promote(d, infoMd(d), "information"));
const V1 = { name: "paper trail", claim: "The transfer followed the process the council adopted in 2024.",
  description: "The ledger and the minutes together show the transfer was authorised.", grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail", grade: "B" }, { target: MINUTES, ground: "paper trail", grade: "C" }] };
const V2 = { name: "the audit", claim: "The transfer bypassed the council vote the adopted process requires.",
  description: "The audit shows the transfer happened without the required vote.", grounds: ["the audit"],
  legs: [{ target: AUDIT, ground: "the audit", grade: "A" }] };
const Q = "INQ-2026-8180-shared";
await must(`promote ${Q}`, await promote(Q, inquiryMd(Q, { title: "Did the transfer follow the process?",
  versions: [V1, V2], basis: [LEDGER] }), "inquiry"));
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

await must("A stands on reading 1", await act("current", Q, V1.name, `&project=${enc(A)}`));
await must("A concludes", await POST(`op=conclude&token=${IRIS}&falsifier=${enc(FALSIFIER)}&target=${enc(Q)}&project=${enc(A)}`, {}));
const pubA = await must("A publishes case X over Q", await publish(A));
await ratifyCase(async (q, b) => POST(q, b), pubA, { dir, key: "iris", token: IRIS });
await must("Q ratifies at case X's pin", await ratifyQ(pubA.bundleSha));
await must("B stands on reading 2", await act("current", Q, V2.name, `&project=${enc(B)}`));
await must("B concludes", await POST(`op=conclude&token=${IRIS}&falsifier=${enc(FALSIFIER)}&target=${enc(Q)}&project=${enc(B)}`, {}));
const pubB = await must("B publishes a NEW case Y over Q", await publish(B, { newCase: true }));
await ratifyCase(async (q, b) => POST(q, b), pubB, { dir, key: "iris", token: IRIS });
await must("B's ratification of Q (the same bytes: a retry)", await ratifyQ(pubB.bundleSha));
const CASE_X = String(pubA.caseId), CASE_Y = String(pubB.caseId);
const BOTH = [CASE_X, CASE_Y].sort();

/* ============================================================
   1. THE PLANE — the refusal names both cases AND carries its canned translation (C-44.2)
   ============================================================ */
console.log("\n--- 1. the plane's answer to a finding id two cases pin ---");
const several = await GET(`op=publishedcase&id=${enc(Q)}`);
ok("SUBSTRATE: op=publishedcase by the finding's id refuses naming BOTH cases, and the two are different cases",
   several?.ok === false && CASE_X !== CASE_Y && JSON.stringify([...(several.cases || [])].sort()) === JSON.stringify(BOTH),
   JSON.stringify(several).slice(0, 300));
/* The row is read from the catalogue, never typed here: a hand copy agrees at zero cost. */
const { CASE_DERIVATION_CHECKS } = await import(pathToFileURL(new URL("../../bio-plane/checks/bio-checks.mjs", import.meta.url).pathname).href);
const ROW = Object.values(CASE_DERIVATION_CHECKS || {}).find((r) => r && r.check === "C-44.2") || null;
ok("DEC-49: the refusal carries its CODE, its C-number (C-44.2) and the catalogue row's canned translation — "
 + "the code the reason carries, the translation a sentence and not the code",
   !!ROW && several?.code === several?.reason && several?.check === "C-44.2"
   && typeof several?.translation === "string" && several.translation === ROW.translation
   && several.translation.length > 40 && !several.translation.includes(String(several.code)),
   JSON.stringify({ code: several?.code, check: several?.check, translation: several?.translation }).slice(0, 300));
ok("SHAPE: every field the refusal carried before is still there (IC-185 is additive): reason, target, cases, "
 + "memberships and the plane's detail",
   several && several.reason === several.code && several.target === Q && Array.isArray(several.memberships)
   && BOTH.every((cid) => several.memberships.some((m) => m.case_id === cid)) && typeof several.detail === "string");

/* ============================================================
   THE SURFACE — app.html in a vm, its fetch routed to the real plane (or to a wire-shaped mock)
   ============================================================ */
const WIRE = [];
let MOCK = null;
const els = new Map();
function el(){ const e={ classList:{add(){},remove(){},toggle(){},contains(){return false}}, style:{}, dataset:{},
  value:"", _html:"", textContent:"", scrollTop:0, disabled:false, addEventListener(){},
  querySelector:()=>el(), querySelectorAll:()=>[], insertAdjacentHTML(){}, focus(){}, click(){}, remove(){}, onclick:null };
  Object.defineProperty(e,"innerHTML",{get(){return e._html},set(v){e._html=v}}); return e; }
const $$ = (s) => { if(!els.has(s)) els.set(s, el()); return els.get(s); };
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
    const params = Object.fromEntries(url.searchParams.entries());
    WIRE.push({ op: params.op, params });
    if (MOCK) { const j = MOCK(params.op, params); return { ok: true, status: 200, json: async () => j, clone(){ return this; } }; }
    return mf.dispatchFetch(url.toString(), opts);
  } };
ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(appScript() + ";globalThis.__U = { PLANE, PUB, pubOpen };", ctx);
const U = ctx.__U;
U.PLANE.base = "http://x";
const body = () => $$("#pub-body")._html;
const strip = (h) => String(h).replace(/<[^>]*>/g, " ").replace(/&middot;/g, "·").replace(/&mdash;/g, "—")
  .replace(/&larr;/g, "←").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
const choicesOf = (h) => [...String(h).matchAll(/<div class="pf" data-casechoice="([^"]*)" onclick="([^"]*)"/g)]
  .map((m) => ({ caseId: m[1], onclick: m[2].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&") }));
/* SCREAMING_SNAKE carrying an underscore is machine vocabulary (the guard's own test for a translation). */
const shouty = (t) => [...String(t).matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g)].map((m) => m[1]).filter((c) => c.includes("_"));

/* ============================================================
   2. OPENING THE FINDING ID — the choices, and nothing picked
   ============================================================ */
console.log("\n--- 2. the published page opened by the finding's id, against the real plane ---");
U.PUB.data = null;
WIRE.length = 0;
await U.pubOpen(Q);
const h2 = body(), t2 = strip(h2), c2 = choicesOf(h2);
ok("REACH: the page rendered something for the finding id", t2.length > 40, t2.slice(0, 200));
ok("CHOICES: the page offers BOTH named cases, each once, under its own name — the refusal's `cases[]`, whole",
   c2.length === 2 && JSON.stringify(c2.map((c) => c.caseId).sort()) === JSON.stringify(BOTH)
   && BOTH.every((cid) => t2.includes(cid)), JSON.stringify(c2.map((c) => c.caseId)));
ok("NEVER PICKS: opening the finding id painted NO case page and asked the plane for NO case by name — the reader "
 + "chooses, the page does not",
   U.PUB.data == null && !/class="pub-super"/.test(h2) && !/data-findingsec=/.test(h2)
   && !WIRE.some((w) => w.op === "publishedcase" && w.params.caseId)
   && WIRE.filter((w) => w.op === "publishedcase").every((w) => w.params.id === Q),
   JSON.stringify({ data: U.PUB.data && U.PUB.data.caseId, wire: WIRE.filter((w) => w.op === "publishedcase").map((w) => w.params) }));
ok("NO RAW CODE: the page prints no machine code — not the refusal's code, no SCREAMING_SNAKE at all",
   !t2.includes(String(several?.reason || "FINDING")) && shouty(t2).length === 0, JSON.stringify(shouty(t2)));
ok("THE PLANE'S WORDS: the sentence above the choices is the plane's canned translation, verbatim, and the page "
 + "does not call a complete answer a failure ('Not answered' / 'Not published')",
   typeof several?.translation === "string" && t2.includes(strip(several.translation))
   && !/Not answered|Not published/.test(t2), t2.slice(0, 400));
ok("NOT RANKED: the choices stand in the order the plane named them (it sorts by id and ranks nothing)",
   JSON.stringify(c2.map((c) => c.caseId)) === JSON.stringify(several?.cases || []));

/* ============================================================
   3. EACH CHOICE OPENS ITS OWN CASE — clicked, read back from the plane
   ============================================================ */
console.log("\n--- 3. each choice, clicked ---");
/* OVER THE CASES THE PLANE NAMED, never over the choices the page drew: a page that drew none must
   fail these by name rather than skip them. */
for (const cid of BOTH) {
  const ch = c2.find((c) => c.caseId === cid);
  U.PUB.data = null;
  WIRE.length = 0;
  let threw = null;
  if (ch) { try { await vm.runInContext(ch.onclick, ctx); } catch (e) { threw = String(e); } }
  const h3 = body();
  const direct = await GET(`op=publishedcase&id=${enc(cid)}`);
  ok(`OPENS: the choice for case ${cid} opens THAT case's published page, with this finding in it — the page's case, `
   + `edition and roster read back from the plane's own answer for ${cid}`,
     !!ch && !threw && U.PUB.data && String(U.PUB.data.caseId) === cid && direct?.ok !== false
     && Number(U.PUB.data.edition) === Number(direct.edition)
     && (U.PUB.data.findings || []).some((f) => f.bundle_id === Q)
     && /class="pub-super"|data-findingsec=/.test(h3) && h3.includes(Q),
     JSON.stringify({ choice: ch && ch.onclick, threw, got: U.PUB.data && [U.PUB.data.caseId, U.PUB.data.edition] }));
  ok(`OPENS: the choice for case ${cid} asked the plane for that case and no other`,
     !!ch && WIRE.filter((w) => w.op === "publishedcase").length >= 1
     && WIRE.filter((w) => w.op === "publishedcase").every((w) => w.params.id === cid),
     JSON.stringify(WIRE.filter((w) => w.op === "publishedcase").map((w) => w.params)));
}

/* ============================================================
   4. A PLANE OLDER THAN THIS ITEM — no translation on the refusal
   ============================================================ */
console.log("\n--- 4. a refusal carrying no translation (a plane older than C-44.2), over a wire-shaped mock ---");
/* NARROWER THAN THE WIRE ON PURPOSE (UI-80's precedent, M0-23's): the old refusal also carried its
   code, and NOTHING on the surface reads it — `pubOpen` keys on `cases[]` — so the mock carries only
   the fields the surface reads. */
const OLD_DETAIL = "INQ-2026-8181 is a published finding of 2 cases (CASE-2026-8181, CASE-2026-8182). Ask again naming the case you mean.";
/* It answers the refusal to the FINDING's id only — a case id gets a plain failure — so a liar that
   re-opens a named case cannot recurse on the mock forever and never reach this suite's foot (the
   control's first run measured exactly that: arm B ended with no tally). */
MOCK = (op, params) => op === "publishedcase" && params.id === "INQ-2026-8181"
  ? { ok: false, target: "INQ-2026-8181", cases: ["CASE-2026-8181", "CASE-2026-8182"],
      memberships: [{ case_id: "CASE-2026-8181", edition: 1 }, { case_id: "CASE-2026-8181", edition: 3 }, { case_id: "CASE-2026-8182", edition: 2 }],
      detail: OLD_DETAIL }
  : { ok: false, error: "unexpected op " + op };
U.PUB.data = null;
await U.pubOpen("INQ-2026-8181");
MOCK = null;
const h4 = body(), c4 = choicesOf(h4);
ok("OLDER PLANE: the choices are still offered, and the plane's own detail stands where its translation would",
   c4.length === 2 && strip(h4).includes(OLD_DETAIL) && U.PUB.data == null, strip(h4).slice(0, 300));
ok("EDITION: each choice opens its case at the NEWEST edition the refusal says pins this finding (3 and 2, never 1)",
   /pubOpen\('CASE-2026-8181', 3\)/.test(c4.find((c) => c.caseId === "CASE-2026-8181")?.onclick || "")
   && /pubOpen\('CASE-2026-8182', 2\)/.test(c4.find((c) => c.caseId === "CASE-2026-8182")?.onclick || ""),
   JSON.stringify(c4.map((c) => c.onclick)));

await finish();
