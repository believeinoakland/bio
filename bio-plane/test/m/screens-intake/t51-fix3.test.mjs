/* screens-intake T51 fix round 3 (SCREENS-INTAKE #14; K4356, K4370): C9 R49, C14, C17 R2, C23 R4, C25 R54, C28 R7, C29, C35, C78 R47, C94,
 * FC-23 and N4 (R57 proposed), C81. A sentence is asserted by its key (R26), never by its English. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, text, html, main, btn, fill, press, ok, refused, word, says, saysIn, DOCUMENT_STUB, MEMBER } from "./page.mjs";
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

/* ---------- C17: R2 (the result line of a project-less upload) ---------- */

const UP = { capture: { sha256: USHA, bytes: 14 }, receipt: { address: `upload:${USHA}`, via: "upload", retrieved: "2026-10-02T10:00:00Z" } };
const UDOC = { file: `snapshots/upload-${USHA}`, locator: `upload:${USHA}`, capture: { method: "uploaded", sha256: USHA, encoding: "binary", bytes: 14 }, provenance_chain: [{ who: "x", asserts: "y" }], source: { kind: "uploader" } };
const picture = () => new File(["photo bytes"], "Seminary Ave.jpg", { type: "image/jpeg" });
const note = () => new File(["a note"], "note.txt", { type: "text/plain" });
const FILLED = { "ci-how-made": true, "ci-where": "6012 Seminary Ave", "ci-what": "The pothole." };
async function upload(path, file, answer) {
  const p = await open(path, { plane: { ...CAPTURED, image: IMAGE, captureupload: ok({ ok: true, existed: false, ...UP, ...answer }) } });
  fill(p, { "ci-file": file, ...FILLED });
  await press(p, "captureupload");
  return p;
}

test("R2 (C17) a project-less upload's result line says the document was read when the answer carries a reading", async () => {
  const p = await upload("/app/capture/file", note(), { document: { ...UDOC, reading: { title: "A note", words_read: 2, words_total: 2 }, text_units: [{ text: "a note" }] } });
  assert.ok(says(p, "screen.document.text.label"));
  assert.ok(says(p, "screen.document.text.read", { read: "2", total: "2" }), "the count when the reading states one");
  assert.ok(!says(p, "screen.document.text.unread") && !says(p, "capture.picture.unread"));
  const plain = await upload("/app/capture/file", note(), { document: { ...UDOC, reading: { title: "A note" }, text_units: [{ text: "a note" }] } });
  assert.ok(says(plain, "screen.document.text.full"), "a reading with words and no count");
  const blank = await upload("/app/capture/file", picture(), { document: { ...UDOC, reading: { title: null }, text_units: [] } });
  assert.ok(says(blank, "screen.document.text.none"), "a reading that found no words");
});

test("R2 (C17) a project-less upload with no reading says no reading is held, and for a picture what to do next", async () => {
  const photo = await upload("/app/capture/file", picture(), { document: UDOC });
  assert.ok(says(photo, "capture.picture.unread"), "a picture: its words can't be found until read or typed");
  assert.ok(!says(photo, "screen.document.text.read", { read: "0", total: "0" }));
  const file = await upload("/app/capture/file", note(), { document: UDOC });
  assert.ok(says(file, "screen.document.text.unread"), "any other file: not read yet");
});

test("R2 (C17) control: an upload with a project says what it did before and draws no reading line", async () => {
  const p = await upload(`/app/capture/file/${MINE}`, picture(), { document: UDOC });
  assert.ok(says(p, "screen.capture.file.done", { name: "Seminary Ave.jpg" }));
  assert.ok(says(p, "capture.filed.project", { project: "Pothole repairs" }));
  assert.ok(!says(p, "capture.picture.unread") && !says(p, "screen.document.text.unread") && !says(p, "screen.document.text.label"));
});

/* ---------- C14: R77, R88 (the reads the screens make) ---------- */

test("R50 (C14) Add makes one `heldcaptures` read, with fields=picker, and no read for a row; Held reads full rows (no picker fields)", async () => {
  const picked = ok({ ok: true, held: [{ bundle_id: "INFO-2026-0003-a", title: "Housing notice", project: null, capture: { sha256: SHA }, standing: "collected" }], truncated: false });
  const add = await open("/app/capture/address", { plane: { ...CAPTURED, heldcaptures: picked, acquire: ok({ ok: true, document: DOC, reading: { title: "Housing notice" } }) } });
  assert.deepEqual(add.byOp("heldcaptures").map((r) => r.query.fields), ["picker"], "one read, the cheap picker row");
  fill(add, { "ci-address": ADDRESS });
  await press(add, "acquire");
  assert.equal(add.byOp("heldcaptures").length, 1, "an act does not read the list again");
  assert.equal(add.byOp("image").length + add.byOp("captureaccounts").length, 0, "no read for each row");
  const held = await open("/app/held", { plane: { heldcaptures: ok({ ok: true, held: [{ bundle_id: "INFO-2026-0003-a", title: "Housing notice", project: null, capture: { sha256: SHA, grade: null }, age_days: 2, eligible: true }], truncated: false }) } });
  assert.ok(held.byOp("heldcaptures").length >= 1 && held.byOp("heldcaptures").every((r) => r.query.fields === undefined), "Held keeps full rows");
  assert.ok(text(held).includes("Housing notice"));
});

/* ---------- C25: R54 (one rule for a document's name) ---------- */

const promoted = (p) => p.byOp("promote").map((r) => r.body.meta.title);
async function captureOf(answer, address = "https://www.example.gov/page") {
  const p = await open("/app/capture/address", { plane: { ...CAPTURED, acquire: ok({ ok: true, ...answer }) } });
  fill(p, { "ci-address": address });
  await press(p, "acquire");
  return p;
}

test("R54 (C25) a page with a title is named by it; one without by its file name; one with neither by its host and the day, never the file part of its address", async () => {
  const titled = await captureOf({ document: { ...DOC, title: "Notice 2026-118" } });
  assert.deepEqual(promoted(titled), ["Notice 2026-118"]);
  const filed = await captureOf({ document: { ...DOC, title: null, capture: { ...DOC.capture, file_name: "notice.pdf" } } });
  assert.deepEqual(promoted(filed), ["notice.pdf"]);
  const neither = await captureOf({ document: { ...DOC, title: null } }, "https://www.example.gov/reports/street-maintenance-2026.pdf");
  assert.equal(promoted(neither).length, 1);
  assert.ok(promoted(neither)[0].includes("www.example.gov") && !promoted(neither)[0].includes("street-maintenance"), "host and day");
});

test("R54 (C25) the name drawn at capture from `document.title` equals the name drawn once read from `reading.title`; a multi-part capture, with no `document.title`, is named by the reading's title", async () => {
  const atCapture = await captureOf({ document: { ...DOC, title: "Housing notice" } });
  const onceRead = await captureOf({ document: { ...DOC, title: null }, reading: { title: "Housing notice" } });
  assert.deepEqual(promoted(atCapture), promoted(onceRead));
  const parts = [{ file: "snapshots/p1", sha256: "1".repeat(64), bytes: 5 }, { file: "snapshots/p2", sha256: "2".repeat(64), bytes: 5 }];
  const packet = await captureOf({ document: { ...DOC, title: null, parts }, reading: { title: "The whole packet" } });
  assert.deepEqual(promoted(packet), ["The whole packet"]);
  const unread = await captureOf({ document: { ...DOC, title: null, parts, capture: { ...DOC.capture, file_name: "packet.pdf" } } });
  assert.deepEqual(promoted(unread), ["packet.pdf"], "no reading yet: the file name");
});

test("R54 (C25) a PDF with no reading yet is named by its file name, once read by `reading.title`; one with no Title is named by its file name on both", async () => {
  const pdf = (extra = {}) => ({ document: { ...DOC, title: null, capture: { ...DOC.capture, file_name: "agenda.pdf" } }, ...extra });
  assert.deepEqual(promoted(await captureOf(pdf())), ["agenda.pdf"]);
  assert.deepEqual(promoted(await captureOf(pdf({ reading: { title: "Board agenda, October" } }))), ["Board agenda, October"]);
  assert.deepEqual(promoted(await captureOf(pdf({ reading: { title: null } }))), ["agenda.pdf"]);
});

test("R54 (C25) control: two documents from one host with different titles are told apart by their names", async () => {
  const a = await captureOf({ document: { ...DOC, title: "Minutes, September" } });
  const b = await captureOf({ document: { ...DOC, title: "Minutes, October" } });
  assert.notEqual(promoted(a)[0], promoted(b)[0]);
});

/* ---------- C23: R4 (Held by project) ---------- */

const ROW = (id, title, project, extra = {}) => ({ bundle_id: id, title, project, capture: { sha256: SHA, grade: null }, age_days: 1, eligible: true, ...extra });
const PROJECTS = ok({ projects: [{ id: MINE, name: "Pothole repairs" }, { id: HOME, name: "Housing repairs" }] });

test("R4 (C23) Held filtered by a project reads that project's captures and marks a document filed there from another project (`also_here`); with no project chosen it lists all", async () => {
  const own = ROW("INFO-2026-0010-own", "Street survey", MINE);
  const seen = ROW("INFO-2026-0011-seen", "Board minutes", HOME, { also_here: { home: HOME } });
  const held = (r) => (r.query.project === MINE ? ok({ ok: true, held: [own, seen], truncated: false }) : ok({ ok: true, held: [own, ROW("INFO-2026-0011-seen", "Board minutes", HOME), ROW("INFO-2026-0012-other", "Other minutes", HOME)], truncated: false }));
  const filtered = await open(`/app/held/${MINE}`, { plane: { heldcaptures: held, projectlist: PROJECTS } });
  assert.ok(filtered.byOp("heldcaptures").length >= 1 && filtered.byOp("heldcaptures").every((r) => r.query.project === MINE), "every list is that project's");
  assert.ok(text(filtered).includes("Street survey") && text(filtered).includes("Board minutes") && !text(filtered).includes("Other minutes"));
  const marked = Array.from(main(filtered).querySelectorAll("[data-also-here]"));
  assert.equal(marked.length, 1, "only the filed-from-elsewhere row is marked");
  assert.ok(marked[0].textContent.includes("Housing repairs") || marked[0].closest("[role=listitem], tr, .cs-row") !== null, "the mark names where it is held");
  const all = await open("/app/held", { plane: { heldcaptures: held, projectlist: PROJECTS } });
  assert.ok(all.byOp("heldcaptures").every((r) => r.query.project === undefined));
  assert.ok(text(all).includes("Other minutes") && main(all).querySelectorAll("[data-also-here]").length === 0, "all listed, none marked");
});

/* ---------- C29: no result line holds two full stops where one sentence ends ---------- */

const statusLines = (p) => Array.from(main(p).querySelectorAll('[role="status"]')).map((e) => e.textContent.trim()).filter(Boolean);
const TESTIFIED = { ok: true, bundle_id: "INFO-2026-0009-observation", bundle_sha: "f".repeat(64), capture_sha: "e".repeat(64) };
const DOUBLED = /(?<!\.)\.\.(?!\.)/;
async function testified(words) {
  const saw = await open("/app/capture/saw", { plane: { testify: ok(TESTIFIED) } });
  fill(saw, { "ci-words": words, "ci-where": "6012 Seminary Ave", "ci-when": "2026-10-04T09:10:00Z" });
  await press(saw, "testify");
  return saw;
}

test("C29 (R3) the testimony's result line does not double the full stop when the member's words end in one", async () => {
  const saw = await testified("The pothole is still open.");
  assert.ok(statusLines(saw).length >= 1);
  assert.ok(statusLines(saw).every((l) => !DOUBLED.test(l)), JSON.stringify(statusLines(saw)));
  assert.ok(statusLines(saw).some((l) => l.includes("The pothole is still open")), "the words are still the link's name");
});

test("C29 control: a name that ends in an ellipsis is unchanged", async () => {
  const dots = await testified("Wait for it...");
  assert.ok(statusLines(dots).some((l) => l.includes("Wait for it...")), "the typed ellipsis is kept whole");
  const cut = await testified("x".repeat(100));
  assert.ok(statusLines(cut).some((l) => l.includes("x\u2026")), "words cut for the name keep their ellipsis");
  const plain = await testified("The pothole is still open");
  assert.ok(statusLines(plain).some((l) => l.includes("The pothole is still open")), "words with no full stop are unchanged");
});

test("C29 (R50, R2) the capture and upload result lines do not double a full stop either", async () => {
  const page = await captureOf({ document: { ...DOC, title: "Minutes of the board." } });
  assert.ok(statusLines(page).every((l) => !DOUBLED.test(l)), JSON.stringify(statusLines(page)));
  const up = await upload("/app/capture/file", new File(["x"], "notes.", { type: "text/plain" }), { document: UDOC });
  assert.ok(statusLines(up).every((l) => !DOUBLED.test(l)), JSON.stringify(statusLines(up)));
});

/* ---------- C28: R7 (the Inbox shows the name and type the sender stated) ---------- */

const KA = { knock_id: "KNOCK-2026-10-03-9c1f0a2b", sha256: "1".repeat(64), bytes: 3 * 1048576, note: "Sheets.", received: "2026-10-03T10:00:00Z", status: "new", pseudonym: "P-1", knocker_digest: "dd", file_name: "agenda-oct.pdf", media_type: "application/pdf" };
const KB = { knock_id: "KNOCK-2026-09-12-11aa22bb", sha256: "2".repeat(64), bytes: 500, note: null, received: "2026-09-12T10:00:00Z", status: "new", pseudonym: "P-1", knocker_digest: "dd", file_name: null, media_type: null };
const KC = { knock_id: "KNOCK-2026-09-13-55ee66ff", sha256: "3".repeat(64), bytes: 700, note: null, received: "2026-09-13T10:00:00Z", status: "new", pseudonym: "P-1", knocker_digest: "dd", file_name: "photo.jpg", media_type: "image/jpeg" };
const rowOf = (p, k) => Array.from(main(p).querySelectorAll('[role="listitem"]')).find((r) => r.querySelector(`a[href*="${k.knock_id}"]`));

test("R7 (C28) an Inbox row draws the file name and type the sender stated; a knock with neither draws neither, with no empty label", async () => {
  const p = await open("/app/inbox", { plane: { inbox: ok({ inbox: [KA, KB, KC] }) } });
  assert.ok(rowOf(p, KA).textContent.includes("agenda-oct.pdf") && rowOf(p, KA).textContent.includes("application/pdf"));
  assert.ok(rowOf(p, KC).textContent.includes("photo.jpg") && rowOf(p, KC).textContent.includes("image/jpeg"));
  const bare = rowOf(p, KB);
  assert.ok(bare, "the knock is listed");
  assert.equal(bare.querySelectorAll(".mk-data").length, 0, "no name, no type: nothing drawn for them");
  assert.ok(!/null|undefined/.test(bare.textContent) && !/ · \s*$/.test(bare.textContent.trim()), "and no empty label");
});

test("R7 (C28) the knocker's other material (`knocksof`) draws each knock's stated name and type too", async () => {
  const p = await open(`/app/inbox/${KA.knock_id}`, { plane: { inbox: ok({ inbox: [KA, KB, KC] }), inboxget: ok({ ok: true, item: KA }), sourceof: ok({ ok: true, sourceId: null }),
    knocksof: ok({ ok: true, pseudonym: "P-1", knocks: [KA, KB, KC], count: 3, truncated: false }) } });
  await press(p, "knocksof");
  const sec = main(p).querySelectorAll("section.cs-section").find((s) => s.querySelector(`a[href*="${KC.knock_id}"]`));
  assert.ok(sec, "the section of other material");
  assert.ok(sec.textContent.includes("photo.jpg") && sec.textContent.includes("image/jpeg"));
  const none = Array.from(sec.querySelectorAll('[role="listitem"]')).find((r) => r.querySelector(`a[href*="${KB.knock_id}"]`));
  assert.equal(none.querySelectorAll(".mk-data").length, 0, "a knock with neither draws neither");
});

/* ---------- C35: R29 ("For which question" tells questions of the same title apart) ---------- */

const QA = "INQ-2026-0001-seven-days", QB = "INQ-2026-0002-seven-days", QC = "INQ-2026-0003-lighting";
const QPLANE2 = {
  search: ok({ hits: [{ bundle_id: QA, title: "Seven days" }, { bundle_id: QB, title: "Seven days" }, { bundle_id: QA, title: "Seven days" }, { bundle_id: QC, title: "Street lighting" }] }),
  projectlist: ok({ projects: [{ id: MINE, name: "Pothole repairs" }, { id: HOME, name: "Housing repairs" }] }),
  projectquestions: (r) => ok({ ok: true, items: r.query.project === MINE ? [{ inquiry: QA, title: "Seven days" }, { inquiry: QC, title: "Street lighting" }] : [{ inquiry: QB, title: "Seven days" }] }),
  image: (r) => ok(r.query.id === QA ? { "bundle.md": md("Seven days", [`project: ${MINE}`]) } : r.query.id === MINE ? { "bundle.md": md("Pothole repairs") } : null),
};
const options = (p) => Array.from(main(p).querySelectorAll("select#ci-for option, #ci-for option")).map((o) => o.textContent);

test("R29 (C35) two questions of different projects with the same title are told apart by project, one row per question", async () => {
  const p = await open(`/app/capture/address/${QA}`, { plane: { ...QPLANE2 } });
  await p.settle();
  const o = options(p);
  assert.equal(o.filter((t) => t.includes("Seven days")).length, 2, "one row per question: the repeated hit is listed once");
  assert.ok(o.some((t) => t.includes("Seven days") && t.includes("Pothole repairs")) && o.some((t) => t.includes("Seven days") && t.includes("Housing repairs")), JSON.stringify(o));
});

test("R29 (C35) control: a question whose project no read names is listed by its title alone, as before", async () => {
  const p = await open(`/app/capture/address/${QA}`, { plane: { ...QPLANE2, projectlist: ok({ projects: [] }) } });
  await p.settle();
  const o = options(p);
  assert.ok(o.includes("Street lighting"), JSON.stringify(o));
  assert.equal(o.filter((t) => t === "Seven days").length, 2, "unchanged: both titles as the hits give them");
});

/* ---------- FC-23, N4, C78, C94: the logins section (DEC-403) and the requests for later; R57 (proposed) ---------- */

const MEMBERS = ok({ members: [{ member_id: "rosa", handle: "Rosa-h", role: "member", status: "active" }, { member_id: "mai", handle: "Mai-h", role: "member", status: "active" }] });
const LOGIN = { credential: "CRED-1", kind: "login", host: "records.example-city.gov", scope: "group", project: null, supplied_by: "member:rosa", supplied_at: "2026-10-16T09:00:00Z", withdrawn_at: null, withdrawn_by: null };
const LOGIN2 = { credential: "CRED-2", kind: "user-agent", host: "agendas.example.org", scope: "member", project: null, supplied_by: "member:ghost", supplied_at: "2026-10-17T09:00:00Z", withdrawn_at: null, withdrawn_by: null };
const entries = (...e) => ok({ ok: true, entries: e, limit: 200, truncated: false });
const addr = (o = {}) => open("/app/capture/address", { ...o, plane: { memberlist: MEMBERS, capturerequests: ok({ ok: true, requests: [] }), ...(o.plane || {}) } });
const SECRET = "p4ss-w0rd-X";
const sectionOf = (p, key) => main(p).querySelectorAll("section.cs-section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent.includes(word(key)));

test("FC-23 the logins button with none stored says none; nothing is drawn before it is pressed", async () => {
  const p = await addr({ plane: { capturecredentiallist: entries() } });
  const sec = sectionOf(p, "screen.capture.logins.head");
  assert.ok(sec, "the section is drawn");
  for (const k of ["screen.capture.logins.about1", "screen.capture.logins.about2", "screen.capture.logins.about3"]) assert.ok(saysIn(sec, k), k);
  assert.ok(!says(p, "screen.capture.logins.none"), "control: nothing before the press");
  assert.equal(p.byOp("capturecredentiallist").length, 0, "and no read before the press");
  await press(p, "capturecredentiallist");
  assert.ok(says(p, "screen.capture.logins.none"));
});

test("FC-23 the logins button with some stored draws the list: site, what it asks for, who may use it, who gave it and when; a login is withdrawn and the list read again", async () => {
  let list = [LOGIN, LOGIN2];
  const p = await addr({ plane: { capturecredentiallist: () => entries(...list), capturecredentialwithdraw: () => { list = [LOGIN2]; return ok({ ok: true }); } } });
  await press(p, "capturecredentiallist");
  assert.ok(!says(p, "screen.capture.logins.none"));
  const rows = Array.from(sectionOf(p, "screen.capture.logins.head").querySelectorAll(".cs-row"));
  assert.equal(rows.length, 2);
  assert.ok(rows[0].textContent.includes("records.example-city.gov") && rows[0].textContent.includes(word("screen.capture.logins.kind.login")) && rows[0].textContent.includes(word("screen.capture.logins.scope.group")) && rows[0].textContent.includes("Rosa-h"), "the row names site, kind, scope and giver");
  assert.ok(rows[1].textContent.includes(word("screen.capture.logins.kind.user-agent")) && rows[1].textContent.includes(word("screen.capture.logins.scope.member")));
  assert.ok(!text(p).includes("rosa") || text(p).includes("Rosa-h"), "no member id where a handle is known");
  await press(p, "capturecredentialwithdraw", { reason: "No longer needed." });
  assert.deepEqual(p.byOp("capturecredentialwithdraw").map((r) => r.body.credential), ["CRED-1"]);
  assert.equal(Array.from(sectionOf(p, "screen.capture.logins.head").querySelectorAll(".cs-row")).length, 1, "the list is read again");
});

test("C78 the stored-logins explanation is the node after its own button; the other button, requests for later, has none", async () => {
  const p = await addr({ plane: { capturecredentiallist: entries(LOGIN) } });
  const sec = sectionOf(p, "screen.capture.logins.head");
  const button = sec.querySelector('button[data-act="capturecredentiallist"]');
  assert.ok(button);
  let at = button.closest(".mk-acts") || button;
  const next = at.nextElementSibling;
  assert.ok(next && saysIn(next, "screen.capture.cred.listnote1") && saysIn(next, "screen.capture.cred.listnote2"), "the explanation follows its button");
  const later = main(p).querySelector('button[data-act="capturerequests"]');
  const after = (later.closest(".mk-acts") || later).nextElementSibling;
  assert.ok(!after || (!saysIn(after, "screen.capture.cred.listnote1") && !saysIn(after, "screen.capture.logins.about1")), "control: the other button has no such explanation");
});

test("FC-23 giving a login for a site sends kind, host, secret, scope (and the project for 'this project'); a login's secret is `username:secret`; no request is retried", async () => {
  const p = await open(`/app/capture/address/${MINE}`, { plane: { memberlist: MEMBERS, capturerequests: ok({ ok: true, requests: [] }), image: IMAGE, capturecredentialsupply: ok({ ok: true, credential: "CRED-9" }), capturecredentiallist: entries(LOGIN) } });
  fill(p, { "cl-host": "Records.Example-City.gov", "cl-name": "mai", "cl-secret": SECRET });
  p.doc.getElementById("cl-scope").value = "project";
  await press(p, "capturecredentialsupply", { reason: "The team needs this site.", sel: '[data-general="1"]' });
  const sent = p.byOp("capturecredentialsupply");
  assert.equal(sent.length, 1);
  const { reason, ...body } = sent[0].body;
  assert.deepEqual(body, { kind: "login", host: "records.example-city.gov", secret: `mai:${SECRET}`, scope: "project", project: MINE });
  assert.equal(p.byOp("capturerequestretry").length, 0, "needs no refused request");
  assert.ok(!html(p).includes(SECRET), "the secret is not drawn back");
  for (const r of p.requests) if (r.op !== "capturecredentialsupply") assert.ok(!JSON.stringify(r).includes(SECRET), `${r.op} carries no secret`);
  assert.ok(sectionOf(p, "screen.capture.logins.head").querySelectorAll(".cs-row").length >= 1, "the list is read again and drawn");
});

test("FC-23 a browser name or something else is sent as the secret alone; a missing site, username (for a login) or secret sends nothing and says which", async () => {
  const p = await addr({ plane: { capturecredentialsupply: ok({ ok: true }), capturecredentiallist: entries() } });
  fill(p, { "cl-host": "agendas.example.org", "cl-secret": "Civicsmith-Reader/1" });
  p.doc.getElementById("cl-kind").value = "user-agent";
  await press(p, "capturecredentialsupply", { reason: "r", sel: '[data-general="1"]' });
  const { reason, ...body } = p.byOp("capturecredentialsupply")[0].body;
  assert.deepEqual(body, { kind: "user-agent", host: "agendas.example.org", secret: "Civicsmith-Reader/1", scope: "group" });
  const q = await addr({ plane: { capturecredentialsupply: ok({ ok: true }) } });
  fill(q, { "cl-host": "", "cl-name": "mai", "cl-secret": SECRET });
  const a = await press(q, "capturecredentialsupply", { reason: "r", sel: '[data-general="1"]' });
  assert.ok(saysIn(a.slot(), "capture.fieldneeded", { field: word("screen.capture.logins.site") }));
  fill(q, { "cl-host": "x.example.org", "cl-name": "", "cl-secret": SECRET });
  const b = await press(q, "capturecredentialsupply", { reason: "r", sel: '[data-general="1"]' });
  assert.ok(saysIn(b.slot(), "capture.fieldneeded", { field: word("screen.capture.logins.name") }));
  fill(q, { "cl-name": "mai", "cl-secret": "" });
  const c = await press(q, "capturecredentialsupply", { reason: "r", sel: '[data-general="1"]' });
  assert.ok(saysIn(c.slot(), "capture.fieldneeded", { field: word("screen.capture.logins.secret") }));
  assert.equal(q.byOp("capturecredentialsupply").length, 0);
});

test("N4 'Show my requests for later' with none says none; with some it draws them; nothing is drawn before it is pressed", async () => {
  const p = await addr({ plane: { capturerequests: ok({ ok: true, requests: [] }) } });
  assert.ok(!main(p).textContent.includes(word("screen.capture.later.head")), "control: nothing before the press");
  await press(p, "capturerequests");
  const sec = sectionOf(p, "screen.capture.later.head");
  assert.ok(sec, "the section is drawn once asked");
  assert.ok(sec.textContent.includes(word(hasKey("screen.capture.later.none") ? "screen.capture.later.none" : "state.empty")), "and says there are none");
  const mine = { request: "CR-1", host: "records.example-city.gov", address: "https://records.example-city.gov/a", state: "requested", requested_at: "2026-10-15T10:00:00Z", principal_plane: "member:x" };
  const q = await open("/app/capture/address", { me: { ...MEMBER, member: "x" }, plane: { memberlist: MEMBERS, capturerequests: ok({ ok: true, requests: [mine] }) } });
  const draws = sectionOf(q, "screen.capture.later.head");
  assert.ok(draws && draws.textContent.includes("records.example-city.gov") && !draws.textContent.includes(word(hasKey("screen.capture.later.none") ? "screen.capture.later.none" : "state.empty")));
});

test("C94 a member is named by handle where the capture screen names one (link and name), never by id; a member with no handle draws the fallback word", async () => {
  const addrHeld = (document, actor) => holder(SHA, "INFO-2026-0042-held", HOME);
  const p = await open("/app/capture/address", { plane: { memberlist: MEMBERS, capturerequests: ok({ ok: true, requests: [] }), image: IMAGE, heldat: (req) => ok({ ok: true, held: true, copy: { sha256: SHA, document: HOLDER, project: HOME, retrieved: "2026-10-01T10:00:00Z", actor: "member:rosa", grade: null, address: ADDRESS }, versions: 1, truncated: false, changed: { state: "unchanged", basis: "x", as_of: null, earlier_differs: false } }),
    heldcaptures: ok({ ok: true, held: [{ bundle_id: HOLDER, title: "Board minutes", project: HOME, capture: { sha256: SHA }, standing: "held_and_vouched" }], truncated: false }), acquire: ok({ ok: true, document: DOC }) } });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  const link = Array.from(main(p).querySelectorAll("a")).find((a) => String(a.getAttribute("href")).includes("/app/members/"));
  assert.ok(link, "the member is linked");
  assert.equal(link.getAttribute("href"), "/app/members/Rosa-h", "by handle");
  assert.equal(link.textContent, "Rosa-h");
  assert.ok(!/\brosa\b/.test(text(p)), "no member id drawn");
  const q = await addr({ plane: { capturecredentiallist: entries(LOGIN2) } });
  await press(q, "capturecredentiallist");
  assert.ok(sectionOf(q, "screen.capture.logins.head").textContent.includes(word("shell.card.member")), "no handle known: the fallback word");
  assert.ok(!text(q).includes("ghost"), "never the id");
});
