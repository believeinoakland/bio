/* pdf-reader: requirement-named tests for the memory a very large page takes (R41, R22: "1,000 light pages and one 40 MiB page"
 * under a 128 MB heap; the page bound is 64 MiB), at the module's interface, in a process of its own whose V8 heap is held to
 * 128 MB, the object's. The content is text-dense: every line is its own `BT ... Tj ET`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { deflateSync } from "node:zlib";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { doc } from "./pdf.mjs";

const CHILD = fileURLToPath(new URL("./memory-child.mjs", import.meta.url));
const SENTENCE = "the council adopted the budget for the year";
const LINE = `BT /F1 12 Tf 40 700 Td (${SENTENCE}) Tj ET\n`;

function child(file, heapMB) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, ["--expose-gc", `--max-old-space-size=${heapMB}`, CHILD, "bigpage", file, SENTENCE], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code, signal) => resolve({ code, signal, out, err }));
  });
}

async function readPage(mb, heapMB) {
  const lines = Math.ceil((mb * 1048576) / LINE.length);
  const z = new Uint8Array(deflateSync(Buffer.from(LINE.repeat(lines), "latin1"), { level: 6 }));
  const dir = mkdtempSync(join(tmpdir(), "pdf-bigpage-"));
  try {
    const file = join(dir, "page.pdf");
    writeFileSync(file, doc([{ content: "BT /F1 12 Tf 40 700 Td (first page) Tj ET" }, { content: { dict: "/Filter /FlateDecode", data: z } }, { content: "BT /F1 12 Tf 40 700 Td (last page) Tj ET" }]));
    const r = await child(file, heapMB);
    return { lines, r };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

for (const mb of [40, 60]) {
  test(`R41, R22: one ${mb} MiB page of text among light ones is read whole in a 128 MB heap, and says what it says`, async () => {
    const { lines, r } = await readPage(mb, 128);
    assert.equal(r.code, 0, `the reading did not complete in a 128 MB heap: ${r.err.split("\n").find((l) => /FATAL|heap/.test(l)) ?? r.signal}`);
    const m = JSON.parse(r.out);
    assert.equal(m.ok, true);
    assert.equal(m.pages, 3);
    assert.equal(m.first, "first page");
    assert.equal(m.last, "last page");
    assert.equal(m.said, lines, "every line of the page is in its text");
    assert.deepEqual(m.marked, [], "nothing on the pages is stated unread");
  });
}
