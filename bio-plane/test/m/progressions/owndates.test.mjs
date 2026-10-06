/* Own dates (R37), the out-of-order shape (R38) and the amount-free junction checks (R32): a placement's own date is
   the event it attests or a dated fact of its capture, read from `events` on every read; the checks over those dates
   report and never decide, and a date that does not settle the question is undetermined, never a finding. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, MEMBER, ZONE, noSuchDatedFact } from "./fixture.mjs";
import { PROGRESSION_CHECKS } from "../../../src/progressions/index.mjs";

const T = (w, placements, entityId = "ENT-1") =>
  w.p.threadInstance({ progressionKey: "proc", entityId, placements, threadedBy: "member:alice", viewer: MEMBER });
const R = (w, entityId = "ENT-1") => w.p.readInstance({ progressionKey: "proc", entityId, viewer: MEMBER });
const docOf = (r, sha) => r.stages.flatMap((s) => s.documents).find((d) => d.capture_sha === sha);
const E1 = "EVT-2026-aaaaaaaaaaaaaaaa", E2 = "EVT-2026-bbbbbbbbbbbbbbbb";

test("R37: a placement may name an event its document attests or a dated fact of its capture; anything else is refused, writing nothing", async () => {
  const w = seeded();
  w.define();
  w.event(E1, { start: "2026-02-03", end: null, precision: "day", zone: ZONE }, ["sa"]);
  w.fact("sb", "2026-02-04", "DF-B");
  const before = w.snapshot();
  // refusals come after every earlier placement check (R6), in order; a later placement's fault refuses the whole thread
  const na = await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb", event: E1 }]);
  assert.deepEqual([na.code, na.check, na.translation, na.event, na.capture_sha],
    ["NOT_ATTESTED_BY_DOCUMENT", "C-100.24", PROGRESSION_CHECKS.NOT_ATTESTED_BY_DOCUMENT.translation, E1, "sb"]);
  assert.equal((await T(w, [{ stage: "need", captureSha: "sa", event: "EVT-2026-cccccccccccccccc" }])).code, "NOT_ATTESTED_BY_DOCUMENT");
  // a dated fact of another capture: events' one answer (its R7; K1568 (3)), field for field
  assert.deepEqual(await T(w, [{ stage: "need", captureSha: "sa", datedFact: "DF-B" }]),
                   noSuchDatedFact("DF-B", { stage_key: "need", capture_sha: "sa" }));
  assert.equal((await T(w, [{ stage: "bid", captureSha: "sa", event: "nope" }])).code, "BAD_STAGE");          // R6's order first
  assert.equal((await T(w, [{ stage: "need", captureSha: "zz", datedFact: "nope" }])).code, "NOT_CONCERNED");
  assert.deepEqual(w.snapshot(), before);
  // negative controls: the attested event and the capture's own dated fact are written with the placement
  const ok = await T(w, [{ stage: "need", captureSha: "sa", event: E1 }, { stage: "award", captureSha: "sb", datedFact: "DF-B" }]);
  assert.equal(ok.ok, true);
  assert.deepEqual(w.rows(`SELECT stage_key, event_id, dated_fact_id FROM progression_instances ORDER BY stage_key`),
    [{ stage_key: "award", event_id: null, dated_fact_id: "DF-B" }, { stage_key: "need", event_id: E1, dated_fact_id: null }]);
  assert.deepEqual(ok.threads[0].placements.map((p) => [p.stage_key, p.event_id, p.dated_fact_id]),
    [["award", null, "DF-B"], ["need", E1, null]]);
});

test("R37 R10: each placement's own date and its source on read: the event's when, the named or only dated fact, or none with why; never the capture's instants", async () => {
  const w = seeded();
  w.define();
  w.event(E1, { start: "2026-02-03T10:30", end: null, precision: "minute", zone: "Europe/Paris" }, ["sa"]);
  w.fact("sb", "2026-02-04", "DF-B");
  w.fact("sc", "2026-02-05", "DF-C1");
  w.fact("sc", "2026-02-06", "DF-C2");
  for (const s of ["sa", "sb", "sc", "sd"]) { w.dates.reading[s] = "2026-08-01T00:00:00Z"; w.dates.registered[s] = "2026-08-02T00:00:00Z"; }
  await T(w, [{ stage: "need", captureSha: "sa", event: E1 }, { stage: "award", captureSha: "sb" },
              { stage: "contract", captureSha: "sc" }, { stage: "contract", captureSha: "sd" }]);
  const r = R(w);
  const view = (sha) => { const d = docOf(r, sha); return [d.own_date, d.own_date_source, d.own_date_ref]; };
  assert.deepEqual(view("sa"), [{ value: "2026-02-03T10:30", precision: "minute", zone: "Europe/Paris" }, "event", E1]);
  assert.deepEqual(view("sb"), [{ value: "2026-02-04", precision: "day", zone: ZONE }, "dated_fact", "DF-B"]);   // the one held
  assert.deepEqual(view("sc").slice(0, 2), [null, "none"]);
  assert.match(docOf(r, "sc").own_date_why, /2 dated facts/);
  assert.deepEqual(view("sd").slice(0, 2), [null, "none"]);
  assert.match(docOf(r, "sd").own_date_why, /no dated fact/);
  assert.doesNotMatch(JSON.stringify(r.stages), /2026-08-0[12]/);   // no registration or reading instant is a date
  // named: the member's choice of one of several
  await T(w, [{ stage: "contract", captureSha: "sc", datedFact: "DF-C2" }]);
  assert.deepEqual(docOf(R(w), "sc").own_date.value, "2026-02-06");
  // read on every read, never stored: the event's when moves, the read follows; an event placed nowhere has none
  w.ev.events.get(E1).when = { start: "2026-02-01", end: null, precision: "day", zone: ZONE };
  await T(w, [{ stage: "need", captureSha: "sa", event: E1 }]);
  assert.equal(docOf(R(w), "sa").own_date.value, "2026-02-01");
  w.ev.events.get(E1).when = null;
  assert.match(docOf(R(w), "sa").own_date_why, /placed nowhere/);
  const cols = w.rows(`PRAGMA table_info(progression_instances)`).map((c) => c.name);
  for (const c of ["own_date", "when", "date", "value"]) assert.ok(!cols.includes(c), c);
});

test("R38: a stage dated before the stage it is after is out_of_order, naming both placements; settled by civil-time.compare at the dates' precision, else order_undetermined with why", async () => {
  const w = seeded();
  w.define();
  const dated = async (need, award, extra = {}) => {
    w.ev.facts.clear();
    if (need) w.fact("sa", need.value || need, "DF-A", need.value ? need : {});
    if (award) w.fact("sb", award.value || award, "DF-B", award.value ? award : {});
    await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb" }], extra.entity);
    return R(w);
  };
  // "payment before award": the award (after need) dated before the need
  const r = await dated("2026-03-10", "2026-03-01");
  const f = r.findings.filter((x) => x.kind === "out_of_order");
  assert.equal(f.length, 1);
  assert.deepEqual([f[0].stage_key, f[0].after_stage, f[0].dischargeable, f[0].definition_version, f[0].grade],
                   ["award", "need", false, 1, r.grade]);
  assert.deepEqual(f[0].placements.map((p) => [p.stage_key, p.capture_sha, p.own_date.value]),
                   [["need", "sa", "2026-03-10"], ["award", "sb", "2026-03-01"]]);
  assert.equal(r.finding_count, r.findings.length);
  // in order: no finding, nothing undetermined
  const ok = await dated("2026-03-01", "2026-03-10");
  assert.deepEqual([ok.findings.filter((x) => x.kind === "out_of_order").length, ok.undetermined_checks.length], [0, 0]);
  // not settled: equal values at their precision, a coarser precision (a band), a date missing
  for (const [need, award, re] of [["2026-03-01", "2026-03-01", /both are 2026-03-01/],
                                   [{ value: "2026-03", precision: "edtf" }, "2026-03-05", /overlap/],
                                   [null, "2026-03-05", /has no own date/]]) {
    const u = await dated(need, award);
    assert.equal(u.findings.filter((x) => x.kind === "out_of_order").length, 0, JSON.stringify(need));
    const o = u.undetermined_checks.filter((x) => x.kind === "order_undetermined");
    assert.equal(o.length, 1);
    assert.match(o[0].why, re);
    assert.deepEqual(o[0].placements.map((p) => p.capture_sha), ["sa", "sb"]);
  }
  // R12: a decision about (progression, stage) governs it like every finding, and it stays published
  await dated("2026-03-10", "2026-03-01");
  w.p.disposeProposal({ key: "proc::award", to: "dismissed", reason: "dates as printed", definitionVersion: 1, decidedBy: "member:alice" });
  const d = R(w).findings.find((x) => x.kind === "out_of_order");
  assert.equal(d.disposition.applies, true);
  assert.equal(R(w).open_finding_count, R(w).findings.filter((x) => !(x.disposition && x.disposition.applies)).length);
});

test("R32 R31: the amount-free junction checks: a stage dated past its term after its predecessor is placed_after_term; undetermined dates are never a finding; one response where one is admitted is R31's", async () => {
  const w = seeded();
  w.define();                                    // award: within 30 days after need (its term)
  w.fact("sa", "2026-01-10", "DF-A");
  const award = async (value, extra = {}) => {
    w.ev.facts.set("sb", []);
    w.fact("sb", value, "DF-B", extra);
    await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb" }]);
    return R(w);
  };
  // the term ends 2026-02-09: on its last day is within, the next day is after
  assert.deepEqual((await award("2026-02-09")).findings.filter((x) => x.kind === "placed_after_term"), []);
  const late = (await award("2026-02-10")).findings.filter((x) => x.kind === "placed_after_term");
  assert.equal(late.length, 1);
  assert.deepEqual([late[0].stage_key, late[0].after_stage, late[0].term_ends, late[0].within_interval, late[0].dischargeable],
                   ["award", "need", "2026-02-09", "30 days", false]);
  assert.deepEqual(late[0].placements.map((p) => [p.capture_sha, p.own_date.value]), [["sa", "2026-01-10"], ["sb", "2026-02-10"]]);
  // a band across the term's end, or a date missing: undetermined with why, never a finding
  const band = await award("2026-02", { precision: "edtf" });
  assert.deepEqual(band.findings.filter((x) => x.kind === "placed_after_term"), []);
  assert.match(band.undetermined_checks.find((x) => x.kind === "term_undetermined").why, /overlaps the term's last day/);
  w.ev.facts.delete("sb");
  await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb" }]);
  const none = R(w);
  assert.deepEqual(none.findings.filter((x) => x.kind === "placed_after_term"), []);
  assert.match(none.undetermined_checks.find((x) => x.kind === "term_undetermined").why, /no own date/);
  // a predecessor with no own date: the term is undetermined too
  w.ev.facts.delete("sa");
  w.fact("sb", "2026-09-01", "DF-B");
  assert.match(R(w).undetermined_checks.find((x) => x.kind === "term_undetermined").why, /has no own date/);
  // one response where a stage admits one: R31's finding (no amount is read here; amounts are money-checks')
  w.fact("sa", "2026-01-10", "DF-A");
  const two = await T(w, [{ stage: "need", captureSha: "sa" }, { stage: "award", captureSha: "sb" }, { stage: "award", captureSha: "sc" }]);
  assert.deepEqual(two.findings.filter((x) => x.kind === "cardinality_exceeded").map((x) => x.stage_key), ["award"]);
  // neither check is aggregated into proposals (queue words every proposal as a required stage absent); both are
  // open findings of their instance
  await award("2026-03-01");
  const feed = w.p.proposalsFeed(Date.parse("2026-03-02T00:00:00Z"));
  assert.ok(!feed.proposals.some((p) => p.stage_key === "award"));
  assert.ok(feed.instances[0].findings.some((x) => x.kind === "placed_after_term"));
  // derived on read, never stored (R24)
  for (const t of w.rows(`SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'progression%'`).map((x) => x.name))
    for (const c of w.rows(`PRAGMA table_info(${t})`).map((x) => x.name)) assert.ok(!/order|term|junction/.test(c), `${t}.${c}`);
});
