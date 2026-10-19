/* Bytes and bodies: the hashes and comparisons, the random values, and the multipart upload form the other files share
 * (R12, R13, R14). Pure; nothing here reaches the network. */

const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
const vcmp = (a, b) => {
  const A = String(a).split(".").map(Number), B = String(b).split(".").map(Number);
  for (let i = 0; i < 3; i++) { const d = (A[i] || 0) - (B[i] || 0); if (d) return d; }
  return 0;
};

const relHeaders = { "user-agent": "bio-installer" };

const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)))
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const rand = (n) => b64url(crypto.getRandomValues(new Uint8Array(n)));

const CRLF = [13, 10], HEADER_END = [13, 10, 13, 10];
const ascii = (s) => Uint8Array.from(s, (c) => c.charCodeAt(0));
/* The first offset at or after `from` where `pat` (bytes) occurs in `hay`, or -1; the native scan finds each candidate. */
function find(hay, pat, from = 0) {
  for (let i = hay.indexOf(pat[0], from); i !== -1 && i + pat.length <= hay.length; i = hay.indexOf(pat[0], i + 1)) {
    let k = 1;
    while (k < pat.length && hay[i + k] === pat[k]) k++;
    if (k === pat.length) return i;
  }
  return -1;
}
/* The `index.mjs` part of a multipart body, as a view of `bytes`, or null. */
function multipartPart(bytes, boundary) {
  const delim = ascii("--" + boundary), next = new Uint8Array([...CRLF, ...delim]);
  for (let at = find(bytes, delim); at !== -1; ) {
    const start = at + delim.length;
    if (bytes[start] === 45 && bytes[start + 1] === 45) return null;          /* the closing delimiter */
    const head = find(bytes, HEADER_END, start);
    if (head === -1) return null;
    const headers = new TextDecoder().decode(bytes.subarray(start, head));
    const end = find(bytes, next, head + HEADER_END.length);
    if (/name="index\.mjs"/.test(headers)) return bytes.subarray(head + HEADER_END.length, end === -1 ? bytes.length : end);
    at = end === -1 ? -1 : end + CRLF.length;
  }
  return null;
}

/* `source` is the module as text, or already a Blob (a repository release, R33: made once, shared by every upload). */
function uploadForm(meta, source) {
  const fd = new FormData();
  fd.append("metadata", new Blob([JSON.stringify(meta)], { type: "application/json" }));
  fd.append("index.mjs", source instanceof Blob ? source : new Blob([source], { type: "application/javascript+module" }), "index.mjs");
  return fd;
}
export { hex, vcmp, relHeaders, b64url, rand, CRLF, HEADER_END, ascii, find, multipartPart, uploadForm };
