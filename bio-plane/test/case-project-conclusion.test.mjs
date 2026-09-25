/* NEGATIVE CONTROL: RUN BY `test/case-project-conclusion.control.mjs` (a `.control.mjs`, not discovered by the battery, because it EDITS src/ while it runs). Each arm is armed ALONE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp. Declared and run figures are on that driver. RUN 2026-09-19 by the REC-135 worker, every restore sha256 MATCH and content IDENTICAL: baseline 25/0 * (a) THE GATE BACK ON THE INQUIRY'S SHARED STATE 17/8 - A's publish, the two-answers discriminator, all four case-document arms, D's fixture publish and the act-the-surface-offered arm FAILED * (b) THE STATE FLOOR DROPPED 24/1 - the set-down arm alone * (c) THE RELATIONSHIP COLLAPSED IN THE RECORD 23/2 - both no-project disclosure arms, while every arm in sections 1 and 2 stayed GREEN, which is the whole shape of that liar * (d) THE WITHDRAWAL MADE INVISIBLE 24/1 - the after-withdrawal arm alone * (e) THE STRICT READING OF ITEM 8 (the no-project disjunct removed) 22/3 - the three legacy-path arms, which is also the MEASUREMENT of what that tightening costs here * (f) THE AFFORDANCE BACK ON THE STATE WORD 24/1 - the publish-is-offered arm alone, while the store still accepted the act, which is the DEC-8 disagreement in the direction that fails. EVERY ARM AS DECLARED and the MUST-NOT halves held. ONE DECLARATION CAME BACK WRONG AND IS RECORDED AT THE DRIVER: arm (a) was declared to fail the after-withdrawal arm too and did not - it changes the gate's CONDITION and not the answer the refusal reports, so it is blind to what a refusal SAYS.
 *
 * D-667 (declared and RUN 2026-09-25, WORKER D-667), THE RECORDER — every section now runs in `block()` (D-548's
 * recorder, D-564's pattern), so the arms break a section's FIXTURE. Re-run in one step: `node test/d564-block.control.mjs
 * case-project-conclusion` from bio-plane/. BASELINE -> 25 pass, 0 fail, per section (0 (setup), 1..6) 0/0, 8/0, 4/0,
 * 5/0, 2/0, 2/0, 4/0, foot reached. (g) SECTION 4's FIXTURE BROKEN — D's make-current on WD names a reading the
 * question does not hold (anchor on d564-block.control.mjs) -> MEASURED 23 pass, 1 fail, `BLOCK 4 DIED: (fixture) D stands on the reading` (the plane
 * answered VERSION_ACT_NO_SUCH_VERSION), every other section at its baseline tally, foot reached, exit 1. (h) THE
 * RECORDER DISARMED (`block()` rethrows) over (g)'s fixture -> MEASURED no foot and no section tally, exit 1.
 * ========================================================================= */
/* REC-135 — A PROJECT'S CONCLUSION REACHES THE CASE
 * (INVESTIGATIVE-SESSION.md §7.1 item 4, BOB #15 2026-09-18; the State Rules
 * §4 amendment of the same day; `BIO_Case_Making_v0_1.md` §What a CLAIM is.)
 *
 * WHAT WAS ACTUALLY WRONG, measured at the code before a line was written and
 * NOT inferred from `NOT_CONCLUDED` existing. The refusal has existed since
 * CASE-4. What it ASKED was `bundles.current_state === 'concluded'` — the
 * shared inquiry's own word — and §7 forbids exactly that on a shared question.
 * Two defects, in opposite directions, from one expression:
 *   (a) a project that HAD concluded through `op=conclude&project=` was REFUSED,
 *       because that act deliberately never moves the inquiry's state; so item
 *       4 was not merely unbuilt, the project arm REC-124 shipped could not
 *       reach a case at all;
 *   (b) a project that had concluded NOTHING was ADMITTED the moment any other
 *       relationship concluded the question in its own bytes.
 *
 * HOW A LIAR PASSES THIS SUITE, stated before what it checks. Keep reading the
 * inquiry's own state and every arm where the two projects AGREE still passes:
 * one state, one answer, and no assertion can see it. So the two projects here
 * DISAGREE about one shared question — A concluded it, B did not — and the
 * suite asserts the answers DIFFER for the same question, the same member and
 * the same moment, with the only difference being `project=`. A single shared
 * state cannot produce two answers, which is what makes the disagreement the
 * discriminator and not the agreement.
 * The second liar is cheaper and is answered too: record SOMETHING in the case
 * document and call the claim recorded. So the arms assert the claim is A's
 * WORD FOR WORD, that B's claim (a different reading of the same question) is
 * ABSENT from the bytes, and that the document names WHOSE relationship
 * concluded — a document that recorded "the claim" without the relationship
 * would leave a reader to assume the publisher concluded it, which on a shared
 * question is the assumption §7 exists to refuse.
 *
 * WHAT IS DRIVEN, all through the ops as a member:
 *  1. THE DISAGREEMENT. One shared question, two projects the same member owns
 *     and has joined. A concludes on its own reading; B concludes nothing. The
 *     question's OWN state stays `open` throughout and is asserted. A publishes;
 *     B is refused NOT_CONCLUDED naming WHY, and A is named to B as information
 *     that is never B's stance (§7.1 item 8).
 *  2. THE CLAIM IN THE SIGNED BYTES. The case document records the relationship,
 *     the reading and the claim A adopted, verbatim; B's claim is absent; the
 *     body says it in prose, which is what a member actually reviews.
 *  3. THE NO-PROJECT PATH IS UNCHANGED AND IS DISCLOSED. A question concluded in
 *     its own bytes naming no project still publishes (item 5 reads it as the
 *     no-project relationship's), and the document SAYS it is not this project's
 *     own — with the claim UNDETERMINED and the reason, never back-filled.
 *  4. A WITHDRAWAL REACHES THE CASE. REC-136 built `op=withdrawconclusion` and
 *     its own comment records that nothing read a project's conclusion into a
 *     case yet. This is that reading: a project that withdrew is refused, by a
 *     `why` that is not the same fact as never having concluded.
 *  5. THE STATE FLOOR SURVIVES. A conclusion a project wrote while the question
 *     was open does not outlive the group setting the question down — the hole
 *     that dropping `current_state` from the gate would have opened.
 *  6. THE AFFORDANCE AGREES WITH THE REFUSAL (DEC-8). `publish` is offered on a
 *     question whose own state is `open` because a joined project concluded it,
 *     and is NOT offered on one nobody concluded.
 *
 * WHAT IT CANNOT SEE, stated rather than left for the next reader: the sharing
 * edge is hand-authored into `references[]` (REC-72's open finding, as
 * `conclude-project.test.mjs` records); nothing here signs or verifies a
 * PUBLISHED case's container bytes — `casesign`/`publishedcase` own that, and
 * this suite's claim about legacy cases is that the PUBLISH PATH for a
 * no-project conclusion is unchanged, which is arm 3, not a byte comparison of
 * an already-signed edition; and `op=reopen` is untouched by this item and is
 * argued in the report rather than asserted here.
 * ========================================================================= */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseFrontmatter } from "../checks/bio-checks.mjs";

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
  bindings: { ADMIN_TOKEN: "adm-r135", MEMBER_TOKEN: "mem-r135", PROBE_TOKEN: "prb-r135",
              DAEMON_TOKEN: "dmn-r135", VERSION: "0.67.0", INSTANCE_NAME: "biosmoke-r135",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body) })).json());
/* D-667 (D-564's pattern): EVERY SECTION RUNS INSIDE `block()` — D-548's recorder (d84-case-manifest.test.mjs),
   adopted. Before it, `bail()` printed "FIXTURE FAILED", disposed the sandbox and exited on the FIRST fixture
   failure, so one broken fixture ended the run and every later section went unmeasured. Now a fixture failure is a
   THROW that `block()` records as ONE failure naming its section, and the sections after it still run and report.
   Each section's own tally is printed at the foot; a section that DIED prints -1, never the partial count it
   reached; a section expected but never reported fails by name. A section resting on an earlier one's values asks
   for them with `needs()` and dies naming the section it rests on. */
const bail = (what, r) => { throw new Error(`(fixture) ${what}: ${JSON.stringify(r).slice(0, 600)}`); };
const needs = (section, vals) => {
  const missing = Object.entries(vals).filter(([, v]) => v === undefined).map(([k]) => k);
  if (missing.length) throw new Error(`rests on section ${section}, which did not produce ${missing.join(", ")}`);
};
const TALLY = [];
const block = async (name, fn) => {
  const p0 = pass, f0 = fail;
  let died = false;
  try { await fn(); }
  catch (e) {
    died = true;
    fail++;
    console.log(`  FAIL  BLOCK ${name} DIED: ${String((e && e.message) || e).slice(0, 700)}`);
    console.log("         (the sections after this one still run — see below)");
  }
  TALLY.push({ name, pass: died ? -1 : pass - p0, fail: died ? -1 : fail - f0, died });
};
const must = (what, r) => { if (!r || r.ok !== true) bail(what, r); return r; };

const enrol = async (memberId, role, caps) => {
  const add = await POST(`op=memberadd&token=adm-r135`,
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add.ok) bail(`memberadd ${memberId}`, add);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) bail(`enroll ${memberId}`, en);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) bail(`login ${memberId}`, lg);
  return lg.token;
};
/* ONE member owns and has joined every project below. That is the whole of the
   discriminator's construction: if the member is held fixed and the question is
   held fixed, the only thing an answer can differ ON is the relationship.
   D-667: the values later sections read are declared here and ASSIGNED inside block "0 (setup)" below. */
let IRIS, A, B, C, D, E;

/* ------------------------------------------------------------- FIXTURES */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", "and"),
    ...scalar("state", v.state ?? "suggested"),
    ...(v.state === "accepted" ? [...scalar("state_by", "iris"), ...scalar("state_at", NOW)] : []),
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
const inquiryMd = (id, { title, versions = [], basis = [], concluded = null } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1", `title: "${title}"`,
  ...(concluded
    ? ["current_state: concluded", "prior_state: open", `conclusion: "${concluded.conclusion}"`,
       `falsifier: "${concluded.falsifier}"`]
    : ["current_state: open", "prior_state: null"]),
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
/* NO `required_strength` — an ABSENT bar is not a bar of zero and gates nothing
   (DEC-72). This suite is about WHOSE conclusion admits a case, and a declared
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
const promote = async (id, text, type, state = null) => POST(`op=promote&token=${IRIS}`, {
  bundleId: id, base: null,
  snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: state ?? (type === "inquiry" ? "open" : "collected"),
          created: NOW, last_updated: LATER } });
const mustPromote = async (id, text, type, state = null) =>
  must(`promote ${id}`, await promote(id, text, type, state));
/* A project's id is MINTED by the plane (REC-141/IC-158) and the creator becomes
   its OWNER and a JOINED participant in the same write — which is why nothing
   below performs an ownership ceremony and why every act here is IRIS's. */
const createProject = async (label, text) => {
  const r = await POST(`op=promote&token=${IRIS}`, {
    base: null, snapKey: `${label}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
    meta: { object_type: "project", group: "believe-in-oakland", title: `Project ${label}`,
            current_state: "investigating", created: NOW, last_updated: LATER } });
  if (!r.ok || typeof r.bundleId !== "string") bail(`create project ${label}`, r);
  return r.bundleId;
};
const stateOf = async (id) => (await GET(`op=list&token=${IRIS}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.current_state ?? null;

const LEDGER = "INFO-2026-4135-ledger", MINUTES = "INFO-2026-4135-minutes", AUDIT = "INFO-2026-4135-audit";

const CLAIM_A = "The transfer followed the process the council adopted in 2024.";
const CLAIM_B = "The transfer bypassed the council vote the adopted process requires.";
const VA = { name: "paper trail", claim: CLAIM_A,
  description: "The ledger and the minutes together show the transfer was authorised.",
  grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail" }, { target: MINUTES, ground: "paper trail" }] };
const VB = { name: "the audit", claim: CLAIM_B,
  description: "The audit shows the transfer happened without the required vote.",
  grounds: ["the audit"], legs: [{ target: AUDIT, ground: "the audit" }] };

const SHARED = "INQ-2026-4135-sewer-transfers";   /* the shared question, arms 1-2, 6 */
const LEG = "INQ-2026-4135-legacy-question";      /* concluded the old way, no project — arm 3 */
const WD = "INQ-2026-4135-withdrawn";             /* concluded then withdrawn — arm 4 */
const SETDOWN = "INQ-2026-4135-set-down";         /* concluded, then deferred — arm 5 */
const NOBODY = "INQ-2026-4135-nobody";            /* nobody concluded — arm 6's over-strictness */

const LEGACY_TEXT = "The legacy transfer was authorised.";
const accept = async (target, version) =>
  POST(`op=versionaccept&token=${IRIS}&target=${enc(target)}&version=${enc(version)}`
     + `&reason=${enc("the evidence holds")}`, {});
const makeCurrent = async (project, target, version) =>
  POST(`op=versioncurrent&token=${IRIS}&target=${enc(target)}&version=${enc(version)}&project=${enc(project)}`, {});
/* A FALSIFIER IS STATED ON EVERY CONCLUSION HERE, never overridden: REC-117 made
   the absence a first-class value a member may assert, and a suite that reached
   for the override would be testing this item through a door it does not use. */
const FALSIFIER = "a council minute showing the vote was never taken";
const conclude = async (params) =>
  POST(`op=conclude&token=${IRIS}&falsifier=${enc(FALSIFIER)}&`
     + Object.entries(params).map(([k, v]) => `${k}=${enc(v)}`).join("&"), {});
const publish = async (project, target) => POST(`op=publish&token=${IRIS}`, {
  project, scope: `Whether the record answers ${target}.`,
  targets: [target], roles: { [target]: "load_bearing" },
  statement: "This case does not cover the 2025 transfers.",
  subjectPosition: "sought_no_answer",
  subjectJustification: "The subject was asked and declined to comment.",
  biasAcknowledgement: "The publishing project is funded by a party with an interest in the outcome.",
  excluded: [{ target: null, description: "The 2025 transfers", reason: "Out of scope." }] });

/* D-667: THE SETUP, in the order it always ran — the member, the documents, the questions, the projects — as
   block "0 (setup)"; only pure definitions stand outside it. */
await block("0 (setup)", async () => {
IRIS = await enrol("iris", "admin", ["contribute", "publish"]);
for (const d of [LEDGER, MINUTES, AUDIT]) await mustPromote(d, infoMd(d), "information");
await mustPromote(SHARED, inquiryMd(SHARED, { title: "Did the sewer fund transfer follow the adopted process?",
  versions: [VA, VB], basis: [LEDGER, MINUTES] }), "inquiry");
await mustPromote(WD, inquiryMd(WD, { title: "Was the vote recorded?", versions: [VA], basis: [LEDGER] }), "inquiry");
await mustPromote(SETDOWN, inquiryMd(SETDOWN, { title: "Was the ledger reconciled?",
  versions: [VA], basis: [LEDGER] }), "inquiry");
await mustPromote(NOBODY, inquiryMd(NOBODY, { title: "Was the auditor engaged?",
  versions: [VA], basis: [LEDGER] }), "inquiry");
await mustPromote(LEG, inquiryMd(LEG, { title: "Was the legacy transfer authorised?",
  versions: [{ ...VA, state: "accepted" }], basis: [LEDGER],
  concluded: { conclusion: LEGACY_TEXT, falsifier: "a rescinding minute" } }), "inquiry", "concluded");

A = await createProject("oversight", projectMd("Oversight", [SHARED]));
B = await createProject("budget", projectMd("Budget", [SHARED]));
C = await createProject("legacy", projectMd("Legacy", [LEG]));
D = await createProject("withdrawer", projectMd("Withdrawer", [WD]));
E = await createProject("setdown", projectMd("Setdown", [SETDOWN]));

/* Every reading accepted once, so nothing below is refused for a reason that is
   not this item's. */
for (const [target, v] of [[SHARED, VA.name], [SHARED, VB.name], [WD, VA.name],
                           [SETDOWN, VA.name], [NOBODY, VA.name]])
  must(`accept ${v} on ${target}`, await accept(target, v));
});

let pubA;   /* D-667: section 1 makes it, section 2 reads it */
/* =======================================================================
   1. THE DISAGREEMENT — one shared question, two projects, two answers.
   ======================================================================= */
console.log("\n--- 1. one shared question, two projects: only the one that CONCLUDED it may publish ---");
await block("1", async () => {
needs("0 (setup)", { IRIS, A, B });

must("A stands on its reading", await makeCurrent(A, SHARED, VA.name));
must("B stands on the OTHER reading", await makeCurrent(B, SHARED, VB.name));
/* B deliberately stands on a reading and concludes NOTHING. Standing on a
   reading is not concluding, and a gate that confused the two would pass every
   arm below while admitting a case nobody answered. */
const cA = must("A concludes for itself", await conclude({ target: SHARED, project: A }));
t("A's conclusion adopts its OWN reading's claim and does NOT move the shared question",
  [cA.relationship, cA.version, cA.claim.text, cA.inquiry_moved, cA.inquiry_state],
  ["project", VA.name, CLAIM_A, false, "open"]);
t("the shared question's own state is still `open` — which is the whole reason the old gate was wrong",
  await stateOf(SHARED), "open");

const bFirst = await publish(B, SHARED);
t("B, which concluded nothing, is REFUSED and the refusal names the relationship it was asked of",
  [bFirst.ok, bFirst.reason, bFirst.project, bFirst.relationship, bFirst.why],
  [false, "NOT_CONCLUDED", B, "project", "project_has_never_concluded"]);
t("and B is TOLD that A concluded it — information, never B's stance (§7.1 item 8)",
  [(bFirst.concluded_elsewhere || []).map((o) => [o.project, o.version])],
  [[[A, VA.name]]]);
t("the refusal publishes the BOUND of that read, so an ABSENCE over a truncated set is not read as a finding",
  [typeof bFirst.concluded_elsewhere_bounds?.projects_bound,
   bFirst.concluded_elsewhere_bounds?.projects_truncated],
  ["number", false]);

pubA = await publish(A, SHARED);
t("A, which DID conclude it, publishes — the act REC-124 shipped could not reach a case at all before this",
  [pubA.ok, typeof pubA.caseDocument?.doc_sha], [true, "string"]);

/* THE DISCRIMINATOR, SAID AS ONE ASSERTION. Same question, same member, same
   moment; the only difference is `project=`. A gate reading one shared state
   cannot answer these two differently. */
t("SAME QUESTION, SAME MEMBER, TWO ANSWERS — the arm a gate reading the question's own state cannot pass",
  [pubA.ok, bFirst.ok, bFirst.reason], [true, false, "NOT_CONCLUDED"]);

const bAgain = await publish(B, SHARED);
t("after A has published, B is STILL refused NOT_CONCLUDED and not ALREADY_A_CASE_MEMBER — the "
+ "conclusion gate is asked before the membership gate, so B is told what it actually lacks",
  [bAgain.ok, bAgain.reason, bAgain.why], [false, "NOT_CONCLUDED", "project_has_never_concluded"]);

});

/* =======================================================================
   2. THE CLAIM IN THE CASE DOCUMENT.
   ======================================================================= */
console.log("\n--- 2. the case records the ADOPTED CLAIM as it stood, and whose it was ---");
await block("2", async () => {
needs("0 (setup)", { IRIS, A });
needs("1", { pubA });

/* EVERY READ BELOW IS DEFENSIVE, and that is not politeness — a control arm
   that breaks the gate makes `pubA` a refusal, and a suite that then threw on
   `pubA.caseDocument.case_id` would end its module with NO tally at all, which
   reads as a clean count to anything that only checks an exit status. The
   control driver reports a missing FOOT as -1 for the same reason. */
const docA = await GET(`op=casedocument&token=${IRIS}&case=${enc(pubA.caseDocument?.case_id ?? "none")}&edition=1`);
const textA = String(docA?.text ?? "");
const fmA = parseFrontmatter(textA).data || {};
const rowA = (fmA.case_conclusions || []).find((r) => r.target === SHARED) || {};
t("the signed bytes name the RELATIONSHIP the case rests on, the project, the reading and the claim state",
  [rowA.relationship, rowA.project, rowA.version, rowA.claim_state],
  ["project", A, VA.name, "adopted"]);
t("and the claim VERBATIM — the one A adopted, not the question's",
  rowA.claim, CLAIM_A);
t("B's claim — a different reading of the SAME question — is nowhere in the case document. A document "
+ "echoing `the claim of this inquiry` could have written either, and that is the liar this arm sees",
  [textA.length > 0, textA.includes(CLAIM_B)], [true, false]);
t("the BODY says it in prose, which is what a member reviews and signs",
  [textA.includes("## The Conclusions This Case Records"),
   textA.includes(`concluded by ${A}`), textA.includes(CLAIM_A),
   textA.includes(`Every conclusion this case records is ${A}'s own.`)],
  [true, true, true, true]);

});

/* =======================================================================
   3. THE NO-PROJECT CONCLUSION STILL PUBLISHES, AND IS DISCLOSED AS NOT THIS
      PROJECT'S OWN.
   ======================================================================= */
console.log("\n--- 3. a question concluded in its own bytes still publishes, and the document SAYS whose ---");
await block("3", async () => {
needs("0 (setup)", { IRIS, C });

t("(fixture) LEG is concluded in its OWN bytes and no project has concluded it",
  await stateOf(LEG), "concluded");
const pubC = await publish(C, LEG);
t("the path every published case in this record took still works — this item did not narrow it",
  [pubC.ok, typeof pubC.caseDocument?.doc_sha], [true, "string"]);
const docC = await GET(`op=casedocument&token=${IRIS}&case=${enc(pubC.caseDocument?.case_id ?? "none")}&edition=1`);
const textC = String(docC?.text ?? "");
const fmC = parseFrontmatter(textC).data || {};
const rowC = (fmC.case_conclusions || []).find((r) => r.target === LEG) || {};
t("and the bytes DISCLOSE that the conclusion is the NO-PROJECT relationship's, with the claim "
+ "UNDETERMINED and its reason — never back-filled from the conclusion text (§7.1 items 5-6)",
  [rowC.relationship, rowC.project, rowC.claim_state, rowC.claim, String(rowC.claim_detail ?? "").length > 0],
  ["no_project", null, "undetermined", "", true]);
t("the legacy conclusion TEXT is not promoted into the claim field — the cheapest lie in this item",
  rowC.claim === LEGACY_TEXT, false);
t("and the body tells the reader plainly, rather than letting them assume the publisher concluded it",
  [textC.length > 0,
   textC.includes("AT LEAST ONE MEMBER ENTERED THIS CASE ON A CONCLUSION THAT IS NOT THIS PROJECT'S OWN")],
  [true, true]);

});

/* =======================================================================
   4. A WITHDRAWAL REACHES THE CASE (REC-136 item 7 meeting item 4).
   ======================================================================= */
console.log("\n--- 4. a project that WITHDREW its conclusion stands on none, and the case says which fact that is ---");
await block("4", async () => {
needs("0 (setup)", { IRIS, D });

must("D stands on the reading", await makeCurrent(D, WD, VA.name));
must("D concludes", await conclude({ target: WD, project: D }));
const beforeWd = await publish(D, WD);
t("(fixture) D can publish while it stands on its conclusion", beforeWd.ok, true);
must("D withdraws", await POST(`op=withdrawconclusion&token=${IRIS}&target=${enc(WD)}&project=${enc(D)}`
  + `&reason=${enc("the minute was superseded")}`, {}));
const afterWd = await publish(D, WD);
t("a project that withdrew is refused, and WITHDREW is not the same fact as NEVER CONCLUDED — "
+ "the history is the record of the difference (DEC-19) and the refusal keeps them apart",
  [afterWd.ok, afterWd.reason, afterWd.why, afterWd.stance?.act],
  [false, "NOT_CONCLUDED", "project_withdrew_its_conclusion", "withdrawn"]);

});

/* =======================================================================
   5. THE STATE FLOOR — the hole this item could have opened.
   ======================================================================= */
console.log("\n--- 5. a conclusion written while the question was open does not outlive the group setting it down ---");
await block("5", async () => {
needs("0 (setup)", { IRIS, E });

must("E stands on the reading", await makeCurrent(E, SETDOWN, VA.name));
must("E concludes", await conclude({ target: SETDOWN, project: E }));
const sel = must("select", await POST(`op=select&token=${IRIS}`, { ids: [SETDOWN] }));
must("defer it", await POST(`op=dispose&token=${IRIS}&handle=${sel.handle}&to=deferred`
  + `&reason=${enc("the records request is outstanding")}`, {}));
t("(fixture) the question is set down", await stateOf(SETDOWN), "deferred");
const pubE = await publish(E, SETDOWN);
t("and E is refused even though its conclusions[] row still stands — the state floor is a SEPARATE "
+ "fact from the relationship, and dropping it would have let a case rest on a question the group "
+ "put away or carried forward (DEC-28)",
  [pubE.ok, pubE.reason, pubE.why, pubE.from],
  [false, "NOT_CONCLUDED", "question_not_case_bearing", "deferred"]);

});

/* =======================================================================
   6. THE AFFORDANCE AGREES WITH THE REFUSAL (DEC-8).
   ======================================================================= */
console.log("\n--- 6. the surface offers exactly what the act would accept ---");
await block("6", async () => {
needs("0 (setup)", { IRIS });

const affNobody = await GET(`op=affordances&token=${IRIS}&target=${enc(NOBODY)}`);
t("OVER-STRICTNESS ARM: on a question nobody has concluded, `publish` is NOT offered — widening the "
+ "predicate must not offer the act everywhere",
  [(affNobody.acts || []).some((a) => a.id === "publish")], [false]);

/* A second shared question, so arm 6 reads a state the case relation has not
   already changed: SHARED is a case member now, and `case_member` is a separate
   condition of the same predicate. */
const AFF = "INQ-2026-4135-affordance";
await mustPromote(AFF, inquiryMd(AFF, { title: "Was the contract advertised?",
  versions: [VA], basis: [LEDGER] }), "inquiry");
const F = await createProject("affordance", projectMd("Affordance", [AFF]));
must("accept the reading", await accept(AFF, VA.name));
must("F stands on it", await makeCurrent(F, AFF, VA.name));
/* READ AT THE OP AND NOT AT THE FACT. `op=affordances` publishes acts, never
   its facts block, so `concluded_for_project` is asserted the only way a caller
   can see it: by the act appearing. Asserting the fact would have meant reaching
   past the op into the Durable Object, and a store-level read is not evidence a
   caller can reach the feature (`op=invitelook` shipped with a ReferenceError
   while 1,276 assertions passed). The FIRST DRAFT OF THESE TWO ARMS DID read
   `facts.concluded_for_project` and came back `null` — `undefined` serialised
   through an array — while the act arms beside them passed. That surprising
   green is recorded rather than smoothed: it was the ARM that was wrong, not
   the subject, and an arm reading a field the op does not publish would have
   gone on reading null however the fact behaved. */
const affBefore = await GET(`op=affordances&token=${IRIS}&target=${enc(AFF)}`);
t("(fixture) before F concludes, `publish` is not offered on a question whose own state is `open`",
  [(affBefore.acts || []).some((a) => a.id === "publish"), affBefore.current_state],
  [false, "open"]);
must("F concludes", await conclude({ target: AFF, project: F }));
const affAfter = await GET(`op=affordances&token=${IRIS}&target=${enc(AFF)}`);
t("after F concludes, `publish` IS offered although the question's own state is still `open` — the "
+ "affordance-layer half of the same sentence, which the act and the surface must not disagree on",
  [(affAfter.acts || []).some((a) => a.id === "publish"), affAfter.current_state, await stateOf(AFF)],
  [true, "open", "open"]);
t("and the act the surface offered SUCCEEDS — a pre-flight that offers what the store refuses is the "
+ "one thing affordances.mjs exists to prevent",
  (await publish(F, AFF)).ok, true);

});

/* D-667: every section's own tally, -1 for one that DIED; a section that never recorded at all is named missing
   rather than read as clean — the foot counts the sections it expected against the ones that reported. The
   `case-project-conclusion.control.mjs` driver reads `N pass, M fail` off the foot line; its prefix is unchanged. */
const EXPECTED = ["0 (setup)", "1", "2", "3", "4", "5", "6"];
console.log("\n--- per-section tallies (D-667: -1 = the section DIED, its tally is missing) ---");
for (const n of EXPECTED) {
  const r = TALLY.find((x) => x.name === n);
  if (!r) { fail++; console.log(`  FAIL  section ${n}: NEVER REPORTED — tally -1`); continue; }
  console.log(`  section ${n}: ${r.pass} pass, ${r.fail} fail${r.died ? "  [DIED]" : ""}`);
}
const DIED = TALLY.filter((x) => x.died).map((x) => x.name);
console.log(`\ncase-project-conclusion.test.mjs: ${pass} pass, ${fail} fail  [FOOT REACHED${DIED.length ? `; DIED: ${DIED.join(", ")}` : ""}]`);
await mf.dispose();
process.exit(fail ? 1 : 0);
