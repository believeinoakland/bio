/* actions' T22 entry at its interface: R55, the litigation-hold reader registered once at start with the real `capture`
   (its R32; DEC-108, K1023), proved through capture's own `mayClearDiscarded`, on one host. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { actionsOf } from "../../../src/actions/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b";
const M = V("alice");
const D = "CONF-2026-0001-determination";
const received = (n) => ["correspondence:", ...Array.from({ length: n }, (_, i) =>
  ["  - direction: received", "    at: 2026-09-03", `    account: "reply ${i}"`, "    author: member:alice"]).flat()];

/* A world whose action A rests on a determination in a project and B on none; each holds two received entries, A's both
   marked legal pressure and B's first. */
function ground() {
  const conf = { determinationRead: ({ id }) => (id === D ? { ok: true, id: D, live: true, superseded_by: null, project: "PROJ-2026-0001-p" }
                                                           : { ok: false }) };
  const w = world({ conformance: conf });
  assert.equal(w.promote(D, ["---", `id: ${D}`, "object_type: determination", `title: ${D}`, "current_state: recorded",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"),
    { extra: { replay: true } }).ok, true);
  w.action(A, [...received(2), "action_basis:", `  - target: ${D}`, "    kind: rests_on"]);
  w.action(B, received(2));
  for (const [id, ord, kind] of [[A, 0, "legal"], [A, 1, "legal"], [B, 0, "legal"], [B, 1, "retaliation"]])
    assert.equal(w.a.actionPressure({ target: id, ord, pressure: { kind, note: `${kind} ${ord}` }, viewer: M, author: M }).ok, true);
  return { w, capture: captureOf(w.host) };
}
const hold = (w, target, ord, h, author = M) => assert.equal((h === "released"
  ? w.a.actionHoldRelease({ target, ord, reason: `stated ${h}`, viewer: author, author })
  : w.a.actionHold({ target, ord, hold: h, reason: `stated ${h}`, viewer: author, author })).ok, true);
/* Everything the reader could write: the hold table, the marks, every action's bytes, and the record's manifest. */
const state = (w) => JSON.stringify([
  ...["action_holds", "action_pressure", "manifest", "bundles"].map((t) => w.rows(`SELECT * FROM ${t} ORDER BY rowid`)),
  w.text(A), w.text(B)]);

test("R55 capture asks actions' reader: no hold, may clear; an entry whose latest statement is in_place, may not, whatever the viewer or project; released, may again", () => {
  const { w, capture } = ground();
  const ask = () => capture.mayClearDiscarded();
  /* before any hold: a legal mark alone is no hold */
  const none = ask();
  assert.equal(none.may, true);
  assert.match(none.basis, /^actions reports no litigation hold in place/, "the reader is actions'");
  assert.equal(w.a.holdInPlace(), false);
  /* a hold in place on A's entry 0: A is in a project, and no viewer is asked (one who sees nothing still holds it) */
  hold(w, A, 0, "in_place");
  assert.equal(w.a.holdsDue({ viewer: M }).items.find((x) => x.action === B).project, null, "B rests in no project");
  assert.equal(w.a.actionRead({ id: A, viewer: "nobody" }).reason, "NO_SUCH_BUNDLE", "invisible to this viewer");
  const held = ask();
  assert.deepEqual([held.may, held.basis], [false, "actions reports a litigation hold in place"]);
  assert.equal(w.a.holdInPlace(), true);
  /* a second entry in place, then the first released: the other still in place keeps it held */
  hold(w, A, 1, "in_place", V("bob"));
  hold(w, A, 0, "released");
  assert.equal(ask().may, false, "A's entry 1 is still in place");
  hold(w, A, 1, "released", V("bob"));
  assert.equal(ask().may, true, "every entry's latest statement is released");
  /* B, in no project, stated by another member: held, then released; an earlier in_place never outweighs a later released */
  hold(w, B, 0, "in_place", V("carol"));
  assert.equal(ask().may, false, "an action in no project holds as well");
  hold(w, B, 0, "released", V("carol"));
  assert.equal(ask().may, true);
  /* released then in place again: the latest statement decides */
  hold(w, A, 0, "in_place");
  assert.deepEqual([ask().may, w.a.holdInPlace()], [false, true]);
});

test("R55 a reader whose read fails answers true, so capture may not clear; the reader writes nothing and never throws", () => {
  const { w, capture } = ground();
  assert.equal(capture.mayClearDiscarded().may, true);
  /* the hold table made unreadable: the read fails, the reader answers true and does not throw */
  w.st.db.exec(`ALTER TABLE action_holds RENAME TO action_holds_away`);
  assert.doesNotThrow(() => w.a.holdInPlace());
  assert.equal(w.a.holdInPlace(), true);
  const failed = capture.mayClearDiscarded();
  assert.deepEqual([failed.may, failed.basis], [false, "actions reports a litigation hold in place"]);
  w.st.db.exec(`ALTER TABLE action_holds_away RENAME TO action_holds`);
  assert.equal(capture.mayClearDiscarded().may, true, "readable again: no hold");
  /* writes nothing, held or not */
  const before = state(w);
  for (let i = 0; i < 3; i++) { capture.mayClearDiscarded(); w.a.holdInPlace(); }
  assert.equal(state(w), before);
  hold(w, A, 0, "in_place");
  const held = state(w);
  for (let i = 0; i < 3; i++) assert.equal(capture.mayClearDiscarded().may, false);
  assert.equal(state(w), held, "the hold table and every action unchanged");
});

test("R55 registered once per host: a second actionsOf registers nothing, and capture holds the one reader, actions'", () => {
  const { w, capture } = ground();
  const calls = [];
  const register = capture.registerReader.bind(capture);
  capture.registerReader = (...x) => { calls.push(x); return register(...x); };
  try {
    assert.equal(actionsOf(w.host), w.a, "the one instance per host");
    assert.equal(actionsOf(w.host, { capture }), w.a);
    assert.deepEqual(calls, [], "a second actionsOf registers nothing");
  } finally { capture.registerReader = register; }
  /* capture holds actions' reader and takes no other in its slot */
  const other = capture.registerReader("litigation-hold", "monitoring", () => false);
  assert.deepEqual([other.ok, other.reason, other.module], [false, "LISTENER_DECLARED", "actions"]);
  hold(w, A, 0, "in_place");
  assert.equal(capture.mayClearDiscarded().may, false, "still actions' reader that answers");
});
