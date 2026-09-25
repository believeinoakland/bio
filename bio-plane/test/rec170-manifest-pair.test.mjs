/* NEGATIVE CONTROL: RUN BY `test/rec170-manifest-pair.control.mjs` (a `.control.mjs`, not discovered by the battery, because it EDITS src/ while it runs). Each arm armed ALONE from a per-arm pristine copy, restored and verified by sha256, by content AND by cmp. RUN 2026-09-23 by the REC-170 worker: baseline 13/0 * (a) SERVE THE NULL AGAIN, the row's own control -> 7/6, failing BY NAME at both "PER CASE" arms, both "THE REASON" arms, "THE SCALAR: Q" and "EACH CASE'S ENTRY IS WHAT op=publishedcase SERVES" (the same six the b5ce975a store fails) * (b) THE LIAR, one case's pair served as THE pair beside the per-case list -> 11/2, the two "THE SCALAR" arms alone * (c) FLAG EVERYTHING -> 12/1, the over-strictness arm alone * (d) INVENTED per-case pairs (the stored column) -> 10/3, both "PER CASE" arms and the publishedcase equality * (e) OVER-STRICTNESS, the list in descending order -> 13/0. EVERY ARM AS DECLARED; every restore sha256 MATCH, content IDENTICAL, cmp SAME (store.mjs 2,836,204 B). */
/* REC-170 — `op=publishedmanifest` SERVES A FINDING'S FROZEN PAIR PER CASE WHERE THE CASE DOCUMENTS
 * PINNING IT DISAGREE, and never a bare null or one case's pair as THE pair.
 *
 * DESIGN: BIO_Publication_v0_1.md §3 rule 12 (b)–(d) — the frozen pair is stated ONCE, in the case
 * document, PER CASE ("a fact about this case's reading of that finding at that sha, so a case still has
 * no strength of its own") — with IC-74: a finding in several cases answers every case, never one.
 *
 * WHAT WAS TRUE ON b5ce975a, measured through the op by this suite before the change:
 *  - `published[].strength` is `published_bundles.strength`, written ONCE, at the member's FIRST
 *    ratification (`ON CONFLICT … DO NOTHING`). So there were TWO defects, not one:
 *    (1) THE BARE NULL (the row's own finding, UI-80's worker): a finding whose pinning documents
 *        disagreed at its first ratification was stored null, and the manifest served that null with
 *        nothing saying why — a stranger reads "no frozen pair".
 *    (2) THE LIAR, found by this suite and not named in the row: a finding ratified under case X and
 *        then pinned by case Y, whose document froze a DIFFERENT pair, kept X's pair on the manifest —
 *        ONE case's pair served as THE pair, the very thing IC-74 forbids, silently.
 *  - `op=ratify` already answers `strengthUndetermined: true` (a boolean, the act's own report) and
 *    `op=publishedcase` already serves each case's pair from its own document. Neither reaches the
 *    published INDEX, which reads `op=publishedmanifest` alone.
 *
 * HOW A LIAR WOULD MAKE THIS SUITE GREEN, and what is cut against each:
 *  (a) SERVE THE NULL — the bare null stays. The per-case arms demand each case's pair BY CASE.
 *  (b) PICK ONE CASE — serve the first (or last) case's pair as the scalar. The scalar arm demands NULL
 *      where the documents disagree, for BOTH the first-ratified and the last-pinned readings.
 *  (c) FLAG EVERYTHING — mark every multi-case finding undetermined. An over-strictness finding R, pinned
 *      by the same two cases with the SAME pair, must read exactly as it did: no new key at all.
 *  (d) INVENT THE PER-CASE PAIRS — each entry must EQUAL what op=publishedcase serves for that case, which
 *      is read from that case's signed document, and the two must differ from each other.
 *
 * THE FIXTURE, every act through the control plane with real SSHSIG signatures: a sub-inquiry Q0 rests on
 * a document with a capture grade of B. Findings Q and S rest on Q0 (so their derived pair inherits Q0's
 * letter WITHOUT their own bytes moving); R rests on the document directly. Project A publishes case X over
 * {Q, S, R}; Q and R ratify. Q0 is re-graded to C. Project B publishes case Y over the same three: Y's
 * document freezes C for Q and S and the same pair as X's for R. Then S ratifies for the first time
 * (both documents pinning it, disagreeing), Q and R re-ratify (existing).
 *
 * WHAT IT CANNOT SEE: a LEGACY member (blocks in its own bytes) or a legacy `/1` case document cannot be
 * minted through the ops any more (D-442's suite states the same limit), so how a `/1` reading would join
 * the comparison is not driven — the reader counts `/2` documents only and says so in its comment. Nothing
 * is live (no deploy is this item's).
 */
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
import { parseFrontmatter } from "../checks/bio-checks.mjs";
/* CORRECTED 2026-09-25 (D-615, C-86.7), never exempted: this suite's promote labels named dates the documents they carried
   do not state (a fixed NOW/LATER over bytes the plane had re-stamped, or bytes written with other dates), and a label
   contradicting the document's `created`/`last_updated` is now refused by name. `datesOf` makes each label name the
   document's own dates, and the old value only where the bytes state none — what the label always meant to say. */
const datesOf = (md, created, lastUpdated) => {
  const fm = /^---\n([\s\S]*?)\n---/.exec(String(md ?? "")), get = (k) => fm && (new RegExp(`^${k}:[ \t]*"?([^"\n]*?)"?[ \t]*$`, "m").exec(fm[1]) || [])[1];
  return { created: get("created") || created, last_updated: get("last_updated") || lastUpdated };
};

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- rec170-manifest-pair ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("rec170-manifest-pair.test.mjs: SKIPPED — ssh-keygen not on PATH; a pinned finding exists only once "
    + "a case is ratified, and ratification is a real bio-ratify signature");
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
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-r170", MEMBER_TOKEN: "mem-r170",
              PROBE_TOKEN: "prb-r170", DAEMON_TOKEN: "dmn-r170", VERSION: "0.70.0",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
/* A FIXTURE FAILURE ENDS THE RUN WITH A TALLY, NEVER A BARE THROW. */
const bail = async (what, r) => {
  t(`FIXTURE: ${what}`, [r?.ok === true, r?.reason ?? null], [true, null]);
  if (r && r.ok !== true) console.log(`         detail ${JSON.stringify(r).slice(0, 900)}`);
  console.log(`\nrec170-manifest-pair.test.mjs: ${pass} pass, ${fail} fail`);
  await mf.dispose();
  process.exit(1);
};
const must = async (what, r) => { if (!r || r.ok !== true) await bail(what, r); return r; };

const dir = mkdtempSync(join(tmpdir(), "rec170-"));
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
  const add = await POST("op=memberadd&token=adm-r170",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add?.ok) await bail(`memberadd ${memberId}`, add);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en?.ok) await bail(`enroll ${memberId}`, en);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg?.token) await bail(`login ${memberId}`, lg);
  return lg.token;
};
/* ONE member owns both projects (D-442's and REC-166's precedent): what distinguishes the cases is the
   PROJECT and the moment, not who acts. */
const IRIS = await enrol("iris", "admin", ["contribute", "publish"]);
await must("register iris's signing key",
  await POST("op=signeradd&token=adm-r170", { keyB64, memberId: "iris", comment: "iris laptop" }));

/* ------------------------------------------------------------- DOCUMENTS (D-442's fixture shapes) */
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
  /* CORRECTED 2026-09-23 by REC-179 (C-66.5): this template said `surfaced_by: agent`, but its questions are created by a member SESSION, which D-78 restamps `human` — so every later revision re-sending the template RELABELLED the question `agent`, the defect REC-179 closes (a revision now carries the value forward or is refused SURFACED_BY_REWRITTEN). The template now says what the record holds. */
  "visuals: []", "surfaced_by: human", 'disposition_reason: ""',
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
  meta: { object_type: type, group: "believe-in-oakland",
          current_state: type === "inquiry" ? "open" : "collected", ...datesOf(text, NOW, LATER) } });
const createProject = async (label, text) => {
  const r = await POST(`op=promote&token=${IRIS}`, {
    base: null, snapKey: `${label}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland",
            current_state: "investigating", ...datesOf(text, NOW, LATER) } });
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
const manifestRow = async (id) => {
  const pm = await GET("op=publishedmanifest");
  return (pm?.published || []).find((r) => r.bundle_id === id) || null;
};
/* THE ROW'S SHAPE AS IT WAS ON b5ce975a — the keys a finding with one pair must still carry, and no other. */
const LEGACY_KEYS = ["bundle_id", "edition", "title", "bundle_sha", "ratified_at", "attestor_key", "gate_version",
                     "strength", "required"];
const capOf = (pair) => (pair || []).find((a) => a.axis === "capture")?.grade ?? null;

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
  const row = await manifestRow(Q);
  t("SINGLE CASE: Q's manifest row reads as it did — X's pair, and not one key more",
    [Object.keys(row || {}).sort(), JSON.stringify(row?.strength) === JSON.stringify(xQ)],
    [[...LEGACY_KEYS].sort(), true]);
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

/* =======================================================================
   3. THE MANIFEST: EVERY CASE ANSWERS, EACH NAMED; NONE IS PICKED.
   ======================================================================= */
console.log("\n--- 3. op=publishedmanifest serves the pair per case where the documents disagree ---");
const expectByCase = (x, y) => [
  { case_id: CASE_X, edition: ED_X, strength: x },
  { case_id: CASE_Y, edition: ED_Y, strength: y },
].sort((a, b) => (a.case_id < b.case_id ? -1 : a.case_id > b.case_id ? 1 : a.edition - b.edition));
const sortCases = (xs) => [...(xs || [])].sort((a, b) =>
  (a.case_id < b.case_id ? -1 : a.case_id > b.case_id ? 1 : a.edition - b.edition));
/* Each label is spelled out WHOLE, for the control driver's dead-label check (a label built by a template
   is one the driver cannot find in this source, and it refuses to arm over it). */
const perCase = async (id, x, y, [perLabel, scalarLabel, reasonLabel]) => {
  const row = await manifestRow(id);
  t(perLabel, JSON.stringify(sortCases(row?.strengthByCase)), JSON.stringify(expectByCase(x, y)));
  t(scalarLabel, [row?.strength ?? null, JSON.stringify(row?.strength) === JSON.stringify(x),
                  JSON.stringify(row?.strength) === JSON.stringify(y)], [null, false, false]);
  t(reasonLabel, row?.strengthUndetermined, "CASES_DISAGREE");
};
await perCase(S, xS, yS, [
  "PER CASE: S (first ratified under BOTH documents — the bare null) — each case's frozen pair, named by its case and edition",
  "THE SCALAR: S — strength is NULL, never one case's pair as THE pair",
  "THE REASON: S — strengthUndetermined names why, never a bare null"]);
await perCase(Q, xQ, yQ, [
  "PER CASE: Q (ratified under X, then pinned by Y — X's pair kept on b5ce975a) — each case's frozen pair, named by its case and edition",
  "THE SCALAR: Q — strength is NULL, never one case's pair as THE pair",
  "THE REASON: Q — strengthUndetermined names why, never a bare null"]);
{
  /* (d): each entry is what that case's own public read serves — not a value the manifest composed. */
  const row = await manifestRow(Q);
  const byPc = await Promise.all([CASE_X, CASE_Y].map(async (c) => {
    const pc = await GET(`op=publishedcase&id=${enc(Q)}&caseId=${enc(c)}`);
    return JSON.stringify((pc?.findings || []).find((f) => f.bundle_id === Q)?.strength ?? null);
  }));
  const mine = [CASE_X, CASE_Y].map((c) => JSON.stringify((row?.strengthByCase || []).find((e) => e.case_id === c)?.strength ?? null));
  t("EACH CASE'S ENTRY IS WHAT op=publishedcase SERVES FOR THAT CASE, and the two differ",
    [mine[0] === byPc[0], mine[1] === byPc[1], mine[0] !== mine[1], byPc[0] !== "null"], [true, true, true, true]);
}
{
  const row = await manifestRow(R);
  t("OVER-STRICTNESS: R, pinned by the SAME two cases with the SAME pair, reads exactly as it did — its pair, "
  + "and not one key more",
    [Object.keys(row || {}).sort(), JSON.stringify(row?.strength) === JSON.stringify(xR)],
    [[...LEGACY_KEYS].sort(), true]);
}

console.log(`\nrec170-manifest-pair.test.mjs: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
