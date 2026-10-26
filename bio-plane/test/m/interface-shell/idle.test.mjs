/* interface-shell R33, R34: idle limits on the page's clock (the plane governing), background reads, the lock over the
   screen, and the password asked again. */
import test from "node:test";
import assert from "node:assert/strict";
import { declaredFit, fitSend, boot, ok, refused, STORE_KEY } from "./harness.mjs";
import { ALL, FRONT } from "./screens.fixture.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { MEMBERS } from "./screens.fixture.mjs";
import { inWorld, bootAs, idleFor, passwordOf } from "./world.mjs";

const MIN = 60 * 1000;
const SCREENS = [...ALL, FRONT];
const HELD = ok({ items: [{ id: "h1", title: "Minutes", at: "2026-10-01" }] });
const lockOf = (p) => p.root().querySelector('[data-overlay="lock"]');
const screenOf = (p) => p.root().querySelector("#cs-main").getAttribute("data-screen");

test("R33 an own device locks at 30 minutes without the member's input: the lock drawn over the screen (session.locked), what was typed kept; the member's input resets the count", async () => {
  const p = await boot({ screens: SCREENS, plane: { projectdirectory: ok({ projects: [] }) } });
  p.doc.getElementById("home-title").value = "Half-typed title";
  await p.clock.tick(29 * MIN);
  assert.equal(lockOf(p), null);
  p.fire(p.doc.body, "keydown", { key: "a" });
  await p.clock.tick(29 * MIN);
  assert.equal(lockOf(p), null, "a key pressed counts as activity");
  await p.clock.tick(1 * MIN + 1);
  assert.ok(lockOf(p));
  assert.ok(lockOf(p).textContent.includes(word("session.locked")));
  assert.equal(p.doc.getElementById("home-title").value, "Half-typed title", "kept under the lock");
  assert.equal(screenOf(p), "home", "the screen stays beneath");
  assert.equal(p.local.get(STORE_KEY + ":state"), "locked");
  /* nothing beneath answers while locked */
  await p.click('button[data-act="promote"]');
  assert.equal(p.byOp("promote").length, 0);
});

test("R33 a shared device at 15 minutes without the member's input sends signout and draws front's ended state; an act pressed is activity", async () => {
  const p = await boot({ screens: SCREENS, session: { t: "tok-s", e: 0, d: "shared", w: "mai" }, path: "/app/held", plane: { heldcaptures: HELD } });
  await p.clock.tick(14 * MIN);
  await p.click('a[href="/app"]');
  await p.clock.tick(14 * MIN);
  assert.equal(p.byOp("signout").length, 0, "a press of the rail reset the count");
  await p.clock.tick(1 * MIN + 1);
  assert.equal(p.byOp("signout").length, 1);
  assert.equal(p.byOp("signout")[0].query.background, "1", "the page's own clock is not the member's activity");
  assert.equal(p.local.has(STORE_KEY), false);
  assert.equal(screenOf(p), "front");
  assert.equal(p.doc.getElementById("state").textContent, "fx t state ended");
  assert.equal(lockOf(p), null, "a shared device is never locked");
});

test("R33 every read the shell makes on its own timers carries background=1 (cs.later's calls, the queue count); the member's own reads and acts do not", async () => {
  const s = { id: "held", reads: () => ({ h: { op: "heldcaptures" } }), acts: [{ op: "heldrestore", send: fitSend("heldrestore") }],
    render: (cs, view) => { if (!view.ui.armed) { view.ui.armed = true; cs.later(300000, (c) => c.call("heldcaptures", { query: { state: "timer" } })); } return cs.act("heldrestore"); } };
  const p = await boot({ screens: [s], path: "/app/held", plane: { heldcaptures: HELD } });
  assert.equal(p.byOp("queue")[0].query.background, "1");
  assert.equal(p.byOp("heldcaptures")[0].query.background, undefined, "the screen's own read");
  await p.clock.tick(5 * MIN);
  const timed = p.byOp("heldcaptures").find((r) => r.query.state === "timer");
  assert.equal(timed.query.background, "1");
  /* control: a timer's read alone never keeps the page awake: the lock still comes at 30 minutes */
  await p.clock.tick(25 * MIN + 1);
  assert.ok(lockOf(p));
});

test("R33 the plane governs over the page's clock: SESSION_LOCKED to any request draws the lock at once, and the store answers it 401; a 401 ends the session at once", async () => {
  const { world, me } = await inWorld();
  const p = await bootAs(world, me, { screens: SCREENS, path: "/app/held" });
  assert.equal(lockOf(p), null, "live: no lock");
  /* the store counts the session idle past its device's limit; the page's own clock is minutes from its limit */
  idleFor(world, me, 31);
  await p.back("/app/held");
  assert.ok(lockOf(p), "locked at the plane's word, minutes before the page's own limit");
  assert.equal(p.local.get(STORE_KEY + ":state"), "locked");
  assert.ok(p.local.has(STORE_KEY), "the record is kept: a locked session is not an ended one");
  const q = await boot({ screens: SCREENS, path: "/app/held", plane: { heldcaptures: refused("SESSION_ENDED", null, 401) } });
  assert.equal(screenOf(q), "front");
});

test("R33 R34 unlock from the lock returns to the screen as it was; a wrong password keeps it locked and says so", async () => {
  const { world, me } = await inWorld();
  const p = await bootAs(world, me, { screens: SCREENS });
  p.doc.getElementById("home-title").value = "Kept";
  await p.clock.tick(30 * MIN + 1);
  p.doc.getElementById("cs-lock-pw").value = "wrong";
  await p.click('[data-shell="unlock"]');
  assert.ok(lockOf(p));
  assert.ok(lockOf(p).querySelector('[data-gap="refused"]'), "the refusal said in the lock");
  assert.equal(p.doc.getElementById("cs-lock-pw").value, "", "a typed password never survives its send");
  p.doc.getElementById("cs-lock-pw").value = passwordOf(world, me);
  await p.click('[data-shell="unlock"]');
  assert.equal(lockOf(p), null);
  assert.equal(p.doc.getElementById("home-title").value, "Kept");
  assert.equal(screenOf(p), "home");
  assert.equal(p.byOp("unlock").length, 2);
  assert.deepEqual(p.byOp("unlock").map((r) => [r.headers.Authorization, r.body.password]), [["Bearer " + me.token, "wrong"], ["Bearer " + me.token, passwordOf(world, me)]]);
  assert.equal(p.local.has(STORE_KEY + ":state"), false);
  /* the lock's "Not rosa?" signs out */
  await p.clock.tick(30 * MIN + 1);
  assert.ok(lockOf(p).textContent.includes("Not " + me.handle + "?"));
  await p.click('[data-shell="lock-other"]');
  assert.equal(p.byOp("signout").length, 1);
  assert.equal(screenOf(p), "front");
});

test("R32 R33 a page opened on a locked session draws front locked; front's own unlock (under the locked session's token) returns to the page kept", async () => {
  const { world, me } = await inWorld();
  idleFor(world, me, 31);
  const p = await bootAs(world, me, { screens: SCREENS, path: "/app/held" });
  assert.equal(screenOf(p), "front");
  assert.equal(p.doc.getElementById("state").textContent, "fx t state locked");
  assert.equal(p.doc.getElementById("f-handle").value, me.handle, "the handle the record names");
  assert.equal(lockOf(p), null, "front draws the lock itself");
  p.doc.getElementById("f-pass").value = passwordOf(world, me);
  await p.click('button[data-act="unlock"]');
  assert.equal(p.byOp("unlock")[0].headers.Authorization, "Bearer " + me.token);
  assert.equal(p.location.pathname, "/app/held");
  assert.equal(screenOf(p), "held");
});

/* the Members screen, with the act that asks the password again: adding an administrator is one of the weighty acts (credentials R66) */
const ADDING = { ...MEMBERS, acts: [{ op: "memberadd", send: new Function("view", "el", "cs", 'return { body: { memberId: "new-admin", cover: "The new administrator", role: "admin" } };') }] };
const press = async (p, reason = "because") => {
  await p.click('button[data-act="memberadd"]');
  const box = p.root().querySelector("textarea");
  if (box) { box.value = reason; await p.click('[data-shell="reason-send"]'); }
};

test("R34 an act answered REAUTH_DUE opens the password dialog (session.reauth), sends reauth, and on success sends the act once more", async () => {
  const { world, me } = await inWorld();
  const p = await bootAs(world, me, { screens: [...SCREENS.filter((s) => s.id !== "members"), ADDING], path: "/app/members" });
  await press(p);
  const dlg = p.root().querySelector('[data-overlay="reauth"]');
  assert.ok(dlg, "the store's REAUTH_DUE opened the dialog");
  assert.ok(dlg.textContent.includes(word("session.reauth")));
  /* control: a wrong password resends nothing */
  p.doc.getElementById("cs-reauth-pw").value = "nope";
  await p.click('[data-shell="reauth"]');
  assert.equal(p.byOp("memberadd").length, 1);
  assert.ok(p.root().querySelector('[data-overlay="reauth"] [data-gap="refused"]'));
  p.doc.getElementById("cs-reauth-pw").value = passwordOf(world, me);
  await p.click('[data-shell="reauth"]');
  assert.equal(p.root().querySelector('[data-overlay="reauth"]'), null);
  const [first, again] = p.byOp("memberadd").map((r) => r.body);
  assert.equal(p.byOp("memberadd").length, 2);
  assert.deepEqual(again, first, "sent once more, the same");
  assert.deepEqual(p.byOp("reauth").map((r) => [r.headers.Authorization, r.body.password]), [["Bearer " + me.token, "nope"], ["Bearer " + me.token, passwordOf(world, me)]]);
  const added = (await me.read("memberlist")).members.map((m) => m.memberId || m.member_id || m.id);
  assert.ok(added.includes("new-admin"), "the second send was served: the store holds the member");
});

test("R34 cancelling the password dialog sends nothing more; cs.reauth() answers whether the window opened", async () => {
  const { world, me } = await inWorld();
  const p = await bootAs(world, me, { screens: [...SCREENS.filter((s) => s.id !== "members"), ADDING], path: "/app/members" });
  await press(p);
  await p.click('[data-shell="reauth-cancel"]');
  assert.equal(p.root().querySelector('[data-overlay="reauth"]'), null);
  assert.equal(p.byOp("memberadd").length, 1);
  assert.equal(p.byOp("reauth").length, 0);
  const s = { id: "account", reads: () => ({}), acts: [{ op: "setpassword", async send(view, el, cs) { cs.set("got", String(await cs.reauth())); return null; } }],
    render: (cs, view) => cs.act("setpassword", { data: { got: view.ui.got || "" } }) };
  const q = await bootAs(world, me, { screens: [s], path: "/app/account" });
  await q.click('button[data-act="setpassword"]');
  if (q.root().querySelector('[data-shell="reason-send"]')) { q.root().querySelector("textarea").value = "r"; await q.click('[data-shell="reason-send"]'); }
  q.doc.getElementById("cs-reauth-pw").value = passwordOf(world, me);
  await q.click('[data-shell="reauth"]');
  assert.equal(q.root().querySelector('button[data-act="setpassword"]').getAttribute("data-got"), "true");
});

test("R33 (the harness for the screens' tests) clock.tickActive runs the page clock with the member's input every ten minutes: no lock and no sign-out over days; control: tick alone locks", async () => {
  const p = await boot({ screens: SCREENS, plane: { projectdirectory: ok({ projects: [] }) } });
  await p.clock.tickActive(3 * 24 * 60 * MIN);
  assert.equal(lockOf(p), null);
  assert.equal(p.byOp("signout").length, 0);
  await p.clock.tick(31 * MIN);
  assert.ok(lockOf(p));
});

test("R33 (K3156) activity counts only while a session record exists: with none (the public frame before sign-in) the member's input stores nothing, bio-session:active included; control: signed in, it is stored", async () => {
  const p = await boot({ screens: SCREENS, session: null, path: "/app" });
  assert.equal(screenOf(p), "front");
  const keys = () => [...p.local.keys()].sort();
  const was = keys();
  for (const type of ["keydown", "pointerdown", "touchstart", "wheel"]) p.fire(p.doc.body, type, { key: "a" });
  p.doc.getElementById("f-handle").value = "mai";
  await p.click(p.doc.getElementById("f-handle"));
  await p.clock.tick(11 * 1000);
  p.fire(p.doc.body, "keydown", { key: "b" });
  await p.settle();
  assert.deepEqual(keys(), was, "nothing stored");
  assert.equal(p.local.has(STORE_KEY + ":active"), false);
  const q = await boot({ screens: SCREENS, plane: { projectdirectory: ok({ projects: [] }) } });
  await q.clock.tick(11 * 1000);
  q.fire(q.doc.body, "keydown", { key: "a" });
  assert.ok(q.local.has(STORE_KEY + ":active"));
});
