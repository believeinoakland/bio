/* project-stage — a project's stage and its work products' readiness (R1–R9; N300, N346, K356, K362, K364, K379),
   driven at the module's interface over the real modules it reads (basis-versions R41 `projectQuestions`, membership
   R44's sight). The project's inputs are written as the record holds them: its document (references, conclusions, a
   close) through promotion, its legs through inquiry's projection, its cases through publication's R21 and R22.
   Copied from publication's `stage.test` with the split (K651), its ids renamed to this module's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, NOW, SIG } from "./fixture.mjs";
import { STAGE_QUESTIONS_MAX, WORK_PRODUCTS_MAX, READINESS_RUNGS, PROJECT_STAGES, STAGE_NEEDS, STAGE_SENTENCES,
         CLOSED_REASONS, CLOSED_RECORDED_MAX } from "../../../src/project-stage/index.mjs";

const Q1 = "INQ-2026-0001", Q2 = "INQ-2026-0002", DOC = "INFO-2026-0001-minutes";

/* A project's document: its own title and state, the questions it cites (`severed` marks a severed citation) and its
   conclusion record (`conclusions` rows as basis-versions reads them). */
function projDoc(title, { state = "forming", closedReason = null, cites = [], severed = [], conclusions = [], history = [] } = {}) {
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
    ...(history.length ? ["state_history:", ...history.flatMap((h) => [`  - timestamp: "${h.at}"`, `    from_state: ${h.from}`,
      `    to_state: ${h.to}`, `    blurb: "The owner's act."`, "    author: olive"])] : ["state_history: []"]),
    "---", "", "## Objective", "", "Find out.", ""].join("\n");
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
  const stage = (viewer = V("olive")) => w.s.projectStage({ project: proj, viewer });
  return { w, proj, write, stage };
}

/* A case of the project, prepared (publication R21) and optionally signed and ratified (publication R22) over one finding. */
function aCase(w, proj, caseId, { sign = false, finding = Q2 } = {}) {
  if (!w.head(finding)) w.inquiry(finding);
  const roles = [{ target: finding, version_sha: w.head(finding) }];
  w.prepare(caseId, 1, { project: proj, roles });
  if (!sign) return;
  assert.equal(w.signCase(caseId, 1, { project: proj,
    roster: roles.map((r) => ({ bundle_id: r.target, version_sha: r.version_sha, role: "load_bearing" })) }).ok, true);
  assert.equal(w.signFinding(finding, { sig: SIG(caseId.length) }).ok, true);
}

test("R1 R2 one project through the four stages by its inputs alone: cite, add a leg, conclude, withdraw, ratify, close and reopen", () => {
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
  /* its withdrawal: investigating again, never a stored stage left behind (R5) */
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

test("R2 R5 negative control: a document's own `matured` (or `investigating`) holding no question still reads forming; the stage is never stored", () => {
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

test("R2 a question is held in any shared state, and a severed citation holds nothing; a no-project conclusion is not the project's", () => {
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

test("R3 R6 each case the project owns is a work product; each rung by its own condition; a published case reads distributed, never draft", () => {
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
  /* no answer composes a strength (R6) */
  assert.equal(JSON.stringify(stage()).includes("strength"), false);
});

test("R3 a signed edition not yet ratified meets no rung; the project's readiness is its highest work product's", () => {
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

test("R3 at most 200 work products, in case id order, with truncated; published_editions counts every ratified edition", () => {
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

test("R1 R8 NO_ID; absent, not a project, hidden and an unrecognised viewer are one answer; existence answers the id and name only; only FULL sight is answered", () => {
  const { w, proj, stage } = setup();
  w.doc(DOC);
  assert.equal(w.s.projectStage({ project: "", viewer: V("olive") }).reason, "NO_ID");
  assert.equal(w.s.projectStage({}).reason, "NO_ID");
  const as = (r, id) => JSON.stringify({ ...r, project: r.project === id ? "<id>" : r.project });
  const absent = w.s.projectStage({ project: "PROJ-NOPE", viewer: V("olive") });
  assert.equal(absent.reason, "NO_SUCH_PROJECT");
  const notProject = w.s.projectStage({ project: DOC, viewer: V("olive") });
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

test("R2 R7 at the held-question cap (pages of 500, at most 2,000): past it with rules 1–2 unmet, undetermined with what was established; at it, decided", () => {
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

test("R2 reading stops once rule 2 is met: a concluded question read in the second page ends the read there", () => {
  const { stage, ids } = crowded(1200, { concludedAt: 700 });
  const s = stage();
  assert.deepEqual([s.stage, s.basis.question, s.questions.concluded, s.questions.truncated], ["matured", ids[700], 1, false]);
  assert.equal(s.questions.read, 1000, "two pages of 500 read, the third never asked");
});

/* ---------------------------------------------------------------- R4: `stages` (N346; DEC-79; K448, K452) */

const COMPUTED = ["forming", "investigating", "matured"];
/* R4's one-rule invariant over an answer: the four in order, each with the six fields; the reached computed stages an
   unbroken prefix whose last is the stage (or, closed, what the read computed); `needs` only on a computed stage not
   reached, listing R2's inputs only; `since` only where something earned the stage. */
function oneRule(s) {
  assert.deepEqual(s.stages.map((x) => x.stage), PROJECT_STAGES);
  for (const x of s.stages)
    for (const k of ["stage", "reached", "earned", "since", "needs", "why"]) assert.ok(k in x, `${x.stage} carries ${k}`);
  const reached = s.stages.slice(0, 3).map((x) => x.reached);
  const firstNot = reached.findIndex((r) => r !== true);
  if (firstNot >= 0) assert.ok(reached.slice(firstNot).every((r) => r !== true), `an unbroken prefix: ${reached}`);
  const last = COMPUTED[(firstNot < 0 ? 3 : firstNot) - 1];
  if (s.stage === "closed") assert.equal(s.stages[3].reached, true);
  else if (s.stage === "undetermined") assert.equal(last, s.at_least ?? undefined);
  else { assert.equal(last, s.stage); assert.equal(s.stages[3].reached, false); }
  for (const x of s.stages) {
    if (x.reached !== true) assert.equal(x.since, null, `${x.stage}: no since unless reached`);
    if (x.earned === null) assert.equal(x.since, null, `${x.stage}: no since without earning evidence`);
    if (x.stage === "closed" || x.reached !== false || s.stage === "closed") assert.equal(x.needs, null, `${x.stage}: no needs`);
    else assert.deepEqual(x.needs.any_of.map((c) => c.condition), STAGE_NEEDS[x.stage]);
  }
  return s;
}
const at = (s, name) => s.stages.find((x) => x.stage === name);
const fill = (key, n) => STAGE_SENTENCES[key].replace(/\{(\w+)\}/g, (_, k) => String(n[k]));

test("R4 one rule: on every step of the four-stage walk `stages` is produced with `stage`, the reached stages an unbroken prefix, each `since` the instant of the evidence that earns it", () => {
  const { w, proj, write, stage } = setup();
  let s = oneRule(stage());
  assert.deepEqual(s.stages.map((x) => [x.stage, x.reached, x.earned, x.since]),
    [["forming", true, null, null], ["investigating", false, null, null], ["matured", false, null, null], ["closed", false, null, null]]);
  w.doc(DOC);
  w.inquiry(Q1);
  write({ cites: [Q1] });
  oneRule(stage());
  w.inquiry(Q1, { legs: [{ target: DOC, date: "2026-09-20T00:00:00Z" }, { target: DOC, date: "2026-09-18T00:00:00Z" }] });
  s = oneRule(stage());
  assert.deepEqual(at(s, "investigating"), { stage: "investigating", reached: true, earned: { question: Q1 },
    since: "2026-09-18T00:00:00Z", needs: null, why: fill("investigating_reached", { read: 1, with_legs: 1 }) });
  write({ cites: [Q1], conclusions: [{ inquiry: Q1, at: "2026-09-25T00:00:00Z" }] });
  s = oneRule(stage());
  assert.deepEqual([s.stage, at(s, "matured").reached, at(s, "matured").earned, at(s, "matured").since],
                   ["matured", true, { question: Q1 }, "2026-09-25T00:00:00Z"]);
  write({ cites: [Q1], conclusions: [{ inquiry: Q1, at: "2026-09-25T00:00:00Z" }, { inquiry: Q1, act: "withdrawn", at: "2026-09-26T00:00:00Z" }] });
  s = oneRule(stage());
  assert.deepEqual([s.stage, at(s, "matured").reached, at(s, "matured").since], ["investigating", false, null]);
  aCase(w, proj, "CASE-2026-0001", { sign: true });
  s = oneRule(stage());
  assert.deepEqual([at(s, "matured").earned, at(s, "matured").since], [{ case: "CASE-2026-0001", edition: 1 }, NOW]);
  write({ state: "closed", closedReason: "resolved", cites: [Q1], history: [{ at: "2026-09-26T12:00:00Z", from: "investigating", to: "closed" }] });
  s = oneRule(stage());
  assert.deepEqual(at(s, "closed"), { stage: "closed", reached: true, earned: { closed_reason: "resolved" },
    since: "2026-09-26T12:00:00Z", needs: null, why: STAGE_SENTENCES.closed_reached });
  write({ state: "investigating", cites: [Q1] });
  oneRule(stage());
});

test("R4 K448 K469: `since` is the instant of the evidence `earned` names; withdrawing the earning conclusion moves both to the evidence that earns it then, or unreaches it", () => {
  const { w, proj, write, stage } = setup();
  w.doc(DOC);
  w.inquiry(Q1, { legs: [{ target: DOC }] });
  w.inquiry(Q2);
  const c1 = { inquiry: Q1, at: "2026-09-20T00:00:00Z" }, c2 = { inquiry: Q2, at: "2026-09-24T00:00:00Z" };
  write({ cites: [Q1, Q2], conclusions: [c1, c2] });
  assert.equal(at(oneRule(stage()), "matured").since, "2026-09-20T00:00:00Z");
  /* `since` never comes from other evidence than `earned` names: Q2's earlier conclusion does not lend its instant */
  write({ cites: [Q1, Q2], conclusions: [{ inquiry: Q1, at: "2026-09-27T00:00:00Z" }, c2] });
  assert.deepEqual([at(oneRule(stage()), "matured").earned, at(stage(), "matured").since], [{ question: Q1 }, "2026-09-27T00:00:00Z"]);
  /* the earning conclusion withdrawn: the one that earns it then, with its own instant */
  write({ cites: [Q1, Q2], conclusions: [c1, c2, { inquiry: Q1, act: "withdrawn", at: "2026-09-25T00:00:00Z" }] });
  let s = oneRule(stage());
  assert.deepEqual([s.stage, at(s, "matured").earned, at(s, "matured").since], ["matured", { question: Q2 }, "2026-09-24T00:00:00Z"]);
  /* both withdrawn: matured unreached, the leg still earns investigating (its leg carries no instant: stated null) */
  write({ cites: [Q1, Q2], conclusions: [c1, c2, { inquiry: Q1, act: "withdrawn", at: "2026-09-25T00:00:00Z" },
                                          { inquiry: Q2, act: "withdrawn", at: "2026-09-26T00:00:00Z" }] });
  s = oneRule(stage());
  assert.deepEqual([s.stage, at(s, "matured").reached, at(s, "matured").since, at(s, "investigating").since],
                   ["investigating", false, null, null]);
  /* a ratified case edition (at NOW) beside a concluded question: the conclusion earns it (R2's basis), with its
     instant; the conclusion withdrawn, the case edition earns it, with its ratification's instant */
  aCase(w, proj, "CASE-2026-0001", { sign: true, finding: "INQ-2026-0003" });
  write({ cites: [Q1, Q2], conclusions: [c2] });
  s = oneRule(stage());
  assert.deepEqual([at(s, "matured").earned, at(s, "matured").since], [{ question: Q2 }, "2026-09-24T00:00:00Z"]);
  write({ cites: [Q1, Q2], conclusions: [c2, { inquiry: Q2, act: "withdrawn", at: "2026-09-26T00:00:00Z" }] });
  s = oneRule(stage());
  assert.deepEqual([at(s, "matured").earned, at(s, "matured").since], [{ case: "CASE-2026-0001", edition: 1 }, NOW]);
});

test("R4 no promise: each listed condition, met alone with nothing else changed, makes R2 decide that stage or a later one", () => {
  const rank = (st) => PROJECT_STAGES.indexOf(st);
  /* forming, holding one question without a leg: each input that `investigating` and `matured` list, alone */
  const base = () => { const t = setup(); t.w.doc(DOC); t.w.inquiry(Q1); t.write({ cites: [Q1] }); return t; };
  let t = base();
  let s = oneRule(t.stage());
  assert.deepEqual([s.stage, at(s, "investigating").needs, at(s, "matured").needs],
    ["forming", { any_of: [{ condition: "held_question_with_leg", have: 0 }] },
     { any_of: [{ condition: "concluded_held_question", have: 0 }, { condition: "ratified_case_edition", have: 0 }] }]);
  t.w.inquiry(Q1, { legs: [{ target: DOC }] });
  assert.ok(rank(t.stage().stage) >= rank("investigating"), "held_question_with_leg");
  t = base();
  t.write({ cites: [Q1], conclusions: [{ inquiry: Q1 }] });
  assert.ok(rank(t.stage().stage) >= rank("matured"), "concluded_held_question");
  t = base();
  aCase(t.w, t.proj, "CASE-2026-0001", { sign: true });
  assert.ok(rank(t.stage().stage) >= rank("matured"), "ratified_case_edition");
  /* investigating: each of matured's two, alone */
  const legged = () => { const u = base(); u.w.inquiry(Q1, { legs: [{ target: DOC }] }); return u; };
  t = legged();
  s = oneRule(t.stage());
  assert.deepEqual([s.stage, at(s, "matured").needs.any_of.map((c) => c.have)], ["investigating", [0, 0]]);
  t.write({ cites: [Q1], conclusions: [{ inquiry: Q1 }] });
  assert.equal(t.stage().stage, "matured");
  t = legged();
  aCase(t.w, t.proj, "CASE-2026-0001", { sign: true });
  assert.equal(t.stage().stage, "matured");
});

test("R4 uncounted inputs move nothing: a no-project conclusion, a signed edition not ratified, the document's own `matured`, a severed citation", () => {
  const { w, proj, write, stage } = setup();
  w.doc(DOC);
  w.inquiry(Q1);
  write({ cites: [Q1] });
  const was = JSON.stringify(stage());
  const same = (why) => assert.equal(JSON.stringify(stage()), was, why);
  /* the question's own (no-project) conclusion */
  w.inquiry(Q1, { state: "concluded" });
  same("a conclusion made without the project");
  /* a case edition signed and never ratified */
  w.inquiry(Q2, { legs: [{ target: DOC }] });
  w.prepare("CASE-2026-0001", 1, { project: proj, roles: [{ target: Q2, version_sha: w.head(Q2) }] });
  w.signCase("CASE-2026-0001", 1, { project: proj, roster: [{ bundle_id: Q2, version_sha: w.head(Q2), role: "load_bearing" }] });
  const signed = JSON.parse(JSON.stringify(stage()));
  const strip = (x) => JSON.stringify({ ...x, work_products: null, readiness: null });
  assert.equal(strip(signed), strip(JSON.parse(was)), "a signed edition not ratified");
  /* the document's own current_state, and a severed citation of a legged, concluded question */
  write({ state: "investigating", cites: [Q1] });   /* the declared moves, forming → investigating → matured */
  write({ state: "matured", cites: [Q1], severed: [Q2], conclusions: [{ inquiry: Q2 }] });
  const after = stage();
  assert.equal(strip(after), strip(JSON.parse(was)), "the document's state word and a severed citation");
});

test("R4 the investigating need: no question held says so; one held without a leg has 0 of 1", () => {
  const { w, write, stage } = setup();
  let s = oneRule(stage());
  assert.deepEqual([at(s, "investigating").why, at(s, "investigating").needs.any_of[0].have],
                   [STAGE_SENTENCES.investigating_none_held, 0]);
  w.inquiry(Q1);
  write({ cites: [Q1] });
  s = oneRule(stage());
  assert.deepEqual([s.questions.read, at(s, "investigating").needs, at(s, "investigating").why],
    [1, { any_of: [{ condition: "held_question_with_leg", have: 0 }] }, fill("investigating_no_leg", { read: 1 })]);
});

test("R4 a skipped stage: a ratified case edition and no held question with a leg reads matured, investigating reached with `earned: null`", () => {
  const { w, proj, write, stage } = setup();
  w.inquiry(Q1);
  write({ cites: [Q1] });
  aCase(w, proj, "CASE-2026-0001", { sign: true });
  const s = oneRule(stage());
  assert.equal(s.stage, "matured");
  assert.deepEqual(at(s, "investigating"), { stage: "investigating", reached: true, earned: null, since: null, needs: null,
                                             why: fill("investigating_skipped", { read: 1 }) });
  assert.deepEqual(at(s, "matured").why, fill("matured_reached", { concluded: 0, read: 1, editions: 1 }));
});

test("R4 R7 the cap: past 2,000 held questions with rules 1–2 unmet, the stages up to `at_least` are reached and those above are undetermined with the answer's detail", () => {
  const { stage } = crowded(STAGE_QUESTIONS_MAX + 1, { legged: [5] });
  const s = oneRule(stage());
  assert.deepEqual([s.stage, s.at_least], ["undetermined", "investigating"]);
  assert.deepEqual(s.stages.map((x) => x.reached), [true, true, null, null]);
  for (const x of s.stages.slice(2)) assert.deepEqual([x.needs, x.earned, x.since, x.why], [null, null, null, s.detail]);
});

test("R4 R2 R7 a failed question read still asks rule 2's ratified half: a ratified case edition is matured with it as basis; with none, undetermined with at_least", () => {
  const { w, proj, write, stage } = setup();
  w.doc(DOC);
  w.inquiry(Q1, { legs: [{ target: DOC }] });
  write({ cites: [Q1] });
  const real = w.basisVersions.projectQuestions.bind(w.basisVersions);
  let calls = 0;
  /* the first page reads, the second throws */
  w.basisVersions.projectQuestions = (a) => {
    if (calls++ % 2) throw new Error("the read failed");
    return { ...real(a), cursor: Q1 };
  };
  let s = oneRule(stage());
  assert.deepEqual([s.stage, s.at_least, s.questions.truncated, s.basis], ["undetermined", "investigating", true, null]);
  assert.equal(s.detail, "the questions this project holds could not all be read, so its stage is undetermined");
  assert.deepEqual(s.stages.map((x) => x.reached), [true, true, null, null]);
  w.basisVersions.projectQuestions = () => { throw new Error("the read failed"); };
  assert.deepEqual([stage().stage, stage().at_least], ["undetermined", "forming"]);
  aCase(w, proj, "CASE-2026-0001", { sign: true });
  s = oneRule(stage());
  assert.deepEqual([s.stage, s.basis, "at_least" in s],
                   ["matured", { rule: "matured", question: null, case: "CASE-2026-0001", edition: 1 }, false]);
  delete w.basisVersions.projectQuestions;
});

test("R4 closed: each reason in `closed_reason` and `closed.earned`; the computed stages stated with every `needs` null; reopened, derived again", () => {
  const { w, write, stage } = setup();
  w.doc(DOC);
  w.inquiry(Q1, { legs: [{ target: DOC, date: "2026-09-19T00:00:00Z" }] });
  for (const reason of CLOSED_REASONS) {
    write({ state: "closed", closedReason: reason, cites: [Q1],
            history: [{ at: "2026-09-26T08:00:00Z", from: "investigating", to: "closed" }] });
    const s = oneRule(stage());
    assert.deepEqual([s.stage, s.closed_reason, at(s, "closed").earned, at(s, "closed").since],
                     ["closed", reason, { closed_reason: reason }, "2026-09-26T08:00:00Z"]);
    /* how far it had come: investigating, from its leg; matured not reached, needing nothing while closed */
    assert.deepEqual(s.stages.slice(0, 3).map((x) => [x.reached, x.needs]), [[true, null], [true, null], [false, null]]);
    assert.deepEqual([at(s, "investigating").since, at(s, "matured").why], ["2026-09-19T00:00:00Z", STAGE_SENTENCES.closed_project]);
    assert.deepEqual(s.questions, { read: 1, with_legs: 1, concluded: 0, truncated: false });
  }
  /* a close recorded with no history entry: the instant is not held, so it is null */
  write({ state: "closed", closedReason: "abandoned", cites: [Q1] });
  assert.equal(at(stage(), "closed").since, null);
  write({ state: "investigating", cites: [Q1] });
  const s = oneRule(stage());
  assert.deepEqual([s.stage, at(s, "closed").reached, at(s, "closed").why, "recorded" in at(s, "closed")],
                   ["investigating", false, STAGE_SENTENCES.closed_not_recorded, false]);
});

test("R4 a close without a recognised reason is not closed: `closed.recorded` holds the reason as written (null if absent, cut to 40), the stage computed", () => {
  const { w, write, stage } = setup();
  w.inquiry(Q1);
  for (const [reason, recorded] of [[null, null], ["finished", "finished"], ["x".repeat(60), "x".repeat(CLOSED_RECORDED_MAX)]]) {
    write({ state: "closed", closedReason: reason, cites: [Q1] });
    const s = oneRule(stage());
    assert.deepEqual([s.stage, s.closed_reason, at(s, "closed")], ["forming", null,
      { stage: "closed", reached: false, earned: null, since: null, needs: null, why: STAGE_SENTENCES.closed_unrecognised, recorded }]);
  }
  assert.equal(CLOSED_RECORDED_MAX, 40);
});

test("R4 an unread document: all four stages undetermined with the answer's detail", () => {
  const { w, proj, stage } = setup();
  w.st.sql.exec(`DELETE FROM files WHERE bundle_id=? AND path='bundle.md'`, proj);
  const s = stage();
  assert.equal(s.stage, "undetermined");
  assert.deepEqual(s.stages, PROJECT_STAGES.map((st) => ({ stage: st, reached: null, earned: null, since: null, needs: null, why: s.detail })));
});

test("R4 R9 fixed text: every `why` is one of the module's fixed sentences with counts filled in, naming no member, question or place", () => {
  const { w, proj, write, stage } = setup();
  const templates = Object.values(STAGE_SENTENCES).map((t) =>
    new RegExp(`^${t.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\\?\{(read|with_legs|concluded|editions)\\?\}/g, "\\d+")}$`));
  const whys = [];
  const take = () => { const s = stage(); for (const x of s.stages) whys.push([x.why, s.detail]); };
  take();
  w.doc(DOC);
  w.inquiry(Q1, { question: "Did the Oakland council vote?" });
  write({ cites: [Q1] });
  take();
  w.inquiry(Q1, { question: "Did the Oakland council vote?", legs: [{ target: DOC }] });
  take();
  write({ cites: [Q1], conclusions: [{ inquiry: Q1 }] });
  take();
  aCase(w, proj, "CASE-2026-0001", { sign: true });
  take();
  write({ state: "closed", closedReason: "superseded", cites: [Q1] });
  take();
  write({ state: "closed", closedReason: "done", cites: [Q1] });
  take();
  for (const [why, detail] of whys) {
    assert.ok(templates.some((re) => re.test(why)) || why === detail, `a fixed sentence: ${why}`);
    assert.doesNotMatch(why, /olive|h_olive|Oakland|council|Parks|INQ-|CASE-|PROJ-/, why);
  }
});

test("R4 R5 nothing written: every table's rows are the same before and after each read, closed and undetermined included", () => {
  const { w, proj, write, stage } = setup();
  w.doc(DOC);
  w.inquiry(Q1, { legs: [{ target: DOC }] });
  for (const opts of [{ cites: [Q1] }, { cites: [Q1], conclusions: [{ inquiry: Q1 }] },
                      { state: "closed", closedReason: "resolved", cites: [Q1] }, { state: "closed", closedReason: "later", cites: [Q1] }]) {
    write(opts);
    const snap = w.snapshot();
    stage();
    w.op("projectstage", { project: proj, viewer: V("olive") });
    assert.deepEqual(w.snapshot(), snap);
  }
  w.basisVersions.projectQuestions = () => { throw new Error("the read failed"); };
  const snap = w.snapshot();
  assert.equal(stage().stage, "undetermined");
  assert.deepEqual(w.snapshot(), snap);
  delete w.basisVersions.projectQuestions;
});

test("R1 R7 R3 never thrown: the cases the project owns unreadable, the answer is undetermined whole, stated and not filled", () => {
  const { w, proj, stage } = setup();
  w.st.sql.exec(`ALTER TABLE cases RENAME TO cases_away`);
  try {
    const s = stage();
    assert.deepEqual([s.ok, s.stage, s.readiness, s.published_editions, s.work_products, s.basis],
                     [true, "undetermined", "undetermined", null, [], null]);
    assert.equal(s.detail, "the cases this project owns could not be read, so its stage and its readiness are undetermined");
    assert.deepEqual(s.stages, PROJECT_STAGES.map((st) => ({ stage: st, reached: null, earned: null, since: null, needs: null, why: s.detail })));
    assert.deepEqual(w.op("projectstage", { project: proj, viewer: V("olive") }), s);
  } finally { w.st.sql.exec(`ALTER TABLE cases_away RENAME TO cases`); }
  assert.equal(stage().stage, "forming");
});
