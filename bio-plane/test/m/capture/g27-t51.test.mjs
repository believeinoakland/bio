/* capture, fix round 6 of T51 (G27, from G4's diagnosis `diagnosis-R6-G4.md`): the door's read after a kept acquire takes a fresh
   stub and tries once more when the first read throws or is not answered, never when the object is overloaded, and only then
   defers. At the module's interface: `captureOp("acquire", ...)` as the plane's door calls it, with a reader written to extraction's
   `acquireReadingOp` contract (`reader.mjs`; capture cannot import extraction) behind `readAcquired` as `door.mjs` hands it, over stubs that fail the way a reset object's does
   (a rejected fetch carrying `remote: true`). R73 (the act's answer). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { H } from "./fixture.mjs";
import { captureOp } from "../../../src/capture/ops.mjs";
import { readerFor } from "./reader.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const doAnswer = async (res) => {
  const r = await res.catch(() => null);
  const out = r ? await r.json().catch(() => null) : null;
  return out && out.ok === true ? { answered: true, result: out.result, reply: { status: r.status, body: out } } : { answered: false };
};
// fixtures-contract: answer-envelope door-helpers
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);
const kept = { ok: true, existed: false, document: { file: "f", locator: "https://t.example/d", capture: { sha256: H("ab") } } };
const env = { CAPTURES: { put() {}, get() {} } };
const post = () => new Request("https://p/?op=acquire", { method: "POST", body: JSON.stringify({ locator: "https://t.example/d" }) });
const READ = { ok: true, result: { reading: { read: true, units: 3 }, text_units: 3 } };

/* A stub of the object: `/acquire` answers the kept capture; `/extractread` does what `onRead` says on its n-th call to this stub. */
const stub = (onRead) => {
  const calls = { acquire: 0, read: 0 };
  return { calls, fetch: async (path) => {
    if (String(path).includes("/acquire")) { calls.acquire++; return json({ ok: true, result: { status: 200, body: kept } }); }
    calls.read++;
    return onRead(calls.read);
  } };
};
const gone = (flags = {}, message = "Durable Object reset because its code was updated.") => () => { throw Object.assign(new Error(message), flags); };
const answers = () => json(READ);

/* The door as the plane builds it: one `store()` per call, handed to the reader as the plane's door does. */
const door = (stubs) => {
  let n = 0;
  const store = () => stubs[Math.min(n++, stubs.length - 1)];
  const h = { json, storeSilent, doAnswer, storageAbsent: () => json({}, 503), cls: "member", member: true, sessMember: "member:ann", storeName: "bio",
    readAcquired: readerFor({ doAnswer, storeSilent }) };
  return { store, calls: () => n, run: () => captureOp("acquire", post(), new URL("https://p/?op=acquire"), env, store, h) };
};
const quiet = async (fn) => { const w = console.error; console.error = () => {}; try { return await fn(); } finally { console.error = w; } };

test("R73 G27 (fix round 6): a first read that throws {remote: true} is tried once more on a fresh stub, and the document is answered read, not deferred", async () => {
  const first = stub(gone({ remote: true })), second = stub(answers);
  const d = door([first, second]);
  const res = await quiet(() => d.run());
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.deepEqual([b.reading_pending, b.diag, b.document.reading, b.document.capture.sha256], [undefined, undefined, { read: true, units: 3 }, H("ab")]);
  assert.deepEqual([d.calls(), first.calls.read, second.calls.read, second.calls.acquire], [2, 1, 1, 0], "one stub for the acquire and its first read, a fresh one for the retry");
});

test("R73 G27 (fix round 6): a first read the object does not answer (a reply that is no envelope) is tried once more on a fresh stub", async () => {
  const first = stub(() => new Response("upstream closed", { status: 502 })), second = stub(answers);
  const d = door([first, second]);
  const b = await (await quiet(() => d.run())).json();
  assert.deepEqual([b.document.reading, b.reading_pending, d.calls()], [{ read: true, units: 3 }, undefined, 2]);
});

test("R73 G27 (fix round 6, control): both reads fail, so it is one retry and no more, and the kept capture is answered 200 with reading_pending, its digest and the diag of the failure", async () => {
  const first = stub(gone({ remote: true })), second = stub(gone({ remote: true }, "Durable Object's memory limit exceeded"));
  const d = door([first, second, stub(answers)]);
  const res = await quiet(() => d.run());
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.deepEqual([b.ok, b.reading_pending, b.document.capture.sha256, b.diag.message], [true, true, H("ab"), "Durable Object's memory limit exceeded"]);
  assert.deepEqual([d.calls(), first.calls.read, second.calls.read], [2, 1, 1], "a third stub is never made");
});

test("R73 G27 (fix round 6, control): an overloaded object is not retried (Cloudflare: it should not be), so the deferral is answered after the one read", async () => {
  const first = stub(gone({ remote: true, overloaded: true }, "Durable Object is overloaded. Requests queued for too long.")), second = stub(answers);
  const d = door([first, second]);
  const b = await (await quiet(() => d.run())).json();
  assert.deepEqual([b.reading_pending, b.document.reading, d.calls(), second.calls.read], [true, undefined, 1, 0]);
  assert.match(b.diag.message, /overloaded/);
});

test("R73 G27 (fix round 6, control): a read that answers is not retried, and a deferral the door chose itself (no failed read, so no diag) is relayed without a second read", async () => {
  const only = stub(answers);
  const d = door([only, stub(answers)]);
  const b = await (await d.run()).json();
  assert.deepEqual([b.document.reading, d.calls(), only.calls.read], [{ read: true, units: 3 }, 1, 1]);
  const chosen = stub(answers);
  let reads = 0;
  const h2 = { json, storeSilent, doAnswer, storageAbsent: () => json({}, 503), cls: "member", member: true, sessMember: "member:ann", storeName: "bio",
    readAcquired: async (answer) => { reads++; return { body: { ...answer, reading_pending: true } }; } };
  const r = await captureOp("acquire", post(), new URL("https://p/?op=acquire"), env, () => chosen, h2);
  const rb = await r.json();
  assert.deepEqual([rb.reading_pending, rb.diag, reads], [true, undefined, 1]);
});

test("R73 G27 (fix round 6): a readAcquired that itself throws is retried on a fresh stub once as well", async () => {
  const fresh = stub(answers);
  let n = 0;
  const store = () => (n++ === 0 ? stub(answers) : fresh);
  let attempts = 0;
  const h = { json, storeSilent, doAnswer, storageAbsent: () => json({}, 503), cls: "member", member: true, sessMember: "member:ann", storeName: "bio",
    readAcquired: async (answer, st) => { attempts++; if (st !== fresh) throw Object.assign(new Error("stub broken"), { remote: true }); return readerFor({ doAnswer, storeSilent })(answer, st); } };
  const b = await (await quiet(() => captureOp("acquire", post(), new URL("https://p/?op=acquire"), env, store, h))).json();
  assert.deepEqual([b.document.reading, b.reading_pending, attempts, n], [{ read: true, units: 3 }, undefined, 2, 2]);
});

/* ---- B27 (K4604; G27): a deferred render in flight leaves the object's memory to it ---- */

const keptWith = (render) => ({ ...kept, ...(render ? { render } : {}) });
const doorWith = (answerBody) => {
  const acquireStub = { fetch: async () => json({ ok: true, result: { status: 200, body: answerBody } }) };
  let reads = 0, stores = 0;
  const h = { json, storeSilent, doAnswer, storageAbsent: () => json({}, 503), cls: "member", member: true, sessMember: "member:ann", storeName: "bio",
    readAcquired: async (answer) => { reads++; return { body: { ...answer, document: { ...answer.document, reading: { read: true } } } }; } };
  return { reads: () => reads, stores: () => stores, run: () => captureOp("acquire", post(), new URL("https://p/?op=acquire"), env, () => { stores++; return acquireStub; }, h) };
};

test("R73 G27 (fix round 6, B27): an acquire whose answer says its render is pending is not read inline: the object is left to the render, and the kept capture is answered 200 with reading_pending, its digest and the render as the acquire gave it, no diag (a deferral by choice, not a failure)", async () => {
  const d = doorWith(keptWith({ state: "pending", session: "rs_1" }));
  const res = await d.run();
  assert.equal(res.status, 200);
  const b = await res.json();
  assert.deepEqual([b.ok, b.reading_pending, b.sha, b.render, b.diag, b.document.capture.sha256], [true, true, H("ab"), { state: "pending", session: "rs_1" }, undefined, H("ab")]);
  assert.deepEqual([d.reads(), d.stores()], [0, 1], "no read, and no second stub");
  assert.equal(typeof b.note, "string", "the grade note is carried as for any acquire");
});

test("R73 G27 (fix round 6, B27, controls): an acquire with no render, or a render that is not pending (owed, waiting, deferred), is read inline as before", async () => {
  for (const render of [null, { state: "owed", session: "rs_1" }, { state: "waiting", content: "undetermined" }, { state: "deferred", content: "undetermined" }]) {
    const d = doorWith(keptWith(render));
    const b = await (await d.run()).json();
    assert.deepEqual([b.reading_pending, b.document.reading, d.reads()], [undefined, { read: true }, 1], JSON.stringify(render));
  }
});
