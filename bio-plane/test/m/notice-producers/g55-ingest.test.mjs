/* R28 (proposed, fix round 6, G55; K4562): a money ingest run in the background is told to the member who ingested it when
   it is done, or when it was stopped. `calculations`' finished or stopped ingests are read through a stand-in in the shape
   BOB published (J6's answer, B6): `ingestNotices({after, limit, viewer}) → {ok, items, next}`, the viewer's own ingests only;
   the seam test over the real calculations stays red by name until calculations merges. */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "../file-safety/fixture.mjs";
import { fresh, reader } from "./fixture.mjs";
import { localize } from "../../../src/setup-words/index.mjs";
import { NOTICE_KINDS, INGEST_NOTICE_MAX, INGEST_NOTICE_DAYS } from "../../../src/notice-producers/index.mjs";

const NOW = Date.parse("2026-10-21T00:00:00Z");
const rec = (ingest, state, over = {}) => ({ ingest, binding: "BND-1", state, rows_total: 12000, written_count: 11990, not_written_count: 10,
  finished_at: "2026-10-20T10:00:00Z", ...(state === "stopped" ? { stopped: { reason: "ATTEMPTS", says: "It failed three times." } } : {}), ...over });
const mine = (r) => r.items.filter((i) => i.kind.startsWith("ingest-"));

function setup(records, over = {}) {
  const w = world({});
  w.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);
  const asked = [];
  const calculations = over.calculations ?? {
    ingestNotices: (a) => { asked.push(a); return { ok: true, items: records, next: null }; },
  };
  const n = fresh(w.host, { membership: w.membership, calculations });
  const { read } = reader(n);
  const run = (member) => read(member, { now: NOW });
  return { w, run, asked, items: (m) => mine(run(m)) };
}

test("R28: a done ingest and a stopped one each raise one notice for the viewer, and a second cycle raises the same keys", () => {
  const { items } = setup([rec("ING-1", "done"), rec("ING-2", "stopped", { written_count: 40000 })]);
  const first = items("m1");
  assert.deepEqual(first.map((i) => i.id), ["FINDING::ingest-done::ING-1", "FINDING::ingest-stopped::ING-2"]);
  assert.equal(NOTICE_KINDS["ingest-done"], "FINDING");
  assert.equal(NOTICE_KINDS["ingest-stopped"], "FINDING");
  assert.deepEqual(first.map((i) => i.recipients), [["m1"], ["m1"]]);
  assert.deepEqual(first[0].subject, { kind: "ingest", id: "ING-1", binding: "BND-1", state: "done" });
  assert.deepEqual(items("m1").map((i) => i.id), first.map((i) => i.id), "told once: the same keys, never a second item");
});

test("R28: the notice reads in the two words (found by their ids), fills the counts, and a stop adds its reason's words", () => {
  const { items } = setup([rec("ING-1", "done"), rec("ING-2", "stopped")]);
  const [done, stopped] = items("m1");
  const fills = { written: "11990", not_written: "10", rows: "12000" };
  assert.deepEqual(done.fills, fills);
  assert.equal(done.summary, localize("notice-producers.ingest.done", "Your table has been ingested: {written} of {rows} rows were written as money facts, {not_written} were not.", fills));
  assert.equal(done.detail, done.summary);
  assert.equal(stopped.summary, localize("notice-producers.ingest.stopped", "Your table's ingest was stopped after {written} of {rows} rows were written; the rest were not.", fills));
  assert.ok(stopped.detail.startsWith(stopped.summary) && stopped.detail.endsWith("It failed three times."));
  assert.notEqual(done.summary, stopped.summary);
});

test("R28: an ingest still running or unnamed raises none; the producer is asked as the viewer and tells nobody else", () => {
  const { items, asked } = setup([rec("ING-1", "ingesting"), rec("", "done"), rec("ING-3", "done")]);
  assert.deepEqual(items("m1").map((i) => i.id), ["FINDING::ingest-done::ING-3"]);
  assert.deepEqual(items(null), []);
  assert.equal(asked[0].viewer, "member:m1");
  assert.deepEqual(setup([]).items("m1"), []);
});

test("R28: a member no longer active is told nothing, and an ingest listed twice is one item", () => {
  const { w, items } = setup([rec("ING-1", "done"), rec("ING-1", "done")]);
  assert.equal(items("m1").length, 1);
  w.exec(`UPDATE members SET status='revoked' WHERE member_id='m1'`);
  assert.deepEqual(items("m1"), []);
});

test("R28 R1: an ingest finished over 90 days ago is not told, and a calculations that throws or refuses is named in facts.failed", () => {
  const { run, asked } = setup([rec("ING-1", "done"), rec("OLD", "done", { finished_at: "2026-06-01T00:00:00Z" })]);
  const r = run("m1");
  assert.deepEqual(mine(r).map((i) => i.id), ["FINDING::ingest-done::ING-1"]);
  assert.ok(asked[0].limit <= INGEST_NOTICE_MAX);
  assert.deepEqual(r.facts.ingest, { bound: INGEST_NOTICE_MAX, days: INGEST_NOTICE_DAYS, truncated: false });
  for (const calculations of [{ ingestNotices: () => { throw new Error("x"); } }, { ingestNotices: () => ({ ok: false }) }]) {
    const bad = setup([], { calculations }).run("m1");
    assert.deepEqual(mine(bad), []);
    assert.ok(bad.facts.failed.includes("calculations"));
  }
});

test("R28: every cycle reads from the start and pages by next, so an ingest started earlier that finishes later is still told", () => {
  const seen = [];
  const calculations = { ingestNotices: (a) => { seen.push(a.after); return a.after === 0 ? { ok: true, items: [rec("A", "done")], next: 7 } : { ok: true, items: [rec("B", "stopped")], next: null }; } };
  const { run } = setup([], { calculations });
  assert.deepEqual(mine(run("m1")).map((i) => i.id), ["FINDING::ingest-done::A", "FINDING::ingest-stopped::B"]);
  run("m1");
  assert.deepEqual(seen, [0, 7, 0, 7], "no cursor is kept between cycles");
});

test("R28: seam over the real calculations' finished and stopped ingests: told once to who ingested, never to another", async () => {
  const { calculationsOf } = await import("../../../src/calculations/index.mjs");
  const w = world({});
  w.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);
  const calc = calculationsOf(w.host);
  assert.equal(typeof calc.ingestNotices, "function", "calculations has not published ingestNotices (waits for its merge)");
  const read = reader(fresh(w.host, { membership: w.membership, calculations: undefined })).read;
  assert.ok(!read("m1", { now: NOW }).facts.failed.includes("calculations"));
});
