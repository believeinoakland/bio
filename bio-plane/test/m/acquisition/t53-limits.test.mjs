/* acquisition R135 (T53; N1269; K5446, K5453 point 2): `limitsByKind()` answers the limit the add screen shows for each kind, the one the copy enforces, quoted from
   READ_BOUNDS through `boundOf`; there is no second figure. At the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { limitsByKind, LARGE_FETCH_BYTES } from "../../../src/acquisition/index.mjs";
import { boundOf } from "../../../src/read-bounds.mjs";

test("R135: each kind of file states the one limit the copy enforces, the figure the refusal compares against; documents and sheets state pages and rows, every kind reads whole", () => {
  const { kinds } = limitsByKind();
  assert.deepEqual(kinds.map((k) => k.kind), ["document", "sheet", "image", "archive"]);
  const by = Object.fromEntries(kinds.map((k) => [k.kind, k]));
  assert.deepEqual([by.document.bytes, by.document.pages], [boundOf("document", "bytes"), boundOf("document", "pages")]);
  assert.deepEqual([by.sheet.bytes, by.sheet.rows], [boundOf("spreadsheet", "bytes"), boundOf("spreadsheet", "rows")]);
  assert.equal(by.image.bytes, boundOf("image", "bytes"));
  assert.equal(by.archive.bytes, boundOf("archive", "uploaded_bytes"));
  assert.ok(kinds.every((k) => k.reads === "whole"));
  /* N1267's sizes: 100 MB and 5,000 pages, 50 MB and about a million rows, 50 MB, 500 MB */
  assert.deepEqual([by.document.bytes / 1048576, by.document.pages, by.sheet.bytes / 1048576, by.sheet.rows, by.image.bytes / 1048576, by.archive.bytes / 1048576], [100, 5000, 50, 1048576, 50, 500]);
  /* a file bigger than the request reads in the call is told it will be read in the background */
  for (const k of kinds) assert.equal(k.how_long, k.bytes > LARGE_FETCH_BYTES ? "background" : "now");
  assert.ok(kinds.every((k) => k.how_long === "background"));
});

test("R135 control: the answer changes with READ_BOUNDS and with nothing else; no field names a second figure for a kind; the source holds no numeric literal; it never throws", () => {
  const moved = limitsByKind({ read: (kind, name) => boundOf(kind, name) + (kind === "document" && name === "pages" ? 1 : 0) });
  assert.equal(moved.kinds.find((k) => k.kind === "document").pages, boundOf("document", "pages") + 1);
  assert.deepEqual(moved.kinds.filter((k) => k.kind !== "document"), limitsByKind().kinds.filter((k) => k.kind !== "document"));
  const small = limitsByKind({ read: () => 1024 });
  assert.ok(small.kinds.every((k) => k.how_long === "now"), "a kind whose limit fits the request is read now");
  for (const k of limitsByKind().kinds) assert.deepEqual(Object.keys(k).filter((f) => !["kind", "bytes", "pages", "rows", "reads", "how_long"].includes(f)), [], "no field of a second figure, and no `standard`");
  assert.deepEqual(limitsByKind({ read: () => { throw new Error("no row"); } }), { kinds: [] });
  const code = readFileSync(new URL("../../../src/acquisition/limits.mjs", import.meta.url), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  assert.equal(/\d{2,}/.test(code), false, "no numeric literal");
});
