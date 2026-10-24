/* reading-pipeline R40 for a PDF, R36 (G26; K4426, K4606), the walker's case at `read`'s interface: the real 15.2 MiB, 1,354-page
 * text-layer volume BUDGET-2024-APP (A E7 0111; the cache and SHA-256 pin of memory.test.mjs), read in pieces by a cursor in a
 * process whose old space is the object's 128 MB less the file's bytes (no "idle +" term: the plane idles at 73-103 MB, so the
 * object's share is what is left of the 128). Every page is read once, every piece is a range of at most the pages R40 allows, and the pieces
 * together make no more than the work of one open of the file, COUNTED (K4847, R-CLOCK: the bars are counts, never node's wall time, which a loaded
 * one-core machine moves; workerd's clock is frozen inside the object): the evidence store is read for the file once (the first piece) and never by a
 * piece after it (the open document is kept, R40), and the bytes it serves are the file's. Before the page-range entry (pdf-reader `structureRange`) a
 * piece parsed every page again, so this fails by name (every piece read the file). Times are printed, judged by nothing. A file that cannot be had
 * fails its test by name; nothing is skipped. The platform shape is pdf-pieces.probe.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const CHILD = fileURLToPath(new URL("./pdf-pieces-child.mjs", import.meta.url));
const CACHE = process.env.BIO_FIXTURE_CACHE || join(tmpdir(), "bio-test-fixtures");
const NAME = "BUDGET-2024-APP", SHA = "6e0b3dc5f2f3f5bbab8ae5032bbc29207a8dbb290ba25ebafe3feb20dfe13c1e", PAGES = 1354;
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
async function fixture() {
  const path = join(CACHE, `${NAME}.pdf`);
  if (existsSync(path) && sha256(readFileSync(path)) === SHA) return path;
  mkdirSync(CACHE, { recursive: true });
  const res = await fetch(`https://www.govinfo.gov/content/pkg/${NAME}/pdf/${NAME}.pdf`);
  assert.ok(res.ok, `${NAME}: govinfo answered ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  assert.equal(sha256(body), SHA, `${NAME}: the file fetched is not the file measured`);
  writeFileSync(`${path}.part`, body);
  renameSync(`${path}.part`, path);
  return path;
}
function child(args, nodeArgs = []) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [...nodeArgs, CHILD, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code, signal) => resolve({ code, signal, out, err }));
  });
}

test("R40 R36 (G26, K4847): BUDGET-2024-APP read in pieces by page ranges in 128 MB less its bytes: every page once, each piece a range within the pages and bytes R40 allows, the file read from the store once in all, by the first piece alone", { timeout: 900_000 }, async () => {
  const path = await fixture();
  const fileBytes = readFileSync(path).length;
  const capMB = Math.floor(128 - fileBytes / 1048576);
  const whole = await child(["whole", path], ["--expose-gc"]);
  assert.equal(whole.code, 0, whole.err.slice(0, 300));
  const w = JSON.parse(whole.out);
  const run = await child(["pieces", path], ["--expose-gc", `--max-old-space-size=${capMB}`, "--max-semi-space-size=2"]);
  assert.equal(run.code, 0, `the reading did not complete in a ${capMB} MB heap (${run.signal ?? "exit " + run.code}): ${run.err.split("\n").slice(0, 3).join(" | ")}`);
  const r = JSON.parse(run.out);
  assert.equal(r.refused, undefined, `a piece was refused: ${r.refused}`);
  console.log(`pieces ${NAME}: ${r.ms.length} pieces, slowest ${Math.round(Math.max(...r.ms))} ms, total ${Math.round(r.totalMs)} ms against one parse ${Math.round(w.ms)} ms (times reported only), store reads per piece [${r.gets}], bytes served ${r.served.reduce((a, b) => a + b, 0)} of ${fileBytes}, peak ${r.peakMB.toFixed(1)} MB`);
  assert.equal(r.pageCount, PAGES);
  assert.equal(r.distinctPages, r.units, "a page is read once");
  assert.equal(r.units, w.units, "the pieces hold the units of the whole read");
  /* the pieces are ranges of at most PDF_RANGE_PAGES pages, as many as the file's bytes a page allow (R40, G56); they cover the file once */
  assert.ok(r.perPiece.every((n) => Number.isInteger(n) && n >= 1 && n <= 100), `a piece held ${Math.max(...r.perPiece)} pages, over 100`);
  assert.equal(r.perPiece.reduce((a, b) => a + b, 0), PAGES, "the pieces add up to the file's pages");
  assert.ok(r.perPiece.length >= Math.ceil(PAGES / 100), `${r.perPiece.length} pieces`);
  /* the work is counted: the file is read from the store in the first piece only (G68: the open document is kept between pieces), and the bytes served are the
     file's, not a multiple of it. A piece that parsed the file again would read it again and serve it again. */
  assert.ok(r.gets[0] >= 1 && r.gets[0] <= 2, `the first piece read the store ${r.gets[0]} times`);
  assert.deepEqual(r.gets.slice(1).filter((n) => n > 0), [], "no piece after the first read the store");
  assert.ok(r.served.reduce((a, b) => a + b, 0) <= fileBytes + 65536, `the pieces served ${r.served.reduce((a, b) => a + b, 0)} bytes of a ${fileBytes} byte file`);
  assert.ok(w.served <= fileBytes + 65536, "one whole read serves the file once");
});
