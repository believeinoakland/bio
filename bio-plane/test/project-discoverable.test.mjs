/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/project-discoverable.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/project-discoverable.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once) and the real sources are hashed before and after; what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RUN 2026-09-23 on branch land/worker/REC-149 over base 02603e88 (real sources untouched: YES, by sha256): (a) baseline 154/0 · (b) widen-viewerPredicate 98/56 — the row's own control: `viewerPredicate` admits every discoverable project, and the CONTENTS arms fail by name (§5 op=list and op=backlinks, among others) · (c) existence-as-absent 132/22 — every §3h act answers "does not exist" again · (d) default-discoverable 104/50 — a project with no record reads discoverable, and §1 (the predecessor's projects) and §2 fail · (e) owner-fence-dropped 146/8 — §6a-e · (f) latest-by-max-seq 154/0, the over-strictness arm. RECORDED, NOT SMOOTHED: the first run had (b), (d) and (e) NOT AS DECLARED. (b) and (e) were declarations one consequence short (reasons in the driver). (d) was the SUBJECT: 1e and 2e PASSED because the directory took its candidates from the visibility table, a second copy of "no record = hidden" that the flipped default never reached; the directory now asks `#sight` over every project, and the re-run's two further consequences (3e, 3g: every project a caller is not in is offered) are declared. Re-run, every arm AS DECLARED.
 * =========================================================================
 * REC-149 / C-70 / IC-231 — DISCOVERABLE OR HIDDEN (Membership Architecture v2 §7, item 7.14, BOB #16 from
 * Bob's ruling of 2026-09-18: *"The project's contents might be private, though the existence of the project
 * may not be"*; *"each project chooses"*).
 *
 * WHAT IS BUILT AND ASSERTED HERE (7.14's decomposition, step 1): the setting (an OWNER's recorded act,
 * append-only, latest wins, no record = HIDDEN); `#sight`'s three levels at the one predicate; the positional
 * refusal at EXISTENCE (C-70.1, the id and name and nothing else); the DIRECTORY. NOT BUILT, and asserted as
 * not built rather than skipped: the request to join (step 2) — so at EXISTENCE EVERY act is refused, the
 * request included because it does not exist yet, and the directory's `request` is null with the reason said.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (1) WIDEN `viewerPredicate` so a discoverable project is seen by everybody. The directory can then list it
 *       and every act "works" — and every CONTENTS read leaks it. §5 reads the uninvited member's record reads
 *       (list, index, search, backlinks, dangling, image, file, a run's report) before and after the project goes
 *       discoverable and demands them BYTE-IDENTICAL, and demands the project absent from each. The control's
 *       `widen-viewerPredicate` arm does exactly this and a contents arm must fail by name.
 *   (2) Answer "does not exist" at EXISTENCE (the REC-138 answer kept). §3 demands C-70.1 at every act.
 *   (3) Default to DISCOVERABLE. §1 boots a PREDECESSOR's store (this tree with the table not yet created) and
 *       demands every project HIDDEN — the directory empty and every act byte-identical to a never-minted id.
 *   (4) Let an administrator set it. §6 drives the founder, an enrolled administrator, an invited participant,
 *       and both machine credentials, and each is refused C-70.2.
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { tmpdir } from "node:os";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.PROJECT_DISCOVERABLE_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec149", MEM = "mem-rec149";
const root = mkdtempSync(join(tmpdir(), "rec149-"));
const persist = join(root, "persist");
const planeAt = (idx) => withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: idx, script: readFileSync(idx, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  durableObjectsPersist: persist,
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
}));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const E = encodeURIComponent;
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 700)}`); return r; };
const on = (m) => {
  const RAW = async (q, body) => {
    const res = await m.dispatchFetch(`http://x/api/?${q}`,
      body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
    return { status: res.status, type: res.headers.get("content-type"), body: await res.text() };
  };
  const DO = async (path, body) => {
    const ns = await m.getDurableObjectNamespace("STORE");
    return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
      { method: "POST", body: JSON.stringify(body ?? {}) })).json());
  };
  return { RAW, DO, POST: async (q, b) => parse(await RAW(q, b ?? {})), GET: async (q) => parse(await RAW(q)) };
};
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = (id, title, cites = [], summary = "A project.") => ["---", ...(id === null ? [] : [`id: ${id}`]),
  "object_type: project", `title: "${title}"`, "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(cites.length ? ["references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
                   : ["references: []"]),
  "required_strength:", "  capture: B", "  connection: C", "---", "", "## Summary", "", summary, "",
  "## Session Log", ""].join("\n");
const meta = (id, type, state, title) => ({ object_type: type, group: "believe-in-oakland", title: title ?? `Bundle ${id}`,
  current_state: state, created: NOW, last_updated: LATER });
const pkg = (id, text, type, state, base, snapKey, title) => ({ bundleId: id, base, snapKey,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: meta(id, type, state, title) });
let seq = 0;
/* A project CREATION: no id (the plane mints it, REC-141); `by` the ADMIN token, then the owner claimed. */
const createProject = async (api, title, cites) => {
  const { bundleId: _none, ...create } = pkg(null, projectMd(null, title, cites), "project", "forming", null,
    `rec149-create-${++seq}`, title);
  return must(`create ${title}`, await api.POST(`op=promote&token=${ADM}`, create)).bundleId;
};

/* The question and the bias set, as REC-138's suite builds them (`project-sight.test.mjs`). */
const scalar = (k, v) => v === null ? [`    ${k}: null`] : typeof v === "boolean" ? [`    ${k}: ${v}`] : [`    ${k}: "${String(v)}"`];
const inquiryMd = (id, basis) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Did the sewer fund transfer follow the adopted process?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references:", `  - target: ${basis}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "recheck_triggers:",
  "  - text: Revisit after the next budget cycle", "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${basis}`, "    role: supports", "basis_versions:", '  - name: "v1"',
  ...scalar("description", "the ledger reading"), ...scalar("relationship", "and"), ...scalar("state", "suggested"),
  ...scalar("derived_from", null), ...scalar("hidden", false), ...scalar("claim", "The transfer followed the adopted process."),
  ...scalar("author", "iris"), ...scalar("at", NOW), "basis_version_grounds:", '  - version: "v1"',
  ...scalar("ground", "g1"), ...scalar("asserted_by", "iris"), ...scalar("at", NOW),
  "basis_version_legs:", '  - version: "v1"', ...scalar("target", basis), ...scalar("role", "supports"),
  ...scalar("ground", "g1"), ...scalar("grade", "B"), ...scalar("grade_axis", "capture"), ...scalar("grade_source", "capture"),
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const BIAS = "BIAS-2026-9149-lens";
const biasMd = (state) => ["---", `id: "${BIAS}"`, 'object_type: "bias"', 'schema: "bias@1"', 'title: "Project lens"',
  `current_state: "${state}"`, `prior_state: ${state === "draft" ? "null" : '"draft"'}`, `created: "${NOW}"`,
  `last_updated: "${LATER}"`, "produced_by:", '  mode: "human"', '  capability_tier: "member"',
  'group: "believe-in-oakland"', "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:",
  "  flag: false", "  since: null", "  source: null", "visuals: []", "statements:", '  - id: "p1"',
  '    kind: "scrutiny"', '    subject: "ENT-2026-0011"',
  '    text: "Figures from the fund\'s own dashboard need the underlying ledger before they bear load."',
  '    justification: "The dashboard is produced by the body under examination."', "    citations: []",
  "    locked: false", "---", "", "## Statements", "", "The lens.", "", "## Adoption", "", "Adopted.", "",
  "## What This Does Not Enforce", "", "BIO checks that each statement names a registered subject. It does NOT "
  + "check whether a second source was independent of the first.", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const LEDGER = "INFO-2026-9149-ledger", MINUTES = "INFO-2026-9149-minutes";
const TITLE_P = "Discoverable sewer project 9149", TITLE_Q = "Always hidden project 9149";
const YEAR = new Date().toISOString().slice(0, 4);
const NEVER = `PROJ-${YEAR}-0000-never-minted-9149`;
let mf = null;

try {

/* ====================================================== 1. A PREDECESSOR'S STORE BOOTS EVERY PROJECT HIDDEN */
console.log("\n--- 1. a store written by the build BEFORE this one boots with every project HIDDEN ---");
let P, Q, IRIS, VERA, OLGA, RUTH, FOUNDER;
{
  /* THE PREDECESSOR: this tree with the visibility table NOT CREATED — the store every instance holds before
     REC-149 — over a PERSISTED store. Its projects are written there; this build then boots over the same bytes. */
  const tree = join(root, "predecessor");
  const PLANE = fileURLToPath(new URL("..", import.meta.url));
  const REPO = fileURLToPath(new URL("../..", import.meta.url));
  cpSync(SRC_DIR, join(tree, "bio-plane", "src"), { recursive: true });
  cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
  cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
  const schemaPath = join(tree, "bio-plane", "src", "schema.mjs");
  const schema = readFileSync(schemaPath, "utf8");
  const TABLE = /CREATE TABLE IF NOT EXISTS project_visibility \([\s\S]*?\);\nCREATE INDEX IF NOT EXISTS project_visibility_project ON project_visibility\(project_id, seq\);\n/;
  const hits = (schema.match(new RegExp(TABLE.source, "g")) || []).length;
  writeFileSync(schemaPath, schema.replace(TABLE, ""));
  t("1a: the predecessor is ARMED — the table's DDL occurs exactly once in this tree's schema and was removed",
    [hits, readFileSync(schemaPath, "utf8").includes("project_visibility (")], [1, false]);
  const old = planeAt(join(tree, "bio-plane", "src", "index.mjs"));
  try {
    const o = on(old);
    must("claim", await o.POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-149" }));
    for (const d of [LEDGER, MINUTES])
      must(d, await o.POST(`op=promote&token=${ADM}`, pkg(d, infoMd(d), "information", "collected", null, `${d}-${++seq}`)));
    P = await createProject(o, TITLE_P, [LEDGER]);
    Q = await createProject(o, TITLE_Q, [LEDGER]);
    must("iris owns P (on the predecessor)", await o.DO("projectclaimowner", { projectId: P, memberId: "iris" }));
    must("iris owns Q (on the predecessor)", await o.DO("projectclaimowner", { projectId: Q, memberId: "iris" }));
  } finally { await old.dispose(); }
  t("1b: two projects exist on the predecessor, with distinct minted ids", [typeof P, typeof Q, P !== Q], ["string", "string", true]);
}

mf = planeAt(IDX);
const api = on(mf);
const { RAW, DO, POST, GET } = api;
FOUNDER = (await POST("op=login", { password: "founder-passphrase-149" })).token;
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-149` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-149` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
RUTH = await enrol("ruth", "admin");
IRIS = await enrol("iris", "member");   /* both projects' owner */
VERA = await enrol("vera", "member");   /* NEVER invited: the caller outside */
OLGA = await enrol("olga", "member");   /* INVITED to P, never joins */
await enrol("pam", "member");
must("iris invites olga to P", await DO(`projectinvite?projectId=${P}&handle=olga&by=iris&viewer=admin`, {}));
const INQ = "INQ-2026-9149-transfer";
must("inquiry", await POST(`op=promote&token=${ADM}`, pkg(INQ, inquiryMd(INQ, LEDGER), "inquiry", "open", null, `${INQ}-${++seq}`)));
must("iris accepts v1", await POST(`op=versionaccept&token=${IRIS}&target=${E(INQ)}&version=v1&reason=${E("borne out")}`, {}));
{
  const bd = must("bias draft", await POST(`op=promote&token=${VERA}`, pkg(BIAS, biasMd("draft"), "bias", "draft", null, `rec149-bias-${++seq}`)));
  must("bias proposed", await DO("promote", { ...pkg(BIAS, biasMd("proposed"), "bias", "proposed", bd.bundleSha, "rec149-bias"), author: "vera" }));
}

{
  const vis = await GET(`op=projectvisibility&token=${IRIS}&projectId=${P}`);
  t("1c: THIS build over the predecessor's store: P reads HIDDEN, and says no owner ever set it",
    [vis && vis.setting, vis && vis.recorded, vis && vis.history && vis.history.length], ["hidden", false, 0]);
  const visQ = await GET(`op=projectvisibility&token=${IRIS}&projectId=${Q}`);
  t("1d: and so does Q", [visQ && visQ.setting, visQ && visQ.recorded], ["hidden", false]);
  const dir = await GET(`op=projectdirectory&token=${VERA}`);
  t("1e: the uninvited member's DIRECTORY is empty — no predecessor project is listed", dir && dir.projects, []);
}

/* =============================================== THE ACTS, as ONE table — vera's request for each, at an id X.
   REC-138's table (`project-sight.test.mjs`), at the acts; its reads are §4's. Every request is well-formed
   enough to REACH its project resolution. */
const vSel = async (id) => must(`vera selects ${id}`, await POST(`op=select&token=${VERA}&kind=enumerated`, { ids: [id] })).handle;
const V_MIN = await vSel(MINUTES), V_LED = await vSel(LEDGER);
const reviseOf = (X) => pkg(X, projectMd(X, "a revision", [LEDGER], "A revision."), "project", "forming", "0".repeat(64), "rec149-fixed-snap");
const ACTS = (X) => [
  ["promote (a revision)", () => RAW(`op=promote&token=${VERA}`, reviseOf(X))],
  ["cite", () => RAW(`op=cite&token=${VERA}&project=${X}&handle=${V_MIN}&note=${E("the minutes")}`, {})],
  ["sever", () => RAW(`op=sever&token=${VERA}&project=${X}&handle=${V_LED}&reason=${E("superseded")}`, {})],
  ["reinstate", () => RAW(`op=reinstate&token=${VERA}&project=${X}&handle=${V_LED}&reason=${E("back in")}`, {})],
  ["proposedispose (project-scoped)", () => RAW(`op=proposedispose&token=${VERA}`, { project: X, finding: "F-1", to: "deferred", reason: "waiting" })],
  ["publish&project=", () => RAW(`op=publish&token=${VERA}&project=${X}`, {})],
  ["airunopen over a project context", () => RAW(`op=airunopen&token=${VERA}`, { run: "RUN-rec149-1", contextType: "project", contextId: X })],
  ["versioncurrent&project=", () => RAW(`op=versioncurrent&token=${VERA}&target=${E(INQ)}&version=v1&project=${X}`, {})],
  ["conclude&project=", () => RAW(`op=conclude&token=${VERA}&target=${E(INQ)}&project=${X}&falsifier=${E("a rescinding minute")}`, {})],
  ["biasadopt scope=project", () => RAW(`op=biasadopt&token=${VERA}&bundleId=${BIAS}&scope=project&scopeId=${X}`)],
  ["casedraft", () => RAW(`op=casedraft&token=${VERA}`, { project: X })],
  ["projectinvite", () => RAW(`op=projectinvite&token=${VERA}&projectId=${X}&handle=pam`)],
  ["projectjoin", () => RAW(`op=projectjoin&token=${VERA}&projectId=${X}`)],
  ["projectleave", () => RAW(`op=projectleave&token=${VERA}&projectId=${X}`)],
  ["projectremove", () => RAW(`op=projectremove&token=${VERA}&projectId=${X}&handle=olga`)],
  ["projectowneradd", () => RAW(`op=projectowneradd&token=${VERA}&projectId=${X}&handle=olga`)],
  ["projectownerremove", () => RAW(`op=projectownerremove&token=${VERA}&projectId=${X}&handle=iris&reason=${E("r")}`)],
  ["projectownerrescue", () => RAW(`op=projectownerrescue&token=${VERA}&projectId=${X}&handle=olga&reason=${E("r")}`)],
  ["projectfork", () => RAW(`op=projectfork&token=${VERA}&projectId=${X}&title=${E("A fork")}`)],
  ["projectvisibilityset", () => RAW(`op=projectvisibilityset&token=${VERA}&projectId=${X}&setting=discoverable`)],
];
/* The READS that name a project by id. A read does not widen (§7.14: `viewerPredicate` is NOT changed), so at
   EXISTENCE each answers exactly as for a never-minted id. */
const READS = (X) => [
  ["projectparticipants", () => RAW(`op=projectparticipants&token=${VERA}&projectId=${X}`)],
  ["projectownerarith", () => RAW(`op=projectownerarith&token=${VERA}&projectId=${X}`)],
  ["projectvisibility", () => RAW(`op=projectvisibility&token=${VERA}&projectId=${X}`)],
  ["strengthbarof&project=", () => RAW(`op=strengthbarof&token=${VERA}&project=${X}`)],
  ["affordances target=", () => RAW(`op=affordances&token=${VERA}&target=${X}`)],
  ["biasmanifest scope=project", () => RAW(`op=biasmanifest&token=${VERA}&scope=project&scopeId=${X}`)],
  ["basisversions&project=", () => RAW(`op=basisversions&token=${VERA}&id=${E(INQ)}&project=${X}`)],
  ["versionstrength&project=", () => RAW(`op=versionstrength&token=${VERA}&id=${E(INQ)}&version=v1&project=${X}`)],
  ["airuns over a project context", () => RAW(`op=airuns&token=${VERA}&contextType=project&contextId=${X}`)],
  ["image id=", () => RAW(`op=image&token=${VERA}&id=${X}`)],
  ["file id=", () => RAW(`op=file&token=${VERA}&id=${X}&path=bundle.md`)],
];
const idless = (body, id) => body.split(id).join("<PROJECT-ID>");
const same = (a, aId, b, bId) => [a.status, a.type, sha(idless(a.body, aId))].join("|") === [b.status, b.type, sha(idless(b.body, bId))].join("|");
const readAll = async (rows) => { const out = []; for (const [, f] of rows) out.push(await f()); return out; };

/* ======================================================== 2. HIDDEN = ABSENT (every act, every read, the directory) */
console.log("\n--- 2. a HIDDEN project answers the uninvited exactly as a never-minted id does ---");
const absentActs = await readAll(ACTS(NEVER)), absentReads = await readAll(READS(NEVER));
{
  const hidActs = await readAll(ACTS(P)), hidReads = await readAll(READS(P));
  console.log(`  corpus: ${ACTS(P).length} acts and ${READS(P).length} reads, each read at a never-minted id and at hidden P`);
  t("2a: the tables are not empty (floors: 20 acts, 11 reads)", [ACTS(P).length >= 20, READS(P).length >= 11], [true, true]);
  ACTS(P).forEach(([name], i) => t(`2b: HIDDEN = ABSENT, raw: op=${name}`, same(hidActs[i], P, absentActs[i], NEVER), true));
  READS(P).forEach(([name], i) => t(`2c: HIDDEN = ABSENT, raw: read op=${name}`, same(hidReads[i], P, absentReads[i], NEVER), true));
  t("2d: no act at a hidden project answers C-70.1 (it is never said about a hidden project)",
    hidActs.map((r) => codeOf(parse(r))).filter((c) => c === "PROJECT_SEEN_NOT_A_PARTICIPANT"), []);
  /* The directory is identical whether the hidden project exists or not: it lists neither. */
  t("2e: the DIRECTORY with P hidden is the directory of a record holding no project to list",
    (await GET(`op=projectdirectory&token=${VERA}`))?.projects, []);
}

/* THE CONTENTS BASELINE, taken while P is hidden: what the uninvited member's record reads return. §5 demands the
   same bytes once P is discoverable. */
const CONTENT_READS = [
  ["list", () => RAW(`op=list&token=${VERA}&limit=1000`)],
  ["index", () => RAW(`op=index&token=${VERA}`)],
  ["search (the project's own words)", () => RAW(`op=search&token=${VERA}&q=${E("sewer")}`)],
  ["search (its title)", () => RAW(`op=search&token=${VERA}&q=${E(`title:"${TITLE_P}"`)}`)],
  ["backlinks of the ledger it cites", () => RAW(`op=backlinks&token=${VERA}&target=${LEDGER}`)],
  ["dangling", () => RAW(`op=dangling&token=${VERA}`)],
  ["projection", () => RAW(`op=projection&token=${VERA}`)],
];
const contentsHidden = await readAll(CONTENT_READS);
let contentsDisc = null;

/* ======================================================== 3. THE OWNER MAKES P DISCOVERABLE */
console.log("\n--- 3. the owner sets P DISCOVERABLE; the uninvited member sees its existence and name, and nothing else ---");
{
  const set = await POST(`op=projectvisibilityset&token=${IRIS}&projectId=${P}&setting=discoverable&reason=${E("open to the neighbourhood")}`);
  t("3a: iris (the owner) sets P discoverable — recorded with the owner, the reason and a date",
    [set && set.ok, set && set.setting, set && set.set_by, set && set.reason, typeof (set && set.at)],
    [true, "discoverable", "iris", "open to the neighbourhood", "string"]);
  /* The contents reads, taken NOW — after the setting and before anything else moves — so §5 compares the same
     record at the two settings and nothing else. (MEASURED: taken after §4's citations, a visible search hit's
     relevance score moved, because FTS ranking reads corpus-wide statistics that a revision of a project the
     reader cannot see changes. That is a side channel of its own, reported by REC-149, not this setting.) */
  contentsDisc = await readAll(CONTENT_READS);
  const dir = await GET(`op=projectdirectory&token=${VERA}`);
  t("3b: vera's DIRECTORY lists P — its id and name and her own request state, and NOTHING else",
    dir && dir.projects, [{ id: P, name: TITLE_P, request: null }]);
  t("3c: the request is NOT BUILT, and the directory says so rather than letting null read as a fact",
    typeof (dir && dir.requests) === "string" && dir.requests.startsWith("NOT_BUILT"), true);
  t("3d: Q, still hidden, is NOT listed", (dir && dir.projects || []).some((p) => p.id === Q), false);
  t("3e: olga (INVITED to P) is not offered P — she is already in it",
    (await GET(`op=projectdirectory&token=${OLGA}`))?.projects, []);
  t("3f: ruth (an administrator: full sight, §7.3) is not offered P either — the directory is for the OUTSIDE",
    (await GET(`op=projectdirectory&token=${RUTH}`))?.projects, []);
  t("3g: iris (the owner) is not offered her own project", (await GET(`op=projectdirectory&token=${IRIS}`))?.projects, []);

  const exActs = await readAll(ACTS(P));
  ACTS(P).forEach(([name], i) => {
    const r = parse(exActs[i]);
    t(`3h: AT EXISTENCE, op=${name} is refused POSITIONALLY — C-70.1, naming P by its id and name`,
      [codeOf(r), r && r.check, r && r.project, r && r.name], ["PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", P, TITLE_P]);
  });
  const allowed = ["ok", "reason", "code", "check", "translation", "detail", "project", "name",
                   /* the run open's own shape: the caller's own run id and that it did not start */ "run", "started",
                   /* the control plane's envelope on every answer */ "store", "tokenClass"];
  t("3i: and each C-70.1 carries NOTHING about the project beyond its id and name (no state, owner, participant, act)",
    exActs.map((r, i) => [ACTS(P)[i][0], Object.keys(parse(r) || {}).filter((k) => !allowed.includes(k))])
      .filter(([, extra]) => extra.length), []);
  t("3j: nor does any C-70.1's text name an owner, a participant or the project's state",
    exActs.filter((r) => /iris|olga|forming/.test(r.body)).map((r, i) => ACTS(P)[i][0]), []);
  t("3k: no act changed anything: P's participants are still iris and olga, and no fork was made",
    ((await GET(`op=projectparticipants&token=${IRIS}&projectId=${P}`))?.participants || []).map((p) => p.handle).sort(),
    ["iris", "olga"]);

  const exReads = await readAll(READS(P));
  READS(P).forEach(([name], i) => t(`3l: READS DO NOT WIDEN — read op=${name} at EXISTENCE is byte-identical to a never-minted id`,
    same(exReads[i], P, absentReads[i], NEVER), true));
  const qActs = await readAll(ACTS(Q));
  ACTS(Q).forEach(([name], i) => t(`3m: Q, HIDDEN beside a discoverable P, still answers as absent: op=${name}`,
    same(qActs[i], Q, absentActs[i], NEVER), true));
}

/* ======================================================== 4. THOSE WHO SEE IT FULLY ARE UNCHANGED */
console.log("\n--- 4. an invited member, an administrator, the owner and machine credentials are unchanged ---");
{
  t("4a: olga (invited) — op=projectinvite still answers NOT_THE_OWNER (full sight, no role)",
    codeOf(await POST(`op=projectinvite&token=${OLGA}&projectId=${P}&handle=pam`)), "NOT_THE_OWNER");
  const sel = async (tok, id) => (await POST(`op=select&token=${tok}&kind=enumerated`, { ids: [id] })).handle;
  t("4b: ruth (administrator) — op=cite still answers C-56.1 (sight is not authority)",
    codeOf(await POST(`op=cite&token=${RUTH}&project=${P}&handle=${await sel(RUTH, MINUTES)}&note=${E("n")}`, {})),
    "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("4c: iris (owner) — cites into her discoverable project",
    (await POST(`op=cite&token=${IRIS}&project=${P}&handle=${await sel(IRIS, MINUTES)}&note=${E("n")}`, {}))?.ok, true);
  t("4d: the MEMBER token still cites into it (machine credentials see every project)",
    (await POST(`op=cite&token=${MEM}&project=${P}&handle=${await sel(MEM, LEDGER)}&note=${E("m")}`, {}))?.ok, true);
  t("4e: olga reads the setting and its history (a participant has full sight of it)",
    ((await GET(`op=projectvisibility&token=${OLGA}&projectId=${P}`))?.history || []).map((h) => [h.setting, h.set_by]),
    [["discoverable", "iris"]]);
  t("4f: the founder reads it too (§7.14: administrators and the founder see the setting and its history)",
    (await GET(`op=projectvisibility&token=${FOUNDER}&projectId=${P}`))?.setting, "discoverable");
}

/* ======================================================== 5. CONTENTS NEVER REACH THE UNINVITED */
console.log("\n--- 5. the uninvited member's record reads never show a discoverable project's contents ---");
{
  console.log(`  corpus: ${CONTENT_READS.length} record reads, read hidden and discoverable`);
  /* Two things are normalised and nothing else: a read's own clock (`generated`), and a search's echo of the
     caller's OWN query, the `query` block (the title search asks for the title, and the answer repeats what
     was asked, three ways). The hits, the total, the facets and the gate are compared whole. */
  const scrub = (body) => JSON.stringify(JSON.parse(body), (k, v) => (k === "generated" ? "<clock>"
    : k === "query" && v && typeof v === "object" && "q" in v ? "<the caller's own query, echoed>" : v));
  CONTENT_READS.forEach(([name], i) => {
    t(`5a: CONTENTS: op=${name} is byte-identical before and after P went discoverable`,
      [contentsDisc[i].status, sha(scrub(contentsDisc[i].body))], [contentsHidden[i].status, sha(scrub(contentsHidden[i].body))]);
    t(`5b: CONTENTS: op=${name} names neither P's id nor its title`,
      [scrub(contentsDisc[i].body).includes(P), scrub(contentsDisc[i].body).includes(TITLE_P)], [false, false]);
  });
  /* The positive half, so 5a/5b cannot pass over reads that show nothing to anybody: iris sees P in each. */
  t("5c: the reads are not blind — iris's op=list names P, and her backlinks of the ledger name P",
    [(await RAW(`op=list&token=${IRIS}&limit=1000`)).body.includes(P),
     (await RAW(`op=backlinks&token=${IRIS}&target=${LEDGER}`)).body.includes(P)], [true, true]);
}

/* ======================================================== 6. ONLY AN OWNER SETS IT */
console.log("\n--- 6. the setting is an OWNER's act: nobody else sets it, and every act is recorded ---");
{
  const set = (tok, s = "hidden") => POST(`op=projectvisibilityset&token=${tok}&projectId=${P}&setting=${s}`);
  t("6a: olga (invited, not an owner) is refused C-70.2", codeOf(await set(OLGA)), "PROJECT_VISIBILITY_NOT_THE_OWNER");
  t("6b: ruth (an administrator) is refused C-70.2 — administrators direct nothing", codeOf(await set(RUTH)), "PROJECT_VISIBILITY_NOT_THE_OWNER");
  t("6c: the founder's session is refused C-70.2", codeOf(await set(FOUNDER)), "PROJECT_VISIBILITY_NOT_THE_OWNER");
  t("6d: the ADMIN token is refused C-70.2", codeOf(await set(ADM)), "PROJECT_VISIBILITY_NOT_THE_OWNER");
  t("6e: the MEMBER token is refused C-70.2", codeOf(await set(MEM)), "PROJECT_VISIBILITY_NOT_THE_OWNER");
  t("6f: vera (outside, at EXISTENCE) is refused C-70.1, positionally", codeOf(await set(VERA)), "PROJECT_SEEN_NOT_A_PARTICIPANT");
  t("6g: a setting that is neither word is refused C-70.3, even for the owner", codeOf(await set(IRIS, "public")), "PROJECT_VISIBILITY_UNKNOWN_SETTING");
  t("6h: after all that, P is still discoverable and its history holds ONE act",
    ((await GET(`op=projectvisibility&token=${IRIS}&projectId=${P}`))?.history || []).length, 1);
  const back = await set(IRIS, "hidden");
  t("6i: iris sets P HIDDEN again — recorded, append-only (two acts, latest wins)",
    [back && back.ok, ((await GET(`op=projectvisibility&token=${IRIS}&projectId=${P}`))?.history || []).map((h) => h.setting)],
    [true, ["discoverable", "hidden"]]);
  t("6j: and vera's directory is empty again", (await GET(`op=projectdirectory&token=${VERA}`))?.projects, []);
  const again = await readAll(ACTS(P));
  ACTS(P).forEach(([name], i) => t(`6k: HIDDEN AGAIN = ABSENT, raw: op=${name}`, same(again[i], P, absentActs[i], NEVER), true));
}

/* ======================================================== 7. THE DIRECTORY IS A MEMBER'S */
console.log("\n--- 7. the directory is asked by a member; a credential with no member is refused, never answered empty ---");
{
  t("7a: the MEMBER token is refused C-70.4", codeOf(await GET(`op=projectdirectory&token=${MEM}`)), "PROJECT_DIRECTORY_NEEDS_A_MEMBER");
  t("7b: the ADMIN token is refused C-70.4", codeOf(await GET(`op=projectdirectory&token=${ADM}`)), "PROJECT_DIRECTORY_NEEDS_A_MEMBER");
  t("7c: a caller-supplied viewer= on vera's session is overwritten by the stamp (she still gets her own directory)",
    (await GET(`op=projectdirectory&token=${VERA}&viewer=${E("member:iris")}`))?.ok, true);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  if (mf) await mf.dispose();
  rmSync(root, { recursive: true, force: true });
}
console.log(`\nproject-discoverable: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
