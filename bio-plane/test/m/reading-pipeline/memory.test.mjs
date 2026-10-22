/* reading-pipeline: requirement-named tests for the bounded reading of a large PDF (R2 R11 R15, fix round 4, C5a/C5b/P8;
 * K4461, K4467), at the module's interface: `read` of a stored PDF capture.
 *
 * The real files are the govinfo budget volumes pdf-reader's memory test reads (2.39, 8.39 and 15.19 MiB; 188, 295 and
 * 1,354 pages), fetched once into BIO_FIXTURE_CACHE (default: the temporary directory) and checked against their SHA-256;
 * the fourth is extraction's 20 MB, 1,300-page synthetic. Each is read in a process of its own (memory-child.mjs) with the
 * heap held to the idle process plus 56 MB, so garbage cannot lie about what the reading needs; the 64 MB allowed is
 * asserted of heap + array buffers polled while `read` runs, above the baseline taken with the capture stored. A file that
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
const BOUND_MB = 64;

/* `digest`: the SHA-256 of the whole answer of `read` (reading, units, bound figures) as the module gave it before the
   reading was bounded, on the tranche tip. */
const FILES = [
  { name: "BUDGET-2025-BUD", pages: 188, sha: "3f1df41cfa3cebfd675b2a6ed673b6f665e0848c293d8d3bb5ab1815a0bae36b",
    digest: "95b076e2affca6ad31a61d57eb98d644764296f7e6af736415eff45debcbd268" },
  { name: "BUDGET-2025-PER", pages: 295, sha: "067ad707534788e9011d4b6abdb686f1c3505888218e2ca5327c04e0ad58ae7f",
    digest: "7889fee95abbd00987ff5f6f7e31b561b60449cc6b05c8b27b4ed6b878150b42" },
  { name: "BUDGET-2024-APP", pages: 1354, sha: "6e0b3dc5f2f3f5bbab8ae5032bbc29207a8dbb290ba25ebafe3feb20dfe13c1e",
    digest: "6a2425b85762bba034046913218f13ddd30647a1f06efe98165a7aa98466b10d" },
  { name: "the 20 MB synthetic", synth: true, pages: 1300,
    digest: "a9a2a0f1956959eadb226839738501353eea186494e993058a83d9f67516f5d7" },
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
  const capMB = Math.ceil(JSON.parse(idle.out).baseHeapMB) + 56;
  return { capMB, flags: ["--expose-gc", `--max-old-space-size=${capMB}`, "--max-semi-space-size=2"] };
}

for (const f of FILES) {
  test(`R2 R11 R15 (memory): the reading of ${f.name} (${f.pages} pages) holds under ${BOUND_MB} MB above idle, and its answer is unchanged`,
    { timeout: 900_000 }, async () => {
      const path = await fixture(f);
      const { capMB, flags } = await capFlags();
      const m = await child(["measure", path], flags);
      assert.equal(m.code, 0, `${f.name}: the reading did not complete in a ${capMB} MB heap (${m.signal ?? "exit " + m.code}): ${m.err.split("\n").slice(0, 3).join(" | ")}`);
      const r = JSON.parse(m.out);
      console.log(`reading ${f.name}: ${f.pages} pages, ${Math.round(r.ms)} ms, peak heap + array buffers above the stored capture ${r.peakMB.toFixed(1)} MB`);
      assert.equal(r.pages, f.pages);
      assert.ok(r.peakMB < BOUND_MB, `${f.name}: peak ${r.peakMB.toFixed(1)} MB above idle, over ${BOUND_MB}`);
      const d = await child(["digest", path], ["--expose-gc"]);
      assert.equal(d.code, 0, d.err.slice(0, 300));
      assert.equal(JSON.parse(d.out).digest, f.digest, `${f.name}: the answer is not the answer before`);
    });
}
