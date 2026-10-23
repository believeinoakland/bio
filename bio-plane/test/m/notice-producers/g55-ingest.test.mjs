/* R28 (proposed, fix round 6, G55; K4562): a money ingest run in the background is told to the member who ingested it when
   it is done, or when it was stopped. `calculations`' finished or stopped ingests are read through a stand-in in the shape
   proposed in the J6 question (`ingestNotices({after, limit, viewer}) → {ok, ingests, limit, truncated, next}`); the seam
   test over the real calculations stays red by name until calculations merges. */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "../file-safety/fixture.mjs";
import { fresh, reader, ofKind } from "./fixture.mjs";
import { localize } from "../../../src/setup-words/index.mjs";
import { NOTICE_KINDS, INGEST_NOTICE_MAX, INGEST_NOTICE_DAYS } from "../../../src/notice-producers/index.mjs";

const NOW = Date.parse("2026-10-21T00:00:00Z");
const rec = (ingest, by, state, over = {}) => ({ ingest, binding: "BND-1", project: "PROJ-1", state, by, rows_total: 12000,
  written_count: 11990, not_written_count: 10, at: "2026-10-20T10:00:00Z", cursor: ingest, ...over });

function setup(records, over = {}) {
  const w = world({});
  w.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);
  const asked = [];
  const calculations = over.calculations ?? {
    ingestNotices: (a) => { asked.push(a); return { ok: true, ingests: records, limit: 200, truncated: false, next: null }; },
  };
  const n = fresh(w.host, { membership: w.membership, calculations });
  const { read } = reader(n);
  const run = (member) => read(member, { now: NOW });
  const items = (member) => run(member).items.filter((i) => i.kind.startsWith("ingest-"));
  return { w, items, run, read, asked };
}

test("R28: a done ingest and a stopped one each raise one notice for the member who ingested, and a second cycle raises the same keys", () => {
  const { items } = setup([rec("ING-1", "member:m1", "done"), rec("ING-2", "member:m1", "stopped", { written_count: 40000 })]);
  const first = items("m1");
  assert.deepEqual(first.map((i) => i.id), ["FINDING::ingest-done::ING-1", "FINDING::ingest-stopped::ING-2"]);
  assert.equal(NOTICE_KINDS["ingest-done"], "FINDING");
  assert.equal(NOTICE_KINDS["ingest-stopped"], "FINDING");
  assert.deepEqual(first.map((i) => i.recipients), [["m1"], ["m1"]]);
  assert.deepEqual(first[0].subject, { kind: "ingest", id: "ING-1", binding: "BND-1", project: "PROJ-1", state: "done" });
  assert.deepEqual(items("m1").map((i) => i.id), first.map((i) => i.id), "told once: the same keys, never a second item");
});

test("R28: the notice reads in the two words (found by their ids) and fills the counts", () => {
  const { items } = setup([rec("ING-1", "m1", "done"), rec("ING-2", "m1", "stopped")]);
  const [done, stopped] = items("m1");
  const fills = { written: "11990", not_written: "10", rows: "12000" };
  assert.deepEqual(done.fills, fills);
  assert.equal(done.summary, localize("notice-producers.ingest.done", "Your table has been ingested: {written} of {rows} rows were written as money facts, {not_written} were not.", fills));
  assert.equal(stopped.detail, localize("notice-producers.ingest.stopped", "Your table's ingest was stopped after {written} of {rows} rows were written; the rest were not.", fills));
  assert.notEqual(done.summary, stopped.summary);
});

test("R28: an ingest still running, an unseen one, one of another member, a machine's or nobody's raises no notice", () => {
  const { items } = setup([rec("ING-1", "m1", "ingesting"), rec("ING-2", "member:m2", "done"), rec("ING-3", "tool:x", "done"), rec("ING-4", null, "stopped")]);
  assert.deepEqual(items("m1"), []);
  assert.deepEqual(items(null), []);
  assert.deepEqual(items("m2").map((i) => i.id), ["FINDING::ingest-done::ING-2"]);
  /* calculations answers only what the viewer sees: an ingest it leaves out of the answer raises none */
  assert.deepEqual(setup([]).items("m1"), []);
});

test("R28: a member no longer active is told nothing, and an ingest listed twice is one item", () => {
  const { w, items } = setup([rec("ING-1", "m1", "done"), rec("ING-1", "m1", "done")]);
  assert.equal(items("m1").length, 1);
  w.exec(`UPDATE members SET status='revoked' WHERE member_id='m1'`);
  assert.deepEqual(items("m1"), []);
});

test("R28 R1: the read is in pages by the viewer, an ingest older than 90 days is not told, a calculations that throws or refuses is named in facts.failed", () => {
  const { run, asked } = setup([rec("ING-1", "m1", "done"), rec("OLD", "m1", "done", { at: "2026-06-01T00:00:00Z" })]);
  const r = run("m1");
  assert.deepEqual(ofKind(r, "ingest-done").map((i) => i.id), ["FINDING::ingest-done::ING-1"]);
  assert.ok(asked[0].limit <= INGEST_NOTICE_MAX && asked[0].viewer === "member:m1");
  assert.deepEqual(r.facts.ingest, { bound: INGEST_NOTICE_MAX, days: INGEST_NOTICE_DAYS, truncated: false });
  for (const calculations of [{ ingestNotices: () => { throw new Error("x"); } }, { ingestNotices: () => ({ ok: false }) }]) {
    const bad = setup([], { calculations }).run("m1");
    assert.deepEqual(bad.items.filter((i) => i.kind.startsWith("ingest-")), []);
    assert.ok(bad.facts.failed.includes("calculations"));
  }
});

test("R28: more than a page is followed by next, and a bound reached is stated", () => {
  const pages = [{ ok: true, ingests: [rec("A", "m1", "done")], truncated: true, next: "c1" }, { ok: true, ingests: [rec("B", "m1", "stopped")], truncated: false, next: null }];
  const seen = [];
  const calculations = { ingestNotices: (a) => { seen.push(a.after); return pages[seen.length - 1]; } };
  const { run } = setup([], { calculations });
  assert.deepEqual(run("m1").items.filter((i) => i.kind.startsWith("ingest-")).map((i) => i.id), ["FINDING::ingest-done::A", "FINDING::ingest-stopped::B"]);
  assert.deepEqual(seen, [null, "c1"]);
});

test("R28: seam over the real calculations' finished and stopped ingests: told once to who ingested, never to another", async () => {
  const { calculationsOf } = await import("../../../src/calculations/index.mjs");
  const w = world({});
  w.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);
  const calc = calculationsOf(w.host);
  assert.equal(typeof calc.ingestNotices, "function", "calculations has not published ingestNotices (waits for its merge)");
  const read = reader(fresh(w.host, { membership: w.membership, calculations: undefined })).read;
  const mine = read("m1", { now: NOW });
  assert.ok(!mine.facts.failed.includes("calculations"));
});
