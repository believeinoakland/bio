/* reading-pipeline R59 (fix round 9, G165; K4980; section 2c item 10): each page asked of the OCR member is stamped first.
 * Through `read` over real PDF bytes and `askMemberPerPage` directly, with one log that the stub `stampUnit` and the counting
 * OCR member both write to, so the order of stamp and call is what is asserted. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, hold, doc, evidenceStore } from "./fixture.mjs";
import { scanPdf, chunked } from "./scans.mjs";
import { read, askMemberPerPage } from "../../../src/reading-pipeline/index.mjs";

const pdfDoc = (digest, bytes) => doc({ digest, bytes, ct: "application/pdf", format: "pdf" });

/* the one-page-per-call member of scans.mjs, logging each call (the page it takes) into `log` */
function loggedMember(log) {
  const m = chunked();
  return {
    calls: m.calls,
    fetch: (url, init) => {
      const pages = JSON.parse(init.body).pages;
      log.push(`call:${[...new Set(pages)].sort((a, b) => a - b)[0]}`);
      return m.fetch(url, init);
    },
  };
}

test("R59: read with stampUnit stamps p<page> in page order, synchronously before each page's member call", async () => {
  const bytes = scanPdf(3);
  const log = [];
  const m = loggedMember(log);
  const w = fresh({ env: { OCR_WORKER: m } });
  const d = await hold(w.evidence, bytes);
  const out = await read(pdfDoc(d, bytes.length), { evidence: evidenceStore(w.evidence), env: w.env, stampUnit: (u) => { log.push(`stamp:${u}`); } });
  assert.deepEqual(log, ["stamp:p0", "call:0", "stamp:p1", "call:1", "stamp:p2", "call:2"], "each stamp is the last event before its call");
  assert.equal(out.reading.ocr_left, undefined, "the read itself is as before");
  assert.equal(out.counters.owed, 0);
});

test("R59: askMemberPerPage stamps the page the member takes before each call, the first call's too", async () => {
  const log = [];
  const m = loggedMember(log);
  const asked = await askMemberPerPage({ OCR_WORKER: m }, { sha: "a".repeat(64), storeName: "bio", wantPages: [4, 6, 9], stampUnit: (u) => { log.push(`stamp:${u}`); } });
  assert.deepEqual(log, ["stamp:p4", "call:4", "stamp:p6", "call:6", "stamp:p9", "call:9"]);
  assert.equal(asked.loop.invocations, 3);
});

test("R59: a stamp that throws does not stop the read; a call the invocation budget does not make is not stamped", async () => {
  const log = [];
  const m = loggedMember(log);
  const asked = await askMemberPerPage({ OCR_WORKER: m }, { sha: "b".repeat(64), storeName: "bio", wantPages: [1, 2, 3], invocations: 2,
    stampUnit: (u) => { log.push(`stamp:${u}`); throw new Error("stamp store down"); } });
  assert.deepEqual(log, ["stamp:p1", "call:1", "stamp:p2", "call:2"], "page 3 was never asked, so never stamped");
  assert.deepEqual(asked.loop.notAsked, [3]);
});

test("R59 control: without stampUnit nothing changes (read and askMemberPerPage alike); invocations 0 stamps nothing", async () => {
  const bytes = scanPdf(3);
  const m = chunked();
  const w = fresh({ env: { OCR_WORKER: m } });
  const d = await hold(w.evidence, bytes);
  const out = await read(pdfDoc(d, bytes.length), { evidence: evidenceStore(w.evidence), env: w.env });
  assert.equal(m.calls.length, 3);
  assert.equal(out.counters.owed, 0);
  const stamped = [];
  const none = await askMemberPerPage({ OCR_WORKER: chunked() }, { sha: "c".repeat(64), storeName: "bio", wantPages: [0, 1], invocations: 0, stampUnit: (u) => stamped.push(u) });
  assert.deepEqual(stamped, [], "a pass that makes no call stamps no page");
  assert.deepEqual(none.loop.notAsked, [0, 1]);
});
