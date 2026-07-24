/* Token hygiene, shared by the control plane and the livefire battery.
 *
 * Every token value that has ever appeared in this repository is denylisted.
 * A deploy-button flow pre-fills secret prompts from files it finds in the
 * repo, and a published postmortem describes every copy of an application
 * shipping with the same leaked credential that way, silently, showing green.
 * So any value on this list is treated as NOT SET: it can never authenticate
 * and can never arm the bootstrap claim.
 *
 * Values are listed as SHA-256 so the denylist does not itself republish
 * them. If a token value ever lands in the repository again, its hash goes
 * here in the same change that removes it.
 */

export const PUBLISHED_TOKEN_HASHES = new Set([
  // dist/SECRETS.txt of the 0.2.0 test deployment
  // ADMIN_TOKEN
  "34451e5e855bf8d45e93d89fca560e6bd392cf1d0cc6832e3121614d1c68d9db",
  // MEMBER_TOKEN
  "7ecc5d014e25ce4c2e8457424afa0420288742c69182db1be5f4caccd63d4c91",
  // PROBE_TOKEN
  "5910ebbfe7816d9d5e2451012f9db8ac92aaa3f65a8f50da3f7255ab8bdb26ad",
]);

export const sha256hex = async (v) => {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};

/* A token binding is LIVE only if it is a non-empty string that has never
   been published in the repository. Empty and published both mean "not set",
   so an instance that boots with a leaked or blank credential refuses every
   request on that credential rather than running open. */
export async function liveToken(v) {
  if (typeof v !== "string" || v.length === 0) return false;
  return !PUBLISHED_TOKEN_HASHES.has(await sha256hex(v));
}
