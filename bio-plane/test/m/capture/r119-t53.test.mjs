/* capture R119 (T53; N1266, N1267; K5435-K5437; `acquisition` R138, R139): the door files an unlisted kind whole and named, does not file a refused kind, and refuses
   an over-bound file before any read, at the module's interface (`uploadCapture`), over `format-registry`'s real answers and runtime-limits' real bounds. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";
import { CAPTURE_CHECKS } from "../../../src/capture/checks.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import { formatNameFor } from "../../../src/formats.mjs";
import { jobRegistrarStub } from "../../job-registrar-stub.mjs";

const te = new TextEncoder();
const STATEMENT = "a file the clerk handed me at the counter";
const AT = "2026-10-28T12:00:00Z";
const setup = () => {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  const j = jobRegistrarStub();
  f.c.registerJob = j.registerJob;
  f.c.armJobs = j.armJobs;
  const state = () => JSON.stringify([f.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((t) => [t.name, f.rows(`SELECT * FROM ${t.name}`)]), [...b.held.keys()].sort(), j.rows()]);
  return { ...f, b, j, state };
};
const up = (f, bytes, extra = {}) => f.c.uploadCapture({ bytes, statement: STATEMENT, by: "member:ann", at: AT, ...extra });
const rar = () => new Uint8Array([0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
const exe = () => { const b = new Uint8Array(512); b[0] = 0x4d; b[1] = 0x5a; b[0x3c] = 0x80; b[0x80] = 0x50; b[0x81] = 0x45; return b; };
const sqlite = () => te.encode("SQLite format 3\0" + "x".repeat(300));
const streamOf = (n, chunk = 1 << 20) => {
  const s = { cancelled: false, pulled: 0 };
  let at = 0;
  s.stream = new ReadableStream({ pull(c) { if (at >= n) c.close(); else { s.pulled++; c.enqueue(new Uint8Array(Math.min(chunk, n - at))); at += chunk; } }, cancel() { s.cancelled = true; } }, { highWaterMark: 0 });
  return s;
};

test("R119: a refused kind (a RAR, a program) is not filed: the answer names the kind and the reason in the word table's words and nothing is written", async () => {
  const f = setup();
  const before = f.state();
  for (const [bytes, kind, why] of [[rar(), "rar", "rar"], [exe(), "exe", "runs"]]) {
    const r = await up(f, bytes, { name: "thing.bin" });
    const named = formatNameFor({ format: "refused", kind });
    assert.equal(r.kind_key, named.kind_key);
    assert.equal(r.why_key, `file.refused.reason.${why}`);
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.status], [false, "FILE_KIND_REFUSED", "FILE_KIND_REFUSED", "C-118.13", 415]);
    assert.equal(r.translation, CAPTURE_CHECKS.FILE_KIND_REFUSED.translation);
    assert.match(r.kind_key, /^file\.kind\./);
    assert.ok(r.why_key.startsWith("file.refused.reason."), "the reason is stated by key");
    assert.ok(r.detail.includes(r.kind_text) && r.detail.includes(r.why_text), "the sentence names the kind and the reason");
  }
  assert.equal(f.state(), before, "nothing written: no object, receipt, actor, document or job row");
});

test("R119: the kind is judged on the file's bytes, whatever it is named: a program named notes.txt is refused; control: a listed type files as before", async () => {
  const f = setup();
  assert.equal((await up(f, exe(), { name: "notes.txt", type: "text/plain" })).reason, "FILE_KIND_REFUSED");
  const ok = await up(f, te.encode("a,b\n1,2\n"), { name: "t.csv" });
  assert.equal(ok.ok, true);
  assert.equal(ok.held_not_read, undefined);
  assert.equal(ok.document.profile.format.format, "csv");
});

test("R119: an unlisted kind (an Outlook mailbox, a database) is filed whole, held and named: its reading is stated 'held, not read: {name}' and owed as a reading job row", async () => {
  const f = setup();
  const r = await up(f, sqlite(), { name: "county.db" });
  assert.equal(r.ok, true);
  assert.equal(r.existed, false);
  const n = formatNameFor({ format: "unlisted", named: "sqlite" });
  assert.equal(r.held_not_read.kind_key, n.kind_key);
  assert.equal(r.held_not_read.state, "held_not_read");
  assert.ok(r.held_not_read.sentence.startsWith("held, not read: ") && r.held_not_read.sentence.includes(n.text), r.held_not_read.sentence);
  assert.deepEqual(r.document.profile.held_not_read, r.held_not_read);
  assert.equal(r.document.capture.sha256, sha(sqlite()), "filed whole under its own digest");
  assert.ok(f.b.held.has(`bio/captures/${sha(sqlite())}`), "the bytes are held");
  assert.deepEqual(f.j.rows().map((x) => x.kind), ["reading"], "its reading is owed");
});

test("R119: a file over its kind's bound, declared up front, is TOO_LARGE with its size, the limit and the limit's key before one byte is read or held (spreadsheet, image)", async () => {
  const f = setup();
  const before = f.state();
  const cases = [["data.csv", "spreadsheet", "bytes"], ["data.xlsx", "spreadsheet", "bytes"], ["photo.png", "image", "bytes"], ["photo.jpeg", "image", "bytes"]];
  for (const [name, kind, row] of cases) {
    const bound = boundOf(kind, row), s = streamOf(bound + 1);
    const r = await up(f, s.stream, { name, declared: bound + 1 });
    assert.deepEqual([r.ok, r.reason, r.status, r.size, r.bound], [false, "TOO_LARGE", 413, bound + 1, bound], name);
    assert.equal(r.key, `limit.${kind}.${row}`, name);
    assert.equal(s.cancelled, true, name);
    assert.equal(s.pulled, 0, `${name}: no byte was read`);
  }
  assert.equal(f.state(), before, "nothing held");
});

test("R119: the kind's bound follows the declared type when the name says none; control: a file declared exactly at the bound is not refused for its size", async () => {
  const f = setup();
  const bound = boundOf("spreadsheet", "bytes");
  const s = streamOf(bound + 1);
  const r = await up(f, s.stream, { type: "text/csv", declared: bound + 1 });
  assert.deepEqual([r.reason, r.bound, r.key], ["TOO_LARGE", bound, "limit.spreadsheet.bytes"]);
  assert.equal(s.pulled, 0);
  /* at the bound: not refused by the kind's judgment (a small real body declared at the bound is filed) */
  const ok = await up(f, te.encode("a,b\n1,2\n"), { name: "t.csv", declared: bound });
  assert.equal(ok.ok, true);
});

test("R119: a file exactly at its kind's bound is filed (control for the bound plus 1 above)", async () => {
  const f = setup();
  const bound = boundOf("spreadsheet", "bytes");
  const s = streamOf(bound);
  const r = await up(f, s.stream, { name: "big.csv", declared: bound });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.equal(r.capture.bytes, bound);
});
