/* duties, T45 (T45-8; N855, N882; Actions D6d, D7): duties proposed from a body's reply or a report (R30), the duties
   arising in named captures and whether every one reads met (R31), and the fifth basis kind refused (R23); over the
   real modules. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, E, BOB, CAROL, MACHINE, ZONE, SHA } from "./fixture.mjs";
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
