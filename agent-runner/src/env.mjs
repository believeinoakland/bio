// What every process this module starts shares: the environment that replaces the process's own whole (R2), with
// Claude Code's own traffic other than the model's API and its sign-in switched off (R10), and the scrub every outward
// string passes through (R8).
export const DETAIL_MAX = 300;
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
