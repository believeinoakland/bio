/* screens-intake T51 fix round 3 (SCREENS-INTAKE #14; K4356, K4370): C9 R49, C14, C17 R2, C23 R4, C25 R54, C28 R7, C29, C35, C78 R47, C94,
 * FC-23 and N4 (R57 proposed), C81. A sentence is asserted by its key (R26), never by its English.
 * Fix round 10 (K5054): over the REAL store. The members are signed in by the real acts; a document is held by a real upload or a real capture of an
 * address the world's network is scripted to answer (an environment double); a project, a question, a knock, a login are made by the owners' own acts;
 * every value an assertion needs (an id, a digest, a title) is read from those acts' answers. The one scripted answer that stays is named where it is. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, text, html, main, btn, fill, press, refused, word, says, saysIn, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { generate } from "../../pdfgen.mjs";

const ADDRESS = "https://www.acgov.org/board/minutes-2026-10.html";
const MINUTES = "<html><head><title>Board minutes</title></head><body><p>The board met on Tuesday.</p></body></html>";
const CAN = ["contribute", "create_projects"];
/* a team: mai (who may start projects) and two projects she is in; the world's network answers the exact addresses a test serves */
async function team() {
  const t = await members({ mai: CAN }, {});
  t.mine = await t.world.recipes.project(t.mai, "Pothole repairs");
  t.home = await t.world.recipes.project(t.mai, "Housing repairs");
  return t;
}
const serve = (world, address, body, type = "text/html", headers = {}) => world.script((req) => req.url === address, () => new Response(body, { status: 200, headers: { "content-type": type, ...headers } }));
const open = (t, path, o = {}) => openWorld(path, { world: t.world, as: o.as || t.mai, screens: [...SCREENS, DOCUMENT_STUB], plane: o.plane || {} });
const anchors = (p, id) => Array.from(main(p).querySelectorAll("a")).filter((a) => String(a.getAttribute("href")).includes(id));

/* ---------- C9: R49 (capture R100, R101) ---------- */

/* The sentence for "filed here as well" is the design's row (DEC-412), asserted by its key. */
const FILEDHERE = "screen.capture.address.filedhere";
const saysFiled = (p, home) => says(p, FILEDHERE, { project: home });

/* the minutes held under `project` by a real upload, and the address that answers the same bytes */
async function minutesIn(t, project, as = t.mai) {
  const held = await t.world.recipes.hold(as, "Board minutes", MINUTES, project, { type: "text/html" });
  serve(t.world, ADDRESS, MINUTES);
  return held;
}
const capture = async (p, address = ADDRESS) => { fill(p, { "ci-address": address }); return press(p, "acquire"); };

test("R49 (C9) a capture from a project's page whose bytes are held under another project's document sends `captureseenin` for the subject project and says it is filed here as well", async () => {
  const t = await team();
  const held = await minutesIn(t, t.home);
  const p = await open(t, `/app/capture/address/${t.mine}`);
  await capture(p);
  assert.deepEqual(p.byOp("captureseenin").map((r) => r.body), [{ captureSha: held.sha, project: t.mine }], "the digest and the subject project, nothing else");
  assert.equal(p.byOp("allocid").length + p.byOp("promote").length, 0, "no second document is written");
  assert.equal(anchors(p, held.bundle).length, 1, "the held copy is shown once");
  assert.ok(saysFiled(p, "Housing repairs"), "the result says it is filed here as well");
  const listed = (await t.mai.read("heldcaptures", { query: { project: t.mine } })).held.map((h) => h.bundle_id);
  assert.ok(listed.includes(held.bundle), "the owner now lists the document in the subject project");
});

test("R49 (C9) control: a found document whose home is the subject project is recorded as seen nowhere; with no subject nothing is sent", async () => {
  const t = await team();
  const held = await minutesIn(t, t.mine);
  const same = await open(t, `/app/capture/address/${t.mine}`);
  await capture(same);
  assert.equal(same.byOp("captureseenin").length, 0);
  assert.equal(anchors(same, held.bundle).length, 1);
  const u = await team();
  const away = await minutesIn(u, u.home);
  const bare = await open(u, "/app/capture/address");
  await capture(bare);
  assert.equal(bare.byOp("captureseenin").length, 0);
  assert.equal(anchors(bare, away.bundle).length, 1);
});

test("R49 (C9) control: a hidden home names the holder and files nothing (no `captureseenin`)", async () => {
  /* the bytes are held in a project rosa is in and mai is not: mai's record shows her no document for them, so her own promotion is refused by provenance */
  const t = await members({ mai: CAN, rosa: CAN });
  t.mine = await t.world.recipes.project(t.mai, "Pothole repairs");
  const theirs = await t.world.recipes.project(t.rosa, "Rosa's project");
  const hidden = await t.world.recipes.hold(t.rosa, "The earlier minutes", MINUTES, theirs, { type: "text/html" });
  serve(t.world, ADDRESS, MINUTES);
  assert.equal((await t.mai.read("heldat", { query: { sha256: hidden.sha } })).held, false, "mai is shown no document for these bytes");
  const p = await open(t, `/app/capture/address/${t.mine}`);
  await capture(p);
  assert.equal(p.byOp("captureseenin").length, 0);
  assert.ok(says(p, "refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE"), "the refusal in words");
  assert.equal(anchors(p, hidden.bundle).length, 0, "the owner names a holder only to a caller who may see it: a holder it withholds is neither named nor linked");
  /* control: where the owner does name the holder the page links it once. The owner names a holder only to a caller who may see it, and the sight rule that lets her see it
     also shows her a copy at `heldat`, so no act of the world refuses a promotion with a holder she sees: the one scripted answer (a fault), naming rosa's real bundle */
  const q = await open(t, `/app/capture/address/${t.mine}`, { plane: { promote: refused("CAPTURE_HELD_BY_ANOTHER_BUNDLE", undefined, 409, { holder: hidden.bundle }) } });
  await capture(q);
  assert.equal(q.byOp("captureseenin").length, 0);
  assert.ok(says(q, "refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE"));
  assert.equal(anchors(q, hidden.bundle).length, 1);
});

test("R49 (C9) a `captureseenin` the plane refuses is drawn by its words and the held copy is still linked once", async () => {
  /* the page stops a member who is neither in the project nor invited (G74); an invited member who has not joined passes, and the owner refuses her: a real refusal */
  const t = await members({ mai: CAN, rosa: CAN });
  t.home = await t.world.recipes.project(t.mai, "Housing repairs");
  const theirs = await t.world.recipes.project(t.rosa, "Pothole repairs");
  await t.rosa.act("projectinvite", { query: { projectId: theirs, handle: "mai" } });
  const held = await minutesIn(t, t.home);
  const p = await open(t, `/app/capture/address/${theirs}`);
  await capture(p);
  assert.equal(p.byOp("captureseenin").length, 1);
  assert.ok(says(p, "refusal.PROJECT_ACT_NOT_A_PARTICIPANT"), "the refusal in words");
  assert.equal(anchors(p, held.bundle).length, 1);
  assert.ok(!saysFiled(p, "Housing repairs"), "it is not said to be filed");
});

test("R49 (C9) an upload whose bytes are held under another project's document is filed in the subject project as well", async () => {
  const t = await team();
  const held = await t.world.recipes.hold(t.mai, "Seminary Ave", "photo bytes", t.home, { type: "image/jpeg" });
  const p = await open(t, `/app/capture/file/${t.mine}`);
  fill(p, { "ci-file": new File(["photo bytes"], "Seminary Ave.jpg", { type: "image/jpeg" }), "ci-how-made": true, "ci-where": "6012 Seminary Ave", "ci-what": "The pothole." });
  await press(p, "captureupload");
  assert.deepEqual(p.byOp("captureseenin").map((r) => r.body), [{ captureSha: held.sha, project: t.mine }]);
  assert.equal(p.byOp("captureupload")[0].query.for, undefined, "an existed upload takes no `for` (R29)");
  assert.equal(anchors(p, held.bundle).length, 1);
  assert.ok(saysFiled(p, "Housing repairs"));
});

test("R49 (acquisition R96) a `CAPTURE_NOT_KEPT` acquire is drawn through its row's words, files nothing and links nothing", async () => {
  const t = await team();
  /* the owner refuses a capture it could not keep whole when the object store fails mid-write, which no act of the world makes: the one scripted answer (a fault) */
  const p = await open(t, "/app/capture/address", { plane: { acquire: refused("CAPTURE_NOT_KEPT", "The copy could not be kept whole, so nothing was filed.", 502) } });
  serve(t.world, ADDRESS, MINUTES);
  await capture(p);
  assert.ok(says(p, "refusal.CAPTURE_NOT_KEPT"));
  assert.equal(p.byOp("promote").length + p.byOp("captureseenin").length, 0);
});
