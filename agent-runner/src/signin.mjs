// The member's Claude sign-in in this instance (R17–R21 as R27 amends them; N1001, K3060 D10, K3061 D10): the unmodified
// binary's own `claude setup-token` (AT-22), run through a pseudo-terminal from util-linux `script` in the pinned base
// (R16). The binary states the sign-in address, takes the code from Anthropic's page at its own prompt (AT-26) and prints
// the long-lived token it mints. This module reads that token once from the binary's output, answers it once in the
// `code` answer, and keeps nothing: no stored sign-in, no member record beyond the attempt waiting, no copy of the
// output (R8, R27). Each step answers member-readable words on a refusal and its trace fields (R31), and the line it
// logs (R29) is built from what is returned here, never from the code, the token or the address.
import { spawn as nodeSpawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { QUIET, PATH, passed, scrubSaid } from './env.mjs';
import { screen } from './screen.mjs';
import { ADDRESS_WAIT_MS, CODE_WAIT_MS, OUTCOME_WAIT_MS } from './waits.mjs';

export { ADDRESS_WAIT_MS, CODE_WAIT_MS, OUTCOME_WAIT_MS };
export const MEMBER_MAX = 200;
export const CODE_MAX = 2000;
export const TOKEN_MIN = 20;
export const TOKEN_MAX = 2000;
// The terminal the binary draws in (R27): wide enough that neither the address nor the token is wrapped.
export const COLUMNS = 4000;
export const ROWS = 200;
// Anthropic's sign-in hosts (R17): the address is answered only on one of these, or a subdomain of one.
export const SIGNIN_HOSTS = ['claude.ai', 'claude.com', 'anthropic.com'];
// The binary's own command, with no option: none selects or forbids a sign-in method (R22, AT-22).
export const SETUP_ARGS = ['setup-token'];
// The binary's words (2.1.289, measured at START, K3068), read from the screen it draws.
export const SAYS = {
  address: /Use the url below to sign in/i,
  prompt: /Paste code here if prompted/i,
  token: /Your OAuth token \(valid for ([^)]{1,40})\):/,
  tokenEnd: /Store this token securely/i,
  failed: /OAuth error:|Invalid code|Login failed/i,
};

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

// The address the binary states, as it states it, once its prompt is up; null until then.
export function addressIn(out) {
  const text = screen(out);
  const at = text.search(SAYS.address);
  if (at < 0 || !SAYS.prompt.test(text)) return null;
  const m = /https?:\/\/\S+/.exec(text.slice(at));
  return m ? m[0] : null;
}

// The token the binary prints after its code (R27), `{token, valid_for}`; `{shape}` when what follows its words is not
// one run of `[A-Za-z0-9._-]` of 20 to 2,000 characters; null while it has printed none.
export function tokenIn(out) {
  const text = screen(out);
  const m = SAYS.token.exec(text);
  if (!m) return null;
  const rest = text.slice(m.index + m[0].length).split('\n').map((l) => l.trim());
  const end = rest.findIndex((l, i) => i > 0 && (SAYS.tokenEnd.test(l) || /^Use this token/i.test(l)));
  const token = (end < 0 ? rest : rest.slice(0, end)).join('');
  if (token.length < TOKEN_MIN || token.length > TOKEN_MAX || !/^[A-Za-z0-9._-]+$/.test(token)) return { shape: true };
  return { token, valid_for: m[1].trim() };
}

export function anthropicAddress(address) {
  let u;
  try { u = new URL(address); } catch { return false; }
  if (u.protocol !== 'https:' || u.username || u.password || u.port) return false;
  const h = u.hostname.toLowerCase();
  return SIGNIN_HOSTS.some((d) => h === d || h.endsWith(`.${d}`));
}

// Each refusal's words for the member (R31; DEC-149: "your group's Civicsmith", never the machinery's names).
export const WORDS = {
  BAD_REQUEST: 'Your group\'s Civicsmith could not read this request to connect Claude. Reload the page, then try connecting Claude again.',
  BAD_MEMBER: 'Your group\'s Civicsmith could not tell which member this is for. Sign in to Civicsmith again, then connect Claude.',
  NOT_THIS_MEMBER: 'Another member of your group is connecting Claude right now. Wait a few minutes, then try again.',
  NO_SIGNIN_WAITING: 'No Claude sign-in is waiting for this code: it ends 10 minutes after it starts. Start connecting Claude again.',
  BAD_CODE: 'That does not look like the code Claude\'s page shows. Copy the whole code from the page and paste it again.',
  ATTEMPT_SUPERSEDED: 'A newer Claude sign-in was started after this one. Paste the code from the newest Claude page, or start again.',
  NO_BINARY: 'Your group\'s Civicsmith cannot start Claude\'s sign-in: Claude Code is missing from it. Tell your group\'s steward.',
  NO_ADDRESS: 'Claude\'s sign-in gave no address within 30 seconds. Wait a minute, then try connecting Claude again.',
  EXITED: 'Claude\'s sign-in stopped before it gave an address. Wait a minute, then try connecting Claude again.',
  ENDED: 'This Claude sign-in was ended before it gave an address. Start connecting Claude again.',
  NOT_RUN: 'Your group\'s Civicsmith could not run Claude\'s sign-in just now. Wait a minute, then try again.',
  SIGNIN_ADDRESS_UNEXPECTED: 'Claude\'s sign-in gave an address that is not Anthropic\'s, so your group\'s Civicsmith did not show it. Tell your group\'s steward.',
  NO_OUTCOME: 'Claude gave no answer within 60 seconds of the code. Start connecting Claude again and paste the new code.',
  TOKEN_SHAPE: 'Claude answered the code, but not with a token your group\'s Civicsmith can use. Start connecting Claude again.',
  REFUSED: (said) => `Claude did not accept the code${said ? ` (${said})` : ''}. Start connecting Claude again and paste the new code.`,
};

const reply = (status, body, log = {}) => ({ status, body, log });
const refuse = (status, code, detail, log = {}) => reply(status, { ok: false, code, detail: detail.slice(0, 300) }, { code, ...log });

// One instance's sign-in. `root` is where each attempt's own directory is made and removed (the binary's home and
// config directory while it runs); nothing of it outlasts the attempt.
export function signinOf({ root = tmpdir(), binary = claudeBinary(), spawn = nodeSpawn, script = 'script', waits = {} } = {}) {
  const wait = { address: ADDRESS_WAIT_MS, code: CODE_WAIT_MS, outcome: OUTCOME_WAIT_MS, ...waits };
  let waiting = null;                      // {attempt, member, proc, out, dir, started, typed, ended, exited}

  const end = (w = waiting) => {
    if (!w) return;
    clearTimeout(w.timer);
    if (waiting === w) waiting = null;
    w.ended = true;
    w.out = '';                            // every copy of its output dropped (R27)
    try { process.kill(-w.proc.pid, 'SIGKILL'); } catch { try { w.proc.kill('SIGKILL'); } catch { /* gone */ } }
    rm(w.dir, { recursive: true, force: true }).catch(() => {});
  };
  // The binary's last words, as R29 scrubs them (`said_head`); `codes` are the code and its halves.
  const saidOf = (w, codes = []) => {
    const lines = screen(w.out).split('\n').map((l) => l.trim()).filter((l) => l && /\w/.test(l) && !/[█▓▒░]/.test(l));
    // from its last line saying a failure, else its last line alone
    let at = -1;
    lines.forEach((l, i) => { if (SAYS.failed.test(l) || /\berror\b/i.test(l)) at = i; });
    return scrubSaid(lines.slice(at >= 0 ? at : -1).join(' '), codes);
  };
  const facts = (w) => ({ binary_present: !!binary, ...(w && w.exited !== null ? { binary_exit: w.exited } : {}) });

  // R17, as R27 amends it
  async function start(member) {
    if (waiting && waiting.member !== member) return refuse(409, 'NOT_THIS_MEMBER', WORDS.NOT_THIS_MEMBER, facts());
    end();
    if (!binary) return refuse(502, 'SIGNIN_UNAVAILABLE', WORDS.NO_BINARY, { ...facts(), arm: 'no_binary' });
    await mkdir(root, { recursive: true });
    const dir = await mkdtemp(join(root, 'signin-'));
    const home = join(dir, 'home'), config = join(dir, 'claude');
    await mkdir(home, { mode: 0o700 }); await mkdir(config, { mode: 0o700 });
    // The binary's environment, replacing the process's whole: no credential variable and nothing that picks a method.
    const env = { PATH, ...passed(), HOME: home, CLAUDE_CONFIG_DIR: config, TERM: 'dumb', COLUMNS: String(COLUMNS),
      LINES: String(ROWS), ...QUIET };
    // `script` gives the binary the terminal it draws in, sized first; the command is this module's constants alone.
    const command = `stty cols ${COLUMNS} rows ${ROWS}; exec ${[binary, ...SETUP_ARGS].join(' ')}`;
    const proc = spawn(script, ['-q', '-f', '-e', '-c', command, '/dev/null'],
      { env, cwd: home, stdio: ['pipe', 'pipe', 'pipe'], detached: true });
    const w = { attempt: randomUUID(), member, proc, dir, out: '', started: Date.now(), typed: false, ended: false,
      exited: null, listeners: new Set() };
    waiting = w;
    const heard = () => { for (const f of [...w.listeners]) f(); };
    const take = (d) => { if (!w.ended) { w.out = (w.out + d).slice(-65536); heard(); } };
    proc.stdout.on('data', take);
    proc.stderr.on('data', take);
    proc.stdin.on('error', () => {});
    proc.on('error', () => { w.exited = -1; heard(); });
    proc.on('close', (code) => { w.exited = code ?? -1; heard(); if (waiting === w && !w.typed) end(w); });
    w.until = (pred, ms) => new Promise((resolve) => {
      const check = () => { const v = pred(); if (v !== undefined) { clearTimeout(t); w.listeners.delete(check); resolve(v); } };
      const t = setTimeout(() => { w.listeners.delete(check); resolve(null); }, ms);
      w.listeners.add(check); check();
    });
    const address = await w.until(() => {
      const a = addressIn(w.out);
      if (a) return a;
      if (w.exited !== null || w.ended) return false;
      return undefined;
    }, wait.address);
    const log = { attempt: w.attempt, ms_to_address: Date.now() - w.started };
    if (!address) {
      const arm = w.exited !== null ? 'exited' : w.ended ? 'ended' : 'no_address';
      const said = saidOf(w);
      const exited = w.exited;
      end(w);
      return refuse(502, 'SIGNIN_UNAVAILABLE', { exited: WORDS.EXITED, ended: WORDS.ENDED, no_address: WORDS.NO_ADDRESS }[arm],
        { ...log, ...facts(), ...(exited !== null ? { binary_exit: exited } : {}), arm, said_head: said });
    }
    if (!anthropicAddress(address)) {
      end(w);
      return refuse(502, 'SIGNIN_ADDRESS_UNEXPECTED', WORDS.SIGNIN_ADDRESS_UNEXPECTED, { ...log, ...facts() });
    }
    w.timer = setTimeout(() => end(w), wait.code);
    let host = null;
    try { host = new URL(address).hostname; } catch { /* checked above */ }
    return reply(200, { ok: true, address, attempt: w.attempt }, { ...log, ...facts(w), address_host: host });
  }

  // R18, as R27 and R31 amend it
  async function code(member, given, attempt) {
    const w = waiting;
    if (w && w.member !== member) return refuse(409, 'NOT_THIS_MEMBER', WORDS.NOT_THIS_MEMBER, facts());
    if (!w || w.typed || w.exited !== null) return refuse(409, 'NO_SIGNIN_WAITING', WORDS.NO_SIGNIN_WAITING, facts());
    const ids = { attempt: w.attempt, waited_s: Math.round((Date.now() - w.started) / 1000) };
    if (attempt !== undefined && attempt !== w.attempt) return refuse(409, 'ATTEMPT_SUPERSEDED', WORDS.ATTEMPT_SUPERSEDED, { ...ids, ...facts(w) });
    if (!codeOk(given)) return refuse(400, 'BAD_CODE', WORDS.BAD_CODE, { ...ids, ...facts(w) });
    w.typed = true;
    clearTimeout(w.timer);
    const typedAt = Date.now();
    // A terminal UI takes its Enter as a carriage return (START, K3068): the code, exactly as given, then one CR.
    w.proc.stdin.write(`${given}\r`);
    const outcome = await w.until(() => {
      const text = screen(w.out), got = tokenIn(w.out);
      if (got && (SAYS.tokenEnd.test(text) || w.exited !== null)) return got;
      if (SAYS.failed.test(text) || w.exited !== null) return got || 'failed';
      return undefined;
    }, wait.outcome);
    const codes = [given, ...given.split('#')];
    const log = { ...ids, ms_to_outcome: Date.now() - typedAt };
    if (outcome && outcome.token) {
      const answer = { ok: true, connected: true, member, attempt: w.attempt, token: outcome.token, valid_for: outcome.valid_for };
      const f = facts(w);
      end(w);
      return reply(200, answer, { ...log, ...f });
    }
    const said = saidOf(w, codes).replace(/\s*Press Enter to retry\.?/i, '');
    const f = facts(w);
    end(w);
    if (outcome === null) return refuse(409, 'SIGNIN_REFUSED', WORDS.NO_OUTCOME, { ...log, ...f, said_head: said });
    if (outcome.shape) return refuse(409, 'SIGNIN_REFUSED', WORDS.TOKEN_SHAPE, { ...log, ...f });
    return refuse(409, 'SIGNIN_REFUSED', WORDS.REFUSED(said), { ...log, ...f, said_head: said });
  }

  // R19, as R27 amends it: whether an attempt waits for `member`. Connected is `credentials`', never this instance's.
  async function state(member) {
    const w = waiting && waiting.member === member && !waiting.typed ? waiting : null;
    return reply(200, { ok: true, connected: false, waiting: !!w, member },
      { waiting: !!w, ...(w ? { attempt: w.attempt } : {}), ...facts() });
  }

  // R20, as R27 amends it: ends a waiting attempt; there is nothing stored, so no logout runs.
  async function signout(member) {
    if (waiting && waiting.member !== member) return refuse(409, 'NOT_THIS_MEMBER', WORDS.NOT_THIS_MEMBER, facts());
    const attempt = waiting ? waiting.attempt : undefined;
    end();
    return reply(200, { ok: true, connected: false, member }, { ...(attempt ? { attempt } : {}), ...facts() });
  }

  // Seconds the attempt now waiting has waited (R31's `waiting_age_s`), or undefined when none waits.
  const waitingAge = () => (waiting ? Math.round((Date.now() - waiting.started) / 1000) : undefined);

  return { start, code, state, signout, waitingAge, root, binaryPresent: !!binary, get waiting() { return waiting; } };
}
