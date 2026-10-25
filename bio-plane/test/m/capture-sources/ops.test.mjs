/* capture-sources R66 (T51; C20): the three credential ops served as `captureSourcesOps`, called as the door calls them: the
   stamps (`viewer`, `by`) in the address, the fields in the body (a read's in the address), over the real record-core, membership
   and credentials below the module (world.mjs). Each test names R66 in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { captureSourcesOps, DECLARED_OPS } from "../../../src/capture-sources/ops.mjs";
import { CAPTURE_CREDENTIAL_CHECKS, CREDENTIALS_TABLE } from "../../../src/capture-sources/credentials.mjs";
import { world, SECRET, HOST } from "./world.mjs";

const ENTRY_KEYS = ["credential", "host", "kind", "project", "scope", "supplied_at", "supplied_by", "withdrawn_at", "withdrawn_by"];
const OWN = ["plane.grp.example", ".acct.workers.dev"];

/* the call as the door makes it: stamps and a read's fields in the address, a write's fields in the body */
const door = (w) => (op, { stamps = {}, query = {}, body = undefined } = {}) => {
  const url = new URL("http://x/?" + new URLSearchParams({ op, ...stamps, ...query }));
  return captureSourcesOps(w.c, url, body)[op]();
};
const asAnn = { viewer: "member:ann", by: "ann" };
const supplyBody = (o = {}) => ({ kind: "login", host: HOST, secret: SECRET, scope: "member", ...o });

/* every form a secret could leak in: itself, its UTF-8 bytes as base64 and hex, its SHA-256 */
const forms = (s) => [s, Buffer.from(s).toString("base64"), Buffer.from(s).toString("hex"), createHash("sha256").update(s).digest("hex"),
  createHash("sha256").update(s).digest("base64")];
const leaks = (value, s = SECRET) => { const text = JSON.stringify(value); return forms(s).filter((f) => text.includes(f)); };

test("R66 the ops map serves exactly the three credential ops, the ones DECLARED_OPS declares", async () => {
  const w = await world();
  const arms = captureSourcesOps(w.c, new URL("http://x/?op=capturecredentiallist"), {});
  assert.deepEqual(Object.keys(arms).sort(), ["capturecredentiallist", "capturecredentialsupply", "capturecredentialwithdraw"]);
  assert.deepEqual(Object.keys(DECLARED_OPS).sort(), Object.keys(arms).sort());
});

test("R66 capturecredentialsupply stores the credential for the stamped supplier, encrypted, and answers its entry without the secret", async () => {
  const w = await world();
  const a = await door(w)("capturecredentialsupply", { stamps: asAnn, body: supplyBody() });
  assert.equal(a.ok, true);
  assert.deepEqual(Object.keys(a.credential).sort(), ENTRY_KEYS);
  assert.equal(a.credential.supplied_by, "ann");
  assert.equal(a.credential.host, HOST);
  assert.deepEqual(leaks(a), []);
  const rows = w.raw();
  assert.equal(rows.length, 1);
  assert.deepEqual(leaks(rows), [], "the table holds no plaintext of the secret (R59)");
  assert.equal(typeof rows[0].ciphertext, "string");
  /* control: the same call with no stamp stores nothing (a body is never the supplier) */
  const none = await door(w)("capturecredentialsupply", { stamps: { viewer: "member:ann" }, body: supplyBody() });
  assert.equal(none.code, "CAPTURE_CREDENTIAL_NOT_A_MEMBER");
  assert.equal(w.raw().length, 1);
});

test("R66 the supplier is the stamp `by`: a `by` in the body is not read", async () => {
  const w = await world();
  const a = await door(w)("capturecredentialsupply", { stamps: asAnn, body: supplyBody({ by: "bob", supplied_by: "bob" }) });
  assert.equal(a.ok, true);
  assert.equal(a.credential.supplied_by, "ann");
  assert.deepEqual(w.raw().map((r) => r.supplied_by), ["ann"]);
});

test("R66 capturecredentialsupply refuses a machine author and stores nothing", async () => {
  const w = await world();
  for (const by of ["class:admin", "class:probe", "class:daemon", "", null]) {
    const stamps = by === null ? { viewer: "admin" } : { viewer: "admin", by };
    const a = await door(w)("capturecredentialsupply", { stamps, body: supplyBody() });
    assert.equal(a.ok, false, `by ${JSON.stringify(by)}`);
    assert.equal(a.code, "CAPTURE_CREDENTIAL_NOT_A_MEMBER");
    assert.deepEqual(leaks(a), []);
  }
  assert.equal(w.raw().length, 0);
  /* control: a member supplies */
  assert.equal((await door(w)("capturecredentialsupply", { stamps: asAnn, body: supplyBody() })).ok, true);
});

test("R66 a secret put in the wrong field is echoed in no refusal, whichever op and field", async () => {
  const w = await world();
  const d = door(w);
  const wrong = [
    ["capturecredentialsupply", asAnn, supplyBody({ secret: "", kind: SECRET })],
    ["capturecredentialsupply", asAnn, supplyBody({ secret: "", host: SECRET })],
    ["capturecredentialsupply", asAnn, supplyBody({ secret: "", scope: SECRET })],
    ["capturecredentialsupply", asAnn, supplyBody({ secret: "", scope: "project", project: SECRET })],
    ["capturecredentialsupply", asAnn, supplyBody({ secret: SECRET, project: SECRET })],
    ["capturecredentialsupply", asAnn, supplyBody({ secret: undefined, by: SECRET, kind: SECRET, host: SECRET })],
    ["capturecredentialsupply", { viewer: "admin", by: SECRET }, supplyBody()],
    ["capturecredentialwithdraw", asAnn, { credential: SECRET }],
  ];
  for (const [op, stamps, body] of wrong) {
    const a = await d(op, { stamps, body });
    assert.equal(a.ok, false, `${op} ${JSON.stringify(Object.keys(body))}`);
    assert.deepEqual(leaks(a), [], `${op} echoed the secret`);
  }
  const l = await d("capturecredentiallist", { stamps: { viewer: "member:ann" }, query: { scope: SECRET, project: SECRET, limit: SECRET } });
  assert.deepEqual(leaks(l), []);
  assert.equal(w.raw().length, 0);
});

test("R66 the secret is read from the body alone: one put in the address is never used", async () => {
  const w = await world();
  const a = await door(w)("capturecredentialsupply", { stamps: asAnn, query: { secret: SECRET }, body: supplyBody({ secret: undefined }) });
  assert.equal(a.code, "CAPTURE_CREDENTIAL_NO_SECRET");
  assert.deepEqual(leaks(a), []);
  assert.equal(w.raw().length, 0);
});

test("R66 capturecredentiallist answers the viewer's entries and no secret, part of it, its length or a digest", async () => {
  const w = await world();
  const d = door(w);
  await d("capturecredentialsupply", { stamps: asAnn, body: supplyBody() });
  await d("capturecredentialsupply", { stamps: asAnn, body: supplyBody({ scope: "group", host: "other.example.gov" }) });
  await d("capturecredentialsupply", { stamps: { viewer: "member:dee", by: "dee" }, body: supplyBody({ secret: "dee-own-secret-9" }) });
  const l = await d("capturecredentiallist", { stamps: { viewer: "member:ann" } });
  assert.equal(l.entries.length, 2, "ann sees her own and the group's, not dee's member credential");
  for (const e of l.entries) assert.deepEqual(Object.keys(e).sort(), ENTRY_KEYS);
  assert.deepEqual(leaks(l), []);
  assert.deepEqual(leaks(l, "dee-own-secret-9"), []);
  for (const e of l.entries) assert.ok(Object.values(e).every((v) => v !== SECRET.length), "no length is published");
  /* the query's scope and limit are R58's */
  const g = await d("capturecredentiallist", { stamps: { viewer: "member:ann" }, query: { scope: "group" } });
  assert.deepEqual(g.entries.map((e) => e.scope), ["group"]);
  const one = await d("capturecredentiallist", { stamps: { viewer: "member:ann" }, query: { limit: "1" } });
  assert.equal(one.entries.length, 1);
  assert.equal(one.truncated, true);
  /* control: no viewer sees none */
  assert.deepEqual((await d("capturecredentiallist", { stamps: {} })).entries, []);
});

test("R66 capturecredentialwithdraw destroys the ciphertext, answers no secret, and withdrawing twice writes nothing", async () => {
  const w = await world();
  const d = door(w);
  const made = await d("capturecredentialsupply", { stamps: asAnn, body: supplyBody() });
  const id = made.credential.credential;
  assert.equal(typeof w.raw()[0].ciphertext, "string");
  const out = await d("capturecredentialwithdraw", { stamps: asAnn, body: { credential: id } });
  assert.equal(out.ok, true);
  assert.equal(out.already, false);
  assert.equal(out.withdrawn.withdrawn_by, "ann");
  assert.deepEqual(leaks(out), []);
  const row = w.raw()[0];
  assert.equal(row.ciphertext, null);
  assert.equal(row.iv, null);
  const again = await d("capturecredentialwithdraw", { stamps: asAnn, body: { credential: id } });
  assert.equal(again.ok, true);
  assert.equal(again.already, true);
  /* the secretless entry stays in the listing, withdrawn */
  const l = await d("capturecredentiallist", { stamps: { viewer: "member:ann" } });
  assert.equal(l.entries[0].withdrawn_by, "ann");
  /* controls: another member cannot see it, a machine author cannot withdraw */
  const made2 = await d("capturecredentialsupply", { stamps: asAnn, body: supplyBody({ host: "two.example.gov" }) });
  const other = await d("capturecredentialwithdraw", { stamps: { viewer: "member:dee", by: "dee" }, body: { credential: made2.credential.credential } });
  assert.equal(other.code, "CAPTURE_CREDENTIAL_NO_SUCH");
  const machine = await d("capturecredentialwithdraw", { stamps: { viewer: "admin", by: "class:admin" }, body: { credential: made2.credential.credential } });
  assert.equal(machine.ok, false);
  assert.equal(typeof w.raw().find((r) => r.credential_id === made2.credential.credential).ciphertext, "string");
});

test("R66 the own host is refused CAPTURE_CREDENTIAL_OWN_HOST through the op, and nothing is stored", async () => {
  const w = await world({ ownHosts: OWN });
  const a = await door(w)("capturecredentialsupply", { stamps: asAnn, body: supplyBody({ host: "plane.grp.example" }) });
  assert.equal(a.code, "CAPTURE_CREDENTIAL_OWN_HOST");
  assert.equal(a.check, CAPTURE_CREDENTIAL_CHECKS.CAPTURE_CREDENTIAL_OWN_HOST.check);
  const b = await door(w)("capturecredentialsupply", { stamps: asAnn, body: supplyBody({ host: "member.acct.workers.dev" }) });
  assert.equal(b.code, "CAPTURE_CREDENTIAL_OWN_HOST");
  assert.equal(w.raw().length, 0);
  /* control: a foreign host is stored */
  assert.equal((await door(w)("capturecredentialsupply", { stamps: asAnn, body: supplyBody() })).ok, true);
});

test("R66 the request log line and every answer carry no secret: nothing is logged and the address holds none", async () => {
  const w = await world();
  const logged = [];
  const saved = {};
  for (const k of ["log", "info", "warn", "error", "debug"]) { saved[k] = console[k]; console[k] = (...a) => logged.push(a); }
  const urls = [];
  const answers = [];
  try {
    const d = (op, o) => { const url = new URL("http://x/?" + new URLSearchParams({ op, ...(o.stamps || {}), ...(o.query || {}) })); urls.push(url.href);
      return captureSourcesOps(w.c, url, o.body)[op](); };
    const made = await d("capturecredentialsupply", { stamps: asAnn, body: supplyBody() });
    answers.push(made, await d("capturecredentiallist", { stamps: { viewer: "member:ann" } }),
      await d("capturecredentialsupply", { stamps: asAnn, body: supplyBody({ scope: "nowhere" }) }),
      await d("capturecredentialwithdraw", { stamps: asAnn, body: { credential: made.credential.credential } }));
  } finally { for (const k of Object.keys(saved)) console[k] = saved[k]; }
  assert.deepEqual(leaks(logged), []);
  assert.deepEqual(leaks(urls), []);
  assert.deepEqual(leaks(answers), []);
  assert.equal(logged.length, 0);
  assert.deepEqual(leaks(w.raw()), []);
});

test("R72 the stamps read as the door writes them: member:<id> (with a carried project) resolves the member, a bare id and the founder's own form still do, a machine form never", async () => {
  const w = await world();
  const d = door(w);
  const a = await d("capturecredentialsupply", { stamps: { viewer: "member:ann@P1", by: "member:ann@P1" }, body: supplyBody() });
  assert.equal(a.ok, true, JSON.stringify(a));
  assert.equal(a.credential.supplied_by, "ann", "stored as the member id, as R56 reads it");
  const seen = (viewer) => d("capturecredentiallist", { stamps: { viewer } }).entries.map((e) => e.credential);
  for (const viewer of ["member:ann", "member:ann@P1"]) assert.deepEqual(seen(viewer), [a.credential.credential], viewer);
  for (const viewer of ["ann", "member:bob", "class:admin", "class:ai/tok", "member:nobody", ""])
    assert.deepEqual(seen(viewer), [], `${JSON.stringify(viewer)} sees none`);
  /* the founder's own form supplies a group credential and any member form withdraws only what R63 lets it */
  const g = await d("capturecredentialsupply", { stamps: { viewer: "admin", by: "admin" }, body: supplyBody({ scope: "group", host: "g.example.gov" }) });
  assert.equal(g.ok, true, JSON.stringify(g));
  const denied = await d("capturecredentialwithdraw", { stamps: { viewer: "member:bob", by: "member:bob" }, body: { credential: g.credential.credential } });
  assert.equal(denied.code, "CAPTURE_CREDENTIAL_NOT_PERMITTED");
  const own = await d("capturecredentialwithdraw", { stamps: { viewer: "member:ann", by: "member:ann" }, body: { credential: a.credential.credential } });
  assert.equal(own.ok, true, JSON.stringify(own));
  assert.equal(own.withdrawn.withdrawn_by, "ann");
  /* a stamp that resolves to no active member, a machine credential's included, is refused as before */
  for (const by of ["member:nobody", "class:ai/tok", "member:ann/tok"]) {
    const r = await d("capturecredentialsupply", { stamps: { viewer: "admin", by }, body: supplyBody() });
    assert.equal(r.code, "CAPTURE_CREDENTIAL_NOT_A_MEMBER", by);
  }
});
