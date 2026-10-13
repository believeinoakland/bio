/* accepted-work: each registered flag's opening and clearing instants (R9), read through the seam `case-carriage` R19
   uses (N947). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, importer, REF, REF2, ALICE } from "./fixture.mjs";
import { ACCEPTED_WORK_ABSENT, ACCEPTED_WORK_UNREADABLE_WHY } from "../../../src/accepted-work/index.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

const T = (h) => `2026-10-0${h}T00:00:00.000Z`;   // instants in order: T(1) < T(2) < …
const FIELDS = ["flag", "finding", "issue", "opened_at", "cleared_at"];

test("R9 the fifth function, flagHistory, is optional: a registration without it is accepted (flagHistoryOn then absent), one carrying it is accepted and answers it, and one whose flagHistory is given but is not a function is refused LISTENER_MALFORMED through membership, registering nothing", () => {
  const s = importer();
  const { flagHistory, ...four } = s.fns;
  const w = world({ register: false });
  assert.deepEqual(w.aw.registerAcceptedWork("case-import", four), { ok: true, module: "case-import" });
  assert.equal(w.aw.flagHistoryOn({ ref: REF, edition: 1, since: T(1), viewer: ALICE }).absent, true);
  assert.equal(w.aw.publisherMoves({}).moves.length, 0, "the other reads answer");
  const w1 = world({ register: false });
  assert.equal(w1.aw.registerAcceptedWork("case-import", { ...four, flagHistory: undefined }).ok, true);
  assert.equal(w1.aw.flagHistoryOn({ ref: REF, edition: 1, since: T(1), viewer: ALICE }).absent, true);
  const w2 = world({ register: false });
  assert.deepEqual(w2.aw.registerAcceptedWork("case-import", s.fns), { ok: true, module: "case-import" });
  s.flag(REF, 1, "F1", T(2));
  assert.deepEqual(w2.aw.flagHistoryOn({ ref: REF, edition: 1, since: T(1), viewer: ALICE }).flags.map((f) => f.flag), ["F1"]);
  for (const bad of [null, "flagHistory", 7, {}, [], true]) {
    const w3 = world({ register: false });
    const r = w3.aw.registerAcceptedWork("case-import", { ...s.fns, flagHistory: bad });
    assert.equal(r.ok, false, String(bad));
    assert.equal(r.reason, "LISTENER_MALFORMED");
    assert.equal(r.check, MEMBERSHIP_CHECKS.LISTENER_MALFORMED.check);
    assert.equal(r.translation, MEMBERSHIP_CHECKS.LISTENER_MALFORMED.translation);
    assert.equal(w3.aw.flagHistoryOn({ ref: REF, edition: 1, since: T(1), viewer: ALICE }).absent, true, "nothing registered");
    assert.equal(w3.aw.acceptedFinding({ ref: REF, edition: 1, viewer: ALICE }).absent, true, "nothing registered");
  }
});

test("R9 flagHistoryOn answers the registered flagHistory's answer unchanged: every flag on the edition and its named finding open at any instant from since through the read, open or cleared since, in opening order, each with its opening and clearing instants (null while open), so a flag opened and cleared inside the interval is seen", () => {
  const w = world();
  w.source.flag(REF, 1, "BEFORE", T(1), T(2));                  // cleared before since: not in the answer
  w.source.flag(REF, 1, "INSIDE", T(4), T(5));                  // opened and cleared inside the interval
  w.source.flag(REF, 1, "STILL", T(3));                         // opened before since, open now
  w.source.flag(REF, 1, "LATE", T(6), null, { finding: "INQ-2026-0001-own" });   // the edition's own, opened since
  w.source.flag(REF, 1, "SPANS", T(2), T(7));                   // open at since, cleared after it
  w.source.flag(REF, 2, "OTHER-EDITION", T(4));
  w.source.flag(REF2, 1, "OTHER-REF", T(4));
  const args = { ref: REF, edition: 1, since: T(3), viewer: ALICE };
  const a = w.aw.flagHistoryOn(args);
  assert.deepEqual(a, w.source.fns.flagHistory(args), "the registered answer, as given");
  assert.deepEqual(a.flags.map((f) => f.flag), ["SPANS", "STILL", "INSIDE", "LATE"], "in opening order");
  assert.equal(a.complete, true);
  for (const f of a.flags) assert.deepEqual(Object.keys(f).sort(), [...FIELDS].sort());
  const byFlag = Object.fromEntries(a.flags.map((f) => [f.flag, f]));
  assert.deepEqual([byFlag.INSIDE.opened_at, byFlag.INSIDE.cleared_at], [T(4), T(5)], "opened and cleared inside");
  assert.equal(byFlag.STILL.cleared_at, null, "null while open");
  assert.equal(byFlag.LATE.finding, "INQ-2026-0001-own");
  /* a cleared flag is answered, not only the open ones */
  assert.ok(a.flags.some((f) => f.cleared_at !== null));
  /* any answer the registered function gives is the read's answer, as given (the same object) */
  const odd = { anything: [1, 2] };
  const w2 = world({ register: false });
  w2.aw.registerAcceptedWork("case-import", { ...importer().fns, flagHistory: () => odd });
  assert.equal(w2.aw.flagHistoryOn(args), odd);
});

test("R9 the registered flagHistory is called with {ref, edition, since, viewer} alone, since handed on exactly as given (whether it is an instant is the registered module's to judge)", () => {
  const w = world();
  w.aw.flagHistoryOn({ ref: REF, edition: 2, since: T(3), viewer: ALICE, extra: "dropped" });
  w.aw.flagHistoryOn({ ref: REF, edition: 2, since: "not an instant", viewer: ALICE });
  w.aw.flagHistoryOn({ ref: REF, edition: 2, since: 7, viewer: ALICE });
  w.aw.flagHistoryOn({ ref: REF, edition: 2, viewer: ALICE });
  w.aw.flagHistoryOn({});
  assert.deepEqual(w.source.calls, [
    ["flagHistory", { ref: REF, edition: 2, since: T(3), viewer: ALICE }],
    ["flagHistory", { ref: REF, edition: 2, since: "not an instant", viewer: ALICE }],
    ["flagHistory", { ref: REF, edition: 2, since: 7, viewer: ALICE }],
    ["flagHistory", { ref: REF, edition: 2, since: undefined, viewer: ALICE }],
    ["flagHistory", { ref: undefined, edition: undefined, since: undefined, viewer: undefined }],
  ]);
});

test("R9 with no flagHistory registered flagHistoryOn answers {absent: true}, stated as accepted_work_absent: nothing registered, or a registration without it", () => {
  const bare = world({ register: false });
  const { flagHistory, ...four } = importer().fns;
  const without = world({ register: false });
  without.aw.registerAcceptedWork("case-import", four);
  for (const w of [bare, without]) {
    for (const args of [{ ref: REF, edition: 1, since: T(1), viewer: ALICE }, {}, undefined, null]) {
      const a = w.aw.flagHistoryOn(args);
      assert.equal(a.absent, true);
      assert.equal(a.reason, ACCEPTED_WORK_ABSENT);
      assert.equal(a.reason, "accepted_work_absent");
      assert.equal(typeof a.detail, "string");
      assert.ok(!("flags" in a));
      assert.equal(a.ok, undefined, "a read is not a refusal");
    }
  }
});

test("R9 when the registered flagHistory throws, or answers a promise, flagHistoryOn answers {unreadable: true}, never the stack; it never throws, whatever it is handed, and writes nothing", async () => {
  const w = world();
  w.source.flag(REF, 1, "F1", T(2), T(4));
  const dump = () => JSON.stringify(w.tables().map((t) => [t, w.st.rows(`SELECT * FROM "${t}"`)]));
  const before = dump();
  assert.equal(w.aw.flagHistoryOn({ ref: REF, edition: 1, since: T(1), viewer: ALICE }).flags.length, 1);
  w.source.throws = "the flag table is locked";
  const a = w.aw.flagHistoryOn({ ref: REF, edition: 1, since: T(1), viewer: ALICE });
  assert.equal(a.unreadable, true);
  assert.equal(a.reason, ACCEPTED_WORK_UNREADABLE_WHY);
  assert.ok(a.detail.includes("the flag table is locked"));
  assert.ok(!("stack" in a));
  for (const thrown of [() => { throw "s"; }, () => { throw null; }, () => { throw new Error("y".repeat(9000)); },
                        () => Promise.resolve({ flags: [], complete: true }), () => Promise.reject(new Error("later"))]) {
    const x = world({ register: false });
    x.aw.registerAcceptedWork("case-import", { ...importer().fns, flagHistory: thrown });
    const r = x.aw.flagHistoryOn({ ref: REF, edition: 1, since: T(1), viewer: ALICE });
    assert.equal(r.unreadable, true);
    assert.ok(r.detail.length < 400, "the detail is bounded");
  }
  w.source.throws = null;
  const hostile = { get since() { throw new Error("boom"); } };
  for (const args of [undefined, null, 7, "x", [], hostile, { since: {}, edition: -1 }])
    assert.doesNotThrow(() => w.aw.flagHistoryOn(args));
  assert.equal(w.aw.flagHistoryOn(hostile).unreadable, true);
  assert.equal(world({ register: false }).aw.flagHistoryOn(hostile).absent, true);
  assert.equal(dump(), before, "nothing was written");
  await new Promise((r) => setImmediate(r));   // no unhandled rejection is left behind
});
