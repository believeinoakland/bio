/* NEGATIVE CONTROL: RUN BY `test/current-shared-question.control.mjs` (a `.control.mjs`, not discovered by the battery, because it EDITS src/ while it runs). Each arm is armed ALONE, restored from a per-arm pristine copy and verified by sha256, by content AND by cmp; the declarations live on that driver, which checks each run against its declaration as a TOTAL. RUN 2026-09-22 by the REC-166 worker: baseline 18/0 * (a) RESTORE THE INQUIRY PROMOTION, the row's own control -> 10/8, the pin arms BY NAME ("THE PIN: after ANOTHER project's make-current", "THE PIN, AGAIN", the byte-identical arm), both flag arms, both fence arms and the unpublished make-current arm, the receipt arms green * (b) THE LIAR, no Reason: in the project -> 16/2, the two receipt arms alone * (c) THE REFUSED FIX (b), promotion restored and the flag exempted -> 12/6, the flag arms GREEN while the pins and fences fail * (d) OVER-STRICTNESS, the project's sentence re-worded -> 18/0. EVERY ARM AS DECLARED; every restore sha256 MATCH, content IDENTICAL, cmp SAME. */
/* D-667 (declared and RUN 2026-09-25, WORKER D-667), THE RECORDER — every section now runs in `block()` (D-548's
 * recorder, D-564's pattern), so the arms break a section's FIXTURE. Re-run in one step: `node test/d564-block.control.mjs
 * current-shared-question` from bio-plane/. BASELINE -> 18 pass, 0 fail, per section (0 (setup), 1..4) 0/0, 4/0, 7/0,
 * 5/0, 2/0, foot reached. (e) SECTION 1's FIXTURE BROKEN — A's make-current on Q names a reading Q does not hold (anchor on the driver) ->
 * MEASURED 2 pass, 3 fail, `BLOCK 1 DIED: (fixture) A stands on reading 1` (VERSION_ACT_NO_SUCH_VERSION), `BLOCK 2 DIED:
 * rests on section 1, which did not produce CASE, PIN, pinnedText` and the same for BLOCK 3; section 4 at 2/0, foot
 * reached, exit 1. (f) THE RECORDER DISARMED (`block()` rethrows) over (e)'s fixture -> MEASURED no foot and no section
 * tally, exit 1. */
/* REC-166 — A PROJECT'S MAKE-CURRENT WRITES NOTHING ON THE SHARED QUESTION
 * (INVESTIGATIVE-SESSION.md §7, ruled 2026-09-22 by BOB #25, fix (a); IC-175.)
 *
 * WHAT WAS WRONG, measured through the ops by REC-157 (M-92) and re-read at the
 * code by REC-166: `op=versioncurrent&project=P` promoted the INQUIRY first — its
 * `last_updated` and a Session Log line "reading '<v>' is what P stands on" — and
 * only then wrote P's pointer. The finding's `bundle_sha` moved for a change that
 * is not a change to the finding, so every case pinning it stopped pinning its
 * current version (CASE-4's fences stopped applying) and `#flagCasesOnRevision`
 * flagged every such case, ANOTHER PROJECT'S INCLUDED: one team's decision
 * silently moving another team's, which §7 forbids.
 *
 * FIX (a), AS BUILT: the project arm writes its receipt — `last_updated`, the
 * Session Log entry, and the member's authored reason — into the PROJECT's own
 * bytes, in the ONE promotion that writes the pointer, and does not promote the
 * inquiry at all. Accept, reject, consider, revert and hide still write the
 * question, because they change the version block every project reads.
 *
 * HOW A LIAR PASSES, stated before what is checked. (1) DROP THE RECEIPT WITH THE
 * PROMOTION: the question's bytes stop moving and every pin arm passes, while the
 * record loses the member's reason. The project already carried a "Stands on"
 * entry before this item, so asserting that entry alone passes on the untouched
 * plane AND for the liar. So the receipt arm makes the project current WITH A
 * REASON and asserts the `Reason:` line INSIDE the project's `| Stands on |` entry,
 * together with the question and the reading — matched on facts, never on the
 * entry's wording (the control's over-strictness arm re-words it and must stay
 * green). (2) THE REFUSED FIX (b): keep promoting the question and exempt the
 * revision flag. `op=caseflags` then reads clean; so the pin arm and the fence
 * arms are asserted BESIDE the flag arm, and they fail for it.
 *
 * WHAT IS DRIVEN, every act through the control plane as a member, the edition
 * ratified with a real ssh-keygen signature:
 *  1. Question Q has two ACCEPTED readings; projects A and B both cite it. A stands
 *     on reading 1, concludes, publishes case X and ratifies it. The pin is taken.
 *     Before anything moves, the fences are asserted to HOLD (the non-empty guard
 *     for every fence arm below) and an unpublished twin shows the divide/ground
 *     affordances ARE offered where nothing is pinned, so their absence on Q is a
 *     fence and not a missing act.
 *  2. B — ANOTHER PROJECT — makes reading 2 current WITH A REASON. Q's bundle_sha
 *     is still the pin; Q's bundle.md and last_updated are byte-identical;
 *     `op=caseflags` names nothing for Q or for case X; the case's fences hold;
 *     B's own bytes carry the pointer and the receipt with the reason.
 *  3. A — THE PUBLISHING PROJECT ITSELF — makes reading 2 current with a reason.
 *     The same five facts hold: a project's stance never moves the finding.
 *  4. On an UNPUBLISHED question, the acts that DO change the shared version block
 *     still move its bytes: accept, consider, revert, reject, hide. And a
 *     make-current there still moves nothing on it (the rule is the act's, not the
 *     pin's).
 *
 * WHAT IT CANNOT SEE: the sharing edge is hand-authored into `references[]`
 * (REC-72's open finding); no arm reads the published container bytes; a
 * make-current's refusals (VERSION_NOT_ACCEPTED, VERSION_CURRENT_NO_PROJECT,
 * VERSION_CURRENT_UNRELATED, the joined-project authority) are `current.test.mjs`'s,
 * `versionstate.test.mjs`'s and `project-authority.test.mjs`'s, and are unchanged.
 * ========================================================================= */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ratifyCase } from "./caseceremony.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- current-shared-question ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("current-shared-question.test.mjs: SKIPPED — ssh-keygen not on PATH; a PINNED finding exists only "
    + "once a case is ratified, and ratification is a real bio-ratify signature");
  process.exit(0);
}

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const enc = encodeURIComponent;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* INSTANCE_NAME IS BOUND because every install binds it (D-436, IC-172). */
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-r166", MEMBER_TOKEN: "mem-r166",
              PROBE_TOKEN: "prb-r166", DAEMON_TOKEN: "dmn-r166", VERSION: "0.70.0",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
/* D-667 (D-564's pattern): EVERY SECTION RUNS INSIDE `block()` — D-548's recorder (d84-case-manifest.test.mjs),
   adopted. Before it, `bail()` recorded one FIXTURE failure, printed the foot, disposed the sandbox and exited on the
   FIRST fixture failure, so one broken fixture ended the run and every later section went unmeasured. Now a fixture
   failure is a THROW that `block()` records as ONE failure naming its section, and the sections after it still run
   and report. Each section's own tally is printed at the foot; a section that DIED prints -1, never the partial
   count it reached; a section expected but never reported fails by name. A section resting on an earlier one's
   values asks for them with `needs()` and dies naming the section it rests on. */
const bail = (what, r) => { throw new Error(`(fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`); };
const needs = (section, vals) => {
  const missing = Object.entries(vals).filter(([, v]) => v === undefined).map(([k]) => k);
  if (missing.length) throw new Error(`rests on section ${section}, which did not produce ${missing.join(", ")}`);
};
const TALLY = [];
const block = async (name, fn) => {
  const p0 = pass, f0 = fail;
  let died = false;
  try { await fn(); }
  catch (e) {
    died = true;
    fail++;
    console.log(`  FAIL  BLOCK ${name} DIED: ${String((e && e.message) || e).slice(0, 700)}`);
    console.log("         (the sections after this one still run — see below)");
  }
  TALLY.push({ name, pass: died ? -1 : pass - p0, fail: died ? -1 : fail - f0, died });
};
const must = async (what, r) => { if (!r || r.ok !== true) await bail(what, r); return r; };

/* ---- the member, the signing key ---- */
const dir = mkdtempSync(join(tmpdir(), "rec166-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "iris", "-f", join(dir, "iris"), "-q"]);
const keyB64 = readFileSync(join(dir, "iris.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "iris"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, role, caps) => {
  const add = await POST("op=memberadd&token=adm-r166",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add?.ok) await bail(`memberadd ${memberId}`, add);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en?.ok) await bail(`enroll ${memberId}`, en);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg?.token) await bail(`login ${memberId}`, lg);
  return lg.token;
};
/* ONE member creates, owns and joins BOTH projects: what distinguishes A from B is
   the PROJECT, which is the whole subject of §7, and holding the member fixed
   keeps the joined-project authority (REC-134) out of the measurement.
   D-667: the values later sections read are declared here and ASSIGNED inside block "0 (setup)" below. */
let IRIS, A, B;

/* ------------------------------------------------------------- DOCUMENTS */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", "and"),
    ...scalar("state", "suggested"),
    ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("claim", v.claim), ...scalar("author", "iris"), ...scalar("at", NOW)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ['  - version: "' + v.name + '"', ...scalar("ground", g),
     ...scalar("asserted_by", "iris"), ...scalar("at", NOW)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ['  - version: "' + v.name + '"', ...scalar("target", l.target),
     ...scalar("role", "supports"), ...scalar("ground", l.ground),
     ...scalar("grade", "B"), ...scalar("grade_axis", "capture"),
     ...scalar("grade_source", "capture")].join("\n")));
  return ["basis_versions:", ...rows,
          ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
          ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};
const inquiryMd = (id, { title, versions = [], basis = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${title}"`,
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
const projectMd = (title, cites) => ["---",
  "object_type: project", "schema: project@1", `title: "${title}"`,
  "current_state: investigating", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(cites.length
    ? ["references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
    : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."',
  "---", "", "## Thesis Summary", "", "A project.", "", "## Open Questions", "",
  "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type) => POST(`op=promote&token=${IRIS}`, {
  bundleId: id, base: null,
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
const shaOf = async (id) => (await GET(`op=list&token=${IRIS}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
const textOf = async (id) => {
  const r = await GET(`op=file&token=${IRIS}&id=${enc(id)}&path=bundle.md`);
  return typeof r?.text === "string" ? r.text : null;
};
const lastUpdatedOf = (text) => (/^last_updated:\s*"?([^"\n]*)"?$/m.exec(text || "") || [])[1] ?? null;
/* THE PROJECT'S `| Stands on |` ENTRIES, each as its whole text up to the next
   heading. Matched on the HEADER'S act word — the one anchor `current.test.mjs`
   and `current.control.mjs` already pin — never on the body's sentence. */
const standsOnEntries = (text) => (String(text || "").split(/\n(?=### )/))
  .filter((e) => /^### Session [^\n]*\| Stands on \|/.test(e));
const flagsFor = async (q) => (await GET(`op=caseflags&${q}`)) || {};
const acts = async (target) =>
  ((await GET(`op=affordances&token=${IRIS}&target=${enc(target)}`))?.acts || []).map((a) => a.id);
const stanceOf = async (project, id) => {
  const r = await GET(`op=basisversions&token=${IRIS}&id=${enc(id)}&limit=50&project=${enc(project)}`) || {};
  return Object.prototype.hasOwnProperty.call(r, "current") ? r.current : "FIELD-ABSENT";
};
const stanceVersion = (s) => (s && typeof s === "object") ? (s.version ?? null) : s;

const LEDGER = "INFO-2026-4166-ledger", MINUTES = "INFO-2026-4166-minutes", AUDIT = "INFO-2026-4166-audit";

const CLAIM_1 = "The transfer followed the process the council adopted in 2024.";
const CLAIM_2 = "The transfer bypassed the council vote the adopted process requires.";
const V1 = { name: "paper trail", claim: CLAIM_1,
  description: "The ledger and the minutes together show the transfer was authorised.",
  grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail" }, { target: MINUTES, ground: "paper trail" }] };
const V2 = { name: "the audit", claim: CLAIM_2,
  description: "The audit shows the transfer happened without the required vote.",
  grounds: ["the audit"], legs: [{ target: AUDIT, ground: "the audit" }] };
const V3 = { name: "the press account", claim: "A newspaper reported the vote was skipped.",
  description: "A single press account.", grounds: ["the press account"],
  legs: [{ target: AUDIT, ground: "the press account" }] };

const Q = "INQ-2026-4166-shared";        /* the published, shared question */
const QT = "INQ-2026-4166-twin";         /* its unpublished twin: the affordances' non-empty guard */
const QU = "INQ-2026-4166-unpublished";  /* section 4: the acts that DO write the question */
const act = async (verb, target, version, extra = "") =>
  POST(`op=version${verb}&token=${IRIS}&target=${enc(target)}&version=${enc(version)}${extra}`, {});
const accept = (target, version) => act("accept", target, version, `&reason=${enc("the evidence holds")}`);
const makeCurrent = (project, target, version, reason = null) =>
  act("current", target, version, `&project=${enc(project)}${reason ? `&reason=${enc(reason)}` : ""}`);

const FALSIFIER = "a council minute showing the vote was never taken";
let pubSeq = 0;
const publish = async (project, target) => {
  const n = ++pubSeq;
  return POST(`op=publish&token=${IRIS}`, {
    project, scope: `Whether the record answers ${target}.`,
    targets: [target], roles: { [target]: "load_bearing" },
    statement: `This case does not cover the 2025 transfers (publication ${n}).`,
    subjectPosition: "sought_no_answer",
    subjectJustification: `The subject was asked and declined to comment (publication ${n}).`,
    biasAcknowledgement: `The publishing project is funded by a party with an interest (publication ${n}).`,
    excluded: [{ target: null, description: `The 2025 transfers (publication ${n})`, reason: "Out of scope." }] });
};

/* D-667: THE SETUP, in the order it always ran — the member and key, the documents, the questions, the projects,
   the acceptances — as block "0 (setup)"; only pure definitions stand outside it. */
await block("0 (setup)", async () => {
IRIS = await enrol("iris", "admin", ["contribute", "publish"]);
await must("register iris's signing key",
  await POST("op=signeradd&token=adm-r166", { keyB64, memberId: "iris", comment: "iris laptop" }));
for (const d of [LEDGER, MINUTES, AUDIT]) await must(`promote ${d}`, await promote(d, infoMd(d), "information"));
await must(`promote ${Q}`, await promote(Q, inquiryMd(Q, { title: "Did the transfer follow the process?",
  versions: [V1, V2], basis: [LEDGER] }), "inquiry"));
await must(`promote ${QT}`, await promote(QT, inquiryMd(QT, { title: "Was the vote recorded?",
  versions: [V1, V2], basis: [LEDGER] }), "inquiry"));
await must(`promote ${QU}`, await promote(QU, inquiryMd(QU, { title: "Was the contract advertised?",
  versions: [V1, V2, V3], basis: [LEDGER] }), "inquiry"));

A = await createProject("oversight", projectMd("Oversight", [Q, QU]));
B = await createProject("neighbours", projectMd("Neighbours", [Q]));

for (const id of [Q, QT]) for (const v of [V1, V2]) await must(`accept ${v.name} on ${id}`, await accept(id, v.name));
});

/* THE FENCES, ASSERTED TO HOLD BEFORE ANYTHING MOVES, and their affordances shown
   to exist where nothing is pinned — so an absence below is a fence, not a missing act. */
const fence = async () => {
  const pv = await act("reject", Q, V2.name, `&reason=${enc("probe")}&preview=1`);
  const a = await acts(Q);
  const again = await publish(A, Q);
  return [pv?.ok, pv?.reason ?? null, a.includes("inquirydivide"), a.includes("inquiryground"),
          again?.ok, again?.reason ?? null];
};
const FENCE_HOLDS = [false, "PUBLISHED_CANNOT_MOVE_VERSION", false, false, false, "ALREADY_A_CASE_MEMBER"];
let CASE, PIN, pinnedText;   /* D-667: section 1 makes them; 2 and 3 read them */

/* =======================================================================
   1. THE PIN — A publishes case X over Q, and the fences are shown to HOLD.
   ======================================================================= */
console.log("\n--- 1. A stands on reading 1, concludes, publishes and ratifies case X ---");
await block("1", async () => {
needs("0 (setup)", { IRIS, A });

await must("A stands on reading 1", await makeCurrent(A, Q, V1.name));
await must("A concludes on it",
  await POST(`op=conclude&token=${IRIS}&falsifier=${enc(FALSIFIER)}&target=${enc(Q)}&project=${enc(A)}`, {}));
const pub = await publish(A, Q);
if (pub?.ok !== true) await bail("A publishes case X", pub);
await ratifyCase(async (q, b) => POST(q, b), pub, { dir, key: "iris", token: IRIS });
for (const f of pub.findings || []) {
  const r = await POST(`op=ratify&token=${IRIS}`,
    { bundleId: f.target, expectedSha: f.bundleSha, sig: signRatify(f.target, f.bundleSha) });
  if (!r?.ok) await bail(`ratify ${f.target}`, r);
}
CASE = pub.caseId; PIN = pub.bundleSha;
pinnedText = await textOf(Q);
t("(fixture) case X is ratified and pins Q at its current bytes — the non-empty guard for every pin arm",
  [typeof CASE, typeof PIN, (await shaOf(Q)) === PIN, typeof pinnedText === "string" && pinnedText.length > 500],
  ["string", "string", true, true]);
const flags0 = [(await flagsFor(`target=${enc(Q)}`)).count, (await flagsFor(`case=${enc(CASE)}`)).count];
t("(fixture) before any stance moves, op=caseflags names nothing for Q or for case X", flags0, [0, 0]);

/* THE FENCES, ASSERTED TO HOLD BEFORE ANYTHING MOVES, and their affordances shown
   to exist where nothing is pinned — so an absence below is a fence, not a missing act.
   (D-667: `fence` and FENCE_HOLDS are defined above the sections, unchanged, since 2 and 3 call them too.) */
t("(fixture) the case's fences HOLD on the pinned finding: a version move refused, divide and ground "
+ "not offered, publishing unchanged refused", await fence(), FENCE_HOLDS);
const twinActs = await acts(QT);
t("(fixture) on the UNPUBLISHED twin, divide and ground ARE offered — so their absence on Q is CASE-4's "
+ "fence, never an act that does not exist",
  [twinActs.includes("inquirydivide"), twinActs.includes("inquiryground")], [true, true]);

});

/* =======================================================================
   2. ANOTHER PROJECT MOVES ITS STANCE.
   ======================================================================= */
console.log("\n--- 2. B, another project, makes reading 2 current with a reason ---");
await block("2", async () => {
needs("0 (setup)", { IRIS, A, B });
needs("1", { CASE, PIN, pinnedText });

const WHY_B = "the audit is the only document that addresses the vote";
const bBefore = await textOf(B);
const cB = await makeCurrent(B, Q, V2.name, WHY_B);
t("(fixture) B's make-current succeeds, names B, and carries the reason on its receipt",
  [cB?.ok, cB?.act, cB?.project, cB?.version, cB?.reason], [true, "current", B, V2.name, WHY_B]);
const qAfterB = await textOf(Q);
t("THE PIN: after ANOTHER project's make-current, Q's bundle_sha is STILL case X's pin",
  (await shaOf(Q)) === PIN, true);
t("and Q's bundle.md is byte-identical, last_updated included — nothing was written on the shared question",
  [qAfterB === pinnedText, lastUpdatedOf(qAfterB) === lastUpdatedOf(pinnedText)], [true, true]);
t("NO REVISION FLAG: op=caseflags names no case for Q and nothing for case X",
  [(await flagsFor(`target=${enc(Q)}`)).count, (await flagsFor(`case=${enc(CASE)}`)).count], [0, 0]);
t("THE FENCES STILL HOLD on case X's member after B moved its stance", await fence(), FENCE_HOLDS);
{
  const bAfter = await textOf(B);
  const fresh = standsOnEntries(bAfter).filter((e) => !standsOnEntries(bBefore).includes(e));
  t("THE RECEIPT IS B'S: exactly one new `| Stands on |` entry in B's own bytes, and it carries the "
  + "question, the reading and the member's REASON — the line the liar drops with the promotion",
    [fresh.length, fresh.length === 1 && fresh[0].includes(Q), fresh.length === 1 && fresh[0].includes(`'${V2.name}'`),
     fresh.length === 1 && fresh[0].includes(`\nReason: ${WHY_B}\n`)],
    [1, true, true, true]);
  t("and B's pointer reads reading 2, while A's still reads reading 1 — one team's act, one team's stance",
    [stanceVersion(await stanceOf(B, Q)), stanceVersion(await stanceOf(A, Q))], [V2.name, V1.name]);
}

});

/* =======================================================================
   3. THE PUBLISHING PROJECT ITSELF MOVES ITS STANCE.
   ======================================================================= */
console.log("\n--- 3. A, the publishing project, makes reading 2 current with a reason ---");
await block("3", async () => {
needs("0 (setup)", { IRIS, A });
needs("1", { CASE, PIN, pinnedText });

const WHY_A = "the team is examining the audit reading";
const cA = await makeCurrent(A, Q, V2.name, WHY_A);
t("(fixture) A's make-current succeeds", [cA?.ok, cA?.project, cA?.version], [true, A, V2.name]);
t("THE PIN, AGAIN: the publishing project's OWN make-current leaves Q at case X's pin — a stance is the "
+ "project's, never the finding's",
  [(await shaOf(Q)) === PIN, (await textOf(Q)) === pinnedText], [true, true]);
t("and still no revision flag for Q or for case X",
  [(await flagsFor(`target=${enc(Q)}`)).count, (await flagsFor(`case=${enc(CASE)}`)).count], [0, 0]);
t("and the fences still hold", await fence(), FENCE_HOLDS);
{
  const e = standsOnEntries(await textOf(A)).filter((x) => x.includes(`\nReason: ${WHY_A}\n`));
  t("A's own bytes carry the receipt with A's reason, naming the question and the reading",
    [e.length, e.length === 1 && e[0].includes(Q), e.length === 1 && e[0].includes(`'${V2.name}'`)], [1, true, true]);
}

});

/* =======================================================================
   4. THE ACTS THAT CHANGE THE SHARED VERSION BLOCK STILL WRITE THE QUESTION.
   ======================================================================= */
console.log("\n--- 4. on an unpublished question, accept and its siblings still move its bytes ---");
await block("4", async () => {
needs("0 (setup)", { IRIS, A });

const moves = async (label, call) => {
  const before = await shaOf(QU);
  const r = await call();
  const after = await shaOf(QU);
  return [label, r?.ok === true, typeof before === "string" && typeof after === "string" && before !== after];
};
const why = `&reason=${enc("the evidence says so")}`;
const sib = [
  await moves("accept", () => act("accept", QU, V1.name, why)),
  await moves("accept 2", () => act("accept", QU, V2.name, why)),
  await moves("consider", () => act("consider", QU, V3.name, why)),
  await moves("revert", () => act("revert", QU, V3.name, why)),
  await moves("reject", () => act("reject", QU, V3.name, why)),
  await moves("hide", () => act("hide", QU, V3.name, why)),
];
t("op=versionaccept and each sibling (consider, revert, reject, hide) STILL promote the shared question — "
+ "they change what every project reads (§7's ruling keeps them)",
  sib, sib.map(([l]) => [l, true, true]));
{
  const before = await shaOf(QU), beforeText = await textOf(QU);
  const r = await makeCurrent(A, QU, V1.name, "standing on the paper trail here");
  t("and a make-current on the UNPUBLISHED question moves nothing on it either — the rule is the act's, "
  + "not the pin's",
    [r?.ok, (await shaOf(QU)) === before, (await textOf(QU)) === beforeText], [true, true, true]);
}

});

/* D-667: every section's own tally, -1 for one that DIED; a section that never recorded at all is named missing
   rather than read as clean — the foot counts the sections it expected against the ones that reported. The
   `current-shared-question.control.mjs` driver reads `N pass, M fail` off the foot line; its prefix is unchanged. */
const EXPECTED = ["0 (setup)", "1", "2", "3", "4"];
console.log("\n--- per-section tallies (D-667: -1 = the section DIED, its tally is missing) ---");
for (const n of EXPECTED) {
  const r = TALLY.find((x) => x.name === n);
  if (!r) { fail++; console.log(`  FAIL  section ${n}: NEVER REPORTED — tally -1`); continue; }
  console.log(`  section ${n}: ${r.pass} pass, ${r.fail} fail${r.died ? "  [DIED]" : ""}`);
}
const DIED = TALLY.filter((x) => x.died).map((x) => x.name);
console.log(`\ncurrent-shared-question.test.mjs: ${pass} pass, ${fail} fail  [FOOT REACHED${DIED.length ? `; DIED: ${DIED.join(", ")}` : ""}]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
