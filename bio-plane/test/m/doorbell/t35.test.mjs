/* doorbell, T35 (T35-22) at the module's interface, moved from capture's `t35.test.mjs` (the map's §6) and re-labelled
   with this module's ids and lines: the DEC-149 rows of the doorbell (plan rule 4: field and identifier names stay;
   "the plane" and "the instance" go; member-facing text says "your group's Civicsmith" or names the thing; the
   doorbell's P rows say "this group's", a knocker holding no credential, K1821 (2)), each string named by a test; and
   R20, the doorbell's refused hand-overs counted in `credentials`' security tally (its R44, real, over the fixture's
   store). The rows C-85.3 and C-85.4 are capture's, re-exported (R21, K2609), so their lines are capture's. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket } from "./fixture.mjs";
import { doorbellOps } from "../../../src/doorbell/index.mjs";
import { knockOp, KNOCK } from "../../../src/doorbell/door.mjs";
import { KNOCK_CHECKS } from "../../../src/doorbell/checks.mjs";


const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const requiredArgument = (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);
const doAnswer = async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
  return out && out.ok === true ? { answered: true, result: out.result } : { answered: false, result: undefined }; };
const helpers = { json, requiredArgument, storeSilent, doAnswer };
/* A Durable Object stub answering through the module's own routes, as control-plane's `dispatch` does; every call kept. */
function stubOf(c) {
  const calls = [];
  return { calls, async fetch(req) {
    const url = new URL(req.url); calls.push(url.pathname + url.search);
    const body = req.method === "POST" ? JSON.parse(await req.text() || "null") : null;
    return json({ ok: true, result: await doorbellOps(c, url, body)[url.pathname.slice(1)]() });
  } };
}
const knock = (payload, { method = "POST", raw = null } = {}) =>
  new Request("https://plane/?op=knock", { method, headers: { "cf-connecting-ip": "203.0.113.9" },
    ...(method === "POST" ? { body: raw ?? JSON.stringify(payload) } : {}) });
function setup({ evidence = true } = {}) {
  const f = fresh({ evidence: evidence ? bucket() : null, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  const st = stubOf(f.c);
  return { ...f, st, send: async (req, extra = {}) => {
    const r = await knockOp(req, f.c.env, st, { ...helpers, ...extra }); return { status: r.status, body: await r.json() }; } };
}
/* credentials R44's counts, as the security map reads them: kind, country (stored "" for none) and count. */
const counts = (rows) => rows(`SELECT kind, country, sum(count) AS n FROM security_counts GROUP BY kind, country ORDER BY kind, country`)
  .map((r) => ({ kind: r.kind, country: r.country, n: Number(r.n) }));
const handovers = (rows) => counts(rows).filter((r) => r.kind === "handover").reduce((n, r) => n + r.n, 0);
const OLD = /this instance|the instance\b|the plane\b/;

/* ---- DEC-149 rows (plan rule 4; `build/plan/draft-T35-dec149-l1-l7.md` rows 178–188) ---- */

test("R6 R9 DEC-149 P (C-85.3, capture checks.mjs:138): the envelope refusal's translation says \"The size this inbox will read is published beside this message.\"", async () => {
  const { send } = setup();
  const r = await send(knock(null, { raw: "x".repeat(KNOCK.maxBytes + 4097) }));
  assert.equal(r.status, 413);
  assert.equal(r.body.check, "C-85.3");
  assert.ok(r.body.translation.includes("The size this inbox will read is published beside this message."));
  assert.equal(r.body.translation, KNOCK_CHECKS.KNOCK_ENVELOPE_TOO_LARGE.translation);
  assert.doesNotMatch(r.body.translation, OLD);
});

test("R7 R9 DEC-149 P (C-85.4, capture checks.mjs:147; door.mjs:52): the payload refusal says \"larger than this inbox stores. That is a fact about how this group has set its Civicsmith up\", and its detail \"this group's inbox stores knocks inline; large material needs its evidence storage configured\"", async () => {
  const { send } = setup({ evidence: false });
  const r = await send(knock({ contentText: "x".repeat(KNOCK.maxInline + 1) }));
  assert.equal(r.status, 413);
  assert.equal(r.body.check, "C-85.4");
  assert.ok(r.body.translation.includes("larger than this inbox stores. That is a fact about how this group has set its Civicsmith up"));
  assert.equal(r.body.detail, "this group's inbox stores knocks inline; large material needs its evidence storage configured");
  assert.doesNotMatch(r.body.translation + r.body.detail, OLD);
});

test("R5 DEC-149 P (door.mjs:25; R5's stated): RATE_GLOBAL's published bound is \"at most 10 knocks to this group's inbox in any 10 minutes, estimated by a sliding window\"", async () => {
  const { c } = setup();
  const now = Date.parse("2026-10-07T12:00:00Z");
  for (let i = 0; i < KNOCK.global; i++) assert.equal((await c.knock({ content: `k${i}`, sourceAddress: `198.51.100.${i}`, now })).ok, true);
  const r = await c.knockAttempt({ sourceAddress: "198.51.100.200", now });
  assert.deepEqual([r.reason, r.stated], ["RATE_GLOBAL", "at most 10 knocks to this group's inbox in any 10 minutes, estimated by a sliding window"]);
  assert.equal(KNOCK.statedGlobal, r.stated);
});

test("R14 DEC-149 M (index.mjs:264): knockerDigestOf with no knocker key says \"no knock carrying a secret has been received by your group's Civicsmith, so no secret is recognised\"", async () => {
  const { c } = setup();
  const r = await c.knockerDigestOf("a secret long enough to be one");
  assert.deepEqual(r, { knocker_digest: null, pseudonym: null,
                        basis: "no knock carrying a secret has been received by your group's Civicsmith, so no secret is recognised" });
});

test("R13 DEC-149 P (index.mjs:602): a pull with no evidence storage says \"this group's Civicsmith has no evidence storage configured, so the knock's bytes cannot be held under their own digest; nothing was written\"", async () => {
  const f = fresh({ env: { INSTANCE_NAME: "inst" } });
  const k = await f.c.knock({ content: "inline tip", sourceAddress: "203.0.113.5" });
  const r = await f.c.pullKnock({ knockId: k.knockId, by: "member:m1" });
  assert.equal(r.reason, "EVIDENCE_STORAGE_NOT_CONFIGURED");
  assert.equal(r.detail, "this group's Civicsmith has no evidence storage configured, so the knock's bytes cannot be held under their own digest; nothing was written");
});

test("R13 DEC-149 M (index.mjs:695): a pulled knock's first hop asserts \"these bytes were received at the doorbell of your group's Civicsmith as knock <id>\"", async () => {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  const k = await f.c.knock({ content: "a tip", sourceAddress: "203.0.113.5" });
  const r = await f.c.pullKnock({ knockId: k.knockId, by: "member:m1", at: "2026-10-07T12:00:00Z" });
  assert.equal(r.ok, true);
  const asserts = r.document.provenance_chain[0].asserts;
  assert.ok(asserts.startsWith(`these bytes were received at the doorbell of your group's Civicsmith as knock ${k.knockId} at `), asserts);
  assert.doesNotMatch(asserts, OLD);
});


/* ---- R20: the doorbell's refused hand-overs in the security tally (N703; K1875, DEC-165, DEC-166) ---- */

test("R20 R10: every knock R10 refuses is counted once as a handover in credentials' security tally, beside R19's tally, with the control plane's country; an accepted knock, and a method other than POST, are never counted", async () => {
  const { send, rows, st } = setup({ evidence: false });
  const cases = [
    [knock(null, { raw: "x".repeat(KNOCK.maxBytes + 4097) }), 413, "KNOCK_ENVELOPE_TOO_LARGE"],
    [knock(null, { raw: "not json" }), 400, "REQUIRED_ARGUMENT_MISSING"],
    [knock({ contentB64: "%%%" }), 400, "REQUIRED_ARGUMENT_MISSING"],
    [knock({ contentText: "" }), 400, "KNOCK_EMPTY"],
    [knock({ contentText: "x".repeat(KNOCK.maxInline + 1) }), 413, "KNOCK_PAYLOAD_TOO_LARGE"],
    [knock({ contentText: "fine", knockerSecret: "short" }), 400, "KNOCKER_SECRET_WEAK"],
  ];
  let n = 0;
  for (const [req, status, reason] of cases) {
    const r = await send(req, { country: "NZ" });
    assert.deepEqual([r.status, r.body.reason], [status, reason]);
    assert.equal(handovers(rows), ++n, `${reason}: counted once`);
  }
  assert.deepEqual(counts(rows), [{ kind: "handover", country: "NZ", n: 6 }], "kind handover, the stamped country, nothing else");
  assert.equal(rows(`SELECT coalesce(sum(refused),0) n FROM doorbell_tally`)[0].n, 6, "R19's tally counts the same refusals");
  assert.ok(st.calls.every((p) => p === "/doorbellrefused?country=NZ"), "the country rides as a stamp in the query, never a body field");
  /* not POST: not a knock, not counted anywhere */
  assert.equal((await send(knock(null, { method: "GET" }), { country: "NZ" })).status, 405);
  /* accepted: not counted */
  assert.equal((await send(knock({ contentText: "a real tip" }), { country: "NZ" })).status, 200);
  assert.equal(handovers(rows), 6);
  /* no country stamped: counted without a place */
  assert.equal((await send(knock({ contentText: "" }))).status, 400);
  assert.deepEqual(counts(rows), [{ kind: "handover", country: "", n: 1 }, { kind: "handover", country: "NZ", n: 6 }]);
});

test("R20 R4 R5 R17: the rate refusals are handovers too, at knock and at knockAttempt, each once, with the country stamped beside the source; the country comes from the stamp, never the body", async () => {
  const { c, rows } = setup();
  const now = Date.parse("2026-10-07T12:00:00Z");
  for (let i = 0; i < KNOCK.perIp; i++) assert.equal((await c.knock({ content: `p${i}`, sourceAddress: "198.51.100.1", now, country: "FR" })).ok, true);
  assert.equal(handovers(rows), 0, "accepted knocks are never counted");
  assert.equal((await c.knock({ content: "over", sourceAddress: "198.51.100.1", now, country: "FR" })).reason, "RATE_IP");
  assert.equal((await c.knockAttempt({ sourceAddress: "198.51.100.1", now, country: "DE" })).reason, "RATE_IP");
  assert.deepEqual(counts(rows), [{ kind: "handover", country: "DE", n: 1 }, { kind: "handover", country: "FR", n: 1 }]);
  /* through the route: the query's stamp, never the body's `country` */
  const route = (name, qs, body) => doorbellOps(c, new URL(`http://do/${name}?${qs}`), body)[name]();
  assert.equal((await route("knock", "source=198.51.100.1&country=JP", { content: "again", now, country: "XX" })).reason, "RATE_IP");
  assert.equal((await route("knock", "source=198.51.100.1", { content: "again", now, country: "XX" })).reason, "RATE_IP");
  route("doorbellrefused", "country=JP", { now, country: "XX" });
  const c2 = counts(rows);
  assert.ok(!c2.some((r) => r.country === "XX"), "a body's country never reaches the count");
  assert.deepEqual(c2.find((r) => r.country === "JP"), { kind: "handover", country: "JP", n: 2 });
  assert.deepEqual(c2.find((r) => r.country === ""), { kind: "handover", country: "", n: 1 });
});

test("R20: nothing of the knock reaches the count (no address, fingerprint, digest, pseudonym, note, contact, time within the hour or content), and a count that cannot be written is dropped without changing the refusal, R10's order or R80's tally", async () => {
  const { c, rows } = setup();
  const r = await c.knock({ content: "x", note: "my note", contact: "me@example.org", knockerSecret: "short", sourceAddress: "198.51.100.7", country: "CA" });
  assert.equal(r.reason, "KNOCKER_SECRET_WEAK");
  const held = JSON.stringify(rows(`SELECT * FROM security_counts`)) + JSON.stringify(rows(`SELECT * FROM security_pending`));
  for (const s of ["198.51.100.7", "my note", "me@example.org", "short", await c.sourceFingerprint("198.51.100.7")])
    assert.ok(!held.includes(s), s);
  assert.deepEqual(Object.keys(rows(`SELECT * FROM security_counts`)[0]).sort(), ["count", "country", "hour", "kind"]);
  /* the security tally cannot be written: the refusal answers the same, R19 still counts */
  const broken = setup();
  broken.s.db.exec(`DROP TABLE security_counts`);
  const before = await c.knock({ content: "", knockerSecret: "short", sourceAddress: "198.51.100.8", country: "CA" });
  const after = await broken.c.knock({ content: "", knockerSecret: "short", sourceAddress: "198.51.100.8", country: "CA" });
  assert.deepEqual(after, before, "the same answer");
  assert.equal(broken.rows(`SELECT coalesce(sum(refused),0) n FROM doorbell_tally`)[0].n, 1, "R19's tally unchanged by the dropped count");
  /* a credentials whose securityCount throws: likewise */
  broken.c.credentials = { securityCount() { throw new Error("down"); } };
  assert.equal((await broken.c.knockAttempt({ sourceAddress: "198.51.100.8" })), null, "an admitted attempt is never counted");
  assert.equal(broken.c.doorbellRefused({ country: "CA" }).counted, true);
  assert.equal(broken.rows(`SELECT coalesce(sum(refused),0) n FROM doorbell_tally`)[0].n, 2);
  /* this module keeps no table of its own for it */
  assert.ok(!rows(`SELECT name FROM sqlite_master WHERE type='table'`).some((t) => /security|handover/.test(t.name) && t.name !== "security_counts"
    && t.name !== "security_pending" && t.name !== "security_key"), "only credentials' tables");
});
