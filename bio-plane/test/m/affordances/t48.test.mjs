/* affordances, T48 (T48-57; N880, N1053, N1054; K3192, K3254): R58, `actionreplyquoting` offered on an action exactly where
   action-replies R10 would admit this caller, driven over action-replies' own world (the real `actions` and
   `action-replies`); R59, each connection kind's design group. R57 is t36.test.mjs's (`ACT_HELP`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveActs, ACTS } from "../../../src/affordances.mjs";
import { affordancesOf } from "../../../src/affordances/facts.mjs";
import { MACHINE_REFUSALS } from "../../../src/op-grades/index.mjs";
import { world as rWorld, V, M, MACHINE, RFC, REQ } from "../action-replies/fixture.mjs";
import { world as eventsWorld } from "../events/fixture.mjs";
import { world as dutiesWorld } from "../duties/fixture.mjs";
import { vocabulariesFor } from "../../../src/affordances.mjs";
import { CONNECTION_GROUPS, CONNECTION_GROUP_NAMES } from "../../../src/affordances/words.mjs";
import { owners } from "../../../src/connection-grammar/index.mjs";
import "../../../src/standards/index.mjs";
import "../../../src/connections/index.mjs";
import "../../../src/progressions/index.mjs";
import "../../../src/hypotheses/index.mjs";
import "../../../src/contradiction/index.mjs";
import "../../../src/entities/index.mjs";

const SILENT = { escalationsFor: () => ({ ok: true, items: [] }), determinationRead: () => ({ ok: false }),
  templatesForAction: () => ({ ok: false }), filingsFor: () => ({ ok: false }), remindersFor: () => ({ ok: false }) };

function scene() {
  const w = rWorld();
  const facts = affordancesOf(w.host, { record: w.record, membership: w.membership, actions: w.a,
    escalation: SILENT, conformance: SILENT, filings: SILENT, actionClocks: SILENT });
  const offered = (id, author = M) => deriveActs(facts.affordanceFacts({ target: id, viewer: M, identity: M, author, by: "alice" })).map((a) => a.id);
  return { w, offered };
}

test("R58 R51 R18: actionreplyquoting is an ACTS row on an action, offered on a request for comment with a received entry and "
   + "accepted from that caller (the quoting record and its withdrawal), withheld where action-replies R10 refuses; an action with "
   + "only sent entries, and an action of another kind with a received entry, do not offer it and refuse it QUOTING_NOT_RFC", () => {
  const act = ACTS.find((a) => a.id === "actionreplyquoting");
  assert.ok(act, "an ACTS row");
  assert.deepEqual(act.types, ["action"]);
  assert.equal(act.weight, "single");
  const { w, offered } = scene();
  w.rfc(RFC);
  const sent = w.say(RFC, "sent");
  assert.ok(!offered(RFC).includes("actionreplyquoting"), "only sent entries: not offered (control)");
  assert.equal(w.r.actionReplyQuoting({ target: RFC, ord: sent, quotable: true, author: M, viewer: M }).reason, "QUOTING_NOT_RFC");
  const got = w.say(RFC, "received");
  const acts = offered(RFC);
  assert.ok(acts.includes("actionreplyquoting"), "a received entry on a request for comment");
  /* it is offered exactly where the layout of the reply is: the same facts */
  assert.equal(acts.includes("actionreplybearing"), true);
  const said = w.r.actionReplyQuoting({ target: RFC, ord: got, quotable: false, words: "please do not quote this reply", author: M, viewer: M });
  assert.equal(said.ok, true, JSON.stringify(said).slice(0, 300));
  assert.ok(offered(RFC).includes("actionreplyquoting"), "still offered: a later record takes it back");
  assert.equal(w.r.actionReplyQuoting({ target: RFC, ord: got, quotable: true, author: M, viewer: M }).ok, true);
  /* another kind, with a received entry: not offered, and the method refuses */
  w.rfc(REQ, { kind: "records_request" });
  const rec = w.say(REQ, "received");
  assert.ok(!offered(REQ).includes("actionreplyquoting"), "not a request for comment (control)");
  assert.equal(w.r.actionReplyQuoting({ target: REQ, ord: rec, quotable: true, author: M, viewer: M }).reason, "QUOTING_NOT_RFC");
});

test("R58 R10 R20: a machine is offered no actionreplyquoting, which MACHINE_REFUSALS holds under the code its method answers a "
   + "machine with; a member is offered it", () => {
  const { w, offered } = scene();
  w.rfc(RFC);
  const got = w.say(RFC, "received");
  assert.ok(offered(RFC, M).includes("actionreplyquoting"));
  assert.ok(!offered(RFC, MACHINE).includes("actionreplyquoting"), "a machine is offered none");
  const refused = w.r.actionReplyQuoting({ target: RFC, ord: got, quotable: true, author: MACHINE, viewer: M });
  assert.equal(refused.ok, false);
  assert.equal(refused.reason, "MACHINE_CANNOT_RECORD_QUOTING");
  assert.equal(MACHINE_REFUSALS.actionreplyquoting, refused.reason);
});

/* the registry as the plane composes it: every owner that registers at load, the events owner at its start, the duties owner
   at its creation */
const compose = () => { eventsWorld().ev.start(); dutiesWorld(); };

test("R59 R39: each connection kind's `group` in the vocabulary is one of the design's five (pos, part, money, ment, same), from a "
   + "frozen map covering every kind the connection registry holds, and the map names no kind the registry lacks; each group is used", () => {
  compose();
  assert.deepEqual([...CONNECTION_GROUP_NAMES], ["pos", "part", "money", "ment", "same"]);
  assert.ok(Object.isFrozen(CONNECTION_GROUPS));
  const v = vocabulariesFor(null).connection_kinds;
  const registry = owners().flatMap((o) => o.kinds.map((k) => k.kind));
  assert.deepEqual(v.values, registry);
  for (const kind of registry) {
    assert.ok(CONNECTION_GROUP_NAMES.includes(v.words[kind].group), `${kind} has a design group, not ${v.words[kind].group}`);
    assert.equal(v.words[kind].group, CONNECTION_GROUPS[kind], kind);
  }
  assert.deepEqual(Object.keys(CONNECTION_GROUPS).filter((k) => !registry.includes(k)), [], "no stale entry in the map");
  assert.deepEqual([...new Set(Object.values(CONNECTION_GROUPS))].sort(), [...CONNECTION_GROUP_NAMES].sort());
  /* the words the design names for its groups hold: money moved is the money owner's, a person's claim the people owner's */
  assert.equal(v.words.money_flow.group, "money");
  assert.equal(v.words.mentioned_together.group, "ment");
  assert.equal(v.words.same_as.group, "same");
  assert.equal(v.words.event_voted.group, "part");
  assert.equal(v.words["line:holds:elected"].group, "pos");
  /* control: a kind the map lacks is seen by the same check */
  const unmapped = registry.filter((k) => !CONNECTION_GROUP_NAMES.includes({ ...CONNECTION_GROUPS, money_flow: undefined }[k]));
  assert.deepEqual(unmapped, ["money_flow"]);
});

/* ---- T48's ops, by owner (op-grades R38–R41; K3101, K3278, K3280, K3282): each owner's map holds them, each write is graded and
   each read a `NON_ACTS` read, and with the control plane's rows nothing is unaccounted ---- */
import * as A from "../../../src/affordances.mjs";
import { RUNGS, RUNG_ABSENT, NON_ACTS } from "../../../src/op-grades/index.mjs";
import { membershipOps } from "../../../src/membership/index.mjs";
import { connectionsOps } from "../../../src/connections/index.mjs";
import { followingOps } from "../../../src/following/index.mjs";
import { exploreOps } from "../../../src/explore/ops.mjs";
import { standardsOps } from "../../../src/standards/index.mjs";
import { filingsOps } from "../../../src/filings/index.mjs";
import { actionHoldsOps } from "../../../src/action-holds/index.mjs";
import { actionPlansOps } from "../../../src/action-plans/index.mjs";
import { actionRepliesOps } from "../../../src/action-replies/index.mjs";

const keysOf = (f) => Object.keys(f({}, new URL("http://x/"), {}, {}));
const T48 = {
  connections: { map: connectionsOps, writes: ["stepsource", "stepsourcewithdraw"], reads: [] },
  membership: { map: membershipOps, writes: ["lookedsince"], reads: [] },
  following: { map: followingOps, writes: [], reads: ["proceedingdates"] },
  explore: { map: exploreOps, writes: [], reads: ["exploregraph"] },
  standards: { map: standardsOps, writes: [], reads: ["standardproposals"] },
  filings: { map: filingsOps, writes: [], reads: ["filingread"] },
  actionHolds: { map: actionHoldsOps, writes: [], reads: ["pressurefor"] },
  actionPlans: { map: actionPlansOps, writes: ["planask"], reads: [] },
  actionReplies: { map: actionRepliesOps, writes: ["actionreplyquoting"], reads: [] },
};
/* `aiuseovertime` is ai-use's read (its R14); its owner is not imported here, so its op is part of the totality only */
const AI_USE_READ = "aiuseovertime";
const ACT_ROWS = ["actionreplyquoting"];

test("R12 R24 R58: T48's ops — each owner's map holds them; each write decorates with a rung or a stated absence, never both; "
   + "actionreplyquoting is an act (R58) and never a non-act, every other write a non-act (planask: a plan's, not an action's, "
   + "K3278), each read a non-act; with the control plane's rows nothing is unaccounted; one left out is seen", () => {
  for (const [owner, { map, writes, reads }] of Object.entries(T48))
    assert.deepEqual([...writes, ...reads].filter((op) => !keysOf(map).includes(op)), [], owner);
  const acts = new Set(ACTS.map((a) => a.id));
  const writes = Object.values(T48).flatMap((o) => o.writes);
  const reads = [...Object.values(T48).flatMap((o) => o.reads), AI_USE_READ];
  for (const op of writes) {
    const d = A.decorate({ id: op, label: "x" }, null);
    assert.equal((d.rung === null) !== (d.rung_absence === null), true, `R24: ${op}`);
    if (ACT_ROWS.includes(op)) assert.ok(acts.has(op) && !Object.hasOwn(NON_ACTS, op), op);
    else assert.ok(!acts.has(op) && Object.hasOwn(NON_ACTS, op), op);
  }
  for (const op of reads) assert.ok(!acts.has(op) && Object.hasOwn(NON_ACTS, op) && /^read:/.test(NON_ACTS[op]), op);
  assert.equal(RUNGS.actionreplyquoting, "reversible");
  assert.equal(RUNGS.planask, "reversible");
  assert.equal(RUNG_ABSENT.lookedsince.ground, "caller-owned");
  const table = [...writes.map((op) => ({ op, mutating: true, gated: true })), ...reads.map((op) => ({ op, mutating: false, gated: true }))];
  const r = A.unaccounted(table);
  assert.deepEqual([r.unpublished, r.unranked], [[], []]);
  assert.deepEqual(r.stale.filter((op) => table.some((t) => t.op === op)), []);
  const left = A.unaccounted([...table, { op: "planunnamed", mutating: true, gated: true }]);
  assert.deepEqual([left.unpublished, left.unranked], [["planunnamed"], ["planunnamed"]]);
});
