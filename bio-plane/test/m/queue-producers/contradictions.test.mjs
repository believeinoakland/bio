/* The contradiction producers (N345) at feedItems' interface: the candidates shown on the member's projects (R4), the
   dependents resting on a side named wrong (R5), the tensions a published case did not disclose (R6), and the notice
   and relay of a conflict with a side the member cannot see (R7). Each provider is a fake answering in the shape its
   requirements publish (contradiction R25, R50; reevaluation R27; publication R50), filled per test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, byId, NOW, iso } from "./world.mjs";

const claim = (inquiry, text) => ({ kind: "claim", inquiry, version: "v1", claim: text, text, source: { inquiry, title: inquiry } });
const cand = (id, weight, state, a, b, extra = {}) => ({ candidate: id, key: "K2", why: "one subject, two held claims", a, b,
  machine: { label: "record", reason: "they differ", at: iso(NOW - 5000), origin: "machine", machine_work: true },
  weight, state, resolution: null, inquiry: null, recommendations: [], reach: { projects: [], truncated: false }, ...extra });

test("R4: one item per candidate candidatesFor answers on each joined project, counted once, keyed <CLASS>::contradiction::<candidate>, homed under both sides", () => {
  const asked = [];
  const between = [{ project: "PRJ-1", opted_in: { member: "alice", at: iso(NOW), words: null }, asked_by_another: false, revealed: false,
                     responses: [], responses_truncated: false },
                   { project: "PRJ-2", opted_in: null, asked_by_another: true, revealed: false, responses: [], responses_truncated: false }];
  const byProject = {
    "PRJ-1": [cand("c-duty", "duty", "open", claim("INQ-A", "x is 3"), claim("INQ-B", "x is 4"), { between_projects: between }),
              cand("c-lead", "lead", "open", claim("INQ-A", "y"), claim("INQ-C", "z")),
              cand("c-gone", "duty", "resolved", claim("INQ-A", "p"), claim("INQ-B", "q")),
              cand("c-done", "lead", "dismissed", claim("INQ-A", "p"), claim("INQ-C", "q"))],
    "PRJ-2": [cand("c-duty", "duty", "open", claim("INQ-A", "x is 3"), claim("INQ-B", "x is 4"), { between_projects: between }),
              cand("c-plur", "plurality", "open", { kind: "stance", inquiry: "INQ-B", project: "PRJ-2", claim: "a" },
                   { kind: "stance", inquiry: "INQ-B", project: "PRJ-1", claim: "b" }),
              cand("c-taken", "duty", "taken_up", claim("INQ-B", "m"), claim("INQ-C", "n"), { inquiry: "INQ-T" }),
              cand("c-expl", "duty", "explained_not_shown", claim("INQ-B", "m"), claim("INQ-C", "o")),
              cand("c-ltak", "lead", "taken_up", claim("INQ-B", "m"), claim("INQ-C", "o"))],
  };
  const w = world({ contradiction: { candidatesFor: ({ on, viewer }) => { asked.push([on.project, viewer]);
    return { ok: true, truncated: false, cursor: null, candidates: byProject[on.project] || [] }; } } });
  w.member("alice");
  for (const b of ["INQ-A", "INQ-B", "INQ-C"]) w.bundle(b, "inquiry");
  w.bundle("PRJ-1", "project"); w.bundle("PRJ-2", "project"); w.bundle("PRJ-3", "project");
  w.join("PRJ-1", "alice"); w.join("PRJ-2", "alice", { state: "leaving" });
  w.cite("PRJ-1", "INQ-A"); w.cite("PRJ-2", "INQ-B");
  const r = w.read("alice");
  assert.deepEqual(asked.map((a) => a[0]), ["PRJ-1", "PRJ-2"], "the member's joined projects, never PRJ-3");
  assert.ok(asked.every((a) => a[1] === "member:alice"));
  const items = r.items.filter((i) => /^contradiction-(duty|lead|plurality)$/.test(i.kind));
  assert.deepEqual(items.map((i) => i.id).sort(), ["FINDING::contradiction::c-lead", "FINDING::contradiction::c-plur",
    "OBLIGATION::contradiction::c-duty", "OBLIGATION::contradiction::c-expl", "OBLIGATION::contradiction::c-taken"]);
  const m = byId(r);
  const duty = m["OBLIGATION::contradiction::c-duty"];
  assert.deepEqual([duty.class, duty.kind], ["OBLIGATION", "contradiction-duty"]);
  // R8 (K558): the subject queue R46's dispositions read
  assert.deepEqual(duty.subject, { kind: "contradiction_candidate", id: "c-duty", state: "open", between_projects: between,
    parties: [{ project: "PRJ-1", opted_in: between[0].opted_in }, { project: "PRJ-2", opted_in: null }] });
  assert.deepEqual(duty.basis.projects, ["PRJ-1", "PRJ-2"], "one item, however many of the member's projects it reaches");
  assert.deepEqual(duty.case.ancestors.map((a) => [a.id, a.depth]).sort(),
    [["INQ-A", 0], ["INQ-B", 0], ["PRJ-1", 1], ["PRJ-2", 1]], "homed under both sides");
  assert.deepEqual(duty.options, [{ id: "opt", on: ["INQ-A", "INQ-B"] }]);
  assert.deepEqual(duty.age, { state: "determined", since: iso(NOW - 5000), ms: 5000 });
  assert.equal(m["FINDING::contradiction::c-lead"].kind, "contradiction-lead");
  assert.equal(m["FINDING::contradiction::c-plur"].kind, "contradiction-plurality");
  assert.deepEqual(m["FINDING::contradiction::c-plur"].options, [{ id: "opt", on: ["INQ-B", "PRJ-2", "PRJ-1"] }]);
  assert.deepEqual(m["FINDING::contradiction::c-plur"].subject, { kind: "contradiction_candidate", id: "c-plur", state: "open",
    between_projects: [], parties: [] });
  const taken = m["OBLIGATION::contradiction::c-taken"].subject;
  assert.deepEqual([taken.state, taken.inquiry], ["taken_up", "INQ-T"], "its contradiction inquiry, when taken up");
  assert.equal("inquiry" in duty.subject, false);
  assert.deepEqual(r.facts.contradiction, { bound: 50, truncated: false });
  // no member: every visible project is asked
  asked.length = 0; w.read(null, "class:admin");
  assert.deepEqual(asked.map((a) => a[0]), ["PRJ-1", "PRJ-2", "PRJ-3"]);
});

test("R4: at most 50 projects in id order, the bound returned beside whether it cut; a truncated page is followed by its cursor", () => {
  const asked = [];
  const w = world({ contradiction: { candidatesFor: ({ on, after }) => { asked.push([on.project, after]);
    if (on.project !== "P-001") return { ok: true, candidates: [], truncated: false, cursor: null };
    return after ? { ok: true, truncated: false, cursor: "c2", candidates: [cand("c2", "lead", "open", claim("I", "a"), claim("J", "b"))] }
                 : { ok: true, truncated: true, cursor: "c1", candidates: [cand("c1", "lead", "open", claim("I", "a"), claim("J", "b"))] }; } } });
  w.member("alice");
  for (let i = 1; i <= 51; i++) { const p = `P-${String(i).padStart(3, "0")}`; w.bundle(p, "project"); w.join(p, "alice"); }
  const r = w.read("alice");
  assert.deepEqual(r.facts.contradiction, { bound: 50, truncated: true });
  assert.equal(new Set(asked.map((a) => a[0])).size, 50);
  assert.ok(!asked.some((a) => a[0] === "P-051"));
  assert.deepEqual(asked.filter((a) => a[0] === "P-001"), [["P-001", null], ["P-001", "c1"]]);
  assert.deepEqual(r.items.filter((i) => i.kind === "contradiction-lead").map((i) => i.id).sort(),
    ["FINDING::contradiction::c1", "FINDING::contradiction::c2"]);
});

test("R5: side-corrected, one per (dependent, candidate) correctedDependents answers the viewer, homed under the dependent's ancestors, paged by cursor", () => {
  const asked = [];
  const entry = (d, c) => ({ dependent: d, candidate: c, kind: "corrected", reason: "the figure was a typo", member: "bob",
    since: iso(NOW - 7000), legs: [{ target: "INF-1", ord: 0, side: "a" }], detail: "d" });
  const w = world({ reevaluation: { correctedDependents: (a) => { asked.push(a);
    return a.after ? { ok: true, entries: [entry("INQ-2", "c9")], truncated: false, cursor: null }
                   : { ok: true, entries: [entry("INQ-1", "c1"), entry("INQ-1", "c2")], truncated: true, cursor: "INQ-1#c2" }; } } });
  w.member("alice"); w.bundle("INQ-1", "inquiry"); w.bundle("INQ-2", "inquiry"); w.bundle("PRJ-1", "project");
  w.join("PRJ-1", "alice"); w.cite("PRJ-1", "INQ-1");
  const r = w.read("alice");
  assert.deepEqual(asked.map((a) => [a.after, a.viewer, a.limit]), [[null, "member:alice", 200], ["INQ-1#c2", "member:alice", 200]]);
  const ids = r.items.filter((i) => i.kind === "side-corrected").map((i) => i.id);
  assert.deepEqual(ids, ["FINDING::side-corrected::INQ-1::c1", "FINDING::side-corrected::INQ-1::c2", "FINDING::side-corrected::INQ-2::c9"]);
  const it = byId(r)["FINDING::side-corrected::INQ-1::c1"];
  assert.equal(it.class, "FINDING");
  assert.deepEqual(it.subject, { kind: "bundle", id: "INQ-1", candidate: "c1" });
  assert.deepEqual(it.case.ancestors.map((a) => [a.id, a.depth]), [["INQ-1", 0], ["PRJ-1", 1]]);
  assert.deepEqual([it.basis.source, it.basis.reason, it.basis.member], ["reevaluation.correctedDependents", "the figure was a typo", "bob"]);
  assert.equal(it.age.ms, 7000);
  // it leaves when the cause closes: reevaluation no longer answers it
  w.fakes.reevaluation.correctedDependents = () => ({ ok: true, entries: [], truncated: false, cursor: null });
  assert.ok(!w.read("alice").items.some((i) => i.kind === "side-corrected"));
});

test("R6: tension-after-publication, one per (case, candidate) caseTensions answers for each project the member owns, to those owners and nobody else", () => {
  const asked = [];
  const w = world({ publication: { caseTensions: (a) => { asked.push(a.project);
    return { ok: true, cursor: null, cases: a.project !== "PRJ-1" ? [] : [{ case: "CASE-1", edition: 2, project: "PRJ-1",
      tensions: [{ case: "CASE-1", edition: 2, member: "INQ-1", candidate: "c1", state: "open", a: claim("INQ-1", "p"), b: claim("INQ-2", "q"), depth: 1 },
                 { case: "CASE-1", edition: 2, member: "INQ-3", candidate: "c1", state: "open", depth: 1 },
                 { case: "CASE-1", edition: 2, member: "INQ-1", candidate: "c2", state: "taken_up", unseen_other_side: true, side: claim("INQ-1", "p"), depth: 1 }],
      resolved_since: [{ case: "CASE-1", edition: 2, candidate: "c0", resolved_since: true }] }] }; } } });
  w.member("owner"); w.member("bob");
  w.bundle("PRJ-1", "project"); w.bundle("PRJ-2", "project");
  for (const b of ["INQ-1", "INQ-2", "INQ-3"]) w.bundle(b, "inquiry");
  w.join("PRJ-1", "owner", { owner: true }); w.join("PRJ-1", "bob"); w.join("PRJ-2", "bob");
  const r = w.read("owner");
  assert.deepEqual(asked, ["PRJ-1"], "only the projects the member owns");
  const items = r.items.filter((i) => i.kind === "tension-after-publication");
  assert.deepEqual(items.map((i) => i.id), ["FINDING::tension-after-publication::CASE-1::c1", "FINDING::tension-after-publication::CASE-1::c2"]);
  const t1 = items[0];
  assert.deepEqual(t1.subject.bundles, ["INQ-1", "INQ-3"], "one item per (case, candidate), every member it touches");
  assert.deepEqual(t1.case.ancestors.map((a) => [a.id, a.depth]), [["PRJ-1", 0]]);
  assert.equal(t1.basis.edition, 2);
  const t2 = items[1];
  assert.equal(t2.basis.unseen_other_side, true); assert.equal(t2.basis.b, undefined); assert.equal(t2.basis.a, undefined);
  asked.length = 0;
  assert.ok(!w.read("bob").items.some((i) => i.kind === "tension-after-publication"), "a non-owner is told nothing");
  assert.deepEqual(asked, []);
  assert.ok(!w.read(null, "class:admin").items.some((i) => i.kind === "tension-after-publication"), "nor a machine");
  // it leaves when a later edition discloses it or the candidate resolves
  w.fakes.publication.caseTensions = () => ({ ok: true, cursor: null, cases: [] });
  assert.ok(!w.read("owner").items.some((i) => i.kind === "tension-after-publication"));
});

test("R7, R11: two projects hidden from each other on two sides of one duty: each member's one unseen item, homed on their own side; opt-in, reveal and relay", () => {
  /* The notices contradiction R50 answers each project's members: the side they may see, and nothing of the other. */
  const state = { optedA: false, optedB: false, responses: [] };
  const notice = (project, side, own, other) => ({
    candidate: "cand-1", project, weight: "duty", state: "open", side, says: "Something this project rests on is in conflict with a record you cannot see. Neither that record nor who holds it is shown. Your project can ask to resolve it. If every project holding a side asks, the projects are named to each other's members, and you can respond.",
    opted_in: own ? { member: "m", at: iso(NOW), words: null } : null, asked_by_another: other,
    revealed: own && other, ...(own && other ? { parties: [{ id: project === "PRJ-A" ? "PRJ-B" : "PRJ-A", name: "the other" }] } : {}),
    responses: own && other ? state.responses.filter((x) => x.project.id !== project) : [], responses_truncated: false });
  const w = world({ contradiction: { conflictNotices: ({ project, viewer }) => {
    if (project === "PRJ-A" && viewer === "member:alice")
      return { ok: true, truncated: false, cursor: null, notices: [notice("PRJ-A", claim("INQ-A", "x is 3"), state.optedA, state.optedB)] };
    if (project === "PRJ-A2" && viewer === "member:alice")
      return { ok: true, truncated: false, cursor: null, notices: [notice("PRJ-A2", claim("INQ-A", "x is 3"), false, state.optedA || state.optedB)] };
    if (project === "PRJ-B" && viewer === "member:bob")
      return { ok: true, truncated: false, cursor: null, notices: [notice("PRJ-B", claim("INQ-B", "x is 4"), state.optedB, state.optedA)] };
    return { ok: false, reason: "PROJECT_NOT_PARTICIPANT" }; } } });
  w.member("alice"); w.member("bob");
  w.bundle("INQ-A", "inquiry"); w.bundle("INQ-B", "inquiry");
  for (const p of ["PRJ-A", "PRJ-A2", "PRJ-B"]) w.bundle(p, "project");
  w.join("PRJ-A", "alice"); w.join("PRJ-A2", "alice"); w.join("PRJ-B", "bob");
  w.cite("PRJ-A", "INQ-A"); w.cite("PRJ-A2", "INQ-A"); w.cite("PRJ-B", "INQ-B");
  const unseen = (r) => r.items.filter((i) => i.kind === "contradiction-duty-unseen");
  let a = unseen(w.read("alice")), b = unseen(w.read("bob"));
  assert.equal(a.length, 1, "one item, whatever number of the member's projects it reaches"); assert.equal(b.length, 1);
  assert.equal(a[0].id, "OBLIGATION::contradiction-unseen::cand-1"); assert.equal(a[0].class, "OBLIGATION");
  assert.deepEqual(a[0].basis.projects.map((p) => p.project), ["PRJ-A", "PRJ-A2"]);
  assert.deepEqual(a[0].subject, { kind: "contradiction_notice", id: "cand-1",
    parties: [{ project: "PRJ-A", opted_in: null }, { project: "PRJ-A2", opted_in: null }] }, "R8 (K558)");
  assert.deepEqual(a[0].case.ancestors.map((x) => x.id), ["INQ-A", "PRJ-A", "PRJ-A2"], "homed on alice's side only");
  assert.deepEqual(b[0].case.ancestors.map((x) => x.id), ["INQ-B", "PRJ-B"], "homed on bob's side only");
  const aText = JSON.stringify(a[0]), bText = JSON.stringify(b[0]);
  assert.ok(!/INQ-B|PRJ-B|x is 4|bob/.test(aText), "no item, home or field names the other side");
  assert.ok(!/INQ-A|PRJ-A|x is 3|alice/.test(bText));
  const keys = (o, out = []) => { if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { out.push(k); keys(v, out); } return out; };
  const { case: homes, ...own } = a[0];
  assert.deepEqual(keys(own).filter((k) => /count|bound|truncated/.test(k)), [], "no count, bound or truncated flag of its own");
  assert.deepEqual(homes.reasons, [], "the homes walk states nothing of the other side either");
  assert.equal(a[0].detail, a[0].basis.says); assert.equal(a[0].basis.asked_by_another, false);
  // after bob's project opts in, alice's item reads asked_by_another
  state.optedB = true;
  a = unseen(w.read("alice"));
  assert.equal(a[0].basis.asked_by_another, true); assert.equal(a[0].basis.projects[0].revealed, false);
  assert.deepEqual(unseen(w.read("bob"))[0].subject.parties, [{ project: "PRJ-B", opted_in: { member: "m", at: iso(NOW), words: null } }]);
  assert.ok(!JSON.stringify(a[0]).includes("PRJ-B"), "before the reveal no other party is named");
  // after both opt in, the parties' names appear; a response's chosen parts reach the other project, never a handle
  state.optedA = true;
  state.responses = [{ response: "rs-1", text: "we read it differently", cover: "B team", project: { id: "PRJ-B", name: "the other" }, at: iso(NOW) }];
  a = unseen(w.read("alice"));
  assert.deepEqual(a[0].basis.projects[0].parties, [{ id: "PRJ-B", name: "the other" }]);
  assert.deepEqual(a[0].basis.responses, [state.responses[0]]);
  assert.ok(!JSON.stringify(a[0].basis.responses).includes("bob"), "never the responder's handle");
  b = unseen(w.read("bob"));
  assert.deepEqual(b[0].basis.responses, [], "a project is not relayed its own responses");
  // a plurality between hidden projects is the plurality kind, a FINDING
  w.fakes.contradiction.conflictNotices = ({ project, viewer }) => project === "PRJ-A" && viewer === "member:alice"
    ? { ok: true, truncated: false, cursor: null, notices: [{ ...notice("PRJ-A", claim("INQ-A", "c"), false, false), weight: "plurality" }] }
    : { ok: true, truncated: false, cursor: null, notices: [] };
  const p = w.read("alice").items.find((i) => i.kind === "contradiction-plurality-unseen");
  assert.equal(p.id, "FINDING::contradiction-unseen::cand-1"); assert.equal(p.class, "FINDING");
  // no member: nobody's joined participant, told nothing; and it leaves when the notice leaves
  assert.ok(!w.read(null, "class:admin").items.some((i) => /-unseen$/.test(i.kind)));
  w.fakes.contradiction.conflictNotices = () => ({ ok: true, truncated: false, cursor: null, notices: [] });
  assert.ok(!w.read("alice").items.some((i) => /-unseen$/.test(i.kind)));
});
