// What every process this module starts shares: the environment that replaces the process's own whole (R2), with
// Claude Code's own traffic other than the model's API and its sign-in switched off (R10), and the scrubs every outward
// string passes through (R8, R29).
export const DETAIL_MAX = 300;
export const SAID_MAX = 200;
export const QUIET = {
  DISABLE_TELEMETRY: '1', DISABLE_ERROR_REPORTING: '1', DISABLE_AUTOUPDATER: '1',
  CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1',
};
export const PATH = '/usr/local/bin:/usr/bin:/bin';
// The one variable of the process environment a child inherits: the CA through which the container's HTTPS egress is
// applied (src/worker.mjs, R10). It names a file, never a secret.
const PASSED = ['NODE_EXTRA_CA_CERTS'];
export const passed = () => Object.fromEntries(PASSED.filter((k) => process.env[k]).map((k) => [k, process.env[k]]));

// Never lets a secret out: every outward string passes through here (R8).
export function scrub(text, secret, max = DETAIL_MAX) {
  let s = String(text ?? '');
  if (secret) s = s.split(secret).join('[redacted]');
  return s.slice(0, max);
}

// R29's scrub of anything the binary or the library said: every copy of each secret given (a code and its halves, a
// token), every URL's query and fragment, and anything token-shaped (`sk-ant-…`, a JWT, any run of 32 or more
// `[A-Za-z0-9._-]`) removed, then cut to `max`.
export function scrubSaid(text, secrets = [], max = SAID_MAX) {
  let s = String(text ?? '');
  for (const x of secrets) if (typeof x === 'string' && x.length >= 4) s = s.split(x).join('[redacted]');
  s = s.replace(/(\b[a-z][a-z0-9+.-]*:\/\/[^\s?#]*)[?#]\S*/gi, '$1')
    .replace(/sk-ant-\S*/g, '[redacted]')
    .replace(/eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g, '[redacted]')
    .replace(/[A-Za-z0-9._-]{32,}/g, '[redacted]');
  return s.slice(0, max);
}
