/* T18's converts (K619): the shares of the old suites (`bio-plane/test/`) that prove queue's requirements, at its
   interface. Each test names its old suite in brackets: d125-findingmute, d266scope, peritem, project-discoverable,
   queue-conditions, queue-state, queue, severedhomes. The old suites are not deleted here (K619 (3)). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const FACTS = { objective_gap: { bound: 50, truncated: false }, unattributed: { count: 0, inquiries: [] },
                contradiction: { bound: 50, truncated: false }, dispositions: [] };
/** A world whose producers answer `make(args)` items, each homed through R7's walk over its `subjects`. */
function produced(make, fakes = {}, facts = {}) {
  return world({ ...fakes, producers: { feedItems: (a) => ({ facts: { ...FACTS, ...facts },
    items: make(a).map(({ subjects = [], ...it }) => ({ subject: { kind: "bundle", id: subjects[0] ?? null }, summary: it.kind,
      detail: null, basis: { source: "stub", detail: "stubbed" }, age: { state: "undetermined", reason: "derived_on_read" },
      assignee: null, assignee_role: null, options: a.optionsOf(subjects), ...it, case: a.homesOf(subjects) })) }) } });
}
const ids = (f) => f.items.map((i) => i.id);

/* ------------------------------------------------------------------ severedhomes */

test("R7 (severedhomes): every severed spelling of an edge is not a step; one live spelling keeps the home; a withdrawn sole home leaves the subject ungrouped and determined", () => {
  const asked = [];
  /* severed: PRJ-SEV's cites of DOC-1; INQ-BOTH's basis leg to DOC-1 (its cites stays live); INQ-GONE's basis leg and cites */
  const severed = new Set(["PRJ-SEV|DOC-1|cites", "INQ-BOTH|DOC-1|null", "INQ-GONE|DOC-1|null", "INQ-GONE|DOC-1|cites",
                           "PRJ-ONLY|DOC-2|cites"]);
  const w = world({ connections: { edgeSevered: (citing, target, rel) => { asked.push([citing, target, rel]);
    return severed.has(`${citing}|${target}|${rel}`); } } });
  w.bundle("DOC-1"); w.bundle("DOC-2");
  w.bundle("PRJ-SEV", "project"); w.cite("PRJ-SEV", "DOC-1");
  w.bundle("PRJ-LIVE", "project"); w.cite("PRJ-LIVE", "DOC-1");
  w.bundle("INQ-BOTH", "inquiry"); w.leg("INQ-BOTH", "DOC-1"); w.cite("INQ-BOTH", "DOC-1");
  w.bundle("INQ-GONE", "inquiry"); w.leg("INQ-GONE", "DOC-1"); w.cite("INQ-GONE", "DOC-1");
  w.bundle("PRJ-ONLY", "project"); w.cite("PRJ-ONLY", "DOC-2");
  // a severed edge's citing node is not reached through it, so nothing above it is a home either
  w.bundle("PRJ-ABOVE", "project"); w.cite("PRJ-ABOVE", "PRJ-SEV");
  w.task("TASK-2026-0001-a", "DOC-1"); w.task("TASK-2026-0002-b", "DOC-2");
  const f = byId(w.feed(null, "class:admin"));
  const a = f["TASK-2026-0001-a"].case;
  assert.deepEqual(a.ancestors.map((x) => x.id), ["INQ-BOTH", "PRJ-LIVE"]);
  assert.deepEqual([a.state, a.reasons, a.ungrouped], ["determined", [], false], "dropping a withdrawn edge is no admission of doubt");
  assert.deepEqual(f["TASK-2026-0002-b"].case, { state: "determined", ungrouped: true, reasons: [], depth_bound: 6, ancestors: [] });
  // the basis spelling is asked with no rel, the citation with `cites`
  assert.ok(asked.some(([c, t, r]) => c === "INQ-GONE" && t === "DOC-1" && r === null));
  assert.ok(asked.some(([c, t, r]) => c === "INQ-GONE" && t === "DOC-1" && r === "cites"));
});

/* ------------------------------------------------------------------ d125-findingmute */

test("R14, R20 (d125-findingmute): case_kinds is {} beside cases [] with no case mute; unmuting a case's last kind leaves both empty", () => {
  const w = world();
  w.member("alice"); w.bundle("INQ-1", "inquiry");
  let m = w.feed("alice").mute;
  assert.deepEqual([m.cases, m.case_kinds, m.items], [[], {}, []]);
  assert.deepEqual(w.q.queueMute({ member: "alice", viewer: "member:alice", case: "INQ-1", kinds: ["overdue_successor"] }).muted_kinds,
    ["overdue_successor"]);
  m = w.feed("alice").mute;
  assert.deepEqual([m.cases, m.case_kinds], [["INQ-1"], { "INQ-1": ["overdue_successor"] }], "a kind holding nothing back is still named");
  const undo = w.q.queueMute({ member: "alice", viewer: "member:alice", case: "INQ-1", kinds: m.case_kinds["INQ-1"], unmute: true });
  assert.deepEqual([undo.ok, undo.removed, undo.muted_kinds], [true, ["overdue_successor"], []]);
  m = w.feed("alice").mute;
  assert.deepEqual([m.cases, m.case_kinds], [[], {}], "undone from what the feed published alone");
});

test("R4, R14 (d125-findingmute): a FINDING is suppressed by item (scope item) and by kind on its case (scope case); the same id under a kind not named is not held", () => {
  let kind = "missing_predecessor";
  const w = produced(() => [{ id: "FINDING::p::kick", class: "FINDING", kind: "missing_predecessor", subjects: ["DOC-1"] },
                            { id: "FINDING::p::contract", class: "FINDING", kind, subjects: ["DOC-1"] }]);
  w.member("alice"); w.member("bob"); w.bundle("DOC-1"); w.bundle("INQ-1", "inquiry"); w.leg("INQ-1", "DOC-1");
  assert.equal(w.q.queueMute({ member: "alice", viewer: "member:alice", item: "FINDING::p::kick" }).ok, true);
  let f = w.feed("alice");
  assert.deepEqual(f.mute.suppressed.map((s) => [s.id, s.class, s.scope, s.case]), [["FINDING::p::kick", "FINDING", "item", null]]);
  assert.deepEqual(ids(f), ["FINDING::p::contract"], "an item mute is one item");
  assert.deepEqual(ids(w.feed("bob")), ["FINDING::p::contract", "FINDING::p::kick"], "the mute is alice's alone");
  w.q.queueMute({ member: "alice", viewer: "member:alice", item: "FINDING::p::kick", unmute: true });
  // DEC-10: a case mute of the stage's old kind does not hold it once its kind is one the member never named
  w.q.queueMute({ member: "alice", viewer: "member:alice", case: "INQ-1", kinds: ["missing_predecessor"] });
  f = w.feed("alice");
  assert.deepEqual(f.mute.suppressed.map((s) => [s.id, s.kind, s.scope, s.case]),
    [["FINDING::p::kick", "missing_predecessor", "case", "INQ-1"], ["FINDING::p::contract", "missing_predecessor", "case", "INQ-1"]]);
  kind = "overdue_successor";
  f = w.feed("alice");
  assert.deepEqual(ids(f), ["FINDING::p::contract"]);
  assert.equal(byId(f)["FINDING::p::contract"].kind, "overdue_successor");
});

test("R19 (d125-findingmute): KIND_NOT_PERSONAL echoes the item it refused and names the act that clears an obligation", () => {
  const w = world();
  w.member("alice"); w.bundle("INF-1"); w.task("TASK-2026-0001-a", "INF-1");
  const r = w.q.queueMute({ member: "alice", viewer: "member:alice", item: "TASK-2026-0001-a" });
  assert.deepEqual([r.reason, r.item, r.kind_class, r.case], ["KIND_NOT_PERSONAL", "TASK-2026-0001-a", "OBLIGATION", null]);
  assert.match(r.detail, /op=taskresolve/);
  assert.match(r.detail, /disposition\.instead/);
});

/* ------------------------------------------------------------------ d266scope */

test("R12, R13, R15, R27 (d266scope): one team's decision: its home and projects shrink and say so; disposed names state, author and reason; re-triage keeps one row", () => {
  const F = "FINDING::stance-changed-here-not-elsewhere::INQ-S::PRJ-B";
  const w = produced(() => [{ id: F, class: "FINDING", kind: "stance-changed-here-not-elsewhere", subjects: ["INQ-S"] }]);
  w.member("ruth"); w.bundle("INQ-S", "inquiry");
  for (const p of ["PRJ-A", "PRJ-B"]) { w.bundle(p, "project"); w.join(p, "ruth"); w.cite(p, "INQ-S"); }
  let it = byId(w.feed("ruth"))[F];
  assert.deepEqual([it.disposition.available, it.disposition.scope, it.disposition.keyed_on, it.disposition.key,
                    it.disposition.finding, it.disposition.projects, it.disposition.requires],
    [true, "project", ["project", "finding"], null, F, ["PRJ-A", "PRJ-B"], ["project", "finding"]]);
  assert.match(it.disposition.detail, /one project's own property/);
  const pd = (a) => w.q.proposeDispose({ decidedBy: "ruth", viewer: "member:ruth", identity: "member:ruth", ...a });
  const act = pd({ project: "PRJ-A", finding: F, to: "dismissed", reason: "staying where we are" });
  assert.deepEqual([act.ok, act.scope, act.project, act.finding, act.key, act.state, act.decided_by, act.bundle],
    [true, "project", "PRJ-A", F, `PRJ-A::${F}`, "dismissed", "ruth", null], "the act echoes project and finding");
  let f = w.feed("ruth"); it = byId(f)[F];
  assert.deepEqual(it.case.ancestors.map((a) => a.id), ["PRJ-B"]);
  assert.deepEqual(it.case.disposed_by.map((d) => [d.id, d.reason]), [["PRJ-A", "disposed_by_that_project"]]);
  assert.match(it.case.disposed_by[0].detail, /judgment layer/);
  assert.deepEqual([it.disposition.projects, it.disposition.disposed_by], [["PRJ-B"], ["PRJ-A"]]);
  let rec = f.disposed.findings.filter((d) => d.finding === F);
  assert.deepEqual(rec.map((d) => [d.id, d.scope, d.project, d.state, d.decided_by, d.reason]),
    [[F, "project", "PRJ-A", "dismissed", "ruth", "staying where we are"]]);
  assert.match(f.disposed.detail, /scope: instance/); assert.match(f.disposed.detail, /scope: project/);
  // re-triage: one row, the new decision, the old reason gone
  assert.equal(pd({ project: "PRJ-A", finding: F, to: "deferred", reason: "after the budget cycle" }).state, "deferred");
  f = w.feed("ruth"); rec = f.disposed.findings.filter((d) => d.finding === F);
  assert.deepEqual(rec.map((d) => [d.state, d.reason]), [["deferred", "after the budget cycle"]]);
  assert.deepEqual(byId(f)[F].case.ancestors.map((a) => a.id), ["PRJ-B"], "deferring ages it as dismissing did");
});

test("R15 (d266scope): an instance-scope decision is published with no project, keyed on the pair, beside the project-scope ones", () => {
  const w = world({ progressions: { proposalsFeed: () => ({ instances: [], proposals: [], dispositions: [
    { key: "flow::filed", progression_key: "flow", stage_key: "filed", state: "dismissed", reason: "not obtainable",
      decided_by: "ruth", at: iso(NOW), definition_version: 1, definition_version_state: "current", applies: true,
      applies_because: "same_version" }] }) } });
  const d = w.feed(null, "class:admin").disposed.findings;
  assert.deepEqual(d.map((x) => [x.id, x.scope, x.project, x.key, x.state, x.decided_by, x.reason]),
    [["FINDING::flow::filed", "instance", null, "flow::filed", "dismissed", "ruth", "not obtainable"]]);
});

/* ------------------------------------------------------------------ peritem */

test("R27 (peritem): a set mixing {project, finding}, {key} and a CONDITION: each item by its own identity group; a shared project and version reach only the shape they belong to", () => {
  const calls = [];
  const w = world({ progressions: { disposeProposal: (a) => { calls.push(a);
    return { ok: true, key: `${a.progressionKey}::${a.stageKey}`, progression_key: a.progressionKey, definition_version: a.definitionVersion }; } } });
  w.member("iris"); for (const p of ["PRJ-A", "PRJ-B"]) { w.bundle(p, "project"); w.join(p, "iris"); }
  const SA = "FINDING::stance-changed-here-not-elsewhere::INQ::PRJ-A", SB = "FINDING::stance-changed-here-not-elsewhere::INQ::PRJ-B";
  const pd = (a) => w.q.proposeDispose({ decidedBy: "iris", viewer: "member:iris", identity: "member:iris", ...a });
  const r = pd({ to: "dismissed", reason: "mixed", definitionVersion: 1,
                 items: [{ project: "PRJ-A", finding: SB }, { key: "flow::heard" }, { key: "CONDITION::governor-holding-host::h" }] });
  assert.deepEqual([r.weight, r.count, r.applied, r.retained], ["per-item", 3, 2, 1]);
  assert.deepEqual(r.items.map((i) => i.outcome), ["applied", "applied", "retained"]);
  assert.deepEqual([r.items[0].scope, r.items[0].project, r.items[0].finding, r.items[0].decided_by], ["project", "PRJ-A", SB, "iris"]);
  assert.deepEqual([r.items[1].project, r.items[1].progression_key, r.items[1].definition_version], [undefined, "flow", 1]);
  assert.deepEqual([r.items[2].reason, r.items[2].instead, r.items[2].check], ["CLASS_NOT_DISPOSED", "queuemute", "C-33.44"]);
  // two items naming different projects: each against its own
  const r2 = pd({ to: "deferred", reason: "each its own", items: [{ project: "PRJ-B", finding: SB }, { project: "PRJ-A", finding: SA }] });
  assert.deepEqual([r2.ok, r2.applied, r2.items[0].project, r2.items[1].project], [true, 2, "PRJ-B", "PRJ-A"]);
  // a project named once for the set reaches the item naming only a finding, never the item naming a key
  const r3 = pd({ to: "dismissed", reason: "once", project: "PRJ-A", definitionVersion: 1, items: [{ finding: SA }, { key: "flow::voted" }] });
  assert.deepEqual([r3.ok, r3.applied, r3.items[0].scope, r3.items[0].project, r3.items[1].scope, r3.items[1].progression_key],
    [true, 2, "project", "PRJ-A", undefined, "flow"]);
  // named in both places, one act
  assert.equal(pd({ to: "deferred", reason: "both", project: "PRJ-A", items: [{ project: "PRJ-A", finding: SA }] }).ok, true);
  assert.deepEqual(calls.map((c) => [c.progressionKey, c.stageKey, c.definitionVersion, c.decidedBy]),
    [["flow", "heard", 1, "iris"], ["flow", "voted", 1, "iris"]]);
});

test("R8 (peritem): a task forwarded away from a member leaves her feed and is in the feed of the member it is with; her resolve of it is retained TASK_NOT_YOURS (K606)", () => {
  const w = world();
  w.member("iris", { role: "admin" }); w.member("mona"); w.member("nate");
  w.bundle("INFO-2026-0001-doc"); w.task("TASK-2026-0001-a", "INFO-2026-0001-doc", { assignee: "mona", role: "member" });
  assert.ok(ids(w.feed("mona")).includes("TASK-2026-0001-a"));
  assert.equal(w.tasks.taskForward({ id: "TASK-2026-0001-a", to: "nate", actor: "iris" }).ok, true);
  assert.ok(!ids(w.feed("mona")).includes("TASK-2026-0001-a"));
  assert.ok(ids(w.feed("nate")).includes("TASK-2026-0001-a"));
  const r = w.tasks.taskResolve({ items: [{ id: "TASK-2026-0001-a" }], actor: "mona" });
  assert.deepEqual(r.items.map((i) => [i.outcome, i.reason]), [["retained", "TASK_NOT_YOURS"]]);
  assert.ok(ids(w.feed("nate")).includes("TASK-2026-0001-a"), "still live, with the member it is with");
});

/* ------------------------------------------------------------------ project-discoverable */

test("R27, R33 (project-discoverable): on the project arm a hidden project answers as one never minted; a discoverable one C-70.1 with its id and name only", () => {
  const w = world();
  w.member("iris"); w.member("vera");
  w.bundle("PRJ-X", "project", { title: "The X project" }); w.join("PRJ-X", "iris", { owner: true });
  const pd = (project) => w.q.proposeDispose({ project, finding: "F-1", to: "deferred", reason: "waiting", decidedBy: "vera",
                                               viewer: "member:vera", identity: "member:vera" });
  const hidden = pd("PRJ-X"), never = pd("PRJ-NONE");
  assert.equal(hidden.reason, "NO_SUCH_PROJECT");
  assert.deepEqual({ ...hidden, project: null }, { ...never, project: null }, "hidden reads absent");
  assert.equal(w.membership.projectVisibilitySet({ projectId: "PRJ-X", setting: "discoverable", by: "iris", viewer: "member:iris" }).ok, true);
  const seen = pd("PRJ-X");
  assert.deepEqual([seen.reason, seen.check, seen.project, seen.name], ["PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", "PRJ-X", "The X project"]);
  assert.deepEqual(Object.keys(seen).sort(), ["check", "code", "detail", "name", "ok", "project", "reason", "translation"]);
  assert.equal(w.all(`SELECT count(*) c FROM finding_dispositions`)[0].c, 0);
});

/* ------------------------------------------------------------------ queue-conditions */

test("R6, R14, R31 (queue-conditions): a CONDITION ranks last; a member's case mute hides its kind for her alone, a new kind on the same case still reaches her, the obligation is untouched", () => {
  let kinds = ["governor-holding-host"];
  const w = produced(() => kinds.map((k) => ({ id: `CONDITION::${k}::h`, class: "CONDITION", kind: k, subjects: ["DOC-1"] })));
  w.member("carol"); w.member("dave"); w.bundle("DOC-1"); w.bundle("INQ-1", "inquiry"); w.leg("INQ-1", "DOC-1");
  w.task("TASK-2026-0001-a", "DOC-1");
  assert.deepEqual(w.feed("carol").items.map((i) => i.class), ["OBLIGATION", "CONDITION"]);
  const m = w.q.queueMute({ member: "carol", viewer: "member:carol", case: "INQ-1", kinds: ["governor-holding-host"] });
  assert.deepEqual(Object.keys(m.wrote).filter((k) => m.wrote[k] > 0), ["queue_state"]);
  assert.deepEqual(ids(w.feed("carol")), ["TASK-2026-0001-a"]);
  assert.deepEqual(ids(w.feed("dave")), ["TASK-2026-0001-a", "CONDITION::governor-holding-host::h"]);
  kinds = ["governor-holding-host", "partial-capture-outstanding"];
  assert.deepEqual(ids(w.feed("carol")), ["TASK-2026-0001-a", "CONDITION::partial-capture-outstanding::h"], "a kind not named still surfaces");
  // the feed reports and never mutates: two reads, one answer
  assert.deepEqual(w.feed("dave"), w.feed("dave"));
});

test("R5, R19 (queue-conditions): a member may mute a condition kind no producer emits yet; the mint refuses an uncatalogued kind in every class", () => {
  const w = world();
  w.member("carol"); w.bundle("INQ-1", "inquiry");
  assert.deepEqual(w.q.queueMute({ member: "carol", viewer: "member:carol", case: "INQ-1", kinds: ["text-undetermined"] }).muted_kinds,
    ["text-undetermined"]);
  for (const cls of ["OBLIGATION", "FINDING", "CONDITION"]) {
    const r = produced(() => [{ id: `${cls}::x`, class: cls, kind: "not-in-the-catalogue" }]).feed(null, "class:admin");
    assert.deepEqual([r.ok, r.reason, r.check], [false, "NO_SUCH_KIND", "C-31.2"], cls);
  }
});

/* ------------------------------------------------------------------ queue-state */

test("R4, R14 (queue-state): a mute is keyed (member, case): an item under a muted and an unmuted home is held, one only under another case is not, an ungrouped one cannot be", () => {
  const w = produced(() => [
    { id: "CONDITION::render-deferred::both", class: "CONDITION", kind: "render-deferred", subjects: ["DOC-BOTH"] },
    { id: "CONDITION::render-deferred::other", class: "CONDITION", kind: "render-deferred", subjects: ["DOC-2"] },
    { id: "CONDITION::render-deferred::lone", class: "CONDITION", kind: "render-deferred", subjects: ["DOC-LONE"] }]);
  w.member("carol"); w.member("dave");
  for (const d of ["DOC-BOTH", "DOC-2", "DOC-LONE"]) w.bundle(d);
  w.bundle("INQ-1", "inquiry"); w.bundle("INQ-2", "inquiry");
  w.leg("INQ-1", "DOC-BOTH"); w.leg("INQ-2", "DOC-BOTH"); w.leg("INQ-2", "DOC-2");
  w.q.queueMute({ member: "carol", viewer: "member:carol", case: "INQ-1", kinds: ["render-deferred"] });
  const f = w.feed("carol");
  assert.deepEqual(ids(f), ["CONDITION::render-deferred::lone", "CONDITION::render-deferred::other"]);
  assert.deepEqual(f.mute.suppressed.map((s) => [s.id, s.case]), [["CONDITION::render-deferred::both", "INQ-1"]]);
  assert.equal(byId(f)["CONDITION::render-deferred::lone"].case.ungrouped, true);
  assert.equal(w.feed("dave").items.length, 3, "another member's feed is unchanged by carol's mute");
});

test("R21, R30, R40 (queue-state): a mute and a snooze write queue_state alone: no task, disposition or bundle moves, and the feed's items are unchanged by the snooze", () => {
  const w = world();
  w.member("carol"); w.bundle("INF-1"); w.bundle("INQ-1", "inquiry"); w.leg("INQ-1", "INF-1"); w.task("TASK-2026-0001-a", "INF-1");
  const snap = () => ({ tasks: w.all(`SELECT * FROM tasks`), disp: w.all(`SELECT * FROM finding_dispositions`),
                        bundles: w.all(`SELECT bundle_id, current_state FROM bundles`) });
  const before = snap();
  const items = ids(w.feed("carol"));
  w.q.queueMute({ member: "carol", viewer: "member:carol", case: "INQ-1", kinds: ["render-deferred"] });
  const s = w.q.queueSnooze({ member: "carol", viewer: "member:carol", case: "INQ-1", until: iso(NOW + 86400000) });
  assert.deepEqual(s.wrote, { queue_state: 1, tasks: 0, proposal_dispositions: 0, bundles: 0 });
  assert.deepEqual(snap(), before);
  assert.deepEqual(ids(w.feed("carol")), items, "a snooze hides nothing");
  assert.deepEqual(w.all(`SELECT muted_kinds FROM queue_state`).map((r) => r.muted_kinds), ["render-deferred"], "the mute beside it is kept");
});

/* ------------------------------------------------------------------ queue */

test("R6, R8 (queue): an OBLIGATION and a FINDING under one contract, key for key; subject is what it is about, case where it is filed", () => {
  const w = world({ progressions: { proposalsFeed: () => ({ instances: [], dispositions: [], proposals: [
    { key: "proc::sol", progression_key: "proc", progression_label: "P", stage_key: "sol", stage_label: "S", required: "always",
      definition_version: 1, n: 1, kinds: ["missing_predecessor"], grade: null, grade_determined: false, overdue: false,
      overdue_count: 0, surfaced_by: "machine", prior_disposition: null, instances: [] }] }) } });
  w.member("dave"); w.bundle("INF-1"); w.bundle("INQ-1", "inquiry"); w.leg("INQ-1", "INF-1"); w.task("TASK-2026-0001-a", "INF-1");
  const f = w.feed("dave");
  const [ob, fi] = [byId(f)["TASK-2026-0001-a"], byId(f)["FINDING::proc::sol"]];
  const CONTRACT = ["id", "class", "kind", "case", "subject", "summary", "detail", "basis", "age", "assignee", "assignee_role",
                    "options", "disposition"];
  for (const it of [ob, fi]) for (const k of CONTRACT) assert.ok(k in it, `${it.id} ${k}`);
  assert.deepEqual([ob.class, fi.class], ["OBLIGATION", "FINDING"]);
  assert.deepEqual(ob.subject, { kind: "bundle", id: "INF-1" });
  assert.equal(ob.basis.refers_to, "INF-1");
  assert.deepEqual(ob.case.ancestors.map((a) => a.id), ["INQ-1"], "refers_to and case are never collapsed");
  assert.deepEqual(Object.keys(f.counts), ["obligation", "finding", "condition", "ungrouped", "case_undetermined", "suppressed"]);
});
