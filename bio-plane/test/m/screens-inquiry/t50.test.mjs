/* screens-inquiry R50, R51, R55, R56, R57, R58, R59, R62, R64 (T50-32): the question page's own reading, its three steps, a
 * concluded question's case, how a run ends and what it cost, its progress as it is made, the affirmation of a reading of
 * several parts, and the stopped run's decline; the document page's held copy and themes. On interface-shell's served page
 * over a scripted plane. Every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot, ok } from "../interface-shell/harness.mjs";
import { open, storeWorld, WORLD_FOUNDER_HANDLE, main, actsIn, press, fill, inquiryMd, INQUIRY_REFS, LEGS, BASIS, plane, says, section, word, SCREENS, P, Q, D, SHA } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }), agentpack: ok({ ok: true, pack: { version: "p@1" } }) };
const GROUNDS = [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }];
const cited = (o = {}) => inquiryMd(P, INQUIRY_REFS, { legs: LEGS.map((l) => (l.target === D ? { ...l, ground: "part 1" } : l)), grounds: GROUNDS, ...o });
const A = { images: { [Q]: { "bundle.md": cited() } } };
const reach = (o = {}) => ({ images: o.images, boot: { plane: { ...plane(o), ...REACH, airuns: ok({ ok: true, runs: [] }), ...(o.reach || {}) } } });
const RUN = "RUN-" + "e".repeat(16);
const mine = (o = {}) => ({ id: RUN, status: "running", ticks: 2, principal: { plane: "member:mai" }, ...o });
/** A project with `n` held documents and a question in it resting on them, drawn into the project: all by real acts over the world.
 *  Answers `{world, ann, project, docs, id, page(opts)}`; `page` boots the question's page over the world (`plane` overrides only the ops it names). */
const stateWorld = async ({ n = 1, world = null } = {}) => {
  world = world || await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  const docs = [];
  for (let i = 0; i < n; i++) docs.push((await world.recipes.hold(ann, "Passage " + (i + 1), "The Director shall repair each reported pothole, part " + (i + 1) + ".", project)).bundle);
  const made = docs.map((target) => ({ target, role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture" }));
  const id = (await world.recipes.question(ann, project, { title: "Seven days", text: "Do crews repair each pothole within seven days?", legs: made, draw: true })).id;
  const page = async (o = {}, who = ann) => {
    const { door, session } = world.boot(who);
    const p = await boot({ screens: SCREENS, door, session, path: "/app/question/" + id, ...o });
    await p.settle();
    return p;
  };
  return { world, ann, project, docs, id, page };
};
/** the team's Claude account, by the administrator's real acts (the world made with `storeWorld({ ai: true })`): her password again, the team's key set and switched on, its notice read */
const aiTeam = async (world) => {
  const admin = await world.signIn(WORLD_FOUNDER_HANDLE);
  await admin.act("reauth", { body: { password: admin.password } });
  await admin.act("groupkeyset", { body: { key: "sk-ant-api03-" + "w".repeat(40) } });
  await admin.act("groupkeyswitch", { body: { on: true } });
  await admin.act("groupkeynoticeseen", { body: {} });
};
/** a run of the member's own over the question, opened by her real act (`airunopen`: running, before anything dispatches it); the member reads the team's notice first */
let runs = 0;
const openRun = async (w, run = "RUN-" + String(++runs).padStart(16, "c")) => {
  await w.ann.act("groupkeynoticeseen", { body: {} });
  await w.ann.act("airunopen", { body: { run, contextType: "inquiry", contextId: w.id, skillVersion: "investigative-session@1", principalClaude: `member:${w.ann.member}`, mode: "check" } });
  return run;
};
const steps = (p) => main(p).querySelectorAll("[data-steps] li").map((li) => [li.getAttribute("data-step"), li.getAttribute("data-state")]);

test("R50 Conclude takes a member's own reading: reading is sent in place of version; an empty reading is refused in place and nothing is sent", async () => {
  /* the real state: a question resting on a held passage, no reading made for it, so her own is the choice */
  const w = await stateWorld();
  const p = await w.page();
  assert.equal(p.doc.getElementById("question-conclude-reading").value, "", "no reading stands: her own is the choice");
  assert.ok(says(p.doc.getElementById("question-conclude-reading"), "question.conclude.own.choice"));
  assert.ok(p.doc.getElementById("question-conclude-own"), "Your reading");
  fill(p, { "question-conclude-falsifier": "records showing repair", "question-conclude-own": "", "question-conclude-reason": "my reason", "question-conclude-commentary": "my note" });
  await press(p, "conclude");
  assert.equal(p.byOp("conclude").length, 0, "an empty reading sends nothing");
  fill(p, { "question-conclude-own": "Most reports are repaired within seven days." });
  await press(p, "conclude");
  const q = p.byOp("conclude")[0].query;
  assert.equal(q.reading, "Most reports are repaired within seven days.");
  assert.ok(!("version" in q), "reading in place of version");
  /* a conclusion on a member's own reading names who wrote it, never marked machine work (the conclusion the press just made, read again) */
  const g = await w.page();
  const sec = section(g, "question.concluded.heading");
  assert.ok(sec, "the conclusion is drawn");
  assert.ok(says(sec, "question.reading.by.member", { member: w.ann.member }));
  assert.equal(sec.querySelector('[data-origin="machine"]'), null);
});

test("R51 the three steps: each state draws its step as current; the new question draws the three buttons and no Concluding section; secondary acts fold under more", async () => {
  const empty = await open(at, reach({ images: { [Q]: { "bundle.md": inquiryMd(P, [], { legs: [] }) } } }));
  assert.deepEqual(steps(empty), [["source", "current"], ["mark", "todo"], ["conclude", "todo"]]);
  assert.equal(section(empty, "screen.question.concluding.head"), undefined);
  assert.equal(empty.root().querySelector('[data-adddoc="question"]').getAttribute("data-tone"), "primary");
  assert.ok(says(main(empty), "question.empty.conclude.own"));
  /* still scripted (basisversions): needed: a recipe for a question holding a considering reading (basis-versions has no act that makes a version) */
  const ask = await open(at, { ...A, plane: { basisversions: ok({ ok: true, inquiry: Q, versions: [{ name: "draft", state: "considering", legs: [] }] }) } });
  assert.deepEqual(steps(ask), [["source", "done"], ["mark", "current"], ["conclude", "todo"]]);
  const stands = await open(at, A);
  assert.deepEqual(steps(stands), [["source", "done"], ["mark", "done"], ["conclude", "current"]]);
  const more = main(stands).querySelector('details[data-fold="more"]');
  assert.ok(says(more.querySelector("summary"), "question.more"));
  assert.deepEqual(actsIn(more).sort(), ["checkrequest", "inquirydivide", "planopen", "proposedispose", "search"], "R71: set aside for the project is among them");
  const done = await open(at, { ...A, plane: { basisversions: ok(BASIS({ conclusion: { claim: { text: "x" }, by: "member:dev", at: "2026-10-13T09:00:00Z" }, conclusion_stance: "concluded" })) } });
  assert.deepEqual(steps(done), [["source", "done"], ["mark", "done"], ["conclude", "done"]]);
});

test("R62 a concluded question offers a case: casedraft with the project and the question as the one target, no case; not concluded, none", async () => {
  const w = await stateWorld();
  /* not concluded: none */
  const n = await w.page();
  assert.ok(!actsIn(main(n)).includes("casedraft"));
  /* concluded by her real act (a reading of her own, within the project, as the page's press carries it) */
  await w.ann.act("conclude", { query: { target: w.id, project: w.project, reading: "Most reports are repaired within seven days.", falsifier: "records showing otherwise" } });
  const p = await w.page();
  assert.deepEqual(actsIn(section(p, "question.concluded.heading")), ["casedraft", "planopen", "withdrawconclusion"]);
  await press(p, "casedraft");
  const b = p.byOp("casedraft")[0].body;
  assert.deepEqual([b.project, b.targets, "caseId" in b, "newCase" in b], [w.project, [w.id], false, false]);
});

test("R57 a run ends in the ending's own words, never its code; the cost to the owner only; a stopped run says what was kept", async () => {
  const ended = (c) => ({ id: RUN, status: "completed", principal: { plane: "member:mai" }, condition: { bound: c } });
  for (const [bound, key] of [["wallclock", "ai.run.ending.wallclock"], ["cancelled", "ai.run.ending.cancelled"], ["zzz", "ai.run.ending.unknown"]]) {
    let p;
    if (bound === "zzz") {
      /* still scripted (airuns): needed: a run closed with an ending the words do not know (airunclose refuses a bound that names none: AI_RUN_BOUND_UNNAMED) */
      p = await open(at, reach({ ...A, reach: { airuns: ok({ ok: true, runs: [ended(bound)] }) } }));
    } else {
      /* the real state: her run opened and closed with the ending, by the acts the page makes */
      const world = await storeWorld({ ai: true });
      await aiTeam(world);
      const w = await stateWorld({ world });
      const run = await openRun(w);
      await w.ann.act("airunclose", { body: { run, bound } });
      p = await w.page();
    }
    assert.ok(says(main(p), "screen.assistant.run.ended", { why: word(key) }), bound);
    assert.ok(!main(p).textContent.includes(bound === "zzz" ? "zzz" : "\u0000"), "the code is never drawn");
    assert.equal(!!main(p).querySelector('[data-run="stopped"]'), bound === "cancelled", "R64: only a stopped run says what was kept");
  }
  /* still scripted (airuns, airun): needed: a closed run with a cost recorded against its account (no act records a run's cost: it comes of the model's own calls) */
  const withCost = (cost) => reach({ ...A, reach: { airuns: ok({ ok: true, runs: [ended("completed")] }), airun: ok({ ok: true, session: { id: RUN, status: "completed", ...(cost ? { cost } : {}) } }) } });
  const owner = await open(at, withCost({ owner: "member:mai", calls: 3, tokens: 900, cost: { usd: 0.42 }, unit: "usd" }));
  assert.ok(says(main(owner), "screen.assistant.run.cost.final", { cost: word("ai.run.cost.money", { amount: "$0.42", calls: 3 }), account: word("ai.run.cost.on.apikey") }));
  const sub = await open(at, withCost({ owner: "member:mai", calls: 3, tokens: 900, cost: null, unit: "tokens" }));
  assert.ok(says(main(sub), "ai.run.cost.tokens", { tokens: 900, calls: 3 }));
  const other = await open(at, withCost(null));
  assert.equal(main(other).querySelector('[data-run="cost"]'), null, "no cost line when session.cost is absent");
});

test("R58 a run's progress is drawn from its log's fields, each row as it arrives; the proposal waits for the check; airunopen carries the project", async () => {
  /* the run is hers and real (opened by her act); still scripted (airunlog): needed: a run whose log rows carry the progress fields (read, found, checked), which no act makes: airuntick appends rows of level, subject, state and detail only */
  const world = await storeWorld({ ai: true });
  await aiTeam(world);
  const w = await stateWorld({ world });
  await openRun(w);
  const entries = [{ read: { record: w.docs[0], n: 1, total: 2, outcome: "answered" } }, { read: { record: "INFO-2026-0005", n: 2, total: 2, outcome: "refused" } }, { found: 3 }];
  const p = await w.page({ plane: { airunlog: ok({ ok: true, entries }) } });
  const prog = main(p).querySelector("[data-progress]");
  assert.equal(prog.querySelectorAll('li[data-step="reading"]').length, 2, "the reads, in order");
  assert.ok(says(prog.querySelectorAll('li[data-step="reading"]')[0], "ai.progress.reading", { document: "Passage 1", n: 1, total: 2 }));
  assert.equal(prog.querySelectorAll('li[data-outcome="refused"]').length, 1, "a refused re-read is drawn as refused, naming none");
  assert.ok(says(prog, "ai.progress.read", { total: 2 }) && says(prog, "ai.progress.found", { count: 3 }) && says(prog, "ai.progress.hold"));
  assert.equal(section(p, "question.proposal.heading"), undefined, "no proposal while the run works");
  /* the check found none: the sentence stands in place of any proposal */
  const proposal = [{ name: "Proposed", state: "suggested", author: "class:ai/t", run: RUN, claim: { text: "About 9 in 10." }, legs: [] }];
  /* still scripted (basisversions, airunlog): needed: a question holding a machine-authored suggested reading made by its run, and a log row carrying the check's figures; the run itself is real, ended by her act */
  const w2 = await stateWorld({ world: await storeWorld({ ai: true }) });
  await aiTeam(w2.world);
  const run2 = await openRun(w2);
  await w2.ann.act("airunclose", { body: { run: run2, bound: "completed" } });
  const failed = await w2.page({ plane: { basisversions: ok({ ok: true, inquiry: w2.id, versions: proposal.map((v) => ({ ...v, run: run2 })) }), airunlog: ok({ ok: true, entries: [{ checked: { ok: 0, total: 2 } }] }) } });
  assert.ok(says(main(failed), "ai.progress.check.failed"));
  assert.equal(section(failed, "question.proposal.heading"), undefined);
  /* airunopen carries the question's project */
  const o = await open(at, reach({ images: { [Q]: { "bundle.md": inquiryMd(P, [], { legs: [] }) } }, plane: { airunopen: ok({ run: "x", started: true }), airundispatch: ok({ dispatched: true }) } }));
  await press(o, "airunopen");
  assert.equal(o.byOp("airunopen")[0].body.project, P);
});

test("R59 R64 accepting a reading of several parts asks each part; Decline sends the version's reject with its reason", async () => {
  /* still scripted (basisversions, versionaccept): needed: a question holding a suggested reading of several parts (basis-versions has no act that makes a version) */
  const v = { name: "Two parts", state: "suggested", author: "member:ana", parts: ["part 1", "part 2"], legs: [], grounds: [] };
  const p = await open(at, { ...A, plane: { basisversions: ok({ ok: true, inquiry: Q, versions: [v] }), versionaccept: ok({ ok: true }) } });
  const row = section(p, "question.readings.title").querySelector('[data-reading="Two parts"]');
  assert.ok(says(row, "reading.affirm.head") && says(row, "reading.affirm.says", { n: 2 }) && says(row, "reading.affirm.part", { part: "part 1" }));
  p.doc.getElementById("affirm-0-0").checked = true;
  await press(p, "versionaccept", { within: row });
  assert.deepEqual(p.byOp("versionaccept")[0].body.affirmed, ["part 1"], "the parts she ticked");
  /* a reading of one part asks none */
  /* still scripted (basisversions): needed: the same, a reading of one part */
  const one = await open(at, { ...A, plane: { basisversions: ok({ ok: true, inquiry: Q, versions: [{ ...v, name: "One", parts: ["part 1"] }] }) } });
  assert.equal(one.doc.getElementById("affirm-0"), null);
});

test("R55 R56 the document: a held copy is vouched for and replaced by the vouched line; a placement in a theme is drawn apart from evidence", async () => {
  /* the real state: a copy she captured by her own upload (held until she vouches for it), placed in a theme she declared */
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const held = await world.recipes.hold(ann, "Policy memo", "The Director shall repair each reported pothole within seven days.");
  const made = await ann.act("themedeclare", { body: { name: "Deferred maintenance", test: "the document concerns deferred maintenance" } });
  await ann.act("themeplace", { body: { theme: made.theme_id, target: held.bundle, note: "ref" } });
  const at = "/app/document/" + held.bundle;
  const pageOf = async (who) => {
    const { door, session } = world.boot(who);
    const page = await boot({ screens: SCREENS, door, session, path: at });
    await page.settle();
    return page;
  };
  const p = await pageOf(ann);
  assert.ok(says(main(p), "document.held.says"));
  assert.ok(main(p).textContent.includes("Deferred maintenance") && says(main(p), "theme.never.evidence"));
  fill(p, { "document-release-ack": "I read it", "document-release-mitigation": "none" });
  await press(p, "release");
  assert.ok(!says(main(p), "document.held.says") && main(p).querySelector("[data-vouched]"), "replaced at once by the vouched line");
  assert.ok(actsIn(main(p)).includes("attest") && main(p).querySelector('details[data-fold="retire"]'), "attest and a folded retire at the foot");
  /* control: a document the viewer did not capture draws no held banner */
  const theirs = await world.recipes.hold(ann, "Her own memo", "Held by Ann alone.");
  const rosa = await world.signIn("rosa", { capabilities: ["contribute", "create_projects"] });
  const { door, session } = world.boot(rosa);
  const o = await boot({ screens: SCREENS, door, session, path: "/app/document/" + theirs.bundle });
  await o.settle();
  assert.ok(main(o).textContent.includes("Her own memo"), "the document itself is drawn");
  assert.equal(main(o).querySelector("[data-held]"), null);
});
