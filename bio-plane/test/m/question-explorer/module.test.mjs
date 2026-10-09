/* question-explorer: the module's own rows, its tables and their purge, and its factory. */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as QE from "../../../src/question-explorer/index.mjs";
import { world, Q, Q2, DOC, CAP, CALLER } from "./fixture.mjs";

test("R9, R10, R13: each refusal this module mints is its own row, frozen, with a translation in plain words and the site that mints it; a relayed provider's code is never copied here", () => {
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
  const w = world().standard();
  const o = w.openRun("group");
  const r = w.p.look({ run: o.run, entity: "ENT-2026-19999", caller: CALLER });
  assert.deepEqual([r.check, r.translation], [QE.EXPLORE_CHECKS.EXPLORE_PERSON_NOT_TIED.check, QE.EXPLORE_CHECKS.EXPLORE_PERSON_NOT_TIED.translation]);
});

test("the module's tables are declared to record-core's purge by the question they serve (and a find by its documents): a question's purge takes its own rows, a document's purge its finds", () => {
  const w = world().standard();
  w.question(Q2, { recipients: ["alice"] });
  w.explore.group = "yes";
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

test("questionExplorerOf answers one instance per storage; the constants are as the requirements state them", () => {
  const w = world();
  assert.equal(QE.questionExplorerOf(w.host), w.p);
  assert.equal(QE.EXPLORE_PERSON_CAP, 20);
  assert.equal(QE.EXPLORE_ORIGIN, "explore");
  assert.equal(QE.EXPLORE_MODE, "investigate");
  assert.equal(QE.EXPLORE_USE, "explore");
});
