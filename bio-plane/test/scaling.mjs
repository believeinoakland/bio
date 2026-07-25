/* Measures wholeStorePassMs against bundle count on the live deployment.
   Probe class, scratch namespace only. Answers whether the ~100ms observed at
   one bundle is a fixed overhead or a per-bundle multiplier. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const TOK = readFileSync("/tmp/tok", "utf8").trim();
const BASE = "https://bio-plane.neocloudflare.workers.dev";
const sha = (s) => createHash("sha256").update(s).digest("hex");

const md = (id, n) =>
  `---\nid: ${id}\nobject_type: information\ncurrent_state: collected\n---\n\n## Summary\n\nrev ${n}\n`;

const pkg = (id) => {
  const body = md(id, 1);
  return {
    bundleId: id, snapKey: "20260723T100000Z_aaaa1111", author: "probe",
    meta: { object_type: "information", group: "believe-in-oakland", title: "load",
            current_state: "collected", created: "2026-01-01T00:00:00Z",
            last_updated: "2026-07-23T10:00:00Z" },
    files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) }],
    register: [], base: null,
  };
};

const post = async (op, body) => {
  const r = await fetch(`${BASE}/?op=${op}&token=${TOK}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.json();
};

const stats = async () => {
  const t0 = Date.now();
  const r = await (await fetch(`${BASE}/?op=stats&token=${TOK}`)).json();
  return { ...r.result, edgeMs: Date.now() - t0 };
};

const CONC = 8;
const CHECKPOINTS = [50, 100, 200, 350, 500];
const rows = [];
let made = 0, failed = 0;

const s0 = await stats();
console.log(`start: bundles=${s0.bundles} wholeStorePassMs=${s0.wholeStorePassMs} dbBytes=${s0.dbBytes}`);
rows.push([s0.bundles, s0.wholeStorePassMs, s0.dbBytes]);

for (const target of CHECKPOINTS) {
  const need = target - made;
  const ids = Array.from({ length: need }, (_, i) => `LOAD-2026-${String(made + i).padStart(5, "0")}-x`);
  for (let i = 0; i < ids.length; i += CONC) {
    const slice = ids.slice(i, i + CONC);
    const res = await Promise.all(slice.map((id) => post("promote", pkg(id)).catch((e) => ({ err: String(e) }))));
    for (const r of res) if (!r?.result?.ok) failed++;
  }
  made = target;
  const s = await stats();
  rows.push([s.bundles, s.wholeStorePassMs, s.dbBytes]);
  console.log(`bundles=${String(s.bundles).padStart(4)}  wholeStorePassMs=${String(s.wholeStorePassMs).padStart(5)}  dbBytes=${s.dbBytes}  edgeMs=${s.edgeMs}`);
}

console.log(`\nwrites attempted=${made} failed=${failed}`);
console.log("\ncount,passMs,dbBytes");
for (const r of rows) console.log(r.join(","));

// Fit passMs = fixed + perBundle * count over the measured range.
const pts = rows.filter((r) => r[0] > 0);
const n = pts.length;
const sx = pts.reduce((a, p) => a + p[0], 0), sy = pts.reduce((a, p) => a + p[1], 0);
const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0), sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
const intercept = (sy - slope * sx) / n;
console.log(`\nfit: passMs ~= ${intercept.toFixed(1)} + ${(slope * 1000).toFixed(2)}ms per 1000 bundles`);
for (const c of [5000, 20000, 60000]) console.log(`  projected @${c}: ${(intercept + slope * c).toFixed(0)}ms`);
