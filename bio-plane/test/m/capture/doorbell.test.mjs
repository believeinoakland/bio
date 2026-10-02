/* capture: the doorbell (R30–R32, R47–R54, R56) at the module's interface: the op handler `knockOp` over a Durable
   Object stub that answers through the module's own routes (`captureOps`), and the store side beneath it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { fresh, bucket, sha } from "./fixture.mjs";
import { captureOps } from "../../../src/capture/index.mjs";
import { knockOp, KNOCK } from "../../../src/capture/doorbell.mjs";
import { CAPTURE_CHECKS, KNOCK_CHECKS } from "../../../src/capture/checks.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const requiredArgument = (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);
/* The control plane's envelope reader (index.mjs `doAnswer`), as it is handed to the ops (N247). */
const doAnswer = async (res) => { let out = null; try { out = await (await res).json(); } catch { out = null; }
  return out && out.ok === true ? { answered: true, result: out.result } : { answered: false, result: undefined }; };
const helpers = { json, requiredArgument, storeSilent, doAnswer };

/* A Durable Object stub answering as control-plane's `dispatch` does over the plane's route map: `{ok: true, result}`.
   `calls` counts every call. */
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
/* R80: the doorbell's tally, every day's refusals summed. */
const tallied = (rows) => rows(`SELECT coalesce(sum(refused),0) n FROM doorbell_tally`)[0].n;
/* The store calls a refusal before the store makes: only the tally's count (R80), never a knock. */
const onlyCounts = (st) => st.calls.every((p) => p === "/doorbellrefused");
const row = (code) => KNOCK_CHECKS[code];

test("R30 R54: anyone may knock with no account; an accepted knock answers 200 with the digest, the length and the sentence", async () => {
  const { send, rows, b } = setup();
  const r = await send(knock({ contentText: "a tip", note: "n", contact: "c" }));
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.body).sort(), ["bytes", "knockId", "ok", "pseudonym", "received", "sha256"]);
  assert.equal(r.body.pseudonym, null, "R54 (N364): no knocker secret, no pseudonym, and no secret shown");
  assert.equal(r.body.sha256, sha("a tip")); assert.equal(r.body.bytes, 5);
  assert.match(r.body.received, /inbox awaiting member review/);
  assert.match(r.body.knockId, /^KNOCK-\d{4}-\d{2}-\d{2}-[0-9a-f]{8}$/);
  assert.ok(b.held.has(`bio/inbox/${sha("a tip")}`));
  const b64 = await send(knock({ contentB64: Buffer.from([1, 2, 3]).toString("base64") }));
  assert.equal(b64.body.bytes, 3);
  assert.equal(inboxRows(rows), 2);
});

test("R54 (N247): the store's answer is opened only through the control plane's doAnswer; a store that does not answer is silence, never a rate refusal or an acceptance", async () => {
  const { st, env, rows } = setup();
  const opened = [];
  const spy = async (res) => { const r = await doAnswer(res); opened.push(r); return r; };
  const ok = await knockOp(knock({ contentText: "through the reader" }), env, st, { ...helpers, doAnswer: spy });
  assert.equal(ok.status, 200);
  assert.deepEqual([opened.length, opened[0].answered, opened[0].result.ok], [1, true, true], "the one envelope, opened by the reader handed in");
  for (const stub of [{ fetch: async () => json({ ok: false }, 500) }, { fetch: async () => new Response("not json") },
                      { fetch: async () => { throw new Error("down"); } }]) {
    const r = await knockOp(knock({ contentText: "x" }), env, stub, helpers);
    assert.deepEqual([r.status, (await r.json()).reason], [502, "STORE_DID_NOT_ANSWER"]);
  }
  assert.equal(inboxRows(rows), 1);
});

test("R53 R80: knock is a POST; the refusals are tried in order and a refused knock writes no row, stores no bytes, counts in no window, and is counted in the tally alone", async () => {
  const { send, rows, b, st } = setup();
  assert.equal((await send(knock(null, { method: "GET" }))).status, 405);
  assert.deepEqual([st.calls.length, tallied(rows)], [0, 0], "a method other than POST is not a knock and is not counted");
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
  assert.ok(onlyCounts(st), "none of these asked the store to keep anything; each was only counted");
  /* oversize before the rate */
  assert.equal((await send(knock({ contentText: "x".repeat(KNOCK.maxBytes + 1) }))).body.reason, "KNOCK_PAYLOAD_TOO_LARGE");
  assert.deepEqual([inboxRows(rows), rateRows(rows), b.held.size, tallied(rows)], [0, 0, 0, 6], "six refusals, each counted once in the tally");
  /* the per-source rate before the instance rate (R48: over both is RATE_IP) */
  for (let i = 0; i < 5; i++) await send(knock({ contentText: `k${i}` }));
  const counted = rateRows(rows), held = b.held.size, n = inboxRows(rows);
  const r = await send(knock({ contentText: "sixth" }));
  assert.equal(r.body.reason, "RATE_IP");
  assert.deepEqual([rateRows(rows), b.held.size, inboxRows(rows), tallied(rows)], [counted, held, n, 7], "a refused knock changes nothing but the tally");
  /* one knock tripping two refusals at once answers the earlier: empty content with a weak secret is KNOCK_EMPTY */
  assert.equal((await send(knock({ contentText: "", knockerSecret: "short" }))).body.reason, "KNOCK_EMPTY");
  /* negative control: an admitted knock is not counted in the tally */
  const t = setup();
  assert.equal((await t.send(knock({ contentText: "fine" }))).status, 200);
  assert.equal(tallied(t.rows), 0);
});

test("R31 R47: the per-source limit of 5, by a two-bucket estimate counted with the write: RATE_IP 429 with the catalogue row and the stated bound", async () => {
  const { c, rows } = setup();
  const W = KNOCK.windowMs, t0 = 1000 * W;
  assert.deepEqual([KNOCK.perIp, KNOCK.global, KNOCK.windowMs], [5, 10, 10 * 60 * 1000], "DEC-108 (3): 5 per source, 10 in all, in any 10 minutes");
  for (let i = 0; i < 5; i++) assert.equal((await c.knock({ content: `x${i}`, sourceAddress: "1.1.1.1", now: t0 + 10 })).ok, true);
  const r = await c.knock({ content: "y", sourceAddress: "1.1.1.1", now: t0 + 20 });
  assert.deepEqual([r.reason, r.code, r.check, r.translation], ["RATE_IP", "RATE_IP", row("RATE_IP").check, row("RATE_IP").translation]);
  assert.equal((await c.knock({ content: "z", sourceAddress: "2.2.2.2", now: t0 + 30 })).ok, true, "another source is unaffected");
  /* half a window on, the previous bucket weighs a half: five behind weigh two and a half, so the source is served */
  assert.equal((await c.knock({ content: "later", sourceAddress: "1.1.1.1", now: t0 + W + W / 2 })).ok, true);
  /* a burst straddling the edge is held: six knocks in the last instant of a bucket and the estimate carries them */
  const t1 = 5000 * W;
  for (let i = 0; i < 5; i++) await c.knock({ content: `e${i}`, sourceAddress: "3.3.3.3", now: t1 + W - 1 });
  let admitted = 0;
  for (let i = 0; i < 5; i++) if ((await c.knock({ content: `f${i}`, sourceAddress: "3.3.3.3", now: t1 + W + 1 })).ok) admitted++;
  assert.ok(admitted <= 1, `the carried estimate holds the burst to the limit, not twice it (admitted ${admitted} more)`);
  /* the prune keeps the previous bucket */
  assert.ok(rows(`SELECT bucket FROM knock_rate`).some((x) => x.bucket.endsWith(`:${Math.floor((t1 + W - 1) / W)}`)));
  const { send } = setup();
  for (let i = 0; i < 5; i++) await send(knock({ contentText: `q${i}` }));
  const op = await send(knock({ contentText: "q6" }));
  assert.equal(op.status, 429); assert.equal(op.body.stated, KNOCK.statedPerIp);
  assert.equal(KNOCK.statedPerIp, "at most 5 knocks from one source in any 10 minutes, estimated by a sliding window");
  /* negative control: the fifth knock of a source is admitted, the sixth refused */
  const n = setup();
  for (let i = 0; i < 4; i++) await n.c.knock({ content: `n${i}`, sourceAddress: "8.8.8.8", now: t0 });
  assert.equal((await n.c.knock({ content: "n4", sourceAddress: "8.8.8.8", now: t0 })).ok, true, "the fifth is within the limit");
  assert.equal((await n.c.knock({ content: "n5", sourceAddress: "8.8.8.8", now: t0 })).reason, "RATE_IP", "the sixth is refused");
});

test("R48: the instance limit of 10, RATE_GLOBAL 429 with its row and stated bound, and nothing stored or counted but the tally", async () => {
  const { c, rows } = setup();
  const t0 = 2000 * KNOCK.windowMs;
  for (let i = 0; i < 10; i++) assert.equal((await c.knock({ content: `g${i}`, sourceAddress: `10.0.0.${i}`, now: t0 })).ok, true, "the tenth is within the limit");
  const before = [rateRows(rows), inboxRows(rows)];
  const r = await c.knock({ content: "g10", sourceAddress: "10.9.9.9", now: t0 });
  assert.deepEqual([r.reason, r.code, r.check, r.translation], ["RATE_GLOBAL", "RATE_GLOBAL", row("RATE_GLOBAL").check, row("RATE_GLOBAL").translation]);
  assert.deepEqual([rateRows(rows), inboxRows(rows), tallied(rows)], [...before, 1]);
  assert.equal(KNOCK.statedGlobal, "at most 10 knocks to this instance in any 10 minutes, estimated by a sliding window");
  /* a source over its own limit and the instance's is RATE_IP */
  const both = setup();
  for (let i = 0; i < 5; i++) await both.c.knock({ content: `h${i}`, sourceAddress: "10.1.0.1", now: t0 });
  for (let i = 0; i < 5; i++) await both.c.knock({ content: `o${i}`, sourceAddress: `10.1.1.${i}`, now: t0 });
  assert.equal((await both.c.knock({ content: "h5", sourceAddress: "10.1.0.1", now: t0 })).reason, "RATE_IP");
  const s = setup();
  const stub = { async fetch() { return json({ ok: true, result: Object.assign(await c.knock({ content: "g11", sourceAddress: "10.9.9.8", now: t0 })) }); } };
  const resp = await knockOp(knock({ contentText: "g11" }), s.env, stub, helpers);
  assert.equal(resp.status, 429); assert.equal((await resp.json()).stated, KNOCK.statedGlobal);
});

test("R49: an envelope over 8 MiB + 4 KiB is refused 413 before it is parsed, with its row and maxBytes, and the store is asked only to count it (R80)", async () => {
  const { send, st } = setup();
  const r = await send(knock(null, { raw: "{" + "x".repeat(KNOCK.maxBytes + 4096) }));
  assert.equal(r.status, 413);
  assert.deepEqual([r.body.reason, r.body.code, r.body.check, r.body.translation, r.body.maxBytes],
                   ["KNOCK_ENVELOPE_TOO_LARGE", "KNOCK_ENVELOPE_TOO_LARGE", row("KNOCK_ENVELOPE_TOO_LARGE").check,
                    row("KNOCK_ENVELOPE_TOO_LARGE").translation, 8 * 1024 * 1024]);
  assert.deepEqual(st.calls, ["/doorbellrefused"], "only the tally's count");
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
  assert.ok(onlyCounts(inline.st), "the store is asked only to count it");
  const ok = await inline.send(knock({ contentText: "small" }));
  assert.equal(ok.status, 200);
  assert.equal(inline.rows(`SELECT content, in_r2 FROM inbox`)[0].content, "small", "stored inline without evidence storage");
});

test("R51: content that decodes to zero bytes is refused 400 KNOCK_EMPTY with its row, and the store is asked only to count it (R80)", async () => {
  const { send, st } = setup();
  for (const p of [{ contentText: "" }, { contentB64: "" }]) {
    const r = await send(knock(p));
    assert.deepEqual([r.status, r.body.reason, r.body.code, r.body.check, r.body.translation],
                     [400, "KNOCK_EMPTY", "KNOCK_EMPTY", row("KNOCK_EMPTY").check, row("KNOCK_EMPTY").translation]);
  }
  assert.deepEqual(st.calls, ["/doorbellrefused", "/doorbellrefused"], "only the tally's counts");
});

test("R37 R47 R48 R49 R50 R51 (K649): C-85's five rows are in this module's own table, each with its check, its where naming the one site that mints it, and a translation", () => {
  const want = { RATE_IP: ["C-85.1", "src/capture/index.mjs #knockRateRefusal > is-knock-rate"],
                 RATE_GLOBAL: ["C-85.2", "src/capture/index.mjs #knockRateRefusal > is-knock-rate"],
                 KNOCK_ENVELOPE_TOO_LARGE: ["C-85.3", "src/capture/doorbell.mjs knockEnvelopeTooLarge > is-knock-envelope-too-large"],
                 KNOCK_PAYLOAD_TOO_LARGE: ["C-85.4", "src/capture/doorbell.mjs knockPayloadTooLarge > is-knock-payload-too-large"],
                 KNOCK_EMPTY: ["C-85.5", "src/capture/doorbell.mjs knockEmpty > is-knock-empty"] };
  assert.deepEqual(Object.keys(KNOCK_CHECKS).sort(), Object.keys(want).sort(), "the five rows, and no other");
  for (const [code, [check, where]] of Object.entries(want)) {
    assert.deepEqual([KNOCK_CHECKS[code].check, KNOCK_CHECKS[code].where], [check, where], code);
    assert.ok(typeof KNOCK_CHECKS[code].translation === "string" && KNOCK_CHECKS[code].translation.length > 40, code);
  }
  const ids = Object.values(KNOCK_CHECKS).map((r) => r.check);
  assert.ok(!Object.values(CAPTURE_CHECKS).some((r) => ids.includes(r.check)), "no id held twice in this module's tables");
});

test("R52: a C-85 translation is the row's sentence, names no figure, says the group can see how often its doorbell turns people away, and a code with no row fails as an internal error", async () => {
  const SEEN = "The group can see how often its doorbell turns people away.";
  for (const code of ["RATE_IP", "RATE_GLOBAL", "KNOCK_ENVELOPE_TOO_LARGE", "KNOCK_PAYLOAD_TOO_LARGE", "KNOCK_EMPTY"]) {
    assert.equal(typeof row(code).translation, "string");
    assert.ok(!/\d/.test(row(code).translation), `${code}'s translation names no figure`);
    assert.ok(row(code).translation.includes(SEEN), `${code} says the group can see how often it turns people away`);
  }
  assert.ok(CAPTURE_CHECKS.KNOCKER_SECRET_WEAK.translation.includes(SEEN), "C-118.3 too");
  for (const code of ["RATE_IP", "RATE_GLOBAL"])
    assert.ok(row(code).translation.startsWith("Your material was not received."), `${code} begins with what happened`);
  assert.ok(!/saturated/.test(row("RATE_GLOBAL").translation), "the saturation sentence is replaced");
  /* the knocker receives these words through the op */
  const w = setup();
  for (let i = 0; i < 5; i++) await w.send(knock({ contentText: `s${i}` }));
  assert.ok((await w.send(knock({ contentText: "s5" }))).body.translation.includes(SEEN));
  const { c } = setup();
  const saved = KNOCK_CHECKS.RATE_IP;
  try {
    delete KNOCK_CHECKS.RATE_IP;
    for (let i = 0; i < 5; i++) await c.knock({ content: `x${i}`, sourceAddress: "4.4.4.4", now: 7 * KNOCK.windowMs });
    await assert.rejects(c.knock({ content: "y", sourceAddress: "4.4.4.4", now: 7 * KNOCK.windowMs }), /no KNOCK_CHECKS row/);
  } finally { KNOCK_CHECKS.RATE_IP = saved; }
  const { send } = setup();
  const r = await send(knock({ contentText: "" }));
  assert.equal(r.body.translation, row("KNOCK_EMPTY").translation);
});

test("R32: one inbox row with the bounded note and contact and the bytes under bio/inbox/<digest>; members resolve with who, when and their reason; BAD_STATUS", async () => {
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
  assert.equal(c.inboxGet("KNOCK-none").reason, "NO_SUCH_KNOCK");
  assert.equal(c.inboxResolve({ knockId: k.knockId, status: "archived", by: "member:m", reason: "r" }).reason, "BAD_STATUS");
  for (const st of ["discarded", "new"]) assert.equal(c.inboxResolve({ knockId: k.knockId, status: st, by: "member:m", reason: `to ${st}` }).ok, true);
  const res = rows(`SELECT status, resolved, resolved_by, resolve_reason FROM inbox`)[0];
  assert.deepEqual([res.status, res.resolved_by, typeof res.resolved, res.resolve_reason], ["new", "member:m", "string", "to new"]);
  assert.equal(c.inboxList("pulled").inbox.length, 0);
  /* N364: `pulled` is R65's act (knocker.test.mjs): the resolve answers as the pull does */
  const pulled = await c.inboxResolve({ knockId: k.knockId, status: "pulled", by: "member:m", reason: "worth bringing in" });
  assert.deepEqual([pulled.ok, pulled.existed, pulled.capture.sha256], [true, false, sha("hello")]);
  assert.equal(c.inboxList("pulled").inbox.length, 1);
});

test("R32 (K383): a knock id no knock answers to, read or resolved, is NO_SUCH_KNOCK with its own row, the same answer both ways, and nothing is written", async () => {
  const { c, rows } = setup();
  const k = await c.knock({ content: "hello", sourceAddress: "6.6.6.6" });
  const row = CAPTURE_CHECKS.NO_SUCH_KNOCK;
  assert.deepEqual([row.check, row.translation], ["C-118.2", "No knock in the inbox answers to this id. Nothing was changed."]);
  assert.match(row.where, /^src\/capture\/index\.mjs #noSuchKnock > /);
  assert.notEqual(row.check, CAPTURE_CHECKS.EVIDENCE_NOT_HELD.check, "not R63's row");
  const snapshot = () => rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((r) => r.name)
    .map((t) => [t, JSON.stringify(rows(`SELECT * FROM ${t}`))]);
  const before = snapshot();
  const want = { ok: false, reason: "NO_SUCH_KNOCK", code: "NO_SUCH_KNOCK", check: "C-118.2", translation: row.translation,
                 knockId: "KNOCK-none" };
  assert.deepEqual(c.inboxGet("KNOCK-none"), want);
  for (const st of ["pulled", "discarded", "new"])
    for (const reason of ["a reason", undefined])
      assert.deepEqual(c.inboxResolve({ knockId: "KNOCK-none", status: st, by: "member:m", reason }), want, `resolve to ${st}: before the reason`);
  for (const bad of [undefined, null, "", 42, {}]) {
    assert.deepEqual(c.inboxGet(bad), { ...want, knockId: typeof bad === "string" ? bad : null });
    assert.deepEqual(c.inboxResolve({ knockId: bad, status: "pulled", by: "member:m", reason: "r" }), c.inboxGet(bad));
  }
  const ops = captureOps(c, new URL("http://x/inboxget?id=KNOCK-none"), { knockId: "KNOCK-none", status: "pulled", by: "member:m", reason: "r" }, {});
  assert.deepEqual([ops.inboxget(), ops.inboxresolve()], [want, want], "the routes answer the same");
  assert.deepEqual(snapshot(), before, "nothing written");
  assert.equal(c.inboxGet(k.knockId).ok, true, "a held knock is still read");
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
  /* K1020: a digest is hex, so the dotted address can never appear in it; what proves it keyed is that it is not the
     unkeyed hash, and (below) that it is exactly the HMAC under the bound key and changes with the key. */
  assert.ok(/^[0-9a-f]{32}$/.test(f1) && !f1.includes("198.51.100.7"));
  assert.ok(f1 !== sha("198.51.100.7").slice(0, f1.length) && !sha("198.51.100.7").includes(f1), "not an unkeyed hash");
  await one.c.knock({ content: "k", sourceAddress: "198.51.100.7" });
  const buckets = one.rows(`SELECT bucket FROM knock_rate`).map((r) => r.bucket).join(" ");
  assert.ok(!buckets.includes("198.51") && !buckets.includes(sha("198.51.100.7").slice(0, 16)), "no bucket carries the address or its unkeyed hash");
  assert.ok(buckets.includes(f1));
  const bound = setup({ env: { KNOCK_FINGERPRINT_KEY: "operator-secret" } });
  const bound2 = setup({ env: { KNOCK_FINGERPRINT_KEY: "operator-secret" } });
  assert.equal(await bound.c.sourceFingerprint("198.51.100.7"), await bound2.c.sourceFingerprint("198.51.100.7"), "the operator's secret decides it");
  assert.equal(bound.rows(`SELECT count(*) n FROM knock_key`)[0].n, 0, "no instance key is generated when one is bound");
  const hmac = createHmac("sha256", "operator-secret").update("198.51.100.7").digest("hex").slice(0, 32);
  assert.equal(await bound.c.sourceFingerprint("198.51.100.7"), hmac, "HMAC-SHA-256 of the address under the key");
  /* negative control: another key, another fingerprint of the same address */
  const other = setup({ env: { KNOCK_FINGERPRINT_KEY: "another-secret" } });
  assert.notEqual(await other.c.sourceFingerprint("198.51.100.7"), hmac);
});
