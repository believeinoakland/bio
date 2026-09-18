/* NEGATIVE CONTROL: RUN BY `test/conclude-project.control.mjs` (a `.control.mjs`, not discovered by the battery, because it EDITS src/store.mjs while it runs). Each arm is armed ALONE, restored by cp from a per-arm pristine copy and verified by sha256 AND cmp. DECLARED before arming:
   (a) COLLAPSE THE PER-PROJECT RECORD TO ONE SHARED STATE — `#conclusionOf` ignores the project it was asked about and answers from the FIRST project row it finds that concluded the inquiry (the liar's shape: one conclusion, echoed to every project). MUST FAIL: §1's two-project arms (one project reads the other's claim) and every read of a project that concluded nothing. MUST NOT FAIL: §2's refusal and nothing-written arms, §3's legacy arms.
   (b) REMOVE THE NO_CLAIM REFUSAL — the `!claimText` clause dropped from the adoption check, so a reading with no claim is adopted with an empty claim. MUST FAIL: §2's no-claim-on-the-reading arm and its nothing-was-written arm. MUST NOT FAIL: §1, §3.
   (c) BACK-FILL THE LEGACY CLAIM — `#undeterminedClaim` answers the conclusion text as the claim. MUST FAIL: §3. MUST NOT FAIL: §1, §2.
   (d) OVER-STRICTNESS: the suite's over-strictness arm, which PASSES on the real code — a project concluding an inquiry whose OWN state is already `concluded` (a legacy/no-project conclusion) is accepted and the inquiry's own conclusion is untouched — is armed by making the fence tighter than its rule (the `pid && current_state === concluded` allowance removed). MUST FAIL: that arm alone. MUST NOT FAIL: everything else.
   RUN 2026-09-18 by the REC-124 worker (`node test/conclude-project.control.mjs` from `bio-plane/`), every restore sha256 MATCH and content IDENTICAL: baseline 43/0 · (a) 35/8 — A's own read, the two-reads-differ arm, the concluded-nothing-reads-null arm, the item-3 notice arms, the commentary arm, the re-conclude arm and E/D-read-nothing all FAILED; B's own read PASSED under the arm, because the collapsed shared state happened to BE B's (ORDER BY bundle_id picks `budget`), which is exactly why the suite asserts BOTH projects and the difference between them rather than either alone · (b) 40/3 — the no-claim-on-the-reading refusal, nothing-was-written and E-reads-nothing FAILED, as declared · (c) 41/2 — both §3 claim arms FAILED, as declared · (d) 42/1 — the over-strictness arm FAILED, which is the proof the arm can see a fence tighter than its rule. Every arm AS DECLARED; the MUST-NOT halves held.
 * ========================================================================= */
/* REC-124 — A CONCLUSION BELONGS TO THE PROJECT'S RELATIONSHIP WITH THE
 * INQUIRY (INVESTIGATIVE-SESSION.md §7.1, BOB #15, 2026-09-18).
 *
 * HOW A LIAR PASSES THIS, stated before what it checks: store ONE shared claim
 * on the inquiry and echo it to every project that asks. If both projects adopt
 * the SAME words, every per-project read agrees and the lie is invisible. So the
 * two projects here stand on two DIFFERENT readings carrying two DIFFERENT
 * claims, and each must read back its OWN — and the inquiry's bytes must not
 * move at all.
 *
 * WHAT IS DRIVEN, all through the ops as a member:
 *  1. Two projects sharing one inquiry each conclude with their own adopted
 *     claim; each project's read shows its own; the inquiry's bytes and state
 *     are byte-identical before and after; each conclusion is a dated row in
 *     the PROJECT's own frontmatter; the other project is TOLD (a FINDING) and
 *     not moved.
 *  2. Concluding with no claim is refused NO_CLAIM, and nothing is written —
 *     for every door: a project that does not draw on the question, one that
 *     stands on no reading, one whose reading states no claim, and commentary
 *     with no project. A free conclusion text beside a project is refused
 *     CONCLUSION_IS_THE_CLAIM.
 *  3. A legacy (no-project) conclusion reads claim-UNDETERMINED, stated, and is
 *     never back-filled from its conclusion text; no project inherits it.
 *  4. Commentary is attributed, labelled not-evidence, and never enters the
 *     strength pair or the legs.
 *
 * WHAT IT CANNOT SEE: op=publish / op=caseratify still read the INQUIRY's own
 * state (§7.1 item 4 is NOT built by REC-124 — said in the report), so nothing
 * here drives a project's conclusion into a case. The sharing edge is
 * hand-authored into `references[]`, REC-72's open finding (current.test.mjs).
 * ========================================================================= */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { classOfKind, QUEUE_CONDITION_KINDS } from "../src/queuestate.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const S = (v) => (typeof v === "string" ? v : null);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r124", MEMBER_TOKEN: "mem-r124", PROBE_TOKEN: "prb-r124",
              DAEMON_TOKEN: "dmn-r124", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-r124",
              GOVERNOR_APPETITE_PER_MIN: "600000" },
});
const rP = (j) => (j && typeof j === "object" && "result" in j) ? j.result : j;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body) })).json());

const enrol = async (memberId, role, caps) => {
  const add = await POST(`op=memberadd&token=adm-r124`,
    { memberId, cover: `cover for ${memberId}`, role, capabilities: caps });
  if (!add.ok) throw new Error(`memberadd ${memberId}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* An ADMINISTRATOR, current.test.mjs's reason: one credential drives both teams'
   acts. Nothing below concludes anything from this credential's reach. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

/* ------------------------------------------------------------- FIXTURES */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", "and"),
    ...scalar("state", "suggested"), ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("claim", v.claim), ...scalar("author", "ruth"), ...scalar("at", NOW)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ['  - version: "' + v.name + '"', ...scalar("ground", g),
     ...scalar("asserted_by", "ruth"), ...scalar("at", NOW)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ['  - version: "' + v.name + '"', ...scalar("target", l.target),
     ...scalar("role", "supports"), ...scalar("ground", l.ground),
     ...scalar("grade", "B"), ...scalar("grade_axis", "capture"),
     ...scalar("grade_source", "capture")].join("\n")));
  return ["basis_versions:", ...rows,
          ...(grounds.length ? ["basis_version_grounds:", ...grounds] : []),
          ...(legs.length ? ["basis_version_legs:", ...legs] : [])];
};
const inquiryMd = (id, { versions = [], basis = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Did the sewer fund transfer follow the adopted process?"`,
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
const projectMd = (id, { title, cites = [] } = {}) => ["---",
  `id: ${id}`, "object_type: project", `title: "${title}"`,
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(cites.length
    ? ["references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
    : ["references: []"]),
  "required_strength:", "  capture: B", "  connection: C",
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base: null,
  snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
          created: NOW, last_updated: LATER } });
const mustPromote = async (id, text, type) => {
  const r = await promote(id, text, type);
  if (!r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 800)}`);
  return r;
};
const shaOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;
const stateOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.current_state ?? null;
const textOf = async (id) => S((await GET(`op=file&token=${RUTH}&id=${id}&path=bundle.md`))?.text);

const LEDGER = "INFO-2026-4124-ledger", MINUTES = "INFO-2026-4124-minutes", AUDIT = "INFO-2026-4124-audit";
for (const d of [LEDGER, MINUTES, AUDIT]) await mustPromote(d, infoMd(d), "information");

const INQ = "INQ-2026-4124-sewer-transfers";      /* the SHARED question */
const LEG = "INQ-2026-4124-legacy-question";      /* concluded the old way, no project */
/* A and B share INQ and stand on DIFFERENT readings with DIFFERENT claims — the
   liar's defence. C never cites INQ. D cites INQ and stands on nothing. E stands
   on a reading that states no claim. */
const A = "PROJ-2026-4124-oversight", B = "PROJ-2026-4124-budget", C = "PROJ-2026-4124-unrelated",
      D = "PROJ-2026-4124-undecided", E = "PROJ-2026-4124-claimless";
const CLAIM_A = "The transfer followed the process the council adopted in 2024.";
const CLAIM_B = "The transfer bypassed the council vote the adopted process requires.";
const VA = { name: "paper trail", claim: CLAIM_A,
  description: "The ledger and the minutes together show the transfer was authorised.",
  grounds: ["paper trail"],
  legs: [{ target: LEDGER, ground: "paper trail" }, { target: MINUTES, ground: "paper trail" }] };
const VB = { name: "the audit", claim: CLAIM_B,
  description: "The audit shows the transfer happened without the required vote.",
  grounds: ["the audit"], legs: [{ target: AUDIT, ground: "the audit" }] };
const VN = { name: "no claim stated", claim: undefined,
  description: "A reading composed before anybody stated what it claims.",
  grounds: ["the ledger alone"], legs: [{ target: LEDGER, ground: "the ledger alone" }] };
const VL = { name: "legacy reading", claim: "The legacy question has a claimed answer.",
  description: "A reading of the legacy question, stated after it was concluded the old way.",
  grounds: ["the ledger alone"], legs: [{ target: LEDGER, ground: "the ledger alone" }] };

await mustPromote(A, projectMd(A, { title: "Oversight", cites: [INQ, LEG] }), "project");
await mustPromote(B, projectMd(B, { title: "Budget", cites: [INQ] }), "project");
await mustPromote(C, projectMd(C, { title: "Unrelated" }), "project");
await mustPromote(D, projectMd(D, { title: "Undecided", cites: [INQ] }), "project");
await mustPromote(E, projectMd(E, { title: "Claimless", cites: [INQ] }), "project");
await mustPromote(INQ, inquiryMd(INQ, { versions: [VA, VB, VN], basis: [LEDGER, MINUTES] }), "inquiry");
await mustPromote(LEG, inquiryMd(LEG, { versions: [VL], basis: [LEDGER] }), "inquiry");

const enc = encodeURIComponent;
const accept = async (version, target = INQ) =>
  POST(`op=versionaccept&token=${RUTH}&target=${enc(target)}&version=${enc(version)}`
     + `&reason=${enc("the evidence holds")}`, {});
const makeCurrent = async (project, version, target = INQ) =>
  POST(`op=versioncurrent&token=${RUTH}&target=${enc(target)}&version=${enc(version)}&project=${enc(project)}`, {});
const conclude = async (params, tok = RUTH) =>
  POST(`op=conclude&token=${tok}&` + Object.entries(params).map(([k, v]) => `${k}=${enc(v)}`).join("&"), {});
const versionsOf = async (id, project) =>
  GET(`op=basisversions&token=${RUTH}&id=${enc(id)}&limit=50${project ? `&project=${enc(project)}` : ""}`);
const conclusionOf = async (project, id = INQ) => {
  const r = await versionsOf(id, project) || {};
  return Object.prototype.hasOwnProperty.call(r, "conclusion") ? r.conclusion : "FIELD-ABSENT";
};
const mustOk = (label, r) => { if (!r || r.ok !== true) throw new Error(`${label}: ${JSON.stringify(r).slice(0, 600)}`); return r; };

for (const v of [VA.name, VB.name, VN.name]) mustOk(`accept ${v}`, await accept(v));
mustOk("accept legacy", await accept(VL.name, LEG));
mustOk("A stands on VA", await makeCurrent(A, VA.name));
mustOk("B stands on VB", await makeCurrent(B, VB.name));
mustOk("E stands on VN", await makeCurrent(E, VN.name));
mustOk("A stands on VL of the legacy question", await makeCurrent(A, VL.name, LEG));

/* ====================================================================== 1 */
console.log("\n--- 1. two projects, one shared question, each concludes with ITS OWN claim ---");
{
  const inqShaBefore = await shaOf(INQ);
  const inqTextBefore = await textOf(INQ);
  const strengthBefore = await GET(`op=versionstrength&token=${RUTH}&id=${INQ}&version=${enc(VA.name)}`);
  t("the fixture is real: the shared question exists, is open, and both claims are distinct and non-empty",
    [!!inqShaBefore, await stateOf(INQ), CLAIM_A !== CLAIM_B && CLAIM_A.length > 20], [true, "open", true]);

  const COMMENT = "Worth asking the clerk whether the 2024 resolution was ever re-adopted.";
  const ra = await conclude({ target: INQ, project: A, falsifier: "a council minute rescinding the 2024 process",
                              commentary: COMMENT });
  t("A concludes: accepted, the relationship is A's, and the claim ADOPTED is VA's, verbatim",
    [ra.ok, ra.project, ra.relationship, ra.claim?.state, ra.claim?.text, ra.version],
    [true, A, "project", "adopted", CLAIM_A, VA.name]);
  t("and the answer says the shared inquiry was NOT moved",
    [ra.inquiry_moved, ra.inquiry_state], [false, "open"]);
  const rb = await conclude({ target: INQ, project: B, falsifier: "a recorded council vote on the transfer" });
  t("B concludes: accepted, and ITS claim is VB's — a different claim from A's",
    [rb.ok, rb.project, rb.claim?.text, rb.version], [true, B, CLAIM_B, VB.name]);

  const ca = await conclusionOf(A), cb = await conclusionOf(B);
  t("A's read shows A's OWN conclusion (VA's claim), through op=basisversions&project=",
    [ca?.project, ca?.state, ca?.version, ca?.claim, ca?.claim_state], [A, "concluded", VA.name, CLAIM_A, "adopted"]);
  t("B's read shows B's OWN conclusion (VB's claim) — NOT A's, which is the arm a shared-state liar fails",
    [cb?.project, cb?.version, cb?.claim], [B, VB.name, CLAIM_B]);
  t("the two reads differ in the claim concluded",
    ca?.claim !== cb?.claim, true);
  t("a project drawing on the question that concluded NOTHING reads null, never another team's (§7.1 item 4)",
    await conclusionOf(D), null);
  t("an unnamed project gets no `conclusion` field at all, CURRENT's rule — there is no default project",
    await conclusionOf(null), "FIELD-ABSENT");

  t("THE SHARED INQUIRY'S BYTES ARE BYTE-IDENTICAL after both conclusions, and its state is still open",
    [await shaOf(INQ) === inqShaBefore, (await textOf(INQ)) === inqTextBefore, await stateOf(INQ)],
    [true, true, "open"]);
  t("and the inquiry's own conclusion (the no-project relationship's) is still null — nobody concluded there",
    (await versionsOf(INQ))?.no_project_conclusion, null);

  const aText = await textOf(A) || "";
  t("the conclusion is a DATED, AUTHORED row in the PROJECT's own frontmatter — never a settings row",
    [/\nconclusions:\n  - inquiry: "INQ-2026-4124-sewer-transfers"\n    version: "paper trail"\n    claim: "The transfer followed the process the council adopted in 2024\."/.test(aText),
     /\n    by: "ruth"\n/.test(aText), /\n    at: "20\d\d-/.test(aText)], [true, true, true]);
  t("and the act is in A's Session Log, naming the claim adopted",
    /### Session [^\n]+ \| Concluded \| ruth\nTrigger: op=conclude on INQ-2026-4124-sewer-transfers for PROJ-2026-4124-oversight\n[^\n]*\nClaim: The transfer followed/.test(aText), true);
  t("B's own bytes carry B's claim and NOT A's",
    [(await textOf(B) || "").includes(CLAIM_B), (await textOf(B) || "").includes(CLAIM_A)], [true, false]);

  /* ---- item 3: TOLD, NEVER MOVED */
  const q = await GET(`op=queue&token=${RUTH}&limit=500`);
  const items = (q && Array.isArray(q.items) ? q.items : [])
    .filter((i) => i && i.kind === "shared-inquiry-concluded-by-another-project");
  const aboutA = items.find((i) => i.subject?.id === A), aboutB = items.find((i) => i.subject?.id === B);
  t("the kind is a FINDING in the plane's own catalogue and never a mutable CONDITION (§7's reason)",
    [classOfKind("shared-inquiry-concluded-by-another-project"),
     "shared-inquiry-concluded-by-another-project" in QUEUE_CONDITION_KINDS], ["FINDING", false]);
  t("each conclusion is TOLD to the other projects: one item per concluding project, naming its reading",
    [!!aboutA, aboutA?.basis?.version, !!aboutB, aboutB?.basis?.version], [true, VA.name, true, VB.name]);
  t("A's item is NOT filed under A (declared exclusion) and IS filed under B",
    [(aboutA?.case?.ancestors || []).some((x) => x.id === A),
     (aboutA?.case?.ancestors || []).some((x) => x.id === B),
     aboutA?.case?.excluded?.[0]?.id], [false, true, A]);
  t("and it enumerates where the others stand — B concluded on a different reading, D has not concluded",
    (aboutA?.basis?.elsewhere || []).filter((e) => e.project === B || e.project === D)
      .map((e) => [e.project, e.state, e.version]).sort(),
    [[B, "concluded", VB.name], [D, "not_concluded", null]]);
  const mute = await POST(`op=queuemute&token=${RUTH}`, { case: B, kinds: ["shared-inquiry-concluded-by-another-project"] });
  t("a member CANNOT mute it: op=queuemute refuses a FINDING kind", mute?.ok, false);
  t("and being told moved nothing: B's stance and conclusion are exactly as B left them",
    [(await versionsOf(INQ, B))?.current?.version, (await conclusionOf(B))?.claim], [VB.name, CLAIM_B]);

  /* ---- 4: COMMENTARY IS ATTRIBUTED AND NEVER EVIDENCE */
  console.log("\n--- 4. commentary is attributed, labelled, and never evidence or strength ---");
  t("commentary reads back ATTRIBUTED to its author and labelled not-evidence",
    [ca?.commentary?.text, ca?.commentary?.by, ca?.commentary?.evidence], [COMMENT, "ruth", false]);
  const strengthAfter = await GET(`op=versionstrength&token=${RUTH}&id=${INQ}&version=${enc(VA.name)}`);
  t("the strength pair over the adopted reading is IDENTICAL before and after the commented conclusion",
    JSON.stringify(strengthAfter) === JSON.stringify(strengthBefore) && strengthBefore?.ok !== false, true);
  t("and the commentary text appears nowhere in the strength answer or the reading's legs",
    [JSON.stringify(strengthAfter).includes("clerk"),
     JSON.stringify((await versionsOf(INQ))?.versions || []).includes("clerk")], [false, false]);
  t("B concluded with no commentary, and reads null rather than an empty string",
    cb?.commentary, null);

  /* ---- a RE-conclude replaces the row and names what it replaced */
  mustOk("A moves to VB", await makeCurrent(A, VB.name));
  const ra2 = await conclude({ target: INQ, project: A, falsifier: "a recorded council vote on the transfer" });
  t("A re-concluding on a different reading adopts THAT claim and names the one it replaced",
    [ra2.ok, ra2.claim?.text, ra2.prior?.claim, ra2.prior?.version], [true, CLAIM_B, CLAIM_A, VA.name]);
  t("one row per question: A's frontmatter carries one conclusions row for INQ, now VB's",
    [((await textOf(A)) || "").split('  - inquiry: "INQ-2026-4124-sewer-transfers"').length - 1 >= 2,
     (await conclusionOf(A))?.version], [true, VB.name]);
  t("and B was not moved by A's second act either", (await conclusionOf(B))?.claim, CLAIM_B);
}

/* ====================================================================== 2 */
console.log("\n--- 2. concluding with no claim is refused NO_CLAIM, and nothing is written ---");
{
  const shas = async () => [await shaOf(INQ), await shaOf(C), await shaOf(D), await shaOf(E), await shaOf(A)];
  const before = await shas();
  const cases = [
    ["a project that does not draw on the question", { target: INQ, project: C, falsifier: "x" }],
    ["a project that stands on NO reading", { target: INQ, project: D, falsifier: "x" }],
    ["a project whose reading states NO CLAIM", { target: INQ, project: E, falsifier: "x" }],
    ["commentary with no project (nothing adopted to comment beyond)",
      { target: INQ, conclusion: "It did.", falsifier: "x", commentary: "a note" }],
  ];
  for (const [label, p] of cases) {
    const r = await conclude(p);
    t(`${label}: refused NO_CLAIM BY NAME, with a detail naming the door (the canned translation is C-33.34's row in bio-checks.mjs, which the DEC-49 guard holds)`,
      [r?.ok, r?.reason, typeof r?.detail === "string" && r.detail.length > 40], [false, "NO_CLAIM", true]);
  }
  const free = await conclude({ target: INQ, project: B, conclusion: "The transfer was improper.", falsifier: "x" });
  t("a FREE conclusion text beside a project is refused CONCLUSION_IS_THE_CLAIM, never relabelled",
    [free?.ok, free?.reason], [false, "CONCLUSION_IS_THE_CLAIM"]);
  t("NOTHING WAS WRITTEN: the question and every project named above are byte-identical",
    JSON.stringify(await shas()) === JSON.stringify(before), true);
  t("E reads no conclusion, and neither does D", [await conclusionOf(E), await conclusionOf(D)], [null, null]);
  t("B's conclusion survived the refused free-text attempt unchanged", (await conclusionOf(B))?.claim, CLAIM_B);
  const mach = await conclude({ target: INQ, project: B, falsifier: "x" }, "mem-r124");
  t("a machine credential is refused by the fence it always was, with a project too",
    [mach?.ok, mach?.reason], [false, "MACHINE_CANNOT_CONCLUDE"]);
}

/* ====================================================================== 3 */
console.log("\n--- 3. a legacy (no-project) conclusion reads claim-UNDETERMINED, never back-filled ---");
{
  const LEGACY_TEXT = "The legacy transfer was authorised.";
  const r = await conclude({ target: LEG, conclusion: LEGACY_TEXT, falsifier: "a rescinding minute" });
  t("the no-project act concludes as it always did — the inquiry's own state moves",
    [r?.ok, r?.relationship, r?.project, await stateOf(LEG)], [true, "no_project", null, "concluded"]);
  t("and its answer STATES the claim undetermined, with no text and no version",
    [r?.claim?.state, r?.claim?.text, r?.claim?.version], ["undetermined", null, null]);
  const own = (await versionsOf(LEG))?.no_project_conclusion;
  t("the read gives it as the no-project relationship's, relationship NOT established, claim UNDETERMINED",
    [own?.relationship, own?.relationship_established, own?.conclusion, own?.claim?.state, own?.claim?.text],
    ["no_project", false, LEGACY_TEXT, "undetermined", null]);
  t("NEVER BACK-FILLED: the claim is not the conclusion text, and the inquiry's bytes carry no claim key",
    [own?.claim?.text === LEGACY_TEXT, /\nclaim:/.test((await textOf(LEG)) || "")], [false, false]);
  t("a project drawing on the legacy question does NOT inherit its conclusion (stated, not inferred)",
    await conclusionOf(A, LEG), null);
  /* OVER-STRICTNESS: a project may conclude a question whose own state is
     `concluded`, because that state is another relationship's. */
  const legSha = await shaOf(LEG);
  const pa = await conclude({ target: LEG, project: A, falsifier: "a rescinding minute" });
  t("OVER-STRICTNESS: A may conclude the legacy question for itself — the other relationship does not bar it",
    [pa?.ok, pa?.claim?.text], [true, VL.claim]);
  t("and the legacy conclusion in the inquiry's own bytes is untouched",
    [await shaOf(LEG) === legSha, (await versionsOf(LEG))?.no_project_conclusion?.conclusion],
    [true, LEGACY_TEXT]);
}

/* hygiene.test.mjs's rule: every Miniflare instance is disposed, so the process ends on its own result. */
await mf.dispose();
console.log(`\n  conclude-project: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
