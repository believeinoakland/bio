/* following R10, R17 (fix round 6, G46; plan rule 4), platform check L: a portal snapshot written and read back through the real Durable
 * Object SQLite (workerd under Miniflare), not node:sqlite. A probe, not a test (no `.test.mjs`: it boots workerd and takes a minute):
 *   node g46-workerd.probe.mjs <mebibytes>...        (the size of the portal CSV; 1.5 is the J7 shape)
 * The object creates this module's tables with `migrateFollowing`, reads the posted CSV with `readDataset`, stores its rows as the module
 * does (`storedRows`: the row and its pieces in one `transactionSync`, the same statements as `#readPortal`), reads them back by joining
 * the pieces, and answers the largest bound value, the number of pieces, and whether the joined text equals the rows' JSON. Then
 * Miniflare is stopped and started again over the same storage and the read is repeated. The limit the sizes are set from (2,098,176 B
 * passes, 2,252,800 B is refused) is pinned by the extraction probe (`round6-l.probe.mjs limit`). Recorded in build/jobs/T51/following.md. */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Miniflare } from "miniflare";

const sizes = process.argv.slice(2);
if (!sizes.length) { console.error("usage: g46-workerd.probe.mjs <mebibytes>..."); process.exit(2); }
const src = (p) => JSON.stringify(fileURLToPath(new URL(`../../../src/${p}`, import.meta.url)));
const dir = mkdtempSync(join(tmpdir(), "following-g46-"));
const ENTRY = join(dir, "probe.mjs");
writeFileSync(ENTRY, `
import { DurableObject } from "cloudflare:workers";
import { migrateFollowing } from ${src("following/schema.mjs")};
import { readDataset, storedRows } from ${src("following/snapshot.mjs")};
export class Probe extends DurableObject {
  constructor(ctx, env) { super(ctx, env); migrateFollowing(ctx.storage.sql); }
  async fetch(req) {
    const u = new URL(req.url), sql = this.ctx.storage.sql;
    if (u.pathname === "/write") {
      const ds = readDataset(new TextDecoder().decode(await req.arrayBuffer()));
      const st = storedRows(ds.rows);
      this.ctx.storage.transactionSync(() => {
        sql.exec("INSERT INTO portal_snapshots (follow_id, seq, capture_sha, bundle_id, at, rows, why) VALUES (1, 1, 'x', 'INFO-1', 'now', ?, NULL)", st.value);
        st.pieces.forEach((c, i) => sql.exec("INSERT INTO portal_snapshot_parts (follow_id, seq, part, bundle_id, chunk) VALUES (1, 1, ?, 'INFO-1', ?)", i, c));
      });
      return Response.json({ rows: ds.rows.length, pieces: st.pieces.length, text: JSON.stringify(ds.rows).length });
    }
    if (u.pathname === "/read") {
      const snap = sql.exec("SELECT rows FROM portal_snapshots WHERE follow_id=1 AND seq=1").toArray()[0];
      const mark = JSON.parse(snap.rows);
      const parts = sql.exec("SELECT chunk FROM portal_snapshot_parts WHERE follow_id=1 AND seq=1 ORDER BY part").toArray();
      const rows = JSON.parse(parts.map((p) => p.chunk).join(""));
      const big = sql.exec("SELECT max(n) m FROM (SELECT length(CAST(rows AS BLOB)) n FROM portal_snapshots UNION ALL SELECT length(CAST(chunk AS BLOB)) FROM portal_snapshot_parts)").toArray()[0].m;
      return Response.json({ marker: mark, parts: parts.length, rows: rows.length, last: rows.at(-1), largest: big });
    }
    return new Response("?", { status: 404 });
  }
}
export default { fetch: (req, env) => env.PROBE.get(env.PROBE.idFromName("p")).fetch(req) };
`);
const csv = (mib) => {
  const out = ["id,name,status,fee,note\n"];
  let n = out[0].length;
  for (let i = 1; n < mib * 1048576; i++) { const l = `${String(i).padStart(7, "0")},Permit ${String(i).padStart(7, "0")} on Ellery Street,open,100.00,xxxxxxxxxxxxx\n`; out.push(l); n += l.length; }
  return out.join("");
};
const newMiniflare = (persist) => new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { PROBE: { className: "Probe", useSQLite: true } }, durableObjectsPersist: join(persist, "do"),
});
for (const mib of sizes) {
  const persist = mkdtempSync(join(tmpdir(), "following-g46-do-"));
  let mf = newMiniflare(persist);
  try {
    const wrote = await (await mf.dispatchFetch("http://probe/write", { method: "POST", body: csv(Number(mib)) })).json();
    const first = await (await mf.dispatchFetch("http://probe/read")).json();
    await mf.dispose();
    mf = newMiniflare(persist);
    const again = await (await mf.dispatchFetch("http://probe/read")).json();
    console.log(`${mib} MiB CSV: wrote ${JSON.stringify(wrote)}; read ${JSON.stringify({ ...first, last: first.last.id })}; after a restart rows ${again.rows}, pieces ${again.parts}, largest ${again.largest}`);
  } finally { await mf.dispose(); }
}
