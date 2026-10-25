/* R17 (N820; K2405, K2417, K2418, K2484, K2525): the investigation's items, each told once and keyed as its source says,
   over the real providers on their own test worlds: `steps` (its R12 `stepsDue`, R14 `costShares`, R15 `costMessages`,
   R23 `laterFound`), `investigation` (its R3 `milestonesOverdue`, R18 `quietPrompts`), `question-explorer` (its R5
   `findsFor`, with ai-use R6's `enabled_by` for the paying account's owners, D64) and `review` (its R33
   `reviewCommentsLeftOut`). (T43; N856; DEC-189 (2), (7)) Each kind's `summary` and `detail` are `words.json`'s
   `queue.<kind>.summary|detail`, by key, their placeholders filled from the source's own facts; the expected words are
   built here from that file, never from this module. Each with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { stepRead } from "../steps/fixtures.mjs";
import { world as stepsWorld, ANN, BOB, CAT, DAN, OUT, P1, P2, PH, PD, Q, Q2 } from "../steps/fixture.mjs";
import { world as invWorld, P1 as IP1, Q1 as IQ1, ANN as IANN, BOB as IBOB, OUT as IOUT, DAN as IDAN } from "../investigation/fixture.mjs";
import { world as qeWorld, Q as QQ, PROJ, CAP, CALLER } from "../question-explorer/fixture.mjs";
import { standard as reviewStandard, P as RP, Q as RQ, V, SECRET } from "../review/fixture.mjs";
import { fresh, reader, ofKind, sentences, texts, dayOn } from "./fixture.mjs";
import { NOTICE_KINDS, HINT_MARK, INVESTIGATION_ITEMS_MAX } from "../../../src/notice-producers/index.mjs";
import { WORDS } from "../ai-use/fixture.mjs";

const UTC = () => ({ time_zone: { value: "UTC" } });
const duties = (st) => st.sql.exec(`CREATE TABLE IF NOT EXISTS duties (duty_id TEXT, obligor TEXT)`);   /* duties' table, empty (R5) */
const bare = (v) => v.replace(/^member:/, "");
/* `words.json`'s sentence of `key`, its placeholders filled (a key the file lacks fails here) */
const say = (key, fills = {}) => {
  assert.equal(typeof WORDS[key], "string", `${key} is in words.json`);
  return WORDS[key].replace(/\{([A-Za-z_]+)\}/g, (m, k) => (k in fills ? fills[k] : m));
};
const day = (d, month) => dayOn(d, month);
/* R17 (DEC-189 (2)): the item's summary and detail are its kind's keys with these fills, every placeholder filled */
const words = (it, fills) => {
  assert.equal(it.summary, say(`queue.${it.kind}.summary`, fills), `${it.kind} summary`);
  assert.equal(it.detail, say(`queue.${it.kind}.detail`, fills), `${it.kind} detail`);
  for (const t of [it.summary, it.detail]) assert.doesNotMatch(t, /\{[A-Za-z_]+\}/, t);
};
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
    words(it, { what: w.s.step({ step: id, viewer: v }).work, date: day(9, "october") });
  }
  assert.equal(items(ANN, "step-later-found", later)[0].summary, "Found later: Ask the clerk for the 2025 contract file", "the step's work");
  assert.notEqual(items(ANN, "step-later-found", later)[0].summary, say("queue.step-later-found.summary", { what: id }), "negative control: not the step's id");
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
  words(d, { step: "past", date: day(8, "october") });
  assert.notEqual(d.summary, say("queue.step-reminder.summary", { step: "past" }), "negative control: a past date is no reminder");
  assert.deepEqual(items(BOB, "step-date-due", at), [], "negative control: not the member who set it");
  assert.ok(items(ANN, "step-date-due", "2026-10-11T06:30:00Z").map((i) => i.id).includes(d.id), "stable per step and date");
  assert.equal(w.s.stepReminder({ step: today, at: "2026-10-12", by: BOB }).ok, true);
  assert.deepEqual(items(BOB, "step-reminder", "2026-10-11T18:00:00Z"), [], "negative control: before its day");
  const [r] = items(BOB, "step-reminder", "2026-10-12T18:00:00Z");
  check(r, "OBLIGATION", "step-reminder", w.s.stepsDue({ viewer: BOB, at: "2026-10-12T18:00:00Z" }).due[0].key);
  assert.deepEqual(r.recipients, ["bob"]);
  words(r, { step: "today" });
  assert.deepEqual(items(ANN, "step-reminder", "2026-10-12T18:00:00Z"), [], "hers alone");
});

/* R17 (T45; Actions DESIGN §11 "one date, one reminder"; v0.2 rule 6; steps R29): a step whose date an action's clock entry
   holds draws no step-date-due: stepsDue leaves it out, and this module reads stepsDue as before (no read of action-clocks). */
test("R17 (T45) a step whose byWhen an action's clock entry holds (steps R29) draws no step-date-due; control: with no holder registered, the same step raises one; her own reminder on it stays", () => {
  const at = "2026-10-10T06:30:00Z";
  const make = () => {
    const w = stepsWorld();
    w.clock = "2026-10-10T06:30:00.000Z";
    const held = w.step({ work: "held", byWhen: { date: "2026-10-01", basis: "law" } });
    const own = w.step({ work: "own", byWhen: { date: "2026-10-02", basis: "own" } });
    return { w, held, own, items: over(w, { steps: w.s }) };
  };
  const plain = make();
  assert.deepEqual(plain.items(ANN, "step-date-due", at).map((i) => i.subject.id).sort(), [plain.held, plain.own].sort(),
    "control: no holder, each past date is its step's own item");
  const x = make();
  assert.deepEqual(x.w.s.registerDueHolder("action-clocks", ({ step }) => (step === x.held ? { entry: { clock: "CLK-1" } } : null)), { ok: true, module: "action-clocks" });
  assert.deepEqual(x.w.s.step({ step: x.held, viewer: ANN }).by_when_held, { module: "action-clocks", entry: { clock: "CLK-1" } });
  const due = x.items(ANN, "step-date-due", at);
  assert.deepEqual(due.map((i) => i.subject.id), [x.own], "the held step draws none; the unheld one keeps its own");
  assert.ok(!texts(x.items(ANN, "step-date-due", at)).includes("held"), "nothing of the held step");
  assert.equal(x.w.s.stepReminder({ step: x.held, at: "2026-10-10", by: ANN }).ok, true);
  assert.deepEqual(x.items(ANN, "step-reminder", "2026-10-10T18:00:00Z").map((i) => i.subject.id), [x.held], "her own reminder is not the date's item and stays");
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
    words(it, { step: w.s.step({ step: id, viewer: v }).work, totals: "40 USD", projects: "Project One, Project Two" });
  }
  assert.deepEqual(items(DAN, "step-cost-shared", at), [], "not an owner of either");
  const r = w.s.costMessage({ step: id, text: "Shall we split it?", by: ANN });
  assert.equal(r.ok, true);
  const [m] = items(BOB, "step-cost-message", at);
  check(m, "FINDING", "step-cost-message", String(r.message));
  assert.match(m.detail, /Shall we split it\?/);
  assert.match(m.detail, /ann-h/);
  words(m, { step: w.s.step({ step: id, viewer: BOB }).work, member: "ann-h", text: "Shall we split it?" });
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
    words(it, { milestone: "M", date: day(1, "november") });
  }
  for (const v of [IOUT, IDAN]) assert.deepEqual(items(v, "milestone-overdue", at), [], v);
  const late = w.inv.milestoneSet({ project: IP1, name: "Later", date: "2026-12-01", waitsOn: [IQ1], by: IANN }).milestone;
  assert.equal(w.inv.milestoneReminder({ milestone: late, at: "2026-11-20", by: IBOB }).ok, true);
  const on = "2026-11-20T18:00:00Z";
  const [r] = items(IBOB, "milestone-reminder", on);
  check(r, "OBLIGATION", "milestone-reminder", w.inv.milestonesOverdue({ viewer: IBOB, at: on }).due.find((d) => d.kind === "reminder").key);
  words(r, { milestone: "Later" });
  assert.notEqual(r.summary, say("queue.milestone-overdue.summary", { milestone: "Later" }), "negative control: a reminder is not overdue");
  assert.deepEqual(items(IANN, "milestone-reminder", on), [], "hers alone");
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
    words(it, { project: "Project One", progress: "Know whether the award was proper; the vote record is to be requested" });
  }
  assert.deepEqual(items(IOUT, "project-quiet", at), [], "an invited participant is not told");
  assert.equal(w.inv.projectWatch({ project: IP1, by: IBOB }).ok, true);
  assert.deepEqual(items(IANN, "project-quiet", at), [], "a door taken: nothing more in that spell");
});

test("R17 question-find: one FINDING per find question-explorer.findsFor answers, keyed by its key, marked \"Hint · machine work\"; the label ai.label.explored with {owner} filled from ai-use R6's enabled_by only for that account's owners, ai.label.explored.member for every other viewer (D64; DEC-189 (7))", async () => {
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
  words(a, { question: QQ, what: "the minutes record the vote" });
  assert.equal(a.label, say("ai.label.explored", { owner: name }), "alice owns the paying account");
  assert.equal(a.word, "ai.label.explored");
  const [b] = items("bob", "question-find", at);
  assert.equal(b.id, a.id, "one key per find and question");
  assert.equal(b.label, say("ai.label.explored.member"), "bob does not own the paying account: the label naming no account");
  assert.equal(b.word, "ai.label.explored.member");
  assert.notEqual(b.label, a.label, "negative control: not the owner's label");
  words(b, { question: QQ, what: "the minutes record the vote" });
  assert.ok(!texts(b).some((t) => t.includes("enabled by") || t.includes(name) || t === `project:${PROJ}`), "which account paid is never answered to him");
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
  words(it, { case: CASE });
  for (const m of ["ann", "ed", "quinn"]) assert.deepEqual(items(m, "review-comment-left-out", at), [], m);
  w.caseDocument(CASE, 2, { text: block([carry(c1), carry(c2)]), signed: true });
  assert.deepEqual(items("ivy", "review-comment-left-out", at), [], "negative control: every comment carried");
  void RQ; void SECRET;
});

/* steps' own `laterFound`, over `n` looks that each found something later: the real answer, one entry per address looked at */
function laterWorld(n) {
  const w = stepsWorld();
  duties(w.st);
  w.clock = "2026-10-09T00:00:00.000Z";
  const id = w.step();
  const DOC = "INFO-2026-0001-doc", SHA = "c".repeat(64);
  w.bundle(DOC, { type: "information" });
  w.capture(SHA, DOC);
  for (let i = 0; i < n; i++) {
    const address = `https://example.org/contract-${i}.pdf`;
    w.observationLog.observe({ actor_class: "member", actor: ANN, authority_kind: "step", authority: id, level: "document",
      subject_kind: "address", subject: address, detail: "not posted", state: "LOOKED_ABSENT" });
    w.observationLog.observe({ actor_class: "plane", authority_kind: "acquire", authority: DOC, level: "document",
      subject_kind: "address", subject: address, state: "PRESENT", result_kind: "capture", result_ref: SHA, detail: "new" });
  }
  return w;
}

test("R17 R1 each source's bound and truncated stated; a source that throws or refuses contributes no item and is named in facts.failed; the read writes nothing", () => {
  const w = laterWorld(INVESTIGATION_ITEMS_MAX + 1);
  const NOW = Date.parse("2026-10-09T18:00:00Z");
  const run = (deps, world = w) => reader(fresh(world.host, { membership: world.membership, view: UTC, steps: world.s, ...deps })).read("ann", { now: NOW });
  assert.equal(w.s.laterFound({ viewer: ANN, at: "2026-10-09T18:00:00Z" }).found.length, INVESTIGATION_ITEMS_MAX + 1, "steps' own answer holds one more than the bound");
  const r = run({});
  assert.equal(ofKind(r, "step-later-found").length, INVESTIGATION_ITEMS_MAX);
  assert.deepEqual(r.facts.step_later_found, { bound: INVESTIGATION_ITEMS_MAX, truncated: true });
  assert.deepEqual(run({}, laterWorld(3)).facts.step_later_found, { bound: INVESTIGATION_ITEMS_MAX, truncated: false }, "negative control: within the bound");
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

test("R17 step-later-found's {date} is the look's own local day when steps answers it (looked_at), else the entry's (J1 (4)); {what} the step's work, else its id", () => {
  const w = stepsWorld();
  const entry = (x) => ({ step: "STP-9", look: 1, observation: 2, at: "2026-12-01T00:00:00Z", questions: [], key: "k", ...x });
  const run = (e, step) => ofKind(reader(fresh(w.host, { membership: w.membership, view: UTC, steps: { laterFound: () => ({ ok: true, found: [e] }),
    stepsDue: () => ({ ok: true, due: [] }), costShares: () => ({ ok: true, shares: [] }), costMessages: () => ({ ok: true, messages: [] }), ...(step ? { step } : {}) } }))
    .read("ann", { now: Date.parse("2026-12-02T00:00:00Z") }), "step-later-found")[0];
  duties(w.st);
  const looked = run(entry({ looked_at: "2026-10-09T18:00:00Z" }), () => ({ ok: true, step: "STP-9", work: "Ask the clerk" }));
  assert.equal(looked.detail, say("queue.step-later-found.detail", { date: day(9, "october") }));
  assert.equal(looked.summary, say("queue.step-later-found.summary", { what: "Ask the clerk" }));
  const plain = run(entry({}), () => stepRead().unknownAnswer);
  assert.equal(plain.detail, say("queue.step-later-found.detail", { date: day(1, "december") }), "negative control: no looked_at, the entry's own day");
  assert.equal(plain.summary, say("queue.step-later-found.summary", { what: "STP-9" }), "a step the read does not answer: its id");
  const boom = reader(fresh(w.host, { membership: w.membership, view: UTC, steps: { laterFound: () => ({ ok: true, found: [entry({})] }),
    stepsDue: () => ({ ok: true, due: [] }), costShares: () => ({ ok: true, shares: [] }), costMessages: () => ({ ok: true, messages: [] }),
    step: () => { throw new Error("down"); } } })).read("ann", { now: Date.parse("2026-12-02T00:00:00Z") });
  assert.deepEqual(ofKind(boom, "step-later-found"), []);
  assert.deepEqual(boom.facts.failed, ["steps"], "a step read that throws is steps' failure");
});

/* R17 (T44; N869, N876; DEC-191 (3), DEC-192 (3)): every `{date}` in a kind's summary or detail is filled as R16's: the
   source's local day by `date.daymonth`, or `date.daymonthyear` when not in the current local year. Today that is
   step-later-found (steps R23's `looked_at`, else `at`: instants, read in the profile's zone), step-date-due (steps R12's
   date) and milestone-overdue (investigation R3's date): local days. Over each source's entries as it answers them. */
test("R17 (T44) each {date}: step-later-found, step-date-due and milestone-overdue fill {date} as R16's: the local day by date.daymonth, by date.daymonthyear outside the current local year (control: inside it, no year); a look on the 6th locally and the 7th in UTC reads the 6th (control: in UTC, the 7th)", () => {
  const w = stepsWorld();
  duties(w.st);
  const LA = () => ({ time_zone: { value: "America/Los_Angeles" } });
  const run = ({ found = [], due = [], milestones = [] }, now, view = LA) => reader(fresh(w.host, { membership: w.membership, view,
    steps: { laterFound: () => ({ ok: true, found }), stepsDue: () => ({ ok: true, due }), costShares: () => ({ ok: true, shares: [] }),
             costMessages: () => ({ ok: true, messages: [] }), step: ({ step }) => ({ ok: true, step, work: "Ask the clerk" }) },
    investigation: { milestonesOverdue: () => ({ ok: true, due: milestones }), quietPrompts: () => ({ ok: true, prompts: [] }) } }))
    .read("ann", { now: Date.parse(now) });
  const date = (d, m, y) => dayOn(d, m, y);
  const later = (looked_at, at = "2026-10-09T18:00:00Z") => ({ step: "STP-9", look: 1, observation: 2, at, looked_at, questions: [], key: `k-${looked_at}` });
  const stepDue = (d) => ({ step: "STP-9", work: "Ask the clerk", kind: "past_date", date: d, key: `k-${d}` });
  const ms = (d) => ({ kind: "overdue", milestone: 3, project: null, name: "draft out", date: d, key: `m-${d}` });
  const detail = (r, kind) => ofKind(r, kind).map((i) => i.detail);
  /* in the current local year: no year; the day with no leading zero */
  const now = "2026-10-11T18:00:00Z";
  const inYear = run({ found: [later("2026-10-07T03:00:00Z")], due: [stepDue("2026-10-08")], milestones: [ms("2026-10-01")] }, now);
  assert.deepEqual(detail(inYear, "step-later-found"), [say("queue.step-later-found.detail", { date: date("6", "october") })], "the look's local day");
  assert.deepEqual(detail(inYear, "step-date-due"), [say("queue.step-date-due.detail", { date: date("8", "october") })]);
  assert.deepEqual(detail(inYear, "milestone-overdue"), [say("queue.milestone-overdue.detail", { date: date("1", "october") })]);
  assert.ok(detail(inYear, "milestone-overdue")[0].includes(day(1, "october")));
  for (const t of inYear.items.map((i) => i.detail)) assert.doesNotMatch(t, /\b2026\b|\b0\d /, t);
  const utc = run({ found: [later("2026-10-07T03:00:00Z")] }, now, UTC);
  assert.deepEqual(detail(utc, "step-later-found"), [say("queue.step-later-found.detail", { date: date("7", "october") })], "control: in UTC, the 7th");
  /* outside it: with the year */
  const early = "2026-01-04T18:00:00Z";
  const outYear = run({ found: [later("2025-12-20T20:00:00.120Z", "2026-01-03T00:00:00Z")], due: [stepDue("2025-12-30")], milestones: [ms("2025-11-15")] }, early);
  assert.deepEqual(detail(outYear, "step-later-found"), [say("queue.step-later-found.detail", { date: date("20", "december", "2025") })]);
  assert.deepEqual(detail(outYear, "step-date-due"), [say("queue.step-date-due.detail", { date: date("30", "december", "2025") })]);
  assert.deepEqual(detail(outYear, "milestone-overdue"), [say("queue.milestone-overdue.detail", { date: date("15", "november", "2025") })]);
  assert.ok(detail(outYear, "step-date-due")[0].includes(dayOn(30, "december", 2025)));
  /* control: the same sources' days in the year being read name none */
  const sameYear = run({ due: [stepDue("2026-01-02")], milestones: [ms("2026-01-01")] }, early);
  assert.deepEqual(detail(sameYear, "step-date-due"), [say("queue.step-date-due.detail", { date: date("2", "january") })]);
  assert.deepEqual(detail(sameYear, "milestone-overdue"), [say("queue.milestone-overdue.detail", { date: date("1", "january") })]);
  /* no looked_at: the entry's own instant (steps R23's `at`) */
  const noLook = run({ found: [later(null, "2026-10-07T03:00:00Z")] }, now);
  assert.deepEqual(detail(noLook, "step-later-found"), [say("queue.step-later-found.detail", { date: date("6", "october") })]);
});

/* R19 (T46; STEPS #5 J1; K2955; steps R12): `stepsDue` reads at most 1,000 of a member's dated steps not ended and 1,000 of
   her reminders due; when either read reaches past it, its answer's `truncated` is carried into `facts.step_due`, so the
   steps producer's bound reached is never silent. Over the real steps, with dates not yet past, so no item is drawn and only
   stepsDue's own bound is in play; the items drawn are unchanged. */
test("R19 a member with 1,001 open dated steps has facts.step_due truncated (stepsDue's own bound reached), the items drawn unchanged; control: with 1,000, not; and 1,001 reminders due likewise (control: 1,000)", () => {
  const at = "2026-10-10T06:30:00Z";
  const many = (w, n, args = {}) => {
    const ids = [];
    w.st.db.exec("BEGIN");
    for (let i = 0; i < n; i++) ids.push(w.step({ work: `dated ${i}`, byWhen: { date: "2099-01-01", basis: "own" }, by: ANN, ...args }));
    w.st.db.exec("COMMIT");
    return ids.sort();
  };
  const w = stepsWorld();
  duties(w.st);
  const ids = many(w, 1001);
  const facts = () => reader(fresh(w.host, { membership: w.membership, view: UTC, steps: w.s })).read("ann", { now: Date.parse(at) });
  assert.equal(w.s.stepsDue({ viewer: ANN, at }).truncated, true, "steps R12: its read reached past its 1,000");
  const r = facts();
  assert.deepEqual(r.facts.step_due, { bound: INVESTIGATION_ITEMS_MAX, truncated: true }, "the steps producer's bound reached, stated");
  assert.deepEqual([...ofKind(r, "step-date-due"), ...ofKind(r, "step-reminder")], [], "the items drawn are unchanged: none is past its date");
  assert.deepEqual(r.facts.failed, []);
  assert.equal(w.s.stepEnd({ step: ids[0], end: "ended", by: ANN }).ok, true);
  assert.equal("truncated" in w.s.stepsDue({ viewer: ANN, at }), false);
  assert.deepEqual(facts().facts.step_due, { bound: INVESTIGATION_ITEMS_MAX, truncated: false }, "control: 1,000 open dated steps, not truncated");
  assert.deepEqual(reader(fresh(w.host, { membership: w.membership, view: UTC, steps: w.s })).read("bob", { now: Date.parse(at) }).facts.step_due,
    { bound: INVESTIGATION_ITEMS_MAX, truncated: false }, "control: another member's read, not hers");
  /* reminders: 1,001 due that day reach steps' bound; the items drawn are this module's own 200 */
  const m = stepsWorld();
  duties(m.st);
  const s = m.step({ work: "reminded" });
  m.st.db.exec("BEGIN");
  for (let i = 0; i < 1001; i++) m.s.stepReminder({ step: s, at: "2026-10-09", by: BOB });
  m.st.db.exec("COMMIT");
  const read = () => reader(fresh(m.host, { membership: m.membership, view: UTC, steps: m.s })).read("bob", { now: Date.parse(at) });
  const rr = read();
  assert.deepEqual(rr.facts.step_due, { bound: INVESTIGATION_ITEMS_MAX, truncated: true });
  assert.equal(ofKind(rr, "step-reminder").length, INVESTIGATION_ITEMS_MAX);
  /* control, at the interface: a stepsDue answering the same 1,000 entries with no truncated is not truncated by its bound, only by this module's own cut */
  const due = m.s.stepsDue({ viewer: BOB, at }).due;
  assert.equal(due.length, 1000);
  const stub = (answer) => reader(fresh(m.host, { membership: m.membership, view: UTC, steps: { ...NONE_STEPS, stepsDue: () => answer } })).read("bob", { now: Date.parse(at) }).facts.step_due;
  assert.deepEqual(stub({ ok: true, due: due.slice(0, INVESTIGATION_ITEMS_MAX) }), { bound: INVESTIGATION_ITEMS_MAX, truncated: false }, "control: within both bounds");
  assert.deepEqual(stub({ ok: true, due: due.slice(0, INVESTIGATION_ITEMS_MAX), truncated: true }), { bound: INVESTIGATION_ITEMS_MAX, truncated: true }, "stepsDue's truncated alone");
  assert.deepEqual(stub({ ok: true, due: due.slice(0, INVESTIGATION_ITEMS_MAX), truncated: "yes" }), { bound: INVESTIGATION_ITEMS_MAX, truncated: false }, "only a truncated that is true");
});
const NONE_STEPS = { laterFound: () => ({ ok: true, found: [] }), costShares: () => ({ ok: true, shares: [] }), costMessages: () => ({ ok: true, messages: [] }) };
