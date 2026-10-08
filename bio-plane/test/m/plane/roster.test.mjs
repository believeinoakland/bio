/* plane R2, R3, R5, R10 (T38-26; N783, K2270, K2294): `project-roster`, split from `membership` in T38, composed on the
   object's storage: built and started directly after membership (its R15, R16 listeners held before the first request),
   migrated directly after membership's migration so a fresh store holds its three tables as a migrated one does,
   declared to purge under its own name, its figure registered under its own name, and every op of its ops map routed
   directly after membership's map. Each module's own behaviour is its own tests'; these check only the composition,
   through the plane's interface: construction over a storage and the route map. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { store } from "./fixture.mjs";
import { MODULE_MAPS } from "./maps.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { instanceSetupOf } from "../../../src/setup.mjs";
import { projectRosterOf, projectRosterOps, PROJECT_ROSTER_TABLES } from "../../../src/project-roster/index.mjs";

const PR = [...PROJECT_ROSTER_TABLES];
const OPS = ["projectowneradd", "projectownerremove", "projectownerrescue", "projectvisibility", "projectdirectory",
             "projectparticipants", "projectrequest", "projectrequestwithdraw", "projectrequestanswer", "projectrequests"];
const tableNames = (x) => [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name);
const one = (x, q, ...a) => [...x.ctx.storage.sql.exec(q, ...a)][0];

/* Every module that declared a table to purge, in declaration order (record-core R21), each named once. */
function declarers(x) {
  const rc = recordOf(x.ctx), out = [];
  for (const t of Object.keys(rc.purge().removed)) {
    const m = rc.declarePurge("zz-probe", [t]).declaredBy;
    if (!out.includes(m)) out.push(m);
  }
  return out;
}

const projMd = (title) => ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
  "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  `objective: "Find out what happened."`, "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n");

/* A store with its group recorded, members alice and bob, and one project of alice's. */
async function world() {
  const x = await store();
  instanceSetupOf(x.ctx).instanceGroupSeed({ slug: "oak-watch", author: "admin" });
  for (const m of ["alice", "bob"])
    x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                            VALUES (?, ?, ?, 'member', 'active', '["contribute"]', 't', 't')`, m, `Cover ${m}`, `h_${m}`);
  const created = promotionOf(x.ctx).promote({ base: null, snapKey: "k1", author: "member:alice", ownerMemberId: "alice",
    files: [{ path: "bundle.md", text: projMd("Budget watch") }], meta: { object_type: "project" } });
  assert.equal(created.ok, true, JSON.stringify(created));
  return { ...x, P: created.bundleId };
}

test("R3, R2 (T38-26; K2294): a fresh store holds project-roster's three tables, declared to purge under its own name, directly after membership's declarations", async () => {
  const x = await store();
  const names = tableNames(x);
  for (const t of PR) assert.ok(names.includes(t), `table ${t}`);
  const rc = recordOf(x.ctx);
  for (const t of PR) assert.equal(rc.declarePurge("zz-probe", [t]).declaredBy, "project-roster", t);
  const order = declarers(x);
  assert.equal(order.indexOf("project-roster"), order.indexOf("membership") + 1, "directly after membership");
  /* negative control: a table no module declared is free to a probe */
  assert.equal(rc.declarePurge("zz-probe", ["zz_none"]).ok, true);
});

test("R3 (T38-26): a store written before the split held these tables (membership made them) and opens with them, rows kept; a store that lost them gets them back; a second construction changes nothing", async () => {
  const db = new DatabaseSync(":memory:");
  const first = await store({ db });
  first.ctx.storage.sql.exec(`INSERT INTO project_owner_votes (project_id, kind, target, voter, created)
                              VALUES ('PROJ-x', 'add', 'bob', 'alice', 't')`);
  const kept = await store({ db });
  assert.equal(one(kept, `SELECT count(*) c FROM project_owner_votes`).c, 1, "a migrated store keeps its rows");
  for (const t of PR) db.exec(`DROP TABLE IF EXISTS ${t}`);
  assert.equal(PR.some((t) => tableNames(kept).includes(t)), false);
  const old = await store({ db });
  for (const t of PR) assert.ok(tableNames(old).includes(t), `table ${t}`);
  const shape = (x) => [...x.ctx.storage.sql.exec(`SELECT type, name, sql FROM sqlite_master WHERE tbl_name IN (${PR.map(() => "?").join(",")}) ORDER BY name`, ...PR)].map((r) => ({ ...r }));
  const was = shape(old);
  assert.ok(was.length >= PR.length);
  assert.deepEqual(shape(await store({ db })), was);
});

test("R2 (T38-26; project-roster R15, R16): construction starts project-roster, so membership's invitation and hiding slots are held by it before the first request", async () => {
  const x = await store();
  const m = membershipOf(x.ctx);
  for (const slot of ["onProjectInvited", "onProjectHidden"]) {
    const r = m[slot]("zz-probe", () => 0);
    assert.equal(r.ok, false, `${slot}: ${JSON.stringify(r)}`);
    assert.ok(JSON.stringify(r).includes("project-roster"), `${slot} is held by project-roster: ${JSON.stringify(r)}`);
  }
  assert.equal(projectRosterOf(x.ctx), projectRosterOf(x.ctx), "one instance per storage");
});

test("R5, R9 (T38-26; N783): project-roster's whole ops map is routed directly after membership's, each op answering through the route map what its one instance answers", async () => {
  const x = await world(), u = new URL("http://do/");
  const names = MODULE_MAPS.map(([mod]) => mod);
  assert.equal(names.indexOf("project-roster"), names.indexOf("membership") + 1, "directly after membership's map");
  assert.deepEqual(Object.keys(projectRosterOps(projectRosterOf(x.ctx), u, null, x.env)), OPS);
  const mem = Object.keys(MODULE_MAPS.find(([mod]) => mod === "membership")[1](x.ctx, u, null, x.env));
  const keys = Object.keys(x.s.routes(u, null));
  for (const op of OPS) assert.equal(mem.includes(op), false, `${op} is no longer membership's`);
  const at = keys.indexOf(mem.at(-1)) + 1;
  assert.deepEqual(keys.slice(at, at + OPS.length), OPS);
  /* each op reaches project-roster's one instance: the reads answer what it answers */
  const r = projectRosterOf(x.ctx);
  const same = async (path, direct) => assert.deepEqual(await x.call(path), JSON.parse(JSON.stringify(direct)), path);
  await same(`/projectparticipants?projectId=${x.P}&by=alice`, r.projectParticipants({ projectId: x.P, by: "alice" }));
  await same(`/projectvisibility?projectId=${x.P}&viewer=member:alice`, r.projectVisibility({ projectId: x.P, viewer: "member:alice" }));
  await same(`/projectdirectory?viewer=member:bob`, r.projectDirectory({ viewer: "member:bob" }));
  await same(`/projectrequests?by=bob&viewer=member:bob`, r.projectRequests({ by: "bob", viewer: "member:bob" }));
  const parts = await x.call(`/projectparticipants?projectId=${x.P}&by=alice`);
  assert.equal(parts.ok, true, JSON.stringify(parts));
  /* an act through the route map: alice, the sole owner, adds bob once he has joined; before that it is refused */
  const refused = await x.call(`/projectowneradd?projectId=${x.P}&handle=h_bob&by=alice&viewer=member:alice`);
  assert.equal(refused.ok, false, JSON.stringify(refused));
  /* negative control: an op that names nothing answers as project-roster does, not as a missing route */
  await same(`/projectrequestwithdraw?projectId=PROJ-none&by=bob&viewer=member:bob`,
             r.projectRequestWithdraw({ projectId: "PROJ-none", by: "bob", viewer: "member:bob" }));
});

test("R10 (T38-26; project-roster R17): `projectOwnerVotes` is project-roster's figure, registered under its name, counted on op=stats through the caller's sight", async () => {
  const x = await world();
  const rc = recordOf(x.ctx);
  const held = rc.registerCounts("zz-probe", ["projectOwnerVotes"], () => ({}));
  assert.deepEqual([held.code, held.heldBy], ["COUNTS_DECLARED", "project-roster"]);
  x.ctx.storage.sql.exec(`INSERT INTO project_owner_votes (project_id, kind, target, voter, created) VALUES (?, 'add', 'bob', 'alice', 't')`, x.P);
  assert.equal((await x.call("/stats", null)).projectOwnerVotes, 1, "counted whole for an internal call");
  assert.equal((await x.call("/stats?viewer=member:alice", null)).projectOwnerVotes, 1, "the owner sees the project's vote");
  assert.equal((await x.call("/stats?viewer=member:bob", null)).projectOwnerVotes, 0, "a member outside it does not");
});
