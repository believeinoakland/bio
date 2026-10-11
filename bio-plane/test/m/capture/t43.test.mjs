/* capture, T43 (N863, K2672) at the module's interface: R58, a later `captureOf` call that supplies no option reaches no
   other module's instance and creates no table, an option being compared only when the caller supplies it. Over the
   fixture's store with record-core migrated, and acquisition's real instance (its R38–R41 tables `archive_entries` and
   `unpack_days`, made when acquisition is first reached). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storage, provenance } from "./fixture.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";

const tablesOf = (s) => s.sql.exec(`SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`).map((r) => r.name);
const ACQUISITION_TABLES = ["archive_entries", "unpack_days"];

/* A host whose capture was made through captureOf and whose acquisition was never reached. */
function host() {
  const s = storage();
  const ctx = { storage: s };
  const record = recordOf(ctx, {});
  record.migrate();
  const c = captureOf(ctx, { record, governor: {}, provenance: provenance(s) });
  c.migrate();
  return { s, ctx, record, c };
}

test("R58 (T43, N863): captureOf(ctx) twice on a host whose acquisition was never reached answers the one instance, leaves the table list unchanged and makes neither of acquisition's tables", () => {
  const { s, ctx, c } = host();
  const before = tablesOf(s);
  for (const t of ACQUISITION_TABLES) assert.ok(!before.includes(t), `${t} absent before`);
  assert.equal(captureOf(ctx), c);
  assert.equal(captureOf(ctx), c);
  assert.deepEqual(tablesOf(s), before, "no table created by a call supplying nothing");
  /* a call supplying only options other than acquisition is compared on those alone */
  assert.equal(captureOf(ctx, { env: { INSTANCE_NAME: "i" } }), c);
  assert.equal(captureOf(ctx, { env: { INSTANCE_NAME: "i" }, ownHosts: ["group.example"] }), c);
  assert.throws(() => captureOf(ctx, { governor: { other: true } }), /different `governor`/);
  assert.deepEqual(tablesOf(s), before, "nor by one supplying other options, admitted or refused");
});

test("R58 (control): a different acquisition supplied is still compared, and refused by a throw naming it; the instance's own is accepted", () => {
  const { s, ctx, c } = host();
  assert.throws(() => captureOf(ctx, { acquisition: {} }), /different `acquisition`/);
  /* the comparison reached acquisition's instance, as R73's getter makes it, with its tables */
  for (const t of ACQUISITION_TABLES) assert.ok(tablesOf(s).includes(t), `${t} made once acquisition is compared`);
  assert.equal(captureOf(ctx, { acquisition: c.acquisition }), c, "the one it holds is the same");
});
