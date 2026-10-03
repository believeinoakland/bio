/* accepted-work: the three reads (R2). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, importer, REF, REF2, ALICE, NOW } from "./fixture.mjs";
import { ACCEPTED_WORK_ABSENT } from "../../../src/accepted-work/index.mjs";

const READS = [
  ["acceptedFinding", { ref: REF, edition: 1, viewer: ALICE }],
  ["openFlagsOn", { ref: REF, edition: 1, viewer: ALICE }],
  ["acceptanceWithdrawals", { after: null, limit: 10 }],
];

test("R2 each read answers the registered function's answer, unchanged: the finding with its pair and acceptance (or null), the open flags, the withdrawals page", () => {
  const w = world();
  w.source.publish(REF, 1, { pair: { evidence: "A", inference: "C" } });
  w.source.accept(REF, 1);
  w.source.publish(REF, 2);
  w.source.flags.push({ ref: REF, edition: 1, flag: "F1", finding: "INQ-2026-0007-found", issue: "a date is wrong", at: NOW });
  const f = w.aw.acceptedFinding({ ref: REF, edition: 1, viewer: ALICE });
  assert.deepEqual(f, w.source.fns.finding({ ref: REF, edition: 1, viewer: ALICE }));
  assert.deepEqual(f.pair, { evidence: "A", inference: "C" }, "the pair as the edition publishes it");
  assert.equal(w.aw.acceptedFinding({ ref: REF, edition: 2, viewer: ALICE }).acceptance, null, "held, not accepted");
  assert.equal(w.aw.acceptedFinding({ ref: REF, edition: 3, viewer: ALICE }), null, "not held at that edition");
  assert.equal(w.aw.acceptedFinding({ ref: REF2, edition: 1, viewer: ALICE }), null, "not held at all");
  w.source.hidden.add("member:mallory");
  assert.equal(w.aw.acceptedFinding({ ref: REF, edition: 1, viewer: "member:mallory" }), null, "a viewer who may not see it");
  assert.deepEqual(w.aw.openFlagsOn({ ref: REF, edition: 1, viewer: ALICE }),
    { flags: [{ flag: "F1", finding: "INQ-2026-0007-found", issue: "a date is wrong", at: NOW }], complete: true });
  assert.deepEqual(w.aw.openFlagsOn({ ref: REF, edition: 2, viewer: ALICE }), { flags: [], complete: true });
  w.source.withdraw(REF, 1); w.source.withdraw(REF2, 1);
  const p1 = w.aw.acceptanceWithdrawals({ limit: 1 });
  assert.equal(p1.withdrawals.length, 1);
  assert.equal(p1.withdrawals[0].withdrawal, "W1");
  assert.equal(p1.cursor, "W1");
  const p2 = w.aw.acceptanceWithdrawals({ after: p1.cursor, limit: 1 });
  assert.deepEqual(p2.withdrawals.map((x) => x.withdrawal), ["W2"]);
  assert.equal(p2.cursor, null);
  /* any answer the registered function gives is the read's answer, as given */
  const odd = { anything: [1, 2] };
  const w2 = world({ register: false });
  const s = importer();
  w2.aw.registerAcceptedWork("case-import", { finding: () => odd, openFlags: () => odd, withdrawals: () => odd });
  for (const [name, args] of READS) assert.equal(w2.aw[name](args), odd, name);
});

test("R2 with none registered each read answers {absent: true}, stated as accepted_work_absent, and never throws", () => {
  const w = world({ register: false });
  for (const [name, args] of READS) {
    const a = w.aw[name](args);
    assert.equal(a.absent, true, name);
    assert.equal(a.reason, ACCEPTED_WORK_ABSENT, name);
    assert.equal(ACCEPTED_WORK_ABSENT, "accepted_work_absent");
    assert.equal(typeof a.detail, "string");
    assert.equal(a.ok, undefined, "a read is not a refusal");
  }
  for (const name of ["acceptedFinding", "openFlagsOn", "acceptanceWithdrawals"]) {
    assert.equal(w.aw[name]().absent, true, `${name} with no arguments`);
    assert.equal(w.aw[name](undefined).absent, true);
  }
});

test("R2 when the registered function throws (or answers a promise, which no synchronous reader could wait for) each read answers {unreadable: true}, never throws and never carries the stack", async () => {
  const w = world();
  w.source.throws = "the import table is locked";
  for (const [name, args] of READS) {
    const a = w.aw[name](args);
    assert.equal(a.unreadable, true, name);
    assert.ok(!("stack" in a));
    assert.ok(a.detail.includes("the import table is locked"));
  }
  const w2 = world({ register: false });
  w2.aw.registerAcceptedWork("case-import", { finding: () => { throw "a string"; }, openFlags: () => { throw null; },
    withdrawals: () => { throw new Error("x".repeat(5000)); } });
  for (const [name, args] of READS) {
    const a = w2.aw[name](args);
    assert.equal(a.unreadable, true, name);
    assert.ok(a.detail.length < 400, "the detail is bounded");
  }
  const w3 = world({ register: false });
  const later = () => Promise.reject(new Error("later"));
  w3.aw.registerAcceptedWork("case-import", { finding: later, openFlags: later, withdrawals: later });
  for (const [name, args] of READS) assert.equal(w3.aw[name](args).unreadable, true, name);
  await new Promise((r) => setImmediate(r));   // no unhandled rejection is left behind
});

test("R2 none of the reads writes: the database is byte-for-byte the same after every read, registered or not", () => {
  const w = world();
  w.source.publish(REF, 1); w.source.accept(REF, 1); w.source.withdraw(REF, 1);
  const dump = () => JSON.stringify(w.tables().map((t) => [t, w.st.rows(`SELECT * FROM "${t}"`)]));
  const before = dump();
  for (const [name, args] of READS) w.aw[name](args);
  w.aw.acceptedLegRefusals({ legs: [{ target: REF, target_edition: 1 }], viewer: ALICE });
  assert.equal(dump(), before);
});

test("R2 a read handed arguments that cannot be read answers, never throws: absent with none registered, else unreadable", () => {
  const hostile = { get ref() { throw new Error("boom"); }, get after() { throw new Error("boom"); } };
  const w = world(), bare = world({ register: false });
  for (const name of ["acceptedFinding", "openFlagsOn", "acceptanceWithdrawals"]) {
    for (const args of [null, 7, "x", []]) assert.doesNotThrow(() => w.aw[name](args));
    assert.equal(w.aw[name](hostile).unreadable, true, name);
    assert.equal(bare.aw[name](hostile).absent, true, name);
  }
  assert.equal(w.source.calls.length, 3 * 4, "only readable arguments reached the registered functions");
});
