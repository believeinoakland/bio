/* standards: in force at a date (R7 as R20's alias, R8, R20; T33-31, K1446, Choices 18; `measures-T33/time-law.md` §4).
   `events` is a provider the test controls, as events' `readEvent` answers (events R9, R26). */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, V, REASON } from "./fixture.mjs";
import { IN_FORCE_STATES } from "../../../src/standards/index.mjs";

const EV = (s) => `EVT-2026-${s.padEnd(16, "0").slice(0, 16)}`;

test("R20 inForceAt for one standard answers {state, why, standard, version} through civil-time.validAt over its period: a bound given as an enactment event is read from the event's when; an event with no when, a band, one not held or no events module wired answers undetermined with why; never a default; it writes nothing and never throws", () => {
  const w = seeded();
  const ev = { enact: w.event({ value: "2020-03-01" }), repeal: w.event({ value: { value: "2024-06-30T10:00", precision: "minute", zone: "UTC" } }),
               nowhen: w.event(), band: w.event({ value: { value: "2020-03", precision: "edtf", zone: "UTC" } }), absent: EV("absent") };
  const plain = w.declare({ period: { from: "2020-01-01", to: "2020-12-31" } }).id;
  const byEvent = w.declare({ period: { from: null, to: null },
                              period_basis: { from: { event: ev.enact, edge: "start" }, to: { event: ev.repeal, edge: "end" } } }).id;
  const before = w.snapshot();
  const r = w.s.inForceAt({ standard: plain, date: "2020-06-01" });
  assert.deepEqual([r.ok, r.state, r.standard, r.version.from, r.version.to], [true, "in_force", plain, "2020-01-01", "2020-12-31"]);
  assert.equal(w.s.inForceAt({ standard: plain, date: "2021-01-01" }).state, "not_in_force");
  assert.deepEqual(["2020-02-29", "2020-03-01", "2024-06-30", "2024-07-01"].map((date) => w.s.inForceAt({ standard: byEvent, date }).state),
                   ["not_in_force", "in_force", "in_force", "not_in_force"], "the events' days bound the period");
  assert.match(w.s.inForceAt({ standard: byEvent, date: "2022-01-01" }).why, /2020-03-01 to 2024-06-30/);
  assert.deepEqual(w.snapshot(), before, "the reads write nothing");
  for (const [e, says] of [[ev.nowhen, /no when the record can read/], [ev.band, /a band/], [ev.absent, /not held, or may not be read/]]) {
    const s = w.declare({ period: null, period_basis: { from: { event: e, edge: "start" } } }).id;
    const a = w.s.inForceAt({ standard: s, date: "2022-01-01" });
    assert.equal(a.state, "undetermined", e);
    assert.match(a.why, says, e);
  }
  /* no events module wired: an event bound is undetermined, saying so */
  const bare = seeded({ events: "none" });
  const s = bare.declare({ period: null, period_basis: { from: { event: ev.enact, edge: "start" } } }).id;
  assert.match(bare.s.inForceAt({ standard: s, date: "2022-01-01" }).why, /events module is not wired/);
  /* refusals and robustness */
  assert.equal(w.s.inForceAt({ date: "2020-01-01" }).reason, "STANDARD_NO_ID");
  assert.equal(w.s.inForceAt({ standard: plain, date: "2020-02-30" }).reason, "STANDARD_DATE_INVALID");
  assert.equal(w.s.inForceAt({ standard: "STD-2026-9999-x", date: "2020-01-01" }).reason, "NO_SUCH_STANDARD");
  assert.equal(w.s.inForceAt({ standard: plain, date: "2020-01-01", viewer: "nobody" }).reason, "NO_SUCH_STANDARD", "a viewer naming no member");
  for (const args of [undefined, null, {}, { key: 7, date: 7 }, { standard: {}, date: "x" }]) assert.doesNotThrow(() => w.s.inForceAt(args ?? undefined));
});

test("R20 with an instrument key, the version whose period covers the date answers; two versions both covering it, or none deciding it, answer undetermined naming them (never the later preferred); every version excluding it answers not_in_force; a portion narrows to its versions", () => {
  const w = seeded();
  const t = w.passage().contentId;
  const v1 = w.declare({ text: [t], period: { from: "2010-01-01", to: "2019-12-31" }, portion: { path: "12(a)", content_id: t } }).id;
  const v2 = w.declare({ text: [t], period: { from: "2020-01-01", to: "2029-12-31" }, portion: { path: "12(a)", content_id: t } }).id;
  const key = "/eli/xx-port-ellery/selectboard/12";
  const at = (date, extra = {}) => w.s.inForceAt({ key, date, ...extra });
  assert.deepEqual([at("2015-06-01").state, at("2015-06-01").standard], ["in_force", v1]);
  assert.deepEqual([at("2025-06-01").state, at("2025-06-01").standard], ["in_force", v2]);
  assert.deepEqual([at("2009-06-01").state, at("2035-01-01").state], ["not_in_force", "not_in_force"]);
  assert.deepEqual(at("2009-06-01").versions, [v1, v2]);
  assert.equal(at("2015-06-01", { portion: "12(a)" }).standard, v1);
  assert.match(at("2015-06-01", { portion: "12(b)" }).why, /no version .* is held/);
  /* a third version overlapping the second: both cover 2025, none preferred */
  const v3 = w.declare({ text: [t], period: { from: "2024-01-01", to: "2026-12-31" } }).id;
  const both = at("2025-06-01");
  assert.equal(both.state, "undetermined");
  assert.deepEqual(both.versions, [v2, v3]);
  assert.match(both.why, /each cover 2025-06-01; none is preferred/);
  const v4 = w.declare({ text: [t], period: { from: "2032-01-01", to: null } }).id;
  assert.equal(at("2035-01-01").state, "undetermined", "a version with no end does not decide a later date");
  assert.match(at("2035-01-01").why, new RegExp(`no held version decides 2035-01-01: ${v4}`));
  assert.match(w.s.inForceAt({ key: "/eli/xx-port-ellery/selectboard/99", date: "2020-01-01" }).why, /no version/);
});

test("R20 an adopted temporal relation bounds the period of the version it amends, repeals, renumbers or recodifies at its effective date (the day before), naming it; a withdrawn one bounds nothing; an effective event is read from its when", () => {
  const w = seeded();
  const act = w.event({ value: "2022-07-01", kind: "enactment" });
  const oldText = w.passage().contentId, amending = w.passage().contentId;
  const old = w.declare({ text: [oldText], period: { from: "2010-01-01", to: null } }).id;
  const neu = w.declare({ cite: "PEBL § 40", text: [amending], period: { from: "2020-01-01", to: null } }).id;
  assert.equal(w.s.inForceAt({ standard: old, date: "2021-01-01" }).state, "undetermined", "no end stated");
  const rel = w.s.lawRelate({ type: "amends", from: neu, to: old, citation: amending, effective: "2020-01-01", reason: REASON,
                              author: V("bob"), viewer: V("bob") });
  assert.equal(rel.ok, true, JSON.stringify(rel).slice(0, 300));
  const after = w.s.inForceAt({ standard: old, date: "2021-01-01" });
  assert.equal(after.state, "not_in_force");
  assert.match(after.why, new RegExp(`bounded by ${rel.relation.id}`));
  assert.deepEqual(after.version.bound_by, [{ relation: rel.relation.id, type: "amends", effective: "2020-01-01" }]);
  assert.equal(w.s.inForceAt({ standard: old, date: "2019-12-31" }).state, "in_force", "through the day before");
  /* a referential relation bounds nothing */
  const ref = w.s.lawRelate({ type: "refers_to", from: neu, to: old, citation: amending, reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.equal(ref.ok, true);
  /* withdrawn: the period is as stated again */
  w.s.lawWithdraw({ relation: rel.relation.id, reason: "recorded against the wrong section", author: V("carol") });
  assert.equal(w.s.inForceAt({ standard: old, date: "2021-01-01" }).state, "undetermined");
  /* an effective enactment event */
  w.s.lawRelate({ type: "repeals", from: neu, to: old, citation: amending, effective: { event: act, edge: "start" },
                  reason: REASON, author: V("bob"), viewer: V("bob") });
  assert.deepEqual(["2022-06-30", "2022-07-01"].map((date) => w.s.inForceAt({ standard: old, date }).state), ["in_force", "not_in_force"]);
});

test("R20 a date after a codifier copy's current_through with no later version held answers undetermined, \"versions after <current_through> not held\" (codifier lag), never in_force; a later version held, an official copy, or a date within it is answered as its period says", () => {
  const w = seeded();
  const t = w.passage().contentId, banner = w.passage().contentId;
  const cod = w.declare({ text: [t], copy: "codifier", current_through: { date: "2025-06-30", basis: banner },
                          period: { from: "2010-01-01", to: "2030-12-31" } }).id;
  const lag = w.s.inForceAt({ standard: cod, date: "2026-01-01" });
  assert.equal(lag.state, "undetermined");
  assert.match(lag.why, /versions after 2025-06-30 not held/);
  assert.equal(w.s.inForceAt({ standard: cod, date: "2025-06-30" }).state, "in_force", "within what the copy speaks for");
  assert.equal(w.s.inForceAt({ standard: cod, date: "2031-01-01" }).state, "not_in_force", "a stated end still excludes");
  const off = w.declare({ text: [t], copy: "official", current_through: { date: "2025-06-30", basis: banner },
                          cite: "PEBL § 77", period: { from: "2010-01-01", to: "2030-12-31" } }).id;
  assert.equal(w.s.inForceAt({ standard: off, date: "2026-01-01" }).state, "in_force", "an official copy carries no lag");
  /* a later version of the same instrument held: no lag */
  w.declare({ text: [t], period: { from: "2025-07-01", to: null } });
  assert.equal(w.s.inForceAt({ standard: cod, date: "2026-01-01" }).state, "in_force");
});

test("R7 inForce is R20's alias: for every case it answers exactly inForceAt's state and why, in the shape its callers read ({ok, id, date, state, why}); its refusals unchanged", () => {
  const w = seeded();
  const e = w.event({ value: "2021-05-05" });
  const ids = [w.declare({ period: { from: "2020-01-01", to: "2020-12-31" } }).id, w.declare({ period: { from: "2020-01-01", to: null } }).id,
               w.declare({ period: null }).id, w.declare({ period: null, period_basis: { from: { event: e, edge: "start" } } }).id];
  for (const id of ids)
    for (const date of ["2019-01-01", "2020-06-01", "2021-05-05", "2030-01-01"]) {
      const a = w.s.inForce(id, date), b = w.s.inForceAt({ standard: id, date });
      assert.deepEqual(a, { ok: true, id, date, state: b.state, why: b.why }, `${id} ${date}`);
      assert.ok(IN_FORCE_STATES.includes(a.state));
    }
  assert.equal(w.s.inForce(ids[0], "2020-13-01").reason, "STANDARD_DATE_INVALID");
  assert.equal(w.s.inForce("", "2020-01-01").reason, "STANDARD_NO_ID");
});

test("R8 with at, standardsIn carries R7's answer, relations and event bounds included, leaves out the ones not in force and still fills its page exactly", () => {
  const w = seeded();
  const t = w.passage().contentId, amend = w.passage().contentId;
  const ids = [];
  for (let i = 0; i < 6; i++) ids.push(w.declare({ cite: `PEBL § ${i + 1}`, text: [t, amend], period: { from: "2010-01-01", to: null } }).id);
  /* the first three amended away before 2021 */
  for (const old of ids.slice(0, 3))
    assert.equal(w.s.lawRelate({ type: "repeals", from: ids[5], to: old, citation: amend, effective: "2020-01-01", reason: REASON,
                                 author: V("bob"), viewer: V("bob") }).ok, true);
  const page = w.s.standardsIn({ viewer: V("carol"), at: "2021-01-01", limit: 2 });
  assert.deepEqual(page.items.map((x) => x.id), ids.slice(3, 5));
  assert.deepEqual([page.count, page.truncated, page.cursor], [2, true, ids[4]]);
  assert.ok(page.items.every((x) => x.in_force.state === "undetermined"));
  const rest = w.s.standardsIn({ viewer: V("carol"), at: "2021-01-01", limit: 2, after: page.cursor });
  assert.deepEqual([rest.items.map((x) => x.id), rest.truncated], [[ids[5]], false]);
  assert.equal(w.s.standardsIn({ viewer: V("carol"), at: "2015-01-01" }).count, 6);
});
