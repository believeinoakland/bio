/* csv-reader, R4: structure() — the I2 shape and the IC-2 evidentiary envelope of a format with no links. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { csvEntry, CSV_SHEET_NAME } from "../../../src/csv-reader/index.mjs";
import { STREAMED_TEXT_BOUND_BYTES } from "../../../src/ooxml.mjs";
import * as F from "./fixtures.mjs";

const PARTITIONS = ["anchor", "intra", "deferred", "refused", "undetermined"];

test("R4 csv structure: the I2 shape, no links, every count zero, an empty evidentiary envelope, the notes say the zero is the format's", async () => {
  const s = await csvEntry.structure(F.enc("a,b\n1,2\n"));
  assert.equal(s.ok, true);
  assert.equal(s.container, "csv");
  assert.deepEqual(s.sheets, [{ sheet: 0, name: CSV_SHEET_NAME, sheetId: null, state: "visible", hidden: false }]);
  assert.ok(Array.isArray(s.links) && Array.isArray(s.notes));
  assert.deepEqual(s.links, []);
  assert.deepEqual(Object.keys(s.counts).sort(), [...PARTITIONS].sort());
  for (const p of PARTITIONS) assert.equal(s.counts[p], 0, `counts.${p}`);
  assert.deepEqual(s.evidentiary, { container: "csv", kinds: [], items: [], undetermined: [], counts: {} });
  assert.deepEqual(s.active, []);
  assert.ok(s.notes.some((n) => /format/.test(n)));
  assert.deepEqual(s.dialect, csvEntry.dialect(F.enc("a,b\n1,2\n")), "the dialect is R7's");
});

test("R4 csv structure: ok:false with the parts failure when parts failed; the guard marker is the evidentiary's only possible undetermined", async () => {
  assert.deepEqual(await csvEntry.structure(F.enc("")), { ok: false, container: "csv", reason: "empty_body" });
  assert.deepEqual(await csvEntry.structure(undefined), { ok: false, container: "csv", reason: "PARTS_ABSENT" });
  const big = new Uint8Array(32 * 1024 * 1024 + 1).fill(0x61);
  const o = await csvEntry.structure(big);
  assert.equal(o.evidentiary.undetermined.length, 1);
  assert.equal(o.evidentiary.undetermined[0].guard.boundName, "STREAMED_TEXT_BOUND_BYTES");
  assert.equal(o.evidentiary.undetermined[0].guard.bound, STREAMED_TEXT_BOUND_BYTES);
  assert.deepEqual(o.evidentiary.items, []);
  assert.deepEqual(o.evidentiary.kinds, []);
  assert.deepEqual(o.links, []);
  assert.ok(o.notes.includes("text_body_over_bound"));
});

test("R4 csv structure accepts raw bytes or parts() output and answers the same", async () => {
  const b = F.enc("a;b\n1;2\n");
  assert.deepEqual(await csvEntry.structure(await csvEntry.parts(b)), await csvEntry.structure(b));
});
