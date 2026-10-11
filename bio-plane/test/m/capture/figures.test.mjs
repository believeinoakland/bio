/* capture: its figures (R75), and R69's attesting keys read from credentials (its R11) on the instance's own storage,
   at the module's interface: `captureOf` over a fresh store with record-core, membership and credentials as the host
   builds them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storage, provenance, fresh, newKey, sshsign, signer, H } from "./fixture.mjs";
import { captureOf, Capture, captureAccountStatement } from "../../../src/capture/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { membershipOf } from "../../../src/membership/index.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { NS_RATIFY } from "../../../src/sshsig.mjs";

function world() {
  const ctx = { storage: storage() };
  const record = recordOf(ctx);
  record.migrate();
  membershipOf(ctx, { record }).migrate();
  credentialsOf(ctx, { record }).migrate();
  const c = captureOf(ctx, { record, governor: {}, provenance: provenance(ctx.storage) });
  c.migrate();
  return { ctx, record, c, s: ctx.storage };
}
const hidAll = { sql: "(SELECT bundle_id FROM bundles)", args: [] };

test("R75: captureOf registers taskQueue and sourceReachability with record-core's registerCounts once per storage, each counting every row of its table whatever the caller may not see", async () => {
  const { ctx, record, c } = world();
  assert.deepEqual([...Capture.COUNT_KEYS], ["taskQueue", "sourceReachability"]);
  assert.deepEqual(record.counts(), { taskQueue: 0, sourceReachability: 0 }, "registered, in order, and counted on an empty store");
  for (let i = 1; i <= 3; i++) assert.equal((await c.taskEnqueue({ captureSha: H(String(i)), subject: "s" })).queued, true);
  await c.taskEnqueue({ captureSha: H("1"), subject: "s" });
  for (const [a, o] of [["https://a.example/1", "success"], ["https://a.example/2", "fetch_failed"], ["https://a.example/2", "governed"]])
    await c.recordSourceOutcome({ addressNorm: a, outcome: o });
  assert.deepEqual(record.counts(), { taskQueue: 3, sourceReachability: 2 }, "a dedupe adds no row; one row per address");
  /* neither table names a bundle: a caller who may see no bundle gets the same figures */
  assert.deepEqual(record.counts(hidAll), { taskQueue: 3, sourceReachability: 2 });
  assert.deepEqual(c.counts(hidAll), c.counts(null));
  /* the figures move with the rows: an event removed, a purge of the whole store */
  assert.equal(c.taskEventRemove({ kind: "authority-undetermined", captureSha: H("2") }).found, true);
  assert.equal(record.counts().taskQueue, 2);
  record.purge({});
  assert.deepEqual(record.counts(), { taskQueue: 0, sourceReachability: 0 }, "purge's proof reads them gone");
  /* reaching the instance again registers nothing more */
  assert.equal(captureOf(ctx), c);
  assert.deepEqual(Object.keys(record.counts()), ["taskQueue", "sourceReachability"]);
});

test("R75: a figure that cannot be read is null, never zero; counts writes nothing and never throws", () => {
  const { s, c, record } = world();
  s.sql.exec(`DROP TABLE source_reachability`);
  const schema = () => s.sql.exec(`SELECT type, name, sql FROM sqlite_master ORDER BY name`).map((r) => ({ ...r }));
  const before = schema();
  assert.deepEqual(c.counts(), { taskQueue: 0, sourceReachability: null });
  assert.deepEqual(record.counts(), { taskQueue: 0, sourceReachability: null });
  assert.deepEqual(schema(), before, "nothing was created or changed");
});

test("R75: a record on which another module already reports one of these figures, or capture registered already, is a wiring defect and loud; a record with no seam is left alone", () => {
  const taken = { ctx: { storage: storage() } };
  taken.record = recordOf(taken.ctx);
  taken.record.migrate();
  assert.equal(taken.record.registerCounts("elsewhere", ["sourceReachability"], () => ({ sourceReachability: 7 })).ok, true);
  assert.throws(() => captureOf(taken.ctx, { record: taken.record, governor: {}, provenance: provenance(taken.ctx.storage) }),
                /refused its figures: COUNTS_DECLARED \(held by elsewhere\)/);
  const twice = { ctx: { storage: storage() } };
  twice.record = recordOf(twice.ctx);
  twice.record.migrate();
  assert.equal(twice.record.registerCounts("capture", ["other"], () => ({ other: 1 })).ok, true);
  assert.throws(() => captureOf(twice.ctx, { record: twice.record, governor: {}, provenance: provenance(twice.ctx.storage) }),
                /refused its figures: COUNTS_DECLARED \(held by capture\)/);
  const bare = { storage: storage() };
  assert.ok(captureOf(bare, { record: { declarePurge() {}, transact: (fn) => fn() }, governor: {}, provenance: provenance(bare.storage) }));
});

test("R69 (credentials R11): with no credentials handed in, the account is verified against credentials' attesting keys on the instance's own storage", async () => {
  const f = fresh();
  /* a second Capture over the same storage, handed no credentials: it reaches credentialsOf on that storage */
  const c = new Capture(f.s, { record: f.core, env: {}, governor: {}, provenance: provenance(f.s) });
  const d = H("a1");
  c.recordCaptureActor({ captureSha: d, actor: "m1" });
  const key = await newKey();
  signer(f.s, "m1", key.keyB64);
  const text = "Saved from the clerk's page.";
  const sig = await sshsign(key, captureAccountStatement(d, text), NS_RATIFY);
  assert.equal((await c.recordCaptureAccount({ captureSha: d, text, signature: sig, by: "m1" })).ok, true);
  assert.deepEqual(credentialsOf({ storage: f.s }).attestingKeys().map((k) => k.member_id), ["m1"], "the one credentials of this storage");
  /* a key credentials does not count as attesting (its member revoked) attests nothing here either */
  f.s.sql.exec(`UPDATE members SET status = 'revoked' WHERE member_id = 'm1'`);
  assert.equal((await c.recordCaptureAccount({ captureSha: d, text, signature: sig, by: "m1" })).reason, "SIG_UNKNOWN_KEY");
});
