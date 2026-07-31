#!/usr/bin/env node
// unpdf-measure-probe.mjs — reproduces the CPDF-1 (D-91 phase-2) go/no-go numbers.
//
// NOT part of the test battery (deliberately not named *.test.mjs): it installs
// unpdf + esbuild into an OS temp dir, so it touches the network and the disk and
// must never run in `npm test`. It changes NOTHING in this repo: no dependency is
// added to package.json, no bundle is written under dist/. Run it by hand:
//
//     node test/unpdf-measure-probe.mjs                 # bundle size only (offline-ish: needs npm to fetch unpdf once)
//     node test/unpdf-measure-probe.mjs some-agenda.pdf # also times a node-proxy extraction
//
// WHAT IT MEASURES
//   1. BUNDLE SIZE (authoritative, ours): bundles the plane's own src/index.mjs and
//      a tiny module importing unpdf's text-extraction entry point, using the SAME
//      esbuild flags as `npm run build`, and reports raw + gzip-9 bytes and the
//      headroom under the 3 MB Cloudflare-Workers-Free limit. The 3 MB figure and
//      the fact that it is measured after gzip are the VENDOR'S claim, labelled so.
//   2. EXTRACTION COST (node PROXY, labelled): if given a PDF, times unpdf text
//      extraction in Node. This is NOT Worker CPU. A Worker cannot time itself
//      (Date.now() is frozen during sync execution; see MEASUREMENTS.md and
//      src/cpu.mjs); authoritative Worker CPU needs a deployed probe, which is a
//      gated follow-on. Treat these ms as order-of-magnitude only.

import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { gzipSync } from "node:zlib";

const HERE = dirname(fileURLToPath(import.meta.url));
const PLANE_SRC = resolve(HERE, "../src/index.mjs");
const LIMIT = 3 * 1024 * 1024; // 3 MB — VENDOR figure (Cloudflare Workers Free), applied after gzip
const PLANE_ESBUILD_FLAGS = [
  "--bundle", "--format=esm", "--platform=neutral",
  "--external:cloudflare:workers", "--external:node:*",
];
const mb = (n) => (n / 1048576).toFixed(3);

const work = mkdtempSync(join(tmpdir(), "cpdf1-"));
try {
  writeFileSync(join(work, "package.json"), JSON.stringify({
    name: "cpdf1-probe", private: true, type: "module",
  }));
  writeFileSync(join(work, "entry.mjs"),
    'import { extractText, getDocumentProxy } from "unpdf";\n' +
    "export async function extract(bytes){const pdf=await getDocumentProxy(new Uint8Array(bytes));" +
    "return await extractText(pdf,{mergePages:true});}\n");

  console.log("installing esbuild + unpdf into", work, "(does not touch the repo)…");
  execFileSync("npm", ["install", "--no-audit", "--no-fund", "esbuild@^0.25.0", "unpdf"],
    { cwd: work, stdio: "inherit" });
  try { execFileSync("npm", ["approve-scripts", "esbuild"], { cwd: work, stdio: "inherit" }); } catch {}

  const esbuild = join(work, "node_modules/.bin/esbuild");
  const bundle = (entry, outName) => {
    const out = join(work, outName);
    execFileSync(esbuild, [entry, ...PLANE_ESBUILD_FLAGS, "--outfile=" + out], { stdio: "inherit" });
    const buf = readFileSync(out);
    return { raw: buf.length, gz: gzipSync(buf, { level: 9 }).length, buf };
  };

  const plane = bundle(PLANE_SRC, "plane.bundled.mjs");
  const entry = bundle(join(work, "entry.mjs"), "entry.bundled.mjs");
  const combinedRaw = plane.raw + entry.raw;
  const combinedGz = gzipSync(Buffer.concat([plane.buf, entry.buf]), { level: 9 }).length;

  console.log("\n=== BUNDLE SIZE (ours; esbuild, plane flags, unminified) ===");
  console.log(`plane baseline   raw ${plane.raw} (${mb(plane.raw)} MB)   gz9 ${plane.gz} (${mb(plane.gz)} MB)`);
  console.log(`unpdf text entry raw ${entry.raw} (${mb(entry.raw)} MB)   gz9 ${entry.gz} (${mb(entry.gz)} MB)`);
  console.log(`plane + unpdf*   raw ${combinedRaw} (${mb(combinedRaw)} MB)   gz9 ${combinedGz} (${mb(combinedGz)} MB)`);
  console.log("  *additive upper bound; a single integrated build tree-shares runtime helpers and is no larger");
  console.log(`LIMIT (VENDOR)   3 MB = ${LIMIT} bytes, applied after gzip`);
  console.log(`headroom now     gz ${LIMIT - plane.gz} (${mb(LIMIT - plane.gz)} MB)`);
  console.log(`headroom w/ unpdf gz ${LIMIT - combinedGz} (${mb(LIMIT - combinedGz)} MB); raw ${LIMIT - combinedRaw} (${mb(LIMIT - combinedRaw)} MB)`);

  const pdfPath = process.argv[2];
  if (pdfPath) {
    const { extract } = await import(join(work, "entry.mjs")).catch(() =>
      import("file://" + join(work, "node_modules/unpdf/dist/index.mjs")).then((u) => ({
        extract: async (b) => u.extractText(await u.getDocumentProxy(new Uint8Array(b)), { mergePages: true }),
      })));
    const bytes = readFileSync(resolve(pdfPath));
    const once = async () => {
      const t0 = performance.now();
      const r = await extract(Uint8Array.prototype.slice.call(new Uint8Array(bytes)));
      return { ms: performance.now() - t0, pages: r.totalPages, chars: r.text.length };
    };
    const warm = await once();
    const runs = [];
    for (let i = 0; i < 5; i++) runs.push((await once()).ms);
    runs.sort((a, b) => a - b);
    console.log("\n=== EXTRACTION COST — NODE PROXY, NOT Worker CPU ===");
    console.log(`file ${pdfPath} (${bytes.length} bytes), pages ${warm.pages}, chars ${warm.chars}`);
    console.log(`warm-up ${warm.ms.toFixed(1)} ms (includes one-time pdf.js module load)`);
    console.log(`timed(warm) ms: ${runs.map((r) => r.toFixed(1)).join(", ")}  median ${runs[2].toFixed(1)}  ms/page ${(runs[2] / warm.pages).toFixed(2)}`);
    console.log(`node ${process.version} ${process.platform}/${process.arch} — order of magnitude only; authoritative Worker CPU needs a deployed probe`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
