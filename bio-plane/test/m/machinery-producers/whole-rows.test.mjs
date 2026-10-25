/* machinery-producers R16 (fix round 4b, F3 verification; K4509; provenance R72, R73), at conditionItems' interface: a
   capture held in parts is one capture, so the `capture-completed-unattended` item of a bundle that holds one names one grade
   note for it, its whole's, and none for each register row. The register's rows are a capture of three parts and its whole,
   as provenance R72 writes them (the whole's row marked `whole`, the bundle's `data/provenance.json` stating the parts);
   provenance's marks are the real module's, read over the same storage. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, byId, NOW, iso } from "./world.mjs";
import { heldParts } from "../provenance/fixtures.mjs";
import { ACQUIRE_GRADE_NOTE } from "../../../src/capture/index.mjs";
import { MACHINE_AUTHOR_PREFIX } from "../../../src/record-grammar/actors.mjs";

const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const MIB = 1024 * 1024;

const HELD = "INFO-2026-0001-held";   /* the bundle provenance's `heldParts` promotes the capture into */

/** A bundle holding a capture of three parts, registered by provenance's real register path (its published fixture
 *  `heldParts`: the whole in `register`, the parts in `register_parts`), finished by a machine after a person. */
function heldInParts(w, label) {
  const parts = [8 * MIB, 8 * MIB, 4 * MIB + 17].map((bytes, i) => ({ sha256: sha(`${label}:p${i}`), bytes }));
  const whole = sha(`${label}:whole`);
  const { provenance } = heldParts(whole, parts);
  w.registered = provenance;   /* `registeredFor` answers from provenance's own register */
  /* the module also reads the register table itself (provenance R48's read contract, which finds the machine-finished bundle):
     it holds what provenance's register holds, row for row, as `registeredFor` answers them */
  for (const r of provenance.registeredFor(HELD)) w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, last_registered, bytes, whole)
    VALUES (?,?,?,?,?,?,?,?)`, r.capture_sha, HELD, r.path, r.encoding, r.registered, r.registered, r.bytes, r.whole);
  w.bundle(HELD, "information", { title: `Memo ${label}` });
  const manifest = (key, author, created) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json)
    VALUES (?, ?, 'revision', 'b', ?, ?, '[]')`, HELD, key, author, created);
  manifest("k1", "carol", "2026-07-31T12:00:00Z"); manifest("k2", `${MACHINE_AUTHOR_PREFIX}member`, "2026-07-31T18:00:00Z");
  return { whole, parts: parts.map((p) => p.sha256) };
}

test("R16: the grade note of a capture held in three parts is one, its whole's, never one per register row", () => {
  const w = world();
  w.member("carol");
  const m = heldInParts(w, "w");
  const item = byId(w.read("carol"))[`CONDITION::capture-completed-unattended::${HELD}`];
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
  const whole = sha("r:whole");
  w.bundle("INFO-W", "information");
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES (?,?,?,?,?,1)`, whole, "INFO-W", "snapshots/r", "binary", iso(NOW));
  const m = { whole };
  const req = { request: "CR-W", run: "r", target: "INFO-W", address: "https://y.example/w", host: "y.example", purpose: "investigate", ua_mode: "civicos",
    capture_sha: m.whole, captured_at: iso(NOW - 1), attribution: { ok: true, statement: "the daemon captured this" } };
  w.fakes.captureRequests.completed = () => ({ requests: [req] });
  assert.deepEqual(byId(w.read("carol"))["CONDITION::capture-completed-unattended::CR-W"].basis.grade_notes, [{ capture_sha: m.whole, note: ACQUIRE_GRADE_NOTE }]);
});
