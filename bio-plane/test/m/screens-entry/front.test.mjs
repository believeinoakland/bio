/* screens-entry R1, R2: `front`, the group's page, and its members' sign-in, at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, has, lacks, said, date, all, actOps, links, texts, hasWord, worldOf, team, act, viaDoor } from "./kit.mjs";

/* The plane behind `front` is the real store (store-request's `storeWorld()`): the team's name, description and logo are the
   founder's real acts (`team`), the member who signs in is made by the real `memberadd` and `enroll` (`signIn`). */

const PUBLISHED = {
  bundles: [{ bundle_id: "F-1", edition: 1, title: "The lease amendment", attestor_member: "dev", ratified_at: "2026-11-19T10:00:00Z" },
    { bundle_id: "F-2", edition: 1, title: "Repairs closed", attestor_member: "mai", ratified_at: "2026-10-02T10:00:00Z" }],
  cases: [{ case_id: "CASE-1", edition: 2, findings: ["F-1"], signed_at: "2026-11-19T10:00:00Z" },
    { case_id: "CASE-2", edition: 1, findings: ["F-2"], signed_at: "2026-10-02T10:00:00Z", title: "Pothole repairs" },
    { case_id: "CASE-3", edition: 1, findings: [], withheld: true, signed_at: "2026-09-01T00:00:00Z" }],
};
/* a published case edition is the one state the world cannot make by real acts (REPORT 2: no recipe signs and commits one yet), so the
   published list stays scripted in the two tests that read it, its line listed by the fixtures check until the recipe merges */
const PUBLISHED_LIST = { publishedlist: { ok: true, result: PUBLISHED } };

test("R1 front reads groupidentity, groupdescription and publishedlist, none under a session", async () => {
  const { world } = await team();
  const o = await open("front", { world });
  assert.deepEqual(o.requests.map((r) => r.op).sort(), ["groupdescription", "groupidentity", "publishedlist"]);
  assert.ok(o.requests.every((r) => r.header === false && r.body === undefined));
});

test("R1 the masthead: the group's name and its logo when set; its public purpose; the foot names Civicsmith", async () => {
  const { world } = await team();
  const o = await open("front", { world });
  assert.ok(o.text.includes("River Town Tenants"));
  const img = all(o.tree, (e) => e.tag === "img");
  assert.deepEqual(img.map((e) => [e.attrs.src, e.attrs.alt]), [["/app/assets/group-logo", said("screen.entry.logo", { group: "River Town Tenants" })]]);
  assert.ok(o.text.includes("Leases on public land") && o.text.includes("We check the public body's own terms."));
  has(o, "screen.entry.uses", { group: "River Town Tenants" });
  // control: no logo set draws none
  const bare = await team({ logo: false });
  const n = await open("front", { world: bare.world });
  assert.equal(all(n.tree, (e) => e.tag === "img").length, 0);
});

test("R1 a part the group keeps from the public is not drawn: no purpose answered draws no purpose, nothing withheld is listed", async () => {
  const { world } = await team({ visibility: "members" });
  const o = await open("front", { world, table: PUBLISHED_LIST });
  assert.ok(!o.text.includes("Leases on public land"));
  lacks(o, "state.empty");
  assert.ok(!links(o.tree).includes("/app/published/CASE-3"), "a withheld case is not drawn");
});

test("R1 what it has published: each case edition's title, edition, signing date and signer, linking /app/published/<case>", async () => {
  const { world } = await team();
  const o = await open("front", { world, table: PUBLISHED_LIST });
  has(o, "screen.front.published");
  const rows = all(o.tree, (e) => e.tag === "a" && /^\/app\/published\//.test(e.attrs.href || ""));
  assert.deepEqual(rows.map((e) => [e.attrs.href, texts(e).join(" ")]), [["/app/published/CASE-1", "The lease amendment"], ["/app/published/CASE-2", "Pothole repairs"]]);
  has(o, "screen.front.edition", { edition: "2", date: { html: date("2026-11-19") }, signer: "dev" });
  has(o, "screen.front.edition", { edition: "1", date: { html: date("2026-10-02") }, signer: "mai" });
});

test("R1 the doorbell, the tour and the sign-in panel are drawn, the tour by 'See how it works, step by step'", async () => {
  const { world } = await team();
  const o = await open("front", { world });
  // the keys are the module's own declaration (K3268): its doorbell, tour and members' sentences, the doorbell's link text aside
  const own = o.spec.words.filter((k) => /^screen\.front\.(doorbell|how|members)(\.what|\.go)?$/.test(k) && k !== "screen.front.doorbell.go");
  assert.equal(own.length, 6);
  for (const k of own) has(o, k);
  const l = links(o.tree);
  for (const href of ["/app/doorbell", "/app/tour", "/app/forgot"]) assert.ok(l.includes(href), href);
});

test("R1 each read in its four states: loading, empty, could not read (refused, and no answer), its data", async () => {
  const { world } = await team();
  /* the faults are the harness's: a read still pending, unanswered, or refused with no code of its own */
  for (const read of ["groupidentity", "groupdescription", "publishedlist"]) {
    const pend = await open("front", { world, table: { [read]: "pending" } });
    assert.ok(all(pend.tree, (e) => e.attrs["data-state"] === "loading").length >= (read === "groupidentity" ? 0 : 1), read + " loading");
    for (const failed of [{ ok: false }, "none"]) {
      const f = await open("front", { world, table: { [read]: failed } });
      if (read === "groupidentity") { assert.ok(!f.text.includes("River Town Tenants")); has(f, "screen.entry.uses", { group: said("screen.entry.group") }); }
      else assert.ok(all(f.tree, (e) => e.attrs["data-state"] === "failed").length === 1, read + " failed");
    }
  }
  /* the real empty: a team that has published nothing (the world's own answer) */
  const empty = await open("front", { world });
  assert.deepEqual(empty.view.data.published.value, { bundles: [], cases: [] }, "the real store has published nothing");
  // R12: nothing published draws no section
  lacks(empty, "screen.front.published"); lacks(empty, "state.empty");
  assert.equal(all(empty.tree, (e) => e.attrs["data-state"] === "failed").length, 0, "an empty read is never drawn as failed");
});

test("R2 the sign-in panel: handle (its help signin.handle.help), password, and 'This device is', own checked by default", async () => {
  const { world } = await team();
  const o = await open("front", { world });
  has(o, "screen.front.handle"); has(o, "signin.handle.help"); has(o, "screen.front.device"); has(o, "session.keep"); has(o, "session.shared");
  const radios = all(o.tree, (e) => e.tag === "input" && e.attrs.type === "radio");
  assert.deepEqual(radios.map((r) => [r.attrs.value, r.attrs.checked !== undefined]), [["own", true], ["shared", false]]);
  assert.equal(all(o.tree, (e) => e.tag === "input" && e.attrs.type === "password").length, 1);
  assert.deepEqual(actOps(o.tree), ["login"]);
  has(o, "screen.front.notmember");
});

/* a member of the team, made by the real acts (`signIn`): her handle and the password she chose, and the signed-in session whoami reads */
async function member(world, handle = "mai", o = {}) {
  const mai = await world.signIn(handle, o);
  return { mai, who: (await viaDoor(world, "whoami", {}, mai.token)).json.result };
}

test("R2 login sends handle, password and device in the body only, and hands the session to the shell; control: a sentinel password in no other request", async () => {
  const { world } = await team();
  const { mai } = await member(world);
  const SENT = mai.password;
  const o = await open("front", { world });
  const r = await o.press("login", { values: { "fs-handle": " mai ", "fs-pw": SENT } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body, x.query]), [["login", { handle: "mai", password: SENT, device: "own" }, {}]]);
  // handed over and whoami read (R18), then on to the page kept to return to, else Home
  const token = o.signins[0].answer.token;
  assert.match(token, /^[0-9a-f]{64}$/, "the session the real login issued");
  assert.deepEqual(o.signins.map((s) => [s.answer.token, s.opts]), [[token, { device: "own", handle: "mai", stay: true }], [token, { device: "own", handle: "mai" }]]);
  assert.equal(o.view.me.member, "mai", "whoami, read over the token the login issued");
  assert.deepEqual(o.gone, []);
  const elsewhere = o.requests.filter((x) => x.op !== "login");
  assert.ok(!JSON.stringify(elsewhere).includes(SENT));
  assert.ok(!o.drawn().includes(SENT), "never drawn");
  // a shared device
  const s = await open("front", { world });
  await s.press("login", { values: { "fs-handle": "mai", "fs-pw": SENT, "fs-device-1": true, "fs-device-0": false } });
  assert.equal(s.requests.at(-1).body.device, "shared");
  assert.deepEqual(s.signins.map((x) => x.opts.device), ["shared", "shared"]);
});

test("R16 the sign-in panel carries no founder hint: front drawn in every state holds neither withdrawn key and no text naming admin; control: the handle field is drawn and sends handle", async () => {
  const { world } = await team();
  const { mai } = await member(world);
  for (const session of [{ state: "none" }, { state: "signedout", handle: "mai" }, { state: "ended", handle: "mai" }, { state: "locked", handle: "mai" }]) {
    const o = await open("front", { world, as: session.state === "locked" ? mai : null, session });
    assert.doesNotMatch(o.drawn(), /\badmin\b/i, session.state);
    for (const k of ["signin.founderhint", "screen.forgot.handle.help"]) {
      assert.ok(!o.spec.words.includes(k), k + " is read");
      assert.ok(!o.drawn().includes(k), k + " drawn");
    }
  }
  assert.equal(hasWord("signin.founderhint"), false, "the withdrawn key is gone from the list");
  const o = await open("front", { world });
  assert.equal(all(o.tree, (e) => e.attrs.id === "fs-handle").length, 1);
  const r = await o.press("login", { values: { "fs-handle": "mai", "fs-pw": mai.password } });
  assert.equal(r.sent[0].body.handle, "mai");
});

test("R18 a sign-in whose session is the founder's with no handle (whoami: rootOfTrust, handle null) opens setup's step before Home; control: a member and a founder holding a handle go on", async () => {
  /* a team claimed before T49: the claim made with no handle (credentials R1, K3337), so the founder holds none; she signs in as `admin` */
  const old = await worldOf({ claimed: false });
  await old.claim({ password: "the founder's long password" });
  const o = await open("front", { world: old });
  await o.press("login", { values: { "fs-handle": "admin", "fs-pw": "the founder's long password" } });
  assert.equal(o.view.me.handle, null, "whoami: the founder holds no handle");
  assert.equal(o.view.me.rootOfTrust, true);
  assert.deepEqual(o.gone, ["setup"]);
  assert.equal(o.signins.length, 1, "handed over once, kept for the step");
  const { world } = await team();
  const { mai } = await member(world);
  for (const [handle, password] of [["mai", mai.password], ["founder", world.password]]) {
    const n = await open("front", { world });
    await n.press("login", { values: { "fs-handle": handle, "fs-pw": password } });
    assert.deepEqual(n.gone, [], handle);
    assert.equal(n.signins.at(-1).opts.stay, undefined, handle + ": on to the page kept, else Home");
  }
});

test("R2 nothing is sent without a handle and a password", async () => {
  const { world } = await team();
  const o = await open("front", { world });
  const r = await o.press("login", { values: { "fs-handle": "mai", "fs-pw": "" } });
  assert.deepEqual(r.sent, []);
  assert.equal(o.refused.key, "screen.front.incomplete");
});

test("R2 refused: SIGN_IN_REFUSED's words; the handle kept and the password cleared", async () => {
  const { world } = await team();
  const { mai } = await member(world);
  const o = await open("front", { world });
  await o.press("login", { values: { "fs-handle": "mai", "fs-pw": "wrong password here" } });
  assert.equal(o.refused.text, said("refusal.SIGN_IN_REFUSED"));
  assert.equal(o.fields["fs-pw"], "");
  assert.equal(o.fields["fs-handle"], "mai");
  assert.equal(o.signins.length, 0);
  // control: the right password signs her in
  await o.press("login", { values: { "fs-handle": "mai", "fs-pw": mai.password } });
  assert.equal(o.refused, null);
  assert.ok(o.signins.length > 0);
});

test("R2 paused: the plane pauses sign-in after ten refused attempts and the page draws SIGN_IN_PAUSED, the password cleared and the handle kept", async () => {
  const { world } = await team();
  const o = await open("front", { world });
  /* the pause is reached by the real attempts (credentials R38: ten refused for one account in ten minutes) */
  for (let i = 0; i < 10; i++) await o.press("login", { values: { "fs-handle": "mai", "fs-pw": "a wrong password " + i } });
  assert.equal(o.refused.text, said("refusal.SIGN_IN_REFUSED"), "ten refused, each its own refusal");
  await o.press("login", { values: { "fs-handle": "mai", "fs-pw": "a password typed" } });
  const paused = o.requests.at(-1);
  assert.equal(paused.op, "login");
  assert.equal(o.refused.code, "SIGN_IN_PAUSED");
  assert.equal(o.fields["fs-pw"], "");
  assert.equal(o.fields["fs-handle"], "mai");
  assert.doesNotMatch(o.refused.text, /\{\w+\}/, "no placeholder left unfilled");
});

test("R2 signed out and ended are drawn from the record's state, and neither in the other's", async () => {
  const { world } = await team();
  const out = await open("front", { world, session: { state: "signedout", handle: "mai" } });
  has(out, "session.signedout"); lacks(out, "session.ended");
  const end = await open("front", { world, session: { state: "ended", handle: "mai" } });
  has(end, "session.ended"); lacks(end, "session.signedout");
  assert.equal(all(end.tree, (e) => e.attrs.id === "fs-handle")[0].attrs.value, "mai", "the handle offered again");
  const none = await open("front", { world });
  lacks(none, "session.ended"); lacks(none, "session.signedout"); lacks(none, "session.locked");
});

/* a session the plane itself has locked: an own-device session idle for thirty minutes (credentials R65), by the world's clock */
async function lockedSession(world, handle = "mai") {
  const { mai } = await member(world, handle);
  await world.tick(31 * 60e3);
  const whoami = await viaDoor(world, "whoami", {}, mai.token);
  assert.equal(whoami.status, 401, "the plane has locked the session");
  assert.equal(whoami.json.reason, "SESSION_LOCKED");
  return mai;
}

test("R2 locked: the handle, the password, Unlock sending unlock under the locked session, and 'Not <handle>?' signing out", async () => {
  const { world } = await team();
  const mai = await lockedSession(world);
  const o = await open("front", { world, as: mai, session: { state: "locked", handle: "mai" } });
  has(o, "session.locked"); has(o, "screen.front.welcomeback", { handle: "mai" }); has(o, "screen.front.notyou", { handle: "mai" }); has(o, "screen.front.other");
  assert.deepEqual(actOps(o.tree), ["unlock"], "no sign-in form while locked");
  const out = all(o.tree, (e) => e.tag === "button" && e.attrs["data-shell"] === "signout");
  assert.equal(out.length, 1);
  // a wrong password: refused by the plane, cleared, still locked
  await o.press("unlock", { values: { "fl-lock": "wrong" } });
  assert.equal(o.refused.text, said("refusal.SIGN_IN_REFUSED"));
  assert.equal(o.fields["fl-lock"], "");
  assert.deepEqual(o.gone, []);
  const r = await o.press("unlock", { values: { "fl-lock": mai.password } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body, x.header]), [["unlock", { password: mai.password }, true]]);
  assert.deepEqual(o.gone, ["home"]);
  assert.equal((await viaDoor(world, "whoami", {}, mai.token)).status, 200, "the plane unlocked the session");
  // control: nothing sent without a password
  const e = await open("front", { world, as: mai, session: { state: "locked", handle: "mai" } });
  assert.deepEqual((await e.press("unlock", { values: { "fl-lock": "" } })).sent, []);
});
