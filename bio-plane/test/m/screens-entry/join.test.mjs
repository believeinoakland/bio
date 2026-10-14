/* screens-entry R7: `join`, by an invitation and by the group's join link, walked over a fake plane, at the module's
   interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, has, lacks, said, all, actOps, links, JOINED } from "./kit.mjs";

const INVITE = "inv-sentinel-88aa";
const LINKID = "jl-sentinel-21bb";
const PW = "a member's long password";
const CODES = ["K1", "K2", "K3", "K4", "K5", "K6", "K7", "K8", "K9", "K10"];
const plane = (over = {}) => ({
  groupidentity: { ok: true, result: { ok: true, group: "river-town", display_name: "River Town" } },
  grouplanguages: { ok: true, result: { ok: true, languages: ["en", "es", "vi"] } },
  invitelook: { ok: true, result: { ok: true, cover: "Mai K.", role: "member", capabilities: ["contribute"] } },
  joinlinkinvite: { ok: true, result: { ok: true, invite: INVITE, expires: "2026-10-21T00:00:00Z" } },
  handlecheck: (body) => ({ ok: true, result: { ok: true, handle: body.handle, state: body.handle === "taken" ? "taken" : /[^a-z0-9-]/.test(body.handle) ? "not_allowed" : "free", suggestion: body.handle === "taken" ? "taken-2" : null } }),
  enroll: { ok: true, result: { ok: true, memberId: "mai" } },
  login: { ok: true, result: { ok: true, token: "tok-mai", expires: 0 } },
  memberlanguageset: { ok: true, result: { ok: true } },
  recoverycodesissue: { ok: true, result: { ok: true, codes: CODES } },
  ...over,
});
const FORM = { "jn-handle": "mai", "jn-pw": PW, "jn-pw2": PW, "jn-lang": "es" };

test("R7 #invite= reads invitelook with the invitation in its body, and draws the form: language among the group's, handle, password twice", async () => {
  const o = await open("join", { fragment: { invite: INVITE }, table: plane(), signinAs: JOINED });
  assert.deepEqual(o.requests.map((r) => [r.op, r.body]).sort(), [["groupidentity", undefined], ["grouplanguages", undefined], ["invitelook", { invite: INVITE }]]);
  has(o, "screen.join.invited", { group: "River Town" }); has(o, "screen.join.invited.as", { cover: "Mai K." });
  assert.deepEqual(all(o.tree, (e) => e.tag === "option").map((e) => e.attrs.value), ["en", "es", "vi"]);
  assert.ok(all(o.tree, (e) => e.attrs.id === "jn-handle").length === 1);
  assert.equal(all(o.tree, (e) => e.tag === "input" && e.attrs.type === "password").length, 2);
  has(o, "handle.fixed"); has(o, "screen.join.codes.after");
  assert.deepEqual(actOps(o.tree), ["enroll", "handlecheck", "invitelook"]);
  has(o, "screen.join.member"); assert.ok(links(o.tree).includes("/app/front"), "Already a member? Sign in");
});

test("R7 walked by invitation: enroll, login on an own device, memberlanguageset, recoverycodesissue, the codes shown once, the welcome counted, then Home", async () => {
  const o = await open("join", { fragment: { invite: INVITE }, table: plane(), signinAs: JOINED });
  const before = o.requests.length;
  await o.press("enroll", { values: FORM });
  assert.deepEqual(o.requests.slice(before).map((r) => [r.op, r.body, r.header]), [
    ["enroll", { invite: INVITE, handle: "mai", password: PW }, false],
    ["login", { handle: "mai", password: PW, device: "own" }, false],
    ["memberlanguageset", { language: "es" }, true],
    ["recoverycodesissue", {}, true],
  ]);
  assert.deepEqual(o.signins.map((s) => s.opts), [{ device: "own", handle: "mai", stay: true }]);
  assert.deepEqual(o.wizards, [["WIZ-7db08189cc0e58c3", null, { joined: true }]]);
  has(o, "screen.join.joined", { handle: "mai" }); has(o, "screen.entry.codes.heading");
  assert.deepEqual(all(o.tree, (e) => e.tag === "pre")[0].children.map((c) => c.text).join("").split("\n"), CODES);
  assert.ok(links(o.tree).includes("/app")); has(o, "screen.join.home");
});

test("R7 walked by the join link: the name the group will know the person by first, joinlinkinvite, then the invitation it answered", async () => {
  const o = await open("join", { fragment: { join: LINKID }, table: plane(), signinAs: JOINED });
  assert.ok(!o.requests.some((r) => r.op === "invitelook"), "no invitation read before the name is given");
  has(o, "screen.join.link", { group: "River Town" }); has(o, "screen.join.cover");
  assert.deepEqual(actOps(o.tree), ["joinlinkinvite"]);
  assert.deepEqual((await o.press("joinlinkinvite", { values: { "jn-cover": "" } })).sent, []);
  const r = await o.press("joinlinkinvite", { values: { "jn-cover": "Mai, from the block" } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body]), [["joinlinkinvite", { link: LINKID, cover: "Mai, from the block" }], ["invitelook", { invite: INVITE }]]);
  assert.deepEqual(actOps(o.tree), ["enroll", "handlecheck", "invitelook"]);
  await o.press("enroll", { values: FORM });
  assert.equal(o.requests.find((x) => x.op === "enroll").body.invite, INVITE);
  has(o, "screen.join.joined", { handle: "mai" });
});

test("R7 a dead link draws 'This link no longer works', one sentence for NO_SUCH_INVITATION and NO_SUCH_JOIN_LINK, JOIN_LINK_DAILY_CAP by its own words; control: no form", async () => {
  const dead = [
    await open("join", { fragment: { invite: INVITE }, table: plane({ invitelook: { ok: false, code: "NO_SUCH_INVITATION" } }) }),
    await open("join", {}),
  ];
  const jl = await open("join", { fragment: { join: LINKID }, table: plane({ joinlinkinvite: { ok: false, code: "NO_SUCH_JOIN_LINK" } }) });
  await jl.press("joinlinkinvite", { values: { "jn-cover": "Mai" } });
  dead.push(jl);
  for (const o of dead) {
    has(o, "screen.join.dead"); has(o, "screen.join.dead.what");
    assert.deepEqual(actOps(o.tree), []);
    assert.equal(all(o.tree, (e) => ["input", "select", "textarea"].includes(e.tag)).length, 0);
  }
  const cap = await open("join", { fragment: { join: LINKID }, table: plane({ joinlinkinvite: { ok: false, code: "JOIN_LINK_DAILY_CAP" } }) });
  await cap.press("joinlinkinvite", { values: { "jn-cover": "Mai" } });
  has(cap, "screen.join.dead"); has(cap, "refusal.JOIN_LINK_DAILY_CAP"); lacks(cap, "screen.join.dead.what");
  assert.equal(all(cap.tree, (e) => e.tag === "input").length, 0);
  // an invitation found dead at enrolment draws the same
  const late = await open("join", { fragment: { invite: INVITE }, table: plane({ enroll: { ok: false, code: "NO_SUCH_INVITATION" } }) });
  await late.press("enroll", { values: FORM });
  has(late, "screen.join.dead"); assert.deepEqual(actOps(late.tree), []);
});

test("R7 the handle checked as typed (handlecheck with the invitation), free, taken with a suggestion, characters a handle can't have", async () => {
  const o = await open("join", { fragment: { invite: INVITE }, table: plane() });
  const r = await o.press("handlecheck", { values: { "jn-handle": "Mai" } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body]), [["handlecheck", { invite: INVITE, handle: "mai" }]]);
  has(o, "handle.free", { handle: "mai", group: "River Town" });
  // typed on: the field is watched, each change checked once
  o.fields["jn-handle"] = "taken";
  await o.tick(700);
  has(o, "handle.taken", { handle: "taken", group: "River Town", suggestion: "taken-2" });
  const n = o.requests.filter((x) => x.op === "handlecheck").length;
  await o.tick(2000);
  assert.equal(o.requests.filter((x) => x.op === "handlecheck").length, n, "an unchanged field is not checked again");
  o.fields["jn-handle"] = "Mai.K";
  await o.tick(700);
  has(o, "handle.characters");
  assert.deepEqual(o.requests.filter((x) => x.op === "handlecheck").map((x) => x.body.handle), ["mai", "taken", "mai.k"]);
});

test("R7 control: two passwords that differ, a short one, or no handle send nothing; HANDLE_TAKEN at enrolment is drawn", async () => {
  const o = await open("join", { fragment: { invite: INVITE }, table: plane({ enroll: { ok: false, code: "HANDLE_TAKEN" } }) });
  for (const [values, key] of [[{ ...FORM, "jn-pw2": PW + "!" }, "screen.entry.differ"], [{ ...FORM, "jn-pw": "short", "jn-pw2": "short" }, "screen.entry.short"], [{ ...FORM, "jn-handle": "" }, "screen.join.handle.empty"]]) {
    assert.deepEqual((await o.press("enroll", { values })).sent, []);
    assert.equal(o.refused.key, key);
  }
  await o.press("enroll", { values: FORM });
  assert.equal(o.refused.text, said("screen.join.handle.taken"));
  assert.equal(o.requests.filter((x) => x.op === "login").length, 0, "nothing more is sent");
});

test("R7 joined but the sign-in refused: it says so and links front; no codes are asked", async () => {
  const o = await open("join", { fragment: { invite: INVITE }, table: plane({ login: { ok: false, code: "SIGN_IN_REFUSED" } }) });
  await o.press("enroll", { values: FORM });
  has(o, "screen.join.joined.nosignin");
  assert.ok(!o.requests.some((r) => r.op === "recoverycodesissue" || r.op === "memberlanguageset"));
  assert.deepEqual(o.wizards, []);
  assert.ok(links(o.tree).includes("/app/front"));
});
