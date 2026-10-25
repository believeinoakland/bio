/* Fix round 10 (final pass): the causes of the final walk that are this module's, at its interface. Every sentence is asserted as
   `word(key, vars)` (R34). The measured test needs playwright-core and Chromium (measure.mjs). */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { FRAME } from "../interface-shell/harness.mjs";
import { measure } from "./measure.mjs";

/* ---------- R92 (06 §19 (d)): Find's pick boxes are 44 px at 390 ---------- */

/** The plane the browser's page asks: every op the page reads, answered by the REAL store's door for the member (op-tables §5.3), the frame's included. */
function realPlane(w, as, ops) {
  const door = (op) => (req) => w.door({ url: `/api/?${new URLSearchParams({ ...req.query, op })}`,
    init: req.body === undefined ? { method: "GET" } : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(req.body) } }, as);
  return Object.fromEntries([...Object.keys(FRAME).filter((op) => op !== "version"), ...ops].map((op) => [op, door(op)]));
}
/** A team with a member, rosa, and two documents she holds: the browse lists both, and a search for "pothole" finds both by title. */
async function team() {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const project = await w.recipes.project(rosa, "Street work");
  await w.recipes.hold(rosa, "Pothole work orders", "Work orders for the potholes on Main Street.", project);
  await w.recipes.hold(rosa, "Pothole memo 88-31", "Memo 88-31 on stormwater.", project);
  return { w, rosa, plane: realPlane(w, rosa, ["lookedat", "themeread", "browse", "search", "meaningrows", "subjectsnamed", "searchfields"]) };
}
const PICKS = () => Array.from(document.querySelectorAll('#cs-main input[type=checkbox][id^="finder-pick-"]')).map((e) => {
  const r = e.getBoundingClientRect();
  return { id: e.id, cls: e.className, w: Math.round(r.width), h: Math.round(r.height) };
});

for (const [where, path] of [["the browse", "/app/finder"], ["a search", "/app/finder/pothole"]]) {
  test(`R92, R106 (06 §19 (d); ${where}): every pick box of Find's results is a 44 px target at 390 px; control: the same box at 1280 px is the desktop's`, { timeout: 120000 }, async () => {
    const { plane } = await team();
    const m = await measure({ path, width: 390, plane, ready: "#cs-main .cs-row", measure: new Function(`return (${PICKS.toString()})();`) });
    assert.equal(m.length, 2, "a box on each result");
    for (const b of m) {
      assert.ok(/\bmk-pick\b/.test(b.cls), "the box carries the kit's pick class: " + JSON.stringify(b));
      assert.ok(b.w >= 44 && b.h >= 44, "44 px: " + JSON.stringify(b));
    }
    const wide = await measure({ path, width: 1280, plane, ready: "#cs-main .cs-row", measure: new Function(`return (${PICKS.toString()})();`) });
    assert.equal(wide.length, 2, "the desktop draws the same boxes");
  });
}

/* ---------- R29, R42 (K5148; 03 R24): the viewer is found in a roster by `member`, never by handle alone ---------- */

import { participation } from "../../../src/screens-daily/participation.mjs";

/** The part as `view.parts.participation` hands it to Home and Projects: a row that states `participation` is read by no one; any other is
 *  read once through `projectparticipants` and kept in `view.ui.mine`. The roster's rows are project-roster's (`member`, `handle`, `state`):
 *  the founder of a team that named no handle is `{member: "admin", handle: null, founder: true}`. The real store cannot be asked for this
 *  answer for a row with no `participation` (project-roster R34 states it on every row), so the part is run here at its own interface. */
const founderRows = (state) => [{ member: "admin", handle: null, founder: true, state, owner: 1 }, { member: "mai", handle: "mai", state: "joined", owner: 0 }];
async function stateOf(me, rows, project = { id: "PROJ-7" }) {
  const view = { ui: {}, me };
  const sets = [];
  const cs = { set: (k, v) => { sets.push([k, v]); view.ui[k] = v; }, call: async (op, o) => ({ ok: true, result: { ok: true, participants: rows, projectId: o.query.projectId } }) };
  participation(cs, view, [project]);
  await new Promise((r) => setTimeout(r, 5));
  return participation(cs, view, [project])[project.id] || null;
}

test("R29, R42 (K5148): the founder who named no handle is found in a roster by her member id and told her place; a row with no handle is not hers when the member differs; a member with a handle is still found, by member or by handle", async () => {
  assert.equal(await stateOf({ member: "admin", handle: null }, founderRows("invited")), "invited", "the unnamed founder's own row");
  assert.equal(await stateOf({ member: "someone", handle: null }, founderRows("invited")), null, "an empty handle is nobody's: another member with none is not her");
  assert.equal(await stateOf({ member: "dev-id", handle: "dev" }, [{ member: "dev-id", handle: "dev", state: "joined" }]), "joined", "by member id and handle");
  assert.equal(await stateOf({ member: "other-id", handle: "dev" }, [{ member: "dev-id", handle: "dev", state: "invited" }]), "invited", "by handle alone when the ids differ");
  assert.equal(await stateOf({ member: "admin", handle: null }, founderRows("joined"), { id: "PROJ-7", participation: "leaving" }), "leaving", "a row that states its participation is taken at its word");
});
