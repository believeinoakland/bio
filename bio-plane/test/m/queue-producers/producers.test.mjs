/* The producers at feedItems's interface (R8): every FINDING (R2) kind this module derives (R3's CONDITIONs are
   machinery-producers' since K1850, and tested there), each
   from its provider's published fact, gated by the viewer and homed through the walk queue passes in (queue R7). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso, said, dayWord, sha, homed, MONITORING } from "./world.mjs";
import { flaggedRefusal } from "../monitoring/fixtures.mjs";

const drawing = (list) => Object.assign(list, { bound: 32, truncated: false });

test("R2: proposals are one FINDING per open proposal, keyed <progression>::<stage>, subjects gated, age derived_on_read", () => {
  const w = world({ progressions: { proposalsFeed: () => ({ instances: [], dispositions: [], proposals: [
    { key: "p::s", progression_key: "p", progression_label: "P", stage_key: "s", stage_label: "S", required: "always",
      definition_version: 2, n: 1, kinds: ["missing_predecessor", "overdue_successor"], grade: "B", grade_determined: true,
      overdue: true, overdue_count: 1, surfaced_by: "machine", prior_disposition: { state: "deferred" },
      instances: [{ progression_key: "p", entity_id: "E", grade: "B", grade_determined: true, overdue: true, deadline: null }] }] }) } });
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
    address: "https://x.example/d", host: "x.example", purpose: "investigate", ua_mode: "civicos", capture_sha: sha("s1"),
    captured_at: iso(NOW - 5), attribution: { ok: true, statement: "the daemon captured this" } }] }) },
    provenance: homed({ [sha("s1")]: "INF-D" }) });
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
  assert.equal(e.summary, said("queue.export-performed.summary", { scope: "", date: dayWord("2026-09-01"),
    records: said("queue.export-performed.records.other", { n: 3 }), files: said("queue.export-performed.files.other", { n: 4 }) }));
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
  /* monitoring's own reads over real monitors (its published fixture): one document found modified, one found removed */
  const F = MONITORING.seeded, MOD = F.bundles.modified, REM = F.bundles.removed, X = "INFO-2026-0699-unreadable";
  const LATER = F.now + 100000;
  let asked = null;
  const w = world({ monitoring: { flagged: (a) => { asked = a; return F.flagged; } } });
  w.member("alice");
  for (const b of [MOD, REM]) w.bundle(b);
  w.bundle("INQ-1", "inquiry"); w.leg("INQ-1", MOD);
  const m = byId(w.read("alice", "member:alice", { now: LATER }));
  assert.deepEqual(asked, { viewer: "member:alice" }, "the viewer is monitoring's to gate by (its R48)");
  const mod = m[`FINDING::source-modified::${MOD}`];
  assert.equal(mod.kind, "source-modified"); assert.deepEqual(mod.subject, { kind: "bundle", id: MOD });
  assert.deepEqual(mod.case.ancestors.map((a) => a.id), ["INQ-1"]);
  assert.deepEqual([mod.basis.source, mod.basis.source_status, mod.basis.since], ["monitoring.flagged", "modified", F.flagged.items[0].since]);
  assert.deepEqual(mod.basis.bound, { limit: F.flagged.limit, truncated: false });
  assert.deepEqual([mod.age.state, mod.age.ms], ["determined", 100000]);
  assert.equal(m[`FINDING::source-removed::${REM}`].kind, "source-removed");
  assert.equal(Object.keys(m).filter((id) => /^FINDING::source-(modified|removed)::/.test(id)).length, 2);
  /* an answer cut at its limit says so; a row whose instant cannot be read has its age undetermined (monitoring gives neither here: the real answer, varied) */
  w.bundle(X);
  w.fakes.monitoring.flagged = () => ({ ...F.flagged, truncated: true, items: [...F.flagged.items, { ...F.flagged.items[0], bundleId: X, since: "not an instant" }] });
  const t = byId(w.read("alice", "member:alice", { now: LATER }));
  assert.deepEqual(t[`FINDING::source-modified::${MOD}`].basis.bound, { limit: F.flagged.limit, truncated: true });
  assert.equal(t[`FINDING::source-modified::${X}`].age.state, "undetermined");
  assert.equal(Object.keys(t).filter((id) => /^FINDING::source-(modified|removed)::/.test(id)).length, 3);
  // a read monitoring could not make mints nothing
  const w2 = world({ monitoring: { flagged: () => flaggedRefusal() } });
  assert.ok(!w2.read(null, "class:admin").items.some((i) => /^source-/.test(i.kind)));
  // nothing here reads front matter or the reachability table any more (N330)
  assert.ok(!w.statements.some((q) => /source_reachability|FROM files/.test(q)));
});

test("R40 (T48): source-modified and source-removed carry title; an untitled document's item has title null and no B- id, a titled one's summary names the title; no id or mechanism in summary or detail", () => {
  const F = MONITORING.seeded, ids = [F.bundles.modified, F.bundles.removed];
  for (const titles of [[null, null], ["Water Quality Report", "Zoning Memo"]]) {
    const w = world({ monitoring: { flagged: () => F.flagged } });
    w.member("alice");
    ids.forEach((id, i) => w.bundle(id, "information", { title: titles[i] }));
    const m = byId(w.read("alice", "member:alice", { now: F.now }));
    const items = [m[`FINDING::source-modified::${ids[0]}`], m[`FINDING::source-removed::${ids[1]}`]];
    items.forEach((it, i) => {
      assert.equal(it.title, titles[i]);
      if (titles[i]) assert.ok(it.summary.includes(titles[i]), `control: a titled summary names the title (${titles[i]})`);
      for (const text of [it.summary, it.detail]) {
        assert.ok(!/\bB-[A-Z]/.test(text) && !text.includes("INFO-2026"), `no bundle id: ${text}`);
        assert.ok(!/\b(404|410|HTTP|monitoring)\b/i.test(text), `no status or mechanism: ${text}`);
      }
      assert.equal(it.basis.bundle_id, it.subject.id, "basis keeps the facts for the record");
    });
  }
});

test("R2, R11 (K2581; D54): a proposal whose only instance lies in a hidden project an administrator neither joined nor was invited to is no item to her; the negative controls, the project discoverable, or a member of it, count it", () => {
  const w = world({ progressions: { proposalsFeed: () => ({ instances: [], dispositions: [], proposals: [
    { key: "p::s", progression_key: "p", progression_label: "P", stage_key: "s", stage_label: "S", required: "always",
      definition_version: 1, n: 1, kinds: ["missing_predecessor"], grade: "B", grade_determined: true, overdue: false, overdue_count: 0,
      surfaced_by: "machine", prior_disposition: null,
      instances: [{ progression_key: "p", entity_id: "E", grade: "B", grade_determined: true, overdue: false, deadline: null }] }] }) } });
  w.member("ada", { role: "admin" }); w.member("hank");
  w.bundle("PRJ-H", "project"); w.join("PRJ-H", "hank", { owner: true });
  w.bundle("DOC-H"); w.run(`UPDATE bundles SET project='PRJ-H' WHERE bundle_id='DOC-H'`);
  w.run(`INSERT INTO progression_instances VALUES ('p','E','s','c1','DOC-H')`);
  const it = (who) => byId(w.read(who))["FINDING::p::s"];
  assert.equal(it("ada"), undefined, "D54: no item, and so no count, of an instance she may not see");
  assert.ok(!JSON.stringify(w.read("ada")).includes("DOC-H"));
  assert.deepEqual([it("hank").basis.n, it("hank").subject.bundles], [1, ["DOC-H"]], "a member of the project is told");
  w.discoverable("PRJ-H");
  assert.deepEqual([it("ada").basis.n, it("ada").subject.bundles], [1, ["DOC-H"]], "a discoverable project is seen whole by administrators");
});
