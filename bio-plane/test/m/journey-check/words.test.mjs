/* journey-check R14 (K3366; setup-words R11): a step asserting what a screen draws names the word's key and compares the
   drawn text with `word(key, vars)`. Driven in a real browser over fixture pages. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { word as setupWord, hasWord } from "../../../src/setup-words/index.mjs";
import { word, wordPattern, drawsWord, requireWord, byWord } from "../../../src/journey-check/words.mjs";
import { browser } from "../../../src/journey-check/run.mjs";

let B;
before(async () => { B = await browser(); });
after(async () => { await B?.close(); });
const on = async (html, fn) => { const ctx = await B.newContext(); try { const p = await ctx.newPage(); await p.setContent(html); return await fn(p); } finally { await ctx.close(); } };

/* every key the walk's steps assert, each held by the list (R14's keys, never sentences) */
const ASSERTED = ["screen.connect.own.subscription", "question.empty.heading", "question.adddoc", "screen.capture.address.done",
  "screen.capture.file.done", "screen.held.released", "ref.here.cited.support", "question.run.heading", "question.proposal.heading",
  "screen.assistant.notevidence", "question.concluded.by", "screen.plan.ask.running", "screen.plan.ask.ended", "founder.handle.done",
  "founder.handle.says", "founder.handle.later.help"];

test("R14: every key a step asserts is a word the list holds, read through setup-words' word", () => {
  for (const k of ASSERTED) assert.ok(hasWord(k), k);
  assert.equal(word("question.empty.heading"), setupWord("question.empty.heading"));
  assert.throws(() => word("no.such.word.anywhere"), /UNKNOWN_WORD/);
});

test("R14: a step asserting a keyed word passes on the screen's text and fails on a fixture drawing other words", async () => {
  const drawn = setupWord("screen.held.released", { count: 1 });
  await on(`<main id="cs-main"><p>${drawn}</p></main>`, (p) => requireWord(p, "screen.held.released", { vars: { count: 1 }, within: "#cs-main", timeout: 2000 }));
  /* a placeholder the step cannot know is open: any date drawn there matches, the rest exactly */
  const dated = setupWord("question.concluded.by", { who: "rosa-l", date: "14 October 2026" });
  await on(`<main id="cs-main"><b>${dated}</b> the answer</main>`, (p) => requireWord(p, "question.concluded.by", { within: "#cs-main", timeout: 2000 }));
  /* control: other words fail it, by name; so does the right word with another count */
  await on(`<main id="cs-main"><p>All captures were released.</p></main>`, async (p) => {
    await assert.rejects(requireWord(p, "screen.held.released", { vars: { count: 1 }, within: "#cs-main", timeout: 1000 }), /does not draw the word screen\.held\.released/);
  });
  await on(`<main id="cs-main"><p>${setupWord("screen.held.released", { count: 2 })}</p></main>`, async (p) => {
    await assert.rejects(requireWord(p, "screen.held.released", { vars: { count: 1 }, within: "#cs-main", timeout: 1000 }));
  });
  /* a control found by its word */
  await on(`<main id="cs-main"><a href="/app/capture">${setupWord("question.adddoc")}</a></main>`, async (p) => assert.equal(await byWord(p, "question.adddoc").count(), 1));
});

test("R14: the pattern holds every character of the word but its open placeholders, white space as drawn", () => {
  assert.ok(drawsWord(`  ${setupWord("question.empty.heading")}\n`, "question.empty.heading"));
  assert.equal(drawsWord("Nothing cited", "question.empty.heading"), false);
  const re = wordPattern("question.concluded.by", { who: "rosa-l" });
  assert.ok(re.test(setupWord("question.concluded.by", { who: "rosa-l", date: "1 May" })));
  assert.equal(re.test(setupWord("question.concluded.by", { who: "admin", date: "1 May" })), false);
});
