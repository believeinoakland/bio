/* provenance's two ops at the Worker (requirements: `build/requirements/provenance.md`, R8, R9, R31–R33), moved out of
 * `legacy-index`' `src/index.mjs` at T18 (the legacy-index map's §4.4 plain move, K649 (7); PROCESS-MECHANICS §12.2).
 * The control plane routes to them and hands in its envelope helpers (`json`, `doAnswer`, `storeSilent`,
 * `storeRefusal`, `storageAbsent`), the evidence store's key for a digest (`captureKey`) and its stamps; each answers
 * the Response the arm answered before the move, byte for byte. */

import { attest, attestStatus, registerAuditReport } from "./index.mjs";

/** op=registeraudit (R8, R9): the store's classification of every register row, finished here by probing each
 *  unresolved row in the working bucket (D-533's parts included). */
export async function registerAuditOp(env, store, { json, doAnswer, storeSilent, storeRefusal, captureKey, storeName, cls }) {
  /* REC-52: this one CRASHED rather than lied — `r.unresolved` on an absent
     result throws a TypeError and the caller gets a platform 500 — so it is
     the less dangerous half of the class. It is converted anyway, because
     the answer below is a SOUNDNESS VERDICT about the register ("sound:
     true") and an audit that reports on a register it could not read is the
     worst possible place to be one line away from a false clean bill. */
  const aOut = await doAnswer(store.fetch("http://do/registeraudit"));
  if (aOut.refused) return storeRefusal(aOut);
  if (!aOut.answered) return storeSilent("registeraudit", aOut.correlation);
  if (!aOut.result) return storeSilent("registeraudit");
  /* R8, R9: provenance's report, each unresolved row probed in the working bucket (D-533's parts included). */
  return json({ ok: true, result: await registerAuditReport(aOut.result, typeof env.CAPTURES?.head === "function"
    ? { head: (sha) => env.CAPTURES.head(captureKey(storeName, sha)), get: (sha) => env.CAPTURES.get(captureKey(storeName, sha)) }
    : null), store: storeName, tokenClass: cls }, 200);
}

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
/** op=attest (R31–R33): provenance's `attest` over the working bucket by digest, the network, and the store's register
 *  and receipts (D-476's `registerholds`, which answers whether a receipt or the register names the hash). */
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
