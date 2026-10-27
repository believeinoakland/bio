/* publication — G54 platform check L (K4426): a populated `published_cases` of the old shape (no `casefile_*` column),
   inside a real Durable Object's SQLite (Miniflare), takes `migratePublication`'s four `ALTER TABLE ... ADD COLUMN`
   once, keeps its rows with the four columns null, and takes the `UPDATE` the ledger's one writer makes. The module's own
   `schema.mjs` runs in the object; the pattern is `g47t-miniflare.test.mjs`'s. */
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Miniflare } from "miniflare";

const owned = mkdtempSync(join(tmpdir(), "g54-"));
process.env.TMPDIR = owned;
process.on("exit", () => rmSync(owned, { recursive: true, force: true }));
const schemaSrc = readFileSync(new URL("../../../src/publication/schema.mjs", import.meta.url), "utf8");
const worker = `
import { migratePublication } from "./schema.mjs";
export class D { constructor(s) { this.sql = s.storage.sql; }
  async fetch() {
    const sql = this.sql, out = {}, rows = (q, ...a) => [...sql.exec(q, ...a)];
    sql.exec("CREATE TABLE published_cases (case_id TEXT NOT NULL, edition INTEGER NOT NULL, scope TEXT, completeness TEXT, bias_acknowledgement TEXT, bar TEXT, opened TEXT NOT NULL, ratified_at TEXT, manifest_sha TEXT, manifest TEXT, PRIMARY KEY (case_id, edition))");
    sql.exec("INSERT INTO published_cases (case_id,edition,opened,ratified_at,manifest_sha) VALUES ('C-OLD',1,'2026-01-01T00:00:00Z','2026-01-01T00:00:00Z',NULL)");
    migratePublication(sql);
    const cols = () => rows("PRAGMA table_info(published_cases)").map((r) => r.name).filter((n) => n.startsWith("casefile_"));
    out.cols = cols();
    out.old = rows("SELECT casefile_state, casefile_attempts, casefile_attempted_at, casefile_why, manifest_sha FROM published_cases");
    migratePublication(sql);
    out.again = cols();
    sql.exec("UPDATE published_cases SET casefile_state=?, casefile_attempts=?, casefile_attempted_at=?, casefile_why=? WHERE case_id=? AND edition=?",
             "failed", 1, "2026-02-01T00:00:00Z", JSON.stringify({ code: "BUCKET_FAILED", step: "bucket_put" }), "C-OLD", 1);
    out.written = rows("SELECT casefile_state, casefile_attempts, casefile_attempted_at, casefile_why FROM published_cases");
    out.owedRows = rows("SELECT case_id FROM published_cases WHERE casefile_state IS NOT 'stopped' AND (manifest_sha IS NULL OR casefile_state IN ('building', 'failed'))");
    return new Response(JSON.stringify(out));
  } }
export default { fetch: (r, env) => env.D.get(env.D.idFromName("x")).fetch(r) };`;

test("R40 R-OLD in a real Durable Object: the old published_cases takes the four ledger columns once, keeps its row with them null, and takes the writer's update", async () => {
  const mf = new Miniflare({ modules: [{ type: "ESModule", path: "worker.mjs", contents: worker }, { type: "ESModule", path: "schema.mjs", contents: schemaSrc }],
                             durableObjects: { D: { className: "D", useSQLite: true } }, compatibilityDate: "2025-01-01" });
  try {
    const out = await (await mf.dispatchFetch("http://x/")).json();
    const four = ["casefile_state", "casefile_attempts", "casefile_attempted_at", "casefile_why"];
    assert.deepEqual(out.cols, four);
    assert.deepEqual(out.old, [{ casefile_state: null, casefile_attempts: null, casefile_attempted_at: null, casefile_why: null, manifest_sha: null }]);
    assert.deepEqual(out.again, four, "a second boot adds nothing");
    assert.deepEqual(out.written, [{ casefile_state: "failed", casefile_attempts: 1, casefile_attempted_at: "2026-02-01T00:00:00Z",
                                     casefile_why: JSON.stringify({ code: "BUCKET_FAILED", step: "bucket_put" }) }]);
    assert.deepEqual(out.owedRows, [{ case_id: "C-OLD" }], "the owed query runs on the platform's SQL (IS NOT, IN)");
  } finally { await mf.dispose(); }
});
