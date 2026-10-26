/* screens-intake T51 fix round 5 (SCREENS-INTAKE #17; K4530): E7, the press on an address whose held copy has no reading repairs it (R38), and E8's press,
 * "Finish it" says what the continuation answered (R31). Every test enters by pressing the act, never by calling a `done` function. A sentence is asserted
 * by its key (R26); where a sentence is owed to the design the nearest held row stands in (K4269), named in the job record.
 *
 * Fix round 10 (K5054): E7 runs over the REAL store. A held copy with no reading is a document the team's daemon captured for a request (`capturerequest`,
 * drained by `capturerequestdrain`: the record keeps the copy, and its reading is made by `readheld`); one with text is the page's own capture of an address
 * (`acquire` reads it); a reading that failed final is the owner's own `readheld` over a document it cannot read; a site that changed is the world's network
 * answering another body. The address is answered by the world's network (an environment double). What the world cannot make stays scripted and is named
 * where it stands: a reading that follows (`owed`, `reading_pending`: the door's deferral), a record the viewer cannot see at `readheld` (`NO_HOME`),
 * and the whole of E8 (a rendered capture's session needs a browser the world has not). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { openWorld, members, main, text, fill, press, btn, ok, refused, says, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";
import { readHeldAnswer } from "../extraction/fixtures.mjs";

const ADDRESS = "https://www.irs.gov/pub/irs-pdf/f1040es.htm";
const PAGE_WITH_TEXT = "<html><head><title>2026 Form 1040-ES</title></head><body>\n<h1>2026 Form 1040-ES</h1>\n<p>2026 Form 1040-ES Estimated Tax for Individuals</p>\n</body></html>";
const UNREADABLE = "%PDF-1.4\nnot really a pdf\n%%EOF";   /* a PDF no reading can be made of */
/* a page whose substance the capture can judge (an ASP.NET calendar, capture R96): a different row is a change, not a rebuilt page */
const CALENDAR_HEADERS = { "content-type": "text/html; charset=utf-8", "x-powered-by": "ASP.NET", server: "Microsoft-IIS/10.0" };
const calendar = (row) => `<!DOCTYPE html><html><head><title>City Council Calendar</title></head><body><div id="hdr">nav</div><form id="aspnetForm" method="post"><input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="STATE_${"x".repeat(300)}" /><main id="mainContent" role="main"><table><tr><th>Name</th><th>Date</th></tr><tr><td>${row}</td><td>7/15/2026</td></tr></table></main></form></body></html>`;
const STAND_IN_ON_ITS_WAY = "screen.document.text.unread.next";
const CAN = ["contribute", "create_projects"];

async function team() {
  const t = await members({ mai: CAN });
  t.project = await t.world.recipes.project(t.mai, "The Form 1040-ES");
  t.question = (await t.world.recipes.question(t.mai, t.project, { title: "What is the form?", text: "What does the form ask?" })).id;
  return t;
}
/* a copy held at an address with NO reading: the daemon captured it for the member's request (`capturerequest`, `capturerequestdrain`), whose copy is kept and read by `readheld` */
async function requested(t, body = PAGE_WITH_TEXT, type = "text/html") {
  t.world.script(ADDRESS, async () => new Response(body, { status: 200, headers: { "content-type": type } }));
  const asked = await t.mai.act("capturerequest", { body: { address: ADDRESS, target: t.question } });
  const drained = await t.world.door({ url: "/api/?op=capturerequestdrain", init: { method: "POST", headers: { "content-type": "application/json" }, body: "{}" } }, { token: t.world.env.DAEMON_TOKEN });
  const done = ((drained.json && drained.json.result && drained.json.result.captured) || []).find((c) => c.request === asked.request);
  if (!done) throw new Error(`the daemon captured nothing: ${JSON.stringify(drained.json).slice(0, 300)}`);
  return done.sha;
}
const units = async (t, sha) => ((await t.mai.read("reading", { query: { sha256: sha } })).text_units || []).filter((u) => String(u.text || "").trim());
const open = (t, plane = {}, path = "/app/capture/address") => openWorld(path, { world: t.world, as: t.mai, plane, screens: [...SCREENS, DOCUMENT_STUB] });
const pressCapture = async (p, address = ADDRESS) => { fill(p, { "ci-address": address }); await press(p, "acquire"); };
const marks = (p, k) => main(p).querySelectorAll(`[data-reading="${k}"]`).length;
/* the owner's real answer to the press, with what it adds when the reading follows (`owed`, or `reading_pending`): the world's door makes neither itself */
const follows = (t, extra) => async (req) => {
  const a = await t.world.door(req, t.mai);
  const j = a.json;
  return { ...a, json: j && j.result && typeof j.result === "object" ? { ...j, result: { ...j.result, ...extra } } : { ...j, ...extra } };
};

test("R38 (E7) the press on an address whose held copy has no reading sends readheld for the copy's digest, once, and the page says the text now found", async () => {
  const t = await team();
  const sha = await requested(t);
  assert.equal((await units(t, sha)).length, 0, "before: the copy has no text (the walker's finding)");
  const p = await open(t);
  await pressCapture(p);
  assert.equal(p.byOp("acquire").length, 0, "nothing is fetched: the address is held and unchanged");
  assert.equal(p.byOp("heldat")[0].query.check, "true");
  assert.deepEqual(p.byOp("readheld").map((r) => r.body), [{ sha }], "the member's own Read it, sent once, for the held copy");
  const held = await units(t, sha);
  assert.ok(held.length > 0 && held[0].text.includes("Form 1040-ES"), "the words are in text_units after the press (R-STOP)");
  assert.equal(marks(p, "read"), 1, "the line says the text that was found");
  assert.ok(says(p, "screen.document.text.label"));
  assert.equal(marks(p, "pending"), 0);
});

test("R38 (E7) a held copy whose reading failed final with no text is read again by the press; a reading the owner keeps (READING_HELD) is said as it stands, none", async () => {
  const t = await team();
  const sha = await requested(t, UNREADABLE, "application/pdf");
  await t.mai.act("readheld", { body: { sha } });   /* the owner's first reading: it fails final, with its own account */
  const failed = await t.mai.read("reading", { query: { sha256: sha } });
  assert.equal(failed.reading.failure, "final");
  /* the owner states the reading's cause itself, whole (`completeness.stated`), so the line is the stated one with that account (R63), not the generic failed line */
  assert.equal(failed.completeness.state, "stated");
  assert.ok(failed.completeness.why);
  assert.equal((await units(t, sha)).length, 0);
  const p = await open(t);
  await pressCapture(p);
  assert.equal(p.byOp("readheld").length, 1, "a failed reading is not a reading");
  /* R63 (G135c; fix round 9): a reading that failed is said as failed, with the reading's own account, never "None: no page has text" */
  assert.equal(marks(p, "stated"), 1);
  assert.ok(text(p).includes(failed.completeness.why), "the reading's own account of why it holds no text");
  assert.ok(!says(p, "screen.document.text.none"), "and not 'None: no page has text'");
});

test("R38 (E7) the owner answering that the reading follows (owed, or reading_pending) is said as on its way, and the page asks for no second read", async () => {
  /* the reading that follows is the door's deferral, which the world's door does not make: the owner's real answer, with the one field it adds */
  for (const extra of [{ owed: true, found: false }, { reading_pending: true }]) {
    const t = await team();
    await requested(t);
    const p = await open(t, { readheld: follows(t, extra) });
    await pressCapture(p);
    assert.equal(p.byOp("readheld").length, 1);
    assert.ok(says(p, STAND_IN_ON_ITS_WAY));
    assert.equal(marks(p, "pending"), 1, "once");
    assert.equal(marks(p, "read"), 0);
  }
});

test("R38 (E7) a readheld refused, a stored copy that cannot be read and a record the member cannot see are drawn in words beside the held row, which stays", async () => {
  /* the owner's refusal is a fault the member cannot be made to cause: the one scripted answer */
  const a = await team();
  await requested(a);
  const r = await open(a, { readheld: refused("SESSION_REQUIRED", "Sign in to read this.", 403) });
  await pressCapture(r);
  assert.ok(main(r).textContent.includes("Sign in to read this."), "the owner's own words");
  assert.ok(says(r, "screen.capture.a64.already_in_the_record_as"), "the held copy is still drawn");
  /* the stored copy is gone from the evidence store: the owner's own NO_WHOLE_OBJECT */
  const b = await team();
  const sha = await requested(b);
  await b.world.env.CAPTURES.delete(`${b.world.store.namespace()}/captures/${sha}`);
  const p = await open(b);
  await pressCapture(p);
  assert.equal(p.byOp("readheld").length, 1);
  assert.ok(says(p, "transcribe.why.evidenceabsent"), "the stored copy can't be read just now");
  assert.ok(says(p, "screen.capture.a64.already_in_the_record_as"), "the held copy is still drawn");
  /* NO_HOME is the owner's answer to a copy whose home the viewer cannot see at the moment of reading, while the pre-flight just saw it: a race a world holds no
     second viewer to make, so extraction's published answer of `readHeld` (R80) is handed where the door would */
  const c = await team();
  await requested(c);
  const q = await open(c, { readheld: ok(await readHeldAnswer.noHome()) });
  await pressCapture(q);
  assert.ok(says(q, "refusal.CAPTURE_NOT_HELD"));
});

test("R38 (E7) control: a copy with text sends no readheld; an unreadable reading read sends none; a changed site reads and sends nothing about the old copy; a copy not held is captured as R1 says", async () => {
  /* a copy with text: the page's own capture of the address (acquire reads it) */
  const t = await team();
  t.world.script(ADDRESS, async () => new Response(PAGE_WITH_TEXT, { status: 200, headers: { "content-type": "text/html" } }));
  const first = await open(t);
  await pressCapture(first);
  assert.equal(first.byOp("acquire").length, 1);
  await t.world.tick(120_000);   /* the host's cooling-off after the fetch passes */
  const a = await open(t);
  await pressCapture(a);
  assert.equal(a.byOp("acquire").length, 0, "held: nothing is fetched");
  assert.equal(a.byOp("readheld").length, 0, "a copy with text sends nothing more");
  assert.equal(marks(a, "read") + marks(a, "pending"), 0, "and says nothing of a reading");
  assert.ok(says(a, "screen.capture.a64.already_in_the_record_as"));

  /* a reading that could not be read (the store silent) is not read again blind: a fault, scripted */
  const u = await team();
  await requested(u);
  const unknown = await open(u, { reading: refused("STORE_SILENT", "store silent (test fixture)", 503) });
  await pressCapture(unknown);
  assert.equal(unknown.byOp("readheld").length, 0, "a reading that could not be read is not read again blind");

  /* a changed site: the held copy, and the address now answering other words */
  const c = await team();
  c.world.script(ADDRESS, async () => new Response(calendar("City Council"), { status: 200, headers: CALENDAR_HEADERS }));
  await pressCapture(await open(c));
  await c.world.tick(120_000);
  c.world.script(ADDRESS, async () => new Response(calendar("Rules Committee"), { status: 200, headers: CALENDAR_HEADERS }));
  const changed = await open(c);
  await pressCapture(changed);
  assert.equal(changed.byOp("readheld").length, 0, "the old copy of a changed site is not read: the member chooses to capture the new copy");
  assert.equal(changed.byOp("reading").length, 0);
  assert.ok(btn(changed, "acquire", '[data-again="1"]') || main(changed).querySelector('button[data-act="acquire"]'), "the choice is still offered");

  /* a copy not held: another address, captured as R1 says */
  const n = await team();
  const other = "https://www.irs.gov/pub/irs-pdf/f1040es-new.htm";
  n.world.script(other, async () => new Response(PAGE_WITH_TEXT, { status: 200, headers: { "content-type": "text/html" } }));
  const notHeld = await open(n);
  await pressCapture(notHeld, other);
  assert.equal(notHeld.byOp("acquire").length, 1);
  assert.equal(notHeld.byOp("readheld").length, 0, "the door's own read follows a new capture, not the screen");
  assert.equal(notHeld.byOp("reading").length, 0);
});

/* ---- E8: the press of "Finish it" says what the continuation answered ----
   Fix round 10 (K5245): the cases of a "Finish it" answered (the render still being made, the visitor copy filed, only its supporting files, a refusal of the render) are removed:
   an unfinished capture with a render pending holds a browser session (`rs_...`) the world has no browser for, and the capture of the page as the site sent it keeps no
   supporting files outstanding (measured over 60, 200 and 700 images), so no act makes the state they begin from (K4297). The press and its control stay below. */

const mark = (p, k) => main(p).querySelectorAll(`[data-finish="${k}"]`).length;

test("R31 (E8) control: a press of Capture from an address draws its own result, with no finish mark and no Finish it", async () => {
  const t = await team();
  t.world.script(ADDRESS, async () => new Response(PAGE_WITH_TEXT, { status: 200, headers: { "content-type": "text/html" } }));
  const p = await open(t);
  await pressCapture(p);
  assert.ok(says(p, "screen.capture.address.done", { title: "2026 Form 1040-ES" }));
  assert.equal(mark(p, "pending") + mark(p, "done") + mark(p, "files"), 0);
  assert.equal(Array.from(main(p).querySelectorAll('button[data-act="acquire"]')).filter((b) => b.getAttribute("data-session")).length, 0, "nothing is unfinished");
});
