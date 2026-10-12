/* interface-shell R3, R4, R24: the session the setup page hands over, its token only in the Authorization header, sign
   out, and nothing kept of who opened what. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, refused, silent, MEMBER, settle } from "./harness.mjs";
import { ALL } from "./screens.fixture.mjs";
import { SESSION_STORE_KEY } from "../../../src/setup-page/index.mjs";

const SENTINEL = "SENTINEL-tok-7f3a";
const IMAGE = ok({ title: "A lease", pages: 3, grade: "B", why: "w", project: { id: "P1", title: "Pothole repairs" }, passages: [{ n: 1, text: "Closed" }] });
const HELD = ok({ items: [{ id: "h1", title: "Minutes", at: "2026-10-01" }, { id: "h2", title: "Budget", at: "2026-10-02" }] });

test("R3 no session record, or an expired one: the page goes to / and draws nothing else, sending nothing", async () => {
  for (const session of [null, { t: "x", e: Date.now() - 1000, c: "", w: "member" }, { t: "", e: 0 }]) {
    const p = await boot({ screens: ALL, session });
    assert.deepEqual(p.assigned, ["/"]);
    assert.equal(p.requests.length, 0);
    assert.equal(p.root().innerHTML, "");
  }
  /* control: a live record is read, by the setup page's key */
  assert.equal(SESSION_STORE_KEY, "bio-session");
  const q = await boot({ screens: ALL, session: { t: "x", e: Date.now() + 60_000, c: "", w: "member" } });
  assert.deepEqual(q.assigned, []);
  assert.equal(q.requests[0].op, "whoami");
});

test("R3 a whoami answer without a member session (session false or member empty), or none, is treated as none", async () => {
  for (const whoami of [ok({ ...MEMBER, session: false }), ok({ ...MEMBER, member: "" }), ok({ ...MEMBER, member: null }), refused("NOT_AUTHENTICATED"), silent]) {
    const p = await boot({ screens: ALL, plane: { whoami } });
    assert.deepEqual(p.assigned, ["/"]);
    assert.equal(p.requests.length, 1);
  }
});

test("R3 a 401 answer to any request clears the record and goes to /", async () => {
  for (const op of ["whoami", "interfacewords", "heldcaptures", "groupidentity"]) {
    const p = await boot({ screens: ALL, path: "/app/held", plane: { [op]: refused("MEMBER_TOKEN_RETIRED", null, 401), heldcaptures: op === "heldcaptures" ? refused("X", null, 401) : HELD } });
    assert.deepEqual(p.assigned, ["/"], op);
    assert.equal(p.store.has("bio-session"), false, op);
  }
  /* control: a 403 refusal signs nobody out */
  const q = await boot({ screens: ALL, path: "/app/held", plane: { heldcaptures: refused("NOT_ALLOWED", null, 403) } });
  assert.deepEqual(q.assigned, []);
  assert.equal(q.store.has("bio-session"), true);
});

test("R3 driving every screen and act with a sentinel token, the token is in each request's Authorization header and nowhere else: no address, query, body, link drawn or history entry", async () => {
  const pushed = [];
  for (const path of ["/app", "/app/held", "/app/document/c1", "/app/members", "/app/settings", "/app/people", "/app/nowhere"]) {
    const p = await boot({ screens: ALL, path, session: { t: SENTINEL, e: 0, c: "", w: "member" },
      plane: { image: IMAGE, heldcaptures: HELD, whoami: ok({ ...MEMBER, administer: true }), assistantstate: ok({ on: true }), accountreference: ok({ held: true }) } });
    const ph = p.win.history.pushState;
    p.win.history.pushState = (s, t, u) => { pushed.push(u); ph(s, t, u); };
    for (const b of p.root().querySelectorAll("button[data-act]")) { await p.click(b); for (const c of p.root().querySelectorAll('[data-shell="confirm"], [data-shell="reason-send"]')) { const ta = p.root().querySelector("textarea"); if (ta) ta.value = "because"; await p.click(c); } }
    for (const a of p.root().querySelectorAll("a[data-nav]").slice(0, 4)) await p.click(a);
    for (const r of p.requests) {
      assert.equal(r.headers.Authorization, "Bearer " + SENTINEL, r.op);
      assert.ok(!r.url.includes(SENTINEL), r.url);
      assert.ok(!JSON.stringify(r.body ?? "").includes(SENTINEL), r.op);
    }
    assert.ok(!p.root().innerHTML.includes(SENTINEL));
    assert.ok(!pushed.some((u) => u.includes(SENTINEL)));
    assert.ok(p.requests.length > 5);
  }
});

test("R3 (K2998) cs.call with a bearer sends that credential alone, for that request only; without one, the session", async () => {
  const screen = { id: "assistant", reads: () => ({}), acts: [{ op: "airunopen", async send(view, el, cs) { await cs.call("airun", { query: { run: "r1" }, bearer: "AI-CRED-1" }); await cs.call("airunlog", {}); return null; } }],
    render: (cs) => cs.act("airunopen") };
  const p = await boot({ screens: [screen], plane: { assistantstate: ok({ on: true }), accountreference: ok({ held: true }) } });
  await p.click('[data-shell="dock"]');
  await p.click('button[data-act="airunopen"]');
  const [run] = p.byOp("airun"), [log] = p.byOp("airunlog");
  assert.equal(run.headers.Authorization, "Bearer AI-CRED-1");
  assert.ok(!JSON.stringify(run).includes("tok-1"), "no session token on it");
  assert.equal(log.headers.Authorization, "Bearer tok-1");
  /* a 401 to the bearer's own request signs nobody out */
  const q = await boot({ screens: [screen], plane: { airun: refused("AI_CREDENTIAL_EXPIRED", null, 401), assistantstate: ok({ on: true }), accountreference: ok({ held: true }) } });
  await q.click('[data-shell="dock"]');
  await q.click('button[data-act="airunopen"]');
  assert.deepEqual(q.assigned, []);
});

test("R4 the member's initial opens a menu with Sign out: it sends op=signout, then clears the record and goes to /, whatever the answer", async () => {
  for (const signout of [ok({ ok: true }), refused("NO"), silent]) {
    const p = await boot({ screens: ALL, plane: { signout } });
    const menu = p.root().querySelector('[data-shell="menu"]');
    assert.equal(menu.textContent.trim().startsWith("M"), true, "the initial");
    assert.equal(p.root().querySelector("#cs-menu").hidden, true);
    await p.click(menu);
    assert.equal(p.root().querySelector("#cs-menu").hidden, false);
    const so = p.root().querySelector('[data-shell="signout"]');
    assert.equal(so.textContent, "Sign out");
    await p.click(so);
    assert.equal(p.byOp("signout").length, 1);
    assert.deepEqual(p.assigned, ["/"]);
    assert.equal(p.store.has("bio-session"), false);
  }
});

test("R24 nothing the shell does records who opened what: no storage holds a read or a screen visited, and no request but the screens' own reads and acts and the frame's", async () => {
  const p = await boot({ screens: ALL, path: "/app/held", plane: { heldcaptures: HELD, image: IMAGE } });
  for (const a of p.root().querySelectorAll("a[data-nav]")) await p.click(a);
  await p.click(p.root().querySelector('a[href="/app/held"]') || p.root().querySelector("a[data-nav]"));
  for (const k of p.local.keys()) assert.match(k, /^cs-(level|theme|railw|level-asked|first:[\w-]*)$/, k);
  for (const v of p.local.values()) assert.doesNotMatch(v, /held|document|home|members|\/app/);
  assert.deepEqual([...p.store.keys()], ["bio-session"]);
  const ALLOWED = new Set(["whoami", "interfacewords", "groupidentity", "queue", "infolevel", "assistantstate", "accountreference", "subscriptionsignin", "groupkeystate", "heldcaptures", "projectdirectory", "image"]);
  for (const r of p.requests) assert.ok(ALLOWED.has(r.op), r.op);
  await settle();
});
