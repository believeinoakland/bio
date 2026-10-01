/* connections: the `refs` figure source (R61; K882, N454), exported for plane's own stats sight and registered nowhere.
   Driven at the interface: `REFS_COUNT_KEYS` and the instance's `refsCounts(hid)`, with `hid` as membership's
   `hiddenBundles` hands it, on this module's fixture: edges written by promotion (R19), a project hidden from a member. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import { hiddenBundles } from "../../../src/membership/index.mjs";
import { REFS_COUNT_KEYS, CONNECTIONS_COUNT_KEYS } from "../../../src/connections/index.mjs";

const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b", C = "INFO-2026-0003-c";

/* A cites B; B cites the hidden project P and relates to A; C cites A and a target no bundle holds; one edge out of P
   (written as the projection would for a project's own references); one edge whose keys name no bundle (''). */
function populated() {
  const w = world();
  w.member("alice"); w.member("bob");
  const P = w.project("Alice's work", "alice");
  w.doc(A, ["a"], { references: [{ target: B }] });
  w.doc(B, ["b"], { references: [{ target: P }, { target: A, rel: "relates_to" }] });
  w.doc(C, ["c"], { references: [{ target: A }, { target: "INFO-2026-0999-z" }] });
  w.st.sql.exec(`INSERT INTO refs (bundle_id, target_id, kind) VALUES (?, ?, 'cites')`, P, A);
  w.st.sql.exec(`INSERT INTO refs (bundle_id, target_id, kind) VALUES ('', '', '')`);
  return { w, P };
}

/* The oracle: the rows of `refs` neither of whose keys is in `hidden`, counted in JS off the rows themselves. */
const expected = (w, hidden) =>
  w.rows(`SELECT bundle_id, target_id FROM refs`).filter((r) => !hidden.has(r.bundle_id) && !hidden.has(r.target_id)).length;
const hidOf = (...ids) => ({ sql: `(${ids.map(() => "?").join(", ")})`, args: ids });

test("R61: the figure source is shaped as record-core R63's counts(hid) — its key list is ['refs'], and it answers exactly those keys, a number each", () => {
  const { w } = populated();
  assert.deepEqual([...REFS_COUNT_KEYS], ["refs"]);
  assert.ok(Object.isFrozen(REFS_COUNT_KEYS));
  for (const hid of [null, hidOf(A), hiddenBundles(V("bob"))]) {
    const got = w.k.refsCounts(hid);
    assert.deepEqual(Object.keys(got), [...REFS_COUNT_KEYS]);
    assert.equal(typeof got.refs, "number");
  }
});

test("R61: a viewer never sent (null hid) counts refs whole", () => {
  const { w } = populated();
  assert.equal(w.count("refs"), 7);
  assert.deepEqual(w.k.refsCounts(null), { refs: 7 });
  assert.deepEqual(w.k.refsCounts(), { refs: 7 });
});

test("R61: through a viewer's sight, a hidden project's refs are left out on either key — cited by a visible bundle, or citing — and nothing else is", () => {
  const { w, P } = populated();
  /* bob may not see alice's project: B → P and P → A go, the other five stay. */
  const bob = hiddenBundles(V("bob"));
  assert.ok(bob, "bob's sight hides something");
  assert.deepEqual(w.k.refsCounts(bob), { refs: 5 });
  assert.equal(w.k.refsCounts(bob).refs, expected(w, new Set([P])));
  /* alice, the owner, sees everything: whole. */
  assert.deepEqual(w.k.refsCounts(hiddenBundles(V("alice"))), { refs: 7 });
  /* A member who has joined nothing is hidden the project alone, as bob is. */
  assert.deepEqual(w.k.refsCounts(hiddenBundles("member:nobody")), { refs: 5 });
  /* A viewer sent but not recognised (an empty stamp) fails closed: every held bundle hidden; only the edge naming no
     bundle stays (C's edge to a target no bundle holds still names C). */
  assert.deepEqual(w.k.refsCounts(hiddenBundles("")), { refs: expected(w, new Set([A, B, C, P])) });
  assert.equal(w.k.refsCounts(hiddenBundles("")).refs, 1);
  /* Every subset of the held bundles, as an explicit list: the figure is the oracle's on each. */
  const ids = [A, B, C, P];
  for (let m = 0; m < 1 << ids.length; m++) {
    const hidden = ids.filter((_, i) => m & (1 << i));
    if (!hidden.length) continue;
    assert.equal(w.k.refsCounts(hidOf(...hidden)).refs, expected(w, new Set(hidden)), hidden.join(","));
  }
});

test("R61: a key naming no bundle is never dropped by hid — the empty key, as `COALESCE(k, '')` reads a NULL one — and refs' keys are NOT NULL, so no stored row has a NULL key to drop", () => {
  const { w } = populated();
  const cols = Object.fromEntries(w.rows(`PRAGMA table_info(refs)`).map((c) => [c.name, c.notnull]));
  assert.deepEqual([cols.bundle_id, cols.target_id], [1, 1]);
  assert.throws(() => w.st.sql.exec(`INSERT INTO refs (bundle_id, target_id, kind) VALUES (NULL, ?, 'cites')`, A));
  assert.throws(() => w.st.sql.exec(`INSERT INTO refs (bundle_id, target_id, kind) VALUES (?, NULL, 'cites')`, A));
  /* Every held bundle hidden, with the empty string itself not in the list: the '' edge is counted. */
  assert.equal(w.k.refsCounts(hidOf(A, B, C, "PRJ-none")).refs, 1);
  /* A hid naming nothing held is a whole count. */
  assert.deepEqual(w.k.refsCounts(hidOf("INFO-2026-0888-y")), { refs: 7 });
});

test("R61: the module registers nothing new — record-core's figures carry R60's five keys and no refs from this module, and the source is synchronous and writes nothing", () => {
  const { w } = populated();
  const whole = w.record.counts(null);
  for (const key of CONNECTIONS_COUNT_KEYS) assert.equal(typeof whole[key], "number", key);
  assert.equal(w.record.registerCounts("connections", ["refs"], () => ({ refs: 0 })).reason, "COUNTS_DECLARED",
               "connections holds its one registration");
  const before = w.snapshot();
  const got = w.k.refsCounts(hiddenBundles(V("bob")));
  assert.equal(typeof got.then, "undefined");
  w.k.refsCounts(null);
  assert.deepEqual(w.snapshot(), before);
});
