// The member's own Claude sign-in in this instance (R17–R21; N708, DEC-156, K1819, K2200): Claude Code's own login, run
// by the unmodified binary (AT-14, AT-18) through a pseudo-terminal from util-linux `script` in the pinned base (R16).
// The binary states the sign-in address, takes the code from Anthropic's page at its own prompt (AT-26) and writes,
// renews and removes the stored sign-in where it runs (AT-27). This module never reads, copies, logs or answers the
// stored sign-in, nor the code beyond typing it once at that prompt (R8); it records only which member the sign-in was
// made for (a member id). DEC-156 is Bob's decision to build, not a reading of Anthropic's terms: U-7 (a)–(d) stay open.
import { spawn as nodeSpawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile, rm, readdir, stat } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { QUIET, PATH, passed, scrub } from './env.mjs';

export const ADDRESS_WAIT_MS = 30_000;
export const CODE_WAIT_MS = 10 * 60_000;
export const OUTCOME_WAIT_MS = 60_000;
export const STATUS_WAIT_MS = 20_000;
export const MEMBER_MAX = 200;
export const CODE_MAX = 2000;
// Anthropic's sign-in hosts (R17): the address is answered only on one of these, or a subdomain of one.
export const SIGNIN_HOSTS = ['claude.ai', 'claude.com', 'anthropic.com'];
// The binary's own commands, with no option: none selects or forbids a sign-in method (R22).
export const LOGIN_ARGS = ['auth', 'login'];
export const STATUS_ARGS = ['auth', 'status', '--json'];
export const LOGOUT_ARGS = ['auth', 'logout'];

// The binary the Agent SDK itself runs: its platform package's `claude`, glibc first, as the SDK resolves it.
export function claudeBinary() {
  const require = createRequire(import.meta.url);
  for (const p of [`linux-${process.arch}`, `linux-${process.arch}-musl`, `${process.platform}-${process.arch}`]) {
    try { return require.resolve(`@anthropic-ai/claude-agent-sdk-${p}/claude`); } catch { /* the next */ }
  }
  return null;
}

export const memberOk = (m) => typeof m === 'string' && m.length > 0 && m.length <= MEMBER_MAX;
export const codeOk = (c) => typeof c === 'string' && c.length >= 1 && c.length <= CODE_MAX && !/\p{Cc}/u.test(c);

// A terminal's escapes (CSI, OSC such as a hyperlink's, and the rest) removed, so the binary's words read as text.
export const plain = (s) => String(s)
  .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
  .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
  .replace(/\x1b[@-Z\\-_]/g, '')
  .replace(/\r/g, '');

// The address the binary states, as it states it; null until it has.
export function addressIn(out) {
  const m = /visit:\s*(\S+)/.exec(plain(out));
  return m ? m[1] : null;
}

export function anthropicAddress(address) {
  let u;
  try { u = new URL(address); } catch { return false; }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return false;
  const h = u.hostname.toLowerCase();
  return SIGNIN_HOSTS.some((d) => h === d || h.endsWith(`.${d}`));
}

const reply = (status, body) => ({ status, body });
const refuse = (status, code, detail) => reply(status, detail === undefined ? { ok: false, code } : { ok: false, code, detail });

// One instance's sign-in. `root` is the instance's own writable directory for it: `claude/` the binary's config
// directory (where it stores the sign-in), `home/` its home, `member` the record (R21).
export function signinOf({ root = join(homedir(), 'signin'), binary = claudeBinary(), spawn = nodeSpawn, script = 'script',
  waits = {} } = {}) {
  const wait = { address: ADDRESS_WAIT_MS, code: CODE_WAIT_MS, outcome: OUTCOME_WAIT_MS, status: STATUS_WAIT_MS, ...waits };
  const configDir = join(root, 'claude'), home = join(root, 'home'), recordFile = join(root, 'member');
  let waiting = null;                      // {member, proc, timer, typed}

  const ready = async () => { await mkdir(configDir, { recursive: true, mode: 0o700 }); await mkdir(home, { recursive: true, mode: 0o700 }); };
  // The binary's environment, replacing the process's whole: no credential variable and nothing that picks a method.
  const env = () => ({ PATH, ...passed(), HOME: home, CLAUDE_CONFIG_DIR: configDir, TERM: 'dumb', ...QUIET });

  const recorded = async () => {
    try { const r = JSON.parse(await readFile(recordFile, 'utf8')); return memberOk(r.member) ? r.member : null; }
    catch { return null; }
  };

  const end = (w = waiting) => {
    if (!w) return;
    clearTimeout(w.timer);
    if (waiting === w) waiting = null;
    w.ended = true;
    try { process.kill(-w.proc.pid, 'SIGKILL'); } catch { try { w.proc.kill('SIGKILL'); } catch { /* gone */ } }
  };

  // Runs the binary with `args` (no terminal), resolving {code, out} or null when it does not end in time.
  const run = (args, ms) => new Promise((resolve) => {
    let out = '', done = false;
    const proc = spawn(binary, args, { env: env(), cwd: home, stdio: ['ignore', 'pipe', 'pipe'] });
    const finish = (v) => { if (!done) { done = true; clearTimeout(t); resolve(v); } };
    const t = setTimeout(() => { try { proc.kill('SIGKILL'); } catch { /* gone */ } finish(null); }, ms);
    proc.stdout.on('data', (d) => { out = (out + d).slice(-16384); });
    proc.stderr.on('data', (d) => { out = (out + d).slice(-16384); });
    proc.on('error', () => finish(null));
    proc.on('close', (code) => finish({ code, out }));
  });

  // Whether the binary reports itself signed in with a Claude account (its own report, never the stored file).
  const signedIn = async () => {
    if (!binary) return false;
    await ready();
    const r = await run(STATUS_ARGS, wait.status);
    if (!r) return false;
    const text = plain(r.out), at = text.indexOf('{');
    try { const s = JSON.parse(text.slice(at, text.lastIndexOf('}') + 1)); return s.loggedIn === true && s.authMethod === 'claude.ai'; }
    catch { return false; }
  };

  // R17
  async function start(member) {
    const held = await recorded();
    if (held !== null && held !== member) return refuse(409, 'NOT_THIS_MEMBER');
    end();
    if (!binary) return refuse(502, 'SIGNIN_UNAVAILABLE', 'the Claude Code binary is not installed in this image');
    await ready();
    // `script` gives the binary the terminal its login prompts in; the command is this module's constant alone.
    const proc = spawn(script, ['-q', '-f', '-e', '-c', [binary, ...LOGIN_ARGS].join(' '), '/dev/null'],
      { env: env(), cwd: home, stdio: ['pipe', 'pipe', 'pipe'], detached: true });
    const w = { member, proc, out: '', typed: false, ended: false, exited: null, listeners: new Set() };
    waiting = w;
    const heard = () => { for (const f of [...w.listeners]) f(); };
    proc.stdout.on('data', (d) => { w.out = (w.out + d).slice(-16384); heard(); });
    proc.stderr.on('data', (d) => { w.out = (w.out + d).slice(-16384); heard(); });
    proc.stdin.on('error', () => {});
    proc.on('error', () => { w.exited = -1; heard(); });
    proc.on('close', (code) => { w.exited = code ?? -1; if (waiting === w && !w.typed) end(w); heard(); });
    const until = (pred, ms) => new Promise((resolve) => {
      const check = () => { const v = pred(); if (v !== undefined) { clearTimeout(t); w.listeners.delete(check); resolve(v); } };
      const t = setTimeout(() => { w.listeners.delete(check); resolve(null); }, ms);
      w.listeners.add(check); check();
    });
    w.until = until;
    const address = await until(() => {
      const a = addressIn(w.out);
      if (a && /Paste code here/i.test(plain(w.out))) return a;
      if (w.exited !== null || w.ended) return false;
      return undefined;
    }, wait.address);
    if (!address) {
      const why = w.ended && w.exited === null ? 'the sign-in was ended' : w.exited !== null
        ? `the binary exited (${w.exited}) stating no address: ${plain(w.out).trim()}` : `the binary stated no address within ${wait.address / 1000} seconds`;
      end(w);
      return refuse(502, 'SIGNIN_UNAVAILABLE', scrub(why));
    }
    if (!anthropicAddress(address)) { end(w); return refuse(502, 'SIGNIN_ADDRESS_UNEXPECTED'); }
    w.timer = setTimeout(() => end(w), wait.code);
    return reply(200, { ok: true, address });
  }

  // R18
  async function code(member, given) {
    const held = await recorded();
    if (held !== null && held !== member) return refuse(409, 'NOT_THIS_MEMBER');
    const w = waiting;
    if (!w || w.member !== member || w.typed || w.exited !== null) return refuse(409, 'NO_SIGNIN_WAITING');
    if (!codeOk(given)) return refuse(400, 'BAD_CODE');
    w.typed = true;
    clearTimeout(w.timer);
    const from = w.out.length;
    // What the binary says after the code, the terminal's echo of the code taken out.
    const said = () => plain(w.out.slice(Math.min(from, w.out.length))).split(given).join('');
    w.proc.stdin.write(`${given}\n`);
    const outcome = await w.until(() => {
      const after = said();
      if (/Login successful/i.test(after)) return 'ok';
      if (/Login failed|Invalid code/i.test(after) || w.exited !== null) return 'failed';
      return undefined;
    }, wait.outcome);
    const words = said().split('\n').map((l) => l.trim())
      .filter((l) => l && !/^Paste code here/i.test(l)).join(' ');
    if (outcome === 'ok') {
      await w.until(() => (w.exited !== null ? true : undefined), 5000);
      end(w);
      await writeFile(recordFile, JSON.stringify({ member }), { mode: 0o600 });
      return reply(200, { ok: true, connected: true, member });
    }
    end(w);
    const detail = outcome === null ? `the binary reported no outcome within ${wait.outcome / 1000} seconds` : words || 'the binary reported a failure';
    return refuse(409, 'SIGNIN_REFUSED', scrub(detail, given));
  }

  // R19
  async function state(member) {
    const held = await recorded();
    const connected = held === member && await signedIn();
    return reply(200, { ok: true, connected, member });
  }

  // R20
  async function signout(member) {
    const held = await recorded();
    if (held !== null && held !== member) return refuse(409, 'NOT_THIS_MEMBER');
    if (waiting && waiting.member === member) end();
    if (binary) {
      await ready();
      const r = await run(LOGOUT_ARGS, wait.status);
      if (!r || r.code !== 0) return refuse(502, 'SIGNOUT_FAILED', scrub(r ? plain(r.out).trim() || `the binary exited ${r.code}` : 'the binary did not end'));
    }
    await rm(recordFile, { force: true });
    return reply(200, { ok: true, connected: false, member });
  }

  // R2's `signin` kind: whether this instance may run a conversation for `member` under its stored sign-in.
  async function serves(member) {
    const held = await recorded();
    if (held === null) return 'NOT_SIGNED_IN';
    if (held !== member) return 'NOT_THIS_MEMBER';
    return (await signedIn()) ? null : 'NOT_SIGNED_IN';
  }

  // The stored sign-in's paths (names only, never contents), so a conversation can remove what else it wrote (R9).
  async function paths(dir = configDir) {
    const out = [];
    const walk = async (d) => {
      let names;
      try { names = await readdir(d); } catch { return; }
      for (const n of names) {
        const p = join(d, n);
        out.push(p);
        if ((await stat(p).catch(() => null))?.isDirectory()) await walk(p);
      }
    };
    await walk(dir);
    return out;
  }
  async function keepOnly(before) {
    const keep = new Set(before);
    for (const p of (await paths()).reverse()) if (!keep.has(p)) await rm(p, { recursive: true, force: true });
  }

  return { start, code, state, signout, serves, paths, keepOnly, configDir, home, root, get waiting() { return waiting; } };
}
