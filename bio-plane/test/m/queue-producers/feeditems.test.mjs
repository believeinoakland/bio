/* feedItems (R8) at its interface: what it answers, what it takes from queue, what it never carries; the bias debts
   (R1); the lead's take-up (R9); and the invariants over every producer (R10–R13), the Action layer's (R15–R19), the
   signing key's (R14) and the filing templates' and local facts' (R20, R21) among them; and the words members see (R24,
   R25, R28); the litigation hold's release (R29) and the docket's items (R30, R31) among them. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { viewerPredicate } from "../../../src/membership/index.mjs";

/* A world in which every producer has something to say, for the checks that range over all of them. */
const DOCKET_DEPENDENTS = { ok: true, truncated: false, cursor: null, entries: [
  { dependent: "INQ-S", entry: "CASE-W#3", kind: "withdrawal", case: "CASE-W", since: iso(NOW - 2), withdrawn_editions: [1], legs: [] },
  { dependent: "INF-1", entry: "DKT-2026-0002", kind: "contested", case: "CASE-W", since: iso(NOW - 1), edition: 1, legs: [] }] };
const IMP = "c".repeat(64);
const CITED_DEPENDENTS = () => ({ ok: true, truncated: false, cursor: null, entries: [
  { dependent: "INQ-S", move: "IMM-1", import: IMP, group: "g2", case: "CASE-I", kind: "edition", edition: 2, seq: 1, date: "2026-08-20",
    since: iso(NOW - 4), what_changed: "corrected", key_listed: true, taken_back: null, legs: [{ cited_edition: 1 }] },
  { dependent: "INQ-S", move: "IMM-2", import: IMP, group: "g2", case: "CASE-I", kind: "withdrawal", edition: 1, seq: 2, date: "2026-08-21",
    since: iso(NOW - 3), reason: "retracted", key_listed: false, taken_back: null, legs: [{ cited_edition: 1 }] }] });
const WATCH_ITEMS = () => ({
  entries: [{ import: IMP, group: "g2", case: "CASE-I", set_by: "alice", seq: 3, kind: "response", edition: 2, date: "2026-08-22", key_listed: true, move: false, taken_back: null }],
  refused: [{ import: IMP, group: "g2", case: "CASE-I", set_by: "alice", seq: 4, failed: "C-130.15", detail: "d" }],
  unreadable: [{ import: IMP, group: "g2", case: "CASE-I", set_by: "alice", docket: "https://x.example/", reason: "not_json", at: iso(NOW - 2) }] });
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
    corpusExport: { exportLog: () => ({ ok: true, limit: 200, truncated: false,
      exports: [{ seq: 1, at: iso(NOW), scope: "working-corpus", bundles: 1, files: 1, note: null }] }) },
    reevaluation: { notices: () => ({ ok: true, limit: 1000, truncated: false, notices: [
      { notice: "RN-1", holder: "INQ-S", target: "INF-1", grade: "affected", raised_at: iso(NOW), state: "open" }] }),
      docketDependents: () => DOCKET_DEPENDENTS, citedCaseDependents: CITED_DEPENDENTS },
    caseImport: { watchItems: WATCH_ITEMS },
    wizardScripts: {
      brokenScripts: () => ({ ok: true, cursor: null, truncated: false, entries: [
        { script: "WIZ-1", version: 1, kind: "withdrawn", at: iso(NOW - 6), name: "File", project: "PRJ-A", author: "alice",
          refusal: { code: "WIZARD_SCREEN_UNKNOWN", check: "C-131.4", translation: "A step names a screen this copy no longer has." } },
        { script: "WIZ-1", version: 1, kind: "restored", at: iso(NOW - 5), name: "File", project: "PRJ-A", author: "alice", refusal: null }] }),
      submittedFor: () => ({ ok: true, cursor: null, truncated: false, entries: [
        { script: "WIZ-2", version: 1, owner: "alice", name: "Comment", author: "bob", submitted_at: iso(NOW - 4), project: "PRJ-A" }] }) },
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
      note: "a letter threatening suit", marked_by: "alice", marked_at: iso(NOW - 5), project: "PRJ-A" }] }),
      holdsReleased: () => ({ ok: true, limit: 500, truncated: false, cursor: null, items: [{ action: "ACT-1", ord: 0, seq: 2,
        released_by: "alice", released_at: iso(NOW - 3), reason: "the matter settled", placers: ["alice"], restarted: ["PRJ-A"] }] }) },
    docket: { coreDue: () => ({ ok: true, count: 1, wrote: false, items: [
      { case: "CASE-D", kind: "response", ref: "DKT-2026-0001", edition: 1, since: iso(NOW - 7) }] }) },
    ...extra,
  });
  w.member("alice", { role: "admin" });
  w.bundle("INQ-S", "inquiry"); w.bundle("INQ-A", "inquiry"); w.bundle("INF-1");
  w.bundle("PRJ-A", "project"); w.bundle("PRJ-B", "project");
  w.join("PRJ-A", "alice", { owner: true }); w.join("PRJ-B", "alice");
  w.run(`INSERT INTO cases (case_id, project_id) VALUES ('CASE-D', 'PRJ-A')`);
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
                   "template-review-requested", "local-fact-due", "litigation-hold-released", "docket-core-due",
                   "edition-withdrawn", "edition-contested", "cited-newer-edition", "cited-edition-withdrawn",
                   "followed-case-entry", "cited-docket-entry-refused", "cited-docket-unreadable",
                   "wizard-withdrawn", "wizard-restored", "wizard-approval-requested"])
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
  // R14's revoke, R16's judgement, R17's advance and decline, R18's answer, R19's two hold statements, R20's review,
  // R21's confirmation, R30's placement and decline)
  const m = byId(r);
  assert.deepEqual(m["FINDING::p::s"].options, [{ id: "opt", on: ["INF-1"] }]);
  assert.deepEqual(m["FINDING::export-performed::1"].options.map((o) => o.id), ["exportlog"]);
  assert.deepEqual(m["OBLIGATION::signer-self-registered::KEY-1"].options.map((o) => o.id), ["signerset"]);
  assert.deepEqual(m["CONDITION::action-clock-overdue::ACT-1::0"].options, [{ id: "opt", on: ["ACT-1"] }]);
  assert.deepEqual(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::p"].options.map((o) => o.id), ["checkpointrecord"]);
  assert.deepEqual(m["OBLIGATION::escalation-stage-proposed::ESC-1::2"].options.map((o) => o.id), ["escalationadvance", "escalationdecline"]);
  assert.deepEqual(m["OBLIGATION::action-reminder::ACT-1::0::2026-08-15"].options.map((o) => o.id), ["reminderanswer", "opt"]);
  assert.deepEqual(m["OBLIGATION::litigation-hold::ACT-1::1"].options.map((o) => o.id), ["actionhold", "actionholdrelease", "opt"]);
  assert.deepEqual(m["FINDING::litigation-hold-released::ACT-1::0::2"].options, [{ id: "opt", on: ["ACT-1"] }]);
  assert.deepEqual(m["OBLIGATION::docket-core-due::CASE-D::response::DKT-2026-0001"].options.map((o) => o.id),
    ["docketprepare", "docketdecline"]);
  assert.deepEqual(m["FINDING::edition-withdrawn::INQ-S::CASE-W#3"].options, [{ id: "opt", on: ["INQ-S"] }]);
  assert.deepEqual(m["FINDING::edition-contested::INF-1::DKT-2026-0002"].options, [{ id: "opt", on: ["INF-1"] }]);
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
    /* R35: a signal about a watch (no document behind it) is changed by the watch's own acts: set its address again, end it */
    if (it.subject.kind === "import") { assert.deepEqual(it.options.map((o) => o.id), ["importwatch", "importunwatch"], it.id); continue; }
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

/* Every kind this module produces, for R24 and R25's checks: `busy`'s world with the contradictions (R4–R7) added. */
function everyKind() {
  const side = (inquiry) => ({ kind: "claim", inquiry });
  const w = busy({
    contradiction: {
      candidatesFor: ({ on }) => ({ ok: true, truncated: false, cursor: null, candidates: on.project !== "PRJ-A" ? [] : [
        { candidate: "CC-D", weight: "duty", state: "open", a: side("INQ-S"), b: side("INQ-A"), between_projects: [{ project: "PRJ-A", opted_in: false }] },
        { candidate: "CC-L", weight: "lead", state: "open", a: side("INQ-S"), b: side("INQ-A"), between_projects: [] },
        { candidate: "CC-P", weight: "plurality", state: "open", a: side("INQ-S"), b: side("INQ-A"), between_projects: [] }] }),
      conflictNotices: ({ project }) => ({ ok: true, truncated: false, cursor: null, notices: project !== "PRJ-A" ? [] : [
        { candidate: "CN-D", weight: "duty", state: "open", project: "PRJ-A", side: side("INQ-S"), says: "a record you cannot see conflicts" },
        { candidate: "CN-P", weight: "plurality", state: "open", project: "PRJ-A", side: side("INQ-S"), says: "a conclusion you cannot see differs" }] }) },
    reevaluation: {
      notices: () => ({ ok: true, limit: 1000, truncated: false, notices: [
        { notice: "RN-1", holder: "INQ-S", target: "INF-1", grade: "affected", raised_at: iso(NOW), state: "open" }] }),
      correctedDependents: () => ({ ok: true, truncated: false, cursor: null, entries: [
        { dependent: "INQ-S", candidate: "CC-D", reason: "named wrong", since: iso(NOW) }] }),
      docketDependents: () => DOCKET_DEPENDENTS, citedCaseDependents: CITED_DEPENDENTS },
    corpusExport: { exportLog: () => ({ ok: true, limit: 200, truncated: false,
                     exports: [{ seq: 1, at: iso(NOW), scope: "working-corpus", bundles: 1, files: 1, note: null }] }) },
    publication: { caseTensions: () => ({ ok: true, cursor: null, cases: [{ case: "CASE-1", edition: 1, project: "PRJ-A",
                     tensions: [{ candidate: "CC-D", member: "INF-1", state: "open", depth: 1 }] }] }),
                   caseDocumentFacts: (c, e) => ({ ok: true, doc: { case_id: c, edition: e, authored_at: iso(NOW), sig_armored: null },
                     attribution: { current: [{ observation: "OBS-1", level: null }] } }) },
  });
  w.bundle("OBS-1", "observation");
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes, authored, author) VALUES ('so','OBS-1','s','utf8',?,1,1,'alice')`, iso(NOW));
  w.run(`INSERT INTO case_documents (case_id, edition, authored_at, sig_armored) VALUES ('CASE-1', 1, ?, NULL)`, iso(NOW));
  w.run(`UPDATE project_participants SET owner=1 WHERE project_id='PRJ-A' AND member_id='alice'`);
  return w;
}
/* Every string a member reads on an item: its summary and detail, the words of its options, and every sentence under it
   (its basis, its age, its grain, its recipients' statement, its excluded homes), never its id, class or kind. */
function memberWords(item) {
  const out = [];
  const walk = (v, key) => {
    if (typeof v === "string") { if (!["id", "class", "kind", "source", "reason"].includes(key)) out.push([key, v]); return; }
    if (Array.isArray(v)) { for (const x of v) walk(x, key); return; }
    if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, k);
  };
  for (const [k, v] of Object.entries(item)) if (!["id", "class", "kind", "case"].includes(k)) walk(v, k);
  for (const a of (item.case && item.case.excluded) || []) walk(a.detail, "detail");
  return out;
}

test("R24 (DEC-107; H15, H19): no member-facing sentence of any item kind says 'obligation' or 'condition'; the codes, kinds and ids are unchanged", () => {
  const r = everyKind().read("alice");
  const kinds = new Set(r.items.map((i) => i.kind));
  for (const k of ["contradiction-duty", "contradiction-lead", "contradiction-plurality", "contradiction-duty-unseen",
                   "contradiction-plurality-unseen", "side-corrected", "tension-after-publication", "bias-debt", "governor-holding-host",
                   "render-deferred", "plan-checkpoint-due", "objective-gap", "template-review-requested", "local-fact-due",
                   "attribution-unchosen", "litigation-hold-released", "docket-core-due", "edition-withdrawn", "edition-contested",
                   "cited-newer-edition", "cited-edition-withdrawn", "followed-case-entry", "cited-docket-entry-refused",
                   "cited-docket-unreadable", "wizard-withdrawn", "wizard-restored", "wizard-approval-requested"])
    assert.ok(kinds.has(k), `the world produces ${k}`);
  assert.ok(kinds.size >= 44, `every kind this module produces (${[...kinds].sort().join(", ")})`);
  for (const it of r.items) {
    for (const [key, s] of memberWords(it))
      assert.doesNotMatch(s, /\b(obligation|condition)s?\b/i, `${it.id} ${key}: "${s}"`);
    /* the codes unchanged: the classes, and ids keyed by them */
    assert.ok(["OBLIGATION", "FINDING", "CONDITION"].includes(it.class), it.id);
    assert.ok(it.id.startsWith(`${it.class}::`), it.id);
  }
  const m = byId(r);
  assert.equal(m["CONDITION::governor-holding-host::h.example"].class, "CONDITION");
  assert.equal(m["OBLIGATION::contradiction::CC-D"].class, "OBLIGATION");
  assert.equal(m["OBLIGATION::contradiction-unseen::CN-D"].kind, "contradiction-duty-unseen");
  /* the re-keyed words: a signal is our own machinery's fact, said as a signal */
  assert.match(m["CONDITION::governor-holding-host::h.example"].basis.detail, /^a signal is a fact about OUR OWN machinery/);
  assert.match(m["CONDITION::render-deferred::CR-R"].basis.detail, /^a signal is a fact about OUR OWN machinery/);
  assert.match(m["FINDING::contradiction::CC-L"].detail, /asks nothing of you: dismiss it or take it up/);
  assert.match(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::p"].detail, /records whether what it set was met/);
});

test("R28 (DEC-114): no member-facing sentence of any item kind calls what an action plan addresses a 'subject'; the item key `subject`, the codes and kinds are unchanged", () => {
  const SAYS_SUBJECT = /\bsubjects?\b/i;
  /* negative control: the check catches the word it forbids, in any form a sentence could carry it */
  for (const bad of ["the plan's subject", "Subjects of this plan", "a SUBJECT"]) assert.match(bad, SAYS_SUBJECT);
  assert.doesNotMatch("the plan's matters", SAYS_SUBJECT);
  const r = everyKind().read("alice");
  const m = byId(r);
  assert.ok(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::p"], "the world produces the action plan's item");
  assert.ok(new Set(r.items.map((i) => i.kind)).size >= 44, "every kind this module produces");
  for (const it of r.items) {
    /* R28's words: the summary, the detail and the words of the options; and every other sentence under the item */
    const words = [["summary", it.summary], ["detail", it.detail],
                   ...(it.options || []).map((o) => ["option", o && o.label]), ...memberWords(it)];
    for (const [key, s] of words) if (typeof s === "string") assert.doesNotMatch(s, SAYS_SUBJECT, `${it.id} ${key}: "${s}"`);
    /* the key `subject` (queue's term for what an item is about) is unchanged, as are the class codes */
    assert.ok(it.subject && typeof it.subject === "object" && typeof it.subject.kind === "string", `${it.id} keeps subject`);
    assert.ok(it.id.startsWith(`${it.class}::`), it.id);
  }
  assert.equal(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::p"].subject.kind, "plan");
});

test("R25 (DEC-110 (1)): `due` is carried by action-clock-overdue, action-reminder and plan-checkpoint-due, and by no other item", () => {
  const r = everyKind().read("alice");
  const dated = new Set(["action-clock-overdue", "action-reminder", "plan-checkpoint-due"]);
  for (const it of r.items) {
    if (dated.has(it.kind)) assert.match(String(it.due), /^\d{4}-\d{2}-\d{2}$/, it.id);
    else assert.equal("due" in it, false, `${it.id} carries no due`);
  }
  const m = byId(r);
  assert.equal(m["CONDITION::action-clock-overdue::ACT-1::0"].due, "2026-08-20");
  assert.equal(m["OBLIGATION::action-reminder::ACT-1::0::2026-08-15"].due, "2026-08-20");
  assert.equal(m["OBLIGATION::plan-checkpoint-due::PLN-1::1::p"].due, "2026-08-30");
});

test("R8 (R22, R23; K1019): feedItems reads the unattended capture's grade note and the credit-level to-do into its one answer", () => {
  const w = everyKind();
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes) VALUES ('z','INF-1','s','binary',?,1)`, iso(NOW));
  const m = byId(w.read("alice"));
  const unattended = m["CONDITION::capture-completed-unattended::CR-C"];
  assert.deepEqual(unattended.basis.grade_notes.map((n) => n.capture_sha), ["z"], "R22: the request's capture, held and seen");
  assert.ok(unattended.detail.includes(unattended.basis.grade_notes[0].note));
  const credit = m["OBLIGATION::attribution-unchosen::CASE-1@1::OBS-1"];
  assert.deepEqual([credit.class, credit.kind, credit.recipients], ["OBLIGATION", "attribution-unchosen", ["alice"]], "R23");
  assert.ok(!("disposition" in credit) && !("catalogue_id" in credit), "the mint's and queue's, as every item");
});
