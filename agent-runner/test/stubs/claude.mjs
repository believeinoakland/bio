// A stubbed Claude Code binary for the member's sign-in (R17–R22): `auth login`, `auth status --json` and
// `auth logout` as the pinned binary (2.1.289) words them, its mode baked in by the wrapper `stubClaude` writes. It
// logs each run's arguments and environment names (never values) to the log file the wrapper names, and stores a
// sentinel sign-in in its config directory's `.credentials.json`, as the real binary does (AT-27).
import { writeFileSync, appendFileSync, rmSync, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { STORED, GOOD_CODE, ADDRESS } from './claude-values.mjs';

const [mode, log, ...args] = process.argv.slice(2);
const dir = process.env.CLAUDE_CONFIG_DIR;
const creds = join(dir, '.credentials.json');
appendFileSync(log, JSON.stringify({ mode, args, env: Object.keys(process.env).sort(), tty: process.stdin.isTTY === true }) + '\n');
const out = (s) => process.stdout.write(s);
const cmd = args.join(' ');

if (cmd === 'auth status --json') {
  out(JSON.stringify(existsSync(creds) ? { loggedIn: true, authMethod: 'claude.ai', apiProvider: 'firstParty', email: 'm@example.test' }
    : { loggedIn: false, authMethod: 'none', apiProvider: 'firstParty' }, null, 2) + '\n');
  process.exit(0);
}
if (cmd === 'auth logout') {
  if (mode === 'logout-fails') { process.stderr.write('Failed to log out.\n'); process.exit(1); }
  rmSync(creds, { force: true });
  out('Successfully logged out from your Anthropic account.\n');
  process.exit(0);
}
if (cmd !== 'auth login') { process.stderr.write(`stub: unexpected ${cmd}\n`); process.exit(2); }

if (mode === 'exits') { process.stderr.write('Error: no terminal available\n'); process.exit(3); }
if (mode === 'silent') { setInterval(() => {}, 1000); }
else {
  const address = mode === 'foreign' ? 'https://claude.example.test/oauth/authorize?x=1' : mode === 'plain-http' ? 'http://claude.ai/oauth/authorize' : ADDRESS;
  out('Opening browser to sign in…\n');
  out(`If the browser didn't open, visit: \x1b]8;;${address}\x07${address}\x1b]8;;\x07\n`);
  out('Paste code here if prompted > ');
  const rl = createInterface({ input: process.stdin });
  rl.on('line', (line) => {
    const [a, b] = line.trim().split('#');
    if (!a || !b) { process.stderr.write('Invalid code. Please make sure the full code was copied.\n'); return; }
    if (mode === 'hangs') return;
    if (line.trim() !== GOOD_CODE || mode === 'refuses') {
      // the terminal has echoed the code already; the binary's words follow
      process.stderr.write('Login failed: Request failed with status code 400 (invalid_grant)\n');
      process.exit(1);
    }
    writeFileSync(creds, JSON.stringify({ claudeAiOauth: { accessToken: STORED, refreshToken: STORED } }), { mode: 0o600 });
    writeFileSync(join(dir, '.claude.json'), JSON.stringify({ oauthAccount: { accountUuid: 'acct-1' } }));
    out('Login successful.\n');
    process.exit(0);
  });
}
