/* reading-pipeline R46 (fix round 9, G129a, G102; K4803, K4807 (4), K4831 (6)): a piece that advances nothing ends the entry,
 * stated. The PDFs are test-support's generator's (PDF C11, C14); the tier-2 member is a stand-in answering pdf-worker's R42/R43
 * contract for the range asked (decrypting an empty-password file from the generator's truth, a user-password one answering the
 * `password_required` marker). Each case runs the ticks a ledger runs: the cursor each piece answers is the next one asked. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { generate } from "../../../test/pdfgen.mjs";
import { fresh, hold, doc, member, evidenceStore } from "./fixture.mjs";
import { read } from "../../../src/reading-pipeline/index.mjs";

const pdfDoc = (digest, bytes) => doc({ digest, bytes, ct: "application/pdf", format: "pdf" });

/* pdf-worker's answer for [from, from + count) of a generated file, by its truth */
function worker(truth, { locked = false } = {}) {
  return member((body) => {
    if (locked) {
      const marker = { page: null, reason: "password_required", font: null, codes: "", count: 0 };
      return { ok: true, tier: 1, text: { document: "", pages: [], undetermined: [marker], counts: { chars: 0, undetermined: 1 } } };
    }
    const from = body.from ?? 0, last = Math.min(truth.pages, from + (body.count ?? truth.pages));
    const pages = [], undetermined = [];
    for (let i = from; i < last; i++) {
      const t = truth.page(i + 1);
      const text = t.lines.join("\n");
      const u = text ? [] : [{ page: i, reason: "no_text_layer", font: null, codes: "", count: 0 }];
      pages.push({ page: i, text, undetermined: u }); undetermined.push(...u);
    }
    const document = pages.map((p) => p.text).filter(Boolean).join("\n");
    return { ok: true, tier: 2, text: { document, pages, undetermined, counts: { chars: document.length, undetermined: undetermined.length } } };
  });
}

async function ticks(bytes, env, { rangePages = 2, max = 20 } = {}) {
  const w = fresh({ env });
  const d = await hold(w.evidence, bytes);
  const seen = [], answers = [];
  let cursor = null;
  for (let i = 0; i < max; i++) {
    const out = await read(pdfDoc(d, bytes.length), { evidence: evidenceStore(w.evidence), env, cursor, rangePages });
    answers.push(out);
    seen.push(cursor);
    if (out.more !== true) break;
    assert.ok(!seen.includes(out.cursor), `tick ${i + 1} answered a cursor already asked`);
    cursor = out.cursor;
  }
  return answers;
}

test("R46 (G129a, PDF C14): an AES-128 file under a user password ends in one tick, final, PASSWORD_REQUIRED, never being read after", async () => {
  const f = generate({ kind: "pdf", seed: "C14", encryption: { method: "aes", user: "pw" }, size: { pages: 6, lines: 3 } });
  const bytes = await f.bytes();
  const answers = await ticks(bytes, { PDF_WORKER: worker(f.truth, { locked: true }) });
  assert.equal(answers.length, 1, "one tick");
  const [a] = answers;
  assert.equal(a.more, false);
  assert.equal(a.cursor, null);
  assert.equal(a.final, true);
  assert.equal(a.reading.failure, "final");
  assert.equal(a.reading.reason, "PASSWORD_REQUIRED");
});

test("R46 (G129a): with no tier-2 member an encrypted file's piece advances nothing and ends stated, ENCRYPTED, in one tick", async () => {
  const f = generate({ kind: "pdf", seed: "C14b", encryption: { method: "aes", user: "pw" }, size: { pages: 6, lines: 3 } });
  const answers = await ticks(await f.bytes(), {});
  assert.equal(answers.length, 1);
  assert.equal(answers[0].more, false);
  assert.equal(answers[0].reading.failure, "final");
  assert.equal(answers[0].reading.reason, "ENCRYPTED");
});

test("R46 (G129a, PDF C11): an RC4-128 empty-password file of 5 text pages and 2 scans: its text pages read by tier 2, its scans stated unread, the ticks never the same cursor twice and ending", async () => {
  const f = generate({ kind: "pdf", seed: "C11", encryption: { method: "rc4", user: "" }, kinds: ["text", "text", "scan", "text", "text", "scan", "text"], size: { pages: 7, lines: 3 } });
  const bytes = await f.bytes();
  const answers = await ticks(bytes, { PDF_WORKER: worker(f.truth) });
  assert.ok(answers.length <= 7 + 2, `${answers.length} ticks`);
  const last = answers[answers.length - 1];
  assert.equal(last.more, false);
  const units = answers.flatMap((a) => a.text_units || []);
  const pages = [...new Set(units.map((u) => u.extent.page))].sort((a, b) => a - b);
  assert.deepEqual(pages, [0, 1, 3, 4, 6], "the text pages, each once");
  for (const p of pages) assert.ok(units.find((u) => u.extent.page === p).text.includes(f.truth.page(p + 1).lines[0]));
  const skipped = answers.reduce((n, a) => n + (a.counters ? a.counters.skipped : 0), 0);
  assert.equal(skipped, 2, "the two scans stated unread");
});

test("R46 control: a file whose every piece advances is read to its end, each page once", async () => {
  const f = generate({ kind: "pdf", seed: "R46c", fonts: ["type0"], size: { pages: 5, lines: 3 } });
  const answers = await ticks(await f.bytes(), {});
  const units = answers.flatMap((a) => a.text_units || []);
  assert.deepEqual(units.map((u) => u.extent.page), [0, 1, 2, 3, 4]);
  assert.equal(answers[answers.length - 1].more, false);
});
