/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/caseproduction.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (`d280-strengthbar.control.mjs`'s precedent, `severedhomes.control.mjs` before it). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad (PL-10). Every arm is armed ALONE with every other defence held OPEN, every restore is verified BY sha256 AND BY CONTENT against a per-arm pristine copy named with the ARM ID as well as the path, and every arm DECLARES before it runs what MUST fail and what MUST NOT. Run in one step with `node test/caseproduction.control.mjs [arm]`.
   (A) THE PROJECT-LESS PATH RESTORED — CASE-1's handed-over arm, and the one that makes `cases.project_id NOT NULL` real through an op instead of structurally. In src/store.mjs publishCase() replace `if (!proj)` with `if (false)` -> a case publishes naming no project, which is the path DEC-72 deletes. MUST FAIL: §2's refusal arm. MUST NOT FAIL: §3's owner arms — armed apart on purpose, because one fence covering for another is how a half-fix reads as a whole one.
   (B) THE OWNER FENCE NEUTERED. In src/store.mjs publishCase() replace `if (!this.#isProjectOwner(proj, who))` with `if (false)` -> any member with the publish capability publishes another project's production. MUST FAIL: §3's non-owner arm. MUST NOT FAIL: §2, §5.
   (C) THE LOAD-BEARING MINIMUM REMOVED. In src/store.mjs publishCase() replace `if (!loadBearing.length)` with `if (false)` -> an all-supporting case publishes, asserting nothing conclusively while its completeness assertion claims coverage. MUST FAIL: §4's arm. MUST NOT FAIL: §5's pair, because a case WITH a load-bearing member is untouched by this arm.
   (D) THE BAR COMPARISON REMOVED — half of the item's whole shape. In src/store.mjs publishCase() replace `if (bar.declared) {` with `if (false) {` -> a load-bearing member below the project's standard publishes. MUST FAIL: §5's refusal arm. MUST NOT FAIL: §5's SUPPORTING arm and §6's over-strictness arm, which is precisely what distinguishes "the gate works" from "the gate refuses everything".
   (E) THE EXEMPTION REMOVED — THE OTHER HALF, AND THE ARM MOST LIKELY TO BE FORGOTTEN. In src/store.mjs publishCase() change `for (const m of loadBearing)` to `for (const m of memberRoles)` -> the bar is asked of EVERY member, which is Bob's DEC-71 input read backwards and would pressure a member into severing a true citation to publish. MUST FAIL: §5's SUPPORTING arm. MUST NOT FAIL: §5's refusal arm and §2/§3 — an over-strictness arm cannot be read off the headline, which is the lesson D-280 paid for.
   (F) THE ROLE MADE OPTIONAL. In src/store.mjs publishCase() replace `if (!r)` with `if (false)` in the role loop, so an undesignated member falls through as ''. MUST FAIL: §4's NO_MEMBER_ROLE arm and, downstream, the load-bearing minimum. MUST NOT FAIL: §6.
   (G) THE COMPOSITION RESTORED, AND IT IS THE REMOVAL'S OWN CONTROL. Re-add a `#requiredStrengthFor`-shaped cross-citer walk in src/store.mjs and call it from `#projectBar` when the project declares nothing -> the group default and other projects' bars reach a publication again. MUST FAIL: §7's removal arms and §5's supporting arm (the exempt member's project acquires a bar it never declared). MUST NOT FAIL: §2, §3.
   (H) THE RATIFY COMMIT TAKEN OFF THE SIGNED BYTES. In src/store.mjs publish() replace `caseProject` with a literal project id -> the `cases` row records an attribution nobody signed. MUST FAIL: §8's committed-from-bytes arm. MUST NOT FAIL: anything in §2-§6, WHICH IS THE POINT: every act-side arm stays green while the record commits a fact no signature covers.
   (I) BASELINE. Every arm restored, suite re-run, full green.
   ==== RUN 2026-08-10, case2-publication-production. See the driver's header for the measured result of each arm.
 * ========================================================================= */
/* CASE-2 — **PUBLICATION IS A PRODUCTION OF A PROJECT**, enacting DEC-72 and
 * `docs/development/CASE-AS-PRODUCTION.md`, which is the authority for scope.
 *
 * ---- WHAT THIS ITEM IS, in Bob's own words (DEC-72, 2026-08-10)
 *
 *   (2) *"Only findings that are part of a project can be published"* —
 *       publishing is *"something that's done as a production of the project"*.
 *   (5) *"The publisher of a project … must be a manager of the project"*,
 *       ruled with the default that MANAGER IS THE EXISTING PROJECT OWNER ROLE.
 *   (1) *"The bar — that is, the standard of evidence — is a property of a
 *       project, not an inquiry or claim."*
 *   (4) *"All load-bearing findings of a case being published must meet the
 *       necessary bar. Other findings/claims that don't meet the bar can be a
 *       part of the published work, though they aren't presented as
 *       load-bearing."*
 *   And the second ruled default: A CASE REQUIRES AT LEAST ONE LOAD-BEARING
 *   MEMBER.
 *
 * ---- THE PAIR IN §5 IS THE WHOLE SHAPE OF THE ITEM
 *
 * One finding below the bar is REFUSED and another finding below the SAME bar is
 * ACCEPTED, and the only difference between them is a designation a person
 * authored. Either arm alone proves nothing: a gate that refuses everything
 * passes the first, and a gate that refuses nothing passes the second. They are
 * asserted together, over one act, with the same grades on both sides.
 *
 * Bob's DEC-71 input is the reason the exemption exists and is easy to get
 * backwards: *"every project has a standard of evidence. But that standard
 * doesn't require that every piece of evidence must meet that standard. Rather,
 * it means that the overall findings in that project must meet the standard —
 * even if some evidence cited is below the necessary grade. … The citation
 * doesn't have to be severed."*
 *
 * ---- ON THE BLIND-ASSERTION CLASS, WHICH THIS SUITE DEFENDS AGAINST TWICE
 *
 * Four items on 2026-08-10 shipped an expectation derived from the thing under
 * test. Two blocks here take their expectations from documents this worker may
 * not edit and did not write:
 *   §7 PARSES `schema.mjs`'s own `role` column comment for the two-term
 *      vocabulary, so `Store.MEMBER_ROLES` and `CASE_MEMBER_ROLES` are checked
 *      against the SCHEMA rather than against each other.
 *   §9 PARSES `CASE-AS-PRODUCTION.md`'s CASE-2 bullet for the clauses this item
 *      owes, and looks in `docs/development/` AND `docs/archive/` because CASE-6
 *      archives that file. CASE-1's block 3 is the precedent and the shape.
 *
 * ---- WHAT IS REMOVED, ASSERTED AS ABSENCE (§7)
 *
 * A removal proved by "the op stopped answering" is not proved. `#requiredStrengthFor`
 * is asserted GONE FROM THE SOURCE, and its replacement is asserted to walk no
 * edges at all — because a composition surviving under a new name would pass
 * every behavioural arm in this file.
 *
 * Every assertion that ratifies signs a real `bio-ratify` statement with stock
 * ssh-keygen, so this suite SKIPS LOUDLY WITH A NAMED REASON when ssh-keygen is
 * not on PATH rather than dying mid-run (publish.test.mjs's precedent, D-93).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CASE_MEMBER_ROLES } from "../checks/bio-checks.mjs";
import { SCHEMA } from "../src/schema.mjs";

if (spawnSync("ssh-keygen", ["-Q"]).error) {
  console.log("\n--- caseproduction ---");
  console.log("  SKIP  entire suite — ssh-keygen is not on PATH");
  console.log("caseproduction: SKIPPED — ssh-keygen not on PATH; the ratify-side arms need a real "
    + "bio-ratify signature and the case-production machinery cannot be exercised without one");
  process.exit(0);
}

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-case2", MEMBER_TOKEN: "mem-case2", PROBE_TOKEN: "prb-case2", VERSION: "test" },
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

/* THE ACT UNDER TEST, DRIVEN THROUGH THE CONTROL PLANE — a real caller's only
   route, and the literal `op=publish` uninterpolated so coverage credits it
   there (D-43: op=invitelook shipped with a ReferenceError while 1276
   store-level assertions passed). */
const publish = async (tok, body) => rP(await POST(`op=publish&token=${tok}`, body));
const conclude = async (tok, { target, conclusion, falsifier }) =>
  rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`));
const strengthbar = async (tok, body) => rP(await POST(`op=strengthbar&token=${tok}`, body));
const shaOf = async (id) => ((await GET("op=list&token=mem-case2")).result || [])
  .find((b) => b.bundle_id === id)?.bundle_sha;
const stateOf = async (id) => ((await GET("op=list&token=mem-case2")).result || [])
  .find((b) => b.bundle_id === id)?.current_state;
const imageOf = async (id) => (await GET(`op=image&token=mem-case2&id=${encodeURIComponent(id)}`)).result?.["bundle.md"];

/* ---- keys and roster ---- */
const dir = mkdtempSync(join(tmpdir(), "case2-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "pilar", "-f", join(dir, "pilar"), "-q"]);
const keyB64 = readFileSync(join(dir, "pilar.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "pilar"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};
const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-case2", { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "nadia-passphrase-1", "admin", ["contribute", "publish", "create_projects"]);
/* 4.2/4.3: the SECOND member of a group must be an administrator, and there are
   no ordinary members until two exist. */
await enrol("omar", "omar-passphrase-1", "admin", ["contribute", "publish"]);
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member", ["contribute", "publish"]);
/* RUTH holds the PUBLISH CAPABILITY and is NOT an owner of the project, which is
   what makes §3 measure DEC-72's fence rather than the capability layer beneath
   it — a member refused for lacking `publish` would prove nothing about
   ownership. She is a joined PARTICIPANT of the project too, so the arm
   separates "contributes to the work" from "puts the project's name on it". */
const RUTH = await enrol("ruth", "ruth-passphrase-1", "member", ["contribute", "publish"]);
rP(await POST("op=signeradd&token=adm-case2", { keyB64, memberId: "pilar", comment: "pilar laptop" }));

/* ---- documents ---- */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : [])])]
  : [];
const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open",
                         refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  retrieved: "2026-06-01T00:00:00Z"', "  method: capture",
  "---", "", "## What This Is", "", "A document.", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = (id, { refs = [], bar = null } = {}) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "Project ${id}"`, "current_state: investigating", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", 'objective: "Decide whether to refer this to the auditor."',
  ...(bar ? ["required_strength:", `  capture: ${bar.capture}`, `  connection: ${bar.connection}`,
             `  author: ${bar.author}`, `  at: "${bar.at}"`] : []),
  "---", "", "## Thesis Summary", "", "A project.", "",
  "## Open Questions", "", "## Ruled Out", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const promote = async (id, md, type, state, tok = PILAR, base = null) => rP(await POST(`op=promote&token=${tok}`, {
  bundleId: id, base, snapKey: `20260810T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
  meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
          current_state: state, created: NOW, last_updated: LATER },
  files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }]
    : [],
}));
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) throw new Error(`promote ${a[0]}: ${JSON.stringify(r)}`);
  return r;
};

/* ===================================================== 1. the fixture, PRINTED */
console.log("\n--- 1. the fixture: two projects, one owner who is not the creator, and findings of two strengths ---");

const INFO_CAP = "INFO-2026-2200-capture-b";
const INFO_CONN = "INFO-2026-2200-connection-c";
const PROJ = "PROJ-2026-2200-auditor";
const PROJ_OTHER = "PROJ-2026-2200-other";
/* STRONG derives (capture B, connection B) and WEAK derives (capture B,
   connection C). The project's bar is (B, B). So STRONG clears it and WEAK does
   NOT — on the CONNECTION axis only, which is deliberate: a single-axis
   shortfall is what a per-axis comparison sees and a composed one does not. */
const INQ_STRONG = "INQ-2026-2200-strong";
const INQ_WEAK = "INQ-2026-2200-weak";
const INQ_SPARE = "INQ-2026-2200-spare";
/* FOUR FINDINGS WHOSE ONLY JOB IS TO BE REFUSED, AND THEY EXIST BECAUSE THE
   CONTROLS MEASURED THAT THEY HAD TO. Arms (C) and (D) each turn one of this
   item's REFUSALS into a SUCCESS — that is what a control does — and a refusal
   that becomes a success MOVES THE RECORD: the act publishes, the members leave
   `concluded`, and every later act in the suite meets a case that has already
   happened. On the first control run that cascade brought down §5's ACCEPTANCE
   arm under arm (D), which is precisely the arm that distinguishes "the gate
   works" from "the gate refuses everything" — so the cascade was destroying the
   one measurement the item most needs.
   Giving each removal-arm's act ITS OWN members makes the arms independent
   rather than merely declared independent. It is the same reasoning that put
   `mustFail`/`mustNotFail` per suite in the driver: an arm that can only be read
   through another arm's wreckage is not armed alone. */
const INQ_SUPP_A = "INQ-2026-2200-allsupp-a";
const INQ_SUPP_B = "INQ-2026-2200-allsupp-b";
const INQ_BAR_A = "INQ-2026-2200-barpair-strong";
const INQ_BAR_B = "INQ-2026-2200-barpair-weak";

await mustPromote(INFO_CAP, infoMd(INFO_CAP), "information", "collected");
await mustPromote(INFO_CONN, infoMd(INFO_CONN), "information", "collected");
const legs = (connGrade) => [
  { target: INFO_CAP, grade: "B", axis: "capture", source: "capture" },
  { target: INFO_CONN, grade: connGrade, axis: "connection", source: "hunch",
    author: "pilar", date: "2026-08-10" }];
await mustPromote(INQ_STRONG, inquiryMd(INQ_STRONG,
  { question: "Was the sewer transfer authorised?", refs: [INFO_CAP, INFO_CONN], legs: legs("B") }),
  "inquiry", "open");
await mustPromote(INQ_WEAK, inquiryMd(INQ_WEAK,
  { question: "Did the marina fund contribute?", refs: [INFO_CAP, INFO_CONN], legs: legs("C") }),
  "inquiry", "open");
await mustPromote(INQ_SPARE, inquiryMd(INQ_SPARE,
  { question: "Who indexed the memo?", refs: [INFO_CAP, INFO_CONN], legs: legs("C") }),
  "inquiry", "open");
/* The refusal-only members. INQ_BAR_A clears the bar and INQ_BAR_B does not, so
   §5's refusal act has the same shape as its acceptance act and the two differ
   in nothing but which findings they name. */
await mustPromote(INQ_SUPP_A, inquiryMd(INQ_SUPP_A,
  { question: "Was the notice posted?", refs: [INFO_CAP, INFO_CONN], legs: legs("B") }), "inquiry", "open");
await mustPromote(INQ_SUPP_B, inquiryMd(INQ_SUPP_B,
  { question: "Was the notice posted in time?", refs: [INFO_CAP, INFO_CONN], legs: legs("C") }), "inquiry", "open");
await mustPromote(INQ_BAR_A, inquiryMd(INQ_BAR_A,
  { question: "Did the clerk receive it?", refs: [INFO_CAP, INFO_CONN], legs: legs("B") }), "inquiry", "open");
await mustPromote(INQ_BAR_B, inquiryMd(INQ_BAR_B,
  { question: "Did the clerk acknowledge it?", refs: [INFO_CAP, INFO_CONN], legs: legs("C") }), "inquiry", "open");

const BAR = { capture: "B", connection: "B", author: "nadia", at: "2026-07-03T00:00:00Z" };
await mustPromote(PROJ, projectMd(PROJ, { bar: BAR }), "project", "investigating", NADIA);
await mustPromote(PROJ_OTHER, projectMd(PROJ_OTHER), "project", "investigating", NADIA);

/* THE ROSTER, PERFORMED THROUGH THE PLANE'S OWN ACTS rather than written into a
   table. `op=promote` made NADIA the owner (Membership Architecture v2 7.1: the
   creator is the owner), so PILAR reaches ownership the way anyone does — invited
   by an owner, joining herself, added as an owner by the sole existing one (7.10
   permits that unilaterally). RUTH joins and is NOT made an owner, which is the
   fixture §3 measures against. */
{
  const stub = await mf.getDurableObjectNamespace("STORE");
  const obj = stub.get(stub.idFromName("bio"));
  const doGet = async (op, qs) => rP(await (await obj.fetch(`http://x/${op}?${qs}`)).json());
  const step = async (label, r) => {
    if (r.ok !== true) throw new Error(`${label}: ${JSON.stringify(r)}`);
    return r;
  };
  await step("invite pilar", await doGet("projectinvite", `projectId=${PROJ}&handle=pilar&by=nadia`));
  await step("join pilar", await doGet("projectjoin", `projectId=${PROJ}&by=pilar`));
  await step("own pilar", await doGet("projectowneradd", `projectId=${PROJ}&handle=pilar&by=nadia`));
  await step("invite ruth", await doGet("projectinvite", `projectId=${PROJ}&handle=ruth&by=nadia`));
  await step("join ruth", await doGet("projectjoin", `projectId=${PROJ}&by=ruth`));
  await step("invite pilar other", await doGet("projectinvite", `projectId=${PROJ_OTHER}&handle=pilar&by=nadia`));
  await step("join pilar other", await doGet("projectjoin", `projectId=${PROJ_OTHER}&by=pilar`));
}

await conclude(PILAR, { target: INQ_STRONG, conclusion: "The transfer rests on a memo nobody adopted.",
  falsifier: "An adopted resolution naming the transfer would overturn this." });
await conclude(PILAR, { target: INQ_WEAK, conclusion: "Undetermined on the present record.",
  falsifier: "A signature page would settle it." });
await conclude(PILAR, { target: INQ_SPARE, conclusion: "Undetermined on the present record.",
  falsifier: "The clerk's index would settle it." });
for (const id of [INQ_SUPP_A, INQ_SUPP_B, INQ_BAR_A, INQ_BAR_B])
  await conclude(PILAR, { target: id, conclusion: "Undetermined on the present record.",
    falsifier: "A signature page would settle it." });

/* FIXTURE GUARDS. An assertion over a fixture that did not land passes for free,
   and the two grade facts below are what every arm in §5 and §6 rests on. */
const strengthOf = async (id) => rP(await GET(`op=inquirystrength&token=${PILAR}&id=${encodeURIComponent(id)}`));
const sStrong = await strengthOf(INQ_STRONG);
const sWeak = await strengthOf(INQ_WEAK);
t("FIXTURE GUARD: the STRONG finding really derives (capture B, connection B) — it CLEARS the bar",
  [sStrong.capture.grade, sStrong.connection.grade], ["B", "B"]);
t("FIXTURE GUARD: the WEAK finding really derives (capture B, connection C) — it falls short on ONE "
+ "axis, which is what a per-axis comparison sees and a composed one does not",
  [sWeak.capture.grade, sWeak.connection.grade], ["B", "C"]);
t("FIXTURE GUARD: the project really declares (capture B, connection B), read back through the op",
  [(await GET(`op=strengthbarof&token=${PILAR}&project=${PROJ}`)).result.bar.capture,
   (await GET(`op=strengthbarof&token=${PILAR}&project=${PROJ}`)).result.bar.connection], ["B", "B"]);
t("FIXTURE GUARD: pilar is an OWNER of the publishing project and ruth is a joined participant who "
+ "is NOT — so §3 measures DEC-72's fence and not the capability layer beneath it",
  (await GET(`op=projectownerarith&token=${PILAR}&projectId=${PROJ}`)).result.live.owners, 2);

const CEREMONY = {
  scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
  statement: "This case covers the FY2024 transfer only, on the documents in hand at edition 1.",
  excluded: [{ description: "any 2019 council minutes", reason: "not requested; outside the period at issue" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
  biasAcknowledgement: "This group holds a declared position that municipal fund transfers should be "
    + "adopted in public session, and edition 1 reads the FY2024 record through it.",
};

/* ============================== 2. the project-less path, refused BY NAME */
console.log("\n--- 2. DEC-72: publication is a production of a PROJECT, and a project-less one is refused by name ---");
{
  /* **CASE-1 HANDED THIS ARM OVER BY NAME.** Its own report: *"`project_id NOT
     NULL` is NOT driven through an op — nothing writes `cases` until CASE-2 — so
     it is pinned structurally and the suite header says so. CASE-2's first arm
     should be a project-less publish refused BY NAME."* This is that arm, and it
     is what turns a NOT NULL constraint into a refusal a member can read. */
  const none = await publish(PILAR, { ...CEREMONY, target: INQ_STRONG,
    roles: { [INQ_STRONG]: "load_bearing" } });
  t("A PUBLICATION NAMING NO PROJECT IS REFUSED BY NAME — CASE-1's handed-over arm, and what makes "
  + "`cases.project_id NOT NULL` real through an op instead of only in the schema",
    [none.ok, none.reason], [false, "NO_PUBLISHING_PROJECT"]);
  t("and the refusal SAYS WHAT IS MISSING AND WHY, rather than naming a constraint: the project is "
  + "what supplies the standard of evidence, so a project-less case is one whose bar nobody declared",
    [String(none.detail).includes("PRODUCTION OF A PROJECT"),
     String(none.detail).includes("standard of evidence")], [true, true]);
  t("NOTHING MOVED: the finding is still exactly concluded, because every refusal fires before any "
  + "member is touched", await stateOf(INQ_STRONG), "concluded");
  t("a project that does not exist is refused as absent, not as a constraint violation",
    (await publish(PILAR, { ...CEREMONY, target: INQ_STRONG, project: "PROJ-2026-9999-nope",
      roles: { [INQ_STRONG]: "load_bearing" } })).reason, "NO_SUCH_PROJECT");
  t("and an id that is not a project is refused as the wrong kind of thing — only a PROJECT has a "
  + "standard of evidence to hold a case to",
    (await publish(PILAR, { ...CEREMONY, target: INQ_STRONG, project: INFO_CAP,
      roles: { [INQ_STRONG]: "load_bearing" } })).reason, "NOT_A_PROJECT");
}

/* ====================================== 3. the owner fence, and only the owner */
console.log("\n--- 3. DEC-72 clause 5: publication is wielded at the top of a project's roster ---");
{
  const notOwner = await publish(RUTH, { ...CEREMONY, target: INQ_STRONG, project: PROJ,
    roles: { [INQ_STRONG]: "load_bearing" } });
  t("A JOINED PARTICIPANT WHO IS NOT AN OWNER IS REFUSED — and she holds the `publish` capability, "
  + "so this is DEC-72's fence and not the capability layer answering for it",
    [notOwner.ok, notOwner.reason], [false, "NOT_THE_PROJECT_OWNER"]);
  t("the refusal distinguishes contributing to the work from putting the project's name on it",
    String(notOwner.detail).includes("contributes to the work without putting the project's name on it"),
    true);
  /* PILAR is a joined participant of PROJ_OTHER and NOT an owner of it, so this
     arm separates "owner somewhere" from "owner HERE" — a fence keyed on the
     member rather than on the pair would pass the arm above and fail this one. */
  const wrongProject = await publish(PILAR, { ...CEREMONY, target: INQ_STRONG, project: PROJ_OTHER,
    roles: { [INQ_STRONG]: "load_bearing" } });
  t("AND OWNERSHIP IS OF A PROJECT, NOT A STANDING: pilar owns one project and publishes as another "
  + "she merely joined — refused, because the fence is keyed on the PAIR",
    [wrongProject.ok, wrongProject.reason], [false, "NOT_THE_PROJECT_OWNER"]);
  t("a machine credential is refused before any of this, and by its own name — DEC-49's fence is "
  + "untouched and still fires first",
    (await publish("mem-case2", { ...CEREMONY, target: INQ_STRONG, project: PROJ,
      roles: { [INQ_STRONG]: "load_bearing" } })).reason, "MACHINE_CANNOT_PUBLISH");
  t("NOTHING MOVED under any of the four", await stateOf(INQ_STRONG), "concluded");
}

/* ============================ 4. the authored partition, and its two refusals */
console.log("\n--- 4. DEC-72 clause 4: the partition is AUTHORED, and there is no default ---");
{
  const noRole = await publish(PILAR, { ...CEREMONY, targets: [INQ_STRONG, INQ_WEAK], project: PROJ,
    roles: { [INQ_STRONG]: "load_bearing" } });
  t("A MEMBER WITH NO AUTHORED DESIGNATION IS REFUSED, AND THE REFUSAL NAMES IT — CASE-1 left no "
  + "DEFAULT on `published_case_members.role` precisely so this refusal could exist",
    [noRole.ok, noRole.reason, noRole.target], [false, "NO_MEMBER_ROLE", INQ_WEAK]);
  t("and it says why a default would be wrong: a member designated by omission was designated by nobody",
    String(noRole.detail).includes("designated by omission was designated by nobody"), true);
  t("a designation outside the record's own two terms is refused, naming the member and the terms",
    [(await publish(PILAR, { ...CEREMONY, target: INQ_STRONG, project: PROJ,
       roles: { [INQ_STRONG]: "critical" } })).reason,
     (await publish(PILAR, { ...CEREMONY, target: INQ_STRONG, project: PROJ,
       roles: { [INQ_STRONG]: "critical" } })).allowed], ["BAD_MEMBER_ROLE", CASE_MEMBER_ROLES]);
  t("a roles LIST rather than a map is refused as a shape, because a list is positional against the "
  + "roster and a partition that can silently reorder is not one anybody authored",
    (await publish(PILAR, { ...CEREMONY, target: INQ_STRONG, project: PROJ,
      roles: [{ target: INQ_STRONG, role: "load_bearing" }] })).reason, "BAD_ROLES");
  /* DEC-72'S SECOND RULED DEFAULT — driven on ITS OWN MEMBERS, so that the arm
     which removes this refusal cannot move the record §5 then measures. */
  const allSupporting = await publish(PILAR, { ...CEREMONY,
    scope: "Whether notice of the transfer was posted, on the documents in hand.",
    statement: "This case covers the notice question only, at edition 1.",
    targets: [INQ_SUPP_A, INQ_SUPP_B], project: PROJ,
    roles: { [INQ_SUPP_A]: "supporting", [INQ_SUPP_B]: "supporting" } });
  t("AN ALL-SUPPORTING CASE IS REFUSED: a case rests on at least one load-bearing finding, and this "
  + "one asserts nothing conclusively while its completeness assertion claims coverage",
    [allSupporting.ok, allSupporting.reason], [false, "NO_LOAD_BEARING_MEMBER"]);
  t("NOTHING MOVED under any of the five",
    [await stateOf(INQ_STRONG), await stateOf(INQ_WEAK), await stateOf(INQ_SUPP_A)],
    ["concluded", "concluded", "concluded"]);
}

/* ========== 5. THE PAIR — the item's whole shape, asserted as ONE comparison */
console.log("\n--- 5. THE PAIR: the SAME finding, below the SAME bar, refused as load-bearing and accepted as supporting ---");
{
  /* THE REFUSAL, ON ITS OWN MEMBERS. INQ_BAR_B derives connection C against a
     declared connection B. It is a SEPARATE PAIR from the acceptance act below
     for a reason the controls measured rather than a reason of taste: arm (D)
     turns this refusal into a SUCCESS, and a success here would publish the
     acceptance act's members out from under it — bringing down the very arm that
     distinguishes a working gate from a wall. Same shape, same grades, same bar,
     different ids. */
  const below = await publish(PILAR, { ...CEREMONY,
    scope: "Whether the clerk received and acknowledged the transfer memo.",
    statement: "This case covers the receipt question only, at edition 1.",
    targets: [INQ_BAR_A, INQ_BAR_B], project: PROJ,
    roles: { [INQ_BAR_A]: "load_bearing", [INQ_BAR_B]: "load_bearing" } });
  t("A LOAD-BEARING MEMBER BELOW THE PROJECT'S STANDARD IS REFUSED, naming the member, the axis, the "
  + "bar and what it actually reached — a member is told what is short, not that something is",
    [below.ok, below.reason, below.target, below.axis, below.required, below.reached, below.project],
    [false, "BELOW_PROJECT_STRENGTH", INQ_BAR_B, "connection", "B", "C", PROJ]);
  t("and the refusal offers the HONEST move rather than the expedient one: designate it supporting, "
  + "never sever a citation that is true (Bob, on DEC-71)",
    [String(below.detail).includes("designate it"), String(below.detail).includes("never severing")],
    [true, true]);

  /* THE ACCEPTANCE. THE SAME FINDING, THE SAME GRADES, THE SAME BAR, THE SAME
     ACT — and one word different. Everything else is held fixed on purpose:
     if the two arms differed in any other respect this pair would prove nothing. */
  const ok = await publish(PILAR, { ...CEREMONY, targets: [INQ_STRONG, INQ_WEAK], project: PROJ,
    roles: { [INQ_STRONG]: "load_bearing", [INQ_WEAK]: "supporting" } });
  /* READ DEFENSIVELY FROM HERE ON, AND IT IS NOT TIDINESS. Several arms of this
     item's own control let an act SUCCEED that this suite expects to be refused
     — arm (B) neuters the owner fence, so a member publishes in §3 and every act
     after it meets a case that has already moved. **A CRASH NAMES NOTHING**: a
     TypeError inside an assertion goes through no assertion at all, the battery
     reports `assertions unknown`, and the control's own finding is destroyed by
     the way the suite reads. That is `publishedcase.test.mjs` block 8's recorded
     lesson and it was earned here the same way — arm (B)'s first run threw at
     this exact line and reported NO TALLY beside twelve correctly-named
     failures. */
  const weak = (ok.findings || []).find((f) => f.target === INQ_WEAK) || {};
  t("THE SAME FINDING, THE SAME GRADES, THE SAME BAR — DESIGNATED SUPPORTING, IT PUBLISHES. One word "
  + "is the only difference between this act and the refusal above, and that is the whole item",
    [ok.ok, ok.edition ?? null, (ok.findings || []).length], [true, 1, 2]);
  t("Bob's DEC-71 input, enacted: the bar gates the FINDINGS a case rests on, never every piece of "
  + "evidence — the draft agenda travels with the report and the citation is not severed",
    ok.roles ?? null, [{ target: INQ_STRONG, role: "load_bearing" }, { target: INQ_WEAK, role: "supporting" }]);
  t("AND IT IS MARKED, not merely tolerated: the act reports each member's designation beside its "
  + "own derived strength and the case's bar, which is what lets a reader see it is not load-bearing",
    [weak.role ?? null,
     (weak.strength || []).find((s) => s.axis === "connection")?.grade ?? null,
     weak.required?.connection ?? null],
    ["supporting", "C", "B"]);
  /* MARKED IN THE SIGNED BYTES, which is where a stranger reads it. */
  const weakBytes = await imageOf(INQ_WEAK);
  const strongBytes = await imageOf(INQ_STRONG);
  t("MARKED INSIDE THE BYTES THE MEMBER SIGNS, and the WHOLE partition is in EACH of them — so a "
  + "stranger holding the SUPPORTING finding can see both that it was not presented as carrying the "
  + "case and that the case had a load-bearing member at all",
    [/case_roles:\n\s+- target: INQ-2026-2200-strong\n\s+role: load_bearing\n\s+- target: INQ-2026-2200-weak\n\s+role: supporting/.test(weakBytes),
     /case_roles:\n\s+- target: INQ-2026-2200-strong\n\s+role: load_bearing\n\s+- target: INQ-2026-2200-weak\n\s+role: supporting/.test(strongBytes)],
    [true, true]);
  t("and whose PRODUCTION it is, in both, for the same reason",
    [/\ncase_project: PROJ-2026-2200-auditor\n/.test(weakBytes),
     /\ncase_project: PROJ-2026-2200-auditor\n/.test(strongBytes)], [true, true]);
  t("the stamped bar names the project it came from and is the SAME on both members — the bar is the "
  + "CASE's property, so two members held to different standards is a state this act cannot produce",
    [/required_strength:[\s\S]{0,200}?project: PROJ-2026-2200-auditor/.test(weakBytes),
     /required_strength:[\s\S]{0,200}?project: PROJ-2026-2200-auditor/.test(strongBytes)], [true, true]);
  t("and `source: group` NEVER APPEARS in a published bar again: the group default is not a "
  + "publication bar (DEC-72), and this is the assertion that would catch it coming back",
    [/source: group/.test(weakBytes), /source: group/.test(strongBytes)], [false, false]);
}

/* ================================= 6. over-strictness: a good case still ships */
console.log("\n--- 6. OVER-STRICTNESS: a case that legitimately meets the bar must still publish ---");
{
  /* A GATE THAT REFUSES EVERYTHING PASSES EVERY ARM ABOVE. This block is what
     distinguishes "the fence works" from "the fence is a wall", and it is armed
     as its own control in (D)/(E) of the declaration at the head of this file. */
  const solo = await publish(PILAR, { ...CEREMONY,
    scope: "Whether the clerk indexed the memo, on the documents in hand.",
    statement: "This case covers the indexing question only, at edition 1.",
    biasAcknowledgement: "The same declared position on public adoption is in force; this case reads "
      + "the clerk's index through it, which is the first source here the group did not itself request.",
    targets: [INQ_SPARE], project: PROJ, roles: { [INQ_SPARE]: "supporting" } });
  t("VACUITY GUARD, and it is what makes the arm below mean something: a SINGLE supporting member is "
  + "still refused, so 'a case published' below cannot be satisfied by the gate having given up",
    [solo.ok, solo.reason], [false, "NO_LOAD_BEARING_MEMBER"]);
  /* THE SAME REFUSAL, RE-DRIVEN HERE so this block is visibly testing the fence
     §5 tested and not a different one — and driven on §5's OWN refusal-only
     member rather than on INQ_SPARE. That is the fixture-independence rule
     again, at the last place it bites: arm (D) turns this probe into a SUCCESS,
     and if it ran on INQ_SPARE it would publish the member the over-strictness
     arm below needs still-concluded, bringing down the one assertion in this
     suite that says a good case still ships. Measured on the control's third
     run, corrected here rather than in the declaration. */
  const good = await publish(PILAR, { ...CEREMONY,
    scope: "Whether the clerk acknowledged receipt, on the documents in hand.",
    statement: "This case covers the acknowledgement question only, at edition 1.",
    biasAcknowledgement: "The same declared position on public adoption is in force; this case reads "
      + "the clerk's acknowledgement through it, and says so as of this edition.",
    targets: [INQ_BAR_A, INQ_BAR_B], project: PROJ,
    roles: { [INQ_BAR_A]: "load_bearing", [INQ_BAR_B]: "load_bearing" } });
  t("a load-bearing member below the bar is refused HERE TOO, so this block is not smuggling a "
  + "different fixture past a different fence",
    [good.ok, good.reason, good.target], [false, "BELOW_PROJECT_STRENGTH", INQ_BAR_B]);
  /* NOW THE PROJECT LOWERS ITS OWN BAR — DEC-17's surviving mechanism, an
     authored, dated, on-the-record act — and the SAME case publishes unchanged.
     Nothing about the findings moved; the standard did, and somebody wrote it
     down. That is the over-strictness arm in its strongest form: the gate lets
     work through the moment the record says it should. */
  await mustPromote(PROJ, projectMd(PROJ, { bar: { capture: "B", connection: "C",
    author: "nadia", at: "2026-08-10T00:00:00Z" } }), "project", "investigating", NADIA, await shaOf(PROJ));
  const now = await publish(PILAR, { ...CEREMONY,
    scope: "Whether the clerk indexed the memo, on the documents in hand.",
    statement: "This case covers the indexing question only, at edition 1.",
    biasAcknowledgement: "The same declared position on public adoption is in force; this case reads "
      + "the clerk's index through it, which is the first source here the group did not itself request.",
    targets: [INQ_SPARE], project: PROJ, roles: { [INQ_SPARE]: "load_bearing" } });
  t("THE PROJECT LOWERS ITS OWN BAR ON THE RECORD AND THE SAME CASE PUBLISHES — nothing about the "
  + "finding changed, the STANDARD did, and somebody authored the change in the project's own bytes",
    [now.ok, now.edition ?? null, (now.findings || [])[0]?.role ?? null, now.required?.connection ?? null],
    [true, 1, "load_bearing", "C"]);
  t("AND THE BAR IS READ AT ACT TIME: the case that published a moment ago under (B, B) still carries "
  + "(B, B) in its own frozen bytes — a later amendment never moves a case already published",
    /required_strength:[\s\S]{0,220}?connection: B/.test(await imageOf(INQ_STRONG)), true);
}

/* ================== 7. WHAT WAS REMOVED, asserted as ABSENCE off the source */
console.log("\n--- 7. the removal: DEC-17's composition and the group-default publication bar are GONE ---");
{
  /* A REMOVAL PROVED BY "THE OP STOPPED ANSWERING" IS NOT PROVED. A composition
     surviving under a new name passes every behavioural arm in this file. */
  t("`#requiredStrengthFor` IS GONE FROM THE PLANE ENTIRELY — DEC-17's strictest-across-citers "
  + "composition cannot be reached by any door, which the supersession table calls for in those words",
    /#requiredStrengthFor\s*\(/.test(STORE_SRC), false);
  const bodyOf = (name) => {
    const at = STORE_SRC.indexOf(name);
    return at < 0 ? "" : STORE_SRC.slice(at, at + 1400);
  };
  const pb = bodyOf("#projectBar(projectId) {");
  t("and its replacement WALKS NO EDGES AT ALL: #projectBar reads ONE project's bundle.md and "
  + "consults neither the refs table nor the severance predicate — a walk left standing would be the "
  + "composition surviving in a new name",
    [pb.length > 0, pb.includes("FROM refs"), pb.includes("#refEdgeSevered"), pb.includes("group_strength_bar")],
    [true, false, false, false]);
  t("THE GROUP DEFAULT IS NOT A PUBLICATION BAR: the group declares one, a project declares nothing, "
  + "and the project's answer is ABSENT rather than the group's — the removed path made visible",
    await (async () => {
      const set = await strengthbar(NADIA, { capture: "A", connection: "A" });
      const other = rP(await GET(`op=strengthbarof&token=${PILAR}&project=${PROJ_OTHER}`));
      return [set.ok, set.capture, other.bar.declared, other.bar.source, other.bar.capture];
    })(), [true, "A", false, "none", null]);
  t("and DEC-17's SURVIVING HALF stands and says what it is for — the group default SEEDS a new "
  + "project, which is the half the supersession table explicitly keeps",
    await (async () => {
      const g = rP(await GET(`op=strengthbarof&token=${PILAR}&group=believe-in-oakland`));
      return [g.ok, g.bar.capture, g.seeds_new_projects];
    })(), [true, "A", true]);
  t("a FINDING's bar is refused by name rather than answered, because no bar attaches to a finding",
    rP(await GET(`op=strengthbarof&token=${PILAR}&target=${INQ_STRONG}`)).reason,
    "BAR_IS_A_PROJECT_PROPERTY");
}

/* ========= 8. ratification: the project and the partition come off SIGNED bytes */
console.log("\n--- 8. the record commits what was SIGNED: `cases` and the member roles, out of the bytes ---");
{
  const ratify = async (id) => {
    const bundleSha = await shaOf(id);
    return rP(await POST(`op=ratify&token=${PILAR}`,
      { bundleId: id, expectedSha: bundleSha, sig: signRatify(id, bundleSha) }));
  };
  const r1 = await ratify(INQ_STRONG);
  t("the first member of the two-finding case ratifies, opening the case row", r1.ok, true);

  /* ==== THE ADVERSARIES, AND THEY ARE WHY THE DIVERGENCE REFUSALS ARE MORE
     THAN A COMMENT. Every member of a case published through `op=publish`
     carries the same case facts BY CONSTRUCTION, so a divergence refusal can be
     deleted outright with a whole suite green unless something drives the
     HAND-WRITTEN door — `op=promote`. That is REC-44's control (c) finding,
     recorded in `multifinding.test.mjs`, and it applies exactly to the two facts
     this item adds. The bytes are tampered in ONE place and nowhere else. */
  const weakMd = await imageOf(INQ_WEAK);
  const swapLine = (md, key, line) => md.replace(new RegExp(`^${key}: .*$`, "m"), line);
  const liveSha = async (id) => await shaOf(id);

  /* ADVERSARY 1 — THE PRODUCING PROJECT DISAGREES. INQ_WEAK's bytes name
     PROJ_OTHER while the ratified case row says PROJ. A case that could change
     hands between members is a case whose STANDARD OF EVIDENCE has two answers
     and nobody authored either. */
  const projectLie = swapLine(weakMd, "case_project", `case_project: ${PROJ_OTHER}`);
  const p1 = await promote(INQ_WEAK, projectLie, "inquiry", "published", PILAR, await liveSha(INQ_WEAK));
  t("(fixture) the tampered bytes really promoted — the adversary is through the hand-written door, "
  + "which is the only door a case's members do not all agree by construction", p1.ok, true);
  const a1 = await ratify(INQ_WEAK);
  t("A MEMBER WHOSE SIGNED BYTES NAME A DIFFERENT PRODUCING PROJECT IS REFUSED BY NAME, never "
  + "reconciled — CASE-1 keyed `cases` on case_id ALONE so this is unrepresentable in the table, and "
  + "this refusal is what makes that a message rather than a constraint error",
    [a1.ok, a1.reason, a1.declared, a1.signed],
    [false, "CASE_PRODUCTION_DIVERGED", PROJ, PROJ_OTHER]);

  /* ADVERSARY 2 — THE PARTITION DISAGREES. The project now matches; what differs
     is which member the case RESTS ON. Two members who signed different
     partitions have not published one case, and reconciling silently would let
     the record present as load-bearing a finding only one of them designated. */
  const roleLie = (await imageOf(INQ_WEAK))
    .replace(/^case_roles:.*(?:\n[ -].*)*/m,
      `case_roles:\n  - target: ${INQ_STRONG}\n    role: supporting\n  - target: ${INQ_WEAK}\n    role: load_bearing`)
    .replace(new RegExp(`^case_project: .*$`, "m"), `case_project: ${PROJ}`);
  const p2 = await promote(INQ_WEAK, roleLie, "inquiry", "published", PILAR, await liveSha(INQ_WEAK));
  t("(fixture) the second tamper promoted too", p2.ok, true);
  const a2 = await ratify(INQ_WEAK);
  t("AND A MEMBER WHOSE SIGNED BYTES DESIGNATE THE CASE DIFFERENTLY IS REFUSED BY NAME: which "
  + "findings a case RESTS ON is part of what every member signed",
    [a2.ok, a2.reason], [false, "CASE_ROLES_DIVERGED"]);

  /* ADVERSARY 3 — THE BYTES CARRY A CASE AND NAME NO PROJECT AT ALL. This is the
     shape DEC-72 deletes, arriving at ratification rather than at the act.

     **AND THE ROUTE TO IT IS A MEASUREMENT WORTH RECORDING, BECAUSE THE FIRST
     VERSION OF THIS ARM ASSERTED THE OPPOSITE AND WAS WRONG.** It declared that
     the GATE would refuse these bytes at `op=promote` (C-2.8 requires
     `case_project` on `published`) and that the committer's refusal was
     therefore unreachable. Driven, `op=promote` ACCEPTED them — `[ok: true,
     reason: null]`. The control was then pointed at a field that has been
     C-2.8-required since REC-44: removing `case_scope` from an already-published
     document is accepted too, `[true, null]`. **So this is PRE-EXISTING
     behaviour of re-promoting an already-`published` document and NOT something
     this item introduced** — measured in both directions rather than assumed
     from either. It is reported as a finding rather than fixed here, because a
     gate's re-entry conditions are not CASE-2's scope.
     **WHERE THE FENCE ACTUALLY IS, DRIVEN IN BOTH STEPS RATHER THAN ASSUMED AT
     EITHER:** `op=promote` accepts the bytes; `op=ratify` runs C-2.8 and refuses
     them as `GATE_REFUSED` before the committer is reached. So the plane is
     closed and the ORDER is now recorded instead of guessed — which matters,
     because the two steps were assumed to behave the same way and they do not.
     The consequence for THIS suite is a stated limit rather than a claim of
     coverage: `CASE_NAMES_NO_PROJECT` is a BELT BEHIND BRACES and nothing here
     can reach it, its reachability belonging to a store whose bytes predate the
     check. An arm that "covered" it would be passing for the wrong reason. */
  const noProjectBytes = (await imageOf(INQ_WEAK)).replace(/^case_project: .*$\n/m, "");
  const p4 = await promote(INQ_WEAK, noProjectBytes, "inquiry", "published", PILAR, await liveSha(INQ_WEAK));
  t("(fixture, and it is the measurement above) op=promote ACCEPTS already-published bytes with a "
  + "C-2.8-required field removed — pre-existing, reproduced on `case_scope` too, and reported "
  + "rather than fixed here", p4.ok, true);
  const a3 = await ratify(INQ_WEAK);
  t("AND RATIFICATION IS WHERE THE FENCE STANDS: the same bytes are refused there, by the GATE "
  + "running C-2.8 — so a case naming no producing project cannot reach the published record by the "
  + "hand-written door either, and the committer's own refusal behind it is a belt this suite "
  + "cannot reach and does not claim to cover",
    [a3.ok, a3.reason], [false, "GATE_REFUSED"]);

  /* RESTORED, AND THE CASE THEN COMPLETES. An adversary that left the record
     broken would make every assertion after it meaningless. */
  const p3 = await promote(INQ_WEAK, weakMd, "inquiry", "published", PILAR, await liveSha(INQ_WEAK));
  t("(fixture) the honest bytes are restored", p3.ok, true);
  const r2 = await ratify(INQ_WEAK);
  t("and the case completes: no adversary reached it, and the second member ratifies on the bytes it "
  + "actually signed", r2.ok, true);
  const man = rP(await GET(`op=publishedmanifest&token=${PILAR}`));
  const theCase = (man.cases || []).find((c) => c.project_id === PROJ);
  t("THE `cases` ROW IS WRITTEN, AND IT NAMES THE PUBLISHING PROJECT — CASE-1 built the table and "
  + "said CASE-2 would be what first writes it; this is that, driven through op=ratify",
    [theCase != null, theCase?.project_id], [true, PROJ]);
  /* DEFENSIVE for §5's own reason: arm (H) makes the committed project a
     literal, so `theCase` is not found and a `.case_id` read throws — destroying
     the arm's four correctly-named failures with a tally of `assertions
     unknown`. Measured on arm (H)'s first run and corrected here. */
  const members = (man.caseMembers || []).filter((m) => m.case_id === (theCase || {}).case_id);
  t("and each MEMBERSHIP ROW carries the designation its own bytes declared — the column CASE-1 "
  + "added with no default is now written by the act that authors it",
    members.map((m) => [m.bundle_id, m.role]).sort(),
    [[INQ_STRONG, "load_bearing"], [INQ_WEAK, "supporting"]].sort());
  /* COMMITTED FROM THE SIGNED BYTES AND FROM NOTHING ELSE — #publishEdges'
     doctrine. This is asserted structurally as well, because a behavioural arm
     cannot tell a value read from a signed document from one read off a request
     that happened to carry the same thing. */
  t("COMMITTED OUT OF THE RATIFIED BYTES AND OUT OF NOTHING ELSE: the control plane reads "
  + "`case_project` and `case_roles` off the parsed frontmatter of the signed document, exactly as it "
  + "reads the roster beside them — a project id taken off a request would be an attribution we made "
  + "on the group's behalf, and a reader cannot tell the two apart",
    [/ratifiedFm\.case_project/.test(readFileSync(fileURLToPath(new URL("../src/index.mjs", import.meta.url)), "utf8")),
     /ratifiedFm\.case_roles/.test(readFileSync(fileURLToPath(new URL("../src/index.mjs", import.meta.url)), "utf8"))],
    [true, true]);
  t("and the ratify committer refuses a member whose bytes name a DIFFERENT producing project, "
  + "rather than reconciling them — a case does not change hands between members",
    /CASE_PRODUCTION_DIVERGED/.test(STORE_SRC), true);
  t("and one whose partition disagrees with the members already ratified, for the same reason: which "
  + "findings a case RESTS ON is part of what every member signed",
    /CASE_ROLES_DIVERGED/.test(STORE_SRC), true);
  /* CASE-1'S PURGE EXEMPTION IS NOT DISTURBED, and the reason is asserted rather
     than asserted-about: `cases` is written at RATIFY and never at publish, so
     this item creates no draft state and the condition CASE-1 named for
     revisiting the exemption ("if a later item lets a case exist as a DRAFT
     before publication") has not been met. */
  t("`op=publish` WRITES NO `cases` ROW — the row is the ratify committer's, which is why CASE-1's "
  + "stated purge exemption is undisturbed and `purge` is untouched by this item",
    /publishCase\([\s\S]{0,40000}?INSERT INTO cases/.test(STORE_SRC), false);
}

/* ========= 9. the design doc is the expectation, PARSED rather than restated */
console.log("\n--- 9. the expectations come from documents this item did not write ---");
{
  /* THE BLIND-ASSERTION DEFENCE, and CASE-1's block 3 is the precedent. An
     expectation derived from the thing under test proves that the thing agrees
     with itself. Both sources below were written BEFORE this code and neither is
     this worker's to edit: `CASE-AS-PRODUCTION.md` is the authority (CASE-6
     archives it, so both locations are searched) and `schema.mjs` is CASE-1's. */
  const DOC = ["../../docs/development/CASE-AS-PRODUCTION.md", "../../docs/archive/CASE-AS-PRODUCTION.md"]
    .map((p) => fileURLToPath(new URL(p, import.meta.url)))
    .find((p) => existsSync(p));
  t("the AUTHORITY is on disk and was found — in docs/development/ or docs/archive/, because CASE-6 "
  + "archives it and an expectation that silently stops being read is worse than none",
    DOC != null, true);
  const TEXT = readFileSync(DOC, "utf8");
  const bullet = /\*\*CASE-2 · publication as the project's production\.\*\*([\s\S]*?)Depends on: CASE-1\./.exec(TEXT)?.[1] ?? "";
  t("the CASE-2 bullet was located in it, so the clauses below are READ and not recited",
    bullet.length > 100, true);
  for (const [clause, present] of [
    ["`publishCase` takes the publishing project", bullet.includes("takes the\n  publishing project")
      || bullet.includes("takes the publishing project")],
    ["owner-only fence", /owner-only fence/.test(bullet)],
    ["the bar read from that project alone at act time", /that project alone at\n?\s*time|from that project alone/.test(bullet)],
    ["at least one load-bearing member", /≥1 load-bearing member/.test(bullet)],
    ["load-bearing members' derived strength ≥ bar", /load-bearing members' derived strength ≥ bar/.test(bullet)],
    ["supporting members exempt and marked", /supporting members exempt and marked/i.test(bullet)],
    ["ceremony unchanged", /ceremony unchanged/.test(bullet)],
    ["strictest-composition and the project-less path removed",
      /strictest-composition and\n?\s*the project-less path removed/.test(bullet)],
  ]) t(`the design doc's own CASE-2 bullet names this clause, so the suite's subject is ITS list: ${clause}`,
       present, true);
  /* THE VOCABULARY, TAKEN FROM THE SCHEMA. Three places now spell these two
     terms — the schema column, `Store.MEMBER_ROLES`, and `CASE_MEMBER_ROLES` in
     the check catalog — and CASE-1 fixed the spelling in the schema saying in as
     many words that it was fixed there "so CASE-2 and CASE-6 do not each invent
     a third". This arm is what enforces that sentence. */
  const declared = [...new Set((/role\s+TEXT,\s+--\s+'([a-z_]+)'\s*\|\s*'([a-z_]+)'/.exec(SCHEMA) || []).slice(1))];
  t("THE TWO TERMS ARE THE SCHEMA'S, PARSED OUT OF `published_case_members.role`'s own comment — not "
  + "restated here, and not compared against another copy of themselves",
    declared, ["load_bearing", "supporting"]);
  t("and the check catalog's exported vocabulary is exactly those two, so the gate refuses against "
  + "the terms the schema stores",
    CASE_MEMBER_ROLES, declared);
  t("and the store's is too — three sites, one spelling, checked against the SCHEMA and never "
  + "against each other",
    (/static MEMBER_ROLES = \[([^\]]*)\]/.exec(STORE_SRC)?.[1] ?? "")
      .split(",").map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean),
    declared);
}

console.log(`\ncaseproduction: ${pass} pass, ${fail} fail`);

} finally {
  await mf.dispose();
}
process.exit(fail ? 1 : 0);
