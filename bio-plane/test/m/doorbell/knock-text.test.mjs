/* R13 (T51 fix round 5, E5): a pulled knock of plain text is profiled as text. The pull used to ignore the knock's stated
   media type and file name (`ct: null`), so a `text/plain` knock was never `profiled_from_text` and the reading stated
   "not read as text" for ever. It now applies the one rule an upload applies (acquisition's `textTypeOf`): a declared text
   type, or with none a `.txt`, `.md` or `.csv` name, is used only for bytes that are UTF-8 text without a NUL. Checked at the
   interface, through `knock` and `pullKnock`, over the walker's case (273 bytes of plain text named `knock-b.txt`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket } from "./fixture.mjs";

const pulled = async (content, stated = {}) => {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "i" } });
  const k = await f.c.knock({ ...(content instanceof Uint8Array ? { contentB64: Buffer.from(content).toString("base64") } : { content }),
                              sourceAddress: "198.51.100.7", ...stated });
  assert.equal(k.ok, true);
  const r = await f.c.pullKnock({ knockId: k.knockId, by: "member:m1" });
  assert.equal(r.ok, true);
  return r.document.profile;
};
const text273 = `${"A plain note from a stranger about the council's agenda item.\n".repeat(5)}`.slice(0, 273).padEnd(273, ".");

test("R13: a 273-byte text/plain knock named knock-b.txt is pulled as text (E5, the walker's case)", async () => {
  assert.equal(new TextEncoder().encode(text273).length, 273);
  const p = await pulled(text273, { fileName: "knock-b.txt", mediaType: "text/plain" });
  assert.equal(p.profiled_from_text, true);
  assert.equal(p.source_content_type, "text/plain");
});

test("R13: a knock with no stated type and a .txt or .md name is read as that text type; one with neither is unchanged", async () => {
  const txt = await pulled(text273, { fileName: "note.TXT" });
  assert.equal(txt.profiled_from_text, true);
  assert.equal(txt.source_content_type, "text/plain");
  const md = await pulled(text273, { fileName: "note.md" });
  assert.equal(md.profiled_from_text, true);
  assert.equal(md.source_content_type, "text/markdown");
  /* negative control: neither a type nor a name, the pull is as it was (no text profile, no declared type) */
  const bare = await pulled(text273);
  assert.equal(bare.profiled_from_text, false);
  assert.equal(bare.source_content_type, null);
});

test("R13: a knock declared text/plain whose bytes hold a NUL, or are not UTF-8, is not read as text (control)", async () => {
  const withNul = new Uint8Array([...new TextEncoder().encode("looks like text"), 0, ...new TextEncoder().encode(" but is not")]);
  const a = await pulled(withNul, { fileName: "knock-b.txt", mediaType: "text/plain" });
  assert.equal(a.profiled_from_text, false);
  const notUtf8 = new Uint8Array([0x61, 0xff, 0xfe, 0x62, 0x63]);
  const b = await pulled(notUtf8, { fileName: "knock-b.txt", mediaType: "text/plain" });
  assert.equal(b.profiled_from_text, false);
});

test("R13: a stated non-text type (application/pdf) over text bytes does not make them text (control)", async () => {
  const p = await pulled(text273, { fileName: "knock-b.txt", mediaType: "application/pdf" });
  assert.equal(p.profiled_from_text, false);
});
