/* retrieval-browse R19 (fix round 4b, F3 verification; K4509; provenance R72, R73), at the module's interface: a capture
 * held in parts is one capture. `findIn`'s bundle, id and project scopes count and search it once, by its whole (provenance
 * marks each part's row `part_of`; the part's row is skipped), so it spends one of `FIND_CAPTURES_PER_CALL` and the scope
 * reports one capture. The fixture is a capture of three parts promoted by the real chain, as `screens-intake` promotes
 * one: the parts alone in the `register` list, the whole's row written by provenance (R72). */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, V, infoMd } from "./fixture.mjs";
import { FIND_CAPTURES_PER_CALL } from "../../../src/retrieval-browse/index.mjs";

const MIB = 1024 * 1024;
const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const find = (w, scope, extra = {}) => w.rb.findIn({ scope, kinds: ["term"], term: "budget", viewer: V("vera"), ...extra });

/** A capture of three parts (8 MiB, 8 MiB and a little over 4 MiB) and its whole, with the document that states them. */
function threeParts(label) {
  const sizes = [8 * MIB, 8 * MIB, 4 * MIB + 17];
  const held = sizes.map((bytes, i) => ({ file: `snapshots/${label}.part${String(i).padStart(3, "0")}`, sha256: sha(`${label}:p${i}`), bytes }));
  const whole = sha(`${label}:whole`);
  const doc = { file: `snapshots/${label}`, locator: `https://example.org/snapshots/${label}`, retrieved: "2026-09-27T00:00:00Z",
    authority: "the publisher", authority_state: "determined", authority_basis: "named on the document",
    capture: { method: "acquire", grade: "B", actor_class: "session", sha256: whole, encoding: "binary", bytes: sizes.reduce((a, b) => a + b, 0) },
    origin: { kind: "named_request" }, parts: held };
  return { whole, held, doc };
}

/** Promotes a document holding the three-part capture as the real chain does, with its text indexed under the whole. */
function heldInParts(w, id, label) {
  const m = threeParts(label);
  const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `mp-${label}`, author: "member:ann", meta: { object_type: "information" },
    files: [{ path: "bundle.md", text: infoMd(id) },
            { path: "data/provenance.json", text: JSON.stringify({ documents: [m.doc] }, null, 1) },
            ...m.held.map((p) => ({ path: p.file, blobSha: p.sha256, sha256: p.sha256, bytes: p.bytes }))],
    register: m.held.map((p) => ({ sha256: p.sha256, path: p.file, encoding: "binary", bytes: p.bytes })) });
  assert.equal(r.ok, true, `the real chain promotes the multipart capture: ${JSON.stringify(r).slice(0, 300)}`);
  w.unit(m.whole, id, 0, "The budget line is set.");
  return m;
}

test("R19: the register holds the capture's parts and its whole, each part's row marked for the whole (the fixture is the case)", () => {
  const w = world();
  const m = heldInParts(w, "INFO-2026-0001-big", "a");
  assert.equal(w.rows(`SELECT capture_sha FROM register WHERE bundle_id = ?`, "INFO-2026-0001-big").length, 4, "three parts and the whole");
  const marks = w.prov.registeredFor("INFO-2026-0001-big");
  assert.deepEqual(marks.filter((r) => r.part_of === m.whole).map((r) => r.capture_sha).sort(), m.held.map((p) => p.sha256).sort());
  assert.deepEqual(marks.filter((r) => r.whole === 1).map((r) => r.capture_sha), [m.whole]);
});

test("R19: a bundle scope counts a capture held in three parts once and finds it by its whole", () => {
  const w = world();
  const m = heldInParts(w, "INFO-2026-0001-big", "b");
  const ans = find(w, { ids: ["INFO-2026-0001-big"] });
  assert.equal(ans.ok, true);
  assert.equal(ans.scope.captures, 1, "one capture, never one per register row");
  assert.equal(ans.captures_read, 1, "it spends one of the call's captures");
  assert.equal(ans.next, null);
  const items = ans.kinds[0].items;
  assert.equal(items.length, 1, "found once");
  assert.equal(items[0].capture_sha, m.whole);
  assert.deepEqual(ans.kinds[0].not_read, [], "no part is reported as a capture that could not be read");
});

test("R19: a project scope counts the three-part capture once, beside a single capture it counts as it did", () => {
  const w = world();
  const m = heldInParts(w, "INFO-2026-0001-big", "c");
  const c = w.cap("ctl", "ctl bytes");
  w.doc("INFO-2026-0002-ctl", {}, { captures: [c] });
  w.unit(c.sha, "INFO-2026-0002-ctl", 0, "The budget line is set.");
  const p = w.project("Case", "ann", { captures: [] });
  w.st.sql.exec(`UPDATE bundles SET project = ? WHERE bundle_id IN (?, ?)`, p, "INFO-2026-0001-big", "INFO-2026-0002-ctl");
  const ans = w.rb.findIn({ scope: { project: p }, kinds: ["term"], term: "budget", viewer: V("ann") });
  assert.equal(ans.ok, true);
  assert.equal(ans.scope.captures, 2, "the whole once, the single capture once");
  assert.equal(ans.captures_read, 2);
  assert.deepEqual(ans.kinds[0].items.map((i) => i.capture_sha).sort(), [m.whole, c.sha].sort());
  assert.ok(ans.captures_read <= FIND_CAPTURES_PER_CALL);
});

test("R19 control: a bundle holding single captures is scoped as before, each capture once, and a bundle the viewer may not see adds none", () => {
  const w = world();
  const a = w.cap("a", "bytes of a"), b = w.cap("b", "bytes of b");
  w.doc("INFO-2026-0003-two", {}, { captures: [a, b] });
  w.unit(a.sha, "INFO-2026-0003-two", 0, "The budget line is set."); w.unit(b.sha, "INFO-2026-0003-two", 0, "The budget is final.");
  const ans = find(w, { ids: ["INFO-2026-0003-two"] });
  assert.equal(ans.scope.captures, 2);
  assert.equal(ans.captures_read, 2);
  assert.deepEqual(ans.kinds[0].items.map((i) => i.capture_sha).sort(), [a.sha, b.sha].sort());
  /* a three-part capture in a project only ann sees: vera's find over it holds nothing, and counts nothing */
  const m = heldInParts(w, "INFO-2026-0004-big", "d");
  const p = w.project("Private", "ann", { captures: [] });
  w.st.sql.exec(`UPDATE bundles SET project = ? WHERE bundle_id = ?`, p, "INFO-2026-0004-big");
  assert.ok(m.whole);
  const hidden = find(w, { ids: ["INFO-2026-0004-big"] });
  assert.equal(hidden.scope.captures, 0, "a hidden bundle's capture is counted nowhere");
});
