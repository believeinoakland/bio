/* The ooxml module at the beta's figures (T53-503; build/requirements/ooxml.md R6, R30, R31, R35). Every limit the module keeps is a
 * `READ_BOUNDS` row taken through `boundOf`, at whichever figure is active; these tests hold it at each row's `standard` column too, whether or
 * not that column is active yet: the module is evaluated once more against a `boundOf` that answers the standard column of the real table, so
 * no figure is written here, and the reading is shown to hold there, a part larger than the alpha cut and read in pieces without being held. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createDeflateRaw, crc32 as zcrc32 } from "node:zlib";
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { READ_BOUNDS } from "../../../src/read-bounds.mjs";
import { buildZip } from "./zip.mjs";
import { makeZip } from "../../make-zip.mjs";

const MIB = 1024 * 1024;
const SRC = new URL("../../../src/", import.meta.url);

/* The module as it evaluates when every row's `standard` figure is the active one. */
const dir = mkdtempSync(join(tmpdir(), "ooxml-standard-"));
copyFileSync(fileURLToPath(new URL("ooxml.mjs", SRC)), join(dir, "ooxml.mjs"));
writeFileSync(join(dir, "read-bounds.mjs"), [
  `import { READ_BOUNDS } from ${JSON.stringify(new URL("read-bounds.mjs", SRC).href)};`,
  "export const boundOf = (kind, name) => READ_BOUNDS[kind][name].standard;",
].join("\n"));
const S = await import(pathToFileURL(join(dir, "ooxml.mjs")).href);
process.once("exit", () => rmSync(dir, { recursive: true, force: true }));

const std = (kind, row) => READ_BOUNDS[kind][row].standard;
const alpha = (kind, row) => READ_BOUNDS[kind][row].alpha;
const { readContainer, readPart, readPartPieces, listArchive, streamMember, textPlan, sizeGuard, cutAfterTag } = S;

const LIMIT_ROWS = {
  ARCHIVE_ENTRIES_MAX: ["archive", "members"], ARCHIVE_TOTAL_MAX: ["archive", "unpacked_bytes"], MEMBER_MAX: ["archive", "member_bytes"],
  OFFICE_ENTRIES_MAX: ["office", "entries"], ARCHIVE_DIRECTORY_MAX: ["archive", "directory"], ARCHIVE_NAME_MAX: ["archive", "name"],
  ARCHIVE_RATIO_MAX: ["archive", "ratio"], ARCHIVE_DEPTH_MAX: ["archive", "depth"], ARCHIVE_TREE_TOTAL_MAX: ["archive", "unpacked_bytes"],
  ARCHIVE_TREE_ENTRIES_MAX: ["archive", "members"],
};

/** A member of `mib` MiB of the 1 MiB `chunk` repeated, deflated as a stream (the data is never held), in a one-member archive. */
async function repeated(name, chunk, mib) {
  const deflate = createDeflateRaw();
  const out = [];
  deflate.on("data", (b) => out.push(b));
  const ended = new Promise((resolve) => deflate.once("end", resolve));
  let crc = 0;
  for (let i = 0; i < mib; i++) {
    crc = zcrc32(chunk, crc);
    if (!deflate.write(chunk)) await new Promise((resolve) => deflate.once("drain", resolve));
  }
  deflate.end();
  await ended;
  const size = mib * MIB;
  return buildZip([{ name, data: "", compressed: new Uint8Array(Buffer.concat(out)), local: { crc, usize: size }, cd: { crc, usize: size } }]);
}

/** The most heap plus buffers held, sampled while `run` is awaited. */
async function peakOf(run) {
  let peak = 0;
  const timer = setInterval(() => { const m = process.memoryUsage(); peak = Math.max(peak, m.heapUsed + m.arrayBuffers); }, 2);
  try { return { value: await run(), peak }; } finally { clearInterval(timer); }
}

test("R6 R30 R35 at the standard figures, each limit is its row's standard column, and the tied rows stay tied", () => {
  for (const [name, [kind, row]] of Object.entries(LIMIT_ROWS)) {
    assert.equal(S[name], std(kind, row), name);
    assert.equal(S.ARCHIVE_LIMITS[name], std(kind, row), name);
  }
  assert.equal(S.ARCHIVE_TOTAL_MAX, std("archive", "unpacked_bytes"));
  assert.equal(S.MEMBER_MAX, std("archive", "member_bytes"));
  assert.equal(S.MEASURED_OOXML_TEXT_BOUND_BYTES, std("office", "text_bytes"));
  assert.equal(S.STREAMED_TEXT_BOUND_BYTES, std("office", "streamed_text_bytes"));
  assert.equal(S.STRUCTURAL_PART_MAX, std("office", "structural_part_bytes"));
  const over = sizeGuard(S.MEASURED_OOXML_TEXT_BOUND_BYTES + 1);
  assert.deepEqual([over.ok, over.bound, over.boundName], [false, S.MEASURED_OOXML_TEXT_BOUND_BYTES, "MEASURED_OOXML_TEXT_BOUND_BYTES"]);
});

test("R35 at the standard figures, textPlan reads whole, in pieces or not at all by the two rows' figures, and its bands meet", () => {
  const whole = S.MEASURED_OOXML_TEXT_BOUND_BYTES, ceiling = S.STREAMED_TEXT_BOUND_BYTES;
  assert.deepEqual(textPlan(whole), { read: "whole" });
  const pieces = textPlan(whole + 1);
  if (ceiling > whole) assert.deepEqual([pieces.read, pieces.piecewise.bound], ["pieces", whole]);
  else assert.deepEqual([pieces.read, pieces.guard.bound], ["none", ceiling]);
  assert.deepEqual(textPlan(ceiling).read, ceiling > whole ? "pieces" : "whole");
  const none = textPlan(ceiling + 1);
  assert.deepEqual([none.read, none.guard.bound, none.guard.final], ["none", ceiling, true]);
});

test("R30 R31 at the standard figures, a declared size over a limit is refused before a byte is read, and at it is not", async () => {
  const MEMBER_MAX = S.MEMBER_MAX, TOTAL = S.ARCHIVE_TOTAL_MAX;
  const declared = (name, n) => ({ name, data: "x", local: { uncompressedSize: n }, central: { uncompressedSize: n } });
  // the listing: one member over MEMBER_MAX is its own verdict, a total over ARCHIVE_TOTAL_MAX is the archive's
  const member = await listArchive(makeZip([declared("m", MEMBER_MAX + 1)]));
  assert.equal(member.ok, true);
  assert.deepEqual([member.entries[0].verdict, member.entries[0].limit, member.entries[0].final], ["MEMBER_MAX", MEMBER_MAX, true]);
  const half = TOTAL / 2;
  const total = await listArchive(makeZip([0, 1, 2].map((i) => declared(`${i}`, half))));
  assert.deepEqual([total.verdict, total.limit, total.final], ["ARCHIVE_TOTAL_MAX", TOTAL, true]);
  const exact = await listArchive(makeZip([0, 1].map((i) => declared(`${i}`, half))));
  assert.deepEqual([exact.declared_total, "limit" in exact], [TOTAL, false]);
  // the reader path: readPart refuses by the same figures, before inflation, carrying the declared size and the limit
  const bomb = buildZip([{ name: "p.xml", data: "x", cd: { usize: MEMBER_MAX + 1 } }]);
  assert.deepEqual(await readPart(bomb, readContainer(bomb), "p.xml"), { ok: false, why: "MEMBER_MAX", name: "p.xml", declared: MEMBER_MAX + 1, limit: MEMBER_MAX, final: true });
  const sum = buildZip([{ name: "p.xml", data: "x" }, { name: "o.xml", data: "x", cd: { usize: TOTAL } }]);
  assert.equal((await readPart(sum, readContainer(sum), "p.xml")).why, "ARCHIVE_TOTAL_MAX");
});

test("R29 R30 at the standard figures, a member larger than the alpha figure is listed and cut, verified, never held", async () => {
  // as far above the alpha as a test can afford, and never above the standard
  const mib = Math.min(std("archive", "member_bytes"), alpha("archive", "member_bytes") + 64 * MIB) / MIB;
  const z = await repeated("big.bin", new Uint8Array(MIB), mib);
  const reads = [];
  const source = { size: z.length, read: async (offset, length) => { reads.push(length); return z.slice(offset, offset + length); } };
  const listing = await listArchive(source);
  assert.equal(listing.ok, true);
  const row = listing.entries[0];
  assert.deepEqual([row.verdict, row.uncompressed], ["ok", mib * MIB]);
  assert.ok(reads.every((length) => length <= z.length));
  const { chunks, done } = streamMember(source, row);
  let size = 0, most = 0;
  const { value: result, peak } = await peakOf(async () => {
    for await (const c of chunks) { size += c.length; most = Math.max(most, c.length); }
    return done;
  });
  assert.deepEqual([result.ok, result.size, size], [true, mib * MIB, mib * MIB]);
  assert.ok(most <= 8 * MIB, `largest chunk ${most}`);
  // the member is never held: what is held while it is cut stays well under half of it (sampled heap and buffers, garbage not yet collected included)
  assert.ok(peak < (mib * MIB) / 2, `held ${(peak / MIB).toFixed(0)} MiB cutting ${mib} MiB`);
});

test("R35 at the standard figures, a text part of the streamed ceiling is read in pieces, each a few MiB, the part never held", async () => {
  // ASCII markup with a `>` every 33 characters, a MiB of it repeated to the ceiling
  const unit = new TextEncoder().encode("<a x=\"1\">abcdefghijklmnopqrstu</a>");
  const chunk = new Uint8Array(MIB).map((_, i) => unit[i % unit.length]);
  const mib = S.STREAMED_TEXT_BOUND_BYTES / MIB;
  const z = await repeated("p.xml", chunk, mib);
  const container = readContainer(z);
  assert.equal(container.ok, true);
  let chars = 0, most = 0;
  const { value: r, peak } = await peakOf(() => readPartPieces(z, container, "p.xml", cutAfterTag, (p) => { chars += p.length; most = Math.max(most, p.length); }));
  assert.deepEqual(r, { ok: true, size: mib * MIB });
  assert.equal(chars, mib * MIB);
  assert.ok(most < 4 * MIB, `largest piece ${most}`);
  // a Worker holds 128 MB of heap and buffers together (the module's own measure, R35)
  assert.ok(peak < 128 * MIB, `held ${(peak / MIB).toFixed(0)} MiB reading ${mib} MiB in pieces`);
});
