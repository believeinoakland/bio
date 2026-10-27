/* mail-reader R15: pure. Every read is made with the network and the clock taken away; nothing a message names is
 * fetched or run, and the answers are the same as with them (build/requirements/mail-reader.md). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readMessage, readMailbox, attachmentBytes, nestingOf } from "../../../src/mail-reader/index.mjs";
import * as F from "./fixtures.mjs";

const HOSTILE = F.eml([...F.STANDARD, "Content-Type: text/html"],
  '<p>Agenda</p><script>globalThis.__mailRan = true</script><img src="https://example.com/t.gif" onerror="globalThis.__mailRan = true"><iframe src="http://example.com/"></iframe><a href="javascript:globalThis.__mailRan=true">x</a>');

/* runs `fn` with fetch, the clock and timers replaced by traps that record a use */
async function withoutWorld(fn) {
  const used = [];
  const saved = { fetch: globalThis.fetch, now: Date.now, perf: performance.now, setTimeout: globalThis.setTimeout, WebSocket: globalThis.WebSocket };
  globalThis.fetch = () => { used.push("fetch"); throw new Error("no network"); };
  globalThis.WebSocket = function () { used.push("WebSocket"); throw new Error("no network"); };
  Date.now = () => { used.push("Date.now"); return 0; };
  performance.now = () => { used.push("performance.now"); return 0; };
  globalThis.setTimeout = (...a) => { used.push("setTimeout"); return saved.setTimeout(...a); };
  try { return { answer: await fn(), used }; } finally {
    globalThis.fetch = saved.fetch; Date.now = saved.now; performance.now = saved.perf; globalThis.setTimeout = saved.setTimeout; globalThis.WebSocket = saved.WebSocket;
  }
}

test("R15 a hostile HTML message is read with no network, no clock and nothing in it run", async () => {
  delete globalThis.__mailRan;
  const { answer, used } = await withoutWorld(() => readMessage(HOSTILE));
  assert.deepEqual(used, []);
  assert.equal(answer.ok, true);
  assert.equal(answer.body.text, "Agenda\nx");
  assert.equal(globalThis.__mailRan, undefined);
  assert.deepEqual(answer, await readMessage(HOSTILE));
});

test("R15 every service answers without the network or the clock, and a refusal is returned, never thrown", async () => {
  const msg = F.msg({ subject: "s", body: "b", date: "2026-10-06T16:30:00Z", attachments: [{ name: "a.txt", data: "abc" }] });
  const box = F.mailboxSource(3, 1000);
  const calls = [
    () => readMessage(msg), () => attachmentBytes(msg, 0), () => nestingOf(msg), () => readMailbox(box),
    () => readMessage(F.bytes("garbage")), () => readMessage({ size: 5, readRange: () => { throw new Error("x"); } }),
  ];
  for (const c of calls) {
    const { answer, used } = await withoutWorld(c);
    assert.deepEqual(used, []);
    assert.equal(typeof answer.ok, "boolean");
  }
});

test("R15 no refusal sentence names a place", async () => {
  const answers = [
    await readMessage(new Uint8Array(0)), await readMessage(F.bytes("x")), await readMessage({ size: 1e12, readRange: () => null }),
    await readMailbox(F.bytes("x")), await attachmentBytes(F.eml(F.STANDARD, "b"), 3),
  ];
  for (const a of answers) {
    assert.equal(a.ok, false);
    assert.doesNotMatch(a.detail, /Oakland|California|Alameda|county|City of|state of/i);
  }
});
