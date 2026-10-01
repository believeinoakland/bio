/* feedItems (R8) at its interface: what it answers, what it takes from queue, what it never carries; the bias debts
   (R1); the lead's take-up (R9); and the invariants over every producer (R10–R13), the Action layer's (R15–R19), the
   signing key's (R14) and the filing templates' and local facts' (R20, R21) among them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { viewerPredicate } from "../../../src/membership/index.mjs";

/* A world in which every producer has something to say, for the checks that range over all of them. */
function busy(extra = {}) {
  const drawing = (list) => Object.assign(list, { bound: 32, truncated: false });
  const w = world({
    bias: { uncleared: ({ limit }) => ({ limit, truncated: false,
      debts: [{ run: "r1", context_type: "inquiry", context_id: "INQ-S", recipients: [], raised: iso(NOW - 10) }] }) },
    progressions: { proposalsFeed: () => ({ instances: [], dispositions: [{ key: "p::old", state: "dismissed" }], proposals: [
      { key: "p::s", progression_key: "p", progression_label: "P", stage_key: "s", stage_label: "S", required: "always",
        definition_version: 1, n: 1, kinds: ["missing_predecessor"], grade: null, grade_determined: false, overdue: false,
        overdue_count: 0, surfaced_by: "machine", prior_disposition: null, instances: [{ progression_key: "p", entity_id: "E" }] }] }) },
    captureRequests: {
      leads: () => ({ requests: [{ request: "CR-L", run: "r", target: "INQ-A", lead_inquiry: "INQ-S", address: "https://x.example/d",
        host: "x.example", purpose: "investigate", ua_mode: "civicos", capture_sha: null, captured_at: iso(NOW),
        attribution: { ok: true, statement: "the daemon captured this" } }] }),
      completed: () => ({ requests: [{ request: "CR-C", run: "r", target: "INQ-S", address: "https://y.example/", host: "y.example",
        purpose: "investigate", ua_mode: "civicos", capture_sha: "z", captured_at: iso(NOW), attribution: { ok: true, statement: "s" } }] }),
      rendersHeld: () => ({ requests: [{ request: "CR-R", target: "INQ-S", address: "https://a.example/", state: "requested",
        code: "RENDER_DEFERRED", requested_at: iso(NOW), expires: iso(NOW + 5) }] }) },
    basisVersions: {
      projectsDrawingOn: () => drawing([{ id: "PRJ-A", title: "A", current: { version: "v1", at: iso(NOW), by: "alice" } },
                                        { id: "PRJ-B", title: "B", current: { version: "v2", at: iso(NOW), by: "bob" } }]),
      basisVersions: () => ({ ok: true, truncated: false, versions: [{ name: "v3", state: "suggested", run: "RUN-A", at: iso(NOW) }] }),
      conclusionOf: (p) => (p === "PRJ-A" ? { version: "v1", claim: "c", by: "alice", at: iso(NOW) } : null) },
    aiRuns: { runFor: (run) => (run === "RUN-A" ? { run, context_type: "project", context_id: "PRJ-A" } : null) },
    publication: { exportLog: () => ({ ok: true, limit: 200, truncated: false,
      exports: [{ seq: 1, at: iso(NOW), scope: "working-corpus", bundles: 1, files: 1, note: null }] }) },
    reevaluation: { notices: () => ({ ok: true, limit: 1000, truncated: false, notices: [
      { notice: "RN-1", holder: "INQ-S", target: "INF-1", grade: "affected", raised_at: iso(NOW), state: "open" }] }) },
    intent: { gaps: ({ project }) => ({ ok: true, gaps: project === "PRJ-A"
      ? [{ key: "intent::PRJ-A::p::E", basis: { project, stages_missing: ["s"], says: "ask" } }] : [] }) },
    monitoring: {
      flagged: () => ({ ok: true, limit: 200, truncated: false, items: [{ bundleId: "INF-1", source_status: "modified", since: iso(NOW) }] }),
      monitoring: () => ({ ok: true, truncated: false, items: [{ state: "unscheduled", bundle: "INF-1", address: null, reason: "none" }] }),
      archiveEligible: () => ({ ok: true, limit: 50, truncated: false, paused: { paused: false },
        eligible: [{ address: "https://gone.example/a", first_failure_since: iso(NOW) }] }) },
    governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 5, refusals: 1 }] },
    capture: { liveCaptureSessions: () => [{ session: "S1", locator: "https://x.example/", primarySha: "p1", created: iso(NOW),
      updated: iso(NOW), expires: iso(NOW + 10), ticks: 1, state: { queue: [1] } }] },
    actionClocks: {
      overdueClocks: () => ({ ok: true, limit: 500, truncated: false, cursor: null, items: [{ action: "ACT-1", ord: 0,
        date: "2026-08-20", basis: "b", text: "t", status: "pending", past: true, project: "PRJ-A", created_by: "alice" }] }),
      remindersDue: () => ({ ok: true, limit: 500, truncated: false, cursor: null, items: [{ action: "ACT-1", ord: 0,
        date: "2026-08-20", basis: "b", text: "t", on: "2026-08-15", set_by: "alice", project: "PRJ-A" }] }),
      calendarFactsRead: () => ({ ok: true, as_of: "2026-09-01", actions_limit: 500, truncated: false,
        paths: [{ path: "profile:p/holidays/2026/*", actions: [{ action: "ACT-1", project: "PRJ-A", created_by: "alice" }] }] }) },
    filingTemplates: { reviewsRequested: () => ({ ok: true, limit: 500, truncated: false, cursor: null, items: [{ template: "TPL-1",
      version: "TPL-1@1", name: "Records request", kind: "records_request", member: "alice", member_name: "alice",
      asked_by: { id: "alice", name: "alice" }, asked_at: iso(NOW - 5) }] }) },
    localFacts: { factsDue: ({ paths }) => ({ ok: true, unknown: [], absent: [], due: paths.map((path) => ({ path,
      fact: { profile: "p", fact: "holidays", year: 2026 }, status: "unconfirmed", due: true, why: "no member has confirmed it",
      latest: null, due_from: "2025-11-01" })) }) },
    escalation: { escalationsDue: () => ({ ok: true, limit: 500, truncated: false, items: [{ id: "ESC-1", project: "PRJ-A",
      opened_by: "alice", from: 1, to: 2, stage: "notification", instant: iso(NOW - 5), ids: [] }] }) },
    actionPlans: { checkpointsDue: () => ({ ok: true, limit: 500, truncated: false, items: [{ plan: "PLN-1", project: "PRJ-A",
      scenario: 1, version: 1, phase: "p", set_by: "alice", due: "2026-08-30", days_since_due: 2 }] }) },
    actions: { holdsDue: () => ({ ok: true, limit: 500, truncated: false, cursor: null, items: [{ action: "ACT-1", ord: 1,
      note: "a letter threatening suit", marked_by: "alice", marked_at: iso(NOW - 5), project: "PRJ-A" }] }) },
    ...extra,
  });
  w.member("alice", { role: "admin" });
  w.bundle("INQ-S", "inquiry"); w.bundle("INQ-A", "inquiry"); w.bundle("INF-1");
  w.bundle("PRJ-A", "project"); w.bundle("PRJ-B", "project");
  w.join("PRJ-A", "alice"); w.join("PRJ-B", "alice");
  w.cite("PRJ-A", "INQ-S"); w.cite("PRJ-B", "INQ-S"); w.leg("INQ-S", "INF-1");
  w.run(`INSERT INTO progression_instances VALUES ('p','E','s','c1','INF-1')`);
  w.bundle("ACT-1", "action"); w.signer("KEY-1", "alice", { comment: "laptop" });
  return w;
}

test("R8: every producer's items, homed through homesOf and offered optionsOf; no disposition, no catalogue_id; the facts beside them", () => {
  let feeds = 0;
  const w = busy();
  const inner = w.fakes.progressions.proposalsFeed;
  w.fakes.progressions.proposalsFeed = (...a) => { feeds += 1; return inner(...a); };
  const before = w.statements.length;
  const r = w.read("alice");
  const kinds = new Set(r.items.map((i) => i.kind));
  for (const k of ["bias-debt", "missing_predecessor", "out-of-inquiry-lead", "stance-changed-here-not-elsewhere",
                   "new-version-arrived-from-another-team", "shared-inquiry-concluded-by-another-project", "export-performed",
                   "newer-capture-affects-reference", "objective-gap", "source-modified", "governor-holding-host",
                   "partial-capture-outstanding", "capture-completed-unattended", "render-deferred",
                   "archive-fallback-eligible", "monitoring-recheck-due", "signer-self-registered", "action-clock-overdue",
                   "plan-checkpoint-due", "escalation-stage-proposed", "action-reminder", "litigation-hold",
                   "template-review-requested", "local-fact-due"])
    assert.ok(kinds.has(k), k);
  for (const it of r.items) {
    assert.ok(!("disposition" in it), `${it.id}: the mint's`);
    assert.ok(!("catalogue_id" in it), `${it.id}: queue stamps it`);
    assert.ok(["OBLIGATION", "FINDING", "CONDITION"].includes(it.class), it.id);
    assert.ok(it.id.startsWith(`${it.class}::`) , it.id);
    assert.equal(typeof it.case.state, "string", it.id);
  }
  assert.ok(w.asked.homes.length > 0 && w.asked.options.length > 0);
  // the options are exactly what optionsOf answered, except the producers' own acts (R9's take-up, the export log,
  // R14's revoke, R16's judgement, R17's advance and decline, R18's answer, R19's hold statement, R20's review, R21's
  // confirmation)
  const m = byId(r);
  assert.deepEqual(m["FINDING::p::s"].options, [{ id: "opt", on: ["INF-1"] }]);
  assert.deepEqual(m["FINDING::export-performed::1"].options.map((o) => o.id), ["exportlog"]);
  assert.deepEqual(m["OBLIGATION::signer-self-registered::KEY-1"].options.map((o) => o.id), ["signerset"]);
  assert.deepEqual(m["CONDITION::action-clock-overdue::ACT-1::0"].options, [{ id: "opt", on: ["ACT-1"] }]);
  assert.deepEqual(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::p"].options.map((o) => o.id), ["checkpointrecord"]);
  assert.deepEqual(m["OBLIGATION::escalation-stage-proposed::ESC-1::2"].options.map((o) => o.id), ["escalationadvance", "escalationdecline"]);
  assert.deepEqual(m["OBLIGATION::action-reminder::ACT-1::0::2026-08-15"].options.map((o) => o.id), ["reminderanswer", "opt"]);
  assert.deepEqual(m["OBLIGATION::litigation-hold::ACT-1::1"].options.map((o) => o.id), ["actionhold", "opt"]);
  assert.deepEqual(m["OBLIGATION::template-review-requested::TPL-1@1::alice"].options.map((o) => o.id), ["templatereview"]);
  assert.deepEqual(m["OBLIGATION::local-fact-due::profile:p/holidays/2026/*::unconfirmed"].options.map((o) => o.id), ["factconfirm", "opt"]);
  // the homes are the walk's: the stance item is homed under both projects drawing on the question
  assert.deepEqual(m["FINDING::stance-changed-here-not-elsewhere::INQ-S::PRJ-A"].case.ancestors.map((a) => a.id), ["PRJ-A", "PRJ-B"]);
  // the facts, and one proposalsFeed read for both the findings and the dispositions
  assert.equal(feeds, 1);
  assert.deepEqual(r.facts.dispositions, [{ key: "p::old", state: "dismissed" }]);
  assert.deepEqual(r.facts.objective_gap, { bound: 50, truncated: false });
  assert.deepEqual(r.facts.contradiction, { bound: 50, truncated: false });
  assert.deepEqual(r.facts.unattributed, { count: 0, inquiries: [] });
  // it writes nothing
  assert.ok(!w.statements.slice(before).some((q) => /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(q)));
  // with no walk passed, no item is given a home it was not handed
  const bare = w.read("alice", "member:alice", { homes: false, options: false });
  for (const it of bare.items) assert.deepEqual(it.case.ancestors.filter((a) => a.depth > 0), [], it.id);
});

test("R1: each uncleared bias debt inside the gate whose recipients include the member or name nobody, at most 200, keyed OBLIGATION::bias-debt::<run>", () => {
  let asked = null;
  const debts = [{ run: "r1", context_type: "inquiry", context_id: "INQ-1", recipients: ["alice"], raised: iso(NOW - 1000) },
                 { run: "r2", context_type: "inquiry", context_id: "INQ-1", recipients: [], raised: iso(NOW - 2000) },
                 { run: "r3", context_type: "inquiry", context_id: "INQ-1", recipients: ["bob"], raised: iso(NOW - 3000) }];
  const w = world({ bias: { uncleared: (a) => { asked = a; return { debts, limit: a.limit, truncated: false }; } } });
  w.member("alice"); w.member("bob"); w.bundle("INQ-1", "inquiry"); w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice"); w.cite("PRJ-1", "INQ-1");
  const ids = (r) => r.items.filter((i) => i.kind === "bias-debt").map((i) => i.id);
  assert.deepEqual(ids(w.read("alice")), ["OBLIGATION::bias-debt::r1", "OBLIGATION::bias-debt::r2"]);
  assert.deepEqual(asked, { gate: viewerPredicate("member:alice"), limit: 200 });
  assert.deepEqual(ids(w.read("bob")), ["OBLIGATION::bias-debt::r2", "OBLIGATION::bias-debt::r3"]);
  assert.deepEqual(ids(w.read(null, "class:admin")), ["OBLIGATION::bias-debt::r1", "OBLIGATION::bias-debt::r2", "OBLIGATION::bias-debt::r3"]);
  const m = byId(w.read("alice"));
  const d1 = m["OBLIGATION::bias-debt::r1"], d2 = m["OBLIGATION::bias-debt::r2"];
  assert.deepEqual([d1.class, d1.kind, d1.subject.kind, d1.subject.id], ["OBLIGATION", "bias-debt", "run", "r1"]);
  assert.deepEqual(d1.recipients, ["alice"]); assert.equal(d1.recipients_stated, undefined);
  assert.deepEqual(d2.recipients, []); assert.equal(typeof d2.recipients_stated, "string");
  assert.deepEqual(d1.case.ancestors.map((a) => a.id), ["PRJ-1"], "homed through the walk over the run's context");
  assert.deepEqual(d1.age, { state: "determined", since: iso(NOW - 1000), ms: 1000 });
  assert.equal(d1.basis.source, "bias.uncleared");
});

test("R9: an out-of-inquiry-lead offers, on the inquiry it bears on, the take-up act (cite into that inquiry)", () => {
  const w = busy();
  const lead = byId(w.read("alice"))["FINDING::out-of-inquiry-lead::CR-L"];
  // the act is the take-up, cite, and nothing of optionsOf: the producer's own inquiry-grain act (queue adds the set-aside at its mint)
  assert.deepEqual(lead.options, [{ id: "cite", label: "Take it up under this question", weight: "report" }]);
  assert.ok(!w.asked.options.some((s) => s.includes("INQ-A")), "nothing is offered on the question the run was working");
  // on the inquiry it bears on: the item is about that inquiry, filed under its homes, and its basis names it apart
  assert.deepEqual([lead.subject.inquiry, lead.basis.bears_on, lead.basis.found_while_working], ["INQ-S", "INQ-S", "INQ-A"]);
  assert.deepEqual(lead.case.ancestors.map((a) => a.id), ["PRJ-A", "PRJ-B"]);
  assert.equal("options_grain" in lead, false, "no grain is declared missing: the inquiry-grain act is offered");
});

test("R10: every FINDING's basis names its source and its derivation", () => {
  const r = busy().read("alice");
  const findings = r.items.filter((i) => i.class === "FINDING");
  assert.ok(findings.length >= 9);
  for (const it of findings) {
    assert.equal(typeof it.basis.source, "string", it.id); assert.ok(it.basis.source.length > 0, it.id);
    assert.equal(typeof it.basis.detail, "string", it.id); assert.ok(it.basis.detail.length > 20, it.id);
  }
});

test("R11: no answer names a bundle the viewer may not see, and no count reveals one", () => {
  const HID = "PRJ-H";
  const w = world({
    governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 5, refusals: 1 }] },
    capture: { liveCaptureSessions: () => [{ session: "S1", locator: "https://h.example/1", primarySha: "c-h", created: iso(NOW),
      updated: iso(NOW), expires: iso(NOW + 10), ticks: 1, state: {} }] },
    provenance: { homeOf: (sha) => (sha === "c-h" ? { bundleId: HID } : null) },
    progressions: { proposalsFeed: () => ({ instances: [], dispositions: [], proposals: [
      { key: "p::s", progression_key: "p", progression_label: "P", stage_key: "s", stage_label: "S", required: "always",
        definition_version: 1, n: 1, kinds: ["missing_predecessor"], grade: null, grade_determined: false, overdue: false,
        overdue_count: 0, surfaced_by: "machine", prior_disposition: null, instances: [{ progression_key: "p", entity_id: "E" }] }] }) },
    monitoring: { archiveEligible: () => ({ ok: true, limit: 50, truncated: false, paused: { paused: false },
      eligible: [{ address: "https://h.example/1", first_failure_since: iso(NOW) }] }) },
    basisVersions: { projectsDrawingOn: (inq, viewer) => Object.assign(
      [{ id: "PRJ-A", title: "A", current: { version: "v1", at: iso(NOW), by: "alice" } },
       ...(viewer === "member:alice" ? [] : [{ id: HID, title: "H", current: { version: "v2", at: iso(NOW), by: "x" } }])],
      { bound: 32, truncated: false }) },
    publication: { caseTensions: () => ({ ok: true, cursor: null, cases: [{ case: "CASE-1", edition: 1, project: "PRJ-A",
      tensions: [{ case: "CASE-1", edition: 1, member: HID, candidate: "cand-h", state: "open", depth: 1 }], resolved_since: [] }] }) },
  });
  w.member("alice"); w.bundle(HID, "project"); w.bundle("INF-V"); w.bundle("INQ-S", "inquiry"); w.bundle("PRJ-A", "project");
  w.join("PRJ-A", "alice", { owner: true }); w.cite("PRJ-A", "INQ-S"); w.cite(HID, "INQ-S"); w.cite(HID, "INF-V");
  w.run(`INSERT INTO progression_instances VALUES ('p','E','s','c1',?), ('p','E','s','c2','INF-V')`, HID);
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
  assert.deepEqual(m["CONDITION::governor-holding-host::h.example"].subject.bundles, ["INF-V"]);
  assert.deepEqual(m["FINDING::p::s"].subject.bundles, ["INF-V"]);
  assert.equal(m["CONDITION::partial-capture-outstanding::S1"], undefined, "a condition about a hidden bundle is withheld whole");
  assert.equal(m[`CONDITION::capture-completed-unattended::${HID}`], undefined);
  assert.ok(!r.items.some((i) => i.kind === "tension-after-publication"), "a tension naming only hidden members names nothing");
  // the shared-inquiry read counts no question only a hidden project makes shared (D-480)
  assert.ok(!r.items.some((i) => /stance-changed|new-version|shared-inquiry/.test(i.kind)));
  // an operator credential the gate does not filter sees it, so the fixture is not empty by accident
  assert.ok(JSON.stringify(w.read(null, "class:admin")).includes(HID));
});

test("R12: a CONDITION earns an item only where a member's act can change it: its options are the acts on the documents behind it", () => {
  const w = busy();
  const r = w.read("alice");
  const conds = r.items.filter((i) => i.class === "CONDITION");
  assert.ok(conds.length >= 6);
  for (const it of conds) {
    const docs = it.subject.kind === "bundle" || it.subject.kind === "action" ? [it.subject.id] : it.subject.bundles
      || (it.subject.kind === "capture_request" || it.subject.kind === "address" ? null : []);
    if (docs) assert.deepEqual(it.options, docs.length ? [{ id: "opt", on: docs }] : [], it.id);
    else assert.ok(Array.isArray(it.options), it.id);
    assert.ok(it.options.every((o) => o.id === "opt"), `${it.id}: no act of its own`);
  }
  // a host with no documents offers nothing; a condition whose fact stops holding leaves
  assert.deepEqual(byId(r)["CONDITION::governor-holding-host::h.example"].options, []);
  w.fakes.governor.governorHolding = () => [];
  assert.equal(byId(w.read("alice"))["CONDITION::governor-holding-host::h.example"], undefined);
});

test("R13: no place is named in this module's outward text", () => {
  const text = JSON.stringify(busy().read("alice"));
  for (const place of ["Oakland", "California", "Alameda", "CPRA", "Brown Act", "Sunshine", "San Francisco", "Berkeley"])
    assert.ok(!text.includes(place), place);
});
