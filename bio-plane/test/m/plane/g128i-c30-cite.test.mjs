/* plane G128i C30 (fix round 9; X29; the walk's CA6/E15; corpus R set, K4426 "Still MISSING" row 6): CITE ON AN ALREADY-CITED DOCUMENT DOES NOTHING VISIBLE. The member pressed "Cite this" on a passage her question already rested on, the plane
   answered ok with nothing new, and the page showed nothing: she could not tell that she had cited anew or that she had not. The statement its truth names: the page says the question already cited it, which passage, and links the
   question to narrow it; a cite that DID cite says so. Built from the real parts: the real `citation` service (citation's fixture: the real record, promotion, content and retrieval over SQLite) cites a document to a question and cites it
   again, and THAT second answer (`ok`, `cited: []`, `alreadyCited: [the document]`, nothing written) is the answer the plane gives the page; the page is the real Document screen on interface-shell's served page. Nothing about the answer is scripted. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "../citation/fixture.mjs";
import { ok } from "../interface-shell/harness.mjs";
import { main, fill, press, says, word, plane, SCREENS, Q, D, P } from "../screens-inquiry/fixtures.mjs";
import { boot } from "../interface-shell/harness.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };

/* the question the page shows rests on the document at its page 3 (extent_page 2, the record's page + 1; R78) */
const QUESTION_WITH_LEG = { images: { [Q]: { "bundle.md": ["---", `id: ${Q}`, "object_type: inquiry", 'title: "Seven days"', `project: ${P}`, "references:", `  - target: ${D}`, "    rel: cites", "    status: confirmed",
  "basis:", `  - target: ${D}`, "    role: supports", "    grade: B", "    extent_page: 2", "---", "", "## Question", "", "Is it?", ""].join("\n") } } };
async function openWith(path, o = {}) { const p = await boot({ screens: SCREENS, plane: plane(o), path }); await p.settle(); return p; }

/** the plane's two answers to the same cite: the first writes, the second finds it already written */
async function twoCites() {
  const w = world();
  w.info(D); w.inquiry("INQ-2026-0001");
  const h = await w.select([D]);
  const first = w.cit.cite({ project: "INQ-2026-0001", handle: h, ...ANN, role: "supports" });
  const snap = w.snapshot();
  const second = w.cit.cite({ project: "INQ-2026-0001", handle: h, ...ANN, role: "supports" });
  assert.deepEqual(w.snapshot(), snap, "the second cite wrote nothing");
  return { first, second };
}

test("G128i C30: the real second cite of the same document answers ok, cited nothing, alreadyCited it; the page says the question already cited it, at which passage, and links the question", async () => {
  const { first, second } = await twoCites();
  assert.deepEqual([first.ok, first.cited, first.alreadyCited], [true, [D], []], "the first cite cited");
  assert.deepEqual([second.ok, second.cited, second.alreadyCited], [true, [], [D]], "the second found it already cited");
  const p = await openWith(at, { ...QUESTION_WITH_LEG, plane: { cite: ok({ ...second, inquiry: Q }) } });
  fill(p, { "document-cite-question": Q });
  await press(p, "cite");
  const m = main(p), note = m.querySelector("[data-cite-done=already]");
  assert.ok(note, "the page draws what the cite did: nothing was left unsaid");
  assert.ok(says(m, "screen.finder.a17.left_as_it_was") && says(m, "screen.finder.a17.the_question_already_cited_it"), "it says the question already cited it");
  assert.ok(says(m, "screen.document.passage.where", { page: 3 }), "and the passage the question rests on");
  assert.ok(note.querySelector('a[href*="/app/question/"]'), "and a way to narrow: the question");
  assert.equal(m.querySelector("[data-cite-done=cited]"), null, "it does not say she cited anew");
});

test("G128i C30 control: the real first cite answers cited; the page says it is cited, not 'left as it was'", async () => {
  const { first } = await twoCites();
  const p = await openWith(at, { ...QUESTION_WITH_LEG, plane: { cite: ok({ ...first, inquiry: Q }) } });
  fill(p, { "document-cite-question": Q });
  await press(p, "cite");
  assert.ok(says(main(p), "screen.finder.cite.cited") && main(p).querySelector("[data-cite-done=cited]"));
  assert.equal(main(p).querySelector("[data-cite-done=already]"), null);
});
