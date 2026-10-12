/* consequences R17–R21, R23 (T45; N855 6c; Actions D6c; v0.2 §3 Success record, rules 1, 16): the success record, a
   member's statement of what changed and when, on evidence, with figures computed as R2 computes a part, a sequence that
   is never a cause, a cause only on evidence other than the group's own act; read, listed and revised; never a
   consequence part. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import { noSuchProject } from "../../../src/membership/index.mjs";
import { CONSEQUENCES_CHECKS, SUCCESS_LIMITS, SEQUENCE_NOT_CAUSE, CAUSE_NOT_STATED, isSuccessDate, consequencesWords }
  from "../../../src/consequences/index.mjs";

const S = "STD-2026-0001-law";
const INQ = "INQ-2026-0001-found";
const SENT = "INFO-2026-0050-our-letter";

function setup() {
  const w = world();
  w.D = w.determination("CONF-2026-0001-act", w.P, { [S]: "noncompliant" });
  w.cid = w.figure("INFO-2026-0001-report", "The City published both reports; restored 1,000");
  w.other = w.figure("INFO-2026-0002-minutes", "Council minutes: restored 2,500");
  w.ours = w.figure(SENT, "Our demand of 6 Nov");
  w.inquiryAt(INQ, "open", { target: "INFO-2026-0001-report" });
  /* The own-act reader `actions` registers (its R97): here, the content of our own letter is the group's own act. */
  w.ownIds = new Set([w.ours]);
  w.c.registerOwnActReader(({ ids }) => ids.filter((x) => w.ownIds.has(x)));
  w.base = { project: w.P, matter: { plan: "PLN-2026-0001", matter: "M1" }, statement: "The City published both reports",
             changed_on: "2026-05-14", evidence: [w.cid], author: V("alice") };
  w.rec = (over = {}) => w.c.successRecord({ ...w.base, ...over });
  return w;
}

const isPromise = (x) => !!x && typeof x.then === "function";

test("R17: a success record lands; each refusal holds in the requirement's order, writing nothing, with a negative control", () => {
  const w = setup();
  const ok = w.rec();
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.match(ok.id, /^SUC-2026-\d{4}$/);
  /* Each case breaks one thing and everything after it, so the first refusal named must win. */
  const bad = { statement: " ", changed_on: "2026-02-31", evidence: [], figures: [{ label: "x", value: 1 }],
                cause: { statement: "" }, sequence: "s".repeat(1001) };
  const cases = [
    ["MACHINE_CANNOT_RECORD_SUCCESS", { author: MACHINE, project: "PROJ-none", ...bad }],
    ["MACHINE_CANNOT_RECORD_SUCCESS", { author: "", ...bad }],
    ["NO_SUCH_PROJECT", { project: "PROJ-2026-0999-none", author: V("bob"), ...bad }],
    ["NO_SUCH_PROJECT", { author: V("bob"), ...bad }],
    ["NO_SUCH_PROJECT", { author: V("carol"), ...bad }],
    ["SUCCESS_NO_STATEMENT", { ...bad }],
    ["SUCCESS_NO_STATEMENT", { ...bad, statement: "x".repeat(2001) }],
    ["SUCCESS_BAD_DATE", { ...bad, statement: "ok" }],
    ["SUCCESS_NO_EVIDENCE", { ...bad, statement: "ok", changed_on: "2026-05-14" }],
    ["SUCCESS_NO_EVIDENCE", { ...bad, statement: "ok", changed_on: "2026-05-14", evidence: [w.cid, "INQ-2026-0099-none"] }],
    ["SUCCESS_FIGURE_NOT_COMPUTED", { ...bad, statement: "ok", changed_on: "2026-05-14", evidence: [w.cid] }],
    ["SUCCESS_CAUSE_UNSTATED", { ...bad, statement: "ok", changed_on: "2026-05-14", evidence: [w.cid], figures: [] }],
    ["SUCCESS_TOO_LARGE", { ...bad, statement: "ok", changed_on: "2026-05-14", evidence: [w.cid], figures: [], cause: null }],
  ];
  for (const [code, over] of cases) {
    const before = w.snapshot();
    const r = w.rec(over);
    assert.equal(r.reason, code, `${code}: ${JSON.stringify(r)}`);
    if (code === "NO_SUCH_PROJECT") assert.deepEqual(r, noSuchProject(over.project ?? w.P), "membership's one answer");
    else assert.deepEqual([r.check, r.translation], [CONSEQUENCES_CHECKS[code].check, CONSEQUENCES_CHECKS[code].translation]);
    assert.deepEqual(w.snapshot(), before, `${code} writes nothing`);
  }
  /* SUCCESS_NOT_A_PARTICIPANT: carol, invited and not joined, sees P whole and has not joined it. */
  w.invite("carol");
  const before = w.snapshot();
  const carol = w.rec({ author: V("carol") });
  assert.equal(carol.reason, "SUCCESS_NOT_A_PARTICIPANT");
  assert.deepEqual(w.snapshot(), before);
  /* SUCCESS_TOO_LARGE names the part and its cap: 51 evidence items, 21 figures, a sequence of 1,001 characters. */
  const many = Array.from({ length: 51 }, (_, i) => (i % 2 ? w.cid : w.other));
  const fig = { label: "restored", basis: { op: "sum", operands: [{ content: w.cid, figure: "1,000" }] } };
  for (const [over, part, cap] of [[{ evidence: many }, "evidence", 50], [{ figures: Array(21).fill(fig) }, "figures", 20],
                                   [{ sequence: "s".repeat(1001) }, "sequence", 1000]]) {
    const r = w.rec(over);
    assert.deepEqual([r.reason, r.part, r.cap], ["SUCCESS_TOO_LARGE", part, cap], part);
  }
  assert.deepEqual(SUCCESS_LIMITS, { evidence: 50, figures: 20, sequence: 1000 });
  /* Controls at each cap: 50 items, 20 figures, 1,000 characters, a 2,000-character statement; pat, who has joined. */
  assert.equal(w.rec({ evidence: many.slice(0, 50), figures: Array(20).fill(fig), sequence: "s".repeat(1000),
                       statement: "x".repeat(2000) }).ok, true);
  assert.equal(w.rec({ author: V("pat") }).ok, true);
  /* A finding is evidence too; a document id is not (its content is cited by content id). */
  assert.equal(w.rec({ evidence: [INQ] }).ok, true);
  assert.equal(w.rec({ evidence: ["INFO-2026-0001-report"] }).reason, "SUCCESS_NO_EVIDENCE");
  /* The rows are the next numbers of C-114, in the Rows line's order. */
  const rows = ["MACHINE_CANNOT_RECORD_SUCCESS", "SUCCESS_NOT_A_PARTICIPANT", "SUCCESS_NO_STATEMENT", "SUCCESS_BAD_DATE",
    "SUCCESS_NO_EVIDENCE", "SUCCESS_TOO_LARGE", "SUCCESS_FIGURE_NOT_COMPUTED", "SUCCESS_CAUSE_UNSTATED",
    "SUCCESS_CAUSE_NOT_EVIDENCED", "SUCCESS_CAUSE_OWN_ACT_ONLY", "SUCCESS_CAUSE_UNCHECKABLE", "NO_SUCH_SUCCESS_RECORD",
    "SUCCESS_NO_REASON", "SUCCESS_BAD_REASON", "SUCCESS_SUPERSEDED", "MACHINE_CANNOT_CARRY"];
  assert.deepEqual(rows.map((c) => CONSEQUENCES_CHECKS[c].check), rows.map((_, i) => `C-114.${27 + i}`));
});

test("R17: changed_on is a real calendar date (civil-time) or an EDTF band, the date the change took place", () => {
  const w = setup();
  for (const d of ["2026-05-14", "2024-02-29", "2026-05", "2026", "2026-05-14/2026-06-01", "2026-05-XX", "2026-05-14?",
                   "2026-21"])
    assert.equal(w.rec({ changed_on: d }).ok, true, d);
  for (const d of ["2026-02-31", "2026-13-01", "14 May 2026", "", null, 20260514, "2026-05-14T10:00", "{2026,2027}"]) {
    assert.equal(w.rec({ changed_on: d }).reason, "SUCCESS_BAD_DATE", String(d));
    assert.equal(isSuccessDate(d), false, String(d));
  }
  /* matter is stored as given and never read: answered back whole. */
  const r = w.rec({ matter: { plan: "PLN-x", matter: "anything", extra: [1] } });
  assert.deepEqual(r.success.matter, { plan: "PLN-x", matter: "anything", extra: [1] });
});

test("R18: a figure is computed exactly as R2 computes a part, its operands shown, the weakest grade named; never stated", async () => {
  const w = setup();
  const arch = w.figure("INFO-2026-0003-arch", "Restored 0.2", "example.org/arch", "archive.org");
  const tenth = w.figure("INFO-2026-0004-tenth", "Restored 0.1");
  const r = w.rec({ figures: [
    { label: "restored in total", basis: { op: "sum", operands: [{ content: tenth, figure: "0.1" }, { content: arch, figure: "0.2" }] } },
    { label: "difference", basis: { op: "difference", operands: [{ content: w.other, figure: "2,500" }, { content: w.cid, figure: "1,000" }] } },
  ] });
  assert.equal(r.ok, true, JSON.stringify(r));
  const [sum, diff] = r.success.figures;
  assert.deepEqual([sum.state, sum.value, sum.grade.grade], ["computed", "0.3", "C"], "0.1 + 0.2 is 0.3 exactly");
  assert.match(sum.grade.why, /weakest operand is 1/);
  assert.deepEqual(sum.operands.map((o) => [o.kind, o.content, o.value, o.grade]), [["content", tenth, "0.1", "B"], ["content", arch, "0.2", "C"]]);
  assert.equal(diff.value, "1500");
  assert.equal(sum.label_says.machine_work, false);
  /* A money fact and a calculation output are operands too (R2's three kinds); a calculation answers a promise. */
  const f1 = w.fact({ amount: "1250000.50" });
  const calc = await w.calculation([f1]);
  const p = w.rec({ figures: [{ label: "paid", basis: { op: "sum", operands: [{ calculation: calc, key: "total" }, { money: f1 }] } }] });
  assert.equal(isPromise(p), true);
  const pr = await p;
  assert.deepEqual([pr.success.figures[0].value, pr.success.figures[0].currency], ["2500001.00", "USD"]);
  /* An operand not in the record: undetermined with why, never zero. */
  const u = w.rec({ figures: [{ label: "missing", basis: { op: "sum", operands: [{ content: w.cid, figure: "9,999" }] } }] });
  assert.deepEqual([u.success.figures[0].state, u.success.figures[0].undetermined.code, "value" in u.success.figures[0]],
                   ["undetermined", "not_in_record", false]);
  /* Refusals, each writing nothing: a stated value or range; no computation; R2's own (UNIT_MISMATCH, BASIS_UNREADABLE). */
  const usd = w.figure("INFO-2026-0005-usd", "Cut $1,000");
  const eur = w.figure("INFO-2026-0006-eur", "Cut €500");
  const cases = [
    ["SUCCESS_FIGURE_NOT_COMPUTED", [{ label: "said", value: "1000" }]],
    ["SUCCESS_FIGURE_NOT_COMPUTED", [{ label: "said", range: { low: 1, high: 2 } }]],
    ["SUCCESS_FIGURE_NOT_COMPUTED", [{ label: "said", basis: { op: "sum", operands: [{ content: w.cid, figure: "1,000" }], value: "5" } }]],
    ["SUCCESS_FIGURE_NOT_COMPUTED", [{ label: "said", basis: { rationale: "trust me" } }]],
    ["UNIT_MISMATCH", [{ label: "mixed", basis: { op: "sum", operands: [{ content: usd, figure: "$1,000" }, { content: eur, figure: "€500" }] } }]],
    ["BASIS_UNREADABLE", [{ label: "x", basis: { op: "median", operands: [] } }]],
    ["BASIS_UNREADABLE", [{ basis: { op: "sum", operands: [{ content: w.cid, figure: "1,000" }] } }]],
    ["BASIS_UNREADABLE", "not a list"],
  ];
  for (const [code, figures] of cases) {
    const before = w.snapshot();
    assert.equal(w.rec({ figures }).reason, code, JSON.stringify(figures));
    assert.deepEqual(w.snapshot(), before);
  }
  /* A machine may compute a figure for a member to adopt, labelled machine work, and never records the record. */
  const m = w.c.successFigure({ label: "restored", basis: { op: "sum", operands: [{ content: w.cid, figure: "1,000" }] }, author: MACHINE });
  assert.deepEqual([m.ok, m.figure.value, m.figure.label_says.machine_work], [true, "1000", true]);
  assert.equal(w.rec({ author: MACHINE, figures: [m.figure] }).reason, "MACHINE_CANNOT_RECORD_SUCCESS");
  /* The member adopts it: its computation is recomputed, never taken from the machine's value. */
  const adopted = w.rec({ figures: [{ label: m.figure.label, basis: m.figure.basis }] });
  assert.deepEqual([adopted.ok, adopted.success.figures[0].value, adopted.success.figures[0].label_says.machine_work], [true, "1000", false]);
});

test("R19: a sequence is never a cause; a cause rests on evidence other than the group's own act, or is refused", () => {
  const w = setup();
  /* A sequence, answered with its sentence; no cause, answered null with its sentence. */
  const seq = w.rec({ sequence: "After our demand of 6 Nov, the City published both reports on 14 May" });
  /* R25 (T46): each sentence answered with its key and words.json's words for it (t46.test.mjs proves the words). */
  assert.deepEqual(seq.success.sequence, { text: "After our demand of 6 Nov, the City published both reports on 14 May",
                                           key: SEQUENCE_NOT_CAUSE, says: consequencesWords(SEQUENCE_NOT_CAUSE) });
  assert.deepEqual([seq.success.cause, seq.success.cause_key, seq.success.cause_says],
                   [null, CAUSE_NOT_STATED, consequencesWords(CAUSE_NOT_STATED)]);
  assert.deepEqual([SEQUENCE_NOT_CAUSE, CAUSE_NOT_STATED], ["consequences.success.sequence_not_cause", "consequences.success.cause_not_stated"]);
  /* Refusals, each writing nothing. */
  const cases = [
    ["SUCCESS_CAUSE_UNSTATED", { evidence: [w.cid] }], ["SUCCESS_CAUSE_UNSTATED", { statement: " ", evidence: [w.cid] }],
    ["SUCCESS_CAUSE_UNSTATED", { statement: "x".repeat(2001), evidence: [w.cid] }], ["SUCCESS_CAUSE_UNSTATED", "our demand"],
    ["SUCCESS_CAUSE_NOT_EVIDENCED", { statement: "our demand did it" }],
    ["SUCCESS_CAUSE_NOT_EVIDENCED", { statement: "our demand did it", evidence: [] }],
    ["SUCCESS_CAUSE_NOT_EVIDENCED", { statement: "our demand did it", evidence: ["INQ-2026-0099-none"] }],
    ["SUCCESS_CAUSE_NOT_EVIDENCED", { statement: "our demand did it", evidence: Array(51).fill(w.cid) }],
    ["SUCCESS_CAUSE_OWN_ACT_ONLY", { statement: "our demand did it", evidence: [w.ours] }],
  ];
  for (const [code, cause] of cases) {
    const before = w.snapshot();
    const r = w.rec({ cause });
    assert.equal(r.reason, code, `${code} ${JSON.stringify(r)}`);
    assert.deepEqual([r.check, r.translation], [CONSEQUENCES_CHECKS[code].check, CONSEQUENCES_CHECKS[code].translation]);
    assert.deepEqual(w.snapshot(), before);
  }
  /* Control: the same cause with one evidence item that is not the group's own act lands, and is answered. */
  const ok = w.rec({ cause: { statement: "our demand did it", evidence: [w.ours, w.other] } });
  assert.equal(ok.ok, true, JSON.stringify(ok));
  assert.deepEqual(ok.success.cause, { statement: "our demand did it", evidence: [w.ours, w.other] });
  assert.equal("cause_says" in ok.success || "cause_key" in ok.success, false);
  /* The reader is asked with the ids and the viewer. */
  let asked = null;
  const w2 = world();
  const cid = w2.figure("INFO-2026-0001-r", "Restored");
  w2.c.registerOwnActReader((a) => { asked = a; return []; });
  assert.equal(w2.c.successRecord({ project: w2.P, statement: "s", changed_on: "2026-05-14", evidence: [cid],
    cause: { statement: "c", evidence: [cid] }, author: V("alice") }).ok, true);
  assert.deepEqual(asked, { ids: [cid], viewer: V("alice") });
});

test("R19: with no own-act reader registered, or one that throws or answers no list, a cause is SUCCESS_CAUSE_UNCHECKABLE; the reader registers once", () => {
  const w = world();
  const cid = w.figure("INFO-2026-0001-r", "Restored");
  const rec = (c) => c.successRecord({ project: w.P, statement: "s", changed_on: "2026-05-14", evidence: [cid],
                                       cause: { statement: "c", evidence: [cid] }, author: V("alice") });
  const before = w.snapshot();
  assert.equal(rec(w.c).reason, "SUCCESS_CAUSE_UNCHECKABLE", "no reader registered");
  assert.deepEqual(w.snapshot(), before);
  /* Without a cause, a success record needs no reader. */
  assert.equal(w.c.successRecord({ project: w.P, statement: "s", changed_on: "2026-05-14", evidence: [cid], author: V("alice") }).ok, true);
  for (const fn of [() => { throw new Error("cannot read"); }, () => null, () => "no"]) {
    const w2 = world();
    const c2 = w2.figure("INFO-2026-0001-r", "Restored");
    assert.equal(w2.c.registerOwnActReader(fn).ok, true);
    assert.equal(w2.c.successRecord({ project: w2.P, statement: "s", changed_on: "2026-05-14", evidence: [c2],
      cause: { statement: "c", evidence: [c2] }, author: V("alice") }).reason, "SUCCESS_CAUSE_UNCHECKABLE", String(fn));
  }
  /* One registration: a second is membership's LISTENER_DECLARED; a malformed one LISTENER_MALFORMED. */
  assert.equal(w.c.registerOwnActReader("not a function").reason, "LISTENER_MALFORMED");
  assert.equal(w.c.registerOwnActReader(() => []).ok, true);
  assert.equal(w.c.registerOwnActReader(() => []).reason, "LISTENER_DECLARED");
  assert.equal(rec(w.c).ok, true, "a reader answering none of the ids: the cause lands");
});

test("R20: successRecordRead answers the fields, figures, sequence, cause, author, time, links and carries; absent and unseen are one answer", () => {
  const w = setup();
  const r = w.rec({ sequence: "first this, then that", cause: { statement: "our demand did it", evidence: [w.other] },
    figures: [{ label: "restored", basis: { op: "sum", operands: [{ content: w.cid, figure: "1,000" }] } }] });
  const got = w.c.successRecordRead({ id: r.id, viewer: V("alice") });
  assert.equal(got.ok, true);
  const s = got.success;
  assert.deepEqual([s.id, s.project, s.matter, s.statement, s.changed_on, s.evidence, s.author, s.at, s.live, s.supersedes,
                    s.superseded_by, s.carries],
                   [r.id, w.P, w.base.matter, w.base.statement, "2026-05-14", [w.cid], V("alice"), "2026-09-28T01:00:00Z", true,
                    null, null, []]);
  assert.deepEqual([s.figures[0].value, s.figures[0].grade.grade, s.sequence.text, s.cause.statement],
                   ["1000", "B", "first this, then that", "our demand did it"]);
  assert.equal("out_of_view" in s, false);
  assert.deepEqual(got, w.c.successRecordRead({ id: r.id, viewer: V("pat") }), "pat, joined, sees the same");
  /* Absent, and in a project the viewer may not see (bob; carol at EXISTENCE): one answer. */
  const absent = w.c.successRecordRead({ id: "SUC-2026-9999", viewer: V("alice") });
  assert.equal(absent.reason, "NO_SUCH_SUCCESS_RECORD");
  for (const v of ["bob", "carol"]) {
    const u = w.c.successRecordRead({ id: r.id, viewer: V(v) });
    assert.deepEqual({ ...u, id: null }, { ...absent, id: null }, v);
  }
  /* R15's rule: what pat may not see is withheld whole, `out_of_view: true`, everything else standing. */
  const HID = "INFO-2026-0002-minutes";
  const r2 = w.rec({ evidence: [w.cid, w.other], cause: { statement: "c", evidence: [w.other, w.cid] },
    figures: [{ label: "both", basis: { op: "sum", operands: [{ content: w.other, figure: "2,500" }, { content: w.cid, figure: "1,000" }] } }] });
  const c = w.sighted(new Set([HID]));
  const pat = c.successRecordRead({ id: r2.id, viewer: V("pat") }).success;
  const alice = c.successRecordRead({ id: r2.id, viewer: V("alice") }).success;
  assert.deepEqual([pat.evidence, pat.cause.evidence, pat.figures[0].operands.map((o) => o.content), pat.out_of_view],
                   [[w.cid], [w.cid], [w.cid], true]);
  assert.equal(JSON.stringify(pat).includes(w.other), false, "the withheld id is nowhere");
  assert.deepEqual([pat.figures[0].value, pat.figures[0].grade.grade, pat.statement], [alice.figures[0].value, "B", alice.statement]);
  assert.doesNotMatch(pat.figures[0].grade.why, /operand (is )?\d+ \(/);
  assert.equal("out_of_view" in alice, false);
});

test("R20: successRecordsFor lists the live records the viewer may see, by project or matter, 200 a page in id order, truncated by reading one past", () => {
  const w = setup();
  const ids = [];
  for (let i = 0; i < 5; i++) ids.push(w.rec({ matter: { plan: "PLN-1", matter: i % 2 ? "odd" : "even" } }).id);
  const rev = w.c.successRevise({ id: ids[0], statement: "restated", reason: "worded better", author: V("alice") });
  assert.equal(rev.ok, true, JSON.stringify(rev));
  const live = [...ids.slice(1), rev.id].sort();
  const all = w.c.successRecordsFor({ project: w.P, viewer: V("alice") });
  assert.deepEqual([all.records.map((x) => x.id), all.truncated], [live, false]);
  assert.deepEqual(w.c.successRecordsFor({ viewer: V("alice") }).records.map((x) => x.id), live, "every project alice sees");
  const odd = w.c.successRecordsFor({ matter: { matter: "odd", plan: "PLN-1" }, viewer: V("alice") });
  assert.deepEqual(odd.records.map((x) => x.id), [ids[1], ids[3]].sort());
  const page = w.c.successRecordsFor({ project: w.P, limit: 2, viewer: V("alice") });
  assert.deepEqual([page.records.map((x) => x.id), page.truncated], [live.slice(0, 2), true]);
  const rest = w.c.successRecordsFor({ project: w.P, after: page.next, limit: 200, viewer: V("alice") });
  assert.deepEqual([rest.records.map((x) => x.id), rest.truncated], [live.slice(2), false]);
  assert.equal(w.c.successRecordsFor({ project: w.P, limit: 1000, viewer: V("alice") }).records.length, live.length);
  /* The page bound: 201 live records read 200 and truncated. */
  const many = world();
  const cid = many.figure("INFO-2026-0001-r", "Restored");
  for (let i = 0; i < 201; i++) many.c.successRecord({ project: many.P, statement: `s${i}`, changed_on: "2026-05-14", evidence: [cid], author: V("alice") });
  const big = many.c.successRecordsFor({ project: many.P, viewer: V("alice") });
  assert.deepEqual([big.records.length, big.truncated], [200, true]);
  /* bob sees no record of P: the project is membership's one answer, and the open listing lists none. */
  assert.deepEqual(w.c.successRecordsFor({ project: w.P, viewer: V("bob") }), noSuchProject(w.P));
  assert.deepEqual(w.c.successRecordsFor({ viewer: V("bob") }).records, []);
});

test("R21: a success record is never edited; a revision is a successor with a reason, and a second successor is refused", () => {
  const w = setup();
  const first = w.rec();
  const snap = JSON.stringify(w.c.successRecordRead({ id: first.id, viewer: V("alice") }).success.statement);
  const cases = [
    ["MACHINE_CANNOT_RECORD_SUCCESS", { author: MACHINE }],
    ["NO_SUCH_SUCCESS_RECORD", { id: "SUC-2026-9999" }], ["NO_SUCH_SUCCESS_RECORD", { author: V("bob") }],
    ["SUCCESS_NO_REASON", { reason: " " }], ["SUCCESS_NO_REASON", { reason: undefined }],
    ["SUCCESS_BAD_REASON", { reason: "x".repeat(2001) }],
    ["SUCCESS_BAD_DATE", { changed_on: "yesterday" }], ["SUCCESS_NO_EVIDENCE", { evidence: [] }],
  ];
  const good = { id: first.id, statement: "restated", reason: "worded better", author: V("alice") };
  for (const [code, over] of cases) {
    const before = w.snapshot();
    assert.equal(w.c.successRevise({ ...good, ...over }).reason, code, code);
    assert.deepEqual(w.snapshot(), before);
  }
  const rev = w.c.successRevise(good);
  assert.equal(rev.ok, true, JSON.stringify(rev));
  assert.deepEqual([rev.success.supersedes, rev.success.reason, rev.success.statement, rev.success.changed_on, rev.success.evidence],
                   [first.id, "worded better", "restated", "2026-05-14", [w.cid]], "the rest is carried");
  const old = w.c.successRecordRead({ id: first.id, viewer: V("alice") }).success;
  assert.deepEqual([old.superseded_by, old.live, JSON.stringify(old.statement)], [rev.id, false, snap], "the earlier one stands, linked");
  const second = w.c.successRevise(good);
  assert.deepEqual([second.reason, second.superseded_by], ["SUCCESS_SUPERSEDED", rev.id]);
  assert.equal(w.c.successRevise({ ...good, id: rev.id, reason: "again" }).ok, true);
  /* Figures are recomputed from their computations on revision. */
  const f = w.rec({ figures: [{ label: "r", basis: { op: "sum", operands: [{ content: w.cid, figure: "1,000" }] } }] });
  const fr = w.c.successRevise({ id: f.id, reason: "date fixed", changed_on: "2026-05-15", author: V("alice") });
  assert.deepEqual([fr.success.figures[0].value, fr.success.changed_on], ["1000", "2026-05-15"]);
  /* The row is never rewritten. */
  assert.equal(w.rows(`SELECT statement FROM success_records WHERE id=?`, first.id)[0].statement, w.base.statement);
});

test("R23: a success record is never a consequence part; no answer carries a significance or a percentage of success; append-only and declared to purge", () => {
  const w = setup();
  const part = w.c.consequenceRecord({ determination: w.D, standard: S, affected: { kind: "fund", description: "f" },
    period: { from: "2026-01-01", to: "2026-06-30" }, measure: { unit: "money", value: 10 }, basis: { rationale: "r" }, author: V("alice") });
  const s = w.rec({ figures: [{ label: "r", basis: { op: "ratio", operands: [{ content: w.cid, figure: "1,000" }, { content: w.other, figure: "2,500" }] } }] });
  assert.equal(s.ok, true);
  /* Control: the project holding both answers consequencesOf and addressed with the part alone. */
  const of = w.c.consequencesOf({ determination: w.D, viewer: V("alice") });
  assert.deepEqual([of.parts.map((p) => p.id), of.totals.flatMap((t) => t.parts), of.undetermined, of.unproven], [[part.id], [part.id], [], [part.id]]);
  assert.deepEqual(w.c.addressed({ determination: w.D, viewer: V("alice") }).parts.map((p) => p.id), [part.id]);
  assert.equal(JSON.stringify(of).includes(s.id), false);
  assert.equal(w.rows(`SELECT 1 FROM consequence_parts WHERE bundle_id=?`, s.id).length, 0);
  /* R1 keeps CONSEQUENCE_NOT_NONCOMPLIANT: a compliant outcome is no breach, whatever success is recorded. */
  const C = w.determination("CONF-2026-0002-ok", w.P, { [S]: "compliant" });
  assert.equal(w.c.consequenceRecord({ determination: C, standard: S, affected: { kind: "fund", description: "f" },
    period: { from: "2026-01-01", to: "2026-06-30" }, measure: { unit: "money", value: 10 }, basis: { rationale: "r" },
    author: V("alice") }).reason, "CONSEQUENCE_NOT_NONCOMPLIANT");
  /* No key of a success record's answers ranks it; a key a caller adds is not taken. */
  const odd = w.rec({ significance: "high", score: 9, percent_success: 80 });
  const keys = new Set();
  const walk = (v) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { keys.add(k.toLowerCase()); walk(x); } };
  walk([s, odd, w.c.successRecordRead({ id: s.id, viewer: V("alice") }), w.c.successRecordsFor({ project: w.P, viewer: V("alice") })]);
  for (const k of keys) assert.equal(/significance|severity|priority|score|percent|rank/.test(k), false, k);
  /* Append-only rows, declared to purge; a purge of a record's id clears its rows and only its rows. */
  const before = w.rows(`SELECT * FROM success_records WHERE id=?`, s.id)[0];
  w.c.successRevise({ id: s.id, reason: "r", statement: "again", author: V("alice") });
  assert.deepEqual(w.rows(`SELECT * FROM success_records WHERE id=?`, s.id)[0], before);
  assert.equal(w.record.declarePurge("other", ["success_records"]).reason, "TABLE_DECLARED");
  assert.equal(w.record.declarePurge("other", ["consequence_carries"]).reason, "TABLE_DECLARED");
  w.record.purge({ bundleId: odd.id });
  assert.deepEqual([w.rows(`SELECT 1 FROM success_records WHERE id=?`, odd.id).length,
                    w.rows(`SELECT 1 FROM success_records WHERE id=?`, s.id).length], [0, 1]);
});
