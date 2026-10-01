/* The three shared-inquiry FINDINGs (R2: stance-changed-here-not-elsewhere, new-version-arrived-from-another-team,
   shared-inquiry-concluded-by-another-project) at feedItems' interface, and the candidate page they read under (R11).
   Converted from the old suites' queue-producers shares (`build/jobs/T17/legacy-tests.md`): `current.test.mjs` (the
   details of R2's first two kinds, the counted silence, the purge), `conclude-project.test.mjs` (the third kind's
   `basis.elsewhere` per project) and `project-sight.test.mjs` §10 (D-480: a hidden project's citations, or a hidden
   target, take no slot). basis-versions and ai-runs are fakes answering in their published shapes (basis-versions R8,
   R9, R22, R37; ai-runs R28); `refs`, `bundles` and membership's sight are real. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const INQ = "INQ-2026-4000-shared";
const drawing = (list, extra = {}) => Object.assign(list, { bound: 32, truncated: false, ...extra });
const ofKind = (r, kind) => r.items.filter((i) => i.kind === kind);

/* Projects A and B draw on INQ; C does not; SEV cites INQ in `refs` but withdrew, so basis-versions does not answer it
   as drawing (its R37 confirms the citation's own status) — the producer names whom that read answers and no other. */
function shared(stances, extra = {}) {
  const w = world({
    basisVersions: {
      projectsDrawingOn: (inq) => drawing(inq === INQ ? stances() : []),
      basisVersions: () => ({ ok: true, truncated: false, versions: [] }),
      conclusionOf: () => null, conclusionRecordOf: () => ({ stance: null }), ...extra.basisVersions },
    aiRuns: { runFor: () => null, ...extra.aiRuns } });
  w.bundle(INQ, extra.type || "inquiry", { title: "the transfer question" });
  for (const p of ["PRJ-A", "PRJ-B", "PRJ-C", "PRJ-SEV"]) w.bundle(p, "project", { title: p.slice(4) });
  w.cite("PRJ-A", INQ); w.cite("PRJ-B", INQ);
  /* SEV's `refs` row is the one the projection keeps though the citation was severed; whether it is a HOME is queue
     R7's walk (passed in), so only the first test, about whom the producer NAMES, carries it. */
  if (extra.sev) w.cite("PRJ-SEV", INQ);
  return w;
}

test("R2: stance-changed-here-not-elsewhere is a comparison, never a count: one item per project holding a dated stance others do not share, its elsewhere enumerated, its age the project's own date", () => {
  const st = { A: { version: "opening account", at: "2026-07-03T00:00:00Z", by: "ruth" }, B: null };
  const w = shared(() => [{ id: "PRJ-A", title: "A", current: st.A }, { id: "PRJ-B", title: "B", current: st.B }], { sev: true });
  let items = ofKind(w.read(null, "class:admin"), "stance-changed-here-not-elsewhere");
  assert.deepEqual(items.map((i) => [i.class, i.subject.id, i.subject.version]), [["FINDING", "PRJ-A", "opening account"]],
    "ONE item, for the one project that took a dated act; B, which moved nothing, is not the subject of one");
  const it = items[0];
  assert.equal(it.id, `FINDING::stance-changed-here-not-elsewhere::${INQ}::PRJ-A`);
  assert.deepEqual(it.basis.elsewhere.map((e) => [e.project, e.version, e.state]), [["PRJ-B", null, "stands_on_nothing"]],
    "enumerated and never summarised: B stands on NOTHING, a different fact from a different reading");
  assert.deepEqual(it.basis.drawing_projects, ["PRJ-A", "PRJ-B"], "the projects basis-versions answers as drawing: never the withdrawn SEV, never C");
  assert.ok(!JSON.stringify(it.basis).includes("PRJ-SEV") && !JSON.stringify(it.basis).includes("PRJ-C"));
  assert.deepEqual(it.age, { state: "determined", since: "2026-07-03T00:00:00Z", ms: NOW - Date.parse("2026-07-03T00:00:00Z") },
    "the project's own authored date, never the read's clock");
  assert.deepEqual(it.basis.here, { project: "PRJ-A", title: "A", version: "opening account", at: "2026-07-03T00:00:00Z", by: "ruth" });
  assert.deepEqual([it.basis.pointer.kind, it.basis.pointer.field, it.basis.pointer.settings_row],
    ["dated_frontmatter_field", "current_versions", false], "the pointer's shape is published on the item");
  assert.deepEqual([it.options_grain.offered, it.options_grain.missing, /versioncurrent/.test(it.options_grain.detail)],
    ["document", "stance", true], "no act moving another project's stance is offered, and the gap is declared");
  assert.deepEqual(it.options, [{ id: "opt", on: [INQ] }]);
  assert.deepEqual(it.basis.bounds.inquiries_truncated, false);
  // both diverge: two items, each naming the other's actual reading
  st.B = { version: "the audit alone", at: "2026-07-04T00:00:00Z", by: "bob" };
  items = ofKind(w.read(null, "class:admin"), "stance-changed-here-not-elsewhere");
  assert.deepEqual(items.map((i) => [i.subject.id, i.basis.elsewhere.map((e) => [e.project, e.version, e.state])]).sort(),
    [["PRJ-A", [["PRJ-B", "the audit alone", "stands_elsewhere"]]], ["PRJ-B", [["PRJ-A", "opening account", "stands_elsewhere"]]]]);
  // convergence is silence
  st.B = { version: "opening account", at: "2026-07-05T00:00:00Z", by: "bob" };
  assert.equal(ofKind(w.read(null, "class:admin"), "stance-changed-here-not-elsewhere").length, 0,
    "two projects on ONE reading mint nothing: agreement is not a notification");
  // an unreadable date is undetermined, never measured from the read
  st.B = { version: "the audit alone", at: "yesterday", by: "bob" };
  const b = byId(w.read(null, "class:admin"))[`FINDING::stance-changed-here-not-elsewhere::${INQ}::PRJ-B`];
  assert.deepEqual([b.age.state, b.age.reason], ["undetermined", "unparseable_stance_date"]);
});

test("R2: a legacy-typed shared question diverges as an inquiry does (the map rule)", () => {
  const w = shared(() => [{ id: "PRJ-A", title: "A", current: { version: "legacy reading", at: iso(NOW), by: "ruth" } },
                          { id: "PRJ-B", title: "B", current: null }], { type: "focus" });
  assert.deepEqual(ofKind(w.read(null, "class:admin"), "stance-changed-here-not-elsewhere").map((i) => [i.subject.id, i.subject.version]),
    [["PRJ-A", "legacy reading"]]);
});

test("R2: new-version-arrived-from-another-team reads the team from the run's context, never infers it; the silence it cannot attribute is counted both ways; the source is a declared exclusion", () => {
  const versions = [
    { name: "opening account", state: "accepted", hidden: false, run: "RUN-A", author: "ruth", at: "2026-07-03T00:00:00Z", description: "d1" },
    { name: "the audit alone", state: "accepted", hidden: true, run: "RUN-B", author: "ruth", at: "2026-07-04T00:00:00Z", description: "d2" },
    { name: "composed by hand", state: "suggested", hidden: false, run: null, author: "ruth", at: "2026-07-05T00:00:00Z" },
    { name: "read under an unrelated project", state: "suggested", hidden: false, run: "RUN-C", author: "ruth", at: "2026-07-06T00:00:00Z" }];
  const runs = { "RUN-A": "PRJ-A", "RUN-B": "PRJ-B", "RUN-C": "PRJ-C" };
  const w = shared(() => [{ id: "PRJ-A", title: "A", current: null }, { id: "PRJ-B", title: "B", current: null }], {
    basisVersions: { basisVersions: () => ({ ok: true, truncated: false, versions }) },
    aiRuns: { runFor: (run) => (runs[run] ? { run, context_type: "project", context_id: runs[run] } : null) } });
  const r = w.read(null, "class:admin");
  const items = ofKind(r, "new-version-arrived-from-another-team").sort((x, y) => (x.basis.version < y.basis.version ? -1 : 1));
  assert.deepEqual(items.map((i) => [i.basis.version, i.basis.from_project]), [["opening account", "PRJ-A"], ["the audit alone", "PRJ-B"]],
    "two items, not three or four: a hand-composed reading and one from a run under a project not drawing here mint nothing");
  assert.deepEqual(items.map((i) => [i.basis.team_attribution.state, i.basis.team_attribution.via]),
    [["determined", "ai_runs.context"], ["determined", "ai_runs.context"]]);
  assert.ok(/D-266/.test(items[0].basis.team_attribution.detail), "the declared gap is named on the item");
  assert.deepEqual([items[0].case.ancestors.map((a) => a.id), items[0].case.excluded.map((e) => [e.id, e.reason])],
    [["PRJ-B"], [["PRJ-A", "authored_here"]]], "A's reading is not filed under A, and the removal is declared");
  assert.deepEqual([items[1].case.ancestors.map((a) => a.id), items[1].case.excluded.map((e) => e.id)], [["PRJ-A"], ["PRJ-B"]], "the mirror");
  assert.deepEqual([items[0].age.state, items[0].age.since], ["determined", "2026-07-03T00:00:00Z"]);
  assert.ok(/is not a reading being adopted/.test(items[0].detail));
  assert.deepEqual([items[1].basis.state, items[1].basis.hidden], ["accepted", true], "a hidden reading is returned and flagged, never filtered");
  assert.deepEqual(r.facts.unattributed, { count: 2, inquiries: [INQ] },
    "D-266: the silence is counted, both ways of being unattributable, as an exact figure, naming no reading");
  assert.ok(!JSON.stringify(r.facts.unattributed).includes("composed by hand"));
  assert.deepEqual([items[0].options_grain.offered, items[0].options_grain.missing], ["document", "version"]);
});

test("R2: shared-inquiry-concluded-by-another-project tells the other projects and moves none, its elsewhere enumerating where each stands, concluded, withdrawn or not", () => {
  const concluded = { "PRJ-A": { version: "paper trail", claim: "it followed the process", by: "ruth", at: "2026-07-07T00:00:00Z" },
                      "PRJ-B": { version: "the audit", claim: "it bypassed the vote", by: "ruth", at: "2026-07-08T00:00:00Z" } };
  const record = { "PRJ-A": { act: "concluded", version: "paper trail", at: "2026-07-07T00:00:00Z" },
                   "PRJ-B": { act: "concluded", version: "the audit", at: "2026-07-08T00:00:00Z" }, "PRJ-D": null };
  const w = shared(() => [{ id: "PRJ-A", title: "A", current: null }, { id: "PRJ-B", title: "B", current: null },
                          { id: "PRJ-D", title: "D", current: null }], {
    basisVersions: { conclusionOf: (p) => concluded[p] || null, conclusionRecordOf: (p) => ({ stance: record[p] || null }) } });
  w.bundle("PRJ-D", "project"); w.cite("PRJ-D", INQ);
  let m = byId(w.read(null, "class:admin"));
  const aboutA = m[`FINDING::shared-inquiry-concluded-by-another-project::${INQ}::PRJ-A`];
  const aboutB = m[`FINDING::shared-inquiry-concluded-by-another-project::${INQ}::PRJ-B`];
  assert.deepEqual([aboutA.class, aboutA.basis.version, aboutB.basis.version], ["FINDING", "paper trail", "the audit"],
    "each conclusion is told, one item per concluding project, naming its reading");
  assert.deepEqual([aboutA.case.ancestors.map((a) => a.id).sort(), aboutA.case.excluded.map((e) => [e.id, e.reason])],
    [["PRJ-B", "PRJ-D"], [["PRJ-A", "concluded_here"]]], "not filed under the project that concluded, and the removal declared");
  assert.deepEqual(aboutA.basis.elsewhere.map((e) => [e.project, e.state, e.version]),
    [["PRJ-B", "concluded", "the audit"], ["PRJ-D", "not_concluded", null]]);
  assert.deepEqual([aboutA.subject.kind, aboutA.subject.id, aboutA.basis.claim], ["project_conclusion", "PRJ-A", "it followed the process"]);
  assert.ok(/NOTHING about what any other project stands on or has concluded has moved/.test(aboutA.detail));
  assert.deepEqual(aboutA.age, { state: "determined", since: "2026-07-07T00:00:00Z", ms: NOW - Date.parse("2026-07-07T00:00:00Z") });
  // B withdraws: the others are no longer told B concluded, and A's notice shows B withdrawn, never "not concluded"
  delete concluded["PRJ-B"];
  record["PRJ-B"] = { act: "withdrawn", version: "the audit", at: "2026-07-09T00:00:00Z" };
  m = byId(w.read(null, "class:admin"));
  assert.equal(m[`FINDING::shared-inquiry-concluded-by-another-project::${INQ}::PRJ-B`], undefined);
  assert.deepEqual(m[`FINDING::shared-inquiry-concluded-by-another-project::${INQ}::PRJ-A`].basis.elsewhere
    .find((e) => e.project === "PRJ-B").state, "withdrawn");
});

test("R2: the shared question purged, all three kinds go quiet though the citing projects' edges remain (derived on read, nothing stored)", () => {
  const w = shared(() => [{ id: "PRJ-A", title: "A", current: { version: "v1", at: iso(NOW), by: "ruth" } },
                          { id: "PRJ-B", title: "B", current: { version: "v2", at: iso(NOW), by: "bob" } }], {
    basisVersions: { basisVersions: () => ({ ok: true, truncated: false, versions: [{ name: "v1", state: "accepted", run: "RUN-A", at: iso(NOW) }] }),
                     conclusionOf: (p) => (p === "PRJ-A" ? { version: "v1", claim: "c", by: "ruth", at: iso(NOW) } : null) },
    aiRuns: { runFor: (run) => ({ run, context_type: "project", context_id: "PRJ-A" }) } });
  const kinds = (r) => [...new Set(r.items.filter((i) => i.basis && i.basis.inquiry === INQ).map((i) => i.kind))].sort();
  assert.deepEqual(kinds(w.read(null, "class:admin")),
    ["new-version-arrived-from-another-team", "shared-inquiry-concluded-by-another-project", "stance-changed-here-not-elsewhere"]);
  w.run(`DELETE FROM bundles WHERE bundle_id=?`, INQ);
  assert.deepEqual(kinds(w.read(null, "class:admin")), [], "a question that no longer exists is announced by nobody");
  assert.ok(w.db.prepare(`SELECT COUNT(*) AS n FROM refs WHERE target_id=?`).get(INQ).n >= 2, "while the citing edges outlive it");
});

test("R11 (D-480): a hidden project's citations, or a hidden target, take no slot in the shared-question page; one the viewer can see does", () => {
  const CAP = 64;                                      // the published bound, QUEUE_SHARED_INQUIRIES_MAX
  const QQ = "INQ-2026-9480-zz-shared";                // sorts after every filler
  const w = world({ basisVersions: {
    projectsDrawingOn: (inq) => drawing(inq === QQ ? [{ id: "PRJ-VA", title: "VA", current: { version: "v1", at: iso(NOW), by: "vera" } },
                                                     { id: "PRJ-VB", title: "VB", current: null }] : []),
    basisVersions: () => ({ ok: true, truncated: false, versions: [] }), conclusionOf: () => null } });
  w.member("vera");
  w.bundle(QQ, "inquiry");
  for (const p of ["PRJ-VA", "PRJ-VB", "PRJ-VP"]) { w.bundle(p, "project"); w.join(p, "vera"); }
  for (const p of ["PRJ-H1", "PRJ-H2"]) w.bundle(p, "project");        // vera never joins these
  w.cite("PRJ-VA", QQ); w.cite("PRJ-VB", QQ);
  const mine = (r) => ofKind(r, "stance-changed-here-not-elsewhere").filter((i) => i.basis.inquiry === QQ);
  const bounds = (r) => mine(r).map((i) => [i.basis.bounds.inquiries_examined, i.basis.bounds.inquiries_bound, i.basis.bounds.inquiries_truncated]);
  assert.deepEqual(bounds(w.read("vera")), [[1, CAP, false]], "the fixture is live: her divergence, one question examined");
  // two hidden projects jointly cite 70 fillers that sort before her question
  for (let i = 1; i <= 70; i++) { const f = `INQ-2026-9480-a${String(i).padStart(2, "0")}`; w.cite("PRJ-H1", f); w.cite("PRJ-H2", f); }
  assert.deepEqual(bounds(w.read("vera")), [[1, CAP, false]], "a hidden project's citations move nothing and take no slot");
  assert.equal(mine(w.read(null, "class:admin")).length, 0, "the witness: a credential the gate does not filter sees the crowding push it off");
  // her visible candidates filled to exactly the bound
  for (let i = 1; i < CAP; i++) { const f = `INQ-2026-9480-c${String(i).padStart(3, "0")}`; w.cite("PRJ-VA", f); w.cite("PRJ-VB", f); }
  assert.deepEqual(bounds(w.read("vera")), [[CAP, CAP, false]], "the page exactly full and not truncated");
  w.cite("PRJ-VA", "PRJ-H1"); w.cite("PRJ-VB", "PRJ-H1");
  assert.deepEqual(bounds(w.read("vera")), [[CAP, CAP, false]], "a target she cannot see takes no slot");
  w.cite("PRJ-VA", "PRJ-VP"); w.cite("PRJ-VB", "PRJ-VP");
  assert.deepEqual(bounds(w.read("vera")), [[CAP, CAP, true]], "a target she can see does, and the page says it was cut");
  assert.ok(!JSON.stringify(w.read("vera")).includes("PRJ-H1"), "the hidden project is named nowhere");
});
