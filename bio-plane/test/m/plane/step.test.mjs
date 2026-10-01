/* plane R10 (K861): control-plane's promotion step (its R42: provenance's testimony slot and membership's sight index),
   registered under control-plane's name where the held step stood, each promotion answering as it answered under
   `legacy-store`. Its rank in the step order is `store.test.mjs`' R2 pin. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { instanceSetupOf } from "../../../src/setup.mjs";

const projMd = (title) => ["---", "object_type: project", "schema: project@1", `title: "${title}"`, "current_state: forming",
  "prior_state: null", `created: "2026-09-27T00:00:00Z"`, `last_updated: "2026-09-27T00:00:00Z"`,
  `objective: "Find out what happened."`, "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", ""].join("\n");

/* A store with its group recorded, members alice and bob, and one project of alice's (hidden: the default). */
async function world() {
  const x = await store();
  instanceSetupOf(x.ctx).instanceGroupSeed({ slug: "oak-watch", author: "admin" });
  for (const m of ["alice", "bob"])
    x.ctx.storage.sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
                            VALUES (?, ?, ?, 'member', 'active', '["contribute"]', 't', 't')`, m, `Cover ${m}`, `h_${m}`);
  const created = promotionOf(x.ctx).promote({ base: null, snapKey: "k1", author: "member:alice", ownerMemberId: "alice",
    files: [{ path: "bundle.md", text: projMd("Budget watch") }], meta: { object_type: "project" } });
  assert.equal(created.ok, true, JSON.stringify(created));
  return { ...x, created, P: created.bundleId };
}
const one = (x, q, ...a) => [...x.ctx.storage.sql.exec(q, ...a)][0];

test("R10: control-plane's step, registered under its name (its R42), keeps the projection's answer: a project's creation answers its visibility read back and gains its sight row; a revision answers no visibility", async () => {
  const x = await world();
  assert.deepEqual(Object.keys(x.created).sort(), ["bundleId", "bundleSha", "ok", "owner", "rowVersion", "visibility"]);
  assert.equal(x.created.visibility, "hidden");
  assert.equal(x.created.owner, "alice");
  assert.equal(x.created.rowVersion, 1);
  const row = one(x, `SELECT bundle_sha, row_version FROM bundles WHERE bundle_id = ?`, x.P);
  assert.equal(x.created.bundleSha, row.bundle_sha);
  assert.equal(one(x, `SELECT count(*) c FROM project_sight WHERE project_id = ?`, x.P).c, 1, "the sight index follows the bundle");
  const text = recordOf(x.ctx).readFile(x.P, "bundle.md").text;
  const idLine = text.split("\n").find((l) => l.startsWith("id:"));
  const rev = promotionOf(x.ctx).promote({ bundleId: x.P, base: x.created.bundleSha, snapKey: "k2", author: "member:alice",
    files: [{ path: "bundle.md", text: projMd("Budget watch, renamed").replace("---\n", `---\n${idLine}\n`) }],
    meta: { object_type: "project" } });
  assert.equal(rev.ok, true, JSON.stringify(rev));
  assert.equal(rev.rowVersion, 2);
  assert.equal(Object.hasOwn(rev, "visibility"), false);
  assert.equal(Object.hasOwn(rev, "testimony"), false, "no other path's answer gains the testimony key");
});

test("R10: control-plane's step keeps the testimony slot: op=testify's later work runs inside its promotion and its answer carries it; a refused testimony writes nothing", async () => {
  const x = await world();
  const r = await x.call("/testify?author=member:alice", { words: "The gate on the north side was chained shut.", observedAt: "2026-09-01" });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.match(String(r.content_id), /^[0-9a-f]{64}$/, "the content row the slot minted");
  const row = [...x.ctx.storage.sql.exec(`SELECT bundle_id, capture_sha FROM content WHERE content_id = ?`, r.content_id)].map((o) => ({ ...o }));
  assert.deepEqual(row, [{ bundle_id: r.bundle_id, capture_sha: r.capture_sha }]);
  const before = one(x, `SELECT count(*) c FROM content`).c, bundles = one(x, `SELECT count(*) c FROM bundles`).c;
  const bad = await x.call("/testify?author=member:alice", { words: "", observedAt: "2026-09-01" });
  assert.equal(bad.ok, false);
  assert.equal(one(x, `SELECT count(*) c FROM content`).c, before);
  assert.equal(one(x, `SELECT count(*) c FROM bundles`).c, bundles);
});
