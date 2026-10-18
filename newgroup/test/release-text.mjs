/* The built-in release for tests, as a test reads it. `src/release.mjs` carries the signed plane as a binary string (one
   character per byte, R33); a test that compares what was uploaded, hashed or read back with the release reads its bytes and
   its text here, from that one string. */
import { RELEASE_BINARY } from "../src/release.mjs";

export const RELEASE_BYTES = (() => {
  const b = new Uint8Array(RELEASE_BINARY.length);
  for (let i = 0; i < b.length; i++) b[i] = RELEASE_BINARY.charCodeAt(i);
  return b;
})();
export const RELEASE_SOURCE = new TextDecoder().decode(RELEASE_BYTES);
