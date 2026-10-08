/* R17, this module's share of the instance's figures (moved from membership's `t20-figures.test.mjs`, its R96's
   owner-votes half), and R18, its tables keyed by project and cleared with it (its R59's half), renamed (K874). The
   figure source alone, then registered through the REAL record-core's R63 under this module's name, as `plane`
   registers it (plane R10), each answer held against the figure pinned here: `count(*)` less the rows whose key, read
   as `COALESCE(project_id, '')`, is in `hid`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { world, realWorld, sqlOver, V } from "./fixture.mjs";
import { hiddenBundles } from "../../../src/membership/index.mjs";
import { recordCoreOps } from "../../../src/record-core/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
import { ProjectRoster, PROJECT_ROSTER_TABLES } from "../../../src/project-roster/index.mjs";

const KEYS = ["projectOwnerVotes"];
function pinned(sql, hid) {
  const args = hid ? hid.args : [];
  return { projectOwnerVotes: sql.exec(`SELECT count(*) c FROM project_owner_votes${hid
    ? ` WHERE COALESCE(project_id, '') NOT IN ${hid.sql}` : ""}`, ...args)[0].c };
}
const hidOf = (viewer) => (viewer === undefined ? null : hiddenBundles(viewer));

/* A owned by ann and bob, one pending owner vote (ann proposing cal); B owned by dee and eve, one pending removal vote */
async function build(m, r, project, enrol) {
  for (const id of ["ann", "bob", "cal", "dee", "eve", "zed"]) await enrol(id);
  project("PROJ-A");
  project("PROJ-B");
  m.projectClaimOwner({ projectId: "PROJ-A", memberId: "ann" });
  for (const h of ["bob", "cal"]) {
    m.projectInvite({ projectId: "PROJ-A", handle: h, by: "ann", viewer: V("ann") });
    m.projectJoin({ projectId: "PROJ-A", by: h, viewer: V(h) });
  }
  assert.equal(r.projectOwnerAdd({ projectId: "PROJ-A", handle: "bob", by: "ann", viewer: V("ann") }).ok, true);
  assert.equal(r.projectOwnerAdd({ projectId: "PROJ-A", handle: "cal", by: "ann", viewer: V("ann") }).reason, "CONSENSUS_REQUIRED");
  m.projectClaimOwner({ projectId: "PROJ-B", memberId: "dee" });
  m.projectInvite({ projectId: "PROJ-B", handle: "eve", by: "dee", viewer: V("dee") });
  m.projectJoin({ projectId: "PROJ-B", by: "eve", viewer: V("eve") });
  assert.equal(r.projectOwnerAdd({ projectId: "PROJ-B", handle: "eve", by: "dee", viewer: V("dee") }).ok, true);
  assert.equal(r.projectOwnerRemove({ projectId: "PROJ-B", handle: "eve", by: "dee", reason: "r", viewer: V("dee") }).reason,
    "VOTES_SHORT");
}
const VIEWERS = [
  [undefined, 2, "a viewer never sent: the direct internal call, counted whole"],
  ["admin", 2, "the founder sees every bundle"],
  [`${MACHINE_CLASS_PREFIX}admin`, 2, "a machine credential sees every bundle"],
  [V("second"), 2, "an active administrator sees every project"],
  [V("ann"), 1, "a member outside B: less B"],
  [V("dee"), 1, "a member outside A: less A"],
  [V("zed"), 0, "a member outside both"],
  ["junk", 0, "a viewer membership's R43 refuses: every bundle hidden"],
];

test("R17 the figure source: its key list, and counts(hid) the owner votes less the rows whose project is in hid, whole for a null hid", async () => {
  assert.deepEqual([...ProjectRoster.COUNT_KEYS], KEYS);
  assert.ok(Object.isFrozen(ProjectRoster.COUNT_KEYS));
  const w = await world().group();
  await build(w.m, w.r, (id) => w.project(id), (id) => w.enrol(id));
  assert.deepEqual(w.r.counts(), { projectOwnerVotes: 2 }, "no hid: whole");
  assert.deepEqual(w.r.counts(null), { projectOwnerVotes: 2 });
  for (const [viewer, want, why] of VIEWERS) {
    const got = w.r.counts(hidOf(viewer));
    assert.deepEqual(Object.keys(got), KEYS, why);
    assert.deepEqual(got, { projectOwnerVotes: want }, why);
    assert.deepEqual(got, pinned(w.sql, hidOf(viewer)), `${why}: exactly the pinned figure`);
  }
  /* sight follows the record: inviting zed to A moves zed's count at once */
  w.m.projectInvite({ projectId: "PROJ-A", handle: "zed", by: "ann", viewer: V("ann") });
  assert.deepEqual(w.r.counts(hiddenBundles(V("zed"))), { projectOwnerVotes: 1 });
});

test("R17 a NULL key names no bundle, so hid never drops its row; it writes nothing; the module registers nothing itself", async () => {
  /* A store whose table was made before `project_id` was NOT NULL: CREATE IF NOT EXISTS keeps it. */
  const db = new DatabaseSync(":memory:");
  db.exec(`CREATE TABLE bundles (bundle_id TEXT PRIMARY KEY, object_type TEXT NOT NULL, title TEXT, project TEXT)`);
  db.exec(`CREATE TABLE project_owner_votes (project_id TEXT, kind TEXT NOT NULL, target TEXT NOT NULL,
             voter TEXT NOT NULL, reason TEXT, created TEXT NOT NULL)`);
  const sql = sqlOver(db);
  const registered = [];
  const core = { declarePurge() { return undefined; }, registerCounts(...a) { registered.push(a); return { ok: true }; } };
  const r = new ProjectRoster({ sql, core, membership: {} });
  r.migrate();
  r.start();
  assert.deepEqual(registered, [], "registers no figure itself (plane does, under its name)");
  db.exec(`INSERT INTO bundles VALUES ('PROJ-A','project','A',NULL)`);
  for (const p of ["PROJ-A", null])
    db.prepare(`INSERT INTO project_owner_votes (project_id, kind, target, voter, created) VALUES (?,?,?,?,?)`).run(p, "add", "bob", "ann", "t");
  const snapshot = () => JSON.stringify(sql.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
    .map(({ name }) => [name, sql.exec(`SELECT * FROM "${name}"`)]));
  const before = snapshot();
  const all = hiddenBundles("junk");
  assert.deepEqual(r.counts(all), { projectOwnerVotes: 1 }, "the NULL-keyed row stays");
  assert.deepEqual(r.counts(all), pinned(sql, all));
  assert.deepEqual(r.counts(null), { projectOwnerVotes: 2 });
  assert.equal(snapshot(), before, "writes nothing");
});

test("R17 registered through record-core R63 under this module's name, it answers op=stats through each viewer's sight and purge's proof whole", async () => {
  const w = await realWorld();
  const { m, r, rc } = w;
  await w.claim();
  await w.enrol("second", "admin");
  await build(m, r, (id) => w.bundle(id), (id) => w.enrol(id));
  assert.equal("projectOwnerVotes" in rc.counts(null), false, "not registered by this module itself");
  assert.deepEqual(rc.registerCounts("project-roster", [...ProjectRoster.COUNT_KEYS], (hid) => r.counts(hid)),
    { ok: true, module: "project-roster", keys: KEYS });
  for (const [viewer, want, why] of VIEWERS) {
    assert.equal(rc.counts(hidOf(viewer)).projectOwnerVotes, want, `R63 ${why}`);
  }
  assert.equal(rc.registerStatsSource("plane", ({ viewer }) => rc.counts(hidOf(viewer))).ok, true);
  for (const [viewer, want, why] of VIEWERS) {
    const s = viewer === undefined ? rc.stats({}) : rc.stats({ viewer });
    assert.equal(s.projectOwnerVotes, want, `op=stats ${why}`);
  }
  assert.equal(rc.proofCounts().projectOwnerVotes, 2, "purge's proof is whole");
  const p = recordCoreOps(rc, new URL("http://x/?op=purge&bundleId=PROJ-A"), null).purge();
  assert.equal(p.ok, true);
  assert.deepEqual([p.before.projectOwnerVotes, p.after.projectOwnerVotes, p.removed.projectOwnerVotes], [2, 1, 1]);
});

test("R18 owner votes, requests and ownership decisions are declared keyed by project, once; a refused declaration is thrown", async () => {
  const w = world();
  const mine = w.declared.filter((d) => d.module === "project-roster");
  assert.equal(mine.length, 1);
  assert.deepEqual(mine[0].tables, ["project_join_requests", "project_owner_votes", "project_owner_decisions"]
    .map((name) => ({ name, keys: ["project_id"] })));
  assert.deepEqual([...PROJECT_ROSTER_TABLES], mine[0].tables.map((t) => t.name));
  for (const t of PROJECT_ROSTER_TABLES)
    assert.ok(w.rows(`PRAGMA table_info(${t})`).some((c) => c.name === "project_id"), `${t} is keyed by project`);
  w.r.migrate();
  assert.equal(w.declared.filter((d) => d.module === "project-roster").length, 1, "declared once");
  const refused = new ProjectRoster({ sql: w.sql, core: { declarePurge: () => ({ ok: false, reason: "TABLE_DECLARED",
    table: "project_owner_votes" }) }, membership: w.m });
  assert.throws(() => refused.migrate(), /refused its purge declaration: TABLE_DECLARED \(project_owner_votes\)/);
});

test("R18 through the real record-core: a purge clears the project's votes, requests and decisions, and never another project's", async () => {
  const w = await realWorld();
  const { m, r, rc } = w;
  await w.claim();
  for (const id of ["second", "ann", "bob", "cal"]) await w.enrol(id, id === "second" ? "admin" : "member");
  for (const id of ["PROJ-A", "PROJ-B"]) {
    w.bundle(id);
    m.projectClaimOwner({ projectId: id, memberId: "ann" });
    for (const h of ["bob", "cal"]) {
      m.projectInvite({ projectId: id, handle: h, by: "ann", viewer: V("ann") });
      m.projectJoin({ projectId: id, by: h, viewer: V(h) });
    }
    r.projectOwnerAdd({ projectId: id, handle: "bob", by: "ann", viewer: V("ann") });   // a decision
    r.projectOwnerAdd({ projectId: id, handle: "cal", by: "ann", viewer: V("ann") });   // an open vote
    m.projectVisibilitySet({ projectId: id, setting: "discoverable", by: "ann", viewer: V("ann") });
  }
  await w.enrol("dee");
  for (const id of ["PROJ-A", "PROJ-B"]) r.projectRequest({ projectId: id, by: "dee", viewer: V("dee") });   // a request
  const count = (t, where = "1=1") => w.row(`SELECT COUNT(*) AS n FROM ${t} WHERE ${where}`).n;
  for (const t of PROJECT_ROSTER_TABLES) assert.equal(count(t, "project_id='PROJ-A'"), 1, t);
  rc.purge({ bundleId: "PROJ-A" });
  for (const t of PROJECT_ROSTER_TABLES) {
    assert.equal(count(t, "project_id='PROJ-A'"), 0, `${t}: cleared with the project`);
    assert.equal(count(t, "project_id='PROJ-B'"), 1, `${t}: another project's kept`);
  }
  rc.purge({});
  for (const t of PROJECT_ROSTER_TABLES) assert.equal(count(t), 0, t);
  assert.equal(count("members"), 5, "identity survives (membership's)");
});
