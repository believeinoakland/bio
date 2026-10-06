/* case-grammar at its interface: R20, the published timeline's `timeline:` block, its two lanes written apart and never
   interleaved, each item with its source, read back the lanes apart, with its negative controls. Driven on the bytes
   alone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "../../../src/record-grammar/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { doc, sha } from "./helpers.mjs";
import { TIMELINE } from "./casefile-fixture.mjs";

const V7 = CG.CASE_DOCUMENT_FORMAT;
const OLDER = ["bio-case-document/5", "bio-case-document/4", "bio-case-document/3", "bio-case-document/2",
               "bio-case-document/1", null];
const fmOf = (text) => { const p = parseFrontmatter(text); assert.deepEqual(p.findings, [], "the grammar reads every line"); return p.data; };
const full = (r) => Object.fromEntries(CG.TIMELINE_FIELDS.map((f) => [f, r[f] ?? null]));
const NONE = { they_did: [], we_did: [] };

test("R20 the timeline: block round-trips each item exactly, its when as held (with its precision, undetermined with its bounds, or nowhere) and its source", () => {
  assert.deepEqual([...CG.TIMELINE_FIELDS], ["lane", "ord", "when", "label", "ref", "source"]);
  assert.deepEqual([...CG.TIMELINE_LANES], ["they_did", "we_did"]);
  const fm = fmOf(doc(V7, CG.timelineLines(TIMELINE)));
  assert.deepEqual(fm.timeline.map((r) => Object.keys(r)), TIMELINE.map(() => [...CG.TIMELINE_FIELDS]), "flat rows");
  const t = CG.timelineOf(fm);
  assert.deepEqual(t, { they_did: [TIMELINE[1], TIMELINE[3]].map(full), we_did: [TIMELINE[2], TIMELINE[0]].map(full) });
  assert.deepEqual(t.they_did[0].when, { day: "2026-03-04", precision: "day" }, "its precision kept");
  assert.deepEqual(t.we_did[0].when, { state: "undetermined", low: "2026-08-01", high: "2026-08-31" }, "undetermined, with its bounds");
  assert.equal(t.they_did[1].when, "nowhere");
  const hard = "It's \"so\" \\ # x\nline two";
  assert.equal(CG.timelineOf(fmOf(doc(V7, CG.timelineLines([{ ...TIMELINE[0], label: hard }])))).we_did[0].label, hard, "a label byte for byte");
});

test("R20 the two lanes are written apart, each in its own order, never interleaved into one list, whatever order they are handed in", () => {
  const lines = CG.timelineLines(TIMELINE);
  const lanes = lines.filter((l) => l.startsWith("  - lane: ")).map((l) => JSON.parse(l.slice("  - lane: ".length).replace(/^'|'$/g, "")));
  assert.deepEqual(lanes, ["they_did", "they_did", "we_did", "we_did"], "every they_did row, then every we_did row");
  for (let n = 0; n < 24; n++) {
    const shuffled = [...TIMELINE].sort((a, b) => ((sha(`${n}${a.label}`) < sha(`${n}${b.label}`)) ? -1 : 1));
    assert.deepEqual(CG.timelineLines(shuffled), lines, "the same block, however handed");
  }
  /* bytes another hand interleaved still read the lanes apart, each in its order */
  const fm = fmOf(doc(V7, CG.timelineLines(TIMELINE)));
  const interleaved = { ...fm, timeline: [fm.timeline[2], fm.timeline[0], fm.timeline[3], fm.timeline[1]] };
  assert.deepEqual(CG.timelineOf(interleaved), CG.timelineOf(fm));
  /* ties and items with no ord keep the order given, within their lane */
  const ties = [{ lane: "we_did", ord: 1, label: "b", source: "s" }, { lane: "we_did", ord: 1, label: "a", source: "s" },
                { lane: "we_did", label: "z", source: "s" }, { lane: "we_did", ord: 0, label: "first", source: "s" }];
  assert.deepEqual(CG.timelineOf(fmOf(doc(V7, CG.timelineLines(ties)))).we_did.map((r) => r.label), ["first", "b", "a", "z"]);
});

test("R20 an item without a source is not written, nor one in no lane; nor is either read", () => {
  const unsourced = [null, undefined, "", "  ", [], {}].map((source, i) => ({ lane: "they_did", ord: i, label: `u${i}`, source }));
  const elsewhere = [{ lane: "both", ord: 1, label: "x", source: "s" }, { lane: null, label: "y", source: "s" }];
  const lines = CG.timelineLines([...unsourced, ...elsewhere, TIMELINE[0]]);
  const t = CG.timelineOf(fmOf(doc(V7, lines)));
  assert.deepEqual(t, { they_did: [], we_did: [full(TIMELINE[0])] });
  for (const s of ["u0", "u1", "u2", "u3", "u4", "u5", '"x"', '"y"']) assert.equal(lines.join("\n").includes(s), false, s);
  assert.deepEqual(CG.timelineLines(unsourced), ["timeline: []"]);
  /* bytes another hand wrote with such an item: not read */
  assert.deepEqual(CG.timelineOf({ format: V7, timeline: [{ lane: '"they_did"', label: '"no source"', source: "null" },
                                                          { lane: '"we_did"', label: '"elsewhere"', source: '"s"' }] }),
                   { they_did: [], we_did: [{ lane: "we_did", ord: null, when: null, label: "elsewhere", ref: null, source: "s" }] });
});

test("R20 R6 negative controls: a document without the block, an older format and odd input answer both lanes empty; the writer never throws", () => {
  assert.deepEqual(CG.timelineLines([]), ["timeline: []"]);
  for (const odd of [null, undefined, 7, "x", {}, [null, 7]]) assert.deepEqual(CG.timelineLines(odd), ["timeline: []"]);
  assert.deepEqual(CG.timelineOf(fmOf(doc(V7))), NONE, "a document without it answers both lanes empty");
  assert.deepEqual(CG.timelineOf(fmOf(doc(V7, CG.timelineLines([])))), NONE);
  for (const format of OLDER) assert.deepEqual(CG.timelineOf(fmOf(doc(format, CG.timelineLines(TIMELINE)))), NONE, `format ${format}`);
  for (const odd of [null, undefined, 7, "x", {}, [], { get format() { throw new Error("boom"); } },
                     { format: V7, get timeline() { throw new Error("boom"); } }, { format: V7, timeline: "x" }])
    assert.deepEqual(CG.timelineOf(odd), NONE);
  /* pure: the same answer twice, its argument untouched */
  const fm = fmOf(doc(V7, CG.timelineLines(TIMELINE)));
  const before = JSON.stringify(fm);
  assert.deepEqual(CG.timelineOf(fm), CG.timelineOf(fm));
  assert.equal(JSON.stringify(fm), before);
});
