import { createRequire } from "node:module";
export const MF = await import("/home/user/bio/bio-plane/node_modules/miniflare/dist/src/index.js");
export const { Miniflare } = MF;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const SP = "/tmp/claude-0/-home-user-bio/ace00fc7-30a5-5161-8a63-7cfeb7cb24c6/scratchpad/platform/spikes";
export const rss = () => Math.round(process.memoryUsage().rss / 1048576);
import fs from "node:fs";
// total RSS (MB) of workerd child processes
export function workerdRss() {
  let tot = 0; const out = [];
  for (const d of fs.readdirSync("/proc")) { if (!/^\d+$/.test(d)) continue;
    try { const c = fs.readFileSync(`/proc/${d}/comm`, "utf8").trim(); if (c !== "workerd") continue;
      const pp = Number(fs.readFileSync(`/proc/${d}/stat`, "utf8").split(") ")[1].split(" ")[1]);
      if (pp !== process.pid) continue;
      tot += Number(fs.readFileSync(`/proc/${d}/status`, "utf8").match(/VmRSS:\s+(\d+)/)[1]) / 1024; } catch {} }
  return Math.round(tot);
}
