/* duties, T45 (T45-8; N855, N882; Actions D6d, D7): duties proposed from a body's reply or a report (R30), the duties
   arising in named captures and whether every one reads met (R31), and the fifth basis kind refused (R23); over the
   real modules. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, fictionalView, E, BOB, CAROL, MACHINE, ZONE, SHA } from "./fixture.mjs";
import { DUTIES_CHECKS, CAPTURES_MAX, STATED_BASIS, BASIS_KINDS } from "../../../src/duties/index.mjs";

const AS_OF = "2026-03-02T12:00:00Z";
const day = (value) => ({ value, precision: "day", zone: ZONE });
const row = (r, code) => {
  assert.equal(r.ok, false, `${code}: ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code);
  assert.equal(r.code, code);
  if (DUTIES_CHECKS[code]) assert.deepEqual([r.check, r.translation], [DUTIES_CHECKS[code].check, DUTIES_CHECKS[code].translation]);
};
const written = (w) => ["duties", "duty_proposals", "duty_versions", "duty_matches", "duty_transitions"]
  .map((t) => w.sqlRows(`SELECT COUNT(*) AS n FROM ${t}`)[0].n).join();

/* A reply captured as its own document, and duties arising in it, each a promise dated `date` (its own trigger). */
function replyWorld() {
  const w = world();
  const reply = w.passage("reply");
  const other = w.passage("other-reply");
  const promise = (date, over = {}) => w.declare({ arising_in: reply.capSha, trigger: { kind: "date", date },
                                                    time: { basis: "commitment" }, ...over });
  const meet = (id, value) => {
    const key = w.duties.occurrencesOf({ dutyId: id, asOf: AS_OF, from: "2026-01-01", to: "2026-03-31", viewer: BOB }).occurrences[0].key;
    const ev = w.event({ value: day(value), concerns: [E.clerk] });
    const r = w.duties.matchEvent({ dutyId: id, occurrenceKey: key, eventId: ev, reason: "the body did it", by: BOB });
    assert.equal(r.ok, true, JSON.stringify(r));
  };
  const arising = (over = {}) => w.duties.dutiesArisingIn({ captures: [reply.capSha], asOf: AS_OF, viewer: BOB, ...over });
  return { w, reply, other, promise, meet, arising };
}

test("R31 dutiesArisingIn refuses a bad capture list and a missing asOf, writing nothing; the control reads", () => {
  const { w, reply, arising } = replyWorld();
  const before = written(w);
  row(arising({ captures: [] }), "BAD_CAPTURES");
  row(arising({ captures: undefined }), "BAD_CAPTURES");
  row(arising({ captures: "abc" }), "BAD_CAPTURES");
  row(arising({ captures: ["not a sha"] }), "BAD_CAPTURES");
  row(arising({ captures: Array.from({ length: CAPTURES_MAX + 1 }, (_, i) => SHA(i)) }), "BAD_CAPTURES");
  assert.equal(CAPTURES_MAX, 200);
  assert.equal(arising({ captures: Array.from({ length: CAPTURES_MAX }, (_, i) => (i ? SHA(i) : reply.capSha)) }).ok, true, "200 ids read");
  row(arising({ asOf: undefined }), "NO_AS_OF");
  row(arising({ asOf: "2026-03-02" }), "NO_AS_OF");
  const ok = arising();
  assert.deepEqual([ok.ok, ok.count, ok.all_met, ok.partial], [true, 0, false, undefined], "no duty: never all met");
  assert.equal(written(w), before, "a read writes nothing");
});

test("R31 all_met is true exactly when there is a duty, each has an occurrence and every occurrence reads met or met_late", () => {
  const { w, reply, other, promise, meet, arising } = replyWorld();
  const a = promise("2026-02-02").duty_id;
  const b = promise("2026-02-10").duty_id;
  w.declare({ arising_in: other.capSha, trigger: { kind: "date", date: "2026-02-02" }, time: { basis: "commitment" } });
  w.declare({});                                                         /* arising in nothing */
  let r = arising();
  assert.deepEqual(r.duties.map((d) => d.duty_id), [a, b], "only the duties arising in the named capture");
  assert.deepEqual(r.duties.map((d) => d.occurrences.map((o) => o.state)), [["overdue"], ["overdue"]]);
  assert.equal(r.all_met, false);
  meet(a, "2026-02-01");                                                 /* on time */
  r = arising();
  assert.deepEqual([r.duties[0].occurrences[0].state, r.all_met], ["met", false], "one still overdue");
  meet(b, "2026-02-20");                                                 /* late: a promise kept late is kept */
  r = arising();
  assert.deepEqual(r.duties.map((d) => d.occurrences[0].state), ["met", "met_late"]);
  assert.equal(r.all_met, true);
  for (const d of r.duties) assert.deepEqual(d.arising_in, reply.capSha);
  /* each occurrence as R9 derives it, as of the day asked */
  const o = w.duties.occurrencesOf({ dutyId: a, asOf: AS_OF, viewer: BOB }).occurrences[0];
  assert.deepEqual(r.duties[0].occurrences[0], { key: o.key, trigger: o.trigger, due: o.due, state: o.state, why: o.why });
  assert.equal(arising({ asOf: "2026-02-15T12:00:00Z" }).all_met, false, "as known before the late match, not all met");
  /* several captures in one read */
  const both = w.duties.dutiesArisingIn({ captures: [reply.capSha, other.capSha, reply.capSha], asOf: AS_OF, viewer: BOB });
  assert.deepEqual([both.count, both.all_met], [3, false]);
  /* a duty with no occurrence yet (its date after the day asked) is not met */
  const c = promise("2026-06-01").duty_id;
  r = arising();
  assert.deepEqual([r.duties.find((d) => d.duty_id === c).occurrences.length, r.all_met], [0, false]);
  /* a withdrawn duty is neither answered nor counted */
  assert.equal(w.duties.withdraw({ dutyId: c, reason: "the body withdrew the promise", by: BOB }).ok, true);
  r = arising();
  assert.deepEqual([r.duties.map((d) => d.duty_id), r.all_met], [[a, b], true]);
  /* a proposal is not adopted: never answered */
  w.duties.propose({ ...w.fields({ arising_in: reply.capSha, trigger: { kind: "date", date: "2026-02-03" }, time: { basis: "commitment" } }), by: MACHINE });
  assert.equal(arising().count, 2);
});

test("R31 sight: a duty the viewer may not see is neither answered nor counted, all_met is over the visible ones, with partial", () => {
  const { w, promise, meet, arising } = replyWorld();
  const a = promise("2026-02-02").duty_id;
  meet(a, "2026-02-01");
  const hid = promise("2026-02-03", { project: w.project("bob") }).duty_id;
  const bob = arising();
  assert.deepEqual([bob.count, bob.all_met, bob.partial], [2, false, undefined], "bob sees the unmet hidden one");
  const carol = arising({ viewer: CAROL });
  assert.deepEqual([carol.duties.map((d) => d.duty_id), carol.count, carol.all_met, carol.partial], [[a], 1, true, true]);
  assert.ok(!JSON.stringify(carol).includes(hid), "never named");
  const none = arising({ viewer: undefined });
  assert.deepEqual([none.count, none.all_met, none.partial], [0, false, true], "an absent viewer sees nothing");
});

test("R31 writes nothing and never throws: a throwing trigger source, a hostile argument", () => {
  const { w, reply, arising } = replyWorld();
  w.duties.registerTriggerSource("actions", () => { throw new Error("actions down"); });
  w.declare({ arising_in: reply.capSha, trigger: { kind: "source", source: "actions" } });
  const before = written(w);
  const r = arising();
  assert.equal(r.ok, true);
  assert.deepEqual([r.count, r.all_met, r.duties[0].source_errors], [1, false, [{ source: "actions", error: "actions down" }]]);
  for (const bad of [null, 7, "x", [], new Proxy({}, { get() { throw new Error("boom"); } })])
    assert.doesNotThrow(() => w.duties.dutiesArisingIn(bad));
  assert.equal(written(w), before);
  /* the route arm */
  const op = w.ops(`captures=${reply.capSha}&as_of=${AS_OF}&viewer=member:bob`).dutiesarising();
  assert.deepEqual([op.ok, op.count], [true, 1]);
});

test("R23 the fifth basis kind, the other side's stated deadline, is a deadline on the group: refused UNKNOWN_BASIS_KIND naming the four; a commitment is accepted", () => {
  const w = world();
  const before = written(w);
  for (const r of [w.declare({ time: { basis: STATED_BASIS, date: "2026-04-01" } }),
                   w.duties.propose({ ...w.fields({ time: { basis: STATED_BASIS, date: "2026-04-01" } }), by: MACHINE })]) {
    row(r, "UNKNOWN_BASIS_KIND");
    assert.deepEqual(r.bases, ["rule", "commitment", "dependency", "window"]);
    for (const b of r.bases) assert.ok(r.detail.includes(b), b);
    assert.match(r.detail, /a deadline on the group/);
  }
  assert.equal(STATED_BASIS, "stated", "action-clocks' spelling (its R7)");
  assert.ok(!BASIS_KINDS.includes(STATED_BASIS));
  assert.equal(written(w), before, "nothing written");
  /* the control */
  const ok = w.declare({ time: { basis: "commitment", date: "2026-04-01" } });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  /* any other unknown kind is refused alike, without the group's-deadline words */
  const other = w.declare({ time: { basis: "hunch" } });
  row(other, "UNKNOWN_BASIS_KIND");
  assert.doesNotMatch(other.detail, /deadline on the group/);
});

/* ---- R30 ---- */

const GJ = "Test Grand Jury";
const gjRule = (rule, amount, over = {}) => ({ rule, applies_to: "claim", units: "days", amount, count: "calendar", starts: "third_party",
  starter: { role: GJ, body: GJ }, owed_by: "body", citation: `Test Penal Code §933(c) (${rule})`, status: "researched", basis: "TEST", ...over });

/* A world over the real modules; `proposalRead: false` takes standards' R54 read away, to show duties fails closed. */
function responseWorld({ view = null, proposalRead = true } = {}) {
  let w = null;
  const standards = proposalRead ? undefined
    : () => new Proxy(w.standards, { get: (o, k) => (k === "standardProposalRead" ? undefined : typeof o[k] === "function" ? o[k].bind(o) : o[k]) });
  w = world({ ...(view ? { view } : {}), deps: standards ? { standards } : {} });
  const words = (name, text) => { const p = w.passage(name, { text }); return { ...p, cite: { captureSha: p.capSha, extent: { kind: "pdf-page", page: 0 } } }; };
  const reply = words("reply", "We will publish the audit response by June 30, 2026.");
  const vague = words("vague-reply", "We will publish it by spring.");
  const report = words("report", "Recommendation R1: the Town Clerk shall respond within the period the law sets.");
  const commitment = w.sw.declare({ cite: "Clerk's letter of 3 March 2026", kind: "commitment", issuer: "Town Clerk", text: [reply.contentId] });
  assert.equal(commitment.ok, true, JSON.stringify(commitment).slice(0, 300));
  const gj = w.sw.declare({ cite: "Grand Jury Report 2026-01", kind: "court", issuer: GJ, text: [report.contentId], period: { from: "2026-01-15", to: null } });
  assert.equal(gj.ok, true, JSON.stringify(gj).slice(0, 300));
  const propose = (over = {}) => w.duties.proposeFromResponse({ kind: "promise", arisingIn: reply.capSha, quote: reply.cite, obligor: E.clerk,
    performance: "publish the audit response", standard: commitment.id, by: MACHINE, ...over });
  const required = (over = {}) => w.duties.proposeFromResponse({ kind: "required_response", arisingIn: report.capSha, quote: report.cite,
    obligor: E.council, performance: "respond to Recommendation R1", standard: gj.id, by: MACHINE, ...over });
  return { w, reply, vague, report, commitment: commitment.id, gj: gj.id, propose, required };
}

test("R30 refusals, in order, each writing nothing, with the control landing", () => {
  const { w, reply, vague, report, propose } = responseWorld();
  const before = written(w);
  row(propose({ by: "" }), "DUTY_MEMBER_ACT_ONLY");
  row(propose({ kind: "rumour" }), "RESPONSE_KIND_UNKNOWN");
  row(propose({ kind: undefined }), "RESPONSE_KIND_UNKNOWN");
  row(propose({ arisingIn: SHA("never captured") }), "ARISING_IN_NOT_HELD");
  row(propose({ arisingIn: "not a sha" }), "ARISING_IN_NOT_HELD");
  /* content's extent refusals, then the quote's capture */
  assert.equal(propose({ quote: undefined }).reason, "NO_SHA");
  assert.equal(propose({ quote: { captureSha: reply.capSha } }).reason, "NO_EXTENT");
  const out = propose({ quote: { captureSha: reply.capSha, extent: { kind: "pdf-page", page: 9 } } });
  assert.deepEqual([out.reason, out.extent_refusal.code], ["EXTENT_NOT_IN_CAPTURE", "CONTENT_EXTENT_OUT_OF_RANGE"]);
  row(propose({ quote: report.cite }), "RESPONSE_EXTENT_NOT_IN");
  /* a promise's words state one whole date or are kept as written */
  const unread = propose({ arisingIn: vague.capSha, quote: vague.cite });
  row(unread, "PROMISE_DATE_UNREAD");
  assert.equal(unread.words, "We will publish it by spring.", "kept as written, never completed");
  assert.ok(unread.detail.includes("by spring"));
  const blank = propose({ quote: { captureSha: reply.capSha, extent: { kind: "pdf-page", page: 1 } } });
  row(blank, "PROMISE_DATE_UNREAD");
  assert.equal(blank.words, null);
  /* the source: a held commitment, of that kind */
  assert.equal(propose({ standard: undefined }).reason, "NO_SUCH_STANDARD");
  assert.equal(propose({ standard: "STD-2026-0099-none" }).reason, "NO_SUCH_STANDARD");
  row(propose({ standard: w.standard() }), "UNKNOWN_SOURCE_KIND");
  /* R1's and R29's refusals apply */
  assert.equal(propose({ obligor: "ENT-2026-0099" }).reason, "NO_SUCH_ENTITY");
  row(propose({ obligor: E.private }), "NOT_ACTING_FOR_PUBLIC");
  row(propose({ performance: "" }), "NO_PERFORMANCE");
  assert.equal(written(w), before, "nothing written");
  const ok = propose();
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.deepEqual([ok.tracked, ok.label.machine_work], [false, true], "a proposal (R2): stored apart, labelled, never tracked");
  assert.equal(w.duties.recordTransitions({ asOf: AS_OF }).duties_read, 0);
});

test("R30 a promise: commitment basis, its date the quote's whole date, arising in the reply, the quote held as cited; tracked once adopted", () => {
  const { w, reply, commitment, propose } = responseWorld();
  const p = propose();
  const a = w.duties.adopt({ proposalId: p.proposal_id, clause: "the clerk's reply: by June 30, 2026", by: BOB });
  assert.equal(a.ok, true, JSON.stringify(a));
  const d = w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty;
  assert.deepEqual([d.modality, d.obligor, d.performance, d.source, d.trigger, d.time.basis, d.arising_in],
    ["duty", E.clerk, { act: "publish the audit response" }, { kind: "standard", standard: commitment }, { kind: "date", date: "2026-06-30" }, "commitment", reply.capSha]);
  assert.equal(d.response.kind, "promise");
  assert.deepEqual([d.response.quote.capture_sha, d.response.quote.extent], [reply.capSha, reply.cite.extent]);
  assert.equal(w.content.passageText(d.response.quote.content_id), "We will publish the audit response by June 30, 2026.", "the quote, never paraphrased");
  assert.equal(d.time.citation, d.response.quote.content_id);
  const o = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: "2026-07-02T12:00:00Z", viewer: BOB }).occurrences[0];
  assert.deepEqual([o.due.date, o.due.basis_kind, o.due.law_set, o.state], [day("2026-06-30"), "commitment", false, "overdue"]);
  /* R31 answers it with its kind */
  const r = w.duties.dutiesArisingIn({ captures: [reply.capSha], asOf: AS_OF, viewer: BOB });
  assert.deepEqual(r.duties.map((x) => x.response_kind), ["promise"]);
  /* a member's own call is a proposal too */
  assert.deepEqual(propose({ by: CAROL }).label.state, "member_proposed");
});

test("R30 a promise on a standards proposal: adoption refused DUTY_SOURCE_NOT_HELD until that proposal is adopted, then naming the adopted standard", () => {
  const { w, reply, propose } = responseWorld();
  const sp = w.standards.standardPropose({ cite: "Clerk's spoken promise, confirmed in writing", kind: "commitment", issuer: "Town Clerk", text: [reply.contentId],
    why: "the clerk's reply states it", proposer: MACHINE, viewer: MACHINE });
  assert.equal(sp.ok, true, JSON.stringify(sp).slice(0, 300));
  const p = propose({ standard: undefined, standardProposal: sp.proposal.id });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const before = written(w);
  const refused = w.duties.adopt({ proposalId: p.proposal_id, clause: "the reply", by: BOB });
  row(refused, "DUTY_SOURCE_NOT_HELD");
  assert.equal(refused.standard_proposal, sp.proposal.id);
  assert.equal(written(w), before, "nothing written");
  /* a duty declared on the pending proposal is refused alike: only a proposal may rest on it */
  row(w.declare({ source: { kind: "standard", standard_proposal: sp.proposal.id }, time: { basis: "commitment" } }), "DUTY_SOURCE_NOT_HELD");
  /* an unknown standards proposal is standards' own answer */
  assert.equal(propose({ standard: undefined, standardProposal: "STDP-2026-0099" }).reason, "STANDARD_NO_SUCH_PROPOSAL");
  /* the member adopts the commitment as a standard; the duty then adopts, naming it */
  const std = w.standards.standardAdopt({ proposal: sp.proposal.id, reason: "the clerk's written reply confirms it", period: { from: "2026-03-03", to: null },
    author: BOB, viewer: BOB });
  assert.equal(std.ok, true, JSON.stringify(std).slice(0, 300));
  const a = w.duties.adopt({ proposalId: p.proposal_id, clause: "the reply", by: BOB });
  assert.equal(a.ok, true, JSON.stringify(a));
  const d = w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty;
  assert.deepEqual(d.source, { kind: "standard", standard: std.id, adopted_from: sp.proposal.id });
  /* proposing on an adopted proposal names its standard at once */
  const again = propose({ standard: undefined, standardProposal: sp.proposal.id });
  const ad = w.duties.adopt({ proposalId: again.proposal_id, clause: "c", by: BOB });
  assert.equal(w.duties.readDuty({ dutyId: ad.duty_id, viewer: BOB }).duty.source.standard, std.id);
  /* a proposal of another kind is refused */
  const pol = w.standards.standardPropose({ cite: "A policy", kind: "policy", text: [reply.contentId], why: "w", proposer: MACHINE, viewer: MACHINE });
  row(propose({ standard: undefined, standardProposal: pol.proposal.id }), "UNKNOWN_SOURCE_KIND");
});

test("R30 a promise on a standards proposal fails closed where standards cannot answer whether it was adopted", () => {
  const { w, reply, propose } = responseWorld({ proposalRead: false });
  const sp = w.standards.standardPropose({ cite: "c", kind: "commitment", text: [reply.contentId], why: "w", proposer: MACHINE, viewer: MACHINE });
  row(propose({ standard: undefined, standardProposal: sp.proposal.id }), "DUTY_SOURCE_NOT_HELD");
});

test("R30 a required response: a court source, a rule basis by the governing view's rule for a body answering the report, else undetermined, never defaulted", () => {
  const one = fictionalView({ deadlines: [...fictionalView().deadlines, gjRule("gj_body_comment", 90)] });
  const { w, report, gj, required } = responseWorld({ view: one });
  const before = written(w);
  row(required({ standard: w.standard() }), "UNKNOWN_SOURCE_KIND");
  assert.equal(required({ standard: undefined }).reason, "NO_SUCH_STANDARD");
  const undated = w.sw.declare({ cite: "Undated report", kind: "court", issuer: GJ, text: [report.contentId], period: { from: null, to: null } });
  assert.equal(undated.ok, true, JSON.stringify(undated).slice(0, 300));
  row(required({ standard: undated.id }), "UNKNOWN_TRIGGER");
  row(required({ rule: "no_such_rule" }), "BAD_TIME");
  assert.equal(written(w), before);
  const p = required();
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  const a = w.duties.adopt({ proposalId: p.proposal_id, clause: "the report's Recommendation R1", by: BOB });
  const d = w.duties.readDuty({ dutyId: a.duty_id, viewer: BOB }).duty;
  assert.deepEqual([d.source, d.trigger, d.time.basis, d.response.kind, d.arising_in],
    [{ kind: "court", standard: gj }, { kind: "date", date: "2026-01-15" }, "rule", "required_response", report.capSha]);
  const o = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: AS_OF, viewer: BOB }).occurrences[0];
  assert.deepEqual([o.due.date.value, o.due.basis_kind, o.due.law_set, o.due.trace.citation], ["2026-04-15", "rule", true, "Test Penal Code §933(c) (gj_body_comment)"]);
  /* two rules a body owes the report: none chosen, undetermined naming them, unless the call names one */
  const two = fictionalView({ deadlines: [...one.deadlines, gjRule("gj_officer_comment", 60)] });
  w.setView(two);
  const u = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: AS_OF, viewer: BOB }).occurrences[0];
  assert.equal(u.state, "undetermined");
  assert.match(u.why, /hold 2 deadlines a body owes in response to Test Grand Jury \(gj_body_comment, gj_officer_comment\)/);
  const named = w.duties.adopt({ proposalId: required({ rule: "gj_officer_comment" }).proposal_id, clause: "c", by: BOB });
  assert.equal(w.duties.occurrencesOf({ dutyId: named.duty_id, asOf: AS_OF, viewer: BOB }).occurrences[0].due.date.value, "2026-03-16");
  /* none: undetermined, never a default */
  w.setView(fictionalView());
  const none = w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: AS_OF, viewer: BOB }).occurrences[0];
  assert.deepEqual([none.state, none.due.undetermined], ["undetermined", true]);
  assert.match(none.why, /hold no deadline a body owes in response to Test Grand Jury/);
  /* a deadline the group owes, or one another issuer starts, is never the body's */
  w.setView(fictionalView({ deadlines: [gjRule("ours", 5, { owed_by: "group" }), gjRule("theirs", 5, { starter: { role: "Auditor", body: "Auditor" } })] }));
  assert.equal(w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: AS_OF, viewer: BOB }).occurrences[0].state, "undetermined");
});

test("R30 the route arm: dutyfromresponse, the stamp from the query", () => {
  const { w, reply, commitment } = responseWorld();
  const body = { kind: "promise", arisingIn: reply.capSha, quote: reply.cite, obligor: E.clerk, performance: "publish it", standard: commitment, by: "member:mallory" };
  const r = w.ops("by=member:bob&viewer=member:bob", body).dutyfromresponse();
  assert.deepEqual([r.ok, r.label.by], [true, BOB]);
});

/* ---- R5 ---- */

test("R5 the profile deadlines are local-facts.governingView's: a group's confirmed rule governs here; with none the view is combine's", () => {
  const group = fictionalView({ deadlines: fictionalView().deadlines.map((d) => (d.rule === "records_response"
    ? { ...d, amount: 5, profile: "group", basis: "group rule RULE-1, confirmed 2026-02-01" } : d)) });
  let governing = group;
  const localFacts = { governingView: () => governing };
  const w = world({ deps: { view: null, localFacts } });
  const a = w.declare();
  const due = () => w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: AS_OF, viewer: BOB }).occurrences[0].due;
  assert.equal(due().date.value, "2026-02-09", "the group's 5 days (02-07 a Saturday, rolled)");
  governing = fictionalView();
  assert.equal(due().date.value, "2026-02-12", "the profile's 10 days");
  /* proposeFromRule reads the same view */
  governing = { ...group, deadlines: [] };
  assert.equal(w.duties.proposeFromRule({ rule: "records_response", office: E.clerk, by: MACHINE }).reason, "BAD_TIME");
  /* a view that throws or answers nothing settles nothing */
  localFacts.governingView = () => { throw new Error("down"); };
  assert.equal(w.duties.occurrencesOf({ dutyId: a.duty_id, asOf: AS_OF, viewer: BOB }).occurrences[0].state, "undetermined");
  /* by default, duties reaches local-facts on its own host */
  const real = world({ deps: { view: null } });
  assert.equal(real.duties.localFacts.constructor.name, "LocalFacts");
});
