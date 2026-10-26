/* capture, T51 fix round 7, G73 and G75 (R101, R77, R96; the walker's A.md:31, A.md:15 and B.md:34), at the module's interface over this module's
   fixture: a 41.5 MB capture held in five parts (the register's `whole` row beside its five parts' rows, the parts sorting below the whole), filed under
   a home project and then filed as seen in another by the digest `heldAt` named, as the Add screen presses it.
   G73  the other project's list holds the document, with `also_here` naming its home, which it keeps; the home's list is as it was;
   G75  the compared copy `heldAt` answers names its document by its title, by address and by digest, and a document with no title answers none. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, sha } from "./fixture.mjs";
import { captureOps } from "../../../src/capture/index.mjs";

const NOW = "2026-10-23T00:00:00Z";
const ids = (r) => r.held.map((x) => x.bundle_id);
const ADDR = "https://www.example.org/budget/adopted-budget-book.pdf";
const WHOLE = sha("whole 41.5 MB"), PARTS = ["0", "1", "2", "3", "4"].map((k) => sha(`part ${k}`)).sort().map((d) => d);
const SIZE = 41502904;

function world({ title = "fy23-25-adopted-budget-book-final-reduced-size.pdf" } = {}) {
  const f = fresh();
  const s = f.s;
  s.db.exec(`ALTER TABLE register ADD COLUMN whole INTEGER`);
  s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('m1', 'c', 'member', 'active', '2026-01-01', '2026-01-01')`);
  for (const p of ["PROJ-A", "PROJ-B"]) {
    s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES (?, 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`, p);
    s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?, 'm1', 'joined', '2026-01-01', '2026-01-01')`, p);
  }
  s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project) VALUES ('INFO-0115', 'information', 'g', ?, 'collected', '2026-10-22T00:00:00Z', '2026-10-22T00:00:00Z', 'x', 1, 'PROJ-A')`, title);
  /* the parts were registered first and sort below the whole; the whole's row is `whole` */
  PARTS.forEach((p, i) => s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, registered, bytes, whole) VALUES (?, 'INFO-0115', 'x', ?, ?, 0)`, p, `2026-10-22T00:00:0${i}.000Z`, 8 * 1024 * 1024));
  s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, registered, bytes, whole) VALUES (?, 'INFO-0115', 'x', '2026-10-22T00:00:09.000Z', ?, 1)`, WHOLE, SIZE);
  s.sql.exec(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved) VALUES (?, ?, ?, 'direct', '2026-10-22T00:00:00Z', '2026-10-22T00:00:00Z')`, ADDR, ADDR, WHOLE);
  return f;
}
const call = (f, body) => captureOps(f.c, new URL("http://x/?" + new URLSearchParams({ op: "captureseenin", by: "member:m1", viewer: "member:m1" })), body, f.c.env).captureseenin();

test("R101 R77 (G73): the digest `heldAt` names for a capture held in five parts is filed as seen in another project, which then lists the document with `also_here` naming its home; the home's list is as it was", async () => {
  const f = world();
  const at = await f.c.heldAt({ address: ADDR, viewer: "member:m1" });
  assert.equal(at.held, true);
  assert.equal(at.copy.sha256, WHOLE, "the copy is the whole");
  const filed = await call(f, { captureSha: at.copy.sha256, project: "PROJ-B" });
  assert.deepEqual(filed, { ok: true, recorded: true, home: "PROJ-A" });
  const inB = await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-B", now: NOW });
  assert.deepEqual(ids(inB), ["INFO-0115"], "the document is listed under the project it was filed in as seen");
  assert.deepEqual(inB.held[0].also_here, { home: "PROJ-A" });
  assert.equal(inB.held[0].project, "PROJ-A", "it keeps its home");
  assert.equal(inB.held[0].capture.sha256, WHOLE);
  const inA = await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-A", now: NOW });
  assert.deepEqual(ids(inA), ["INFO-0115"]);
  assert.equal("also_here" in inA.held[0], false, "the home's own row names no other home");
  /* control: a part's digest is a digest of the same document and files it the same way; one filed already records nothing */
  assert.deepEqual(await call(f, { captureSha: PARTS[0], project: "PROJ-B" }), { ok: true, recorded: true, home: "PROJ-A" });
  assert.deepEqual(ids(await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-B", now: NOW })), ["INFO-0115"], "still one row");
  assert.deepEqual(await call(f, { captureSha: WHOLE, project: "PROJ-B" }), { ok: true, recorded: false, home: "PROJ-A" });
});

test("R96 (G75): the compared copy names its document by its title, by address and by digest; a document with no title answers none, never a word", async () => {
  const f = world();
  for (const how of [{ address: ADDR }, { sha256: WHOLE }]) {
    const at = await f.c.heldAt({ ...how, viewer: "member:m1" });
    assert.equal(at.copy.title, "fy23-25-adopted-budget-book-final-reduced-size.pdf", Object.keys(how)[0]);
    assert.equal(at.copy.document, "INFO-0115");
  }
  const listed = await f.c.heldCaptures({ viewer: "member:m1", bundle_id: "INFO-0115", now: NOW });
  assert.equal(listed.held[0].title, (await f.c.heldAt({ address: ADDR, viewer: "member:m1" })).copy.title, "the same name the held list gives");
  const bare = world({ title: "" });
  assert.equal((await bare.c.heldAt({ address: ADDR, viewer: "member:m1" })).copy.title, null);
  const none = await bare.c.heldAt({ address: "https://www.example.org/other.pdf", viewer: "member:m1" });
  assert.deepEqual([none.held, none.copy], [false, null]);
});
