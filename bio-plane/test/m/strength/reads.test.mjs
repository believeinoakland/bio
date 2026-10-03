/* The gated read (R6, R22), the cache's pair (R13), the bar (R14–R16, R21, R24's C-32.9 and R15's C-107.1), the
   table's purge exemption (R23), the ops (K3) and the no-place rule (R25), driven at the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE, ADMIN, MEMBER, REASON } from "./fixture.mjs";
import { strengthOps, STRENGTH_BAR_CHECKS, STRENGTH_AXES, barAxisWords } from "../../../src/strength/index.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";
import { migrateStrength } from "../../../src/strength/schema.mjs";

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
  const noId = w.s.inquiryStrength({ viewer: MACHINE });
  assert.equal(noId.reason, "NO_ID");
  assert.match(noId.detail, /pass id=<record id>/);
  const absent = w.s.inquiryStrength({ id: "INQ-2026-0099-a", viewer: MACHINE });
  const unseen = w.s.inquiryStrength({ id: INQ, viewer: "someone" });
  assert.deepEqual(absent, { ok: false, reason: "NO_SUCH_BUNDLE", target: "INQ-2026-0099-a" });
  assert.deepEqual(unseen, { ok: false, reason: "NO_SUCH_BUNDLE", target: INQ });
  const doc = w.s.inquiryStrength({ id: "INFO-2026-0001-a", viewer: MACHINE });
  assert.equal(doc.reason, "NOT_AN_INQUIRY");
  assert.equal(doc.object_type, "information");
  /* N458: members read "record", never "bundle", in a refusal's sentence. */
  for (const r of [noId, doc]) assert.doesNotMatch(r.detail, /bundle/i);
});

/* Every id field a named member may carry, and every list of named members an axis or a ground holds. */
const ID_FIELDS = ["bundle_id", "target_id", "inherited_from", "through"];
const membersOf = (axis) => [axis, ...(axis.grounds ?? [])].flatMap((p) =>
  [...(p.weakest !== undefined ? [p.weakest] : []), ...(p.not_load_bearing ?? []), ...(p.undetermined_at ?? [])]);

test("R6, R22: a member the viewer may not see is withheld whole, fields and prose; out_of_view says only that; record facts stand", () => {
  const w = projected();
  const machine = w.s.inquiryStrength({ id: INQ, viewer: MACHINE });
  assert.equal(machine.ok, true);
  assert.equal(machine.out_of_view, undefined);
  for (const axis of STRENGTH_AXES) {
    assert.equal(machine[axis].out_of_view, undefined, "a viewer who sees everything gets the derivation verbatim");
    assert.deepEqual(machine[axis], w.s.strengthOf(INQ)[axis]);
  }
  const carol = w.s.inquiryStrength({ id: INQ, viewer: "member:carol" });
  assert.equal(carol.ok, true);
  assert.equal(carol.out_of_view, true);
  const c = carol.connection;
  assert.equal(c.out_of_view, true);
  assert.equal(c.grade, machine.connection.grade, "the grade does not change with the reader");
  assert.equal(c.state, machine.connection.state);
  const all = JSON.stringify(carol);
  assert.ok(!all.includes(PROJ), "the project is named nowhere, fields or prose");
  assert.doesNotMatch(all, /may not see|withheld|\bhidden\b/, "no placeholder stands where it was");
  /* The seen leg through which the unseen one was reached stays, with no `through` key at all. */
  assert.equal(c.weakest.target_id, "INQ-2026-0002-a");
  assert.ok(!("through" in c.weakest));
  assert.equal(machine.connection.weakest.through, PROJ);
  assert.match(c.detail, /^connection C — /);
  assert.match(c.detail, /Part of what this rests on is out of your view\.$/);
  for (const m of membersOf(c)) for (const f of ID_FIELDS) assert.notEqual(m?.[f], null, `no null ${f}`);
  const alice = w.s.inquiryStrength({ id: INQ, viewer: "member:alice" });
  assert.ok(JSON.stringify(alice.connection).includes(PROJ), "a participant sees the project");
  assert.equal(alice.out_of_view, undefined);
  for (const axis of STRENGTH_AXES) assert.ok(axis in carol);
});

/* Legs to projects carol may not see, in every place a member is named: the weakest, a ground's weakest, the not
   load-bearing list, and a load-bearing member no list names. `n` copies of each unseen leg. */
function hiddenWorld(n) {
  const w = world();
  w.member("alice");
  w.member("carol");
  w.bundle("INFO-2026-0001-a");
  w.bundle("INFO-2026-0002-a");
  const legs = [{ target: "INFO-2026-0001-a", grade: "C", axis: "connection", source: "resolution" },
                { target: "INFO-2026-0002-a", grade: "B", axis: "connection", source: "resolution", ground: "seen" }];
  for (let k = 0; k < n; k++) {
    const p = (i) => `PROJ-2026-00${i}${k}-hid`;
    for (const i of [1, 2, 3, 4]) w.project(p(i), ["alice"]);
    legs.push({ target: p(1), grade: "D", axis: "connection", source: "resolution" },
              { target: p(2), grade: "A", axis: "connection", source: "resolution" },
              { target: p(3) },
              { target: p(4), grade: "D", axis: "connection", source: "resolution", ground: "unseen" });
  }
  w.inquiry(INQ, legs);
  return w;
}

test("R6: no count of what is withheld can be read from the answer: one unseen leg of each kind and three answer alike", () => {
  const one = hiddenWorld(1), three = hiddenWorld(3);
  const all1 = one.s.strengthOf(INQ), all3 = three.s.strengthOf(INQ);
  assert.notEqual(all1.connection.population, all3.connection.population, "the record's own counts differ");
  const a = one.s.inquiryStrength({ id: INQ, viewer: "member:carol" });
  const b = three.s.inquiryStrength({ id: INQ, viewer: "member:carol" });
  assert.deepEqual(a, b, "the same answer, byte for byte, whatever the number withheld");
  assert.equal(a.out_of_view, true);
  for (const axis of STRENGTH_AXES) {
    const x = a[axis];
    assert.equal(x.out_of_view, true);
    assert.equal(x.grade, all1[axis].grade, "the grade stands");
    assert.equal(x.state, all1[axis].state);
    for (const p of [x, ...(x.grounds ?? [])]) {
      assert.ok(!("load_bearing" in p) && !("population" in p), "no count");
      assert.ok(p.weakest === null || !("weakest" in p) || p.weakest.target_id.startsWith("INFO-"),
                "the weakest is named only when seen");
    }
    for (const m of membersOf(x)) {
      if (m == null) continue;
      for (const f of ID_FIELDS) if (f in m) assert.ok(m[f] && !m[f].startsWith("PROJ-"), `${f} is seen`);
    }
  }
  const text = JSON.stringify(a);
  assert.doesNotMatch(text, /PROJ-/);
  assert.doesNotMatch(text, /may not see|withheld|\bhidden\b/);
  /* The axis's weakest (a D on an unseen project) is withheld, its grade standing; the seen ground keeps its own. */
  assert.equal(a.connection.grade, "D");
  assert.ok(!("weakest" in a.connection));
  assert.match(a.connection.detail, /^connection D — no stronger than the weakest connection it rests on\. /,
               "the sentence still says what it derived");
  const g = Object.fromEntries(a.connection.grounds.map((x) => [x.ground, x]));
  assert.equal(g.seen.weakest.target_id, "INFO-2026-0002-a");
  assert.ok(!("weakest" in g.unseen));
  assert.deepEqual(a.connection.grounds.flatMap((x) => x.not_load_bearing), [], "the ungraded unseen leg is in no list");
  /* A participant sees every member and every count. */
  const alice = three.s.inquiryStrength({ id: INQ, viewer: "member:alice" });
  assert.equal(alice.out_of_view, undefined);
  assert.deepEqual(alice.connection, all3.connection);
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
    const r = w.s.strengthBarSet({ reason: REASON, capture: "B", author: who });
    assert.equal(r.reason, "MACHINE_CANNOT_DECLARE", who);
    assert.equal(r.check, "C-32.9");
    assert.equal(r.translation, STRENGTH_BAR_CHECKS.MACHINE_CANNOT_DECLARE.translation);
  }
  for (const who of [MEMBER, "admin-gone", "nobody"]) {
    const r = w.s.strengthBarSet({ reason: REASON, capture: "B", author: who });
    assert.equal(r.reason, "STRENGTH_BAR_NOT_ADMIN", who);
    assert.equal(r.check, "C-107.1");
    assert.ok(r.translation.length > 20);
  }
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM group_strength_bar`)[0].n, 0, "nothing was written");
  assert.equal(w.s.strengthBarSet({ reason: REASON, capture: "B", author: ADMIN }).ok, true);
});

test("R15: the group named or the producing group; BAD_GRADE; NO_BAR; the answer says it seeds new projects and gates nothing", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  /* N208: BAD_GRADE is strength's own condition with its own row in C-107, for either axis, and writes nothing. */
  for (const [bar, axis] of [[{ capture: "E" }, "capture"], [{ capture: "B", connection: "AA" }, "connection"],
                             [{ connection: 3 }, "connection"]]) {
    const bad = w.s.strengthBarSet({ ...bar, author: ADMIN });
    assert.equal(bad.ok, false);
    assert.equal(bad.reason, "BAD_GRADE");
    assert.equal(bad.code, "BAD_GRADE");
    assert.equal(bad.axis, axis);
    assert.equal(bad.check, "C-107.2");
    assert.equal(bad.check, STRENGTH_BAR_CHECKS.BAD_GRADE.check);
    assert.equal(bad.translation, STRENGTH_BAR_CHECKS.BAD_GRADE.translation);
    assert.match(bad.detail, /must be one of A, B, C, D, or null/);
  }
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM group_strength_bar`)[0].n, 0, "a refused grade writes nothing");
  assert.equal(w.s.strengthBarSet({ author: ADMIN }).reason, "NO_BAR");
  const r = w.s.strengthBarSet({ reason: REASON, capture: "B", author: ADMIN });
  assert.equal(r.group, "grp-one");
  assert.equal(r.author, ADMIN);
  assert.equal(r.at, w.clock.now);
  assert.match(r.note, /DEFAULT a project starts from/);
  assert.match(r.note, /gates nothing/);
  const named = w.s.strengthBarSet({ reason: REASON, group: "grp-two", connection: "C", author: ADMIN });
  assert.equal(named.group, "grp-two");
  assert.deepEqual(w.rows(`SELECT group_id, capture, connection, author FROM group_strength_bar ORDER BY group_id`),
    [{ group_id: "grp-one", capture: "B", connection: null, author: ADMIN },
     { group_id: "grp-two", capture: null, connection: "C", author: ADMIN }]);
  const u = world({ group: null });
  u.member(ADMIN, "admin");
  const und = u.s.strengthBarSet({ reason: REASON, capture: "B", author: ADMIN });
  assert.equal(und.reason, "GROUP_UNDETERMINED");
  assert.ok(und.check);
});

/* R15 (DEC-105, H12; DEC-124): the bar's honest note, in the ruling's words with the product named Civicsmith, as a
   reader checks for it. */
const HONEST_NOTE = "Civicsmith has no guidance yet on what particular audiences expect. Readers see the bar you set in these words.";
const noteHolds = (answer) => assert.ok(typeof answer.note === "string" && answer.note.includes(HONEST_NOTE),
                                        "the answer's note carries DEC-105's words");

test("R15 (DEC-105): the answer's note carries the bar's honest note in DEC-105's words, beside that it seeds new projects and gates nothing (negative control: an answer without it fails)", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  const r = w.s.strengthBarSet({ reason: REASON, capture: "B", author: ADMIN });
  assert.equal(r.ok, true);
  noteHolds(r);
  assert.match(r.note, /DEFAULT a project starts from/);
  assert.match(r.note, /It gates nothing\./);
  assert.ok(!r.note.includes("CivicOS"), "the product is named as DEC-124 names it");
  for (const stripped of [{ ...r, note: r.note.replace(HONEST_NOTE, "") }, { ...r, note: undefined },
                          { ...r, note: HONEST_NOTE.slice(0, 40) },
                          { ...r, note: r.note.replace("Civicsmith", "CivicOS") }])
    assert.throws(() => noteHolds(stripped), assert.AssertionError);
});

test("R15, C-107.3 (DEC-88): a reason absent, not a string, blank or of 2,001 characters is refused BAR_NO_REASON, asked after NO_BAR, with nothing written and the earlier default and its reason unchanged", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  const first = w.s.strengthBarSet({ reason: "  The first reason.  ", capture: "C", author: ADMIN });
  assert.equal(first.ok, true);
  assert.equal(first.reason, "The first reason.", "recorded trimmed, as judged");
  const held = () => w.rows(`SELECT group_id, capture, connection, author, at, reason FROM group_strength_bar`);
  const before = held();
  w.clock.now = "2026-09-29T00:00:00.000Z";
  for (const reason of [undefined, null, 42, ["a reason"], { text: "a reason" }, "", "   \n\t ", "x".repeat(2001),
                        ` ${"y".repeat(2001)} `]) {
    const r = w.s.strengthBarSet({ reason, capture: "A", connection: "B", author: ADMIN });
    assert.equal(r.ok, false, String(reason).slice(0, 20));
    assert.equal(r.reason, "BAR_NO_REASON");
    assert.equal(r.code, "BAR_NO_REASON");
    assert.equal(r.check, "C-107.3");
    assert.equal(r.translation, STRENGTH_BAR_CHECKS.BAR_NO_REASON.translation);
    assert.equal(r.limit, 2000);
    assert.deepEqual(held(), before, "nothing written: the earlier default and its reason stand");
  }
  assert.match(w.s.strengthBarSet({ capture: "A", author: ADMIN }).detail, /in your own words/);
  assert.match(w.s.strengthBarSet({ reason: " ", capture: "A", author: ADMIN }).detail, /blank/);
  assert.match(w.s.strengthBarSet({ reason: "z".repeat(2001), capture: "A", author: ADMIN }).detail, /2001 characters/);
  /* Order: every earlier refusal is asked first. */
  assert.equal(w.s.strengthBarSet({ author: ADMIN }).reason, "NO_BAR");
  assert.equal(w.s.strengthBarSet({ capture: "E", author: ADMIN }).reason, "BAD_GRADE");
  assert.equal(w.s.strengthBarSet({ capture: "A", author: MEMBER }).reason, "STRENGTH_BAR_NOT_ADMIN");
  assert.equal(w.s.strengthBarSet({ capture: "A", author: MACHINE }).reason, "MACHINE_CANNOT_DECLARE");
  /* At the bound it is accepted, and replaces the default with its own reason. */
  const at = w.s.strengthBarSet({ reason: "r".repeat(2000), capture: "A", author: ADMIN });
  assert.equal(at.ok, true);
  assert.deepEqual(held(), [{ group_id: "grp-one", capture: "A", connection: null, author: ADMIN, at: w.clock.now,
                              reason: "r".repeat(2000) }]);
});

test("R15, R16 (DEC-88): a reasoned bar is read back by strengthBarOf with the default; one set before DEC-88 reads its reason as null; the op passes the body's reason whole", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  w.s.strengthBarSet({ reason: REASON, capture: "B", connection: "C", author: ADMIN });
  const read = w.s.strengthBarOf({ viewer: MACHINE });
  assert.deepEqual(read.bar, { group_id: "grp-one", capture: "B", connection: "C", author: ADMIN, at: w.clock.now,
                               reason: REASON });
  assert.equal(read.seeds_new_projects, true);
  /* The dispatch: the body whole, the stamped author. */
  const op = (qs, body) => strengthOps(w.s, new URL(`http://x/?${qs}`), body).strengthbar();
  assert.equal(op(`author=${ADMIN}`, { group: "grp-two", connection: "A" }).reason, "BAR_NO_REASON");
  const viaOp = op(`author=${ADMIN}`, { group: "grp-two", connection: "A", reason: "Set through the op." });
  assert.equal(viaOp.ok, true);
  assert.equal(w.s.strengthBarOf({ group: "grp-two", viewer: MACHINE }).bar.reason, "Set through the op.");
  /* A store whose table predates the reason gains the column, its rows' reason null. */
  const old = world();
  old.st.db.exec(`DROP TABLE group_strength_bar`);
  old.st.db.exec(`CREATE TABLE group_strength_bar (group_id TEXT PRIMARY KEY, capture TEXT, connection TEXT,
                  author TEXT NOT NULL, at TEXT NOT NULL)`);
  old.st.db.exec(`INSERT INTO group_strength_bar VALUES ('grp-one', 'B', NULL, 'admin-ann', '2026-01-01T00:00:00.000Z')`);
  migrateStrength(old.st.sql);
  migrateStrength(old.st.sql);
  assert.deepEqual(old.s.strengthBarOf({ viewer: MACHINE }).bar,
    { group_id: "grp-one", capture: "B", connection: null, author: "admin-ann", at: "2026-01-01T00:00:00.000Z", reason: null });
});

test("C-107.3, R24: BAR_NO_REASON is this module's row, after C-107.2, its where naming the bar's act", () => {
  const row = STRENGTH_BAR_CHECKS.BAR_NO_REASON;
  assert.equal(row.check, "C-107.3");
  assert.equal(row.where, "src/strength/index.mjs strengthBarSet > is-strength-bar-reason");
  assert.match(row.translation, /2,000 characters/);
  assert.match(row.translation, /Nothing was changed\.$/);
  assert.deepEqual(Object.values(STRENGTH_BAR_CHECKS).map((r) => r.check), ["C-32.9", "C-107.1", "C-107.2", "C-107.3"]);
  assert.ok(Object.isFrozen(STRENGTH_BAR_CHECKS));
});

test("R16: target= is refused by name; an unseen project is NO_SUCH_PROJECT; NOT_A_PROJECT; else R14; no project, the group default", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  assert.equal(w.s.strengthBarOf({ target: "INFO-2026-0001-a", viewer: MACHINE }).reason, "BAR_IS_A_PROJECT_PROPERTY");
  /* N208: an unseen and an absent project are both membership's one answer (its R78), minted there. */
  const unseen = w.s.strengthBarOf({ project: PROJ, viewer: "member:carol" });
  const absent = w.s.strengthBarOf({ project: "PROJ-2026-0044-zzz", viewer: "member:carol" });
  assert.deepEqual(unseen, noSuchProject(PROJ));
  assert.deepEqual(absent, noSuchProject("PROJ-2026-0044-zzz"));
  assert.equal(unseen.reason, "NO_SUCH_PROJECT");
  assert.ok(unseen.check && unseen.translation);
  assert.equal(unseen.detail, absent.detail, "one fixed sentence, whatever the id");
  assert.deepEqual(w.s.strengthBarOf({ project: ` ${PROJ} `, viewer: "nobody" }), noSuchProject(PROJ));
  assert.equal(w.s.strengthBarOf({ project: INQ, viewer: MACHINE }).reason, "NOT_A_PROJECT");
  const seen = w.s.strengthBarOf({ project: PROJ, viewer: "member:alice" });
  assert.equal(seen.ok, true);
  assert.deepEqual(seen.bar, w.s.projectBar(PROJ));
  const none = w.s.strengthBarOf({ viewer: MACHINE });
  assert.equal(none.bar, null);
  assert.equal(none.seeds_new_projects, true);
  assert.match(none.detail, /no group default is declared/);
  w.s.strengthBarSet({ reason: REASON, capture: "A", author: ADMIN });
  const def = w.s.strengthBarOf({ viewer: MACHINE });
  assert.equal(def.group, "grp-one");
  assert.equal(def.bar.capture, "A");
  assert.equal(def.seeds_new_projects, true);
});

test("R21: the bar is a declaration beside the strength, never a gate on the pair", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  const before = w.s.strengthOf(INQ);
  w.s.strengthBarSet({ reason: REASON, capture: "A", connection: "A", author: ADMIN });
  w.file(PROJ, "bundle.md", "---\nrequired_strength:\n  connection: A\n---\n");
  assert.deepEqual(w.s.strengthOf(INQ), before, "a bar above the pair changes nothing about the pair");
  assert.equal(w.s.inquiryStrength({ id: INQ, viewer: MACHINE }).ok, true);
});

test("R23: group_strength_bar is keyed by group and survives a whole-store purge as an instance setting", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  w.s.strengthBarSet({ reason: REASON, capture: "B", author: ADMIN });
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
  assert.equal(op("strengthbar", `author=${MEMBER}`, { capture: "B", reason: REASON, author: ADMIN }).reason, "STRENGTH_BAR_NOT_ADMIN",
               "the stamped author wins over a body's");
  assert.equal(op("strengthbarof", `target=${INQ}`).reason, "BAR_IS_A_PROJECT_PROPERTY");
});

test("R25: no place is named in this module's answers", () => {
  const w = projected();
  w.member(ADMIN, "admin");
  const out = JSON.stringify([
    w.s.strengthOf(INQ), w.s.inquiryStrength({ id: INQ, viewer: "member:carol" }), w.s.projectBar(PROJ),
    w.s.strengthBarSet({ reason: REASON, capture: "B", author: ADMIN }), w.s.strengthBarSet({ author: "class:member" }),
    w.s.strengthBarOf({ target: INQ }), w.s.versionStrength({ viewer: MACHINE }),
    w.s.partitionIndependence({ id: INQ, viewer: MACHINE, partition: "x" }),
    Object.values(STRENGTH_BAR_CHECKS),
  ]);
  assert.doesNotMatch(out, /oakland|alameda|california|berkeley/i);
});
