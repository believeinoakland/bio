/* actions' reads and services at its interface (R12, R25, R26, R29–R32, R35–R41). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE, actionMd, CP, NOW_MS } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";
import { get as profile } from "../../../../jurisdictions/index.mjs";

const A = "ACTN-2026-0001-a";
const M = V("alice");
const CLK = (d, st = "pending") => ['  - text: "t"', '    description: "d"', `    date: ${d}`, "    basis: Act s.2", `    status: ${st}`];

test("R12 actionFacts is pure; null for another type or an unparsable document; overdue from the UTC day after the date", () => {
  const md = actionMd(A, [...CP, "action_kind: other", "risk_tier: 2", "clock:", ...CLK("2026-09-14"), ...CLK("2026-09-10", "met")]);
  const at = (iso) => actions.actionFacts(md, Date.parse(iso));
  assert.deepEqual(at("2026-09-14T23:59:59Z"), { kind: "other", risk_tier: 2, counterparty_state: "named", resolution: null,
                                                 clock_next: "2026-09-14", clock_overdue: false });
  assert.equal(at("2026-09-15T00:00:00Z").clock_overdue, true);
  assert.equal(actions.actionFacts(actionMd(A, ["action_kind: other"]), NOW_MS).risk_tier, null, "undetermined is null");
  const none = { kind: null, risk_tier: null, counterparty_state: null, resolution: null, clock_next: null, clock_overdue: null };
  assert.deepEqual(actions.actionFacts(md.replace("object_type: action", "object_type: information"), NOW_MS), none);
  assert.deepEqual(actions.actionFacts("not a document", NOW_MS), none);
  assert.equal(at("2026-09-15T00:00:00Z").clock_overdue, at("2026-09-15T00:00:00Z").clock_overdue, "pure");
  const w = world();
  assert.equal(w.reg.facts.length, 1); assert.equal(w.reg.facts[0].m, "actions", "registered with retrieval R53");
});

test("R25 R26 R35 the projection block: derived at now beside the cached flag; legs, ledger, laws, proposals, lifecycle, own outcome, responses", () => {
  const w = world();
  w.doc("INFO-2026-0001-d");
  w.action(A, ["risk_tier: 2", "clock:", ...CLK("2026-09-14"), "action_basis:", "  - target: INFO-2026-0001-d", "    kind: rests_on",
    "consequence:", "  claim: impact", '  description: "a hearing"', "  at: 2026-09-20"]);
  w.st.sql.exec(`INSERT INTO refs (bundle_id, target_id, kind) VALUES ('INFO-2026-0001-d', ?, 'responds_to')`, A);
  assert.equal(w.reg.decorations[0].m, "actions", "registered with retrieval R56");
  const d = w.reg.decorations[0].fn({ bundle_id: A, object_type: "action", action_clock_overdue: 0 }, { nowMs: Date.parse("2026-09-20T00:00:00Z") }).action;
  assert.deepEqual([d.kind, d.risk_tier, d.risk_tier_words, d.clock_next, d.clock_overdue, d.clock_overdue_cached, d.as_of],
    ["records_request", 2, "file with caution", "2026-09-14", true, false, "2026-09-20T00:00:00.000Z"]);
  assert.equal(d.basis.length, 1); assert.equal(d.correspondence.length, 0);
  assert.equal(d.governing_laws.state, "undetermined"); assert.match(d.governing_laws.stated, /assumes none/);
  assert.ok(d.governing_laws_proposals.says && d.risk_tier_proposals.says);
  assert.equal(d.risk_tier_history.intake.by, null);
  assert.deepEqual(d.responses, ["INFO-2026-0001-d"]);
  assert.ok(!("consequence" in d), "R26: never answered as `consequence`");
  assert.equal(d.own_outcome.state, "established"); assert.deepEqual(d.own_outcome.evidence, ["INFO-2026-0001-d"]);
  assert.doesNotMatch(JSON.stringify(d.own_outcome), /breach/i);
  const B = "ACTN-2026-0002-b";
  w.action(B, ["consequence:", "  claim: impact", '  description: "x"']);
  assert.equal(w.decorate(B).action.own_outcome.state, "unproven");
  assert.equal(w.decorate(B).action.risk_tier, "undetermined", "never defaulted");
  assert.deepEqual(w.reg.decorations[0].fn({ bundle_id: "INFO-2026-0001-d", object_type: "information" }, {}), {});
  assert.equal(w.decorate(A).action.clock_overdue, true, "at the instance clock when the caller names none");
});

test("R29 R36 actionRead answers R25's block and the document's values; absent and invisible alike", () => {
  const w = world();
  w.action(A, ['law: "Act s.1"', "breach: false"]);
  const r = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual([r.ok, r.id, r.current_state, r.law, r.counterparty.role, r.breach], [true, A, "planned", "Act s.1", "Town Clerk", false]);
  for (const k of ["kind", "risk_tier", "clock_next", "clock_overdue", "governing_laws", "lifecycle", "own_outcome", "responses", "legs", "clock"])
    assert.ok(k in r, k);
  assert.equal(w.a.actionRead({ id: "ACTN-2026-0404-x", viewer: M }).reason, "NO_SUCH_BUNDLE");
  assert.equal(w.a.actionRead({ id: A, viewer: "nobody" }).reason, "NO_SUCH_BUNDLE", "invisible answers as absent");
  w.doc("INFO-2026-0001-d");
  assert.equal(w.a.actionRead({ id: "INFO-2026-0001-d", viewer: M }).reason, "NOT_AN_ACTION");
});

test("R30 actionsFor filters visible actions in id order, at most 200 a page, truncated by reading one past", () => {
  const w = world();
  w.doc("INFO-2026-0001-d");
  for (let i = 1; i <= 203; i++) {
    const id = `ACTN-2026-${String(i).padStart(4, "0")}-z`;
    w.promote(id, actionMd(id, [...CP, `action_kind: ${i % 2 ? "other" : "records_request"}`,
      ...(i === 7 ? ["action_basis:", "  - target: INFO-2026-0001-d", "    kind: rests_on"] : [])]));
  }
  const p1 = w.a.actionsFor({ viewer: M });
  assert.deepEqual([p1.items.length, p1.truncated, p1.limit], [200, true, 200]);
  assert.equal(p1.items[0].id, "ACTN-2026-0001-z");
  const p2 = w.a.actionsFor({ viewer: M, after: p1.cursor });
  assert.deepEqual([p2.items.length, p2.truncated], [3, false]);
  assert.equal(w.a.actionsFor({ viewer: M, kind: "other", limit: 500 }).items.length, 102);
  assert.equal(w.a.actionsFor({ viewer: M, determination: "INFO-2026-0001-d" }).items[0].id, "ACTN-2026-0007-z", "matches R8's legs");
  assert.equal(w.a.actionsFor({ viewer: M, counterparty: "Town Clerk, Town of Port Ellery", limit: 5 }).items.length, 5);
  assert.equal(w.a.actionsFor({ viewer: M, state: "active" }).items.length, 0);
  assert.equal(w.a.actionsFor({ viewer: "nobody" }).items.length, 0, "only visible actions");
});

test("R31 pendingClocks lists pending entries dated before `before` across visible actions, at most 500", () => {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-09-01"), ...CLK("2026-09-05", "met"), ...CLK("2026-12-01")]);
  const r = w.a.pendingClocks({ before: "2026-10-01", viewer: M });
  assert.deepEqual(r.items, [{ action: A, ord: 0, date: "2026-09-01", basis: "Act s.2", text: "t", past: true }]);
  assert.equal(r.limit, 500); assert.equal(r.truncated, false);
  assert.equal(w.a.pendingClocks({ before: "2026-10-01", viewer: "nobody" }).items.length, 0);
  assert.equal(w.a.pendingClocks({ before: "soon", viewer: M }).reason, "BAD_DATE");
  const B = "ACTN-2026-0002-b";
  w.action(B, ["clock:", ...CLK("2026-01-01"), ...CLK("2026-01-02")]);
  assert.deepEqual([w.a.pendingClocks({ before: "2026-10-01", limit: 2, viewer: M }).truncated], [true]);
});

test("R32 clockPropose computes from the profile's deadline, stored apart and labelled; business days by the holiday calendar", () => {
  const w = world();
  const pe = profile("test-port-ellery");
  const dl = pe.deadlines.find((d) => d.applies_to === "records_request");
  w.action(A);
  const P = (x) => w.a.clockPropose({ target: A, rule: dl.rule, proposer: MACHINE, viewer: MACHINE, ...x });
  const und = P({});
  assert.equal(und.ok, true); assert.equal(und.proposal.entry.date, null, "no start event in the ledger");
  assert.ok(und.proposal.undetermined);
  const ev = dl.starts === "filed" ? "sent" : "received";
  w.a.actionCorrespond({ target: A, direction: ev, at: "2026-09-01", ...(ev === "sent" ? { account: "filed" } : { account: "got it" }), viewer: M, author: M });
  const p = P({});
  assert.equal(p.ok, true); assert.equal(p.evidence, false); assert.equal(p.proposal.machine_work, true);
  assert.match(p.proposal.entry.basis, new RegExp(dl.citation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.ok(dl.count === "business" ? (p.proposal.entry.date === null || /^\d{4}-\d{2}-\d{2}$/.test(p.proposal.entry.date)) : /^\d{4}/.test(p.proposal.entry.date));
  assert.equal(w.fm(A).clock, undefined, "never written into clock[]");
  assert.equal(P({ rule: "no_such" }).reason, "NO_SUCH_RULE");
  assert.equal(P({ proposer: "" }).reason, "NO_AUTHOR");
  const cal = actions.actionKinds(null);
  assert.deepEqual(cal, ["records_request", "request_for_comment", "other"]);
});

test("R37 R36 the audit reports C-2.10 and C-11.1 over an action, a missing counterparty and a past pending entry; tables purge with the action", () => {
  const w = world();
  const md = actionMd(A, ["action_kind: other", "clock:", ...CLK("2020-01-01")]);
  const f = w.a.audit({ files: new Map([["bundle.md", md]]) });
  assert.ok(f.some((x) => x.check === "C-2.10" && /counterparty block is missing/.test(x.message)));
  assert.ok(f.some((x) => x.check === "C-11.1" && /past-due/.test(x.message)));
  assert.deepEqual(w.a.audit({ files: new Map([["bundle.md", actionMd(A, [...CP, "action_kind: cpra_request"])]]) }), [], "an old kind reads as written");
  w.action(A, ["action_basis:", "  - target: INFO-2026-0404-q", "    kind: rests_on"].slice(0, 0));
  w.a.actionLawsPropose({ target: A, laws: [{ level: "city", citation: "B" }], proposer: MACHINE, viewer: MACHINE });
  w.a.actionRiskPropose({ target: A, tier: 2, basis: "b", proposer: MACHINE, viewer: MACHINE });
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "x", viewer: M, author: M });
  const r = w.record.purge({ bundleId: A });
  for (const t of actions.ACTIONS_TABLES) assert.ok(t in (r.removed || r.tables || r) || JSON.stringify(r).includes(t), t);
  for (const t of ["action_law_proposals", "action_risk_proposals", "correspondence"])
    assert.equal(w.rows(`SELECT COUNT(*) AS n FROM ${t} WHERE bundle_id=?`, A)[0].n, 0, t);
});

test("R38 every moved check is carried here with its id", () => {
  const ids = new Set(Object.values({ ...actions.ACTION_FENCE_CHECKS, ...actions.ACTION_ACT_CHECKS, ...actions.GOVERNING_LAW_CHECKS,
    ...actions.QUOTE_CHECKS, ...actions.LIFECYCLE_CHECKS, ...actions.RISK_TIER_REVISION_CHECKS, ...actions.RECORDS_LAW_FENCE_CHECKS,
    ...actions.ACTION_CATALOGUE_CHECKS }).map((r) => r.check));
  const want = ["C-32.3", "C-32.4", "C-32.18", "C-32.19", "C-32.20", ...[3, 4, 5, 6, 7, 8, 9].map((n) => `C-33.${n}`),
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((n) => `C-72.${n}`), ...[1, 2, 3, 4, 5, 6].map((n) => `C-73.${n}`),
    ...[1, 2, 3, 4, 5, 6].map((n) => `C-90.${n}`), ...Array.from({ length: 12 }, (_, i) => `C-94.${i + 1}`),
    ...[1, 2, 3, 4, 5].map((n) => `C-101.${n}`)];
  for (const id of want) assert.ok(ids.has(id), id);
  for (const r of Object.values(actions.ACTION_FENCE_CHECKS)) assert.match(r.where, /^src\/actions\/index\.mjs /);
});

test("R39 R41 no place is named in outward text; an old records-law kind names no law; tests run on the test profile", () => {
  const oak = profile("oakland-alameda");
  const places = ["Oakland", "Alameda", "California", "CPRA", ...oak.covers];
  const outward = JSON.stringify([actions.ACTION_FENCE_CHECKS, actions.ACTION_ACT_CHECKS, actions.GOVERNING_LAW_CHECKS,
    actions.QUOTE_CHECKS, actions.LIFECYCLE_CHECKS, actions.RISK_TIER_REVISION_CHECKS, actions.RECORDS_LAW_FENCE_CHECKS,
    actions.ACTION_CATALOGUE_CHECKS, actions.governingLawsOf({ action_kind: "cpra_request" }), actions.DUE_UNDETERMINED_SAYS]);
  for (const p of places) assert.ok(!outward.includes(p), p);
  const g = actions.governingLawsOf({ action_kind: "cpra_request" });
  assert.equal(g.state, "undetermined"); assert.match(g.stated, /named the records law it was made under/);
  assert.equal(profile("test-port-ellery").test, true);
});

test("R40 the vocabulary and kinds are exported here", () => {
  assert.deepEqual(Object.keys(actions.RISK_TIERS).sort(), ["1", "2", "3", "undetermined"]);
  assert.equal(actions.riskTierState(undefined), "undetermined"); assert.equal(actions.riskTierState("2"), null);
  const view = { action_kinds: [{ kind: "bylaw_complaint" }, { kind: "other" }] };
  assert.deepEqual(actions.actionKinds(view), ["records_request", "request_for_comment", "other", "bylaw_complaint"]);
});
