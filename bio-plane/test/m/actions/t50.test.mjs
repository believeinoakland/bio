/* actions' T50 entry at its interface (T50-74; N933, N1178; K3230, K3547, K3635): R105 `own_stake` and an accepted
   disclosure's `matter_stake`, R106 `actionRead` answering an id no action answers to through R43, R107 `noSuchAction`
   re-exported from `action-records`. The determinations are stand-ins in conformance R9's shape; the action's own stake is
   `action-records` R17's act, read back through the real module. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP, NONCOMPLIANT } from "./fixture.mjs";
import * as actions from "../../../src/actions/index.mjs";
import * as records from "../../../src/action-records/index.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b", INFO = "INFO-2026-0001-d";
const M = V("alice");
const WITH = "CONF-2026-0001-with-matter-stake", WITHOUT = "CONF-2026-0002-without", UNDETERMINED = "CONF-2026-0003-undetermined";
const MATTER = { stake: "the group is a tenant of the building", set_by: "carol", set_at: "2026-09-10T00:00:00Z", source: "declared" };
const accepted = (matter, extra = {}) => ({ kind: "accepted", group: "Hayward Parents", case: "CASE-2026-0009", edition: 2,
  edition_date: "2026-09-03", accepted_at: "2026-09-20", accepted_by: M, identity: "Hayward Parents for Accountability",
  stake: "none declared", ...(matter === undefined ? {} : { matter_stake: matter }), ...extra });
const det = (id, basis) => ({ ok: true, id, live: true, superseded_by: null, outcomes: NONCOMPLIANT,
  findings: [{ finding: "INQ-2026-0001-q", basis }] });
const DETS = {
  [WITH]: det(WITH, accepted(MATTER)),
  [WITHOUT]: det(WITHOUT, accepted(undefined)),
  [UNDETERMINED]: det(UNDETERMINED, accepted("undetermined", { identity: null, stake: "undetermined" })),
};
const conf = { determinationRead: ({ id }) => DETS[id] || { ok: false, reason: "NO_SUCH_DETERMINATION" } };
function grounded() {
  const w = world({ conformance: conf });
  for (const id of Object.keys(DETS))
    assert.equal(w.promote(id, ["---", `id: ${id}`, "object_type: determination", `title: ${id}`, "current_state: recorded",
      'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"),
      { extra: { replay: true } }).ok, true);
  return w;
}
const resting = (id, d) => actionMd(id, [...CP, "action_kind: other", "breach: true", "action_basis:", `  - target: ${d}`, "    kind: rests_on"]);

test("R105 actionRead answers own_stake as action-records.stakeOf answers it: the stated stake with who and when; none is null", () => {
  const w = world();
  w.action(A);
  w.action(B);
  const none = w.a.actionRead({ id: A, viewer: M }).own_stake;
  assert.equal(none.stake, null, "control: an action stating none answers null (it goes under its project's stake)");
  const set = w.a.records.actionStake({ target: A, stake: "the group rents from this landlord", author: M, viewer: M });
  assert.equal(set.ok, true, JSON.stringify(set));
  const r = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual(r.own_stake, w.a.records.stakeOf(A), "the very answer action-records gives");
  assert.equal(r.own_stake.stake, "the group rents from this landlord");
  assert.equal(r.own_stake.set_by, "alice");
  assert.equal(typeof r.own_stake.set_at, "string");
  assert.equal(r.own_stake.history.length, 1);
  assert.equal(w.a.actionRead({ id: B, viewer: M }).own_stake.stake, null, "another action is unmoved");
  assert.deepEqual(w.decorate(A).action.own_stake, r.own_stake, "R25's projection decoration answers it too");
  w.a.records.actionStake({ target: A, stake: null, author: M, viewer: M });
  const cleared = w.a.actionRead({ id: A, viewer: M }).own_stake;
  assert.equal(cleared.stake, null, "clearing answers null");
  assert.equal(cleared.history.length, 2, "and keeps the history");
});

test("R105 an accepted disclosure carries matter_stake as the finding's basis answers it; a basis with none answers null", () => {
  const w = grounded();
  assert.equal(w.promote(A, resting(A, WITH)).ok, true);
  assert.equal(w.promote(B, resting(B, WITHOUT)).ok, true);
  const acc = (id) => w.a.actionRead({ id, viewer: M }).disclosures.find((x) => x.kind === "accepted");
  assert.deepEqual(acc(A).matter_stake, MATTER, "an edition imported with a matter stake carries it");
  assert.equal(acc(B).matter_stake, null, "control: a basis with none answers null");
  assert.ok("matter_stake" in acc(B), "the key is always answered");
  assert.deepEqual(Object.keys(acc(B)), ["kind", "group", "edition_date", "accepted_at", "identity", "stake", "matter_stake"]);
  const C = "ACTN-2026-0003-c";
  assert.equal(w.promote(C, resting(C, UNDETERMINED)).ok, true);
  assert.equal(acc(C).matter_stake, "undetermined", "as answered, never raised or re-read");
});

test("R106 actionRead answers an unknown id, a hidden action and a bundle that is no action through R43 as NO_SUCH_ACTION, alike", () => {
  const w = world();
  w.action(A);
  w.doc(INFO);
  const unknown = w.a.actionRead({ id: "ACTN-2026-0404-x", viewer: M });
  const hidden = w.a.actionRead({ id: A, viewer: "nobody" });
  const notAction = w.a.actionRead({ id: INFO, viewer: M });
  for (const [r, id] of [[unknown, "ACTN-2026-0404-x"], [hidden, A], [notAction, INFO]]) {
    assert.deepEqual([r.ok, r.reason, r.code, r.action], [false, "NO_SUCH_ACTION", "NO_SUCH_ACTION", id]);
    assert.notEqual(r.reason, "NO_SUCH_BUNDLE");
    assert.notEqual(r.reason, "NOT_AN_ACTION");
    assert.deepEqual(r, actions.noSuchAction(id), "through R43's one site, byte for byte");
  }
  const bare = ({ action, ...rest }) => rest;
  assert.deepEqual(bare(unknown), bare(hidden));
  assert.deepEqual(bare(unknown), bare(notAction));
  assert.deepEqual(w.a.actionRead({ id: null, viewer: M }), actions.noSuchAction(null), "no id is the same condition");
  assert.deepEqual(actions.actionsOps(w.a, new URL(`https://x/?viewer=${M}&id=ACTN-2026-0404-x`), null).action(), unknown, "op=action");
  /* control: a visible action answers its block as before */
  const ok = w.a.actionRead({ id: A, viewer: M });
  assert.deepEqual([ok.ok, ok.id, ok.current_state], [true, A, "planned"]);
});

test("R107 noSuchAction is action-records' function re-exported: one function, the same answer, the same row", () => {
  assert.equal(actions.noSuchAction, records.noSuchAction);
  const row = grammar.ACTION_CATALOGUE_CHECKS.NO_SUCH_ACTION;
  const r = actions.noSuchAction("ACTN-2026-0001-a");
  /* the bytes every caller (filings, escalation, action-records' seven sites) got before the move */
  assert.deepEqual(r, { ok: false, reason: "NO_SUCH_ACTION", code: "NO_SUCH_ACTION", check: row.check, translation: row.translation,
    action: "ACTN-2026-0001-a",
    detail: "no action answers to that id here. An action you may not see is answered exactly as one that does not exist, so "
      + "this is not a hint either way." });
  assert.equal(r.check, "C-117.2");
  assert.deepEqual(Object.keys(r), ["ok", "reason", "code", "check", "translation", "action", "detail"]);
  assert.deepEqual(actions.noSuchAction("A1", { note: "n", detail: "mine", action: "B" }),
    { ...records.noSuchAction("A1"), note: "n" }, "extra adds and never replaces");
});
