/* R41 (content R41, K180): a re-read that stales content rows tells the inquiries whose legs rest on them, once per
   re-read, through the obligation's registration; nothing moves by itself. Driven through content's own `markStale`. */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";

const A = "INFO-2026-0001-a";
const OLD = [{ step: "layer", tier: 1, container: "pdf", cap: null, measured_by: null, calibration: null }];
const NEW = [{ step: "layer", tier: 2, container: "pdf", cap: null, measured_by: null, calibration: null }];

test("R41 the legs resting on each affected or undetermined row are found, and each citing inquiry is told once, cause restaled", () => {
  const w = world(); const [cap] = w.doc(A); w.listen();
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }] });
  w.inquiry("INQ-2026-0002-r", { legs: [{ target: A }, { target: A, note: "twice" }] });
  const cid = w.row(`SELECT content_id FROM inquiry_basis WHERE bundle_id='INQ-2026-0001-q'`).content_id;
  w.st.sql.exec(`UPDATE content SET chain=? WHERE content_id=?`, JSON.stringify(OLD), cid);
  const n = w.content.markStale(cap, NEW);
  assert.equal(n, 1);
  assert.deepEqual(w.raisedCalls.map((c) => [c.target, c.cause]), [["INQ-2026-0001-q", "restaled"], ["INQ-2026-0002-r", "restaled"]],
                   "once per citing inquiry, never per leg or per row");
  assert.ok(w.raisedCalls.every((c) => c.since === w.raisedCalls[0].since));
  assert.equal(w.fm("INQ-2026-0001-q").current_state, "open", "nothing moves by itself");
  assert.equal(w.row(`SELECT content_id FROM inquiry_basis WHERE bundle_id='INQ-2026-0001-q'`).content_id, cid, "the leg keeps its row");
});

test("R41 the rows past the notice's bound are told too; a notice naming no row tells nobody; with nothing registered it only answers", () => {
  const w = world(); const [cap] = w.doc(A);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }] });
  const cid = w.row(`SELECT content_id FROM inquiry_basis`).content_id;
  w.st.sql.exec(`UPDATE content SET stale=1 WHERE content_id=?`, cid);
  const unregistered = w.k.staled({ capture_sha: cap, rows: [], ungraded: 1, ungraded_after: "0" });
  assert.deepEqual(unregistered.citing.map((l) => l.bundle_id), ["INQ-2026-0001-q"], "past the bound, found by the capture's stale rows");
  assert.deepEqual(unregistered.told, [], "nothing registered: nothing is told and nothing written");
  assert.deepEqual(w.k.staled({ capture_sha: cap, rows: [], ungraded: 0 }).citing, []);
  assert.deepEqual(w.k.staled(null).citing, [], "never throws into content's transaction");
});
