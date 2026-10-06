/* corpus-export — its invariants: `export_log` exempt from purge (R4, moved from `publication` R31's export_log arms,
   `test/m/publication/invariants.test.mjs`:30, :48–50, :55) and no place named (R5, copied from `publication` R34).
   Driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";
import { corpusExportOf, verifyCorpusExport, CORPUS_EXPORT_EXEMPT, FORMATS } from "../../../src/corpus-export/index.mjs";

const A = "INFO-2026-0001-minutes", B = "INQ-2026-0001";

test("R4 export_log is exempt from purge: the whole-store purge and a record's purge leave it byte-identical, and the declaration answers ok", () => {
  const w = world();
  assert.deepEqual(w.ce.purgeDeclaration, { ok: true }, "declared at creation: export_log, exempt");
  assert.deepEqual([...CORPUS_EXPORT_EXEMPT], ["export_log"]);
  assert.equal(corpusExportOf(w.host), w.ce, "one instance per host (K61)");
  /* record-core holds the declaration under this module's name (a second one is refused and declares nothing) */
  /* (N554) record-core R80's refusal shape: its row's fields, the fields it answered before kept */
  const again = w.record.declarePurge("probe", ["export_log"]);
  const { translation, detail, ...named } = again;
  assert.deepEqual(named, { ok: false, reason: "TABLE_DECLARED", code: "TABLE_DECLARED", check: "C-102.27",
                            table: "export_log", module: "probe", declaredBy: "corpus-export" });
  assert.equal(typeof translation, "string");
  assert.match(detail, /export_log/);
  w.doc(A, ["the minutes, as captured"]);
  w.inquiry(B, { cites: [A] });
  w.ce.exportManifest({ note: "before the purge" });
  w.ce.exportManifest({});
  const log = w.snapshot(["export_log"]);
  assert.equal(w.count("export_log"), 2);
  w.record.purge({ bundleId: B });
  assert.equal(w.record.head(B), null, "the record's own rows went");
  assert.deepEqual(w.snapshot(["export_log"]), log, "a record's purge leaves the log byte-identical");
  w.record.purge({});
  assert.equal(w.count("bundles"), 0, "the whole store's records went");
  assert.deepEqual(w.snapshot(["export_log"]), log, "the whole-store purge leaves the log byte-identical");
  /* creation again over the same storage keeps the rows: CREATE TABLE IF NOT EXISTS */
  w.ce.migrate();
  assert.deepEqual(w.snapshot(["export_log"]), log);
});

test("R5 no place is named in this module's behaviour or outward text", () => {
  const w = world();
  w.doc(A, ["the minutes, as captured"]);
  w.inquiry(B, { cites: [A] });
  w.inquiry(B, { question: "Revised?", cites: [A] });
  const manifest = w.ce.exportManifest({});
  const bytes = w.bytesFor(manifest);
  const tampered = JSON.parse(JSON.stringify(manifest));
  tampered.bundles[1].promotions[0].base = sha("x");
  tampered.bundles[1].promotions[1].base = sha("y");
  tampered.bundles[1].snapshots[0].snap_key = "elsewhere";
  tampered.counts.files = 0;
  tampered.register[0].bytes = 0;
  const outward = JSON.stringify([manifest.recorded, manifest.verify, w.ce.exportLog({}),
    verifyCorpusExport({ manifest, bytes }), verifyCorpusExport({ manifest: tampered, bytes: new Map() }),
    verifyCorpusExport({ manifest, bytes: new Map([...bytes].map(([k]) => [k, "x"])) }), verifyCorpusExport(null),
    /* T33-61: the tables, the pages, their refusals and every rendering */
    manifest.tables, w.ce.exportPage({ table: "leases", index: 0 }), w.ce.exportPage({ table: "x", index: 0 }),
    w.ce.exportPage({ table: "export_log", index: "x" }), w.ce.exportRendering({ format: "nope" }),
    ...FORMATS.map((format) => w.ce.exportRendering({ format, viewer: "admin" }))]);
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Brown Act", "CPRA",
                       "United States", "County", "City of"])
    assert.equal(outward.includes(place), false, `names ${place}`);
});
