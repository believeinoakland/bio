/* screens-entry R1, R2: `front`, the group's page, and its members' sign-in, at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, has, lacks, said, date, all, actOps, links, texts, hasWord, FOUNDER, OLD_FOUNDER, JOINED } from "./kit.mjs";

const PUBLISHED = {
  bundles: [{ bundle_id: "F-1", edition: 1, title: "The lease amendment", attestor_member: "dev", ratified_at: "2026-11-19T10:00:00Z" },
    { bundle_id: "F-2", edition: 1, title: "Repairs closed", attestor_member: "mai", ratified_at: "2026-10-02T10:00:00Z" }],
  cases: [{ case_id: "CASE-1", edition: 2, findings: ["F-1"], signed_at: "2026-11-19T10:00:00Z" },
    { case_id: "CASE-2", edition: 1, findings: ["F-2"], signed_at: "2026-10-02T10:00:00Z", title: "Pothole repairs" },
    { case_id: "CASE-3", edition: 1, findings: [], withheld: true, signed_at: "2026-09-01T00:00:00Z" }],
};
const TABLE = {
  groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town Tenants", logo: true } },
  groupdescription: { ok: true, result: { description: { focus: "Leases on public land", purpose: "We check the public body's own terms." } } },
  publishedlist: { ok: true, result: PUBLISHED },
};

test("R1 front reads groupidentity, groupdescription and publishedlist, none under a session", async () => {
  const o = await open("front", { table: TABLE });
  assert.deepEqual(o.requests.map((r) => r.op).sort(), ["groupdescription", "groupidentity", "publishedlist"]);
  assert.ok(o.requests.every((r) => r.header === false && r.body === undefined));
});

test("R1 the masthead: the group's name and its logo when set; its public purpose; the foot names Civicsmith", async () => {
  const o = await open("front", { table: TABLE });
  assert.ok(o.text.includes("River Town Tenants"));
  const img = all(o.tree, (e) => e.tag === "img");
  assert.deepEqual(img.map((e) => [e.attrs.src, e.attrs.alt]), [["/app/assets/group-logo", said("screen.entry.logo", { group: "River Town Tenants" })]]);
  assert.ok(o.text.includes("Leases on public land") && o.text.includes("We check the public body's own terms."));
  has(o, "screen.entry.uses", { group: "River Town Tenants" });
  // control: no logo set draws none
  const n = await open("front", { table: { ...TABLE, groupidentity: { ok: true, result: { group: "river-town", display_name: "River Town Tenants", logo: false } } } });
  assert.equal(all(n.tree, (e) => e.tag === "img").length, 0);
});

test("R1 a part the group keeps from the public is not drawn: no purpose answered draws no purpose, nothing withheld is listed", async () => {
  const o = await open("front", { table: { ...TABLE, groupdescription: { ok: true, result: { description: null } } } });
  assert.ok(!o.text.includes("Leases on public land"));
  lacks(o, "state.empty");
  assert.ok(!links(o.tree).includes("/app/published/CASE-3"), "a withheld case is not drawn");
});

test("R1 what it has published: each case edition's title, edition, signing date and signer, linking /app/published/<case>", async () => {
  const o = await open("front", { table: TABLE });
  has(o, "screen.front.published");
  const rows = all(o.tree, (e) => e.tag === "a" && /^\/app\/published\//.test(e.attrs.href || ""));
  assert.deepEqual(rows.map((e) => [e.attrs.href, texts(e).join(" ")]), [["/app/published/CASE-1", "The lease amendment"], ["/app/published/CASE-2", "Pothole repairs"]]);
  has(o, "screen.front.edition", { edition: "2", date: { html: date("2026-11-19") }, signer: "dev" });
  has(o, "screen.front.edition", { edition: "1", date: { html: date("2026-10-02") }, signer: "mai" });
});

test("R1 the doorbell, the tour and the sign-in panel are drawn, the tour by 'See how it works, step by step'", async () => {
  const o = await open("front", { table: TABLE });
  for (const k of ["screen.front.doorbell", "screen.front.doorbell.what", "screen.front.how", "screen.front.how.what", "screen.front.how.go", "screen.front.members"]) has(o, k);
  const l = links(o.tree);
  for (const href of ["/app/doorbell", "/app/tour", "/app/forgot"]) assert.ok(l.includes(href), href);
});

test("R1 each read in its four states: loading, empty, could not read (refused, and no answer), its data", async () => {
  for (const read of ["groupidentity", "groupdescription", "publishedlist"]) {
    const pend = await open("front", { table: { ...TABLE, [read]: "pending" } });
    assert.ok(all(pend.tree, (e) => e.attrs["data-state"] === "loading").length >= (read === "groupidentity" ? 0 : 1), read + " loading");
    for (const failed of [{ ok: false, code: "DOOR_RATE_LIMITED" }, "none"]) {
      const f = await open("front", { table: { ...TABLE, [read]: failed } });
      if (read === "groupidentity") { assert.ok(!f.text.includes("River Town Tenants")); has(f, "screen.entry.uses", { group: said("screen.entry.group") }); }
      else assert.ok(all(f.tree, (e) => e.attrs["data-state"] === "failed").length === 1, read + " failed");
    }
  }
  const empty = await open("front", { table: { ...TABLE, publishedlist: { ok: true, result: { bundles: [], cases: [] } } } });
  // R12: nothing published draws no section
  lacks(empty, "screen.front.published"); lacks(empty, "state.empty");
  assert.equal(all(empty.tree, (e) => e.attrs["data-state"] === "failed").length, 0, "an empty read is never drawn as failed");
});

test("R2 the sign-in panel: handle (its help signin.handle.help), password, and 'This device is', own checked by default", async () => {
  const o = await open("front", { table: TABLE });
  has(o, "screen.front.handle"); has(o, "signin.handle.help"); has(o, "screen.front.device"); has(o, "session.keep"); has(o, "session.shared");
  const radios = all(o.tree, (e) => e.tag === "input" && e.attrs.type === "radio");
  assert.deepEqual(radios.map((r) => [r.attrs.value, r.attrs.checked !== undefined]), [["own", true], ["shared", false]]);
  assert.equal(all(o.tree, (e) => e.tag === "input" && e.attrs.type === "password").length, 1);
  assert.deepEqual(actOps(o.tree), ["login"]);
  has(o, "screen.front.notmember");
});

test("R2 login sends handle, password and device in the body only, and hands the session to the shell; control: a sentinel password in no other request", async () => {
  const SENT = "sentinel-password-7f3a";
  const o = await open("front", { table: { ...TABLE, login: { ok: true, result: { ok: true, token: "tok-new", expires: 0 } } } });
  const r = await o.press("login", { values: { "fs-handle": " mai ", "fs-pw": SENT } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body, x.query]), [["login", { handle: "mai", password: SENT, device: "own" }, {}]]);
  // handed over and whoami read (R18), then on to the page kept to return to, else Home
  assert.deepEqual(o.signins.map((s) => [s.answer.token, s.opts]), [["tok-new", { device: "own", handle: "mai", stay: true }], ["tok-new", { device: "own", handle: "mai" }]]);
  assert.deepEqual(o.gone, []);
  const elsewhere = o.requests.filter((x) => x.op !== "login");
  assert.ok(!JSON.stringify(elsewhere).includes(SENT));
  assert.ok(!o.drawn().includes(SENT), "never drawn");
  // a shared device
  const s = await open("front", { table: { ...TABLE, login: { ok: true, result: { ok: true, token: "t2" } } } });
  await s.press("login", { values: { "fs-handle": "mai", "fs-pw": SENT, "fs-device-1": true, "fs-device-0": false } });
  assert.equal(s.requests.at(-1).body.device, "shared");
  assert.deepEqual(s.signins.map((x) => x.opts.device), ["shared", "shared"]);
});

test("R16 the sign-in panel carries no founder hint: front drawn in every state holds neither withdrawn key and no text naming admin; control: the handle field is drawn and sends handle", async () => {
  for (const session of [{ state: "none" }, { state: "signedout", handle: "mai" }, { state: "ended", handle: "mai" }, { state: "locked", handle: "mai" }]) {
    const o = await open("front", { table: TABLE, session });
    assert.doesNotMatch(o.drawn(), /\badmin\b/i, session.state);
    for (const k of ["signin.founderhint", "screen.forgot.handle.help"]) {
      assert.ok(!o.spec.words.includes(k), k + " is read");
      assert.ok(!o.drawn().includes(k), k + " drawn");
    }
  }
  assert.equal(hasWord("signin.founderhint"), false, "the withdrawn key is gone from the list");
  const o = await open("front", { table: { ...TABLE, login: { ok: true, result: { ok: true, token: "t" } } } });
  assert.equal(all(o.tree, (e) => e.attrs.id === "fs-handle").length, 1);
  const r = await o.press("login", { values: { "fs-handle": "mai", "fs-pw": "a long password" } });
  assert.equal(r.sent[0].body.handle, "mai");
});

test("R18 a sign-in whose session is the founder's with no handle (whoami: rootOfTrust, handle null) opens setup's step before Home; control: a member and a founder holding a handle go on", async () => {
  const T = { ...TABLE, login: { ok: true, result: { ok: true, token: "tok-f" } } };
  const old = await open("front", { table: T, signinAs: OLD_FOUNDER });
  await old.press("login", { values: { "fs-handle": "admin", "fs-pw": "the founder's password" } });
  assert.deepEqual(old.gone, ["setup"]);
  assert.equal(old.signins.length, 1, "handed over once, kept for the step");
  for (const me of [JOINED, FOUNDER]) {
    const o = await open("front", { table: T, signinAs: me });
    await o.press("login", { values: { "fs-handle": me.handle, "fs-pw": "a long password" } });
    assert.deepEqual(o.gone, [], me.handle);
    assert.equal(o.signins.at(-1).opts.stay, undefined, me.handle + ": on to the page kept, else Home");
  }
});

test("R2 nothing is sent without a handle and a password", async () => {
  const o = await open("front", { table: TABLE });
  const r = await o.press("login", { values: { "fs-handle": "mai", "fs-pw": "" } });
  assert.deepEqual(r.sent, []);
  assert.equal(o.refused.key, "screen.front.incomplete");
});

test("R2 refused: SIGN_IN_REFUSED's words; the handle kept and the password cleared", async () => {
  const o = await open("front", { table: { ...TABLE, login: { ok: false, code: "SIGN_IN_REFUSED" } } });
  await o.press("login", { values: { "fs-handle": "mai", "fs-pw": "wrong password here" } });
  assert.equal(o.refused.text, said("refusal.SIGN_IN_REFUSED"));
  assert.equal(o.fields["fs-pw"], "");
  assert.equal(o.fields["fs-handle"], "mai");
  assert.equal(o.signins.length, 0);
});

test("R2 paused: SIGN_IN_PAUSED with its end from `stated`", async () => {
  const until = new Date(2026, 9, 14, 10, 42).toISOString();
  const o = await open("front", { table: { ...TABLE, login: { ok: false, code: "SIGN_IN_PAUSED", stated: { until } } } });
  await o.press("login", { values: { "fs-handle": "mai", "fs-pw": "a password typed" } });
  assert.equal(o.refused.text, said("refusal.SIGN_IN_PAUSED", { time: "10:42" }));
  assert.equal(o.fields["fs-pw"], "");
});

test("R2 signed out and ended are drawn from the record's state, and neither in the other's", async () => {
  const out = await open("front", { table: TABLE, session: { state: "signedout", handle: "mai" } });
  has(out, "session.signedout"); lacks(out, "session.ended");
  const end = await open("front", { table: TABLE, session: { state: "ended", handle: "mai" } });
  has(end, "session.ended"); lacks(end, "session.signedout");
  assert.equal(all(end.tree, (e) => e.attrs.id === "fs-handle")[0].attrs.value, "mai", "the handle offered again");
  const none = await open("front", { table: TABLE });
  lacks(none, "session.ended"); lacks(none, "session.signedout"); lacks(none, "session.locked");
});

test("R2 locked: the handle, the password, Unlock sending unlock under the locked session, and 'Not <handle>?' signing out", async () => {
  const o = await open("front", { table: { ...TABLE, unlock: { ok: true, result: { ok: true } } }, session: { state: "locked", handle: "mai" } });
  has(o, "session.locked"); has(o, "screen.front.welcomeback", { handle: "mai" }); has(o, "screen.front.notyou", { handle: "mai" }); has(o, "screen.front.other");
  assert.deepEqual(actOps(o.tree), ["unlock"], "no sign-in form while locked");
  const out = all(o.tree, (e) => e.tag === "button" && e.attrs["data-shell"] === "signout");
  assert.equal(out.length, 1);
  const r = await o.press("unlock", { values: { "fl-lock": "the password again" } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body, x.header]), [["unlock", { password: "the password again" }, true]]);
  assert.deepEqual(o.gone, ["home"]);
  // a wrong password: refused, cleared, still locked
  const w = await open("front", { table: { ...TABLE, unlock: { ok: false, code: "SIGN_IN_REFUSED" } }, session: { state: "locked", handle: "mai" } });
  await w.press("unlock", { values: { "fl-lock": "wrong" } });
  assert.equal(w.refused.text, said("refusal.SIGN_IN_REFUSED"));
  assert.equal(w.fields["fl-lock"], "");
  // control: nothing sent without a password
  const e = await open("front", { table: TABLE, session: { state: "locked", handle: "mai" } });
  assert.deepEqual((await e.press("unlock", { values: { "fl-lock": "" } })).sent, []);
});
