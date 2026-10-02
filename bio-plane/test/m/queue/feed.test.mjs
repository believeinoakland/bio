/* queueFeed (op=queue) at its interface: the answer's shape, the homes, the obligations, the mint, options and
   dispositions, the per-project ageing, mutes, the disposed and resolved blocks, snoozes, and the control plane's
   decoration (R6–R8, R11–R17, R32–R34, R38–R40). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";
import { queueAnswer, QUEUE_MINT_CHECKS, QUEUE_CLASS_LABELS } from "../../../src/queue/index.mjs";
import { deriveActs, decorate } from "../../../src/affordances.mjs";
import { viewerPredicate } from "../../../src/membership/index.mjs";

test("R6: limit clamped to 1–500 (default 200); among equals (here every item, none homed) R6's order, OBLIGATION, FINDING, CONDITION then id, in R49's default and cut at the limit; the answer's fields", () => {
  const w = world({ governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 5000, refusals: 1, granted: 0, refused_total: 1 }] },
                    progressions: { proposalsFeed: () => ({ instances: [], dispositions: [], proposals: [
                      { key: "p::s", progression_key: "p", progression_label: "P", stage_key: "s", stage_label: "S", required: "always",
                        definition_version: 1, n: 1, kinds: ["missing_predecessor"], grade: null, grade_determined: false, overdue: false,
                        overdue_count: 0, surfaced_by: "machine", prior_disposition: null, instances: [] }] }) } });
  w.bundle("INF-1"); w.bundle("INF-2"); w.task("TASK-2026-0002-b", "INF-1"); w.task("TASK-2026-0001-a", "INF-2");
  const f = w.feed(null, "class:admin");
  assert.equal(f.ok, true);
  assert.deepEqual(f.items.map((i) => i.class), ["OBLIGATION", "OBLIGATION", "FINDING", "CONDITION"]);
  assert.deepEqual(f.items.slice(0, 2).map((i) => i.id), ["TASK-2026-0001-a", "TASK-2026-0002-b"]);
  for (const k of ["member", "items", "limit", "item_count", "truncated", "classes", "classes_deferred", "ancestor_depth_bound", "mute", "disposed",
                   "class_labels", "sort"])
    assert.ok(k in f, k);
  // every item is ungrouped, so R49's default (grouped by case, none last) leaves them all equal: R6 decides
  assert.ok(f.items.every((i) => i.case.ancestors.length === 0));
  assert.equal(f.sort, null);
  assert.deepEqual(f.classes, ["OBLIGATION", "FINDING", "CONDITION"]);
  assert.deepEqual(f.classes_deferred, {});
  assert.equal(f.ancestor_depth_bound, 6);
  assert.equal(f.limit, 200); assert.equal(f.item_count, 4); assert.equal(f.truncated, false);
  const cut = w.q.queueFeed({ member: null, viewer: "class:admin", limit: 2 });
  assert.equal(cut.limit, 2); assert.equal(cut.item_count, 2); assert.equal(cut.truncated, true);
  assert.deepEqual(cut.items.map((i) => i.id), ["TASK-2026-0001-a", "TASK-2026-0002-b"]);
  for (const [asked, got] of [[0, 1], [-5, 1], [501, 500], [9999, 500], ["", 200], [null, 200], ["x", 200], ["7", 7]])
    assert.equal(w.q.queueFeed({ viewer: "class:admin", limit: asked }).limit, got, String(asked));
});

test("R7: homes are every inquiry and project upward by basis legs and live cites, bounded at 6, hidden ones stated out_of_view", () => {
  const w = world({ connections: { edgeSevered: (citing, target) => citing === "PRJ-SEV" && target === "INQ-1" } });
  w.member("alice");
  w.bundle("INF-0");
  let prev = "INF-0";
  for (let i = 1; i <= 7; i++) { w.bundle(`INQ-${i}`, "inquiry", { state: i === 2 ? "divided" : i === 4 ? "weird" : "open" }); w.leg(`INQ-${i}`, prev); prev = `INQ-${i}`; }
  w.bundle("PRJ-HID", "project"); w.cite("PRJ-HID", "INQ-3");            // alice does not participate: out of view
  w.bundle("PRJ-SEV", "project"); w.join("PRJ-SEV", "alice"); w.cite("PRJ-SEV", "INQ-1");   // withdrawn: not a step
  w.bundle("DOC-MID"); w.cite("DOC-MID", "INF-0"); w.bundle("PRJ-VIA", "project"); w.join("PRJ-VIA", "alice"); w.cite("PRJ-VIA", "DOC-MID");
  w.task("TASK-2026-0001-t", "INF-0");
  const it = byId(w.feed("alice"))["TASK-2026-0001-t"];
  const ids = it.case.ancestors.map((a) => a.id);
  assert.deepEqual(ids, ["INQ-1", "INQ-2", "INQ-3", "INQ-4", "INQ-5", "INQ-6", "PRJ-VIA"]);
  assert.ok(!ids.includes("INQ-7"), "depth 7 is past the bound");
  assert.ok(!ids.includes("PRJ-HID") && !ids.includes("PRJ-SEV") && !ids.includes("DOC-MID"));
  assert.deepEqual(it.case.reasons, ["depth_bound", "out_of_view"]);
  assert.equal(it.case.state, "undetermined"); assert.equal(it.case.ungrouped, false); assert.equal(it.case.depth_bound, 6);
  const a = Object.fromEntries(it.case.ancestors.map((x) => [x.id, x]));
  assert.equal(a["INQ-1"].depth, 1); assert.equal(a["INQ-6"].depth, 6); assert.equal(a["PRJ-VIA"].depth, 2);
  assert.equal(a["INQ-1"].terminal, false); assert.equal(a["INQ-2"].terminal, true); assert.equal(a["INQ-4"].terminal, null);
  assert.equal(a["INQ-1"].type, "inquiry"); assert.equal(a["PRJ-VIA"].type, "project");
  // determined and empty is ungrouped; a machine viewer sees the hidden project and is not out of view
  w.bundle("INF-LONE"); w.task("TASK-2026-0002-l", "INF-LONE");
  const lone = byId(w.feed("alice"))["TASK-2026-0002-l"];
  assert.deepEqual(lone.case, { state: "determined", ungrouped: true, reasons: [], depth_bound: 6, ancestors: [] });
  const m = byId(w.feed(null, "class:admin"))["TASK-2026-0001-t"];
  assert.ok(m.case.ancestors.some((x) => x.id === "PRJ-HID"));
  assert.deepEqual(m.case.reasons, ["depth_bound"]);
});

test("R8: obligations are the open or forwarded tasks for the member or unassigned on visible subjects; bias debts by recipients", () => {
  let asked = null;
  const debts = [{ run: "r1", context_type: "inquiry", context_id: "INQ-1", recipients: ["alice"], raised: iso(NOW - 1000) },
                 { run: "r2", context_type: "inquiry", context_id: "INQ-1", recipients: [], raised: iso(NOW - 2000) },
                 { run: "r3", context_type: "inquiry", context_id: "INQ-1", recipients: ["bob"], raised: iso(NOW - 3000) }];
  const w = world({ bias: { uncleared: (a) => { asked = a; return { debts, limit: a.limit, truncated: false }; } } });
  w.member("alice"); w.member("bob");
  w.bundle("INQ-1", "inquiry"); w.bundle("PRJ-H", "project"); w.join("PRJ-H", "bob");
  for (const b of ["INF-1", "INF-2", "INF-3", "INF-4"]) w.bundle(b);
  w.task("TASK-2026-0001-mine", "INQ-1", { assignee: "alice", role: "project-manager" });
  w.task("TASK-2026-0002-free", "INF-1");
  w.task("TASK-2026-0003-bobs", "INF-2", { assignee: "bob", role: "member" });
  w.task("TASK-2026-0004-fwd", "INF-3", { assignee: "alice", role: "member", status: "forwarded" });
  w.task("TASK-2026-0005-done", "INQ-1", { assignee: "alice", status: "resolved", resolvedAt: iso(NOW) });
  w.task("TASK-2026-0006-hid", "PRJ-H");
  const f = w.feed("alice");
  const obl = f.items.filter((i) => i.class === "OBLIGATION").map((i) => i.id);
  assert.deepEqual(obl, ["OBLIGATION::bias-debt::r1", "OBLIGATION::bias-debt::r2", "TASK-2026-0001-mine", "TASK-2026-0002-free", "TASK-2026-0004-fwd"]);
  const mine = byId(f)["TASK-2026-0001-mine"];
  assert.equal(mine.assignee, "alice"); assert.equal(mine.assignee_role, "project-manager");
  assert.deepEqual(mine.age, { state: "determined", since: iso(NOW - 3600000), ms: 3600000 });
  assert.ok(!JSON.stringify(f).includes("PRJ-H"), "a task on a subject the viewer may not see is withheld and not counted");
  assert.equal(f.counts.obligation, 5);
  // a machine credential sees every live task
  const all = w.feed(null, "class:admin").items.filter((i) => i.class === "OBLIGATION" && !i.id.startsWith("OBLIGATION::")).map((i) => i.id);
  assert.deepEqual(all, ["TASK-2026-0001-mine", "TASK-2026-0002-free", "TASK-2026-0003-bobs", "TASK-2026-0004-fwd", "TASK-2026-0006-hid"]);
  assert.deepEqual(asked.gate, viewerPredicate("class:admin")); assert.equal(asked.limit, 200);
  const d = byId(f)["OBLIGATION::bias-debt::r2"];
  assert.equal(d.kind, "bias-debt"); assert.deepEqual(d.recipients, []); assert.ok(d.recipients_stated);
});

test("R8: many recently resolved tasks never hide an open one: the read asks for open and forwarded tasks only (N373)", () => {
  const w = world();
  w.member("alice");
  // the live tasks are the OLDEST, and more tasks were resolved since than the feed's cap twice over
  w.bundle("INF-OPEN"); w.bundle("INF-FWD");
  w.task("TASK-2026-0000-open", "INF-OPEN", { created: iso(NOW - 10 * 86400000) });
  w.task("TASK-2026-0000-fwd", "INF-FWD", { assignee: "alice", role: "member", status: "forwarded", created: iso(NOW - 9 * 86400000) });
  for (let i = 1; i <= 12; i++) {
    w.bundle(`INF-${i}`);
    w.task(`TASK-2026-${String(i).padStart(4, "0")}-done`, `INF-${i}`, { status: "resolved", created: iso(NOW - i * 1000), resolvedAt: iso(NOW) });
  }
  for (const [member, viewer] of [["alice", "member:alice"], [null, "class:admin"]]) {
    const f = w.q.queueFeed({ member, viewer, limit: 2 });
    assert.deepEqual(f.items.map((i) => i.id), ["TASK-2026-0000-fwd", "TASK-2026-0000-open"], String(member));
    assert.equal(f.truncated, false);
  }
});

test("R8: other members' live tasks never crowd a member's own out: the read asks for the member's and the unassigned only (N410)", () => {
  const w = world();
  w.member("alice"); w.member("bob");
  // alice's one task is the OLDEST; more of bob's live tasks are newer than the feed's cap twice over
  w.bundle("INF-MINE"); w.task("TASK-2026-0000-mine", "INF-MINE", { assignee: "alice", role: "member", created: iso(NOW - 10 * 86400000) });
  w.bundle("INF-FREE"); w.task("TASK-2026-0000-free", "INF-FREE", { created: iso(NOW - 9 * 86400000) });
  for (let i = 1; i <= 12; i++) {
    w.bundle(`INF-${i}`);
    w.task(`TASK-2026-${String(i).padStart(4, "0")}-bobs`, `INF-${i}`, { assignee: "bob", role: "member", created: iso(NOW - i * 1000) });
  }
  const f = w.q.queueFeed({ member: "alice", viewer: "member:alice", limit: 2 });
  assert.deepEqual(f.items.map((i) => i.id), ["TASK-2026-0000-free", "TASK-2026-0000-mine"]);
  assert.equal(f.truncated, false);
  // a machine credential still reads every assignee's live task
  assert.equal(w.q.queueFeed({ member: null, viewer: "class:admin", limit: 500 }).counts.obligation, 14);
});

test("R11: the mint refuses the whole feed for an uncatalogued or misclassed kind, with the check and translation, before any mute", () => {
  const w = world();
  w.member("alice"); w.bundle("INQ-1", "inquiry");
  w.task("TASK-2026-0001-a", "INQ-1", { kind: "no-such-kind" });
  let r = w.feed("alice");
  assert.equal(r.ok, false); assert.equal(r.reason, "NO_SUCH_KIND"); assert.equal(r.check, "C-31.2");
  assert.equal(r.translation, QUEUE_MINT_CHECKS.NO_SUCH_KIND.translation); assert.equal(r.id, "TASK-2026-0001-a");
  w.run(`UPDATE tasks SET kind='governor-holding-host'`);
  // muted as its (condition) kind on its case: the mint still sees it first
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('alice','INQ-1','governor-holding-host')`);
  w.leg("INQ-1", "INQ-1");
  r = w.feed("alice");
  assert.equal(r.ok, false); assert.equal(r.reason, "KIND_MISCLASSED"); assert.equal(r.check, "C-31.3");
  assert.equal(r.catalogued_as, "CONDITION"); assert.equal(r.minted_as, "OBLIGATION");
  // NO_CLASS: no producer here mints a classless item; its row is the mint's first, with its words
  assert.equal(QUEUE_MINT_CHECKS.NO_CLASS.check, "C-31.1");
  assert.ok(QUEUE_MINT_CHECKS.NO_CLASS.translation.length > 0);
});

test("R12: options are affordances' acts on the first 8 subjects, once each; dispositions by class and key", () => {
  const facts = (target) => ({ ok: true, target, object_type: "information", declared_type: "information", current_state: "collected",
    cites_in: { confirmed: 0, severed: 0 }, cites_out: { confirmed: 0, severed: 0, severed_reinstatable: 0 }, rested_on: { working: 0, frozen: 0, severed: 0 } });
  const seen = [];
  const w = world({ affordances: { affordanceFacts: (a) => { seen.push(a.target); return facts(a.target); } },
                    progressions: { proposalsFeed: () => ({ instances: [], dispositions: [], proposals: [
                      { key: "p::s", progression_key: "p", progression_label: "P", stage_key: "s", stage_label: "S", required: "always",
                        definition_version: 3, n: 1, kinds: ["missing_predecessor"], grade: null, grade_determined: false, overdue: false,
                        overdue_count: 0, surfaced_by: "machine", prior_disposition: null, instances: [{ progression_key: "p", entity_id: "E" }] }] }) },
                    governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 5, refusals: 1 }] },
                    bias: { uncleared: () => ({ debts: [{ run: "r1", context_type: "inquiry", context_id: "INF-1", recipients: [], raised: iso(NOW) }] }) } });
  for (let i = 0; i < 10; i++) { w.bundle(`INF-${i}`); w.run(`INSERT INTO progression_instances VALUES ('p','E','s','c${i}','INF-${i}')`); }
  w.task("TASK-2026-0001-a", "INF-1");
  const f = byId(w.feed(null, "class:admin"));
  const acts = deriveActs(facts("INF-1")).map((a) => ({ id: a.id, label: a.label, weight: a.weight }));
  assert.ok(acts.length > 0);
  assert.deepEqual(f["TASK-2026-0001-a"].options, acts);
  const fin = f["FINDING::p::s"];
  assert.deepEqual(fin.options, acts, "the union over eight subjects, each act once");
  assert.equal(seen.filter((t) => /^INF-[89]$/.test(t)).length, 0, "no subject past the eighth is asked");
  assert.deepEqual(f["TASK-2026-0001-a"].disposition.instead, "taskresolve");
  assert.equal(f["TASK-2026-0001-a"].disposition.available, false);
  assert.equal(f["OBLIGATION::bias-debt::r1"].disposition.instead, "biasdebtresolve");
  const c = f["CONDITION::governor-holding-host::h.example"].disposition;
  assert.equal(c.available, false); assert.equal(c.instead, "queuemute");
  const d = fin.disposition;
  assert.equal(d.available, true); assert.equal(d.scope, "instance"); assert.equal(d.key, "p::s");
  assert.equal(d.definition_version, 3); assert.deepEqual(d.requires, ["definitionVersion"]);
});

test("R12, R13: a project-scoped finding names its project homes; one project's decision removes it for that project only", () => {
  const w = world({ basisVersions: { projectsDrawingOn: (inq) => Object.assign([
      { id: "PRJ-A", title: "A", current: { version: "v1", at: iso(NOW - 1000), by: "alice" } },
      { id: "PRJ-B", title: "B", current: { version: "v2", at: iso(NOW - 2000), by: "bob" } }], { bound: 32, truncated: false }) } });
  w.member("alice"); w.member("bob");
  w.bundle("INQ-S", "inquiry"); w.bundle("PRJ-A", "project"); w.bundle("PRJ-B", "project");
  w.join("PRJ-A", "alice"); w.join("PRJ-B", "alice"); w.cite("PRJ-A", "INQ-S"); w.cite("PRJ-B", "INQ-S");
  const id = "FINDING::stance-changed-here-not-elsewhere::INQ-S::PRJ-A";
  let it = byId(w.feed("alice"))[id];
  assert.equal(it.disposition.scope, "project"); assert.equal(it.disposition.available, true); assert.equal(it.disposition.key, null);
  assert.deepEqual(it.disposition.projects, ["PRJ-A", "PRJ-B"]); assert.deepEqual(it.disposition.requires, ["project", "finding"]);
  w.run(`INSERT INTO finding_dispositions VALUES ('PRJ-A', ?, 'stance-changed-here-not-elsewhere', 'dismissed', 'seen', 'alice', ?)`, id, iso(NOW));
  let f = w.feed("alice"); it = byId(f)[id];
  assert.deepEqual(it.disposition.projects, ["PRJ-B"]);
  assert.deepEqual(it.case.ancestors.map((a) => a.id), ["PRJ-B"]);
  assert.deepEqual(it.case.disposed_by.map((d) => d.id), ["PRJ-A"]);
  assert.ok(f.disposed.findings.some((d) => d.scope === "project" && d.project === "PRJ-A" && d.finding === id && d.key === `PRJ-A::${id}`));
  w.run(`INSERT INTO finding_dispositions VALUES ('PRJ-B', ?, 'stance-changed-here-not-elsewhere', 'deferred', 'later', 'alice', ?)`, id, iso(NOW));
  f = w.feed("alice");
  assert.equal(byId(f)[id], undefined, "every project home decided: it leaves the items");
  assert.equal(f.disposed.findings.filter((d) => d.finding === id).length, 2);
  // an item with no project home is not available, for want of a scope
  const w2 = world({ corpusExport: { exportLog: () => ({ exports: [{ seq: 1, at: iso(NOW), scope: "working-corpus", bundles: 1, files: 1, note: null }], truncated: false }) } });
  const e = byId(w2.feed(null, "class:admin"))["FINDING::export-performed::1"];
  assert.equal(e.disposition.available, false); assert.equal(e.disposition.reason, "no_project_scope");
});

test("R14, R31: mutes apply to every item, item mutes first, never to an obligation; with no member nothing is suppressed", () => {
  const w = world({ governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 5, refusals: 1 }] },
                    captureRequests: { rendersHeld: () => ({ requests: [{ request: "CR-1", target: "INF-1", address: "https://a.example/x",
                      state: "requested", code: "RENDER_DEFERRED", requested_at: iso(NOW), expires: iso(NOW + 1) }] }) } });
  w.member("alice"); w.bundle("INQ-1", "inquiry"); w.bundle("INF-1"); w.leg("INQ-1", "INF-1");
  w.task("TASK-2026-0001-a", "INF-1");
  w.run(`INSERT INTO queue_state (member_id, case_id, muted_kinds) VALUES ('alice','INQ-1','authority-undetermined,render-deferred')`);
  w.run(`INSERT INTO queue_item_mutes VALUES ('alice','CONDITION::governor-holding-host::h.example','CONDITION',?)`, iso(NOW));
  w.run(`INSERT INTO queue_item_mutes VALUES ('alice','TASK-2026-0001-a','OBLIGATION',?)`, iso(NOW));
  const f = w.feed("alice");
  assert.deepEqual(f.items.map((i) => i.id), ["TASK-2026-0001-a"], "an obligation is never suppressed, even with rows naming it");
  assert.deepEqual(f.mute.suppressed.map((s) => [s.id, s.scope, s.case]),
    [["CONDITION::governor-holding-host::h.example", "item", null], ["CONDITION::render-deferred::CR-1", "case", "INQ-1"]]);
  assert.equal(f.mute.personal, true); assert.equal(f.mute.suppressed_count, 2);
  assert.deepEqual(f.mute.cases, ["INQ-1"]); assert.deepEqual(f.mute.case_kinds, { "INQ-1": ["authority-undetermined", "render-deferred"] });
  assert.deepEqual(f.mute.items, ["CONDITION::governor-holding-host::h.example", "TASK-2026-0001-a"]);
  assert.equal(typeof f.mute.detail, "string");
  assert.equal(w.feed(null, "class:admin").mute.suppressed.length, 0);
});

test("R15: disposed carries the instance-scope decisions, then the project-scope ones that removed an item, at most 64", () => {
  const disp = Array.from({ length: 70 }, (_, i) => ({ key: `p::s${String(i).padStart(2, "0")}`, progression_key: "p", stage_key: `s${i}`,
    state: "deferred", reason: "r", decided_by: "alice", at: iso(NOW), definition_version: 1, definition_version_state: "current",
    applies: true, applies_because: "same_version" }));
  const w = world({ progressions: { proposalsFeed: () => ({ instances: [], proposals: [], dispositions: disp }) } });
  const f = w.feed(null, "class:admin");
  assert.equal(f.disposed.personal, false); assert.equal(f.disposed.bound, 64);
  assert.equal(f.disposed.count, 64); assert.equal(f.disposed.recorded, 70); assert.equal(f.disposed.truncated, true);
  const d = f.disposed.findings[0];
  assert.deepEqual([d.id, d.scope, d.key, d.definition_version, d.applies], ["FINDING::p::s00", "instance", "p::s00", 1, true]);
});

test("R16: a FINDING's basis names its source and derivation; a member's mute leaves it on every other member's feed", () => {
  const w = world({ basisVersions: { projectsDrawingOn: () => Object.assign([
      { id: "PRJ-A", title: "A", current: { version: "v1", at: iso(NOW), by: "alice" } }, { id: "PRJ-B", title: "B", current: null }],
      { bound: 32, truncated: false }) } });
  w.member("alice"); w.member("bob");
  w.bundle("INQ-S", "inquiry"); w.bundle("PRJ-A", "project"); w.bundle("PRJ-B", "project");
  for (const m of ["alice", "bob"]) { w.join("PRJ-A", m); w.join("PRJ-B", m); }
  w.cite("PRJ-A", "INQ-S"); w.cite("PRJ-B", "INQ-S");
  const id = "FINDING::stance-changed-here-not-elsewhere::INQ-S::PRJ-A";
  for (const it of w.feed("alice").items.filter((i) => i.class === "FINDING")) {
    assert.equal(typeof it.basis.source, "string"); assert.equal(typeof it.basis.detail, "string");
    assert.equal(it.assignee, null);
  }
  assert.equal(w.q.queueMute({ member: "alice", item: id, viewer: "member:alice" }).ok, true);
  assert.equal(byId(w.feed("alice"))[id], undefined);
  assert.ok(byId(w.feed("bob"))[id], "bob's feed still carries it: only a recorded disposition removes it for the team");
});

test("R17: the control plane's decoration: every option through affordances.decorate with the gate, vocabularies over actions' kinds; a refusal is 400", () => {
  const gate = { needs: (op) => (op === "cite" ? "contribute" : null), mode: () => "session" };
  const r = { ok: true, items: [{ id: "x", options: [{ id: "cite", label: "Cite", weight: "report" }] }, { id: "y" }] };
  const a = queueAnswer(r, { gate, kinds: ["records_request", "other"] });
  assert.equal(a.status, 200);
  assert.deepEqual(a.result.items[0].options, [decorate({ id: "cite", label: "Cite", weight: "report" }, gate)]);
  assert.deepEqual(a.result.items[1].options, []);
  assert.deepEqual(a.result.vocabularies.action_kind, ["records_request", "other"]);
  const refused = queueAnswer({ ok: false, reason: "NO_SUCH_KIND" }, { gate });
  assert.equal(refused.status, 400); assert.equal(refused.refusal.reason, "NO_SUCH_KIND");
});

test("R18: an out-of-inquiry lead offers the inquiry-grain acts on the inquiry it bears on, set-aside only where a project scope exists", () => {
  const lead = (inq) => ({ request: `CR-${inq}`, run: "r", target: "INQ-A", lead_inquiry: inq, address: "https://x.example/d", host: "x.example",
    purpose: "investigate", ua_mode: "civicos", capture_sha: null, captured_at: iso(NOW),
    attribution: { ok: true, statement: "the daemon captured this" } });
  const w = world({ captureRequests: { leads: () => ({ requests: [lead("INQ-B"), lead("INQ-C")] }) } });
  w.bundle("INQ-A", "inquiry"); w.bundle("INQ-B", "inquiry"); w.bundle("INQ-C", "inquiry"); w.bundle("PRJ-1", "project"); w.cite("PRJ-1", "INQ-B");
  const f = byId(w.feed(null, "class:admin"));
  const b = f["FINDING::out-of-inquiry-lead::CR-INQ-B"], c = f["FINDING::out-of-inquiry-lead::CR-INQ-C"];
  assert.deepEqual(b.options.map((o) => o.id), ["cite", "proposedispose"]);
  assert.deepEqual(b.disposition.projects, ["PRJ-1"]);
  assert.deepEqual(c.options.map((o) => o.id), ["cite"]);
  assert.equal(c.disposition.reason, "no_project_scope");
  assert.equal(b.options_grain, undefined);
  for (const it of Object.values(f))
    if (it.disposition.available !== true) assert.ok(!it.options.some((o) => o.id === "proposedispose"), it.id);
});

test("R32, R33: one state, N homes; a hidden bundle is named nowhere and counted nowhere", () => {
  const w = world();
  w.member("alice");
  const doc = "INFO-2026-0001-doc";
  w.bundle(doc); w.bundle("INQ-1", "inquiry"); w.bundle("INQ-2", "inquiry"); w.leg("INQ-1", doc); w.leg("INQ-2", doc);
  w.bundle("PRJ-H", "project"); w.cite("PRJ-H", doc);
  w.task("TASK-2026-0001-a", doc);
  let f = w.feed("alice");
  assert.equal(f.items.filter((i) => i.id === "TASK-2026-0001-a").length, 1, "one item, however many homes");
  assert.deepEqual(byId(f)["TASK-2026-0001-a"].case.ancestors.map((a) => a.id), ["INQ-1", "INQ-2"]);
  assert.ok(!JSON.stringify(f).includes("PRJ-H"));
  assert.equal(w.tasks.taskResolve({ id: "TASK-2026-0001-a", actor: "alice" }).ok, true);
  f = w.feed("alice");
  assert.equal(byId(f)["TASK-2026-0001-a"], undefined, "resolved once, it leaves every home");
});

test("R34: options come from the producer's subjects, never from a caller; a condition earns options only through its documents", () => {
  const w = world({ governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 5, refusals: 1 }] },
                    affordances: { affordanceFacts: () => ({ ok: true, object_type: "information", declared_type: "information", current_state: "collected" }) } });
  const f = byId(w.feed(null, "class:admin"));
  assert.deepEqual(f["CONDITION::governor-holding-host::h.example"].options, [], "a host with no documents offers nothing");
});

test("R38: no place is named in the feed's outward text", () => {
  const w = world({ governor: { governorHolding: () => [{ host: "h.example", cooloff_until: NOW + 5, refusals: 1 }] } });
  w.bundle("INF-1"); w.task("TASK-2026-0001-a", "INF-1");
  const text = JSON.stringify(w.feed(null, "class:admin"));
  for (const place of ["Oakland", "California", "Alameda", "CPRA", "Brown Act", "Sunshine"]) assert.ok(!text.includes(place), place);
});

test("R39: resolved carries the obligations resolved lately on visible subjects, with who and when: tasks and settled bias debts", () => {
  let asked = null;
  const settled = [
    { run: "RUN-1", context_type: "inquiry", context_id: "INQ-1", settled_kind: "resolved", settled_at: iso(NOW - 7200000),
      actor: "bob", reason: "re-read under the new lens" },
    { run: "RUN-2", context_type: "inquiry", context_id: "INQ-1", settled_kind: "lens_returned", settled_at: iso(NOW - 3600000),
      actor: null, reason: null }];
  const w = world({ bias: { settled: (a) => { asked = a; return { debts: settled, limit: a.limit, truncated: false, since: a.since }; } } });
  w.member("alice"); w.bundle("INF-1"); w.bundle("PRJ-H", "project");
  const hist = (by, at) => [{ at: iso(NOW - 10 * 86400000), event: "created", actor: "alarm" }, { at, event: "resolved", actor: by }];
  w.task("TASK-2026-0001-a", "INF-1", { status: "resolved", resolvedAt: iso(NOW - 86400000), history: hist("bob", iso(NOW - 86400000)) });
  w.task("TASK-2026-0002-b", "INF-1", { status: "resolved", resolvedAt: iso(NOW - 40 * 86400000), history: hist("bob", iso(NOW - 40 * 86400000)) });
  w.task("TASK-2026-0003-c", "PRJ-H", { status: "resolved", resolvedAt: iso(NOW - 3600000), history: hist("bob", iso(NOW - 3600000)) });
  const r = w.feed("alice").resolved;
  assert.equal(r.personal, false); assert.equal(r.window_days, 30); assert.equal(r.bound, 64);
  assert.equal(r.since, iso(NOW - 30 * 86400000));
  assert.deepEqual(r.obligations.map((o) => [o.id, o.resolved_by, o.resolved_at]), [["TASK-2026-0001-a", "bob", iso(NOW - 86400000)]]);
  // the bias half: bias.settled asked with the viewer's gate, in the same window and bound (N326)
  assert.deepEqual(asked, { gate: viewerPredicate("member:alice"), since: r.since, limit: 64 });
  const b = r.bias_debts;
  assert.equal(b.read, true); assert.equal(b.count, 2); assert.equal(b.bound, 64); assert.equal(b.truncated, false);
  assert.deepEqual(b.debts[0], { id: "OBLIGATION::bias-debt::RUN-1", class: "OBLIGATION", kind: "bias-debt", run: "RUN-1",
    context: { type: "inquiry", id: "INQ-1" }, resolved_by: "bob", settled_kind: "resolved", resolved_at: iso(NOW - 7200000),
    reason: "re-read under the new lens" });
  // a debt no member settled: resolved_by null beside its settled_kind, never "nobody"
  assert.deepEqual([b.debts[1].resolved_by, b.debts[1].settled_kind], [null, "lens_returned"]);
  assert.ok(b.debts.every((d) => d.resolved_by === null || d.resolved_by === "bob"), "no stand-in name for an absent member");
  // bias's bound and its failure are published, never read as none
  const w2 = world({ bias: { settled: ({ limit }) => ({ debts: [], limit, truncated: false, undetermined: true,
                                                        stated: "the settled bias debts could not be read, so none is listed" }) } });
  const u = w2.feed(null, "class:admin").resolved.bias_debts;
  assert.equal(u.read, false); assert.equal(u.stated, "the settled bias debts could not be read, so none is listed");
  const w3 = world({ bias: { settled: ({ limit }) => ({ debts: settled.slice(0, 1), limit, truncated: true }) } });
  assert.equal(w3.feed(null, "class:admin").resolved.bias_debts.truncated, true);
});

test("R40: a snoozed case's lapse is published in mute and each of its items is marked snoozed, never withheld", () => {
  const w = world();
  w.member("alice"); w.bundle("INQ-1", "inquiry"); w.bundle("INF-1"); w.leg("INQ-1", "INF-1"); w.task("TASK-2026-0001-a", "INF-1");
  const until = iso(NOW + 86400000);
  assert.equal(w.q.queueSnooze({ member: "alice", case: "INQ-1", until, viewer: "member:alice" }).ok, true);
  w.run(`INSERT INTO queue_state (member_id, case_id, snoozed_until) VALUES ('alice','INQ-OLD',?)`, iso(NOW - 1000));
  const f = w.feed("alice");
  assert.deepEqual(f.mute.snoozed_until, { "INQ-1": new Date(Date.parse(until)).toISOString() });
  const it = byId(f)["TASK-2026-0001-a"];
  assert.ok(it, "the item is still in the feed");
  assert.deepEqual(it.snoozed.cases.map((c) => c.case), ["INQ-1"]);
  assert.equal(byId(w.feed(null, "class:admin"))["TASK-2026-0001-a"].snoozed, undefined);
});

test("R48 (N301; DEC-107): class_labels are exactly To do, Noticed and Signal; the codes are unchanged", () => {
  const w = world();
  w.bundle("INF-1"); w.task("TASK-2026-0001-a", "INF-1");
  const f = w.feed(null, "class:admin");
  assert.deepEqual(f.class_labels, { OBLIGATION: "To do", FINDING: "Noticed", CONDITION: "Signal" });
  assert.deepEqual(f.class_labels, QUEUE_CLASS_LABELS);
  assert.ok(Object.isFrozen(QUEUE_CLASS_LABELS));
  // the codes: the classes, an item's class and the counts keep their names
  assert.deepEqual(f.classes, ["OBLIGATION", "FINDING", "CONDITION"]);
  assert.equal(f.items[0].class, "OBLIGATION");
  assert.deepEqual(Object.keys(f.counts).slice(0, 3), ["obligation", "finding", "condition"]);
  // negative control: the labels are the members' words, never the codes
  for (const [code, label] of Object.entries(f.class_labels)) assert.notEqual(label.toUpperCase(), code);
});
