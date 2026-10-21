/* screens-intake R45, R49, R50 (T51 fix round; DEC-375 C19; K4194 L3; DEC-384 A1, A2, I-02, I-03, I-04): the capture screen by
 * address on the real served page. A sentence is asserted by its key (R26), never by its English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, untitled, dayOf, text, main, btn, fill, press, ok, refused, word, says, saysIn, DOCUMENT_STUB } from "./page.mjs";
import { pending } from "../interface-shell/harness.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const NOT_HELD = ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } });
const open = (path, o = {}) => openPage(path, { ...o, plane: { heldat: NOT_HELD, ...(o.plane || {}) }, screens: [...SCREENS, DOCUMENT_STUB] });
const ADDRESS = "https://www.example.gov/reports/street-maintenance-2026.pdf";
const SHA = "a".repeat(64);
const DOC = { capture: { sha256: SHA, bytes: 1200, encoding: "binary", content_type: "application/pdf" }, file: "snapshots/a.pdf", title: null };
const heldBy = (document) => (req) => (req.query.sha256 ? ok({ ok: true, held: true, copy: { sha256: SHA, document, project: null, retrieved: "2026-10-01T10:00:00Z", actor: "member:x", grade: null, address: ADDRESS },
  versions: 1, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } }) : NOT_HELD);
const CAPTURED = { allocid: ok({ ok: true, id: "INFO-2026-0001" }), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) };

test("R45 the page as the site sent it is the default and sends no render; the visitor's view sends acquire with render: true", async () => {
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, document: DOC }) } });
  assert.equal(p.doc.getElementById("ci-render-0").checked, true);
  assert.equal(p.doc.getElementById("ci-render-1").checked, false);
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS }]);
  fill(p, { "ci-render-1": true });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS }, { locator: ADDRESS, render: true }]);
  for (const k of ["screen.capture.render.keep.site", "screen.capture.render.keep.visitor", "screen.capture.render.keep.explain1", "screen.capture.render.keep.explain2"]) assert.ok(says(p, k), k);
});

test("R45 control: the web-archive capture is drawn as unavailable with its reason and offers nothing: no choice, no act, nothing sent", async () => {
  const p = await open("/app/capture/address", { plane: { acquire: ok({ ok: true, document: DOC }) } });
  for (const k of ["screen.capture.archive.summary", "screen.capture.archive.explain1", "screen.capture.archive.explain2"]) assert.ok(says(p, k), k);
  const radios = main(p).querySelectorAll('input[name="ci-render"]');
  assert.equal(radios.length, 2, "two choices: the site's and the visitor's; none for the archive");
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.ok(p.byOp("acquire").every((r) => !("coArchive" in r.body) && !("via" in r.body)));
});

test("R45 a render refusal is drawn by its own key", async () => {
  const p = await open("/app/capture/address", { plane: { acquire: refused("RENDER_NO_RENDERER", "builder detail") } });
  fill(p, { "ci-address": ADDRESS, "ci-render-1": true });
  const r = await press(p, "acquire");
  assert.ok(saysIn(r.slot(), "refusal.RENDER_NO_RENDERER"));
});

test("R49 existed: true with a visible document links it and files nothing", async () => {
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, heldat: heldBy("INFO-2026-0042-held"), acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("heldat").map((r) => r.query).slice(-1), [{ op: "heldat", sha256: SHA }]);
  assert.equal(p.byOp("allocid").length, 0);
  assert.equal(p.byOp("promote").length, 0);
  assert.ok(main(p).querySelector('a[href*="INFO-2026-0042-held"]'), "a link to the document that holds the bytes");
  assert.ok(says(p, "screen.capture.address.existed", { title: untitled() }));
});

test("R49 existed: true with no document the viewer sees files a new one and links it", async () => {
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.equal(p.byOp("promote").length, 1, "promoted for the viewer");
  const id = p.byOp("promote")[0].body.bundleId;
  assert.ok(main(p).querySelector(`a[href*="${id}"]`), "and linked");
  assert.ok(says(p, "screen.capture.address.done", { title: untitled() }));
});

test("R49 control: existed: false promotes as before and looks nothing up by digest", async () => {
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, existed: false, document: DOC }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.equal(p.byOp("promote").length, 1);
  assert.ok(p.byOp("heldat").every((r) => r.query.sha256 === undefined));
});

test("R50 (A1) the working key is drawn from the press until the answer, and not after", async () => {
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: pending } });
  fill(p, { "ci-address": ADDRESS });
  await p.click(btn(p, "acquire"));
  await p.settle(20);
  assert.ok(says(p, "screen.capture.address.working"), "while the answer is out");
  assert.ok(says(p, "screen.capture.address.working.head"));
  const q = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, document: DOC }) } });
  assert.ok(!says(q, "screen.capture.address.working"), "control: nothing before a press");
  fill(q, { "ci-address": ADDRESS });
  await press(q, "acquire");
  await q.settle();
  assert.ok(!says(q, "screen.capture.address.working"), "none after the answer");
});

test("R50 (A2) the result is a status line directly under the act row", async () => {
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, document: DOC }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  const acts = btn(p, "acquire").closest(".mk-acts");
  const next = acts.nextElementSibling;
  assert.equal(next.getAttribute("role"), "status");
  assert.ok(next.textContent.includes(word("screen.capture.address.done", { title: untitled() })));
});

test("R50 (I-03) R54 a document is named by its title; without one by its host and the day, never the file part of its address", async () => {
  const t = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, document: DOC, reading: { title: "Housing notice 2026-118" } }) } });
  fill(t, { "ci-address": ADDRESS });
  await press(t, "acquire");
  await t.settle();
  assert.ok(says(t, "screen.capture.address.done", { title: "Housing notice 2026-118" }));
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, document: DOC, reading: null }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  await p.settle();
  assert.ok(says(p, "document.untitled.web", { site: "www.example.gov", date: dayOf(Date.now()) }));
  assert.ok(!text(p).includes("street-maintenance-2026"), "no part of the address");
});

test("R50 (I-04) an existing document is said with its existed key and an Open it link to it", async () => {
  const p = await open("/app/capture/address", { plane: { heldat: heldBy("INFO-2026-0042-held"), acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  const a = main(p).querySelector('a[href*="INFO-2026-0042-held"]');
  assert.ok(a.textContent.includes(word("screen.capture.address.existed.open")));
});

test("R50 (I-02) ACQUIRE_TIMED_OUT is drawn by its reworded key", async () => {
  const p = await open("/app/capture/address", { plane: { acquire: refused("ACQUIRE_TIMED_OUT", "builder detail", 504) } });
  fill(p, { "ci-address": ADDRESS });
  const r = await press(p, "acquire");
  assert.ok(saysIn(r.slot(), "refusal.ACQUIRE_TIMED_OUT"));
  assert.ok(!r.slot().textContent.includes("builder detail"));
});

test("R50 control: a file capture is unchanged: its done sentence names the file and no working line is drawn", async () => {
  const p = await open("/app/capture/file");
  assert.ok(!says(p, "screen.capture.address.working"));
  assert.ok(!says(p, "screen.capture.render.keep.site"), "the render choice is the address tab's alone");
});
