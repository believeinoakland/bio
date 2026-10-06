/* conditionItems (R1) at its interface over every kind this module derives, and the invariants over them all: no hidden
   bundle (R6), a CONDITION only where a member's act can change it (R7), no place named (R8), the words members see
   (R9, with DEC-149's re-worded sentences), and the local day (R10). Adapted from queue-producers' `feeditems.test.mjs`
   (its R11–R13, R24), `sweeps.test.mjs` (its R8 over R26, R27) and `localday.test.mjs` (its R36's R27 share), which
   drive the same producers through `feedItems` (K1850; seam read §5). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { MachineryProducers } from "../../../src/machinery-producers/index.mjs";
import { MACHINE_AUTHOR_PREFIX } from "../../../src/record-grammar/actors.mjs";

const DAY = 86400000;
const SWEEP_KINDS = ["sweep-held-backlog", "sweep-yield-anomaly", "sweep-seed-unreachable", "sweep-redirect-out-of-scope", "sweep-silent"];
const KINDS = ["governor-holding-host", "partial-capture-outstanding", "capture-completed-unattended", "render-deferred",
  "archive-fallback-eligible", "monitoring-recheck-due", ...SWEEP_KINDS,
  "notice-attestation-missed", "notice-lapse-near", "notice-project-closed"];

const notice = (id, status, extra = {}) => ({ notice: id, status, opened_at: "2026-05-01T10:00:00Z", revisions: [],
  attestations: [{ kind: "posted", as_of: "2026-05-01", published_at: "2026-05-01T10:00:00Z", json: { activity: { level: "Active" } } }],
  level: null, next_monthly: status === "open" ? "2026-10-01" : null, lapse_date: null, missed_monthlies: [], ...extra });
const allFive = (sweep, at = iso(NOW - 3 * DAY)) => [
  { sweep, kind: "sweep-held-backlog", since: at, detail: { backlog: 40, limit: 40 } },
  { sweep, kind: "sweep-yield-anomaly", since: at, detail: { filed: 30, median: 3 } },
  { sweep, kind: "sweep-seed-unreachable", since: at, detail: { seeds: [{ seed: "https://x.example/list", reachability: { state: "fetch_failed" } }] } },
  { sweep, kind: "sweep-redirect-out-of-scope", since: at, detail: { redirects: [{ address: "https://x.example/a", target: "https://y.example/b" }] } },
  { sweep, kind: "sweep-silent", since: null, detail: { runs: 4 } }];

/* A world in which every producer has something to say: every kind R2–R5 derive, for olga, an owner of PRJ-1. */
function busy(extra = {}) {
  const w = world({
    governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 5, refusals: 1, last_refusal_at: NOW - 10 }] },
    capture: { liveCaptureSessions: () => [{ session: "S1", locator: "https://x.example/", primarySha: "p1", created: iso(NOW),
      updated: iso(NOW), expires: iso(NOW + 10), ticks: 1, state: { queue: [1] } }] },
    provenance: { homeOf: (sha) => (sha === "p1" ? { bundleId: "INF-1" } : null) },
    captureRequests: {
      completed: () => ({ requests: [{ request: "CR-C", run: "r", target: "INQ-S", address: "https://y.example/", host: "y.example",
        purpose: "investigate", ua_mode: "civicos", capture_sha: "cap1", captured_at: iso(NOW), attribution: { ok: true, statement: "s" } }] }),
      rendersHeld: () => ({ requests: [{ request: "CR-R", target: "INQ-S", address: "https://a.example/", state: "requested",
        code: "RENDER_DEFERRED", requested_at: iso(NOW), expires: iso(NOW + 5) }] }) },
    monitoring: {
      monitoring: () => ({ ok: true, truncated: false, items: [{ state: "unscheduled", bundle: "INF-1", address: null, reason: "none" }] }),
      archiveEligible: () => ({ ok: true, limit: 50, truncated: false, paused: { paused: false },
        eligible: [{ address: "https://gone.example/a", first_failure_since: iso(NOW) }] }) },
    linkSweep: { sweepConditions: () => ({ ok: true, conditions: allFive("GATH-1#agendas") }) },
    networkNotices: { noticesOf: ({ project }) => ({ ok: true, project, sealed_weeks: [], methodVersion: 1, notices: project !== "PRJ-1" ? [] : [
      notice("WO-1", "open", { missed_monthlies: [{ month: "2026-08", at: "2026-08-01T00:00:00Z" }], lapse_date: "2026-09-05" }),
      notice("WO-3", "closed", { attestations: [{ kind: "closed", as_of: "2026-08-20", published_at: "2026-08-20T00:00:00Z" }] })] }) },
    ...extra,
  });
  w.member("olga");
  w.bundle("PRJ-1", "project", { title: "Contracts" }); w.bundle("INQ-S", "inquiry"); w.bundle("INF-1"); w.bundle("INF-U");
  w.bundle("GATH-1", "information", { title: "Council agendas" });
  w.run(`UPDATE bundles SET project='PRJ-1' WHERE bundle_id='GATH-1'`);
  w.join("PRJ-1", "olga", { owner: true });
  w.cite("PRJ-1", "INQ-S"); w.leg("INQ-S", "INF-1"); w.cite("INQ-S", "GATH-1");
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('cap1','INF-1','snapshots/x','utf8',?,1)`, iso(NOW));
  w.run(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations) VALUES (?,?,?,?,?,?,1)`,
    "https://gone.example/a", "https://gone.example/a", "cap1", "direct", iso(NOW), iso(NOW));
  const man = (key, author, created) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json)
    VALUES ('INF-U', ?, 'revision', 'b', ?, ?, '[]')`, key, author, created);
  man("k1", "olga", iso(NOW - 100)); man("k2", `${MACHINE_AUTHOR_PREFIX}daemon`, iso(NOW - 50));
  return w;
}

/* Every string a member reads on an item: its summary and detail, the words of its options, and every sentence under it
   (its basis, its age, its excluded homes), never its id, class or kind. */
function memberWords(item) {
  const out = [];
  const walk = (v, key) => {
    if (typeof v === "string") { if (!["id", "class", "kind", "source", "reason", "recipients_rule"].includes(key)) out.push([key, v]); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, key); return; }
    if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  for (const [k, v] of Object.entries(item)) if (!["id", "class", "kind", "case"].includes(k)) walk(v, k);
  for (const a of (item.case && item.case.excluded) || []) walk(a.detail, "detail");
  return out;
}

test("R1: conditionItems answers every item R2–R5 derive, each homed through homesOf and offered optionsOf, none carrying disposition or catalogue_id, and writes nothing", () => {
  const w = busy();
  const before = w.statements.length;
  const r = w.read("olga");
  assert.deepEqual(Object.keys(r), ["items"], "the answer is {items}");
  assert.deepEqual([...new Set(r.items.map((i) => i.kind))].sort(), [...KINDS].sort(), "every kind R2–R5 derive");
  for (const it of r.items) {
    assert.equal(it.class, "CONDITION", it.id);
    assert.ok(it.id.startsWith(`CONDITION::${it.kind}::`), it.id);
    assert.ok(!("disposition" in it) && !("catalogue_id" in it), `${it.id}: the mint's and queue's`);
    assert.equal(it.case.state, "determined", it.id);
    assert.ok(Array.isArray(it.options), it.id);
  }
  const m = byId(r);
  /* homed through the walk passed in: the sweep's project at depth 0 and the walk from its bundle (queue R7) */
  assert.deepEqual(m["CONDITION::sweep-silent::GATH-1#agendas"].case.ancestors.map((a) => [a.id, a.depth]), [["INQ-S", 1], ["PRJ-1", 0]]);
  assert.deepEqual(m["CONDITION::capture-completed-unattended::CR-C"].case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 1]]);
  assert.ok(w.asked.homes.some((s) => s.length === 1 && s[0] === "GATH-1"), "the walk asked from the sweep's bundle");
  assert.deepEqual(m["CONDITION::notice-attestation-missed::WO-1"].options, [{ id: "opt", on: ["PRJ-1"] }], "options are optionsOf's");
  assert.deepEqual(m["CONDITION::render-deferred::CR-R"].options, [{ id: "opt", on: ["INQ-S"] }]);
  assert.ok(!w.statements.slice(before).some((q) => /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(q)), "it writes nothing");
  /* without the walk, nothing is given a home it was not handed, and nothing is offered */
  const bare = w.read("olga", "member:olga", { homes: false, options: false });
  assert.equal(bare.items.length, r.items.length);
  for (const it of bare.items) {
    assert.deepEqual(it.case.ancestors.filter((a) => a.depth > 0), [], it.id);
    assert.ok(it.options.every((o) => o.id !== "opt"), it.id);
  }
  /* the functions are held for one read only: a later read without them is not homed by an earlier read's walk */
  w.read("olga");
  assert.ok(w.read("olga", "member:olga", { homes: false }).items.every((it) => it.case.ancestors.every((a) => a.depth === 0)));
});

test("R6: no answer names a bundle the viewer may not see, and no count reveals one", () => {
  const HID = "PRJ-H";
  const w = world({
    governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 5, refusals: 1 }] },
    capture: { liveCaptureSessions: () => [{ session: "S1", locator: "https://h.example/1", primarySha: "c-h", created: iso(NOW),
      updated: iso(NOW), expires: iso(NOW + 10), ticks: 1, state: {} }] },
    provenance: { homeOf: (sha) => (sha === "c-h" ? { bundleId: HID } : null) },
    captureRequests: { completed: () => ({ requests: [{ request: "CR-1", run: "r", target: "INQ-S", address: "https://h.example/1",
      host: "h.example", purpose: "investigate", ua_mode: "civicos", capture_sha: "c-h", captured_at: iso(NOW), attribution: { ok: true, statement: "s" } }] }) },
    monitoring: { archiveEligible: () => ({ ok: true, limit: 50, truncated: false, paused: { paused: false },
      eligible: [{ address: "https://h.example/1", first_failure_since: iso(NOW) }] }) },
    linkSweep: { sweepConditions: () => ({ ok: true, conditions: allFive(`${HID}#s`) }) },
  });
  w.member("alice"); w.bundle(HID, "project"); w.bundle("INF-V"); w.bundle("INQ-S", "inquiry"); w.bundle("PRJ-A", "project");
  w.join("PRJ-A", "alice", { owner: true }); w.cite("PRJ-A", "INQ-S"); w.cite(HID, "INF-V"); w.cite(HID, "INQ-S");
  for (const [sha, b] of [["c-h", HID], ["c-v", "INF-V"]]) {
    w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES (?,?,?,'utf8',?,1)`, sha, b, "snapshots/x", iso(NOW));
    w.run(`INSERT INTO captured_locators (address_norm, address, capture_sha, via, first_retrieved, last_retrieved, observations) VALUES (?,?,?,?,?,?,1)`,
      "https://h.example/1", "https://h.example/1", sha, "direct", iso(NOW), iso(NOW));
  }
  const man = (key, author) => w.run(`INSERT INTO manifest (bundle_id, snap_key, kind, base, author, created, files_json) VALUES (?,?, 'revision', 'b', ?, ?, '[]')`, HID, key, author, iso(NOW));
  man("k1", "alice"); man("k2", "token:daemon");
  const r = w.read("alice");
  assert.ok(!JSON.stringify(r).includes(HID), "the hidden project is named nowhere");
  const m = byId(r);
  assert.deepEqual(m["CONDITION::governor-holding-host::h.example"].subject.bundles, ["INF-V"], "only the documents she sees, counted");
  assert.deepEqual(m["CONDITION::archive-fallback-eligible::https://h.example/1"].subject.bundles, ["INF-V"]);
  assert.equal(m["CONDITION::partial-capture-outstanding::S1"], undefined, "a condition about a hidden bundle is withheld whole");
  assert.equal(m[`CONDITION::capture-completed-unattended::${HID}`], undefined);
  assert.deepEqual(m["CONDITION::capture-completed-unattended::CR-1"].basis.grade_notes, [], "a hidden capture carries no note");
  assert.ok(!r.items.some((i) => /^sweep-/.test(i.kind)), "a sweep whose bundle she may not see is no item");
  /* an operator credential the gate does not filter sees it, so the fixture is not empty by accident */
  assert.ok(JSON.stringify(w.read(null, "class:admin")).includes(HID));
});

test("R7: a CONDITION earns an item only where a member's act can change it: its options are the acts on the documents behind it, or the act that answers it", () => {
  const w = busy();
  const r = w.read("olga");
  for (const it of r.items) {
    if (it.kind === "notice-lapse-near" || it.kind === "notice-project-closed") {
      assert.deepEqual(it.options.map((o) => o.id), ["noticeprepare"], `${it.id}: a revision or a stop answers it`);
      continue;
    }
    const docs = it.subject.kind === "bundle" ? [it.subject.id]
      : it.subject.kind === "notice" ? [it.subject.project]
      : it.subject.kind === "capture_request" ? ["INQ-S"]
      : it.subject.bundles || [it.subject.id];
    assert.deepEqual(it.options, docs.length ? [{ id: "opt", on: docs }] : [], it.id);
  }
  assert.deepEqual(byId(r)["CONDITION::governor-holding-host::h.example"].options, [], "a host with no documents offers nothing");
  /* a condition whose fact stops holding leaves, for every member at once */
  w.fakes.governor.governorHolding = () => [];
  w.fakes.linkSweep.sweepConditions = () => ({ ok: true, conditions: [] });
  const after = w.read("olga");
  assert.ok(!after.items.some((i) => i.kind === "governor-holding-host" || /^sweep-/.test(i.kind)));
});

test("R8: no place is named in this module's behaviour or outward text", () => {
  const text = JSON.stringify(busy().read("olga"));
  for (const place of ["Oakland", "California", "Alameda", "CPRA", "Brown Act", "Sunshine", "San Francisco", "Berkeley"])
    assert.ok(!text.includes(place), place);
  /* the windows are counted in the zone actions holds, whichever it is: none is built in */
  for (const zone of ["Pacific/Auckland", "Europe/Lisbon"]) {
    const m = byId(busy({ actions: { place: () => ({ time_zone: { value: zone, status: "ruled", basis: "TEST" } }) } }).read("olga"));
    assert.equal(m["CONDITION::notice-attestation-missed::WO-1"].basis.zone, zone);
  }
});

test("R9 (DEC-107, DEC-131; H15, H19): no member-facing sentence of any item says 'obligation', 'condition' or 'signal'; the codes, kinds and ids are unchanged", () => {
  const w = busy();
  const r = w.read("olga");
  const noZone = busy({ actions: { place: () => ({ time_zone: null }) } }).read("olga");
  for (const it of [...r.items, ...noZone.items]) {
    for (const [key, s] of memberWords(it))
      assert.doesNotMatch(s, /\b(obligation|condition|signal)s?\b/i, `${it.id} ${key}: "${s}"`);
    assert.equal(it.class, "CONDITION", it.id);
    assert.ok(it.id.startsWith("CONDITION::"), it.id);
  }
  const m = byId(r);
  /* the re-worded sentences (T34-54's share, N550): a status is our own machinery's fact */
  assert.match(m["CONDITION::governor-holding-host::h.example"].basis.detail, /^a status is a fact about OUR OWN machinery \(D-103\/D-95\)/);
  assert.match(m["CONDITION::render-deferred::CR-R"].basis.detail, /^a status is a fact about OUR OWN machinery \(D-491/);
  assert.match(m["CONDITION::sweep-held-backlog::GATH-1#agendas"].basis.detail, /^a sweep's status is link-sweep's \(its R8, R11\)/);
  assert.deepEqual(m["CONDITION::sweep-silent::GATH-1#agendas"].age,
    { state: "undetermined", reason: "no_condition_instant", detail: "the sweep's status carries no instant this producer can read" });
  /* the codes unchanged */
  assert.deepEqual(m["CONDITION::sweep-silent::GATH-1#agendas"].age.reason, "no_condition_instant");
  assert.equal(m["CONDITION::sweep-held-backlog::GATH-1#agendas"].basis.source, "link-sweep.sweepConditions");
  assert.deepEqual([...MachineryProducers.SWEEP_CONDITION_KINDS].sort(), [...SWEEP_KINDS].sort());
});

test("R9 (DEC-149; T34-87): each member-facing sentence that named the copy says 'your group's Civicsmith'; the developer-facing doctrine keeps 'this instance's'", () => {
  const m = byId(busy().read("olga"));
  const missed = m["CONDITION::notice-attestation-missed::WO-1"].detail;
  assert.ok(missed.startsWith("no instance key was bound when it fell due, so your group's Civicsmith could not sign the notice's activity level."), missed);
  const closed = m["CONDITION::notice-project-closed::WO-3"].detail;
  assert.ok(closed.startsWith("your group's Civicsmith signed the closing into the notice's public record."), closed);
  assert.equal(MachineryProducers.ZONE_UNDETERMINED, "no time zone is held for it by your group's Civicsmith, so the local day it is "
    + "counted from is undetermined; it is never counted on the UTC day");
  const none = byId(busy({ actions: { place: () => ({ time_zone: null }) } }).read("olga"));
  assert.equal(none["CONDITION::notice-attestation-missed::WO-1"].age.detail, MachineryProducers.ZONE_UNDETERMINED, "the copied sentence, as a member reads it");
  /* every other member-facing sentence names no copy, instance or plane; a sentence carrying doctrine ids (D-, DEC-, REC-)
     is developer-facing (the DEC-149 grep's class), and keeps its words */
  /* render-deferred carries C-83's own translation whole (R2: "its reason is the code's own translation"): those words are
     the minting module's, read and never re-typed here, so they are taken out before the check */
  for (const it of Object.values(m)) {
    const carried = it.kind === "render-deferred" && it.basis.translation ? it.basis.translation : null;
    for (const [key, s] of memberWords(it))
      if (!/\b(D|DEC|REC)-\d/.test(s))
        assert.doesNotMatch(carried ? s.split(carried).join("") : s, /\b(this|the|our) (copy|instance|plane)\b/i, `${it.id} ${key}: "${s}"`);
  }
  assert.match(m["CONDITION::governor-holding-host::h.example"].basis.detail, /this instance's governor is holding the host/);
  assert.match(m["CONDITION::render-deferred::CR-R"].basis.detail, /this instance's renderer/);
});

/* R10: the instant 2026-09-01T00:00:00Z is 2026-08-31 17:00 in Los Angeles, where the UTC day and the local day differ. */
const LA = "America/Los_Angeles";
function zoned(zone) {
  const w = world({
    actions: { place: () => (zone === null ? { time_zone: null } : { time_zone: { value: zone, status: "ruled", basis: "TEST" } }) },
    networkNotices: { noticesOf: ({ project }) => ({ ok: true, project, sealed_weeks: [], methodVersion: 1, notices: project !== "PRJ-1" ? [] : [
      notice("WO-NEAR", "open", { lapse_date: "2026-09-07" }),
      notice("WO-EDGE", "open", { lapse_date: "2026-09-08" }),
      notice("WO-MISS", "open", { missed_monthlies: [{ month: "2026-08", at: "2026-08-01T00:00:00Z" }] }),
      notice("WO-CLOSED", "closed", { attestations: [{ kind: "closed", as_of: "2026-08-02", json: {} }] })] }) },
  });
  w.member("alice"); w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice", { owner: true });
  return w;
}

test("R10: west of UTC at the day boundary, R5's windows and an item's age in days are the local day in the instance's zone, never the UTC day", () => {
  const ms = (s) => Date.parse(s);
  const m = byId(zoned(LA).read("alice"));
  /* the lapse window opens 7 local days before the lapse; the local day is 2026-08-31, so a lapse on 2026-09-08 is not yet
     within it (the UTC day, 2026-09-01, would have raised it), and one on 2026-09-07 is */
  assert.deepEqual(m["CONDITION::notice-lapse-near::WO-NEAR"].age,
    { state: "determined", since: "2026-08-31T07:00:00Z", ms: 17 * 3600000, days: 0 }, "aged from the local day the window opened");
  assert.equal(m["CONDITION::notice-lapse-near::WO-EDGE"], undefined, "8 local days away: not yet within the window");
  assert.equal(m["CONDITION::notice-lapse-near::WO-NEAR"].basis.zone, LA, "the zone the day was taken in is stated");
  /* 30 local days from a closing stated only as a day: 2026-08-02 to 2026-08-31 is 29, so it stands (UTC: 30, gone) */
  assert.deepEqual(m["CONDITION::notice-project-closed::WO-CLOSED"].age,
    { state: "determined", since: "2026-08-02T07:00:00Z", ms: NOW - ms("2026-08-02T07:00:00Z"), days: 29 });
  /* an instant's age in days is counted on local days: 2026-08-01T00:00Z is 2026-07-31 in Los Angeles */
  assert.equal(m["CONDITION::notice-attestation-missed::WO-MISS"].age.days, 31);
  /* one local day later, the edge cases turn */
  const later = byId(zoned(LA).read("alice", "member:alice", { now: ms("2026-09-01T07:00:00Z") }));
  assert.ok(later["CONDITION::notice-lapse-near::WO-EDGE"], "at local midnight of 2026-09-01 the window opens");
  assert.equal(later["CONDITION::notice-project-closed::WO-CLOSED"], undefined, "and the thirtieth local day has come");
});

test("R10: with no zone held, the day and the age are undetermined, stated, never computed on UTC", () => {
  for (const zone of [null, "Mars/Olympus_Mons"]) {
    const m = byId(zoned(zone).read("alice"));
    const why = (it) => [it.age.state, it.age.reason];
    const undetermined = ["undetermined", "zone_undetermined"];
    /* no item is withheld for want of a zone: the lapse window is read at the latest local day any zone has reached */
    assert.ok(m["CONDITION::notice-lapse-near::WO-EDGE"], `${zone}: possibly within 7 days somewhere: raised, its age undetermined`);
    assert.deepEqual(why(m["CONDITION::notice-lapse-near::WO-EDGE"]), undetermined);
    assert.match(m["CONDITION::notice-lapse-near::WO-EDGE"].age.detail, /never counted on the UTC day/);
    assert.equal(m["CONDITION::notice-lapse-near::WO-EDGE"].basis.zone, null, "no zone is stated as none");
    assert.ok(m["CONDITION::notice-project-closed::WO-CLOSED"], "a closing stated as a day stands while its 30 days cannot be counted");
    assert.deepEqual(why(m["CONDITION::notice-project-closed::WO-CLOSED"]), undetermined);
    assert.deepEqual(why(m["CONDITION::notice-attestation-missed::WO-MISS"]), undetermined);
    assert.ok(!JSON.stringify(Object.values(m).map((i) => i.age)).includes("T00:00:00Z"), "no age is dated at a UTC midnight");
  }
});
