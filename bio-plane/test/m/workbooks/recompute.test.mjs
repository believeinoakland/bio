/* workbooks: recompute through the instance's engine (R6), what is not compared (R7), and the disclosure (R8). The
   engine is the real `sheet-worker` member over its pinned wasm, reached as the plane reaches it (`ctx.recompute`),
   over the member's own corpus fixtures; a stand-in engine reaches the answers no real workbook gives. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, seeded, xlsx, V, sha } from "./fixture.mjs";
import { ENGINE_MEASURE, RECOMPUTE_MEANING } from "../../../src/workbooks/index.mjs";
import { fixture, makeMember, realEngine, bucket, post, call, ON } from "../../../../sheet-worker/test/helpers.mjs";

/* `ctx.recompute` over the real member: it reads the capture from its own R2 stand-in, as the deployed member does. */
function realRecompute(holder, { member = makeMember(realEngine()), env = ON } = {}) {
  return async (s) => {
    const r2 = bucket({ [`bio/captures/${s}`]: holder.w.ev.m.get(s) });
    return (await call(member, post({ capture_sha: s, store: "bio" }), { ...env, CAPTURES: r2.binding })).body;
  };
}

async function realSeeded(bytes, opts = {}) {
  const holder = {};
  const w = await seeded({ recompute: realRecompute(holder, opts) }, bytes);
  holder.w = w;
  return w;
}

const agreeing = () => xlsx([{ name: "S", cells: { A1: { n: "0.1" }, A2: { n: "0.2" }, A3: { f: "A1+A2", v: "0.30000000000000004" },
  B1: { s: "a" }, B2: { f: "B1&\"b\"", v: "ab", t: "str" }, C1: { f: "A1>0", v: "1", t: "b" }, C2: { f: "ROUND(A3,2)", v: "0.3" },
  D9: { s: `${Math.random()}` } } }]);

test("R6 recompute pairs each recomputed formula cell with the file's cached value, numbers within a relative 1e-9, text and booleans exactly, and records status, engine, version, time, counts, the differing and the not recomputed", async () => {
  const w = await realSeeded(agreeing());
  w.clock.now = "2026-10-06T05:00:00.000Z";
  const r = await w.wb.recompute({ ...w.at, by: V("bob") });
  assert.equal(r.ok, true);
  const x = r.recompute;
  assert.equal(x.status, "agrees");
  assert.equal(x.engine, ENGINE_MEASURE.engine);
  assert.equal(x.engine_version, ENGINE_MEASURE.engine_version);
  assert.equal(x.at, "2026-10-06T05:00:00.000Z");
  assert.deepEqual(x.counts, { compared: 4, agreed: 4, differed: 0, not_recomputed: 0, volatile: 0, cache_stale: 0 });
  assert.deepEqual([x.differing, x.not_recomputed], [[], []]);
  /* one cell off in each kind, and one within 1e-9 */
  const w2 = await realSeeded(xlsx([{ name: "S", cells: { A1: { n: "1000000" }, A2: { f: "A1*3", v: "3000000.000001" },
    A3: { f: "A1*3", v: "3000000.01" }, B1: { s: "a" }, B2: { f: "B1&\"b\"", v: "aB", t: "str" }, C1: { f: "A1>0", v: "0", t: "b" },
    C2: { f: "A1", v: "1000000", t: "str" } } }]));
  const y = (await w2.wb.recompute({ ...w2.at, by: V("bob") })).recompute;
  assert.equal(y.status, "differs");
  assert.deepEqual(y.counts, { compared: 5, agreed: 1, differed: 4, not_recomputed: 0, volatile: 0, cache_stale: 0 });
  assert.deepEqual(y.differing.map((d) => d.cell), ["S!C1", "S!B2", "S!C2", "S!A3"], "in the engine's order; 3000000.000001 is within 1e-9; a number cached as text differs");
  assert.deepEqual(y.differing[3], { cell: "S!A3", cached: "3000000.01", cached_type: "number", engine_value: 3000000, engine_type: "number" });
  /* recorded, and read back */
  assert.equal((await w2.wb.readWorkbook({ ...w2.at, viewer: V("carol") })).recompute.differing.length, 4);
  assert.equal(w2.count("workbook_recomputes"), 1);
});

test("R7 an engine error is listed not_recomputed with its cause, never a disagreement; a volatile cell is listed and never compared; a cached error where the engine gives a value is cache_stale; a whole-workbook refusal records 'not recomputed here' with the reason as given", async () => {
  /* circular references, from the corpus: #CIRC!, cause circular */
  const circ = await realSeeded(fixture("corpus-zoning-fees-iterating.xlsx"));
  const c = (await circ.wb.recompute({ ...circ.at, by: V("bob") })).recompute;
  assert.ok(c.counts.not_recomputed > 0);
  assert.ok(c.not_recomputed.some((n) => n.cause === "circular" && n.error === "#CIRC!"));
  for (const n of c.not_recomputed) assert.ok(!c.differing.some((d) => d.cell === n.cell), "never counted a disagreement");
  assert.equal(c.counts.compared, c.counts.agreed + c.counts.differed);
  /* implicit intersection, from the corpus */
  const nofa = await realSeeded(fixture("corpus-nofa-implicit-intersection.xlsx"));
  const n = (await nofa.wb.recompute({ ...nofa.at, by: V("bob") })).recompute;
  assert.ok(n.not_recomputed.some((x) => x.cause === "implicit_intersection"));
  assert.ok(["partial", "differs"].includes(n.status));
  /* an unsupported function, a volatile cell, a stale cache, a missing cache */
  const syn = await realSeeded(xlsx([{ name: "S", cells: { A1: { n: "2" }, A2: { f: "WEBSERVICE(\"x\")", v: "#VALUE!", t: "e" },
    A3: { f: "NOW()", v: "45000" }, A4: { f: "A1*2", v: "#N/A", t: "e" }, A5: { f: "A1*3" }, A6: { f: "A1+1", v: "3" } } }]));
  const s = (await syn.wb.recompute({ ...syn.at, by: V("bob") })).recompute;
  assert.deepEqual(s.counts, { compared: 1, agreed: 1, differed: 0, not_recomputed: 1, volatile: 1, cache_stale: 2 });
  assert.equal(s.status, "partial");
  assert.deepEqual(s.not_recomputed.map((x) => [x.cell, x.cause]), [["S!A2", "unsupported_function"]]);
  assert.deepEqual(s.volatile.map((x) => x.cell), ["S!A3"]);
  assert.deepEqual(s.cache_stale.map((x) => [x.cell, x.cached, x.engine_value]), [["S!A4", "#N/A", 4], ["S!A5", null, 6]]);
  /* whole-workbook refusals, each recorded as given */
  const cases = [
    ["not enabled", { env: { VERSION: "t" } }, "NOT_ENABLED"],
    ["external links", {}, "EXTERNAL_LINKS", fixture("corpus-external-link.xlsx")],
    ["over a bound", { member: makeMember(realEngine(), { bounds: { maxUnzippedBytes: 9e6, maxCells: 2, timeBudgetMs: 120000 } }) }, "OVER_BOUND"],
    ["time limit", { member: makeMember(realEngine(), { now: (() => { let t = 0; return () => (t += 1e6); })(), turn: async () => {} }) }, "TIME_LIMIT"],
    ["engine absent", { member: makeMember({ open: () => "the wasm is not the pinned build", close() {} }) }, "ENGINE_ABSENT"],
  ];
  for (const [what, opts, code, bytes] of cases) {
    const w = await realSeeded(bytes || agreeing(), opts);
    const r = (await w.wb.recompute({ ...w.at, by: V("bob") })).recompute;
    assert.equal(r.status, "not recomputed here", what);
    assert.equal(r.reason, code, what);
    assert.ok(r.why && r.why.length > 3, `${what}: the reason's words as given`);
    assert.deepEqual(r.counts, { compared: 0, agreed: 0, differed: 0, not_recomputed: 0, volatile: 0, cache_stale: 0 });
  }
  const given = await seeded({ recompute: async () => ({ ok: false, reason: "ENGINE_FAILED", why: "the engine said: no" }) });
  const g = (await given.wb.recompute({ ...given.at, by: V("bob") })).recompute;
  assert.deepEqual([g.reason, g.why], ["ENGINE_FAILED", "the engine said: no"], "as given, word for word");
  /* no binding to the engine, and no answer */
  const none = await seeded();
  assert.deepEqual(pick((await none.wb.recompute({ ...none.at, by: V("bob") })).recompute), ["not recomputed here", "NO_ENGINE", "no engine bound"]);
  for (const engine of [async () => { throw new Error("the binding hung up"); }, async () => undefined, async () => "text", async () => ({ ok: true })]) {
    const w = await seeded({ recompute: engine });
    const r = (await w.wb.recompute({ ...w.at, by: V("bob") })).recompute;
    assert.equal(r.status, "not recomputed here");
    assert.equal(r.reason, "NO_ANSWER");
  }
});
const pick = (r) => [r.status, r.reason, r.why];

test("R8 every answer stating a recompute calls it agreement between the two engines, never accuracy, with the disclosure naming the engine and version and its measured agreement on the corpus; results are recomputed only by the act", async () => {
  const w = await realSeeded(agreeing());
  const before = await w.wb.readWorkbook({ ...w.at, viewer: V("bob") });
  assert.equal(before.recompute, null, "nothing is recomputed on a read");
  const r = (await w.wb.recompute({ ...w.at, by: V("bob") })).recompute;
  const text = `recomputed by the instance's engine (${ENGINE_MEASURE.engine} ${ENGINE_MEASURE.engine_version}); open it in any spreadsheet program`;
  for (const x of [r, (await w.wb.readWorkbook({ ...w.at, viewer: V("carol") })).recompute]) {
    assert.equal(x.meaning, RECOMPUTE_MEANING);
    assert.match(x.meaning, /agreement between the file's engine and the instance's engine, never accuracy/);
    assert.equal(x.disclosure.text, text);
    assert.deepEqual(x.disclosure.measure, ENGINE_MEASURE);
    assert.match(x.disclosure.measure.cells, /98\.85%/);
    assert.match(x.disclosure.measure.workbooks, /81 of 111/);
    assert.ok(!/accura(te|cy)/.test(JSON.stringify(x).split(RECOMPUTE_MEANING).join("")), "never called accurate");
  }
  assert.equal((await w.wb.readWorkbook({ ...w.at, viewer: V("bob") })).disclosure.text, text, "the workbook's read carries it");
  /* an engine build no measure was taken on says so */
  const other = await seeded({ recompute: async () => ({ ok: true, engine: "ironcalc", engine_version: "other", cells: [] }) });
  const o = (await other.wb.recompute({ ...other.at, by: V("bob") })).recompute;
  assert.equal(o.disclosure.measure.measured, false);
  assert.match(o.disclosure.text, /\(ironcalc other\)/);
  /* a refusal discloses "not recomputed here" */
  const off = await seeded();
  await off.wb.recompute({ ...off.at, by: V("bob") });
  assert.match((await off.wb.readWorkbook({ ...off.at, viewer: V("bob") })).disclosure.text, /^not recomputed here: no engine bound; open it in any spreadsheet program$/);
  /* a second act is a second recompute, kept beside the first */
  await w.wb.recompute({ ...w.at, by: V("carol") });
  assert.equal(w.count("workbook_recomputes"), 2);
  assert.equal((await w.wb.readWorkbook({ ...w.at, viewer: V("bob") })).recompute.by, V("carol"), "the latest");
  void sha; void world;
});
