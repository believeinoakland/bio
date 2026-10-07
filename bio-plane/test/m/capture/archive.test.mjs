/* capture, T35 (T35-22; DEC-167 (8), N688): the held list groups an archive's files beside it (R77), and the archive
   acts reach `acquisition` through this module's store (R73: `unpack`, `archiveList`, `memberOf`, the store's
   `acquisition` and `ownHosts`, R58). At the module's interface, over acquisition's real instance (`acquisitionOf`, its
   R38–R41), an archive captured and opened through this module's `acquire` over a scripted network, and the record's
   promotion emulated as the control plane makes it (a bundle and a register row for the archive and each file). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, network, sha } from "./fixture.mjs";
import { provenance as acquisitionProvenance } from "../acquisition/fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { captureOps, captureOf, HELD_FILES_IN_ROW, READ_LIMIT } from "../../../src/capture/index.mjs";
import { acquisitionOf, memberOf as acquisitionMemberOf } from "../../../src/acquisition/index.mjs";
import { PROVENANCE_SCHEMA } from "../../../src/provenance/schema.mjs";
import { EARNED_CAPTURE_CEILING } from "../../../src/record-grammar/index.mjs";

const URL1 = "https://files.example/set.zip";
const ADMIN = "class:admin";
const route = (c, name, qs = "", body = null) => captureOps(c, new URL(`http://x/${name}?${qs}`), body, c.env)[name]();

/* A world: this module's fixture, provenance as acquisition's tests stand it in (receipts, grade, homes), and acquisition's
   instance over the same storage handed to the store as `acquisition`. Members m1 and m2; project PROJ-1 is m1's. */
function world() {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  for (const t of PROVENANCE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n").split(";")) if (t.trim()) f.s.db.exec(t);
  const prov = acquisitionProvenance({ sql: f.s.sql });
  f.c.provenance = prov;
  f.c.acquisition = acquisitionOf({ storage: f.s }, { record: f.core, provenance: prov, membership: { isAdministrator: () => false } });
  for (const m of ["m1", "m2"])
    f.s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES ('PROJ-1', 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`);
  f.s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES ('PROJ-1', 'm1', 'active', '2026-01-01', '2026-01-01')`);
  return { ...f, prov };
}
/* Capture an archive through `acquire` (a member session, m1), which opens it (acquisition R40), then promote it and
   its files as the control plane does: an Information document at `collected` for each, in `project`. */
async function captured(w, entries, { url = URL1, id = "ZIP", project = null, created = "2026-03-01T00:00:00Z" } = {}) {
  const z = makeZip(entries);
  const net = network({ [url]: () => new Response(z, { headers: { "content-type": "application/zip" } }) });
  let r;
  try { r = await w.c.acquire({ locator: url }, { cls: "member", member: true, sessMember: "m1", storeName: "bio" }); }
  finally { net.restore(); }
  assert.equal(r.body.ok, true);
  const promote = (bundleId, digest, title) => {
    w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                  VALUES (?, 'information', 'g', ?, 'collected', ?, ?, 'x', 1, ?)`, bundleId, title, created, created, project);
    w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path) VALUES (?, ?, 'x')`, digest, bundleId);
    w.prov.homes[digest] = bundleId;
  };
  promote(`INFO-${id}`, sha(z), `archive ${id}`);
  const docs = (r.body.unpack && r.body.unpack.documents) || [];
  for (const d of docs) promote(`INFO-${id}-${d.container.index}`, d.capture.sha256, `file ${d.container.index}`);
  return { z, digest: sha(z), unpacked: r.body.unpack, files: docs.map((d) => ({ index: d.container.index, sha256: d.capture.sha256, id: `INFO-${id}-${d.container.index}` })) };
}
/* A plain held document, not from any archive. */
function plain(w, id, { created = "2026-01-01T00:00:00Z", project = null } = {}) {
  w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                VALUES (?, 'information', 'g', ?, 'collected', ?, ?, 'x', 1, ?)`, id, `title ${id}`, created, created, project);
}
const ids = (r) => r.held.map((x) => x.bundle_id);

test("R77 (DEC-167 (8)): an archive's document is one row carrying acquisition's summary and its held files beside it, in index order, each {document, sha256, index, name, grade, eligible}; the files are not rows of their own", async () => {
  const w = world();
  plain(w, "INFO-PLAIN");
  const a = await captured(w, [{ name: "dir/", data: "", method: 0 }, { name: "b.txt", data: "bee" }, { name: "a.txt", data: "ay" }]);
  assert.equal(a.files.length, 2, "two files cut out and filed");
  const r = await w.c.heldCaptures({ viewer: ADMIN, now: "2026-03-11T00:00:00Z" });
  assert.deepEqual(ids(r), ["INFO-PLAIN", "INFO-ZIP"], "the archive is one row; its files are beside it, not rows");
  const row = r.held.find((x) => x.bundle_id === "INFO-ZIP");
  const list = await w.c.acquisition.archiveList({ archiveSha: a.digest, viewer: ADMIN });
  assert.deepEqual(row.archive, { sha256: a.digest, entries: 3, filed: 2, already_held: 0, not_filed: 0, waiting: 0 });
  assert.equal(row.archive.entries, list.archive.entries);
  assert.deepEqual(row.files, [
    { document: "INFO-ZIP-1", sha256: sha("bee"), index: 1, name: "b.txt", grade: EARNED_CAPTURE_CEILING, eligible: null },
    { document: "INFO-ZIP-2", sha256: sha("ay"), index: 2, name: "a.txt", grade: EARNED_CAPTURE_CEILING, eligible: null }]);
  assert.deepEqual([row.files_total, row.files_truncated], [2, false]);
  assert.equal(r.held.find((x) => x.bundle_id === "INFO-PLAIN").archive, undefined, "a document of no archive carries no archive field");
  /* R78's examination is asked of each file too */
  const w2 = world();
  const b = await captured(w2, [{ name: "x.txt", data: "ex" }]);
  w2.c.registerReader("batch-examination", "ratification", (id) => (id === b.files[0].id ? { eligible: true } : { eligible: false, class: "crucial", reason: "r" }));
  const row2 = (await w2.c.heldCaptures({ viewer: ADMIN })).held[0];
  assert.deepEqual([row2.eligible, row2.files[0].eligible], [false, true]);
});

test("R77: `limit` counts rows, never files: a page of one row holds an archive and all its files, and paging visits every row once, skipping no row and never listing a file beside its archive as a row", async () => {
  const w = world();
  plain(w, "INFO-A", { created: "2026-01-01T00:00:00Z" });
  await captured(w, [{ name: "1.txt", data: "one" }, { name: "2.txt", data: "two" }, { name: "3.txt", data: "three" }], { created: "2026-02-01T00:00:00Z" });
  plain(w, "INFO-B", { created: "2026-04-01T00:00:00Z" });
  const whole = ids(await w.c.heldCaptures({ viewer: ADMIN }));
  assert.deepEqual(whole, ["INFO-A", "INFO-ZIP", "INFO-B"]);
  const seen = [];
  let after = null;
  for (let n = 0; n < 10; n++) {
    const p = await w.c.heldCaptures({ viewer: ADMIN, limit: 1, after });
    assert.equal(p.held.length, 1);
    seen.push(...ids(p));
    if (p.held[0].bundle_id === "INFO-ZIP") assert.equal(p.held[0].files.length, 3, "the archive's files ride with its row");
    if (!p.truncated) break;
    after = p.next;
  }
  assert.deepEqual(seen, whole);
  for (const [sort, dir] of [["source", "asc"], ["project", "desc"], ["age", "asc"]]) {
    const all = ids(await w.c.heldCaptures({ viewer: ADMIN, sort, dir }));
    assert.equal(all.length, 3, `${sort} ${dir}`);
    assert.ok(!all.some((x) => /^INFO-ZIP-/.test(x)), `${sort} ${dir}: no file listed beside its archive is a row`);
  }
});

test(`R77: an archive's row carries at most HELD_FILES_IN_ROW (${HELD_FILES_IN_ROW}) files, with files_total and files_truncated; the rest are read through archiveList`, async () => {
  const w = world();
  const n = HELD_FILES_IN_ROW + 5;
  const a = await captured(w, Array.from({ length: n }, (_, i) => ({ name: `f${String(i).padStart(3, "0")}.txt`, data: `file ${i}` })));
  assert.equal(a.files.length, n);
  const row = (await w.c.heldCaptures({ viewer: ADMIN })).held[0];
  assert.deepEqual([row.files.length, row.files_total, row.files_truncated], [HELD_FILES_IN_ROW, n, true]);
  assert.deepEqual(row.files.map((f) => f.index), Array.from({ length: HELD_FILES_IN_ROW }, (_, i) => i), "the first by index");
  const rest = await w.c.archiveList({ archiveSha: a.digest, viewer: ADMIN, state: "filed", limit: READ_LIMIT.max });
  assert.equal(rest.entries.length, n, "every file read through archiveList");
});

test("R77 R79 R81: setting an archive aside sets none of its files aside; while it is not a row, each held file is a row of its own carrying archive {sha256}; a file set aside leaves the list and its archive's files; restored, they group again", async () => {
  const w = world();
  const a = await captured(w, [{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }]);
  assert.equal(w.c.setAside({ ids: ["INFO-ZIP-1"], reason: "a duplicate", author: "member:m1", viewer: ADMIN }).ok, true);
  let r = await w.c.heldCaptures({ viewer: ADMIN });
  assert.deepEqual(ids(r), ["INFO-ZIP"]);
  assert.deepEqual(r.held[0].files.map((f) => f.document), ["INFO-ZIP-0"], "a file set aside is not beside its archive");
  assert.equal(r.held[0].files_total, 1);
  assert.equal(w.c.setAside({ ids: ["INFO-ZIP"], reason: "not ours", author: "member:m1", viewer: ADMIN }).ok, true);
  r = await w.c.heldCaptures({ viewer: ADMIN });
  assert.deepEqual(ids(r), ["INFO-ZIP-0"], "the archive set aside: its held file stands as a row of its own; its files stay held");
  assert.deepEqual(r.held[0].archive, { sha256: a.digest });
  assert.equal(r.held[0].files, undefined);
  /* the picked file is set aside and restored by its own id, as any held document */
  assert.equal(w.c.restoreHeld({ ids: ["INFO-ZIP", "INFO-ZIP-1"], reason: "ours after all", author: "member:m1", viewer: ADMIN }).ok, true);
  r = await w.c.heldCaptures({ viewer: ADMIN });
  assert.deepEqual(ids(r), ["INFO-ZIP"]);
  assert.deepEqual(r.held[0].files.map((f) => f.document), ["INFO-ZIP-0", "INFO-ZIP-1"]);
});

test("R77: the member and project filters apply to an archive's row and its files alike; an archive the viewer may not see is no row, and a file it may see then stands as a row of its own", async () => {
  const w = world();
  const a = await captured(w, [{ name: "a.txt", data: "ay" }, { name: "b.txt", data: "bee" }], { project: "PROJ-1" });
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: "member:m1", member: "m1" })), ["INFO-ZIP"], "m1 captured the archive and its files");
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: "member:m1", member: "m2" })), [], "m2 captured neither");
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: "member:m1", project: "PROJ-1" })), ["INFO-ZIP"]);
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: "member:m1", project: "PROJ-2" })), []);
  /* m2 takes no part in PROJ-1: the archive is no row for m2; a file filed outside the project is m2's to see */
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: "member:m2" })), []);
  w.s.sql.exec(`UPDATE bundles SET project = NULL WHERE bundle_id = 'INFO-ZIP-1'`);
  const m2 = await w.c.heldCaptures({ viewer: "member:m2" });
  assert.deepEqual(ids(m2), ["INFO-ZIP-1"]);
  assert.deepEqual(m2.held[0].archive, { sha256: a.digest });
  /* m1 sees the archive: the file outside the project is still beside it, the project filter keeping only the one inside */
  assert.deepEqual((await w.c.heldCaptures({ viewer: "member:m1" })).held[0].files.map((f) => f.document), ["INFO-ZIP-0", "INFO-ZIP-1"]);
  assert.deepEqual((await w.c.heldCaptures({ viewer: "member:m1", project: "PROJ-1" })).held[0].files.map((f) => f.document), ["INFO-ZIP-0"]);
});

test("R77: a memberOf that fails reads as no archive (the document stands as a row, never hidden), and the list writes nothing", async () => {
  const w = world();
  await captured(w, [{ name: "a.txt", data: "ay" }]);
  const everything = () => w.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((t) => [t.name, JSON.stringify(w.rows(`SELECT * FROM ${t.name}`))]);
  const before = everything();
  await w.c.heldCaptures({ viewer: ADMIN });
  assert.deepEqual(everything(), before, "writes nothing");
  w.c.memberOf = () => { throw new Error("down"); };
  w.c.archiveList = async () => { throw new Error("down"); };
  assert.deepEqual(ids(await w.c.heldCaptures({ viewer: ADMIN })), ["INFO-ZIP", "INFO-ZIP-0"]);
});

/* ---- R73, R58: the archive acts through this store ---- */

test("R73 (T35): unpack, archiveList and memberOf answer as acquisition's with this store handed in; the routes take the archive and the stamps, never the body's who", async () => {
  const w = world();
  const a = await captured(w, [{ name: "a.txt", data: "ay" }]);
  assert.deepEqual(w.c.memberOf(sha("ay")), acquisitionMemberOf(w.c, sha("ay")));
  assert.deepEqual(w.c.memberOf(sha("ay")), [{ archiveSha: a.digest, index: 0 }]);
  assert.deepEqual(w.c.memberOf("not a sha"), []);
  assert.deepEqual(await w.c.archiveList({ archiveSha: a.digest, viewer: ADMIN }), await w.c.acquisition.archiveList({ archiveSha: a.digest, viewer: ADMIN }));
  const listed = await route(w.c, "archivelist", `archive=${a.digest}&viewer=${encodeURIComponent(ADMIN)}&state=filed`);
  assert.deepEqual([listed.ok, listed.entries.map((e) => e.state)], [true, ["filed"]]);
  assert.equal((await route(w.c, "archivelist", `archive=${a.digest}`)).reason, "ARCHIVE_NOT_HELD", "an unstamped viewer sees nothing");
  /* unpack again: every entry already has its outcome, so nothing is cut again */
  const again = await route(w.c, "unpack", "by=member:m1&cls=member&member=1", { archiveSha: a.digest, by: "class:ai" });
  assert.equal(again.complete, true);
  assert.equal((await route(w.c, "unpack", "cls=ai", { archiveSha: a.digest, by: "member:m1", cls: "member", member: true })).reason,
               "UNPACK_NOT_PERMITTED", "the body's stamps are never read");
});

test("R73 R58 (T35): captureOf builds acquisition's instance for the storage and holds the group's own hosts; a later caller's different acquisition or ownHosts is refused, one taken by default is adopted", () => {
  const w = world();
  const ctx = { storage: { sql: w.s.sql, transactionSync: w.s.transactionSync.bind(w.s), db: w.s.db } };
  const c = captureOf(ctx, { record: w.core, provenance: w.prov });
  assert.equal(c.acquisition, acquisitionOf(ctx, { record: w.core }), "acquisition's one instance for this storage");
  assert.deepEqual(c.ownHosts, []);
  assert.equal(captureOf(ctx, { ownHosts: ["Group.Example", "group.example", "fleet.example"] }), c);
  assert.deepEqual(c.ownHosts, ["group.example", "fleet.example"], "adopted, lower-cased, each once");
  assert.equal(captureOf(ctx, { ownHosts: ["fleet.example", "GROUP.example"] }), c, "the same hosts in another order are the same");
  assert.throws(() => captureOf(ctx, { ownHosts: ["other.example"] }), /ownHosts/);
  assert.throws(() => captureOf(ctx, { acquisition: {} }), /acquisition/);
});
