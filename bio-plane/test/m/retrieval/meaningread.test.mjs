/* retrieval: op=meaningrows as retrieval answers it (R10, R11, R13, R14, R28, R29), at the module's interface.
 *
 * Converted from the old battery's `test/meaningread.test.mjs` (PL-9, D-222 option C). Its retrieval share: the envelope
 * (its exact keys, the bound published as applied, `total` against paging, the query's warnings and arms, `cached` on
 * the filter route only), the gate (every statement the compiler's and carrying the mark, `applied` counting them, a
 * hidden project moving no row, total, scope or tally), and the refusals through the route. What `meaning.test.mjs`
 * already proves (C-23.1/C-23.2 and their rows, the four-level statement's branches, R12, R14's tally) is not repeated.
 * The compiler's own behaviour (the statement shapes, the grain against the schema, a basis returned whole, the row
 * withheld rather than redacted, `<col>_present`, the order) is query-language's; the source-text pins and the control
 * plane's ops table and viewer stamp are dropped. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, T0 } from "./fixture.mjs";
import { Retrieval, PROJECTION_RELATION, MEANING_READ_CHECKS, retrievalRoutes } from "../../../src/retrieval/index.mjs";
import { compile, cachedNotes, GATE_MARK, MEANING, MEANING_LIMIT_DEFAULT, MEANING_LIMIT_MAX } from "../../../src/query.mjs";

const ARMS = Object.keys(MEANING);
const ENVELOPE = ["arm", "cached", "count", "gate", "grain", "identity", "level", "levels", "limit", "offset", "ok", "query",
                  "rows", "says", "scope", "table", "total"];

function leg(w, inq, ord, target, type, { role = "supports", grade = null, axis = "capture", source = "capture", ground = null } = {}) {
  w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, target_id, target_type, role, grade, grade_axis, grade_source, ground, at)
                 VALUES (?,?,?,?,?,?,?,?,?,?)`, inq, ord, target, type, role, grade, axis, source, ground, T0);
}
function resolution(w, capSha, bundleId, ref, entity) {
  w.st.sql.exec(`INSERT INTO resolutions (capture_sha, bundle_id, ref, entity_id, grade, method, at) VALUES (?,?,?,?, 'A', 'exact', ?)`,
    capSha, bundleId, ref, entity, T0);
}
function content(w, capSha, bundleId, n) {
  w.st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at)
                 VALUES (?,?,?, 'pdf-page', ?, ?, 'plane', ?)`, `C-${bundleId}-${n}`, capSha, bundleId, JSON.stringify({ page: n }), `page ${n}`, T0);
}

/* Three inquiries resting on seven legs, two documents, one capture read at passage grain with a resolution and a
   cited extent: a row of every arm. */
function corpus() {
  const w = world();
  const c = w.cap("memo", "memo bytes");
  w.doc("INFO-1", {}, { captures: [c] });
  w.doc("INFO-2");
  for (const id of ["INQ-1", "INQ-2", "INQ-3"]) w.doc(id, { object_type: "inquiry", title: `Question ${id}` });
  leg(w, "INQ-1", 0, "INFO-1", "information", { grade: "B", axis: "connection", source: "hunch" });
  leg(w, "INQ-1", 1, "INFO-2", "information");
  leg(w, "INQ-1", 2, "INQ-2", "inquiry", { role: "cuts_against" });
  leg(w, "INQ-2", 0, "INFO-1", "information", { role: "cuts_against", grade: "C", axis: "connection", source: "hunch" });
  leg(w, "INQ-3", 0, "INFO-1", "information", { ground: "charter" });
  leg(w, "INQ-3", 1, "INFO-2", "information", { ground: "code" });
  leg(w, "INQ-3", 2, "INFO-2", "information", { ground: "code" });
  w.unit(c.sha, "INFO-1", 0, "the budget passed");
  w.unit(c.sha, "INFO-1", 1, "the budget line for parks");
  resolution(w, c.sha, "INFO-1", "vendor:77", "ENT-1");
  content(w, c.sha, "INFO-1", 1);
  w.observe({ level: "content", subject_kind: "capture", subject: c.sha, authority_kind: "extract", state: "PRESENT", authority: "INFO-1",
              at: "2026-09-26T00:00:00Z" });
  w.observe({ level: "content", subject_kind: "capture", subject: c.sha, authority_kind: "derive", state: "PRESENT", authority: "INFO-1",
              at: "2026-09-26T00:00:00Z" });
  return { w, c };
}
const LEGS = 7;

test("R11, R14: the envelope is an object carrying exactly its keys and no others — a passage answer adds only the content-axis vocabulary — and each arm names the arm asked, its table, grain and identity", () => {
  const { w } = corpus();
  for (const arm of ARMS) {
    const r = w.retrieval.meaningRows({ q: "", rows: arm, viewer: V("vera") });
    assert.equal(Array.isArray(r), false, arm);
    assert.deepEqual(Object.keys(r).sort(), (arm === "passage" ? [...ENVELOPE, "content_axis"] : ENVELOPE).sort(), arm);
    assert.ok(Array.isArray(r.rows) && r.rows.length > 0, `${arm}: the corpus holds rows of this arm`);
    assert.deepEqual([r.arm, r.table, r.grain, r.identity], [arm, MEANING[arm].table, MEANING[arm].rowGrain, MEANING[arm].identity], arm);
    assert.deepEqual(Object.keys(r.gate).sort(), ["applied", "scope"], arm);
    assert.deepEqual(Object.keys(r.levels), ["internet", "document", "content", "meaning"], arm);
    const scopeKeys = ["documents", "documents_with_rows", "documents_without_rows"];
    if (arm === "passage")
      scopeKeys.push("captures_counted", "captures_truncated", "captures_bound", ...Object.keys(r.content_axis.vocabulary),
                     r.content_axis.undetermined_value, "not_read");
    assert.deepEqual(Object.keys(r.scope).sort(), scopeKeys.sort(), arm);
  }
  /* Two names over one table: each answer says which was asked. */
  const [res, con] = ["resolves", "concerns"].map((rows) => w.retrieval.meaningRows({ q: "", rows, viewer: V("vera") }));
  assert.deepEqual([res.arm, con.arm, res.table, con.table], ["resolves", "concerns", "resolutions", "resolutions"]);
});

test("R11: limit is published as applied after clamping (200 by default, 1–1,000) and offset at least 0; total is the gated count of matching rows whatever the page, count the rows sent; a cut answer reads offset + count < total and a whole one does not; paging covers the set exactly once", () => {
  const { w } = corpus();
  const read = (limit, offset) => w.retrieval.meaningRows({ q: "", rows: "leg", viewer: V("vera"), limit, offset });
  assert.deepEqual([MEANING_LIMIT_DEFAULT, MEANING_LIMIT_MAX], [200, 1000]);
  for (const [ask, applied] of [[undefined, 200], [null, 200], ["x", 200], [0, 200], [99999, 1000], [1000, 1000], [-3, 1], [1, 1], ["7", 7]])
    assert.equal(read(ask).limit, applied, String(ask));
  for (const [ask, applied] of [[undefined, 0], [-5, 0], ["x", 0], ["3", 3]]) assert.equal(read(2, ask).offset, applied, String(ask));
  const whole = read(500);
  assert.deepEqual([whole.total, whole.count, whole.rows.length, whole.limit], [LEGS, LEGS, LEGS, 500]);
  const cut = read(2);
  assert.deepEqual([cut.total, cut.count, cut.rows.length], [LEGS, 2, 2], "total is not the page");
  const more = (a) => a.offset + a.count < a.total;
  assert.deepEqual([more(cut), more(whole)], [true, false]);
  const past = read(2, 50);
  assert.deepEqual([past.rows, past.count, past.total], [[], 0, LEGS], "past the end: an empty page, the same total");
  /* Page by two over the whole set: every row once, none twice, none missed, in the order of the whole answer. */
  const seen = [];
  for (let off = 0; off < whole.total; off += 2) {
    const p = read(2, off);
    assert.equal(p.total, whole.total);
    seen.push(...p.rows.map((r) => `${r.bundle_id}#${r.ord}`));
  }
  assert.deepEqual(seen, whole.rows.map((r) => `${r.bundle_id}#${r.ord}`));
  assert.equal(new Set(seen).size, LEGS);
  /* Every arm's total is what paging reaches. */
  for (const arm of ARMS) {
    const all = w.retrieval.meaningRows({ q: "", rows: arm, viewer: V("vera"), limit: 1000 });
    assert.equal(all.total, all.rows.length, arm);
  }
});

test("R11: query carries q verbatim, the shared parser's warnings and the meaning arms that compiled; cached publishes the filter route only, identical for every viewer", () => {
  const { w } = corpus();
  const via = { projection: PROJECTION_RELATION };
  for (const q of ["leg:sorce=hunch", "leg:hunch", "passage:budget leg:hunch", "", "resolves:>=B"]) {
    const r = w.retrieval.meaningRows({ q, rows: "leg", viewer: V("vera") });
    const plan = compile({ q, viewer: V("vera"), rows: "leg" }, via);
    assert.deepEqual(r.query, { q, warnings: plan.warnings, meaningArms: plan.meaningArms }, q);
  }
  const warned = w.retrieval.meaningRows({ q: "leg:sorce=hunch", rows: "leg", viewer: V("vera") });
  assert.ok(warned.query.warnings.some((x) => /sorce/.test(x)), "a mistyped sub-field is told here too");
  assert.deepEqual(w.retrieval.meaningRows({ q: "leg:hunch", rows: "leg", viewer: V("vera") }).query.meaningArms.map((a) => a.arm), ["leg"]);
  /* A cached field in the filter: the note is the filter route's alone (no facet, no sort at this grain). */
  w.st.sql.exec(`UPDATE bundles SET inquiry_capture_strength='B' WHERE bundle_id IN ('INQ-1','INQ-3')`);
  const q = "capture:B sort:capture";
  const plan = compile({ q, viewer: V("vera"), rows: "leg" }, via);
  const byVera = w.retrieval.meaningRows({ q, rows: "leg", viewer: V("vera") });
  const byAnn = w.retrieval.meaningRows({ q, rows: "leg", viewer: V("ann") });
  assert.ok(byVera.cached.length > 0, "armed: a cached column was read");
  assert.deepEqual(byVera.cached, cachedNotes(plan.cached, { facets: false, ordered: false }));
  assert.ok(byVera.cached.every((n) => JSON.stringify(n.via) === '["filter"]'));
  assert.deepEqual(byAnn.cached, byVera.cached, "the note does not vary with the reader");
  assert.deepEqual(new Set(byVera.rows.map((r) => r.bundle_id)), new Set(["INQ-1", "INQ-3"]));
});

test("R28, R11: every statement a meaning read runs is the compiler's own, carries the gate's mark and goes through the executor; gate.applied counts them — count, rows and levels, and the axis statement for passage; gate.scope names the gate compiled", () => {
  const { w } = corpus();
  const seen = [];
  const exec = Retrieval.prototype.runQuery;
  w.retrieval.runQuery = function (stmt, tally) { seen.push(stmt); return exec.call(this, stmt, tally); };
  const via = { projection: PROJECTION_RELATION };
  for (const arm of ARMS) {
    for (const [q, limit, offset] of [["", undefined, undefined], ["leg:hunch passage:budget", 3, 1]]) {
      seen.length = 0;
      const r = w.retrieval.meaningRows({ q, rows: arm, viewer: V("vera"), limit, offset });
      const plan = compile({ q, viewer: V("vera"), ids: null, rows: arm, rowLimit: limit, rowOffset: offset }, via);
      const want = [plan.statements.meaning({ mode: "count" }), plan.statements.meaning(), plan.statements.meaning({ mode: "levels" }),
                    ...(arm === "passage" ? [plan.statements.meaning({ mode: "axis" })] : [])];
      assert.deepEqual(seen, want, `${arm} ${q}`);
      assert.ok(seen.every((s) => s.sql.includes(GATE_MARK)), arm);
      assert.equal(r.gate.applied, want.length, arm);
      assert.equal(r.gate.scope, "participant", arm);
    }
  }
  /* A refusal runs nothing. */
  seen.length = 0;
  w.retrieval.meaningRows({ rows: "legs", viewer: V("vera") });
  w.retrieval.meaningRows({ viewer: V("vera") });
  assert.equal(seen.length, 0);
});

test("R29, R11, R13: an absent or unrecognised viewer is answered an honest empty — no row, a zero total and a zero document scope, the gate named DENY — never refused and never answered ungated", () => {
  const { w } = corpus();
  for (const viewer of [null, undefined, "", "nobody"]) {
    for (const arm of ARMS) {
      const r = w.retrieval.meaningRows({ q: "", rows: arm, viewer });
      assert.deepEqual([r.ok, r.rows, r.count, r.total, r.scope.documents, r.scope.documents_with_rows], [true, [], 0, 0, 0, 0],
        `${arm} ${viewer}`);
      assert.match(r.says, /no document was in scope/, `${arm} ${viewer}`);
      if (arm === "passage") assert.equal(r.scope.captures_counted, 0, String(viewer));
    }
  }
  assert.equal(w.retrieval.meaningRows({ q: "", rows: "leg", viewer: null }).gate.scope, "DENY");
  /* And the entitled viewer over the same corpus does see them. */
  assert.equal(w.retrieval.meaningRows({ q: "", rows: "leg", viewer: V("vera") }).total, LEGS);
});

test("R29, R13, R14: hidden answers as absent at meaning grain — a project the viewer cannot see, holding a passage, a resolution, a cited extent and a capture, with a visible inquiry's leg naming it, moves no byte of any arm's answer for her: no row, total, document scope, capture tally or sentence; its participant sees them", () => {
  const { w, c } = corpus();
  const asks = [];
  for (const arm of ARMS) for (const q of ["", "passage:budget", "passage:zzqx", "leg:hunch"]) asks.push({ q, rows: arm });
  asks.push({ q: "", rows: "leg", limit: 2, offset: 2 });
  const answers = (viewer) => JSON.stringify(asks.map((a) => w.retrieval.meaningRows({ ...a, viewer })));
  const before = answers(V("vera"));
  const annBefore = asks.map((a) => w.retrieval.meaningRows({ ...a, viewer: V("ann") }));
  /* The project, and the rows its owners write into it. */
  const hid = w.cap("secret", "secret bytes");
  const proj = w.project("Secret Budget Fund", "ann", { captures: [hid] });
  w.unit(hid.sha, proj, 0, "the budget was moved in secret");
  resolution(w, hid.sha, proj, "vendor:77", "ENT-1");
  content(w, hid.sha, proj, 1);
  w.observe({ level: "content", subject_kind: "capture", subject: hid.sha, authority_kind: "extract", state: "PRESENT", authority: proj,
              at: "2026-09-27T04:00:00Z" });
  w.observe({ level: "content", subject_kind: "capture", subject: hid.sha, authority_kind: "derive", state: "PRESENT", authority: proj,
              at: "2026-09-27T04:00:00Z" });
  leg(w, "INQ-1", 3, proj, "project", { role: "supports" });
  assert.equal(answers(V("vera")), before, "byte-identical for the viewer who cannot see the project");
  /* Armed: the owner's answers moved, arm by arm. */
  const annAfter = asks.map((a) => w.retrieval.meaningRows({ ...a, viewer: V("ann") }));
  const idx = (arm, q) => asks.findIndex((a) => a.rows === arm && a.q === q && a.limit === undefined);
  assert.equal(annAfter[idx("leg", "")].total, annBefore[idx("leg", "")].total + 1);
  for (const arm of ["resolves", "concerns", "content", "passage"]) {
    assert.equal(annAfter[idx(arm, "")].total, annBefore[idx(arm, "")].total + 1, arm);
    assert.equal(annAfter[idx(arm, "")].scope.documents, annBefore[idx(arm, "")].scope.documents + 1, arm);
    assert.ok(annAfter[idx(arm, "")].rows.some((r) => r.bundle_id === proj), arm);
  }
  assert.equal(annAfter[idx("passage", "passage:zzqx")].scope.captures_counted,
               annBefore[idx("passage", "passage:zzqx")].scope.captures_counted + 1, "the owner's tally counts the project's capture");
  assert.equal(annAfter[idx("passage", "passage:budget")].total, 3);
  /* An id list naming the hidden project admits nothing of it. */
  const byIds = w.retrieval.meaningRows({ q: "", rows: "passage", viewer: V("vera"), ids: [proj] });
  assert.deepEqual([byIds.rows, byIds.total, byIds.scope.documents, byIds.scope.captures_counted], [[], 0, 0, 0]);
  const ownIds = w.retrieval.meaningRows({ q: "", rows: "passage", viewer: V("ann"), ids: [proj] });
  assert.deepEqual([ownIds.total, ownIds.scope.documents], [1, 1]);
  assert.ok(c);
});

test("R10, R11: through retrievalRoutes a missing arm is C-23.1 and an unknown one C-23.2, a refusal carrying its check, translation and detail and no rows or total; the arm is read trimmed and case-folded; q, rows, viewer, limit, offset and ids reach the read", () => {
  const { w } = corpus();
  const url = (qs) => new URL(`http://x/meaningrows?${qs}`);
  const route = (qs, body) => retrievalRoutes(w.retrieval, url(qs), body).meaningrows();
  const none = route("viewer=member:vera");
  assert.deepEqual(Object.keys(none).sort(), ["check", "detail", "ok", "reason", "translation"]);
  assert.deepEqual([none.ok, none.reason, none.check, none.translation],
    [false, "MEANING_ROWS_NO_ARM", "C-23.1", MEANING_READ_CHECKS.MEANING_ROWS_NO_ARM.translation]);
  for (const blank of ["rows=", "rows=%20%20"])
    assert.equal(route(`${blank}&viewer=member:vera`).reason, "MEANING_ROWS_NO_ARM", blank);
  const bad = route("rows=legs&viewer=member:vera");
  assert.deepEqual(Object.keys(bad).sort(), ["check", "detail", "ok", "reason", "translation"]);
  assert.deepEqual([bad.ok, bad.reason, bad.check, bad.translation],
    [false, "MEANING_ROWS_UNKNOWN_ARM", "C-23.2", MEANING_READ_CHECKS.MEANING_ROWS_UNKNOWN_ARM.translation]);
  assert.deepEqual(ARMS.filter((a) => !bad.detail.includes(a)), []);
  /* Case and surrounding space do not make an arm unknown. */
  const leg = JSON.stringify(w.retrieval.meaningRows({ q: "leg:hunch", rows: "leg", viewer: V("vera") }));
  for (const spelled of ["LEG", " leg ", "Leg"])
    assert.equal(JSON.stringify(w.retrieval.meaningRows({ q: "leg:hunch", rows: spelled, viewer: V("vera") })), leg, spelled);
  /* The route hands every argument through: its answer is the method's over the same arguments. */
  const routed = route(`rows=leg&q=${encodeURIComponent("has:leg")}&viewer=member:vera&limit=2&offset=1`, { ids: ["INQ-1", "INQ-3"] });
  const direct = w.retrieval.meaningRows({ q: "has:leg", rows: "leg", viewer: V("vera"), limit: "2", offset: "1", ids: ["INQ-1", "INQ-3"] });
  assert.deepEqual(routed, direct);
  assert.deepEqual([routed.limit, routed.offset, routed.count, routed.total], [2, 1, 2, 6]);
  assert.ok(routed.rows.every((r) => ["INQ-1", "INQ-3"].includes(r.bundle_id)), "the ids narrowed the scope");
  assert.equal(route("rows=leg").total, 0, "no viewer stamp, nothing");
});
