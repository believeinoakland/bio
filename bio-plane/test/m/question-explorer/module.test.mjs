/* question-explorer: the module's own rows, its tables and their purge, and its factory. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as QE from "../../../src/question-explorer/index.mjs";
import * as RR from "../../../src/run-rules/index.mjs";
import { world, Q, Q2, DOC, CAP, CALLER, NOW } from "./fixture.mjs";

test("R9, R10, R13: each refusal this module mints is its own row, frozen, with a translation in plain words and the site that mints it; a relayed provider's code is never copied here", async () => {
  assert.ok(Object.isFrozen(QE.EXPLORE_CHECKS));
  assert.deepEqual([...QE.EXPLORE_CHECK_KEYS], Object.keys(QE.EXPLORE_CHECKS));
  for (const code of ["EXPLORE_PERSON_NOT_TIED", "EXPLORE_PERSON_CAP_REACHED", "EXPLORE_READ_KEPT_AWAY", "EXPLORE_PAGES_BOUND"])
    assert.ok(QE.EXPLORE_CHECKS[code], code);
  assert.deepEqual(Object.values(QE.EXPLORE_CHECKS).map((r) => r.check),
                   QE.EXPLORE_CHECK_KEYS.map((_, i) => `C-145.${i + 1}`), "family C-145, numbered in order (K2482)");
  for (const [code, row] of Object.entries(QE.EXPLORE_CHECKS)) {
    assert.match(row.where, /^src\/question-explorer\/index\.mjs \w+/, code);
    assert.ok(row.translation.length > 30 && !/[A-Z]{4,}_/.test(row.translation), `${code}: plain words`);
  }
  for (const relayed of ["EXPLORE_NOT_ENABLED", "AI_KEPT_AWAY", "CAPTURE_REQUEST_ADDRESS_NOT_HELD", "STEP_ALIKE_EXISTS"])
    assert.equal(QE.EXPLORE_CHECKS[relayed], undefined, relayed);
  /* Negative control: a minted refusal carries its row's translation. */
  const w = await world().standard();
  const o = await w.openRun("group");
  const r = w.p.look({ run: o.run, entity: "ENT-2026-19999", caller: CALLER });
  assert.deepEqual([r.check, r.translation], [QE.EXPLORE_CHECKS.EXPLORE_PERSON_NOT_TIED.check, QE.EXPLORE_CHECKS.EXPLORE_PERSON_NOT_TIED.translation]);
});

test("the module's tables are declared to record-core's purge by the question they serve (and a find by its documents): a question's purge takes its own rows, a document's purge its finds", async () => {
  const w = await world().standard();
  w.question(Q2, { recipients: ["alice"] });
  await w.setExplore("group", "yes");
  const t = w.p.exploreTick(w.clock.now);
  const [o1, o2] = [t.opened.find((x) => x.question === Q), t.opened.find((x) => x.question === Q2)];
  w.p.find({ run: o1.run, kind: "capture", ref: CAP, bearing: "unclear", how: "x", caller: CALLER });
  w.p.find({ run: o2.run, kind: "capture", ref: CAP, bearing: "unclear", how: "x", caller: CALLER });
  assert.equal(w.count("explore_finds"), 2);
  w.record.purge({ bundleId: Q });
  assert.deepEqual(w.rows(`SELECT question FROM explore_runs`).map((r) => r.question), [Q2]);
  assert.deepEqual(w.rows(`SELECT question FROM explore_finds`).map((r) => r.question), [Q2]);
  w.record.purge({ bundleId: DOC });
  assert.equal(w.count("explore_finds"), 0, "a document's purge takes the finds resting on it");
  assert.equal(w.count("explore_runs"), 1, "negative control: Q2's run stays");
});

test("questionExplorerOf answers one instance per storage; the constants are as the requirements state them", async () => {
  const w = world();
  assert.equal(QE.questionExplorerOf(w.host), w.p);
  assert.equal(QE.EXPLORE_PERSON_CAP, 20);
  assert.equal(QE.EXPLORE_ORIGIN, "explore");
  assert.ok(RR.RUN_ORIGINS.includes(QE.EXPLORE_ORIGIN), "run-rules R23's origin, read by key");
  assert.ok(Object.keys(RR.RUN_BOUNDS).includes("pages") && QE.EXPLORE_BOUNDS.some((b) => b.bound === "pages"), "run-rules R26's bound");
  assert.ok(RR.TEST_BAR_PARTS.includes(QE.EXPLORE_TEST_PART), "a part run-rules holds the bar for");
  assert.equal(QE.EXPLORE_MODE, "investigate");
  assert.equal(QE.EXPLORE_USE, "explore");
});

test("R15: questionExplorerOf answers its instance with its tables already created, migrated before they are declared to purge: a host that never calls migrate() reads, ticks and purges without error; migrate() stays callable and idempotent", async () => {
  const w = await world({ migrate: false }).standard();
  const tables = QE.QUESTION_EXPLORER_TABLES.map((t) => t.name).sort();
  assert.deepEqual(w.tablesBefore, [], "negative control: the storage held none of its tables before the factory ran");
  assert.deepEqual(w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'explore_%' ORDER BY name`).map((r) => r.name),
                   tables, "every table it declares to purge, created by the factory alone");
  /* Reads, ticks and purges with no `no such table`. */
  await w.setExplore("group", "yes");
  assert.equal(w.p.exploreDue(NOW), 1);
  assert.equal(w.p.exploreWake(NOW), NOW);
  const t = w.p.exploreTick(NOW);
  assert.equal(t.opened.length, 1);
  assert.equal(w.p.find({ run: t.opened[0].run, kind: "capture", ref: CAP, bearing: "unclear", how: "x", caller: CALLER }).ok, true);
  assert.deepEqual(w.p.findsFor({ viewer: "member:alice" }).finds.length, 1);
  assert.deepEqual(w.p.stopsFor({ viewer: "member:dana" }), { ok: true, stops: [] });
  w.record.purge({ bundleId: DOC });
  assert.equal(w.count("explore_finds"), 0, "a document's purge reaches the declared tables");
  w.record.purge({ bundleId: Q });
  assert.equal(w.count("explore_runs"), 0, "a question's purge reaches them");
  /* migrate() stays callable and idempotent: twice more over held rows changes nothing. */
  w.question(Q2, { recipients: ["alice"] });
  w.clock.now = "2026-10-11T09:00:00Z";
  assert.equal(w.p.exploreTick(w.clock.now).opened.length, 1);
  const before = w.snapshot();
  w.p.migrate();
  w.p.migrate();
  assert.deepEqual(w.snapshot(), before, "calling migrate() again changes nothing");
  /* One instance per host: the factory asked again answers the same instance, and migrates nothing anew. */
  assert.equal(QE.questionExplorerOf(w.host), w.p);
  assert.deepEqual(w.snapshot(), before);
});
