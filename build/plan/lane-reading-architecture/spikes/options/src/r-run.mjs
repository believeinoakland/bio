import { spawn } from "node:child_process"; import fs from "node:fs";
const B = "/tmp/claude-0/-home-user-bio/ace00fc7-30a5-5161-8a63-7cfeb7cb24c6/scratchpad/options/spikes";
const BIN = "/home/user/bio/bio-plane/node_modules/.bin/workerd";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const want = fs.readFileSync(B + "/data/r/big.sha", "utf8").trim();
fs.copyFileSync(B + "/src/r-worker.mjs", B + "/data/r/r-worker.mjs");
for (const [old, step] of [[64, 8388608], [32, 8388608], [64, 104857600]]) {
  const port = 18000 + Math.floor(Math.random() * 1000);
  fs.writeFileSync(B + "/data/r/config.capnp", `using Workerd = import "/workerd/workerd.capnp";
const config :Workerd.Config = (
  services = [(name = "main", worker = .w), (name = "files", disk = (path = "${B}/data/r", writable = false, allowDotfiles = false))],
  sockets = [(name = "http", address = "127.0.0.1:${port}", http = (), service = "main")],
  v8Flags = ["--max-old-space-size=${old}"]);
const w :Workerd.Worker = (modules = [(name = "worker", esModule = embed "r-worker.mjs")],
  compatibilityDate = "2026-07-01", bindings = [(name = "FILES", service = "files")]);
`);
  const p = spawn(BIN, ["serve", "--experimental", "config.capnp"], { cwd: B + "/data/r", stdio: ["ignore", "ignore", "pipe"] });
  let err = ""; p.stderr.on("data", d => err += d); let dead = false; p.on("exit", () => dead = true);
  await sleep(1500); let peak = 0;
  const iv = setInterval(() => { try { const m = fs.readFileSync(`/proc/${p.pid}/status`, "utf8").match(/VmHWM:\s+(\d+)/); peak = Math.max(peak, +m[1]); } catch {} }, 30);
  let res; try { const r = await fetch(`http://127.0.0.1:${port}/?step=${step}`); res = await r.json(); } catch (e) { res = { fetchError: String(e.cause?.code || e) }; }
  clearInterval(iv); const hwm = peak;
  console.log(JSON.stringify({ oldSpaceMB: old, stepBytes: step, res, shaMatches: res.sha256 === want, peakRssMB: Math.round(hwm / 1024), workerdDied: dead, errTail: err.split("\n").filter(l => /fatal|heap|error/i.test(l)).slice(0, 2) }));
  p.kill("SIGKILL"); await sleep(300);
}
