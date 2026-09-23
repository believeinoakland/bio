/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/founder-sight.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/founder-sight.control.mjs [arm]`. DECLARED BEFORE ARMING, per arm, in the driver's `mustFail` lists; every arm patches a COPY of `src/` (asserting its anchor occurs exactly once) and the real sources are hashed before and after.
   RESULTS, RUN 2026-09-18 in worktree agent-a0f6ffd4522bb36bd (real src/index.mjs 645,037 B sha256 2bc646dcc189…, src/store.mjs 2,525,741 B sha256 ed7f5dacb728…, untouched: YES): (a) baseline 41/0 · (b) no-founder-arm 38/3 · (c) leads-widened 37/4 · (d) positional-from-viewer 37/4 · (e) everyone-admin 39/2 · (h) identity-honoured 39/2 · (i) audit-silent 38/3 — AS DECLARED on the first run. (f) no-reservation 37/4 and (g) prefix-reservation 36/5 came back NOT AS DECLARED on the first run and the DECLARATIONS were corrected, not the subject (the reasons are at each arm in the driver): with no reservation CONTROL 3's own memberadd lands, so §4's not-held audit arm rightly reports it held; with a prefix reservation 6a's anchor is gone and 6b/6c/6e fail downstream of it. Re-run: both AS DECLARED. (j) admin-bytes: base a6bdfcbb vs this tree, 13 admin-token reads (op=audit deliberately excluded — it gains `membership` for every caller), 0 differ — BYTE-IDENTICAL.
   RE-RUN 2026-09-18 after merging origin/main c1ce709a (REC-126) and narrowing the `identity` stamp to IDENTITY_READS (real src/index.mjs 653,993 B sha256 d735e0e0de28…, src/store.mjs 2,552,401 B sha256 46d47c5a503d…, untouched: YES), arm (h)'s anchor re-pointed at the narrowed line: (a) 41/0 · (b) 38/3 · (c) 37/4 · (d) 37/4 · (e) 39/2 · (f) 37/4 · (g) 36/5 · (h) 39/2 · (i) 38/3 — ALL AS DECLARED; (j) admin-bytes against base c1ce709a: 13 reads, 0 differ.
 * =========================================================================
 * REC-132 / D-422 / IC-149 — THE FOUNDER IS AN ADMINISTRATOR HERE TOO.
 * Membership Architecture v2 §7, the block BOB #15 designed on 2026-09-18.
 *
 * WHAT WAS WRONG. The control plane stamped a signed-in session's viewer as
 * `member:` plus the FOLDED role, and the founder's role is the bare `admin`, so
 * the founder read as `member:admin` — a member with no participation and no
 * `members` row — and `viewerPredicate`'s administrator arm (which reads an
 * ACTIVE `members` row with role admin) never fired for it. The founder was
 * blind to every project nobody invited it to, contrary to §7.3 and §4.1.
 *
 * THE DESIGN, as this suite reads it. ONE resolver of a session
 * (`resolveSession` in `src/index.mjs`) returns TWO things kept apart: the
 * VISIBILITY viewer (the founder's is the administrator viewer) and the
 * POSITIONAL identity (who the session IS — `member:admin` — for authorship,
 * ownership, votes and D-310's positional facts). The widening STOPS where a
 * ruling names someone narrower than an administrator: a LEAD is readable by its
 * author and by participants it was shared to, never by administrators
 * (MEMBER-KNOWLEDGE-DESIGN.md §5). And the member id `admin` is RESERVED.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (1) widen EVERY read to the administrator arm, leads included. Control 1
 *       (the founder lists an uninvited project) goes green. So §2 drives the
 *       founder against another member's lead — unshared, and SHARED to a project
 *       the founder is not in — and it must still answer LEAD_NOT_FOUND.
 *   (2) answer positional questions from the visibility half. A bare `admin`
 *       viewer carries no member, so D-310's owner fact comes back null and the
 *       act catalogue does not narrow on a null: the founder would be offered
 *       `publish` while owning nothing. §3 drives both directions of that fact,
 *       and the founder's own lead (authorship) in §2.
 *   (3) widen EVERYBODY. Vera, a member of no project, must still not see it.
 *   (4) change what a machine credential compiles for. §5 pins the admin token's
 *       answers to the same read set; the BYTE-IDENTITY against the pre-change
 *       build is the control driver's `admin-bytes` arm (it needs the base
 *       sources, which a battery suite must not pin).
 * ========================================================================= */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MEMBER_ID_CHECKS } from "../checks/bio-checks.mjs";
import { projectFixtureMd } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.FOUNDER_SIGHT_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");
const IDX_SRC = readFileSync(IDX, "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ============================================================ 0. STRUCTURE */
console.log("\n--- 0. structure — ONE resolver, and no session read spells its own viewer ---");
{
  const code = IDX_SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  t("STRUCTURE: the two places a session token is looked up both resolve it through `resolveSession`",
    (code.match(/(?<!function )resolveSession\(sess\)/g) || []).length, 2);
  t("STRUCTURE: no line of code spells a session viewer as `member:` plus the folded id — every "
    + "positional stamp names `sessIdentity`, every visibility stamp names `sessViewer`",
    (code.match(/`member:\$\{sessMember\}`/g) || []).length, 0);
}

/* ============================================================== 1. FIXTURE */
const ADM = "adm-rec132", MEM = "mem-rec132";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: IDX_SRC,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
}));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
    { method: "POST", body: JSON.stringify(body) })).json());
};
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const ids = (r) => (Array.isArray(r) ? r : (r && r.bundles) || []).map((b) => b.bundle_id);
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

try {

const claimed = await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-132" });
if (!claimed || !claimed.ok) throw new Error(`claim: ${JSON.stringify(claimed)}`);
const fl = await POST("op=login", { password: "founder-passphrase-132" });
if (!fl || !fl.token) throw new Error(`founder login: ${JSON.stringify(fl)}`);
const FOUNDER = fl.token;
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role,
    capabilities: ["contribute", "publish", "create_projects"] });
  const en = await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-132` });
  if (!en || !en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)} (memberadd: ${JSON.stringify(add)})`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-132` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* The founder counts as the first administrator, so the second must be one too
   (ADMINS_FIRST); ruth is that second, and participates in nothing here. */
const RUTH = await enrol("ruth", "admin");
const IRIS = await enrol("iris", "member");
const VERA = await enrol("vera", "member");

/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane
   (Membership v2 §7): creation bytes carry no `id:` line and a PROJECT creation
   sends no bundleId (refused PROJECT_ID_SUPPLIED) — the label is only the title's
   name, and each project constant below is the id read from the answer. */
const projectMd = (name) => projectFixtureMd(null, { created: NOW, updated: LATER, name });
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://example.org/memo"', '  authority: "synthetic"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id, target) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Was ${id} authorised?"`, "current_state: open", "prior_state: null",
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
  "---", "", "## Question", "", `Was ${id} authorised?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
let snapSeq = 0;
const promote = async (id, text, objectType, state) => {
  const r = await POST(`op=promote&token=${ADM}`, {
    ...(objectType === "project" ? {} : { bundleId: id }), base: null,
    snapKey: `20260918T${String(320000 + (++snapSeq)).slice(-6)}Z_${sha(id).slice(0, 8)}`,
    meta: { object_type: objectType, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register: [] });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
/* IRIS'S project: the founder was never invited to it. */
const PROJ = (await promote("PROJ-2026-9132-iris", projectMd("PROJ-2026-9132-iris"), "project", "investigating")).bundleId;
const own = await DO("projectclaimowner", { projectId: PROJ, memberId: "iris" });
if (!own || own.ok !== true) throw new Error(`projectclaimowner: ${JSON.stringify(own)}`);
const INFO = "INFO-2026-9132-memo", INQ = "INQ-2026-9132-q";
await promote(INFO, infoMd(INFO), "information", "collected");
/* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
   conclusion drawn with no project NAMES the accepted reading whose claim it
   adopts, and an unnamed one is refused NO_CLAIM with nothing written. This
   fixture concluded with no reading because the act took none; the inquiry now
   carries one (`withAdoptableReading`) and the call names it. Fixture, not subject. */
await promote(INQ, withAdoptableReading(inquiryMd(INQ, INFO)), "inquiry", "open");
const cc = await GET(`op=conclude&token=${IRIS}&target=${INQ}`
  + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
  + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
  + adoptedVersionParam());
if (!cc || cc.ok === false) throw new Error(`conclude: ${JSON.stringify(cc).slice(0, 600)}`);
console.log("  corpus: 1 project owned by iris (founder, ruth and vera uninvited), 1 information, 1 concluded inquiry;"
  + " the founder's password session, iris's and vera's sessions, the admin and member tokens");

/* ============================================ 1. VISIBILITY — THE ADMINISTRATOR ARM */
console.log("\n--- 1. the founder's session sees what an administrator sees (§7.3) ---");
t("CONTROL 1: op=list — the founder's session lists a project it was NEVER invited to",
  ids(await GET(`op=list&token=${FOUNDER}&limit=1000`)).includes(PROJ), true);
t("PARITY: ruth, an ENROLLED administrator who participates in nothing, lists it through the administrator "
  + "arm the founder was missing — the founder now reads exactly as she does",
  ids(await GET(`op=list&token=${RUTH}&limit=1000`)).includes(PROJ), true);
t("op=list — the ADMIN token lists it too (the sight the founder now shares)",
  ids(await GET(`op=list&token=${ADM}&limit=1000`)).includes(PROJ), true);
{
  const img = await GET(`op=image&token=${FOUNDER}&id=${PROJ}`);
  t("op=image — the founder reads the uninvited project's document", typeof (img && img["bundle.md"]), "string");
  const aff = await GET(`op=affordances&token=${FOUNDER}&target=${PROJ}`);
  t("op=affordances — the founder is answered about the uninvited project, not NO_SUCH_BUNDLE",
    [aff && aff.target, aff && aff.object_type], [PROJ, "project"]);
  const pp = await GET(`op=projectparticipants&token=${FOUNDER}&projectId=${PROJ}`);
  t("op=projectparticipants — the founder sees the participant list (§7.8), iris as owner",
    [pp && pp.ok, ((pp && pp.participants) || []).map((p) => [p.handle, !!p.owner])], [true, [["iris", true]]]);
}
console.log("\n--- 1b. and NOBODY ELSE gained it ---");
t("vera, an ordinary member of no project, does NOT list it",
  ids(await GET(`op=list&token=${VERA}&limit=1000`)).includes(PROJ), false);
t("vera's op=image of it answers as for a bundle that does not exist",
  typeof ((await GET(`op=image&token=${VERA}&id=${PROJ}`)) || {})["bundle.md"], "undefined");
t("iris, its owner, lists it (the ground)", ids(await GET(`op=list&token=${IRIS}&limit=1000`)).includes(PROJ), true);

/* =========================================== 2. THE LEAD — A RULING NAMES AUTHORS */
console.log("\n--- 2. a LEAD is never widened to an administrator (MEMBER-KNOWLEDGE-DESIGN.md §5) ---");
const IL = await POST(`op=lead&token=${IRIS}`, { words: "I was told the memo was never adopted." });
const ILID = IL && IL.lead_id;
if (!ILID) throw new Error(`iris lead: ${JSON.stringify(IL)}`);
t("CONTROL 2: the founder CANNOT read iris's UNSHARED lead — answered as for a lead that does not exist",
  codeOf(await GET(`op=leadread&token=${FOUNDER}&id=${ILID}`)), "LEAD_NOT_FOUND");
const sh = await POST(`op=leadshare&token=${IRIS}`, { lead: ILID, project: PROJ });
t("iris shares it to HER project (the ground: the share lands)", sh && sh.ok, true);
t("CONTROL 2, SHARED: the founder, who SEES that project but does not PARTICIPATE in it, still cannot "
  + "read the lead — the ruling names participants, never administrators",
  codeOf(await GET(`op=leadread&token=${FOUNDER}&id=${ILID}`)), "LEAD_NOT_FOUND");
t("nor can the founder record a look against it", codeOf(await POST(`op=leadlook&token=${FOUNDER}`,
  { lead: ILID, state: "LOOKED_ABSENT" })), "LEAD_NOT_FOUND");
const FL = await POST(`op=lead&token=${FOUNDER}`, { words: "The founder heard the memo was backdated." });
const FLID = FL && FL.lead_id;
t("POSITIONAL (authorship): the founder writes a lead, and it is stamped with its IDENTITY `admin`",
  [FL && FL.ok, FL && FL.author], [true, "admin"]);
const fr = await GET(`op=leadread&token=${FOUNDER}&id=${FLID}`);
t("POSITIONAL: the founder reads ITS OWN lead back — sight by position, never by the visibility half",
  [fr && fr.ok, fr && fr.author], [true, "admin"]);
const lk = await POST(`op=leadlook&token=${FOUNDER}`, { lead: FLID, state: "LOOKED_ABSENT",
  detail: "searched the clerk's archive" });
t("POSITIONAL: the founder follows its own lead, and the look is recorded in its name",
  [lk && lk.ok, lk && lk.looked_by], [true, "admin"]);
await POST(`op=leadlook&token=${IRIS}`, { lead: ILID, state: "LOOKED_ABSENT", detail: "nothing on the portal" });
const fi = await GET(`op=frontier&token=${FOUNDER}&level=internet`);
const authorities = [...new Set([...((fi && fi.looked) || []), ...((fi && fi.never_looked) || [])]
  .flatMap((r) => [r.authority, ...((r.looks || []).map((x) => x.authority))]).filter(Boolean))];
t("op=frontier&level=internet — the founder's frontier carries its OWN lead's look and NOT iris's",
  [JSON.stringify(fi).includes(FLID), JSON.stringify(fi).includes(ILID)], [true, false]);
t("nor can ruth, an enrolled administrator: the lead ruling bypasses the administrator arm for EVERY administrator",
  codeOf(await GET(`op=leadread&token=${RUTH}&id=${ILID}`)), "LEAD_NOT_FOUND");
t("vera cannot read the founder's lead either (the founder's lead is the founder's)",
  codeOf(await GET(`op=leadread&token=${VERA}&id=${FLID}`)), "LEAD_NOT_FOUND");
t("the admin TOKEN reads no lead at all, the founder's included (a `class:` credential reaches nothing)",
  codeOf(await GET(`op=leadread&token=${ADM}&id=${FLID}`)), "LEAD_NOT_FOUND");

/* ==================================== 3. D-310 — A POSITIONAL FACT ASKS THE IDENTITY */
console.log("\n--- 3. D-310's owner fact answers by the founder's IDENTITY, never by what it can see ---");
const acts = async (tok) => ((await GET(`op=affordances&token=${tok}&target=${INQ}`)) || {}).acts || [];
t("the founder OWNS NO project, so `publish` is NOT offered on the concluded inquiry — a null owner "
  + "fact (the visibility viewer carries no member) would offer it",
  (await acts(FOUNDER)).some((a) => a.id === "publish"), false);
t("iris owns a project, so `publish` IS offered to her (the ground)",
  (await acts(IRIS)).some((a) => a.id === "publish"), true);
const FPROJ = (await promote("PROJ-2026-9132-founder", projectMd("PROJ-2026-9132-founder"), "project", "investigating")).bundleId;
const fown = await DO("projectclaimowner", { projectId: FPROJ, memberId: "admin" });
t("the founder is made an owner of a second project (the fixture step)", fown && fown.ok, true);
t("now `publish` IS offered to the founder — the fact was asked of `admin`, in both directions",
  (await acts(FOUNDER)).some((a) => a.id === "publish"), true);
t("op=queue — the founder's feed builds (its options ask the same owner fact)",
  ((await GET(`op=queue&token=${FOUNDER}`)) || {}).ok !== false, true);

/* =================================================== 4. THE RESERVED ID `admin` */
console.log("\n--- 4. the member id `admin` is RESERVED (C-55.1) ---");
const r1 = await POST(`op=memberadd&token=${ADM}`, { memberId: "admin", cover: "an impostor", role: "member" });
t("CONTROL 3: op=memberadd with id `admin` is REFUSED BY NAME under the admin token, with its row",
  [codeOf(r1), r1 && r1.check, r1 && r1.translation === MEMBER_ID_CHECKS.MEMBER_ID_RESERVED.translation],
  ["MEMBER_ID_RESERVED", "C-55.1", true]);
const r2 = await POST(`op=memberadd&token=${FOUNDER}`, { memberId: "admin", cover: "an impostor", role: "admin" });
t("and under the founder's own session, asking for an administrator", codeOf(r2), "MEMBER_ID_RESERVED");
const r3 = await POST(`op=memberadd&token=${ADM}`, { memberId: "administrator", cover: "a real person", role: "member" });
t("OVER-STRICTNESS: `administrator` is an ordinary id and is admitted — the reservation is the id, not a prefix",
  [r3 && r3.ok, typeof (r3 && r3.invite)], [true, "string"]);
const au = await GET(`op=audit&token=${ADM}`);
t("op=audit on an instance holding no member with the reserved id says so — present, and not held",
  au && au.membership && [au.membership.reservedId, au.membership.held], ["admin", false]);

/* ========================================== 5. THE MACHINE CREDENTIALS DID NOT MOVE */
console.log("\n--- 5. the admin and member tokens compile for what they compiled for ---");
t("the MEMBER token lists iris's project (instance-level, unfiltered, as before)",
  ids(await GET(`op=list&token=${MEM}&limit=1000`)).includes(PROJ), true);
{
  const fiA = await GET(`op=frontier&token=${ADM}&level=internet`);
  t("the admin token's internet frontier reaches no lead (empty cause `no_member`), as before",
    fiA && fiA.empty && fiA.empty.cause, "no_member");
  const affA = await GET(`op=affordances&token=${ADM}&target=${INQ}`);
  t("the admin token is still offered `publish` on a null owner fact (a class credential holds no roster "
    + "position, so the catalogue does not narrow — D-310's machine arm, unchanged)",
    ((affA && affA.acts) || []).some((a) => a.id === "publish"), true);
}
{
  /* A CALLER-SUPPLIED `identity` IS NOT HONOURED: it is stamped by the server, and a
     token naming a member here would otherwise read that member's leads. */
  const spoof = await GET(`op=leadread&token=${MEM}&id=${ILID}&identity=${encodeURIComponent("member:iris")}`);
  t("a caller-supplied `identity=member:iris` on the member TOKEN reads NOTHING — the stamp is the server's",
    codeOf(spoof), "LEAD_NOT_FOUND");
  const spoof2 = await GET(`op=leadread&token=${VERA}&id=${ILID}&identity=${encodeURIComponent("member:iris")}`);
  t("nor does vera's session become iris by naming her", codeOf(spoof2), "LEAD_NOT_FOUND");
}

/* ======================= 6. AN INSTANCE ALREADY HOLDING `admin` IS REPORTED, NEVER RENAMED */
console.log("\n--- 6. a member enrolled as `admin` BEFORE the reservation is REPORTED by op=audit ---");
{
  const root = mkdtempSync(join(tmpdir(), "rec132-legacy-"));
  try {
    const PLANE = fileURLToPath(new URL("..", import.meta.url));
    const REPO = fileURLToPath(new URL("../..", import.meta.url));
    cpSync(SRC_DIR, join(root, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(root, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(root, "docprofile"), { recursive: true });
    /* The legacy build: this tree's own store with the reservation neutered at its ONE
       site — the build a real instance ran before C-55 — over a PERSISTED store. */
    const ANCHOR = "if (memberId === Store.ROOT_ADMIN)\n      return refusal(\"MEMBER_ID_RESERVED\"";
    const storePath = join(root, "bio-plane", "src", "store.mjs");
    const src = readFileSync(storePath, "utf8");
    const occurrences = src.split(ANCHOR).length - 1;
    writeFileSync(storePath, src.replace(ANCHOR, "if (false)\n      return refusal(\"MEMBER_ID_RESERVED\""));
    t("6a: the legacy build is ARMED — the reservation anchor occurs exactly once and was neutered",
      [occurrences, readFileSync(storePath, "utf8").includes("if (false)\n      return refusal(\"MEMBER_ID_RESERVED\"")],
      [1, true]);
    const persist = join(root, "persist");
    const planeAt = (idx) => withSurfacingRun(new Miniflare({
      modules: true, modulesRoot: "/", scriptPath: idx, script: readFileSync(idx, "utf8"),
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      durableObjects: { STORE: { className: "Store", useSQLite: true } },
      durableObjectsPersist: persist,
      r2Buckets: ["CAPTURES", "PUBLISHED"],
      bindings: { ADMIN_TOKEN: ADM, VERSION: "test" } }));
    const on = (m) => ({
      POST: async (q, b) => rP(await (await m.dispatchFetch(`http://x/api/?${q}`,
        { method: "POST", body: JSON.stringify(b ?? {}) })).json()),
      GET: async (q) => rP(await (await m.dispatchFetch(`http://x/api/?${q}`)).json()) });
    const old = planeAt(join(root, "bio-plane", "src", "index.mjs"));
    let legacy;
    try {
      const o = on(old);
      /* An unclaimed instance's first invitation is an administrator's (ADMINS_FIRST). */
      legacy = await o.POST(`op=memberadd&token=${ADM}`, { memberId: "admin", cover: "enrolled before C-55", role: "admin" });
    } finally { await old.dispose(); }
    t("6b: the OLD rule admitted a member with the id `admin` — the row a real instance may already hold",
      [legacy && legacy.ok, legacy && legacy.memberId], [true, "admin"]);
    const live = planeAt(IDX);
    try {
      const l = on(live);
      const a = await l.GET(`op=audit&token=${ADM}`);
      t("6c: THIS build's op=audit REPORTS it — the reserved id is held, by whom (role, status), and says so",
        a && a.membership && [a.membership.reservedId, a.membership.held, a.membership.role, a.membership.status,
                              typeof a.membership.says],
        ["admin", true, "admin", "invited", "string"]);
      t("6d: it is REPORTED, not a conformance error — `ok` and the bundle tally do not move for it",
        [a && a.ok, a && a.withErrors], [true, 0]);
      const again = await l.GET(`op=audit&token=${ADM}`);
      t("6e: and NEVER RENAMED — a second audit still finds the member under the id it was enrolled with",
        again && again.membership && again.membership.held, true);
    } finally { await live.dispose(); }
  } finally { rmSync(root, { recursive: true, force: true }); }
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nfounder-sight: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
