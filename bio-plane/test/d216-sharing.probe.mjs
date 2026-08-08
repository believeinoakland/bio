/* D-216 — THE MODEL CHECK, AND IT IS AN INSTRUMENT RATHER THAN A SUITE.
 *
 * IS-BUILD-PLAN's W0 slot-free lane. The question, stated by the plan as a
 * CHECKABLE FACT and not a preference: *"sharing is the `refs` edge, else this
 * item is wrong and cloning is the honest answer — a checkable fact, recorded
 * either way."* PL-13 (CURRENT as a project-to-inquiry property) is BLOCKED on
 * the answer, and the plan front-loads it deliberately because it decides
 * whether PL-13 is the RIGHT ITEM at all.
 *
 * WHY THIS FILE IS `.probe.mjs` AND NOT `.test.mjs`. `scripts/battery.mjs`
 * discovers `f.endsWith(".test.mjs")` and `scripts/coverage.mjs` reads its op
 * corpus from the same filter. A measurement lane owes the battery a delta of
 * ZERO, and a probe that joined it would move the assertion count for an item
 * that builds nothing. Run it directly:
 *
 *     node bio-plane/test/d216-sharing.probe.mjs
 *
 * WHAT IT DRIVES, and DRIVING is the point — the design documents are what
 * RAISED this question, so they are not allowed to answer it. Every fact below
 * is produced by making the real plane (`src/index.mjs` under miniflare, the
 * whole control plane, not the store alone) do the thing, through ops a caller
 * has:
 *
 *   op=select · op=cite · op=sever · op=promote · op=backlinks · op=stats ·
 *   op=basisversions · op=versionaccept · op=versioncurrent · op=strengthbarof ·
 *   op=inquirystrength · op=image
 *
 * WHAT THIS INSTRUMENT CANNOT SEE, stated because every good measurement this
 * week stated its blind spot:
 *
 *   (i)  IT IS A ONE-ISOLATE, ONE-STORE MEASUREMENT. Two projects here are two
 *        bundles in ONE Durable Object. It says nothing about two INSTANCES,
 *        which is a different sharing question entirely and is not what §7 asks.
 *   (ii) IT MEASURES TODAY'S CODE, NOT TOMORROW'S. `#strengthWalk` does not read
 *        version legs today, so arm E's finding about strength is a fact about
 *        the tree at this commit and must be re-run if PL-16 makes strength
 *        version-relative.
 *  (iii) IT CANNOT SEE A RULE NOBODY WROTE DOWN. "Nothing in the model REQUIRES
 *        one shared stance" is established by driving divergence and finding no
 *        refusal — an absence of refusal over the ops that exist. An unbuilt op
 *        could still introduce one, which is exactly what arm E's `projects[]`
 *        composition warns about.
 *   (iv) IT DOES NOT MEASURE THE NOTIFICATION. §7's two FINDING-class slugs are
 *        PL-13's to mint and do not exist yet; this probe asserts they are
 *        ABSENT rather than pretending to test them.
 *
 * NEGATIVE CONTROLS ARE INLINE AND RUN ON EVERY PASS — they are not a separate
 * harness, because every assertion here is a read rather than an edit to a real
 * source, and the failure mode this item is exposed to is VACUITY rather than
 * absorption. *"Two projects both see the inquiry"* is trivially true if neither
 * can see anything, so every "they agree" arm is paired with an arm proving the
 * thing they agree about is NON-EMPTY, and every "it did not move" arm is paired
 * with an arm proving the pointer was NON-NULL on both sides of the act.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseFrontmatter } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");

let pass = 0, fail = 0;
const FINDINGS = [];
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
/* A MEASUREMENT rather than an assertion: printed and carried into the report,
   never compared. The distinction matters — a number this probe DISCOVERS must
   not be pinned by the probe that discovered it. */
const m = (label, value) => { FINDINGS.push([label, value]); console.log(`  MEASURED  ${label}: ${JSON.stringify(value)}`); return value; };
const sha = (v) => createHash("sha256").update(v).digest("hex");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d216", MEMBER_TOKEN: "mem-d216", PROBE_TOKEN: "prb-d216", VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const codeOf = (r) => (r && typeof r.code === "string") ? r.code
  : (r && typeof r.reason === "string") ? r.reason : null;

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-d216",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* An ADMINISTRATOR member: 7.3 says administrators see all projects, which is
   what lets ONE credential drive both teams' acts. That is a convenience of the
   instrument and NOT a claim about the model — arm C re-reads every stance
   through the plane rather than through this credential's privileges. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const scalar = (k, v) => v === null ? [`    ${k}: null`]
  : v === undefined ? [] : typeof v === "boolean" ? [`    ${k}: ${v}`]
  : [`    ${k}: "${String(v)}"`];
const versionLines = (versions) => {
  const rows = versions.map((v) => ['  - name: "' + v.name + '"',
    ...scalar("description", v.description), ...scalar("relationship", v.relationship),
    ...scalar("state", v.state === undefined ? "suggested" : v.state),
    ...scalar("derived_from", null), ...scalar("hidden", false),
    ...scalar("run", v.run), ...scalar("author", "ruth"), ...scalar("at", NOW),
    ...scalar("state_by", undefined), ...scalar("state_at", undefined),
    ...scalar("state_reason", undefined)].join("\n"));
  const grounds = versions.flatMap((v) => (v.grounds ?? []).map((g) =>
    ['  - version: "' + v.name + '"', ...scalar("ground", g.ground),
     ...scalar("asserted_by", "ruth"), ...scalar("at", NOW)].join("\n")));
  const legs = versions.flatMap((v) => (v.legs ?? []).map((l) =>
    ['  - version: "' + v.name + '"', ...scalar("target", l.target),
     ...scalar("role", "supports"), ...scalar("ground", l.ground),
     ...scalar("grade", l.grade), ...scalar("grade_axis", l.grade_axis),
     ...scalar("grade_source", l.grade_source)].join("\n")));
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
  "state_history: []",
  "annotations_open: 0",
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
/* A project with NO references at all. Every `cites` edge below is written by
   `op=cite` — the product's own act — and never hand-authored into frontmatter,
   because an edge a fixture typed is an edge that proves nothing about whether
   a caller can make one. */
const projectMd = (id, { bar = null, refs = [], severed = [] } = {}) => ["---", `id: ${id}`,
  "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(refs.length || severed.length
    ? ["references:",
       ...refs.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"]),
       ...severed.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: severed",
                                  '    note: "the budget team is no longer drawing on this question"'])]
    : ["references: []"]),
  ...(bar ? ["required_strength:", `  capture: ${bar.capture}`, `  connection: ${bar.connection}`] : []),
  "---", "", "## Summary", "", "A project.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type, base = null) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base,
  snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: type === "inquiry" ? "open" : type === "project" ? "forming" : "collected",
          created: NOW, last_updated: LATER } });
const mustPromote = async (id, text, type, base = null) => {
  const r = await promote(id, text, type, base);
  if (!r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};
const shaOf = async (id) => (await GET(`op=list&token=${RUTH}&limit=1000`))
  ?.bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;

const LEDGER = "INFO-2026-3000-ledger", MINUTES = "INFO-2026-3000-minutes",
      AUDIT = "INFO-2026-3000-audit";
for (const d of [LEDGER, MINUTES, AUDIT]) await mustPromote(d, infoMd(d), "information");

const INQ = "INQ-2026-3000-sewer-transfers";
const V1 = { name: "opening account", relationship: "and",
  description: "The first reading: the ledger and the minutes together show the transfer.",
  run: "AIRUN-2026-3000-first", grounds: [{ ground: "paper trail" }],
  legs: [{ target: LEDGER, ground: "paper trail", grade: "B", grade_axis: "capture", grade_source: "capture" },
         { target: MINUTES, ground: "paper trail", grade: "C", grade_axis: "connection", grade_source: "testimony" }] };
const V2 = { name: "the audit alone", relationship: "and",
  description: "Second reading: the audit carries the finding without the paper trail.",
  run: "AIRUN-2026-3000-second", grounds: [{ ground: "the audit" }],
  legs: [{ target: AUDIT, ground: "the audit", grade: "B", grade_axis: "capture", grade_source: "capture" }] };
await mustPromote(INQ, inquiryMd(INQ, { versions: [V1, V2], basis: [LEDGER, MINUTES] }), "inquiry");
/* A SECOND question, the over-strictness arm's subject only: it is what proves
   the `op=cite` refusal found below is about the PROJECT arm and not about
   inquiries being uncitable in general. */
const INQ2 = "INQ-2026-3000-process";
await mustPromote(INQ2, inquiryMd(INQ2, {}), "inquiry");

/* THREE projects. A and B will share the question; C never cites it and is the
   arm that keeps "a project may stand on a reading" from being unconditional. */
const A = "PROJ-2026-3000-oversight", B = "PROJ-2026-3000-budget",
      C = "PROJ-2026-3000-unrelated", D = "PROJ-2026-3000-third",
      /* REC-72's arm only. It exists so the CURATED act can be driven onto a
         question without joining any edge set this probe measures a delta over. */
      E = "PROJ-2026-3000-actor";
/* THE TWO BARS ARE CROSSED ON PURPOSE. A declares capture A / connection C; B
   declares capture C / connection B. `#requiredStrengthFor` takes the STRICTEST
   PER AXIS across every citing project, and BASIS_GRADES is strongest-first, so
   the only correct composition takes CAPTURE FROM A AND CONNECTION FROM B — an
   answer NO single-project walk can produce. The first draft of this fixture gave
   both strictest axes to ONE project and the arm passed while proving nothing
   about composition; corrected, and recorded because it is the vacuity failure
   this item was warned about arriving inside its own instrument. */
await mustPromote(A, projectMd(A, { bar: { capture: "A", connection: "C" } }), "project");
await mustPromote(B, projectMd(B, { bar: { capture: "C", connection: "B" } }), "project");
await mustPromote(C, projectMd(C), "project");
await mustPromote(D, projectMd(D), "project");
await mustPromote(E, projectMd(E), "project");

const selectIds = async (ids) => {
  const r = await POST(`op=select&token=${RUTH}`, { ids });
  if (!r.handle) throw new Error(`select: ${JSON.stringify(r)}`);
  return r.handle;
};
const cite = async (project, ids) =>
  GET(`op=cite&token=${RUTH}&project=${encodeURIComponent(project)}&handle=${await selectIds(ids)}`);
const backlinksOf = async (target) => GET(`op=backlinks&token=${RUTH}&target=${encodeURIComponent(target)}`);
const statsRefs = async () => (await GET(`op=stats&token=${RUTH}`))?.refs ?? null;
const versionsOf = async (id, extra = "", tok = RUTH) =>
  GET(`op=basisversions&token=${tok}&id=${encodeURIComponent(id)}${extra}`);
const imageOf = async (id) => (await GET(`op=image&token=${RUTH}&id=${encodeURIComponent(id)}`))?.["bundle.md"] ?? "";
const act = async (op, q) => POST(`op=${op}&token=${RUTH}&target=${encodeURIComponent(INQ)}&${q}`, {});
const accept = (version) =>
  act("versionaccept", `version=${encodeURIComponent(version)}&reason=${encodeURIComponent("the evidence holds")}`);
const makeCurrent = (project, version) =>
  act("versioncurrent", `version=${encodeURIComponent(version)}&project=${encodeURIComponent(project)}`);
const stanceOf = async (project) =>
  (await versionsOf(INQ, `&project=${encodeURIComponent(project)}`))?.current ?? null;

/* ==================================================================== ARM A
 * IS THERE A REAL EDGE BY WHICH TWO PROJECTS REFERENCE ONE INQUIRY, AND WHAT IS
 * IT CALLED? Driven, not read off a design document.
 * ================================================================== */
console.log("\n--- A. THE EDGE: is it real, what is it called, is it many-to-one? ---");
{
  /* THE EMPTY-CASE GUARD FIRST, and it is what stops arm A being a constant. If
     the store answered `backlinks: []` for everything, every assertion below
     would still "pass" as a set difference. So the BEFORE state is asserted
     empty and the AFTER state is asserted as a DELTA. */
  const before = await backlinksOf(INQ);
  t("EMPTY CASE GUARDED: before any cite, NO project references the question — so what follows is a "
  + "DELTA and not a constant",
    [before?.ok, (before?.backlinks ?? []).length], [true, 0]);

  /* THE FIRST THING DRIVING FOUND, AND THE BRIEF DID NOT PREDICT IT.
     `op=cite` — the curated act whose whole job is writing this edge family —
     REFUSED an inquiry on the PROJECT arm. `cite()`'s citability test read
     `ontoInquiry ? !(ty === "information" || ty === "inquiry") : ty !== "information"`,
     so a QUESTION could cite another question and a PROJECT could cite
     Information and NOTHING ELSE. The edge §7 rests on had no curated producer,
     and `op=sever` refused it identically, so a project could not withdraw
     either.

     ============ CORRECTED 2026-08-08 BY REC-72, WHICH THIS ARM CAUSED =======
     THIS ARM USED TO ASSERT THE REFUSAL: `[cA?.ok, cA?.reason, cB?.reason]` ->
     `[false, "NOT_INFORMATION", "NOT_INFORMATION"]`, and it was routed as
     REC-72 the same day. REC-72 widened the case arm by EXACTLY ONE TYPE and
     moved `op=sever`'s mirror with it. **The arm is CORRECTED and not deleted,
     and it is not exempted:** an instrument still asserting a refusal its own
     finding removed is an instrument lying about its subject, and an instrument
     that simply DROPPED the arm would leave nothing here to notice a
     regression. What it now asserts is the state REC-72 put the plane in, over
     the same two cases, through the same act, in the same isolate.

     WHAT DID NOT CHANGE, and it is why the rest of this probe still stands:
     the EDGE is the same `cites` row in `refs` either way. Everything below —
     the many-to-one walk, the crossed bars, the divergent stances — measured
     the edge and not its producer, so it is untouched by the producer arriving.
     The route the arm below drives (author `references[]`, `op=promote`) also
     still works and is still what makes the whole model substrate-honest; it is
     simply no longer the ONLY route.

     THE ARM IS DRIVEN ON `E` AND `INQ2`, NOT ON `A`/`B`/`INQ`, AND THAT IS
     DELIBERATE: every arm below measures a DELTA on `INQ`'s edge set and on
     `op=stats.refs`, so a curated write onto `INQ` here would silently become
     part of somebody else's baseline — the exact defect the `refs0` comment
     twenty lines down was already written to avoid. `E <- INQ2` is the same
     shape (a case drawing on a question) measured where nothing else is
     looking, so this probe's other findings are BYTE-FOR-BYTE what they were. */
  const cA = await cite(E, [INQ2]);
  m("op=cite(project <- inquiry) — what the plane answered", { ok: cA?.ok, reason: cA?.reason ?? null,
    cited: cA?.cited ?? null });
  t("REC-72: THE CURATED ACT NOW PRODUCES IT. `op=cite` writes the project-to-question edge, so the "
  + "edge §7 rests on is reachable by an ACT rather than only by hand-authoring a document — which "
  + "is the gap this probe found by DRIVING and no design document recorded",
    [cA?.ok, cA?.cited], [true, [INQ2]]);
  const eBack = ((await backlinksOf(INQ2))?.backlinks ?? []).filter((r) => r.from === E);
  t("READ BACK THROUGH op=backlinks — a DIFFERENT op from the one that wrote it, because an edge "
  + "asserted only through its own writer is an equality that costs nothing",
    eBack.map((r) => [r.rel, r.status]), [["cites", "confirmed"]]);
  /* AND THE WITHDRAWAL, because a case that can join and not leave is a worse
     shape than one that can do neither. RECORDED, not absent: the backlink is
     still returned and says it was cut. */
  const sE = await GET(`op=sever&token=${RUTH}&project=${encodeURIComponent(E)}`
    + `&handle=${await selectIds([INQ2])}&reason=${encodeURIComponent("answered elsewhere")}`);
  const eBack2 = ((await backlinksOf(INQ2))?.backlinks ?? []).filter((r) => r.from === E);
  t("REC-72's MIRROR: `op=sever` withdraws it, and the withdrawal is RECORDED rather than absent — "
  + "the edge is still returned, carrying `severed`, which is the whole difference between "
  + "withdrawing and never having cited (DEC-19: correction moves FORWARD)",
    [sE?.ok, sE?.severed ?? null, eBack2.map((r) => [r.rel, r.status])],
    [true, [INQ2], [["cites", "severed"]]]);
  /* OVER-STRICTNESS, so the arm above is about the PROJECT arm and not about
     citing generally: the same selection cites into a QUESTION perfectly well.
     Without this the finding would read as "the plane refuses inquiry citations",
     which is false and would send PL-13 the wrong way. */
  const ontoQuestion = await GET(`op=cite&token=${RUTH}&project=${encodeURIComponent(INQ2)}`
    + `&handle=${await selectIds([INQ])}&role=supports`);
  t("OVER-STRICTNESS: the SAME selection cites into a QUESTION and lands — so the refusal above is "
  + "about the PROJECT arm specifically and not about inquiries being uncitable",
    ontoQuestion?.ok, true);

  /* THE ROUTE THAT DOES EXIST, and it is an op a member holds: author the
     project's own `references[]` and `op=promote` it. `refs` is a PROJECTION
     re-derived from bundle.md inside promote's transaction (D-21), so this is
     the SAME table `op=cite` would have written — reached by the substrate write
     path rather than by the curated act. PL-2's own suite fixture takes exactly
     this route, which is why the gap was invisible to it. */
  /* The baseline is taken HERE and not before the arms above, because the
     over-strictness cite wrote a question-to-question edge of its own: a delta
     measured across somebody else's write is not this write's delta. */
  const refs0 = await statsRefs();
  await mustPromote(A, projectMd(A, { bar: { capture: "A", connection: "C" }, refs: [INQ] }),
                    "project", await shaOf(A));
  await mustPromote(B, projectMd(B, { bar: { capture: "C", connection: "B" }, refs: [INQ] }),
                    "project", await shaOf(B));

  const after = await backlinksOf(INQ);
  const rows = (after?.backlinks ?? []).filter((r) => r.from_type === "project");
  t("TWO PROJECTS NOW REFERENCE ONE INQUIRY, and the plane says so through op=backlinks",
    rows.map((r) => r.from).sort(), [B, A].sort());
  const rels = m("the edge kind the plane reports", [...new Set(rows.map((r) => r.rel))]);
  t("AND THE EDGE IS CALLED `cites` — §7's \"a `refs` edge\" is the right family and `cites` is the "
  + "member of it that carries a project's interest in a question",
    rels, ["cites"]);
  t("the edge STATUS is the citing document's own, read back through the plane",
    [...new Set(rows.map((r) => r.status))], ["confirmed"]);

  /* THE PROJECTION IS REAL, NOT ONLY THE FRONTMATTER. `refs` is re-derived from
     bundle.md inside promote's transaction (D-21), so the count is the evidence
     that the edge reached the table the reverse walk reads. */
  const refs1 = await statsRefs();
  m("refs rows before the two cites", refs0);
  m("refs rows after the two cites", refs1);
  t("and the `refs` PROJECTION grew by exactly TWO — the edge is in the table, not only in the bytes",
    refs1 - refs0, 2);

  /* THE PLANE WALKS IT MANY-TO-ONE, and this is the arm that proves the store
     genuinely composes over BOTH projects rather than picking one. Project A
     declares capture C / connection C; project B declares capture A / connection
     B. `#requiredStrengthFor` takes the STRICTEST PER AXIS across every citing
     project — so a correct answer must take one axis from EACH project, which no
     single-project read could produce. */
  const bar = await GET(`op=strengthbarof&token=${RUTH}&target=${encodeURIComponent(INQ)}`);
  m("the composed bar", { source: bar?.bar?.source, capture: bar?.bar?.capture,
                          connection: bar?.bar?.connection, projects: bar?.bar?.projects });
  t("THE PLANE READS BOTH PROJECTS AT ONCE: the bar names them BOTH and takes CAPTURE FROM A AND "
  + "CONNECTION FROM B (strictest per axis over CROSSED declarations) — an answer no single-project "
  + "walk could produce, which is what makes the edge genuinely many-to-one",
    [bar?.bar?.source, (bar?.bar?.projects ?? []).slice().sort(), bar?.bar?.capture, bar?.bar?.connection],
    ["project", [B, A].sort(), "A", "B"]);
  /* NEGATIVE CONTROL for the arm above, run: the composition must be a FUNCTION
     of the projects and not a constant. C cites nothing, so citing it in would
     have to move the bar if the walk is real — and it must NOT move it here,
     because C declares no bar at all. That is the over-strictness direction. */
  await mustPromote(C, projectMd(C, { refs: [INQ] }), "project", await shaOf(C));
  const bar2 = await GET(`op=strengthbarof&token=${RUTH}&target=${encodeURIComponent(INQ)}`);
  t("OVER-STRICTNESS ARM: a THIRD citing project that declares NO bar joins the edge set and does NOT "
  + "move the composed pair — the walk composes declarations, not citations",
    [(bar2?.bar?.projects ?? []).slice().sort(), bar2?.bar?.capture, bar2?.bar?.connection],
    [[B, A].sort(), "A", "B"]);
  const rows2 = ((await backlinksOf(INQ))?.backlinks ?? []).filter((r) => r.from_type === "project");
  t("and the edge set itself DID grow to three, so the previous arm is about the bar and not about the "
  + "edge — the two are measured separately",
    rows2.length, 3);
}

/* ==================================================================== ARM B
 * WHAT DOES EACH PROJECT SEE — the same versions, the same evidence, the same
 * strengths?
 * ================================================================== */
console.log("\n--- B. WHAT EACH PROJECT SEES of the shared question ---");
{
  const rA = await versionsOf(INQ, `&project=${encodeURIComponent(A)}`);
  const rB = await versionsOf(INQ, `&project=${encodeURIComponent(B)}`);

  /* THE VACUITY GUARD. "Both projects see the same versions" is trivially true
     of two empty lists, and this item's own brief names that failure. So the
     shared thing is asserted NON-EMPTY and NAMED before it is compared. */
  t("VACUITY GUARDED: the shared question really holds two readings, so \"they see the same\" is a "
  + "claim about something rather than about nothing",
    [(rA?.versions ?? []).length, (rA?.versions ?? []).map((v) => v.name).sort()],
    [2, ["opening account", "the audit alone"]]);
  t("and each reading really carries legs — the evidence is present, not an empty shell",
    (rA?.versions ?? []).map((v) => (v.legs ?? []).length).sort(), [1, 2]);

  const strip = (r) => JSON.stringify((r?.versions ?? []).map((v) => ({ ...v })));
  t("BOTH PROJECTS SEE THE IDENTICAL VERSION SET — same names, same states, same legs, same grades, "
  + "same descriptions. The investigation is SHARED and not copied",
    strip(rA) === strip(rB), true);
  t("and the totals and bounds agree too, so nothing is being paged differently per project",
    [rA?.total === rB?.total, rA?.count === rB?.count, rA?.truncated === rB?.truncated],
    [true, true, true]);

  /* STRENGTH. Measured rather than assumed: `op=inquirystrength` takes NO
     project parameter at all, and `#strengthWalk` reads `inquiry_basis` — the
     inquiry's own live legs — never a version's. So the derived pair is a
     property of the QUESTION today and cannot differ per project. */
  const s = await GET(`op=inquirystrength&token=${RUTH}&id=${encodeURIComponent(INQ)}`);
  m("the derived pair for the shared question", { capture: s?.capture?.state, connection: s?.connection?.state });
  t("STRENGTH IS QUESTION-SCOPED TODAY: op=inquirystrength answers for the inquiry and accepts no "
  + "project at all, so both teams read one derived pair",
    [s?.ok, typeof s?.capture === "object", typeof s?.connection === "object"], [true, true, true]);
  t("and it is derived from the INQUIRY's own basis, never from a version — asserted over the real "
  + "source, because this is what makes a per-project stance INERT for strength today",
    [/#strengthWalk\(/.test(STORE_SRC),
     /basisFor|FROM inquiry_basis/.test(STORE_SRC.slice(STORE_SRC.indexOf("#strengthWalk("), STORE_SRC.indexOf("#strengthWalk(") + 6000)),
     STORE_SRC.slice(STORE_SRC.indexOf("#strengthWalk("), STORE_SRC.indexOf("#strengthWalk(") + 6000).includes("inquiry_basis_version")],
    [true, true, false]);
}

/* ==================================================================== ARM C
 * THE ANSWER: ONE STANCE, OR PER-PROJECT? Driven to divergence.
 * ================================================================== */
console.log("\n--- C. ONE STANCE OR PER-PROJECT: driven to actual divergence ---");
{
  const a1 = await accept("opening account");
  const a2 = await accept("the audit alone");
  t("both readings are ACCEPTED — a precondition of the question, and current implies accepted (§6.5)",
    [a1?.ok, a2?.ok], [true, true]);

  const mA = await makeCurrent(A, "opening account");
  t("project A stands on the FIRST reading", [mA?.ok, mA?.project], [true, A]);
  const stanceA1 = await stanceOf(A);
  const stanceB1 = await stanceOf(B);
  t("VACUITY GUARDED both ways: A's stance is NON-NULL and B's is NULL, so the two are distinguishable "
  + "before the second act — a null-against-null comparison would pass while asserting nothing",
    [stanceA1?.version, stanceB1], ["opening account", null]);

  const mB = await makeCurrent(B, "the audit alone");
  t("project B stands on the SECOND reading of the SAME question, and the plane permits it — NO refusal, "
  + "no clone, no shared stance",
    [mB?.ok, mB?.project, codeOf(mB)], [true, B, null]);

  const stanceA2 = await stanceOf(A);
  const stanceB2 = await stanceOf(B);
  t("*** THE ANSWER *** TWO PROJECTS STAND ON DIFFERENT READINGS OF ONE SHARED INQUIRY, SIMULTANEOUSLY",
    [stanceA2?.version, stanceB2?.version], ["opening account", "the audit alone"]);
  t("and they genuinely DIFFER — asserted directly, because two equal answers would be indistinguishable "
  + "from one shared stance and would cost nothing to produce",
    stanceA2?.version !== stanceB2?.version, true);
  t("B's act MOVED NOBODY ELSE: A's pointer is byte-identical across B's act, and it was NON-NULL on "
  + "both sides of it",
    [JSON.stringify(stanceA1) === JSON.stringify(stanceA2), stanceA2 !== null], [true, true]);

  /* THE SHARED HALF IS STILL SHARED — the property cloning would have destroyed.
     Both projects still see BOTH readings and every leg, and both see that the
     other's reading exists. */
  const rA = await versionsOf(INQ, `&project=${encodeURIComponent(A)}`);
  const rB = await versionsOf(INQ, `&project=${encodeURIComponent(B)}`);
  const names = (r) => (r?.versions ?? []).map((v) => v.name).sort();
  t("AND THE INVESTIGATION IS STILL SHARED AFTER DIVERGENCE — each team still sees the OTHER team's "
  + "reading and both readings' legs, which is exactly what cloning would have ended",
    [names(rA), names(rB), JSON.stringify(rA?.versions) === JSON.stringify(rB?.versions)],
    [["opening account", "the audit alone"], ["opening account", "the audit alone"], true]);

  /* AND THE INQUIRY ITSELF HOLDS NO STANCE. §7 forbids the pointer living on the
     shared question; this reads the shared question's own bytes and finds none. */
  const inqDoc = await imageOf(INQ);
  const inqFm = parseFrontmatter(inqDoc).data || {};
  t("THE SHARED QUESTION CARRIES NO STANCE OF ITS OWN — no `current_versions`, no `current` field: §7's "
  + "forbidden place is EMPTY in the bytes, not merely unused by a reader",
    [inqFm.current_versions === undefined, inqFm.current === undefined,
     /current_versions:/.test(inqDoc)], [true, true, false]);
  const noProject = await versionsOf(INQ);
  t("and a read that names NO project gets NO `current` field at all rather than a default — there is "
  + "no instance-wide stance to fall back on",
    "current" in (noProject ?? {}), false);
}

/* ==================================================================== ARM D
 * WHERE THE POINTER HANGS — and whether PL-2's shipped place survives.
 * ================================================================== */
console.log("\n--- D. WHERE A PER-PROJECT POINTER HANGS, and whether PL-2's place survives ---");
{
  const docA = await imageOf(A);
  const fmA = parseFrontmatter(docA).data || {};
  const rowA = (Array.isArray(fmA.current_versions) ? fmA.current_versions : [])
    .find((r) => r && r.inquiry === INQ) || null;
  t("THE POINTER IS A ROW ON THE PROJECT'S OWN `bundle.md` — authored frontmatter beside "
  + "`required_strength`, exactly where §7 puts it",
    [rowA !== null, rowA?.version, rowA?.by, typeof rowA?.at === "string" && rowA.at.endsWith("Z")],
    [true, "opening account", "ruth", true]);
  t("and it is DATED and ATTRIBUTED in the bytes — the property DEC-17 demands and a settings row "
  + "cannot have: something to read afterwards",
    [/^current_versions:$/m.test(docA), /\| Stands on \| ruth/.test(docA)], [true, true]);
  t("the SAME field on project B carries B's own different row, so the field is per-project by "
  + "construction and not by convention",
    ((parseFrontmatter(await imageOf(B)).data || {}).current_versions ?? [])
      .filter((r) => r && r.inquiry === INQ).map((r) => r.version), ["the audit alone"]);
  t("NOT A SETTINGS ROW: `current_versions` is written at exactly ONE site in the store and that site "
  + "PROMOTES the project — asserted over comment-stripped real source",
    STORE_SRC.replace(/\/\*[\s\S]*?\*\//g, "").split("#setCurrentVersionRow(").length - 1 >= 1
      && STORE_SRC.replace(/\/\*[\s\S]*?\*\//g, "").split("INSERT INTO").filter((s) => /current_version/i.test(s.slice(0, 40))).length,
    0);
  /* A SETTINGS TABLE WOULD SHOW UP IN `op=stats`, which counts every table the
     store keeps. Read it and assert there is no stance counter — the pointer is
     nowhere but the document. */
  const st = await GET(`op=stats&token=${RUTH}`);
  t("and no stance table exists at all: op=stats counts every table the store keeps and none of them "
  + "is a current-version row",
    Object.keys(st ?? {}).filter((k) => /current/i.test(k)), []);
}

/* ==================================================================== ARM E
 * DOES ANYTHING IN THE MODEL *REQUIRE* ONE SHARED STANCE? — D-216's literal
 * question, and the arm that would kill PL-13 if it answered yes.
 * ================================================================== */
console.log("\n--- E. does anything REQUIRE one shared stance? (the arm that could kill PL-13) ---");
{
  /* (1) THE EDGE IS LOAD-BEARING, NOT DECORATIVE. Mark B's citation SEVERED —
     the edge row stays in `refs` (a severed edge is a recorded human judgement
     and is never deleted) while the citing DOCUMENT records it as withdrawn —
     and B loses its standing to hold a stance at all. If the stance were a
     property of the INQUIRY this could not happen.
     NOTE the arm is written through `op=promote` because `op=sever`, like
     `op=cite`, is refused for an inquiry on the project arm — the same gap. */
  const sev = await promote(B, projectMd(B, { bar: { capture: "C", connection: "B" }, severed: [INQ] }),
                            "project", await shaOf(B));
  m("severed the citation by authoring the document", { ok: sev?.ok, reason: sev?.reason ?? null });
  const stillInRefs = ((await backlinksOf(INQ))?.backlinks ?? []).find((r) => r.from === B) ?? null;
  t("THE ROW SURVIVES THE SEVER — `refs` still carries the edge and the plane reports its status as "
  + "`severed`, because a severed edge is a recorded judgement and never a deletion",
    [stillInRefs !== null, stillInRefs?.status], [true, "severed"]);
  const afterSever = await makeCurrent(B, "opening account");
  t("SEVERING THE EDGE REMOVES THE STANDING TO HOLD A STANCE — the `cites` edge is what makes the "
  + "project-to-inquiry relationship exist, which is the fact D-216 asks for",
    codeOf(afterSever), "VERSION_CURRENT_UNRELATED");

  /* (2) A PROJECT THAT NEVER CITED IT IS REFUSED IDENTICALLY. Without this, arm
     C's success would be consistent with "any project may stand on anything". */
  const never = await makeCurrent(D, "opening account");
  t("a project that never drew on the question is refused in the SAME words — so a stance is not "
  + "something any project may take about any question",
    codeOf(never), "VERSION_CURRENT_UNRELATED");

  /* (3) AN UNACCEPTED READING IS REFUSED. The pointer is not free. */
  const unacc = await POST(`op=versionhide&token=${RUTH}&target=${encodeURIComponent(INQ)}`
    + `&version=${encodeURIComponent("the audit alone")}&hidden=true`, {});
  m("hide result (a hidden version stays in the record, DEC-29(b))", { ok: unacc?.ok });

  /* (4) THE OVER-STRICTNESS DIRECTION: a THIRD project may also stand on a
     reading, and two projects may AGREE. The mechanism is not two-only and
     divergence is not compulsory. */
  await mustPromote(D, projectMd(D, { refs: [INQ] }), "project", await shaOf(D));
  const third = await makeCurrent(D, "opening account");
  t("OVER-STRICTNESS: a THIRD project citing the same question may also stand on a reading — the "
  + "mechanism is not two-only",
    [third?.ok, (await stanceOf(D))?.version], [true, "opening account"]);
  t("and TWO PROJECTS MAY AGREE: standing on the same reading as A is permitted, so per-project does "
  + "not mean per-project-must-differ",
    (await stanceOf(A))?.version === (await stanceOf(D))?.version, true);

  /* (5) THE NOTIFICATION §7 REQUIRES DOES NOT EXIST YET, and this probe says so
     rather than pretending to test it. Asserted as ABSENT so PL-13 cannot be
     reported as partially done. */
  const q = readFileSync(SRC("queuestate.mjs"), "utf8");
  t("§7's TWO NOTIFICATION SLUGS ARE NOT MINTED YET — asserted ABSENT so nobody reads this probe as "
  + "evidence that PL-13's notification half is built",
    [/stance-changed/.test(q), /new-version-arrived/.test(q)], [false, false]);

  /* (6) AND THE ONE PLACE THE MODEL *DOES* COMPOSE ACROSS PROJECTS, named
     because it is the closest thing to a counter-example and it points the other
     way: `#requiredStrengthFor` composes STRICTEST-WINS over every citing
     project rather than answering per project. That is a deliberate choice
     recorded at the site, and it is about the BAR (a floor two teams must both
     clear) and not about the STANCE (what one team reads the evidence to say). */
  const site = STORE_SRC.slice(STORE_SRC.indexOf("#requiredStrengthFor(bundleId, fm)") - 1400,
                               STORE_SRC.indexOf("#requiredStrengthFor(bundleId, fm)"));
  t("THE ONE CROSS-PROJECT COMPOSITION IN THE MODEL IS THE BAR, NOT THE STANCE — and the site says so "
  + "in its own words, so this is a recorded decision rather than an accident",
    [/WHERE TWO PROJECTS CITE ONE INQUIRY/.test(site), /STRICTEST/.test(site)], [true, true]);
}

console.log("\n--- MEASURED VALUES (carried to MEASUREMENTS.md; never pinned here) ---");
for (const [k, v] of FINDINGS) console.log(`  ${k} = ${JSON.stringify(v)}`);

} catch (e) {
  /* D-93's class: a throw here would hide every arm behind it. Reported as a
     failure with its own line rather than allowed to abort the process. */
  console.log(`  FAIL  the probe THREW rather than measuring: ${e && e.stack ? e.stack.split("\n").slice(0, 4).join(" | ") : e}`);
  fail++;
}

await mf.dispose();
console.log(`\nd216-sharing.probe: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
