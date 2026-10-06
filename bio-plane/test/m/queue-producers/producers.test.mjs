/* The producers at feedItems's interface (R8): every FINDING (R2) kind this module derives (R3's CONDITIONs are
   machinery-producers' since K1850, and tested there), each
   from its provider's published fact, gated by the viewer and homed through the walk queue passes in (queue R7). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const drawing = (list) => Object.assign(list, { bound: 32, truncated: false });

test("R2: proposals are one FINDING per open proposal, keyed <progression>::<stage>, subjects gated, age derived_on_read", () => {
  const w = world({ progressions: { proposalsFeed: () => ({ instances: [], dispositions: [], proposals: [
    { key: "p::s", progression_key: "p", progression_label: "P", stage_key: "s", stage_label: "S", required: "always",
      definition_version: 2, n: 1, kinds: ["missing_predecessor", "overdue_successor"], grade: "B", grade_determined: true,
      overdue: true, overdue_count: 1, surfaced_by: "machine", prior_disposition: { state: "deferred" },
      instances: [{ progression_key: "p", entity_id: "E" }] }] }) } });
  w.member("alice"); w.bundle("INF-1"); w.bundle("PRJ-H", "project");
  w.run(`INSERT INTO progression_instances VALUES ('p','E','s','c1','INF-1'), ('p','E','s','c2','PRJ-H')`);
  const it = byId(w.read("alice"))["FINDING::p::s"];
  assert.equal(it.kind, "overdue_successor");
  assert.deepEqual(it.subject.bundles, ["INF-1"]);
  assert.deepEqual(it.prior_disposition, { state: "deferred" });
  assert.equal(it.age.reason, "derived_on_read");
});

test("R2: out-of-inquiry-lead per captured lead, homed under the inquiry it bears on, never the run's", () => {
  const w = world({ captureRequests: { leads: () => ({ requests: [{ request: "CR-1", run: "r", target: "INQ-A", lead_inquiry: "INQ-B",
    address: "https://x.example/d", host: "x.example", purpose: "investigate", ua_mode: "civicos", capture_sha: "s1",
    captured_at: iso(NOW - 5), attribution: { ok: true, statement: "the daemon captured this" } }] }) },
    provenance: { homeOf: (sha) => (sha === "s1" ? { bundleId: "INF-D" } : null) } });
  w.bundle("INQ-A", "inquiry"); w.bundle("INQ-B", "inquiry"); w.bundle("INF-D");
  w.bundle("PRJ-A", "project"); w.cite("PRJ-A", "INQ-A"); w.bundle("PRJ-B", "project"); w.cite("PRJ-B", "INQ-B");
  const it = byId(w.read(null, "class:admin"))["FINDING::out-of-inquiry-lead::CR-1"];
  assert.deepEqual(it.case.ancestors.map((a) => a.id), ["PRJ-B"]);
  assert.equal(it.basis.bears_on, "INQ-B"); assert.equal(it.basis.found_while_working, "INQ-A");
  assert.equal(it.basis.basis_entry.state, "absent"); assert.equal(it.subject.bundle_id, "INF-D");
});

test("R2: stance-changed, new-version-from-another-team and shared-inquiry-concluded, over a question two visible projects draw on", () => {
  const w = world({
    basisVersions: {
      projectsDrawingOn: () => drawing([{ id: "PRJ-A", title: "A", current: { version: "v1", at: iso(NOW - 10), by: "alice" } },
                                        { id: "PRJ-B", title: "B", current: { version: "v2", at: iso(NOW - 20), by: "bob" } }]),
      basisVersions: () => ({ ok: true, truncated: false, versions: [
        { name: "v3", description: "d", state: "suggested", hidden: false, run: "RUN-A", author: "alice", at: iso(NOW - 30) },
        { name: "v4", description: "d", state: "suggested", hidden: false, run: null, author: "bob", at: iso(NOW - 40) }] }),
      conclusionOf: (p) => (p === "PRJ-A" ? { version: "v1", claim: "c", by: "alice", at: iso(NOW - 50) } : null),
      conclusionRecordOf: () => ({ stance: null }) },
    aiRuns: { runFor: (run) => (run === "RUN-A" ? { run, context_type: "project", context_id: "PRJ-A" } : null) } });
  w.bundle("INQ-S", "inquiry"); w.bundle("PRJ-A", "project"); w.bundle("PRJ-B", "project");
  w.cite("PRJ-A", "INQ-S"); w.cite("PRJ-B", "INQ-S");
  const f = w.read(null, "class:admin"), m = byId(f);
  assert.ok(m["FINDING::stance-changed-here-not-elsewhere::INQ-S::PRJ-A"]);
  assert.ok(m["FINDING::stance-changed-here-not-elsewhere::INQ-S::PRJ-B"]);
  const v = m["FINDING::new-version-arrived-from-another-team::INQ-S::v3"];
  assert.equal(v.basis.from_project, "PRJ-A"); assert.deepEqual(v.case.ancestors.map((a) => a.id), ["PRJ-B"]);
  assert.deepEqual(v.case.excluded.map((e) => e.id), ["PRJ-A"]);
  assert.deepEqual(f.facts.unattributed, { count: 1, inquiries: ["INQ-S"] });
  const c = m["FINDING::shared-inquiry-concluded-by-another-project::INQ-S::PRJ-A"];
  assert.deepEqual(c.case.ancestors.map((a) => a.id), ["PRJ-B"]); assert.equal(c.basis.version, "v1");
});

test("R2: export-performed, one per export, to an administrator member or the admin credential and to nobody else", () => {
  const w = world({ corpusExport: { exportLog: (a) => ({ ok: true, limit: a.limit, truncated: false,
    exports: [{ seq: 2, at: iso(NOW), scope: "working-corpus", bundles: 3, files: 4, note: null },
              { seq: 1, at: iso(NOW - 1), scope: "working-corpus", bundles: 1, files: 1, note: "n" }] }) } });
  w.member("ada", { role: "admin" }); w.member("alice");
  const ids = (f) => f.items.filter((i) => i.kind === "export-performed").map((i) => i.id);
  assert.deepEqual(ids(w.read("ada")).sort(), ["FINDING::export-performed::1", "FINDING::export-performed::2"]);
  assert.deepEqual(ids(w.read(null, "class:admin")).sort(), ["FINDING::export-performed::1", "FINDING::export-performed::2"]);
  assert.deepEqual(ids(w.read("alice")), []);
  assert.deepEqual(ids(w.read(null, "class:member")), []);
  const e = byId(w.read("ada"))["FINDING::export-performed::2"];
  assert.ok(!("catalogue_id" in e), "R8: queue stamps the catalogue id at its mint");
  assert.deepEqual(e.basis.bounds.limit, 200, "the latest 200");
  /* K899 (1): text a member reads says "record" where it said "bundle"; the field names stay. */
  assert.equal(e.summary, `A full working-corpus export was taken on ${iso(NOW)}: 3 records, 4 files`);
  assert.ok(!/bundle/i.test(`${e.summary} ${e.detail} ${e.basis.detail}`), "no member-read sentence says bundle");
  assert.equal(e.basis.bundles, 3, "the field keeps its name");
});

test("R2 (N172): newer-capture-affects-reference, one per open notice reevaluation answers the viewer, homed under its holder", () => {
  let asked = null;
  const w = world({ reevaluation: { notices: (a) => { asked = a; return { ok: true, limit: 1000, truncated: false, notices: [
    { notice: "RN-1", kind: "leg", holder: "INQ-1", ord: 0, target: "INF-1", content_id: "c".repeat(64), capture_sha: "a",
      newer_capture: "b", grade: "affected", affects: "the passage moved", raised_at: iso(NOW - 60000), state: "open" }] }; } } });
  w.member("alice"); w.bundle("INQ-1", "inquiry"); w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice"); w.cite("PRJ-1", "INQ-1");
  const it = byId(w.read("alice"))["FINDING::newer-capture-affects-reference::RN-1"];
  assert.deepEqual([asked.state, asked.viewer], ["open", "member:alice"]);
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["INQ-1", 0], ["PRJ-1", 1]]);
  assert.equal(it.age.ms, 60000);
  assert.deepEqual([it.subject.kind, it.subject.id, it.basis.source], ["notice", "RN-1", "reevaluation.notices"]);
});

test("R2 (N172): objective-gap per gap of each visible project the member participates in, at most 50, the bound published", () => {
  const asked = [];
  const w = world({ intent: { gaps: ({ project }) => { asked.push(project); return { ok: true, gaps: project === "PROJ-002"
    ? [{ key: "intent::PROJ-002::proc::E1", grade: null, instances: [], surfaced_by: "machine",
         basis: { project, progression: "proc", entity: "E1", stages_missing: ["award"], says: "request the award" } }] : [] }; } } });
  w.member("alice");
  for (let i = 1; i <= 55; i++) { const p = `PROJ-${String(i).padStart(3, "0")}`; w.bundle(p, "project"); w.join(p, "alice"); }
  w.bundle("PROJ-900", "project");                     // not alice's: not asked for her
  const f = w.read("alice");
  assert.equal(asked.length, 50); assert.ok(!asked.includes("PROJ-051") && !asked.includes("PROJ-900"));
  assert.deepEqual(f.facts.objective_gap, { bound: 50, truncated: true });
  const it = byId(f)["FINDING::objective-gap::intent::PROJ-002::proc::E1"];
  assert.deepEqual(it.case.ancestors.map((a) => a.id), ["PROJ-002"]);
  asked.length = 0; w.read(null, "class:admin");
  assert.equal(asked.length, 50, "no member: every visible project, bounded");
});

test("R2 (N229, N330): source-modified and source-removed per document monitoring.flagged answers the viewer, homed under its ancestors", () => {
  let asked = null;
  const w = world({ monitoring: { flagged: (a) => { asked = a; return { ok: true, limit: 200, truncated: true, items: [
    { bundleId: "INF-M", source_status: "modified", since: iso(NOW - 100000) },
    { bundleId: "INF-R", source_status: "removed", since: iso(NOW - 200000) },
    { bundleId: "INF-X", source_status: "modified", since: "not an instant" }] }; } } });
  w.member("alice");
  for (const b of ["INF-M", "INF-R", "INF-X"]) w.bundle(b);
  w.bundle("INQ-1", "inquiry"); w.leg("INQ-1", "INF-M");
  const m = byId(w.read("alice"));
  assert.deepEqual(asked, { viewer: "member:alice" }, "the viewer is monitoring's to gate by (its R48)");
  const mod = m["FINDING::source-modified::INF-M"];
  assert.equal(mod.kind, "source-modified"); assert.deepEqual(mod.subject, { kind: "bundle", id: "INF-M" });
  assert.deepEqual(mod.case.ancestors.map((a) => a.id), ["INQ-1"]);
  assert.deepEqual([mod.basis.source, mod.basis.source_status, mod.basis.since], ["monitoring.flagged", "modified", iso(NOW - 100000)]);
  assert.deepEqual(mod.basis.bound, { limit: 200, truncated: true });
  assert.deepEqual([mod.age.state, mod.age.ms], ["determined", 100000]);
  assert.equal(m["FINDING::source-removed::INF-R"].kind, "source-removed");
  assert.equal(m["FINDING::source-modified::INF-X"].age.state, "undetermined");
  assert.equal(Object.keys(m).filter((id) => /^FINDING::source-(modified|removed)::/.test(id)).length, 3);
  // a read monitoring could not make mints nothing
  const w2 = world({ monitoring: { flagged: () => ({ ok: false, items: [], limit: 200, truncated: false, detail: "x" }) } });
  assert.ok(!w2.read(null, "class:admin").items.some((i) => /^source-/.test(i.kind)));
  // nothing here reads front matter or the reachability table any more (N330)
  assert.ok(!w.statements.some((q) => /source_reachability|FROM files/.test(q)));
});
