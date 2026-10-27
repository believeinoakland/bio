/* reading-pipeline's published fixtures: the answers its users read, made by this module's real code when a test calls them, never stored (K4990,
 * K4993, K4995, K5044). Each export is named for the answer it gives, so a user's test says which answer it means. Not product code.
 *
 *   storeFailedTransient()  the answer `read` gives for a capture whose bytes the evidence store fails to give (its `head`, `get` and `put` all
 *                           reject with STORE_FAILED): a failed reading, `failure: "transient"` (R37, R53: the ledger tries again), no units,
 *                           and the counters of a read that failed one step (R45). It is `read`'s answer, not a reshaped one: the plane's
 *                           `readAnswer` of the job ledger is `extraction`'s own shape over it, which `extraction` publishes. */
import { read } from "../../../src/reading-pipeline/index.mjs";
import { sha, doc } from "./fixture.mjs";

export async function storeFailedTransient() {
  const text = "A line of words for the reading to find.\n".repeat(30);
  const fails = async () => { throw new Error("STORE_FAILED"); };
  const document = doc({ digest: sha(text), bytes: text.length, ct: "text/plain", format: "undetermined", fromText: true });
  return read(document, { evidence: { head: fails, get: fails, put: fails }, env: {}, storeName: "bio" });
}
