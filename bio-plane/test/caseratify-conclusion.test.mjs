/* NEGATIVE CONTROL: RUN BY `test/caseratify-conclusion.control.mjs` (a `.control.mjs`, not discovered by the battery, because it EDITS src/ while it runs). Each arm armed ALONE, restored by cp from a per-arm pristine copy and verified by sha256, by content AND by cmp; the declarations are on that driver, checked against each run as a TOTAL. RUN 2026-09-22 by the REC-167 worker, every restore MATCH / IDENTICAL / SAME (store.mjs 2,794,793 bytes): baseline 21/0 * (a) THE COMPARISON DROPPED, concluded-ness alone, the row's named control -> 17/4, failing BY NAME at "THE CONCLUDE-AGAIN ARM" and its names-what-moved arm, with the declared cascade (the old preparation SIGNED, so "and still nothing was signed" and "the OLD preparation ... is STILL refused" fall), while all of section 1 stayed GREEN — the withdrawn arm alone cannot tell this liar apart * (b) THE WHOLE REFUSAL DROPPED, the plane as M-92 measured it -> 11/10, every refusal arm of sections 1-3, op=ratify included * (c) CONCLUDED-NESS DROPPED, only the comparison -> 21/0, DECLARED to show no effect (a not-concluded answer renders a row no recorded conclusion can equal), so the refusal does not depend on the explicit gate, which is kept as item 4's question by name and the source of `why` * (d) OVER-STRICTNESS, the signer's sight dropped -> 14/7, the ratify arms of sections 3 and 4 and the two names-what-moved arms. EVERY ARM AS DECLARED on the first run.
 * ========================================================================= */
/* REC-167 — A CASE DOCUMENT IS SIGNED ONLY WHILE ITS PROJECT STILL STANDS ON THE
 * CONCLUSION IT RECORDS (INVESTIGATIVE-SESSION.md §7.1 item 4: `NOT_CONCLUDED` at
 * `op=caseratify` reads the publishing project's relationship; item 9's comparison,
 * asked of the one document being signed; design gap (e)).
 *
 * WHAT WAS WRONG, measured by REC-157 (M-92) and re-driven here as section 1: a
 * project concludes, `op=publish` PREPARES an edition whose case document records
 * that conclusion (REC-135's `case_conclusions:`), the project WITHDRAWS, and then
 * `op=caseratify` and `op=ratify` BOTH SUCCEEDED — the signed edition asserted, as
 * the project's, a conclusion it had given up before anybody signed.
 *
 * HOW A LIAR PASSES THIS SUITE, stated before what it checks: ASK CONCLUDED-NESS
 * ALONE. That refuses the withdrawn arm and nothing else. So section 2 concludes
 * AGAIN, on ANOTHER claim, and asks the OLD preparation to be signed: the project
 * is concluded, and the document still records the claim it withdrew. Only the
 * COMPARISON (`#editionsRecordingConclusion`, the one op=publish asks) refuses it.
 * The second liar refuses everything: section 3 publishes again and the NEW
 * preparation signs, and section 4 signs an UNCHANGED conclusion exactly as today —
 * including over a pointer moved after preparation, which is not a conclusion.
 *
 * WHICH PATH THE FIX REACHES, and `op=ratify` is ANSWERED rather than built: the
 * refusal is in `ratifyCaseDocument` (`op=caseratify`). A finding's own bytes carry
 * no case conclusion (the case document is the only writer of `case_conclusions:`),
 * and since D-431 `op=ratify` signs a finding only at a sha a RATIFIED case pins —
 * so once the case document is refused, the finding's ratification is refused
 * `RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE` and nothing is signed at either altitude.
 * Section 1 asserts that through the op rather than asserting it here.
 *
 * WHAT IT CANNOT SEE: the sharing edge is hand-authored into `references[]`
 * (REC-72); the no-project corner (a document recording `no_project`) is driven by
 * `case-edition-conclusion.test.mjs` §8, which RATIFIES such an edition through this
 * same committer, and is not re-driven here; a case document authored before REC-135
 * records no conclusion and is compared as `#editionsRecordingConclusion`'s header
 * says (a no-project want matches it by the pin; a project want does not) — no
 * fixture here authors one.
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
import { parseFrontmatter, CASE_CONCLUSION_CHECKS } from "../checks/bio-checks.mjs";
import { signCase } from "./caseceremony.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- caseratify-conclusion ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("caseratify-conclusion.test.mjs: SKIPPED — ssh-keygen not on PATH; a SECOND EDITION exists only "
    + "once the first is ratified, and ratification is a real bio-ratify signature");
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
  /* INSTANCE_NAME IS BOUND because every install binds it (D-436, IC-172): a store
     records its producing group from it at its FIRST BOOT, and a creation on a
     store recording none is refused GROUP_UNDETERMINED (C-64.1). The fixture
     pattern is D-436's own, in `publish.test.mjs` and `caseproduction.test.mjs`. */
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: "adm-r167", MEMBER_TOKEN: "mem-r167",
              PROBE_TOKEN: "prb-r167", DAEMON_TOKEN: "dmn-r167", VERSION: "0.70.0",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
/* A FIXTURE FAILURE ENDS THE RUN WITH A TALLY, NEVER A BARE THROW — a control arm
   that breaks the subject can make a fixture step refuse, and a suite that died
   before its own foot reads as a clean count to anything that only checks an
   exit status (`caselifecycle.test.mjs`'s receipt). */
const bail = async (what, r) => {
  t(`FIXTURE: ${what}`, [r?.ok === true, r?.reason ?? null], [true, null]);
  console.log(`\ncaseratify-conclusion.test.mjs: ${pass} pass, ${fail} fail`);
  await mf.dispose();
  process.exit(1);
};
const must = async (what, r) => { if (!r || r.ok !== true) await bail(what, r); return r; };

/* ---- the member, the signing key, the ceremony ---- */
const dir = mkdtempSync(join(tmpdir(), "rec167-"));
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
  const add = await POST("op=memberadd&token=adm-r167",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add?.ok) await bail(`memberadd ${memberId}`, add);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en?.ok) await bail(`enroll ${memberId}`, en);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg?.token) await bail(`login ${memberId}`, lg);
  return lg.token;
};
/* ONE member creates, owns and joins every project and signs every edition —
   the member and the finding are held fixed so that what moves between two
   publications is only what the arm moves. */
const IRIS = await enrol("iris", "admin", ["contribute", "publish"]);
await must("register iris's signing key",
  await POST("op=signeradd&token=adm-r167", { keyB64, memberId: "iris", comment: "iris laptop" }));

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
/* NO `required_strength`: an ABSENT bar gates nothing (DEC-72), and a declared
   bar would put a second refusal in front of the one under test. */
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
/* A project's id is MINTED by the plane (REC-141) and its creator becomes its
   OWNER and a JOINED participant in the same write. */
const createProject = async (label, text) => {
  const r = await POST(`op=promote&token=${IRIS}`, {
    base: null, snapKey: `${label}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: `Project ${label}`,
            current_state: "investigating", created: NOW, last_updated: LATER } });
  if (!r?.ok || typeof r.bundleId !== "string") await bail(`create project ${label}`, r);
  return r.bundleId;
};
const bundleRow = async (id) => (await GET(`op=list&token=${IRIS}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id) ?? null;

const LEDGER = "INFO-2026-4167-ledger", MINUTES = "INFO-2026-4167-minutes", AUDIT = "INFO-2026-4167-audit";
for (const d of [LEDGER, MINUTES, AUDIT]) await must(`promote ${d}`, await promote(d, infoMd(d), "information"));

const CLAIM_A = "The transfer followed the process the council adopted in 2024.";
const CLAIM_B = "The transfer bypassed the council vote the adopted process requires.";
const VA = { name: "paper trail", claim: CLAIM_A,
  description: "The ledger and the minutes together show the transfer was authorised.",
  grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail" }, { target: MINUTES, ground: "paper trail" }] };
const VB = { name: "the audit", claim: CLAIM_B,
  description: "The audit shows the transfer happened without the required vote.",
  grounds: ["the audit"], legs: [{ target: AUDIT, ground: "the audit" }] };

const Q = "INQ-2026-4167-transfer";          /* sections 1-3: M-92's path, then concluded again */
const QU = "INQ-2026-4167-unchanged";        /* section 4: nothing moved */
for (const [id, title] of [[Q, "Did the sewer fund transfer follow the adopted process?"],
                           [QU, "Was the vote recorded?"]])
  await must(`promote ${id}`, await promote(id, inquiryMd(id, { title, versions: [VA, VB], basis: [LEDGER] }), "inquiry"));

const A = await createProject("oversight", projectMd("Oversight", [Q]));
const U = await createProject("unchanged", projectMd("Unchanged", [QU]));

const accept = async (target, version) =>
  POST(`op=versionaccept&token=${IRIS}&target=${enc(target)}&version=${enc(version)}`
     + `&reason=${enc("the evidence holds")}`, {});
for (const id of [Q, QU]) for (const v of [VA, VB]) await must(`accept ${v.name} on ${id}`, await accept(id, v.name));
const makeCurrent = async (project, target, version) =>
  POST(`op=versioncurrent&token=${IRIS}&target=${enc(target)}&version=${enc(version)}&project=${enc(project)}`, {});
/* A FALSIFIER IS STATED ON EVERY CONCLUSION, never overridden (REC-135's reason). */
const FALSIFIER = "a council minute showing the vote was never taken";
const concludeFor = async (project, target, falsifier = FALSIFIER) =>
  POST(`op=conclude&token=${IRIS}&falsifier=${enc(falsifier)}&target=${enc(target)}&project=${enc(project)}`, {});
const withdraw = async (project, target, reason) =>
  POST(`op=withdrawconclusion&token=${IRIS}&target=${enc(target)}&project=${enc(project)}&reason=${enc(reason)}`, {});

/* EVERY AUTHORED FIELD IS FRESH PER PUBLICATION. C-21.1 refuses a completeness
   statement, justification, exclusion list or bias acknowledgement carried
   forward byte-identical from the case's previous RATIFIED edition, and that
   refusal is not this item's — so each call states its own, numbered. */
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
/* THE CEREMONY is driven step by step below (case document, then the finding), so
   each step's answer is asserted rather than thrown by a fixture. */
const caseDoc = async (caseId, edition) => {
  const d = await GET(`op=casedocument&token=${IRIS}&case=${enc(caseId ?? "none")}&edition=${edition}`);
  const text = String(d?.text ?? "");
  return { text, row: ((parseFrontmatter(text).data || {}).case_conclusions || [])[0] || {} };
};
const caseRatify = async (pub) => {
  const d = pub?.caseDocument || {};
  return POST(`op=caseratify&token=${IRIS}`, { caseId: d.case_id, edition: d.edition, expectedSha: d.doc_sha,
    sig: signCase(dir, "iris", d.case_id, d.edition, d.doc_sha) });
};
const ratifyFinding = async (target, bundleSha) =>
  POST(`op=ratify&token=${IRIS}`, { bundleId: target, expectedSha: bundleSha, sig: signRatify(target, bundleSha) });
const docState = async (caseId, edition) =>
  GET(`op=casedocument&token=${IRIS}&case=${enc(caseId ?? "none")}&edition=${edition}`);
const CATALOGUE_ROW = CASE_CONCLUSION_CHECKS.CASE_CONCLUSION_MOVED;

/* =======================================================================
   1. M-92's PATH — prepared, withdrawn, signed. Refused, nothing signed.
   ======================================================================= */
console.log("\n--- 1. M-92's path: A concludes, publishes, WITHDRAWS; op=caseratify is refused and nothing is signed ---");

await must("A stands on reading A", await makeCurrent(A, Q, VA.name));
await must("A concludes on it", await concludeFor(A, Q));
/* THE POINTER MOVES TO B BEFORE PUBLICATION so section 2 can conclude on B with
   nothing else moving (since REC-166 a make-current writes only the project). */
await must("A moves its pointer to reading B, still standing on its conclusion A", await makeCurrent(A, Q, VB.name));
const prep1 = await publish(A, Q);
t("(fixture) A prepares edition 1 of a new case", [prep1?.ok, prep1?.edition], [true, 1]);
if (prep1?.ok !== true) await bail("A prepares edition 1", prep1);
const CASE = prep1.caseId, SHA1 = prep1.caseDocument?.doc_sha, FSHA1 = prep1.bundleSha;
const doc1 = await caseDoc(CASE, 1);
t("(fixture) the preparation's document records A's conclusion: reading A, claim A",
  [doc1.row.relationship, doc1.row.project, doc1.row.version, doc1.row.claim], ["project", A, VA.name, CLAIM_A]);
await must("A withdraws its conclusion", await withdraw(A, Q, "the audit contradicts the minutes"));
const r1 = await caseRatify(prep1);
t("M-92's PATH IS REFUSED by the new code: op=caseratify of a preparation whose project WITHDREW the conclusion "
+ "it records", [r1?.ok, r1?.reason, r1?.code], [false, "CASE_CONCLUSION_MOVED", "CASE_CONCLUSION_MOVED"]);
t("with its catalogue row's check and canned translation, byte for byte (DEC-49)",
  [r1?.check, CATALOGUE_ROW.check, r1?.translation], ["C-65.1", "C-65.1", CATALOGUE_ROW.translation]);
t("and it names WHAT moved: the member, what the document recorded (claim A) and that A now stands on no "
+ "conclusion because it WITHDREW",
  (r1?.moved || []).map((m) => [m.target, m.recorded?.claim, m.now?.state, m.now?.why]),
  [[Q, CLAIM_A, "not_concluded", "project_withdrew_its_conclusion"]]);
t("and the route: publish again", /op=publish/.test(String(r1?.detail ?? "")), true);
const st1 = await docState(CASE, 1);
t("NOTHING WAS SIGNED: the case document is still unratified, carrying no signature, at the same sha",
  [st1?.ok, st1?.ratified, st1?.sig_armored, st1?.doc_sha === SHA1], [true, false, null, true]);
const f1 = await ratifyFinding(Q, FSHA1);
t("and op=ratify — the finding-side path M-92 named too — signs nothing either: no RATIFIED case pins these bytes "
+ "(D-431), so the refusal at the case reaches it", [f1?.ok, f1?.reason], [false, "RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE"]);

/* =======================================================================
   2. CONCLUDED AGAIN ON ANOTHER CLAIM — the arm concluded-ness alone passes.
   ======================================================================= */
console.log("\n--- 2. A concludes again on reading B: concluded, and the OLD preparation is still refused ---");

const cB = await must("A concludes on reading B, which it already stands on", await concludeFor(A, Q));
t("(fixture) A is CONCLUDED again, on claim B", [cB?.version, cB?.claim?.text], [VB.name, CLAIM_B]);
const rowQ = await bundleRow(Q);
t("(discriminator) the finding's bytes are EXACTLY the preparation's pin — only the relationship moved",
  [typeof FSHA1, rowQ?.bundle_sha === FSHA1], ["string", true]);
const r2 = await caseRatify(prep1);
t("THE CONCLUDE-AGAIN ARM: the OLD preparation, recording claim A, is REFUSED although A is concluded — "
+ "concluded-ness alone would sign claim A for a project standing on claim B",
  [r2?.ok, r2?.reason], [false, "CASE_CONCLUSION_MOVED"]);
t("and it names what moved: recorded claim A, A now concluded on reading B through its own relationship",
  (r2?.moved || []).map((m) => [m.target, m.recorded?.claim, m.now?.state, m.now?.relationship, m.now?.version, m.now?.claim]),
  [[Q, CLAIM_A, "concluded", "project", VB.name, CLAIM_B]]);
const st2 = await docState(CASE, 1);
t("and still nothing was signed", [st2?.ratified, st2?.sig_armored], [false, null]);

/* =======================================================================
   3. PUBLISH AGAIN — the route the refusal names — and the new edition signs.
   ======================================================================= */
console.log("\n--- 3. publishing again prepares a document recording claim B, and THAT one ratifies ---");

const prep2 = await publish(A, Q);
t("A publishes again: a fresh preparation (the unsigned one was never a case, so nothing pins the finding and "
+ "no edition of it is refused)", [prep2?.ok, typeof prep2?.caseId], [true, "string"]);
if (prep2?.ok !== true) await bail("A publishes again", prep2);
const doc2 = await caseDoc(prep2.caseId, prep2.edition);
t("the new preparation records A's conclusion now: reading B, claim B, and not the withdrawn claim",
  [doc2.row.relationship, doc2.row.project, doc2.row.version, doc2.row.claim, doc2.text.includes(CLAIM_A)],
  ["project", A, VB.name, CLAIM_B, false]);
const r3 = await caseRatify(prep2);
t("AND IT RATIFIES: the case is committed", [r3?.ok, r3?.caseId === prep2.caseId, r3?.reason ?? null], [true, true, null]);
const f3 = await ratifyFinding(Q, prep2.bundleSha);
t("and the finding ratifies at the version the case pinned", [f3?.ok, f3?.reason ?? null], [true, null]);
const st3 = await docState(prep2.caseId, prep2.edition);
t("the signed edition is the one recording claim B",
  [st3?.ratified, (parseFrontmatter(String(st3?.text ?? "")).data?.case_conclusions || [])[0]?.claim], [true, CLAIM_B]);

const rOld = await caseRatify(prep1);
t("and the OLD preparation, still unsigned beside it and still recording claim A, is STILL refused by name",
  [rOld?.ok, rOld?.reason, (await docState(CASE, 1))?.ratified], [false, "CASE_CONCLUSION_MOVED", false]);

/* =======================================================================
   4. AN UNCHANGED CONCLUSION RATIFIES AS TODAY — the over-strictness arm.
   ======================================================================= */
console.log("\n--- 4. nothing moved: an unchanged conclusion ratifies as today, even over a moved pointer ---");

await must("U stands on reading A", await makeCurrent(U, QU, VA.name));
await must("U concludes on it", await concludeFor(U, QU));
const prepU = await publish(U, QU);
if (prepU?.ok !== true) await bail("U prepares", prepU);
/* A MAKE-CURRENT IS NOT A CONCLUSION: the project looks at B and still stands on
   its conclusion A, so the document is still true of it. A fence that compared the
   POINTER instead of the conclusion entry would refuse here. */
await must("U moves its pointer to reading B after preparation — looking, not concluding", await makeCurrent(U, QU, VB.name));
const rU = await caseRatify(prepU);
t("OVER-STRICTNESS: an unchanged conclusion RATIFIES, a pointer moved after preparation notwithstanding",
  [rU?.ok, rU?.reason ?? null], [true, null]);
const fU = await ratifyFinding(QU, prepU.bundleSha);
t("and its finding ratifies", [fU?.ok, fU?.reason ?? null], [true, null]);

console.log(`\ncaseratify-conclusion.test.mjs: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
