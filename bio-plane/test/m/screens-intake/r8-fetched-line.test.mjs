/* screens-intake T51 fix round 8 (SCREENS-INTAKE #22): G108 (a capture filed under no project is finished without an empty fill) and G109 (a document is named by the
 * title it was stored under: the finished line and "Already in the record as" read `heldat`'s `copy.title` before any chain). R58, R38, R54. Every test enters by
 * pressing the act; a sentence is asserted by its key (R26, K3810). The no-project sentence is the nearest held row's (`screen.capture.address.done`, K4269; its own
 * row is owed, named in the job record). The alarm-delivered halves are the control-plane seam file's (`t51-round8-seam.test.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, main, fill, press, ok, says, word, DOCUMENT_STUB } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const PROJ = "PROJ-2026-0007";
const ADDRESS = "https://www.govinfo.gov/content/pkg/BUDGET-2021-APP/pdf/BUDGET-2021-APP.pdf";
const SESSION = "rs_2021";
const SHA = "e".repeat(64);
const HOME = "INFO-2026-0145-budget-2021-app-pdf";
const STORED = "BUDGET-2021-APP.pdf";
const BYTES = 17400000;
const NOT_HELD = { ok: true, held: false, copy: null, versions: 0, truncated: false, changed: { state: "undetermined" } };
const COPY = { sha256: SHA, document: HOME, project: null, title: STORED, retrieved: "2026-10-23T12:25:00Z", actor: "member:mai", address: ADDRESS };
const HELD = { ok: true, held: true, copy: COPY, versions: 1, truncated: false, changed: { state: "unchanged" } };
const PROJECT_MD = `---\ntitle: "Yosemite"\n---\n\n## Summary\n`;
const open = (path, plane) => openPage(path, { plane: { projectlist: ok({ projects: [] }), image: ok({ "bundle.md": PROJECT_MD }), memberlist: ok({ members: [{ member_id: "mai", handle: "mai-h", role: "member", status: "active" }] }),
  heldcaptures: ok({ ok: true, held: [], truncated: false }), ...plane }, screens: [...SCREENS, DOCUMENT_STUB] });
const PENDING = ok({ ok: true, fetch_pending: { session: SESSION, since: "2026-10-23T12:00:00Z", declared_bytes: BYTES, why: "over_wait" } });
const NONE_OPEN = ok({ ok: true, truncated: false, captures: [] });
const STILL_OPEN = ok({ ok: true, truncated: false, captures: [{ session: SESSION, locator: ADDRESS, started: "2026-10-23T12:00:00Z", outstanding: 0, fetch_pending: { since: "2026-10-23T12:00:00Z", declared_bytes: BYTES } }] });

/* a capture too large for the request, pressed, then delivered: the session leaves the list and the record shows the copy */
async function delivered(path, plane = {}) {
  const state = { listed: true };
  const p = await open(path, { acquire: PENDING, opencaptures: () => (state.listed ? STILL_OPEN : NONE_OPEN), heldat: (r) => ok(r.query.check || state.listed ? NOT_HELD : HELD), ...plane });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  state.listed = false;
  await p.clock.tick(4000);
  for (let i = 0; i < 8; i++) await p.settle(20);
  return p;
}
const fetched = (p) => main(p).querySelector("[data-fetched]");

test("R58 (G108) a project-less capture delivered after the press is finished without an empty fill: the document linked, where it waits, and no 'filed under' with nothing after it", async () => {
  const p = await delivered("/app/capture/address");
  const line = fetched(p);
  assert.ok(line, "the finished line is drawn");
  const link = line.querySelector(`a[href*="${HOME}"]`);
  assert.ok(link, "it links the document the delivery filed");
  assert.equal(line.textContent, word("screen.capture.address.done", { title: link.textContent }), "the nearest held row names the document and where it waits");
  assert.notEqual(line.textContent, word("screen.capture.fetch.done", { document: link.textContent, project: "" }), "the project sentence is not drawn with an empty fill");
  assert.equal(says(p, "capture.filed.project", { project: "" }), false);
});

test("R58 (G108) control: a capture from a project's page is finished by the project sentence with the project's name", async () => {
  const p = await delivered(`/app/capture/address/${PROJ}`);
  const line = fetched(p);
  assert.ok(line);
  const link = line.querySelector(`a[href*="${HOME}"]`);
  assert.ok(link);
  assert.equal(line.textContent, word("screen.capture.fetch.done", { document: link.textContent, project: "Yosemite" }));
});

test("R58 R54 (G109) the finished line names the delivered document by the title it was stored under, not the press's host-and-day chain", async () => {
  const p = await delivered("/app/capture/address");
  const link = fetched(p).querySelector(`a[href*="${HOME}"]`);
  assert.equal(link.textContent, STORED);
  assert.equal(says(p, "document.untitled.web", { site: "www.govinfo.gov", date: "x" }), false);
});

test("R54 (G109) control: a delivered copy that states no stored title keeps the name the press gave it", async () => {
  const noTitle = { ...HELD, copy: { ...COPY, title: null } };
  const state = { listed: true };
  const p = await open("/app/capture/address", { acquire: PENDING, opencaptures: () => (state.listed ? STILL_OPEN : NONE_OPEN), heldat: (r) => ok(r.query.check || state.listed ? NOT_HELD : noTitle) });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  state.listed = false;
  await p.clock.tick(4000);
  for (let i = 0; i < 8; i++) await p.settle(20);
  const link = fetched(p).querySelector(`a[href*="${HOME}"]`);
  assert.ok(link && link.textContent.length > 0 && link.textContent !== STORED);
});

test("R38 R54 (G109) 'Already in the record as' names a copy absent from the vouched list by the title `heldat` answers, not by host and day", async () => {
  /* the screen was opened before the copy was delivered: the vouched picker list does not hold its row */
  const p = await open("/app/capture/address", { opencaptures: NONE_OPEN, heldat: ok(HELD) });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.equal(p.byOp("acquire").length, 0, "nothing is captured: the address is held");
  const named = main(p).querySelector(".rec");
  assert.ok(named, "the compared copy is named");
  assert.equal(named.textContent, STORED);
  assert.equal(says(p, "document.untitled.web", { site: "www.govinfo.gov", date: "x" }), false);
});

test("R38 R54 (G109) control: a copy with no stored title and no row in the list is named by the chain a delivery uses", async () => {
  const p = await open("/app/capture/address", { opencaptures: NONE_OPEN, heldat: ok({ ...HELD, copy: { ...COPY, title: null } }) });
  fill(p, { "ci-address": ADDRESS });
  await press(p, "acquire");
  assert.notEqual(main(p).querySelector(".rec").textContent, STORED);
  assert.ok(main(p).querySelector(".rec").textContent.length > 0);
});
