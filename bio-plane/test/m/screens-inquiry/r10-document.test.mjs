/* screens-inquiry fix round 10 (T51), causes 35a and 38 (G7; K5055; diagnosis `build/plan/diagnosis-R10-a-2.md`; K4426). R35a (R96): the grade note of a copy with no grade has a heading that says
 * it is not graded, never "Why {letter}?" filled with the undetermined word and an empty reason. R135 (capture-sources R49): a page captured by rendering says that its copy is the page's
 * first load, in the words of the statement its gaps hold; a plain capture draws none. R136 (acquisition R119): "N pictures kept, not read", with their number and total size; a page with
 * none draws none. The register document is the shape acquisition's `supportingOf` and the render record state (acquisition R108, R119; capture-sources R49); the sentences are asserted by
 * their keys' words (K3810), a row owed being asserted as its key's words when held and as the figures alone while it is not. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { open, main, press, word, D, SHA, DOCUMENT_MD, section, storeWorld } from "./fixtures.mjs";

process.env.TZ = "UTC";
const at = "/app/document/" + D;
const text = (el) => String(el && el.textContent || "");
const doc = (extra) => ({ [D]: { "bundle.md": DOCUMENT_MD, "data/provenance.json": JSON.stringify({ documents: [{ capture: { sha256: SHA, ...(extra.capture || {}) }, ...(extra.top || {}) }] }) } });
const said = (key, vars) => (hasWord(key) ? word(key, vars) : null);
/* the keys owed to the design, read through names so a test never types a sentence */
const NOT_GRADED = "screen.document.gradenote.head.ungraded";
const PICTURES = "screen.document.supporting.pictures", PICTURE_ONE = "screen.document.supporting.pictures.one";
/* the statement the capture's gaps hold is the held row's own words (capture-sources R49's `RENDER_COPY_STATEMENT`, made by `localize` from this row) */
const COPY = "capture-sources.render.copy_first_load_not_scrolled";
const mb = (n) => word("size.mb", { n: (n / 1048576).toFixed(1) });

test("R35a R96 a copy no read grades: pressing 'Read the grade note' draws a heading that says it is not graded, never 'Why undetermined, because ?'", async () => {
  /* a file a member brought in, held by the real acts: capture answers `capturegrade` for it with no grade (it was never fetched) */
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute"] });
  const { sha, bundle } = await world.recipes.hold(ann, "Minutes", "The council met on Monday.");
  const { door, session } = world.boot(ann);
  const held = await ann.read("capturegrade", { query: { capture: sha } });
  assert.equal(held.grade.grade, null, "the real answer: no grade");
  const p = await open("/app/document/" + bundle, { images: { [bundle]: await ann.read("image", { query: { id: bundle } }) }, boot: { door, session }, plane: { capturegrade: undefined } });
  await press(p, "gradenote", { reason: "to see why" });
  assert.equal(p.byOp("gradenote").at(-1).query.capture, sha);
  const because = word("state.undetermined", { reason: "@@" }).split("@@")[0].trim();
  const heads = main(p).querySelectorAll("section").map((s) => text(s.querySelector("h2")));
  const head = heads.find((h) => h === (said(NOT_GRADED) || word("mark.gap.unrated.means")));
  assert.ok(head, `the heading says the copy is not graded: ${JSON.stringify(heads)}`);
  assert.ok(!heads.some((h) => h.includes(because) || h.trim() === "?"), `no heading is the undetermined word with an empty reason, nor a bare question mark: ${JSON.stringify(heads)}`);
  assert.ok(!text(main(p)).includes(because), "nowhere does the page say 'because' with nothing after it");
});

test("R35a control: a copy graded B keeps the heading 'Why B?' (the grade note answers it)", async () => {
  const p = await open(at, {});
  await press(p, "gradenote", { reason: "to see why" });
  assert.ok(section(p, "screen.document.gradenote.head", { letter: "B" }), "Why B?");
});

test("R38 R135 a page captured by rendering says that its copy is the page's first load, in the statement its gaps hold; a plain capture and a render with other gaps draw none", async () => {
  const rendered = await open(at, { images: doc({ top: { render: { undetermined: ["another gap in the capture", word(COPY)] } } }) });
  const el = main(rendered).querySelector("[data-render-copy]");
  assert.ok(el, "the first-load statement is drawn");
  assert.equal(text(el).trim(), word(COPY).trim());
  const plain = await open(at, { images: doc({}) });
  assert.equal(main(plain).querySelector("[data-render-copy]"), null, "a plain capture draws none");
  const other = await open(at, { images: doc({ top: { render: { undetermined: ["another gap in the capture"] } } }) });
  assert.equal(main(other).querySelector("[data-render-copy]"), null, "a render whose gaps hold no such statement draws none");
});

test("R38 R136 a web capture that kept 40 pictures and read none draws their number and total size; one picture is told as one; a page with none draws no such sentence", async () => {
  const forty = await open(at, { images: doc({ capture: { supporting: { kept: 40, skipped: 0, total: 40, reasons: [], pictures_unread: { count: 40, bytes: 4194304 } } } }) });
  const el = main(forty).querySelector("[data-pictures-unread]");
  assert.ok(el, "the pictures are counted");
  assert.equal(el.getAttribute("data-pictures-unread"), "40");
  const full = said(PICTURES, { count: "40", size: mb(4194304) });
  assert.ok(full ? text(el).includes(full) : text(el).includes("40") && text(el).includes(mb(4194304)), "with their number and their total size");
  const one = await open(at, { images: doc({ capture: { supporting: { kept: 1, skipped: 0, total: 1, reasons: [], pictures_unread: { count: 1, bytes: 2048 } } } }) });
  const el1 = main(one).querySelector("[data-pictures-unread]");
  assert.equal(el1.getAttribute("data-pictures-unread"), "1");
  const single = said(PICTURE_ONE, { count: "1", size: word("size.kb", { n: "2" }) });
  assert.ok(single ? text(el1).includes(single) : text(el1).includes("1") && text(el1).includes(word("size.kb", { n: "2" })), "one picture is told as one");
  /* DEC-433 (B60): the sentence is drawn only when the size is known; a count with no size draws neither the sentence nor a figure */
  for (const pu of [{ count: 40 }, { count: 40, bytes: null }, { count: 1, bytes: "big" }]) {
    const nosize = await open(at, { images: doc({ capture: { supporting: { kept: 40, skipped: 0, total: 40, reasons: [], pictures_unread: pu } } }) });
    assert.equal(main(nosize).querySelector("[data-pictures-unread]"), null, "no size known: nothing drawn: " + JSON.stringify(pu));
  }
  for (const sup of [{ kept: 3, skipped: 0, total: 3, reasons: [] }, { kept: 3, skipped: 0, total: 3, reasons: [], pictures_unread: { count: 0, bytes: 0 } }, undefined]) {
    const none = await open(at, { images: doc(sup ? { capture: { supporting: sup } } : {}) });
    assert.equal(main(none).querySelector("[data-pictures-unread]"), null, "a capture with no unread picture draws neither the sentence nor the figures");
  }
});
