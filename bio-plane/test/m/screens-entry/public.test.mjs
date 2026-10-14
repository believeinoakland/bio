/* screens-entry R3, R4, R5: `tour`, `forgot` and `reset`, at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, has, lacks, said, date, all, actOps, links, squash, SCREENS } from "./kit.mjs";
import { HOSTING_CONTROL, FORGOT_HELP } from "../../../src/setup-fleet.mjs";

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
test("R4 forgot: recover sends the handle, the code and the new password in the body only; success says the codes left and that other sign-ins ended, linking front", async () => {
  const o = await open("forgot", { table: { recover: { ok: true, result: { ok: true, role: "member:mai", remaining: 7 } } } });
  assert.deepEqual(actOps(o.tree), ["recover"]);
  has(o, "screen.forgot.codes");
  const r = await o.press("recover", { values: { "fg-handle": "mai", "fg-code": CODE, "fg-pw": "a long new password", "fg-pw2": "a long new password" } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body, x.query, x.header]), [["recover", { handle: "mai", code: CODE, password: "a long new password" }, {}, false]]);
  has(o, "screen.forgot.done", { remaining: "7" });
  assert.ok(links(o.tree).includes("/app/front"));
  assert.deepEqual(actOps(o.tree), [], "the form is gone once the password is set");
});

test("R4 control: two passwords that differ send nothing; a short one sends nothing; no handle or code sends nothing", async () => {
  const o = await open("forgot");
  assert.deepEqual((await o.press("recover", { values: { "fg-handle": "mai", "fg-code": CODE, "fg-pw": "a long new password", "fg-pw2": "a long new passwerd" } })).sent, []);
  assert.equal(o.refused.key, "screen.entry.differ");
  assert.deepEqual((await o.press("recover", { values: { "fg-handle": "mai", "fg-code": CODE, "fg-pw": "short", "fg-pw2": "short" } })).sent, []);
  assert.equal(o.refused.key, "screen.entry.short");
  assert.deepEqual((await o.press("recover", { values: { "fg-handle": "", "fg-code": CODE, "fg-pw": "a long new password", "fg-pw2": "a long new password" } })).sent, []);
  assert.equal(o.refused.key, "screen.forgot.incomplete");
});

test("R4 refusal: RECOVERY_REFUSED drawn as its one sentence, the code cleared and the handle kept", async () => {
  const o = await open("forgot", { table: { recover: { ok: false, code: "RECOVERY_REFUSED" } } });
  await o.press("recover", { values: { "fg-handle": "mai", "fg-code": CODE, "fg-pw": "a long new password", "fg-pw2": "a long new password" } });
  assert.equal(o.refused.text, said("refusal.RECOVERY_REFUSED"));
  assert.equal(o.fields["fg-code"], "");
  assert.equal(o.fields["fg-handle"], "mai");
  lacks(o, "screen.forgot.done", { remaining: "7" });
});

test("R4 the other two ways: ask an administrator for a reset link; if no administrator can get in, instance-setup's FORGOT_HELP for every visitor; control: forgot draws no HOSTING_CONTROL", async () => {
  for (const session of [{ state: "none" }, { state: "ended", handle: "mai" }]) {
    const o = await open("forgot", { session });
    has(o, "screen.forgot.admin"); has(o, "screen.forgot.admin.what");
    for (const t of [FORGOT_HELP.heading, ...FORGOT_HELP.sentences]) assert.ok(o.text.includes(squash(t)), t);
    // the founder's block is setup's only (R6): none of its heading, sentences or guide is drawn here
    for (const t of [HOSTING_CONTROL.heading, ...HOSTING_CONTROL.sentences, HOSTING_CONTROL.guide.sentence]) assert.ok(!o.text.includes(squash(t)), "forgot draws HOSTING_CONTROL: " + t);
    assert.equal(all(o.tree, (e) => e.attrs.id === "hosting-control").length, 0);
  }
  // control: setup's claim still draws it
  const s = await open("setup", { fragment: { boot: "otp" }, table: { bootstrap: { ok: true, result: { ok: true, claimed: false, bootstrapConfigured: true } } } });
  assert.ok(s.text.includes(squash(HOSTING_CONTROL.heading)));
});

// ---- reset (R5) ----

const LINK = "rl-sentinel-31c9e";
const LOOK = { ok: true, result: { ok: true, handle: "mai", until: "2026-10-21T00:00:00Z" } };

test("R5 reset: passwordresetlook reads the link in its body and draws for whom it is and until when", async () => {
  const o = await open("reset", { fragment: { reset: LINK }, table: { passwordresetlook: LOOK } });
  assert.deepEqual(o.requests.map((r) => [r.op, r.body, r.query]), [["passwordresetlook", { link: LINK }, {}]]);
  has(o, "screen.reset.for", { handle: "mai", date: { html: date("2026-10-21") } });
  has(o, "screen.reset.keeps");
});

test("R5 set: 'Set my new password' sends passwordreset with the link and the password in the body only; then 'Sign in' to front", async () => {
  const o = await open("reset", { fragment: { reset: LINK }, table: { passwordresetlook: LOOK, passwordreset: { ok: true, result: { ok: true } } } });
  assert.deepEqual(actOps(o.tree), ["passwordreset"]);
  const r = await o.press("passwordreset", { values: { "rs-pw": "my new long password", "rs-pw2": "my new long password" } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body, x.query]), [["passwordreset", { link: LINK, password: "my new long password" }, {}]]);
  has(o, "screen.reset.done"); has(o, "screen.reset.forhandle", { handle: "mai" });
  assert.ok(links(o.tree).includes("/app/front"));
  // control: differing or short passwords send nothing
  const d = await open("reset", { fragment: { reset: LINK }, table: { passwordresetlook: LOOK } });
  assert.deepEqual((await d.press("passwordreset", { values: { "rs-pw": "my new long password", "rs-pw2": "my new long passw0rd" } })).sent, []);
  assert.deepEqual((await d.press("passwordreset", { values: { "rs-pw": "eleven char", "rs-pw2": "eleven char" } })).sent, []);
});

test("R5 dead: RESET_LINK_DEAD (looked or pressed) and a missing link each draw 'Ask an administrator for a new one. Nothing was changed.' and no form", async () => {
  const looked = await open("reset", { fragment: { reset: LINK }, table: { passwordresetlook: { ok: false, code: "RESET_LINK_DEAD" } } });
  has(looked, "screen.reset.dead"); has(looked, "screen.reset.dead.what");
  assert.deepEqual(actOps(looked.tree), []);
  const none = await open("reset");
  has(none, "screen.reset.dead"); assert.deepEqual(none.requests, []);
  const pressed = await open("reset", { fragment: { reset: LINK }, table: { passwordresetlook: LOOK, passwordreset: { ok: false, code: "RESET_LINK_DEAD" } } });
  await pressed.press("passwordreset", { values: { "rs-pw": "my new long password", "rs-pw2": "my new long password" } });
  has(pressed, "screen.reset.dead.what");
  assert.deepEqual(actOps(pressed.tree), []);
});

test("R5 control: the link is in no address, query, link drawn or text, only in the two bodies", async () => {
  const o = await open("reset", { fragment: { reset: LINK }, table: { passwordresetlook: LOOK, passwordreset: { ok: true, result: { ok: true } } } });
  await o.press("passwordreset", { values: { "rs-pw": "my new long password", "rs-pw2": "my new long password" } });
  assert.ok(!o.drawn().includes(LINK));
  for (const r of o.requests) {
    assert.ok(!JSON.stringify(r.query || {}).includes(LINK));
    assert.equal(JSON.stringify(r.body).includes(LINK), ["passwordresetlook", "passwordreset"].includes(r.op));
  }
});
