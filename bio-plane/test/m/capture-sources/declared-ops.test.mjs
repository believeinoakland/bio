/* capture-sources R67 (T51; K4168): each op this module declares in DECLARED_OPS is held true against the op as the door runs it
   (test-support R15): only its requires raise no refusal naming a declared field, a call without each required one is refused
   naming it, and a field outside accepts is dropped or refused naming it. The declaration also says what R67 says of its classes, stamps and needs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { declaredOpHolds } from "../../declared-ops.mjs";
import { captureSourcesOps, DECLARED_OPS } from "../../../src/capture-sources/ops.mjs";
import { world, SECRET, HOST } from "./world.mjs";

const stampsFor = { viewer: "member:ann", by: "ann" };
/* a refusal names a field by a whole word of its detail, the default of the helper; the codes below are the ones that name theirs in the code alone */
const withoutIds = (a) => JSON.parse(JSON.stringify(a, (k, v) => (k === "credential" && typeof v === "string" ? "(id)" : k === "supplied_at" || k === "withdrawn_at" ? "(at)" : v)));
const sameShape = (x, y) => JSON.stringify(withoutIds(x)) === JSON.stringify(withoutIds(y));

/* the call as the door runs it: a fresh world each time, ann's credential already held where the op needs one */
const mk = (op) => async (given) => {
  const w = await world();
  let fields = given;
  if (op === "capturecredentialwithdraw") {
    const made = await w.c.credentialSupply({ kind: "login", host: HOST, secret: SECRET, scope: "member", by: "ann" });
    if ("credential" in fields) fields = { ...fields, credential: made.credential.credential };
  }
  const read = op === "capturecredentiallist";
  const q = new URLSearchParams({ op, ...stampsFor, ...(read ? Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, String(v)])) : {}) });
  return await captureSourcesOps(w.c, new URL("http://x/?" + q), read ? {} : fields)[op]();
};

test("R67 capturecredentialsupply's declaration holds: its requires alone are accepted, each missing one is refused naming it, an outside field is dropped", async () => {
  await declaredOpHolds({ op: "capturecredentialsupply", declaration: DECLARED_OPS.capturecredentialsupply, call: mk("capturecredentialsupply"),
    values: { kind: "login", host: HOST, secret: SECRET, scope: "member", project: "P1" }, same: sameShape });
});

test("R67 capturecredentiallist's declaration holds: no field is required, an outside field is dropped", async () => {
  await declaredOpHolds({ op: "capturecredentiallist", declaration: DECLARED_OPS.capturecredentiallist, call: mk("capturecredentiallist"),
    values: { scope: "member", project: "P1", limit: "5" }, same: sameShape });
});

test("R67 capturecredentialwithdraw's declaration holds: the credential is required, an outside field is dropped", async () => {
  await declaredOpHolds({ op: "capturecredentialwithdraw", declaration: DECLARED_OPS.capturecredentialwithdraw, call: mk("capturecredentialwithdraw"),
    values: { credential: "(a held credential)" }, same: sameShape });
});

test("R67 the module declares exactly its three ops, each a whole row", async () => {
  assert.deepEqual(Object.keys(DECLARED_OPS).sort(), ["capturecredentiallist", "capturecredentialsupply", "capturecredentialwithdraw"]);
  for (const [op, row] of Object.entries(DECLARED_OPS)) {
    assert.deepEqual(row.classes, ["admin", "member"], op);
    assert.deepEqual(row.machineClasses, [], op);
    assert.equal(typeof row.description, "string", op);
    assert.ok(row.description.length > 0, op);
    assert.ok(Array.isArray(row.fields.accepts) && Array.isArray(row.fields.requires), op);
    for (const r of row.fields.requires.flat()) assert.ok(row.fields.accepts.includes(r), `${op} requires ${r} but does not accept it`);
  }
  assert.equal(DECLARED_OPS.capturecredentialsupply.mutating, true);
  assert.equal(DECLARED_OPS.capturecredentialwithdraw.mutating, true);
  assert.equal(DECLARED_OPS.capturecredentiallist.mutating, false);
  assert.deepEqual(DECLARED_OPS.capturecredentialsupply.stamps, ["viewer", "by"]);
  assert.deepEqual(DECLARED_OPS.capturecredentialwithdraw.stamps, ["viewer", "by"]);
  assert.equal(DECLARED_OPS.capturecredentialsupply.needs, "contribute");
  assert.equal(DECLARED_OPS.capturecredentialwithdraw.needs, "contribute");
  assert.equal(DECLARED_OPS.capturecredentiallist.needs, null);
});
