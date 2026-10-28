/* retrieval R95, R98 (T51 alpha walk, F-B8): a passage page of any size up to the clamp names each hit's part kind and its
 * document within the plane's 100-variable bound (D-36); the fixture's database refuses a statement binding more. The screen
 * asks 200 rows, so a word in 34 or more passages must answer. Over a store that holds the `kind` column, as the live one. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { word as WORD } from "../../../src/setup-words/index.mjs";

const para = (n) => ({ kind: "doc-para", para: n });

function passages(n) {
  const w = world();
  w.withKindColumn();
  const c = w.cap("budget.docx", "budget bytes");
  w.doc("INFO-BUDGET", {}, { captures: [c] });
  for (let i = 0; i < n; i++) w.unit(c.sha, "INFO-BUDGET", i, `the budget line ${i}`, para(i), i % 2 ? "footnote" : "body");
  return w;
}

for (const n of [33, 34, 100, 101, 200, 300]) {
  test(`R95, R98: meaningRows rows=passage at limit 200 over ${n} matching passages answers every row (up to the clamp) with its kind, no statement past 100 variables`, () => {
    const w = passages(n);
    const a = w.retrieval.meaningRows({ q: "passage:budget", rows: "passage", limit: 200, viewer: V("vera") });
    assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
    assert.equal(a.total, n);
    assert.equal(a.rows.length, Math.min(n, 200));
    for (const r of a.rows) {
      assert.ok(["body", "footnote"].includes(r.kind), `row ${r.extent} has kind ${r.kind}`);
      assert.equal(r.document.bundle_id, "INFO-BUDGET");
    }
  });
}

/* F-B10 (a): a passage AND that finds nothing offers the OR reading, as `search` does (R9). */
function twoDocs() {
  const w = world();
  w.withKindColumn();
  const c = w.cap("a.docx", "a bytes");
  w.doc("INFO-A", {}, { captures: [c] });
  w.unit(c.sha, "INFO-A", 0, "the council adopted the ordinance", para(0), "body");
  const d = w.cap("b.docx", "b bytes");
  w.doc("INFO-B", {}, { captures: [d] });
  w.unit(d.sha, "INFO-B", 0, "the ordinance was read twice", para(0), "body");
  return w;
}

test("R9: meaningRows rows=passage whose AND finds nothing answers widen {OR, total, q, detail} counting the passages holding any word; a query that finds rows, a single word, and widen:false answer widen null", () => {
  const w = twoDocs();
  const ask = (q, extra = {}) => w.retrieval.meaningRows({ q, rows: "passage", viewer: V("vera"), ...extra });
  const none = ask("ordinance zzzqqq");
  assert.equal(none.ok, true);
  assert.equal(none.total, 0);
  assert.equal(none.widen.interpretation, "OR");
  assert.equal(none.widen.total, 2);
  assert.equal(none.widen.q, "ordinance zzzqqq");
  assert.equal(typeof none.widen.detail, "string");
  assert.equal(ask("zzzqqq yyyppp").widen, null, "the OR reading finds nothing either: nothing is offered");
  assert.equal(ask("ordinance council").widen, null, "rows were found");
  assert.equal(ask("zzzqqq").widen, null, "one atom is not widened");
  assert.equal(ask("ordinance zzzqqq", { widen: false }).widen, null);
  assert.equal(ask("council zzzqqq NOT ordinance").total, 0);
  assert.equal(ask("council zzzqqq NOT ordinance").widen, null, "a NOT is never widened to everything");
  const fields = w.retrieval.search({ q: "levy NOT zzzqqq", viewer: V("vera") });
  assert.equal(fields.widen, null, "nor is the fields question's");
});

/* F-B11: the sentence the screen draws for the findings level (the meaning level's `why`, UNDETERMINED on every passage and
   content answer) is plain words for a member: no backtick, no `field:value` query token, no "level" or "rows". */
test("R13, R14: the meaning level's undetermined sentence on a passage and on a content answer holds no backtick, no field:value token and neither the word level nor rows", () => {
  const w = twoDocs();
  const answers = [
    w.retrieval.meaningRows({ q: "passage:ordinance", rows: "passage", viewer: V("vera") }),
    w.retrieval.meaningRows({ q: "passage:zzzqqq", rows: "passage", viewer: V("vera") }),
    w.retrieval.meaningRows({ q: "content:cited", rows: "content", viewer: V("vera") }),
  ];
  for (const a of answers) {
    assert.equal(a.ok, true);
    const m = a.levels.meaning;
    assert.equal(m.state, "UNDETERMINED");
    assert.equal(m.why, WORD("retrieval.levels.finding_rests_plain"));
    assert.doesNotMatch(m.why, /`/);
    assert.doesNotMatch(m.why, /\b[a-z_]+:[a-z_*"]/i);
    assert.doesNotMatch(m.why, /\b(level|rows?)\b/i);
  }
});
