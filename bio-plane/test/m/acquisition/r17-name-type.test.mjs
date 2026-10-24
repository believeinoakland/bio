/* acquisition R17 amended (fix round 9, G170; K4985): the profile's format is decided with the file's name and the type its sender declared beside the
   bytes (format-registry R31's name pass), on the upload's path (a direct `profileOf`) and the fetch's path (`acquire` over the fixture network). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha } from "./fixture.mjs";
import { profileOf } from "../../../src/acquisition/index.mjs";

const view = { view: undefined, ids: null };
const at = "2026-10-24T00:00:00Z";
const evOf = (bytes) => ({ async get() { return { arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length) }; } });
const of = (text) => new TextEncoder().encode(text);
const CSV = of("name,amount\nroads,12\nparks,7\nlibraries,3\n");
const TSV = of("name\tamount\nroads\t12\nparks\t7\nlibraries\t3\n");
const prof = (bytes, extra) => profileOf({ ev: evOf(bytes), sha: sha(bytes), total: bytes.length, view, retrieved: at, locator: null, ...extra });

test("R17 (G170): a CSV uploaded as application/vnd.ms-excel and one as application/octet-stream are profiled csv from the name", async () => {
  for (const type of ["application/vnd.ms-excel", "application/octet-stream"]) {
    const p = await prof(CSV, { ct: type, name: "budget.csv", declaredType: type });
    assert.equal(p.format.format, "csv", `declared ${type}`);
  }
});

test("R17 (G170): a .tsv declared text/plain is profiled as a table, not prose", async () => {
  const p = await prof(TSV, { ct: "text/plain", name: "budget.tsv", declaredType: "text/plain" });
  assert.equal(p.format.format, "csv");
});

test("R17 (G170, control): a PDF named x.csv stays a PDF; the same CSV with no name is not profiled csv", async () => {
  const pdf = of("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");
  const p = await prof(pdf, { ct: "application/pdf", name: "x.csv", declaredType: "application/pdf" });
  assert.equal(p.format.format, "pdf");
  const nameless = await prof(CSV, { ct: "application/octet-stream", declaredType: "application/octet-stream" });
  assert.notEqual(nameless.format.format, "csv");
});

test("R17 (G170, R-PATH): a fetched CSV served as application/octet-stream, and a .tsv served as text/plain, end profiled csv; a fetched PDF named x.csv stays a PDF", async () => {
  const w = world();
  const A = "https://data.example/files/budget.csv";
  const B = "https://data.example/files/budget.tsv";
  const C = "https://data.example/files/x.csv";
  const pdf = of("%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n");
  const routes = {
    [A]: () => new Response(CSV, { headers: { "content-type": "application/octet-stream" } }),
    [B]: () => new Response(TSV, { headers: { "content-type": "text/plain" } }),
    [C]: () => new Response(pdf, { headers: { "content-type": "application/pdf" } }),
  };
  const formats = [];
  for (const locator of [A, B, C]) {
    const r = await run(w, routes, { locator });
    assert.equal(r.status, 200, locator);
    formats.push(r.body.document.profile.format.format);
  }
  assert.deepEqual(formats, ["csv", "csv", "pdf"]);
});
