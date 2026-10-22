import test from "node:test";
import assert from "node:assert/strict";
const R = "/home/user/bio/bio-plane/test";
const { world, sha } = await import(`${R}/m/acquisition/fixture.mjs`);
const { makeZip } = await import(`${R}/make-zip.mjs`);
const { multipartOfBytes, realChainOf, MIB } = await import("./mp.mjs");
test("acquisition archiveList over a 20 MB three-part zip held by its parts", async () => {
  const zip = Buffer.from(makeZip([{ name: "big.bin", data: Buffer.alloc(20 * MIB, 7), method: 0 }, { name: "a.txt", data: "hello" }]));
  const m = multipartOfBytes("zip", zip);
  console.log("zip", zip.length, "parts", m.held.map((p) => p.bytes).join("+"));
  const ch = await realChainOf(m);
  const w = world();
  for (const p of m.held) await w.b.put(`bio/captures/${p.sha256}`, p.bytesBuf);   /* only the parts are in the evidence store */
  /* provenance: the real one from the real chain answers homeOf / registerHolds / capturesOf / captureGrade */
  const real = ch.w.prov;
  for (const k of ["homeOf", "registerHolds", "capturesOf", "captureGrade"]) w.prov[k] = (...a) => real[k](...a);
  /* sight: membership's tables as its R43 reads them */
  w.rows("CREATE TABLE IF NOT EXISTS members (member_id TEXT PRIMARY KEY, role TEXT, status TEXT)");
  w.rows("CREATE TABLE IF NOT EXISTS project_participants (project_id TEXT, member_id TEXT)");
  w.rows("CREATE TABLE IF NOT EXISTS project_sight (project_id TEXT PRIMARY KEY, setting TEXT)");
  w.rows(`INSERT INTO bundles (bundle_id, object_type, group_id, current_state, created, last_updated, bundle_sha, project) VALUES (?, 'information', 'g', 'collected', 'T', 'T', 'x', 'PROJ-1')`, ch.id);
  w.rows("INSERT INTO project_sight (project_id, setting) VALUES ('PROJ-1', 'hidden')");
  w.rows("INSERT INTO project_participants (project_id, member_id) VALUES ('PROJ-1', 'insider')");
  const ask = (viewer, sha_ = m.whole) => w.acq.archiveList({ archiveSha: sha_, viewer });
  const out = await ask("member:outsider");
  console.log("outsider:", out.ok, out.reason ?? "");
  const ins = await ask("member:insider");
  console.log("insider:", ins.ok, ins.reason ?? "", ins.ok ? JSON.stringify({ archive: { bundle: ins.archive.bundle, bytes: ins.archive.bytes, entries: ins.archive.entries, opened: ins.archive.opened, refused: ins.archive.refused }, entries: ins.entries.map((e) => [e.index, e.name, e.state]) }) : (ins.detail ?? ""));
  /* the pre-R72 shape: remove the whole's row; the same outsider then sees the archive's list */
  ch.w.st.sql.exec(`DELETE FROM register WHERE capture_sha = ?`, m.whole);
  const leak = await ask("member:outsider");
  console.log("outsider, whole row removed (pre-R72 shape):", leak.ok, leak.reason ?? "");
});
