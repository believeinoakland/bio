/* machinery-producers R16 (fix round 4b, F3 verification; K4509; provenance R72, R73), at conditionItems' interface: a
   capture held in parts is one capture, so the `capture-completed-unattended` item of a bundle that holds one names one grade
   note for it, its whole's, and none for each register row. The register's rows are a capture of three parts and its whole,
   as provenance R72 writes them (the whole's row marked `whole`, the bundle's `data/provenance.json` stating the parts);
   provenance's marks are the real module's, read over the same storage. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, byId, NOW, iso } from "./world.mjs";
import { ACQUIRE_GRADE_NOTE } from "../../../src/capture/index.mjs";
import { MACHINE_AUTHOR_PREFIX } from "../../../src/record-grammar/actors.mjs";

const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const MIB = 1024 * 1024;

/** A bundle holding a capture of three parts, registered as provenance R72 leaves them, finished by a machine after a person. */
function heldInParts(w, id, label) {
  const sizes = [8 * MIB, 8 * MIB, 4 * MIB + 17];
  const parts = sizes.map((bytes, i) => ({ file: `snapshots/${label}.part${i}`, sha256: sha(`${label}:p${i}`), bytes }));
  const whole = sha(`${label}:whole`);
  const doc = { file: `snapshots/${label}`, locator: `https://x.example/${label}`, retrieved: iso(NOW),
    capture: { method: "acquire", sha256: whole, encoding: "binary", bytes: sizes.reduce((a, b) => a + b, 0) }, parts };
  w.bundle(id, "information", { title: `Memo ${label}` });
  const reg = (capture, path, bytes, isWhole) => w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, last_registered, bytes, whole)
    VALUES (?,?,?,?,?,?,?,?)`, capture, id, path, "binary", iso(NOW), iso(NOW), bytes, isWhole ? 1 : 0);
  /* provenance R74: the register holds the whole only; its parts are the child table `register_parts` */
  parts.forEach((p, i) => w.run(`INSERT INTO register_parts (bundle_id, whole_sha, idx, part_sha, bytes, path) VALUES (?,?,?,?,?,?)`, id, whole, i, p.sha256, p.bytes, p.file));
  reg(whole, doc.file, sizes.reduce((a, b) => a + b, 0), true);
  const body = JSON.stringify({ documents: [doc] });
  w.run(`INSERT INTO files (bundle_id, path, content, bytes, sha256) VALUES (?,?,?,?,?)`, id, "data/provenance.json", body, body.length, sha(body));
  const manifest = (key, author, created) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json)
    VALUES (?, ?, 'revision', 'b', ?, ?, '[]')`, id, key, author, created);
  manifest("k1", "carol", "2026-07-31T12:00:00Z"); manifest("k2", `${MACHINE_AUTHOR_PREFIX}member`, "2026-07-31T18:00:00Z");
  return { whole, parts: parts.map((p) => p.sha256) };
}

test("R16: the grade note of a capture held in three parts is one, its whole's, never one per register row", () => {
  const w = world();
  w.member("carol");
  const m = heldInParts(w, "INFO-W", "w");
  const item = byId(w.read("carol"))["CONDITION::capture-completed-unattended::INFO-W"];
  assert.ok(item, "the bundle finished by a machine after a person raises its item");
  assert.deepEqual(item.basis.grade_notes, [{ capture_sha: m.whole, note: ACQUIRE_GRADE_NOTE }], "one note, for the whole");
  assert.ok(!item.basis.grade_notes.some((n) => m.parts.includes(n.capture_sha)), "no part is named");
});

test("R16 control: a bundle holding two single captures names a note for each, and a capture request names its own digest's", () => {
  const w = world();
  w.member("carol");
  w.bundle("INFO-S", "information");
  for (const c of ["s1", "s2"]) w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES (?,?,?,?,?,1)`, c, "INFO-S", `snapshots/${c}`, "binary", iso(NOW));
  w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json) VALUES ('INFO-S','k1','revision','b','carol','2026-07-31T12:00:00Z','[]')`);
  w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json) VALUES ('INFO-S','k2','revision','b',?,'2026-07-31T18:00:00Z','[]')`, `${MACHINE_AUTHOR_PREFIX}member`);
  assert.deepEqual(byId(w.read("carol"))["CONDITION::capture-completed-unattended::INFO-S"].basis.grade_notes.map((n) => n.capture_sha), ["s1", "s2"]);
  const m = heldInParts(w, "INFO-W", "r");
  const req = { request: "CR-W", run: "r", target: "INFO-W", address: "https://y.example/w", host: "y.example", purpose: "investigate", ua_mode: "civicos",
    capture_sha: m.whole, captured_at: iso(NOW - 1), attribution: { ok: true, statement: "the daemon captured this" } };
  w.fakes.captureRequests.completed = () => ({ requests: [req] });
  assert.deepEqual(byId(w.read("carol"))["CONDITION::capture-completed-unattended::CR-W"].basis.grade_notes, [{ capture_sha: m.whole, note: ACQUIRE_GRADE_NOTE }]);
});
