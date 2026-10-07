/* standards: T34's reads for later modules and the law-relation label (R23's amendment, R31, R32; N568, N583, N590;
   K1571, K1608, K1626, K1746). Driven at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, MACHINE, REASON } from "./fixture.mjs";
import { isPortionPath, PORTION_PATH_MAX } from "../../../src/standards/index.mjs";
import { proposalLabel } from "../../../src/record-grammar/labels.mjs";

const codeOf = (r) => (r && r.ok === false ? r.reason : "ok");
const KEY = "/eli/xx-port-ellery/selectboard/12";

test("R23 a proposed law relation, court link or treatment is labelled through record-grammar's proposalLabel(proposer, \"law_relation\") (its R49), never the standard subject, for a machine and a member proposer alike", () => {
  const w = seeded();
  const at = w.passage().contentId, bt = w.passage().contentId, ct = w.passage().contentId;
  const a = w.declare({ cite: "PEBL § 10", text: [at] }).id, b = w.declare({ cite: "PEBL § 20", text: [bt] }).id;
  const court = w.declare({ cite: "9 Marlow 9", kind: "court", text: [ct] }).id;
  const asks = [
    { what: "relation", type: "repeals", from: a, to: b, citation: at, effective: "2021-01-01" },
    { what: "link", type: "applies", from: court, to: a, citation: ct },
    { what: "treatment", decision: court, treatment: "affirmed" },
  ];
  for (const proposer of [MACHINE, V("bob")]) {
    const want = proposalLabel(proposer, "law_relation");
    const other = proposalLabel(proposer, "standard");
    assert.notEqual(want.says, other.says, "the two subjects say different things");
    for (const ask of asks) {
      const p = w.s.lawPropose({ ...ask, why: "Read in the minutes.", proposer });
      assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
      assert.deepEqual([p.proposal.by, p.proposal.state, p.proposal.machine_work, p.proposal.label],
                       [want.by, want.state, want.machine_work, want.says], `${ask.what} by ${proposer}`);
      assert.equal(p.recorded, false);
    }
  }
  assert.equal(w.count("law_relations") + w.count("court_links") + w.count("court_treatments"), 0, "a proposal records nothing");
});

test("R31 isPortionPath answers true exactly for a string non-blank once trimmed of at most 200 characters, is pure and never throws, and R18's portion check reads it", () => {
  assert.equal(PORTION_PATH_MAX, 200);
  for (const v of ["12(a)", "a", " 3 ", "x".repeat(200), "§".repeat(200), "😀".repeat(200)])
    assert.equal(isPortionPath(v), true, JSON.stringify(v).slice(0, 40));
  const cyclic = {}; cyclic.self = cyclic;
  for (const v of ["", " ", "\t\n", "x".repeat(201), "😀".repeat(201), null, undefined, 12, true, ["12(a)"], { path: "12" },
                   cyclic, Symbol("p"), () => "12", new String("12")])
    assert.equal(isPortionPath(v), false, typeof v === "string" ? JSON.stringify(v).slice(0, 40) : typeof v);
  /* pure: the same answer every time, nothing changed */
  const s = "12(a)";
  assert.equal(isPortionPath(s), isPortionPath(s));
  /* R18 reads it: a declaration's portion path is admitted exactly when the predicate admits it */
  const w = seeded();
  for (const path of ["12(a)", "x".repeat(200), "😀".repeat(200), "", " ", "x".repeat(201), 12, null]) {
    const t = w.passage().contentId;
    const r = w.declare({ text: [t], portion: { path, content_id: t } });
    assert.equal(codeOf(r) === "ok", isPortionPath(path), JSON.stringify(path).slice(0, 30));
    if (!isPortionPath(path)) assert.deepEqual([r.reason, r.field], ["STANDARD_FIELD_INVALID", "portion"]);
  }
});

/* Versions of one instrument, at two portions, with a supersession, and one standard at another key. */
function versions(w) {
  const t = Array.from({ length: 5 }, () => w.passage().contentId);
  const v1 = w.declare({ text: [t[0]], portion: { path: "12(a)", content_id: t[0] }, period: { from: "2010-01-01", to: "2019-12-31" } }).id;
  const v2 = w.declare({ text: [t[1]], portion: { path: "12(a)", content_id: t[1] }, period: { from: "2020-01-01", to: null },
                         supersedes: v1 }).id;
  const v3 = w.declare({ text: [t[2]], portion: { path: "12(b)", content_id: t[2] } }).id;
  const whole = w.declare({ text: [t[3]] }).id;
  const elsewhere = w.declare({ cite: "PEBL § 40", text: [t[4]], portion: { path: "12(a)", content_id: t[4] } }).id;
  return { t, v1, v2, v3, whole, elsewhere };
}

test("R32 standardsAt answers the held standards whose instrument key is key, with portion only those recording that portion path; standardsWithPortion those whose portion's content id is contentId; each item its id, key, portion, period and supersession links, in id order", () => {
  const w = seeded();
  const { t, v1, v2, v3, whole, elsewhere } = versions(w);
  const all = w.s.standardsAt({ key: KEY, viewer: V("carol") });
  assert.equal(all.ok, true);
  assert.deepEqual(all.items.map((i) => i.id), [v1, v2, v3, whole].sort(), "every version at the key, in id order, none elsewhere");
  assert.equal(all.truncated, false);
  assert.ok(!all.items.some((i) => i.id === elsewhere));
  const at = w.s.standardsAt({ key: KEY, portion: "12(a)", viewer: V("carol") });
  assert.deepEqual(at.items.map(({ family, says, ...rest }) => rest), [
    { id: v1, instrument: KEY, portion: { path: "12(a)", content_id: t[0] }, period: { from: "2010-01-01", to: "2019-12-31" },
      supersedes: null, superseded_by: v2 },
    { id: v2, instrument: KEY, portion: { path: "12(a)", content_id: t[1] }, period: { from: "2020-01-01", to: null },
      supersedes: v1, superseded_by: null },
  ].sort((a, b) => (a.id < b.id ? -1 : 1)));
  assert.ok(at.items.every((i) => i.family && i.says), "R33 R45: each item carries its family and the members' words");
  assert.deepEqual(w.s.standardsAt({ key: KEY, portion: "12(b)", viewer: V("carol") }).items.map((i) => i.id), [v3]);
  assert.deepEqual(w.s.standardsAt({ key: KEY, portion: "99", viewer: V("carol") }).items, []);
  assert.deepEqual(w.s.standardsAt({ key: "/eli/xx-port-ellery/selectboard/99", viewer: V("carol") }).items, []);
  /* agrees with each standard's own read */
  for (const i of all.items) {
    const r = w.s.standardRead({ id: i.id, viewer: V("carol") });
    assert.deepEqual([i.instrument, i.portion, i.period, i.supersedes, i.superseded_by],
                     [r.instrument.key, r.portion, r.period, r.supersedes, r.superseded_by], i.id);
  }
  /* by a portion's content id */
  const wp = w.s.standardsWithPortion({ contentId: t[1], viewer: V("carol") });
  assert.deepEqual([wp.ok, wp.items.map((i) => i.id), wp.truncated], [true, [v2], false]);
  assert.deepEqual(wp.items[0], at.items.find((i) => i.id === v2));
  assert.deepEqual(w.s.standardsWithPortion({ contentId: t[3], viewer: V("carol") }).items, [], "a text passage that is no portion");
  assert.deepEqual(w.s.standardsWithPortion({ contentId: w.passage().contentId, viewer: V("carol") }).items, []);
  /* blank asks answer no items; a viewer naming no member reads none, as R5 and R8 read it */
  for (const key of ["", "  ", null, undefined]) assert.deepEqual(w.s.standardsAt({ key, viewer: V("carol") }), { ok: true, items: [], truncated: false });
  for (const contentId of ["", " ", null, undefined]) assert.deepEqual(w.s.standardsWithPortion({ contentId, viewer: V("carol") }), { ok: true, items: [], truncated: false });
  for (const viewer of [null, "", "nobody", "member:", 7]) {
    assert.deepEqual(w.s.standardsAt({ key: KEY, viewer }).items, [], String(viewer));
    assert.deepEqual(w.s.standardsWithPortion({ contentId: t[1], viewer }).items, [], String(viewer));
    assert.equal(codeOf(w.s.standardRead({ id: v2, viewer })), "NO_SUCH_STANDARD", "R5 reads the same viewer alike");
    assert.deepEqual(w.s.standardsIn({ viewer }).items, [], "R8 reads the same viewer alike");
  }
  /* both write nothing */
  const before = w.snapshot();
  w.s.standardsAt({ key: KEY, portion: "12(a)", viewer: V("carol") });
  w.s.standardsWithPortion({ contentId: t[1], viewer: V("carol") });
  assert.deepEqual(w.snapshot(), before);
});

test("R32 at most 200 items, with truncated measured by reading one past the cap, for both reads", () => {
  const w = seeded();
  const shared = w.passage().contentId;
  const make = (n) => { for (let i = 0; i < n; i++) {
    const t = w.passage().contentId;
    const r = w.declare({ text: [t, shared], portion: { path: "12(a)", content_id: shared } });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 200));
  } };
  make(200);
  let a = w.s.standardsAt({ key: KEY, viewer: V("bob") }), p = w.s.standardsWithPortion({ contentId: shared, viewer: V("bob") });
  assert.deepEqual([a.items.length, a.truncated, p.items.length, p.truncated], [200, false, 200, false], "exactly the cap is not truncated");
  make(1);
  a = w.s.standardsAt({ key: KEY, portion: "12(a)", viewer: V("bob") }); p = w.s.standardsWithPortion({ contentId: shared, viewer: V("bob") });
  assert.deepEqual([a.items.length, a.truncated, p.items.length, p.truncated], [200, true, 200, true], "one past the cap is");
  const ids = w.rows(`SELECT standard_id FROM standards ORDER BY standard_id`).map((r) => r.standard_id);
  assert.deepEqual(a.items.map((i) => i.id), ids.slice(0, 200), "the first 200 in id order");
  assert.deepEqual(p.items.map((i) => i.id), ids.slice(0, 200));
});
