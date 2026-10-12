/* Settings › The assistant at the module's interface (R4, R5, R8, R9 over `owner: "member:<id>"`). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, day, has, lacks, open, panelOf, rowOf, said, textOf } from "./kit.mjs";
import { MEMBER, ADMIN, connectTable, env, KEEPAWAY_ON } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
const situations = (o) => all(o.tree, (e) => e.attrs["data-situation"]).map((e) => e.attrs["data-situation"]);

test("R4 the reads: assistantstate, aikeepawaystate, groupkeystate, groupkeynotice, disclosureof, accountreference, subscriptionsignin {step: state}, and the member's own account (owner member:<me>)", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER) });
  const reads = a.p.requests.map((r) => [r.op, r.query, r.body]);
  for (const want of [["assistantstate", {}, undefined], ["aikeepawaystate", {}, undefined], ["groupkeystate", {}, undefined], ["groupkeynotice", {}, undefined],
    ["disclosureof", { member: "member:dev" }, undefined], ["accountreference", {}, undefined], ["subscriptionsignin", {}, { step: "state" }], ["bootstrap", {}, undefined],
    ["accountuses", { owner: "member:dev" }, undefined], ["ailimits", { owner: "member:dev" }, undefined], ["aiusage", { owner: "member:dev" }, undefined], ["accounthistory", { owner: "member:dev" }, undefined]])
    assert.ok(reads.some((r) => JSON.stringify(r) === JSON.stringify(want)), JSON.stringify(want));
  const f = await open("connect", { me: { ...ADMIN, member: "admin" }, table: connectTable({ ...ADMIN, member: "admin" }) });
  assert.deepEqual(f.p.requests.find((r) => r.op === "disclosureof").query, { member: "admin" }, "the founder's disclosure is recorded as `admin`");
});

test("R4 exactly one of four situations: the group's key serves (with the member's daily allowance), the member's own account, nothing yet, or the group keeps its material away", async () => {
  const g = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group") });
  assert.deepEqual(situations(g), ["group"]);
  has(g, "screen.connect.group.allowance", { amount: "$5.00", unit: said("screen.panel.unit.usd"), period: said("screen.panel.period.day") });
  assert.ok(all(g.tree, (e) => e.tag === "a" && e.attrs.href === "#connect-own").length === 1, "Need more? a scroll to the section, not a route");
  const own = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  assert.deepEqual(situations(own), ["own"]);
  has(own, "screen.connect.own.apikey");
  assert.ok(!/sk-ant/.test(own.html), "what it is, never its key");
  const sub = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "subscription") });
  assert.deepEqual(situations(sub), ["own"]);
  has(sub, "screen.connect.own.subscription");
  const none = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") });
  assert.deepEqual(situations(none), ["none"]);
  const kept = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "keptaway") });
  assert.deepEqual(situations(kept), ["keptaway"]);
  has(kept, "screen.connect.keptaway", { by: "rosa", date: day("2026-10-02") });
  assert.ok(kept.html.includes(KEEPAWAY_ON.reason), "the reason in the administrator's words");
  has(kept, "screen.connect.keptaway.ask");
  assert.ok(said("screen.connect.keptaway.ask").includes("If you think this should change, ask an administrator"));
  assert.deepEqual(ops(kept), [], "and no act");
  // the rule of who pays, on every situation
  for (const o of [g, own, none, kept]) has(o, "ai.whopays");
});

test("R4 a keep-away that could not be read is not taken as off: the assistant is drawn kept away, with no act (instance-setup R53)", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group", { aikeepawaystate: env({ on: null, reason: null, set_by: null, set_at: null, uses: [] }), assistantstate: env({ ok: true, on: false, set_by: null, set_at: null, reason: null }) }) });
  assert.deepEqual(situations(a), ["keptaway"]);
  has(a, "screen.connect.keptaway.unread");
  assert.deepEqual(ops(a), []);
  const none = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group", { aikeepawaystate: "none", assistantstate: "none" }) });
  assert.deepEqual(situations(none), []);
  assert.ok(all(none.tree, (e) => e.attrs["data-state"] === "failed").length >= 1, "drawn as could not read");
});

test("R5 the two notices, each outward, before the first question: groupkeynoticeseen on the group's key, disclosureshown before connecting one's own", async () => {
  const g = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group", { disclosureof: (q) => env({ ok: true, member: q.member, version: "D311-1", shown: false, shown_at: null }) }) });
  for (const op of ["groupkeynoticeseen", "disclosureshown"]) {
    const b = acts(g.tree).find((x) => x.attrs["data-act"] === op);
    assert.ok(b, op);
    const n = ancestor(b, (e) => e.attrs.class === "cs-notice");
    assert.ok(n && textOf(n).includes(said("mark.outward.means")), `${op} carries mark.outward.means`);
    assert.equal(g.s.acts.find((x) => x.op === op).outward, true);
  }
  assert.ok(!ops(g).includes("subscriptionsignin") && !ops(g).includes("accountreferenceset"), "connecting waits on the disclosure");
  assert.deepEqual((await g.press("groupkeynoticeseen")).sent[0].body, {});
  const r = await g.press("disclosureshown", { data: { version: "D311-1" } });
  assert.deepEqual(r.sent[0].body, { member: "member:dev", version: "D311-1" });
  const seen = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group", { groupkeynotice: env({ ok: true, due: false, text: "" }) }) });
  assert.ok(!ops(seen).includes("groupkeynoticeseen"), "once seen, not again");
});

test("R4, R5 connecting, in DEC-156's order: the subscription (only while bootstrap's parts holds the sign-in), then an API key, then skip", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") });
  const order = acts(a.tree).map((b) => b.attrs["data-act"] + (b.attrs["data-step"] ? ":" + b.attrs["data-step"] : ""));
  assert.deepEqual(order, ["subscriptionsignin:start", "subscriptionsignin:code", "accountreferenceset"]);
  const t = textOf(a.tree);
  assert.ok(t.indexOf(said("screen.connect.signin.heading")) < t.indexOf(said("screen.connect.apikey.heading")) && t.indexOf(said("screen.connect.apikey.heading")) < t.indexOf(said("screen.connect.skip")));
  for (const [present, key] of [[false, "screen.connect.signin.absent"], [null, "screen.connect.signin.unread"]]) {
    const o = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { bootstrap: { ok: true, parts: [{ part: "signin", present }] } }) });
    assert.ok(!ops(o).includes("subscriptionsignin"), `no sign-in while signin is ${present}`);
    has(o, key);
    assert.ok(ops(o).includes("accountreferenceset"));
  }
  const old = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { bootstrap: { ok: true, service: "bio-plane" } }) });
  assert.ok(!ops(old).includes("subscriptionsignin"), "a plane answering no parts offers no sign-in");
});

test("R5 the subscription sign-in: start, the address offered in a new browsing context (noopener noreferrer), then the code in the body only; connected draws the member's own account", async () => {
  let connected = false;
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", {
    subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected, member: "member:dev" } : b.step === "start" ? { ok: true, address: "https://claude.ai/oauth/authorize?x=1" } : (connected = true, { ok: true, connected: true, member: "member:dev" }),
  }) });
  const s = await a.press("subscriptionsignin", { data: { step: "start" } });
  assert.deepEqual([s.sent[0].query, s.sent[0].body], [{}, { step: "start" }]);
  const link = all(a.tree, (e) => e.tag === "a" && e.attrs.href === "https://claude.ai/oauth/authorize?x=1")[0];
  assert.ok(link && link.attrs.target === "_blank" && link.attrs.rel === "noopener noreferrer");
  assert.deepEqual((await a.press("subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": "" } })).sent, [], "no code, nothing sent");
  const CODE = "SENTINEL-CODE-1234";
  const c = await a.press("subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": CODE } });
  assert.deepEqual([c.sent[0].query, c.sent[0].body], [{}, { step: "code", code: CODE }]);
  assert.deepEqual(situations(a), ["own"]);
  has(a, "screen.connect.own.subscription");
  assert.ok(!a.html.includes(CODE));
  assert.equal(a.p.all.filter((r) => JSON.stringify(r).includes(CODE)).length, 1, "sent once, never again");
});

test("R5 the sign-in's refusals drawn with this module's meanings; RUNNER_NOT_CONFIGURED and DISCLOSURE_DUE by the translation the door relays", async () => {
  const words = { NO_SIGNIN_WAITING: "screen.connect.refused.NO_SIGNIN_WAITING", SIGNIN_UNAVAILABLE: "screen.connect.refused.SIGNIN_UNAVAILABLE", SIGNIN_ADDRESS_UNEXPECTED: "screen.connect.refused.SIGNIN_ADDRESS_UNEXPECTED", AGENT_WORKER_UNBOUND: "screen.connect.refused.AGENT_WORKER_UNBOUND", AI_KEPT_AWAY: "screen.connect.refused.AI_KEPT_AWAY" };
  for (const [code, key] of Object.entries(words)) {
    const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : { ok: false, reason: code, code } }) });
    const before = a.text;
    await a.press("subscriptionsignin", { data: { step: "start" } });
    assert.equal(a.refused.text, said(key), code);
    assert.equal(a.text.replace(a.refused.text, "").replace(/\s+/g, " "), before.replace(/\s+/g, " "), "nothing else changes");
  }
  assert.ok(said("screen.connect.refused.NO_SIGNIN_WAITING").includes("timed out") && said("screen.connect.refused.AGENT_WORKER_UNBOUND").includes("can't run on your group's Civicsmith yet"));
  const r = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : { ok: false, reason: "SIGNIN_REFUSED", code: "SIGNIN_REFUSED", detail: "invalid code" } }) });
  await r.press("subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": "x" } });
  assert.equal(r.refused.text, said("screen.connect.refused.SIGNIN_REFUSED", { detail: "invalid code" }), "the runner's detail shown");
  for (const code of ["RUNNER_NOT_CONFIGURED", "DISCLOSURE_DUE"]) {
    const o = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : { ok: false, reason: code, code, translation: "relayed " + code } }) });
    await o.press("subscriptionsignin", { data: { step: "start" } });
    assert.equal(o.refused.text, "relayed " + code);
  }
});

test("R5 an API key: accountreferenceset with the key in the body only (and the member it is for), never drawn again", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") });
  const KEY = "sk-ant-api03-SENTINEL-OWN";
  const r = await a.press("accountreferenceset", { values: { "mc-key0": KEY } });
  assert.deepEqual([r.sent[0].query, r.sent[0].body], [{}, { member: "member:dev", kind: "apikey", secret: KEY }]);
  assert.ok(!a.html.includes(KEY));
  assert.equal(a.p.all.filter((x) => JSON.stringify(x).includes(KEY)).length, 1, "sent once, never again");
  assert.deepEqual((await a.press("accountreferenceset", { values: { "mc-key0": " " } })).sent, []);
});

test("R5 disconnect: a subscription by subscriptiondisconnect, an API key by accountreferenceremove; R9 the member's own account panel", async () => {
  const sub = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "subscription") });
  assert.deepEqual(ops(sub), ["accountusesset", "ailimitset", "subscriptiondisconnect"]);
  assert.deepEqual((await sub.press("subscriptiondisconnect")).sent[0].body, {});
  const own = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  assert.deepEqual(ops(own), ["accountreferenceremove", "accountusesset", "ailimitset"]);
  assert.deepEqual((await own.press("accountreferenceremove")).sent[0].body, { member: "member:dev" });
  // the panel over the member's own account: uses, limits, use, changes; no exploring (group level only)
  const o = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  for (const k of ["screen.panel.uses.heading", "screen.panel.limits.heading", "screen.panel.usage.heading", "screen.panel.changes.heading"]) has(o, k);
  assert.ok(!all(o.tree, (e) => e.attrs.id === "aio-explore").length, "no exploring for a member's own account");
  assert.deepEqual((await o.press("accountusesset", { data: { sw: "ask", to: "off" } })).sent[0].body, { owner: "member:dev", switch: "ask", on: false });
  assert.deepEqual((await o.press("ailimitset", { data: { remove: "" }, values: { "aio-scope": "overall", "aio-amount": "50000", "aio-unit": "tokens", "aio-period": "day" } })).sent[0].body, { owner: "member:dev", scope: "overall", unit: "tokens", period: "day", amount: 50000 });
  has(o, "screen.panel.usage.own");
  lacks(o, "screen.panel.usage.group");
});

test("R5 the group's key serving a member: no settings of the group's account are offered, and no account panel", async () => {
  const g = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group") });
  assert.ok(!ops(g).includes("ailimitset") && !ops(g).includes("accountusesset"));
  has(g, "screen.connect.grouplimits");
});
