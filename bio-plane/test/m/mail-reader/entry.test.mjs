/* mail-reader R13: one registry entry for each format it reads, in `format-registry`'s entry shape, detecting by
 * content and reading over a range source (build/requirements/mail-reader.md). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { emlEntry, msgEntry, mboxEntry, MAIL_ENTRIES, MAIL_FORMATS } from "../../../src/mail-reader/index.mjs";
import { generate as imggen } from "../../imggen.mjs";
import * as F from "./fixtures.mjs";

const SAMPLES = {
  eml: F.eml(F.STANDARD, "Body of the sample."),
  msg: F.msg({ subject: "Sample", fromName: "Ada", fromAddress: "ada@example.org", body: "Body of the sample." }),
  mbox: F.bytes("From ada@example.org Tue Oct  6 09:30:00 2026\nFrom: ada@example.org\nSubject: Sample\n\nBody of the sample.\n"),
};

test("R13 the module exports eml, msg and mbox entries, each in the registry's shape", () => {
  assert.deepEqual(MAIL_ENTRIES.map((e) => e.format), ["eml", "msg", "mbox"]);
  assert.deepEqual([...MAIL_FORMATS], ["eml", "msg", "mbox"]);
  for (const e of [emlEntry, msgEntry]) for (const slot of ["detect", "parts", "structure", "text", "plan", "read"]) assert.equal(typeof e[slot], "function", `${e.format}.${slot}`);
  assert.equal(typeof mboxEntry.detect, "function");
  for (const slot of ["parts", "structure", "text"]) assert.ok(mboxEntry[slot] === null || typeof mboxEntry[slot] === "function", `mbox.${slot}`);
  assert.ok(Object.isFrozen(emlEntry) && Object.isFrozen(msgEntry) && Object.isFrozen(mboxEntry));
});

test("R13 a generated sample of each format is answered with its format, by content, certain", () => {
  for (const [format, bytes] of Object.entries(SAMPLES)) {
    for (const e of MAIL_ENTRIES) {
      const d = e.detect(bytes, null);
      if (e.format === format) { assert.equal(d.format, format); assert.equal(d.confidence, "certain"); assert.ok(Array.isArray(d.signals)); }
      else assert.equal(d, null, `${e.format} must not answer a ${format}`);
    }
  }
});

test("R13 an EML declared as text is still eml; a PNG declared as a message is not mail", async () => {
  assert.equal(emlEntry.detect(SAMPLES.eml, "text/plain").format, "eml");
  const png = await imggen({ kind: "png", seed: "mail-r13", size: { width: 4, height: 4 } }).bytes();
  for (const e of MAIL_ENTRIES) assert.equal(e.detect(png, "message/rfc822"), null);
  assert.equal(emlEntry.detect(null, "message/rfc822").confidence, "likely");
});

test("R13 control: a text that merely contains a From: line is not mail", () => {
  const texts = ["Minutes of the meeting.\nFrom: the chair\nItems were approved.\n", "From: someone\n\nand nothing else that a message carries", "Notes\n\nFrom the floor, a question was asked.\n"];
  for (const t of texts) for (const e of MAIL_ENTRIES) assert.equal(e.detect(F.bytes(t), null), null, `${e.format}: ${JSON.stringify(t)}`);
});

test("R13 each entry reads over a range source: plan then read gives the message's units, headers cited as headers", async () => {
  for (const e of [emlEntry, msgEntry]) {
    const bytes = SAMPLES[e.format];
    let asked = 0;
    const source = { size: bytes.length, readRange: async (o, n) => { asked += n; return bytes.subarray(o, o + n); } };
    const plan = await e.plan(source);
    assert.equal(plan.kind, e.format);
    assert.equal(plan.verdict.ok, true);
    assert.equal(asked, 0, "plan reads no body");
    const r = await e.read(source, null, { bytes: 1 << 20 });
    assert.equal(r.more, false);
    assert.equal(r.final, true);
    const body = r.units.find((u) => u.kind === "mail-body");
    assert.equal(body.text, "Body of the sample.");
    const subject = r.units.find((u) => u.kind === "mail-header" && u.name.toLowerCase() === "subject");
    if (e.format === "eml") assert.deepEqual(subject.extent, { kind: "mail-header", name: "subject", occurrence: 1 });
    const t = await e.text(await e.parts(bytes));
    assert.equal(t.ok, true);
    assert.equal(t.document, "Body of the sample.");
  }
  const box = await mboxEntry.read(SAMPLES.mbox, null, {});
  assert.equal(box.units[0].headers.subject, "Sample");
  assert.equal((await mboxEntry.plan(SAMPLES.mbox)).messages, 1);
});
