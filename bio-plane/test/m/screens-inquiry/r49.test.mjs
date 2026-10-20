/* screens-inquiry R49 (R085; JOURNEYS #2 B-7; K3560): "In which question" on the document page preselects the question the
 * capture was held for, the document's own project's questions first, and none when it was held for none; a cite with none
 * chosen sends nothing and says so in place. On interface-shell's served page over a scripted plane; every expectation is a
 * word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, press, says, P, Q, Q2, D, SHA } from "./fixtures.mjs";

const at = "/app/document/" + D;
const OTHER = "INQ-2026-0099-other";
/* the held row (capture R77): this copy, with what it was captured for (`captured_for.questions`, the ones she may see) */
const heldFor = (questions) => ok({ ok: true, held: [{ bundle_id: D, capture: { sha256: SHA, grade: { grade: "B", route: "fetched", determined: true } },
  captured_for: { questions, withheld: null } }] });
/* the questions she may cite into, another project's first: the default a first-choice select would preselect */
const OTHER_FIRST = ok({ bundles: [{ bundle_id: OTHER, title: "Another project's" }, { bundle_id: Q, title: "Seven days?" }, { bundle_id: Q2, title: "Does closed mean repaired?" }] });
const choice = (p) => p.doc.getElementById("document-cite-question");
const values = (p) => choice(p).querySelectorAll("option").map((o) => o.getAttribute("value"));
const cite = (p) => main(p).querySelectorAll("blockquote")[0].nextElementSibling;

test("R49 R61 a document captured for question Q in project P draws Q preselected and P's questions first", async () => {
  const p = await open(at, { plane: { list: OTHER_FIRST, heldcaptures: heldFor([{ question: Q, title: "Seven days?", asker: "mai" }]) } });
  assert.equal(p.byOp("projectquestions")[0].query.project, P, "the document's own project's questions are read");
  assert.deepEqual(values(p), [Q, Q2, OTHER], "P's questions first, then the others she may cite into; with one preselected no choose option is drawn (R118)");
  assert.equal(choice(p).value, Q, "Q preselected");
  await press(p, "cite", { within: cite(p) });
  assert.equal(p.byOp("cite")[0].query.project, Q, "the passage is cited into the question the capture was held for");
});

test("R49 R61 a captured question the list does not give is still offered, and preselected", async () => {
  const p = await open(at, { plane: { list: ok({ bundles: [{ bundle_id: OTHER, title: "Another project's" }] }),
    heldcaptures: heldFor([{ question: Q, title: "Seven days?", asker: "mai" }]) } });
  assert.ok(values(p).includes(Q));
  assert.equal(choice(p).value, Q);
});

test("R49 R61 a document held for no question preselects none, and a cite with none chosen sends nothing and says so in place", async () => {
  const p = await open(at, { plane: { list: OTHER_FIRST, heldcaptures: heldFor([]) } });
  assert.equal(choice(p).value, "", "the group's first question is never the default");
  assert.equal(choice(p).querySelector("option[selected]").getAttribute("value"), "", "the blank choice is the one chosen");
  await press(p, "cite", { within: cite(p) });
  assert.equal(p.byOp("cite").length, 0, "nothing is sent");
  assert.ok(says(main(p), "screen.find-in.questionfirst"), "R61: said in place, in the fold that holds it");
  assert.ok(says(main(p).querySelector("details[data-cite=none] summary"), "screen.document.cite.none.summary"));
});
