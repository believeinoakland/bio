/* UI-80 — A MEMBER PUBLISHED UNDER PUBLICATION §3 RULE 12 SHOWS EACH CASE'S FROZEN PAIR, AND EVERY
 * SENTENCE ABOUT A PAIR NAMES THE SIGNATURE THAT COVERS IT.
 *
 * BIO_Publication_v0_1.md §3 rule 12 (D-442, BOB #28; built on the plane 2026-09-23, IC-179):
 * `op=publish` writes nothing on a member finding. The frozen pair, its grounds and the member's
 * edition are stated ONCE, in the case's signed document (`bio-case-document/2`), and a finding two
 * cases pin has two pairs, one per case. The D-442 worker's DELEGATION to UI named three texts that
 * did not follow: (1) the working inquiry page's `inquiryPair` read the finding's own
 * `published_strength` and found none for such a member; (2) the published case page said every
 * pair was "signed with that finding's own bytes" (and its edition twin "the numbers signed with
 * that finding's bytes"); (3) the working page's placeholder promised a pair that never appeared.
 *
 * ================= HOW A LIAR WOULD MAKE THIS SUITE GREEN =================
 * Stated first, because the assertions are cut against it (the row names the first):
 *  (a) A HARD-CODED SIGNER SENTENCE — every pair "signed with the case document". So this suite
 *      holds ONE MEMBER OF EACH KIND: a rule-12 member driven through the REAL plane, and a legacy
 *      member (whose pair IS in its own bytes) whose page must read exactly as it did before — and a
 *      question carrying BOTH kinds, where one page must name BOTH signatures.
 *  (b) PICK ONE CASE — show the first case's pair as "the" pair. So the rule-12 member is pinned by
 *      TWO cases, and each case's block must carry THAT case's pair, read back from `op=publishedcase`
 *      for that case. Both real cases pin one sha and the plane derives one pair from it, so section
 *      4 adds a question whose two cases froze DIFFERENT pairs, where one pair shown twice fails.
 *  (c) "NOT PUBLISHED" FOR A READ THAT DID NOT ANSWER — the cheap way to make every pairless page
 *      look the same. A SILENCE arm makes the published read fail and asserts the page says so.
 *  (d) TRUST THE ID — the published record is pinned to the record namespace and a working page
 *      may be reading another, where the same id is a different question. A HASH arm pins a case to
 *      another sha and asserts its pair is NOT printed as this version's.
 *
 * WHY THE RULE-12 HALF IS REAL: a member is minted under rule 12 only by `op=publish` +
 * `op=caseratify` + `op=ratify` with real SSHSIG signatures, and a mock answering hand-written
 * envelopes would be this suite agreeing with itself — so the plane is `bio-plane/src/index.mjs`
 * under miniflare, the fixture is D-442's own (`d442-publish-writes-nothing.test.mjs`), and every
 * expected value is read back from the plane's own public op. WHAT IT CANNOT SEE: a LEGACY member
 * cannot be minted through the ops any more (D-442's own suite states the same limit), so the legacy
 * half, the silence and the hash arms are driven over a mock in the plane's wire shape; nothing is
 * live (no deploy is this item's, and the network refuses Cloudflare).
 *
 * NEGATIVE CONTROL: RUN 2026-09-23 by the UI-80 worker, each arm ALONE against the final app.html
 * (first 7b870ca62daabb48…, 1,423,226 B; RE-RUN after the several-cases branch moved to its shape, on
 * 6b164acab02ec0d4…, 1,423,447 B, the SAME result per arm), each anchor matched EXACTLY ONCE, restored
 * by cp from a per-arm pristine copy and verified after every arm: sha256 MATCH, cmp SAME. Baseline 24/0.
 *   (A) THE ROW'S OWN — the working page reads the question's own `published_strength` again
 *       (`strengthPanels`' per-case branch disabled) -> 15/9, failing BY NAME at "RULE 12: the
 *       working page draws ONE block PER CASE", "each block names the CASE DOCUMENT", both per-case
 *       pair arms, "no longer says … 'not published to this page yet'", the two-cases lede, both
 *       LEGACY+RULE 12 arms and IDENTITY; every LEGACY and published-case-page arm stayed green.
 *   (B) THE LIAR'S SIGNER — `casePairSignerHtml` always names the case document -> 23/1, at
 *       "LEGACY+RULE 12: one page names BOTH signatures" alone (the rule-12 arms stay green, which is
 *       why the both-kinds question exists).
 *   (C) THE BANNER — `pubSupersessionHtml` forced to the pre-item single sentence -> 23/1, at
 *       "RULE 12: the published case page's banner names the CASE DOCUMENT" alone (the roster arm,
 *       which reads the same helper, stays green: the arm moved one variable).
 *   (D) OVER-STRICTNESS — the rule-12 signer sentence re-worded -> 24/0 GREEN as declared: the arms
 *       read the `data-signer` mark, the case id and the words "case document", never the sentence.
 * And against origin/main @ 95c40ed9's app.html (the defect as shipped): 9/15, the rule-12, both-
 * kinds, silence and identity arms failing by name — the before-state this item was built against.
 */
import "../../bio-plane/test/stdio.mjs";   /* D-282 / M0-36: shared, for its side effect. */
import fs from "fs";
import vm from "vm";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { webcrypto, createHash } from "crypto";
import { unknownOpWire } from "./plane-refusal-wire.mjs";   /* UI-100: the dispatch miss is DERIVED from index.mjs and the DEC-49
      catalogue, never typed — see that module's header. */
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
const finish = async (code) => {
  console.log(`\ncase-frozen-pair.test.mjs: ${pass} pass, ${fail} fail`);
  if (mf) await mf.dispose();
  process.exit(code ?? (fail ? 1 : 0));
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const enc = encodeURIComponent;

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("case-frozen-pair.test.mjs: FAILED — ssh-keygen is not on PATH, and a rule-12 member exists only once a "
    + "case is ratified with a real signature; this suite does not pass over a fixture it could not build");
  process.exit(1);
}
const req = createRequire(new URL("../../bio-plane/package.json", import.meta.url));
let Miniflare, mf = null;
try { ({ Miniflare } = await import(pathToFileURL(req.resolve("miniflare")).href)); }
catch (e) {
  console.error("case-frozen-pair: the real plane could not be started — miniflare is not installed. Run `npm ci` in bio-plane/.");
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
  bindings: { INSTANCE_NAME: "ui80-instance", ADMIN_TOKEN: "adm-ui80", MEMBER_TOKEN: "mem-ui80",
              PROBE_TOKEN: "prb-ui80", DAEMON_TOKEN: "dmn-ui80", VERSION: "test",
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
   0. THE GROUND — D-442's own fixture, through the real ops
   ============================================================ */
const dir = mkdtempSync(join(tmpdir(), "ui80-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "iris", "-f", join(dir, "iris"), "-q"]);
const keyB64 = readFileSync(join(dir, "iris.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "iris"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const add = await must("memberadd iris", await POST("op=memberadd&token=adm-ui80",
  { memberId: "iris", cover: "cover for iris", role: "admin", capabilities: ["contribute", "publish"] }));
await must("enroll iris", await POST("op=enroll", { invite: add.invite, handle: "iris", password: "iris-passphrase-1" }));
const lg = await POST("op=login", { role: "member:iris", password: "iris-passphrase-1" });
if (!lg?.token) { ok("FIXTURE: login iris", false, JSON.stringify(lg)); await finish(1); }
const IRIS = lg.token;
await must("register iris's signing key",
  await POST("op=signeradd&token=adm-ui80", { keyB64, memberId: "iris", comment: "iris laptop" }));

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
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: ui80-instance",
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
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: ui80-instance", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = (title, cites) => ["---", "object_type: project", "schema: project@1", `title: "${title}"`,
  "current_state: investigating", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: ui80-instance",
  "references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."', "---", "", "## Thesis Summary", "",
  "A project.", "", "## Open Questions", "", "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");
let snapSeq = 0;
const promote = (id, text, type) => POST(`op=promote&token=${IRIS}`, {
  bundleId: id, base: null, snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information" ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "ui80-instance", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER } });
const createProject = async (label, text) => {
  const r = await POST(`op=promote&token=${IRIS}`, { base: null,
    snapKey: `${label}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "ui80-instance", title: `Project ${label}`,
            current_state: "investigating", created: NOW, last_updated: LATER } });
  if (!r?.ok || typeof r.bundleId !== "string") { ok(`FIXTURE: create project ${label}`, false, JSON.stringify(r)); await finish(1); }
  return r.bundleId;
};

/* TWO READINGS, two projects standing on them, two cases — D-442's shape. */
const LEDGER = "INFO-2026-8080-ledger", MINUTES = "INFO-2026-8080-minutes", AUDIT = "INFO-2026-8080-audit";
for (const d of [LEDGER, MINUTES, AUDIT]) await must(`promote ${d}`, await promote(d, infoMd(d), "information"));
const V1 = { name: "paper trail", claim: "The transfer followed the process the council adopted in 2024.",
  description: "The ledger and the minutes together show the transfer was authorised.", grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail", grade: "B" }, { target: MINUTES, ground: "paper trail", grade: "C" }] };
const V2 = { name: "the audit", claim: "The transfer bypassed the council vote the adopted process requires.",
  description: "The audit shows the transfer happened without the required vote.", grounds: ["the audit"],
  legs: [{ target: AUDIT, ground: "the audit", grade: "A" }] };
const Q = "INQ-2026-8080-shared";
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
const ratA = await must("Q ratifies at case X's pin", await ratifyQ(pubA.bundleSha));
await must("B stands on reading 2", await act("current", Q, V2.name, `&project=${enc(B)}`));
await must("B concludes", await POST(`op=conclude&token=${IRIS}&falsifier=${enc(FALSIFIER)}&target=${enc(Q)}&project=${enc(B)}`, {}));
const pubB = await must("B publishes a NEW case Y over Q", await publish(B, { newCase: true }));
await ratifyCase(async (q, b) => POST(q, b), pubB, { dir, key: "iris", token: IRIS });
await must("B's ratification of Q (the same bytes: a retry)", await ratifyQ(pubB.bundleSha));
const CASE_X = String(pubA.caseId), CASE_Y = String(pubB.caseId), PIN = String(pubA.bundleSha);

/* ---- THE SUBSTRATE, READ FROM THE PLANE — the facts the surface must follow, and the guards
   that keep every later arm from passing over an empty or trivial fixture. */
const proj = await GET(`op=projection&token=${IRIS}&id=${enc(Q)}`);
let fmj = null; try { fmj = JSON.parse(proj?.fm_json || "null"); } catch (_) {}
ok("SUBSTRATE: Q is a rule-12 member — ratified from the case document, both cases pinning ONE sha, "
 + "and its own bytes carry NO `published_strength` (so a reader left on them reads nothing)",
   ratA.frozenFrom === "case_document" && pubB.bundleSha === PIN && proj?.bundle_sha === PIN
   && fmj && Array.isArray(fmj.basis) && !("published_strength" in fmj),
   JSON.stringify({ frozenFrom: ratA.frozenFrom, projSha: proj?.bundle_sha, keys: fmj && Object.keys(fmj) }));
const several = await GET(`op=publishedcase&id=${enc(Q)}`);
ok("SUBSTRATE: op=publishedcase by Q's id answers FINDING_IN_SEVERAL_CASES naming both cases",
   several?.reason === "FINDING_IN_SEVERAL_CASES" && JSON.stringify([...(several.cases || [])].sort())
     === JSON.stringify([CASE_X, CASE_Y].sort()), JSON.stringify(several).slice(0, 300));
const PLANE_PAIR = {};
for (const cid of [CASE_X, CASE_Y]) {
  const c = await GET(`op=publishedcase&id=${enc(Q)}&caseId=${enc(cid)}`);
  const f = (c?.findings || []).find((x) => x.bundle_id === Q);
  PLANE_PAIR[cid] = f;
  ok(`SUBSTRATE: case ${cid} serves Q's pair from ITS case document (frozen_from case_document, both axes)`,
     f && f.frozen_from === "case_document" && Array.isArray(f.strength)
     && ["capture", "connection"].every((ax) => f.strength.some((a) => a.axis === ax)), JSON.stringify(f?.strength));
}
const gradeOf = (cid, ax) => (PLANE_PAIR[cid]?.strength || []).find((a) => a.axis === ax) || {};
/* MEASURED, NOT ASSUMED, and the fixture's limit is stated rather than smoothed: both cases pin ONE
   sha, and the plane derives each case's pair from the question's legs at that sha, so the two
   pairs come out EQUAL here (the readings differ; the legs the pair is derived from do not). A liar
   showing one case's pair under both names therefore cannot be told apart on THIS fixture — section
   4 holds that arm, over a question whose two cases froze two DIFFERENT pairs. */
console.log(`  NOTE  the two real cases froze ${JSON.stringify(gradeOf(CASE_X, "capture")) === JSON.stringify(gradeOf(CASE_Y, "capture"))
  ? "EQUAL" : "DIFFERENT"} pairs (one sha, one derivation); the pick-one liar is held by section 4`);

/* ============================================================
   THE SURFACE — app.html in a vm, its fetch routed to the real plane or to a wire-shaped mock
   ============================================================ */
const WIRE = [];
let MOCK = null;   /* when set, (op, params) => json, answering in place of the plane */
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
vm.runInContext(appScript() + ";globalThis.__U = { PLANE, PROJ_CACHE, openInquiry, pubOpen, strengthPanels, inquiryPair };", ctx);
const U = ctx.__U;
U.PLANE.base = "http://x";
U.PLANE.token = IRIS;
U.PLANE.session = true;
U.PLANE.me = { member: "iris", handle: "iris", session: true, administer: false, capabilities: ["contribute"] };
const page = () => $$("#content")._html;
const strip = (h) => String(h).replace(/<[^>]*>/g, " ").replace(/&middot;/g, "·").replace(/&mdash;/g, "—")
  .replace(/&amp;/g, "&").replace(/\s+/g, " ");
const strengthOf = (h) => { const at = h.indexOf('<h2 class="sec">Strength</h2>'); return at < 0 ? "" : h.slice(at); };
const blocksOf = (h) => [...h.matchAll(/<div class="casepair" data-casepair="([^"]*)" data-frozen-from="([^"]*)">([\s\S]*?)(?=<div class="casepair"|$)/g)]
  .map((m) => ({ caseId: m[1], from: m[2], html: m[3] }));

/* ============================================================
   1. RULE 12, THROUGH THE REAL PLANE — the working inquiry page
   ============================================================ */
console.log("\n--- 1. a rule-12 member's working page, against the real plane ---");
U.PROJ_CACHE.clear();
await U.openInquiry(Q);
const p1 = page(), s1 = strengthOf(p1), b1 = blocksOf(s1);
ok("REACH: the working page rendered the question and its Strength section", p1.includes(Q) && s1.length > 200);
ok("RULE 12: the working page draws ONE block PER CASE — both cases, each under its own name, never one picked",
   b1.length === 2 && JSON.stringify(b1.map((b) => b.caseId).sort()) === JSON.stringify([CASE_X, CASE_Y].sort()),
   JSON.stringify(b1.map((b) => b.caseId)));
ok("RULE 12: each block names the CASE DOCUMENT as the signature covering its pair",
   b1.length === 2 && b1.every((b) => b.from === "case_document" && /data-signer="case_document"/.test(b.html)
     && /case document/i.test(strip(b.html)) && strip(b.html).includes(b.caseId)));
/* OVER THE CASES THE PLANE NAMED, never over the blocks the page drew: a page that drew none must
   fail these by name rather than skip them (a loop over an empty set asserts nothing). */
for (const cid of [CASE_X, CASE_Y]) {
  const b = b1.find((x) => x.caseId === cid) || { caseId: cid, html: "" };
  const want = ["capture", "connection"].map((ax) => gradeOf(b.caseId, ax));
  const wantGraded = want.filter((a) => a.state === "graded");
  ok(`RULE 12: case ${b.caseId}'s block carries THAT case's pair, read back from op=publishedcase for that case `
   + `(${want.map((a) => `${a.axis}:${a.state}${a.grade ? " " + a.grade : ""}`).join(", ")})`,
     wantGraded.every((a) => b.html.includes(`Grade ${a.grade}`) && (!a.weakest || b.html.includes(a.weakest)))
     && want.filter((a) => a.state === "unrated").every(() => /UNRATED/.test(b.html))
     && wantGraded.length + want.filter((a) => a.state === "unrated").length === 2,
     strip(b.html).slice(0, 400));
}
ok("RULE 12: the page no longer says a published question is 'not published to this page yet'",
   !/not published to this page yet/.test(p1));
ok("RULE 12: and it says the question is in two published cases whose pairs are not combined",
   /data-casepairs="2"/.test(s1) && /not combined/.test(strip(s1)));
const pcWire = WIRE.filter((w) => w.op === "publishedcase");
ok("WIRE: the page asked op=publishedcase by the question's id, then ONCE PER CASE naming it — and never with a token "
 + "(the published record is the same for a member and a stranger)",
   pcWire.some((w) => w.params.id === Q && !w.params.caseId)
   && [CASE_X, CASE_Y].every((cid) => pcWire.some((w) => w.params.id === Q && w.params.caseId === cid))
   && pcWire.every((w) => !w.params.token), JSON.stringify(pcWire.map((w) => w.params)));

/* ============================================================
   2. RULE 12, THROUGH THE REAL PLANE — the published case page
   ============================================================ */
console.log("\n--- 2. the published case page for a /2 case, against the real plane ---");
await U.pubOpen(CASE_X);
const pub2 = $$("#pub-body")._html;
const banner2 = (/<div class="pub-super"[\s\S]*?<\/div>/.exec(pub2) || [""])[0];
ok("REACH: the published case page for case X rendered its banner", banner2.length > 50, strip(pub2).slice(0, 300));
ok("RULE 12: the published case page's banner names the CASE DOCUMENT, and not the finding's own bytes",
   /data-signer="case_document"/.test(banner2) && /case document/.test(strip(banner2))
   && !/signed with that finding's own bytes/.test(strip(banner2)), strip(banner2));
ok("RULE 12: the roster sentence does not say the pair is signed on the finding's own bytes",
   /data-signer="case_document"/.test(pub2) && !/its own pair of strengths, signed on its own bytes/.test(strip(pub2)));

/* ============================================================
   3. LEGACY — a member whose pair IS in its own bytes reads exactly as before
   ============================================================ */
console.log("\n--- 3. a legacy member (its pair in its own bytes), over a wire-shaped mock ---");
const LQ = "INQ-2026-8081-legacy", LSHA = "a".repeat(64), LCASE = "CASE-2026-8081";
const LEGACY_PAIR = [
  { axis: "capture", state: "graded", grade: "C", weakest: "INFO-2026-8081-a", load_bearing: 1, population: 1, detail: "capture C." },
  { axis: "connection", state: "unrated", grade: null, weakest: null, load_bearing: 0, population: 0, not_load_bearing: [], detail: "UNRATED on connection." },
];
const LEGS = [{ target: "INFO-2026-8081-a", role: "supports", grade: "C", grade_axis: "capture", grade_source: "resolution" }];
const md = (title) => `---\nobject_type: inquiry\ncurrent_state: published\ntitle: ${title}\n---\n## Question\n\nWas it?\n\n## What Would Falsify This\n\nA record.\n`;
const finding = (id, over) => ({ ord: 0, bundle_id: id, title: "t", bundle_sha: over.sha, version_sha: over.sha, edition: 1,
  role: "load_bearing", ratified_at: "2026-07-01T00:00:00Z", attestor: { member: "vera", key_b64: "k" },
  strength: over.strength, ...(over.from ? { frozen_from: over.from } : {}), required: null, parts: [] });
const caseAnswer = (cid, f) => ({ ok: true, caseId: cid, edition: 1, editions: [1], latest_edition: 1, findings: [f], awaiting: [],
  complete: true, project: "PROJ-2026-0001", bar: null, scope: "s" });
const mockFor = ({ id, sha: s, fm, answer }) => (op, params) => {
  if (op === "image") return { ok: true, result: { "bundle.md": md("A question") } };
  if (op === "projection") return { ok: true, result: { bundle_id: id, object_type: "inquiry", current_state: "published",
    bundle_sha: s, fm_json: JSON.stringify(fm) } };
  if (op === "publishedcase") return typeof answer === "function" ? answer(params) : answer;
  if (op === "backlinks") return { ok: true, result: { ok: true, backlinks: [] } };
  if (op === "affordances") return { ok: true, result: { target: id, object_type: "inquiry", current_state: "published", acts: [], vocabularies: {} } };
  return { ok: false, error: "unexpected op " + op };
};
const openMock = async (m, id) => { MOCK = m; U.PROJ_CACHE.clear(); await U.openInquiry(id); MOCK = null; return page(); };

const legacyFm = { basis: LEGS, published_strength: LEGACY_PAIR };
const p3 = await openMock(mockFor({ id: LQ, sha: LSHA, fm: legacyFm,
  answer: caseAnswer(LCASE, finding(LQ, { sha: LSHA, strength: LEGACY_PAIR, from: "member_bytes" })) }), LQ);
const want3 = vm.runInContext(`strengthPanels(inquiryPair(${JSON.stringify(legacyFm)}), ${JSON.stringify(LEGS)})`, ctx);
/* `want3` is `strengthPanels` called WITHOUT the per-case read, which is the function's pre-item arity and
   its legacy branch unchanged: the page, given a legacy case answer, must draw exactly that. */
ok("LEGACY: the working page's Strength section is BYTE-IDENTICAL to the rendering of the pair in its own bytes "
 + "without the per-case read (the pre-item path)",
   want3.length > 500 && strengthOf(p3).startsWith(want3), `${strengthOf(p3).length} vs ${want3.length}`);
ok("LEGACY: its own pair is drawn (Grade C, UNRATED) and no per-case block appears",
   /Grade C/.test(strengthOf(p3)) && /UNRATED/.test(strengthOf(p3)) && blocksOf(strengthOf(p3)).length === 0);
MOCK = () => caseAnswer(LCASE, finding(LQ, { sha: LSHA, strength: LEGACY_PAIR, from: "member_bytes" }));
await U.pubOpen(LCASE);
const pub3 = $$("#pub-body")._html; MOCK = null;
const banner3 = (/<div class="pub-super"[\s\S]*?<\/div>/.exec(pub3) || [""])[0];
ok("LEGACY: the published case page for a /1 case keeps its words — signed with that finding's own bytes",
   /data-signer="member_bytes"/.test(banner3) && /signed with that finding's own bytes/.test(strip(banner3))
   && /its own pair of strengths, signed on its own bytes by its own attestor/.test(strip(pub3)), strip(banner3));
/* An answer from a plane older than D-442 carries no `frozen_from` at all: it reads as member bytes. */
MOCK = () => caseAnswer(LCASE, finding(LQ, { sha: LSHA, strength: LEGACY_PAIR }));
await U.pubOpen(LCASE);
const pub3b = $$("#pub-body")._html; MOCK = null;
ok("LEGACY: an answer carrying no frozen_from (a plane older than D-442) reads as the finding's own bytes",
   /data-signer="member_bytes"/.test(pub3b) && /signed with that finding's own bytes/.test(strip(pub3b)));

/* ============================================================
   4. BOTH KINDS ON ONE QUESTION — the liar's hard-coded signer cannot pass this
   ============================================================ */
console.log("\n--- 4. one question in a legacy case AND a rule-12 case ---");
const MQ = "INQ-2026-8082-both", MSHA = "b".repeat(64), MC1 = "CASE-2026-8082", MC2 = "CASE-2026-8083";
const DOC_PAIR = [
  { axis: "capture", state: "graded", grade: "A", weakest: "INFO-2026-8082-b", load_bearing: 1, population: 1, detail: "capture A." },
  { axis: "connection", state: "graded", grade: "B", weakest: "INFO-2026-8082-c", load_bearing: 1, population: 1, detail: "connection B." },
];
const p4 = await openMock(mockFor({ id: MQ, sha: MSHA, fm: legacyFm,
  /* NARROWER THAN THE WIRE ON PURPOSE, and stated (M0-23's precedent): the plane's several-cases refusal
     also carries its code and a sentence, and NOTHING on the surface reads either — `inquiryCasePairs`
     keys on the refusal's `cases[]` and renders no part of it. Section 1 drives the plane's real answer
     through miniflare, whole; this mock carries only the fields the reader reads. */
  answer: (params) => !params.caseId
    ? { ok: false, target: MQ, cases: [MC1, MC2], memberships: [{ case_id: MC1, edition: 1 }, { case_id: MC2, edition: 1 }] }
    : params.caseId === MC1 ? caseAnswer(MC1, finding(MQ, { sha: MSHA, strength: LEGACY_PAIR, from: "member_bytes" }))
    : caseAnswer(MC2, finding(MQ, { sha: MSHA, strength: DOC_PAIR, from: "case_document" })) }), MQ);
const b4 = blocksOf(strengthOf(p4));
ok("LEGACY+RULE 12: one page names BOTH signatures — the member's own bytes for the legacy case, the case "
 + "document for the rule-12 case — each on its own case's block",
   b4.length === 2
   && b4.find((b) => b.caseId === MC1)?.from === "member_bytes" && /data-signer="member_bytes"/.test(b4.find((b) => b.caseId === MC1)?.html || "")
   && b4.find((b) => b.caseId === MC2)?.from === "case_document" && /data-signer="case_document"/.test(b4.find((b) => b.caseId === MC2)?.html || ""),
   JSON.stringify(b4.map((b) => [b.caseId, b.from])));
ok("LEGACY+RULE 12: and each block carries its own case's pair (C/UNRATED under the legacy case, A/B under the rule-12 one)",
   /Grade C/.test(b4.find((b) => b.caseId === MC1)?.html || "") && !/Grade A/.test(b4.find((b) => b.caseId === MC1)?.html || "")
   && /Grade A/.test(b4.find((b) => b.caseId === MC2)?.html || "") && /Grade B/.test(b4.find((b) => b.caseId === MC2)?.html || ""));

/* ============================================================
   5. SILENCE AND IDENTITY
   ============================================================ */
console.log("\n--- 5. a published read that does not answer; a case pinned at another sha ---");
/* CORRECTED 2026-09-24 (UI-100), never exempted: the silent-read specimen below
   was a bare `{ ok:false, error:"unknown op" }`, true to the wire until D-278
   (2026-09-23) and not since — the dispatch miss now carries `reason`, `code`,
   `check` and DEC-49's canned `translation`. `inquiryCasePairs` only GAP-DETECTS,
   and deliberately: its own header says it "never renders the refusal's code or
   sentence to anybody, because the refusal is a question to this reader and not a
   statement for a member". So no assertion here moves — but the corrected envelope
   now also proves the branch order holds against the real wire, which is the part
   that could have broken silently: `reason` arrives POPULATED (the dispatch miss's own code) where
   it used to be absent, and the read must still fall past the `NOT_PUBLISHED` test
   into `silent` rather than being mistaken for the true negative.
   THE CODE IS NAMED UNQUOTED HERE, ON PURPOSE AND NOT AS A STYLE. UI-100's own
   measurement: `check-refusal-codes.mjs`' R3-FED walk harvests any SCREAMING_SNAKE
   token in quotes or backticks ANYWHERE in a suite's source, comments included, and
   counts it as a code this suite FEEDS to a surface. Backticking it here raised the
   `r3Fed` floor by prose — a floor moved by a sentence is not a ratchet. The hand-off
   is real and is made by the derived envelope above; it is invisible to that walk for
   the reason UI-84 recorded (it keys on literals and this one arrives through a
   function), and it must not be made visible by writing the literal down. */
const pairless = { basis: LEGS };
const p5 = await openMock(mockFor({ id: "INQ-2026-8084", sha: "c".repeat(64), fm: pairless,
  answer: unknownOpWire("publishedcase") }), "INQ-2026-8084");
ok("SILENCE: a published read that did not answer is SAID as that — never as 'not published'",
   /data-published-read="silent"/.test(p5) && /could not read the published record/.test(strip(p5))
   && !/not published to this page yet/.test(p5));
const p5n = await openMock(mockFor({ id: "INQ-2026-8085", sha: "d".repeat(64), fm: pairless,
  answer: { ok: false, reason: "NOT_PUBLISHED", detail: "no published edition answers to that." } }), "INQ-2026-8085");
ok("SILENCE (its twin): the store's own NOT_PUBLISHED is the true negative, and the page keeps the named gap",
   /not published to this page yet/.test(p5n) && !/data-published-read="silent"/.test(p5n));
const p6 = await openMock(mockFor({ id: "INQ-2026-8086", sha: "e".repeat(64), fm: pairless,
  answer: caseAnswer("CASE-2026-8086", finding("INQ-2026-8086", { sha: "f".repeat(64), strength: DOC_PAIR, from: "case_document" })) }),
  "INQ-2026-8086");
const b6 = blocksOf(strengthOf(p6));
ok("IDENTITY: a case that pinned ANOTHER sha is named with that sha, and its pair is NOT printed as this version's",
   b6.length === 1 && /data-pinned="f{64}"/.test(b6[0].html) && !/Grade A/.test(b6[0].html), strip(b6[0]?.html || "").slice(0, 300));

await finish();
