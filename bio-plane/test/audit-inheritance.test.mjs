/* NEGATIVE CONTROL: RUN 2026-09-23 with `node test/nc-d178.mjs` from `bio-plane/`, each arm ALONE editing src/store.mjs and restored from a uniquely-named per-arm pristine copy verified by sha256 AND content (2,903,834 B sha256 609fde4367b5…, every restore byte-identical). Declared before arming, and the result: (a) `baseline` — MUST be green: 8/0. (b) `drop` — THE ROW'S CONTROL, the injection removed: the inherited-leg arm MUST FAIL BY NAME AT C-2.8 (the inheriting inquiry is an offender at C-2.8), with the blindness-sentence, C-21.2, detail and tally arms; the fixture and ungraded-leg arms MUST NOT — 3/5, as declared. (c) `liar` — an EMPTY registry object: the inherited arm (C-2.8, "is not a published case"), C-21.2, detail and tally MUST FAIL, the blindness-sentence arm stays green (a different sentence) — 4/4, as declared. The `drop` arm's corpus line is M-117's pre-change fixture count. */
/* D-178 — THE AUDIT SWEEP READS THE PUBLISHED RECORD (BIO_Publication_v0_1.md §3 rule 5, C-21.2;
 * BIO_Distribution_v0_1.md §6 rung 6, `op=audit` clean).
 *
 * THE DEFECT. `Store#auditPass` ran the catalogue with an `earnedRegistry` and NO `publishedRegistry`, while
 * every other caller that runs `checkInquiryBasis` in the store — the write, the ratification gate — passes
 * `publishedRegistryFor(bundle, targets)`. Blind, the sweep got inheritance wrong in BOTH directions:
 *
 *   1. a CORRECTLY inherited leg (grade_source inherited, a named edition, no stronger than that edition's
 *      frozen axis) read as an OFFENDER at C-2.8 — "cannot be checked against the published record here" —
 *      so a healthy corpus could never be audit clean, which is the rung DIST's ladder needs before a
 *      version serves;
 *   2. an OWN grade on a published case — C-21.2's whole subject — was never looked at, because
 *      `checkInheritedLeg` returns early on a target it cannot find in a registry it was not given.
 *
 * WHY THE FIXTURE IS SHAPED THIS WAY. The write refuses an own grade on a case that is ALREADY published, so
 * the only way such a leg is in the record is the realistic one: it was written while the case beneath it
 * was still a working inquiry (legal then), and the case was published after. The audit is the only place
 * that can see it afterwards, which is why it must be able to.
 *
 * HOW A LIAR PASSES (the row's own sentence): an empty registry object. It enables nothing, so the own-grade
 * arm MUST fire C-21.2 by name and the inherited arm MUST read clean; a `{}` fails both.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { ratifyCase } from "./caseceremony.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d178", MEMBER_TOKEN: "mem-d178", PROBE_TOKEN: "prb-d178", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

try {

/* ------------------------------------------------------------------ roster and keys */
const dir = mkdtempSync(join(tmpdir(), "d178-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "pilar", "-f", join(dir, "pilar"), "-q"]);
const keyB64 = readFileSync(join(dir, "pilar.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "pilar"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const add = rP(await POST("op=memberadd&token=adm-d178",
  { memberId: "pilar", cover: "cover for pilar", role: "admin", capabilities: ["contribute", "publish"] }));
const en = rP(await POST("op=enroll", { invite: add.invite, handle: "pilar", password: "pilar-passphrase-1" }));
if (!en.ok) throw new Error(`enroll: ${JSON.stringify(en)}`);
const PILAR = rP(await POST("op=login", { role: "member:pilar", password: "pilar-passphrase-1" })).token;
if (!PILAR) throw new Error("login pilar");
rP(await POST("op=signeradd&token=adm-d178", { keyB64, memberId: "pilar", comment: "pilar laptop" }));

/* ------------------------------------------------------------------ documents */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const PROJECT = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-d178", owner: "pilar",
  name: "PROJ-2026-1780-audit", created: NOW, updated: LATER });

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.edition !== undefined ? [`    target_edition: ${l.edition}`] : [])])]
  : [];
const inquiryMd = (id, { question = `What does ${id} rest on?`, legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines([...new Set(legs.map((l) => l.target))]), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "", "## Question", "", question, "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
let snapSeq = 0;
const promote = async (id, md, type) => {
  const r = rP(await POST(`op=promote&token=${PILAR}`, {
    bundleId: id, base: null, snapKey: `20260923T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
            current_state: type === "information" ? "collected" : "open", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: type === "information"
      ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [] }));
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};

const INFO_CAP = "INFO-2026-1780-capture-b";
const INFO_CONN = "INFO-2026-1780-connection-c";
const INQ_CASE = "INQ-2026-1780-case";          // becomes PUBLISHED: frozen capture B / connection C
const INQ_OWN = "INQ-2026-1780-own-grade";      // written BEFORE publication with its OWN grade on the case
const INQ_INH = "INQ-2026-1780-inherits";       // written AFTER, inheriting edition 1 correctly
const INQ_PLAIN = "INQ-2026-1780-plain";        // an ungraded leg on the case: inert, and must stay clean

await promote(INFO_CAP, infoMd(INFO_CAP), "information");
await promote(INFO_CONN, infoMd(INFO_CONN), "information");
await promote(INQ_CASE, withAdoptableReading(inquiryMd(INQ_CASE, {
  question: "Did the City transfer sewer funds without authority?",
  legs: [{ target: INFO_CAP, grade: "B", axis: "capture", source: "capture" },
         { target: INFO_CONN, grade: "C", axis: "connection", source: "hunch", author: "pilar", date: "2026-08-04" }] })),
  "inquiry");
/* Legal WHEN WRITTEN: the case beneath it is a working inquiry, and a hunch is an authored connection grade. */
await promote(INQ_OWN, inquiryMd(INQ_OWN, { question: "Should this go to the grand jury?",
  legs: [{ target: INQ_CASE, grade: "C", axis: "connection", source: "hunch", author: "pilar", date: "2026-08-04" }] }),
  "inquiry");
await promote(INQ_PLAIN, inquiryMd(INQ_PLAIN, { question: "Who else should read this?",
  legs: [{ target: INQ_CASE }] }), "inquiry");

rP(await GET(`op=conclude&token=${PILAR}&target=${encodeURIComponent(INQ_CASE)}`
  + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
  + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
  + adoptedVersionParam()));
const body = { target: INQ_CASE,
  scope: "Whether the transfer was authorised, on the documents in hand.",
  statement: "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.",
  excluded: [{ description: "any 2019 council minutes", reason: "outside the period at issue" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
  biasAcknowledgement: "The group holds a declared position that fund transfers should be adopted in public session." };
const pub = rP(await POST(`op=publish&token=${PILAR}`, { project: PROJECT, roles: allLoadBearing(body), ...body }));
if (!pub || pub.ok === false) throw new Error(`publish: ${JSON.stringify(pub)}`);
await ratifyCase(async (q, b) => rP(await POST(q, b)), pub, { dir, key: "pilar", token: PILAR });
const caseSha = (((await GET("op=list&token=mem-d178")).result || []).find((b) => b.bundle_id === INQ_CASE) || {}).bundle_sha;
const rat = rP(await POST(`op=ratify&token=${PILAR}`, { bundleId: INQ_CASE, expectedSha: caseSha, sig: signRatify(INQ_CASE, caseSha) }));
if (!rat || rat.ok === false) throw new Error(`ratify: ${JSON.stringify(rat)}`);

/* Written AFTER publication: the write path already reads the published registry and accepts this leg. */
await promote(INQ_INH, inquiryMd(INQ_INH, { question: "Should the auditor be asked?",
  legs: [{ target: INQ_CASE, grade: "C", axis: "connection", source: "inherited", edition: 1 }] }), "inquiry");

/* ------------------------------------------------------------------ the sweep */
const audit = rP(await GET("op=audit&token=mem-d178&limit=1000"));
const errsOf = (id) => ((audit?.offenders || []).find((o) => o.bundleId === id) || { errors: [] }).errors;
const checksOf = (id) => errsOf(id).map((e) => e.check);
/* THE CORPUS, printed and floored: a clean answer over nothing is not an answer (WORKER.md). */
console.log(`\n  corpus: checked=${audit?.checked} clean=${audit?.clean} withErrors=${audit?.withErrors} `
  + `tally=${JSON.stringify(audit?.tally)} tallyDetail=${JSON.stringify(audit?.tallyDetail ?? null)}`);
for (const o of audit?.offenders || [])
  console.log(`    offender ${o.bundleId}: ${o.errors.map((e) => e.check).join(", ")}`);

console.log("\n--- 1. the fixture is what it says it is ---");
t("(fixture) the case is published at edition 1 and every fixture bundle was swept",
  [pub.edition, rat.edition, (audit?.checked ?? -1) >= 6], [1, 1, true]);
const pubReg = rP(await GET(`op=publishedmanifest&token=mem-d178`));
t("(fixture) the published record names the case — so an empty registry would be a LIE about it, not a measurement",
  ((pubReg?.published) || []).some((p) => p.bundle_id === INQ_CASE), true);

console.log("\n--- 2. a correctly inherited leg reads CLEAN ---");
t("the inheriting inquiry is not an offender at all",
  checksOf(INQ_INH), []);
t("and no finding anywhere reads the published-record blindness sentence (\"cannot be checked against the published record here\")",
  (audit?.offenders || []).flatMap((o) => o.errors)
    .filter((e) => /cannot be checked against the published record here/.test(e.detail || "")).length, 0);
t("OVER-STRICTNESS: an UNGRADED leg on the published case is inert (DEC-18) and stays clean",
  checksOf(INQ_PLAIN), []);

console.log("\n--- 3. an own grade on a published case is reported at C-21.2 ---");
t("the own-grade inquiry is an offender at C-21.2, by name, and at nothing else",
  checksOf(INQ_OWN), ["C-21.2"]);
t("and the finding says what is wrong: a grade of its own on a PUBLISHED case",
  /carries a grade of its own on a PUBLISHED case \(INQ-2026-1780-case\)/.test(errsOf(INQ_OWN)[0]?.detail || ""), true);
t("the tally counts it under C-21.2 and holds no C-2.8 at all",
  [audit?.tally?.["C-21.2"] ?? 0, audit?.tally?.["C-2.8"] ?? 0], [1, 0]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
