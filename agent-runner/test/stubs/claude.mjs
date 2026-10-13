// A stubbed Claude Code binary for the member's sign-in (R17–R22, R27): `setup-token` as the pinned binary (2.1.289)
// draws it in a terminal (START's measurement, K3068): words placed by cursor moves, the address as a hyperlink, raw
// input submitted by a carriage return only, and on success the token after "Your OAuth token (valid for 1 year):". Its
// mode is baked in by the wrapper `stubClaude` writes. It logs each run's arguments and environment names (never values)
// to the log file the wrapper names, and stores nothing.
import { appendFileSync } from 'node:fs';
import { TOKEN, GOOD_CODE, ADDRESS } from './claude-values.mjs';

const [mode, log, ...args] = process.argv.slice(2);
appendFileSync(log, JSON.stringify({ mode, args, env: Object.keys(process.env).sort(), tty: process.stdin.isTTY === true,
  columns: process.stdout.columns ?? null }) + '\n');
const out = (s) => process.stdout.write(s);
// One line of words, each placed at its column as the binary's renderer does (ESC[nG), then CR LF.
const line = (text, indent = 1) => {
  let col = indent + 1;
  out(text.split(' ').map((w, i) => { const at = `\x1b[${col}G${w}`; col += w.length + 1; return i === 0 && indent === 0 ? w : at; }).join('') + '\r\n');
};
const cmd = args.join(' ');
if (cmd !== 'setup-token') { process.stderr.write(`stub: unexpected ${cmd}\n`); process.exit(2); }
if (mode === 'exits') { process.stderr.write('Error: Raw mode is not supported on the current process.stdin\n'); process.exit(3); }
if (mode === 'silent') setInterval(() => {}, 1000);
else {
  const address = mode === 'foreign' ? 'https://claude.example.test/oauth/authorize?x=1' : mode === 'plain-http' ? 'http://claude.ai/oauth/authorize' : ADDRESS;
  out('\x1b[?25l\x1b[?2004h');
  line('Welcome to Claude Code v2.1.289', 0);
  out('\r\n');
  line('This will guide you through long-lived (1-year) auth token setup for your Claude account. Claude subscription required.');
  out('\r\n');
  line('Browser didn\'t open? Use the url below to sign in (c to copy)');
  out('\r\n');
  out(`\x1b]8;id=x1;${address}\x07${address}\x1b]8;;\x07\r\n\r\n`);
  line('Paste code here if prompted >');
  out('\x1b[>0q\x1b[?u\x1b[c');
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  let typed = '';
  process.stdin.on('data', (d) => {
    for (const ch of d.toString('utf8')) {
      if (ch !== '\r') { typed += ch; out(mode === 'echo' ? ch : '*'); continue; }
      const code = typed; typed = '';
      // the screen is redrawn from four lines up, as the binary's renderer does
      out('\x1b[2K\x1b[1A\x1b[2K\x1b[1A\x1b[2K\x1b[1A\x1b[2K\x1b[G\r');
      if (mode === 'hangs') return;
      const [a, b] = code.split('#');
      if (!a || !b) { line('OAuth error: Invalid code. Please make sure the full code was copied'); line('Press Enter to retry.'); return; }
      if (code !== GOOD_CODE || mode === 'refuses') {
        line(`OAuth error: Request failed with status code 400 for ${code}`); line('Press Enter to retry.'); return;
      }
      const token = mode === 'long-token' ? `sk-ant-oat01-${'x'.repeat(2000)}` : mode === 'bad-token' ? 'not a token!' : TOKEN;
      line('✓ Long-lived authentication token created successfully!');
      out('\r\n');
      line('Your OAuth token (valid for 1 year):');
      // wrapped, as a narrower terminal would wrap it, and coloured
      if (mode === 'wrapped') for (let i = 0; i < token.length; i += 24) out(`\x1b[2G\x1b[33m${token.slice(i, i + 24)}\x1b[39m\r\n`);
      else out(`\x1b[2G\x1b[33m${token}\x1b[39m\r\n`);
      out('\r\n');
      line('Store this token securely. You won\'t be able to see it again.');
      out('\r\n');
      line('Use this token by setting: export CLAUDE_CODE_OAUTH_TOKEN=<token>');
      setTimeout(() => process.exit(0), 20);
    }
  });
}
