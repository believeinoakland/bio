/* screens-inquiry R2: the question screen, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, fill, press, rawKeys, BASIS, P, Q, D } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const section = (p, head) => main(p).querySelectorAll("section").find((s) => s.querySelector("h2").textContent === head);

test("R2 reads: the inquiry, its strength, basis versions, hunches and what it waits on", async () => {
  const p = await open(at);
  const q = (op) => p.byOp(op)[0].query;
  assert.equal(p.byOp("image").find((r) => r.query.id === Q).query.id, Q);
  assert.equal(q("inquirystrength").id, Q);
  assert.equal(q("basisversions").id, Q);
  assert.equal(q("hypotheses").inquiry, Q);
  assert.equal(q("questionwaits").question, Q);
  assert.deepEqual(q("strengthbarof"), { op: "strengthbarof", project: P });
  assert.match(p.root().querySelector(".cs-crumbs").textContent, /Projects.*Pothole repairs.*Question/);
});

test("R2 the question drawn: its words, two grades and the phrase against the project's bar, weakest part, what would raise it", async () => {
  const p = await open(at);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Is the city repairing reported potholes within seven days?");
  assert.match(m.textContent, /Opened 3 October 2026 · Pothole repairs/);
  assert.equal(m.querySelector('a.cs-ref[href="/app/project/' + P + '"]').textContent, "Pothole repairs");
  const box = m.querySelector(".cs-strengthbox");
  assert.deepEqual(box.querySelectorAll(".cs-grade").map((g) => [g.getAttribute("data-scale"), g.textContent.slice(-1)]), [["capture", "B"], ["connection", "C"]],
    "two grades, never one score; an ungraded testimony axis is not drawn");
  assert.match(box.textContent, /Against the bar B\/B · Short of the bar on: Connection/);
  assert.match(box.textContent, /Weakest: Administrative Instruction 4\.12/);
  assert.match(box.textContent, /What would raise it: a work-order number on both would raise it to B/);
  assert.match(box.textContent, /Strength is two grades, never one score/);
  assert.match(section(p, "How strong the answer is").querySelector("h2").getAttribute("data-tip"), /weakest thing it depends on/);
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R2 a question with no project is held against the group's bar; one that meets it says so", async () => {
  const p = await open(at, { inquiryProject: null, plane: { inquirystrength: ok({ capture: { state: "graded", grade: "A" }, connection: { state: "graded", grade: "B" } }) } });
  assert.equal(p.byOp("strengthbarof")[0].query.project, undefined);
  assert.match(main(p).querySelector(".cs-strengthbox").textContent, /Against the bar C\/C · Meets the bar/);
  assert.match(main(p).textContent, /Opened 3 October 2026/);
});

test("R2 sections Supports, Cuts against, Hunches, Concluding; what it waits on, with who set it aside and why", async () => {
  const p = await open(at);
  const heads = main(p).querySelectorAll("section h2").map((h) => h.textContent);
  const i = (h) => heads.indexOf(h);
  assert.ok(i("Supports") < i("Cuts against") && i("Cuts against") < i("Hunches") && i("Hunches") < i("Concluding"));
  const sup = section(p, "Supports"), cut = section(p, "Cuts against");
  assert.match(sup.textContent, /within seven calendar days of the report/);
  assert.ok(sup.querySelector(`a.cs-ref[href="/app/document/${D}"]`));
  assert.match(sup.textContent, /Work orders · Removed from the question/);
  assert.equal(cut.querySelector(".cs-grade").getAttribute("data-scale"), "testimony");
  assert.match(cut.textContent, /still open, about 60 cm across/);
  assert.ok(!cut.querySelector(`a[href="/app/document/${D}"]`));
  assert.ok(!actsIn(main(p)).some((op) => op === "sever" || op === "reinstate"), "K3003: a question's legs are not severed from this screen in T46");
  const waits = section(p, "What it waits on");
  assert.match(waits.textContent, /Waiting: 2024 budget PDF was set aside by ben: “wrong year”/);
  assert.match(waits.textContent, /Set aside by ben, 6 October · each act stays on the record/);
  const hunches = section(p, "Hunches");
  assert.match(hunches.textContent, /Hunch · dev's.*Crews close reports when they inspect\./s);
  assert.match(hunches.querySelector("h2").getAttribute("data-tip"), /never evidence/i);
  assert.match(section(p, "Concluding").textContent, /Not concluded\./);
  assert.deepEqual([...new Set(actsIn(main(p)))].sort(), ["checkrequest", "cite", "conclude", "heldrestore", "hypothesishold", "narrow", "planopen", "search"]);
});

test("R2 a concluded question shows its conclusion and offers its withdrawal, never a second conclusion", async () => {
  const p = await open(at, { plane: { basisversions: ok(BASIS({ conclusion: { claim: { text: "No: 1 in 10 is not repaired in time." } }, conclusion_stance: "concluded" })) } });
  assert.match(main(p).textContent, /Concluded: “No: 1 in 10 is not repaired in time\.”/);
  const acts = actsIn(main(p));
  assert.ok(acts.includes("withdrawconclusion") && !acts.includes("conclude"));
  await press(p, "withdrawconclusion", { reason: "new evidence" });
  assert.deepEqual(p.byOp("withdrawconclusion")[0].query, { op: "withdrawconclusion", target: Q, project: P, reason: "new evidence" },
    "the shell's reason in the query, where the owner reads it");
});

test("R2 conclude carries the member's own words (its falsifier and why), never writing help; without a falsifier it says so", async () => {
  const p = await open(at, { plane: { conclude: ok({ ok: true }) } });
  fill(p, { "question-conclude-falsifier": "inspection records showing repair", "question-conclude-commentary": "the work orders and the policy agree" });
  await press(p, "conclude");
  const q = p.byOp("conclude")[0].query;
  assert.deepEqual({ ...q, op: undefined }, { op: undefined, target: Q, project: P, version: "main", falsifier: "inspection records showing repair", commentary: "the work orders and the policy agree" });
  fill(p, { "question-conclude-falsifier": "", "question-conclude-commentary": "nothing would change it" });
  await press(p, "conclude");
  assert.equal(p.byOp("conclude")[1].query.no_falsifier, "1");
  /* control: no words of hers, nothing sent */
  fill(p, { "question-conclude-commentary": "" });
  const slot = await press(p, "conclude");
  assert.equal(p.byOp("conclude").length, 2);
  assert.match(slot.textContent, /Say why first/);
  for (const r of p.requests) for (const k of ["by", "author", "viewer", "at", "assist", "draft"])
    assert.ok(!(k in (r.query || {})) && !(r.body && typeof r.body === "object" && k in r.body), `${r.op} sends ${k}`);
});

test("R2 a question with no project concludes with its answer in her words", async () => {
  const p = await open(at, { inquiryProject: null, plane: { conclude: ok({ ok: true }) } });
  fill(p, { "question-conclude-claim": "Yes, within seven days.", "question-conclude-commentary": "the counts agree" });
  await press(p, "conclude");
  const q = p.byOp("conclude")[0].query;
  assert.equal(q.conclusion, "Yes, within seven days.");
  assert.equal(q.project, undefined);
});

test("R2 the other acts send what their owners take", async () => {
  const p = await open(at, { plane: { narrow: ok({ ok: true }), hypothesishold: ok({ ok: true }), checkrequest: ok({ ok: true }),
    planopen: ok({ ok: true, id: "PLN-1", title: "Ask the committee" }), heldrestore: ok({ ok: true }) } });
  fill(p, { "question-narrow-name": "Reported in 2026", "question-narrow-description": "the record covers 2026 only" });
  await press(p, "narrow");
  assert.deepEqual(p.byOp("narrow")[0].body, { target: Q, version: "main", name: "Reported in 2026", description: "the record covers 2026 only" });
  fill(p, { "question-hunch": "Inspections close them.", "question-hunch-kind": "flow" });
  await press(p, "hypothesishold");
  assert.deepEqual(p.byOp("hypothesishold")[0].body, { inquiry: Q, kind: "flow", statement: "Inspections close them." });
  fill(p, { "question-check": "engineering", "question-check-note": "the crew reports" });
  await press(p, "checkrequest");
  assert.deepEqual(p.byOp("checkrequest")[0].body, { target: Q, label: "engineering", note: "the crew reports" });
  fill(p, { "question-plan": "Ask the committee" });
  await press(p, "planopen");
  assert.deepEqual(p.byOp("planopen")[0].body, { project: P, title: "Ask the committee", subjects: [{ kind: "inquiry", inquiry: Q }] });
  assert.match(main(p).textContent, /Plan opened: Ask the committee/);
  await press(p, "heldrestore", { reason: "it is the right year after all" });
  assert.deepEqual(p.byOp("heldrestore")[0].body, { ids: ["INFO-2026-0008"], reason: "it is the right year after all" });
});

test("R2 cite chooses its passage in Find in over the question's project; Find another source searches its words", async () => {
  const p = await open(at);
  await press(p, "cite");
  assert.equal(p.location.pathname, "/app/find-in/" + P);
  const s = await open(at);
  await press(s, "search", { reason: "the budget was the wrong year" });
  assert.equal(decodeURIComponent(s.location.pathname), "/app/finder/Is the city repairing reported potholes within seven days?");
  const n = await open(at, { inquiryProject: null });
  await press(n, "cite");
  assert.equal(decodeURIComponent(n.location.pathname), "/app/finder/Is the city repairing reported potholes within seven days?");
});

test("R2 controls: a hunch, a check and a narrowing with nothing written are refused by their words; a refused act keeps the form", async () => {
  const p = await open(at, { plane: { hypothesishold: refusedIn("HYPOTHESIS_NO_STATEMENT", "Write the hunch.") } });
  assert.match((await press(p, "hypothesishold")).textContent, /Write the hunch first/);
  assert.match((await press(p, "checkrequest")).textContent, /Name the expertise needed and say what to check/);
  assert.match((await press(p, "narrow")).textContent, /Name the narrower question and say why/);
  assert.equal(p.byOp("hypothesishold").length + p.byOp("checkrequest").length + p.byOp("narrow").length, 0);
  fill(p, { "question-hunch": "x" });
  const slot = await press(p, "hypothesishold");
  assert.match(slot.textContent, /Write the hunch\./);
  assert.equal(p.doc.getElementById("question-hunch").value, "x");
});
