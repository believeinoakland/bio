/* R2's producers at conditionItems' interface (R1), copied from queue-producers' `producers.test.mjs` (its R3; K1850):
   every CONDITION kind R2 derives, each from its provider's published fact, gated by the viewer and homed through the
   walk queue passes in (queue R7). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso, READS } from "./world.mjs";
import { homeOfHomed, sha } from "../provenance/fixtures.mjs";
import { word } from "../../../src/setup-words/index.mjs";

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
  const w = world({ capture: { liveCaptureSessions: () => [{ session: "S1", locator: "https://x.example/", primarySha: sha("p1"),
      created: iso(NOW - 10), updated: iso(NOW), expires: iso(NOW + 10), ticks: 2, state: { queue: [1, 2], discovered: 5, spent: 3 } }] },
    provenance: homeOfHomed({ [sha("p1")]: "INF-P" }),
    captureRequests: { completed: () => ({ requests: [{ request: "CR-9", run: "r", target: "INQ-1", address: "https://y.example/",
      host: "y.example", purpose: "investigate", ua_mode: "civicos", capture_sha: "z", captured_at: iso(NOW - 1),
      attribution: { ok: true, statement: "the daemon captured this" } }] }) } });
  w.bundle("INF-P"); w.bundle("INF-U"); w.bundle("INQ-1", "inquiry");
  /* R14: a machine-completed document holds a capture (its register row) */
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('cu','INF-U','snapshots/u','utf8',?,1)`, iso(NOW));
  const man =(key, author, created) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json) VALUES ('INF-U',?, 'revision', 'b', ?, ?, '[]')`, key, author, created);
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
  const { monitoring: plan, archiveEligible: page, bundles, addresses } = READS.seeded;
  const GONE = addresses.gone, AT = READS.seeded.now;   /* the instant monitoring's fixture reads at: the read is made then */
  const dueItem = plan.items.find((i) => i.state === "due"), scheduled = plan.items.find((i) => i.state === "scheduled");
  const unscheduled = plan.items.find((i) => i.state === "unscheduled");
  let askedAt = null;
  /* monitoring's real answers; only what the test varies is set: the page's bound and pause, and two due items' instants (the
     real fixture's due item has never been checked: no instant, so never overdue) */
  const w = world({
    monitoring: { archiveEligible: (now) => { askedAt = now; return { ...page, truncated: true, paused: { paused: true, by: "ada" } }; },
                  monitoring: () => ({ ...plan, items: [
      { ...dueItem, bundle: "INF-1", address: "https://late.example/", due_at: iso(AT - 3 * H), interval_ms: H },
      { ...dueItem, bundle: "INF-2", address: "https://soon.example/", due_at: iso(AT - H / 2), interval_ms: H },
      dueItem,
      { ...unscheduled, bundle: "INF-4" },
      scheduled] }) } });
  for (const b of ["INF-1", "INF-2", bundles.due, "INF-4", scheduled.bundle, "INF-G"]) w.bundle(b);
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('cg','INF-G','snapshots/x','utf8',?,1)`, iso(NOW));
  w.run(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations) VALUES (?,?,?,?,?,?,1)`,
    GONE, GONE, "cg", "direct", iso(NOW), iso(NOW));
  const m = byId(w.read(null, "class:admin", { now: AT }));
  assert.equal(askedAt, AT, "asked at the read's own instant");
  const kinds = (k) => Object.keys(m).filter((id) => id.startsWith(`CONDITION::${k}::`)).sort();
  assert.deepEqual(kinds("archive-fallback-eligible"), [`CONDITION::archive-fallback-eligible::${GONE}`]);
  const a = m[`CONDITION::archive-fallback-eligible::${GONE}`];
  assert.deepEqual(a.subject.bundles, ["INF-G"]);
  assert.deepEqual([a.basis.source, a.basis.bound, a.basis.paused], ["monitoring.archiveEligible", { limit: 50, truncated: true }, { paused: true, by: "ada" }]);
  assert.deepEqual(a.basis.reachability, page.eligible[0].reachability);
  assert.equal(a.age.ms, AT - Date.parse(page.eligible[0].first_failure_since));
  assert.deepEqual(kinds("monitoring-recheck-due"),
    ["CONDITION::monitoring-recheck-due::INF-4", "CONDITION::monitoring-recheck-due::https://late.example/"]);
  assert.equal(m["CONDITION::monitoring-recheck-due::https://late.example/"].age.ms, 3 * H);
  /* an answer monitoring marks not ok names no address, whatever list it carries */
  // fixtures-own: synthetic monitoring's fixtures publish no not-ok archiveEligible answer (only flaggedRefusal for flagged); this is monitoring's real eligible page with `ok` turned false, to show the list is not read from an answer marked not ok
  const w2 = world({ monitoring: { archiveEligible: () => ({ ...page, ok: false }) } });
  assert.ok(!w2.read(null, "class:admin", { now: AT }).items.some((i) => i.kind === "archive-fallback-eligible"));
});
