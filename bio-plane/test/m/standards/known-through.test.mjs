/* standards: R7 and R20's `known_through` (fix round 10, K5178; SCREENS-INVESTIGATE #16 J28 (2)). Where an answer rests on a
   member's "known in force through" record (R50), the answer carries the record's own fields beside `why`, so a screen
   draws the member by name and the source by its document. Driven at the module's interface over the test profile. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, REASON } from "./fixture.mjs";
import { standardsOps } from "../../../src/standards/index.mjs";

const PAGE0 = { kind: "pdf-page", page: 0 };
const checkedSource = (w, name = "portal") => w.passage(name, { address: `https://ex.org/${name}`, retrieved: "2026-09-01T18:00:00Z" });
const through = (w, standard, day, src) =>
  w.s.inForceThroughRecord({ standard, through: day, source: { captureSha: src.capSha, extent: PAGE0 }, reason: REASON,
                             author: V("bob"), viewer: V("bob") });
const door = (w, id, date) =>
  standardsOps(w.s, new URL(`https://plane.test/?id=${id}&date=${date}&viewer=${encodeURIComponent(V("carol"))}`), {}).standardinforce();

test("R7 R20 standardinforce and inForceAt carry known_through {through, source: {captureSha, extent}, by} beside an unchanged why where the answer rests on a record made by the real act; a state resting on no R50 record carries none", () => {
  const w = seeded();
  const src = checkedSource(w);
  const s = w.declare({ period: { from: "2020-01-01", to: null } }).id;
  const at = (d, id = s) => w.s.inForceAt({ standard: id, date: d, viewer: V("carol") });
  assert.equal(door(w, s, "2026-09-01").known_through, undefined, "control: no record yet, none carried");
  const rec = through(w, s, "2026-09-01", src);
  assert.equal(rec.ok, true, JSON.stringify(rec).slice(0, 300));
  const want = { through: "2026-09-01", source: { captureSha: src.capSha, extent: PAGE0 }, by: V("bob") };
  const alias = door(w, s, "2026-09-01");
  assert.equal(alias.state, "in_force");
  assert.deepEqual(alias.known_through, want, "R7's alias");
  assert.deepEqual(at("2026-09-01").known_through, want, "R20's inForceAt");
  assert.deepEqual(w.s.inForce(s, "2026-09-01").known_through, want);
  assert.equal(alias.why, at("2026-09-01").why, "why is unchanged and the same");
  assert.match(alias.why, /Known to be in force through 2026-09-01/);
  /* by the key, too: the one version covering the date */
  /* controls: a date the record does not decide rests on no record */
  assert.equal(at("2026-09-02").state, "undetermined");
  assert.equal(at("2026-09-02").known_through, undefined, "the day after through");
  assert.equal(door(w, s, "2026-09-02").known_through, undefined);
  /* a stated end decides; the record is not what the state rests on */
  const ended = w.declare({ period: { from: "2020-01-01", to: "2025-12-31" } }).id;
  through(w, ended, "2025-06-01", src);
  assert.equal(at("2025-06-01", ended).state, "in_force");
  assert.equal(at("2025-06-01", ended).known_through, undefined, "a stated end decides, the state rests on the period");
  assert.equal(at("2026-01-01", ended).known_through, undefined);
  /* a withdrawn record rests nothing */
  w.s.inForceThroughWithdraw({ record: rec.record.id, reason: REASON, author: V("bob") });
  assert.equal(door(w, s, "2026-09-01").known_through, undefined);
  assert.equal(door(w, s, "2026-09-01").state, "undetermined");
});

test("R7 R20 known_through is carried only while the answer is in_force: codifier lag and an override that move the state off in_force leave none", () => {
  const w = seeded();
  const src = checkedSource(w);
  const lag = w.declare({ period: { from: "2020-01-01", to: null }, copy: "codifier", current_through: { date: "2026-03-01", basis: src.contentId } });
  assert.equal(lag.ok, true, JSON.stringify(lag).slice(0, 300));
  {
    through(w, lag.id, "2026-09-01", src);
    const r = w.s.inForceAt({ standard: lag.id, date: "2026-09-01", viewer: V("carol") });
    assert.equal(r.state, "undetermined", "codifier lag decides first");
    assert.equal(r.known_through, undefined);
  }
});
