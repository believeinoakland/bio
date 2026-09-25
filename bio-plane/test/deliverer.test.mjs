/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/deliverer.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES (src/index.mjs, src/store.mjs) while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/deliverer.control.mjs [arm]`. Each arm armed ALONE and restored from a uniquely-named per-arm pristine copy verified by sha256 AND byte comparison (never `git checkout --`). DECLARED BEFORE ARMING — (a) `baseline`, nothing armed: MUST be green. (b) `fromsig` — THE LIAR THE ROW NAMES: at both acts the deliverer is taken from the SIGNATURE (`member:<the signer's member id>`) instead of from the session: the founder-delivered case document and the founder-delivered bundle then record iris, and gus's delivery records iris, so every DELIVERED arm MUST FAIL (the answers, the read-backs, the container, the public reads) and the structural pin that both acts hand the SESSION to `deliveringPrincipal` MUST FAIL; the legacy arms and the ground STAY GREEN. (c) `backfill` — the legacy liar: the store's one read chokepoint coalesces a NULL deliverer to the signer: both LEGACY arms MUST FAIL, and THE TABLE with them (a back-filled legacy row reads `member:iris` beside signer iris — the first declaration omitted the table and was corrected after its run; the subject was right, the declaration was not), and nothing else. (d) `session-member` — the deliverer taken from `sessMember` (the folded string) instead of the session ROW: the founder's deliveries then record `member:admin`, a member nobody enrolled, so the FOUNDER arms MUST FAIL while gus's delivery STAYS GREEN — which is what tells "from the session" from "from the right field of the session". RESULTS: see the RESULTS line below, written from the harness's own output.
   RESULTS, RUN 2026-09-18 in worktree agent-a01d041e19ab1ad65, every restore byte-identical (src/index.mjs 623,578 B sha256 cc60e5c87b7d…, src/store.mjs 2,430,967 B sha256 dc9188affdf9…): baseline 17/0 · fromsig 6/11 · backfill 14/3 · session-member 10/7 — ALL FOUR AS DECLARED, no arm failed to arm. RE-RUN on the source merged with origin/main e1434b06 (commit cf0480a5; src/index.mjs 632,230 B sha256 e4ed28f6b104…, src/store.mjs 2,490,761 B sha256 9e03344a86a1…): the same four figures, all as declared, every restore byte-identical.
   ADDED 2026-09-18 by REC-128's merge fix (the founder's standing for an UNSIGNED case document, a semantic conflict with REC-130), two arms: (e) `founder-standing` — `sessionCaseViewer` loses its founder line, so a founder session folds to `member:admin` exactly as both case reads spelled it before the fix: DECLARED to fail the founder's op=casedocument read, the founder's case delivery, and everything downstream of the case never being ratified (caseDoc, pubcase, all three CONTAINER arms), with vera's two STANDING arms and the loose/gus deliveries green. (f) `everyone-admin` — the over-broad fix, every session resolved to the root-administrator viewer: ONLY vera's arms can tell it from the right fix; declared to fail vera's two STANDING arms plus caseDoc/pubcase/container (vera's delivery then SUCCEEDS and the record names her) — that declaration was CORRECTED once after its first run omitted the downstream three, the instrument's error recorded at the arm. RUN 2026-09-18 in worktree agent-a2c230e047820e35a on the merged tree, every restore byte-identical (src/index.mjs 640,589 B sha256 80058a9e12c1…, src/store.mjs 2,495,915 B sha256 faa877d28a16…): baseline 20/0 · fromsig 9/11 · backfill 17/3 · session-member 13/7 · founder-standing 13/7 · everyone-admin 15/5 — ALL SIX AS DECLARED. RE-POINTED 2026-09-18 by REC-132 (worktree agent-a0f6ffd4522bb36bd): `sessionCaseViewer` became `resolveSession`, so arms (e) and (f) now arm its VISIBILITY line (`VIEWER_LINE` in the driver) — the same variable at its new spelling. Re-run on that tree (src/index.mjs 645,037 B sha256 2bc646dcc189…): baseline 20/0 · fromsig 9/11 · backfill 17/3 · session-member 13/7 · founder-standing 13/7 · everyone-admin 15/5 — ALL SIX AS DECLARED, every restore byte-identical. RE-RUN 2026-09-19 by the D-431 worker: on the PRISTINE base 7042404e (scratch worktree) session-member 11/9 and everyone-admin 18/2 were already NOT AS DECLARED (stale since REC-140's C-56.1 delivery check); on D-431's tree, after §5/§6 were corrected to ratify the case's EVIDENCE, the three declarations were corrected in the driver with their reasons and every arm re-run: baseline 20/0 · fromsig 9/11 · backfill 17/3 · session-member 8/12 · founder-standing 8/12 · everyone-admin 18/2 — ALL SIX AS DECLARED, every restore byte-identical (src/index.mjs 663,888 B sha256 7d80fc4e243a…, src/store.mjs 2,647,601 B sha256 8cf9feabd6a6…).
 * =========================================================================
 * REC-128 — THE RECORD STATES WHO AUTHORISED AND WHO DELIVERED (BOB #14,
 * 2026-09-18, the honesty half of D-421).
 *
 * REC-125 closed the bearer path: `op=ratify` and `op=caseratify` are delivered
 * only by a HUMAN's own authenticated session. BOB #14 then ruled that the
 * founder's password session STAYS ALLOWED — it is a human, and it is the only
 * live publishing route (DEC-33). So one act can carry TWO principals: the
 * member whose key SIGNED (who authorised) and the session that DELIVERED it.
 * Before this item the record named only the signer, so a founder-delivered
 * ratification of iris's signature read exactly like iris publishing.
 *
 * HOW A LIAR WOULD SATISFY THIS, stated before what it checks:
 *   (1) copy the signer into `delivered_by`. Every member-delivers-own-signature
 *       fixture is green under it, because there the two names coincide. So the
 *       fixture never lets them coincide: the FOUNDER delivers iris's signature
 *       at BOTH acts, and GUS (a member) delivers iris's signature at op=ratify.
 *   (2) back-fill a legacy row from its signer. Green on every new row. So two
 *       LEGACY rows are written exactly as a pre-REC-128 plane wrote them — the
 *       store's own committers called with no deliverer — and must read back
 *       UNDETERMINED, stated, with the signer still named beside it.
 *   (3) read the deliverer off `sessMember`, which folds the founder's `admin`
 *       role and a member enrolled as `admin` into one string. Green for every
 *       member; the founder arms catch it.
 * Every read a ratification is served through is checked, not one: the act's
 * own answer, op=casedocument, op=publishedlist, op=publishededitions,
 * op=publishedcase, and the case CONTAINER that travels (read from the
 * published bucket, the bytes a stranger holds).
 *
 * WHY THE SCRATCH STORE: operator-attest's reason — the members' sessions live
 * in `bio`, the act addresses `store=scratch`, and every member is enrolled in
 * both so the act there finds them.
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
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
/* CORRECTED 2026-09-25 (D-615, C-86.7), never exempted: this suite's promote labels named dates the documents they carried
   do not state (a fixed NOW/LATER over bytes the plane had re-stamped, or bytes written with other dates), and a label
   contradicting the document's `created`/`last_updated` is now refused by name. `datesOf` makes each label name the
   document's own dates, and the old value only where the bytes state none — what the label always meant to say. */
const datesOf = (md, created, lastUpdated) => {
  const fm = /^---\n([\s\S]*?)\n---/.exec(String(md ?? "")), get = (k) => fm && (new RegExp(`^${k}:[ \t]*"?([^"\n]*?)"?[ \t]*$`, "m").exec(fm[1]) || [])[1];
  return { created: get("created") || created, last_updated: get("last_updated") || lastUpdated };
};

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- deliverer ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("deliverer: SKIPPED — ssh-keygen not on PATH; a deliverer distinct from the signer is only "
    + "evidence over a REAL member signature carried in by somebody else");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const IDX_SRC = readFileSync(IDX, "utf8");
const DLV_SRC = readFileSync(fileURLToPath(new URL("../src/deliverer.mjs", import.meta.url)), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const FOUNDER_IS = { kind: "founder", member: null };
const MEMBER_IS = (m) => ({ kind: "member", member: m });
const kindOf = (d) => (d && typeof d === "object") ? (d.kind === "member" ? `member:${d.member}` : d.kind) : `ABSENT(${JSON.stringify(d)})`;

/* ========================================================== 0. STRUCTURE */
console.log("\n--- 0. structure — both acts hand the SESSION ROW to deliveringPrincipal, and it cannot see a signature ---");
t("STRUCTURE: both acts take the deliverer from the session row — `deliveringPrincipal(sessRights)` at op=caseratify and at op=ratify",
  (IDX_SRC.match(/const deliveredBy = deliveringPrincipal\(sessRights\);/g) || []).length, 2);
{
  const a = DLV_SRC.indexOf("export function deliveringPrincipal("), b = DLV_SRC.indexOf("\n}", a);
  const body = a < 0 ? "" : DLV_SRC.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, "");
  t("STRUCTURE: deliveringPrincipal takes ONE parameter (the session) and names no signer, key or signature",
    a < 0 ? "MISSING" : { params: (body.match(/deliveringPrincipal\(([^)]*)\)/) || [])[1], mentions: /attestor|signer|sig|key_b64|member_id/.test(body) },
    { params: "session", mentions: false });
}

/* ============================================================== 1. FIXTURE */
const ADM = "admin-r128-bootstrap";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: IDX_SRC,
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
const S = "&store=scratch";
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
/* The scratch store's own object, for the reads that answer from `bio` at the
   control plane (public reads) and for writing a LEGACY row exactly as a
   pre-REC-128 plane did — the store's own committer, handed no deliverer. */
const DOIN = async (store, path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  const init = body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) };
  return rP(await (await ns.get(ns.idFromName(store)).fetch(`http://x/${path}`, init)).json());
};
const DO = (path, body) => DOIN("scratch", path, body);

try {

const dir = mkdtempSync(join(tmpdir(), "deliverer-"));
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

/* THE FOUNDER: the claim step and its password session — the only live
   publishing route (DEC-33), and the one BOB #14 ruled stays allowed. */
const claimed = await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-128" });
if (!claimed || !claimed.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
const fl = await POST("op=login", { password: "founder-passphrase-128" });
if (!fl || !fl.token) throw new Error(`founder login: ${JSON.stringify(fl)}`);
const FOUNDER = fl.token;

/* `role` may differ per store, and here it must: in `bio` the claimed FOUNDER is
   already an administrator, so ruth is the second and a third would need
   consensus (CONSENSUS_REQUIRED); in `scratch` nobody claimed, so ADMINS_FIRST
   wants two members as administrators before any ordinary one. Gus is an
   ordinary member where his SESSION lives, which is what this suite drives. */
const enrol = async (memberId, roles, capabilities) => {
  for (const [st, role] of [["", roles.bio], [S, roles.scratch]]) {
    const add = await POST(`op=memberadd&token=${ADM}${st}`, { memberId, cover: `cover for ${memberId}`, role, capabilities });
    const en = await POST(`op=enroll${st}`, { invite: add && add.invite, handle: memberId, password: `${memberId}-passphrase-128` });
    if (!en || !en.ok) throw new Error(`enroll ${memberId}${st}: ${JSON.stringify(en)} (memberadd: ${JSON.stringify(add)})`);
  }
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-128` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
await enrol("ruth", { bio: "admin", scratch: "admin" }, ["contribute", "publish", "create_projects"]);
const GUS = await enrol("gus", { bio: "member", scratch: "admin" }, ["contribute", "publish"]);
const IRIS = await enrol("iris", { bio: "member", scratch: "member" }, ["contribute", "publish"]);
/* VERA: an ordinary member of the SAME instance who participates in NO project
   here — "a member of another project" in IC-141's terms. She is the arm that
   proves the founder's standing is the founder's and not everybody's. */
const VERA = await enrol("vera", { bio: "member", scratch: "member" }, ["contribute", "publish"]);
const IRIS_KEY = mkKey("iris");
const reg = await POST(`op=signeradd&token=${ADM}${S}`, { keyB64: IRIS_KEY, memberId: "iris", comment: "iris laptop" });
if (!reg || reg.ok === false) throw new Error(`signeradd: ${JSON.stringify(reg)}`);

/* `ratifiable` makes the bundle pass the catalog on its own (never updated, so no
   Session Log entry is owed — C-13.2 — and a stated source_status — C-2.7): the
   loose bundle of §5 is RATIFIED, where the case's information bundle is only cited. */
const infoMd = (id, ratifiable = false) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${ratifiable ? NOW : LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  ...(ratifiable ? ["source_status: unchanged"] : []),
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
/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane
   (Membership v2 §7) and a creation naming one is refused PROJECT_ID_SUPPLIED —
   so for a PROJECT `id` is only the label its title is built from, no bundleId
   is sent, and the caller reads the minted id from the answer's `bundleId`. */
const promote = async (id, text, objectType, state, st = S) => {
  const r = await POST(`op=promote&token=${ADM}${st}`, {
    ...(objectType === "project" ? {} : { bundleId: id }), base: null,
    snapKey: `20260918T${String(700000 + (++snapSeq)).slice(-6)}Z_${sha(id).slice(0, 8)}`,
    meta: { object_type: objectType, group: "believe-in-oakland",
            current_state: state, ...datesOf(text, NOW, LATER) },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [] });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
const shaOf = async (id) => {
  const listed = await GET(`op=list&token=${IRIS}${S}&limit=1000`);
  const s = (Array.isArray(listed) ? listed : (listed && listed.bundles) || []).find((b) => b.bundle_id === id)?.bundle_sha ?? null;
  if (!/^[0-9a-f]{64}$/.test(String(s))) throw new Error(`no sha for ${id}`);
  return s;
};
/* One project, one inquiry, concluded and published by iris: a case document
   authored by her and awaiting a signature. Built twice — the second case is the
   LEGACY one. */
/* D-431 (2026-09-19): `infoRatifiable` — the case's own information is made ratifiable for the one case whose
   information §5 ratifies AS THAT CASE'S EVIDENCE; every other call is byte-identical. */
const authorCase = async (projectName, lead, info, st = S, infoRatifiable = false) => {
  const storeName = st ? "scratch" : "bio";
  /* CORRECTED 2026-09-18 (REC-141, IC-158): the project is created with NO id
     (creation bytes carry no `id:` line) and its id is the one the plane mints. */
  const project = (await promote(projectName,
    projectFixtureMd(null, { created: NOW, updated: LATER, name: projectName }), "project", "investigating", st)).bundleId;
  const c = await DOIN(storeName, "projectclaimowner", { projectId: project, memberId: "iris" });
  if (!c || c.ok !== true) throw new Error(`projectclaimowner: ${JSON.stringify(c)}`);
  /* CORRECTED 2026-09-18 by REC-140 (IC-157, D-429), at its site and not exempted. §3 has
     GUS's session deliver iris's signature on the case's FINDING through op=ratify, and gus
     had no role in the project — which was fine when op=ratify asked no deliverer's position.
     Publication rule 2 as BOB #15 applied it now gives a finding a ratified case pins case
     ratification's delivery rule (the founder or a JOINED member), so an outsider's delivery
     is refused C-56.1. This suite's subject is WHO the record names as deliverer, not whether
     an outsider may deliver, so gus is made what §7 requires: a joined participant. */
  const inv = await POST(`op=projectinvite&token=${IRIS}${st}&projectId=${project}&handle=gus`);
  if (!inv || inv.ok !== true) throw new Error(`projectinvite gus: ${JSON.stringify(inv)}`);
  const jn = await POST(`op=projectjoin&token=${GUS}${st}&projectId=${project}`);
  if (!jn || jn.ok !== true) throw new Error(`projectjoin gus: ${JSON.stringify(jn)}`);
  await promote(info, infoMd(info, infoRatifiable), "information", "collected", st);
  /* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
     conclusion drawn with no project NAMES the accepted reading whose claim it
     adopts, and an unnamed one is refused NO_CLAIM. This conclude named none
     because the act took none; the lead inquiry now carries an accepted reading
     (`withAdoptableReading`) and the call names it. */
  await promote(lead, withAdoptableReading(inquiryMd(lead, `Was the transfer ${lead} authorised?`, info)),
    "inquiry", "open", st);
  const cc = await GET(`op=conclude&token=${IRIS}${st}&target=${lead}`
    + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
    + adoptedVersionParam());
  if (!cc || cc.ok === false) throw new Error(`conclude ${lead}: ${JSON.stringify(cc)}`);
  const pub = await POST(`op=publish&token=${IRIS}${st}`, {
    project, targets: [lead], roles: allLoadBearing({ targets: [lead] }),
    scope: "Whether the FY2024 transfer was authorised, on the documents in hand.",
    statement: "This case covers the FY2024 transfer only, on the documents in hand at edition 1.",
    excluded: [], subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds that transfers should be adopted in public session." });
  if (!pub || pub.ok === false || !pub.caseDocument || !/^[0-9a-f]{64}$/.test(String(pub.caseDocument.doc_sha)))
    throw new Error(`publish ${project}: ${JSON.stringify(pub).slice(0, 900)}`);
  return pub.caseDocument;
};
const PROJECT = "PROJ-2026-9128-deliver", INFO = "INFO-2026-9128-memo", LEAD = "INQ-2026-9128-lead";
const D = await authorCase(PROJECT, LEAD, INFO, S, true);
/* CORRECTED 2026-09-18 (REC-128's merge onto REC-130), never exempted: this read
   went to the store with NO viewer, which REC-130 (IC-141) now rightly answers
   NO_CASE_DOCUMENT for an UNSIGNED document — an absent viewer is a stranger.
   The suite reads the record as the case's OWNER, iris (projectclaimowner above),
   who has standing in the owning project; the stamp is what the control plane
   would stamp for her session. A ratified document answers anybody, so the
   read-backs after ratification are unchanged by it. */
const caseDoc = async (d) => DO(`casedocument?case=${encodeURIComponent(d.case_id)}&edition=${d.edition}&viewer=member:iris`);
t("the ground: a case document authored by iris awaits its signature, and it is not ratified",
  [(await caseDoc(D)).ratified, (await caseDoc(D)).delivered_by], [false, null]);

/* ============ 1b. WHO MAY READ AN UNSIGNED CASE DOCUMENT — the FOUNDER may */
console.log("\n--- 1b. op=casedocument — the FOUNDER's session reads an unsigned case; a member of no project does not ---");
{
  /* `op=casedocument` reads `bio`, so this case is authored THERE; the acts
     below stay in scratch as the rest of the suite does. The founder is an
     ADMINISTRATOR (Membership Architecture 4.1, 4.6), administrators see every
     project (7.3), and IC-141 gives an active administrator standing — so the
     founder reads the unsigned document WHOLE, while vera, an ordinary member
     who participates in no project, gets the byte-identical not-found a
     stranger gets. Before REC-128's merge fix the founder read as `member:admin`
     and got that same not-found. */
  const DB = await authorCase("PROJ-2026-9128-biocase", "INQ-2026-9128-biolead", "INFO-2026-9128-biomemo", "");
  const q = `op=casedocument&case=${encodeURIComponent(DB.case_id)}&edition=${DB.edition}`;
  const raw = async (tok) => { const r = await mf.dispatchFetch(`http://x/api/?${q}${tok ? `&token=${tok}` : ""}`);
                               return { status: r.status, body: await r.text() }; };
  const fr = await raw(FOUNDER), vr = await raw(VERA), an = await raw(null);
  const fj = (() => { try { return rP(JSON.parse(fr.body)); } catch { return null; } })();
  t("STANDING, the FOUNDER's session reads an UNSIGNED case document through op=casedocument — whole, unratified, the sha to sign",
    [fr.status, fj && fj.ok, fj && fj.ratified, fj && fj.doc_sha === DB.doc_sha], [200, true, false, true]);
  t("STANDING, a member of NO project (vera) is answered the not-found a stranger gets, BYTE FOR BYTE — the founder's standing is not everybody's",
    [vr.status, /NO_CASE_DOCUMENT/.test(vr.body), vr.status === an.status && vr.body === an.body], [404, true, true]);
}

/* ================================== 2. op=caseratify — THE FOUNDER DELIVERS */
console.log("\n--- 2. op=caseratify — iris SIGNS, the FOUNDER's session DELIVERS ---");
/* A member of NO project carrying iris's valid signature is answered exactly as
   for a case that does not exist (IC-141) — so the founder's delivery below is
   standing, not an open door. Asked BEFORE the founder ratifies: a ratified
   document is public and would answer anybody. */
{
  const vc = await POST(`op=caseratify&token=${VERA}${S}`, { caseId: D.case_id, edition: D.edition, expectedSha: D.doc_sha,
    sig: signBytes("iris", `bio-ratify-case ${D.case_id} ${D.edition} ${D.doc_sha}\n`) });
  t("STANDING, a member of NO project cannot deliver a case ratification: NO_CASE_DOCUMENT, and nothing is committed",
    [vc && vc.ok, vc && vc.reason, (await caseDoc(D)).ratified], [false, "NO_CASE_DOCUMENT", false]);
}
const hc = await POST(`op=caseratify&token=${FOUNDER}${S}`, { caseId: D.case_id, edition: D.edition, expectedSha: D.doc_sha,
  sig: signBytes("iris", `bio-ratify-case ${D.case_id} ${D.edition} ${D.doc_sha}\n`) });
t("DELIVERED, op=caseratify's answer: iris signed and the FOUNDER delivered — two principals, two fields",
  [hc && hc.ok, hc && hc.attestor && hc.attestor.member, kindOf(hc && hc.deliveredBy)], [true, "iris", "founder"]);
const cd = await caseDoc(D);
t("DELIVERED, op=casedocument read back: attestor_member iris, delivered_by the FOUNDER",
  [cd.ratified, cd.attestor_member, cd.delivered_by], [true, "iris", FOUNDER_IS]);

/* ============================== 3. op=ratify — A MEMBER DELIVERS ANOTHER'S */
console.log("\n--- 3. op=ratify — iris SIGNS, GUS's session DELIVERS ---");
const leadSha = await shaOf(LEAD);
const hr = await POST(`op=ratify&token=${GUS}${S}`, { bundleId: LEAD, expectedSha: leadSha,
  sig: signBytes("iris", `bio-ratify ${LEAD} ${leadSha}\n`) });
t("DELIVERED, op=ratify's answer: iris signed and GUS delivered",
  [hr && hr.ok, hr && hr.attestor, kindOf(hr && hr.deliveredBy)], [true, "iris", "member:gus"]);
const listRow = async (id) => ((await GET(`op=publishedlist&token=${IRIS}${S}`))?.bundles || []).find((b) => b.bundle_id === id) || null;
{
  const r = await listRow(LEAD);
  t("DELIVERED, op=publishedlist: the finding names iris as attestor and gus as deliverer",
    r && [r.attestor_member, r.delivered_by], ["iris", MEMBER_IS("gus")]);
  const ed = (await GET(`op=publishededitions&token=${IRIS}${S}&id=${LEAD}`))?.editions || [];
  t("DELIVERED, op=publishededitions: edition 1 names iris as attestor and gus as deliverer",
    ed.map((e) => [e.edition, e.attestor_member, kindOf(e.delivered_by)]), [[1, "iris", "member:gus"]]);
}

/* ======================================= 4. THE PUBLIC READ AND THE CONTAINER */
console.log("\n--- 4. what is PUBLISHED — the public case read, and the container a stranger holds ---");
{
  const pc = await DO(`publishedcase?caseId=${encodeURIComponent(D.case_id)}`);
  const f = (pc && pc.findings || [])[0] || {};
  /* The public read carries the case document only inside `manifest` — the
     stored container manifest it serves beside the findings — so that is where
     its deliverer is read. The finding's is on the finding. */
  const cdoc = pc && pc.manifest && pc.manifest.case_document;
  t("DELIVERED, op=publishedcase: the case document (in the served manifest) says the FOUNDER delivered iris's signature, the finding says gus delivered hers",
    [cdoc && cdoc.attestor && cdoc.attestor.member, kindOf(cdoc && cdoc.delivered_by),
     f.attestor && f.attestor.member, kindOf(f.delivered_by)],
    ["iris", "founder", "iris", "member:gus"]);
  const msha = hr && hr.container && hr.container.manifest_sha;
  const obj = msha ? await (await mf.getR2Bucket("PUBLISHED")).get(`scratch/published/${msha}`) : null;
  const man = obj ? JSON.parse(await obj.text()) : null;
  t("THE CONTAINER: the edition completed and its manifest is in the published bucket, re-hashing to its own name",
    [!!msha, !!man, man ? sha(JSON.stringify(man, null, 1)) === msha : false], [true, true, true]);
  t("DELIVERED, THE CONTAINER (the published bytes): format /6, the case document signed by iris and delivered by the FOUNDER, the finding signed by iris and delivered by gus",
    man && [man.format, man.case_document && man.case_document.attestor && man.case_document.attestor.member,
            kindOf(man.case_document && man.case_document.delivered_by),
            man.findings && man.findings[0] && man.findings[0].attestor && man.findings[0].attestor.member,
            kindOf(man.findings && man.findings[0] && man.findings[0].delivered_by)],
    ["bio-case-container/6", "iris", "founder", "iris", "member:gus"]);
  t("THE CONTAINER says in its own words which field is the signature's and which is this instance's record",
    !!(man && typeof man.verify === "string" && /delivered_by/.test(man.verify) && /not covered by any signature/i.test(man.verify)), true);
}

/* =================== 5. op=ratify of a bundle in NO case — the FOUNDER again */
console.log("\n--- 5. op=ratify, a ratified bundle in no case (the case's EVIDENCE) — iris SIGNS, the FOUNDER DELIVERS ---");
{
  /* CORRECTED 2026-09-19 by the D-431 worker (BIO_Publication_v0_1.md §3 rule 2, BOB #16), at its site and not
     exempted. This block ratified a fresh information bundle that nothing rested on — publication outside a
     case, now refused C-58.3. A bundle in no case still crosses, as the EVIDENCE a ratified case's finding
     rests on, so the block ratifies D's own information (LEAD's basis, and D is ratified in §2) — still a
     bundle in no case, still iris's signature, still the FOUNDER delivering, which is this block's subject. */
  const LOOSE = INFO;
  const s = await shaOf(LOOSE);
  const r = await POST(`op=ratify&token=${FOUNDER}${S}`, { bundleId: LOOSE, expectedSha: s,
    sig: signBytes("iris", `bio-ratify ${LOOSE} ${s}\n`) });
  if (!r || r.ok !== true) console.log(`  (the loose ratification answered: ${JSON.stringify(r).slice(0, 900)})`);
  t("DELIVERED, op=ratify's answer for a loose bundle: iris signed and the FOUNDER delivered",
    [r && r.ok, r && r.attestor, kindOf(r && r.deliveredBy)], [true, "iris", "founder"]);
  const row = await listRow(LOOSE);
  const pc = await DO(`publishedcase?id=${LOOSE}`);
  t("DELIVERED, op=publishedlist and op=publishedcase (the loose edition): attestor iris, deliverer the FOUNDER",
    [row && row.attestor_member, row && kindOf(row.delivered_by),
     pc && pc.findings && pc.findings[0] && pc.findings[0].attestor.member, pc && pc.findings && kindOf(pc.findings[0].delivered_by)],
    ["iris", "founder", "iris", "founder"]);
}

/* ================================================= 6. LEGACY — UNDETERMINED */
console.log("\n--- 6. LEGACY — a ratification recorded before REC-128 reads UNDETERMINED, never back-filled ---");
{
  /* A LEGACY FINDING ROW: the store's committer called exactly as the plane
     before this item called it, with a signer and no deliverer. */
  /* CORRECTED 2026-09-19 by the D-431 worker (BIO_Publication_v0_1.md §3 rule 2, BOB #16), at its site and not
     exempted: the legacy row was a fresh information bundle nothing rested on, committed at the store — now
     refused C-58.3 there too, because the rule lives in the one committer. The legacy CASE below is committed
     FIRST (it was second), and the legacy row is ITS information — evidence its ratified finding rests on —
     committed exactly as the plane before REC-128 committed it: a signer and no deliverer. */
  const D2 = await authorCase("PROJ-2026-9128-legacy", "INQ-2026-9128-legacy", "INFO-2026-9128-memo2");
  const w2 = await DO("caseratify", { caseId: D2.case_id, edition: D2.edition, docSha: D2.doc_sha,
    sigArmored: "-----BEGIN SSH SIGNATURE-----\nlegacy\n-----END SSH SIGNATURE-----", attestorKey: IRIS_KEY,
    attestorMember: "iris", gateVersion: "legacy" });
  if (!w2 || w2.ok === false) throw new Error(`legacy caseratify: ${JSON.stringify(w2)}`);
  const OLD = "INFO-2026-9128-memo2";
  const s = await shaOf(OLD);
  const w = await DO("publish", { bundleId: OLD, bundleSha: s, attestorKey: IRIS_KEY, attestorMember: "iris",
    gateVersion: "legacy", sigArmored: "-----BEGIN SSH SIGNATURE-----\nlegacy\n-----END SSH SIGNATURE-----", shas: [] });
  if (!w || w.ok === false) throw new Error(`legacy publish: ${JSON.stringify(w)}`);
  const row = await listRow(OLD);
  t("LEGACY, a finding row: the signer is still named (iris) and the deliverer reads UNDETERMINED, stated with its reason — not iris",
    row && [row.attestor_member, row.delivered_by && row.delivered_by.kind, row.delivered_by && row.delivered_by.member,
            !!(row.delivered_by && typeof row.delivered_by.detail === "string" && /not inferred from the signer/.test(row.delivered_by.detail))],
    ["iris", "undetermined", null, true]);
  /* A LEGACY CASE DOCUMENT: the case above, committed by the store's case
     committer with a signer and no deliverer. */
  const cd2 = await caseDoc(D2);
  t("LEGACY, a case document: the signer is still named (iris) and the deliverer reads UNDETERMINED — not iris",
    [cd2.ratified, cd2.attestor_member, cd2.delivered_by && cd2.delivered_by.kind, cd2.delivered_by && cd2.delivered_by.member],
    [true, "iris", "undetermined", null]);
}

/* ================================================ 7. THE LIAR, AS A TABLE */
console.log("\n--- 7. every ratification this suite made — signer beside deliverer, MEASURED ---");
{
  const rows = ((await GET(`op=publishedlist&token=${IRIS}${S}`))?.bundles || [])
    .map((b) => [b.bundle_id, b.attestor_member, kindOf(b.delivered_by)]);
  for (const r of rows) console.log(`  ${r[0].padEnd(28)} signed ${String(r[1]).padEnd(6)} delivered ${r[2]}`);
  t("THE TABLE: no DETERMINED deliverer in this fixture equals its signer — every one was carried in by somebody else, so a `delivered_by` copied from the signer cannot pass",
    rows.filter(([, a, d]) => d === `member:${a}`).map(([id]) => id), []);
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
}
await mf.dispose();
console.log(`\ndeliverer: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
