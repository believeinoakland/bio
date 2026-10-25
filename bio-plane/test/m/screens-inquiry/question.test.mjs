/* screens-inquiry R2, R12, R23–R27, R31, R34–R36, R38, R39, R41: the question screen, on interface-shell's served page over
 * a scripted plane. Every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { registerDeclaredOps as registerOps } from "../../../src/op-declarations/index.mjs";
import { boot, ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, storeWorld, WORLD_FOUNDER_HANDLE, main, actsIn, button, fill, press, rawKeys, inquiryMd, INQUIRY_REFS, LEGS, BASIS, plane, says, section, lead, word, day, POLICY,
  SCREENS, P, Q, D } from "./fixtures.mjs";

/* K4245 (test-support R17): every owner's declarations registered once, before the first read, by the one registrar */

const at = "/app/question/" + Q;
/* the inquiry with its partition held (state a): the policy a part of its own */
const GROUNDS = [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }];
const grouped = (o = {}) => inquiryMd(P, INQUIRY_REFS, { legs: LEGS.map((l) => (l.target === D ? { ...l, ground: "part 1" } : l)), grounds: GROUNDS, ...o });
const A = { images: { [Q]: { "bundle.md": grouped() } } };
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }), agentpack: ok({ ok: true, pack: { version: "p@1" } }), airuns: ok({ ok: true, runs: [] }) };
/** A project with `n` held documents and a question in it resting on them (`legs` overrides each leg's keys), drawn into the project: all by real acts over the world.
 *  Answers `{world, ann, project, docs, id, page(opts)}`; `page` boots the question's page over the world (`plane` overrides one op, as `boot` does). */
const stateWorld = async ({ n = 2, legs = null, role = "supports", world = null, as = "ann", names = null } = {}) => {
  world = world || await storeWorld();
  const ann = await world.signIn(as, { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  const docs = [];
  for (let i = 0; i < n; i++) docs.push((await world.recipes.hold(ann, names ? names[i] : "Passage " + (i + 1), "The Director shall repair each reported pothole, part " + (i + 1) + ".", project)).bundle);
  const made = docs.map((target, i) => ({ target, role, grade: "B", grade_axis: "capture", grade_source: "capture", ...(legs ? legs[i] : {}) }));
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Do crews repair each pothole within seven days?", legs: made, draw: true })).id;
  const page = async (o = {}, who = ann) => {
    const { door, session } = world.boot(who);
    const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + id, ...o });
    await p.settle();
    return p;
  };
  return { world, ann, project, docs, id, page };
};
/** the question's leg on `target` severed, by the acts the page makes (a selection, then `sever` with the question as the citing object) */
const severLeg = async (w, target, reason = "the wrong year's orders") => {
  const sel = await w.ann.act("select", { body: { ids: [target] } });
  await w.ann.act("sever", { query: { project: w.id, handle: sel.handle, reason }, body: {} });
};

/** the partition held, by the act the page's "Save the answers" makes (`grounds` are `{ground, legs: [ordinals]}`) */
const ground = (w, grounds, reason = "my reading") => w.ann.act("inquiryground", { body: { target: w.id, grounds, reason } });

/** the team's Claude account, by the administrator's real acts (the world made with `storeWorld({ ai: true })`): her password again, the team's key set and switched on, its notice read */
const aiTeam = async (world) => {
  const admin = await world.signIn(WORLD_FOUNDER_HANDLE);
  await admin.act("reauth", { body: { password: admin.password } });
  await admin.act("groupkeyset", { body: { key: "sk-ant-api03-" + "w".repeat(40) } });
  await admin.act("groupkeyswitch", { body: { on: true } });
  await admin.act("groupkeynoticeseen", { body: {} });
};
/** the member reads the team's notice (`groupkeynoticeseen`), as each member must before the assistant answers her */
const readNotice = (w) => w.ann.act("groupkeynoticeseen", { body: {} });
/** a run of the member's own over the question, opened by her real act (`airunopen`: running, as the page's own press opens one, before anything dispatches it) */
const openRun = async (w, run = "RUN-" + "c".repeat(16)) => {
  await w.ann.act("airunopen", { body: { run, contextType: "inquiry", contextId: w.id, skillVersion: "investigative-session@1", principalClaude: `member:${w.ann.member}`, mode: "check" } });
  return run;
};

const reach = (o = {}) => ({ boot: { plane: { ...plane(o), ...REACH, ...(o.reach || {}) } } });

test("R2 reads: the inquiry, its strength, basis versions, hunches, what it waits on and what relies on it", async () => {
  const p = await open(at, A);
  const q = (op) => p.byOp(op)[0].query;
  assert.equal(p.byOp("image").find((r) => r.query.id === Q).query.id, Q);
  assert.equal(q("inquirystrength").id, Q);
  assert.equal(q("basisversions").id, Q);
  assert.ok(p.byOp("basisversions").some((r) => r.query.project === P), "R25: the reading the project stands on, read with project");
  assert.equal(q("hypotheses").inquiry, Q);
  assert.equal(q("questionwaits").question, Q);
  assert.equal(q("backlinks").target, Q);
  assert.deepEqual(q("strengthbarof"), { op: "strengthbarof", project: P });
  assert.ok(p.root().querySelector(".cs-crumbs").textContent.includes("Pothole repairs"));
});

test("R2 state a: its words, two grades and the phrase against the project's bar, weakest part, what would raise it", async () => {
  const p = await open(at, A);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Is the city repairing reported potholes within seven days?");
  assert.equal(m.querySelector('a.cs-ref[href="/app/project/' + P + '"]').textContent, "Pothole repairs");
  const box = m.querySelector(".mk-strengthbox");
  assert.deepEqual(box.querySelectorAll(".cs-grade").map((g) => [g.getAttribute("data-scale"), g.textContent.slice(-1)]), [["capture", "B"], ["connection", "C"]],
    "two grades, never one score; an ungraded testimony axis is not drawn");
  assert.ok(says(box, "screen.question.strength.against", { capture: "B", connection: "B" }));
  assert.ok(says(box, "screen.question.strength.short") && says(box, "mark.scale.connection.name"));
  assert.ok(says(box, "screen.question.strength.weakest", { weakest: POLICY }));
  assert.ok(says(box, "screen.question.strength.raise", { raise: "a work-order number on both would raise it to B" }));
  assert.ok(says(box, "screen.question.strength.two"));
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R2 a question with no project is held against the group's bar; one that meets it says so", async () => {
  const p = await open(at, { images: { [Q]: { "bundle.md": grouped().replace(/^project: .*\n/m, "") } },
    plane: { inquirystrength: ok({ capture: { state: "graded", grade: "A" }, connection: { state: "graded", grade: "B" } }) } });
  assert.equal(p.byOp("strengthbarof")[0].query.project, undefined);
  const box = main(p).querySelector(".mk-strengthbox");
  assert.ok(says(box, "screen.question.strength.against", { capture: "C", connection: "C" }) && says(box, "screen.question.strength.meets"));
});

test("R2 R34 Supports lists every passage the question cites from its own legs, Cuts against its own; what it waits on, with who and why", async () => {
  const p = await open(at, A);
  const sup = section(p, "screen.question.supports.head"), cut = section(p, "screen.question.against.head");
  assert.ok(sup.querySelector(`a.cs-ref[href="/app/document/${D}"]`) && sup.querySelector('a.cs-ref[href="/app/document/INFO-2026-0005"]'));
  assert.ok(says(sup, "screen.question.leg.severed.why", { why: "the wrong year's orders" }));
  assert.equal(cut.querySelector(".cs-grade").getAttribute("data-scale"), "testimony");
  assert.ok(cut.querySelector('a.cs-ref[href="/app/document/INFO-2026-0006"]'));
  const waits = section(p, "screen.question.waits.head");
  assert.ok(says(waits, "screen.question.waits.setaside", { document: "2024 budget PDF", who: "ben", reason: "wrong year" }));
  const hunches = section(p, "screen.question.hunches.head");
  assert.ok(says(hunches, "screen.question.hunch.by", { who: "dev" }) && hunches.textContent.includes("Crews close reports when they inspect."));
});

test("R34 a question with two citations and no reading lists both; the strength sentence is drawn by its words, never raw grade text", async () => {
  const w = await stateWorld({ n: 2 });
  await ground(w, [{ ground: "part 1", legs: [0] }]);
  await severLeg(w, w.docs[1]);
  const p = await w.page();
  const sup = section(p, "screen.question.supports.head");
  assert.deepEqual(sup.querySelectorAll("a.cs-ref").map((a) => a.getAttribute("href")).sort(), w.docs.map((d) => `/app/document/${d}`).sort());
  assert.ok(!/\bB\/C\b|grade:/.test(main(p).querySelector(".mk-strengthbox").textContent.replace(word("screen.question.strength.against", { capture: "B", connection: "B" }), "")));
  /* control: a severed leg is drawn severed (R12) */
  assert.ok(sup.querySelector('[data-leg="severed"]'));
});

test("R23 state b: three cited passages and no partition: the ask first, no strength mark; saving sends the partition the answers give", async () => {
  const w = await stateWorld({ n: 3, legs: [{ grade: "B" }, { grade: "B" }, { grade: "C" }] });
  const p = await w.page();
  const m = main(p);
  assert.ok(says(m, "question.ask.first.title") && says(m, "question.ask.first.says"));
  assert.equal(m.querySelector(".mk-strengthbox"), null, "no strength mark and no strength sentence in state b");
  const ask = section(p, "question.ask.title");
  assert.equal(ask.querySelectorAll('[data-ask]').length, 3, "one question per cited passage");
  for (const fs of ask.querySelectorAll('fieldset[id^="ask-"]:not([id^="ask-which"])')) {
    assert.deepEqual(fs.querySelectorAll('input[type="radio"]').map((i) => i.getAttribute("value")), ["no", "yes"]);
    assert.ok(fs.querySelectorAll("input").every((i) => !i.checked), "none preselected");
  }
  assert.ok(says(ask, "question.ask.which") && says(ask, "question.rests.any") && says(ask, "question.rests.readback"));
  /* the first answered "no" (a passage the answer falls without: necessary, in no ground), the second and third holding each other up (one ground of two) (R23; DEC-32 clauses 2, 4) */
  p.doc.getElementById("ask-0-0").checked = true;
  p.doc.getElementById("ask-1-1").checked = true;
  p.doc.getElementById("ask-which-1-1").checked = true;
  await press(p, "inquiryground", { reason: "my first reading" });
  assert.deepEqual(p.byOp("inquiryground")[0].body.grounds, [{ ground: "part 1", legs: [1, 2] }]);
  assert.equal(p.byOp("inquiryground")[0].body.target, w.id);
  assert.ok(p.byOp("inquiryground")[0].body.grounds.every((g) => !("statement" in g)), "each part's statement left empty");
  /* no drawn word is AND or OR */
  assert.ok(!/\b(AND|OR)\b/.test(m.textContent));
  /* control: a question with a partition draws state a */
  const a = await w.page();
  assert.ok(main(a).querySelector(".mk-strengthbox") && !section(a, "question.ask.title"));
});

test("R24 R54 the read-back: one single part and one two-passage part in both shapes; who set it; each change; a shared origin's line", async () => {
  const legs = [{ target: D, role: "supports", ground: "part 1" }, { target: "INFO-2026-0007", role: "supports", ground: "part 2" }, { target: "INFO-2026-0009", role: "supports", ground: "part 2" }];
  const refs = legs.map((l) => [l.target, "cites", "confirmed", null]);
  const log = ["### Session 2026-10-08T09:00:00Z | Restructured | member:mai", "Trigger: op=inquiryground on " + Q, "Reason: the audit stands alone",
    "Strength before: capture B, connection C.", ""];
  const md = inquiryMd(P, refs, { legs, grounds: [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }], log });
  const titled = (id, t) => ({ "bundle.md": `---\nid: ${id}\ntitle: "${t}"\n---\n` });
  const docs = { "INFO-2026-0007": titled("INFO-2026-0007", "The count"), "INFO-2026-0009": titled("INFO-2026-0009", "The audit") };
  const p = await open(at, { images: { [Q]: { "bundle.md": md }, ...docs }, plane: {
    partitionindependence: ok({ ok: true, inquiry: Q, independence: { checked: true, parts: 2, shared: [{ a: "part 1", b: "part 2", through: ["issuer:Public Works"] }], complete: true } }),
    /* R54: who set it and each change come from `inquirypartition`; a `strength_after` of null is said, never computed */
    inquirypartition: ok({ ok: true, id: Q, grouped: true, groups: [{ ground: "part 1", asserted_by: "dev", at: "2026-10-05T09:00:00Z", legs: [0] }], ungrouped: [],
      changes: [{ at: "2026-10-05T09:00:00Z", by: "dev", act: "authored", reason: null, strength_before: null, strength_after: null },
        { at: "2026-10-08T09:00:00Z", by: "mai", act: "restructured", reason: "the audit stands alone", strength_before: { capture: { grade: "B" }, connection: { grade: "C" } }, strength_after: null }],
      strength_now: { capture: { grade: "B" }, connection: { grade: "C" } } }) } });
  const r = section(p, "question.rests.title");
  assert.ok(says(r, "question.rests.any"));
  assert.ok(r.textContent.includes(POLICY), "the single part, by its title as the reading shown names it");
  assert.ok(says(r, "question.rests.all", { passages: "The count, The audit" }));
  assert.ok(says(r, "question.origin.shared", { passages: POLICY + ", The count, The audit", origin: "Public Works" }));
  assert.ok(r.textContent.includes(lead("question.rests.set")) && r.textContent.includes("dev"));
  assert.ok(r.querySelector('[data-change="0"]').textContent.includes("the audit stands alone"));
  assert.ok(r.querySelector('[data-change="0"]').textContent.includes("B/C"), "the strength before, as the change records it");
  assert.equal(r.querySelectorAll("[data-change]").length, 1, "the first authoring is the setting, not a change");
  assert.ok(r.querySelector('[data-change="0"] .cs-gap'), "a strength_after of null is said as undetermined, never computed");
  /* "Change what a passage carries…" reopens the questions in place; the change is sent with her reason */
  const change = r.querySelector('[data-regroup="1"]');
  assert.ok(says(change.querySelector("summary"), "question.rests.change"));
  assert.equal(change.querySelectorAll("[data-ask]").length, 3, "R23's questions, in place");
  p.doc.getElementById("ask-0-0").checked = true;
  await press(p, "inquiryground", { within: section(p, "question.rests.title"), reason: "the audit stands alone after all" });
  assert.equal(p.byOp("inquiryground")[0].body.reason, "the audit stands alone after all", "NO_REASON: a restructure carries her reason");
  /* control: no shared origin answered draws no such line */
  const n = await open(at, { images: { [Q]: { "bundle.md": md } } });
  assert.equal(section(n, "question.rests.title").querySelector("[data-origin-shared]"), null);
});

test("R25 readings: three drawn with their states, one a what-if, stands on the project's CURRENT; each act sends its op with the version", async () => {
  const versions = [
    { name: "Seven-day standard", description: "The standard and the count.", state: "accepted", author: "member:dev", moved: { by: "dev", at: "2026-10-06T09:00:00Z" }, grounds: ["part 1"], legs: [] },
    { name: "Two counts", description: "Either count enough.", state: "considering", author: "member:ana", moved: { by: "ana", at: "2026-10-07T09:00:00Z", reason: "it may hold" }, grounds: [], legs: [] },
    { name: "The audit alone", description: "Only the audit.", state: "suggested", author: "member:mai", moved: null, at: "2026-10-08T09:00:00Z", grounds: [], legs: [] },
    { name: "Old", state: "rejected", author: "member:mai", moved: { by: "mai", at: "2026-10-02T09:00:00Z", reason: "wrong year" }, grounds: [], legs: [] }];
  const answer = (r) => ok({ ok: true, inquiry: Q, versions, ...(r.query.project ? { current: { project: P, version: "Seven-day standard" } } : {}) });
  /* N1073: the reading acts as the screen declares them, never hand-listed */
  const VERSION_ACTS = SCREENS.find((s) => s.id === "question").acts.map((a) => a.op).filter((op) => /^version/.test(op));
  assert.equal(VERSION_ACTS.length, 6);
  const acts = Object.fromEntries(VERSION_ACTS.map((op) => [op, ok({ ok: true })]));
  const p = await open(at, { ...A, plane: { basisversions: answer, ...acts } });
  const s = section(p, "question.readings.title");
  const row = (name) => section(p, "question.readings.title").querySelector(`[data-reading="${name}"]`);
  assert.ok(says(row("Seven-day standard"), "question.reading.accepted", { who: "dev", date: day("2026-10-06") }));
  assert.ok(says(row("Two counts"), "question.reading.weighing", { who: "ana", date: day("2026-10-07"), reason: "it may hold" }));
  assert.ok(row("The audit alone").textContent.includes(lead("question.reading.suggested")));
  assert.ok(says(row("Seven-day standard"), "question.reading.standson", { project: "Pothole repairs" }));
  assert.ok(says(row("Seven-day standard"), "question.reading.strength") && row("Seven-day standard").querySelector('[data-whatif="no"]'));
  assert.ok(says(row("The audit alone"), "question.reading.whatif") && row("The audit alone").querySelector('[data-whatif="yes"]'));
  assert.ok(p.byOp("versionstrength").some((r) => r.query.version === "The audit alone" && r.query.states === "suggested"), "the what-if names the reading's own state");
  /* rejected and hidden: counted, shown on press (a details) */
  assert.ok(says(s, "question.readings.more", { rejected: "1", hidden: "0" }));
  assert.ok(s.querySelector('[data-readings="more"] [data-reading="Old"]'));
  /* the chooser: record data, defaulting to the project's CURRENT */
  assert.equal(p.doc.getElementById("question-reading").value, "Seven-day standard");
  /* each act sends its op with the version; Stand on with project; accept affirms every ground */
  await press(p, "versionaccept", { within: row("Two counts") });
  await press(p, "versionconsider", { within: row("The audit alone"), reason: "worth weighing" });
  /* R64: Reject is a fold holding the required reason; with none it sends nothing */
  await press(p, "versionreject", { within: row("Two counts") });
  assert.equal(p.byOp("versionreject").length, 0, "no reason, nothing sent");
  fill(p, { "question-reject-1": "not enough on its own" });
  await press(p, "versionreject", { within: row("Two counts") });
  await press(p, "versionrevert", { within: row("Seven-day standard") });
  await press(p, "versionhide", { within: row("The audit alone") });
  const sent = { versionaccept: "Two counts", versionconsider: "The audit alone", versionreject: "Two counts", versionrevert: "Seven-day standard", versionhide: "The audit alone" };
  for (const [op, version] of Object.entries(sent)) assert.deepEqual([p.byOp(op)[0].body.version, p.byOp(op)[0].body.target], [version, Q], op);
  assert.equal(p.byOp("versionreject")[0].body.reason, "not enough on its own");
  /* Stand on: offered only on an accepted reading, not the CURRENT, to a joined member */
  const v2 = versions.map((v) => (v.name === "Two counts" ? { ...v, state: "accepted" } : v));
  const c = await open(at, { ...A, plane: { basisversions: (r) => ok({ ok: true, inquiry: Q, versions: v2, ...(r.query.project ? { current: { project: P, version: "Seven-day standard" } } : {}) }),
    versioncurrent: ok({ ok: true }), projectparticipants: ok({ ok: true, participants: [{ handle: "mai", state: "joined", owner: 0 }] }) } });
  const s2 = section(c, "question.readings.title");
  assert.deepEqual(s2.querySelectorAll('button[data-act="versioncurrent"]').map((b) => b.closest("[data-reading]").getAttribute("data-reading")), ["Two counts"]);
  await press(c, "versioncurrent", { within: s2.querySelector('[data-reading="Two counts"]') });
  assert.deepEqual([c.byOp("versioncurrent")[0].body.version, c.byOp("versioncurrent")[0].body.project], ["Two counts", P]);
});

test("R25 controls: a machine-authored reading is drawn only while the assistant is reachable; a refusal is drawn by its words", async () => {
  const versions = [{ name: "Machine reading", state: "suggested", author: "class:ai/t1", run: "RUN-1", grounds: [], legs: [] },
    { name: "Mine", state: "accepted", author: "member:dev", moved: { by: "dev", at: "2026-10-06T09:00:00Z" }, grounds: ["a", "b"], legs: [] }];
  const vs = ok({ ok: true, inquiry: Q, versions });
  const off = await open(at, { ...A, plane: { basisversions: vs } });
  assert.equal(main(off).querySelector('[data-reading="Machine reading"]'), null);
  const on = await open(at, reach({ ...A, plane: { basisversions: vs, versionaccept: { status: 200, json: { ok: true, result: { ok: false, code: "VERSION_AFFIRMATION_INCOMPLETE", reason: "VERSION_AFFIRMATION_INCOMPLETE", missing: ["b"] } } } } }));
  const row = section(on, "question.readings.title").querySelector('[data-reading="Machine reading"]');
  assert.ok(row && row.querySelector('.cs-origin[data-origin="machine"]'));
  const slot = await press(on, "versionaccept", { within: row });
  assert.ok(says(slot, "refusal.VERSION_AFFIRMATION_INCOMPLETE", { part: "b" }), "VERSION_AFFIRMATION_INCOMPLETE by its words");
});

test("R26 what relies on this: a project with its reading, a question and a published case; out of view says so, and only then", async () => {
  const relies = { ok: true, target: Q, backlinks: [{ from: P, from_type: "project", from_title: "Pothole repairs" },
    { from: "INQ-2026-0020-reopen", from_type: "inquiry", from_title: "Reopened within a month?" },
    { from: "CASE-2026-0001", from_type: "case", from_title: "Street safety, 2026" }], out_of_view: true };
  const p = await open(at, { ...A, plane: { backlinks: ok(relies) } });
  const s = section(p, "question.relies.title");
  assert.ok(says(s, "question.relies.project", { reading: "main" }), "the reading the project stands on");
  assert.ok(s.querySelector(`a.cs-ref[href="/app/question/INQ-2026-0020-reopen"]`));
  assert.ok(says(s, "question.relies.cites", { kind: word("shell.card.question") }));
  assert.ok(s.textContent.includes("Street safety, 2026"));
  assert.ok(says(s, "question.relies.outofview"));
  /* control: with out_of_view absent, the sentence is not drawn; with nothing at all, no section */
  const n = await open(at, { ...A, plane: { backlinks: ok({ ...relies, out_of_view: undefined }) } });
  assert.ok(!says(section(n, "question.relies.title"), "question.relies.outofview"));
  const e = await open(at, A);
  assert.equal(section(e, "question.relies.title"), undefined);
});

test("R27 Concluding links the case's screens where a read names the question's case; control: none named, none linked", async () => {
  const p = await open(at, { ...A, plane: { backlinks: ok({ ok: true, target: Q, backlinks: [{ from: "CASE-2026-0001", from_type: "case", from_title: "Street safety" }] }) } });
  const c = section(p, "screen.question.concluding.head").querySelector('[data-case="CASE-2026-0001"]');
  for (const k of ["case.links.editor", "case.links.review", "case.links.ceremony", "case.links.docket"]) assert.ok(says(c, k), k);
  const n = await open(at, A);
  assert.equal(section(n, "screen.question.concluding.head").querySelector("[data-case]"), null);
});

test("R35 R41 R50 conclude is offered once a passage is cited, on a reading that stands or one she writes; before a citation it is not and what is owed is said", async () => {
  /* nothing cited: no Concluding section, the owed sentence beneath the three ways (R50) */
  const empty = await open(at, { images: { [Q]: { "bundle.md": inquiryMd(P, [], { legs: [] }) } } });
  assert.ok(says(main(empty), "question.empty.conclude.own"));
  assert.ok(!actsIn(main(empty)).includes("conclude") && section(empty, "screen.question.concluding.head") === undefined);
  /* cited, and no reading stands: the form is offered with her own reading as the choice */
  const none = await open(at, { ...A, plane: { basisversions: ok({ ok: true, inquiry: Q, versions: [{ name: "draft", state: "considering", legs: [] }] }) } });
  const c = section(none, "screen.question.concluding.head");
  assert.ok(actsIn(c).includes("conclude"));
  assert.equal(none.doc.getElementById("question-conclude-reading").value, "", "no reading stands: her own is the choice");
  const p = await open(at, { ...A, plane: { conclude: ok({ ok: true }) } });
  const form = section(p, "screen.question.concluding.head").querySelector('[data-conclude="form"]');
  assert.ok(form.hasAttribute("open"), "a reading stands: Conclude opens by itself");
  for (const k of ["question.conclude.reading", "question.conclude.falsifier", "question.conclude.nofalsifier", "question.conclude.commentary"]) assert.ok(says(form, k), k);
  fill(p, { "question-conclude-falsifier": "inspection records showing repair", "question-conclude-reason": "both counts agree", "question-conclude-commentary": "the counts agree" });
  await press(p, "conclude");
  const q = p.byOp("conclude")[0].query;
  assert.deepEqual([q.target, q.project, q.version, q.falsifier, q.commentary, q.reason], [Q, P, "main", "inspection records showing repair", "the counts agree", "both counts agree"]);
  assert.ok(!("reading" in q), "an accepted reading sends version, never reading");
  for (const r of p.requests) for (const k of ["by", "author", "viewer", "assist", "draft"])
    assert.ok(!(k in (r.query || {})) && !(r.body && typeof r.body === "object" && k in r.body), `${r.op} sends ${k}`);
});

test("R41 conclude's controls: an empty falsifier with the box unticked sends nothing; ticked, it sends no_falsifier", async () => {
  const p = await open(at, { ...A, plane: { conclude: ok({ ok: true }) } });
  fill(p, { "question-conclude-falsifier": "", "question-conclude-reason": "why" });
  await press(p, "conclude");
  assert.equal(p.byOp("conclude").length, 0);
  p.doc.getElementById("question-conclude-none-0").checked = true;
  await press(p, "conclude");
  assert.equal(p.byOp("conclude")[0].query.no_falsifier, "1");
});

test("R41 state c, new and empty: nothing cited yet, the three ways in; the capture link carries the question (R38)", async () => {
  const world = await storeWorld({ ai: true });
  await aiTeam(world);
  const w = await stateWorld({ world, n: 0 });
  const p = await w.page();
  const s = section(p, "question.empty.heading");
  for (const k of ["question.empty.note", "question.empty.capture", "question.empty.find", "question.empty.ask"]) assert.ok(says(s, k), k);
  assert.equal(s.querySelector('[data-adddoc="question"]').getAttribute("href"), "/app/capture/address/" + w.id);
  assert.deepEqual(actsIn(s).sort(), ["airunopen", "search"]);
  /* without the assistant reachable, no "Ask the assistant to look" */
  const bare = await stateWorld({ n: 0 });
  const off = await bare.page();
  assert.deepEqual(actsIn(section(off, "question.empty.heading")), ["search"]);
});

test("R41 state d: a run of hers at work, the run's words and Stop the run", async () => {
  const world = await storeWorld({ ai: true });
  await aiTeam(world);
  const w = await stateWorld({ world, n: 1 });
  await readNotice(w);
  const run = await openRun(w);
  const p = await w.page();
  const s = section(p, "question.run.heading");
  assert.ok(says(s, "question.run.leave"));
  await press(p, "airunclose", { within: s });
  assert.deepEqual(p.byOp("airunclose")[0].body, { run, bound: "cancelled" });
});

test("R41 controls (D29): a run opened and withheld is never drawn at work; the withholding is said by its words", async () => {
  const world = await storeWorld({ ai: true });
  await aiTeam(world);
  const w = await stateWorld({ world, n: 0 });
  await readNotice(w);
  const p = await w.page();
  await press(p, "airunopen");
  assert.equal(section(p, "question.run.heading"), undefined, "never drawn at work");
  assert.ok(says(main(p).querySelector('[data-refusal="airundispatch"]'), "dock.withheld.AGENT_WORKER_UNBOUND"));
});

test("R41 state e: the assistant's proposal, machine work, accepted or declined with a reason", async () => {
  const versions = [{ name: "Proposed", state: "suggested", author: "class:ai/t", run: "RUN-1", claim: { text: "About 9 in 10 within seven days." }, grounds: [],
    legs: [{ target_id: D, target_title: "the 2026 performance report" }] }];
  const p = await open(at, reach({ ...A, plane: { basisversions: ok({ ok: true, inquiry: Q, versions }), versionreject: ok({ ok: true }) } }));
  const s = section(p, "question.proposal.heading");
  assert.ok(s.querySelector('[data-origin="machine"]') && s.textContent.includes("About 9 in 10 within seven days."));
  assert.ok(s.textContent.includes("the 2026 performance report"));
  assert.ok(says(s.querySelector("details[data-reject] summary"), "screen.question.reject.summary"), "R64: the fold");
  assert.ok(says(s, "ai.progress.checked.all"), "R58: beneath the proposal");
  await press(p, "versionreject", { within: s });
  assert.equal(p.byOp("versionreject").length, 0, "R64: no reason, nothing sent");
  fill(p, { "question-reject-0": "it skips the audit" });
  await press(p, "versionreject", { within: s });
  assert.deepEqual([p.byOp("versionreject")[0].body.version, p.byOp("versionreject")[0].body.reason], ["Proposed", "it skips the audit"]);
});

test("R41 R42 state f: the limit's words naming no cost, the note, and the other reasons; control: a reachable assistant draws none", async () => {
  const empty = inquiryMd(P, [], { legs: [] });
  const limit = { status: 200, json: { ok: true, result: { run: "x", started: false, code: "AI_LIMIT_REACHED", whose: "the team's", period: "monthly", when: "on 1 November" } } };
  const p = await open(at, reach({ images: { [Q]: { "bundle.md": empty } }, plane: { airunopen: limit } }));
  assert.equal(main(p).querySelector('[data-reasons="question"]'), null, "nothing refused: no reasons drawn");
  await press(p, "airunopen");
  const f = section(p, "question.empty.ask");
  assert.ok(says(f, "ai.refused.limit.overall", { whose: "the team's", period: "monthly", when: "on 1 November" }));
  assert.ok(says(f, "question.limit.note") && says(f, "question.ai.other") && says(f, "question.ai.whose"));
  assert.ok(!/\$\d/.test(f.textContent), "no cost named");
  assert.equal(p.byOp("airundispatch").length, 0, "started: false dispatches nothing");
});

test("R41 state g: concluded, who and when, the reading's words, what would change it, its strength, withdraw and plan", async () => {
  const p = await open(at, { ...A, plane: { basisversions: ok(BASIS({ conclusion: { claim: { text: "No: 1 in 10 is not repaired in time." }, by: "member:dev",
    at: "2026-10-13T09:00:00Z", falsifier: "logs showing repairs dated later" }, conclusion_stance: "concluded" })) } });
  const g = section(p, "question.concluded.heading");
  assert.ok(g.textContent.includes(lead("question.concluded.by")) && g.textContent.includes("dev") && g.textContent.includes(day("2026-10-13")));
  assert.ok(g.textContent.includes("No: 1 in 10 is not repaired in time."));
  assert.ok(says(g, "question.concluded.falsifier", { falsifier: "logs showing repairs dated later" }));
  assert.equal(g.querySelectorAll(".cs-grade").length, 2);
  assert.deepEqual(actsIn(g), ["casedraft", "planopen", "withdrawconclusion"], "R62: in this order");
  assert.ok(!actsIn(main(p)).includes("conclude"), "never a second conclusion");
  await press(p, "withdrawconclusion", { within: g, reason: "new evidence" });
  assert.deepEqual(p.byOp("withdrawconclusion")[0].query, { op: "withdrawconclusion", target: Q, project: P, reason: "new evidence" });
});

test("R41 state g: concluded over a project is drawn from the read that names the project (basis-versions answers a conclusion only to it)", async () => {
  const concluded = { conclusion: { claim: { text: "No: 1 in 10 is not repaired in time." }, by: "member:dev", at: "2026-10-13T09:00:00Z" }, conclusion_stance: "concluded" };
  const basis = (withdrawn) => (r) => ok(BASIS(r.query.project ? { ...concluded, ...(withdrawn ? { conclusion_stance: "withdrawn" } : {}) } : {}));
  const p = await open(at, { ...A, plane: { basisversions: basis(false) } });
  const g = section(p, "question.concluded.heading");
  assert.ok(g.textContent.includes("No: 1 in 10 is not repaired in time.") && g.textContent.includes("dev"));
  assert.deepEqual(actsIn(g), ["casedraft", "planopen", "withdrawconclusion"]);
  assert.ok(p.byOp("basisversions").some((c) => c.query.project === P), "read with the project");
  /* control: the project's read answers the conclusion withdrawn: state g is not drawn */
  const w = await open(at, { ...A, plane: { basisversions: basis(true) } });
  assert.equal(w.root().querySelector("#state-g"), null);
});

test("R36 C63 after planopen, the question opens its plan page (fix round 3; it no longer stays to link it); control: a refused press opens none", async () => {
  const w = await stateWorld({ n: 1 });
  const p = await w.page();
  assert.equal(main(p).querySelector("[data-plan]"), null);
  fill(p, { "question-plan": "Ask the committee" });
  await press(p, "planopen");
  assert.deepEqual(p.byOp("planopen")[0].body, { project: w.project, title: "Ask the committee", subjects: [{ kind: "inquiry", inquiry: w.id }] });
  assert.match(p.location.pathname, /^\/app\/plan\/PLAN-/, "the plan page is opened with the plan as subject");
  const plan = decodeURIComponent(p.location.pathname.slice("/app/plan/".length));
  const held = await w.ann.read("plans", { query: { project: w.project } });
  assert.ok(JSON.stringify(held).includes(plan) && JSON.stringify(held).includes("Ask the committee"), "the plan the page opened is the one the plane holds: " + JSON.stringify(held).slice(0, 300));
});

test("R31 Read in my language sends the question as subject, the answer drawn in place and labeled, the original back by one press", async () => {
  const tr = ok({ ok: true, translation: "¿Repara la ciudad los baches en siete días?", language: "es", from_language: "English", original: { kind: "question", id: Q } });
  const p = await open(at, reach({ ...A, plane: { readtranslate: tr } }));
  await press(p, "readtranslate");
  assert.deepEqual(p.byOp("readtranslate")[0].body, { subject: { kind: "question", id: Q, project: P } });
  const shown = main(p).querySelector('[data-translation="shown"]');
  assert.ok(shown.textContent.includes("¿Repara la ciudad") && says(shown, "translate.label", { language: "English" }) && says(shown, "translate.label.help"));
  assert.ok(says(button(p, "readtranslate"), "translate.original"));
  await press(p, "readtranslate");
  assert.equal(main(p).querySelector('[data-translation="shown"]'), null, "the original back by one press");
  assert.equal(p.byOp("readtranslate").length, 1, "nothing read again, nothing saved");
  /* control: no control while the assistant is not reachable, and none on a passage */
  const off = await open(at, A);
  assert.ok(!actsIn(main(off)).includes("readtranslate"));
  assert.equal(main(p).querySelectorAll('.cs-row button[data-act="readtranslate"]').length, 0, "no control on a passage");
  /* LANGUAGE_NOT_SET by its words */
  const ns = await open(at, reach({ ...A, plane: { readtranslate: refusedIn("LANGUAGE_NOT_SET", "Choose your reading language first.") } }));
  assert.ok(says(await press(ns, "readtranslate"), "refusal.LANGUAGE_NOT_SET"), "LANGUAGE_NOT_SET by its words");
});

test("R38 Add a document opens capture with the question as its subject", async () => {
  const p = await open(at, A);
  const a = section(p, "screen.question.supports.head").querySelector('[data-adddoc="question"]');
  assert.equal(a.getAttribute("href"), "/app/capture/address/" + Q);
  assert.ok(says(a, "question.adddoc"));
});

test("R39 no heading is a record id; a question with no words or title draws undetermined", async () => {
  const p = await open(at, A);
  for (const h of main(p).querySelectorAll("h1, h2")) assert.doesNotMatch(h.textContent, /PROJ-|INQ-|INFO-/);
  const bare = await open(at, { images: { [Q]: { "bundle.md": `---\nid: ${Q}\nobject_type: inquiry\n---\n` } } });
  assert.ok(main(bare).querySelector("h1").textContent.startsWith(lead("state.undetermined")));
});

test("R2 the other acts send what their owners take", async () => {
  const p = await open(at, { ...A, plane: { narrow: ok({ ok: true }), hypothesishold: ok({ ok: true }), checkrequest: ok({ ok: true }), heldrestore: ok({ ok: true }) } });
  /* R87: Narrow is exercised in fr28-question.test.mjs (it reads the proposed parts first) */
  fill(p, { "question-hunch": "Inspections close them.", "question-hunch-kind": "flow" });
  await press(p, "hypothesishold");
  assert.deepEqual(p.byOp("hypothesishold")[0].body, { inquiry: Q, kind: "flow", statement: "Inspections close them.", about: { from: D, to: Q } });
  fill(p, { "question-check": "engineering", "question-check-note": "the crew reports" });
  await press(p, "checkrequest");
  assert.deepEqual(p.byOp("checkrequest")[0].body, { target: Q, label: "engineering", note: "the crew reports" });
  await press(p, "heldrestore", { reason: "it is the right year after all" });
  assert.deepEqual(p.byOp("heldrestore")[0].body, { ids: ["INFO-2026-0008"], reason: "it is the right year after all" });
});

test("R2 cite chooses its passage in Find in over the question's project; Find another source searches its words", async () => {
  const p = await open(at, A);
  await press(p, "cite");
  assert.equal(p.location.pathname, "/app/find-in/" + P);
  const s = await open(at, A);
  await press(s, "search", { within: section(s, "screen.question.waits.head") });
  assert.equal(decodeURIComponent(s.location.pathname), "/app/finder/Is the city repairing reported potholes within seven days?");
});

test("R2 controls: a hunch, a check and a narrowing with nothing written are refused by their words; a refused act keeps the form", async () => {
  const p = await open(at, { ...A, plane: { hypothesishold: refusedIn("SOME_REFUSAL", "Write the hunch.") } });
  assert.ok(says(await press(p, "hypothesishold"), "screen.question.hunch.empty"));
  assert.ok(says(await press(p, "checkrequest"), "screen.question.check.empty"));
  assert.equal(p.byOp("hypothesishold").length + p.byOp("checkrequest").length + p.byOp("narrow").length, 0);
  fill(p, { "question-hunch": "x" });
  const slot = await press(p, "hypothesishold");
  assert.ok(slot.textContent.includes("Write the hunch."));
  assert.equal(p.doc.getElementById("question-hunch").value, "x");
});

test("R12 sever is drawn on each live leg (confirmed or proposed) and reinstate on each severed one; a severed leg stays in its section", async () => {
  const p = await open(at, A);
  const sup = section(p, "screen.question.supports.head"), cut = section(p, "screen.question.against.head");
  const rowOf = (sec, target) => sec.querySelectorAll(".cs-row").find((r) => r.querySelector(`a.cs-ref[href="/app/document/${target}"]`));
  assert.deepEqual(actsIn(rowOf(sup, D)), ["sever", "narrow"], "a confirmed leg (R87: and Narrow)");
  assert.deepEqual(actsIn(rowOf(sup, "INFO-2026-0005")), ["reinstate"], "a severed leg, still under Supports");
  assert.deepEqual(actsIn(rowOf(cut, "INFO-2026-0006")), ["sever", "narrow"], "a proposed leg");
  /* control: a leg the inquiry holds no reference to is offered neither */
  const bare = await open(at, { images: { [Q]: { "bundle.md": grouped().replace(/  - target: INFO-2026-0004\n    rel: cites\n    status: confirmed\n/, "") } } });
  assert.deepEqual(actsIn(section(bare, "screen.question.supports.head").querySelectorAll(".cs-row").find((r) => r.querySelector(`a.cs-ref[href="/app/document/${D}"]`))), []);
});

test("R12 sever and reinstate select the leg's target, then act on the question as the citing object, with her reason", async () => {
  const w = await stateWorld({ n: 2 });
  const [live, gone] = w.docs;
  await severLeg(w, gone, "the wrong year's orders");
  const p = await w.page();
  await press(p, "sever", { reason: "it is the 2023 policy", within: section(p, "screen.question.supports.head") });
  /* the page re-reads what her press did: the first leg is severed now, so the leg she reinstates is the one she severed before, named by its row */
  const rowOf = (pg, target) => section(pg, "screen.question.supports.head").querySelectorAll(".cs-row").find((r) => r.querySelector(`a.cs-ref[href="/app/document/${target}"]`));
  await press(p, "reinstate", { reason: "the orders were right after all", within: rowOf(p, gone) });
  assert.deepEqual(p.byOp("select").map((r) => r.body), [{ ids: [live] }, { ids: [gone] }]);
  const sv = p.byOp("sever")[0].query, rn = p.byOp("reinstate")[0].query;
  assert.deepEqual([sv.project, sv.reason], [w.id, "it is the 2023 policy"]);
  assert.deepEqual([rn.project, rn.reason], [w.id, "the orders were right after all"]);
  assert.ok(sv.handle && rn.handle && sv.handle !== rn.handle, "each selection is its own handle, the one the selection answered");
  /* the real record now holds what she did: the first leg severed, the second live again */
  const after = await w.page();
  assert.deepEqual(actsIn(rowOf(after, live)), ["reinstate"], "the first leg is severed now");
  assert.deepEqual(actsIn(rowOf(after, gone)), ["sever"], "the second leg is live again (Narrow is offered only where the reading proposes a narrower part; these are plain text)");
  /* controls: a selection refused sends no act and says so beside it */
  const s = await w.page({ plane: { select: refusedIn("SCOPE_TOO_LARGE") } });
  const slot = await press(s, "sever", { reason: "why", within: section(s, "screen.question.supports.head") });
  assert.ok(says(slot, "screen.question.leg.unselectable"));
  assert.equal(s.byOp("sever").length, 0);
});

test("R2 R39 (K3402) the question says who opened it, by handle from the record's first promotion; a cited passage is named by its words or its document's title, never its id", async () => {
  const w = await stateWorld({ n: 1, as: "dev", names: ["The 2026 performance report"] });
  /* a later promotion by another member (mai's own reading of the question) must not change who opened it */
  const mai = await w.world.signIn("mai", { capabilities: ["contribute"] });
  await w.ann.act("projectinvite", { query: { projectId: w.project, handle: "mai" }, body: {} });
  await mai.act("projectjoin", { query: { projectId: w.project }, body: {} });
  await mai.act("inquiryground", { body: { target: w.id, grounds: [{ ground: "part 1", legs: [0] }] } });
  const p = await w.page();
  const opened = day(new Date(w.world.now()).toISOString());
  const sub = main(p).querySelector(".mk-sub");
  assert.ok(sub.textContent.includes(word("screen.question.opened", { name: "dev", date: opened, project: "" }).trim()), "the opener filled: " + sub.textContent);
  assert.doesNotMatch(main(p).textContent, /\{name\}/);
  assert.ok(main(p).textContent.includes("The 2026 performance report"), "the document's title");
  for (const el of main(p).querySelectorAll("a.cs-ref, .rec, .mk-ev")) assert.doesNotMatch(el.textContent, new RegExp(w.docs[0]), "never the record id");
  /* control: a record that names no opener draws `screen.project.opened.date`, never an undetermined name and never the placeholder
     (changed in fix round 3: R2, C44 now says so; it drew "Opened by" with an undetermined name). The world's record always carries its first promotion,
     so this one stays a record written by hand, with no promotion history. */
  const ID = "INFO-2026-0002-2026-118";
  const md = inquiryMd(P, [[ID, "cites", "confirmed", null]], { legs: [{ target: ID, role: "supports", grade: "B" }] });
  const none = await open(at, { images: { [Q]: { "bundle.md": md } } });
  assert.ok(main(none).querySelector(".mk-sub").textContent.includes(word("screen.project.opened.date", { date: day("2026-10-03") }).trim()));
  assert.doesNotMatch(main(none).querySelector(".mk-sub").textContent, /\{name\}/);
});
