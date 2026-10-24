/* acquisition R120 (T51 fix round 9, G131g, X9; DOCS T7, H5): ONE DECODE FOR EVERY TEXT THIS MODULE READS, `ooxml.decodeText`'s. The encoding
   matrix, fetched through the real `acquire`: the profile's text and the document's title equal the truth, or the profile states
   ENCODING_UNSUPPORTED {name}; never replacement characters with no failure. The header's charset wins over a meta tag. UTF-8 is as before. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run } from "./fixture.mjs";
import { textTypeOf } from "../../../src/acquisition/index.mjs";

const U = "https://t.example/f";
const latin1 = (s) => Uint8Array.from([...s].map((c) => c.charCodeAt(0)));
const utf16le = (s, bom = true) => { const b = new Uint8Array((bom ? 2 : 0) + s.length * 2); if (bom) b.set([0xff, 0xfe]); for (let i = 0; i < s.length; i++) { const o = (bom ? 2 : 0) + i * 2; b[o] = s.charCodeAt(i) & 255; b[o + 1] = s.charCodeAt(i) >> 8; } return b; };
const cafe = "Café résumé naïve — ok\n";
const filler = (n) => cafe.repeat(Math.ceil(n / cafe.length)).slice(0, n);
const serve = (bytes, ct) => () => new Response(bytes, { headers: { "content-type": ct } });
const profileOfFetch = async (bytes, ct) => (await run(world(), { [U]: serve(bytes, ct) }, { locator: U })).body.document;

for (const size of [100 * 1024, 3 * 1024 * 1024]) {
  test(`R120 (T7, ${size} bytes): Windows-1252 text with and without a declared charset is decoded as text, not replacement characters`, async () => {
    const body = filler(size);
    for (const ct of ["text/plain; charset=windows-1252", "text/plain"]) {
      const doc = await profileOfFetch(latin1(body), ct);
      assert.ok(doc.profile.profiled_from_text, ct);
      assert.equal(doc.profile.text_encoding.encoding, "windows-1252", ct);
      assert.equal(doc.profile.text_encoding.replaced, 0, ct);
      assert.equal(doc.profile.text_encoding.failure, undefined, ct);
    }
  });
  test(`R120 (T7, ${size} bytes): UTF-16LE with a BOM, and UTF-8 with a BOM, are decoded`, async () => {
    const body = filler(size / 2);
    const a = await profileOfFetch(utf16le(body), "text/plain");
    assert.equal(a.profile.text_encoding.encoding, "utf-16le");
    assert.equal(a.profile.text_encoding.replaced, 0);
    const b = await profileOfFetch(new Uint8Array([0xef, 0xbb, 0xbf, ...Buffer.from(body)]), "text/plain");
    assert.equal(b.profile.text_encoding.encoding, "utf-8");
    assert.equal(b.profile.text_encoding.replaced, 0);
  });
}

test("R120 (T7): a declared charset no decoder knows is stated ENCODING_UNSUPPORTED with its name in the profile, not replacement characters with no failure; UTF-8 is decoded as before (control)", async () => {
  const bad = await profileOfFetch(latin1(cafe), "text/plain; charset=x-klingon");
  assert.deepEqual(bad.profile.text_encoding, { failure: "ENCODING_UNSUPPORTED", name: "x-klingon" });
  assert.equal(bad.profile.profiled_from_text, false);
  const ok = await profileOfFetch(Buffer.from(cafe), "text/plain; charset=utf-8");
  assert.equal(ok.profile.text_encoding.encoding, "utf-8");
  assert.equal(ok.profile.text_encoding.replaced, 0);
});

test("R120 (H5): the title of a Windows-1252 page is read by its meta charset; a header and a meta tag in conflict, the header wins; UTF-16 with a BOM is read", async () => {
  const html = (title, meta) => `<!doctype html><html><head>${meta}<title>${title}</title></head><body>x</body></html>`;
  const t1 = await profileOfFetch(latin1(html("Café à Paris", '<meta charset="windows-1252">')), "text/html");
  assert.equal(t1.title, "Café à Paris");
  /* the header says windows-1252, the meta says utf-8: the header wins, so the byte E9 reads as é */
  const t2 = await profileOfFetch(latin1(html("Café", '<meta charset="utf-8">')), "text/html; charset=windows-1252");
  assert.equal(t2.title, "Café");
  const t3 = await profileOfFetch(utf16le(html("Café", "")), "text/html");
  assert.equal(t3.title, "Café");
  const t4 = await profileOfFetch(Buffer.from(html("Café", "")), "text/html; charset=utf-8");
  assert.equal(t4.title, "Café", "UTF-8 as before");
});

test("R120 R102: textTypeOf reads a member's text file through the same decode: Windows-1252 and UTF-16 with a BOM are text, replacement-heavy and binary bytes are not", () => {
  assert.equal(textTypeOf({ bytes: latin1(cafe.repeat(5)), type: "text/plain" }), "text/plain");
  assert.equal(textTypeOf({ bytes: utf16le(cafe.repeat(5)), name: "n.txt" }), "text/plain");
  assert.equal(textTypeOf({ bytes: new Uint8Array([104, 105, 0, 106]), type: "text/plain" }), null);
  assert.equal(textTypeOf({ bytes: new Uint8Array([0xff, 0xfe, 0x41]), type: "text/plain" }), null);
});
