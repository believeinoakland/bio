/* plane R10 (K842, K861): the stats figures (op=stats and purge's proof) and the leg grades, registered under their
   owners' names, and the plane's own stats sight (`src/plane/stats.mjs`), registered as `plane`, each answering as it
   answered under `legacy-store`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { promotionOf } from "../../../src/promotion/index.mjs";
import { retrievalOf } from "../../../src/retrieval/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { runProductionsOf } from "../../../src/run-productions/index.mjs";
import { instanceSetupOf } from "../../../src/setup.mjs";
import { inquiryOf, legCapped, inquiryLegGrades, Inquiry } from "../../../src/inquiry/index.mjs";
import { RecordCore } from "../../../src/record-core/index.mjs";
import { Membership } from "../../../src/membership/index.mjs";
import { RunProductions } from "../../../src/run-productions/index.mjs";
import { BasisVersions } from "../../../src/basis-versions/index.mjs";
import { ObservationLog } from "../../../src/observation-log/index.mjs";

/* The figures the held copy answered on the wire; their order is free (K861 (5)). */
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

test("R10: op=stats answers every figure the held copy answered, through the caller's sight, each as its table counts it", async () => {
  const x = await world();
  const whole = await x.call("/stats", null);   /* no viewer sent: a direct internal call, counted whole */
  for (const k of WIRE) assert.equal(Object.hasOwn(whole, k), true, `op=stats carries ${k}`);
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
    assert.equal(out.refs, one(x, `SELECT count(*) c FROM refs WHERE COALESCE(bundle_id, '') <> ? AND COALESCE(target_id, '') <> ?`, x.P, x.P).c, `${v || "(empty)"} refs`);
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

/* Each owner's exported figures, registered under the owner's name (record-core R63). */
const OWNED = [["record-core", RecordCore.COUNT_KEYS], ["membership", Membership.COUNT_KEYS],
               ["run-productions", RunProductions.COUNT_KEYS], ["inquiry", Inquiry.COUNT_KEYS],
               ["observation-log", ObservationLog.COUNT_KEYS], ["basis-versions", BasisVersions.COUNT_KEYS]];

test("R10: each owner's figures are registered under its own name, the stats sight as `plane`, the leg grades as `inquiry`, the promotion step as `control-plane`; nothing is registered twice", async () => {
  const x = await store();
  const rc = recordOf(x.ctx);
  for (const [owner, keys] of OWNED) {
    assert.deepEqual(rc.registerCounts(owner, ["zz-probe"], () => ({})).heldBy, owner, `${owner} has registered its figures`);
    for (const k of keys) {
      const r = rc.registerCounts("zz-probe", [k], () => ({}));
      assert.equal(r.code, "COUNTS_DECLARED", k);
      assert.equal(r.heldBy, owner, `${k} is ${owner}'s`);
    }
  }
  /* The plane's own figures are its sight's, registered by no module; record-core no longer reports refs (K877). */
  for (const k of ["refs", "textIndexOk", "observationsNonLead"]) assert.equal(Object.hasOwn(rc.counts(null), k), false, k);
  assert.deepEqual(OWNED.flatMap(([, keys]) => keys).sort(),
    ["basisVersionLegs", "basisVersions", "bundles", "files", "history", "inquiryMigrationReplays", "leads", "observations",
     "projectOwnerVotes", "projectParticipants", "proposedReadings", "suggestRefusals"]);
  assert.equal(rc.registerStatsSource("x", () => ({})).heldBy, "plane");
  assert.equal(retrievalOf(x.ctx).registerLegGrades("x", () => []).declaredBy, "inquiry");
  assert.equal(promotionOf(x.ctx).registerStep("control-plane", {}).ok, false, "control-plane's step is held under its name");
  assert.equal(promotionOf(x.ctx).registerStep("plane-held", {}).ok, true, "no step is held as `plane-held`");
});

test("R10: the leg grades registered as `inquiry` cap each leg's capture letter by its target's earned capture ceiling, as the held copy answered them (inquiry R13, R14)", async () => {
  const x = await world();
  const legs = [{ grade: "A", target_id: x.P }, { grade: "C", target_id: "INFO-none" }, { grade: "B", target_id: x.P }];
  const cap = inquiryOf(x.ctx).earned(null, [x.P, "INFO-none"])?.earned?.capture || {};
  assert.deepEqual(inquiryLegGrades(x.ctx)(legs), legs.map((l) => legCapped(l.grade, cap[l.target_id], l.target_id)));
  assert.equal(inquiryLegGrades(x.ctx)([]).length, 0);
});
