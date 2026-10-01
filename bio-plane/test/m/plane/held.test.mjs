/* plane R10: the code held for owners not yet extracted (K842), registered as `plane-held`, each share answering as it
   answered under `legacy-store`: the stats figures (op=stats and purge's proof), the leg-grade registration, and the
   promotion step (provenance's testimony slot and the sight index, with the answer's keys). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { retrievalOf } from "../../../src/retrieval/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { runProductionsOf } from "../../../src/run-productions/index.mjs";
import { instanceSetupOf } from "../../../src/setup.mjs";
import { HELD, heldLegGrades } from "../../../src/plane/held.mjs";
import { inquiryOf, legCapped } from "../../../src/inquiry/index.mjs";

/* The held figures, in the order the answer gives them, before every module's registered figures (record-core R63). */
const WIRE = ["bundles", "files", "history", "refs", "textIndexOk", "projectParticipants", "projectOwnerVotes",
              "proposedReadings", "inquiryMigrationReplays", "observationsNonLead", "basisVersions", "basisVersionLegs",
              "suggestRefusals"];

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

test("R10: op=stats answers the held figures first, in their order, through the caller's sight, each as its table counts it", async () => {
  const x = await world();
  const whole = await x.call("/stats", null);   /* no viewer sent: a direct internal call, counted whole */
  assert.deepEqual(Object.keys(whole).slice(0, WIRE.length), WIRE);
  assert.equal(whole.bundles, one(x, `SELECT count(*) c FROM bundles`).c);
  assert.equal(whole.bundles, 1);
  assert.equal(whole.files, one(x, `SELECT count(*) c FROM files`).c);
  assert.equal(whole.history, one(x, `SELECT count(*) c FROM history`).c);
  assert.equal(whole.refs, one(x, `SELECT count(*) c FROM refs`).c);
  assert.equal(whole.projectParticipants, one(x, `SELECT count(*) c FROM project_participants`).c);
  assert.ok(whole.projectParticipants >= 1, "the owner participates");
  assert.equal(whole.projectOwnerVotes, 0);
  assert.equal(whole.textIndexOk, extractionOf(x.ctx).textIndexOk());
  const prod = runProductionsOf(x.ctx).counts(null);
  assert.equal(whole.proposedReadings, prod.proposedReadings);
  assert.equal(whole.suggestRefusals, prod.suggestRefusals);
  assert.equal(whole.inquiryMigrationReplays, 0);
  assert.equal(whole.basisVersions, 0);
  assert.equal(whole.basisVersionLegs, 0);
  /* Through the caller's sight: the owner sees the project's rows, a member outside it sees none, and a stamp no one
     is fails closed. */
  const owner = await x.call("/stats?viewer=member:alice", null);
  for (const k of ["bundles", "files", "history", "projectParticipants"]) assert.equal(owner[k], whole[k], `alice ${k}`);
  for (const v of ["member:bob", ""]) {
    const out = await x.call(`/stats?viewer=${encodeURIComponent(v)}`, null);
    for (const k of ["bundles", "files", "history", "projectParticipants"]) assert.equal(out[k], 0, `${v || "(empty)"} ${k}`);
  }
});

test("R10: the log counts: the wire's `observationsNonLead` leaves out lead rows, purge's proof counts the whole log and the leads, and neither carries the other's key", async () => {
  const x = await world();
  const base = await x.call("/stats", null);
  const cols = [...x.ctx.storage.sql.exec(`PRAGMA table_info(observation_log)`)]
    .filter((c) => c.notnull && c.dflt_value === null && !c.pk);
  const put = (kind) => x.ctx.storage.sql.exec(
    `INSERT INTO observation_log (${cols.map((c) => c.name).join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
    ...cols.map((c) => (c.name === "authority_kind" ? kind : /INT|REAL/i.test(c.type) ? 0 : `v-${kind}-${c.name}`)));
  put("lead");
  put("extract");
  const wire = await x.call("/stats", null);
  assert.equal(wire.observationsNonLead, base.observationsNonLead + 1, "the lead row is not on the wire");
  assert.equal(wire.observationsNonLead, one(x, `SELECT count(*) c FROM observation_log WHERE authority_kind <> 'lead'`).c);
  for (const k of ["observations", "leads"]) assert.equal(Object.hasOwn(wire, k), false, `the wire carries no ${k}`);
  const proof = recordOf(x.ctx).proofCounts();
  assert.equal(proof.observations, one(x, `SELECT count(*) c FROM observation_log`).c);
  assert.equal(proof.leads, one(x, `SELECT count(*) c FROM leads`).c);
  assert.equal(Object.hasOwn(proof, "observationsNonLead"), false);
});

test("R10: the held shares are registered as `plane-held`: the stats source, the leg grades and the promotion step", async () => {
  const x = await store();
  assert.equal(recordOf(x.ctx).registerStatsSource("x", () => ({})).heldBy, HELD);
  assert.equal(retrievalOf(x.ctx).registerLegGrades("x", () => []).declaredBy, HELD);
  assert.equal(promotionOf(x.ctx).registerStep(HELD, {}).ok, false, "the step is held under its name");
});

test("R10: the held step's projection: a project's creation answers its visibility read back and gains its sight row; a revision answers no visibility", async () => {
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

test("R10: the held step's testimony slot: op=testify's later work runs inside its promotion and its answer carries it; a refused testimony writes nothing", async () => {
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

test("R10: the held leg grades cap each leg's capture letter by its target's earned capture ceiling, as inquiry answers them (its R13, R14)", async () => {
  const x = await world();
  const legs = [{ grade: "A", target_id: x.P }, { grade: "C", target_id: "INFO-none" }, { grade: "B", target_id: x.P }];
  const cap = inquiryOf(x.ctx).earned(null, [x.P, "INFO-none"])?.earned?.capture || {};
  assert.deepEqual(heldLegGrades(x.ctx)(legs), legs.map((l) => legCapped(l.grade, cap[l.target_id], l.target_id)));
  assert.equal(heldLegGrades(x.ctx)([]).length, 0);
});
