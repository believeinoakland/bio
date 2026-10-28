/* mail-reader R11, R12, R14: every failure returned, never thrown; the message sizes by route; no ceiling held as a
 * literal (build/requirements/mail-reader.md). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { readMessage, attachmentBytes, readMailbox, planMailbox, nestingOf } from "../../../src/mail-reader/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import * as F from "./fixtures.mjs";

const MiB = 1024 * 1024;

/* a message of exactly `n` bytes: headers, then a plain body of lines */
function sized(n) {
  const head = F.bytes(`${F.STANDARD.join("\r\n")}\r\nContent-Type: text/plain\r\n\r\n`);
  const out = new Uint8Array(n);
  out.set(head, 0);
  const line = F.bytes("A line of the body of a very long message.\r\n");
  for (let at = head.length; at < n; at += line.length) out.set(line.subarray(0, Math.min(line.length, n - at)), at);
  return out;
}

test("R12 an uploaded 100 MB EML reads; 100 MB + 1 is refused with its size", { timeout: 120000 }, async () => {
  const bound = boundOf("message", "upload_bytes");
  assert.equal(bound, 100 * MiB);
  const ok = await readMessage(sized(bound));
  assert.equal(ok.ok, true);
  assert.equal(ok.headers.subject, "Records request");
  assert.ok(ok.body.text.length > 99 * MiB);
  const over = await readMessage({ size: bound + 1, readRange: async () => { throw new Error("must not be read"); } });
  assert.equal(over.ok, false);
  assert.equal(over.reason, "MAIL_TOO_LARGE");
  assert.equal(over.size, bound + 1);
  assert.equal(over.bound, bound);
  assert.equal(over.key, "limit.message.upload_bytes");
});

test("R12 a message received by address is bounded at 25 MiB, judged before any byte is read", async () => {
  const bound = boundOf("mail", "message_bytes");
  assert.equal(bound, 25 * MiB);
  let read = 0;
  const source = (size) => ({ size, readRange: async (o, n) => { read += n; return sized(size).subarray(o, o + n); } });
  const over = await readMessage(source(bound + 1), { route: "address" });
  assert.equal(over.reason, "MAIL_TOO_LARGE");
  assert.equal(over.size, bound + 1);
  assert.equal(over.bound, bound);
  assert.equal(read, 0);
  const at = await readMessage(source(bound), { route: "address" });
  assert.equal(at.ok, true);
  assert.equal((await readMessage(sized(bound + 1))).ok, true, "the same bytes uploaded are within the upload bound");
});

test("R11 a bad MIME boundary returns a stated failure and the call does not throw", async () => {
  const declaredNone = F.eml([...F.STANDARD, "Content-Type: multipart/mixed"], "--x\r\nContent-Type: text/plain\r\n\r\nhi\r\n--x--\r\n");
  const neverPresent = F.eml([...F.STANDARD, 'Content-Type: multipart/mixed; boundary="declared"'], "--other\r\nContent-Type: text/plain\r\n\r\nhi\r\n--other--\r\n");
  for (const b of [declaredNone, neverPresent]) {
    const r = await readMessage(b);
    assert.equal(r.ok, false);
    assert.equal(r.reason, "MAIL_BOUNDARY_BAD");
    assert.equal(typeof r.detail, "string");
  }
});

test("R11 an unclosed multipart is read as far as it goes and the missing close stated", async () => {
  const b = F.eml([...F.STANDARD, 'Content-Type: multipart/mixed; boundary="u"'], F.multipart("u", [{ headers: ["Content-Type: text/plain"], body: "kept" }], { close: false }));
  const r = await readMessage(b);
  assert.equal(r.ok, true);
  assert.equal(r.body.text, "kept");
  assert.deepEqual(r.notes, ["MAIL_BOUNDARY_UNCLOSED"]);
});

test("R11 empty, unreadable and non-message inputs each answer a stated failure; nothing throws", async () => {
  const cases = [
    [() => readMessage(new Uint8Array(0)), "MAIL_EMPTY"],
    [() => readMessage(F.bytes("just some words\nwith no headers at all\n")), "MAIL_NOT_A_MESSAGE"],
    [() => readMessage({ size: 10, readRange: async () => { throw new Error("gone"); } }), "MAIL_SOURCE_UNREADABLE"],
    [() => readMessage({ size: 10, readRange: async () => new Uint8Array(3) }), "MAIL_SOURCE_UNREADABLE"],
    [() => readMessage(null), "MAIL_SOURCE_UNREADABLE"],
    [() => readMessage("not bytes"), "MAIL_SOURCE_UNREADABLE"],
    [() => readMessage(F.bytes("From a@example.org Tue Oct  6 09:30:00 2026\nFrom: a@example.org\nSubject: s\n\nb\n")), "MAIL_IS_MAILBOX"],
    [() => attachmentBytes(new Uint8Array(0), 0), "MAIL_EMPTY"],
    [() => planMailbox(undefined), "MAIL_SOURCE_UNREADABLE"],
    [() => readMailbox(42), "MAIL_SOURCE_UNREADABLE"],
  ];
  for (const [call, reason] of cases) {
    const r = await call();
    assert.equal(r.ok, false, reason);
    assert.equal(r.reason, reason);
    assert.equal(typeof r.detail, "string");
    assert.ok(r.detail.length > 0);
  }
  assert.equal((await nestingOf(new Uint8Array(0))).ok, true);
});

test("R11 a message cut short mid-attachment still answers, never throws", async () => {
  const whole = F.withAttachments([F.attachmentPart("a.pdf", "application/pdf", "x".repeat(4000))]);
  for (const n of [10, 100, 300, whole.length - 50]) {
    const r = await readMessage(whole.subarray(0, n));
    assert.equal(typeof r.ok, "boolean", `cut at ${n}`);
  }
});

test("R14 no numeric literal in the module's source is a ceiling it keeps; each is read through boundOf", () => {
  const dir = join(fileURLToPath(new URL(".", import.meta.url)), "../../../src/mail-reader");
  const files = readdirSync(dir).filter((f) => f.endsWith(".mjs"));
  assert.ok(files.length >= 5);
  const CEILINGS = [/\b26214400\b/, /\b104857600\b/, /\b524288000\b/, /\b100_?000\b/, /\b25\s*\*\s*1024\b/, /\b100\s*\*\s*1024\b/, /\b500\s*\*\s*1024\b/,
    /\b(?:depth|nest\w*|level)\s*[<>]=?\s*[34]\b/, /\b[34]\s*[<>]=?\s*(?:depth|nest\w*|level)\b/];
  for (const f of files) {
    const src = readFileSync(join(dir, f), "utf8");
    for (const re of CEILINGS) assert.equal(re.test(src), false, `${f} holds ${re}`);
  }
  const index = readFileSync(join(dir, "index.mjs"), "utf8");
  for (const row of ['"mail", "message_bytes"', '"message", "upload_bytes"', '"archive", "mailbox_messages"', '"nest_max"', '"nest_read_max"']) assert.ok(index.includes(row), row);
});
