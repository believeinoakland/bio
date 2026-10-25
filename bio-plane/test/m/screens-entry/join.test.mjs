/* screens-entry R7: `join`, by an invitation and by the group's join link, walked over the real store, at the module's
   interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, has, lacks, said, all, actOps, links, textOf, squash, SCREENS, team, act, viaDoor } from "./kit.mjs";
import { checkScreens } from "../../../src/interface-shell/index.mjs";

const PW = "a member's long password";
const FORM = { "jn-handle": "mai", "jn-pw": PW, "jn-pw2": PW, "jn-lang": "es" };
const STRANGER = "an-invitation-nobody-made";

/* The plane is the real store. The team is `River Town`, working in English, Spanish and Vietnamese (`grouplanguagesset`); the
   invitation is the founder's real `memberadd` for `mai`, the join link her real `joinlinkenable`; a member who already holds a
   handle is made by `signIn`. */
async function invited({ languages = ["en", "es", "vi"] } = {}) {
  const { world, admin } = await team({ name: "River Town" });
  if (languages.length) await act(world, admin, "grouplanguagesset", { body: { languages } });
  const added = await act(world, admin, "memberadd", { body: { memberId: "mai", cover: "Mai K." } });
  return { world, admin, invite: added.invite };
}
const answerOf = (o, op) => o.requests.find((r) => r.op === op).answer.value;

test("R7 #invite= reads invitelook with the invitation in its body, and draws the form: language among the group's, handle, password twice", async () => {
  const { world, invite } = await invited();
  const o = await open("join", { fragment: { invite }, world });
  assert.deepEqual(o.requests.map((r) => [r.op, r.body]).sort(), [["groupidentity", undefined], ["grouplanguages", undefined], ["invitelook", { invite }]]);
  has(o, "screen.join.invited", { group: "River Town" }); has(o, "screen.join.invited.as", { cover: "Mai K." });
  assert.deepEqual(all(o.tree, (e) => e.tag === "option").map((e) => e.attrs.value), ["en", "es", "vi"]);
  assert.ok(all(o.tree, (e) => e.attrs.id === "jn-handle").length === 1);
  assert.equal(all(o.tree, (e) => e.tag === "input" && e.attrs.type === "password").length, 2);
  has(o, "handle.fixed"); has(o, "screen.join.codes.after");
  assert.deepEqual(actOps(o.tree), ["enroll", "handlecheck", "invitelook"]);
  has(o, "screen.join.member"); assert.ok(links(o.tree).includes("/app/front"), "Already a member? Sign in");
});

test("R7 walked by invitation: enroll, login on an own device, memberlanguageset, recoverycodesissue, the codes shown once, the welcome counted, then Home", async () => {
  const { world, invite } = await invited();
  const o = await open("join", { fragment: { invite }, world });
  const before = o.requests.length;
  await o.press("enroll", { values: FORM });
  assert.deepEqual(o.requests.slice(before).map((r) => [r.op, r.body, r.header]), [
    ["enroll", { invite, handle: "mai", password: PW }, false],
    ["login", { handle: "mai", password: PW, device: "own" }, false],
    ["memberlanguageset", { language: "es" }, true],
    ["recoverycodesissue", {}, true],
  ]);
  const token = answerOf(o, "login").token;
  assert.deepEqual(o.signins.map((s) => [s.answer.token, s.opts]), [[token, { device: "own", handle: "mai", stay: true }]]);
  assert.equal(o.view.me.member, "mai", "the member the real login signed in");
  assert.deepEqual(o.wizards, [["WIZ-7db08189cc0e58c3", null, { joined: true }]]);
  // the plane holds what the page sent
  assert.equal((await viaDoor(world, "memberlanguage", {}, token)).json.result.language, "es");
  const CODES = answerOf(o, "recoverycodesissue").codes;
  assert.equal(CODES.length, 10);
  has(o, "screen.join.joined", { handle: "mai" }); has(o, "screen.entry.codes.heading");
  assert.deepEqual(all(o.tree, (e) => e.tag === "pre")[0].children.map((c) => c.text).join("").split("\n"), CODES);
  assert.deepEqual(o.saves.at(-1).text.trim().split("\n"), CODES);
  assert.deepEqual(o.copies.at(-1).split("\n"), CODES);
  assert.ok(links(o.tree).includes("/app")); has(o, "screen.join.home");
});

test("R7 walked by the join link: the name the group will know the person by first, joinlinkinvite, then the invitation it answered", async () => {
  const { world, admin } = await invited();
  const made = await act(world, admin, "joinlinkenable", { body: { capabilities: ["contribute"], dailyCap: 5 } });
  const o = await open("join", { fragment: { join: made.link }, world });
  assert.ok(!o.requests.some((r) => r.op === "invitelook"), "no invitation read before the name is given");
  has(o, "screen.join.link", { group: "River Town" }); has(o, "screen.join.cover");
  assert.deepEqual(actOps(o.tree), ["joinlinkinvite"]);
  assert.deepEqual((await o.press("joinlinkinvite", { values: { "jn-cover": "" } })).sent, []);
  const r = await o.press("joinlinkinvite", { values: { "jn-cover": "Mai, from the block" } });
  const invite = answerOf(o, "joinlinkinvite").invite;
  assert.deepEqual(r.sent.map((x) => [x.op, x.body]), [["joinlinkinvite", { link: made.link, cover: "Mai, from the block" }], ["invitelook", { invite }]]);
  assert.deepEqual(actOps(o.tree), ["enroll", "handlecheck", "invitelook"]);
  await o.press("enroll", { values: FORM });
  assert.equal(o.requests.find((x) => x.op === "enroll").body.invite, invite);
  has(o, "screen.join.joined", { handle: "mai" });
});

test("R7 a dead link (state e) draws 'This link no longer works', one sentence for NO_SUCH_INVITATION and NO_SUCH_JOIN_LINK, JOIN_LINK_DAILY_CAP by its own words in its own fold, open; control: no form", async () => {
  const { world, admin, invite } = await invited();
  const dead = [
    await open("join", { fragment: { invite: STRANGER }, world }),
    await open("join", { world }),
  ];
  assert.equal(dead[0].requests.find((r) => r.op === "invitelook").answer.code, "NO_SUCH_INVITATION", "the plane's own refusal");
  const jl = await open("join", { fragment: { join: "a-link-nobody-made" }, world });
  await jl.press("joinlinkinvite", { values: { "jn-cover": "Mai" } });
  assert.equal(jl.requests.at(-1).answer.code, "NO_SUCH_JOIN_LINK");
  dead.push(jl);
  for (const o of dead) {
    has(o, "screen.join.dead"); has(o, "screen.join.dead.what");
    assert.deepEqual(actOps(o.tree), []);
    assert.equal(all(o.tree, (e) => ["input", "select", "textarea"].includes(e.tag)).length, 0);
  }
  /* a link that lets one person in a day: the second to use it meets its cap */
  const made = await act(world, admin, "joinlinkenable", { body: { capabilities: ["contribute"], dailyCap: 1 } });
  const first = await open("join", { fragment: { join: made.link }, world });
  await first.press("joinlinkinvite", { values: { "jn-cover": "Mai" } });
  has(first, "screen.join.invited", { group: "River Town" });
  const cap = await open("join", { fragment: { join: made.link }, world });
  await cap.press("joinlinkinvite", { values: { "jn-cover": "Mai" } });
  assert.equal(cap.requests.at(-1).answer.code, "JOIN_LINK_DAILY_CAP", "the plane's own refusal");
  has(cap, "screen.join.dead"); has(cap, "refusal.JOIN_LINK_DAILY_CAP"); lacks(cap, "screen.join.dead.what");
  // the cap drawn as the design draws it: inside its fold, under join.cap.says, open whenever drawn (K3742)
  const fold = all(cap.tree, (e) => e.tag === "details");
  assert.equal(fold.length, 1);
  assert.ok("open" in fold[0].attrs, "the fold is open");
  assert.equal(all(fold[0], (e) => e.tag === "summary").map((e) => e.children.map((c) => c.text).join(""))[0], said("join.cap.says"));
  assert.ok(all(fold[0], (e) => /\bcs-gap\b/.test(e.attrs.class || "")).length === 1, "the cap's words in the fold");
  for (const o of dead) assert.equal(all(o.tree, (e) => e.tag === "details").length, 0, "no fold for a link that is simply dead");
  assert.equal(all(cap.tree, (e) => e.tag === "input").length, 0);
  // an invitation found dead at enrolment draws the same: the founder withdrew it after the page read it
  const late = await open("join", { fragment: { invite }, world });
  await act(world, admin, "invitewithdraw", { body: { memberId: "mai" } });
  await late.press("enroll", { values: FORM });
  assert.equal(late.requests.at(-1).answer.code, "NO_SUCH_INVITATION");
  has(late, "screen.join.dead"); assert.deepEqual(actOps(late.tree), []);
});

test("R7 the handle checked as typed (handlecheck with the invitation), free, taken with a suggestion, characters a handle can't have", async () => {
  const { world, invite } = await invited();
  const o = await open("join", { fragment: { invite }, world });
  const r = await o.press("handlecheck", { values: { "jn-handle": "Mai" } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body]), [["handlecheck", { invite, handle: "mai" }]]);
  has(o, "handle.free", { handle: "mai", group: "River Town" });
  // typed on: the field is watched, each change checked once; `founder` is the handle the team's founder holds
  o.fields["jn-handle"] = "founder";
  await o.tick(700);
  const taken = o.requests.at(-1).answer.value;
  assert.equal(taken.state, "taken");
  has(o, "handle.taken", { handle: "founder", group: "River Town", suggestion: taken.suggestion });
  const n = o.requests.filter((x) => x.op === "handlecheck").length;
  await o.tick(2000);
  assert.equal(o.requests.filter((x) => x.op === "handlecheck").length, n, "an unchanged field is not checked again");
  o.fields["jn-handle"] = "Mai.K";
  await o.tick(700);
  has(o, "handle.characters");
  assert.deepEqual(o.requests.filter((x) => x.op === "handlecheck").map((x) => x.body.handle), ["mai", "founder", "mai.k"]);
});

test("R7 control: two passwords that differ, a short one, or no handle send nothing; HANDLE_TAKEN at enrolment is drawn", async () => {
  const { world, invite } = await invited();
  await world.signIn("ann");
  const o = await open("join", { fragment: { invite }, world });
  for (const [values, key] of [[{ ...FORM, "jn-pw2": PW + "!" }, "screen.entry.differ"], [{ ...FORM, "jn-pw": "short", "jn-pw2": "short" }, "screen.entry.short"], [{ ...FORM, "jn-handle": "" }, "screen.join.handle.empty"]]) {
    assert.deepEqual((await o.press("enroll", { values })).sent, []);
    assert.equal(o.refused.key, key);
  }
  await o.press("enroll", { values: { ...FORM, "jn-handle": "ann" } });
  assert.equal(o.requests.at(-1).answer.code, "HANDLE_TAKEN", "the plane's own refusal: ann holds the handle");
  assert.equal(o.refused.text, said("screen.join.handle.taken"));
  assert.equal(o.requests.filter((x) => x.op === "login").length, 0, "nothing more is sent");
});

test("R7 joined but the sign-in refused: it says so and links front; no codes are asked", async () => {
  const { world, invite } = await invited();
  /* sign-in for this handle is paused: ten attempts were refused for it in the last ten minutes (credentials R38), so the login after
     the enrolment is not served */
  for (let i = 0; i < 10; i++) await viaDoor(world, "login", { body: { handle: "mai", password: "a wrong password " + i } });
  const o = await open("join", { fragment: { invite }, world });
  await o.press("enroll", { values: FORM });
  assert.equal(o.requests.find((r) => r.op === "enroll").answer.kind, "ok", "she is enrolled");
  assert.equal(o.requests.find((r) => r.op === "login").answer.code, "SIGN_IN_PAUSED");
  has(o, "screen.join.joined.nosignin");
  assert.ok(!o.requests.some((r) => r.op === "recoverycodesissue" || r.op === "memberlanguageset"));
  assert.deepEqual(o.wizards, []);
  assert.ok(links(o.tree).includes("/app/front"));
});

test("R30 the button that reads the invitation says so again once it has been read (screen.join.invite.reread); nothing is drawn to read while the read is pending", async () => {
  const { world, invite } = await invited();
  const pending = await open("join", { fragment: { invite }, world, table: { invitelook: "pending" } });
  assert.deepEqual(actOps(pending.tree), [], "before the read, nothing to read again");
  const o = await open("join", { fragment: { invite }, world });
  const btn = all(o.tree, (e) => e.tag === "button" && e.attrs["data-act"] === "invitelook");
  assert.equal(btn.length, 1);
  assert.equal(squash(textOf(btn[0])), said("screen.join.invite.reread"));
  assert.notEqual(said("act.invitelook.label.join"), said("screen.join.invite.reread"), "control: the old key's words differ");
  assert.ok(!btn.some((b) => squash(textOf(b)) === said("act.invitelook.label.join")), "the old label is not drawn");
  // pressing it reads the invitation again, with the invitation in the body
  const r = await o.press("invitelook");
  assert.deepEqual(r.sent.map((x) => [x.op, x.body]).slice(0, 1), [["invitelook", { invite }]]);
});

test("R31 join draws the language choice as the design draws it, with its act memberlanguageset; the module names the act", async () => {
  const { world, invite } = await invited();
  const o = await open("join", { fragment: { invite }, world });
  const marked = all(o.tree, (e) => e.attrs["data-act"] === "memberlanguageset");
  assert.equal(marked.length, 1, "one mark for the act");
  assert.notEqual(marked[0].tag, "button", "no button of its own: the member has no session until enroll answers");
  assert.deepEqual(all(marked[0], (e) => e.tag === "select").map((e) => e.attrs.id), ["jn-lang"], "the mark is on the language field");
  assert.ok(SCREENS.find((s) => s.id === "join").acts.some((a) => a.op === "memberlanguageset"), "the module names the act");
  assert.equal(checkScreens(SCREENS), true, "interface-shell's contract holds over the screens");
  // the language is still sent once, after login, as R7 says
  const before = o.requests.length;
  await o.press("enroll", { values: FORM });
  assert.equal(o.requests.slice(before).filter((r) => r.op === "memberlanguageset").length, 1);
  // control: no languages offered draws no choice and no mark
  const bare = await invited({ languages: [] });
  const none = await open("join", { fragment: { invite: bare.invite }, world: bare.world });
  assert.deepEqual(answerOf(none, "grouplanguages").languages, [], "the plane offers none");
  assert.equal(all(none.tree, (e) => e.attrs["data-act"] === "memberlanguageset").length, 0);
  assert.equal(all(none.tree, (e) => e.attrs.id === "jn-lang").length, 0);
});
