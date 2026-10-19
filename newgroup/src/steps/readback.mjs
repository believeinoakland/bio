/* R14: the plane's script as the account now holds it, read back and compared with the release's own bytes. */
import { word } from "../../../bio-plane/src/setup-words/index.mjs";
import { CF_API } from "./api.mjs";
import { hex, multipartPart } from "./bytes.mjs";

/* R33 (Distribution §5, "byte-verified on read-back"; K3441): the plane's script as the account now holds it, read back and
   hashed against the release's own bytes, never believed from the upload's answer. The account answers the script
   either as the module itself or as a multipart body whose `index.mjs` part is the module (as `deploy.mjs` reads it).
   `null` when nothing readable came back: an unread script is not a matching one.

   THE HASH IS OVER THE BYTES AS DOWNLOADED. The body is never turned into a string and back: that alters bytes (WHATWG's
   "latin1" is windows-1252, which maps 0x80-0x9F to other code points, so no such hash ever matched a module holding
   them) and costs several copies of a 21 MB module, past a Worker's 128 MB. The part is found by byte offsets in the
   downloaded bytes and hashed as a view of them: the one copy held is the download itself. */
async function scriptHash(token, acct, slug) {
  let r;
  try {
    r = await fetch(`${CF_API}/accounts/${acct}/workers/scripts/${slug}`,
      { headers: { authorization: token.bearer, accept: "application/javascript+module" } });
  } catch { return null; }
  if (!r.ok) return null;
  const ct = r.headers.get("content-type") || "";
  let bytes = new Uint8Array(await r.arrayBuffer());
  if (/multipart/i.test(ct)) {
    const m = /boundary="?([^";]+)"?/i.exec(ct);
    if (!m) return null;
    bytes = multipartPart(bytes, m[1]);
    if (!bytes) return null;
  }
  return hex(await crypto.subtle.digest("SHA-256", bytes));
}
/* The hash of the bytes a release uploads: a repository release carries the one it was verified against; the built-in
   release's is taken from its Blob once, and kept on the release. */
async function releaseSha(release) {
  return (release.sha ??= hex(await crypto.subtle.digest("SHA-256", await release.blob.arrayBuffer())));
}
/* After a plane upload the account accepted: up to three reads, stopping at the first that matches. Answers null when the
   bytes are the release's, else the lag to name (R15's list: no success is claimed while it stands). */
async function readBack(token, acct, slug, release) {
  const want = await releaseSha(release);
  let got = null;
  for (let i = 0; i < 3; i++) {
    got = await scriptHash(token, acct, slug);
    if (got === want) return null;
    if (i < 2) await new Promise((res) => setTimeout(res, 1500));
  }
  return got === null
    ? word("installer.lag.bytes.unread", { version: release.version })
    : word("installer.lag.bytes.differ", { version: release.version, got: got.slice(0, 16) + "…", want: want.slice(0, 16) + "…" });
}
export { scriptHash, releaseSha, readBack };
