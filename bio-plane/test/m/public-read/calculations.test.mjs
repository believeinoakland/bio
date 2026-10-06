/* public-read — calculations in a published case (T33-65; C:A-15, C:A-12; K1448): R26 (`publishedCase` answers each
   calculation the signed document carries, every output a computed fact with its denominator beside it, the publisher's
   disclosure beside a differing or unbound one, nothing recomputed at the read) and R23's calculation clause (the case
   file carries each calculation and every input it names, by the hash the row states). The `calculations:` block is
   written by `case-grammar`'s one writer (`calculationsLines`, its R18) as `case-authoring` writes it, and read back by
   the module through `calculationsOf`. Each claim has its negative control. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { publishedSix, stubOf, sha } from "./fixture.mjs";
import { buildCaseFile } from "../../../src/public-read/casefile.mjs";
import { bindPublishedPlane, publishedRoutes, assembleCaseContainer } from "../../../src/publication/worker.mjs";
import { calculationsLines, calculationFileText, provOf, caseFilePath, caseFileManifestCheck }
  from "../../../src/case-grammar/index.mjs";
import { resultKey } from "../../../src/calc-grammar/index.mjs";
import { COMPUTED_FACT, CALC_DISCLOSED_SENTENCE, CALC_UNDISCLOSED_SENTENCE, SHARE_NO_DENOMINATOR_SENTENCE }
  from "../../../src/public-read/index.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
bindPublishedPlane({
  json, STORE_SILENT_REASON: "STORE_DID_NOT_ANSWER", STORE_SILENT_DETAIL: "silent", PUBLISHED_STORE: "bio",
  doAnswer: async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
                             return out && out.ok === true ? { answered: true, result: out.result } : { answered: false }; },
  storeSilent: (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502),
  requiredArgument: (op, argument, shape, error) => ({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error }),
});
const line = (rows) => calculationsLines(rows);
const H = (c) => c.repeat(64);
const RECIPE = { method: "bio-calc/1", inputs: { contracts: "table" }, steps: [{ op: "count", as: "n", from: "contracts" }],
                 output: "n" };
const keyOf = (r) => resultKey(r.recipe, Object.fromEntries(r.inputs.map((i) => [i.name, i.sha256])), { methodVersion: r.method_version });
const SHARE = { calc: "CALC-2026-0001", recipe: { ...RECIPE, question: "How many contracts are at grade B?" },
  inputs: [{ name: "contracts", sha256: H("a") }], method_version: "bio-calc/1@1",
  results: { at_b: { numerator: "41", denominator: "58", value: "0.706896551724" }, rows: "58" },
  result_key: H("1"), recompute: "agrees", disclosed: null };
const DIFFERS = { calc: "CALC-2026-0002", recipe: RECIPE,
  inputs: [{ name: "payments", sha256: H("b") }, { name: "contracts", sha256: H("a") }], method_version: "bio-calc/1@1",
  results: { late: { op: "share", value: "0.5" }, by_dept: [{ numerator: "3", denominator: "4", value: "0.75" }, "12"] },
  result_key: H("2"), recompute: "differs", disclosed: "Two payments were re-dated after we computed this; the share shown is the one we signed." };
const UNBOUND = { ...DIFFERS, calc: "CALC-2026-0003", results: { total: "9" }, recompute: "unbound", disclosed: null, result_key: H("3") };

test("R26 publishedCase answers each calculation the signed document carries: its question, its outputs by key each labelled a computed fact, a share with its numerator and denominator beside it, its method version and recompute status", () => {
  const { w } = publishedSix({ extra: line([SHARE]) });
  const c = w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  assert.equal(c.calculations.length, 1);
  const k = c.calculations[0];
  assert.deepEqual([k.calc, k.question, k.method_version, k.recompute, k.result_key, k.label],
    ["CALC-2026-0001", "How many contracts are at grade B?", "bio-calc/1@1", "agrees", keyOf(SHARE), COMPUTED_FACT]);
  assert.deepEqual(k.outputs.map((o) => o.key), ["at_b", "rows"], "every output, by key");
  const share = k.outputs[0];
  assert.deepEqual([share.numerator, share.denominator, share.label], ["41", "58", COMPUTED_FACT],
    "the denominator beside the share, never a share alone");
  assert.deepEqual(share.result, SHARE.results.at_b, "the result as signed");
  assert.deepEqual([k.outputs[1].result, k.outputs[1].label], ["58", COMPUTED_FACT], "a count is a computed fact too");
  assert.equal(k.disclosed, null);
  assert.equal(Object.hasOwn(k, "disclosure_detail"), false, "an agreeing calculation needs no disclosure");
  /* no output and no calculation is called a finding, a breach or a violation (D275) */
  assert.doesNotMatch(JSON.stringify(c.calculations), /finding|breach|violation/i);
});

test("R26 a differing or unbound calculation is answered with the publisher's disclosure in their words beside it, or the statement that the document states none; a share whose row states no denominator answers it undetermined", () => {
  const { w } = publishedSix({ extra: line([DIFFERS, UNBOUND]) });
  const [d, u] = w.read("publishedcase", { id: "CASE-2026-0001" }).calculations;
  assert.deepEqual([d.recompute, d.disclosed, d.disclosure_detail], ["differs", DIFFERS.disclosed, CALC_DISCLOSED_SENTENCE]);
  assert.deepEqual([u.recompute, u.disclosed, u.disclosure_detail], ["unbound", null, CALC_UNDISCLOSED_SENTENCE]);
  const late = d.outputs.find((o) => o.key === "late");
  assert.deepEqual([late.denominator, late.denominator_detail], [null, SHARE_NO_DENOMINATOR_SENTENCE],
    "a share with no denominator is never served as a bare share");
  const groups = d.outputs.find((o) => o.key === "by_dept");
  assert.deepEqual(groups.groups.map((g) => [g.denominator ?? null, g.label]), [["4", COMPUTED_FACT], [null, COMPUTED_FACT]]);
  assert.equal(groups.groups[1].result, "12");
});

test("R26 nothing is recomputed at the read: a stored result is served exactly as signed, even one that does not follow from its numbers; a document without the block answers an empty list", () => {
  const wrong = { ...SHARE, results: { at_b: { numerator: "41", denominator: "58", value: "0.99" } } };
  const { w } = publishedSix({ extra: line([wrong]) });
  assert.equal(w.read("publishedcase", { id: "CASE-2026-0001" }).calculations[0].outputs[0].result.value, "0.99",
    "the checker recomputes (case-checker), the read never does");
  const none = publishedSix().w.read("publishedcase", { id: "CASE-2026-0001" });
  assert.deepEqual(none.calculations, []);
});

test("R23 the case file's facts carry each calculation the block lists, with every input it names by the row's hash", () => {
  const { w } = publishedSix({ extra: line([SHARE, DIFFERS]) });
  const f = w.read("casefilefacts", { caseId: "CASE-2026-0001", edition: 1 });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.deepEqual(f.calculations.map((c) => [c.row.calc, c.inputs.map((i) => i.sha).sort()]),
    [["CALC-2026-0001", [H("a")]], ["CALC-2026-0002", [H("a"), H("b")]]], "every input named, each once");
  const none = publishedSix().w.read("casefilefacts", { caseId: "CASE-2026-0001", edition: 1 });
  assert.deepEqual(none.calculations, []);
});

test("R23 the case file carries each calculation as its row and, under it, each input at the hash the row states, with the calculations' PROV-O rendering once; an input not held at that hash is named unheld, never carried under a wrong name", async () => {
  const enc = (s) => new TextEncoder().encode(s);
  const A = enc("contract,grade\n1,B\n"), B = enc("payment,date\n1,2026-01-02\n");
  const rows = [{ ...SHARE, inputs: { contracts: sha(A) } },
                { ...DIFFERS, inputs: { payments: sha(B), contracts: sha(A) } },
                { ...UNBOUND, inputs: { gone: H("e"), wrong: H("f") } }];
  const docText = "---\nformat: bio-case-document/6\n---\n";
  const facts = { case: "CASE-2026-0001", edition: 1,
    document: { doc_sha: sha(enc(docText)), text: docText, sig_armored: "sig", key_b64: null },
    findings: [], grading: {}, passages: {}, materials: [], attestations: [],
    calculations: rows.map((row) => ({ row, inputs: Object.values(row.inputs).map((s) => ({ sha: s, text: null })) })) };
  const bucket = new Map([[sha(A), A], [sha(B), B], [H("f"), enc("not these bytes")]]);
  const built = await buildCaseFile({ facts, read: async (s) => bucket.get(s) ?? null });
  assert.equal(built.ok, true, JSON.stringify(built).slice(0, 300));
  const byPath = new Map(built.files.map((f) => [f.path, f]));
  for (const r of rows) {
    const f = byPath.get(caseFilePath("calculation", r.calc));
    assert.equal(new TextDecoder().decode(f.content), calculationFileText(r), `${r.calc}: the row, in case-grammar's one spelling`);
  }
  assert.deepEqual([sha(byPath.get(caseFilePath("calculation", [SHARE.calc, sha(A)])).content),
                    sha(byPath.get(caseFilePath("calculation", [DIFFERS.calc, sha(B)])).content),
                    sha(byPath.get(caseFilePath("calculation", [DIFFERS.calc, sha(A)])).content)],
                   [sha(A), sha(B), sha(A)], "each held input under each calculation naming it, at its own hash");
  assert.equal(new TextDecoder().decode(byPath.get(caseFilePath("calculation", "prov")).content), provOf(rows));
  assert.equal(byPath.has(caseFilePath("calculation", [UNBOUND.calc, H("e")])), false);
  assert.equal(byPath.has(caseFilePath("calculation", [UNBOUND.calc, H("f")])), false);
  assert.deepEqual(built.unheld.filter((u) => u.what === "calculation_input").map((u) => [u.ref, u.sha]),
    [["CALC-2026-0003", H("e")], ["CALC-2026-0003", H("f")]],
    "an input never held and one whose bytes are another hash's are named, not carried");
  assert.deepEqual(built.manifest.files.map((f) => f.path).sort(), built.files.map((f) => f.path).sort(), "nothing left out");
  /* negative control: no calculations, no calculation file and no PROV-O rendering */
  const none = await buildCaseFile({ facts: { ...facts, calculations: [] }, read: async () => null });
  assert.equal(none.files.some((f) => f.kind === "calculation"), false);
});

test("R23 end to end: a published edition's case file, assembled by the Worker, carries its calculations and their held inputs, and its manifest passes case-grammar's check", async () => {
  const enc = (s) => new TextEncoder().encode(s);
  const A = enc("contract,grade\n1,B\n");
  const row = { ...SHARE, inputs: [{ name: "contracts", sha256: sha(A) }] };
  const s = publishedSix({ extra: line([row]) });
  s.env.PUBLISHED.m.set(`bio/published/${sha(A)}`, A); /* committed at publish (publication R22, K1632) */
  const out = await assembleCaseContainer({ env: s.env, stub: stubOf(s.w), storeName: "bio",
    cs: s.w.p.caseEditionState("CASE-2026-0001", 1, "parks-group"), via: "test" });
  assert.equal(typeof out.manifest_sha, "string", JSON.stringify(out).slice(0, 400));
  assert.deepEqual(out.unheld, []);
  const r = await publishedRoutes({ op: "publishedbytes", env: s.env, stub: stubOf(s.w),
    url: new URL(`https://plane/?op=publishedbytes&sha256=${out.manifest_sha}`) });
  const m = JSON.parse(new TextDecoder().decode(new Uint8Array(await r.arrayBuffer())));
  assert.deepEqual(caseFileManifestCheck(m), []);
  assert.deepEqual(m.files.filter((f) => f.kind === "calculation").map((f) => f.path).sort(),
    [caseFilePath("calculation", "prov"), caseFilePath("calculation", row.calc), caseFilePath("calculation", [row.calc, sha(A)])].sort());
  const inp = await publishedRoutes({ op: "publishedbytes", env: s.env, stub: stubOf(s.w),
    url: new URL(`https://plane/?op=publishedbytes&sha256=${sha(A)}`) });
  assert.equal(inp.status, 200, "the input is served by its hash");
});
