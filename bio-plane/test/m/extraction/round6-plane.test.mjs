/* extraction, fix round 6 (T51; K4426-K4428; plan G4, G8): THE SEAMS, with the real Durable Object the plane builds (every module it
   composes real, its owed-work ledger and its alarm), not extraction's fixture. The inputs are the member's own acts: a capture
   acquired with a render slower than the wait, a stored reading as the old chain wrote it. Each test names the requirement ids it checks.
   (G4) the door's read of a kept capture comes back as no answer once: the act is answered, not failed; the ledger reads it.
   (G8) an old "not read as text" reading is owed by the start-up repair through the ledger the plane hands in, and the alarm reads it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { store } from "../plane/fixture.mjs";
import { multipartBucket } from "../record-core/storage.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { pendingOf } from "../../../src/plane/pending.mjs";
import { acquireReadingOp } from "../../../src/extraction/ops.mjs";
import { RENDER_DEFAULTS } from "../../../src/render.mjs";
import { localize } from "../../../src/setup-words/index.mjs";

const sha = (b) => createHash("sha256").update(b).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
/* control-plane's `doAnswer`, R23/R25, as extraction's relays tests state it */
const doAnswer = async (res) => {
  let r = null, out = null;
  try { r = await res; out = await r.json(); } catch { out = null; }
  if (!out || typeof out !== "object" || Array.isArray(out)) return { answered: false, result: undefined };
  const reply = { status: typeof r.status === "number" ? r.status : 200, body: out };
  if (out.ok === true) return { answered: true, result: out.result, reply };
  if (out.ok === false && reply.status < 500) return { answered: false, refused: true, result: undefined, reply };
  return { answered: false, result: undefined };
};
const storeSilent = (op) => json({ ok: false, reason: "STORE_DID_NOT_ANSWER", op }, 502);

const PAGE = "https://r.example/page";
const SHELL = new TextEncoder().encode("<!doctype html><html><head><title>A notice</title></head><body><div id=app>the notice text of the shell</div></body></html>");
const RENDERED = "<!doctype html><html><body><p>rendered notice text alpha beta gamma</p></body></html>";
const renderAnswer = { ok: true, html: RENDERED, elapsed_ms: 1234, engine: "Chrome", engine_version: "1", viewport: { width: 1280, height: 800 },
  dpr: 1, locale: "en-US", timezone: "UTC", navigated_to: PAGE, status: 200, requests: [], scripts: [], wait: { asked: RENDER_DEFAULTS.wait, fired: "networkidle" } };
const slowRenderer = (ms) => ({ fetch: async () => { await sleep(ms); return new Response(JSON.stringify(renderAnswer)); } });

/* a store as the door's `store()` hands it, whose first `extractread` is lost: the stub throws, as the walker's three of twelve did */
const flaky = (s, { lose = 1 } = {}) => {
  const lost = [];
  return { lost, fetch: async (path, init) => {
    if (String(path).includes("/extractread") && lost.length < lose) { lost.push(String(path)); throw new Error("the Durable Object's stub could not be reached"); }
    return s.fetch(new Request(String(path), init));
  } };
};
const quiet = async (fn) => {
  const logged = [], was = console.error;
  console.error = (...a) => logged.push(a.join(" "));
  try { return { value: await fn(), logged }; } finally { console.error = was; }
};

test("R87 (G4) seam: a page acquired with a render slower than the wait is kept and its read comes back unanswered once: the act is answered 200 with the document, `reading_pending` and `diag`, never a failed act; the ledger then reads it; a repeat of the press reads it at once (control)", { timeout: 60_000 }, async () => {
  const bucket = multipartBucket();
  const x = await store({ env: { CAPTURES: bucket, RENDERER: slowRenderer(400) } });
  const real = globalThis.fetch;
  globalThis.fetch = async () => new Response(SHELL, { headers: { "content-type": "text/html" } });
  let pressed;
  try {
    pressed = await captureOf(x.ctx).acquire({ locator: PAGE, render: true }, { cls: "admin", storeName: "bio", renderWaitMs: 50 });
  } finally { globalThis.fetch = real; }
  assert.equal(pressed.status, 200, JSON.stringify(pressed.body).slice(0, 300));
  const shell = sha(SHELL);
  assert.equal(pressed.body.document.capture.sha256, shell, "the shell is kept while the render is pending");
  assert.equal(typeof pressed.body.document.render_pending.session, "string", "the render is in flight past the wait");
  assert.ok(await recordOf(x.ctx).evidenceStore().head(shell), "kept");
  /* the door's read of the kept capture (plane/door.mjs `readAcquired`), the first call to the stub lost */
  const st = flaky(x.s);
  const { value: read, logged } = await quiet(() => acquireReadingOp(pressed.body, st, { json, storeSilent, doAnswer, storeName: "bio" }));
  assert.equal(st.lost.length, 1, "the stub failed once");
  assert.equal(read.response, undefined, "never a 502 for a kept capture");
  assert.equal(read.body.ok, true);
  assert.equal(read.body.reading_pending, true);
  assert.equal(read.body.document.capture.sha256, shell);
  assert.equal(read.body.document.reading, undefined);
  assert.equal(read.body.diag.message, "the Durable Object's stub could not be reached");
  assert.equal(logged.length, 1);
  assert.equal(JSON.parse(logged[0]).event, "extraction.acquire_read_unanswered");
  /* the door owes it (`pendReading`: the store-internal `pendingadd`), and the member's promotion gives it its home */
  const owed = await x.fetch(`/pendingadd?kind=reading&sha=${shell}&store=bio`, { method: "POST" });
  assert.equal(owed.status, 200);
  const readings = () => pendingOf(x.ctx).list().filter((r) => r.kind === "reading").map((r) => [r.sha, r.state]);
  assert.deepEqual(readings(), [[shell, "owed"]], "an owed row (beside the render's own, which the pending capture owes)");
  x.ctx.storage.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
    VALUES ('INFO-2026-0001', 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1)`);
  x.ctx.storage.sql.exec(`INSERT INTO register (capture_sha,bundle_id,path,encoding,bytes,registered,last_registered,authored,author,observed_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)`, shell, "INFO-2026-0001", "snapshots/page.html", "binary", SHELL.length, "2026-10-22T00:00:00Z", "2026-10-22T00:00:00Z", 0, null, null);
  x.ctx.storage.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?,?,?,?,?,?)`,
    "INFO-2026-0001", "data/provenance.json", JSON.stringify({ documents: [pressed.body.document] }), null, 1, "x");
  assert.equal(extractionOf(x.ctx).readingFor(shell, "class:admin").found, false, "no reading before the alarm");
  await x.s.alarm();
  const got = extractionOf(x.ctx).readingFor(shell, "class:admin");
  assert.equal(got.found, true, "the alarm read it");
  assert.match(got.text_units.map((u) => u.text).join(" "), /the notice text of the shell/, "R-STOP: the words are in the text units");
  assert.deepEqual(readings(), [], "the reading's entry ended");
  /* control: the same read, the stub answering, is on the document and logs nothing */
  const ok = await quiet(() => acquireReadingOp(pressed.body, flaky(x.s, { lose: 0 }), { json, storeSilent, doAnswer, storeName: "bio" }));
  assert.equal(ok.value.body.reading_pending, undefined);
  assert.equal(ok.value.body.document.reading.found !== undefined, true);
  assert.deepEqual(ok.logged, []);
});

/* ---- G8 ---- */

const OLD = () => ({ found: false, entities: [], failure: "final", content_type: null, text_source: null,
  basis: localize("reading-pipeline.index.document_not_read_text", "the document was not read as text ({why}), so no reading was attempted",
    { why: localize("reading-pipeline.index.multipart", "multipart") }) });
const row = (b, p, bytes, d) => x_ => x_.ctx.storage.sql.exec(
  `INSERT OR IGNORE INTO register (capture_sha,bundle_id,path,encoding,bytes,registered,last_registered,authored,author,observed_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
  d, b, p, "binary", bytes, "2026-10-22T00:00:00Z", "2026-10-22T00:00:00Z", 0, null, null);

test("R89 (G8) seam: an old 'not read as text' reading of a text held in two parts is owed by the start-up repair through the plane's ledger, with no press; the alarm reads it and `op=reading` has its words; a reading with text is never owed", { timeout: 60_000 }, async () => {
  const bucket = multipartBucket();
  const x = await store({ env: { CAPTURES: bucket } });
  const ev = recordOf(x.ctx).evidenceStore();
  const text = new TextEncoder().encode("The board met on the first Tuesday and approved the minutes without objection. ".repeat(20));
  const whole = sha(text);
  const half = text.length >> 1;
  const parts = [text.subarray(0, half), text.subarray(half)].map((b, i) => ({ file: `p${i}.bin`, sha256: sha(Buffer.concat([b, Buffer.from(String(i))])), bytes: b.length }));
  await ev.put(whole, text);
  x.ctx.storage.sql.exec(`INSERT OR IGNORE INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version)
    VALUES ('INFO-2026-0125', 'information', 'g', 't', 'collected', '2026-01-01', '2026-01-01', 'x', 1)`);
  for (const p of parts) row("INFO-2026-0125", "snapshots/minutes.txt", p.bytes, p.sha256)(x);
  const document = { file: "snapshots/minutes.txt", locator: "https://r.example/minutes.txt", retrieved: "2026-10-22T05:00:00Z",
    profile: { format: { format: "undetermined", confidence: "none", signals: [] }, source_content_type: "text/plain", jurisdiction_view: null },
    capture: { sha256: whole, bytes: text.length, content_type: "text/plain", transport: { http_headers: [["content-type", "text/plain"]] } }, parts };
  x.ctx.storage.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?,?,?,?,?,?)`,
    "INFO-2026-0125", "data/provenance.json", JSON.stringify({ documents: [document] }), null, 1, "x");
  const ex = extractionOf(x.ctx);
  ex.writeReading({ bundleId: "INFO-2026-0125", captureSha: whole, reading: OLD(), composed: true });
  /* a reading with text, in the same store, is not owed */
  const fine = sha("another notice");
  ex.writeReading({ bundleId: "INFO-2026-0125", captureSha: fine, reading: { found: true, entities: [{ kind: "meeting", key: "1" }], basis: "read" }, composed: true });
  assert.equal(ex.readingFor(whole, "class:admin").repairable, true);
  assert.deepEqual(pendingOf(x.ctx).list(), [], "nothing owed before the ledger is handed in");
  /* the plane's composition hands the ledger in beside capture's `owedLater` (store.mjs); the repair then runs, with no press */
  ex.registerOwe((e) => pendingOf(x.ctx).owedLater(e));
  const until = async (f, ms = 5000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (f()) return true; await sleep(10); } return f(); };
  assert.ok(await until(() => pendingOf(x.ctx).list().length > 0), "the repair owed the ledger");
  assert.deepEqual(pendingOf(x.ctx).list().map((r) => [r.sha, r.kind, r.state]), [[whole, "reading", "owed"]]);
  await x.s.alarm();
  const got = ex.readingFor(whole, "class:admin");
  assert.match(got.text_units.map((u) => u.text).join(" "), /The board met on the first Tuesday/, "R-STOP: the words are in the text units");
  assert.equal("repairable" in got, false);
  assert.deepEqual(pendingOf(x.ctx).list(), [], "the entry ended");
});
