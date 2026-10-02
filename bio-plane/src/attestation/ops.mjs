/* attestation's op (requirements: `build/requirements/attestation.md`, R1–R3). The `op=attest` Worker arm, moved from
 * `provenance/ops.mjs` with N512 (K1193; T25), where it had moved out of `legacy-index`' `src/index.mjs` at T18: the
 * control plane routes to it and hands in its envelope helpers (`json`, `doAnswer`, `storageAbsent`), the evidence
 * store's key for a digest (`captureKey`) and its stamps; it answers the Response the arm answered before the move,
 * byte for byte. The plane composes it (`plane/door.mjs`, since its T25 L11 job). */

import { attest, attestStatus } from "./index.mjs";

/* Co-attestation over a capture hash.
 *
 * The doctrine's asymmetry: a self-recorded hash proves integrity since
 * capture and nothing about origin, because it is the group attesting to
 * itself. A timestamp token is issued by somebody the group does not
 * control, so it proves the capture EXISTED at the claimed instant, which
 * is the part an attacker holding a write token cannot forge.
 *
 * Every attempt is recorded, successes and failures alike, in the shape
 * C-18.1 requires. The doctrine is explicit that a failed attempt is
 * recorded with its reason and never omitted: a provenance register showing
 * no attempt and one showing an attempt that failed are different claims,
 * and collapsing them would let an absence read as a success.
 */
/** op=attest (R1–R3): `attest` over the working bucket by digest, the network, and the store's register and receipts
 *  (D-476's `registerholds`, provenance's op, which answers whether a receipt or the register names the hash). */
export async function attestOp(req, env, store, { json, doAnswer, storageAbsent, captureKey, storeName, cls }) {
  if (req.method !== "POST") return json({ ok: false, error: "attest is a POST" }, 405);
  if (typeof env.CAPTURES?.put !== "function")
    return storageAbsent("attest", "this instance has no evidence storage configured");
  const body = await req.json().catch(() => null);
  const attested = await attest(body || {}, {
    head: (sha) => env.CAPTURES.head(captureKey(storeName, sha)),
    put: (sha, bytes) => env.CAPTURES.put(captureKey(storeName, sha), bytes, { sha256: sha }),
    fetch: (...a) => fetch(...a),
    holds: async (sha) => {
      const hOut = await doAnswer(store.fetch(`http://x/registerholds?sha256=${encodeURIComponent(sha)}`));
      return hOut.answered ? hOut.result : null;
    },
  });
  return json({ ...attested, store: storeName, tokenClass: cls }, attestStatus(attested));
}
