/* capture: bringing a knock in and the knocker's pseudonym (R65–R67, R70), the capturing member and late
   co-attestation (R16's actor, R68, R69), and the amended doorbell (R32, R37, R53, R54), N364, at the module's
   interface: the doorbell's op handler over a Durable Object stub answering through the module's own routes, the
   store-side services, and provenance's and host-governor's services as their Provides state them (fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, governor, provenance, network, sha, register, newKey, sshsign, signer, H } from "./fixture.mjs";
import { captureOps, captureAccountStatement, CAPTURE_ACCOUNT_TOKEN, pseudonymOf, READ_LIMIT } from "../../../src/capture/index.mjs";
import { knockOp, KNOCK, KNOCKER_SECRET_MIN } from "../../../src/capture/doorbell.mjs";
import { evidenceAbsent } from "../../../src/capture/ops.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";
import { NS_RATIFY, NS_RELEASE } from "../../../src/sshsig.mjs";
import { ARCHIVE_SERVICE } from "../../../src/tsa.mjs";
import { DOORBELL_VIA } from "../../../src/provenance/index.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const requiredArgument = (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);
const doAnswer = async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
  return out && out.ok === true ? { answered: true, result: out.result } : { answered: false, result: undefined }; };
const helpers = { json, requiredArgument, storeSilent, doAnswer };
const stubOf = (c) => {
  const calls = [];
  return { calls, async fetch(req) {
    const url = new URL(req.url); calls.push(url.pathname);
    const body = req.method === "POST" ? JSON.parse(await req.text() || "null") : null;
    return json({ ok: true, result: await captureOps(c, url, body, c.env)[url.pathname.slice(1)]() });
  } };
};
const knockReq = (payload, { ip = "203.0.113.1" } = {}) =>
  new Request("https://plane/?op=knock", { method: "POST", headers: { "cf-connecting-ip": ip }, body: JSON.stringify(payload) });

function setup({ evidence = true, env = {} } = {}) {
  const b = evidence ? bucket() : null;
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9", ...env } });
  const st = stubOf(f.c);
  return { ...f, b, st, prov: f.c.provenance,
           send: async (payload, o) => { const r = await knockOp(knockReq(payload, o), f.c.env, st, helpers); return { status: r.status, body: await r.json() }; } };
}
const everything = (rows) => rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name)
  .map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);
const inboxRows = (rows) => rows(`SELECT count(*) n FROM inbox`)[0].n;
const rateRows = (rows) => rows(`SELECT coalesce(sum(count),0) n FROM knock_rate`)[0].n;
const SECRET = "correct horse battery staple, twenty+";

test("R66 R53 R37 (C-118.3): a knocker secret under 20 characters, or not a string, is KNOCKER_SECRET_WEAK after oversize content and before the rate; nothing is received, stored or counted", async () => {
  const { send, st, rows, b, c } = setup();
  const row = CAPTURE_CHECKS.KNOCKER_SECRET_WEAK;
  assert.equal(KNOCKER_SECRET_MIN, 20);
  for (const weak of ["x".repeat(19), "", 12345, { s: "x".repeat(30) }, ["a"]]) {
    const r = await send({ contentText: "tip", knockerSecret: weak });
    assert.deepEqual([r.status, r.body.reason, r.body.code, r.body.check, r.body.translation],
                     [400, "KNOCKER_SECRET_WEAK", "KNOCKER_SECRET_WEAK", "C-118.3", row.translation], JSON.stringify(weak));
  }
  /* 19 characters counted as characters, not bytes: twenty emoji are twenty characters */
  assert.equal((await send({ contentText: "tip", knockerSecret: "😀".repeat(20) })).status, 200);
  assert.equal((await send({ contentText: "tip", knockerSecret: "😀".repeat(19) })).body.reason, "KNOCKER_SECRET_WEAK");
  assert.deepEqual(st.calls.length, 1, "only the strong knock reached the store");
  /* R53's order: oversize content before the weak secret */
  assert.equal((await send({ contentText: "x".repeat(KNOCK.maxBytes + 1), knockerSecret: "short" })).body.reason, "KNOCK_PAYLOAD_TOO_LARGE");
  /* the weak secret before the rate: a source at its limit still hears about its secret, and nothing is counted */
  const t = setup();
  for (let i = 0; i < 12; i++) await t.send({ contentText: `k${i}` });
  const [n, counted] = [inboxRows(t.rows), rateRows(t.rows)];
  assert.equal((await t.send({ contentText: "k13", knockerSecret: "short" })).body.reason, "KNOCKER_SECRET_WEAK");
  assert.equal((await t.send({ contentText: "k13", knockerSecret: SECRET })).body.reason, "RATE_IP");
  assert.deepEqual([inboxRows(t.rows), rateRows(t.rows)], [n, counted]);
  /* the store side refuses the same, before its rate, writing nothing */
  const before = everything(rows);
  const s = await c.knock({ content: "x", knockerSecret: "short", sourceAddress: "9.9.9.9" });
  assert.deepEqual([s.reason, s.check], ["KNOCKER_SECRET_WEAK", "C-118.3"]);
  assert.deepEqual(everything(rows), before, "nothing stored or counted");
  assert.equal(b.held.size, 1, "the one strong knock's bytes");
});

test("R66 R54 R32: a supplied secret gives a pseudonym, the same one for the same secret at this instance and another elsewhere; the row keeps only the keyed digest and the pseudonym; a generated secret of 128 bits is shown once and held nowhere", async () => {
  const { send, rows, c } = setup();
  const a = await send({ contentText: "first", knockerSecret: SECRET });
  const b2 = await send({ contentText: "second", knockerSecret: SECRET }, { ip: "198.51.100.2" });
  assert.equal(a.status, 200);
  assert.deepEqual(Object.keys(a.body).sort(), ["bytes", "knockId", "ok", "pseudonym", "received", "sha256"], "no secret echoed for a supplied one");
  assert.match(a.body.pseudonym, /^knocker-[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){3}$/);
  assert.equal(b2.body.pseudonym, a.body.pseudonym, "the same secret, the same pseudonym");
  const other = await send({ contentText: "third", knockerSecret: `${SECRET}!` });
  assert.notEqual(other.body.pseudonym, a.body.pseudonym);
  const none = await send({ contentText: "anonymous" });
  assert.equal(none.body.pseudonym, null, "no secret, no pseudonym");
  const row = rows(`SELECT knocker_digest, pseudonym FROM inbox WHERE knock_id = ?`, a.body.knockId)[0];
  assert.match(row.knocker_digest, /^[0-9a-f]{64}$/);
  assert.equal(row.pseudonym, pseudonymOf(row.knocker_digest), "a fixed derivation of the digest");
  assert.notEqual(row.knocker_digest, sha(SECRET), "a keyed digest, never an unkeyed hash of the secret");
  assert.deepEqual({ ...rows(`SELECT knocker_digest, pseudonym FROM inbox WHERE knock_id = ?`, none.body.knockId)[0] },
                   { knocker_digest: null, pseudonym: null });
  assert.ok(!everything(rows).some(([, t]) => t.includes(SECRET)), "the secret is in no row");
  assert.deepEqual(await c.knockerDigestOf(SECRET), { knocker_digest: row.knocker_digest, pseudonym: row.pseudonym });
  /* another instance: another key, another pseudonym */
  const elsewhere = setup();
  assert.notEqual((await elsewhere.send({ contentText: "first", knockerSecret: SECRET })).body.pseudonym, a.body.pseudonym);
  /* the operator's binding decides the key, and is a key apart from the source fingerprint's */
  const k1 = setup({ env: { KNOCKER_SECRET_KEY: "operator-knocker-key" } }), k2 = setup({ env: { KNOCKER_SECRET_KEY: "operator-knocker-key" } });
  const p1 = (await k1.send({ contentText: "x", knockerSecret: SECRET })).body.pseudonym;
  assert.equal((await k2.send({ contentText: "x", knockerSecret: SECRET })).body.pseudonym, p1);
  assert.equal(k1.rows(`SELECT count(*) n FROM knocker_key`)[0].n, 0, "no instance key is made when one is bound");
  const fpOnly = setup({ env: { KNOCK_FINGERPRINT_KEY: "operator-knocker-key" } }), fpOnly2 = setup({ env: { KNOCK_FINGERPRINT_KEY: "operator-knocker-key" } });
  assert.notEqual((await fpOnly.send({ contentText: "x", knockerSecret: SECRET })).body.pseudonym,
                  (await fpOnly2.send({ contentText: "x", knockerSecret: SECRET })).body.pseudonym, "R56's key is not the knocker's key");
  /* generateSecret: at least 128 random bits, answered once, held nowhere */
  const g = setup();
  const gen = await g.send({ contentText: "made for me", generateSecret: true });
  assert.equal(typeof gen.body.secret, "string");
  assert.ok(gen.body.secret.length >= 26 && /^[0-9A-HJKMNP-TV-Z]+$/.test(gen.body.secret), "26 base32 characters carry 128 bits");
  assert.equal(gen.body.pseudonym, (await g.c.knockerDigestOf(gen.body.secret)).pseudonym);
  assert.ok(!everything(g.rows).some(([, t]) => t.includes(gen.body.secret)), "held in no row");
  assert.equal((await g.send({ contentText: "again", generateSecret: true })).body.secret === gen.body.secret, false);
  /* a supplied secret wins over generateSecret: nothing is made */
  const both = await g.send({ contentText: "both", knockerSecret: SECRET, generateSecret: true });
  assert.deepEqual([both.body.secret, both.body.pseudonym], [undefined, (await g.c.knockerDigestOf(SECRET)).pseudonym]);
  /* R32: the member reads carry the pseudonym and the digest */
  const item = c.inboxGet(a.body.knockId).item;
  assert.deepEqual([item.pseudonym, item.knocker_digest], [row.pseudonym, row.knocker_digest]);
  assert.ok(c.inboxList(null).inbox.every((k) => "pseudonym" in k && "knocker_digest" in k));
});

test("R66: knockerDigestOf writes nothing and never throws: no secret, or no knocker key yet, answers nulls with the basis", async () => {
  const { c, rows } = setup();
  const before = everything(rows);
  for (const s of [undefined, null, "", 42, {}]) assert.deepEqual([(await c.knockerDigestOf(s)).knocker_digest, (await c.knockerDigestOf(s)).pseudonym], [null, null]);
  const fresh0 = await c.knockerDigestOf(SECRET);
  assert.deepEqual([fresh0.knocker_digest, fresh0.pseudonym], [null, null]);
  assert.match(fresh0.basis, /no knock carrying a secret/);
  assert.deepEqual(everything(rows), before, "nothing written, not even a key");
  await c.knock({ content: "x", knockerSecret: SECRET, sourceAddress: "1.2.3.4" });
  const known = await c.knockerDigestOf(SECRET);
  assert.match(known.knocker_digest, /^[0-9a-f]{64}$/);
  assert.equal((await c.knockerDigestOf("never presented to this doorbell")).pseudonym === known.pseudonym, false);
});

test("R67 R70: knocksOf answers the knocks sharing a pseudonym, oldest first, with the continuity sentence, never a contact, bounded and paged", async () => {
  const { c } = setup();
  const W = KNOCK.windowMs;
  const ids = [];
  for (let i = 0; i < 7; i++)
    ids.push((await c.knock({ content: `k${i}`, note: `note ${i}`, contact: `me${i}@example.org`, knockerSecret: SECRET,
                               sourceAddress: `s${i}`, now: W * 10 + i * 1000 })).knockId);
  await c.knock({ content: "other", contact: "other@example.org", knockerSecret: `${SECRET}?`, sourceAddress: "o", now: W * 10 + 500 });
  await c.knock({ content: "anon", sourceAddress: "a", now: W * 10 + 600 });
  const p = (await c.knockerDigestOf(SECRET)).pseudonym;
  const all = c.knocksOf({ pseudonym: p });
  assert.deepEqual([all.ok, all.continuity, all.count, all.limit, all.truncated, all.next], [true, "the same knocker secret was presented", 7, READ_LIMIT.default, false, null]);
  assert.deepEqual(all.knocks.map((k) => k.knock_id), ids, "oldest first, and only this pseudonym's");
  assert.ok(!JSON.stringify(all).includes("@example.org"), "no contact");
  assert.ok(all.knocks.every((k) => !("contact" in k)));
  const pages = [];
  let after = null;
  for (;;) { const pg = c.knocksOf({ pseudonym: p, limit: 3, after }); pages.push(pg); if (!pg.truncated) break; after = pg.next; }
  assert.deepEqual(pages.map((x) => x.knocks.length), [3, 3, 1]);
  assert.deepEqual(pages.flatMap((x) => x.knocks.map((k) => k.knock_id)), ids);
  assert.equal(c.knocksOf({ pseudonym: p, after: "garbage" }).reason, "BAD_CURSOR");
  assert.equal(c.knocksOf({ pseudonym: p, limit: 5000 }).limit, READ_LIMIT.max);
  assert.deepEqual(c.knocksOf({ pseudonym: "knocker-0000-0000-0000-0000" }).knocks, []);
  assert.equal(c.knocksOf({}).reason, "NO_PSEUDONYM");
  const route = captureOps(c, new URL(`http://x/knocksof?pseudonym=${encodeURIComponent(p)}&limit=2`), null, c.env).knocksof();
  assert.deepEqual([route.count, route.truncated], [2, true]);
});

test("R65 R16 R70 R33 R32: a pull holds the bytes under their own digest, writes one doorbell receipt at knock:<id>, marks the knock pulled with the capture, by and instant, and answers the document with the knocker as its unnamed source and never the contact", async () => {
  const { c, rows, b, prov } = setup();
  const k = await c.knock({ content: "leaked memo", note: "the budget office has this", contact: "tipster@example.org",
                            knockerSecret: SECRET, sourceAddress: "5.5.5.5" });
  const tables = () => rows(`SELECT (SELECT count(*) FROM bundles) b, (SELECT count(*) FROM register) r, (SELECT count(*) FROM files) f`)[0];
  const before = { ...tables() };
  const r = await c.pullKnock({ knockId: k.knockId, by: "m1", at: "2026-09-30T10:00:00Z" });
  assert.equal(r.ok, true); assert.equal(r.existed, false);
  const d = sha("leaked memo");
  assert.deepEqual(r.capture, { sha256: d, bytes: 11 });
  assert.ok(b.held.has(`bio/captures/${d}`), "held under its own digest in the evidence store");
  assert.equal(sha(b.held.get(`bio/captures/${d}`)), d);
  assert.deepEqual(prov.receipts, [{ address: `knock:${k.knockId}`, addressNorm: `knock:${k.knockId}`, captureSha: d,
                                     retrieved: "2026-09-30T10:00:00Z", via: DOORBELL_VIA, retrievalLocator: null }]);
  assert.equal(DOORBELL_VIA, "doorbell", "provenance's export, the route its R51 grades");
  const row = rows(`SELECT status, resolved_by, capture_sha, pulled_by, pulled_at FROM inbox WHERE knock_id = ?`, k.knockId)[0];
  assert.deepEqual({ ...row }, { status: "pulled", resolved_by: "m1", capture_sha: d, pulled_by: "m1", pulled_at: "2026-09-30T10:00:00Z" });
  const doc = r.document;
  assert.deepEqual(doc.source, { kind: "knocker", named: false, pseudonym: k.pseudonym,
                                 receipt: { knock_id: k.knockId, sha256: d, bytes: 11, received: rows(`SELECT received FROM inbox`)[0].received } });
  assert.deepEqual(doc.knocker_note, { text: "the budget office has this", words_of: "the knocker", evidence_of_truth: false });
  assert.deepEqual([doc.capture.actor, doc.capture.actor_class, doc.capture.sha256, doc.capture.bytes, doc.capture.encoding],
                   ["m1", "member", d, 11, "binary"]);
  assert.deepEqual([doc.capture.grade, doc.capture.grade_basis], [null, "CAPTURE_RECEIVED_NOT_FETCHED"], "received, not fetched: no fetched letter");
  assert.equal(doc.capture.transport, undefined);
  assert.deepEqual([doc.locator, doc.retrieved, doc.file], [`knock:${k.knockId}`, "2026-09-30T10:00:00Z", `snapshots/${k.knockId}`]);
  assert.equal(doc.provenance_chain.length, 1);
  assert.deepEqual([doc.provenance_chain[0].via, doc.provenance_chain[0].bound], ["doorbell", false]);
  assert.match(doc.provenance_chain[0].who, /^instance inst \(CivicOS\/9\.9\.9\)$/);
  assert.match(doc.provenance_chain[0].asserts, /received at this instance's doorbell as knock .* not fetched/);
  assert.deepEqual(doc.attestation_attempts, []);
  assert.ok(doc.profile && doc.profile.format && doc.profile.digests, "R17's profile over the bytes");
  /* R70: the contact is nowhere the pull reaches */
  assert.ok(!JSON.stringify([r, prov.receipts, rows(`SELECT * FROM capture_actors`)]).includes("tipster"), "no contact in the document, the receipt or the actor");
  /* R33: no bundle, no register row, no file */
  assert.deepEqual({ ...tables() }, before);
  /* the capture's actor is the puller (R69 reads it) */
  assert.deepEqual(c.captureAccountsOf(d).actors.map((a) => a.actor), ["m1"]);
  /* a knock already pulled answers existed with the same capture and document, writing nothing */
  const snap = everything(rows);
  const again = await c.pullKnock({ knockId: k.knockId, by: "m2" });
  assert.deepEqual([again.ok, again.existed, again.capture.sha256, again.pulled_by], [true, true, d, "m1"]);
  assert.deepEqual(again.document, doc);
  assert.deepEqual(everything(rows), snap);
  assert.equal(prov.receipts.length, 1);
  /* R32: inboxResolve to `pulled` is R65's act and answers as it does */
  const k2 = await c.knock({ content: "second memo", sourceAddress: "5.5.5.6" });
  const viaResolve = await c.inboxResolve({ knockId: k2.knockId, status: "pulled", by: "m1" });
  assert.deepEqual([viaResolve.ok, viaResolve.existed, viaResolve.capture.sha256, viaResolve.document.source.pseudonym],
                   [true, false, sha("second memo"), null]);
  assert.equal(prov.receipts.length, 2);
  assert.equal(c.inboxGet(k2.knockId).item.capture_sha, sha("second memo"));
});

test("R65 R37 (C-118.2, C-118.4, R63): refusals in order, NO_SUCH_KNOCK, KNOCK_DISCARDED, then the bytes gone; a refused pull writes nothing, and a discarded knock moved back to new is pulled", async () => {
  const { c, rows, b } = setup();
  const k = await c.knock({ content: "memo", sourceAddress: "1.1.1.1" });
  const snap = () => everything(rows);
  let before = snap();
  const none = await c.pullKnock({ knockId: "KNOCK-none", by: "m1" });
  assert.deepEqual(none, c.inboxGet("KNOCK-none"), "C-118.2, the same answer the read gives");
  assert.equal(none.check, "C-118.2");
  assert.equal((await c.pullKnock({ knockId: k.knockId })).reason, "NO_PULLER", "a pull names who brings it in");
  c.inboxResolve({ knockId: k.knockId, status: "discarded", by: "m1" });
  before = snap();
  b.held.delete(`bio/inbox/${sha("memo")}`);
  const disc = await c.pullKnock({ knockId: k.knockId, by: "m1" });
  const row = CAPTURE_CHECKS.KNOCK_DISCARDED;
  assert.deepEqual([disc.ok, disc.reason, disc.code, disc.check, disc.translation], [false, "KNOCK_DISCARDED", "KNOCK_DISCARDED", "C-118.4", row.translation],
                   "discarded is answered before the bytes are looked at");
  assert.deepEqual(snap(), before);
  c.inboxResolve({ knockId: k.knockId, status: "new", by: "m1" });
  before = snap();
  const gone = await c.pullKnock({ knockId: k.knockId, by: "m1" });
  const want = evidenceAbsent(sha("memo"), "bio").body;
  assert.deepEqual([gone.ok, gone.reason, gone.code, gone.check, gone.translation, gone.sha256], [false, want.reason, want.code, want.check, want.translation, sha("memo")]);
  assert.deepEqual(snap(), before, "nothing written");
  /* bytes that no longer hash to the knock's digest are not held either */
  b.held.set(`bio/inbox/${sha("memo")}`, new TextEncoder().encode("tampered"));
  assert.equal((await c.pullKnock({ knockId: k.knockId, by: "m1" })).reason, "EVIDENCE_NOT_HELD");
  b.held.set(`bio/inbox/${sha("memo")}`, new TextEncoder().encode("memo"));
  const ok = await c.pullKnock({ knockId: k.knockId, by: "m1" });
  assert.deepEqual([ok.ok, ok.existed], [true, false], "moved back to new, it is brought in");
  /* a pull whose receipt cannot be written leaves the knock as it was: one act */
  const f = setup();
  const k3 = await f.c.knock({ content: "receipt fails", sourceAddress: "2.2.2.2" });
  f.c.provenance.recordReceipt = () => { throw new Error("down"); };
  const before3 = everything(f.rows).filter(([t]) => t !== "capture_actors");
  const r3 = await f.c.pullKnock({ knockId: k3.knockId, by: "m1" });
  assert.deepEqual([r3.ok, r3.reason], [false, "RECEIPT_NOT_WRITTEN"]);
  assert.deepEqual(f.rows(`SELECT status, capture_sha FROM inbox`).map((x) => ({ ...x })), [{ status: "new", capture_sha: null }]);
  assert.deepEqual(f.rows(`SELECT count(*) n FROM capture_actors`)[0].n, 0);
  assert.deepEqual(everything(f.rows).filter(([t]) => t !== "capture_actors"), before3);
  /* with no evidence store the bytes cannot be held under their own digest: the storage-absent refusal */
  const bare = setup({ evidence: false });
  const k4 = await bare.c.knock({ content: "inline", sourceAddress: "3.3.3.3" });
  const r4 = await bare.c.pullKnock({ knockId: k4.knockId, by: "m1" });
  assert.deepEqual([r4.ok, r4.reason], [false, "EVIDENCE_STORAGE_NOT_CONFIGURED"]);
  assert.equal(bare.rows(`SELECT status FROM inbox`)[0].status, "new");
});

test("R65: a knock held inline (no evidence bucket when it arrived) is brought in with exactly the bytes received, binary included", async () => {
  const b = bucket();
  const f = fresh({ evidence: b });
  const env = f.c.env;
  f.c.env = {};
  const bytes = new Uint8Array([0, 255, 128, 10, 13, 200, 7]);
  const k = await f.c.knock({ contentB64: Buffer.from(bytes).toString("base64"), sourceAddress: "4.4.4.4" });
  assert.equal(f.rows(`SELECT in_r2 FROM inbox`)[0].in_r2, 0);
  f.c.env = env;
  const r = await f.c.pullKnock({ knockId: k.knockId, by: "m1" });
  assert.equal(r.ok, true);
  assert.equal(r.capture.sha256, sha(bytes));
  assert.deepEqual([...b.held.get(`bio/captures/${sha(bytes)}`)], [...bytes], "the bytes as received, not a text decoding of them");
});

test("R65 R67: the routes: inboxpull and knocksof answer through the module's ops, the stamp in the query winning over a body's copy", async () => {
  const { c, st } = setup();
  const k = await c.knock({ content: "via route", knockerSecret: SECRET, sourceAddress: "7.7.7.7" });
  const r = await (await st.fetch(new Request(`http://do/inboxpull?by=m1`, { method: "POST", body: JSON.stringify({ knockId: k.knockId, by: "forged" }) }))).json();
  assert.deepEqual([r.result.ok, r.result.pulled_by, r.result.document.capture.actor], [true, "m1", "m1"]);
  const list = await (await st.fetch(new Request(`http://do/knocksof?pseudonym=${encodeURIComponent(k.pseudonym)}`))).json();
  assert.deepEqual(list.result.knocks.map((x) => [x.knock_id, x.capture_sha]), [[k.knockId, sha("via route")]]);
});

test("R16: a member session's capture names its actor, the member stamp, and is recorded as that member's capture; any other caller's is null", async () => {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "i" } });
  const net = network({ "https://a.example/x": () => new Response("x bytes", { headers: { "content-type": "text/plain" } }) });
  try {
    const m = await f.c.acquire({ locator: "https://a.example/x" }, { cls: "member", member: true, sessMember: "m1" });
    assert.deepEqual([m.body.document.capture.actor, m.body.document.capture.actor_class], ["m1", "member"]);
    assert.deepEqual(f.c.captureAccountsOf(sha("x bytes")).actors.map((a) => a.actor), ["m1"]);
    for (const [cls, member] of [["admin", false], ["probe", false], ["member", false]]) {
      const r = await f.c.acquire({ locator: "https://a.example/x" }, { cls, member, sessMember: null });
      assert.equal(r.body.document.capture.actor, null, cls);
    }
    assert.deepEqual(f.c.captureAccountsOf(sha("x bytes")).actors.map((a) => a.actor), ["m1"], "no machine is recorded as an actor");
  } finally { net.restore(); }
});

test("R69 R37 (C-118.5, C-118.6): only a capture's actor appends a signed account, verified over its statement against one of that member's attesting keys; append-only, and captureAccountsOf answers them", async () => {
  const { c, s } = setup();
  const d = H("c1");
  c.recordCaptureActor({ captureSha: d, actor: "m1", at: "2026-09-01T00:00:00Z" });
  const k1 = await newKey(), k2 = await newKey(), kOther = await newKey(), kRevoked = await newKey();
  signer(s, "m1", k1.keyB64); signer(s, "m1", kRevoked.keyB64, { keyStatus: "revoked" }); signer(s, "m2", kOther.keyB64);
  const text = "I saved this page from the clerk's site at 9:14 on 1 September, logged in as myself.";
  const good = await sshsign(k1, captureAccountStatement(d, text), NS_RATIFY);
  assert.equal(new TextDecoder().decode(captureAccountStatement(d, text)), `${CAPTURE_ACCOUNT_TOKEN} ${d}\n${text}`);
  const notActor = CAPTURE_CHECKS.NOT_THE_CAPTURING_ACTOR, noText = CAPTURE_CHECKS.ACCOUNT_NO_TEXT;
  /* anyone else, and a capture with no recorded actor, is C-118.5 */
  for (const [sha0, by] of [[d, "m2"], [d, "member:m2"], [d, null], [H("c2"), "m1"], ["not a sha", "m1"]]) {
    const r = await c.recordCaptureAccount({ captureSha: sha0, text, signature: good, by });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "NOT_THE_CAPTURING_ACTOR", "NOT_THE_CAPTURING_ACTOR", "C-118.5", notActor.translation], `${sha0} ${by}`);
  }
  for (const t of ["", "   ", null, 7]) {
    const r = await c.recordCaptureAccount({ captureSha: d, text: t, signature: good, by: "m1" });
    assert.deepEqual([r.reason, r.code, r.check, r.translation], ["ACCOUNT_NO_TEXT", "ACCOUNT_NO_TEXT", "C-118.6", noText.translation]);
  }
  /* SIG_<reason>: another text, another member's key, a revoked key, another namespace, no signature */
  const cases = [[await sshsign(k1, captureAccountStatement(d, "another account"), NS_RATIFY), "SIG_BAD_SIGNATURE"],
                 [await sshsign(kOther, captureAccountStatement(d, text), NS_RATIFY), "SIG_UNKNOWN_KEY"],
                 [await sshsign(kRevoked, captureAccountStatement(d, text), NS_RATIFY), "SIG_UNKNOWN_KEY"],
                 [await sshsign(k1, captureAccountStatement(d, text), NS_RELEASE), "SIG_NAMESPACE"],
                 [await sshsign(k1, `bio-ratify ${d}\n${text}`, NS_RATIFY), "SIG_BAD_SIGNATURE"],
                 ["", "SIG_MALFORMED"], [undefined, "SIG_MALFORMED"]];
  for (const [sig, reason] of cases) assert.equal((await c.recordCaptureAccount({ captureSha: d, text, signature: sig, by: "m1" })).reason, reason);
  assert.deepEqual(c.captureAccountsOf(d).accounts, [], "no refusal wrote anything");
  /* the actor, with any of their attesting keys, `member:m1` and `m1` being one member */
  const a1 = await c.recordCaptureAccount({ captureSha: d, text, signature: good, by: "m1", at: "2026-09-02T00:00:00Z" });
  assert.deepEqual([a1.ok, a1.seq, a1.key_b64], [true, 1, k1.keyB64]);
  const text2 = "A correction: it was 9:41.";
  const a2 = await c.recordCaptureAccount({ captureSha: d.toUpperCase(), text: text2, signature: await sshsign(k2, captureAccountStatement(d, text2), NS_RATIFY), by: "member:m1" });
  assert.equal(a2.reason, "SIG_UNKNOWN_KEY", "a key the member has not registered does not attest");
  signer(s, "m1", k2.keyB64);
  const a3 = await c.recordCaptureAccount({ captureSha: d, text: text2, signature: await sshsign(k2, captureAccountStatement(d, text2), NS_RATIFY), by: "member:m1" });
  assert.deepEqual([a3.ok, a3.seq], [true, 2]);
  const all = c.captureAccountsOf(d);
  assert.deepEqual(all.accounts.map((a) => [a.seq, a.by, a.text, a.key_b64]), [[1, "m1", text, k1.keyB64], [2, "member:m1", text2, k2.keyB64]], "append-only, in order");
  assert.deepEqual(all.actors.map((a) => a.actor), ["m1"]);
  /* a revoked member's keys attest nothing */
  s.sql.exec(`UPDATE members SET status = 'revoked' WHERE member_id = 'm1'`);
  assert.equal((await c.recordCaptureAccount({ captureSha: d, text, signature: good, by: "m1" })).reason, "SIG_UNKNOWN_KEY");
  assert.deepEqual(c.captureAccountsOf("nope"), { captureSha: "nope", actors: [], accounts: [] });
  /* the routes, the stamp winning */
  s.sql.exec(`UPDATE members SET status = 'active' WHERE member_id = 'm1'`);
  const via = await captureOps(c, new URL("http://x/captureaccount?by=m2"), { captureSha: d, text, signature: good, by: "m1" }, c.env).captureaccount();
  assert.equal(via.reason, "NOT_THE_CAPTURING_ACTOR", "the query's stamp, not the body's claim");
  assert.equal(captureOps(c, new URL(`http://x/captureaccounts?capture=${d}`), null, c.env).captureaccounts().accounts.length, 2);
});

test("R69: the puller of a knock is its capture's actor and may give a signed account of receiving it", async () => {
  const { c, s } = setup();
  const k = await c.knock({ content: "handed over", sourceAddress: "8.8.8.8" });
  const r = await c.pullKnock({ knockId: k.knockId, by: "m7" });
  const key = await newKey();
  signer(s, "m7", key.keyB64);
  const text = "A resident knocked; I brought it in after reading it.";
  const out = await c.recordCaptureAccount({ captureSha: r.capture.sha256, text, signature: await sshsign(key, captureAccountStatement(r.capture.sha256, text), NS_RATIFY), by: "m7" });
  assert.equal(out.ok, true);
});

/* A world for R68: a held capture, provenance's attest as its Provides state it (answered here), the network scripted. */
function reWorld({ attestAnswer = null, held = true, registered = null } = {}) {
  const b = bucket();
  const gov = governor();
  const f = fresh({ evidence: b, gov, env: { INSTANCE_NAME: "i" } });
  const bytes = new TextEncoder().encode("the captured page");
  const d = sha(bytes);
  if (held) b.held.set(`bio/captures/${d}`, bytes);
  f.c.provenance = provenance(f.s, { attestAnswer });
  if (registered) f.c.provenance.registerHolds = () => registered;
  return { ...f, b, gov, d, bytes };
}
const ts = (ok) => ({ service: "https://tsa.test/", attempted: "2026-09-30T11:00:00Z", ok, ...(ok ? { kind: "rfc3161", token_sha256: H("7"), token_bytes: 900 } : { note: "http 500" }) });
const coa = (archived) => (archived ? { service: ARCHIVE_SERVICE, attempted: "2026-09-30T11:00:01Z", ok: true, kind: "co-archive", archived_locator: archived }
                                     : { service: ARCHIVE_SERVICE, attempted: "2026-09-30T11:00:01Z", ok: false, note: "http 523" });

test("R68: reattest asks for a fresh timestamp and co-archive, compares the co-archive's raw replay with the digest through the governor, and appends each outcome late, dated, with what it proves", async () => {
  const archived = "https://web.archive.org/web/20260930110001/https://a.example/page";
  const w = reWorld({ attestAnswer: { ok: true, attempts: [ts(false), ts(true), coa(archived)] } });
  const net = network({ "https://web.archive.org/web/20260930110001id_/https://a.example/page": () => new Response(w.bytes) });
  let r;
  try { r = await w.c.reattest({ captureSha: w.d, locator: "https://a.example/page", by: "m1" }); } finally { net.restore(); }
  assert.equal(r.ok, true);
  assert.deepEqual(w.c.provenance.attests, [{ sha256: w.d, archive: true, locator: "https://a.example/page" }], "a fresh timestamp and co-archive asked of provenance.attest");
  assert.deepEqual(net.seen.map((x) => x.url), ["https://web.archive.org/web/20260930110001id_/https://a.example/page"], "the raw replay");
  assert.ok(w.gov.calls.some((c) => c[0] === "admit" && c[1] === "web.archive.org"), "through the host governor");
  assert.deepEqual(r.late_attestations.map((o) => [o.kind, o.ok, o.late, o.at, o.proves]), [
    ["timestamp", false, true, "2026-09-30T11:00:00Z", "proves the bytes existed by 2026-09-30T11:00:00Z, not at capture"],
    ["timestamp", true, true, "2026-09-30T11:00:00Z", "proves the bytes existed by 2026-09-30T11:00:00Z, not at capture"],
    ["co_archive", true, true, "2026-09-30T11:00:01Z", "proves the bytes existed by 2026-09-30T11:00:01Z, not at capture"]]);
  const co = r.late_attestations[2];
  assert.deepEqual([co.matches, co.archived_locator, co.replay_sha256], [true, archived, w.d]);
  assert.deepEqual(w.c.lateAttestationsOf(w.d).late_attestations.map((o) => [o.seq, o.by, o.kind, o.matches ?? null]),
                   [[1, "m1", "timestamp", null], [2, "m1", "timestamp", null], [3, "m1", "co_archive", true]], "appended in order");
  /* a replay of other bytes: false; no archived locator or no replay: undetermined */
  const w2 = reWorld({ attestAnswer: { ok: true, attempts: [ts(true), coa(archived)] } });
  const n2 = network({ "https://web.archive.org/web/20260930110001id_/https://a.example/page": () => new Response("something else") });
  try { assert.equal((await w2.c.reattest({ captureSha: w2.d, locator: "https://a.example/page" })).late_attestations[1].matches, false); } finally { n2.restore(); }
  const w3 = reWorld({ attestAnswer: { ok: true, attempts: [ts(true), coa(null)] } });
  const r3 = await w3.c.reattest({ captureSha: w3.d, locator: "https://a.example/page" });
  assert.deepEqual([r3.late_attestations[1].kind, r3.late_attestations[1].ok, r3.late_attestations[1].matches], ["co_archive", false, "undetermined"]);
  const w4 = reWorld({ attestAnswer: { ok: true, attempts: [ts(true), coa(archived)] } });
  const n4 = network({});
  try { assert.equal((await w4.c.reattest({ captureSha: w4.d, locator: "https://a.example/page" })).late_attestations[1].matches, "undetermined"); } finally { n4.restore(); }
  /* appended, never replaced: a second reattest adds after the first */
  const w5 = reWorld({ attestAnswer: { ok: false, reason: "NO_ATTESTATION", attempts: [ts(false)] } });
  await w5.c.reattest({ captureSha: w5.d });
  await w5.c.reattest({ captureSha: w5.d });
  assert.deepEqual(w5.c.lateAttestationsOf(w5.d).late_attestations.map((o) => o.seq), [1, 2]);
  assert.deepEqual(w5.c.provenance.attests.map((a) => a.archive), [false, false], "with no public locator, no co-archive is asked");
});

test("R68 (R63): reattest refuses BAD_SHA, and R63's absence when no bytes are held; a capture held in parts counts when provenance holds its receipt", async () => {
  const w = reWorld();
  for (const bad of ["abc", "", null, 42]) assert.equal((await w.c.reattest({ captureSha: bad })).reason, "BAD_SHA");
  const gone = reWorld({ held: false });
  const r = await gone.c.reattest({ captureSha: gone.d });
  const want = evidenceAbsent(gone.d, "bio").body;
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.sha256], [false, want.reason, want.code, want.check, want.translation, gone.d]);
  assert.deepEqual([gone.c.provenance.attests, gone.c.lateAttestationsOf(gone.d).late_attestations], [[], []], "nothing asked, nothing written");
  const parts = reWorld({ held: false, registered: { ok: true, registered: false, acquired: true } });
  const p = await parts.c.reattest({ captureSha: parts.d });
  assert.equal(p.ok, true);
  assert.equal(parts.c.provenance.attests.length, 1);
  const noStore = fresh({});
  assert.equal((await noStore.c.reattest({ captureSha: H("a") })).reason, "EVIDENCE_NOT_HELD", "with no evidence store no bytes are held");
  /* the routes */
  const rw = reWorld({ attestAnswer: { ok: true, attempts: [ts(true)] } });
  const via = await captureOps(rw.c, new URL("http://x/reattest?by=m9"), { captureSha: rw.d, by: "forged" }, rw.c.env).reattest();
  assert.equal(via.ok, true);
  assert.equal(captureOps(rw.c, new URL(`http://x/lateattestations?capture=${rw.d}`), null, rw.c.env).lateattestations().late_attestations[0].by, "m9");
});

test("R37: rows C-118.3–C-118.6 are in capture's own table with the translations the requirements state", () => {
  const want = {
    KNOCKER_SECRET_WEAK: ["C-118.3", "A knocker secret this short could be guessed, letting someone else continue your pseudonym. Use a longer one, or ask the doorbell to make one. Nothing was received."],
    KNOCK_DISCARDED: ["C-118.4", "This knock was set aside. Move it back to new before bringing it in. Nothing was written."],
    NOT_THE_CAPTURING_ACTOR: ["C-118.5", "An account of how a document was captured is added only by the member who captured it, and that is not you, or no member captured it. Nothing was written."],
    ACCOUNT_NO_TEXT: ["C-118.6", "An account of how you captured a document says what happened in your own words, and this one is empty. Write it. Nothing was written."],
  };
  for (const [code, [check, translation]] of Object.entries(want)) {
    const row = CAPTURE_CHECKS[code];
    assert.deepEqual([row.check, row.translation], [check, translation], code);
    assert.match(row.where, /^src\/capture\/(index|doorbell)\.mjs \S+ > is-[a-z-]+$/);
    assert.ok(Object.isFrozen(row));
  }
  assert.equal(new Set(Object.values(CAPTURE_CHECKS).map((r) => r.check)).size, Object.keys(CAPTURE_CHECKS).length, "one row per check id");
});

test("R71 R31: knockAttempt asks the knock's two windows exactly as a knock does: RATE_IP or RATE_GLOBAL with the stated bound, an admitted attempt counted in both, nothing else written", async () => {
  const { c, rows } = setup();
  const W = KNOCK.windowMs, t0 = 3000 * W;
  const others = () => everything(rows).filter(([t]) => !["knock_rate", "knock_key"].includes(t));
  const before = others();
  for (let i = 0; i < 11; i++) assert.equal(await c.knockAttempt({ sourceAddress: "6.6.6.6", now: t0 + i }), null);
  assert.equal(rateRows(rows), 22, "each admitted attempt counted in the source's window and the instance's");
  /* attempts and knocks share the windows: the twelfth from this source is a knock, the thirteenth anything is refused */
  assert.equal((await c.knock({ content: "k", sourceAddress: "6.6.6.6", now: t0 + 20 })).ok, true);
  const counted = rateRows(rows);
  const r = await c.knockAttempt({ sourceAddress: "6.6.6.6", now: t0 + 30 });
  const row = (await import("../../../checks/bio-checks.mjs")).KNOCK_CHECKS.RATE_IP;
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.stated], [false, "RATE_IP", "RATE_IP", row.check, row.translation, KNOCK.statedPerIp]);
  assert.equal(rateRows(rows), counted, "a refused attempt counts nothing");
  assert.equal((await c.knock({ content: "k2", sourceAddress: "6.6.6.6", now: t0 + 40 })).reason, "RATE_IP", "and the knock after it is refused alike");
  assert.equal(await c.knockAttempt({ sourceAddress: "6.6.6.7", now: t0 + 50 }), null, "another source is unaffected");
  /* the instance's window */
  const g = setup();
  for (let i = 0; i < 300; i++) await g.c.knockAttempt({ sourceAddress: `10.1.${i >> 8}.${i & 255}`, now: t0 });
  const rg = await g.c.knockAttempt({ sourceAddress: "10.9.9.9", now: t0 });
  assert.deepEqual([rg.reason, rg.stated], ["RATE_GLOBAL", KNOCK.statedGlobal]);
  assert.equal((await g.c.knock({ content: "late", sourceAddress: "10.9.9.8", now: t0 })).reason, "RATE_GLOBAL");
  /* nothing else written: no inbox row, no bytes, nothing outside the rate's own table and its key */
  const after = others().map(([t, v]) => [t, t === "inbox" ? JSON.parse(v).filter((x) => x.sha256 !== sha("k")) : v]);
  assert.deepEqual(after.map(([t, v]) => [t, t === "inbox" ? JSON.stringify(v) : v]), before);
});

test("R72 R70: pulledKnocksOf answers every knock pulled into a capture, oldest received first, with its pseudonym and digest and never its contact; [] for none", async () => {
  const { c } = setup();
  const W = KNOCK.windowMs;
  const a = await c.knock({ content: "same memo", contact: "a@example.org", knockerSecret: SECRET, sourceAddress: "1", now: W * 20 + 2000 });
  const b2 = await c.knock({ content: "same memo", contact: "b@example.org", sourceAddress: "2", now: W * 20 + 1000 });
  const other = await c.knock({ content: "other memo", sourceAddress: "3", now: W * 20 + 3000 });
  for (const k of [a, b2, other]) assert.equal((await c.pullKnock({ knockId: k.knockId, by: "m1" })).ok, true);
  const got = c.pulledKnocksOf(sha("same memo"));
  assert.deepEqual(got.map((k) => k.knock_id), [b2.knockId, a.knockId], "oldest received first");
  assert.deepEqual(Object.keys(got[0]).sort(), ["bytes", "knock_id", "knocker_digest", "pseudonym", "received", "sha256"]);
  assert.deepEqual([got[1].pseudonym, got[0].pseudonym], [a.pseudonym, null]);
  assert.match(got[1].knocker_digest, /^[0-9a-f]{64}$/);
  assert.ok(!JSON.stringify(got).includes("@example.org"), "never a contact");
  assert.deepEqual(c.pulledKnocksOf(sha("other memo")).map((k) => k.knock_id), [other.knockId]);
  assert.deepEqual(c.pulledKnocksOf(H("f")), []);
  assert.deepEqual(c.pulledKnocksOf(sha("same memo").toUpperCase()).length, 2);
  for (const bad of [undefined, null, "x", 42]) assert.deepEqual(c.pulledKnocksOf(bad), []);
  const k4 = await c.knock({ content: "not pulled", sourceAddress: "4" });
  assert.deepEqual(c.pulledKnocksOf(k4.sha256), [], "a knock not pulled is in no capture");
  assert.equal(captureOps(c, new URL(`http://x/pulledknocks?capture=${sha("same memo")}`), null, c.env).pulledknocks().length, 2);
});
