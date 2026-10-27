/* acquisition fix round 10, cause 12 (G3; K5053): R102's text names are those of csv-reader's delimited table, so a `.tsv` or `.tab`
   member of an archive is read as text as a standalone file is. At the module's interface: `textTypeOf`, and `unpack(store,
   {archiveSha})` over a held archive (fixture.mjs), the member path and the standalone path (R-PATH). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { unpack, textTypeOf } from "../../../src/acquisition/index.mjs";

const enc = (s) => new TextEncoder().encode(s);
const TSV = "name\tcount\nroads\t12\nparks\t7\n";
const hold = async (w, bytes) => {
  const url = "https://files.example/set.zip";
  await w.b.put(`bio/captures/${sha(bytes)}`, bytes);
  w.prov.recordReceipt({ address: url, addressNorm: url, captureSha: sha(bytes), retrieved: "2026-01-01T00:00:00Z", via: "doorbell" });
};

test("R102 (cause 12): a .tsv and a .tab name stand for text/tab-separated-values, as a standalone file's; a NUL under a .tsv name is null", () => {
  assert.equal(textTypeOf({ bytes: enc(TSV), name: "m02.tsv" }), "text/tab-separated-values");
  assert.equal(textTypeOf({ bytes: enc(TSV), name: "M02.TAB" }), "text/tab-separated-values");
  assert.equal(textTypeOf({ bytes: enc("a,b\n1,2\n"), name: "m03.csv" }), "text/csv");
  assert.equal(textTypeOf({ bytes: new Uint8Array([104, 105, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]), name: "nul.tsv" }), null, "a NUL is not text");
  assert.equal(textTypeOf({ bytes: enc(TSV), type: "application/pdf", name: "m02.tsv" }), null, "a declared non-text type is not overridden by the name");
});

test("R102 R39 (cause 12): the .txt, .tsv and .csv members of an archive are each typed and read whole as text; a .tsv with a NUL is not", async () => {
  const w = world();
  const z = makeZip([
    { name: "dir/m01.txt", data: "alpha notes" }, { name: "dir/m02.tsv", data: TSV }, { name: "dir/m03.csv", data: "x,y\n1,2\n" },
    { name: "dir/m04.tab", data: "k\tv\nz\t1\n" },
    { name: "dir/nul.tsv", data: new Uint8Array([104, 105, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]) },
  ]);
  await hold(w, z);
  const u = await unpack(w.store, { archiveSha: sha(z), cls: "daemon" });
  assert.equal(u.ok, true);
  const by = Object.fromEntries(u.documents.map((d) => [d.container.path, d]));
  assert.deepEqual(["dir/m01.txt", "dir/m02.tsv", "dir/m03.csv", "dir/m04.tab"].map((p) => by[p]?.capture.content_type),
    ["text/plain", "text/tab-separated-values", "text/csv", "text/tab-separated-values"]);
  for (const p of ["dir/m01.txt", "dir/m02.tsv", "dir/m03.csv", "dir/m04.tab"]) assert.equal(by[p].profile.profiled_from_text, true, `${p} is read as text`);
  assert.equal(by["dir/nul.tsv"].capture.content_type, undefined, "a NUL under a .tsv name is binary: filed, not typed");
  assert.equal(by["dir/nul.tsv"].profile.profiled_from_text, false);
  /* the member reads the same as the standalone file of its bytes (R-PATH) */
  assert.equal(by["dir/m02.tsv"].capture.content_type, textTypeOf({ bytes: enc(TSV), name: "m02.tsv" }));
});
