/* NEGATIVE CONTROL: RUN BY `test/d442-publish-writes-nothing.control.mjs` (a `.control.mjs`, not discovered by the battery, because it EDITS src/ while it runs). Each arm armed ALONE from a per-arm pristine copy, restored and verified by sha256, by content AND by cmp; the declarations live on that driver. RECORDED BELOW THE HEADER BY THE D-442 WORKER, 2026-09-23 — see the line starting "CONTROL RESULT". */
/* D-442 — PUBLISHING WRITES NOTHING ON A MEMBER FINDING
 * (BIO_Publication_v0_1.md §3 rule 12, RULED 2026-09-22 by BOB #28; MEASURED by the REC-166
 * worker, MEASUREMENTS.md M-100.)
 *
 * WHAT WAS WRONG, measured through the ops: `publishCase()` PROMOTED every member — the case's
 * completeness block and exclusions, the `## What This Excludes` section, the frozen strength
 * pair and grounds, the member's own edition and a Session Log receipt naming the case, all
 * written into the FINDING's bytes. A finding is shared, so project B's PREPARE moved the
 * finding off project A's ratified pin and raised a revision flag on A's case.
 *
 * AS BUILT: op=publish promotes no member. Each member is pinned at the sha it has as prepared;
 * the blocks the promotion wrote are stated ONCE, in the case document (format
 * `bio-case-document/2`): `case_roles[].edition`, `case_strength`, `case_strength_grounds`,
 * the completeness block and exclusions, `## What This Excludes`, and the receipt in the
 * document's own Session Log. The checks follow their block (`checkCaseDocument` runs
 * `checkPublishedExtension` per member over the document's statement of it), and every reader
 * of a moved fact reads the case document (`#caseEditionState` -> op=publishedcase and the
 * container; the ratify committer -> `published_bundles`).
 *
 * HOW A LIAR PASSES, stated before what is checked. (1) Move the blocks into the case document
 * and leave a READER on the finding's bytes: every "unmoved sha" arm passes while op=publishedcase
 * serves a null pair (the finding's bytes carry none) or an exclusions section read off bytes that
 * have none. So section 4 reads EACH moved fact through its PUBLIC op after a fresh publish and
 * asserts it EQUALS what the case document states, AND that the finding's own bytes do not carry
 * it — equality with a value the finding cannot supply. (2) Keep the promotion and exempt the
 * revision flag: `op=caseflags` reads clean, so the pin arm is asserted beside the flag arm.
 *
 * WHAT IS DRIVEN, every act through the control plane as a member, every ratification a real
 * ssh-keygen SSHSIG:
 *  1. A publishes case X over Q: Q's bytes do not move (A's OWN prepare), X is ratified, Q ratified.
 *  2. B — another project citing Q — concludes and publishes a NEW case over Q: Q's bundle_sha is
 *     still X's pin, Q's bytes byte-identical, NO flag on X; B's case document carries every moved
 *     block; B's case ratifies; B's ratification of Q then SUCCEEDS.
 *  3. A second case of the SAME project A over Q does the same.
 *  4. THE LIAR ARMS: each moved fact read through op=publishedcase, the container manifest and
 *     op=publishedmanifest, and compared with the case document.
 *  5. The catalogue: `checkCaseDocument` over the real /2 document — C-2.8 and C-3.1 fire BY NAME
 *     when a moved block is removed from it; a legacy /1 document's format is still accepted.
 *
 * WHAT IT CANNOT SEE: a LEGACY member (blocks in its own bytes) cannot be minted through the ops
 * any more, so rule 12 (e)'s both-shapes reading is asserted at the catalogue (the /1 format) and
 * the committer's legacy branch is not driven end to end; nothing is live (Cloudflare refused).
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
import { parseFrontmatter, checkCaseDocument } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- d442-publish-writes-nothing ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("d442-publish-writes-nothing.test.mjs: SKIPPED — ssh-keygen not on PATH; a PINNED finding exists "
    + "only once a case is ratified, and ratification is a real bio-ratify signature");
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
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-d442", MEMBER_TOKEN: "mem-d442",
              PROBE_TOKEN: "prb-d442", DAEMON_TOKEN: "dmn-d442", VERSION: "0.70.0",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
/* A FIXTURE FAILURE ENDS THE RUN WITH A TALLY, NEVER A BARE THROW. */
const bail = async (what, r) => {
  t(`FIXTURE: ${what}`, [r?.ok === true, r?.reason ?? null], [true, null]);
  console.log(`\nd442-publish-writes-nothing.test.mjs: ${pass} pass, ${fail} fail`);
  await mf.dispose();
  process.exit(1);
};
const must = async (what, r) => { if (!r || r.ok !== true) await bail(what, r); return r; };

const dir = mkdtempSync(join(tmpdir(), "d442-"));
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
  const add = await POST("op=memberadd&token=adm-d442",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add?.ok) await bail(`memberadd ${memberId}`, add);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en?.ok) await bail(`enroll ${memberId}`, en);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg?.token) await bail(`login ${memberId}`, lg);
  return lg.token;
};
/* ONE member owns both projects (REC-166's precedent): what distinguishes A from B is the
   PROJECT, and holding the member fixed keeps the joined-project authority out of it. */
const IRIS = await enrol("iris", "admin", ["contribute", "publish"]);
await must("register iris's signing key",
  await POST("op=signeradd&token=adm-d442", { keyB64, memberId: "iris", comment: "iris laptop" }));

/* ------------------------------------------------------------- DOCUMENTS (REC-166's fixture) */
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
const flagsFor = async (q) => (await GET(`op=caseflags&${q}`)) || {};
const caseDoc = async (caseId, edition) => GET(`op=casedocument&token=${IRIS}&case=${enc(caseId)}&edition=${edition}`);

const LEDGER = "INFO-2026-4442-ledger", MINUTES = "INFO-2026-4442-minutes", AUDIT = "INFO-2026-4442-audit";
for (const d of [LEDGER, MINUTES, AUDIT]) await must(`promote ${d}`, await promote(d, infoMd(d), "information"));
const V1 = { name: "paper trail", claim: "The transfer followed the process the council adopted in 2024.",
  description: "The ledger and the minutes together show the transfer was authorised.",
  grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail" }, { target: MINUTES, ground: "paper trail" }] };
const V2 = { name: "the audit", claim: "The transfer bypassed the council vote the adopted process requires.",
  description: "The audit shows the transfer happened without the required vote.",
  grounds: ["the audit"], legs: [{ target: AUDIT, ground: "the audit" }] };

const Q = "INQ-2026-4442-shared";
await must(`promote ${Q}`, await promote(Q, inquiryMd(Q, { title: "Did the transfer follow the process?",
  versions: [V1, V2], basis: [LEDGER] }), "inquiry"));
const A = await createProject("oversight", projectMd("Oversight", [Q]));
const B = await createProject("neighbours", projectMd("Neighbours", [Q]));

const act = async (verb, target, version, extra = "") =>
  POST(`op=version${verb}&token=${IRIS}&target=${enc(target)}&version=${enc(version)}${extra}`, {});
for (const v of [V1, V2]) await must(`accept ${v.name}`, await act("accept", Q, v.name, `&reason=${enc("the evidence holds")}`));
const makeCurrent = (project, version) => act("current", Q, version, `&project=${enc(project)}`);
const FALSIFIER = "a council minute showing the vote was never taken";
const conclude = (project) =>
  POST(`op=conclude&token=${IRIS}&falsifier=${enc(FALSIFIER)}&target=${enc(Q)}&project=${enc(project)}`, {});
let pubSeq = 0;
const publish = async (project, extra = {}) => {
  const n = ++pubSeq;
  return POST(`op=publish&token=${IRIS}`, {
    project, scope: `Whether the record answers ${Q} (publication ${n}).`,
    targets: [Q], roles: { [Q]: "load_bearing" },
    statement: `This case does not cover the 2025 transfers (publication ${n}).`,
    subjectPosition: "sought_no_answer",
    subjectJustification: `The subject was asked and declined to comment (publication ${n}).`,
    biasAcknowledgement: `The publishing project is funded by a party with an interest (publication ${n}).`,
    excluded: [{ target: null, description: `The 2025 transfers (publication ${n})`, reason: "Out of scope." }],
    ...extra });
};
const ratifyQ = async (bundleSha) =>
  POST(`op=ratify&token=${IRIS}`, { bundleId: Q, expectedSha: bundleSha, sig: signRatify(Q, bundleSha) });
const strip = (rows) => (rows || []).map(({ target, ...r }) => r);

/* =======================================================================
   1. A PUBLISHES CASE X — and its OWN prepare moves nothing on Q.
   ======================================================================= */
console.log("\n--- 1. A concludes, publishes case X over Q, ratifies it ---");
await must("A stands on reading 1", await makeCurrent(A, V1.name));
await must("A concludes", await conclude(A));
const shaBeforeA = await shaOf(Q), textBeforeA = await textOf(Q);
const pubA = await publish(A);
if (pubA?.ok !== true) await bail("A publishes case X", pubA);
t("A's OWN prepare leaves Q's bundle_sha and bytes unmoved, and the pin it answers is that sha",
  [(await shaOf(Q)) === shaBeforeA, (await textOf(Q)) === textBeforeA, pubA.bundleSha === shaBeforeA,
   pubA.findings?.[0]?.promoted],
  [true, true, true, false]);
await ratifyCase(async (q, b) => POST(q, b), pubA, { dir, key: "iris", token: IRIS });
const ratA = await ratifyQ(pubA.bundleSha);
t("(fixture) Q ratifies at X's pin, its edition and pair read from X's case document",
  [ratA?.ok, ratA?.edition, ratA?.frozenFrom], [true, 1, "case_document"]);
const CASE_X = pubA.caseId, PIN = pubA.bundleSha;
t("(fixture) case X is ratified and pins Q at its current bytes — the non-empty guard for every pin arm",
  [typeof CASE_X, /^[0-9a-f]{64}$/.test(PIN), (await shaOf(Q)) === PIN,
   typeof textBeforeA === "string" && textBeforeA.length > 500],
  ["string", true, true, true]);
t("(fixture) before B acts, op=caseflags names nothing for Q or for case X",
  [(await flagsFor(`target=${enc(Q)}`)).count, (await flagsFor(`case=${enc(CASE_X)}`)).count], [0, 0]);

/* =======================================================================
   2. B — ANOTHER PROJECT — PUBLISHES A NEW CASE OVER THE SAME FINDING.
   ======================================================================= */
console.log("\n--- 2. B concludes and publishes a new case over Q ---");
await must("B stands on reading 2", await makeCurrent(B, V2.name));
await must("B concludes", await conclude(B));
const pubB = await publish(B, { newCase: true });
t("(fixture) B's publish succeeds as a NEW case", [pubB?.ok, pubB?.minted, pubB?.caseId !== CASE_X],
  [true, true, true]);
t("THE PIN: B's prepare leaves Q's bundle_sha at case X's pin",
  (await shaOf(Q)) === PIN, true);
t("and Q's bundle.md is byte-identical — nothing was written on the shared finding",
  (await textOf(Q)) === textBeforeA, true);
t("NO REVISION FLAG on A's case: op=caseflags names nothing for Q or for case X",
  [(await flagsFor(`target=${enc(Q)}`)).count, (await flagsFor(`case=${enc(CASE_X)}`)).count], [0, 0]);
t("B's case pins Q at the SAME sha, and at Q's own published edition 1 (the same bytes, one number)",
  [pubB.bundleSha === PIN, pubB.findings?.[0]?.edition, pubB.findings?.[0]?.reevaluation ?? null],
  [true, 1, null]);

const docB = await caseDoc(pubB.caseId, pubB.edition);
const parsedB = parseFrontmatter(String(docB?.text || ""));
const fmB = parsedB.data || {};
const bodyB = String(parsedB.body || "");
t("(fixture) B's case document is readable and non-empty", [docB?.ok, (docB?.text || "").length > 1000], [true, true]);
{
  const row = (fmB.case_roles || []).find((r) => r && r.target === Q) || {};
  const sRows = (fmB.case_strength || []).filter((r) => r && r.target === Q);
  t("THE CASE DOCUMENT CARRIES EVERY MOVED BLOCK: the /2 format; per member its role, its pinned sha and "
  + "its own edition",
    [fmB.format, row.role, row.version_sha === PIN, row.edition], ["bio-case-document/2", "load_bearing", true, 1]);
  t("… the frozen pair, capture and connection once each, equal to what op=publish answered",
    [sRows.map((r) => r.axis).sort(),
     JSON.stringify(sRows.map((r) => ({ axis: r.axis, state: r.state, grade: r.grade, weakest: r.weakest })))
       === JSON.stringify(pubB.findings[0].strength)],
    [["capture", "connection"], true]);
  t("… the grounds FIELD, the completeness block and the exclusion list",
    [Array.isArray(fmB.case_strength_grounds), typeof fmB.completeness?.statement,
     Array.isArray(fmB.completeness_excluded) && fmB.completeness_excluded.length],
    [true, "string", 1]);
  t("… `## What This Excludes` and the frozen pair in PROSE, and the receipt in the document's own "
  + "Session Log naming the pin",
    [/^## What This Excludes$/m.test(bodyB), /^## What Each Finding Reached, As Read For This Case$/m.test(bodyB),
     bodyB.includes(`Pinned: ${Q} at ${PIN}, its edition 1; nothing was written on it.`),
     bodyB.includes(`Published by: ${B}`)],
    [true, true, true, true]);
}
const caseB = await ratifyCase(async (q, b) => POST(q, b), pubB, { dir, key: "iris", token: IRIS })
  .catch((e) => ({ ok: false, reason: String(e.message).slice(0, 300) }));
t("B's case document RATIFIES", caseB?.ok, true);
const ratB = await ratifyQ(PIN);
t("B's RATIFICATION OF Q THEN SUCCEEDS — the same bytes, already published: a retry, not a revision",
  [ratB?.ok, ratB?.existed, ratB?.edition, ratB?.frozenFrom], [true, true, 1, "case_document"]);
t("and after B's whole ceremony Q is still at X's pin, and neither case carries a flag",
  [(await shaOf(Q)) === PIN, (await flagsFor(`case=${enc(CASE_X)}`)).count,
   (await flagsFor(`case=${enc(pubB.caseId)}`)).count], [true, 0, 0]);

/* =======================================================================
   3. A SECOND CASE OF THE SAME PROJECT OVER THE SAME FINDING.
   ======================================================================= */
console.log("\n--- 3. A publishes a second case over Q ---");
const again = await publish(A, { caseId: CASE_X });
t("(fixture) publishing into case X again, with nothing moved, is still refused — the fence REC-157 built "
+ "(the case is NAMED: Q now serves two cases, so an unnamed publish is CASE_IDENTITY_AMBIGUOUS, D-309)",
  [again?.ok, again?.reason], [false, "ALREADY_A_CASE_MEMBER"]);
const pubA2 = await publish(A, { newCase: true });
t("(fixture) A's SECOND case over Q is prepared", [pubA2?.ok, pubA2?.minted], [true, true]);
t("THE PIN, SAME PROJECT: A's second prepare leaves Q at case X's pin, byte-identical, and flags nothing",
  [(await shaOf(Q)) === PIN, (await textOf(Q)) === textBeforeA, pubA2.bundleSha === PIN,
   (await flagsFor(`case=${enc(CASE_X)}`)).count, (await flagsFor(`case=${enc(pubB.caseId)}`)).count],
  [true, true, true, 0, 0]);
const caseA2 = await ratifyCase(async (q, b) => POST(q, b), pubA2, { dir, key: "iris", token: IRIS })
  .catch((e) => ({ ok: false, reason: String(e.message).slice(0, 300) }));
const ratA2 = await ratifyQ(PIN);
t("and it ratifies, case document and finding", [caseA2?.ok, ratA2?.ok, ratA2?.existed], [true, true, true]);

/* =======================================================================
   4. THE LIAR ARMS: EVERY MOVED FACT, READ THROUGH ITS PUBLIC OP, IS THE CASE DOCUMENT'S.
   ======================================================================= */
console.log("\n--- 4. each moved fact read through its public op comes from the case document ---");
const qBytes = await textOf(Q);
t("Q's own bytes carry NONE of the blocks (so a reader left on them would read nothing): no frozen "
+ "pair, no completeness block, no exclusions, no section, no publish receipt",
  [/^published_strength:/m.test(qBytes), /^completeness:/m.test(qBytes), /^completeness_excluded:/m.test(qBytes),
   /^## What This Excludes$/m.test(qBytes), /\| Published \|/.test(qBytes)],
  [false, false, false, false, false]);
{
  const pc = await GET(`op=publishedcase&id=${enc(Q)}&caseId=${enc(pubB.caseId)}`);
  const f = (pc?.findings || [])[0] || {};
  t("op=publishedcase serves B's member with the pair, grounds and edition B's case document states",
    [f.frozen_from, JSON.stringify(f.strength) === JSON.stringify(strip((fmB.case_strength || []).filter((r) => r.target === Q))),
     JSON.stringify(f.grounds) === JSON.stringify(strip((fmB.case_strength_grounds || []).filter((r) => r.target === Q))),
     f.edition, Array.isArray(f.strength) && f.strength.length >= 2],
    ["case_document", true, true, 1, true]);
  t("… and its `What This Excludes` from the CASE DOCUMENT's section, said so",
    [f.body?.excludes_from, typeof f.body?.excludes === "string" && f.body.excludes.includes(fmB.completeness?.statement)],
    ["case_document", true]);
  const man = pc?.manifest_sha ? await GET(`op=publishedbytes&sha256=${pc.manifest_sha}`) : null;
  const mf0 = (man?.findings || [])[0] || {};
  t("the CONTAINER built at B's ratification carries the case document's pair and edition for the member, "
  + "and the case document whole",
    [typeof pc?.manifest_sha, JSON.stringify(mf0.strength) === JSON.stringify(f.strength), mf0.edition,
     typeof man?.case_document?.text === "string" && man.case_document.text.includes("case_strength:")],
    ["string", true, 1, true]);
}
{
  const pm = await GET("op=publishedmanifest");
  const row = (pm?.published || []).find((r) => r.bundle_id === Q && r.edition === 1) || {};
  const fmX = parseFrontmatter(String((await caseDoc(CASE_X, 1))?.text || "")).data || {};
  t("op=publishedmanifest's finding row carries the frozen pair case X's document stated (the first ratification's)",
    JSON.stringify((row.strength || []).map((a) => a.axis)) !== "[]"
      && JSON.stringify(row.strength) === JSON.stringify(strip((fmX.case_strength || []).filter((r) => r.target === Q))),
    true);
}

/* =======================================================================
   5. THE CATALOGUE FOLLOWS THE BLOCK.
   ======================================================================= */
console.log("\n--- 5. C-2.8 and C-3.1 fire on the case document when a moved block is removed ---");
const idsOf = (fs) => fs.filter((x) => x.severity === "error").map((x) => x.check);
const ctx = { caseId: pubB.caseId, edition: pubB.edition, body: bodyB, memberBasis: { [Q]: [] } };
t("the real /2 document passes the case gate (the non-empty guard for the arms below)",
  idsOf(checkCaseDocument(fmB, ctx)), []);
{
  const noPair = { ...fmB, case_strength: (fmB.case_strength || []).filter((r) => r.axis !== "capture") };
  const out = checkCaseDocument(noPair, ctx).filter((x) => x.severity === "error");
  t("a member's capture row removed -> C-2.8, naming the member",
    [idsOf(out).includes("C-2.8"), out.some((x) => x.message.startsWith(`case document, member ${Q}: `))], [true, true]);
}
{
  const noEd = { ...fmB, case_roles: (fmB.case_roles || []).map((r) => ({ ...r, edition: null })) };
  t("a member's edition removed -> C-2.8", idsOf(checkCaseDocument(noEd, ctx)).includes("C-2.8"), true);
}
{
  const out = checkCaseDocument(fmB, { ...ctx, body: bodyB.replace(/^## What This Excludes$/m, "## Elsewhere") });
  t("the section removed from the body -> C-3.1", idsOf(out), ["C-3.1"]);
}
{
  const legs = [{ target: LEDGER, role: "supports", grade: "B", grade_axis: "testimony" }];
  t("a testimony-graded leg at the pinned bytes with no testimony row -> C-2.8 (the arm reads memberBasis)",
    idsOf(checkCaseDocument(fmB, { ...ctx, memberBasis: { [Q]: legs } })).includes("C-2.8"), true);
}
t("a LEGACY /1 document's format is still accepted (rule 12 (e)), and the member arms are not asked of it",
  idsOf(checkCaseDocument({ ...fmB, format: "bio-case-document/1", case_strength: undefined,
                            case_strength_grounds: undefined }, ctx)), []);
t("an unknown format is refused C-41.1",
  idsOf(checkCaseDocument({ ...fmB, format: "bio-case-document/9" }, ctx)).includes("C-41.1"), true);

console.log(`\nd442-publish-writes-nothing.test.mjs: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
