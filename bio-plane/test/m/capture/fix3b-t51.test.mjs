/* capture, T51 fix round 3 (C9, C14, C16; K4356): at the module's interface, over the capture store (fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, H } from "./fixture.mjs";
import { MULTIPART_KEEP_MAX } from "../../../src/acquisition/index.mjs";
import { captureOps, DECLARED_OPS } from "../../../src/capture/index.mjs";
import { CAPTURE_PURGED_TABLES } from "../../../src/capture/schema.mjs";

const NOW = "2026-03-11T00:00:00Z";
const ids = (r) => r.held.map((x) => x.bundle_id);

/* PROJ-A (m1 takes part, m2 does not) holds INFO-A1 (capture 1) and INFO-A2 (capture 2); PROJ-B (both take part) holds INFO-B1 (capture 3).
   Every register row records a size, INFO-A2's over what is kept whole. */
function world({ evidence = null } = {}) {
  const f = fresh({ evidence });
  const s = f.s;
  for (const m of ["m1", "m2"]) s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  for (const p of ["PROJ-A", "PROJ-B"]) s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES (?, 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`, p);
  const part = (p, m) => s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?, ?, 'active', '2026-01-01', '2026-01-01')`, p, m);
  part("PROJ-A", "m1"); part("PROJ-B", "m1"); part("PROJ-B", "m2");
  const doc = (id, project, n, bytes, created) => {
    s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project) VALUES (?, 'information', 'g', ?, 'collected', ?, ?, 'x', 1, ?)`, id, `title ${id}`, created, created, project);
    s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, registered, bytes) VALUES (?, ?, 'x', '2026-01-01T00:00:00.000Z', ?)`, H(String(n)), id, bytes);
    f.c.recordCaptureActor({ captureSha: H(String(n)), actor: "m1", at: created });
  };
  doc("INFO-A1", "PROJ-A", 1, 10, "2026-01-01T00:00:00Z");
  doc("INFO-A2", "PROJ-A", 2, MULTIPART_KEEP_MAX + 1, "2026-01-02T00:00:00Z");
  doc("INFO-B1", "PROJ-B", 3, 30, "2026-01-03T00:00:00Z");
  return f;
}
const seen = (f) => [...f.rows(`SELECT capture_sha, project, by, at FROM seen_in ORDER BY capture_sha, project`)].map((r) => ({ ...r }));

test("R100 (C9): recordSeenIn records that a member filed a held document in a project, once for each (capture, project) at the first instant, declared to the purge; a bad digest, a blank or over-long project and a machine or absent `by` record nothing", () => {
  const f = world();
  assert.deepEqual(f.c.recordSeenIn({ captureSha: H("1"), project: "PROJ-B", by: "member:m1", at: "2026-02-01T00:00:00Z" }), { recorded: true });
  assert.deepEqual(f.c.recordSeenIn({ captureSha: H("1"), project: "PROJ-B", by: "m2", at: "2026-03-01T00:00:00Z" }), { recorded: true });
  assert.deepEqual(seen(f), [{ capture_sha: H("1"), project: "PROJ-B", by: "m1", at: "2026-02-01T00:00:00Z" }], "one row, the first instant and member kept");
  /* control: a second project is a second row; nothing else moved */
  f.c.recordSeenIn({ captureSha: H("1"), project: "PROJ-C", by: "m1" });
  assert.deepEqual(seen(f).map((r) => r.project), ["PROJ-B", "PROJ-C"]);
  for (const bad of [{ captureSha: "xyz", project: "P", by: "m1" }, { captureSha: H("1"), project: "  ", by: "m1" }, { captureSha: H("1"), project: 7, by: "m1" },
                     { captureSha: H("1"), project: "p".repeat(201), by: "m1" }, { captureSha: H("1"), project: "P", by: "class:admin" },
                     { captureSha: H("1"), project: "P", by: "" }, { captureSha: H("1"), project: "P" }, undefined])
    assert.deepEqual(f.c.recordSeenIn(bad), { recorded: false });
  assert.equal(seen(f).length, 2, "nothing more was written");
  assert.ok(CAPTURE_PURGED_TABLES.includes("seen_in"), "declared to record-core's purge as capture's tables are");
  assert.ok(f.core.declaredTables().some((d) => d.module === "capture" && d.name === "seen_in"));
});

test("R77 R100 (C9): a project's list also shows a document seen there, with `also_here` naming its home, and only to a viewer who may see it at its home; the document keeps its one home; a project's own documents list as before", async () => {
  const f = world();
  const before = await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-B", now: NOW });
  assert.deepEqual(ids(before), ["INFO-B1"]);
  f.c.recordSeenIn({ captureSha: H("1"), project: "PROJ-B", by: "member:m1" });
  const r = await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-B", now: NOW });
  assert.deepEqual(ids(r), ["INFO-A1", "INFO-B1"]);
  const by = Object.fromEntries(r.held.map((x) => [x.bundle_id, x]));
  assert.deepEqual(by["INFO-A1"].also_here, { home: "PROJ-A" });
  assert.equal(by["INFO-A1"].project, "PROJ-A", "its home is still PROJ-A");
  assert.ok(!("also_here" in by["INFO-B1"]), "a document whose home is the project carries none");
  assert.deepEqual(by["INFO-B1"], before.held[0], "control: the project's own document lists as before");
  /* the home's own list: the document, no `also_here` */
  const home = await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-A", now: NOW });
  assert.deepEqual(ids(home), ["INFO-A1", "INFO-A2"]);
  assert.ok(home.held.every((x) => !("also_here" in x)));
  /* the picker carries it too */
  const pick = await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-B", now: NOW, fields: "picker" });
  assert.deepEqual(pick.held.map((x) => [x.bundle_id, x.also_here ?? null]), [["INFO-A1", { home: "PROJ-A" }], ["INFO-B1", null]]);
  /* a viewer who may not see the document at its home is not shown it, and the list is as it was for them */
  assert.deepEqual(ids(await f.c.heldCaptures({ viewer: "member:m2", project: "PROJ-B", now: NOW })), ["INFO-B1"]);
  /* a document seen in a project is not listed under another, nor with no project filter twice */
  assert.deepEqual(ids(await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-C", now: NOW })), []);
  assert.deepEqual(ids(await f.c.heldCaptures({ viewer: "member:m1", now: NOW })).sort(), ["INFO-A1", "INFO-A2", "INFO-B1"]);
  assert.ok((await f.c.heldCaptures({ viewer: "member:m1", now: NOW })).held.every((x) => !("also_here" in x)), "no project asked, none seen-in");
  /* the member filter applies to a seen document as to any */
  assert.deepEqual(ids(await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-B", member: "m2", now: NOW })), []);
});

test("R77 (C16): `bundle_id` answers that one document's row only, the store read for that row alone; an unknown id and one the viewer may not see answer alike, no row", async () => {
  const b = bucket();
  const f = world({ evidence: b });
  for (const n of [1, 2, 3]) b.held.set(`bio/captures/${H(String(n))}`, new Uint8Array([n]));
  const all = await f.c.heldCaptures({ viewer: "member:m1", now: NOW });
  const heads = b.calls.length;
  assert.equal(heads, 3, "the list asks the store once for each document");
  const one = await f.c.heldCaptures({ viewer: "member:m1", now: NOW, bundle_id: "INFO-A2" });
  assert.deepEqual(one.held, [all.held.find((x) => x.bundle_id === "INFO-A2")], "the same row the list gives");
  assert.deepEqual([one.truncated, one.next], [false, null]);
  assert.equal(b.calls.length - heads, 1, "the store was read for that row alone");
  assert.deepEqual(b.calls.slice(heads), [["head", `bio/captures/${H("2")}`]]);
  /* the filters still apply to it */
  assert.deepEqual(ids(await f.c.heldCaptures({ viewer: "member:m1", now: NOW, bundle_id: "INFO-A2", project: "PROJ-B" })), []);
  /* control: unknown and unseen read alike and ask the store nothing */
  const calls = b.calls.length;
  const unknown = await f.c.heldCaptures({ viewer: "member:m1", now: NOW, bundle_id: "INFO-NOPE" });
  const unseen = await f.c.heldCaptures({ viewer: "member:m2", now: NOW, bundle_id: "INFO-A1" });
  assert.deepEqual(unknown, unseen);
  assert.deepEqual(unknown.held, []);
  assert.equal(b.calls.length, calls);
  assert.ok(!JSON.stringify(unseen).includes("PROJ-A"), "no holder is named");
  /* blank reads as absent */
  assert.equal((await f.c.heldCaptures({ viewer: "member:m1", now: NOW, bundle_id: "" })).held.length, 3);
});

test("R77 (C14): a picker row answers `whole` from the size the register recorded and asks the evidence store nothing; the full list and the read for one document ask the store, as before", async () => {
  const b = bucket();
  const f = world({ evidence: b });
  for (const n of [1, 2, 3]) b.held.set(`bio/captures/${H(String(n))}`, new Uint8Array([n]));
  const pick = await f.c.heldCaptures({ viewer: "member:m1", now: NOW, fields: "picker", limit: 30 });
  assert.deepEqual(pick.held.map((x) => [x.bundle_id, x.whole]), [["INFO-A1", true], ["INFO-A2", false], ["INFO-B1", true]],
                   "a size the store keeps whole is whole; one past it is held in parts");
  assert.deepEqual(b.calls, [], "no store call for any row");
  assert.deepEqual(Object.keys(pick.held[0]).sort(), ["actor", "bundle_id", "capture", "collected_since", "project", "source", "standing", "title", "whole"]);
  /* the register records nothing: undetermined, and no capture at all: undetermined */
  f.rows(`UPDATE register SET bytes = NULL WHERE bundle_id = 'INFO-B1'`);
  f.rows(`DELETE FROM register WHERE bundle_id = 'INFO-A1'`);
  const odd = await f.c.heldCaptures({ viewer: "member:m1", now: NOW, fields: "picker" });
  assert.deepEqual(odd.held.map((x) => [x.bundle_id, x.whole]), [["INFO-A1", null], ["INFO-A2", false], ["INFO-B1", null]]);
  assert.deepEqual(b.calls, []);
  /* control: the full row is read from the store (INFO-A2's whole object is there, though the register's size says parts) */
  const full = await f.c.heldCaptures({ viewer: "member:m1", now: NOW });
  assert.equal(full.held.find((x) => x.bundle_id === "INFO-A2").whole, true);
  assert.equal(b.calls.length, 2, "a full list asks the store for each document with a capture");
  b.calls.length = 0;
  const single = await f.c.heldCaptures({ viewer: "member:m1", now: NOW, bundle_id: "INFO-A2" });
  assert.equal(single.held[0].whole, true);
  assert.equal(b.calls.length, 1);
});

test("R77 (C16, C14): through the op as the door runs it, `bundle_id` and `fields=picker` reach the read, and the declaration accepts `bundle_id`", async () => {
  const f = world();
  const run = (extra) => captureOps(f.c, new URL("http://x/?" + new URLSearchParams({ op: "heldcaptures", viewer: "member:m1", ...extra })), null, f.c.env).heldcaptures();
  assert.deepEqual(ids(await run({ bundle_id: "INFO-A1" })), ["INFO-A1"]);
  assert.deepEqual(Object.keys((await run({ bundle_id: "INFO-A1", fields: "picker" })).held[0]).includes("age_days"), false);
  assert.ok(DECLARED_OPS.heldcaptures.fields.accepts.includes("bundle_id"));
  /* control: no `bundle_id` is the whole list */
  assert.equal((await run({})).held.length, 3);
});
