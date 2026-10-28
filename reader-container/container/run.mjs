/* One program run with a time limit: { status, stdout, stderr, timedOut }. The child gets no input and is killed when
 * the limit passes. Used by the container's conversion, decoding and listing (R1, R3, R5). */
import { spawn } from 'node:child_process';

export function run(cmd, args, { timeMs, cwd, input = null, maxOut = Infinity } = {}) {
  return new Promise((resolve) => {
    let child;
    try { child = spawn(cmd, args, { cwd, stdio: [input ? 'pipe' : 'ignore', 'pipe', 'pipe'] }); }
    catch (e) { resolve({ status: -1, stdout: Buffer.alloc(0), stderr: Buffer.from(String(e.message)), timedOut: false }); return; }
    const out = [], err = [];
    let outLen = 0, over = false, timedOut = false;
    const timer = timeMs ? setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeMs) : null;
    child.stdout.on('data', (c) => { outLen += c.length; if (outLen > maxOut) { over = true; child.kill('SIGKILL'); } else out.push(c); });
    child.stderr.on('data', (c) => { if (err.length < 64) err.push(c); });
    child.on('error', (e) => { err.push(Buffer.from(String(e.message))); });
    child.on('close', (status) => {
      if (timer) clearTimeout(timer);
      resolve({ status, stdout: Buffer.concat(out), stderr: Buffer.concat(err), timedOut, over });
    });
    if (input) { child.stdin.on('error', () => {}); child.stdin.end(input); }
  });
}

/* whether a program can be started */
export async function present(cmd, args = ['--version']) {
  const r = await run(cmd, args, { timeMs: 30000 });
  return r.status === 0 || (r.status !== -1 && r.stdout.length + r.stderr.length > 0 && !/ENOENT/.test(r.stderr.toString()));
}
