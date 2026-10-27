// helper: boot raw workerd with a worker source, optional v8 flags
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
export const BIN = "/home/user/bio/bio-plane/node_modules/.bin/";
export async function boot({ dir, src, flags = [], extra = "", bindings = "", services = "", port, compat = '"nodejs_compat"', durable = "" }) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "worker.mjs"), src);
  const fl = flags.length ? `, v8Flags = [${flags.map((f) => JSON.stringify(f)).join(",")}]` : "";
  writeFileSync(join(dir, "config.capnp"), `using Workerd = import "/workerd/workerd.capnp";
const config :Workerd.Config = (
  services = [(name = "main", worker = .w)${services}],
  sockets = [(name = "http", address = "127.0.0.1:${port}", http = (), service = "main")]${fl});
const w :Workerd.Worker = (modules = [(name = "worker", esModule = embed "worker.mjs")],
  compatibilityDate = "2026-07-01", compatibilityFlags = [${compat}]${bindings}${extra}${durable});
`);
  const p = spawn(BIN + "workerd", ["serve", join(dir, "config.capnp")], { stdio: ["ignore", "pipe", "pipe"] });
  let log = ""; p.stdout.on("data", (d) => (log += d)); p.stderr.on("data", (d) => (log += d));
  const st = { p, exited: null, get log() { return log; } };
  p.on("exit", (c, s) => (st.exited = { code: c, signal: s }));
  for (let i = 0; i < 100; i++) { try { await fetch(`http://127.0.0.1:${port}/idle`); return st; } catch { if (st.exited) break; await new Promise((r) => setTimeout(r, 100)); } }
  return st;
}
export function rssMB(pid) { try { return Number(require_fs().readFileSync(`/proc/${pid}/status`, "utf8").match(/VmRSS:\s+(\d+)/)[1]) / 1024; } catch { return null; } }
import fs from "node:fs"; function require_fs() { return fs; }
