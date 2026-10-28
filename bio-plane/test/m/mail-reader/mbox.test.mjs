/* mail-reader R3, R11: a mailbox split by streaming over a range source, each message read as an EML, the
 * 100,000-message cap (build/requirements/mail-reader.md). Mailboxes are generated window by window by
 * ./fixtures.mjs, never held whole. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readMailbox, planMailbox, detectMail } from "../../../src/mail-reader/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";
import * as F from "./fixtures.mjs";

/* every piece of a mailbox, keeping only what the test asks of each unit */
async function readAll(source, budget, keep = (u) => u) {
  const kept = [];
  let cursor = null, pieces = 0;
  for (;;) {
    const r = await readMailbox(source, cursor, budget);
    if (!r.ok) return { refusal: r, kept, pieces };
    for (const u of r.units) kept.push(keep(u));
    pieces++;
    if (!r.more) return { kept, pieces, last: r };
    cursor = r.next;
  }
}

test("R3 a small mailbox is split into its messages, each read as an EML; a >From line is unescaped", async () => {
  const src = F.mailboxSource(5, 3000, { lastToken: "LAST-TOKEN" });
  const plan = await planMailbox(src);
  assert.equal(plan.ok, true);
  assert.equal(plan.messages, 5);
  const { kept, last } = await readAll(src, { bytes: 4000 });
  assert.deepEqual(kept.map((u) => [u.index, u.ok, u.format, u.headers.subject]), [0, 1, 2, 3, 4].map((i) => [i, true, "eml", `message ${i}`]));
  assert.ok(kept[0].body.text.split("\n")[1].startsWith("From the escaped line"));
  assert.ok(kept[4].body.text.includes("LAST-TOKEN"));
  assert.equal(last.final, true);
  assert.deepEqual(kept.map((u) => u.offset), [0, 3000, 6000, 9000, 12000]);
});

test("R3 a body line beginning From that follows no blank line does not split a message", async () => {
  const box = F.bytes("From a@example.org Tue Oct  6 09:30:00 2026\nFrom: a@example.org\nSubject: one\n\nline\nFrom the floor, a question.\n\nFrom b@example.org Tue Oct  6 09:31:00 2026\nFrom: b@example.org\nSubject: two\n\nbody two\n");
  assert.equal(detectMail(box), "mbox");
  const { kept } = await readAll(box, {});
  assert.deepEqual(kept.map((u) => u.headers.subject), ["one", "two"]);
  assert.equal(kept[0].body.text, "line\nFrom the floor, a question.");
});

/* the mailbox is as large as the archive bound's active figure allows, to 500 MB (runtime-limits R37's archive row) */
test("R3 a generated 500 MB mailbox reads every message once, by range, the token in the last message found", { timeout: 600000 }, async () => {
  const bound = boundOf("archive", "uploaded_bytes");
  const size = 52428, count = Math.floor(Math.min(bound, 524288000) / size);
  const src = F.mailboxSource(count, size, { lastToken: "TOKEN-IN-THE-LAST" });
  let largest = 0;
  const readRange = src.readRange.bind(src);
  src.readRange = async (o, n) => { largest = Math.max(largest, n); return readRange(o, n); };
  const { kept, refusal } = await readAll(src, { bytes: 8 * 1024 * 1024 }, (u) => ({ index: u.index, ok: u.ok, token: u.ok && u.body.text.startsWith(`token-${u.index}`), last: u.ok && u.body.text.includes("TOKEN-IN-THE-LAST") }));
  assert.equal(refusal, undefined);
  assert.equal(kept.length, count);
  assert.ok(kept.every((u, i) => u.index === i && u.ok && u.token), "every message once, in order");
  assert.deepEqual(kept.map((u) => u.last).lastIndexOf(true), count - 1);
  assert.equal(kept.filter((u) => u.last).length, 1);
  assert.ok(largest <= 1 << 20, `no range read past one window (largest ${largest})`);
});

test("R3 R11 a 100,001-message mailbox is refused whole naming 100,000; the 100,001st message is a stated failure", async () => {
  const cap = boundOf("archive", "mailbox_messages");
  const src = F.mailboxSource(cap + 1, 220);
  const plan = await planMailbox(src);
  assert.equal(plan.ok, false);
  assert.equal(plan.reason, "MAIL_MAILBOX_TOO_MANY");
  assert.equal(plan.bound, 100000);
  const read = await readMailbox(src);
  assert.equal(read.reason, "MAIL_MAILBOX_TOO_MANY");
  assert.equal(typeof read.detail, "string");
  const at = await readMailbox(src, { offset: cap * 220, index: cap });
  assert.equal(at.ok, false);
  assert.equal(at.reason, "MAIL_MAILBOX_TOO_MANY");
  const fits = await planMailbox(F.mailboxSource(cap, 220));
  assert.equal(fits.ok, true);
  assert.equal(fits.messages, cap);
});

test("R11 a file that does not begin like a mailbox is a stated failure, never a throw", async () => {
  const r = await readMailbox(F.bytes("Subject: not a mailbox\n\nbody\n"));
  assert.equal(r.ok, false);
  assert.equal(r.reason, "MAIL_MAILBOX_MALFORMED");
  const broken = await readMailbox({ size: 10, readRange: async () => { throw new Error("gone"); } });
  assert.equal(broken.ok, false);
  assert.equal(broken.reason, "MAIL_SOURCE_UNREADABLE");
});
