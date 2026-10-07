// What both images' servers share: a tiny HTTP server on the one port, a child process run with a time budget, and a
// fresh temporary directory per request, removed when the request ends (R14). Neither server opens a connection (R12):
// the classes start them with no internet, and nothing here dials out.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export const NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

export function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'content-type': 'application/json', ...headers });
  res.end(JSON.stringify(body));
}

/** Runs `cmd args`, collecting its output; past `ms` it is killed and `timedOut` is true. Never rejects. */
export function run(cmd, args, { ms = 60_000, env } = {}) {
  return new Promise((resolve) => {
    let out = '', err = '', timedOut = false;
    let child;
    try { child = spawn(cmd, args, { env: env || { PATH: process.env.PATH, HOME: process.env.HOME || '/tmp' } }); }
    catch (e) { return resolve({ code: -1, out, err: String(e.message || e), timedOut }); }
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, ms);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('error', (e) => { err += String(e.message || e); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, out, err, timedOut }); });
  });
}

/** A fresh directory for one request's work. */
export const freshDir = (prefix) => mkdtemp(join(process.env.FILE_SCANNER_TMP || tmpdir(), prefix));
export const removeDir = (dir) => rm(dir, { recursive: true, force: true }).catch(() => {});

/** Serves `routes(req, res, url)` on `port`; an unknown route or a thrown error answers as R9 does. */
export function serve(port, routes, host = '0.0.0.0') {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://container');
    try {
      const handled = await routes(req, res, url);
      if (handled === false) json(res, 404, { ok: false, code: 'UNKNOWN' });
    } catch (e) {
      if (!res.headersSent) json(res, 500, { ok: false, code: 'CONTAINER_FAILED', message: String(e.message || e).slice(0, 300) });
      else res.destroy();
    }
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}
