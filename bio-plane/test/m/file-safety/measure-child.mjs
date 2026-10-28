/* A child process for r57-standard-measure.test.mjs: holds one file as a capture in file-safety's own world and runs one job over it
   (`grade`: threatOf, `state`: originalState, `view`: the safe view), answering what the job answered and the most memory it held above the
   idle (heap and backing stores, sampled every millisecond). Not a test.
     node --expose-gc measure-child.mjs <file> <recorded name> <grade|state|view> */
import { readFileSync } from "node:fs";
import { filedWorld } from "./fixture.mjs";
import { fileSafetyOps } from "../../../src/file-safety/index.mjs";

const [file, name, job] = process.argv.slice(2);
const bytes = new Uint8Array(readFileSync(file));
const size = bytes.length;
const w = filedWorld();
const sha = await w.capture(bytes, { name });
gc(); gc();
const base = process.memoryUsage();
let peak = { heap: 0, external: 0, rss: 0, held: 0 };
const sample = () => {
  const m = process.memoryUsage();
  peak = { heap: Math.max(peak.heap, m.heapUsed), external: Math.max(peak.external, m.external), rss: Math.max(peak.rss, m.rss), held: Math.max(peak.held, m.heapUsed + m.external) };
};
const timer = setInterval(sample, 1);
let out;
if (job === "grade") { const g = await w.fs.threatOf({ captureSha: sha, viewer: "member:m1" }); out = { format: g.format, threat: g.threat, reasons: g.reasons.map((r) => r.code) }; }
else if (job === "state") { const r = await w.fs.originalState({ captureSha: sha, viewer: "member:m1" }); out = { may_open: r.may_open, path: r.path, why: r.why }; }
else { const r = await fileSafetyOps(w.fs, new URL(`http://x/safeview?capture=${sha}&viewer=member:m1`), {}, w.env).safeview(); out = r instanceof Response ? { response: r.status } : { ok: r.ok, kind: r.kind, code: r.code, reason: r.renderer_reason }; }
clearInterval(timer); sample();
const MiB = (n) => Math.round((n / 1048576) * 10) / 10;
process.stdout.write(JSON.stringify({ size, out, idle_MiB: MiB(base.heapUsed + base.external),
  peak_above_idle_MiB: { heap: MiB(peak.heap - base.heapUsed), external: MiB(peak.external - base.external), held: MiB(peak.held - base.heapUsed - base.external), rss: MiB(peak.rss - base.rss) } }));
