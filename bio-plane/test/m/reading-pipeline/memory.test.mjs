/* reading-pipeline: requirement-named tests for the bounded reading of a large PDF (R2 R11 R15, fix round 4, C5a/C5b/P8;
 * K4461, K4467), at the module's interface: `read` of a stored PDF capture.
 *
 * The real files are the govinfo budget volumes pdf-reader's memory test reads (2.39, 8.39 and 15.19 MiB; 188, 295 and
 * 1,354 pages), fetched once into BIO_FIXTURE_CACHE (default: the temporary directory) and checked against their SHA-256;
 * the fourth is extraction's 20 MB, 1,300-page synthetic. Each is read in a process of its own (memory-child.mjs) with the
 * heap held to the idle process plus 64 MB, so garbage cannot lie about what the reading needs. Heap + array buffers are
 * polled while `read` runs, above the baseline taken with the capture stored (K4478): the reading's WORK, its peak less the
 * bytes `read` was handed, is under 64 MB, and the whole read with its bytes under 96 MB (the object's limit is 128). A file that
 * cannot be had fails its test by name; nothing is skipped. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const CHILD = here("./memory-child.mjs");
const CACHE = process.env.BIO_FIXTURE_CACHE || join(tmpdir(), "bio-test-fixtures");
const GOVINFO = (n) => `https://www.govinfo.gov/content/pkg/${n}/pdf/${n}.pdf`;
const BOUND_MB = 64, WHOLE_MB = 96;

/* `digest`: the SHA-256 of the whole answer of `read` (reading, units, bound figures) as the module gave it before the
   reading was bounded, on the tranche tip. R37 (fix round 4b) moved two: BUD and PER are readings that did not determine
   (the text is undetermined), and a failed reading now carries `failure: "final"`; that one field is the whole difference
   (diffed key by key against the answer before), and APP and the synthetic, which determine, carry none and keep theirs. */
/* Fix round 9 (K4861 (2), K4890): the four digests are re-recorded. The cause is the reader contract's additions to every answer (R45: `counters`,
   `next`, `final`); the reading and units are the answer before (diffed key by key on the synthetic against the answer of the job's earlier commit: no other
   key moved). */
/* Fix round 9 (B52): the digest is taken with the "judged from a sample" sentence off `reading.basis` by name (memory-child.mjs), so the pin holds
   no sentence's text and survives its rewording. APP and the synthetic were re-pinned on evidence: the answer at `40ce74590b` (the earlier pins) and at
   the job's HEAD, each with that sentence off, hash alike (`14e0a7fd...`, `8cb8e488...`); with it on, `reading.basis` was the only key that differed. */
const FILES = [
  { name: "BUDGET-2025-BUD", pages: 188, sha: "3f1df41cfa3cebfd675b2a6ed673b6f665e0848c293d8d3bb5ab1815a0bae36b",
    digest: "7578e1416a2d53aa382244b85636cdd2600dfc3f6559a64269600a69b017a848" },
  { name: "BUDGET-2025-PER", pages: 295, sha: "067ad707534788e9011d4b6abdb686f1c3505888218e2ca5327c04e0ad58ae7f",
    digest: "4b2f73e1cdef8f8dc383c94aa784d75f0eee646cef51d563ee1d163f499e0f84" },
  { name: "BUDGET-2024-APP", pages: 1354, sha: "6e0b3dc5f2f3f5bbab8ae5032bbc29207a8dbb290ba25ebafe3feb20dfe13c1e",
    digest: "14e0a7fd24fa0d8f412c55b321860def530705bf91a53fbec676b63e8a939a3f" },
  { name: "the 20 MB synthetic", synth: true, pages: 1300,
    digest: "8cb8e4882d59686149237e48da7e9fd76abdf7fc81a9657409a95ef97df22610" },
];

const sha256 = (b) => createHash("sha256").update(b).digest("hex");
async function fixture(f) {
  if (f.synth) return "synth";
  const path = join(CACHE, `${f.name}.pdf`);
  if (existsSync(path) && sha256(readFileSync(path)) === f.sha) return path;
  mkdirSync(CACHE, { recursive: true });
  const res = await fetch(GOVINFO(f.name));
  assert.ok(res.ok, `${f.name}: ${GOVINFO(f.name)} answered ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  assert.equal(sha256(body), f.sha, `${f.name}: the file fetched is not the file measured`);
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
async function capFlags() {
  const idle = await child(["idle"], ["--expose-gc"]);
  assert.equal(idle.code, 0, idle.err.slice(0, 300));
  const capMB = Math.ceil(JSON.parse(idle.out).baseHeapMB) + 64;
  return { capMB, flags: ["--expose-gc", `--max-old-space-size=${capMB}`, "--max-semi-space-size=2"] };
}

for (const f of FILES) {
  test(`R2 R11 R15 R36 (memory): the reading of ${f.name} (${f.pages} pages) works in under ${BOUND_MB} MB above its bytes (${WHOLE_MB} with them), and its answer is unchanged`,
    { timeout: 900_000 }, async () => {
      const path = await fixture(f);
      const { capMB, flags } = await capFlags();
      const m = await child(["measure", path], flags);
      assert.equal(m.code, 0, `${f.name}: the reading did not complete in a ${capMB} MB heap (${m.signal ?? "exit " + m.code}): ${m.err.split("\n").slice(0, 3).join(" | ")}`);
      const r = JSON.parse(m.out);
      console.log(`reading ${f.name}: ${f.pages} pages, ${Math.round(r.ms)} ms, peak heap + array buffers above the stored capture ${r.peakMB.toFixed(1)} MB, of which the bytes ${r.bytesMB.toFixed(1)} MB`);
      assert.equal(r.pages, f.pages);
      assert.ok(r.peakMB - r.bytesMB < BOUND_MB, `${f.name}: the work peaked ${(r.peakMB - r.bytesMB).toFixed(1)} MB above its bytes, over ${BOUND_MB}`);
      assert.ok(r.peakMB < WHOLE_MB, `${f.name}: the whole read peaked ${r.peakMB.toFixed(1)} MB with its bytes, over ${WHOLE_MB}`);
      const d = await child(["digest", path], ["--expose-gc"]);
      assert.equal(d.code, 0, d.err.slice(0, 300));
      assert.equal(JSON.parse(d.out).digest, f.digest, `${f.name}: the answer is not the answer before`);
    });
}
