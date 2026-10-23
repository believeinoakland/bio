/* G59 (fix round 7): the history checker (record-grammar's C-12.2) and the writer (record-core's `RecordCore.snapPath`) must
   derive a snapshot copy's path one way. record-grammar is layer 1 and cannot import record-core, so this is the test in a
   module above both: a copy stored at `RecordCore.snapPath`'s path is found by `checkBundle`, whatever the name's shape. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkBundle, createSha256 } from "../../../src/record-grammar/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";
import { RecordCore } from "../../../src/record-core/index.mjs";

const KEY = "20260101T000000Z_aaaaaaaa";
const UPLOAD = `snapshots/upload-${"0123456789abcdef".repeat(4)}`;
const NAMES = ["bundle.md", "data/changes.json", UPLOAD, "a/b/c", "a.b/c", "a.b/c.d", "x.tar.gz", "snapshots/.hidden"];
const CLEAN = [
  "---", "id: INFO-2026-0001-a", "object_type: information", "schema: information@1", "title: T", "current_state: collected",
  "prior_state: null", "created: 2026-01-01T00:00:00Z", "last_updated: 2026-01-01T00:00:00Z", "produced_by:", "  mode: manual",
  "  capability_tier: t1", "group: g", "references: []", "state_history: []", "annotations_open: 0", "reeval_pending: false",
  "visuals: []", "---", "## Summary", "", "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

test("R40 G59 the history checker finds every copy at RecordCore.snapPath's path: dotted, dotless, subfolder and dotted-directory names", async () => {
  const files = new Map([["bundle.md", CLEAN], ["_history/manifest.json", JSON.stringify({ entries: [
    { key: KEY, kind: "edit", created: "2026-01-01T00:00:00Z", files: [], snapshotted: NAMES }] })]]);
  for (const n of NAMES) {
    const p = RecordCore.snapPath(n, KEY);
    assert.ok(p.startsWith("_history/"), p);
    files.set(p, "x");
  }
  const r = await checkBundle({ folderName: "INFO-2026-0001-a", files, sha256: async (v) => createSha256().update(typeof v === "string" ? new TextEncoder().encode(v) : v).hex() }, {});
  assert.deepEqual(r.findings.filter((f) => f.check === "C-12.2"), []);
  /* One copy short: the checker names the path the writer would have stored, not another. */
  for (const n of NAMES) {
    const short = new Map(files); short.delete(RecordCore.snapPath(n, KEY));
    const found = (await checkBundle({ folderName: "INFO-2026-0001-a", files: short, sha256: async () => "" }, {})).findings.filter((f) => f.check === "C-12.2");
    assert.deepEqual(found.map((f) => f.message), [localize("record-grammar.bundle.snapshot_snappath_recorded_in_manifest", "snapshot '{snapPath}' recorded in manifest entry '{key}' is missing", { snapPath: RecordCore.snapPath(n, KEY), key: KEY })], n);
  }
});
