/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/machine-attest.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS A REAL SOURCE (src/index.mjs) while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/machine-attest.control.mjs [arm]`. Every arm is armed ALONE with the others held open, and restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with the byte count printed and a minimum guarded (never `git checkout --`). DECLARED BEFORE ARMING — (a) `baseline`, nothing armed: MUST be green. (b) `ratify` — delete the `ai` fence at op=ratify: the machine's ratification of a member-signed bundle is ACCEPTED, and the arms naming op=ratify MUST FAIL (the refusal, the "not published" read-back, the trace verdict) while every op=caseratify arm MUST PASS — CORRECTED 2026-09-18 by REC-125: the read-back no longer fails in this arm or in (c), because REC-125's session fence (C-32.14/C-32.15) now also refuses an `ai` credential, so the act is doubly fenced; see the control's own note. (c) `caseratify` — delete the fence at op=caseratify: the machine COMMITS the case, and the arms naming op=caseratify MUST FAIL, while op=ratify's refusal arm MUST PASS. (d) `overstrict` — widen both fences from the `ai` class to EVERY caller: the member arms (iris ratifying her own signed bytes through the same two ops) MUST FAIL while every machine refusal STAYS GREEN — a fence that refuses everyone reads as a fence holding, and only the member arm can tell them apart. RESULTS: see the RESULTS line below, written from the harness's own output.
   RESULTS, RE-RUN 2026-09-18 by REC-125 in worktree agent-aac5bdb9dea9c048e on the tree carrying its fence, every restore byte-identical (src/index.mjs 619,467 B, sha256 399829630f43…): baseline 35/0 · ratify 33/2 · caseratify 33/2 · overstrict 33/2 — ALL FOUR AS DECLARED after the correction above.
   RESULTS, RUN 2026-09-18 in worktree agent-ad37cd8c19b30bf8b, every restore byte-identical (src/index.mjs 615,722 B, sha256 f7798e43e7a9…, re-run on the FINAL guard shape): baseline 35/0 · ratify 32/3 · caseratify 32/3 · overstrict 33/2 — ALL FOUR AS DECLARED, no arm failed to arm. THE TRACE ON THE PRE-ITEM TREE, run with REC123_SRC pointing at a `git archive` of 6e50b260: 30/5 — the machine's op=caseratify answered ok:true with attestor {member: iris} and tokenClass ai, and its op=ratify answered ok:true with attestor iris.
 * =========================================================================
 * REC-123 — CAN AN `ai` CREDENTIAL ATTEST OR RATIFY? TRACED BY DRIVING.
 *
 * `construct-status.json` 11.machine-fence read UNDETERMINED: authored acts are
 * fenced by the `MACHINE_CANNOT_*` family, and nobody had followed the attest
 * and ratify handlers BELOW the scope check. A machine attesting the record is
 * the trust-of-the-record question itself, and the design is explicit:
 * `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 4 — *"No machine credential
 * performs the attested act ... The AI holds no op that ACCEPTS"* (DEC-24 rule
 * 4, DEC-60).
 *
 * HOW A LIAR WOULD SATISFY THIS, stated before what it checks: test only the
 * ops the queue row NAMED. The one attest path nobody listed is the one a
 * machine will use. So the set of ops traced here is not typed from the row —
 * block 0 DERIVES it from the plane under three independent names and fails if
 * any op it finds is not in the trace table below:
 *   (1) every OPS key whose NAME carries an attest/ratify/vouch verb
 *       (attest|ratif|confirm|endorse|vouch|sign|certif|affirm|witness|accept|
 *       countersign|approv|verif);
 *   (2) every op at the `attested` RUNG of `affordances.mjs` (a signed or
 *       countersigned act — the plane's own classification, by meaning);
 *   (3) every op whose control-plane prelude STAMPS an `attestor`.
 * WHAT THE MATCHER CANNOT SEE, and it is load-bearing: an act that vouches for
 * the record under a name carrying none of those verbs, at a rung other than
 * `attested`, with no stamped `attestor` field. The MACHINE_CANNOT_* family
 * (release, conclude, ground, …) is the rest of the authored-act fence and is
 * driven by `machine-fences.test.mjs`, not here.
 *
 * EACH OP IS DRIVEN TWICE BY AN `ai` CREDENTIAL. Once by a credential whose
 * member-authored scope does NOT name it — which proves the SCOPE CHECK — and
 * once by one whose scope DOES, which is what a broader scope would pass and is
 * the only drive that says anything about the HANDLER. The payload is COMPLETE:
 * every machine drive is followed by a MEMBER drive of the same payload that
 * must succeed (REC-73's lesson: a refusal under a payload the plane would have
 * refused anyway proves nothing about the fence), and that member arm is the
 * over-strictness arm at the same time.
 *
 * THE TRACE, MEASURED ON THE PRE-ITEM TREE (origin/main 6e50b260) — kept here as
 * the record because it is the item's finding:
 *   op=ratify       ACCEPTED — an `ai` credential carrying a registered member's
 *                   signature PUBLISHED the bundle. Fenced now: C-32.12.
 *   op=caseratify   ACCEPTED — the same, and it COMMITTED THE CASE. Fenced now:
 *                   C-32.13.
 *   (the rest: see the TRACE TABLE block, which prints each measured outcome)
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { MACHINE_FENCE_CHECKS, AI_CREDENTIAL_CHECKS } from "../checks/bio-checks.mjs";
import { RUNGS } from "../src/affordances.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- machine-attest ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("machine-attest: SKIPPED — ssh-keygen not on PATH; op=ratify's and op=caseratify's authority is a REAL "
    + "member signature, and a machine refused over a signature it could never have presented proves nothing");
  process.exit(0);
}

const SRC_DIR = process.env.REC123_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const IDX_SRC = readFileSync(IDX, "utf8");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: IDX_SRC,
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r123", MEMBER_TOKEN: "mem-r123", PROBE_TOKEN: "prb-r123", VERSION: "test" },
  /* op=attest asks a timestamp authority over the network. Every outbound call
     answers 503 here, so the act RECORDS ITS ATTEMPTS and answers NO_ATTESTATION
     — which is the handler running to its end for machine and member alike. */
  outboundService() { return new Response("tsa unavailable in the harness", { status: 503 }); },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
/* NULL-TOLERANT: an arm that breaks an answer's shape must NAME what it broke
   rather than end the module on a TypeError. */
const codeOf = (r) => (r && typeof r.reason === "string") ? r.reason
                    : (r && typeof r.code === "string") ? r.code : null;

const ADM = "adm-r123";
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

/* THE VERDICT, classified from what the plane ANSWERED — never from what this
   suite expects. Four outcomes, and the difference between the middle two is
   the whole item: a scope refusal is passed by a broader scope, a named fence
   is not. */
const SCOPE_CODES = new Set(Object.keys(AI_CREDENTIAL_CHECKS));
const MACHINE_NAMED = new Set([...Object.keys(MACHINE_FENCE_CHECKS), "TEXT_ATTEST_MACHINE"]);
const verdict = (r, accepted) => {
  const c = codeOf(r);
  if (accepted(r)) return "ACCEPTED";
  if (c && MACHINE_NAMED.has(c)) return `REFUSED BY NAME ${c}`;
  if (c && SCOPE_CODES.has(c)) return `REFUSED BY THE SCOPE CHECK ONLY ${c}`;
  return `REFUSED BY ANOTHER GUARD ${c}`;
};
const okTrue = (r) => !!(r && r.ok === true);
const TRACE = [];

try {

/* ======================================================= 0. THE CORPUS OF OPS */
console.log("\n--- 0. which ops attest or ratify — DERIVED from the plane under three names, never typed ---");
const opsBody = IDX_SRC.slice(IDX_SRC.indexOf("const OPS = {"), IDX_SRC.indexOf("\n};", IDX_SRC.indexOf("const OPS = {")));
const OPS = new Map([...opsBody.matchAll(
  /^\s{2}([a-z0-9]+):\s*\{\s*classes:\s*(\[[^\]]*\]|null)[^}]*?mutating:\s*(true|false)/gm)]
  .map((m) => [m[1], { classes: m[2] === "null" ? null : JSON.parse(m[2]), mutating: m[3] === "true" }]));
/* THE FLOOR, so a parser that silently stopped matching cannot read as a clean
   census: the plane has well over a hundred ops (3.census counts them). */
t("the OPS table parsed to a real corpus (floor 150), not an empty one", OPS.size >= 150, true);
console.log(`  corpus: ${OPS.size} ops parsed out of src/index.mjs's OPS table`);
const VERB = /attest|ratif|confirm|endorse|vouch|sign|certif|affirm|witness|accept|countersign|approv|verif/;
const byName = [...OPS.keys()].filter((o) => VERB.test(o));
const byRung = Object.entries(RUNGS).filter(([, r]) => r === "attested").map(([o]) => o);
const byStamp = [...IDX_SRC.matchAll(/if \(op === "([a-z]+)"\)\s*\n\s*inner\.searchParams\.set\("attestor"/g)].map((m) => m[1]);
console.log(`  by name (${byName.length}): ${byName.join(", ")}`);
console.log(`  by rung \`attested\` (${byRung.length}): ${byRung.join(", ")}`);
console.log(`  by a stamped attestor (${byStamp.length}): ${byStamp.join(", ")}`);
t("each of the three searches FOUND something (an empty search is not a clean one)",
  [byName.length > 0, byRung.length > 0, byStamp.length > 0], [true, true, true]);

/* EVERY op the three searches find is either DRIVEN below or NAMED here with
   the reason it is not an attestation. A new op under any of the three names
   fails this until somebody decides which it is. */
const DRIVEN = ["attest", "ratify", "caseratify", "attesttext", "transcriptionattest", "textattest",
                "expertiseconfirm", "adminendorse", "signeradd", "signerset"];
const NOT_AN_ATTESTATION = {
  versionaccept: "a member ACCEPTING a version of a basis — fenced by MACHINE_CANNOT_MOVE_VERSION (C-25.24) and "
               + "driven under a complete payload by machine-fences.test.mjs (REC-73), which this suite checks names it",
  calibrationsignal: "the matcher's `sign` inside `signal`: an announcement that may only SHORTEN the interval to an "
                   + "engine's next probe, never a statement about the record",
  signerlist: "a READ of the registered signing keys",
  verify: "the public READ-and-verify surface, credential-free (classes: null)",
};
const found = [...new Set([...byName, ...byRung, ...byStamp])].sort();
t("THE CENSUS: every op any search found is DRIVEN here or NAMED as not an attestation — nothing found is unaccounted for",
  found.filter((o) => !DRIVEN.includes(o) && !(o in NOT_AN_ATTESTATION)), []);
t("and nothing in the trace list is a name the plane does not have (a stale list is a liar's list)",
  [...DRIVEN, ...Object.keys(NOT_AN_ATTESTATION)].filter((o) => !OPS.has(o)), []);
t("versionaccept's cross-reference holds: machine-fences.test.mjs drives it with a machine credential",
  /"versionaccept"/.test(readFileSync(fileURLToPath(new URL("./machine-fences.test.mjs", import.meta.url)), "utf8")), true);

/* ============================================================== 1. FIXTURE */
const dir = mkdtempSync(join(tmpdir(), "machine-attest-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* THE STATEMENTS, WRITTEN OUT IN ASCII rather than imported from src/sshsig.mjs:
   an expectation taken from the thing under test agrees with it for free. */
const signBytes = (who, text) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, text);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const signRatify = (who, bundleId, bundleSha) => signBytes(who, `bio-ratify ${bundleId} ${bundleSha}\n`);
const signCase = (who, caseId, edition, docSha) => signBytes(who, `bio-ratify-case ${caseId} ${edition} ${docSha}\n`);

const enrol = async (memberId, role, capabilities) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-123` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-123` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* Two administrators before any ordinary member (ADMINS_FIRST). */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
await enrol("gus", "admin", ["contribute", "publish"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
const SAM = await enrol("sam", "member", ["contribute"]);
const reg = await POST(`op=signeradd&token=${ADM}`, { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" });
if (!reg || reg.ok === false) throw new Error(`signeradd: ${JSON.stringify(reg)}`);

/* THE CREDENTIALS. Each is minted by RUTH (a member act, DEC-55) and is
   MEMBER-SCOPED to her, so its viewer is hers and it sees what she sees:
   nothing but the fence is left to refuse a call once its scope names the op. */
const mint = async (tokenId, writes) => POST(`op=aicredentialmint&token=${RUTH}`, {
  tokenId, principalKind: "member", principalMember: "ruth", taskScope: `REC-123: ${tokenId}`, writes,
  note: "REC-123. A member authored this scope so the credential layer is held OPEN and what answers is the handler." });
const NARROW = await mint("rec123-narrow", ["contentmint"]);
const ATTESTER = await mint("rec123-attester",
  ["attest", "attesttext", "transcriptionattest", "expertiseconfirm"]);
const RATIFIER = await mint("rec123-ratifier", ["ratify", "caseratify"]);
t("three `ai` credentials minted: one that names none of these ops, one scoped to ATTEST, one scoped to RATIFY",
  [NARROW.ok, ATTESTER.ok, RATIFIER.ok, ATTESTER.credential && ATTESTER.credential.writes,
   RATIFIER.credential && RATIFIER.credential.writes],
  [true, true, true, ["attest", "attesttext", "expertiseconfirm", "transcriptionattest"], ["caseratify", "ratify"]]);
const AI_N = NARROW.token, AI_A = ATTESTER.token, AI_R = RATIFIER.token;

/* ======================================== 2. THE SCOPE CHECK, AND ITS LIMIT */
console.log("\n--- 2. the SCOPE CHECK refuses every mutating op a credential's scope does not name ---");
for (const op of ["attest", "attesttext", "transcriptionattest", "expertiseconfirm", "ratify", "caseratify"]) {
  const r = await POST(`op=${op}&token=${AI_N}`, {});
  t(`op=${op} with a scope that does not name it: AI_BEYOND_TASK_SCOPE (C-29.6) — the gate, and ONLY the gate`,
    [codeOf(r), r && r.check], ["AI_BEYOND_TASK_SCOPE", "C-29.6"]);
}
/* The three admin-only acts are outside EVERY scope, by shape: no member
   reaches them, so no member can author them into a credential. */
const beyond = await mint("rec123-beyond", ["adminendorse", "signeradd", "signerset"]);
t("adminendorse / signeradd / signerset cannot even be WRITTEN into a scope: AI_SCOPE_BEYOND_MEMBER_REACH (C-29.9)",
  [codeOf(beyond), beyond && beyond.check], ["AI_SCOPE_BEYOND_MEMBER_REACH", "C-29.9"]);
for (const op of ["adminendorse", "signeradd", "signerset"]) {
  const r = await POST(`op=${op}&token=${AI_A}`, { memberId: "iris", keyB64: mkKey(`x-${op}`) });
  TRACE.push([op, verdict(r, okTrue)]);
  t(`op=${op} by an \`ai\` credential: refused at the gate by SHAPE (no member reaches it), never reaching a handler`,
    codeOf(r), "AI_BEYOND_TASK_SCOPE");
}

/* ================================================ 3. RATIFY AND CASERATIFY */
console.log("\n--- 3. ratification — a registered member's REAL signature, carried by an `ai` credential ---");
let snapSeq = 0;
const promoteAs = async (tok, id, text, objectType, state) => {
  const r = await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null,
    snapKey: `20260918T${String(400000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) } ],
    register: [] });
  if (r && r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
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
const inquiryMd = (id, question, target) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${target}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${target}`, "    role: supports",
  "    grade: D", "    grade_axis: connection", "    grade_source: testimony",
  "---", "", "## Question", "", question, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7); the
   fixture takes a `name` and returns the minted id, which is what PROJECT holds. */
const PROJECT = await makePublishingProject({ post: POST, mf, sha, machineToken: ADM, owner: "iris",
  name: "PROJ-2026-9123-auditor", created: NOW, updated: LATER });
const INFO = "INFO-2026-9123-memo", LEAD = "INQ-2026-9123-lead";
await promoteAs(ADM, INFO, infoMd(INFO), "information", "collected");
/* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
   conclusion drawn with no project NAMES the accepted reading whose claim it
   adopts, and an unnamed one is refused NO_CLAIM with nothing written. This
   fixture concluded with no reading because the act took none; the inquiry now
   carries one (`withAdoptableReading`) and the call names it. Fixture, not subject. */
await promoteAs(ADM, LEAD, withAdoptableReading(inquiryMd(LEAD, "Was the transfer authorised?", INFO)), "inquiry", "open");
const cc = await GET(`op=conclude&token=${IRIS}&target=${LEAD}`
  + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
  + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
  + adoptedVersionParam());
if (!cc || cc.ok === false) throw new Error(`conclude: ${JSON.stringify(cc)}`);
const pub = await POST(`op=publish&token=${IRIS}`, {
  project: PROJECT, targets: [LEAD], roles: allLoadBearing({ targets: [LEAD] }),
  scope: "Whether the FY2024 transfer was authorised, on the documents in hand.",
  statement: "This case covers the FY2024 transfer only, on the documents in hand at edition 1.",
  excluded: [], subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
  biasAcknowledgement: "This group holds that transfers should be adopted in public session." });
if (!pub || pub.ok === false || !pub.caseDocument || !/^[0-9a-f]{64}$/.test(String(pub.caseDocument.doc_sha)))
  throw new Error(`publish: ${JSON.stringify(pub).slice(0, 900)}`);
const D = pub.caseDocument;
const caseSig = signCase("iris", D.case_id, D.edition, D.doc_sha);
const caseBody = { caseId: D.case_id, edition: D.edition, expectedSha: D.doc_sha, sig: caseSig };
const anonCase = async () => codeOf(await GET(`op=publishedcase&id=${D.case_id}`));
t("the ground: a case document authored by iris awaits its signature, and nothing about it is published",
  [D.edition, await anonCase()], [1, "NOT_PUBLISHED"]);

const mc = await POST(`op=caseratify&token=${AI_R}`, caseBody);
console.log(`  measured, the machine's op=caseratify: ${JSON.stringify({ ok: mc && mc.ok, code: codeOf(mc),
  attestor: mc && mc.attestor, tokenClass: mc && mc.tokenClass })}`);
TRACE.push(["caseratify", verdict(mc, okTrue)]);
t("op=caseratify by an `ai` credential carrying iris's VALID signature: REFUSED BY NAME, MACHINE_CANNOT_RATIFY_CASE (C-32.13), with the catalogue's sentence",
  [codeOf(mc), mc && mc.check, mc && mc.translation === MACHINE_FENCE_CHECKS.MACHINE_CANNOT_RATIFY_CASE?.translation],
  ["MACHINE_CANNOT_RATIFY_CASE", "C-32.13", true]);
t("op=caseratify: and the case is NOT committed — the public read still answers NOT_PUBLISHED",
  await anonCase(), "NOT_PUBLISHED");
const hc = await POST(`op=caseratify&token=${IRIS}`, caseBody);
t("OVER-STRICTNESS, op=caseratify: iris ratifying THE SAME signed bytes herself SUCCEEDS",
  [codeOf(hc), hc && hc.ok, hc && hc.attestor && hc.attestor.member], [null, true, "iris"]);

const listed = await GET(`op=list&token=${IRIS}&limit=1000`);
const leadSha = (Array.isArray(listed) ? listed : (listed && listed.bundles) || [])
  .find((b) => b.bundle_id === LEAD)?.bundle_sha ?? null;
if (!/^[0-9a-f]{64}$/.test(String(leadSha))) throw new Error(`no sha for ${LEAD}`);
const ratBody = { bundleId: LEAD, expectedSha: leadSha, sig: signRatify("iris", LEAD, leadSha) };
const pubIds = async () => ((await GET("op=publishedmanifest"))?.published || [])
  .map((b) => b.bundle_id).filter(Boolean);
const mr = await POST(`op=ratify&token=${AI_R}`, ratBody);
console.log(`  measured, the machine's op=ratify: ${JSON.stringify({ ok: mr && mr.ok, code: codeOf(mr),
  attestor: mr && (mr.attestor ?? mr.attestorMember ?? null), tokenClass: mr && mr.tokenClass })}`);
TRACE.push(["ratify", verdict(mr, okTrue)]);
t("op=ratify by an `ai` credential carrying iris's VALID signature: REFUSED BY NAME, MACHINE_CANNOT_RATIFY (C-32.12), with the catalogue's sentence",
  [codeOf(mr), mr && mr.check, mr && mr.translation === MACHINE_FENCE_CHECKS.MACHINE_CANNOT_RATIFY?.translation],
  ["MACHINE_CANNOT_RATIFY", "C-32.12", true]);
t("op=ratify: and the finding is NOT published", (await pubIds()).includes(LEAD), false);
const hr = await POST(`op=ratify&token=${IRIS}`, ratBody);
t("OVER-STRICTNESS, op=ratify: iris ratifying the same signed bytes herself SUCCEEDS, and the finding is published",
  [codeOf(hr), hr && hr.ok, (await pubIds()).includes(LEAD)], [null, true, true]);

/* ================================== 4. TEXT ATTESTATION AND TRANSCRIPTION */
console.log("\n--- 4. attesting machine text, and attesting a member's typing ---");
const SHA_T = sha("rec123-title-deed");
const DOC = "INFO-2026-9123-deed";
{
  const text = infoMd(DOC);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: SHA_T, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW, entities: [],
               text_source: [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
                             { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
                               extent: { kind: "pages", pages: [0, 1, 2] } }] } }] });
  const r = await POST(`op=promote&token=${RUTH}`, {
    bundleId: DOC, base: null, snapKey: `20260918T499999Z_${sha(DOC).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${DOC}`,
            current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }] });
  if (r && r.ok === false) throw new Error(`promote ${DOC}: ${JSON.stringify(r).slice(0, 900)}`);
}
const attBody = { captureSha: SHA_T, at: NOW, extent: { kind: "page", page: 1 }, note: "checked page 2" };
const countOver = async () => (await GET(`op=textattest&token=${RUTH}&sha256=${SHA_T}&page=1`))?.count ?? -1;
const ta0 = await GET(`op=textattest&token=${AI_A}&sha256=${SHA_T}&page=1`);
TRACE.push(["textattest", ta0 && ta0.ok !== false ? "A READ (mutating: false) — writes nothing" : verdict(ta0, () => false)]);
t("op=textattest is a READ: an `ai` credential reads it (no scope needed) and it holds nothing yet",
  [ta0 && ta0.ok !== false, ta0 && ta0.count], [true, 0]);
const ma = await POST(`op=attesttext&token=${AI_A}`, { ...attBody, attestor: "sam", member: "sam" });
TRACE.push(["attesttext", verdict(ma, okTrue)]);
t("op=attesttext by an `ai` credential scoped to it — even naming a member in the body: REFUSED BY NAME, TEXT_ATTEST_MACHINE (C-35.10)",
  [codeOf(ma), ma && ma.check], ["TEXT_ATTEST_MACHINE", "C-35.10"]);
t("op=attesttext: and nothing landed — op=textattest still counts zero", await countOver(), 0);
const ha = await POST(`op=attesttext&token=${SAM}`, attBody);
t("OVER-STRICTNESS, op=attesttext: sam attesting the same page herself SUCCEEDS, and it is counted",
  [ha && ha.ok, await countOver()], [true, 1]);

const REGION = { kind: "pdf-page", page: 1, rect: [10, 10, 200, 100] };
const tx = await POST(`op=transcribe&token=${RUTH}`, { bundleId: DOC, extent: REGION,
  text: "Know all men by these presents, that the Grantor conveys Lot 7, Block 3.", at: NOW });
if (!tx || !tx.ok) throw new Error(`transcribe: ${JSON.stringify(tx).slice(0, 700)}`);
const mt = await POST(`op=transcriptionattest&token=${AI_A}`, { contentId: tx.content_id, at: LATER, attestor: "sam" });
TRACE.push(["transcriptionattest", verdict(mt, okTrue)]);
t("op=transcriptionattest by an `ai` credential scoped to it: REFUSED BY NAME, TEXT_ATTEST_MACHINE (C-35.10)",
  [codeOf(mt), mt && mt.check], ["TEXT_ATTEST_MACHINE", "C-35.10"]);
const tr0 = await GET(`op=transcription&token=${RUTH}&id=${tx.content_id}`);
t("op=transcriptionattest: and the typing carries no attestation", (tr0 && tr0.attestations || [-1]).length, 0);
const ht = await POST(`op=transcriptionattest&token=${SAM}`, { contentId: tx.content_id, at: LATER });
t("OVER-STRICTNESS, op=transcriptionattest: sam attesting ruth's typing SUCCEEDS",
  [ht && ht.ok, ht && ht.attestor], [true, "sam"]);

/* ======================================================= 5. CO-ATTESTATION */
console.log("\n--- 5. op=attest — a THIRD PARTY's timestamp over a capture hash ---");
const CAP = new TextEncoder().encode("rec123 captured bytes");
const CAP_SHA = sha(CAP);
await (await mf.getR2Bucket("CAPTURES")).put(`bio/captures/${CAP_SHA}`, CAP);
const reached = (r) => !!(r && Array.isArray(r.attempts) && r.attempts.length > 0);
const mco = await POST(`op=attest&token=${AI_A}`, { sha256: CAP_SHA });
TRACE.push(["attest", `${verdict(mco, reached)} — PERMITTED BY DESIGN: BIO_Intake_Doctrine_v1_1.md §3, `
  + `"Raising a grade mechanically": the co-attestations are "cheap, automatable" and "REQUIRED of the M2' fetch layer"`]);
t("op=attest by an `ai` credential scoped to it is ACCEPTED — the handler asks the timestamp authority and records "
  + "the attempt — and that is the DESIGN: the TSA vouches, not the caller (Intake Doctrine §3), so it is left unfenced",
  [reached(mco), codeOf(mco)], [true, "NO_ATTESTATION"]);
const hco = await POST(`op=attest&token=${RUTH}`, { sha256: CAP_SHA });
t("and a member's call answers the same way — the act carries no author to fence",
  [reached(hco), codeOf(hco)], [true, "NO_ATTESTATION"]);

/* ===================================================== 6. EXPERTISE VOUCH */
console.log("\n--- 6. op=expertiseconfirm — one person vouching for another's licence ---");
const dec = await POST(`op=expertisedeclare&token=${SAM}`, { label: "CPA" });
if (!dec || dec.ok === false) throw new Error(`expertisedeclare: ${JSON.stringify(dec)}`);
const me = await POST(`op=expertiseconfirm&token=${AI_A}`, { memberId: "sam", label: "CPA", by: "ruth" });
TRACE.push(["expertiseconfirm", `${verdict(me, okTrue)} — by the membership guard, which a machine stamp can `
  + `never satisfy (\`class:ai\` is no administrator member); index.mjs's expertise block says why no fence is added`]);
t("op=expertiseconfirm by an `ai` credential (principal: ruth, an administrator), naming ruth in the body: REFUSED, "
  + "ADMIN_ONLY — the stamp is `class:ai`, never the principal",
  codeOf(me), "ADMIN_ONLY");
const hx = await POST(`op=expertiseconfirm&token=${RUTH}`, { memberId: "sam", label: "CPA" });
t("OVER-STRICTNESS, op=expertiseconfirm: ruth confirming it herself SUCCEEDS", [hx && hx.ok, hx && hx.by], [true, "ruth"]);

/* ========================================================== 7. THE TABLE */
console.log("\n--- 7. THE TRACE TABLE — every attest/ratify op, the MEASURED outcome for an `ai` credential whose scope names it ---");
for (const [op, v] of TRACE) console.log(`  op=${op.padEnd(20)} ${v}`);
const table = Object.fromEntries(TRACE.map(([op, v]) => [op, v.split(" — ")[0]]));
t("THE TABLE covers every DRIVEN op, and no machine attestation or ratification is ACCEPTED except op=attest, "
  + "which the design names",
  DRIVEN.map((op) => [op, table[op] ?? "NOT DRIVEN"]),
  [["attest", "ACCEPTED"],
   ["ratify", "REFUSED BY NAME MACHINE_CANNOT_RATIFY"],
   ["caseratify", "REFUSED BY NAME MACHINE_CANNOT_RATIFY_CASE"],
   ["attesttext", "REFUSED BY NAME TEXT_ATTEST_MACHINE"],
   ["transcriptionattest", "REFUSED BY NAME TEXT_ATTEST_MACHINE"],
   ["textattest", "A READ (mutating: false)"],
   ["expertiseconfirm", "REFUSED BY ANOTHER GUARD ADMIN_ONLY"],
   ["adminendorse", "REFUSED BY THE SCOPE CHECK ONLY AI_BEYOND_TASK_SCOPE"],
   ["signeradd", "REFUSED BY THE SCOPE CHECK ONLY AI_BEYOND_TASK_SCOPE"],
   ["signerset", "REFUSED BY THE SCOPE CHECK ONLY AI_BEYOND_TASK_SCOPE"]]);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
}
await mf.dispose();
console.log(`\nmachine-attest: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
