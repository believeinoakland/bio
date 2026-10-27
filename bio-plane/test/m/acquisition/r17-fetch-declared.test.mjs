/* acquisition R17 amended (fix round 9, G174; K5001): on a fetch as on an upload (capture R107), a declared type contradicts no bytes: a declared text type
   over bytes judged not text decides neither the format nor the text content type. Through `acquire` over the fixture network. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run } from "./fixture.mjs";

/* bytes that are not text: NULs and high bytes in no text encoding, and no signature of any format */
const BINARY = Uint8Array.from({ length: 600 }, (_, i) => (i % 7 === 0 ? 0 : (i * 37 + 129) & 0xff));
const CSV = new TextEncoder().encode("name,amount\nroads,12\nparks,7\nlibraries,3\n");

/* what the profile decides from the bytes alone: served with no declared type, under the same file name */
const profileOf = async (bytes, file, type) => {
  const w = world();
  const locator = `https://data.example/files/${file}`;
  const r = await run(w, { [locator]: () => new Response(bytes, { headers: type ? { "content-type": type } : {} }) }, { locator });
  assert.equal(r.status, 200, `${file} as ${type}`);
  return r.body.document.profile;
};
const decided = (p) => ({ format: p.format.format, content_type: p.content_type, from_text: p.profiled_from_text });

test("R17 (G174): binary bytes declared text/plain or text/csv, named .csv, .txt or .bin, are profiled as the same bytes declared no type", async () => {
  for (const file of ["data.csv", "data.txt", "data.bin"]) {
    for (const type of ["text/plain", "text/csv"]) {
      const declared = await profileOf(BINARY, file, type);
      const bare = await profileOf(BINARY, file, "application/octet-stream");
      assert.deepEqual(decided(declared), decided(bare), `${file} declared ${type}`);
      assert.equal(declared.profiled_from_text, false, `${file} declared ${type}`);
      assert.notEqual(declared.format.format, "csv", `${file} declared ${type}`);
    }
  }
});

test("R17 (G174, control): text bytes declared text/csv are still profiled csv from text", async () => {
  const p = await profileOf(CSV, "data.csv", "text/csv");
  assert.equal(p.format.format, "csv");
  assert.equal(p.profiled_from_text, true);
});
