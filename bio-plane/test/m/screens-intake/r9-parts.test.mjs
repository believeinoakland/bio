/* screens-intake fix round 9 (SCREENS-INTAKE #23), R2 as capture R113 (K4891, K4899; J47) has it: a file past the request-body ceiling is sent in parts. The page
 * hashes the whole file first (an incremental SHA-256 of its own), begins (`captureuploadbegin`: the digest, the size and the same statement, name and type the
 * one-request upload carries), sends the parts in order each with its own digest in the address, completes with the parts' digests, and files the answer as it files
 * an upload's. Entered by pressing the act over the real served page; the plane doubles answer as capture's record states the four ops answer (names, inputs,
 * answers, refusals), and the harness holds every request to the owner's declaration of the op (R104). Each part is a step of the page's clock, so the tests drive it
 * with `drive`, which advances the clock and waits for the answers by count. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { open as openPage, main, text, fill, press, idle, ok, says, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { partRefusal } from "../capture/fixtures.mjs";

const MIB = 1048576;
const sha = (b) => createHash("sha256").update(b).digest("hex");
const NOT_HELD = { ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined" } };
const refusal = (status, code, more = {}) => ({ status, json: { ok: false, reason: code, code, ...more } });
/* capture's real refusals of its part upload (its published fixture, K5077): produced by uploading a wrong, repeated, early or lost part, as the door answers them */
const REAL = await partRefusal();
const real = (r, more = {}) => ({ status: r.status, json: { ...r, code: r.reason, ...more } });

test("R2 the incremental SHA-256 the page hashes a file with equals the platform's, whatever the chunks", () => {
  const { sha256Hasher } = CAPTURE_SCREEN.parts;
  for (const n of [0, 1, 55, 56, 57, 63, 64, 65, 119, 120, 121, 127, 128, 1000, 70000, MIB + 17]) {
    const bytes = randomBytes(n);
    const h = sha256Hasher();
    for (let at = 0; at < n; at += 1 + (at % 97) * 13 + 5) h.update(bytes.subarray(at, Math.min(n, at + 1 + (at % 97) * 13 + 5)));
    assert.equal(h.hex(), sha(bytes), `${n} bytes`);
  }
  assert.equal(sha256Hasher().hex(), "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "the empty message");
});

const FILLED = (file) => ({ "ci-file": file, "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." });
const SIZE = 1000, PART = 400;
function world(over = {}) {
  const bytes = randomBytes(SIZE);
  const log = { parts: [], aborts: 0, begins: 0 };
  const file = new File([bytes], "packet.pdf", { type: "application/pdf" });
  const parts = Math.ceil(SIZE / PART);
  const plane = {
    captureupload: refusal(413, "TOO_LARGE", { in_parts: true, size: SIZE, bound: 256 * MIB }),
    captureuploadbegin: (req) => { log.begins++; return ok({ ok: true, upload: "up_1", sha256: req.body.sha256, bytes: SIZE, part_bytes: PART, parts, next: 0, held: false, created: "2026-10-24T10:00:00Z", expires: "2026-10-25T10:00:00Z" }); },
    captureuploadpart: async (req) => { const b = Buffer.from(await req.body.arrayBuffer()); log.parts.push({ index: Number(req.query.index), size: b.length, sha: req.query.sha256, ok: sha(b) === req.query.sha256, upload: req.query.upload }); return ok({ ok: true, existed: false, index: Number(req.query.index), next: Number(req.query.index) + 1, parts, bytes: b.length }); },
    captureuploadcomplete: (req) => ok({ ok: true, existed: false, capture: { sha256: sha(bytes), bytes: SIZE }, receipt: {}, document: { file: `snapshots/upload-${sha(bytes)}`, locator: `upload:${sha(bytes)}`, capture: { method: "uploaded", sha256: sha(bytes), encoding: "binary", bytes: SIZE }, source: { kind: "uploader" } }, jobs: [] }),
    captureuploadabort: () => { log.aborts++; return ok({ ok: true, aborted: true }); },
    heldat: ok(NOT_HELD), allocid: ok({ ok: true, id: "INFO-2026-0150" }), promote: (r) => ok({ ok: true, bundleId: r.body.bundleId }),
    ...over };
  return { bytes, file, log, plane, parts };
}
const open = (plane) => openPage("/app/capture/file", { plane, screens: [...SCREENS, DOCUMENT_STUB] });
async function drive(p, until, rounds = 600) {
  for (let i = 0; i < rounds && !until(); i++) { await p.clock.tick(1); await idle(p); }
  await idle(p);
}
const failedLine = (p) => main(p).querySelector('[data-parted="failed"]');

test("R2 (capture R113) a TOO_LARGE that carries in_parts begins the same upload in parts: the whole's digest first, the parts in order each under its own digest, then the completion, filed as an upload", async () => {
  const w = world();
  const p = await open(w.plane);
  fill(p, FILLED(w.file));
  await press(p, "captureupload");
  assert.equal(p.byOp("captureupload").length, 1, "the one-request upload was tried and refused with the cue");
  await drive(p, () => p.byOp("promote").length > 0);
  const begin = p.byOp("captureuploadbegin")[0].body;
  assert.equal(begin.sha256, sha(w.bytes), "the whole file's digest, hashed in the page, declared at the begin");
  assert.equal(begin.bytes, SIZE);
  assert.match(begin.statement, /City hall/);
  assert.equal(begin.name, "packet.pdf");
  assert.equal(begin.type, "application/pdf");
  assert.deepEqual(w.log.parts.map((x) => x.index), [0, 1, 2], "parts in order");
  assert.deepEqual(w.log.parts.map((x) => x.size), [400, 400, 200], "each exactly the part size, the last the remainder");
  assert.ok(w.log.parts.every((x) => x.ok && x.upload === "up_1"), "each part's digest is its own bytes' and rides in the address with the upload's name");
  const done = p.byOp("captureuploadcomplete")[0].body;
  assert.equal(done.upload, "up_1");
  assert.deepEqual(done.parts, [0, 1, 2].map((i) => sha(w.bytes.subarray(i * PART, (i + 1) * PART))), "the parts' digests, in order");
  assert.equal(p.byOp("promote").length, 1, "the answer is filed as an upload's is");
  assert.deepEqual(p.byOp("promote")[0].body.register.map((r) => r.sha256), [sha(w.bytes)], "one row, the whole's (R21)");
  assert.ok(says(p, "screen.capture.file.done", { name: "packet.pdf" }));
  assert.equal(failedLine(p), null);
  assert.equal(main(p).querySelector("[data-parted]"), null, "the progress line is gone once it is filed");
  assert.equal(w.log.aborts, 0);
});

test("R2 (capture R113) the progress is drawn while the parts go: the file being checked, then part n of m", async () => {
  const w = world();
  let seen = [];
  const p = await open({ ...w.plane, captureuploadpart: async (req) => { seen.push(main(p).querySelector("[data-parted]") ? main(p).querySelector("[data-parted]").getAttribute("data-parted") : null); return w.plane.captureuploadpart(req); } });
  fill(p, FILLED(w.file));
  await press(p, "captureupload");
  await drive(p, () => p.byOp("promote").length > 0);
  assert.deepEqual(seen, ["sending", "sending", "sending"], "a progress line is drawn while each part is out");
});

test("R2 (capture R113) a file above the page's own figure begins in parts at once: nothing is sent in one request", async () => {
  const bytes = Buffer.alloc(65 * MIB, 7);
  const file = new File([bytes], "big.pdf", { type: "application/pdf" });
  const w = world();
  const p = await open({ ...w.plane, captureuploadbegin: (req) => { w.log.begins++; return ok({ ok: true, upload: "up_big", sha256: req.body.sha256, bytes: bytes.length, part_bytes: 16 * MIB, parts: 5, next: 0, held: false }); },
    captureuploadpart: async (req) => { const b = Buffer.from(await req.body.arrayBuffer()); w.log.parts.push({ index: Number(req.query.index), size: b.length, ok: sha(b) === req.query.sha256 }); return ok({ ok: true, index: Number(req.query.index) }); } });
  fill(p, FILLED(file));
  await press(p, "captureupload");
  await drive(p, () => p.byOp("captureuploadcomplete").length > 0, 2000);
  assert.equal(p.byOp("captureupload").length, 0, "no request carried the whole file");
  assert.equal(p.byOp("captureuploadbegin")[0].body.sha256, sha(bytes));
  assert.deepEqual(w.log.parts.map((x) => x.size), [16 * MIB, 16 * MIB, 16 * MIB, 16 * MIB, MIB], "four parts of the part size and the remainder");
  assert.ok(w.log.parts.every((x) => x.ok));
});

test("R2 (capture R113) control: a file under the figure is sent in one request, as before, and no part is begun", async () => {
  const w = world({ captureupload: ok({ ok: true, existed: false, capture: { sha256: "a".repeat(64), bytes: 9 }, document: { file: "snapshots/u", locator: "upload:x", capture: { method: "uploaded", sha256: "a".repeat(64), encoding: "binary", bytes: 9 }, source: { kind: "uploader" } } }) });
  const p = await open(w.plane);
  fill(p, FILLED(w.file));
  await press(p, "captureupload");
  assert.equal(p.byOp("captureupload").length, 1);
  assert.equal(p.byOp("captureuploadbegin").length, 0);
});

test("R2 (capture R113) control: a TOO_LARGE without the cue is the refusal beside the act, with its figures, and nothing is begun", async () => {
  const w = world({ captureupload: refusal(413, "TOO_LARGE", { size: 300 * MIB, bound: 256 * MIB }) });
  const p = await open(w.plane);
  fill(p, FILLED(w.file));
  const r = await press(p, "captureupload");
  assert.equal(p.byOp("captureuploadbegin").length, 0);
  assert.ok(r.slot().textContent.includes(`${300}.0`), "the size is in the refusal");
});

test("R2 (capture R113) a begin the plane refuses is drawn in its words, nothing is sent and nothing is aborted (nothing was begun)", async () => {
  const w = world({ captureuploadbegin: refusal(413, "TOO_LARGE", { size: 300 * MIB, bound: 256 * MIB, translation: "That file is bigger than a team may keep." }) });
  const p = await open(w.plane);
  fill(p, FILLED(w.file));
  await press(p, "captureupload");
  await drive(p, () => failedLine(p) !== null);
  assert.ok(failedLine(p), "drawn failed");
  assert.equal(p.byOp("captureuploadpart").length, 0);
  assert.equal(w.log.aborts, 0);
});

test("R2 (capture R113) UPLOAD_LOST (the object was restarted) begins again once and sends the parts again; UPLOAD_EXPIRED the same", async () => {
  for (const code of ["UPLOAD_LOST", "UPLOAD_EXPIRED"]) {
    const w = world();
    let lost = false;
    const p = await open({ ...w.plane, captureuploadpart: async (req) => {
      /* the lost upload is capture's real answer; an expired one is that answer under the expiry's code and status (410) */
      if (!lost && Number(req.query.index) === 1) { lost = true; return code === "UPLOAD_LOST" ? real(REAL.UPLOAD_LOST) : real(REAL.UPLOAD_LOST, { reason: code, code, status: 410 }); }
      return w.plane.captureuploadpart(req);
    } });
    fill(p, FILLED(w.file));
    await press(p, "captureupload");
    await drive(p, () => p.byOp("promote").length > 0);
    assert.equal(w.log.begins, 2, `${code}: begun again, once`);
    assert.equal(p.byOp("captureuploadcomplete").length, 1);
    assert.equal(p.byOp("promote").length, 1, "and filed");
  }
});

test("R2 (capture R113) a part refused for another cause ends the upload: it is aborted, the refusal is drawn, nothing is completed or filed", async () => {
  const w = world();
  const p = await open({ ...w.plane, captureuploadpart: (req) => (Number(req.query.index) === 1 ? real(REAL.PART_DIGEST_MISMATCH) : w.plane.captureuploadpart(req)) });
  fill(p, FILLED(w.file));
  await press(p, "captureupload");
  await drive(p, () => failedLine(p) !== null);
  assert.ok(failedLine(p));
  assert.equal(w.log.aborts, 1, "what was begun is aborted");
  assert.equal(p.byOp("captureuploadabort")[0].body.upload, "up_1");
  assert.equal(p.byOp("captureuploadcomplete").length, 0);
  assert.equal(p.byOp("promote").length, 0);
});

test("R2 (capture R113) PART_OUT_OF_ORDER resumes at the part the plane names; a part answered nothing is tried again", async () => {
  const w = world();
  let first = true, silent = true;
  const p = await open({ ...w.plane, captureuploadpart: async (req) => {
    const i = Number(req.query.index);
    if (first && i === 1) { first = false; return refusal(409, "PART_OUT_OF_ORDER", { next: 0 }); }
    if (silent && i === 2) { silent = false; return { silent: true }; }
    return w.plane.captureuploadpart(req);
  } });
  fill(p, FILLED(w.file));
  await press(p, "captureupload");
  await drive(p, () => p.byOp("promote").length > 0);
  assert.equal(p.byOp("promote").length, 1);
  assert.equal(failedLine(p), null);
  assert.equal(w.log.aborts, 0);
});

test("R2 (capture R113) a second press replaces the upload: the older loop sends nothing more", async () => {
  const w = world();
  const p = await open(w.plane);
  fill(p, FILLED(w.file));
  await press(p, "captureupload");
  await p.clock.tick(1); await idle(p);
  await press(p, "captureupload");
  await drive(p, () => p.byOp("promote").length > 0);
  const idx = w.log.parts.map((x) => x.index);
  assert.ok(idx.length <= 6 && p.byOp("promote").length === 1, `one filing; parts sent ${idx.join(",")}`);
});
