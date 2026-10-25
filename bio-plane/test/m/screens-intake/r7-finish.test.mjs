/* screens-intake T51 fix round 7 (SCREENS-INTAKE #21): G72, "Finish it" on a capture the plane no longer holds. The plane drops a session when its work ends
 * (acquisition's `owedRun`), and `acquire` with `continue` then answers 404 `NO_SUCH_SESSION`; the screen treated that as an unexplained refusal and kept the
 * Unfinished line. It is the end of that capture: a status line says so, the line leaves and the unfinished captures are asked again (R31, R58). The answer is
 * at acquisition's own shape (`{ok: false, reason, op, session}` and a `detail` the screen never draws, `acquisition/index.mjs`:1025). The sentence is the nearest held row's,
 * `acquisition.index.no_such_session`, until `refusal.NO_SUCH_SESSION` has its own (owed to UX-DESIGN); the test asserts it by key (R26). Entry by pressing the act. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, main, text, says, hasWord, word, refused } from "./page.mjs";

/* The real store (fix round 10, K5054): the capture is parked by the owner's own `acquire`: a page whose supporting files the runtime stops fetching part way (the
   environment's limit, scripted as the network), the session listed by `opencaptures` as the member's open capture. */
const PAGE = "https://www.nps.gov/acad/index.htm";
const IMAGES = 20;
async function parked() {
  const t = await members({ mai: ["contribute"] });
  const html = `<html><head><title>Acadia</title></head><body>${Array.from({ length: IMAGES }, (_, i) => `<img src="/i/${i}.png">`).join("")}</body></html>`;
  const net = { served: 0, stop: true };
  t.world.script("https://www.nps.gov/i/", async () => {
    if (net.stop && net.served++ >= 14) throw new TypeError("Too many subrequests by single Worker invocation.");
    return new Response(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3]), { status: 200, headers: { "content-type": "image/png" } });
  });
  t.world.script(PAGE, async () => new Response(html, { status: 200, headers: { "content-type": "text/html" } }));
  await t.mai.act("acquire", { body: { locator: PAGE, subresources: true } });
  const live = (await t.mai.read("opencaptures")).captures;
  assert.equal(live.length, 1, "the owner lists the one capture the runtime stopped");
  return { ...t, net, session: live[0].session };
}
const open = (t, plane = {}) => openWorld("/app/capture/address", { world: t.world, as: t.mai, plane });
const finishBtn = (p, session) => Array.from(main(p).querySelectorAll('button[data-act="acquire"]')).find((b) => b.getAttribute("data-session") === session);
const closed = (p) => main(p).querySelectorAll("[data-closed]");
const said = () => word(hasWord("refusal.NO_SUCH_SESSION") ? "refusal.NO_SUCH_SESSION" : "acquisition.index.no_such_session");

test("R31 R58 (G72) 'Finish it' answered NO_SUCH_SESSION ends that capture: the closed-capture sentence by key, never the code, the Unfinished line leaves, unfinished captures are asked again", async () => {
  const t = await parked();
  /* the list is stale on purpose: the page lists the capture, then the member finishes it elsewhere (the owner's own `acquire` continuing it), and the session is gone */
  const p = await open(t);
  assert.ok(finishBtn(p, t.session), "the Unfinished line offers Finish it");
  t.net.stop = false;
  for (let i = 0; i < 12 && (await t.mai.read("opencaptures")).captures.length; i++) await t.mai.act("acquire", { body: { continue: t.session } });
  assert.deepEqual((await t.mai.read("opencaptures")).captures, [], "the owner no longer holds the session");
  const before = p.byOp("opencaptures").length;
  await p.click(finishBtn(p, t.session));
  for (let i = 0; i < 10; i++) await p.settle(20);
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ continue: t.session }]);
  assert.equal(closed(p).length, 1, "one status line says the capture is closed");
  assert.equal(closed(p)[0].textContent.includes(said()), true, "in the held row's words");
  assert.equal(text(p).includes("NO_SUCH_SESSION"), false, "never the raw code");
  assert.equal(says(p, "refusal.uncatalogued"), false, "never the apology for an uncatalogued code");
  assert.equal(finishBtn(p, t.session), undefined, "the Unfinished line left");
  assert.ok(p.byOp("opencaptures").length > before, "the unfinished captures were asked again");
});

test("R31 R58 (G72) control: a session the plane still holds keeps its line, and any other refusal says nothing of a closed capture", async () => {
  const t = await parked();
  /* the owner's refusal of a continue that is not NO_SUCH_SESSION is a fault the page cannot make a real act cause: the one scripted answer */
  const p = await open(t, { acquire: refused("BAD_LOCATOR", undefined, 400) });
  await p.click(finishBtn(p, t.session));
  for (let i = 0; i < 10; i++) await p.settle(20);
  assert.equal(closed(p).length, 0, "no closed-capture line");
  assert.ok(finishBtn(p, t.session), "the capture is still unfinished: Finish it stays");
});
