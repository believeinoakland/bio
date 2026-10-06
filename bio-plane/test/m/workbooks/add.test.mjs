/* workbooks: holding a workbook (R1), reading it whole (R2), sight (R13) and its tables (R18). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, seeded, xlsx, BASIC, V, MACHINE } from "./fixture.mjs";
import { WORKBOOKS_TABLES } from "../../../src/workbooks/index.mjs";

const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");

async function ready() {
  const w = world();
  for (const m of ["alice", "bob", "carol", "dave"]) w.member(m, m === "alice" ? { role: "admin" } : {});
  w.P = w.project("Rates", "bob", ["carol"]);
  return w;
}

test("R1 addWorkbook refuses in order NO_SHA, CAPTURE_NOT_HELD, NOT_A_WORKBOOK, NO_QUESTION, NO_PERIOD, NO_PROJECT, each writing nothing; then holds the workbook with its question, period, project, origin and author; a repeat answers already", async () => {
  const w = await ready();
  const cap = w.capture(BASIC()).capSha;
  const text = w.capture("plain words, not a workbook").capSha;
  const hiddenP = w.project("Private", "alice");
  const inHidden = w.capture(BASIC(), { project: hiddenP }).capSha;
  const good = { captureSha: cap, question: "What does it cost?", period: "FY2025", project: w.P, by: V("bob") };
  const before = w.snapshot();
  const order = [
    [{ ...good, captureSha: "xyz" }, "NO_SHA"],
    [{ ...good, captureSha: undefined }, "NO_SHA"],
    [{ ...good, captureSha: "f".repeat(64) }, "CAPTURE_NOT_HELD"],
    [{ ...good, captureSha: inHidden }, "CAPTURE_NOT_HELD"],          /* one the actor may not see, answered alike */
    [{ ...good, by: undefined }, "CAPTURE_NOT_HELD"],                 /* no actor: fail closed */
    [{ ...good, captureSha: text, question: "" }, "NOT_A_WORKBOOK"],  /* before NO_QUESTION */
    [{ ...good, question: "  ", period: "" }, "NO_QUESTION"],
    [{ ...good, period: "", project: "nope" }, "NO_PERIOD"],
    [{ ...good, period: { from: " " } }, "NO_PERIOD"],
    [{ ...good, period: null }, "NO_PERIOD"],
    [{ ...good, project: "" }, "NO_PROJECT"],
    [{ ...good, project: cap }, "NO_PROJECT"],
    [{ ...good, project: hiddenP }, "NO_PROJECT"],                    /* a project the actor may not see */
  ];
  for (const [call, code] of order) {
    const r = await w.wb.addWorkbook(call);
    assert.equal(codeOf(r), code, JSON.stringify(call).slice(0, 120));
    assert.ok(r.detail, "a refusal carries its detail");
  }
  const nw = await w.wb.addWorkbook({ ...good, captureSha: text });
  assert.match(nw.why, /./, "NOT_A_WORKBOOK carries office-readers' reason");
  assert.deepEqual(w.snapshot(), before, "a refused add writes nothing");
  /* the size guard: a workbook whose cells office-readers will not read is not a workbook here */
  const huge = w.capture(xlsx([{ name: "S", cells: { A1: { s: "x".repeat(21 * 1024 * 1024) } } }])).capSha;
  const g = await w.wb.addWorkbook({ ...good, captureSha: huge });
  assert.equal(codeOf(g), "NOT_A_WORKBOOK");
  assert.match(g.why, /over_size_bound/, "with office-readers' reason");
  const r = await w.wb.addWorkbook({ ...good, captureSha: cap.toUpperCase() });
  assert.equal(r.ok, true);
  assert.equal(r.already, false);
  assert.equal(r.capture_sha, cap);
  const read = await w.wb.readWorkbook({ captureSha: cap, project: w.P, viewer: V("bob") });
  assert.equal(read.workbook.question, "What does it cost?");
  assert.equal(read.workbook.period, "FY2025");
  assert.equal(read.workbook.project, w.P);
  assert.equal(read.workbook.author, V("bob"));
  assert.equal(read.workbook.origin.bundle_id, w.prov.homeOf(cap).bundleId, "the origin as provenance states it");
  assert.equal(read.workbook.origin.route, w.prov.captureGrade(cap).route);
  assert.equal((await w.wb.addWorkbook({ ...good, by: V("carol") })).already, true, "a repeat");
  assert.equal(w.count("workbooks"), 1);
  /* a period may be an interval */
  const cap2 = w.capture(BASIC()).capSha;
  const iv = await w.wb.addWorkbook({ ...good, captureSha: cap2, period: { from: "2024-07-01", to: "2025-06-30" } });
  assert.equal(iv.ok, true);
  assert.deepEqual((await w.wb.readWorkbook({ captureSha: cap2, project: w.P, viewer: V("bob") })).workbook.period, { from: "2024-07-01", to: "2025-06-30" });
});

test("R2 readWorkbook answers bindings, inputs, latest recompute, lint, method notes, checks, grade facts and the disclosure, and never recomputes", async () => {
  let calls = 0;
  const w = await seeded({ recompute: async () => { calls++; return { ok: false, reason: "NOT_ENABLED", why: "not enabled" }; } });
  const r = await w.wb.readWorkbook({ ...w.at, viewer: V("bob") });
  for (const k of ["workbook", "bindings", "inputs", "recompute", "lint", "method_notes", "checks", "grade_facts", "disclosure"])
    assert.ok(k in r, k);
  assert.equal(r.recompute, null);
  assert.match(r.disclosure.text, /^not recomputed here/);
  await w.wb.recompute({ ...w.at, by: V("bob") });
  assert.equal(calls, 1);
  for (let i = 0; i < 3; i++) await w.wb.readWorkbook({ ...w.at, viewer: V("carol") });
  await w.wb.inputsOf({ ...w.at, viewer: V("bob") });
  await w.wb.lint({ ...w.at, viewer: V("bob") });
  assert.equal(calls, 1, "no read asks the engine");
  const again = await w.wb.readWorkbook({ ...w.at, viewer: V("bob") });
  assert.equal(again.recompute.status, "not recomputed here", "the latest recompute");
  assert.equal(w.count("workbook_recomputes"), 1, "reads write nothing");
  assert.equal(again.inputs.length, 3);
  assert.equal(again.lint.length, 1);
});

test("R13 a workbook whose project, capture or any bound source the viewer may not see is withheld whole: every read and act answers it exactly as an absent one", async () => {
  const w = await seeded();
  const t = await w.table([["amount", "number"]], [["1200.50"], ["300"], ["99.5"]]);
  assert.equal((await w.wb.bind({ ...w.at, range: "Model!B2:B4", input: { table: t, range: "A1:A3" }, by: V("bob") })).ok, true);
  const absentOf = (r) => { const { capture_sha, project, ...rest } = r; return rest; };
  const absent = absentOf(await w.wb.readWorkbook({ captureSha: "a".repeat(64), project: w.P, viewer: V("bob") }));
  const reads = async (viewer) => [
    await w.wb.readWorkbook({ ...w.at, viewer }), await w.wb.inputsOf({ ...w.at, viewer }), await w.wb.lint({ ...w.at, viewer }),
    await w.wb.bind({ ...w.at, range: "Model!B2:B2", input: { table: t, range: "A1:A1" }, by: viewer }),
    await w.wb.explainLint({ ...w.at, finding: { kind: "constant_in_formula", cell: "Model!B6" }, note: "n", by: viewer }),
    await w.wb.recordMethodNote({ ...w.at, purpose: "p", sources: ["s"], steps: "s", limitations: "l", by: viewer }),
    await w.wb.recordCheck({ ...w.at, outcome: "agrees", by: viewer }),
  ];
  const absentAll = async (viewer, why) => {
    for (const r of await reads(viewer)) assert.deepEqual(absentOf(r), absent, `${why}: ${JSON.stringify(r).slice(0, 100)}`);
    assert.deepEqual(absentOf(await w.wb.recompute({ ...w.at, by: viewer })), absent, why);
  };
  /* the project: dave has not joined it */
  await absentAll(V("dave"), "a project out of sight");
  await absentAll(undefined, "no viewer");
  await absentAll("", "an empty viewer");
  /* a bound source out of sight: carol may see the project, not a table filed in bob's own project */
  for (const r of (await reads(V("carol"))).slice(0, 3)) assert.equal(r.ok, true, "carol sees it while she sees every bound table");
  const own = w.project("Bob's own", "bob");
  const t2 = await w.table([["amount", "number"]], [["300"]], { project: own });
  const b2 = await w.wb.bind({ ...w.at, range: "Model!B3", input: { table: t2, range: "A1" }, by: V("bob") });
  assert.equal(b2.ok, true);
  await absentAll(V("carol"), "a bound table out of sight");
  assert.equal((await w.wb.readWorkbook({ ...w.at, viewer: V("bob") })).ok, true, "bob still sees it");
  /* an unbound binding's source is still shown, so it still withholds */
  assert.equal((await w.wb.unbind({ bindingId: b2.binding.binding_id, reason: "wrong table", by: V("bob") })).ok, true);
  await absentAll(V("carol"), "an unbound binding's source out of sight");
  /* an extent out of sight */
  const w2 = await seeded();
  const hiddenP = w2.project("Private", "alice");
  const fig = w2.figure("$1,200.50", { project: hiddenP });
  assert.equal((await w2.wb.bind({ ...w2.at, range: "Model!B2", input: { extent: fig.contentId }, by: V("alice") })).ok, true, "alice sees the extent");
  for (const r of [await w2.wb.readWorkbook({ ...w2.at, viewer: V("bob") }), await w2.wb.inputsOf({ ...w2.at, viewer: V("bob") })])
    assert.deepEqual(absentOf(r), absent, "bob may not see the bound extent");
  /* the capture: its home moved into a project bob may not see */
  const w3 = await seeded();
  w3.st.sql.exec(`UPDATE bundles SET project=? WHERE bundle_id=?`, w3.project("Private", "alice"), w3.prov.homeOf(w3.cap).bundleId);
  w3.membership.reindexProjectSight();
  assert.deepEqual(absentOf(await w3.wb.readWorkbook({ ...w3.at, viewer: V("carol") })), absent, "a capture out of sight");
  /* a machine viewer sees it */
  assert.equal((await w.wb.readWorkbook({ ...w.at, viewer: MACHINE })).ok, true);
});

test("R18 the tables are declared through record-core.declareTable, export yes, keyed to their project for purge; a purge of the project clears them", async () => {
  const w = await seeded();
  const decl = w.record.declaredTables().filter((d) => d.module === "workbooks");
  assert.deepEqual(decl.map((d) => d.name), WORKBOOKS_TABLES.map((t) => t.name));
  assert.deepEqual(decl.map((d) => d.name).sort(), ["workbook_bindings", "workbook_cells", "workbook_checks", "workbook_lint_notes",
    "workbook_method_notes", "workbook_recomputes", "workbooks"]);
  for (const d of decl) {
    assert.equal(d.export, "yes", d.name);
    assert.deepEqual(d.keys, ["project"], d.name);
    assert.equal(d.purge, "clear", d.name);
  }
  const t = await w.table([["amount", "number"]], [["1"]]);
  await w.wb.bind({ ...w.at, range: "Model!B3", input: { table: t, range: "A1" }, by: V("bob") });
  await w.wb.recordMethodNote({ ...w.at, purpose: "p", sources: ["s"], steps: "s", limitations: "l", by: V("bob") });
  await w.wb.recordCheck({ ...w.at, outcome: "agrees", by: V("carol") });
  await w.wb.recompute({ ...w.at, by: V("bob") });
  await w.wb.explainLint({ ...w.at, finding: { kind: "constant_in_formula", cell: "Model!B6" }, note: "a markup", by: V("bob") });
  const other = w.project("Other", "bob");
  const cap2 = w.capture(BASIC()).capSha;
  await w.wb.addWorkbook({ captureSha: cap2, question: "q", period: "p", project: other, by: V("bob") });
  for (const d of decl) assert.ok(w.count(d.name) > 0, `${d.name} holds rows`);
  w.record.transact(() => w.record.purge({ bundleId: w.P }));
  for (const d of decl) assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ${d.name} WHERE project=?`, w.P)[0].n, 0, `${d.name} cleared`);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM workbooks WHERE project=?`, other)[0].n, 1, "another project's workbook stays");
});
