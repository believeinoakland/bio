/* The gated read (R6, R22), the cache's pair (R13), the bar (R14–R16, R21, R24's C-32.9 and R15's C-107.1), the
   table's purge exemption (R23), the ops (K3) and the no-place rule (R25), driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE, ADMIN, MEMBER } from "./fixture.mjs";
import { strengthOps, STRENGTH_BAR_CHECKS, STRENGTH_AXES, barAxisWords } from "../../../src/strength/index.mjs";

const INQ = "INQ-2026-0001-a";
const PROJ = "PROJ-2026-0042-abc";

function projected() {
  const w = world();
  w.bundle("INFO-2026-0001-a");
  w.bundle("INFO-2026-0002-a");
  w.project(PROJ, ["alice"]);
  w.member("alice");
  w.member("carol");
  w.inquiry("INQ-2026-0002-a", [{ target: PROJ, grade: "C", axis: "connection", source: "resolution" }]);
  w.inquiry(INQ, [
    { target: "INFO-2026-0001-a", grade: "B", axis: "connection", source: "resolution" },
    { target: "INQ-2026-0002-a" },
  ]);
  return w;
}

test("R6: NO_ID; an absent or invisible id is NO_SUCH_BUNDLE, one answer; NOT_AN_INQUIRY after sight", () => {
  const w = projected();
  assert.equal(w.s.inquiryStrength({ viewer: MACHINE }).reason, "NO_ID");
  const absent = w.s.inquiryStrength({ id: "INQ-2026-0099-a", viewer: MACHINE });
  const unseen = w.s.inquiryStrength({ id: INQ, viewer: "someone" });
  assert.deepEqual(absent, { ok: false, reason: "NO_SUCH_BUNDLE", target: "INQ-2026-0099-a" });
  assert.deepEqual(unseen, { ok: false, reason: "NO_SUCH_BUNDLE", target: INQ });
  const doc = w.s.inquiryStrength({ id: "INFO-2026-0001-a", viewer: MACHINE });
  assert.equal(doc.reason, "NOT_AN_INQUIRY");
  assert.equal(doc.object_type, "information");
});

test("R6, R22: ids the viewer may not see are nulled in members and replaced in prose, out_of_view set; record facts stand", () => {
  const w = projected();
  const machine = w.s.inquiryStrength({ id: INQ, viewer: MACHINE });
  assert.equal(machine.ok, true);
  assert.equal(machine.out_of_view, undefined);
  assert.equal(machine.connection.out_of_view, undefined, "a viewer who sees everything gets the derivation verbatim");
  assert.deepEqual(machine.connection, w.s.strengthOf(INQ).connection);
  const carol = w.s.inquiryStrength({ id: INQ, viewer: "member:carol" });
  assert.equal(carol.ok, true);
  const c = carol.connection;
  assert.equal(c.out_of_view, true);
  assert.equal(c.grade, machine.connection.grade, "the grade does not change with the reader");
  assert.equal(c.state, machine.connection.state);
  const hidden = JSON.stringify(c);
  assert.ok(!hidden.includes(PROJ), "the project is named nowhere, fields or prose");
  assert.match(hidden, /an object you may not see/);
  assert.equal(c.weakest.through, null);
  const alice = w.s.inquiryStrength({ id: INQ, viewer: "member:alice" });
  assert.ok(JSON.stringify(alice.connection).includes(PROJ), "a participant sees the project");
  for (const axis of STRENGTH_AXES) assert.ok(axis in carol);
});

test("R6: computed on read, never from a cache: a raised leg below shows at once", () => {
  const w = projected();
  const before = w.s.inquiryStrength({ id: INQ, viewer: MACHINE }).connection.grade;
  w.basis.get("INQ-2026-0002-a")[0].grade = "A";
  const after = w.s.inquiryStrength({ id: INQ, viewer: MACHINE }).connection.grade;
  assert.equal(before, "C");
  assert.equal(after, "B");
});

test("R13: the cache's pair is the capture and connection grade and state of R1–R5, and null for a bundle that is not an inquiry", () => {
  const w = projected();
  const s = w.s.strengthOf(INQ);
  const c = w.s.cacheOf(INQ, true);
  assert.deepEqual(c.capture, { grade: s.capture.grade, state: s.capture.state });
  assert.deepEqual(c.connection, { grade: s.connection.grade, state: s.connection.state });
  assert.equal(w.s.cacheOf("INFO-2026-0001-a", false), null);
});

test("R14: a project's bar: a declared axis carries its letter, an undeclared one is null and stated in words; none is absent, not zero", () => {
  const w = projected();
  w.file(PROJ, "bundle.md", "---\nrequired_strength:\n  capture: B\n  testimony: A\n---\n# P\n");
  const bar = w.s.projectBar(PROJ);
  assert.equal(bar.declared, true);
  assert.equal(bar.capture, "B");
  assert.equal(bar.connection, null);
  assert.ok(!("testimony" in bar), "the bar stays a pair");
  assert.match(bar.detail, /capture B, no bar set on the connection axis/);
  assert.equal(barAxisWords({ capture: null, connection: "C" }), "no bar set on the capture axis, connection C");
  w.project("PROJ-2026-0043-def");
  w.file("PROJ-2026-0043-def", "bundle.md", "---\nrequired_strength:\n  capture: Z\n---\n");
  const none = w.s.projectBar("PROJ-2026-0043-def");
  assert.equal(none.declared, false);
  assert.equal(none.capture, null);
  assert.match(none.detail, /An absent bar is not a bar of zero/);
});

test("R15, R24: a machine is refused C-32.9; a member who is not an active administrator C-107.1; the founder may", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  w.member(MEMBER);
  w.member("admin-gone", "admin", "revoked");
  for (const who of ["", "class:member", "token:daemon"]) {
    const r = w.s.strengthBarSet({ capture: "B", author: who });
    assert.equal(r.reason, "MACHINE_CANNOT_DECLARE", who);
    assert.equal(r.check, "C-32.9");
    assert.equal(r.translation, STRENGTH_BAR_CHECKS.MACHINE_CANNOT_DECLARE.translation);
  }
  for (const who of [MEMBER, "admin-gone", "nobody"]) {
    const r = w.s.strengthBarSet({ capture: "B", author: who });
    assert.equal(r.reason, "STRENGTH_BAR_NOT_ADMIN", who);
    assert.equal(r.check, "C-107.1");
    assert.ok(r.translation.length > 20);
  }
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM group_strength_bar`)[0].n, 0, "nothing was written");
  assert.equal(w.s.strengthBarSet({ capture: "B", author: ADMIN }).ok, true);
});

test("R15: the group named or the producing group; BAD_GRADE; NO_BAR; the answer says it seeds new projects and gates nothing", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  assert.equal(w.s.strengthBarSet({ capture: "E", author: ADMIN }).reason, "BAD_GRADE");
  assert.equal(w.s.strengthBarSet({ author: ADMIN }).reason, "NO_BAR");
  const r = w.s.strengthBarSet({ capture: "B", author: ADMIN });
  assert.equal(r.group, "grp-one");
  assert.equal(r.author, ADMIN);
  assert.equal(r.at, w.clock.now);
  assert.match(r.note, /DEFAULT a project starts from/);
  assert.match(r.note, /gates nothing/);
  const named = w.s.strengthBarSet({ group: "grp-two", connection: "C", author: ADMIN });
  assert.equal(named.group, "grp-two");
  assert.deepEqual(w.rows(`SELECT group_id, capture, connection, author FROM group_strength_bar ORDER BY group_id`),
    [{ group_id: "grp-one", capture: "B", connection: null, author: ADMIN },
     { group_id: "grp-two", capture: null, connection: "C", author: ADMIN }]);
  const u = world({ group: null });
  u.member(ADMIN, "admin");
  const und = u.s.strengthBarSet({ capture: "B", author: ADMIN });
  assert.equal(und.reason, "GROUP_UNDETERMINED");
  assert.ok(und.check);
});

test("R16: target= is refused by name; an unseen project is NO_SUCH_PROJECT; NOT_A_PROJECT; else R14; no project, the group default", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  assert.equal(w.s.strengthBarOf({ target: "INFO-2026-0001-a", viewer: MACHINE }).reason, "BAR_IS_A_PROJECT_PROPERTY");
  const unseen = w.s.strengthBarOf({ project: PROJ, viewer: "member:carol" });
  const absent = w.s.strengthBarOf({ project: "PROJ-2026-0044-zzz", viewer: "member:carol" });
  assert.equal(unseen.reason, "NO_SUCH_PROJECT");
  assert.equal(unseen.detail.replace(PROJ, "X"), absent.detail.replace("PROJ-2026-0044-zzz", "X"));
  assert.equal(w.s.strengthBarOf({ project: INQ, viewer: MACHINE }).reason, "NOT_A_PROJECT");
  const seen = w.s.strengthBarOf({ project: PROJ, viewer: "member:alice" });
  assert.equal(seen.ok, true);
  assert.deepEqual(seen.bar, w.s.projectBar(PROJ));
  const none = w.s.strengthBarOf({ viewer: MACHINE });
  assert.equal(none.bar, null);
  assert.equal(none.seeds_new_projects, true);
  assert.match(none.detail, /no group default is declared/);
  w.s.strengthBarSet({ capture: "A", author: ADMIN });
  const def = w.s.strengthBarOf({ viewer: MACHINE });
  assert.equal(def.group, "grp-one");
  assert.equal(def.bar.capture, "A");
  assert.equal(def.seeds_new_projects, true);
});

test("R21: the bar is a declaration beside the strength, never a gate on the pair", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  const before = w.s.strengthOf(INQ);
  w.s.strengthBarSet({ capture: "A", connection: "A", author: ADMIN });
  w.file(PROJ, "bundle.md", "---\nrequired_strength:\n  connection: A\n---\n");
  assert.deepEqual(w.s.strengthOf(INQ), before, "a bar above the pair changes nothing about the pair");
  assert.equal(w.s.inquiryStrength({ id: INQ, viewer: MACHINE }).ok, true);
});

test("R23: group_strength_bar is keyed by group and survives a whole-store purge as an instance setting", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  w.s.strengthBarSet({ capture: "B", author: ADMIN });
  const cols = w.rows(`PRAGMA table_info(group_strength_bar)`);
  assert.deepEqual(cols.filter((c) => c.pk).map((c) => c.name), ["group_id"]);
  assert.ok(!cols.some((c) => c.name === "bundle_id"));
  w.record.purge({});
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM group_strength_bar`)[0].n, 1);
  w.record.purge({ bundleId: PROJ });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM group_strength_bar`)[0].n, 1);
});

test("R6, R16: the ops route to the services with the control plane's stamps (K3)", () => {
  const w = projected();
  const op = (name, qs, body = null) => strengthOps(w.s, new URL(`http://x/?${qs}`), body)[name]();
  assert.deepEqual(op("strength", `id=${INQ}`), w.s.strengthOf(INQ));
  assert.deepEqual(op("inquirystrength", `id=${INQ}&viewer=member:carol`), w.s.inquiryStrength({ id: INQ, viewer: "member:carol" }));
  assert.equal(op("versionstrength", `id=${INQ}&viewer=${MACHINE}`).reason, "VERSION_STRENGTH_NO_VERSION");
  assert.equal(op("partitionindependence", `id=${INQ}&viewer=${MACHINE}`, { partition: [[0], [1]] }).ok, true);
  assert.equal(op("strengthbar", `author=${MEMBER}`, { capture: "B", author: ADMIN }).reason, "STRENGTH_BAR_NOT_ADMIN",
               "the stamped author wins over a body's");
  assert.equal(op("strengthbarof", `target=${INQ}`).reason, "BAR_IS_A_PROJECT_PROPERTY");
});

test("R25: no place is named in this module's answers", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  const out = JSON.stringify([
    w.s.strengthOf(INQ), w.s.inquiryStrength({ id: INQ, viewer: "member:carol" }), w.s.projectBar(PROJ),
    w.s.strengthBarSet({ capture: "B", author: ADMIN }), w.s.strengthBarSet({ author: "class:member" }),
    w.s.strengthBarOf({ target: INQ }), w.s.versionStrength({ viewer: MACHINE }),
    w.s.partitionIndependence({ id: INQ, viewer: MACHINE, partition: "x" }),
    Object.values(STRENGTH_BAR_CHECKS),
  ]);
  assert.doesNotMatch(out, /oakland|alameda|california|berkeley/i);
});
