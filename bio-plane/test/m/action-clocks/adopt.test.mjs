/* action-clocks' adoption of a computed deadline (R13; K1440), every deadline's basis kind and a held standard (R7;
   K1431, K1446), and the one write this module makes to an action's document (R8), at its interface: `clockAdopt`, its
   op, and the reads that answer an adopted entry. On the test profile (records_answer: 5 business days on its 'town'
   list, its weekend Sunday alone), over the real actions, promotion and standards. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, CLK } from "./fixture.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";
import * as actions from "../../../src/actions/index.mjs";

const M = V("alice"), BOB = V("bob");
const A = "ACTN-2026-0001-a";
const rowOf = (code) => clocks.ACTION_CLOCK_CHECKS[code];
/* An action sent on Tue 2026-09-01, its records_answer proposed by a machine: due Mon 2026-09-07. */
function setUp(lines = []) {
  const w = world();
  w.action(A, lines);
  assert.equal(w.actions.actionCorrespond({ target: A, direction: "sent", at: "2026-09-01", account: "sent", viewer: M, author: M }).ok, true);
  const p = w.c.clockPropose({ target: A, rule: "records_answer", proposer: MACHINE, viewer: MACHINE });
  assert.equal(p.proposal.entry.date, "2026-09-07");
  return { w, key: p.proposal.key, p };
}
const adopt = (w, x) => w.c.clockAdopt({ target: A, author: M, viewer: M, ...x });

test("R13 a member adopts a standing proposal in one act: the entry, with its basis and trace, is appended to clock[] by a revision of the action; the proposal is recorded adopted with who and when; from then it is tracked like any other", () => {
  const { w, key } = setUp();
  const head = w.record.head(A).bundleSha;
  const r = adopt(w, { proposal: key, why: "the clerk's deadline" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.target, r.proposal, r.ord, r.adopted_by, r.adopted_at], [A, key, 0, M, "2026-09-28T12:00:00Z"]);
  assert.notEqual(w.record.head(A).bundleSha, head, "one revision of the action");
  const e = w.fm(A).clock[0];
  assert.deepEqual([e.text, e.date, e.status, e.basis_kind, e.proposal, e.proposed_by, e.adopted_by, e.adopted_at, e.adopted_why],
    ["records_answer", "2026-09-07", "pending", "rule", key, MACHINE, M, "2026-09-28T12:00:00Z", "the clerk's deadline"]);
  assert.match(e.basis, /Test Stat\. § 1\.140 \(profile basis: TEST/, "the rule's citation and profile basis (R7)");
  assert.match(e.trace, /^5 business days after 2026-09-01; counted on the closure list town; 1 closed day skipped/, "R2's trace, in one line");
  assert.deepEqual(r.entry, Object.fromEntries(Object.entries(e).filter(([k]) => k in r.entry)), "the answer is the entry written");
  const row = w.rows(`SELECT adopted_by, adopted_at, adopted_ord, trace_json FROM action_clock_proposals WHERE bundle_id=? AND proposed_by=?`, A, MACHINE)[0];
  assert.deepEqual([row.adopted_by, row.adopted_at, row.adopted_ord], [M, "2026-09-28T12:00:00Z", 0]);
  assert.ok(JSON.parse(row.trace_json).trace.skipped.length === 1, "the whole trace stays with the proposal");
  /* actions' read answers it; R1 and R3 read it like any other entry (K1440: tracked and told once, whatever its basis). */
  assert.equal(w.actions.actionRead({ id: A, viewer: M }).clock.length, 1);
  assert.deepEqual(w.c.pendingClocks({ before: "2026-10-01", viewer: M }).items.map((x) => [x.action, x.ord, x.date]), [[A, 0, "2026-09-07"]]);
  assert.deepEqual(w.c.overdueClocks({ viewer: M }).items.map((x) => [x.ord, x.basis_of.kind]), [[0, "rule"]]);
  /* amended before adopting, after a fresh proposal (a restatement stands again): the amendment is marked. */
  w.c.clockPropose({ target: A, rule: "records_answer", proposer: MACHINE, viewer: MACHINE });
  const a2 = adopt(w, { proposal: key, date: "2026-09-10", text: "the clerk's answer", description: "as the clerk agreed" });
  assert.equal(a2.ok, true);
  const e2 = w.fm(A).clock[1];
  assert.deepEqual([a2.ord, e2.date, e2.text, e2.description, e2.amended], [1, "2026-09-10", "the clerk's answer", "as the clerk agreed", "date,description,text"]);
  assert.deepEqual(w.fm(A).clock[0], e, "the earlier entry is untouched");
});

test("R13 refusals in order: MACHINE_CANNOT_ADOPT_CLOCK, NO_SUCH_ACTION, NO_SUCH_CLOCK_PROPOSAL (never proposed, or already adopted), CLOCK_PROPOSAL_UNDETERMINED, then the revision's own; nothing is written by a refusal", () => {
  const { w, key } = setUp();
  const doc = w.text(A), rows = () => w.rows(`SELECT adopted_at FROM action_clock_proposals`).map((x) => x.adopted_at);
  for (const author of [MACHINE, "token:ai", "", null, undefined]) {
    const r = adopt(w, { author, target: "ACTN-2026-0404-x", proposal: "x" });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "MACHINE_CANNOT_ADOPT_CLOCK", "MACHINE_CANNOT_ADOPT_CLOCK",
      "C-123.4", rowOf("MACHINE_CANNOT_ADOPT_CLOCK").translation], String(author));
  }
  assert.deepEqual(adopt(w, { target: "ACTN-2026-0404-x", proposal: "x" }), actions.noSuchAction("ACTN-2026-0404-x"));
  assert.deepEqual(adopt(w, { viewer: "nobody", proposal: "x" }), actions.noSuchAction(A), "invisible as absent");
  for (const proposal of ["x", "", null, "records_answer", `records_answer@${BOB}`, `other@${MACHINE}`]) {
    const r = adopt(w, { proposal });
    assert.deepEqual([r.reason, r.check], ["NO_SUCH_CLOCK_PROPOSAL", "C-123.5"], String(proposal));
  }
  /* undetermined: a member's own proposal before any sent entry on a second action. */
  const B = "ACTN-2026-0002-b";
  w.action(B);
  const u = w.c.clockPropose({ target: B, rule: "records_answer", proposer: M, viewer: M });
  const und = w.c.clockAdopt({ target: B, proposal: u.proposal.key, author: M, viewer: M, date: "2026-10-01" });
  assert.deepEqual([und.reason, und.check, und.translation], ["CLOCK_PROPOSAL_UNDETERMINED", "C-123.6", rowOf("CLOCK_PROPOSAL_UNDETERMINED").translation]);
  assert.match(und.why, /no sent entry/);
  /* the revision's own: an amended date that is no calendar day, and another member's lease on the action. */
  assert.equal(adopt(w, { proposal: key, date: "2026-02-30" }).reason, "CLOCK_ENTRY_REFUSED");
  assert.equal(w.record.acquireLease(A, BOB, 30000).ok, true);
  assert.equal(adopt(w, { proposal: key }).reason, "LEASE_HELD");
  w.record.releaseLease(A, BOB);
  assert.equal(w.text(A), doc, "no refusal touched the document");
  assert.deepEqual(rows(), [null, null], "no refusal marked a proposal adopted");
  /* adopted once: a second adoption of the same proposal finds none standing. */
  assert.equal(adopt(w, { proposal: key }).ok, true);
  assert.equal(adopt(w, { proposal: key }).reason, "NO_SUCH_CLOCK_PROPOSAL");
  assert.equal(w.fm(A).clock.length, 1);
});

test("R7 every deadline names its basis kind: rule (a law or order, which may name a held standard, its in-force state read on the date, the member's citation kept), commitment, dependency (never a violation) or window; an entry naming none reads as stating none", () => {
  const dep = ['  - text: "budget adopted"', '    description: "before the fiscal year"', "    date: 2026-09-20", '    basis: "the board\'s budget calendar"',
               "    status: pending", "    basis_kind: dependency", '    precedes: "the fiscal year, 2026-10-01"', '    lead: "10 days"', '    why: "a budget must be in place before its period begins"'];
  const com = ['  - text: "records by 15 Sept"', '    description: "the clerk\'s own promise"', "    date: 2026-09-15", '    basis: "letter of 2026-09-02"',
               "    status: pending", "    basis_kind: commitment", '    committed_by: "the Town Clerk"'];
  const win = ['  - text: "our follow-up"', '    description: "the group\'s own date"', "    date: 2026-09-10", '    basis: "the group\'s plan"', "    status: pending", "    basis_kind: window"];
  const { w, key } = setUp(["clock:", ...dep, ...com, ...win, ...CLK("2026-09-05")]);
  const s = w.standards();
  const std = s.standardDeclare({ cite: "Test Stat. § 1.140", kind: "statute", issuer: "the Town", text: ["CNT-2026-0001-a"],
                                  period: { from: "2020-01-01", to: "2026-09-06" }, reason: "the records answer's law", author: M, viewer: M });
  assert.equal(std.ok, true, JSON.stringify(std).slice(0, 300));
  const r = adopt(w, { proposal: key, standard: std.id });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const e = w.fm(A).clock[4];
  assert.deepEqual([e.standard, e.basis_kind], [std.id, "rule"]);
  assert.match(e.basis, /^Test Stat\. § 1\.140/, "the citation stays the profile's statement, not replaced by the standard's");
  const by = Object.fromEntries(w.c.overdueClocks({ viewer: M }).items.map((x) => [x.ord, x.basis_of]));
  assert.deepEqual(by[0], { kind: "dependency", citation: "the board's budget calendar", precedes: "the fiscal year, 2026-10-01", lead: "10 days",
    why: "a budget must be in place before its period begins",
    says: "a date derived from the event it must precede; missing it is a dated fact about sequence, never a violation" });
  assert.deepEqual(by[1], { kind: "commitment", citation: "letter of 2026-09-02", committed_by: "the Town Clerk" });
  assert.deepEqual(by[2], { kind: "window", citation: "the group's plan" });
  assert.deepEqual(by[3], { kind: null, citation: "Act s.2" }, "an entry written before T33-74 states no kind");
  /* the standard's period ended 2026-09-06, before the entry's 2026-09-07: not in force on its date, read, never stored. */
  assert.deepEqual([by[4].kind, by[4].standard.id, by[4].standard.state], ["rule", std.id, "not_in_force"]);
  assert.match(by[4].standard.why, /ended 2026-09-06/);
  /* a standard the member may not see, or none held, is refused before anything is written. */
  w.c.clockPropose({ target: A, rule: "records_answer", proposer: MACHINE, viewer: MACHINE });
  const no = adopt(w, { proposal: key, standard: "STD-2026-0404-statute" });
  assert.deepEqual([no.ok, no.reason], [false, "NO_SUCH_STANDARD"]);
  assert.equal(w.fm(A).clock.length, 5);
  /* a proposal's basis kind is rule, and R2 never computes a date into the record: only the member's adoption did. */
  assert.equal(w.c.clockPropose({ target: A, rule: "records_answer", proposer: MACHINE, viewer: MACHINE }).proposal.entry.basis_kind, "rule");
  assert.equal(w.fm(A).clock.length, 5);
});

test("R8 a machine never adopts a deadline, and this module's one write to an action's document is a member's adoption, which only appends: no entry is removed or re-dated", () => {
  const { w, key } = setUp(["clock:", ...CLK("2026-09-03"), ...CLK("2026-09-04", "met")]);
  const before = w.fm(A).clock;
  for (const author of [MACHINE, "token:ai"]) assert.equal(adopt(w, { proposal: key, author, viewer: MACHINE }).reason, "MACHINE_CANNOT_ADOPT_CLOCK");
  assert.deepEqual(w.fm(A).clock, before, "nothing written by a machine");
  assert.equal(adopt(w, { proposal: key }).ok, true);
  const after = w.fm(A).clock;
  assert.deepEqual(after.slice(0, 2), before, "the entries held are left as they were");
  assert.equal(after.length, 3);
  assert.deepEqual(w.rows(`SELECT COUNT(*) AS n FROM action_reminders`)[0].n, 0, "an adoption sets no reminder");
});

test("R13 the op clockadopt reads the control plane's stamps from the query, never the body's", () => {
  const { w, key } = setUp();
  const op = (qs, body = null) => clocks.actionClocksOps(w.c, new URL(`https://x/?${qs}`), body).clockadopt();
  assert.equal(op(`viewer=${M}`, { target: A, proposal: key, author: M }).reason, "MACHINE_CANNOT_ADOPT_CLOCK", "an author in the body is not the stamp");
  const r = op(`target=${A}&proposal=${encodeURIComponent(key)}&author=${M}&viewer=${M}`);
  assert.deepEqual([r.ok, r.ord, r.adopted_by], [true, 0, M]);
});
