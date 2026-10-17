/* Settings › The team's assistant at the module's interface (R48; the reads and acts R47 moved here from Members: R1, R2, R8, R10 over `owner: "group"`). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, day, has, lacks, open, said, textOf, SCREENS } from "./kit.mjs";
import { ADMIN, MEMBER, env, teamaiTable, KEEPAWAY_ON } from "./fixtures.mjs";

const parts = (o) => all(o.tree, (e) => e.tag === "details" && /\bcs-part\b/.test(e.attrs.class || ""));
const titles = (o) => parts(o).map((d) => textOf(all(d, (h) => h.attrs.class === "t")[0]));
const btn = (tree, op) => acts(tree).filter((b) => b.attrs["data-act"] === op);

test("R48 the reads: the key, the keep-away and the team's account (owner group) for an administrator; the page is the registry's six acts", async () => {
  const a = await open("teamai", { me: ADMIN, table: teamaiTable() });
  const reads = a.p.requests.map((r) => [r.op, r.query]);
  for (const want of [["groupkeystate", {}], ["aikeepawaystate", {}], ["accountuses", { owner: "group" }], ["ailimits", { owner: "group" }], ["aiusage", { owner: "group" }], ["accounthistory", { owner: "group" }], ["aiuseovertime", { owner: "group" }]])
    assert.ok(reads.some((r) => JSON.stringify(r) === JSON.stringify(want)), JSON.stringify(want));
  assert.deepEqual(SCREENS.find((s) => s.id === "teamai").acts.map((x) => x.op).sort(), ["accountusesset", "aikeepaway", "ailimitset", "groupkeyremove", "groupkeyset", "groupkeyswitch"]);
  has(a, "screen.teamai.sub");
});

test("R48 a card says how the key stands, with this month's meter; then the parts that open and close, the uses open; Which account pays folds at the foot", async () => {
  const over = (q) => env({ ok: true, owner: q.owner, periods: [{ scope: "overall", period: "month", unit: "usd", used: 51, limit: 60 }] });
  const a = await open("teamai", { me: ADMIN, table: teamaiTable({ aiuseovertime: over }) });
  const card = all(a.tree, (e) => e.attrs["data-situation"] === "teamkey")[0];
  assert.ok(card, "the card");
  for (const [k, f] of [["screen.teamai.held"], ["screen.teamai.setby", { who: "rosa", date: day("2026-10-06") }], ["screen.teamai.on"]]) assert.ok(textOf(card).includes(said(k, f)), k);
  const meter = all(card, (e) => /\bmk-meter\b/.test(e.attrs.class || ""))[0];
  assert.ok(meter && textOf(meter).includes("85%") && meter.attrs["data-near"] === "1", "this month's meter on the team's key");
  assert.deepEqual(titles(a), ["screen.panel.uses.heading", "screen.panel.limits.heading", "screen.panel.usage.heading", "screen.members.keepaway.heading", "screen.teamai.key", "screen.panel.changes.heading"].map((k) => said(k)));
  assert.ok(parts(a)[0].attrs.open !== undefined && parts(a).slice(1).every((d) => d.attrs.open === undefined), "the first opens");
  for (const k of ["screen.teamai.use.why", "screen.teamai.key.why", "screen.teamai.changes.why"]) has(a, k);
  const fold = all(a.tree, (e) => e.tag === "details" && e.attrs["data-fold"] === "whopays")[0];
  assert.ok(fold && textOf(fold).includes(said("ai.whopays")), "Which account pays, and when: folded");
  assert.ok(a.html.lastIndexOf('data-fold="whopays"') > a.html.lastIndexOf('class="cs-part"'), "at the foot");
  // control: a key not held says so, with no sentence of when
  const none = await open("teamai", { me: ADMIN, table: teamaiTable({ groupkeystate: env({ ok: true, held: false, on: false }) }) });
  has(none, "screen.members.key.none");
  lacks(none, "screen.teamai.held");
});

test("R48 the uses and limits of the team's key, its use summed over members naming none, and the changes with who and when", async () => {
  const a = await open("teamai", { me: ADMIN, table: teamaiTable() });
  for (const k of ["screen.panel.uses.heading", "screen.panel.limits.heading", "screen.panel.usage.heading", "screen.panel.changes.heading"]) has(a, k);
  const usage = parts(a).find((d) => textOf(all(d, (h) => h.attrs.class === "t")[0]) === said("screen.panel.usage.heading"));
  const ut = textOf(usage);
  assert.ok(ut.includes(said("screen.panel.usage.all")), "summed");
  for (const id of ["rosa", "dev", "ana", "lu", "kim"]) assert.ok(!new RegExp(`\\b${id}\\b`).test(ut), `the use names no member (${id})`);
  assert.ok(all(a.tree, (e) => e.attrs.id === "aig-explore").length === 1, "exploring is at the team's level");
});

test("R48 the team's key: groupkeyset sends the key in the body only, then groupkeyswitch on; never drawn again; switch and remove", async () => {
  const a = await open("teamai", { me: ADMIN, table: teamaiTable() });
  const KEY = "sk-ant-api03-SENTINELKEY";
  const r = await a.press("groupkeyset", { values: { "mk-key0": KEY } });
  assert.deepEqual(r.sent.map((x) => [x.op, x.query, x.body]).slice(0, 2), [["groupkeyset", {}, { key: KEY }], ["groupkeyswitch", {}, { on: true }]]);
  assert.ok(!a.html.includes(KEY), "never drawn again");
  assert.ok(!a.p.requests.slice(1).some((x) => x.op !== "groupkeyset" && JSON.stringify(x).includes(KEY)), "never sent again");
  assert.deepEqual((await a.press("groupkeyswitch", { data: { on: "off" } })).sent[0].body, { on: false });
  assert.equal(btn(a.tree, "groupkeyswitch")[0].attrs["data-on"], "off", "drawn to switch off while on");
  assert.deepEqual((await a.press("groupkeyremove")).sent[0].body, {});
  assert.deepEqual((await a.press("groupkeyset", { values: { "mk-key0": " " } })).sent, [], "a blank key sends nothing");
  // a refused key is not drawn either
  const x = await open("teamai", { me: ADMIN, table: teamaiTable({ groupkeyset: () => ({ ok: false, reason: "KEY_REFUSED", code: "KEY_REFUSED" }) }) });
  await x.press("groupkeyset", { values: { "mk-key0": KEY } });
  assert.ok(!x.html.includes(KEY) && ![...x.b.store.values(), ...x.b.local.values()].some((v) => String(v).includes(KEY)));
});

test("R48 aikeepaway: says first what it does; on only with a reason of 1 to 2,000 characters, for every use or the ones chosen; off with its reason too", async () => {
  const a = await open("teamai", { me: ADMIN, table: teamaiTable() });
  const form = ancestor(btn(a.tree, "aikeepaway")[0], (e) => e.tag === "div" && e.children.filter((c) => c.tag)[0] && e.children.filter((c) => c.tag)[0].tag === "p" && textOf(e.children.filter((c) => c.tag)[0]) === said("act.aikeepaway.does"));
  assert.ok(form, "what it does, first");
  assert.equal(a.s.acts.find((x) => x.op === "aikeepaway").reasonField, "reason");
  assert.deepEqual((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-all": true, "mk-why": "We hold tips." } })).sent[0].body, { on: true, reason: "We hold tips." });
  assert.deepEqual((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-some": true, "mk-use-ask": true, "mk-use-run": true, "mk-why": "Tips." } })).sent[0].body, { on: true, reason: "Tips.", uses: ["ask", "run"] });
  for (const why of ["", " ", "x".repeat(2001)]) {
    assert.deepEqual((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-all": true, "mk-why": why } })).sent, [], "no reason, no keep-away");
    assert.equal(a.refused.key, "screen.members.keepaway.noreason");
  }
  assert.equal((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-all": true, "mk-why": "x".repeat(2000) } })).sent[0].body.reason.length, 2000);
  assert.deepEqual((await a.press("aikeepaway", { data: { on: "on" }, values: { "mk-some": true, "mk-use-ask": false, "mk-use-run": false, "mk-why": "x" } })).sent, [], "some, but none chosen");
  const on = await open("teamai", { me: ADMIN, table: teamaiTable({ aikeepawaystate: env({ ...KEEPAWAY_ON, uses: ["ask"] }) }) });
  has(on, "screen.members.keepaway.on", { by: "rosa", date: day("2026-10-02") });
  assert.ok(on.html.includes(KEEPAWAY_ON.reason));
  assert.deepEqual((await on.press("aikeepaway", { data: { on: "off" }, values: { "mk-why": "We publish our sources now." } })).sent[0].body, { on: false, reason: "We publish our sources now." });
  assert.deepEqual((await on.press("aikeepaway", { data: { on: "off" }, values: { "mk-why": "" } })).sent, [], "turning it off is reasoned too");
});

test("R48 a member never reaches the page: for one who does not administer it draws only that it is administrators', and reads nothing", async () => {
  const m = await open("teamai", { me: MEMBER, table: teamaiTable() });
  has(m, "screen.teamai.purpose");
  assert.deepEqual(SCREENS.find((s) => s.id === "teamai").reads({ me: MEMBER }), {}, "the screen asks nothing of a member");
  assert.deepEqual(m.p.requests.filter((r) => ["aikeepawaystate", "accountuses", "ailimits", "aiusage", "accounthistory", "aiuseovertime"].includes(r.op)), [], "nothing the owners refuse a member is read");
  assert.deepEqual(acts(m.tree), []);
  assert.equal(parts(m).length, 0);
  assert.ok(!m.html.includes("cs-part"));
});

test("R48 control: the key is never drawn again after it is set, held or not; a refusal is drawn beside its act and nothing else changes", async () => {
  const KEY = "sk-ant-api03-NEVERAGAIN";
  const a = await open("teamai", { me: ADMIN, table: teamaiTable({ groupkeystate: env({ ok: true, held: true, on: true, set_at: "2026-10-06T08:00:00Z", by: "member:rosa", key: KEY, secret: KEY }) }) });
  assert.ok(!a.html.includes(KEY), "what the plane answers is never the key's text to the page's output");
  const b = await open("teamai", { me: ADMIN, table: teamaiTable({ groupkeyremove: () => ({ ok: false, reason: "NOT_AN_ADMIN", code: "NOT_AN_ADMIN" }) }) });
  const before = b.text;
  const r = await b.press("groupkeyremove");
  assert.ok(r.refused && b.refused.text.includes(said("refusal.NOT_AN_ADMIN")));
  assert.equal(b.text.replace(b.refused.text, "").replace(/\s+/g, " "), before.replace(/\s+/g, " "), "nothing else changes");
});
