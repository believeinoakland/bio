/* TEMPORARY (N234, T12 layer 11): a stand-in for instance-setup's two exports while that module is extracted beside the
 * installer. It holds exactly what instance-setup's extraction map moves: `GROUP_SLUG_RE` (legacy-store's static) and
 * `FLEET_BINDINGS` (legacy-index's `[member, binding]` pairs). When BOB merges instance-setup, the installer and its
 * tests import both from `bio-plane/src/setup.mjs` and this file is deleted. Nothing else may import it.
 */
export const GROUP_SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
export const FLEET_BINDINGS = [["agent-worker", "AGENT_WORKER"], ["pdf-worker", "PDF_WORKER"], ["ocr-worker", "OCR_WORKER"]];
