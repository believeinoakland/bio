#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY, PLATFORM #4): LOCAL run of the PUBLISHED reader image (the digest reader-container/wrangler.jsonc deploys) against the generated fixtures: L3 (/frames), L4 (/convert), L5 (/archive).
   One FRESH container per case, shaped like Cloudflare's standard-1 as PLATFORM.md section 6.4 states it (4 GiB, 1/2 vCPU): docker run --memory=4g --memory-swap=4g --cpus=0.5. Disk is NOT limited (standard-1: 8 GB).
   Memory is the container cgroup's memory.max_usage_in_bytes (cgroup v1; it counts page cache, e.g. the input file the server writes to its temp directory), read after the answer; `oom_killed` from docker inspect.
   LABEL for every number: LOCAL, not platform (this machine's CPU and disk, docker's cgroup, not Cloudflare's VM). Needs dockerd running and the image pulled.
   node run-image.mjs --set=l3|l4|l5 --fix=/home/user/fix1f --out=../results/l3-image-local.json [--only=REGEX] [--time-ms=900000] [--memory=4g] [--cpus=0.5] */
import { execFileSync } from "node:child_process";
import { createReadStream, statSync, readdirSync, writeFileSync } from "node:fs";
import { Readable } from "node:stream";
import { join } from "node:path";
import { createServer } from "node:net";
import { Agent } from "../../../bio-plane/node_modules/undici/index.js";
import { readRecords } from "../vendor/reader-container/src/records.mjs";
import { specOf, boundsFor } from "../cases.mjs";
const IMAGE = "docker.io/civicsmith/reader-container@sha256:c1422b2661fa7993590493af11dc7d55ba75ea68b74fd4311b7001ee0f6d250b";
const arg = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const fix = arg.fix || "/home/user/fix1f", set = arg.set || "l3", only = arg.only ? new RegExp(arg.only) : null, TIME = Number(arg["time-ms"] || 900000);
const MEM = arg.memory || "4g", CPUS = arg.cpus || "0.5";
const dk = (...a) => execFileSync("docker", a, { stdio: ["ignore", "pipe", "pipe"], timeout: 120000 }).toString().trim();
const freePort = () => new Promise((res) => { const s = createServer().listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
const cg = (name, f) => { try { return Number(dk("exec", name, "cat", `/sys/fs/cgroup/${f}`)); } catch { return null; } };

async function startContainer(i) {
  const port = await freePort(), name = `rc1f-${process.pid}-${i}`, t0 = performance.now();
  dk("run", "-d", "--name", name, `--memory=${MEM}`, `--memory-swap=${MEM}`, `--cpus=${CPUS}`, "-p", `127.0.0.1:${port}:8080`, IMAGE);
  for (;;) { try { const r = await fetch(`http://127.0.0.1:${port}/nothing`); if (r.status === 404) break; } catch { /* not up yet */ } if (performance.now() - t0 > 60000) throw new Error("container did not start"); await new Promise((r) => setTimeout(r, 25)); }
  return { name, port, start_ms: Math.round(performance.now() - t0) };
}

async function runCase(file, spec, i) {
  const size = statSync(join(fix, file)).size, c = await startContainer(i);
  const rec = { case: file, route: spec.route, kind: spec.kind, file_bytes: size, bounds: spec.bounds, container_start_to_listening_ms: c.start_ms, idle_cgroup_mb: Math.round(cg(c.name, "memory/memory.usage_in_bytes") / 1048576) };
  const q = new URLSearchParams({ kind: spec.kind, ...(spec.to ? { to: spec.to } : {}), ...(spec.route === "archive" ? { name: file } : {}) });
  const t0 = performance.now(); let records = {}, outBytes = 0, refusal = null, endRec = null, factsRec = null, firstRecordMs = null, err = null;
  try {
    const res = await fetch(`http://127.0.0.1:${c.port}/${spec.route}?${q}`, { method: "POST", body: Readable.toWeb(createReadStream(join(fix, file))), duplex: "half", dispatcher: new Agent({ headersTimeout: 0, bodyTimeout: 0 }), headers: { "x-reader-bounds": JSON.stringify(spec.bounds), "content-type": "application/octet-stream" } });
    rec.http_status = res.status;
    for await (const { header, payload } of readRecords(res.body)) {
      if (firstRecordMs === null) firstRecordMs = performance.now() - t0;
      records[header.type] = (records[header.type] || 0) + 1; outBytes += payload ? payload.length : 0;
      if (header.type === "refusal") refusal = header; if (header.type === "end") endRec = header; if (header.type === "facts") factsRec = header;
    }
  } catch (e) { err = String(e.message || e).slice(0, 200); }
  rec.wall_ms = Math.round(performance.now() - t0); rec.first_record_ms = firstRecordMs === null ? null : Math.round(firstRecordMs);
  rec.records = records; rec.payload_bytes_out = outBytes; rec.end = endRec; rec.error = err;
  rec.refusal = refusal ? { code: refusal.code, ...Object.fromEntries(Object.entries(refusal).filter(([k]) => ["size", "limit", "pixels", "pages", "members", "ratio", "why", "member"].includes(k)).map(([k, v]) => [k, typeof v === "string" ? v.slice(0, 160) : v])) } : null;
  rec.peak_cgroup_mb = Math.round(cg(c.name, "memory/memory.max_usage_in_bytes") / 1048576) || null;
  rec.cgroup_failcnt = cg(c.name, "memory/memory.failcnt");
  rec.cpu_s = (() => { const n = cg(c.name, "cpuacct/cpuacct.usage"); return n == null ? null : Math.round(n / 1e8) / 10; })();
  try { const st = JSON.parse(dk("inspect", "--format", "{{json .State}}", c.name)); rec.oom_killed = st.OOMKilled; rec.container_running_after = st.Running; } catch { rec.oom_killed = null; }
  rec.outcome = err ? "client-error" : refusal ? `refused:${refusal.code}` : endRec || factsRec || records.converted ? "completed" : "no-terminal-record";
  try { dk("rm", "-f", c.name); } catch { /* gone */ }
  return rec;
}

const out = { when: new Date().toISOString(), label: "LOCAL, not platform: the published reader image in local docker, standard-1 shape", set, image: IMAGE, shape: { memory: MEM, memory_swap: MEM, cpus: CPUS }, command: `node proto-mem/1f/local/run-image.mjs ${process.argv.slice(2).join(" ")}`, host: { cpus: execFileSync("nproc").toString().trim(), node: process.version }, results: [] };
const files = readdirSync(fix).filter((f) => !f.startsWith("MANIFEST") && statSync(join(fix, f)).isFile()).sort();
let i = 0;
for (const f of files) {
  const s = specOf(f); if (!s || s.set !== set || (only && !only.test(f))) continue;
  console.error("case", f); const r = await runCase(f, { ...s, bounds: boundsFor(s.route, s.kind, TIME) }, i++);
  console.error(" ->", r.outcome, r.wall_ms, "ms, peak", r.peak_cgroup_mb, "MB, oom", r.oom_killed); out.results.push(r); writeFileSync(arg.out, JSON.stringify(out, null, 1));
}
writeFileSync(arg.out, JSON.stringify(out, null, 1)); console.error("wrote", arg.out);
