/* proto-mem/1f (THROWAWAY): starts the vendored reader-container server (serve.mjs) on a free loopback port and waits until it answers. */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const freePort = () => new Promise((res) => { const s = createServer().listen(0, "127.0.0.1", () => { const p = s.address().port; s.close(() => res(p)); }); });
export async function startServer() {
  const port = await freePort(); const t0 = performance.now();
  const child = spawn(process.execPath, [join(here, "serve.mjs")], { env: { ...process.env, PORT: String(port) }, stdio: ["ignore", "inherit", "inherit"] });
  let up = false; while (!up) { try { const r = await fetch(`http://127.0.0.1:${port}/nothing`); up = r.status === 404; } catch { await new Promise((r) => setTimeout(r, 10)); } if (performance.now() - t0 > 20000) throw new Error("server did not start"); }
  return { port, child, listen_ms: performance.now() - t0, stop: async () => { child.kill("SIGKILL"); await new Promise((r) => child.once("exit", r)); } };
}
