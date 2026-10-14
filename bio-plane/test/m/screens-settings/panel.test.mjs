/* The AI account panel at the module's interface (R9; DEC-188 (1)): one render over an owner, drawn by `members` for the
   group's key and by `connect` for the member's own account. */
import test from "node:test";
import assert from "node:assert/strict";
import { SCREENS, acts, all, day, has, lacks, open, panelOf, rowOf, said, textOf } from "./kit.mjs";
import { ADMIN, MEMBER, membersTable, membersTableMember, connectTable, refuse, env, LIMITS, OVER } from "./fixtures.mjs";

const section = (o, key) => all(o.tree, (e) => e.tag === "section" && all(e, (h) => h.tag === "h2")[0] && textOf(all(e, (h) => h.tag === "h2")[0]) === said(key))[0];

test("R9 one render serves both: members (owner group) and connect (owner member:<me>) draw the same panel function", () => {
  const m = SCREENS.find((s) => s.id === "members"), c = SCREENS.find((s) => s.id === "connect");
  assert.equal(m.parts.aiPanel, c.parts.aiPanel);
  assert.equal(m.parts.aiPanelSend, c.parts.aiPanelSend);
});

test("R9 what the account pays for: each use (ai.use.<u>.name) on or off with its switch; exploring (ai.explore.*) at group level only", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const uses = section(a, "screen.panel.uses.heading");
  for (const u of ["ask", "draft", "run", "standing", "enquire", "read", "transcribe", "account", "suggestions"]) assert.ok(textOf(uses).includes(said(`ai.use.${u}.name`)), u);
  const sw = acts(uses).filter((b) => b.attrs["data-act"] === "accountusesset" && b.attrs["data-sw"] !== "explore");
  assert.equal(sw.length, 9);
  assert.equal(sw.find((b) => b.attrs["data-sw"] === "standing").attrs["data-to"], "on", "an off use offers on");
  assert.equal(sw.find((b) => b.attrs["data-sw"] === "ask").attrs["data-to"], "off");
  const ex = all(uses, (e) => e.attrs.id === "aig-explore")[0];
  assert.deepEqual(all(ex, (e) => e.tag === "option").map((o) => textOf(o)), ["ai.explore.no", "ai.explore.ask", "ai.explore.yes"].map((k) => said(k)));
  assert.deepEqual((await a.press("accountusesset", { data: { sw: "standing", to: "on" } })).sent[0].body, { owner: "group", switch: "standing", on: true });
  assert.deepEqual((await a.press("accountusesset", { data: { sw: "explore" }, values: { "aig-explore": "ask" } })).sent[0].body, { owner: "group", switch: "explore", on: "ask" });
  // R28: with no account there is nothing to set, and a section that holds nothing is not drawn
  const none = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own", { accountuses: (q) => env({ ok: true, owner: q.owner, held: false, uses: null, keptAway: [] }) }) });
  assert.equal(section(none, "screen.panel.uses.heading"), undefined);
});

test("R9 its limits as a table with one form: set (overall, a use within or on top, each member's use at group level) and remove", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const lim = section(a, "screen.panel.limits.heading");
  const rows = all(lim, (e) => e.tag === "tbody")[0].children.filter((c) => c.tag === "tr");
  assert.equal(rows.length, LIMITS.limits.length);
  assert.ok(textOf(rows[0]).includes(said("screen.panel.scope.overall")) && textOf(rows[0]).includes("$60.00"));
  assert.ok(textOf(rows[1]).includes(said("screen.panel.scope.per_member")));
  assert.ok(textOf(rows[2]).includes(said("ai.use.run.name")) && textOf(rows[2]).includes(said("screen.panel.ontop")) && textOf(rows[2]).includes(said("screen.panel.reached")));
  const scopes = all(all(lim, (e) => e.attrs.id === "aig-scope")[0], (e) => e.tag === "option").map((o) => o.attrs.value);
  assert.ok(scopes.includes("per_member") && scopes.includes("explore") && scopes[0] === "overall");
  assert.equal(all(lim, (e) => e.tag === "button" && e.attrs["data-act"] === "ailimitset" && e.attrs["data-remove"] === "").length, 1, "one form");
  const v = { "aig-scope": "run", "aig-amount": "2,000,000", "aig-unit": "tokens", "aig-period": "month" };
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { ...v, "aig-ontop": true } })).sent[0].body, { owner: "group", scope: "run", unit: "tokens", period: "month", amount: 2000000, inclusive: false });
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { ...v, "aig-within": true } })).sent[0].body.inclusive, true);
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { "aig-scope": "per_member", "aig-amount": "$5", "aig-unit": "usd", "aig-period": "day" } })).sent[0].body, { owner: "group", scope: "per_member", unit: "usd", period: "day", amount: 5 });
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "1", scope: "run", unit: "tokens", period: "month" } })).sent[0].body, { owner: "group", scope: "run", unit: "tokens", period: "month", amount: null });
  assert.deepEqual((await a.press("ailimitset", { data: { remove: "" }, values: { ...v, "aig-amount": "0" } })).sent, []);
  // a member's own account: no exploring, no per-member limit
  const c = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  const cs = all(all(c.tree, (e) => e.attrs.id === "aio-scope")[0], (e) => e.tag === "option").map((o) => o.attrs.value);
  assert.ok(!cs.includes("per_member") && !cs.includes("explore"));
});

test("R9 a refused limit is drawn with ai.limitfield.* naming the field (AI_LIMIT_INVALID)", async () => {
  for (const field of ["amount", "unit", "period", "scope"]) {
    const a = await open("members", { me: ADMIN, table: membersTable({ ailimitset: refuse("AI_LIMIT_INVALID", { field }) }) });
    await a.press("ailimitset", { data: { remove: "" }, values: { "aig-scope": "overall", "aig-amount": "5", "aig-unit": "usd", "aig-period": "day" } });
    assert.equal(a.refused.text, said("ai.refused.limitinvalid", { field: said(`ai.limitfield.${field}`) }));
  }
  const u = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "subscription", { ailimitset: refuse("LIMIT_UNIT_UNAVAILABLE") }) });
  await u.press("ailimitset", { data: { remove: "" }, values: { "aio-scope": "overall", "aio-amount": "5", "aio-unit": "usd", "aio-period": "day" } });
  assert.equal(u.refused.text, said("ai.refused.unitunavailable"));
});

test("R9 this month's use summed per use and in all, naming no member; the changes with who and when, the limits' and the account's together", async () => {
  const a = await open("members", { me: ADMIN, table: membersTable() });
  const use = textOf(section(a, "screen.panel.usage.heading"));
  assert.ok(use.includes("220") && use.includes("1,900,000") && use.includes("$12.60") && use.includes("296") && use.includes("5,000,000") && use.includes("$31.40"));
  assert.ok(use.includes(said("screen.panel.usage.group")));
  const ch = all(section(a, "screen.panel.changes.heading"), (e) => e.tag === "li").map((e) => textOf(e));
  assert.equal(ch.length, 5);
  assert.ok(ch[0].startsWith(said("screen.panel.change.limit.removed", { who: "lu", scope: said("ai.use.draft.name"), amount: "", unit: said("screen.panel.unit.calls"), period: said("screen.panel.period.day") })) && ch[0].endsWith(day("2026-10-08")), "newest first, with who and when");
  assert.ok(ch.some((t) => t.startsWith(said("screen.panel.change.use_set", { who: "lu", use: said("ai.use.explore.name"), value: said("ai.explore.ask") }))));
  assert.ok(ch.some((t) => t.startsWith(said("screen.panel.change.key_set", { who: "rosa" }))));
  const c = await open("connect", { me: MEMBER, table: connectTable(MEMBER, "own") });
  assert.ok(textOf(section(c, "screen.panel.changes.heading")).includes(said("screen.panel.change.key_set", { who: said("screen.connect.you") })));
});

/* R26: thirty days of bars and a meter against each limit */
const bars = (o) => all(o.tree, (e) => e.attrs.class === "mk-bars")[0];
const meters = (o) => all(o.tree, (e) => /\bmk-meter\b/.test(e.attrs.class || ""));

test("R26 thirty bars, oldest first, the newest marked today so far; the summary line; a meter for each limit, rust from four fifths", async () => {
  for (const [screen, me, table, owner] of [["members", ADMIN, membersTable(), "group"], ["connect", MEMBER, connectTable(MEMBER, "own"), "member:dev"]]) {
    const a = await open(screen, { me, table });
    assert.ok(a.p.requests.some((r) => r.op === "aiuseovertime" && r.query.owner === owner), `${screen} reads aiuseovertime over ${owner}`);
    const b = bars(a);
    assert.ok(b, `${screen} draws the bars`);
    const bar = all(b, (e) => e.tag === "i");
    assert.equal(bar.length, 30);
    assert.equal(all(b, (e) => e.tag === "i" && e.attrs.class === "now").length, 1);
    assert.equal(bar[29].attrs.class, "now", "the newest is last and marked");
    assert.ok(bar[29].attrs["data-tip"].includes(said("ai.usage.today")), "its tooltip says today, so far");
    assert.ok(bar[28].attrs["data-tip"].includes("calls") && !bar[28].attrs["data-tip"].includes(said("ai.usage.today")));
    assert.ok(bar[29].attrs["data-tip"].includes(said("ai.usage.day", { day: "", calls: 12, dollars: "$1.50" }).split("·")[1].trim().split(" ")[0]));
    assert.ok(a.text.includes(said("ai.usage.bars")), "the heading line");
    const tallest = bar.map((x) => Number(/height:(\d+)px/.exec(x.attrs.style)[1]));
    assert.equal(Math.max(...tallest), 44, "the busiest day is the tallest");
    assert.ok(a.text.includes("Last 30 days:"), "the summary");
    const m = meters(a);
    assert.equal(m.length, 2, "a meter for each limit");
    assert.ok(a.text.includes(said("ai.usage.meter", { label: said("screen.panel.scope.overall") + " · " + said("screen.panel.unit.usd") + " · " + said("screen.panel.period.month"), used: "$31.40", limit: "$60.00" })), "used against the limit");
    assert.equal(m[0].attrs["data-near"], undefined, "52% is not near");
    assert.equal(m[1].attrs["data-near"], "1", "83% is near the limit");
    assert.ok(textOf(m[1]).includes(said("ai.usage.meter.near")) && textOf(m[1]).includes("83%"));
    assert.ok(!textOf(m[0]).includes(said("ai.usage.meter.near")));
    // no member is named (K1450)
    assert.ok(!all(b, () => true).some((e) => /rosa|lu\b|dev/.test(JSON.stringify(e.attrs))), "no bar names a member");
  }
});

test("R26 a limit that is not set draws no limit, not a meter against nothing; a day with no use is a zero bar", async () => {
  const days = OVER("group").days.map((d, i) => (i === 3 ? { ...d, calls: 0, dollars: 0 } : d));
  const a = await open("members", { me: ADMIN, table: membersTable({ aiuseovertime: () => env(OVER("group", { days, periods: [{ scope: "overall", unit: "usd", period: "month", period_start: "2026-10-01", used: 31.4, limit: null }] })) }) });
  const m = meters(a);
  assert.equal(m.length, 1);
  assert.ok(textOf(m[0]).includes(said("ai.usage.nolimit")));
  assert.equal(all(m[0], (e) => e.attrs.class === "track")[0].children.length, 0, "no bar fills a meter with no limit");
  const bar = all(bars(a), (e) => e.tag === "i");
  assert.match(bar[3].attrs.style, /height:2px/, "a zero day is the least bar, not missing");
  assert.equal(bar.length, 30);
});

test("R26 control: a read answering unreadable, or refused, is drawn failed, never as zeros", async () => {
  for (const answer of [() => env(OVER("group", { unreadable: true, days: [], periods: [] })), () => env({ ok: false, reason: "UNREADABLE", code: "UNREADABLE" })]) {
    const a = await open("members", { me: ADMIN, table: membersTable({ aiuseovertime: answer }) });
    assert.equal(bars(a), undefined, "no bars");
    assert.equal(meters(a).length, 0, "no meter");
    const sec = section(a, "screen.panel.usage.heading");
    assert.ok(all(sec, (e) => e.attrs["data-state"] === "failed").length >= 1, "drawn failed");
  }
});

test("R26 control: a member who does not administer reads no group use over time", async () => {
  const a = await open("members", { me: MEMBER, table: membersTableMember() });
  assert.ok(!a.p.requests.some((r) => r.op === "aiuseovertime"));
  assert.equal(bars(a), undefined);
});

test("R26 (K3293) aiUsageBars is a part of the module: it draws the bars and a meter per limit over an aiuseovertime answer already read, whether handed the answer or the screen's read of it", async () => {
  const members = SCREENS.find((s) => s.id === "members");
  assert.equal(typeof members.parts.aiUsageBars, "function");
  assert.equal(members.parts.aiUsageBars, SCREENS.find((s) => s.id === "connect").parts.aiUsageBars, "one function for every screen that draws it");
  // a screen's functions are self-contained in the page: the answer is written into the host's source
  const hosted = (value) => ({ ...members, reads: () => ({}), render: new Function("cs", "view", `return cs.title() + view.parts.aiUsageBars(cs, view, { owner: "group", value: ${JSON.stringify(value)} });`) });
  for (const value of [OVER("group"), { state: "ok", value: OVER("group") }]) {
    const a = await open("members", { me: ADMIN, table: membersTable(), screens: SCREENS.map((s) => (s.id === "members" ? hosted(value) : s)) });
    assert.equal(all(bars(a), (e) => e.tag === "i").length, 30);
    assert.equal(meters(a).length, 2);
    assert.equal(a.p.requests.filter((r) => r.op === "aiuseovertime").length, 0, "it reads nothing itself");
  }
  // control: an answer that is unreadable, refused or failed to read is drawn failed, never as zeros
  for (const value of [OVER("group", { unreadable: true, days: [] }), { state: "failed" }, { state: "ok", value: { ok: false, reason: "UNREADABLE" } }]) {
    const a = await open("members", { me: ADMIN, table: membersTable(), screens: SCREENS.map((s) => (s.id === "members" ? hosted(value) : s)) });
    assert.equal(bars(a), undefined);
    assert.equal(meters(a).length, 0);
    assert.ok(all(a.tree, (e) => e.attrs["data-state"] === "failed").length >= 1);
  }
});
