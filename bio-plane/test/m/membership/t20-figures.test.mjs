/* T20 layer 2 (K861, plane R10): R96, this module's share of the instance's figures, a source shaped as record-core
   R63's `counts(hid)` with its key list, which `plane` registers under this module's name. Proved at the interface: the
   source alone, then registered through the REAL record-core's R63 and read as `op=stats` and purge's proof read it,
   each answer held against plane's held copy's own statement (`src/plane/held.mjs`, `nx`: `count(*)` less the rows
   whose key, read as `COALESCE(key, '')`, is in `hid`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { world, realWorld, sqlOver, V } from "./fixture.mjs";
import { Membership, hiddenBundles } from "../../../src/membership/index.mjs";
import { recordCoreOps } from "../../../src/record-core/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const KEYS = ["projectParticipants", "projectOwnerVotes"];
const TABLES = { projectParticipants: "project_participants", projectOwnerVotes: "project_owner_votes" };

/* Plane's held copy, statement for statement: what R96 must answer exactly. */
function heldCopy(sql, hid) {
  const n = (t) => {
    const conds = [], args = [];
    if (hid) { conds.push(`COALESCE(project_id, '') NOT IN ${hid.sql}`); args.push(...hid.args); }
    return sql.exec(`SELECT count(*) c FROM ${t}${conds.length ? ` WHERE ${conds.join(" AND ")}` : ""}`, ...args)[0].c;
  };
  return Object.fromEntries(KEYS.map((k) => [k, n(TABLES[k])]));
}
/* `hid` as plane's held copy takes it: a viewer never sent is the direct internal call, counted whole. */
const hidOf = (viewer) => (viewer === undefined ? null : hiddenBundles(viewer));

/* A held ann and bob as owners, cal joined, one pending owner vote (ann proposing cal); B held by dee and eve, one
   pending removal vote (dee's, short of both). zed is outside both; second an administrator. */
async function build(m, project, enrol) {
  for (const id of ["ann", "bob", "cal", "dee", "eve", "zed"]) await enrol(id);
  project("PROJ-A");
  project("PROJ-B");
  m.projectClaimOwner({ projectId: "PROJ-A", memberId: "ann" });
  for (const h of ["bob", "cal"]) {
    m.projectInvite({ projectId: "PROJ-A", handle: h, by: "ann", viewer: V("ann") });
    m.projectJoin({ projectId: "PROJ-A", by: h, viewer: V(h) });
  }
  assert.equal(m.projectOwnerAdd({ projectId: "PROJ-A", handle: "bob", by: "ann", viewer: V("ann") }).ok, true);
  assert.equal(m.projectOwnerAdd({ projectId: "PROJ-A", handle: "cal", by: "ann", viewer: V("ann") }).reason,
    "CONSENSUS_REQUIRED");
  m.projectClaimOwner({ projectId: "PROJ-B", memberId: "dee" });
  m.projectInvite({ projectId: "PROJ-B", handle: "eve", by: "dee", viewer: V("dee") });
  m.projectJoin({ projectId: "PROJ-B", by: "eve", viewer: V("eve") });
  assert.equal(m.projectOwnerAdd({ projectId: "PROJ-B", handle: "eve", by: "dee", viewer: V("dee") }).ok, true);
  assert.equal(m.projectOwnerRemove({ projectId: "PROJ-B", handle: "eve", by: "dee", reason: "r", viewer: V("dee") }).reason,
    "VOTES_SHORT");
}

const WHOLE = { projectParticipants: 5, projectOwnerVotes: 2 };
/* Each viewer, what it is told: whole, less a project it is outside, or nothing (a viewer R43 refuses hides all). */
const VIEWERS = [
  [undefined, WHOLE, "a viewer never sent: the direct internal call, counted whole"],
  ["admin", WHOLE, "the founder sees every bundle"],
  [`${MACHINE_CLASS_PREFIX}admin`, WHOLE, "a machine credential sees every bundle"],
  [V("second"), WHOLE, "an active administrator sees every project"],
  [V("ann"), { projectParticipants: 3, projectOwnerVotes: 1 }, "a member outside B: less B"],
  [V("dee"), { projectParticipants: 2, projectOwnerVotes: 1 }, "a member outside A: less A"],
  [V("zed"), { projectParticipants: 0, projectOwnerVotes: 0 }, "a member outside both"],
  ["junk", { projectParticipants: 0, projectOwnerVotes: 0 }, "a viewer R43 refuses: every bundle hidden"],
];

test("R96 the figure source: its key list, and counts(hid) each table less the rows whose project is in hid, whole for a null hid, as plane's held copy counts", async () => {
  assert.deepEqual([...Membership.COUNT_KEYS], KEYS);
  assert.ok(Object.isFrozen(Membership.COUNT_KEYS));
  const w = await world().group();
  await build(w.m, (id) => w.project(id), (id) => w.enrol(id));
  w.bundle("INFO-1");
  assert.deepEqual(w.m.counts(), WHOLE, "no hid: whole");
  assert.deepEqual(w.m.counts(null), WHOLE);
  for (const [viewer, want, why] of VIEWERS) {
    const got = w.m.counts(hidOf(viewer));
    assert.deepEqual(Object.keys(got), KEYS, `${why}: every key, in the list's order`);
    assert.deepEqual(got, want, why);
    assert.deepEqual(got, heldCopy(w.sql, hidOf(viewer)), `${why}: exactly plane's copy`);
  }
  /* sight follows the record: inviting zed to A moves zed's count at once */
  w.m.projectInvite({ projectId: "PROJ-A", handle: "zed", by: "ann", viewer: V("ann") });
  assert.deepEqual(w.m.counts(hiddenBundles(V("zed"))), { projectParticipants: 4, projectOwnerVotes: 1 });
  assert.deepEqual(w.m.counts(hiddenBundles(V("zed"))), heldCopy(w.sql, hiddenBundles(V("zed"))));
});

test("R96 a NULL key names no bundle, so hid never drops its row; it writes nothing", async () => {
  /* A store whose tables were made before `project_id` was NOT NULL: membership's CREATE IF NOT EXISTS keeps them. */
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, title TEXT, project TEXT)`);
  db.exec(`CREATE TABLE project_participants (project_id TEXT, member_id TEXT NOT NULL, state TEXT NOT NULL,
             owner INTEGER NOT NULL DEFAULT 0, owner_order INTEGER, invited_by TEXT, comment TEXT, created TEXT NOT NULL,
             updated TEXT NOT NULL)`);
  db.exec(`CREATE TABLE project_owner_votes (project_id TEXT, kind TEXT NOT NULL, target TEXT NOT NULL,
             voter TEXT NOT NULL, reason TEXT, created TEXT NOT NULL)`);
  const sql = sqlOver(db);
  const m = new Membership({ sql, core: { declarePurge() { return { ok: true }; } } });
  m.migrate();
  db.exec(`INSERT INTO bundles VALUES ('PROJ-A','project','A',NULL)`);
  for (const p of ["PROJ-A", null]) {
    db.prepare(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES (?,?,?,?,?)`)
      .run(p, "ann", "joined", "t", "t");
    db.prepare(`INSERT INTO project_owner_votes (project_id, kind, target, voter, created) VALUES (?,?,?,?,?)`)
      .run(p, "add", "bob", "ann", "t");
  }
  const snapshot = () => JSON.stringify(sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
    .map(({ name }) => [name, sql.exec(`SELECT * FROM "${name}"`)]));
  const before = snapshot();
  const all = hiddenBundles("junk");   // every bundle hidden
  assert.deepEqual(m.counts(all), { projectParticipants: 1, projectOwnerVotes: 1 }, "the NULL-keyed row stays");
  assert.deepEqual(m.counts(all), heldCopy(sql, all));
  assert.deepEqual(m.counts(null), { projectParticipants: 2, projectOwnerVotes: 2 });
  assert.equal(snapshot(), before, "writes nothing");
});

test("R96 registered through record-core R63 under membership's name, it answers op=stats through each viewer's sight and purge's proof whole, as plane's copy; membership registers nothing itself", async () => {
  const w = await realWorld();
  const { m, rc } = w;
  await w.claim();
  const enrol = async (id, role = "member") => {
    const a = await m.memberAdd({ memberId: id, cover: `cover of ${id}`, role, by: "admin" });
    assert.equal(a.ok, true, JSON.stringify(a));
    assert.equal((await m.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` })).ok, true);
  };
  await enrol("second", "admin");
  await build(m, (id) => w.bundle(id), enrol);
  /* membership registered nothing at its start: no figure of its is held by record-core */
  for (const k of KEYS) assert.equal(k in rc.counts(null), false, `${k}: not registered by membership itself`);
  /* the registration plane makes, under this module's name */
  assert.deepEqual(rc.registerCounts("membership", [...Membership.COUNT_KEYS], (hid) => m.counts(hid)),
    { ok: true, module: "membership", keys: KEYS });
  for (const [viewer, want, why] of VIEWERS) {
    const got = rc.counts(hidOf(viewer));
    assert.deepEqual(Object.fromEntries(KEYS.map((k) => [k, got[k]])), want, `R63 ${why}`);
    assert.deepEqual(Object.fromEntries(KEYS.map((k) => [k, got[k]])), heldCopy(w.sql, hidOf(viewer)), `R63 ${why}: plane's copy`);
  }
  /* op=stats and purge's proof, read through a stats source composed as plane composes it (R65: the registered
     figures, through the caller's sight, a viewer never sent counted whole) */
  assert.equal(rc.registerStatsSource("plane", ({ viewer }) => rc.counts(hidOf(viewer))).ok, true);
  for (const [viewer, want, why] of VIEWERS) {
    const s = viewer === undefined ? rc.stats({}) : rc.stats({ viewer });
    assert.deepEqual(Object.fromEntries(KEYS.map((k) => [k, s[k]])), want, `op=stats ${why}`);
  }
  const proof = rc.proofCounts();
  assert.deepEqual(Object.fromEntries(KEYS.map((k) => [k, proof[k]])), WHOLE, "purge's proof is whole");
  /* purge proves what it took: the project's participation and its pending votes */
  const ops = recordCoreOps(rc, new URL("http://x/?op=purge&bundleId=PROJ-A"), null);
  const p = ops.purge();
  assert.equal(p.ok, true);
  assert.deepEqual(KEYS.map((k) => [p.before[k], p.after[k], p.removed[k]]), [[5, 2, 3], [2, 1, 1]]);
  assert.deepEqual(Object.fromEntries(KEYS.map((k) => [k, p.after[k]])), heldCopy(w.sql, null), "after: plane's copy, whole");
  /* a second registration under its name is refused, naming the holder (R63) */
  const again = rc.registerCounts("membership", [...Membership.COUNT_KEYS], (hid) => m.counts(hid));
  assert.deepEqual([again.ok, again.reason, again.heldBy], [false, "COUNTS_DECLARED", "membership"]);
});
