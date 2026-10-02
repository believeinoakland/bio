/* escalation: its own reason code (R24) and its ops map (R25), each driven at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, opened, toStage, V } from "./fixture.mjs";
import { ESCALATION_CHECKS, escalationOps } from "../../../src/escalation/index.mjs";

const TRANSLATION = "This act needs a reason, in your own words, of up to 2,000 characters. Nothing was written.";
const BAD_REASONS = [undefined, null, "", "   ", "\n\t", 7, "x".repeat(2001), ` ${"y".repeat(2001)} `];

test("R24 every act that takes a reason (R1's opening, R9's attachment, R10's evaluation, R13's advance and decline, R15's suspension, R27's decline to escalate) refuses one absent, not a string, blank or over 2,000 characters ESCALATION_NO_REASON, row C-116.24 with its translation unchanged, never progressions' NO_REASON; nothing is written, and a reason of 1 or 2,000 characters lands", () => {
  const row = ESCALATION_CHECKS.ESCALATION_NO_REASON;
  assert.deepEqual([row.check, row.translation], ["C-116.24", TRANSLATION]);
  assert.equal("NO_REASON" in ESCALATION_CHECKS, false, "escalation holds no NO_REASON of its own");
  assert.equal(Object.values(ESCALATION_CHECKS).filter((r) => r.check === "C-116.24").length, 1, "one code holds the row");
  const refused = (r, why) => {
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "ESCALATION_NO_REASON", "ESCALATION_NO_REASON",
                     "C-116.24", TRANSLATION], why);
    assert.equal(typeof r.detail, "string", why);
  };
  /* stage 4: the evaluation (a none reading, so no response is needed to reach the reason) */
  const w4 = seeded();
  toStage(w4, 4);
  const ev = (reason) => w4.esc.escalationEvaluate({ id: w4.E, reading: "none", reason, author: V("bob"), viewer: V("bob") });
  /* stage 1, with 1→2 proposed: advance, decline and suspend */
  const w1 = seeded();
  opened(w1);
  const base = { id: w1.E, author: V("bob"), viewer: V("bob") };
  /* stage 2: the attachment; a fresh determination: the opening and the decline to escalate */
  const w2 = seeded();
  toStage(w2, 2);
  const a2 = w2.action({ project: w2.P, restsOn: [w2.D] });
  const wo = seeded();
  const acts = {
    escalationOpen: [wo, (reason) => wo.esc.escalationOpen({ determination: wo.D, reason, author: V("bob"), viewer: V("bob") })],
    declineToEscalate: [wo, (reason) => wo.esc.declineToEscalate({ determination: wo.D, reason, author: V("bob"), viewer: V("bob") })],
    escalationAttach: [w2, (reason) => w2.esc.escalationAttach({ id: w2.E, action: a2, reason, author: V("bob"), viewer: V("bob") })],
    escalationEvaluate: [w4, ev],
    escalationAdvance: [w1, (reason) => w1.esc.escalationAdvance({ ...base, to: 2, reason })],
    escalationDecline: [w1, (reason) => w1.esc.escalationDecline({ ...base, to: 2, reason })],
    escalationSuspend: [w1, (reason) => w1.esc.escalationSuspend({ ...base, reason })],
  };
  for (const [name, [w, call]] of Object.entries(acts)) {
    const before = w.snapshot();
    for (const reason of BAD_REASONS) refused(call(reason), `${name} ${JSON.stringify(reason)?.slice(0, 20)}`);
    const omitted = name === "escalationEvaluate"
      ? w4.esc.escalationEvaluate({ id: w4.E, reading: "none", author: V("bob"), viewer: V("bob") })
      : name === "escalationAttach" ? w2.esc.escalationAttach({ id: w2.E, action: a2, author: V("bob"), viewer: V("bob") })
      : name === "escalationOpen" || name === "declineToEscalate"
        ? wo.esc[name]({ determination: wo.D, author: V("bob"), viewer: V("bob") })
      : w.esc[name]({ ...base, to: 2 });
    refused(omitted, `${name} with no reason key`);
    assert.deepEqual(w.snapshot(), before, `${name}: no refusal writes anything`);
  }
  /* the bounds land: 1 character and 2,000 */
  assert.equal(acts.declineToEscalate[1]("d").ok, true);
  assert.equal(acts.escalationOpen[1]("o".repeat(2000)).ok, true);
  assert.equal(acts.escalationAttach[1](` ${"a".repeat(2000)} `).ok, true, "the reason is counted trimmed");
  assert.equal(ev("x".repeat(2000)).ok, true);
  assert.equal(w1.esc.escalationDecline({ ...base, to: 2, reason: "y" }).ok, true);
  assert.equal(w1.esc.escalationSuspend({ ...base, reason: "z".repeat(2000) }).ok, true);
  /* resuming takes no reason (R15), so it never answers the code */
  assert.equal(w1.esc.escalationResume({ ...base }).ok, true);
  assert.equal(w1.esc.escalationAdvance({ ...base, to: 2, reason: "Notify." }).ok, true);
});

/* A recorder in the shape of the module's services: each call's name and arguments, answered with a marker. */
function recorder() {
  const calls = [];
  const names = ["escalationOpen", "escalationRead", "escalationAttach", "escalationEvaluate", "escalationAdvance",
                 "escalationDecline", "escalationEnd", "escalationSuspend", "escalationResume", "escalationsDue",
                 "declineToEscalate", "escalationStatus", "escalationReasonDraft"];
  const esc = Object.fromEntries(names.map((n) => [n, (args) => { calls.push([n, args]); return { answered: n }; }]));
  return { esc, calls };
}
const URL_OF = (q) => new URL(`https://plane.test/op?${new URLSearchParams(q)}`);

test("R25 escalationOps(escalation, url, body) holds exactly the thirteen arms, each a function of no arguments answering what its service answers: the nine acts (declinetoescalate among them) with the body's fields and the query's author and viewer set after them; escalation (the read) with the query's id, now as nowMs and viewer; escalationsdue with now as nowMs, limit and viewer; escalationstatus with the query's determination and viewer; escalationreasondraft (R29) with the query's determination, now as nowMs and viewer; now and limit numbers when stated and absent when not or empty", () => {
  const ACTS = { escalationopen: "escalationOpen", escalationattach: "escalationAttach", escalationevaluate: "escalationEvaluate",
    escalationadvance: "escalationAdvance", escalationdecline: "escalationDecline", escalationend: "escalationEnd",
    escalationsuspend: "escalationSuspend", escalationresume: "escalationResume", declinetoescalate: "declineToEscalate" };
  const { esc, calls } = recorder();
  const url = URL_OF({ op: "x", author: "member:bob", viewer: "member:carol", id: "ESC-2026-0001-escalation", now: "1790000000000", limit: "7",
                       determination: "CONF-2026-0001-determination" });
  /* the body may not supply the stamps: the query's are set after its fields */
  const body = { id: "ESC-2026-0002-escalation", to: 5, reason: "Go.", author: "member:mallory", viewer: "member:mallory", extra: [1],
                 determination: "CONF-2026-0002-determination" };
  const ops = escalationOps(esc, url, body);
  assert.deepEqual(Object.keys(ops).sort(),
                   [...Object.keys(ACTS), "escalation", "escalationsdue", "escalationstatus", "escalationreasondraft"].sort());
  for (const [op, f] of Object.entries(ops)) assert.deepEqual([typeof f, f.length], ["function", 0], op);
  assert.equal(calls.length, 0, "building the map calls nothing");
  for (const [op, name] of Object.entries(ACTS)) {
    calls.length = 0;
    assert.deepEqual(ops[op](), { answered: name }, op);
    assert.deepEqual(calls, [[name, { ...body, author: "member:bob", viewer: "member:carol" }]], op);
  }
  calls.length = 0;
  assert.deepEqual(ops.escalation(), { answered: "escalationRead" });
  assert.deepEqual(calls, [["escalationRead", { id: "ESC-2026-0001-escalation", nowMs: 1790000000000, viewer: "member:carol" }]],
                   "the read takes nothing from the body");
  calls.length = 0;
  assert.deepEqual(ops.escalationsdue(), { answered: "escalationsDue" });
  assert.deepEqual(calls, [["escalationsDue", { nowMs: 1790000000000, limit: 7, viewer: "member:carol" }]]);
  calls.length = 0;
  assert.deepEqual(ops.escalationstatus(), { answered: "escalationStatus" });
  assert.deepEqual(calls, [["escalationStatus", { determination: "CONF-2026-0001-determination", viewer: "member:carol" }]],
                   "the status read takes its determination from the query, never the body");
  calls.length = 0;
  assert.deepEqual(ops.escalationreasondraft(), { answered: "escalationReasonDraft" });
  assert.deepEqual(calls, [["escalationReasonDraft", { determination: "CONF-2026-0001-determination", nowMs: 1790000000000,
                                                       viewer: "member:carol" }]],
                   "the draft takes its determination and now from the query, never the body");
  /* absent or empty numbers are absent; no body, and no stamps in the query, are passed as they are */
  for (const q of [{}, { now: "", limit: "" }]) {
    const { esc: e2, calls: c2 } = recorder();
    const o = escalationOps(e2, URL_OF(q), undefined);
    o.escalation(); o.escalationsdue(); o.escalationopen(); o.escalationstatus(); o.declinetoescalate(); o.escalationreasondraft();
    assert.deepEqual(c2, [["escalationRead", { id: null, nowMs: undefined, viewer: null }],
      ["escalationsDue", { nowMs: undefined, limit: undefined, viewer: null }],
      ["escalationOpen", { author: null, viewer: null }], ["escalationStatus", { determination: null, viewer: null }],
      ["declineToEscalate", { author: null, viewer: null }],
      ["escalationReasonDraft", { determination: null, nowMs: undefined, viewer: null }]], JSON.stringify(q));
  }
  /* a stated non-number is Number's answer, as the store's arm reads it today */
  const { esc: e3, calls: c3 } = recorder();
  escalationOps(e3, URL_OF({ now: "soon", limit: "3" }), null).escalationsdue();
  assert.ok(Number.isNaN(c3[0][1].nowMs));
  assert.equal(c3[0][1].limit, 3);
});

test("R25 over the module itself: each arm answers exactly what the named service answers on the same record", () => {
  const w = seeded();
  const q = (extra) => URL_OF({ author: V("bob"), viewer: V("bob"), ...extra });
  /* R27, R28: a decline to escalate through its arm, then the status read through its arm, each what the service answers */
  const declined = escalationOps(w.esc, q({}), { determination: w.D, reason: "Not yet.", author: V("mallory") }).declinetoescalate();
  assert.deepEqual([declined.ok, declined.author], [true, V("bob")], "the author is the query's stamp, never the body's");
  assert.deepEqual(escalationOps(w.esc, q({ determination: w.D }), { determination: "CONF-other" }).escalationstatus(),
                   w.esc.escalationStatus({ determination: w.D, viewer: V("bob") }));
  assert.equal(w.esc.escalationStatus({ determination: w.D, viewer: V("bob") }).status, "declined");
  assert.equal(escalationOps(w.esc, q({ author: "class:ai" }), { determination: w.D, reason: "No." }).declinetoescalate().reason,
               "MACHINE_CANNOT_DECLINE_TO_ESCALATE");
  /* R29: the draft through its arm is what the service answers, at the query's now and at the instance clock */
  const at0 = String(Date.parse("2026-09-30T00:00:00Z"));
  const draft = escalationOps(w.esc, q({ determination: w.D, now: at0 }), { determination: "CONF-other", nowMs: 1 }).escalationreasondraft();
  assert.equal(draft.ok, true, JSON.stringify(draft).slice(0, 300));
  assert.deepEqual(draft, w.esc.escalationReasonDraft({ determination: w.D, nowMs: Number(at0), viewer: V("bob") }));
  assert.deepEqual(escalationOps(w.esc, q({ determination: w.D }), null).escalationreasondraft(),
                   w.esc.escalationReasonDraft({ determination: w.D, viewer: V("bob") }));
  assert.deepEqual(escalationOps(w.esc, q({ determination: "CONF-2026-0404-none" }), null).escalationreasondraft(),
                   w.esc.escalationReasonDraft({ determination: "CONF-2026-0404-none", viewer: V("bob") }));
  const opened1 = escalationOps(w.esc, q({}), { determination: w.D, reason: "Worth pursuing." }).escalationopen();
  assert.equal(opened1.ok, true, JSON.stringify(opened1).slice(0, 300));
  const at = String(Date.parse("2026-09-30T00:00:00Z"));
  assert.deepEqual(escalationOps(w.esc, q({ id: opened1.id, now: at }), null).escalation(),
                   w.esc.escalationRead({ id: opened1.id, nowMs: Number(at), viewer: V("bob") }));
  assert.deepEqual(escalationOps(w.esc, q({ now: at, limit: "5" }), null).escalationsdue(),
                   w.esc.escalationsDue({ nowMs: Number(at), limit: 5, viewer: V("bob") }));
  /* a refusal is relayed as the service answers it: a reason absent (R24), and a machine author stamped in the query */
  assert.deepEqual(escalationOps(w.esc, q({}), { id: opened1.id, to: 2 }).escalationadvance(),
                   w.esc.escalationAdvance({ id: opened1.id, to: 2, author: V("bob"), viewer: V("bob") }));
  assert.equal(escalationOps(w.esc, q({ author: "class:ai" }), { id: opened1.id, to: 2, reason: "Go." }).escalationadvance().reason,
               "MACHINE_CANNOT_ADVANCE");
  const adv = escalationOps(w.esc, q({}), { id: opened1.id, to: 2, reason: "Notify." }).escalationadvance();
  assert.deepEqual([adv.ok, adv.to, adv.author], [true, 2, V("bob")]);
  const sus = escalationOps(w.esc, q({}), { id: opened1.id, reason: "Hold." }).escalationsuspend();
  assert.deepEqual([sus.ok, sus.state], [true, "suspended"]);
  assert.equal(escalationOps(w.esc, q({}), { id: opened1.id }).escalationresume().state, "open");
});
