/* corpus-export — its route arms (R6; N483, K1122): `corpusExportOps(ce, q)` answers each op as the service it names
   answers, with the query's parameter passed through. Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW } from "./fixture.mjs";
import { corpusExportOps, EXPORT_NOTE_MAX } from "../../../src/corpus-export/index.mjs";

const A = "INFO-2026-0001-minutes", B = "INQ-2026-0001";
const query = (params) => { const asked = []; const q = (k) => { asked.push(k); return params[k] ?? null; }; return { q, asked }; };

test("R6 corpusExportOps publishes exactly the arms export and exportlog, each a function of no arguments", () => {
  const w = world();
  const ops = corpusExportOps(w.ce, query({}).q);
  assert.deepEqual(Object.keys(ops).sort(), ["export", "exportlog"]);
  for (const [name, arm] of Object.entries(ops)) {
    assert.equal(typeof arm, "function", name);
    assert.equal(arm.length, 0, `${name} takes no arguments`);
  }
  assert.deepEqual(Object.keys({ ...ops }).sort(), ["export", "exportlog"], "a spread carries both arms");
});

test("R6 the export arm answers R1 with q(\"note\") passed through: the same manifest exportManifest answers, and the same log row", () => {
  const w = world();
  w.doc(A, ["the minutes, as captured"]);
  w.inquiry(B, { cites: [A] });
  w.inquiry(B, { question: "Revised?", cites: [A] });
  for (const note of ["for the archive", "n".repeat(400), null]) {
    const { q, asked } = query({ note });
    const viaOps = corpusExportOps(w.ce, q).export();
    assert.deepEqual(asked, ["note"], "the arm reads note, and only note");
    const direct = w.ce.exportManifest({ note });
    assert.deepEqual(viaOps, direct, `the arm answers what R1 answers (note ${String(note).slice(0, 12)})`);
    const [byArm, byService] = w.rows(`SELECT at, scope, bundles, files, note FROM export_log ORDER BY seq DESC LIMIT 2`).reverse();
    assert.deepEqual(byArm, byService, "the arm logs the row R1 logs");
    assert.equal(byArm.note, note === null ? null : note.slice(0, EXPORT_NOTE_MAX), "the note passed through, cut as R1 cuts it");
  }
  /* the arm reads the query when it runs, not when the map is made */
  const params = { note: "early" };
  const arm = corpusExportOps(w.ce, (k) => params[k] ?? null).export;
  params.note = "late";
  arm();
  assert.equal(w.row(`SELECT note FROM export_log ORDER BY seq DESC LIMIT 1`).note, "late");
});

test("R6 the exportlog arm answers R2 with q(\"limit\") passed through: the same rows, bound and truncated as exportLog", () => {
  const w = world();
  for (let i = 0; i < 5; i++)
    w.st.sql.exec(`INSERT INTO export_log (at, scope, bundles, files, note) VALUES (?, 'working-corpus', ?, 0, NULL)`, NOW, i);
  for (const limit of [null, "2", "0", "-5", "5000", "x", "2.9", "5", "4"]) {
    const { q, asked } = query({ limit });
    const viaOps = corpusExportOps(w.ce, q).exportlog();
    assert.deepEqual(asked, ["limit"], "the arm reads limit, and only limit");
    assert.deepEqual(viaOps, w.ce.exportLog({ limit }), `limit ${limit}`);
  }
  const { q } = query({ limit: "2" });
  const two = corpusExportOps(w.ce, q).exportlog();
  assert.deepEqual([two.exports.map((e) => e.bundles), two.limit, two.truncated], [[4, 3], 2, true]);
  assert.equal(w.count("export_log"), 5, "reading the log writes nothing");
});
