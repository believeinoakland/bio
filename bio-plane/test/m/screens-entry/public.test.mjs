/* screens-entry R3, R4, R5: `tour`, `forgot` and `reset`, at the module's interface, over the real store (the founder's recovery codes,
   the member's reset link and the refusals are the plane's own). */
import test from "node:test";
import assert from "node:assert/strict";
import { open, has, lacks, said, date, all, actOps, links, SCREENS, team, act, viaDoor, worldOf } from "./kit.mjs";

// ---- tour (R3) ----

test("R3 tour: every one of the six steps drawn at its address, with Back, Next and 'Stop here' to front", async () => {
  for (let n = 1; n <= 6; n++) {
    const o = await open("tour", { subject: n === 1 ? null : String(n) });
    has(o, "screen.tour.step", { n: String(n), total: "6" });
    has(o, `screen.tour.step${n}.title`); has(o, `screen.tour.step${n}.body`);
    const l = links(o.tree);
    assert.equal(l.includes(n === 2 ? "/app/tour" : "/app/tour/" + (n - 1)), n > 1, "Back at step " + n);
    assert.equal(l.includes("/app/tour/" + (n + 1)), n < 6, "Next at step " + n);
    assert.ok(l.includes("/app/front"));
    has(o, n === 6 ? "screen.tour.end" : "screen.tour.stop");
    // the fifth step links the doorbell, no other does
    assert.equal(l.includes("/app/doorbell"), n === 5, "the doorbell at step " + n);
    has(o, "screen.tour.nothing");
  }
  // an address past the last step draws the last, before the first draws the first
  has(await open("tour", { subject: "9" }), "screen.tour.step6.title");
  has(await open("tour", { subject: "x" }), "screen.tour.step1.title");
});

test("R3 tour asks no account, sends no op and stores nothing; control: it has no reads and no acts", async () => {
  const o = await open("tour", { subject: "3" });
  assert.deepEqual(o.requests, []);
  assert.deepEqual(actOps(o.tree), []);
  assert.equal(all(o.tree, (e) => ["input", "textarea", "select"].includes(e.tag)).length, 0);
  const s = SCREENS.find((x) => x.id === "tour");
  assert.deepEqual(s.reads({}), {});
  assert.deepEqual(s.acts, []);
  assert.ok(!/localStorage|sessionStorage|indexedDB|document\.cookie/.test(s.render.toString()));
});

// ---- forgot (R4) ----

const CODE = "7KQ2-M4XD-P9TR";
/* the founder's ten recovery codes, issued by the real act (credentials R47: recovery serves an active administrator) */
async function founderWithCodes() {
  const { world, admin } = await team({ name: null, description: null, logo: false });
  const codes = (await act(world, admin, "recoverycodesissue", { body: {} })).codes;
  return { world, admin, codes };
}
test("R4 forgot: recover sends the handle, the code and the new password in the body only; success says the codes left and that other sign-ins ended, linking front", async () => {
  const { world, codes } = await founderWithCodes();
  const o = await open("forgot", { world });
  assert.deepEqual(actOps(o.tree), ["recover"]);
  has(o, "screen.forgot.codes");
  const r = await o.press("recover", { values: { "fg-handle": "founder", "fg-code": codes[0], "fg-pw": "a long new password", "fg-pw2": "a long new password" } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body, x.query, x.header]), [["recover", { handle: "founder", code: codes[0], password: "a long new password" }, {}, false]]);
  has(o, "screen.forgot.done", { remaining: "9" });
  assert.equal(r.sent[0].answer.value.remaining, 9, "the plane's own count: ten issued, one spent");
  assert.ok(links(o.tree).includes("/app/front"));
  assert.deepEqual(actOps(o.tree), [], "the form is gone once the password is set");
  // the new password is the one the plane now takes
  assert.equal((await viaDoor(world, "login", { body: { handle: "founder", password: "a long new password" } })).json.result.ok, true);
});

test("R4 control: two passwords that differ send nothing; a short one sends nothing; no handle or code sends nothing", async () => {
  const { world } = await founderWithCodes();
  const o = await open("forgot", { world });
  assert.deepEqual((await o.press("recover", { values: { "fg-handle": "founder", "fg-code": CODE, "fg-pw": "a long new password", "fg-pw2": "a long new passwerd" } })).sent, []);
  assert.equal(o.refused.key, "screen.entry.differ");
  assert.deepEqual((await o.press("recover", { values: { "fg-handle": "founder", "fg-code": CODE, "fg-pw": "short", "fg-pw2": "short" } })).sent, []);
  assert.equal(o.refused.key, "screen.entry.short");
  assert.deepEqual((await o.press("recover", { values: { "fg-handle": "", "fg-code": CODE, "fg-pw": "a long new password", "fg-pw2": "a long new password" } })).sent, []);
  assert.equal(o.refused.key, "screen.forgot.incomplete");
});

test("R4 refusal: RECOVERY_REFUSED drawn as its one sentence, the code cleared and the handle kept", async () => {
  const { world, codes } = await founderWithCodes();
  const o = await open("forgot", { world });
  /* a code that is none of hers, a handle that is no one's, and a code already spent: the plane gives each the one refusal */
  await o.press("recover", { values: { "fg-handle": "founder", "fg-code": CODE, "fg-pw": "a long new password", "fg-pw2": "a long new password" } });
  assert.equal(o.requests.at(-1).answer.code, "RECOVERY_REFUSED");
  assert.equal(o.refused.text, said("refusal.RECOVERY_REFUSED"));
  assert.equal(o.fields["fg-code"], "");
  assert.equal(o.fields["fg-handle"], "founder");
  lacks(o, "screen.forgot.done", { remaining: "9" });
  // control: one of her own codes is served
  await o.press("recover", { values: { "fg-handle": "founder", "fg-code": codes[0], "fg-pw": "a long new password", "fg-pw2": "a long new password" } });
  has(o, "screen.forgot.done", { remaining: "9" });
});

// FORGOT_HELP's and HOSTING_CONTROL's words as the design stream keys them (R21)
const HELP = ["screen.forgot.help.heading", "screen.forgot.help.s1", "screen.forgot.help.s2"];
const HOSTING = ["screen.hosting.heading", "screen.hosting.s1", "screen.hosting.s2", "screen.hosting.s3", "screen.hosting.s4", "screen.hosting.s5", "screen.hosting.guide"];

test("R4 the other two ways: ask an administrator for a reset link; if no administrator can get in, FORGOT_HELP's words for every visitor; control: forgot draws no HOSTING_CONTROL", async () => {
  const { world } = await team({ name: null, description: null, logo: false });
  for (const session of [{ state: "none" }, { state: "ended", handle: "mai" }]) {
    const o = await open("forgot", { world, session });
    has(o, "screen.forgot.admin"); has(o, "screen.forgot.admin.what");
    for (const k of HELP) has(o, k);
    // the founder's block is setup's only (R6): none of its heading, sentences or guide is drawn here
    for (const k of HOSTING) lacks(o, k);
    assert.equal(all(o.tree, (e) => e.attrs.id === "hosting-control").length, 0);
  }
  // control: setup's claim still draws it, over a team not yet claimed
  const s = await open("setup", { fragment: { boot: "otp" }, world: await worldOf({ claimed: false }) });
  for (const k of HOSTING) has(s, k);
});

test("R16 forgot's handle field carries no founder hint: its help is forgot.handle.help, neither withdrawn key is read or drawn, and no text names admin; control: the handle field is drawn and sends handle", async () => {
  const { world } = await team({ name: null, description: null, logo: false });
  for (const session of [{ state: "none" }, { state: "ended", handle: "mai" }]) {
    const o = await open("forgot", { world, session });
    has(o, "forgot.handle.help");
    assert.doesNotMatch(o.drawn(), /\badmin\b/i);
    for (const k of ["screen.forgot.handle.help", "signin.founderhint"]) { assert.ok(!o.spec.words.includes(k), k); assert.ok(!o.drawn().includes(k), k); }
    const r = await o.press("recover", { values: { "fg-handle": "mai", "fg-code": "C-1", "fg-pw": "a long new password", "fg-pw2": "a long new password" } });
    assert.equal(r.sent[0].body.handle, "mai");
    assert.doesNotMatch(o.drawn(), /\badmin\b/i, "refused");
  }
});

// ---- reset (R5) ----

/* a team with a member, and the reset link the founder's real `passwordresetlink` makes for her (credentials R69) */
async function resetting({ name } = {}) {
  const t = await team(name ? { name } : { name: null, description: null, logo: false });
  await t.world.signIn("mai");
  const made = await act(t.world, t.admin, "passwordresetlink", { body: { member: "mai" } });
  return { ...t, link: made.link, until: made.expiresAt };
}
const DEAD = "rl-link-nobody-made";

test("R5 reset: passwordresetlook reads the link in its body and draws for whom it is and until when", async () => {
  const { world, link } = await resetting();
  const o = await open("reset", { fragment: { reset: link }, world });
  assert.deepEqual(o.requests.map((r) => [r.op, r.body, r.query]), [["passwordresetlook", { link }, {}], ["groupidentity", undefined, {}]]);
  const look = o.requests[0].answer.value;
  assert.equal(look.handle, "mai");
  assert.equal(look.expiresAt, "2026-10-08T12:00:00Z", "the plane's own field: the link's end");
  has(o, "screen.reset.for", { handle: "mai", date: { html: date(look.expiresAt) } });
  has(o, "screen.reset.keeps", { name: { html: said("screen.entry.group") } });
});

test("R5 set: 'Set my new password' sends passwordreset with the link and the password in the body only; then 'Sign in' to front", async () => {
  const { world, link } = await resetting();
  const o = await open("reset", { fragment: { reset: link }, world });
  assert.deepEqual(actOps(o.tree), ["passwordreset"]);
  const r = await o.press("passwordreset", { values: { "rs-pw": "my new long password", "rs-pw2": "my new long password" } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body, x.query]), [["passwordreset", { link, password: "my new long password" }, {}]]);
  has(o, "screen.reset.done"); has(o, "screen.reset.forhandle", { handle: "mai" });
  assert.ok(links(o.tree).includes("/app/front"));
  assert.equal((await viaDoor(world, "login", { body: { handle: "mai", password: "my new long password" } })).json.result.ok, true, "the plane took the new password");
  // control: differing or short passwords send nothing
  const again = await resetting();
  const d = await open("reset", { fragment: { reset: again.link }, world: again.world });
  assert.deepEqual((await d.press("passwordreset", { values: { "rs-pw": "my new long password", "rs-pw2": "my new long passw0rd" } })).sent, []);
  assert.deepEqual((await d.press("passwordreset", { values: { "rs-pw": "eleven char", "rs-pw2": "eleven char" } })).sent, []);
});

test("R5 dead: RESET_LINK_DEAD (looked or pressed) and a missing link each draw 'Ask an administrator for a new one. Nothing was changed.' and no form", async () => {
  const { world, admin, link } = await resetting();
  const looked = await open("reset", { fragment: { reset: DEAD }, world });
  assert.equal(looked.requests[0].answer.code, "RESET_LINK_DEAD", "the plane's own refusal");
  has(looked, "screen.reset.dead"); has(looked, "screen.reset.dead.what");
  assert.deepEqual(actOps(looked.tree), []);
  const none = await open("reset", { world });
  has(none, "screen.reset.dead"); assert.deepEqual(none.requests, []);
  /* read live, then a newer link replaces it before she presses: the plane refuses the old one (credentials R69) */
  const pressed = await open("reset", { fragment: { reset: link }, world });
  assert.deepEqual(actOps(pressed.tree), ["passwordreset"], "live when read");
  await act(world, admin, "passwordresetlink", { body: { member: "mai" } });
  await pressed.press("passwordreset", { values: { "rs-pw": "my new long password", "rs-pw2": "my new long password" } });
  assert.equal(pressed.requests.at(-1).answer.code, "RESET_LINK_DEAD");
  has(pressed, "screen.reset.dead.what");
  assert.deepEqual(actOps(pressed.tree), []);
});

test("R5 control: the link is in no address, query, link drawn or text, only in the two bodies", async () => {
  const { world, link } = await resetting();
  const o = await open("reset", { fragment: { reset: link }, world });
  await o.press("passwordreset", { values: { "rs-pw": "my new long password", "rs-pw2": "my new long password" } });
  assert.ok(!o.drawn().includes(link));
  for (const r of o.requests) {
    assert.ok(!JSON.stringify(r.query || {}).includes(link));
    assert.equal(JSON.stringify(r.body ?? null).includes(link), ["passwordresetlook", "passwordreset"].includes(r.op));
  }
});

// ---- reset fills its words (R32) ----

const UNFILLED = /\{\w+\}/;

test("R32 reset fills every placeholder: the live page names the team in screen.reset.keeps and draws no '{'; the set and dead pages likewise; control: an unnamed team draws the unnamed-team word, never the short name", async () => {
  const named = await resetting({ name: "River Town" });
  const live = await open("reset", { fragment: { reset: named.link }, world: named.world });
  has(live, "screen.reset.keeps", { name: "River Town" });
  assert.doesNotMatch(live.text, UNFILLED, "the live page");
  assert.doesNotMatch(live.drawn(), UNFILLED, "nothing unfilled in any pass");
  // the team's name is asked in the public frame, with no session (as front asks it)
  assert.ok(live.requests.some((r) => r.op === "groupidentity" && !r.header));
  const set = await open("reset", { fragment: { reset: named.link }, world: named.world });
  await set.press("passwordreset", { values: { "rs-pw": "my new long password", "rs-pw2": "my new long password" } });
  assert.doesNotMatch(set.text, UNFILLED, "the set page");
  const dead = await open("reset", { fragment: { reset: DEAD }, world: named.world });
  assert.doesNotMatch(dead.text, UNFILLED, "the dead page");
  // control: no name set (the world's team is recorded as "town", the short name, which is never drawn)
  const bare = await resetting();
  const o = await open("reset", { fragment: { reset: bare.link }, world: bare.world });
  assert.equal(o.requests.find((r) => r.op === "groupidentity").answer.value.display_name, null);
  assert.equal(o.requests.find((r) => r.op === "groupidentity").answer.value.group, "town");
  has(o, "screen.reset.keeps", { name: { html: said("screen.entry.group") } });
  assert.doesNotMatch(o.text, UNFILLED);
  assert.ok(!o.text.includes("town"), "never the short name");
  // control: a name that cannot be read still leaves no placeholder
  const none = await open("reset", { fragment: { reset: bare.link }, world: bare.world, table: { groupidentity: { ok: false } } });
  assert.doesNotMatch(none.text, UNFILLED);
});
