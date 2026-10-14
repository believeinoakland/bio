/* consequences R22 (T45; Actions D5, D6c; the plan's reconciliation R3): one member's act carries a success, a harm
   addressed or a cure into a case's next edition, only through case-inputs' `carryOutcome` (its R9; case-authoring's R71
   before T47, N908), passing the text and the cites alone, so a carried outcome never states a cause; each carry is
   appended to the record carried. The first three tests drive the fixture's recording stand-in; the last drives the
   one real case-inputs instance on the host, as the module reaches it (`caseInputsOf`, T47). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { CONSEQUENCES_CHECKS, CARRY_KINDS, Consequences } from "../../../src/consequences/index.mjs";
import { caseInputsOf } from "../../../src/case-inputs/index.mjs";

const S = "STD-2026-0001-law";
const CASE = "CASE-2026-0001";
const INQ = "INQ-2026-0001-found";

function setup() {
  const w = world();
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.cid = w.figure("INFO-2026-0001-report", "Restored 1,000");
  w.other = w.figure("INFO-2026-0002-minutes", "Council minutes");
  w.inquiryAt(INQ, "open", { target: "INFO-2026-0001-report" });
  w.c.registerOwnActReader(() => []);
  w.success = w.c.successRecord({ project: w.P, statement: "The City published both reports", changed_on: "2026-05-14",
    evidence: [w.cid, INQ], sequence: "after our demand, they published",
    cause: { statement: "our demand caused it", evidence: [w.other] },
    figures: [{ label: "restored", basis: { op: "sum", operands: [{ content: w.cid, figure: "1,000" }] } }], author: V("alice") });
  assert.equal(w.success.ok, true, JSON.stringify(w.success));
  const p = w.c.consequenceRecord({ determination: w.D, standard: S, affected: { kind: "fund", description: "the fund" },
    period: { from: "2026-01-01", to: "2026-06-30" }, measure: { unit: "money", value: 10 }, basis: { rationale: "r" }, author: V("alice") });
  w.part = p.id;
  w.clock.now = "2026-06-02T10:00:00Z";
  w.c.addressedRecord({ id: w.part, state: "addressed", evidence: [w.cid], reason: "the fund was restored in full",
                        words: ["remedied"], author: V("alice") });
  /* A cure: a later compliant act of the same office, linked by a member (conformance R36, R37). */
  w.C = w.determination("CONF-2026-0002-cure", w.P, { [S]: "compliant" }, { when: "2026-05-20", findings: [INQ] });
  w.cures.set(`${w.D}|${S}`, { link: "CURE-1", cure: w.C, standard: S, by: V("alice"), at: "2026-06-01T00:00:00Z", cure_standing: true });
  w.carry = (carry, over = {}) => w.c.outcomeCarry({ carry, case: CASE, author: V("alice"), ...over });
  return w;
}

test("R22: each of the three kinds carries through carryOutcome, text and cites alone; a success's cause, figures and sequence never pass", () => {
  const w = setup();
  const s = w.carry({ success: w.success.id });
  assert.deepEqual(s, { ok: true, outcome: "OUT-2026-0001" }, "carryOutcome's answer");
  const a = w.carry({ addressed: w.part });
  const c = w.carry({ cure: { determination: w.D, standard: S } }, { text: "The office published the report as the law requires" });
  assert.deepEqual([a.ok, c.ok], [true, true], JSON.stringify([a, c]));
  assert.deepEqual(w.carried, [
    { case: CASE, kind: "success", text: "The City published both reports",
      cites: [{ kind: "passage", ref: w.cid }, { kind: "finding", ref: INQ }], on: "2026-05-14", by: "alice" },
    { case: CASE, kind: "harm_addressed", text: "the fund was restored in full", cites: [{ kind: "passage", ref: w.cid }],
      on: "2026-06-02", by: "alice" },
    { case: CASE, kind: "cure", text: "The office published the report as the law requires", cites: [{ kind: "finding", ref: INQ }],
      on: "2026-05-20", by: "alice" },
  ]);
  assert.deepEqual(CARRY_KINDS, { success: "success", addressed: "harm_addressed", cure: "cure" });
  /* Control: the success record has a cause; nothing of it, its figures or its sequence was passed. */
  const passed = JSON.stringify(w.carried);
  for (const word of ["our demand caused it", w.other, "after our demand", "restored\""]) assert.equal(passed.includes(word), false, word);
  /* Each carry is appended to the record carried and answered by its read. */
  assert.deepEqual(w.c.successRecordRead({ id: w.success.id, viewer: V("alice") }).success.carries,
                   [{ carried: "OUT-2026-0001", kind: "success", case: CASE, by: V("alice"), at: "2026-06-02T10:00:00Z" }]);
  assert.deepEqual(w.rows(`SELECT record_id, kind, ref, outcome FROM consequence_carries ORDER BY seq`).map((r) => Object.values(r)),
                   [[w.success.id, "success", null, "OUT-2026-0001"], [w.part, "harm_addressed", null, "OUT-2026-0002"],
                    [w.D, "cure", S, "OUT-2026-0003"]]);
});

test("R22: refusals in order, each writing nothing; carryOutcome's refusals passed through", () => {
  const w = setup();
  const rev = w.c.successRevise({ id: w.success.id, reason: "restated", statement: "restated", author: V("alice") });
  const Dn = w.determination("CONF-2026-0003-none", w.P, { [S]: "noncompliant" });
  const p2 = w.c.consequenceRecord({ determination: w.D, standard: S, affected: { kind: "fund", description: "g" },
    period: { from: "2026-01-01", to: "2026-06-30" }, measure: { unit: "money", value: 3 }, basis: { rationale: "r" }, author: V("alice") });
  w.c.addressedRecord({ id: p2.id, state: "not_addressed", reason: "not yet", author: V("alice") });
  const p3 = w.c.consequenceRecord({ determination: w.D, standard: S, affected: { kind: "fund", description: "h" },
    period: { from: "2026-01-01", to: "2026-06-30" }, measure: { unit: "money", value: 3 }, basis: { rationale: "r" }, author: V("alice") });
  w.cures.set(`${Dn}|${S}`, { link: "CURE-2", cure: w.C, standard: S, cure_standing: false });
  const cases = [
    ["MACHINE_CANNOT_CARRY", { success: "nothing" }, { author: MACHINE }],
    ["MACHINE_CANNOT_CARRY", { success: w.success.id }, { author: "" }],
    ["NO_SUCH_SUCCESS_RECORD", { success: "SUC-2026-9999" }],
    ["NO_SUCH_SUCCESS_RECORD", { success: rev.id }, { author: V("bob") }],
    ["NO_SUCH_SUCCESS_RECORD", {}], ["NO_SUCH_SUCCESS_RECORD", { success: rev.id, addressed: w.part }],
    ["SUCCESS_SUPERSEDED", { success: w.success.id }],
    ["NO_SUCH_PART", { addressed: "CONS-2026-0999-fund" }],
    ["NO_SUCH_PART", { addressed: w.part }, { author: V("bob") }],
    ["CARRY_NOT_ADDRESSED", { addressed: p2.id }], ["CARRY_NOT_ADDRESSED", { addressed: p3.id }],
    ["NO_SUCH_DETERMINATION", { cure: { determination: "CONF-2026-0099-x", standard: S } }],
    ["CARRY_NO_CURE", { cure: { determination: w.D, standard: "STD-2026-0099-other" } }],
    ["CARRY_NO_CURE", { cure: { determination: Dn, standard: S } }],
    ["CARRY_NO_CURE", { cure: { determination: w.D } }],
    /* carryOutcome's own refusals, passed through whole. */
    ["NO_SUCH_CASE", { success: rev.id }, { case: "CASE-2026-0099" }],
    ["BAD_CARRIED_OUTCOME", { cure: { determination: w.D, standard: S } }, { text: undefined }],
    ["BAD_CARRIED_OUTCOME", { cure: { determination: w.D, standard: S } }, { text: 'he said "fixed"' }],
  ];
  for (const [code, carry, over = {}] of cases) {
    const before = w.snapshot();
    const r = w.carry(carry, over);
    assert.equal(r.reason, code, `${code} ${JSON.stringify(carry)} ${JSON.stringify(r)}`);
    if (CONSEQUENCES_CHECKS[code]) assert.deepEqual([r.check, r.translation], [CONSEQUENCES_CHECKS[code].check, CONSEQUENCES_CHECKS[code].translation]);
    assert.deepEqual(w.snapshot(), before, `${code} writes nothing`);
  }
  assert.deepEqual(w.carry({ cure: { determination: "CONF-2026-0099-x", standard: S } }),
                   { ok: false, reason: "NO_SUCH_DETERMINATION", determination: "CONF-2026-0099-x" }, "conformance's answer, whole");
  assert.deepEqual(["MACHINE_CANNOT_CARRY", "CARRY_NOT_ADDRESSED", "CARRY_NO_CURE"].map((c) => CONSEQUENCES_CHECKS[c].check),
                   ["C-114.42", "C-114.43", "C-114.44"]);
  assert.equal(w.carried.length, 0);
  /* Controls: the live successor carries; an addressed part carries; a standing cure carries. */
  assert.equal(w.carry({ success: rev.id }).ok, true);
  w.c.addressedRecord({ id: p2.id, state: "addressed", evidence: [w.cid], reason: "now restored", author: V("alice") });
  assert.equal(w.carry({ addressed: p2.id }).ok, true);
  assert.equal(w.carry({ cure: { determination: w.D, standard: S } }, { text: "cured" }).ok, true);
  assert.deepEqual(w.carried.map((c) => c.kind), ["success", "harm_addressed", "cure"]);
});

test("R22: a carry changes the case only through carryOutcome; when it refuses, nothing of this module is written", () => {
  const w = setup();
  const before = w.snapshot();
  w.noCases.add(CASE);
  for (const carry of [{ success: w.success.id }, { addressed: w.part }])
    assert.equal(w.carry(carry).reason, "NO_SUCH_CASE");
  assert.deepEqual(w.snapshot(), before);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM consequence_carries`)[0].n, 0);
  /* A determination absent to the author reads as conformance answers it, never as a cure. */
  assert.deepEqual(w.carry({ cure: { determination: w.D, standard: S } }, { author: V("bob"), text: "t" }).reason, "NO_SUCH_DETERMINATION");
});

/* publication R40's `cases` and `case_documents` (publication's schema, its columns copied as a stand-in: publication is not this module's use): whether a case has a ratified edition, its project, and which
   outcomes a ratified edition's document holds. */
const CASES_DDL = `CREATE TABLE IF NOT EXISTS cases (case_id TEXT PRIMARY KEY, project_id TEXT NOT NULL, opened TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS case_documents (case_id TEXT NOT NULL, edition INTEGER NOT NULL, doc_sha TEXT NOT NULL,
    text TEXT NOT NULL, authored_at TEXT NOT NULL, authored_by TEXT, sig_armored TEXT, attestor_key TEXT,
    attestor_member TEXT, delivered_by TEXT, gate_version TEXT, ratified_at TEXT, draft_id TEXT, PRIMARY KEY (case_id, edition))`;

test("R22 (T47, N908): carryOutcome is reached on the one case-inputs instance for the host (caseInputsOf); its refusals and answer pass through unchanged", () => {
  const w = setup();
  w.st.db.exec(CASES_DDL);
  w.st.sql.exec(`INSERT INTO cases (case_id, project_id, opened) VALUES (?,?,?)`, CASE, w.P, "2026-05-01T00:00:00Z");
  w.invite("carol");
  /* The module with no case-inputs given: it reaches the host's one instance, the same every caller gets. */
  const { caseInputs, ...deps } = w.deps;
  const c = new Consequences({ ...deps, storage: w.st, host: w.host });
  const ci = caseInputsOf(w.host);
  const direct = (over) => ({ case: CASE, kind: "cure", text: "cured", cites: [{ kind: "finding", ref: INQ }], on: "2026-05-20",
                              by: "alice", ...over });
  const carry = (carry, over = {}) => c.outcomeCarry({ carry, case: CASE, author: V("alice"), ...over });
  /* Its refusals, passed through unchanged: each equals the answer case-inputs gives the same call, and writes nothing. */
  const refusals = [
    ["NO_SUCH_CASE", () => carry({ success: w.success.id }, { case: "CASE-2026-0099" }), direct({ case: "CASE-2026-0099" })],
    ["CARRY_NOT_A_PARTICIPANT", () => carry({ success: w.success.id }, { author: V("carol") }), direct({ by: "carol" })],
    ["BAD_CARRIED_OUTCOME", () => carry({ cure: { determination: w.D, standard: S } }, { text: 'he said "fixed"' }),
     direct({ text: 'he said "fixed"' })],
    ["BAD_CARRIED_OUTCOME", () => carry({ cure: { determination: w.D, standard: S } }, { text: undefined }), direct({ text: undefined })],
  ];
  for (const [code, act, call] of refusals) {
    const before = w.snapshot();
    const r = act();
    assert.equal(r.reason, code, JSON.stringify(r));
    assert.deepEqual(r, ci.carryOutcome(call), `${code}: case-inputs' answer, whole`);
    assert.deepEqual(w.snapshot(), before, `${code} writes nothing`);
  }
  assert.deepEqual(ci.pendingOutcomes(CASE), []);
  /* Control: each of the three kinds carries; the answer is case-inputs', and the outcome is pending on its one instance. */
  const s = carry({ success: w.success.id });
  const a = carry({ addressed: w.part });
  const k = carry({ cure: { determination: w.D, standard: S } }, { text: "The office published the report" });
  for (const r of [s, a, k]) assert.deepEqual(Object.keys(r).sort(), ["ok", "outcome"], JSON.stringify(r));
  assert.ok([s, a, k].every((r) => r.ok === true && /^OUTC/.test(r.outcome)));
  const pending = caseInputsOf(w.host).pendingOutcomes(CASE);
  assert.deepEqual(pending.map((o) => [o.outcome, o.kind, o.text, o.on, o.carried_by]), [
    [s.outcome, "success", "The City published both reports", "2026-05-14", "alice"],
    [a.outcome, "harm_addressed", "the fund was restored in full", "2026-06-02", "alice"],
    [k.outcome, "cure", "The office published the report", "2026-05-20", "alice"]]);
  /* Only text and cites passed: the success record's cause, figures and sequence are nowhere in what case-inputs holds. */
  const held = JSON.stringify(pending);
  for (const word of ["our demand caused it", w.other, "after our demand"]) assert.equal(held.includes(word), false, word);
  assert.deepEqual(c.successRecordRead({ id: w.success.id, viewer: V("alice") }).success.carries.map((x) => x.carried), [s.outcome]);
  assert.equal(w.carried.length, 0, "the fixture's stand-in was not called");
});
