import { test } from "node:test";
import assert from "node:assert/strict";
import { world, everyStatement } from "./fixture.mjs";
import * as Q from "../../../src/query.mjs";
import { compile, textOf, meaningVocabulary, ambiguousBareWords, cachedNotes, viewerPredicate, GATE_MARK, FIELDS,
         MEANING, SORTABLE, CACHED_FIELDS, DEFAULT_FACETS } from "../../../src/query.mjs";
import { GRADE_SOURCES, BASIS_ROLES, GRADE_AXES } from "../../../checks/bio-checks.mjs";
import { CONTENT_EXTENT_KINDS } from "../../../src/content/index.mjs";
import { STEP_KINDS, CHAIN_KIND_MIXED } from "../../../src/textchain.mjs";

const V = "class:member";

test("R18 meaningVocabulary answers each arm's table, key, grain, bare, fields, words, ambiguous, level and rows; columns are what a row carries", () => {
  const voc = meaningVocabulary();
  assert.deepEqual(Object.keys(voc), Object.keys(MEANING));
  const w = world();
  w.bundle("Q", { type: "inquiry" });
  w.bundle("T", {});
  w.insert("inquiry_basis", { bundle_id: "Q", ord: 0, target_id: "T" });
  w.insert("resolutions", { bundle_id: "Q", capture_sha: "s", ref: "r", entity_id: "E" });
  w.insert("content", { content_id: "c", capture_sha: "s", bundle_id: "Q", extent_kind: "document", extent: "{}" });
  w.insert("capture_text", { capture_sha: "s", bundle_id: "Q", extent_kind: "document", extent: "{}", ref: "d", seq: 0,
                             text: "words", chain_kind: "layer" });
  for (const [arm, v] of Object.entries(voc)) {
    const m = MEANING[arm];
    assert.deepEqual(Object.keys(v), ["table", "key", "grain", "bare", "fields", "words", "ambiguous", "level", "rows"]);
    assert.deepEqual([v.table, v.key, v.grain, v.bare, v.level], [m.table, m.key, m.grain, m.bare, m.level]);
    for (const [n, f] of Object.entries(v.fields)) {
      assert.equal(f.column, m.sub[n].col);
      assert.deepEqual(f.values, m.sub[n].vocab || []);
      assert.equal(f.selects, m.sub[n].selects);
    }
    for (const [word, sub] of Object.entries(v.words))
      assert.equal(compile({ q: `${arm}:${word}`, viewer: V }).ast.field, sub, `${arm}:${word}`);
    assert.deepEqual(v.ambiguous, ambiguousBareWords()[arm]);
    assert.deepEqual(Object.keys(v.rows), ["grain", "identity", "columns", "refs"]);
    const row = w.run({ q: "", viewer: V, rows: arm }, "meaning").rows[0];
    assert.ok(row, `${arm} answered a row`);
    assert.deepEqual([...Object.keys(row).filter((k) => k !== "bundle_id" && k !== "bundle_type"),
                      ...Object.keys(m.rowDerived || {})].sort(), [...v.rows.columns].sort(), `${arm}: columns`);
  }
  assert.ok(voc.leg.fields.grade.selects && voc.content.fields.chain.selects);
  assert.ok(ambiguousBareWords().leg.includes("capture"));
  for (const [arm, words] of Object.entries(ambiguousBareWords()))
    for (const word of words) assert.equal(compile({ q: `${arm}:${word}`, viewer: V }).ast, null);
});

test("R19 textOf: title, body, meta, locator and authority, each cut at 128 KiB; never throws", () => {
  const md = "---\ntitle: Sewer fund\nsource:\n  locator: https://x.example/a\n  authority: The clerk\ntags: [one, two]\n---\nThe prose.";
  const t = textOf("INFO-1", [{ path: "notes/b.txt", text: "bee" }, { path: "bundle.md", text: md },
    { path: "a.md", content: "ay" }, { path: "data.json", text: '{"k":"json only"}' }, { path: "img.png", text: null }]);
  assert.equal(t.title, "Sewer fund");
  assert.equal(t.body, "The prose.\n\na.md\nay\n\nnotes/b.txt\nbee", "prose, then every other .md and .txt by path");
  assert.ok(!t.body.includes("json only"));
  for (const bit of ["INFO-1", "title", "Sewer fund", "source", "locator", "https://x.example/a", "tags", "one", "two"])
    assert.ok(t.meta.split(" ").includes(bit) || t.meta.includes(bit), bit);
  assert.equal(t.locator, "https://x.example/a");
  assert.equal(t.authority, "The clerk");
  const big = textOf("B", [{ path: "bundle.md", text: `---\ntitle: ${"t".repeat(200000)}\n---\n${"x".repeat(200000)}` }]);
  for (const k of ["title", "body", "meta"]) assert.equal(big[k].length, 128 * 1024, k);
  const broken = "---\ntitle: [unclosed\n: :\n---\nbody";
  const b = textOf("X", [{ path: "bundle.md", text: broken }]);
  assert.equal(typeof b.body, "string");
  const none = textOf("Y", null);
  assert.deepEqual(none, { title: "", body: "", meta: "Y", locator: "", authority: "" });
  assert.doesNotThrow(() => textOf(undefined, [{ path: "bundle.md" }, {}]));
});

test("R20 pure: no store, no clock, no network, no mutable state but the bare-word index", () => {
  const saved = { now: Date.now, random: Math.random, fetch: globalThis.fetch, Date: globalThis.Date };
  const plans = [];
  try {
    Date.now = () => { throw new Error("clock"); };
    Math.random = () => { throw new Error("random"); };
    globalThis.fetch = () => { throw new Error("network"); };
    globalThis.Date = function () { throw new Error("clock"); };
    for (let i = 0; i < 2; i++) {
      const p = compile({ q: "water leg:hunch content:ocr NEAR(a b) sort:capture", viewer: "member:ann", rows: "leg" });
      plans.push(JSON.stringify({ ...p, cached: Object.entries(p.cached).map(([k, v]) => [k, [...v]]),
        statements: everyStatement(p) }));
      meaningVocabulary(); textOf("A", [{ path: "bundle.md", text: "---\ntitle: t\n---\nb" }]); cachedNotes(p.cached);
    }
  } finally {
    Date.now = saved.now; Math.random = saved.random; globalThis.fetch = saved.fetch; globalThis.Date = saved.Date;
  }
  assert.equal(plans[0], plans[1], "the same input answers the same plan");
  /* The one memoised state: the bare-word index answers the same after any number of compilations. */
  assert.deepEqual(meaningVocabulary(), meaningVocabulary());
});

test("R21 one compilation point for visibility: every statement's gate is the one viewerPredicate minted", () => {
  for (const viewer of ["member:ann", V, null])
    for (const rows of [null, "leg", "passage", "content"]) {
      const plan = compile({ q: "water leg:* passage:x content:*", viewer, rows });
      const gate = viewerPredicate(viewer);
      for (const [shape, s] of everyStatement(plan)) {
        assert.ok(s.sql.includes(gate.sql), `${shape} without the gate`);
        assert.ok(!s.sql.split(gate.sql).join("").includes(GATE_MARK), `${shape} mints a second gate`);
        assert.ok(!/\b1=1\b|\b0=1\b/.test(s.sql.split(gate.sql).join("")), `${shape} carries a visibility of its own`);
      }
    }
});

test("R22 every vocabulary is read from its owner: fields, arm words, content kinds, step kinds, cached columns", () => {
  assert.deepEqual(Object.keys(SORTABLE), ["relevance", ...Object.keys(FIELDS)]);
  assert.ok(DEFAULT_FACETS.every((f) => f in FIELDS));
  assert.deepEqual(MEANING.leg.sub.source.vocab, GRADE_SOURCES);
  assert.deepEqual(MEANING.leg.sub.role.vocab, BASIS_ROLES);
  assert.deepEqual(MEANING.leg.sub.axis.vocab, GRADE_AXES);
  assert.deepEqual(MEANING.content.sub.kind.vocab, Object.keys(CONTENT_EXTENT_KINDS));
  assert.deepEqual(MEANING.content.sub.chain.vocab, [...Object.keys(STEP_KINDS), CHAIN_KIND_MIXED]);
  assert.ok(Q.MACHINE_READ_KINDS.every((k) => k in STEP_KINDS));
  assert.deepEqual(CACHED_FIELDS, Object.fromEntries(Object.entries(FIELDS).filter(([, f]) => f.asOf)
    .map(([n, f]) => [f.col, { field: n, asOf: f.asOf, authority: f.authority, why: f.why }])));
  for (const word of GRADE_SOURCES) {
    const claims = Object.values(MEANING.leg.sub).filter((s) => (s.vocab || []).includes(word)).length;
    assert.equal(compile({ q: `leg:${word}`, viewer: V }).ast?.field ?? null, claims === 1 ? "source" : null);
  }
});

test("R23 no place is named in the module's behaviour or outward text", () => {
  const places = /\b(oakland|alameda|california|legistar)\b/i;
  const outward = [JSON.stringify(meaningVocabulary()), JSON.stringify(ambiguousBareWords()),
    JSON.stringify(Object.values(FIELDS)), JSON.stringify(cachedNotes(compile({ q: "capture:A connection:B sort:capture", viewer: V }).cached))];
  for (const q of ["sewer:fund", "has:x", "sort:x", "fm:;", "leg:capture", "leg:x=y", "leg:grade>=", "passage:>=a",
                   "passage:---", "(a", "NEAR(a)", "NEAR(a b, 900)", "a b c d e f g h i j"])
    outward.push(...compile({ q, viewer: V }).warnings);
  for (const s of outward) assert.ok(!places.test(s), s.slice(0, 200));
  for (const [, st] of everyStatement(compile({ q: "water leg:* content:ocr passage:x", viewer: V, rows: "passage" })))
    assert.ok(!places.test(st.sql));
});
