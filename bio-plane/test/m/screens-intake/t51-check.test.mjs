/* screens-intake R42 (T51 fix round; C55; K4164): "Check it now" says what the check found, from the answer's status and note: four
 * answers draw four different sentences, by key. `checkOutcome` is the one drawing `screens-inquiry` imports. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, untitled, text, fill, press, ok, word, says, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS, checkOutcome } from "../../../src/screens-intake/index.mjs";

const NOT_HELD = ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } });
const ADDRESS = "https://www.example.gov/reports/street-maintenance-2026.pdf";
const DOC = { capture: { sha256: "a".repeat(64), bytes: 10, encoding: "binary", content_type: "application/pdf" }, file: "snapshots/a.pdf", title: null };
const TITLE = untitled();
const checked = async (answer) => {
  const p = await openPage("/app/capture/address", { screens: [...SCREENS, DOCUMENT_STUB], plane: { heldat: NOT_HELD, acquire: ok({ ok: true, document: DOC }),
    allocid: ok({ ok: true, id: "INFO-2026-0001" }), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }), monitor: ok(answer) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await press(p, "monitor");
  return p;
};
const KEYS = { modified: "screen.capture.address.checked.modified", removed: "screen.capture.address.checked.removed", unchanged: "screen.capture.address.checked.unchanged" };

test("R42 four answers (modified, removed, unchanged, could not be told) draw four different sentences, by key", async () => {
  const drawn = new Set();
  for (const status of ["modified", "removed", "unchanged"]) {
    const p = await checked({ ok: true, status, note: "plane note" });
    assert.ok(says(p, KEYS[status], { title: TITLE }), status);
    for (const [other, key] of Object.entries(KEYS)) if (other !== status) assert.ok(!says(p, key, { title: TITLE }), `${status} is not drawn as ${other}`);
    drawn.add(word(KEYS[status], { title: TITLE }));
  }
  const u = await checked({ ok: true, status: null, note: "the source could not be reached: timed out" });
  assert.ok(says(u, "screen.capture.address.checked.unknown", { title: TITLE, note: "the source could not be reached: timed out" }), "could not be told, with the plane's note");
  assert.equal(drawn.size, 3);
});

test("R42 the exported drawing is the one the screen uses; control: it never says one outcome for another", async () => {
  const cs = { w: (k, f) => word(k, f) };
  const seen = new Set(["modified", "removed", "unchanged", undefined].map((status) => checkOutcome(cs, { status, note: "n" }, "T")));
  assert.equal(seen.size, 4, "four answers, four sentences");
});
