/* screens-intake T51 fix round 4 (SCREENS-INTAKE #15; K4429): C9 R49 (the pre-flight's path), FC-23 (the login control's words), C14 (Held's read
 * set: the picker for the page, the full fields for the rows it draws; capture R102), C25 R54 (a PDF named by its title), and the rows
 * DEC-412 wrote (`filedhere`, `later.none`, `unread.next`). A sentence is asserted by its key (R26), never by its English. Every test
 * enters by pressing the act (or opening the page), never by calling a `done` function. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, text, html, main, btn, fill, press, ok, refused, word, says, saysIn, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS, SCREEN_KEYS } from "../../../src/screens-intake/index.mjs";

const ADDRESS = "https://www.nps.gov/yose/index.htm";
const SHA = "a".repeat(64);
const MINE = "PROJ-2026-0007", HOME = "PROJ-2026-0001", HOLDER = "INFO-2026-0083-yosemite";
const md = (title) => ["---", `title: ${JSON.stringify(title)}`, "---", "", "## Summary", ""].join("\n");
const IMAGE = (r) => ok(r.query.id === MINE ? { "bundle.md": md("Pothole repairs") } : r.query.id === HOME ? { "bundle.md": md("Housing repairs") } : null);
const CHANGED = (state) => ({ state, basis: "x", as_of: "2026-10-01T10:00:00Z", earlier_differs: false });
const anchors = (p, id) => Array.from(main(p).querySelectorAll("a")).filter((a) => String(a.getAttribute("href")).includes(id));

/* The plane as capture R96, R100, R101 and R77 state it, for the case the walker met: the address is held under HOME's document; `heldat`
   answers it for the address (the press's pre-flight, `check: true`) and for its digest alike; `captureseenin` records the reference once;
   `heldcaptures` for a project lists what is held there and what was seen there (`also_here`). A viewer who may not see the home reads as
   not held (R96). */
function world({ state = "unchanged", project = HOME, sees = true, refuseSeen = null } = {}) {
  const seen = [];
  const copy = { sha256: SHA, document: HOLDER, project, retrieved: "2026-10-01T10:00:00Z", actor: "member:x", grade: null, address: ADDRESS };
  const held = (req) => (!sees || (req.query.address !== ADDRESS && req.query.sha256 !== SHA) ? ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: CHANGED("undetermined") })
    : ok({ ok: true, held: true, copy, versions: 1, truncated: false, changed: CHANGED(state) }));
  return {
    seen,
    plane: {
      heldat: held,
      image: IMAGE,
      captureseenin: (req) => { if (refuseSeen) return refuseSeen; seen.push(req.body); return ok({ ok: true, recorded: true, home: project }); },
      heldcaptures: (req) => ok({ ok: true, truncated: false, held: req.query.project === MINE && seen.length
        ? [{ bundle_id: HOLDER, title: "Yosemite National Park", project, also_here: { home: project }, capture: { sha256: SHA }, standing: "held_and_vouched" }] : [] }),
      acquire: ok({ ok: true, existed: true, document: { capture: { sha256: SHA, bytes: 9000, encoding: "utf-8" }, file: "snapshots/a.htm", title: null } }),
      allocid: ok({ ok: true, id: "INFO-2026-0099" }), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }),
    },
  };
}
const open = (path, o = {}) => openPage(path, { ...o, plane: { projectlist: ok({ projects: [] }), ...(o.plane || {}) }, screens: [...SCREENS, DOCUMENT_STUB] });
const pressCapture = async (p) => { fill(p, { "ci-address": ADDRESS }); await press(p, "acquire"); };

/* ---------- C9: R49, the pre-flight's path ---------- */

test("R49 (C9) pressing Capture on an address already held under another project, from a project's page, sends no acquire, files the document in this project and says so", async () => {
  const w = world();
  const p = await open(`/app/capture/address/${MINE}`, { plane: w.plane });
  await pressCapture(p);
  assert.equal(p.byOp("acquire").length, 0, "the pre-flight found it held: nothing is fetched");
  assert.equal(p.byOp("heldat").length, 1, "the press asked, once");
  assert.deepEqual([p.byOp("heldat")[0].query.address, p.byOp("heldat")[0].query.check], [ADDRESS, "true"]);
  assert.deepEqual(p.byOp("captureseenin").map((r) => r.body), [{ captureSha: SHA, project: MINE }], "the digest and the page's project, nothing else");
  assert.equal(p.byOp("allocid").length + p.byOp("promote").length, 0, "no second document is written");
  const list = (await w.plane.heldcaptures({ query: { project: MINE } })).json.result;
  assert.deepEqual(list.held.map((r) => [r.bundle_id, r.also_here]), [[HOLDER, { home: HOME }]], "the project's list now holds it, as seen from its home");
  assert.ok(says(p, "screen.capture.address.filedhere", { project: "Housing repairs" }), "the draw says it is filed here as well and where it stays held");
  assert.equal(anchors(p, HOLDER).length, 1, "the held copy is linked once");
});

test("R49 (C9) the compared copy of an undetermined look is filed here too; a changed site waits for the member's choice and files nothing at the press", async () => {
  const u = world({ state: "undetermined" });
  const pu = await open(`/app/capture/address/${MINE}`, { plane: u.plane });
  await pressCapture(pu);
  assert.deepEqual(pu.byOp("captureseenin").map((r) => r.body), [{ captureSha: SHA, project: MINE }]);
  assert.ok(says(pu, "screen.capture.address.filedhere", { project: "Housing repairs" }));
  const c = world({ state: "changed" });
  const pc = await open(`/app/capture/address/${MINE}`, { plane: c.plane });
  await pressCapture(pc);
  assert.equal(pc.byOp("captureseenin").length, 0, "the member has not chosen: nothing is filed");
  assert.equal(pc.byOp("acquire").length, 0);
  assert.ok(btn(pc, "acquire", '[data-again="1"]'), "and the two acts are offered");
});

test("R49 (C9) control: a home that is the page's own project, and a page with no project, file nothing and send no captureseenin", async () => {
  const same = world({ project: MINE });
  const ps = await open(`/app/capture/address/${MINE}`, { plane: same.plane });
  await pressCapture(ps);
  assert.equal(ps.byOp("captureseenin").length, 0);
  assert.equal(ps.byOp("acquire").length, 0);
  assert.equal(anchors(ps, HOLDER).length, 1, "it is still named and linked");
  assert.ok(!says(ps, "screen.capture.address.filedhere", { project: "Pothole repairs" }));
  const bare = world();
  const pb = await open("/app/capture/address", { plane: bare.plane });
  await pressCapture(pb);
  assert.equal(pb.byOp("captureseenin").length, 0);
});

test("R49 (C9) control: a viewer who cannot see the home reads the address as not held, so the capture goes on and the holder sentence is drawn; nothing is filed", async () => {
  const w = world({ sees: false });
  const p = await open(`/app/capture/address/${MINE}`, { plane: { ...w.plane,
    promote: ok({ ok: false, reason: "CAPTURE_HELD_BY_ANOTHER_BUNDLE", code: "CAPTURE_HELD_BY_ANOTHER_BUNDLE", holder: "INFO-2026-0099-elsewhere" }),
    acquire: ok({ ok: true, existed: true, document: { capture: { sha256: SHA, bytes: 9000 }, file: "snapshots/a.htm", title: null } }) } });
  await pressCapture(p);
  assert.equal(p.byOp("acquire").length, 1, "not held for this viewer: the capture goes on");
  assert.equal(p.byOp("captureseenin").length, 0);
  assert.ok(says(p, "refusal.CAPTURE_HELD_BY_ANOTHER_BUNDLE"));
});

test("R49 (C9) a captureseenin the plane refuses at the press is drawn by its words and the compared copy is still shown once, not said to be filed", async () => {
  const w = world({ refuseSeen: refused("CAPTURE_NOT_HELD", "That document is not held.", 404) });
  const p = await open(`/app/capture/address/${MINE}`, { plane: w.plane });
  await pressCapture(p);
  assert.equal(p.byOp("captureseenin").length, 1);
  assert.ok(says(p, "refusal.CAPTURE_NOT_HELD"), "the refusal in the row's words");
  assert.equal(anchors(p, HOLDER).length, 1);
  assert.ok(!says(p, "screen.capture.address.filedhere", { project: "Housing repairs" }));
});

/* ---------- FC-23: the login control's words ---------- */

test("FC-23 the 'Store this login' control carries its words, inside the folded 'Give a login for a site' disclosure", async () => {
  const p = await open("/app/capture/address", { plane: { heldcaptures: ok({ ok: true, held: [] }), capturerequests: ok({ ok: true, requests: [] }) } });
  const b = btn(p, "capturecredentialsupply", '[data-general="1"]');
  assert.ok(b, "the control is drawn");
  assert.equal(b.textContent.trim().startsWith(word("screen.capture.logins.store")), true, "its text is the key's words");
  const d = b.closest("details");
  assert.ok(d, "inside the fold: a closed fold has no rendered text for a reader of `innerText` (the walker's empty text), not a missing word");
  assert.ok(d.querySelector("summary").textContent.includes(word("screen.capture.logins.give")));
});

/* ---------- the rows DEC-412 wrote ---------- */

test("DEC-412 the screen lists the keys it draws: filedhere and later.none (capture), whose rows exist", async () => {
  for (const k of ["screen.capture.address.filedhere", "screen.capture.later.none", "screen.document.text.unread.next"]) assert.ok(SCREEN_KEYS.capture.includes(k), k);
});

test("N4 'Show my requests for later' with none says screen.capture.later.none, by its key", async () => {
  const p = await open("/app/capture/address", { plane: { heldcaptures: ok({ ok: true, held: [] }), capturerequests: ok({ ok: true, requests: [] }) } });
  await press(p, "capturerequests");
  assert.ok(says(p, "screen.capture.later.none"));
  assert.ok(!says(p, "state.empty"));
});

test("R2 (C17) an unread upload that is no picture says what to do next, by screen.document.text.unread.next", async () => {
  const SHAU = "d".repeat(64);
  const p = await open("/app/capture/file", { plane: { heldcaptures: ok({ ok: true, held: [] }), allocid: ok({ ok: true, id: "INFO-2026-0003" }), promote: (req) => ok({ ok: true, bundleId: req.body.bundleId }),
    captureupload: ok({ ok: true, existed: false, capture: { sha256: SHAU, bytes: 14 }, receipt: { address: `upload:${SHAU}`, via: "upload", retrieved: "2026-10-02T10:00:00Z" },
      document: { file: `snapshots/upload-${SHAU}`, locator: `upload:${SHAU}`, capture: { method: "uploaded", sha256: SHAU, encoding: "binary", bytes: 14 } } }) } });
  fill(p, { "ci-file": new File(["a note"], "note.bin", { type: "application/octet-stream" }), "ci-how-made": true, "ci-where": "Here", "ci-what": "A note." });
  await press(p, "captureupload");
  assert.ok(says(p, "screen.document.text.unread"));
  assert.ok(says(p, "screen.document.text.unread.next"));
});

/* ---------- C25: R54, one name for a PDF ---------- */

/* acquisition R98 (pdf-reader R40): the IRS Form 1040-ES answers `document.title` "2026 Form 1040-ES" (the title its Info dictionary
   holds; checked on the real file, 331,490 bytes, `pdfTitle` read it in 11 ms) and the file name the source gives, `f1040es.pdf`. */
const IRS = "https://www.irs.gov/pub/irs-pdf/f1040es.pdf";
const pdfAnswer = (title) => ok({ ok: true, existed: false, document: { capture: { sha256: "b".repeat(64), bytes: 331490, encoding: "binary", content_type: "application/pdf", file_name: "f1040es.pdf" },
  file: "snapshots/b.pdf", title } });

async function capturePdf(title) {
  const filed = [];
  const plane = { projectlist: ok({ projects: [] }), heldat: ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: CHANGED("undetermined") }),
    acquire: pdfAnswer(title), allocid: ok({ ok: true, id: "INFO-2026-0100" }),
    promote: (req) => { filed.push(req.body); return ok({ ok: true, bundleId: req.body.bundleId }); },
    heldcaptures: (req) => ok({ ok: true, truncated: false, held: req.query.state === "set_aside" ? [] : filed.map((b) => ({ bundle_id: b.bundleId, title: b.meta.title, project: null, age_days: 0, eligible: true, source: { address: IRS }, capture: { sha256: "b".repeat(64) },
      captured_for: { questions: [], withheld: null } })) }) };
  const add = await open("/app/capture/address", { plane });
  fill(add, { "ci-address": IRS });
  await press(add, "acquire");
  const held = await open("/app/held", { plane });
  return { add, held, filed };
}

test("R54 (C25) a PDF whose answer carries its title is named by it on the Add result, in the filed bundle and on Held", async () => {
  const { add, held, filed } = await capturePdf("2026 Form 1040-ES");
  assert.equal(filed.length, 1);
  assert.equal(filed[0].meta.title, "2026 Form 1040-ES", "the bundle is titled by the PDF's own title");
  assert.ok(text(add).includes("2026 Form 1040-ES"), "the Add result names it");
  assert.ok(!text(add).includes("f1040es.pdf"), "and not by the file part of its address");
  assert.ok(main(held).querySelector(`#pick-held-${filed[0].bundleId}`).closest("tr, .cs-r, li, div").textContent.includes("2026 Form 1040-ES"), "Held names it the same");
});

test("R54 (C25) control: a PDF with no title is named by the file name the source gave, on the Add result and on Held alike", async () => {
  const { add, held, filed } = await capturePdf(null);
  assert.equal(filed[0].meta.title, "f1040es.pdf");
  assert.ok(text(add).includes("f1040es.pdf"));
  assert.ok(main(held).querySelector(`#pick-held-${filed[0].bundleId}`).closest("tr, .cs-r, li, div").textContent.includes("f1040es.pdf"));
});

/* ---------- C14: Held's read set (capture R102) ---------- */

const pickerRow = (i) => ({ bundle_id: `INFO-2026-${String(1000 + i)}`, title: `Document ${i}`, project: null, source: { address: `https://example.gov/${i}` }, collected_since: "2026-10-01T10:00:00Z",
  capture: { sha256: String(i % 10).repeat(64) }, actor: "member:x", standing: "collected", whole: true });
const fullRow = (i) => ({ ...pickerRow(i), age_days: i % 5, eligible: true, captured_for: { questions: [], withheld: null }, whole: true });

/* capture R77, R88, R102 as the op answers: `fields=picker` the cheap rows, `bundle_ids` the listed documents' full rows in the list's order,
   `state=set_aside` the set-aside list */
function heldPlane(n, extra = {}) {
  const rows = Array.from({ length: n }, (_, i) => i);
  return { projectlist: ok({ projects: [] }), heldcaptures: (req) => {
    const q = req.query;
    if (q.state === "set_aside") return ok({ ok: true, held: [], truncated: false });
    /* fix round 10, cause 33: a page of `limit` rows from `after`, with `truncated` and the `next` cursor that continues it, as capture R77 pages */
    // fixtures-contract: capture held-page
    const from = q.after ? Number(q.after) : 0, page = rows.slice(from, from + (Number(q.limit) || 200)), more = from + page.length < n;
    if (q.bundle_ids) { const want = String(q.bundle_ids).split(","); return ok({ ok: true, truncated: false, held: want.map((id) => fullRow(Number(id.slice(-4)) - 1000)) }); }
    return ok({ ok: true, truncated: more, next: more ? String(from + page.length) : null, held: page.map(q.fields === "picker" ? pickerRow : fullRow) });
  }, ...extra };
}
const reads = (p) => p.byOp("heldcaptures").map(({ query: { op, ...q } }) => q);

test("R4 (C14) Held reads the page as picker rows, then the full fields for the rows it draws by bundle_ids (at most 50), and nothing else of heldcaptures", async () => {
  const p = await openPage("/app/held", { plane: heldPlane(60), screens: [...SCREENS, DOCUMENT_STUB] });
  const q = reads(p);
  assert.equal(q.length, 3, "the picker page, the full fields of its rows, the set-aside list: no more");
  const picker = q.find((x) => x.fields === "picker"), full = q.find((x) => x.bundle_ids), aside = q.find((x) => x.state === "set_aside");
  /* fix round 10, cause 33 (R4, DEC-97 clause 1): the list opens on the viewer's own captures, sent as `member` */
  assert.deepEqual(picker, { limit: "50", fields: "picker", member: "mai" });
  assert.ok(full && !full.fields, "the full read asks no picker");
  const ids = full.bundle_ids.split(",");
  assert.equal(ids.length, 50, "the 50 rows the page draws, never 60");
  assert.deepEqual(ids, Array.from({ length: 50 }, (_, i) => `INFO-2026-${1000 + i}`), "in the picker's order");
  assert.equal(new Set(ids).size, 50);
  assert.ok(aside);
  assert.equal(p.byOp("projectlist").length, 1, "the projects once");
  assert.equal(main(p).querySelectorAll('[id^="pick-held-"]').length, 50, "50 rows drawn");
  assert.ok(says(p, "screen.held.more", { count: 50 }), "the page says there are more");
});

test("R4 (C14) a project's Held carries the project in both reads; a refresh reads the picker and the full fields once each; an act that changes the list does the same", async () => {
  const p = await openPage("/app/held/PROJ-2026-0007", { plane: heldPlane(3), screens: [...SCREENS, DOCUMENT_STUB] });
  assert.deepEqual(reads(p).filter((x) => x.state !== "set_aside").map((x) => x.project), ["PROJ-2026-0007", "PROJ-2026-0007"]);
  const bare = await openPage("/app/held", { plane: heldPlane(3), screens: [...SCREENS, DOCUMENT_STUB] });
  const before = reads(bare).length;
  await press(bare, "heldcaptures");
  const after = reads(bare).slice(before);
  assert.equal(after.filter((x) => x.fields === "picker").length, 2, "the act's own picker read and the list's, both the cheap read");
  assert.equal(after.filter((x) => x.bundle_ids).length, 1, "and the full fields once for the new answer, not again for the same rows");
  assert.equal(after.filter((x) => !x.fields && !x.bundle_ids && x.state !== "set_aside").length, 0, "no full-row page read");
});

test("R4 (C14) the rows are listed from the picker at once, and the full fields (eligibility, the questions, the age) are drawn once they arrive; a full read that fails is drawn failed beside rows still listed", async () => {
  const lease = { ...fullRow(2), eligible: false, class: "CRUCIAL_IN_BATCH" };
  const p = await openPage("/app/held", { plane: heldPlane(3, { heldcaptures: (req) => {
    if (req.query.state === "set_aside") return ok({ ok: true, held: [], truncated: false });
    if (req.query.bundle_ids) return ok({ ok: true, truncated: false, held: [fullRow(0), fullRow(1), lease] });
    return ok({ ok: true, truncated: false, held: [0, 1, 2].map(pickerRow) });
  } }), screens: [...SCREENS, DOCUMENT_STUB] });
  assert.equal(main(p).querySelectorAll('[id^="pick-held-"]').length, 3);
  assert.ok(says(p, "screen.held.ineligible.alone"), "a full field drawn from the second read");
  const bad = await openPage("/app/held", { plane: heldPlane(3, { heldcaptures: (req) => {
    if (req.query.state === "set_aside") return ok({ ok: true, held: [], truncated: false });
    if (req.query.bundle_ids) return refused("STORE_SILENT", "store silent (test fixture)", 502);
    return ok({ ok: true, truncated: false, held: [0, 1, 2].map(pickerRow) });
  } }), screens: [...SCREENS, DOCUMENT_STUB] });
  assert.equal(main(bad).querySelectorAll('[id^="pick-held-"]').length, 3, "the rows are still listed");
  assert.match(text(bad), /store silent \(test fixture\)/);
  assert.ok(main(bad).querySelector('[data-state="failed"]'));
});

test("R4 (C14) control: an empty page makes no full read", async () => {
  const p = await openPage("/app/held", { plane: heldPlane(0), screens: [...SCREENS, DOCUMENT_STUB] });
  assert.equal(reads(p).filter((x) => x.bundle_ids).length, 0);
});
