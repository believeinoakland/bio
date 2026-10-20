/* screens-intake R51 (T51 fix round; DEC-384): a held row drawn as ineligible has a door to its document. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, ok, word, saysIn, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const open = (rows) => openPage("/app/held", { screens: [...SCREENS, DOCUMENT_STUB],
  plane: { projectlist: ok({ projects: [] }), heldcaptures: (req) => ok({ ok: true, held: req.query.state === "set_aside" ? [] : rows }) } });
const row = (p, id) => main(p).querySelector(`#pick-held-${id}`).closest("tr, .cs-r, li, div");
const CAP = { captured_for: { questions: [], withheld: null }, age_days: 1, project: null };

test("R51 an ineligible row draws its sentence by key and an Open it link to its document; the lone ineligible row draws the .alone key", async () => {
  const p = await open([{ bundle_id: "INFO-1", title: "Lease", eligible: false, class: "CRUCIAL_IN_BATCH", ...CAP }]);
  const r = row(p, "INFO-1");
  assert.ok(saysIn(r, "screen.held.ineligible", { reason: word("screen.held.ineligible.crucial") }));
  assert.ok(saysIn(r, "screen.held.ineligible.alone"));
  const doors = r.querySelectorAll('a[href*="INFO-1"]').filter((a) => a.textContent.includes(word("screen.capture.openit")));
  assert.equal(doors.length, 1, "one Open it door to the row's document");
});

test("R51 control: an eligible row draws no Open it link", async () => {
  const p = await open([{ bundle_id: "INFO-2", title: "Budget", eligible: true, ...CAP }]);
  const r = row(p, "INFO-2");
  assert.ok(!r.textContent.includes(word("screen.capture.openit")));
});
