/* extraction R110 (fix round 10, cause 39b, G7; walks D5, D6; K5055; amends R105): a migration's counts are readable by an administrator. After a run, a
   read-only answer (`migrationCounts`, which the plane's `selftest` arm hands the administrator) states for each migration what it examined and migrated,
   whether it is done, when it last ran, whether it will retry, and the counts of the shapes it found. Driven through the module's real entries
   (`writeReading` of readings in each old shape, `registerOwe`, `migrateRepairs`) with test-support's registrar stub. Each test names the requirement ids
   it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle } from "./fixture.mjs";
// fixtures-contract: plane job-registrar
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";
import { OWED_MIGRATION, SHAPE_MIGRATION, N26_MIGRATION } from "../../../src/extraction/index.mjs";

const sha = (c) => c.repeat(64);
const unit = (page, text, extra = {}) => ({ extent: { kind: "pdf-page", page, rect: null }, text, seq: page, ...extra });

/* a store holding one reading in each old shape (the writer before this round stamped no shape) */
function stored() {
  const w = fresh();
  bundle(w.s, "INFO-1");
  const base = { entities: [], text_source: null, content_type: "generic", basis: "b", at: "2026-10-01T00:00:00Z" };
  const write = (s, reading, textUnits) => w.core.transact(() => w.x.writeReading({ bundleId: "INFO-1", captureSha: s, composed: true, reading: { ...base, ...reading }, textUnits }));
  write(sha("a"), { found: false, failure: "final", too_large: { bytes: 2e6, key: "cells", key_bytes: 1.9e6, limit: 1048576 } }, []);
  write(sha("b"), { found: true, text_container: "text" }, [unit(0, "a cut unit", { truncated: true })]);
  write(sha("c"), { found: true, text_container: "pdf", page_count: 4, tier3_candidate: true }, [unit(0, "page zero words")]);
  write(sha("d"), { found: true, text_container: "pdf", page_count: 2, provenance: { text_scope: { pages: [0, 1] } } }, [unit(0, "p0"), unit(1, "p1")]);
  write(sha("e"), { found: true, text_container: "text" }, [unit(0, "a current reading")]);
  w.s.sql.exec(`UPDATE readings SET reading_shape=NULL WHERE capture_sha IN (?,?,?,?)`, sha("a"), sha("b"), sha("c"), sha("d"));
  return w;
}
const byName = (answer) => Object.fromEntries(answer.migrations.map((m) => [m.migration, m]));

test("R110 R105 (fix round 10, cause 39b; D5, D6): after a run, a read-only answer holds each migration's examined, migrated, done, last run, retry and the counts of the shapes it found", async () => {
  const w = stored();
  const before = byName(w.x.migrationCounts());
  assert.deepEqual([before[SHAPE_MIGRATION].examined, before[SHAPE_MIGRATION].done, before[SHAPE_MIGRATION].at, before[SHAPE_MIGRATION].retry], [0, false, null, true], "a migration that has not run states zeros, never an invented figure");
  assert.equal(w.rows(`SELECT * FROM reading_migrations WHERE migration=?`, SHAPE_MIGRATION).length, 0, "asking creates no row");
  const jobs = jobRegistrarStub();
  w.x.registerOwe(jobs.registerJob);
  for (let n = 0; n < 10; n++) { const r = await w.x.migrateRepairs(); if (r.done) break; }
  const now = byName(w.x.migrationCounts());
  const shape = now[SHAPE_MIGRATION], owed = now[OWED_MIGRATION];
  assert.equal(shape.done, true);
  assert.equal(shape.retry, false);
  assert.match(shape.at, /^\d{4}-\d\d-\d\dT/, "when it last ran");
  assert.equal(shape.examined, 4, "the four readings written by the older reader; the current one is not examined");
  assert.deepEqual([shape.counts.stated_bare, shape.counts.cut_units, shape.counts.pages_unread, shape.counts.first_range], [1, 1, 1, 1], JSON.stringify(shape.counts));
  assert.equal(shape.migrated, 4);
  assert.equal(shape.counts.registered, 4);
  assert.equal(owed.done, true);
  assert.deepEqual([owed.counts.ocr, owed.counts.ods ?? 0], [1, 0], `the reading owing OCR is counted by kind: ${JSON.stringify(owed.counts)}`);
  assert.equal(now[N26_MIGRATION].done, false, "a migration the run did not reach states it is not done");
});

test("R110 (control): a second run changes none of the counts, and the answer writes nothing", async () => {
  const w = stored();
  const jobs = jobRegistrarStub();
  w.x.registerOwe(jobs.registerJob);
  for (let n = 0; n < 10; n++) { const r = await w.x.migrateRepairs(); if (r.done) break; }
  const first = JSON.stringify(w.x.migrationCounts());
  const dump = () => JSON.stringify(w.rows(`SELECT * FROM reading_migrations ORDER BY migration`));
  const rowsBefore = dump();
  const again = await w.x.migrateRepairs();
  assert.equal(again.examined, 0);
  assert.equal(JSON.stringify(w.x.migrationCounts()), first, "the counts do not move");
  assert.equal(dump(), rowsBefore, "no row moved");
  w.x.migrationCounts();
  assert.equal(dump(), rowsBefore, "asking writes nothing");
});
