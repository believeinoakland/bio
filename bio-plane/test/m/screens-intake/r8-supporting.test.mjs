/* screens-intake T51 fix round 8 (SCREENS-INTAKE #22): G110, R59: a capture states the supporting files it skipped by each reason's CODE, never by the machine words
 * the plane carries as `detail` (acquisition R108 gives every reason a code; the screen's draw of `detail` was the defect). The answer is the shape `supportingOf`
 * gives today (pinned by `fix6-t51.test.mjs` in acquisition: `reasons: [{reason, count, limit?, detail?}]`), its `detail` the real renderer text read from the table. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, main, fill, press, ok, word, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

/* Over the REAL store (fix round 10, K5054): the page is served by the world's network, the capture is the owner's own `acquire`, and the page's `allocid` and `promote` are the
   record's. What the world cannot make is `supporting`: the page sends no walk (`subresources`), so acquisition answers none, and the renderer that would give BODY_NOT_KEPT is not bound
   in a world. The one thing scripted is that block, laid on the owner's own answer for the very page (it is really captured first). */
const ADDRESS = "https://www.acgov.org/board/minutes-2026-10.htm";
const PAGE = "<html><head><title>Board minutes</title></head><body><p>Agenda</p></body></html>";
const MACHINE = word("render.renderer_deliver_response", { is_str: ` (${word("browserrender.body_unavailable.browser_would_give", { err: "CDP No resource with given identifier found" })})`, bytes: "" });
const drawn = async (supporting) => {
  const t = await members({ mai: ["contribute"] });
  t.world.script(ADDRESS, async () => new Response(PAGE, { status: 200, headers: { "content-type": "text/html" } }));
  const real = await t.mai.act("acquire", { body: { locator: ADDRESS } });
  const p = await openWorld("/app/capture/address", { world: t.world, as: t.mai, plane: { acquire: ok({ ...real, supporting }) }, screens: [...SCREENS, DOCUMENT_STUB] });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  drawn.page = p;
  return main(p).querySelector("[data-supporting]");
};
const whys = (line) => Array.from(line.querySelectorAll("[data-supporting-why]")).map((e) => [e.getAttribute("data-supporting-why"), e.textContent]);

test("R59 (G110) the renderer's own words are never drawn: the counts and a sentence by each code's key, a row per sentence", async () => {
  const line = await drawn({ kept: 145, skipped: 90 + 3 + 2, total: 240, reasons: [
    { reason: "BODY_NOT_KEPT", count: 90, detail: MACHINE }, { reason: "CAP_REACHED", count: 3, limit: 400 }, { reason: "TOO_LARGE", count: 2 }] });
  assert.ok(line, "the line is drawn");
  assert.ok(line.textContent.includes(word("screen.capture.supporting.kept", { kept: "145", total: "240" })), "N of M");
  assert.deepEqual(whys(line), [["cap", word("screen.capture.supporting.cap", { cap: "400" })], ["toolarge", word("screen.capture.supporting.toolarge", { n: "2" })],
    ["unavailable", word("screen.capture.supporting.unavailable", { n: "90" })]]);
  assert.equal(/CDP|No resource with given identifier|renderer did not deliver/.test(main(drawn.page).textContent), false, "no machine word anywhere on the page");
});

test("R59 (G110) codes that share a sentence add their counts; an unknown code is the unavailable sentence", async () => {
  // fixtures-generic: SOMETHING_NEW
  const line = await drawn({ kept: 10, skipped: 7, total: 17, reasons: [{ reason: "BUDGET_EXHAUSTED", count: 2 }, { reason: "TOO_LARGE", count: 1 }, { reason: "SOMETHING_NEW", count: 3 }, { reason: "UNRESOLVABLE", count: 1 }] });
  assert.deepEqual(whys(line), [["toolarge", word("screen.capture.supporting.toolarge", { n: "3" })], ["unavailable", word("screen.capture.supporting.unavailable", { n: "4" })]]);
});

test("R59 (G110) control: nothing skipped, or no count, draws nothing", async () => {
  assert.equal(await drawn({ kept: 12, skipped: 0, total: 12, reasons: [] }), null);
  assert.equal(await drawn(undefined), null);
});
