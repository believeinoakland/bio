/* acquisition, T51 fix round 5: a capture held in parts is profiled from its bytes (R101, E1), the upload's text rule is one function
   (R102, E5), and `read` is split into the source's download, the hash and the store's writes (R103, E10). Failing first. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, run, sha } from "./fixture.mjs";
import * as acquisition from "../../../src/acquisition/index.mjs";
const { profileOf, profileView, PROFILE_TEXT_MAX } = acquisition;
const textTypeOf = (a) => acquisition.textTypeOf(a);

const MIB = 1024 * 1024;
const PART = 8 * MIB;

/* a PDF with a text layer, `size` bytes: header, a content stream of words, filler, trailer */
function pdfOf(size) {
  const b = new Uint8Array(size).fill(0x20);
  const head = new TextEncoder().encode("%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\n(Records requested under the public records act) Tj\n");
  b.set(head, 0);
  b.set(new TextEncoder().encode("\n%%EOF\n"), size - 7);
  return b;
}
/* what the screen's upload leaves in the store: the bytes in parts of 8 MiB, each under its own digest */
async function held(w, bytes) {
  const ev = w.core.evidenceStore();
  const parts = [];
  for (let at = 0; at < bytes.length; at += PART) {
    const buf = bytes.slice(at, at + PART);
    const psha = sha(buf);
    await ev.put(psha, buf);
    parts.push({ sha256: psha, bytes: buf.length });
  }
  return { ev, parts, total: bytes.length, sha: sha(bytes) };
}

test("R101: the profile of a 10 MB PDF held in two parts with no declared type is pdf, certain, read from range reads of its head and tail, no part read whole", async () => {
  const w = world();
  const h = await held(w, pdfOf(10 * MIB));
  assert.equal(h.parts.length, 2);
  w.b.calls.length = 0;
  const p = await profileOf({ ev: h.ev, sha: h.sha, ct: null, total: h.total, multipart: true, headers: {}, locator: "upload:x",
                              view: profileView(w.core), retrieved: "2026-10-22T00:00:00Z", origin: "member", parts: h.parts });
  assert.equal(p.format.format, "pdf");
  assert.equal(p.format.confidence, "certain");
  /* R101: range reads of the head (at most the registry's 1 MiB) and the tail, and no whole-object read of any part */
  const reads = w.b.calls.filter((c) => c[0] === "get");
  assert.ok(reads.length >= 1, "the first part was looked at");
  assert.ok(reads.some((c) => c[2] && c[2].range && c[2].range.offset === 0), "its head was read");
  for (const c of reads) assert.ok(c[2] && c[2].range && c[2].range.length <= 1024 * 1024, `a range, not the part (${JSON.stringify(c[2])})`);
});

test("R101: control: bytes that are not a known format, held in parts, stay undetermined; a missing first part is stated, never a failed profile", async () => {
  const w = world();
  const junk = new Uint8Array(10 * MIB).fill(0x41);
  const h = await held(w, junk);
  const p = await profileOf({ ev: h.ev, sha: h.sha, ct: null, total: h.total, multipart: true, headers: {}, locator: "upload:y",
                              view: profileView(w.core), retrieved: "2026-10-22T00:00:00Z", origin: "member", parts: h.parts });
  assert.equal(p.format.format, "undetermined");
  const lost = await profileOf({ ev: h.ev, sha: h.sha, ct: null, total: h.total, multipart: true, headers: {}, locator: "upload:y",
                                 view: profileView(w.core), retrieved: "2026-10-22T00:00:00Z", origin: "member",
                                 parts: [{ sha256: "0".repeat(64), bytes: 1 }, ...h.parts] });
  assert.equal(lost.format.format, "undetermined");
});

test("R101: a fetched 10 MB PDF the source serves with no content type is profiled pdf, certain, with no part read whole", async () => {
  const w = world();
  const url = "https://oakland.example/big.pdf";
  const bytes = pdfOf(10 * MIB);
  const r = await run(w, { [url]: () => new Response(bytes, { headers: { "content-length": String(bytes.length) } }) }, { locator: url });
  assert.equal(r.status, 200);
  assert.equal(r.body.parts, 2);
  assert.equal(r.body.document.profile.format.format, "pdf");
  assert.equal(r.body.document.profile.format.confidence, "certain");
  const firstPart = r.body.document.parts[0].sha256;
  assert.equal(w.b.calls.filter((c) => c[0] === "get" && c[1].endsWith(firstPart) && !(c[2] && c[2].range)).length, 0, "no part is read whole (R101: range reads of the head)");
});

test("R102: textTypeOf is the upload's rule: a declared text type, or a .txt/.md/.csv name when none is declared, only for bytes that are UTF-8 without NUL", () => {
  const enc = (s) => new TextEncoder().encode(s);
  assert.equal(textTypeOf({ bytes: enc("one\ntwo"), type: "text/plain", name: "a.bin" }), "text/plain");
  assert.equal(textTypeOf({ bytes: enc("a,b"), type: "", name: "k.csv" }), "text/csv");
  assert.equal(textTypeOf({ bytes: enc("# t"), name: "k.MD" }), "text/markdown");
  assert.equal(textTypeOf({ bytes: enc("hello"), name: "knock-b.txt" }), "text/plain");
  /* controls */
  assert.equal(textTypeOf({ bytes: new Uint8Array([104, 105, 0, 106]), type: "text/plain", name: "a.txt" }), null, "a NUL is not text");
  assert.equal(textTypeOf({ bytes: new Uint8Array([0xff, 0xfe, 0x41]), type: "text/plain" }), null, "invalid UTF-8 is not text");
  assert.equal(textTypeOf({ bytes: enc("hello"), type: "application/pdf", name: "a.txt" }), null, "a declared non-text type is not overridden by the name");
  assert.equal(textTypeOf({ bytes: enc("hello"), name: "a.pdf" }), null, "no type and no text name");
  assert.equal(textTypeOf({ bytes: enc("hello") }), null);
  assert.equal(textTypeOf({ bytes: new Uint8Array(PROFILE_TEXT_MAX + 1).fill(0x61), type: "text/plain" }), null, "past what a profile reads as text");
  assert.equal(textTypeOf({ type: "text/plain", name: "a.txt" }), null, "no bytes");
});

test("R103: the answer's timings split `read` into download, hash and store; their parts sum to no more than `read`", async () => {
  const w = world();
  const url = "https://oakland.example/budget.pdf";
  const bytes = pdfOf(15 * MIB + 900 * 1024);           /* a 15.9 MB capture, two parts */
  const r = await run(w, { [url]: () => new Response(bytes, { headers: { "content-type": "application/pdf" } }) }, { locator: url });
  assert.equal(r.status, 200);
  const t = r.body.timings;
  const s = t.read_split;
  assert.deepEqual(Object.keys(s).sort(), ["download", "hash", "store"]);
  for (const [k, v] of Object.entries(s)) assert.ok(Number.isInteger(v) && v >= 0, `${k} is a whole number of milliseconds`);
  assert.ok(s.download + s.hash + s.store <= t.stages.read, "the parts of read are within read");
  assert.ok(s.hash + s.store > 0, "the hash and the store did something for 15.9 MB");
});

test("R103: control: a refusal before the body is read carries no split; a call that stopped inside `read` reports the split so far", async () => {
  const w = world();
  const none = await run(w, { "https://a.example/x": new Response("no", { status: 403 }) }, { locator: "https://a.example/x" });
  assert.equal(none.body.timings.read_split, undefined);
  const thrown = world();
  thrown.b.put = async () => { throw new Error("bucket exploded"); };
  const r = await run(thrown, { "https://a.example/y": () => new Response("x".repeat(1000), { headers: { "content-type": "text/plain" } }) }, { locator: "https://a.example/y" });
  assert.equal(r.body.reason, "ACQUIRE_FAILED");
  assert.deepEqual(Object.keys(r.body.timings.read_split).sort(), ["download", "hash", "store"]);
});
