/* screens-intake T51 fix round 8 (SCREENS-INTAKE #22): G108 (a capture filed under no project is finished without an empty fill) and G109 (a document is named by the
 * title it was stored under: the finished line and "Already in the record as" read `heldat`'s `copy.title` before any chain). R58, R38, R54. Every test enters by
 * pressing the act; a sentence is asserted by its key (R26, K3810). The no-project sentence is the nearest held row's (`screen.capture.address.done`, K4269; its own
 * row is owed, named in the job record). The alarm-delivered halves are the control-plane seam file's (`t51-round8-seam.test.mjs`).
 * Over the real store (fix round 10, K5054): the press is the owner's own `acquire` (a source declaring 17.4 MB, so it answers `fetch_pending` and parks the capture), the copy
 * the delivery files is a real capture of the address (the capture-request arm's), and the session the delivery ends is dropped by the owner's own route; the alarm's
 * delivery itself (`deliver`, the plane's) is not in a world, so these acts are what it leaves behind. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld as openOver, idle, members, main, fill, press, ok, says, word, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

/* a document named on the page is a link only where the `document` screen is served: the stand-in serves it */
const openWorld = (path, o = {}) => openOver(path, { ...o, screens: [...SCREENS, DOCUMENT_STUB] });

const ADDRESS = "https://www.govinfo.gov/content/pkg/BUDGET-2021-APP/pdf/BUDGET-2021-APP.pdf";
const BYTES = 17400000;
const CAN = ["contribute", "create_projects"];
const PDF = "%PDF-1.4\n1 0 obj << /Title (Budget) >> endobj\n";

/* the source: declaring a size too large to wait for (so the press parks it), then serving the small copy a capture request reads */
async function team() {
  const t = await members({ mai: CAN });
  const net = { large: true };
  t.world.script(ADDRESS, async () => (net.large ? new Response("x", { status: 200, headers: { "content-type": "application/pdf", "content-length": String(BYTES) } })
    : new Response(PDF, { status: 200, headers: { "content-type": "application/pdf" } })));
  return { ...t, net };
}
/* the copy the team comes to hold: a question to capture the address for, the request, the daemon's drain (the owner reads the address and files the copy) */
async function holdCopy(t) {
  t.net.large = false;
  const home = await t.world.recipes.project(t.mai, "Delivered");
  const q = await t.world.recipes.question(t.mai, home, { title: "The budget", text: "What did the city adopt?" });
  const asked = await t.mai.act("capturerequest", { body: { address: ADDRESS, target: q.id } });
  const drained = await t.world.door({ url: "/api/?op=capturerequestdrain", init: { method: "POST", headers: { "content-type": "application/json" }, body: "{}" } }, { token: t.world.env.DAEMON_TOKEN });
  const done = ((drained.json.result || {}).captured || []).find((c) => c.request === asked.request);
  assert.ok(done && done.promoted && done.promoted.ok, "the owner filed the copy");
  return (await t.mai.read("heldat", { query: { address: ADDRESS } })).copy;
}
/* the delivery's end, as the plane's alarm leaves it: the copy filed, the session gone from the member's open captures (the owner's own route, `owedFetch` ends with it) */
async function deliver(t) {
  const copy = await holdCopy(t);
  const listed = (await t.mai.read("opencaptures")).captures;
  for (const c of listed) assert.equal((await t.world.send({ url: `http://x/dropcapturesession?session=${c.session}`, method: "POST", body: {} })).status, 200);
  assert.deepEqual((await t.mai.read("opencaptures")).captures, [], "the owner lists nothing now");
  return copy;
}
const fetched = (p) => main(p).querySelector("[data-fetched]");
/* a copy the owner holds under no title of its own, which a held document without one answers (the one scripted answer: the real answer with its title blank) */
const untitled = (t) => async (req) => {  const { op, ...query } = req.query;
  const r = await t.mai.read("heldat", { query }); const out = ok(r.copy ? { ...r, copy: { ...r.copy, title: null } } : r);  return out; };

/* a capture too large for the request, pressed, then delivered: the session leaves the list and the record shows the copy */
async function delivered(path, { plane = {}, project = null } = {}) {
  const t = await team();
  const proj = project ? await t.world.recipes.project(t.mai, project) : null;
  const p = await openWorld(proj ? `${path}/${proj}` : path, { world: t.world, as: t.mai, plane: plane.make ? plane.make(t) : {} });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.equal(p.byOp("acquire").length, 1);
  assert.ok((await t.mai.read("opencaptures")).captures[0].fetch_pending, "the owner parked it: a capture owed");
  const copy = await deliver(t);
  await p.clock.tick(4000);
  for (let i = 0; i < 8; i++) await p.settle(20);
  return { p, t, copy, proj };
}

test("R58 (G108) a project-less capture delivered after the press is finished without an empty fill: the document linked, where it waits, and no 'filed under' with nothing after it", async () => {
  const { p, copy } = await delivered("/app/capture/address");
  const line = fetched(p);
  assert.ok(line, "the finished line is drawn");
  const link = line.querySelector(`a[href*="${copy.document}"]`);
  assert.ok(link, "it links the document the delivery filed");
  assert.equal(line.textContent, word("screen.capture.address.done", { title: link.textContent }), "the nearest held row names the document and where it waits");
  assert.notEqual(line.textContent, word("screen.capture.fetch.done", { document: link.textContent, project: "" }), "the project sentence is not drawn with an empty fill");
  assert.equal(says(p, "capture.filed.project", { project: "" }), false);
});

test("R58 (G108) control: a capture from a project's page is finished by the project sentence with the project's name", async () => {
  const { p, copy } = await delivered("/app/capture/address", { project: "Yosemite" });
  const line = fetched(p);
  assert.ok(line);
  const link = line.querySelector(`a[href*="${copy.document}"]`);
  assert.ok(link);
  assert.equal(line.textContent, word("screen.capture.fetch.done", { document: link.textContent, project: "Yosemite" }));
});

test("R58 R54 (G109) the finished line names the delivered document by the title it was stored under, not the press's host-and-day chain", async () => {
  const { p, copy } = await delivered("/app/capture/address");
  assert.ok(copy.title, "the owner holds the copy under a title");
  const link = fetched(p).querySelector(`a[href*="${copy.document}"]`);
  assert.equal(link.textContent, copy.title);
  assert.equal(says(p, "document.untitled.web", { site: "www.govinfo.gov", date: "x" }), false);
});

test("R54 (G109) control: a delivered copy that states no stored title keeps the name the press gave it", async () => {
  const { p, copy, t } = await delivered("/app/capture/address", { plane: { make: (t) => ({ heldat: untitled(t) }) } });
  const link = fetched(p).querySelector(`a[href*="${copy.document}"]`);
  assert.ok(link && link.textContent.length > 0 && link.textContent !== copy.title);
});

test("R38 R54 (G109) 'Already in the record as' names a copy absent from the vouched list by the title `heldat` answers, not by host and day", async () => {
  /* the screen was opened before the copy was delivered: the vouched picker list does not hold its row */
  const t = await team();
  const p = await openWorld("/app/capture/address", { world: t.world, as: t.mai });
  const copy = await holdCopy(t);
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.equal(p.byOp("acquire").length, 0, "nothing is captured: the address is held");
  const named = main(p).querySelector(".rec");
  assert.ok(named, "the compared copy is named");
  assert.equal(named.textContent, copy.title);
  assert.equal(says(p, "document.untitled.web", { site: "www.govinfo.gov", date: "x" }), false);
});

test("R38 R54 (G109) control: a copy with no stored title and no row in the list is named by the chain a delivery uses", async () => {
  const t = await team();
  const p = await openWorld("/app/capture/address", { world: t.world, as: t.mai, plane: { heldat: untitled(t) } });
  const copy = await holdCopy(t);
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await idle(p, 200000);   /* the owner's look at the source (`check`) takes real time: waited for by its answer, which the counted double holds out */
  assert.notEqual(main(p).querySelector(".rec").textContent, copy.title);
  assert.ok(main(p).querySelector(".rec").textContent.length > 0);
});
