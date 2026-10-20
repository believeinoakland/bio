/* screens-intake R48 (T51 fix round; DEC-382 C56): the watching screen's named requests and sweeps. Each act sends the fields its owner
 * declares; a ratify is offered to the sweep's project owner only; the ratify sentence is read by key. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { open as openPage, text, main, btn, fill, press, ok, refused, word, says, saysIn, rawKeys } from "./page.mjs";
import { SCREENS } from "../../../src/screens-intake/index.mjs";

const MEMBERS = ok({ members: [{ member_id: "rosa", handle: "Rosa-h" }, { member_id: "dev", handle: "Dev-h" }] });
const PROJECTS = ok({ projects: [{ id: "PROJ-1", name: "The Coliseum lease" }, { id: "PROJ-2", name: "Pothole repairs" }] });
const REQ = (more = {}) => ({ bundle: "PROJ-1", request: "GATH-1", target: { text: "The 2026 street maintenance report", description: "d" }, locators: ["https://oaklandca.gov/resources/report"], authority: "Public Works Department",
  criticality: "crucial", cadence: "weekly", status: "open", planted: "2026-10-01T10:00:00Z", last_attempt: null, state: "due", due: true, next: null, ...more });
const NAMED = (items = [REQ()]) => ok({ ok: true, items, counts: {}, paused: { paused: false }, limit: 200, truncated: false });
const SW = (more = {}) => ({ sweep: "PROJ-1#planning", bundle: "PROJ-1", id: "planning", definition: JSON.stringify({ id: "planning", title: "Planning commission staff reports", sources: ["https://oaklandca.gov/pc"], budget: { per_run: 200, backlog: 900 } }),
  ratified: false, ratified_by: null, ratified_at: null, due: false, next: null, runs: [], ...more });
/* the viewer is `mai`; the owners are Rosa-h and, when asked, mai too */
const PARTS = (mai) => ok({ ok: true, projectId: "PROJ-1", participants: [{ handle: "mai", state: "joined", owner: mai === "owner" ? 1 : 0 }, { handle: "Rosa-h", state: "joined", owner: 1 }, { handle: "Dev-h", state: "joined", owner: 0 }] });
/* press the act whose button carries a given label (an act may be drawn several times, a row's and the form's) */
async function pressLabel(p, op, labelKey, reason) {
  const b = main(p).querySelectorAll(`button[data-act="${op}"]`).find((x) => x.textContent.includes(word(labelKey)));
  if (!b) throw new Error(`no ${op} labelled ${labelKey}`);
  const ai = b.getAttribute("data-ai");
  await p.click(b);
  const slot = main(p).querySelector(`[data-slot="${ai}"]`);
  if (reason !== undefined && slot && slot.querySelector("textarea")) { slot.querySelector("textarea").value = reason; await p.click(slot.querySelector('[data-shell="reason-send"]')); }
  for (let i = 0; i < 12; i++) { await p.settle(20); await new Promise((r) => setTimeout(r, 2)); }
  return { slot: () => main(p).querySelector(`[data-slot="${ai}"]`) };
}
const open = (plane = {}, me) => openPage("/app/watching", { reachable: true, plane: { monitoring: ok({ ok: true, items: [], counts: {}, paused: { paused: false } }), sweeps: ok({ ok: true, sweeps: [SW()], formats: [] }),
  memberlist: MEMBERS, projectlist: PROJECTS, namedrequests: NAMED(), projectparticipants: PARTS("owner"), ...plane }, ...(me ? { me } : {}) });

test("R48 the named requests: where, who stands behind the source, how often, open or retired, never checked or last checked, due now; an empty list is not drawn", async () => {
  const p = await open();
  const t = text(p);
  assert.ok(says(p, "screen.watching.nr.head"));
  assert.ok(t.includes("The 2026 street maintenance report") && t.includes("https://oaklandca.gov/resources/report") && t.includes("Public Works Department"));
  assert.ok(t.includes(word("monitor.freq.weekly")) && t.includes(word("screen.watching.nr.open")) && t.includes(word("screen.watching.nr.never")) && t.includes(word("screen.watching.nr.due")));
  assert.deepEqual(rawKeys(p), []);
  const q = await open({ namedrequests: NAMED([]) });
  assert.ok(!says(q, "screen.watching.nr.head"), "the empty list is not drawn");
  assert.ok(says(q, "screen.watching.nr.ask"), "but the way to ask for one is");
});

test("R48 asking for something to be gathered sends the fields namedrequestset declares; nothing is fetched by asking", async () => {
  const p = await open({ namedrequestset: ok({ ok: true, bundle: "PROJ-1", request: "GATH-9", status: "open" }) });
  fill(p, { "nr-project": "PROJ-2", "nr-target": "Agenda packets", "nr-desc": "Every packet.", "nr-loc": "https://oaklandca.gov/clerk\nhttps://example.org/mirror", "nr-auth": "City Clerk", "nr-matters": "supporting", "nr-often": "daily" });
  await pressLabel(p, "namedrequestset", "screen.watching.nr.ask", "Agenda packets.");
  assert.deepEqual(p.byOp("namedrequestset").map((r) => { const { reason, ...b } = r.body; return b; }), [{ bundle: "PROJ-2", target: { text: "Agenda packets", description: "Every packet." }, locators: ["https://oaklandca.gov/clerk", "https://example.org/mirror"], authority: "City Clerk", criticality: "supporting", cadence: "daily" }]);
  assert.equal(p.byOp("acquire").length + p.byOp("monitor").length, 0);
});

test("R48 control: a place that does not start with https://, or no target, is refused before anything is sent, in the design's words", async () => {
  const p = await open({ namedrequestset: ok({ ok: true }) });
  fill(p, { "nr-target": "x", "nr-loc": "http://plain.example/a", "nr-auth": "A" });
  const r = await pressLabel(p, "namedrequestset", "screen.watching.nr.ask", "x");
  assert.ok(saysIn(r.slot(), "screen.watching.nr.ref.https"));
  fill(p, { "nr-target": "", "nr-loc": "https://ok.example/a" });
  const s = await pressLabel(p, "namedrequestset", "screen.watching.nr.ask", "x");
  assert.ok(saysIn(s.slot(), "screen.watching.nr.ref.target"));
  assert.equal(p.byOp("namedrequestset").length, 0);
  const m = await open({ namedrequestset: refused("MACHINE_CANNOT_SET_REQUEST", "builder detail") });
  fill(m, { "nr-target": "x", "nr-loc": "https://a.example/a", "nr-auth": "A" });
  const t = await pressLabel(m, "namedrequestset", "screen.watching.nr.ask", "x");
  assert.ok(saysIn(t.slot(), "screen.watching.nr.ref.machine1") && saysIn(t.slot(), "screen.watching.nr.ref.machine2"));
});

test("R48 retiring a request sends it whole with status retired; a retired one offers no retire", async () => {
  const p = await open({ namedrequestset: ok({ ok: true }), namedrequests: NAMED([REQ(), REQ({ request: "GATH-2", status: "retired" })]) });
  const retire = main(p).querySelectorAll('button[data-act="namedrequestset"]').filter((b) => b.textContent.includes(word("screen.watching.nr.retire")));
  assert.equal(retire.length, 1, "only the open request");
  await pressLabel(p, "namedrequestset", "screen.watching.nr.retire", "No longer needed.");
  const { reason, ...b } = p.byOp("namedrequestset")[0].body;
  assert.deepEqual(b, { bundle: "PROJ-1", request: "GATH-1", target: REQ().target, locators: REQ().locators, authority: REQ().authority, criticality: "crucial", cadence: "weekly", status: "retired" });
});

test("R48 defining a sweep sends the fields sweepset declares and starts nothing", async () => {
  const p = await open({ sweepset: ok({ ok: true, sweep: "PROJ-1#new" }) });
  fill(p, { "sw-project": "PROJ-1", "sw-title": "Council agendas", "sw-sources": "https://oaklandca.gov/council", "sw-seeds": "https://oaklandca.gov/council/agendas", "sw-match": "agenda\nstaff report", "sw-often": "weekly", "sw-budget": "50" });
  await press(p, "sweepset", { reason: "Council agendas" });
  const { reason, ...b } = p.byOp("sweepset")[0].body;
  assert.deepEqual(b, { bundle: "PROJ-1", title: "Council agendas", sources: ["https://oaklandca.gov/council"], seeds: ["https://oaklandca.gov/council/agendas"], match: { terms: ["agenda", "staff report"] }, cadence: "weekly", budget: { per_run: 50, backlog: 500 } });
  assert.ok(says(p, "screen.watching.sweepdef.n1") && says(p, "screen.watching.sweepdef.n2"));
  assert.equal(p.byOp("sweepratify").length, 0);
  const q = await open();
  fill(q, { "sw-title": "", "sw-budget": "50" });
  assert.ok(saysIn((await press(q, "sweepset", { reason: "x" })).slot(), "capture.fieldneeded", { field: word("screen.watching.sweepdef.title") }));
});

test("R48 ratifying: the project's owner is offered Ratify, with the scope and budget shown and the ratify sentence by key; a non-owner is offered none and told who to ask", async () => {
  const owner = await open({ sweepratify: ok({ ok: true, sweep: "PROJ-1#planning", ratified: true }) });
  const ratify = btn(owner, "sweepratify");
  assert.ok(ratify && ratify.textContent.includes(word("screen.watching.sweepdef.ratify")), "the owner is offered it");
  assert.ok(text(owner).includes("oaklandca.gov/pc") && text(owner).includes(word("screen.watching.sweep.pages", { count: 200 })), "the scope and budget shown");
  assert.ok(says(owner, "screen.watching.sweepdef.rat1") && says(owner, "screen.watching.sweepdef.rat2"));
  await press(owner, "sweepratify", { reason: "Ready." });
  assert.deepEqual(owner.byOp("sweepratify").map((r) => ({ sweep: r.body.sweep, ratified: r.body.ratified })), [{ sweep: "PROJ-1#planning", ratified: true }]);
  /* control: a member who is not an owner sees no ratify, and is told who to ask */
  const other = await open({ projectparticipants: PARTS("not") });
  assert.equal(btn(other, "sweepratify"), null);
  assert.ok(says(other, "screen.watching.sweepdef.ref.owner1"));
  assert.ok(text(other).includes("Rosa-h"));
});

test("R48 stopping a ratified sweep is offered, and sends ratified false; a refusal for a non-owner is drawn by its words", async () => {
  const p = await open({ sweeps: ok({ ok: true, sweeps: [SW({ ratified: true, ratified_by: "member:dev", ratified_at: "2026-10-02T10:00:00Z", next: "2026-10-15T10:00:00Z" })], formats: [] }), sweepratify: ok({ ok: true }) });
  assert.ok(btn(p, "sweepratify").textContent.includes(word("screen.watching.sweepdef.stop")));
  await press(p, "sweepratify", { reason: "Pause breadth." });
  assert.equal(p.byOp("sweepratify")[0].body.ratified, false);
  const q = await open({ sweepratify: refused("SWEEP_RATIFY_NOT_AN_OWNER", "builder detail") });
  const r = await press(q, "sweepratify", { reason: "r" });
  assert.ok(saysIn(r.slot(), "screen.watching.sweepdef.ref.owner1"));
  assert.ok(!r.slot().textContent.includes("builder detail"));
});
