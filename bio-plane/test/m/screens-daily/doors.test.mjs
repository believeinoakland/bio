/* The doors from Home and the queue to Held captures and the Inbox (R65; C13, C14, C15; DEC-374) on the real served page
   (interface-shell's harness): each door drawn with its count when its read answers any, none at zero, a failed read drawn failed.
   Every sentence is asserted as `word(key, vars)` (R34). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, main, word, MEMBER } from "./page.mjs";

const WHO = { whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }) };
const HOMEISH = { ...WHO, groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants" }),
  projectlist: ok({ ok: true, count: 1, limit: 200, truncated: false, projects: [{ id: "PROJ-1", name: "The Coliseum lease", stage: "investigating" }] }),
  projectquestions: ok({ ok: true, project: "PROJ-1", items: [], cursor: null }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
  startfrom: ok({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }] }),
  queue: ok({ items: [{ id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "Check it", assignee: "mai", assignee_role: "member", options: [], disposition: { instead: "taskresolve" }, subject: { kind: "bundle", id: "INF-7" } }], item_count: 1 }) };
const HELD = (n) => ok({ ok: true, held: Array.from({ length: n }, (_, i) => ({ bundle_id: "INF-H" + i, title: "Photo " + i })), state: "held", truncated: false, next: null });
const KNOCKS = (...status) => ok({ ok: true, inbox: status.map((s, i) => ({ knock_id: "K-" + i, status: s })) });
const doorsOf = (p) => main(p).querySelectorAll('a[href="/app/held"], a[href="/app/inbox"]');

for (const [screen, path, base] of [["home", "/app", HOMEISH], ["queue", "/app/queue", HOMEISH]]) {
  test(`R65: ${screen} draws the door to Held captures with the number held when heldcaptures answers any`, async () => {
    const p = await open(path, { ...base, heldcaptures: HELD(3) });
    const door = main(p).querySelector('a[href="/app/held"]');
    assert.ok(door, "the door to held is drawn");
    assert.equal(door.textContent, word(`act.release.label.${screen}`));
    const row = main(p).querySelectorAll(".cs-row").find((r) => r.querySelector('a[href="/app/held"]'));
    assert.ok(row.textContent.includes("3") && row.textContent.includes(word("screen.held.name")));
    assert.equal(p.byOp("heldcaptures").length > 0, true, "the held captures were read");
  });
  test(`R65: ${screen} draws no door to Held captures at zero (control), and none to the Inbox when no knock is new`, async () => {
    const none = await open(path, { ...base, heldcaptures: HELD(0), inbox: KNOCKS("pulled", "discarded") });
    assert.equal(doorsOf(none).length, 0);
  });
  test(`R65: ${screen} draws a failed heldcaptures read as failed in the door's place, never as none`, async () => {
    const p = await open(path, { ...base, heldcaptures: refused("NOT_YET", "No.", 500) });
    assert.equal(main(p).querySelector('a[href="/app/held"]'), null);
    assert.equal(main(p).querySelectorAll('[data-state="failed"]').length, 1, "a failed state is drawn in the door's place");
  });
  test(`R65: ${screen} draws the door to the Inbox with the number of new knocks (two new, one pulled draws 2)`, async () => {
    const p = await open(path, { ...base, inbox: KNOCKS("new", "pulled", "new") });
    const door = main(p).querySelector('a[href="/app/inbox"]');
    assert.ok(door);
    assert.equal(door.textContent, word("screen.inbox.name"));
    const row = main(p).querySelectorAll(".cs-row").find((r) => r.querySelector('a[href="/app/inbox"]'));
    assert.match(row.textContent, /\b2\b/);
  });
}
