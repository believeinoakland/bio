/* screens-intake fix round 9 (SCREENS-INTAKE #23), R2 as capture R113 (K4891, K4899; J47) has it: a file past the request-body ceiling is sent in parts. The page
 * hashes the whole file first (an incremental SHA-256 of its own), begins (`captureuploadbegin`: the digest, the size and the same statement, name and type the
 * one-request upload carries), sends the parts in order each with its own digest in the address, completes with the parts' digests, and files the answer as it files
 * an upload's. Entered by pressing the act over the real served page; the plane doubles answer as capture's record states the four ops answer (names, inputs,
 * answers, refusals), and the harness holds every request to the owner's declaration of the op (R104). Each part is a step of the page's clock, so the tests drive it
 * with `drive`, which advances the clock and waits for the answers by count. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { openWorld, members, main, text, fill, press, idle, ok, says } from "./page.mjs";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { PARTED_PART_BYTES } from "../../../src/capture/index.mjs";
import { partRefusal } from "../capture/fixtures.mjs";
import { randomBytes } from "node:crypto";

const MIB = 1048576;
const PART = PARTED_PART_BYTES;
const sha = (b) => createHash("sha256").update(b).digest("hex");
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
/* The scene is the real store's: the owner's own begin, parts, completion and promotion answer the page. The part is the owner's figure (16 MiB), so a file of 33 MiB is three
   parts (two of the figure and the remainder), and the page's own figure for beginning in parts at once is 65 MiB. A file's bytes are patterned so no two parts are alike. */
const SIZE = 2 * PART + MIB;
const patterned = (size) => { const b = Buffer.alloc(size, 7); for (let i = 0; i < size; i += 4096) b.writeUInt32LE((i / 4096) >>> 0, i); return b; };
async function scene(plane = {}, { size = SIZE, name = "packet.pdf", type = "application/pdf" } = {}) {
  const t = await members({ mai: ["contribute", "create_projects"] });
  const bytes = patterned(size);
  const file = new File([bytes], name, { type });
  /* `through(fn)` is a plane entry that looks at the request and sends it on to the owner as the page sent it */
  const forward = (req) => t.world.door({ url: req.url, init: req.init }, t.mai);
  const through = (look) => async (req) => { look(req); return forward(req); };
  const p = await openWorld("/app/capture/file", { world: t.world, as: t.mai, plane: typeof plane === "function" ? plane({ forward, through }) : plane });
  return { ...t, p, bytes, file, forward, through };
}
/* the scripted cue the owner gives a file above ITS request ceiling (capture R113: `TOO_LARGE` with `in_parts`); with the owner's real ceiling (100 MiB) above the page's own figure
   (65 MiB), no real file of a size the page sends in one request is refused it, so the cue is the one scripted answer */
const CUE = (bytes) => ({ captureupload: refusal(413, "TOO_LARGE", { in_parts: true, size: bytes, bound: 100 * MIB }) });
async function drive(p, until, rounds = 3000) {
  for (let i = 0; i < rounds && !until(); i++) { await p.clock.tick(1); await idle(p); }
  await idle(p);
}
const failedLine = (p) => main(p).querySelector('[data-parted="failed"]');

test("R2 (capture R113) a TOO_LARGE that carries in_parts begins the same upload in parts: the whole's digest first, the parts in order each under its own digest, then the completion, filed as an upload", async () => {
  const s = await scene(CUE(SIZE));
  const { p } = s;
  fill(p, FILLED(s.file));
  await press(p, "captureupload");
  assert.equal(p.byOp("captureupload").length, 1, "the one-request upload was tried and refused with the cue");
  await drive(p, () => p.byOp("promote").length > 0);
  const begin = p.byOp("captureuploadbegin")[0].body;
  assert.equal(begin.sha256, sha(s.bytes), "the whole file's digest, hashed in the page, declared at the begin");
  assert.equal(begin.bytes, SIZE);
  assert.match(begin.statement, /City hall/);
  assert.equal(begin.name, "packet.pdf");
  assert.equal(begin.type, "application/pdf");
  const parts = p.byOp("captureuploadpart");
  assert.deepEqual(parts.map((x) => Number(x.query.index)), [0, 1, 2], "parts in order");
  assert.deepEqual(parts.map((x) => x.body.size), [PART, PART, MIB], "each exactly the part size, the last the remainder");
  const cut = [0, 1, 2].map((i) => s.bytes.subarray(i * PART, (i + 1) * PART));
  assert.ok(parts.every((x, i) => x.query.sha256 === sha(cut[i])), "each part's digest is its own bytes'");
  assert.equal(new Set(parts.map((x) => x.query.upload)).size, 1, "and rides in the address with the upload's name");
  const done = p.byOp("captureuploadcomplete")[0].body;
  assert.equal(done.upload, parts[0].query.upload);
  assert.deepEqual(done.parts, cut.map(sha), "the parts' digests, in order");
  assert.equal(p.byOp("promote").length, 1, "the answer is filed as an upload's is");
  assert.deepEqual(p.byOp("promote")[0].body.register.map((r) => r.sha256), [sha(s.bytes)], "one row, the whole's (R21)");
  assert.ok(says(p, "screen.capture.file.done", { name: "packet.pdf" }));
  assert.equal(failedLine(p), null);
  assert.equal(main(p).querySelector("[data-parted]"), null, "the progress line is gone once it is filed");
  assert.equal(p.byOp("captureuploadabort").length, 0);
});

test("R2 (capture R113) the progress is drawn while the parts go: the file being checked, then part n of m", async () => {
  const seen = [];
  let s;
  s = await scene(({ through }) => ({ ...CUE(SIZE), captureuploadpart: through(() => seen.push(main(s.p).querySelector("[data-parted]") ? main(s.p).querySelector("[data-parted]").getAttribute("data-parted") : null)) }));
  fill(s.p, FILLED(s.file));
  await press(s.p, "captureupload");
  await drive(s.p, () => s.p.byOp("promote").length > 0);
  assert.deepEqual(seen, ["sending", "sending", "sending"], "a progress line is drawn while each part is out");
});

test("R2 (capture R113) a file above the page's own figure begins in parts at once: nothing is sent in one request", async () => {
  const s = await scene({}, { size: 4 * PART + MIB, name: "big.pdf" });
  fill(s.p, FILLED(s.file));
  await press(s.p, "captureupload");
  await drive(s.p, () => s.p.byOp("captureuploadcomplete").length > 0 && s.p.byOp("promote").length > 0, 4000);
  assert.equal(s.p.byOp("captureupload").length, 0, "no request carried the whole file");
  assert.equal(s.p.byOp("captureuploadbegin")[0].body.sha256, sha(s.bytes));
  const parts = s.p.byOp("captureuploadpart");
  assert.deepEqual(parts.map((x) => x.body.size), [PART, PART, PART, PART, MIB], "four parts of the part size and the remainder");
  assert.ok(parts.every((x, i) => x.query.sha256 === sha(s.bytes.subarray(i * PART, (i + 1) * PART))));
  assert.equal(s.p.byOp("promote").length, 1, "filed");
});

test("R2 (capture R113) control: a file under the figure is sent in one request, as before, and no part is begun", async () => {
  const s = await scene({}, { size: 9, name: "note.txt", type: "text/plain" });
  fill(s.p, FILLED(s.file));
  await press(s.p, "captureupload");
  assert.equal(s.p.byOp("captureupload").length, 1);
  assert.equal(s.p.byOp("captureuploadbegin").length, 0);
  assert.equal(s.p.byOp("promote").length, 1, "the owner took it whole and it is filed");
});

test("R2 (capture R113) control: a TOO_LARGE without the cue is the refusal beside the act, with its figures, and nothing is begun", async () => {
  /* a file over what the surface keeps even in parts is a size no test file should be; the owner's refusal of it is the one scripted answer */
  const s = await scene({ captureupload: refusal(413, "TOO_LARGE", { size: 300 * MIB, bound: 256 * MIB }) });
  fill(s.p, FILLED(s.file));
  const r = await press(s.p, "captureupload");
  assert.equal(s.p.byOp("captureuploadbegin").length, 0);
  assert.ok(r.slot().textContent.includes(`${300}.0`), "the size is in the refusal");
});

test("R2 (capture R113) a begin the plane refuses is drawn in its words, nothing is sent and nothing is aborted (nothing was begun)", async () => {
  /* the owner refuses a begin for a file over what it keeps, which needs a file of 256 MiB and more: its refusal is the one scripted answer */
  const s = await scene({ ...CUE(SIZE), captureuploadbegin: refusal(413, "TOO_LARGE", { size: 300 * MIB, bound: 256 * MIB, translation: "That file is bigger than a team may keep." }) });
  fill(s.p, FILLED(s.file));
  await press(s.p, "captureupload");
  await drive(s.p, () => failedLine(s.p) !== null);
  assert.ok(failedLine(s.p), "drawn failed");
  assert.equal(s.p.byOp("captureuploadpart").length, 0);
  assert.equal(s.p.byOp("captureuploadabort").length, 0);
});

test("R2 (capture R113) UPLOAD_LOST (the object was restarted) begins again once and sends the parts again; UPLOAD_EXPIRED the same", async () => {
  for (const code of ["UPLOAD_LOST", "UPLOAD_EXPIRED"]) {
    let lost = false;
    const s = await scene(({ forward }) => ({ ...CUE(SIZE), captureuploadpart: async (req) => {
      /* the lost upload is capture's real answer; an expired one is that answer under the expiry's code and status (410); an upload a real act cannot lose is the scripted fault */
      if (!lost && Number(req.query.index) === 1) { lost = true; return code === "UPLOAD_LOST" ? real(REAL.UPLOAD_LOST) : real(REAL.UPLOAD_LOST, { reason: code, code, status: 410 }); }
      return forward(req);
    } }));
    fill(s.p, FILLED(s.file));
    await press(s.p, "captureupload");
    await drive(s.p, () => s.p.byOp("promote").length > 0);
    assert.equal(s.p.byOp("captureuploadbegin").length, 2, `${code}: begun again, once`);
    assert.equal(s.p.byOp("captureuploadcomplete").length, 1);
    assert.equal(s.p.byOp("promote").length, 1, "and filed");
  }
});

test("R2 (capture R113) a part refused for another cause ends the upload: it is aborted, the refusal is drawn, nothing is completed or filed", async () => {
  const s = await scene(({ forward }) => ({ ...CUE(SIZE), captureuploadpart: (req) => (Number(req.query.index) === 1 ? real(REAL.PART_DIGEST_MISMATCH) : forward(req)) }));
  fill(s.p, FILLED(s.file));
  await press(s.p, "captureupload");
  await drive(s.p, () => failedLine(s.p) !== null);
  assert.ok(failedLine(s.p));
  assert.equal(s.p.byOp("captureuploadabort").length, 1, "what was begun is aborted");
  assert.equal(s.p.byOp("captureuploadabort")[0].body.upload, s.p.byOp("captureuploadpart")[0].query.upload);
  assert.equal(s.p.byOp("captureuploadcomplete").length, 0);
  assert.equal(s.p.byOp("promote").length, 0);
});

test("R2 (capture R113) PART_OUT_OF_ORDER resumes at the part the plane names; a part answered nothing is tried again", async () => {
  let first = true, silent = true;
  const s = await scene(({ forward }) => ({ ...CUE(SIZE), captureuploadpart: async (req) => {
    const i = Number(req.query.index);
    if (first && i === 1) { first = false; return refusal(409, "PART_OUT_OF_ORDER", { next: 0 }); }
    if (silent && i === 2) { silent = false; return { silent: true }; }
    return forward(req);
  } }));
  fill(s.p, FILLED(s.file));
  await press(s.p, "captureupload");
  await drive(s.p, () => s.p.byOp("promote").length > 0);
  assert.equal(s.p.byOp("promote").length, 1);
  assert.equal(failedLine(s.p), null);
  assert.equal(s.p.byOp("captureuploadabort").length, 0);
});

test("R2 (capture R113) a second press replaces the upload: the older loop sends nothing more", async () => {
  const s = await scene(CUE(SIZE));
  fill(s.p, FILLED(s.file));
  await press(s.p, "captureupload");
  await s.p.clock.tick(1); await idle(s.p);
  await press(s.p, "captureupload");
  await drive(s.p, () => s.p.byOp("promote").length > 0);
  const idx = s.p.byOp("captureuploadpart").map((x) => Number(x.query.index));
  assert.ok(idx.length <= 6 && s.p.byOp("promote").length === 1, `one filing; parts sent ${idx.join(",")}`);
});
