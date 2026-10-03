/* capture: bringing a knock in and the knocker's pseudonym (R65–R67, R70), the capturing member and late
   co-attestation (R16's actor, R68, R69), and the amended doorbell (R32, R37, R53, R54), N364, at the module's
   interface: the doorbell's op handler over a Durable Object stub answering through the module's own routes, the
   store-side services, provenance's and host-governor's services as their Provides state them, and attestation's
   real `attest` over a scripted network (fixture.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, governor, provenance, network, granted, sha, register, newKey, sshsign, signer, H } from "./fixture.mjs";
import { captureOps, captureAccountStatement, CAPTURE_ACCOUNT_TOKEN, pseudonymOf, READ_LIMIT, PULL_WITHIN_FAILED_DETAIL } from "../../../src/capture/index.mjs";
import { knockOp, KNOCK, KNOCKER_SECRET_MIN } from "../../../src/capture/doorbell.mjs";
import { evidenceAbsent } from "../../../src/capture/ops.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";
import * as signatures from "../../../src/sshsig.mjs";
import { NS_RATIFY, NS_RELEASE } from "../../../src/sshsig.mjs";
import { ARCHIVE_SERVICE, ARCHIVE_SAVE_BASE, TSA_ENDPOINTS } from "../../../src/tsa.mjs";
import { DOORBELL_VIA } from "../../../src/provenance/index.mjs";
import { INSTALLATION_CHECKS } from "../../../src/acquisition/index.mjs";

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
/* Everything but R80's tally, where every refused knock is counted. */
const TALLY = ["doorbell_tally", "doorbell_limit_last"];
const untallied = (rows) => everything(rows).filter(([t]) => !TALLY.includes(t));
const tallied = (rows) => rows(`SELECT coalesce(sum(refused),0) n FROM doorbell_tally`)[0].n;
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
  assert.deepEqual(st.calls.filter((p) => p === "/knock").length, 1, "only the strong knock reached the store's knock; each weak one was only counted (R80)");
  /* R53's order: oversize content before the weak secret */
  assert.equal((await send({ contentText: "x".repeat(KNOCK.maxBytes + 1), knockerSecret: "short" })).body.reason, "KNOCK_PAYLOAD_TOO_LARGE");
  /* the weak secret before the rate: a source at its limit still hears about its secret, and nothing is counted */
  const t = setup();
  for (let i = 0; i < 5; i++) await t.send({ contentText: `k${i}` });
  const [n, counted] = [inboxRows(t.rows), rateRows(t.rows)];
  assert.equal((await t.send({ contentText: "k6", knockerSecret: "short" })).body.reason, "KNOCKER_SECRET_WEAK");
  assert.equal((await t.send({ contentText: "k6", knockerSecret: SECRET })).body.reason, "RATE_IP");
  assert.deepEqual([inboxRows(t.rows), rateRows(t.rows)], [n, counted]);
  /* the store side refuses the same, before its rate, writing nothing but the tally */
  const before = untallied(rows), was = tallied(rows);
  const s = await c.knock({ content: "x", knockerSecret: "short", sourceAddress: "9.9.9.9" });
  assert.deepEqual([s.reason, s.check], ["KNOCKER_SECRET_WEAK", "C-118.3"]);
  assert.deepEqual(untallied(rows), before, "nothing stored or counted");
  assert.equal(tallied(rows), was + 1, "but R80's tally");
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

test("R65 R69 R70 R32: a pull holds the bytes under their own digest, writes one doorbell receipt at knock:<id>, marks the knock pulled with the capture, by and instant, and answers the document with the knocker as its unnamed source and never the contact", async () => {
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
  assert.match(doc.provenance_chain[0].who, /^instance inst \(Civicsmith\/9\.9\.9\)$/, "acquisition R16 (DEC-124): the product named Civicsmith");
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
  const viaResolve = await c.inboxResolve({ knockId: k2.knockId, status: "pulled", by: "m1", reason: "a memo worth keeping" });
  assert.deepEqual([viaResolve.ok, viaResolve.existed, viaResolve.capture.sha256, viaResolve.document.source.pseudonym],
                   [true, false, sha("second memo"), null]);
  assert.equal(prov.receipts.length, 2);
  assert.equal(c.inboxGet(k2.knockId).item.capture_sha, sha("second memo"));
});

test("R65 (acquisition R16, DEC-124): a pull names the instance, Civicsmith and the version in its first hop, an unnamed instance and no version read as such; a knock pulled before T31 answers its document again with its who as written", async () => {
  const { c, rows } = setup();
  const k = await c.knock({ content: "renamed", sourceAddress: "5.5.5.9" });
  const r = await c.pullKnock({ knockId: k.knockId, by: "m1" });
  assert.equal(r.document.provenance_chain[0].who, "instance inst (Civicsmith/9.9.9)");
  assert.ok(!JSON.stringify(r.document).includes("CivicOS"), "the old name nowhere in a new pull's document");
  const bare = setup({ env: { INSTANCE_NAME: undefined, VERSION: undefined } });
  const kb = await bare.c.knock({ content: "unnamed", sourceAddress: "5.5.5.8" });
  assert.equal((await bare.c.pullKnock({ knockId: kb.knockId, by: "m1" })).document.provenance_chain[0].who, "instance unnamed (Civicsmith/0.0.0)");
  /* a pull made before T31: its stored document names CivicOS, and a repeat answers it as written, never re-worded */
  const k2 = await c.knock({ content: "pulled long ago", sourceAddress: "5.5.5.7" });
  const first = await c.pullKnock({ knockId: k2.knockId, by: "m1" });
  const old = structuredClone(first.document);
  old.provenance_chain[0].who = "instance inst (CivicOS/0.9.0)";
  rows(`UPDATE inbox SET pulled_document = ? WHERE knock_id = ?`, JSON.stringify(old), k2.knockId);
  const again = await c.pullKnock({ knockId: k2.knockId, by: "m2" });
  assert.deepEqual([again.existed, again.document.provenance_chain[0].who], [true, "instance inst (CivicOS/0.9.0)"]);
  assert.deepEqual(again.document, old, "the document as it was written, whole");
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
  c.inboxResolve({ knockId: k.knockId, status: "discarded", by: "m1", reason: "spam" });
  before = snap();
  b.held.delete(`bio/inbox/${sha("memo")}`);
  const disc = await c.pullKnock({ knockId: k.knockId, by: "m1" });
  const row = CAPTURE_CHECKS.KNOCK_DISCARDED;
  assert.deepEqual([disc.ok, disc.reason, disc.code, disc.check, disc.translation], [false, "KNOCK_DISCARDED", "KNOCK_DISCARDED", "C-118.4", row.translation],
                   "discarded is answered before the bytes are looked at");
  assert.deepEqual(snap(), before);
  c.inboxResolve({ knockId: k.knockId, status: "new", by: "m1", reason: "on second thought" });
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
  const c681 = INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED;
  assert.deepEqual([r4.code, r4.check, r4.translation, r4.status], ["EVIDENCE_STORAGE_NOT_CONFIGURED", "C-68.1", c681.translation, 503],
                   "R37 (K797): the installation's complaint carries its row, C-68.1, acquisition's");
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

test("R73 R69 (acquisition R16): a member session's capture names its actor, the member stamp, and is recorded as that member's capture; any other caller's is null", async () => {
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
  assert.equal(captureOps(c, new URL(`http://x/captureaccounts?capture=${d}&viewer=admin`), null, c.env).captureaccounts().accounts.length, 2);
});

test("R69 (N530): the account statement capture verifies over, and the names it exports, are signatures' own (its R41): one spelling, no copy of capture's", async () => {
  assert.equal(captureAccountStatement, signatures.captureAccountStatement, "the very function signatures provides");
  assert.equal(CAPTURE_ACCOUNT_TOKEN, signatures.CAPTURE_ACCOUNT_TOKEN);
  /* the account is verified over exactly signatures' bytes: a signature over them is admitted, over any other spelling refused */
  const { c, s } = setup();
  const d = H("c9");
  c.recordCaptureActor({ captureSha: d, actor: "m1" });
  const key = await newKey();
  signer(s, "m1", key.keyB64);
  const text = "Saved from the clerk's page.\nSecond line, kept as written.";
  const theirs = signatures.captureAccountStatement(d, text);
  assert.deepEqual([...theirs], [...new TextEncoder().encode(`bio-capture-account ${d}\n${text}`)]);
  assert.equal((await c.recordCaptureAccount({ captureSha: d, text, signature: await sshsign(key, `bio-capture-account ${d} \n${text}`, NS_RATIFY), by: "m1" })).reason,
               "SIG_BAD_SIGNATURE", "another spelling of the statement does not verify");
  assert.equal((await c.recordCaptureAccount({ captureSha: d, text, signature: await sshsign(key, theirs, NS_RATIFY), by: "m1" })).ok, true);
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

/* A world for R68: a held capture (or one held in parts, an acquisition receipt naming it), attestation's real `attest`
   (its R1–R3), and the network scripted: the timestamp authorities, the archive's save and its raw replay. */
function reWorld({ held = true, acquired = false } = {}) {
  const b = bucket();
  const gov = governor();
  const f = fresh({ evidence: b, gov, env: { INSTANCE_NAME: "i" } });
  const bytes = new TextEncoder().encode("the captured page");
  const d = sha(bytes);
  if (held) b.held.set(`bio/captures/${d}`, bytes);
  if (acquired) f.c.provenance = provenance(f.s, { acquired: [d] });
  return { ...f, b, gov, d, bytes };
}
const LOCATOR = "https://a.example/page";
const ARCHIVED = "https://web.archive.org/web/20260930110001/https://a.example/page";
const REPLAY = "https://web.archive.org/web/20260930110001id_/https://a.example/page";
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
/* `tsa`: each authority's answer in TSA_ENDPOINTS order (a status, or "granted": a token bound to `d`); `save`: the
   archived locator the archive's save answers, or null for a 523; `replay`: the raw replay's bytes, or null (a 404). */
const authorities = (d, { tsa = [], save = ARCHIVED, replay = null } = {}) => network((url) => {
  const i = TSA_ENDPOINTS.indexOf(url);
  if (i >= 0) return tsa[i] === "granted" ? new Response(granted(d)) : new Response("", { status: tsa[i] ?? 500 });
  if (url === ARCHIVE_SAVE_BASE + LOCATOR)
    return save ? new Response("", { headers: { "content-location": save.replace("https://web.archive.org", "") } }) : new Response("", { status: 523 });
  if (url === REPLAY && replay) return new Response(replay);
  return null;
});
const run = async (n, fn) => { try { return await fn(); } finally { n.restore(); } };

test("R68: reattest asks attestation's attest for a fresh timestamp over the digest and a fresh co-archive, through the governor; compares the co-archive's raw replay with the digest; appends each outcome late, dated, with what it proves", async () => {
  const w = reWorld();
  const net = authorities(w.d, { tsa: [500, "granted"], replay: w.bytes });
  const r = await run(net, () => w.c.reattest({ captureSha: w.d, locator: LOCATOR, by: "m1" }));
  assert.deepEqual([r.ok, r.attested], [true, true]);
  /* the authorities in order, stopping at the first bound token; then the co-archive; then its raw replay */
  assert.deepEqual(net.seen.map((x) => x.url), [TSA_ENDPOINTS[0], TSA_ENDPOINTS[1], ARCHIVE_SAVE_BASE + LOCATOR, REPLAY]);
  for (const x of net.seen.slice(0, 2)) assert.ok(Buffer.from(x.init.body).includes(Buffer.from(w.d, "hex")), "a fresh request over the capture digest");
  for (const u of [TSA_ENDPOINTS[0], TSA_ENDPOINTS[1], ARCHIVE_SAVE_BASE + LOCATOR, REPLAY])
    assert.ok(w.gov.calls.some((c) => c[0] === "admit" && c[1] === new URL(u).host), `through the host governor: ${u}`);
  const outs = r.late_attestations;
  assert.deepEqual(outs.map((o) => [o.kind, o.service, o.ok, o.late]),
                   [["timestamp", TSA_ENDPOINTS[0], false, true], ["timestamp", TSA_ENDPOINTS[1], true, true], ["co_archive", ARCHIVE_SERVICE, true, true]]);
  for (const o of outs) {
    assert.match(o.at, ISO, "dated by its own attempt");
    assert.equal(o.proves, `proves the bytes existed by ${o.at}, not at capture`);
  }
  assert.equal(outs[0].note, "http 500", "a failed attempt is kept with its reason");
  /* the token, stored under its own digest, is the attestation over this capture */
  const tok = outs[1];
  assert.match(tok.token_sha256, /^[0-9a-f]{64}$/);
  assert.equal(sha(w.b.held.get(`bio/captures/${tok.token_sha256}`)), tok.token_sha256);
  assert.deepEqual([r.attestation.over, r.attestation.sha256, r.attestation.kind], [w.d, tok.token_sha256, "rfc3161"]);
  const co = outs[2];
  assert.deepEqual([co.matches, co.archived_locator, co.replay, co.replay_sha256], [true, ARCHIVED, REPLAY, w.d]);
  assert.deepEqual(w.c.lateAttestationsOf(w.d).late_attestations.map((o) => [o.seq, o.by, o.kind, o.matches ?? null]),
                   [[1, "m1", "timestamp", null], [2, "m1", "timestamp", null], [3, "m1", "co_archive", true]], "appended in order");
  /* a replay of other bytes: false; no archived locator, or no replay: undetermined, with the reason */
  const w2 = reWorld();
  const r2 = await run(authorities(w2.d, { tsa: ["granted"], replay: "something else" }), () => w2.c.reattest({ captureSha: w2.d, locator: LOCATOR }));
  assert.deepEqual([r2.late_attestations[1].matches, r2.late_attestations[1].match_basis], [false, "the co-archive's replay holds other bytes than the capture"]);
  const w3 = reWorld();
  const n3 = authorities(w3.d, { tsa: ["granted"], save: null });
  const r3 = await run(n3, () => w3.c.reattest({ captureSha: w3.d, locator: LOCATOR }));
  assert.deepEqual([r3.late_attestations[1].kind, r3.late_attestations[1].ok, r3.late_attestations[1].note, r3.late_attestations[1].matches],
                   ["co_archive", false, "http 523", "undetermined"]);
  assert.ok(!n3.seen.some((x) => x.url.includes("id_/")), "no replay is fetched without an archived locator");
  const w4 = reWorld();
  const r4 = await run(authorities(w4.d, { tsa: ["granted"] }), () => w4.c.reattest({ captureSha: w4.d, locator: LOCATOR }));
  assert.deepEqual([r4.late_attestations[1].matches, r4.late_attestations[1].match_basis], ["undetermined", "the replay answered 404"]);
  /* no token from any authority: every failed attempt is still appended late; a second reattest appends after the first */
  const w5 = reWorld();
  const n5 = authorities(w5.d, { tsa: [500, 503, 502] });
  const r5 = await run(n5, async () => [await w5.c.reattest({ captureSha: w5.d }), await w5.c.reattest({ captureSha: w5.d, locator: "http://a.example/plain" })]);
  assert.deepEqual(r5.map((x) => [x.ok, x.attested]), [[true, false], [true, false]]);
  assert.deepEqual(r5[0].late_attestations.map((o) => [o.service, o.ok, o.note]),
                   TSA_ENDPOINTS.map((u, i) => [u, false, `http ${[500, 503, 502][i]}`]));
  assert.deepEqual(w5.c.lateAttestationsOf(w5.d).late_attestations.map((o) => o.seq), [1, 2, 3, 4, 5, 6]);
  assert.ok(!n5.seen.some((x) => x.url.startsWith(ARCHIVE_SAVE_BASE)), "with no public locator, no co-archive is asked");
});

test("R68 (R63): reattest refuses BAD_SHA, and R63's absence when no bytes are held; a capture held in parts counts when provenance holds its receipt", async () => {
  const w = reWorld();
  for (const bad of ["abc", "", null, 42]) assert.equal((await w.c.reattest({ captureSha: bad })).reason, "BAD_SHA");
  const gone = reWorld({ held: false });
  const ng = authorities(gone.d, { tsa: ["granted"] });
  const r = await run(ng, () => gone.c.reattest({ captureSha: gone.d }));
  const want = evidenceAbsent(gone.d, "bio").body;
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.sha256], [false, want.reason, want.code, want.check, want.translation, gone.d]);
  assert.deepEqual([ng.seen, gone.c.lateAttestationsOf(gone.d).late_attestations], [[], []], "nothing asked, nothing written");
  /* held in parts: no object under the digest, an acquisition receipt naming it; attestation's attest proceeds on it */
  const parts = reWorld({ held: false, acquired: true });
  const np = authorities(parts.d, { tsa: ["granted"] });
  const p = await run(np, () => parts.c.reattest({ captureSha: parts.d }));
  assert.deepEqual([p.ok, p.attested, p.late_attestations.length], [true, true, 1]);
  assert.deepEqual(np.seen.map((x) => x.url), [TSA_ENDPOINTS[0]]);
  const noStore = fresh({});
  assert.equal((await noStore.c.reattest({ captureSha: H("a") })).reason, "EVIDENCE_NOT_HELD", "with no evidence store no bytes are held");
  /* the routes: the stamp in the query names who asked */
  const rw = reWorld();
  const via = await run(authorities(rw.d, { tsa: ["granted"] }),
                        () => captureOps(rw.c, new URL("http://x/reattest?by=m9"), { captureSha: rw.d, by: "forged" }, rw.c.env).reattest());
  assert.equal(via.ok, true);
  assert.equal(captureOps(rw.c, new URL(`http://x/lateattestations?capture=${rw.d}`), null, rw.c.env).lateattestations().late_attestations[0].by, "m9");
});

test("R37: rows C-118.3–C-118.9 are in capture's own table with the translations the requirements state", () => {
  const want = {
    KNOCKER_SECRET_WEAK: ["C-118.3", "A knocker secret this short could be guessed, letting someone else continue your pseudonym. Use a longer one, or ask the doorbell to make one. Nothing was received. The group can see how often its doorbell turns people away."],
    KNOCK_DISCARDED: ["C-118.4", "This knock was set aside. Move it back to new before bringing it in. Nothing was written."],
    NOT_THE_CAPTURING_ACTOR: ["C-118.5", "An account of how a document was captured is added only by the member who captured it, and that is not you, or no member captured it. Nothing was written."],
    ACCOUNT_NO_TEXT: ["C-118.6", "An account of how you captured a document says what happened in your own words, and this one is empty. Write it. Nothing was written."],
    RESOLVE_NO_REASON: ["C-118.7", "Changing a knock's status records why, in your own words, and no reason was given, or it is longer than 2,000 characters. Write one. Nothing was written."],
    MACHINE_CANNOT_SET_ASIDE: ["C-118.8", "Setting held material aside, or bringing it back, is a member's own act, and no member made this request. Nothing was written."],
    SET_ASIDE_NO_REASON: ["C-118.9", "Setting held material aside, or bringing it back, records why, in your own words, and no reason was given, or it is longer than 2,000 characters. Write one. Nothing was written."],
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
  const others = () => everything(rows).filter(([t]) => !["knock_rate", "knock_key", ...TALLY].includes(t));
  const before = others();
  for (let i = 0; i < 4; i++) assert.equal(await c.knockAttempt({ sourceAddress: "6.6.6.6", now: t0 + i }), null);
  assert.equal(rateRows(rows), 8, "each admitted attempt counted in the source's window and the instance's");
  /* attempts and knocks share the windows: the fifth from this source is a knock, the sixth anything is refused */
  assert.equal((await c.knock({ content: "k", sourceAddress: "6.6.6.6", now: t0 + 20 })).ok, true);
  const counted = rateRows(rows);
  const r = await c.knockAttempt({ sourceAddress: "6.6.6.6", now: t0 + 30 });
  const row = (await import("../../../src/capture/checks.mjs")).KNOCK_CHECKS.RATE_IP;
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.stated], [false, "RATE_IP", "RATE_IP", row.check, row.translation, KNOCK.statedPerIp]);
  assert.equal(rateRows(rows), counted, "a refused attempt counts in no window");
  assert.equal(tallied(rows), 1, "R80: every refusal R71 answers is counted in the tally");
  assert.equal((await c.knock({ content: "k2", sourceAddress: "6.6.6.6", now: t0 + 40 })).reason, "RATE_IP", "and the knock after it is refused alike");
  assert.equal(await c.knockAttempt({ sourceAddress: "6.6.6.7", now: t0 + 50 }), null, "another source is unaffected");
  /* the instance's window */
  const g = setup();
  for (let i = 0; i < 10; i++) await g.c.knockAttempt({ sourceAddress: `10.1.0.${i}`, now: t0 });
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

/* N380 (K559): `within`, the seam that makes the pull and control-plane R36's promotion one act. A table of the test's
   own stands for what the caller writes: it lands or rolls back with the pull. */
test("R65 (N380): within is called with the pulled document inside the pull's own transaction; its answer rides beside the pull's, and what it writes lands with the pull", async () => {
  const { c, rows, s } = setup();
  s.db.exec(`CREATE TABLE promoted (knock TEXT, sha TEXT)`);
  const k = await c.knock({ content: "one act", note: "n", contact: "who@example.org", sourceAddress: "9.1.1.1" });
  const seen = [];
  const r = await c.pullKnock({ knockId: k.knockId, by: "m1", at: "2026-09-30T12:00:00Z", within: (doc) => {
    /* inside the transaction: the pull's own writes are already visible to the caller's act */
    seen.push({ doc, status: rows(`SELECT status FROM inbox WHERE knock_id = ?`, k.knockId)[0].status,
                receipts: rows(`SELECT count(*) n FROM captured_locators`)[0].n, actors: rows(`SELECT count(*) n FROM capture_actors`)[0].n });
    s.sql.exec(`INSERT INTO promoted VALUES (?, ?)`, k.knockId, doc.capture.sha256);
    return { ok: true, bundleId: "INFO-2026-0001-doorbell-knock" };
  } });
  assert.deepEqual([r.ok, r.existed, r.within], [true, false, { ok: true, bundleId: "INFO-2026-0001-doorbell-knock" }]);
  assert.equal(seen.length, 1, "called once");
  assert.deepEqual([seen[0].status, seen[0].receipts, seen[0].actors], ["pulled", 1, 1], "after the receipt, the knock's update and the actor");
  assert.deepEqual(seen[0].doc, r.document, "the pulled document, as the answer carries it");
  assert.ok(!JSON.stringify(seen[0].doc).includes("who@example.org"), "never the contact (R70)");
  assert.deepEqual(rows(`SELECT * FROM promoted`).map((x) => ({ ...x })), [{ knock: k.knockId, sha: sha("one act") }]);
  /* the caller's copy is its own: changing it changes neither the answer nor the stored document */
  const k2 = await c.knock({ content: "second", sourceAddress: "9.1.1.2" });
  const r2 = await c.pullKnock({ knockId: k2.knockId, by: "m1", within: (doc) => { doc.capture.actor = "someone else"; return { ok: true }; } });
  assert.equal(r2.document.capture.actor, "m1");
  assert.equal((await c.pullKnock({ knockId: k2.knockId, by: "m1" })).document.capture.actor, "m1");
  /* without within, the answer is as it was: no `within` key */
  const k3 = await c.knock({ content: "third", sourceAddress: "9.1.1.3" });
  assert.equal("within" in (await c.pullKnock({ knockId: k3.knockId, by: "m1" })), false);
  /* a knock already pulled does not call it: its pull is not being made */
  let called = 0;
  const again = await c.pullKnock({ knockId: k.knockId, by: "m1", within: () => { called++; return { ok: true }; } });
  assert.deepEqual([again.ok, again.existed, called, "within" in again], [true, true, 0, false]);
});

test("R65 (N380): within's refusal, its throw, or an answer that is not synchronous rolls the whole pull back: no receipt, the knock unchanged, no actor, nothing of the caller's; the knock is then pulled as ever", async () => {
  const { c, rows, s } = setup();
  s.db.exec(`CREATE TABLE promoted (knock TEXT)`);
  const k = await c.knock({ content: "rolled back", sourceAddress: "9.2.2.2" });
  const state = () => everything(rows);
  const before = state();
  const write = () => s.sql.exec(`INSERT INTO promoted VALUES (?)`, k.knockId);
  /* a refusal: the caller's own answer, with the knock named */
  const refused = await c.pullKnock({ knockId: k.knockId, by: "m1", within: () => { write(); return { ok: false, reason: "NO_GROUP_RECORDED", check: "C-64.1", status: 409 }; } });
  assert.deepEqual([refused.ok, refused.reason, refused.check, refused.status, refused.knockId], [false, "NO_GROUP_RECORDED", "C-64.1", 409, k.knockId]);
  assert.deepEqual(state(), before, "nothing written");
  /* a throw (of anything), and a promise: PULL_WITHIN_FAILED, 500, one fixed sentence (N409), nothing written */
  const fault = "promotion store fault: no such table: bundles_secret at /srv/plane/src/promotion/index.mjs:88";
  for (const within of [() => { write(); throw new Error(fault); }, () => { write(); throw fault; }, () => { throw { message: fault, stack: fault }; },
                        () => { throw undefined; }, async () => { write(); return { ok: true }; }, async () => { throw new Error(fault); }]) {
    const r = await c.pullKnock({ knockId: k.knockId, by: "m1", within });
    assert.deepEqual(r, { ok: false, reason: "PULL_WITHIN_FAILED", status: 500, knockId: k.knockId, detail: PULL_WITHIN_FAILED_DETAIL },
                     "the answer whole: no field carries what was thrown");
    assert.ok(!JSON.stringify(r).includes("bundles_secret") && !JSON.stringify(r).includes("/srv/"), "never the thrown message");
    assert.deepEqual(state(), before, "nothing written");
  }
  assert.equal(PULL_WITHIN_FAILED_DETAIL, "the act run with the pull did not complete, so the pull was rolled back and nothing was written");
  assert.equal(c.inboxGet(k.knockId).item.status, "new");
  /* a fault of the pull's own is not the caller's: it still throws, and nothing lands */
  const broken = setup();
  const kb = await broken.c.knock({ content: "own fault", sourceAddress: "9.2.2.3" });
  broken.s.db.exec(`CREATE TRIGGER no_actor BEFORE INSERT ON capture_actors BEGIN SELECT RAISE(ABORT, 'actor table down'); END`);
  await assert.rejects(broken.c.pullKnock({ knockId: kb.knockId, by: "m1", within: () => ({ ok: true }) }), /actor table down/);
  assert.equal(broken.c.inboxGet(kb.knockId).item.status, "new");
  /* and the knock, never pulled, is pulled now */
  const ok = await c.pullKnock({ knockId: k.knockId, by: "m1", within: () => { write(); return { ok: true }; } });
  assert.deepEqual([ok.ok, ok.existed, rows(`SELECT count(*) n FROM promoted`)[0].n], [true, false, 1]);
});

/* N388 (REC-30): the two capture reads that took no viewer. A project bundle hides its captures from a member who does
   not participate (membership R43, D-701's gate); an information bundle hides nothing from a member. */
function sightWorld() {
  const w = setup();
  const d = H("5a"), open = H("5b"), loose = H("5c");
  register(w.s, d, "PROJ-2026-0001", { type: "project" });
  register(w.s, open, "INFO-2026-0001");
  w.s.sql.exec(`INSERT INTO project_participants (project_id, member_id, state, created, updated) VALUES ('PROJ-2026-0001', 'm1', 'active', '2026-01-01', '2026-01-01')`);
  for (const m of ["m1", "m2"]) w.s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  for (const x of [d, open, loose]) {
    w.c.recordCaptureActor({ captureSha: x, actor: "m1", at: "2026-09-01T00:00:00Z" });
    w.s.sql.exec(`INSERT INTO capture_accounts (capture_sha, seq, by, text, signature, key_b64, at) VALUES (?, 1, 'm1', 'captured for the budget project', 'sig', 'key', '2026-09-02T00:00:00Z')`, x);
    w.s.sql.exec(`INSERT INTO late_attestations (capture_sha, seq, kind, service, ok, at, by, outcome) VALUES (?, 1, 'timestamp', 'tsa', 1, '2026-09-03T00:00:00Z', 'm1', ?)`,
                 x, JSON.stringify({ kind: "timestamp", service: "tsa", ok: true, at: "2026-09-03T00:00:00Z", late: true }));
  }
  return { ...w, d, open, loose };
}

test("R69 (N388, REC-30): captureAccountsOf answers by the caller's viewer through the capture's bundle: an unseen capture reads as an unknown one, a capture in no bundle is seen, an absent viewer sees nothing, and an in-process caller with no viewer reads whole", () => {
  const { c, d, open, loose } = sightWorld();
  const nothing = (x) => ({ captureSha: x, actors: [], accounts: [] });
  const sees = (x, viewer) => c.captureAccountsOf(x, { viewer }).accounts.length === 1;
  /* the participant, the founder, an administrator's machine credential: the project's capture is seen */
  for (const v of ["member:m1", "admin", "class:admin", "class:ai"]) assert.equal(sees(d, v), true, v);
  /* a member not in the project, and a viewer the gate does not recognise: nothing, exactly as for a capture never recorded */
  for (const v of ["member:m2", "", "junk", null]) {
    assert.deepEqual(c.captureAccountsOf(d, { viewer: v }), nothing(d), String(v));
    assert.deepEqual(c.captureAccountsOf(d, { viewer: v }), { ...c.captureAccountsOf(H("99"), { viewer: v }), captureSha: d }, "unseen reads as unknown");
  }
  /* an information bundle and a capture filed in no bundle: seen by every member */
  for (const x of [open, loose]) assert.equal(sees(x, "member:m2"), true, x);
  assert.deepEqual(c.captureAccountsOf(loose, { viewer: "junk" }), nothing(loose), "an unrecognised viewer sees nothing at all");
  /* in process, no viewer: whole (`case-disclosures` R3's pre-flight) */
  assert.equal(c.captureAccountsOf(d).accounts[0].text, "captured for the budget project");
  /* the route: the stamp decides, and an unstamped call sees nothing */
  const route = (q) => captureOps(c, new URL(`http://x/captureaccounts?capture=${d}${q}`), null, c.env).captureaccounts();
  assert.deepEqual([route("&viewer=member:m1").accounts.length, route("&viewer=member:m2").accounts.length, route("").accounts.length], [1, 0, 0]);
  assert.deepEqual(captureOps(c, new URL(`http://x/captureaccounts?viewer=member:m1`), { captureSha: d }, c.env).captureaccounts().actors.map((a) => a.actor), ["m1"]);
});

test("R68 (N388, REC-30): lateAttestationsOf takes no viewer: it names no bundle, so its rows about a capture stand for every reader, through the route whatever the stamp", () => {
  const { c, d } = sightWorld();
  const all = c.lateAttestationsOf(d).late_attestations;
  assert.deepEqual(all.map((o) => [o.seq, o.by, o.kind, o.late]), [[1, "m1", "timestamp", true]]);
  assert.ok(!JSON.stringify(all).includes("PROJ-"), "no bundle named");
  for (const q of ["", "&viewer=member:m2", "&viewer=junk"])
    assert.deepEqual(captureOps(c, new URL(`http://x/lateattestations?capture=${d}${q}`), null, c.env).lateattestations().late_attestations, all, q);
});

test("R68 (N388): a machine may reattest, as it may attest: the authority vouches, not the caller; the attempt is appended late with the machine's stamp as who asked, and no refusal names a fence", async () => {
  const w = reWorld();
  const net = authorities(w.d, { tsa: ["granted"] });
  await run(net, async () => {
    for (const by of ["class:ai", "class:probe", "class:admin"]) {
      const r = await captureOps(w.c, new URL(`http://x/reattest?by=${encodeURIComponent(by)}`), { captureSha: w.d }, w.c.env).reattest();
      assert.deepEqual([r.ok, r.attested, r.late_attestations.every((o) => o.late === true)], [true, true, true], by);
    }
  });
  assert.deepEqual(w.c.lateAttestationsOf(w.d).late_attestations.map((o) => o.by), ["class:ai", "class:probe", "class:admin"]);
  assert.deepEqual(net.seen.map((x) => x.url), TSA_ENDPOINTS.slice(0, 1).concat(TSA_ENDPOINTS.slice(0, 1), TSA_ENDPOINTS.slice(0, 1)),
                   "each asked attestation's attest afresh");
});
