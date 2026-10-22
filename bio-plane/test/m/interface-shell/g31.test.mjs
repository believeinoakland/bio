/* interface-shell R127 (fix round 6, G31; A-27): a first sign-in sends each `(op, query)` once. The walker counted 49 requests at the first load after
   sign-in, `queue` twice. Two things were found by driving the real sign-in route (the real `front` screen's `login` act, then the real Queue screen
   over the real screens of the nine modules): the open list and the muted list are two queries of one op by design, and the whole open list asks the
   frame no `count`; but `front` hands the session over twice (once to stay and read `whoami`, once to open the page kept), and the shell took each
   for a new session: `whoami`, `interfacewords` and the six frame reads went out twice. Each test was seen failing first. */
import "./register.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, tabs, ADMIN, STORE_KEY, settle } from "./harness.mjs";

const MODS = ["screens-settings", "screens-intake", "screens-daily", "screens-inquiry", "screens-entry", "screens-wizards", "screens-investigate", "screens-publish", "screens-action"];
const REAL = []; let GUIDE = null;
for (const m of MODS) { const x = await import(`../../../src/${m}/index.mjs`); REAL.push(...x.SCREENS); if (x.GUIDE) GUIDE = x.GUIDE; }
const SIX = ["groupidentity", "infolevel", "assistantstate", "accountreference", "subscriptionsignin", "groupkeystate"];
/* `queue`'s answer in the shape the op makes it (`queue/index.mjs` `queueFeed`: `ok`, `member`, `items`, `limit`, `sort`, `item_count`, `truncated`, ...),
   the open list whole, the muted list and the count */
const WHOLE = [{ id: "t1", class: "OBLIGATION", title: "Reply" }, { id: "t2", class: "FINDING", title: "A lease" }, { id: "t3", class: "CONDITION", title: "Held" }];
const liveQueue = (items = WHOLE, o = {}) => (req) => (req.query.count ? ok({ ok: true, member: "rosa", count: items.length })
  : req.query.muted ? ok({ ok: true, member: "rosa", muted: [], count: 0 })
    : ok({ ok: true, member: "rosa", items, limit: 200, sort: null, item_count: items.length, truncated: false, classes: ["OBLIGATION", "FINDING", "CONDITION"], ...o }));
const PLANE = (more = {}) => ({ whoami: ok({ ...ADMIN, capabilities: ["contribute", "administer"] }), assistantstate: ok({ on: true }), accountreference: ok({ held: true }),
  login: ok({ ok: true, token: "tok-new", expires: 0 }), queue: liveQueue(), ...more });
const sig = (r) => r.op + " " + JSON.stringify(Object.fromEntries(Object.entries(r.query).filter(([k]) => k !== "op" && k !== "background"))) + (r.body === undefined ? "" : " " + JSON.stringify(r.body));
const repeats = (reqs) => { const n = new Map(); for (const r of reqs) n.set(sig(r), (n.get(sig(r)) || 0) + 1); return [...n].filter(([, c]) => c > 1).map(([s, c]) => s + " x" + c); };
/* the member signs in on the real `front` screen at `path`: the handle and the password typed, the login act pressed; answers the page and the requests the press caused */
async function signIn(path, plane = PLANE(), o = {}) {
  const p = await boot({ screens: REAL, guide: GUIDE, path, session: null, plane, ...o });
  p.doc.getElementById("fs-handle").value = "rosa";
  p.doc.getElementById("fs-pw").value = "a long password";
  const before = p.requests.length;
  await p.click('button[data-act="login"]');
  await settle(120);
  return { p, after: p.requests.slice(before) };
}

test("R127 (G31, A-27) a first sign-in on the real front screen, returning to Queue, sends each (op, query, body) once: whoami, the words and the six frame reads go out once, not twice", async () => {
  const { p, after } = await signIn("/app/queue");
  assert.equal(p.location.pathname, "/app/queue", "the page kept is opened");
  assert.ok(p.doc.getElementById("cs-main").getAttribute("data-screen") === "queue", "the Queue screen is drawn");
  assert.deepEqual(repeats(after), [], "no request twice");
  for (const op of ["login", "whoami", "interfacewords", ...SIX]) assert.equal(after.filter((r) => r.op === op).length, 1, op);
  assert.ok(after.length >= 12 && after.length <= 18, "the load's whole set: " + after.length);
});

test("R127 (G31) the same on Home: the first sign-in sends each request once", async () => {
  const { p, after } = await signIn("/app");
  assert.equal(p.location.pathname, "/app");
  assert.deepEqual(repeats(after), []);
  assert.equal(after.filter((r) => r.op === "whoami").length, 1);
});

test("R127 (G31) the session is handed over once: the record is written once, for the other tabs' one storage event, and the sign-in is complete (a member, the Queue's rail count, the masthead's initial)", async () => {
  const p = await boot({ screens: REAL, guide: GUIDE, path: "/app/queue", session: null, plane: PLANE() });
  const writes = [], set = p.win.localStorage.setItem;
  p.win.localStorage.setItem = (k, v) => { if (k === STORE_KEY) writes.push(v); return set(k, v); };
  p.doc.getElementById("fs-handle").value = "rosa";
  p.doc.getElementById("fs-pw").value = "a long password";
  await p.click('button[data-act="login"]');
  await settle(120);
  assert.deepEqual(writes.map((w) => JSON.parse(w)), [{ t: "tok-new", e: 0, d: "own", w: "rosa" }], "the record written once");
  assert.equal(p.root().querySelector(".cs-rail a .count").textContent, "3");
  assert.equal(p.root().querySelector(".mk-avatar span").textContent, "R");
});

test("R127 (G31) control: another member signing in over a live session is a new session, whoami and the frame read again; and a hand-over of a different handle or device rewrites the record", async () => {
  const stand = { id: "front", words: [], reads: () => ({}),
    acts: [{ op: "login", rereads: [], send: new Function("view", "el", "cs", 'return { body: { handle: "x", password: "y", device: "own" } };'),
      done: new Function("view", "answer", "cs", 'var a = answer.result !== undefined ? answer.result : answer; return cs.signin(a, { device: "own", handle: "rosa", stay: true }).then(function () { return { stay: true }; });') }],
    render: new Function("cs", "view", 'return cs.act("login");') };
  const answers = [ok({ ok: true, token: "tok-a", expires: 0 }), ok({ ok: true, token: "tok-b", expires: 0 })];
  let n = 0;
  const p = await boot({ screens: [stand], path: "/app", session: null, plane: PLANE({ login: () => answers[n++] }) });
  await p.click('button[data-act="login"]');
  await settle(60);
  assert.equal(p.byOp("whoami").length, 1);
  await p.click('button[data-act="login"]');
  await settle(60);
  assert.equal(p.byOp("whoami").length, 2, "a different token is a new session");
  assert.equal(JSON.parse(p.local.get(STORE_KEY)).t, "tok-b");
  assert.ok(p.byOp("groupidentity").length >= 2, "the frame is read again for it");
});

test("R127 (G31) control: two tabs on one browser: the tab that did not sign in routes once on the sign-in, and the tab that did sends its own set once", async () => {
  const group = tabs();
  const a = await boot({ screens: REAL, guide: GUIDE, path: "/app/queue", session: null, plane: PLANE(), tabs: group });
  const b = await boot({ screens: REAL, guide: GUIDE, path: "/app/queue", session: null, plane: PLANE(), tabs: group });
  a.doc.getElementById("fs-handle").value = "rosa";
  a.doc.getElementById("fs-pw").value = "a long password";
  const nb = b.requests.length, na = a.requests.length;
  await a.click('button[data-act="login"]');
  await settle(120);
  assert.deepEqual(repeats(a.requests.slice(na)), []);
  assert.deepEqual(repeats(b.requests.slice(nb)), [], "the other tab's one set, nothing twice");
  assert.equal(b.requests.slice(nb).filter((r) => r.op === "whoami").length, 1);
});

test("R7 R123 (G31, A-27) the Queue draws the real op's whole open list and asks no count: the open list and the muted list are two queries of one op by design, each sent once, and the frame's number is the list's", async () => {
  const p = await boot({ screens: REAL, guide: GUIDE, path: "/app/queue", plane: PLANE() });
  const q = p.byOp("queue").map(sig);
  assert.deepEqual(q.sort(), ['queue {"muted":"true"}', "queue {}"].sort(), "the open list and the muted list, once each");
  assert.equal(p.byOp("queue").filter((r) => r.query.count).length, 0, "no count read");
  assert.equal(p.root().querySelector(".cs-rail a .count").textContent, "3");
});

test("R7 R123 (G31) control: an open list the op cut (truncated true) is the one case the frame asks for the count, once", async () => {
  const p = await boot({ screens: REAL, guide: GUIDE, path: "/app/queue", plane: PLANE({ queue: liveQueue(WHOLE, { truncated: true }) }) });
  assert.equal(p.byOp("queue").filter((r) => r.query.count).length, 1);
  assert.deepEqual(repeats(p.requests), []);
});
