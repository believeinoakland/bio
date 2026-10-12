/* action-clocks' T46 entries at its interface (T46-34): R19, a timed entry's instant and zone in `pendingClocks`' items
   (N918, for `monitoring` R34, R50), and R20, the standing proposals read before one is adopted (`clockProposalsFor`,
   `op=clockproposals`; N925, for `affordances` R51). On the test profile; instance clock 2026-09-28T12:00Z, the action's
   zone America/Halifax. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, CLK } from "./fixture.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";
import * as actions from "../../../src/actions/index.mjs";
import { get } from "../../../../jurisdictions/index.mjs";

const M = V("alice"), BOB = V("bob");
const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b";
const key = (x) => `${x.action}:${x.ord}`;
/* One clock entry with its own keys. */
const E = (date, extra = []) => [`  - text: "t"`, '    description: "d"', `    date: ${date}`, "    basis: Act s.2", "    status: pending", ...extra];
const sent = (w, id, at) => assert.equal(w.actions.actionCorrespond({ target: id, direction: "sent", at, account: "sent", viewer: M, author: M }).ok, true);

test("R19 each pendingClocks item carries due_at and due_zone as R3's do: a timed entry its instant and zone (the entry's due_zone, else the action's zone); control: a date-only entry answers both null; R1's refusal, order and paging unchanged", () => {
  const w = world();
  w.action(A, ["clock:", ...E("2026-09-01"), ...E("2026-09-02", ['    due_at: "2026-09-02T17:00"', "    due_zone: America/Toronto"]),
               ...E("2026-09-03", ['    due_at: "2026-09-03T12:00"']), ...E("2026-09-04", ['    due_at: "soon"'])]);
  w.action(B, ["clock:", ...CLK("2026-09-05")]);
  const r = w.c.pendingClocks({ before: "2026-10-01", viewer: M });
  assert.equal(r.ok, true);
  assert.deepEqual(r.items, [
    { action: A, ord: 0, date: "2026-09-01", basis: "Act s.2", text: "t", past: true, due_at: null, due_zone: null },
    { action: A, ord: 1, date: "2026-09-02", basis: "Act s.2", text: "t", past: true, due_at: "2026-09-02T17:00", due_zone: "America/Toronto" },
    { action: A, ord: 2, date: "2026-09-03", basis: "Act s.2", text: "t", past: true, due_at: "2026-09-03T12:00", due_zone: "America/Halifax" },
    { action: A, ord: 3, date: "2026-09-04", basis: "Act s.2", text: "t", past: true, due_at: null, due_zone: null },
    { action: B, ord: 0, date: "2026-09-05", basis: "Act s.2", text: "t", past: true, due_at: null, due_zone: null }],
    "the entry's zone, else the action's; a time that is no time of day is none");
  /* the same instant R3 answers for the same entry. */
  const over = Object.fromEntries(w.c.overdueClocks({ viewer: M }).items.map((x) => [key(x), [x.due_at, x.due_zone]]));
  for (const x of r.items) assert.deepEqual([x.due_at, x.due_zone], over[key(x)], key(x));
  /* R1 unchanged: paging through each cursor reaches every entry in order, and the refusal is its own. */
  const seen = [];
  let after = null;
  for (;;) {
    const p = w.c.pendingClocks({ before: "2026-10-01", limit: 2, after, viewer: M });
    seen.push(...p.items);
    if (!p.truncated) break;
    after = p.cursor;
  }
  assert.deepEqual(seen, r.items);
  assert.equal(w.c.pendingClocks({ before: "soon", viewer: M }).reason, "PENDING_CLOCKS_BAD_BEFORE");
  /* an entry whose action has no zone held: a timed entry stating none answers its time and a null zone. */
  const bare = world({ profiles: null });
  bare.action(A, ["clock:", ...E("2026-09-03", ['    due_at: "2026-09-03T12:00"'])]);
  assert.deepEqual(bare.c.pendingClocks({ before: "2026-10-01", viewer: M }).items.map((x) => [x.due_at, x.due_zone]), [["2026-09-03T12:00", null]]);
});

test("R19 an entry a member states with a time, and one adopted from a count due at the close of business, answer their instant in pendingClocks", () => {
  /* the registry answer 3 business days, due at the Town Clerk's Friday close, 12:00 (civil-time R14). */
  const p3 = structuredClone(get("test-port-ellery"));
  p3.deadlines = p3.deadlines.map((d) => (d.rule === "registry_answer" ? { ...d, amount: 3 } : d));
  const w = world({ override: { "test-port-ellery": p3 } });
  w.action(A, ["clock:", ...CLK("2026-09-01")]);
  assert.equal(w.c.clockState({ target: A, text: "file our reply", description: "d", date: "2026-09-10", basis: "Registry rule 4",
    basis_kind: "rule", owed_by: "group", due_at: "2026-09-10T16:30", due_zone: "America/Halifax", author: M, viewer: M }).ok, true);
  const C = "ACTN-2026-0009-c";
  w.action(C, ["counterparty:", "  state: named", "  role: Town Clerk", "  body: City of Port Ellery", "action_kind: commitment_claim"]);
  sent(w, C, "2026-09-01");
  const p = w.c.clockPropose({ target: C, rule: "registry_answer", proposer: M, viewer: M });
  assert.equal(w.c.clockAdopt({ target: C, proposal: p.proposal.key, author: M, viewer: M }).ok, true);
  const by = Object.fromEntries(w.c.pendingClocks({ before: "2026-10-01", viewer: M }).items.map((x) => [key(x), [x.due_at, x.due_zone]]));
  assert.deepEqual(by, { [`${A}:0`]: [null, null], [`${A}:1`]: ["2026-09-10T16:30", "America/Halifax"],
                         [`${C}:0`]: ["2026-09-04T12:00", "America/Halifax"] });
  assert.deepEqual([w.fm(C).clock[0].due_at, w.fm(C).clock[0].due_zone], ["2026-09-04T12:00", "America/Halifax"]);
});

test("R20 clockProposalsFor answers the standing proposals on a visible action, each with its key, rule, date or undetermined with why, basis, trace, label and when proposed; [] when none; control: an adopted proposal is not listed; absent or invisible is actions.noSuchAction; writes nothing", () => {
  const w = world();
  w.action(A);
  assert.deepEqual(w.c.clockProposalsFor({ action: A, viewer: M }), { ok: true, action: A, proposals: [], limit: 500, truncated: false });
  /* undetermined before anything is sent: a member's proposal, with why. */
  const u = w.c.clockPropose({ target: A, rule: "records_answer", proposer: BOB, viewer: BOB });
  sent(w, A, "2026-09-01");
  const p = w.c.clockPropose({ target: A, rule: "records_answer", proposer: MACHINE, viewer: MACHINE });
  const r = w.c.clockProposalsFor({ action: A, viewer: M });
  assert.deepEqual([r.ok, r.action, r.limit, r.truncated], [true, A, 500, false]);
  assert.deepEqual(r.proposals.map((x) => x.key), [`records_answer@${MACHINE}`, `records_answer@${BOB}`], "in (rule, proposer) order");
  const [mach, mine] = r.proposals;
  assert.deepEqual([mach.key, mach.rule, mach.date, mach.undetermined, mach.basis, mach.proposed_by, mach.proposed_at],
    [p.proposal.key, "records_answer", "2026-09-07", null, p.proposal.entry.basis, MACHINE, "2026-09-28T12:00:00Z"]);
  assert.deepEqual(mach.entry, p.proposal.entry, "the entry R2 proposed");
  assert.deepEqual(mach.trace, p.proposal.trace, "the trace R2 answered");
  assert.match(mach.trace_line, /^5 business days after 2026-09-01/);
  assert.deepEqual(mach.label, { by: MACHINE, state: "machine_proposed", machine_work: true, says: p.proposal.says });
  assert.deepEqual([mine.key, mine.date, mine.label.state, mine.label.machine_work], [u.proposal.key, null, "member_proposed", false]);
  assert.match(mine.undetermined, /no sent entry/, "undetermined, with why");
  assert.equal(mine.undetermined, u.proposal.undetermined);
  /* the key it answers is the one clockadopt takes; once adopted, it no longer stands (control). */
  assert.equal(w.c.clockAdopt({ target: A, proposal: mach.key, author: M, viewer: M }).ok, true);
  assert.deepEqual(w.c.clockProposalsFor({ action: A, viewer: M }).proposals.map((x) => x.key), [u.proposal.key]);
  /* a restatement stands again. */
  w.c.clockPropose({ target: A, rule: "records_answer", proposer: MACHINE, viewer: MACHINE });
  assert.equal(w.c.clockProposalsFor({ action: A, viewer: M }).proposals.length, 2);
  /* absent and invisible alike. */
  assert.deepEqual(w.c.clockProposalsFor({ action: "ACTN-2026-0404-x", viewer: M }), actions.noSuchAction("ACTN-2026-0404-x"));
  assert.deepEqual(w.c.clockProposalsFor({ action: A, viewer: "nobody" }), actions.noSuchAction(A));
  assert.deepEqual(w.c.clockProposalsFor({ viewer: M }), actions.noSuchAction(null));
  /* a read: the document and the proposals stand as they were before it. */
  const x = world();
  x.action(B);
  x.c.clockPropose({ target: B, rule: "records_answer", proposer: M, viewer: M });
  const before = [x.text(B), JSON.stringify(x.rows(`SELECT * FROM action_clock_proposals`))];
  x.c.clockProposalsFor({ action: B, viewer: M });
  assert.deepEqual([x.text(B), JSON.stringify(x.rows(`SELECT * FROM action_clock_proposals`))], before);
});

test("R20 at most 500 proposals are answered, truncated stated; the op clockproposals reads the viewer from the query", () => {
  const w = world();
  w.action(A);
  sent(w, A, "2026-09-01");
  for (let i = 0; i < 501; i++) assert.equal(w.c.clockPropose({ target: A, rule: "records_answer", proposer: V(`m${String(i).padStart(3, "0")}`), viewer: M }).ok, true);
  const r = w.c.clockProposalsFor({ action: A, viewer: M });
  assert.deepEqual([r.proposals.length, r.truncated, r.limit, clocks.CLOCK_PROPOSALS_MAX], [500, true, 500, 500]);
  assert.equal(r.proposals[499].key, `records_answer@${V("m499")}`);
  const op = (qs, body = null) => clocks.actionClocksOps(w.c, new URL(`https://x/?${qs}`), body).clockproposals();
  assert.deepEqual(op(`action=${A}`, { viewer: M }), actions.noSuchAction(A), "a viewer in the body is not the stamp");
  const o = op(`viewer=${M}`, { action: A });
  assert.deepEqual([o.ok, o.proposals.length, o.truncated], [true, 500, true]);
});
