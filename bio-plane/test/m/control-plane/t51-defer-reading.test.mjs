/* control-plane R120 (fix round 4, C5a/P8; K4429, K4434; acquisition R96, extraction R80, plane R75): A CAPTURE IS ANSWERED WHEN IT IS KEPT; A READING THAT WILL
   NOT FIT THE BOUND FOLLOWS. The door hands the handler the question it asks of the document it has just filed (`deferReading`): a PDF over 2 MB, or any
   document once less than 8 seconds of R105's bound is left, is answered `reading_pending: true`, and the door registers the digest with the plane's alarm
   (`pendingadd`, kind `reading`). The handler here plays the plane's part; the whole path with the real objects is `t51-large-pdfs.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, defaultHooks, opCalls } from "./harness.mjs";

const SHA = "a".repeat(64);
const MB = 1024 * 1024;
const docOf = (o = {}) => ({ file: "snapshots/x", locator: o.locator ?? "https://example.org/x.pdf", capture: { sha256: SHA, bytes: o.bytes ?? 10, content_type: o.type ?? "application/pdf" } });
const later = (ms) => new Promise((r) => setTimeout(r, ms));
/* the plane's part: file the document, ask whether to read it, answer pending or with the reading */
const handler = (o, seen) => ({ ...defaultHooks(), acquireBoundMs: o.bound ?? 25000, async gatedOp(ctx) {
  if (ctx.op !== "acquire") return undefined;
  seen.push(typeof ctx.deferReading);
  if (o.wait) await later(o.wait);
  const document = docOf(o);
  const pending = await ctx.deferReading(document);
  seen.push(pending);
  return M.json(pending ? { ok: true, existed: false, document, reading_pending: true } : { ok: true, existed: false, document: { ...document, reading: { found: true } } });
} });
const run = async (o) => {
  const seen = [], w = world();
  const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: handler(o, seen), body: { locator: "https://example.org/x.pdf" } });
  return { r, seen, adds: opCalls(w.env).filter((c) => c.route === "pendingadd") };
};

test("R120: a PDF over 2 MB is answered kept with `reading_pending`, and its digest is registered with the plane's alarm once", async () => {
  for (const bytes of [2 * MB + 1, 8.8 * MB | 0, 16 * MB]) {
    const { r, seen, adds } = await run({ bytes });
    assert.equal(r.status, 200, r.text);
    assert.deepEqual(seen, ["function", true], `${bytes}: the handler is given the question and it says defer`);
    assert.equal(r.json.reading_pending, true);
    assert.equal(r.json.document.reading, undefined, "no reading, no units");
    assert.equal(adds.length, 1, `${bytes}: registered once`);
    assert.deepEqual([adds[0].params.kind, adds[0].params.sha, adds[0].method], ["reading", SHA, "POST"]);
  }
});

/* fix round 6, G5 (K4573): a file that is not a PDF follows by the ledger above 3 MiB, not 20 MiB (the walker's 12 MB text held a request for 18 s), so the control's "large file that is not a PDF" is one at the threshold; above it is `t51-round6-door.test.mjs`' */
test("R120 control: a small PDF, a page, a large file that is not a PDF, and a PDF of exactly 2 MB are read at once: no `reading_pending`, nothing registered", async () => {
  for (const o of [{ bytes: 140815 }, { bytes: 2 * MB }, { bytes: 3 * MB, type: "text/html", locator: "https://example.org/x.html" }, { bytes: 5, type: "text/html" }]) {
    const { r, seen, adds } = await run(o);
    assert.equal(r.status, 200, r.text);
    assert.deepEqual(seen, ["function", false], JSON.stringify(o));
    assert.equal(r.json.reading_pending, undefined);
    assert.deepEqual(r.json.document.reading, { found: true });
    assert.equal(adds.length, 0);
  }
});

test("R120 (the bound): once less than 8 seconds of the bound is left, any document is deferred, and the door still answers inside the bound", async () => {
  const late = await run({ bytes: 5, type: "text/html", bound: 600, wait: 300 });   /* 300 ms spent of 600: under the budget of a 600 ms bound */
  assert.equal(late.r.status, 200, late.r.text);
  assert.equal(late.r.json.reading_pending, true);
  assert.equal(late.adds.length, 1);
  const early = await run({ bytes: 5, type: "text/html", bound: 25000, wait: 10 });
  assert.equal(early.r.json.reading_pending, undefined);
});

test("R120: a refusal or a silence of the registration, or a call that is not an `acquire`, changes nothing the caller receives; only an `acquire` is handed the question", async () => {
  const seen = [];
  const w = world({ answer: (c) => (c.route === "pendingadd" ? new Response("<html>boom</html>", { status: 500 }) : null) });
  const r = await call(w.env, { op: "acquire", token: w.S.ann, method: "POST", hooks: handler({ bytes: 9 * MB }, seen), body: { locator: "https://example.org/x.pdf" } });
  assert.equal(r.status, 200, r.text);
  assert.equal(r.json.reading_pending, true, "the kept capture is answered as it was");
  const other = [];
  const hooks = { ...defaultHooks(), async gatedOp(ctx) { other.push([ctx.op, typeof ctx.deferReading]); return undefined; } };
  await call(w.env, { op: "projectlist", token: w.S.ann, hooks });
  assert.deepEqual(other.find(([op]) => op === "projectlist"), ["projectlist", "undefined"]);
});
