/* contradiction T33-48: the key K6 (two amounts for one transfer; ladders §5C.4) through R5, R7, R8, R10, R11, R14, R24,
   R25, R28 and R35, over the real `money` (its read contract R19 and `reconcile` R11); and R9's own dates as R25's
   `{entity}` order reads them. Driven at the module's interface over a record laid down in the fixture. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, k4World, sha, MACHINE, MEMBER, OUTSIDER } from "./fixture.mjs";
import { RUN, PRINCIPAL, M1 } from "./seed.mjs";
import { CONTRADICTION_ABSENCE, CONTRADICTION_KEYS, renderJudgementInput, JUDGEMENT_PROMPT } from "../../../src/contradiction/index.mjs";

const byKey = (r, k) => r.keys.find((x) => x.key === k);
const MA = "MNY-2026-aaaaaaaaaaaaaaaa", MB = "MNY-2026-bbbbbbbbbbbbbbbb", MC = "MNY-2026-cccccccccccccccc";
const k6 = (w, viewer = MACHINE, limit = null) => w.c.pairs({ key: "K6", viewer, limit });

/* Two facts for one transfer whose amounts differ: the same payer and payee, payment, actual, paid, over 2026. */
function transfer(a = {}, b = {}, opts) {
  const w = world(opts);
  w.runs.set(RUN, { status: "running", principal: PRINCIPAL });
  w.fact(MA, { amount: "100", content: "ma", ...a });
  w.fact(MB, { amount: "150", content: "mb", bundle: "INFO-2026-0902", ...b });
  return w;
}

test("R8 K6: two money facts with the same payer and payee entities, kind, phase and stage, over overlapping periods, whose amounts money's reconciliation finds differ, are one pair with money sides", () => {
  const w = transfer();
  const r = k6(w);
  assert.equal(r.ok, true);
  const k = byKey(r, "K6");
  assert.deepEqual([k.ran, k.formed, k.truncated, k.absence, k.undetermined, k.consistent], [true, 1, false, null, 0, 0]);
  for (const f of ["key", "name", "feeds", "join", "why"]) assert.equal(k[f], CONTRADICTION_KEYS.K6[f]);
  assert.equal(CONTRADICTION_KEYS.K6.name, "two amounts for one transfer");
  const p = r.pairs[0];
  assert.deepEqual([p.key, p.payer, p.payee], ["K6", "E-PAYER", "E-PAYEE"]);
  assert.deepEqual(Object.keys(p.a).sort(), ["amount", "capture_sha", "fact", "kind", "period", "ref", "stage"]);
  assert.deepEqual(p.a, { kind: "money", fact: MA, capture_sha: w.one(`SELECT source_capture_sha AS c FROM money_facts WHERE fact_id=?`, MA).c,
                          ref: "ref of ma", amount: { value: "100", currency: "USD", precision: "exact", as_read: "100" },
                          period: { from: "2026-01-01", to: "2026-12-31", precision: "day", zone: "UTC" }, stage: "paid" });
  assert.equal(p.b.fact, MB);
  /* money's differing dimensions travel with the pair, so a basis, period or rounding difference can be seen */
  assert.deepEqual(p.differs, [{ dimension: "amount", a: "100", b: "150" }]);
  /* counted once, never once from each side */
  assert.equal(r.pairs_formed, 1);
  /* a period that overlaps without being equal, and a basis that differs, are carried as money names them */
  const q = transfer({ basis: "budgetary" }, { period: { from: "2026-03-01", to: "2026-03-31" } });
  const d = k6(q).pairs[0].differs.map((x) => x.dimension);
  assert.deepEqual(d, ["basis", "period", "amount"]);
  /* a fact read from another money fact names the capture its source rests on */
  const s = transfer({}, { content: null, capture: null });
  s.st.sql.exec(`UPDATE money_facts SET source_capture_sha=NULL, source_fact=? WHERE fact_id=?`, MA, MB);
  const root = s.one(`SELECT source_capture_sha AS c FROM money_facts WHERE fact_id=?`, MA).c;
  assert.deepEqual([k6(s).pairs[0].b.capture_sha, k6(s).pairs[0].b.ref], [root, `money fact ${MA}`]);
});

test("R8 K6: no pair where the two are not one transfer — another payer or payee, a fund for an entity, another kind, phase or stage, periods apart, a withdrawn fact — or where the amounts agree within the coarser figure", () => {
  const none = (a, b, what) => assert.equal(byKey(k6(transfer(a, b)), "K6").formed, 0, what);
  none({}, { to: "E-OTHER" }, "another payee");
  none({}, { from: "E-OTHER" }, "another payer");
  none({ to: null }, { to: null }, "the payee a fund, not an entity");
  none({}, { kind: "transfer" }, "another kind");
  none({}, { phase: "adopted", stage: null }, "another phase");
  none({}, { stage: "incurred" }, "another stage");
  none({}, { period: { from: "2027-01-01", to: "2027-12-31" } }, "periods apart");
  none({ period: { from: "2026-01-01", to: "2026-06-30" } }, { period: { from: "2026-07-01", to: "2026-12-31" } }, "adjacent periods do not overlap");
  none({}, { withdrawn: true }, "a withdrawn fact");
  /* equal amounts that differ only in basis are not two amounts */
  const basis = transfer({}, { amount: "100", basis: "accrual" });
  assert.deepEqual([byKey(k6(basis), "K6").formed, byKey(k6(basis), "K6").consistent], [0, 1]);
  /* "about 2 million" and 2,097,431 agree within the coarser figure's precision */
  const about = transfer({ amount: "2000000", precision: "rounded" }, { amount: "2097431" });
  const k = byKey(k6(about), "K6");
  assert.deepEqual([k.formed, k.consistent, k.absence.level], [0, 1, "shared_transfer"]);
  assert.match(k.notes.join(" "), /reconciliation finds their amounts consistent/);
  /* a range that holds the other figure agrees; one that does not differs */
  assert.equal(byKey(k6(transfer({ precision: "range", low: "90", high: "160" }, {})), "K6").formed, 0);
  assert.equal(byKey(k6(transfer({ precision: "range", low: "90", high: "120" }, {})), "K6").formed, 1);
});

test("R8, R9 K6: a period whose end is not stated does not settle the overlap — the pair is not formed, counted undetermined and noted", () => {
  const w = transfer({}, { period: { from: "2026-06-01", to: null } });
  const r = k6(w);
  const k = byKey(r, "K6");
  assert.deepEqual([k.formed, k.undetermined], [0, 1]);
  assert.match(k.notes[0], /period states no end/);
  assert.match(r.says, /1 further pair\(s\) were NOT formed/);
  assert.equal(k.absence.level, "shared_transfer");
});

test("R10 K6: a pair is formed only when both facts and their sources are visible to the viewer; an absent viewer compares nothing", () => {
  const w = world();
  w.inquiry("PROJ-2026-0001", { project: true });
  w.fact(MA); w.fact(MB, { amount: "150", bundle: "PROJ-2026-0001" });
  assert.equal(byKey(k6(w, MEMBER), "K6").formed, 1);
  const out = byKey(k6(w, OUTSIDER), "K6");
  assert.deepEqual([out.formed, out.absence.level], [0, "same_parties"]);
  for (const viewer of [null, "", "somebody"]) {
    const r = k6(w, viewer);
    assert.deepEqual([r.viewer_scope, byKey(r, "K6").absence.level, byKey(r, "K6").levels], ["DENY", "viewer", [{ level: "viewer", present: false }]]);
  }
});

test("R11 K6: a key that formed nothing names the first empty rung — money fact, same parties, same stage and period, differing amount — each under the viewer gate, else shared_transfer, each sentence from the one table", () => {
  const level = (w, viewer = MACHINE) => byKey(k6(w, viewer), "K6").absence?.level ?? null;
  const w = world();
  assert.equal(level(w), "money_fact");
  w.fact(MA);
  assert.equal(level(w), "same_parties");
  w.fact(MB, { kind: "transfer" });
  assert.equal(level(w), "same_stage_period");
  w.fact(MC, { amount: "100" });
  assert.equal(level(w), "differing_amount");
  const v = world();
  v.fact(MA, { amount: "2000000", precision: "rounded" }); v.fact(MB, { amount: "2097431" });
  assert.equal(level(v), "shared_transfer");
  /* the rungs are under the gate: a fact the outsider may not see is not a fact for them */
  const g = world();
  g.inquiry("PROJ-2026-0001", { project: true });
  g.fact(MA, { bundle: "PROJ-2026-0001" });
  assert.deepEqual([level(g, MEMBER), level(g, OUTSIDER)], ["same_parties", "money_fact"]);
  for (const x of [w, v, g]) for (const k of ["money_fact", "same_parties", "same_stage_period", "differing_amount", "shared_transfer"])
    assert.equal(typeof CONTRADICTION_ABSENCE[k], "string", k);
  const r = k6(v);
  assert.equal(byKey(r, "K6").absence.says, CONTRADICTION_ABSENCE.shared_transfer);
  /* a store without money's facts names its first rung, never a bare zero */
  const bare = world();
  bare.st.sql.exec(`DROP TABLE money_facts`);
  const b = byKey(k6(bare), "K6");
  assert.deepEqual([b.formed, b.absence.level], [0, "money_fact"]);
  assert.match(b.notes[0], /not held in this store/);
});

test("R7 K6: truncation is observed by reading one past the bound", () => {
  const w = world();
  const ids = ["a", "b", "c"].map((x) => `MNY-2026-${x.repeat(16)}`);
  ids.forEach((id, i) => w.fact(id, { amount: String(100 + i) }));
  const at3 = byKey(k6(w, MACHINE, 3), "K6");
  assert.deepEqual([at3.formed, at3.truncated], [3, false]);
  const at2 = byKey(k6(w, MACHINE, 2), "K6");
  assert.deepEqual([at2.formed, at2.truncated], [2, true]);
});

test("R13–R15 K6: a K6 pair is proposed like any other; its side is the fact, versioned by the digest of what was compared, and lives where its source does", () => {
  const w = transfer();
  const p = k6(w).pairs[0];
  const r = w.c.propose({ run: RUN, proposedBy: "class:ai/t", viewer: MACHINE, caller: PRINCIPAL,
                          proposals: [{ key: "K6", a: p.a, b: p.b, label: "world", reason: "two sources disagree on the payment" }] });
  assert.deepEqual([r.ok, r.written], [true, 1]);
  const c = r.candidates[0];
  assert.deepEqual([c.a_kind, c.a_ref, c.a_bundle_id, c.b_ref, c.b_bundle_id], ["money", MA, "INFO-2026-0901", MB, "INFO-2026-0902"]);
  assert.match(c.a_version, /^[0-9a-f]{64}$/);
  /* a figure changed since pairing is a different referent: the proposal is refused */
  const forged = { ...p.a, amount: { ...p.a.amount, value: "101" } };
  assert.equal(w.c.propose({ run: RUN, proposedBy: "class:ai/t", viewer: MACHINE, caller: PRINCIPAL,
                             proposals: [{ key: "K6", a: forged, b: p.b, label: "world", reason: "r" }] }).code, "CANDIDATE_PAIR_NOT_FORMED");
  /* a purge of either fact's source bundle takes the candidate */
  w.record.purge({ bundleId: "INFO-2026-0902" });
  assert.equal(w.count("contradiction_candidates"), 0);
});

test("R24, R25, R27, R30, R58 K6 (K1601): until its prompt arm is measured (N579) every K6 candidate is withheld — not_shown, counted as unmeasured with why, putting no mark, offering no act and no connection", () => {
  const A = "INFO-2026-0901-ledger", B = "INFO-2026-0902-report";
  const w = transfer({ bundle: A, content: sha("ma") }, { bundle: B, content: sha("mb") });
  const p = k6(w).pairs[0];
  for (const label of ["world", "record", "undetermined"]) {
    const id = w.c.propose({ run: RUN, proposedBy: "class:ai/t", viewer: MACHINE, caller: PRINCIPAL,
      proposals: [{ key: "K6", a: p.a, b: p.b, label, reason: `labelled ${label}` }] }).candidates[0].candidate;
    const r = w.c.candidatesFor({ on: { candidate: id }, viewer: M1 });
    assert.deepEqual([r.candidates, r.empty.level, r.empty.unmeasured, r.unmeasured_why, r.unmeasured_by_key],
                     [[], "none_shown", 1, "k6_gate_unmeasured", { K6: 1 }], label);
  }
  const id = w.one(`SELECT candidate FROM contradiction_candidates LIMIT 1`).candidate;
  for (const on of [{ entity: "E-PAYEE" }, { entity: "E-PAYER" }, { bundle: A }]) {
    const r = w.c.candidatesFor({ on, viewer: M1 });
    assert.deepEqual([r.candidates.length, r.empty.level, r.unmeasured], [0, "none_shown", 1], JSON.stringify(on));
  }
  /* R27: no mark; R30: no act; R58: no connection */
  const ref = { ref: MA, version: w.one(`SELECT a_version AS v FROM contradiction_candidates WHERE candidate=?`, id).v };
  assert.deepEqual(w.c.tensionsOn({ referents: [ref], viewer: M1 }).referents[0].marks, []);
  assert.equal(w.c.takeUp({ candidate: id, question: "Which amount was paid?", frame: "a", viewer: M1, author: M1 }).code, "NO_SUCH_CANDIDATE");
  assert.equal(w.c.dismiss({ candidate: id, reason: "not_same_matter", viewer: M1, author: M1 }).code, "NO_SUCH_CANDIDATE");
  assert.deepEqual(w.c.neighbours({ node: MA, at: "2026-10-06", viewer: M1, scope: null }), { items: [] });
  /* R28: the facts a member would weigh are still the record's, with money's reconciliation, never machine work */
  const f = w.c.contextFacts({ candidate: id, viewer: M1 });
  assert.equal(f.ok, true);
  assert.ok(f.facts.every((x) => x.source === "record" && x.machine_work === false));
  const rec = f.facts.find((x) => x.fact === "reconciliation");
  assert.deepEqual([rec.consistent, rec.amounts, rec.differs], [false, "differ", [{ dimension: "amount", a: "100", b: "150" }]]);
  assert.deepEqual(f.facts.find((x) => x.fact === "parties").a, ["E-PAYER", "E-PAYEE"]);
  assert.equal(f.facts.find((x) => x.fact === "accounting_period").undetermined, undefined);
  /* R10: an invisible fact makes it no candidate at all for that viewer */
  w.inquiry("PROJ-2026-0001", { project: true });
  w.st.sql.exec(`UPDATE money_facts SET sight_bundle='PROJ-2026-0001' WHERE fact_id=?`, MB);
  assert.equal(w.c.candidatesFor({ on: { candidate: id }, viewer: OUTSIDER }).empty.level, "none_judged");
  assert.equal(w.c.contextFacts({ candidate: id, viewer: OUTSIDER }).code, "NO_SUCH_CANDIDATE");
});

test.todo("R24, R25, R27, R35, R58 K6 shown: weighted as K4's, shown about its payer and payee, marked on the fact, taken up as legs on the documents its figures were read from, and presented at its facts — reached the day its prompt arm is measured (N579, K1601)");

test("R3, R4 K6: the judgement's words are unchanged — a money side renders none of R3's fields, and the input is the pinned prompt", () => {
  const w = transfer();
  const p = k6(w).pairs[0];
  const input = renderJudgementInput([p]);
  assert.ok(input.startsWith(JUDGEMENT_PROMPT));
  assert.match(input, /PAIR 1 · key K6\n {2}A: \{\}\n {2}B: \{\}/);
});

test("R25, R9: {entity} answers in the own date of the earlier-dated side compared by civil-time — the same date together, an unsettled order apart with the undated, never placed by guess", () => {
  const w = k4World({ contentType: "rule", date: "2026-01-01" }, { contentType: "act", date: "2026-06-01" });
  w.runs.set(RUN, { status: "running", principal: PRINCIPAL });
  const doc = (n, cap, info, ord, reading) => { w.content(n, cap, info); w.leg("INQ-2026-0001", ord, "supports", { content: n });
                                                w.resolution(cap, info, "E1"); w.reading(cap, info, reading); };
  doc("cc", "capC", "INFO-2026-0003", 2, { contentType: "memo", date: "2025-03-01" });
  doc("cd", "capD", "INFO-2026-0004", 3, { contentType: "order" });
  doc("ce", "capE", "INFO-2026-0005", 4, { contentType: "letter", date: "2026", precision: "edtf" });
  const pairs = w.c.pairs({ key: "K4", viewer: MACHINE }).pairs;
  const ids = {};
  for (const p of pairs) {
    const name = [p.a.capture_sha, p.b.capture_sha].map((c) => c.slice(-1)).sort().join("");
    ids[name] = w.c.propose({ run: RUN, proposedBy: "class:ai/t", viewer: MACHINE, caller: PRINCIPAL,
                              proposals: [{ key: "K4", a: p.a, b: p.b, label: "world", reason: "r" }] }).candidates[0].candidate;
  }
  assert.equal(Object.keys(ids).length, 10);
  const r = w.c.candidatesFor({ on: { entity: "E1" }, viewer: M1 });
  const order = r.candidates.map((c) => Object.keys(ids).find((k) => ids[k] === c.candidate));
  /* 2025-03-01 (AC, BC, CD, CE: C is earlier than every other, the band 2026 included), then 2026-01-01 (AB, AD), then
     2026-06-01 (BD); AE and BE fall inside the band 2026, so their earlier side is unsettled; DE's only date is the band,
     which overlaps 2026-01-01 and 2026-06-01 and is the coarser, so it leaves the line; nothing is undated */
  const sorted = (xs) => [...xs].sort((x, y) => (ids[x] < ids[y] ? -1 : 1));
  assert.deepEqual(order.slice(0, 4), sorted(["AC", "BC", "CD", "CE"]));
  assert.deepEqual(order.slice(4, 6), sorted(["AB", "AD"]));
  assert.deepEqual(order.slice(6, 7), ["BD"]);
  assert.deepEqual(new Set(order.slice(7)), new Set(["AE", "BE", "DE"]));
  assert.deepEqual([r.undated, r.order_undetermined], [0, 3]);
});
