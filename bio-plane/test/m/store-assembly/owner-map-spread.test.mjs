/* store-assembly's own tests of the owner map's place in the assembled store (R89) and of its two getter-gated arms (R88), the
   counterparts of control-plane's r117-held.test.mjs and r118-shared.test.mjs, driven through the real assembled store. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { ownerOps } from "../../../src/store-assembly/owner-ops.mjs";
import { ownerGettersOf } from "../../../src/store-assembly/owners.mjs";
import { captureOps, captureOf } from "../../../src/capture/index.mjs";
import { projectRosterOps, projectRosterOf } from "../../../src/project-roster/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { reviewOf } from "../../../src/review/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { instanceSetupOf } from "../../../src/setup.mjs";
import { controlPlaneRoutes } from "../../../src/store-door/dispatch.mjs";

const SHA = "c".repeat(64);
const projMd = (title) => ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
  "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  `objective: "Find out what happened."`, "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n");

/* a real store with its group recorded, member alice, and two projects of hers (promoted through promotion) */
async function world() {
  const x = await store();
  instanceSetupOf(x.ctx).instanceGroupSeed({ slug: "oak-watch", author: "admin" });
  x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                          VALUES ('alice', 'Cover alice', 'h_alice', 'member', 'active', '["contribute"]', 't', 't')`);
  const project = (title) => {
    const r = promotionOf(x.ctx).promote({ base: null, snapKey: "k-" + title, author: "member:alice", ownerMemberId: "alice",
      files: [{ path: "bundle.md", text: projMd(title) }], meta: { object_type: "project" } });
    assert.equal(r.ok, true, JSON.stringify(r));
    return r.bundleId;
  };
  return { ...x, shared: project("Shared one"), bare: project("Bare one") };
}

test("R89: the route map holds each key once, the owner map is spread after every owner's own map and before store-door's, and `projectlist`, in both an owner's map and this one, is answered by this one with `shared_drafts`", async () => {
  const x = await world();
  const path = "/projectlist?viewer=member:alice";
  const routes = x.routes(path);
  const keys = Object.keys(routes);
  assert.equal(new Set(keys).size, keys.length, "an object's keys are held once");
  const url = new URL("http://do" + path);
  const mine = ownerOps(ownerGettersOf(x.ctx, x.env), url, null);
  assert.ok(Object.keys(mine).length > 50 && "projectlist" in mine);
  for (const k of Object.keys(mine)) assert.ok(Object.hasOwn(routes, k), `the route map holds ${k}`);
  /* the owners' own maps that hold a key of the owner map: project-roster's `projectlist`, capture's four parted-upload ops */
  const own = { ...captureOps(captureOf(x.ctx), url, null, x.env, {}), ...projectRosterOps(projectRosterOf(x.ctx), url, null, x.env) };
  const both = Object.keys(mine).filter((k) => Object.hasOwn(own, k));
  assert.ok(both.includes("projectlist"), "projectlist is in an owner's own map and in this one");
  for (const k of both) {
    assert.notEqual(routes[k].toString(), own[k].toString(), `${k}: not the owner's own function`);
    assert.equal(routes[k].toString(), mine[k].toString(), `${k}: the owner map's function`);
  }
  /* negative control: a key only an owner's own map holds (project-roster's `projectrequests`) stays that owner's */
  assert.ok(Object.hasOwn(routes, "projectrequests") && !Object.hasOwn(mine, "projectrequests"));
  /* the answer: `projectlist` carries `shared_drafts` on each row, which project-roster's own arm (no reader) leaves null */
  const answer = await x.call(path);
  assert.equal(answer.ok, true, JSON.stringify(answer).slice(0, 300));
  assert.ok(answer.projects.length >= 2);
  for (const p of answer.projects) assert.deepEqual(p.shared_drafts, { count: 0, newest: null }, p.id);
  const ownAnswer = JSON.parse(JSON.stringify(own.projectlist()));
  assert.ok(ownAnswer.projects.every((p) => p.shared_drafts === null), "control: the roster's own arm holds no reader");
  /* the order, by what it decides: a key store-door's map holds is answered by store-door's (spread last), and every other key
     of the owner map by the owner map (spread after every owner's own) */
  const door = controlPlaneRoutes(x.ctx, url, null, null);
  for (const k of Object.keys(door)) assert.equal(routes[k].toString(), door[k].toString(), `${k}: store-door's, spread last`);
  for (const k of Object.keys(mine).filter((k) => !Object.hasOwn(door, k)))
    assert.equal(routes[k].toString(), mine[k].toString(), `${k}: the owner map's`);
});

test("R88: through the real store `readheldfor` reaches extraction's one instance and `projectlist` answers `shared_drafts` from review; a project with none answers {count: 0, newest: null}; neither getter is asked for another op", async () => {
  const x = await world();
  /* readheldfor: extraction's one instance, asked for the digest and the namespace the door names */
  const ex = extractionOf(x.ctx), real = ex.readHeld, seen = [];
  ex.readHeld = function (a, ...rest) { seen.push(a); return real.call(this, a, ...rest); };
  try {
    const direct = JSON.parse(JSON.stringify(await real.call(ex, { sha: SHA, storeName: "bio" })));
    const viaStore = await x.call(`/readheldfor?sha=${SHA}`);
    assert.deepEqual(viaStore, direct, "answered as extraction answers it");
    assert.deepEqual(seen, [{ sha: SHA, storeName: "bio" }], "extraction's one instance, `store` defaulting to bio");
    await x.call(`/readheldfor?sha=${SHA}&store=scratch`);
    assert.deepEqual(seen[1], { sha: SHA, storeName: "scratch" });
  } finally { ex.readHeld = real; }
  /* projectlist: a draft shared for review in one project, none in the other */
  const r = reviewOf(x.ctx);
  const d = r.act({ act: "draft", author: "alice", project: x.shared, statement: "S" });
  assert.ok(d.ok !== false && d.draftId, JSON.stringify(d).slice(0, 300));
  const g = r.act({ act: "grant", author: "alice", draft: d.draftId, recipient: "R1", secretSha: "a".repeat(64) });
  assert.ok(g.ok !== false, JSON.stringify(g).slice(0, 300));
  const listed = await x.call(`/projectlist?viewer=member:alice`);
  assert.equal(listed.ok, true, JSON.stringify(listed).slice(0, 300));
  const row = (id) => listed.projects.find((p) => p.id === id);
  assert.equal(row(x.shared).shared_drafts.count, 1, JSON.stringify(row(x.shared)));
  assert.equal(typeof row(x.shared).shared_drafts.newest, "string");
  assert.deepEqual(row(x.bare).shared_drafts, { count: 0, newest: null }, "control: a project with none");
  /* neither getter is asked for another op: wrap the getters and serve other ops of the map */
  const asked = [], real2 = ownerGettersOf(x.ctx, x.env);
  const of = Object.fromEntries(Object.entries(real2).map(([k, f]) => [k, () => { asked.push(k); return f(); }]));
  const serve = async (path) => { const u = new URL("http://do" + path); return ownerOps(of, u, null)[u.pathname.slice(1)](); };
  await serve("/approvedunsent?viewer=member:alice");
  await serve("/checkpointsdue");
  await serve("/costmessages?viewer=member:alice");
  assert.deepEqual(asked, ["filings", "actionPlans", "steps"], "only the owners of the ops served");
  assert.equal(asked.includes("extraction") || asked.includes("projectRoster"), false);
  /* and each of the two asks only its own owner(s) */
  asked.length = 0;
  await serve(`/readheldfor?sha=${SHA}`);
  assert.deepEqual(asked, ["extraction"]);
  asked.length = 0;
  await serve("/projectlist?viewer=member:alice");
  assert.deepEqual([...new Set(asked)].sort(), ["projectRoster", "review"]);
  /* control: the arms exist once their getter is handed */
  const url = new URL("http://do/x");
  assert.equal("readheldfor" in ownerOps({}, url, null), false);
  assert.equal("projectlist" in ownerOps({ review: real2.review }, url, null), false);
});
