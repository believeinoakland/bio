/* control-plane R117 (fix round 3; amended fix round 4, C5b; K4429; extraction R80 as amended): A FAILED READING IS REPLACED ONCE THE WHOLE IS HELD.
   The walker's chain through the real plane, the member's own acts and no hand-written answer: a PDF too large to be read from its parts
   (past `MULTIPART_READ_MAX`, 20 MiB, and under the whole-read ceiling `WHOLE_READ_MAX`, 24 MiB, past which a reading is a final statement of its size, reading-pipeline R37) is captured by `acquire`; its reading
   fails for want of the whole; the capture screen promotes the document with that failed reading; the member then holds the whole (the
   original bytes put under their digest) and captures the address again. The second `acquire` answers `existed`, and `op=reading` for the
   digest then has the text (`found: true`, units). Controls: a reading with text is never replaced; the failed one is replaced once. The
   replacement is extraction's (`readHeld`); the door's part is asking it for the digest an `existed` answer names (R117), which this
   test holds to the whole chain. */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-c5b-0123456789abcdef", PASSWORD = "the founder's long password, C5b", ORIGIN = "https://group.example";
const MIB = 1024 * 1024;
const MULTIPART_READ_MAX = 20 * MIB;   /* reading-pipeline R2's size past which the parts are not assembled */
const WORDS = "The Budget Advisory Committee packet reading";

/* A real PDF with one page of text and, unreferenced after it, a stream of `junk` bytes: the reader finds the text, the size is the packet's. */
function pdf(junk) {
  const enc = new TextEncoder(), chunks = [], offsets = [];
  let at = 0;
  const put = (s) => { const b = typeof s === "string" ? enc.encode(s) : s; chunks.push(b); at += b.length; };
  const obj = (n, body) => { offsets[n] = at; put(`${n} 0 obj\n${body}\nendobj\n`); };
  put("%PDF-1.4\n");
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>");
  const content = `BT /F1 12 Tf 72 700 Td (${WORDS}) Tj ET`;
  obj(4, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  obj(5, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding /ToUnicode 7 0 R >>");
  /* the font states what each code means, so the page's text is decodable (a reader finds none in a font that does not) */
  const cmap = "/CIDInit /ProcSet findresource begin 12 dict begin begincmap /CMapName /Adobe-Identity-UCS def /CMapType 2 def "
    + "1 begincodespacerange <00> <FF> endcodespacerange 1 beginbfrange <20> <7E> <0020> endbfrange endcmap CMapName currentdict /CMap defineresource pop end end";
  obj(7, `<< /Length ${cmap.length} >>\nstream\n${cmap}\nendstream`);
  offsets[6] = at; put(`6 0 obj\n<< /Length ${junk.length} >>\nstream\n`); put(junk); put("\nendstream\nendobj\n");
  const xref = at;
  put(`xref\n0 8\n0000000000 65535 f \n${[1, 2, 3, 4, 5, 6, 7].map((n) => `${String(offsets[n]).padStart(10, "0")} 00000 n \n`).join("")}`);
  put(`trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const out = new Uint8Array(at);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}
const hex = (b) => createHash("sha256").update(b).digest("hex");
const PACKETS = { "big.pdf": pdf(new Uint8Array(22 * MIB).fill(0x41)), "small.pdf": pdf(new Uint8Array(0)) };

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-c5b-0123456789abcdef", PROBE_TOKEN: "prb-c5b-0123456789abcdef", VERSION: "4.7.2", INSTANCE_NAME: "c5b-town",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: (req) => {
    const bytes = PACKETS[new URL(req.url).pathname.split("/").pop()];
    return bytes ? new Response(bytes, { headers: { "content-type": "application/pdf", "content-length": String(bytes.length) } })
                 : new Response("not scripted", { status: 404 });
  },
});
after(() => mf.dispose());
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

async function founder() {
  const claimed = await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
  await claimed.arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return { authorization: `Bearer ${signed.result.token}` };
}
const screenCall = (auth) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
  call: async (op, { query = {}, body } = {}) => {
    const u = new URLSearchParams({ op, ...query });
    return (await plane(`/api/?${u}`, { method: body === undefined ? "GET" : "POST", headers: { ...auth, "content-type": "application/json" },
                                        ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json();
  } });

test("R117 (C5b, through the door, the real plane): a document promoted with a reading that failed for want of the whole gets its text when the whole is held and the address is captured again; a reading with text is not replaced, and the failed one is replaced once", { timeout: 600000 }, async () => {
  const auth = await founder();
  const cs = screenCall(auth);
  const acquire = async (file, tag) => (await (await plane("/api/?op=acquire", { method: "POST", headers: { ...auth, "content-type": "application/json" },
    body: JSON.stringify({ locator: `https://docs.example.org/${tag}/${file}` }) })).json());
  const readingOf = async (sha) => (await (await plane(`/api/?op=reading&sha256=${sha}`, { headers: auth })).json()).result;
  const promote = async (a, title) => {
    const made = await CAPTURE_SCREEN.parts.promoteDocument(cs, { doc: a.document, title, locator: a.document.locator, project: "" });
    assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 400));
  };

  /* the starting state: a record promoted in round 2, with the reading the old build made of a capture it could not assemble (R-OLD: since R120 a
     PDF this large is answered pending, so no act of today makes this reading; the capture, the whole's upload and the promotion are the member's acts) */
  const big = PACKETS["big.pdf"], sha = hex(big);
  const first = await acquire("big.pdf", "a");
  assert.equal(first.ok, true, JSON.stringify(first).slice(0, 400));
  assert.equal(first.document.capture.sha256, sha);
  assert.ok(first.document.parts && first.document.parts.length >= 3, "the packet is held in parts");
  const total = first.document.parts.reduce((n, p) => n + p.bytes, 0);
  const failed = { content_type: "generic", reader_version: 1, read_from_text: false, found: false, entities: [], facts: {}, at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    basis: word("reading-pipeline.why.capture_bytes_parts", { total: String(total), parts: String(first.document.parts.length), multipart_read_max: String(MULTIPART_READ_MAX) }),
    page_count: null, page_boxes: null, container_extent: null, metadata: null };
  /* the member holds the whole (the original bytes under their digest), and the capture screen promotes the document with that reading */
  const put = await plane(`/api/?op=capture&sha256=${sha}`, { method: "PUT", headers: auth, body: big });
  assert.equal(put.status, 200, (await put.text()).slice(0, 300));
  await promote({ document: { ...first.document, reading: failed } }, "big.pdf");
  const before = await readingOf(sha);
  assert.equal(before.found, true, "the home holds a reading, and it is the failed one: " + JSON.stringify(before).slice(0, 300));
  assert.equal(JSON.stringify(before.text_units ?? []).includes(WORDS), false, "no text");

  /* the address is captured again */
  const again = await acquire("big.pdf", "a");
  assert.equal(again.existed === true || again.existed === null, true, JSON.stringify(again).slice(0, 300));
  const after1 = await readingOf(sha);
  assert.equal(after1.found, true, "the home holds a reading: " + JSON.stringify(after1).slice(0, 400));
  assert.ok(JSON.stringify(after1.text_units ?? []).includes(WORDS), "the reading has its text now, the packet's words: " + JSON.stringify(after1).slice(0, 600));

  /* control: the replaced reading is not replaced again (a second capture of the address changes nothing) */
  const held = JSON.stringify(after1.reading);
  await acquire("big.pdf", "a");
  assert.equal(JSON.stringify((await readingOf(sha)).reading), held, "the reading with text stands");

  /* control: a document promoted with a reading that has text is never replaced */
  const small = PACKETS["small.pdf"], smallSha = hex(small);
  const s1 = await acquire("small.pdf", "b");
  assert.ok(JSON.stringify(s1.document.text_units ?? []).includes(WORDS), "a small packet is read at once");
  await promote(s1, "small.pdf");
  const smallHeld = JSON.stringify((await readingOf(smallSha)).reading);
  assert.ok(JSON.stringify((await readingOf(smallSha)).text_units).includes(WORDS));
  assert.equal((await acquire("small.pdf", "b")).existed, true);
  assert.equal(JSON.stringify((await readingOf(smallSha)).reading), smallHeld, "a reading with text is not replaced");
});
