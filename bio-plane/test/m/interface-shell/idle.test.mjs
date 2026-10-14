/* interface-shell R33, R34: idle limits on the page's clock (the plane governing), background reads, the lock over the
   screen, and the password asked again. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, refused, STORE_KEY } from "./harness.mjs";
import { ALL, FRONT } from "./screens.fixture.mjs";

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
  assert.ok(lockOf(p).textContent.includes("Locked after 30 minutes away"));
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
  assert.equal(p.doc.getElementById("state").textContent, "State: ended");
  assert.equal(lockOf(p), null, "a shared device is never locked");
});

test("R33 every read the shell makes on its own timers carries background=1 (cs.later's calls, the queue count); the member's own reads and acts do not", async () => {
  const s = { id: "held", reads: () => ({ h: { op: "heldcaptures" } }), acts: [{ op: "heldrestore" }],
    render: (cs, view) => { if (!view.ui.armed) { view.ui.armed = true; cs.later(300000, (c) => c.call("heldcaptures", { query: { timer: "1" } })); } return cs.act("heldrestore"); } };
  const p = await boot({ screens: [s], path: "/app/held", plane: { heldcaptures: HELD } });
  assert.equal(p.byOp("queue")[0].query.background, "1");
  assert.equal(p.byOp("heldcaptures")[0].query.background, undefined, "the screen's own read");
  await p.clock.tick(5 * MIN);
  const timed = p.byOp("heldcaptures").find((r) => r.query.timer === "1");
  assert.equal(timed.query.background, "1");
  /* control: a timer's read alone never keeps the page awake: the lock still comes at 30 minutes */
  await p.clock.tick(25 * MIN + 1);
  assert.ok(lockOf(p));
});

test("R33 the plane governs over the page's clock: SESSION_LOCKED to any request draws the lock at once; a 401 ends the session at once", async () => {
  const p = await boot({ screens: SCREENS, path: "/app/held", plane: { heldcaptures: refused("SESSION_LOCKED", "Locked.", 403) } });
  assert.ok(lockOf(p), "locked at the plane's word, minutes before the page's own limit");
  const q = await boot({ screens: SCREENS, path: "/app/held", plane: { heldcaptures: refused("SESSION_ENDED", null, 401) } });
  assert.equal(screenOf(q), "front");
});

test("R33 R34 unlock from the lock returns to the screen as it was; a wrong password keeps it locked and says so", async () => {
  let n = 0;
  const p = await boot({ screens: SCREENS, plane: { projectdirectory: ok({ projects: [] }), unlock: (req) => (++n, req.body.password === "right-one" ? ok({ ok: true }) : refused("SIGN_IN_REFUSED", "That password did not match.")) } });
  p.doc.getElementById("home-title").value = "Kept";
  await p.clock.tick(30 * MIN + 1);
  p.doc.getElementById("cs-lock-pw").value = "wrong";
  await p.click('[data-shell="unlock"]');
  assert.ok(lockOf(p));
  assert.ok(lockOf(p).querySelector('[data-gap="refused"]'), "the refusal said in the lock");
  assert.equal(p.doc.getElementById("cs-lock-pw").value, "", "a typed password never survives its send");
  p.doc.getElementById("cs-lock-pw").value = "right-one";
  await p.click('[data-shell="unlock"]');
  assert.equal(lockOf(p), null);
  assert.equal(p.doc.getElementById("home-title").value, "Kept");
  assert.equal(screenOf(p), "home");
  assert.equal(n, 2);
  assert.deepEqual(p.byOp("unlock").map((r) => [r.headers.Authorization, r.body.password]), [["Bearer tok-1", "wrong"], ["Bearer tok-1", "right-one"]]);
  assert.equal(p.local.has(STORE_KEY + ":state"), false);
  /* the lock's "Not mai?" signs out */
  await p.clock.tick(30 * MIN + 1);
  assert.ok(lockOf(p).textContent.includes("Not mai?"));
  await p.click('[data-shell="lock-other"]');
  assert.equal(p.byOp("signout").length, 1);
  assert.equal(screenOf(p), "front");
});

test("R32 R33 a page opened on a locked session draws front locked; front's own unlock (under the locked session's token) returns to the page kept", async () => {
  let locked = true;
  const plane = { whoami: () => (locked ? refused("SESSION_LOCKED", null, 403) : ok({ tokenClass: "member", session: true, member: "mai", handle: "mai", administer: false, capabilities: ["contribute"] })),
    unlock: () => { locked = false; return ok({ ok: true }); }, heldcaptures: HELD };
  const p = await boot({ screens: SCREENS, path: "/app/held", plane });
  assert.equal(screenOf(p), "front");
  assert.equal(p.doc.getElementById("state").textContent, "State: locked");
  assert.equal(p.doc.getElementById("f-handle").value, "mai", "the handle the record names");
  assert.equal(lockOf(p), null, "front draws the lock itself");
  p.doc.getElementById("f-pass").value = "pw";
  await p.click('button[data-act="unlock"]');
  assert.equal(p.byOp("unlock")[0].headers.Authorization, "Bearer tok-1");
  assert.equal(p.location.pathname, "/app/held");
  assert.equal(screenOf(p), "held");
});

test("R34 an act answered REAUTH_DUE opens the password dialog (session.reauth), sends reauth, and on success sends the act once more", async () => {
  let due = true;
  const plane = { projectdirectory: ok({ projects: [] }), promote: () => (due ? refused("REAUTH_DUE", "Enter your password again.", 403) : ok({ project: "P1" })),
    reauth: (req) => { if (req.body.password !== "pw") return refused("SIGN_IN_REFUSED", "No."); due = false; return ok({ ok: true }); } };
  const p = await boot({ screens: SCREENS, plane });
  p.doc.getElementById("home-title").value = "New";
  await p.click('button[data-act="promote"]');
  const dlg = p.root().querySelector('[data-overlay="reauth"]');
  assert.ok(dlg);
  assert.ok(dlg.textContent.includes("For this, enter your password again"));
  /* control: a wrong password resends nothing */
  p.doc.getElementById("cs-reauth-pw").value = "nope";
  await p.click('[data-shell="reauth"]');
  assert.equal(p.byOp("promote").length, 1);
  assert.ok(p.root().querySelector('[data-overlay="reauth"] [data-gap="refused"]'));
  p.doc.getElementById("cs-reauth-pw").value = "pw";
  await p.click('[data-shell="reauth"]');
  assert.equal(p.root().querySelector('[data-overlay="reauth"]'), null);
  assert.deepEqual(p.byOp("promote").map((r) => r.body), [{ title: "New" }, { title: "New" }], "sent once more, the same");
  assert.deepEqual(p.byOp("reauth").map((r) => [r.headers.Authorization, r.body.password]), [["Bearer tok-1", "nope"], ["Bearer tok-1", "pw"]]);
  assert.equal(p.location.pathname, "/app/project/P1", "its done ran");
});

test("R34 cancelling the password dialog sends nothing more; cs.reauth() answers whether the window opened", async () => {
  const plane = { projectdirectory: ok({ projects: [] }), promote: refused("REAUTH_DUE", null, 403) };
  const p = await boot({ screens: SCREENS, plane });
  p.doc.getElementById("home-title").value = "New";
  await p.click('button[data-act="promote"]');
  await p.click('[data-shell="reauth-cancel"]');
  assert.equal(p.root().querySelector('[data-overlay="reauth"]'), null);
  assert.equal(p.byOp("promote").length, 1);
  assert.equal(p.byOp("reauth").length, 0);
  const s = { id: "account", reads: () => ({}), acts: [{ op: "setpassword", async send(view, el, cs) { cs.set("got", String(await cs.reauth())); return null; } }],
    render: (cs, view) => cs.act("setpassword", { data: { got: view.ui.got || "" } }) };
  const q = await boot({ screens: [s], path: "/app/account", plane: { reauth: ok({ ok: true }) } });
  await q.click('button[data-act="setpassword"]');
  if (q.root().querySelector('[data-shell="reason-send"]')) { q.root().querySelector("textarea").value = "r"; await q.click('[data-shell="reason-send"]'); }
  q.doc.getElementById("cs-reauth-pw").value = "pw";
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
