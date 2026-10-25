/* Run with `--expose-gc` and a capped old space: declares a CSV table of about 20 MiB (calculations R1's bytes bound is above it) held in the evidence
   store, then reads one page of it. Prints one JSON line: the rows, the peak heap and array-buffer bytes seen across the act (sampled at every
   await the module yields at and at the end), and the page read. A run that does not fit the capped heap dies and prints nothing. Runs only with
   CALC_BIG_CHILD=1. */
import { seeded, V } from "../fixture.mjs";

const FIELDS = [{ name: "id", type: "string" }, { name: "dept", type: "string" }, { name: "note", type: "string" }, { name: "amount", type: "number" }];
export function csv(mib) {
  const line = (i) => `r${i},d${i % 20},${"note ".repeat(14)}${i % 97},${i % 1000}`;
  const lines = [FIELDS.map((f) => f.name).join(",")];
  let size = 0;
  for (let i = 0; size < mib * 1048576; i++) { const l = line(i); lines.push(l); size += l.length + 1; }
  return `${lines.join("\n")}\n`;
}
async function main() {
  const MiB = 1048576;
  const mib = Number(process.env.CALC_BIG_MIB || 20);
  const w = seeded();
  const source = w.csv(csv(mib));
  const bytes = w.ev.m.get(w.content.contentRow(source).capture_sha).byteLength;
  let peak = 0;
  const sample = () => { const m = process.memoryUsage(); peak = Math.max(peak, m.heapUsed + m.arrayBuffers); };
  const timer = setInterval(sample, 5);
  const t = await w.c.declareTable({ source, schema: { fields: FIELDS }, header: FIELDS.map((f) => f.name), by: V("bob") });
  sample();
  clearInterval(timer);
  const page = t.ok ? await w.c.readTable({ sha: t.sha, viewer: V("bob"), limit: 1 }) : null;
  process.stdout.write(`${JSON.stringify({ ok: t.ok, reason: t.reason ?? null, rows: t.rows ?? null, source_mib: bytes / MiB, peak_mb: peak / MiB, page: page && page.page ? page.page.rows : null })}\n`);
}
if (process.env.CALC_BIG_CHILD === "1") await main();
