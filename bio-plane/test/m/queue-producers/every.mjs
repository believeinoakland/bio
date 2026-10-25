/* The shared fixtures of the producers' suites: a world in which every producer has something to say (`busy`), and the same
   with the contradictions added (`everyKind`), for the checks that range over every kind this module produces. */
import { world, NOW, iso, MONITORING, DOCKET } from "./world.mjs";

/* A world in which every producer has something to say, for the checks that range over all of them. */
const DOCKET_DEPENDENTS = { ok: true, truncated: false, cursor: null, entries: [
  { dependent: "INQ-S", entry: "CASE-W#3", kind: "withdrawal", case: "CASE-W", since: iso(NOW - 2), withdrawn_editions: [1], legs: [] },
  { dependent: "INF-1", entry: "DKT-2026-0002", kind: "contested", case: "CASE-W", since: iso(NOW - 1), edition: 1, legs: [] }] };
export const IMP = "c".repeat(64);
const CITED_DEPENDENTS = () => ({ ok: true, truncated: false, cursor: null, entries: [
  { dependent: "INQ-S", move: "IMM-1", import: IMP, group: "g2", case: "CASE-I", kind: "edition", edition: 2, seq: 1, date: "2026-08-20",
    since: iso(NOW - 4), what_changed: "corrected", key_listed: true, taken_back: null, legs: [{ cited_edition: 1 }] },
  { dependent: "INQ-S", move: "IMM-2", import: IMP, group: "g2", case: "CASE-I", kind: "withdrawal", edition: 1, seq: 2, date: "2026-08-21",
    since: iso(NOW - 3), reason: "retracted", key_listed: false, taken_back: null, legs: [{ cited_edition: 1 }] }] });
const WATCH_ITEMS = () => ({
  entries: [{ import: IMP, group: "g2", case: "CASE-I", set_by: "alice", seq: 3, kind: "response", edition: 2, date: "2026-08-22", key_listed: true, move: false, taken_back: null }],
  refused: [{ import: IMP, group: "g2", case: "CASE-I", set_by: "alice", seq: 4, failed: "C-130.15", detail: "d" }],
  unreadable: [{ import: IMP, group: "g2", case: "CASE-I", set_by: "alice", docket: "https://x.example/", reason: "not_json", at: iso(NOW - 2) }] });
export function busy(extra = {}) {
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
      flagged: () => MONITORING.seeded.flagged,
      monitoring: () => MONITORING.seeded.monitoring,
      archiveEligible: () => MONITORING.seeded.archiveEligible },
    governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 5, refusals: 1 }] },
    capture: { liveCaptureSessions: () => [{ session: "S1", locator: "https://x.example/", primarySha: "p1", created: iso(NOW),
      updated: iso(NOW), expires: iso(NOW + 10), ticks: 1, state: { queue: [1] } }] },
    docket: { coreDue: () => DOCKET.due },
    ...extra,
  });
  /* R37: an edition waiting, one published, one stopped (publish-schedule R4, was publication R69); R39: a copy whose base moved (wizard-scripts R26) */
  const ed = (c, state, over = {}) => ({ case: c, edition: 1, project: "PRJ-A", state, signer: "KEY-1", set_by: "alice", signed_at: iso(NOW - 9),
    at: { date: "2026-09-03", time: "09:30", zone: "UTC" }, publish_at: "2026-09-03T09:30:00Z", moves: [], outcome_at: null, reasons: null, ...over });
  w.fakes.publishSchedule.scheduledEditions = () => ({ ok: true, limit: 500, cursor: null, editions: [ed("CASE-SW", "waiting"),
    ed("CASE-SP", "published", { outcome_at: iso(NOW - 2) }),
    ed("CASE-SS", "stopped", { outcome_at: iso(NOW - 1), reasons: [{ code: "X", translation: "A source changed after it was signed." }] })] });
  w.fakes.wizardScripts.baseUpdates = () => ({ ok: true, cursor: null, truncated: false, entries: [{ copy: "WIZ-C", name: "Copy",
    project: "PRJ-A", base: "WIZ-1", base_name: "File", based_on: "WIZ-1@1", base_version: "WIZ-1@2", found_at: iso(NOW - 3), recipients: ["alice"] }] });
  /* R38: instance-setup's read, registered at start */
  w.p.registerPlaceArrivals(() => ({ ok: true, arrivals: [{ name: "Riverton", profile: "us-xx-riverton", profile_name: "City of Riverton",
    covers: ["Riverton"], found_at: iso(NOW - 4) }] }));
  w.member("alice", { role: "admin" });
  w.bundle("INQ-S", "inquiry"); w.bundle("INQ-A", "inquiry"); w.bundle("INF-1");
  w.bundle("PRJ-A", "project"); w.bundle("PRJ-B", "project");
  w.join("PRJ-A", "alice", { owner: true }); w.join("PRJ-B", "alice");
  w.run(`INSERT INTO cases (case_id, project_id) VALUES (?, 'PRJ-A')`, DOCKET.case);
  w.cite("PRJ-A", "INQ-S"); w.cite("PRJ-B", "INQ-S"); w.leg("INQ-S", "INF-1");
  w.run(`INSERT INTO progression_instances VALUES ('p','E','s','c1','INF-1')`);
  w.bundle("ACT-1", "action"); w.signer("KEY-1", "alice", { comment: "laptop" });
  return w;
}

/* Every kind this module produces, for R24 and R25's checks: `busy`'s world with the contradictions (R4–R7) added. */
export function everyKind() {
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
    caseTensions: { caseTensions: () => ({ ok: true, cursor: null, cases: [{ case: "CASE-1", edition: 1, project: "PRJ-A",
                     tensions: [{ candidate: "CC-D", member: "INF-1", state: "open", depth: 1 }] }] }) },
    publication: { caseDocumentFacts: (c, e) => ({ ok: true, doc: { case_id: c, edition: e, authored_at: iso(NOW), sig_armored: null },
                     attribution: { current: [{ observation: "OBS-1", level: null }] } }) },
  });
  w.bundle("OBS-1", "observation");
  w.run(`INSERT INTO register (capture_sha, bundle_id, path, encoding, registered, bytes, authored, author) VALUES ('so','OBS-1','s','utf8',?,1,1,'alice')`, iso(NOW));
  w.run(`INSERT INTO case_documents (case_id, edition, authored_at, sig_armored) VALUES ('CASE-1', 1, ?, NULL)`, iso(NOW));
  w.run(`UPDATE project_participants SET owner=1 WHERE project_id='PRJ-A' AND member_id='alice'`);
  return w;
}
