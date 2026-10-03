/* plane R18 (N529, N532; K1332, K1333): the composition of the two modules split out in T29. `case-disclosures` is built
   with the plane's one `attestation` instance before `case-authoring`, whose lazy getter then finds that same instance;
   `case-carriage` is created by `publication`'s factory, eagerly, so its two tables exist and are declared at every boot.
   Neither has an ops map. Each module's own behaviour is its own tests'; these check only the composition, through the
   plane's interface: construction over a storage and the route map. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { generateKeyPairSync } from "node:crypto";
import { store, storage } from "./fixture.mjs";
import { MODULE_MAPS } from "./maps.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { attestationOf } from "../../../src/attestation/index.mjs";
import { caseAuthoringOf } from "../../../src/case-authoring/index.mjs";
import * as disclosures from "../../../src/case-disclosures/index.mjs";
import * as carriage from "../../../src/case-carriage/index.mjs";

const { caseDisclosuresOf } = disclosures;
const { caseCarriageOf, CASE_CARRIAGE_EXEMPT } = carriage;
const CC = [...CASE_CARRIAGE_EXEMPT];
const tableNames = (x) => [...x.ctx.storage.sql.exec(`SELECT name FROM sqlite_master WHERE type='table'`)].map((r) => r.name);
const signingKey = () => generateKeyPairSync("ed25519").privateKey.export({ type: "pkcs8", format: "der" }).toString("base64");

test("R18: case-disclosures is built with the plane's one attestation instance, and case-authoring's getter finds that same one instance per host", async () => {
  const x = await store({ env: { RECEIPT_SIGNING_KEY: signingKey(), INSTANCE_NAME: "oak-plane" } });
  const a = attestationOf(x.ctx), d = caseDisclosuresOf(x.ctx);
  assert.equal(d.attestation, a, "case-disclosures holds the plane's attestation");
  assert.equal(await d.attestation.instanceKeyBound(), true, "the instance holding the deployment's key");
  assert.equal(caseAuthoringOf(x.ctx).disclosures, d, "case-authoring asks the one case-disclosures instance");
  assert.equal(caseDisclosuresOf(x.ctx, { attestation: null }), d, "one instance per host: a later call's deps change nothing");
  /* negative control: on another host, another instance */
  assert.notEqual(caseDisclosuresOf(storage().ctx), d);
});

test("R18: case-carriage is publication's, created at boot: its two tables exist and are declared exempt from purge under its own name", async () => {
  const x = await store();
  const names = tableNames(x);
  for (const t of CC) assert.ok(names.includes(t), `table ${t}`);
  const rc = recordOf(x.ctx);
  for (const t of CC) {
    const r = rc.declarePurge("zz-probe", [t]);
    assert.deepEqual([r.ok, r.reason, r.declaredBy], [false, "TABLE_DECLARED", "case-carriage"], t);
  }
  assert.ok(caseCarriageOf(x.ctx).purgeDeclaration?.ok, JSON.stringify(caseCarriageOf(x.ctx).purgeDeclaration));
  /* exempt: a whole-store purge clears neither */
  x.ctx.storage.sql.exec(`INSERT INTO published_case_materials (case_id, edition, ord, sha256, held) VALUES ('CASE-x', 1, 0, '${"a".repeat(64)}', 'inline')`);
  const removed = Object.keys(rc.purge().removed);
  for (const t of CC) assert.equal(removed.includes(t), false, t);
  assert.deepEqual(caseCarriageOf(x.ctx).heldMaterialsOf("CASE-x", 1), [{ sha: "a".repeat(64), held: "inline" }], "the row stays");
  /* negative control: a table no module declared is free to a probe */
  assert.equal(rc.declarePurge("zz-probe", ["zz_none"]).ok, true);
});

test("R18, R3: a store written before case-carriage opens with its tables, and a second construction changes nothing", async () => {
  const db = new DatabaseSync(":memory:");
  const first = await store({ db });
  for (const t of CC) db.exec(`DROP TABLE IF EXISTS ${t}`);
  assert.equal(CC.some((t) => tableNames(first).includes(t)), false);
  const old = await store({ db });
  for (const t of CC) assert.ok(tableNames(old).includes(t), `table ${t}`);
  const shape = (x) => [...x.ctx.storage.sql.exec(`SELECT type, name, sql FROM sqlite_master WHERE name LIKE 'published_ma%' OR name LIKE 'published_case_ma%' ORDER BY name`)].map((r) => ({ ...r }));
  const was = shape(old);
  assert.ok(was.length >= CC.length);
  assert.deepEqual(shape(await store({ db })), was);
});

test("R18, R5: neither case-disclosures nor case-carriage has an ops map, and the route map is every other module's own maps, unchanged", async () => {
  for (const [name, mod] of [["case-disclosures", disclosures], ["case-carriage", carriage]])
    assert.deepEqual(Object.keys(mod).filter((k) => /Ops$|Routes$/.test(k)), [], `${name} exports no ops map`);
  assert.equal(MODULE_MAPS.some(([m]) => m === "case-disclosures" || m === "case-carriage"), false);
  const x = await store(), u = new URL("http://do/");
  const union = [...new Set(MODULE_MAPS.flatMap(([, f]) => Object.keys(f(x.ctx, u, null, x.env))))];
  assert.deepEqual(Object.keys(x.s.routes(u, null)).sort(), union.sort());
});
