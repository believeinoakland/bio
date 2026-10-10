/* R17 (N820; K2405, K2417, K2418, K2484, K2525): the investigation's items, each told once and keyed as its source says,
   over the real providers on their own test worlds: `steps` (its R12 `stepsDue`, R14 `costShares`, R15 `costMessages`,
   R23 `laterFound`), `investigation` (its R3 `milestonesOverdue`, R18 `quietPrompts`), `question-explorer` (its R5
   `findsFor`, with ai-use R6's `enabled_by` for the paying account's owners, D64) and `review` (its R33
   `reviewCommentsLeftOut`). Each with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world as stepsWorld, ANN, BOB, CAT, DAN, OUT, P1, P2, PH, PD, Q, Q2 } from "../steps/fixture.mjs";
import { world as invWorld, P1 as IP1, Q1 as IQ1, ANN as IANN, BOB as IBOB, OUT as IOUT, DAN as IDAN } from "../investigation/fixture.mjs";
import { world as qeWorld, Q as QQ, PROJ, CAP, CALLER } from "../question-explorer/fixture.mjs";
import { standard as reviewStandard, P as RP, Q as RQ, V, SECRET } from "../review/fixture.mjs";
import { fresh, reader, ofKind, sentences, texts } from "./fixture.mjs";
import { NOTICE_KINDS, HINT_MARK, INVESTIGATION_ITEMS_MAX } from "../../../src/notice-producers/index.mjs";
import { NOTICE_WORDS } from "../../../src/notice-producers/words.mjs";

const UTC = () => ({ time_zone: { value: "UTC" } });
const duties = (st) => st.sql.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);   /* duties' table, empty (R5) */
const bare = (v) => v.replace(/^member:/, "");
/* This module over one provider world: `deps` the real providers, a read as `viewer` at `now`. */
function over(w, deps) {
  duties(w.st);
  const n = fresh(w.host, { membership: w.membership, view: UTC, ...deps });
  const { read } = reader(n);
  return (viewer, kind, now) => ofKind(read(bare(viewer), { now: Date.parse(now) }), kind);
}
const check = (it, cls, kind, key) => {
  assert.equal(it.id, key.startsWith(`${cls}::${kind}::`) ? key : `${cls}::${kind}::${key}`, "keyed as its source says");
  assert.equal(it.class, cls);
  assert.equal(NOTICE_KINDS[kind], cls, "the class queue R1 takes for it");
};

test("R17 step-later-found: one FINDING per entry steps.laterFound answers, keyed by its key, to each it answers and to nobody else; told once", () => {
  const w = stepsWorld();
  const items = over(w, { steps: w.s });
  w.draw(Q, P1);
  const id = w.step({ by: CAT });
  const look = { actor_class: "member", actor: CAT, authority_kind: "step", authority: id, level: "document",
                 subject_kind: "address", subject: "https://example.org/contract.pdf", detail: "not posted" };
  w.observationLog.observe({ ...look, state: "LOOKED_ABSENT" });
  const at = "2026-10-09T18:00:00Z";
  assert.deepEqual(items(ANN, "step-later-found", at), [], "negative control: nothing has arrived");
  w.bundle("INFO-2026-0001-doc", { type: "information" });
  w.capture("c".repeat(64), "INFO-2026-0001-doc");
  w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: "INFO-2026-0001-doc", level: "document",
    subject_kind: "address", subject: "https://example.org/contract.pdf", state: "PRESENT", result_kind: "capture", result_ref: "c".repeat(64), detail: "new" });
  const later = "2026-12-01T00:00:00Z";
  for (const v of [ANN, BOB, CAT]) {
    const [it] = items(v, "step-later-found", later);
    const [e] = w.s.laterFound({ viewer: v, at: later }).found;
    check(it, "FINDING", "step-later-found", e.key);
    assert.deepEqual(it.recipients, [bare(v)]);
    assert.equal(it.subject.id, id);
  }
  assert.deepEqual(items(OUT, "step-later-found", later), [], "not a recipient and not the doer");
  assert.deepEqual(items(ANN, "step-later-found", later).map((i) => i.id), items(ANN, "step-later-found", later).map((i) => i.id), "the same key: told once");
});

test("R17 step-date-due and step-reminder: OBLIGATIONs from steps.stepsDue, keyed by its key, to the member who set the date or asked for the reminder and to nobody else", () => {
  const w = stepsWorld();
  const items = over(w, { steps: w.s });
  w.clock = "2026-10-10T06:30:00.000Z";
  const past = w.step({ work: "past", byWhen: { date: "2026-10-08", basis: "law" } });
  const today = w.step({ work: "today", byWhen: { date: "2026-10-09", basis: "law" } });
  const at = "2026-10-10T06:30:00Z";
  const [d] = items(ANN, "step-date-due", at);
  check(d, "OBLIGATION", "step-date-due", w.s.stepsDue({ viewer: ANN, at }).due[0].key);
  assert.equal(d.subject.id, past);
  assert.equal(d.due, "2026-10-08");
  assert.deepEqual(d.recipients, ["ann"]);
  assert.deepEqual(items(BOB, "step-date-due", at), [], "negative control: not the member who set it");
  assert.ok(items(ANN, "step-date-due", "2026-10-11T06:30:00Z").map((i) => i.id).includes(d.id), "stable per step and date");
  assert.equal(w.s.stepReminder({ step: today, at: "2026-10-12", by: BOB }).ok, true);
  assert.deepEqual(items(BOB, "step-reminder", "2026-10-11T18:00:00Z"), [], "negative control: before its day");
  const [r] = items(BOB, "step-reminder", "2026-10-12T18:00:00Z");
  check(r, "OBLIGATION", "step-reminder", w.s.stepsDue({ viewer: BOB, at: "2026-10-12T18:00:00Z" }).due[0].key);
  assert.deepEqual(r.recipients, ["bob"]);
  assert.deepEqual(items(ANN, "step-reminder", "2026-10-12T18:00:00Z"), [], "hers alone");
});

test("R17 step-cost-shared and step-cost-message: FINDINGs from steps.costShares and costMessages, to the sharing projects' owners and to whom a message was relayed; nothing when a sharing project is hidden", () => {
  const w = stepsWorld();
  const items = over(w, { steps: w.s });
  const at = "2026-10-09T18:00:00Z";
  const id = w.step({ place: { questions: [Q, Q2] } });
  w.s.stepCostAdd({ step: id, kind: "fee", amount: "40", currency: "USD", what: "records fee", by: ANN });
  w.draw(Q, P1);
  assert.deepEqual(items(ANN, "step-cost-shared", at), [], "negative control: one project draws");
  w.draw(Q2, P2);
  const key = w.s.costShares({ viewer: ANN }).shares[0].key;
  for (const v of [ANN, BOB]) {
    const [it] = items(v, "step-cost-shared", at);
    check(it, "FINDING", "step-cost-shared", key);
    assert.deepEqual(it.subject.projects.map((p) => p.name), ["Project One", "Project Two"]);
    assert.match(it.detail, /40 USD/);
  }
  assert.deepEqual(items(DAN, "step-cost-shared", at), [], "not an owner of either");
  const r = w.s.costMessage({ step: id, text: "Shall we split it?", by: ANN });
  assert.equal(r.ok, true);
  const [m] = items(BOB, "step-cost-message", at);
  check(m, "FINDING", "step-cost-message", String(r.message));
  assert.match(m.detail, /Shall we split it\?/);
  assert.match(m.detail, /ann-h/);
  assert.deepEqual(items(ANN, "step-cost-message", at), [], "not relayed to its writer");
  w.draw(Q, PH);
  assert.deepEqual(items(ANN, "step-cost-shared", at), [], "a hidden sharing project: nothing about the step");
  void PD;
});

test("R17 milestone-overdue (FINDING, to each joined participant) and milestone-reminder (OBLIGATION, to the member who asked), from investigation.milestonesOverdue, keyed by its key", () => {
  const w = invWorld();
  const items = over(w, { investigation: w.inv });
  const { milestone } = w.inv.milestoneSet({ project: IP1, name: "M", date: "2026-11-01", waitsOn: [IQ1], by: IANN });
  const at = "2026-11-05T18:00:00Z";
  assert.deepEqual(items(IANN, "milestone-overdue", "2026-10-30T18:00:00Z"), [], "negative control: not before its date");
  const key = w.inv.milestonesOverdue({ viewer: IANN, at }).due[0].key;
  for (const v of [IANN, IBOB]) {
    const [it] = items(v, "milestone-overdue", at);
    check(it, "FINDING", "milestone-overdue", key);
    assert.equal(it.subject.id, milestone);
    assert.deepEqual(it.case.ancestors.map((a) => a.id), [IP1]);
  }
  for (const v of [IOUT, IDAN]) assert.deepEqual(items(v, "milestone-overdue", at), [], v);
  const late = w.inv.milestoneSet({ project: IP1, name: "Later", date: "2026-12-01", waitsOn: [IQ1], by: IANN }).milestone;
  assert.equal(w.inv.milestoneReminder({ milestone: late, at: "2026-11-20", by: IBOB }).ok, true);
  const day = "2026-11-20T18:00:00Z";
  const [r] = items(IBOB, "milestone-reminder", day);
  check(r, "OBLIGATION", "milestone-reminder", w.inv.milestonesOverdue({ viewer: IBOB, at: day }).due.find((d) => d.kind === "reminder").key);
  assert.deepEqual(items(IANN, "milestone-reminder", day), [], "hers alone");
});

test("R17 project-quiet: one FINDING per quiet spell from investigation.quietPrompts, keyed by its key, to the joined participants; nothing more once a member took a door", () => {
  const w = invWorld();
  const items = over(w, { investigation: w.inv });
  const at = "2026-10-10T00:00:00Z";
  assert.deepEqual(items(IANN, "project-quiet", at), [], "negative control: not quiet");
  w.end(w.step());
  w.gapsOf.set(IP1, [{ key: "intent::g1", basis: { says: "the vote record is to be requested" } }]);
  w.progress.set(IP1, { ok: true, project: IP1, objective: "Know whether the award was proper", computable: true,
                        condition: { progression: "PRG-1" }, satisfied: false, matched: 2, meeting: 1, short: [], undetermined: [] });
  const key = w.inv.quietPrompts({ viewer: IANN, at }).prompts[0].key;
  for (const v of [IANN, IBOB]) {
    const [it] = items(v, "project-quiet", at);
    check(it, "FINDING", "project-quiet", key);
    assert.match(it.detail, /Know whether the award was proper/);
  }
  assert.deepEqual(items(IOUT, "project-quiet", at), [], "an invited participant is not told");
  assert.equal(w.inv.projectWatch({ project: IP1, by: IBOB }).ok, true);
  assert.deepEqual(items(IANN, "project-quiet", at), [], "a door taken: nothing more in that spell");
});

test("R17 question-find: one FINDING per find question-explorer.findsFor answers, keyed by its key, marked \"Hint · machine work\"; the label ai.label.explored with {owner} filled from ai-use R6's enabled_by only for that account's owners (D64)", async () => {
  const w = await qeWorld().standard();
  const items = over(w, { questionExplorer: w.p });
  const at = "2026-10-10T09:00:00Z";
  w.follow(QQ, "alice", "bob");
  w.project(PROJ, ["alice"], { owners: ["alice"] });
  w.draw(QQ, PROJ);
  await w.setExplore("group", "no");
  assert.deepEqual(items("alice", "question-find", at), [], "negative control: nothing found");
  const o = await w.openRun(`project:${PROJ}`);
  w.p.find({ run: o.run, kind: "capture", ref: CAP, bearing: "supports", how: "the minutes record the vote", caller: CALLER });
  const name = w.rows(`SELECT title FROM bundles WHERE bundle_id = ?`, PROJ)[0]?.title ?? PROJ;
  const [a] = items("alice", "question-find", at);
  check(a, "FINDING", "question-find", w.p.findsFor({ viewer: "member:alice" }).finds[0].key);
  assert.equal(a.mark, HINT_MARK);
  assert.ok(a.summary.startsWith(HINT_MARK) && a.detail.startsWith(HINT_MARK));
  assert.equal(a.label, NOTICE_WORDS["ai.label.explored"].replace("{owner}", name), "alice owns the paying account");
  assert.equal(a.word, "ai.label.explored");
  const [b] = items("bob", "question-find", at);
  assert.equal(b.id, a.id, "one key per find and question");
  assert.equal(b.label, "machine", "bob does not own the paying account: no explored label");
  assert.equal("word" in b, false);
  assert.ok(!texts(b).some((t) => t.includes("enabled by") || t === `project:${PROJ}`), "which account paid is never answered to him");
  assert.deepEqual(items("carol", "question-find", at), [], "not a recipient");
});

test("R17 review-comment-left-out: one FINDING per entry review.reviewCommentsLeftOut answers, its key used whole, to the member reviewer and to nobody else; none when every comment was carried", () => {
  const w = reviewStandard();
  const CASE = "CASE-2026-0001";
  w.publishedCase(CASE, RP, 1);
  const A = w.r.act({ act: "draft", author: "ann", project: RP, statement: "S", caseId: CASE });
  const c1 = w.r.comment({ draft: A.draftId, viewer: V("ivy"), text: "first" }).comment;
  const c2 = w.r.comment({ draft: A.draftId, viewer: V("ivy"), text: "second" }).comment;
  /* the signed document's front matter as case-grammar R25 writes its review_comments block (format 7), held as data */
  const q = (v) => `'${JSON.stringify(v)}'`;
  const block = (rows) => ["---", "format: bio-case-document/7",
    ...(rows.length ? ["review_comments:", ...rows.flatMap((r) => [`  - reviewer: ${q(r.reviewer)}`, `    text: ${q(r.text)}`, `    at: ${q(r.at)}`])]
      : ["review_comments: []"]),
    "review_comments_left_out: null", "---", ""].join("\n");
  const carry = (x) => ({ reviewer: x.author, text: x.text, at: x.at });
  const items = over(w, { review: w.r });
  const at = "2026-09-28T01:00:00Z";
  w.caseDocument(CASE, 2, { text: block([carry(c1)]), signed: true });
  w.publishedCase(CASE, RP, 2);
  const [it] = items("ivy", "review-comment-left-out", at);
  const key = w.r.reviewCommentsLeftOut({ viewer: V("ivy") }).items[0].key;
  assert.equal(key, `FINDING::review-comment-left-out::${CASE}::2::ivy`);
  check(it, "FINDING", "review-comment-left-out", key);
  assert.deepEqual(it.recipients, ["ivy"]);
  assert.match(it.detail, /file a response in its docket/);
  for (const m of ["ann", "ed", "quinn"]) assert.deepEqual(items(m, "review-comment-left-out", at), [], m);
  w.caseDocument(CASE, 2, { text: block([carry(c1), carry(c2)]), signed: true });
  assert.deepEqual(items("ivy", "review-comment-left-out", at), [], "negative control: every comment carried");
  void RQ; void SECRET;
});

test("R17 R1 each source's bound and truncated stated; a source that throws or refuses contributes no item and is named in facts.failed; the read writes nothing", () => {
  const w = stepsWorld();
  duties(w.st);
  const many = Array.from({ length: INVESTIGATION_ITEMS_MAX + 1 }, (_, i) => ({ step: "STP-1", look: 1, observation: i, at: "2026-10-09T00:00:00Z", questions: [], key: `k${i}` }));
  const run = (deps) => reader(fresh(w.host, { membership: w.membership, view: UTC, steps: w.s, ...deps })).read("ann", { now: Date.parse("2026-10-09T18:00:00Z") });
  const r = run({ steps: { ...w.s, laterFound: () => ({ ok: true, found: many }), stepsDue: (a) => w.s.stepsDue(a),
    costShares: (a) => w.s.costShares(a), costMessages: (a) => w.s.costMessages(a) } });
  assert.equal(ofKind(r, "step-later-found").length, INVESTIGATION_ITEMS_MAX);
  assert.deepEqual(r.facts.step_later_found, { bound: INVESTIGATION_ITEMS_MAX, truncated: true });
  assert.deepEqual(run({}).facts.step_later_found, { bound: INVESTIGATION_ITEMS_MAX, truncated: false }, "negative control: within the bound");
  const boom = () => { throw new Error("down"); };
  for (const [deps, name] of [[{ steps: { laterFound: boom, stepsDue: () => ({ ok: true, due: [] }), costShares: () => ({ ok: true, shares: [] }), costMessages: () => ({ ok: true, messages: [] }) } }, "steps"],
                              [{ questionExplorer: { findsFor: () => ({ ok: false }) } }, "question-explorer"],
                              [{ investigation: { milestonesOverdue: boom, quietPrompts: () => ({ ok: true, prompts: [] }) } }, "investigation"],
                              [{ review: { reviewCommentsLeftOut: () => null } }, "review"]])
    assert.deepEqual(run(deps).facts.failed, [name], name);
  const before = w.snapshot();
  run({});
  assert.equal(w.snapshot(), before);
  for (const it of run({}).items) for (const s of sentences(it)) assert.equal(typeof s, "string");
});
