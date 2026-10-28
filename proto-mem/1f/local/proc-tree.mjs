/* proto-mem/1f (THROWAWAY): resident memory and CPU of a process AND its descendants, read from outside (/proc), sampled every `ms`.
   "tree RSS" is the sum of VmRSS over the process and every descendant (shared pages counted once per process: an upper bound for one-binary children such as many 7z).
   Nothing here is product code. LOCAL measurement: a shared 4-core Linux box, not a Cloudflare container. */
import { readFileSync, readdirSync } from "node:fs";
const TICK = 100;   /* clock ticks per second on Linux (getconf CLK_TCK) */
function table() {
  const t = new Map();
  for (const d of readdirSync("/proc")) {
    if (!/^\d+$/.test(d)) continue;
    try {
      const st = readFileSync(`/proc/${d}/stat`, "utf8"); const r = st.slice(st.lastIndexOf(")") + 2).split(" ");
      t.set(Number(d), { ppid: Number(r[1]), utime: Number(r[11]), stime: Number(r[12]), cutime: Number(r[13]), cstime: Number(r[14]), comm: st.slice(st.indexOf("(") + 1, st.lastIndexOf(")")) });
    } catch { /* gone */ }
  }
  return t;
}
const rssMb = (pid) => { try { const m = readFileSync(`/proc/${pid}/status`, "utf8").match(/^VmRSS:\s+(\d+) kB/m); return m ? Number(m[1]) / 1024 : 0; } catch { return 0; } };
export function treeOf(root, t = table()) {
  const kids = new Map(); for (const [p, v] of t) { if (!kids.has(v.ppid)) kids.set(v.ppid, []); kids.get(v.ppid).push(p); }
  const out = [root]; for (let i = 0; i < out.length; i++) for (const k of kids.get(out[i]) || []) out.push(k);
  return out;
}
export class TreeSampler {
  constructor(root, ms = 25) { this.root = root; this.ms = ms; this.peakSum = 0; this.peakOne = 0; this.peakOneComm = ""; this.maxProcs = 0; this.n = 0; this.cpuSeen = 0; }
  start() { this.tick(); this.h = setInterval(() => this.tick(), this.ms); return this; }
  tick() {
    const t = table(); const pids = treeOf(this.root, t); let sum = 0; this.n++;
    for (const p of pids) { const r = rssMb(p); sum += r; if (r > this.peakOne) { this.peakOne = r; this.peakOneComm = t.get(p)?.comm || ""; } }
    this.peakSum = Math.max(this.peakSum, sum); this.maxProcs = Math.max(this.maxProcs, pids.length);
  }
  /* cpu seconds consumed by the root and its (waited-for) children: utime+stime+cutime+cstime of the root */
  cpu() { const v = table().get(this.root); return v ? (v.utime + v.stime + v.cutime + v.cstime) / TICK : null; }
  stop() { clearInterval(this.h); this.tick(); return { peak_tree_rss_mb: Math.round(this.peakSum), peak_single_process_rss_mb: Math.round(this.peakOne), peak_single_process: this.peakOneComm, max_processes: this.maxProcs, samples: this.n, sample_ms: this.ms }; }
}
