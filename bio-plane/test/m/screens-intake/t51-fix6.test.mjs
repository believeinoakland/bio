/* screens-intake T51 fix round 6 (SCREENS-INTAKE #18): G2 (a capture too large for the request is said, watched and finished: R58), G3 ("Finish it" answered at
 * once is watched to its end: R31), G7 ("the reading follows" only where the answer holds no reading: R57), G6 (an upload's register names the whole first: R21).
 * Every test enters by pressing the act. A sentence is asserted by its key (R26). The words are the nearest held rows (K4269): `screen.capture.address.working.head`,
 * `size.mb`, `capture.filed.project`, `screen.capture.address.done`, `refusal.FETCH_FAILED`; rows owed are named in the job record.
 *
 * R-SEAM: acquisition's `fetch_pending` answer and capture's `opencaptures` listing are the providers' (G2), unmerged at this START: the screen is drawn against the shapes
 * the plan states, and the last test holds capture's own declaration of `acquire` to carrying `project`, red by name until capture merges. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, fill, press, ok, says, word, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { collectOwnerRows as realRows } from "../interface-shell/harness.mjs";

const PROJ = "PROJ-2026-0007";
const ADDRESS = "https://www.nps.gov/yose/planyourvisit/upload/big.pdf";
const SESSION = "rs_big_1";
const SHA = "d".repeat(64);
const HOME = "INFO-2026-0140-big";
const BYTES = 15932155;
const NOT_HELD = { ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined" } };
const COPY = { ok: true, held: true, copy: { sha256: SHA, document: HOME, project: PROJ, retrieved: "2026-10-22T10:00:00Z", actor: "member:mai", address: ADDRESS }, versions: 1, truncated: false, changed: { state: "unchanged" } };
const PROJECT_MD = `---\ntitle: "Yosemite"\n---\n\n## Summary\n`;
const base = (extra = {}) => ({ projectlist: ok({ projects: [] }), image: ok({ "bundle.md": PROJECT_MD }), allocid: ok({ ok: true, id: "INFO-2026-0150" }),
  promote: (r) => ok({ ok: true, bundleId: r.body.bundleId }), ...extra });
const open = (path, plane) => openPage(path, { plane: base(plane), screens: [...SCREENS, DOCUMENT_STUB] });
const PENDING = ok({ ok: true, fetch_pending: { session: SESSION, since: "2026-10-22T10:00:00Z", declared_bytes: BYTES, why: "over_wait" } });
const listing = (state) => () => ok({ ok: true, truncated: false, captures: state.listed ? [{ session: SESSION, locator: ADDRESS, started: "2026-10-22T10:00:00Z", outstanding: 0, fetch_pending: { since: "2026-10-22T10:00:00Z", declared_bytes: BYTES } }] : [] });
const fetching = (p) => main(p).querySelectorAll("[data-fetching]").length;
const size = word_n("15.2");
function word_n(n) { return ["size.mb", { n }]; }
const pressCapture = async (p) => { fill(p, { "ci-address": ADDRESS }); await press(p, "acquire"); };
const heldat = (state) => (r) => ok(r.query.check || !state.held ? NOT_HELD : COPY);

test("R58 (G2) a capture answered fetch_pending is said at once (size, where it is filed), nothing is promoted, and when the session leaves the list the finished line links the document", async () => {
  const state = { listed: true, held: false };
  const p = await open(`/app/capture/address/${PROJ}`, { acquire: PENDING, opencaptures: listing(state), heldat: heldat(state) });
  await pressCapture(p);
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS, project: PROJ }], "the project rides so the delivery can file it");
  assert.equal(fetching(p), 1, "the what-and-why line is drawn once");
  assert.ok(says(p, "screen.capture.fetch.pending", { size: word(size[0], size[1]), project: "Yosemite" }), "the DEC-418 row: about 15.2 MB, and where it will be filed");
  assert.equal(p.byOp("allocid").length + p.byOp("promote").length, 0, "no document is promoted from a document-less answer");
  const before = p.byOp("opencaptures").length;
  await p.clock.tick(4000);
  for (let i = 0; i < 6; i++) await p.settle(20);
  assert.ok(p.byOp("opencaptures").length > before, "opencaptures is polled");
  assert.equal(fetching(p), 1, "still listed: still being fetched");
  assert.equal(says(p, "screen.capture.address.done", { title: "x" }), false);
  state.listed = false; state.held = true;
  await p.clock.tick(4000);
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.equal(fetching(p), 0, "the working line is gone");
  assert.ok(main(p).querySelector(`a[href*="${HOME}"]`), "the finished line links the document the delivery filed");
  assert.equal(p.byOp("promote").length, 0, "the screen filed nothing: the delivery did");
  const asks = p.byOp("heldat").filter((r) => !r.query.check);
  assert.ok(asks.length >= 1 && asks.every((r) => r.query.address === ADDRESS), "the record is asked for the copy at the address, nothing fetched");
});

test("R58 (G2) a capture whose declared size is not stated draws the line without a size; no subject files it nowhere", async () => {
  const state = { listed: true, held: false };
  const p = await open("/app/capture/address", { acquire: ok({ ok: true, fetch_pending: { session: SESSION, since: "2026-10-22T10:00:00Z", declared_bytes: null, why: "no_length" } }), opencaptures: listing(state), heldat: heldat(state) });
  await pressCapture(p);
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ locator: ADDRESS }], "no project, none sent");
  assert.equal(fetching(p), 1);
  assert.equal(/\d+\.\d MB/.test(main(p).textContent), false, "no size is invented (the why row's own \"8 MB\" is not one)");
  assert.equal(says(p, "capture.filed.project", { project: "Yosemite" }), false);
});

test("R58 (G2) a session that left the list with no copy at the address three asks in a row is refusal.FETCH_FAILED beside the act, and claims nothing", async () => {
  const state = { listed: false, held: false };
  const p = await open(`/app/capture/address/${PROJ}`, { acquire: PENDING, opencaptures: listing(state), heldat: heldat(state) });
  await pressCapture(p);
  for (let i = 0; i < 3; i++) { await p.clock.tick(4000); for (let j = 0; j < 8; j++) await p.settle(20); }
  assert.equal(fetching(p), 0);
  assert.ok(says(p, "refusal.FETCH_FAILED"));
  assert.equal(main(p).querySelectorAll('a[href*="INFO-"]').length, 0, "no document is claimed");
});

test("R58 (G2) a session being fetched is listed under Unfinished without Finish it; an ordinary unfinished capture keeps it", async () => {
  const both = ok({ ok: true, truncated: false, captures: [
    { session: "rs_fetch", locator: ADDRESS, started: "2026-10-22T10:00:00Z", outstanding: 0, fetch_pending: { since: "2026-10-22T10:00:00Z", declared_bytes: BYTES } },
    { session: "rs_plain", locator: "https://www.nps.gov/acad/index.htm", started: "2026-10-22T09:00:00Z", outstanding: 2 }] });
  const p = await open("/app/capture/address", { opencaptures: both });
  assert.equal(fetching(p), 1, "the one being fetched is said");
  const finishes = Array.from(main(p).querySelectorAll('button[data-act="acquire"]')).filter((b) => b.getAttribute("data-session"));
  assert.deepEqual(finishes.map((b) => b.getAttribute("data-session")), ["rs_plain"], "Finish it only for the ordinary one");
});

test("R58 control: a page answered with its document in the request is promoted and linked as before, with no fetching line and no poll", async () => {
  const doc = { capture: { sha256: SHA, bytes: 900, encoding: "utf-8" }, file: "snapshots/a.htm", title: null };
  const p = await open("/app/capture/address", { acquire: ok({ ok: true, existed: false, document: doc }), opencaptures: ok({ ok: true, truncated: false, captures: [] }), heldat: heldat({ held: false }) });
  await pressCapture(p);
  assert.equal(fetching(p), 0);
  assert.equal(p.byOp("promote").length, 1);
  const n = p.byOp("opencaptures").length;
  await p.clock.tick(30000);
  for (let i = 0; i < 6; i++) await p.settle(20);
  assert.equal(p.byOp("opencaptures").length, n, "nothing is polled");
});

/* ---- G3: "Finish it" answered at once ---- */

const PAGE = "https://www.nps.gov/sagu/index.htm";
const FIN = { session: "rs_sagu", primary: { sha256: "a".repeat(64), file: "snapshots/index.htm", locator: PAGE } };
const OPENS = (state) => () => ok({ ok: true, truncated: false, captures: state.listed ? [{ session: "rs_sagu", locator: PAGE, primary_sha: "a".repeat(64), started: "2026-10-22T09:00:00Z", outstanding: 1 }] : [] });
const finishBtn = (p) => Array.from(main(p).querySelectorAll('button[data-act="acquire"]')).find((b) => b.getAttribute("data-session") === "rs_sagu");
const mark = (p, k) => main(p).querySelectorAll(`[data-finish="${k}"]`).length;

test("R31 (G3) 'Finish it' answered render pending at once draws the working line, then, once the session has left the list, the finished line linking the visitor copy; the screen files nothing", async () => {
  const state = { listed: true, held: false };
  const p = await open("/app/capture/address", { opencaptures: OPENS(state), heldat: heldat(state), acquire: ok({ ok: true, existed: true, continued: FIN, render: { state: "pending", session: "rs_sagu" } }) });
  await p.click(finishBtn(p));
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.equal(mark(p, "pending"), 1, "the working line at once");
  assert.deepEqual(p.byOp("acquire").map((r) => r.body), [{ continue: "rs_sagu" }]);
  await p.clock.tick(4000);
  for (let i = 0; i < 6; i++) await p.settle(20);
  assert.equal(mark(p, "pending"), 1, "still listed: still being made");
  state.listed = false; state.held = true;
  await p.clock.tick(4000);
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.equal(mark(p, "pending"), 0);
  assert.equal(mark(p, "done"), 1, "the finished line");
  assert.ok(main(p).querySelector(`a[href*="${HOME}"]`), "linking the document");
  assert.equal(p.byOp("promote").length, 0, "filed by the delivery, not the screen");
});

test("R31 (G3) control: a continuation answered with only its files draws that and polls nothing", async () => {
  const state = { listed: true, held: false };
  const p = await open("/app/capture/address", { opencaptures: OPENS(state), heldat: heldat(state), acquire: ok({ ok: true, existed: true, continued: FIN }) });
  await p.click(finishBtn(p));
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.equal(mark(p, "files"), 1);
  const n = p.byOp("opencaptures").length;
  await p.clock.tick(30000);
  for (let i = 0; i < 6; i++) await p.settle(20);
  assert.equal(p.byOp("opencaptures").length, n);
});

/* ---- G7: the flag over the fact ---- */

const pendingMarks = (p) => main(p).querySelectorAll('[data-reading="pending"]').length;
const DOC = { capture: { sha256: SHA, bytes: 900, encoding: "utf-8" }, file: "snapshots/a.htm", title: null };

test("R57 (G7) an answer that holds a reading of its own draws no 'reading follows', though it says reading_pending; one without does", async () => {
  const units = [{ text: "Payment vouchers are due in four instalments", extent: { kind: "page", page: 1 } }];
  const own = await open("/app/capture/address", { heldat: ok(NOT_HELD), acquire: ok({ ok: true, existed: false, reading_pending: true, reading: { title: "T", words_read: 6, words_total: 6 }, text_units: units, document: DOC }) });
  await pressCapture(own);
  assert.equal(pendingMarks(own), 0, "the reading is there: no 'check again soon'");
  const none = await open("/app/capture/address", { heldat: ok(NOT_HELD), acquire: ok({ ok: true, existed: false, reading_pending: true, document: DOC }) });
  await pressCapture(none);
  assert.equal(pendingMarks(none), 1, "control: no reading of its own, the mark stays");
  const promo = await open("/app/capture/address", { heldat: ok(NOT_HELD), acquire: ok({ ok: true, existed: false, reading: { title: "T" }, text_units: units, document: DOC }),
    promote: (r) => ok({ ok: true, bundleId: r.body.bundleId, reading_pending: true }) });
  await pressCapture(promo);
  assert.equal(pendingMarks(promo), 0, "a promotion's flag beside a reading in the answer draws none");
});

test("R57 (G7) an upload answered with its reading draws no 'reading follows' beside it, whatever the flag says", async () => {
  const FILE = new File(["x"], "w40.pdf", { type: "application/pdf" });
  const up = (more) => ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 9 }, document: { file: `snapshots/upload-${SHA}`, locator: `upload:${SHA}`, capture: { method: "uploaded", sha256: SHA, encoding: "binary", bytes: 9 }, source: { kind: "uploader" } }, ...more });
  for (const [more, marks] of [[{ reading_pending: true, reading: { words_read: 0, words_total: 0 }, text_units: [] }, 0], [{ reading_pending: true }, 1]]) {
    const p = await open("/app/capture/file", { captureupload: up(more) });
    fill(p, { "ci-file": FILE, "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." });
    await press(p, "captureupload");
    assert.equal(pendingMarks(p), marks, JSON.stringify(more));
  }
});

/* ---- G6: the upload's register ---- */

test("R21 (G6; G127a, G127c) a multipart upload is registered as its whole, one row carrying its parts in order and no part as a row; a single-part upload registers its one file", async () => {
  const WHOLE = "e".repeat(64), P1 = "1".repeat(64), P2 = "9".repeat(64);
  const FILE = new File(["x"], "w40.pdf", { type: "application/pdf" });
  const multi = ok({ ok: true, existed: false, capture: { sha256: WHOLE, bytes: 41502904 },
    document: { file: `snapshots/upload-${WHOLE}`, locator: `upload:${WHOLE}`, capture: { method: "uploaded", sha256: WHOLE, encoding: "binary", bytes: 41502904 },
      parts: [{ file: "snapshots/upload-part-1", sha256: P1, bytes: 8388608 }, { file: "snapshots/upload-part-2", sha256: P2, bytes: 8388608 }], source: { kind: "uploader" } } });
  const p = await open("/app/capture/file", { captureupload: multi });
  fill(p, { "ci-file": FILE, "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." });
  await press(p, "captureupload");
  const reg = p.byOp("promote")[0].body.register;
  assert.deepEqual(reg.map((r) => r.sha256), [WHOLE], "the register is the whole alone: a part's digest is no row (K4833)");
  assert.equal(reg[0].bytes, 41502904, "with its total size");
  assert.deepEqual(reg[0].parts, [{ sha256: P1, path: "snapshots/upload-part-1", bytes: 8388608 }, { sha256: P2, path: "snapshots/upload-part-2", bytes: 8388608 }], "the parts, in order, on the whole's row");
  const single = await open("/app/capture/file", { captureupload: ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 9 }, document: { file: `snapshots/upload-${SHA}`, locator: `upload:${SHA}`, capture: { method: "uploaded", sha256: SHA, encoding: "binary", bytes: 9 }, source: { kind: "uploader" } } }) });
  fill(single, { "ci-file": FILE, "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." });
  await press(single, "captureupload");
  assert.deepEqual(single.byOp("promote")[0].body.register.map((r) => r.sha256), [SHA]);
});

/* ---- R-SEAM: red by name until capture merges ---- */

test("R58 (G2 seam) capture's own declaration of acquire accepts `project` (capture, the G2 provider; red until it merges)", () => {
  const row = realRows().acquire;
  assert.ok(row && row.fields, "acquire is declared by its owner");
  const accepted = [...row.fields.accepts, ...row.fields.requires].flat();
  assert.ok(accepted.includes("project"), "acquire accepts project");
});

/* ---- B31: a session whose owed fetch ended in a stated refusal ---- */

test("R58 (B31) an entry kept with `failed` draws the failure in the refusal's words at once, from the poll and from the list, without waiting for three asks", async () => {
  /* listed for a day from the fetch (N1, fix round 9; K4855): the entry is recent */
  const recent = new Date(Date.now() - 600000).toISOString().split(".")[0] + "Z";
  const failedEntry = { session: SESSION, locator: ADDRESS, started: recent, outstanding: 1, fetch_pending: { since: recent, declared_bytes: BYTES, why: "LARGE_DECLARED", failed: "TOO_LARGE" } };
  const state = { listed: true, held: false };
  const p = await open(`/app/capture/address/${PROJ}`, { acquire: PENDING, heldat: heldat(state),
    opencaptures: () => ok({ ok: true, truncated: false, captures: state.listed ? [failedEntry] : [] }) });
  await pressCapture(p);
  await p.clock.tick(4000);
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.equal(fetching(p), 0, "no working line");
  assert.ok(says(p, "refusal.TOO_LARGE"), "the stated reason, in the refusal's words");
  assert.equal(p.byOp("heldat").filter((r) => !r.query.check).length, 0, "the record is not asked: the answer was stated");
  const reloaded = await open("/app/capture/address", { opencaptures: ok({ ok: true, truncated: false, captures: [failedEntry] }) });
  assert.ok(says(reloaded, "refusal.TOO_LARGE"), "the list says it too");
  assert.equal(Array.from(main(reloaded).querySelectorAll('button[data-act="acquire"]')).filter((b) => b.getAttribute("data-session")).length, 0, "and offers no Finish it");
});

/* ---- G14: completeness; G19: supporting files ---- */

const CAPTURED_OK = (more) => ok({ ok: true, existed: false, document: DOC, text_units: [{ text: "Payment vouchers are due" }], ...more });
const reads = (p, k) => main(p).querySelectorAll(`[data-reading="${k}"]`).length;

test("R57 (G14) a capture whose reading says it is partial never draws 'full'; stated draws its reason; whole is as before", async () => {
  const partial = await open("/app/capture/file", { captureupload: ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 9 },
    document: { file: `snapshots/upload-${SHA}`, locator: `upload:${SHA}`, capture: { method: "uploaded", sha256: SHA, encoding: "binary", bytes: 9 }, source: { kind: "uploader" } },
    reading: { found: true, title: "T" }, text_units: [{ text: "Payment vouchers are due" }], completeness: { state: "partial" } }) });
  const up = async (p) => { fill(p, { "ci-file": new File(["x"], "w.pdf", { type: "application/pdf" }), "ci-how-made": true, "ci-where": "City hall", "ci-what": "The packet." }); await press(p, "captureupload"); };
  await up(partial);
  assert.equal(reads(partial, "partial"), 1);
  assert.equal(says(partial, "screen.document.text.full"), false, "never 'full' while partial");
  const stated = await open("/app/capture/file", { captureupload: ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 9 },
    document: { file: `snapshots/upload-${SHA}`, locator: `upload:${SHA}`, capture: { method: "uploaded", sha256: SHA, encoding: "binary", bytes: 9 }, source: { kind: "uploader" } },
    reading: { found: false, failure: "final" }, text_units: [], completeness: { state: "stated", why: "TOO_LARGE" } }) });
  await up(stated);
  assert.equal(reads(stated, "stated"), 1);
  assert.ok(says(stated, "refusal.TOO_LARGE"));
  assert.equal(says(stated, "screen.document.text.full") || says(stated, "screen.document.text.none"), false);
  const whole = await open("/app/capture/file", { captureupload: ok({ ok: true, existed: false, capture: { sha256: SHA, bytes: 9 },
    document: { file: `snapshots/upload-${SHA}`, locator: `upload:${SHA}`, capture: { method: "uploaded", sha256: SHA, encoding: "binary", bytes: 9 }, source: { kind: "uploader" } },
    reading: { found: true, title: "T" }, text_units: [{ text: "Payment vouchers are due" }], completeness: { state: "whole" } }) });
  await up(whole);
  assert.equal(reads(whole, "read"), 1, "control: whole draws the reading as it did");
  assert.ok(says(whole, "screen.document.text.full"));
});

test("R2 R59 (G19) a capture that skipped supporting files says how many of how many it kept and why; none skipped says nothing", async () => {
  const sup = (x) => async () => { const p = await open("/app/capture/address", { acquire: CAPTURED_OK({ supporting: x }), heldat: ok(NOT_HELD) }); await pressCapture(p); return p; };
  const p = await sup({ kept: 400, skipped: 50, reasons: [{ reason: "CAP_REACHED", count: 50, limit: 400, detail: "the plane's own words" }] })();
  const line = main(p).querySelector("[data-supporting]");
  assert.ok(line, "the line is drawn");
  assert.ok(line.textContent.includes(word("screen.capture.supporting.kept", { kept: "400", total: "450" })), "N of M");
  assert.ok(line.textContent.includes(word("screen.capture.supporting.cap", { cap: "400" })), "and the reason, by its code's key (G110: the plane's `detail` is never drawn)");
  assert.equal(line.textContent.includes("the plane's own words"), false);
  const none = await sup({ kept: 12, skipped: 0, reasons: [] })();
  assert.equal(main(none).querySelectorAll("[data-supporting]").length, 0, "control: nothing skipped, nothing said");
  const absent = await sup(undefined)();
  assert.equal(main(absent).querySelectorAll("[data-supporting]").length, 0);
});

/* ---- G20: lists that stop say so; the already-held look covers every held document ---- */

test("R7 R60 (G20) the inbox says when the doorbell stopped at its limit; an untruncated list says nothing", async () => {
  const K = { knock_id: "KNOCK-2026-10-03-9c1f0a2b", sha256: "1".repeat(64), bytes: 3, note: "n", received: "2026-10-03T10:00:00Z", status: "new" };
  const cut = await open("/app/inbox", { inbox: ok({ inbox: [K], truncated: true, next: "c1" }) });
  assert.ok(says(cut, "screen.held.more", { count: "1" }));
  const whole = await open("/app/inbox", { inbox: ok({ inbox: [K], truncated: false, next: null }) });
  assert.equal(says(whole, "screen.held.more", { count: "1" }), false);
});

test("R29 R60 (G20) the question chooser says when the search stopped at its limit; and the already-held look reads every page by next", async () => {
  const hit = (n) => ({ bundle_id: `INQ-2026-000${n}-q`, title: `Q${n}` });
  const q = await open(`/app/capture/address/INQ-2026-0001-q`, { search: ok({ hits: [hit(1), hit(2)], truncated: true, next: "n1" }), image: ok({ "bundle.md": `---\ntitle: "Q1"\nproject: ${PROJ}\n---\n` }), projectquestions: ok({ items: [] }) });
  assert.ok(says(q, "screen.held.more", { count: "2" }));
  const whole = await open(`/app/capture/address/INQ-2026-0001-q`, { search: ok({ hits: [hit(1), hit(2)], truncated: false }), image: ok({ "bundle.md": `---\ntitle: "Q1"\nproject: ${PROJ}\n---\n` }), projectquestions: ok({ items: [] }) });
  assert.equal(says(whole, "screen.held.more", { count: "2" }), false);
  /* the document at an address is found on the second page of held documents */
  const pages = (r) => r.query.after === "p2"
    ? ok({ ok: true, held: [{ bundle_id: "INFO-2026-0777-late", title: "Late", source: { address: ADDRESS }, capture: { sha256: SHA } }], truncated: false, next: null })
    : ok({ ok: true, held: [{ bundle_id: "INFO-2026-0001-first", title: "First", source: { address: "https://other.example/" }, capture: { sha256: "a".repeat(64) } }], truncated: true, next: "p2" });
  const doc = { capture: { sha256: SHA, bytes: 900, encoding: "utf-8" }, file: "snapshots/a.htm", title: null };
  const p = await open("/app/capture/address", { acquire: ok({ ok: true, existed: false, document: doc }), heldat: ok(NOT_HELD), heldcaptures: pages, monitorset: ok({ ok: true }) });
  fill(p, { "ci-address": "https://one.example/now" });
  await press(p, "acquire");
  fill(p, { "ci-address": ADDRESS });
  await press(p, "monitorset", { reason: "r" });
  assert.equal(p.byOp("monitorset")[0].body.bundleId, "INFO-2026-0777-late", "found on the second page");
  const looks = p.byOp("heldcaptures").filter((r) => r.query.state === "held_and_vouched" && r.query.limit === "1000" || r.query.after);
  assert.ok(looks.some((r) => r.query.after === "p2"), "the second page is read by the first's next");
});
