/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/operator-attest.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS A REAL SOURCE (src/index.mjs) while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/operator-attest.control.mjs [arm]`. ONE ARM PER REFUSED CREDENTIAL CLASS, each armed ALONE and restored from a uniquely-named per-arm pristine copy verified by sha256 AND byte comparison (never `git checkout --`). DECLARED BEFORE ARMING — (a) `baseline`, nothing armed: MUST be green. (b) `admin`, (c) `member`, (d) `probe` — THAT CLASS exempted from BOTH fences (`&& cls !== ["a","d",...].join("")` added to the guard, the class SPELLED so the arm puts no class literal into the region and perturbs only the drive): its ratification of a member-signed case and finding is ACCEPTED, so exactly five MUST FAIL — that class's two refusals (each naming the class), the two read-backs that say nothing landed, and the trace table — while every other class's refusal, the structural pin and the member's own session STAY GREEN. (e) `overstrict` — both guards widened to `if (true)`: the two member-session arms MUST FAIL (and the structural pin, whose guard is no longer keyed on `viaSession`) while every bearer refusal stays green, which is the only thing that tells a fence refusing everyone from a fence holding. (f) `tokenstring` — THE LIAR THE ROW NAMES: the guard rewritten to refuse by token STRING (the ADMIN and MEMBER binding values) instead of by how the caller arrived: probe walks straight through, so probe's two refusals, both read-backs and the table MUST FAIL, and both structural pins MUST FAIL on the env binding in the guard. RESULTS: see the RESULTS line below, written from the harness's own output.
   RESULTS, RUN 2026-09-18 in worktree agent-aac5bdb9dea9c048e, every restore byte-identical (src/index.mjs 619,467 B, sha256 399829630f43…): baseline 18/0 · admin 13/5 · member 13/5 · probe 13/5 · overstrict 14/4 · tokenstring 11/7 — ALL SIX AS DECLARED, no arm failed to arm. THE TRACE ON THE PRE-ITEM TREE (fbcefa1b's src/index.mjs and checks, this suite unchanged): 7/11 — admin, member and probe each ACCEPTED at op=caseratify and op=ratify carrying iris's signature; daemon CLASS_FORBIDDEN by the OPS row, before and after.
 * =========================================================================
 * REC-125 — D-421, DECIDED BY BOB #14: AN ATTESTED ACT IS DELIVERED ONLY BY A
 * NAMED MEMBER'S OWN AUTHENTICATED SESSION.
 *
 * REC-123 fenced the `ai` class at op=ratify and op=caseratify (C-32.12 /
 * C-32.13, `machine-attest.test.mjs`) and deliberately left the operator's
 * env-binding bearer tokens open, raising D-421: an ADMIN_TOKEN, MEMBER_TOKEN or
 * PROBE_TOKEN carrying a registered member's VALID signature was ACCEPTED at both
 * acts. BOB #14 applied `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 4 (no new
 * doctrine) and ruled REFUSE: *the signature proves who AUTHORISED; the
 * credential that delivers it decides WHEN the record changes, and the record
 * names the actor.* C-32.14 / C-32.15 are that ruling.
 *
 * HOW A LIAR WOULD SATISFY THIS, stated before what it checks: refuse by token
 * STRING — compare the caller's token against ADMIN_TOKEN and MEMBER_TOKEN and
 * PROBE_TOKEN — or by a typed list of CLASSES. Both are green against the three
 * tokens this row names, and a fourth binding admitted to either op later walks
 * straight through. So:
 *   (1) the set of bearer classes is NOT typed here. Block 0 DERIVES it from
 *       `classify()` in the source (every env binding it resolves, and the class
 *       it resolves to), binds EVERY one of them in the harness, and drives every
 *       one the op's own OPS row admits. A new binding is driven the day it lands.
 *   (2) the two regions are read as TEXT and must refuse on how the caller
 *       ARRIVED (`viaSession`) — naming no class literal, no env binding and no
 *       token — so the structural half catches the string-keyed liar even for a
 *       class this harness has no fixture for.
 *
 * WHY THE FIXTURE LIVES IN THE SCRATCH STORE: the probe class is CONFINED to it
 * (`scopeFor`), and a probe refused in `bio` is refused by SCOPE_REFUSED, which
 * proves nothing about this fence. So every drive — every bearer class AND the
 * member's session — addresses `store=scratch`, where each class reaches the
 * handler, the payload is COMPLETE (a registered member's real signature over
 * bytes that exist), and the member's own session ratifies the same bytes
 * successfully afterwards (REC-73's lesson: a refusal under a payload the plane
 * would have refused anyway proves nothing about the fence).
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectFixtureMd, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";
import { MACHINE_FENCE_CHECKS } from "../checks/bio-checks.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- operator-attest ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("operator-attest: SKIPPED — ssh-keygen not on PATH; the refusal is only evidence over a REAL "
    + "member signature, and a bearer token refused over one it could never have presented proves nothing");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const IDX_SRC = readFileSync(IDX, "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ======================================================= 0. WHO IS A BEARER */
console.log("\n--- 0. the bearer classes — DERIVED from classify() and the OPS table, never typed ---");
const clsStart = IDX_SRC.indexOf("async function classify(token, env) {");
const clsBody = clsStart < 0 ? "" : IDX_SRC.slice(clsStart, IDX_SRC.indexOf("\n}", clsStart));
const BINDINGS = [...clsBody.matchAll(
  /token === env\.([A-Z_]+) && \(await liveToken\(env\.\1\)\)\) return "([a-z]+)"/g)].map((m) => ({ binding: m[1], cls: m[2] }));
console.log(`  classify() resolves: ${BINDINGS.map((b) => `${b.binding} -> ${b.cls}`).join(", ")}`);
/* A FLOOR, so a parser that stopped matching cannot read as a clean census. The
   three the row names must be among them; any others are driven too. */
t("classify() parsed to its env bindings, and the three the ruling names are among them",
  ["admin", "member", "probe"].every((c) => BINDINGS.some((b) => b.cls === c)) && BINDINGS.length >= 3, true);
const opsBody = IDX_SRC.slice(IDX_SRC.indexOf("const OPS = {"), IDX_SRC.indexOf("\n};", IDX_SRC.indexOf("const OPS = {")));
const opClasses = (op) => {
  const m = opsBody.match(new RegExp(`^\\s{2}${op}:\\s*\\{\\s*classes:\\s*(\\[[^\\]]*\\])`, "m"));
  return m ? JSON.parse(m[1]) : null;
};
const ACTS = ["caseratify", "ratify"];
const ADMITTED = Object.fromEntries(ACTS.map((op) => [op, (opClasses(op) || []).filter((c) => BINDINGS.some((b) => b.cls === c))]));
for (const op of ACTS) console.log(`  op=${op}: OPS admits ${JSON.stringify(opClasses(op))}; bearer classes that reach the handler: ${ADMITTED[op].join(", ")}`);
t("each act's OPS row parsed, and at least one bearer class reaches each handler (an empty drive is not a clean one)",
  ACTS.map((op) => ADMITTED[op].length > 0), [true, true]);

/* THE STRUCTURAL HALF — the liar the row names. Comments are stripped so the
   reasoning written in the region (which names ADMIN, MEMBER and PROBE on
   purpose) is not mistaken for the guard. */
const region = (name) => {
  const a = IDX_SRC.indexOf(`/* DEC-49 REGION ${name}`), b = IDX_SRC.indexOf(`/* END DEC-49 REGION ${name} */`);
  return a < 0 || b < a ? null : IDX_SRC.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, "");
};
const REGIONS = { ratify: "is-operator-ratify-bundle", caseratify: "is-operator-ratify-case" };
for (const op of ACTS) {
  const code = region(REGIONS[op]);
  t(`STRUCTURE, op=${op}: the fence refuses on how the caller ARRIVED — its guard is \`!viaSession\` and it names no class, no env binding and no token`,
    code === null ? "REGION MISSING" : {
      guard: /if \(!viaSession\b[^\n]*\)\s*\n\s*return json\(/.test(code),
      classLiteral: /["'`](admin|member|probe|daemon|ai)["'`]/.test(code),
      binding: /env\.[A-Z_]+/.test(code),
      token: /searchParams\.get\(\s*["']token["']\s*\)/.test(code) },
    { guard: true, classLiteral: false, binding: false, token: false });
}

/* ============================================================== 1. FIXTURE */
const TOKEN_OF = Object.fromEntries(BINDINGS.map((b) => [b.cls, `${b.cls}-r125-${b.binding.toLowerCase()}`]));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: IDX_SRC,
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* EVERY binding classify() reads, so a fifth one is bound and driven the day it lands. */
  bindings: { ...Object.fromEntries(BINDINGS.map((b) => [b.binding, TOKEN_OF[b.cls]])), VERSION: "test" },
}));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const codeOf = (r) => (r && typeof r.reason === "string") ? r.reason
                    : (r && typeof r.code === "string") ? r.code : null;
const ADM = TOKEN_OF.admin;
const S = "&store=scratch";
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const CODE = { ratify: "OPERATOR_TOKEN_CANNOT_RATIFY", caseratify: "OPERATOR_TOKEN_CANNOT_RATIFY_CASE" };
const CHECK = { ratify: "C-32.14", caseratify: "C-32.15" };
const TRACE = [];

try {

const dir = mkdtempSync(join(tmpdir(), "operator-attest-"));
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

/* Sessions resolve against `bio`; the roster and the signer the ACT reads live in
   the store it addresses. So each member is enrolled in BOTH: in `bio` to hold a
   session, in `scratch` so the act there finds them. Two administrators first
   (ADMINS_FIRST), in each. */
const enrol = async (memberId, role, capabilities) => {
  let token = null;
  for (const st of ["", S]) {
    const add = await POST(`op=memberadd&token=${ADM}${st}`, { memberId, cover: `cover for ${memberId}`, role, capabilities });
    const en = await POST(`op=enroll${st}`, { invite: add && add.invite, handle: memberId, password: `${memberId}-passphrase-125` });
    if (!en || !en.ok) throw new Error(`enroll ${memberId}${st}: ${JSON.stringify(en)}`);
  }
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-125` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  token = lg.token;
  return token;
};
await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
await enrol("gus", "admin", ["contribute", "publish"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
const reg = await POST(`op=signeradd&token=${ADM}${S}`, { keyB64: mkKey("iris"), memberId: "iris", comment: "iris laptop" });
if (!reg || reg.ok === false) throw new Error(`signeradd: ${JSON.stringify(reg)}`);

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
let snapSeq = 0;
const promote = async (id, text, objectType, state) => {
  const r = await POST(`op=promote&token=${ADM}${S}`, {
    bundleId: id, base: null,
    snapKey: `20260918T${String(600000 + (++snapSeq)).slice(-6)}Z_${sha(id).slice(0, 8)}`,
    meta: { object_type: objectType, group: "believe-in-oakland",
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [] });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
/* `makePublishingProject` claims ownership in `bio` by construction; this suite's
   ground is `scratch`, so the same two steps are taken there. */
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7) and a
   creation naming one is refused PROJECT_ID_SUPPLIED (C-59.1); the creation names no bundleId, its bytes
   carry no `id:` line, and PROJECT is read from the answer. */
let PROJECT;
{
  const label = "PROJ-2026-9125-auditor";
  const text = projectFixtureMd(null, { created: NOW, updated: LATER, name: label });
  const r = await POST(`op=promote&token=${ADM}${S}`, {
    base: null,
    snapKey: `20260918T${String(600000 + (++snapSeq)).slice(-6)}Z_${sha(label).slice(0, 8)}`,
    meta: { object_type: "project", group: "believe-in-oakland",
            current_state: "investigating", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [] });
  if (!r || r.ok === false || !r.bundleId) throw new Error(`promote ${label}: ${JSON.stringify(r).slice(0, 800)}`);
  PROJECT = r.bundleId;
}
{
  const ns = await mf.getDurableObjectNamespace("STORE");
  const c = rP(await (await ns.get(ns.idFromName("scratch")).fetch("http://x/projectclaimowner",
    { method: "POST", body: JSON.stringify({ projectId: PROJECT, memberId: "iris" }) })).json());
  if (!c || c.ok !== true) throw new Error(`projectclaimowner: ${JSON.stringify(c)}`);
}
const INFO = "INFO-2026-9125-memo", LEAD = "INQ-2026-9125-lead";
await promote(INFO, infoMd(INFO), "information", "collected");
/* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
   conclusion drawn with no project NAMES the accepted reading whose claim it
   adopts, and an unnamed one is refused NO_CLAIM with nothing written. This
   fixture concluded with no reading because the act took none; the inquiry now
   carries one (`withAdoptableReading`) and the call names it. Fixture, not subject. */
await promote(LEAD, withAdoptableReading(inquiryMd(LEAD, "Was the transfer authorised?", INFO)), "inquiry", "open");
const cc = await GET(`op=conclude&token=${IRIS}${S}&target=${LEAD}`
  + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
  + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
  + adoptedVersionParam());
if (!cc || cc.ok === false) throw new Error(`conclude: ${JSON.stringify(cc)}`);
const pub = await POST(`op=publish&token=${IRIS}${S}`, {
  project: PROJECT, targets: [LEAD], roles: allLoadBearing({ targets: [LEAD] }),
  scope: "Whether the FY2024 transfer was authorised, on the documents in hand.",
  statement: "This case covers the FY2024 transfer only, on the documents in hand at edition 1.",
  excluded: [], subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
  biasAcknowledgement: "This group holds that transfers should be adopted in public session." });
if (!pub || pub.ok === false || !pub.caseDocument || !/^[0-9a-f]{64}$/.test(String(pub.caseDocument.doc_sha)))
  throw new Error(`publish: ${JSON.stringify(pub).slice(0, 900)}`);
const D = pub.caseDocument;
const caseBody = { caseId: D.case_id, edition: D.edition, expectedSha: D.doc_sha,
                   sig: signBytes("iris", `bio-ratify-case ${D.case_id} ${D.edition} ${D.doc_sha}\n`) };
/* Read from the SCRATCH store's own object: `op=casedocument` answers from `bio`,
   where this case does not live.
   CORRECTED 2026-09-18 by REC-130: the read now STAMPS AN INSTANCE-LEVEL VIEWER
   (`class:admin`, the operator's own). It used to send none, which worked only
   because an unsigned case document answered anybody; the store now fails closed
   on an absent viewer for an UNSIGNED document, and this probe's whole subject is
   the window in which the document is unsigned — so without the stamp both
   "not ratified" arms read UNREAD instead of measuring anything. */
const caseRatified = async () => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const r = rP(await (await ns.get(ns.idFromName("scratch")).fetch(
    `http://x/casedocument?case=${encodeURIComponent(D.case_id)}&edition=${D.edition}`
    + `&viewer=${encodeURIComponent("class:admin")}`)).json());
  return (r && typeof r.ratified === "boolean") ? r.ratified : "UNREAD";
};
t("the ground: a case document authored by iris awaits its signature, and it is not ratified", await caseRatified(), false);

/* A refusal is classified from what the plane ANSWERED, never from what this
   suite expects. */
const verdict = (r, op) => {
  const c = codeOf(r);
  if (r && r.ok === true) return "ACCEPTED";
  if (c === CODE[op]) return `REFUSED BY NAME ${c}`;
  return `REFUSED BY ANOTHER GUARD ${c}`;
};
const drive = async (op, cls, body) => {
  const r = await POST(`op=${op}&token=${TOKEN_OF[cls]}${S}`, body);
  const v = verdict(r, op);
  TRACE.push([op, cls, v]);
  if (ADMITTED[op].includes(cls))
    t(`OPERATOR FENCE, op=${op}, the \`${cls}\` class (${BINDINGS.find((b) => b.cls === cls).binding}) carrying iris's VALID signature: `
      + `REFUSED BY NAME ${CODE[op]} (${CHECK[op]}), naming the class, with the catalogue's sentence`,
      [codeOf(r), r && r.check, r && r.tokenClass, !!(r && typeof r.detail === "string" && r.detail.includes(`\`${cls}\`-class`)),
       !!(r && r.translation && r.translation === MACHINE_FENCE_CHECKS[CODE[op]]?.translation)],
      [CODE[op], CHECK[op], cls, true, true]);
  else
    t(`op=${op}, the \`${cls}\` class: not admitted by the op's own OPS row, so the class ACL refuses it first (CLASS_FORBIDDEN)`,
      codeOf(r), "CLASS_FORBIDDEN");
  return r;
};

/* ============================================================ 2. CASERATIFY */
console.log("\n--- 2. op=caseratify — every bearer class, carrying iris's real signature ---");
for (const { cls } of BINDINGS) await drive("caseratify", cls, caseBody);
t("op=caseratify: after every bearer class was driven, the case is still NOT ratified", await caseRatified(), false);
const hc = await POST(`op=caseratify&token=${IRIS}${S}`, caseBody);
t("OVER-STRICTNESS, op=caseratify: iris ratifying THE SAME signed bytes through her own session SUCCEEDS",
  [codeOf(hc), hc && hc.ok, hc && hc.attestor && hc.attestor.member, await caseRatified()], [null, true, "iris", true]);

/* ================================================================ 3. RATIFY */
console.log("\n--- 3. op=ratify — every bearer class, carrying iris's real signature ---");
const listed = await GET(`op=list&token=${IRIS}${S}&limit=1000`);
const leadSha = (Array.isArray(listed) ? listed : (listed && listed.bundles) || [])
  .find((b) => b.bundle_id === LEAD)?.bundle_sha ?? null;
if (!/^[0-9a-f]{64}$/.test(String(leadSha))) throw new Error(`no sha for ${LEAD}`);
const ratBody = { bundleId: LEAD, expectedSha: leadSha, sig: signBytes("iris", `bio-ratify ${LEAD} ${leadSha}\n`) };
const published = async () => ((await GET(`op=publishedlist&token=${IRIS}${S}`))?.bundles || [])
  .filter((b) => b.bundle_id === LEAD).map((b) => b.attestor_member);
for (const { cls } of BINDINGS) await drive("ratify", cls, ratBody);
t("op=ratify: after every bearer class was driven, the finding is NOT published", await published(), []);
const hr = await POST(`op=ratify&token=${IRIS}${S}`, ratBody);
t("OVER-STRICTNESS, op=ratify: iris ratifying the same signed bytes through her own session SUCCEEDS, and the record names her",
  [codeOf(hr), hr && hr.ok, await published()], [null, true, ["iris"]]);

/* ========================================================== 4. THE TABLE */
console.log("\n--- 4. THE TRACE TABLE — every bearer class classify() resolves, at both acts, MEASURED ---");
for (const [op, cls, v] of TRACE) console.log(`  op=${op.padEnd(11)} ${cls.padEnd(8)} ${v}`);
t("THE TABLE: no bearer class classify() resolves is ACCEPTED at either attested act",
  TRACE.filter(([, , v]) => v === "ACCEPTED").map(([op, cls]) => `${op}:${cls}`), []);

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
}
await mf.dispose();
console.log(`\noperator-attest: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
