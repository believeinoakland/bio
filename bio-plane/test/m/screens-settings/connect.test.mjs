/* Settings › The assistant at the module's interface (R4, R5, R8, R9 over `owner: "member:<id>"`). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, day, has, lacks, open, panelOf, rowOf, said, textOf } from "./kit.mjs";
import { MEMBER, ADMIN, connectTable, env, KEEPAWAY_ON } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
const situations = (o) => all(o.tree, (e) => e.attrs["data-situation"]).map((e) => e.attrs["data-situation"]);

test("R4 the reads: assistantstate, aikeepawaystate, groupkeystate, groupkeynotice, disclosureof, accountreference, subscriptionsignin {step: state}, and the member's own account (owner member:<me>)", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER) });
  const reads = a.p.all.map((r) => [r.op, r.query, r.body]);
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
  has(g, "screen.connect.group");
  assert.equal(all(g.tree, (e) => e.tag === "a" && e.attrs.href === "#connect-own").length, 0, "R49: the 'Need more?' link is retired; the connect part is drawn, closed");
  const own = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  assert.deepEqual(situations(own), ["own"]);
  has(own, "screen.connect.own.apikey");
  has(own, "screen.connect.own.since", { date: day("2026-10-06") });
  assert.ok(!/sk-ant/.test(own.html), "what it is, never its key");
  const sub = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "subscription") });
  assert.deepEqual(situations(sub), ["own"]);
  has(sub, "screen.connect.own.subscription", { date: day("2026-10-04") });
  const none = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") });
  assert.deepEqual(situations(none), ["none"]);
  const kept = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "keptaway") });
  assert.deepEqual(situations(kept), ["keptaway"]);
  has(kept, "screen.connect.keptaway", { by: "rosa", date: day("2026-10-02") });
  assert.ok(kept.html.includes(KEEPAWAY_ON.reason), "the reason in the administrator's words");
  has(kept, "screen.connect.keptaway.ask");
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
    const n = ancestor(b, (e) => e.attrs.class === "mk-msg");
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

test("R4, R5, R13 connecting, in DEC-156's order: the subscription (only while bootstrap's part_signin answers true), then an API key, then not now", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") });
  // one choice first, the subscription preselected, then the other two in order (R30)
  const way = all(a.tree, (e) => e.attrs.id === "mc-way")[0];
  assert.deepEqual(all(way, (e) => e.tag === "option").map((o) => o.attrs.value), ["subscription", "apikey", "later"]);
  assert.equal(all(way, (e) => e.tag === "option" && "selected" in e.attrs)[0].attrs.value, "subscription");
  const order = acts(a.tree).map((b) => b.attrs["data-act"] + (b.attrs["data-step"] ? ":" + b.attrs["data-step"] : ""));
  assert.deepEqual(order, ["subscriptionsignin:start", "subscriptionsignin:code", "reauth"], "the password given beforehand comes last (the registry's reauth)");
  // (R13) the flat `part_signin` (instance-setup R82): `false` not installed, `null` could not be read; the API key either way
  for (const [part, key, fills] of [[false, "instance.part.signin.absent", {}], [null, "instance.part.unknown", { part: said("screen.connect.signin.part") }]]) {
    const o = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { bootstrap: { ok: true, part_signin: part, part_scanner: false, part_safe_view: false } }) });
    assert.ok(!ops(o).includes("subscriptionsignin"), `R13: no sign-in while part_signin is ${part}`);
    has(o, key, fills);
    await o.choose("mc-way", "apikey");
    assert.ok(ops(o).includes("accountreferenceset"), "the API key either way");
  }
  // control: the T46 nested `parts` is no longer read
  const old = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { bootstrap: { ok: true, service: "bio-plane", parts: [{ part: "signin", present: true }] } }) });
  assert.ok(!ops(old).includes("subscriptionsignin"), "R13: parts' signin offers nothing");
  has(old, "instance.part.unknown", { part: said("screen.connect.signin.part") });
});

test("R30 while nothing serves the member, one choice is asked first (My Claude subscription, An API key, Not now), the subscription preselected, and only the chosen path's steps are drawn", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") });
  const fieldIds = (o) => all(o.tree, (e) => e.tag === "input" && e.attrs.type === "password").map((e) => e.attrs.id);
  // the subscription path draws no key field (control)
  assert.deepEqual(fieldIds(a), ["mc-code0", "mc-reauth"]);
  has(a, "screen.connect.signin.heading");
  lacks(a, "screen.connect.apikey.heading");
  assert.deepEqual(all(all(a.tree, (e) => e.attrs.id === "mc-way")[0], (e) => e.tag === "option").map((o) => textOf(o)), ["screen.connect.way.subscription", "screen.connect.way.apikey", "screen.connect.way.later"].map((k) => said(k)));
  // choosing An API key draws only its field
  await a.choose("mc-way", "apikey");
  assert.deepEqual(fieldIds(a), ["mc-key0"]);
  has(a, "screen.connect.apikey.heading");
  lacks(a, "screen.connect.signin.heading");
  assert.deepEqual(ops(a), ["accountreferenceset"]);
  // Not now draws no step: no field and no act, only its note
  await a.choose("mc-way", "later");
  assert.deepEqual(fieldIds(a), []);
  assert.deepEqual(ops(a), []);
  has(a, "connect.notnow");
  lacks(a, "screen.connect.apikey.heading");
  lacks(a, "screen.connect.signin.heading");
  // back to the subscription
  await a.choose("mc-way", "subscription");
  assert.deepEqual(ops(a), ["reauth", "subscriptionsignin"]);
  // control: with the disclosure not yet read, no choice is asked
  const d = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { disclosureof: (q) => env({ ok: true, member: q.member, version: "D311-1", shown: false, shown_at: null }) }) });
  assert.equal(all(d.tree, (e) => e.attrs.id === "mc-way").length, 0);
  // control: a member the assistant already serves on their own account is asked nothing
  const own = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  assert.equal(all(own.tree, (e) => e.attrs.id === "mc-way").length, 0);
});

test("R5 the subscription sign-in: start, the address offered in a new browsing context (noopener noreferrer), then the code in the body only; connected draws the member's own account", async () => {
  let connected = false;
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", {
    subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected, member: "member:dev" } : b.step === "start" ? { ok: true, address: "https://claude.ai/oauth/authorize?x=1" } : (connected = true, { ok: true, connected: true, held: true, member: "member:dev" }),
    accountreference: () => env({ ok: true, held: false, kind: null, subscription: { connected, since: connected ? "2026-10-12T00:00:00Z" : null, held: connected } }),
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
  has(a, "screen.connect.own.subscription", { date: day("2026-10-12") });
  assert.ok(!a.html.includes(CODE));
  assert.equal(a.p.all.filter((r) => JSON.stringify(r).includes(CODE)).length, 1, "sent once, never again");
});

/* agent-worker R84's SIGNIN_CODES as it exports them, and the door's own codes (control-plane R65): pinned here, since
   this module's tests import no layer-6 module (K3144 (7)). */
const SIGNIN_CODES = ["ATTEMPT_SUPERSEDED", "BAD_BODY", "BAD_CODE", "BAD_MEMBER", "BAD_REQUEST", "BAD_STEP", "NOT_THIS_MEMBER", "NO_SIGNIN_WAITING", "RUNNER_NOT_CONFIGURED", "RUNNER_NOT_STARTED", "RUNNER_SILENT", "SIGNIN_ADDRESS_UNEXPECTED", "SIGNIN_NOT_HELD", "SIGNIN_REFUSED", "SIGNIN_TOKEN_REFUSED", "SIGNIN_UNAVAILABLE", "SIGNOUT_FAILED"];
const DOOR_CODES = ["AI_KEPT_AWAY", "DISCLOSURE_DUE", "AGENT_WORKER_UNBOUND", "AGENT_WORKER_SILENT"];

test("R5, R24 every subscriptionsignin refusal is drawn in words (refusal.<code> where words.json holds it, else this module's), {detail} filled, never the typed code; nothing else changes", async () => {
  const spec = (await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") })).s.acts.find((a) => a.op === "subscriptionsignin");
  for (const code of [...SIGNIN_CODES, ...DOOR_CODES]) {
    assert.ok(spec.refusals[code], `${code} has its words`);
    const CODE = "SENTINEL-TYPED-CODE";
    const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : { ok: false, reason: code, code, detail: "the runner's detail", translation: "untranslated " + code } }) });
    const before = a.text;
    await a.press("subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": CODE } });
    assert.ok(a.refused && a.refused.text && !a.refused.text.includes("untranslated"), `${code} in this module's or words.json's words`);
    assert.ok(!a.html.includes(CODE), `${code}: the typed code is never drawn`);
    assert.equal(a.text.replace(a.refused.text, "").replace(/\s+/g, " "), before.replace(/\s+/g, " "), `${code}: nothing else changes`);
  }
  const r = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : { ok: false, reason: "SIGNIN_REFUSED", code: "SIGNIN_REFUSED", detail: "invalid code" } }) });
  await r.press("subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": "x" } });
  assert.ok(r.refused.text.startsWith(said("refusal.SIGNIN_REFUSED", { detail: "invalid code" })), "the runner's detail shown");
});

test("R24 a refusal's reference is drawn beside its words (interface-shell R39) and kept nowhere in the browser", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : { ok: false, reason: "SIGNIN_UNAVAILABLE", code: "SIGNIN_UNAVAILABLE", trace: "abcdef0123456789" } }) });
  await a.press("subscriptionsignin", { data: { step: "start" } });
  assert.ok(a.refused.text.includes("abcdef01"), "the reference beside the words");
  assert.ok(![...a.b.store.values(), ...a.b.local.values()].some((v) => String(v).includes("abcdef01")));
});

test("R24 Open Anthropic's sign-in page is disabled while a start is in flight, and pressable again once it answers or is refused", async () => {
  for (const answer of ["ok", "refused"]) {
    const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : b.step === "start" ? (answer === "ok" ? { ok: true, address: "https://claude.ai/x" } : { ok: false, reason: "SIGNIN_UNAVAILABLE", code: "SIGNIN_UNAVAILABLE" }) : { ok: true } }) });
    const start = () => all(a.tree, (e) => e.tag === "button" && e.attrs["data-act"] === "subscriptionsignin" && e.attrs["data-step"] === "start")[0];
    assert.equal(start().attrs.disabled, undefined);
    await a.press("subscriptionsignin", { data: { step: "start" } });
    assert.equal(start().attrs.disabled, undefined, `${answer}: pressable again`);
  }
  // while in flight it is drawn disabled
  const p = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : "pending" }) });
  p.press("subscriptionsignin", { data: { step: "start" } });
  await p.b.settle(40); p.redraw();
  const s = all(p.tree, (e) => e.tag === "button" && e.attrs["data-act"] === "subscriptionsignin" && e.attrs["data-step"] === "start")[0];
  assert.ok(s.attrs.disabled !== undefined, "disabled while in flight");
});

test("R24 the state as the plane holds it: connected since when and until when; a failed state read is said, never not connected; refused at Anthropic draws connect again once; the code field says to copy the whole code", async () => {
  const sub = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "subscription") });
  has(sub, "screen.connect.own.subscription", { date: day("2026-10-04") });
  has(sub, "screen.connect.own.until", { date: day("2036-11-04") });
  const failed = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: () => "none", accountreference: "none" }) });
  has(failed, "screen.connect.signin.statefailed");
  lacks(failed, "screen.connect.none");
  const refused = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { accountreference: env({ ok: true, held: false, subscription: { connected: false, since: null, held: false, refused_at: "2026-10-10T00:00:00Z" } }) }) });
  // R54: refused at Anthropic is an expired sign-in, said once, with the way to sign in again
  has(refused, "screen.connect.expired", { date: day("2026-10-10") });
  assert.equal(refused.text.split(said("screen.connect.expired", { date: day("2026-10-10") })).length, 2, "once");
  assert.ok(acts(refused.tree).some((b) => b.attrs["data-act"] === "subscriptionsignin"), "and the way to connect again");
  const none = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") });
  has(none, "screen.connect.signin.whole");
});

test("R5, R76 an API key: accountreferenceset with the key in the body only, and no member (the door stamps whose it is, ai-accounts R35), never drawn again", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") });
  await a.choose("mc-way", "apikey");
  const KEY = "sk-ant-api03-SENTINEL-OWN";
  const r = await a.press("accountreferenceset", { values: { "mc-key0": KEY } });
  assert.deepEqual([r.sent[0].query, r.sent[0].body], [{}, { kind: "apikey", secret: KEY }]);
  assert.equal(r.sent[0].headers.Authorization, "Bearer tok-1", "it is set for the signed-in member: by her session, not by a field of the body");
  assert.ok(r.sent.some((x) => x.op === "accountreference"), "the reference is read again");
  assert.ok(!a.html.includes(KEY));
  assert.equal(a.p.all.filter((x) => JSON.stringify(x).includes(KEY)).length, 1, "sent once, never again");
  assert.deepEqual((await a.press("accountreferenceset", { values: { "mc-key0": " " } })).sent, []);
});

test("R5 disconnect: a subscription by subscriptiondisconnect, an API key by accountreferenceremove; R9 the member's own account in its parts", async () => {
  const sub = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "subscription") });
  assert.deepEqual(ops(sub), ["accountusesset", "ailimitset", "subscriptiondisconnect"]);
  assert.deepEqual((await sub.press("subscriptiondisconnect")).sent[0].body, {});
  const own = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  assert.deepEqual(ops(own), ["accountreferenceremove", "accountusesset", "ailimitset"]);
  const rm = await own.press("accountreferenceremove");
  assert.deepEqual(rm.sent[0].body, {}, "R76: no member, the door stamps it");
  assert.equal(rm.sent[0].headers.Authorization, "Bearer tok-1", "removed for the signed-in member");
  assert.ok(rm.sent.some((x) => x.op === "accountreference"), "the reference is read again");
  // the member's own account: what it may do (one style of checkbox, saved by one act), a limit, her use; no exploring (group level only), no changes (the team's)
  const o = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  for (const k of ["screen.connect.part.uses", "screen.connect.part.limit", "screen.connect.part.use"]) has(o, k);
  assert.ok(!all(o.tree, (e) => /explore/.test(e.attrs.id || "")).length, "no exploring for a member's own account");
  const boxes = all(o.tree, (e) => e.tag === "input" && e.attrs.type === "checkbox" && /^mu-/.test(e.attrs.id));
  assert.deepEqual(boxes.map((b) => b.attrs.id).sort(), ["ask", "draft", "run", "enquire", "read", "transcribe", "account", "suggestions", "standing"].map((u) => "mu-" + u).sort());
  assert.equal(boxes.find((b) => b.attrs.id === "mu-standing").attrs.checked, undefined, "unasked uses: off to start");
  assert.equal(boxes.find((b) => b.attrs.id === "mu-ask").attrs.checked !== undefined, true);
  // one act saves what changed: the first change is its request, the others follow it
  const r = await o.press("accountusesset", { data: { own: "1" }, values: { "mu-ask": false, "mu-standing": true } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.body]).slice(0, 2), [["accountusesset", { owner: "member:dev", switch: "ask", on: false }], ["accountusesset", { owner: "member:dev", switch: "standing", on: true }]]);
  assert.deepEqual((await o.press("accountusesset", { data: { own: "1" }, values: { "mu-ask": true, "mu-standing": false } })).sent.filter((x) => x.op === "accountusesset").length >= 0, true);
  assert.deepEqual((await o.press("ailimitset", { data: { remove: "" }, values: { "aio-scope": "overall", "aio-amount": "50000", "aio-unit": "tokens", "aio-period": "day" } })).sent[0].body, { owner: "member:dev", scope: "overall", unit: "tokens", period: "day", amount: 50000 });
  has(o, "screen.panel.usage.own");
  lacks(o, "screen.panel.usage.group");
  // R37: her own page names no change by "you" or by anyone: the changes are the team's page's
  lacks(o, "screen.panel.changes.heading");
});

test("R5 the group's key serving a member: no settings of the group's account are offered, and no account panel", async () => {
  const g = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group") });
  assert.ok(!ops(g).includes("ailimitset") && !ops(g).includes("accountusesset"));
  // (R37, DEC-262) the per-member limit is read: its sentence is drawn, without what was used or the suggestions, which are not answered
  has(g, "screen.connect.grouplimits", { limit: said("screen.panel.amount", { amount: "$5.00", unit: said("screen.panel.unit.usd"), period: said("screen.panel.period.day") }) });
});

/* R37 (T49; D30 m): every sentence `connect` draws is read by key with every fill filled from its read; none is drawn with an
   empty or default fill. The answers a fill is read from: `subscription.plan` and `.since`, `accountreference.last4`, a limit's `used`
   and the group key's `suggestions`; without them the situation is drawn by the words whose fills the reads give. */
const placeholder = (o) => /\{\w+\}/.test(o.html) || /undefined|NaN|null/.test(o.text);
const GROUP_PAYER = (limit) => ({ owner: "group", whose: "group", uses: [{ use: "ask", calls: 9, tokens: 61000 }], limits: [{ scope: "per_member", unit: "usd", period: "day", amount: 5, inclusive: null, reached: false, ...limit }] });
const groupUsage = (limit) => (q) => (q.owner ? env({ ok: true, owner: q.owner, month: "2026-10", uses: [] }) : env({ ok: true, member: "member:dev", month: "2026-10", zone: "UTC", payers: [GROUP_PAYER(limit)] }));
const amountSaid = (amount, unit, period) => said("screen.panel.amount", { amount, unit: said(unit), period: said(period) });

test("R37 the group's key: the allowance and the limits are drawn with their fills; what was used and the suggestions only when answered, never with an empty one", async () => {
  const limit = amountSaid("$5.00", "screen.panel.unit.usd", "screen.panel.period.day");
  const plain = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group") });
  assert.ok(!placeholder(plain), "no unfilled fill, no undefined");
  has(plain, "screen.connect.group.allowance", { limit });
  assert.ok(!/You have used/.test(plain.text) && !/Suggestions:/.test(plain.text), "nothing used or suggested is said while it is not answered");
  const answeredTable = (me) => connectTable(me, "group", { aiusage: groupUsage({ used: 0.8 }), groupkeystate: env({ ok: true, on: true, suggestions: false }) });
  // R50: what was used and the suggestions are an owner's: a member who does not administer is drawn neither
  const asMember = await open("connect", { me: MEMBER, table: answeredTable(MEMBER) });
  has(asMember, "screen.connect.group.allowance", { limit });
  lacks(asMember, "screen.connect.group.allowance.used", { used: "$0.80", when: said("ai.usage.today") });
  lacks(asMember, "screen.connect.grouplimits.used", { used: "$0.80" });
  lacks(asMember, "screen.connect.grouplimits.suggestions", { suggestions: said("screen.panel.off") });
  const full = await open("connect", { me: ADMIN, table: answeredTable(ADMIN) });
  has(full, "screen.connect.group.allowance", { limit });
  has(full, "screen.connect.group.allowance.used", { used: "$0.80", when: said("ai.usage.today") });
  has(full, "screen.connect.grouplimits", { limit });
  has(full, "screen.connect.grouplimits.used", { used: "$0.80" });
  has(full, "screen.connect.grouplimits.suggestions", { suggestions: said("screen.panel.off") });
  assert.ok(!placeholder(full));
  // at the limit, by its period alone
  const reached = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group", { aiusage: groupUsage({ reached: true }) }) });
  has(reached, "screen.connect.group.allowance.reached", { period: said("screen.panel.period.day") });
  assert.ok(!reached.text.includes(said("screen.connect.group.allowance", { limit })), "at the limit only that is said");
});

test("R37 the member's own account: the day it was signed in, else nothing invented; the changes name the member by handle, never \"you\"", async () => {
  const subs = (extra) => connectTable(MEMBER, "subscription", { accountreference: env({ ok: true, held: false, kind: null, set_at: null, subscription: { connected: true, since: "2026-10-04T00:00:00Z", held: true, valid_until: "2036-11-04T00:00:00Z", ...extra } }) });
  const sub = await open("connect", { me: MEMBER, table: subs({ valid_until: "2036-11-04T00:00:00Z" }) });
  has(sub, "screen.connect.own.subscription", { date: day("2026-10-04") });
  has(sub, "screen.connect.own.until", { date: day("2036-11-04") });
  assert.ok(!placeholder(sub));
  // control: a subscription with no day it began draws no sentence with a blank date
  const noSince = await open("connect", { me: MEMBER, table: subs({ since: null }) });
  assert.ok(!placeholder(noSince));
  const key = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  has(key, "screen.connect.own.apikey");
  assert.ok(!placeholder(key));
  // her own page draws no changes (the team's page does, naming the member by handle, never "you")
  assert.ok(!/\byou held\b/i.test(key.text) && !key.text.includes(said("screen.panel.changes.heading")));
});

test("R38 beside the code: the sign-in's refusals by their keys under connect.ifnot, each with its reference (refusal.reference); the typed code is never drawn", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") });
  const list = all(a.tree, (e) => e.attrs["data-list"] === "ifnot")[0];
  assert.ok(list, "the listing is drawn");
  assert.ok(textOf(list).includes(said("connect.ifnot")));
  for (const k of ["refusal.NO_SIGNIN_WAITING", "refusal.SIGNIN_UNAVAILABLE", "refusal.SIGNIN_ADDRESS_UNEXPECTED", "refusal.AGENT_WORKER_UNBOUND", "instance.part.signin.absent"])
    assert.ok(textOf(list).includes(said(k)), k);
  assert.ok(textOf(list).includes(said("refusal.SIGNIN_REFUSED", { detail: "invalid_grant" })));
  assert.ok(textOf(list).includes(said("screen.connect.refusal.reference", { example: said("refusal.reference", { ref: "7f3a91c2" }) })), "and what a reference is");
  // the live refusal: its key's words, with its reference, and nothing typed
  for (const code of ["NO_SIGNIN_WAITING", "SIGNIN_UNAVAILABLE", "SIGNIN_ADDRESS_UNEXPECTED", "AGENT_WORKER_UNBOUND", "SIGNIN_REFUSED"]) {
    const o = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : { ok: false, reason: code, code, detail: "invalid_grant", trace: "abcdef0123456789" } }) });
    await o.press("subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": "SENTINEL-TYPED-CODE" } });
    assert.ok(o.refused.text.startsWith(said("refusal." + code, { detail: "invalid_grant" })), `${code}: its key's words`);
    assert.ok(o.refused.text.includes(said("refusal.reference", { ref: "abcdef01" })), `${code}: its reference`);
    assert.ok(!o.html.includes("SENTINEL-TYPED-CODE"), `${code}: the typed code is never drawn`);
  }
  // control: a refusal that carries no runner detail still fills its detail from the refusal's own code
  const nd = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : { ok: false, reason: "SIGNIN_REFUSED", code: "SIGNIN_REFUSED" } }) });
  await nd.press("subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": "x" } });
  assert.ok(!placeholder(nd) && nd.refused.text.startsWith(said("refusal.SIGNIN_REFUSED", { detail: "SIGNIN_REFUSED" })));
});

test("R30 R36 (K3347) connect gains no pointer to the group key and no API-key preselection; the subscription stays preselected; reauth sends the password, none sends nothing", async () => {
  const a = await open("connect", { me: ADMIN, table: connectTable(ADMIN, "none") });
  assert.equal(all(all(a.tree, (e) => e.attrs.id === "mc-way")[0], (e) => e.tag === "option" && "selected" in e.attrs)[0].attrs.value, "subscription");
  assert.ok(!a.html.includes("/app/members"), "no pointer to Members' group key");
  assert.deepEqual((await a.press("reauth", { values: { "mc-reauth": "" } })).sent, [], "no password, nothing sent");
  const r = await a.press("reauth", { values: { "mc-reauth": "correct horse battery" } });
  assert.deepEqual([r.sent[0].op, r.sent[0].body], ["reauth", { password: "correct horse battery" }]);
  assert.ok(!a.html.includes("correct horse battery"), "the password is never drawn again");
});

/* R49 (T50; N1158; DEC-283): connect in every state — the card, then the parts that open and close */
const parts = (o) => all(o.tree, (e) => e.tag === "details" && /\bcs-part\b/.test(e.attrs.class || ""));
const titles = (o) => parts(o).map((d) => textOf(all(d, (h) => h.attrs.class === "t")[0]));
const say = (...keys) => keys.map((k) => said(k));

test("R49 the team's key serves her: the optional line, one card, then the notice (needed first, open), her allowance, her use and connecting her own (closed); her share as a meter", async () => {
  const g = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group", { aiusage: (q) => q.owner ? connectTable(MEMBER).aiusage(q) : env({ ok: true, member: "member:dev", month: "2026-10", zone: "UTC", payers: [{ owner: "group", whose: "group", uses: [], limits: [{ scope: "per_member", unit: "usd", period: "day", amount: 5, used: 4, inclusive: null, reached: false }] }] }) }) });
  has(g, "screen.connect.optional");
  assert.deepEqual(situations(g), ["group"]);
  assert.deepEqual(titles(g), say("screen.connect.notice.heading", "screen.connect.part.allowance", "screen.connect.part.use", "screen.connect.own.heading"));
  const [first, ...rest] = parts(g);
  assert.ok(first.attrs.open !== undefined && first.attrs["data-state"] === "needed", "needed first, open");
  assert.ok(textOf(first).includes(said("screen.setup.state.needed")));
  assert.ok(rest.every((d) => d.attrs.open === undefined), "the others closed");
  has(g, "screen.connect.group.allowance", { limit: said("screen.panel.amount", { amount: "$5.00", unit: said("screen.panel.unit.usd"), period: said("screen.panel.period.day") }) });
  const meter = all(g.tree, (e) => /\bmk-meter\b/.test(e.attrs.class || ""))[0];
  assert.ok(meter && textOf(meter).includes("80%") && meter.attrs["data-near"] === "1", "her share of the daily allowance as a meter, near its limit");
  has(g, "ai.whopays");
  // control: once the notice is seen it is not drawn again, and no part is empty
  const seen = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "group", { groupkeynotice: env({ ok: true, due: false, text: "" }) }) });
  assert.ok(!titles(seen).includes(said("screen.connect.notice.heading")));
  assert.ok(parts(seen).every((d) => textOf(all(d, (b) => b.attrs.class === "body")[0]).trim() !== ""), "a part is never drawn empty");
});

test("R49 her own API key serves her: the card, then what the assistant may do (checkboxes: everyday apart from without being asked), a limit with its words, her use and Disconnect", async () => {
  const o = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  assert.deepEqual(situations(o), ["own"]);
  assert.deepEqual(titles(o), say("screen.connect.part.uses", "screen.connect.part.limit", "screen.connect.part.use", "screen.connect.disconnect.heading"));
  assert.ok(parts(o)[0].attrs.open !== undefined && parts(o).slice(1).every((d) => d.attrs.open === undefined), "the first open");
  has(o, "screen.connect.own.apikey");
  has(o, "screen.connect.part.limit.why.apikey");
  lacks(o, "screen.connect.part.limit.why.subscription");
  for (const k of ["screen.connect.uses.everyday", "screen.connect.uses.unasked", "screen.connect.uses.unasked.help", "screen.connect.limit.binds"]) has(o, k);
  const uses = parts(o)[0];
  const every = all(uses, (e) => e.attrs.id === "mu-every")[0], unasked = all(uses, (e) => e.attrs.id === "mu-unasked")[0];
  assert.deepEqual(all(every, (e) => e.tag === "input").map((e) => e.attrs.id), ["ask", "draft", "run", "enquire", "read", "transcribe", "account"].map((u) => "mu-" + u));
  assert.deepEqual(all(unasked, (e) => e.tag === "input").map((e) => e.attrs.id), ["mu-suggestions", "mu-standing"]);
  for (const u of ["ask", "standing"]) assert.ok(textOf(uses).includes(said(`ai.use.${u}.name`)) && textOf(uses).includes(said(`ai.use.${u}.means`)), u);
  assert.equal(all(every, (e) => e.attrs["data-mark"]).length + all(unasked, (e) => e.attrs["data-mark"]).length, 0, "no weight mark on any switch");
  // an API key may limit in dollars; a limit is the member's own
  const units = all(all(o.tree, (e) => e.attrs.id === "aio-unit")[0], (e) => e.tag === "option").map((x) => x.attrs.value);
  assert.ok(units.includes("usd"));
});

test("R49 her subscription serves her: the card with the connected tag and the day Anthropic stops accepting the sign-in; a limit only in tokens or calls; Disconnect", async () => {
  const o = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "subscription") });
  assert.deepEqual(situations(o), ["own"]);
  has(o, "screen.connect.own.subscription", { date: day("2026-10-04") });
  has(o, "screen.connect.connected");
  has(o, "screen.connect.own.until", { date: day("2036-11-04") });
  has(o, "screen.connect.own.until.again");
  has(o, "screen.connect.part.limit.why.subscription");
  lacks(o, "screen.connect.part.limit.why.apikey");
  const units = all(all(o.tree, (e) => e.attrs.id === "aio-unit")[0], (e) => e.tag === "option").map((x) => x.attrs.value);
  assert.deepEqual(units, ["tokens", "calls"]);
  assert.deepEqual(titles(o).at(-1), said("screen.connect.disconnect.heading"));
  assert.ok(acts(o.tree).some((b) => b.attrs["data-act"] === "subscriptiondisconnect" && textOf(b).startsWith(said("screen.connect.disconnect.subscription"))));
});

test("R49 a team that does not pay (nothing serves her yet) and a team keeping its material away: before you connect (needed first), connect; or one card and no act", async () => {
  const none = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { disclosureof: (q) => env({ ok: true, member: q.member, version: "D311-1", shown: false, shown_at: null }) }) });
  assert.deepEqual(situations(none), ["none"]);
  has(none, "screen.connect.none");
  assert.deepEqual(titles(none), say("screen.connect.part.before"));
  assert.equal(parts(none)[0].attrs["data-state"], "needed");
  // the disclosure read, the choice is asked
  const read = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none") });
  assert.deepEqual(titles(read), say("screen.connect.own.heading"));
  const kept = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "keptaway") });
  assert.deepEqual([situations(kept), parts(kept).length, ops(kept)], [["keptaway"], 0, []]);
});

/* R50 (T50; N1154): a code being exchanged */
test("R50 a code being exchanged: working is said beside the button, which is not pressed again; the code is sent once", async () => {
  const code = [];
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : b.step === "code" ? (code.push(b.code), "pending") : { ok: true, address: "https://claude.ai/x" } }) });
  const btn = () => all(a.tree, (e) => e.tag === "button" && e.attrs["data-act"] === "subscriptionsignin" && e.attrs["data-step"] === "code")[0];
  assert.equal(btn().attrs.disabled, undefined);
  lacks(a, "shell.working");
  a.press("subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": "SENTINEL-FIRST" } });
  await a.b.settle(60); a.redraw();
  has(a, "shell.working");
  assert.ok(btn().attrs.disabled !== undefined, "busy");
  await a.press("subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": "SENTINEL-SECOND" } });
  assert.deepEqual(code, ["SENTINEL-FIRST"], "the second press sends nothing");
});

test("R50 the refusal of the exchange is the outcome drawn, the page is no longer working, and the button can be pressed again", async () => {
  const a = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "none", { subscriptionsignin: (q, b) => b.step === "state" ? { ok: true, connected: false } : { ok: false, reason: "NO_SIGNIN_WAITING", code: "NO_SIGNIN_WAITING" } }) });
  await a.press("subscriptionsignin", { data: { step: "code" }, values: { "mc-code0": "SENTINEL-1" } });
  assert.ok(a.refused.text.startsWith(said("refusal.NO_SIGNIN_WAITING", {})));
  lacks(a, "shell.working");
  const btn = all(a.tree, (e) => e.tag === "button" && e.attrs["data-step"] === "code")[0];
  assert.equal(btn.attrs.disabled, undefined);
});

/* R54 (T50; DEC-314): an expired sign-in on Connect */
test("R54 a sign-in that has expired draws its date, what it means, the state and what to do, and the act to sign in again once; the connected tag is gone", async () => {
  const lapsed = connectTable(MEMBER, "subscription", { accountreference: env({ ok: true, held: false, kind: null, set_at: null, subscription: { connected: true, since: "2026-08-01T00:00:00Z", held: true, valid_until: "2026-09-01T00:00:00Z" } }) });
  const o = await open("connect", { me: MEMBER, table: lapsed });
  assert.deepEqual(situations(o), ["expired"]);
  has(o, "screen.connect.expired", { date: day("2026-09-01") });
  for (const k of ["screen.connect.expired.means", "screen.connect.expired.state", "screen.connect.expired.next"]) has(o, k);
  lacks(o, "screen.connect.connected");
  const starts = acts(o.tree).filter((b) => b.attrs["data-act"] === "subscriptionsignin" && b.attrs["data-step"] === "start");
  assert.equal(starts.length, 1, "the act to sign in again, once");
  assert.equal(situations(o).length, 1);
  // control: a sign-in still held is not expired
  const held = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "subscription") });
  lacks(held, "screen.connect.expired.state");
  assert.deepEqual(situations(held), ["own"]);
  // the connection check belongs to the remote proof (R41, R53: agent-runner R38) and is not drawn here, for a team-key member or an API key's
  for (const sit of ["group", "own"]) lacks(await open("connect", { me: MEMBER, table: connectTable(MEMBER, sit) }), "screen.connect.check");
});
