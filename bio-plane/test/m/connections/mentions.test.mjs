/* connections R70 (T51; C28; K4165): a connection row read by capture lists the mentions of its entity in that document, so a
   member can name one other than the one the record chose; `connectionchoose` takes any listed mention. Driven through the
   ops map as the door calls it (the address carries the stamps, the body the fields), over a real fixture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { connectionsOps, CONNECTION_CHOICE_CHECKS } from "../../../src/connections/index.mjs";

const E = "ENT-2026-0001";
const A = "INFO-2026-0001-a", B = "INFO-2026-0002-b";

/* Two documents about E: A mentions it as "Ord. 1" at `pagesA` and as each of `extra`, B once, unplaced. */
function pair(w, { pagesA = [2, 5, null], extra = [] } = {}) {
  w.entity(E, "The Ordinance");
  const [a] = w.doc(A, ["alpha"]);
  const [b] = w.doc(B, ["beta"]);
  w.resolve(a, A, "Ord. 1", E, "A");
  w.read(a, A, "Ord. 1", pagesA);
  for (const x of extra) { w.resolve(a, A, x.ref, E, x.grade); w.read(a, A, x.ref, x.pages); }
  w.resolve(b, B, "Ord. 1", E, "A");
  w.read(b, B, "Ord. 1", [null]);
  w.k.derive({ entityId: E });
  return { a, b };
}
const door = (w, op, params, body = null) =>
  connectionsOps(w.k, new URL("http://x/?" + new URLSearchParams({ op, ...params })), body, {})[op]();
const bySha = (w, sha, viewer = V("alice")) => door(w, "connections", { sha256: sha, viewer }).connections[0];
const keysOf = (w, sha) => w.rows(`SELECT occurrence FROM reading_refs WHERE capture_sha=? ORDER BY seq`, sha).map((r) => r.occurrence);

test("R70: a row read by capture lists a name mentioned in three places, each with its reference, occurrence key, position and grade", () => {
  const w = world();
  const { a, b } = pair(w);
  const row = bySha(w, a);
  assert.equal(row.mentions.length, 3);
  assert.deepEqual(row.mentions.map((m) => m.occurrence), keysOf(w, a));
  assert.deepEqual(row.mentions.map((m) => m.ref), ["Ord. 1", "Ord. 1", "Ord. 1"]);
  assert.deepEqual(row.mentions.map((m) => m.grade), ["A", "A", "A"]);
  assert.deepEqual(row.mentions.map((m) => m.position && m.position.page), [2, 5, undefined].map((p) => (p === undefined ? null : p)));
  assert.equal(row.mentions_truncated, false);
  /* The row lists the mentions of the document asked about, not of the other end. */
  const other = bySha(w, b);
  assert.equal(other.mentions.length, 1);
  assert.equal(other.mentions[0].position, null);
  assert.equal(other.mentions[0].occurrence, "");
  /* Control: the entity arm and the content arm carry no list. */
  const byEntity = door(w, "connections", { id: E, viewer: V("alice") }).connections[0];
  assert.equal("mentions" in byEntity, false);
  assert.equal("mentions_truncated" in byEntity, false);
});

test("R70: a mention resolved with no recorded reading is listed with a null occurrence and no position", () => {
  const w = world();
  w.entity(E, "The Ordinance");
  const [a] = w.doc(A, ["alpha"]);
  const [b] = w.doc(B, ["beta"]);
  w.resolve(a, A, "Ord. 1", E, "B");
  w.resolve(b, B, "Ord. 1", E, "A");
  w.k.derive({ entityId: E });
  assert.deepEqual(bySha(w, a).mentions, [{ ref: "Ord. 1", occurrence: null, position: null, grade: "B" }]);
});

test("R70: a list cut at the bound says so; one at the bound does not", () => {
  const over = world();
  const { a } = pair(over, { pagesA: Array.from({ length: 300 }, (_, i) => i) });
  const cut = bySha(over, a);
  assert.equal(cut.mentions.length, 256);
  assert.equal(cut.mentions_truncated, true);
  const exact = world();
  const { a: a2 } = pair(exact, { pagesA: Array.from({ length: 256 }, (_, i) => i) });
  const whole = bySha(exact, a2);
  assert.equal(whole.mentions.length, 256);
  assert.equal(whole.mentions_truncated, false);
});

test("R70: connectionchoose with a listed mention's ref and occurrence writes it, the one already chosen is a no-op, and an unlisted mention is refused", () => {
  const w = world();
  const { a, b } = pair(w, { extra: [{ ref: "the Board", grade: "B", pages: [7] }] });
  const listed = bySha(w, a).mentions;
  assert.equal(listed.length, 4);
  const board = listed.find((m) => m.ref === "the Board");
  const second = listed.filter((m) => m.ref === "Ord. 1")[1];
  const choose = (m) => door(w, "connectionchoose", { author: "alice", viewer: V("alice") },
                             { capture: a, other: b, entity: E, ref: m.ref, ...(m.occurrence != null ? { occurrence: m.occurrence } : {}) });
  const first = choose(board);
  assert.equal(first.ok, true, JSON.stringify(first));
  assert.equal(first.wrote, true);
  assert.equal(first.chosen.ref, "the Board");
  assert.equal(choose(board).wrote, false, "the mention already chosen writes nothing");
  assert.equal(w.count("connection_pair_choices"), 1);
  const again = choose(second);
  assert.equal(again.wrote, true);
  assert.equal(again.chosen.occurrence, second.occurrence);
  assert.equal(again.superseded.ref, "the Board");
  const side = a < b ? "a" : "b";
  assert.equal(bySha(w, a).on_point[side].ref, "Ord. 1");
  /* Control: a mention the list does not carry is C-74.3, and writes nothing. */
  const refused = door(w, "connectionchoose", { author: "alice", viewer: V("alice") }, { capture: a, other: b, entity: E, ref: "not listed" });
  assert.equal(refused.code, "CONNECTION_CHOICE_NOT_A_MENTION");
  assert.equal(refused.check, CONNECTION_CHOICE_CHECKS.CONNECTION_CHOICE_NOT_A_MENTION.check);
  assert.equal(w.count("connection_pair_choices"), 2);
});

test("R70, R33: the list is withheld from a viewer who may not see the document, and kept for one who may", () => {
  const w = world();
  w.member("alice"); w.member("bob");
  const { a } = pair(w);
  w.st.sql.exec(`UPDATE bundles SET object_type='project' WHERE bundle_id=?`, A);
  const hidden = bySha(w, a, V("bob"));
  assert.equal(hidden.a_bundle_id === null || hidden.b_bundle_id === null, true);
  assert.equal("mentions" in hidden, false);
  assert.equal("mentions_truncated" in hidden, false);
  const seen = bySha(w, a, MACHINE);
  assert.equal(seen.mentions.length, 3);
});
