/* file-safety R71 (T53; DEC-479 (45); doorbell R31): `safeViewOfBytes`, the safe view of bytes the record does not hold, a service for modules.
   At the module's interface, over the real record and the scripted scanner of `fixture.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf, sha, enc } from "./fixture.mjs";
import { fixture } from "../image-cover/answers.mjs";

const rowsOf = (n) => enc(`n,label\n${Array.from({ length: n }, (_, i) => `${i + 1},row ${i + 1}`).join("\n")}\n`);
const everything = (w) => JSON.stringify([w.tables(), [...w.bucket.held.keys()].sort(), w.rows("SELECT * FROM register"), w.rows("SELECT * FROM captured_locators")]);

test("R71: a PDF's bytes answer the same pages safeView answers for the same file held as a capture; a CSV answers its figures as data, and fromRow from next_row reaches the last row; a photograph answers its picture", async () => {
  const w = world();
  const bytes = pdf(false, "knock");
  const held = await w.capture(bytes);
  await w.fs.renderBatch({});
  const r = await w.fs.safeView({ captureSha: held, viewer: "member:m1" });
  const seen = JSON.parse(r.headers.get("x-file-safety"));
  const before = everything(w);
  const v = await w.fs.safeViewOfBytes({ bytes, sha256: sha(bytes), viewer: "member:m1" });
  assert.deepEqual([v.ok, v.kind, v.pages, v.source_pages, v.truncated], [true, "pdf", seen.pages, seen.source_pages, seen.truncated]);
  assert.deepEqual(v.statement, seen.statement);
  assert.deepEqual(v.bytes, new Uint8Array(await r.clone().arrayBuffer()), "the same pages");
  assert.equal(v.sha256, seen.sha256);
  assert.equal(everything(w), before, "control: nothing was written, not a row, a note, a count nor an object left behind");
  /* a CSV: its figures as data, paged by next_row to the last row */
  const csv = rowsOf(1000);
  let at = 1, last = 0, calls = 0;
  for (;;) {
    const c = await w.fs.safeViewOfBytes({ bytes: csv, sha256: sha(csv), fromRow: at });
    assert.deepEqual([c.ok, c.kind], [true, "data"]);
    const cells = c.sheets[0].cells;
    last = Math.max(last, ...cells.map((x) => Number(/(\d+)$/.exec(x.ref)[1])));
    calls++;
    if (c.sheets[0].next_row == null) break;
    assert.ok(c.sheets[0].next_row > at);
    at = c.sheets[0].next_row;
  }
  assert.deepEqual([last, calls > 1], [1001, true]);
  assert.equal(everything(w), before);
  /* a photograph: the safe picture, its own bytes beside */
  const photo = fixture("photo-full.jpg");
  const p = await w.fs.safeViewOfBytes({ bytes: photo, sha256: sha(photo) });
  assert.deepEqual([p.ok, p.kind, p.file_says_held.image_unique_id.value, p.bytes instanceof Uint8Array], [true, "picture", "abc123def456", true]);
  assert.equal(everything(w), before);
  /* plain text */
  const t = enc("a note\n");
  assert.equal((await w.fs.safeViewOfBytes({ bytes: t, sha256: sha(t) })).kind, "text");
});

test("R71: an encrypted file, a format with no route and bytes that do not match the stated digest each refuse as stated; no renderer bound, a page view is RENDERER_ABSENT; nothing is written by any call", async () => {
  const w = world();
  const before = everything(w);
  const locked = enc("%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R/Encrypt 2 0 R>>\n%%EOF");
  const e = await w.fs.safeViewOfBytes({ bytes: locked, sha256: sha(locked) });
  assert.deepEqual([e.code, e.renderer_reason], ["SAFE_VIEW_FAILED", "ENCRYPTED"]);
  const tiff = new Uint8Array([0x49, 0x49, 0x2a, 0x00, 8, 0, 0, 0, 9]);
  assert.equal((await w.fs.safeViewOfBytes({ bytes: tiff, sha256: sha(tiff) })).code, "NO_SAFE_VIEW");
  const good = pdf(false, "changed");
  const bad = await w.fs.safeViewOfBytes({ bytes: good, sha256: sha("another") });
  assert.deepEqual([bad.ok, bad.code], [false, "BYTES_CHANGED"]);
  assert.equal((await w.fs.safeViewOfBytes({ bytes: good, sha256: null })).code, "BYTES_CHANGED");
  assert.equal(w.calls("/render").length, 0, "a refusal asks the renderer for nothing");
  const n = world({ bound: false });
  assert.equal((await n.fs.safeViewOfBytes({ bytes: good, sha256: sha(good) })).code, "RENDERER_ABSENT");
  assert.equal(everything(w), before, "control: nothing is written by any call");
});
