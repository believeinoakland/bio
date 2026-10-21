/* control-plane R2, R17, R29, R26 (fix round 2; contradiction R61, K4323; affordances' catalogue test 'R1 R12 R24: N345's ops'): the door
   routes `contradictionflag`, the member's act of setting two documents' passages side by side as a contradiction. Its owner declares it
   (`contradiction`'s `DECLARED_OPS`, registered before the first read as the plane registers them, R80) with `needs: contribute`,
   `author` and `viewer` stamped and members only (`machineClasses: []`), so the door's tables gate it as `contradictionresolve` is
   gated: the act is answered by its owner through the store's route of its own name, and what the gate refuses is refused before the owner. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, hex64, member, FORGED } from "./harness.mjs";
import { ok, callers, routesForSessions } from "./door-routes.mjs";

const { OPS, OP_STAMPS, NEEDS } = O;
const FLAG = { here: { capture: "a".repeat(64), extent: "p1" }, other: { capture: "b".repeat(64), extent: "p2" }, reason: "r1" };

test("R2, R26 (contradiction R61): `contradictionflag` is an op with a spec, a member's act that needs `contribute`, stamped `author` and `viewer`, and no machine credential reaches it", () => {
  assert.ok(Object.hasOwn(OPS, "contradictionflag"), "the registration took the owner's row");
  assert.equal(OPS.contradictionflag.mutating, true);
  assert.deepEqual(OPS.contradictionflag.machineClasses, []);
  assert.equal(NEEDS.contradictionflag, "contribute");
  assert.deepEqual([...OP_STAMPS.contradictionflag].sort(), ["author", "viewer"]);
  /* control: the row the door gates the same way, `contradictionresolve`, needs the same capability */
  assert.equal(NEEDS.contradictionresolve, "contribute");
});

test("R17, R29 (contradiction R61): `contradictionflag` reaches the store's route of its own name from each session with `author` its positional identity and `viewer` its sight, a caller's own deleted; every machine credential is refused before any store request; the owner's refusal is answered as given", async () => {
  await routesForSessions(["contradictionflag"], () => FLAG, { refuseMachines: () => true });
  const { w, sessions } = callers({ answer: (c) => (c.route === "contradictionflag" ? ok({ ok: true, wrote: true, key: "FLAG" }) : null) });
  for (const s of sessions) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op: "contradictionflag", token: s.token, method: "POST", params: { author: FORGED, viewer: FORGED }, body: { ...FLAG, author: FORGED, actorIdentity: FORGED } });
    assert.equal(r.status, 200, r.text.slice(0, 200));
    const [inner] = opCalls(w.env).filter((c) => c.route === "contradictionflag");
    assert.equal(inner.params.author, s.name === "founder" ? "member:admin" : "member:ann", `${s.name}: the positional identity`);
    assert.equal(inner.params.viewer, s.viewer, `${s.name}: the sight`);
    assert.equal(inner.body.reason, FLAG.reason, "the act's own fields pass");
  }
});

test("R17 control (contradiction R61): a member who holds no `contribute` is refused before the owner, and so is a stranger; nothing reaches the store's route", async () => {
  const bare = hex64();
  const w = world({ sessions: { [bare]: member("bea", []) }, answer: (c) => (c.route === "contradictionflag" ? ok({ ok: true }) : null) });
  const refused = await call(w.env, { op: "contradictionflag", token: bare, method: "POST", body: FLAG });
  assert.equal(refused.status, 403, refused.text.slice(0, 200));
  assert.equal(refused.json.ok, false);
  assert.equal(refused.json.needs, "contribute");
  const stranger = await call(w.env, { op: "contradictionflag", method: "POST", body: FLAG });
  assert.ok([401, 403].includes(stranger.status), `status ${stranger.status}`);
  assert.deepEqual(opCalls(w.env).filter((c) => c.route === "contradictionflag"), []);
  /* control: the member who holds it is answered */
  const held = await call(w.env, { op: "contradictionflag", token: w.S.ann, method: "POST", body: FLAG });
  assert.equal(held.status, 200);
});
