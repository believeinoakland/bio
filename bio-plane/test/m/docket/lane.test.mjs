/* docket: the docket's dates in `events`' "what we did" lane (R26; T34-45, N595), read through the real `events`
   `timeline` (its R30), which passes the reader's `viewer` to the source unchanged and carries the source's own
   `truncated`. The source fails closed: a reader who does not see the case's project in full, and a call naming no
   viewer, are answered nothing. At the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, file, post, fileAndPlace, V, CASE, SUBJECT, NOW, DAY } from "./fixture.mjs";

const A = V("alice");
const lane = (w, x = {}) => {
  const t = w.events.timeline({ set: [SUBJECT], lanes: ["ours"], viewer: A, ...x });
  assert.equal(t.ok, true, JSON.stringify(t).slice(0, 300));
  const s = t.ours.sources.find((y) => y.source === "docket");
  assert.ok(s, "the docket's lane is answered");
  assert.equal(s.error, undefined, "the source did not throw");
  return s;
};

async function withEntries() {
  const w = seeded();
  await fileAndPlace(w);                                              /* #1 response, placed 2026-10-01, received 2026-10-01 */
  w.clock.now = NOW + DAY;
  const late = file(w).entry;                                         /* filed 2026-10-02 */
  w.clock.now = NOW + 3 * DAY;
  await post(w, { kind: "response", entry: late });                   /* #2 placed 2026-10-04 */
  w.clock.now = NOW + 4 * DAY;
  await post(w, { kind: "standing-granted", edition: 1, holder: "The Tenants' Union", reason: "Named in the case." });   /* #3 */
  file(w, { proposed: "record", reason: "for us only" });             /* a record entry, never in the lane */
  return w;
}

test("R26 through events' timeline the lane shows a member's cases: each public entry's dates, as the source answers them, for a viewer who sees the project in full", async () => {
  const w = await withEntries();
  const before = w.snapshot();
  const s = lane(w);
  assert.deepEqual(w.snapshot(), before, "reading the lane writes nothing");
  const direct = w.docket.docketEvents({ set: [SUBJECT], viewer: A });
  assert.ok(direct.items.length === 5, `the source answers five items (${direct.items.length})`);
  const key = (i) => `${i.at}|${i.ref}|${i.kind}|${i.label}`;
  assert.deepEqual(s.items.map(key).sort(), direct.items.map(key).sort(), "the lane carries exactly the source's items");
  assert.deepEqual(s.items.map((i) => [i.at, i.ref, i.kind]), [
    ["2026-10-01", `${CASE}#1`, "response"], ["2026-10-01", `${CASE}#1`, "response"],
    ["2026-10-02", `${CASE}#2`, "response"], ["2026-10-04", `${CASE}#2`, "response"],
    ["2026-10-05", `${CASE}#3`, "standing-granted"]]);
  for (const i of s.items) assert.equal(i.placed_nowhere, undefined, "every item is dated");
  assert.equal(s.truncated, false);
  /* a joined member who is not the manager sees the same lane */
  assert.deepEqual(lane(w, { viewer: V("bob") }).items, s.items);
  /* the bounds pass through */
  assert.deepEqual(lane(w, { from: "2026-10-02", to: "2026-10-04" }).items.map((i) => i.at), ["2026-10-02", "2026-10-04"]);
});

test("R26 fail-closed: through events' timeline, a reader who does not see the project, and a timeline naming no viewer, get an empty docket lane", async () => {
  const w = await withEntries();
  assert.ok(lane(w).items.length > 0, "negative control: the manager's lane holds the entries");
  for (const viewer of [V("dave"), null, undefined, ""]) {
    const s = lane(w, { viewer });
    assert.deepEqual([s.items, s.truncated], [[], false], `viewer ${String(viewer)}: nothing`);
  }
  /* a member who sees another project only: dave, given a case of his own on the same subject, sees his and never P's */
  w.publish(w.Q, "CASE-2026-0909", 1, [{ id: w.F1, role: "load_bearing" }]);
  await post(w, { case: "CASE-2026-0909", kind: "standing-granted", edition: 1, holder: "A union", reason: "Named." }, "dave");
  assert.deepEqual(lane(w, { viewer: V("dave") }).items.map((i) => i.ref), ["CASE-2026-0909#1"], "his case's entry, and none of P's");
  assert.ok(!lane(w).items.some((i) => i.ref.startsWith("CASE-2026-0909")), "and alice sees none of Q's");
});

test("R26 the lane carries the source's own truncated: a source that answered truncated is truncated in the lane, at events' limit", async () => {
  const w = await withEntries();
  const two = lane(w, { limit: 2 });
  const direct = w.docket.docketEvents({ set: [SUBJECT], viewer: A, limit: 2 });
  assert.deepEqual([direct.items.length, direct.truncated], [2, true], "the source cut its own items at the limit it was given");
  assert.equal(two.items.length, 2, "the lane holds no more than the source answered");
  assert.equal(two.truncated, true, "and says it is truncated, as the source did");
  const all = lane(w, { limit: 5 });
  assert.deepEqual([all.items.length, all.truncated], [5, false], "negative control: at a limit holding every item, not truncated");
  assert.deepEqual(two.items, all.items.slice(0, 2), "the first items of the whole lane");
});
