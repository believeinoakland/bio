#!/usr/bin/env node
/* Build the pdf-worker into ONE self-contained module, the same way the plane
 * builds (esbuild, neutral platform, node/cloudflare externals). The output is
 * committed so a fresh worktree's battery can load it under miniflare without
 * installing `unpdf` — exactly as the plane commits dist/bio-plane.bundled.mjs.
 *
 * `unpdf` (pdf.js) is INLINED here and never enters the plane's module graph:
 * that separation is the whole point of the fleet (adding unpdf to the plane
 * broke 21 miniflare suites — a bare npm specifier cannot resolve in the plane's
 * un-bundled source, MEASUREMENTS.md 2026-07-31).
 */
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

await build({
  entryPoints: [join(ROOT, "src/index.mjs")],
  bundle: true,
  format: "esm",
  platform: "neutral",
  external: ["cloudflare:workers", "node:*"],
  outfile: join(ROOT, "dist/pdf-worker.bundled.mjs"),
});

console.log("pdf-worker: built dist/pdf-worker.bundled.mjs");
