/* capture: the doorbell (R30–R32, R47–R54, R56) at the module's interface: the op handler `knockOp` over a Durable
   Object stub that answers through the module's own routes (`captureOps`), and the store side beneath it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";
import { captureOps } from "../../../src/capture/index.mjs";
import { knockOp, KNOCK } from "../../../src/capture/doorbell.mjs";
import { KNOCK_CHECKS } from "../../../checks/bio-checks.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const requiredArgument = (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);
const helpers = { json, requiredArgument, storeSilent };

/* A Durable Object stub answering as the store's dispatcher does: `{ok: true, result}`. `calls` counts every call. */
function stubOf(c, env) {
  const calls = [];
  return { calls, async fetch(req) {
    const url = new URL(req.url); calls.push(url.pathname);
    const body = req.method === "POST" ? JSON.parse(await req.text() || "null") : null;
    const route = captureOps(c, url, body, env)[url.pathname.slice(1)];
    return json({ ok: true, result: await route() });
  } };
}
const knock = (payload, { ip = "203.0.113.1", method = "POST", raw = null } = {}) =>
  new Request("https://plane/?op=knock", { method, headers: { "cf-connecting-ip": ip },
    ...(method === "POST" ? { body: raw ?? JSON.stringify(payload) } : {}) });

function setup({ evidence = true, env = {} } = {}) {
  const b = evidence ? bucket() : null;
  const f = fresh({ evidence: b, env });
  const e = { ...f.c.env };
  const st = stubOf(f.c, e);
  return { ...f, b, env: e, st, send: async (req) => { const r = await knockOp(req, e, st, helpers); return { status: r.status, body: await r.json() }; } };
}
const inboxRows = (rows) => rows(`SELECT count(*) n FROM inbox`)[0].n;
const rateRows = (rows) => rows(`SELECT coalesce(sum(count),0) n FROM knock_rate`)[0].n;
const row = (code) => KNOCK_CHECKS[code];

test("R30 R54: anyone may knock with no account; an accepted knock answers 200 with the digest, the length and the sentence", async () => {
  const { send, rows, b } = setup();
  const r = await send(knock({ contentText: "a tip", note: "n", contact: "c" }));
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.body).sort(), ["bytes", "knockId", "ok", "received", "sha256"]);
  assert.equal(r.body.sha256, sha("a tip")); assert.equal(r.body.bytes, 5);
  assert.match(r.body.received, /inbox awaiting member review/);
  assert.match(r.body.knockId, /^KNOCK-\d{4}-\d{2}-\d{2}-[0-9a-f]{8}$/);
  assert.ok(b.held.has(`bio/inbox/${sha("a tip")}`));
  const b64 = await send(knock({ contentB64: Buffer.from([1, 2, 3]).toString("base64") }));
  assert.equal(b64.body.bytes, 3);
  assert.equal(inboxRows(rows), 2);
});

test("R53: knock is a POST; the refusals are tried in order and a refused knock writes no row, stores no bytes, counts in no window", async () => {
  const { send, rows, b, st } = setup();
  assert.equal((await send(knock(null, { method: "GET" }))).status, 405);
  /* envelope before JSON: an oversize body that is also not JSON */
  const env1 = await send(knock(null, { raw: "x".repeat(KNOCK.maxBytes + 4097) }));
  assert.equal(env1.body.reason, "KNOCK_ENVELOPE_TOO_LARGE");
  /* not JSON / no content string */
  assert.equal((await send(knock(null, { raw: "not json" }))).body.reason, "REQUIRED_ARGUMENT_MISSING");
  assert.equal((await send(knock({ contentB64: 5 }))).body.reason, "REQUIRED_ARGUMENT_MISSING");
  /* bad base64 names contentB64, before emptiness */
  const bad = await send(knock({ contentB64: "!!!" }));
  assert.deepEqual([bad.status, bad.body.reason, bad.body.argument], [400, "REQUIRED_ARGUMENT_MISSING", "contentB64"]);
  /* empty before oversize */
  assert.equal((await send(knock({ contentB64: "" }))).body.reason, "KNOCK_EMPTY");
  assert.deepEqual(st.calls, [], "none of these called the store");
  /* oversize before the rate */
  assert.equal((await send(knock({ contentText: "x".repeat(KNOCK.maxBytes + 1) }))).body.reason, "KNOCK_PAYLOAD_TOO_LARGE");
  assert.deepEqual([inboxRows(rows), rateRows(rows), b.held.size], [0, 0, 0]);
  /* the per-source rate before the instance rate (R48: over both is RATE_IP) */
  for (let i = 0; i < 12; i++) await send(knock({ contentText: `k${i}` }));
  const counted = rateRows(rows), held = b.held.size, n = inboxRows(rows);
  const r = await send(knock({ contentText: "thirteenth" }));
  assert.equal(r.body.reason, "RATE_IP");
  assert.deepEqual([rateRows(rows), b.held.size, inboxRows(rows)], [counted, held, n], "a refused knock changes nothing");
});

test("R31 R47: the per-source limit, by a two-bucket estimate counted with the write: RATE_IP 429 with the catalogue row and the stated bound", async () => {
  const { c, rows } = setup();
  const W = KNOCK.windowMs, t0 = 1000 * W;
  for (let i = 0; i < 12; i++) assert.equal((await c.knock({ content: `x${i}`, sourceAddress: "1.1.1.1", now: t0 + 10 })).ok, true);
  const r = await c.knock({ content: "y", sourceAddress: "1.1.1.1", now: t0 + 20 });
  assert.deepEqual([r.reason, r.code, r.check, r.translation], ["RATE_IP", "RATE_IP", row("RATE_IP").check, row("RATE_IP").translation]);
  assert.equal((await c.knock({ content: "z", sourceAddress: "2.2.2.2", now: t0 + 30 })).ok, true, "another source is unaffected");
  /* half a window on, the previous bucket weighs a half: twelve behind weigh six, so the source is served */
  assert.equal((await c.knock({ content: "later", sourceAddress: "1.1.1.1", now: t0 + W + W / 2 })).ok, true);
  /* a burst straddling the edge is held: six knocks in the last instant of a bucket and the estimate carries them */
  const t1 = 5000 * W;
  for (let i = 0; i < 12; i++) await c.knock({ content: `e${i}`, sourceAddress: "3.3.3.3", now: t1 + W - 1 });
  let admitted = 0;
  for (let i = 0; i < 12; i++) if ((await c.knock({ content: `f${i}`, sourceAddress: "3.3.3.3", now: t1 + W + 1 })).ok) admitted++;
  assert.ok(admitted <= 1, `the carried estimate holds the burst to the limit, not twice it (admitted ${admitted} more)`);
  /* the prune keeps the previous bucket */
  assert.ok(rows(`SELECT bucket FROM knock_rate`).some((x) => x.bucket.endsWith(`:${Math.floor((t1 + W - 1) / W)}`)));
  const { send } = setup();
  for (let i = 0; i < 12; i++) await send(knock({ contentText: `q${i}` }));
  const op = await send(knock({ contentText: "q13" }));
  assert.equal(op.status, 429); assert.equal(op.body.stated, KNOCK.statedPerIp);
  assert.equal(KNOCK.statedPerIp, "at most 12 knocks from one source in any 10 minutes, estimated by a sliding window");
});

test("R48: the instance limit, RATE_GLOBAL 429 with its row and stated bound, and nothing stored or counted", async () => {
  const { c, rows } = setup();
  const t0 = 2000 * KNOCK.windowMs;
  for (let i = 0; i < 300; i++) await c.knock({ content: `g${i}`, sourceAddress: `10.0.${i >> 8}.${i & 255}`, now: t0 });
  const before = [rateRows(rows), inboxRows(rows)];
  const r = await c.knock({ content: "g300", sourceAddress: "10.9.9.9", now: t0 });
  assert.deepEqual([r.reason, r.code, r.check, r.translation], ["RATE_GLOBAL", "RATE_GLOBAL", row("RATE_GLOBAL").check, row("RATE_GLOBAL").translation]);
  assert.deepEqual([rateRows(rows), inboxRows(rows)], before);
  assert.equal(KNOCK.statedGlobal, "at most 300 knocks to this instance in any 10 minutes, estimated by a sliding window");
  const s = setup();
  const stub = { async fetch() { return json({ ok: true, result: Object.assign(await c.knock({ content: "g301", sourceAddress: "10.9.9.8", now: t0 })) }); } };
  const resp = await knockOp(knock({ contentText: "g301" }), s.env, stub, helpers);
  assert.equal(resp.status, 429); assert.equal((await resp.json()).stated, KNOCK.statedGlobal);
});

test("R49: an envelope over 8 MiB + 4 KiB is refused 413 before it is parsed, with its row and maxBytes, and the store is not called", async () => {
  const { send, st } = setup();
  const r = await send(knock(null, { raw: "{" + "x".repeat(KNOCK.maxBytes + 4096) }));
  assert.equal(r.status, 413);
  assert.deepEqual([r.body.reason, r.body.code, r.body.check, r.body.translation, r.body.maxBytes],
                   ["KNOCK_ENVELOPE_TOO_LARGE", "KNOCK_ENVELOPE_TOO_LARGE", row("KNOCK_ENVELOPE_TOO_LARGE").check,
                    row("KNOCK_ENVELOPE_TOO_LARGE").translation, 8 * 1024 * 1024]);
  assert.deepEqual(st.calls, []);
  assert.equal((await send(knock(null, { raw: JSON.stringify({ contentText: "x".repeat(KNOCK.maxBytes + 4000) }) }))).body.reason,
               "KNOCK_PAYLOAD_TOO_LARGE", "just under the envelope is read");
});

test("R50: decoded content over the cap this instance applies is refused 413 with maxBytes, the detail only without an evidence store", async () => {
  const withEv = setup();
  const r = await withEv.send(knock({ contentText: "x".repeat(KNOCK.maxBytes + 1) }));
  assert.equal(r.status, 413);
  assert.deepEqual([r.body.reason, r.body.check, r.body.translation, r.body.maxBytes, r.body.detail],
                   ["KNOCK_PAYLOAD_TOO_LARGE", row("KNOCK_PAYLOAD_TOO_LARGE").check, row("KNOCK_PAYLOAD_TOO_LARGE").translation, 8 * 1024 * 1024, undefined]);
  assert.equal((await withEv.send(knock({ contentText: "x".repeat(64 * 1024 + 1) }))).status, 200, "64 KiB is no limit with evidence storage");
  const inline = setup({ evidence: false });
  const s = await inline.send(knock({ contentText: "x".repeat(64 * 1024 + 1) }));
  assert.deepEqual([s.status, s.body.maxBytes], [413, 64 * 1024]);
  assert.match(s.body.detail, /evidence storage configured/);
  assert.deepEqual(inline.st.calls, [], "the store is not called");
  const ok = await inline.send(knock({ contentText: "small" }));
  assert.equal(ok.status, 200);
  assert.equal(inline.rows(`SELECT content, in_r2 FROM inbox`)[0].content, "small", "stored inline without evidence storage");
});

test("R51: content that decodes to zero bytes is refused 400 KNOCK_EMPTY with its row, and the store is not called", async () => {
  const { send, st } = setup();
  for (const p of [{ contentText: "" }, { contentB64: "" }]) {
    const r = await send(knock(p));
    assert.deepEqual([r.status, r.body.reason, r.body.code, r.body.check, r.body.translation],
                     [400, "KNOCK_EMPTY", "KNOCK_EMPTY", row("KNOCK_EMPTY").check, row("KNOCK_EMPTY").translation]);
  }
  assert.deepEqual(st.calls, []);
});

test("R52: a C-85 translation is the row's sentence, names no figure, and a code with no row fails as an internal error", async () => {
  for (const code of ["RATE_IP", "RATE_GLOBAL", "KNOCK_ENVELOPE_TOO_LARGE", "KNOCK_PAYLOAD_TOO_LARGE", "KNOCK_EMPTY"]) {
    assert.equal(typeof row(code).translation, "string");
    assert.ok(!/\d/.test(row(code).translation), `${code}'s translation names no figure`);
  }
  const { c } = setup();
  const saved = KNOCK_CHECKS.RATE_IP;
  try {
    delete KNOCK_CHECKS.RATE_IP;
    for (let i = 0; i < 12; i++) await c.knock({ content: `x${i}`, sourceAddress: "4.4.4.4", now: 7 * KNOCK.windowMs });
    await assert.rejects(c.knock({ content: "y", sourceAddress: "4.4.4.4", now: 7 * KNOCK.windowMs }), /no KNOCK_CHECKS row/);
  } finally { KNOCK_CHECKS.RATE_IP = saved; }
  const { send } = setup();
  const r = await send(knock({ contentText: "" }));
  assert.equal(r.body.translation, row("KNOCK_EMPTY").translation);
});

test("R32: one inbox row with the bounded note and contact and the bytes under bio/inbox/<digest>; members resolve with who and when; BAD_STATUS", async () => {
  const { c, rows, b } = setup();
  const before = rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name).filter((t) => !["inbox", "knock_rate", "knock_key"].includes(t))
    .map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);
  const k = await c.knock({ content: "hello", note: "n".repeat(3000), contact: "c".repeat(400), sourceAddress: "5.5.5.5" });
  const after = rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name).filter((t) => !["inbox", "knock_rate", "knock_key"].includes(t))
    .map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);
  assert.deepEqual(after, before, "nothing else changes: not a capture, not a bundle");
  const r = rows(`SELECT * FROM inbox`)[0];
  assert.deepEqual([r.knock_id, r.sha256, r.bytes, r.note.length, r.contact.length, r.status, r.in_r2], [k.knockId, sha("hello"), 5, 2000, 300, "new", 1]);
  assert.ok(b.held.has(`bio/inbox/${sha("hello")}`));
  assert.equal(c.inboxList("new").inbox.length, 1);
  assert.equal(c.inboxGet(k.knockId).item.sha256, sha("hello"));
  assert.equal(c.inboxGet("KNOCK-none").reason, "NOT_FOUND");
  assert.equal(c.inboxResolve({ knockId: k.knockId, status: "archived", by: "member:m" }).reason, "BAD_STATUS");
  for (const st of ["pulled", "discarded", "new"]) assert.equal(c.inboxResolve({ knockId: k.knockId, status: st, by: "member:m" }).ok, true);
  const res = rows(`SELECT status, resolved, resolved_by FROM inbox`)[0];
  assert.deepEqual([res.status, res.resolved_by, typeof res.resolved], ["new", "member:m", "string"]);
  assert.equal(c.inboxList("pulled").inbox.length, 0);
});

test("R54: the answer comes only after the bytes are held, and when they cannot be stored the knock fails and leaves no row", async () => {
  const { send, rows, b } = setup();
  b.failPut = true;
  const r = await send(knock({ contentText: "cannot store" }));
  assert.ok(r.status >= 500); assert.equal(r.body.ok, false);
  assert.equal(inboxRows(rows), 0, "no row without its bytes");
  assert.equal(rateRows(rows), 0, "and nothing counted");
  b.failPut = false;
  const ok = await send(knock({ contentText: "stored" }));
  assert.equal(ok.status, 200);
  assert.ok(b.calls.findIndex((x) => x[0] === "put") >= 0);
});

test("R56: the source is a keyed digest of the address, never the address or an unkeyed hash; keys differ per instance or per bound secret", async () => {
  const one = setup(), two = setup();
  const f1 = await one.c.sourceFingerprint("198.51.100.7"), f1b = await one.c.sourceFingerprint("198.51.100.7");
  const f2 = await two.c.sourceFingerprint("198.51.100.7");
  assert.equal(f1, f1b, "stable within an instance");
  assert.notEqual(f1, f2, "each instance holds its own key");
  assert.ok(!f1.includes("198") && f1 !== sha("198.51.100.7").slice(0, f1.length) && f1 !== sha("198.51.100.7").slice(0, 16));
  await one.c.knock({ content: "k", sourceAddress: "198.51.100.7" });
  const buckets = one.rows(`SELECT bucket FROM knock_rate`).map((r) => r.bucket).join(" ");
  assert.ok(!buckets.includes("198.51") && !buckets.includes(sha("198.51.100.7").slice(0, 16)), "no bucket carries the address or its unkeyed hash");
  assert.ok(buckets.includes(f1));
  const bound = setup({ env: { KNOCK_FINGERPRINT_KEY: "operator-secret" } });
  const bound2 = setup({ env: { KNOCK_FINGERPRINT_KEY: "operator-secret" } });
  assert.equal(await bound.c.sourceFingerprint("198.51.100.7"), await bound2.c.sourceFingerprint("198.51.100.7"), "the operator's secret decides it");
  assert.equal(bound.rows(`SELECT count(*) n FROM knock_key`)[0].n, 0, "no instance key is generated when one is bound");
});
