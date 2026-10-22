/* R27 (proposed, G2, K4562): a large capture's background fetch, once delivered, is told once to the member who asked.
   `capture`'s `fetch_done` record is read through a stand-in `capture` in the shape the QUESTION J2 publishes
   (`fetchesDone({since, after, limit, viewer}) → {ok, done, cursor, truncated}`); the seam test over the real capture
   waits for capture's merge and stays red by name below. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, pdf } from "../file-safety/fixture.mjs";
import { fresh, reader, ofKind } from "./fixture.mjs";
import { NOTICE_KINDS, FETCH_DONE_MAX, FETCH_DONE_DAYS } from "../../../src/notice-producers/index.mjs";

const KIND = "fetch-done";
const rec = (session, opener, over = {}) => ({ session, document: `INFO-${session}`, opener, project: "PROJ-1", at: "2026-10-20T10:00:00Z", ...over });

function setup(records, over = {}) {
  const w = world({});
  w.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);
  const asked = [];
  const capture = over.capture ?? {
    fetchesDone: (a) => { asked.push(a); return { ok: true, done: records, cursor: null, truncated: false }; },
  };
  const n = fresh(w.host, { membership: w.membership, capture });
  const { read } = reader(n);
  const items = (member) => ofKind(read(member, { now: Date.parse("2026-10-21T00:00:00Z") }), KIND);
  return { w, items, read, asked };
}

test("R27: with a fetch_done record the producer cycle makes exactly one notice for the opener, and a second cycle makes the same one", () => {
  const { items } = setup([rec("s1", "member:m1")]);
  const first = items("m1");
  assert.equal(first.length, 1);
  assert.equal(NOTICE_KINDS[KIND], "FINDING");
  assert.equal(first[0].id, "FINDING::fetch-done::s1");
  assert.deepEqual(first[0].recipients, ["m1"]);
  assert.deepEqual(first[0].subject, { kind: "document", id: "INFO-s1", session: "s1", project: "PROJ-1" });
  assert.deepEqual(items("m1").map((i) => i.id), ["FINDING::fetch-done::s1"], "told once: the same key, never a second item");
});

test("R27: a record for another member makes no notice for this one, a machine or nobody", () => {
  const { items } = setup([rec("s1", "member:m2")]);
  assert.deepEqual(items("m1"), []);
  assert.deepEqual(items(null), []);
  assert.equal(items("m2").length, 1);
});

test("R27: a member no longer active is told nothing, and the same session listed twice is one item", () => {
  const { w, items } = setup([rec("s1", "m1"), rec("s1", "m1")]);
  assert.equal(items("m1").length, 1);
  w.exec(`UPDATE members SET status='revoked' WHERE member_id='m1'`);
  assert.deepEqual(items("m1"), []);
});

test("R27 R1: the read is the window's, as the viewer, in pages; a capture that throws or refuses contributes no item and is named in facts.failed", () => {
  const { read, asked } = setup([rec("s1", "m1")]);
  const r = read("m1", { now: Date.parse("2026-10-21T00:00:00Z") });
  assert.equal(asked[0].since, Date.parse("2026-10-21T00:00:00Z") - FETCH_DONE_DAYS * 86_400_000);
  assert.equal(asked[0].viewer, "member:m1");
  assert.ok(asked[0].limit <= FETCH_DONE_MAX);
  assert.deepEqual(r.facts.fetch_done, { bound: FETCH_DONE_MAX, days: FETCH_DONE_DAYS, truncated: false });
  for (const capture of [{ fetchesDone: () => { throw new Error("x"); } }, { fetchesDone: () => ({ ok: false }) }]) {
    const bad = setup([], { capture }).read("m1", { now: Date.parse("2026-10-21T00:00:00Z") });
    assert.deepEqual(ofKind(bad, KIND), []);
    assert.ok(bad.facts.failed.includes("capture"));
  }
});

test("R27: seam over the real capture's fetch_done record (waits for capture's merge: red by name until then)", () => {
  const w = world({});
  w.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);
  const n = fresh(w.host, { membership: w.membership });
  const r = reader(n).read("m1", { now: Date.parse("2026-10-21T00:00:00Z") });
  assert.ok(!r.facts.failed.includes("capture"), "capture publishes fetchesDone (QUESTION J2)");
});
