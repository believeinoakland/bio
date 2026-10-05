/* The ask grant (R27, R28; Q1-3, K1450, K1505 (14)), at the interface: minted at the member's own act under their own
   live session, short-lived and read-only, writing no run row, no observation row and no read log; admitting only the
   ops on its class's list, only as reads; ending with its time, its session and the member's revocation. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD } from "./fixture.mjs";
import { ACCOUNT_CHECKS, AI_GRANT_OPS, AI_GRANT_TTL_SECONDS } from "../../../src/credentials/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const refusal = (code) => ({ ok: false, reason: code, code, check: ACCOUNT_CHECKS[code].check, translation: ACCOUNT_CHECKS[code].translation });

async function grantWorld() {
  const w = await world().group("ann", "bob", "dee");
  for (const id of ["ann", "bob", "dee"])
    assert.equal((await w.c.accountReferenceSet({ member: id, kind: "apikey", secret: `sk-${id}`, by: id })).ok, true);
  w.session = {};
  for (const id of ["ann", "bob", "dee"]) w.session[id] = (await w.c.login({ role: `member:${id}`, password: PASSWORD(id) })).token;
  w.session.second = (await w.c.login({ role: "member:second", password: PASSWORD("second") })).token;
  return w;
}

test("R27 aiGrantMint: refusals as R22 and NO_ACCOUNT, each minting nothing; minted once at the member's act, `{token, expires}`, expiring AI_GRANT_TTL_SECONDS on; no run row, no observation row, no read log", async () => {
  const w = await grantWorld();
  w.c.accountReferenceRemove({ member: "bob", by: "bob" });
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const before = w.snapshot();
  for (const [member, by, session, code] of [
    ["ann", null, w.session.ann, "MACHINE_CANNOT_HOLD_ACCOUNT"], ["ann", "class:ai", w.session.ann, "MACHINE_CANNOT_HOLD_ACCOUNT"],
    ["ann", "bob", w.session.ann, "NOT_YOUR_ACCOUNT"], ["ann", "second", w.session.second, "NOT_YOUR_ACCOUNT"],
    ["ann", "admin", w.session.ann, "NOT_YOUR_ACCOUNT"],
    ["ann", "ann", w.session.bob, "NOT_YOUR_ACCOUNT"],          // another member's session
    ["ann", "ann", null, "NOT_YOUR_ACCOUNT"], ["ann", "ann", "no-such-session", "NOT_YOUR_ACCOUNT"],
    ["dee", "dee", w.session.dee, "ACCOUNT_MEMBER_NOT_ACTIVE"], ["bob", "bob", w.session.bob, "NO_ACCOUNT"]])
    assert.deepEqual(shape(await w.c.aiGrantMint({ member, by, session })), refusal(code), `${member} ${by}`);
  assert.equal(w.snapshot(), before, "no refusal mints");
  assert.equal(AI_GRANT_TTL_SECONDS, 900);
  const t0 = Date.now();
  const g = await w.c.aiGrantMint({ member: "ann", by: "member:ann", session: w.session.ann });
  const t1 = Date.now();
  assert.deepEqual(Object.keys(g).sort(), ["expires", "ok", "token"]);
  assert.match(g.token, /^[0-9a-f]{64}$/);
  assert.ok(g.expires >= t0 + AI_GRANT_TTL_SECONDS * 1000 && g.expires <= t1 + AI_GRANT_TTL_SECONDS * 1000);
  /* the token answered once: only its digest is kept */
  assert.ok(!w.snapshot().includes(g.token));
  /* it writes only its own grant row: no run row, no observation row, no read log */
  const after = JSON.parse(w.snapshot());
  const was = Object.fromEntries(JSON.parse(before));
  const changed = after.filter(([name, rows]) => JSON.stringify(rows) !== JSON.stringify(was[name] ?? [])).map(([n]) => n);
  assert.deepEqual(changed, ["ai_grants"]);
  assert.equal((await w.c.aiGrantAdmit({ token: g.token, op: "search" })).viewer, "member:ann", "its viewer is the member");
  assert.deepEqual(JSON.parse(w.snapshot()), after, "admitting reads keeps no read log");
  /* a grant never outlives the session it was minted under */
  w.sql.exec(`UPDATE sessions SET expires=? WHERE token=?`, Date.now() + 5000, w.session.ann);
  const short = await w.c.aiGrantMint({ member: "ann", by: "ann", session: w.session.ann });
  assert.ok(short.expires <= Date.now() + 5000);
});

test("R27 a grant ends at its time, with its session, and with the member's revocation (R16)", async () => {
  const w = await grantWorld();
  const mint = async (id) => (await w.c.aiGrantMint({ member: id, by: id, session: w.session[id] })).token;
  const [a, b, d] = [await mint("ann"), await mint("bob"), await mint("dee")];
  for (const t of [a, b, d]) assert.equal((await w.c.aiGrantAdmit({ token: t, op: "search" })).ok, true);
  w.sql.exec(`UPDATE ai_grants SET expires=? WHERE member_id='ann'`, Date.now() - 1);
  assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: a, op: "search" })), refusal("GRANT_NOT_HELD"), "expired");
  w.sql.exec(`DELETE FROM sessions WHERE token=?`, w.session.bob);                 // signed out
  assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: b, op: "search" })), refusal("GRANT_NOT_HELD"), "its session ended");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: d, op: "search" })), refusal("GRANT_NOT_HELD"), "revoked");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM ai_grants WHERE member_id='dee'`).n, 0);
  for (const t of [null, "", "nope", 7]) assert.deepEqual(shape(await w.c.aiGrantAdmit({ token: t, op: "search" })), refusal("GRANT_NOT_HELD"));
});

test("R28 AI_GRANT_OPS is frozen and sorted; a request under a grant is admitted only for an op on it and only as a read; anything else GRANT_OP_REFUSED naming the op", async () => {
  const w = await grantWorld();
  const g = (await w.c.aiGrantMint({ member: "ann", by: "ann", session: w.session.ann })).token;
  assert.ok(Object.isFrozen(AI_GRANT_OPS));
  assert.deepEqual([...AI_GRANT_OPS], [...AI_GRANT_OPS].sort());
  assert.equal(new Set(AI_GRANT_OPS).size, AI_GRANT_OPS.length);
  const before = w.snapshot();
  for (const op of AI_GRANT_OPS) {
    const r = await w.c.aiGrantAdmit({ token: g, op });
    assert.deepEqual({ ...r, expires: null }, { ok: true, member: "ann", viewer: "member:ann", expires: null }, op);
    const asWrite = await w.c.aiGrantAdmit({ token: g, op, write: true });
    assert.deepEqual([shape(asWrite), asWrite.op], [refusal("GRANT_OP_REFUSED"), op], `${op} as a write`);
  }
  for (const op of ["promote", "capture", "export", "memberlist", "sourcereadlog", "airunopen", "accountreference", "login", "",
                    null, "Search"]) {
    const r = await w.c.aiGrantAdmit({ token: g, op });
    assert.deepEqual([shape(r), r.op], [refusal("GRANT_OP_REFUSED"), typeof op === "string" ? op : null], String(op));
  }
  assert.equal(w.snapshot(), before, "admission writes nothing");
  /* the list holds no sources op, no member history, no administrative and no export op (answers R1) */
  assert.deepEqual(AI_GRANT_OPS.filter((op) => /^source|^member|^admin|export|purge|audit|aicredential/.test(op)), []);
});
