/* screens-intake R42 (T51 fix round; C55; K4164): "Check it now" says what the check found, from the answer's status and note: four
 * answers draw four different sentences, by key. `checkOutcome` is the one drawing `screens-inquiry` imports. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, untitled, text, fill, press, word, says, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS, checkOutcome } from "../../../src/screens-intake/index.mjs";

const ADDRESS = "https://www.example.gov/reports/street-maintenance-2026.html";
const TITLE = untitled();
/* the address is the world's network (an environment double): it answers the capture as it was, then the check as `how` says */
const page = (body) => new Response(`<html><body><p>${body}</p></body></html>`, { status: 200, headers: { "content-type": "text/html" } });
const ANSWERS = {
  modified: () => page("The report was revised."),
  removed: () => new Response("gone", { status: 404 }),
  unchanged: () => page("The report."),
  unknown: () => { throw new TypeError("fetch failed: timed out"); },
};
/* the member captures the address and watches it (real acts, the page's own), then the address changes as `how` says and the member asks for the check */
const checked = async (how) => {
  const t = await members({ mai: ["contribute"] });
  let answer = ANSWERS.unchanged;
  t.world.script(ADDRESS, () => answer());
  const p = await openWorld("/app/capture/address", { world: t.world, as: t.mai, screens: [...SCREENS, DOCUMENT_STUB] });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await press(p, "monitorset");
  answer = ANSWERS[how];
  await press(p, "monitor");
  return p;
};
const KEYS = { modified: "screen.capture.address.checked.modified", removed: "screen.capture.address.checked.removed", unchanged: "screen.capture.address.checked.unchanged" };

test("R42 four answers (modified, removed, unchanged, could not be told) draw four different sentences, by key", async () => {
  const drawn = new Set();
  for (const status of ["modified", "removed", "unchanged"]) {
    const p = await checked(status);
    assert.ok(says(p, KEYS[status], { title: TITLE }), status);
    for (const [other, key] of Object.entries(KEYS)) if (other !== status) assert.ok(!says(p, key, { title: TITLE }), `${status} is not drawn as ${other}`);
    drawn.add(word(KEYS[status], { title: TITLE }));
  }
  const u = await checked("unknown");
  const said = u.byOp("monitor").at(-1);
  assert.ok(text(u).includes(word("screen.capture.address.checked.unknown", { title: TITLE, note: "" }).replace(/\s+$/, "")), "could not be told");
  assert.ok(said);
  assert.equal(drawn.size, 3);
});

test("R42 the exported drawing is the one the screen uses; control: it never says one outcome for another", async () => {
  const cs = { w: (k, f) => word(k, f) };
  const seen = new Set(["modified", "removed", "unchanged", undefined].map((status) => checkOutcome(cs, { status, note: "n" }, "T")));
  assert.equal(seen.size, 4, "four answers, four sentences");
});
