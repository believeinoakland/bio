/* screens-intake T51 fix round 3 (SCREENS-INTAKE #14; K4356, K4370): C9 R49, C14, C17 R2, C23 R4, C25 R54, C28 R7, C29, C35, C78 R47, C94,
 * FC-23 and N4 (R57 proposed), C81. A sentence is asserted by its key (R26), never by its English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, text, main, btn, fill, press, ok, refused, word, says, saysIn, DOCUMENT_STUB, MEMBER } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";

const NOT_HELD = ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } });
const open = (path, o = {}) => openPage(path, { ...o, plane: { heldat: NOT_HELD, heldcaptures: ok({ ok: true, held: [], truncated: false }), ...(o.plane || {}) }, screens: [...SCREENS, DOCUMENT_STUB] });
const ADDRESS = "https://www.acgov.org/board/minutes-2026-10.pdf";
const SHA = "a".repeat(64), USHA = "d".repeat(64);
const DOC = { capture: { sha256: SHA, bytes: 1200, encoding: "binary", content_type: "application/pdf" }, file: "snapshots/a.pdf", title: null };
const MINE = "PROJ-2026-0007", HOME = "PROJ-2026-0001", HOLDER = "INFO-2026-0042-held";
const md = (title, extra = []) => ["---", `title: ${JSON.stringify(title)}`, ...extra, "---", "", "## Summary", ""].join("\n");
const IMAGE = (r) => ok(r.query.id === MINE ? { "bundle.md": md("Pothole repairs") } : r.query.id === HOME ? { "bundle.md": md("Housing repairs") } : null);
const holder = (sha, document, project) => (req) => (req.query.sha256 === sha ? ok({ ok: true, held: true, copy: { sha256: sha, document, project, retrieved: "2026-10-01T10:00:00Z", actor: "member:x", grade: null, address: ADDRESS },
  versions: 1, truncated: false, changed: { state: "undetermined", basis: "x", as_of: null, earlier_differs: false } }) : NOT_HELD);
const CAPTURED = { allocid: ok({ ok: true, id: "INFO-2026-0001" }), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }) };
const anchors = (p, id) => Array.from(main(p).querySelectorAll("a")).filter((a) => String(a.getAttribute("href")).includes(id));
const hasKey = (k) => hasWord(k);

/* ---------- C9: R49 (capture R100, R101) ---------- */

/* The sentence for "filed here as well": its row is the design's to write (stand-in key `screen.capture.address.filedhere`, asked of BOB);
   until it exists the result says where the document is filed with `capture.filed.project`. */
const FILEDHERE = "screen.capture.address.filedhere";
const saysFiled = (p, home, mine) => hasKey(FILEDHERE) ? says(p, FILEDHERE, { project: home }) : says(p, "capture.filed.project", { project: mine });

test("R49 (C9) a capture from a project's page whose bytes are held under another project's document sends `captureseenin` for the subject project and says it is filed here as well", async () => {
  const p = await open(`/app/capture/address/${MINE}`, { plane: { ...CAPTURED, image: IMAGE, heldat: holder(SHA, HOLDER, HOME), captureseenin: ok({ ok: true, recorded: true, home: HOME }), acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.deepEqual(p.byOp("captureseenin").map((r) => r.body), [{ captureSha: SHA, project: MINE }], "the digest and the subject project, nothing else");
  assert.equal(p.byOp("allocid").length + p.byOp("promote").length, 0, "no second document is written");
  assert.equal(anchors(p, HOLDER).length, 1, "the held copy is shown once");
  assert.ok(saysFiled(p, "Housing repairs", "Pothole repairs"), "the result says it is filed here as well");
});

test("R49 (C9) control: a found document whose home is the subject project is recorded as seen nowhere; with no subject nothing is sent", async () => {
  const same = await open(`/app/capture/address/${MINE}`, { plane: { ...CAPTURED, image: IMAGE, heldat: holder(SHA, HOLDER, MINE), captureseenin: ok({ ok: true, recorded: true, home: MINE }), acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(same, { "ci-address": ADDRESS });
  await press(same, "acquire");
  assert.equal(same.byOp("captureseenin").length, 0);
  assert.equal(anchors(same, HOLDER).length, 1);
  const bare = await open("/app/capture/address", { plane: { ...CAPTURED, heldat: holder(SHA, HOLDER, HOME), captureseenin: ok({ ok: true, recorded: true, home: HOME }), acquire: ok({ ok: true, existed: true, document: DOC }) } });
  fill(bare, { "ci-address": ADDRESS });
  await press(bare, "acquire");
  assert.equal(bare.byOp("captureseenin").length, 0);
});

test("R49 (C9) control: a hidden home names the holder and files nothing (no `captureseenin`)", async () => {
  const p = await open(`/app/capture/address/${MINE}`, { plane: { ...CAPTURED, image: (r) => (r.query.id === "INFO-2026-0099-elsewhere" ? ok({ "bundle.md": md("The earlier minutes") }) : IMAGE(r)),
    acquire: ok({ ok: true, existed: true, document: DOC }),
    promote: ok({ ok: false, reason: "CAPTURE_HELD_BY_ANOTHER_BUNDLE", code: "CAPTURE_HELD_BY_ANOTHER_BUNDLE", holder: "INFO-2026-0099-elsewhere" }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.equal(p.byOp("captureseenin").length, 0);
  assert.ok(says(p, "refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE"));
  assert.equal(anchors(p, "INFO-2026-0099-elsewhere").length, 1);
});

test("R49 (C9) a `captureseenin` the plane refuses is drawn by its words and the held copy is still linked once", async () => {
  const p = await open(`/app/capture/address/${MINE}`, { plane: { ...CAPTURED, image: IMAGE, heldat: holder(SHA, HOLDER, HOME), acquire: ok({ ok: true, existed: true, document: DOC }),
    captureseenin: refused("PROJECT_ACT_NOT_A_PARTICIPANT", "You have not joined this project.", 403) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.ok(hasKey("refusal.PROJECT_ACT_NOT_A_PARTICIPANT") ? says(p, "refusal.PROJECT_ACT_NOT_A_PARTICIPANT") : text(p).includes("You have not joined this project."), "the refusal in words");
  assert.equal(anchors(p, HOLDER).length, 1);
  assert.ok(!saysFiled(p, "Housing repairs", "Pothole repairs"), "it is not said to be filed");
});

test("R49 (C9) an upload whose bytes are held under another project's document is filed in the subject project as well", async () => {
  const uploaded = { capture: { sha256: USHA, bytes: 14 }, receipt: { address: `upload:${USHA}`, via: "upload", retrieved: "2026-10-02T10:00:00Z" } };
  const p = await open(`/app/capture/file/${MINE}`, { plane: { ...CAPTURED, image: IMAGE, heldat: holder(USHA, HOLDER, HOME), captureseenin: ok({ ok: true, recorded: true, home: HOME }), captureupload: ok({ ok: true, existed: true, ...uploaded }) } });
  fill(p, { "ci-file": new File(["photo bytes"], "Seminary Ave.jpg", { type: "image/jpeg" }), "ci-how-made": true, "ci-where": "6012 Seminary Ave", "ci-what": "The pothole." });
  await press(p, "captureupload");
  assert.deepEqual(p.byOp("captureseenin").map((r) => r.body), [{ captureSha: USHA, project: MINE }]);
  assert.equal(p.byOp("captureupload")[0].query.for, undefined, "an existed upload takes no `for` (R29)");
  assert.equal(anchors(p, HOLDER).length, 1);
  assert.ok(saysFiled(p, "Housing repairs", "Pothole repairs"));
});

test("R49 (acquisition R96) a `CAPTURE_NOT_KEPT` acquire is drawn through its row's words, files nothing and links nothing", async () => {
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: refused("CAPTURE_NOT_KEPT", "The copy could not be kept whole, so nothing was filed.", 502) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.ok(hasKey("refusal.CAPTURE_NOT_KEPT") ? says(p, "refusal.CAPTURE_NOT_KEPT") : text(p).includes("The copy could not be kept whole, so nothing was filed."));
  assert.equal(p.byOp("promote").length + p.byOp("captureseenin").length, 0);
});
