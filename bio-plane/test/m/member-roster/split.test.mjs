/* T51 (T51-145; K624, K3946; split map §3, §6): the requirements this module states beyond the ones moved from
   `membership`: R71 `memberList` given the projects, R73 the viewer's spelling, R74 the module over its own tables and
   nothing else, R67 the read contract, R75 the administrator removals under way, read. At the interface only, each with
   its controls (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { world, sqlOver, snapshot } from "./fixture.mjs";
import { Members, membersOf, membersOps, viewerMember, carriedProject, baseViewer }
  from "../../../src/member-roster/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

/* ---------------------------------------------------------------- R71 ---------------------------------------------- */

test("R71 memberList is given the projects of a member: a stand-in projectsOf answers its list on each row of an administrator's roster, the founder's included; none given, or a non-list, every projects is []", async () => {
  const w = await world().group("ann");
  const calls = [];
  const projectsOf = (memberId, viewer) => { calls.push([memberId, viewer]); return [{ project: `P-${memberId}`, state: "joined", owner: true }]; };
  const rows = w.m.memberList({ administer: true, viewer: "member:second", projectsOf }).members;
  assert.deepEqual(rows.map((r) => r.member_id), ["admin", "ann", "second"]);
  for (const r of rows) assert.deepEqual(r.projects, [{ project: `P-${r.member_id}`, state: "joined", owner: true }], r.member_id);
  assert.deepEqual(calls.map(([id]) => id).sort(), ["admin", "ann", "second"], "one call per row");
  assert.ok(calls.every(([, v]) => v === "member:second"), "the viewer the caller stamped is handed on");
  assert.equal(rows[0].founder, true);
  /* the answers keep the order the function gave */
  const two = w.m.memberList({ administer: "1", projectsOf: () => [{ project: "B" }, { project: "A" }] }).members[1].projects;
  assert.deepEqual(two.map((p) => p.project), ["B", "A"]);
  /* control: without a function, or with an answer that is no list, or a throw, every row's projects is [] */
  for (const bad of [undefined, null, "list", 7, {}, () => null, () => "x", () => ({ 0: "a", length: 1 }), () => { throw new Error("down"); }]) {
    const out = w.m.memberList({ administer: true, projectsOf: bad }).members;
    assert.equal(out.length, 3);
    for (const r of out) assert.deepEqual(r.projects, [], `${String(bad)}: ${r.member_id}`);
  }
  assert.deepEqual(w.m.memberList({ administer: true }).members.map((r) => r.projects), [[], [], []]);
  /* control: a member's roster (no administer) calls the function not at all, and carries no projects key */
  let called = 0;
  for (const administer of [undefined, false, "0", "yes"]) {
    const out = w.m.memberList({ administer, viewer: "member:ann", projectsOf: () => { called++; return [{ project: "X" }]; } });
    for (const r of out.members) assert.equal("projects" in r, false, `${administer}: ${r.member_id}`);
  }
  assert.equal(called, 0);
});

/* ---------------------------------------------------------------- R73 ---------------------------------------------- */

test("R73 viewerMember and carriedProject: member:<id>, member:<id>@<project>, member:admin and admin@<project> name the member id and the project; the bare admin and a machine credential name no member", () => {
  const cases = [["member:ann", "ann", null], ["member:admin", "admin", null], ["member:ann@p1", "ann", "p1"],
                 ["member:admin@p1", "admin", "p1"], ["admin", null, null], ["admin@p1", null, "p1"],
                 ["member:a.b_c:d-e", "a.b_c:d-e", null], [`member:${"x".repeat(128)}`, "x".repeat(128), null],
                 ["member:ann@p@q", "ann", "p@q"], ["member:ann@two words", "ann", "two words"]];
  for (const [viewer, member, project] of cases) {
    assert.equal(viewerMember(viewer), member, viewer);
    assert.equal(carriedProject(viewer), project, viewer);
  }
  for (const c of ["admin", "member", "probe", "daemon", "ai"]) assert.equal(viewerMember(`${MACHINE_CLASS_PREFIX}${c}`), null, c);
  assert.equal(viewerMember(`${MACHINE_CLASS_PREFIX}other`), null);
  /* a non-empty identity is read in place of the viewer; an empty one or a non-string is not */
  assert.equal(viewerMember("member:ann", "member:bob"), "bob");
  assert.equal(viewerMember("member:ann", ""), "ann");
  assert.equal(viewerMember("member:ann", null), "ann");
  assert.equal(viewerMember("member:ann", 7), "ann");
  assert.equal(viewerMember("member:ann", `${MACHINE_CLASS_PREFIX}admin`), null, "the identity decides, a credential names no member");
  assert.equal(viewerMember(null, "member:cat"), "cat");
  /* controls: nothing is trimmed or case-folded, and no other spelling names a member or a project */
  for (const v of ["Member:ann", "member:", "member:ann@", "class:other", "token:x", " member:ann", "member:ann ", "MEMBER:ann",
                   "member:" + "x".repeat(129), "member:a b", "", "ADMIN", "admin ", "x", null, undefined, 7, {}, ["member:ann"]]) {
    assert.equal(viewerMember(v), null, JSON.stringify(v));
    assert.equal(baseViewer(v), v, `baseViewer returns ${JSON.stringify(v)} unchanged`);
  }
  for (const v of ["Member:ann@p", "member:@p", "admin@", "class:x@p", null, 7]) assert.equal(carriedProject(v), null, JSON.stringify(v));
});

test("R73 baseViewer answers the part before the first @ of a carried viewer, and any other viewer unchanged; none of the three writes or throws", () => {
  assert.equal(baseViewer("member:ann@p1"), "member:ann");
  assert.equal(baseViewer("admin@p1"), "admin");
  assert.equal(baseViewer("member:ann@p@q"), "member:ann");
  assert.equal(baseViewer("member:ann"), "member:ann");
  assert.equal(baseViewer("admin"), "admin");
  const hostile = new Proxy({}, { get() { throw new Error("no"); } });
  for (const f of [viewerMember, carriedProject, baseViewer]) for (const v of [hostile, Symbol.iterator, 1n, [], () => 1])
    assert.doesNotThrow(() => f(v), String(f.name));
});

/* ---------------------------------------------------------------- R74 ---------------------------------------------- */

test("R74 membersOf answers one instance per storage over ctx.storage.sql only; a store with no bundles table and no project table boots, migrates and answers R9, R13 and R14; control: no statement it runs names bundles or a project_ table", async () => {
  const db = new DatabaseSync(":memory:");
  const statements = [];
  const inner = sqlOver(db);
  const sql = { exec(q, ...a) { statements.push(q); return inner.exec(q, ...a); } };
  const ctx = { storage: { sql } };
  const m = membersOf(ctx);
  assert.ok(m instanceof Members);
  assert.equal(membersOf(ctx), m, "one instance per storage");
  assert.equal(membersOf(ctx.storage), m, "whether handed the ctx or its storage");
  assert.notEqual(membersOf({ storage: { sql } }), m, "another storage, another instance");
  m.migrate();
  m.registerClaimed("credentials", () => true);
  m.registerPasswordSetter(() => ({ ok: true }));
  const a = await m.memberAdd({ memberId: "ann", cover: "cover of ann", by: "admin" });                      // R9
  assert.equal(a.ok, true);
  assert.equal((await m.enroll({ invite: a.invite, handle: "ann", password: "ann-passphrase-x" })).ok, true);  // R13
  const list = m.memberList({ administer: true }).members;                                                     // R14
  assert.deepEqual(list.map((r) => r.member_id), ["admin", "ann"]);
  /* the whole surface, once, to show nothing reaches past this module's tables */
  const ops = membersOps(m, new URL("http://x/?by=admin&viewer=member%3Aann&administer=1&limit=5"), { holders: "us", choice: "tell",
    kinds: [], dailyCap: 2, capabilities: ["contribute"], memberId: "ann", label: "CPA", handle: "ann-2", invite: "0".repeat(32) }, {});
  for (const [name, op] of Object.entries(ops)) { try { await op(); } catch (e) { assert.fail(`${name} threw ${e.message}`); } }
  await m.handleCheck({ viewer: "member:ann", handle: "x-y" });
  m.expertiseHolders("CPA"); m.sessionRights("member:ann"); m.activeAdmins(); m.reservedIdFinding(); m.adminRemovalsOpen({ by: "admin" });
  assert.ok(statements.length > 40);
  for (const q of statements) assert.doesNotMatch(q, /\b(bundles|project_\w+)\b/, q.slice(0, 80));
  /* the module's own tables are the only ones in the store */
  const tables = inner.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`).map((r) => r.name);
  for (const t of tables) assert.doesNotMatch(t, /^(bundles|project_)/, t);
  /* control: the same store boots a second time unchanged */
  const before = JSON.stringify(inner.exec(`SELECT * FROM members ORDER BY member_id`));
  m.migrate();
  assert.equal(JSON.stringify(inner.exec(`SELECT * FROM members ORDER BY member_id`)), before);
  /* control: a store that does have a bundles table (a host's) is left alone by the module */
  const host = world();
  host.sql.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL)`);
  host.m.migrate();
  assert.deepEqual(host.rows(`SELECT * FROM bundles`), []);
});

test("R74 membersOps answers the member ops the module serves, each a function the stamped query drives; control: no project op is among them, and a body's by never wins", async () => {
  const w = await world().group("ann");
  const ops = w.ops("by=admin&viewer=member%3Aann&administer=1");
  const names = Object.keys(ops);
  assert.ok(names.length >= 30, `${names.length} ops`);
  for (const name of names) assert.equal(typeof ops[name], "function", name);
  assert.equal(names.some((k) => /^project/.test(k) || k === "checkaddressees"), false);
  assert.equal(new Set(names).size, names.length);
  /* a sample answered through the map, with the answers the services give */
  assert.deepEqual(w.ops("").adminarith().live, w.m.adminArithmetic().live);
  assert.deepEqual(ops.memberlist().members.map((r) => r.member_id), ["admin", "ann", "second"]);
  assert.deepEqual(ops.adminremovalsopen(), { ok: true, removals: [] });
  /* the stamp is the query's: a body's `by` never wins */
  const forged = await w.ops("by=nobody", { by: "admin", memberId: "xx", cover: "c" }).memberadd();
  assert.equal(forged.reason, "NOT_AN_ADMIN");
  const stamped = await w.ops("by=admin", { by: "nobody", memberId: "xx", cover: "c" }).memberadd();
  assert.equal(stamped.ok, true);
});

/* ---------------------------------------------------------------- R67 ---------------------------------------------- */

test("R67 the read contract: members (member_id, handle, role, status) and admin_votes (kind, target, voter, reason, created) exist with the types the readers use; control: a column it states is not renamed by migrate", () => {
  const w = world();
  const cols = (t) => Object.fromEntries(w.rows(`PRAGMA table_info(${t})`).map((c) => [c.name, c.type]));
  const members = cols("members");
  assert.equal(members.member_id, "TEXT");
  assert.equal(members.handle, "TEXT");
  assert.equal(members.role, "TEXT");
  assert.equal(members.status, "TEXT");
  const votes = cols("admin_votes");
  for (const c of ["kind", "target", "voter", "reason", "created"]) assert.equal(votes[c], "TEXT", c);
  /* what a reader joins: role and status mean administrator and active/revoked, as R23 reads them */
  return (async () => {
    await w.claim();
    await w.enrol("second", "admin");
    assert.deepEqual(w.row(`SELECT member_id, handle, role, status FROM members WHERE member_id='second'`),
      { member_id: "second", handle: "second", role: "admin", status: "active" });
    w.m.migrate();
    assert.deepEqual(Object.keys(cols("members")).slice(0, 4), ["member_id", "cover", "handle", "role"]);
    assert.equal(cols("members").handle, "TEXT");
    /* no other table of the contract's readers is written by a reader: the module is the only writer, by its services */
    assert.equal(w.m.isAdministrator("second"), true);
  })();
});

/* ---------------------------------------------------------------- R75 ---------------------------------------------- */

async function fourAdmins() {
  const w = await world().group();
  const add = async (id) => {
    /* K5563: the second proposes, and the founder's endorsement alone issues it */
    const p = await w.m.memberAdd({ memberId: id, cover: `c-${id}`, role: "admin", by: "second" });
    assert.equal(p.reason, "CONSENSUS_REQUIRED");
    let invite = null;
    for (const by of w.m.activeAdmins().filter((a) => a !== "second")) {
      const e = await w.m.adminEndorse({ memberId: id, by });
      if (e.ok) { invite = e.invite; break; }
    }
    assert.ok(invite, `${id} endorsed`);
    assert.equal((await w.m.enroll({ invite, handle: id, password: `${id}-passphrase-x` })).ok, true);
  };
  await add("third");
  /* R29 orders administrators by when their rows were created, ties by member id: a millisecond apart, so "third" is
     first as created and not by a tie-break on its name. */
  await new Promise((done) => setTimeout(done, 2));
  await add("fourth");
  assert.deepEqual(w.m.activeAdmins(), ["admin", "second", "third", "fourth"]);
  return w;
}

test("R75 adminRemovalsOpen: two of four administrators vote on a third: one entry, have 2, need 3, awaiting the fourth, voters in the order cast; once the removal carries the entry is gone", async () => {
  const w = await fourAdmins();
  assert.deepEqual(w.m.adminRemovalsOpen({ by: "admin" }), { ok: true, removals: [] }, "none under way");
  assert.equal(w.m.adminRemove({ memberId: "third", by: "second", reason: "first secret reason" }).reason, "VOTES_SHORT");
  assert.equal(w.m.adminRemove({ memberId: "third", by: "fourth", reason: "second secret reason" }).reason, "VOTES_SHORT");
  const before = snapshot(w);
  const r = w.m.adminRemovalsOpen({ by: "admin" });
  assert.equal(snapshot(w), before, "writes nothing");
  assert.equal(r.ok, true);
  assert.equal(r.removals.length, 1);
  const [e] = r.removals;
  assert.deepEqual(Object.keys(e).sort(), ["awaiting", "have", "need", "target", "voters"]);
  assert.deepEqual([e.target, e.have, e.need, e.awaiting], ["third", 2, 3, ["admin"]]);
  assert.deepEqual(e.voters.map((v) => v.voter), ["second", "fourth"], "in the order cast");
  for (const v of e.voters) { assert.deepEqual(Object.keys(v).sort(), ["at", "voter"]); assert.match(v.at, /^\d{4}-\d\d-\d\dT/); }
  assert.ok(e.voters[0].at <= e.voters[1].at);
  assert.doesNotMatch(JSON.stringify(r), /secret reason|reason/, "no reason is answered");
  /* the same through the op, by the stamp */
  assert.deepEqual(w.ops("by=second").adminremovalsopen(), r);
  /* a second removal under way is a second entry, in the order of its first vote */
  assert.equal(w.m.adminRemove({ memberId: "fourth", by: "second", reason: "x" }).reason, "VOTES_SHORT");
  const two = w.m.adminRemovalsOpen({ by: "admin" }).removals;
  assert.deepEqual(two.map((x) => x.target), ["third", "fourth"]);
  assert.deepEqual(two[1].awaiting, ["admin", "third"], "R29's order, the target and the voter left out");
  /* the removal that carries removes the entry (R5); at four the founder's act is the one that can (K5562: she removes alone) */
  assert.equal(w.m.adminRemove({ memberId: "third", by: "admin", reason: "z" }).alone, true);
  assert.deepEqual(w.m.adminRemovalsOpen({ by: "admin" }).removals.map((x) => x.target), ["fourth"]);
  /* and the numbers follow the administrators who remain: three now, so two are needed */
  assert.deepEqual([two[1].need, w.m.adminRemovalsOpen({ by: "admin" }).removals[0].need], [3, 2]);
});

test("R75 controls: a caller who is not an administrator, a machine credential included, is refused NOT_AN_ADMIN and learns of no removal; a reactivated or resigned target, and votes of a former administrator, are not entries", async () => {
  const w = await fourAdmins();
  await w.enrol("ann");
  w.m.adminRemove({ memberId: "third", by: "second", reason: "r" });
  const snap = snapshot(w);
  for (const by of ["ann", "ghost", null, undefined, "", `${MACHINE_CLASS_PREFIX}admin`, "member:second", 7, {}]) {
    const r = w.m.adminRemovalsOpen({ by });
    assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "NOT_AN_ADMIN", "NOT_AN_ADMIN", "C-96.1"], String(by));
    assert.equal("removals" in r, false, "no removal is learnt");
    assert.doesNotMatch(JSON.stringify(r), /third/);
  }
  assert.deepEqual(w.m.adminRemovalsOpen(undefined).reason, "NOT_AN_ADMIN");
  assert.deepEqual(w.m.adminRemovalsOpen(null).reason, "NOT_AN_ADMIN");
  assert.equal(snapshot(w), snap);
  /* the founder is an administrator (claimed) and reads it */
  assert.equal(w.m.adminRemovalsOpen({ by: "admin" }).removals.length, 1);
  /* a target who resigned (an ordinary member now) is no administrator under removal */
  assert.equal(w.m.adminResign({ by: "third" }).ok, true);
  assert.deepEqual(w.m.adminRemovalsOpen({ by: "admin" }).removals, []);
  /* a vote cast by an administrator who has since left is not counted among the voters */
  w.m.adminRemove({ memberId: "fourth", by: "second", reason: "r" });
  assert.equal(w.m.adminResign({ by: "second" }).ok, true);
  const e = w.m.adminRemovalsOpen({ by: "admin" }).removals[0];
  assert.deepEqual([e.target, e.have, e.voters], ["fourth", 0, []]);
  assert.deepEqual(e.awaiting, ["admin"]);
  /* never throws: a store that cannot be read answers no removals */
  const broken = new Members({ sql: { exec() { throw new Error("disk"); } } });
  assert.doesNotThrow(() => broken.adminRemovalsOpen({ by: "admin" }));
});
