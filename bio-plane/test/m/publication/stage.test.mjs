/* publication — a project's stage and its work products' readiness (R44–R47; N300, K356, K362, K364, K379), driven at
   the module's interface over the real modules it reads (basis-versions R41 `projectQuestions`, membership R44's sight).
   The project's inputs are written as the record holds them: its document (references, conclusions, a close) through
   promotion, its legs through inquiry's projection, its cases through R21 and R22. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { planeWorld as world, V, NOW, SIG } from "./fixture.mjs";
import { STAGE_QUESTIONS_MAX, WORK_PRODUCTS_MAX, READINESS_RUNGS, PROJECT_STAGES } from "../../../src/publication/index.mjs";

const Q1 = "INQ-2026-0001", Q2 = "INQ-2026-0002", DOC = "INFO-2026-0001-minutes";

/* A project's document: its own title and state, the questions it cites (`severed` marks a severed citation) and its
   conclusion record (`conclusions` rows as basis-versions reads them). */
function projDoc(title, { state = "forming", closedReason = null, cites = [], severed = [], conclusions = [] } = {}) {
  const refs = [...cites.map((t) => ({ t, s: "confirmed" })), ...severed.map((t) => ({ t, s: "severed" }))];
  return ["---", "object_type: project", "schema: project@1", `title: "${title}"`, `current_state: ${state}`,
    "prior_state: null", ...(closedReason ? [`closed_reason: ${closedReason}`] : []),
    `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
    ...(refs.length ? ["references:", ...refs.flatMap(({ t, s }) => [`  - target: ${t}`, "    rel: cites", `    status: ${s}`])]
                    : ["references: []"]),
    ...(conclusions.length ? ["conclusions:", ...conclusions.flatMap((c) => [`  - inquiry: ${c.inquiry}`,
      `    act: ${c.act ?? "concluded"}`, "    by: olive", `    at: "${c.at ?? NOW}"`,
      ...(c.act === "withdrawn" ? ["    reason: \"a new reading\""] : ["    conclusion: \"It is so.\"", "    falsifier: \"A record.\""])])]
      : []),
    "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n");
}

let n = 0;
function setup() {
  const w = world();
  w.member("olive");
  w.member("bob");
  const proj = w.project("Parks", "olive");
  /* written by its owner, as a reopening must be (K362) */
  const write = (opts) => {
    const r = w.promotion.promote({ bundleId: proj, base: w.head(proj), snapKey: `s${++n}`, author: V("olive"), actorMemberId: "olive",
      files: [{ path: "bundle.md", text: projDoc("Parks", opts) }], meta: { object_type: "project" } });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  };
  const stage = (viewer = V("olive")) => w.p.projectStage({ project: proj, viewer });
  return { w, proj, write, stage };
}

/* A case of the project, prepared (R21) and optionally signed and ratified (R22) over one finding. */
function aCase(w, proj, caseId, { sign = false, finding = Q2 } = {}) {
  if (!w.head(finding)) w.inquiry(finding);
  const roles = [{ target: finding, version_sha: w.head(finding) }];
  w.prepare(caseId, 1, { project: proj, roles });
  if (!sign) return;
  assert.equal(w.signCase(caseId, 1, { project: proj,
    roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" })) }).ok, true);
  assert.equal(w.signFinding(finding, { sig: SIG(caseId.length) }).ok, true);
}

test("R44 R45 one project through the four stages by its inputs alone: cite, add a leg, conclude, withdraw, ratify, close and reopen", () => {
  const { w, proj, write, stage } = setup();
  assert.deepEqual(PROJECT_STAGES, ["forming", "investigating", "matured", "closed"]);
  let s = stage();
  assert.deepEqual([s.ok, s.project, s.stage, s.closed_reason, s.basis],
                   [true, proj, "forming", null, { rule: "forming", question: null, case: null, edition: null }]);
  assert.deepEqual(s.questions, { read: 0, with_legs: 0, concluded: 0, truncated: false });
  /* cite a question with no leg: still forming, the question held and read */
  w.doc(DOC);
  w.inquiry(Q1);
  write({ cites: [Q1] });
  s = stage();
  assert.deepEqual([s.stage, s.questions], ["forming", { read: 1, with_legs: 0, concluded: 0, truncated: false }]);
  /* a leg: investigating, named by the question that met rule 3 */
  w.inquiry(Q1, { legs: [{ target: DOC }] });
  s = stage();
  assert.deepEqual([s.stage, s.basis], ["investigating", { rule: "investigating", question: Q1, case: null, edition: null }]);
  assert.equal(s.questions.with_legs, 1);
  /* the project's own conclusion: matured */
  write({ cites: [Q1], conclusions: [{ inquiry: Q1 }] });
  s = stage();
  assert.deepEqual([s.stage, s.basis, s.questions.concluded], ["matured", { rule: "matured", question: Q1, case: null, edition: null }, 1]);
  /* its withdrawal: investigating again, never a stored stage left behind (R47) */
  write({ cites: [Q1], conclusions: [{ inquiry: Q1 }, { inquiry: Q1, act: "withdrawn", at: "2026-09-28T02:00:00Z" }] });
  assert.equal(stage().stage, "investigating");
  /* a ratified case edition the project owns: matured, named by the case edition */
  aCase(w, proj, "CASE-2026-0001", { sign: true });
  s = stage();
  assert.deepEqual([s.stage, s.basis], ["matured", { rule: "matured", question: null, case: "CASE-2026-0001", edition: 1 }]);
  /* the owner's recorded close, with its reason: closed, whatever else holds */
  write({ state: "closed", closedReason: "resolved", cites: [Q1] });
  s = stage();
  assert.deepEqual([s.stage, s.closed_reason, s.basis], ["closed", "resolved", { rule: "closed", question: null, case: null, edition: null }]);
  /* reopened (the owner's act): derived again */
  write({ state: "investigating", cites: [Q1] });
  assert.deepEqual([stage().stage, stage().closed_reason], ["matured", null]);
});

test("R45 R47 negative control: a document's own `matured` (or `investigating`) holding no question still reads forming; the stage is never stored", () => {
  const { w, proj, write, stage } = setup();
  const before = Object.keys(w.snapshot());
  for (const state of ["investigating", "matured"]) {   /* the declared moves, forming → investigating → matured */
    write({ state });
    const s = stage();
    assert.deepEqual([s.stage, s.closed_reason], ["forming", null], state);
  }
  /* no table or column holds a stage or a readiness, and reading writes nothing */
  assert.deepEqual(Object.keys(w.snapshot()), before);
  const cols = w.rows(`SELECT m.name AS t, p.name AS c FROM sqlite_master m JOIN pragma_table_info(m.name) p WHERE m.type='table'`);
  assert.equal(cols.some((r) => /^(stage|project_stage|readiness|work_?product_readiness)$/.test(r.c)), false,
               JSON.stringify(cols.filter((r) => /stage|readiness/.test(r.c))));
  const snap = w.snapshot();
  stage();
  w.op("projectstage", { project: proj, viewer: V("olive") });
  assert.deepEqual(w.snapshot(), snap, "a read writes nothing");
});

test("R45 a question is held in any shared state, and a severed citation holds nothing; a no-project conclusion is not the project's", () => {
  const { w, write, stage } = setup();
  w.doc(DOC);
  w.inquiry(Q1, { legs: [{ target: DOC }], state: "concluded" });
  /* the inquiry's own (no-project) concluded state is never the project's adoption */
  write({ cites: [Q1] });
  assert.equal(stage().stage, "investigating");
  write({ severed: [Q1] });
  const s = stage();
  assert.deepEqual([s.stage, s.questions.read], ["forming", 0]);
});

test("R46 each case the project owns is a work product; each rung by its own condition; a published case reads distributed, never draft", () => {
  const { w, proj, stage } = setup();
  assert.deepEqual(READINESS_RUNGS, ["draft", "internally_checked", "externally_compliant", "distributed"]);
  let s = stage();
  assert.deepEqual([s.readiness, s.work_products, s.published_editions, s.work_products_truncated], ["absent", [], 0, false]);
  const notEvaluated = { met: false, why: "no evaluation is recorded" };
  /* prepared, not signed: a draft */
  aCase(w, proj, "CASE-2026-0001");
  s = stage();
  assert.deepEqual(s.work_products, [{ case: "CASE-2026-0001", readiness: "draft", editions: 0, latest_edition: null,
    rungs: { draft: { met: true }, internally_checked: notEvaluated, externally_compliant: notEvaluated,
             distributed: { met: false, why: "no edition of this case is ratified" } } }]);
  assert.deepEqual([s.readiness, s.stage], ["draft", "forming"], "a draft is not a ratified edition");
  /* signed and ratified: distributed, and no longer a draft (its document is signed) */
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: Q2, version_sha: w.head(Q2), role: "load_bearing" }] });
  w.signFinding(Q2);
  s = stage();
  assert.deepEqual(s.work_products[0], { case: "CASE-2026-0001", readiness: "distributed", editions: 1, latest_edition: 1,
    rungs: { draft: { met: false, why: "no unsigned case document of this case is stored" }, internally_checked: notEvaluated,
             externally_compliant: notEvaluated, distributed: { met: true } } });
  assert.deepEqual([s.readiness, s.published_editions], ["distributed", 1]);
  /* a second edition prepared: the draft rung is met again, readiness stays the highest rung met */
  w.inquiry(Q2, { question: "Revised?" });
  w.prepare("CASE-2026-0001", 2, { project: proj, roles: [{ target: Q2, version_sha: w.head(Q2) }] });
  s = stage();
  assert.deepEqual([s.work_products[0].rungs.draft, s.work_products[0].readiness, s.work_products[0].latest_edition],
                   [{ met: true }, "distributed", 1]);
  /* another project's case, and an unsigned document naming another project, are not this project's */
  const other = w.project("Roads", "olive");
  aCase(w, other, "CASE-2026-0002", { finding: Q1 });
  assert.deepEqual(stage().work_products.map((x) => x.case), ["CASE-2026-0001"]);
  /* no answer composes a strength (R26) */
  assert.equal(JSON.stringify(stage()).includes("strength"), false);
});

test("R46 a signed edition not yet ratified meets no rung; the project's readiness is its highest work product's", () => {
  const { w, proj, stage } = setup();
  w.inquiry(Q2);
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: Q2, version_sha: w.head(Q2) }] });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: Q2, version_sha: w.head(Q2), role: "load_bearing" }] });
  let s = stage();
  assert.deepEqual([s.work_products[0].readiness, s.readiness, s.published_editions], ["none", "none", 0]);
  aCase(w, proj, "CASE-2026-0002", { finding: Q1 });
  s = stage();
  assert.deepEqual([s.work_products.map((x) => x.readiness), s.readiness], [["none", "draft"], "draft"]);
});

test("R46 at most 200 work products, in case id order, with truncated; published_editions counts every ratified edition", () => {
  const { w, proj, stage } = setup();
  assert.equal(WORK_PRODUCTS_MAX, 200);
  for (let i = 1; i <= WORK_PRODUCTS_MAX + 1; i++) {
    const c = `CASE-${String(i).padStart(4, "0")}`;
    w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES (?, ?, ?)`, c, proj, NOW);
    w.st.sql.exec(`INSERT INTO published_cases (case_id, edition, opened, ratified_at) VALUES (?, 1, ?, ?)`, c, NOW, NOW);
  }
  const s = stage();
  assert.equal(s.work_products.length, 200);
  assert.deepEqual([s.work_products[0].case, s.work_products[199].case], ["CASE-0001", "CASE-0200"]);
  assert.deepEqual([s.work_products_truncated, s.work_products_limit, s.published_editions], [true, 200, 201]);
  /* at the bound exactly: not truncated */
  w.st.sql.exec(`DELETE FROM cases WHERE case_id='CASE-0201'`);
  assert.equal(stage().work_products_truncated, false);
});

test("R44 R29 NO_ID; absent, not a project, hidden and an unrecognised viewer are one answer; existence answers the id and name only; only FULL sight is answered", () => {
  const { w, proj, stage } = setup();
  w.doc(DOC);
  assert.equal(w.p.projectStage({ project: "", viewer: V("olive") }).reason, "NO_ID");
  assert.equal(w.p.projectStage({}).reason, "NO_ID");
  const as = (r, id) => JSON.stringify({ ...r, project: r.project === id ? "<id>" : r.project });
  const absent = w.p.projectStage({ project: "PROJ-NOPE", viewer: V("olive") });
  assert.equal(absent.reason, "NO_SUCH_PROJECT");
  const notProject = w.p.projectStage({ project: DOC, viewer: V("olive") });
  const hidden = stage(V("bob"));
  const unknown = stage("garbage");
  const none = stage(null);
  assert.equal(as(notProject, DOC), as(absent, "PROJ-NOPE"));
  for (const r of [hidden, unknown, none]) assert.equal(as(r, proj), as(absent, "PROJ-NOPE"));
  /* discoverable: bob sees its existence, and only its id and name */
  assert.equal(w.membership.projectVisibilitySet({ projectId: proj, setting: "discoverable", by: "olive", viewer: V("olive") }).ok, true);
  const seen = stage(V("bob"));
  assert.deepEqual([seen.ok, seen.reason, seen.project, seen.name], [false, "PROJECT_SEEN_NOT_A_PARTICIPANT", proj, "Parks"]);
  assert.equal("stage" in seen || "work_products" in seen || "questions" in seen, false);
  /* the participant and the machine credential see it whole; so does the op, stamping the viewer */
  assert.equal(stage().ok, true);
  assert.equal(stage("class:daemon").ok, true);
  assert.equal(w.op("projectstage", { project: proj, viewer: V("olive") }).stage, "forming");
  assert.equal(w.op("projectstage", { project: proj, viewer: V("bob") }).reason, "PROJECT_SEEN_NOT_A_PARTICIPANT");
});

/* The held-question cap: `n` inquiries written as the record holds them (bundle rows; a leg for those `legged`), all
   cited by the project. */
function crowded(n, { legged = [], concludedAt = null } = {}) {
  const { w, proj, write, stage } = setup();
  const ids = Array.from({ length: n }, (_, i) => `INQ-2026-${String(i + 1).padStart(5, "0")}`);
  for (const id of ids)
    w.st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                   VALUES (?, 'inquiry', 'test-group', ?, 'open', ?, ?, ?)`, id, id, NOW, NOW, `sha-${id}`);
  for (const i of legged)
    w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id, target_type, role) VALUES (?, 0, ?, 'information', 'supports')`,
                  ids[i], DOC);
  write({ cites: ids, conclusions: concludedAt != null ? [{ inquiry: ids[concludedAt] }] : [] });
  return { w, proj, ids, stage };
}

test("R45 at the held-question cap (pages of 500, at most 2,000): past it with rules 1–2 unmet, undetermined with what was established; at it, decided", () => {
  assert.equal(STAGE_QUESTIONS_MAX, 2000);
  const over = crowded(STAGE_QUESTIONS_MAX + 1, { legged: [5] });
  let s = over.stage();
  assert.deepEqual([s.stage, s.at_least, s.questions], ["undetermined", "investigating",
    { read: 2000, with_legs: 1, concluded: 0, truncated: true }]);
  assert.equal(s.basis, null, "nothing is filled in");
  /* nothing legged among those read: at least forming */
  over.w.st.sql.exec(`DELETE FROM inquiry_basis`);
  s = over.stage();
  assert.deepEqual([s.stage, s.at_least], ["undetermined", "forming"]);
  /* rule 2 met by a ratified case edition decides it even past the cap */
  aCase(over.w, over.proj, "CASE-2026-0001", { sign: true, finding: "INQ-2026-9999" });
  s = over.stage();
  assert.deepEqual([s.stage, s.basis.case, s.questions.truncated], ["matured", "CASE-2026-0001", false]);
  /* exactly at the cap: every held question read, decided */
  const at = crowded(STAGE_QUESTIONS_MAX, { legged: [1999] });
  s = at.stage();
  assert.deepEqual([s.stage, s.basis.question, s.questions], ["investigating", at.ids[1999],
    { read: 2000, with_legs: 1, concluded: 0, truncated: false }]);
});

test("R45 reading stops once rule 2 is met: a concluded question read in the second page ends the read there", () => {
  const { stage, ids } = crowded(1200, { concludedAt: 700 });
  const s = stage();
  assert.deepEqual([s.stage, s.basis.question, s.questions.concluded, s.questions.truncated], ["matured", ids[700], 1, false]);
  assert.equal(s.questions.read, 1000, "two pages of 500 read, the third never asked");
});
