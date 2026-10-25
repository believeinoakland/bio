/* acquisition R122 (fix round 9, G154 (4); K5006), the platform check: the `offers` column added to an `archive_entries` table made WITHOUT it, on a real
   Durable Object's SQLite (workerd under Miniflare) and not node:sqlite's. The table is made in the old shape, acquisition's `migrate` adds the column
   (`PRAGMA table_info`, then `ALTER TABLE ADD COLUMN`), a member's `op=unpack` files the entries, and the daemon's run offers each again, counted. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { Miniflare } from "miniflare";
import { makeZip } from "../../make-zip.mjs";

const WORKER = fileURLToPath(new URL("./offers-worker.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: WORKER, script: readFileSync(WORKER, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { ARCHIVE: { className: "Archive", useSQLite: true } },
});
after(async () => { await mf.dispose(); });
const ask = async (q, body) => (await mf.dispatchFetch(`http://x/?${q}`, body ? { method: "POST", body } : undefined)).json();

test("R122 (G154 (4)) on workerd: an `archive_entries` table made without `offers` gains the column, and the daemon's `op=unpack` offers a filed entry with no home again", async () => {
  const zip = makeZip(["a.txt", "b.txt"].map((n) => ({ name: n, data: `member ${n} `.repeat(12) })));
  const { sha } = await ask("act=hold", zip);
  const cols = await ask("act=columns");
  assert.equal(cols.before.includes("offers"), false, "the table was made without the column");
  assert.equal(cols.after.includes("offers"), true, "migrate added it (PRAGMA table_info, then ALTER TABLE ADD COLUMN)");
  const first = await ask(`act=unpack&who=member&sha=${sha}`);
  assert.deepEqual([first.ok, first.documents], [true, [0, 1]]);
  const filed = (await ask("act=columns")).rows;
  assert.deepEqual(filed.map((r) => r.state), ["filed", "filed"]);
  const again = await ask(`act=unpack&who=daemon&sha=${sha}`);
  assert.deepEqual([again.ok, again.documents, again.complete], [true, [0, 1], false], "each filed entry with no home is offered again");
  const counted = (await ask("act=columns")).rows;
  console.log(`  [L] workerd: columns before ${JSON.stringify(cols.before.slice(-3))}, after ${JSON.stringify(cols.after.slice(-3))}; offers per entry after the second run ${JSON.stringify(counted.map((r) => r.offers))}`);
  assert.ok(counted.every((r) => r.offers === 2), "the offer is counted on the entry (the first filing is the first offer)");
});
