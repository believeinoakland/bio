/* R2's producers at conditionItems' interface (R1), copied from queue-producers' `producers.test.mjs` (its R3; K1850):
   every CONDITION kind R2 derives, each from its provider's published fact, gated by the viewer and homed through the
   walk queue passes in (queue R7). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

test("R2: governor-holding-host, its documents gathered at most 16, past which the home set states subject_bound", () => {
  const w = world({ governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 1000, refusals: 2, last_refusal_status: 429 }] } });
  for (let i = 0; i < 17; i++) {
    const b = `INF-${String(i).padStart(2, "0")}`; w.bundle(b);
    w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES (?,?,?,'utf8',?,1)`, `c${i}`, b, "snapshots/x", iso(NOW));
    w.run(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations) VALUES (?,?,?,?,?,?,1)`,
      `https://h.example/${i}`, `https://h.example/${i}`, `c${i}`, "direct", iso(NOW), iso(NOW));
  }
  const it = byId(w.read(null, "class:admin"))["CONDITION::governor-holding-host::h.example"];
  assert.equal(it.case.state, "undetermined"); assert.ok(it.case.reasons.includes("subject_bound"));
  assert.equal(it.subject.bundles.length, 8);
  assert.equal(it.basis.retry_in_ms, 1000);
});

test("R2: partial-capture-outstanding per live session; capture-completed-unattended per machine-completed bundle and per completed request", () => {
  const w = world({ capture: { liveCaptureSessions: () => [{ session: "S1", locator: "https://x.example/", primarySha: "p1",
      created: iso(NOW - 10), updated: iso(NOW), expires: iso(NOW + 10), ticks: 2, state: { queue: [1, 2], discovered: 5, spent: 3 } }] },
    provenance: { homeOf: (s) => (s === "p1" ? { bundleId: "INF-P" } : null) },
    captureRequests: { completed: () => ({ requests: [{ request: "CR-9", run: "r", target: "INQ-1", address: "https://y.example/",
      host: "y.example", purpose: "investigate", ua_mode: "civicos", capture_sha: "z", captured_at: iso(NOW - 1),
      attribution: { ok: true, statement: "the daemon captured this" } }] }) } });
  w.bundle("INF-P"); w.bundle("INF-U"); w.bundle("INQ-1", "inquiry");
  const man = (key, author, created) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json) VALUES ('INF-U',?, 'revision', 'b', ?, ?, '[]')`, key, author, created);
  man("k1", "alice", iso(NOW - 100)); man("k2", "token:daemon", iso(NOW - 50));
  const m = byId(w.read(null, "class:admin"));
  const p = m["CONDITION::partial-capture-outstanding::S1"];
  assert.deepEqual([p.subject.kind, p.subject.id, p.basis.outstanding], ["bundle", "INF-P", 2]);
  const u = m["CONDITION::capture-completed-unattended::INF-U"];
  assert.deepEqual([u.basis.started_by, u.basis.completed_by], ["alice", "token:daemon"]);
  assert.ok(m["CONDITION::capture-completed-unattended::CR-9"]);
});

test("R2: render-deferred per held or expired render, its reason the code's own translation", () => {
  const w = world({ captureRequests: { rendersHeld: () => ({ requests: [
    { request: "CR-1", target: "INQ-1", address: "https://a.example/", state: "requested", code: "RENDER_NO_RENDERER", requested_at: iso(NOW), expires: iso(NOW + 5) },
    { request: "CR-2", target: "INQ-1", address: "https://b.example/", state: "expired", code: "RENDER_DEFERRED", requested_at: iso(NOW), expires: iso(NOW) }] }) } });
  const m = byId(w.read(null, "class:admin"));
  assert.equal(m["CONDITION::render-deferred::CR-1"].basis.render.state, "deferred");
  assert.equal(m["CONDITION::render-deferred::CR-1"].basis.check, "C-83.3");
  assert.equal(m["CONDITION::render-deferred::CR-2"].basis.render.state, "expired");
});

test("R2 (N229, N330): archive-fallback-eligible per address monitoring.archiveEligible answers; monitoring-recheck-due when overdue past its interval or unscheduled", () => {
  const H = 3600000;
  let askedAt = null;
  const w = world({
    monitoring: { archiveEligible: (now) => { askedAt = now; return { ok: true, limit: 50, truncated: true, paused: { paused: true, by: "ada" },
                    eligible: [{ address: "https://gone.example/a", first_failure_since: iso(NOW - 86400000), reachability: { fallback_eligible: true } }] }; },
                  monitoring: () => ({ ok: true, truncated: false, items: [
      { state: "due", bundle: "INF-1", address: "https://late.example/", due_at: iso(NOW - 3 * H), interval_ms: H, frequency: "hourly" },
      { state: "due", bundle: "INF-2", address: "https://soon.example/", due_at: iso(NOW - H / 2), interval_ms: H, frequency: "hourly" },
      { state: "due", bundle: "INF-3", address: "https://never.example/", due_at: null, frequency: null },
      { state: "unscheduled", bundle: "INF-4", address: null, reason: "no frequency declared" },
      { state: "scheduled", bundle: "INF-5", address: "https://ok.example/", next_at: iso(NOW + H), interval_ms: H }] }) } });
  for (const b of ["INF-1", "INF-2", "INF-3", "INF-4", "INF-5", "INF-G"]) w.bundle(b);
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('cg','INF-G','snapshots/x','utf8',?,1)`, iso(NOW));
  w.run(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations) VALUES (?,?,?,?,?,?,1)`,
    "https://gone.example/a", "https://gone.example/a", "cg", "direct", iso(NOW), iso(NOW));
  const m = byId(w.read(null, "class:admin"));
  assert.equal(askedAt, NOW, "asked at the read's own instant");
  const kinds = (k) => Object.keys(m).filter((id) => id.startsWith(`CONDITION::${k}::`)).sort();
  assert.deepEqual(kinds("archive-fallback-eligible"), ["CONDITION::archive-fallback-eligible::https://gone.example/a"]);
  const a = m["CONDITION::archive-fallback-eligible::https://gone.example/a"];
  assert.deepEqual(a.subject.bundles, ["INF-G"]);
  assert.deepEqual([a.basis.source, a.basis.bound, a.basis.paused], ["monitoring.archiveEligible", { limit: 50, truncated: true }, { paused: true, by: "ada" }]);
  assert.deepEqual(a.basis.reachability, { fallback_eligible: true });
  assert.equal(a.age.ms, 86400000);
  assert.deepEqual(kinds("monitoring-recheck-due"),
    ["CONDITION::monitoring-recheck-due::INF-4", "CONDITION::monitoring-recheck-due::https://late.example/"]);
  assert.equal(m["CONDITION::monitoring-recheck-due::https://late.example/"].age.ms, 3 * H);
  const w2 = world({ monitoring: { archiveEligible: () => ({ ok: false, eligible: [], limit: 50, truncated: false, paused: { paused: false } }) } });
  assert.ok(!w2.read(null, "class:admin").items.some((i) => i.kind === "archive-fallback-eligible"));
});
