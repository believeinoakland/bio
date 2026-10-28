/* observation-log: a run's reads and disagreements as data (R40, R41; T53, N1219). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, entry, V } from "./fixture.mjs";
import { AI_RUN_CHECKS, OBSERVATION_LEVELS } from "../../../src/observation-log/index.mjs";

const run = (over = {}) => entry({ authority_kind: "run", authority: "RUN-1", level: "document", subject_kind: "unstated",
                                   subject: null, state: "LOOKED_INDETERMINATE", ...over });
const READ = { record: "r1", n: 2, total: 3, outcome: "answered" };
const DISAGREE = { record: "r1", levels: ["document", "content"] };
const code = (r) => (r ? [r.code, r.check] : null);
const MALFORMED = ["OBSERVATION_FIELD_MALFORMED", "C-22.32"];
const NOT_ALLOWED = ["OBSERVATION_FIELD_NOT_ALLOWED", "C-22.33"];

test("R40 a run's entry with a read is appended and served by every reader of the row with that field exactly and disagree null", () => {
  const w = world();
  assert.equal(w.obs.observe(run({ read: READ })), null);
  const [row] = w.obs.byAuthority("run", "RUN-1");
  assert.deepEqual([row.read, row.disagree], [READ, null]);
  assert.deepEqual(Object.keys(row.read), ["record", "n", "total", "outcome"]);
  const [seen] = w.obs.latest("document");
  assert.deepEqual([seen.read, seen.disagree], [READ, null]);
  assert.equal(w.row(`SELECT detail FROM observation_log WHERE seq = 1`).detail, null, "the fields change no detail");
});

test("R40 a disagreement is appended and read back with its levels in the order named, and a step's entry may carry either", () => {
  const w = world();
  assert.equal(w.obs.observe(run({ disagree: DISAGREE })), null);
  assert.equal(w.obs.observe(run({ authority_kind: "step", authority: "STEP-1", disagree: { record: "r2", levels: ["meaning", "internet", "content"] } })), null);
  assert.equal(w.obs.observe(run({ authority_kind: "step", authority: "STEP-1", read: { ...READ, outcome: "refused" } })), null);
  const [d] = w.obs.byAuthority("run", "RUN-1");
  assert.deepEqual([d.read, d.disagree], [null, DISAGREE]);
  const [a, b] = w.obs.byAuthority("step", "STEP-1");
  assert.deepEqual(a.disagree.levels, ["meaning", "internet", "content"]);
  assert.equal(b.read.outcome, "refused");
});

test("R40 the camelCase spelling of an entry is read too, and the fields are exported with the row (a column each)", () => {
  const w = world();
  assert.equal(w.obs.observe({ ...run(), authorityKind: "run", read: READ }), null);
  assert.deepEqual(JSON.parse(w.row(`SELECT read FROM observation_log WHERE seq = 1`).read), READ);
});

test("R40 control: a field of another shape is OBSERVATION_FIELD_MALFORMED naming the field, nothing written", () => {
  const w = world();
  const bad = [
    ["read", { ...READ, n: 4 }], ["read", { ...READ, total: 0, n: 0 }], ["read", { ...READ, n: 1.5 }], ["read", { ...READ, n: "2" }],
    ["read", { ...READ, outcome: "maybe" }], ["read", { ...READ, record: "" }], ["read", { ...READ, record: 7 }],
    ["read", { record: "r1", n: 1, total: 1 }], ["read", { ...READ, extra: true }], ["read", "r1"], ["read", [READ]],
    ["disagree", { record: "r1", levels: ["document"] }], ["disagree", { record: "r1", levels: ["document", "document"] }],
    ["disagree", { record: "r1", levels: ["document", "nowhere"] }], ["disagree", { record: "", levels: ["document", "content"] }],
    ["disagree", { record: "r1", levels: "document,content" }], ["disagree", { levels: ["document", "content"] }],
    ["disagree", { ...DISAGREE, extra: 1 }], ["disagree", 3],
  ];
  for (const [field, value] of bad) {
    const r = w.obs.observe(run({ [field]: value }));
    assert.deepEqual(code(r), MALFORMED, JSON.stringify([field, value]));
    assert.equal(r.field, field);
    assert.equal(r.translation, AI_RUN_CHECKS.OBSERVATION_FIELD_MALFORMED.translation);
  }
  assert.equal(w.count("observation_log"), 0);
  assert.deepEqual(Object.keys(OBSERVATION_LEVELS).sort(), ["content", "document", "internet", "meaning"]);
});

test("R40 control: both fields on one entry, or either on another authority kind, is OBSERVATION_FIELD_NOT_ALLOWED, nothing written", () => {
  const w = world();
  assert.deepEqual(code(w.obs.observe(run({ read: READ, disagree: DISAGREE }))), NOT_ALLOWED);
  for (const kind of ["sweep", "link", "ratify", "acquire", "extract", "derive", "lead", "objective"]) {
    for (const f of [{ read: READ }, { disagree: DISAGREE }]) {
      const r = w.obs.observe(run({ authority_kind: kind, ...f }));
      assert.deepEqual(code(r), NOT_ALLOWED, `${kind} ${Object.keys(f)}`);
      assert.equal(r.field, Object.keys(f)[0]);
    }
  }
  // the shape is asked before the allowance
  assert.deepEqual(code(w.obs.observe(run({ authority_kind: "sweep", read: { ...READ, n: 9 } }))), MALFORMED);
  // an earlier refusal in R2's order still wins
  assert.deepEqual(code(w.obs.observe(run({ state: "MAYBE", read: { ...READ, n: 9 } }))), ["AI_LOG_STATE_UNKNOWN", "C-22.1"]);
  assert.deepEqual(code(w.obs.observe(run({ condition: "no-such", read: { ...READ, n: 9 } }))), ["AI_RUN_CONDITION_UNKNOWN", "C-22.4"]);
  assert.equal(w.count("observation_log"), 0);
});

test("R40 a null field is an absent one, and a row with neither reads both as null; a store made before T53 gains the columns", () => {
  const w = world();
  assert.equal(w.obs.observe(run({ read: null, disagree: null, detail: "kept as written" })), null);
  assert.equal(w.obs.observe(run({ authority_kind: "sweep", authority: "S-1", read: null })), null);
  const [row] = w.obs.byAuthority("run", "RUN-1");
  assert.deepEqual([row.read, row.disagree, row.detail], [null, null, "kept as written"]);
  assert.deepEqual(w.obs.contentRows("none"), { extraction: null, index: null });
  // an observation_log as it stood before T53
  const old = world();
  old.st.db.exec(`DROP TABLE observation_log`);
  old.st.db.exec(`CREATE TABLE observation_log (seq INTEGER PRIMARY KEY, at TEXT NOT NULL, actor_class TEXT NOT NULL, actor TEXT,
    authority_kind TEXT NOT NULL, authority TEXT, level TEXT NOT NULL, subject_kind TEXT NOT NULL, subject TEXT, state TEXT NOT NULL,
    governed INTEGER NOT NULL DEFAULT 0, condition TEXT, bound TEXT, terminal INTEGER NOT NULL DEFAULT 0, result_kind TEXT,
    result_ref TEXT, detail TEXT)`);
  old.st.db.exec(`INSERT INTO observation_log (at, actor_class, authority_kind, authority, level, subject_kind, state)
                  VALUES ('t', 'plane', 'run', 'RUN-1', 'document', 'unstated', 'LOOKED_ABSENT')`);
  old.obs.migrate();
  old.obs.migrate();
  const [was] = old.obs.byAuthority("run", "RUN-1");
  assert.deepEqual([was.read, was.disagree], [null, null]);
  assert.equal(old.obs.observe(run({ read: READ })), null);
  assert.deepEqual(old.obs.byAuthority("run", "RUN-1")[1].read, READ);
});

test("R37 the rows handed to a later-found listener carry the fields too", () => {
  const w = world();
  const told = [];
  w.obs.onLookAnswered("ai-runs", (e) => told.push(e));
  const at = { subject_kind: "address", subject: "https://example.org/a" };
  assert.equal(w.obs.observe(run({ ...at, read: READ })), null);
  assert.equal(w.obs.observe(run({ ...at, state: "PRESENT", result_kind: "capture", result_ref: "c" })), null);
  assert.equal(told.length, 1);
  assert.deepEqual([told[0].earlier.read, told[0].observation.read], [READ, null]);
});

test("R41 the fields have no sight of their own: a viewer of the run reads the row's read; a viewer outside the run's sight reads no row and so no record id", () => {
  const w = world();
  w.obs.registerAuthority("run", (id, viewer) => viewer === V("inner"));
  assert.equal(w.obs.observe(run({ read: { ...READ, record: "secret-record" } })), null);
  const [row] = w.obs.byAuthority("run", "RUN-1");
  assert.equal(w.obs.rowVisible(row, V("inner")), true);
  assert.deepEqual(row.read, { ...READ, record: "secret-record" });
  assert.equal(w.obs.rowVisible(row, V("outer")), false);
  const gate = w.obs.rowGate(V("outer"));
  assert.deepEqual(w.obs.byAuthority("run", "RUN-1").filter(gate), [], "no row, so no record id, reaches her");
  assert.deepEqual(w.obs.latest("document").filter(gate), []);
  // a row that names no record is as visible as before; the fields neither widen nor narrow the sight
  assert.equal(w.obs.rowVisible({ ...row, read: null }, V("outer")), false);
  assert.equal(w.obs.rowVisible({ ...row, read: null }, V("inner")), true);
});
