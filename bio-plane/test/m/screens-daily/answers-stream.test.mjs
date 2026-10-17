/* The ask's progress as it is written, its answer only after the check (R52), and Ask's four states (R53). The page-level tests
   run on the real served page (interface-shell's harness) over the stream's last event; the event-by-event tests run the act's
   own `onEvent` (interface-shell R78) over a stand-in kit that holds the screen's page memory, because the harness delivers a
   stream as one body. Every sentence is asserted as `word(key, vars)` (R34). */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS, open, ok, refused, text, press, beside, last, main, screen, word } from "./page.mjs";
import { ndjson } from "../interface-shell/harness.mjs";

const REACH = { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) };
const ANSWER = { event: "answer", ok: true, answer: { question_as_read: "How many?", summary: { text: "812 of 903 were closed." }, sentences: [{ text: "The work orders record 812.", support: ["h1"] }],
  holdings: [{ address: "INF-1#p3", quote: "903 rows" }], looks: [], label: "machine work" }, withheld: [] };
const STREAM = [{ event: "step", step: "interpreting" }, { event: "read", op: "retrieve", record: "INF-1" }, { event: "composing", found: true, count: 2 },
  { event: "checking", count: 1 }, { event: "checked", passage: "h1", found: true }, ANSWER];
const askAct = SCREENS.find((s) => s.id === "answers").acts.find((a) => a.op === "ask");

// The stand-in kit: `set` writes the screen's page memory, `call` answers a document's front matter.
const kit = (ui) => ({ set: (k, v) => { ui[k] = v; }, call: async () => ({ result: { "bundle.md": '---\ntitle: "Work orders FY2025"\n---\n' } }) });
const view = (ui) => ({ ui, parts: { frontTitle: SCREENS.find((s) => s.id === "answers").parts.frontTitle } });

test("R52: each stream event is handed on as it arrives: the reads, that the answer is being written and that it is being checked; no word of the answer before the answer event", async () => {
  assert.equal(typeof askAct.onEvent, "function");
  const ui = {};
  const cs = kit(ui), v = view(ui);
  const seen = [];
  for (const ev of STREAM.slice(0, 5)) {
    askAct.onEvent(ev, v, cs);
    await new Promise((r) => setTimeout(r, 0));
    seen.push(JSON.stringify({ working: ui.stream.working, reads: ui.stream.reads, composing: ui.stream.composing, checking: ui.stream.checking, answer: ui.answer || null }));
  }
  assert.deepEqual(seen.map((x) => JSON.parse(x).reads.length), [0, 1, 1, 1, 1], "a read row per read event");
  assert.deepEqual(seen.map((x) => JSON.parse(x).composing), [false, false, true, true, true]);
  assert.deepEqual(seen.map((x) => JSON.parse(x).checking), [false, false, false, true, true]);
  assert.ok(seen.every((x) => JSON.parse(x).working === true && JSON.parse(x).answer === null), "working, with no answer yet");
  assert.deepEqual(ui.titles, { "INF-1": "Work orders FY2025" }, "the read names the document by its title");
  askAct.onEvent(STREAM[5], v, cs);
  assert.equal(ui.stream.working, false);
  assert.equal(ui.answer.summary.text, "812 of 903 were closed.", "the answer, after the answer event");
  // Control: a read that names no record draws no row.
  const u2 = {};
  askAct.onEvent({ event: "read", op: "retrieve", record: null }, view(u2), kit(u2));
  assert.deepEqual(u2.stream.reads, []);
});

test("R52, R53: a stream that ends refused (ASK_CHECK_FAILED) draws the failed-check sentence and no answer; a full stream draws the answer with the check beneath it; a non-streamed refusal is drawn as before", async () => {
  const refusedStream = [STREAM[0], STREAM[1], STREAM[2], STREAM[3], { event: "refused", code: "ASK_CHECK_FAILED", cited: 2, found: 0 }];
  const failed = await open("/app/answers", { ...REACH, ask: { status: 200, ndjson: refusedStream } });
  await press(failed, "ask", { values: { "answers-q": "How many?" } });
  assert.ok(text(failed).includes(word("ai.progress.check.failed")));
  assert.ok(text(failed).includes(word("screen.answers.failed.next")));
  assert.ok(!main(failed).querySelector(".cs-machinework"), "nothing of the answer is drawn");
  const full = await open("/app/answers", { ...REACH, ask: { status: 200, ndjson: STREAM } });
  await press(full, "ask", { values: { "answers-q": "How many?" } });
  assert.ok(main(full).querySelector(".cs-machinework"));
  assert.ok(text(full).includes(word("ai.progress.checked.all")));
  assert.ok(!text(full).includes(word("ai.progress.check.failed")));
  // Control: a refusal before any model call is plain JSON, drawn beside the act as R6 says.
  const plain = await open("/app/answers", { ...REACH, ask: refused("AI_PART_NOT_DEPLOYED", null, 403) });
  const b = await press(plain, "ask", { values: { "answers-q": "How many?" } });
  assert.equal(beside(plain, b), word("screen.answers.refused.notdeployed"));
  assert.ok(!main(plain).querySelector(".cs-machinework"));
});

test("R53: not ready: the refusal in its words with a door to connect; with the assistant not reachable none of these states is drawn", async () => {
  const p = await open("/app/answers", { ...REACH, ask: refused("ASSISTANT_REMOTE_NOT_READY", null, 503) });
  const b = await press(p, "ask", { values: { "answers-q": "How many?" } });
  assert.ok(beside(p, b).includes(word("refusal.ASSISTANT_REMOTE_NOT_READY")));
  const door = p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"] a[href="/app/connect"]`);
  assert.ok(door, "a door to connect");
  // Control: without the assistant the screen stays Find and count and draws none of the progress.
  const off = await open("/app/answers", { assistantstate: ok({ on: false }) });
  assert.ok(!text(off).includes(word("ai.progress.hold.answer")) && !text(off).includes(word("ai.progress.check.failed")));
  assert.ok(off.doc.getElementById("answers-q"), "Find and count");
  assert.ok(!main(off).querySelector('button[data-act="ask"]'));
});

test("R53: at work the progress is the stream's rows with no Stop; every state's keys are listed words of the screen", () => {
  const words = new Set(screen("answers").words);
  for (const k of ["ai.progress.reading.ask", "ai.progress.composing.answer", "ai.progress.checking", "ai.progress.hold.answer", "ai.progress.means", "ai.progress.checked.all",
    "ai.progress.checked.all.means", "ai.progress.check.failed", "screen.answers.failed.next", "refusal.ASSISTANT_REMOTE_NOT_READY"]) assert.ok(words.has(k), k);
  assert.ok(!screen("answers").acts.some((a) => /stop/i.test(a.op)), "no Stop");
});
