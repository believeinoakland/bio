/* screens-intake T51 fix round 7 (SCREENS-INTAKE #21): G72, "Finish it" on a capture the plane no longer holds. The plane drops a session when its work ends
 * (acquisition's `owedRun`), and `acquire` with `continue` then answers 404 `NO_SUCH_SESSION`; the screen treated that as an unexplained refusal and kept the
 * Unfinished line. It is the end of that capture: a status line says so, the line leaves and the unfinished captures are asked again (R31, R58). The answer is
 * at acquisition's own shape (`{ok: false, reason, op, session, detail}`, `acquisition/index.mjs`:1025). The sentence is the nearest held row's,
 * `acquisition.index.no_such_session`, until `refusal.NO_SUCH_SESSION` has its own (owed to UX-DESIGN); the test asserts it by key (R26). Entry by pressing the act. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, text, says, hasWord, word, ok, refused, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const PAGE = "https://www.nps.gov/acad/index.htm";
const LIVE = { session: "rs_acad", locator: PAGE, primary_sha: "a".repeat(64), started: "2026-10-22T09:00:00Z", outstanding: 1 };
const GONE = refused("NO_SUCH_SESSION", undefined, 404, { op: "acquire", session: "rs_acad", detail: "no capture session of that name is held" });
const open = (plane) => openPage("/app/capture/address", { plane: { heldcaptures: ok({ ok: true, held: [] }), ...plane }, screens: [...SCREENS, DOCUMENT_STUB] });
const finishBtn = (p) => Array.from(main(p).querySelectorAll('button[data-act="acquire"]')).find((b) => b.getAttribute("data-session") === "rs_acad");
const closed = (p) => main(p).querySelectorAll("[data-closed]");
const said = () => word(hasWord("refusal.NO_SUCH_SESSION") ? "refusal.NO_SUCH_SESSION" : "acquisition.index.no_such_session");

test("R31 R58 (G72) 'Finish it' answered NO_SUCH_SESSION ends that capture: the closed-capture sentence by key, never the code, the Unfinished line leaves, unfinished captures are asked again", async () => {
  /* the list is stale on purpose: whatever the plane lists, the session it just refused is not offered again */
  const p = await open({ opencaptures: ok({ ok: true, truncated: false, captures: [LIVE] }), acquire: GONE });
  assert.ok(finishBtn(p), "the Unfinished line offers Finish it");
  const before = p.byOp("opencaptures").length;
  await p.click(finishBtn(p));
  for (let i = 0; i < 10; i++) await p.settle(20);
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ continue: "rs_acad" }]);
  assert.equal(closed(p).length, 1, "one status line says the capture is closed");
  assert.equal(closed(p)[0].textContent.includes(said()), true, "in the held row's words");
  assert.equal(text(p).includes("NO_SUCH_SESSION"), false, "never the raw code");
  assert.equal(says(p, "refusal.uncatalogued"), false, "never the apology for an uncatalogued code");
  assert.equal(finishBtn(p), undefined, "the Unfinished line left");
  assert.ok(p.byOp("opencaptures").length > before, "the unfinished captures were asked again");
});

test("R31 R58 (G72) control: a session the plane still holds keeps its line, and any other refusal says nothing of a closed capture", async () => {
  const p = await open({ opencaptures: ok({ ok: true, truncated: false, captures: [LIVE] }), acquire: refused("BAD_LOCATOR", undefined, 400) });
  await p.click(finishBtn(p));
  for (let i = 0; i < 10; i++) await p.settle(20);
  assert.equal(closed(p).length, 0, "no closed-capture line");
  assert.ok(finishBtn(p), "the capture is still unfinished: Finish it stays");
});
