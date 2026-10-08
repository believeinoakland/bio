/* Two administrators, each holding recovery codes (R66; K1888, DEC-134 (2), (6)) at the module's interface: the step
   read over the REAL membership (its R84, R86) and credentials (its R46), in credentials' own test world, and through
   the frame control-plane joins this module's routes to. Stand-ins only where a provider must fail to answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, frame } from "./fixture.mjs";
import { world } from "../credentials/fixture.mjs";

/* This module over the real membership and credentials, the step read for `viewer`. */
async function over(w) {
  const s = await boot({ more: { membership: w.m, credentials: w.c } });
  return s.m;
}
const writes = (w) => w.snapshot();

test("R66 the step answers {ok, administrators, codes_held, remaining, met} to each administrator: administrators is membership.activeAdmins' count, codes_held and remaining the viewer's own role's unspent codes (credentials R46), met exactly when there are at least 2 and the viewer holds codes", async () => {
  const w = world();
  await w.claim();
  const m = await over(w);
  /* the founder alone, no codes */
  assert.deepEqual(m.adminRecoveryStep({ viewer: "admin" }), { ok: true, administrators: 1, codes_held: false, remaining: 0, met: false });
  /* the founder alone, holding codes: one administrator is not two */
  w.c.recoveryCodesIssue({ by: "admin" });
  assert.deepEqual(m.adminRecoveryStep({ viewer: "admin" }), { ok: true, administrators: 1, codes_held: true, remaining: 10, met: false });
  /* a second administrator: met for the founder, who holds codes; not for the second, who holds none */
  await w.enrol("second", "admin");
  assert.deepEqual(w.m.activeAdmins(), ["admin", "second"]);
  assert.deepEqual(m.adminRecoveryStep({ viewer: "admin" }), { ok: true, administrators: 2, codes_held: true, remaining: 10, met: true });
  assert.deepEqual(m.adminRecoveryStep({ viewer: "second" }), { ok: true, administrators: 2, codes_held: false, remaining: 0, met: false });
  /* each administrator's own codes: the second issues theirs */
  w.c.recoveryCodesIssue({ by: "second" });
  assert.deepEqual(m.adminRecoveryStep({ viewer: "second" }), { ok: true, administrators: 2, codes_held: true, remaining: 10, met: true });
  /* a spent code counts down; every code spent is codes_held false and met false */
  const codes = w.c.recoveryCodesIssue({ by: "second" }).codes;
  await w.c.recover({ role: "member:second", code: codes[0], password: "new-passphrase-second-1", source: "s" });
  assert.equal(m.adminRecoveryStep({ viewer: "second" }).remaining, 9);
  w.db.prepare(`UPDATE recovery_codes SET spent_at = '2026-10-07T00:00:00Z' WHERE role = 'member:second'`).run();
  assert.deepEqual(m.adminRecoveryStep({ viewer: "second" }), { ok: true, administrators: 2, codes_held: false, remaining: 0, met: false });
});

test("R66 a viewer who is not an administrator, a machine credential included, is refused NOT_AN_ADMIN (membership.notAnAdmin, C-96.1); the step writes nothing and never throws", async () => {
  const w = world();
  await w.group("ann");
  w.c.recoveryCodesIssue({ by: "admin" });
  const m = await over(w);
  const before = writes(w);
  for (const viewer of [null, undefined, "", "  ", "ann", "nobody", "class:admin", "class:ai", "class:daemon", 7, {}]) {
    const r = m.adminRecoveryStep({ viewer });
    assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "NOT_AN_ADMIN", "NOT_AN_ADMIN", "C-96.1"], String(viewer));
    assert.equal("met" in r, false);
  }
  for (const viewer of ["admin", "second"]) assert.equal(m.adminRecoveryStep({ viewer }).ok, true, viewer);
  assert.equal(m.adminRecoveryStep().reason, "NOT_AN_ADMIN");
  assert.equal(writes(w), before, "nothing written by any read or refusal");
});

test("R66 R43 a provider that does not answer is the store's silence (STORE_DID_NOT_ANSWER), never met: false, and the step never throws", async () => {
  const admin = { isAdministrator: (id) => id === "admin", activeAdmins: () => ["admin", "second"] };
  const codes = { recoveryCodesState: () => ({ ok: true, held: true, remaining: 4, issuedAt: "2026-10-07T00:00:00Z" }) };
  const boom = () => { throw new Error("the store did not answer"); };
  const step = async (membership, credentials) => (await boot({ more: { membership, credentials } })).m.adminRecoveryStep({ viewer: "admin" });
  assert.deepEqual(await step(admin, codes), { ok: true, administrators: 2, codes_held: true, remaining: 4, met: true });
  for (const [membership, credentials, why] of [
    [{ ...admin, isAdministrator: boom }, codes, "isAdministrator throws"],
    [{ ...admin, activeAdmins: boom }, codes, "activeAdmins throws"],
    [{ ...admin, activeAdmins: () => null }, codes, "activeAdmins answers no list"],
    [admin, { recoveryCodesState: boom }, "recoveryCodesState throws"],
    [admin, { recoveryCodesState: () => null }, "recoveryCodesState answers nothing"],
    [admin, { recoveryCodesState: () => ({ ok: false }) }, "recoveryCodesState answers no state"],
  ]) {
    const r = await step(membership, credentials);
    assert.deepEqual([r.ok, r.reason], [false, "STORE_DID_NOT_ANSWER"], why);
    assert.equal("met" in r, false, why);
  }
});

test("R66 DEC-134 (6) the step gates nothing: while it is open every other act of this module still answers, and a group runs with one administrator", async () => {
  const w = world();
  await w.claim();
  const m = await over(w);
  assert.equal(m.adminRecoveryStep({ viewer: "admin" }).met, false);
  assert.equal(w.c.aiKeepAwaySet({ on: true, reason: "Kept here.", by: "admin" }).ok, true);
  assert.equal(m.assistantState().on, false);
  assert.equal(m.placeWantedSet({ name: "River Town", by: "admin" }).ok, true);
  assert.equal(m.profilesSet({ profiles: [], by: "admin" }).ok, true);
  assert.equal(m.memberLanguageSet({ language: "es", by: "admin" }).ok, true);
  assert.equal(m.adminRecoveryStep({ viewer: "admin" }).met, false, "still open, and nothing was refused");
});

test("R66 R29 over the routes: op=adminrecoverystep reads the control plane's viewer stamp, never the body", async () => {
  const w = world();
  await w.group();
  w.c.recoveryCodesIssue({ by: "second" });
  const m = await over(w);
  const call = async (path, body) => (await frame(m, new Request(`http://do/${path}`,
    body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) }))).json();
  assert.deepEqual((await call("adminrecoverystep?viewer=second")).result,
    { ok: true, administrators: 2, codes_held: true, remaining: 10, met: true });
  assert.equal((await call("adminrecoverystep", { viewer: "second" })).result.reason, "NOT_AN_ADMIN", "the body names no viewer");
  assert.equal((await call("adminrecoverystep?viewer=class:admin")).result.reason, "NOT_AN_ADMIN");
});
