/* R41 (content R41, K180): a re-read that stales content rows tells the inquiries whose legs rest on them, once per
   re-read, through the obligation's registration; nothing moves by itself. Driven through content's own `markStale`. */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { STALE_PAGE } from "../../../src/inquiry/index.mjs";

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

test("R41 R42 a re-read carries the listener's own failures; a listener that throws is named, and nothing throws into content's transaction", () => {
  const w = world(); const [cap] = w.doc(A);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }] });
  w.inquiry("INQ-2026-0002-r", { legs: [{ target: A }] });
  const cid = w.row(`SELECT content_id FROM inquiry_basis WHERE bundle_id='INQ-2026-0001-q'`).content_id;
  w.k.onRaised("reevaluation", ({ target }) => {
    if (target === "INQ-2026-0002-r") throw new Error("boom");
    return { raised: [{ bundle_id: "DEP", ord: 0 }], listeners_failed: ["intent"] };
  });
  const r = w.k.staled({ capture_sha: cap, rows: [{ content_id: cid }] });
  assert.deepEqual(r.told.map((t) => t.inquiry), ["INQ-2026-0001-q", "INQ-2026-0002-r"]);
  assert.deepEqual(r.reevaluation, { source: "restaled", since: r.since, raised: [{ bundle_id: "DEP", ord: 0 }],
                                     listeners_failed: ["intent", "reevaluation"] });
});

test("R41 the legs are read page by page, at most 500 per statement, until every leg resting on the notice's rows is read", () => {
  assert.equal(STALE_PAGE, 500);
  const w = world(); const [cap] = w.doc(A); w.listen();
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }] });
  const cid = w.row(`SELECT content_id FROM inquiry_basis`).content_id;
  /* 1,201 legs on the row across three inquiries, written to the projection directly to reach past two pages */
  const ins = (b, o) => w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id,ord,target_id,target_type,role,content_id)
                                        VALUES (?,?,?,'information','supports',?)`, b, o, A, cid);
  for (let o = 1; o < 700; o++) ins("INQ-2026-0001-q", o);
  w.inquiry("INQ-2026-0002-r"); w.inquiry("INQ-2026-0003-s");
  for (let o = 0; o < 500; o++) ins("INQ-2026-0002-r", o);
  ins("INQ-2026-0003-s", 0);
  const seen = [];
  const sql = w.st.sql, exec = sql.exec;
  sql.exec = (q, ...a) => { const r = exec.call(sql, q, ...a); if (/FROM inquiry_basis/.test(q) && /json_each/.test(q)) seen.push(r.length); return r; };
  const r = w.k.staled({ capture_sha: cap, rows: [{ content_id: cid }] });
  sql.exec = exec;
  assert.equal(r.citing.length, 1201);
  assert.ok(seen.length >= 3 && seen.every((n) => n <= 500), `pages ${seen}`);
  const keys = r.citing.map((l) => `${l.bundle_id}#${String(l.ord).padStart(4, "0")}`);
  assert.deepEqual(keys, [...keys].sort(), "in (bundle, ord) order, each once");
  assert.equal(new Set(keys).size, 1201);
  assert.deepEqual(w.raisedCalls.map((c) => c.target), ["INQ-2026-0001-q", "INQ-2026-0002-r", "INQ-2026-0003-s"], "each inquiry told once");
});

test("R41 the capture's stale rows past the notice's bound are read page by page too, every one of them", () => {
  const w = world(); const [cap] = w.doc(A);
  w.inquiry("INQ-2026-0001-q", { legs: [{ target: A }] });
  const ids = [];
  for (let i = 0; i < 1100; i++) {
    const id = `f${String(i).padStart(63, "0")}`;
    ids.push(id);
    w.st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at, stale)
                   VALUES (?, ?, ?, 'document', '{}', 'whole', 'plane', 't', 1)`, id, cap, A);
  }
  /* the last stale row past the bound carries the one leg */
  w.st.sql.exec(`UPDATE inquiry_basis SET content_id=? WHERE bundle_id='INQ-2026-0001-q'`, ids.at(-1));
  const seen = [];
  const sql = w.st.sql, exec = sql.exec;
  sql.exec = (q, ...a) => { const r = exec.call(sql, q, ...a); if (/FROM content WHERE capture_sha/.test(q)) seen.push(r.length); return r; };
  const r = w.k.staled({ capture_sha: cap, rows: [], ungraded: 1, ungraded_after: "e" });
  sql.exec = exec;
  assert.deepEqual(r.citing.map((l) => l.bundle_id), ["INQ-2026-0001-q"]);
  assert.ok(seen.length >= 3 && seen.every((n) => n <= 500), `pages ${seen}`);
});
