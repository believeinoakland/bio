/* file-safety R45 (T50; N1163 M-F2; K3480): the safe view of a plain-text file, and R21's SAFE_VIEW_TEXT_MAX. At the
   module's interface, over the scripted scanner and an evidence bucket whose reads are counted. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, enc, sha, T0 } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { SAFE_VIEW_TEXT_MAX, FILE_SAFETY_CHECKS } from "../../../src/file-safety/index.mjs";

const V = { viewer: "member:m1" };
const CHUNK = 16384;
/* every byte a read of a capture takes from the store: a stream pulled a chunk at a time, or a whole-object read */
function counted(w) {
  const read = { bytes: 0 };
  const orig = w.bucket.get.bind(w.bucket);
  w.bucket.get = async (k) => {
    const o = await orig(k);
    if (!o || !k.startsWith("bio/captures/")) return o;
    const b = new Uint8Array(await o.arrayBuffer());
    let off = 0;
    const body = new ReadableStream({ pull(c) {
      if (off >= b.length) { c.close(); return; }
      const part = b.subarray(off, off + CHUNK); off += part.length; read.bytes += part.length; c.enqueue(part);
    } }, { highWaterMark: 0 });
    return { key: k, size: b.length, body, arrayBuffer: async () => { read.bytes += b.length; return b.buffer.slice(b.byteOffset, b.byteOffset + b.length); } };
  };
  return read;
}
const chars = (s) => Array.from(s).length;

test("R45: the safe view of a two-line plain-text file a member uploaded answers kind text with both lines, as the file holds them, with no renderer bound, and is never sent to a renderer; each is counted as a safe view", async () => {
  const body = "first line, with <b>markup</b> and =SUM(A1:A2) and https://x.example/a\nsecond line\n";
  const n = world({ bound: false });
  const s = await n.capture(enc(body));
  const r = await n.fs.safeView({ captureSha: s, ...V });
  assert.ok(!(r instanceof Response));
  assert.deepEqual(Object.keys(r).sort(), ["derived", "kind", "of", "ok", "original", "text", "truncated"]);
  assert.deepEqual({ ...r, original: undefined }, { ok: true, kind: "text", derived: true, of: s, text: body, truncated: false, original: undefined });
  assert.deepEqual(r.original, (({ ok, captureSha, ...x }) => x)(await n.fs.originalState({ captureSha: s, ...V })));
  assert.equal(n.row("SELECT n FROM fs_counts WHERE kind = 'safe_views'").n, 1);
  /* a byte order mark is the file's own character and stays */
  const bom = await n.capture(enc("﻿hello\nthere\n"));
  assert.equal((await n.fs.safeView({ captureSha: bom, ...V })).text, "﻿hello\nthere\n");
  /* with a renderer bound it is never queued to render: nothing is asked of it */
  const w = world();
  const t = await w.capture(enc(body));
  assert.equal((await w.fs.safeView({ captureSha: t, ...V })).kind, "text");
  const b = await w.fs.renderBatch({});
  assert.deepEqual([b.ok, b.rendered, b.none, b.remaining], [true, 0, 1, 0]);
  assert.equal(w.calls("/render").length, 0);
  assert.equal(w.row("SELECT render_state FROM fs_files WHERE capture_sha = ?", t).render_state, "none");
  assert.equal((await w.fs.safeView({ captureSha: t, ...V })).text, body, "still, after the batch");
  /* its route */
  assert.equal(SAFE_VIEW_TEXT_MAX, 262_144);
});

test("R45: a text file over SAFE_VIEW_TEXT_MAX answers truncated true with exactly that many characters, and the store is read at most four bytes for each character kept, however large the file", async () => {
  const MAX = SAFE_VIEW_TEXT_MAX;
  const cases = [
    ["ascii", "ab\n".repeat(Math.ceil((MAX + 5000) / 3)), true],
    ["four-byte characters", "\u{1F600}x\n".repeat(MAX), true],
    ["two million characters", "line of text\n".repeat(160_000), true],
    ["exactly the maximum", "a".repeat(MAX), false],
    ["one over", "a".repeat(MAX + 1), true],
    ["one under", "a".repeat(MAX - 1), false],
  ];
  for (const [name, text, truncated] of cases) {
    const w = world();
    const s = await w.capture(enc(text));
    const read = counted(w);
    const r = await w.fs.safeView({ captureSha: s, ...V });
    assert.equal(r.kind, "text", name);
    assert.equal(r.truncated, truncated, name);
    assert.equal(chars(r.text), truncated ? MAX : chars(text), name);
    assert.equal(r.text, Array.from(text).slice(0, MAX).join(""), name);
    assert.ok(read.bytes <= 4 * MAX, `${name}: read ${read.bytes} bytes`);
    if (text.length > 4 * MAX) assert.ok(read.bytes < Buffer.byteLength(text), `${name}: not the whole file`);
    /* the grade and the original's state, which the answer carries, read no more either */
    const g = await w.fs.threatOf({ captureSha: s });
    assert.equal(g.format, "text", name);
    assert.ok(read.bytes <= 8 * MAX, name);
  }
  /* control: a whole-object read is seen by the count */
  const w = world();
  const s = await w.capture(enc("abc\n".repeat(400_000)));
  const read = counted(w);
  await w.fs.safeView({ captureSha: s, ...V });
  const one = read.bytes;
  const ev = w.record.evidenceStore();
  await (await ev.get(s)).arrayBuffer();
  assert.equal(read.bytes - one, 1_600_000, "the count sees a whole read");
});

test("R45: a text file under a scan hold still gets its safe view; the capture's bytes, digest, register entry and grade are as before", async () => {
  const w = world({ scan: { clamav: () => ({ result: "found", findings: ["Txt.Eicar.X"] }) } });
  const s = await w.capture(enc("line one\nline two\n"));
  const facts = () => JSON.stringify({ bytes: [...w.bucket.held.get(`bio/captures/${s}`)], register: w.rows("SELECT * FROM register"), grade: w.prov.captureGrade(s),
    locators: w.rows("SELECT * FROM captured_locators") });
  const before = facts();
  await w.fs.scanBatch({});
  assert.ok((await w.fs.threatOf({ captureSha: s })).scan_hold);
  const r = await w.fs.safeView({ captureSha: s, ...V });
  assert.deepEqual([r.ok, r.kind, r.text, r.original.may_open, r.original.why], [true, "text", "line one\nline two\n", false, "SCAN_HOLD"]);
  assert.equal(sha(w.bucket.held.get(`bio/captures/${s}`)), s);
  assert.equal(facts(), before);
  /* the sight refusals are R8's */
  assert.equal((await w.fs.safeView({ captureSha: sha("nothing"), ...V })).code, "FILE_NOT_HELD");
  w.project("PROJ-1", "m1"); w.home(s, "INFO-P", { project: "PROJ-1" });
  assert.equal((await w.fs.safeView({ captureSha: s, viewer: "member:m2" })).code, "FILE_NOT_HELD");
});

test("R45 control: a PNG, an HTML file, an SVG, a file holding a NUL, bytes that are not UTF-8 and an archive still answer NO_SAFE_VIEW (its words now naming plain text); a CSV is still data; a PDF is still queued and SAFE_VIEW_PENDING until rendered", async () => {
  const w = world();
  const row = FILE_SAFETY_CHECKS.NO_SAFE_VIEW;
  assert.equal(row.translation, word("refusal.NO_SAFE_VIEW"));
  assert.match(row.translation, /plain text/);
  const none = [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1]), enc("<!doctype html><html><body>hi</body></html>"),
    enc('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), new Uint8Array([0x61, 0x62, 0x00, 0x63, 0x0a]), new Uint8Array([0xff, 0xfe, 0xfd, 0x0a]),
    makeZip([{ name: "a", data: "a" }])];
  for (const [i, b] of none.entries()) {
    const r = await w.fs.safeView({ captureSha: await w.capture(b), ...V });
    assert.equal(r.code, "NO_SAFE_VIEW", String(i));
    assert.equal(r.translation, row.translation);
  }
  const csv = await w.fs.safeView({ captureSha: await w.capture(enc("year,amount\n2025,310000\n")), ...V });
  assert.deepEqual([csv.kind, csv.sheets.length], ["data", 1]);
  const p = await w.capture(pdf(false, "text-control"));
  assert.equal((await w.fs.safeView({ captureSha: p, ...V })).code, "SAFE_VIEW_PENDING");
  await w.fs.renderBatch({});
  assert.equal((await w.fs.safeView({ captureSha: p, ...V })).status, 200);
  assert.equal(w.calls("/render").length, 1);
});

test("R45 (B2): a file longer than 4 x SAFE_VIEW_TEXT_MAX bytes whose rest was not read is graded high with the reason unread (its original opens only by the warned path); a file of exactly that many bytes is judged whole; a PDF, a container or a compound file is read whole as before; the safe view still shows its first part within the bound", async () => {
  const MAX = SAFE_VIEW_TEXT_MAX, LIMIT = 4 * MAX;
  const w = world();
  const fill = (n) => enc("plain words here\n".repeat(Math.ceil(n / 17)).slice(0, n));
  const exact = await w.capture(fill(LIMIT));
  const over = await w.capture(fill(LIMIT + 1));
  const read = counted(w);
  const ge = await w.fs.threatOf({ captureSha: exact });
  assert.deepEqual([ge.format, ge.threat, ge.reasons.map((r) => r.code)], ["text", "low", []], "judged whole, as a file that ends within the start always was");
  assert.ok(read.bytes <= LIMIT);
  read.bytes = 0;
  const go = await w.fs.threatOf({ captureSha: over });
  assert.deepEqual([go.format, go.threat, go.reasons.map((r) => r.code)], ["text", "high", ["unread"]]);
  assert.equal(go.reasons.find((r) => r.code === "unread").translation, word("file-safety.part_file_read"));
  assert.ok(read.bytes <= LIMIT, String(read.bytes));
  read.bytes = 0;
  const v = await w.fs.safeView({ captureSha: over, ...V });
  assert.deepEqual([v.kind, v.truncated, chars(v.text)], ["text", true, MAX]);
  assert.ok(read.bytes <= LIMIT, String(read.bytes));
  assert.equal(v.original.path, "warned", "its original opens only by the warned path");
  /* a long PDF is still a PDF, read whole, its active content found */
  const longPdf = new Uint8Array([...pdf(true, "long"), ...enc("\n%" + "x".repeat(2 * LIMIT) + "\n")]);
  const lp = await w.capture(longPdf);
  read.bytes = 0;
  const lg = await w.fs.threatOf({ captureSha: lp });
  assert.equal(lg.format, "pdf");
  assert.ok(lg.reasons.some((x) => x.code.startsWith("active:")));
  assert.ok(!lg.reasons.some((x) => x.code === "unread"));
  assert.ok(read.bytes >= longPdf.length, "read whole");
  /* a file within the start is judged as it always was, the whole of it: a bad byte late in it is not text */
  const bad = await w.capture(new Uint8Array([...enc("fine text\n".repeat(1000)), 0xff, 0xfe, 0x0a]));
  assert.equal((await w.fs.threatOf({ captureSha: bad })).format, "unknown");
  assert.equal((await w.fs.safeView({ captureSha: bad, ...V })).code, "NO_SAFE_VIEW");
  assert.ok(T0);
});
