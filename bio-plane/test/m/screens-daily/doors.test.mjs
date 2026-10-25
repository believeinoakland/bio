/* The doors from Home and the queue to Held captures and the Inbox (R65; C13, C14, C15; DEC-374) on the real served page
   (interface-shell's harness): each door drawn with its count when its read answers any, none at zero, a failed read drawn failed.
   Every sentence is asserted as `word(key, vars)` (R34). */
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { open as openRaw, ok, refused, main, word } from "./page.mjs";

/* The team's Home over the REAL store (op-tables §5.3): its founder (an administrator, who may start projects), one project, one item in her queue,
   all by the real acts (the world's clock is the page's: Home's security window is read against it); the held captures and the Inbox are the reads a test sets (a count of held captures or new knocks, a failed read). */
let built = null;
const world = () => (built ||= (async () => {
  const w = await storeWorld({ group: null, now: Date.now() });
  const admin = await w.signIn("admin");
  await w.recipes.project(admin, "The Coliseum lease");
  await w.recipes.queue({ obligations: 1 });
  return { w, admin };
})());
const open = async (path, plane = {}) => { const { w, admin } = await world(); return openRaw(path, plane, w.boot(admin)); };
const HOMEISH = {};
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

test("R65: Home says how many wait for a member to look, held captures and Inbox items both shown, a zero as 0; the queue draws it too (R95: it tells the doors' numbers apart from its own items)", async () => {
  const some = await open("/app", { ...HOMEISH, heldcaptures: HELD(3), inbox: KNOCKS("new", "pulled", "new") });
  const line = word("screen.home.waiting.counts", { held: "3", inbox: "2" });
  assert.ok(main(some).textContent.includes(line), "both counts, in the design's sentence");
  const zero = await open("/app", { ...HOMEISH, heldcaptures: HELD(0), inbox: KNOCKS("new") });
  assert.ok(main(zero).textContent.includes(word("screen.home.waiting.counts", { held: "0", inbox: "1" })), "a zero is shown as 0, never left out or worded as a plural");
  // controls: nothing waiting draws no line (R17: no reading at zero); a failed read says nothing of its count
  const nothing = await open("/app", { ...HOMEISH, heldcaptures: HELD(0), inbox: KNOCKS("pulled") });
  assert.ok(!main(nothing).textContent.includes(word("screen.home.waiting.counts", { held: "0", inbox: "0" })));
  const failed = await open("/app", { ...HOMEISH, heldcaptures: HELD(2), inbox: refused("NOT_YET", "No.", 500) });
  assert.ok(!main(failed).textContent.includes(word("screen.home.waiting.counts", { held: "2", inbox: "0" })));
  const queue = await open("/app/queue", { ...HOMEISH, heldcaptures: HELD(3), inbox: KNOCKS("new", "new") });
  assert.ok(main(queue).textContent.includes(word("screen.home.waiting.counts", { held: "3", inbox: "2" })), "R95: the queue says what the doors' numbers count");
  const quiet = await open("/app/queue", { ...HOMEISH, heldcaptures: HELD(0), inbox: KNOCKS("pulled") });
  assert.ok(!main(quiet).textContent.includes(word("screen.home.waiting.counts", { held: "0", inbox: "0" })), "control: nothing waiting, no line");
});
