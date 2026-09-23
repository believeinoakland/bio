/* UI-82 — THE PUBLISHED INDEX DRAWS A FINDING'S FROZEN PAIR PER CASE, AND NEVER SAYS "NO FROZEN PAIR" OF A
 * FINDING WHOSE CASES FROZE DIFFERENT ONES.
 *
 * DESIGN: BIO_Publication_v0_1.md §3 rule 12 (b)–(d) — the frozen pair is stated ONCE, in each case's signed
 * document, as that case's reading of the finding at that sha, so a case still has no strength of its own — with
 * DEC-8 (a surface invents nothing) and IC-74 (a finding in several cases answers every case, never one).
 * The plane half is REC-170 (IC-183): where the ratified case documents pinning one sha disagree,
 * `op=publishedmanifest`'s `published[]` row serves `strength: null`, a reason in `strengthUndetermined`, and
 * `strengthByCase: [{ case_id, edition, strength }]`. The index (`pubList`) read the scalar alone, so on
 * 91913d6b it drew such a finding, under BOTH of its cases, with the sentence "The published record carries no
 * frozen strength pair for this ratified member: nothing was established on either axis" — false twice over.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 *  (a) READ THE SCALAR — the row's own defect. The per-case arms demand, under EACH case row, THAT case's pair.
 *  (b) PICK ONE CASE (IC-74) — show the first listed case's pair under every case row. The fixture's two cases
 *      froze DIFFERENT capture grades (B and C) for Q and for S, so one pair shown twice fails by name under the
 *      other case; a guard asserts the two expected badges differ, so the arm cannot pass over equal pairs.
 *  (c) FLAG EVERYTHING — mark every multi-case finding undetermined. R is pinned by the same two cases with the
 *      SAME pair, and must render exactly as a one-pair row always has: its badges, no per-case mark, no note.
 *  (d) "NO PAIR" FOR "UNDETERMINED" — where the list holds no whole pair for this case edition, or the record
 *      marks the pair undetermined and lists none, the row must say UNDETERMINED with its reason, never the
 *      no-pair sentence and never a pair taken from another case. Driven over a wire-shaped mock (the plane
 *      cannot be made to serve a list missing a case it pins), stated rather than smoothed.
 *
 * WHY THE PER-CASE HALF IS REAL: the fixture is REC-170's own (`bio-plane/test/rec170-manifest-pair.test.mjs`),
 * every act through the control plane under miniflare with real SSHSIG signatures, and every expected pair is
 * read back from the plane's own public `op=publishedmanifest` and cross-checked against `op=publishedcase` for
 * that case. WHAT IT CANNOT SEE: a legacy `/1` case document (it cannot be minted through the ops any more, the
 * plane suite states the same limit); the case page (`pubOpen`, UI-81's); nothing is live (no deploy is this
 * item's).
 *
 * NEGATIVE CONTROL: RUN 2026-09-23 by the UI-82 worker with `node civicos-ui/test/published-index-pair.control.mjs`,
 * each arm ALONE against the final app.html (6422e5458abade28…, 1,430,016 B), each anchor matched EXACTLY ONCE,
 * restored by cp from a per-arm pristine copy, sha256 MATCH and cmp SAME after every arm. ALL FOUR AS DECLARED:
 *   BASELINE 20/0.
 *   (A) THE ROW'S CONTROL — `pubList` reads the single field again (`pubPair(row)`) -> 12/8, failing BY NAME at all four
 *       "PER CASE" arms, "NONE READS 'NO FROZEN PAIR'" and the three UNDETERMINED arms; SINGLE CASE, OVER-STRICTNESS
 *       and TRUE NEGATIVE stayed green.
 *   (B) THE LIAR (IC-74) — the list's first entry under every case row -> 16/4, at "NEVER ONE CASE'S PAIR UNDER
 *       ANOTHER", the two "PER CASE … under case X" arms (the plane lists case Y first) and the first UNDETERMINED arm;
 *       "NONE READS 'NO FROZEN PAIR'", SINGLE CASE and OVER-STRICTNESS stayed green.
 *   (C) OVER-STRICTNESS — the per-case sentence re-worded, the case and edition kept -> 20/0 GREEN as declared.
 * And against origin/main @ 91913d6b's app.html (the defect as shipped, REC-170 landed, the index unread): 12/8, the
 * same eight arms as (A) — the before-state this item was built against.
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
import { parseFrontmatter } from "../../bio-plane/checks/bio-checks.mjs";

let pass = 0, fail = 0;
const ok = (label, cond, detail) => {
  if (cond) { console.log(`  PASS  ${label}`); pass++; }
  else { console.log(`  FAIL  ${label}${detail ? `\n         ${detail}` : ""}`); fail++; }
};
/* `t` is the plane suite's equality form, so its fixture lines are carried over unchanged. */
const t = (label, got, want) => ok(label, JSON.stringify(got) === JSON.stringify(want),
  `want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`);
let mf = null;
const finish = async (code) => {
  console.log(`\npublished-index-pair.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const bail = async (what, r) => {
  ok(`FIXTURE: ${what}`, false, JSON.stringify(r).slice(0, 600));
  await finish(1);
};
const must = async (what, r) => { if (!r || r.ok !== true) await bail(what, r); return r; };
const sha = (v) => createHash("sha256").update(v).digest("hex");
const enc = encodeURIComponent;

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("published-index-pair.test.mjs: FAILED — ssh-keygen is not on PATH, and a finding two cases pin exists "
    + "only once both cases are ratified with real signatures; this suite does not pass over a fixture it could not build");
  process.exit(1);
}
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("published-index-pair: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
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
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-ui82", MEMBER_TOKEN: "mem-ui82",
              PROBE_TOKEN: "prb-ui82", DAEMON_TOKEN: "dmn-ui82", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

/* ============================================================
   THE SURFACE — app.html in a vm, its fetch routed to the real plane, or to a wire-shaped mock
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
vm.runInContext(appScript() + ";globalThis.__U = { PLANE, pubList, pubPairBadges, pubPair, pubStateBadge };", ctx);
const U = ctx.__U;
U.PLANE.base = "http://x";
const stripH = (h) => String(h).replace(/<[^>]*>/g, " ").replace(/&middot;/g, "·").replace(/&mdash;/g, "—")
  .replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/\s+/g, " ");
/* The index, drawn by the surface itself: `#pl`, split into its CASE ROWS and each row into its MEMBER sections. */
const drawIndex = async () => { $$("#pl")._html = ""; await U.pubList(true); return $$("#pl")._html; };
const caseRows = (h) => [...h.matchAll(/<div class="pf" data-caserow="([^"]*)"[\s\S]*?(?=<div class="pf" data-caserow=|$)/g)]
  .map((m) => ({ caseId: m[1], html: m[0] }));
const memberOf = (rowHtml, fid) => {
  const at = rowHtml.indexOf(`data-findingsec="${fid}"`);
  if (at < 0) return "";
  const end = rowHtml.indexOf("</section>", at);
  return rowHtml.slice(at, end < 0 ? undefined : end);
};
const NOPAIR = /carries no frozen strength pair/;

/* ============================================================
   THE GROUND — REC-170's own fixture, through the real ops
   ============================================================ */
const dir = mkdtempSync(join(tmpdir(), "ui82-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "iris", "-f", join(dir, "iris"), "-q"]);
const keyB64 = readFileSync(join(dir, "iris.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "iris"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const add = await must("memberadd iris", await POST("op=memberadd&token=adm-ui82",
  { memberId: "iris", cover: "cover for iris", role: "admin", capabilities: ["contribute", "publish"] }));
await must("enroll iris", await POST("op=enroll", { invite: add.invite, handle: "iris", password: "iris-passphrase-1" }));
const lg = await POST("op=login", { role: "member:iris", password: "iris-passphrase-1" });
if (!lg?.token) await bail("login iris", lg);
const IRIS = lg.token;
await must("register iris's signing key",
  await POST("op=signeradd&token=adm-ui82", { keyB64, memberId: "iris", comment: "iris laptop" }));

/* ---- carried from rec170-manifest-pair.test.mjs, unchanged ---- */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
/* The reading's legs are the finding's basis legs, so the reading a project concludes on rests on what the
   derived pair walks (REC-124: a conclusion rests on the reading it adopts). */
const versionLines = (v, basis) => ["basis_versions:", ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", "and"), ...scalar("state", "suggested"),
    ...scalar("derived_from", null), ...scalar("hidden", false), ...scalar("claim", v.claim),
    ...scalar("author", "iris"), ...scalar("at", NOW)].join("\n"),
  "basis_version_grounds:", ['  - version: "' + v.name + '"', ...scalar("ground", "the trail"),
    ...scalar("asserted_by", "iris"), ...scalar("at", NOW)].join("\n"),
  "basis_version_legs:", ...basis.map((b) => ['  - version: "' + v.name + '"', ...scalar("target", b.target),
    ...scalar("role", "supports"), ...scalar("ground", "the trail"),
    ...(b.grade ? [...scalar("grade", b.grade), ...scalar("grade_axis", "capture"), ...scalar("grade_source", "capture")] : [])
  ].join("\n"))];
/* `basis` entries: { target, grade? } — a graded leg is on the CAPTURE axis, as D-442's version legs are. */
const inquiryMd = (id, { title, basis, version, stamp = LATER }) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${title}"`,
  "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${stamp}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", ...basis.flatMap((b) => [`  - target: ${b.target}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", ...basis.flatMap((b) => [`  - target: ${b.target}`, "    role: supports",
    ...(b.grade ? [`    grade: ${b.grade}`, "    grade_axis: capture", "    grade_source: capture"] : [])]),
  ...(version ? versionLines(version, basis) : []),
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${stamp} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
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
const projectMd = (title, cites) => ["---",
  "object_type: project", "schema: project@1", `title: "${title}"`,
  "current_state: investigating", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."',
  "---", "", "## Thesis Summary", "", "A project.", "", "## Open Questions", "",
  "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const shaOf = async (id) => (await GET(`op=list&token=${IRIS}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
const promote = async (id, text, type, base = null) => POST(`op=promote&token=${IRIS}`, {
  bundleId: id, base,
  snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER } });
const createProject = async (label, text) => {
  const r = await POST(`op=promote&token=${IRIS}`, {
    base: null, snapKey: `${label}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: `Project ${label}`,
            current_state: "investigating", created: NOW, last_updated: LATER } });
  if (!r?.ok || typeof r.bundleId !== "string") await bail(`create project ${label}`, r);
  return r.bundleId;
};

const LEDGER = "INFO-2026-4170-ledger";
await must(`promote ${LEDGER}`, await promote(LEDGER, infoMd(LEDGER), "information"));
const Q0 = "INQ-2026-4170-under";   /* the sub-inquiry whose letter Q and S inherit */
const q0Md = (grade, stamp) => inquiryMd(Q0, { title: "What does the ledger show?", stamp,
  basis: [{ target: LEDGER, grade }] });
await must(`promote ${Q0}`, await promote(Q0, q0Md("B", LATER), "inquiry"));
const V = { name: "the paper trail", claim: "The transfer followed the process the council adopted in 2024.",
            description: "The ledger shows the transfer was authorised." };
const Q = "INQ-2026-4170-q", S = "INQ-2026-4170-s", R = "INQ-2026-4170-r";
await must(`promote ${Q}`, await promote(Q, inquiryMd(Q, { title: "Did the transfer follow the process?",
  basis: [{ target: Q0 }], version: V }), "inquiry"));
await must(`promote ${S}`, await promote(S, inquiryMd(S, { title: "Was the vote taken?",
  basis: [{ target: Q0 }], version: V }), "inquiry"));
await must(`promote ${R}`, await promote(R, inquiryMd(R, { title: "Was the ledger filed?",
  basis: [{ target: LEDGER, grade: "B" }], version: V }), "inquiry"));
const FINDINGS = [Q, S, R];
const A = await createProject("oversight", projectMd("Oversight", FINDINGS));
const B = await createProject("neighbours", projectMd("Neighbours", FINDINGS));

const act = async (verb, target, version, extra = "") =>
  POST(`op=version${verb}&token=${IRIS}&target=${enc(target)}&version=${enc(version)}${extra}`, {});
for (const f of FINDINGS) await must(`accept ${f}`, await act("accept", f, V.name, `&reason=${enc("the evidence holds")}`));
const FALSIFIER = "a council minute showing the vote was never taken";
const concludeAll = async (project) => {
  for (const f of FINDINGS) {
    await must(`${project} stands on ${f}'s reading`, await act("current", f, V.name, `&project=${enc(project)}`));
    await must(`${project} concludes ${f}`, await POST(
      `op=conclude&token=${IRIS}&falsifier=${enc(FALSIFIER)}&target=${enc(f)}&project=${enc(project)}`, {}));
  }
};
let pubSeq = 0;
const publish = async (project, extra = {}) => {
  const n = ++pubSeq;
  return POST(`op=publish&token=${IRIS}`, {
    project, scope: `Whether the record answers the transfer questions (publication ${n}).`,
    targets: FINDINGS, roles: Object.fromEntries(FINDINGS.map((f) => [f, "load_bearing"])),
    statement: `This case does not cover the 2025 transfers (publication ${n}).`,
    subjectPosition: "sought_no_answer",
    subjectJustification: `The subject was asked and declined to comment (publication ${n}).`,
    biasAcknowledgement: `The publishing project is funded by a party with an interest (publication ${n}).`,
    excluded: [{ target: null, description: `The 2025 transfers (publication ${n})`, reason: "Out of scope." }],
    ...extra });
};
const ratify = async (id, bundleSha) =>
  POST(`op=ratify&token=${IRIS}`, { bundleId: id, expectedSha: bundleSha, sig: signRatify(id, bundleSha) });
const strip = (rows) => (rows || []).map(({ target, ...r }) => r);
const docPair = async (caseId, edition, id) => {
  const d = await GET(`op=casedocument&token=${IRIS}&case=${enc(caseId)}&edition=${edition}`);
  return strip((parseFrontmatter(String(d?.text || "")).data?.case_strength || []).filter((r) => r.target === id));
};
const capOf = (pair) => (pair || []).find((a) => a.axis === "capture")?.grade ?? null;
/* ---- end of the carried fixture ---- */

/* =======================================================================
   1. PROJECT A PUBLISHES CASE X OVER {Q, S, R}; Q AND R RATIFY. S WAITS.
   ======================================================================= */
console.log("\n--- 1. case X (project A) over Q, S, R; Q and R ratify under X alone ---");
await concludeAll(A);
const pubX = await publish(A);
if (pubX?.ok !== true) await bail("A publishes case X", pubX);
await ratifyCase(async (q, b) => POST(q, b), pubX, { dir, key: "iris", token: IRIS });
const CASE_X = pubX.caseId, ED_X = pubX.caseDocument?.edition ?? pubX.edition;
const PIN = Object.fromEntries(await Promise.all(FINDINGS.map(async (f) => [f, await shaOf(f)])));
await must("Q ratifies under X", await ratify(Q, PIN[Q]));
await must("R ratifies under X", await ratify(R, PIN[R]));
const xQ = await docPair(CASE_X, ED_X, Q), xS = await docPair(CASE_X, ED_X, S), xR = await docPair(CASE_X, ED_X, R);
t("(fixture) case X's document freezes a pair for each member, Q and S inheriting Q0's capture B — the non-empty "
+ "guard for every per-case arm",
  [xQ.length >= 2, capOf(xQ), capOf(xS), capOf(xR)], [true, "B", "B", "B"]);
{
  /* ONE CASE PINS Q: the index draws Q exactly as a one-pair row always has — its pair's badges straight inside
     the member block, no per-case mark, no per-case note, no undetermined state. */
  const h = await drawIndex();
  const rx = caseRows(h).find((r) => r.caseId === String(CASE_X));
  const sec = rx ? memberOf(rx.html, Q) : "";
  const want = `<div style="margin-top:5px">${U.pubPairBadges(U.pubPair({ strength: xQ }), Q)}</div>`;
  ok("SINGLE CASE: Q under case X alone renders as a one-pair row always has — X's badges, no per-case mark or note",
     sec.length > 0 && sec.includes(want) && !/data-casepair-index|data-pair-undetermined|data-pairfor-case/.test(sec),
     stripH(sec).slice(0, 300));
}

/* =======================================================================
   2. Q0 IS RE-GRADED; PROJECT B PUBLISHES CASE Y OVER THE SAME THREE.
   ======================================================================= */
console.log("\n--- 2. Q0 re-graded to C; case Y (project B) over the same three findings ---");
await must("Q0 re-graded to C", await promote(Q0, q0Md("C", "2026-07-03T00:00:00Z"), "inquiry", await shaOf(Q0)));
t("(fixture) re-grading Q0 moves NONE of Q, S, R — their bytes are what X pinned",
  await Promise.all(FINDINGS.map(async (f) => (await shaOf(f)) === PIN[f])), [true, true, true]);
await concludeAll(B);
const pubY = await publish(B, { newCase: true });
if (pubY?.ok !== true) await bail("B publishes case Y", pubY);
await ratifyCase(async (q, b) => POST(q, b), pubY, { dir, key: "iris", token: IRIS });
const CASE_Y = pubY.caseId, ED_Y = pubY.caseDocument?.edition ?? pubY.edition;
const yQ = await docPair(CASE_Y, ED_Y, Q), yS = await docPair(CASE_Y, ED_Y, S), yR = await docPair(CASE_Y, ED_Y, R);
t("(fixture) Y pins the SAME shas as X, and its document freezes C for Q and S and X's own pair for R — the two "
+ "documents DISAGREE about Q and S and AGREE about R",
  [pubY.findings?.every((f) => f.version_sha ? f.version_sha === PIN[f.target] : true) ?? null,
   (await Promise.all(FINDINGS.map(async (f) => (await shaOf(f)) === PIN[f]))).every(Boolean),
   capOf(yQ), capOf(yS), JSON.stringify(yQ) !== JSON.stringify(xQ), JSON.stringify(yR) === JSON.stringify(xR)],
  [true, true, "C", "C", true, true]);
const ratS = await ratify(S, PIN[S]);
t("(fixture) S ratifies for the FIRST time under both documents: the act says its pair is undetermined",
  [ratS?.ok, ratS?.frozenFrom, ratS?.strengthUndetermined], [true, "case_document", true]);
await must("Q re-ratifies (existing bytes)", await ratify(Q, PIN[Q]));
await must("R re-ratifies (existing bytes)", await ratify(R, PIN[R]));


/* ============================================================
   3. THE INDEX, AGAINST THE REAL PLANE — each case row draws ITS case's pair
   ============================================================ */
console.log("\n--- 3. the published index over a finding two cases pin with DIFFERENT pairs (real plane) ---");
const pm = await GET("op=publishedmanifest");
const mrow = (id) => (pm?.published || []).find((r) => r.bundle_id === id) || null;
const entryOf = (id, cid, ed) => (mrow(id)?.strengthByCase || [])
  .find((e) => String(e.case_id) === String(cid) && Number(e.edition) === Number(ed)) || null;
/* THE SUBSTRATE, READ FROM THE PLANE: the per-case list exists, names both cases, the scalar is null, and the two
   pairs DIFFER on a badge the surface draws — without which the pick-one liar could pass by coincidence. */
for (const f of [Q, S]) {
  const ex = entryOf(f, CASE_X, ED_X), ey = entryOf(f, CASE_Y, ED_Y);
  const bx = ex ? U.pubPairBadges(U.pubPair(ex), f) : "", by = ey ? U.pubPairBadges(U.pubPair(ey), f) : "";
  ok(`SUBSTRATE: ${f}'s manifest row carries strengthByCase for BOTH cases, a null scalar, and two pairs whose `
   + `drawn badges DIFFER`,
     mrow(f)?.strength === null && typeof mrow(f)?.strengthUndetermined === "string" && ex && ey
     && bx.length > 50 && by.length > 50 && bx !== by, JSON.stringify(mrow(f)).slice(0, 400));
}
{
  /* (d) of the plane suite, re-asked here: each entry is what that case's own public read serves. */
  const same = await Promise.all([[CASE_X, ED_X], [CASE_Y, ED_Y]].map(async ([c, ed]) => {
    const pc = await GET(`op=publishedcase&id=${enc(Q)}&caseId=${enc(c)}`);
    return JSON.stringify((pc?.findings || []).find((x) => x.bundle_id === Q)?.strength ?? null)
      === JSON.stringify(entryOf(Q, c, ed)?.strength ?? "absent");
  }));
  ok("SUBSTRATE: each case's entry for Q is what op=publishedcase serves for that case", same.every(Boolean), JSON.stringify(same));
}

WIRE.length = 0;
const h3 = await drawIndex();
const rows3 = caseRows(h3);
ok("REACH: the index drew a row for case X and a row for case Y, and asked op=publishedmanifest without a token",
   rows3.some((r) => r.caseId === String(CASE_X)) && rows3.some((r) => r.caseId === String(CASE_Y))
   && WIRE.some((w) => w.op === "publishedmanifest") && WIRE.every((w) => !w.params.token),
   JSON.stringify(rows3.map((r) => r.caseId)));
/* OVER THE CASES AND FINDINGS THE PLANE NAMED, never over what the page drew: a page that drew nothing fails
   each of these by name rather than skipping it. Each label is spelled out WHOLE, for the control driver. */
const perCaseArm = (label, f, cid, ed) => {
  const row = rows3.find((r) => r.caseId === String(cid));
  const sec = row ? memberOf(row.html, f) : "";
  const e = entryOf(f, cid, ed);
  const want = e ? U.pubPairBadges(U.pubPair(e), f) : "\u0000never";
  ok(label, sec.includes(`data-casepair-index="${cid}@${ed}"`) && sec.includes(want)
     && sec.includes(`data-pairfor-case="${cid}"`) && stripH(sec).includes(`case ${cid} edition ${ed}`),
     stripH(sec).slice(0, 500));
};
perCaseArm("PER CASE: Q under case X draws case X's OWN pair, naming case X", Q, CASE_X, ED_X);
perCaseArm("PER CASE: Q under case Y draws case Y's OWN pair, naming case Y", Q, CASE_Y, ED_Y);
perCaseArm("PER CASE: S under case X draws case X's OWN pair, naming case X", S, CASE_X, ED_X);
perCaseArm("PER CASE: S under case Y draws case Y's OWN pair, naming case Y", S, CASE_Y, ED_Y);
{
  /* THE LIAR (IC-74): one case's pair under the other case. Asked directly, so the arm fails by its own name. */
  const bad = [];
  for (const f of [Q, S]) for (const [cid, ocid, oed] of [[CASE_X, CASE_Y, ED_Y], [CASE_Y, CASE_X, ED_X]]) {
    const row = rows3.find((r) => r.caseId === String(cid));
    const sec = row ? memberOf(row.html, f) : "";
    const other = entryOf(f, ocid, oed);
    if (sec && other && sec.includes(U.pubPairBadges(U.pubPair(other), f))) bad.push(`${f}@${cid}: shows ${ocid}'s pair`);
  }
  ok("NEVER ONE CASE'S PAIR UNDER ANOTHER: no case row of Q or S draws the other case's pair as its own", bad.length === 0, bad.join("; "));
}
ok("NONE READS 'NO FROZEN PAIR': neither Q nor S, under either case, carries the no-pair sentence",
   [Q, S].every((f) => rows3.filter((r) => r.caseId).every((r) => { const s = memberOf(r.html, f); return s && !NOPAIR.test(s) && !s.includes("data-nopair"); })),
   rows3.map((r) => `${r.caseId}: ${[Q, S].map((f) => NOPAIR.test(memberOf(r.html, f))).join(",")}`).join(" | "));
{
  /* OVER-STRICTNESS (the flag-everything liar): R, pinned by the same two cases with the SAME pair, renders under each
     case exactly as a one-pair row always has. */
  const want = `<div style="margin-top:5px">${U.pubPairBadges(U.pubPair(mrow(R)), R)}</div>`;
  const secs = [CASE_X, CASE_Y].map((cid) => memberOf(rows3.find((r) => r.caseId === String(cid))?.html || "", R));
  ok("OVER-STRICTNESS: R (both cases froze the SAME pair) renders under each case as a one-pair row — its badges, "
   + "no per-case mark, no undetermined state",
     mrow(R)?.strength && !("strengthByCase" in mrow(R))
     && secs.every((s) => s.length > 0 && s.includes(want) && !/data-casepair-index|data-pair-undetermined|data-pairfor-case/.test(s)),
     secs.map((s) => stripH(s).slice(0, 200)).join(" | "));
}

/* ============================================================
   4. UNDETERMINED, WITH ITS REASON — over a wire-shaped mock
   ============================================================ */
console.log("\n--- 4. the undetermined state, over a mock in the plane's wire shape ---");
/* NARROWER THAN THE WIRE ON PURPOSE, and stated (M0-23's precedent): the real manifest, edited in ONE place per arm. */
const drawMocked = async (edit) => {
  const m = JSON.parse(JSON.stringify(pm));
  edit(m);
  MOCK = (op) => op === "publishedmanifest" ? { ok: true, result: m } : { ok: false, error: "unexpected op " + op };
  try { return caseRows(await drawIndex()); } finally { MOCK = null; }
};
{
  /* The list holds no entry for case Y's edition — the record lists some cases' pairs and not this one's. */
  const rows = await drawMocked((m) => { const r = m.published.find((x) => x.bundle_id === Q);
    r.strengthByCase = r.strengthByCase.filter((e) => String(e.case_id) !== String(CASE_Y)); });
  const sy = memberOf(rows.find((r) => r.caseId === String(CASE_Y))?.html || "", Q);
  const sx = memberOf(rows.find((r) => r.caseId === String(CASE_X))?.html || "", Q);
  ok("UNDETERMINED: a case edition the per-case list does not name reads UNDETERMINED with its reason — never the "
   + "no-pair sentence, never another case's pair",
     /data-pair-undetermined=/.test(sy) && /undetermined, not absent/.test(stripH(sy)) && /froze different pairs/.test(stripH(sy))
     && stripH(sy).includes(String(CASE_X)) && !NOPAIR.test(sy) && !/data-casepair-index/.test(sy)
     && !sy.includes(U.pubPairBadges(U.pubPair(entryOf(Q, CASE_X, ED_X)), Q)), stripH(sy).slice(0, 400));
  ok("UNDETERMINED (its twin): the case the list DOES name still draws its own pair",
     sx.includes(`data-casepair-index="${CASE_X}@${ED_X}"`), stripH(sx).slice(0, 200));
}
{
  /* The record marks the scalar undetermined and lists nothing — a plane answer this surface was not built
     against. It is SAID, with the record's own reason, and not read as "nothing frozen". */
  const rows = await drawMocked((m) => { const r = m.published.find((x) => x.bundle_id === Q);
    delete r.strengthByCase; r.strengthUndetermined = "A-REASON-THE-SURFACE-DOES-NOT-KNOW"; });
  const secs = rows.filter((r) => r.caseId).map((r) => memberOf(r.html, Q));
  ok("UNDETERMINED: a null scalar the record marks undetermined, with no list, reads UNDETERMINED under every case "
   + "and names the record's reason — never 'no frozen pair'",
     secs.length === 2 && secs.every((s) => /data-pair-undetermined=/.test(s) && s.includes("A-REASON-THE-SURFACE-DOES-NOT-KNOW")
       && !NOPAIR.test(s)), secs.map((s) => stripH(s).slice(0, 200)).join(" | "));
}
{
  /* And the true negative is kept: a scalar null the record does NOT mark undetermined is still "none frozen". */
  const rows = await drawMocked((m) => { const r = m.published.find((x) => x.bundle_id === Q);
    delete r.strengthByCase; delete r.strengthUndetermined; r.strength = null; });
  const secs = rows.filter((r) => r.caseId).map((r) => memberOf(r.html, Q));
  ok("TRUE NEGATIVE: a null scalar with no reason and no list keeps the no-pair sentence (nothing was frozen)",
     secs.length === 2 && secs.every((s) => NOPAIR.test(s) && !/data-pair-undetermined=/.test(s)));
}

await finish();
