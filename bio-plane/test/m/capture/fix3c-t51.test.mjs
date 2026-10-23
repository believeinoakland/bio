/* capture, T51 fix round 3 (C9, K4370): R101 `op=captureseenin`, at the module's interface as the door runs it (the ops map over the
   capture store, fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { fresh, H } from "./fixture.mjs";
import { captureOps, DECLARED_OPS } from "../../../src/capture/index.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";
import { PROJECT_AUTHORITY_CHECKS } from "../../../src/membership/checks.mjs";

const NOW = "2026-03-11T00:00:00Z";
const ids = (r) => r.held.map((x) => x.bundle_id);

/* PROJ-A holds INFO-A1 (capture 1); m1 takes part in A and B, m2 in B only (so m2 may not see INFO-A1), m3 in A only (it sees INFO-A1 but
   has not joined B). PROJ-B holds INFO-B1 (capture 3). */
function world() {
  const f = fresh();
  const s = f.s;
  for (const m of ["m1", "m2", "m3"]) s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  for (const p of ["PROJ-A", "PROJ-B"]) s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES (?, 'project', 'g', 'p', 'active', '2026-01-01', '2026-01-01', 'x', 1)`, p);
  const part = (p, m) => s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?, ?, 'joined', '2026-01-01', '2026-01-01')`, p, m);
  part("PROJ-A", "m1"); part("PROJ-B", "m1"); part("PROJ-B", "m2"); part("PROJ-A", "m3");
  const doc = (id, project, n) => {
    s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project) VALUES (?, 'information', 'g', ?, 'collected', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'x', 1, ?)`, id, `title ${id}`, project);
    s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, registered, bytes) VALUES (?, ?, 'x', '2026-01-01T00:00:00.000Z', 10)`, H(String(n)), id);
  };
  doc("INFO-A1", "PROJ-A", 1);
  doc("INFO-B1", "PROJ-B", 3);
  return f;
}
const seen = (f) => [...f.rows(`SELECT capture_sha, project, by, at FROM seen_in ORDER BY capture_sha, project`)].map((r) => ({ ...r }));
/* the call as the door runs it: the stamps in the address, `captureSha` and `project` as the body */
const call = (f, stamps, body) => captureOps(f.c, new URL("http://x/?" + new URLSearchParams({ op: "captureseenin", ...stamps })), body, f.c.env).captureseenin();
const as = (m) => ({ by: `member:${m}`, viewer: `member:${m}` });

test("R101 (C9): a member files a held document in a project through the op, and the project's list then shows it with `also_here`; the document keeps its home", async () => {
  const f = world();
  const out = await call(f, as("m1"), { captureSha: H("1"), project: "PROJ-B" });
  assert.deepEqual(out, { ok: true, recorded: true, home: "PROJ-A" });
  assert.equal(seen(f).length, 1);
  assert.equal(seen(f)[0].by, "m1", "by the session's stamp");
  const list = await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-B", now: NOW });
  assert.deepEqual(ids(list), ["INFO-A1", "INFO-B1"]);
  assert.deepEqual(list.held.find((x) => x.bundle_id === "INFO-A1").also_here, { home: "PROJ-A" });
  assert.equal(list.held.find((x) => x.bundle_id === "INFO-A1").project, "PROJ-A", "its home is still PROJ-A");
  /* control: the home's own list is as it was */
  assert.deepEqual(ids(await f.c.heldCaptures({ viewer: "member:m1", project: "PROJ-A", now: NOW })), ["INFO-A1"]);
});

test("R101 (C9): a second press records nothing new and answers `recorded: false` with `home`; a document filed in its own home records nothing", async () => {
  const f = world();
  await call(f, as("m1"), { captureSha: H("1"), project: "PROJ-B" });
  const again = await call(f, as("m1"), { captureSha: H("1"), project: "PROJ-B" });
  assert.deepEqual(again, { ok: true, recorded: false, home: "PROJ-A" });
  assert.equal(seen(f).length, 1, "one row");
  const first = seen(f)[0];
  assert.deepEqual(await call(f, as("m1"), { captureSha: H("1"), project: "PROJ-B" }), { ok: true, recorded: false, home: "PROJ-A" });
  assert.deepEqual(seen(f)[0], first, "the first instant and member kept");
  /* control: the home itself is no reference */
  assert.deepEqual(await call(f, as("m1"), { captureSha: H("1"), project: "PROJ-A" }), { ok: true, recorded: false, home: "PROJ-A" });
  assert.equal(seen(f).length, 1);
});

test("R101 (C9): a project the member has not joined is refused by membership's row and nothing is recorded; a joined member is not", async () => {
  const f = world();
  /* m3 sees INFO-A1 at its home, but has not joined PROJ-B */
  const no = await call(f, as("m3"), { captureSha: H("1"), project: "PROJ-B" });
  assert.equal(no.ok, false);
  assert.equal(no.code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.equal(no.check, PROJECT_AUTHORITY_CHECKS.PROJECT_ACT_NOT_A_PARTICIPANT.check, "membership's catalogue row, reused");
  assert.equal(no.status, 403);
  assert.deepEqual(seen(f), [], "nothing was recorded");
  /* a project that does not exist is the same refusal, never a recorded row */
  assert.equal((await call(f, as("m1"), { captureSha: H("1"), project: "PROJ-NONE" })).code, "PROJECT_ACT_NOT_A_PARTICIPANT");
  assert.deepEqual(seen(f), []);
  /* control: the joined member files it */
  assert.equal((await call(f, as("m1"), { captureSha: H("1"), project: "PROJ-B" })).recorded, true);
});

test("R101 (C9): a digest no held capture has, and a document whose home the member cannot see, are one refusal with capture's own catalogue row, and name no holder", async () => {
  const f = world();
  const unknown = await call(f, as("m1"), { captureSha: H("9"), project: "PROJ-B" });
  /* m2 has joined PROJ-B but may not see INFO-A1 at PROJ-A */
  const unseen = await call(f, as("m2"), { captureSha: H("1"), project: "PROJ-B" });
  assert.deepEqual(unseen, unknown, "an unseen document and an unknown one read alike");
  assert.equal(unknown.ok, false);
  assert.equal(unknown.code, "CAPTURE_NOT_HELD");
  assert.equal(unknown.status, 404);
  assert.equal(unknown.check, CAPTURE_CHECKS.CAPTURE_NOT_HELD.check);
  assert.equal(unknown.translation, CAPTURE_CHECKS.CAPTURE_NOT_HELD.translation);
  assert.ok(!JSON.stringify(unseen).includes("PROJ-A") && !JSON.stringify(unseen).includes("INFO-A1"), "no holder is named");
  assert.deepEqual(seen(f), [], "nothing was recorded");
  /* a viewer the door did not stamp sees nothing */
  assert.equal((await call(f, { by: "member:m1" }, { captureSha: H("1"), project: "PROJ-B" })).code, "CAPTURE_NOT_HELD");
  assert.deepEqual(seen(f), []);
});

test("R101 (C9): the act is a signed-in member's: a machine or absent `by` is refused MEMBER_SESSION_REQUIRED (403) and a malformed digest or blank project names itself; nothing is recorded", async () => {
  const f = world();
  for (const stamps of [{ by: "class:admin", viewer: "class:admin" }, { viewer: "member:m1" }, { by: "", viewer: "member:m1" }, { by: "member:", viewer: "member:m1" }]) {
    const out = await call(f, stamps, { captureSha: H("1"), project: "PROJ-B" });
    assert.equal(out.reason, "MEMBER_SESSION_REQUIRED", JSON.stringify(stamps));
    assert.equal(out.status, 403);
  }
  for (const [body, field] of [[{ captureSha: "xyz", project: "PROJ-B" }, "captureSha"], [{ project: "PROJ-B" }, "captureSha"],
                               [{ captureSha: H("1"), project: "  " }, "project"], [{ captureSha: H("1") }, "project"],
                               [{ captureSha: H("1"), project: "p".repeat(201) }, "project"]]) {
    const out = await call(f, as("m1"), body);
    assert.equal(out.reason, "REQUIRED_ARGUMENT_MISSING", JSON.stringify(body));
    assert.equal(out.argument, field);
  }
  assert.deepEqual(seen(f), []);
});

test("R101 R97 (C9): `captureseenin` is declared, a member act that requires `captureSha` and `project`, and the declaration holds against the op as the door runs it", async () => {
  const d = DECLARED_OPS.captureseenin;
  assert.equal(d.mutating, true);
  assert.deepEqual([...d.fields.requires].sort(), ["captureSha", "project"]);
  assert.deepEqual([...d.fields.accepts].sort(), ["captureSha", "project"]);
  assert.ok(typeof d.description === "string" && d.description.length > 0);
  const setup = async () => world();
  await declaredOpHolds({ op: "captureseenin", declaration: d,
    call: async (given) => { const f = await setup(); return call(f, as("m1"), given); },
    values: { captureSha: H("1"), project: "PROJ-B" },
    refusedNaming: (answer, field) => !!answer && answer.reason === "REQUIRED_ARGUMENT_MISSING" && answer.argument === field,
    same: (x, y) => x.ok === y.ok && x.recorded === y.recorded && x.home === y.home });
});

test("R101 (C9): a write the record cannot make is a refusal, never `recorded: false` read as a repeat; control: the same call with the table present records", async () => {
  const f = world();
  f.rows(`ALTER TABLE seen_in RENAME TO seen_in_away`);
  const out = await call(f, as("m1"), { captureSha: H("1"), project: "PROJ-B" });
  assert.equal(out.ok, false);
  assert.equal(out.reason, "SEEN_IN_NOT_RECORDED");
  assert.equal(out.status, 502);
  f.rows(`ALTER TABLE seen_in_away RENAME TO seen_in`);
  assert.deepEqual(await call(f, as("m1"), { captureSha: H("1"), project: "PROJ-B" }), { ok: true, recorded: true, home: "PROJ-A" });
});
