/* case-carriage — the marks members make on a photo and the copy derived from them (R9–R12; T37, N757, DEC-180 (2)–(5),
   K2108, K2206), driven at the module's interface: `obscureMark`, `photoMarks` and their route arms. The photos are PNGs
   built by the fixture and read back by its own decoder, so each covered and uncovered pixel is checked independently
   of `image-cover`; a progressive JPEG and a HEIC are refused by name. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, makePng, decodePng, sha, V, NOW } from "./fixture.mjs";
import { CASE_CARRIAGE_CHECKS, CASE_CARRIAGE_WORDS, OBSCURED_LABEL, PUBLISHED_LABEL, MARK_AREAS_MAX, STAFF_REASON_MAX, CASE_CARRIAGE_MARK_TABLES, caseCarriageOps,
         obscuredKey } from "../../../src/case-carriage/index.mjs";
import { COVER_MAX_BYTES } from "../../../src/image-cover/index.mjs";
import { readFile } from "node:fs/promises";

/* The design stream's words file (DEC-179), read whole: what this module reads by key (R11, R14). */
const WORDS = async () =>
  JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8")).words;
const ADA = V("ada");   // an active administrator, as the founder neither invited nor joined to the hidden project (D54)

const PHOTO = "INFO-2026-0020-photo";
const OLIVE = V("olive"), BEN = V("ben");
const W = 40, H = 30;
const PROGRESSIVE = Buffer.from([0xff, 0xd8, 0xff, 0xc2, 0, 11, 8, 0, 16, 0, 16, 1, 1, 0x11, 0, 0xff, 0xd9]);
const HEIC = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from("ftypheic"), Buffer.alloc(12)]);
const area = (rect, kind = "person", reason) => ({ rect, kind, ...(reason !== undefined ? { reason } : {}) });
const MARK_TABLES = ["photo_marks", "photo_mark_withdrawals", "photo_copies"];

function scene({ bytes = makePng(W, H), opts = {} } = {}) {
  const w = world();
  w.member("olive");
  w.member("ben");
  const p = w.photo(PHOTO, bytes, opts);
  return { w, p, original: Buffer.from(bytes) };
}
/* The copy the bucket holds for `copySha`, decoded. */
const copyOf = (w, copySha) => decodePng(w.bucket.held.get(obscuredKey("bio", copySha)).bytes);
/* Is pixel (x, y) inside a rect, snapped outward to whole pixels (PNG: no snapping)? */
const inside = (rects, x, y) => rects.some(([x0, y0, x1, y1]) => x >= x0 && x < x1 && y >= y0 && y < y1);
/* Every pixel of the copy: black inside a rect, the original's colour outside. */
function assertCovers(copy, original, rects, label = "") {
  const o = decodePng(original);
  assert.deepEqual([copy.width, copy.height], [o.width, o.height], label);
  for (let y = 0; y < o.height; y++)
    for (let x = 0; x < o.width; x++)
      assert.deepEqual(copy.at(x, y), inside(rects, x, y) ? [0, 0, 0] : o.at(x, y), `${label} pixel ${x},${y}`);
}
const marksRows = (w) => w.rows(`SELECT * FROM photo_marks ORDER BY mark`);

/* ---------------------------------------------------------------- R9 */

test("R9 obscureMark records one mark {mark, capture, areas, by, at} and answers as R10 after the act, with its copy derived (R11)", async () => {
  const { w, p, original } = scene();
  const r = await w.cc.obscureMark({ captureSha: p, by: OLIVE,
    areas: [area([2, 2, 10, 10]), area([20, 5, 30, 12], "plate"), area([0, 20, 6, 30], "staff", "a guard, not the subject")] });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.mark, 1);
  assert.equal(r.state, "marked");
  assert.equal(r.refused, null);
  assert.deepEqual(r.marks, [{ mark: 1, by: OLIVE, at: "2026-09-28T01:00:00.000Z", withdrawn: null,
    areas: [area([2, 2, 10, 10]), area([20, 5, 30, 12], "plate"), area([0, 20, 6, 30], "staff", "a guard, not the subject")] }]);
  assert.deepEqual(marksRows(w), [{ mark: 1, capture: p, by: OLIVE, at: "2026-09-28T01:00:00.000Z",
    areas: JSON.stringify(r.marks[0].areas) }]);
  /* the answer is R10's, after the act */
  const { mark, ...view } = r;
  void mark;
  assert.deepEqual(view, w.cc.photoMarks({ captureSha: p, viewer: OLIVE }));
  assert.deepEqual(r.copy, { sha256: r.copy.sha256, covered: 64 + 70 + 60, width: W, height: H });
  assertCovers(copyOf(w, r.copy.sha256), original, [[2, 2, 10, 10], [20, 5, 30, 12], [0, 20, 6, 30]]);
  /* a reason is kept only on a staff area; a capture is read case-insensitively; `sha256:` prefixed */
  const r2 = await w.cc.obscureMark({ captureSha: `sha256:${p.toUpperCase()}`, by: ` ${BEN} `,
                                      areas: [{ rect: [30, 20, 35, 25], kind: "person", reason: "dropped" }] });
  assert.equal(r2.ok, true);
  assert.deepEqual(r2.marks[1], { mark: 2, by: BEN, at: "2026-09-28T01:00:00.000Z", areas: [area([30, 20, 35, 25])], withdrawn: null });
});

test("R9 each refusal, in order, writes nothing and carries its C-141 row (MACHINE_CANNOT_MARK_PHOTO its own code, N790); a negative control for each records the mark; (D54) the founder and an administrator neither invited nor joined to a hidden project are answered NO_SUCH_PHOTO, a discoverable project's photo marked by both", async () => {
  const { w, p } = scene();
  w.member("ada", { role: "admin" });
  const text = w.doc("INFO-2026-0021-text");
  const hidden = w.photo("INFO-2026-0022-hidden", makePng(8, 8));
  w.fence("INFO-2026-0022-hidden", "PROJ-2026-0099");
  const open = w.photo("INFO-2026-0023-open", makePng(8, 8, () => [90, 160, 30]));
  w.fence("INFO-2026-0023-open", w.project("PROJ-2026-0098", { owner: "olive", visibility: "discoverable" }));
  const ok = [area([1, 1, 4, 4])];
  const cases = [
    ["MACHINE_CANNOT_MARK_PHOTO", { captureSha: p, areas: ok, by: undefined }, null],
    ["MACHINE_CANNOT_MARK_PHOTO", { captureSha: p, areas: ok, by: "  " }, null],
    ["MACHINE_CANNOT_MARK_PHOTO", { captureSha: p, areas: ok, by: "daemon" }, null],
    ["MACHINE_CANNOT_MARK_PHOTO", { captureSha: p, areas: ok, by: "claude" }, null],
    ["MACHINE_CANNOT_MARK_PHOTO", { captureSha: "nonsense", areas: "x", by: "agent" }, null],
    ["NO_SUCH_PHOTO", { captureSha: sha("never captured"), areas: ok, by: OLIVE }, null],
    ["NO_SUCH_PHOTO", { captureSha: "not-a-digest", areas: ok, by: OLIVE }, null],
    ["NO_SUCH_PHOTO", { captureSha: null, areas: ok, by: OLIVE }, null],
    ["NO_SUCH_PHOTO", { captureSha: hidden, areas: "malformed too", by: OLIVE }, null],
    /* D54 (K2408, K2442): the founder, in both spellings, and an active administrator neither invited nor joined to the
       hidden project see it only at EXISTENCE, never its photo */
    ["NO_SUCH_PHOTO", { captureSha: hidden, areas: ok, by: "admin" }, null],
    ["NO_SUCH_PHOTO", { captureSha: hidden, areas: ok, by: V("admin") }, null],
    ["NO_SUCH_PHOTO", { captureSha: hidden, areas: ok, by: ADA }, null],
    ["NOT_A_PHOTO", { captureSha: text, areas: "malformed too", by: OLIVE }, null],
    ["MARK_MALFORMED", { captureSha: p, areas: "x", by: OLIVE }, null],
    ["MARK_MALFORMED", { captureSha: p, areas: null, by: OLIVE }, null],
    ["MARK_MALFORMED", { captureSha: p, areas: Array.from({ length: MARK_AREAS_MAX + 1 }, () => area([1, 1, 2, 2])), by: OLIVE }, null],
    ["MARK_MALFORMED", { captureSha: p, areas: [area([1, 1, 4, 4], "staff"), area([1, 1, 4], "person")], by: OLIVE }, 1],
    ["MARK_MALFORMED", { captureSha: p, areas: [area([4, 1, 1, 4])], by: OLIVE }, 0],
    ["MARK_MALFORMED", { captureSha: p, areas: [area([1, 4, 4, 4])], by: OLIVE }, 0],
    ["MARK_MALFORMED", { captureSha: p, areas: [area([1, 1, 4.5, 4])], by: OLIVE }, 0],
    ["MARK_MALFORMED", { captureSha: p, areas: [area(["1", 1, 4, 4])], by: OLIVE }, 0],
    ["MARK_MALFORMED", { captureSha: p, areas: [area([1, 1, 4, 4], "face")], by: OLIVE }, 0],
    ["MARK_MALFORMED", { captureSha: p, areas: [[1, 1, 4, 4]], by: OLIVE }, 0],
    ["MARK_MALFORMED", { captureSha: p, areas: [null], by: OLIVE }, 0],
    ["STAFF_MARK_NO_REASON", { captureSha: p, areas: [area([1, 1, 4, 4]), area([1, 1, 4, 4], "staff")], by: OLIVE }, 1],
    ["STAFF_MARK_NO_REASON", { captureSha: p, areas: [area([1, 1, 4, 4], "staff", 7)], by: OLIVE }, 0],
    ["STAFF_MARK_NO_REASON", { captureSha: p, areas: [area([1, 1, 4, 4], "staff", "   ")], by: OLIVE }, 0],
    ["STAFF_MARK_NO_REASON", { captureSha: p, areas: [area([1, 1, 4, 4], "staff", "x".repeat(STAFF_REASON_MAX + 1))], by: OLIVE }, 0],
    ["STAFF_MARK_NO_REASON", { captureSha: p, areas: [area([100, 100, 104, 104], "staff")], by: OLIVE }, 0],
    ["AREA_OUTSIDE", { captureSha: p, areas: [area([1, 1, 4, 4]), area([W, 0, W + 5, 5], "plate")], by: OLIVE }, 1],
    ["AREA_OUTSIDE", { captureSha: p, areas: [area([-9, -9, -1, -1])], by: OLIVE }, 0],
  ];
  const before = w.snapshot(), puts = w.bucket.calls.length;
  for (const [code, args, at] of cases) {
    const r = await w.cc.obscureMark(args);
    assert.equal(r.ok, false, `${code}: ${JSON.stringify(args).slice(0, 120)}`);
    assert.equal(r.code, code, `${JSON.stringify(args).slice(0, 120)} → ${JSON.stringify(r)}`);
    assert.equal(r.reason, code);
    assert.equal(r.check, CASE_CARRIAGE_CHECKS[code].check);
    assert.equal(r.translation, CASE_CARRIAGE_CHECKS[code].translation);
    assert.ok(typeof r.detail === "string" && r.detail.length > 5, code);
    if (at !== null) assert.equal(r.area, at, `${code} names the area`);
    if (code === "AREA_OUTSIDE") assert.match(r.detail, /outside/, "image-cover's detail, relayed");
  }
  assert.deepEqual(w.snapshot(), before, "no refusal wrote anything");
  assert.equal(w.bucket.calls.filter((c) => c[0] === "put").length, puts, "nor held a copy");
  /* the rows: C-141.1–C-141.10 (R14's from .7), each with its where and its words */
  assert.deepEqual(Object.entries(CASE_CARRIAGE_CHECKS).map(([k, v]) => [k, v.check]), [["MACHINE_CANNOT_MARK_PHOTO", "C-141.1"],
    ["NO_SUCH_PHOTO", "C-141.2"], ["NOT_A_PHOTO", "C-141.3"], ["MARK_MALFORMED", "C-141.4"], ["STAFF_MARK_NO_REASON", "C-141.5"],
    ["AREA_OUTSIDE", "C-141.6"], ["MACHINE_CANNOT_WITHDRAW_MARK", "C-141.7"], ["NO_SUCH_MARK", "C-141.8"],
    ["MARK_ALREADY_WITHDRAWN", "C-141.9"], ["WITHDRAW_NO_REASON", "C-141.10"], ["DOCUMENT_COPY_NO_STORE", "C-141.11"]]);
  for (const v of Object.values(CASE_CARRIAGE_CHECKS)) assert.match(v.where, /^src\/case-carriage\/index\.mjs \S+ > is-[a-z-]+$/);
  /* negative controls: the same acts, made right, are recorded */
  for (const [label, args] of [["a member", { captureSha: p, areas: ok, by: OLIVE }],
                               ["MARK_AREAS_MAX areas", { captureSha: p, areas: Array.from({ length: MARK_AREAS_MAX }, () => area([1, 1, 2, 2])), by: OLIVE }],
                               ["a staff area with a reason at the bound", { captureSha: p, areas: [area([1, 1, 4, 4], "staff", "x".repeat(STAFF_REASON_MAX))], by: OLIVE }],
                               ["an area partly outside", { captureSha: p, areas: [area([W - 2, H - 2, W + 9, H + 9], "plate")], by: OLIVE }],
                               ["(D54) the founder marks a discoverable project's photo", { captureSha: open, areas: ok, by: "admin" }],
                               ["(D54) an administrator marks a discoverable project's photo", { captureSha: open, areas: ok, by: ADA }]]) {
    const r = await w.cc.obscureMark(args);
    assert.equal(r.ok, true, `${label}: ${JSON.stringify(r).slice(0, 200)}`);
  }
  /* (D54) negative control for the hidden photo: taken out of the project, the founder marks it */
  w.fence("INFO-2026-0022-hidden", null);
  assert.equal((await w.cc.obscureMark({ captureSha: hidden, areas: ok, by: "admin" })).ok, true);
  assert.equal(w.count("photo_marks"), 7);
});

test("R9 R11 areas: [] records \"nothing to obscure\" and derives the photo's copy with nothing covered and no metadata (N779); a later \"nothing to obscure\" never removes an area; no act changes or erases a mark", async () => {
  const { w, p, original } = scene();
  const none = await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
  assert.deepEqual([none.ok, none.state, none.refused, none.marks.length], [true, "nothing_to_obscure", null, 1]);
  assert.deepEqual(none.copy, { sha256: none.copy.sha256, covered: 0, width: W, height: H }, "a copy, nothing covered");
  assertCovers(copyOf(w, none.copy.sha256), original, [], "every pixel the original's");
  assert.equal(copyOf(w, none.copy.sha256).chunks.includes("tEXt"), false, "nothing of the original but its pixels");
  assert.deepEqual(w.bucket.held.get(obscuredKey("bio", none.copy.sha256)).opts.customMetadata, { derived: "obscured", original: p, label: PUBLISHED_LABEL },
                   "labelled derived, naming its original; (T40) PUBLISHED_LABEL, since nothing is covered");
  assert.equal(w.count("photo_copies"), 1);
  const marked = await w.cc.obscureMark({ captureSha: p, areas: [area([3, 3, 9, 9])], by: BEN });
  assert.equal(marked.state, "marked");
  const after = await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
  assert.equal(after.state, "marked", "the area stands");
  assert.deepEqual(after.marks.map((m) => [m.mark, m.by, m.areas.length, m.withdrawn]), [[1, OLIVE, 0, null], [2, BEN, 1, null], [3, OLIVE, 0, null]]);
  assert.equal(after.copy.sha256, marked.copy.sha256, "the copy still covers it");
  assertCovers(copyOf(w, after.copy.sha256), original, [[3, 3, 9, 9]]);
});

/* ---------------------------------------------------------------- R10 */

test("R10 photoMarks answers unchecked, nothing_to_obscure and marked, its marks oldest first, the copy and refused; synchronous, no bucket read, writes nothing", async () => {
  const { w, p } = scene();
  const look = () => w.cc.photoMarks({ captureSha: p, viewer: BEN });
  assert.deepEqual(look(), { ok: true, capture: p, photo: true, state: "unchecked", marks: [], copy: null, refused: null });
  await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
  w.clock.now = "2026-09-28T02:00:00Z";
  await w.cc.obscureMark({ captureSha: p, areas: [area([1, 1, 5, 5])], by: BEN });
  const calls = [w.bucket.calls.length, w.evidence.calls.length], before = w.snapshot();
  const r = look();
  assert.equal(typeof r.then, "undefined", "synchronous");
  assert.deepEqual(r.marks, [{ mark: 1, areas: [], by: OLIVE, at: "2026-09-28T01:00:00.000Z", withdrawn: null },
                             { mark: 2, areas: [area([1, 1, 5, 5])], by: BEN, at: "2026-09-28T02:00:00.000Z", withdrawn: null }]);
  assert.equal(r.state, "marked");
  assert.deepEqual(Object.keys(r.copy), ["sha256", "covered", "width", "height"]);
  assert.deepEqual([w.bucket.calls.length, w.evidence.calls.length], calls, "reads no bucket");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* nothing_to_obscure, alone */
  const w2 = scene().w;
  const p2 = w2.photo("INFO-2026-0023-other", makePng(6, 6));
  await w2.cc.obscureMark({ captureSha: p2, areas: [], by: OLIVE });
  assert.equal(w2.cc.photoMarks({ captureSha: p2, viewer: OLIVE }).state, "nothing_to_obscure");
});

test("R10 a capture that is not an image answers photo false; one not held or not seen NO_SUCH_PHOTO, (D54) the founder's and an administrator's sight of a hidden project's photo included; a photo is told by its recorded type, else its path's extension; never throws", () => {
  const { w, p } = scene();
  const text = w.doc("INFO-2026-0021-text");
  assert.deepEqual(w.cc.photoMarks({ captureSha: text, viewer: OLIVE }), { ok: true, capture: text, photo: false });
  const typedTxt = w.photo("INFO-2026-0024-typed", makePng(4, 4), { name: "upload.bin", contentType: "image/png" });
  const jpgNotImage = w.photo("INFO-2026-0025-misnamed", Buffer.from("plain words"), { name: "notes.jpg", contentType: "text/plain" });
  const untypedJpg = w.photo("INFO-2026-0026-untyped", PROGRESSIVE, { name: "IMG_1.JPG", contentType: null });
  const untypedPdf = w.photo("INFO-2026-0027-pdf", Buffer.from("%PDF-1.7"), { name: "scan.pdf", contentType: null });
  const heic = w.photo("INFO-2026-0028-heic", HEIC, { name: "IMG_2.HEIC", contentType: null });
  assert.deepEqual([typedTxt, jpgNotImage, untypedJpg, untypedPdf, heic].map((s) => w.cc.photoMarks({ captureSha: s, viewer: OLIVE }).photo),
                   [true, false, true, false, true]);
  const hidden = w.photo("INFO-2026-0022-hidden", makePng(8, 8));
  w.fence("INFO-2026-0022-hidden", "PROJ-2026-0099");
  w.member("ada", { role: "admin" });
  const open = w.photo("INFO-2026-0030-open", makePng(8, 8, () => [90, 160, 30]));
  w.fence("INFO-2026-0030-open", w.project("PROJ-2026-0098", { owner: "olive", visibility: "discoverable" }));
  const orphan = sha("registered on no bundle");
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, 'INFO-2026-0999-gone', 'snapshots/x.png', 'binary', 5, ?)`, orphan, NOW);
  for (const [label, args] of [["not seen", { captureSha: hidden, viewer: OLIVE }],
                               ["(D54) the founder, neither invited nor joined", { captureSha: hidden, viewer: "admin" }],
                               ["(D54) the founder, as a member viewer", { captureSha: hidden, viewer: V("admin") }],
                               ["(D54) an administrator, neither invited nor joined", { captureSha: hidden, viewer: ADA }],
                               ["never captured", { captureSha: sha("x"), viewer: OLIVE }],
                               ["on no bundle", { captureSha: orphan, viewer: OLIVE }], ["no viewer", { captureSha: p, viewer: "" }],
                               ["not a digest", { captureSha: "zz", viewer: OLIVE }], ["nothing", undefined]]) {
    const r = w.cc.photoMarks(args);
    assert.deepEqual([r.ok, r.code, r.check], [false, "NO_SUCH_PHOTO", "C-141.2"], label);
  }
  /* (D54) negative controls: a discoverable project's photo is seen whole by the founder and an administrator; the
     hidden one, once out of the project */
  for (const viewer of ["admin", ADA]) assert.equal(w.cc.photoMarks({ captureSha: open, viewer }).ok, true, `${viewer} sees the discoverable project's photo`);
  w.fence("INFO-2026-0022-hidden", null);
  assert.equal(w.cc.photoMarks({ captureSha: hidden, viewer: "admin" }).ok, true, "negative control: out of the hidden project, the founder sees it");
  w.st.sql.exec(`DROP TABLE photo_marks`);
  assert.doesNotThrow(() => w.cc.photoMarks({ captureSha: p, viewer: OLIVE }));
  assert.equal(w.cc.photoMarks({ captureSha: p, viewer: OLIVE }).ok, false);
});

/* ---------------------------------------------------------------- R11 */

test("R11 the copy covers every area of every mark, two members marking at once included; held under its own SHA-256 at <store>/obscured/<sha>, labelled derived and naming its original; never registered, never a capture; the original unchanged", async () => {
  const { w, p, original } = scene();
  const files = w.snapshot().files, register = w.snapshot().register;
  /* two members mark at once: neither waits for the other's answer */
  const [a, b] = await Promise.all([
    w.cc.obscureMark({ captureSha: p, areas: [area([1, 1, 8, 8])], by: OLIVE }),
    w.cc.obscureMark({ captureSha: p, areas: [area([25, 15, 39, 29], "plate")], by: BEN })]);
  assert.deepEqual([a.ok, b.ok, a.mark, b.mark], [true, true, 1, 2]);
  assertCovers(copyOf(w, a.copy.sha256), original, [[1, 1, 8, 8]], "the first covers every area up to it");
  assertCovers(copyOf(w, b.copy.sha256), original, [[1, 1, 8, 8], [25, 15, 39, 29]], "the second covers both");
  assert.equal(w.cc.photoMarks({ captureSha: p, viewer: OLIVE }).copy.sha256, b.copy.sha256, "the current copy is the latest");
  for (const c of [a.copy.sha256, b.copy.sha256]) {
    const held = w.bucket.held.get(`bio/obscured/${c}`);
    assert.equal(sha(held.bytes), c, "under its own digest");
    assert.deepEqual(held.opts, { sha256: c, customMetadata: { derived: "obscured", original: p, label: OBSCURED_LABEL } });
  }
  assert.ok([...w.bucket.held.keys()].every((k) => k.startsWith("bio/obscured/") && !k.includes("captures/")));
  assert.equal(w.snapshot().register, register, "never registered");
  assert.equal(w.snapshot().files, files, "never a file of the record");
  assert.ok(!w.evidence.calls.some((c) => c[0] === "put"), "nothing put in the evidence store");
  assert.deepEqual(w.evidence.held.get(p), original, "the original is unchanged");
  assert.equal(w.rows(`SELECT * FROM register WHERE capture_sha IN (?, ?)`, a.copy.sha256, b.copy.sha256).length, 0);
  /* nothing of the original but its pixels: its comment chunk is not carried */
  assert.deepEqual(decodePng(original).chunks.includes("tEXt"), true);
  assert.equal(copyOf(w, b.copy.sha256).chunks.includes("tEXt"), false);
  /* the store's namespace, as given */
  const w2 = scene().w;
  w2.cc.store = () => "scratch";
  const p2 = w2.photo("INFO-2026-0029-scratch", makePng(10, 10));
  const r2 = await w2.cc.obscureMark({ captureSha: p2, areas: [area([0, 0, 3, 3])], by: OLIVE });
  assert.ok(w2.bucket.held.has(`scratch/obscured/${r2.copy.sha256}`));
});

test("R11 (T40) OBSCURED_LABEL is words.json's photo.obscured.label and PUBLISHED_LABEL its photo.published.label, read by key, each held once here; a derived copy's stored label follows: OBSCURED_LABEL when it covers an area, else PUBLISHED_LABEL", async () => {
  const words = await WORDS();
  const en = (k) => { const x = words.find((w) => w.key === k); assert.ok(x, `words.json holds ${k}`); return x; };
  assert.equal(OBSCURED_LABEL, en("photo.obscured.label").en);
  assert.equal(PUBLISHED_LABEL, en("photo.published.label").en);
  assert.equal(OBSCURED_LABEL, "Faces, plates and camera details removed for publication; the group holds the original");
  assert.equal(PUBLISHED_LABEL, "Camera details removed for publication; the group holds the original");
  assert.ok(en("photo.obscured.label").protected && en("photo.published.label").protected, "protected words (DEC-179)");
  /* every word this module holds is its key's `en`, verbatim */
  for (const [k, v] of Object.entries(CASE_CARRIAGE_WORDS)) assert.equal(v, en(k).en, k);
  /* negative control: BOB's draft is gone, and the two labels differ */
  assert.notEqual(OBSCURED_LABEL, "Faces and plates obscured for publication; the group holds the original");
  assert.notEqual(OBSCURED_LABEL, PUBLISHED_LABEL);
  /* the stored label of each copy, through the act */
  const { w, p } = scene();
  const label = (c) => w.bucket.held.get(obscuredKey("bio", c)).opts.customMetadata.label;
  const none = await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
  assert.equal(label(none.copy.sha256), PUBLISHED_LABEL, "nothing covered");
  const marked = await w.cc.obscureMark({ captureSha: p, areas: [area([1, 1, 4, 4])], by: BEN });
  assert.equal(label(marked.copy.sha256), OBSCURED_LABEL, "an area covered");
  const back = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: marked.mark, reason: "not a person", by: OLIVE });
  assert.equal(back.copy.sha256, none.copy.sha256, "the same pixels, the same copy");
  assert.equal(label(back.copy.sha256), PUBLISHED_LABEL, "after the area's withdrawal, nothing covered");
});

test("R11 a cover image-cover refuses by name records the mark with no copy and names the code, whether the photo is marked or not: a progressive JPEG, a HEIC, a photo over COVER_MAX_BYTES (nothing over the bound fetched)", async () => {
  for (const [label, bytes, opts, code] of [["progressive JPEG", PROGRESSIVE, { name: "IMG.jpg", contentType: "image/jpeg" }, "UNSUPPORTED_JPEG_PROCESS"],
                                            ["HEIC", HEIC, { name: "IMG.heic", contentType: "image/heic" }, "NOT_A_COVERABLE_FORMAT"]]) {
    const { w, p } = scene({ bytes, opts });
    const r = await w.cc.obscureMark({ captureSha: p, areas: [area([0, 0, 4, 4])], by: OLIVE });
    assert.deepEqual([r.ok, r.state, r.copy, r.refused.code], [true, "marked", null, code], label);
    assert.ok(typeof r.refused.detail === "string" && r.refused.detail, label);
    assert.equal(w.count("photo_marks"), 1, `${label}: the mark stays recorded`);
    assert.equal(w.bucket.held.size, 0, `${label}: no copy`);
    assert.deepEqual(w.cc.photoMarks({ captureSha: p, viewer: OLIVE }).refused, r.refused);
    /* unmarked, "nothing to obscure": refused all the same (N779: every photo leaves only as its copy) */
    const u = scene({ bytes, opts });
    const n = await u.w.cc.obscureMark({ captureSha: u.p, areas: [], by: OLIVE });
    assert.deepEqual([n.ok, n.state, n.copy, n.refused && n.refused.code], [true, "nothing_to_obscure", null, code], `${label}, unmarked`);
  }
  const { w, p } = scene();
  w.evidence.held.set(p, Buffer.alloc(COVER_MAX_BYTES + 1));
  const r = await w.cc.obscureMark({ captureSha: p, areas: [area([0, 0, 4, 4])], by: OLIVE });
  assert.deepEqual([r.ok, r.copy, r.refused.code], [true, null, "PHOTO_TOO_LARGE"]);
  assert.deepEqual(w.evidence.calls.filter((c) => c[1] === p).map((c) => c[0]), ["head"], "only its size was read");
});

test("R11 with no bytes to cover (no evidence store, the original absent or at another digest) or no bucket to hold the copy in, the mark is recorded with no copy (fail closed); the next mark derives again", async () => {
  for (const [label, spoil] of [["no evidence store", (w) => { w.record.evidenceStore = () => null; }],
                                ["the original absent", (w, p) => { w.evidence.held.delete(p); }],
                                ["the original at another digest", (w, p) => { w.evidence.held.set(p, makePng(W, H, () => [9, 9, 9])); }],
                                ["no bucket", (w) => { w.cc.bucket = null; }],
                                ["the bucket refuses", (w) => { w.cc.bucket = { put: async () => { throw new Error("down"); } }; }]]) {
    const { w, p } = scene();
    const bucket = w.cc.bucket, store = w.record.evidenceStore, held = w.evidence.held.get(p);
    spoil(w, p);
    const r = await w.cc.obscureMark({ captureSha: p, areas: [area([0, 0, 4, 4])], by: OLIVE });
    assert.deepEqual([r.ok, r.state, r.copy, r.refused], [true, "marked", null, null], label);
    w.cc.bucket = bucket;
    w.record.evidenceStore = store;
    w.evidence.held.set(p, held);
    const again = await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
    assert.equal(again.state, "marked");
    assert.ok(again.copy && again.copy.sha256, `${label}: derived again`);
  }
});

/* ---------------------------------------------------------------- R12 */

test("R12 the marks, their withdrawals and the copies are declared to record-core with their classes, append-only (version_chain); no act of this module rewrites or removes a mark or withdrawal row", async () => {
  const { w, p } = scene();
  assert.deepEqual(w.cc.marksDeclaration && w.cc.marksDeclaration.ok, true, JSON.stringify(w.cc.marksDeclaration));
  const declared = w.record.declaredTables().filter((d) => MARK_TABLES.includes(d.name));
  assert.deepEqual(declared.map((d) => [d.name, d.module ?? "case-carriage", d.version_chain, d.purge, d.export, d.sight, d.derive, d.expunge]),
                   CASE_CARRIAGE_MARK_TABLES.map((t) => [t.name, "case-carriage", true, "clear", "admin-only", "source", "stored", "none"]));
  /* every act this module offers, then the rows: each earlier row unchanged, none removed */
  const seen = [];
  const acts = [
    () => w.cc.obscureMark({ captureSha: p, areas: [area([0, 0, 3, 3])], by: OLIVE }),
    () => w.cc.obscureMark({ captureSha: p, areas: [], by: BEN }),
    () => w.cc.obscureMark({ captureSha: p, areas: [area([W + 1, 0, W + 4, 3])], by: OLIVE }),
    () => w.cc.obscureMark({ captureSha: p, areas: "x", by: OLIVE }),
    () => w.cc.photoMarks({ captureSha: p, viewer: OLIVE }),
    () => w.cc.marksLapsed({ format: "bio-case-document/7", materials: [] }),
    () => w.cc.holdMaterials({ format: "bio-case-document/7", materials: [] }, { caseId: "CASE-2026-0001", edition: 1, at: NOW }),
    () => w.cc.obscureMark({ captureSha: p, areas: [area([5, 5, 9, 9], "staff", "at work")], by: BEN }),
    () => w.cc.obscureMarkWithdraw({ captureSha: p, mark: 1, reason: "drawn on the wrong face", by: BEN }),
    () => w.cc.obscureMarkWithdraw({ captureSha: p, mark: 1, reason: "again", by: OLIVE }),
    () => w.cc.obscureMarkWithdraw({ captureSha: p, mark: 99, reason: "no such", by: OLIVE }),
    () => w.cc.obscureMarkWithdraw({ captureSha: p, mark: 2, reason: "the nothing-to-obscure was early", by: OLIVE }),
    () => w.cc.obscureMarkWithdraw({ captureSha: p, mark: 3, reason: "", by: OLIVE }),
    () => w.cc.obscureMarkWithdraw({ captureSha: p, mark: 3, reason: "the guard has left the frame", by: OLIVE }),
    () => w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE }),
  ];
  for (const act of acts) {
    await act();
    const rows = { marks: marksRows(w), withdrawals: w.rows(`SELECT * FROM photo_mark_withdrawals ORDER BY withdrawal`),
                   copies: w.rows(`SELECT * FROM photo_copies ORDER BY seq`) };
    for (const k of ["marks", "withdrawals", "copies"]) {
      const prev = seen.length ? seen.at(-1)[k] : [];
      assert.deepEqual(rows[k].slice(0, prev.length), prev, `${k}: earlier rows unchanged, none removed`);
    }
    seen.push(rows);
  }
  assert.deepEqual(seen.at(-1).marks.map((m) => m.mark), [1, 2, 3, 4]);
  assert.deepEqual(seen.at(-1).withdrawals.map((x) => x.mark), [1, 2, 3], "each withdrawal its own row, beside its mark");
});

test("R12 nothing of a mark or a withdrawal leaves the group in a case's bytes: each copy carries only covered pixels, never a rectangle, kind, reason or maker", async () => {
  const { w, p } = scene();
  const reason = "the inspector at work, named in the minutes", why = "the plate belongs to the group's own van";
  const r = await w.cc.obscureMark({ captureSha: p, areas: [area([2, 2, 9, 9], "staff", reason)], by: OLIVE });
  await w.cc.obscureMark({ captureSha: p, areas: [area([20, 20, 30, 28], "plate")], by: BEN });
  const back = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: 2, reason: why, by: OLIVE });
  assert.equal(back.ok, true, JSON.stringify(back));
  for (const c of [r.copy.sha256, back.copy.sha256]) {
    const bytes = w.bucket.held.get(`bio/obscured/${c}`).bytes;
    for (const s of [reason, why, "staff", "plate", "olive", "ben", OLIVE, BEN, "2,2,9,9", "20,20,30,28", "rect", "withdraw"])
      assert.equal(bytes.includes(Buffer.from(s)), false, `the copy carries no ${s}`);
    const copy = decodePng(bytes);
    assert.deepEqual(copy.chunks.filter((x) => !["IHDR", "PLTE", "IDAT", "IEND", "tRNS"].includes(x)), [], "no other chunk");
  }
});

/* ---------------------------------------------------------------- the route arms (R9, R10) */

test("R9 R10 R14 the route arms obscuremark, photomarks and obscuremarkwithdraw read the capture from the query or the body, the areas, mark and reason from the body, and by and viewer from the query only", async () => {
  const { w, p } = scene();
  const url = (q) => new URL(`https://plane.example/op?${new URLSearchParams(q)}`);
  const marked = await caseCarriageOps(w.cc, url({ op: "obscuremark", by: OLIVE }),
                                       { captureSha: p, areas: [area([0, 0, 3, 3])], by: "member:forged" }).obscuremark();
  assert.equal(marked.ok, true);
  assert.equal(marked.marks[0].by, OLIVE, "by from the query, never the body");
  const machine = await caseCarriageOps(w.cc, url({ capture: p }), { areas: [], by: OLIVE }).obscuremark();
  assert.equal(machine.code, "MACHINE_CANNOT_MARK_PHOTO", "a by only in the body is no by");
  const seen = caseCarriageOps(w.cc, url({ capture: p, viewer: BEN }), { viewer: "admin" }).photomarks();
  assert.deepEqual([seen.ok, seen.state, seen.marks.length], [true, "marked", 1]);
  assert.equal(caseCarriageOps(w.cc, url({ capture: p }), { viewer: OLIVE }).photomarks().code, "NO_SUCH_PHOTO",
               "a viewer only in the body is no viewer");
  /* R14's arm: the mark and reason from the body, by from the query only */
  const forged = await caseCarriageOps(w.cc, url({ capture: p }), { mark: 1, reason: "r", by: OLIVE }).obscuremarkwithdraw();
  assert.equal(forged.code, "MACHINE_CANNOT_WITHDRAW_MARK", "a by only in the body is no by");
  const back = await caseCarriageOps(w.cc, url({ op: "obscuremarkwithdraw", by: BEN }),
                                     { captureSha: p, mark: "1", reason: "covered the wrong person", by: "member:forged" }).obscuremarkwithdraw();
  assert.deepEqual([back.ok, back.mark, back.state, back.marks[0].withdrawn.by], [true, 1, "unchecked", BEN]);
});
