/* ratification R59 (T51 fix round 7, G59; K4736): the history copy's path the case gate looks for (record-grammar's
   checker, layer 1, which cannot import record-core) is the path `RecordCore.snapPath` stores it at, for a dotted name, a
   dotless one (the writer names an upload `snapshots/upload-<sha>`), a name in a subfolder and one in a dotted
   directory. Driven at `checkBundle`'s interface: a bundle whose manifest entry snapshots each name, with the copy
   at the stored path, raises no C-12.2 finding (no "is missing", no "maps to no manifest entry"). The test lives here,
   in a module above both, so the two derivations cannot drift apart again. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkBundle } from "../../../src/record-grammar/index.mjs";
import { RecordCore } from "../../../src/record-core/index.mjs";
import { fixtures, STUBS } from "../record-grammar/fixtures/bundles.mjs";

const KEY = "20260101T000000Z_aaaaaaaa";
const SHA = "a".repeat(64);
const NAMES = ["bundle.md", "data/x.json", `snapshots/upload-${SHA}`, "a/b/c", "a.b/c", "a.b/c.txt", "noext", "x.tar.gz"];

/* the clean information bundle, its live bundle.md also kept as the history copy of `bundle.md`, and one more copy per name */
function withHistory(names, place = (n) => RecordCore.snapPath(n, KEY)) {
  const base = fixtures()["clean information"];
  const files = new Map(base.files);
  const live = files.get("bundle.md");
  for (const n of names) files.set(place(n), n === "bundle.md" ? live : "x");
  const manifest = { entries: [{ key: KEY, kind: "edit", created: "2026-01-01T00:00:00Z", files: [], snapshotted: names }] };
  files.set("_history/manifest.json", JSON.stringify(manifest));
  return { ...base, files };
}
const c122 = async (b) => (await checkBundle(b, { grammars: STUBS })).findings.filter((f) => f.check === "C-12.2");

for (const name of NAMES)
  test(`R59 parity: the copy of ${name} at RecordCore.snapPath's path is found, and maps to its manifest entry`, async () => {
    const found = await c122(withHistory([name]));
    assert.deepEqual(found, [], JSON.stringify(found));
  });

test("R59 parity: every name in one entry together, and control: a copy at any other path is found missing", async () => {
  assert.deepEqual(await c122(withHistory(NAMES)), []);
  const wrong = await c122(withHistory(["a.b/c"], (n) => `_history/${n}_${KEY}`));
  assert.ok(wrong.length > 0, "a copy not at snapPath's path is a C-12.2 finding");
});
