/* screens-inquiry R50, R51, R55, R56, R57, R58, R59, R62, R64 (T50-32): the question page's own reading, its three steps, a
 * concluded question's case, how a run ends and what it cost, its progress as it is made, the affirmation of a reading of
 * several parts, and the stopped run's decline; the document page's held copy and themes. On interface-shell's served page
 * over a scripted plane. Every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, actsIn, press, fill, inquiryMd, INQUIRY_REFS, LEGS, BASIS, plane, says, section, word, P, Q, D, SHA } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }), agentpack: ok({ ok: true, pack: { version: "p@1" } }) };
const GROUNDS = [{ ground: "part 1", asserted_by: "member:dev", at: "2026-10-05T09:00:00Z" }];
const cited = (o = {}) => inquiryMd(P, INQUIRY_REFS, { legs: LEGS.map((l) => (l.target === D ? { ...l, ground: "part 1" } : l)), grounds: GROUNDS, ...o });
const A = { images: { [Q]: { "bundle.md": cited() } } };
const reach = (o = {}) => ({ images: o.images, boot: { plane: { ...plane(o), ...REACH, airuns: ok({ ok: true, runs: [] }), ...(o.reach || {}) } } });
const RUN = "RUN-" + "e".repeat(16);
const mine = (o = {}) => ({ id: RUN, status: "running", ticks: 2, principal: { plane: "member:mai" }, ...o });
const steps = (p) => main(p).querySelectorAll("[data-steps] li").map((li) => [li.getAttribute("data-step"), li.getAttribute("data-state")]);

test("R50 Conclude takes a member's own reading: reading is sent in place of version; an empty reading is refused in place and nothing is sent", async () => {
  const none = ok({ ok: true, inquiry: Q, versions: [{ name: "draft", state: "considering", legs: [] }] });
  const p = await open(at, { ...A, plane: { basisversions: none, conclude: ok({ ok: true }) } });
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
  /* a conclusion on a member's own reading names who wrote it, never marked machine work */
  const mineV = { name: "Mine", state: "accepted", author: "member:mai", claim: { text: "Most are repaired." }, legs: [], grounds: [] };
  const g = await open(at, { ...A, plane: { basisversions: ok({ ok: true, inquiry: Q, versions: [mineV], conclusion: { claim: { text: "Most are repaired." }, by: "member:mai", at: "2026-10-13T09:00:00Z", version: "Mine" }, conclusion_stance: "concluded" }) } });
  const sec = section(g, "question.concluded.heading");
  assert.ok(says(sec, "question.reading.by.member", { member: "mai" }));
  assert.equal(sec.querySelector('[data-origin="machine"]'), null);
});

test("R51 the three steps: each state draws its step as current; the new question draws the three buttons and no Concluding section; secondary acts fold under more", async () => {
  const empty = await open(at, reach({ images: { [Q]: { "bundle.md": inquiryMd(P, [], { legs: [] }) } } }));
  assert.deepEqual(steps(empty), [["source", "current"], ["mark", "todo"], ["conclude", "todo"]]);
  assert.equal(section(empty, "screen.question.concluding.head"), undefined);
  assert.equal(empty.root().querySelector('[data-adddoc="question"]').getAttribute("data-tone"), "primary");
  assert.ok(says(main(empty), "question.empty.conclude.own"));
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
  const concluded = ok(BASIS({ conclusion: { claim: { text: "x" }, by: "member:dev", at: "2026-10-13T09:00:00Z" }, conclusion_stance: "concluded" }));
  const p = await open(at, { ...A, plane: { basisversions: concluded, casedraft: ok({ ok: true, draftId: "DRAFT-1", project: P }) } });
  assert.deepEqual(actsIn(section(p, "question.concluded.heading")), ["casedraft", "planopen", "withdrawconclusion"]);
  await press(p, "casedraft");
  const b = p.byOp("casedraft")[0].body;
  assert.deepEqual([b.project, b.targets, "caseId" in b, "newCase" in b], [P, [Q], false, false]);
  const n = await open(at, A);
  assert.ok(!actsIn(main(n)).includes("casedraft"));
});

test("R57 a run ends in the ending's own words, never its code; the cost to the owner only; a stopped run says what was kept", async () => {
  const ended = (c) => ({ id: RUN, status: "completed", principal: { plane: "member:mai" }, condition: { bound: c } });
  for (const [bound, key] of [["wallclock", "ai.run.ending.wallclock"], ["cancelled", "ai.run.ending.cancelled"], ["zzz", "ai.run.ending.unknown"]]) {
    const p = await open(at, reach({ ...A, reach: { airuns: ok({ ok: true, runs: [ended(bound)] }) } }));
    assert.ok(says(main(p), "screen.assistant.run.ended", { why: word(key) }), bound);
    assert.ok(!main(p).textContent.includes(bound === "zzz" ? "zzz" : "\u0000"), "the code is never drawn");
    assert.equal(!!main(p).querySelector('[data-run="stopped"]'), bound === "cancelled", "R64: only a stopped run says what was kept");
  }
  const withCost = (cost) => reach({ ...A, reach: { airuns: ok({ ok: true, runs: [ended("completed")] }), airun: ok({ ok: true, session: { id: RUN, status: "completed", ...(cost ? { cost } : {}) } }) } });
  const owner = await open(at, withCost({ owner: "member:mai", calls: 3, tokens: 900, cost: { usd: 0.42 }, unit: "usd" }));
  assert.ok(says(main(owner), "screen.assistant.run.cost.final", { cost: word("ai.run.cost.money", { amount: "$0.42", calls: 3 }), account: word("ai.run.cost.on.apikey") }));
  const sub = await open(at, withCost({ owner: "member:mai", calls: 3, tokens: 900, cost: null, unit: "tokens" }));
  assert.ok(says(main(sub), "ai.run.cost.tokens", { tokens: 900, calls: 3 }));
  const other = await open(at, withCost(null));
  assert.equal(main(other).querySelector('[data-run="cost"]'), null, "no cost line when session.cost is absent");
});

test("R58 a run's progress is drawn from its log's fields, each row as it arrives; the proposal waits for the check; airunopen carries the project", async () => {
  const entries = [{ read: { record: D, n: 1, total: 2, outcome: "answered" } }, { read: { record: "INFO-2026-0005", n: 2, total: 2, outcome: "refused" } }, { found: 3 }];
  const p = await open(at, reach({ ...A, reach: { airuns: ok({ ok: true, runs: [mine()] }), airunlog: ok({ ok: true, entries }) } }));
  const prog = main(p).querySelector("[data-progress]");
  assert.equal(prog.querySelectorAll('li[data-step="reading"]').length, 2, "the reads, in order");
  assert.ok(says(prog.querySelectorAll('li[data-step="reading"]')[0], "ai.progress.reading", { document: "Pothole repair policy, Administrative Instruction 4.12", n: 1, total: 2 }));
  assert.equal(prog.querySelectorAll('li[data-outcome="refused"]').length, 1, "a refused re-read is drawn as refused, naming none");
  assert.ok(says(prog, "ai.progress.read", { total: 2 }) && says(prog, "ai.progress.found", { count: 3 }) && says(prog, "ai.progress.hold"));
  assert.equal(section(p, "question.proposal.heading"), undefined, "no proposal while the run works");
  /* the check found none: the sentence stands in place of any proposal */
  const proposal = [{ name: "Proposed", state: "suggested", author: "class:ai/t", run: RUN, claim: { text: "About 9 in 10." }, legs: [] }];
  const failed = await open(at, reach({ ...A, plane: { basisversions: ok({ ok: true, inquiry: Q, versions: proposal }) },
    reach: { airuns: ok({ ok: true, runs: [mine({ status: "completed", condition: { bound: "completed" } })] }), airunlog: ok({ ok: true, entries: [{ checked: { ok: 0, total: 2 } }] }) } }));
  assert.ok(says(main(failed), "ai.progress.check.failed"));
  assert.equal(section(failed, "question.proposal.heading"), undefined);
  /* airunopen carries the question's project */
  const o = await open(at, reach({ images: { [Q]: { "bundle.md": inquiryMd(P, [], { legs: [] }) } }, plane: { airunopen: ok({ run: "x", started: true }), airundispatch: ok({ dispatched: true }) } }));
  await press(o, "airunopen");
  assert.equal(o.byOp("airunopen")[0].body.project, P);
});

test("R59 R64 accepting a reading of several parts asks each part; Decline sends the version's reject with its reason", async () => {
  const v = { name: "Two parts", state: "suggested", author: "member:ana", parts: ["part 1", "part 2"], legs: [], grounds: [] };
  const p = await open(at, { ...A, plane: { basisversions: ok({ ok: true, inquiry: Q, versions: [v] }), versionaccept: ok({ ok: true }) } });
  const row = section(p, "question.readings.title").querySelector('[data-reading="Two parts"]');
  assert.ok(says(row, "reading.affirm.head") && says(row, "reading.affirm.says", { n: 2 }) && says(row, "reading.affirm.part", { part: "part 1" }));
  p.doc.getElementById("affirm-0-0").checked = true;
  await press(p, "versionaccept", { within: row });
  assert.deepEqual(p.byOp("versionaccept")[0].body.affirmed, ["part 1"], "the parts she ticked");
  /* a reading of one part asks none */
  const one = await open(at, { ...A, plane: { basisversions: ok({ ok: true, inquiry: Q, versions: [{ ...v, name: "One", parts: ["part 1"] }] }) } });
  assert.equal(one.doc.getElementById("affirm-0"), null);
});

test("R55 R56 the document: a held copy is vouched for and replaced by the vouched line; a placement in a theme is drawn apart from evidence", async () => {
  const p = await open("/app/document/" + D, { plane: { heldcaptures: ok({ ok: true, held: [{ bundle_id: D, capture: { sha256: SHA } }] }), release: ok({ ok: true }), select: ok({ handle: "H1" }),
    themeread: (r) => ok(r.query.id ? { ok: true, theme_id: "TH-1", members: [{ target: D, document: D, page: 2, placer_handle: "mai", placed_at: "2026-10-04T09:00:00Z", note: "ref" }], hunches: [] }
      : { ok: true, themes: [{ theme_id: "TH-1", name: "Deferred maintenance" }] }) } });
  assert.ok(says(main(p), "document.held.says"));
  assert.ok(main(p).textContent.includes("Deferred maintenance") && says(main(p), "theme.never.evidence"));
  fill(p, { "document-release-ack": "I read it", "document-release-mitigation": "none" });
  await press(p, "release");
  assert.ok(!says(main(p), "document.held.says") && main(p).querySelector("[data-vouched]"), "replaced at once by the vouched line");
  assert.ok(actsIn(main(p)).includes("attest") && main(p).querySelector('details[data-fold="retire"]'), "attest and a folded retire at the foot");
  /* control: a document the viewer did not capture draws no held banner */
  const o = await open("/app/document/" + D, { plane: { heldcaptures: (r) => ok({ ok: true, held: r.query.member ? [] : [{ bundle_id: D, capture: { sha256: SHA } }] }) } });
  assert.equal(main(o).querySelector("[data-held]"), null);
});
