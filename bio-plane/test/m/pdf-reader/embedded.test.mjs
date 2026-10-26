/* pdf-reader: requirement-named tests for the embedded file's streaming hash (R22: an embedded file is "hashed as it streams,
 * never held"; fix round 9, G125e), at the module's interface. The record's `sha256` and `bytes` are checked against
 * node:crypto's digest of the same bytes; the memory test reads a 60 MiB embedded file in a process of its own. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractPdfStructure } from "../../../src/pdfstructure.mjs";
import { build, FONT_OBJS, FONTS, bytesOf } from "./pdf.mjs";

const CHILD = fileURLToPath(new URL("./memory-child.mjs", import.meta.url));
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
/** `n` bytes that do not compress to nothing and are not the same at any two lengths (a seeded linear congruence). */
const noise = (n, seed = 1) => { const b = new Uint8Array(n); let x = seed >>> 0; for (let i = 0; i < n; i++) { x = (Math.imul(x, 1664525) + 1013904223) >>> 0; b[i] = x >>> 24; } return b; };
const hexOf = (b) => Buffer.from(b).toString("hex").toUpperCase() + ">";

/** A one-page file with `data` attached by a FileAttachment annotation, the stream's dictionary entries `dict`. */
function withFile(stream, trailing = "") {
  return build({
    1: "<< /Type /Catalog /Pages 2 0 R >>", 2: "<< /Type /Pages /Kids [100 0 R] /Count 1 >>", ...FONT_OBJS,
    100: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << ${FONTS} >> /Contents 101 0 R /Annots [402 0 R] >>`,
    101: { data: "BT /F1 12 Tf 40 700 Td (page) Tj ET" },
    400: stream, 401: "<< /Type /Filespec /F (a.bin) /EF << /F 400 0 R >> >>",
    402: "<< /Type /Annot /Subtype /FileAttachment /Rect [0 0 1 1] /Contents (a.bin) /FS 401 0 R >>",
  }, { trailer: trailing });
}
const intra = (r) => r.links.filter((l) => l.partition === "intra" || l.target.why === "embedded_stream_undecodable");

const SIZES = [0, 1, 55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129, 1000, 4096, 100_003];

test("R22: an embedded file's sha256 and length are exact at every block boundary, unfiltered or Flate, whichever way the filter is written", async () => {
  for (const n of SIZES) {
    const data = noise(n, n + 7);
    const want = sha256(data);
    for (const [label, stream] of [
      ["unfiltered", { dict: "/Type /EmbeddedFile", data }],
      ["Flate", { dict: "/Type /EmbeddedFile /Filter /FlateDecode", data: new Uint8Array(deflateSync(data)) }],
      ["Fl", { dict: "/Type /EmbeddedFile /Filter /Fl", data: new Uint8Array(deflateSync(data, { level: 0 })) }],
      ["[Flate]", { dict: "/Type /EmbeddedFile /Filter [/FlateDecode]", data: new Uint8Array(deflateSync(data, { level: 9 })) }],
    ]) {
      const r = await extractPdfStructure(withFile(stream));
      const got = intra(r);
      assert.equal(got.length, 1, `${n} ${label}`);
      assert.equal(got[0].partition, "intra", `${n} ${label}: ${JSON.stringify(got[0].target)}`);
      assert.equal(got[0].target.sha256, want, `${n} ${label}`);
      assert.equal(got[0].target.bytes, n, `${n} ${label}`);
      assert.equal(got[0].target.name, "a.bin");
    }
  }
});

test("R22: the streams the streaming hash does not take are decoded whole as before and hash the same (ASCII stages, a Flate stream with bytes after its end, a predictor), and a stream that is not valid is stated undecodable", async () => {
  const data = noise(5000, 3);
  const want = sha256(data);
  const z = new Uint8Array(deflateSync(data));
  const cases = [
    ["ASCIIHex", { dict: "/Filter /ASCIIHexDecode", data: bytesOf(hexOf(data)) }, true],
    ["ASCIIHex then Flate", { dict: "/Filter [/ASCIIHexDecode /FlateDecode]", data: bytesOf(hexOf(z)) }, true],
    ["Flate with trailing bytes", { dict: "/Filter /FlateDecode", data: Uint8Array.from([...z, 0x0a, 0x0a, 0x0a]) }, true],
    ["a stream cut short", { dict: "/Filter /FlateDecode", data: z.subarray(0, z.length - 40) }, false],
    ["a filter it does not know", { dict: "/Filter /LZWDecode", data }, false],
  ];
  for (const [label, stream, ok] of cases) {
    const r = await extractPdfStructure(withFile(stream));
    const got = intra(r);
    assert.equal(got.length, 1, label);
    if (ok) {
      assert.equal(got[0].partition, "intra", label);
      assert.equal(got[0].target.sha256, want, label);
      assert.equal(got[0].target.bytes, data.length, label);
    } else {
      assert.equal(got[0].target.why, "embedded_stream_undecodable", label);
    }
  }
  /* a PNG predictor is undone, as it was: the record is the hash of what the predictor leaves */
  const cols = 10, rows = noise(cols * 6, 5);
  const framed = new Uint8Array(rows.length + 6);
  for (let r = 0; r < 6; r++) { framed[r * (cols + 1)] = 0; framed.set(rows.subarray(r * cols, r * cols + cols), r * (cols + 1) + 1); }
  const pred = await extractPdfStructure(withFile({ dict: `/Filter /FlateDecode /DecodeParms << /Predictor 12 /Columns ${cols} >>`, data: new Uint8Array(deflateSync(framed)) }));
  assert.equal(intra(pred)[0].target.sha256, sha256(rows));
});

function child(file) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, ["--expose-gc", CHILD, "embedded", file], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code, signal) => resolve({ code, signal, out, err }));
  });
}

test("R22: a 60 MiB embedded file is hashed without being held: heap + array buffers stay far under its size, and its hash is exact", async () => {
  /* 60 MiB of text that compresses to a small stream, so the file is small and everything held is what the reader holds */
  const unit = noise(4096, 11);
  const big = new Uint8Array(60 * 1048576);
  for (let o = 0; o < big.length; o += unit.length) big.set(unit, o);
  const want = sha256(big);
  const dir = mkdtempSync(join(tmpdir(), "pdf-embedded-"));
  try {
    const file = join(dir, "big.pdf");
    writeFileSync(file, withFile({ dict: "/Type /EmbeddedFile /Filter /FlateDecode", data: new Uint8Array(deflateSync(big, { level: 9 })) }));
    const r = await child(file);
    assert.equal(r.code, 0, r.err.slice(-400));
    const m = JSON.parse(r.out);
    assert.equal(m.ok, true);
    assert.deepEqual(m.intra, [{ sha: want, bytes: big.length }]);
    assert.ok(m.peakMB < 24, `peak ${m.peakMB.toFixed(1)} MB above the baseline for a 60 MiB embedded file`);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
