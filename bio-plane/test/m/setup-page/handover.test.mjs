/* The session record the interface takes over (R31), where a member lands after signing in (R32) and the test-instance
   notice (R33), at the page's interface: its script over the fixture's document stand-in, driven by a scripted plane. */
import test from "node:test";
import assert from "node:assert/strict";
import { PAGE_HTML, SESSION_STORE_KEY, HOME_HREF } from "../../../src/setup-page/index.mjs";
import { pageOver, bearerOf } from "./fixture.mjs";

const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 30; i++) await tick(); };
const SENTINEL = "sess-SENTINEL-7f3a";
const CLAIMED_AT = "2026-10-01T09:00:00Z";
const TEST_WORDS = "This group's Civicsmith is for testing. Parts of its assistant have not yet passed Civicsmith's tests; each answer they give says so.";

/* A scripted plane: `boot` is bootstrap's answer (an Error: it does not answer); `login` op=login's. */
function plane({ boot = { claimed: true, version: "v1", consumedAt: CLAIMED_AT }, login = { ok: true, token: SENTINEL, expires: 1893456000000 },
                 enroll = { ok: true, memberId: "sam" } } = {}) {
  const sent = [];
  const fetch = async (url, init) => {
    const u = new URL(url, "https://copy.example");
    const op = u.searchParams.get("op");
    sent.push({ op, href: u.href, body: init && init.body ? JSON.parse(init.body) : null, token: bearerOf(init) });
    if (op === "bootstrap" && boot instanceof Error) throw boot;
    const out = op === "bootstrap" ? boot
      : op === "login" ? { result: login }
      : op === "claim" ? { result: { ok: true, consumedAt: CLAIMED_AT } }
      : op === "invitelook" ? { result: { ok: true, cover: "c", role: "member", capabilities: ["read"] } }
      : op === "enroll" ? { result: enroll }
      : op === "whoami" ? { result: { capabilities: ["contribute"], administer: true } }
      : op === "recoverycodesissue" ? { result: { ok: true, codes: Array.from({ length: 10 }, (_, i) => `code-${i}`), issuedAt: CLAIMED_AT } }
      : { ok: true, result: { ok: true } };
    return { ok: true, status: 200, json: async () => out };
  };
  return { sent, fetch };
}
/* the page with a spy on every place a session record could be kept other than sessionStorage */
function open(pl, opts = {}) {
  const elsewhere = [];
  const localStorage = { getItem: () => null, setItem: (k, v) => elsewhere.push(["localStorage", k, v]), removeItem() {} };
  const p = pageOver({ html: PAGE_HTML, fetch: pl.fetch, globals: { localStorage }, ...opts });
  p.el("#claim-after").hidden = true; p.el("#test-instance").hidden = true;   // as the markup carries them
  /* where the page goes, and the record as it stands at that moment */
  const left = [];
  p.sandbox.location.assign = (u) => { left.push({ to: String(u), record: p.sandbox.sessionStorage.getItem(SESSION_STORE_KEY) }); };
  return { ...p, elsewhere, left };
}
const signIn = async (p, who, password = "a-long-password") => {
  p.el("#lwho").value = who; p.el("#lpw").value = password;
  await p.el("#do-login").fire(); await settle();
};

test("R31 the session record is stated and exported as SESSION_STORE_KEY \"bio-session\", in sessionStorage only, with the shape {t, e, c, w}: the token op=login answers, its expiry (0 when none), the claim's instant (\"\" when unread), the name signed in with", async () => {
  assert.equal(SESSION_STORE_KEY, "bio-session");
  const cases = [
    ["a member", "ada", { boot: { claimed: true, consumedAt: CLAIMED_AT } }, { t: SENTINEL, e: 1893456000000, c: CLAIMED_AT, w: "ada" }],
    ["the administrator", "", { boot: { claimed: true, consumedAt: CLAIMED_AT } }, { t: SENTINEL, e: 1893456000000, c: CLAIMED_AT, w: "admin" }],
    ["no expiry answered", "ada", { login: { ok: true, token: SENTINEL } }, { t: SENTINEL, e: 0, c: CLAIMED_AT, w: "ada" }],
    ["the claim's instant unread", "ada", { boot: { claimed: true } }, { t: SENTINEL, e: 1893456000000, c: "", w: "ada" }],
  ];
  for (const [name, who, opts, want] of cases) {
    const pl = plane(opts);
    const p = open(pl);
    await settle();
    await signIn(p, who);
    const record = JSON.parse(p.sandbox.sessionStorage.getItem(SESSION_STORE_KEY));
    assert.deepEqual(record, want, name);
    assert.deepEqual(Object.keys(record), ["t", "e", "c", "w"], name);
    /* never localStorage, a cookie or an address */
    assert.deepEqual(p.elsewhere, [], name);
    assert.equal(p.sandbox.document.cookie, undefined, name);
    assert.ok(pl.sent.every((c) => !c.href.includes(SENTINEL) && !JSON.stringify(c.body ?? "").includes(SENTINEL)), name);
    assert.ok(p.left.every((x) => !x.to.includes(SENTINEL)), name);
  }
  /* the founder's claim keeps the same record, with the claim's instant */
  const pl = plane({ boot: { claimed: false, bootstrapConfigured: true }, login: { ok: true, token: SENTINEL, expires: 0 } });
  const f = open(pl, { hash: "#boot=one-time" });
  await settle();
  f.el("#pw1").value = "the-founders-password"; f.el("#pw2").value = "the-founders-password";
  await f.el("#do-claim").fire(); await settle();
  assert.deepEqual(JSON.parse(f.sandbox.sessionStorage.getItem(SESSION_STORE_KEY)), { t: SENTINEL, e: 0, c: CLAIMED_AT, w: "admin" });
  /* the record the page reads on load is the one under that key; a 401 removes it */
  const q = plane();
  const r = open({ ...q, fetch: async (url, init) => (new URL(url, "https://copy.example").searchParams.get("op") === "stats"
    ? { ok: false, status: 401, json: async () => ({}) } : q.fetch(url, init)) }, { session: { t: SENTINEL, e: 0, c: "", w: "ada" } });
  await settle();
  assert.equal(r.sandbox.sessionStorage.getItem(SESSION_STORE_KEY), null);
  assert.deepEqual(r.shown(), ["#s-login"]);
});

test("R32 after a member signs in through op=login the page takes her to /app with the session handed over by R31's record; the panel offers \"Open your group's Civicsmith\" (/app); a saved session shows the panel and does not leave. Control: a refused login stays on the page with its refusal", async () => {
  assert.equal(HOME_HREF, "/app");
  for (const who of ["ada", ""]) {
    const pl = plane();
    const p = open(pl);
    await settle();
    await signIn(p, who);
    assert.deepEqual(p.left.map((x) => x.to), ["/app"], who);
    assert.equal(JSON.parse(p.left[0].record).t, SENTINEL, "the record is written before she leaves");
    assert.equal(pl.sent.at(-1).op, "bootstrap", "nothing is asked after the hand-over");
  }
  /* control: refused, she stays with the plane's own words */
  const pl = plane({ login: { ok: false, reason: "SIGN_IN_REFUSED", detail: "That name and password were not accepted, or no such name holds one." } });
  const p = open(pl);
  await settle();
  await signIn(p, "ada");
  assert.deepEqual(p.left, []);
  assert.deepEqual(p.shown(), ["#s-login"]);
  assert.equal(p.el("#login-err").textContent, "That name and password were not accepted, or no such name holds one.");
  assert.equal(p.sandbox.sessionStorage.getItem(SESSION_STORE_KEY), null);
  /* enrolment's sign-in: the language sent under the new session, then Home */
  const e = plane({ login: { ok: true, token: "sess-sam", expires: 0 } });
  const en = open(e, { hash: "#invite=tok-1" });
  await settle();
  en.el("#en-handle").value = "sam"; en.el("#en-pw").value = "sams-password-1"; en.el("#en-pw2").value = "sams-password-1"; en.el("#en-lang").value = "es";
  await en.el("#en-go").fire(); await settle();
  assert.deepEqual(en.left.map((x) => x.to), ["/app"]);
  assert.deepEqual(e.sent.at(-1), { ...e.sent.at(-1), op: "memberlanguageset", body: { language: "es" }, token: "sess-sam" });
  assert.equal(JSON.parse(en.left[0].record).w, "sam");
  /* control: enrolment whose sign-in is refused shows the sign-in form, and does not leave */
  const x = plane({ login: { ok: false, reason: "SIGN_IN_REFUSED" } });
  const xn = open(x, { hash: "#invite=tok-1" });
  await settle();
  xn.el("#en-handle").value = "sam"; xn.el("#en-pw").value = "sams-password-1"; xn.el("#en-pw2").value = "sams-password-1";
  await xn.el("#en-go").fire(); await settle();
  assert.deepEqual([xn.left, xn.shown()], [[], ["#s-login"]]);
  /* the panel's link, beside its settings sections; a saved session shows the panel and stays */
  const panel = PAGE_HTML.slice(PAGE_HTML.indexOf('<section id="s-panel">'), PAGE_HTML.indexOf("</section>", PAGE_HTML.indexOf('<section id="s-panel">')));
  assert.match(panel, /<a class="filelink" id="go-app" href="\/app">Open your group's Civicsmith<\/a>/);
  assert.ok(panel.indexOf('id="go-app"') < panel.indexOf('id="go-members"'), "beside the settings sections");
  const s = open(plane(), { session: { t: SENTINEL, e: 0, c: CLAIMED_AT, w: "ada" } });
  await settle();
  assert.deepEqual([s.shown(), s.left], [["#s-panel"], []]);
  /* the founder's claim keeps its steps and offers the same link once they are done or left */
  const claimAfter = PAGE_HTML.slice(PAGE_HTML.indexOf('<div id="claim-after" hidden>'), PAGE_HTML.indexOf('<section id="s-login">'));
  assert.match(claimAfter, /<a class="filelink" id="cl-app" href="\/app">Open your group's Civicsmith<\/a>/);
  for (const id of ["cl-rc", "cl-sa", "cl-ha", "cl-cn", "cl-ka", "cl-gk", "cl-st"])
    assert.ok(claimAfter.indexOf(`id="${id}"`) < claimAfter.indexOf('id="cl-app"'), `${id} before the link`);
  const f = open(plane({ boot: { claimed: false, bootstrapConfigured: true } }), { hash: "#boot=one-time" });
  await settle();
  f.el("#pw1").value = "the-founders-password"; f.el("#pw2").value = "the-founders-password";
  await f.el("#do-claim").fire(); await settle();
  assert.deepEqual([f.el("#claim-after").hidden, f.left], [false, []], "the claim keeps its section and does not leave");
});

test("R33 while op=bootstrap answers test_instance true, every visitor, signed in or not, is shown on the first view and the healthy panel that this group's Civicsmith is for testing, with no act and no value of the setting. Control: test_instance false, or bootstrap not answering, shows nothing", async () => {
  /* the notice holds no act and names no setting */
  const at = PAGE_HTML.indexOf('id="test-instance"');
  const notice = PAGE_HTML.slice(PAGE_HTML.lastIndexOf("<div", at), PAGE_HTML.indexOf("</div>", at) + 6);
  assert.doesNotMatch(notice, /<button|<a |<input|<select/);
  assert.ok(at < PAGE_HTML.indexOf('<section id="s-loading"'), "above every section");
  const views = [
    ["claim", { boot: { claimed: false, bootstrapConfigured: true } }, { hash: "#boot=x" }, ["#s-claim"]],
    ["sign-in", { boot: { claimed: true } }, {}, ["#s-login"]],
    ["unarmed", { boot: { claimed: false, bootstrapConfigured: false } }, {}, ["#s-unarmed"]],
    ["the healthy panel", { boot: { claimed: true } }, { session: { t: SENTINEL, e: 0, c: "", w: "ada" } }, ["#s-panel"]],
    ["an invitation", { boot: { claimed: true } }, { hash: "#invite=tok-1" }, ["#s-enroll"]],
    ["a join link", { boot: { claimed: true } }, { hash: "#join=jl-1" }, ["#s-enroll"]],
  ];
  for (const [name, opts, page, shown] of views) {
    for (const [ti, on] of [[true, true], [false, false], [undefined, false], ["true", false], [1, false]]) {
      const boot = { ...opts.boot, ...(ti === undefined ? {} : { test_instance: ti }) };
      const p = open(plane({ ...opts, boot }), page);
      await settle();
      assert.deepEqual(p.shown(), shown, `${name} ${ti}`);
      assert.equal(p.el("#test-instance").hidden, !on, `${name} ${ti}`);
      assert.equal(p.el("#test-instance-words").textContent, on ? TEST_WORDS : "", `${name} ${ti}`);
      assert.doesNotMatch(p.el("#test-instance-words").textContent, /CIVICSMITH_TEST_INSTANCE|INSTANCE_NAME|biosmoke/);
    }
    /* control: bootstrap not answering shows nothing */
    const q = open(plane({ ...opts, boot: new Error("down") }), page);
    await settle();
    assert.deepEqual([q.el("#test-instance").hidden, q.el("#test-instance-words").textContent], [true, ""], `${name}, not answering`);
  }
  /* the founder going on from the claim to the panel still sees it */
  const f = open(plane({ boot: { claimed: false, bootstrapConfigured: true, test_instance: true } }), { hash: "#boot=one-time" });
  await settle();
  f.el("#pw1").value = "the-founders-password"; f.el("#pw2").value = "the-founders-password";
  await f.el("#do-claim").fire(); await settle();
  await f.el("#claim-on").fire(); await settle();
  assert.deepEqual([f.shown(), f.el("#test-instance").hidden, f.el("#test-instance-words").textContent], [["#s-panel"], false, TEST_WORDS]);
});
