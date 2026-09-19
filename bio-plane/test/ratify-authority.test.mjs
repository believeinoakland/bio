/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/ratify-authority.control.mjs` — deliberately NOT a `.test.mjs`, because it runs this suite against PATCHED COPIES of the sources and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/ratify-authority.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once) and the real sources are hashed before and after; what each arm MUST fail is declared in the driver before it arms. (a) `baseline` — nothing armed, MUST be green. (b) `readmit-project-bundles` — the C-58.1 type refusal disarmed: the PROJECT BUNDLE arms publish, so they MUST fail, and nothing else. (c) `no-owner-check` — C-57.1's owner question dropped in `#caseAuthority`: the NON-OWNER arms publish. (d) `no-delivery-check` — the delivery question dropped: the OUTSIDE ADMINISTRATOR, INVITED, UNINVITED, nothing-published and ruth's RETRY arms. (e) `type-before-sight` — role before visibility: the ratifier's viewer not sent to the gate facts, so a hidden project's bundle reaches the type refusal: only the two SIGHT arms that compare answers. (f) `refuse-every-finding` — the liar: every pinned finding refused: every refusal arm STAYS GREEN and the ALLOWED arms and the joined member's retry MUST fail. (g) `authority-after-retry` — the questions asked only for new bytes: only ruth's RETRY arm.
   RESULTS, RUN 2026-09-18 by the REC-140 worker (worktree agent-a761302b28f105764, base ff3a4cea + this item; real src/index.mjs 661,904 B sha256 a1c6cb7448bb, src/store.mjs 2,614,766 B sha256 e20e357f1a7c, untouched: YES): (a) 32/0 · (b) 27/5 · (c) 28/4 · (d) 26/6 · (e) 30/2 · (f) 25/7 · (g) 31/1 — every arm AS DECLARED on its first run. THE PRE-ITEM MEASUREMENT (this suite against the pristine src/ of ff3a4cea, before §6's catalogue rows existed): 13 pass / 19 fail — the owner's own project bundle, the founder's delivery of it and ruth's delivery of gus's signature over it all PUBLISHED (ok:true; gus named attestor); a hidden project's bundle answered vic 409 RATIFY_STALE (naming its real sha) instead of the never-minted 404 ABSENT, and with a valid sha GATE_REFUSED C-13.1 "bundle.md is missing"; a pinned finding signed by gus (joined, not an owner) and by ruth (via the founder) both PUBLISHED; ruth (an outside administrator) DELIVERED iris's signature on A's finding and it PUBLISHED, and wen's and vic's deliveries were then answered ok:true off that commit; the §7 outside-a-case arms passed then and pass now (unchanged by this item, on purpose).
 * =========================================================================
 * REC-140 / D-429 / IC-157 — `op=ratify` UNDER PUBLICATION RULE 2.
 *
 * BOB #15, 2026-09-18, applying `BIO_Publication_v0_1.md` §3 rule 2 (*"Only findings
 * that are part of a project can be published"*) to D-429:
 *   - a PROJECT's own document is not a finding, so `op=ratify` REFUSES a project
 *     bundle outright — a project publishes through its cases;
 *   - wherever `op=ratify` ratifies a FINDING it takes case ratification's rules
 *     (Membership v2 §7): an OWNER of the publishing project signs (C-57.1's
 *     shape), and the deliverer is the FOUNDER or a JOINED member (C-56.1's);
 *   - a caller who cannot see the project is answered exactly as for one that does
 *     not exist, never with a statement about its contents (REC-138's class).
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (1) refuse every op=ratify. Every refusal arm goes green — so §4 must COMMIT a
 *       finding signed by an owner and delivered by a joined member, by the founder
 *       and by the owner herself.
 *   (2) refuse a project bundle only when the signer is not its owner. §1 has the
 *       OWNER sign and deliver her own project's document, and it must be refused.
 *   (3) check the signer and not the deliverer (or the reverse). §2 carries a
 *       NON-OWNER's signature through a joined member (only the signer check can
 *       refuse); §3 carries an OWNER's signature through an outside administrator
 *       (only the delivery check can refuse).
 *   (4) answer a hidden project's bundle with the type refusal. §0 compares the RAW
 *       answer against a never-minted id's, taken before the id was minted.
 * Every refusal is asserted to have PUBLISHED NOTHING (no edition on the bundle's
 * own chain), and every success to have published.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectFixtureMd, allLoadBearing } from "./publishingproject.mjs";
/* REC-136 (INVESTIGATIVE-SESSION §7.1 item 6): a no-project conclude must NAME the reading it adopts. */
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- ratify-authority ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("ratify-authority: SKIPPED — who may sign and deliver a finding is only evidence over REAL member signatures");
  process.exit(0);
}

/* The control driver points this at an armed copy of the sources (and of checks/). */
const SRC_DIR = process.env.RATIFY_AUTHORITY_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const CHECKS = await import(pathToFileURL(join(SRC_DIR, "..", "checks", "bio-checks.mjs")).href);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "admin-r140-bootstrap";
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, VERSION: "test" },
});
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
const rawOf = async (q, body) => {
  const r = await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body) });
  return { status: r.status, body: await r.text() };
};
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const NOT_OWNER_SIGNER = "CASE_SIGNER_NOT_AN_OWNER", NOT_IN = "PROJECT_ACT_NOT_A_PARTICIPANT";
const PROJECT_BUNDLE = "RATIFY_PROJECT_BUNDLE";

try {

const dir = mkdtempSync(join(tmpdir(), "ratify-authority-"));
const mkKey = (who) => {
  execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(dir, who), "-q"]);
  return readFileSync(join(dir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
};
/* THE STATEMENTS, WRITTEN OUT IN ASCII rather than imported from src/sshsig.mjs:
   an expectation taken from the thing under test agrees with it for free. */
const signWith = (who, text) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, text);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, who), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const signCase = (who, d) => signWith(who, `bio-ratify-case ${d.case_id} ${d.edition} ${d.doc_sha}\n`);
const signBundle = (who, id, s) => signWith(who, `bio-ratify ${id} ${s}\n`);

/* ============================================================== FIXTURE */
const claimed = await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-140" });
if (!claimed || !claimed.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
const fl = await POST("op=login", { password: "founder-passphrase-140" });
if (!fl || !fl.token) throw new Error(`founder login: ${JSON.stringify(fl)}`);
const FOUNDER = fl.token;
const enrol = async (memberId, role, capabilities) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-passphrase-140` });
  if (!en || !en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} (memberadd: ${JSON.stringify(add)})`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-140` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* RUTH: an enrolled ADMINISTRATOR in no project here. IRIS owns every project. GUS
   joins each as a participant who is not an owner. WEN is invited and never joins.
   VIC is in no project: the caller a hidden project must read to as nonexistent. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
const IRIS = await enrol("iris", "member", ["contribute", "publish"]);
const GUS = await enrol("gus", "member", ["contribute", "publish"]);
const WEN = await enrol("wen", "member", ["contribute", "publish"]);
const VIC = await enrol("vic", "member", ["contribute", "publish"]);
for (const who of ["iris", "gus", "ruth", "vic"]) {
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
const promote = async (id, text, objectType, state) => {
  const r = await POST(`op=promote&token=${ADM}`, {
    bundleId: id, base: null,
    snapKey: `20260918T${String(900000 + (++snapSeq)).slice(-6)}Z_${sha(id).slice(0, 8)}`,
    meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [] });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
const must = (what, r) => { if (!r || r.ok !== true) throw new Error(`${what}: ${JSON.stringify(r).slice(0, 600)}`); return r; };
const shaOf = async (id) => {
  const listed = await GET(`op=list&token=${ADM}&limit=1000`);
  return ((Array.isArray(listed) ? listed : (listed && listed.bundles) || []).find((b) => b.bundle_id === id) || {}).bundle_sha;
};
/* How many editions of this bundle's OWN chain are published — read through a
   different op from the one under test. */
const editionsOf = async (id) => {
  const r = await GET(`op=publishededitions&token=${ADM}&id=${encodeURIComponent(id)}`);
  return ((r && r.editions) || []).length;
};
const ratify = async (token, signer, id) => {
  const s = await shaOf(id);
  return POST(`op=ratify&token=${token}`, { bundleId: id, expectedSha: s, sig: signBundle(signer, id, s) });
};

/* One project owned by iris with gus JOINED (not an owner), wen optionally invited;
   one concluded inquiry; a case document authored by iris and RATIFIED by iris, so
   the finding's bytes are PINNED by a published case edition. */
let seq = 0;
const makeCase = async ({ inviteWen = false, ratifyTheCase = true } = {}) => {
  const n = String(9400 + (++seq));
  const project = `PROJ-2026-${n}-case`, info = `INFO-2026-${n}-memo`, lead = `INQ-2026-${n}-lead`;
  await promote(project, projectFixtureMd(project, { created: NOW, updated: LATER }), "project", "investigating");
  must(`projectclaimowner ${project}`, await DO("projectclaimowner", { projectId: project, memberId: "iris" }));
  must("iris invites gus", await POST(`op=projectinvite&token=${IRIS}&projectId=${project}&handle=gus`));
  must("gus joins", await POST(`op=projectjoin&token=${GUS}&projectId=${project}`));
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
  if (!pub || pub.ok === false || !pub.caseDocument)
    throw new Error(`publish ${project}: ${JSON.stringify(pub).slice(0, 900)}`);
  const d = pub.caseDocument;
  if (ratifyTheCase)
    must(`caseratify ${d.case_id}`, await POST(`op=caseratify&token=${IRIS}`,
      { caseId: d.case_id, edition: d.edition, expectedSha: d.doc_sha, sig: signCase("iris", d) }));
  return { project, info, lead, case_id: d.case_id };
};

/* ========================================= 0. SIGHT COMES BEFORE EVERYTHING */
console.log("\n--- 0. a caller who cannot SEE the project is answered as for a bundle that does not exist ---");
const HIDDEN = "PROJ-2026-9490-hidden";
/* The never-minted answer, taken BEFORE the id exists, with the same body. */
const BODY = { bundleId: HIDDEN, expectedSha: "0".repeat(64), sig: "not-a-signature" };
const NEVER = await rawOf(`op=ratify&token=${VIC}`, BODY);
await promote(HIDDEN, projectFixtureMd(HIDDEN, { created: NOW, updated: NOW }), "project", "investigating");
must(`projectclaimowner ${HIDDEN}`, await DO("projectclaimowner", { projectId: HIDDEN, memberId: "iris" }));
{
  const hidden = await rawOf(`op=ratify&token=${VIC}`, BODY);
  t("SIGHT: vic (in NO project) ratifying iris's hidden PROJECT bundle answers BYTE FOR BYTE as for an id never minted — never the type refusal, never a gate finding about its contents",
    [hidden.status, hidden.body === NEVER.body], [NEVER.status, true]);
  t("SIGHT: and the never-minted answer is the bundle-level not-found",
    [NEVER.status, /"ABSENT"/.test(NEVER.body)], [404, true]);
  const s = await shaOf(HIDDEN);
  const withSig = await rawOf(`op=ratify&token=${VIC}`, { bundleId: HIDDEN, expectedSha: s, sig: signBundle("iris", HIDDEN, s) });
  const neverSigned = JSON.parse(NEVER.body);
  t("SIGHT: and carrying the OWNER's valid signature over the real sha changes nothing — still the not-found (never 'bundle.md is missing', REC-53's class)",
    [withSig.status, codeOf(rP(JSON.parse(withSig.body))), /bundle\.md is missing/.test(withSig.body)],
    [NEVER.status, codeOf(rP(neverSigned)), false]);
  t("SIGHT: and nothing was published", await editionsOf(HIDDEN), 0);
}

/* ======================================== 1. A PROJECT BUNDLE IS REFUSED OUTRIGHT */
console.log("\n--- 1. op=ratify REFUSES a project bundle, whoever signs and whoever delivers ---");
{
  const r = await ratify(IRIS, "iris", HIDDEN);
  t("PROJECT BUNDLE: iris, the project's OWNER, signs and delivers her own project's document — refused RATIFY_PROJECT_BUNDLE (a project publishes through its cases)",
    [r && r.ok, codeOf(r), typeof (r && r.check), r && r.bundleId], [false, PROJECT_BUNDLE, "string", HIDDEN]);
  const row = CHECKS.RATIFY_SCOPE_CHECKS && CHECKS.RATIFY_SCOPE_CHECKS[PROJECT_BUNDLE];
  t("PROJECT BUNDLE: the refusal carries its catalogued C-number and canned translation (DEC-49)",
    [!!row, r && r.check, r && r.translation], [true, row && row.check, row && row.translation]);
  const f = await ratify(FOUNDER, "iris", HIDDEN);
  t("PROJECT BUNDLE: the FOUNDER delivering the owner's signature is refused the same way",
    [f && f.ok, codeOf(f)], [false, PROJECT_BUNDLE]);
  const d = await ratify(RUTH, "gus", HIDDEN);
  t("PROJECT BUNDLE (D-429's own measurement, CORRECTED 2026-09-18 from case-authority §7 where it was pinned as PUBLISHED): ruth (outside administrator) carrying gus's signature (neither owner nor participant) — refused, and gus is named nowhere",
    [d && d.ok, codeOf(d), JSON.stringify(d).includes("\"attestor\"")], [false, PROJECT_BUNDLE, false]);
  t("PROJECT BUNDLE: and nothing was published by any of the three", await editionsOf(HIDDEN), 0);
}

const A = await makeCase({ inviteWen: true });
const B = await makeCase();
const C = await makeCase();
const E = await makeCase();   /* the NON-OWNERS arms' own finding: break only the thing */
t("the ground: four published case editions, each finding PINNED and none of the findings ratified yet",
  await Promise.all([A, B, C, E].map((x) => editionsOf(x.lead))), [0, 0, 0, 0]);

/* ======================================= 2. AUTHORITY — A NON-OWNER'S SIGNATURE */
console.log("\n--- 2. AUTHORITY — a finding signed by a NON-OWNER is refused, whoever delivers it ---");
{
  const r = await ratify(GUS, "gus", E.lead);
  t("NON-OWNER: gus (JOINED, not an owner) delivers his OWN signature on E's finding — refused CASE_SIGNER_NOT_AN_OWNER; the delivery check passes, so only the signer check can refuse",
    [r && r.ok, codeOf(r), r && r.check, r && r.signer, r && r.project], [false, NOT_OWNER_SIGNER, "C-57.1", "gus", E.project]);
  t("NON-OWNER: the refusal carries C-57.1's canned translation",
    r && r.translation, CHECKS.CASE_AUTHORITY_CHECKS[NOT_OWNER_SIGNER].translation);
  const f = await ratify(FOUNDER, "ruth", E.lead);
  t("NON-OWNER: the FOUNDER delivering ruth's signature (an administrator's, not an owner's) is refused the same way — the founder's route is carriage, never authority",
    [f && f.ok, codeOf(f), f && f.signer], [false, NOT_OWNER_SIGNER, "ruth"]);
  t("NON-OWNER: and nothing was published", await editionsOf(E.lead), 0);
}

/* ============================ 3. DELIVERY — AN OUTSIDE ADMINISTRATOR, AN INVITEE */
console.log("\n--- 3. DELIVERY — an administrator with NO role in the project is refused, even carrying an OWNER's signature ---");
{
  const r = await ratify(RUTH, "iris", A.lead);
  t("OUTSIDE ADMINISTRATOR: ruth (enrolled admin, not in A's project) delivers iris's VALID OWNER signature on A's finding — refused PROJECT_ACT_NOT_A_PARTICIPANT, act ratify",
    [r && r.ok, codeOf(r), r && r.check, r && r.act, r && r.project], [false, NOT_IN, "C-56.1", "ratify", A.project]);
  t("OUTSIDE ADMINISTRATOR: the refusal carries C-56.1's canned translation",
    r && r.translation, CHECKS.PROJECT_AUTHORITY_CHECKS[NOT_IN].translation);
  const w = await ratify(WEN, "iris", A.lead);
  t("INVITED, NOT JOINED: wen (view rights only, §7.5) delivers iris's signature — refused PROJECT_ACT_NOT_A_PARTICIPANT",
    [w && w.ok, codeOf(w)], [false, NOT_IN]);
  const v = await ratify(VIC, "iris", A.lead);
  t("UNINVITED: vic (no role; the case is PUBLIC, so the project id is already public) delivers iris's signature — refused PROJECT_ACT_NOT_A_PARTICIPANT",
    [v && v.ok, codeOf(v)], [false, NOT_IN]);
  t("DELIVERY: and nothing was published", await editionsOf(A.lead), 0);
}

/* ================================= 4. WHAT COMMITS — AN OWNER'S SIGNATURE */
console.log("\n--- 4. ALLOWED — an OWNER's signature publishes the finding, delivered by a joined member, by the FOUNDER, or by the owner ---");
{
  const r = await ratify(GUS, "iris", A.lead);
  t("ALLOWED: gus (JOINED) carries iris's owner signature and A's finding is PUBLISHED, recording iris as attestor and gus as deliverer",
    [r && r.ok, r && r.attestor, r && r.deliveredBy && r.deliveredBy.member], [true, "iris", "gus"]);
  t("ALLOWED (joined member): the finding's chain holds one edition", await editionsOf(A.lead), 1);
  const f = await ratify(FOUNDER, "iris", B.lead);
  t("ALLOWED: the FOUNDER delivers iris's owner signature (DEC-33's interim route) and B's finding is PUBLISHED",
    [f && f.ok, f && f.attestor, f && f.deliveredBy && f.deliveredBy.kind], [true, "iris", "founder"]);
  t("ALLOWED (founder): published", await editionsOf(B.lead), 1);
  const o = await ratify(IRIS, "iris", C.lead);
  t("ALLOWED: the OWNER delivers her own signature and C's finding is PUBLISHED",
    [o && o.ok, o && o.attestor, o && o.deliveredBy && o.deliveredBy.member], [true, "iris", "iris"]);
  t("ALLOWED (owner): published", await editionsOf(C.lead), 1);
}

/* ============================ 5. THE RETRY IS NOT AN AUTHORITY ANSWER */
console.log("\n--- 5. the idempotent retry does not answer an outside administrator ---");
{
  const r = await ratify(RUTH, "iris", A.lead);
  t("RETRY: ruth re-sends a valid owner signature over A's already-published bytes — refused PROJECT_ACT_NOT_A_PARTICIPANT, never `existed: true`",
    [r && r.ok, codeOf(r), r && r.existed === true], [false, NOT_IN, false]);
  const g = await ratify(GUS, "iris", A.lead);
  t("RETRY: the same act by a joined member is the ordinary retry — ok, `existed: true`, still one edition",
    [g && g.ok, g && g.existed, await editionsOf(A.lead)], [true, true, 1]);
}

/* ============================ 6. THE CATALOGUE ROWS */
console.log("\n--- 6. the catalogue rows ---");
{
  const row = CHECKS.RATIFY_SCOPE_CHECKS && CHECKS.RATIFY_SCOPE_CHECKS[PROJECT_BUNDLE];
  t("RATIFY_PROJECT_BUNDLE is catalogued with a C-number and a region in op=ratify",
    [!!row, row && /^C-\d+\.1$/.test(row.check), row && row.where], [true, true, "src/index.mjs fetch > is-ratify-project-bundle"]);
  t("C-57.1's region moved into the ONE helper both ratify paths call",
    CHECKS.CASE_AUTHORITY_CHECKS[NOT_OWNER_SIGNER].where, "src/store.mjs #caseAuthority > is-case-signer-owner");
}

/* ================ 7. OUTSIDE A CASE — MEASURED AND STATED, NOT CHANGED BY THIS ITEM */
console.log("\n--- 7. what op=ratify publishes OUTSIDE a case (the ruling does not cover it; pinned as measured) ---");
{
  /* The brief: "If op=ratify can publish something OUTSIDE a case that the ruling
     does not cover, STOP that part and report it." It can, and these pin it AS
     MEASURED so that whoever rules on it turns these red and corrects them here.
     Publication rule 2 (BIO_Publication_v0_1.md §3) says only findings that are
     part of a project can be published; neither of these is. */
  const n = "9480";
  const info = `INFO-2026-${n}-loose`, lead = `INQ-2026-${n}-loose`;
  /* `last_updated` equals `created` and `source_status` is stated, so the catalog
     owes nothing (C-13.2, C-2.7) and the arm reaches the act rather than the gate. */
  await promote(info, infoMd(info).replace(`last_updated: "${LATER}"`, `last_updated: "${NOW}"`)
    .replace("criticality: supporting", "criticality: supporting\nsource_status: unchanged"), "information", "collected");
  /* The inquiry is minted BEFORE its information is published, because a leg on a
     published bundle must be inherited (C-21.2) — which is not this arm's subject. */
  await promote(lead, withAdoptableReading(inquiryMd(lead, "Was the loose transfer authorised?", info)), "inquiry", "open");
  must(`conclude ${lead}`, await GET(`op=conclude&token=${IRIS}&target=${lead}`
    + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
    + adoptedVersionParam()));
  /* The inquiry first: once its information is published, the gate asks for an
     inherited leg (C-21.2), which is not this arm's subject. */
  const l = await ratify(VIC, "vic", lead);
  t("OUTSIDE A CASE (KNOWN, not closed): a concluded INQUIRY in no case and no project is published through op=ratify by vic under his own key",
    [l && l.ok, l && l.attestor, await editionsOf(lead)], [true, "vic", 1]);
  /* A FINDING PREPARED INTO A CASE WHOSE DOCUMENT IS NOT YET RATIFIED. Until
     op=caseratify commits the pins, `publish()` holds no case relation for these
     bytes (`#pinnedCaseEditionsOf` joins published_cases), so the finding is
     published as a LOOSE bundle — outside any case — and the rule this item applies
     at a pinned finding is not reached. Stated and pinned; not closed here. */
  const P = await makeCase({ ratifyTheCase: false });
  const p = await ratify(GUS, "gus", P.lead);
  t("OUTSIDE A CASE (KNOWN, not closed): a finding PREPARED into iris's case, before the case document is ratified, is published by gus (not an owner) under his own key — the ceremony's order is not enforced",
    [p && p.ok, p && p.attestor, await editionsOf(P.lead)], [true, "gus", 1]);
  const i = await ratify(VIC, "vic", info);
  t("OUTSIDE A CASE (KNOWN, not closed): an INFORMATION bundle in no case is published through op=ratify by any member holding a registered key (vic, in no project)",
    [i && i.ok, i && i.attestor, await editionsOf(info)], [true, "vic", 1]);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
}
await mf.dispose();
console.log(`\nratify-authority: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
