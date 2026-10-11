/* actions' T22 entry at its interface, re-pointed in T42 (N826): R55, the litigation-hold reader registered once at start
   with the real `doorbell` (its R3; DEC-108, K1023), no longer `capture`, proved through doorbell's own
   `mayClearDiscarded`, on one host. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { actionsOf } from "../../../src/actions/index.mjs";
import { doorbellOf } from "../../../src/doorbell/index.mjs";

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
  return { w, doorbell: doorbellOf(w.host) };
}
const hold = (w, target, ord, h, author = M) => assert.equal((h === "released"
  ? w.a.actionHoldRelease({ target, ord, reason: `stated ${h}`, viewer: author, author })
  : w.a.actionHold({ target, ord, hold: h, reason: `stated ${h}`, viewer: author, author })).ok, true);
/* Everything the reader could write: the hold table, the marks, every action's bytes, and the record's manifest. */
const state = (w) => JSON.stringify([
  ...["action_holds", "action_pressure", "manifest", "bundles"].map((t) => w.rows(`SELECT * FROM ${t} ORDER BY rowid`)),
  w.text(A), w.text(B)]);

test("R55 doorbell asks actions' reader: no hold, may clear; an entry whose latest statement is in_place, may not, whatever the viewer or project; released, may again", () => {
  const { w, doorbell } = ground();
  const ask = () => doorbell.mayClearDiscarded();
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

test("R55 a reader whose read fails answers true, so doorbell may not clear; the reader writes nothing and never throws", () => {
  const { w, doorbell } = ground();
  assert.equal(doorbell.mayClearDiscarded().may, true);
  /* the hold table made unreadable: the read fails, the reader answers true and does not throw */
  w.st.db.exec(`ALTER TABLE action_holds RENAME TO action_holds_away`);
  assert.doesNotThrow(() => w.a.holdInPlace());
  assert.equal(w.a.holdInPlace(), true);
  const failed = doorbell.mayClearDiscarded();
  assert.deepEqual([failed.may, failed.basis], [false, "actions reports a litigation hold in place"]);
  w.st.db.exec(`ALTER TABLE action_holds_away RENAME TO action_holds`);
  assert.equal(doorbell.mayClearDiscarded().may, true, "readable again: no hold");
  /* writes nothing, held or not */
  const before = state(w);
  for (let i = 0; i < 3; i++) { doorbell.mayClearDiscarded(); w.a.holdInPlace(); }
  assert.equal(state(w), before);
  hold(w, A, 0, "in_place");
  const held = state(w);
  for (let i = 0; i < 3; i++) assert.equal(doorbell.mayClearDiscarded().may, false);
  assert.equal(state(w), held, "the hold table and every action unchanged");
});

test("R55 registered once per host: a second actionsOf registers nothing, and doorbell holds the one reader, actions'", () => {
  const { w, doorbell } = ground();
  const calls = [];
  const register = doorbell.registerReader.bind(doorbell);
  doorbell.registerReader = (...x) => { calls.push(x); return register(...x); };
  try {
    assert.equal(actionsOf(w.host), w.a, "the one instance per host");
    assert.equal(actionsOf(w.host, { doorbell }), w.a);
    assert.deepEqual(calls, [], "a second actionsOf registers nothing");
  } finally { doorbell.registerReader = register; }
  /* doorbell holds actions' reader and takes no other in its slot */
  const other = doorbell.registerReader("litigation-hold", "monitoring", () => false);
  assert.deepEqual([other.ok, other.reason, other.module], [false, "LISTENER_DECLARED", "actions"]);
  hold(w, A, 0, "in_place");
  assert.equal(doorbell.mayClearDiscarded().may, false, "still actions' reader that answers");
});

test("R55 (T42) the reader is registered with doorbell: doorbell asks it; a doorbell no actions registered with holds none and answers fail-closed", () => {
  const { w, doorbell } = ground();
  /* the registration went to doorbell: with no hold in place, doorbell may clear and names actions as its reader */
  assert.deepEqual([doorbell.mayClearDiscarded().may, doorbell.mayClearDiscarded().basis],
                   [true, "actions reports no litigation hold in place"]);
  hold(w, A, 0, "in_place");
  assert.equal(doorbell.mayClearDiscarded().may, false, "doorbell asks actions' reader");
  hold(w, A, 0, "released");
  assert.equal(doorbell.mayClearDiscarded().may, true);
  /* negative control: an actions instance told `doorbell: null` registers nothing, so a fresh world's doorbell holds none */
  const bare = world({ deps: { doorbell: null } });
  const empty = doorbellOf(bare.host).mayClearDiscarded();
  assert.deepEqual([empty.may, empty.basis], [false, "no reader of litigation holds is registered, so a hold cannot be ruled out"]);
});

test("R55 R60 the whole-store purge answers exactly as the litigation-hold reader, in every hold state and when the holds cannot be read", () => {
  const { w, doorbell } = ground();
  const agree = (want, why) => {
    assert.equal(w.a.holdInPlace(), want, why);
    assert.equal(w.a.purgeHeld(), want, why);
    assert.equal(w.a.purgeHeld({ bundleId: "" }), want, why);
    assert.equal(doorbell.mayClearDiscarded().may, !want, why);
  };
  agree(false, "no hold");
  hold(w, A, 0, "in_place");
  agree(true, "one in place");
  hold(w, B, 0, "in_place", V("carol"));
  hold(w, A, 0, "released");
  agree(true, "B still in place");
  hold(w, B, 0, "released", V("carol"));
  agree(false, "every hold released");
  /* negative control: unreadable holds answer true on both sides, never false */
  w.st.db.exec(`ALTER TABLE action_holds RENAME TO action_holds_away`);
  agree(true, "unreadable");
  w.st.db.exec(`ALTER TABLE action_holds_away RENAME TO action_holds`);
  agree(false, "readable again");
});
