#!/usr/bin/env node
/* proto-mem/1f (THROWAWAY): LOCAL run of the PRODUCT'S caller side (reader-container/src/reader.mjs: plan, read, collect; bounds from bio-plane/src/read-bounds.mjs) against the vendored container server.
   It needs a checkout/extract of origin/lane/platform that holds reader-container/src and bio-plane/src:  --lp=DIR   (e.g. `git archive origin/lane/platform bio-plane/src reader-container | tar -x -C DIR`).
   Purpose: the refusals the container never sees (a file over its route's bound; nesting depth 4; a ZIP directory over the member/name/unpacked/ratio bounds, judged from the tail before any upload) and
   the memory the CALLER holds (reader.mjs readAll holds a whole convert/frames input; readRecords holds each payload whole). The caller here is Node, not a Worker isolate: its memory is an indication only.
   LOCAL, not platform.   node run-caller-local.mjs --lp=DIR --fix=/home/user/fix1f --out=../results/caller-local.json [--only=REGEX] */
import { openSync, readSync, closeSync, statSync, readdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { startServer } from "./server-util.mjs";
import { specOf } from "../cases.mjs";
const a = Object.fromEntries(process.argv.slice(2).map((x) => { const [k, ...v] = x.replace(/^--/, "").split("="); return [k, v.join("=") || "1"]; }));
const lp = a.lp, fix = a.fix || "/home/user/fix1f", only = a.only ? new RegExp(a.only) : null;
const { read, plan } = await import(join(lp, "reader-container/src/reader.mjs"));
const hwm = () => Number(readFileSync("/proc/self/status", "utf8").match(/^VmHWM:\s+(\d+) kB/m)[1]) / 1024;
const sourceOf = (path) => { const size = statSync(path).size; return { size, readRange: async (offset, length) => { const fd = openSync(path, "r"); try { const b = Buffer.alloc(length); const n = readSync(fd, b, 0, length, offset); return new Uint8Array(b.buffer, b.byteOffset, n); } finally { closeSync(fd); } } }; };
const out = { when: new Date().toISOString(), label: "LOCAL, not platform", command: `node proto-mem/1f/local/run-caller-local.mjs ${process.argv.slice(2).join(" ")}`, note: "caller = Node, not a Worker isolate; process HWM is cumulative across cases in this one process (a fresh process per case is NOT used here), so read `caller_hwm_mb` as a running maximum", results: [] };
const files = readdirSync(fix).filter((f) => specOf(f) && (!only || only.test(f))).sort();
for (const f of files) {
  const s = specOf(f), src = sourceOf(join(fix, f)); const srv = await startServer(); const container = (req) => fetch(new Request(req.url.replace("http://reader-container", `http://127.0.0.1:${srv.port}`), req));
  const t0 = performance.now(); const rec = { file: f, set: s.set, kind: s.kind, file_bytes: src.size }; const p = plan(src, s.kind); rec.plan = p.ok ? { ok: true, route: p.route, bound: p.bound } : { ok: false, code: p.code, size: p.size, limit: p.limit };
  if (/^zip-nest-/.test(f)) {
    /* what the plane does with an archive inside an archive: read() each member that is itself a ZIP with depth + 1 (reader.mjs itself only judges the depth it is given) */
    const walk = async (bytes, depth) => { const mem = { size: bytes.length, readRange: async (o, l) => bytes.subarray(o, o + l) }; const r = await read(mem, "zip", { container, depth, name: "n.zip" }); if (!r.ok) return { opened_to_depth: depth - 1, refused: r.code, limit: r.limit }; let deepest = depth; for await (const m of r.members) { if (m.ok && m.bytes && /^PK/.test(Buffer.from(m.bytes.subarray(0, 2)).toString("latin1"))) { const d = await walk(m.bytes, depth + 1); if (d.refused) return { ...d }; deepest = Math.max(deepest, d.opened_to_depth); } } return { opened_to_depth: deepest }; };
    const t1 = performance.now(); const bytes = new Uint8Array(readFileSync(join(fix, f))); (rec.depths ??= []).push({ recursive_walk: await walk(bytes, 1), ms: Math.round(performance.now() - t1) });
  } else for (const depth of [1]) {
    const t1 = performance.now(); let r;
    try { r = await read(src, s.kind, { container, depth, name: f }); } catch (e) { r = { ok: false, code: "THROW", why: String(e.message).slice(0, 100) }; }
    const row = { depth, ok: !!r.ok, code: r.code, limit: r.limit, size: r.size, detail: r.ok ? undefined : String(r.detail || "").slice(0, 140) };
    if (r.ok && r.route === "archive") { let members = 0, bytes = 0, refusal = null, maxMember = 0; for await (const m of r.members) { if (!m.ok) { refusal = m.code; break; } members++; const n = m.bytes ? m.bytes.length : 0; bytes += n; maxMember = Math.max(maxMember, n); } Object.assign(row, { members, member_bytes_total: bytes, max_member_bytes: maxMember, refusal_mid_stream: refusal }); }
    if (r.ok && r.route === "convert") row.converted_bytes = r.bytes.length; if (r.ok && r.route === "frames") Object.assign(row, { frames: r.frames.length, facts: r.facts });
    row.ms = Math.round(performance.now() - t1); (rec.depths ??= []).push(row);
  }
  rec.total_ms = Math.round(performance.now() - t0); rec.caller_hwm_mb = Math.round(hwm()); out.results.push(rec); await srv.stop(); console.error(f, rec.total_ms, "ms", JSON.stringify(rec.depths.map((d) => d.ok ? "ok" : d.code))); writeFileSync(a.out, JSON.stringify(out, null, 1));
}
writeFileSync(a.out, JSON.stringify(out, null, 1)); process.exit(0);
