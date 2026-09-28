/* capture: the op handlers at the module's interface (ops.mjs): op=capture (R21), op=links (R27, R29, with the
   control plane's viewer stamp) and op=acquire's forward (R42, K72 (8), N103). The control plane's
   envelope helpers are stand-ins; the Durable Object stub answers through the module's own routes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha, receipt, register, network } from "./fixture.mjs";
import { captureOps } from "../../../src/capture/index.mjs";
import { captureObjectOp, linksOp, acquireOp, withReading } from "../../../src/capture/ops.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const requiredArgument = (op, argument, shape, error) => ({ reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, error });
const storageAbsent = (op, error) => json({ ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED", op, error }, 503);
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);
const stubOf = (c) => ({ async fetch(req, init) {
  const r = typeof req === "string" ? new Request(req, init) : req;
  const url = new URL(r.url);
  const body = r.method === "POST" ? JSON.parse(await r.text() || "null") : null;
  return json({ ok: true, result: await captureOps(c, url, body, c.env)[url.pathname.slice(1)]() });
} });
const silent = { async fetch() { return json({ ok: false }, 500); } };

test("R21: op=capture puts by digest, refuses a body hashing to anything else naming both, never rewrites, gets with 206 and a sanitised name, and answers storage absent", async () => {
  const b = bucket();
  const env = { CAPTURES: b };
  const key = (s) => `bio/captures/${s}`;
  const h = { json, storageAbsent, requiredArgument, key, storeName: "bio", cls: "member" };
  const call = (method, qs, body, headers = {}) => captureObjectOp(new Request(`https://p/?op=capture&${qs}`, { method, headers, ...(body ? { body } : {}) }),
                                                                   new URL(`https://p/?op=capture&${qs}`), env, h);
  const bytes = "evidence bytes", d = sha(bytes);
  const bad = await (await call("PUT", "sha256=nothex")).json();
  assert.equal(bad.reason, "REQUIRED_ARGUMENT_MISSING");
  assert.equal((await (await call("PUT", `sha256=${d.toUpperCase()}`, bytes)).json()).ok, true, "the parameter is read lowercased");
  b.held.clear();
  const wrong = await call("PUT", `sha256=${sha("other")}`, bytes);
  const w = await wrong.json();
  assert.deepEqual([wrong.status, w.reason, w.expected, w.got], [400, "INTEGRITY", sha("other"), d]);
  const first = await (await call("PUT", `sha256=${d}`, bytes)).json();
  assert.deepEqual([first.ok, first.existed, first.bytes], [true, false, bytes.length]);
  assert.ok(b.calls.find((c) => c[0] === "put" && c[1] === key(d))[2].sha256, "stored with its checksum");
  const puts = b.calls.filter((c) => c[0] === "put").length;
  const again = await (await call("POST", `sha256=${d}`, bytes)).json();
  assert.deepEqual([again.existed, b.calls.filter((c) => c[0] === "put").length], [true, puts], "not rewritten");
  const got = await call("GET", `sha256=${d}&dl=re port<>.pdf`);
  assert.equal(got.status, 200); assert.equal(got.headers.get("x-capture-sha256"), d);
  assert.equal(got.headers.get("content-disposition"), 'attachment; filename="re port.pdf"');
  assert.equal(await got.text(), bytes);
  assert.equal((await call("GET", `sha256=${d}`, null, { range: "bytes=0-3" })).status, 206);
  const nf = await call("GET", `sha256=${sha("none")}`);
  assert.deepEqual([nf.status, (await nf.json()).reason], [404, "NOT_FOUND"]);
  const absent = await captureObjectOp(new Request("https://p/?op=capture"), new URL(`https://p/?op=capture&sha256=${d}`), {}, h);
  assert.deepEqual([absent.status, (await absent.json()).reason], [503, "EVIDENCE_STORAGE_NOT_CONFIGURED"]);
});

test("R27 R29: op=links answers what points at an address, a capture's links, and a host's navigation changes, each through the caller's viewer; silence is never an empty answer", async () => {
  const { c, s } = fresh();
  s.sql.exec(`INSERT INTO members (member_id, cover, role, status, created, updated) VALUES ('dave', 'd', 'member', 'active', 'x', 'x')`);
  register(s, "a".repeat(64), "PROJ-1", { type: "project" });
  c.recordLinks({ sourceCapture: "a".repeat(64), capturedAt: "2026-01-01T00:00:00Z", links: [{ ref: "u", address: "https://t.example/u", address_norm: "https://t.example/u" }] });
  c.recordLinks({ sourceCapture: "b".repeat(64), capturedAt: "2026-01-01T00:00:00Z", links: [{ ref: "u", address: "https://t.example/u", address_norm: "https://t.example/u" }] });
  const st = stubOf(c);
  const op = async (qs, viewer) => { const r = await linksOp(new URL(`https://p/?op=links&${qs}`), st, { json, storeSilent, viewer }); return { status: r.status, body: await r.json() }; };
  assert.equal((await op("address=HTTPS://T.EXAMPLE/u", "class:admin")).body.count, 2, "the address is normalised");
  assert.equal((await op("address=https://t.example/u", "member:dave")).body.count, 1);
  assert.equal((await op(`capture=${"a".repeat(64)}`, "member:dave")).body.resolved, 0);
  assert.equal((await op(`capture=${"b".repeat(64)}`, "member:dave")).body.resolved, 1);
  receipt(s, { address: "https://h.example/p", capture: "c".repeat(64), first: "2026-01-01T00:00:00Z" });
  c.recordLinks({ sourceCapture: "c".repeat(64), capturedAt: "2026-01-01T00:00:00Z",
                  links: [{ ref: "n", address: "https://h.example/n", address_norm: "https://h.example/n", chrome: true, chrome_basis: "<nav>" }] });
  assert.equal((await op("host=h.example", "member:dave")).body.observations, 1);
  const need = await op("", "member:dave");
  assert.deepEqual([need.status, need.body.reason], [400, "NEED_CAPTURE_OR_ADDRESS"]);
  const sil = await linksOp(new URL("https://p/?op=links&address=https://t.example/u"), silent, { json, storeSilent, viewer: "class:admin" });
  assert.equal(sil.status, 502);
});

test("R42 N103: op=acquire forwards to the service with the control plane's stamps and answers the filed capture alone: no reading, no reading inputs, no second read of the primary", async () => {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "i" } });
  const st = stubOf(f.c);
  const env = { CAPTURES: b };
  const net = network({ "https://a.example/t.txt": () => new Response("plain text body", { headers: { "content-type": "text/plain" } }),
                        "https://a.example/u.txt": () => new Response("other text body", { headers: { "content-type": "text/plain" } }) });
  try {
    const h = { json, storeSilent, storageAbsent, cls: "member", member: true, sessMember: "m1", storeName: "bio" };
    const get = await acquireOp(new Request("https://p/?op=acquire"), env, st, h);
    assert.equal(get.response.status, 405);
    const none = await acquireOp(new Request("https://p/", { method: "POST", body: "{}" }), {}, st, h);
    assert.equal(none.response.status, 503);
    const reads = () => b.calls.filter((c) => c[0] === "get").length;
    const r0 = reads();
    const out = await acquireOp(new Request("https://p/", { method: "POST", body: JSON.stringify({ locator: "https://a.example/t.txt" }) }), env, st, h);
    const byOp = reads() - r0;
    assert.deepEqual(Object.keys(out), ["answer"], "the op answers the filed capture and nothing for a reader");
    assert.equal(out.answer.ok, true);
    assert.equal("reading" in out.answer.document, false, "the service does not read");
    assert.equal(out.answer.document.capture.actor_class, "member", "the stamps reached the service");
    assert.equal(out.answer.document.capture.sha256, sha("plain text body"));
    /* the service alone, over a capture of the same shape, reads the store exactly as often: the op adds no read */
    const r1 = reads();
    await st.fetch(new Request("http://x/acquire?cls=member&member=1&sessMember=m1&store=bio", { method: "POST", body: JSON.stringify({ locator: "https://a.example/u.txt" }) }));
    assert.equal(byOp, reads() - r1, "no second read of the primary by the op");
    const composed = withReading(out.answer, { reading: { found: false }, textUnits: [{ u: 1 }], textUnitsOverBound: 0 });
    assert.deepEqual(Object.keys(composed.document).slice(0, 6), ["file", "locator", "retrieved", "profile", "reading", "text_units"]);
    const refused = await acquireOp(new Request("https://p/", { method: "POST", body: JSON.stringify({ locator: "http://x" }) }), env, st, h);
    assert.equal(refused.response.status, 400);
    const sil = await acquireOp(new Request("https://p/", { method: "POST", body: "{}" }), env, silent, h);
    assert.equal(sil.response.status, 502);
  } finally { net.restore(); }
});
