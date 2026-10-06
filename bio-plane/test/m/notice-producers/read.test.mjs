/* R1, R7, R10: noticeItems at its interface: queue's one read, its homes and options passed in, every producer's bound
   in `facts`, a throwing provider named and the rest answered, nothing written, nothing thrown; no hidden project asked
   about or counted; no place named. The host is money-checks' test world (real record-core and membership), every
   provider a stand-in answering one item in its requirements' shape. */
import test from "node:test";
import assert from "node:assert/strict";
import { world } from "../money-checks/fixture.mjs";
import { fresh, reader, byId, texts, sentences, snapshot } from "./fixture.mjs";
import { list as profiles } from "../../../../jurisdictions/index.mjs";
import { NOTICE_KINDS, NOTICE_PROJECTS_MAX, DUTIES_MAX } from "../../../src/notice-producers/index.mjs";

const NOW = "2026-10-06T12:00:00Z";
const P = "PROJ-2026-0001-alpha", H = "PROJ-2026-0002-hidden";
const day = (value) => ({ value, precision: "day", zone: "UTC" });

/* One answer of each provider, for any project or member asked. */
function providers(calls = []) {
  return {
    people: { listChecks: () => ({ ok: true, checks: [{ check: "CHK-1", version: 1, condition: { from: { line: "holds" } } }] }),
      checkResults: ({ project }) => { calls.push(["people", project]); return { ok: true, checks: [{ check: "CHK-1", version: 1, name: "a check", gated: false,
        denominator: "a set", results: [{ result_id: `r-${project}`, derivation: { rows: [] }, denominator: { label: "a set", counted: 3 }, at: NOW }], truncated: false }] }; } },
    moneyChecks: { noticed: ({ project }) => { calls.push(["money-checks", project]); return { ok: true, project, truncated: false, items: [{ result_id: `m-${project}`,
      detector_id: "md-1", version: 1, label: "Noticed", detector_label: "a detector", subject: { kind: "pattern" }, numerator: { value: "1" },
      denominator: { value: "2" }, derivation: {}, inputs: [], at: NOW, gate: { gold_set: "g", false_alarm_rate: "0.1" } }] }; } },
    answers: { standingAnswersFor: () => ({ ok: true, cursor: null, entries: [{ question: { id: "STQ-1", question: "q?" }, run: 1, at: NOW,
      finds: { ids: ["x"] }, answer: null, held_back: { condition: "not_deployed" }, withheld: [] }] }) },
    duties: { dutiesOf: ({ entity }) => ({ ok: true, entity, duties: [{ duty_id: "DUT-1", adoption: { by: "member:alice" }, performance: { act: "post it" } }], truncated: false }),
      occurrencesOf: () => ({ ok: true, occurrences: [{ key: "OCC-1", trigger: { kind: "date", ref: "2026-01-01" }, due: { date: day("2026-01-11"), basis_kind: "rule" },
        state: "overdue", why: "passed", evidence: [], question: "Was it done by 2026-01-11?" }] }) },
    inquiry: { datedWaits: ({ member }) => ({ ok: true, member, waits: [{ inquiry: "INQ-1", index: 0, text: "a reply", description: "from the office",
      date: "2026-10-01", set_by: member, set_at: NOW, state: "due" }] }) },
  };
}
function setup(over = {}) {
  const w = world();
  w.project(P, ["alice"]);
  w.project(H, ["bob"]);
  w.st.sql.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);
  w.st.sql.exec(`INSERT INTO duties VALUES ('DUT-1', 'ENT-2026-0001')`);
  const calls = [];
  const n = fresh(w.host, { membership: w.membership, ...providers(calls), ...over });
  return { w, n, calls, ...reader(n) };
}

test("R1: every item R2–R6 derive for this member and viewer, each homed through homesOf and carrying its options; facts state each producer's bound and truncated", () => {
  const { read, asked } = setup();
  const r = read("alice", { now: NOW });
  const m = byId(r);
  assert.deepEqual(Object.keys(m).sort(), [
    `FINDING::interest-check-noticed::CHK-1::r-${P}`, `FINDING::money-detector-noticed::md-1::m-${P}`,
    "FINDING::standing-answer::STQ-1::1", "FINDING::temporal-expectation-due::DUT-1::OCC-1",
    "OBLIGATION::inquiry-recheck-due::INQ-1::2026-10-01"].sort());
  for (const it of r.items) {
    assert.equal(it.class, NOTICE_KINDS[it.kind], it.kind);
    assert.ok(it.case && Array.isArray(it.case.ancestors), "a home set from the walk passed in");
    assert.ok(Array.isArray(it.options));
    assert.equal("disposition" in it, false, "queue's mint gives the disposition");
  }
  assert.deepEqual(asked.homes.filter((s) => s.includes(P)).length >= 2, true, "the walk asked from the projects");
  assert.deepEqual(m["FINDING::temporal-expectation-due::DUT-1::OCC-1"].options, [{ id: "opt", on: ["DUT-1"] }], "queue's options for the subject");
  assert.deepEqual(r.facts, { projects: { bound: NOTICE_PROJECTS_MAX, truncated: false }, interest_check: { truncated: false },
    money_detector: { truncated: false }, standing_answer: { bound: 1000, truncated: false },
    temporal_expectation: { bound: DUTIES_MAX, truncated: false }, inquiry_recheck: { truncated: false }, failed: [] });
});

test("R1: with no walk and no options passed, an item is ungrouped and carries only its own acts", () => {
  const { read } = setup();
  const r = read("alice", { now: NOW, homes: false, options: false });
  for (const it of r.items) assert.equal(it.case.ancestors.filter((a) => a.depth !== 0).length, 0);
  assert.deepEqual(byId(r)["FINDING::temporal-expectation-due::DUT-1::OCC-1"].options, []);
});

test("R1: writes nothing and never throws; a provider that throws contributes no item and is named in facts.failed, the others still answer", () => {
  const boom = () => { throw new Error("down"); };
  const { w, read } = setup({ people: { checkResults: boom, listChecks: boom }, inquiry: { datedWaits: boom } });
  const before = snapshot((q) => w.st.sql.exec(q));
  const r = read("alice", { now: NOW });
  assert.deepEqual(snapshot((q) => w.st.sql.exec(q)), before);
  assert.deepEqual(r.facts.failed, ["people", "inquiry"]);
  assert.deepEqual(r.items.map((i) => i.kind).sort(), ["money-detector-noticed", "standing-answer", "temporal-expectation-due"]);
  /* a provider throwing part-way contributes nothing at all */
  let calls = 0;
  const part = setup({ duties: { dutiesOf: ({ entity }) => ({ ok: true, entity, truncated: false, duties: [{ duty_id: "DUT-1", adoption: { by: "member:alice" } },
    { duty_id: "DUT-2", adoption: { by: "member:alice" } }] }), occurrencesOf: ({ dutyId }) => { if (++calls === 2) throw new Error("x");
    return { ok: true, occurrences: [{ key: `OCC-${dutyId}`, state: "overdue", due: { date: day("2026-01-11") }, evidence: [] }] }; } } });
  const pr = part.read("alice", { now: NOW });
  assert.deepEqual(pr.items.filter((i) => i.kind === "temporal-expectation-due"), []);
  assert.deepEqual(pr.facts.failed, ["duties"]);
  /* malformed arguments: still an answer */
  for (const a of [undefined, {}, { member: 42 }, { member: "alice", viewer: null }, { member: "alice", now: "not a time" }])
    assert.doesNotThrow(() => part.n.noticeItems(a));
  const bad = setup({ membership: { participation: boom } });
  assert.deepEqual(bad.read("alice", { now: NOW }).facts.failed.includes("membership"), true);
});

test("R1: a projects bound of 50 in id order, stated with truncated when a further project qualifies", () => {
  const { w, read, calls } = setup();
  for (let i = 0; i < NOTICE_PROJECTS_MAX; i++) w.project(`PROJ-2026-1${String(i).padStart(3, "0")}-x`, ["alice"]);
  const r = read("alice", { now: NOW });
  assert.deepEqual(r.facts.projects, { bound: NOTICE_PROJECTS_MAX, truncated: true });
  const peopleAsked = calls.filter((a) => a[0] === "people").map((a) => a[1]);
  assert.equal(peopleAsked.length, NOTICE_PROJECTS_MAX);
  assert.deepEqual(peopleAsked, [...peopleAsked].sort());
});

test("R5: at most 500 duties derived a read, the cut stated", () => {
  const many = Array.from({ length: DUTIES_MAX + 1 }, (_, i) => ({ duty_id: `DUT-${i}`, adoption: { by: "member:zed" } }));
  const { read } = setup({ duties: { dutiesOf: ({ entity }) => ({ ok: true, entity, duties: many, truncated: false }), occurrencesOf: () => ({ ok: true, occurrences: [] }) } });
  assert.deepEqual(read("alice", { now: NOW }).facts.temporal_expectation, { bound: DUTIES_MAX, truncated: true });
});

test("R7: no answer names a project the viewer may not see, and no count reveals one: a hidden project is never asked about", () => {
  const { read, calls } = setup();
  const r = read("alice", { now: NOW });
  assert.ok(!calls.some((a) => a[1] === H), "the hidden project is never asked");
  assert.ok(!texts(r).some((t) => t.includes(H)));
  /* bob's project and alice's: bob asks about his own alone */
  calls.length = 0;
  read("bob", { now: NOW });
  assert.deepEqual([...new Set(calls.map((a) => a[1]))], [H]);
  /* facts carry bounds and flags, never a count of what was withheld */
  assert.ok(!texts(r.facts).some((t) => /count|withheld|hidden/.test(t)));
});

test("R10: no place is named in this module's behaviour or outward text", () => {
  const places = profiles().flatMap((p) => p.covers).map((c) => c.replace(/^City of /, "").replace(/ County$/, ""));
  assert.ok(places.length >= 4);
  const { read } = setup();
  const r = read("alice", { now: NOW });
  const words = r.items.flatMap((i) => [...sentences(i), ...texts(i.basis)]).join(" \n ");
  for (const p of places) assert.ok(!words.includes(p), p);
});
