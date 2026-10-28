/* capture R121 (T53; DEC-455; T53-104): `previewMore` reads a cut preview's next rows from the preview's `next_row`, through the reader's windowed cells, at the module's
   interface: the record's evidence store, the register's document, the viewer's sight. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, register, sha } from "./fixture.mjs";
import { PREVIEW_ROWS, DECLARED_OPS, captureOps } from "../../../src/capture/index.mjs";

const te = new TextEncoder();
const ROWS = PREVIEW_ROWS * 2 + 37;
const csv = () => te.encode(["id,name", ...Array.from({ length: ROWS }, (_, i) => `${i + 1},row ${i + 1}`)].join("\n") + "\n");

const held = (bytes = csv(), { format = "csv", seen = true } = {}) => {
  const b = bucket();
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst" } });
  const digest = sha(bytes);
  b.held.set(`bio/captures/${digest}`, bytes);
  register(f.s, digest, "INFO-1");
  f.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES ('INFO-1', 'data/provenance.json', ?, NULL, 1, 'x')`,
               JSON.stringify({ documents: [{ capture: { sha256: digest }, profile: { format: { format } } }] }));
  return { ...f, b, digest, seen };
};
const rowsOf = (cells) => [...new Set(cells.map((c) => c.row ?? c.r ?? c.address?.row))].filter((x) => x !== undefined);
const snapshot = (f) => JSON.stringify(f.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((t) => [t.name, f.rows(`SELECT * FROM ${t.name}`)]));

test("R121: previewMore from next_row, call by call, reaches the last row with every row once and in order; next_row is absent after the last", async () => {
  const f = held();
  const seen = [];
  let from = 1, calls = 0;
  for (;;) {
    const r = await f.c.previewMore({ captureSha: f.digest, fromRow: from, viewer: "member:ann" });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.rows.from, from);
    seen.push(...r.cells);
    calls++;
    if (r.next_row === undefined) break;
    assert.ok(r.next_row > from && r.next_row === r.rows.to + 1, "next_row is the row after the window");
    from = r.next_row;
    assert.ok(calls < 20);
  }
  assert.ok(calls > 1, "the file was cut at least once");
  assert.equal(seen.length, new Set(seen.map((c) => JSON.stringify(c))).size, "no cell twice");
  const last = seen[seen.length - 1];
  assert.match(JSON.stringify(last), new RegExp(`row ${ROWS}`));
});

test("R121: a fromRow past the last row answers no cells and no next_row; control: the capture's bytes and rows are unchanged afterwards", async () => {
  const f = held();
  const before = [snapshot(f), [...f.b.held.entries()].map(([k, v]) => [k, v.length])];
  const r = await f.c.previewMore({ captureSha: f.digest, fromRow: ROWS + 500, viewer: "member:ann" });
  assert.equal(r.ok, true);
  assert.deepEqual(r.cells, []);
  assert.equal(r.next_row, undefined);
  await f.c.previewMore({ captureSha: f.digest, fromRow: 1, viewer: "member:ann" });
  assert.deepEqual([snapshot(f), [...f.b.held.entries()].map(([k, v]) => [k, v.length])], before);
});

test("R121: a viewer who cannot see the capture, a machine, an absent viewer and an unheld digest are answered alike as NO_SUCH_CAPTURE", async () => {
  const f = held();
  const answers = [];
  for (const viewer of [undefined, "", "class:ai", "daemon"]) answers.push(await f.c.previewMore({ captureSha: f.digest, fromRow: 1, viewer }));
  answers.push(await f.c.previewMore({ captureSha: sha("not held"), fromRow: 1, viewer: "member:ann" }));
  for (const a of answers) assert.deepEqual([a.ok, a.reason, a.status], [false, "NO_SUCH_CAPTURE", 404]);
  assert.equal(new Set(answers.map((a) => JSON.stringify(a))).size, 1, "an unseen capture and an unknown one read alike");
});

test("R121: a file that is no sheet answers the reader's refusal in words by key; a bad argument is the required-argument refusal naming it", async () => {
  const f = held(te.encode("%PDF-1.4 not a sheet"), { format: "pdf" });
  const r = await f.c.previewMore({ captureSha: f.digest, fromRow: 1, viewer: "member:ann" });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "cells_not_interpretable");
  assert.equal(r.key, "capture.index.preview_cells_not_interpretable");
  assert.equal(typeof r.detail, "string");
  for (const [args, argument] of [[{ captureSha: "x", fromRow: 1 }, "captureSha"], [{ captureSha: f.digest, fromRow: 0 }, "fromRow"],
                                  [{ captureSha: f.digest, fromRow: "2" }, "fromRow"], [{ captureSha: f.digest, fromRow: 1, sheet: 5 }, "sheet"]]) {
    const a = await f.c.previewMore({ ...args, viewer: "member:ann" });
    assert.deepEqual([a.ok, a.reason, a.argument], [false, "REQUIRED_ARGUMENT_MISSING", argument]);
  }
});

test("R121: op=previewmore is declared and routed: the stamped viewer decides sight, fromRow is read from the address", async () => {
  assert.deepEqual(DECLARED_OPS.previewmore.fields.accepts, ["capture", "captureSha", "sheet", "fromRow"]);
  assert.equal(DECLARED_OPS.previewmore.mutating, false);
  const f = held();
  const ask = (viewer) => captureOps(f.c, new URL(`http://x/?op=previewmore&capture=${f.digest}&fromRow=2&viewer=${viewer}`), null, f.c.env).previewmore();
  const ok = await ask("member:ann");
  assert.equal(ok.ok, true);
  assert.equal(ok.rows.from, 2);
  assert.equal((await ask("")).reason, "NO_SUCH_CAPTURE");
  void rowsOf;
});
