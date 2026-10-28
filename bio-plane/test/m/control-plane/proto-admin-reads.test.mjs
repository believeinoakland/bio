/* PROTOTYPE (proto/levels-2-3-all): tablebytes, protocprobe and protobprobe answer the admin bearer and a signed-in administrator
   session (op=stats' check); a plain member and no credential are refused. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, call, member, hex64 } from "./harness.mjs";

const ADM = hex64();
for (const op of ["tablebytes", "protocprobe", "protobprobe", "protopackedprobe"]) {
  test(`${op}: administrator session and admin bearer pass the gate; plain member and no credential are refused`, async () => {
    const { env, S } = world({ sessions: { [ADM]: member("zed", ["contribute"], { administer: true }) } });
    const notForbidden = (r) => assert.notEqual(r.json?.reason, "CLASS_FORBIDDEN", `${op}: ${r.text.slice(0, 200)}`);
    const adm = await call(env, { op, token: ADM }); assert.equal(adm.json?.tokenClass ?? "member", "member");
    assert.ok(adm.status < 500 || adm.json, op); notForbidden(adm);
    notForbidden(await call(env, { op, token: env.ADMIN_TOKEN }));
    const mem = await call(env, { op, token: S.ann });
    assert.equal(mem.status, 403); assert.equal(mem.json.reason, "CLASS_FORBIDDEN");
    const bare = await call(env, { op, token: S.bare });
    assert.equal(bare.status, 403); assert.equal(bare.json.reason, "CLASS_FORBIDDEN");
    const none = await call(env, { op });
    assert.ok(none.status === 401 || none.status === 403, `${op} no credential: ${none.status}`);
    assert.notEqual(none.json?.ok, true);
  });
}

test("protocprobe answers an administrator session with its counts", async () => {
  const { env, S } = world({ sessions: { [ADM]: member("zed", ["contribute"], { administer: true }) } });
  const r = await call(env, { op: "protocprobe", token: ADM });
  assert.equal(r.status, 200); assert.equal(r.json.ok, true); assert.equal(r.json.tokenClass, "member");
});
