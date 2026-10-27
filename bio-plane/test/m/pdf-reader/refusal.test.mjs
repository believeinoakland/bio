/* pdf-reader: requirement-named tests for the refusal of a document too large to read (build/requirements/pdf-reader.md
 * R42; fix round 4b, F10; K4498), at the module's interface: `extractPdfStructure` of a PDF whose pages and size would take
 * the reading past the object's memory.
 *
 * The refused file is a synthetic text-dense one (dense.mjs): thousands of pages of text, under reading-pipeline's 24 MiB
 * byte ceiling, which that ceiling lets through because the pages are known only once the file is opened. It is read in a
 * process of its own (memory-child.mjs) with the V8 heap held to the idle process plus 64 MB, so a refusal that built any
 * page's text would die there. The controls are the real 1,354-page govinfo volume and a 20 MB, 1,300-page synthetic. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { extractPdfStructure } from "../../../src/pdfstructure.mjs";
import { densePdf } from "./dense.mjs";
import { digestOf } from "./digest.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const CHILD = here("./memory-child.mjs");
const CACHE = process.env.BIO_FIXTURE_CACHE || join(tmpdir(), "bio-test-fixtures");
const WORK = mkdtempSync(join(tmpdir(), "pdf-reader-r42-"));
process.on("exit", () => { try { rmSync(WORK, { recursive: true, force: true }); } catch { /* the directory is only scratch */ } });

const MIB = 1048576;
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
function child(args, nodeArgs = []) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [...nodeArgs, CHILD, ...args], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code, signal) => resolve({ code, signal, out, err }));
  });
}
async function capFlags(over) {
  const idle = await child(["idle"], ["--expose-gc"]);
  assert.equal(idle.code, 0, idle.err.slice(0, 300));
  const capMB = Math.ceil(JSON.parse(idle.out).baseHeapMB) + over;
  return { capMB, flags: ["--expose-gc", `--max-old-space-size=${capMB}`, "--max-semi-space-size=2"] };
}
function saved(name, bytes) {
  const path = join(WORK, name);
  writeFileSync(path, bytes);
  return path;
}

const APP = { name: "BUDGET-2024-APP", pages: 1354, sha: "6e0b3dc5f2f3f5bbab8ae5032bbc29207a8dbb290ba25ebafe3feb20dfe13c1e",
              digest: "a3d4b5f44afdea88254bcacb596ce3ca5f623bfd63d68a04468b96d52d2c054c" };
async function govinfo(f) {
  const path = join(CACHE, `${f.name}.pdf`);
  if (existsSync(path) && sha256(readFileSync(path)) === f.sha) return path;
  mkdirSync(CACHE, { recursive: true });
  const res = await fetch(`https://www.govinfo.gov/content/pkg/${f.name}/pdf/${f.name}.pdf`);
  assert.ok(res.ok, `${f.name}: answered ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  assert.equal(sha256(body), f.sha, `${f.name}: the file fetched is not the file measured`);
  writeFileSync(`${path}.part`, body);
  renameSync(`${path}.part`, path);
  return path;
}

test("R42: a text-dense PDF of 3,500 pages under 24 MiB is refused as final, stating its pages, in under 64 MB above idle", { timeout: 600_000 }, async () => {
  const bytes = densePdf({ pages: 3500, linesPerPage: 120 });
  assert.ok(bytes.length < 24 * MIB && bytes.length > 12 * MIB, `the file is ${(bytes.length / MIB).toFixed(1)} MiB`);
  const path = saved("dense-3500.pdf", bytes);
  const { capMB, flags } = await capFlags(64);
  const m = await child(["measure", path], flags);
  assert.equal(m.code, 0, `the refusal did not complete in a ${capMB} MB heap (${m.signal ?? "exit " + m.code}): ${m.err.split("\n").slice(0, 3).join(" | ")}`);
  const r = JSON.parse(m.out);
  console.log(`R42 refusal of ${r.pages} pages, ${(bytes.length / MIB).toFixed(1)} MiB: ${Math.round(r.ms)} ms, peak heap + array buffers above idle ${r.peakMB.toFixed(1)} MB (idle ${r.baseMB.toFixed(1)} MB)`);
  assert.equal(r.ok, false);
  assert.equal(r.reason, "TOO_LARGE_TO_READ");
  assert.equal(r.pages, 3500);
  assert.ok(r.peakMB < 64, `peak ${r.peakMB.toFixed(1)} MB above idle`);

  const got = await extractPdfStructure(bytes);
  assert.equal(got.ok, false);
  assert.equal(got.container, "pdf");
  assert.equal(got.failure, "final");
  assert.equal(got.reason, "TOO_LARGE_TO_READ");
  assert.equal(got.pages, 3500);
  assert.equal(got.bytes, bytes.length);
  assert.equal(got.limit_mb, 100);
  assert.ok(got.need_mb > got.limit_mb, `need ${got.need_mb} MB is over the ${got.limit_mb} MB limit`);
  assert.equal(got.text, undefined, "no page's text was built");
  assert.equal(got.links, undefined);
});

test("R42: the rule is pages × 0.031 + 25 + bytes MB over 100: 2,300 text pages are read and 2,450 are refused", { timeout: 600_000 }, async () => {
  const under = await extractPdfStructure(densePdf({ pages: 2300, linesPerPage: 2 }));
  assert.equal(under.ok, true, under.reason);
  assert.equal(under.pages, 2300);
  assert.equal(under.text.pages.length, 2300);
  const over = await extractPdfStructure(densePdf({ pages: 2450, linesPerPage: 2 }));
  assert.equal(over.ok, false);
  assert.equal(over.reason, "TOO_LARGE_TO_READ");
  assert.equal(over.pages, 2450);
  const mb = over.bytes / MIB;
  assert.ok(Math.abs(over.need_mb - (2450 * 0.031 + 25 + mb)) <= 0.5, `need ${over.need_mb} MB is the rule's ${(2450 * 0.031 + 25 + mb).toFixed(1)}`);
  assert.equal(over.text_share, 1);
});

test("R42 (control): 3,500 scanned pages (an image a page, no text) under 24 MiB are read: the rule counts the pages that show text", { timeout: 600_000 }, async () => {
  const bytes = densePdf({ pages: 3500, scan: true, padTo: 18_000_000 });
  assert.ok(bytes.length > 17 * MIB && bytes.length < 24 * MIB);
  const got = await extractPdfStructure(bytes);
  assert.equal(got.ok, true, `${got.reason}: ${got.need_mb} MB of ${got.limit_mb}`);
  assert.equal(got.pages, 3500);
  assert.equal(got.images.length, 3500);
});

test("R42 (control): 3,500 pages of an encrypted document, which builds no text, are read and stated encrypted", { timeout: 600_000 }, async () => {
  const got = await extractPdfStructure(densePdf({ pages: 3500, linesPerPage: 40, encrypted: true }));
  assert.equal(got.ok, true, `${got.reason}: ${got.need_mb} MB of ${got.limit_mb}`);
  assert.equal(got.pages, 3500);
  assert.deepEqual(got.text.undetermined.map((m) => m.reason), ["encrypted"]);
});

test("R42 (control): a 20 MB, 1,300-page synthetic PDF is read, and its answer is unchanged", { timeout: 600_000 }, async () => {
  const bytes = densePdf({ pages: 1300, linesPerPage: 120, padTo: 20_000_000 });
  assert.ok(bytes.length > 19_000_000);
  const got = await extractPdfStructure(bytes);
  assert.equal(got.ok, true, got.reason);
  assert.equal(got.pages, 1300);
  assert.equal(got.text.pages.length, 1300);
  assert.equal(digestOf(got), SYNTH_20MB_DIGEST);
});

test("R42 (control): BUDGET-2024-APP (1,354 pages, 15.9 MB) is read, and its answer is unchanged", { timeout: 900_000 }, async () => {
  const path = await govinfo(APP);
  const d = await child(["digest", path]);
  assert.equal(d.code, 0, d.err.slice(0, 300));
  assert.equal(JSON.parse(d.out).digest, APP.digest, "the answer is not the answer before");
  const { flags } = await capFlags(56);
  const m = await child(["measure", path], flags);
  assert.equal(m.code, 0, `the reading did not complete: ${m.err.split("\n").slice(0, 3).join(" | ")}`);
  const r = JSON.parse(m.out);
  assert.equal(r.ok, true);
  assert.equal(r.pages, APP.pages);
});

test("R42: a file that is not a PDF, or not bytes, is refused as it was, not as too large", async () => {
  assert.deepEqual(await extractPdfStructure(new Uint8Array([1, 2, 3])), { ok: false, container: "pdf", reason: "NOT_A_PDF" });
  assert.deepEqual(await extractPdfStructure("text"), { ok: false, container: "pdf", reason: "NOT_BYTES" });
});

const SYNTH_20MB_DIGEST = "f79dca79c60ceb0c1dce25e5a7e1aa0eac3233abbd55c12ccea7ee5aa960a4c0"; // the answer before R42 (densePdf is deterministic)
