/* bias R49 (D59; T41-12): statementInForce, whether a statement id is in the effective lens for a scope, with its kind
   and text, at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, FM, S, WHY } from "./world.mjs";
import { BIAS_MANIFEST_LIMIT_MAX } from "../../../src/bias/index.mjs";

const A = "BIAS-2026-0001-a", I = "BIAS-2026-0003-inst", J = "BIAS-2026-0000-proj", P = "PROJ-2026-0001-p";
const ADMIN = { reason: WHY, author: "admin", identity: "member:admin", viewer: "admin" };
const OWNER = { reason: WHY, author: "owner", identity: "member:owner", viewer: "member:owner" };
const PROJ = { type: "project", id: P };

/* R16's layered lens: group sets A (s1) and I (s2, s3 locked, s4); the project's J adds p1, nullifies s2 (removed) and
   the locked s3 (kept, a lock violation), and replaces s4 with r4. P is hidden (the world's default). */
async function lensWorld() {
  const w = world();
  await w.group("mo", "owner");
  w.project(P, "owner");
  w.set(A, [S("s1")], "adopted");
  w.set(I, [S("s2"), S("s3", { locked: true, kind: "inference" }), S("s4")], "adopted");
  w.set(J, [S("p1", { kind: "inference", text: "A project inference, stated in full." }), S("n2", { text: "", nullifies: "s2" }),
            S("n3", { text: "", nullifies: "s3" }), S("r4", { nullifies: "s4", text: "A replacement lens for s4, stated in full." })], "adopted");
  w.bias.biasAdopt({ bundleId: A, ...ADMIN });
  w.bias.biasAdopt({ bundleId: I, ...ADMIN });
  w.bias.biasAdopt({ bundleId: J, scope: "project", scopeId: P, ...OWNER });
  w.sif = (statement, scope = PROJ, viewer = "member:owner") => w.bias.statementInForce({ statement, scope, viewer });
  return w;
}

test("R49: in force for a project scope — each statement of the effective set answers in_force true with its kind, text, bundle, level and the lens's hash; a removed, replaced or nullifying id answers false", async () => {
  const w = await lensWorld();
  const m = w.bias.biasManifest({ scope: "project", scopeId: P, viewer: "member:owner", limit: BIAS_MANIFEST_LIMIT_MAX });
  assert.deepEqual(m.statements.map((s) => s.statement_id), ["p1", "r4", "s1", "s3"]);
  /* every statement of the effective set, and exactly its kind and text */
  for (const s of m.statements) {
    const r = w.sif(s.statement_id);
    assert.deepEqual(r, { ok: true, statement: s.statement_id, scope: PROJ, in_force: true, kind: s.kind, text: s.text,
      bundle_id: s.bundle_id, level: s.scope === "project" ? "project" : "group", locked: s.locked,
      statements_sha: m.statements_sha, stated: "this statement is in the lens in force for this scope" }, s.statement_id);
  }
  assert.deepEqual([w.sif("p1").kind, w.sif("p1").level, w.sif("s3").kind, w.sif("s3").locked, w.sif("s3").level],
    ["inference", "project", "inference", true, "group"], "the locked group statement a project nullified stands");
  assert.equal(w.sif("r4").text, "A replacement lens for s4, stated in full.");
  /* negative controls: removed by a nullification (s2), replaced (s4), a nullification with no text (n2, n3), never held */
  for (const id of ["s2", "s4", "n2", "n3", "zz"]) {
    const r = w.sif(id);
    assert.deepEqual([r.ok, r.in_force, r.kind, r.text, r.bundle_id, r.level, r.statements_sha],
      [true, false, null, null, null, null, m.statements_sha], id);
    assert.equal(r.stated, "this statement is not in the lens in force for this scope");
  }
});

test("R49: the group scope reads the group's lens alone; \"instance\" and {type: \"instance\"} are one scope; a project's statements are not in it", async () => {
  const w = await lensWorld();
  const m = w.bias.biasManifest({ viewer: "admin" });
  for (const scope of ["instance", { type: "instance" }, undefined]) {
    const r = w.bias.statementInForce({ statement: "s2", scope, viewer: "admin" });
    assert.deepEqual([r.in_force, r.kind, r.text, r.bundle_id, r.level, r.scope, r.statements_sha],
      [true, "scrutiny", S("s2").text, I, "group", { type: "instance", id: "" }, m.statements_sha], String(scope));
  }
  assert.equal(w.bias.statementInForce({ statement: "s4", viewer: "admin" }).in_force, true, "replaced only in the project's lens");
  assert.equal(w.bias.statementInForce({ statement: "p1", viewer: "admin" }).in_force, false, "a project statement is not the group's");
});

test("R49: the whole effective set, never a page — a statement past the manifest's default page is in force", async () => {
  const w = world();
  await w.group();
  const many = Array.from({ length: 205 }, (_, i) => S(`s${String(i).padStart(3, "0")}`));
  w.set(A, many, "adopted");
  w.bias.biasAdopt({ bundleId: A, ...ADMIN });
  const m = w.bias.biasManifest({ viewer: "admin" });
  assert.deepEqual([m.count, m.total, m.truncated], [200, 205, true]);
  assert.equal(m.statements.some((s) => s.statement_id === "s204"), false, "not on the manifest's first page");
  const r = w.bias.statementInForce({ statement: "s204", viewer: "admin" });
  assert.deepEqual([r.in_force, r.text, r.statements_sha], [true, S("s204").text, m.statements_sha]);
});

test("R49: no lens in force, a pin at proposed, a retired set: in_force false; an adoption whose pinned bytes cannot be read: in_force null, undetermined", async () => {
  const w = world();
  await w.group();
  assert.deepEqual([w.bias.statementInForce({ statement: "s1", viewer: "admin" }).in_force,
                    w.bias.statementInForce({ statement: "s1", viewer: "admin" }).stated],
    [false, "no lens is in force for this scope, so this statement is not in force"]);
  w.set(A, [S("s1")], "proposed");
  w.bias.biasAdopt({ bundleId: A, ...ADMIN });
  assert.equal(w.bias.statementInForce({ statement: "s1", viewer: "admin" }).in_force, false, "a proposed pin puts nothing in force");
  w.promote(A, FM(A, { statements: [S("s1")], current_state: "adopted", prior_state: "proposed" }));
  assert.equal(w.bias.statementInForce({ statement: "s1", viewer: "admin" }).in_force, true, "adopted: in force");
  const pin = w.row(`SELECT bundle_sha FROM bias_adoptions`).bundle_sha;
  w.sql.exec(`UPDATE bias_adoptions SET bundle_sha='0000'`);
  const u = w.bias.statementInForce({ statement: "s1", viewer: "admin" });
  assert.deepEqual([u.ok, u.in_force, u.kind, u.text, u.statements_sha], [true, null, null, null, null]);
  assert.match(u.stated, /^undetermined/);
  w.sql.exec(`UPDATE bias_adoptions SET bundle_sha=?`, pin);
  w.promote(A, FM(A, { statements: [S("s1")], current_state: "retired", prior_state: "adopted" }));
  assert.equal(w.bias.statementInForce({ statement: "s1", viewer: "admin" }).in_force, false, "a retired set is out of force");
});

test("R49: at R13's sight — a project scope the viewer may not see answers exactly as one with no lens; D54: the founder and an administrator not in a hidden project read it so, and at a discoverable one read the lens (negative control)", async () => {
  const w = await lensWorld();
  const none = (await (async () => { const v = world(); await v.group("owner"); v.project(P, "owner");
    return v.bias.statementInForce({ statement: "s1", scope: PROJ, viewer: "member:owner" }); })());
  assert.equal(none.in_force, false);
  for (const viewer of ["member:mo", "nobody", null, "admin", "member:second"])
    assert.deepEqual(w.sif("s1", PROJ, viewer), none, String(viewer));
  w.membership.projectVisibilitySet({ projectId: P, setting: "discoverable", by: "owner", reason: "open to the group" });
  for (const viewer of ["admin", "member:second"])
    assert.deepEqual([w.sif("p1", PROJ, viewer).in_force, w.sif("s3", PROJ, viewer).in_force], [true, true], viewer);
  assert.equal(w.sif("p1", PROJ, "member:mo").in_force, false, "a member outside a discoverable project is at EXISTENCE only");
  assert.equal(w.sif("p1", PROJ, "class:daemon").in_force, true, "a machine viewer sees every bundle");
});

test("R49: a missing or malformed statement id or scope answers in_force false and never throws; synchronous; writes nothing", async () => {
  const w = await lensWorld();
  const before = w.dump();
  for (const statement of [null, undefined, "", "   ", 7, {}, ["s1"]]) {
    const r = w.sif(statement);
    assert.deepEqual([r.ok, r.in_force, r.statement, r.kind, r.text], [true, false, null, null, null], String(statement));
  }
  for (const scope of [{ type: "project" }, { type: "project", id: 7 }, { type: "project", id: "PROJ-2026-9999-x" }])
    assert.equal(w.bias.statementInForce({ statement: "s1", scope, viewer: "member:owner" }).in_force, false, JSON.stringify(scope));
  assert.equal(w.bias.statementInForce().in_force, false, "no argument at all");
  const r = w.sif("s1");
  assert.equal(typeof r.then, "undefined", "synchronous: an answer, not a promise");
  assert.equal(w.dump(), before, "writes nothing");
});
