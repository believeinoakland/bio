/* store-request R19 (STORE-REQUEST #8, B21 START; K5251): the recipes `rendered`, `renderPending`, `unfinished`, `partedAddress` and `followed`, and the door's follow of a promotion (R17), each over the
   real store: the state is the owner's own, each with a control that shows the recipe is what makes it. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";
import { fileDocument } from "./door.mjs";
import { renderFailure } from "../capture-sources/fixtures.mjs";

const caps = { capabilities: ["contribute", "create_projects"] };
const ADDRESS = "https://events.example.gov/council";
const jobState = async (world, sha, kind = "reading") => {
  const res = await world.send({ url: `http://do/jobrow?sha=${sha}&kind=${kind}`, method: "GET", body: null, headers: {} });
  const row = (await res.json()).result;
  return row && row.row ? row.row.state : "none";
};
const bigPage = (title) => `<html><head><title>${title}</title></head><body>${"<p>A paragraph of the budget that goes on and on.</p>\n".repeat(80000)}</body></html>`;

test("R19 rendered: the capture of a page as a visitor saw it: the renderer was asked and the document is the rendered one beside its shell; control: a plain capture keeps the shell and asks no renderer; a world with no renderer refuses the render", async () => {
  const w = await storeWorld({ renderer: true });
  const mai = await w.signIn("mai", caps);
  const made = await w.recipes.rendered(mai);
  assert.equal(made.document.capture.method, "rendered");
  assert.equal(made.document.pair.primary, "rendered");
  assert.ok(made.document.pair.shell.sha256 && made.document.pair.shell.sha256 !== made.document.pair.rendered.sha256, "the shell is kept beside the rendered page");
  assert.deepEqual(w.renderer.calls.map((c) => c.url), [ADDRESS], "the renderer was asked for the address once");
  assert.equal(made.document.title, "City Council meeting", "the document is the rendered page's, not the shell's");
  /* control: the same kind of address captured plain */
  w.script("https://events.example.gov/plain", async () => new Response("<html><head><title>Plain page</title></head><body><p>As the site sent it.</p></body></html>", { status: 200, headers: { "content-type": "text/html" } }));
  const plain = await mai.act("acquire", { body: { locator: "https://events.example.gov/plain" } });
  assert.notEqual(plain.document.capture.method, "rendered");
  assert.equal(w.renderer.calls.length, 1, "a plain capture asks no renderer");
  /* control: no renderer bound */
  const bare = await storeWorld();
  const bo = await bare.signIn("bo", caps);
  await assert.rejects(() => bare.recipes.rendered(bo), /renderer: true/);
  bare.script(ADDRESS, async () => new Response("<html><body><div id=app></div></body></html>", { status: 200, headers: { "content-type": "text/html" } }));
  await assert.rejects(() => bo.act("acquire", { body: { locator: ADDRESS, render: true } }), /RENDER_NO_RENDERER/);
});

test("R19 renderPending: a render still being made is left pending with its session, the open captures list it; released, 'Finish it' answers the visitor copy and the session leaves the list; a failed render is refused RENDER_FAILED and files nothing", async () => {
  const w = await storeWorld({ renderer: true });
  const mai = await w.signIn("mai", caps);
  const made = await w.recipes.renderPending(mai);
  assert.equal(made.answer.render.state, "pending");
  assert.equal(made.answer.document.render_pending.session, made.session);
  assert.equal(made.answer.document.capture.method === "rendered", false, "the shell is what was filed so far");
  assert.deepEqual(made.listed.map((c) => [c.session, c.outstanding]), [[made.session, 1]], "listed as unfinished");
  await made.release();
  const done = await mai.act("acquire", { body: { continue: made.session } });
  assert.equal(done.document.capture.method, "rendered", "Finish it answers the visitor copy");
  assert.equal(done.document.title, "City Council meeting");
  assert.deepEqual((await mai.read("opencaptures")).captures, [], "nothing is left for the member to finish");
  /* a render that fails: the continuation is refused in the renderer's failure's words and files nothing */
  const f = await storeWorld({ renderer: true });
  const fay = await f.signIn("fay", caps);
  const stuck = await f.recipes.renderPending(fay);
  f.renderer.fail(await renderFailure({ class: "no_session" }));
  await stuck.release();
  await assert.rejects(() => fay.act("acquire", { body: { continue: stuck.session } }), /RENDER_FAILED/);
  assert.deepEqual((await fay.read("heldat", { query: { address: ADDRESS } })).copy, null, "nothing was filed");
  /* control: a world with no renderer cannot leave a render pending */
  const bare = await storeWorld();
  await assert.rejects(() => bare.recipes.renderPending(null), /renderer: true/);
});

test("R19 renderPending (alarm): the first capture filed under a project, released, the store's alarm finishes the render and the delivery files the visitor copy as a second document, and the session leaves the list; control: with no delivery nothing is filed", async () => {
  const w = await storeWorld({ renderer: true, deliver: true });
  const mai = await w.signIn("mai", caps);
  const projectId = await w.recipes.project(mai, "Meetings");
  const made = await w.recipes.renderPending(mai, { project: projectId });
  /* the screen files the first capture (the shell) under the project, as it does at the press */
  const shell = await fileDocument(w, mai, "Council meeting", made.answer.document, projectId);
  await made.release();
  await w.tick(60_000);
  const fresh = await w.signIn("mai");
  assert.deepEqual((await fresh.read("opencaptures")).captures, [], "the delivery ended the session");
  const copy = (await fresh.read("heldat", { query: { address: ADDRESS } })).copy;
  assert.ok(copy && copy.document, "the visitor copy is filed");
  assert.notEqual(copy.sha256, shell.sha, "a second document: the page as a visitor saw it");
  const plain = await storeWorld({ renderer: true });
  const sam = await plain.signIn("sam", caps);
  const owedStill = await plain.recipes.renderPending(sam);
  await owedStill.release();
  await plain.tick(60_000);
  assert.equal((await (await plain.signIn("sam")).read("heldat", { query: { address: ADDRESS } })).copy, null, "a world with no delivery files nothing");
});

/* control-plane `deliverOwedRender` files a render's visitor copy under the shell's project, asking the record for the shell as its opener sees it (index.mjs:684-690), but a render's session
   keeps its opener as the bare member id (acquisition index.mjs:1780) and `heldAt` answers nothing for a bare id (the viewer's form is `member:<id>`), so the copy is filed under no project:
   REPORTed (STORE-REQUEST #8 J1); the world's delivery does as control-plane does, and this waits for control-plane's fix */
test.todo("R19 renderPending (alarm): the visitor copy is filed under the project the shell was filed under (control-plane index.mjs:684-690 asks the shell's home with the bare opener id)");

test("R19 unfinished: a capture left with its supporting files outstanding: the platform stops the call, the open captures list the session, and each 'Finish it' fetches more until none is owed; control: a plain capture of the same page keeps no session; a ceiling past the pictures leaves none", async () => {
  const w = await storeWorld();
  const mai = await w.signIn("mai", caps);
  const made = await w.recipes.unfinished(mai);
  assert.equal(made.answer.snapshot.fetched, 5, "the pictures the call could fetch before the platform stopped it");
  assert.equal(made.outstanding, made.answer.snapshot.outstanding);
  assert.ok(made.outstanding >= made.images - 5, "the rest are owed");
  assert.deepEqual(made.listed.map((c) => [c.session, c.outstanding]), [[made.session, made.outstanding]]);
  made.lift();
  let left = made.outstanding, presses = 0;
  while (left > 0 && presses < 12) {
    const next = await mai.act("acquire", { body: { continue: made.session } });
    assert.ok(next.continued && next.continued.session === made.session, "a continuation files no new document");
    assert.ok(next.snapshot.outstanding < left, "each press fetches more");
    left = next.snapshot.outstanding;
    presses++;
  }
  assert.equal(left, 0);
  assert.deepEqual((await mai.read("opencaptures")).captures, [], "nothing is left to finish");
  /* control: the same page captured plain has no supporting files owed */
  const other = await w.signIn("ben", caps);
  w.script("https://www.oaklandca.gov/events/plain", async () => new Response("<html><head><title>Plain</title></head><body><img src=\"https://www.oaklandca.gov/events/plain/a.png\"></body></html>", { status: 200, headers: { "content-type": "text/html" } }));
  const plain = await other.act("acquire", { body: { locator: "https://www.oaklandca.gov/events/plain" } });
  assert.equal(plain.snapshot, undefined);
  assert.deepEqual((await other.read("opencaptures")).captures, []);
  const fresh = await storeWorld();
  const cy = await fresh.signIn("cy", caps);
  await assert.rejects(() => fresh.recipes.unfinished(cy, { address: "https://www.oaklandca.gov/events/short", images: 3, ceiling: 9 }), /files outstanding/);
});

test("R19 partedAddress: the alarm's fetch of a file over what the call reads holds the capture in parts, the record's image lists them in order; control: acquire alone answers no document (the source is owed), and a file the call reads whole is no recipe state", async () => {
  const w = await storeWorld({ deliver: true });
  const mai = await w.signIn("mai", caps);
  const projectId = await w.recipes.project(mai, "Packets");
  const made = await w.recipes.partedAddress(mai, { project: projectId });
  assert.equal(made.parts.length, 2, `10 MiB in parts of 8 MiB: ${made.parts.join(", ")}`);
  assert.deepEqual(made.parts, [...made.parts].sort(), "in order");
  assert.ok(made.parts[0].endsWith(".part000") && made.parts[1].endsWith(".part001"));
  assert.equal(made.copy.project, projectId);
  assert.equal(made.copy.actor, "mai");
  assert.equal(made.pending.declared_bytes, 10 * 1048576, "the source declared its size and the call parked it: no document was answered");
  /* control: a file the call reads whole is not parked, so no alarm holds it in parts */
  const small = await w.signIn("bo", caps);
  await assert.rejects(() => w.recipes.partedAddress(small, { address: "https://www.oaklandca.gov/files/short.pdf", mib: 1 }), /not parked as an owed fetch/);
});

test("R17 R19 followed: a world made with follow: true follows a promotion with its reading: a file read at once is read, a file over the inline ceiling stands by its job row and the promotion says reading_pending until the alarm reads it; controls: a document that brings its own reading is not followed, and without follow nothing follows", async () => {
  const notice = "<html><head><title>Notice</title></head><body><p>Hello.</p></body></html>";
  const w = await storeWorld({ follow: true });
  const mai = await w.signIn("mai", caps);
  const small = await w.recipes.followed(mai, "Notice", notice);
  assert.equal(small.reading.found, true, "read at once");
  assert.equal(small.promoted.reading_pending, undefined);
  const big = await w.recipes.followed(mai, "Big notice", bigPage("Big"));
  assert.equal(big.promoted.reading_pending, true, "the reading is owed");
  assert.equal(big.reading.found, false);
  assert.equal(await jobState(w, big.sha), "queued", "its row stands");
  await w.tick(60_000);
  await w.tick(60_000);
  assert.equal((await (await w.signIn("mai")).read("reading", { query: { sha256: big.sha } })).found, true, "the alarm read it");
  /* control: a document that carries its own reading (the owner's acquire reads what it fetches) is not followed */
  const ben = await w.signIn("ben", caps);
  w.script("https://www.oaklandca.gov/files/notice", async () => new Response(notice.replace("Hello.", "Hello, Ben."), { status: 200, headers: { "content-type": "text/html" } }));
  const got = await ben.act("acquire", { body: { locator: "https://www.oaklandca.gov/files/notice" } });
  assert.ok(got.document.reading, "the acquire answer carries a reading");
  const out = {};
  const filed = await fileDocument(w, ben, "Notice again", got.document, "", out);
  assert.equal(out.promoted.reading_pending, undefined);
  assert.equal((await ben.read("reading", { query: { sha256: filed.sha } })).found, true, "the reading is the one the promotion brought");
  /* control: no follow (the world made after the checks above: a world's network is the latest one's) */
  const plain = await storeWorld();
  const bo = await plain.signIn("bo", caps);
  await assert.rejects(() => plain.recipes.followed(bo, "Notice", "x"), /follow: true/);
  const heldSmall = await plain.recipes.hold(bo, "Notice", notice, "", { type: "text/html" });
  assert.equal((await bo.read("reading", { query: { sha256: heldSmall.sha } })).found, false, "a world that does not follow reads nothing at the promotion");
  const out0 = {};
  const up = await plain.door({ url: `/api/?${new URLSearchParams({ op: "captureupload", statement: "Big", name: "Big", type: "text/html" })}`,
                                init: { method: "POST", headers: { "content-type": "text/html" }, body: new TextEncoder().encode(bigPage("Big")) } }, bo);
  await fileDocument(plain, bo, "Big", up.json.result.document, "", out0);
  assert.equal(out0.promoted.reading_pending, undefined, "and says no reading is owed");
});

test("R17 R19 followed (delivery): the alarm's delivery of an owed fetch follows its filing with the reading as the door does: a small file is read at once, a file over the inline ceiling stands by its job row until the alarm reads it; control: a world that does not follow reads nothing at the filing", async () => {
  const small = "<html><head><title>Budget</title></head><body><p>The budget.</p></body></html>";
  const w = await storeWorld({ deliver: true, follow: true });
  const mai = await w.signIn("mai", caps);
  const a = await w.recipes.delivered(mai, { address: "https://www.oaklandca.gov/files/short.html", body: small, type: "text/html" });
  assert.equal((await a.as.read("reading", { query: { sha256: a.copy.sha256 } })).found, true, "read at once");
  const b = await w.recipes.delivered(mai, { address: "https://www.oaklandca.gov/files/budget.html", body: bigPage("Budget"), type: "text/html" });
  const sha = b.copy.sha256;
  assert.equal(await jobState(w, sha), "queued", "its row stands");
  assert.equal((await b.as.read("reading", { query: { sha256: sha } })).found, false, "the reading is owed");
  await w.tick(60_000);
  await w.tick(60_000);
  assert.equal((await (await w.signIn("mai")).read("reading", { query: { sha256: sha } })).found, true, "the alarm read it");
  const plain = await storeWorld({ deliver: true });
  const bo = await plain.signIn("bo", caps);
  const c = await plain.recipes.delivered(bo, { address: "https://www.oaklandca.gov/files/short.html", body: small, type: "text/html" });
  assert.equal((await c.as.read("reading", { query: { sha256: c.copy.sha256 } })).found, false, "a world that does not follow reads nothing at the filing");
});
