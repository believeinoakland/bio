/* R25 (K4488; B8, K4491): the seam test. The real chain, composed as the plane composes it: record, membership, promotion
   and provenance over one storage (provenance-routes' fixture), capture's real queue for the authority event, tasks' real
   drain. A 20 MB capture held in three parts is promoted as the screen promotes it (the register is one whole row carrying its parts), its `authority-undetermined` event is queued under the whole digest, and one drain must make its task.
   The register is the list of wholes (provenance R75); the control, a one-part capture, passes. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha } from "../provenance-routes/fixture.mjs";
import { captureOf } from "../../../src/capture/index.mjs";
import { tasksOf } from "../../../src/tasks/index.mjs";

const RETRIEVED = "2026-09-27T00:00:00Z";
const LOCATOR = "https://example.org/big.pdf";

/** A capture of `parts` (text), promoted as screen promotes a multipart one: the files name the parts, the register is one whole row carrying them,
    and the register document names the whole digest with its parts (provenance D-533). */
function promoteCapture(w, bundleId, parts) {
  const whole = Buffer.concat(parts.map((p) => Buffer.from(p.text, "utf8")));
  const W = sha(whole);
  const doc = { file: parts[0].path, locator: LOCATOR, retrieved: RETRIEVED, authority: "the publisher",
                authority_state: "determined", authority_basis: "named on the document",
                capture: { method: "acquire", grade: "B", actor_class: "session", sha256: W, encoding: "binary", bytes: whole.length },
                origin: { kind: "named_request" },
                ...(parts.length > 1 ? { parts: parts.map((p) => ({ file: p.path, sha256: sha(p.text), bytes: Buffer.byteLength(p.text) })) } : {}) };
  const md = ["---", `id: ${bundleId}`, "object_type: information", "schema: information@1", `title: "Big"`, "current_state: collected",
              "prior_state: null", `created: "${RETRIEVED}"`, `last_updated: "${RETRIEVED}"`, "references: []", "state_history: []",
              "criticality: supporting", "---", "", "## Summary", "", "A document.", ""].join("\n");
  const files = [{ path: "bundle.md", text: md }, { path: "data/provenance.json", text: JSON.stringify({ documents: [doc] }) },
                 ...parts.map((p) => ({ path: p.path, text: p.text }))];
  /* provenance R75, screens-intake R21 (G127): the register is WHOLES. A multipart capture is one row, the whole digest W with its total bytes and path, carrying
     `parts: [{sha256, path, bytes}]` in order; a one-part capture is one row with no `parts`. This is the row shape `promoteDocument` (screens-intake/capture.mjs)
     builds inline; that builder is not exported, so the shape is written here the same way. */
  const register = [{ sha256: W, path: doc.file, encoding: "binary", bytes: whole.length,
                      ...(parts.length > 1 ? { parts: parts.map((p) => ({ sha256: sha(p.text), path: p.path, bytes: Buffer.byteLength(p.text) })) } : {}) }];
  const made = w.promotion.promote({ bundleId, base: null, snapKey: `k${bundleId}`, author: "member:alice", files,
                                     meta: { object_type: "information" }, register });
  assert.equal(made.ok, true, JSON.stringify(made));
  return { W };
}

/** The plane's composition, over the one storage: capture's queue and tasks' drain, each the real module. */
function composed() {
  const w = world({ withProvenance: true });
  /* the `refs` table connections owns, created as world.mjs does, read by routing's cite lookup (R1) */
  w.st.sql.exec("CREATE TABLE IF NOT EXISTS refs (bundle_id TEXT, target_id TEXT, kind TEXT)");
  const cap = captureOf(w.host, { record: w.record, provenance: w.prov });
  cap.migrate();
  const tasks = tasksOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion, provenance: w.prov,
                                    capture: cap, start: false });
  tasks.migrate();
  return { w, cap, tasks };
}

/* Three parts. The production capture is 20 MB; promotion stores a file inline only up to its bound (about 7 MB), so the
   parts here are small. The register path tested does not depend on size: the parts are what the register names. */
const big = (n) => ({ path: `snapshots/big-part${n}.txt`, text: "p".repeat(64 * 1024) + n });

test("R25 control: a one-part capture's authority event, promoted by the real chain, becomes its task at one drain", async () => {
  const { w, cap, tasks } = composed();
  const one = [{ path: "snapshots/small.txt", text: "a small capture" }];
  const { W } = promoteCapture(w, "INFO-2026-0101-small", one);
  await cap.taskEnqueue({ kind: "authority-undetermined", captureSha: W, subject: "Small", locator: LOCATOR });
  const r = tasks.taskDrain({ actor: "alarm", now: RETRIEVED });
  assert.deepEqual(r.created.map((c) => c.refers_to), ["INFO-2026-0101-small"]);
  assert.equal(r.waiting.length, 0);
});

test("R25 (K4488; provenance R72): the three-part capture's authority event, promoted by the real chain, becomes its task at one drain", async () => {
  const { w, cap, tasks } = composed();
  const parts = [big(1), big(2), big(3)];
  const { W } = promoteCapture(w, "INFO-2026-0102-big", parts);
  await cap.taskEnqueue({ kind: "authority-undetermined", captureSha: W, subject: "Big", locator: LOCATOR });
  const r = tasks.taskDrain({ actor: "alarm", now: RETRIEVED });
  assert.deepEqual(r.waiting, [], "the whole digest resolves to its bundle (provenance R72's whole row)");
  assert.deepEqual(r.created.map((c) => c.refers_to), ["INFO-2026-0102-big"]);
});
