/* screens-investigate R5, R11, R14: a calculation, its spot-check and the help page, on interface-shell's served page. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn } from "../interface-shell/harness.mjs";
import { open, main, actsIn, button, fill, press, CALCULATION, SPOT, P, CALC, DRAW, SHA, SHA2, word, drew, notDrew, dayOf } from "./fixtures.mjs";

const at = "/app/calculation/" + CALC;

test("R5 reads calculation (the computed fact, its method as written, its inputs with their grades, its checks)", async () => {
  const p = await open(at);
  assert.equal(p.byOp("calculation")[0].query.id, CALC);
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, "Reports closed within seven days, FY2025");
  assert.match(m.querySelector(".mk-bignum").textContent, /^812/);
  assert.match(m.textContent, /count\(rows where closed − reported ≤ 7 days\)/);
  drew(m, "screen.calculation.status.agrees");
  const inputs = m.querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word("screen.calculation.inputs"));
  assert.equal(inputs.querySelector(".cs-grade").textContent, word("mark.scale.capture.name") + "B");
  assert.match(inputs.textContent, /orders/);
});

test("R5 the spot-check: the draw (the set, its size, the seed and method, that anyone can repeat it), the question, each drawn item with its visits and standing, the counts, the estimate with its exact range", async () => {
  const p = await open(at);
  assert.equal(p.byOp("spotcheck")[0].query.draw, DRAW);
  assert.equal(p.byOp("calculation").at(-1).query.id, "CALC-2026-0002", "the estimate's own calculation");
  const s = main(p).querySelectorAll("section").find((x) => x.querySelector("h2").textContent === word("screen.calculation.spot"));
  drew(s, "screen.calculation.draw.what", { n: "3", size: "812", seed: "2026-10-05-7f31" });
  drew(s, "screen.calculation.draw.repeat");
  assert.ok(s.textContent.includes("Was the pothole repaired?"), "the question, as the draw records it");
  drew(s, "screen.calculation.counts", { visited: "2", n: "3", yes: "1", no: "0", unsure: "0" });
  for (const k of ["disagree", "notvisited"]) drew(s, "screen.calculation.counts." + k, { n: "1" });
  drew(s, "screen.calculation.range", { share: "81", judged: "37", confidence: "95", low: "65", high: "92" });
  drew(s, "screen.calculation.item", { item: "17" });
  drew(s, "screen.calculation.visit", { finding: word("screen.calculation.finding.yes"), by: "mai", date: dayOf("2026-10-06") });
  assert.equal(s.querySelectorAll(".cs-grade[data-scale=testimony]").length, 3, "every visit, graded as testimony");
});

test("R5 a disagreeing item's visits are drawn in tension, never one picked", async () => {
  const p = await open(at);
  const row = main(p).querySelectorAll(".cs-row").find((r) => r.textContent.includes(word("screen.calculation.item", { item: "4" })));
  drew(row, "screen.calculation.standing.disagree");
  drew(row, "screen.calculation.visit", { finding: word("screen.calculation.finding.yes"), by: "mai", date: dayOf("2026-10-06") });
  drew(row, "screen.calculation.visit", { finding: word("screen.calculation.finding.no"), by: "dev", date: dayOf("2026-10-07") });
  drew(row, "screen.calculation.tension");
});

test("R5 the acts: calculationcreate, tabledeclare, recordcheck, calculationaccept, addworkbook, bind, calculationdraw (how many, the seed recorded)", async () => {
  const p = await open(at, { plane: { calculationcreate: ok({ ok: true, calc_id: "CALC-2026-0009" }), tabledeclare: ok({ ok: true, sha: SHA }), recordcheck: ok({ ok: true }),
    calculationaccept: ok({ ok: true }), addworkbook: ok({ ok: true }), bind: ok({ ok: true }), calculationdraw: ok({ ok: true, draw: "e".repeat(64), seed: "s" }) } });
  fill(p, { "calc-set": SHA, "calc-n": "40", "calc-seed": "2026-10-05-7f31", "calc-dq": "Was it repaired?" });
  await press(p, "calculationdraw", { reason: "a sample to visit" });
  assert.deepEqual(p.byOp("calculationdraw")[0].body, { set: SHA, n: 40, seed: "2026-10-05-7f31", question: "Was it repaired?", project: P, reason: "a sample to visit" });
  assert.equal(p.byOp("spotcheck").at(-1).query.draw, "e".repeat(64), "the new draw is read");
  fill(p, { "calc-content": "CNT-2026-0003", "calc-header": "report, closed, reported" });
  await press(p, "tabledeclare", { reason: "the work orders" });
  assert.deepEqual(p.byOp("tabledeclare")[0].body.header, ["report", "closed", "reported"]);
  fill(p, { "calc-wb": SHA2, "calc-period": "FY2025" });
  await press(p, "addworkbook", { reason: "my own count" });
  assert.deepEqual(p.byOp("addworkbook")[0].body, { captureSha: SHA2, question: "Reports closed within seven days, FY2025", period: "FY2025", project: P, reason: "my own count" });
  fill(p, { "calc-range": "Budget!B2:B5", "calc-table": SHA, "calc-trange": "B1:B4" });
  await press(p, "bind");
  assert.deepEqual(p.byOp("bind")[0].body, { captureSha: SHA2, project: P, range: "Budget!B2:B5", input: { table: SHA, range: "B1:B4" } });
  fill(p, { "calc-outcome": "agrees", "calc-note": "I recounted 812" });
  await press(p, "recordcheck");
  assert.deepEqual(p.byOp("recordcheck")[0].body, { captureSha: SHA2, project: P, outcome: "agrees", note: "I recounted 812" });
  await press(p, "calculationaccept", { reason: "recomputed and agrees" });
  assert.equal(p.byOp("calculationaccept")[0].query.id, CALC);
  fill(p, { "calc-q": "Reports closed within 7 days, FY2026", "calc-from": "2025-07-01", "calc-to": "2026-06-30", "calc-kind": "count", "calc-input": SHA });
  await press(p, "calculationcreate", { reason: "the new year" });
  assert.deepEqual(p.byOp("calculationcreate")[0].body.inputs, [{ name: "input", table: SHA }]);
  assert.equal(p.location.pathname, "/app/calculation/CALC-2026-0009");
});

test("R14 \"Record what you saw at a report\" sends testify (her own words) and \"Count it for the drawn report\" sends spotcheckvisit tying it to the drawn item with her finding: two acts", async () => {
  const p = await open(at, { plane: { testify: ok({ ok: true, capture_sha: SHA2, axes: {} }), spotcheckvisit: ok({ ok: true, standing: "yes" }) } });
  assert.equal(button(p, "testify").textContent.startsWith(word("act.testify.label.calculation")), true);
  assert.equal(button(p, "spotcheckvisit").textContent.startsWith(word("act.spotcheckvisit.label.calculation")), true);
  fill(p, { "calc-words": "The pothole at 60th and Seminary is filled and level.", "calc-observed": "2026-10-06" });
  await press(p, "testify");
  assert.deepEqual(p.byOp("testify")[0].body, { words: "The pothole at 60th and Seminary is filled and level.", observedAt: "2026-10-06" });
  assert.equal(p.byOp("spotcheckvisit").length, 0, "two acts: the visit is not counted until she says so");
  fill(p, { "calc-item": "9", "calc-finding-0": true, "calc-photo": SHA });
  await press(p, "spotcheckvisit", { reason: "I visited it" });
  assert.deepEqual(p.byOp("spotcheckvisit")[0].body, { draw: DRAW, item: "9", testimony: SHA2, finding: "yes", exhibits: [SHA], reason: "I visited it" });
});

test("R5 R14 spotcheckvisit needs her testimony and a finding (control: none sends nothing); a refusal drawn beside it", async () => {
  const p = await open(at, { plane: { testify: ok({ ok: true, capture_sha: SHA2 }), spotcheckvisit: refusedIn("NOT_DRAWN", "That report is not in the draw.") } });
  fill(p, { "calc-item": "9", "calc-finding-1": true });
  await press(p, "spotcheckvisit", { reason: "x" });
  assert.equal(p.byOp("spotcheckvisit").length, 0);
  fill(p, { "calc-words": "Not repaired.", "calc-observed": "2026-10-06" });
  await press(p, "testify");
  fill(p, { "calc-item": "9", "calc-finding-1": true });
  await press(p, "spotcheckvisit", { reason: "x" });
  assert.equal(p.byOp("spotcheckvisit")[0].body.finding, "no");
  assert.ok(main(p).textContent.includes("That report is not in the draw."), "the refusal by its words");
});

test("R11 \"How spot-checks work\" is reached from calculation and says, in plain words, what a spot-check does, why the draw is random and recorded, what the result says and does not say", async () => {
  const p = await open(at);
  const link = main(p).querySelector('a[href="/app/help"]');
  assert.equal(link.textContent, word("screen.calculation.help"));
  await p.click(link);
  await p.settle();
  const m = main(p);
  assert.equal(m.querySelector("h1").textContent, word("screen.help.name"));
  assert.deepEqual(m.querySelectorAll("h2").map((h) => h.textContent), ["does", "random", "says", "notsays", "evidence"].map((k) => word("screen.help." + k)));
  for (const k of ["does", "random", "says", "notsays", "evidence"]) drew(m, "screen.help." + k + ".p");
  assert.equal(m.querySelectorAll("button[data-act]").length, 0, "a help page has no act");
  assert.equal(p.byOp("calculation").length >= 1, true);
});
