#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): LOCAL run of the real reader-container server code against generated fixtures: L3 (/frames), L4 (/convert), L5 (/archive), plus the start-up time of the server.
   One FRESH server process per case (clean baseline); the client streams the fixture file as the request body and parses the answer with the product's own readRecords.
   Memory is the sum of VmRSS over the server and its children (ImageMagick, LibreOffice, 7z...), sampled every 25 ms from /proc. CPU is utime+stime of the tree.
   LABEL for every number: LOCAL, not platform. Tools here: LibreOffice/ImageMagick/7-Zip/exiftool versions in the result's `tools`, not the image's pinned ones (see RUN-PLAN.md).
   node run-local.mjs --set=l3|l4|l5|start --fix=/home/user/fix1f --out=../results/l3-local.json [--only=REGEX] [--time-ms=900000] */
import { spawn, execFileSync } from "node:child_process";
import { createReadStream, statSync, readdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { Readable } from "node:stream";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
import { Agent } from "../../../bio-plane/node_modules/undici/index.js";
import { TreeSampler } from "./proc-tree.mjs";
import { startServer } from "./server-util.mjs";
import { readRecords } from "../vendor/reader-container/src/records.mjs";
import { specOf, boundsFor } from "../cases.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const fix = arg.fix || "/home/user/fix1f", set = arg.set || "l3", only = arg.only ? new RegExp(arg.only) : null, TIME = Number(arg["time-ms"] || 900000);
const MiB = 1048576, GiB = 1073741824;
/* the ACTIVE bounds, read from bio-plane/src/read-bounds.mjs on origin/lane/platform (boundOf: beta rows give `standard`): document.bytes 100 MB, spreadsheet.bytes 50 MB, image.bytes 50 MB, image.pixels 120,000,000, image.edge 65,535,
   document.pages 5,000, archive.uploaded_bytes 524,288,000, unpacked 2 GiB, depth 3, ratio 1100, members 10,000, name 4096, member_bytes 2 GiB, scan.time_ms 900,000 */
const CASES = { l3: (f) => { const s = specOf(f); return s && s.set === "l3" ? { ...s, bounds: boundsFor(s.route, s.kind, TIME) } : null; }, l4: (f) => { const s = specOf(f); return s && s.set === "l4" ? { ...s, bounds: boundsFor(s.route, s.kind, TIME) } : null; }, l5: (f) => { const s = specOf(f); return s && s.set === "l5" ? { ...s, bounds: boundsFor(s.route, s.kind, TIME) } : null; } };
const tool = (c, a) => { try { return execFileSync(c, a, { stdio: ["ignore", "pipe", "ignore"], timeout: 60000 }).toString().split("\n").find(Boolean).trim(); } catch { return null; } };
const tools = { libreoffice: tool("soffice", ["--version"]), imagemagick: tool("convert", ["-version"]), exiftool: tool("exiftool", ["-ver"]), sevenzip: (() => { try { return execFileSync("7z", [], { stdio: ["ignore", "pipe", "ignore"] }).toString().split("\n").find((l) => /7-Zip/.test(l)).trim(); } catch { return null; } })(), node: process.version };

async function runCase(file, spec) {
  const size = statSync(join(fix, file)).size; const srv = await startServer(); const sampler = new TreeSampler(srv.child.pid, 25).start();
  await new Promise((r) => setTimeout(r, 300)); const baseline = sampler.peakSum;   /* idle server before the request */
  const q = new URLSearchParams({ kind: spec.kind, ...(spec.to ? { to: spec.to } : {}), ...(spec.route === "archive" ? { name: file } : {}) });
  const rec = { case: file, route: spec.route, kind: spec.kind, file_bytes: size, bounds: spec.bounds, server_listen_ms: Math.round(srv.listen_ms), server_idle_tree_rss_mb: Math.round(baseline) };
  const t0 = performance.now(); let ttfb = null, records = {}, outBytes = 0, refusal = null, endRec = null, factsRec = null, firstRecordMs = null, err = null; const frames = [], memberSample = [];
  try {
    const res = await fetch(`http://127.0.0.1:${srv.port}/${spec.route}?${q}`, { method: "POST", body: Readable.toWeb(createReadStream(join(fix, file))), duplex: "half", dispatcher: new Agent({ headersTimeout: 0, bodyTimeout: 0 }), headers: { "x-reader-bounds": JSON.stringify(spec.bounds), "content-type": "application/octet-stream" } });
    ttfb = performance.now() - t0; rec.http_status = res.status;
    for await (const { header, payload } of readRecords(res.body)) {
      if (firstRecordMs === null) firstRecordMs = performance.now() - t0;
      records[header.type] = (records[header.type] || 0) + 1; outBytes += payload ? payload.length : 0;
      if (header.type === "refusal") refusal = header; if (header.type === "end") endRec = header; if (header.type === "facts") factsRec = header;
      if (header.type === "frame" && frames.length < 3) frames.push({ page: header.page, w: header.width, h: header.height, png_bytes: payload?.length });
      if (header.type === "member" && memberSample.length < 3) memberSample.push({ name: header.name, size: header.size });
    }
  } catch (e) { err = String(e.message || e).slice(0, 200); }
  rec.wall_ms = Math.round(performance.now() - t0); rec.request_sent_to_first_response_byte_ms = ttfb === null ? null : Math.round(ttfb); rec.first_record_ms = firstRecordMs === null ? null : Math.round(firstRecordMs);
  rec.records = records; rec.payload_bytes_out = outBytes; rec.refusal = refusal ? { code: refusal.code, ...Object.fromEntries(Object.entries(refusal).filter(([k]) => ["size", "limit", "pixels", "pages", "members", "ratio", "why", "member"].includes(k)).map(([k, v]) => [k, typeof v === "string" ? v.slice(0, 120) : v])) } : null;
  rec.end = endRec; rec.facts = factsRec; rec.frames_sample = frames; rec.members_sample = memberSample; rec.error = err;
  rec.outcome = err ? "client-error" : refusal ? `refused:${refusal.code}` : endRec || factsRec || records.converted ? "completed" : "no-terminal-record";
  rec.cpu_s_tree = sampler.cpu(); Object.assign(rec, sampler.stop());
  srv.child.kill("SIGKILL"); await new Promise((r) => srv.child.once("exit", r));
  return rec;
}
const out = { when: new Date().toISOString(), label: "LOCAL, not platform", set, command: `node proto-mem/1f/local/run-local.mjs ${process.argv.slice(2).join(" ")}`, host: { cpus: execFileSync("nproc").toString().trim(), node: process.version }, tools, note: "server = vendored verbatim copy of lane/platform reader-container/container/server.mjs; tools are this machine's, not the image's pinned ones", results: [] };
if (set === "start") {
  /* start-up of the server and its /version (which runs each tool once): a local analogue of "image start", NOT a container cold start */
  for (let i = 0; i < 5; i++) {
    const srv = await startServer(); const t0 = performance.now(); const r = await fetch(`http://127.0.0.1:${srv.port}/version`); const j = await r.json(); const ms = performance.now() - t0;
    out.results.push({ run: i + 1, node_listen_ms: Math.round(srv.listen_ms), version_ms: Math.round(ms), tools: j.tools }); srv.child.kill("SIGKILL"); await new Promise((r) => srv.child.once("exit", r));
  }
} else {
  const files = readdirSync(fix).filter((f) => !f.startsWith("MANIFEST") && !f.endsWith(".log") && statSync(join(fix, f)).isFile()).sort();
  for (const f of files) { const spec = CASES[set](f); if (!spec || (only && !only.test(f))) continue; console.error("case", f); const r = await runCase(f, spec); console.error(" ->", r.outcome, r.wall_ms, "ms", r.peak_tree_rss_mb, "MB"); out.results.push(r); writeFileSync(arg.out, JSON.stringify(out, null, 1)); }
}
writeFileSync(arg.out, JSON.stringify(out, null, 1)); console.error("wrote", arg.out);
