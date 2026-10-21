/* screens-inquiry fix round 3 (T51), the question screen: C41 (R35, R50, R117: a refused basis version names the legs the plane says it left
 * unplaced, by their documents' titles), C36 (R23, R24, R34: a leg whose extent states a paragraph draws it), C44 (R2: no opener, the head draws
 * the date), C38 (R2: a removed citation is counted nowhere), C94 (members named by handle). On interface-shell's served page over a scripted
 * plane; every expectation is a word read by key (R44), never copied (K3810). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok } from "../interface-shell/harness.mjs";
import { open, main, fill, press, inquiryMd, INQUIRY_REFS, BASIS, says, word, day, P, Q, D, SHA, POLICY, DOCUMENT_MD } from "./fixtures.mjs";

const at = "/app/question/" + Q;
const refusedBody = (code, extra = {}) => ({ status: 200, json: { ok: true, result: { ok: false, reason: code, code, ...extra } } });

/* ------------------------------------------------------------------------------------------------------------------ C41 */

const D2 = "INFO-2026-0005";
const D3 = "INFO-2026-0011";
const D4 = "INFO-2026-0012";
const D5 = "INFO-2026-0013";
const TITLE5 = "Work orders, October";
const docMd = (id, title) => ["---", `id: ${id}`, "object_type: information", ...(title ? [`title: "${title}"`] : []), `project: ${P}`, "---", "", "## Summary", ""].join("\n");
const unplaced = (legs) => ({ check: "C-2.8", code: "VERSION_PARTITION_INCOMPLETE", detail: "version 'main' has 2 legs with no ground", translation: "Every passage must be placed in a part.", legs, repairs: ["repair-sentinel-qq"] });
const conclude = async (code, findings, o = {}) => {
  const p = await open(at, { images: { [D5]: { "bundle.md": docMd(D5, TITLE5) }, [D3]: { "bundle.md": docMd(D3, "") }, [D4]: { "bundle.md": docMd(D4, "") } }, plane: { conclude: refusedBody(code, { findings }), ...(o.plane || {}) } });
  fill(p, { "question-conclude-falsifier": "logs dated later", "question-conclude-reason": "it answers it" });
  return press(p, "conclude");
};

test("R35 R50 R117 C41 a BASIS_VERSION_REFUSED whose first finding carries legs: [a, b] draws the finding and both legs, each by its document's title; control: no legs, no names; BASIS_REFUSED unchanged", async () => {
  const slot = await conclude("BASIS_VERSION_REFUSED", [unplaced([D, D2])]);
  assert.ok(says(slot, "refusal.VERSION_PARTITION_INCOMPLETE"), "the finding, by the word held for its code");
  assert.ok(slot.textContent.includes("repair-sentinel-qq"), "its repair");
  const named = slot.querySelector("[data-legs]");
  assert.ok(named, "the legs are named");
  assert.ok(named.textContent.includes(POLICY) && named.textContent.includes("Work orders"), "both, by the title the reading states for them");
  assert.ok(!named.textContent.includes(D) && !named.textContent.includes(D2), "never an id");
  /* a leg the reading does not hold is named by its document's own title, read for the purpose */
  const own = await conclude("BASIS_VERSION_REFUSED", [unplaced([D5])]);
  assert.ok(own.querySelector("[data-legs]").textContent.includes(TITLE5), "the document's own title");
  /* control: a finding with no legs names none */
  const bare = await conclude("BASIS_VERSION_REFUSED", [{ ...unplaced(undefined), legs: undefined }]);
  assert.ok(says(bare, "refusal.VERSION_PARTITION_INCOMPLETE") && bare.querySelector("[data-legs]") === null, "no legs, none named");
  /* control: BASIS_REFUSED is drawn as before (its detail) and names no legs */
  const old = await conclude("BASIS_REFUSED", [{ check: "C-9.9", code: "SOMETHING_ELSE", detail: "the leg names no edition", legs: [D, D2] }]);
  assert.ok(old.textContent.includes("the leg names no edition") && old.querySelector("[data-legs]") === null, "BASIS_REFUSED unchanged");
});

test("R116 C41 a leg whose document has no title draws the plain word for a document once, however many such legs the finding names", async () => {
  const slot = await conclude("BASIS_VERSION_REFUSED", [unplaced([D3, D4, D5])]);
  const named = slot.querySelector("[data-legs]");
  assert.ok(named.textContent.includes(TITLE5), "the titled leg by its title");
  assert.equal(named.textContent.split(word("shell.card.document")).length - 1, 1, "the plain word once");
  assert.ok(!named.textContent.includes(D3) && !named.textContent.includes(D4), "never an id");
});
