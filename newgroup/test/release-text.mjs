/* The built-in release for tests, as a test reads it. `src/release.mjs` carries the signed plane packed (the base64 of its gzip, R33);
   a test that compares what was uploaded, hashed or read back with the release reads its bytes and its text here, from that one
   literal. */
import { gunzipSync } from "node:zlib";
import { RELEASE_PACKED } from "../src/release.mjs";

export const RELEASE_BYTES = new Uint8Array(gunzipSync(Buffer.from(RELEASE_PACKED, "base64")));
export const RELEASE_SOURCE = new TextDecoder().decode(RELEASE_BYTES);
