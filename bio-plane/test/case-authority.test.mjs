/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/case-authority.control.mjs` — deliberately NOT a `.test.mjs`, because it runs this suite against PATCHED COPIES of the sources and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/case-authority.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once) and the real sources are hashed before and after; what each arm MUST fail is declared in the driver before it arms. (a) `baseline` — nothing armed, MUST be green. (b) `no-owner-signer` — the owner-signer condition dropped: the NON-OWNERS arms commit, so they MUST fail, and nothing else. (c) `no-delivery-check` — the delivery check dropped: the OUTSIDE ADMINISTRATOR arms (and the invited-not-joined arm) commit, so they MUST fail, and nothing else. (d) `refuse-every-admin` — the liar the row names: every administrator refused as a deliverer, founder included: every refusal arm STAYS GREEN (that is the lie) and the FOUNDER and joined-administrator arms MUST fail. (e) `delivery-after-retry` — the delivery check moved below the idempotent retry: only the retry arm MUST fail.
   RESULTS, RUN 2026-09-18 by the REC-137 worker (worktree agent-aee812fe065a38e23, base 39785cda + this item; real src/index.mjs 657,700 B sha256 5503f0b281c5, src/store.mjs 2,600,997 B sha256 594c06d9ea45, untouched: YES): (a) baseline 23/0 · (b) no-owner-signer 18/5 · (c) no-delivery-check 17/6 · (d) refuse-every-admin 18/5 · (e) delivery-after-retry 22/1 — every arm AS DECLARED on its first run. RE-RUN 2026-09-18 after §0 (SIGHT before role, three arms, asked for by CONDUCT #5 for REC-138's ordering) was added: (a) 26/0 · (b) 21/5 · (c) 20/6 · (d) 21/5 · (e) 25/1, all AS DECLARED, sources untouched: YES. That re-run first read (b) NOT AS DECLARED 18/8 — §0 then ran AFTER §1, and the arm's own commit of E made E public; a finding about the ARM's order, corrected by moving §0 first, not by widening the declaration. §0's ordering is REC-130's standing check at the facts read, upstream of this item, and no arm here breaks it. RE-RUN 2026-09-18 on the MERGE with origin/main carrying REC-138 (IC-155, sight before role everywhere; real src/index.mjs 658,971 B sha256 176cbfa2cb58, src/store.mjs 2,608,442 B sha256 a495ace2a1f2, untouched: YES): (a) 26/0 · (b) 21/5 · (c) 20/6 · (d) 21/5 · (e) 25/1, all AS DECLARED. RE-RUN 2026-09-18 by REC-140 after the two questions MOVED into `Store#caseAuthority` (the anchors are now the helper's; `delivery-after-retry` re-inserts the question at ratifyCaseDocument's scope) and §7 was CORRECTED to the C-58.1 refusal (real src/index.mjs 661,904 B sha256 a1c6cb7448bb, src/store.mjs 2,614,766 B sha256 e20e357f1a7c, untouched: YES): (a) 26/0 · (b) 21/5 · (c) 20/6 · (d) 21/5 · (e) 25/1, all AS DECLARED. THE PRE-ITEM MEASUREMENT (the suite run with CASE_AUTHORITY_SRC at the pristine src/ of 39785cda): 12 pass / 11 fail — gus, a joined NON-owner, signed and delivered E's case and it COMMITTED (ok:true, attestor gus, published); ruth, an enrolled administrator with no role, delivered iris's signature on A and it COMMITTED; the invited-not-joined wen and ruth's retry were then answered `ok:true` (existed) off that commit.
 * =========================================================================
 * REC-137 / IC-154 / C-57 — A CASE RATIFICATION: WHO AUTHORISES IT, AND WHO MAY
 * DELIVER IT. Membership Architecture v2 §7, the bullet of that name (BOB #15,
 * 2026-09-18), reconciling DEC-72 clause 5 (publishing is the project OWNER's act)
 * with DEC-33 (publishing currently runs through the group's operator) and AI Roles
 * §3 rule 4 (the record states signer and deliverer apart).
 *
 * WHAT THE CODE DID BEFORE, VERIFIED AT THE CODE AND DRIVEN: `op=caseratify` asked
 * the session for the instance-wide `publish` capability (NEEDS), standing in the
 * owning project (IC-141 — which every administrator has everywhere), and a
 * signature by ANY active registered signer of the instance (`facts.signers`). No
 * owner was asked for anywhere on the path: `ratifyCaseDocument` committed whatever
 * signer the control plane matched. So a joined non-owner could commit an owner's
 * case under their OWN signature, and an enrolled administrator in no role in the
 * project could carry an owner's signature in.
 *
 * THE RULING, AND THE TWO CHECKS IT BECAME:
 *   AUTHORITY — the signature must be an OWNER's of the publishing project
 *     (`CASE_SIGNER_NOT_AN_OWNER`, C-57.1), asked through `#isProjectOwner`.
 *   DELIVERY — a member with a role in the project (a JOINED participant, the
 *     positional rule REC-134 already enforces for work inside a project) or the
 *     FOUNDER (DEC-33's interim route). An enrolled administrator with no role is
 *     refused by REC-134's ONE check, `#projectAuthority`, answering C-56.1.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (1) refuse every ADMINISTRATOR as a deliverer. Every refusal arm goes green.
 *       So the FOUNDER must deliver and COMMIT (§3), and so must an enrolled
 *       administrator who IS a joined participant of the project (§4).
 *   (2) check the signer and not the deliverer (or the reverse). §2 drives an
 *       outside administrator carrying a VALID OWNER'S signature — the signer
 *       check is satisfied and only the delivery check can refuse — and §1 drives
 *       a joined member carrying a NON-OWNER's signature — the delivery check is
 *       satisfied and only the signer check can refuse.
 *   (3) let the founder's route skip the SIGNER check too. §1 has the founder
 *       deliver a non-owner's signature, which must still be refused.
 *   (4) ask the delivery AFTER the idempotent retry. §5 re-sends a committed
 *       case's exact signature through an outside administrator: `existed: true`
 *       would be an authority answer given to somebody with none.
 * Every refusal is asserted to have WRITTEN NOTHING (the case document still
 * unratified, no published case), and every success to have committed.
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
import { CASE_AUTHORITY_CHECKS, PROJECT_AUTHORITY_CHECKS } from "../checks/bio-checks.mjs";
/* CORRECTED 2026-09-18 by CONDUCT #5 at the merge that landed REC-136 with UI-65: this suite was written against
   the pre-REC-136 conclude, which adopted no claim. INVESTIGATIVE-SESSION.md §7.1 item 6 now refuses a no-project
   conclude that names no reading (NO_CLAIM), so the concluded inquiry carries REC-136's ONE adoptable reading and
   the call names it, exactly as REC-136 corrected 27 suites. Nothing this suite asserts (case authority) moves. */
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- case-authority ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("case-authority: SKIPPED — ssh-keygen not on PATH; who may sign and deliver a case is only "
    + "evidence over REAL member signatures");
  process.exit(0);
}

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.CASE_AUTHORITY_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "admin-r137-bootstrap";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, VERSION: "test" },
}));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const init = body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) };
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`, init)).json());
};
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const NOT_OWNER_SIGNER = "CASE_SIGNER_NOT_AN_OWNER", NOT_IN = "PROJECT_ACT_NOT_A_PARTICIPANT";

try {

const dir = mkdtempSync(join(tmpdir(), "case-authority-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* THE STATEMENT, WRITTEN OUT IN ASCII rather than imported from src/sshsig.mjs:
   an expectation taken from the thing under test agrees with it for free. */
const signCase = (who, d) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify-case ${d.case_id} ${d.edition} ${d.doc_sha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};

/* ============================================================== FIXTURE */
/* THE FOUNDER: the claim step and its password session (DEC-33's route). */
const claimed = await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-137" });
if (!claimed || !claimed.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
const fl = await POST("op=login", { password: "founder-passphrase-137" });
if (!fl || !fl.token) throw new Error(`founder login: ${JSON.stringify(fl)}`);
const FOUNDER = fl.token;

const enrol = async (memberId, role, capabilities) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-passphrase-137` });
  if (!en || !en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} (memberadd: ${JSON.stringify(add)})`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-137` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* RUTH: an ENROLLED ADMINISTRATOR (the second, beside the founder). She holds the
   `publish` capability and a registered signing key, so every barrier this op had
   before REC-137 is one she passes. IRIS owns every project here. GUS is an
   ordinary member who JOINS each project as a participant who is not an owner.
   WEN is invited to one and never joins. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
const GUS = await enrol("gus", "member", ["contribute", "publish"]);
const WEN = await enrol("wen", "member", ["contribute", "publish"]);
/* VIC: a member in NO project here, holding `publish` — the caller a hidden
   project must read to exactly as a project that does not exist. */
const VIC = await enrol("vic", "member", ["contribute", "publish"]);
for (const who of ["iris", "gus", "ruth"]) {
  const reg = await POST(`op=signeradd&token=${ADM}`, { keyB64: mkKey(who), memberId: who, comment: `${who} laptop` });
  if (!reg || reg.ok === false) throw new Error(`signeradd ${who}: ${JSON.stringify(reg)}`);
}

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
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7) and a
   creation naming one is refused PROJECT_ID_SUPPLIED. `id` null creates with NO bundleId, `label` names
   the title, and the caller reads the id from the answer's `bundleId`. */
const promote = async (id, text, objectType, state, label = id) => {
  const r = await POST(`op=promote&token=${ADM}`, {
    ...(id ? { bundleId: id } : {}), base: null,
    snapKey: `20260918T${String(800000 + (++snapSeq)).slice(-6)}Z_${sha(label).slice(0, 8)}`,
    meta: { object_type: objectType, group: "believe-in-oakland",
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [] });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
const must = (what, r) => { if (!r || r.ok !== true) throw new Error(`${what}: ${JSON.stringify(r).slice(0, 600)}`); return r; };
/* One project owned by iris, with gus JOINED (not an owner), one concluded
   inquiry, and an unsigned case document authored by iris (op=publish, DEC-72 cl. 5). */
let seq = 0;
const authorCase = async ({ joinRuth = false, inviteWen = false } = {}) => {
  const n = String(9370 + (++seq));   /* a canonical id carries FOUR digits (C-2.8) */
  const info = `INFO-2026-${n}-memo`, lead = `INQ-2026-${n}-lead`;
  /* CORRECTED 2026-09-18 (REC-141, IC-158): the project's id is MINTED; the old id string is its name. */
  const name = `PROJ-2026-${n}-case`;
  const project = (await promote(null, projectFixtureMd(null, { created: NOW, updated: LATER, name }),
    "project", "investigating", name)).bundleId;
  must(`projectclaimowner ${project}`, await DO("projectclaimowner", { projectId: project, memberId: "iris" }));
  must("iris invites gus", await POST(`op=projectinvite&token=${IRIS}&projectId=${project}&handle=gus`));
  must("gus joins", await POST(`op=projectjoin&token=${GUS}&projectId=${project}`));
  if (joinRuth) {
    must("iris invites ruth", await POST(`op=projectinvite&token=${IRIS}&projectId=${project}&handle=ruth`));
    must("ruth joins", await POST(`op=projectjoin&token=${RUTH}&projectId=${project}`));
  }
  if (inviteWen) must("iris invites wen", await POST(`op=projectinvite&token=${IRIS}&projectId=${project}&handle=wen`));
  await promote(info, infoMd(info), "information", "collected");
  await promote(lead, withAdoptableReading(inquiryMd(lead, `Was the transfer ${lead} authorised?`, info)), "inquiry", "open");
  must(`conclude ${lead}`, await GET(`op=conclude&token=${IRIS}&target=${lead}`
    + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
    + adoptedVersionParam()));
  const pub = await POST(`op=publish&token=${IRIS}`, {
    project, targets: [lead], roles: allLoadBearing({ targets: [lead] }),
    scope: "Whether the FY2024 transfer was authorised, on the documents in hand.",
    statement: "This case covers the FY2024 transfer only, on the documents in hand at edition 1.",
    excluded: [], subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds that transfers should be adopted in public session." });
  if (!pub || pub.ok === false || !pub.caseDocument || !/^[0-9a-f]{64}$/.test(String(pub.caseDocument.doc_sha)))
    throw new Error(`publish ${project}: ${JSON.stringify(pub).slice(0, 900)}`);
  return { ...pub.caseDocument, project };
};
/* The record, read as the case's OWNER (standing in the project), so an UNSIGNED
   document answers; and the published manifest, read anonymously. */
const stateOf = async (d) => {
  const cd = await DO(`casedocument?case=${encodeURIComponent(d.case_id)}&edition=${d.edition}&viewer=member:iris`);
  const man = await GET("op=publishedmanifest");
  return { ratified: cd && cd.ratified, attestor: cd && (cd.attestor_member ?? null),
           published: ((man && man.cases) || []).some((c) => c.case_id === d.case_id) };
};
const UNTOUCHED = { ratified: false, attestor: null, published: false };
const ratify = (token, signer, d) => POST(`op=caseratify&token=${token}`,
  { caseId: d.case_id, edition: d.edition, expectedSha: d.doc_sha, sig: signCase(signer, d) });

const A = await authorCase({ inviteWen: true });
const B = await authorCase();
const C = await authorCase({ joinRuth: true });
const Dc = await authorCase();
/* E is the NON-OWNERS arms' own case, so a control arm that lets one of them
   commit cannot move any other arm's answer (break only the thing). */
/* SIGHT BEFORE ROLE (REC-138's ordering, asked for at REC-137's close by CONDUCT #5):
   a caller who cannot SEE the project must get the answer a never-minted case gets,
   byte for byte, so neither of this item's refusals may be reached by them. The
   never-minted answer is taken for E's id BEFORE E exists — the prediction is
   asserted below, not trusted — so the two are compared with nothing substituted. */
const rawOf = async (q, body) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body) });
  return { status: r.status, body: await r.text() };
};
/* CORRECTED 2026-09-19 (REC-151, IC-164 — Membership v2 §7, *"A MINTED ID CARRIES NO COUNT"*, BOB #16): E's id was
   PREDICTED as `CASE-<year>-0005`, the fifth number off `allocId`'s CASE counter. A new case's id is now OPAQUE (a
   CSPRNG suffix), so it cannot be predicted: the never-minted answer is taken at NEVER_ID, an id of the case shape the
   minter can never draw (its suffix is not four digits), and the comparison replaces each answer's OWN id with one
   placeholder — the only thing the two differ in by construction (`ratify-authority.test.mjs` §0's precedent); every
   other byte must match. */
const NEVER_ID = `CASE-${new Date().toISOString().slice(0, 4)}-never`;
const idless = (raw, id) => ({ ...raw, body: String(raw.body).split(id).join("<CASE-ID>") });
const NEVER = idless(await rawOf(`op=caseratify&token=${VIC}`, { caseId: NEVER_ID, edition: 1, expectedSha: "0".repeat(64), sig: "not-a-signature" }), NEVER_ID);
const E = await authorCase();
if (!/^CASE-\d{4}-\d{4}$/.test(String(E.case_id))) throw new Error(`E was minted ${E.case_id}, not an id of the case shape`);
t("the ground: five unsigned case documents authored by iris, each its own project's production, none committed",
  await Promise.all([A, B, C, Dc, E].map(stateOf)), [UNTOUCHED, UNTOUCHED, UNTOUCHED, UNTOUCHED, UNTOUCHED]);

/* ========================================= 0. SIGHT COMES BEFORE BOTH */
/* FIRST, while E is still unsigned: a ratified document is public and answers anybody,
   so this arm run after any commit of E would be measuring something else. */
console.log("\n--- 0. a caller who cannot SEE the project is answered as for a case that does not exist ---");
{
  const hidden = idless(await rawOf(`op=caseratify&token=${VIC}`, { caseId: E.case_id, edition: 1, expectedSha: "0".repeat(64), sig: "not-a-signature" }), E.case_id);
  t("SIGHT: vic (a member of NO project) asking to ratify E's UNSIGNED case answers BYTE FOR BYTE as for a case id never minted — neither C-56.1 nor C-57.1 is reachable by somebody who cannot see the project",
    [hidden.status, hidden.body === NEVER.body, /NO_CASE_DOCUMENT/.test(hidden.body)], [NEVER.status, true, true]);
  const withSig = await ratify(VIC, "iris", E);
  t("SIGHT: and carrying iris's VALID owner signature changes nothing — still the not-found, never a role refusal",
    [withSig && withSig.ok, codeOf(withSig)], [false, "NO_CASE_DOCUMENT"]);
  t("SIGHT: and nothing was written", await stateOf(E), UNTOUCHED);
}

/* ======================================= 1. AUTHORITY — NON-OWNERS ONLY */
console.log("\n--- 1. AUTHORITY — a case signed by NON-OWNERS only is refused, whoever delivers it ---");
{
  const r = await ratify(GUS, "gus", E);
  t("NON-OWNERS: gus (JOINED, not an owner) delivers his OWN signature — refused CASE_SIGNER_NOT_AN_OWNER; the delivery check passes, so only the signer check can refuse",
    [r && r.ok, codeOf(r), r && r.check, r && r.signer, r && r.project], [false, NOT_OWNER_SIGNER, "C-57.1", "gus", E.project]);
  t("NON-OWNERS: the refusal carries the canned translation (DEC-49)",
    r && r.translation, CASE_AUTHORITY_CHECKS[NOT_OWNER_SIGNER].translation);
  t("NON-OWNERS: and nothing was written — the case document is unratified and no case is published", await stateOf(E), UNTOUCHED);
  const f = await ratify(FOUNDER, "ruth", E);
  t("NON-OWNERS: the FOUNDER delivering ruth's signature (an administrator's, not an owner's) is refused the same way — DEC-33's route is carriage and never authority",
    [f && f.ok, codeOf(f), f && f.signer], [false, NOT_OWNER_SIGNER, "ruth"]);
  t("NON-OWNERS: and still nothing was written", await stateOf(E), UNTOUCHED);
}

/* ============================= 2. DELIVERY — AN OUTSIDE ADMINISTRATOR */
console.log("\n--- 2. DELIVERY — an enrolled administrator with NO role in the project is refused, even carrying an OWNER's valid signature ---");
{
  const r = await ratify(RUTH, "iris", A);
  t("OUTSIDE ADMINISTRATOR: ruth (enrolled admin, not in A's project) delivers iris's VALID OWNER signature — refused PROJECT_ACT_NOT_A_PARTICIPANT (REC-134's one check), act caseratify",
    [r && r.ok, codeOf(r), r && r.check, r && r.act, r && r.project], [false, NOT_IN, "C-56.1", "caseratify", A.project]);
  t("OUTSIDE ADMINISTRATOR: the refusal carries C-56.1's canned translation",
    r && r.translation, PROJECT_AUTHORITY_CHECKS[NOT_IN].translation);
  t("OUTSIDE ADMINISTRATOR: and nothing was written", await stateOf(A), UNTOUCHED);
  const w = await ratify(WEN, "iris", A);
  t("INVITED, NOT JOINED: wen (invited to A's project, never joined — view rights only, §7.5) delivers iris's signature — refused PROJECT_ACT_NOT_A_PARTICIPANT",
    [w && w.ok, codeOf(w)], [false, NOT_IN]);
  t("INVITED, NOT JOINED: and nothing was written", await stateOf(A), UNTOUCHED);
}

/* ================================== 3. WHAT COMMITS — AN OWNER'S SIGNATURE */
console.log("\n--- 3. ALLOWED — an OWNER's signature commits, delivered by the owner, by a project member, or by the FOUNDER ---");
{
  const r = await ratify(GUS, "iris", A);
  t("ALLOWED: a PROJECT MEMBER delivers — gus (joined) carries iris's owner signature and the case COMMITS, recording iris as signer and gus as deliverer",
    [r && r.ok, r && r.attestor && r.attestor.member, r && r.deliveredBy && r.deliveredBy.kind, r && r.deliveredBy && r.deliveredBy.member],
    [true, "iris", "member", "gus"]);
  t("ALLOWED (member): and it is committed — ratified under iris and published", await stateOf(A),
    { ratified: true, attestor: "iris", published: true });
  const f = await ratify(FOUNDER, "iris", B);
  t("ALLOWED: the FOUNDER delivers (DEC-33's interim route) — iris's owner signature, the case COMMITS, deliverer recorded as the founder",
    [f && f.ok, f && f.attestor && f.attestor.member, f && f.deliveredBy && f.deliveredBy.kind], [true, "iris", "founder"]);
  t("ALLOWED (founder): and it is committed", await stateOf(B), { ratified: true, attestor: "iris", published: true });
  const o = await ratify(IRIS, "iris", Dc);
  t("ALLOWED: the OWNER delivers her own signature and the case COMMITS",
    [o && o.ok, o && o.attestor && o.attestor.member, o && o.deliveredBy && o.deliveredBy.member], [true, "iris", "iris"]);
  t("ALLOWED (owner): and it is committed", await stateOf(Dc), { ratified: true, attestor: "iris", published: true });
}

/* ======== 4. OVER-STRICTNESS — AN ADMINISTRATOR WITH A ROLE IS A MEMBER WITH A ROLE */
console.log("\n--- 4. ALLOWED — an enrolled administrator who IS a joined participant delivers like any member ---");
{
  const r = await ratify(RUTH, "iris", C);
  t("ALLOWED: ruth, an enrolled administrator JOINED to C's project, delivers iris's owner signature and the case COMMITS — the rule is her role in the project, never her administrator role",
    [r && r.ok, r && r.attestor && r.attestor.member, r && r.deliveredBy && r.deliveredBy.member], [true, "iris", "ruth"]);
  t("ALLOWED (joined administrator): and it is committed", await stateOf(C), { ratified: true, attestor: "iris", published: true });
}

/* ============================ 5. THE RETRY IS NOT AN AUTHORITY ANSWER */
console.log("\n--- 5. the idempotent retry does not answer an outside administrator ---");
{
  /* A's committed signature, re-sent byte-for-byte (ed25519 signing here is
     deterministic, so the same key over the same statement is the same bytes). */
  const r = await ratify(RUTH, "iris", A);
  t("RETRY: ruth re-sends the exact committed signature on A — refused PROJECT_ACT_NOT_A_PARTICIPANT, never `existed: true`",
    [r && r.ok, codeOf(r), r && r.existed === true], [false, NOT_IN, false]);
  const g = await ratify(GUS, "iris", A);
  t("RETRY: the same bytes from a member of the project are the ordinary retry — `existed: true`, nothing written",
    [g && g.ok, g && g.existed], [true, true]);
}

/* ================================= 6. THE REFUSALS ARE NAMED BY LITERAL */
console.log("\n--- 6. the catalogue rows ---");
/* CORRECTED 2026-09-18 by REC-140: the region MOVED into `#caseAuthority`, the one helper
   `ratifyCaseDocument` and `op=ratify`'s pinned-finding path both call (D-429). The old
   `where` named the function the rule used to live in, and would now point at no region. */
t("C-57.1 is catalogued with its region: CASE_SIGNER_NOT_AN_OWNER in #caseAuthority > is-case-signer-owner",
  [CASE_AUTHORITY_CHECKS.CASE_SIGNER_NOT_AN_OWNER.check, CASE_AUTHORITY_CHECKS.CASE_SIGNER_NOT_AN_OWNER.where],
  ["C-57.1", "src/store.mjs #caseAuthority > is-case-signer-owner"]);

/* ================= 7. op=ratify OF A PROJECT BUNDLE — CLOSED BY REC-140 (D-429) */
console.log("\n--- 7. op=ratify of a PROJECT BUNDLE, driven against the same rule (the brief's third question) ---");
{
  /* CORRECTED 2026-09-18 by REC-140, at its site and not exempted. This arm was
     written by REC-137 to PIN D-429 AS MEASURED: an enrolled administrator with no
     role in a project carried the signature of a member with no role in it either,
     and the PROJECT'S OWN DOCUMENT was PUBLISHED under that member's name. It was
     right when written — the §7 bullet decided a CASE ratification and the design
     did not say whether a project bundle may be published at all. BOB #15 then
     ruled (BIO_Publication_v0_1.md §3 rule 2 and its note): a project's document is
     not a finding, a project publishes through its cases, so op=ratify REFUSES a
     project bundle outright (C-58.1 RATIFY_PROJECT_BUNDLE) — whoever signs. The
     same act therefore now answers that refusal and publishes nothing; the full
     treatment (the owner herself refused, sight before type, the finding rules) is
     `ratify-authority.test.mjs`'s. `updated` equals `created` so the catalog owes
     no Session Log entry (C-13.2) and the arm would reach the act, not the gate. */
  /* CORRECTED 2026-09-18 (REC-141, IC-158): the project's id is MINTED and read from the answer; the
     sha signed below is still read back from op=list, i.e. the sha of the bytes the plane wrote. */
  const P = (await promote(null, projectFixtureMd(null, { created: NOW, updated: NOW, name: "PROJ-2026-9399-bundle" }),
    "project", "investigating", "PROJ-2026-9399-bundle")).bundleId;
  must(`projectclaimowner ${P}`, await DO("projectclaimowner", { projectId: P, memberId: "iris" }));
  const listed = await GET(`op=list&token=${IRIS}&limit=1000`);
  const s = ((Array.isArray(listed) ? listed : (listed && listed.bundles) || []).find((b) => b.bundle_id === P) || {}).bundle_sha;
  const f = join(dir, `pstmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${P} ${s}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "gus"), "-n", "bio-ratify", f], { stdio: ["ignore", "ignore", "ignore"] });
  const r = await POST(`op=ratify&token=${RUTH}`, { bundleId: P, expectedSha: s, sig: readFileSync(f + ".sig", "utf8") });
  const eds = await GET(`op=publishededitions&token=${ADM}&id=${P}`);
  t("D-429 CLOSED (REC-140): ruth (an enrolled administrator in NO role in the project) delivering gus's signature (NOT an owner, NOT a participant) over a PROJECT bundle through op=ratify is REFUSED RATIFY_PROJECT_BUNDLE, and nothing is published",
    [r && r.ok, codeOf(r), r && r.check, ((eds && eds.editions) || []).length], [false, "RATIFY_PROJECT_BUNDLE", "C-58.1", 0]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
}
await mf.dispose();
console.log(`\ncase-authority: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
