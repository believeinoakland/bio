/* attestation's published fixtures (K4990, K4993, K5044): the answers of this module's real code, for the modules that
   use it (`filings` R9, `network-notices` R1, R13). Made when a test runs, by the real attestation over the test world
   (`fixture.mjs`), never stored: a user takes the answer from here rather than building its own. */
import { world, sha } from "./fixture.mjs";

/** The attestation object with no receipt-signing key bound (R6): the composition root's, as `world()` builds it. */
export function keylessAttestation() {
  return world().att;
}

/** `attestationsOf` given a text that is no digest: the real refusal `BAD_SHA` (R7). */
export function attestationsOfBadSha() {
  return keylessAttestation().attestationsOf("x");
}

/** `instanceSign` of a statement the real `instanceStatement` makes, on the keyless object: the real refusal
 *  `RECEIPT_NO_KEY` (R5), nothing recorded. Resolves to the answer. */
export function noKeyInstanceSign() {
  const att = keylessAttestation();
  return att.instanceSign(att.instanceStatement("notice/1", sha("a notice")));
}
