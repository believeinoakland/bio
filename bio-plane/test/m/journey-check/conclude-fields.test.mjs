/* journey-check R9 step 12, R16 (K4435): the conclusion form asks for a falsifier, a reason and a commentary; the walk fills each
   field the screen draws. The ids the walk fills are run against the question page as the plane really draws it (screens-inquiry's
   own harness), and the screen refuses to conclude with its reason box empty, as it does for the walk. */
import "../screens-settings/register.mjs";
import test from "node:test";
import assert from "node:assert/strict";

const { concludeFields } = await import("../../../src/journey-check/investigation.mjs");
const { ok } = await import("../interface-shell/harness.mjs");
const { open, press, fill, plane, says, word, Q } = await import("../screens-inquiry/fixtures.mjs");

test("R9: every field the walk fills in the conclusion form is one the question page draws, and with the reason box empty the page refuses to conclude and sends nothing", async () => {
  const none = ok({ ok: true, inquiry: Q, versions: [{ name: "draft", state: "considering", legs: [] }] });
  const p = await open("/app/question/" + Q, { plane: { basisversions: none, conclude: ok({ ok: true }) } });
  assert.deepEqual(Object.keys(concludeFields("f", "c")).sort(), ["question-conclude-commentary", "question-conclude-falsifier", "question-conclude-reason"]);
  for (const id of Object.keys(concludeFields("f", "c"))) assert.ok(p.doc.getElementById(id), `the question page draws ${id}`);
  fill(p, { "question-conclude-own": "The notice orders the repair.", "question-conclude-falsifier": "A withdrawal", "question-conclude-commentary": "note", "question-conclude-reason": " " });
  await press(p, "conclude", {});
  assert.equal(p.byOp("conclude").length, 0, "nothing is sent without a reason");
  assert.ok(JSON.stringify(p.doc.getElementById("cs-main").textContent).includes(word("question.conclude.reason.needed")));
});
