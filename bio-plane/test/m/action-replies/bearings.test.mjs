/* action-replies' claim-by-claim layout of a reply and its proposals at its interface (R1, R4). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, M, BOB, MACHINE, INQ, INQ2, INQ3, INFO, RFC, RFC2, REQ, leg } from "./fixture.mjs";
import { ACTION_REPLY_CHECKS, BEARINGS, BEARING_PROPOSALS_READ_MAX } from "../../../src/action-replies/index.mjs";

/* A request for comment putting two inquiries and resting on a document, sent, then answered. */
function answered() {
  const w = world();
  w.rfc(RFC, { legs: [leg(INQ, "advances"), leg(INQ2, "advances"), leg(INFO, "rests_on")] });
  const sent = w.say(RFC, "sent", "2026-09-10");
  const got = w.say(RFC, "received", "2026-09-20");
  return { w, sent, got };
}
const lay = (w, claims, extra = {}) => w.r.actionReplyBearing({ target: RFC, ord: 1, claims, author: M, viewer: M, ...extra });

test("R1 control: one claim per leg with a listed bearing lands, appended; a later layout appends and the read answers the latest with the earlier ones", () => {
  const { w, got } = answered();
  assert.deepEqual([...BEARINGS], ["new_evidence", "disputed_without_evidence", "not_addressed"]);
  const before = w.counts();
  const first = [{ claim: INQ, bearing: "new_evidence", note: "they sent the minutes" },
                 { claim: INQ2, bearing: "not_addressed" }, { claim: INFO, bearing: "disputed_without_evidence" }];
  const r = lay(w, first);
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.deepEqual([r.target, r.ord, r.by, r.at, r.layout, r.weight], [RFC, got, M, "2026-09-28T12:00:00Z", 1, "single"]);
  assert.deepEqual(r.claims, first);
  const after = w.counts();
  assert.deepEqual(after, [before[0] + 1, ...before.slice(1)], "one layout row; no proposal, link, or record write");
  w.clock.ms += 3600e3;
  const second = [{ claim: INQ, bearing: "disputed_without_evidence" }];
  assert.equal(lay(w, second).ok, true);
  const read = w.r.bearingsOf({ target: RFC, viewer: M });
  assert.equal(read.ok, true);
  assert.deepEqual(read.entries.map((e) => e.ord), [got], "only the received entries");
  const e = read.entries[0];
  assert.deepEqual([e.latest.claims, e.latest.layout, e.latest.at], [second, 2, "2026-09-28T13:00:00Z"]);
  assert.deepEqual(e.earlier.map((x) => [x.layout, x.claims]), [[1, first]], "the earlier one kept");
  assert.deepEqual(w.r.bearingsOf({ target: RFC, ord: got, viewer: M }).entries.length, 1);
  assert.deepEqual(w.r.bearingsOf({ target: RFC, ord: 0, viewer: M }).entries, [], "a sent entry has no layout");
});

test("R1 R4 refusals in order, each writing nothing: machine author, no target, no such bundle (absent and invisible alike), not an action, not a reply to a request for comment, the layout's shape", () => {
  const { w } = answered();
  w.action(REQ);
  w.say(REQ, "sent");
  w.say(REQ, "received");
  w.rfc(RFC2);
  w.say(RFC2, "sent");
  const bad = [{ claim: INQ3, bearing: "new_evidence" }];
  const good = [{ claim: INQ, bearing: "new_evidence" }];
  const before = w.counts();
  const code = (args) => w.r.actionReplyBearing({ target: RFC, ord: 1, claims: good, author: M, viewer: M, ...args }).reason;
  /* the machine arm first, whatever else is wrong. */
  for (const author of [null, "", "  ", MACHINE, "class:ai"]) {
    const r = w.r.actionReplyBearing({ target: null, ord: 0, claims: bad, author, viewer: M });
    assert.deepEqual([r.reason, r.code, r.check, r.translation], ["MACHINE_CANNOT_RECORD_BEARING", "MACHINE_CANNOT_RECORD_BEARING",
      "C-150.1", ACTION_REPLY_CHECKS.MACHINE_CANNOT_RECORD_BEARING.translation], String(author));
  }
  assert.equal(code({ target: null, claims: bad }), "NO_TARGET");
  assert.equal(code({ target: "ACTN-2026-0099-none", claims: bad }), "NO_SUCH_BUNDLE");
  const hidden = w.r.actionReplyBearing({ target: RFC, ord: 1, claims: bad, author: M, viewer: "nobody" });
  const absent = w.r.actionReplyBearing({ target: "ACTN-2026-0099-none", ord: 1, claims: bad, author: M, viewer: "nobody" });
  assert.deepEqual([hidden.reason, absent.reason], ["NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE"], "invisible answered as absent");
  assert.deepEqual(Object.keys(hidden).sort(), Object.keys(absent).sort());
  assert.equal(code({ target: INFO, claims: bad }), "NOT_AN_ACTION");
  /* another kind, an entry not received, an entry that does not exist, and no position */
  for (const [target, ord] of [[REQ, 1], [RFC, 0], [RFC, 7], [RFC, null], [RFC, "x"], [RFC2, 0]]) {
    const r = w.r.actionReplyBearing({ target, ord, claims: bad, author: M, viewer: M });
    assert.deepEqual([r.reason, r.check], ["BEARING_NOT_RFC", "C-150.2"], `${target} ${ord}`);
  }
  assert.deepEqual(w.counts(), before, "nothing written by any refusal");
});

test("R1 BEARING_REFUSED: a claim not among the legs (the control's opposite), a repeated claim, a bearing outside the three, an overlong note, an empty or absent layout; it names the item", () => {
  const { w } = answered();
  const before = w.counts();
  const cases = [
    [[{ claim: INQ, bearing: "new_evidence" }, { claim: INQ3, bearing: "new_evidence" }], 1],
    [[{ claim: INQ, bearing: "new_evidence" }, { claim: INQ, bearing: "not_addressed" }], 1],
    [[{ claim: INQ, bearing: "agreed" }], 0],
    [[{ claim: INQ, bearing: "new_evidence", note: "x".repeat(501) }], 0],
    [[], null], [null, null], ["new_evidence", null],
  ];
  for (const [claims, item] of cases) {
    const r = lay(w, claims);
    assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "BEARING_REFUSED", "BEARING_REFUSED", "C-150.3"], JSON.stringify(claims));
    /* R9 (T47) amends this: the row's sentence with its `{item}` filled (t47.test.mjs) */
    assert.equal(r.translation, ACTION_REPLY_CHECKS.BEARING_REFUSED.translation.replace("{item}",
      item === null ? "The list of claims" : `Claim ${item + 1}${claims[item] && claims[item].claim ? ` (${claims[item].claim})` : ""}`));
    assert.ok(r.findings.length >= 1 && r.findings.every((f) => f.check === "C-2.10"), JSON.stringify(r.findings));
    if (item !== null) assert.equal(r.item, item, "the item is named");
  }
  assert.deepEqual(w.counts(), before);
  /* a note at the bound, and a claim on a rests_on leg, land */
  assert.equal(lay(w, [{ claim: INFO, bearing: "not_addressed", note: "x".repeat(500) }]).ok, true);
});

test("R1 R4 actionBearingPropose: any credential proposes, stored apart and labelled; a proposer's restatement replaces its own only; it never changes a layout", () => {
  const { w, got } = answered();
  assert.equal(lay(w, [{ claim: INQ, bearing: "not_addressed" }]).ok, true);
  const layout = w.r.bearingsOf({ target: RFC, viewer: M }).entries[0].latest;
  const p = w.r.actionBearingPropose({ target: RFC, ord: got, claims: [{ claim: INQ, bearing: "new_evidence" }], proposer: MACHINE, viewer: MACHINE });
  assert.equal(p.ok, true, JSON.stringify(p));
  assert.deepEqual([p.proposal.state, p.proposal.machine_work, p.proposal.by, p.evidence], ["machine_proposed", true, MACHINE, false]);
  assert.match(p.proposal.says, /machine work/);
  assert.match(p.says, /not the reply's layout/);
  assert.deepEqual(p.layout, layout, "the layout as it stands, beside the proposal");
  w.clock.ms += 1000;
  assert.equal(w.r.actionBearingPropose({ target: RFC, ord: got, claims: [{ claim: INQ2, bearing: "not_addressed" }], proposer: BOB, viewer: BOB }).ok, true);
  w.clock.ms += 1000;
  /* the machine restates: its own replaced, the member's kept */
  assert.equal(w.r.actionBearingPropose({ target: RFC, ord: got, claims: [{ claim: INFO, bearing: "disputed_without_evidence" }], proposer: MACHINE, viewer: MACHINE }).ok, true);
  const e = w.r.bearingsOf({ target: RFC, viewer: M }).entries[0];
  assert.deepEqual(e.proposals.items.map((x) => [x.by, x.state, x.claims[0].claim]),
    [[MACHINE, "machine_proposed", INFO], [BOB, "member_proposed", INQ2]]);
  assert.deepEqual([e.proposals.limit, e.proposals.truncated, BEARING_PROPOSALS_READ_MAX], [12, false, 12]);
  assert.deepEqual(e.latest, layout, "the layout is unchanged");
  assert.deepEqual(e.earlier, []);
  /* its refusals: no proposer, no target, not a reply, the shape check; each writes nothing */
  const before = w.counts();
  const pr = (args) => w.r.actionBearingPropose({ target: RFC, ord: got, claims: [{ claim: INQ, bearing: "new_evidence" }],
                                                 proposer: MACHINE, viewer: MACHINE, ...args });
  assert.equal(pr({ proposer: "" }).reason, "NO_AUTHOR");
  assert.equal(pr({ target: null }).reason, "NO_TARGET");
  assert.equal(pr({ viewer: "nobody" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(pr({ ord: 0 }).reason, "BEARING_NOT_RFC");
  assert.equal(pr({ claims: [{ claim: INQ3, bearing: "new_evidence" }] }).reason, "BEARING_REFUSED");
  assert.deepEqual(w.counts(), before);
});

test("R4 a machine never records a layout; every read answers an invisible action as an absent one; the tables are this module's, keyed by the action and cleared by its purge", () => {
  const { w, got } = answered();
  assert.equal(lay(w, [{ claim: INQ, bearing: "new_evidence" }], { author: MACHINE, viewer: MACHINE }).reason, "MACHINE_CANNOT_RECORD_BEARING");
  assert.equal(lay(w, [{ claim: INQ, bearing: "new_evidence" }]).ok, true);
  assert.equal(w.r.actionBearingPropose({ target: RFC, ord: got, claims: [{ claim: INQ, bearing: "new_evidence" }], proposer: MACHINE, viewer: MACHINE }).ok, true);
  const hidden = w.r.bearingsOf({ target: RFC, viewer: "nobody" });
  const absent = w.r.bearingsOf({ target: "ACTN-2026-0099-none", viewer: "nobody" });
  assert.deepEqual([hidden.reason, absent.reason], ["NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE"]);
  const declared = w.record.declaredTables().filter((d) => d.module === "action-replies");
  assert.deepEqual(declared.map((d) => [d.name, d.purge]).sort(),
    [["action_arose_from", "clear"], ["action_bearing_proposals", "clear"], ["action_reply_bearings", "clear"], ["action_reply_quoting", "clear"]]);
  w.record.purge({ bundleId: RFC });
  assert.deepEqual(w.counts().slice(0, 3), [0, 0, 0], "the action's purge clears its layouts and proposals");
});
