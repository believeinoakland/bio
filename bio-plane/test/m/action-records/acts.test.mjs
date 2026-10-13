/* action-records' proposals stored apart at its interface (R1–R3, R12; was `actions` R19, R28, R73, R33's share):
   copied from `actions`' `acts.test.mjs` (R19, R28 arms) and `t41.test.mjs` (R73 arms), over a fixture without actions. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, M, MACHINE, A, B, HIDDEN, INFO, STD, STD_HIDDEN, progressionsStandIn, standardsStandIn }
  from "./fixture.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";
import * as records from "../../../src/action-records/index.mjs";

const reasons = (list) => list.map((r) => r.reason);
const laws = (...cites) => ["governing_laws:", ...cites.flatMap((c) => ["  - level: state", `    citation: "${c}"`]),
  "governing_laws_by: member:alice", 'governing_laws_at: "2026-09-02T00:00:00Z"'];

test("R1 actionLawsPropose: refusals in order (NO_AUTHOR, NO_TARGET, R7's list refusals, NO_SUCH_BUNDLE, NOT_AN_ACTION, a standard not seen); stored apart and labelled; never the list", () => {
  const w = world({ deps: { standards: standardsStandIn() } });
  w.action(A, laws("Act s.1", "Act s.2"));
  w.doc(INFO);
  w.hidden();
  const ok = [{ level: "state", citation: "Other" }];
  const P = (x) => w.r.actionLawsPropose({ target: A, laws: ok, proposer: MACHINE, viewer: MACHINE, ...x });
  assert.deepEqual(reasons([P({ proposer: "", target: "", laws: [] }), P({ target: "", laws: [] }), P({ laws: [] }),
    P({ laws: Array.from({ length: 13 }, (_, i) => ({ level: "city", citation: `B${i}` })) }),
    P({ laws: [{ level: "local", citation: "x" }] }), P({ laws: [{ level: "city", citation: "" }] }),
    P({ target: "ACTN-2026-0404-x" }), P({ target: HIDDEN, viewer: M, proposer: M }), P({ target: INFO }),
    P({ laws: [{ level: "state", citation: "S", standard: STD_HIDDEN }], viewer: M, proposer: M })]),
    ["NO_AUTHOR", "NO_TARGET", "NO_LAWS", "TOO_MANY_LAWS", "BAD_LAW_LEVEL", "BAD_CITATION", "NO_SUCH_BUNDLE",
     "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "NO_SUCH_STANDARD"]);
  /* R7's refusals carry their rows (C-73.2–.5) through the act */
  assert.deepEqual([P({ laws: [] }).check, P({ laws: [{ level: "local", citation: "x" }] }).check], ["C-73.2", "C-73.3"]);
  assert.equal(P({ laws: [{ level: "state", citation: "S", standard: STD_HIDDEN }], viewer: M, proposer: M }).target, A);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM action_law_proposals`).n, 0, "no refusal writes");
  /* the hidden action is seen by a machine viewer (membership R43): control */
  assert.equal(P({ target: HIDDEN }).ok, true);
  const before = w.text(A);
  const p = P({});
  assert.deepEqual([p.ok, p.evidence, p.weight, p.proposal.state, p.proposal.machine_work, p.proposal.by, p.proposal.laws],
    [true, false, "single", "machine_proposed", true, MACHINE, ok]);
  assert.deepEqual(p.proposal.says, grammar.lawProposalLabel(MACHINE).says, "action-grammar's label");
  assert.equal(p.governing_laws.state, "stated");
  assert.equal(p.governing_laws.laws.length, 2, "the list as it stands");
  assert.match(p.says, /^1 citation is proposed for this action\. This is not the action's list of governing laws/);
  assert.equal(w.text(A), before, "writes no file and never changes the list");
  /* a member's proposal is labelled member_proposed; a held standard the viewer may read lands with its law */
  const mp = P({ proposer: M, viewer: M, laws: [{ level: "state", citation: "Mine", standard: STD }] });
  assert.deepEqual([mp.ok, mp.proposal.state, mp.proposal.laws], [true, "member_proposed", [{ level: "state", citation: "Mine", standard: STD }]]);
  /* a proposer's restatement replaces its own proposal only */
  w.clock.ms += 60000;
  assert.equal(P({ proposer: M, viewer: M, laws: [{ level: "city", citation: "Mine2" }] }).ok, true);
  const block = w.r.lawProposalsFor(A);
  assert.deepEqual(block.proposals.map((x) => [x.by, x.state, x.laws.map((l) => l.citation)]),
    [[M, "member_proposed", ["Mine2"]], [MACHINE, "machine_proposed", ["Other"]]], "newest first, each proposer once");
  assert.deepEqual([block.limit, block.truncated], [records.LAW_PROPOSALS_READ_MAX, false]);
  assert.match(block.says, /2 proposals of the laws that govern this action, 1 of them machine work/);
  /* an action with no list: the answer says it is undetermined */
  w.action(B);
  assert.match(P({ target: B }).says, /that list is UNDETERMINED/);
});

test("R1 lawProposalsFor: at most 12 proposers, newest first, truncated; an empty read answers a sentence", () => {
  const w = world();
  w.action(A);
  assert.equal(records.LAW_PROPOSALS_READ_MAX, 12);
  const none = w.r.lawProposalsFor(A);
  assert.deepEqual([none.proposals, none.truncated, none.limit], [[], false, 12]);
  assert.match(none.says, /no proposal of the laws governing this action stands in the record/);
  for (let i = 0; i < 13; i++) {
    w.clock.ms += 1000;
    assert.equal(w.r.actionLawsPropose({ target: A, laws: [{ level: "state", citation: `C${i}` }, { level: "city", citation: `D${i}` }],
      proposer: V(`m${i}`), viewer: V(`m${i}`) }).ok, true);
  }
  const block = w.r.lawProposalsFor(A);
  assert.equal(block.proposals.length, 12); assert.equal(block.truncated, true);
  assert.equal(block.proposals[0].by, V("m12"), "newest first");
  assert.deepEqual(block.proposals[0].laws.map((l) => l.citation), ["C12", "D12"], "a proposal's laws in order");
  /* control: twelve proposers are not truncated */
  const w2 = world(); w2.action(A);
  for (let i = 0; i < 12; i++) { w2.clock.ms += 1000; w2.r.actionLawsPropose({ target: A, laws: [{ level: "state", citation: `C${i}` }], proposer: V(`m${i}`), viewer: V(`m${i}`) }); }
  assert.deepEqual([w2.r.lawProposalsFor(A).proposals.length, w2.r.lawProposalsFor(A).truncated], [12, false]);
});

test("R2 actionRiskPropose: refusals in order; stored apart and labelled; never the tier; riskProposalsFor at most 12, newest first", () => {
  const w = world();
  w.action(A, ["risk_tier: 1"]);
  w.doc(INFO);
  w.hidden();
  const P = (x) => w.r.actionRiskPropose({ target: A, tier: 3, basis: "the office is a court", proposer: MACHINE, viewer: MACHINE, ...x });
  assert.deepEqual(reasons([P({ proposer: "" }), P({ target: "" }), P({ tier: 0 }), P({ tier: "4" }), P({ basis: "" }),
    P({ basis: 'a"b' }), P({ basis: "a\\b" }), P({ basis: "a\nb" }), P({ basis: "x".repeat(501) }),
    P({ target: "ACTN-2026-0404-x" }), P({ target: HIDDEN, viewer: M, proposer: M }), P({ target: INFO })]),
    ["NO_AUTHOR", "NO_TARGET", "BAD_RISK_TIER", "BAD_RISK_TIER", "RISK_PROPOSAL_BASIS_REFUSED", "RISK_PROPOSAL_BASIS_REFUSED",
     "RISK_PROPOSAL_BASIS_REFUSED", "RISK_PROPOSAL_BASIS_REFUSED", "RISK_PROPOSAL_BASIS_REFUSED", "NO_SUCH_BUNDLE",
     "NO_SUCH_BUNDLE", "NOT_AN_ACTION"]);
  const basis = P({ basis: "" });
  assert.deepEqual([basis.check, basis.max], ["C-90.6", records.RISK_PROPOSAL_BASIS_MAX]);
  assert.equal(records.RISK_PROPOSAL_BASIS_MAX, 500);
  /* C-90.2 through R8's one site */
  const bt = P({ tier: 7 });
  assert.deepEqual([bt.reason, bt.check, bt.legal, bt.tier], ["BAD_RISK_TIER", "C-90.2", [1, 2, 3], 7]);
  assert.match(bt.detail, /^a proposal states a tier of 1/);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM action_risk_proposals`).n, 0, "no refusal writes");
  assert.equal(P({ basis: "x".repeat(500), tier: "2" }).ok, true, "control: 500 characters and a tier given as text");
  const before = w.text(A);
  const p = P({});
  assert.deepEqual([p.ok, p.evidence, p.proposal.machine_work, p.proposal.state, p.proposal.tier, p.proposal.tier_words, p.risk_tier,
    p.risk_tier_words], [true, false, true, "machine_proposed", 3, grammar.RISK_TIERS[3], 1, grammar.RISK_TIERS[1]]);
  assert.match(p.proposal.says, /machine work/);
  assert.match(p.says, /This is not the action's risk tier and did not change it: the tier is 1/);
  assert.equal(w.text(A), before, "writes no file and never touches the tier");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM action_risk_proposals WHERE bundle_id=?`, A).n, 1, "the machine's restatement replaced its own");
  const mem = P({ proposer: M, viewer: M, tier: 2 });
  assert.deepEqual([mem.proposal.state, mem.proposal.machine_work], ["member_proposed", false]);
  /* an unassessed action reads undetermined in the answer */
  w.action(B);
  assert.match(P({ target: B }).says, /the tier is undetermined/);
  for (let i = 0; i < 13; i++) { w.clock.ms += 1000; P({ proposer: V(`m${i}`), viewer: V(`m${i}`) }); }
  const block = w.r.riskProposalsFor(A);
  assert.deepEqual([block.proposals.length, block.truncated, block.limit], [12, true, records.RISK_PROPOSALS_READ_MAX]);
  assert.equal(block.proposals[0].by, V("m12"), "newest first");
  assert.equal(new Set(block.proposals.map((x) => x.by)).size, 12, "one standing proposal per proposer");
  const empty = world(); empty.action(A);
  const none = empty.r.riskProposalsFor(A);
  assert.deepEqual([none.proposals, none.truncated], [[], false]);
  assert.match(none.says, /no proposal of this action's risk tier stands in the record/);
});

const E1 = "ENT-2026-0001-council", E2 = "ENT-2026-0002-board";
const seeksLines = (items) => ["seeks:", ...items.flatMap((x) =>
  [`  - progression: ${x.progression}`, `    entity: ${x.entity}`, `    stage: ${x.stage}`])];

test("R3 actionSeeksPropose: refusals in order; a target not a records_request, or seeks the grammar refuses, SEEKS_REFUSED (C-117.29) with every finding; nothing written", () => {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  const ok = [{ progression: "meeting", entity: E1, stage: "minutes" }];
  w.action(A);
  w.commit(B, ["---", `id: ${B}`, "object_type: action", `title: ${B}`, "current_state: planned", "action_kind: other", "---", "", "a", ""].join("\n"));
  w.doc(INFO);
  const S = (x) => w.r.actionSeeksPropose({ target: A, seeks: ok, proposer: MACHINE, viewer: MACHINE, ...x });
  assert.deepEqual(reasons([S({ proposer: "", target: "", seeks: "nonsense" }), S({ target: "", seeks: "nonsense" }),
    S({ target: "ACTN-2026-0404-x", seeks: "nonsense" }), S({ viewer: "nobody", seeks: "nonsense" }),
    S({ target: INFO, seeks: "nonsense" }), S({ target: B }), S({ seeks: "nonsense" })]),
    ["NO_AUTHOR", "NO_TARGET", "NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "SEEKS_REFUSED", "SEEKS_REFUSED"]);
  const kind = S({ target: B });
  assert.deepEqual([kind.code, kind.check, kind.target], ["SEEKS_REFUSED", "C-117.29", B]);
  assert.match(kind.findings[0].detail, /only a records_request names the stages/);
  const notHeld = S({ seeks: [{ progression: "zoning", entity: E1, stage: "x" }, { progression: "meeting", entity: E1, stage: "vote" }] });
  assert.deepEqual([notHeld.reason, notHeld.findings.length], ["SEEKS_REFUSED", 2], "every finding carried");
  for (const seeks of [null, [], "[]", Array.from({ length: 13 }, (_, i) => ({ ...ok[0], entity: `ENT-2026-${1000 + i}-x` })), [ok[0], ok[0]]])
    assert.equal(S({ seeks }).reason, "SEEKS_REFUSED", JSON.stringify(seeks)?.slice(0, 60));
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM action_seeks_proposals`).n, 0, "no refusal writes");
  assert.equal(S({}).ok, true, "control: a held stage lands");
});

test("R3 any credential may propose; stored apart and labelled, replaces only its proposer's own, never changes seeks or writes a file; seeksProposalsFor lists at most 12, newest first", () => {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  const stated = [{ progression: "budget", entity: E2, stage: "adopted" }];
  w.action(A, seeksLines(stated));
  const text = w.text(A), manifest = JSON.stringify(w.rows(`SELECT * FROM manifest ORDER BY rowid`));
  const one = [{ progression: "meeting", entity: E1, stage: "minutes" }];
  const m = w.r.actionSeeksPropose({ target: A, seeks: one, proposer: MACHINE, viewer: MACHINE });
  assert.deepEqual([m.ok, m.evidence, m.proposal.state, m.proposal.machine_work, m.proposal.seeks, m.seeks],
    [true, false, "machine_proposed", true, one, stated]);
  assert.match(m.proposal.says, /machine work/);
  assert.match(m.says, /not the action's seeks and did not change it: it names 1 stage\(s\) a member stated/);
  /* a member's proposal, given as JSON (the op's body or query), stands beside the machine's */
  const two = [{ progression: "meeting", entity: E1, stage: "notice" }, { progression: "budget", entity: E1, stage: "adopted" }];
  w.clock.ms += 60000;
  const b = records.actionRecordsOps(w.r, new URL(`https://x/?target=${A}&viewer=${V("bob")}&proposer=${V("bob")}`), { seeks: JSON.stringify(two) })
    .actionseekspropose();
  assert.deepEqual([b.ok, b.proposal.state, b.proposal.seeks], [true, "member_proposed", two]);
  w.clock.ms += 60000;
  const again = [{ progression: "meeting", entity: E2, stage: "notice" }];
  assert.equal(w.r.actionSeeksPropose({ target: A, seeks: again, proposer: MACHINE, viewer: MACHINE }).ok, true);
  const read = w.r.seeksProposalsFor(A);
  assert.deepEqual(read.proposals.map((p) => [p.by, p.state, p.seeks]),
    [[MACHINE, "machine_proposed", again], [V("bob"), "member_proposed", two]], "newest first, each proposer once");
  assert.deepEqual([read.limit, read.truncated], [records.SEEKS_PROPOSALS_READ_MAX, false]);
  /* negative control: nothing in the record moved */
  assert.equal(w.text(A), text, "no file written");
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM manifest ORDER BY rowid`)), manifest);
  assert.deepEqual(grammar.seeksOf(w.fm(A)), stated);
  /* at most 12 proposers */
  for (let i = 0; i < 12; i++) { w.clock.ms += 1000; w.r.actionSeeksPropose({ target: A, seeks: one, proposer: V(`m${i}`), viewer: V(`m${i}`) }); }
  const many = w.r.seeksProposalsFor(A);
  assert.deepEqual([many.proposals.length, many.truncated, many.proposals[0].by], [12, true, V("m11")]);
  /* an action with none answers an empty list and a sentence */
  w.action(B);
  const none = w.r.seeksProposalsFor(B);
  assert.deepEqual([none.proposals, none.truncated], [[], false]);
  assert.match(none.says, /no proposal of what this request seeks/);
  assert.match(w.r.actionSeeksPropose({ target: B, seeks: one, proposer: MACHINE, viewer: MACHINE }).says, /no member has stated what it seeks/);
});

test("R12 a machine credential may propose laws, a tier and what a request seeks, each stored apart and labelled machine work; it never records a receipt, sets a scope or records a promise", () => {
  const w = world({ deps: { progressions: progressionsStandIn() } });
  w.action(A, ["correspondence:", "  - direction: sent", '    at: "2026-09-02"', '    account: "asked"', "    author: alice"]);
  const props = [
    w.r.actionLawsPropose({ target: A, laws: [{ level: "state", citation: "X" }], proposer: MACHINE, viewer: MACHINE }),
    w.r.actionRiskPropose({ target: A, tier: 2, basis: "b", proposer: MACHINE, viewer: MACHINE }),
    w.r.actionSeeksPropose({ target: A, seeks: [{ progression: "meeting", entity: E1, stage: "notice" }], proposer: MACHINE, viewer: MACHINE })];
  for (const p of props) assert.deepEqual([p.ok, p.evidence, p.proposal.state, p.proposal.machine_work], [true, false, "machine_proposed", true]);
  const acts = [
    w.r.actionReceipt({ target: A, ord: 0, at: "2026-09-03", how: "h", account: "a", viewer: MACHINE, author: MACHINE }),
    w.r.actionScope({ target: A, confidential: true, reason: "r", viewer: MACHINE, author: MACHINE }),
    w.r.actionPromise({ target: A, kind: "other", text: "t", viewer: MACHINE, author: MACHINE })];
  assert.deepEqual(reasons(acts), ["MACHINE_CANNOT_CORRESPOND", "MACHINE_CANNOT_SET_SCOPE", "MACHINE_CANNOT_RECORD_PROMISE"]);
  for (const a of acts) assert.ok(a.check && a.translation, `${a.reason} carries its row`);
  /* every machine identity record-grammar names (its R15) is refused alike; an unstamped author too */
  for (const who of ["token:abc", "class:ai/x", "", null])
    assert.equal(w.r.actionScope({ target: A, confidential: true, reason: "r", viewer: M, author: who }).reason, "MACHINE_CANNOT_SET_SCOPE", String(who));
  for (const t of ["action_receipts", "action_scopes", "action_promises"]) assert.equal(w.row(`SELECT COUNT(*) AS n FROM ${t}`).n, 0, t);
  /* control: a member records each */
  assert.equal(w.r.actionScope({ target: A, confidential: true, reason: "r", viewer: M, author: M }).ok, true);
});
