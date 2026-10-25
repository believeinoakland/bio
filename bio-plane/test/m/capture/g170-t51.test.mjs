/* capture, fix round 9 (G170; K4985; seam §13, G130b): R107 amended. The upload hands acquisition's profile the file's name and its declared
   type, so the format is decided as for a fetched file: a CSV declared with a type that is no text type, or a tab-separated file declared
   text/plain, is profiled `csv`. Through `uploadCapture` with no stub. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket } from "./fixture.mjs";

const te = new TextEncoder();
const STATEMENT = "a spreadsheet export the clerk handed me at the counter on 3 October";
const AT = "2026-10-09T12:00:00Z";
const CSV = te.encode("id,name,amount\n1,alpha,3.14\n2,beta,2.72\n3,gamma,1.41\n");
const TSV = te.encode("id\tname\tamount\n1\talpha\t3.14\n2\tbeta\t2.72\n3\tgamma\t1.41\n");
/* an empty ZIP: the end-of-central-directory record alone, so the bytes name the format whatever the name and declaration say */
const ZIP = Uint8Array.from([0x50, 0x4b, 0x05, 0x06, ...new Array(18).fill(0)]);

const upload = async (bytes, extra = {}) => {
  const f = fresh({ evidence: bucket(), env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  const r = await f.c.uploadCapture({ bytes, statement: STATEMENT, by: "m1", at: AT, ...extra });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return r.document;
};
const formatOf = (d) => d.profile.format.format;

test("R107 G170: a CSV named c.csv, declared application/vnd.ms-excel, is profiled csv; the declaration is the uploader's", async () => {
  const d = await upload(CSV, { name: "c.csv", type: "application/vnd.ms-excel" });
  assert.equal(formatOf(d), "csv");
  assert.equal(d.profile.source_content_type, "application/vnd.ms-excel");
  assert.equal(d.profile.declared_by, "uploader");
});

test("R107 G170: a CSV named c.csv, declared application/octet-stream, is profiled csv", async () => {
  assert.equal(formatOf(await upload(CSV, { name: "c.csv", type: "application/octet-stream" })), "csv");
});

test("R107 G170: a tab-separated file named c.tsv, declared text/plain, is profiled csv", async () => {
  assert.equal(formatOf(await upload(TSV, { name: "c.tsv", type: "text/plain" })), "csv");
});

test("R107 G170: a CSV declared text/csv and a tab-separated file declared text/tab-separated-values stay csv", async () => {
  assert.equal(formatOf(await upload(CSV, { name: "c.csv", type: "text/csv" })), "csv");
  assert.equal(formatOf(await upload(TSV, { name: "c.tsv", type: "text/tab-separated-values" })), "csv");
});

test("R107 G170 controls: with no name the same bytes and declaration are profiled from the bytes as before", async () => {
  assert.notEqual(formatOf(await upload(CSV, { type: "application/vnd.ms-excel" })), "csv", "no name, no delimited-text pass");
  assert.notEqual(formatOf(await upload(CSV, { type: "application/octet-stream" })), "csv");
  assert.notEqual(formatOf(await upload(TSV, { type: "text/plain" })), "csv");
});

test("R107 G170 controls: the bytes outrank the name and the declaration (a ZIP named c.csv, declared octet-stream, is not csv)", async () => {
  const d = await upload(ZIP, { name: "c.csv", type: "application/octet-stream" });
  assert.notEqual(formatOf(d), "csv");
  assert.equal(formatOf(d), formatOf(await upload(ZIP)), "the same format as the same bytes uploaded bare");
});
