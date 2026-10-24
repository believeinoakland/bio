/* screens-intake T51 fix round 5 (SCREENS-INTAKE #17; K4530): E7, the press on an address whose held copy has no reading repairs it (R38), and E8's press,
 * "Finish it" says what the continuation answered (R31). Every test enters by pressing the act, never by calling a `done` function. A sentence is asserted
 * by its key (R26); where a sentence is owed to the design the nearest held row stands in (K4269), named in the job record.
 *
 * E7 runs over capture's real `heldat` and its real store fixture (the pre-flight finds the address held, unchanged by the real conditional look);
 * `reading` and `readheld` are extraction's, which this module's `uses` does not hold, so they are scripted at the shapes extraction R27 and R80 state
 * (`{ok, found, reading, text_units}` and `{ok, read, why?, found?, owed?}`), the text in `text_units` (R-STOP) and changed by `readheld` as the
 * store would change it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, text, fill, press, btn, ok, refused, says, DOCUMENT_STUB, MEMBER } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { captureOps } from "../../../src/capture/index.mjs";
import { fresh, network, receipt, register, sha } from "../capture/fixture.mjs";

const ADDRESS = "https://www.irs.gov/pub/irs-pdf/f1040es.pdf";
const BODY = "2026 Form 1040-ES, Estimated Tax for Individuals";
const DIGEST = sha(BODY);
const HOLDER = "INFO-2026-0042-form-1040-es";
const WORDS = [{ extent: { kind: "page", page: 1 }, reference: "p1", text: "2026 Form 1040-ES Estimated Tax for Individuals", truncated: false }];
const STAND_IN_ON_ITS_WAY = "screen.document.text.unread.next";
const read = (units) => units.length ? ok({ ok: true, found: true, capture_sha: DIGEST, reading: { found: true, content_type: "application/pdf" }, text_units: units })
  : ok({ ok: true, found: false, capture_sha: DIGEST, reading: null });
const failedFinal = ok({ ok: true, found: true, capture_sha: DIGEST, reading: { found: false, failure: "final", basis: "no text could be found" }, text_units: [] });

/* capture's real store: the member (`mai`) sees INFO-2026-0042, held at the address, captured by `x` */
function store() {
  const f = fresh();
  for (const m of ["mai", "x"]) f.s.sql.exec(`INSERT OR IGNORE INTO members (member_id, cover, role, status, created, updated) VALUES (?, 'c', 'member', 'active', '2026-01-01', '2026-01-01')`, m);
  f.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version) VALUES (?, 'information', 'g', '2026 Form 1040-ES', 'collected', '2026-02-01T00:00:00Z', '2026-02-01T00:00:00Z', 'x', 1)`, HOLDER);
  register(f.s, DIGEST, HOLDER, {});
  receipt(f.s, { address: ADDRESS, capture: DIGEST, first: "2026-02-01T10:00:00Z" });
  f.c.recordCaptureActor({ captureSha: DIGEST, actor: "x", at: "2026-02-01T10:00:00Z" });
  return f;
}
const heldat = (f) => async (req) => {
  const qs = new URLSearchParams({ op: "heldat", ...Object.fromEntries(Object.entries(req.query).filter(([k]) => k !== "op")), by: "member:mai", viewer: "member:mai" });
  return ok(await captureOps(f.c, new URL(`http://x/heldat?${qs}`), null, f.c.env).heldat());
};
const ME = { ...MEMBER, member: "mai" };
const SCRIPTED_HELDAT = (state) => ok({ ok: true, held: true, copy: { sha256: DIGEST, document: HOLDER, project: null, retrieved: "2026-02-01T10:00:00Z", actor: "x", address: ADDRESS }, versions: 1, truncated: false, changed: { state } });

/* the page's plane; `units` is what the store holds as text for the copy, and `readheld` changes it as the owner would */
function plane(f, { units = [], afterRead = WORDS, readheld } = {}) {
  const held = { units };
  return { held, plane: {
    heldat: heldat(f),
    reading: () => (held.failed ? failedFinal : read(held.units)),
    readheld: readheld || (() => { held.units = afterRead; return ok({ ok: true, read: true, bundle_id: HOLDER, found: afterRead.length > 0 }); }),
    acquire: () => { throw new Error("acquire was sent"); },
  } };
}
const open = (pl, extra = {}) => openPage("/app/capture/address", { plane: { ...pl, ...extra }, screens: [...SCREENS, DOCUMENT_STUB], me: ME });
const pressCapture = async (p) => { fill(p, { "ci-address": ADDRESS }); await press(p, "acquire"); };
const marks = (p, k) => main(p).querySelectorAll(`[data-reading="${k}"]`).length;

test("R38 (E7) the press on an address whose held copy has no reading sends readheld for the copy's digest, once, and the page says the text now found", async () => {
  const f = store(), net = network({ [ADDRESS]: () => new Response(BODY) });
  try {
    const { held, plane: pl } = plane(f);
    assert.equal(held.units.length, 0, "before: the copy has no text (the walker's finding)");
    const p = await open(pl);
    await pressCapture(p);
    assert.equal(p.byOp("acquire").length, 0, "nothing is fetched: the address is held and unchanged");
    assert.equal(p.byOp("heldat")[0].query.check, "true");
    assert.deepEqual(p.byOp("readheld").map((r) => r.body), [{ sha: DIGEST }], "the member's own Read it, sent once, for the held copy");
    assert.ok(held.units.length > 0 && held.units[0].text.includes("Form 1040-ES"), "the words are in text_units after the press (R-STOP)");
    assert.equal(marks(p, "read"), 1, "the line says the text that was found");
    assert.ok(says(p, "screen.document.text.label"));
    assert.equal(marks(p, "pending"), 0);
  } finally { net.restore(); }
});

test("R38 (E7) a held copy whose reading failed final with no text is read again by the press; a reading the owner keeps (READING_HELD) is said as it stands, none", async () => {
  const f = store(), net = network({ [ADDRESS]: () => new Response(BODY) });
  try {
    const { held, plane: pl } = plane(f, { readheld: () => ok({ ok: true, read: false, why: "READING_HELD" }) });
    held.failed = true;
    const p = await open(pl);
    await pressCapture(p);
    assert.equal(p.byOp("readheld").length, 1, "a failed reading is not a reading");
    /* R63 (G135c; fix round 9): a reading that failed is said as failed, with the reading's own account, never "None: no page has text" */
    assert.equal(marks(p, "failed"), 1);
    assert.ok(text(p).includes("no text could be found"), "the reading's own account of why it holds no text");
    assert.ok(!says(p, "screen.document.text.none"), "and not 'None: no page has text'");
  } finally { net.restore(); }
});

test("R38 (E7) the owner answering that the reading follows (owed, or reading_pending) is said as on its way, and the page asks for no second read", async () => {
  for (const answer of [{ ok: true, read: true, bundle_id: HOLDER, found: false, owed: true }, { ok: true, read: false, reading_pending: true }]) {
    const f = store(), net = network({ [ADDRESS]: () => new Response(BODY) });
    try {
      const { plane: pl } = plane(f, { readheld: () => ok(answer) });
      const p = await open(pl);
      await pressCapture(p);
      assert.equal(p.byOp("readheld").length, 1);
      assert.ok(says(p, STAND_IN_ON_ITS_WAY));
      assert.equal(marks(p, "pending"), 1, "once");
      assert.equal(marks(p, "read"), 0);
    } finally { net.restore(); }
  }
});

test("R38 (E7) a readheld refused, a stored copy that cannot be read and a record the member cannot see are drawn in words beside the held row, which stays", async () => {
  const f = store(), net = network({ [ADDRESS]: () => new Response(BODY) });
  try {
    const refusedRead = plane(f, { readheld: () => refused("SESSION_REQUIRED", "Sign in to read this.", 403) });
    const r = await open(refusedRead.plane);
    await pressCapture(r);
    assert.ok(main(r).textContent.includes("Sign in to read this."), "the owner's own words");
    assert.ok(says(r, "screen.capture.a64.already_in_the_record_as"), "the held copy is still drawn");
    const gone = plane(f, { readheld: () => ok({ ok: true, read: false, why: "NO_WHOLE_OBJECT" }) });
    const p = await open(gone.plane);
    await pressCapture(p);
    assert.ok(says(p, "transcribe.why.evidenceabsent"), "the stored copy can't be read just now");
    assert.ok(says(p, "screen.capture.a64.already_in_the_record_as"), "the held copy is still drawn");
    const no = plane(f, { readheld: () => ok({ ok: true, read: false, why: "NO_HOME" }) });
    const q = await open(no.plane);
    await pressCapture(q);
    assert.ok(says(q, "refusal.CAPTURE_NOT_HELD"));
  } finally { net.restore(); }
});

test("R38 (E7) control: a copy with text sends no readheld; an unreadable reading read sends none; a changed site reads and sends nothing about the old copy; a copy not held is captured as R1 says", async () => {
  const f = store(), net = network({ [ADDRESS]: () => new Response(BODY) });
  try {
    const withText = plane(f, { units: WORDS });
    const a = await open(withText.plane);
    await pressCapture(a);
    assert.equal(a.byOp("readheld").length, 0, "a copy with text sends nothing more");
    assert.equal(marks(a, "read") + marks(a, "pending"), 0, "and says nothing of a reading");
    assert.ok(says(a, "screen.capture.a64.already_in_the_record_as"));

    const unknown = await open({ ...plane(f).plane, reading: () => refused("STORE_SILENT", "store silent (test fixture)", 503) });
    await pressCapture(unknown);
    assert.equal(unknown.byOp("readheld").length, 0, "a reading that could not be read is not read again blind");

    const changed = await open({ ...plane(f).plane, heldat: () => SCRIPTED_HELDAT("changed") });
    await pressCapture(changed);
    assert.equal(changed.byOp("readheld").length, 0, "the old copy of a changed site is not read: the member chooses to capture the new copy");
    assert.equal(changed.byOp("reading").length, 0);
    assert.ok(btn(changed, "acquire", '[data-again="1"]') || main(changed).querySelector('button[data-act="acquire"]'), "the choice is still offered");

    const notHeld = await open({ ...plane(f).plane, heldat: ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined" } }),
      acquire: ok({ ok: true, existed: false, document: { capture: { sha256: DIGEST, bytes: BODY.length }, file: "snapshots/f.pdf", title: null } }),
      allocid: ok({ ok: true, id: "INFO-2026-0099" }), promote: (r) => ok({ ok: true, bundleId: r.body.bundleId }) });
    await pressCapture(notHeld);
    assert.equal(notHeld.byOp("acquire").length, 1);
    assert.equal(notHeld.byOp("readheld").length, 0, "the door's own read follows a new capture, not the screen");
    assert.equal(notHeld.byOp("reading").length, 0);
  } finally { net.restore(); }
});

/* ---- E8: the press of "Finish it" says what the continuation answered ---- */

const SESSION = "rs_af6c46c7d9ab1c80_mvjalfx2";
const PRIMARY = "a".repeat(64);
const PAGE = "https://www.nps.gov/acad/index.htm";
const OPEN = ok({ ok: true, truncated: false, captures: [{ session: SESSION, locator: PAGE, primary_sha: PRIMARY, started: "2026-10-22T08:41:56Z", updated: "2026-10-22T08:41:56Z", outstanding: 1 }] });
const NOTHING_OPEN = ok({ ok: true, truncated: false, captures: [] });
const HELD = ok({ ok: true, held: [{ bundle_id: "INFO-2026-0131-acadia", title: "Acadia National Park", capture: { sha256: PRIMARY, grade: null } }] });
const CONTINUED = { session: SESSION, primary: { sha256: PRIMARY, file: "snapshots/index.htm", locator: PAGE }, note: "the plane's note on the continuation" };
const RENDERED = { capture: { method: "retrieved", sha256: "c".repeat(64), bytes: 41000, encoding: "utf-8" }, file: "snapshots/index.htm", title: null,
  pair: { primary: "rendered", rendered: { file: "snapshots/index.htm", sha256: "c".repeat(64) }, shell: { file: "snapshots/index.htm.shell", sha256: PRIMARY } } };
const FIRST = { ok: true, existed: false, reading: { title: "Acadia National Park" }, document: { capture: { sha256: PRIMARY, bytes: 9000, encoding: "utf-8" }, file: "snapshots/index.htm", title: null,
  render_pending: { session: SESSION, since: "2026-10-22T08:41:56Z", note: "the plane's note on the render" } }, render: { state: "pending", session: SESSION } };
const base = { projectlist: ok({ projects: [] }), heldat: ok({ ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined" } }),
  allocid: ok({ ok: true, id: "INFO-2026-0132" }), promote: (r) => ok({ ok: true, bundleId: r.body.bundleId }), heldcaptures: HELD };
const openF = (plane) => openPage("/app/capture/address", { plane: { ...base, ...plane }, screens: [...SCREENS, DOCUMENT_STUB] });
const finishButton = (p) => Array.from(main(p).querySelectorAll('button[data-act="acquire"]')).find((b) => b.getAttribute("data-session") === SESSION || /session/.test(b.outerHTML));
const mark = (p, k) => main(p).querySelectorAll(`[data-finish="${k}"]`).length;

test("R31 (E8) 'Finish it' answered with the render still being made says so, and the first capture's result is no longer drawn as if nothing happened", async () => {
  const answers = [ok(FIRST), ok({ ok: true, existed: true, continued: CONTINUED, render: { state: "pending", session: SESSION } })];
  const p = await openF({ opencaptures: OPEN, acquire: () => answers.shift() });
  fill(p, { "ci-address": PAGE });
  await press(p, "acquire");
  assert.ok(says(p, "screen.capture.address.done", { title: "Acadia National Park" }), "before: the first capture's result is drawn");
  assert.ok(main(p).textContent.includes("the plane's note on the render"), "before: with the plane's note that the visitor copy is still being made");
  const finish = finishButton(p);
  assert.ok(finish, "Finish it is drawn");
  await p.click(finish);
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.deepEqual(p.byOp("acquire").slice(1).map((r) => r.body), [{ continue: SESSION }]);
  assert.equal(mark(p, "pending"), 1, "the line states the answer: still being made");
  assert.ok(says(p, "acquisition.index.render_pending_note"), "in the nearest held row's words (the plane's own note)");
  assert.equal(says(p, "screen.capture.address.done", { title: "Acadia National Park" }), false, "the first capture's text is not drawn again");
  assert.equal(p.byOp("promote").length, 1, "nothing new was filed by this press (the one promote is the first capture's)");
});

test("R31 (E8) 'Finish it' answered with the visitor copy filed says it, files that document once, and links it", async () => {
  const answers = [ok(FIRST), ok({ ok: true, existed: false, document: RENDERED, render: { state: "done" } })];
  const p = await openF({ opencaptures: OPEN, acquire: () => answers.shift() });
  fill(p, { "ci-address": PAGE });
  await press(p, "acquire");
  await p.click(finishButton(p));
  /* R-NOLOAD (K4787): wait for the work asserted (the second promotion), not for a fixed number of turns */
  for (let i = 0; i < 80 && p.byOp("promote").length < 2; i++) { await p.settle(20); await new Promise((r) => setTimeout(r, 5)); }
  for (let i = 0; i < 4; i++) await p.settle(20);
  assert.equal(p.byOp("promote").length, 2, "the first capture, then the visitor copy");
  const second = p.byOp("promote")[1].body;
  assert.ok(second.files.some((x) => x.sha256 === "c".repeat(64) || x.blobSha === "c".repeat(64)), "the document filed is the rendered one");
  assert.equal(mark(p, "done"), 1, "the line states the answer: finished");
  assert.ok(main(p).querySelector(`a[href*="${second.bundleId}"]`), "and links the document it filed");
  assert.equal(main(p).querySelectorAll('[data-finish="pending"]').length, 0);
});

test("R31 (E8) 'Finish it' answered with only its supporting files says they were fetched and that no new document was filed", async () => {
  const p = await openF({ opencaptures: OPEN, acquire: ok({ ok: true, existed: true, continued: CONTINUED, snapshot: { fetched: 3, failed: 0, outstanding: 0 } }) });
  await p.click(finishButton(p));
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.equal(mark(p, "files"), 1);
  assert.ok(says(p, "acquisition.note.continuation_files_new"));
  assert.equal(p.byOp("promote").length, 0);
});

test("R31 (E8) 'Finish it' refused says why in the refusal's words and draws no capture result; the unfinished line is still there to try again", async () => {
  const answers = [ok(FIRST), refused("RENDER_FAILED", null, 502)];
  const p = await openF({ opencaptures: OPEN, acquire: () => answers.shift() });
  fill(p, { "ci-address": PAGE });
  await press(p, "acquire");
  await p.click(finishButton(p));
  for (let i = 0; i < 8; i++) await p.settle(20);
  assert.equal(says(p, "screen.capture.address.done", { title: "Acadia National Park" }), false, "the first result is gone");
  assert.equal(mark(p, "pending") + mark(p, "done") + mark(p, "files"), 0, "no result is claimed");
  assert.ok(says(p, "refusal.RENDER_FAILED") || main(p).querySelector('.cs-state[data-state="failed"], [role="alert"]'), "the refusal is drawn in words");
  assert.ok(finishButton(p), "the member can try again");
});

test("R31 (E8) control: a press of Capture from an address still draws its own result, with no finish mark", async () => {
  const p = await openF({ opencaptures: NOTHING_OPEN, acquire: ok(FIRST) });
  fill(p, { "ci-address": PAGE });
  await press(p, "acquire");
  assert.ok(says(p, "screen.capture.address.done", { title: "Acadia National Park" }));
  assert.equal(mark(p, "pending") + mark(p, "done") + mark(p, "files"), 0);
});
