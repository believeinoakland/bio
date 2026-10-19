/* lines at its interface: every reason is a key (R24; people R40; civil-time R30). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN } from "./fixture.mjs";
import { reasonText } from "../../../src/lines/index.mjs";
import { REASON_KEYS } from "../../../src/lines/reasons.mjs";
import { hasWord, word } from "../../../src/setup-words/index.mjs";

const T = { statement: "The clerk told me at the counter" };

/* a reason is {key, vars}, its key a lines.why.* row (or the civil-time key it passes on), its vars every fill the row names */
const isKeyed = (why) => why !== null && typeof why === "object" && typeof why.key === "string" && why.vars !== null && typeof why.vars === "object";
const reads = (why) => {
  assert.ok(isKeyed(why), `a keyed reason: ${JSON.stringify(why)}`);
  const text = reasonText(why);
  assert.ok(typeof text === "string" && text.length > 0, `${why.key} reads`);
  const flat = Object.values(why.vars).every((v) => typeof v === "string" || typeof v === "number");
  if (hasWord(why.key) && flat) assert.equal(text, word(why.key, why.vars), `${why.key}: the list's sentence`);
  return text;
};

test("R24 every reason a read of lines answers is {key, vars}: a stale-cache line, a date after a stated current-through, an office with no line in and one with two; no why of these reads is a string", () => {
  const w = world();
  const ada = w.ent("person", "Ada Example"), ben = w.ent("person", "Ben Example");
  const o = w.ent("office", "Harbour Master"), b = w.ent("body", "Port Board"), o2 = w.ent("office", "Port Warden");
  /* an office with no line in */
  const none = w.l.holderAt({ office: o2, at: "2022-05-01", viewer: ANN });
  assert.equal(none.undetermined, true);
  assert.deepEqual(none.why, { key: "lines.why.no_line_covers", vars: {} });
  reads(none.why);
  /* an office with two lines in */
  const l1 = w.l.recordLine({ kind: "holds", from: ada, to: o, capacity: "elected", valid: { from: "2020-01-01", to: "2024-12-31" }, basis: T, by: ANN });
  const l2 = w.l.recordLine({ kind: "holds", from: ben, to: o, capacity: "acting", valid: { from: "2021-01-01", to: "2023-12-31" }, basis: T, by: ANN });
  const two = w.l.holderAt({ office: o, at: "2022-05-01", viewer: ANN });
  assert.equal(two.why.key, "lines.why.lines_disagree");
  assert.deepEqual(two.why.vars, { lines: [l1.line_id, l2.line_id].join(", ") }, "the lines it names");
  reads(two.why);
  /* a stale-cache line, in a line read, a holder read and a structure read */
  const part = w.l.recordLine({ kind: "part_of", from: o2, to: b, valid: { from: "2010-01-01", to: "2030-01-01" }, basis: T, by: ANN });
  w.st.sql.exec(`UPDATE line_bound_cache SET to_instant='2099-12-31'`);
  const stale = { key: "lines.why.cache_stale", vars: {} };
  assert.deepEqual(w.l.readLine({ lineId: part.line_id, viewer: ANN }).line.valid.why, stale);
  assert.deepEqual(w.l.structureAt({ entity: o2, at: "2022-05-01", viewer: ANN }).undetermined[0].why, stale);
  assert.deepEqual(w.l.holderAt({ office: o, at: "2022-05-01", viewer: ANN }).lines.map((x) => x.why), [stale, stale]);
  reads(stale);
  w.record.rebuildDerived("lines", "line_bound_cache");
  /* a date after a stated current-through: civil-time's reason is passed on, never flattened */
  const open = w.l.recordLine({ kind: "holds", from: ada, to: o2, capacity: "elected", valid: { from: "2023-01-09" }, basis: T, by: ANN });
  assert.equal(w.l.recordCurrentThrough({ lineId: open.line_id, day: "2025-06-30", basis: T, by: ANN }).ok, true);
  const after = w.l.holderAt({ office: o2, at: "2025-07-01", viewer: ANN });
  const why = after.lines[0].why;
  assert.equal(why.key, "lines.why.stated_current_through");
  assert.deepEqual(why.vars, { why: { key: "civil-time.end_stated", vars: {} }, day: "2025-06-30" });
  assert.match(reads(why), /2025-06-30/, "the day is filled");
  assert.equal(after.why.key, "lines.why.lines_disagree");
  /* a neighbours item keeps connection-grammar's contract: its reason is a {key, vars} */
  const n = w.l.neighbours({ node: o2, at: "2025-07-01T12:00:00Z", viewer: ANN, kinds: ["line:holds:elected"] }).items[0];
  assert.equal(n.undetermined.why.key, "civil-time.end_stated", "civil-time's reason, as it answers it");
  reads(n.undetermined.why);
  /* control: no why of these reads is a string, and every key this module gives reads with its fills */
  const all = [none.why, two.why, after.why, ...after.lines.map((x) => x.why), n.undetermined.why];
  for (const x of all) assert.notEqual(typeof x, "string");
  assert.notEqual(typeof w.l.readLine({ lineId: open.line_id, viewer: ANN }).line.valid, "string");
  assert.ok(REASON_KEYS.every((k) => /^lines\.why\.[a-z_]+$/.test(k)), "each key is a lines.why.* row");
  assert.throws(() => reasonText({ key: "lines.why.lines_disagree", vars: {} }), /WORD_VAR_MISSING/, "a missing fill is refused, never blanked");
});
