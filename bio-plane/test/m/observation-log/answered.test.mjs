/* observation-log T41-11: authority kind `step` at the append (R1, R2) and the later-found notice `onLookAnswered`
   (R37; H39), driven at the module's interface over the real record-core, membership and provenance (fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, entry } from "./fixture.mjs";
import { OBSERVATION_AUTHORITY_KINDS, checkObservation } from "../../../src/observation-log/index.mjs";

const look = (over = {}) => entry({ authority_kind: "step", authority: "STP-2026-0001", level: "internet",
  subject_kind: "address", subject: "https://example.org/minutes", ...over });
const found = (over = {}) => look({ authority_kind: "acquire", authority: "INFO-2026-0001", level: "internet",
  state: "PRESENT", result_kind: "capture", result_ref: "c".repeat(64), ...over });

test("R1 R2 authority kind `step` is in the vocabulary with its sentence and is appended; a kind outside it is still refused C-22.9 (negative control)", () => {
  assert.match(OBSERVATION_AUTHORITY_KINDS.step, /step .* question/);
  assert.doesNotMatch(OBSERVATION_AUTHORITY_KINDS.step, /the plane|this instance|the instance|copy|server/);
  assert.equal(checkObservation(look()), null);
  const w = world();
  assert.equal(w.obs.observe(look()), null);
  assert.deepEqual(w.log().map((r) => [r.authority_kind, r.authority]), [["step", "STP-2026-0001"]]);
  for (const k of ["steps", "STEP", "stp"]) {
    const r = w.obs.observe(look({ authority_kind: k }));
    assert.equal(r.check, "C-22.9", k);
    assert.match(r.translation, /a step taken for a question/);
  }
  assert.equal(w.count("observation_log"), 1, "a refused entry writes nothing");
});

function heard(w, module = "steps") {
  const calls = [];
  const r = w.obs.onLookAnswered(module, (e) => { calls.push(e); });
  assert.deepEqual(r, { ok: true, module });
  return calls;
}

test("R37 a PRESENT at a subject and level where an earlier row stands LOOKED_ABSENT or LOOKED_INDETERMINATE calls fn({earlier, observation}) once per earlier row, oldest first; the earlier rows never change", () => {
  const w = world();
  const calls = heard(w);
  w.obs.observe(look({ state: "LOOKED_ABSENT", detail: "not posted yet" }));
  w.obs.observe(look({ state: "LOOKED_INDETERMINATE", condition: "runtime-ceiling-reached" }));
  const before = w.log();
  assert.equal(calls.length, 0, "no PRESENT yet: nothing told");
  assert.equal(w.obs.observe(found()), null);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map((c) => c.earlier.seq), before.map((r) => r.seq));
  assert.deepEqual(calls.map((c) => c.earlier.state), ["LOOKED_ABSENT", "LOOKED_INDETERMINATE"]);
  const now = w.log();
  for (const c of calls) {
    assert.deepEqual(c.observation, now[2], "the observation is the row just appended");
    assert.deepEqual(c.earlier, before.find((r) => r.seq === c.earlier.seq), "the earlier row as stored");
  }
  assert.deepEqual(now.slice(0, 2), before, "R22: the earlier rows are unchanged");
});

test("R37 negative controls: a PRESENT with no earlier absence, a partial, an absence at another level, subject or subject kind, and a refused PRESENT call nothing", () => {
  const w = world();
  const calls = heard(w);
  w.obs.observe(found());
  assert.equal(calls.length, 0, "a PRESENT with nothing before it");
  const w2 = world();
  const c2 = heard(w2);
  w2.obs.observe(look({ state: "LOOKED_ABSENT" }));
  w2.obs.observe(look({ state: "partial", result_kind: "capture", result_ref: "d".repeat(64) }));
  assert.equal(c2.length, 0, "partial answers nothing");
  w2.obs.observe(found({ level: "document" }));
  w2.obs.observe(found({ subject: "https://example.org/other" }));
  w2.obs.observe(found({ subject_kind: "description" }));
  assert.equal(c2.length, 0, "another level, subject or subject kind");
  assert.equal(w2.obs.observe(found({ result_ref: null })).check, "C-22.10");
  assert.equal(w2.obs.observe(found({ authority_kind: "gremlin" })).check, "C-22.9");
  assert.equal(c2.length, 0, "a refused PRESENT is no observation");
  w2.obs.observe(found());
  assert.equal(c2.length, 1, "the matching PRESENT does");
  // a row with no subject has no subject: it calls nothing, and an absence with no subject is answered by nothing
  const w3 = world();
  const c3 = heard(w3);
  w3.obs.observe(look({ state: "LOOKED_ABSENT", subject: null }));
  assert.equal(w3.obs.observe(found({ subject: null })), null);
  assert.equal(c3.length, 0, "no subject: nothing told");
  assert.equal(w3.count("observation_log"), 2);
});

test("R37 an absence a PRESENT already answered is not told again; a new absence after it is told to the next PRESENT, alone", () => {
  const w = world();
  const calls = heard(w);
  w.obs.observe(look({ state: "LOOKED_ABSENT" }));
  w.obs.observe(found());
  w.obs.observe(found());
  assert.equal(calls.length, 1, "the second PRESENT tells nothing new");
  w.obs.observe(look({ state: "LOOKED_INDETERMINATE" }));
  w.obs.observe(found());
  assert.equal(calls.length, 2);
  assert.equal(calls[1].earlier.state, "LOOKED_INDETERMINATE");
  assert.ok(calls[1].earlier.seq > calls[0].observation.seq);
});

test("R37 fn runs in the append's transaction: it reads the new row; a throw rolls back the row and fn's own writes and reaches the writer; a listener's answer is ignored", () => {
  const w = world();
  w.st.db.exec(`CREATE TABLE heard (seq INTEGER)`);
  let saw = null, boom = false;
  w.obs.onLookAnswered("steps", ({ observation }) => {
    saw = w.row(`SELECT state FROM observation_log WHERE seq = ?`, observation.seq);
    w.st.sql.exec(`INSERT INTO heard (seq) VALUES (?)`, observation.seq);
    if (boom) throw new Error("listener failed");
    return { ok: false, reason: "IGNORED" };
  });
  w.obs.observe(look({ state: "LOOKED_ABSENT" }));
  assert.equal(w.obs.observe(found()), null, "a listener's refusal-shaped answer is not the append's");
  assert.deepEqual(saw, { state: "PRESENT" });
  assert.equal(w.count("heard"), 1);
  boom = true;
  w.obs.observe(look({ state: "LOOKED_ABSENT" }));
  const n = w.count("observation_log");
  assert.throws(() => w.obs.observe(found()), /listener failed/);
  assert.equal(w.count("observation_log"), n, "the PRESENT row was rolled back");
  assert.equal(w.count("heard"), 1, "and the listener's own write with it");
  // inside a caller's transaction the append joins it: the caller's rollback takes both
  boom = false;
  assert.throws(() => w.record.transact(() => { w.obs.observe(found()); throw new Error("caller"); }), /caller/);
  assert.equal(w.count("observation_log"), n);
  assert.equal(w.count("heard"), 1);
});

test("R37 one registration per module through membership's listenerRefusal; listeners run in MODULE_ORDER; with none registered the append is unchanged", () => {
  const w = world();
  const order = [];
  assert.deepEqual(w.obs.onLookAnswered("notice-producers", () => order.push("notice-producers")), { ok: true, module: "notice-producers" });
  assert.deepEqual(w.obs.onLookAnswered("steps", () => order.push("steps")), { ok: true, module: "steps" });
  const again = w.obs.onLookAnswered("steps", () => {});
  assert.deepEqual([again.ok, again.code, again.module], [false, "LISTENER_DECLARED", "steps"]);
  for (const [m, fn] of [["", () => {}], [null, () => {}], ["x", null], ["x", "fn"]]) {
    const r = w.obs.onLookAnswered(m, fn);
    assert.deepEqual([r.ok, r.code], [false, "LISTENER_MALFORMED"], String(m));
  }
  w.obs.observe(look({ state: "LOOKED_ABSENT" }));
  w.obs.observe(found());
  assert.deepEqual(order, ["steps", "notice-producers"], "steps precedes notice-producers in the modules' order");
  // negative control: a world with no listener appends the same rows
  const bare = world();
  bare.obs.observe(look({ state: "LOOKED_ABSENT" }));
  assert.equal(bare.obs.observe(found()), null);
  assert.deepEqual(bare.log().map((r) => r.state), ["LOOKED_ABSENT", "PRESENT"]);
});
